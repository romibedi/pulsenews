// ---------------------------------------------------------------------------
// Pipeline 1: Feed Ingestion Lambda
//
// Triggered every 15 minutes via EventBridge. Fetches RSS feeds, extracts
// article content, and writes to DynamoDB. AI analysis and TTS generation
// are handled by separate pipelines (ai-enrichment.js and tts-handler.js).
// ---------------------------------------------------------------------------

import { extract } from '@extractus/article-extractor';
import { buildFeedContextMap } from '../shared/feedRegistry.js';
import { parseRssFeed, fetchOgImage, resolveGoogleNewsUrl } from '../rss.js';
import { articleExists, batchWriteArticles } from '../db.js';
import { submitUrls, articleUrl, pingSitemap } from '../indexnow.js';
import { updateSitemaps } from '../sitemap/generate.js';
import { fetchGdeltArticles, buildGdeltContexts } from './gdelt.js';
import { ANALYSIS_DEFAULTS } from './ai-analysis.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Detect if an image URL is likely a site logo or generic placeholder
 * rather than an article-specific image.
 */
function isLogoOrPlaceholder(url) {
  if (!url) return true;
  const lower = url.toLowerCase();

  // Known generic images: Google News app logo
  if (lower.includes('lh3.googleusercontent.com/j6_cofb')) return true;

  // URL path contains "logo" (e.g., punch-logo-500x179-1.png)
  if (/[/\-_]logo[/\-_.\d]/i.test(lower)) return true;

  // Common placeholder/favicon patterns
  if (/[/\-_](favicon|placeholder|default[_-]?image|brand|icon)[/\-_.]/i.test(lower)) return true;

  // Very small images by dimension in URL (e.g., 16x16, 32x32, 100x50)
  const dimMatch = lower.match(/[/_-](\d+)x(\d+)/);
  if (dimMatch) {
    const w = parseInt(dimMatch[1]);
    const h = parseInt(dimMatch[2]);
    // Logos are typically very wide/short or very small
    if (w < 300 && h < 200 && (w / h > 2.5 || h / w > 2.5)) return true;
    if (w < 100 && h < 100) return true;
  }

  return false;
}

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
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<picture[\s\S]*?<\/picture>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
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
    case 'city':
      return `CITY#${ctx.city}`;
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
    case 'city':
      return { region: ctx.region, category: 'city', lang: 'en', city: ctx.city };
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

  const feedLimit = createLimiter(25);
  let totalIngested = 0;
  let totalSkipped = 0;
  let feedErrors = 0;
  const newArticleUrls = [];
  const newArticlesForSitemap = [];

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

            // 4. Resolve Google News redirect URLs to actual article URLs
            //    Google News RSS links are encrypted redirects — decode to get
            //    the real publisher URL for content extraction and OG images.
            //    Skip articles where the URL can't be decoded — they're useless
            //    (no real URL, no image, no body).
            const isGoogleNewsSource = article.url?.includes('news.google.com/rss/articles/');
            const realUrl = await resolveGoogleNewsUrl(article.url);
            const isGoogleNews = realUrl !== article.url;
            if (isGoogleNewsSource && !isGoogleNews) {
              totalSkipped++;
              continue;
            }

            // 5. Extract full article content (10s timeout per article)
            const extracted = await extractArticleContent(realUrl);
            const body = extracted.body || article.description || '';
            const author = extracted.author || article.author || source;

            // 6. Resolve image: prefer article-specific images over logos
            //    RSS feeds often embed site logos instead of article images.
            const rssImage = !isLogoOrPlaceholder(article.image) ? article.image : '';
            const extractedImage = !isLogoOrPlaceholder(extracted.image) ? extracted.image : '';
            let image = rssImage || extractedImage || '';
            if (!image) {
              try {
                const ogImg = await fetchOgImage(realUrl) || '';
                image = !isLogoOrPlaceholder(ogImg) ? ogImg : '';
              } catch {
                image = '';
              }
            }

            const date = article.date || new Date().toISOString();
            const slug = generateSlug(article.title, date);
            const now = new Date().toISOString();
            const ttl = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60);

            // AI analysis deferred to Pipeline 2 (ai-enrichment Lambda)
            const analysis = { ...ANALYSIS_DEFAULTS };

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
                url: isGoogleNews ? realUrl : article.url,
                source,
                region: fields.region,
                category: fields.category,
                lang: fields.lang,
                tags: article.tags || [],
                mood: analysis.mood,
                entities: analysis.entities,
                bestQuote: analysis.bestQuote,
                honestHeadline: analysis.honestHeadline,
                questions: analysis.questions,
                controversyScore: analysis.controversyScore,
                predictions: analysis.predictions,
                needsAI: true,
                isExternal: true,
                ttl,
                createdAt: now,
                slug,
              });
            }

            // 7. Write SITEMAP entry (one per unique article, with display fields for archive)
            const primaryCtx = contexts[0] ? contextFields(contexts[0]) : { category: 'world', lang: 'en' };
            items.push({
              PK: 'SITEMAP',
              SK: `${date}#${article.id}`,
              articleId: article.id,
              title: article.title,
              description: article.description,
              image,
              url: isGoogleNews ? realUrl : article.url,
              source,
              category: primaryCtx.category,
              lang: primaryCtx.lang,
              mood: analysis.mood,
              entities: analysis.entities,
              bestQuote: analysis.bestQuote,
              honestHeadline: analysis.honestHeadline,
              questions: analysis.questions,
              controversyScore: analysis.controversyScore,
              predictions: analysis.predictions,
              needsAI: true,
              slug,
              date,
              ttl,
              createdAt: now,
            });

            // Batch-write all items for this article
            await batchWriteArticles(items);
            totalIngested++;
            newArticleUrls.push(articleUrl(slug));
            newArticlesForSitemap.push({
              articleId: article.id,
              slug,
              title: article.title,
              description: article.description,
              image,
              date,
              source,
              category: primaryCtx.category,
              lang: primaryCtx.lang,
              mood: analysis.mood,
              entities: analysis.entities,
              bestQuote: analysis.bestQuote,
              honestHeadline: analysis.honestHeadline,
              questions: analysis.questions,
              controversyScore: analysis.controversyScore,
              predictions: analysis.predictions,
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

  // -----------------------------------------------------------------------
  // GDELT: Fetch articles from GDELT Project API (free, 100+ countries)
  // -----------------------------------------------------------------------
  let gdeltIngested = 0;
  try {
    const gdeltArticles = await fetchGdeltArticles('15min');
    console.log(`[ingest] Processing ${gdeltArticles.length} GDELT articles`);

    for (const article of gdeltArticles) {
      try {
        const exists = await articleExists(article.id);
        if (exists) {
          totalSkipped++;
          continue;
        }

        // GDELT provides title + URL + image but no body — extract content
        const extracted = await extractArticleContent(article.url);
        const body = extracted.body || '';
        const gdeltImg = !isLogoOrPlaceholder(article.image) ? article.image : '';
        const gdeltExtImg = !isLogoOrPlaceholder(extracted.image) ? extracted.image : '';
        const image = gdeltImg || gdeltExtImg || '';
        const author = extracted.author || article.source;

        const date = article.date || new Date().toISOString();
        const slug = generateSlug(article.title, date);
        const now = new Date().toISOString();
        const ttl = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60);

        // AI analysis deferred to Pipeline 2 (ai-enrichment Lambda)
        const analysis = { ...ANALYSIS_DEFAULTS };

        // Build contexts from GDELT metadata
        const contexts = buildGdeltContexts(article);
        const items = [];
        const seenPKs = new Set();

        for (const ctx of contexts) {
          const pk = buildPK(ctx);
          if (seenPKs.has(pk)) continue;
          seenPKs.add(pk);
          const fields = contextFields(ctx);

          items.push({
            PK: pk,
            SK: `${date}#${article.id}`,
            articleId: article.id,
            title: article.title,
            description: article.description || body.slice(0, 300),
            body,
            image,
            author,
            date,
            section: article.source,
            sectionId: article.source.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
            url: article.url,
            source: article.source,
            region: fields.region,
            category: fields.category,
            lang: fields.lang,
            tags: [],
            mood: analysis.mood,
            entities: analysis.entities,
            bestQuote: analysis.bestQuote,
            honestHeadline: analysis.honestHeadline,
            questions: analysis.questions,
            controversyScore: analysis.controversyScore,
            predictions: analysis.predictions,
            needsAI: true,
            isExternal: true,
            ttl,
            createdAt: now,
            slug,
          });
        }

        // SITEMAP entry
        const primaryFields = contexts[0] ? contextFields(contexts[0]) : { category: 'world', lang: 'en' };
        items.push({
          PK: 'SITEMAP',
          SK: `${date}#${article.id}`,
          articleId: article.id,
          title: article.title,
          description: article.description || body.slice(0, 300),
          image,
          url: article.url,
          source: article.source,
          category: primaryFields.category,
          lang: primaryFields.lang,
          mood: analysis.mood,
          entities: analysis.entities,
          bestQuote: analysis.bestQuote,
          honestHeadline: analysis.honestHeadline,
          questions: analysis.questions,
          controversyScore: analysis.controversyScore,
          predictions: analysis.predictions,
          needsAI: true,
          slug,
          date,
          ttl,
          createdAt: now,
        });

        await batchWriteArticles(items);
        totalIngested++;
        gdeltIngested++;
        newArticleUrls.push(articleUrl(slug));
        newArticlesForSitemap.push({
          articleId: article.id,
          slug,
          title: article.title,
          description: article.description || body.slice(0, 300),
          image,
          date,
          source: article.source,
          category: primaryFields.category,
          lang: primaryFields.lang,
          mood: analysis.mood,
          entities: analysis.entities,
          bestQuote: analysis.bestQuote,
          honestHeadline: analysis.honestHeadline,
          questions: analysis.questions,
          controversyScore: analysis.controversyScore,
          predictions: analysis.predictions,
        });
      } catch (err) {
        console.warn(`[ingest] GDELT article failed: ${article.url} - ${err.message}`);
      }
    }
    console.log(`[ingest] GDELT: ingested ${gdeltIngested} new articles`);
  } catch (err) {
    console.warn(`[ingest] GDELT fetch failed: ${err.message}`);
  }

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

  // Update S3 sitemaps (daily + news + index)
  try {
    await updateSitemaps(newArticlesForSitemap);
  } catch (err) {
    console.warn(`[ingest] Sitemap generation failed: ${err.message}`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(
    `[ingest] Finished in ${elapsed}s | ingested=${totalIngested} (gdelt=${gdeltIngested}) skipped=${totalSkipped} feedErrors=${feedErrors}`,
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      ingested: totalIngested,
      gdeltIngested,
      skipped: totalSkipped,
      feedErrors,
      durationSeconds: parseFloat(elapsed),
    }),
  };
}
