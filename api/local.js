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
  const region = url.searchParams.get('region') || 'us';
  const feeds = REGIONAL_FEEDS[region] || REGIONAL_FEEDS['us'] || [];

  if (feeds.length === 0) {
    return res.status(200).json({ articles: [], region });
  }

  const results = await Promise.all(feeds.map((f) => fetchFeed(f.url, f.source)));
  const articles = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15);

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  return res.status(200).json({ articles, region });
}
