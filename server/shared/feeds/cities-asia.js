// ---------------------------------------------------------------------------
// City feeds — Asia (includes South Asia, East Asia, Southeast Asia)
// ---------------------------------------------------------------------------

export const CITY_FEEDS_ASIA = {
  tokyo: {
    label: 'Tokyo', region: 'asia', country: 'JP',
    lang: 'ja', lat: 35.6762, lng: 139.6503,
    feeds: [
      { url: 'https://www3.nhk.or.jp/rss/news/cat0.xml', source: 'NHK' },
      { url: 'https://www.japantimes.co.jp/feed/', source: 'Japan Times' },
      { url: 'https://www3.nhk.or.jp/nhkworld/en/news/feeds/', source: 'NHK World' },
      { url: 'https://mainichi.jp/english/rss/etc/RSS.xml', source: 'Mainichi' },
    ],
  },
  singapore: {
    label: 'Singapore', region: 'asia', country: 'SG',
    lat: 1.3521, lng: 103.8198,
    feeds: [
      { url: 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml', source: 'CNA Singapore' },
      { url: 'https://www.straitstimes.com/news/singapore/rss.xml', source: 'Straits Times Singapore' },
    ],
  },
  'hong-kong': {
    label: 'Hong Kong', region: 'asia', country: 'HK',
    lang: 'zh', lat: 22.3193, lng: 114.1694,
    feeds: [
      { url: 'https://www.scmp.com/rss/2/feed', source: 'SCMP' },
      { url: 'https://www.rfa.org/cantonese/RSS', source: 'RFA Cantonese' },
      { url: 'https://www.scmp.com/rss/91/feed', source: 'South China Morning Post' },
      { url: 'https://hongkongfp.com/feed/', source: 'Hong Kong Free Press' },
    ],
  },
  seoul: {
    label: 'Seoul', region: 'asia', country: 'KR',
    lang: 'ko', lat: 37.5665, lng: 126.978,
    feeds: [
      { url: 'https://www.koreaherald.com/rss/newsAll', source: 'Korea Herald' },
      { url: 'https://www.koreatimes.co.kr/www2/common/rss.asp', source: 'Korea Times' },
      { url: 'https://koreajoongangdaily.joins.com/xmlFile/rss.xml', source: 'Korea JoongAng Daily' },
      { url: 'http://www.koreaherald.com/common/rss_xml.php', source: 'Korea Herald' },
      { url: 'https://www.koreaherald.com/rss/020100000000.xml', source: 'Korea Herald' },
      { url: 'https://www.koreatimes.co.kr/www/rss/rss.xml', source: 'Korea Times' },
    ],
  },
  bangkok: {
    label: 'Bangkok', region: 'asia', country: 'TH',
    lang: 'th', lat: 13.7563, lng: 100.5018,
    feeds: [
      { url: 'https://www.bangkokpost.com/rss/data/most-recent.xml', source: 'Bangkok Post' },
      { url: 'https://www.nationthailand.com/rss/feed.xml', source: 'The Nation Thailand' },
    ],
  },
  jakarta: {
    label: 'Jakarta', region: 'asia', country: 'ID',
    lang: 'id', lat: -6.2088, lng: 106.8456,
    feeds: [
      { url: 'https://www.antaranews.com/rss/terkini', source: 'Antara News' },
      { url: 'https://rss.thejakartapost.com/home', source: 'Jakarta Post' },
      { url: 'https://en.tempo.co/rss/teco', source: 'Tempo English' },
    ],
  },
  manila: {
    label: 'Manila', region: 'asia', country: 'PH',
    lang: 'fil', lat: 14.5995, lng: 120.9842,
    feeds: [
      { url: 'https://data.gmanews.tv/gno/rss/news/feed.xml', source: 'GMA News' },
      { url: 'https://www.rappler.com/feed/', source: 'Rappler' },
      { url: 'https://www.inquirer.net/fullfeed', source: 'Philippine Inquirer' },
    ],
  },
  'kuala-lumpur': {
    label: 'Kuala Lumpur', region: 'asia', country: 'MY',
    lang: 'ms', lat: 3.139, lng: 101.6869,
    feeds: [
      { url: 'https://www.freemalaysiatoday.com/feed/', source: 'Free Malaysia Today' },
      { url: 'https://www.malaymail.com/feed/rss/malaysia', source: 'Malay Mail' },
      { url: 'https://www.thestar.com.my/RSS/News', source: 'The Star Malaysia' },
    ],
  },
  hanoi: {
    label: 'Hanoi', region: 'asia', country: 'VN',
    lang: 'vi', lat: 21.0285, lng: 105.8542,
    feeds: [
      { url: 'https://vnexpress.net/rss/tin-moi-nhat.rss', source: 'VnExpress' },
      { url: 'https://e.vnexpress.net/rss/news.rss', source: 'VnExpress English' },
      { url: 'https://vietnamnews.vn/rss.html', source: 'Vietnam News' },
    ],
  },
  'ho-chi-minh': {
    label: 'Ho Chi Minh City', region: 'asia', country: 'VN',
    lang: 'vi', lat: 10.8231, lng: 106.6297,
    feeds: [
      { url: 'https://e.vnexpress.net/rss/news.rss', source: 'VnExpress English' },
      { url: 'https://tuoitre.vn/rss/tin-moi-nhat.rss', source: 'Tuoi Tre' },
    ],
  },
  taipei: {
    label: 'Taipei', region: 'asia', country: 'TW',
    lang: 'zh', lat: 25.033, lng: 121.5654,
    feeds: [
      { url: 'https://www.taiwannews.com.tw/ch/news/rss', source: 'Taiwan News Chinese' },
      { url: 'https://www.taipeitimes.com/xml/index.rss', source: 'Taipei Times' },
      { url: 'https://focustaiwan.tw/RSS', source: 'Focus Taiwan' },
    ],
  },
  osaka: {
    label: 'Osaka', region: 'asia', country: 'JP',
    lang: 'ja', lat: 34.6937, lng: 135.5023,
    feeds: [
      { url: 'https://www3.nhk.or.jp/rss/news/cat0.xml', source: 'NHK' },
      { url: 'https://www.japantimes.co.jp/feed/', source: 'Japan Times' },
    ],
  },
  // Cities without explicit region in original (Southeast/East/South Asia)
  'ho-chi-minh-city': {
    label: 'Ho Chi Minh City',
    lang: 'vi',
    coords: [10.8231, 106.6297],
    feeds: [
      { url: 'https://e.vnexpress.net/rss/news.rss', source: 'VnExpress English' },
      { url: 'https://vietnamnews.vn/rss.html', source: 'Vietnam News' },
      { url: 'https://tuoitre.vn/rss/tin-moi-nhat.rss', source: 'Tuoi Tre' },
    ],
  },
  surabaya: {
    label: 'Surabaya',
    lang: 'id',
    coords: [-7.2575, 112.7521],
    feeds: [
      { url: 'https://rss.thejakartapost.com/home', source: 'Jakarta Post' },
      { url: 'https://www.tribunnews.com/rss', source: 'Tribunnews' },
    ],
  },
  cebu: {
    label: 'Cebu',
    lang: 'fil',
    coords: [10.3157, 123.8854],
    feeds: [
      { url: 'https://www.philstar.com/rss/the-freeman', source: 'Philstar Freeman' },
      { url: 'https://www.sunstar.com.ph/rssFeed/selected', source: 'SunStar' },
    ],
  },
  'chiang-mai': {
    label: 'Chiang Mai',
    lang: 'th',
    coords: [18.7061, 98.9817],
    feeds: [
      { url: 'https://www.bangkokpost.com/rss/data/most-recent.xml', source: 'Bangkok Post' },
      { url: 'https://www.nationthailand.com/rss', source: 'Nation Thailand' },
    ],
  },
  busan: {
    label: 'Busan',
    lang: 'ko',
    coords: [35.1796, 129.0756],
    feeds: [
      { url: 'https://www.koreaherald.com/rss/newsAll', source: 'Korea Herald' },
      { url: 'https://www.koreatimes.co.kr/www2/common/rss.asp', source: 'Korea Times' },
    ],
  },
  kaohsiung: {
    label: 'Kaohsiung',
    lang: 'zh',
    coords: [22.6273, 120.3014],
    feeds: [
      { url: 'https://www.taipeitimes.com/xml/index.rss', source: 'Taipei Times' },
      { url: 'https://www.taiwannews.com.tw/ch/news/rss', source: 'Taiwan News Chinese' },
    ],
  },
  karachi: {
    label: 'Karachi',
    lang: 'ur',
    coords: [24.8607, 67.0011],
    feeds: [
      { url: 'https://www.dawn.com/feed', source: 'Dawn' },
      { url: 'https://www.geo.tv/rss/1/0', source: 'Geo News' },
    ],
  },
  lahore: {
    label: 'Lahore',
    lang: 'ur',
    coords: [31.5204, 74.3587],
    feeds: [
      { url: 'https://www.dawn.com/feed', source: 'Dawn' },
      { url: 'https://tribune.com.pk/feed/home', source: 'Express Tribune' },
    ],
  },
  islamabad: {
    label: 'Islamabad',
    lang: 'ur',
    coords: [33.6844, 73.0479],
    feeds: [
      { url: 'https://www.dawn.com/feed', source: 'Dawn' },
      { url: 'https://www.thenews.com.pk/rss/1/1', source: 'The News International' },
    ],
  },
  dhaka: {
    label: 'Dhaka',
    lang: 'bn',
    coords: [23.8103, 90.4125],
    feeds: [
      { url: 'https://www.thedailystar.net/frontpage/rss.xml', source: 'The Daily Star BD' },
      { url: 'https://bdnews24.com/feed', source: 'bdnews24' },
    ],
  },
  colombo: {
    label: 'Colombo',
    lang: 'si',
    coords: [6.9271, 79.8612],
    feeds: [
      { url: 'https://www.dailymirror.lk/RSS_Feeds/breaking-news/108', source: 'Daily Mirror LK' },
      { url: 'https://economynext.com/feed/', source: 'EconomyNext' },
    ],
  },
};
