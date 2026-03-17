import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchByCategory } from '../api/newsApi';
import { fetchRssCategory } from '../api/rssApi';
import NewsCard from '../components/NewsCard';
import Loader from '../components/Loader';

export default function Category() {
  const { category } = useParams();
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPage(1);
    setArticles([]);
  }, [category]);

  useEffect(() => {
    async function load() {
      setLoading(true);
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
        setArticles(merged);
        setTotalPages(Math.min(guardianData.totalPages, 10));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-block px-3 py-1 bg-[#fef0ed] text-[#e05d44] text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
          Category
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] capitalize">{category}</h1>
        <p className="text-[#9a9a9a] mt-1 text-sm">Latest {category} news from around the world</p>
      </div>

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-3">{error}</p>
          <button onClick={() => setPage(1)} className="px-5 py-2 bg-[#e05d44] text-white rounded-full text-sm hover:bg-[#c94e38] transition-colors">
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
              <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                <NewsCard article={article} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 text-sm rounded-lg border border-[#e8e4df] text-[#6b6b6b] hover:text-[#e05d44] hover:border-[#e05d44] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        p === page
                          ? 'bg-[#e05d44] text-white'
                          : 'text-[#6b6b6b] hover:text-[#e05d44] hover:bg-[#fef0ed]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 text-sm rounded-lg border border-[#e8e4df] text-[#6b6b6b] hover:text-[#e05d44] hover:border-[#e05d44] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
