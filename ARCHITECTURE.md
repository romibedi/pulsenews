# PulseNewsToday - Architecture Document

## Overview

PulseNewsToday is a serverless news aggregator that ingests 99+ RSS feeds across 9 regions, 8 categories, and 16 languages into DynamoDB, and serves them through a React frontend with AI summaries, text-to-speech, and geo-localized content.

---

## System Architecture

```
                    ┌─────────────────────────────────────────────────────┐
                    │                  FRONTEND                           │
                    │         React 19 + Vite 8 + Tailwind               │
                    │                                                     │
                    │  Pages: Home, Article, Category, Region, Search,    │
                    │         Bookmarks, CustomFeeds, About               │
                    │                                                     │
                    │  Features: TTS, AI Summary, Bookmarks, Dark Mode,  │
                    │            16 Languages, 9 Regions, Reactions       │
                    └─────────────┬───────────────────────────────────────┘
                                  │ /api/*
                                  ▼
                    ┌─────────────────────────────────────────────────────┐
                    │              API GATEWAY + LAMBDA                    │
                    │         Express.js (serverless-express)              │
                    │                                                     │
                    │  Feed Routes:                                       │
                    │    GET /api/feeds?category=X                        │
                    │    GET /api/regional-feeds?region=X&category=Y      │
                    │    GET /api/lang-feeds?lang=X                       │
                    │    GET /api/local?region=X                          │
                    │                                                     │
                    │  Article Routes:                                    │
                    │    GET /api/article/:id                             │
                    │    GET /api/article/slug/:slug                      │
                    │    GET /api/extract?url=X                           │
                    │                                                     │
                    │  AI & Media:                                        │
                    │    POST /api/summarize (Claude Haiku)               │
                    │    POST /api/tts (Edge TTS, 16 languages)           │
                    │    GET /api/stocks (CoinGecko)                      │
                    │                                                     │
                    │  SEO:                                               │
                    │    GET /api/sitemap.xml                             │
                    └──────┬──────────────────┬───────────────────────────┘
                           │                  │
              ┌────────────▼──────┐   ┌───────▼────────────────┐
              │    DynamoDB       │   │   RSS Feeds (fallback) │
              │ pulsenews-articles│   │   99+ feed URLs        │
              │                   │   │   BBC, NPR, Al Jazeera │
              │ PK/SK design      │   │   Times of India, etc. │
              │ 90-day TTL        │   └────────────────────────┘
              │ 2 GSIs            │
              └────────▲──────────┘
                       │
          ┌────────────┴──────────────────────────────────────────┐
          │            INGESTION LAMBDA                            │
          │     EventBridge: every 15 minutes                     │
          │                                                       │
          │  1. buildFeedContextMap() → 99 unique feed URLs       │
          │  2. Fetch RSS (10 concurrent)                         │
          │  3. Deduplicate (articleId-index)                     │
          │  4. Extract full text (@extractus/article-extractor)  │
          │  5. Write to DynamoDB (all relevant PK partitions)    │
          │  6. TTL = now + 90 days                              │
          └───────────────────────────────────────────────────────┘
```

---

## DynamoDB Schema

### Table: `pulsenews-articles`

| Property | Value |
|----------|-------|
| Billing | PAY_PER_REQUEST (on-demand) |
| Primary Key | PK (HASH) + SK (RANGE) |
| TTL Attribute | `ttl` (90-day auto-expiry) |
| GSI 1 | `articleId-index` (articleId HASH, date RANGE) |
| GSI 2 | `slug-index` (slug HASH, date RANGE) |

### Partition Key Design

The **PK** determines which "view" of the data you're querying. The **SK** is always `ISO_DATE#ARTICLE_ID`, so items within each partition are automatically sorted newest-first.

```
PK Format                              Example
─────────────────────────────────────   ─────────────────────────────
GLOBAL#CAT#<category>                   GLOBAL#CAT#world
REGION#<region>                         REGION#india
REGION#<region>#CAT#<category>          REGION#india#CAT#technology
LANG#<lang>                             LANG#hi
SITEMAP                                 SITEMAP
```

### How Date-wise Ordering Works

```
PK = "GLOBAL#CAT#world"
SK = "2026-03-18T04:36:46.000Z#rss-abc123"   ← newest
SK = "2026-03-18T04:15:54.000Z#rss-def456"
SK = "2026-03-18T03:30:00.000Z#rss-ghi789"
SK = "2026-03-17T22:10:00.000Z#rss-jkl012"   ← oldest
```

The SK starts with an ISO timestamp, so DynamoDB stores items in chronological order by default. Querying with `ScanIndexForward: false` returns newest articles first — a single key lookup, no scanning or sorting needed.

### Denormalization (One Article → Multiple PK Partitions)

A single BBC World article gets written to multiple partitions during ingestion:

```
Article: "Death of Ali Larijani deepens crisis..."
  → PK: GLOBAL#CAT#world          (global world news)
  → PK: REGION#middle-east#CAT#world  (Middle East regional)
  → PK: REGION#asia#CAT#world     (Asia regional)
  → PK: SITEMAP                   (SEO sitemap entry)
```

This means **4 DynamoDB items for 1 article**, but each query is a fast single-partition read. No joins, no table scans.

### Item Schema

```javascript
{
  // Keys
  PK:          "GLOBAL#CAT#world",
  SK:          "2026-03-18T04:36:46.000Z#rss-abc123",

  // Article data
  articleId:   "rss-aHR0cHM6Ly93d3cuYm...",   // base64url of source URL
  slug:        "2026-03-18-death-of-ali-larijani-deepens-crisis",
  title:       "Death of Ali Larijani deepens crisis...",
  description: "Larijani has long been seen as...",
  body:        "Full extracted article text...",      // up to 2000 chars
  image:       "https://ichef.bbci.co.uk/...",
  author:      "BBC News",
  date:        "2026-03-18T04:36:46.000Z",           // pubDate from RSS
  url:         "https://www.bbc.com/news/...",        // original source URL

  // Classification
  source:      "BBC News",
  section:     "BBC News",
  sectionId:   "bbc-news",
  region:      "global",
  category:    "world",
  lang:        "en",
  tags:        [],
  isExternal:  true,

  // Lifecycle
  ttl:         1781585927,                            // Unix epoch (June 16, 2026)
  createdAt:   "2026-03-18T04:58:47.479Z",
}
```

### Current Data Distribution

```
┌──────────────────────────────────────────────────────┬───────┐
│ Partition Key (PK)                                   │ Items │
├──────────────────────────────────────────────────────┼───────┤
│ GLOBAL CATEGORIES                                    │       │
│   GLOBAL#CAT#world                                   │    87 │
│   GLOBAL#CAT#technology                              │    50 │
│   GLOBAL#CAT#business                                │    58 │
│   GLOBAL#CAT#sport                                   │    62 │
│   GLOBAL#CAT#science                                 │    42 │
│   GLOBAL#CAT#culture                                 │    42 │
│   GLOBAL#CAT#environment                             │    32 │
│   GLOBAL#CAT#politics                                │    61 │
├──────────────────────────────────────────────────────┼───────┤
│ REGIONAL (9 regions × 8 partitions each)             │       │
│   REGION#india (+ 7 categories)                      │ 2,307 │
│   REGION#uk (+ 7 categories)                         │   558 │
│   REGION#us (+ 7 categories)                         │   241 │
│   REGION#australia (+ 7 categories)                  │   451 │
│   REGION#europe (+ 7 categories)                     │   345 │
│   REGION#middle-east (+ 7 categories)                │   309 │
│   REGION#africa (+ 7 categories)                     │   335 │
│   REGION#asia (+ 7 categories)                       │   208 │
│   REGION#latam (+ 7 categories)                      │   268 │
├──────────────────────────────────────────────────────┼───────┤
│ LANGUAGES (15 languages)                             │       │
│   LANG#hi (Hindi)                                    │    62 │
│   LANG#de (German)                                   │   113 │
│   LANG#es (Spanish)                                  │   231 │
│   LANG#fr (French)                                   │    64 │
│   LANG#bn (Bengali)                                  │    85 │
│   LANG#mr (Marathi)                                  │    96 │
│   LANG#ta (Tamil)                                    │    55 │
│   LANG#ar (Arabic)                                   │    32 │
│   LANG#ja (Japanese)                                 │    45 │
│   LANG#zh (Chinese)                                  │    38 │
│   LANG#sw (Swahili)                                  │    44 │
│   LANG#pt (Portuguese)                               │    30 │
│   LANG#te (Telugu)                                   │    24 │
│   LANG#ko (Korean)                                   │    22 │
│   LANG#ur (Urdu)                                     │    22 │
├──────────────────────────────────────────────────────┼───────┤
│ SITEMAP                                              │ 4,085 │
├──────────────────────────────────────────────────────┼───────┤
│ TOTAL                                                │10,610 │
└──────────────────────────────────────────────────────┴───────┘
```

---

## Data Flow

### 1. Ingestion Pipeline (Every 15 Minutes)

```
EventBridge (rate: 15 min)
    │
    ▼
Lambda: ingest/handler.js (512MB, 300s timeout)
    │
    ├─ buildFeedContextMap()
    │   → Deduplicates 99 unique URLs from 4 feed registries
    │   → Each URL carries array of "contexts" (global/region/lang)
    │
    ├─ For each feed URL (10 concurrent):
    │   ├─ Fetch RSS XML
    │   ├─ parseRssFeed() → extract title, description, link, pubDate, image
    │   └─ For each article:
    │       ├─ articleExists() → skip if already in DB (dedup)
    │       ├─ extractArticleContent(url) → full text (10s timeout)
    │       ├─ generateSlug(title, date) → SEO slug
    │       ├─ Build items for ALL context PKs + SITEMAP
    │       └─ batchWriteArticles() → DynamoDB (25 items/batch)
    │
    └─ Log: ingested=144, skipped=4183, feedErrors=0
```

### 2. API Request Flow (DynamoDB-first, RSS Fallback)

```
Frontend: GET /api/feeds?category=technology
    │
    ▼
Lambda: app.js
    │
    ├─ Try DynamoDB: queryByGlobalCategory('technology', 20)
    │   └─ Query: PK = "GLOBAL#CAT#technology", ScanIndexForward=false, Limit=20
    │   └─ If results > 0 → return (fast, ~5ms)
    │
    └─ Fallback: Live RSS fetch
        ├─ Fetch BBC Tech, NPR Tech, Ars Technica feeds
        ├─ Parse + sort by date
        └─ Return (slower, ~2-5s)
```

### 3. Article Detail Flow

```
User clicks article card
    │
    ├─ Has article in router state? → Display immediately
    │   └─ Background: fetch(/api/extract?url=X) → enrich body
    │
    └─ No state (direct URL visit):
        ├─ /news/:slug → GET /api/article/slug/:slug (DynamoDB)
        ├─ /article/:id → GET /api/article/:id (DynamoDB)
        └─ Fallback → scan all category RSS feeds
```

---

## Feed Architecture

### Feed Registry (server/shared/feedRegistry.js)

Single source of truth for all RSS feed URLs used by both the API server and ingestion Lambda.

| Registry | Count | Purpose |
|----------|-------|---------|
| FEEDS | 8 categories, ~20 URLs | Global category feeds (BBC, NPR, Ars Technica) |
| REGIONAL_FEEDS | 9 regions, ~30 URLs | Regional headline feeds |
| REGIONAL_CATEGORY_FEEDS | 9 regions × 7 categories, ~150 URLs | Region + category specific |
| LANG_FEEDS | 15 languages, ~40 URLs | Non-English language feeds |

### Feed Deduplication

`buildFeedContextMap()` merges all 4 registries into a single Map:
- **Key**: feed URL (deduplicated)
- **Value**: `{ source, contexts[] }` where contexts describe all PK partitions

Example: Al Jazeera (`aljazeera.com/xml/rss/all.xml`) appears in:
- `GLOBAL#CAT#world` (global world)
- `REGION#middle-east` (Middle East general)
- `REGION#middle-east#CAT#world` (Middle East world)
- `REGION#middle-east#CAT#politics` (Middle East politics)
- `REGION#africa` (Africa general)
- `REGION#asia` (Asia general)
- `REGION#latam#CAT#world` (Latin America world)

**Result**: 99 unique URLs fetched once, articles written to 174+ PK partitions.

---

## Infrastructure (AWS SAM)

### Resources

| Resource | Type | Config |
|----------|------|--------|
| PulseNewsArticles | DynamoDB Table | PAY_PER_REQUEST, 2 GSIs, TTL enabled |
| PulseNewsApi | Lambda (Node 20, arm64) | 256MB, 30s, DynamoDBReadPolicy |
| PulseNewsIngest | Lambda (Node 20, arm64) | 512MB, 300s, DynamoDBCrudPolicy, rate(15 min) |

### IAM Strategy

All tables use `pulsenews-*` naming convention for simple IAM wildcard policies:
- API Lambda: `DynamoDBReadPolicy` (read-only)
- Ingestion Lambda: `DynamoDBCrudPolicy` (full CRUD)

---

## Frontend Architecture

```
src/
├── App.jsx                    # Router + Context Providers
├── api/newsApi.js             # API client (sessionStorage cache, 30min TTL)
├── pages/
│   ├── Home.jsx               # Hero + regional sections + language switch
│   ├── Article.jsx            # Full article (DynamoDB/RSS, AI summary, TTS)
│   ├── Category.jsx           # Category feed with loading states
│   ├── Region.jsx             # Regional news + "Set as my region"
│   ├── Search.jsx             # Client-side search across categories
│   ├── Bookmarks.jsx          # Saved articles (localStorage)
│   └── CustomFeeds.jsx        # User-added RSS feeds
├── components/
│   ├── NewsCard.jsx           # Article card (featured + grid variants)
│   ├── AudioPlayer.jsx        # Global TTS player + queue
│   ├── AISummary.jsx          # Claude Haiku summaries
│   ├── BreakingNewsTicker.jsx # Scrolling headline ticker
│   ├── ShareButtons.jsx       # Social sharing (X, WhatsApp, email)
│   ├── Reactions.jsx          # Emoji reactions (localStorage)
│   └── Navbar.jsx             # Header with region/language selectors
├── contexts/
│   ├── AudioContext.jsx       # Web Speech API TTS (16 languages)
│   ├── BookmarkContext.jsx    # localStorage bookmark management
│   └── ThemeContext.jsx       # Dark/light mode
└── hooks/
    ├── useLanguage.jsx        # 16 languages + UI translations
    ├── useRegion.js           # IP-based region detection + manual picker
    └── useLocalStorage.js     # Persistent state with same-tab sync
```

### Key Design Decisions

- **TTS**: Browser Web Speech API for instant playback (no server round-trip)
- **Language switching**: Keep current content visible at 40% opacity during fetch
- **Article body**: Smart paragraph splitting (newlines first, then 3-sentence chunks)
- **Bookmarks**: Strip article body before saving to localStorage (save space)
- **Region sync**: Custom `localstorage-sync` event for same-tab reactivity

---

## Dev vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| Frontend | Vite dev server (HMR) | Vite build → S3/CloudFront |
| API | Vite middleware (in-process) | API Gateway → Lambda |
| Data source | Live RSS (real-time) | DynamoDB first, RSS fallback |
| DynamoDB | Not used | Primary data store |
| Ingestion | Manual (`node ingest/handler.js`) | EventBridge every 15 min |
| TTS | Edge TTS + Web Speech API | Edge TTS + Web Speech API |
| AI Summary | Claude API (from .env) | Claude API (from SAM param) |

---

## 90-Day Data Lifecycle

```
Day 0:   Article ingested → written to DynamoDB (all PK partitions)
         ttl = now + 90 days (Unix epoch seconds)

Day 1-89: Article served from DynamoDB (fast reads)
          Available via: category feeds, region feeds, language feeds,
          direct URL (/article/:id, /news/:slug), sitemap.xml

Day 90:  DynamoDB TTL service deletes the item automatically
         No cron job, no cleanup code needed
         Article disappears from all feeds and sitemap
```
