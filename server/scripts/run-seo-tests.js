#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Run SEO bot tests against production or a custom URL
//
// Usage:
//   node server/scripts/run-seo-tests.js
//   node server/scripts/run-seo-tests.js https://localhost:8080
// ---------------------------------------------------------------------------

import { execFileSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const testFile = resolve(__dirname, '../../tests/seo-bot-test.js');
const targetUrl = process.argv[2] || '';

console.log(`\n\x1b[1mSEO Bot Tests\x1b[0m`);
console.log(`Target: ${targetUrl || 'https://www.pulsenewstoday.com (default)'}\n`);

try {
  const args = [testFile];
  if (targetUrl) args.push(targetUrl);

  execFileSync('node', args, { stdio: 'inherit', cwd: resolve(__dirname, '../..') });
} catch (err) {
  // Test runner already prints results, just propagate exit code
  process.exit(err.status || 1);
}
