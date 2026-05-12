import { render as rtlRender, RenderOptions } from '@testing-library/react';
import React, { ReactElement } from 'react';

function Wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children);
}

function render(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
export { render };

// Test data generators
export const createMockProduct = (overrides = {}) => ({
  id: crypto.randomUUID(),
  name: 'Test Product',
  slug: 'test-product',
  description: 'Test Description',
  priceCents: 1999,
  comparePriceCents: null,
  stockQuantity: 10,
  lowStockThreshold: 5,
  isPublished: true,
  isFeatured: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  categoryId: 'cat-1',
  images: [],
  tags: [],
  metadata: null,
  ...overrides,
});

export const createMockCartItem = (overrides = {}) => ({
  id: crypto.randomUUID(),
  slug: 'test-product',
  name: 'Test Product',
  imageUrl: null,
  priceCents: 1999,
  quantity: 1,
  stockQuantity: 10,
  ...overrides,
});

export const createMockOrder = (overrides = {}) => ({
  id: crypto.randomUUID(),
  userId: null,
  guestEmail: 'guest@example.com',
  stripeSessionId: 'session_test',
  stripePaymentIntentId: null,
  orderStatus: 'pending' as const,
  paymentStatus: 'unpaid' as const,
  subtotalCents: 1999,
  taxCents: 0,
  shippingCents: 0,
  discountCents: 0,
  totalCents: 1999,
  currency: 'usd',
  shippingAddress: { line1: '', city: '', state: '', postalCode: '', country: '' },
  metadata: null,
  paidAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockCategory = (overrides = {}) => ({
  id: crypto.randomUUID(),
  name: 'Test Category',
  slug: 'test-category',
  description: null,
  imageUrl: null,
  parentId: null,
  createdAt: new Date(),
  ...overrides,
});

export const createMockCheckoutSession = (overrides: Record<string, unknown> = {}) => ({
  id: 'cs_test_' + Math.random().toString(36).substring(7),
  object: 'checkout.session',
  payment_status: 'unpaid',
  status: 'open',
  mode: 'payment' as const,
  customer: null,
  customer_email: 'guest@example.com',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customer_creation: null as any,
  metadata: { dbUserId: '', guestEmail: 'guest@example.com', itemCount: '1' },
  amount_total: 1999,
  currency: 'usd',
  total_details: { amount_tax: 0, amount_discount: 0, amount_shipping: 0 },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  line_items: { object: 'list', data: [], has_more: false, url: '' } as any,
  ...overrides,
});
