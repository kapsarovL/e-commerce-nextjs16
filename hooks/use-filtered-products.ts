'use client';

import { useState, useTransition, useMemo } from 'react';
import type { Product } from '@/lib/validations/product';

interface FilterState {
  query: string;
  priceRange: [number, number]; // in cents
  activeFilters: string[];
  sortOrder: 'price' | 'name' | 'relevance';
}

interface UseFilteredProductsReturn {
  results: Product[];
  resultCount: number;
  isPending: boolean; // true while React is still rendering the deferred update
  updateFilter: (patch: Partial<FilterState>) => void;
}

export function useFilteredProducts(allProducts: Product[], initial: FilterState): UseFilteredProductsReturn {
  const [filters, setFilters] = useState<FilterState>(initial);

  // isPending: true between the transition start and the committed render.
  // Use this to show a skeleton or dim the results list — never a full spinner
  // (that would cause CLS and look broken mid-interaction).
  const [isPending, startTransition] = useTransition();

  // useMemo: the filter+sort computation runs inside the transition render.
  // React can interrupt and restart this if the user types again.
  const results = useMemo(() => {
    const { query, priceRange, activeFilters, sortOrder } = filters;

    const q = query.toLowerCase();
    const filtered = allProducts.filter(p => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (p.priceCents < priceRange[0] || p.priceCents > priceRange[1]) return false;
      if (activeFilters.length && !activeFilters.some(f => p.tags.includes(f))) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortOrder === 'price') return a.priceCents - b.priceCents;
      if (sortOrder === 'name') return a.name.localeCompare(b.name);
      return 0; // relevance: preserve filter order
    });
  }, [filters, allProducts]);

  function updateFilter(patch: Partial<FilterState>) {
    // ✅ The state update inside startTransition is marked low-priority.
    // React will yield to the browser between component renders in the tree.
    // If the user types another character before this finishes, React
    // abandons this render and starts fresh with the newer state.
    startTransition(() => {
      setFilters(prev => ({ ...prev, ...patch }));
    });
  }

  return {
    results,
    resultCount: results.length,
    isPending,
    updateFilter,
  };
}
