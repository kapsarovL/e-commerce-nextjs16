# CONTRIBUTING

**storefront** · Next.js 16 · TypeScript · Drizzle · Clerk · Stripe

> Read this fully before opening a PR. PRs that skip these steps will be closed without review.

---

## 1. Development Setup

### Prerequisites

| Tool | Version | How to install |

|------|---------|----------------|
| Node.js | 22 LTS | `mise use node@22` |
| pnpm | 9.x | `npm install -g pnpm@9` |
| mise | latest | `curl https://mise.run \| sh` |
| Stripe CLI | latest | [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli) |

### First-time setup

```bash
git clone git@github.com:[username]/storefront.git
cd storefront

# Install dependencies
pnpm install

# Copy env file and fill in your values
cp .env.example .env.local

# Push DB schema to Neon
pnpm db:push

# Start dev server
pnpm dev
```

### Environment variables

Copy `.env.example` to `.env.local`. Required variables:

| Variable | Where to get it |

|----------|----------------|
| `DATABASE_URL` | Neon dashboard → Connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | Clerk dashboard → Webhooks → Signing Secret |
| `STRIPE_SECRET_KEY` | Stripe dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | `stripe listen --print-secret` (local dev) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe dashboard → Developers → API Keys |

> **Never commit `.env.local`.** It is already in `.gitignore`. The CI pipeline uses stubbed env values — see `ci-test.yml`.

---

## 2. Branching Strategy

All work happens on feature branches. Never commit directly to `main`.

| Branch pattern | Purpose | Example |

|----------------|---------|---------|
| `feat/short-description` | New user-facing feature | `feat/product-filters` |
| `fix/short-description` | Bug fix | `fix/cart-quantity-overflow` |
| `refactor/short-description` | Code restructure, no behaviour change | `refactor/queries-drizzle` |
| `docs/short-description` | Documentation only | `docs/update-readme` |
| `chore/short-description` | Deps, config, tooling | `chore/bump-stripe` |
| `ci/short-description` | GitHub Actions changes | `ci/add-preview-deploy` |

**Branch lifecycle:**

1. Branch from `main`
2. Open a draft PR immediately — it triggers preview deploy
3. Mark "Ready for review" when CI is green and the feature is complete
4. Squash-and-merge only — no merge commits on `main`

---

## 3. Commit Message Convention

This project enforces **Conventional Commits** via commitlint + Husky. Non-conforming commits are rejected at the pre-commit hook.

### Format

```bash
<type>(<scope>): <subject>

Examples:
  feat(cart): add quantity stepper with stock guard
  fix(checkout): handle null shipping address from Stripe
  chore(deps): bump drizzle-orm to 0.36.1
  test(utils): add formatPrice edge cases
```

| Type | When to use |

|------|-------------|
| `feat` | New feature visible to users |
| `fix` | Bug fix |
| `refactor` | Code restructure — no behaviour change |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `docs` | Documentation only |
| `chore` | Build config, dependency bumps |
| `ci` | GitHub Actions workflow changes |
| `revert` | Reverts a prior commit |

**Rules enforced:**

- Subject must be lowercase
- Subject must not end with a period
- Max header length: 100 characters
- Scope must be lowercase if provided

---

## 4. Code Standards

### TypeScript

- `strict: true` always — no exceptions
- Never use `any` — use `unknown` + type guard instead
- Exported functions must declare return types explicitly
- Zod for all external data validation (API responses, form inputs, webhook payloads)

### Components

- Server Components by default — add `"use client"` only when necessary
- Client Component islands should be as small as possible
- Props interfaces must be named (no inline anonymous types on components)
- Prefer Shadcn/ui components over custom-built when suitable

### Styling

- Tailwind CSS v4 utility classes only
- No arbitrary values unless genuinely unavoidable
- No inline styles

### Data fetching

- `"use cache"` on all data fetching functions in `lib/db/queries.ts`
- `cacheTag()` on every cached function — required for targeted invalidation
- Call invalidation functions from Server Actions or Route Handlers only — never inside cached functions
- `pnpm` only — never `npm` or `yarn`

---

## 5. Testing

All new utility functions and hooks must have tests. Components should have tests for non-trivial render logic.

### Running tests

```bash
# Watch mode (dev)
pnpm test

# Single run + coverage (what CI runs)
pnpm test:ci
```

### Three patterns

#### Pattern 1 — Utility function

Import the function, call it with known inputs, assert the output. No mocking required.

```ts
import { describe, it, expect } from 'vitest';
import { formatPrice } from '@/lib/utils';

describe('formatPrice', () => {
  it('formats cents to USD string', () => {
    expect(formatPrice(1099)).toBe('$10.99');
  });
  it('handles zero', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });
});
```

#### Pattern 2 — React component

Use `render()` from Testing Library, query by accessible role or text, assert presence.

```tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/product/product-card';

it('renders product name', () => {
  render(<ProductCard product={mockProduct} />);
  expect(screen.getByText('Mock Product')).toBeInTheDocument();
});
```

#### Pattern 3 — Custom hook with mocked fetch

Mock `global.fetch` before the test, render with `renderHook()`, use `waitFor()` for async state.

```ts
import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

global.fetch = vi.fn();

it('returns data on success', async () => {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: true,
    json: async () => mockUser,
  });
  const { result } = renderHook(() => useGitHubUser('octocat'));
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.user).toEqual(mockUser);
});
```

### Coverage thresholds

| Milestone | Target | Focus |

|-----------|--------|-------|
| Month 1 | 20% | Establish pipeline — test new utilities |
| Month 2 | 35% | All hooks and critical components |
| Month 3 | 50% | Edge cases and error states |
| Ongoing | 60–70% | Meaningful coverage, not 100% chasing |

---

## 6. Pull Request Process

### Before marking ready

- [ ] `pnpm type-check` passes with zero errors
- [ ] `pnpm lint` passes with zero warnings
- [ ] `pnpm test:ci` green — all tests pass
- [ ] New tests added for any new utility functions or hooks
- [ ] README updated if any user-facing behaviour changed
- [ ] No `console.log` left in production code
- [ ] No `@ts-ignore` or `eslint-disable` without explanation

### CI pipeline

| Workflow | Trigger | Blocks merge? |

|----------|---------|---------------|
| `ci-test.yml` | Every push + every PR | Yes |
| `ci-preview.yml` | PR opened/updated | No — posts preview URL as comment |
| `ci-deploy.yml` | Push to `main` | N/A — prod deploy after merge |

### Merge strategy

Squash-and-merge only. This keeps `git log` on `main` a readable history of features and fixes — not a stream of "WIP" and "fix typo" commits.

---

## 7. Architecture Notes for Contributors

| Decision | Rationale |

|----------|-----------|
| Prices stored as integer cents | Eliminates float precision bugs. Stripe uses cents natively — no conversion layer. |
| Order items are snapshots | Product prices change. Snapshots preserve historical accuracy regardless of future edits. |
| Clerk for auth, not Auth.js | Clerk owns the session surface — leaner DB schema, no `sessions` or `accounts` tables needed. |
| `use cache` per-function | Fine-grained invalidation via `cacheTag()`. One tag bust revalidates only affected pages. |
| `"use client"` islands only | Keeps JS bundle minimal. SC renders on server; only interactive leaf nodes are CCs. |
| Guest checkout supported | `userId` is nullable on orders. Requiring login before purchase is a known conversion drop-off. |
| Idempotent webhook handlers | Stripe and Clerk can deliver the same event multiple times. All handlers use upsert/conditional-update patterns. |

---

_storefront · github.com/[username]/storefront_
