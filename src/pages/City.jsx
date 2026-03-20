import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchByCity, fetchCities } from '../api/newsApi';
import useCity from '../hooks/useCity';
import { LANGUAGES } from '../hooks/useLanguage';
import NewsCard from '../components/NewsCard';
import Loader, { HeroLoader } from '../components/Loader';

const SITE_URL = 'https://pulsenewstoday.com';

export default function City() {
  const { city: cityKey } = useParams();
  const { city: currentCity, setCity } = useCity();
  const [articles, setArticles] = useState([]);
  const [cityLang, setCityLang] = useState(null);
  const [cityLangLabel, setCityLangLabel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cityMeta, setCityMeta] = useState(null);
  const [allCities, setAllCities] = useState([]);

  useEffect(() => {
    fetchCities().then((data) => {
      const cities = data.cities || [];
      setAllCities(cities);
      setCityMeta(cities.find((c) => c.key === cityKey) || null);
    });
  }, [cityKey]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setArticles([]);

    fetchByCity(cityKey)
      .then((data) => {
        if (!ignore) {
          setArticles(data.articles || []);
          setCityLang(data.cityLang || null);
          setCityLangLabel(data.cityLangLabel || null);
        }
      })
      .catch(() => {
        if (!ignore) setArticles([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => { ignore = true; };
  }, [cityKey]);

  const isCurrentCity = cityKey === currentCity;
  const label = cityMeta?.label || cityKey;
  const regionCities = allCities.filter((c) => c.region === cityMeta?.region);

  // Split articles by language: local language first, then English
  const localLangArticles = cityLang ? articles.filter((a) => a.lang === cityLang) : [];
  const englishArticles = articles.filter((a) => !a.lang || a.lang === 'en');
  const hasLocalLang = cityLang && cityLang !== 'en' && localLangArticles.length > 0;
  const nativeLangLabel = LANGUAGES[cityLang]?.nativeLabel || cityLangLabel;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-10">
      <Helmet>
        <title>{label} News - PulseNewsToday</title>
        <meta name="description" content={`Latest local news from ${label} in ${cityLangLabel || 'English'} and English. Breaking stories, updates, and headlines.`} />
        <link rel="canonical" href={`${SITE_URL}/city/${cityKey}`} />
        <meta property="og:title" content={`${label} News - PulseNewsToday`} />
        <meta property="og:url" content={`${SITE_URL}/city/${cityKey}`} />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Header */}
      <div>
        <div className="inline-block px-3 py-1 bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461] text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
          Local News
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-3xl md:text-4xl font-normal text-[var(--text)]">
            {label}
          </h1>
          {isCurrentCity ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 rounded-full">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Your city
            </span>
          ) : (
            <button
              onClick={() => setCity(cityKey)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#e05d44] dark:bg-[#e87461] rounded-full hover:bg-[#c94e38] dark:hover:bg-[#d4634f] transition-colors"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              Set as my city
            </button>
          )}
        </div>
        <p className="text-[var(--text-muted)] mt-1 text-sm">
          Latest news from {label}
          {hasLocalLang && <> in {nativeLangLabel} &amp; English</>}
        </p>

        {/* City switcher — same region */}
        {regionCities.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {regionCities.map((c) => (
              <Link
                key={c.key}
                to={`/city/${c.key}`}
                className={`px-3 py-1.5 text-xs font-medium rounded-full no-underline transition-all ${
                  c.key === cityKey
                    ? 'bg-[#e05d44] dark:bg-[#e87461] text-white'
                    : 'bg-[var(--bg)] text-[var(--text-secondary)] hover:text-[#e05d44] dark:hover:text-[#e87461] border border-[var(--border)] hover:border-[#e05d44]/30 dark:hover:border-[#e87461]/30'
                }`}
              >
                {c.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {loading && articles.length === 0 && (
        <>
          <HeroLoader />
          <Loader count={8} />
        </>
      )}

      {!loading && articles.length === 0 && (
        <div className="text-center py-12 text-[var(--text-muted)]">
          <p className="text-sm">No local news available yet. Articles will appear after the next ingestion run.</p>
        </div>
      )}

      {/* Local language section — shown first when available */}
      {hasLocalLang && (
        <section>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-2xl font-normal text-[var(--text)]">{nativeLangLabel}</h2>
            <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#e05d44] dark:text-[#e87461] bg-[#fef0ed] dark:bg-[#e87461]/10 rounded-full">
              {cityLangLabel}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {localLangArticles.slice(0, 12).map((article, i) => (
              <div key={article.id} className="animate-fade-in h-full" style={{ animationDelay: `${i * 60}ms` }}>
                <NewsCard article={article} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* English section */}
      {englishArticles.length > 0 && (
        <section>
          <h2 className="text-2xl font-normal text-[var(--text)] mb-5">
            {hasLocalLang ? 'English' : `Latest from ${label}`}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {englishArticles.slice(0, 12).map((article, i) => (
              <div key={article.id} className="animate-fade-in h-full" style={{ animationDelay: `${i * 60}ms` }}>
                <NewsCard article={article} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
