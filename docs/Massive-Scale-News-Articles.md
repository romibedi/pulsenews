# Scaling PulseNewsToday to Millions of Articles

## Current State (March 2026)

| Metric | Current |
|---|---|
| RSS feeds | ~422 |
| Unique articles | 14,235 |
| Ingestion frequency | Every 15 min (EventBridge → Lambda) |
| Daily new articles | ~3,500/day |
| Monthly projection | ~100k/month |
| Architecture | DynamoDB + S3 + CloudFront + App Runner |

At current rate: **100k in ~1 month**, **1M in ~10 months** organically.

---

## The 3 Levers to Scale

### 1. More Sources (Biggest Impact)

We have 422 feeds. Google News indexes 50,000+ publishers.

#### Aggregator APIs (fastest path to volume)

| Service | Volume | Cost | Notes |
|---|---|---|---|
| GDELT Project | 1000s of articles every 15 min | Free | 100+ countries, 65 languages |
| NewsAPI.org | 10k-100k articles/day | $50-300/mo | 50k+ sources |
| Newscatcher API | Similar scale | $100-500/mo | Good for non-English |
| TheNewsAPI | 10k+/day | $50-200/mo | Good category coverage |
| MediaStack | 5k+/day | Free tier available | Simpler API |
| Currents API | 5k+/day | Free tier available | Keyword-based |
| Common Crawl News | ~500k articles/day | Free (S3 dataset) | Batch import, all major publishers |

#### Programmatic RSS Discovery

- Scrape `/feed`, `/rss`, `/atom.xml`, `/feed.xml` from top 10k news sites (Tranco list)
- Auto-discover feeds from `<link rel="alternate" type="application/rss+xml">` in HTML
- Each discovered site adds 1-5 feeds

#### Regional Expansion

**India (1000+ news sites with RSS):**
- Hindi: Dainik Bhaskar, Amar Ujala, Navbharat Times, Dainik Jagran, Hindustan
- Tamil: Dinamalar, Dinamani, Tamil Murasu
- Telugu: Eenadu, Sakshi, Andhra Jyothy
- Kannada: Prajavani, Vijaya Karnataka, Udayavani
- Malayalam: Mathrubhumi, Manorama, Madhyamam
- Bengali: Anandabazar, Bartaman, Sangbad Pratidin
- Marathi: Loksatta, Maharashtra Times, Lokmat
- Gujarati: Gujarat Samachar, Divya Bhaskar, Sandesh

**Africa:**
- AllAfrica.com, The East African, Daily Nation (Kenya), Punch (Nigeria), TimesLIVE (SA)
- 50+ countries, most have 2-5 RSS-enabled outlets

**Latin America:**
- Folha (Brazil), El Universal (Mexico), Clarin (Argentina), El Mercurio (Chile)
- Spanish/Portuguese feeds for 20+ countries

**Europe:**
- Deutsche Welle, France24, ANSA (Italy), EFE (Spain), PAP (Poland)
- Each EU country has 5-10 major outlets with RSS

**Middle East:**
- Al Arabiya, Gulf News, The National, Daily Sabah, Haaretz

**Asia:**
- Straits Times (SG), Bangkok Post, Japan Times, Yonhap (Korea), Xinhua

Each country/region adds 20-50 feeds = **1000-2500 more feeds with no code changes** (just expand `feedRegistry.js`).

---

### 2. Faster & Parallel Ingestion

Current: single Lambda processes 422 feeds serially every 15 minutes.

#### Fan-Out Architecture (for 5,000+ feeds)

```
EventBridge (every 5-15 min)
  → Dispatcher Lambda
    → SQS Queue (one message per feed URL)
      → Worker Lambdas (10-50 concurrent)
        → Each processes 1 feed
        → Writes to DynamoDB
        → Triggers sitemap update
```

**Benefits:**
- 10x-50x faster ingestion (parallel)
- Individual feed failures don't block others
- Auto-scales with feed count
- DLQ for failed feeds (retry later)

#### Frequency Tiers

| Tier | Frequency | Feeds | Rationale |
|---|---|---|---|
| Breaking | Every 5 min | Top 50 sources (BBC, Reuters, AP) | Breaking news speed |
| Standard | Every 15 min | 500 regular sources | Current behavior |
| Long-tail | Every 30-60 min | 5000+ smaller sources | Volume, not speed |

#### DynamoDB Scaling

- Switch to on-demand capacity mode (auto-scales with ingestion spikes)
- Consider DynamoDB Global Tables if expanding to multiple AWS regions
- Current single-table design handles millions of items — no schema changes needed

---

### 3. Content Beyond RSS

RSS alone caps out at ~5k-10k publishers. To go further:

#### Sitemap Crawling

- Read other news sites' sitemaps (public, encouraged by publishers)
- Extract article URLs, scrape content with article-extractor
- Discover 10x more articles than RSS alone
- Many sites publish sitemaps but not RSS feeds

#### Social Monitoring

- Twitter/X Lists of journalist accounts and news orgs
- Reddit news subreddits (r/worldnews, r/technology, etc.)
- News breaks on social 10-30 minutes before RSS

#### Wire Services & Press Releases

- PR Newswire, Business Wire, GlobeNewswire — all have APIs/feeds
- Government press releases (whitehouse.gov, parliament.uk, pib.gov.in)
- Regulatory filings (SEC, RBI, FCA)

#### Partnerships

- Contact publishers directly for content licensing
- Google News Publisher Center model — publishers submit their content
- Offer traffic/backlinks in exchange for feed access

---

## Scaling Roadmap

| Timeline | Target | Action |
|---|---|---|
| **Now → Month 1** | 50k articles | Add 500 more RSS feeds (regional India, EU, Africa, LATAM) |
| **Month 1-2** | 200k articles | Integrate 1-2 aggregator APIs (NewsAPI, Newscatcher) |
| **Month 2-3** | 500k articles | Fan-out Lambda architecture, 5-min ingestion for top sources |
| **Month 3-6** | 1M+ articles | Sitemap crawling of top 1000 news sites, Common Crawl import |
| **Month 6-12** | 5M+ articles | Full crawl infrastructure, press wires, social monitoring |

---

## Infrastructure Notes

**What scales without changes:**
- DynamoDB — handles millions of items, on-demand mode auto-scales
- S3 — unlimited storage for sitemaps, audio, assets
- CloudFront — CDN handles any traffic level
- Sitemap generator — auto-splits at 50k URLs per file (Google's limit)

**What needs attention at scale:**
- Lambda concurrency limits (default 1000, request increase)
- DynamoDB write throughput (switch to on-demand if not already)
- OpenSearch cluster sizing (more shards/replicas for millions of docs)
- TTS generation queue (at 91% coverage now, will need parallel generation)
- S3 costs for audio files (consider lifecycle policies for old audio)

---

## Highest ROI Move Right Now

**Expand `feedRegistry.js` with 500 more RSS feeds.** No code changes, no architecture changes, no API costs. Just research and add feeds from regional publishers across India, Africa, LATAM, and Europe. That alone gets us from 14k to 50k articles within a month.

---

## Infrastructure at 5M Articles — Service-by-Service Scaling Analysis

Current system processes ~3,500 articles/day. At 5M total articles (reached in ~10-12 months), daily ingestion will be 15,000-50,000 articles/day depending on source expansion pace.

### Current Configuration Baseline

| Service | Current Config | Articles Handled |
|---|---|---|
| Feed Ingestion | 10 concurrent feeds, single Lambda | 422 feeds, ~3,500/day |
| TTS (Edge TTS) | 20 concurrent, 30s timeout, MP3 | 91% coverage (~13k files) |
| OpenSearch | 21 lang indexes, 1 shard/0 replicas each | ~14k docs |
| LLM (Claude Haiku) | 1 mood call/article during ingestion | ~3,500 calls/day |
| Embeddings (Titan v2) | 1024-dim, 5 concurrent, gated by ENABLE_KNN | ~14k vectors |
| DynamoDB | Single table, 2.7 copies/article, 2 GSIs | ~38k rows |
| S3 | Audio + sitemaps in `pulsenews-audio-prod` | ~13k MP3 files |

---

### 1. Audio TTS (Edge TTS → S3)

**Current:** `edge-tts-universal` with 20 concurrent workers, 30s timeout, 16 voice languages, ~2000 chars/article, rate +20%.

**At 5M articles:**

| Metric | Current | At 5M |
|---|---|---|
| Total audio files | ~13k | ~4.5M (90% coverage) |
| Daily TTS generation | ~3,200/day | 13,500-45,000/day |
| S3 storage | ~6.5 GB (est. ~500KB avg) | ~2.25 TB |
| S3 storage cost | ~$0.15/mo | ~$52/mo |
| Generation time (20 concurrent) | ~8 min/run | ~35-110 min/run |

**What breaks:**
- Single Lambda with 20 concurrent TTS will take 1-2 hours per ingestion run at 50k articles/day — overlaps with next 15-min trigger
- S3 storage costs grow linearly but stay manageable (~$52/mo at 5M)
- Edge TTS is free (Microsoft Edge service) — no API cost scaling concern

**What to change:**
- **Fan-out TTS to SQS + worker Lambdas** — DynamoDB Streams triggers a TTS queue, separate pool of 50-100 worker Lambdas each generating 1 article's audio. Completes in minutes instead of hours.
- **S3 lifecycle policy** — Move audio files older than 90 days to S3 Infrequent Access ($0.0125/GB vs $0.023/GB), saving ~45% on storage.
- **Skip TTS for low-value articles** — Only generate audio for articles with >100 words or from Tier 1/2 sources. Reduces volume by ~20%.
- **Estimated cost at 5M:** ~$30/mo S3 (with lifecycle) + $0 TTS API + ~$15/mo Lambda compute = **~$45/mo**

---

### 2. OpenSearch (BM25 Text Search Only)

**Current:** 21 language indexes, 1 shard / 0 replicas each, BM25 full-text search only (kNN disabled).

**At 5M articles:**

| Metric | Current | At 5M |
|---|---|---|
| Total indexed docs | ~14k | ~5M |
| Index size (text only) | ~30 MB est. | ~8-12 GB |
| Query latency | <50ms | 50-150ms (with proper sharding) |

Without kNN vectors, OpenSearch footprint is **dramatically smaller** — no 1024-dim float32 vectors, no HNSW graph in memory. Pure BM25 text indexes are lightweight.

**What breaks:**
- **Single shard per index** — at 5M docs, the `articles-en` index alone will have 2-3M documents. A single shard should hold max ~500k-1M docs for good performance.
- **0 replicas** — no fault tolerance, no read scaling. Every search hits the same single node.

**What to change:**

| Change | Why |
|---|---|
| **2-3 shards for `articles-en`**, 1-2 for other large indexes | Distribute load, enable parallel search |
| **1 replica per shard** | Fault tolerance + 2x read throughput |
| **Upgrade to r6g.medium.search (2 nodes)** | Enough for BM25-only — no large RAM needed for vector graphs |
| **UltraWarm for old articles** | Move articles >30 days to warm storage (1/10th cost) |
| **Index lifecycle (ISM) policy** | Auto-rollover indexes monthly, delete/archive after 1 year |

**Estimated cost at 5M:**
- 2× r6g.medium.search data nodes: ~$140/mo
- UltraWarm (optional): ~$100/mo
- EBS storage (30GB gp3): ~$8/mo
- **Total: ~$150-250/mo** (vs ~$70-100/mo now)

---

### 3. LLM Calls (Claude Haiku 4.5)

**Current usage per article during ingestion:**

| Call | When | Input | Output | Cost/article |
|---|---|---|---|---|
| Mood classification | Every ingested article | ~600 tokens (title + 500 chars) | ~5 tokens (one word) | ~$0.00006 |

**User-triggered calls (server/app.js):**

| Endpoint | Input | Output | Cost/call |
|---|---|---|---|
| /api/summarize | ~1000 tokens | ~200 tokens | ~$0.00013 |
| /api/rewrite (expert) | ~1000 tokens | ~500 tokens | ~$0.00020 |
| /api/voice-query | ~2000 tokens (multi-article) | ~600 tokens | ~$0.00035 |
| Story thread summary | ~1500 tokens (multi-title) | ~200 tokens | ~$0.00018 |

**At 5M articles:**

| Metric | Current | At 5M |
|---|---|---|
| Ingestion mood calls/day | ~3,500 | 15,000-50,000 |
| Daily mood cost | ~$0.21 | ~$0.90-$3.00 |
| Monthly mood cost | ~$6.30 | ~$27-$90 |
| User-triggered calls | Low (early stage) | Scales with traffic, not articles |

**What breaks:** Nothing! Haiku is extremely cheap. Even at 50k articles/day, mood classification costs ~$3/day.

**What to consider at scale:**
- **Batch mood classification** — Send 5-10 titles in one prompt, classify all at once. Reduces API calls by 5-10x and saves on per-request overhead.
- **Cache user-triggered calls** — If 100 users summarize the same article, cache the result. DynamoDB or ElastiCache.
- **Add more LLM features cheaply:**
  - Auto-tagging (topics, entities, sentiment) — ~$0.0001/article
  - Auto-summarization at ingestion — ~$0.0002/article
  - Headline rewriting — ~$0.0001/article
  - At 50k/day, all combined: ~$7/day = **~$210/mo**
- **Estimated cost at 5M (ingestion only):** **~$30-90/mo**
- **Estimated cost with expanded features:** **~$200-300/mo**

---

### 4. Embeddings (Disabled — kNN Off)

**Current:** `ENABLE_KNN` is off. No Bedrock Titan embedding calls, no vector storage.

**Cost at any scale:** **$0/mo**

**If re-enabled in future:** Bedrock Titan v2 is cheap (~$0.10/1M tokens). At 50k articles/day it would add ~$15-30/mo. The main cost driver would be OpenSearch instance sizing for HNSW graphs, not the embedding generation itself.

---

### 5. DynamoDB

**Current:** Single table, ~2.7 items per article (GLOBAL#CAT, REGION#CAT, LANG#, CITY#, SITEMAP), 2 GSIs (articleId-index, slug-index), 90-day TTL.

**At 5M articles:**

| Metric | Current | At 5M |
|---|---|---|
| Total items | ~38k | ~13.5M (5M × 2.7) |
| Table size | ~50 MB est. | ~15-20 GB |
| Write throughput (ingestion) | ~400 WCU burst | ~2000-5000 WCU burst |
| Read throughput | Low (App Runner queries) | Scales with user traffic |
| Monthly cost (on-demand) | ~$5-10 | ~$50-100 |

**What breaks:** Nothing fundamental. DynamoDB is built for this scale.

**What to change:**
- **Switch to on-demand capacity** (if not already) — Auto-scales with ingestion spikes, no need to pre-provision.
- **Monitor hot partitions** — `GLOBAL#CAT#world` and `GLOBAL#CAT#technology` will get the most writes. DynamoDB's adaptive capacity handles this, but monitor via CloudWatch.
- **GSI throughput** — The `articleId-index` and `slug-index` GSIs replicate every write. At 50k articles/day × 2.7 copies = 135k writes/day to main table + GSI overhead. Still well within DynamoDB limits.
- **TTL cleanup** — 90-day TTL means the table self-prunes. At steady state with 90-day TTL and 50k/day: table holds ~4.5M articles max.
- **Estimated cost at 5M:** **~$50-100/mo** (on-demand)

---

### 6. Lambda (Ingestion + TTS + Indexing)

**Current:** Single ingestion Lambda (10 concurrent feeds), TTS inline (20 concurrent), OpenSearch indexing via DynamoDB Streams.

**At 5M / 50k articles per day:**

| Metric | Current | At 5M |
|---|---|---|
| Lambda invocations/day | ~96 (every 15 min) | ~50,000+ (fan-out) |
| Avg duration | ~3-5 min | ~10-30s (per-feed worker) |
| Monthly Lambda cost | ~$5 | ~$30-50 |
| Concurrent executions | 1 | 50-100 peak |

**What to change:**
- **Fan-out architecture** (detailed in Lever #2 above) — Dispatcher Lambda + SQS + Worker Lambdas
- **Separate TTS into its own Lambda pool** — Triggered by DynamoDB Streams or SQS, independent scaling
- **Request concurrency increase** — Default 1000 concurrent, request 3000-5000 via AWS support
- **Estimated cost at 5M:** **~$40-60/mo**

---

### 7. S3 + CloudFront

**Current:** Audio files + sitemaps in `pulsenews-audio-prod`, CloudFront CDN.

**At 5M articles:**

| Metric | Current | At 5M |
|---|---|---|
| S3 storage (audio) | ~6.5 GB | ~2.25 TB |
| S3 storage (sitemaps) | ~20 MB | ~500 MB (100+ daily files) |
| S3 cost | ~$0.20/mo | ~$55/mo |
| CloudFront | Minimal | Scales with traffic |
| Data transfer | Minimal | Depends on user traffic |

**What to change:**
- **S3 Intelligent-Tiering or lifecycle policies** — Old audio auto-moves to cheaper storage
- **CloudFront caching** — Already in place, no changes needed
- **Estimated cost at 5M:** **~$35-55/mo** (with lifecycle policies)

---

### Total Monthly Cost Projection at 5M Articles

| Service | Current (~14k) | At 5M Articles |
|---|---|---|
| DynamoDB | ~$10 | ~$75 |
| OpenSearch (BM25 only) | ~$80 | ~$200 |
| Lambda (ingestion + TTS) | ~$10 | ~$60 |
| S3 + CloudFront | ~$5 | ~$50 |
| LLM (Claude Haiku) | ~$8 | ~$60 (mood only) / ~$250 (expanded) |
| Embeddings (Bedrock Titan) | $0 (disabled) | $0 (disabled) |
| App Runner | ~$25 | ~$50 (2 instances) |
| Edge TTS API | $0 | $0 (free) |
| **TOTAL** | **~$138/mo** | **~$495-685/mo** |

---

### Key Takeaways

1. **BM25-only OpenSearch keeps costs low.** Without kNN vectors, no need for large instances or HNSW graph memory. A 2-node r6g.medium cluster handles 5M docs comfortably at ~$200/mo. This is the single biggest cost saving vs the kNN-enabled path (~$675/mo).

2. **LLM calls are surprisingly cheap.** Even adding summarization, tagging, and rewriting for every article at 50k/day costs ~$250/mo. Haiku 4.5 pricing makes AI-per-article economically viable at scale.

3. **TTS is free at any scale** thanks to Edge TTS. The only cost is S3 storage for audio files. This is a massive competitive advantage.

4. **DynamoDB scales effortlessly** but the 2.7x item multiplication per article means 5M articles = 13.5M DynamoDB items. Still well within DynamoDB's capabilities.

5. **Total cost at 5M is ~$500-700/mo** — very lean for a platform serving millions of articles with audio, search, and AI features. The architecture is fundamentally sound — just parameter tuning and fan-out for ingestion/TTS.
