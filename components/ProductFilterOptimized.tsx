'use client'

import { useFilteredProducts } from '@/hooks/useFilteredProducts'

interface Product {
  id: string
  name: string
  price: number
  tags: string[]
}

export function ProductFilterOptimized({ products }: { products: Product[] }) {
  const {
    results,
    resultCount,
    isPending,
    options,
    handleQueryChange,
    handleFilterChange,
    handlePriceChange,
    handleSortChange,
  } = useFilteredProducts(products)

  const allTags = Array.from(
    new Set(products.flatMap(p => p.tags))
  )

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div>
        <input
          type="text"
          value={options.query}
          onChange={e => handleQueryChange(e.target.value)}
          placeholder="Search products..."
          className="w-full px-4 py-2 border rounded"
          disabled={isPending}
        />
        {isPending && (
          <div className="text-sm text-gray-500 mt-1">
            ⏳ Filtering {resultCount.toLocaleString()} items...
          </div>
        )}
      </div>

      {/* Filter tags */}
      <div className="space-y-2">
        <h3 className="font-semibold">Filters</h3>
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => {
                const updated = options.activeFilters.includes(tag)
                  ? options.activeFilters.filter(t => t !== tag)
                  : [...options.activeFilters, tag]
                handleFilterChange(updated)
              }}
              className={`px-3 py-1 rounded text-sm transition ${
                options.activeFilters.includes(tag)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
              disabled={isPending}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="space-y-2">
        <label className="font-semibold">
          Price: ${options.priceRange[0]} - ${options.priceRange[1]}
        </label>
        <input
          type="range"
          min="0"
          max="10000"
          value={options.priceRange[1]}
          onChange={e =>
            handlePriceChange([options.priceRange[0], parseInt(e.target.value)])
          }
          className="w-full"
          disabled={isPending}
        />
      </div>

      {/* Sort order */}
      <div className="space-y-2">
        <h3 className="font-semibold">Sort by</h3>
        <select
          value={options.sortOrder}
          onChange={e =>
            handleSortChange(e.target.value as 'price' | 'name')
          }
          className="w-full px-3 py-2 border rounded"
          disabled={isPending}
        >
          <option value="name">Name (A-Z)</option>
          <option value="price">Price (Low to High)</option>
        </select>
      </div>

      {/* Results */}
      <div className="mt-6">
        <h3 className="font-semibold">
          Results: {resultCount.toLocaleString()}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {results.map(product => (
            <div
              key={product.id}
              className="p-4 border rounded hover:shadow-lg transition"
            >
              <h4 className="font-semibold">{product.name}</h4>
              <p className="text-lg font-bold text-blue-600">${product.price}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {product.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-100 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
