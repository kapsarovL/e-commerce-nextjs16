import { redirect } from 'next/navigation';
import Link from 'next/link';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order confirmed',
  robots: { index: false }, // don't index confirmation pages
};

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams;

  if (!session_id) redirect('/');

  // Verify session server-side
  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items', 'line_items.data.price.product'],
    });
  } catch {
    redirect('/');
  }

  // If session wasn't paid, don't show confirmation
  if (session.payment_status !== 'paid') {
    redirect('/cart');
  }

  // Look up our internal order record
  const order = await db.query.orders.findFirst({
    where: eq(orders.stripeSessionId, session_id),
    with: { items: true },
  });

  const customerEmail = session.customer_details?.email;
  const shippingDetails = session.collected_information?.shipping_details;
  const shippingAddress = shippingDetails?.address;

  return (
    <div className="container mx-auto max-w-lg px-4 py-16 text-center">
      <div className="flex flex-col items-center gap-6">
        {/* Success icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Order confirmed</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Thanks for your purchase! A confirmation has been sent to{' '}
            <span className="text-foreground font-medium">{customerEmail}</span>.
          </p>
        </div>

        {/* Order details card */}
        <div className="border-border flex w-full flex-col gap-4 rounded-xl border p-6 text-left">
          {order && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order reference</span>
              <span className="bg-muted rounded px-2 py-0.5 font-mono text-xs">
                {order.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
          )}

          {/* Line items */}
          {order?.items && order.items.length > 0 && (
            <>
              <Separator />
              <ul className="flex flex-col gap-3">
                {order.items.map(item => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.productName} <span className="text-muted-foreground">× {item.quantity}</span>
                    </span>
                    <span className="font-medium tabular-nums">{formatPrice(item.totalCents)}</span>
                  </li>
                ))}
              </ul>
              <Separator />
              <div className="flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(order.totalCents)}</span>
              </div>
            </>
          )}

          {/* Shipping address */}
          {shippingAddress && (
            <>
              <Separator />
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Shipping to</p>
                <address className="leading-relaxed not-italic">
                  {shippingDetails?.name && <p className="font-medium">{shippingDetails.name}</p>}
                  <p>{shippingAddress.line1}</p>
                  {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                  <p>
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
                  </p>
                  <p>{shippingAddress.country}</p>
                </address>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Button asChild className="flex-1">
            <Link href="/products">Continue shopping</Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link href="/orders">View orders</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
