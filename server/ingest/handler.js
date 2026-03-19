// ---------------------------------------------------------------------------
// Ingestion Lambda for PulseNewsToday
//
// Triggered every 15 minutes via EventBridge.  Iterates every registered RSS
// feed, fetches new articles, extracts full-text content, and writes them to
// DynamoDB in all relevant PK partitions plus a SITEMAP entry.
// ---------------------------------------------------------------------------

import { extract } from '@extractus/article-extractor';
import { buildFeedContextMap } from '../shared/feedRegistry.js';
import { parseRssFeed, fetchOgImage } from '../rss.js';
import { articleExists, batchWriteArticles } from '../db.js';
import { submitUrls, articleUrl, pingSitemap } from '../indexnow.js';
import { generateBatch } from '../tts/generate.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Simple concurrency limiter (avoids adding p-limit as a dependency). */
function createLimiter(concurrency) {
  let active = 0;
  const queue = [];

  function next() {
    if (queue.length === 0 || active >= concurrency) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    fn().then(resolve, reject).finally(() => {
      active--;
      next();
    });
  }

  return function limit(fn) {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      next();
    });
  };
}

/**
 * Convert extracted HTML content to plain text with paragraph breaks preserved.
 * Mirrors the logic used by the /api/extract endpoint in app.js.
 */
function htmlToText(html) {
  if (!html) return '';
  return html
    .replace(/<\/?(p|div|br|h[1-6]|li|blockquote|section|article)[^>]*>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/&#\d+;/g, (m) => String.fromCharCode(parseInt(m.slice(2, -1))))
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Generate an SEO-friendly slug from a title and ISO date string. */
function generateSlug(title, date) {
  const datePrefix = date.slice(0, 10);
  let slug = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
  // For non-Latin titles, fall back to base64url of the title
  if (!slug || slug === '-') {
    slug = Buffer.from(title.slice(0, 60)).toString('base64url').slice(0, 40);
  }
  return `${datePrefix}-${slug}`;
}

/**
 * Build the PK string for a given context.
 *
 * Context shapes (from feedRegistry.js):
 *   { type: 'global',  category }              -> GLOBAL#CAT#<category>
 *   { type: 'region',  region, category? }      -> REGION#<region>#CAT#<category>
 *                                                  or REGION#<region> (no category)
 *   { type: 'lang',    lang }                   -> LANG#<lang>
 */
function buildPK(ctx) {
  switch (ctx.type) {
    case 'global':
      return `GLOBAL#CAT#${ctx.category}`;
    case 'region':
      return ctx.category
        ? `REGION#${ctx.region}#CAT#${ctx.category}`
        : `REGION#${ctx.region}`;
    case 'lang':
      return `LANG#${ctx.lang}`;
    default:
      return `UNKNOWN#${JSON.stringify(ctx)}`;
  }
}

/**
 * Derive region / category / lang fields for the article item from a context.
 */
function contextFields(ctx) {
  switch (ctx.type) {
    case 'global':
      return { region: 'global', category: ctx.category, lang: 'en' };
    case 'region':
      return {
        region: ctx.region,
        category: ctx.category || 'general',
        lang: 'en',
      };
    case 'lang':
      return { region: 'global', category: 'general', lang: ctx.lang };
    default:
      return { region: 'global', category: 'general', lang: 'en' };
  }
}

/**
 * Attempt full-text extraction for a URL with a 10 s timeout.
 * Returns { body, image, author } or nulls on failure.
 */
async function extractArticleContent(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const article = await extract(url, {}, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PulseNews/1.0)' },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    return {
      body: htmlToText(article?.content || ''),
      image: article?.image || null,
      author: article?.author || null,
    };
  } catch {
    return { body: '', image: null, author: null };
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function handler(event) {
  const startTime = Date.now();
  console.log('[ingest] Starting ingestion run');

  // 1. Build the deduplicated feed map
  const feedMap = buildFeedContextMap();
  console.log(`[ingest] ${feedMap.size} unique feed URLs to process`);

  const feedLimit = createLimiter(10);
  let totalIngested = 0;
  let totalSkipped = 0;
  let feedErrors = 0;
  const newArticleUrls = []; // Collect URLs for IndexNow submission
  const newArticlesForTts = []; // Collect articles for TTS generation

  // 2. Fetch all feeds concurrently (max 10 at a time)
  const feedEntries = [...feedMap.entries()];

  await Promise.all(
    feedEntries.map(([feedUrl, { source, contexts }]) =>
      feedLimit(async () => {
        let articles;
        try {
          const res = await fetch(feedUrl, {
            headers: { 'User-Agent': 'PulseNews/1.0' },
          });
          if (!res.ok) {
            console.warn(`[ingest] Feed HTTP ${res.status}: ${feedUrl}`);
            feedErrors++;
            return;
          }
          const xml = await res.text();
          articles = parseRssFeed(xml, source);
        } catch (err) {
          console.warn(`[ingest] Feed fetch failed: ${feedUrl} - ${err.message}`);
          feedErrors++;
          return;
        }

        if (!articles || articles.length === 0) return;

        // 3. Process each article from this feed
        for (const article of articles) {
          try {
            // Dedup check
            const exists = await articleExists(article.id);
            if (exists) {
              totalSkipped++;
              continue;
            }

            // 4. Extract full article content (10s timeout per article)
            const extracted = await extractArticleContent(article.url);
            const body = extracted.body || article.description || '';
            const author = extracted.author || article.author || source;

            // 5. Resolve image: RSS feed → article-extractor → OG scrape
            let image = article.image || extracted.image || '';
            if (!image) {
              try {
                image = await fetchOgImage(article.url) || '';
              } catch {
                image = '';
              }
            }

            const date = article.date || new Date().toISOString();
            const slug = generateSlug(article.title, date);
            const now = new Date().toISOString();
            const ttl = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60);

            // 6. Build DynamoDB items for ALL relevant PK partitions
            const items = [];
            const seenPKs = new Set();

            for (const ctx of contexts) {
              const pk = buildPK(ctx);
              // Avoid duplicate items for the same PK (possible if a URL
              // appears twice in the same registry section)
              if (seenPKs.has(pk)) continue;
              seenPKs.add(pk);

              const fields = contextFields(ctx);

              items.push({
                PK: pk,
                SK: `${date}#${article.id}`,
                articleId: article.id,
                title: article.title,
                description: article.description,
                body,
                image,
                author,
                date,
                section: source,
                sectionId: source.toLowerCase().replace(/\s+/g, '-'),
                url: article.url,
                source,
                region: fields.region,
                category: fields.category,
                lang: fields.lang,
                tags: article.tags || [],
                isExternal: true,
                ttl,
                createdAt: now,
                slug,
              });
            }

            // 7. Write SITEMAP entry (one per unique article)
            items.push({
              PK: 'SITEMAP',
              SK: `${date}#${article.id}`,
              articleId: article.id,
              title: article.title,
              url: article.url,
              slug,
              date,
              ttl,
              createdAt: now,
            });

            // Batch-write all items for this article
            await batchWriteArticles(items);
            totalIngested++;
            newArticleUrls.push(articleUrl(slug));
            // Collect for TTS generation (use first context's lang)
            const ttsLang = contexts[0] ? contextFields(contexts[0]).lang : 'en';
            newArticlesForTts.push({
              title: article.title,
              body,
              description: article.description,
              lang: ttsLang,
              slug,
            });
          } catch (err) {
            console.warn(
              `[ingest] Article processing failed: ${article.url} - ${err.message}`,
            );
            // Continue with the next article
          }
        }
      }),
    ),
  );

  // Submit new URLs to IndexNow for instant indexing by Bing/Yandex/etc.
  // Also ping Google & Bing with updated sitemap.
  if (newArticleUrls.length > 0) {
    try {
      await submitUrls(newArticleUrls);
    } catch (err) {
      console.warn(`[ingest] IndexNow submission failed: ${err.message}`);
    }
    try {
      await pingSitemap();
    } catch (err) {
      console.warn(`[ingest] Sitemap ping failed: ${err.message}`);
    }
  }

  // Pre-generate TTS audio and upload to S3
  if (newArticlesForTts.length > 0) {
    try {
      await generateBatch(newArticlesForTts, 20);
    } catch (err) {
      console.warn(`[ingest] TTS generation failed: ${err.message}`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(
    `[ingest] Finished in ${elapsed}s | ingested=${totalIngested} skipped=${totalSkipped} feedErrors=${feedErrors}`,
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      ingested: totalIngested,
      skipped: totalSkipped,
      feedErrors,
      durationSeconds: parseFloat(elapsed),
    }),
  };
}
