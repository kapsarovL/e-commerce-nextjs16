// next.config.ts — audit scripts you don't control with CSP headers
// This surfaces any script that loads synchronously from a third party.
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    useCache: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
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
              "report-uri /api/csp-report",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
