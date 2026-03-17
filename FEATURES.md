# StreamNews — Feature Roadmap

## Completed
- [x] Landing page with hero article and categorized sections
- [x] Category pages with pagination (8 categories)
- [x] Article detail page with full text and breadcrumbs
- [x] Search functionality
- [x] About page
- [x] Responsive design (mobile + desktop)
- [x] Dark theme with glassmorphism UI
- [x] Skeleton loading states with shimmer animations
- [x] Session caching and rate-limit handling
- [x] Server-side caching (30-minute TTL)
- [x] Multiple news sources (Guardian API + BBC, Al Jazeera, NPR, ABC News RSS)

## Quick Wins
- [ ] **Bookmarks** — save articles to read later using localStorage, with a /bookmarks page
- [ ] **Reading time** — show "3 min read" estimate on each card based on article length
- [ ] **Dark/Light mode toggle** — add a theme switcher in the navbar, persist preference
- [ ] **Breaking news ticker** — scrolling horizontal banner at the top for the latest live stories
- [ ] **Share buttons** — copy link, share to X/WhatsApp/email on article pages

## Medium Effort
- [ ] **Personalized categories** — let users pin/reorder their favorite sections, stored in localStorage
- [ ] **Infinite scroll** — replace pagination with auto-loading on scroll
- [ ] **Related articles** — show 3-4 related stories at the bottom of each article page
- [ ] **Offline support (PWA)** — service worker for offline reading of cached articles
- [ ] **Reading list widget** — sidebar showing saved/bookmarked articles count

## Standout Features
- [ ] **AI-powered summaries** — use the Claude API to generate 2-3 sentence summaries of long articles
- [ ] **World map view** — interactive map plotting news by region using a library like Leaflet
- [ ] **Sentiment dashboard** — visualize whether today's news skews positive/negative per category
- [ ] **Stock/crypto ticker** — financial data widget using free APIs (Alpha Vantage, CoinGecko)
- [ ] **Push notifications** — browser notifications for breaking news using the Push API
- [ ] **Text-to-speech** — read articles aloud using the Web Speech API
- [ ] **Comments/reactions** — lightweight comment system (could use Giscus for GitHub-backed comments)
- [ ] **Newsletter digest** — daily/weekly email summary of top stories
- [ ] **Custom RSS feeds** — let users add their own RSS sources
- [ ] **News comparison** — show how different sources cover the same story side-by-side
