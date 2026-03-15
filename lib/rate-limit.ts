import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Single Redis instance shared across all limiters
const redis = Redis.fromEnv();

/**
 * Checkout endpoint — 10 attempts per minute per IP.
 * Prevents session flooding and inventory probing.
 */
export const checkoutRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
  prefix: 'rl:checkout',
});

/**
 * General API routes — 60 requests per minute per IP.
 */
export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  analytics: true,
  prefix: 'rl:api',
});

/**
 * Search endpoint — 30 per minute (more lenient, but still guarded).
 */
export const searchRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
  analytics: true,
  prefix: 'rl:search',
});

/** Extract the real client IP from Next.js request headers */
export function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown';
}
