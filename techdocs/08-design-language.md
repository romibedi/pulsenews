# Design Language

PulseNewsToday uses a warm, editorial aesthetic with a coral accent, serif headings, and a dark/light theme system driven entirely by CSS custom properties. The design is mobile-first with Tailwind CSS 3 utilities and a 640px breakpoint.

## Color System

**File**: `src/index.css`, lines 15-35

### CSS Custom Properties

| Variable | Light Mode | Dark Mode | Usage |
|----------|-----------|-----------|-------|
| `--accent` | `#e05d44` (coral red) | `#e87461` (lighter coral) | Primary brand color, buttons, badges |
| `--accent-hover` | `#c94e38` | `#f0856f` | Hover states |
| `--bg` | `#faf8f5` (warm white) | `#121212` (near-black) | Page background |
| `--surface` | `#ffffff` | `#1e1e1e` | Card backgrounds |
| `--border` | `#e8e4df` | `#2e2e2e` | Borders, dividers |
| `--text` | `#1a1a1a` | `#e8e4df` | Primary text |
| `--text-secondary` | `#6b6b6b` | `#a0a0a0` | Secondary text, descriptions |
| `--text-muted` | `#9a9a9a` | `#6b6b6b` | Timestamps, metadata |

### Theme Toggle

Controlled by `ThemeContext` (`src/contexts/ThemeContext.jsx`). Adds/removes `.dark` class on the root element. Persisted to `localStorage`.

### Gradient Text

```css
.gradient-text {
  background: linear-gradient(135deg, #e05d44, #e8945a, #d4483b);  /* light */
}
.dark .gradient-text {
  background: linear-gradient(135deg, #e87461, #f0a870, #e05d44);  /* dark */
}
```

Used for the PulseNewsToday brand name and occasional emphasis text. Coral-to-warm-orange gradient.

### Hardcoded Color Tokens

These colors appear directly in component classes rather than as CSS variables:

| Color | Usage |
|-------|-------|
| `#e05d44` / `#e87461` | Accent throughout (badges, hover states, active audio) |
| `#fef0ed` / `#e87461/10` | Light accent background for category pills |
| `#22c55e` | Positive (stock gains, high coverage) |
| `#ef4444` | Negative (stock losses, low coverage) |
| `#f59e0b` | Warning (moderate coverage) |
| `#3b82f6` | Blue accent (admin stat cards, buttons) |
| `#1a1a2e` to `#0f3460` | Share card gradient background |

## Typography

**File**: `src/index.css`, lines 43-61

### Font Families

| Role | Font | Stack |
|------|------|-------|
| Body text | Plus Jakarta Sans | `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif` |
| Headings | Instrument Serif | `'Instrument Serif', Georgia, serif` |

Applied globally:
```css
body {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, h4 {
  font-family: 'Instrument Serif', Georgia, serif;
  letter-spacing: -0.01em;
}
```

### Font Sizes (Tailwind Scale)

Common sizes used across components:

| Element | Size | Component |
|---------|------|-----------|
| Featured headline | `text-2xl md:text-3xl lg:text-4xl` | NewsCard (featured) |
| Standard card headline | `text-lg` | NewsCard (default) |
| Compact card headline | `text-sm` | NewsCard (compact) |
| Section title | `text-lg` | StockTicker, content breaks |
| Source badge | `text-[9px]` to `text-[10px]` | NewsCard |
| Timestamp | `text-[10px]` to `text-xs` | NewsCard, ticker |
| Section label | `text-xs uppercase tracking-wider` | QuickPoll, content breaks |

### Font Loading

Plus Jakarta Sans and Instrument Serif are loaded from Google Fonts. For share card generation (`server/card.js`), Plus Jakarta Sans is fetched at runtime:
```js
const fontData = await fetch('https://fonts.gstatic.com/s/plusjakartasans/v8/...').then(r => r.arrayBuffer());
```

## Card Layouts

**File**: `src/components/NewsCard.jsx` (879 lines)

The NewsCard component renders three distinct variants based on `featured` and `compact` props.

### Default Card (line 839)

Standard article card used in grids.

- **Image**: `aspect-[3/2]` ratio, `object-cover`, hover scale 105%
- **Badges**: Category pill (coral bg) + source badge (color-coded) + reading time
- **Headline**: `text-lg`, Instrument Serif, 2-line clamp, coral on hover
- **Description**: `text-[13px]`, secondary color, 2-line clamp
- **Footer**: Author (truncated 50%) + timestamp + play button + bookmark button, separated by top border
- **Container**: `rounded-2xl`, border, shadow-md, hover:shadow-xl

### Featured Card (line 791)

Hero card for the top article.

- **Image**: `aspect-[16/9] md:aspect-[21/9]`, full-width, gradient overlay from-black/80
- **Category badge**: Solid coral (`bg-[#e05d44]`) pill over the image
- **Headline**: `text-2xl md:text-3xl lg:text-4xl`, white text, positioned in absolute bottom overlay
- **Description**: White at 90% opacity, 2-line clamp
- **Metadata**: White at 60% opacity, overlaid at bottom

### Compact Card (line 759)

Horizontal card for mobile list views.

- **Layout**: Horizontal flex with `gap-3`
- **Image**: Fixed `w-24 h-24`, rounded-lg
- **Source badge**: `text-[9px]` pill
- **Headline**: `text-sm`, 2-line clamp
- **Metadata**: Single line with author + time

### Category Placeholder SVGs

Lines 28-680. When an article has no valid image (detected by `isLogoImage()`), a category-specific SVG illustration is rendered. Each is a 400x267 inline SVG with:

- Dark gradient backgrounds matching the category theme
- Detailed vector illustrations (globe for world, laptop for tech, soccer ball for sport, atom for science, etc.)
- Subtle grid patterns, glows, and decorative elements
- Category label at the bottom

15 categories have unique SVGs: world, technology, business, sport, science, culture, environment, politics, ai, entertainment, gaming, cricket, startups, space, crypto.

### Source Color System

`getSourceColor()` (defined in NewsCard) assigns background/text color classes to source badges based on publisher name. Uses a hash function to deterministically pick from a palette.

## Animation and Transitions

**File**: `src/index.css`, lines 91-156

### Card Hover

```css
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.card-hover:hover {
  transform: translateY(-6px);
  border-color: rgba(224, 93, 68, 0.25);
}
```

Applied to all NewsCard variants. Lifts 6px on hover with a subtle coral border glow.

### Fade In

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
```

Used when article chunks appear during infinite scroll.

### Shimmer Loading

```css
.shimmer {
  background: linear-gradient(90deg, var(--border) 25%, var(--surface) 50%, var(--border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

Skeleton loading effect using the theme's border and surface colors.

### Breaking News Ticker

```css
@keyframes ticker {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.ticker-scroll { animation: ticker 30s linear infinite; }
.ticker-scroll:hover { animation-play-state: paused; }
```

30-second continuous scroll. Content is duplicated (`[...headlines, ...headlines]`) for seamless looping. Pauses on hover.

### Audio Player Slide Up

```css
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
```

Used when the full-screen audio player opens.

### Image Hover Scale

All card images use `group-hover:scale-105 transition-transform duration-500` for a slow zoom on hover.

## Responsive Breakpoints

**File**: `src/hooks/useIsMobile.js`

```js
const MOBILE_BREAKPOINT = 640; // matches Tailwind's sm:
```

The primary breakpoint is 640px, matching Tailwind's `sm:` prefix. The `useIsMobile` hook uses `window.matchMedia` for reactive updates.

### Tailwind Breakpoints Used

| Prefix | Width | Usage |
|--------|-------|-------|
| (none) | <640px | Mobile-first base styles |
| `sm:` | 640px+ | Expanded paddings, larger text |
| `md:` | 768px+ | Grid changes (2-col), featured card aspect ratio |
| `lg:` | 1024px+ | Full 3-column grids, admin 6-col layout |

### Layout Differences

| Element | Mobile | Desktop |
|---------|--------|---------|
| Article grid | 1 column (first featured, rest compact) | 3-column grid |
| Content break interval | Every 3 articles | Every 6 articles |
| Mid-feature interval | Every 9 articles | Every 12 articles |
| Footer | Hidden | Visible |
| BottomTabBar | Visible | Hidden |
| ReadingListWidget | Hidden | Visible |
| Main content padding | `pb-[calc(49px+env(safe-area-inset-bottom,0px))]` | Standard |
| Breaking ticker badge | Smaller | Full |
| Admin overview cards | 2-column grid | 6-column grid |

### Safe Area Handling

Mobile layout accounts for iOS safe areas with `env(safe-area-inset-bottom)` to avoid overlap with the home indicator and bottom tab bar.

## Component Patterns

### BreakingNewsTicker (`src/components/BreakingNewsTicker.jsx`, 68 lines)

- Fetches top 8 world headlines from `/api/feeds` or `/api/regional-feeds`
- Region-aware: uses URL region on `/region/*` pages, otherwise user's saved region
- Dark band at top: `bg-[#1a1a1a]` (inverted in dark mode to `bg-[#e8e4df]`)
- Red "Breaking" badge with animated pulse dot
- Dismissible via X button, stored in `sessionStorage` as `pulsenews-ticker-dismissed`
- Headlines are `<Link>` elements for navigation

### StockTicker (`src/components/StockTicker.jsx`, 53 lines)

- Fetches from `/api/stocks` (CoinGecko crypto data)
- Shows top 6 coins with image, symbol, name, price, 24h change
- Green/red coloring for positive/negative changes
- Surface-colored card with `rounded-2xl` border
- "Market Watch" heading in Instrument Serif
- Falls back to `null` render on error or empty data

### QuickPoll (`src/components/QuickPoll.jsx`, 82 lines)

- Displays a two-option poll question
- Vote stored in `localStorage` as `pulsenews-poll-{id}`
- Deterministic "results" seeded from poll ID hash (35-65% range)
- Selected option gets +3%, other gets -3% (visual nudge)
- Pre-vote: two bordered buttons with coral hover
- Post-vote: progress bars with percentage, coral fill for selected option
- "Quick Poll" heading with clipboard SVG icon

### AudioPlayer (`src/components/AudioPlayer.jsx`)

- Bottom-fixed bar with seek bar, play/pause, speed, sleep timer, queue
- Custom `SeekBar` component with pointer/touch drag support
- `WaveformBars` visualizer with animated bars during playback
- Speed options: 0.75x, 1x, 1.25x, 1.5x, 2x
- Sleep options: 15 min, 30 min, 60 min, End of article
- Expandable to full-screen overlay with `animate-slide-up`

## Scrollbar Handling

```css
html { scrollbar-width: none; overflow-x: hidden; }
html::-webkit-scrollbar { display: none; }
```

Global scrollbar is hidden on all browsers for a clean app-like appearance. The `.scrollbar-hide` utility class provides the same for individual scrollable elements.

## Text Clamping

```css
.line-clamp-2 { -webkit-line-clamp: 2; }
.line-clamp-3 { -webkit-line-clamp: 3; }
```

Custom utility classes for clamping text to 2 or 3 lines, used extensively in card descriptions and headlines.
