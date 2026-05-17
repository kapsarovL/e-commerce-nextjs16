import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const APP_DIR = './app';
const apps = readdirSync(APP_DIR);

const versions = new Map();

for (const app of apps) {
  const pkgPath = join(APP_DIR, app, 'package.json');
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    const reactVersion = pkg.dependencies?.react ?? pkg.peerDependencies?.react ?? 'not found';
    versions.set(app, reactVersion);
  } catch {
    // not a valid app directory
  }
}

console.log('\nReact versions across app:');
for (const [app, ver] of versions) {
  console.log(`  ${app}: ${ver}`);
}

const uniqueVersions = new Set(versions.values());
if (uniqueVersions.size > 1) {
  console.error('\n❌ React version mismatch detected. All apps must use the same version.');
  process.exit(1);
}

console.log('\n✅ All apps use the same React version.');
