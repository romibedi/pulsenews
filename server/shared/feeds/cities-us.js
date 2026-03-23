// ---------------------------------------------------------------------------
// City feeds — United States
// ---------------------------------------------------------------------------

export const CITY_FEEDS_US = {
  // Overwritten by later "UNITED STATES" section — final values below
  'new-york': {
    label: 'New York', region: 'us', country: 'US',
    lat: 40.7128, lng: -74.006,
    feeds: [
      { url: 'https://gothamist.com/feed', source: 'Gothamist' },
      { url: 'https://nypost.com/feed/', source: 'NY Post' },
      { url: 'https://www.thecity.nyc/feed/', source: 'The City NYC' },
      { url: 'https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml', source: 'NY Times NY Region' },
    ],
  },
  'los-angeles': {
    label: 'Los Angeles', region: 'us', country: 'US',
    lat: 34.0522, lng: -118.2437,
    feeds: [
      { url: 'https://laist.com/index.atom', source: 'LAist' },
      { url: 'https://ktla.com/feed/', source: 'KTLA' },
      { url: 'https://www.latimes.com/california/rss2.0.xml', source: 'LA Times California' },
    ],
  },
  chicago: {
    label: 'Chicago', region: 'us', country: 'US',
    lat: 41.8781, lng: -87.6298,
    feeds: [
      { url: 'https://blockclubchicago.org/feed/', source: 'Block Club Chicago' },
      { url: 'https://chicago.suntimes.com/rss/index.xml', source: 'Chicago Sun-Times' },
    ],
  },
  'san-francisco': {
    label: 'San Francisco', region: 'us', country: 'US',
    lat: 37.7749, lng: -122.4194,
    feeds: [
      { url: 'https://ww2.kqed.org/news/feed/', source: 'KQED' },
      { url: 'https://sfstandard.com/feed/', source: 'SF Standard' },
      { url: 'https://missionlocal.org/feed/', source: 'Mission Local' },
    ],
  },
  'washington-dc': {
    label: 'Washington DC', region: 'us', country: 'US',
    lat: 38.9072, lng: -77.0369,
    feeds: [
      { url: 'https://feeds.washingtonpost.com/rss/local', source: 'Washington Post Local' },
      { url: 'https://dcist.com/feed/', source: 'DCist' },
      { url: 'https://wtop.com/feed/', source: 'WTOP' },
    ],
  },
  houston: {
    label: 'Houston', region: 'us', country: 'US',
    lat: 29.7604, lng: -95.3698,
    feeds: [
      { url: 'https://houstonlanding.org/feed/', source: 'Houston Landing' },
      { url: 'https://abc13.com/feed/', source: 'ABC13 Houston' },
    ],
  },
  miami: {
    label: 'Miami', region: 'us', country: 'US',
    lat: 25.7617, lng: -80.1918,
    feeds: [
      { url: 'https://www.nbcmiami.com/feed/', source: 'NBC Miami' },
      { url: 'https://www.local10.com/arcio/rss/', source: 'Local10 Miami' },
    ],
  },
  dallas: {
    label: 'Dallas', region: 'us', country: 'US',
    lat: 32.7767, lng: -96.797,
    feeds: [
      { url: 'https://www.wfaa.com/feeds/syndication/rss/news/local', source: 'WFAA Dallas' },
      { url: 'https://www.texastribune.org/feed/', source: 'Texas Tribune' },
      { url: 'https://www.dallasobserver.com/dallas/Rss.xml', source: 'Dallas Observer' },
    ],
  },
  seattle: {
    label: 'Seattle', region: 'us', country: 'US',
    lat: 47.6062, lng: -122.3321,
    feeds: [
      { url: 'https://crosscut.com/feed', source: 'Crosscut' },
      { url: 'https://publicola.com/feed/', source: 'PubliCola' },
    ],
  },
  boston: {
    label: 'Boston', region: 'us', country: 'US',
    lat: 42.3601, lng: -71.0589,
    feeds: [
      { url: 'https://www.wbur.org/feed', source: 'WBUR Boston' },
      { url: 'https://www.universalhub.com/rss.xml', source: 'Universal Hub' },
    ],
  },
  atlanta: {
    label: 'Atlanta', region: 'us', country: 'US',
    lat: 33.749, lng: -84.388,
    feeds: [
      { url: 'https://www.wabe.org/feed/', source: 'WABE Atlanta' },
      { url: 'https://www.11alive.com/feeds/syndication/rss/news/local', source: '11Alive Atlanta' },
    ],
  },
  denver: {
    label: 'Denver', region: 'us', country: 'US',
    lat: 39.7392, lng: -104.9903,
    feeds: [
      { url: 'https://www.cpr.org/feed/', source: 'CPR News' },
      { url: 'https://denverite.com/feed/', source: 'Denverite' },
      { url: 'https://coloradosun.com/feed/', source: 'Colorado Sun' },
    ],
  },
  philadelphia: {
    label: 'Philadelphia', region: 'us', country: 'US',
    lat: 39.9526, lng: -75.1652,
    feeds: [
      { url: 'https://billypenn.com/feed/', source: 'Billy Penn' },
      { url: 'https://whyy.org/feed/', source: 'WHYY Philadelphia' },
      { url: 'https://www.phillyvoice.com/feed/', source: 'PhillyVoice' },
    ],
  },
  detroit: {
    label: 'Detroit', region: 'us', country: 'US',
    lat: 42.3314, lng: -83.0458,
    feeds: [
      { url: 'https://www.freep.com/arcio/rss/', source: 'Detroit Free Press' },
      { url: 'https://www.bridgedetroit.com/feed/', source: 'Bridge Detroit' },
    ],
  },
  phoenix: {
    label: 'Phoenix', region: 'us', country: 'US',
    lat: 33.4484, lng: -112.074,
    feeds: [
      { url: 'https://www.phoenixnewtimes.com/phoenix/Rss.xml', source: 'Phoenix New Times' },
      { url: 'https://ktar.com/feed/', source: 'KTAR Phoenix' },
      { url: 'https://www.12news.com/feeds/syndication/rss/news/local', source: '12 News Phoenix' },
    ],
  },
  washington: {
    label: 'Washington DC', region: 'us', country: 'US',
    lat: 38.9072, lng: -77.0369,
    feeds: [
      { url: 'https://wtop.com/feed/', source: 'WTOP' },
      { url: 'https://dcist.com/feed/', source: 'DCist' },
    ],
  },
};
