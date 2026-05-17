export interface Product {
  id: string
  name: string
  price: number
  tags: string[]
  image?: string
  description?: string
}

export type { CartItem, ShippingAddress, PaymentMethod, CheckoutState, CheckoutAction } from './checkout'
