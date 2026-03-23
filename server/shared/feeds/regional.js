// ---------------------------------------------------------------------------
// Regional general feeds (9 regions) + Region x Category feeds
// ---------------------------------------------------------------------------

export const REGIONAL_FEEDS = {
  india: [
    { url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', source: 'Times of India' },
    { url: 'https://www.thehindu.com/news/national/feeder/default.rss', source: 'The Hindu' },
    { url: 'https://indianexpress.com/feed/', source: 'Indian Express' },
    { url: 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml', source: 'BBC India' },
    { url: 'https://feeds.feedburner.com/ndtvnews-top-stories', source: 'NDTV' },
    { url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml', source: 'Hindustan Times' },
    { url: 'https://www.firstpost.com/rss/india.xml', source: 'Firstpost India' },
    { url: 'https://www.livemint.com/rss/news', source: 'Mint' },
    { url: 'https://www.deccanherald.com/rss/news.rss', source: 'Deccan Herald' },
    { url: 'https://www.news18.com/commonfeeds/v1/eng/rss/india.xml', source: 'News18' },
  ],
  uk: [
    { url: 'https://feeds.bbci.co.uk/news/uk/rss.xml', source: 'BBC UK' },
    { url: 'https://feeds.bbci.co.uk/news/england/rss.xml', source: 'BBC England' },
    { url: 'https://feeds.skynews.com/feeds/rss/uk.xml', source: 'Sky News UK' },
    { url: 'https://www.mirror.co.uk/news/uk-news/?service=rss', source: 'Mirror UK' },
    { url: 'https://metro.co.uk/news/uk/feed/', source: 'Metro UK' },
    { url: 'https://www.independent.co.uk/news/uk/rss', source: 'The Independent UK' },
    { url: 'https://www.theguardian.com/uk-news/rss', source: 'The Guardian UK' },
    { url: 'https://www.rte.ie/rss/news.xml', source: 'RTÉ News' },
    { url: 'https://www.thejournal.ie/feed/', source: 'The Journal.ie' },
    { url: 'https://www.telegraph.co.uk/rss.xml', source: 'The Telegraph' },
    { url: 'https://www.dailymail.co.uk/articles.rss', source: 'Daily Mail' },
  ],
  us: [
    { url: 'https://feeds.npr.org/1003/rss.xml', source: 'NPR US' },
    { url: 'https://abcnews.go.com/abcnews/usheadlines', source: 'ABC US' },
    { url: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml', source: 'BBC US' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/US.xml', source: 'NY Times US' },
    { url: 'http://rss.cnn.com/rss/cnn_topstories.rss', source: 'CNN' },
    { url: 'https://moxie.foxnews.com/google-publisher/us.xml', source: 'Fox News US' },
    { url: 'https://www.cbsnews.com/latest/rss/main', source: 'CBS News' },
    { url: 'http://rssfeeds.usatoday.com/usatoday-NewsTopStories', source: 'USA Today' },
    { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', source: 'CNBC' },
    { url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', source: 'NY Times' },
    { url: 'https://feeds.washingtonpost.com/rss/national', source: 'Washington Post' },
    { url: 'https://www.latimes.com/world-nation/rss2.0.xml', source: 'LA Times' },
  ],
  australia: [
    { url: 'https://www.abc.net.au/news/feed/2942460/rss.xml', source: 'ABC Australia' },
    { url: 'https://feeds.bbci.co.uk/news/world/australia/rss.xml', source: 'BBC Australia' },
    { url: 'https://www.theguardian.com/australia-news/rss', source: 'Guardian Australia' },
    { url: 'https://www.stuff.co.nz/rss', source: 'Stuff NZ' },
    { url: 'https://www.canberratimes.com.au/rss/feed.xml', source: 'Canberra Times' },
  ],
  'middle-east': [
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
    { url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', source: 'BBC Middle East' },
    { url: 'https://www.dailysabah.com/rss/home-page', source: 'Daily Sabah' },
    { url: 'https://www.timesofisrael.com/feed/', source: 'Times of Israel' },
    { url: 'https://www.arabnews.com/rss.xml', source: 'Arab News' },
    { url: 'https://gulfnews.com/rss', source: 'Gulf News' },
    { url: 'https://www.khaleejtimes.com/rss', source: 'Khaleej Times' },
    { url: 'https://www.thenationalnews.com/rss', source: 'The National UAE' },
    { url: 'https://www.hurriyetdailynews.com/rss', source: 'Hurriyet Daily News' },
    { url: 'https://www.jpost.com/rss/rssfeedsfrontpage.aspx', source: 'Jerusalem Post' },
    { url: 'https://english.khabaronline.ir/rss/', source: 'Khabar Online English' },
    { url: 'https://www.tehrantimes.com/rss', source: 'Tehran Times' },
  ],
  europe: [
    { url: 'https://feeds.bbci.co.uk/news/world/europe/rss.xml', source: 'BBC Europe' },
    { url: 'https://www.rfi.fr/en/rss', source: 'RFI' },
    { url: 'https://rss.dw.com/xml/rss-en-world', source: 'DW News' },
    { url: 'http://feeds.feedburner.com/euronews/en/home/', source: 'EuroNews' },
    { url: 'https://www.rte.ie/rss/news.xml', source: 'RTÉ' },
    { url: 'https://www.thejournal.ie/feed/', source: 'The Journal.ie' },
    { url: 'https://www.thelocal.com/feeds/rss.php', source: 'The Local' },
    { url: 'https://balkaninsight.com/feed/', source: 'Balkan Insight' },
  ],
  africa: [
    { url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml', source: 'BBC Africa' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
    { url: 'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf', source: 'AllAfrica' },
    { url: 'https://www.premiumtimesng.com/feed', source: 'Premium Times Nigeria' },
    { url: 'https://www.vanguardngr.com/feed/', source: 'Vanguard Nigeria' },
    { url: 'https://feeds.news24.com/articles/news24/TopStories/rss', source: 'News24 SA' },
    { url: 'https://punchng.com/feed/', source: 'Punch Nigeria' },
    { url: 'https://guardian.ng/feed/', source: 'Guardian Nigeria' },
    { url: 'https://dailypost.ng/feed', source: 'Daily Post Nigeria' },
    { url: 'https://www.thecitizen.co.tz/feed', source: 'The Citizen Tanzania' },
    { url: 'https://www.standardmedia.co.ke/rss/headlines.php', source: 'Standard Kenya' },
    { url: 'https://ewn.co.za/RSS%20Feeds/Latest%20News', source: 'Eyewitness News SA' },
    { url: 'https://www.myjoyonline.com/feed/', source: 'MyJoyOnline Ghana' },
    { url: 'https://citinewsroom.com/feed/', source: 'Citi Newsroom Ghana' },
    { url: 'https://www.monitor.co.ug/feed', source: 'Daily Monitor Uganda' },
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
    { url: 'https://japantoday.com/feed', source: 'Japan Today' },
    { url: 'https://english.kyodonews.net/rss/all.xml', source: 'Kyodo News' },
    { url: 'https://hongkongfp.com/feed/', source: 'Hong Kong Free Press' },
    { url: 'https://www.philstar.com/rss/headlines', source: 'PhilStar' },
    { url: 'https://www.dawn.com/feed', source: 'Dawn Pakistan' },
    { url: 'https://tribune.com.pk/feed', source: 'Express Tribune Pakistan' },
    { url: 'https://www.thedailystar.net/frontpage/rss.xml', source: 'Daily Star Bangladesh' },
  ],
  latam: [
    { url: 'https://feeds.bbci.co.uk/news/world/latin_america/rss.xml', source: 'BBC Latin America' },
    { url: 'https://en.mercopress.com/rss', source: 'MercoPress' },
    { url: 'https://www.batimes.com.ar/feed', source: 'Buenos Aires Times' },
    { url: 'https://www.infobae.com/arc/outboundfeeds/rss/', source: 'Infobae' },
    { url: 'https://noticias.r7.com/feed.xml', source: 'R7 Noticias' },
  ],
};

// --- Region + category specific feeds (9 regions x categories each) ---
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
    { url: 'https://gulfnews.com/technology/rss', source: 'Gulf News Tech' },
    ],
    business: [
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/1898055.cms', source: 'Times of India Business' },
      { url: 'https://www.thehindu.com/business/feeder/default.rss', source: 'The Hindu Business' },
      { url: 'https://indianexpress.com/section/business/feed/', source: 'Indian Express Business' },
    { url: 'https://gulfnews.com/business/rss', source: 'Gulf News Business' },
    { url: 'https://nation.africa/kenya/business/rss.xml', source: 'Nation Africa Business' },
    { url: 'https://www.bangkokpost.com/rss/data/bus.xml', source: 'Bangkok Post Business' },
    { url: 'https://www.elfinanciero.com.mx/arc/outboundfeeds/rss/?outputType=xml', source: 'El Financiero Mexico' },
    ],
    sport: [
      { url: 'https://timesofindia.indiatimes.com/rssfeeds/4719161.cms', source: 'Times of India Sports' },
      { url: 'https://www.thehindu.com/sport/feeder/default.rss', source: 'The Hindu Sport' },
      { url: 'https://indianexpress.com/section/sports/feed/', source: 'Indian Express Sports' },
    { url: 'https://gulfnews.com/sport/rss', source: 'Gulf News Sport' },
    { url: 'https://www.supersport.com/rss', source: 'SuperSport' },
    { url: 'https://www.scmp.com/rss/95/feed', source: 'SCMP Sport' },
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
    { url: 'https://gulfnews.com/entertainment/rss', source: 'Gulf News Entertainment' },
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
