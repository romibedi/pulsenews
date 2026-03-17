import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchByCategory } from '../api/newsApi';
import NewsCard from '../components/NewsCard';
import Loader from '../components/Loader';

export default function Category() {
  const { category } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchByCategory(category);
        if (!ignore) setArticles(result.articles);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [category]);

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
          <button onClick={() => window.location.reload()} className="px-5 py-2 bg-[#e05d44] dark:bg-[#e87461] text-white rounded-full text-sm hover:bg-[#c94e38] transition-colors">
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
              <div key={article.id} className="animate-fade-in h-full" style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
                <NewsCard article={article} />
              </div>
            ))}
          </div>

          {articles.length === 0 && !error && (
            <p className="text-center text-sm text-[var(--text-muted)] mt-10">No articles found</p>
          )}
        </>
      )}
    </div>
  );
}
