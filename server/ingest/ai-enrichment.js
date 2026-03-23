// ---------------------------------------------------------------------------
// Pipeline 2: AI Enrichment Lambda
//
// Runs every 5 minutes via EventBridge. Scans for recently ingested articles
// that have needsAI=true, runs AI analysis (Gemini Flash / Claude Haiku),
// and updates all DynamoDB partition copies with the results.
// ---------------------------------------------------------------------------

import { queryArticlesNeedingAI, updateArticleAI } from '../db.js';
import { analyzeArticle } from './ai-analysis.js';

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
  console.log('[ai-enrich] Starting AI enrichment run');

  const articles = await queryArticlesNeedingAI(200);
  console.log(`[ai-enrich] Found ${articles.length} articles needing AI analysis`);

  if (articles.length === 0) {
    return { statusCode: 200, body: JSON.stringify({ enriched: 0 }) };
  }

  const limiter = createLimiter(10);
  let enriched = 0;
  let failed = 0;

  await Promise.all(
    articles.map((article) =>
      limiter(async () => {
        try {
          const aiFields = await analyzeArticle(
            article.title,
            article.description,
            article.body,
          );

          const updated = await updateArticleAI(article.articleId, aiFields);
          if (updated > 0) {
            enriched++;
          } else {
            console.warn(`[ai-enrich] Update returned 0 for ${article.articleId}`);
            failed++;
          }
        } catch (err) {
          console.warn(`[ai-enrich] Failed: ${article.articleId} - ${err.message}`);
          failed++;
        }
      }),
    ),
  );

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[ai-enrich] Finished in ${elapsed}s | enriched=${enriched} failed=${failed}`);

  return {
    statusCode: 200,
    body: JSON.stringify({ enriched, failed, durationSeconds: parseFloat(elapsed) }),
  };
}
