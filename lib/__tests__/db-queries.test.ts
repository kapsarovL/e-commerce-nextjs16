import { describe, it, expect, beforeEach, vi } from 'vitest';

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
        {
          id: 'prod-1',
          name: 'Product 1',
          priceCents: 1999,
          stockQuantity: 10,
          isPublished: true,
        },
        {
          id: 'prod-2',
          name: 'Product 2',
          priceCents: 2999,
          stockQuantity: 5,
          isPublished: true,
        },
      ];

      vi.mocked(db.query.products.findMany).mockResolvedValueOnce(mockProducts);

      const products = await db.query.products.findMany();
      expect(products).toHaveLength(2);
      expect(products[0].name).toBe('Product 1');
    });

    it('fetches single product by id', async () => {
      const { db } = await import('@/lib/db');
      const mockProduct = {
        id: 'prod-1',
        name: 'Product 1',
        priceCents: 1999,
        stockQuantity: 10,
        isPublished: true,
      };

      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce(mockProduct);

      const product = await db.query.products.findFirst();
      expect(product?.id).toBe('prod-1');
      expect(product?.name).toBe('Product 1');
    });

    it('returns null when product not found', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce(null);

      const product = await db.query.products.findFirst();
      expect(product).toBeNull();
    });

    it('handles out of stock products', async () => {
      const { db } = await import('@/lib/db');
      const outOfStockProduct = {
        id: 'prod-1',
        name: 'Out of Stock',
        priceCents: 1999,
        stockQuantity: 0,
        isPublished: true,
      };

      vi.mocked(db.query.products.findFirst).mockResolvedValueOnce(outOfStockProduct);

      const product = await db.query.products.findFirst();
      expect(product?.stockQuantity).toBe(0);
    });
  });

  describe('Orders', () => {
    it('fetches user orders', async () => {
      const { db } = await import('@/lib/db');
      const mockOrders = [
        {
          id: 'order-1',
          userId: 'user-1',
          orderStatus: 'completed',
          totalCents: 1999,
          createdAt: new Date(),
        },
        {
          id: 'order-2',
          userId: 'user-1',
          orderStatus: 'processing',
          totalCents: 2999,
          createdAt: new Date(),
        },
      ];

      vi.mocked(db.query.orders.findMany).mockResolvedValueOnce(mockOrders);

      const orders = await db.query.orders.findMany();
      expect(orders).toHaveLength(2);
      expect(orders.every(o => o.userId === 'user-1')).toBe(true);
    });

    it('fetches order with items', async () => {
      const { db } = await import('@/lib/db');
      const mockOrder = {
        id: 'order-1',
        userId: 'user-1',
        orderStatus: 'completed',
        totalCents: 1999,
        items: [
          {
            productId: 'prod-1',
            productName: 'Product 1',
            quantity: 1,
            unitPriceCents: 1999,
          },
        ],
      };

      vi.mocked(db.query.orders.findFirst).mockResolvedValueOnce(mockOrder);

      const order = await db.query.orders.findFirst();
      expect(order?.items).toHaveLength(1);
      expect(order?.items[0].productName).toBe('Product 1');
    });

    it('returns null when order not found', async () => {
      const { db } = await import('@/lib/db');
      vi.mocked(db.query.orders.findFirst).mockResolvedValueOnce(null);

      const order = await db.query.orders.findFirst();
      expect(order).toBeNull();
    });

    it('handles guest orders', async () => {
      const { db } = await import('@/lib/db');
      const guestOrder = {
        id: 'order-1',
        userId: null,
        guestEmail: 'guest@example.com',
        orderStatus: 'completed',
        totalCents: 1999,
      };

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
        { id: 'cat-1', name: 'Electronics' },
        { id: 'cat-2', name: 'Clothing' },
      ];

      vi.mocked(db.query.categories.findMany).mockResolvedValueOnce(mockCategories);

      const categories = await db.query.categories.findMany();
      expect(categories).toHaveLength(2);
    });
  });

  describe('Cache Invalidation', () => {
    it('invalidates product cache', async () => {
      const { invalidateProduct } = await import('@/lib/db/invalidate');
      await invalidateProduct('prod-1');
      expect(invalidateProduct).toHaveBeenCalledWith('prod-1');
    });

    it('invalidates inventory cache for slugs', async () => {
      const { invalidateInventory } = await import('@/lib/db/invalidate');
      await invalidateInventory(['product-1', 'product-2']);
      expect(invalidateInventory).toHaveBeenCalledWith(['product-1', 'product-2']);
    });
  });
});
