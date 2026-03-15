import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://yourdomain.com';

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
