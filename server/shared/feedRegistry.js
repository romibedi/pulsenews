// ---------------------------------------------------------------------------
// feedRegistry.js -- Single source of truth for every RSS feed the app uses.
// ---------------------------------------------------------------------------

// --- Global category feeds (15 categories) ---
export const FEEDS = {
  world: [
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC News' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
    { url: 'https://feeds.npr.org/1004/rss.xml', source: 'NPR' },
    { url: 'https://abcnews.go.com/abcnews/internationalheadlines', source: 'ABC News' },
    { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian' },
    { url: 'https://feedx.net/rss/ap.xml', source: 'AP News' },
    { url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', source: 'Google News' },
    { url: 'http://rss.cnn.com/rss/cnn_world.rss', source: 'CNN World' },
    { url: 'https://moxie.foxnews.com/google-publisher/world.xml', source: 'Fox News World' },
    { url: 'https://www.cbsnews.com/latest/rss/world', source: 'CBS News World' },
    { url: 'https://feeds.skynews.com/feeds/rss/world.xml', source: 'Sky News World' },
    { url: 'https://www.independent.co.uk/news/world/rss', source: 'The Independent World' },
    { url: 'https://www.cnbc.com/id/100727362/device/rss/rss.html', source: 'CNBC World' },
    { url: 'https://theconversation.com/global/home-page.atom', source: 'The Conversation' },
    { url: 'http://rssfeeds.usatoday.com/usatoday-NewsTopStories', source: 'USA Today' },
    { url: 'https://rss.dw.com/xml/rss-en-all', source: 'DW News' },
  ],
  technology: [
    { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Tech' },
    { url: 'https://feeds.npr.org/1019/rss.xml', source: 'NPR Tech' },
    { url: 'https://feeds.arstechnica.com/arstechnica/index', source: 'Ars Technica' },
    { url: 'https://www.theguardian.com/technology/rss', source: 'The Guardian Tech' },
    { url: 'https://www.wired.com/feed/rss', source: 'Wired' },
    { url: 'https://www.engadget.com/rss.xml', source: 'Engadget' },
    { url: 'https://www.cnet.com/rss/news/', source: 'CNET' },
    { url: 'https://www.zdnet.com/news/rss.xml', source: 'ZDNet' },
    { url: 'http://rss.cnn.com/rss/cnn_tech.rss', source: 'CNN Tech' },
    { url: 'https://www.cnbc.com/id/19854910/device/rss/rss.html', source: 'CNBC Tech' },
    { url: 'https://feeds.skynews.com/feeds/rss/technology.xml', source: 'Sky News Tech' },
    { url: 'https://moxie.foxnews.com/google-publisher/tech.xml', source: 'Fox News Tech' },
  ],
  business: [
    { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business' },
    { url: 'https://feeds.npr.org/1006/rss.xml', source: 'NPR Business' },
    { url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html', source: 'CNBC Business' },
    { url: 'http://rss.cnn.com/rss/money_latest.rss', source: 'CNN Business' },
    { url: 'https://feeds.skynews.com/feeds/rss/business.xml', source: 'Sky News Business' },
    { url: 'https://fortune.com/feed/', source: 'Fortune' },
    { url: 'http://feeds2.feedburner.com/businessinsider', source: 'Business Insider' },
    { url: 'https://rss.dw.com/xml/rss-en-bus', source: 'DW Business' },
  ],
  science: [
    { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', source: 'BBC Science' },
    { url: 'https://feeds.npr.org/1007/rss.xml', source: 'NPR Science' },
    { url: 'http://rss.sciam.com/ScientificAmerican-Global', source: 'Scientific American' },
    { url: 'https://phys.org/rss-feed/', source: 'Phys.org' },
    { url: 'https://moxie.foxnews.com/google-publisher/science.xml', source: 'Fox News Science' },
    { url: 'https://www.cbsnews.com/latest/rss/science', source: 'CBS News Science' },
    { url: 'https://rss.dw.com/xml/rss-en-science', source: 'DW Science' },
  ],
  sport: [
    { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport' },
    { url: 'https://www.espn.com/espn/rss/news', source: 'ESPN' },
    { url: 'https://www.theguardian.com/uk/sport/rss', source: 'The Guardian Sport' },
    { url: 'https://moxie.foxnews.com/google-publisher/sports.xml', source: 'Fox News Sports' },
  ],
  culture: [
    { url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', source: 'BBC Arts' },
    { url: 'https://feeds.npr.org/1008/rss.xml', source: 'NPR Arts' },
    { url: 'https://www.theguardian.com/culture/rss', source: 'The Guardian Culture' },
    { url: 'https://rss.dw.com/xml/rss-en-cul', source: 'DW Culture' },
  ],
  environment: [
    { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', source: 'BBC Environment' },
    { url: 'https://www.theguardian.com/environment/rss', source: 'The Guardian Environment' },
  ],
  politics: [
    { url: 'https://feeds.bbci.co.uk/news/politics/rss.xml', source: 'BBC Politics' },
    { url: 'https://feeds.npr.org/1014/rss.xml', source: 'NPR Politics' },
    { url: 'https://rss.politico.com/politics-news.xml', source: 'Politico' },
    { url: 'https://thehill.com/news/feed/', source: 'The Hill' },
    { url: 'http://rss.cnn.com/rss/cnn_allpolitics.rss', source: 'CNN Politics' },
    { url: 'https://moxie.foxnews.com/google-publisher/politics.xml', source: 'Fox News Politics' },
    { url: 'https://www.cnbc.com/id/10000113/device/rss/rss.html', source: 'CNBC Politics' },
    { url: 'https://feeds.skynews.com/feeds/rss/politics.xml', source: 'Sky News Politics' },
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
    { url: 'https://www.hollywoodreporter.com/feed/', source: 'Hollywood Reporter' },
    { url: 'http://rss.cnn.com/rss/cnn_showbiz.rss', source: 'CNN Entertainment' },
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
    { url: 'https://www.universetoday.com/feed', source: 'Universe Today' },
  ],
  crypto: [
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk' },
    { url: 'https://cointelegraph.com/rss', source: 'CoinTelegraph' },
    { url: 'https://decrypt.co/feed', source: 'Decrypt' },
    { url: 'https://www.theblock.co/rss.xml', source: 'The Block' },
    { url: 'https://bitcoinmagazine.com/feed', source: 'Bitcoin Magazine' },
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
    { url: 'https://www.independent.co.uk/news/uk/rss', source: 'The Independent UK' },
    { url: 'https://www.theguardian.com/uk-news/rss', source: 'The Guardian UK' },
    { url: 'https://www.rte.ie/rss/news.xml', source: 'RTÉ News' },
    { url: 'https://www.thejournal.ie/feed/', source: 'The Journal.ie' },
  ],
  us: [
    { url: 'https://feeds.npr.org/1003/rss.xml', source: 'NPR US' },
    { url: 'https://abcnews.go.com/abcnews/usheadlines', source: 'ABC US' },
    { url: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml', source: 'BBC US' },
    { url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', source: 'Google News US' },
    { url: 'http://rss.cnn.com/rss/cnn_topstories.rss', source: 'CNN' },
    { url: 'https://moxie.foxnews.com/google-publisher/us.xml', source: 'Fox News US' },
    { url: 'https://www.cbsnews.com/latest/rss/main', source: 'CBS News' },
    { url: 'http://rssfeeds.usatoday.com/usatoday-NewsTopStories', source: 'USA Today' },
    { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', source: 'CNBC' },
  ],
  australia: [
    { url: 'https://www.abc.net.au/news/feed/2942460/rss.xml', source: 'ABC Australia' },
    { url: 'https://feeds.bbci.co.uk/news/world/australia/rss.xml', source: 'BBC Australia' },
    { url: 'https://www.theguardian.com/australia-news/rss', source: 'Guardian Australia' },
    { url: 'https://www.stuff.co.nz/rss', source: 'Stuff NZ' },
  ],
  'middle-east': [
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
    { url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', source: 'BBC Middle East' },
    { url: 'https://www.dailysabah.com/rss/home-page', source: 'Daily Sabah' },
    { url: 'https://www.timesofisrael.com/feed/', source: 'Times of Israel' },
  ],
  europe: [
    { url: 'https://feeds.bbci.co.uk/news/world/europe/rss.xml', source: 'BBC Europe' },
    { url: 'https://www.rfi.fr/en/rss', source: 'RFI' },
    { url: 'https://rss.dw.com/xml/rss-en-world', source: 'DW News' },
    { url: 'http://feeds.feedburner.com/euronews/en/home/', source: 'EuroNews' },
    { url: 'https://www.rte.ie/rss/news.xml', source: 'RTÉ' },
    { url: 'https://www.thejournal.ie/feed/', source: 'The Journal.ie' },
  ],
  africa: [
    { url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml', source: 'BBC Africa' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
    { url: 'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf', source: 'AllAfrica' },
    { url: 'https://www.premiumtimesng.com/feed', source: 'Premium Times Nigeria' },
    { url: 'https://www.vanguardngr.com/feed/', source: 'Vanguard Nigeria' },
    { url: 'https://feeds.news24.com/articles/news24/TopStories/rss', source: 'News24 SA' },
    { url: 'https://punchng.com/feed/', source: 'Punch Nigeria' },
  ],
  asia: [
    { url: 'https://feeds.bbci.co.uk/news/world/asia/rss.xml', source: 'BBC Asia' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
    { url: 'https://www.scmp.com/rss/91/feed', source: 'SCMP' },
    { url: 'https://www.straitstimes.com/news/rss.xml', source: 'Straits Times' },
    { url: 'https://en.yna.co.kr/RSS/news.xml', source: 'Yonhap English' },
    { url: 'https://www.rappler.com/feed/', source: 'Rappler' },
    { url: 'https://e.vnexpress.net/rss/news.rss', source: 'VnExpress English' },
    { url: 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml', source: 'CNA' },
    { url: 'https://www.japantimes.co.jp/feed/', source: 'Japan Times' },
  ],
  latam: [
    { url: 'https://feeds.bbci.co.uk/news/world/latin_america/rss.xml', source: 'BBC Latin America' },
    { url: 'https://en.mercopress.com/rss', source: 'MercoPress' },
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
      { url: 'https://www.dailysabah.com/rss/world', source: 'Daily Sabah World' },
    ],
    technology: [
      { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Tech' },
      { url: 'https://www.dailysabah.com/rss/business/tech', source: 'Daily Sabah Tech' },
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
      { url: 'https://www.timesofisrael.com/feed/', source: 'Times of Israel' },
    ],
  },
  europe: {
    world: [
      { url: 'https://feeds.bbci.co.uk/news/world/europe/rss.xml', source: 'BBC Europe' },
      { url: 'https://www.rfi.fr/en/rss', source: 'RFI' },
      { url: 'https://rss.dw.com/xml/rss-en-world', source: 'DW News' },
      { url: 'http://feeds.feedburner.com/euronews/en/home/', source: 'EuroNews' },
      { url: 'https://www.rte.ie/rss/news.xml', source: 'RTÉ' },
    ],
    technology: [
      { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Tech' },
      { url: 'https://feeds.nos.nl/nosnieuwstech', source: 'NOS Tech' },
    ],
    business: [
      { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business' },
      { url: 'https://rss.dw.com/xml/rss-en-bus', source: 'DW Business' },
      { url: 'https://feeds.nos.nl/nosnieuwseconomie', source: 'NOS Economy' },
      { url: 'https://www.rte.ie/rss/business.xml', source: 'RTÉ Business' },
    ],
    sport: [
      { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport' },
      { url: 'https://www.rte.ie/rss/sport.xml', source: 'RTÉ Sport' },
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
      { url: 'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf', source: 'AllAfrica' },
      { url: 'https://www.premiumtimesng.com/feed', source: 'Premium Times Nigeria' },
      { url: 'https://www.vanguardngr.com/feed/', source: 'Vanguard Nigeria' },
      { url: 'https://punchng.com/feed/', source: 'Punch Nigeria' },
    ],
    technology: [
      { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Tech' },
    ],
    business: [
      { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business' },
      { url: 'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf', source: 'AllAfrica' },
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
      { url: 'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf', source: 'AllAfrica' },
    ],
  },
  asia: {
    world: [
      { url: 'https://feeds.bbci.co.uk/news/world/asia/rss.xml', source: 'BBC Asia' },
      { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
      { url: 'https://www.scmp.com/rss/91/feed', source: 'SCMP' },
      { url: 'https://www.straitstimes.com/news/rss.xml', source: 'Straits Times' },
      { url: 'https://en.yna.co.kr/RSS/news.xml', source: 'Yonhap English' },
      { url: 'https://www.rappler.com/feed/', source: 'Rappler' },
      { url: 'https://e.vnexpress.net/rss/news.rss', source: 'VnExpress English' },
    ],
    technology: [
      { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Tech' },
      { url: 'https://www.scmp.com/rss/36/feed', source: 'SCMP Tech' },
    ],
    business: [
      { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business' },
      { url: 'https://www.scmp.com/rss/92/feed', source: 'SCMP Business' },
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
      { url: 'https://www.scmp.com/rss/4/feed', source: 'SCMP China' },
    ],
  },
  latam: {
    world: [
      { url: 'https://feeds.bbci.co.uk/news/world/latin_america/rss.xml', source: 'BBC Latin America' },
      { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
      { url: 'https://en.mercopress.com/rss', source: 'MercoPress' },
    ],
    technology: [
      { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Tech' },
    ],
    business: [
      { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business' },
      { url: 'https://en.mercopress.com/rss', source: 'MercoPress' },
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

// --- Language-specific feeds (28 languages) ---
export const LANG_FEEDS = {
  // ===== Indian Languages =====
  hi: [
    { url: 'https://feeds.bbci.co.uk/hindi/rss.xml', source: 'BBC Hindi' },
    { url: 'https://rss.jagran.com/rss/news/national.xml', source: 'Dainik Jagran' },
    { url: 'https://www.amarujala.com/rss/breaking-news.xml', source: 'Amar Ujala' },
    { url: 'https://www.bhaskar.com/rss-feed/1061/', source: 'Dainik Bhaskar' },
    { url: 'https://feeds.feedburner.com/ndtvkhabar', source: 'NDTV Hindi' },
    { url: 'https://feed.livehindustan.com/rss/3127', source: 'Live Hindustan' },
    { url: 'https://www.jansatta.com/feed/', source: 'Jansatta' },
    { url: 'https://news.google.com/rss?hl=hi-IN&gl=IN&ceid=IN:hi', source: 'Google News Hindi' },
  ],
  ta: [
    { url: 'https://feeds.bbci.co.uk/tamil/rss.xml', source: 'BBC Tamil' },
    { url: 'https://www.hindutamil.in/stories.rss', source: 'The Hindu Tamil' },
    { url: 'https://www.dinamalar.com/rssfeed.asp', source: 'Dinamalar' },
    { url: 'https://www.vikatan.com/rss', source: 'Vikatan' },
    { url: 'https://news.google.com/rss?hl=ta-IN&gl=IN&ceid=IN:ta', source: 'Google News Tamil' },
  ],
  te: [
    { url: 'https://feeds.bbci.co.uk/telugu/rss.xml', source: 'BBC Telugu' },
    { url: 'https://www.sakshi.com/rss.xml', source: 'Sakshi' },
    { url: 'https://www.eenadu.net/rss/telugu-news.xml', source: 'Eenadu' },
    { url: 'https://news.google.com/rss?hl=te-IN&gl=IN&ceid=IN:te', source: 'Google News Telugu' },
  ],
  bn: [
    { url: 'https://feeds.bbci.co.uk/bengali/rss.xml', source: 'BBC Bangla' },
    { url: 'https://eisamay.com/stories.rss', source: 'Ei Samay' },
    { url: 'https://zeenews.india.com/bengali/rssfeed/nation.xml', source: 'Zee News Bengali' },
    { url: 'https://news.google.com/rss?hl=bn-IN&gl=IN&ceid=IN:bn', source: 'Google News Bengali' },
  ],
  mr: [
    { url: 'https://zeenews.india.com/marathi/rss/india-news.xml', source: 'Zee News Marathi' },
    { url: 'https://zeenews.india.com/marathi/rss/maharashtra-news.xml', source: 'Zee News Maharashtra' },
    { url: 'https://www.loksatta.com/desh-videsh/feed/', source: 'Loksatta' },
    { url: 'https://news.google.com/rss?hl=mr-IN&gl=IN&ceid=IN:mr', source: 'Google News Marathi' },
  ],
  kn: [
    { url: 'https://news.google.com/rss?hl=kn-IN&gl=IN&ceid=IN:kn', source: 'Google News Kannada' },
    { url: 'https://vijaykarnataka.com/rssfeedsdefault.cms', source: 'Vijaya Karnataka' },
  ],
  ml: [
    { url: 'https://news.google.com/rss?hl=ml-IN&gl=IN&ceid=IN:ml', source: 'Google News Malayalam' },
    { url: 'http://feeds.feedburner.com/mathrubhumi', source: 'Mathrubhumi' },
    { url: 'https://www.manoramaonline.com/rss/news/', source: 'Manorama Online' },
  ],
  gu: [
    { url: 'https://feeds.bbci.co.uk/gujarati/rss.xml', source: 'BBC Gujarati' },
    { url: 'https://news.google.com/rss?hl=gu-IN&gl=IN&ceid=IN:gu', source: 'Google News Gujarati' },
    { url: 'https://www.gujaratsamachar.com/rss/top-stories', source: 'Gujarat Samachar' },
    { url: 'https://www.divyabhaskar.co.in/rss-feed/1037/', source: 'Divya Bhaskar' },
  ],
  pa: [
    { url: 'https://feeds.bbci.co.uk/punjabi/rss.xml', source: 'BBC Punjabi' },
    { url: 'https://news.google.com/rss?hl=pa-IN&gl=IN&ceid=IN:pa', source: 'Google News Punjabi' },
  ],
  ur: [
    { url: 'https://feeds.bbci.co.uk/urdu/rss.xml', source: 'BBC Urdu' },
    { url: 'https://news.google.com/rss?hl=ur-PK&gl=PK&ceid=PK:ur', source: 'Google News Urdu' },
  ],
  as: [
    { url: 'https://news.google.com/rss?hl=as-IN&gl=IN&ceid=IN:as', source: 'Google News Assamese' },
  ],

  // ===== Middle East & Africa =====
  ar: [
    { url: 'https://feeds.bbci.co.uk/arabic/rss.xml', source: 'BBC Arabic' },
    { url: 'https://aawsat.com/feed', source: 'Asharq Al-Awsat' },
    { url: 'https://arabic.rt.com/rss/', source: 'RT Arabic' },
    { url: 'https://news.google.com/rss?hl=ar-SA&gl=SA&ceid=SA:ar', source: 'Google News Arabic' },
    { url: 'https://news.google.com/rss?hl=ar-EG&gl=EG&ceid=EG:ar', source: 'Google News Arabic Egypt' },
  ],
  fa: [
    { url: 'https://feeds.bbci.co.uk/persian/rss.xml', source: 'BBC Persian' },
    { url: 'https://news.google.com/rss?hl=fa-IR&gl=IR&ceid=IR:fa', source: 'Google News Persian' },
  ],
  he: [
    { url: 'https://news.google.com/rss?hl=iw-IL&gl=IL&ceid=IL:he', source: 'Google News Hebrew' },
  ],
  sw: [
    { url: 'https://feeds.bbci.co.uk/swahili/rss.xml', source: 'BBC Swahili' },
    { url: 'https://news.google.com/rss?hl=sw-KE&gl=KE&ceid=KE:sw', source: 'Google News Swahili' },
  ],

  // ===== European Languages =====
  fr: [
    { url: 'https://www.france24.com/fr/rss', source: 'France 24' },
    { url: 'https://www.rfi.fr/fr/rss', source: 'RFI French' },
    { url: 'https://www.lemonde.fr/rss/une.xml', source: 'Le Monde' },
    { url: 'http://www.lefigaro.fr/rss/figaro_actualites.xml', source: 'Le Figaro' },
    { url: 'https://www.20minutes.fr/feeds/rss-une.xml', source: '20 Minutes' },
    { url: 'https://news.google.com/rss?hl=fr-FR&gl=FR&ceid=FR:fr', source: 'Google News French' },
  ],
  de: [
    { url: 'https://rss.dw.com/xml/rss-de-all', source: 'DW German' },
    { url: 'https://www.tagesschau.de/xml/rss2', source: 'Tagesschau' },
    { url: 'https://www.spiegel.de/schlagzeilen/index.rss', source: 'Der Spiegel' },
    { url: 'https://rss.sueddeutsche.de/rss/Topthemen', source: 'Süddeutsche Zeitung' },
    { url: 'https://news.google.com/rss?hl=de-DE&gl=DE&ceid=DE:de', source: 'Google News German' },
  ],
  es: [
    { url: 'https://feeds.bbci.co.uk/mundo/rss.xml', source: 'BBC Mundo' },
    { url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada', source: 'El Pais' },
    { url: 'https://www.clarin.com/rss/lo-ultimo/', source: 'Clarín' },
    { url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/', source: 'La Nación Argentina' },
    { url: 'https://www.eltiempo.com/rss/eltiempo.xml', source: 'El Tiempo Colombia' },
    { url: 'https://news.google.com/rss?hl=es-419&gl=MX&ceid=MX:es-419', source: 'Google News Spanish' },
  ],
  pt: [
    { url: 'https://feeds.bbci.co.uk/portuguese/rss.xml', source: 'BBC Portuguese' },
    { url: 'https://feeds.folha.uol.com.br/emcimadahora/rss091.xml', source: 'Folha de S.Paulo' },
    { url: 'http://rss.home.uol.com.br/index.xml', source: 'UOL' },
    { url: 'https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419', source: 'Google News Portuguese' },
  ],
  it: [
    { url: 'https://news.google.com/rss?hl=it-IT&gl=IT&ceid=IT:it', source: 'Google News Italian' },
    { url: 'https://www.ansa.it/sito/ansait_rss.xml', source: 'ANSA' },
    { url: 'http://xml2.corriereobjects.it/rss/homepage.xml', source: 'Corriere della Sera' },
    { url: 'https://www.repubblica.it/rss/homepage/rss2.0.xml', source: 'La Repubblica' },
  ],
  nl: [
    { url: 'https://news.google.com/rss?hl=nl-NL&gl=NL&ceid=NL:nl', source: 'Google News Dutch' },
    { url: 'https://feeds.nos.nl/nosnieuwsalgemeen', source: 'NOS Nieuws' },
    { url: 'https://www.telegraaf.nl/rss', source: 'De Telegraaf' },
    { url: 'https://www.dutchnews.nl/feed/', source: 'DutchNews' },
  ],
  sv: [
    { url: 'https://news.google.com/rss?hl=sv-SE&gl=SE&ceid=SE:sv', source: 'Google News Swedish' },
    { url: 'https://www.svt.se/nyheter/rss.xml', source: 'SVT Nyheter' },
    { url: 'https://rss.aftonbladet.se/rss2/small/pages/sections/senastenytt/', source: 'Aftonbladet' },
  ],
  tr: [
    { url: 'https://feeds.bbci.co.uk/turkce/rss.xml', source: 'BBC Turkish' },
    { url: 'https://news.google.com/rss?hl=tr-TR&gl=TR&ceid=TR:tr', source: 'Google News Turkish' },
  ],
  pl: [
    { url: 'https://www.rmf24.pl/feed', source: 'RMF24' },
    { url: 'https://news.google.com/rss?hl=pl-PL&gl=PL&ceid=PL:pl', source: 'Google News Polish' },
  ],
  ru: [
    { url: 'https://feeds.bbci.co.uk/russian/rss.xml', source: 'BBC Russian' },
    { url: 'https://news.google.com/rss?hl=ru-RU&gl=RU&ceid=RU:ru', source: 'Google News Russian' },
  ],

  // ===== East Asia =====
  zh: [
    { url: 'https://feeds.bbci.co.uk/zhongwen/simp/rss.xml', source: 'BBC Chinese' },
    { url: 'https://news.google.com/rss?hl=zh-CN&gl=CN&ceid=CN:zh-Hans', source: 'Google News Chinese' },
    { url: 'https://news.google.com/rss?hl=zh-TW&gl=TW&ceid=TW:zh-Hant', source: 'Google News Chinese TW' },
  ],
  ja: [
    { url: 'https://feeds.bbci.co.uk/japanese/rss.xml', source: 'BBC Japanese' },
    { url: 'https://www3.nhk.or.jp/rss/news/cat0.xml', source: 'NHK' },
    { url: 'https://news.google.com/rss?hl=ja-JP&gl=JP&ceid=JP:ja', source: 'Google News Japanese' },
  ],
  ko: [
    { url: 'https://feeds.bbci.co.uk/korean/rss.xml', source: 'BBC Korean' },
    { url: 'https://news.google.com/rss?hl=ko-KR&gl=KR&ceid=KR:ko', source: 'Google News Korean' },
  ],

  // ===== Southeast Asia =====
  th: [
    { url: 'https://feeds.bbci.co.uk/thai/rss.xml', source: 'BBC Thai' },
    { url: 'https://news.google.com/rss?hl=th-TH&gl=TH&ceid=TH:th', source: 'Google News Thai' },
  ],
  id: [
    { url: 'https://feeds.bbci.co.uk/indonesia/rss.xml', source: 'BBC Indonesia' },
    { url: 'https://news.google.com/rss?hl=id-ID&gl=ID&ceid=ID:id', source: 'Google News Indonesian' },
  ],
  vi: [
    { url: 'https://news.google.com/rss?hl=vi-VN&gl=VN&ceid=VN:vi', source: 'Google News Vietnamese' },
  ],
  ms: [
    { url: 'https://news.google.com/rss?hl=ms-MY&gl=MY&ceid=MY:ms', source: 'Google News Malay' },
  ],
  fil: [
    { url: 'https://news.google.com/rss?hl=tl-PH&gl=PH&ceid=PH:tl', source: 'Google News Filipino' },
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
      { url: 'https://news.google.com/rss/headlines/section/geo/New%20Delhi?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Delhi' },
      { url: 'https://news.google.com/rss/headlines/section/geo/New%20Delhi?hl=hi-IN&gl=IN&ceid=IN:hi', source: 'Google News Delhi Hindi' },
      { url: 'https://www.hindustantimes.com/feeds/rss/cities/delhi-news/rssfeed.xml', source: 'HT Delhi' },
    ],
  },
  bangalore: {
    label: 'Bangalore', region: 'india', country: 'IN',
    lang: 'kn', lat: 12.9716, lng: 77.5946,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Bangalore?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Bangalore' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Bengaluru?hl=kn-IN&gl=IN&ceid=IN:kn', source: 'Google News Bangalore Kannada' },
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

  // === UK (8 cities) ===
  london: {
    label: 'London', region: 'uk', country: 'GB',
    lat: 51.5074, lng: -0.1278,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/London?hl=en-GB&gl=GB&ceid=GB:en', source: 'Google News London' },
      { url: 'https://feeds.bbci.co.uk/news/england/london/rss.xml', source: 'BBC London' },
      { url: 'https://www.standard.co.uk/rss', source: 'Evening Standard' },
    ],
  },
  manchester: {
    label: 'Manchester', region: 'uk', country: 'GB',
    lat: 53.4808, lng: -2.2426,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Manchester?hl=en-GB&gl=GB&ceid=GB:en', source: 'Google News Manchester' },
      { url: 'https://feeds.bbci.co.uk/news/england/manchester/rss.xml', source: 'BBC Manchester' },
      { url: 'https://www.manchestereveningnews.co.uk/?service=rss', source: 'Manchester Evening News' },
    ],
  },
  birmingham: {
    label: 'Birmingham', region: 'uk', country: 'GB',
    lat: 52.4862, lng: -1.8904,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Birmingham%20UK?hl=en-GB&gl=GB&ceid=GB:en', source: 'Google News Birmingham' },
      { url: 'https://feeds.bbci.co.uk/news/england/birmingham_and_black_country/rss.xml', source: 'BBC Birmingham' },
      { url: 'https://www.birminghammail.co.uk/?service=rss', source: 'Birmingham Mail' },
    ],
  },
  edinburgh: {
    label: 'Edinburgh', region: 'uk', country: 'GB',
    lat: 55.9533, lng: -3.1883,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Edinburgh?hl=en-GB&gl=GB&ceid=GB:en', source: 'Google News Edinburgh' },
      { url: 'https://feeds.bbci.co.uk/news/scotland/edinburgh_east_and_fife/rss.xml', source: 'BBC Edinburgh' },
      { url: 'https://www.edinburghlive.co.uk/?service=rss', source: 'Edinburgh Live' },
      { url: 'https://www.scotsman.com/rss', source: 'The Scotsman' },
    ],
  },
  glasgow: {
    label: 'Glasgow', region: 'uk', country: 'GB',
    lat: 55.8642, lng: -4.2518,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Glasgow?hl=en-GB&gl=GB&ceid=GB:en', source: 'Google News Glasgow' },
      { url: 'https://feeds.bbci.co.uk/news/scotland/glasgow_and_west/rss.xml', source: 'BBC Glasgow' },
      { url: 'https://www.glasgowtimes.co.uk/news/rss/', source: 'Glasgow Times' },
    ],
  },
  leeds: {
    label: 'Leeds', region: 'uk', country: 'GB',
    lat: 53.8008, lng: -1.5491,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Leeds?hl=en-GB&gl=GB&ceid=GB:en', source: 'Google News Leeds' },
      { url: 'https://feeds.bbci.co.uk/news/england/leeds_and_west_yorkshire/rss.xml', source: 'BBC Leeds' },
      { url: 'https://www.yorkshireeveningpost.co.uk/rss', source: 'Yorkshire Evening Post' },
    ],
  },
  liverpool: {
    label: 'Liverpool', region: 'uk', country: 'GB',
    lat: 53.4084, lng: -2.9916,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Liverpool?hl=en-GB&gl=GB&ceid=GB:en', source: 'Google News Liverpool' },
      { url: 'https://feeds.bbci.co.uk/news/england/merseyside/rss.xml', source: 'BBC Merseyside' },
      { url: 'https://www.liverpoolecho.co.uk/?service=rss', source: 'Liverpool Echo' },
    ],
  },
  bristol: {
    label: 'Bristol', region: 'uk', country: 'GB',
    lat: 51.4545, lng: -2.5879,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Bristol?hl=en-GB&gl=GB&ceid=GB:en', source: 'Google News Bristol' },
      { url: 'https://feeds.bbci.co.uk/news/england/bristol/rss.xml', source: 'BBC Bristol' },
      { url: 'https://www.bristolpost.co.uk/?service=rss', source: 'Bristol Post' },
    ],
  },

  // === US (15 cities) ===
  'new-york': {
    label: 'New York', region: 'us', country: 'US',
    lat: 40.7128, lng: -74.006,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/New%20York?hl=en-US&gl=US&ceid=US:en', source: 'Google News NYC' },
      { url: 'https://gothamist.com/feed', source: 'Gothamist' },
      { url: 'https://nypost.com/feed/', source: 'NY Post' },
      { url: 'https://www.thecity.nyc/feed/', source: 'The City NYC' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml', source: 'NY Times NY Region' },
    ],
  },
  'los-angeles': {
    label: 'Los Angeles', region: 'us', country: 'US',
    lang: 'es', lat: 34.0522, lng: -118.2437,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Los%20Angeles?hl=en-US&gl=US&ceid=US:en', source: 'Google News LA' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Los%20Angeles?hl=es-419&gl=US&ceid=US:es-419', source: 'Google News LA Spanish' },
      { url: 'https://laist.com/index.atom', source: 'LAist' },
      { url: 'https://ktla.com/feed/', source: 'KTLA' },
    ],
  },
  chicago: {
    label: 'Chicago', region: 'us', country: 'US',
    lat: 41.8781, lng: -87.6298,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Chicago?hl=en-US&gl=US&ceid=US:en', source: 'Google News Chicago' },
      { url: 'https://blockclubchicago.org/feed/', source: 'Block Club Chicago' },
    ],
  },
  'san-francisco': {
    label: 'San Francisco', region: 'us', country: 'US',
    lat: 37.7749, lng: -122.4194,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/San%20Francisco?hl=en-US&gl=US&ceid=US:en', source: 'Google News SF' },
      { url: 'https://ww2.kqed.org/news/feed/', source: 'KQED' },
      { url: 'https://sfstandard.com/feed/', source: 'SF Standard' },
      { url: 'https://missionlocal.org/feed/', source: 'Mission Local' },
    ],
  },
  'washington-dc': {
    label: 'Washington DC', region: 'us', country: 'US',
    lat: 38.9072, lng: -77.0369,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Washington%20DC?hl=en-US&gl=US&ceid=US:en', source: 'Google News DC' },
      { url: 'https://wtop.com/feed/', source: 'WTOP' },
    ],
  },
  houston: {
    label: 'Houston', region: 'us', country: 'US',
    lang: 'es', lat: 29.7604, lng: -95.3698,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Houston?hl=en-US&gl=US&ceid=US:en', source: 'Google News Houston' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Houston?hl=es-419&gl=US&ceid=US:es-419', source: 'Google News Houston Spanish' },
      { url: 'https://houstonlanding.org/feed/', source: 'Houston Landing' },
      { url: 'https://abc13.com/feed/', source: 'ABC13 Houston' },
    ],
  },
  miami: {
    label: 'Miami', region: 'us', country: 'US',
    lang: 'es', lat: 25.7617, lng: -80.1918,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Miami?hl=en-US&gl=US&ceid=US:en', source: 'Google News Miami' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Miami?hl=es-419&gl=US&ceid=US:es-419', source: 'Google News Miami Spanish' },
      { url: 'https://www.nbcmiami.com/feed/', source: 'NBC Miami' },
    ],
  },
  dallas: {
    label: 'Dallas', region: 'us', country: 'US',
    lat: 32.7767, lng: -96.797,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Dallas?hl=en-US&gl=US&ceid=US:en', source: 'Google News Dallas' },
      { url: 'https://www.wfaa.com/feeds/syndication/rss/news/local', source: 'WFAA Dallas' },
      { url: 'https://www.texastribune.org/feed/', source: 'Texas Tribune' },
    ],
  },
  seattle: {
    label: 'Seattle', region: 'us', country: 'US',
    lat: 47.6062, lng: -122.3321,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Seattle?hl=en-US&gl=US&ceid=US:en', source: 'Google News Seattle' },
      { url: 'https://www.kuow.org/rss.xml', source: 'KUOW Seattle' },
      { url: 'https://crosscut.com/feed', source: 'Crosscut' },
      { url: 'https://publicola.com/feed/', source: 'PubliCola' },
    ],
  },
  boston: {
    label: 'Boston', region: 'us', country: 'US',
    lat: 42.3601, lng: -71.0589,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Boston?hl=en-US&gl=US&ceid=US:en', source: 'Google News Boston' },
      { url: 'https://www.wbur.org/feed', source: 'WBUR Boston' },
    ],
  },
  atlanta: {
    label: 'Atlanta', region: 'us', country: 'US',
    lat: 33.749, lng: -84.388,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Atlanta?hl=en-US&gl=US&ceid=US:en', source: 'Google News Atlanta' },
      { url: 'https://www.11alive.com/feeds/syndication/rss/news/local', source: '11Alive Atlanta' },
    ],
  },
  denver: {
    label: 'Denver', region: 'us', country: 'US',
    lat: 39.7392, lng: -104.9903,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Denver?hl=en-US&gl=US&ceid=US:en', source: 'Google News Denver' },
      { url: 'https://www.cpr.org/feed/', source: 'CPR News' },
      { url: 'https://denverite.com/feed/', source: 'Denverite' },
      { url: 'https://coloradosun.com/feed/', source: 'Colorado Sun' },
    ],
  },
  philadelphia: {
    label: 'Philadelphia', region: 'us', country: 'US',
    lat: 39.9526, lng: -75.1652,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Philadelphia?hl=en-US&gl=US&ceid=US:en', source: 'Google News Philadelphia' },
      { url: 'https://whyy.org/feed/', source: 'WHYY Philadelphia' },
      { url: 'https://www.phillyvoice.com/feed/', source: 'PhillyVoice' },
    ],
  },
  detroit: {
    label: 'Detroit', region: 'us', country: 'US',
    lat: 42.3314, lng: -83.0458,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Detroit?hl=en-US&gl=US&ceid=US:en', source: 'Google News Detroit' },
      { url: 'https://www.bridgedetroit.com/feed/', source: 'Bridge Detroit' },
    ],
  },
  phoenix: {
    label: 'Phoenix', region: 'us', country: 'US',
    lat: 33.4484, lng: -112.074,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Phoenix?hl=en-US&gl=US&ceid=US:en', source: 'Google News Phoenix' },
      { url: 'https://ktar.com/feed/', source: 'KTAR Phoenix' },
      { url: 'https://www.12news.com/feeds/syndication/rss/news/local', source: '12 News Phoenix' },
    ],
  },

  // === Australia (5 cities) ===
  sydney: {
    label: 'Sydney', region: 'australia', country: 'AU',
    lat: -33.8688, lng: 151.2093,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Sydney?hl=en-AU&gl=AU&ceid=AU:en', source: 'Google News Sydney' },
      { url: 'https://www.smh.com.au/rss/feed.xml', source: 'Sydney Morning Herald' },
    ],
  },
  melbourne: {
    label: 'Melbourne', region: 'australia', country: 'AU',
    lat: -37.8136, lng: 144.9631,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Melbourne?hl=en-AU&gl=AU&ceid=AU:en', source: 'Google News Melbourne' },
      { url: 'https://www.theage.com.au/rss/feed.xml', source: 'The Age' },
    ],
  },
  brisbane: {
    label: 'Brisbane', region: 'australia', country: 'AU',
    lat: -27.4698, lng: 153.0251,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Brisbane?hl=en-AU&gl=AU&ceid=AU:en', source: 'Google News Brisbane' },
      { url: 'https://www.brisbanetimes.com.au/rss/feed.xml', source: 'Brisbane Times' },
    ],
  },
  perth: {
    label: 'Perth', region: 'australia', country: 'AU',
    lat: -31.9505, lng: 115.8605,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Perth?hl=en-AU&gl=AU&ceid=AU:en', source: 'Google News Perth' },
      { url: 'https://www.watoday.com.au/rss/feed.xml', source: 'WAtoday' },
    ],
  },
  adelaide: {
    label: 'Adelaide', region: 'australia', country: 'AU',
    lat: -34.9285, lng: 138.6007,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Adelaide?hl=en-AU&gl=AU&ceid=AU:en', source: 'Google News Adelaide' },
      { url: 'https://www.abc.net.au/news/feed/2942460/rss.xml', source: 'ABC Adelaide' },
    ],
  },

  // =========================================================================
  // MIDDLE EAST (5 cities)
  // =========================================================================
  dubai: {
    label: 'Dubai', region: 'middle-east', country: 'AE',
    lang: 'ar', lat: 25.2048, lng: 55.2708,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Dubai?hl=en-US&gl=US&ceid=US:en', source: 'Google News Dubai' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Dubai?hl=ar-AE&gl=AE&ceid=AE:ar', source: 'Google News Dubai Arabic' },
      { url: 'https://www.dubaichronicle.com/feed/', source: 'Dubai Chronicle' },
    ],
  },
  riyadh: {
    label: 'Riyadh', region: 'middle-east', country: 'SA',
    lang: 'ar', lat: 24.7136, lng: 46.6753,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Riyadh?hl=en-US&gl=US&ceid=US:en', source: 'Google News Riyadh' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Riyadh?hl=ar-SA&gl=SA&ceid=SA:ar', source: 'Google News Riyadh Arabic' },
    ],
  },
  istanbul: {
    label: 'Istanbul', region: 'middle-east', country: 'TR',
    lang: 'tr', lat: 41.0082, lng: 28.9784,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Istanbul?hl=en-US&gl=US&ceid=US:en', source: 'Google News Istanbul' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Istanbul?hl=tr-TR&gl=TR&ceid=TR:tr', source: 'Google News Istanbul Turkish' },
      { url: 'https://www.dailysabah.com/rssFeed/turkey', source: 'Daily Sabah' },
    ],
  },
  cairo: {
    label: 'Cairo', region: 'middle-east', country: 'EG',
    lang: 'ar', lat: 30.0444, lng: 31.2357,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Cairo?hl=en-US&gl=US&ceid=US:en', source: 'Google News Cairo' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Cairo?hl=ar-EG&gl=EG&ceid=EG:ar', source: 'Google News Cairo Arabic' },
      { url: 'https://www.dailynewsegypt.com/feed/', source: 'Daily News Egypt' },
    ],
  },
  doha: {
    label: 'Doha', region: 'middle-east', country: 'QA',
    lang: 'ar', lat: 25.2854, lng: 51.531,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Doha?hl=en-US&gl=US&ceid=US:en', source: 'Google News Doha' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Doha?hl=ar-QA&gl=QA&ceid=QA:ar', source: 'Google News Doha Arabic' },
    ],
  },

  // =========================================================================
  // EUROPE (8 cities)
  // =========================================================================
  paris: {
    label: 'Paris', region: 'europe', country: 'FR',
    lang: 'fr', lat: 48.8566, lng: 2.3522,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Paris?hl=en-US&gl=US&ceid=US:en', source: 'Google News Paris' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Paris?hl=fr-FR&gl=FR&ceid=FR:fr', source: 'Google News Paris French' },
      { url: 'https://www.france24.com/en/france/rss', source: 'France 24 France' },
      { url: 'https://feeds.thelocal.com/rss/fr', source: 'The Local France' },
    ],
  },
  berlin: {
    label: 'Berlin', region: 'europe', country: 'DE',
    lang: 'de', lat: 52.52, lng: 13.405,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Berlin?hl=en-US&gl=US&ceid=US:en', source: 'Google News Berlin' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Berlin?hl=de-DE&gl=DE&ceid=DE:de', source: 'Google News Berlin German' },
      { url: 'https://rss.dw.com/xml/rss-en-all', source: 'DW News' },
      { url: 'https://feeds.thelocal.com/rss/de', source: 'The Local Germany' },
    ],
  },
  madrid: {
    label: 'Madrid', region: 'europe', country: 'ES',
    lang: 'es', lat: 40.4168, lng: -3.7038,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Madrid?hl=en-US&gl=US&ceid=US:en', source: 'Google News Madrid' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Madrid?hl=es-ES&gl=ES&ceid=ES:es', source: 'Google News Madrid Spanish' },
      { url: 'https://feeds.thelocal.com/rss/es', source: 'The Local Spain' },
    ],
  },
  rome: {
    label: 'Rome', region: 'europe', country: 'IT',
    lang: 'it', lat: 41.9028, lng: 12.4964,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Rome?hl=en-US&gl=US&ceid=US:en', source: 'Google News Rome' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Rome?hl=it-IT&gl=IT&ceid=IT:it', source: 'Google News Rome Italian' },
      { url: 'https://feeds.thelocal.com/rss/it', source: 'The Local Italy' },
    ],
  },
  amsterdam: {
    label: 'Amsterdam', region: 'europe', country: 'NL',
    lang: 'nl', lat: 52.3676, lng: 4.9041,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Amsterdam?hl=en-US&gl=US&ceid=US:en', source: 'Google News Amsterdam' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Amsterdam?hl=nl-NL&gl=NL&ceid=NL:nl', source: 'Google News Amsterdam Dutch' },
      { url: 'https://www.dutchnews.nl/feed/', source: 'DutchNews' },
      { url: 'https://nltimes.nl/feed', source: 'NL Times' },
    ],
  },
  barcelona: {
    label: 'Barcelona', region: 'europe', country: 'ES',
    lang: 'es', lat: 41.3874, lng: 2.1686,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Barcelona?hl=en-US&gl=US&ceid=US:en', source: 'Google News Barcelona' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Barcelona?hl=es-ES&gl=ES&ceid=ES:es', source: 'Google News Barcelona Spanish' },
    ],
  },
  munich: {
    label: 'Munich', region: 'europe', country: 'DE',
    lang: 'de', lat: 48.1351, lng: 11.582,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Munich?hl=en-US&gl=US&ceid=US:en', source: 'Google News Munich' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Munich?hl=de-DE&gl=DE&ceid=DE:de', source: 'Google News Munich German' },
    ],
  },
  stockholm: {
    label: 'Stockholm', region: 'europe', country: 'SE',
    lang: 'sv', lat: 59.3293, lng: 18.0686,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Stockholm?hl=en-US&gl=US&ceid=US:en', source: 'Google News Stockholm' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Stockholm?hl=sv-SE&gl=SE&ceid=SE:sv', source: 'Google News Stockholm Swedish' },
      { url: 'https://feeds.thelocal.com/rss/se', source: 'The Local Sweden' },
    ],
  },

  // =========================================================================
  // ASIA (6 cities)
  // =========================================================================
  tokyo: {
    label: 'Tokyo', region: 'asia', country: 'JP',
    lang: 'ja', lat: 35.6762, lng: 139.6503,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Tokyo?hl=en-US&gl=US&ceid=US:en', source: 'Google News Tokyo' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Tokyo?hl=ja-JP&gl=JP&ceid=JP:ja', source: 'Google News Tokyo Japanese' },
      { url: 'https://www.japantimes.co.jp/feed/', source: 'Japan Times' },
    ],
  },
  singapore: {
    label: 'Singapore', region: 'asia', country: 'SG',
    lat: 1.3521, lng: 103.8198,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Singapore?hl=en-SG&gl=SG&ceid=SG:en', source: 'Google News Singapore' },
      { url: 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml', source: 'CNA Singapore' },
      { url: 'https://www.straitstimes.com/news/singapore/rss.xml', source: 'Straits Times Singapore' },
    ],
  },
  'hong-kong': {
    label: 'Hong Kong', region: 'asia', country: 'HK',
    lang: 'zh', lat: 22.3193, lng: 114.1694,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Hong%20Kong?hl=en-US&gl=US&ceid=US:en', source: 'Google News Hong Kong' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Hong%20Kong?hl=zh-TW&gl=HK&ceid=HK:zh-Hant', source: 'Google News HK Chinese' },
    ],
  },
  seoul: {
    label: 'Seoul', region: 'asia', country: 'KR',
    lang: 'ko', lat: 37.5665, lng: 126.978,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Seoul?hl=en-US&gl=US&ceid=US:en', source: 'Google News Seoul' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Seoul?hl=ko-KR&gl=KR&ceid=KR:ko', source: 'Google News Seoul Korean' },
      { url: 'http://www.koreaherald.com/common/rss_xml.php', source: 'Korea Herald' },
      { url: 'https://www.koreaherald.com/rss/020100000000.xml', source: 'Korea Herald' },
      { url: 'https://www.koreatimes.co.kr/www/rss/rss.xml', source: 'Korea Times' },
    ],
  },
  bangkok: {
    label: 'Bangkok', region: 'asia', country: 'TH',
    lang: 'th', lat: 13.7563, lng: 100.5018,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Bangkok?hl=en-US&gl=US&ceid=US:en', source: 'Google News Bangkok' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Bangkok?hl=th-TH&gl=TH&ceid=TH:th', source: 'Google News Bangkok Thai' },
      { url: 'https://www.bangkokpost.com/rss/data/most-recent.xml', source: 'Bangkok Post' },
    ],
  },
  jakarta: {
    label: 'Jakarta', region: 'asia', country: 'ID',
    lang: 'id', lat: -6.2088, lng: 106.8456,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Jakarta?hl=en-US&gl=US&ceid=US:en', source: 'Google News Jakarta' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Jakarta?hl=id-ID&gl=ID&ceid=ID:id', source: 'Google News Jakarta Indonesian' },
      { url: 'https://rss.thejakartapost.com/home', source: 'Jakarta Post' },
    ],
  },

  // =========================================================================
  // AFRICA (4 cities)
  // =========================================================================
  nairobi: {
    label: 'Nairobi', region: 'africa', country: 'KE',
    lang: 'sw', lat: -1.2921, lng: 36.8219,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Nairobi?hl=en-KE&gl=KE&ceid=KE:en', source: 'Google News Nairobi' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Nairobi?hl=sw-KE&gl=KE&ceid=KE:sw', source: 'Google News Nairobi Swahili' },
      { url: 'https://nation.africa/kenya/rss.xml', source: 'Nation Africa Kenya' },
      { url: 'https://nairobileo.co.ke/feed/', source: 'Nairobi Leo' },
    ],
  },
  lagos: {
    label: 'Lagos', region: 'africa', country: 'NG',
    lat: 6.5244, lng: 3.3792,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Lagos?hl=en-NG&gl=NG&ceid=NG:en', source: 'Google News Lagos' },
      { url: 'https://punchng.com/feed/', source: 'Punch Nigeria' },
      { url: 'https://www.vanguardngr.com/feed/', source: 'Vanguard Nigeria' },
      { url: 'https://businessday.ng/feed/', source: 'BusinessDay Nigeria' },
    ],
  },
  johannesburg: {
    label: 'Johannesburg', region: 'africa', country: 'ZA',
    lat: -26.2041, lng: 28.0473,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Johannesburg?hl=en-ZA&gl=ZA&ceid=ZA:en', source: 'Google News Johannesburg' },
      { url: 'https://feeds.news24.com/articles/news24/TopStories/rss', source: 'News24' },
      { url: 'https://www.dailymaverick.co.za/dmrss/', source: 'Daily Maverick' },
    ],
  },
  'cape-town': {
    label: 'Cape Town', region: 'africa', country: 'ZA',
    lat: -33.9249, lng: 18.4241,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Cape%20Town?hl=en-ZA&gl=ZA&ceid=ZA:en', source: 'Google News Cape Town' },
      { url: 'https://www.dailymaverick.co.za/dmrss/', source: 'Daily Maverick' },
      { url: 'https://www.capetownetc.com/feed/', source: 'CapeTownEtc' },
    ],
  },

  // =========================================================================
  // LATIN AMERICA (5 cities)
  // =========================================================================
  'sao-paulo': {
    label: 'São Paulo', region: 'latam', country: 'BR',
    lang: 'pt', lat: -23.5505, lng: -46.6333,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/S%C3%A3o%20Paulo?hl=en-US&gl=US&ceid=US:en', source: 'Google News São Paulo' },
      { url: 'https://news.google.com/rss/headlines/section/geo/S%C3%A3o%20Paulo?hl=pt-BR&gl=BR&ceid=BR:pt-419', source: 'Google News SP Portuguese' },
      { url: 'https://riotimesonline.com/feed/', source: 'Rio Times' },
    ],
  },
  'mexico-city': {
    label: 'Mexico City', region: 'latam', country: 'MX',
    lang: 'es', lat: 19.4326, lng: -99.1332,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Mexico%20City?hl=en-US&gl=US&ceid=US:en', source: 'Google News Mexico City' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Mexico%20City?hl=es-419&gl=MX&ceid=MX:es-419', source: 'Google News CDMX Spanish' },
      { url: 'https://mexiconewsdaily.com/feed/', source: 'Mexico News Daily' },
    ],
  },
  'buenos-aires': {
    label: 'Buenos Aires', region: 'latam', country: 'AR',
    lang: 'es', lat: -34.6037, lng: -58.3816,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Buenos%20Aires?hl=en-US&gl=US&ceid=US:en', source: 'Google News Buenos Aires' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Buenos%20Aires?hl=es-419&gl=AR&ceid=AR:es-419', source: 'Google News BA Spanish' },
      { url: 'https://buenosairesherald.com/feed/', source: 'Buenos Aires Herald' },
    ],
  },
  bogota: {
    label: 'Bogotá', region: 'latam', country: 'CO',
    lang: 'es', lat: 4.711, lng: -74.0721,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Bogot%C3%A1?hl=en-US&gl=US&ceid=US:en', source: 'Google News Bogotá' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Bogot%C3%A1?hl=es-419&gl=CO&ceid=CO:es-419', source: 'Google News Bogotá Spanish' },
      { url: 'https://colombiareports.com/feed/', source: 'Colombia Reports' },
      { url: 'https://thecitypaperbogota.com/feed/', source: 'The City Paper Bogota' },
    ],
  },
  lima: {
    label: 'Lima', region: 'latam', country: 'PE',
    lang: 'es', lat: -12.0464, lng: -77.0428,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Lima?hl=en-US&gl=US&ceid=US:en', source: 'Google News Lima' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Lima?hl=es-419&gl=PE&ceid=PE:es-419', source: 'Google News Lima Spanish' },
      { url: 'https://perureports.com/feed/', source: 'Peru Reports' },
    ],
  },
  santiago: {
    label: 'Santiago', region: 'latam', country: 'CL',
    lang: 'es', lat: -33.4489, lng: -70.6693,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Santiago?hl=en-US&gl=US&ceid=US:en', source: 'Google News Santiago' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Santiago?hl=es-419&gl=CL&ceid=CL:es-419', source: 'Google News Santiago Spanish' },
      { url: 'https://santiagotimes.cl/feed/', source: 'Santiago Times' },
    ],
  },
  'rio-de-janeiro': {
    label: 'Rio de Janeiro', region: 'latam', country: 'BR',
    lang: 'pt', lat: -22.9068, lng: -43.1729,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Rio%20de%20Janeiro?hl=en-US&gl=US&ceid=US:en', source: 'Google News Rio' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Rio%20de%20Janeiro?hl=pt-BR&gl=BR&ceid=BR:pt-419', source: 'Google News Rio Portuguese' },
      { url: 'https://riotimesonline.com/feed/', source: 'Rio Times Online' },
    ],
  },
  medellin: {
    label: 'Medellín', region: 'latam', country: 'CO',
    lang: 'es', lat: 6.2442, lng: -75.5812,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Medell%C3%ADn?hl=en-US&gl=US&ceid=US:en', source: 'Google News Medellín' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Medell%C3%ADn?hl=es-419&gl=CO&ceid=CO:es-419', source: 'Google News Medellín Spanish' },
      { url: 'https://colombiareports.com/feed/', source: 'Colombia Reports' },
    ],
  },

  // =========================================================================
  // UNITED STATES (10 cities)
  // =========================================================================
  'new-york': {
    label: 'New York', region: 'us', country: 'US',
    lat: 40.7128, lng: -74.006,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/New%20York?hl=en-US&gl=US&ceid=US:en', source: 'Google News New York' },
      { url: 'https://www.thecity.nyc/feed/', source: 'The City NYC' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml', source: 'NY Times NY Region' },
    ],
  },
  'los-angeles': {
    label: 'Los Angeles', region: 'us', country: 'US',
    lat: 34.0522, lng: -118.2437,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Los%20Angeles?hl=en-US&gl=US&ceid=US:en', source: 'Google News LA' },
      { url: 'https://laist.com/index.atom', source: 'LAist' },
      { url: 'https://ktla.com/feed/', source: 'KTLA' },
    ],
  },
  chicago: {
    label: 'Chicago', region: 'us', country: 'US',
    lat: 41.8781, lng: -87.6298,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Chicago?hl=en-US&gl=US&ceid=US:en', source: 'Google News Chicago' },
      { url: 'https://blockclubchicago.org/feed/', source: 'Block Club Chicago' },
    ],
  },
  'san-francisco': {
    label: 'San Francisco', region: 'us', country: 'US',
    lat: 37.7749, lng: -122.4194,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/San%20Francisco?hl=en-US&gl=US&ceid=US:en', source: 'Google News SF' },
      { url: 'https://ww2.kqed.org/news/feed/', source: 'KQED' },
      { url: 'https://sfstandard.com/feed/', source: 'SF Standard' },
      { url: 'https://missionlocal.org/feed/', source: 'Mission Local' },
    ],
  },
  houston: {
    label: 'Houston', region: 'us', country: 'US',
    lat: 29.7604, lng: -95.3698,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Houston?hl=en-US&gl=US&ceid=US:en', source: 'Google News Houston' },
      { url: 'https://houstonlanding.org/feed/', source: 'Houston Landing' },
      { url: 'https://abc13.com/feed/', source: 'ABC13 Houston' },
    ],
  },
  miami: {
    label: 'Miami', region: 'us', country: 'US',
    lat: 25.7617, lng: -80.1918,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Miami?hl=en-US&gl=US&ceid=US:en', source: 'Google News Miami' },
      { url: 'https://www.nbcmiami.com/feed/', source: 'NBC Miami' },
    ],
  },
  washington: {
    label: 'Washington DC', region: 'us', country: 'US',
    lat: 38.9072, lng: -77.0369,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Washington%20DC?hl=en-US&gl=US&ceid=US:en', source: 'Google News DC' },
      { url: 'https://wtop.com/feed/', source: 'WTOP' },
    ],
  },
  seattle: {
    label: 'Seattle', region: 'us', country: 'US',
    lat: 47.6062, lng: -122.3321,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Seattle?hl=en-US&gl=US&ceid=US:en', source: 'Google News Seattle' },
      { url: 'https://crosscut.com/feed', source: 'Crosscut' },
      { url: 'https://publicola.com/feed/', source: 'PubliCola' },
    ],
  },
  boston: {
    label: 'Boston', region: 'us', country: 'US',
    lat: 42.3601, lng: -71.0589,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Boston?hl=en-US&gl=US&ceid=US:en', source: 'Google News Boston' },
      { url: 'https://www.wbur.org/feed', source: 'WBUR Boston' },
    ],
  },
  dallas: {
    label: 'Dallas', region: 'us', country: 'US',
    lat: 32.7767, lng: -96.797,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Dallas?hl=en-US&gl=US&ceid=US:en', source: 'Google News Dallas' },
      { url: 'https://www.wfaa.com/feeds/syndication/rss/news/local', source: 'WFAA Dallas' },
      { url: 'https://www.texastribune.org/feed/', source: 'Texas Tribune' },
    ],
  },

  // =========================================================================
  // UNITED KINGDOM (4 cities)
  // =========================================================================
  manchester: {
    label: 'Manchester', region: 'uk', country: 'GB',
    lat: 53.4808, lng: -2.2426,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Manchester?hl=en-GB&gl=GB&ceid=GB:en', source: 'Google News Manchester' },
      { url: 'https://www.manchestereveningnews.co.uk/?service=rss', source: 'Manchester Evening News' },
    ],
  },
  birmingham: {
    label: 'Birmingham', region: 'uk', country: 'GB',
    lat: 52.4862, lng: -1.8904,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Birmingham%20UK?hl=en-GB&gl=GB&ceid=GB:en', source: 'Google News Birmingham' },
      { url: 'https://www.birminghammail.co.uk/?service=rss', source: 'Birmingham Mail' },
    ],
  },
  edinburgh: {
    label: 'Edinburgh', region: 'uk', country: 'GB',
    lat: 55.9533, lng: -3.1883,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Edinburgh?hl=en-GB&gl=GB&ceid=GB:en', source: 'Google News Edinburgh' },
      { url: 'https://www.edinburghlive.co.uk/?service=rss', source: 'Edinburgh Live' },
      { url: 'https://www.scotsman.com/rss', source: 'The Scotsman' },
    ],
  },
  glasgow: {
    label: 'Glasgow', region: 'uk', country: 'GB',
    lat: 55.8642, lng: -4.2518,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Glasgow?hl=en-GB&gl=GB&ceid=GB:en', source: 'Google News Glasgow' },
      { url: 'https://www.glasgowtimes.co.uk/news/rss/', source: 'Glasgow Times' },
    ],
  },

  // =========================================================================
  // AUSTRALIA (3 cities)
  // =========================================================================
  sydney: {
    label: 'Sydney', region: 'australia', country: 'AU',
    lat: -33.8688, lng: 151.2093,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Sydney?hl=en-AU&gl=AU&ceid=AU:en', source: 'Google News Sydney' },
      { url: 'https://www.smh.com.au/rss/feed.xml', source: 'Sydney Morning Herald' },
    ],
  },
  melbourne: {
    label: 'Melbourne', region: 'australia', country: 'AU',
    lat: -37.8136, lng: 144.9631,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Melbourne?hl=en-AU&gl=AU&ceid=AU:en', source: 'Google News Melbourne' },
      { url: 'https://www.theage.com.au/rss/feed.xml', source: 'The Age' },
    ],
  },
  auckland: {
    label: 'Auckland', region: 'australia', country: 'NZ',
    lat: -36.8485, lng: 174.7633,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Auckland?hl=en-NZ&gl=NZ&ceid=NZ:en', source: 'Google News Auckland' },
    ],
  },

  // =========================================================================
  // MORE EUROPE (8 cities)
  // =========================================================================
  vienna: {
    label: 'Vienna', region: 'europe', country: 'AT',
    lang: 'de', lat: 48.2082, lng: 16.3738,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Vienna?hl=en-US&gl=US&ceid=US:en', source: 'Google News Vienna' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Wien?hl=de-AT&gl=AT&ceid=AT:de', source: 'Google News Wien' },
      { url: 'https://feeds.thelocal.com/rss/at', source: 'The Local Austria' },
    ],
  },
  warsaw: {
    label: 'Warsaw', region: 'europe', country: 'PL',
    lang: 'pl', lat: 52.2297, lng: 21.0122,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Warsaw?hl=en-US&gl=US&ceid=US:en', source: 'Google News Warsaw' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Warszawa?hl=pl-PL&gl=PL&ceid=PL:pl', source: 'Google News Warsaw Polish' },
      { url: 'https://notesfrompoland.com/feed/', source: 'Notes from Poland' },
    ],
  },
  lisbon: {
    label: 'Lisbon', region: 'europe', country: 'PT',
    lang: 'pt', lat: 38.7223, lng: -9.1393,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Lisbon?hl=en-US&gl=US&ceid=US:en', source: 'Google News Lisbon' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Lisboa?hl=pt-PT&gl=PT&ceid=PT:pt-150', source: 'Google News Lisboa' },
      { url: 'https://www.theportugalnews.com/rss', source: 'The Portugal News' },
    ],
  },
  athens: {
    label: 'Athens', region: 'europe', country: 'GR',
    lat: 37.9838, lng: 23.7275,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Athens?hl=en-US&gl=US&ceid=US:en', source: 'Google News Athens' },
      { url: 'https://greekreporter.com/feed/', source: 'Greek Reporter' },
    ],
  },
  zurich: {
    label: 'Zurich', region: 'europe', country: 'CH',
    lang: 'de', lat: 47.3769, lng: 8.5417,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Zurich?hl=en-US&gl=US&ceid=US:en', source: 'Google News Zurich' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Z%C3%BCrich?hl=de-CH&gl=CH&ceid=CH:de', source: 'Google News Zürich' },
    ],
  },
  dublin: {
    label: 'Dublin', region: 'europe', country: 'IE',
    lat: 53.3498, lng: -6.2603,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Dublin?hl=en-IE&gl=IE&ceid=IE:en', source: 'Google News Dublin' },
      { url: 'https://www.rte.ie/rss/news.xml', source: 'RTÉ' },
      { url: 'https://www.thejournal.ie/feed/', source: 'The Journal.ie' },
      { url: 'https://www.irishtimes.com/cmlink/news-1.1319192', source: 'Irish Times' },
    ],
  },
  prague: {
    label: 'Prague', region: 'europe', country: 'CZ',
    lat: 50.0755, lng: 14.4378,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Prague?hl=en-US&gl=US&ceid=US:en', source: 'Google News Prague' },
      { url: 'https://praguemonitor.com/feed/', source: 'Prague Monitor' },
    ],
  },
  copenhagen: {
    label: 'Copenhagen', region: 'europe', country: 'DK',
    lat: 55.6761, lng: 12.5683,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Copenhagen?hl=en-US&gl=US&ceid=US:en', source: 'Google News Copenhagen' },
      { url: 'https://cphpost.dk/feed/', source: 'Copenhagen Post' },
    ],
  },

  // =========================================================================
  // MORE ASIA (6 cities)
  // =========================================================================
  manila: {
    label: 'Manila', region: 'asia', country: 'PH',
    lang: 'fil', lat: 14.5995, lng: 120.9842,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Manila?hl=en-US&gl=US&ceid=US:en', source: 'Google News Manila' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Manila?hl=tl-PH&gl=PH&ceid=PH:tl', source: 'Google News Manila Filipino' },
      { url: 'https://www.rappler.com/feed/', source: 'Rappler' },
      { url: 'https://www.inquirer.net/fullfeed', source: 'Philippine Inquirer' },
    ],
  },
  'kuala-lumpur': {
    label: 'Kuala Lumpur', region: 'asia', country: 'MY',
    lang: 'ms', lat: 3.139, lng: 101.6869,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Kuala%20Lumpur?hl=en-MY&gl=MY&ceid=MY:en', source: 'Google News KL' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Kuala%20Lumpur?hl=ms-MY&gl=MY&ceid=MY:ms', source: 'Google News KL Malay' },
      { url: 'https://www.malaymail.com/feed/rss/malaysia', source: 'Malay Mail' },
      { url: 'https://www.thestar.com.my/RSS/News', source: 'The Star Malaysia' },
    ],
  },
  hanoi: {
    label: 'Hanoi', region: 'asia', country: 'VN',
    lang: 'vi', lat: 21.0285, lng: 105.8542,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Hanoi?hl=en-US&gl=US&ceid=US:en', source: 'Google News Hanoi' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Hanoi?hl=vi-VN&gl=VN&ceid=VN:vi', source: 'Google News Hanoi Vietnamese' },
      { url: 'https://e.vnexpress.net/rss/news.rss', source: 'VnExpress English' },
    ],
  },
  'ho-chi-minh': {
    label: 'Ho Chi Minh City', region: 'asia', country: 'VN',
    lang: 'vi', lat: 10.8231, lng: 106.6297,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Ho%20Chi%20Minh%20City?hl=en-US&gl=US&ceid=US:en', source: 'Google News HCMC' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Ho%20Chi%20Minh%20City?hl=vi-VN&gl=VN&ceid=VN:vi', source: 'Google News HCMC Vietnamese' },
    ],
  },
  taipei: {
    label: 'Taipei', region: 'asia', country: 'TW',
    lang: 'zh', lat: 25.033, lng: 121.5654,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Taipei?hl=en-US&gl=US&ceid=US:en', source: 'Google News Taipei' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Taipei?hl=zh-TW&gl=TW&ceid=TW:zh-Hant', source: 'Google News Taipei Chinese' },
      { url: 'https://www.taipeitimes.com/xml/index.rss', source: 'Taipei Times' },
    ],
  },
  osaka: {
    label: 'Osaka', region: 'asia', country: 'JP',
    lang: 'ja', lat: 34.6937, lng: 135.5023,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Osaka?hl=en-US&gl=US&ceid=US:en', source: 'Google News Osaka' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Osaka?hl=ja-JP&gl=JP&ceid=JP:ja', source: 'Google News Osaka Japanese' },
    ],
  },

  // =========================================================================
  // MORE AFRICA (4 cities)
  // =========================================================================
  accra: {
    label: 'Accra', region: 'africa', country: 'GH',
    lat: 5.6037, lng: -0.187,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Accra?hl=en-GH&gl=GH&ceid=GH:en', source: 'Google News Accra' },
      { url: 'https://allafrica.com/tools/headlines/rdf/ghana/headlines.rdf', source: 'AllAfrica Ghana' },
      { url: 'https://adomonline.com/feed/', source: 'Adom Online' },
    ],
  },
  'dar-es-salaam': {
    label: 'Dar es Salaam', region: 'africa', country: 'TZ',
    lang: 'sw', lat: -6.7924, lng: 39.2083,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Dar%20es%20Salaam?hl=en-US&gl=US&ceid=US:en', source: 'Google News Dar es Salaam' },
      { url: 'https://allafrica.com/tools/headlines/rdf/tanzania/headlines.rdf', source: 'AllAfrica Tanzania' },
      { url: 'https://dailynews.co.tz/feed/', source: 'Daily News Tanzania' },
    ],
  },
  'addis-ababa': {
    label: 'Addis Ababa', region: 'africa', country: 'ET',
    lat: 9.0222, lng: 38.7468,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Addis%20Ababa?hl=en-US&gl=US&ceid=US:en', source: 'Google News Addis Ababa' },
      { url: 'https://allafrica.com/tools/headlines/rdf/ethiopia/headlines.rdf', source: 'AllAfrica Ethiopia' },
      { url: 'https://addisfortune.news/feed/', source: 'Addis Fortune' },
      { url: 'https://ethiopianmonitor.com/feed/', source: 'Ethiopian Monitor' },
    ],
  },
  abuja: {
    label: 'Abuja', region: 'africa', country: 'NG',
    lat: 9.0579, lng: 7.4951,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Abuja?hl=en-NG&gl=NG&ceid=NG:en', source: 'Google News Abuja' },
      { url: 'https://www.premiumtimesng.com/feed', source: 'Premium Times' },
      { url: 'https://www.premiumtimesng.com/category/news/feed', source: 'Premium Times' },
    ],
  },

  // =========================================================================
  // MORE MIDDLE EAST (3 cities)
  // =========================================================================
  'abu-dhabi': {
    label: 'Abu Dhabi', region: 'middle-east', country: 'AE',
    lang: 'ar', lat: 24.4539, lng: 54.3773,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Abu%20Dhabi?hl=en-US&gl=US&ceid=US:en', source: 'Google News Abu Dhabi' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Abu%20Dhabi?hl=ar-AE&gl=AE&ceid=AE:ar', source: 'Google News Abu Dhabi Arabic' },
    ],
  },
  tehran: {
    label: 'Tehran', region: 'middle-east', country: 'IR',
    lang: 'fa', lat: 35.6892, lng: 51.389,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Tehran?hl=en-US&gl=US&ceid=US:en', source: 'Google News Tehran' },
    ],
  },
  'tel-aviv': {
    label: 'Tel Aviv', region: 'middle-east', country: 'IL',
    lang: 'he', lat: 32.0853, lng: 34.7818,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Tel%20Aviv?hl=en-US&gl=US&ceid=US:en', source: 'Google News Tel Aviv' },
      { url: 'https://www.timesofisrael.com/feed/', source: 'Times of Israel' },
    ],
  },

  // =========================================================================
  // MORE INDIA (5 cities)
  // =========================================================================
  guwahati: {
    label: 'Guwahati', region: 'india', country: 'IN',
    lang: 'as', lat: 26.1445, lng: 91.7362,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Guwahati?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Guwahati' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Guwahati?hl=as-IN&gl=IN&ceid=IN:as', source: 'Google News Guwahati Assamese' },
    ],
  },
  nagpur: {
    label: 'Nagpur', region: 'india', country: 'IN',
    lang: 'mr', lat: 21.1458, lng: 79.0882,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Nagpur?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Nagpur' },
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/3012535.cms', source: 'TOI Nagpur' },
    ],
  },
  coimbatore: {
    label: 'Coimbatore', region: 'india', country: 'IN',
    lang: 'ta', lat: 11.0168, lng: 76.9558,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Coimbatore?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Coimbatore' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Coimbatore?hl=ta-IN&gl=IN&ceid=IN:ta', source: 'Google News Coimbatore Tamil' },
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
  indore: {
    label: 'Indore', region: 'india', country: 'IN',
    lang: 'hi', lat: 22.7196, lng: 75.8577,
    feeds: [
      { url: 'https://news.google.com/rss/headlines/section/geo/Indore?hl=en-IN&gl=IN&ceid=IN:en', source: 'Google News Indore' },
      { url: 'https://news.google.com/rss/headlines/section/geo/Indore?hl=hi-IN&gl=IN&ceid=IN:hi', source: 'Google News Indore Hindi' },
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
