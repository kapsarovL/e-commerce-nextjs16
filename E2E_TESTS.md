# End-to-End (E2E) Test Suite

This document describes the Playwright E2E tests for the e-commerce storefront.

## What This Tests

E2E tests validate full user workflows across the entire stack — browser rendering, client interactions, API routes, database operations, and external services (Stripe, Clerk). Unlike unit tests, these tests run against the live application.

## Test Suites

### 1. **Checkout Flow** (`e2e/checkout.spec.ts`)

Complete purchase journey from browsing to order completion.

**Tests covered:**

- Guest checkout flow (add to cart → fill form → place order)
- Add multiple items and update quantities
- Empty cart displays correct empty state
- Out of stock products are disabled/unavailable
- Checkout form validates required fields
- Cart persistence through page navigation

**Coverage**: 6 tests

**Key validations:**

- Product can be added from catalog
- Cart updates in real-time
- Form validation prevents incomplete submissions
- Stripe session creation succeeds

### 2. **Product Catalog** (`e2e/products.spec.ts`)

Product browsing, filtering, searching, and pagination.

**Tests covered:**

- Browse products with category filters
- Search products by name
- Filter by price range
- Sort products (price, popularity, newest)
- View product detail pages
- Image gallery navigation
- Pagination works correctly
- In-stock toggle filters products

**Coverage**: 8 tests

**Key validations:**

- Filters apply correctly and update results
- Search returns relevant products
- Product detail page loads with correct data
- Images and galleries render properly

### 3. **Authentication & Orders** (`e2e/auth-orders.spec.ts`)

Sign-in flow, protected routes, and order history.

**Tests covered:**

- Sign-in page loads (Clerk integration)
- Protected routes redirect unauthenticated users to sign-in
- Order history page displays user's orders
- Order detail page shows items and totals
- Account page displays user information
- Guest checkout email is remembered
- Guest checkout doesn't require sign-in

**Coverage**: 7 tests

**Key validations:**

- Clerk authentication integrates correctly
- Protected routes enforce auth requirements
- Order snapshots display accurate historical data
- Guest flow is frictionless

### 4. **API Integration** (`e2e/api-integration.spec.ts`)

API route functionality and real-time updates.

**Tests covered:**

- Checkout API creates valid Stripe session
- Product search API returns results
- Cart persists through page reload (sessionStorage)
- Invalid requests fail gracefully
- Stock updates reflect in real-time

**Coverage**: 5 tests

**Key validations:**

- API endpoints respond correctly
- Client-side caching/persistence works
- Error handling doesn't break the UI
- Network failures are handled gracefully

### 5. **Admin Dashboard** (`e2e/admin.spec.ts`)

Admin-only pages and functionality.

**Tests covered:**

- Dashboard displays overview metrics (revenue, orders, products)
- Navigation to categories page works
- Recent orders section displays data
- Product stats are calculated correctly
- Order filtering by status works

**Coverage**: 5 tests

**Key validations:**

- Admin routes are protected (redirect to sign-in)
- Dashboard metrics are accurate
- Admin filters and sorting work correctly

## Running Tests

### Development

```bash
# Run all E2E tests
pnpm test:e2e

# Run in UI mode (interactive, visual feedback)
pnpm test:e2e:ui

# Debug mode (slow-motion, inspector)
pnpm test:e2e:debug

# Run specific test file
pnpm test:e2e e2e/checkout.spec.ts

# Run tests matching a pattern
pnpm test:e2e --grep "checkout"
```

### CI/CD

```bash
# Runs all tests with retries, generates HTML report
pnpm test:e2e
```

## Configuration

**File**: `playwright.config.ts`

- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit
- **Auto-start**: Dev server (`pnpm dev`)
- **Retries**: 2 in CI, 0 in development
- **Parallelization**: Full parallel in dev, sequential in CI
- **Reporter**: HTML with trace recordings

## Test Data

E2E tests use the live database (seeded via `pnpm db:seed`). For isolated testing:

1. **Create test user** via Clerk sign-up
2. **Use test product IDs** from seed data
3. **Mock Stripe** using Stripe test mode (`pk_test_*`, `sk_test_*`)

## Best Practices

### ✅ DO

- Test complete user journeys, not individual interactions
- Wait for network/load state instead of fixed timeouts
- Use data-testid for stable element targeting
- Handle missing elements gracefully (use `.catch(() => false)`)
- Verify business outcomes (order created, email sent)

### ❌ DON'T

- Test internal implementation details
- Rely on element text or CSS selectors that change
- Use `page.waitForTimeout()` — use `waitForLoadState()` instead
- Mock the API — test the real API
- Assume UI structure — use semantic selectors

## Debugging

### View test execution in real-time

```bash
pnpm test:e2e:ui
```

### Run with inspector

```bash
pnpm test:e2e:debug
```

### View test traces and videos

```bash
# After test runs, open HTML report
npx playwright show-report
```

### Print debug info

```typescript
await page.evaluate(() => console.log('debug info'));
await page.screenshot({ path: 'debug.png' });
```

## Common Issues

### Tests timeout waiting for elements

**Solution**: Ensure dev server is running (`pnpm dev`) and database is seeded.

### Clerk sign-in not working

**Solution**: Clerk is running in test mode. Use test credentials or test user creation flow.

### Stripe integration fails

**Solution**: Use Stripe test mode keys (`pk_test_`, `sk_test_`). Live keys won't work in tests.

### Tests flake (pass/fail randomly)

**Solution**: Wait for network state explicitly:

```typescript
await page.waitForLoadState('networkidle');
```

## What's Not Covered (And Why)

### Visual Regression

UI screenshots and visual diffs are browser-dependent. Better tested with:

- **Percy.io** — visual regression as a service
- **Chromatic** — Storybook visual testing

### Accessibility (a11y)

Keyboard navigation and screen reader compatibility require:

- **axe-core** — automated a11y scanning
- **Manual testing** with screen readers

### Performance

Load times and Core Web Vitals need:

- **Lighthouse CI** — performance budgets
- **Web Vitals API** — real user monitoring

### Mobile-specific interactions

Mobile gesture testing requires:

- **Playwright mobile devices** — built-in emulation
- **Real device testing** via BrowserStack

## Future Enhancements

1. **Visual regression testing** with Percy
2. **Accessibility scanning** with axe-playwright
3. **Webhook testing** with ngrok or Webhook.cool
4. **Load testing** with k6 or Locust
5. **Mobile device testing** with Playwright mobile profiles
6. **Test data factories** for complex scenarios
7. **Authentication helpers** for pre-authenticated sessions
8. **Database reset** between tests for isolation

## CI/CD Integration

Add to your GitHub Actions or CI:

```yaml
- name: Run E2E tests
  run: pnpm test:e2e

- name: Upload test report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```

## Coverage Goals

- **User-critical flows**: 100% (checkout, sign-in, orders)
- **Product browsing**: 90% (search, filter, pagination)
- **Admin functionality**: 80% (dashboard, management)
- **API reliability**: 100% (success + error paths)

**Overall**: Full coverage of production user journeys

---

For unit test documentation, see [INTEGRATION_TESTS.md](INTEGRATION_TESTS.md).
