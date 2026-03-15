import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Admin — Categories' };

export default async function AdminCategoriesPage() {
  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
    })
    .from(categories)
    .orderBy(asc(categories.name));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-muted-foreground mt-1 text-sm">{allCategories.length} total</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-muted-foreground text-left">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Slug</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {allCategories.map(cat => (
                  <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{cat.name}</td>
                    <td className="text-muted-foreground px-4 py-3 font-mono text-xs">{cat.slug}</td>
                    <td className="text-muted-foreground px-4 py-3">{cat.description ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allCategories.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-muted-foreground text-sm">No categories yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
