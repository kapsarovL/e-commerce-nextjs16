import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            // Report-only first — don't block, just log violations to console.
            // Upgrade to Content-Security-Policy once you've audited everything.
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
              'report-uri /api/csp-report',
            ].join('; '),
          },
        ],
      },
      // ── Hashed JS/CSS chunks ────────────────────────────────────────────────
      // immutable: browser never re-requests these. Hash in filename = new URL
      // on every deploy, so stale cache is never an issue.
      // max-age=31536000: 1 year. Browsers won't cache longer than this anyway.
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // ── Public assets (images, fonts, icons) ────────────────────────────────
      // 30 days is a safe default. If you hash your asset filenames (recommended),
      // you can use immutable here too.
      {
        source: '/public/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      // ── API routes ──────────────────────────────────────────────────────────
      // No caching by default — each route sets its own headers.
      // This prevents the CDN from accidentally caching user-specific data.
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
    ];
  },
  experimental: {
    useCache: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    minimumCacheTTL: 2592000,
  },
  turbopack: {},
};

export default withBundleAnalyzer(nextConfig);
