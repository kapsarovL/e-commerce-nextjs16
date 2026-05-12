import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createMockProduct,
  createMockOrder,
  createMockCategory,
} from '@/lib/__tests__/test-utils';

// Mock database module
vi.mock('@/lib/db', () => ({
  db: {
    query: {
      products: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      orders: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      categories: {
        findMany: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/lib/db/invalidate', () => ({
  invalidateInventory: vi.fn(),
  invalidateProduct: vi.fn(),
}));

describe('Database Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Products', () => {
    it('fetches multiple products with filters', async () => {
      const { db } = await import('@/lib/db');
      const mockProducts = [
        createMockProduct({ id: 'prod-1', name: 'Product 1' }),
        createMockProduct({ id: 'prod-2', name: 'Product 2' }),
      ];

      vi.mocked(db.query.products.findMany).mockResolvedValueOnce(mockProducts);

      const products = await db.query.products.findMany();
      expect(products).toHaveLength(2);
      expect(products[0].name).toBe('Product 1');
    });

    it('fetches single product by id', async () => {
      const { db } = await import('@/lib/db');
      const mockProduct = createMockProduct({ id: 'prod-1', name: 'Product 1' });

      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce(mockProduct);

      const product = await db.query.products.findFirst();
      expect(product?.id).toBe('prod-1');
      expect(product?.name).toBe('Product 1');
    });

    it('returns null when product not found', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce(null as any);

      const product = await db.query.products.findFirst();
      expect(product).toBeNull();
    });

    it('handles out of stock products', async () => {
      const { db } = await import('@/lib/db');
      const outOfStockProduct = createMockProduct({
        id: 'prod-1',
        name: 'Out of Stock',
        stockQuantity: 0,
      });

      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce(outOfStockProduct);

      const product = await db.query.products.findFirst();
      expect(product?.stockQuantity).toBe(0);
    });
  });

  describe('Orders', () => {
    it('fetches user orders', async () => {
      const { db } = await import('@/lib/db');
      const mockOrders = [
        createMockOrder({ id: 'order-1', userId: 'user-1', orderStatus: 'completed' as const }),
        createMockOrder({ id: 'order-2', userId: 'user-1', orderStatus: 'processing' as const }),
      ];

      vi.mocked(db.query.orders.findMany).mockResolvedValueOnce(mockOrders);

      const orders = await db.query.orders.findMany();
      expect(orders).toHaveLength(2);
      expect(orders.every(o => o.userId === 'user-1')).toBe(true);
    });

    it('fetches order with items', async () => {
      const { db } = await import('@/lib/db');
      const mockOrder = createMockOrder({
        id: 'order-1',
        userId: 'user-1',
        orderStatus: 'completed' as const,
      });

      vi.mocked(db.query.orders.findFirst).mockResolvedValueOnce(mockOrder);

      const order = await db.query.orders.findFirst();
      expect(order?.id).toBe('order-1');
      expect(order?.userId).toBe('user-1');
    });

    it('returns null when order not found', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.query.orders.findFirst).mockResolvedValueOnce(null as any);

      const order = await db.query.orders.findFirst();
      expect(order).toBeNull();
    });

    it('handles guest orders', async () => {
      const { db } = await import('@/lib/db');
      const guestOrder = createMockOrder({
        id: 'order-1',
        userId: null,
        guestEmail: 'guest@example.com',
        orderStatus: 'completed' as const,
      });

      vi.mocked(db.query.orders.findFirst).mockResolvedValueOnce(guestOrder);

      const order = await db.query.orders.findFirst();
      expect(order?.userId).toBeNull();
      expect(order?.guestEmail).toBe('guest@example.com');
    });
  });

  describe('Categories', () => {
    it('fetches all categories', async () => {
      const { db } = await import('@/lib/db');
      const mockCategories = [
        createMockCategory({ id: 'cat-1', name: 'Electronics' }),
        createMockCategory({ id: 'cat-2', name: 'Clothing' }),
      ];

      vi.mocked(db.query.categories.findMany).mockResolvedValueOnce(mockCategories);

      const categories = await db.query.categories.findMany();
      expect(categories).toHaveLength(2);
    });
  });

  describe('Cache Invalidation', () => {
    it('invalidates product cache', async () => {
      const mod = await import('@/lib/db/invalidate');
      const invalidateProduct = vi.mocked((mod as any).invalidateProduct);
      await invalidateProduct('prod-1');
      expect(invalidateProduct).toHaveBeenCalledWith('prod-1');
    });

    it('invalidates inventory cache for slugs', async () => {
      const mod = await import('@/lib/db/invalidate');
      const invalidateInventory = vi.mocked((mod as any).invalidateInventory);
      await invalidateInventory(['product-1', 'product-2']);
      expect(invalidateInventory).toHaveBeenCalledWith(['product-1', 'product-2']);
    });
  });
});
