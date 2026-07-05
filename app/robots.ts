import { headers } from 'next/headers';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const host = headersList.get('host') || 'storefront-ec-app.vercel.app';
  const protocol = headersList.get('x-forwarded-proto') || 'https';
  const appUrl = `${protocol}://${host}`;

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/products/'],
        disallow: ['/api/', '/admin/', '/account/', '/checkout/', '/cart'],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
