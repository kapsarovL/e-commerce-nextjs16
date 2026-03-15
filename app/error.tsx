'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Products page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-24 text-center">
      <AlertCircle className="text-destructive h-12 w-12" />
      <div>
        <h2 className="mb-2 text-2xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground max-w-md">
          We couldn't load the product catalog. This is usually a temporary issue.
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
