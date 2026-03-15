'use client';

import { useTransition } from 'react';
import { toggleProductPublished } from '@/lib/actions/admin';
import { Loader2 } from 'lucide-react';

interface Props {
  productId: string;
  isPublished: boolean;
}

export function TogglePublishedButton({ productId, isPublished }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => toggleProductPublished(productId, isPublished))}
      disabled={isPending}
      className="flex items-center gap-1.5 disabled:opacity-50"
      aria-label={isPublished ? 'Unpublish product' : 'Publish product'}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            isPublished ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
          }`}
        >
          {isPublished ? 'Yes' : 'No'}
        </span>
      )}
    </button>
  );
}
