import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/** Extract the real client IP from Next.js request headers */
export function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown';
}

function createRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return Redis.fromEnv();
}

function createLimiter(redis: Redis | null, requests: number, prefix: string): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, '1 m'),
    analytics: true,
    prefix,
  });
}

const redis = createRedis();

const _checkoutRateLimit = createLimiter(redis, 10, 'rl:checkout');
const _apiRateLimit = createLimiter(redis, 60, 'rl:api');
const _searchRateLimit = createLimiter(redis, 30, 'rl:search');

type LimitResult = { success: boolean; limit: number; remaining: number; reset: number };
const allow: LimitResult = { success: true, limit: 0, remaining: 0, reset: 0 };

export const checkoutRateLimit = {
  limit: (id: string): Promise<LimitResult> => _checkoutRateLimit?.limit(id) ?? Promise.resolve(allow),
};

export const apiRateLimit = {
  limit: (id: string): Promise<LimitResult> => _apiRateLimit?.limit(id) ?? Promise.resolve(allow),
};

export const searchRateLimit = {
  limit: (id: string): Promise<LimitResult> => _searchRateLimit?.limit(id) ?? Promise.resolve(allow),
};
