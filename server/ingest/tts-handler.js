// ---------------------------------------------------------------------------
// Pipeline 3: TTS Generation Lambda
//
// Runs every 15 minutes via EventBridge (offset from ingestion by 5 min).
// Scans recent articles, checks S3 for existing audio, and generates
// missing TTS audio via Edge TTS.
// ---------------------------------------------------------------------------

import { queryRecentArticlesForTTS } from '../db.js';
import { generateAndUpload } from '../tts/generate.js';

function createLimiter(concurrency) {
  let active = 0;
  const queue = [];
  function next() {
    if (queue.length === 0 || active >= concurrency) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    fn().then(resolve, reject).finally(() => { active--; next(); });
  }
  return function limit(fn) {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      next();
    });
  };
}

export async function handler(event) {
  const startTime = Date.now();
  console.log('[tts] Starting TTS generation run');

  const articles = await queryRecentArticlesForTTS(300);
  console.log(`[tts] Found ${articles.length} recent articles to check`);

  if (articles.length === 0) {
    return { statusCode: 200, body: JSON.stringify({ generated: 0 }) };
  }

  const limiter = createLimiter(20);
  let generated = 0;
  let skipped = 0;
  let failed = 0;

  await Promise.all(
    articles.map((article) =>
      limiter(async () => {
        try {
          const result = await generateAndUpload({
            title: article.title,
            body: article.body,
            description: article.description,
            lang: article.lang || 'en',
            slug: article.slug,
            region: 'global',
          });

          if (result?.skipped) skipped++;
          else if (result) generated++;
          else failed++;
        } catch (err) {
          console.warn(`[tts] Failed: ${article.slug} - ${err.message}`);
          failed++;
        }
      }),
    ),
  );

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[tts] Finished in ${elapsed}s | generated=${generated} skipped=${skipped} failed=${failed}`);

  return {
    statusCode: 200,
    body: JSON.stringify({ generated, skipped, failed, durationSeconds: parseFloat(elapsed) }),
  };
}
