'use server';

import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/db/queries';

/** Invalidate entire product catalog */
export async function invalidateProducts(): Promise<void> {
  revalidateTag(CACHE_TAGS.products, 'default');
  revalidateTag(CACHE_TAGS.featuredProducts, 'default');
}

/** Invalidate a single product's cached pages */
export async function invalidateProduct(slug: string, id?: string): Promise<void> {
  revalidateTag(CACHE_TAGS.product(slug), 'default');
  if (id) revalidateTag(CACHE_TAGS.productById(id), 'default');
  revalidateTag(CACHE_TAGS.products, 'default');
}

/** Invalidate after inventory change (e.g. order fulfilled via webhook) */
export async function invalidateInventory(productSlugs: string[]): Promise<void> {
  revalidateTag(CACHE_TAGS.products, 'default');
  for (const slug of productSlugs) {
    revalidateTag(CACHE_TAGS.product(slug), 'default');
  }
}

/** Invalidate all category caches */
export async function invalidateCategories(): Promise<void> {
  revalidateTag(CACHE_TAGS.categories, 'default');
}
