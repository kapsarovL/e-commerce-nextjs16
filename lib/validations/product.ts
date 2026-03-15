import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { products } from '@/lib/db/schema';

export const selectProductSchema = createSelectSchema(products);
export const insertProductSchema = createInsertSchema(products, {
  name: s => s.min(1).max(255),
  slug: s => s.regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  priceCents: s => s.int().positive(),
  stockQuantity: s => s.int().min(0),
});

export type Product = z.infer<typeof selectProductSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
