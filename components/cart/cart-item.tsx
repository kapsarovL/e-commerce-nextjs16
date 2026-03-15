'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, X } from 'lucide-react';
import { useCartActions } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import type { CartItem as CartItemType } from '@/store/cart';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCartActions();

  return (
    <div className="flex gap-3">
      {/* Thumbnail */}
      <Link href={`/products/${item.slug}`} className="shrink-0">
        <div className="bg-muted relative h-16 w-16 overflow-hidden rounded-lg">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
          ) : (
            <div className="bg-muted h-full w-full" />
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/products/${item.slug}`} className="line-clamp-2 text-sm font-medium hover:underline">
            {item.name}
          </Link>
          <button
            onClick={() => removeItem(item.id)}
            aria-label={`Remove ${item.name} from cart`}
            className="text-muted-foreground hover:text-destructive shrink-0 p-0.5 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <span className="text-sm font-semibold tabular-nums">{formatPrice(item.priceCents * item.quantity)}</span>

        {/* Quantity stepper */}
        <div className="mt-1 flex items-center gap-2">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            aria-label="Decrease quantity"
            disabled={item.quantity <= 1}
            className="border-border text-foreground hover:bg-muted flex h-6 w-6 items-center justify-center rounded border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-3 w-3" />
          </button>

          <span
            className="min-w-[1.5rem] text-center text-sm tabular-nums"
            aria-live="polite"
            aria-label={`Quantity: ${item.quantity}`}
          >
            {item.quantity}
          </span>

          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            aria-label="Increase quantity"
            disabled={item.quantity >= item.stockQuantity}
            className="border-border text-foreground hover:bg-muted flex h-6 w-6 items-center justify-center rounded border transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
