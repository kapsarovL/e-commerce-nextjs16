# [project-name]

> One-sentence description of what this project does and why it exists.

[![Tests](https://github.com/[username]/[repo]/actions/workflows/ci-test.yml/badge.svg)](https://github.com/[username]/[repo]/actions/workflows/ci-test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-blue)](https://[project].vercel.app)

---

## What This Does

2–3 sentences. Focus on the problem solved, not the tech used. A visitor should understand the value in under 10 seconds.

**Example:** _"This storefront handles the full e-commerce loop — product browsing, cart management, and Stripe checkout — with sub-100ms page loads via aggressive server-side caching and zero client-side data fetching for the catalog."_

---

## Technical Highlights

> The most important section for portfolio repos. Explain the decisions that make this codebase worth reading.

- **`use cache` + `cacheTag()` for per-function cache control** — product detail pages cache for 10 minutes independently of the catalog, which revalidates in 5. Stripe webhooks bust only the affected product tags, not the whole cache.

- **Server Component–first architecture with client islands** — the product catalog page ships zero client JS for the grid itself. `"use client"` is added only at the interactive leaf: cart button, quantity stepper, filter sidebar.

- **Prices stored as integer cents throughout** — DB, cart store, Stripe API, and display layer all operate on the same unit. No float division, no precision bugs at the payment boundary.

- **Order items snapshot product data at purchase time** — names, prices, and images are stored on the order row, not referenced live. Historical orders remain accurate if a product is updated or deleted.

- **Idempotent webhook handlers** — Stripe and Clerk webhooks use upsert/conditional-update patterns so repeated delivery of the same event is safe without duplicate side-effects.

---

## Features

- Product catalog with category filtering, price range, in-stock toggle, and sort
- Product detail pages with image gallery, structured data (JSON-LD), and static generation
- Client-side cart with `sessionStorage` persistence and real-time stock guards
- Guest checkout and authenticated checkout flows
- Stripe Checkout integration with webhook-driven order fulfillment
- Clerk authentication with sign-in/sign-up and protected account routes
- Order history page with full item snapshots
- Three-stage CI pipeline: test → preview deploy → production deploy

---

## Tech Stack

| Layer           | Technology                                        |
| --------------- | ------------------------------------------------- |
| Framework       | Next.js 16 (canary) · App Router · React 19       |
| Language        | TypeScript 5.6 · strict mode                      |
| Styling         | Tailwind CSS v4 · Shadcn/ui                       |
| Database        | Neon (serverless Postgres)                        |
| ORM             | Drizzle ORM                                       |
| Auth            | Clerk                                             |
| Payments        | Stripe                                            |
| State           | Zustand (cart) · Server Components (server state) |
| Validation      | Zod                                               |
| Testing         | Vitest · Testing Library                          |
| CI/CD           | GitHub Actions · Vercel                           |
| Package manager | pnpm 9                                            |

---

## Prerequisites

| Tool    | Version                         |
| ------- | ------------------------------- |
| Node.js | 22 LTS (via `mise use node@22`) |
| pnpm    | 9.x                             |
| mise    | latest                          |

---

## Getting Started

**1. Clone and install**

```bash
git clone git@github.com:[username]/storefront.git
cd storefront
pnpm install
```

**2. Configure environment**

```bash
cp .env.example .env.local
# Fill in all values — see Environment Variables below
```

**3. Push database schema**

```bash
pnpm db:push
```

**4. Start dev server**

```bash
pnpm dev
# → http://localhost:3000
```

---

## Environment Variables

| Variable                             | Description                                  | Required |
| ------------------------------------ | -------------------------------------------- | -------- |
| `DATABASE_URL`                       | Neon connection string                       | ✓        |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`  | Clerk publishable key                        | ✓        |
| `CLERK_SECRET_KEY`                   | Clerk secret key                             | ✓        |
| `CLERK_WEBHOOK_SECRET`               | Clerk webhook signing secret                 | ✓        |
| `STRIPE_SECRET_KEY`                  | Stripe secret key                            | ✓        |
| `STRIPE_WEBHOOK_SECRET`              | Stripe webhook signing secret                | ✓        |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key                       | ✓        |
| `NEXT_PUBLIC_APP_URL`                | App base URL (`http://localhost:3000` local) | ✓        |

---

## Available Scripts

| Script             | What it does                           |
| ------------------ | -------------------------------------- |
| `pnpm dev`         | Start development server               |
| `pnpm build`       | Production build                       |
| `pnpm type-check`  | TypeScript type check (`tsc --noEmit`) |
| `pnpm lint`        | ESLint — zero warnings policy          |
| `pnpm format`      | Prettier format all files              |
| `pnpm test`        | Vitest in watch mode                   |
| `pnpm test:ci`     | Vitest single run + coverage report    |
| `pnpm db:generate` | Generate Drizzle migration files       |
| `pnpm db:push`     | Push schema directly to DB (dev)       |
| `pnpm db:migrate`  | Run migrations (production)            |
| `pnpm db:studio`   | Open Drizzle Studio                    |

---

## Project Structure

```bash
storefront/
│
├── app/                            # Next.js App Router
│   ├── (auth)/                     # Clerk auth pages (sign-in, sign-up)
│   │   ├── sign-in/[[...sign-in]]/
│   │   └── sign-up/[[...sign-up]]/
│   │
│   ├── (shop)/                     # Public storefront — Server Components
│   │   ├── layout.tsx              #   Shell, navbar, footer
│   │   ├── page.tsx                #   Homepage / featured products
│   │   ├── products/
│   │   │   ├── page.tsx            #   Product catalog (filtered, paginated)
│   │   │   └── [slug]/page.tsx     #   Product detail + JSON-LD
│   │   └── search/page.tsx         #   Search results
│   │
│   ├── (account)/                  # Protected routes — requires Clerk session
│   │   ├── layout.tsx
│   │   └── orders/
│   │       ├── page.tsx            #   Order history
│   │       └── [id]/page.tsx       #   Order detail
│   │
│   ├── cart/page.tsx               # Client-rendered cart page
│   ├── checkout/
│   │   ├── page.tsx                # Checkout form (guest + auth)
│   │   └── success/page.tsx        # Post-payment confirmation
│   │
│   └── api/
│       ├── checkout/route.ts       # POST — creates Stripe session
│       └── webhooks/
│           ├── clerk/route.ts      # Syncs Clerk users → DB
│           └── stripe/route.ts     # Order fulfillment on payment events
│
├── components/
│   ├── ui/                         # Shadcn/ui generated components
│   │
│   ├── layout/
│   │   ├── navbar.tsx              # CC — cart badge, Clerk UserButton
│   │   └── footer.tsx              # SC
│   │
│   ├── product/
│   │   ├── product-card.tsx        # SC — image, name, price, badges
│   │   ├── product-grid.tsx        # SC — responsive grid + skeleton
│   │   ├── product-image-gallery.tsx  # CC — thumbnail switcher
│   │   ├── add-to-cart-button.tsx  # CC — stock-guarded cart action
│   │   ├── product-filters.tsx     # CC — sidebar category/price/stock
│   │   └── product-sort.tsx        # CC — sort select
│   │
│   ├── cart/
│   │   ├── cart-drawer.tsx         # CC — Sheet with cart contents
│   │   └── cart-item.tsx           # CC — quantity stepper, remove
│   │
│   └── checkout/
│       └── checkout-form.tsx       # CC — guest email, order summary, pay CTA
│
├── lib/
│   ├── db/
│   │   ├── index.ts                # Drizzle + Neon client (singleton)
│   │   ├── schema.ts               # All table definitions + relations
│   │   ├── queries.ts              # "use cache" data-fetching functions
│   │   └── invalidate.ts           # revalidateTag() Server Actions
│   │
│   ├── stripe.ts                   # Stripe client singleton
│   ├── utils.ts                    # cn(), formatPrice(), stock helpers
│   └── validations/
│       ├── product.ts              # Zod schemas (product)
│       ├── order.ts                # Zod schemas (order + items)
│       └── checkout.ts             # Zod schemas (checkout form)
│
├── store/
│   └── cart.ts                     # Zustand store — cart state + selectors
│
├── middleware.ts                   # Clerk route protection
├── drizzle.config.ts               # Drizzle Kit config
├── next.config.ts
├── vitest.config.ts
├── commitlint.config.js
├── .env.example
└── package.json
```

**SC = Server Component** (default, no JS bundle cost)
**CC = Client Component** (`"use client"` — interactive islands only)

### Key boundaries

```bash
Page (SC)
└── ProductGrid (SC)
    └── ProductCard (SC)
        └── AddToCartButton (CC)  ← only this crosses the boundary
```

The cart badge in the Navbar, the quantity stepper in CartItem, and the filter sidebar are the only other CC islands. Everything else — catalog, product detail, order history — is server-rendered with no client JS.

---

## Architecture Decisions

| Decision                 | Rationale                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `use cache` per-function | Fine-grained invalidation — one `cacheTag` bust revalidates only pages that depend on it, not the entire site.                 |
| Integer cents for prices | No float division anywhere. Stripe, DB, cart store, and display all use the same unit.                                         |
| Snapshotted order items  | Orders reference snapshotted names and prices, not live rows. Accurate regardless of future product changes.                   |
| Guest checkout           | Nullable `userId` on orders with `guestEmail` fallback. Removing the sign-in gate is a measurable conversion rate improvement. |
| Clerk over Auth.js       | Clerk manages the auth session surface entirely. The local `users` table only exists to own relational data (orders).          |
| Idempotent webhooks      | Both Clerk and Stripe can deliver the same event multiple times. All handlers use upsert / conditional update patterns.        |

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide: setup, branching, commit conventions, test patterns, and PR checklist.

---

_Built by [Lazar Kapsarov](https://lazarkapsarov.com) · [PrismaFlux Media](https://prismaflux.media)_
