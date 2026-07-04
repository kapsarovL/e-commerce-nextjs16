import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Package, RotateCcw, Shield, Headphones } from 'lucide-react';
import { NavbarPublic } from '@/components/layout/navbar-public';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { getFeaturedProducts, getCategories } from '@/lib/db/queries';
import { FeaturedProducts } from '@/components/home/featured-products';
import { CategoriesSection } from '@/components/home/categories-section';

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
      <NavbarPublic />

      <main className="min-h-[calc(100vh-3.5rem)] w-full">
        {/* ── Hero ── */}
        <section className="from-background to-muted/40 w-full bg-linear-to-b">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 py-24 text-center md:py-32">
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
        <section className="border-border w-full border-y">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-2 divide-x divide-y px-4 sm:grid-cols-4 sm:divide-y-0">
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
        <FeaturedProducts featured={featured} />

        {/* ── Categories ── */}
        <CategoriesSection categories={categories} />

        {/* ── CTA banner ── */}
        <section className="w-full">
          <div className="mx-auto w-full max-w-7xl px-4 py-16">
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
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
