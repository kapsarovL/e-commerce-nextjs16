import type { Metadata } from 'next';
import { CartSummary } from '@/components/cart/cart-summary';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Review and manage your shopping cart.',
};

export default function CartPage() {
  return <CartSummary />;
}
