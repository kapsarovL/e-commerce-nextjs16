import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getClientIp, checkoutRateLimit, apiRateLimit, searchRateLimit } from '../rate-limit';

describe('getClientIp', () => {
  it('extracts IP from x-forwarded-for', () => {
    const req = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '203.0.113.42, 10.0.0.1' },
    });
    expect(getClientIp(req)).toBe('203.0.113.42');
  });

  it('falls back to x-real-ip when x-forwarded-for is missing', () => {
    const req = new Request('https://example.com', {
      headers: { 'x-real-ip': '198.51.100.7' },
    });
    expect(getClientIp(req)).toBe('198.51.100.7');
  });

  it('returns empty string when no IP headers exist', () => {
    const req = new Request('https://example.com');
    expect(getClientIp(req)).toBe('');
  });

  it('trims whitespace from IP', () => {
    const req = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '  10.0.0.1  ' },
    });
    expect(getClientIp(req)).toBe('10.0.0.1');
  });
});

describe('checkoutRateLimit.limit', () => {
  beforeEach(() => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
  });

  it('returns pass when Redis is not configured', async () => {
    const result = await checkoutRateLimit.limit('some-ip');
    expect(result.success).toBe(true);
  });

  it('returns pass when id is empty', async () => {
    const result = await checkoutRateLimit.limit('');
    expect(result.success).toBe(true);
  });
});

describe('apiRateLimit.limit', () => {
  it('returns pass when id is empty', async () => {
    const result = await apiRateLimit.limit('');
    expect(result.success).toBe(true);
  });
});

describe('searchRateLimit.limit', () => {
  it('returns pass when id is empty', async () => {
    const result = await searchRateLimit.limit('');
    expect(result.success).toBe(true);
  });
});
