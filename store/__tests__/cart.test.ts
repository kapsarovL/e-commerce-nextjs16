import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../cart';

const ITEM = {
  id: 'prod-1',
  slug: 'test-product',
  name: 'Test Product',
  imageUrl: null,
  priceCents: 1999,
  stockQuantity: 10,
};

beforeEach(() => {
  useCartStore.setState({ items: [] });
});

describe('addItem', () => {
  it('adds a new item with quantity 1 by default', () => {
    useCartStore.getState().addItem(ITEM);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(1);
  });

  it('adds a new item with a specified quantity', () => {
    useCartStore.getState().addItem({ ...ITEM, quantity: 3 });
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it('increments quantity when the same item is added again', () => {
    useCartStore.getState().addItem(ITEM);
    useCartStore.getState().addItem(ITEM);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it('does not exceed stockQuantity', () => {
    useCartStore.getState().addItem({ ...ITEM, quantity: 8 });
    useCartStore.getState().addItem({ ...ITEM, quantity: 5 });
    expect(useCartStore.getState().items[0].quantity).toBe(10); // capped at stockQuantity
  });

  it('caps initial quantity at stockQuantity', () => {
    useCartStore.getState().addItem({ ...ITEM, quantity: 99 });
    expect(useCartStore.getState().items[0].quantity).toBe(10);
  });
});

describe('removeItem', () => {
  it('removes the item by id', () => {
    useCartStore.getState().addItem(ITEM);
    useCartStore.getState().removeItem('prod-1');
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('does nothing when item does not exist', () => {
    useCartStore.getState().addItem(ITEM);
    useCartStore.getState().removeItem('nonexistent');
    expect(useCartStore.getState().items).toHaveLength(1);
  });
});

describe('updateQuantity', () => {
  it('updates the item quantity', () => {
    useCartStore.getState().addItem(ITEM);
    useCartStore.getState().updateQuantity('prod-1', 4);
    expect(useCartStore.getState().items[0].quantity).toBe(4);
  });

  it('removes the item when quantity is set to 0', () => {
    useCartStore.getState().addItem(ITEM);
    useCartStore.getState().updateQuantity('prod-1', 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('removes the item when quantity is negative', () => {
    useCartStore.getState().addItem(ITEM);
    useCartStore.getState().updateQuantity('prod-1', -1);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('caps quantity at stockQuantity', () => {
    useCartStore.getState().addItem(ITEM);
    useCartStore.getState().updateQuantity('prod-1', 99);
    expect(useCartStore.getState().items[0].quantity).toBe(10);
  });
});

describe('clearCart', () => {
  it('removes all items', () => {
    useCartStore.getState().addItem(ITEM);
    useCartStore.getState().addItem({ ...ITEM, id: 'prod-2', slug: 'other' });
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe('derived selectors', () => {
  it('itemCount sums all quantities', () => {
    useCartStore.getState().addItem({ ...ITEM, quantity: 2 });
    useCartStore.getState().addItem({ ...ITEM, id: 'prod-2', slug: 'b', quantity: 3 });
    expect(useCartStore.getState().itemCount()).toBe(5);
  });

  it('subtotalCents calculates total price', () => {
    useCartStore.getState().addItem({ ...ITEM, priceCents: 1000, quantity: 2 });
    expect(useCartStore.getState().subtotalCents()).toBe(2000);
  });

  it('hasItem returns true for existing item', () => {
    useCartStore.getState().addItem(ITEM);
    expect(useCartStore.getState().hasItem('prod-1')).toBe(true);
  });

  it('hasItem returns false for missing item', () => {
    expect(useCartStore.getState().hasItem('prod-999')).toBe(false);
  });

  it('getItem returns the item', () => {
    useCartStore.getState().addItem(ITEM);
    expect(useCartStore.getState().getItem('prod-1')?.name).toBe('Test Product');
  });

  it('getItem returns undefined for missing item', () => {
    expect(useCartStore.getState().getItem('prod-999')).toBeUndefined();
  });
});
