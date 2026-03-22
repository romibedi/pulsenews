import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchByCategory, CATEGORIES, fetchByCity } from '../api/newsApi';
import useLocalStorage from '../hooks/useLocalStorage';
import useRegion, { REGIONS } from '../hooks/useRegion';
import useCity from '../hooks/useCity';
import useLanguage from '../hooks/useLanguage';
import useIsMobile from '../hooks/useIsMobile';
import NewsCard from '../components/NewsCard';
import Loader, { HeroLoader } from '../components/Loader';
import CategoryCustomizer, { DEFAULT_SECTIONS } from '../components/CategoryCustomizer';
import StockTicker from '../components/StockTicker';
import useAudio from '../contexts/AudioContext';
import { clusterArticles, extractPullquote, timeAgo, getCitiesForRegion, extractSmartPullquote, pickTopStory, pickPhotoOfDay, extractStatistic, getDailyPoll, dailyShuffle, getTimeDivider, getArticleImage } from '../utils/articleHelpers';
import QuickPoll from '../components/QuickPoll';

const SITE_URL = 'https://pulsenewstoday.com';

export default function Home() {
  const [savedSections, setSavedSections] = useLocalStorage('pulsenews-sections', null);
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const { region, regionInfo, setRegion, loading: regionLoading } = useRegion();
  const { lang, t } = useLanguage();
  const [langArticles, setLangArticles] = useState([]);
  const [langLoading, setLangLoading] = useState(false);
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [mood, setMood] = useState('all');
  const { playArticle, addToQueue } = useAudio();
  const { city: detectedCity } = useCity();
  const [cityArticles, setCityArticles] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);
  const isMobile = useIsMobile();

  const activeSections = savedSections
    ? savedSections.filter((s) => s.pinned !== false)
    : DEFAULT_SECTIONS.slice(0, 4);

  // Fetch all sections using regional feeds
  useEffect(() => {
    if (regionLoading) return;
    async function load() {
      setLoading(true);
      setSections({});
      await Promise.all(
        activeSections.map((s) =>
          fetchByCategory(s.key, { region })
            .catch(() => ({ articles: [] }))
            .then((result) => {
              setSections((prev) => ({ ...prev, [s.key]: result.articles }));
            })
        )
      );
      setLoading(false);
    }
    load();
  }, [savedSections, region, regionLoading]);

  // Fetch city-local news when city is detected
  useEffect(() => {
    if (!detectedCity) { setCityArticles([]); return; }
    setCityLoading(true);
    fetchByCity(detectedCity)
      .then((data) => setCityArticles(data.articles || []))
      .catch(() => setCityArticles([]))
      .finally(() => setCityLoading(false));
  }, [detectedCity]);

  // Fetch language-specific news (non-English)
  useEffect(() => {
    if (lang === 'en') { setLangArticles([]); setLangLoading(false); return; }
    setLangLoading(true);
    fetch(`/api/lang-feeds?lang=${encodeURIComponent(lang)}`)
      .then((r) => r.json())
      .then((data) => setLangArticles(data.articles || []))
      .catch(() => setLangArticles([]))
      .finally(() => setLangLoading(false));
  }, [lang]);

  // Mood filter
  const MOOD_OPTIONS = [
    { key: 'all', label: 'All', emoji: '\ud83d\udcf0' },
    { key: 'uplifting', label: 'Uplifting', emoji: '\u2600\ufe0f' },
    { key: 'neutral', label: 'Just Facts', emoji: '\ud83d\udccb' },
    { key: 'investigative', label: 'Deep Reads', emoji: '\ud83d\udd0d' },
    { key: 'breaking', label: 'Breaking', emoji: '\ud83d\udd34' },
  ];

  const filterByMood = (articles) => {
    if (mood === 'all') return articles;
    return articles.filter((a) => (a.mood || 'neutral') === mood);
  };

  // Merge all section articles into a single deduped, date-sorted pool
  const isNonEnglish = lang !== 'en';
  const hasLangContent = isNonEnglish && langArticles.length > 0;
  const isLangSwitching = isNonEnglish && langLoading && !hasLangContent;

  const allArticles = useMemo(() => {
    if (hasLangContent) return filterByMood(langArticles);
    const seen = new Set();
    const merged = [];
    // Primary section first, then others — preserves priority
    for (const sec of activeSections) {
      for (const a of (sections[sec.key] || [])) {
        if (!seen.has(a.id)) {
          seen.add(a.id);
          merged.push(a);
        }
      }
    }
    // Add city articles at the end if available
    for (const a of cityArticles) {
      if (!seen.has(a.id)) {
        seen.add(a.id);
        merged.push(a);
      }
    }
    return filterByMood(merged);
  }, [sections, langArticles, cityArticles, hasLangContent, mood]);

  const hero = allArticles[0];
  const gridArticles = allArticles.slice(1);

  const clusters = useMemo(() => clusterArticles(allArticles), [allArticles]);
  const clusteredIds = useMemo(() => new Set(clusters.flatMap((c) => c.articles.map((a) => a.id))), [clusters]);

  const smartPullquote = extractSmartPullquote(allArticles);
  const topStory = pickTopStory(allArticles);
  let photoOfDay = pickPhotoOfDay(allArticles);
  if (photoOfDay && topStory && photoOfDay.id === topStory.id) photoOfDay = null;
  const stat = extractStatistic(allArticles);
  const poll = getDailyPoll('world');

  const excludeIds = new Set([
    ...(topStory ? [topStory.id] : []),
    ...(photoOfDay ? [photoOfDay.id] : []),
  ]);
  const feedArticles = gridArticles.filter((a) => !clusteredIds.has(a.id) && !excludeIds.has(a.id));

  const sources = useMemo(() => {
    const seen = new Set();
    return allArticles.filter((a) => {
      if (!a.source || seen.has(a.source)) return false;
      seen.add(a.source);
      return true;
    }).slice(0, 12).map((a) => a.source);
  }, [allArticles]);

  const regionLabel = region && region !== 'world' ? regionInfo.label : 'World';

  if (error && !hero) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-red-500 mb-4 text-lg">Something went wrong</div>
        <p className="text-[var(--text-muted)]">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-[#e05d44] dark:bg-[#e87461] text-white rounded-full hover:bg-[#c94e38] transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <Helmet>
        <title>PulseNewsToday - Breaking News, World News &amp; Current Affairs</title>
        <meta name="description" content="Stay informed with PulseNewsToday. Breaking news, world news, and current affairs from 99+ trusted sources across 9 regions and 16 languages. AI-powered summaries and text-to-speech." />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:title" content="PulseNewsToday - Breaking News, World News & Current Affairs" />
        <meta property="og:description" content="Stay informed with PulseNewsToday. Breaking news, world news, and current affairs from 99+ trusted sources across 9 regions and 16 languages." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={`${SITE_URL}/favicon.svg`} />
        <meta property="og:site_name" content="PulseNewsToday" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PulseNewsToday - Breaking News, World News & Current Affairs" />
        <meta name="twitter:description" content="Stay informed with PulseNewsToday. Breaking news, world news, and current affairs from 99+ trusted sources across 9 regions and 16 languages." />
        <meta name="twitter:image" content={`${SITE_URL}/favicon.svg`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "PulseNewsToday",
          "url": SITE_URL,
          "description": "AI-powered news aggregator delivering stories from 99+ sources across 9 regions and 16 languages.",
          "publisher": { "@type": "Organization", "name": "PulseNewsToday", "url": SITE_URL },
          "potentialAction": {
            "@type": "SearchAction",
            "target": { "@type": "EntryPoint", "urlTemplate": `${SITE_URL}/search?q={search_term_string}` },
            "query-input": "required name=search_term_string"
          }
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL }]
        })}</script>
      </Helmet>

      <div className={`space-y-10 transition-opacity duration-300 ${isLangSwitching ? 'opacity-40' : ''}`}>

        {/* ── Header ────────────────────────────────────────────── */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-normal text-[var(--text)]">
                {lang === 'en' ? (
                  <>
                    {region && region !== 'world' && <span className="text-[var(--text-muted)] text-2xl md:text-3xl mr-2">{regionInfo.flag}</span>}
                    {regionLabel} <span className="gradient-text">Headlines</span>
                  </>
                ) : (
                  <span className="gradient-text">{t('headlines')}</span>
                )}
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Region picker */}
              <div className="relative">
                <button
                  onClick={() => setShowRegionPicker(!showRegionPicker)}
                  className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors rounded-lg hover:bg-[var(--surface)] border border-transparent hover:border-[var(--border)]"
                  title="Change region"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </button>
                {showRegionPicker && (
                  <div className="absolute right-0 top-10 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg p-2 z-20 min-w-[200px] animate-fade-in">
                    {Object.entries(REGIONS).map(([key, info]) => (
                      <button
                        key={key}
                        onClick={() => { setRegion(key); setShowRegionPicker(false); }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                          key === region
                            ? 'bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461]'
                            : 'text-[var(--text)] hover:bg-[var(--bg)]'
                        }`}
                      >
                        <span>{info.flag}</span>
                        <span>{info.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowCustomizer(true)}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors rounded-lg hover:bg-[var(--surface)] border border-transparent hover:border-[var(--border)]"
                title="Customize sections"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mood filter */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {MOOD_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setMood(opt.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border whitespace-nowrap transition-all ${
                  mood === opt.key
                    ? 'border-[#e05d44]/40 dark:border-[#e87461]/40 bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461]'
                    : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--text-muted)]'
                }`}
              >
                <span>{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>

          {mood !== 'all' && allArticles.length === 0 && !loading && (
            <div className="text-center py-12 text-[var(--text-muted)]">
              <p className="text-sm">No {MOOD_OPTIONS.find((o) => o.key === mood)?.label.toLowerCase()} articles right now.</p>
              <button onClick={() => setMood('all')} className="text-[#e05d44] dark:text-[#e87461] text-sm mt-2 hover:underline">Show all articles</button>
            </div>
          )}
        </div>

        {/* ── Hero ───────────────────────────────────────────────── */}
        {loading && !hero ? (
          <HeroLoader />
        ) : hero ? (
          <div className="animate-fade-in">
            <NewsCard article={hero} featured />
          </div>
        ) : null}

        {/* ── Audio briefing ─────────────────────────────────────── */}
        {allArticles.length >= 3 && (
          <div className="bg-gradient-to-r from-[#fef0ed] to-[#fef8f6] dark:from-[#e87461]/10 dark:to-[#e87461]/5 rounded-2xl p-3 sm:p-5 flex items-center gap-3 sm:gap-4 border border-[#e05d44]/10 dark:border-[#e87461]/20">
            <button
              onClick={() => {
                playArticle({
                  id: `briefing-home-${Date.now()}`,
                  title: 'Today\'s Headlines Briefing',
                  body: allArticles.slice(0, 5).map((a) => a.title).join('. '),
                  source: 'PulseNewsToday',
                  date: new Date().toISOString(),
                });
              }}
              className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-[#e05d44] dark:bg-[#e87461] text-white rounded-full flex items-center justify-center hover:bg-[#c94e38] transition-colors shadow-md"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#e05d44] dark:text-[#e87461]">Today's Headlines Briefing</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 hidden sm:block">Listen to a 60-second audio summary of the top stories</p>
            </div>
            <button
              onClick={() => {
                playArticle({
                  id: `briefing-home-${Date.now()}`,
                  title: 'Headlines Briefing',
                  body: allArticles.slice(0, 3).map((a) => a.title).join('. '),
                  source: 'PulseNewsToday',
                  date: new Date().toISOString(),
                });
                allArticles.slice(0, 5).forEach((a) => addToQueue(a));
              }}
              className="shrink-0 text-xs text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors whitespace-nowrap hidden sm:block"
            >
              + Queue all
            </button>
          </div>
        )}

        {/* ── Interleaved article grids + break sections ─────── */}
        {loading && feedArticles.length === 0 ? (
          <Loader count={9} />
        ) : (() => {
          // Build break pool — content breaks get shuffled daily, nav breaks spaced evenly
          const contentBreaks = [];
          clusters.forEach((cluster) => {
            contentBreaks.push({ type: 'cluster', key: `cluster-${cluster.topic}`, cluster });
          });
          if (topStory) contentBreaks.push({ type: 'top-story', key: 'top-story' });
          if (smartPullquote) contentBreaks.push({ type: 'pullquote', key: 'pullquote' });
          if (stat) contentBreaks.push({ type: 'stat', key: 'stat' });
          if (photoOfDay) contentBreaks.push({ type: 'photo', key: 'photo' });
          contentBreaks.push({ type: 'poll', key: 'poll' });
          if (sources.length > 0) contentBreaks.push({ type: 'sources', key: 'sources' });
          if (detectedCity && cityArticles.length > 0) contentBreaks.push({ type: 'local', key: 'local' });
          contentBreaks.push({ type: 'market', key: 'market' });

          const navBreaks = [
            { type: 'categories', key: 'categories' },
            { type: 'regions', key: 'regions' },
            { type: 'cities', key: 'cities' },
            { type: 'explore', key: 'explore' },
          ];

          // Shuffle content daily, space nav breaks evenly among them
          const shuffledContent = dailyShuffle(contentBreaks);
          const breaks = [];
          let navIdx = 0;
          shuffledContent.forEach((br, i) => {
            breaks.push(br);
            if ((i + 1) % 3 === 0 && navIdx < navBreaks.length) {
              breaks.push(navBreaks[navIdx++]);
            }
          });
          while (navIdx < navBreaks.length) breaks.push(navBreaks[navIdx++]);

          const CHUNK_SIZE = 3;
          const BREAK_INTERVAL = isMobile ? 1 : 2;
          const MID_FEATURE_INTERVAL = isMobile ? 3 : 4;
          const chunks = [];
          for (let i = 0; i < feedArticles.length; i += CHUNK_SIZE) {
            chunks.push(feedArticles.slice(i, i + CHUNK_SIZE));
          }

          const elements = [];
          let breakIdx = 0;

          chunks.forEach((chunk, ci) => {
            // Time divider when there's a big gap between chunks
            if (ci > 0) {
              const prevChunk = chunks[ci - 1];
              const dividerLabel = getTimeDivider(prevChunk[prevChunk.length - 1]?.date, chunk[0]?.date);
              if (dividerLabel) {
                elements.push(
                  <div key={`divider-${ci}`} className="flex items-center gap-3 -my-2">
                    <div className="flex-1 border-t border-[var(--border)]" />
                    <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">{dividerLabel}</span>
                    <div className="flex-1 border-t border-[var(--border)]" />
                  </div>
                );
              }
            }

            // Mid-story wide feature at intervals
            if (ci > 0 && ci % MID_FEATURE_INTERVAL === 0 && chunk[0]) {
              const a = chunk[0];
              const rest = chunk.slice(1);
              elements.push(
                <div key={`mid-${a.id}`} className="animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                    {a.image && <img src={a.image} alt="" className="w-full h-40 sm:h-56 md:h-full object-cover" loading="lazy" />}
                    <div className="p-4 sm:p-6 flex flex-col justify-center">
                      <span className="text-[10px] font-semibold text-[#e05d44] dark:text-[#e87461] uppercase tracking-wider mb-2">Featured</span>
                      <Link
                        to={a.slug ? `/news/${a.slug}` : `/article/${encodeURIComponent(a.id)}`}
                        className="text-lg sm:text-xl font-medium text-[var(--text)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline leading-snug"
                        style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                      >{a.title}</Link>
                      <p className="text-sm text-[var(--text-muted)] mt-2 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                        {(a.description || '').replace(/<[^>]*>/g, '').slice(0, 250)}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-3">{a.source}{a.date ? ` \u00b7 ${timeAgo(a.date)}` : ''}</p>
                    </div>
                  </div>
                </div>
              );
              if (rest.length > 0) {
                elements.push(
                  <div key={`chunk-rest-${ci}`} className={isMobile ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-5'}>
                    {rest.map((article) => (
                      <div key={article.id} className="animate-fade-in h-full">
                        <NewsCard article={article} compact={isMobile} />
                      </div>
                    ))}
                  </div>
                );
              }
            } else if (isMobile) {
              elements.push(
                <div key={`chunk-${ci}`} className="space-y-3">
                  {chunk.map((article, i) => (
                    <div key={article.id} className="animate-fade-in" style={ci === 0 ? { animationDelay: `${Math.min(i, 3) * 60}ms` } : undefined}>
                      <NewsCard article={article} compact={i > 0} />
                    </div>
                  ))}
                </div>
              );
            } else {
              elements.push(
                <div key={`chunk-${ci}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {chunk.map((article, i) => (
                    <div key={article.id} className="animate-fade-in h-full" style={ci === 0 ? { animationDelay: `${Math.min(i, 5) * 60}ms` } : undefined}>
                      <NewsCard article={article} />
                    </div>
                  ))}
                </div>
              );
            }

            if ((ci + 1) % BREAK_INTERVAL === 0 && breakIdx < breaks.length) {
              elements.push(renderBreak(breaks[breakIdx++]));
            }
          });

          while (breakIdx < breaks.length) {
            elements.push(renderBreak(breaks[breakIdx++]));
          }

          function renderBreak(br) {
            switch (br.type) {
              case 'cluster':
                return (
                  <div key={br.key} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e05d44] dark:bg-[#e87461]" />
                      <h3 className="text-xs sm:text-sm font-semibold text-[var(--text)] uppercase tracking-wider">Trending: {br.cluster.topic}</h3>
                      <span className="text-[10px] sm:text-xs text-[var(--text-muted)]">{br.cluster.articles.length} stories</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                      {br.cluster.articles.map((article) => (
                        <Link key={article.id} to={article.slug ? `/news/${article.slug}` : `/article/${encodeURIComponent(article.id)}`} className="flex gap-3 p-2 rounded-lg hover:bg-[var(--bg)] transition-colors no-underline group">
                          {getArticleImage(article) && <img src={getArticleImage(article)} alt="" className="w-16 h-16 sm:w-14 sm:h-14 rounded-lg object-cover shrink-0" loading="lazy" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[var(--text)] group-hover:text-[#e05d44] dark:group-hover:text-[#e87461] transition-colors line-clamp-2 leading-snug font-medium">{article.title}</p>
                            <p className="text-[10px] text-[var(--text-muted)] mt-1">{article.source}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );

              case 'pullquote':
                return smartPullquote ? (
                  <div key={br.key} className="relative py-3 sm:py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]" /></div>
                    <div className="relative bg-[var(--bg)] mx-auto max-w-2xl px-4 sm:px-6 py-4 sm:py-5 rounded-xl border border-[var(--border)]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[#e05d44]/20 dark:text-[#e87461]/20 mb-2">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <p className="text-sm sm:text-base text-[var(--text)] leading-relaxed italic" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>{smartPullquote.quote}</p>
                      <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-2">
                        — {smartPullquote.article.source || 'Source'}{smartPullquote.article.title ? `, "${smartPullquote.article.title.slice(0, 50)}${smartPullquote.article.title.length > 50 ? '...' : ''}"` : ''}
                      </p>
                    </div>
                  </div>
                ) : null;

              case 'top-story':
                return topStory ? (
                  <div key={br.key} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                      {topStory.image && <div className="md:col-span-2"><img src={topStory.image} alt="" className="w-full h-48 md:h-full object-cover" loading="lazy" /></div>}
                      <div className={`p-5 sm:p-6 flex flex-col justify-center ${topStory.image ? 'md:col-span-3' : 'md:col-span-5'}`}>
                        <span className="text-[10px] font-bold text-[#e05d44] dark:text-[#e87461] uppercase tracking-widest mb-2">Top Story</span>
                        <Link
                          to={topStory.slug ? `/news/${topStory.slug}` : `/article/${encodeURIComponent(topStory.id)}`}
                          className="text-xl sm:text-2xl font-medium text-[var(--text)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline leading-snug"
                          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                        >{topStory.title}</Link>
                        <p className="text-sm text-[var(--text-muted)] mt-3 line-clamp-3 leading-relaxed">
                          {(topStory.description || '').replace(/<[^>]*>/g, '').slice(0, 300)}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-3">{topStory.source}{topStory.date ? ` \u00b7 ${timeAgo(topStory.date)}` : ''}</p>
                      </div>
                    </div>
                  </div>
                ) : null;

              case 'stat':
                return stat ? (
                  <Link key={br.key} to={stat.article.slug ? `/news/${stat.article.slug}` : `/article/${encodeURIComponent(stat.article.id)}`} className="block bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 no-underline group hover:border-[#e05d44]/30 dark:hover:border-[#e87461]/30 transition-colors">
                    <span className="text-[10px] font-semibold text-[#e05d44] dark:text-[#e87461] uppercase tracking-widest">By the Numbers</span>
                    <p className="text-2xl sm:text-3xl font-bold text-[var(--text)] mt-2 group-hover:text-[#e05d44] dark:group-hover:text-[#e87461] transition-colors" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>{stat.stat}</p>
                    <p className="text-sm text-[var(--text-muted)] mt-2 line-clamp-2 leading-relaxed">{stat.context}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-2">{stat.article.source}</p>
                  </Link>
                ) : null;

              case 'photo':
                return photoOfDay ? (
                  <Link key={br.key} to={photoOfDay.slug ? `/news/${photoOfDay.slug}` : `/article/${encodeURIComponent(photoOfDay.id)}`} className="block rounded-2xl overflow-hidden relative group no-underline">
                    <img src={photoOfDay.image} alt="" className="w-full h-56 sm:h-72 object-cover group-hover:scale-[1.02] transition-transform duration-500" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                      <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Photo of the Day</span>
                      <p className="text-white text-base sm:text-lg font-medium mt-1 line-clamp-2 leading-snug" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>{photoOfDay.title}</p>
                      <p className="text-white/60 text-[10px] mt-1">{photoOfDay.source}{photoOfDay.date ? ` \u00b7 ${timeAgo(photoOfDay.date)}` : ''}</p>
                    </div>
                  </Link>
                ) : null;

              case 'poll':
                return <QuickPoll key={br.key} poll={poll} />;

              case 'categories':
                return (
                  <div key={br.key} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5">
                    <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-3">Browse Categories</h4>
                    <div className="flex gap-2 overflow-x-auto sm:overflow-visible sm:flex-wrap pb-1 sm:pb-0 -mx-1 px-1 scrollbar-hide">
                      {CATEGORIES.map((cat) => (
                        <Link key={cat} to={`/category/${cat}`} className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] hover:border-[#e05d44]/30 dark:hover:border-[#e87461]/30 hover:bg-[var(--bg)] transition-colors no-underline group shrink-0">
                          <span className="text-sm text-[var(--text)] group-hover:text-[#e05d44] dark:group-hover:text-[#e87461] transition-colors capitalize whitespace-nowrap">{cat}</span>
                          <svg className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[#e05d44] dark:group-hover:text-[#e87461]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                );

              case 'sources':
                return (
                  <div key={br.key} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5">
                    <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-3">Sources</h4>
                    <div className="flex gap-1.5 overflow-x-auto sm:overflow-visible sm:flex-wrap pb-1 sm:pb-0 -mx-1 px-1 scrollbar-hide">
                      {sources.map((s) => (
                        <span key={s} className="px-3 py-1.5 text-xs bg-[var(--bg)] rounded-full text-[var(--text-muted)] border border-[var(--border)] shrink-0 whitespace-nowrap">{s}</span>
                      ))}
                    </div>
                  </div>
                );

              case 'local':
                return (
                  <div key={br.key} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-[#e05d44] dark:text-[#e87461]">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                        <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Local News</h4>
                      </div>
                      <Link to={`/city/${detectedCity}`} className="text-[10px] sm:text-xs text-[#e05d44] dark:text-[#e87461] no-underline hover:underline">View all</Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                      {cityArticles.slice(0, 3).map((article) => (
                        <Link key={article.id} to={article.slug ? `/news/${article.slug}` : `/article/${encodeURIComponent(article.id)}`} className="flex gap-3 p-2 rounded-lg hover:bg-[var(--bg)] transition-colors no-underline group">
                          {getArticleImage(article) && <img src={getArticleImage(article)} alt="" className="w-16 h-16 sm:w-14 sm:h-14 rounded-lg object-cover shrink-0" loading="lazy" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[var(--text)] group-hover:text-[#e05d44] dark:group-hover:text-[#e87461] transition-colors line-clamp-2 leading-snug font-medium">{article.title}</p>
                            <p className="text-[10px] text-[var(--text-muted)] mt-1">{article.source}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );

              case 'regions':
                return (
                  <div key={br.key} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5">
                    <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-3">Explore Regions</h4>
                    <div className="flex gap-2 overflow-x-auto sm:overflow-visible sm:flex-wrap pb-1 sm:pb-0 -mx-1 px-1 scrollbar-hide">
                      {Object.entries(REGIONS).map(([key, info]) => (
                        <Link key={key} to={`/region/${key}`} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs no-underline transition-colors shrink-0 whitespace-nowrap ${key === region ? 'bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461] font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]'}`}>
                          <span>{info.flag}</span><span>{info.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );

              case 'cities':
                return (
                  <div key={br.key} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">City News</h4>
                      <Link to="/cities" className="text-[10px] sm:text-xs text-[#e05d44] dark:text-[#e87461] no-underline hover:underline">View all cities</Link>
                    </div>
                    <div className="flex gap-2 overflow-x-auto sm:overflow-visible sm:flex-wrap pb-1 sm:pb-0 -mx-1 px-1 scrollbar-hide">
                      {getCitiesForRegion(region).map((c) => (
                        <Link key={c.key} to={`/city/${c.key}`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs no-underline transition-colors shrink-0 whitespace-nowrap text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)]">
                          <span>{c.flag}</span><span>{c.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );

              case 'market':
                return <div key={br.key}><StockTicker /></div>;

              case 'explore':
                return (
                  <div key={br.key} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5">
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                      {[
                        { to: '/archive', label: 'Archive', desc: 'Browse by date', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                        { to: '/bookmarks', label: 'Bookmarks', desc: 'Saved articles', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
                        { to: '/feeds', label: 'Custom Feeds', desc: 'Your RSS sources', icon: 'M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 100-2 1 1 0 000 2z' },
                        { to: '/about', label: 'About', desc: 'PulseNewsToday', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                      ].map((link) => (
                        <Link key={link.to} to={link.to} className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--bg)] hover:border-[#e05d44]/20 dark:hover:border-[#e87461]/20 transition-colors no-underline group">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-[var(--text-muted)] group-hover:text-[#e05d44] dark:group-hover:text-[#e87461] shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d={link.icon} /></svg>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm text-[var(--text)] group-hover:text-[#e05d44] dark:group-hover:text-[#e87461] transition-colors leading-tight truncate">{link.label}</p>
                            <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] leading-tight truncate">{link.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );

              default:
                return null;
            }
          }

          return elements;
        })()}

        {allArticles.length === 0 && !loading && !error && (
          <p className="text-center text-sm text-[var(--text-muted)] mt-10">No articles found</p>
        )}
      </div>

      {/* Category customizer modal */}
      {showCustomizer && (
        <CategoryCustomizer
          sections={savedSections || DEFAULT_SECTIONS.map((s) => ({ ...s, pinned: true }))}
          onSave={setSavedSections}
          onClose={() => setShowCustomizer(false)}
        />
      )}
    </div>
  );
}
