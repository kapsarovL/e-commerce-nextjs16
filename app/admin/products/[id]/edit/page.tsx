import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductForm } from '@/components/admin/product-form';
import { db } from '@/lib/db';
import { products, categories } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { updateProduct } from '@/lib/actions/admin';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    columns: { name: true },
  });
  return { title: product ? `Admin — Edit: ${product.name}` : 'Admin — Product not found' };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const [product, allCategories] = await Promise.all([
    db.query.products.findFirst({ where: eq(products.id, id) }),
    db.query.categories.findMany({
      orderBy: [asc(categories.name)],
      columns: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, product.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/products">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground font-mono text-sm">{product.slug}</p>
        </div>
      </div>

      <ProductForm
        action={updateWithId}
        categories={allCategories}
        defaultValues={{
          name: product.name,
          slug: product.slug,
          description: product.description ?? undefined,
          priceCents: product.priceCents,
          comparePriceCents: product.comparePriceCents ?? undefined,
          categoryId: product.categoryId,
          stockQuantity: product.stockQuantity,
          lowStockThreshold: product.lowStockThreshold,
          isPublished: product.isPublished,
          isFeatured: product.isFeatured,
          tags: product.tags,
        }}
        submitLabel="Save changes"
      />
    </div>
  );
}
