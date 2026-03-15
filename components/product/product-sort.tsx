'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronsUpDown } from 'lucide-react';
import type { ProductSearchParams } from '@/lib/validations/search-params';

const SORT_OPTIONS: { value: ProductSearchParams['sort']; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'name-asc', label: 'Name: A → Z' },
  { value: 'name-desc', label: 'Name: Z → A' },
];

interface ProductSortProps {
  currentSort: ProductSearchParams['sort'];
}

export function ProductSort({ currentSort }: ProductSortProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative flex items-center">
      <ChevronsUpDown className="text-muted-foreground pointer-events-none absolute left-2.5 h-3.5 w-3.5" />
      <select
        value={currentSort}
        onChange={e => handleChange(e.target.value)}
        aria-label="Sort products"
        className="border-border bg-background text-foreground focus:ring-ring appearance-none rounded-lg border py-1.5 pr-7 pl-8 text-sm outline-none transition-shadow focus:ring-2 focus:ring-offset-1"
      >
        {SORT_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="text-muted-foreground pointer-events-none absolute right-2.5 text-[10px]">▾</span>
    </div>
  );
}
