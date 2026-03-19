import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { searchNews } from '../api/newsApi';
import NewsCard from '../components/NewsCard';
import Loader from '../components/Loader';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [input, setInput] = useState(query);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Auto-focus the search input on mount
  useEffect(() => {
    if (!query && inputRef.current) inputRef.current.focus();
  }, []);

  // Sync input when query param changes
  useEffect(() => { setInput(query); }, [query]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      navigate(`/search?q=${encodeURIComponent(input.trim())}`);
    }
  };

  if (!query) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Search news articles..."
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-full px-5 py-3 pl-12 text-base text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#e05d44] dark:focus:border-[#e87461] focus:ring-1 focus:ring-[#e05d44] dark:focus:ring-[#e87461] transition-all"
              autoFocus
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </form>
        <p className="text-center text-sm text-[var(--text-muted)] mt-4">Search across all articles and languages</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Search input on results page too */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative max-w-lg">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search news articles..."
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-full px-5 py-2.5 pl-11 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#e05d44] dark:focus:border-[#e87461] focus:ring-1 focus:ring-[#e05d44] dark:focus:ring-[#e87461] transition-all"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </form>

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
            <div key={article.id} className="animate-fade-in h-full" style={{ animationDelay: `${i * 60}ms` }}>
              <NewsCard article={article} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
