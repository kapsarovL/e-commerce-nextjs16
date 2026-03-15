'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { X, SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { ProductSearchParams } from '@/lib/validations/search-params';
import type { getCategories } from '@/lib/db/queries';

type Categories = Awaited<ReturnType<typeof getCategories>>;

interface ProductFiltersProps {
  categories: Categories;
  currentFilters: ProductSearchParams;
}

export function ProductFilters({ categories, currentFilters }: ProductFiltersProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <FilterPanel categories={categories} currentFilters={currentFilters} />
      </div>

      {/* Mobile sheet trigger */}
      <div className="lg:hidden">
        <MobileFilters categories={categories} currentFilters={currentFilters} />
      </div>
    </>
  );
}

function MobileFilters({ categories, currentFilters }: ProductFiltersProps) {
  const [open, setOpen] = useState(false);
  const activeCount = countActiveFilters(currentFilters);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="bg-primary text-primary-foreground flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto p-0" aria-describedby={undefined}>
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="text-base">Filters</SheetTitle>
        </SheetHeader>
        <div className="px-6 py-4">
          <FilterPanel categories={categories} currentFilters={currentFilters} onApply={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function countActiveFilters(filters: ProductSearchParams) {
  let count = 0;
  if (filters.category) count++;
  if (filters.inStock) count++;
  if (filters.minPrice !== undefined) count++;
  if (filters.maxPrice !== undefined) count++;
  return count;
}

interface FilterPanelProps extends ProductFiltersProps {
  onApply?: () => void;
}

function FilterPanel({ categories, currentFilters, onApply }: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
    onApply?.();
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    ['category', 'inStock', 'minPrice', 'maxPrice', 'page'].forEach(k => params.delete(k));
    router.push(`${pathname}?${params.toString()}`);
    onApply?.();
  };

  const hasActive = countActiveFilters(currentFilters) > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Filters</p>
        {hasActive && (
          <button
            type="button"
            onClick={clearAll}
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {hasActive && (
        <div className="flex flex-wrap gap-1.5">
          {currentFilters.category && (
            <FilterChip
              label={categories.find(c => c.slug === currentFilters.category)?.name ?? currentFilters.category}
              onRemove={() => update({ category: undefined })}
            />
          )}
          {currentFilters.inStock && (
            <FilterChip label="In stock" onRemove={() => update({ inStock: undefined })} />
          )}
          {currentFilters.minPrice !== undefined && (
            <FilterChip label={`Min $${currentFilters.minPrice}`} onRemove={() => update({ minPrice: undefined })} />
          )}
          {currentFilters.maxPrice !== undefined && (
            <FilterChip label={`Max $${currentFilters.maxPrice}`} onRemove={() => update({ maxPrice: undefined })} />
          )}
        </div>
      )}

      <div className="border-border h-px" />

      {/* Category */}
      <section aria-labelledby="filter-category-heading">
        <p
          id="filter-category-heading"
          className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wider"
        >
          Category
        </p>
        <ul className="flex flex-col gap-0.5">
          <li>
            <CategoryButton
              label="All categories"
              active={!currentFilters.category}
              onClick={() => update({ category: undefined })}
            />
          </li>
          {categories.map(cat => (
            <li key={cat.id}>
              <CategoryButton
                label={cat.name}
                active={currentFilters.category === cat.slug}
                onClick={() => update({ category: cat.slug })}
              />
            </li>
          ))}
        </ul>
      </section>

      <div className="border-border h-px" />

      {/* Price range */}
      <section aria-labelledby="filter-price-heading">
        <p
          id="filter-price-heading"
          className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wider"
        >
          Price range
        </p>
        <div className="flex items-center gap-2">
          <PriceInput
            aria-label="Minimum price"
            placeholder="Min"
            defaultValue={currentFilters.minPrice}
            onCommit={val => update({ minPrice: val })}
          />
          <span className="text-muted-foreground shrink-0 text-sm">—</span>
          <PriceInput
            aria-label="Maximum price"
            placeholder="Max"
            defaultValue={currentFilters.maxPrice}
            onCommit={val => update({ maxPrice: val })}
          />
        </div>
      </section>

      <div className="border-border h-px" />

      {/* In stock */}
      <section>
        <label className="group flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={currentFilters.inStock}
            onChange={e => update({ inStock: e.target.checked ? 'true' : undefined })}
            className="border-border rounded"
          />
          <span className="text-sm">In stock only</span>
        </label>
      </section>
    </div>
  );
}

function CategoryButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
        active
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium">
      {label}
      <button type="button" onClick={onRemove} aria-label={`Remove ${label} filter`} className="hover:opacity-70">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function PriceInput({
  placeholder,
  defaultValue,
  onCommit,
  'aria-label': ariaLabel,
}: {
  placeholder: string;
  defaultValue?: number;
  onCommit: (val: string | undefined) => void;
  'aria-label': string;
}) {
  return (
    <div className="relative flex-1">
      <span className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm">
        $
      </span>
      <input
        type="number"
        min={0}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ''}
        aria-label={ariaLabel}
        onBlur={e => onCommit(e.target.value || undefined)}
        onKeyDown={e => {
          if (e.key === 'Enter') onCommit((e.target as HTMLInputElement).value || undefined);
        }}
        className="border-border bg-background focus:ring-ring w-full rounded-lg border py-1.5 pr-2 pl-6 text-sm outline-none focus:ring-2 focus:ring-offset-1"
      />
    </div>
  );
}
