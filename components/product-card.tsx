'use client'

import { useTransition } from 'react'
import { postTask } from '@/lib/scheduler'
import { useCartStore } from '@/stores/cart'
import { track } from '@/lib/analytics'
import { prefetchRoute } from '@/lib/prefetch'
import type { Product } from '@/types'

interface Props {
  product: Product
}

export function ProductCard({ product }: Props) {
  const addItem = useCartStore(s => s.addItem)
  const [isPending, startTransition] = useTransition()

  async function handleAddToCart() {
    // ── Phase 1: user-blocking priority ──────────────────────────────────────
    // Update cart badge immediately — this is what the user is waiting for.
    // Runs synchronously on the current task (no yielding).
    addItem({ productId: product.id, price: product.price, quantity: 1 })

    // ── Phase 2: user-visible priority ───────────────────────────────────────
    // Trigger the React re-render for the cart drawer.
    // Deferred — browser can paint the badge update first.
    startTransition(() => {
      // Any state updates here re-render at lower priority
    })

    // ── Phase 3: background priority ─────────────────────────────────────────
    // Analytics, prefetch, cache sync — none of this affects what the user sees.
    // Schedule as background tasks: they run when the main thread is idle.
    await postTask(
      () => track('add_to_cart', { productId: product.id, price: product.price }),
      { priority: 'background' }
    )

    await postTask(
      () => prefetchRoute(`/checkout`),
      { priority: 'background' }
    )
  }

  return (
    <div>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button
        onClick={handleAddToCart}
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? 'Adding...' : 'Add to cart'}
      </button>
    </div>
  )
}
