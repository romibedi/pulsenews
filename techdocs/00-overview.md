# PulseNewsToday -- Architecture Overview

PulseNewsToday is a multilingual, AI-powered news aggregation platform that ingests articles from 650+ direct publisher RSS feeds and the GDELT Project API, enriches them with LLM analysis (Gemini Flash / Claude Haiku), generates text-to-speech audio via Edge TTS, and serves them through a React SPA backed by an Express.js API on AWS App Runner.

## System Architecture

```
                   Internet
                      |
               +--------------+
               |  CloudFront  |   <-- SSL termination, edge caching
               |  (HTTP/2+3)  |       domain: pulsenewstoday.com
               +--------------+
              /       |        \
     /audio/*    /sitemaps/*    /* (default)
         |           |              |
    +--------+  +--------+   +-----------+
    |   S3   |  |   S3   |   | App Runner|   <-- Express.js container (1 vCPU, 2 GB)
    | (audio)|  | (maps) |   |  port 8080|
    +--------+  +--------+   +-----------+
                                 |     |
                          +------+     +----------+
                          |                       |
                    +----------+           +-------------+
                    | DynamoDB |           |  OpenSearch  |
                    | (single  |           |  (articles-  |
                    |  table)  |           |   {lang})    |
                    +----------+           +-------------+
                         |                       ^
                    DDB Streams                  |
                         |               +---------------+
                         +-------------->| Search Indexer |
                                         |   (Lambda)    |
                                         +---------------+

   +--------------------+
   | Ingestion Lambda   |   <-- EventBridge triggers every 15 min
   | (15-min timeout)   |
   +--------------------+
         |      |      |
    RSS feeds  GDELT  Gemini/Haiku AI
         |      |      |
    DynamoDB  S3 (TTS)  IndexNow + Sitemaps
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, React Router 6, Tailwind CSS 3 | SPA with SSR for bots |
| **API Server** | Express.js 4 on Node 20 | REST API, SSR, TTS proxy |
| **Database** | DynamoDB (single-table, PAY_PER_REQUEST) | Article storage, 90-day TTL |
| **Search** | OpenSearch 2.13 + Bedrock Titan Embeddings v2 | Multilingual full-text + hybrid kNN search |
| **AI/LLM** | Gemini 2.5 Flash (primary), Claude Haiku 4.5 (fallback) | Sentiment, entities, honest headlines, predictions |
| **TTS** | Edge TTS (edge-tts-universal) | 40+ language voice generation |
| **Storage** | S3 (pulsenews-audio-{env}) | Pre-generated MP3 audio, sitemaps |
| **CDN** | CloudFront (HTTP/2+3, PriceClass_100) | SSL, caching, audio/sitemap serving |
| **Compute** | App Runner (1 vCPU / 2 GB, 1-3 instances) | API container |
| **Compute** | Lambda (Node 20, ARM64) | Ingestion (512 MB), Search indexer (256 MB) |
| **Scheduling** | EventBridge | 15-minute ingestion cadence |
| **SEO** | IndexNow, Google/Bing sitemap pings | Instant indexing for new articles |
| **IaC** | Terraform | All infra defined in `infra/` |
| **Mobile** | Capacitor 8 (iOS + Android) | Native app wrappers |

## Key Services and How They Connect

### 1. Ingestion Pipeline (Lambda, every 15 min)
- `server/ingest/handler.js` fetches all RSS feeds via `buildFeedContextMap()` (10 concurrent)
- Also queries GDELT API for articles across categories, regions, and languages
- Each article: full-text extraction -> AI analysis -> DynamoDB multi-partition write -> TTS generation -> IndexNow submission -> sitemap update

### 2. API Server (App Runner)
- `server/app.js` serves REST endpoints (`/api/feeds`, `/api/regional-feeds`, `/api/lang-feeds`, `/api/city-feeds`, `/api/search`, `/api/archive`, etc.)
- Reads from DynamoDB and OpenSearch
- Falls back to live RSS fetch if DynamoDB has no data
- SSR rendering for bot crawlers (`server/ssr.js`)
- Serves the Vite-built React SPA from `/public`

### 3. Search Indexer (Lambda, DynamoDB Streams)
- `server/search/indexer.js` triggered by DynamoDB Streams
- Filters for `PK = SITEMAP` items only (one per unique article)
- Routes to per-language OpenSearch index (e.g., `articles-en`, `articles-hi`)
- Generates vector embeddings via Bedrock Titan Embeddings v2

### 4. Frontend (React SPA)
- Category/Region/City/Article pages with interleaved content breaks
- Audio player with queue, speed control, sleep timer, download
- Language switching (40+ languages)
- Dark/light theme, mobile bottom tab bar

## Deployment Model

- **Terraform** (`infra/`) manages all AWS resources
- **Docker** multi-stage build: Vite frontend build -> Express production server
- **App Runner** pulls from ECR, auto-scales 1-3 instances
- **CloudFront** sits in front with custom cache policies:
  - `/assets/*` -> long cache (Vite content-hashed)
  - `/audio/*` -> S3 origin, long cache (90 days)
  - `/sitemaps/*` -> S3 origin, 1h cache
  - `/*` (default) -> App Runner, respect origin Cache-Control
- **Cross-account DNS**: Route53 hosted zone with apex + www ALIAS records to CloudFront

## Key File Paths

| File | Purpose |
|------|---------|
| `server/app.js` | Express routes and API endpoints |
| `server/server.js` | Production entrypoint (port 8080) |
| `server/ingest/handler.js` | Ingestion Lambda handler |
| `server/ingest/gdelt.js` | GDELT API integration |
| `server/shared/feeds/index.js` | Feed registry + buildFeedContextMap() |
| `server/db.js` | DynamoDB client and queries |
| `server/rss.js` | RSS parsing utilities |
| `server/tts/generate.js` | Edge TTS audio generation |
| `server/search/indexer.js` | DynamoDB Streams -> OpenSearch Lambda |
| `server/search/mappings.js` | Per-language OpenSearch index definitions |
| `server/ssr.js` | Server-side rendering for bots |
| `server/sitemap/generate.js` | S3 sitemap generation |
| `server/admin.js` | Admin dashboard API |
| `src/App.jsx` | React app root with routing |
| `src/pages/Category.jsx` | Category page with interleaved layout |
| `src/utils/articleHelpers.js` | Smart content helpers (clusters, pullquotes, polls) |
| `infra/` | Terraform infrastructure definitions |
