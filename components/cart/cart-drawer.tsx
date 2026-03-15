'use client';

import { useCartItems, useCartSubtotal, useCartActions, useCartItemCount } from '@/store/cart';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CartItem } from './cart-item';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartItems();
  const subtotal = useCartSubtotal();
  const itemCount = useCartItemCount();
  const { clearCart } = useCartActions();

  return (
    <Sheet open={open} onOpenChange={o => !o && onClose()}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 pt-6 pb-4">
          <SheetTitle className="flex items-center gap-2 text-base font-semibold">
            <ShoppingBag className="h-4 w-4" />
            Cart
            {itemCount > 0 && (
              <span className="text-muted-foreground ml-auto text-sm font-normal">
                {itemCount} item{itemCount !== 1 ? 's' : ''}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
            <ShoppingBag className="text-muted-foreground/40 h-12 w-12" />
            <p className="text-muted-foreground text-sm">Your cart is empty.</p>
            <Button variant="outline" size="sm" onClick={onClose} asChild>
              <Link href="/products">Browse products</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6">
              <ul className="flex flex-col divide-y py-2" aria-label="Cart items">
                {items.map(item => (
                  <li key={item.id} className="py-4">
                    <CartItem item={item} />
                  </li>
                ))}
              </ul>
            </ScrollArea>

            <SheetFooter className="flex-col gap-3 border-t px-6 pt-4 pb-6">
              {/* Subtotal */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-muted-foreground text-xs">Shipping and taxes calculated at checkout.</p>

              <Separator />

              <Button asChild className="h-11 w-full" onClick={onClose}>
                <Link href="/checkout">Proceed to checkout</Link>
              </Button>

              <button
                onClick={clearCart}
                className="text-muted-foreground hover:text-destructive text-center text-xs transition-colors"
              >
                Clear cart
              </button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
