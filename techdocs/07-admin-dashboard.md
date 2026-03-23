# Admin Dashboard

The admin dashboard provides a password-protected view of article counts by category, region, language, and city, plus TTS audio coverage and LLM analysis field coverage. The backend is an Express Router (`server/admin.js`, 226 lines) and the frontend is a lazy-loaded React page (`src/pages/Admin.jsx`, 291 lines).

## Authentication

**File**: `server/admin.js`, lines 19-36

### Password Mechanism
```js
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pulsenews-admin-2026';

function requireAdmin(req, res, next) {
  const password = req.headers['x-admin-password'] || req.query.password;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
```

- Password sent via `x-admin-password` header or `?password=` query param
- Set via `ADMIN_PASSWORD` env var (defaults to `pulsenews-admin-2026`)
- Applied as middleware to all admin routes via `router.use(requireAdmin)`

### Frontend Auth Flow (`src/pages/Admin.jsx`, lines 69-128)

1. On mount, checks `sessionStorage` for stored password
2. If found, calls `GET /api/admin/verify` to validate
3. If valid, sets `authed = true` and fetches stats
4. If invalid, clears stored password and shows login form
5. Password is stored in `sessionStorage` (tab-scoped, cleared on tab close)

## API Endpoints

### `GET /api/admin/verify`

**Line 220.** Returns `{ ok: true }` if password is valid. Used by the frontend to validate cached passwords on page load.

### `GET /api/admin/stats`

**Lines 121-218.** The main stats endpoint. Returns a comprehensive JSON payload with all dashboard data.

#### Parallel Data Fetching

Seven data sources are fetched concurrently via `Promise.all`:

```js
const [
  categoryCounts,    // 15 categories
  regionCounts,      // 9 regions x 7 categories each
  langCounts,        // 28+ languages
  cityCounts,        // 135+ cities
  sitemapCount,      // SITEMAP partition total
  ttsCounts,         // S3 audio files per language
  llmCoverage,       // LLM field coverage from sample
] = await Promise.all([...]);
```

#### Category Counts (line 140)
Queries `GLOBAL#CAT#{category}` for all 15 categories defined in `FEEDS`.

#### Region Counts (lines 145-158)
For each of the 9 regions, counts articles across 7 categories: `world`, `technology`, `business`, `sport`, `science`, `culture`, `politics`. Each region returns both a total and a per-category breakdown.

```js
// Partition key format: REGION#{region}#CAT#{category}
const catCounts = await Promise.all(
  ['world', 'technology', 'business', 'sport', 'science', 'culture', 'politics']
    .map(cat => countPK(`REGION#${region}#CAT#${cat}`))
);
```

#### Language Counts (line 160)
Queries `LANG#{lang}` for all languages in `LANG_FEEDS`.

#### City Counts (line 165)
Queries `CITY#{city}` for all cities in `CITY_FEEDS`.

#### SITEMAP Total (line 170)
Single count of the `SITEMAP` partition, representing unique articles.

#### TTS Audio Counts (lines 172-175)
Uses `ListObjectsV2` to count S3 objects under `audio/{lang}/` for English plus all `LANG_FEEDS` languages. This counts actual MP3 files in the `pulsenews-audio-prod` bucket.

#### LLM Analysis Coverage (lines 75-118)
Samples up to 1000 of the most recent `SITEMAP` entries and checks for the presence of each AI analysis field.

### Helper Functions

#### `countPK(pk)` (line 41)
Paginated DynamoDB `COUNT` query on a specific partition key. Handles `LastEvaluatedKey` pagination.

#### `countS3Prefix(prefix)` (line 59)
Paginated S3 `ListObjectsV2` with prefix. Handles `ContinuationToken` pagination.

#### `sampleLLMCoverage(sampleSize)` (line 75)

Fields checked: `mood`, `honestHeadline`, `controversyScore`, `entities`, `bestQuote`, `questions`, `predictions`, `body`, `image`.

For array fields (`entities`, `questions`, `predictions`), checks both that the value is an array and has at least one element. Also detects logo/placeholder images:

```js
if (lower.includes('lh3.googleusercontent.com/j6_cofb') ||
    /[/\-_]logo[/\-_.\d]/i.test(lower) ||
    /[/\-_](favicon|placeholder|default[_-]?image|brand|icon)[/\-_.]/i.test(lower)) {
  logoImages++;
}
```

Returns `{ counts, sampled, logoImages }`.

## Response Schema

```json
{
  "timestamp": "2026-03-23T12:00:00.000Z",
  "elapsed": "12.3s",
  "totals": {
    "sitemapArticles": 45000,
    "categories": 38000,
    "regions": 25000,
    "languages": 12000,
    "cities": 8000
  },
  "categories": { "world": 3200, "technology": 2800, ... },
  "regions": {
    "india": { "total": 5000, "byCategory": { "world": 800, "technology": 700, ... } },
    ...
  },
  "languages": { "hi": 1500, "ta": 800, ... },
  "cities": { "mumbai": 300, "delhi": 250, ... },
  "tts": {
    "total": 40000,
    "byLanguage": { "en": 30000, "hi": 1500, ... }
  },
  "llmAnalysis": {
    "sampleSize": 1000,
    "fields": {
      "mood": { "count": 950, "percentage": 95 },
      "honestHeadline": { "count": 920, "percentage": 92 },
      ...
    },
    "logoImages": 45
  }
}
```

## Frontend Dashboard

**File**: `src/pages/Admin.jsx`

### Internal Components

#### `StatCard` (line 5)
Summary card with colored left border. Props: `title`, `value`, `subtitle`, `color` (blue/green/purple/orange/red/cyan).

#### `DataTable` (line 23)
Sortable table from key-value data. Auto-sorts by `sortKey` (default `count`) descending. Supports custom `render` functions per column.

#### `ProgressBar` (line 57)
Horizontal bar showing percentage. Color-coded by the caller: green (>80%), amber (50-80%), red (<50%).

### Dashboard Layout

**Overview Cards** (line 190): 6-column responsive grid showing Total Articles, Categories, Regions, Languages, Cities, TTS Audio.

**LLM Analysis Coverage** (line 200): 3-column grid of progress bars for each AI field. Color thresholds:
- Green (`#22c55e`): >80% coverage
- Amber (`#f59e0b`): 50-80% coverage
- Red (`#ef4444`): <50% coverage

Includes a warning count for logo/placeholder images.

**Articles by Category** (line 225): Table sorted by count descending.

**Articles by Region** (line 235): Table with total column plus per-category breakdown (world, technology, business, sport, science, culture, politics).

**Articles by Language** (line 251): Table with article count, TTS audio count, and TTS coverage progress bar. Cross-references `stats.tts.byLanguage` for coverage calculation.

**TTS Audio by Language** (line 268): Separate table focused on S3 audio file counts including English.

**Articles by City** (line 278): Table of 135+ cities with article counts. City names are de-slugified for display (`row.key.replace(/-/g, ' ')`).

### Loading States

- First load shows "Loading stats... This may take 30-60 seconds for the first load."
- Subsequent refreshes show a "Refreshing..." button state
- Error state shows a red banner with the error message
- Refresh button fetches fresh stats on demand

### Route and Lazy Loading

Defined in `src/App.jsx`:
```jsx
const Admin = React.lazy(() => import('./pages/Admin'));
// Route: /admin
```

The Admin page is not linked from the main navigation -- accessed directly via URL.
