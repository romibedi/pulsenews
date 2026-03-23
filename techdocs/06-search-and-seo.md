# Search and SEO

PulseNewsToday uses OpenSearch for multilingual full-text search with optional hybrid BM25 + kNN vector search via Amazon Bedrock Titan Embeddings. SEO is handled through server-side rendering for bots, IndexNow submissions, Google News sitemaps, structured data, and React Helmet meta tags.

## OpenSearch Integration

### Architecture

```
DynamoDB (SITEMAP items)
    |
    | DynamoDB Streams (filtered: PK prefix "SITEMAP")
    v
Search Indexer Lambda
    |
    | Per-language routing (articles-en, articles-hi, etc.)
    | Bedrock Titan Embeddings v2 (optional kNN vectors)
    v
OpenSearch 2.13 (t3.small.search)
    ^
    | ESHttpGet / ESHttpPost
    |
App Runner (Express /api/search endpoint)
```

### Per-Language Indexes

**File**: `server/search/mappings.js`

Each supported language gets its own OpenSearch index with a language-specific text analyzer:

| Language | Index Name | Analyzer |
|----------|-----------|----------|
| English | `articles-en` | `english` (built-in) |
| Hindi | `articles-hi` | `hindi` (built-in) |
| Arabic | `articles-ar` | `arabic` (built-in) |
| Chinese | `articles-zh` | `smartcn` (plugin) |
| Japanese | `articles-ja` | `kuromoji` (plugin) |
| Korean | `articles-ko` | `icu_analyzer` (plugin) |
| Thai | `articles-th` | `thai` (built-in) |
| Tamil, Telugu, Bengali, etc. | `articles-{lang}` | `icu_analyzer` (Unicode) |

28 languages supported. Languages without a dedicated analyzer use `icu_analyzer` for Unicode normalization.

### Index Schema

```js
{
  title:       { type: 'text', analyzer: langAnalyzer, boost: 3, fields: { raw: { type: 'keyword' } } },
  description: { type: 'text', analyzer: langAnalyzer, boost: 2 },
  body:        { type: 'text', analyzer: langAnalyzer },
  articleId:   { type: 'keyword' },
  slug:        { type: 'keyword' },
  source:      { type: 'keyword' },
  category:    { type: 'keyword' },
  region:      { type: 'keyword' },
  lang:        { type: 'keyword' },
  mood:        { type: 'keyword' },
  date:        { type: 'date' },
  embedding:   { type: 'knn_vector', dimension: 1024, method: { name: 'hnsw', engine: 'faiss' } },
}
```

Title has 3x boost, description has 2x boost for BM25 relevance.

### Hybrid Search Pipeline

**File**: `server/search/pipeline.js`

```js
export const HYBRID_PIPELINE_NAME = 'hybrid-search-pipeline';

// BM25 weight: 0.3, kNN weight: 0.7
const pipelineBody = {
  phase_results_processors: [{
    'normalization-processor': {
      normalization: { technique: 'min_max' },
      combination: {
        technique: 'arithmetic_mean',
        parameters: { weights: [0.3, 0.7] },
      },
    },
  }],
};
```

When `ENABLE_KNN=true`, search queries combine:
- BM25 text matching (30% weight)
- kNN vector similarity via Bedrock Titan Embeddings v2 (70% weight)

When `ENABLE_KNN=false`, all searches fall back to BM25-only.

### Vector Embeddings

**File**: `server/search/embeddings.js`

```js
const EMBEDDING_MODEL = 'amazon.titan-embed-text-v2:0';
const DIMENSIONS = 1024;
```

- Model: Amazon Titan Embed Text v2
- Dimensions: 1024
- Input: title repeated twice + description (title weighting via repetition)
- Max input length: 8000 characters
- Feature flag: `ENABLE_KNN=true` env var
- Region: `BEDROCK_REGION` or `AWS_REGION` or `us-east-1`

```js
export function buildEmbeddingText(title, description) {
  return `${t}. ${t}. ${d}`.trim();  // Title repeated for emphasis
}
```

## Search Indexer Lambda

**File**: `server/search/indexer.js`

### Trigger
DynamoDB Streams with filter for `PK = SITEMAP` items only. This ensures each unique article is indexed exactly once (the SITEMAP partition has one entry per article, while the article may exist in multiple category/region/city partitions).

### Processing Flow

```
DynamoDB Stream Record
    |
    +-- Skip non-SITEMAP items
    |
    +-- REMOVE event: delete from OpenSearch (TTL expiry handling)
    |
    +-- INSERT/MODIFY event:
        |
        +-- Determine language (doc.lang, default 'en')
        +-- Validate against supported languages
        +-- Ensure index exists (auto-create if missing)
        +-- Build search document (title, description, body, metadata)
        +-- Generate vector embedding (if ENABLE_KNN=true)
        +-- Index to articles-{lang}
```

### Document ID Safety
Article IDs that exceed 512 bytes are SHA-256 hashed:
```js
function safeId(id) {
  if (Buffer.byteLength(id, 'utf8') <= 512) return id;
  return createHash('sha256').update(id).digest('hex');
}
```

### Index Auto-Creation
Indexes are lazily created on first use. The `ensuredIndexes` Set caches which indexes have been verified for the Lambda container's lifetime.

## IndexNow Submissions

**File**: `server/indexnow.js`

### Protocol
IndexNow (https://www.indexnow.org/) notifies Bing, Yandex, Seznam, and Naver of new URLs for instant indexing.

### Implementation
```js
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '2e06266d797d41ad8e5a6fa3795157e6';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

export async function submitUrls(urls) {
  const payload = {
    host: new URL(SITE_URL).host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls.slice(0, 10_000),  // Max 10,000 per request
  };
  await fetch(INDEXNOW_ENDPOINT, { method: 'POST', body: JSON.stringify(payload) });
}
```

Called at the end of each ingestion run with all new article URLs in format `https://pulsenewstoday.com/news/{slug}`.

### Sitemap Pings
```js
export async function pingSitemap() {
  // Pings both Google and Bing with sitemap URLs:
  // https://www.google.com/ping?sitemap={url}
  // https://www.bing.com/ping?sitemap={url}
  // For both /api/sitemap.xml and /api/sitemap-news.xml
}
```

## Sitemap Generation

**File**: `server/sitemap/generate.js`

### Sitemap Files (stored in S3)

| File | Content | Cache |
|------|---------|-------|
| `sitemaps/daily/{date}.xml` | All articles for a specific day | 1h |
| `sitemaps/news.xml` | Last 1000 articles (Google News format) | 1h |
| `sitemaps/static.xml` | Homepage, 15 categories, 9 regions, 135+ cities, static pages | 1h |
| `sitemaps/index.xml` | Master sitemap index referencing all above | 1h |

### updateSitemaps(newArticles)

Called at the end of each ingestion run:

1. **Daily sitemap**: Read existing daily XML from S3, merge new articles (deduplicate by slug/articleId), write back
2. **News sitemap**: Query latest 1000 SITEMAP entries, generate with `<news:news>` namespace (Google News)
3. **Static sitemap**: Regenerate (idempotent -- categories, regions, cities, static pages)
4. **Index sitemap**: List all `sitemaps/daily/*.xml` in S3, build sitemap index

### Google News Sitemap Format
```xml
<url>
  <loc>https://pulsenewstoday.com/news/{slug}</loc>
  <lastmod>2026-03-23</lastmod>
  <priority>0.6</priority>
  <news:news>
    <news:publication>
      <news:name>PulseNewsToday</news:name>
      <news:language>en</news:language>
    </news:publication>
    <news:publication_date>2026-03-23T15:30:00Z</news:publication_date>
    <news:title>Article headline</news:title>
    <news:keywords>category, source, mood</news:keywords>
  </news:news>
  <image:image>
    <image:loc>https://example.com/image.jpg</image:loc>
    <image:title>Article headline</image:title>
  </image:image>
</url>
```

### Sitemap Count Utility

**File**: `server/sitemap/count.js`

```bash
node server/sitemap/count.js
```

Displays a table of URL counts across all sitemap files with a visual bar chart for daily breakdown.

## Server-Side Rendering for Bots

**File**: `server/ssr.js`

### Bot Detection
```js
export function isBot(userAgent) {
  const botPattern = /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|applebot|discordbot|.../i;
  return botPattern.test(userAgent);
}
```

### SSR Routes (in `server/app.js`)

When `isBot(req.headers['user-agent'])` is true, these routes return full HTML instead of the SPA:

| Route | Function | Content |
|-------|----------|---------|
| `/news/:slug` | `renderArticlePage(article)` | Full article with JSON-LD NewsArticle |
| `/article/*` | `renderArticlePage(article)` | Full article (legacy URL format) |
| `/` | `renderHomePage(articles)` | Homepage with article cards |
| `/category/:cat` | `renderCategoryPage(cat, articles)` | Category page with article cards |
| `/city/:city` | `renderCityPage(city, label, articles)` | City page with article cards |

### HTML Shell Structure

Each SSR page includes:
- `<meta>` tags: title, description, canonical URL
- Open Graph tags: og:title, og:description, og:type, og:url, og:image, og:site_name
- Twitter Card tags: summary_large_image
- JSON-LD structured data: NewsArticle, BreadcrumbList, WebSite (homepage)
- Semantic HTML body with article content
- Bot-detection JS that redirects non-bots to the SPA

```html
<script>
  (function() {
    var bots = /googlebot|bingbot|.../i;
    if (!bots.test(navigator.userAgent)) {
      window.location.replace('{canonicalUrl}');
    }
  })();
</script>
```

## Meta Tags and Helmet Usage

**File**: `src/pages/Category.jsx` (example)

React Helmet is used on every page for client-side meta tag management:

```jsx
<Helmet>
  <title>{`${catMeta.title} - PulseNewsToday`}</title>
  <meta name="description" content={catMeta.description} />
  <link rel="canonical" href={canonicalUrl} />
  <meta property="og:title" content={`${catMeta.title} - PulseNewsToday`} />
  <meta property="og:description" content={catMeta.description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={`${SITE_URL}/favicon.svg`} />
  <meta property="og:site_name" content="PulseNewsToday" />
  <meta name="twitter:card" content="summary_large_image" />
  <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
</Helmet>
```

## Structured Data

### NewsArticle (Article pages)
```json
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "...",
  "description": "...",
  "datePublished": "2026-03-23T15:30:00Z",
  "author": { "@type": "Person", "name": "..." },
  "publisher": { "@type": "Organization", "name": "PulseNewsToday" },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://pulsenewstoday.com/news/..." }
}
```

### BreadcrumbList (All pages)
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://pulsenewstoday.com" },
    { "@type": "ListItem", "position": 2, "name": "World News", "item": "https://pulsenewstoday.com/category/world" }
  ]
}
```

### WebSite with SearchAction (Homepage)
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "PulseNewsToday",
  "url": "https://pulsenewstoday.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://pulsenewstoday.com/search?q={search_term_string}"
    }
  }
}
```

## Share Card Generation

**File**: `server/card.js`

Generates social media share images using Satori (React-to-SVG) + Resvg (SVG-to-PNG):

```js
const FORMATS = {
  story:  { width: 1080, height: 1920 },  // Instagram Stories
  square: { width: 1080, height: 1080 },  // Instagram Post
  wide:   { width: 1200, height: 630 },   // Twitter/Facebook
};
```

Cards feature:
- Dark gradient background (#1a1a2e to #0f3460)
- Category badge with #e05d44 accent
- Article headline
- Source attribution
- PulseNewsToday branding bar
- Font: Plus Jakarta Sans (fetched from Google Fonts)

API endpoint: `GET /api/card/:slug?format=story|square|wide`
