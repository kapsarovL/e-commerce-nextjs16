'use server';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { orders, orderItems, products } from '@/lib/db/schema';

const SubmitOrderSchema = z.object({
  cartId: z.string().uuid('Invalid cart ID'),
  address: z.object({
    fullName: z.string().min(1),
    line1: z.string().min(1),
    city: z.string().min(1),
    postcode: z.string().min(1),
    country: z.string().regex(/^[A-Z]{2}$/, 'Country must be 2-letter code'),
  }),
  paymentMethod: z.discriminatedUnion('type', [
    z.object({ type: z.literal('card'), last4: z.string(), brand: z.string() }),
    z.object({ type: z.literal('paypal'), email: z.string().email() }),
  ]),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
    }),
  ),
  totalCents: z.number().int().nonnegative(),
});

type SubmitResult =
  | { ok: true; orderId: string; totalCents: number }
  | { ok: false; code: 'VALIDATION_ERROR'; message: string }
  | { ok: false; code: 'PAYMENT_DECLINED' }
  | { ok: false; code: 'OUT_OF_STOCK'; productId: string }
  | { ok: false; code: 'UNKNOWN_ERROR' };

export async function submitOrder(raw: unknown): Promise<SubmitResult> {
  const parsed = SubmitOrderSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: parsed.error.issues[0].message,
    };
  }

  const { address, paymentMethod, items, totalCents } = parsed.data;
  const productIds = items.map(i => i.productId);

  try {
    const order = await db.transaction(async tx => {
      // Fetch all products in a single query for validation + snapshots
      const liveProducts = await tx.select().from(products).where(inArray(products.id, productIds));
      const productMap = new Map(liveProducts.map(p => [p.id, p]));

      // Check stock for all items
      for (const item of items) {
        const p = productMap.get(item.productId);
        if (!p) {
          throw { code: 'OUT_OF_STOCK' as const, productId: item.productId };
        }
        if (p.stockQuantity < item.quantity) {
          throw { code: 'OUT_OF_STOCK' as const, productId: item.productId };
        }
      }

      // Create order
      const newOrder = await tx
        .insert(orders)
        .values({
          shippingAddress: {
            line1: address.line1,
            city: address.city,
            state: '',
            postalCode: address.postcode,
            country: address.country,
          },
          subtotalCents: totalCents,
          totalCents,
          metadata: { paymentMethod: JSON.stringify(paymentMethod) },
        })
        .returning();

      if (!newOrder[0]) throw new Error('Failed to create order');

      // Create order items with product snapshots
      await tx.insert(orderItems).values(
        items.map(item => {
          const p = productMap.get(item.productId)!;
          return {
            orderId: newOrder[0].id,
            productId: item.productId,
            productName: p.name,
            productSlug: p.slug,
            productImageUrl: p.images?.[0]?.url ?? null,
            quantity: item.quantity,
            unitPriceCents: p.priceCents,
            totalCents: p.priceCents * item.quantity,
          };
        }),
      );

      return newOrder[0];
    });

    return { ok: true, orderId: order.id, totalCents: order.totalCents };
  } catch (err) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as unknown as { code: string }).code === 'OUT_OF_STOCK'
    ) {
      const error = err as unknown as { productId: string };
      return {
        ok: false,
        code: 'OUT_OF_STOCK',
        productId: error.productId,
      };
    }
    return { ok: false, code: 'UNKNOWN_ERROR' };
  }
}
