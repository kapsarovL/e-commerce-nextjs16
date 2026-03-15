'use server';

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { products, orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

type ActionResult = { success: boolean; errors?: Record<string, string[]>; productId?: string };

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect('/sign-in');
  const role = (sessionClaims?.publicMetadata as { role?: string } | undefined)?.role;
  if (role !== 'admin') redirect('/');
}

const productSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  tags: z.string().optional(),
  priceCents: z.coerce.number().int().positive(),
  comparePriceCents: z.coerce.number().int().min(0).nullable().optional(),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  isPublished: z.coerce.boolean().default(false),
  isFeatured: z.coerce.boolean().default(false),
});

function parseFormData(fd: FormData) {
  return {
    name: fd.get('name'),
    slug: fd.get('slug'),
    description: fd.get('description') || undefined,
    categoryId: fd.get('categoryId') || null,
    tags: fd.get('tags') || undefined,
    priceCents: fd.get('priceCents'),
    comparePriceCents: fd.get('comparePriceCents') || null,
    stockQuantity: fd.get('stockQuantity'),
    lowStockThreshold: fd.get('lowStockThreshold'),
    isPublished: fd.get('isPublished') === 'on',
    isFeatured: fd.get('isFeatured') === 'on',
  };
}

export async function createProduct(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = productSchema.safeParse(parseFormData(fd));
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { tags, ...data } = parsed.data;
  const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  try {
    const [product] = await db
      .insert(products)
      .values({ ...data, tags: tagsArray })
      .returning({ id: products.id });

    revalidatePath('/admin/products');
    return { success: true, productId: product.id };
  } catch {
    return { success: false, errors: { _form: ['Failed to create product. Slug may already be taken.'] } };
  }
}

export async function updateProduct(id: string, _prev: ActionResult, fd: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = productSchema.safeParse(parseFormData(fd));
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { tags, ...data } = parsed.data;
  const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  try {
    await db.update(products).set({ ...data, tags: tagsArray }).where(eq(products.id, id));
    revalidatePath('/admin/products');
    revalidatePath(`/products/${data.slug}`);
    return { success: true, productId: id };
  } catch {
    return { success: false, errors: { _form: ['Failed to update product.'] } };
  }
}

export async function toggleProductPublished(productId: string, currentValue: boolean): Promise<void> {
  await requireAdmin();
  await db.update(products).set({ isPublished: !currentValue }).where(eq(products.id, productId));
  revalidatePath('/admin/products');
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  await requireAdmin();
  await db.update(orders).set({ orderStatus: status as typeof orders.$inferInsert.orderStatus }).where(eq(orders.id, orderId));
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
}
