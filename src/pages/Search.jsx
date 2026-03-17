import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchNews } from '../api/newsApi';
import NewsCard from '../components/NewsCard';
import Loader from '../components/Loader';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) return;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await searchNews(query);
        setArticles(data.articles);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [query]);

  if (!query) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-[var(--text-muted)]">Enter a search term to find news articles.</p>
        <Link to="/" className="text-[#e05d44] dark:text-[#e87461] mt-4 inline-block no-underline">&larr; Back to home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-8">
        <p className="text-sm text-[var(--text-muted)] mb-1">Search results for</p>
        <h1 className="text-3xl font-normal text-[var(--text)]">"{query}"</h1>
        {!loading && <p className="text-sm text-[var(--text-muted)] mt-2">{articles.length} articles found</p>}
      </div>

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {loading ? (
        <Loader count={6} />
      ) : articles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[var(--text-secondary)] text-lg mb-2">No results found</p>
          <p className="text-[var(--text-muted)] text-sm">Try a different search term</p>
          <Link to="/" className="text-[#e05d44] dark:text-[#e87461] mt-4 inline-block no-underline">&larr; Back to home</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article, i) => (
            <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <NewsCard article={article} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
