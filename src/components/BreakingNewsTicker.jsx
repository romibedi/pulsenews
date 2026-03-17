import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchByCategory } from '../api/newsApi';

export default function BreakingNewsTicker() {
  const [headlines, setHeadlines] = useState([]);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('pulsenews-ticker-dismissed') === 'true');

  useEffect(() => {
    if (dismissed) return;
    fetchByCategory('world', 1)
      .then((data) => setHeadlines(data.articles.slice(0, 8)))
      .catch(() => {});
  }, [dismissed]);

  if (dismissed || headlines.length === 0) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pulsenews-ticker-dismissed', 'true');
  };

  return (
    <div className="bg-[#1a1a1a] dark:bg-[#e8e4df] text-white dark:text-[#1a1a1a] text-xs overflow-hidden relative z-50">
      <div className="flex items-center max-w-full">
        {/* Label */}
        <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-[#e05d44] text-white font-semibold uppercase tracking-wider z-10">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          Breaking
        </div>

        {/* Scrolling headlines */}
        <div className="overflow-hidden flex-1">
          <div className="ticker-scroll flex items-center whitespace-nowrap">
            {[...headlines, ...headlines].map((article, i) => (
              <Link
                key={`${article.id}-${i}`}
                to={article.isExternal ? '#' : `/article/${encodeURIComponent(article.id)}`}
                {...(article.isExternal ? { onClick: (e) => { e.preventDefault(); window.open(article.url, '_blank'); } } : {})}
                className="inline-block px-6 py-2 no-underline text-white/80 dark:text-[#1a1a1a]/80 hover:text-white dark:hover:text-[#1a1a1a] transition-colors"
              >
                {article.title}
              </Link>
            ))}
          </div>
        </div>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="shrink-0 px-3 py-2 text-white/50 dark:text-[#1a1a1a]/50 hover:text-white dark:hover:text-[#1a1a1a] transition-colors"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
