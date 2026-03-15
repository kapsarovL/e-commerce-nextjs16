import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductForm } from '@/components/admin/product-form';
import { db } from '@/lib/db';
import { createProduct } from '@/lib/actions/admin';
import { asc } from 'drizzle-orm';
import { categories } from '@/lib/db/schema';

export const metadata: Metadata = { title: 'Admin — New Product' };

export default async function NewProductPage() {
  const allCategories = await db.query.categories.findMany({
    orderBy: [asc(categories.name)],
    columns: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">New Product</h1>
      </div>
      <ProductForm action={createProduct} categories={allCategories} submitLabel="Create product" />
    </div>
  );
}
