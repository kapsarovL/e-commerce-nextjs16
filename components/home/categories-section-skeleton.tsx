export function CategoriesSectionSkeleton() {
  return (
    <section className="border-border bg-muted/40 w-full border-t" aria-label="Categories loading">
      <div className="mx-auto w-full max-w-7xl px-4 py-16">
        <h2 className="mb-8 text-2xl font-bold tracking-tight">Shop by category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="border-border bg-background animate-pulse rounded-2xl border p-5"
              aria-hidden="true"
            >
              <div className="bg-muted h-4 w-3/4 rounded" />
              <div className="bg-muted mt-2 h-3 w-full rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
