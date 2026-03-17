# PulseNews — Feature Roadmap

## Completed
- [x] Landing page with hero article and categorized sections
- [x] Category pages with pagination (8 categories)
- [x] Article detail page with full text and breadcrumbs
- [x] Search functionality
- [x] About page
- [x] Responsive design (mobile + desktop)
- [x] Warm editorial theme with dark mode support
- [x] Skeleton loading states with shimmer animations
- [x] Session caching and rate-limit handling
- [x] Server-side caching (30-minute TTL)
- [x] Multiple news sources (Guardian API + BBC, Al Jazeera, NPR, ABC News RSS)
- [x] **Bookmarks** — save articles to read later using localStorage, with a /bookmarks page
- [x] **Reading time** — show "X min read" estimate on each card based on article length
- [x] **Dark/Light mode toggle** — theme switcher in navbar, persists preference
- [x] **Breaking news ticker** — scrolling horizontal banner at the top for latest stories
- [x] **Share buttons** — copy link, share to X/WhatsApp/email on article pages
- [x] **Personalized categories** — pin/reorder favorite sections, stored in localStorage
- [x] **Infinite scroll** — auto-loading on scroll replaces pagination on category pages
- [x] **Related articles** — 4 related stories at the bottom of each article page
- [x] **Offline support (PWA)** — service worker for offline reading of cached articles
- [x] **Reading list widget** — floating bookmark widget with quick access panel

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
