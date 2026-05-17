// lib/analytics.ts
// Non-blocking analytics tracking

export function track(event: string, properties?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return

  const data = {
    event,
    properties: properties || {},
    timestamp: new Date().toISOString(),
  }

  // Send to analytics endpoint or service
  // This is a no-op placeholder — replace with your actual analytics implementation
  if (process.env.NODE_ENV === 'development') {
    console.log('[analytics]', data)
  }

  // Example: fetch('/api/analytics', { method: 'POST', body: JSON.stringify(data) })
}
