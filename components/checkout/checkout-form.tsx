'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useCartItems, useCartSubtotal, useCartActions } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatPrice, isOutOfStock } from '@/lib/utils';
import { z } from 'zod';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const guestEmailSchema = z.string().email('Enter a valid email address');

export function CheckoutForm() {
  const { isSignedIn, user } = useUser();
  const cartItems = useCartItems();
  const subtotal = useCartSubtotal();
  const { clearCart } = useCartActions();
  const router = useRouter();

  const [guestEmail, setGuestEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEmpty = cartItems.length === 0;

  // Filter out any out-of-stock items (defensive — stock may have changed)
  const validItems = cartItems.filter(item => !isOutOfStock(item.stockQuantity));
  const hasInvalidItems = validItems.length !== cartItems.length;

  const handleCheckout = () => {
    setServerError(null);
    setEmailError(null);

    // Validate guest email if not signed in
    if (!isSignedIn) {
      const result = guestEmailSchema.safeParse(guestEmail);
      if (!result.success) {
        setEmailError(result.error.issues[0].message);
        return;
      }
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: validItems.map(item => ({
              productId: item.id,
              quantity: item.quantity,
            })),
            ...(isSignedIn ? {} : { guestEmail }),
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          const message = data.details?.join('. ') ?? data.error ?? 'Something went wrong. Please try again.';
          setServerError(message);
          return;
        }

        // Redirect to Stripe Checkout
        if (data.url) {
          clearCart();
          router.push(data.url);
        }
      } catch {
        setServerError('Network error. Check your connection and try again.');
      }
    });
  };

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <ShoppingBag className="text-muted-foreground/40 h-12 w-12" />
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button asChild variant="outline">
          <Link href="/products">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Checkout</h1>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
        {/* ── Left: Contact + Guest email ── */}
        <div className="flex flex-col gap-6 md:col-span-3">
          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="mb-4 text-base font-medium">
              Contact
            </h2>

            {isSignedIn ? (
              <div className="border-border bg-muted/40 rounded-lg border px-4 py-3 text-sm">
                <p className="font-medium">{user?.fullName}</p>
                <p className="text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Label htmlFor="guest-email">Email address</Label>
                <Input
                  id="guest-email"
                  type="email"
                  placeholder="you@example.com"
                  value={guestEmail}
                  onChange={e => {
                    setGuestEmail(e.target.value);
                    setEmailError(null);
                  }}
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'email-error' : undefined}
                  className={emailError ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {emailError && (
                  <p id="email-error" className="text-destructive text-xs" role="alert">
                    {emailError}
                  </p>
                )}
                <p className="text-muted-foreground text-xs">
                  <Link href="/sign-in" className="hover:text-foreground underline">
                    Sign in
                  </Link>{' '}
                  for faster checkout and order history.
                </p>
              </div>
            )}
          </section>

          <p className="text-muted-foreground text-sm">
            Shipping address and payment details are collected securely on the next step via Stripe.
          </p>

          {/* Errors */}
          {serverError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {hasInvalidItems && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Some items in your cart are out of stock and have been removed.</AlertDescription>
            </Alert>
          )}

          <Button
            size="lg"
            className="h-12 w-full text-base"
            onClick={handleCheckout}
            disabled={isPending || validItems.length === 0}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Redirecting to payment…' : 'Continue to payment'}
          </Button>
        </div>

        {/* ── Right: Order summary ── */}
        <aside className="md:col-span-2" aria-labelledby="order-summary-heading">
          <div className="border-border sticky top-20 flex flex-col gap-4 rounded-xl border p-5">
            <h2 id="order-summary-heading" className="text-sm font-semibold tracking-wide uppercase">
              Order summary
            </h2>

            <ul className="flex flex-col gap-3" aria-label="Items in cart">
              {validItems.map(item => (
                <li key={item.id} className="flex items-center gap-3">
                  <div className="bg-muted relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                    {item.imageUrl && (
                      <Image src={item.imageUrl} alt={item.name} fill sizes="48px" className="object-cover" />
                    )}
                    <span className="bg-muted-foreground text-background absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm">{item.name}</p>
                  </div>
                  <span className="shrink-0 text-sm font-medium tabular-nums">
                    {formatPrice(item.priceCents * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <Separator />

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-muted-foreground">Calculated at next step</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
