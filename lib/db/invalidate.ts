import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Invalidates cached data for the given product slugs after inventory changes
 * (e.g. after a successful order decrements stock).
 */
export async function invalidateInventory(slugs: string[]): Promise<void> {
  for (const slug of slugs) {
    revalidateTag(`product-${slug}`, 'default');
    revalidatePath(`/products/${slug}`);
  }
  revalidatePath('/products');
}
