import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { users, orders } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = { title: 'My Account' };

export default async function AccountPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: { id: true, email: true, firstName: true, lastName: true },
  });

  if (!dbUser) redirect('/sign-in');

  const recentOrders = await db.query.orders.findMany({
    where: eq(orders.userId, dbUser.id),
    orderBy: [desc(orders.createdAt)],
    limit: 5,
    with: { items: { columns: { productName: true, quantity: true } } },
  });

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Account</h1>
        <p className="text-muted-foreground mt-1 text-sm">{dbUser.email}</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Orders</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/orders">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-muted-foreground text-sm">No orders yet.</p>
              <Button asChild className="mt-4">
                <Link href="/products">Start shopping</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y">
              {recentOrders.map(order => (
                <li key={order.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-mono text-xs font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs capitalize">
                      {order.orderStatus} · {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{formatPrice(order.totalCents)}</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/orders/${order.id}`}>View</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
