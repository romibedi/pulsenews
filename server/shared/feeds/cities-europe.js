// ---------------------------------------------------------------------------
// City feeds — Europe
// ---------------------------------------------------------------------------

export const CITY_FEEDS_EUROPE = {
  paris: {
    label: 'Paris', region: 'europe', country: 'FR',
    lang: 'fr', lat: 48.8566, lng: 2.3522,
    feeds: [
      { url: 'https://feeds.leparisien.fr/leparisien/rss', source: 'Le Parisien' },
      { url: 'https://www.france24.com/en/france/rss', source: 'France 24 France' },
      { url: 'https://feeds.thelocal.com/rss/fr', source: 'The Local France' },
    ],
  },
  berlin: {
    label: 'Berlin', region: 'europe', country: 'DE',
    lang: 'de', lat: 52.52, lng: 13.405,
    feeds: [
      { url: 'https://www.berliner-zeitung.de/feed.xml', source: 'Berliner Zeitung' },
      { url: 'https://rss.dw.com/xml/rss-en-all', source: 'DW News' },
      { url: 'https://feeds.thelocal.com/rss/de', source: 'The Local Germany' },
    ],
  },
  madrid: {
    label: 'Madrid', region: 'europe', country: 'ES',
    lang: 'es', lat: 40.4168, lng: -3.7038,
    feeds: [
      { url: 'https://english.elpais.com/rss/elpais/inenglish.xml', source: 'El Pais English' },
      { url: 'https://www.elmundo.es/rss/portada.xml', source: 'El Mundo' },
      { url: 'https://feeds.thelocal.com/rss/es', source: 'The Local Spain' },
    ],
  },
  rome: {
    label: 'Rome', region: 'europe', country: 'IT',
    lang: 'it', lat: 41.9028, lng: 12.4964,
    feeds: [
      { url: 'https://www.wantedinrome.com/feed/', source: 'Wanted in Rome' },
      { url: 'https://www.ansa.it/sito/ansait_rss.xml', source: 'ANSA' },
      { url: 'https://feeds.thelocal.com/rss/it', source: 'The Local Italy' },
    ],
  },
  amsterdam: {
    label: 'Amsterdam', region: 'europe', country: 'NL',
    lang: 'nl', lat: 52.3676, lng: 4.9041,
    feeds: [
      { url: 'https://feeds.nos.nl/nosnieuwsalgemeen', source: 'NOS Nieuws' },
      { url: 'https://www.dutchnews.nl/feed/', source: 'DutchNews' },
      { url: 'https://nltimes.nl/feed', source: 'NL Times' },
    ],
  },
  barcelona: {
    label: 'Barcelona', region: 'europe', country: 'ES',
    lang: 'es', lat: 41.3874, lng: 2.1686,
    feeds: [
      { url: 'https://feeds.thelocal.com/rss/es', source: 'The Local Spain' },
      { url: 'https://www.lavanguardia.com/rss/barcelona.xml', source: 'La Vanguardia Barcelona' },
    ],
  },
  munich: {
    label: 'Munich', region: 'europe', country: 'DE',
    lang: 'de', lat: 48.1351, lng: 11.582,
    feeds: [
      { url: 'https://feeds.thelocal.com/rss/de', source: 'The Local Germany' },
      { url: 'https://www.sueddeutsche.de/muenchen?output=rss', source: 'Sueddeutsche Munich' },
    ],
  },
  stockholm: {
    label: 'Stockholm', region: 'europe', country: 'SE',
    lang: 'sv', lat: 59.3293, lng: 18.0686,
    feeds: [
      { url: 'https://www.dn.se/rss/', source: 'Dagens Nyheter' },
      { url: 'https://feeds.thelocal.com/rss/se', source: 'The Local Sweden' },
    ],
  },
  // "MORE EUROPE" section
  vienna: {
    label: 'Vienna', region: 'europe', country: 'AT',
    lang: 'de', lat: 48.2082, lng: 16.3738,
    feeds: [
      { url: 'https://www.derstandard.at/rss', source: 'Der Standard' },
      { url: 'https://feeds.thelocal.com/rss/at', source: 'The Local Austria' },
    ],
  },
  warsaw: {
    label: 'Warsaw', region: 'europe', country: 'PL',
    lang: 'pl', lat: 52.2297, lng: 21.0122,
    feeds: [
      { url: 'https://www.tvn24.pl/najnowsze.xml', source: 'TVN24' },
      { url: 'https://notesfrompoland.com/feed/', source: 'Notes from Poland' },
    ],
  },
  lisbon: {
    label: 'Lisbon', region: 'europe', country: 'PT',
    lang: 'pt', lat: 38.7223, lng: -9.1393,
    feeds: [
      { url: 'https://observador.pt/feed/', source: 'Observador' },
      { url: 'https://www.theportugalnews.com/rss', source: 'The Portugal News' },
    ],
  },
  athens: {
    label: 'Athens', region: 'europe', country: 'GR',
    lat: 37.9838, lng: 23.7275,
    feeds: [
      { url: 'https://www.ekathimerini.com/rss', source: 'Ekathimerini' },
      { url: 'https://greekreporter.com/feed/', source: 'Greek Reporter' },
    ],
  },
  zurich: {
    label: 'Zurich', region: 'europe', country: 'CH',
    lang: 'de', lat: 47.3769, lng: 8.5417,
    feeds: [
      { url: 'https://www.swissinfo.ch/eng/rss/all-news', source: 'Swissinfo' },
      { url: 'https://www.nzz.ch/recent.rss', source: 'NZZ' },
    ],
  },
  dublin: {
    label: 'Dublin', region: 'europe', country: 'IE',
    lat: 53.3498, lng: -6.2603,
    feeds: [
      { url: 'https://www.rte.ie/rss/news.xml', source: 'RTÉ' },
      { url: 'https://www.thejournal.ie/feed/', source: 'The Journal.ie' },
      { url: 'https://www.irishtimes.com/cmlink/news-1.1319192', source: 'Irish Times' },
    ],
  },
  prague: {
    label: 'Prague', region: 'europe', country: 'CZ',
    lat: 50.0755, lng: 14.4378,
    feeds: [
      { url: 'https://english.radio.cz/rss', source: 'Radio Prague' },
      { url: 'https://praguemonitor.com/feed/', source: 'Prague Monitor' },
    ],
  },
  copenhagen: {
    label: 'Copenhagen', region: 'europe', country: 'DK',
    lat: 55.6761, lng: 12.5683,
    feeds: [
      { url: 'https://www.thelocal.dk/feeds/rss.php', source: 'The Local Denmark' },
      { url: 'https://cphpost.dk/feed/', source: 'Copenhagen Post' },
    ],
  },
  // Cities without explicit region in original (European)
  brussels: {
    label: 'Brussels',
    lang: 'fr',
    coords: [50.8503, 4.3517],
    feeds: [
      { url: 'https://www.euractiv.com/feed/', source: 'Euractiv' },
      { url: 'https://www.brusselstimes.com/feed/', source: 'Brussels Times' },
    ],
  },
  oslo: {
    label: 'Oslo',
    lang: 'no',
    coords: [59.9139, 10.7522],
    feeds: [
      { url: 'https://www.newsinenglish.no/feed/', source: 'News in English Norway' },
      { url: 'https://www.thelocal.no/feeds/rss.php', source: 'The Local Norway' },
    ],
  },
  helsinki: {
    label: 'Helsinki',
    lang: 'fi',
    coords: [60.1699, 24.9384],
    feeds: [
      { url: 'https://yle.fi/rss/uutiset.rss', source: 'YLE News' },
      { url: 'https://www.helsinkitimes.fi/feed.html', source: 'Helsinki Times' },
    ],
  },
  budapest: {
    label: 'Budapest',
    lang: 'hu',
    coords: [47.4979, 19.0402],
    feeds: [
      { url: 'https://hungarytoday.hu/feed/', source: 'Hungary Today' },
      { url: 'https://dailynewshungary.com/feed/', source: 'Daily News Hungary' },
    ],
  },
  bucharest: {
    label: 'Bucharest',
    lang: 'ro',
    coords: [44.4268, 26.1025],
    feeds: [
      { url: 'https://balkaninsight.com/feed/', source: 'Balkan Insight' },
      { url: 'https://www.romania-insider.com/feed', source: 'Romania Insider' },
    ],
  },
  kyiv: {
    label: 'Kyiv',
    lang: 'uk',
    coords: [50.4501, 30.5234],
    feeds: [
      { url: 'https://www.kyivindependent.com/feed/', source: 'Kyiv Independent' },
      { url: 'https://english.nv.ua/rss/all.xml', source: 'NV Ukraine' },
    ],
  },
  milan: {
    label: 'Milan',
    lang: 'it',
    coords: [45.4642, 9.19],
    feeds: [
      { url: 'https://feeds.thelocal.com/rss/it', source: 'The Local Italy' },
      { url: 'http://xml2.corriereobjects.it/rss/homepage.xml', source: 'Corriere della Sera' },
    ],
  },
};
