import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { extract } from '@extractus/article-extractor';
import { EdgeTTS, Communicate } from 'edge-tts-universal';
import { fetchFeed, parseRssFeed, fetchOgImage } from './rss.js';
import {
  FEEDS,
  REGIONAL_FEEDS,
  REGIONAL_CATEGORY_FEEDS,
  LANG_FEEDS,
} from './shared/feedRegistry.js';
import {
  getArticleById,
  getArticleBySlug,
  queryByGlobalCategory,
  queryByRegionCategory,
  queryByLang,
  queryByDate,
  querySitemapEntries,
} from './db.js';
import { getClient as getSearchClient } from './search/client.js';
import { indexName, supportedLanguages } from './search/mappings.js';
import {
  isBot,
  renderArticlePage,
  renderHomePage,
  renderCategoryPage,
} from './ssr.js';
import { INDEXNOW_KEY } from './indexnow.js';
import { generateCard } from './card.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

// --- Routes ---

// Category feeds — DynamoDB first, RSS fallback
// Supports ?before=<ISO-date> for pagination (load older articles)
app.get('/api/feeds', async (req, res) => {
  const category = req.query.category || 'world';
  const before = req.query.before || null;
  try {
    const dbArticles = await queryByGlobalCategory(category, 20, before);
    if (dbArticles.length > 0) {
      res.set('Cache-Control', before ? 'no-cache' : 's-maxage=300, stale-while-revalidate=600');
      return res.json({ articles: dbArticles });
    }
  } catch {}
  // Fallback to live RSS (no pagination for live feeds)
  if (!before) {
    const feeds = FEEDS[category] || FEEDS.world;
    const results = await Promise.all(feeds.map((f) => fetchFeed(f.url, f.source)));
    const articles = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);
    res.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.json({ articles });
  }
  res.json({ articles: [] });
});

// Regional local news — DynamoDB first, RSS fallback
app.get('/api/local', async (req, res) => {
  const region = req.query.region || 'us';
  try {
    const dbArticles = await queryByRegionCategory(region, 'general', 15);
    if (dbArticles.length > 0) {
      res.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
      return res.json({ articles: dbArticles, region });
    }
  } catch {}
  // Fallback to live RSS
  const feeds = REGIONAL_FEEDS[region] || REGIONAL_FEEDS['us'] || [];
  if (feeds.length === 0) return res.json({ articles: [], region });
  const results = await Promise.all(feeds.map((f) => fetchFeed(f.url, f.source)));
  const articles = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15);
  res.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.json({ articles, region });
});

// Regional category feeds — DynamoDB first, RSS fallback
// Supports ?before=<ISO-date> for pagination
app.get('/api/regional-feeds', async (req, res) => {
  const region = req.query.region || 'india';
  const category = req.query.category || 'world';
  const before = req.query.before || null;
  try {
    const dbArticles = await queryByRegionCategory(region, category, 20, before);
    if (dbArticles.length > 0) {
      res.set('Cache-Control', before ? 'no-cache' : 's-maxage=300, stale-while-revalidate=600');
      return res.json({ articles: dbArticles, region, category });
    }
  } catch {}
  // Fallback to live RSS (no pagination for live feeds)
  if (!before) {
    let feeds;
    if (REGIONAL_CATEGORY_FEEDS[region]?.[category]) {
      feeds = REGIONAL_CATEGORY_FEEDS[region][category];
    } else if (category === 'world' && REGIONAL_FEEDS[region]) {
      feeds = REGIONAL_FEEDS[region];
    } else {
      feeds = FEEDS[category] || FEEDS.world;
    }
    const results = await Promise.all(feeds.map((f) => fetchFeed(f.url, f.source)));
    const articles = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);
    res.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.json({ articles, region, category });
  }
  res.json({ articles: [], region, category });
});

// Language-specific news feeds — DynamoDB first, RSS fallback
// Supports ?before=<ISO-date> for pagination
app.get('/api/lang-feeds', async (req, res) => {
  const lang = req.query.lang || 'hi';
  const before = req.query.before || null;
  try {
    const dbArticles = await queryByLang(lang, 20, before);
    if (dbArticles.length > 0) {
      res.set('Cache-Control', before ? 'no-cache' : 's-maxage=300, stale-while-revalidate=600');
      return res.json({ articles: dbArticles, lang });
    }
  } catch {}
  // Fallback to live RSS (no pagination for live feeds)
  if (!before) {
    const feeds = LANG_FEEDS[lang];
    if (!feeds || feeds.length === 0) return res.json({ articles: [], lang });
    const results = await Promise.all(feeds.map((f) => fetchFeed(f.url, f.source)));
    const articles = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);
    res.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.json({ articles, lang });
  }
  res.json({ articles: [], lang });
});

// Archive — articles for a specific date, with optional region/lang filter
app.get('/api/archive', async (req, res) => {
  const date = req.query.date; // e.g. "2026-03-17"
  const region = req.query.region || null;
  const lang = req.query.lang || null;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'date required (YYYY-MM-DD)' });
  }
  try {
    const articles = await queryByDate(date, 100, { region, lang });
    res.set('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    res.json({ articles, date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Custom RSS feed proxy (CORS bypass)
app.get('/api/proxy-feed', async (req, res) => {
  const feedUrl = req.query.url;
  const name = req.query.name || 'Custom';
  if (!feedUrl) return res.status(400).json({ error: 'url required' });
  try {
    const feedRes = await fetch(feedUrl, { headers: { 'User-Agent': 'PulseNews/1.0' } });
    if (!feedRes.ok) return res.json({ articles: [] });
    const xml = await feedRes.text();
    const articles = parseRssFeed(xml, name);
    const needImage = articles.filter((a) => !a.image).slice(0, 10);
    if (needImage.length > 0) {
      const ogResults = await Promise.all(needImage.map((a) => fetchOgImage(a.url)));
      needImage.forEach((a, i) => { if (ogResults[i]) a.image = ogResults[i]; });
    }
    res.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.json({ articles });
  } catch {
    res.json({ articles: [] });
  }
});

// Article content extraction
app.get('/api/extract', async (req, res) => {
  const articleUrl = req.query.url;
  if (!articleUrl) return res.status(400).json({ error: 'url param required' });
  try {
    const article = await extract(articleUrl, {}, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PulseNews/1.0)' },
    });
    res.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.json({
      title: article?.title || '',
      content: article?.content || '',
      text: (article?.content || '')
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
        .replace(/\n{3,}/g, '\n\n')
        .trim(),
      image: article?.image || '',
      author: article?.author || '',
      published: article?.published || '',
      source: article?.source || '',
    });
  } catch (err) {
    res.json({ title: '', content: '', text: '', error: err.message });
  }
});

// AI summary via Claude
app.post('/api/summarize', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  const { title, body, lang = 'en' } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'title and body required' });
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{ role: 'user', content: `Summarize this news article in 2-3 concise sentences. Focus on the key facts.${langInstruction(lang)}\n\nTitle: ${title}\n\n${body.slice(0, 3000)}` }],
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }
    const data = await response.json();
    res.json({ summary: data.content?.[0]?.text || 'Could not generate summary.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ELI5 / Expert rewrite ---
app.post('/api/rewrite', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  const { title, body, mode = 'summary', lang = 'en' } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'title and body required' });

  const prompts = {
    simple: `Explain this news article in very simple terms, as if explaining to a 10-year-old. Use short sentences and everyday words. 3-4 sentences max.${langInstruction(lang)}`,
    summary: `Summarize this news article in 2-3 concise sentences. Focus on the key facts.${langInstruction(lang)}`,
    expert: `Provide a detailed, technical analysis of this news article. Include context, broader implications, and relevant background. Use domain-specific terminology where appropriate. 4-6 sentences.${langInstruction(lang)}`,
  };

  const maxTokens = { simple: 250, summary: 200, expert: 500 };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: maxTokens[mode] || 200,
        messages: [{ role: 'user', content: `${prompts[mode] || prompts.summary}\n\nTitle: ${title}\n\n${body.slice(0, 3000)}` }],
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }
    const data = await response.json();
    res.json({ text: data.content?.[0]?.text || 'Could not generate rewrite.', mode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CoinGecko crypto ticker proxy
const stockCache = { data: null, ts: 0 };
app.get('/api/stocks', async (req, res) => {
  if (stockCache.data && Date.now() - stockCache.ts < 5 * 60 * 1000) return res.json(stockCache.data);
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h',
      { headers: { Accept: 'application/json' } }
    );
    if (!response.ok) throw new Error(`CoinGecko error: ${response.status}`);
    const coins = await response.json();
    const data = coins.map((c) => ({
      id: c.id, symbol: c.symbol.toUpperCase(), name: c.name,
      price: c.current_price, change24h: c.price_change_percentage_24h,
      image: c.image, marketCap: c.market_cap,
    }));
    stockCache.data = data;
    stockCache.ts = Date.now();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Language display names (used in AI prompts)
const LANG_NAMES = {
  en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu', bn: 'Bengali',
  mr: 'Marathi', ur: 'Urdu', ar: 'Arabic', fr: 'French', de: 'German',
  es: 'Spanish', pt: 'Portuguese', zh: 'Chinese', ja: 'Japanese',
  ko: 'Korean', sw: 'Swahili',
};

// Helper: build language instruction for AI prompts
function langInstruction(lang) {
  if (!lang || lang === 'en') return '';
  const name = LANG_NAMES[lang] || 'English';
  return ` Respond entirely in ${name}.`;
}

// TTS voice map — defaults per language
const TTS_VOICES = {
  en: 'en-IN-NeerjaNeural',
  hi: 'hi-IN-SwaraNeural',
  ta: 'ta-IN-PallaviNeural',
  te: 'te-IN-ShrutiNeural',
  bn: 'bn-IN-TanishaaNeural',
  mr: 'mr-IN-AarohiNeural',
  ur: 'ur-PK-UzmaNeural',
  ar: 'ar-SA-ZariyahNeural',
  fr: 'fr-FR-DeniseNeural',
  de: 'de-DE-KatjaNeural',
  es: 'es-ES-ElviraNeural',
  pt: 'pt-BR-FranciscaNeural',
  zh: 'zh-CN-XiaoxiaoNeural',
  ja: 'ja-JP-NanamiNeural',
  ko: 'ko-KR-SunHiNeural',
  sw: 'sw-KE-ZuriNeural',
};

// Regional accent voices — keyed by lang, then region
const REGIONAL_VOICES = {
  en: {
    us: 'en-US-JennyNeural',
    uk: 'en-GB-SoniaNeural',
    australia: 'en-AU-NatashaNeural',
    india: 'en-IN-NeerjaNeural',
  },
  es: {
    latam: 'es-MX-DaliaNeural',
    europe: 'es-ES-ElviraNeural',
    us: 'es-MX-DaliaNeural',
  },
  pt: {
    latam: 'pt-BR-FranciscaNeural',
    europe: 'pt-PT-RaquelNeural',
  },
  fr: {
    europe: 'fr-FR-DeniseNeural',
    africa: 'fr-FR-DeniseNeural',
  },
  ar: {
    'middle-east': 'ar-SA-ZariyahNeural',
    africa: 'ar-EG-SalmaNeural',
  },
  zh: {
    asia: 'zh-CN-XiaoxiaoNeural',
  },
};

// Resolve the best TTS voice for a lang+region combo
function resolveVoice(lang, region) {
  const regionalMap = REGIONAL_VOICES[lang];
  if (regionalMap && region && regionalMap[region]) return regionalMap[region];
  return TTS_VOICES[lang] || TTS_VOICES.en;
}

// Keep backward compat alias
const EN_REGION_VOICES = REGIONAL_VOICES.en;

// Text-to-Speech via Edge TTS (GET for short text / prefetch, POST for longer)
async function handleTts(text, lang, region, res) {
  if (!text) return res.status(400).json({ error: 'text param required' });

  const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 2000);
  const voice = resolveVoice(lang, region);

  try {
    const comm = new Communicate(cleanText, { voice, rate: '+20%' });
    res.set('Content-Type', 'audio/mpeg');
    res.set('Transfer-Encoding', 'chunked');
    res.set('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    for await (const chunk of comm.stream()) {
      if (chunk.type === 'audio' && chunk.data) res.write(chunk.data);
    }
    res.end();
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.end();
    }
  }
}

app.get('/api/tts', (req, res) => {
  handleTts(req.query.text, req.query.lang || 'en', req.query.region || '', res);
});

app.post('/api/tts', express.json(), (req, res) => {
  handleTts(req.body.text, req.body.lang || 'en', req.body.region || '', res);
});

// --- DynamoDB-backed article endpoints (SEO / archive) ---

// Get article by SEO slug (DynamoDB) — must be before :id to avoid "slug" matching as id
app.get('/api/article/slug/:slug', async (req, res) => {
  try {
    const article = await getArticleBySlug(req.params.slug);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.set('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get article by ID (DynamoDB)
app.get('/api/article/:id', async (req, res) => {
  try {
    const article = await getArticleById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.set('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Shareable News Cards ---
app.get('/api/card/:id', async (req, res) => {
  const format = req.query.format || 'story'; // story | square | wide
  try {
    const article = await getArticleById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    const png = await generateCard(article, format);
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.send(Buffer.from(png));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Voice-First News Query ---
app.post('/api/voice-query', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  const { query, lang = 'en', region = '' } = req.body;
  if (!query) return res.status(400).json({ error: 'query required' });

  try {
    // Step 1: Extract intent from user query
    const intentRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 150,
        messages: [{ role: 'user', content: `Extract the user's news intent from this query. The query may be in any language — always return the JSON fields in English. Return ONLY valid JSON with these fields: { "category": "world|technology|business|science|sport|culture|environment|politics|null", "topic": "specific topic in English or null", "count": 3 }\n\nQuery: "${query}"` }],
      }),
    });
    if (!intentRes.ok) throw new Error('Intent detection failed');
    const intentData = await intentRes.json();
    let intent;
    try {
      const raw = intentData.content?.[0]?.text || '{}';
      intent = JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim());
    } catch { intent = { category: 'world', count: 3 }; }

    const count = Math.min(intent.count || 3, 5);

    // Step 2: Fetch relevant articles
    let articles = [];
    if (intent.topic) {
      // Search by topic using OpenSearch
      try {
        const client = getSearchClient();
        const idx = lang === 'all' ? 'articles-*' : `articles-${lang}`;
        const result = await client.search({
          index: idx,
          body: {
            query: { multi_match: { query: intent.topic, fields: ['title^3', 'description^2', 'body'], fuzziness: 'AUTO' } },
            sort: [{ _score: 'desc' }, { date: 'desc' }],
            size: count,
            _source: { excludes: ['body'] },
          },
        });
        articles = result.body.hits.hits.map((h) => h._source);
      } catch {
        // Fallback to category-based fetch
      }
    }
    if (articles.length === 0) {
      const cat = intent.category || 'world';
      articles = await queryByGlobalCategory(cat, count);
    }

    if (articles.length === 0) {
      return res.json({ briefing: 'No news articles found for your query.', articles: [] });
    }

    // Step 3: Generate conversational briefing
    const articleSummaries = articles.map((a, i) =>
      `Article ${i + 1}: "${a.title}" (${a.source || a.author || 'Unknown'}) - ${(a.description || '').slice(0, 200)}`
    ).join('\n');

    const briefingRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{ role: 'user', content: `You are a friendly news anchor. Summarize these ${articles.length} articles into a conversational ${articles.length > 1 ? '60-second' : '30-second'} audio briefing. Use natural transitions like "Moving on..." or "In other news...". Keep it warm, clear, and spoken-word friendly. Do NOT use bullet points or formatting.${langInstruction(lang)}\n\n${articleSummaries}` }],
      }),
    });
    if (!briefingRes.ok) throw new Error('Briefing generation failed');
    const briefingData = await briefingRes.json();
    const briefing = briefingData.content?.[0]?.text || 'Could not generate briefing.';

    res.json({
      briefing,
      articles: articles.map((a) => ({
        id: a.articleId || a.id,
        title: a.title,
        source: a.source,
        date: a.date,
        image: a.image,
        slug: a.slug,
      })),
      intent,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Story Threads: find related articles ---
app.get('/api/threads/:id', async (req, res) => {
  try {
    // Accept article title+category+lang via query params as fallback when article isn't in DynamoDB
    const title = req.query.title || '';
    const category = req.query.category || 'world';
    const userLang = req.query.lang || 'en';

    let article = null;
    try {
      article = await getArticleById(req.params.id);
    } catch {}

    // If article not in DynamoDB, construct a minimal object from query params
    if (!article && !title) {
      return res.json({ article: null, thread: [], threadSummary: null, count: 0 });
    }
    const articleTitle = article?.title || title;
    const articleId = article?.articleId || req.params.id;
    const lang = article?.lang || 'en';
    const cat = article?.category || category;

    let relatedArticles = [];

    // Try OpenSearch more_like_this
    try {
      const client = getSearchClient();
      const result = await client.search({
        index: `articles-${lang}`,
        body: {
          query: {
            bool: {
              must: [{
                more_like_this: {
                  fields: ['title', 'description'],
                  like: articleTitle,
                  min_term_freq: 1,
                  min_doc_freq: 1,
                  minimum_should_match: '25%',
                  max_query_terms: 25,
                },
              }],
              must_not: [{ term: { articleId } }],
            },
          },
          sort: [{ _score: 'desc' }, { date: 'desc' }],
          size: 15,
          _source: ['articleId', 'title', 'description', 'source', 'date', 'image', 'slug', 'category', 'section'],
        },
      });
      relatedArticles = result.body.hits.hits.map((h) => ({ ...h._source, score: h._score }));
    } catch {}

    // Fallback to DynamoDB category if OpenSearch returned nothing
    if (relatedArticles.length === 0) {
      try {
        const catArticles = await queryByGlobalCategory(cat, 20);
        relatedArticles = catArticles
          .filter((a) => (a.articleId || a.id) !== articleId)
          .slice(0, 10);
      } catch {}
    }

    // Generate thread summary if we have 2+ related articles
    let threadSummary = null;
    if (relatedArticles.length >= 2) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (apiKey) {
        try {
          const allForSummary = [
            { title: articleTitle, source: article?.source || '', date: article?.date || '' },
            ...relatedArticles.slice(0, 5),
          ];
          const titles = allForSummary
            .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
            .map((a) => `- "${a.title}" (${a.source || ''}, ${a.date ? new Date(a.date).toLocaleDateString() : ''})`)
            .join('\n');

          const summaryRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify({
              model: 'claude-haiku-4-5-20251001',
              max_tokens: 200,
              messages: [{ role: 'user', content: `These articles are about the same ongoing story. Write a 2-3 sentence catch-up summary for someone who just discovered this story. Be concise and factual. Write for spoken delivery.${langInstruction(userLang)}\n\n${titles}` }],
            }),
          });
          if (summaryRes.ok) {
            const d = await summaryRes.json();
            threadSummary = d.content?.[0]?.text || null;
          }
        } catch {}
      }
    }

    res.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.json({
      article: {
        id: articleId,
        title: articleTitle,
        date: article?.date || '',
      },
      thread: relatedArticles.map((a) => ({
        id: a.articleId || a.id,
        title: a.title,
        description: a.description,
        source: a.source,
        date: a.date,
        image: a.image,
        slug: a.slug,
        section: a.section,
      })),
      threadSummary,
      count: relatedArticles.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sitemap index — splits into news sitemap (recent articles) and static sitemap (pages)
app.get('/api/sitemap.xml', (req, res) => {
  const baseUrl = process.env.SITE_URL || 'https://pulsenewstoday.com';
  const now = new Date().toISOString();
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  xml += `  <sitemap>\n    <loc>${baseUrl}/api/sitemap-static.xml</loc>\n    <lastmod>${now.slice(0, 10)}</lastmod>\n  </sitemap>\n`;
  xml += `  <sitemap>\n    <loc>${baseUrl}/api/sitemap-news.xml</loc>\n    <lastmod>${now.slice(0, 10)}</lastmod>\n  </sitemap>\n`;
  xml += '</sitemapindex>';
  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
  res.send(xml);
});

// Static sitemap — homepage, categories, regions, static pages
app.get('/api/sitemap-static.xml', (req, res) => {
  const baseUrl = process.env.SITE_URL || 'https://pulsenewstoday.com';
  const categories = ['world', 'technology', 'business', 'science', 'sport', 'culture', 'environment', 'politics', 'ai', 'entertainment', 'gaming', 'cricket', 'startups', 'space', 'crypto'];
  const regions = ['india', 'uk', 'us', 'australia', 'middle-east', 'europe', 'africa', 'asia', 'latam'];
  const staticPages = ['about', 'archive', 'search', 'explore', 'feeds', 'bookmarks'];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Homepage
  xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>hourly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  // Category pages
  for (const cat of categories) {
    xml += `  <url>\n    <loc>${baseUrl}/category/${cat}</loc>\n    <changefreq>hourly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  // Region pages
  for (const r of regions) {
    xml += `  <url>\n    <loc>${baseUrl}/region/${r}</loc>\n    <changefreq>hourly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  // Static pages
  for (const page of staticPages) {
    xml += `  <url>\n    <loc>${baseUrl}/${page}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.4</priority>\n  </url>\n`;
  }

  xml += '</urlset>';
  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 's-maxage=86400, stale-while-revalidate=172800');
  res.send(xml);
});

// News sitemap — recent articles with Google News + image metadata
app.get('/api/sitemap-news.xml', async (req, res) => {
  try {
    const entries = await querySitemapEntries(1000);
    const baseUrl = process.env.SITE_URL || 'https://pulsenewstoday.com';
    const escXml = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
    xml += ' xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"';
    xml += ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    for (const entry of entries) {
      const loc = entry.slug ? `${baseUrl}/news/${entry.slug}` : `${baseUrl}/article/${encodeURIComponent(entry.id)}`;
      const pubDate = entry.date || new Date().toISOString();
      const lang = entry.lang || 'en';

      // Build keywords from category + source
      const keywords = [entry.category, entry.source, entry.mood].filter(Boolean).join(', ');

      xml += `  <url>\n`;
      xml += `    <loc>${escXml(loc)}</loc>\n`;
      if (entry.date) xml += `    <lastmod>${entry.date.slice(0, 10)}</lastmod>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `    <news:news>\n`;
      xml += `      <news:publication>\n`;
      xml += `        <news:name>PulseNewsToday</news:name>\n`;
      xml += `        <news:language>${escXml(lang)}</news:language>\n`;
      xml += `      </news:publication>\n`;
      xml += `      <news:publication_date>${escXml(pubDate)}</news:publication_date>\n`;
      xml += `      <news:title>${escXml(entry.title || 'News')}</news:title>\n`;
      if (keywords) xml += `      <news:keywords>${escXml(keywords)}</news:keywords>\n`;
      xml += `    </news:news>\n`;

      // Image metadata for Google Images
      if (entry.image) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${escXml(entry.image)}</image:loc>\n`;
        xml += `      <image:title>${escXml(entry.title || 'News')}</image:title>\n`;
        xml += `    </image:image>\n`;
      }

      xml += `  </url>\n`;
    }
    xml += '</urlset>';
    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    res.send(xml);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Full-text search via OpenSearch ---

app.get('/api/search', async (req, res) => {
  const q = req.query.q;
  const lang = req.query.lang || 'all';
  const category = req.query.category;
  const region = req.query.region;
  const from = parseInt(req.query.from) || 0;
  const size = Math.min(parseInt(req.query.size) || 20, 50);

  if (!q || q.trim().length === 0) {
    return res.status(400).json({ error: 'q param required' });
  }

  // Determine which index(es) to search
  const supported = new Set(supportedLanguages());
  let targetIndex;
  if (lang === 'all') {
    targetIndex = 'articles-*';
  } else if (supported.has(lang)) {
    targetIndex = indexName(lang);
  } else {
    targetIndex = 'articles-*';
  }

  // Build the search query
  const must = [
    {
      multi_match: {
        query: q.trim(),
        fields: ['title^3', 'description^2', 'body'],
        type: 'best_fields',
        fuzziness: 'AUTO',
      },
    },
  ];

  const filter = [];
  if (category) filter.push({ term: { category } });
  if (region) filter.push({ term: { region } });

  const searchBody = {
    query: {
      bool: {
        must,
        ...(filter.length > 0 ? { filter } : {}),
      },
    },
    sort: [{ _score: 'desc' }, { date: 'desc' }],
    from,
    size,
    highlight: {
      pre_tags: ['<mark>'],
      post_tags: ['</mark>'],
      fields: {
        title: { number_of_fragments: 0 },
        description: { number_of_fragments: 1, fragment_size: 200 },
        body: { number_of_fragments: 2, fragment_size: 150 },
      },
    },
    _source: {
      excludes: ['body'],
    },
  };

  try {
    const client = getSearchClient();
    const result = await client.search({
      index: targetIndex,
      body: searchBody,
    });

    const hits = result.body.hits;
    const articles = hits.hits.map((hit) => ({
      id: hit._source.articleId,
      ...hit._source,
      score: hit._score,
      highlight: hit.highlight || {},
    }));

    res.set('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    res.json({
      articles,
      total: hits.total?.value || 0,
      from,
      size,
      query: q,
      lang,
    });
  } catch (err) {
    // If OpenSearch is not available, fall back to basic in-memory search
    if (err.message?.includes('OPENSEARCH_ENDPOINT') || err.name === 'ConnectionError') {
      try {
        const dbArticles = await queryByGlobalCategory('world', 100);
        const qLower = q.trim().toLowerCase();
        const matched = dbArticles.filter(
          (a) =>
            a.title?.toLowerCase().includes(qLower) ||
            a.description?.toLowerCase().includes(qLower),
        );
        return res.json({
          articles: matched.slice(from, from + size),
          total: matched.length,
          from,
          size,
          query: q,
          lang,
          fallback: true,
        });
      } catch {
        return res.status(500).json({ error: 'Search unavailable' });
      }
    }
    res.status(500).json({ error: err.message });
  }
});

// robots.txt
app.get('/robots.txt', (req, res) => {
  const siteUrl = process.env.SITE_URL || 'https://www.pulsenewstoday.com';
  res.set('Content-Type', 'text/plain');
  res.set('Cache-Control', 's-maxage=86400');
  res.send(`# PulseNewsToday robots.txt
User-agent: *
Allow: /
Disallow: /api/
Allow: /api/sitemap.xml

# Search engine bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# AI crawlers — allowed so our content gets cited
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${siteUrl}/api/sitemap.xml
Sitemap: ${siteUrl}/api/sitemap-news.xml
Sitemap: ${siteUrl}/api/sitemap-static.xml
`);
});

// llms.txt — helps AI systems understand the site
app.get('/llms.txt', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.set('Cache-Control', 's-maxage=86400');
  res.send(`# PulseNewsToday
> A multilingual news aggregator covering world, technology, business, science, sport, culture, environment, and politics.

PulseNewsToday aggregates breaking news from trusted sources including BBC, Guardian, Al Jazeera, Reuters, and regional publishers across 16 languages.

## Content
- /news/{slug} — Individual news articles with full text
- /category/{category} — Category pages (world, technology, business, science, sport, culture, environment, politics)
- /api/sitemap.xml — Full sitemap with all article URLs
- /api/search?q={query}&lang={lang} — Search articles by keyword

## Structured Data
All pages include JSON-LD structured data (NewsArticle, WebSite, BreadcrumbList) and Open Graph metadata.
`);
});

// IndexNow key verification — search engines fetch this to verify ownership
app.get(`/${INDEXNOW_KEY}.txt`, (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.set('Cache-Control', 's-maxage=86400');
  res.send(INDEXNOW_KEY);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- SEO: Pre-rendered pages for search engine bots ---

// Home page for bots — fetch latest articles so crawlers see real content
app.get('/', async (req, res, next) => {
  if (!isBot(req.headers['user-agent'])) return next();
  let articles = [];
  try { articles = await queryByGlobalCategory('world', 20); } catch {}
  res.set('Content-Type', 'text/html');
  res.set('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
  res.send(renderHomePage(articles));
});

// Article page by slug for bots
app.get('/news/:slug', async (req, res, next) => {
  if (!isBot(req.headers['user-agent'])) return next();
  try {
    const article = await getArticleBySlug(req.params.slug);
    if (!article) return next();
    res.set('Content-Type', 'text/html');
    res.set('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.send(renderArticlePage(article));
  } catch {
    next();
  }
});

// Article page by ID for bots (fallback for non-slug URLs)
app.get('/article/:id', async (req, res, next) => {
  if (!isBot(req.headers['user-agent'])) return next();
  try {
    const article = await getArticleById(req.params.id);
    if (!article) return next();
    res.set('Content-Type', 'text/html');
    res.set('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.send(renderArticlePage(article));
  } catch {
    next();
  }
});

// Category page for bots — fetch category articles so crawlers see real content
app.get('/category/:cat', async (req, res, next) => {
  if (!isBot(req.headers['user-agent'])) return next();
  let articles = [];
  try { articles = await queryByGlobalCategory(req.params.cat, 20); } catch {}
  res.set('Content-Type', 'text/html');
  res.set('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
  res.send(renderCategoryPage(req.params.cat, articles));
});

// --- Static files + SPA fallback (for App Runner / container deployment) ---
// Serve Vite-built assets with long cache (filenames are content-hashed)
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',
  immutable: true,
  index: false, // Don't auto-serve index.html for '/' — let SSR routes handle it
}));

// SPA fallback: all non-API, non-bot routes serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

export default app;
