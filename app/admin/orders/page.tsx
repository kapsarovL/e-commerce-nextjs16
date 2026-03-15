import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Admin — Orders' };

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

const orderStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
};

const paymentStatusColors: Record<string, string> = {
  unpaid: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
  partially_refunded: 'bg-orange-100 text-orange-700',
};

export default async function AdminOrdersPage() {
  const allOrders = await db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
    with: {
      user: { columns: { email: true, firstName: true, lastName: true } },
      items: { columns: { productName: true, quantity: true, totalCents: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground mt-1 text-sm">{allOrders.length} total</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-muted-foreground text-left">
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {allOrders.map(order => {
                  const customerName = order.user
                    ? [order.user.firstName, order.user.lastName].filter(Boolean).join(' ') || order.user.email
                    : (order.guestEmail ?? 'Guest');

                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-medium">#{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="text-muted-foreground max-w-[160px] truncate px-4 py-3">{customerName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${orderStatusColors[order.orderStatus] ?? 'bg-muted text-muted-foreground'}`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${paymentStatusColors[order.paymentStatus] ?? 'bg-muted text-muted-foreground'}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="text-muted-foreground px-4 py-3">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{formatPrice(order.totalCents)}</td>
                      <td className="text-muted-foreground px-4 py-3 text-xs whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View order</span>
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {allOrders.length === 0 && (
              <p className="text-muted-foreground py-16 text-center text-sm">No orders yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
