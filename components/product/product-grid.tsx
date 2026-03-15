import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/db/queries';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="text-muted-foreground font-medium">No products found.</p>
        <p className="text-muted-foreground text-sm">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map(product => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

function ProductCard({ product }: { product: Product }) {
  const images = product.images as { url: string; alt?: string }[] | null;
  const primaryImage = Array.isArray(images) ? images[0] : null;
  const imageUrl = primaryImage?.url ?? null;

  const isOnSale = !!(product.comparePriceCents && product.comparePriceCents > product.priceCents);
  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock = !isOutOfStock && product.stockQuantity <= product.lowStockThreshold;

  return (
    <div className="border-border bg-card group flex flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </Link>

        {/* Badges */}
        <div className="pointer-events-none absolute top-2 left-2 flex flex-col gap-1">
          {isOutOfStock && (
            <span className="bg-background/90 rounded px-2 py-0.5 text-xs font-medium">Out of stock</span>
          )}
          {isOnSale && !isOutOfStock && (
            <span className="bg-destructive text-destructive-foreground rounded px-2 py-0.5 text-xs font-semibold">
              Sale
            </span>
          )}
          {isLowStock && !isOnSale && (
            <span className="rounded bg-orange-500 px-2 py-0.5 text-xs font-medium text-white">Low stock</span>
          )}
        </div>

        {/* Quick-add slides up on hover */}
        {!isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-200 group-hover:translate-y-0">
            <AddToCartButton
              product={{ id: product.id, slug: product.slug, name: product.name, imageUrl, priceCents: product.priceCents, stockQuantity: product.stockQuantity }}
              variant="quick-add"
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-3">
        <Link href={`/products/${product.slug}`} className="hover:underline">
          <p className="line-clamp-2 text-sm font-medium leading-snug">{product.name}</p>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tabular-nums">{formatPrice(product.priceCents)}</span>
          {isOnSale && (
            <span className="text-muted-foreground text-xs line-through tabular-nums">
              {formatPrice(product.comparePriceCents!)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

interface ProductGridSkeletonProps {
  count?: number;
}

export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <ul
      className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4"
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <ProductCardSkeleton />
        </li>
      ))}
    </ul>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="border-border bg-card animate-pulse overflow-hidden rounded-xl border" aria-hidden="true">
      <div className="aspect-square bg-muted" />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-4 w-4/5 rounded bg-muted" />
        <div className="h-4 w-1/3 rounded bg-muted" />
      </div>
    </div>
  );
}
