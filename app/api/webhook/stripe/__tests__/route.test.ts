import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockOrder } from '@/lib/__tests__/test-utils';

const mockHeadersFn = vi.fn();
const mockConstructEvent = vi.fn();
const mockFindFirst = vi.fn();
const mockUpdateChain = { set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) };
const mockInsertChain = { values: vi.fn().mockReturnValue({ returning: vi.fn() }) };
const mockTransaction = vi.fn();
const mockListLineItems = vi.fn();
const mockInvalidateInventory = vi.fn();
const mockSendOrderConfirmation = vi.fn();

vi.mock('next/headers', () => ({ headers: mockHeadersFn }));

vi.mock('@/lib/stripe', () => ({
  getStripe: () => ({
    webhooks: { constructEvent: mockConstructEvent },
    checkout: { sessions: { listLineItems: mockListLineItems } },
  }),
}));

vi.mock('@/lib/db', () => ({
  db: {
    query: { orders: { findFirst: mockFindFirst } },
    update: () => mockUpdateChain,
    insert: () => mockInsertChain,
    transaction: mockTransaction,
  },
}));

vi.mock('@/lib/db/invalidate', () => ({ invalidateInventory: mockInvalidateInventory }));
vi.mock('@/lib/email/order-confirmation', () => ({ sendOrderConfirmation: mockSendOrderConfirmation }));

const baseSession = {
  id: 'cs_test',
  payment_status: 'paid',
  amount_total: 3998,
  currency: 'usd',
  total_details: { amount_tax: 0, amount_shipping: 0, amount_discount: 0 },
  customer: 'cus_test',
  customer_details: { email: 'customer@example.com', name: 'John' },
  collected_information: {
    shipping_details: {
      name: 'John Doe',
      address: { line1: '123 Main St', city: 'NYC', state: 'NY', postal_code: '10001', country: 'US' },
    },
  },
  metadata: { dbUserId: 'user-1', guestEmail: '', itemCount: '1' },
  payment_intent: 'pi_test',
};

function makeEvent(type: string, objectOverrides?: Record<string, unknown>) {
  return {
    id: 'evt_test',
    type,
    data: { object: { ...baseSession, ...objectOverrides } },
  };
}

async function post(bodyOverride?: string) {
  const { POST } = await import('../route');
  const req = new Request('https://example.com/api/webhook/stripe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'stripe-signature': 't=123,v1=sig123' },
    body: bodyOverride ?? JSON.stringify(makeEvent('checkout.session.completed')),
  });
  return POST(req);
}

describe('POST /api/webhook/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test');
    mockHeadersFn.mockResolvedValue(new Map([['stripe-signature', 't=123,v1=sig123']]));
    mockConstructEvent.mockImplementation((_body: string, sig: string) => {
      if (!sig) throw new Error('No signature');
      return JSON.parse(_body);
    });
    mockListLineItems.mockResolvedValue({ data: [] });
    mockInsertChain.values.mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 'order-1' }]) });
  });

  it('returns 500 when webhook secret is not set', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '');
    const res = await post();
    expect(res.status).toBe(500);
  });

  it('returns 400 when stripe-signature header is missing', async () => {
    mockHeadersFn.mockResolvedValue(new Map());
    const { POST } = await import('../route');
    const req = new Request('https://example.com/api/webhook/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(makeEvent('checkout.session.completed')),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 401 when signature is invalid', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });
    const res = await post();
    expect(res.status).toBe(401);
  });

  it('handles checkout.session.completed — updates pending order', async () => {
    mockFindFirst.mockResolvedValue(
      createMockOrder({
        id: 'order-1',
        orderStatus: 'pending',
        paymentStatus: 'unpaid',
        items: [
          {
            id: 'oi-1',
            productId: 'prod-1',
            productName: 'Test',
            productSlug: 'test',
            productImageUrl: null,
            unitPriceCents: 1999,
            quantity: 2,
            totalCents: 3998,
            orderId: 'order-1',
          },
        ],
      }),
    );

    const res = await post();
    expect(res.status).toBe(200);
    expect(mockUpdateChain.set).toHaveBeenCalled();
    expect(mockTransaction).toHaveBeenCalled();
    expect(mockInvalidateInventory).toHaveBeenCalledWith(['test']);
  });

  it('skips if payment not paid', async () => {
    const res = await post(JSON.stringify(makeEvent('checkout.session.completed', { payment_status: 'unpaid' })));
    expect(res.status).toBe(200);
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it('handles checkout.session.expired', async () => {
    const res = await post(JSON.stringify(makeEvent('checkout.session.expired')));
    expect(res.status).toBe(200);
    expect(mockUpdateChain.set).toHaveBeenCalled();
  });

  it('handles payment_intent.payment_failed', async () => {
    const res = await post(JSON.stringify(makeEvent('payment_intent.payment_failed', { id: 'pi_failed' })));
    expect(res.status).toBe(200);
    expect(mockUpdateChain.set).toHaveBeenCalled();
  });

  it('handles charge.refunded', async () => {
    const res = await post(
      JSON.stringify(
        makeEvent('charge.refunded', {
          id: 'ch_test',
          payment_intent: 'pi_test',
          amount: 3998,
          amount_refunded: 3998,
        }),
      ),
    );
    expect(res.status).toBe(200);
    expect(mockUpdateChain.set).toHaveBeenCalled();
  });
});
