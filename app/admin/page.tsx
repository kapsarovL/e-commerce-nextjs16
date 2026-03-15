import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { orders, products, users } from '@/lib/db/schema';
import { eq, sql, gte } from 'drizzle-orm';
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Admin — Overview' };

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export default async function AdminPage() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalOrders, recentRevenue, totalProducts, totalUsers, recentOrders] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(orders),
    db
      .select({ total: sql<number>`coalesce(sum(total_cents), 0)::int` })
      .from(orders)
      .where(gte(orders.createdAt, thirtyDaysAgo)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.isPublished, true)),
    db.select({ count: sql<number>`count(*)::int` }).from(users),
    db.query.orders.findMany({
      orderBy: (o, { desc }) => [desc(o.createdAt)],
      limit: 10,
      with: { items: { columns: { productName: true, quantity: true } } },
    }),
  ]);

  const stats = [
    {
      title: 'Total Revenue',
      value: formatPrice(recentRevenue[0]?.total ?? 0),
      icon: TrendingUp,
      description: 'Last 30 days',
    },
    {
      title: 'Total Orders',
      value: (totalOrders[0]?.count ?? 0).toLocaleString(),
      icon: ShoppingCart,
      description: 'All time',
    },
    {
      title: 'Published Products',
      value: (totalProducts[0]?.count ?? 0).toLocaleString(),
      icon: Package,
      description: 'Active in catalog',
    },
    {
      title: 'Customers',
      value: (totalUsers[0]?.count ?? 0).toLocaleString(),
      icon: Users,
      description: 'Registered accounts',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground mt-1 text-sm">Store performance at a glance.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ title, value, icon: Icon, description }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
              <Icon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-muted-foreground mt-1 text-xs">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent orders table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-left">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Payment</th>
                  <th className="pb-3 text-right font-medium">Total</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 font-mono text-xs">
                      <a href={`/admin/orders/${order.id}`} className="text-primary hover:underline">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </a>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          order.orderStatus === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.orderStatus === 'processing'
                              ? 'bg-blue-100 text-blue-700'
                              : order.orderStatus === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          order.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : order.paymentStatus === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right font-medium">{formatPrice(order.totalCents)}</td>
                    <td className="text-muted-foreground py-3 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentOrders.length === 0 && (
              <p className="text-muted-foreground py-8 text-center text-sm">No orders yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
