import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://yourdomain.com';

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${appUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
  ];

  // Dynamic product routes
  const publishedProducts = await db.query.products.findMany({
    where: eq(products.isPublished, true),
    columns: { slug: true, updatedAt: true },
  });

  const productRoutes: MetadataRoute.Sitemap = publishedProducts.map(product => ({
    url: `${appUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Category routes
  const allCategories = await db.query.categories.findMany({
    columns: { slug: true },
  });

  const categoryRoutes: MetadataRoute.Sitemap = allCategories.map(cat => ({
    url: `${appUrl}/products?category=${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
