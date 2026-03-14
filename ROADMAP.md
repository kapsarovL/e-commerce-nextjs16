# Roadmap

A high-level overview of planned work. Items are roughly ordered by priority and subject to change.

---

## In Progress

- [ ] Authentication — Clerk integration with sign-in, sign-up, and user profile
- [ ] Database schema — Drizzle ORM with Neon Postgres (users, products, orders, addresses)
- [ ] CI pipeline — type check, lint, test, and preview deploy on every PR

---

## Up Next

### Core Shopping Experience

- [ ] Product catalog — listing page with filtering and sorting
- [ ] Product detail page — images, variants (size/color), stock status
- [ ] Cart — add/remove items, quantity controls, persisted via SWR + server state
- [ ] Checkout flow — address, shipping, payment (Stripe)

### Payments

- [ ] Stripe Checkout integration
- [ ] Webhook handler for `payment_intent.succeeded` and `charge.refunded`
- [ ] Order confirmation email via Resend

### User Account

- [ ] Order history page
- [ ] Address book management
- [ ] Profile settings synced with Clerk

---

## Planned

### Admin

- [ ] Product management (create, edit, archive)
- [ ] Order management (status updates, refunds)
- [ ] Basic analytics dashboard (revenue, orders, top products)

### Performance & Quality

- [ ] Image optimization with `next/image` and Cloudinary or Vercel Blob
- [ ] ISR / on-demand revalidation for product pages
- [ ] E2E tests with Playwright for critical checkout path
- [ ] Lighthouse CI score targets (performance ≥ 90, accessibility ≥ 95)

### Infrastructure

- [ ] Staging environment on Vercel
- [ ] Database migrations workflow with `drizzle-kit`
- [ ] Error monitoring with Sentry

---

## Icebox

- Wishlist / saved items
- Product reviews and ratings
- Discount codes and promotions
- Multi-currency support
- Internationalization (i18n)
