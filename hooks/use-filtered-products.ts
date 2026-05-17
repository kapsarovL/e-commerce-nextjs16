'use client'

import { useState, useTransition, useCallback, useEffect } from 'react'
import type { Product } from '@/types'

interface FilterOptions {
  query: string
  activeFilters: string[]
  priceRange: [number, number]
  sortOrder: 'relevance' | 'price' | 'name'
}

export function useFilteredProducts(
  products: Product[],
  initialOptions: Partial<FilterOptions> = {}
) {
  const defaultOptions: FilterOptions = {
    query: '',
    activeFilters: [],
    priceRange: [0, 10000],
    sortOrder: 'relevance',
    ...initialOptions,
  }

  const [options, setOptions] = useState<FilterOptions>(defaultOptions)
  const [results, setResults] = useState<Product[]>(products)
  const [isPending, startTransition] = useTransition()

  // Debounce filter changes to reduce re-computations
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        let filtered = products.filter(p =>
          p.name.toLowerCase().includes(options.query.toLowerCase()) &&
          (options.activeFilters.length === 0 ||
            p.tags.some(t => options.activeFilters.includes(t))) &&
          p.price >= options.priceRange[0] &&
          p.price <= options.priceRange[1]
        )

        // Sort based on sortOrder
        if (options.sortOrder === 'price') {
          filtered.sort((a, b) => a.price - b.price)
        } else if (options.sortOrder === 'name') {
          filtered.sort((a, b) => a.name.localeCompare(b.name))
        }
        // 'relevance' = maintain original order

        setResults(filtered)
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [options, products])

  const updateFilter = useCallback((updates: Partial<FilterOptions>) => {
    setOptions(prev => ({ ...prev, ...updates }))
  }, [])

  return {
    results,
    resultCount: results.length,
    isPending,
    options,
    updateFilter,
  }
}
