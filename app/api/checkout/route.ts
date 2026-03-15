import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { products, orders, orderItems, users } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { isOutOfStock } from '@/lib/utils';
import { checkoutRateLimit, getClientIp } from '@/lib/rate-limit';

const checkoutItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

const checkoutRequestSchema = z.object({
  items: z.array(checkoutItemSchema).min(1).max(50),
  guestEmail: z.string().email().optional(),
});

export async function POST(req: Request) {
  // ── Rate limit ────────────────────────────────────────────────────────────
  const ip = getClientIp(req);
  const { success: allowed, limit, remaining, reset } = await checkoutRateLimit.limit(ip);
  if (!allowed) {
    return new NextResponse('Too many requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(remaining),
        'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
      },
    });
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', issues: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { items: cartItems, guestEmail } = parsed.data;

  // ── Auth ──────────────────────────────────────────────────────────────────
  const { userId: clerkId } = await auth();
  let dbUserId: string | null = null;
  let stripeCustomerId: string | null = null;
  let customerEmail: string | null = guestEmail ?? null;

  if (clerkId) {
    const clerkUser = await currentUser();
    customerEmail = clerkUser?.emailAddresses.find(e => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ?? null;

    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
      columns: { id: true, stripeCustomerId: true },
    });
    if (dbUser) {
      dbUserId = dbUser.id;
      stripeCustomerId = dbUser.stripeCustomerId ?? null;
    }
  }

  if (!customerEmail) {
    return NextResponse.json({ error: 'Email required for checkout.' }, { status: 400 });
  }

  // ── Live product validation ───────────────────────────────────────────────
  const liveProducts = await db.query.products.findMany({
    where: inArray(
      products.id,
      cartItems.map(i => i.productId),
    ),
  });
  const productMap = new Map(liveProducts.map(p => [p.id, p]));

  const errors: string[] = [];
  for (const item of cartItems) {
    const p = productMap.get(item.productId);
    if (!p) {
      errors.push(`Product ${item.productId} not found`);
      continue;
    }
    if (!p.isPublished) {
      errors.push(`"${p.name}" is unavailable`);
      continue;
    }
    if (isOutOfStock(p.stockQuantity)) {
      errors.push(`"${p.name}" is out of stock`);
      continue;
    }
    if (item.quantity > p.stockQuantity) {
      errors.push(`Only ${p.stockQuantity} unit(s) of "${p.name}" available`);
    }
  }
  if (errors.length > 0) {
    return NextResponse.json({ error: 'Cart validation failed', details: errors }, { status: 409 });
  }

  // ── Stripe Customer ID — create once, reuse forever ───────────────────────
  if (clerkId && dbUserId && !stripeCustomerId) {
    try {
      const customer = await stripe.customers.create({
        email: customerEmail,
        metadata: { clerkId, dbUserId },
      });
      stripeCustomerId = customer.id;
      await db.update(users).set({ stripeCustomerId: customer.id }).where(eq(users.id, dbUserId));
    } catch (err) {
      console.error('Failed to create Stripe customer:', err);
    }
  }

  // ── Build Stripe session ──────────────────────────────────────────────────
  const lineItems = cartItems.map(item => {
    const p = productMap.get(item.productId)!;
    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: p.name,
          images: p.images?.[0]?.url ? [p.images[0].url] : [],
          metadata: { productId: p.id, slug: p.slug },
        },
        unit_amount: p.priceCents,
      },
      quantity: item.quantity,
    };
  });

  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>;
  try {
    // Build shipping options only if env vars are set
    const shippingOptions = [process.env.STRIPE_SHIPPING_RATE_STANDARD, process.env.STRIPE_SHIPPING_RATE_EXPRESS]
      .filter(Boolean)
      .map(rate => ({ shipping_rate: rate as string }));

    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      ...(stripeCustomerId ? { customer: stripeCustomerId } : { customer_email: customerEmail }),
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        dbUserId: dbUserId ?? '',
        guestEmail: clerkId ? '' : (customerEmail ?? ''),
        itemCount: String(cartItems.length),
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'MK'],
      },
      automatic_tax: { enabled: true },
      ...(shippingOptions.length > 0 && { shipping_options: shippingOptions }),
      payment_method_options: {
        card: { setup_future_usage: stripeCustomerId ? 'on_session' : undefined },
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });
  } catch (err) {
    console.error('Stripe session creation failed:', err);
    return NextResponse.json({ error: 'Payment provider error' }, { status: 502 });
  }

  // ── Persist pending order ─────────────────────────────────────────────────
  try {
    const subtotalCents = cartItems.reduce(
      (sum, item) => sum + productMap.get(item.productId)!.priceCents * item.quantity,
      0,
    );
    const [newOrder] = await db
      .insert(orders)
      .values({
        userId: dbUserId,
        guestEmail: clerkId ? null : customerEmail,
        stripeSessionId: session.id,
        orderStatus: 'pending',
        paymentStatus: 'unpaid',
        subtotalCents,
        taxCents: 0,
        shippingCents: 0,
        discountCents: 0,
        totalCents: subtotalCents,
        currency: 'usd',
        shippingAddress: { line1: '', city: '', state: '', postalCode: '', country: '' },
      })
      .returning({ id: orders.id });

    await db.insert(orderItems).values(
      cartItems.map(item => {
        const p = productMap.get(item.productId)!;
        return {
          orderId: newOrder.id,
          productId: p.id,
          productName: p.name,
          productSlug: p.slug,
          productImageUrl: p.images?.[0]?.url ?? null,
          unitPriceCents: p.priceCents,
          quantity: item.quantity,
          totalCents: p.priceCents * item.quantity,
        };
      }),
    );
  } catch (err) {
    console.error('Failed to persist pending order:', err);
  }

  return NextResponse.json({ url: session.url });
}
