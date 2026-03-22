import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { extract } from '@extractus/article-extractor'
import dns from 'node:dns'

dns.setDefaultResultOrder('verbatim')

// Load all env variables (including non-VITE_ prefixed) into process.env
const env = loadEnv('development', process.cwd(), '')
Object.assign(process.env, env)

// In-memory cache for dev server — avoids hitting Guardian API on every request
const cache = new Map()
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

// --- RSS feed config (mirrors api/feeds.js) ---
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
  ai: [
    { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch AI' },
    { url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', source: 'The Verge AI' },
    { url: 'https://www.technologyreview.com/feed/', source: 'MIT Tech Review' },
  ],
  entertainment: [
    { url: 'https://variety.com/feed/', source: 'Variety' },
    { url: 'https://deadline.com/feed/', source: 'Deadline' },
    { url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', source: 'BBC Entertainment' },
  ],
  gaming: [
    { url: 'https://feeds.feedburner.com/ign/all', source: 'IGN' },
    { url: 'https://kotaku.com/rss', source: 'Kotaku' },
    { url: 'https://www.polygon.com/rss/index.xml', source: 'Polygon' },
  ],
  cricket: [
    { url: 'https://feeds.bbci.co.uk/sport/cricket/rss.xml', source: 'BBC Cricket' },
  ],
  startups: [
    { url: 'https://techcrunch.com/feed/', source: 'TechCrunch' },
    { url: 'https://news.crunchbase.com/feed/', source: 'Crunchbase News' },
  ],
  space: [
    { url: 'https://spacenews.com/feed/', source: 'SpaceNews' },
    { url: 'https://www.space.com/feeds/all', source: 'Space.com' },
  ],
  crypto: [
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk' },
    { url: 'https://cointelegraph.com/rss', source: 'CoinTelegraph' },
  ],
}

// Regional feeds for geo-localized news
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
}

// Regional category feeds — category-specific feeds per region
const REGIONAL_CATEGORY_FEEDS = {
  india: {
    world: [
      { url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', source: 'Times of India' },
      { url: 'https://www.thehindu.com/news/national/feeder/default.rss', source: 'The Hindu' },
      { url: 'https://indianexpress.com/feed/', source: 'Indian Express' },
      { url: 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml', source: 'BBC India' },
    ],
    technology: [
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/66949542.cms', source: 'Times of India Tech' },
      { url: 'https://indianexpress.com/section/technology/feed/', source: 'Indian Express Tech' },
    ],
    business: [
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/1898055.cms', source: 'Times of India Business' },
      { url: 'https://www.thehindu.com/business/feeder/default.rss', source: 'The Hindu Business' },
      { url: 'https://indianexpress.com/section/business/feed/', source: 'Indian Express Business' },
    ],
    sport: [
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/4719161.cms', source: 'Times of India Sports' },
      { url: 'https://www.thehindu.com/sport/feeder/default.rss', source: 'The Hindu Sport' },
      { url: 'https://indianexpress.com/section/sports/feed/', source: 'Indian Express Sports' },
    ],
    science: [
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/56845691.cms', source: 'Times of India Science' },
      { url: 'https://www.thehindu.com/sci-tech/feeder/default.rss', source: 'The Hindu Sci-Tech' },
      { url: 'https://indianexpress.com/section/technology/science/feed/', source: 'Indian Express Science' },
    ],
    culture: [
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms', source: 'Times of India Entertainment' },
      { url: 'https://www.thehindu.com/entertainment/feeder/default.rss', source: 'The Hindu Entertainment' },
      { url: 'https://indianexpress.com/section/entertainment/feed/', source: 'Indian Express Entertainment' },
    ],
    politics: [
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/7630538.cms', source: 'Times of India Politics' },
      { url: 'https://indianexpress.com/section/political-pulse/feed/', source: 'Indian Express Politics' },
    ],
  },
  uk: {
    world: [
      { url: 'https://feeds.bbci.co.uk/news/uk/rss.xml', source: 'BBC UK' },
      { url: 'https://feeds.bbci.co.uk/news/england/rss.xml', source: 'BBC England' },
      { url: 'https://feeds.skynews.com/feeds/rss/uk.xml', source: 'Sky News UK' },
    ],
    technology: [
      { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Tech' },
      { url: 'https://www.theguardian.com/uk/technology/rss', source: 'Guardian Tech' },
    ],
    business: [
      { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business' },
      { url: 'https://www.theguardian.com/uk/business/rss', source: 'Guardian Business' },
    ],
    sport: [
      { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport' },
      { url: 'https://www.theguardian.com/uk/sport/rss', source: 'Guardian Sport' },
    ],
    science: [
      { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', source: 'BBC Science' },
      { url: 'https://www.theguardian.com/science/rss', source: 'Guardian Science' },
    ],
    culture: [
      { url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', source: 'BBC Arts' },
      { url: 'https://www.theguardian.com/uk/culture/rss', source: 'Guardian Culture' },
    ],
    politics: [
      { url: 'https://feeds.bbci.co.uk/news/politics/rss.xml', source: 'BBC Politics' },
      { url: 'https://www.theguardian.com/politics/rss', source: 'Guardian Politics' },
    ],
  },
  us: {
    world: [
      { url: 'https://feeds.npr.org/1003/rss.xml', source: 'NPR US' },
      { url: 'https://abcnews.go.com/abcnews/usheadlines', source: 'ABC US' },
      { url: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml', source: 'BBC US' },
    ],
    technology: [
      { url: 'https://feeds.npr.org/1019/rss.xml', source: 'NPR Tech' },
      { url: 'https://feeds.arstechnica.com/arstechnica/index', source: 'Ars Technica' },
    ],
    business: [
      { url: 'https://feeds.npr.org/1006/rss.xml', source: 'NPR Business' },
      { url: 'https://abcnews.go.com/abcnews/moneyheadlines', source: 'ABC Business' },
    ],
    sport: [
      { url: 'https://feeds.npr.org/1055/rss.xml', source: 'NPR Sports' },
      { url: 'https://abcnews.go.com/abcnews/sportsheadlines', source: 'ABC Sports' },
    ],
    science: [
      { url: 'https://feeds.npr.org/1007/rss.xml', source: 'NPR Science' },
    ],
    culture: [
      { url: 'https://feeds.npr.org/1008/rss.xml', source: 'NPR Arts' },
    ],
    politics: [
      { url: 'https://feeds.npr.org/1014/rss.xml', source: 'NPR Politics' },
      { url: 'https://abcnews.go.com/abcnews/politicsheadlines', source: 'ABC Politics' },
    ],
  },
  australia: {
    world: [
      { url: 'https://www.abc.net.au/news/feed/2942460/rss.xml', source: 'ABC Australia' },
      { url: 'https://feeds.bbci.co.uk/news/world/australia/rss.xml', source: 'BBC Australia' },
      { url: 'https://www.theguardian.com/australia-news/rss', source: 'Guardian Australia' },
    ],
    technology: [
      { url: 'https://www.theguardian.com/au/technology/rss', source: 'Guardian AU Tech' },
      { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Tech' },
    ],
    business: [
      { url: 'https://www.theguardian.com/au/business/rss', source: 'Guardian AU Business' },
      { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business' },
    ],
    sport: [
      { url: 'https://www.theguardian.com/au/sport/rss', source: 'Guardian AU Sport' },
      { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport' },
    ],
    science: [
      { url: 'https://www.theguardian.com/au/environment/rss', source: 'Guardian AU Environment' },
      { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', source: 'BBC Science' },
    ],
    culture: [
      { url: 'https://www.theguardian.com/au/culture/rss', source: 'Guardian AU Culture' },
      { url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', source: 'BBC Arts' },
    ],
    politics: [
      { url: 'https://www.theguardian.com/australia-news/rss', source: 'Guardian AU News' },
    ],
  },
  'middle-east': {
    world: [
      { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
      { url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', source: 'BBC Middle East' },
    ],
    technology: [
      { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Tech' },
    ],
    business: [
      { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business' },
    ],
    sport: [
      { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport' },
    ],
    science: [
      { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', source: 'BBC Science' },
    ],
    culture: [
      { url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', source: 'BBC Arts' },
    ],
    politics: [
      { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
      { url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', source: 'BBC Middle East' },
    ],
  },
  europe: {
    world: [
      { url: 'https://feeds.bbci.co.uk/news/world/europe/rss.xml', source: 'BBC Europe' },
      { url: 'https://www.rfi.fr/en/rss', source: 'RFI' },
      { url: 'https://rss.dw.com/xml/rss-en-world', source: 'DW News' },
    ],
    technology: [
      { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Tech' },
    ],
    business: [
      { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business' },
      { url: 'https://rss.dw.com/xml/rss-en-bus', source: 'DW Business' },
    ],
    sport: [
      { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport' },
    ],
    science: [
      { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', source: 'BBC Science' },
      { url: 'https://rss.dw.com/xml/rss-en-science', source: 'DW Science' },
    ],
    culture: [
      { url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', source: 'BBC Arts' },
      { url: 'https://rss.dw.com/xml/rss-en-cul', source: 'DW Culture' },
    ],
    politics: [
      { url: 'https://feeds.bbci.co.uk/news/world/europe/rss.xml', source: 'BBC Europe' },
      { url: 'https://rss.dw.com/xml/rss-en-eu', source: 'DW Europe' },
    ],
  },
  africa: {
    world: [
      { url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml', source: 'BBC Africa' },
      { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
    ],
    technology: [
      { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Tech' },
    ],
    business: [
      { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business' },
    ],
    sport: [
      { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport' },
    ],
    science: [
      { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', source: 'BBC Science' },
    ],
    culture: [
      { url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', source: 'BBC Arts' },
    ],
    politics: [
      { url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml', source: 'BBC Africa' },
    ],
  },
  asia: {
    world: [
      { url: 'https://feeds.bbci.co.uk/news/world/asia/rss.xml', source: 'BBC Asia' },
      { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
    ],
    technology: [
      { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Tech' },
    ],
    business: [
      { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business' },
    ],
    sport: [
      { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport' },
    ],
    science: [
      { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', source: 'BBC Science' },
    ],
    culture: [
      { url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', source: 'BBC Arts' },
    ],
    politics: [
      { url: 'https://feeds.bbci.co.uk/news/world/asia/rss.xml', source: 'BBC Asia' },
    ],
  },
  latam: {
    world: [
      { url: 'https://feeds.bbci.co.uk/news/world/latin_america/rss.xml', source: 'BBC Latin America' },
      { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
    ],
    technology: [
      { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Tech' },
    ],
    business: [
      { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business' },
    ],
    sport: [
      { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport' },
    ],
    science: [
      { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', source: 'BBC Science' },
    ],
    culture: [
      { url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', source: 'BBC Arts' },
    ],
    politics: [
      { url: 'https://feeds.bbci.co.uk/news/world/latin_america/rss.xml', source: 'BBC Latin America' },
    ],
  },
}

// Language-specific feeds — region-mapped
const LANG_FEEDS = {
  // Indian languages
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
  ur: [
    { url: 'https://feeds.bbci.co.uk/urdu/rss.xml', source: 'BBC Urdu' },
  ],
  // Middle East
  ar: [
    { url: 'https://feeds.bbci.co.uk/arabic/rss.xml', source: 'BBC Arabic' },
  ],
  // European languages
  fr: [
    { url: 'https://www.france24.com/fr/rss', source: 'France 24' },
    { url: 'https://www.rfi.fr/fr/rss', source: 'RFI French' },
    { url: 'https://www.lemonde.fr/rss/une.xml', source: 'Le Monde' },
  ],
  de: [
    { url: 'https://rss.dw.com/xml/rss-de-all', source: 'DW German' },
    { url: 'https://www.tagesschau.de/xml/rss2', source: 'Tagesschau' },
  ],
  es: [
    { url: 'https://feeds.bbci.co.uk/mundo/rss.xml', source: 'BBC Mundo' },
    { url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada', source: 'El País' },
  ],
  pt: [
    { url: 'https://feeds.bbci.co.uk/portuguese/rss.xml', source: 'BBC Portuguese' },
  ],
  // Asian languages
  zh: [
    { url: 'https://feeds.bbci.co.uk/zhongwen/simp/rss.xml', source: 'BBC Chinese' },
  ],
  ja: [
    { url: 'https://feeds.bbci.co.uk/japanese/rss.xml', source: 'BBC Japanese' },
    { url: 'https://www3.nhk.or.jp/rss/news/cat0.xml', source: 'NHK' },
  ],
  ko: [
    { url: 'https://feeds.bbci.co.uk/korean/rss.xml', source: 'BBC Korean' },
  ],
  // African languages
  sw: [
    { url: 'https://feeds.bbci.co.uk/swahili/rss.xml', source: 'BBC Swahili' },
  ],
}

function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`)
  const m = xml.match(re)
  return m ? (m[1] || m[2] || '').trim() : ''
}

function extractImageUrl(itemXml) {
  let m = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/)
  if (m) return m[1]
  m = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/)
  if (m) return m[1]
  m = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/)
  if (m) return m[1]
  m = itemXml.match(/<img[^>]+src=["']([^"']+)["']/)
  if (m) return m[1]
  return null
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&apos;/g, "'").replace(/&ldquo;/g, '\u201C').replace(/&rdquo;/g, '\u201D').replace(/&rsquo;/g, '\u2019').replace(/&lsquo;/g, '\u2018').replace(/&mdash;/g, '\u2014').replace(/&ndash;/g, '\u2013').replace(/&hellip;/g, '\u2026').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, (m) => String.fromCharCode(parseInt(m.slice(2, -1)))).trim()
}

function parseRssFeed(xml, source) {
  const items = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]
    const title = stripHtml(extractTag(itemXml, 'title'))
    const link = extractTag(itemXml, 'link')
    const description = stripHtml(extractTag(itemXml, 'description'))
    const pubDate = extractTag(itemXml, 'pubDate')
    const image = extractImageUrl(itemXml)
    if (title && link) {
      items.push({
        id: `rss-${Buffer.from(link).toString('base64url')}`,
        title, description, body: '', image,
        author: source,
        date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        section: source, sectionId: source.toLowerCase().replace(/\s+/g, '-'),
        url: link, tags: [], source, isExternal: true,
      })
    }
  }
  return items
}

async function fetchOgImage(url) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PulseNews/1.0)' }, redirect: 'follow' })
    if (!r.ok) return null
    const html = await r.text()
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    return m ? m[1] : null
  } catch { return null }
}

async function fetchFeed(feedUrl, source) {
  const cached = cache.get(feedUrl)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data
  try {
    const res = await fetch(feedUrl, { headers: { 'User-Agent': 'StreamNews/1.0' } })
    if (!res.ok) return []
    const xml = await res.text()
    const articles = parseRssFeed(xml, source)
    cache.set(feedUrl, { data: articles, ts: Date.now() })
    // Fetch OG images in background for articles missing images (non-blocking)
    const needImage = articles.filter((a) => !a.image).slice(0, 5)
    if (needImage.length > 0) {
      Promise.all(needImage.map((a) => fetchOgImage(a.url))).then((ogResults) => {
        let updated = false
        needImage.forEach((a, i) => { if (ogResults[i]) { a.image = ogResults[i]; updated = true } })
        if (updated) cache.set(feedUrl, { data: articles, ts: Date.now() })
      }).catch(() => {})
    }
    return articles
  } catch { return [] }
}

export default defineConfig({
  server: {
    host: '127.0.0.1',
    hmr: {
      host: '127.0.0.1',
      port: 5174,
    },
    proxy: {
      '/api': {
        target: 'https://pulsenewstoday.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [
    react(),
    {
      name: 'api-proxy',
      configureServer(server) {
        // Regional local news
        server.middlewares.use('/api/local', async (req, res) => {
          const url = new URL(req.url, 'http://localhost')
          const region = url.searchParams.get('region') || 'world'
          const feeds = REGIONAL_FEEDS[region] || REGIONAL_FEEDS['us'] || []
          if (feeds.length === 0) { res.setHeader('Content-Type', 'application/json'); res.statusCode = 200; res.end(JSON.stringify({ articles: [] })); return }
          const results = await Promise.all(feeds.map((f) => fetchFeed(f.url, f.source)))
          const articles = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15)
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify({ articles, region }))
        })

        // Regional category feeds (region + category)
        server.middlewares.use('/api/regional-feeds', async (req, res) => {
          const url = new URL(req.url, 'http://localhost')
          const region = url.searchParams.get('region') || 'india'
          const category = url.searchParams.get('category') || 'world'
          // For regions with dedicated category feeds, use them; otherwise fall back
          let feeds
          if (REGIONAL_CATEGORY_FEEDS[region]?.[category]) {
            feeds = REGIONAL_CATEGORY_FEEDS[region][category]
          } else if (category === 'world' && REGIONAL_FEEDS[region]) {
            feeds = REGIONAL_FEEDS[region]
          } else {
            feeds = FEEDS[category] || FEEDS.world
          }
          const results = await Promise.all(feeds.map((f) => fetchFeed(f.url, f.source)))
          const articles = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20)
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify({ articles, region, category }))
        })

        // Language-specific feeds
        server.middlewares.use('/api/lang-feeds', async (req, res) => {
          const url = new URL(req.url, 'http://localhost')
          const lang = url.searchParams.get('lang') || 'hi'
          const feeds = LANG_FEEDS[lang]
          if (!feeds || feeds.length === 0) { res.setHeader('Content-Type', 'application/json'); res.statusCode = 200; res.end(JSON.stringify({ articles: [], lang })); return }
          const results = await Promise.all(feeds.map((f) => fetchFeed(f.url, f.source)))
          const articles = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20)
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify({ articles, lang }))
        })

        // RSS feeds proxy
        server.middlewares.use('/api/feeds', async (req, res) => {
          const url = new URL(req.url, 'http://localhost')
          const category = url.searchParams.get('category') || 'world'
          const feeds = FEEDS[category] || FEEDS.world
          const results = await Promise.all(feeds.map((f) => fetchFeed(f.url, f.source)))
          const articles = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20)
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify({ articles }))
        })

        // Custom RSS feed proxy (avoids CORS)
        server.middlewares.use('/api/proxy-feed', async (req, res) => {
          const url = new URL(req.url, 'http://localhost')
          const feedUrl = url.searchParams.get('url')
          if (!feedUrl) { res.statusCode = 400; res.end(JSON.stringify({ error: 'url required' })); return }
          const cacheKey = `proxy:${feedUrl}`
          const cached = cache.get(cacheKey)
          if (cached && Date.now() - cached.ts < CACHE_TTL) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(cached.data)
            return
          }
          try {
            const feedRes = await fetch(feedUrl, { headers: { 'User-Agent': 'PulseNews/1.0' } })
            if (!feedRes.ok) { res.statusCode = 200; res.end(JSON.stringify({ articles: [] })); return }
            const xml = await feedRes.text()
            const source = url.searchParams.get('name') || 'Custom'
            const articles = parseRssFeed(xml, source)
            // Fetch OG images for articles missing images (up to 10 in parallel)
            const needImage = articles.filter((a) => !a.image).slice(0, 10)
            if (needImage.length > 0) {
              const ogResults = await Promise.all(needImage.map((a) => fetchOgImage(a.url)))
              needImage.forEach((a, i) => { if (ogResults[i]) a.image = ogResults[i] })
            }
            const data = JSON.stringify({ articles })
            cache.set(cacheKey, { data, ts: Date.now() })
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(data)
          } catch {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(JSON.stringify({ articles: [] }))
          }
        })

        // Article content extraction
        server.middlewares.use('/api/extract', async (req, res) => {
          const url = new URL(req.url, 'http://localhost')
          const articleUrl = url.searchParams.get('url')
          if (!articleUrl) { res.statusCode = 400; res.end(JSON.stringify({ error: 'url param required' })); return }
          const cacheKey = `extract:${articleUrl}`
          const cached = cache.get(cacheKey)
          if (cached && Date.now() - cached.ts < CACHE_TTL) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(cached.data)
            return
          }
          try {
            const article = await extract(articleUrl, {}, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PulseNews/1.0)' } })
            const result = JSON.stringify({
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
            })
            cache.set(cacheKey, { data: result, ts: Date.now() })
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(result)
          } catch (err) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(JSON.stringify({ title: '', content: '', text: '', error: err.message }))
          }
        })

        // Claude API proxy (summarize)
        server.middlewares.use('/api/summarize', async (req, res) => {
          if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return }
          if (req.method !== 'POST') { res.statusCode = 405; res.end('Method not allowed'); return }
          const apiKey = process.env.ANTHROPIC_API_KEY
          if (!apiKey) { res.setHeader('Content-Type', 'application/json'); res.statusCode = 500; res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' })); return }
          let body = ''
          req.on('data', (c) => { body += c })
          req.on('end', async () => {
            try {
              const { title, body: articleBody, lang = 'en' } = JSON.parse(body)
              const LANG_NAMES = { en:'English',hi:'Hindi',ta:'Tamil',te:'Telugu',bn:'Bengali',mr:'Marathi',ur:'Urdu',ar:'Arabic',fr:'French',de:'German',es:'Spanish',pt:'Portuguese',zh:'Chinese',ja:'Japanese',ko:'Korean',sw:'Swahili' }
              const langHint = lang && lang !== 'en' ? ` Respond entirely in ${LANG_NAMES[lang] || 'English'}.` : ''
              const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
                body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 200, messages: [{ role: 'user', content: `Summarize this news article in 2-3 concise sentences. Focus on the key facts.${langHint}\n\nTitle: ${title}\n\n${(articleBody || '').slice(0, 3000)}` }] }),
              })
              const data = await response.json()
              res.setHeader('Content-Type', 'application/json')
              res.statusCode = response.ok ? 200 : response.status
              res.end(JSON.stringify(response.ok ? { summary: data.content?.[0]?.text } : { error: JSON.stringify(data) }))
            } catch (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })) }
          })
        })

        // ELI5 / Expert rewrite
        server.middlewares.use('/api/rewrite', async (req, res) => {
          if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return }
          if (req.method !== 'POST') { res.statusCode = 405; res.end('Method not allowed'); return }
          const apiKey = process.env.ANTHROPIC_API_KEY
          if (!apiKey) { res.setHeader('Content-Type', 'application/json'); res.statusCode = 500; res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' })); return }
          let body = ''
          req.on('data', (c) => { body += c })
          req.on('end', async () => {
            try {
              const { title, body: articleBody, mode = 'summary', lang = 'en' } = JSON.parse(body)
              const LANG_NAMES = { en:'English',hi:'Hindi',ta:'Tamil',te:'Telugu',bn:'Bengali',mr:'Marathi',ur:'Urdu',ar:'Arabic',fr:'French',de:'German',es:'Spanish',pt:'Portuguese',zh:'Chinese',ja:'Japanese',ko:'Korean',sw:'Swahili' }
              const langHint = lang && lang !== 'en' ? ` Respond entirely in ${LANG_NAMES[lang] || 'English'}.` : ''
              const prompts = {
                simple: `Explain this news article in very simple terms, as if explaining to a 10-year-old. Use short sentences and everyday words. 3-4 sentences max.${langHint}`,
                summary: `Summarize this news article in 2-3 concise sentences. Focus on the key facts.${langHint}`,
                expert: `Provide a detailed, technical analysis of this news article. Include context, broader implications, and relevant background. 4-6 sentences.${langHint}`,
              }
              const maxTokens = { simple: 250, summary: 200, expert: 500 }
              const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
                body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: maxTokens[mode] || 200, messages: [{ role: 'user', content: `${prompts[mode] || prompts.summary}\n\nTitle: ${title}\n\n${(articleBody || '').slice(0, 3000)}` }] }),
              })
              const data = await response.json()
              res.setHeader('Content-Type', 'application/json')
              res.statusCode = response.ok ? 200 : response.status
              res.end(JSON.stringify(response.ok ? { text: data.content?.[0]?.text, mode } : { error: JSON.stringify(data) }))
            } catch (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })) }
          })
        })

        // TTS via Edge TTS
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
        }
        const EN_REGION_VOICES = {
          us: 'en-US-JennyNeural',
          uk: 'en-GB-SoniaNeural',
          australia: 'en-AU-NatashaNeural',
          india: 'en-IN-NeerjaNeural',
        }
        server.middlewares.use('/api/tts', async (req, res) => {
          // Support both POST (body) and GET (query)
          let text, lang, region
          if (req.method === 'POST') {
            const chunks = []
            for await (const chunk of req) chunks.push(chunk)
            try {
              const body = JSON.parse(Buffer.concat(chunks).toString())
              text = body.text
              lang = body.lang || 'en'
              region = body.region || ''
            } catch { text = null; lang = 'en'; region = '' }
          } else {
            const url = new URL(req.url, 'http://localhost')
            text = url.searchParams.get('text')
            lang = url.searchParams.get('lang') || 'en'
            region = url.searchParams.get('region') || ''
          }
          if (!text) { res.statusCode = 400; res.end(JSON.stringify({ error: 'text param required' })); return }
          const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 2000)
          const voice = (lang === 'en' && EN_REGION_VOICES[region]) || TTS_VOICES[lang] || TTS_VOICES.en
          try {
            const { Communicate } = await import('edge-tts-universal')
            const comm = new Communicate(cleanText, { voice, rate: '+20%' })
            res.setHeader('Content-Type', 'audio/mpeg')
            res.setHeader('Transfer-Encoding', 'chunked')
            res.setHeader('Cache-Control', 's-maxage=86400')
            res.statusCode = 200
            for await (const chunk of comm.stream()) {
              if (chunk.type === 'audio' && chunk.data) res.write(chunk.data)
            }
            res.end()
          } catch (err) {
            if (!res.headersSent) {
              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message }))
            } else {
              res.end()
            }
          }
        })

        // --- Shareable News Cards (dev) ---
        server.middlewares.use('/api/card/', async (req, res) => {
          const url = new URL(req.url, 'http://localhost')
          const id = decodeURIComponent(url.pathname.slice(1))
          const format = url.searchParams.get('format') || 'story'
          if (!id) { res.statusCode = 400; res.end('id required'); return }

          // Find article in RSS cache
          let article = null
          for (const [, cached] of cache) {
            if (cached.data && Array.isArray(cached.data)) {
              article = cached.data.find((a) => a.id === id)
              if (article) break
            }
          }
          if (!article) {
            // Try fetching world news to find it
            const feeds = FEEDS.world
            const results = await Promise.all(feeds.map((f) => fetchFeed(f.url, f.source)))
            article = results.flat().find((a) => a.id === id)
          }
          if (!article) {
            // Generate a placeholder card with the ID as title
            article = { title: 'News Article', section: 'News', source: 'PulseNewsToday', date: new Date().toISOString(), description: '' }
          }

          try {
            const { generateCard } = await import('./server/card.js')
            const png = await generateCard(article, format)
            res.setHeader('Content-Type', 'image/png')
            res.setHeader('Cache-Control', 's-maxage=86400')
            res.statusCode = 200
            res.end(Buffer.from(png))
          } catch (err) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 500
            res.end(JSON.stringify({ error: err.message }))
          }
        })

        // --- Voice-First News Query ---
        server.middlewares.use('/api/voice-query', async (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; res.end('Method not allowed'); return }
          const apiKey = process.env.ANTHROPIC_API_KEY
          if (!apiKey) { res.setHeader('Content-Type', 'application/json'); res.statusCode = 500; res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' })); return }
          let body = ''
          req.on('data', (c) => { body += c })
          req.on('end', async () => {
            try {
              const { query, lang = 'en', region = '' } = JSON.parse(body)
              if (!query) { res.statusCode = 400; res.end(JSON.stringify({ error: 'query required' })); return }

              // Step 1: Extract intent
              const intentRes = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
                body: JSON.stringify({
                  model: 'claude-haiku-4-5-20251001', max_tokens: 150,
                  messages: [{ role: 'user', content: `Extract the user's news intent from this query. Return ONLY valid JSON with these fields: { "category": "world|technology|business|science|sport|culture|environment|politics|null", "topic": "specific topic or null", "count": 3 }\n\nQuery: "${query}"` }],
                }),
              })
              let intent
              try {
                const d = await intentRes.json()
                const raw = d.content?.[0]?.text || '{}'
                intent = JSON.parse(raw.replace(/```json\n?|\n?```/g, '').trim())
              } catch { intent = { category: 'world', count: 3 } }

              // Step 2: Fetch articles from RSS (dev has no DynamoDB/OpenSearch)
              const cat = intent.category || 'world'
              const feeds = FEEDS[cat] || FEEDS.world
              const results = await Promise.all(feeds.map((f) => fetchFeed(f.url, f.source)))
              let articles = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date))
              // If there's a topic, filter by title match
              if (intent.topic) {
                const topicLower = intent.topic.toLowerCase()
                const filtered = articles.filter((a) => a.title.toLowerCase().includes(topicLower) || (a.description || '').toLowerCase().includes(topicLower))
                if (filtered.length > 0) articles = filtered
              }
              articles = articles.slice(0, Math.min(intent.count || 3, 5))

              // Step 3: Generate briefing
              const articleSummaries = articles.map((a, i) => `Article ${i + 1}: "${a.title}" (${a.source}) - ${(a.description || '').slice(0, 200)}`).join('\n')
              const briefingRes = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
                body: JSON.stringify({
                  model: 'claude-haiku-4-5-20251001', max_tokens: 500,
                  messages: [{ role: 'user', content: `You are a friendly news anchor. Summarize these ${articles.length} articles into a conversational ${articles.length > 1 ? '60-second' : '30-second'} audio briefing. Use natural transitions like "Moving on..." or "In other news...". Keep it warm, clear, and spoken-word friendly. Do NOT use bullet points or formatting.\n\n${articleSummaries}` }],
                }),
              })
              const briefingData = await briefingRes.json()
              const briefing = briefingData.content?.[0]?.text || 'Could not generate briefing.'

              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 200
              res.end(JSON.stringify({
                briefing,
                articles: articles.map((a) => ({ id: a.id, title: a.title, source: a.source, date: a.date, image: a.image })),
                intent,
              }))
            } catch (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })) }
          })
        })

        // --- Story Threads (dev: title-based similarity from RSS cache) ---
        server.middlewares.use('/api/threads/', async (req, res) => {
          const url = new URL(req.url, 'http://localhost')
          const id = decodeURIComponent(url.pathname.slice(1))
          if (!id) { res.statusCode = 400; res.end(JSON.stringify({ error: 'id required' })); return }

          // In dev, search all cached articles for title similarity
          const allArticles = []
          for (const [, cached] of cache) {
            if (cached.data && Array.isArray(cached.data)) allArticles.push(...cached.data)
          }

          let target = allArticles.find((a) => a.id === id)
          if (!target) {
            // Fetch from multiple categories to build a larger pool
            const allFeeds = [...FEEDS.world, ...(FEEDS.technology || []), ...(FEEDS.business || []), ...(FEEDS.sport || []), ...(FEEDS.science || [])]
            const results = await Promise.all(allFeeds.map((f) => fetchFeed(f.url, f.source)))
            const fresh = results.flat()
            target = fresh.find((a) => a.id === id)
            if (!target) {
              res.setHeader('Content-Type', 'application/json')
              res.statusCode = 200
              res.end(JSON.stringify({ article: null, thread: [], threadSummary: null, count: 0 }))
              return
            }
            allArticles.push(...fresh)
          }

          // Word-based similarity — match on significant words (>3 chars), excluding stop words
          const stopWords = new Set(['this', 'that', 'with', 'from', 'have', 'been', 'will', 'more', 'than', 'were', 'they', 'their', 'what', 'when', 'which', 'about', 'after', 'before', 'could', 'would', 'should', 'over', 'into', 'also', 'some'])
          const words = (target.title || '').toLowerCase().split(/\s+/).filter((w) => w.length > 3 && !stopWords.has(w))
          const related = allArticles
            .filter((a) => a.id !== id)
            .map((a) => {
              const titleWords = a.title.toLowerCase().split(/\s+/)
              const score = words.filter((w) => titleWords.some((tw) => tw.includes(w))).length
              return { ...a, score }
            })
            .filter((a) => a.score >= 1)
            .sort((a, b) => b.score - a.score || new Date(b.date) - new Date(a.date))
            .slice(0, 10)

          let threadSummary = null
          const apiKey = process.env.ANTHROPIC_API_KEY
          if (related.length >= 2 && apiKey) {
            try {
              const titles = [target, ...related.slice(0, 5)]
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((a) => `- "${a.title}" (${a.source || ''})`)
                .join('\n')
              const r = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
                body: JSON.stringify({
                  model: 'claude-haiku-4-5-20251001', max_tokens: 200,
                  messages: [{ role: 'user', content: `These articles are about the same ongoing story. Write a 2-3 sentence catch-up summary for someone who just discovered this story. Be concise and factual. Write for spoken delivery.\n\n${titles}` }],
                }),
              })
              if (r.ok) { const d = await r.json(); threadSummary = d.content?.[0]?.text || null }
            } catch {}
          }

          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify({
            article: target ? { id: target.id, title: target.title, date: target.date } : null,
            thread: related.map((a) => ({ id: a.id, title: a.title, description: a.description, source: a.source, date: a.date, image: a.image, section: a.section })),
            threadSummary,
            count: related.length,
          }))
        })

        // CoinGecko proxy
        server.middlewares.use('/api/stocks', async (req, res) => {
          const cacheKey = 'stocks'
          const cached = cache.get(cacheKey)
          if (cached && Date.now() - cached.ts < 5 * 60 * 1000) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(cached.data)
            return
          }
          try {
            const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h')
            const coins = await response.json()
            const data = JSON.stringify(coins.map((c) => ({ id: c.id, symbol: c.symbol.toUpperCase(), name: c.name, price: c.current_price, change24h: c.price_change_percentage_24h, image: c.image, marketCap: c.market_cap })))
            cache.set(cacheKey, { data, ts: Date.now() })
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(data)
          } catch (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })) }
        })

      },
    },
  ],
})
