# StoreFront

> Full-stack e-commerce storefront built with Next.js 16, React 19, and Stripe.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-blue)](https://e-commerce-nextjs16.vercel.app)

---

## What This Does

A production-ready storefront covering the full e-commerce loop — product browsing, cart management, and Stripe Checkout — with sub-100ms catalog pages via server-side `use cache` and zero client JS on the product grid. Guest and authenticated checkout are both supported.

---

## Technical Highlights

- **`use cache` + `cacheTag()` for per-function cache control** — product detail pages cache for 10 minutes independently of the catalog, which revalidates in seconds. Stripe webhooks bust only the affected product tags, not the whole cache.

- **Server Component–first architecture with client islands** — the product catalog page ships zero client JS for the grid itself. `"use client"` is added only at the interactive leaf: cart button, quantity stepper, filter sidebar.

- **Prices stored as integer cents throughout** — DB, cart store, Stripe API, and display layer all operate on the same unit. No float division, no precision bugs at the payment boundary.

- **Order items snapshot product data at purchase time** — names, prices, and images are stored on the order row, not referenced live. Historical orders remain accurate if a product is updated or deleted.

- **Idempotent webhook handlers** — Stripe and Clerk webhooks use upsert/conditional-update patterns so repeated delivery of the same event is safe without duplicate side-effects.

---

## Features

- Product catalog with category filtering, price range, in-stock toggle, and sort
- Quick-add to cart from the product grid (hover slide-up button)
- Product detail pages with image gallery, structured data (JSON-LD), and static generation
- Client-side cart with `sessionStorage` persistence and real-time stock guards
- Guest checkout and authenticated checkout flows
- Stripe Checkout integration with webhook-driven order fulfillment
- Clerk authentication with sign-in/sign-up and protected account routes
- Order history page with full item snapshots
- Browse catalog at `/search` with sidebar filters, active filter chips, pagination
- Admin overview dashboard at `/admin`

---

## Tech Stack

| Layer           | Technology                                        |
| --------------- | ------------------------------------------------- |
| Framework       | Next.js 16 · App Router · React 19                |
| Language        | TypeScript 5 · strict mode                        |
| Styling         | Tailwind CSS v4 · shadcn/ui                       |
| Database        | Neon (serverless Postgres)                        |
| ORM             | Drizzle ORM                                       |
| Auth            | Clerk                                             |
| Payments        | Stripe                                            |
| State           | Zustand v5 with Immer (cart)                      |
| Validation      | Zod                                               |
| Testing         | Vitest · Testing Library                          |
| CI/CD           | GitHub Actions · Vercel                           |
| Package manager | pnpm                                              |

---

## Prerequisites

| Tool    | Version  |
| ------- | -------- |
| Node.js | 22 LTS   |
| pnpm    | 10.x     |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/kapsarovL/e-commerce-nextjs16.git
cd e-commerce-nextjs16
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Fill in all values — see Environment Variables below
```

### 3. Push database schema

```bash
pnpm db:push
```

### 4. Seed sample data

```bash
pnpm db:seed
```

### 5. Start dev server

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
| `pnpm db:seed`     | Seed sample categories and products    |

---

## Project Structure

```text
e-commerce-nextjs16/
│
├── app/                            # Next.js App Router
│   ├── page.tsx                    # Homepage — hero, featured, categories
│   │
│   ├── (auth)/                     # Clerk auth pages
│   │   ├── sign-in/[[...sign-in]]/
│   │   └── sign-up/[[...sign-up]]/
│   │
│   ├── (shop)/                     # Public storefront — Server Components
│   │   ├── layout.tsx              #   Navbar + Footer shell
│   │   ├── products/
│   │   │   ├── page.tsx            #   Product catalog (filtered, paginated)
│   │   │   └── [slug]/page.tsx     #   Product detail + JSON-LD
│   │   └── search/page.tsx         #   Browse catalog with sidebar filters
│   │
│   ├── (account)/                  # Protected routes — requires Clerk session
│   │   ├── layout.tsx
│   │   ├── page.tsx                #   Account overview
│   │   └── orders/
│   │       ├── page.tsx            #   Order history
│   │       └── [id]/page.tsx       #   Order detail
│   │
│   ├── admin/                      # Admin dashboard
│   │   ├── page.tsx                #   Overview — revenue, orders, products
│   │   └── categories/page.tsx     #   Category management
│   │
│   ├── cart/page.tsx               # Cart summary page
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
│   ├── ui/                         # shadcn/ui primitives
│   │
│   ├── layout/
│   │   ├── navbar.tsx              # CC — search bar, cart badge, UserButton
│   │   ├── footer.tsx              # SC — links, copyright
│   │   └── search-bar.tsx          # CC — search input with URL sync
│   │
│   ├── product/
│   │   ├── product-grid.tsx        # SC — responsive grid, skeletons, quick-add
│   │   ├── product-image-gallery.tsx  # CC — thumbnail switcher
│   │   ├── add-to-cart-button.tsx  # CC — stock-guarded cart action
│   │   ├── product-filters.tsx     # CC — desktop sidebar + mobile sheet
│   │   └── product-sort.tsx        # CC — sort select
│   │
│   └── cart/
│       ├── cart-drawer.tsx         # CC — Sheet with cart contents
│       ├── cart-item.tsx           # CC — quantity stepper, remove
│       ├── cart-summary.tsx        # CC — full cart page with order panel
│       └── add-to-cart-button.tsx  # CC — default + quick-add variants
│
├── lib/
│   ├── db/
│   │   ├── index.ts                # Drizzle + Neon client
│   │   ├── schema.ts               # Table definitions + relations
│   │   ├── queries.ts              # `use cache` data-fetching functions
│   │   └── invalidate.ts           # revalidateTag() Server Actions
│   │
│   ├── stripe.ts                   # Stripe client singleton
│   ├── utils.ts                    # cn(), formatPrice()
│   └── validations/
│       ├── search-params.ts        # Zod schema for catalog URL params
│       ├── product.ts              # Zod schemas (product)
│       ├── order.ts                # Zod schemas (order + items)
│       └── checkout.ts             # Zod schemas (checkout form)
│
├── store/
│   └── cart.ts                     # Zustand store — cart state + selectors
│
├── scripts/
│   └── seed.ts                     # Sample categories + products seed script
│
├── proxy.ts                        # Clerk route protection (Next.js middleware)
├── drizzle.config.ts               # Drizzle Kit config
├── next.config.ts
├── .env.example
└── package.json
```

**SC = Server Component** · **CC = Client Component** (`"use client"` — interactive islands only)

### Key client/server boundary

```text
Page (SC)
└── ProductGrid (SC)
    └── ProductCard (SC)
        └── AddToCartButton (CC)  ← only this crosses the boundary
```

---

## Architecture Decisions

| Decision | Rationale |
| --- | --- |
| `use cache` per-function | Fine-grained invalidation — one `cacheTag` bust revalidates only pages that depend on it, not the entire site. |
| Integer cents for prices | No float division anywhere. Stripe, DB, cart store, and display all use the same unit. |
| Snapshotted order items | Orders store names and prices at purchase time. Accurate regardless of future product changes. |
| Guest checkout | Nullable `userId` on orders with `guestEmail` fallback. Removing the sign-in gate is a measurable conversion rate improvement. |
| Clerk over Auth.js | Clerk manages the auth session surface entirely. The local `users` table only exists to own relational data (orders). |
| Idempotent webhooks | Both Clerk and Stripe can deliver the same event multiple times. All handlers use upsert / conditional update patterns. |

---

_Built by [Lazar Kapsarov](https://lazarkapsarov.com) · [PrismaFlux Media](https://prismaflux.media)_
