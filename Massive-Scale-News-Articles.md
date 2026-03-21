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
