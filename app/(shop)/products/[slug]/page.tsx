import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import type { Metadata } from 'next';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    columns: { name: true, description: true },
  });
  if (!product) return {};
  return { title: product.name, description: product.description ?? undefined };
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
        <div className="bg-muted relative aspect-square overflow-hidden rounded-xl">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              priority
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

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          )}

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
        </div>
      </div>
    </div>
  );
}
