function SkeletonCard() {
  return (
    <div className="border-border bg-card animate-pulse overflow-hidden rounded-xl border" aria-hidden="true">
      <div className="bg-muted aspect-square" />
      <div className="flex flex-col gap-2 p-3">
        <div className="bg-muted h-4 w-4/5 rounded" />
        <div className="bg-muted h-4 w-1/3 rounded" />
      </div>
    </div>
  );
}

export function FeaturedProductsSkeleton() {
  return (
    <section className="w-full" aria-label="Featured products loading">
      <div className="mx-auto w-full max-w-7xl px-4 py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Featured</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
