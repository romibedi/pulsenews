# Feeds and Languages

PulseNewsToday aggregates 653 unique RSS feed URLs across 884 routing contexts, covering 15 global categories, 9 regions, 51 languages, and 135 cities. The feed registry is modular, organized under `server/shared/feeds/`, with a `buildFeedContextMap()` function that deduplicates URLs so each is fetched only once during ingestion.

## Feed Registry Organization

**File**: `server/shared/feeds/index.js` (108 lines)

### Module Structure

```
server/shared/feeds/
  index.js              -- Re-exports + CITY_FEEDS merge + buildFeedContextMap()
  global.js             -- 15 categories, 103 feeds
  regional.js           -- 9 regions (general + category), 253 feeds
  languages.js          -- 51 languages, 201 feeds
  cities-india.js       -- 20 cities
  cities-uk.js          -- 8 cities
  cities-us.js          -- 16 cities
  cities-asia.js        -- 12 cities
  cities-europe.js      -- 16 cities
  cities-mideast.js     -- 8 cities
  cities-africa.js      -- 8 cities
  cities-latam.js       -- 8 cities
  cities-oceania.js     -- 6 cities
```

`server/shared/feedRegistry.js` is a 12-line re-export shim from `./feeds/index.js` for backward compatibility.

### Feed Entry Shape

Every feed in every module follows this shape:
```js
{ url: 'https://...rss.xml', source: 'Publisher Name' }
```

City feeds add metadata:
```js
{
  label: 'Mumbai', region: 'india', country: 'IN',
  lang: 'mr', lat: 19.076, lng: 72.8777,
  feeds: [
    { url: '...', source: '...' },
    ...
  ],
}
```

### buildFeedContextMap()

**Lines 53-108.** Creates a `Map<feedUrl, { source, contexts[] }>` that deduplicates all feed URLs across the four registries. A single URL that appears in multiple registries gets multiple contexts on one entry.

Context shapes:
- `{ type: 'global', category }` -- global category feed
- `{ type: 'region', region }` -- regional general feed
- `{ type: 'region', region, category }` -- regional category feed
- `{ type: 'lang', lang }` -- language-specific feed
- `{ type: 'city', city, region }` -- city-level feed

During ingestion (`server/ingest/handler.js`), each fetched article is written to DynamoDB under all partition keys derived from its contexts. For example, an article from a feed with contexts `[{ type: 'global', category: 'world' }, { type: 'region', region: 'india' }]` gets written to both `GLOBAL#CAT#world` and `REGION#india`.

## Global Category Feeds

**File**: `server/shared/feeds/global.js` (139 lines)

15 categories with 103 total feeds. Exported as the `FEEDS` constant.

| Category | Feeds | Top Sources |
|----------|-------|-------------|
| world | 23 | BBC, Al Jazeera, NPR, Guardian, AP, NYT, CNN, WaPo, Fox, DW, France 24 |
| technology | 14 | BBC Tech, Ars Technica, Wired, The Verge, Engadget, CNET, ZDNet |
| business | 10 | BBC Business, CNBC, CNN Business, Fortune, Business Insider |
| science | 9 | BBC Science, Scientific American, Nature, Phys.org, New Scientist |
| politics | 8 | BBC Politics, NPR, Politico, The Hill, CNN, Fox News |
| entertainment | 7 | Variety, Deadline, BBC, Hollywood Reporter, CNN, NME |
| crypto | 5 | CoinDesk, CoinTelegraph, Decrypt, The Block, Bitcoin Magazine |
| sport | 4 | BBC Sport, ESPN, Guardian Sport |
| culture | 4 | BBC Arts, NPR Arts, Guardian Culture, DW Culture |
| ai | 4 | TechCrunch AI, The Verge AI, MIT Tech Review, VentureBeat AI |
| gaming | 4 | IGN, Kotaku, Polygon, GameSpot |
| space | 4 | SpaceNews, Space.com, NASA, Universe Today |
| startups | 3 | TechCrunch, Crunchbase News, VentureBeat |
| environment | 2 | BBC Environment, Guardian Environment |
| cricket | 2 | BBC Cricket, ESPNcricinfo |

## Regional Feeds

**File**: `server/shared/feeds/regional.js`

### General Regional Feeds (94 feeds across 9 regions)

Each region has a set of general-purpose news feeds:

| Region | Feeds | Top Sources |
|--------|-------|-------------|
| asia | 16 | BBC Asia, SCMP, Straits Times, Yonhap, Rappler, VnExpress |
| africa | 15 | BBC Africa, AllAfrica, Premium Times, News24 SA, Vanguard, Punch Nigeria |
| middle-east | 12 | Al Jazeera, BBC ME, Daily Sabah, Times of Israel, Arab News, Gulf News |
| us | 12 | NPR US, NYT US, CNN, Fox News, CBS, USA Today, WaPo, LA Times |
| uk | 11 | BBC UK, Sky News, Mirror, Metro, Guardian UK, Telegraph, Daily Mail |
| india | 10 | Times of India, The Hindu, Indian Express, BBC India, NDTV, HT |
| europe | 8 | BBC Europe, RFI, DW, EuroNews, Balkan Insight |
| australia | 5 | ABC Australia, BBC Australia, Guardian Australia, Stuff NZ |
| latam | 5 | Merco Press, Buenos Aires Herald, Latin Finance, NACLA |

### Regional Category Feeds (159 feeds across 9 regions)

Each region has category-specific feeds (7-10 categories per region). Exported as `REGIONAL_CATEGORY_FEEDS`.

| Region | Categories | Total Feeds |
|--------|-----------|-------------|
| india | 10 (world, tech, business, sport, science, culture, politics, entertainment, cricket, startups) | 41 |
| europe | 7 | 19 |
| uk | 8 | 17 |
| australia | 8 | 16 |
| asia | 7 | 16 |
| us | 7 | 14 |
| africa | 7 | 14 |
| middle-east | 7 | 12 |
| latam | 7 | 10 |

India has the most category feeds (41) due to its rich regional media ecosystem, with dedicated cricket and startups categories.

## Language Feeds

**File**: `server/shared/feeds/languages.js` (300+ lines)

51 languages with 201 total feeds. Exported as `LANG_FEEDS`.

### Indian Languages (12 languages, 53 feeds)

| Code | Language | Feeds | Key Sources |
|------|----------|-------|-------------|
| hi | Hindi | 12 | BBC Hindi, Dainik Jagran, Amar Ujala, Dainik Bhaskar, NDTV Hindi, Aaj Tak |
| ta | Tamil | 7 | BBC Tamil, The Hindu Tamil, Dinamalar, Vikatan, Dinakaran |
| bn | Bengali | 7 | BBC Bangla, Ei Samay, Anandabazar Patrika, Daily Star Bangla |
| te | Telugu | 5 | BBC Telugu, Sakshi, Eenadu, Andhra Jyothy |
| mr | Marathi | 5 | Zee News Marathi, Loksatta, Lokmat |
| gu | Gujarati | 4 | BBC Gujarati, Gujarat Samachar, Divya Bhaskar |
| ml | Malayalam | 4 | Mathrubhumi, Manorama Online |
| kn | Kannada | 3 | Vijaya Karnataka, Prajavani |
| pa | Punjabi | 2 | BBC Punjabi |
| ur | Urdu | 3 | BBC Urdu, Dawn Urdu, Geo Urdu |
| as | Assamese | 1 | Northeast Now |

### Middle East / Africa (6 languages, 19 feeds)

| Code | Language | Feeds | Key Sources |
|------|----------|-------|-------------|
| ar | Arabic | 9 | BBC Arabic, Asharq Al-Awsat, Al Jazeera Arabic, France 24 Arabic |
| fa | Persian | 5 | BBC Persian, Mehr News, Radio Farda |
| he | Hebrew | 2 | Haaretz, Ynet |
| sw | Swahili | 2 | BBC Swahili, DW Swahili |
| ha | Hausa | 2 | BBC Hausa, VOA Hausa |
| am | Amharic | 1 | BBC Amharic |

### European Languages (16 languages, 70 feeds)

| Code | Language | Feeds | Key Sources |
|------|----------|-------|-------------|
| fr | French | 10 | France 24, Le Monde, Le Figaro, Liberation, Mediapart |
| pt | Portuguese | 10 | BBC Portuguese, Folha de S.Paulo, RTP, Observador |
| de | German | 9 | Tagesschau, Der Spiegel, FAZ, ZEIT, Handelsblatt |
| es | Spanish | 9 | BBC Mundo, El Pais, Clarin, El Tiempo, El Mundo |
| tr | Turkish | 7 | BBC Turkish, Daily Sabah, Haberturk, Cumhuriyet |
| it | Italian | 6 | ANSA, Corriere della Sera, La Repubblica, RAI News |
| nl | Dutch | 6 | NOS Nieuws, De Telegraaf, RTL Nieuws, De Volkskrant |
| sv | Swedish | 4 | SVT Nyheter, Aftonbladet, Dagens Nyheter |
| pl | Polish | 3 | RMF24, TVN24, Polsat News |
| ru | Russian | 3 | BBC Russian, Meduza, DW Russian |
| no | Norwegian | 3 | NRK, VG, Aftenposten |
| uk | Ukrainian | 3 | BBC Ukrainian, Ukrinform |
| ro | Romanian | 2 | Digi24, HotNews |
| hu | Hungarian | 2 | Index.hu, Budapest Times |
| fi | Finnish | 2 | YLE Uutiset, Helsingin Sanomat |
| Others | da, el, cs, bg | 1 each | Various national broadcasters |

### East Asian Languages (3 languages, 17 feeds)

| Code | Language | Feeds | Key Sources |
|------|----------|-------|-------------|
| zh | Chinese | 6 | BBC Chinese, RFA, Liberty Times Taiwan, DW Chinese |
| ja | Japanese | 6 | BBC Japanese, NHK, Nippon.com, Japan News (Yomiuri), Mainichi |
| ko | Korean | 5 | BBC Korean, Korea Herald, Korea Times, Hankyoreh |

### Southeast Asian Languages (5 languages, 19 feeds)

| Code | Language | Feeds | Key Sources |
|------|----------|-------|-------------|
| id | Indonesian | 7 | BBC Indonesia, Republika, Tribunnews, Antara News |
| fil | Filipino | 4 | Philstar, GMA News, BusinessWorld PH |
| vi | Vietnamese | 4 | VnExpress, Tuoi Tre, Thanh Nien |
| th | Thai | 2 | BBC Thai, Nation Thailand |
| ms | Malay | 2 | Bernama, Free Malaysia Today |

### Other Languages

Yoruba (`yo`), Igbo (`ig`), Somali (`so`), Burmese (`my`: 2), Khmer (`km`: 1), Sinhala (`si`: 1), Nepali (`ne`: 1) -- primarily BBC language services.

## City Coverage

**135 cities across 9 regions** with 327 city-level feeds.

### Cities by Region

| Region | Cities | City Modules |
|--------|--------|-------------|
| india | 20 | `cities-india.js` |
| us | 16 | `cities-us.js` |
| europe | 16 | `cities-europe.js` |
| asia | 12 | `cities-asia.js` |
| uk | 8 | `cities-uk.js` |
| middle-east | 8 | `cities-mideast.js` |
| africa | 8 | `cities-africa.js` |
| latam | 8 | `cities-latam.js` |
| australia | 6 | `cities-oceania.js` |

### City Entry Metadata

Each city entry includes:
- `label`: Display name
- `region`: Parent region for routing
- `country`: ISO 3166-1 alpha-2 code
- `lang`: Primary local language code (for TTS voice selection)
- `lat` / `lng`: Coordinates (for geolocation-based city detection via `/api/geo-city`)
- `feeds`: Array of RSS feed entries

### Indian Cities (20)

Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Kolkata, Ahmedabad, Jaipur, Lucknow, Chandigarh, Bhopal, Patna, Kochi, Guwahati, Thiruvananthapuram, Coimbatore, Indore, Visakhapatnam, Nagpur.

Each has 2-5 feeds from local editions of national papers (Times of India, Hindustan Times, Indian Express) plus regional-language publishers.

### US Cities (16)

New York, Los Angeles, Chicago, Houston, San Francisco, Washington DC, Boston, Seattle, Miami, Atlanta, Dallas, Denver, Phoenix, Philadelphia, Detroit, Minneapolis.

Sourced from local news outlets, regional NPR affiliates, and metro editions.

### European Cities (16)

London, Paris, Berlin, Madrid, Rome, Amsterdam, Vienna, Brussels, Dublin, Zurich, Stockholm, Oslo, Helsinki, Warsaw, Prague, Budapest.

Mix of English-language city news and national publishers.

### Other Regions

- **UK** (8): London, Manchester, Birmingham, Edinburgh, Glasgow, Belfast, Cardiff, Liverpool
- **Asia** (12): Tokyo, Beijing, Singapore, Bangkok, Jakarta, Manila, Hanoi, Seoul, Taipei, Kuala Lumpur, Dhaka, Karachi
- **Middle East** (8): Dubai, Riyadh, Tehran, Istanbul, Cairo, Tel Aviv, Doha, Kuwait City
- **Africa** (8): Lagos, Nairobi, Cape Town, Johannesburg, Accra, Dar es Salaam, Addis Ababa, Kampala
- **Latin America** (8): Sao Paulo, Mexico City, Buenos Aires, Bogota, Lima, Santiago, Montevideo, San Juan
- **Oceania** (6): Sydney, Melbourne, Brisbane, Perth, Auckland, Wellington

## GDELT Integration

**File**: `server/ingest/gdelt.js` (249 lines)

In addition to RSS feeds, the GDELT Project API v2 provides supplementary global coverage:

- **8 category queries**: politics, business, technology, science, environment, sports, entertainment, culture
- **9 regional queries**: US, UK, India, Middle East, Africa, Europe, Asia-Pacific, Latin America, Australia/Oceania (using FIPS country codes)
- **11 language queries**: Non-English languages (fr, de, es, pt, ar, zh, ja, ko, hi, ru, tr)
- Max 250 records per query
- 2-second delay between requests to respect rate limits

## Feed Counts Summary

| Registry | Feeds | After Dedup |
|----------|-------|-------------|
| Global categories | 103 | -- |
| Regional general | 94 | -- |
| Regional x category | 159 | -- |
| Language-specific | 201 | -- |
| City-level | 327 | -- |
| **Total (raw)** | **884** | **653 unique URLs** |

231 URLs are shared across registries (e.g., BBC Hindi appears in both the India regional feeds and Hindi language feeds).

## How to Add New Feeds

### Adding a Global Feed

Edit `server/shared/feeds/global.js`. Add an entry to the relevant category array:

```js
world: [
  ...existing,
  { url: 'https://example.com/rss/world.xml', source: 'Example News' },
],
```

### Adding a Regional Feed

Edit `server/shared/feeds/regional.js`.

For a general regional feed:
```js
REGIONAL_FEEDS.india.push(
  { url: 'https://example.com/rss/india.xml', source: 'Example India' }
);
```

For a regional category feed:
```js
REGIONAL_CATEGORY_FEEDS.india.technology.push(
  { url: 'https://example.com/rss/india-tech.xml', source: 'Example Tech India' }
);
```

### Adding a Language

1. Add the language to `server/shared/feeds/languages.js`:
```js
export const LANG_FEEDS = {
  ...existing,
  sw: [  // Swahili
    { url: 'https://example.com/rss/sw.xml', source: 'Example Swahili' },
  ],
};
```

2. Add a TTS voice to `server/tts/generate.js` in the `VOICES` constant:
```js
const VOICES = {
  ...existing,
  sw: 'sw-KE-ZuriNeural',
};
```

3. Add an OpenSearch analyzer mapping to `server/search/mappings.js` in `LANGUAGE_ANALYZERS`:
```js
const LANGUAGE_ANALYZERS = {
  ...existing,
  sw: 'english',  // or 'icu_analyzer' for Unicode fallback
};
```

4. Add the language to the frontend language selector in `src/hooks/useLanguage.jsx`.

### Adding a City

1. Choose the correct city module (e.g., `server/shared/feeds/cities-india.js`).
2. Add an entry:
```js
export const CITY_FEEDS_INDIA = {
  ...existing,
  jaipur: {
    label: 'Jaipur', region: 'india', country: 'IN',
    lang: 'hi', lat: 26.9124, lng: 75.7873,
    feeds: [
      { url: 'https://example.com/jaipur.xml', source: 'Example Jaipur' },
    ],
  },
};
```

3. Add the city to `CITIES_BY_REGION` in `src/utils/articleHelpers.js` for frontend display.

### Adding a New Region

1. Add the region to `REGIONAL_FEEDS` and `REGIONAL_CATEGORY_FEEDS` in `server/shared/feeds/regional.js`
2. Create a city module (e.g., `cities-newregion.js`) and import it in `index.js`
3. Add to `REGIONS` in `src/hooks/useRegion.js`
4. Add to `CITIES_BY_REGION` in `src/utils/articleHelpers.js`

### Verification

After adding feeds, the admin dashboard (`/admin`) shows article counts by category, region, language, and city, making it easy to verify new feeds are being ingested.
