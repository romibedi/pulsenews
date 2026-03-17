# PulseNews — Feature Roadmap

## Completed
- [x] Landing page with hero article and categorized sections
- [x] Category pages (8 categories)
- [x] Article detail page with full text and breadcrumbs
- [x] Search functionality (client-side across all categories)
- [x] About page
- [x] Responsive design (mobile + desktop)
- [x] Warm editorial theme with dark mode support
- [x] Skeleton loading states with shimmer animations
- [x] Session caching and rate-limit handling
- [x] Server-side caching (30-minute TTL)
- [x] Multi-source RSS feeds (BBC, Al Jazeera, NPR, ABC News, Ars Technica)
- [x] OG image extraction for feeds missing images
- [x] **Bookmarks** — save articles to read later using localStorage, with a /bookmarks page
- [x] **Reading time** — show "X min read" estimate on each card based on article length
- [x] **Dark/Light mode toggle** — theme switcher in navbar, persists preference
- [x] **Breaking news ticker** — scrolling horizontal banner at the top for latest stories
- [x] **Share buttons** — copy link, share to X/WhatsApp/email on article pages
- [x] **Personalized categories** — pin/reorder favorite sections, stored in localStorage
- [x] **Related articles** — 4 related stories at the bottom of each article page
- [x] **Offline support (PWA)** — service worker for offline reading of cached articles
- [x] **Reading list widget** — floating bookmark widget with quick access panel
- [x] **AI-powered summaries** — Claude API generates 2-3 sentence summaries on article pages
- [x] **Stock/crypto ticker** — CoinGecko-powered market data widget on home page
- [x] **Text-to-speech** — Web Speech API reads articles aloud with play/pause/stop
- [x] **Comments/reactions** — emoji reaction system with localStorage persistence
- [x] **Custom RSS feeds** — add/manage your own RSS sources at /feeds with suggested feeds
- [x] **News comparison** — side-by-side source comparison for overlapping stories at /compare
- [x] **Geo-localized news** — IP-based region detection with manual region picker (India, UK, US, Australia, Middle East, Europe, Africa, Asia, Latin America)
- [x] **AWS deployment** — Amplify Hosting + Lambda/API Gateway via SAM template

## In Progress
- [ ] **Multi-language support** — Hindi, Tamil, Telugu, Bengali, Marathi RSS feeds + UI language selector (Indian market first, then global)

## Growth & Traffic Roadmap
- [ ] **Google News inclusion** — Apply to Google News Publisher Center, add NewsArticle structured data (JSON-LD), proper meta tags, and clean canonical URLs
- [ ] **Google Discover optimization** — High-quality images (1200px+), engaging headlines, AMP support for Discover feed eligibility
- [ ] **WhatsApp/Telegram sharing** — Prominent "Share to WhatsApp" buttons on every card and article (critical for Indian viral growth)
- [ ] **Real push notifications** — Service worker + PushManager with backend subscription store, breaking news triggers via cron/webhook
- [ ] **Real newsletter digest** — AWS SES / SendGrid integration, scheduled Lambda to compile and send daily/weekly email digests
- [ ] **PWA → App Store** — Wrap as TWA (Trusted Web Activity) for Google Play Store, or React Native for App Store. App store presence drives organic discovery in India
- [ ] **Social media automation** — Auto-post breaking news to X/Twitter, Instagram Reels with headline summaries, YouTube Shorts with AI-narrated digests
- [ ] **SEO fundamentals** — Server-side rendering (SSR) or pre-rendering for article pages, sitemap.xml, robots.txt, Open Graph tags for social previews
- [ ] **Niche authority** — Deep coverage in 2-3 niches (Indian tech/startups, regional politics) to rank faster than generalist aggregators
