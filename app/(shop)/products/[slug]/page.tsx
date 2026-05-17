import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';

const AddToCartButton = dynamic(() => import('@/components/cart/add-to-cart-button').then(mod => ({ default: mod.AddToCartButton })));

export const revalidate = 3600; // Revalidate every hour

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    columns: { name: true, description: true, priceCents: true },
  });
  if (!product) return {};

  const description = product.description
    ? product.description.length > 160
      ? product.description.slice(0, 157) + '...'
      : product.description
    : `Buy ${product.name}`;

  return {
    title: product.name,
    description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
  });

  if (!product || !product.isPublished) notFound();

  const primaryImage = Array.isArray(product.images) ? product.images[0] : null;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Image */}
        <div className="bg-muted aspect-square overflow-hidden rounded-xl" style={{ position: 'relative' }}>
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              priority
              fetchPriority="high"
            />
          ) : (
            <div className="bg-muted h-full w-full" />
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-xl font-semibold">{formatPrice(product.priceCents)}</span>
              {product.comparePriceCents && product.comparePriceCents > product.priceCents && (
                <span className="text-muted-foreground text-base line-through">
                  {formatPrice(product.comparePriceCents)}
                </span>
              )}
            </div>
          </div>

          {product.description && <p className="text-muted-foreground leading-relaxed">{product.description}</p>}

          <Suspense fallback={<Button disabled className="w-full">Loading...</Button>}>
            <AddToCartButton
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                imageUrl: primaryImage?.url ?? null,
                priceCents: product.priceCents,
                stockQuantity: product.stockQuantity,
              }}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
