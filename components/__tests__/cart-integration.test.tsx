import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCartStore } from '@/store/cart';
import { createMockCartItem } from '@/lib/__tests__/test-utils';

describe('Cart Store Integration', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  describe('Adding items', () => {
    it('adds a single item to empty cart', () => {
      const item = createMockCartItem();
      act(() => {
        useCartStore.getState().addItem(item);
      });

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe(item.id);
      expect(items[0].quantity).toBe(1);
    });

    it('increments quantity when adding duplicate item', () => {
      const item = createMockCartItem();
      act(() => {
        useCartStore.getState().addItem(item);
        useCartStore.getState().addItem(item);
      });

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(2);
    });

    it('adds multiple different items', () => {
      const item1 = createMockCartItem({ id: 'item-1' });
      const item2 = createMockCartItem({ id: 'item-2' });

      act(() => {
        useCartStore.getState().addItem(item1);
        useCartStore.getState().addItem(item2);
      });

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(2);
    });

    it('respects stock quantity cap', () => {
      const item = createMockCartItem({ stockQuantity: 5 });
      act(() => {
        useCartStore.getState().addItem({ ...item, quantity: 10 });
      });

      const items = useCartStore.getState().items;
      expect(items[0].quantity).toBe(5); // capped at stockQuantity
    });

    it('increments without exceeding stock limit', () => {
      const item = createMockCartItem({ stockQuantity: 5 });
      act(() => {
        useCartStore.getState().addItem({ ...item, quantity: 3 });
        useCartStore.getState().addItem({ ...item, quantity: 4 });
      });

      const items = useCartStore.getState().items;
      expect(items[0].quantity).toBe(5); // 3+4 capped at 5
    });
  });

  describe('Removing items', () => {
    it('removes item by id', () => {
      const item = createMockCartItem({ id: 'prod-1' });
      act(() => {
        useCartStore.getState().addItem(item);
        useCartStore.getState().removeItem('prod-1');
      });

      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('does nothing when removing non-existent item', () => {
      const item = createMockCartItem({ id: 'prod-1' });
      act(() => {
        useCartStore.getState().addItem(item);
        useCartStore.getState().removeItem('nonexistent');
      });

      expect(useCartStore.getState().items).toHaveLength(1);
    });

    it('removes only the specified item from cart with multiple items', () => {
      const item1 = createMockCartItem({ id: 'prod-1' });
      const item2 = createMockCartItem({ id: 'prod-2' });

      act(() => {
        useCartStore.getState().addItem(item1);
        useCartStore.getState().addItem(item2);
        useCartStore.getState().removeItem('prod-1');
      });

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe('prod-2');
    });
  });

  describe('Updating quantity', () => {
    it('updates item quantity', () => {
      const item = createMockCartItem({ id: 'prod-1' });
      act(() => {
        useCartStore.getState().addItem(item);
        useCartStore.getState().updateQuantity('prod-1', 5);
      });

      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it('removes item when quantity set to 0', () => {
      const item = createMockCartItem({ id: 'prod-1' });
      act(() => {
        useCartStore.getState().addItem(item);
        useCartStore.getState().updateQuantity('prod-1', 0);
      });

      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('removes item when quantity set to negative', () => {
      const item = createMockCartItem({ id: 'prod-1' });
      act(() => {
        useCartStore.getState().addItem(item);
        useCartStore.getState().updateQuantity('prod-1', -1);
      });

      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('caps quantity at stock limit', () => {
      const item = createMockCartItem({ id: 'prod-1', stockQuantity: 5 });
      act(() => {
        useCartStore.getState().addItem(item);
        useCartStore.getState().updateQuantity('prod-1', 99);
      });

      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it('ignores update for non-existent item', () => {
      const item = createMockCartItem({ id: 'prod-1' });
      act(() => {
        useCartStore.getState().addItem(item);
        useCartStore.getState().updateQuantity('nonexistent', 5);
      });

      expect(useCartStore.getState().items[0].quantity).toBe(1);
    });
  });

  describe('Clearing cart', () => {
    it('empties the cart', () => {
      const item1 = createMockCartItem({ id: 'prod-1' });
      const item2 = createMockCartItem({ id: 'prod-2' });

      act(() => {
        useCartStore.getState().addItem(item1);
        useCartStore.getState().addItem(item2);
        useCartStore.getState().clearCart();
      });

      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe('Derived selectors', () => {
    it('calculates correct item count', () => {
      const item1 = createMockCartItem({ id: 'prod-1' });
      const item2 = createMockCartItem({ id: 'prod-2' });

      act(() => {
        useCartStore.getState().addItem({ ...item1, quantity: 2 });
        useCartStore.getState().addItem({ ...item2, quantity: 3 });
      });

      const count = useCartStore.getState().itemCount();
      expect(count).toBe(5);
    });

    it('calculates correct subtotal', () => {
      const item1 = createMockCartItem({ id: 'prod-1', priceCents: 1000 });
      const item2 = createMockCartItem({ id: 'prod-2', priceCents: 2000 });

      act(() => {
        useCartStore.getState().addItem({ ...item1, quantity: 2 });
        useCartStore.getState().addItem({ ...item2, quantity: 1 });
      });

      const subtotal = useCartStore.getState().subtotalCents();
      expect(subtotal).toBe(4000); // (1000 * 2) + (2000 * 1)
    });

    it('correctly identifies item in cart', () => {
      const item = createMockCartItem({ id: 'prod-1' });

      act(() => {
        useCartStore.getState().addItem(item);
      });

      expect(useCartStore.getState().hasItem('prod-1')).toBe(true);
      expect(useCartStore.getState().hasItem('prod-2')).toBe(false);
    });

    it('retrieves item by id', () => {
      const item = createMockCartItem({ id: 'prod-1', name: 'Test Product' });

      act(() => {
        useCartStore.getState().addItem(item);
      });

      const cartItem = useCartStore.getState().getItem('prod-1');
      expect(cartItem?.name).toBe('Test Product');
      expect(useCartStore.getState().getItem('nonexistent')).toBeUndefined();
    });
  });

  describe('Complex scenarios', () => {
    it('handles mixed add/remove/update operations', () => {
      const item1 = createMockCartItem({ id: 'prod-1', priceCents: 1000 });
      const item2 = createMockCartItem({ id: 'prod-2', priceCents: 2000 });

      act(() => {
        useCartStore.getState().addItem({ ...item1, quantity: 2 });
        useCartStore.getState().addItem({ ...item2, quantity: 1 });
        useCartStore.getState().updateQuantity('prod-1', 3);
        useCartStore.getState().removeItem('prod-2');
        useCartStore.getState().addItem({ ...item2, quantity: 2 });
      });

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(2);
      expect(state.itemCount()).toBe(5); // 3 + 2
      expect(state.subtotalCents()).toBe(7000); // (1000 * 3) + (2000 * 2)
    });

    it('persists state across selectors', () => {
      const item = createMockCartItem({ id: 'prod-1', priceCents: 1999 });

      act(() => {
        useCartStore.getState().addItem({ ...item, quantity: 2 });
      });

      const state = useCartStore.getState();
      expect(state.itemCount()).toBe(2);
      expect(state.subtotalCents()).toBe(3998);
      expect(state.hasItem('prod-1')).toBe(true);
    });
  });
});
