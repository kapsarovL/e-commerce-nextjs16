import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextFetchEvent, NextRequest } from 'next/server';

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

function buildCsp(nonce: string): string {
  const scriptSrc = [
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    'https:',
    // Next.js Turbopack uses eval() for source maps in development
    ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : []),
  ].join(' ');

  return [
    "default-src 'self'",
    // nonce authorizes first-party scripts; strict-dynamic propagates that
    // trust to scripts they load (e.g. GTM loading its own tags).
    // https fallback keeps older browsers from blocking everything.
    `script-src ${scriptSrc} https://*.clerk.accounts.dev`,
    // Next.js and Tailwind inject inline styles; unsafe-inline is safe for
    // styles because CSS cannot exfiltrate data the way scripts can.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.unsplash.com https://img.clerk.com",
    "font-src 'self'",
    "connect-src 'self' https://*.clerk.accounts.dev https://clerk.com https://clerk-telemetry.com https://vitals.vercel-insights.com https://www.google-analytics.com https://www.googletagmanager.com",
    "frame-src 'self' https://*.clerk.accounts.dev",
    // Clerk uses blob: web workers internally
    'worker-src blob:',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'report-uri /api/csp-report',
  ].join('; ');
}

function setCsp(response: NextResponse): NextResponse {
  response.headers.set('Content-Security-Policy-Report-Only', buildCsp(generateNonce()));
  return response;
}

const clerkHandler = clerkMiddleware((_auth, req: NextRequest) => {
  return setCsp(NextResponse.next());
});

export function proxy(request: NextRequest, event: NextFetchEvent): ReturnType<typeof clerkHandler> {
  // Home page gets CSP but no Clerk auth — avoids loading Clerk JS on initial visit
  if (request.nextUrl.pathname === '/') {
    return setCsp(NextResponse.next());
  }
  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
