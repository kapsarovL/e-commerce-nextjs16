// components/hero.tsx — correct LCP image setup

// ✅ Using next/image: set priority={true}.
// This automatically adds fetchpriority="high" AND a <link rel="preload"> in <head>.
// It also disables lazy loading for this image (loading="eager" is implied).
import Image from 'next/image'

export function Hero() {
  return (
    <section>
      <Image
        src="/images/hero.jpg"
        alt="Hero banner"
        width={1440}
        height={600}
        // This single prop does THREE things:
        // 1. fetchpriority="high" on the <img> element
        // 2. <link rel="preload" fetchpriority="high"> injected into <head>
        // 3. loading="eager" (disables lazy load)
        priority
        // sizes tells the browser which image to fetch at which viewport width.
        // Without this, it fetches the largest variant regardless of screen size.
        sizes="100vw"
      />
    </section>
  )
}
