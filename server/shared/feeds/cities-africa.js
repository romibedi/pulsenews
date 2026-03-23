// ---------------------------------------------------------------------------
// City feeds — Africa
// ---------------------------------------------------------------------------

export const CITY_FEEDS_AFRICA = {
  nairobi: {
    label: 'Nairobi', region: 'africa', country: 'KE',
    lang: 'sw', lat: -1.2921, lng: 36.8219,
    feeds: [
      { url: 'https://www.standardmedia.co.ke/rssfeeds', source: 'Standard Media Kenya' },
      { url: 'https://feeds.bbci.co.uk/swahili/rss.xml', source: 'BBC Swahili' },
      { url: 'https://nation.africa/kenya/rss.xml', source: 'Nation Africa Kenya' },
      { url: 'https://nairobileo.co.ke/feed/', source: 'Nairobi Leo' },
    ],
  },
  lagos: {
    label: 'Lagos', region: 'africa', country: 'NG',
    lat: 6.5244, lng: 3.3792,
    feeds: [
      { url: 'https://punchng.com/feed/', source: 'Punch Nigeria' },
      { url: 'https://www.vanguardngr.com/feed/', source: 'Vanguard Nigeria' },
      { url: 'https://businessday.ng/feed/', source: 'BusinessDay Nigeria' },
    ],
  },
  johannesburg: {
    label: 'Johannesburg', region: 'africa', country: 'ZA',
    lat: -26.2041, lng: 28.0473,
    feeds: [
      { url: 'https://feeds.news24.com/articles/news24/TopStories/rss', source: 'News24' },
      { url: 'https://www.dailymaverick.co.za/dmrss/', source: 'Daily Maverick' },
    ],
  },
  'cape-town': {
    label: 'Cape Town', region: 'africa', country: 'ZA',
    lat: -33.9249, lng: 18.4241,
    feeds: [
      { url: 'https://www.dailymaverick.co.za/dmrss/', source: 'Daily Maverick' },
      { url: 'https://www.capetownetc.com/feed/', source: 'CapeTownEtc' },
    ],
  },
  // "MORE AFRICA" section
  accra: {
    label: 'Accra', region: 'africa', country: 'GH',
    lat: 5.6037, lng: -0.187,
    feeds: [
      { url: 'https://www.myjoyonline.com/feed/', source: 'MyJoyOnline' },
      { url: 'https://allafrica.com/tools/headlines/rdf/ghana/headlines.rdf', source: 'AllAfrica Ghana' },
      { url: 'https://adomonline.com/feed/', source: 'Adom Online' },
    ],
  },
  'dar-es-salaam': {
    label: 'Dar es Salaam', region: 'africa', country: 'TZ',
    lang: 'sw', lat: -6.7924, lng: 39.2083,
    feeds: [
      { url: 'https://allafrica.com/tools/headlines/rdf/tanzania/headlines.rdf', source: 'AllAfrica Tanzania' },
      { url: 'https://dailynews.co.tz/feed/', source: 'Daily News Tanzania' },
    ],
  },
  'addis-ababa': {
    label: 'Addis Ababa', region: 'africa', country: 'ET',
    lat: 9.0222, lng: 38.7468,
    feeds: [
      { url: 'https://allafrica.com/tools/headlines/rdf/ethiopia/headlines.rdf', source: 'AllAfrica Ethiopia' },
      { url: 'https://addisfortune.news/feed/', source: 'Addis Fortune' },
      { url: 'https://ethiopianmonitor.com/feed/', source: 'Ethiopian Monitor' },
    ],
  },
  abuja: {
    label: 'Abuja', region: 'africa', country: 'NG',
    lat: 9.0579, lng: 7.4951,
    feeds: [
      { url: 'https://punchng.com/feed/', source: 'Punch Nigeria' },
      { url: 'https://www.premiumtimesng.com/feed', source: 'Premium Times' },
      { url: 'https://www.premiumtimesng.com/category/news/feed', source: 'Premium Times' },
    ],
  },
  // Cities without explicit region in original (African)
  kampala: {
    label: 'Kampala',
    coords: [0.3476, 32.5825],
    feeds: [
      { url: 'https://www.monitor.co.ug/feed', source: 'Daily Monitor Uganda' },
      { url: 'https://allafrica.com/tools/headlines/rdf/uganda/headlines.rdf', source: 'AllAfrica Uganda' },
    ],
  },
  kinshasa: {
    label: 'Kinshasa',
    lang: 'fr',
    coords: [-4.4419, 15.2663],
    feeds: [
      { url: 'https://allafrica.com/tools/headlines/rdf/congo-kinshasa/headlines.rdf', source: 'AllAfrica DRC' },
    ],
  },
  casablanca: {
    label: 'Casablanca',
    lang: 'ar',
    coords: [33.5731, -7.5898],
    feeds: [
      { url: 'https://allafrica.com/tools/headlines/rdf/morocco/headlines.rdf', source: 'AllAfrica Morocco' },
      { url: 'https://www.france24.com/fr/afrique/rss', source: 'France 24 Afrique' },
    ],
  },
  dakar: {
    label: 'Dakar',
    lang: 'fr',
    coords: [14.7167, -17.4677],
    feeds: [
      { url: 'https://allafrica.com/tools/headlines/rdf/senegal/headlines.rdf', source: 'AllAfrica Senegal' },
    ],
  },
  lusaka: {
    label: 'Lusaka',
    coords: [-15.3875, 28.3228],
    feeds: [
      { url: 'https://www.lusakatimes.com/feed/', source: 'Lusaka Times' },
      { url: 'https://allafrica.com/tools/headlines/rdf/zambia/headlines.rdf', source: 'AllAfrica Zambia' },
    ],
  },
  harare: {
    label: 'Harare',
    coords: [-17.8252, 31.0335],
    feeds: [
      { url: 'https://www.newsday.co.zw/feed/', source: 'NewsDay Zimbabwe' },
      { url: 'https://allafrica.com/tools/headlines/rdf/zimbabwe/headlines.rdf', source: 'AllAfrica Zimbabwe' },
    ],
  },
};
