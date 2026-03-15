import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { orders, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My orders',
  robots: { index: false },
};

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  processing: { label: 'Processing', variant: 'default' },
  shipped: { label: 'Shipped', variant: 'default' },
  delivered: { label: 'Delivered', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  refunded: { label: 'Refunded', variant: 'destructive' },
};

export default async function OrdersPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  // Look up internal user
  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: { id: true },
  });

  if (!dbUser) {
    // User exists in Clerk but webhook hasn't synced yet
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Setting up your account… please refresh in a moment.</p>
      </div>
    );
  }

  const userOrders = await db.query.orders.findMany({
    where: eq(orders.userId, dbUser.id),
    orderBy: desc(orders.createdAt),
    with: {
      items: {
        columns: {
          id: true,
          productName: true,
          quantity: true,
          unitPriceCents: true,
          totalCents: true,
          productSlug: true,
          productImageUrl: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Orders</h1>

      {userOrders.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
          <Link href="/products" className="hover:text-foreground text-sm underline underline-offset-2">
            Browse products
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4" aria-label="Order history">
          {userOrders.map(order => {
            const statusConfig = STATUS_BADGE[order.orderStatus] ?? STATUS_BADGE.pending;
            return (
              <li key={order.id} className="border-border flex flex-col gap-4 rounded-xl border p-5">
                {/* Order header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-muted-foreground text-xs">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="bg-muted w-fit rounded px-2 py-0.5 font-mono text-xs">
                      {order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                    <span className="text-sm font-semibold tabular-nums">{formatPrice(order.totalCents)}</span>
                  </div>
                </div>

                <Separator />

                {/* Items preview */}
                <ul className="flex flex-col gap-2">
                  {order.items.map(item => (
                    <li key={item.id} className="flex justify-between text-sm">
                      <Link href={`/products/${item.productSlug}`} className="mr-4 line-clamp-1 flex-1 hover:underline">
                        {item.productName} <span className="text-muted-foreground">× {item.quantity}</span>
                      </Link>
                      <span className="shrink-0 tabular-nums">{formatPrice(item.totalCents)}</span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
