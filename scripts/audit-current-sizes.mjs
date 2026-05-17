// Run this once on your existing build to establish a baseline.
// Set budgets at current_size * 1.05 — 5% headroom.
// Tighten over time as you optimise.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import zlib from 'node:zlib';

const CHUNKS_DIR = '.next/static/chunks';

function gzipSize(filePath) {
  const content = readFileSync(filePath);
  return zlib.gzipSync(content).length;
}

const files = readdirSync(CHUNKS_DIR)
  .filter(f => f.endsWith('.js'))
  .map(f => {
    const fullPath = join(CHUNKS_DIR, f);
    const gz = gzipSize(fullPath);
    return { name: f, gzip: gz, kb: (gz / 1024).toFixed(1) };
  })
  .sort((a, b) => b.gzip - a.gzip)
  .slice(0, 15); // Top 15 largest chunks

console.log('\nTop 15 chunks by gzip size:\n');
files.forEach(f => {
  const bar = '█'.repeat(Math.round(f.gzip / 2048));
  console.log(`  ${f.kb.padStart(7)} kB  ${f.name.slice(0, 40).padEnd(40)}  ${bar}`);
});

const total = files.reduce((sum, f) => sum + f.gzip, 0);
console.log(`\nTotal (top 15): ${(total / 1024).toFixed(1)} kB gzipped`);
console.log('\nSuggested size-limit budgets (current + 5%):');
files.slice(0, 5).forEach(f => {
  const budget = Math.ceil((f.gzip * 1.05) / 1024);
  console.log(`  { "path": ".next/static/chunks/${f.name}", "limit": "${budget} kB" }`);
});
