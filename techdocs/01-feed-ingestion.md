# Feed Ingestion Pipeline

The ingestion pipeline runs every 15 minutes via EventBridge -> Lambda, processing 650+ RSS feeds and GDELT articles. It extracts full content, runs AI analysis, writes to DynamoDB across multiple partition keys, generates TTS audio, updates sitemaps, and submits URLs to IndexNow.

## Feed Registry Structure

The feed registry lives in `server/shared/feeds/` (modular) with a backward-compatible re-export from `server/shared/feedRegistry.js`.

### Module Layout

```
server/shared/
  feedRegistry.js          # Re-exports from ./feeds/index.js
  feeds/
    index.js               # Combines all sub-modules, exports buildFeedContextMap()
    global.js              # FEEDS: 15 categories, each with 2-23 RSS sources
    regional.js            # REGIONAL_FEEDS (9 regions) + REGIONAL_CATEGORY_FEEDS (9 regions x 7+ categories)
    languages.js           # LANG_FEEDS: 28+ languages
    cities-india.js        # CITY_FEEDS for Indian cities (12 cities)
    cities-uk.js           # CITY_FEEDS for UK cities (8 cities)
    cities-us.js           # CITY_FEEDS for US cities (12 cities)
    cities-asia.js         # CITY_FEEDS for Asian cities
    cities-europe.js       # CITY_FEEDS for European cities
    cities-mideast.js      # CITY_FEEDS for Middle East cities
    cities-africa.js       # CITY_FEEDS for African cities
    cities-latam.js        # CITY_FEEDS for Latin American cities
    cities-oceania.js      # CITY_FEEDS for Oceania cities
```

### Feed Categories (FEEDS in `feeds/global.js`)

15 global categories: `world`, `technology`, `business`, `science`, `sport`, `culture`, `environment`, `politics`, `ai`, `entertainment`, `gaming`, `cricket`, `startups`, `space`, `crypto`.

Example sources for `world`: BBC News, Al Jazeera, NPR, The Guardian, NY Times, Washington Post, CNN, Fox News, Sky News, DW News, France 24, Nikkei Asia (23 feeds total).

### Regions (REGIONAL_FEEDS + REGIONAL_CATEGORY_FEEDS)

9 regions: `india`, `uk`, `us`, `australia`, `middle-east`, `europe`, `africa`, `asia`, `latam`.

Each region has:
- General feeds (REGIONAL_FEEDS): 5-16 sources per region
- Category-specific feeds (REGIONAL_CATEGORY_FEEDS): 7-9 categories per region with dedicated sources

### Languages (LANG_FEEDS in `feeds/languages.js`)

28+ language codes with direct-publisher RSS feeds:
- **Indian**: hi (12 feeds), ta (7), te (5), bn (7), mr (5), kn (3), ml (4), gu (4), pa (2), ur (3), as (1)
- **Middle East/Africa**: ar (9), fa (5), he (2), sw (2)
- **European**: fr (10), de (9), es (9), pt (10), it (6), nl, sv, tr, pl, ru
- **Asian**: zh, ja, ko, th, id, vi, ms, fil

### City Feeds (CITY_FEEDS)

Each city entry has the shape:
```js
{
  'mumbai': {
    region: 'india',
    feeds: [
      { url: 'https://...', source: 'Times of India Mumbai' },
      ...
    ]
  }
}
```

135 cities across 9 city modules covering all continents.

## buildFeedContextMap()

**File**: `server/shared/feeds/index.js`, lines 53-108

This is the core deduplication function used by the ingestion handler. It returns a `Map<feedUrl, { source, contexts[] }>` where each feed URL appears exactly once, even if it's registered in multiple categories/regions.

```js
function register(url, source, context) {
  if (!map.has(url)) {
    map.set(url, { source, contexts: [] });
  }
  map.get(url).contexts.push(context);
}
```

**Context shapes**:
- `{ type: 'global', category }` -- from FEEDS
- `{ type: 'region', region }` -- from REGIONAL_FEEDS (no category)
- `{ type: 'region', region, category }` -- from REGIONAL_CATEGORY_FEEDS
- `{ type: 'lang', lang }` -- from LANG_FEEDS
- `{ type: 'city', city, region }` -- from CITY_FEEDS

Registration order: global -> regional general -> regional+category -> language -> city.

## RSS Parsing (`server/rss.js`)

### parseRssFeed(xml, source)
Regex-based XML parser that extracts `<item>` elements:
- Extracts: `title`, `link`, `description`, `content:encoded`, `pubDate`, images from `media:thumbnail`, `media:content`, `enclosure`, `img` tags
- HTML entity decoding via `stripHtml()`
- Article ID generation:
  - Short URLs: `rss-{base64url(link)}` (base64url encoding)
  - Long URLs (>800 chars, common for Google News): `rss-h-{sha256(link)}` to stay under DynamoDB's 1024-byte SK limit

### resolveGoogleNewsUrl(url)
Uses `google-news-decoder` to resolve Google News redirect URLs (`news.google.com/rss/articles/...`) to actual publisher URLs. Articles that fail to decode are skipped.

### fetchFeed(feedUrl, source)
In-memory cached fetch with 30-minute TTL. Background OG image fetch for articles missing images (up to 5 per feed).

## Ingestion Handler (`server/ingest/handler.js`)

### Main Flow

```
handler(event)
  |
  +-- 1. buildFeedContextMap() -> Map of ~650+ unique feed URLs
  |
  +-- 2. Fetch all feeds (10 concurrent via createLimiter)
  |       |
  |       +-- For each article in feed:
  |           a. articleExists(article.id) -> DynamoDB dedup check
  |           b. resolveGoogleNewsUrl() -> decode Google News URLs
  |           c. extractArticleContent(url) -> @extractus/article-extractor (10s timeout)
  |           d. Image resolution: RSS image > extracted image > OG image (skip logos)
  |           e. analyzeArticle(title, description, body) -> Gemini Flash / Haiku fallback
  |           f. Build DynamoDB items for ALL context PKs + SITEMAP entry
  |           g. batchWriteArticles(items) -> DynamoDB batch write
  |           h. Collect for TTS, sitemap, IndexNow
  |
  +-- 3. GDELT integration (sequential with 2s delays)
  |       Same per-article processing as RSS
  |
  +-- 4. Post-ingestion:
  |       a. submitUrls(newArticleUrls) -> IndexNow
  |       b. pingSitemap() -> Google + Bing
  |       c. generateBatch(articles, 20) -> Edge TTS to S3
  |       d. updateSitemaps(articles) -> S3 XML files
  |
  +-- Return stats: { ingested, gdeltIngested, skipped, feedErrors, durationSeconds }
```

### Concurrency Control

`createLimiter(10)` -- custom promise-based concurrency limiter (lines 53-73). Avoids adding `p-limit` as a dependency. Limits to 10 simultaneous feed fetches.

### Article Content Extraction

```js
async function extractArticleContent(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000); // 10s timeout
  const article = await extract(url, {}, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PulseNews/1.0)' },
    signal: controller.signal,
  });
  // Returns { body, image, author }
}
```

### Image Quality Filtering

`isLogoOrPlaceholder(url)` detects and rejects:
- Google News app logo (`lh3.googleusercontent.com/j6_cofb`)
- URL paths containing "logo", "favicon", "placeholder", "default-image", "brand", "icon"
- Very small/narrow images by dimensions in URL (e.g., `100x50`)

### Slug Generation

```js
function generateSlug(title, date) {
  const datePrefix = date.slice(0, 10);  // "2026-03-23"
  let slug = title.toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')  // Unicode-safe: keep letters + numbers
    .replace(/\s+/g, '-')
    .slice(0, 80);
  if (!slug || slug === '-') {  // Non-Latin fallback
    slug = Buffer.from(title.slice(0, 60)).toString('base64url').slice(0, 40);
  }
  return `${datePrefix}-${slug}`;  // "2026-03-23-headline-text-here"
}
```

## DynamoDB Partition Key Strategy

Each article is written to **multiple partitions** for efficient querying:

| PK Pattern | SK Pattern | Purpose |
|-----------|-----------|---------|
| `GLOBAL#CAT#world` | `{ISO-date}#{articleId}` | Global category feeds |
| `REGION#india#CAT#technology` | `{ISO-date}#{articleId}` | Regional category feeds |
| `REGION#india` | `{ISO-date}#{articleId}` | Regional general feeds |
| `LANG#hi` | `{ISO-date}#{articleId}` | Language-specific feeds |
| `CITY#mumbai` | `{ISO-date}#{articleId}` | City-level feeds |
| `SITEMAP` | `{ISO-date}#{articleId}` | Sitemap generation, search indexing |

**SK format**: `{ISO-date}#{articleId}` -- enables descending chronological sort via `ScanIndexForward: false` and date-prefix queries via `begins_with(SK, :datePrefix)`.

**TTL**: 90 days (`Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60)`)

**GSIs**:
- `articleId-index` (hash: articleId, range: date) -- article lookup by ID
- `slug-index` (hash: slug, range: date) -- SEO-friendly URL lookup

## GDELT Integration (`server/ingest/gdelt.js`)

### Query Strategy
- 8 category queries (English): technology, business, science, sports, climate, election, health, entertainment
- 9 regional queries (by FIPS country code): IN, US, UK, AS, FR, SA, NI, CH, BR
- 11 non-English language queries: hin, spa, fra, deu, por, ara, zho, jpn, rus, tur, ita

All queries run sequentially with 2-second delays to respect GDELT rate limits. Max 250 records per query.

### Normalization
GDELT articles are normalized to match the RSS pipeline format:
- `id = gdelt-{sha256(url)}`
- Date parsed from GDELT's `seendate` format (`"20260322T133000Z"`)
- Country-to-region mapping via `COUNTRY_TO_REGION` lookup table

### Context Building
`buildGdeltContexts(article)` creates partition contexts:
- Always: `{ type: 'global', category }` for the article's category
- If region != global: `{ type: 'region', region }` and `{ type: 'region', region, category }`
- If lang != en: `{ type: 'lang', lang }`

## Deduplication Logic

Two-level dedup:

1. **Feed-level**: `buildFeedContextMap()` ensures each RSS URL is fetched once, even if registered across multiple categories/regions. Contexts accumulate.

2. **Article-level**: `articleExists(articleId)` checks the `articleId-index` GSI before processing. This catches articles that were ingested in a previous 15-minute cycle.

## Error Handling and Timeouts

- Feed fetch failures: logged and counted (`feedErrors`), processing continues
- Article extraction: 10-second `AbortController` timeout per URL
- Google News URL decode failure: article skipped
- AI analysis failure: defaults applied (`ANALYSIS_DEFAULTS = { mood: 'neutral', entities: [], ... }`)
- TTS generation failure: logged, article still ingested without audio
- IndexNow/sitemap failures: logged, non-blocking
- GDELT: 15-second timeout per query, errors logged per-article
- Lambda timeout: 900 seconds (15 minutes max)
- Lambda concurrency: reserved to 1 to prevent overlapping runs
