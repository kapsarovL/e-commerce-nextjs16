import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ProductGrid, ProductGridSkeleton } from '@/components/product/product-grid';
import { ProductFilters } from '@/components/product/product-filters';
import { ProductSort } from '@/components/product/product-sort';
import { getProducts, getCategories } from '@/lib/db/queries';
import { productSearchSchema } from '@/lib/validations/search-params';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our full catalog.',
};

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const rawParams = await searchParams;

  const flat = Object.fromEntries(Object.entries(rawParams).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));

  const parsed = productSearchSchema.safeParse(flat);
  const filters = parsed.success ? parsed.data : productSearchSchema.parse({});

  const [{ data: products, total, totalPages }, categories] = await Promise.all([
    getProducts(filters),
    getCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">
          {total.toLocaleString()} {total === 1 ? 'product' : 'products'}
          {filters.search ? ` for "${filters.search}"` : ''}
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar filters */}
        <aside className="w-full shrink-0 lg:w-64">
          <ProductFilters categories={categories} currentFilters={filters} />
        </aside>

        {/* Product grid */}
        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Page {filters.page} of {totalPages}
            </p>
            <ProductSort currentSort={filters.sort} />
          </div>

          <Suspense key={JSON.stringify(filters)} fallback={<ProductGridSkeleton count={filters.perPage} />}>
            <ProductGrid products={products} />
          </Suspense>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
                <a
                  key={p}
                  href={`?${new URLSearchParams({ ...flat, page: String(p) })}`}
                  className={`rounded border px-3 py-1.5 text-sm font-medium transition-colors ${
                    p === filters.page
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
