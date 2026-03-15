import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getProducts, getCategories } from '@/lib/db/queries';
import { productSearchSchema } from '@/lib/validations/search-params';
import { ProductGrid, ProductGridSkeleton } from '@/components/product/product-grid';
import { ProductFilters } from '@/components/product/product-filters';
import { ProductSort } from '@/components/product/product-sort';
import { SearchBar } from '@/components/layout/search-bar';

export const metadata: Metadata = { title: 'Browse catalog' };

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
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
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {filters.search ? (
              <>
                Results for <span className="text-primary">&ldquo;{filters.search}&rdquo;</span>
              </>
            ) : (
              'Browse catalog'
            )}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {total.toLocaleString()} {total === 1 ? 'product' : 'products'} found
          </p>
        </div>

        {/* Inline search refinement */}
        <Suspense>
          <SearchBar className="max-w-md" />
        </Suspense>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar — desktop sidebar / mobile sheet */}
        <aside className="w-full shrink-0 lg:w-56 xl:w-64">
          <Suspense>
            <ProductFilters categories={categories} currentFilters={filters} />
          </Suspense>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-muted-foreground hidden text-sm sm:block">
              {total === 0
                ? 'No results'
                : `${(filters.page - 1) * filters.perPage + 1}–${Math.min(filters.page * filters.perPage, total)} of ${total.toLocaleString()}`}
            </p>
            <Suspense>
              <ProductSort currentSort={filters.sort} />
            </Suspense>
          </div>

          {/* Grid */}
          <Suspense key={JSON.stringify(filters)} fallback={<ProductGridSkeleton count={filters.perPage} />}>
            <ProductGrid products={products} />
          </Suspense>

          {/* Pagination */}
          {totalPages > 1 && <Pagination currentPage={filters.page} totalPages={totalPages} flat={flat} />}
        </div>
      </div>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  flat,
}: {
  currentPage: number;
  totalPages: number;
  flat: Record<string, string | undefined>;
}) {
  const pageHref = (p: number) => `?${new URLSearchParams({ ...flat, page: String(p) })}`;
  const pages = buildPageList(currentPage, totalPages);

  return (
    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Pagination">
      {/* Prev */}
      {currentPage > 1 ? (
        <Link
          href={pageHref(currentPage - 1)}
          aria-label="Previous page"
          className="border-border hover:bg-muted flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className="border-border text-muted-foreground flex h-8 w-8 items-center justify-center rounded-lg border opacity-40">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {/* Pages */}
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`ellipsis-${i}`} className="text-muted-foreground flex h-8 w-8 items-center justify-center text-sm">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={pageHref(p as number)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
              p === currentPage
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border hover:bg-muted'
            }`}
          >
            {p}
          </Link>
        ),
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={pageHref(currentPage + 1)}
          aria-label="Next page"
          className="border-border hover:bg-muted flex h-8 w-8 items-center justify-center rounded-lg border transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="border-border text-muted-foreground flex h-8 w-8 items-center justify-center rounded-lg border opacity-40">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}

function buildPageList(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '…')[] = [1];
  if (current > 3) pages.push('…');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) pages.push(p);

  if (current < total - 2) pages.push('…');
  pages.push(total);

  return pages;
}
