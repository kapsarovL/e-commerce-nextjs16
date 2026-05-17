// lib/prefetch.ts
// Route prefetching for faster navigation

export function prefetchRoute(route: string): void {
  if (typeof document === 'undefined') return

  // Create a link element for DNS prefetch + preconnect
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = route
  link.as = 'document'

  document.head.appendChild(link)
}
