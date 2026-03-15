import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TogglePublishedButton } from '@/components/admin/toggle-published-button';

export const metadata: Metadata = { title: 'Admin — Products' };

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

export default async function AdminProductsPage() {
  const allProducts = await db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
    with: { category: { columns: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1 text-sm">{allProducts.length} total</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            New product
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-muted-foreground text-left">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 text-right font-medium">Price</th>
                  <th className="px-4 py-3 text-right font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Published</th>
                  <th className="px-4 py-3 font-medium">Featured</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {allProducts.map(product => (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-muted-foreground font-mono text-xs">{product.slug}</p>
                      </div>
                    </td>
                    <td className="text-muted-foreground px-4 py-3">{product.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatPrice(product.priceCents)}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-medium ${
                          product.stockQuantity === 0
                            ? 'text-destructive'
                            : product.stockQuantity <= product.lowStockThreshold
                              ? 'text-orange-500'
                              : 'text-foreground'
                        }`}
                      >
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <TogglePublishedButton productId={product.id} isPublished={product.isPublished} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium ${product.isFeatured ? 'text-primary' : 'text-muted-foreground'}`}
                      >
                        {product.isFeatured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit {product.name}</span>
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allProducts.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-muted-foreground text-sm">No products yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/admin/products/new">Create your first product</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
