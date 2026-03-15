'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onSearch?: () => void;
}

export function SearchBar({
  placeholder = 'Search products…',
  className = '',
  autoFocus,
  onSearch,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(searchParams.get('search') ?? '');

  useEffect(() => {
    setValue(searchParams.get('search') ?? '');
  }, [searchParams]);

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    const query = value.trim();
    if (!query) return;
    router.push(`/search?search=${encodeURIComponent(query)}`);
    onSearch?.();
  };

  const handleClear = () => {
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} role="search" className={`relative flex items-center ${className}`}>
      <Search className="text-muted-foreground pointer-events-none absolute left-3 h-4 w-4" aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-label="Search products"
        className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring h-9 w-full rounded-lg border py-2 pr-9 pl-9 text-sm outline-none transition-shadow focus:ring-2 focus:ring-offset-1"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="text-muted-foreground hover:text-foreground absolute right-3 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </form>
  );
}
