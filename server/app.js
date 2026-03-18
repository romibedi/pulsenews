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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

// --- Routes ---

// Category feeds — DynamoDB first, RSS fallback
app.get('/api/feeds', async (req, res) => {
  const category = req.query.category || 'world';
  try {
    const dbArticles = await queryByGlobalCategory(category, 20);
    if (dbArticles.length > 0) {
      res.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
      return res.json({ articles: dbArticles });
    }
  } catch {}
  // Fallback to live RSS
  const feeds = FEEDS[category] || FEEDS.world;
  const results = await Promise.all(feeds.map((f) => fetchFeed(f.url, f.source)));
  const articles = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);
  res.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.json({ articles });
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
app.get('/api/regional-feeds', async (req, res) => {
  const region = req.query.region || 'india';
  const category = req.query.category || 'world';
  try {
    const dbArticles = await queryByRegionCategory(region, category, 20);
    if (dbArticles.length > 0) {
      res.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
      return res.json({ articles: dbArticles, region, category });
    }
  } catch {}
  // Fallback to live RSS
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
  res.json({ articles, region, category });
});

// Language-specific news feeds — DynamoDB first, RSS fallback
app.get('/api/lang-feeds', async (req, res) => {
  const lang = req.query.lang || 'hi';
  try {
    const dbArticles = await queryByLang(lang, 20);
    if (dbArticles.length > 0) {
      res.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
      return res.json({ articles: dbArticles, lang });
    }
  } catch {}
  // Fallback to live RSS
  const feeds = LANG_FEEDS[lang];
  if (!feeds || feeds.length === 0) return res.json({ articles: [], lang });
  const results = await Promise.all(feeds.map((f) => fetchFeed(f.url, f.source)));
  const articles = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);
  res.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.json({ articles, lang });
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
  const { title, body } = req.body;
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
        messages: [{ role: 'user', content: `Summarize this news article in 2-3 concise sentences. Focus on the key facts.\n\nTitle: ${title}\n\n${body.slice(0, 3000)}` }],
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

// TTS voice map
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
const EN_REGION_VOICES = {
  us: 'en-US-JennyNeural',
  uk: 'en-GB-SoniaNeural',
  australia: 'en-AU-NatashaNeural',
  india: 'en-IN-NeerjaNeural',
};

// Text-to-Speech via Edge TTS
app.post('/api/tts', express.json(), async (req, res) => {
  const text = req.body.text;
  const lang = req.body.lang || 'en';
  const region = req.body.region || '';
  if (!text) return res.status(400).json({ error: 'text param required' });

  const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 2000);
  const voice = (lang === 'en' && EN_REGION_VOICES[region]) || TTS_VOICES[lang] || TTS_VOICES.en;

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

// Sitemap.xml for SEO + Google News
app.get('/api/sitemap.xml', async (req, res) => {
  try {
    const entries = await querySitemapEntries(1000);
    const baseUrl = process.env.SITE_URL || 'https://pulsenewstoday.com';
    const escXml = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n';

    // Homepage
    xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>hourly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // Category pages
    for (const cat of ['world', 'technology', 'business', 'science', 'sport', 'culture', 'environment', 'politics']) {
      xml += `  <url>\n    <loc>${baseUrl}/category/${cat}</loc>\n    <changefreq>hourly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    // Article pages with Google News metadata
    for (const entry of entries) {
      const loc = entry.slug ? `${baseUrl}/news/${entry.slug}` : `${baseUrl}/article/${encodeURIComponent(entry.id)}`;
      const pubDate = entry.date || new Date().toISOString();
      const lang = entry.lang || 'en';
      xml += `  <url>\n`;
      xml += `    <loc>${escXml(loc)}</loc>\n`;
      if (entry.date) xml += `    <lastmod>${entry.date.slice(0, 10)}</lastmod>\n`;
      xml += `    <news:news>\n`;
      xml += `      <news:publication>\n`;
      xml += `        <news:name>PulseNewsToday</news:name>\n`;
      xml += `        <news:language>${escXml(lang)}</news:language>\n`;
      xml += `      </news:publication>\n`;
      xml += `      <news:publication_date>${escXml(pubDate)}</news:publication_date>\n`;
      xml += `      <news:title>${escXml(entry.title || 'News')}</news:title>\n`;
      xml += `    </news:news>\n`;
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
