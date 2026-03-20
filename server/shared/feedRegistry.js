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
    { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian' },
    { url: 'https://feedx.net/rss/ap.xml', source: 'AP News' },
    { url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', source: 'Google News' },
  ],
  technology: [
    { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Tech' },
    { url: 'https://feeds.npr.org/1019/rss.xml', source: 'NPR Tech' },
    { url: 'https://feeds.arstechnica.com/arstechnica/index', source: 'Ars Technica' },
    { url: 'https://www.theguardian.com/technology/rss', source: 'The Guardian Tech' },
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
    { url: 'https://venturebeat.com/category/ai/feed/', source: 'VentureBeat AI' },
  ],
  entertainment: [
    { url: 'https://variety.com/feed/', source: 'Variety' },
    { url: 'https://deadline.com/feed/', source: 'Deadline' },
    { url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', source: 'BBC Entertainment' },
    { url: 'https://www.theguardian.com/culture/rss', source: 'The Guardian Culture' },
  ],
  gaming: [
    { url: 'https://feeds.feedburner.com/ign/all', source: 'IGN' },
    { url: 'https://kotaku.com/rss', source: 'Kotaku' },
    { url: 'https://www.polygon.com/rss/index.xml', source: 'Polygon' },
    { url: 'https://www.gamespot.com/feeds/mashup/', source: 'GameSpot' },
  ],
  cricket: [
    { url: 'https://feeds.bbci.co.uk/sport/cricket/rss.xml', source: 'BBC Cricket' },
    { url: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml', source: 'ESPNcricinfo' },
  ],
  startups: [
    { url: 'https://techcrunch.com/feed/', source: 'TechCrunch' },
    { url: 'https://news.crunchbase.com/feed/', source: 'Crunchbase News' },
    { url: 'https://feeds.feedburner.com/venturebeat/SZYF', source: 'VentureBeat' },
  ],
  space: [
    { url: 'https://spacenews.com/feed/', source: 'SpaceNews' },
    { url: 'https://www.space.com/feeds/all', source: 'Space.com' },
    { url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', source: 'NASA' },
  ],
  crypto: [
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk' },
    { url: 'https://cointelegraph.com/rss', source: 'CoinTelegraph' },
    { url: 'https://decrypt.co/feed', source: 'Decrypt' },
  ],
};

// --- Regional general feeds (9 regions) ---
export const REGIONAL_FEEDS = {
  india: [
    { url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', source: 'Times of India' },
    { url: 'https://www.thehindu.com/news/national/feeder/default.rss', source: 'The Hindu' },
    { url: 'https://indianexpress.com/feed/', source: 'Indian Express' },
    { url: 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml', source: 'BBC India' },
    { url: 'https://feeds.feedburner.com/ndtvnews-top-stories', source: 'NDTV' },
    { url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml', source: 'Hindustan Times' },
    { url: 'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News India' },
  ],
  uk: [
    { url: 'https://feeds.bbci.co.uk/news/uk/rss.xml', source: 'BBC UK' },
    { url: 'https://feeds.bbci.co.uk/news/england/rss.xml', source: 'BBC England' },
    { url: 'https://feeds.skynews.com/feeds/rss/uk.xml', source: 'Sky News UK' },
    { url: 'https://news.google.com/rss?hl=en-GB&gl=GB&ceid=GB:en', source: 'Google News UK' },
  ],
  us: [
    { url: 'https://feeds.npr.org/1003/rss.xml', source: 'NPR US' },
    { url: 'https://abcnews.go.com/abcnews/usheadlines', source: 'ABC US' },
    { url: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml', source: 'BBC US' },
    { url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', source: 'Google News US' },
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
      { url: 'https://feeds.feedburner.com/ndtvnews-top-stories', source: 'NDTV' },
      { url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml', source: 'Hindustan Times' },
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
    cricket: [
      { url: 'https://feeds.bbci.co.uk/sport/cricket/rss.xml', source: 'BBC Cricket' },
      { url: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml', source: 'ESPNcricinfo' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/54829575.cms', source: 'Times of India Cricket' },
      { url: 'https://indianexpress.com/section/sports/cricket/feed/', source: 'Indian Express Cricket' },
    ],
    entertainment: [
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms', source: 'Times of India Entertainment' },
      { url: 'https://indianexpress.com/section/entertainment/feed/', source: 'Indian Express Entertainment' },
      { url: 'https://www.thehindu.com/entertainment/feeder/default.rss', source: 'The Hindu Entertainment' },
    ],
    startups: [
      { url: 'https://inc42.com/feed/', source: 'Inc42' },
      { url: 'https://yourstory.com/feed', source: 'YourStory' },
      { url: 'https://techcrunch.com/feed/', source: 'TechCrunch' },
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
    cricket: [
      { url: 'https://feeds.bbci.co.uk/sport/cricket/rss.xml', source: 'BBC Cricket' },
      { url: 'https://www.theguardian.com/sport/cricket/rss', source: 'Guardian Cricket' },
    ],
  },
  us: {
    world: [
      { url: 'https://feeds.npr.org/1003/rss.xml', source: 'NPR US' },
      { url: 'https://abcnews.go.com/abcnews/usheadlines', source: 'ABC US' },
      { url: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml', source: 'BBC US' },
      { url: 'https://feedx.net/rss/ap.xml', source: 'AP News' },
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
    cricket: [
      { url: 'https://feeds.bbci.co.uk/sport/cricket/rss.xml', source: 'BBC Cricket' },
      { url: 'https://www.theguardian.com/sport/cricket/rss', source: 'Guardian Cricket' },
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
  // Indian regional languages
  kn: [
    { url: 'https://feeds.bbci.co.uk/kannada/rss.xml', source: 'BBC Kannada' },
    { url: 'https://news.google.com/rss?hl=kn-IN&gl=IN&ceid=IN:kn', source: 'Google News Kannada' },
  ],
  ml: [
    { url: 'https://feeds.bbci.co.uk/malayalam/rss.xml', source: 'BBC Malayalam' },
    { url: 'https://news.google.com/rss?hl=ml-IN&gl=IN&ceid=IN:ml', source: 'Google News Malayalam' },
  ],
  gu: [
    { url: 'https://feeds.bbci.co.uk/gujarati/rss.xml', source: 'BBC Gujarati' },
    { url: 'https://news.google.com/rss?hl=gu-IN&gl=IN&ceid=IN:gu', source: 'Google News Gujarati' },
  ],
  pa: [
    { url: 'https://feeds.bbci.co.uk/punjabi/rss.xml', source: 'BBC Punjabi' },
    { url: 'https://news.google.com/rss?hl=pa-IN&gl=IN&ceid=IN:pa', source: 'Google News Punjabi' },
  ],
  as: [
    { url: 'https://news.google.com/rss?hl=as-IN&gl=IN&ceid=IN:as', source: 'Google News Assamese' },
  ],
};

// --- City-level feeds (hyperlocal news) ---
export const CITY_FEEDS = {
  // === Phase 1: India Top 10 ===
  mumbai: {
    label: 'Mumbai', region: 'india', country: 'IN',
    lang: 'mr', lat: 19.076, lng: 72.8777,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Mumbai?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Mumbai' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Mumbai?hl=mr-IN&gl=IN&ceid=IN:mr', source: 'Google News Mumbai Marathi' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/2950533.cms', source: 'TOI Mumbai' },
      { url: 'https://www.hindustantimes.com/feeds/rss/mumbai-news/rssfeed.xml', source: 'HT Mumbai' },
    ],
  },
  delhi: {
    label: 'Delhi', region: 'india', country: 'IN',
    lang: 'hi', lat: 28.6139, lng: 77.209,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Delhi?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Delhi' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Delhi?hl=hi-IN&gl=IN&ceid=IN:hi', source: 'Google News Delhi Hindi' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/2951551.cms', source: 'TOI Delhi' },
      { url: 'https://www.hindustantimes.com/feeds/rss/delhi-news/rssfeed.xml', source: 'HT Delhi' },
    ],
  },
  bangalore: {
    label: 'Bangalore', region: 'india', country: 'IN',
    lang: 'kn', lat: 12.9716, lng: 77.5946,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Bangalore?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Bangalore' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Bangalore?hl=kn-IN&gl=IN&ceid=IN:kn', source: 'Google News Bangalore Kannada' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/3214351.cms', source: 'TOI Bangalore' },
    ],
  },
  chennai: {
    label: 'Chennai', region: 'india', country: 'IN',
    lang: 'ta', lat: 13.0827, lng: 80.2707,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Chennai?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Chennai' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Chennai?hl=ta-IN&gl=IN&ceid=IN:ta', source: 'Google News Chennai Tamil' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/2950623.cms', source: 'TOI Chennai' },
      { url: 'https://www.thehindu.com/news/cities/chennai/feeder/default.rss', source: 'The Hindu Chennai' },
    ],
  },
  hyderabad: {
    label: 'Hyderabad', region: 'india', country: 'IN',
    lang: 'te', lat: 17.385, lng: 78.4867,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Hyderabad?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Hyderabad' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Hyderabad?hl=te-IN&gl=IN&ceid=IN:te', source: 'Google News Hyderabad Telugu' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/3218361.cms', source: 'TOI Hyderabad' },
    ],
  },
  pune: {
    label: 'Pune', region: 'india', country: 'IN',
    lang: 'mr', lat: 18.5204, lng: 73.8567,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Pune?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Pune' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Pune?hl=mr-IN&gl=IN&ceid=IN:mr', source: 'Google News Pune Marathi' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/3211131.cms', source: 'TOI Pune' },
      { url: 'https://www.hindustantimes.com/feeds/rss/pune-news/rssfeed.xml', source: 'HT Pune' },
    ],
  },
  kolkata: {
    label: 'Kolkata', region: 'india', country: 'IN',
    lang: 'bn', lat: 22.5726, lng: 88.3639,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Kolkata?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Kolkata' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Kolkata?hl=bn-IN&gl=IN&ceid=IN:bn', source: 'Google News Kolkata Bengali' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/2950603.cms', source: 'TOI Kolkata' },
    ],
  },
  ahmedabad: {
    label: 'Ahmedabad', region: 'india', country: 'IN',
    lang: 'gu', lat: 23.0225, lng: 72.5714,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Ahmedabad?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Ahmedabad' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Ahmedabad?hl=gu-IN&gl=IN&ceid=IN:gu', source: 'Google News Ahmedabad Gujarati' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/3214801.cms', source: 'TOI Ahmedabad' },
    ],
  },
  chandigarh: {
    label: 'Chandigarh', region: 'india', country: 'IN',
    lang: 'pa', lat: 30.7333, lng: 76.7794,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Chandigarh?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Chandigarh' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Chandigarh?hl=pa-IN&gl=IN&ceid=IN:pa', source: 'Google News Chandigarh Punjabi' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/3211541.cms', source: 'TOI Chandigarh' },
      { url: 'https://www.hindustantimes.com/feeds/rss/chandigarh/rssfeed.xml', source: 'HT Chandigarh' },
    ],
  },
  lucknow: {
    label: 'Lucknow', region: 'india', country: 'IN',
    lang: 'hi', lat: 26.8467, lng: 80.9462,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Lucknow?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Lucknow' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Lucknow?hl=hi-IN&gl=IN&ceid=IN:hi', source: 'Google News Lucknow Hindi' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/3205391.cms', source: 'TOI Lucknow' },
      { url: 'https://www.hindustantimes.com/feeds/rss/lucknow-news/rssfeed.xml', source: 'HT Lucknow' },
    ],
  },

  // === Phase 2: India +10 ===
  jaipur: {
    label: 'Jaipur', region: 'india', country: 'IN',
    lang: 'hi', lat: 26.9124, lng: 75.7873,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Jaipur?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Jaipur' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Jaipur?hl=hi-IN&gl=IN&ceid=IN:hi', source: 'Google News Jaipur Hindi' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/3012544.cms', source: 'TOI Jaipur' },
    ],
  },
  kochi: {
    label: 'Kochi', region: 'india', country: 'IN',
    lang: 'ml', lat: 9.9312, lng: 76.2673,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Kochi?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Kochi' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Kochi?hl=ml-IN&gl=IN&ceid=IN:ml', source: 'Google News Kochi Malayalam' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/2950573.cms', source: 'TOI Kochi' },
    ],
  },
  bhopal: {
    label: 'Bhopal', region: 'india', country: 'IN',
    lang: 'hi', lat: 23.2599, lng: 77.4126,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Bhopal?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Bhopal' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Bhopal?hl=hi-IN&gl=IN&ceid=IN:hi', source: 'Google News Bhopal Hindi' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/3214337.cms', source: 'TOI Bhopal' },
    ],
  },
  patna: {
    label: 'Patna', region: 'india', country: 'IN',
    lang: 'hi', lat: 25.6093, lng: 85.1376,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Patna?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Patna' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Patna?hl=hi-IN&gl=IN&ceid=IN:hi', source: 'Google News Patna Hindi' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/3214353.cms', source: 'TOI Patna' },
    ],
  },
  thiruvananthapuram: {
    label: 'Thiruvananthapuram', region: 'india', country: 'IN',
    lang: 'ml', lat: 8.5241, lng: 76.9366,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Thiruvananthapuram?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Trivandrum' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Thiruvananthapuram?hl=ml-IN&gl=IN&ceid=IN:ml', source: 'Google News Trivandrum Malayalam' },
      { url: 'https://www.thehindu.com/news/cities/Thiruvananthapuram/feeder/default.rss', source: 'The Hindu Trivandrum' },
    ],
  },
  guwahati: {
    label: 'Guwahati', region: 'india', country: 'IN',
    lang: 'as', lat: 26.1445, lng: 91.7362,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Guwahati?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Guwahati' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Guwahati?hl=as-IN&gl=IN&ceid=IN:as', source: 'Google News Guwahati Assamese' },
    ],
  },
  indore: {
    label: 'Indore', region: 'india', country: 'IN',
    lang: 'hi', lat: 22.7196, lng: 75.8577,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Indore?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Indore' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Indore?hl=hi-IN&gl=IN&ceid=IN:hi', source: 'Google News Indore Hindi' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/3214344.cms', source: 'TOI Indore' },
    ],
  },
  nagpur: {
    label: 'Nagpur', region: 'india', country: 'IN',
    lang: 'mr', lat: 21.1458, lng: 79.0882,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Nagpur?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Nagpur' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Nagpur?hl=mr-IN&gl=IN&ceid=IN:mr', source: 'Google News Nagpur Marathi' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/3214347.cms', source: 'TOI Nagpur' },
    ],
  },
  coimbatore: {
    label: 'Coimbatore', region: 'india', country: 'IN',
    lang: 'ta', lat: 11.0168, lng: 76.9558,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Coimbatore?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Coimbatore' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Coimbatore?hl=ta-IN&gl=IN&ceid=IN:ta', source: 'Google News Coimbatore Tamil' },
      { url: 'https://www.thehindu.com/news/cities/Coimbatore/feeder/default.rss', source: 'The Hindu Coimbatore' },
    ],
  },
  visakhapatnam: {
    label: 'Visakhapatnam', region: 'india', country: 'IN',
    lang: 'te', lat: 17.6868, lng: 83.2185,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Visakhapatnam?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Vizag' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Visakhapatnam?hl=te-IN&gl=IN&ceid=IN:te', source: 'Google News Vizag Telugu' },
    ],
  },

  // === Phase 2: UK 3 ===
  london: {
    label: 'London', region: 'uk', country: 'GB',
    lat: 51.5074, lng: -0.1278,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/London?hl=en-GB&gl=GB&ceid=GB:en', source: 'Google News London' },
      { url: 'https://feeds.bbci.co.uk/news/england/london/rss.xml', source: 'BBC London' },
    ],
  },
  manchester: {
    label: 'Manchester', region: 'uk', country: 'GB',
    lat: 53.4808, lng: -2.2426,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Manchester?hl=en-GB&gl=GB&ceid=GB:en', source: 'Google News Manchester' },
      { url: 'https://feeds.bbci.co.uk/news/england/manchester/rss.xml', source: 'BBC Manchester' },
    ],
  },
  birmingham: {
    label: 'Birmingham', region: 'uk', country: 'GB',
    lat: 52.4862, lng: -1.8904,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Birmingham%20UK?hl=en-GB&gl=GB&ceid=GB:en', source: 'Google News Birmingham' },
      { url: 'https://feeds.bbci.co.uk/news/england/birmingham_and_black_country/rss.xml', source: 'BBC Birmingham' },
    ],
  },

  // === Phase 3: US 5 ===
  'new-york': {
    label: 'New York', region: 'us', country: 'US',
    lat: 40.7128, lng: -74.006,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/New%20York?hl=en-US&gl=US&ceid=US:en', source: 'Google News NYC' },
    ],
  },
  'los-angeles': {
    label: 'Los Angeles', region: 'us', country: 'US',
    lat: 34.0522, lng: -118.2437,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Los%20Angeles?hl=en-US&gl=US&ceid=US:en', source: 'Google News LA' },
    ],
  },
  chicago: {
    label: 'Chicago', region: 'us', country: 'US',
    lat: 41.8781, lng: -87.6298,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Chicago?hl=en-US&gl=US&ceid=US:en', source: 'Google News Chicago' },
    ],
  },
  'san-francisco': {
    label: 'San Francisco', region: 'us', country: 'US',
    lat: 37.7749, lng: -122.4194,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/San%20Francisco?hl=en-US&gl=US&ceid=US:en', source: 'Google News SF' },
    ],
  },
  'washington-dc': {
    label: 'Washington DC', region: 'us', country: 'US',
    lat: 38.9072, lng: -77.0369,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Washington%20DC?hl=en-US&gl=US&ceid=US:en', source: 'Google News DC' },
    ],
  },

  // === Phase 3: Australia 3 ===
  sydney: {
    label: 'Sydney', region: 'australia', country: 'AU',
    lat: -33.8688, lng: 151.2093,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Sydney?hl=en-AU&gl=AU&ceid=AU:en', source: 'Google News Sydney' },
    ],
  },
  melbourne: {
    label: 'Melbourne', region: 'australia', country: 'AU',
    lat: -37.8136, lng: 144.9631,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Melbourne?hl=en-AU&gl=AU&ceid=AU:en', source: 'Google News Melbourne' },
    ],
  },
  brisbane: {
    label: 'Brisbane', region: 'australia', country: 'AU',
    lat: -27.4698, lng: 153.0251,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Brisbane?hl=en-AU&gl=AU&ceid=AU:en', source: 'Google News Brisbane' },
    ],
  },
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
//   { type: 'city',    city, region }
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

  // 5. City-level feeds
  for (const [city, meta] of Object.entries(CITY_FEEDS)) {
    for (const { url, source } of meta.feeds) {
      register(url, source, { type: 'city', city, region: meta.region });
    }
  }

  return map;
}
