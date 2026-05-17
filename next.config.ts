import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  // Only generates the report when ANALYZE=true.
  // Never ships to production — the env var is only set locally.
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  experimental: {
    useCache: true,
  },
  images: {
    // Format preference order — browser gets the first one it supports.
    // AVIF is smaller but slower to encode. WebP is the reliable fallback.
    formats: ['image/avif', 'image/webp'],

    // Device sizes for srcset generation.
    // Next.js generates a separate optimised image for each breakpoint.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],

    // Image sizes for fixed-width images (not full-width).
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    minimumCacheTTL: 2592000, // 30 days
  },
  turbopack: {},
};

export default withBundleAnalyzer(nextConfig);
