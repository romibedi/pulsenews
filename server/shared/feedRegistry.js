// ---------------------------------------------------------------------------
// feedRegistry.js -- Single source of truth for every RSS feed the app uses.
// ---------------------------------------------------------------------------

// --- Global category feeds (8 categories) ---
export const FEEDS = {
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

// --- Regional general feeds (9 regions) ---
export const REGIONAL_FEEDS = {
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

// --- Region + category specific feeds (9 regions x 7 categories each) ---
export const REGIONAL_CATEGORY_FEEDS = {
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
};

// --- Language-specific feeds (16 languages) ---
export const LANG_FEEDS = {
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
  ar: [
    { url: 'https://feeds.bbci.co.uk/arabic/rss.xml', source: 'BBC Arabic' },
  ],
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
    { url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada', source: 'El Pais' },
  ],
  pt: [
    { url: 'https://feeds.bbci.co.uk/portuguese/rss.xml', source: 'BBC Portuguese' },
  ],
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
  sw: [
    { url: 'https://feeds.bbci.co.uk/swahili/rss.xml', source: 'BBC Swahili' },
  ],
};

// ---------------------------------------------------------------------------
// buildFeedContextMap()
//
// Returns a Map<feedUrl, { source: string, contexts: object[] }> that
// deduplicates every feed URL across all four registries so each URL is
// fetched only once during ingestion.  Each entry carries an array of
// "contexts" describing where that feed's articles should be filed.
//
// Context shapes:
//   { type: 'global',  category }
//   { type: 'region',  region, category? }   -- category omitted for general regional feeds
//   { type: 'lang',    lang }
// ---------------------------------------------------------------------------
export function buildFeedContextMap() {
  /** @type {Map<string, { source: string, contexts: Array<object> }>} */
  const map = new Map();

  /**
   * Ensure an entry exists for `url` in the map and push `context` into its
   * contexts array.  The first occurrence of a URL determines the `source`
   * label stored on the entry (later duplicates may carry different source
   * names -- the first wins).
   */
  function register(url, source, context) {
    if (!map.has(url)) {
      map.set(url, { source, contexts: [] });
    }
    map.get(url).contexts.push(context);
  }

  // 1. Global category feeds
  for (const [category, feeds] of Object.entries(FEEDS)) {
    for (const { url, source } of feeds) {
      register(url, source, { type: 'global', category });
    }
  }

  // 2. Regional general feeds
  for (const [region, feeds] of Object.entries(REGIONAL_FEEDS)) {
    for (const { url, source } of feeds) {
      register(url, source, { type: 'region', region });
    }
  }

  // 3. Regional + category feeds
  for (const [region, categories] of Object.entries(REGIONAL_CATEGORY_FEEDS)) {
    for (const [category, feeds] of Object.entries(categories)) {
      for (const { url, source } of feeds) {
        register(url, source, { type: 'region', region, category });
      }
    }
  }

  // 4. Language-specific feeds
  for (const [lang, feeds] of Object.entries(LANG_FEEDS)) {
    for (const { url, source } of feeds) {
      register(url, source, { type: 'lang', lang });
    }
  }

  return map;
}
