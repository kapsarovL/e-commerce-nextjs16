export interface Product {
  id: string
  name: string
  price: number
  tags: string[]
  image?: string
  description?: string
}

export interface OrderItem {
  productId: string
  quantity: number
}

export interface Order {
  id: string
  items: OrderItem[]
  total: number
  createdAt: Date
}

export interface OrderSummary {
  totalRevenue: number
  orderCount: number
  topProducts: Array<{ productId: string; qty: number }>
  monthlyBreakdown: Record<string, number>
}

export type { CartItem, ShippingAddress, PaymentMethod, CheckoutState, CheckoutAction } from './checkout'
