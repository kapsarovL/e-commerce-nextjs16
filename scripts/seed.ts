/**
 * Seed script — run with:
 *   npx tsx scripts/seed.ts
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../lib/db/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// ── Categories ────────────────────────────────────────────────────────────────

const categoryData = [
  { name: 'Electronics', slug: 'electronics', description: 'Gadgets, devices, and accessories' },
  { name: 'Clothing', slug: 'clothing', description: 'Apparel for every occasion' },
  { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Everything for your home' },
  { name: 'Books', slug: 'books', description: 'Paperbacks, hardcovers, and more' },
  { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Gear for every adventure' },
  { name: 'Beauty & Health', slug: 'beauty-health', description: 'Skincare, wellness, and self-care' },
];

// ── Products ──────────────────────────────────────────────────────────────────

type NewProduct = typeof schema.products.$inferInsert;

function makeProducts(categoryMap: Record<string, string>): NewProduct[] {
  return [
    // Electronics
    {
      name: 'Wireless Noise-Cancelling Headphones',
      slug: 'wireless-noise-cancelling-headphones',
      description: 'Premium over-ear headphones with active noise cancellation and 30-hour battery life.',
      priceCents: 24999,
      comparePriceCents: 34999,
      categoryId: categoryMap['electronics'],
      images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', alt: 'Headphones', position: 0 }],
      tags: ['audio', 'wireless', 'noise-cancelling'],
      stockQuantity: 48,
      isPublished: true,
      isFeatured: true,
    },
    {
      name: 'USB-C Hub 7-in-1',
      slug: 'usb-c-hub-7-in-1',
      description: 'Expand your laptop with HDMI 4K, 3× USB-A, SD card reader, and 100W PD charging.',
      priceCents: 4999,
      categoryId: categoryMap['electronics'],
      images: [{ url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&q=80', alt: 'USB Hub', position: 0 }],
      tags: ['laptop', 'accessories', 'usb'],
      stockQuantity: 120,
      isPublished: true,
      isFeatured: true,
    },
    {
      name: 'Mechanical Keyboard — TKL',
      slug: 'mechanical-keyboard-tkl',
      description: 'Tenkeyless mechanical keyboard with RGB backlight and brown switches.',
      priceCents: 8999,
      comparePriceCents: 11999,
      categoryId: categoryMap['electronics'],
      images: [{ url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80', alt: 'Keyboard', position: 0 }],
      tags: ['keyboard', 'mechanical', 'gaming'],
      stockQuantity: 35,
      isPublished: true,
      isFeatured: false,
    },
    {
      name: 'Portable Bluetooth Speaker',
      slug: 'portable-bluetooth-speaker',
      description: 'Waterproof IPX7 speaker with 360° sound and 20-hour playback.',
      priceCents: 5999,
      categoryId: categoryMap['electronics'],
      images: [{ url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80', alt: 'Speaker', position: 0 }],
      tags: ['audio', 'portable', 'waterproof'],
      stockQuantity: 0,
      isPublished: true,
      isFeatured: false,
    },
    {
      name: 'Smart Watch Pro',
      slug: 'smart-watch-pro',
      description: 'Health tracking, GPS, and 7-day battery life in a slim aluminum case.',
      priceCents: 19999,
      comparePriceCents: 24999,
      categoryId: categoryMap['electronics'],
      images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', alt: 'Smart Watch', position: 0 }],
      tags: ['wearable', 'fitness', 'gps'],
      stockQuantity: 22,
      isPublished: true,
      isFeatured: true,
    },

    // Clothing
    {
      name: 'Classic Cotton Crew-Neck Tee',
      slug: 'classic-cotton-crew-neck-tee',
      description: '100% organic cotton tee in 12 colours. Relaxed fit, pre-washed for softness.',
      priceCents: 2999,
      categoryId: categoryMap['clothing'],
      images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', alt: 'T-shirt', position: 0 }],
      tags: ['cotton', 'basics', 'unisex'],
      stockQuantity: 200,
      isPublished: true,
      isFeatured: true,
    },
    {
      name: 'Slim-Fit Chino Trousers',
      slug: 'slim-fit-chino-trousers',
      description: 'Stretch chino in a modern slim silhouette. Available in navy, stone, and olive.',
      priceCents: 5499,
      comparePriceCents: 6999,
      categoryId: categoryMap['clothing'],
      images: [{ url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80', alt: 'Chinos', position: 0 }],
      tags: ['trousers', 'smart-casual'],
      stockQuantity: 80,
      isPublished: true,
      isFeatured: false,
    },
    {
      name: 'Merino Wool Sweater',
      slug: 'merino-wool-sweater',
      description: 'Fine-knit merino pullover — lightweight, breathable, and machine washable.',
      priceCents: 8999,
      categoryId: categoryMap['clothing'],
      images: [{ url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80', alt: 'Sweater', position: 0 }],
      tags: ['merino', 'knitwear', 'wool'],
      stockQuantity: 4,
      isPublished: true,
      isFeatured: true,
    },

    // Home & Kitchen
    {
      name: 'Pour-Over Coffee Maker',
      slug: 'pour-over-coffee-maker',
      description: 'Borosilicate glass dripper with a stainless steel filter. Makes 2–4 cups.',
      priceCents: 3499,
      categoryId: categoryMap['home-kitchen'],
      images: [{ url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80', alt: 'Coffee maker', position: 0 }],
      tags: ['coffee', 'kitchen', 'barista'],
      stockQuantity: 60,
      isPublished: true,
      isFeatured: true,
    },
    {
      name: 'Cast-Iron Skillet 10"',
      slug: 'cast-iron-skillet-10',
      description: 'Pre-seasoned cast iron — goes from stovetop to oven to campfire.',
      priceCents: 3999,
      comparePriceCents: 5499,
      categoryId: categoryMap['home-kitchen'],
      images: [{ url: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=600&q=80', alt: 'Cast iron skillet', position: 0 }],
      tags: ['cookware', 'cast-iron', 'oven-safe'],
      stockQuantity: 45,
      isPublished: true,
      isFeatured: false,
    },
    {
      name: 'Bamboo Cutting Board Set',
      slug: 'bamboo-cutting-board-set',
      description: 'Set of 3 sustainably sourced bamboo boards with juice grooves.',
      priceCents: 2799,
      categoryId: categoryMap['home-kitchen'],
      images: [{ url: 'https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=600&q=80', alt: 'Cutting boards', position: 0 }],
      tags: ['kitchen', 'eco', 'bamboo'],
      stockQuantity: 90,
      isPublished: true,
      isFeatured: false,
    },

    // Books
    {
      name: 'The Art of Focus',
      slug: 'the-art-of-focus',
      description: 'A practical guide to deep work, distraction-free productivity, and creative flow.',
      priceCents: 1699,
      categoryId: categoryMap['books'],
      images: [{ url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80', alt: 'Book', position: 0 }],
      tags: ['productivity', 'self-help', 'non-fiction'],
      stockQuantity: 150,
      isPublished: true,
      isFeatured: false,
    },
    {
      name: 'Design Systems Handbook',
      slug: 'design-systems-handbook',
      description: 'How to build scalable, consistent design systems for modern product teams.',
      priceCents: 2299,
      categoryId: categoryMap['books'],
      images: [{ url: 'https://images.unsplash.com/photo-1609372332255-611485350f25?w=600&q=80', alt: 'Design book', position: 0 }],
      tags: ['design', 'ux', 'reference'],
      stockQuantity: 75,
      isPublished: true,
      isFeatured: true,
    },

    // Sports & Outdoors
    {
      name: 'Adjustable Dumbbell Set',
      slug: 'adjustable-dumbbell-set',
      description: 'Space-saving dumbbells that adjust from 5 to 52.5 lbs in seconds.',
      priceCents: 29999,
      comparePriceCents: 39999,
      categoryId: categoryMap['sports-outdoors'],
      images: [{ url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&q=80', alt: 'Dumbbells', position: 0 }],
      tags: ['fitness', 'weights', 'home-gym'],
      stockQuantity: 18,
      isPublished: true,
      isFeatured: true,
    },
    {
      name: 'Trail Running Shoes',
      slug: 'trail-running-shoes',
      description: 'Lightweight trail runners with Vibram outsole and waterproof membrane.',
      priceCents: 13999,
      categoryId: categoryMap['sports-outdoors'],
      images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', alt: 'Running shoes', position: 0 }],
      tags: ['running', 'trail', 'waterproof'],
      stockQuantity: 40,
      isPublished: true,
      isFeatured: false,
    },

    // Beauty & Health
    {
      name: 'Daily Moisturiser SPF 30',
      slug: 'daily-moisturiser-spf-30',
      description: 'Lightweight hydrating moisturiser with broad-spectrum SPF 30. Suitable for all skin types.',
      priceCents: 2899,
      categoryId: categoryMap['beauty-health'],
      images: [{ url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80', alt: 'Moisturiser', position: 0 }],
      tags: ['skincare', 'spf', 'moisturiser'],
      stockQuantity: 110,
      isPublished: true,
      isFeatured: true,
    },
    {
      name: 'Vitamin D3 + K2 Supplement',
      slug: 'vitamin-d3-k2-supplement',
      description: '2000 IU D3 with MK-7 K2. 120 softgels, 4-month supply.',
      priceCents: 1899,
      comparePriceCents: 2499,
      categoryId: categoryMap['beauty-health'],
      images: [{ url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80', alt: 'Supplements', position: 0 }],
      tags: ['vitamins', 'health', 'supplements'],
      stockQuantity: 200,
      isPublished: true,
      isFeatured: false,
    },
  ];
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database…');

  // Insert categories
  console.log('  → categories');
  const insertedCategories = await db
    .insert(schema.categories)
    .values(categoryData)
    .onConflictDoNothing()
    .returning({ id: schema.categories.id, slug: schema.categories.slug });

  // Build slug → id map (covers both fresh inserts and pre-existing rows)
  const existing = await db.query.categories.findMany({ columns: { id: true, slug: true } });
  const categoryMap = Object.fromEntries(existing.map(c => [c.slug, c.id]));

  // Insert products
  console.log('  → products');
  await db
    .insert(schema.products)
    .values(makeProducts(categoryMap))
    .onConflictDoNothing();

  console.log(`✅ Done. Inserted ${insertedCategories.length} categories and seeded products.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
