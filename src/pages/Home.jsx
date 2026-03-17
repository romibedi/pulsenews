import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchByCategory } from '../api/newsApi';
import { fetchRssCategory } from '../api/rssApi';
import NewsCard from '../components/NewsCard';
import Loader, { HeroLoader } from '../components/Loader';

const ALL_SECTIONS = [
  { key: 'world', label: 'World' },
  { key: 'technology', label: 'Technology' },
  { key: 'business', label: 'Business' },
  { key: 'science', label: 'Science' },
];

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
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        for (const s of ALL_SECTIONS) {
          const [guardianResult, rssArticles] = await Promise.all([
            fetchByCategory(s.key),
            fetchRssCategory(s.key),
          ]);
          const merged = mergeAndSort(guardianResult.articles, rssArticles);
          setSections((prev) => ({ ...prev, [s.key]: merged }));
          if (s.key === 'world') setLoading(false);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const worldArticles = sections.world || [];
  const featured = worldArticles[0];
  const latest = worldArticles.slice(1, 7);
  const more = worldArticles.slice(7, 13);

  if (error && !featured) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-red-500 mb-4 text-lg">Something went wrong</div>
        <p className="text-[#9a9a9a]">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-[#e05d44] text-white rounded-full hover:bg-[#c94e38] transition-colors">
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
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a1a]">
              Today's <span className="gradient-text">Headlines</span>
            </h1>
            <p className="text-sm text-[#9a9a9a] mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {loading ? (
          <HeroLoader />
        ) : featured ? (
          <div className="animate-fade-in">
            <NewsCard article={featured} featured />
          </div>
        ) : null}
      </section>

      {/* Latest */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Latest Stories</h2>
          <Link to="/category/world" className="text-sm text-[#e05d44] hover:text-[#c94e38] no-underline transition-colors">
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

      {/* Section highlights */}
      {ALL_SECTIONS.filter((s) => s.key !== 'world').map((sec) => (
        <section key={sec.key}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-[#1a1a1a]">{sec.label}</h2>
            <Link
              to={`/category/${sec.key}`}
              className="text-sm text-[#e05d44] hover:text-[#c94e38] no-underline transition-colors"
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
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-5">More Stories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {more.map((article, i) => (
              <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <NewsCard article={article} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
