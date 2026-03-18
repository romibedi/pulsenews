import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../api/newsApi';
import { REGIONS } from '../hooks/useRegion';
import useRegion from '../hooks/useRegion';
import useLanguage from '../hooks/useLanguage';

const CATEGORY_ICONS = {
  world: '🌍',
  technology: '💻',
  business: '📈',
  sport: '⚽',
  science: '🔬',
  culture: '🎭',
  environment: '🌱',
  politics: '🏛️',
};

export default function Explore() {
  const [tab, setTab] = useState('categories');
  const { region: currentRegion } = useRegion();
  const { t } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in">
      <h1 className="text-2xl font-normal text-[var(--text)] mb-5">Explore</h1>

      {/* Segment control */}
      <div className="flex bg-[var(--bg)] rounded-xl p-1 mb-6">
        {['categories', 'regions'].map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
              tab === key
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
                : 'text-[var(--text-muted)]'
            }`}
          >
            {key === 'categories' ? 'Categories' : 'Regions'}
          </button>
        ))}
      </div>

      {/* Categories grid */}
      {tab === 'categories' && (
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/category/${cat}`}
              className="flex items-center gap-3 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl no-underline hover:border-[#e05d44]/30 dark:hover:border-[#e87461]/30 transition-all active:scale-[0.97]"
            >
              <span className="text-2xl">{CATEGORY_ICONS[cat] || '📰'}</span>
              <div>
                <p className="text-sm font-medium text-[var(--text)] capitalize">{cat}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Regions grid */}
      {tab === 'regions' && (
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(REGIONS).map(([key, info]) => (
            <Link
              key={key}
              to={`/region/${key}`}
              className={`flex items-center gap-3 p-4 border rounded-2xl no-underline transition-all active:scale-[0.97] ${
                key === currentRegion
                  ? 'bg-[#fef0ed] dark:bg-[#e87461]/10 border-[#e05d44]/30 dark:border-[#e87461]/30'
                  : 'bg-[var(--surface)] border-[var(--border)] hover:border-[#e05d44]/30 dark:hover:border-[#e87461]/30'
              }`}
            >
              <span className="text-2xl">{info.flag}</span>
              <div>
                <p className="text-sm font-medium text-[var(--text)]">{info.label}</p>
                {key === currentRegion && (
                  <p className="text-[10px] text-[#e05d44] dark:text-[#e87461] font-medium">Your region</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
