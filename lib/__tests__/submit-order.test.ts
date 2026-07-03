import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockProduct } from './test-utils';
import { submitOrder } from '../actions/submit-order.action';

vi.mock('@/lib/db', () => ({
  db: { transaction: vi.fn(), insert: vi.fn(), select: vi.fn() },
}));

const validInput = {
  cartId: crypto.randomUUID(),
  address: {
    fullName: 'John Doe',
    line1: '123 Main St',
    city: 'New York',
    postcode: '10001',
    country: 'US',
  },
  paymentMethod: { type: 'card' as const, last4: '4242', brand: 'visa' },
  items: [{ productId: crypto.randomUUID(), quantity: 2 }],
  totalCents: 3998,
};

describe('submitOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('DATABASE_URL', 'postgres://fake');
  });

  it('rejects invalid input', async () => {
    const result = await submitOrder({});
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
  });

  it('rejects missing required fields', async () => {
    const result = await submitOrder({ cartId: 'not-uuid' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
  });

  it('rejects invalid country code', async () => {
    const input = { ...validInput, address: { ...validInput.address, country: 'USA' } };
    const result = await submitOrder(input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
  });

  it('rejects negative totalCents', async () => {
    const input = { ...validInput, totalCents: -1 };
    const result = await submitOrder(input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('VALIDATION_ERROR');
  });

  it('rejects out of stock for missing product', async () => {
    const { db } = await import('@/lib/db');
    vi.mocked(db.transaction).mockImplementation(async cb => {
      return cb({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }),
        }),
      } as never);
    });

    const result = await submitOrder(validInput);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('OUT_OF_STOCK');
  });

  it('rejects insufficient stock', async () => {
    const product = createMockProduct({ id: validInput.items[0].productId, stockQuantity: 0 });
    const { db } = await import('@/lib/db');
    vi.mocked(db.transaction).mockImplementation(async cb => {
      return cb({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([product]) }),
        }),
      } as never);
    });

    const result = await submitOrder(validInput);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('OUT_OF_STOCK');
  });

  it('creates order successfully with product snapshots', async () => {
    const productId = validInput.items[0].productId;
    const product = createMockProduct({
      id: productId,
      name: 'Test Product',
      slug: 'test-product',
      priceCents: 1999,
      stockQuantity: 10,
      images: [{ url: 'https://example.com/img.jpg', alt: 'Test', position: 0 }],
    });
    const createdOrder = { id: crypto.randomUUID(), totalCents: 3998 };

    let itemsInserted: Record<string, unknown>[] = [];
    const { db } = await import('@/lib/db');
    vi.mocked(db.transaction).mockImplementation(async cb => {
      return cb({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([product]) }),
        }),
        insert: vi.fn(() => ({
          values: (vals: unknown) => {
            if (Array.isArray(vals)) itemsInserted = vals as Record<string, unknown>[];
            return { returning: vi.fn().mockResolvedValue([createdOrder]) };
          },
        })),
      } as never);
    });

    const result = await submitOrder(validInput);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.orderId).toBe(createdOrder.id);
      expect(result.totalCents).toBe(3998);
    }

    expect(itemsInserted).toHaveLength(1);
    expect(itemsInserted[0].productName).toBe('Test Product');
    expect(itemsInserted[0].productSlug).toBe('test-product');
    expect(itemsInserted[0].productImageUrl).toBe('https://example.com/img.jpg');
    expect(itemsInserted[0].unitPriceCents).toBe(1999);
    expect(itemsInserted[0].totalCents).toBe(3998);
  });
});
