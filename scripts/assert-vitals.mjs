import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

// ─── Thresholds ───────────────────────────────────────────────────────────────

const THRESHOLDS = {
  LCP: {
    audit: 'largest-contentful-paint',
    unit: 'ms',
    good: 2500,
    poor: 4000,
    // The hard block: CI fails if any URL exceeds this.
    failAt: 2500,
  },
  CLS: {
    audit: 'cumulative-layout-shift',
    unit: 'score',
    good: 0.1,
    poor: 0.25,
    failAt: 0.1,
  },
  INP: {
    audit: 'interaction-to-next-paint',
    unit: 'ms',
    good: 200,
    poor: 500,
    // INP is advisory here — warn but don't block.
    // It's unreliable in synthetic lab tests (no real user interaction).
    failAt: Infinity,
  },
  TBT: {
    audit: 'total-blocking-time',
    unit: 'ms',
    good: 200,
    poor: 600,
    // TBT is the lab proxy for INP — block on this instead.
    failAt: 600,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function fmt(value, unit) {
  if (unit === 'ms') return `${Math.round(value)}ms`;
  return value.toFixed(4);
}

function rating(value, good, poor) {
  if (value <= good) return { label: 'GOOD', symbol: '✅' };
  if (value < poor) return { label: 'NEEDS IMPROVEMENT', symbol: '⚠️ ' };
  return { label: 'POOR', symbol: '❌' };
}

// ─── Load reports ─────────────────────────────────────────────────────────────

const REPORT_DIR = '.lighthouseci';

if (!existsSync(REPORT_DIR)) {
  console.error('[assert-vitals] No .lighthouseci directory found.');
  console.error('Run `lhci autorun` first.');
  process.exit(1);
}

const reportFiles = readdirSync(REPORT_DIR).filter(f => f.startsWith('lhr-') && f.endsWith('.json'));

if (!reportFiles.length) {
  console.error('[assert-vitals] No LHR JSON files found in .lighthouseci/');
  process.exit(1);
}

// Group report files by URL
const byUrl = new Map();

for (const file of reportFiles) {
  const report = JSON.parse(readFileSync(join(REPORT_DIR, file), 'utf8'));
  const url = report.requestedUrl;

  if (!byUrl.has(url)) byUrl.set(url, []);
  byUrl.get(url).push(report);
}

// ─── Assert ───────────────────────────────────────────────────────────────────

let failed = false;
const lines = [];

lines.push('');
lines.push('┌─────────────────────────────────────────────────────────────┐');
lines.push('│                  Lighthouse CI — Vitals report               │');
lines.push('└─────────────────────────────────────────────────────────────┘');

for (const [url, reports] of byUrl) {
  const pathname = new URL(url).pathname;
  lines.push('');
  lines.push(`  Route: ${pathname}  (${reports.length} run${reports.length > 1 ? 's' : ''})`);
  lines.push('  ' + '─'.repeat(56));

  for (const [name, cfg] of Object.entries(THRESHOLDS)) {
    const values = reports.map(r => r.audits[cfg.audit]?.numericValue ?? Infinity);
    const med = median(values);
    const { label, symbol } = rating(med, cfg.good, cfg.poor);
    const breached = med > cfg.failAt;

    if (breached) failed = true;

    const formatted = fmt(med, cfg.unit);
    const threshold =
      cfg.failAt === Infinity ? `warn only (lab INP unreliable)` : `fail > ${fmt(cfg.failAt, cfg.unit)}`;

    const line = [
      `  ${symbol}`,
      name.padEnd(6),
      formatted.padStart(10),
      `   ${label.padEnd(20)}`,
      breached ? '← BLOCKED' : `[${threshold}]`,
    ].join(' ');

    lines.push(line);
  }
}

lines.push('');

if (failed) {
  lines.push('  ✖ RESULT: FAIL — one or more vitals exceed their threshold.');
  lines.push('  Fix the issues above and push again.');
  lines.push('');
  lines.push('  Debugging tips:');
  lines.push('  • LCP > 2500ms  → check fetchpriority="high" on LCP image');
  lines.push('  •               → check render-blocking CSS/scripts in <head>');
  lines.push('  •               → check TTFB (slow server = high LCP)');
  lines.push('  • CLS > 0.1     → check images have width + height attributes');
  lines.push('  •               → check for content injected above the fold');
  lines.push('  •               → check font-display: swap on web fonts');
  lines.push('  • TBT > 600ms   → check for large JS bundles (run bundle-analyzer)');
  lines.push('  •               → check for third-party scripts blocking main thread');
} else {
  lines.push('  ✔ RESULT: PASS — all vitals within thresholds.');
}

lines.push('');
console.log(lines.join('\n'));

// Non-zero exit fails the workflow step, which blocks PR merge.
process.exit(failed ? 1 : 0);
