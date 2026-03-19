import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchByCategory } from '../api/newsApi';
import useRegion from '../hooks/useRegion';
import useLanguage from '../hooks/useLanguage';
import NewsCard from '../components/NewsCard';
import Loader from '../components/Loader';

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
};

export default function Category() {
  const { category } = useParams();
  const { region, regionInfo } = useRegion();
  const { lang } = useLanguage();
  const [articles, setArticles] = useState([]);
  const [langArticles, setLangArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [langLoading, setLangLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch regional category news
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

  const loadMore = async () => {
    const lastArticle = articles[articles.length - 1];
    if (!lastArticle?.date || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await fetchByCategory(category, { region, before: lastArticle.date });
      const newArticles = result.articles.filter((a) => !articles.some((e) => e.id === a.id));
      setArticles((prev) => [...prev, ...newArticles]);
      setHasMore(newArticles.length >= 10);
    } catch {}
    setLoadingMore(false);
  };

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
  const isLangSwitching = lang !== 'en' && langLoading;
  const regionLabel = region && region !== 'world' ? regionInfo.label : 'the world';

  const catMeta = CATEGORY_META[category] || { title: `${category.charAt(0).toUpperCase() + category.slice(1)} News`, description: `Latest ${category} news and headlines from trusted sources worldwide.` };
  const canonicalUrl = `${SITE_URL}/category/${category}`;

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
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": SITE_URL
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": catMeta.title,
              "item": canonicalUrl
            }
          ]
        })}</script>
      </Helmet>

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

      {loading && displayArticles.length === 0 ? (
        <Loader count={9} />
      ) : (
        <div className={`transition-opacity duration-300 ${isLangSwitching ? 'opacity-40' : ''}`}>
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

          {/* Load More */}
          {hasMore && displayArticles.length >= 20 && lang === 'en' && (
            <div className="text-center mt-10">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 text-sm font-medium border border-[var(--border)] rounded-full text-[var(--text-secondary)] hover:text-[#e05d44] dark:hover:text-[#e87461] hover:border-[#e05d44]/30 dark:hover:border-[#e87461]/30 transition-all disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load older articles'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
