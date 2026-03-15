'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import { useCartItems, useCartSubtotal, useCartItemCount, useCartActions } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function CartSummary() {
  const items = useCartItems();
  const subtotal = useCartSubtotal();
  const itemCount = useCartItemCount();
  const { removeItem, updateQuantity, clearCart } = useCartActions();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <ShoppingBag className="text-muted-foreground/40 h-14 w-14" />
        <div>
          <p className="font-medium">Your cart is empty</p>
          <p className="text-muted-foreground mt-1 text-sm">Add some products to get started.</p>
        </div>
        <Button asChild variant="outline" className="mt-2">
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Cart{' '}
          <span className="text-muted-foreground text-base font-normal">
            ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
        </h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-muted-foreground hover:text-destructive text-sm transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Items list */}
        <ul className="flex flex-col divide-y lg:col-span-2" aria-label="Cart items">
          {items.map(item => (
            <li key={item.id} className="flex gap-4 py-5">
              {/* Thumbnail */}
              <Link href={`/products/${item.slug}`} className="shrink-0">
                <div className="bg-muted relative h-20 w-20 overflow-hidden rounded-xl">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
                  ) : (
                    <div className="bg-muted h-full w-full" />
                  )}
                </div>
              </Link>

              {/* Details */}
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/products/${item.slug}`}
                    className="text-foreground line-clamp-2 text-sm font-medium hover:underline"
                  >
                    {item.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="text-muted-foreground hover:text-destructive shrink-0 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  {/* Quantity stepper */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                      className="border-border hover:bg-muted flex h-7 w-7 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span
                      className="min-w-8 text-center text-sm tabular-nums"
                      aria-label={`Quantity: ${item.quantity}`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stockQuantity}
                      aria-label="Increase quantity"
                      className="border-border hover:bg-muted flex h-7 w-7 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <span className="text-sm font-semibold tabular-nums">
                    {formatPrice(item.priceCents * item.quantity)}
                  </span>
                </div>

                {item.quantity >= item.stockQuantity && <p className="text-xs text-orange-500">Max stock reached</p>}
              </div>
            </li>
          ))}
        </ul>

        {/* Order summary panel */}
        <aside className="lg:col-span-1">
          <div className="border-border sticky top-20 flex flex-col gap-4 rounded-2xl border p-5">
            <h2 className="text-sm font-semibold tracking-wide uppercase">Order Summary</h2>

            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </span>
                <span className="font-medium tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-muted-foreground">Calculated at checkout</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-base font-semibold">
              <span>Estimated total</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>

            <Button asChild size="lg" className="h-11 w-full">
              <Link href="/checkout">Proceed to checkout</Link>
            </Button>

            <Link
              href="/products"
              className="text-muted-foreground hover:text-foreground text-center text-sm transition-colors"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
