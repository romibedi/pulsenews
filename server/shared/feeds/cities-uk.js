// ---------------------------------------------------------------------------
// City feeds — United Kingdom
// ---------------------------------------------------------------------------

export const CITY_FEEDS_UK = {
  london: {
    label: 'London', region: 'uk', country: 'GB',
    lat: 51.5074, lng: -0.1278,
    feeds: [
      { url: 'https://www.mylondon.news/?service=rss', source: 'MyLondon' },
      { url: 'https://feeds.bbci.co.uk/news/england/london/rss.xml', source: 'BBC London' },
      { url: 'https://www.standard.co.uk/rss', source: 'Evening Standard' },
    ],
  },
  // Overwritten by later "UNITED KINGDOM" section — final values below
  manchester: {
    label: 'Manchester', region: 'uk', country: 'GB',
    lat: 53.4808, lng: -2.2426,
    feeds: [
      { url: 'https://www.manchestereveningnews.co.uk/?service=rss', source: 'Manchester Evening News' },
      { url: 'https://feeds.bbci.co.uk/news/england/manchester/rss.xml', source: 'BBC Manchester' },
    ],
  },
  birmingham: {
    label: 'Birmingham', region: 'uk', country: 'GB',
    lat: 52.4862, lng: -1.8904,
    feeds: [
      { url: 'https://www.birminghammail.co.uk/?service=rss', source: 'Birmingham Mail' },
      { url: 'https://feeds.bbci.co.uk/news/england/birmingham_and_black_country/rss.xml', source: 'BBC Birmingham' },
    ],
  },
  edinburgh: {
    label: 'Edinburgh', region: 'uk', country: 'GB',
    lat: 55.9533, lng: -3.1883,
    feeds: [
      { url: 'https://www.edinburghlive.co.uk/?service=rss', source: 'Edinburgh Live' },
      { url: 'https://www.scotsman.com/rss', source: 'The Scotsman' },
      { url: 'https://feeds.bbci.co.uk/news/scotland/edinburgh_east_and_fife/rss.xml', source: 'BBC Edinburgh' },
    ],
  },
  glasgow: {
    label: 'Glasgow', region: 'uk', country: 'GB',
    lat: 55.8642, lng: -4.2518,
    feeds: [
      { url: 'https://www.glasgowtimes.co.uk/news/rss/', source: 'Glasgow Times' },
      { url: 'https://feeds.bbci.co.uk/news/scotland/glasgow_and_west/rss.xml', source: 'BBC Glasgow' },
    ],
  },
  leeds: {
    label: 'Leeds', region: 'uk', country: 'GB',
    lat: 53.8008, lng: -1.5491,
    feeds: [
      { url: 'https://feeds.bbci.co.uk/news/england/leeds_and_west_yorkshire/rss.xml', source: 'BBC Leeds' },
      { url: 'https://www.yorkshireeveningpost.co.uk/rss', source: 'Yorkshire Evening Post' },
    ],
  },
  liverpool: {
    label: 'Liverpool', region: 'uk', country: 'GB',
    lat: 53.4084, lng: -2.9916,
    feeds: [
      { url: 'https://feeds.bbci.co.uk/news/england/merseyside/rss.xml', source: 'BBC Merseyside' },
      { url: 'https://www.liverpoolecho.co.uk/?service=rss', source: 'Liverpool Echo' },
    ],
  },
  bristol: {
    label: 'Bristol', region: 'uk', country: 'GB',
    lat: 51.4545, lng: -2.5879,
    feeds: [
      { url: 'https://feeds.bbci.co.uk/news/england/bristol/rss.xml', source: 'BBC Bristol' },
      { url: 'https://www.bristolpost.co.uk/?service=rss', source: 'Bristol Post' },
    ],
  },
};
