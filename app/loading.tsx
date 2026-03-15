// app/(shop)/products/loading.tsx
import { ProductGridSkeleton } from '@/components/product/product-grid';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-2">
        <div className="bg-muted h-9 w-40 animate-pulse rounded" />
        <div className="bg-muted h-5 w-32 animate-pulse rounded" />
      </div>
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar skeleton */}
        <aside className="w-full shrink-0 space-y-4 lg:w-64">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-muted h-10 animate-pulse rounded" />
          ))}
        </aside>
        {/* Grid skeleton */}
        <div className="flex-1">
          <ProductGridSkeleton count={24} />
        </div>
      </div>
    </div>
  );
}
