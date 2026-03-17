import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchByCategory } from '../api/newsApi';
import useRegion from '../hooks/useRegion';
import useLanguage from '../hooks/useLanguage';
import NewsCard from '../components/NewsCard';
import Loader from '../components/Loader';

export default function Category() {
  const { category } = useParams();
  const { region, regionInfo } = useRegion();
  const { lang } = useLanguage();
  const [articles, setArticles] = useState([]);
  const [langArticles, setLangArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [langLoading, setLangLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch regional category news
  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchByCategory(category, { region });
        if (!ignore) setArticles(result.articles);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [category, region]);

  // Fetch language-specific news when non-English
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

  // When non-English, show language articles; otherwise regional articles
  const displayArticles = (lang !== 'en' && langArticles.length > 0) ? langArticles : articles;
  const isLoading = loading || (lang !== 'en' && langLoading);
  const regionLabel = region && region !== 'world' ? regionInfo.label : 'the world';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-8">
        <div className="inline-block px-3 py-1 bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461] text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
          {category}
        </div>
        <h1 className="text-3xl md:text-4xl font-normal text-[var(--text)] capitalize">{category}</h1>
        <p className="text-[var(--text-muted)] mt-1 text-sm">
          Latest {category} news from {regionLabel}
        </p>
      </div>

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-3">{error}</p>
          <button onClick={() => window.location.reload()} className="px-5 py-2 bg-[#e05d44] dark:bg-[#e87461] text-white rounded-full text-sm hover:bg-[#c94e38] transition-colors">
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <Loader count={9} />
      ) : (
        <>
          {displayArticles[0] && (
            <div className="mb-8 animate-fade-in">
              <NewsCard article={displayArticles[0]} featured />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayArticles.slice(1).map((article, i) => (
              <div key={article.id} className="animate-fade-in h-full" style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
                <NewsCard article={article} />
              </div>
            ))}
          </div>

          {displayArticles.length === 0 && !error && (
            <p className="text-center text-sm text-[var(--text-muted)] mt-10">No articles found</p>
          )}
        </>
      )}
    </div>
  );
}
