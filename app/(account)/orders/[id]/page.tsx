import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { orders, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { formatPrice } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const { id } = await params;

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: { id: true },
  });
  if (!dbUser) redirect('/sign-in');

  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, id), eq(orders.userId, dbUser.id)),
    with: { items: true },
  });

  if (!order) notFound();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">
          Order <span className="font-mono text-base">{order.id.slice(0, 8).toUpperCase()}</span>
        </h1>
        <Button variant="outline" size="sm" asChild>
          <Link href="/orders">All orders</Link>
        </Button>
      </div>

      <div className="border-border flex flex-col gap-4 rounded-xl border p-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Status</span>
          <span className="capitalize">{order.orderStatus}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Payment</span>
          <span className="capitalize">{order.paymentStatus}</span>
        </div>

        <Separator />

        <ul className="flex flex-col gap-3">
          {order.items.map(item => (
            <li key={item.id} className="flex justify-between text-sm">
              <span>
                {item.productName} <span className="text-muted-foreground">× {item.quantity}</span>
              </span>
              <span className="tabular-nums">{formatPrice(item.totalCents)}</span>
            </li>
          ))}
        </ul>

        <Separator />

        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(order.totalCents)}</span>
        </div>
      </div>
    </div>
  );
}
