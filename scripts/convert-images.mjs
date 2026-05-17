import sharp from 'sharp';
import { readdirSync, mkdirSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

const INPUT_DIR = './public/images/source'; // Original JPEGs/PNGs
const OUTPUT_DIR = './public/images'; // Optimised outputs

mkdirSync(OUTPUT_DIR, { recursive: true });

const images = readdirSync(INPUT_DIR).filter(f => ['.jpg', '.jpeg', '.png'].includes(extname(f).toLowerCase()));

for (const file of images) {
  const name = basename(file, extname(file));
  const inputPath = join(INPUT_DIR, file);

  console.log(`Converting ${file}...`);

  await Promise.all([
    // AVIF: best compression, slowest to encode
    sharp(inputPath)
      .avif({ quality: 60, effort: 6 }) // effort 0-9, higher = smaller + slower
      .toFile(join(OUTPUT_DIR, `${name}.avif`)),

    // WebP: fast encode, good compression, universal fallback
    sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(join(OUTPUT_DIR, `${name}.webp`)),

    // JPEG: kept as-is for absolute fallback
    sharp(inputPath)
      .jpeg({ quality: 85, progressive: true })
      .toFile(join(OUTPUT_DIR, `${name}.jpg`)),
  ]);

  console.log(`  → ${name}.avif, ${name}.webp, ${name}.jpg`);
}

console.log('\nDone. Run curl checks to verify server negotiation.');
