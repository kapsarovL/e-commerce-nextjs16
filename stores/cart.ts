import { create } from 'zustand'

interface CartItem {
  productId: string
  price: number
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clear: () => void
  total: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => {
    set((state) => {
      const existing = state.items.find(i => i.productId === item.productId)
      if (existing) {
        return {
          items: state.items.map(i =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        }
      }
      return { items: [...state.items, item] }
    })
  },
  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter(i => i.productId !== productId),
    }))
  },
  updateQuantity: (productId, quantity) => {
    set((state) => ({
      items: state.items.map(i =>
        i.productId === productId ? { ...i, quantity } : i
      ),
    }))
  },
  clear: () => {
    set({ items: [] })
  },
  total: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },
}))
