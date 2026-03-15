import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowRight, Package, RotateCcw, Shield, Headphones } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { getFeaturedProducts, getCategories } from '@/lib/db/queries';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'StoreFront — Quality goods, delivered fast',
  description: 'Browse our curated catalog of quality products.',
};

const perks = [
  { icon: Package, label: 'Free shipping', description: 'On orders over $50' },
  { icon: RotateCcw, label: 'Easy returns', description: '30-day return policy' },
  { icon: Shield, label: 'Secure checkout', description: 'Powered by Stripe' },
  { icon: Headphones, label: '24/7 support', description: "We're always here" },
];

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(8), getCategories()]);

  return (
    <>
      <Navbar />

      <main className="min-h-[calc(100vh-3.5rem)]">
        {/* ── Hero ── */}
        <section className="from-background to-muted/40 bg-linear-to-b">
          <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-24 text-center md:py-32">
            <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium tracking-wide uppercase">
              New arrivals every week
            </span>
            <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Quality goods, <span className="text-primary">delivered fast</span>
            </h1>
            <p className="text-muted-foreground max-w-md text-base sm:text-lg">
              Discover our curated catalog — from everyday essentials to hard-to-find favourites.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="h-11 px-8">
                <Link href="/products">
                  Shop now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 px-8">
                <Link href="/search">Browse catalog</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Perks strip ── */}
        <section className="border-border border-y">
          <div className="container mx-auto grid grid-cols-2 divide-x divide-y px-4 sm:grid-cols-4 sm:divide-y-0">
            {perks.map(({ icon: Icon, label, description }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 px-4 py-8 text-center sm:flex-row sm:gap-4 sm:text-left"
              >
                <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <Icon className="text-primary h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-muted-foreground text-xs">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Featured products ── */}
        {featured.length > 0 && (
          <section className="container mx-auto px-4 py-16">
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
              {featured.map(product => {
                const imageUrl = (product.images as { url: string }[] | null)?.[0]?.url ?? null;
                return (
                  <Link key={product.id} href={`/products/${product.slug}`} className="group flex flex-col gap-3">
                    <div className="bg-muted relative aspect-square overflow-hidden rounded-2xl">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
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
          </section>
        )}

        {/* ── Categories ── */}
        {categories.length > 0 && (
          <section className="bg-muted/40 border-border border-t">
            <div className="container mx-auto px-4 py-16">
              <h2 className="mb-8 text-2xl font-bold tracking-tight">Shop by category</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {categories.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className="border-border bg-background hover:border-primary/50 hover:bg-primary/5 group flex flex-col gap-1 rounded-2xl border p-5 transition-colors"
                  >
                    <p className="text-foreground font-medium group-hover:underline">{cat.name}</p>
                    {cat.description && <p className="text-muted-foreground line-clamp-2 text-xs">{cat.description}</p>}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA banner ── */}
        <section className="container mx-auto px-4 py-16">
          <div className="bg-primary text-primary-foreground flex flex-col items-center gap-4 rounded-3xl px-8 py-14 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to find something great?</h2>
            <p className="text-primary-foreground/80 max-w-sm text-sm">
              Thousands of products, fast shipping, and easy returns. Start exploring today.
            </p>
            <Button asChild variant="secondary" size="lg" className="mt-2 h-11 px-8">
              <Link href="/products">
                Browse all products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
