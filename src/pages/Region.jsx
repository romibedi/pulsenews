import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import useRegion, { REGIONS } from '../hooks/useRegion';
import useLanguage from '../hooks/useLanguage';
import NewsCard from '../components/NewsCard';
import Loader, { HeroLoader } from '../components/Loader';

const CATEGORIES = [
  { key: 'world', tKey: 'catTopStories' },
  { key: 'technology', tKey: 'catTechnology' },
  { key: 'business', tKey: 'catBusiness' },
  { key: 'sport', tKey: 'catSport' },
  { key: 'science', tKey: 'catScience' },
  { key: 'culture', tKey: 'catCulture' },
  { key: 'politics', tKey: 'catPolitics' },
];

export default function Region() {
  const { region } = useParams();
  const { region: currentRegion, setRegion } = useRegion();
  const { lang, t, tCat } = useLanguage();
  const isCurrentRegion = region === currentRegion;
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);

  const info = REGIONS[region] || { label: region, flag: '🌐' };

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setSections({});

    const langParam = lang && lang !== 'en' ? `&lang=${encodeURIComponent(lang)}` : '';

    Promise.all(
      CATEGORIES.map((cat) =>
        fetch(`/api/regional-feeds?region=${encodeURIComponent(region)}&category=${encodeURIComponent(cat.key)}${langParam}`)
          .then((r) => r.json())
          .then((data) => {
            if (!ignore) {
              setSections((prev) => ({ ...prev, [cat.key]: data.articles || [] }));
            }
          })
          .catch(() => {
            if (!ignore) setSections((prev) => ({ ...prev, [cat.key]: [] }));
          })
      )
    ).finally(() => {
      if (!ignore) setLoading(false);
    });

    return () => { ignore = true; };
  }, [region, lang]);

  const topArticles = sections.world || [];
  const featured = topArticles[0];
  const latest = topArticles.slice(1, 7);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-12">
      {/* Header */}
      <div>
        <div className="inline-block px-3 py-1 bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461] text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
          {t('region')}
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-3xl md:text-4xl font-normal text-[var(--text)]">
            {info.flag} {info.label}
          </h1>
          {isCurrentRegion ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 rounded-full">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              {t('yourRegion')}
            </span>
          ) : (
            <button
              onClick={() => setRegion(region)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#e05d44] dark:bg-[#e87461] rounded-full hover:bg-[#c94e38] dark:hover:bg-[#d4634f] transition-colors"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
              {t('setAsRegion')}
            </button>
          )}
        </div>
        <p className="text-[var(--text-muted)] mt-1 text-sm">{t('latestFrom')} {info.label}</p>

        {/* Region switcher */}
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(REGIONS).map(([key, r]) => (
            <Link
              key={key}
              to={`/region/${key}`}
              className={`px-3 py-1.5 text-xs font-medium rounded-full no-underline transition-all ${
                key === region
                  ? 'bg-[#e05d44] dark:bg-[#e87461] text-white'
                  : 'bg-[var(--bg)] text-[var(--text-secondary)] hover:text-[#e05d44] dark:hover:text-[#e87461] border border-[var(--border)] hover:border-[#e05d44]/30 dark:hover:border-[#e87461]/30'
              }`}
            >
              {r.flag} {r.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Hero — Top Stories */}
      <section>
        {loading && !featured ? (
          <HeroLoader />
        ) : featured ? (
          <div className="animate-fade-in">
            <NewsCard article={featured} featured />
          </div>
        ) : null}
      </section>

      {/* Latest from top stories */}
      {latest.length > 0 && (
        <section>
          <h2 className="text-2xl font-normal text-[var(--text)] mb-5">{t('latestFromShort')} {info.label}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {latest.map((article, i) => (
              <div key={article.id} className="animate-fade-in h-full" style={{ animationDelay: `${i * 80}ms` }}>
                <NewsCard article={article} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Category sections */}
      {CATEGORIES.slice(1).map((cat) => {
        const catArticles = sections[cat.key];
        if (!catArticles && !loading) return null;

        return (
          <section key={cat.key}>
            <h2 className="text-2xl font-normal text-[var(--text)] mb-5">{t(cat.tKey)}</h2>
            {!catArticles ? (
              <Loader count={4} />
            ) : catArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {catArticles.slice(0, 4).map((article, i) => (
                  <div key={article.id} className="animate-fade-in h-full" style={{ animationDelay: `${i * 80}ms` }}>
                    <NewsCard article={article} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">{t('noNewsAvailable')}</p>
            )}
          </section>
        );
      })}

      {loading && Object.keys(sections).length === 0 && (
        <Loader count={12} />
      )}
    </div>
  );
}
