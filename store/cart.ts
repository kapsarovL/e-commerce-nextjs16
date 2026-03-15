import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';

export interface CartItem {
  id: string; // product.id
  slug: string;
  name: string;
  imageUrl: string | null;
  priceCents: number; // snapshotted at add-to-cart time
  quantity: number;
  stockQuantity: number; // max allowed — validated against live stock at checkout
}

interface CartState {
  items: CartItem[];

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Derived (computed inline — not stored)
  itemCount: () => number;
  subtotalCents: () => number;
  hasItem: (productId: string) => boolean;
  getItem: (productId: string) => CartItem | undefined;
}

export const useCartStore = create<CartState>()(
  persist(
    immer((set, get) => ({
      items: [],

      addItem: incoming => {
        set(state => {
          const existing = state.items.find(i => i.id === incoming.id);

          if (existing) {
            const newQty = existing.quantity + (incoming.quantity ?? 1);
            existing.quantity = Math.min(newQty, incoming.stockQuantity);
          } else {
            state.items.push({
              ...incoming,
              quantity: Math.min(incoming.quantity ?? 1, incoming.stockQuantity),
            });
          }
        });
      },

      removeItem: productId => {
        set(state => {
          state.items = state.items.filter(i => i.id !== productId);
        });
      },

      updateQuantity: (productId, quantity) => {
        set(state => {
          const item = state.items.find(i => i.id === productId);
          if (!item) return;

          if (quantity <= 0) {
            state.items = state.items.filter(i => i.id !== productId);
          } else {
            item.quantity = Math.min(quantity, item.stockQuantity);
          }
        });
      },

      clearCart: () => {
        set(state => {
          state.items = [];
        });
      },

      // Derived selectors
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotalCents: () => get().items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),

      hasItem: productId => get().items.some(i => i.id === productId),

      getItem: productId => get().items.find(i => i.id === productId),
    })),
    {
      name: 'storefront-cart',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? sessionStorage : ({} as Storage))),
      // Only persist the items array — actions are not serializable
      partialize: state => ({ items: state.items }),
    },
  ),
);

export const useCartItems = () => useCartStore(s => s.items);
export const useCartItemCount = () => useCartStore(s => s.itemCount());
export const useCartSubtotal = () => useCartStore(s => s.subtotalCents());
export const useCartActions = () =>
  useCartStore(
    useShallow(s => ({
      addItem: s.addItem,
      removeItem: s.removeItem,
      updateQuantity: s.updateQuantity,
      clearCart: s.clearCart,
    })),
  );
