import 'server-only';

import { neon } from '@neondatabase/serverless';
import { z } from 'zod';

const sql = neon(process.env.DATABASE_URL!);

// ─── Types ────────────────────────────────────────────────────────────────────

const VitalSchema = z.object({
  name: z.enum(['CLS', 'INP', 'LCP']),
  value: z.number(),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
  delta: z.number(),
  id: z.string(),
  navigationType: z.string(),
  pathname: z.string(),
  deviceType: z.enum(['desktop', 'mobile', 'tablet']),
  connection: z.string(),
});

type VitalInput = z.infer<typeof VitalSchema>;

// ─── Insert with upsert ───────────────────────────────────────────────────────

export async function insertVital(vital: VitalInput): Promise<void> {
  await sql`
    INSERT INTO web_vitals
      (name, value, rating, delta, metric_id, navigation, pathname, device_type, connection)
    VALUES
      (${vital.name}, ${vital.value}, ${vital.rating}, ${vital.delta},
       ${vital.id}, ${vital.navigationType}, ${vital.pathname},
       ${vital.deviceType}, ${vital.connection})
    ON CONFLICT (metric_id, name)
    DO UPDATE SET
      value      = EXCLUDED.value,
      rating     = EXCLUDED.rating,
      delta      = EXCLUDED.delta,
      recorded_at = NOW()
  `;
}

// ─── Query helpers — use in Server Components or Route Handlers ───────────────

interface VitalSummary {
  name: string;
  p75: number;
  rating: string;
  sampleCount: number;
}

// P75 per metric for the last 7 days — the number Google measures
export async function getP75Vitals(pathname?: string): Promise<VitalSummary[]> {
  const rows = await sql`
    SELECT
      name,
      ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value)::numeric, 2) AS p75,
      MODE() WITHIN GROUP (ORDER BY rating) AS rating,
      COUNT(*)::int AS "sampleCount"
    FROM web_vitals
    WHERE recorded_at > NOW() - INTERVAL '7 days'
      ${pathname ? sql`AND pathname = ${pathname}` : sql``}
    GROUP BY name
    ORDER BY name
  ` as unknown as Promise<VitalSummary[]>;
  return rows;
}

// Per-route breakdown — find your worst pages
export async function getVitalsByRoute(
  metricName: 'CLS' | 'INP' | 'LCP',
): Promise<{ pathname: string; p75: number; sampleCount: number }[]> {
  return sql`
    SELECT
      pathname,
      ROUND(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value)::numeric, 2) AS p75,
      COUNT(*)::int AS "sampleCount"
    FROM web_vitals
    WHERE name = ${metricName}
      AND recorded_at > NOW() - INTERVAL '7 days'
    GROUP BY pathname
    HAVING COUNT(*) >= 10
    ORDER BY p75 DESC
    LIMIT 20
  ` as unknown as Promise<{ pathname: string; p75: number; sampleCount: number }[]>;
}
