import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockProduct } from '@/lib/__tests__/test-utils';

const mockFindFirst = vi.fn();
const mockFindMany = vi.fn();
const mockAuth = vi.fn();
const mockCurrentUser = vi.fn();
const mockCreateCustomer = vi.fn();
const mockCreateSession = vi.fn();
let mockInsertChain: any;

vi.mock('@/lib/db', () => ({
  db: {
    query: { users: { findFirst: mockFindFirst }, products: { findMany: mockFindMany } },
    insert: () => mockInsertChain,
    update: () => ({ set: vi.fn().mockReturnValue({ where: vi.fn() }) }),
  },
}));

vi.mock('@/lib/stripe', () => ({
  getStripe: () => ({
    customers: { create: mockCreateCustomer },
    checkout: { sessions: { create: mockCreateSession } },
  }),
}));

vi.mock('@clerk/nextjs/server', () => ({
  auth: mockAuth,
  currentUser: mockCurrentUser,
}));

const product = createMockProduct({
  id: crypto.randomUUID(),
  name: 'Test Product',
  slug: 'test-product',
  priceCents: 1999,
  stockQuantity: 10,
  images: [{ url: 'https://example.com/img.jpg', alt: 'Test', position: 0 }],
  isPublished: true,
});

async function post(body: unknown, headers?: Record<string, string>) {
  const { POST } = await import('../route');
  const req = new Request('https://example.com/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return POST(req);
}

describe('POST /api/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://example.com');

    mockFindMany.mockResolvedValue([product]);
    mockFindFirst.mockResolvedValue(null);
    mockAuth.mockResolvedValue({
      userId: null,
      sessionId: null,
      actor: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      has: vi.fn(),
      getToken: vi.fn(),
      redirectToSignIn: vi.fn(),
    });
    mockCreateSession.mockResolvedValue({ id: 'cs_test', url: 'https://checkout.stripe.com/session_test' });
    mockCreateCustomer.mockResolvedValue({ id: 'cus_test' });
    mockInsertChain = {
      values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 'order-1' }]) }),
    };
  });

  it('returns 200 when rate limiter has no Redis', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    const res = await post({ items: [{ productId: product.id, quantity: 1 }], guestEmail: 'test@example.com' });
    expect(res.status).toBe(200);
  });

  it('returns 400 for invalid JSON body', async () => {
    const { POST } = await import('../route');
    const req = new Request('https://example.com/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid JSON body');
  });

  it('returns 422 for invalid schema', async () => {
    const res = await post({ items: 'not-array' });
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error).toBe('Invalid request');
  });

  it('returns 400 when guest email missing', async () => {
    const res = await post({ items: [{ productId: product.id, quantity: 1 }] });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Email required for checkout.');
  });

  it('returns 409 for unpublished product', async () => {
    mockFindMany.mockResolvedValue([createMockProduct({ ...product, isPublished: false })]);
    const res = await post({ items: [{ productId: product.id, quantity: 1 }], guestEmail: 't@t.com' });
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.details[0]).toContain('unavailable');
  });

  it('returns 409 for out of stock product', async () => {
    mockFindMany.mockResolvedValue([createMockProduct({ ...product, stockQuantity: 0 })]);
    const res = await post({ items: [{ productId: product.id, quantity: 1 }], guestEmail: 't@t.com' });
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.details[0]).toContain('out of stock');
  });

  it('returns 409 when quantity exceeds stock', async () => {
    mockFindMany.mockResolvedValue([createMockProduct({ ...product, stockQuantity: 1 })]);
    const res = await post({ items: [{ productId: product.id, quantity: 5 }], guestEmail: 't@t.com' });
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.details[0]).toContain('Only 1 unit(s)');
  });

  it('returns 502 when Stripe fails', async () => {
    mockCreateSession.mockRejectedValue(new Error('Stripe error'));
    const res = await post({ items: [{ productId: product.id, quantity: 1 }], guestEmail: 't@t.com' });
    expect(res.status).toBe(502);
  });

  it('returns session URL on success', async () => {
    const res = await post({ items: [{ productId: product.id, quantity: 2 }], guestEmail: 'guest@example.com' });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.url).toBe('https://checkout.stripe.com/session_test');
  });

  it('inserts order items with correct product snapshots', async () => {
    let itemsInserted: any[] = [];
    const valuesFn = vi.fn((vals: any) => {
      if (Array.isArray(vals)) itemsInserted = vals;
      return { returning: vi.fn().mockResolvedValue([{ id: 'order-1' }]) };
    });
    mockInsertChain.values = valuesFn;

    await post({ items: [{ productId: product.id, quantity: 2 }], guestEmail: 'guest@example.com' });

    expect(itemsInserted).toHaveLength(1);
    expect(itemsInserted[0].productName).toBe('Test Product');
    expect(itemsInserted[0].productSlug).toBe('test-product');
    expect(itemsInserted[0].unitPriceCents).toBe(1999);
    expect(itemsInserted[0].totalCents).toBe(3998);
  });
});
