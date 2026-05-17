'use client'

import { useFilteredProducts } from '@/hooks/useFilteredProducts'
import type { Product } from '@/types'

interface Props {
  products: Product[]
}

export function ProductFilter({ products }: Props) {
  const { results, resultCount, isPending, updateFilter } = useFilteredProducts(
    products,
    { query: '', priceRange: [0, 10000], activeFilters: [], sortOrder: 'relevance' }
  )

  return (
    <div className="space-y-4">
      <input
        type="search"
        placeholder="Search products..."
        onChange={e => updateFilter({ query: e.target.value })}
        className="w-full px-4 py-2 border rounded"
        // ✅ Input is never blocked — it updates immediately.
        // The results list update is what's deferred.
      />

      {/* ✅ Dim during transition — no layout shift, no spinner */}
      <div
        aria-busy={isPending}
        style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 150ms' }}
        className="space-y-3"
      >
        <p className="text-sm text-gray-600">
          {resultCount.toLocaleString()} result{resultCount !== 1 ? 's' : ''}
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(p => (
            <li
              key={p.id}
              className="p-4 border rounded hover:shadow-lg transition"
            >
              {p.image && (
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-48 object-cover rounded mb-2"
                />
              )}
              <h3 className="font-semibold text-lg">{p.name}</h3>
              {p.description && (
                <p className="text-sm text-gray-600 mt-1">{p.description}</p>
              )}
              <p className="text-lg font-bold text-blue-600 mt-2">
                ${p.price.toFixed(2)}
              </p>
              {p.tags && p.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
        {results.length === 0 && (
          <p className="text-center text-gray-500 py-8">No products found.</p>
        )}
      </div>
    </div>
  )
}
