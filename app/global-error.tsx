'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center font-sans">
        <p className="text-muted-foreground/30 text-6xl font-black">500</p>
        <div>
          <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">
            An unexpected error occurred. If this keeps happening, please contact support.
          </p>
          {error.digest && <p className="text-muted-foreground/60 mt-2 font-mono text-xs">Error ID: {error.digest}</p>}
        </div>
        <Button onClick={reset}>Try again</Button>
      </body>
    </html>
  );
}
