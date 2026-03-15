import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { orders, orderItems, products, users } from '@/lib/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { invalidateInventory } from '@/lib/db/invalidate';
import { sendOrderConfirmation } from '@/lib/email/order-confirmation';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return new NextResponse('Server config error', { status: 500 });

  const body = await req.text();
  const sig = (await headers()).get('stripe-signature');
  if (!sig) return new NextResponse('Missing stripe-signature', { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return new NextResponse('Invalid signature', { status: 401 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'checkout.session.expired':
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
    }
  } catch (err) {
    console.error(`Stripe event handler error [${event.type}]:`, err);
    return new NextResponse('Handler error', { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.payment_status !== 'paid') return;

  const shippingDetails = session.collected_information?.shipping_details;
  const addr = shippingDetails?.address;
  const normalizedAddress = {
    line1: addr?.line1 ?? '',
    ...(addr?.line2 ? { line2: addr.line2 } : {}),
    city: addr?.city ?? '',
    state: addr?.state ?? '',
    postalCode: addr?.postal_code ?? '',
    country: addr?.country ?? '',
  };

  const totalCents = session.amount_total ?? 0;
  const taxCents = session.total_details?.amount_tax ?? 0;
  const shippingCents = session.total_details?.amount_shipping ?? 0;
  const subtotalCents = totalCents - taxCents - shippingCents;

  const stripePaymentIntentId =
    typeof session.payment_intent === 'string' ? session.payment_intent : (session.payment_intent?.id ?? null);

  const stripeCustomerIdFromSession =
    typeof session.customer === 'string' ? session.customer : (session.customer?.id ?? null);

  // ── Upsert order (webhook-first reconciliation) ───────────────────────────
  let order = await db.query.orders.findFirst({
    where: eq(orders.stripeSessionId, session.id),
    with: { items: true },
  });

  if (!order) {
    // Pending DB insert failed — reconstruct from Stripe data
    const stripeLineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product'],
      limit: 100,
    });

    const [reconciledOrder] = await db
      .insert(orders)
      .values({
        userId: session.metadata?.dbUserId || null,
        guestEmail: session.metadata?.dbUserId
          ? null
          : session.metadata?.guestEmail || session.customer_details?.email || null,
        stripeSessionId: session.id,
        stripePaymentIntentId,
        orderStatus: 'processing',
        paymentStatus: 'paid',
        subtotalCents,
        taxCents,
        shippingCents,
        discountCents: 0,
        totalCents,
        currency: session.currency ?? 'usd',
        shippingAddress: normalizedAddress,
        paidAt: new Date(),
      })
      .returning();

    if (stripeLineItems.data.length > 0) {
      await db.insert(orderItems).values(
        stripeLineItems.data.map(li => {
          const sp = li.price?.product as Stripe.Product | null;
          return {
            orderId: reconciledOrder.id,
            productId: sp?.metadata?.productId ?? null,
            productName: li.description ?? 'Unknown product',
            productSlug: sp?.metadata?.slug ?? '',
            productImageUrl: sp?.images?.[0] ?? null,
            unitPriceCents: li.price?.unit_amount ?? 0,
            quantity: li.quantity ?? 1,
            totalCents: li.amount_total ?? 0,
          };
        }),
      );
    }

    order = await db.query.orders.findFirst({
      where: eq(orders.id, reconciledOrder.id),
      with: { items: true },
    });
  } else {
    // Normal path — update pending order
    await db
      .update(orders)
      .set({
        orderStatus: 'processing',
        paymentStatus: 'paid',
        stripePaymentIntentId,
        paidAt: new Date(),
        subtotalCents,
        taxCents,
        shippingCents,
        totalCents,
        shippingAddress: normalizedAddress,
      })
      .where(eq(orders.stripeSessionId, session.id));
  }

  if (!order) return;

  // ── Decrement inventory (transaction + optimistic lock) ───────────────────
  try {
    await db.transaction(async tx => {
      for (const item of order!.items) {
        if (!item.productId) continue;
        const result = await tx
          .update(products)
          .set({ stockQuantity: sql`${products.stockQuantity} - ${item.quantity}` })
          .where(and(eq(products.id, item.productId), gte(products.stockQuantity, item.quantity)))
          .returning({ id: products.id });

        if (result.length === 0) {
          console.warn(`Stock underflow: order ${order!.id}, product ${item.productId}, requested ${item.quantity}`);
        }
      }
    });
  } catch (err) {
    console.error('Inventory decrement failed:', err);
  }

  // ── Persist Stripe Customer ID (idempotent) ───────────────────────────────
  if (stripeCustomerIdFromSession && session.metadata?.dbUserId) {
    await db
      .update(users)
      .set({ stripeCustomerId: stripeCustomerIdFromSession })
      .where(and(eq(users.id, session.metadata.dbUserId), sql`${users.stripeCustomerId} IS NULL`));
  }

  // ── Invalidate product cache ──────────────────────────────────────────────
  const slugs = order.items.map(i => i.productSlug).filter(Boolean);
  if (slugs.length > 0) await invalidateInventory(slugs);

  // ── Send confirmation email ───────────────────────────────────────────────
  const customerEmail = session.customer_details?.email ?? order.guestEmail ?? null;
  if (customerEmail) {
    await sendOrderConfirmation({
      orderId: order.id,
      customerEmail,
      customerName: shippingDetails?.name ?? undefined,
      items: order.items.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        totalCents: item.totalCents,
        imageUrl: item.productImageUrl,
      })),
      subtotalCents: order.subtotalCents,
      taxCents,
      shippingCents,
      totalCents,
      shippingAddress: normalizedAddress,
    });
  }
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  await db
    .update(orders)
    .set({ orderStatus: 'cancelled', paymentStatus: 'unpaid' })
    .where(eq(orders.stripeSessionId, session.id));
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  await db.update(orders).set({ paymentStatus: 'failed' }).where(eq(orders.stripePaymentIntentId, paymentIntent.id));
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : (charge.payment_intent?.id ?? null);
  if (!piId) return;
  const isFullRefund = charge.amount_refunded === charge.amount;
  await db
    .update(orders)
    .set({
      paymentStatus: isFullRefund ? 'refunded' : 'partially_refunded',
      orderStatus: isFullRefund ? 'refunded' : undefined,
    })
    .where(eq(orders.stripePaymentIntentId, piId));
}
