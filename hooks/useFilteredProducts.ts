'use client'

import { useState, useTransition, useCallback, useEffect } from 'react'

interface Product {
  id: string
  name: string
  price: number
  tags: string[]
}

interface FilterOptions {
  query: string
  activeFilters: string[]
  priceRange: [number, number]
  sortOrder: 'price' | 'name'
}

export function useFilteredProducts(allProducts: Product[]) {
  const [options, setOptions] = useState<FilterOptions>({
    query: '',
    activeFilters: [],
    priceRange: [0, 10000],
    sortOrder: 'price',
  })

  const [results, setResults] = useState<Product[]>([])
  const [resultCount, setResultCount] = useState(0)
  const [isPending, startTransition] = useTransition()

  // Debounce filter changes to reduce re-computations
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        const filtered = allProducts.filter(p =>
          p.name.toLowerCase().includes(options.query.toLowerCase()) &&
          p.tags.some(t => options.activeFilters.includes(t)) &&
          p.price >= options.priceRange[0] &&
          p.price <= options.priceRange[1]
        )

        const sorted = filtered.sort((a, b) =>
          options.sortOrder === 'price'
            ? a.price - b.price
            : a.name.localeCompare(b.name)
        )

        setResults(sorted)
        setResultCount(sorted.length)
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [options, allProducts])

  const handleQueryChange = useCallback((query: string) => {
    setOptions(prev => ({ ...prev, query }))
  }, [])

  const handleFilterChange = useCallback((filters: string[]) => {
    setOptions(prev => ({ ...prev, activeFilters: filters }))
  }, [])

  const handlePriceChange = useCallback((range: [number, number]) => {
    setOptions(prev => ({ ...prev, priceRange: range }))
  }, [])

  const handleSortChange = useCallback((order: 'price' | 'name') => {
    setOptions(prev => ({ ...prev, sortOrder: order }))
  }, [])

  return {
    results,
    resultCount,
    isPending,
    options,
    handleQueryChange,
    handleFilterChange,
    handlePriceChange,
    handleSortChange,
  }
}
