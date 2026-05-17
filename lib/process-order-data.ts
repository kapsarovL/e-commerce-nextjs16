// lib/process-order-data.ts
// Example: processing a large dataset before displaying analytics
// This must NOT block the UI — the user might click other things while it runs.

import { yieldToMain } from '@/lib/scheduler'
import type { Order, OrderSummary } from '@/types'

// ─── Long computation broken into yielding chunks ─────────────────────────────

export async function processOrderData(
  orders: Order[],
  onProgress?: (pct: number) => void
): Promise<OrderSummary> {
  const CHUNK_SIZE = 100  // Process 100 orders per task
  const totals = {
    revenue: 0,
    count: 0,
    byProduct: new Map<string, number>(),
    byMonth: new Map<string, number>(),
  }

  for (let i = 0; i < orders.length; i += CHUNK_SIZE) {
    const chunk = orders.slice(i, i + CHUNK_SIZE)

    // Synchronous work within one chunk — fast enough to not block
    for (const order of chunk) {
      totals.revenue += order.total
      totals.count++

      for (const item of order.items) {
        const prev = totals.byProduct.get(item.productId) ?? 0
        totals.byProduct.set(item.productId, prev + item.quantity)
      }

      const month = order.createdAt.toISOString().slice(0, 7)
      totals.byMonth.set(month, (totals.byMonth.get(month) ?? 0) + 1)
    }

    onProgress?.(Math.round(((i + CHUNK_SIZE) / orders.length) * 100))

    // ✅ Yield after every chunk.
    // The browser gets a frame to handle any pending clicks/input
    // before we continue with the next chunk.
    await yieldToMain()
  }

  return {
    totalRevenue: totals.revenue,
    orderCount: totals.count,
    topProducts: [...totals.byProduct.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([productId, qty]) => ({ productId, qty })),
    monthlyBreakdown: Object.fromEntries(totals.byMonth),
  }
}
