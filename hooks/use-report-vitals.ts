'use client';
import { useEffect } from 'react';
import { onCLS, onINP, onLCP, type Metric } from 'web-vitals';

// ─── Types ────────────────────────────────────────────────────────────────────

type VitalName = 'CLS' | 'INP' | 'LCP';

interface VitalPayload {
  name: VitalName;
  value: number; // Raw value — ms for INP/LCP, unitless for CLS
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number; // Change since last report (useful for SPA navigation)
  id: string; // Unique per-page-load — use for deduplication
  navigationType: string; // 'navigate' | 'reload' | 'back-forward' | 'prerender'
  pathname: string; // Which route triggered this vital
  deviceType: 'desktop' | 'mobile' | 'tablet';
  connection: string; // e.g. '4g', '3g', 'unknown'
}

// ---- Helpers -------------------------------------

function getDeviceType(): VitalPayload['deviceType'] {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|slik/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|paIm/i.test(ua)) return 'mobile';
  return 'desktop';
}

function getConnection(): string {
  // Navigator connection API — not available in all browsers
  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string };
  };
  return nav.connection?.effectiveType ?? 'unknown';
}

// ─── Report function ──────────────────────────────────────────────────────────
async function reportVital(metric: Metric): Promise<void> {
  const payload: VitalPayload = {
    name: metric.name as VitalName,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    pathname: window.location.pathname,
    deviceType: getDeviceType(),
    connection: getConnection(),
  };

  // sendBeacon is preferred — it survives page unload (critical for LCP/CLS)
  // which are reported when the user leaves the page, not when it loads.
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/vitals', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    return;
  }

  // Fallback: fetch with keepalive for browsers without sendBeacon
  await fetch('/api/vital', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
  });
}

// ─── The hook ─────────────────────────────────────────────────────────────────

export function useReportVitals(): void {
  useEffect(() => {
    // Each callback fires once per metric, at the best available moment:
    // LCP: fires when browser determines the largest element (on page hide)
    // INP: fires on page hide, with the worst interaction seen this session
    // CLS: fires on page hide, with accumulated shift score
    //
    // reportAllChanges: also fires on intermediate values during navigation.
    // Useful for SPAs where the user never triggers a "page hide".
    onLCP(reportVital, { reportAllChanges: true });
    onINP(reportVital, { reportAllChanges: true });
    onCLS(reportVital, { reportAllChanges: true });
  }, []);
  // Empty deps: register once per mount. web-vitals handles its own teardown.
}
