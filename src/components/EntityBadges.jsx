import { Link } from 'react-router-dom';

const TYPE_CONFIG = {
  person: { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'blue' },
  company: { icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'emerald' },
  place: { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', color: 'amber' },
};

const COLOR_MAP = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-500/20' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
};

export default function EntityBadges({ entities }) {
  if (!entities || entities.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {entities.map((entity, i) => {
        const config = TYPE_CONFIG[entity.type] || TYPE_CONFIG.person;
        const colors = COLOR_MAP[config.color];
        return (
          <Link
            key={`${entity.name}-${i}`}
            to={`/search?q=${encodeURIComponent(entity.name)}`}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${colors.bg} ${colors.text} ${colors.border} hover:opacity-80 transition-opacity no-underline`}
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d={config.icon} />
            </svg>
            {entity.name}
          </Link>
        );
      })}
    </div>
  );
}
