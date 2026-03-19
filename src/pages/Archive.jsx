import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchArchive } from '../api/newsApi';
import useRegion from '../hooks/useRegion';
import useLanguage from '../hooks/useLanguage';
import NewsCard from '../components/NewsCard';
import Loader from '../components/Loader';

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function getAvailableDates() {
  const dates = [];
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export default function Archive() {
  const [searchParams, setSearchParams] = useSearchParams();
  const date = searchParams.get('date') || new Date().toISOString().slice(0, 10);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { region } = useRegion();
  const { lang } = useLanguage();

  useEffect(() => {
    setLoading(true);
    fetchArchive(date, { region, lang })
      .then((data) => setArticles(data.articles))
      .finally(() => setLoading(false));
  }, [date, region, lang]);

  const dates = getAvailableDates();

  const goToDate = (d) => {
    setSearchParams({ date: d });
  };

  const currentIdx = dates.indexOf(date);
  const prevDate = currentIdx < dates.length - 1 ? dates[currentIdx + 1] : null;
  const nextDate = currentIdx > 0 ? dates[currentIdx - 1] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <Helmet>
        <title>Archive: {formatDateLabel(date)} - PulseNewsToday</title>
        <meta name="description" content={`News articles from ${formatDateLabel(date)} on PulseNewsToday.`} />
      </Helmet>

      {/* Date picker */}
      <div className="mb-8">
        <h1 className="text-3xl font-normal text-[var(--text)] mb-1">Archive</h1>
        <p className="text-sm text-[var(--text-muted)] mb-4">{formatDateLabel(date)}</p>

        <div className="flex items-center gap-3 mb-4">
          {prevDate && (
            <button
              onClick={() => goToDate(prevDate)}
              className="px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[#e05d44] dark:hover:text-[#e87461] hover:border-[#e05d44]/30 dark:hover:border-[#e87461]/30 transition-all"
            >
              &larr; Older
            </button>
          )}
          <input
            type="date"
            value={date}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => goToDate(e.target.value)}
            className="px-3 py-1.5 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:border-[#e05d44] dark:focus:border-[#e87461]"
          />
          {nextDate && (
            <button
              onClick={() => goToDate(nextDate)}
              className="px-3 py-1.5 text-sm border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[#e05d44] dark:hover:text-[#e87461] hover:border-[#e05d44]/30 dark:hover:border-[#e87461]/30 transition-all"
            >
              Newer &rarr;
            </button>
          )}
        </div>

        {/* Quick date chips */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.slice(0, 7).map((d) => (
            <button
              key={d}
              onClick={() => goToDate(d)}
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-all ${
                d === date
                  ? 'bg-[#e05d44] dark:bg-[#e87461] text-white'
                  : 'border border-[var(--border)] text-[var(--text-secondary)] hover:text-[#e05d44] dark:hover:text-[#e87461] hover:border-[#e05d44]/30 dark:hover:border-[#e87461]/30'
              }`}
            >
              {d === new Date().toISOString().slice(0, 10) ? 'Today' :
               d === dates[1] ? 'Yesterday' :
               new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </button>
          ))}
        </div>
      </div>

      {!loading && <p className="text-sm text-[var(--text-muted)] mb-6">{articles.length} articles</p>}

      {loading ? (
        <Loader count={9} />
      ) : articles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[var(--text-secondary)] text-lg mb-2">No articles found for this date</p>
          <p className="text-[var(--text-muted)] text-sm">Try a different date</p>
          <Link to="/" className="text-[#e05d44] dark:text-[#e87461] mt-4 inline-block no-underline">&larr; Back to home</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article, i) => (
            <div key={article.id} className="animate-fade-in h-full" style={{ animationDelay: `${i * 40}ms` }}>
              <NewsCard article={article} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
