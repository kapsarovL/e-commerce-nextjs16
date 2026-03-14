import { index, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

export const orderStatusEnum = pgEnum('order_status', [
  'pending', // created, not yet paid
  'processing', // payment confirmed, fulfillment in progress
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'unpaid',
  'paid',
  'failed',
  'refunded',
  'partially_refunded',
]);

// ─────────────────────────────────────────────
// Users
// Clerk is the identity provider — we store a
// minimal user record keyed on clerk_id to own
// relational data (orders, addresses, etc.)
// ─────────────────────────────────────────────

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
    email: varchar('email', { length: 320 }).notNull(),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  t => [index('users_clerk_id_idx').on(t.clerkId)],
);
