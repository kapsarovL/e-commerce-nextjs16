// ✅ Fixed: batch reads before writes inside useLayoutEffect

'use client'
import { useLayoutEffect, useRef } from 'react'

function CardGrid({ items }: { items: string[] }) {
  const refs = useRef<(HTMLDivElement | null)[]>([])

  useLayoutEffect(() => {
    const els = refs.current.filter((el): el is HTMLDivElement => el !== null)

    // Reset all to auto — one write batch, layout dirty once
    els.forEach(el => { el.style.height = 'auto' })

    // Read all measurements — one forced layout total
    const heights = els.map(el => el.offsetHeight)
    const widths  = els.map(el => el.offsetWidth)

    // Write all mutations — layout deferred to paint
    els.forEach((el, i) => {
      el.style.height = `${heights[i] + 20}px`
      el.style.width  = `${widths[i] * 0.9}px`
    })
  })

  return (
    <div>
      {items.map((item, i) => (
        <div key={item} ref={el => { refs.current[i] = el }}>
          {item}
        </div>
      ))}
    </div>
  )
}

export { CardGrid }
