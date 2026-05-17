#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const THRESHOLDS = {
  lcp: 2500, // ms
  cls: 0.1,
  inp: 200, // ms
};

const reportDir = path.join(__dirname, '..', '.lighthouseci');

if (!fs.existsSync(reportDir)) {
  console.error('❌ No Lighthouse reports found at .lighthouseci/');
  process.exit(1);
}

const reports = fs
  .readdirSync(reportDir)
  .filter(f => f.startsWith('lhr-') && f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join(reportDir, f), 'utf8')));

if (reports.length === 0) {
  console.error('❌ No Lighthouse HTML reports generated');
  process.exit(1);
}

// Group reports by URL, extract metrics
const byUrl = {};
for (const report of reports) {
  const url = report.requestedUrl;
  if (!byUrl[url]) byUrl[url] = [];

  const lcp = report.audits['largest-contentful-paint']?.numericValue ?? null;
  const cls = report.audits['cumulative-layout-shift']?.numericValue ?? null;
  const inp = report.audits['interaction-to-next-paint']?.numericValue ?? null;

  byUrl[url].push({ lcp, cls, inp });
}

// Calculate median and check thresholds
const median = arr => {
  const sorted = arr.slice().sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

let failed = false;

for (const [url, runs] of Object.entries(byUrl)) {
  const route = new URL(url).pathname || '/';
  console.log(`\n📊 ${route}`);

  const lcpValues = runs.map(r => r.lcp).filter(v => v !== null);
  const clsValues = runs.map(r => r.cls).filter(v => v !== null);
  const inpValues = runs.map(r => r.inp).filter(v => v !== null);

  if (lcpValues.length > 0) {
    const lcpMedian = median(lcpValues);
    const lcpOk = lcpMedian <= THRESHOLDS.lcp;
    const icon = lcpOk ? '✅' : '❌';
    console.log(`  ${icon} LCP: ${Math.round(lcpMedian)}ms (target: ≤${THRESHOLDS.lcp}ms)`);
    if (!lcpOk) failed = true;
  }

  if (clsValues.length > 0) {
    const clsMedian = median(clsValues);
    const clsOk = clsMedian <= THRESHOLDS.cls;
    const icon = clsOk ? '✅' : '❌';
    console.log(`  ${icon} CLS: ${clsMedian.toFixed(3)} (target: ≤${THRESHOLDS.cls})`);
    if (!clsOk) failed = true;
  }

  if (inpValues.length > 0) {
    const inpMedian = median(inpValues);
    const inpOk = inpMedian <= THRESHOLDS.inp;
    const icon = inpOk ? '✅' : '❌';
    console.log(`  ${icon} INP: ${Math.round(inpMedian)}ms (target: ≤${THRESHOLDS.inp}ms)`);
    if (!inpOk) failed = true;
  }
}

if (failed) {
  console.error('\n❌ Some metrics exceeded thresholds');
  process.exit(1);
} else {
  console.log('\n✅ All metrics within thresholds');
  process.exit(0);
}
