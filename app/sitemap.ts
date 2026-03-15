import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://yourdomain.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: appUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${appUrl}/products`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
  ];

  try {
    const [publishedProducts, allCategories] = await Promise.all([
      db.query.products.findMany({
        where: eq(products.isPublished, true),
        columns: { slug: true, updatedAt: true },
      }),
      db.query.categories.findMany({ columns: { slug: true } }),
    ]);

    const productRoutes: MetadataRoute.Sitemap = publishedProducts.map(product => ({
      url: `${appUrl}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = allCategories.map(cat => ({
      url: `${appUrl}/products?category=${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
