import Stripe from 'stripe';

// Singleton — avoids re-instantiation in hot-reload dev
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover', // pin to latest stable
  typescript: true,
});
