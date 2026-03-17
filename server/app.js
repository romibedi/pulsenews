import express from 'express';
import cors from 'cors';
import { extract } from '@extractus/article-extractor';
import { fetchFeed, parseRssFeed, fetchOgImage } from './rss.js';

const app = express();
app.use(cors());
app.use(express.json());

// --- Feed configs ---
const FEEDS = {
  world: [
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC News' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
    { url: 'https://feeds.npr.org/1004/rss.xml', source: 'NPR' },
    { url: 'https://abcnews.go.com/abcnews/internationalheadlines', source: 'ABC News' },
  ],
  technology: [
    { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Tech' },
    { url: 'https://feeds.npr.org/1019/rss.xml', source: 'NPR Tech' },
    { url: 'https://feeds.arstechnica.com/arstechnica/index', source: 'Ars Technica' },
  ],
  business: [
    { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business' },
    { url: 'https://feeds.npr.org/1006/rss.xml', source: 'NPR Business' },
  ],
  science: [
    { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', source: 'BBC Science' },
    { url: 'https://feeds.npr.org/1007/rss.xml', source: 'NPR Science' },
  ],
  sport: [
    { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport' },
  ],
  culture: [
    { url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', source: 'BBC Arts' },
    { url: 'https://feeds.npr.org/1008/rss.xml', source: 'NPR Arts' },
  ],
  environment: [
    { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', source: 'BBC Environment' },
  ],
  politics: [
    { url: 'https://feeds.bbci.co.uk/news/politics/rss.xml', source: 'BBC Politics' },
    { url: 'https://feeds.npr.org/1014/rss.xml', source: 'NPR Politics' },
  ],
};

const REGIONAL_FEEDS = {
  india: [
    { url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', source: 'Times of India' },
    { url: 'https://www.thehindu.com/news/national/feeder/default.rss', source: 'The Hindu' },
    { url: 'https://indianexpress.com/feed/', source: 'Indian Express' },
    { url: 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml', source: 'BBC India' },
  ],
  uk: [
    { url: 'https://feeds.bbci.co.uk/news/uk/rss.xml', source: 'BBC UK' },
    { url: 'https://feeds.bbci.co.uk/news/england/rss.xml', source: 'BBC England' },
    { url: 'https://feeds.skynews.com/feeds/rss/uk.xml', source: 'Sky News UK' },
  ],
  us: [
    { url: 'https://feeds.npr.org/1003/rss.xml', source: 'NPR US' },
    { url: 'https://abcnews.go.com/abcnews/usheadlines', source: 'ABC US' },
    { url: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml', source: 'BBC US' },
  ],
  australia: [
    { url: 'https://www.abc.net.au/news/feed/2942460/rss.xml', source: 'ABC Australia' },
    { url: 'https://feeds.bbci.co.uk/news/world/australia/rss.xml', source: 'BBC Australia' },
  ],
  'middle-east': [
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
    { url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', source: 'BBC Middle East' },
  ],
  europe: [
    { url: 'https://feeds.bbci.co.uk/news/world/europe/rss.xml', source: 'BBC Europe' },
    { url: 'https://www.rfi.fr/en/rss', source: 'RFI' },
  ],
  africa: [
    { url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml', source: 'BBC Africa' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
  ],
  asia: [
    { url: 'https://feeds.bbci.co.uk/news/world/asia/rss.xml', source: 'BBC Asia' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
  ],
  latam: [
    { url: 'https://feeds.bbci.co.uk/news/world/latin_america/rss.xml', source: 'BBC Latin America' },
  ],
};

// Language-specific feeds (Indian languages)
const LANG_FEEDS = {
  hi: [
    { url: 'https://feeds.bbci.co.uk/hindi/rss.xml', source: 'BBC Hindi' },
    { url: 'https://rss.jagran.com/rss/news/national.xml', source: 'Dainik Jagran' },
    { url: 'https://www.amarujala.com/rss/breaking-news.xml', source: 'Amar Ujala' },
    { url: 'https://www.bhaskar.com/rss-feed/1061/', source: 'Dainik Bhaskar' },
  ],
  ta: [
    { url: 'https://feeds.bbci.co.uk/tamil/rss.xml', source: 'BBC Tamil' },
    { url: 'https://www.hindutamil.in/stories.rss', source: 'The Hindu Tamil' },
  ],
  te: [
    { url: 'https://feeds.bbci.co.uk/telugu/rss.xml', source: 'BBC Telugu' },
    { url: 'https://www.sakshi.com/rss.xml', source: 'Sakshi' },
  ],
  bn: [
    { url: 'https://feeds.bbci.co.uk/bengali/rss.xml', source: 'BBC Bangla' },
    { url: 'https://eisamay.com/stories.rss', source: 'Ei Samay' },
    { url: 'https://zeenews.india.com/bengali/rssfeed/nation.xml', source: 'Zee News Bengali' },
  ],
  mr: [
    { url: 'https://zeenews.india.com/marathi/rss/india-news.xml', source: 'Zee News Marathi' },
    { url: 'https://zeenews.india.com/marathi/rss/maharashtra-news.xml', source: 'Zee News Maharashtra' },
  ],
};

// --- Routes ---

// RSS category feeds
app.get('/api/feeds', async (req, res) => {
  const category = req.query.category || 'world';
  const feeds = FEEDS[category] || FEEDS.world;
  const results = await Promise.all(feeds.map((f) => fetchFeed(f.url, f.source)));
  const articles = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);
  res.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.json({ articles });
});

// Regional local news
app.get('/api/local', async (req, res) => {
  const region = req.query.region || 'us';
  const feeds = REGIONAL_FEEDS[region] || REGIONAL_FEEDS['us'] || [];
  if (feeds.length === 0) return res.json({ articles: [], region });
  const results = await Promise.all(feeds.map((f) => fetchFeed(f.url, f.source)));
  const articles = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15);
  res.set('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.json({ articles, region });
});

// Language-specific news feeds
app.get('/api/lang-feeds', async (req, res) => {
  const lang = req.query.lang || 'hi';
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
      text: (article?.content || '').replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ').trim(),
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
