//---- Domain models =====================

export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface ShippingAddress {
  fullName: string;
  linel: string;
  line2?: string;
  city: string;
  postcode: string;
  country: string;
}

export type PaymentMethod = { type: 'card'; last4: string; brand: string } | { type: 'paypal'; email: string };

// ----- The state machine ==========
// Each member carries only the data that has been collected so far.
// The 'step' discriminant makes narrowing trivial — no runtime guessing

export type CheckoutState =
  | {
      step: 'idle';
      // Nothing collected yet. The cart comes from TanStack Query,
      // not stored here — that's server state, not UI state.
    }
  | {
      step: 'shipping';
      cartId: string;
      items: CartItem[];
      // address intentionally absent — it doesn't exist yet
    }
  | {
      step: 'payment';
      cartId: string;
      items: CartItem[];
      address: ShippingAddress; // now guaranteed to exist
    }
  | {
      step: 'payment';
      cartId: string;
      items: CartItem[];
      address: ShippingAddress;
      paymentMethod: PaymentMethod; // now guaranteed to exist
    }
  | {
      step: 'submitting';
      cartId: string;
      items: CartItem[];
      address: ShippingAddress;
      paymentMethod: PaymentMethod;
      // No error here — if we're submitting, there is no current error
    }
  | {
      step: 'confirmed';
      orderId: string;
      total: number;
      // Historical data dropped — confirmation only needs what it displays
    };

// ─── Transition actions ───────────────────────────────────────────────────────
// Each action is valid only from specific states.
// The store enforces this — these types document the intent.

export type CheckoutAction =
  | { type: 'START'; cartId: string; items: CartItem[] }
  | { type: 'SUBMIT_SHIPPING'; address: ShippingAddress }
  | { type: 'SUBMIT_PAYMENT'; paymentMethod: PaymentMethod }
  | { type: 'CONFIRM_ORDER' }
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_SUCCESS'; address: string; total: number }
  | { type: 'SUBMIT_ERROR' } // Return to 'payment' - user re-enters card
  | { type: 'RESET' };
