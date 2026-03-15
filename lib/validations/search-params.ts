import { z } from 'zod';

export const productSearchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(24),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(['newest', 'oldest', 'price-asc', 'price-desc', 'name-asc', 'name-desc']).default('newest'),
  inStock: z.coerce.boolean().default(false),
});

export type ProductSearchParams = z.infer<typeof productSearchSchema>;
