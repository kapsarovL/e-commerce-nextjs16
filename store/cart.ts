import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  priceCents: number;
  quantity: number;
  stockQuantity: number;
}

interface CartState {
  items: CartItem[];

  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    immer(set => ({
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
    })),
    {
      name: 'storefront-cart',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? sessionStorage : ({} as Storage))),
      partialize: state => ({ items: state.items }),
    },
  ),
);

// Derived selectors — stateless functions, not persisted
export const selectCartItemCount = (s: CartState) => s.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartSubtotal = (s: CartState) => s.items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
export const selectCartHasItem = (productId: string) => (s: CartState) => s.items.some(i => i.id === productId);
export const selectCartGetItem = (productId: string) => (s: CartState) => s.items.find(i => i.id === productId);

export const useCartItems = () => useCartStore(s => s.items);
export const useCartItemCount = () => useCartStore(selectCartItemCount);
export const useCartSubtotal = () => useCartStore(selectCartSubtotal);
export const useCartHasItem = (productId: string) => useCartStore(selectCartHasItem(productId));
export const useCartGetItem = (productId: string) => useCartStore(selectCartGetItem(productId));
export const useCartActions = () =>
  useCartStore(
    useShallow(s => ({
      addItem: s.addItem,
      removeItem: s.removeItem,
      updateQuantity: s.updateQuantity,
      clearCart: s.clearCart,
    })),
  );
