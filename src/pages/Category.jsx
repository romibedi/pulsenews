import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchByCategory, CATEGORIES } from '../api/newsApi';
import useRegion, { REGIONS } from '../hooks/useRegion';
import useLanguage from '../hooks/useLanguage';
import useAudio from '../contexts/AudioContext';
import NewsCard from '../components/NewsCard';
import Loader from '../components/Loader';
import StockTicker from '../components/StockTicker';

const SITE_URL = 'https://pulsenewstoday.com';

const CATEGORY_META = {
  world: { title: 'World News', description: 'Latest world news and international headlines from trusted global sources.' },
  technology: { title: 'Technology News', description: 'Breaking technology news, gadget reviews, and innovation stories from top tech sources.' },
  business: { title: 'Business News', description: 'Financial markets, economy, and business news from leading sources worldwide.' },
  science: { title: 'Science News', description: 'Scientific discoveries, research breakthroughs, and space exploration news.' },
  sport: { title: 'Sports News', description: 'Live sports scores, match results, and athletics coverage from around the world.' },
  sports: { title: 'Sports News', description: 'Live sports scores, match results, and athletics coverage from around the world.' },
  culture: { title: 'Culture & Entertainment', description: 'Arts, entertainment, movies, music, and cultural news from across the globe.' },
  environment: { title: 'Environment News', description: 'Climate change, sustainability, wildlife, and environmental news and analysis.' },
  politics: { title: 'Politics News', description: 'Political news, elections, policy analysis, and government coverage.' },
  ai: { title: 'AI News', description: 'Artificial intelligence breakthroughs, machine learning research, and AI industry news from leading tech sources.' },
  entertainment: { title: 'Entertainment News', description: 'Movies, TV shows, music, celebrities, and pop culture news from top entertainment sources.' },
  gaming: { title: 'Gaming News', description: 'Video game releases, reviews, esports, and gaming industry news from trusted sources.' },
  cricket: { title: 'Cricket News', description: 'Live cricket scores, match updates, player news, and tournament coverage from around the world.' },
  startups: { title: 'Startup & VC News', description: 'Startup funding, venture capital deals, founder stories, and entrepreneurship news.' },
  space: { title: 'Space News', description: 'Space exploration, rocket launches, astronomy discoveries, and NASA updates.' },
  crypto: { title: 'Crypto News', description: 'Cryptocurrency prices, blockchain technology, DeFi, and digital asset news from top crypto sources.' },
};

const STOP_WORDS = new Set([
  'the','a','an','in','on','at','to','for','of','and','or','but','is','are','was','were',
  'be','been','has','have','had','do','does','did','will','would','could','should','may',
  'might','can','with','from','by','as','it','its','this','that','not','no','new','after',
  'over','says','said','how','what','why','when','where','who','which','more','most','also',
  'than','up','out','about','into','all','some','their','they','he','she','his','her','we',
  "'s","—","–","-","vs","via","amid",
]);

function extractKeywords(title) {
  return (title || '').toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function clusterArticles(articles, maxClusters = 3) {
  if (articles.length < 6) return [];
  const kwMap = new Map();
  articles.forEach((a, idx) => {
    extractKeywords(a.title).forEach((kw) => {
      if (!kwMap.has(kw)) kwMap.set(kw, []);
      kwMap.get(kw).push(idx);
    });
  });
  const candidates = [...kwMap.entries()]
    .filter(([, idxs]) => idxs.length >= 2 && idxs.length <= 5)
    .sort((a, b) => b[1].length - a[1].length);
  const usedIndices = new Set();
  const clusters = [];
  for (const [keyword, indices] of candidates) {
    if (clusters.length >= maxClusters) break;
    const ci = indices.filter((i) => !usedIndices.has(i)).slice(0, 3);
    if (ci.length < 2) continue;
    ci.forEach((i) => usedIndices.add(i));
    clusters.push({ topic: keyword.charAt(0).toUpperCase() + keyword.slice(1), articles: ci.map((i) => articles[i]) });
  }
  return clusters;
}

function extractPullquote(article) {
  const desc = (article.description || '').replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
  if (desc.length < 40) return null;
  const sentences = desc.split(/[.!?]+/).filter((s) => s.trim().length > 30 && s.trim().length < 200);
  return sentences[0] ? sentences[0].trim() + '.' : null;
}

const RELATED_CATEGORIES = {
  world: ['politics', 'environment', 'culture'],
  technology: ['ai', 'startups', 'science'],
  business: ['crypto', 'startups', 'technology'],
  science: ['space', 'technology', 'environment'],
  sport: ['cricket', 'entertainment', 'world'],
  sports: ['cricket', 'entertainment', 'world'],
  culture: ['entertainment', 'world', 'politics'],
  environment: ['science', 'world', 'politics'],
  politics: ['world', 'business', 'environment'],
  ai: ['technology', 'science', 'startups'],
  entertainment: ['culture', 'gaming', 'sport'],
  gaming: ['entertainment', 'technology', 'ai'],
  cricket: ['sport', 'world', 'entertainment'],
  startups: ['business', 'technology', 'ai'],
  space: ['science', 'technology', 'ai'],
  crypto: ['business', 'technology', 'startups'],
};

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Category() {
  const { category } = useParams();
  const { region, regionInfo } = useRegion();
  const { lang } = useLanguage();
  const { playArticle, addToQueue } = useAudio();
  const [articles, setArticles] = useState([]);
  const [langArticles, setLangArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [langLoading, setLangLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      setHasMore(true);
      try {
        const result = await fetchByCategory(category, { region });
        if (!ignore) {
          setArticles(result.articles);
          setHasMore(result.articles.length >= 20);
        }
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [category, region]);

  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore || lang !== 'en') return;
    const lastArticle = articles[articles.length - 1];
    if (!lastArticle?.date) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const result = await fetchByCategory(category, { region, before: lastArticle.date });
      const newArticles = result.articles.filter((a) => !articles.some((e) => e.id === a.id));
      setArticles((prev) => [...prev, ...newArticles]);
      setHasMore(newArticles.length >= 10);
    } catch {}
    setLoadingMore(false);
    loadingMoreRef.current = false;
  }, [articles, category, region, hasMore, lang]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: '400px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => {
    if (lang === 'en') { setLangArticles([]); setLangLoading(false); return; }
    let ignore = false;
    setLangLoading(true);
    fetch(`/api/lang-feeds?lang=${encodeURIComponent(lang)}`)
      .then((r) => r.json())
      .then((data) => { if (!ignore) setLangArticles(data.articles || []); })
      .catch(() => { if (!ignore) setLangArticles([]); })
      .finally(() => { if (!ignore) setLangLoading(false); });
    return () => { ignore = true; };
  }, [lang]);

  const displayArticles = (lang !== 'en' && langArticles.length > 0) ? langArticles : articles;
  const isLangSwitching = lang !== 'en' && langLoading;
  const regionLabel = region && region !== 'world' ? regionInfo.label : 'the world';
  const catMeta = CATEGORY_META[category] || { title: `${category.charAt(0).toUpperCase() + category.slice(1)} News`, description: `Latest ${category} news and headlines from trusted sources worldwide.` };
  const canonicalUrl = `${SITE_URL}/category/${category}`;

  const clusters = useMemo(() => clusterArticles(displayArticles), [displayArticles]);
  const clusteredIds = useMemo(() => new Set(clusters.flatMap((c) => c.articles.map((a) => a.id))), [clusters]);
  const related = (RELATED_CATEGORIES[category] || ['world', 'technology', 'business']).filter((c) => CATEGORIES.includes(c));
  const showMarket = ['business', 'crypto', 'startups', 'technology'].includes(category);

  const sources = useMemo(() => {
    const seen = new Set();
    return displayArticles.filter((a) => {
      if (!a.source || seen.has(a.source)) return false;
      seen.add(a.source);
      return true;
    }).slice(0, 10).map((a) => a.source);
  }, [displayArticles]);

  const hero = displayArticles[0];
  const gridArticles = displayArticles.slice(1).filter((a) => !clusteredIds.has(a.id));
  const pullquoteArticle = displayArticles.slice(3, 9).find((a) => extractPullquote(a));
  const pullquote = pullquoteArticle ? extractPullquote(pullquoteArticle) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <Helmet>
        <title>{`${catMeta.title} - PulseNewsToday`}</title>
        <meta name="description" content={catMeta.description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${catMeta.title} - PulseNewsToday`} />
        <meta property="og:description" content={catMeta.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={`${SITE_URL}/favicon.svg`} />
        <meta property="og:site_name" content="PulseNewsToday" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${catMeta.title} - PulseNewsToday`} />
        <meta name="twitter:description" content={catMeta.description} />
        <meta name="twitter:image" content={`${SITE_URL}/favicon.svg`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
            { "@type": "ListItem", "position": 2, "name": catMeta.title, "item": canonicalUrl },
          ]
        })}</script>
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="inline-block px-3 py-1 bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461] text-xs font-semibold rounded-full uppercase tracking-wider">
            {category}
          </span>
          {isLangSwitching && (
            <span className="text-xs text-[var(--text-muted)] animate-pulse">Loading...</span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-normal text-[var(--text)] capitalize">{category}</h1>
        <p className="text-[var(--text-muted)] mt-1 text-sm">Latest {category} news from {regionLabel}</p>
      </div>

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-3">{error}</p>
          <button onClick={() => window.location.reload()} className="px-5 py-2 bg-[#e05d44] dark:bg-[#e87461] text-white rounded-full text-sm hover:bg-[#c94e38] transition-colors">Retry</button>
        </div>
      )}

      {loading && displayArticles.length === 0 ? (
        <Loader count={9} />
      ) : (
        <div className={`space-y-10 transition-opacity duration-300 ${isLangSwitching ? 'opacity-40' : ''}`}>

          {/* ── Hero ───────────────────────────────────────────────── */}
          {hero && (
            <div className="animate-fade-in">
              <NewsCard article={hero} featured />
            </div>
          )}

          {/* ── Audio briefing ─────────────────────────────────────── */}
          {displayArticles.length >= 3 && (
            <div className="bg-gradient-to-r from-[#fef0ed] to-[#fef8f6] dark:from-[#e87461]/10 dark:to-[#e87461]/5 rounded-2xl p-5 flex items-center gap-4 border border-[#e05d44]/10 dark:border-[#e87461]/20">
              <button
                onClick={() => {
                  playArticle({
                    id: `briefing-${category}-${Date.now()}`,
                    title: `${catMeta.title} Briefing`,
                    body: displayArticles.slice(0, 5).map((a) => a.title).join('. '),
                    source: 'PulseNewsToday',
                    date: new Date().toISOString(),
                  });
                }}
                className="shrink-0 w-12 h-12 bg-[#e05d44] dark:bg-[#e87461] text-white rounded-full flex items-center justify-center hover:bg-[#c94e38] transition-colors shadow-md"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#e05d44] dark:text-[#e87461]">Today's {catMeta.title} Briefing</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Listen to a 60-second audio summary of the top stories</p>
              </div>
              <button
                onClick={() => {
                  playArticle({
                    id: `briefing-${category}-${Date.now()}`,
                    title: `${catMeta.title} Briefing`,
                    body: displayArticles.slice(0, 3).map((a) => a.title).join('. '),
                    source: 'PulseNewsToday',
                    date: new Date().toISOString(),
                  });
                  displayArticles.slice(0, 5).forEach((a) => addToQueue(a));
                }}
                className="shrink-0 text-xs text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors whitespace-nowrap"
              >
                + Queue all
              </button>
            </div>
          )}

          {/* ── Interleaved article grids + break sections ─────── */}
          {(() => {
            // Build a pool of break elements to interleave between article grid chunks
            const breaks = [];

            // Trending clusters — each one is its own break
            clusters.forEach((cluster) => {
              breaks.push({ type: 'cluster', key: `cluster-${cluster.topic}`, cluster });
            });

            // Pullquote
            if (pullquote) {
              breaks.push({ type: 'pullquote', key: 'pullquote' });
            }

            // Related topics strip (single card, not a 3-col row)
            if (gridArticles.length > 3) {
              breaks.push({ type: 'related', key: 'related' });
            }

            // Sources + Trending chips
            if (sources.length > 0) {
              breaks.push({ type: 'sources', key: 'sources' });
            }

            // Regions strip
            if (gridArticles.length > 6) {
              breaks.push({ type: 'regions', key: 'regions' });
            }

            // Market widget (for relevant categories)
            if (showMarket) {
              breaks.push({ type: 'market', key: 'market' });
            }

            // Explore links
            breaks.push({ type: 'explore', key: 'explore' });

            // Split articles into chunks of 3 (one grid row each)
            const CHUNK_SIZE = 3;
            const chunks = [];
            for (let i = 0; i < gridArticles.length; i += CHUNK_SIZE) {
              chunks.push(gridArticles.slice(i, i + CHUNK_SIZE));
            }

            // Interleave: 2 grid chunks, 1 break, 2 grid chunks, 1 break, ...
            // First mid-feature at chunk 4 (article ~13), then every 4 chunks
            const elements = [];
            let breakIdx = 0;
            let midFeatureCount = 0;

            chunks.forEach((chunk, ci) => {
              // Mid-story wide feature every 4 chunks (starting at chunk 4)
              if (ci > 0 && ci % 4 === 0 && chunk[0]) {
                midFeatureCount++;
                const a = chunk[0];
                const rest = chunk.slice(1);
                elements.push(
                  <div key={`mid-${a.id}`} className="animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                      {a.image && <img src={a.image} alt="" className="w-full h-56 md:h-full object-cover" loading="lazy" />}
                      <div className="p-6 flex flex-col justify-center">
                        <span className="text-[10px] font-semibold text-[#e05d44] dark:text-[#e87461] uppercase tracking-wider mb-2">Featured</span>
                        <Link
                          to={a.slug ? `/news/${a.slug}` : `/article/${encodeURIComponent(a.id)}`}
                          className="text-xl font-medium text-[var(--text)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline leading-snug"
                          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                        >{a.title}</Link>
                        <p className="text-sm text-[var(--text-muted)] mt-2 line-clamp-3 leading-relaxed">
                          {(a.description || '').replace(/<[^>]*>/g, '').slice(0, 250)}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-3">{a.source}{a.date ? ` · ${timeAgo(a.date)}` : ''}</p>
                      </div>
                    </div>
                  </div>
                );
                // Render remaining articles from this chunk
                if (rest.length > 0) {
                  elements.push(
                    <div key={`chunk-rest-${ci}`} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {rest.map((article) => (
                        <div key={article.id} className="animate-fade-in h-full"><NewsCard article={article} /></div>
                      ))}
                    </div>
                  );
                }
              } else {
                // Normal 3-col grid chunk
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

              // Insert a break after every 2 grid chunks (if we have breaks left)
              if ((ci + 1) % 2 === 0 && breakIdx < breaks.length) {
                const br = breaks[breakIdx++];
                elements.push(renderBreak(br));
              }
            });

            // Append any remaining breaks at the end
            while (breakIdx < breaks.length) {
              elements.push(renderBreak(breaks[breakIdx++]));
            }

            // --- Break renderers ---
            function renderBreak(br) {
              switch (br.type) {
                case 'cluster':
                  return (
                    <div key={br.key} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e05d44] dark:bg-[#e87461]" />
                        <h3 className="text-sm font-semibold text-[var(--text)] uppercase tracking-wider">Trending: {br.cluster.topic}</h3>
                        <span className="text-xs text-[var(--text-muted)]">{br.cluster.articles.length} stories</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {br.cluster.articles.map((article) => (
                          <Link key={article.id} to={article.slug ? `/news/${article.slug}` : `/article/${encodeURIComponent(article.id)}`} className="flex gap-3 p-2 rounded-lg hover:bg-[var(--bg)] transition-colors no-underline group">
                            {article.image && <img src={article.image} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" loading="lazy" />}
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
                  return (
                    <div key={br.key} className="relative py-4">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]" /></div>
                      <div className="relative bg-[var(--bg)] mx-auto max-w-2xl px-6 py-5 rounded-xl border border-[var(--border)]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[#e05d44]/20 dark:text-[#e87461]/20 mb-2">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                        <p className="text-base text-[var(--text)] leading-relaxed italic" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>{pullquote}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-2">
                          — {pullquoteArticle.source || 'Source'}{pullquoteArticle.title ? `, "${pullquoteArticle.title.slice(0, 60)}${pullquoteArticle.title.length > 60 ? '...' : ''}"` : ''}
                        </p>
                      </div>
                    </div>
                  );

                case 'related':
                  return (
                    <div key={br.key} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
                      <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-3">Related Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {related.map((cat) => (
                          <Link key={cat} to={`/category/${cat}`} className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] hover:border-[#e05d44]/30 dark:hover:border-[#e87461]/30 hover:bg-[var(--bg)] transition-colors no-underline group">
                            <span className="text-sm text-[var(--text)] group-hover:text-[#e05d44] dark:group-hover:text-[#e87461] transition-colors capitalize">{cat}</span>
                            <svg className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[#e05d44] dark:group-hover:text-[#e87461]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );

                case 'sources':
                  return (
                    <div key={br.key} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
                      <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-3">Sources</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {sources.map((s) => (
                          <span key={s} className="px-3 py-1.5 text-xs bg-[var(--bg)] rounded-full text-[var(--text-muted)] border border-[var(--border)]">{s}</span>
                        ))}
                      </div>
                    </div>
                  );

                case 'regions':
                  return (
                    <div key={br.key} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
                      <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-3">Explore Regions</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(REGIONS).map(([key, info]) => (
                          <Link key={key} to={`/region/${key}`} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs no-underline transition-colors ${key === region ? 'bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461] font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]'}`}>
                            <span>{info.flag}</span><span>{info.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );

                case 'market':
                  return <div key={br.key}><StockTicker /></div>;

                case 'explore':
                  return (
                    <div key={br.key} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
                      <div className="flex flex-wrap gap-3">
                        {[
                          { to: '/archive', label: 'Archive', desc: 'Browse by date', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                          { to: '/bookmarks', label: 'Bookmarks', desc: 'Saved articles', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
                          { to: '/feeds', label: 'Custom Feeds', desc: 'Your RSS sources', icon: 'M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 100-2 1 1 0 000 2z' },
                          { to: '/about', label: 'About', desc: 'PulseNewsToday', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                        ].map((link) => (
                          <Link key={link.to} to={link.to} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--bg)] hover:border-[#e05d44]/20 dark:hover:border-[#e87461]/20 transition-colors no-underline group">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-[var(--text-muted)] group-hover:text-[#e05d44] dark:group-hover:text-[#e87461] shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d={link.icon} /></svg>
                            <div>
                              <p className="text-sm text-[var(--text)] group-hover:text-[#e05d44] dark:group-hover:text-[#e87461] transition-colors leading-tight">{link.label}</p>
                              <p className="text-[10px] text-[var(--text-muted)] leading-tight">{link.desc}</p>
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

          {displayArticles.length === 0 && !error && (
            <p className="text-center text-sm text-[var(--text-muted)] mt-10">No articles found</p>
          )}

          {/* Infinite scroll sentinel */}
          {hasMore && displayArticles.length >= 20 && lang === 'en' && (
            <div ref={sentinelRef} className="flex justify-center py-8">
              {loadingMore && <Loader count={3} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
