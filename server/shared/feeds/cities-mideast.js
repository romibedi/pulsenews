// ---------------------------------------------------------------------------
// City feeds — Middle East
// ---------------------------------------------------------------------------

export const CITY_FEEDS_MIDEAST = {
  dubai: {
    label: 'Dubai', region: 'middle-east', country: 'AE',
    lang: 'ar', lat: 25.2048, lng: 55.2708,
    feeds: [
      { url: 'https://www.alarabiya.net/tools/mrss', source: 'Al Arabiya' },
      { url: 'https://www.dubaichronicle.com/feed/', source: 'Dubai Chronicle' },
      { url: 'https://gulfnews.com/rss', source: 'Gulf News' },
      { url: 'https://www.khaleejtimes.com/rss', source: 'Khaleej Times' },
      { url: 'https://www.thenationalnews.com/rss', source: 'The National UAE' },
    ],
  },
  riyadh: {
    label: 'Riyadh', region: 'middle-east', country: 'SA',
    lang: 'ar', lat: 24.7136, lng: 46.6753,
    feeds: [
      { url: 'https://aawsat.com/feed', source: 'Asharq Al-Awsat' },
      { url: 'https://www.arabnews.com/cat/8/rss.xml', source: 'Arab News' },
      { url: 'https://saudigazette.com.sa/rss', source: 'Saudi Gazette' },
    ],
  },
  istanbul: {
    label: 'Istanbul', region: 'middle-east', country: 'TR',
    lang: 'tr', lat: 41.0082, lng: 28.9784,
    feeds: [
      { url: 'https://www.sabah.com.tr/rss/anasayfa.xml', source: 'Sabah' },
      { url: 'https://www.dailysabah.com/rssFeed/turkey', source: 'Daily Sabah' },
      { url: 'https://www.hurriyetdailynews.com/rss', source: 'Hurriyet Daily News' },
    ],
  },
  cairo: {
    label: 'Cairo', region: 'middle-east', country: 'EG',
    lang: 'ar', lat: 30.0444, lng: 31.2357,
    feeds: [
      { url: 'https://www.youm7.com/rss/SectionRss', source: 'Youm7' },
      { url: 'https://www.dailynewsegypt.com/feed/', source: 'Daily News Egypt' },
      { url: 'https://english.ahram.org.eg/UI/Front/RSS.aspx', source: 'Ahram Online' },
    ],
  },
  doha: {
    label: 'Doha', region: 'middle-east', country: 'QA',
    lang: 'ar', lat: 25.2854, lng: 51.531,
    feeds: [
      { url: 'https://www.thepeninsulaqatar.com/feed', source: 'The Peninsula Qatar' },
      { url: 'https://www.aljazeera.net/feed', source: 'Al Jazeera Arabic' },
    ],
  },
  // "MORE MIDDLE EAST" section
  'abu-dhabi': {
    label: 'Abu Dhabi', region: 'middle-east', country: 'AE',
    lang: 'ar', lat: 24.4539, lng: 54.3773,
    feeds: [
      { url: 'https://www.alarabiya.net/tools/mrss', source: 'Al Arabiya' },
      { url: 'https://www.thenationalnews.com/rss', source: 'The National UAE' },
      { url: 'https://gulfnews.com/rss', source: 'Gulf News' },
    ],
  },
  tehran: {
    label: 'Tehran', region: 'middle-east', country: 'IR',
    lang: 'fa', lat: 35.6892, lng: 51.389,
    feeds: [
      { url: 'https://www.tehrantimes.com/rss', source: 'Tehran Times' },
      { url: 'https://www.presstv.ir/RSS', source: 'Press TV' },
    ],
  },
  'tel-aviv': {
    label: 'Tel Aviv', region: 'middle-east', country: 'IL',
    lang: 'he', lat: 32.0853, lng: 34.7818,
    feeds: [
      { url: 'https://www.timesofisrael.com/feed/', source: 'Times of Israel' },
      { url: 'https://www.jpost.com/rss/rssfeedsfrontpage.aspx', source: 'Jerusalem Post' },
    ],
  },
  // Cities without explicit region in original (Middle Eastern)
  beirut: {
    label: 'Beirut',
    lang: 'ar',
    coords: [33.8938, 35.5018],
    feeds: [
      { url: 'https://today.lorientlejour.com/feed', source: "L'Orient Today" },
      { url: 'https://www.naharnet.com/rss.php', source: 'Naharnet' },
      { url: 'https://www.aljazeera.net/feed', source: 'Al Jazeera Arabic' },
    ],
  },
  amman: {
    label: 'Amman',
    lang: 'ar',
    coords: [31.9454, 35.9284],
    feeds: [
      { url: 'https://en.ammonnews.net/rss.php', source: 'Ammon News' },
      { url: 'https://www.jordantimes.com/feed', source: 'Jordan Times' },
      { url: 'https://www.aljazeera.net/feed', source: 'Al Jazeera Arabic' },
    ],
  },
  jeddah: {
    label: 'Jeddah',
    lang: 'ar',
    coords: [21.4858, 39.1925],
    feeds: [
      { url: 'https://saudigazette.com.sa/rss', source: 'Saudi Gazette' },
      { url: 'https://www.arabnews.com/cat/8/rss.xml', source: 'Arab News' },
    ],
  },
  ankara: {
    label: 'Ankara',
    lang: 'tr',
    coords: [39.9334, 32.8597],
    feeds: [
      { url: 'https://www.sabah.com.tr/rss/anasayfa.xml', source: 'Sabah' },
      { url: 'https://www.dailysabah.com/rssFeed/turkey', source: 'Daily Sabah' },
      { url: 'https://www.hurriyetdailynews.com/rss', source: 'Hurriyet Daily News' },
    ],
  },
};
