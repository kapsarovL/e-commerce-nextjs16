'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCartActions } from '@/store/cart';
import { ShoppingCart, Check, Plus } from 'lucide-react';

interface AddToCartButtonProps {
  product: {
    id: string;
    slug: string;
    name: string;
    imageUrl: string | null;
    priceCents: number;
    stockQuantity: number;
  };
  /** "default" = full-width button for product pages; "quick-add" = compact card overlay */
  variant?: 'default' | 'quick-add';
}

export function AddToCartButton({ product, variant = 'default' }: AddToCartButtonProps) {
  const { addItem } = useCartActions();
  const [added, setAdded] = useState(false);

  const outOfStock = product.stockQuantity === 0;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent link navigation when used inside a card link
    if (outOfStock) return;
    addItem({ ...product, quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (variant === 'quick-add') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={outOfStock}
        aria-label={added ? 'Added to cart' : `Add ${product.name} to cart`}
        className={`flex w-full items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
          added ? 'bg-green-600 text-white' : 'bg-foreground text-background hover:bg-foreground/90'
        }`}
      >
        {added ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Added
          </>
        ) : (
          <>
            <Plus className="h-3.5 w-3.5" />
            Add to cart
          </>
        )}
      </button>
    );
  }

  return (
    <Button size="lg" className="w-full" onClick={handleClick} disabled={outOfStock}>
      {outOfStock ? (
        'Out of stock'
      ) : added ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added to cart
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to cart
        </>
      )}
    </Button>
  );
}
