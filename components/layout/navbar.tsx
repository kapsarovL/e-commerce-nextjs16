'use client';

import { useState, useEffect } from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';
import { useCartItemCount } from '@/store/cart';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { SearchBar } from '@/components/layout/search-bar';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const [cartOpen, setCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartItemCount();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => setMounted(true), []);

  return (
    <>
      <header className="border-border bg-background/95 supports-backdrop-filter:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur">
        <nav className="container mx-auto flex h-14 items-center gap-4 px-4" aria-label="Main navigation">
          {/* Logo */}
          <Link
            href="/"
            className="shrink-0 text-base font-semibold tracking-tight transition-opacity hover:opacity-80"
          >
            StoreFront
          </Link>

          {/* Search bar — grows to fill available space */}
          <div className="hidden max-w-md flex-1 sm:block">
            <Suspense>
              <SearchBar />
            </Suspense>
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4" />
              {mounted && itemCount > 0 && (
                <span
                  className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium tabular-nums"
                  aria-hidden="true"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Button>

            {/* Auth */}
            {isLoaded && (
              <>
                {isSignedIn ? (
                  <UserButton />
                ) : (
                  <SignInButton mode="modal">
                    <Button variant="outline" size="sm" className="h-8 text-sm">
                      Sign In
                    </Button>
                  </SignInButton>
                )}
              </>
            )}
          </div>
        </nav>

        {/* Mobile search row */}
        <div className="border-border border-t px-4 py-2 sm:hidden">
          <Suspense>
            <SearchBar />
          </Suspense>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
