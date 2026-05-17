'use client';

import { useReportVitals } from '@/hooks/use-report-vitals';

// Thin wrapper: RSC-safe, renders null, just runs the hook.
// Kept separate so layout.tsx stays a Server Component.
export function VitalsReporter(): null {
  useReportVitals();
  return null;
}
