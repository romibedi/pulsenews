import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchCities } from '../api/newsApi';
import { LANGUAGES } from '../hooks/useLanguage';
import useCity from '../hooks/useCity';

const SITE_URL = 'https://pulsenewstoday.com';

const REGION_META = {
  india: { label: 'India', flag: '\ud83c\uddee\ud83c\uddf3' },
  uk: { label: 'United Kingdom', flag: '\ud83c\uddec\ud83c\udde7' },
  us: { label: 'United States', flag: '\ud83c\uddfa\ud83c\uddf8' },
  australia: { label: 'Australia', flag: '\ud83c\udde6\ud83c\uddfa' },
};

const REGION_ORDER = ['india', 'uk', 'us', 'australia'];

export default function Cities() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { city: currentCity } = useCity();

  useEffect(() => {
    fetchCities()
      .then((data) => setCities(data.cities || []))
      .finally(() => setLoading(false));
  }, []);

  const grouped = REGION_ORDER.reduce((acc, region) => {
    acc[region] = cities.filter((c) => c.region === region);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-10">
      <Helmet>
        <title>City News - Local News from 31 Cities Worldwide - PulseNewsToday</title>
        <meta name="description" content="Browse local news from 31 cities across India, UK, US and Australia. Get hyperlocal coverage in local languages." />
        <link rel="canonical" href={`${SITE_URL}/cities`} />
        <meta property="og:title" content="City News - PulseNewsToday" />
        <meta property="og:url" content={`${SITE_URL}/cities`} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div>
        <div className="inline-block px-3 py-1 bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461] text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
          Hyperlocal
        </div>
        <h1 className="text-3xl md:text-4xl font-normal text-[var(--text)]">City News</h1>
        <p className="text-[var(--text-muted)] mt-1 text-sm">Local news from 31 cities across 4 countries, in local languages</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-[var(--bg)] animate-pulse" />
          ))}
        </div>
      ) : (
        REGION_ORDER.map((region) => {
          const regionCities = grouped[region];
          if (!regionCities || regionCities.length === 0) return null;
          const meta = REGION_META[region];
          return (
            <section key={region}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{meta.flag}</span>
                <h2 className="text-xl font-normal text-[var(--text)]">{meta.label}</h2>
                <span className="text-xs text-[var(--text-muted)]">{regionCities.length} cities</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {regionCities.map((city) => {
                  const isCurrent = city.key === currentCity;
                  const langInfo = city.lang ? LANGUAGES[city.lang] : null;
                  return (
                    <Link
                      key={city.key}
                      to={`/city/${city.key}`}
                      className={`group relative p-4 rounded-xl border no-underline transition-all hover:shadow-md ${
                        isCurrent
                          ? 'border-[#e05d44]/30 dark:border-[#e87461]/30 bg-[#fef0ed] dark:bg-[#e87461]/10'
                          : 'border-[var(--border)] bg-[var(--surface)] hover:border-[#e05d44]/30 dark:hover:border-[#e87461]/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-[var(--text)] group-hover:text-[#e05d44] dark:group-hover:text-[#e87461] transition-colors">
                            {city.label}
                          </h3>
                          {langInfo && (
                            <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block">
                              {langInfo.nativeLabel}
                            </span>
                          )}
                        </div>
                        {isCurrent && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#e05d44] dark:bg-[#e87461] mt-1.5" />
                        )}
                      </div>
                      <svg className="absolute bottom-3 right-3 w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
