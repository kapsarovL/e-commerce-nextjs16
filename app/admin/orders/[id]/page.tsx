import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { OrderStatusSelect } from '@/components/admin/order-status-select';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Admin — Order #${id.slice(0, 8).toUpperCase()}` };
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

const paymentStatusColors: Record<string, string> = {
  unpaid: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-600',
  partially_refunded: 'bg-orange-100 text-orange-700',
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      user: { columns: { email: true, firstName: true, lastName: true } },
      items: true,
    },
  });

  if (!order) notFound();

  const customerName = order.user
    ? [order.user.firstName, order.user.lastName].filter(Boolean).join(' ') || order.user.email
    : (order.guestEmail ?? 'Guest');

  const addr = order.shippingAddress;
  const shippingLine = addr.line1
    ? [addr.line1, addr.line2, `${addr.city}, ${addr.state} ${addr.postalCode}`, addr.country]
        .filter(Boolean)
        .join(', ')
    : 'Not yet collected';

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/orders">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-muted-foreground text-sm">
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Status row */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-muted-foreground mb-1.5 text-xs">Order status</p>
            <OrderStatusSelect orderId={order.id} currentStatus={order.orderStatus} />
          </div>
          <div>
            <p className="text-muted-foreground mb-1.5 text-xs">Payment status</p>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${paymentStatusColors[order.paymentStatus] ?? 'bg-muted text-muted-foreground'}`}
            >
              {order.paymentStatus}
            </span>
          </div>
          {order.paidAt && (
            <div>
              <p className="text-muted-foreground mb-1.5 text-xs">Paid at</p>
              <p className="text-sm">
                {new Date(order.paidAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer + Shipping */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{customerName}</p>
            {order.user && <p className="text-muted-foreground">{order.user.email}</p>}
            {!order.user && order.guestEmail && <p className="text-muted-foreground">{order.guestEmail} (guest)</p>}
            {order.stripePaymentIntentId && (
              <p className="text-muted-foreground pt-2 font-mono text-xs">
                PI: {order.stripePaymentIntentId.slice(0, 24)}…
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shipping address</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">{shippingLine}</CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr className="text-muted-foreground text-left">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 text-right font-medium">Unit price</th>
                <th className="px-4 py-3 text-right font-medium">Qty</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {order.items.map(item => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-muted-foreground font-mono text-xs">{item.productSlug}</p>
                  </td>
                  <td className="px-4 py-3 text-right">{formatPrice(item.unitPriceCents)}</td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatPrice(item.totalCents)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/30 border-t">
              {order.taxCents > 0 && (
                <tr>
                  <td colSpan={3} className="text-muted-foreground px-4 py-2 text-right text-sm">
                    Tax
                  </td>
                  <td className="px-4 py-2 text-right text-sm">{formatPrice(order.taxCents)}</td>
                </tr>
              )}
              {order.shippingCents > 0 && (
                <tr>
                  <td colSpan={3} className="text-muted-foreground px-4 py-2 text-right text-sm">
                    Shipping
                  </td>
                  <td className="px-4 py-2 text-right text-sm">{formatPrice(order.shippingCents)}</td>
                </tr>
              )}
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right font-semibold">
                  Total
                </td>
                <td className="px-4 py-3 text-right font-semibold">{formatPrice(order.totalCents)}</td>
              </tr>
            </tfoot>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
