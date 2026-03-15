import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto flex flex-col items-center gap-6 px-4 py-32 text-center">
      <p className="text-muted-foreground/30 text-8xl font-black select-none">404</p>
      <div>
        <h1 className="mb-2 text-3xl font-bold">Page not found</h1>
        <p className="text-muted-foreground max-w-sm">This page doesn't exist or may have been moved.</p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products">Browse products</Link>
        </Button>
      </div>
    </div>
  );
}
