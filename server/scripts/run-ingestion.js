#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Manual ingestion trigger: run the feed ingestion handler locally
//
// Usage:
//   node server/scripts/run-ingestion.js
//   node server/scripts/run-ingestion.js --no-tts      # skip TTS generation
//   node server/scripts/run-ingestion.js --no-indexnow  # skip IndexNow
// ---------------------------------------------------------------------------

import { handler } from '../ingest/handler.js';

const args = new Set(process.argv.slice(2));

// Allow disabling TTS/IndexNow for faster local runs
if (args.has('--no-tts')) {
  process.env.SKIP_TTS = 'true';
}
if (args.has('--no-indexnow')) {
  process.env.SKIP_INDEXNOW = 'true';
}

async function main() {
  console.log(`\n\x1b[1mManual Ingestion Run\x1b[0m`);
  console.log(`Time: ${new Date().toISOString()}`);
  if (args.has('--no-tts')) console.log('  TTS generation: SKIPPED');
  if (args.has('--no-indexnow')) console.log('  IndexNow: SKIPPED');
  console.log('');

  const startTime = Date.now();

  const result = await handler({});
  const body = JSON.parse(result.body);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\x1b[1mResults:\x1b[0m`);
  console.log(`  \x1b[32m${body.ingested} new articles ingested\x1b[0m`);
  console.log(`  ${body.skipped} duplicates skipped`);
  console.log(`  \x1b[${body.feedErrors ? '31' : '32'}m${body.feedErrors} feed errors\x1b[0m`);
  console.log(`  Completed in ${elapsed}s\n`);
}

main().catch((err) => {
  console.error('\nIngestion failed:', err);
  process.exit(1);
});
