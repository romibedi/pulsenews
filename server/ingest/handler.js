// ---------------------------------------------------------------------------
// Ingestion Lambda for PulseNewsToday
//
// Triggered every 15 minutes via EventBridge.  Iterates every registered RSS
// feed, fetches new articles, extracts full-text content, and writes them to
// DynamoDB in all relevant PK partitions plus a SITEMAP entry.
// ---------------------------------------------------------------------------

import { extract } from '@extractus/article-extractor';
import { buildFeedContextMap } from '../shared/feedRegistry.js';
import { parseRssFeed, fetchOgImage, resolveGoogleNewsUrl } from '../rss.js';
import { articleExists, batchWriteArticles } from '../db.js';
import { submitUrls, articleUrl, pingSitemap } from '../indexnow.js';
import { generateBatch } from '../tts/generate.js';
import { updateSitemaps } from '../sitemap/generate.js';
import { fetchGdeltArticles, buildGdeltContexts } from './gdelt.js';

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
// Unified AI analysis via Claude Haiku
// ---------------------------------------------------------------------------

const ANALYSIS_DEFAULTS = { mood: 'neutral', entities: [], bestQuote: '', honestHeadline: '', questions: [], controversyScore: 0, predictions: [] };

const ANALYSIS_PROMPT = `Analyze this news article and return ONLY valid JSON (no markdown, no code blocks):
{
  "mood": "uplifting|neutral|investigative|breaking",
  "entities": [{"name": "...", "type": "person|company|place"}],
  "bestQuote": "most impactful direct quote from the article, or empty string if none",
  "honestHeadline": "a factual, de-clickbaited headline",
  "questions": ["what happened?", "who is affected?", "what happens next?"],
  "controversyScore": 0-100,
  "predictions": [{"claim": "...", "entity": "...", "targetDate": "..."}]
}

Rules:
- entities: extract up to 5 key people, companies, or places mentioned
- bestQuote: must be an actual quote from the text with attribution, empty string if no quotes found
- honestHeadline: rewrite the headline to be factual and clear, removing any clickbait
- questions: 3-5 natural questions this article answers
- controversyScore: 0=completely neutral factual, 100=extremely polarizing
- predictions: only include if the article contains forward-looking claims, otherwise empty array`;

/** Call Gemini 2.0 Flash for article analysis (~$0.0003/article). */
async function analyzeWithGemini(title, content) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${ANALYSIS_PROMPT}\n\nTitle: ${title}\n\n${content}` }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 500,
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return raw.trim();
}

/** Call Claude Haiku as fallback (~$0.005/article). */
async function analyzeWithHaiku(title, content) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: `${ANALYSIS_PROMPT}\n\nTitle: ${title}\n\n${content}` }],
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return (data.content?.[0]?.text || '').trim();
}

/**
 * Unified article analysis — tries Gemini Flash first (cheap), falls back to Haiku.
 * Set GEMINI_API_KEY to use Gemini, ANTHROPIC_API_KEY for Haiku fallback.
 */
async function analyzeArticle(title, description, body) {
  const content = (body || description || '').slice(0, 1500);
  if (!content && !title) return { ...ANALYSIS_DEFAULTS };

  try {
    // Try Gemini Flash first (17x cheaper), fall back to Haiku
    const raw = await analyzeWithGemini(title, content)
      || await analyzeWithHaiku(title, content);

    if (!raw) return { ...ANALYSIS_DEFAULTS };

    // Parse JSON (handle potential markdown code blocks)
    let parsed;
    try {
      const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');
      parsed = JSON.parse(jsonStr);
    } catch {
      const moodMatch = raw.match(/\b(uplifting|neutral|investigative|breaking)\b/);
      return { ...ANALYSIS_DEFAULTS, mood: moodMatch?.[1] || 'neutral' };
    }

    // Validate and sanitize
    const validMoods = ['uplifting', 'neutral', 'investigative', 'breaking'];
    return {
      mood: validMoods.includes(parsed.mood) ? parsed.mood : 'neutral',
      entities: Array.isArray(parsed.entities) ? parsed.entities.slice(0, 5).map(e => ({
        name: String(e.name || ''),
        type: ['person', 'company', 'place'].includes(e.type) ? e.type : 'person',
      })).filter(e => e.name) : [],
      bestQuote: String(parsed.bestQuote || ''),
      honestHeadline: String(parsed.honestHeadline || ''),
      questions: Array.isArray(parsed.questions) ? parsed.questions.slice(0, 5).map(String) : [],
      controversyScore: typeof parsed.controversyScore === 'number' ? Math.min(100, Math.max(0, Math.round(parsed.controversyScore))) : 0,
      predictions: Array.isArray(parsed.predictions) ? parsed.predictions.slice(0, 3).map(p => ({
        claim: String(p.claim || ''),
        entity: String(p.entity || ''),
        targetDate: String(p.targetDate || ''),
      })).filter(p => p.claim) : [],
    };
  } catch {
    return { ...ANALYSIS_DEFAULTS };
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
  const newArticlesForSitemap = []; // Collect articles for sitemap generation

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
            const realUrl = await resolveGoogleNewsUrl(article.url);
            const isGoogleNews = realUrl !== article.url;

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

            // 5b. Unified AI analysis via Claude Haiku
            const analysis = await analyzeArticle(article.title, article.description, body);

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
              slug,
              date,
              ttl,
              createdAt: now,
            });

            // Batch-write all items for this article
            await batchWriteArticles(items);
            totalIngested++;
            newArticleUrls.push(articleUrl(slug));
            // Collect for TTS generation (use first context's lang + region)
            const ttsCtx = contexts[0] ? contextFields(contexts[0]) : { lang: 'en', region: 'global' };
            newArticlesForTts.push({
              title: article.title,
              body,
              description: article.description,
              lang: ttsCtx.lang,
              region: ttsCtx.region,
              slug,
            });
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

        // Unified AI analysis via Claude Haiku
        const analysis = await analyzeArticle(article.title, article.description || body, body);

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
          slug,
          date,
          ttl,
          createdAt: now,
        });

        await batchWriteArticles(items);
        totalIngested++;
        gdeltIngested++;
        newArticleUrls.push(articleUrl(slug));

        const ttsLang = article._lang || 'en';
        const ttsRegion = article._region || 'global';
        newArticlesForTts.push({
          title: article.title,
          body,
          description: article.description,
          lang: ttsLang,
          region: ttsRegion,
          slug,
        });
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

  // Pre-generate TTS audio and upload to S3 (skip if SKIP_TTS is set)
  if (newArticlesForTts.length > 0 && !process.env.SKIP_TTS) {
    try {
      await generateBatch(newArticlesForTts, 20);
    } catch (err) {
      console.warn(`[ingest] TTS generation failed: ${err.message}`);
    }
  } else if (process.env.SKIP_TTS) {
    console.log(`[ingest] TTS skipped (SKIP_TTS=${process.env.SKIP_TTS})`);
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
