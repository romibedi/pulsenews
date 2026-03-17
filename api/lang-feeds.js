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

function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const m = xml.match(re);
  return m ? (m[1] || m[2] || '').trim() : '';
}

function extractImageUrl(itemXml) {
  let m = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/);
  if (m) return m[1];
  m = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/);
  if (m) return m[1];
  m = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/);
  if (m) return m[1];
  m = itemXml.match(/<img[^>]+src=["']([^"']+)["']/);
  if (m) return m[1];
  return null;
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&apos;/g, "'").replace(/&rsquo;/g, '\u2019').replace(/&lsquo;/g, '\u2018').replace(/&mdash;/g, '\u2014').replace(/&ndash;/g, '\u2013').replace(/&hellip;/g, '\u2026').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, (m) => String.fromCharCode(parseInt(m.slice(2, -1)))).trim();
}

function parseRssFeed(xml, source) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = stripHtml(extractTag(itemXml, 'title'));
    const link = extractTag(itemXml, 'link');
    const description = stripHtml(extractTag(itemXml, 'description'));
    const pubDate = extractTag(itemXml, 'pubDate');
    const image = extractImageUrl(itemXml);
    if (title && link) {
      items.push({
        id: `rss-${Buffer.from(link).toString('base64url')}`,
        title, description, body: '', image,
        author: source,
        date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        section: source, sectionId: source.toLowerCase().replace(/\s+/g, '-'),
        url: link, tags: [], source, isExternal: true,
      });
    }
  }
  return items;
}

const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000;

async function fetchFeed(feedUrl, source) {
  const cached = cache.get(feedUrl);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;
  try {
    const res = await fetch(feedUrl, { headers: { 'User-Agent': 'PulseNews/1.0' } });
    if (!res.ok) return [];
    const xml = await res.text();
    const articles = parseRssFeed(xml, source);
    cache.set(feedUrl, { data: articles, ts: Date.now() });
    return articles;
  } catch { return []; }
}

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const lang = url.searchParams.get('lang') || 'hi';
  const feeds = LANG_FEEDS[lang];

  if (!feeds || feeds.length === 0) {
    return res.status(200).json({ articles: [], lang });
  }

  const results = await Promise.all(feeds.map((f) => fetchFeed(f.url, f.source)));
  const articles = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  return res.status(200).json({ articles, lang });
}
