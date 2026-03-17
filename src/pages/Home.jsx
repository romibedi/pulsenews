import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchByCategory } from '../api/newsApi';
import { fetchRssCategory } from '../api/rssApi';
import useLocalStorage from '../hooks/useLocalStorage';
import NewsCard from '../components/NewsCard';
import Loader, { HeroLoader } from '../components/Loader';
import CategoryCustomizer, { DEFAULT_SECTIONS } from '../components/CategoryCustomizer';
import StockTicker from '../components/StockTicker';
import NewsletterSignup from '../components/NewsletterSignup';
import PushNotifications from '../components/PushNotifications';

function mergeAndSort(guardianArticles, rssArticles) {
  const guardian = guardianArticles.map((a) => ({ ...a, source: a.source || 'The Guardian' }));
  const all = [...guardian, ...rssArticles];
  const seen = new Set();
  const unique = all.filter((a) => {
    const key = a.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return unique.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export default function Home() {
  const [savedSections, setSavedSections] = useLocalStorage('pulsenews-sections', null);
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCustomizer, setShowCustomizer] = useState(false);

  const activeSections = savedSections
    ? savedSections.filter((s) => s.pinned !== false)
    : DEFAULT_SECTIONS.slice(0, 4);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        for (const s of activeSections) {
          const [guardianResult, rssArticles] = await Promise.all([
            fetchByCategory(s.key),
            fetchRssCategory(s.key),
          ]);
          const merged = mergeAndSort(guardianResult.articles, rssArticles);
          setSections((prev) => ({ ...prev, [s.key]: merged }));
          if (s.key === activeSections[0]?.key) setLoading(false);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [savedSections]);

  const firstSection = activeSections[0]?.key || 'world';
  const mainArticles = sections[firstSection] || [];
  const featured = mainArticles[0];
  const latest = mainArticles.slice(1, 7);
  const more = mainArticles.slice(7, 13);

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
      {/* Hero */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-normal text-[var(--text)]">
              Today's <span className="gradient-text">Headlines</span>
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
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

        {loading ? (
          <HeroLoader />
        ) : featured ? (
          <div className="animate-fade-in">
            <NewsCard article={featured} featured />
          </div>
        ) : null}
      </section>

      {/* Latest from first section */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-normal text-[var(--text)]">Latest Stories</h2>
          <Link to={`/category/${firstSection}`} className="text-sm text-[#e05d44] dark:text-[#e87461] hover:text-[#c94e38] no-underline transition-colors">
            View all &rarr;
          </Link>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {latest.map((article, i) => (
              <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <NewsCard article={article} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Other section highlights */}
      {activeSections.slice(1).map((sec) => (
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
                <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
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
          <h2 className="text-2xl font-normal text-[var(--text)] mb-5">More Stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {more.map((article, i) => (
              <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <NewsCard article={article} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Widgets sidebar */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StockTicker />
        <NewsletterSignup />
        <div className="space-y-4">
          <PushNotifications />
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg text-[var(--text)] mb-3" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>Explore</h3>
            <div className="space-y-2">
              {[
                { to: '/map', label: 'World Map', desc: 'News plotted by region' },
                { to: '/sentiment', label: 'Sentiment', desc: 'Today\'s news tone' },
                { to: '/compare', label: 'Compare', desc: 'Same story, different sources' },
                { to: '/feeds', label: 'Custom Feeds', desc: 'Add your own RSS' },
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
