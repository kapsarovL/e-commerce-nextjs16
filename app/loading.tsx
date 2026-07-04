import Link from 'next/link';
import { Package, RotateCcw, Shield, Headphones, ArrowRight } from 'lucide-react';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';

const perks = [
  { icon: Package, label: 'Free shipping', description: 'On orders over $50' },
  { icon: RotateCcw, label: 'Easy returns', description: '30-day return policy' },
  { icon: Shield, label: 'Secure checkout', description: 'Powered by Stripe' },
  { icon: Headphones, label: '24/7 support', description: "We're always here" },
];

function SkeletonCard() {
  return (
    <div className="border-border bg-card animate-pulse overflow-hidden rounded-xl border" aria-hidden="true">
      <div className="bg-muted aspect-square" />
      <div className="flex flex-col gap-2 p-3">
        <div className="bg-muted h-4 w-4/5 rounded" />
        <div className="bg-muted h-4 w-1/3 rounded" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <>
      <header className="border-border bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
        <nav className="mx-auto flex h-14 w-full max-w-7xl items-center gap-4 px-4" aria-label="Main navigation">
          <Link
            href="/"
            className="shrink-0 text-base font-semibold tracking-tight transition-opacity hover:opacity-80"
          >
            StoreFront
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <div className="bg-muted h-7 w-7 animate-pulse rounded-md" aria-hidden="true" />

            <Button variant="outline" size="sm" className="h-7 text-sm" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="min-h-dvh w-full" id="main-content">
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

        <section className="w-full" aria-label="Featured products">
          <div className="mx-auto w-full max-w-7xl px-4 py-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Featured</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-border bg-muted/40 w-full border-t" aria-label="Categories">
          <div className="mx-auto w-full max-w-7xl px-4 py-16">
            <h2 className="mb-8 text-2xl font-bold tracking-tight">Shop by category</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="border-border bg-background animate-pulse rounded-2xl border p-5"
                  aria-hidden="true"
                >
                  <div className="bg-muted h-4 w-3/4 rounded" />
                  <div className="bg-muted mt-2 h-3 w-full rounded" />
                </div>
              ))}
            </div>
          </div>
        </section>

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
