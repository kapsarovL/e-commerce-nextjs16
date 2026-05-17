import { z } from 'zod';
import { type NextRequest, NextResponse } from 'next/server';
import { insertVital } from '@/lib/vitals-db';

// ─── Validation schema ────────────────────────────────────────────────────────

const VitalSchema = z.object({
  name: z.enum(['CLS', 'INP', 'LCP']),
  value: z.number().finite().nonnegative(),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
  delta: z.number().finite(),
  id: z.string().min(1).max(64),
  navigationType: z.string(),
  pathname: z.string().startsWith('/').max(512),
  deviceType: z.enum(['desktop', 'mobile', 'tablet']),
  connection: z.string(),
});

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
  // sendBeacon sends as text/plain — handle both content types
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = VitalSchema.safeParse(body);
  if (!parsed.success) {
    // Don't log — bots send garbage constantly
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    await insertVital(parsed.data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('[vitals] insert failed:', err);
    // Return 204 — client doesn't need to retry vitals
    return new NextResponse(null, { status: 204 });
  }
}

// GET is not needed — data is read from Neon directly
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
