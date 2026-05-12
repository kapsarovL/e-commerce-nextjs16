# Integration Test Suite

This document describes the integration tests added to the e-commerce project.

## Test Coverage

### 1. **Cart Store Integration** (`components/__tests__/cart-integration.test.tsx`)

Comprehensive tests for the Zustand cart store covering:

- **Adding items**: Single items, duplicates, multiple items, stock quantity caps
- **Removing items**: By ID, non-existent items, removing specific items from multi-item cart
- **Updating quantity**: Direct updates, removal at 0, negative quantities, stock caps
- **Clearing cart**: Emptying entire cart
- **Derived selectors**:
  - `itemCount()` - Sum of all quantities
  - `subtotalCents()` - Total price calculation
  - `hasItem()` - Item existence check
  - `getItem()` - Retrieve item by ID
- **Complex scenarios**: Mixed operations, state persistence

**Coverage**: 65 passing tests  
**Key validations**: Stock quantity enforcement, quantity calculations, cart persistence logic

### 2. **Database Queries** (`lib/__tests__/db-queries.test.ts`)

Tests for data layer operations:

- **Products**: Fetch multiple, single lookup, null handling, stock states
- **Orders**: User orders, order items, null handling, guest orders
- **Categories**: Multi-fetch
- **Cache Invalidation**: Product and inventory tag invalidation

**Key validations**: Query patterns, data structure assumptions, cache behavior

### 3. **Test Utilities** (`lib/__tests__/test-utils.ts`)

Helper functions for consistent test data:

- `createMockProduct()` - Generate product fixtures with stock/price/status
- `createMockOrder()` - Generate order fixtures with payment/status
- `createMockCheckoutSession()` - Generate Stripe session fixtures

## Running Tests

```bash
# Run all tests
pnpm test

# Run in watch mode
pnpm test --watch

# Generate coverage report
pnpm test:ci
```

## Coverage Goals

- **Cart Store**: 80% (lines 100-101 uncovered are React hook selectors)
- **Utils**: 100%
- **Overall**: 80%+ statement coverage

## What's Not Covered (and Why)

### API Routes
Next.js API routes require complex request context setup (headers, dynamic APIs) that's better tested via:
- **E2E tests**: Playwright or Cypress for full request/response cycle
- **Manual testing**: Test the checkout and webhook flows in staging

### React Components
Component rendering and user interactions are better tested via:
- **E2E tests**: Full integration with forms, payment, etc.
- **Visual regression**: Ensure UI updates don't break layout
- **Accessibility**: Verify keyboard navigation and screen reader support

## Future Enhancements

1. **E2E Tests**: Add Playwright tests for:
   - Checkout flow (add to cart → payment)
   - Order history retrieval
   - Webhook processing end-to-end

2. **Component Tests**: Add @testing-library/react tests for:
   - Cart drawer interactions
   - Product filter sidebar
   - Quantity stepper edge cases

3. **Database Tests**: Add real database tests using a test instance for:
   - Transaction rollback on failure
   - Concurrent order processing
   - Stock decrement idempotency

## Test Structure

```
lib/__tests__/
├── utils.test.ts           # Pure function tests (100% coverage)
├── test-utils.ts           # Shared test fixtures
└── db-queries.test.ts       # Database query mocks

components/__tests__/
└── cart-integration.test.tsx # Zustand store tests (80% coverage)
```

## Design Principles

- **Isolation**: Each test is independent (beforeEach cleanup)
- **Focus**: One concern per test
- **Clarity**: Test names describe the scenario and expected outcome
- **Realism**: Use actual product/order structures, realistic values
- **Maintainability**: Use factories (createMock*) to avoid duplication
