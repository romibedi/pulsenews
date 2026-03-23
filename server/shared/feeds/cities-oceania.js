// ---------------------------------------------------------------------------
// City feeds — Australia / New Zealand (Oceania)
// ---------------------------------------------------------------------------

export const CITY_FEEDS_OCEANIA = {
  // Overwritten by later "AUSTRALIA" section — final values below
  sydney: {
    label: 'Sydney', region: 'australia', country: 'AU',
    lat: -33.8688, lng: 151.2093,
    feeds: [
      { url: 'https://www.smh.com.au/rss/feed.xml', source: 'Sydney Morning Herald' },
      { url: 'https://www.abc.net.au/news/feed/51120/rss.xml', source: 'ABC News Sydney' },
    ],
  },
  melbourne: {
    label: 'Melbourne', region: 'australia', country: 'AU',
    lat: -37.8136, lng: 144.9631,
    feeds: [
      { url: 'https://www.theage.com.au/rss/feed.xml', source: 'The Age' },
      { url: 'https://www.abc.net.au/news/feed/51120/rss.xml', source: 'ABC News Melbourne' },
    ],
  },
  brisbane: {
    label: 'Brisbane', region: 'australia', country: 'AU',
    lat: -27.4698, lng: 153.0251,
    feeds: [
      { url: 'https://www.brisbanetimes.com.au/rss/feed.xml', source: 'Brisbane Times' },
    ],
  },
  perth: {
    label: 'Perth', region: 'australia', country: 'AU',
    lat: -31.9505, lng: 115.8605,
    feeds: [
      { url: 'https://www.perthnow.com.au/feed', source: 'Perth Now' },
      { url: 'https://www.watoday.com.au/rss/feed.xml', source: 'WAtoday' },
    ],
  },
  adelaide: {
    label: 'Adelaide', region: 'australia', country: 'AU',
    lat: -34.9285, lng: 138.6007,
    feeds: [
      { url: 'https://www.indaily.com.au/feed/', source: 'InDaily Adelaide' },
      { url: 'https://www.abc.net.au/news/feed/2942460/rss.xml', source: 'ABC Adelaide' },
    ],
  },
  auckland: {
    label: 'Auckland', region: 'australia', country: 'NZ',
    lat: -36.8485, lng: 174.7633,
    feeds: [
      { url: 'https://www.nzherald.co.nz/arc/outboundfeeds/rss/curated/78/?outputType=xml', source: 'NZ Herald' },
      { url: 'https://www.rnz.co.nz/rss/national.xml', source: 'RNZ' },
      { url: 'https://www.stuff.co.nz/rss', source: 'Stuff NZ' },
    ],
  },
};
