import { cacheLife, cacheTag } from 'next/cache';
import { and, asc, desc, eq, gte, ilike, inArray, lte, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { products, categories } from '@/lib/db/schema';
import type { InferSelectModel } from 'drizzle-orm';
import type { ProductSearchParams } from '@/lib/validations/search-params';

export type Product = InferSelectModel<typeof products>;

export const CACHE_TAGS = {
  products: 'products',
  featuredProducts: 'featured-products',
  categories: 'categories',
  product: (slug: string) => `product-${slug}`,
  productById: (id: string) => `product-id-${id}`,
};

// ─────────────────────────────────────────────
// Product catalog — paginated + filtered
// ─────────────────────────────────────────────

export async function getProducts(params: Partial<ProductSearchParams> = {}): Promise<{
  data: Product[];
  total: number;
  totalPages: number;
}> {
  'use cache';

  cacheLife('seconds');
  cacheTag(CACHE_TAGS.products);

  const {
    search,
    category,
    page = 1,
    perPage = 24,
    minPrice,
    maxPrice,
    sort,
    inStock,
  } = params;

  const conditions = [eq(products.isPublished, true)];

  if (search) conditions.push(ilike(products.name, `%${search}%`));
  if (minPrice !== undefined) conditions.push(gte(products.priceCents, Math.round(minPrice * 100)));
  if (maxPrice !== undefined) conditions.push(lte(products.priceCents, Math.round(maxPrice * 100)));
  if (inStock) conditions.push(gte(products.stockQuantity, 1));
  if (category) {
    const cat = await db.query.categories.findFirst({
      where: eq(categories.slug, category),
      columns: { id: true },
    });
    if (cat) conditions.push(eq(products.categoryId, cat.id));
  }

  const where = and(...conditions);

  const orderBy = (() => {
    switch (sort) {
      case 'price-asc': return asc(products.priceCents);
      case 'price-desc': return desc(products.priceCents);
      case 'name-asc': return asc(products.name);
      case 'name-desc': return desc(products.name);
      case 'oldest': return asc(products.createdAt);
      default: return desc(products.createdAt);
    }
  })();

  const [rows, [{ count }]] = await Promise.all([
    db.query.products.findMany({ where, orderBy, limit: perPage, offset: (page - 1) * perPage }),
    db.select({ count: sql<number>`cast(count(*) as int)` }).from(products).where(where),
  ]);

  const total = count ?? 0;
  return { data: rows as unknown as Product[], total, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

// ─────────────────────────────────────────────
// Featured products — homepage hero grid
// ─────────────────────────────────────────────

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  'use cache';

  cacheLife('minutes');
  cacheTag(CACHE_TAGS.featuredProducts);

  const data = await db.query.products.findMany({
    where: and(eq(products.isPublished, true), eq(products.isFeatured, true)),
    orderBy: desc(products.createdAt),
    limit,
  });

  return data as unknown as Product[];
}

// ─────────────────────────────────────────────
// Products by IDs
// ─────────────────────────────────────────────

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  'use cache';

  cacheLife('seconds');
  cacheTag(CACHE_TAGS.products);

  if (ids.length === 0) return [];

  const data = await db.query.products.findMany({
    where: inArray(products.id, ids),
  });

  return data as unknown as Product[];
}

// ─────────────────────────────────────────────
// All categories — navigation / filter sidebar
// Cache: 1 hour — changes rarely
// ─────────────────────────────────────────────

export async function getCategories() {
  'use cache';

  cacheLife({ stale: 3600, revalidate: 3600, expire: 86400 });
  cacheTag(CACHE_TAGS.categories);

  return db.query.categories.findMany({
    where: sql`${categories.parentId} IS NULL`,
    with: {
      children: {
        columns: { id: true, name: true, slug: true },
      },
    },
    orderBy: asc(categories.name),
  });
}
