import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchByCategory } from '../api/newsApi';
import useLocalStorage from '../hooks/useLocalStorage';
import useRegion, { REGIONS } from '../hooks/useRegion';
import useLanguage from '../hooks/useLanguage';
import NewsCard from '../components/NewsCard';
import Loader, { HeroLoader } from '../components/Loader';
import CategoryCustomizer, { DEFAULT_SECTIONS } from '../components/CategoryCustomizer';
import StockTicker from '../components/StockTicker';
import useAudio from '../contexts/AudioContext';

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
  const { playArticle, addToQueue } = useAudio();

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

  const firstSection = activeSections[0]?.key || 'world';
  const englishArticles = sections[firstSection] || [];
  const isNonEnglish = lang !== 'en';
  const hasLangContent = isNonEnglish && langArticles.length > 0;
  const mainArticles = hasLangContent ? langArticles : englishArticles;
  const isLangSwitching = isNonEnglish && langLoading && !hasLangContent;
  const featured = mainArticles[0];
  const latest = mainArticles.slice(1, 7);
  // For non-English: use more of the language articles since we won't show category sections
  const more = isNonEnglish ? mainArticles.slice(7, 19) : mainArticles.slice(7, 13);

  const regionLabel = region && region !== 'world' ? regionInfo.label : 'World';

  if (error && !featured) {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-12">
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
          "publisher": {
            "@type": "Organization",
            "name": "PulseNewsToday",
            "url": SITE_URL
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${SITE_URL}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": SITE_URL
            }
          ]
        })}</script>
      </Helmet>

      {/* Hero */}
      <section>
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

        {loading && !featured ? (
          <HeroLoader />
        ) : featured ? (
          <div className={`animate-fade-in transition-opacity duration-300 ${isLangSwitching ? 'opacity-40' : ''}`}>
            <NewsCard article={featured} featured />
          </div>
        ) : null}
      </section>

      {/* Latest from first section */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-normal text-[var(--text)]">{t('latest')}</h2>
            {isLangSwitching && (
              <span className="text-xs text-[var(--text-muted)] animate-pulse">Loading...</span>
            )}
            {!loading && !isLangSwitching && latest.length > 0 && (
              <button
                onClick={() => {
                  if (latest.length > 0) {
                    playArticle(latest[0]);
                    latest.slice(1).forEach((a) => addToQueue(a));
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-[var(--text-secondary)] border border-[var(--border)] rounded-full hover:text-[#e05d44] dark:hover:text-[#e87461] hover:border-[#e05d44]/30 dark:hover:border-[#e87461]/30 transition-all"
                title="Listen to all headlines"
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Listen
              </button>
            )}
          </div>
          <Link to={`/category/${firstSection}`} className="text-sm text-[#e05d44] dark:text-[#e87461] hover:text-[#c94e38] no-underline transition-colors">
            {t('viewAll')} &rarr;
          </Link>
        </div>
        {loading && latest.length === 0 ? (
          <Loader />
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 transition-opacity duration-300 ${isLangSwitching ? 'opacity-40' : ''}`}>
            {latest.map((article, i) => (
              <div key={article.id} className="animate-fade-in h-full" style={{ animationDelay: `${i * 80}ms` }}>
                <NewsCard article={article} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Other section highlights — only shown in English mode */}
      {!isNonEnglish && activeSections.slice(1).map((sec) => (
        <section key={sec.key}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-normal text-[var(--text)]">{sec.label}</h2>
            <Link
              to={`/category/${sec.key}`}
              className="text-sm text-[#e05d44] dark:text-[#e87461] hover:text-[#c94e38] no-underline transition-colors"
            >
              View all &rarr;
            </Link>
          </div>
          {!sections[sec.key] ? (
            <Loader count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {(sections[sec.key] || []).slice(0, 4).map((article, i) => (
                <div key={article.id} className="animate-fade-in h-full" style={{ animationDelay: `${i * 80}ms` }}>
                  <NewsCard article={article} />
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* More stories */}
      {!loading && more.length > 0 && (
        <section>
          <h2 className="text-2xl font-normal text-[var(--text)] mb-5">{t('more')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {more.map((article, i) => (
              <div key={article.id} className="animate-fade-in h-full" style={{ animationDelay: `${i * 80}ms` }}>
                <NewsCard article={article} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Explore Regions + Widgets */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl text-[var(--text)] mb-1" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            Explore by Region
          </h3>
          <p className="text-xs text-[var(--text-muted)] mb-5">News from around the world</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(REGIONS).map(([key, info]) => (
              <Link
                key={key}
                to={`/region/${key}`}
                className={`group flex items-center gap-3 p-3 rounded-xl border transition-all no-underline ${
                  key === region
                    ? 'border-[#e05d44]/40 dark:border-[#e87461]/40 bg-[#fef0ed] dark:bg-[#e87461]/5'
                    : 'border-[var(--border)] hover:border-[#e05d44]/30 dark:hover:border-[#e87461]/30 hover:bg-[var(--bg)]'
                }`}
              >
                <span className="text-2xl">{info.flag}</span>
                <div>
                  <p className={`text-sm font-medium transition-colors ${
                    key === region
                      ? 'text-[#e05d44] dark:text-[#e87461]'
                      : 'text-[var(--text)] group-hover:text-[#e05d44] dark:group-hover:text-[#e87461]'
                  }`}>{info.label}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <StockTicker />
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg text-[var(--text)] mb-3" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>Explore</h3>
            <div className="space-y-2">
              {[
                { to: '/feeds', label: 'Custom Feeds', desc: 'Add your own RSS sources' },
                { to: '/bookmarks', label: 'Bookmarks', desc: 'Your saved articles' },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg)] transition-colors no-underline group">
                  <div>
                    <p className="text-sm font-medium text-[var(--text)] group-hover:text-[#e05d44] dark:group-hover:text-[#e87461] transition-colors">{link.label}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{link.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#e05d44] dark:group-hover:text-[#e87461]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

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
