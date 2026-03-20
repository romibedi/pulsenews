// ---------------------------------------------------------------------------
// One-time setup script: create OpenSearch indexes for all supported languages
//
// Usage:
//   OPENSEARCH_ENDPOINT=https://your-domain.eu-west-1.es.amazonaws.com \
//   node server/search/setup.js
// ---------------------------------------------------------------------------

import { getClient } from './client.js';
import { supportedLanguages, indexName, buildIndexSettings } from './mappings.js';
import { createHybridPipeline } from './pipeline.js';

async function main() {
  const client = getClient();
  const languages = supportedLanguages();

  console.log(`Creating indexes for ${languages.length} languages (with kNN enabled)...\n`);

  for (const lang of languages) {
    const idx = indexName(lang);
    try {
      const exists = await client.indices.exists({ index: idx });
      if (exists.body) {
        console.log(`  ${idx} — already exists, skipping`);
        continue;
      }

      const settings = buildIndexSettings(lang);
      await client.indices.create({
        index: idx,
        body: settings,
      });
      console.log(`  ${idx} — created (kNN + BM25)`);
    } catch (err) {
      console.error(`  ${idx} — ERROR: ${err.message}`);
    }
  }

  console.log('\nCreating hybrid search pipeline...');
  await createHybridPipeline();

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
