'use client';

import { useActionState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { createProduct, updateProduct } from '@/lib/actions/admin';

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  action: typeof createProduct | ((id: string, fd: FormData) => ReturnType<typeof updateProduct>);
  categories: Category[];
  defaultValues?: {
    name?: string;
    slug?: string;
    description?: string;
    priceCents?: number;
    comparePriceCents?: number;
    categoryId?: string | null;
    stockQuantity?: number;
    lowStockThreshold?: number;
    isPublished?: boolean;
    isFeatured?: boolean;
    tags?: string[];
  };
  submitLabel?: string;
}

type ActionResult = { success: boolean; errors?: Record<string, string[]>; productId?: string };

const initialState: ActionResult = { success: false };

export function ProductForm({
  action,
  categories,
  defaultValues = {},
  submitLabel = 'Save product',
}: ProductFormProps) {
  const [state, dispatch, isPending] = useActionState<ActionResult, FormData>(
    action as (state: ActionResult, fd: FormData) => Promise<ActionResult>,
    initialState,
  );

  return (
    <form action={dispatch} className="max-w-2xl space-y-8">
      {/* Global form error */}
      {state.errors?._form && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.errors._form[0]}</AlertDescription>
        </Alert>
      )}

      {/* Basic info */}
      <fieldset className="space-y-4">
        <legend className="text-muted-foreground mb-4 text-sm font-semibold tracking-wide uppercase">Basic info</legend>

        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" required maxLength={255} defaultValue={defaultValues.name} />
          {state.errors?.name && <p className="text-destructive text-xs">{state.errors.name[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            name="slug"
            required
            maxLength={280}
            pattern="[a-z0-9-]+"
            placeholder="my-product-name"
            defaultValue={defaultValues.slug}
          />
          <p className="text-muted-foreground text-xs">Lowercase letters, numbers and hyphens only.</p>
          {state.errors?.slug && <p className="text-destructive text-xs">{state.errors.slug[0]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            maxLength={5000}
            defaultValue={defaultValues.description}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <Select name="categoryId" defaultValue={defaultValues.categoryId ?? undefined}>
            <SelectTrigger id="categoryId">
              <SelectValue placeholder="No category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No category</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            name="tags"
            placeholder="new-arrival, sale, summer"
            defaultValue={defaultValues.tags?.join(', ')}
          />
          <p className="text-muted-foreground text-xs">Comma-separated list.</p>
        </div>
      </fieldset>

      {/* Pricing */}
      <fieldset className="space-y-4">
        <legend className="text-muted-foreground mb-4 text-sm font-semibold tracking-wide uppercase">Pricing</legend>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priceCents">Price (cents) *</Label>
            <Input
              id="priceCents"
              name="priceCents"
              type="number"
              min={1}
              required
              placeholder="1999"
              defaultValue={defaultValues.priceCents}
            />
            <p className="text-muted-foreground text-xs">$19.99 → 1999</p>
            {state.errors?.priceCents && <p className="text-destructive text-xs">{state.errors.priceCents[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comparePriceCents">Compare price (cents)</Label>
            <Input
              id="comparePriceCents"
              name="comparePriceCents"
              type="number"
              min={0}
              placeholder="2999"
              defaultValue={defaultValues.comparePriceCents ?? ''}
            />
            <p className="text-muted-foreground text-xs">Shown as original/strikethrough price.</p>
          </div>
        </div>
      </fieldset>

      {/* Inventory */}
      <fieldset className="space-y-4">
        <legend className="text-muted-foreground mb-4 text-sm font-semibold tracking-wide uppercase">Inventory</legend>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stockQuantity">Stock quantity</Label>
            <Input
              id="stockQuantity"
              name="stockQuantity"
              type="number"
              min={0}
              defaultValue={defaultValues.stockQuantity ?? 0}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lowStockThreshold">Low stock threshold</Label>
            <Input
              id="lowStockThreshold"
              name="lowStockThreshold"
              type="number"
              min={0}
              defaultValue={defaultValues.lowStockThreshold ?? 5}
            />
            <p className="text-muted-foreground text-xs">Show warning badge below this quantity.</p>
          </div>
        </div>
      </fieldset>

      {/* Visibility */}
      <fieldset className="space-y-4">
        <legend className="text-muted-foreground mb-4 text-sm font-semibold tracking-wide uppercase">Visibility</legend>

        <div className="flex items-center gap-3">
          <Switch id="isPublished" name="isPublished" defaultChecked={defaultValues.isPublished} />
          <Label htmlFor="isPublished">Published — visible in the catalog</Label>
        </div>

        <div className="flex items-center gap-3">
          <Switch id="isFeatured" name="isFeatured" defaultChecked={defaultValues.isFeatured} />
          <Label htmlFor="isFeatured">Featured — shown in homepage grid</Label>
        </div>
      </fieldset>

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
