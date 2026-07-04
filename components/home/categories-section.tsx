import Link from 'next/link';
import { getCategories } from '@/lib/db/queries';

export async function CategoriesSection() {
  const categories = await getCategories();

  if (categories.length === 0) return null;

  return (
    <section className="border-border bg-muted/40 w-full border-t">
      <div className="mx-auto w-full max-w-7xl px-4 py-16">
        <h2 className="mb-8 text-2xl font-bold tracking-tight">Shop by category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="border-border bg-background hover:border-primary/50 hover:bg-primary/5 group flex flex-col gap-1 rounded-2xl border p-5 transition-colors"
            >
              <p className="text-foreground font-medium group-hover:underline">{cat.name}</p>
              {cat.description && <p className="text-muted-foreground line-clamp-2 text-xs">{cat.description}</p>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
