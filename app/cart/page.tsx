import type { Metadata } from 'next';
import { CartSummary } from '@/components/cart/cart-summary';

export const metadata: Metadata = { title: 'Cart' };

export default function CartPage() {
  return <CartSummary />;
}
