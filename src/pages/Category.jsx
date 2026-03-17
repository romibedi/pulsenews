import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchByCategory } from '../api/newsApi';
import { fetchRssCategory } from '../api/rssApi';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import NewsCard from '../components/NewsCard';
import Loader from '../components/Loader';

export default function Category() {
  const { category } = useParams();
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [seenIds] = useState(() => new Set());

  // Reset on category change
  useEffect(() => {
    setPage(1);
    setArticles([]);
    seenIds.clear();
  }, [category]);

  useEffect(() => {
    async function load() {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      setError(null);
      try {
        const [guardianData, rssArticles] = await Promise.all([
          fetchByCategory(category, page),
          page === 1 ? fetchRssCategory(category) : Promise.resolve([]),
        ]);
        const guardian = guardianData.articles.map((a) => ({ ...a, source: a.source || 'The Guardian' }));
        let merged;
        if (page === 1) {
          const all = [...guardian, ...rssArticles];
          const seen = new Set();
          merged = all.filter((a) => {
            const key = a.title.toLowerCase().trim();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          }).sort((a, b) => new Date(b.date) - new Date(a.date));
        } else {
          merged = guardian;
        }

        // De-duplicate across pages
        const newArticles = merged.filter((a) => !seenIds.has(a.id));
        newArticles.forEach((a) => seenIds.add(a.id));

        if (page === 1) {
          setArticles(newArticles);
        } else {
          setArticles((prev) => [...prev, ...newArticles]);
        }
        setTotalPages(Math.min(guardianData.totalPages, 10));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    }
    load();
  }, [category, page]);

  const hasMore = page < totalPages && !loadingMore;

  const loadNext = useCallback(() => {
    if (hasMore && !loadingMore) {
      setPage((p) => p + 1);
    }
  }, [hasMore, loadingMore]);

  const sentinelRef = useInfiniteScroll(loadNext, hasMore);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-block px-3 py-1 bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461] text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
          Category
        </div>
        <h1 className="text-3xl md:text-4xl font-normal text-[var(--text)] capitalize">{category}</h1>
        <p className="text-[var(--text-muted)] mt-1 text-sm">Latest {category} news from around the world</p>
      </div>

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-3">{error}</p>
          <button onClick={() => setPage(1)} className="px-5 py-2 bg-[#e05d44] dark:bg-[#e87461] text-white rounded-full text-sm hover:bg-[#c94e38] transition-colors">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <Loader count={9} />
      ) : (
        <>
          {/* Featured top article */}
          {articles[0] && (
            <div className="mb-8 animate-fade-in">
              <NewsCard article={articles[0]} featured />
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.slice(1).map((article, i) => (
              <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
                <NewsCard article={article} />
              </div>
            ))}
          </div>

          {/* Loading more */}
          {loadingMore && (
            <div className="mt-8">
              <Loader count={3} />
            </div>
          )}

          {/* Infinite scroll sentinel */}
          {hasMore && <div ref={sentinelRef} className="h-4" />}

          {/* End of content */}
          {!hasMore && articles.length > 0 && (
            <p className="text-center text-sm text-[var(--text-muted)] mt-10">You've reached the end</p>
          )}
        </>
      )}
    </div>
  );
}
