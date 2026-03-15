import { relations } from 'drizzle-orm';
import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'processing',
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
    // Stored after first Stripe checkout — enables saved payment methods
    // and makes refunds/disputes traceable to a customer record
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).unique(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  t => [index('users_clerk_id_idx').on(t.clerkId), index('users_stripe_customer_idx').on(t.stripeCustomerId)],
);

// ─────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 120 }).notNull().unique(),
    description: text('description'),
    imageUrl: text('image_url'),
    parentId: uuid('parent_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  t => [index('categories_slug_idx').on(t.slug)],
);

// ─────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 280 }).notNull().unique(),
    description: text('description'),
    priceCents: integer('price_cents').notNull(),
    comparePriceCents: integer('compare_price_cents'),
    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
    images: jsonb('images').$type<{ url: string; alt: string; position: number }[]>().notNull().default([]),
    tags: text('tags').array().notNull().default([]),
    stockQuantity: integer('stock_quantity').notNull().default(0),
    lowStockThreshold: integer('low_stock_threshold').notNull().default(5),
    isPublished: boolean('is_published').notNull().default(false),
    isFeatured: boolean('is_featured').notNull().default(false),
    metadata: jsonb('metadata').$type<Record<string, string>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  t => [
    index('products_slug_idx').on(t.slug),
    index('products_category_idx').on(t.categoryId),
    index('products_published_idx').on(t.isPublished),
    index('products_featured_idx').on(t.isFeatured),
  ],
);

// ─────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'restrict' }),
    guestEmail: varchar('guest_email', { length: 320 }),
    orderStatus: orderStatusEnum('order_status').notNull().default('pending'),
    paymentStatus: paymentStatusEnum('payment_status').notNull().default('unpaid'),
    stripeSessionId: varchar('stripe_session_id', { length: 500 }).unique(),
    stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 500 }).unique(),
    subtotalCents: integer('subtotal_cents').notNull(),
    taxCents: integer('tax_cents').notNull().default(0),
    shippingCents: integer('shipping_cents').notNull().default(0),
    discountCents: integer('discount_cents').notNull().default(0),
    totalCents: integer('total_cents').notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('usd'),
    shippingAddress: jsonb('shipping_address')
      .$type<{
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
      }>()
      .notNull(),
    metadata: jsonb('metadata').$type<Record<string, string>>().default({}),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  t => [
    index('orders_user_idx').on(t.userId),
    index('orders_stripe_session_idx').on(t.stripeSessionId),
    index('orders_status_idx').on(t.orderStatus),
    index('orders_payment_status_idx').on(t.paymentStatus),
  ],
);

// ─────────────────────────────────────────────
// Order Items
// ─────────────────────────────────────────────

export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
    productName: varchar('product_name', { length: 255 }).notNull(),
    productSlug: varchar('product_slug', { length: 280 }).notNull(),
    productImageUrl: text('product_image_url'),
    unitPriceCents: integer('unit_price_cents').notNull(),
    quantity: integer('quantity').notNull(),
    totalCents: integer('total_cents').notNull(),
  },
  t => [index('order_items_order_idx').on(t.orderId)],
);

// ─────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  products: many(products),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'parentCategory',
  }),
  children: many(categories, { relationName: 'parentCategory' }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));
