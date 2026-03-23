# Frontend Architecture

The frontend is a React 19 SPA built with Vite 8, React Router 6, and Tailwind CSS 3. It features an interleaved magazine-style layout with content breaks, audio playback, multilingual support, dark/light theming, and mobile-first responsive design via Capacitor for iOS/Android native wrappers.

## App Structure and Routing

**File**: `src/App.jsx`

### Provider Hierarchy
```
ThemeProvider          -- dark/light mode (CSS variables)
  LanguageProvider     -- 40+ language switching
    AudioProvider      -- TTS playback state and controls
      BookmarkProvider -- local storage bookmarks
        BrowserRouter
          BreakingNewsTicker
          Navbar
          <Routes>
          Footer (desktop only)
          ReadingListWidget (desktop only)
          VoiceMode
          AudioPlayer
          BottomTabBar (mobile only)
```

### Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Homepage with trending articles |
| `/category/:category` | `Category` | Category feed with interleaved breaks |
| `/region/:region` | `Region` | Regional news (9 regions) |
| `/cities` | `Cities` | City directory |
| `/city/:city` | `City` | City-level news feed |
| `/article/*` | `Article` | Article detail (legacy ID-based) |
| `/news/:slug` | `Article` | Article detail (SEO-friendly slug) |
| `/search` | `Search` | Full-text search |
| `/explore` | `Explore` | Discovery page |
| `/settings` | `Settings` | User preferences |
| `/about` | `About` | About page |
| `/bookmarks` | `Bookmarks` | Saved articles |
| `/archive` | `Archive` | Date-based archive browser |
| `/feeds` | `CustomFeeds` (lazy) | Custom RSS feed management |
| `/admin` | `Admin` (lazy) | Admin dashboard (password-protected) |

`CustomFeeds` and `Admin` are lazy-loaded via `React.lazy()`.

## Page Components

### Category Page (`src/pages/Category.jsx`)

The most complex page, demonstrating the full interleaved layout pattern. 593 lines.

**Data flow**:
1. `fetchByCategory(category, { region })` -> `/api/feeds` or `/api/regional-feeds`
2. Language override: if `lang !== 'en'`, fetches `/api/lang-feeds?lang=...` and swaps display
3. Infinite scroll via `IntersectionObserver` with 400px root margin

**SEO**: React Helmet with title, description, Open Graph, Twitter Card, and JSON-LD BreadcrumbList.

### Region Page (`src/pages/Region.jsx`)
Similar to Category but queries `REGION#` partitions. Shows category tabs within the region.

### City Page (`src/pages/City.jsx`)
Queries `CITY#` partitions. Supports city-specific language feeds.

### Article Page (`src/pages/Article.jsx`)
Full article view with:
- AI components (HonestHeadline, BestQuote, EntityBadges, ControversyBadge, PredictionTracker, ArticleFAQ)
- Audio player integration (play, queue, download)
- Related articles
- Share buttons and share card generation
- SEO metadata and structured data

## Interleaved Layout Pattern

The Category page implements a magazine-style layout where article grids are interspersed with content breaks.

### Layout Structure

```
Hero article (NewsCard with featured prop)
    |
Audio Briefing bar
    |
[Article chunk 1: 3 articles in grid]
    |
[Content break: cluster / pullquote / top story / etc.]
    |
[Article chunk 2: 3 articles in grid]
    |
[Content break: related categories / regions / etc.]
    |
[Article chunk 3: 3 articles (with mid-feature at intervals)]
    |
... repeating pattern ...
    |
[Infinite scroll sentinel]
```

### Chunk and Break Intervals

```js
const CHUNK_SIZE = 3;
const BREAK_INTERVAL = isMobile ? 1 : 2;      // Break every 3 or 6 articles
const MID_FEATURE_INTERVAL = isMobile ? 3 : 4; // Wide feature every 9 or 12 articles
```

### Mid-Feature Layout
At `MID_FEATURE_INTERVAL` chunk boundaries, the first article in a chunk is rendered as a wide 2-column feature card (image left, text right on desktop) instead of a normal grid card.

### Time Dividers
`getTimeDivider(prevDate, nextDate)` in `src/utils/articleHelpers.js` inserts visual dividers when there's a 6+ hour gap between article chunks:
- 6-24h gap: "N hours earlier"
- 24h+ gap: "N days earlier"

## dailyShuffle() for Variety

**File**: `src/utils/articleHelpers.js`, lines 168-188

Content breaks are shuffled using a seeded pseudo-random shuffle that produces the same order for a whole day, then changes at midnight:

```js
export function dailyShuffle(array) {
  const seed = new Date().toISOString().slice(0, 10);  // "2026-03-23"
  const result = [...array];
  let s = hashCode(seed);
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;  // LCG
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

This ensures:
- All users see the same break order on the same day
- The layout feels fresh each day without server-side state
- Content breaks (clusters, pullquote, stats, poll, top story, photo) are shuffled
- Navigation breaks (related, regions, cities, explore) are evenly spaced among content breaks

## Content Break Types

Built in `Category.jsx` starting at line 269:

| Break Type | Source | Description |
|-----------|--------|-------------|
| `cluster` | `clusterArticles()` | Groups 2-3 articles sharing a keyword topic |
| `pullquote` | `extractSmartPullquote()` | Magazine-style pull quote with attribution |
| `top-story` | `pickTopStory()` | Prominently featured article from high-quality source |
| `photo` | `pickPhotoOfDay()` | Full-width image with overlay text |
| `stat` | `extractStatistic()` | "By the Numbers" callout with data point |
| `poll` | `getDailyPoll()` | Interactive daily poll (QuickPoll component) |
| `sources` | Unique sources from articles | Source badges showing publishers |
| `market` | StockTicker component | Stock market data (shown for business/crypto/tech) |
| `related` | `RELATED_CATEGORIES` map | Links to related category pages |
| `regions` | `REGIONS` from useRegion | Links to regional pages |
| `cities` | `getCitiesForRegion()` | Links to city pages for current region |
| `explore` | Static links | Archive, Bookmarks, Custom Feeds, About |

## Mobile Responsiveness

### useIsMobile Hook (`src/hooks/useIsMobile.js`)

```js
const MOBILE_BREAKPOINT = 640; // matches Tailwind's sm:
// Uses window.matchMedia for reactive updates
```

### Mobile vs Desktop Differences
- **Article grid**: Mobile shows first article full-width, rest as compact horizontal cards. Desktop uses 3-column grid.
- **Break interval**: Mobile inserts breaks every 3 articles, desktop every 6.
- **Mid-feature interval**: Mobile every 9 articles, desktop every 12.
- **Footer**: Hidden on mobile (replaced by BottomTabBar).
- **ReadingListWidget**: Hidden on mobile.
- **Main padding**: Includes `pb-[calc(49px+env(safe-area-inset-bottom,0px))]` on mobile for bottom tab bar.
- **Audio briefing**: Compact on mobile (hides description text, smaller buttons).
- **Horizontal scrolling**: Category breaks use overflow-x-auto on mobile, flex-wrap on desktop.

### BottomTabBar
Mobile-only bottom navigation with tabs for Home, Explore, Search, Bookmarks, Settings.

## API Layer (`src/api/newsApi.js`)

### Client-Side Caching
```js
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
// Uses sessionStorage with { data, ts } wrapper
// Paginated requests (with `before`) bypass cache
```

### Key Functions

| Function | Endpoint | Purpose |
|----------|----------|---------|
| `fetchByCategory(category, { region, before })` | `/api/feeds` or `/api/regional-feeds` | Main feed data |
| `fetchArchive(date, { region, lang })` | `/api/archive` | Date-based archive |
| `fetchByCity(city, { before })` | `/api/city-feeds` | City-level feed |
| `fetchCities(region)` | `/api/cities` | City directory |
| `fetchGeoCity(lat, lng)` | `/api/geo-city` | Nearest city from coordinates |
| `searchNews(query, { lang, category, region })` | `/api/search` | Full-text search with client-side fallback |

### Search Fallback
If the OpenSearch `/api/search` endpoint fails, `searchNews()` falls back to client-side search:
1. Fetches all 15 category feeds in parallel
2. Filters by query string match on title/description
3. Deduplicates by lowercase title

## Contexts and Hooks

### ThemeContext (`src/contexts/ThemeContext.jsx`)
- Dark/light mode toggle
- Persisted to `localStorage`
- Applies `.dark` class to root element

### BookmarkContext (`src/contexts/BookmarkContext.jsx`)
- Local storage-backed article bookmarks
- Add/remove/check operations
- Used by NewsCard and Bookmarks page

### AudioContext (`src/contexts/AudioContext.jsx`)
- Full audio player state (see 03-tts-audio.md)

### useLanguage (`src/hooks/useLanguage.jsx`)
- Language selection persisted to `localStorage` as `pulsenews-lang`
- Provides `lang`, `setLang`, `langLabel`

### useRegion (`src/hooks/useRegion.js`)
- Region selection persisted to `localStorage` as `pulsenews-region`
- 9 regions with labels and flag emojis in `REGIONS` constant

### useInfiniteScroll (`src/hooks/useInfiniteScroll.js`)
- Generic IntersectionObserver-based infinite scroll hook

### useCity (`src/hooks/useCity.js`)
- City selection state management

### useAutoplay (`src/hooks/useAutoplay.js`)
- Audio autoplay toggle persisted to localStorage

## Component Inventory

### Layout Components
- `Navbar` -- Top navigation with category tabs, region/language selectors
- `Footer` -- Desktop footer with links and credits
- `BottomTabBar` -- Mobile bottom tab navigation
- `BreakingNewsTicker` -- Horizontal scrolling breaking news bar

### Content Components
- `NewsCard` -- Article card with featured/compact variants
- `AudioPlayer` -- Expandable bottom audio player bar
- `VoiceMode` -- Hands-free voice interaction mode
- `StockTicker` -- Financial market data ticker
- `QuickPoll` -- Interactive daily poll with local storage results

### AI-Powered Components
- `AISummary` -- Mood-aware article summary
- `ArticleFAQ` -- Accordion of AI-generated questions
- `BestQuote` -- Pull quote from AI analysis
- `HonestHeadline` -- De-clickbaited headline
- `EntityBadges` -- Named entity tags (person/company/place)
- `ControversyBadge` -- Controversy score indicator
- `PredictionTracker` -- Forward-looking claims display

### Utility Components
- `Loader` -- Shimmer/skeleton loading state
- `ShareButtons` -- Social media share buttons
- `ShareCardButton` -- Generate shareable image card
- `CityPicker` -- City selection dropdown
- `LanguageSelector` -- Language switcher UI
- `CategoryCustomizer` -- Category preference management
- `ReadingListWidget` -- Floating reading list panel
- `RelatedArticles` -- Related article suggestions
- `Reactions` -- Article reaction buttons
- `NewsletterSignup` -- Email newsletter form
- `StoryThread` -- Threaded story view
- `PushNotifications` -- Push notification management
- `TextToSpeech` -- Inline TTS trigger button
