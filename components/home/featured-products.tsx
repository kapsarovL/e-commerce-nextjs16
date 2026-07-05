import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getFeaturedProducts } from '@/lib/db/queries';
import { formatPrice } from '@/lib/utils';

export async function FeaturedProducts() {
  const featured = await getFeaturedProducts(8);

  if (featured.length === 0) return null;

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Featured</h2>
          <Link
            href="/products?featured=true"
            className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-medium transition-colors"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((product, idx) => {
            const imageUrl = (product.images as { url: string }[] | null)?.[0]?.url ?? null;
            return (
              <Link key={product.id} href={`/products/${product.slug}`} className="group flex flex-col gap-3">
                <div className="bg-muted aspect-square overflow-hidden rounded-2xl" style={{ position: 'relative' }}>
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="bg-muted h-full w-full" />
                  )}
                  {product.comparePriceCents && product.comparePriceCents > product.priceCents && (
                    <span className="bg-destructive text-destructive-foreground absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                      Sale
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-foreground line-clamp-2 text-sm font-medium group-hover:underline">
                    {product.name}
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-semibold tabular-nums">{formatPrice(product.priceCents)}</span>
                    {product.comparePriceCents && product.comparePriceCents > product.priceCents && (
                      <span className="text-muted-foreground text-xs tabular-nums line-through">
                        {formatPrice(product.comparePriceCents)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
