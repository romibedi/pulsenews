import { Link } from 'react-router-dom';
import { CATEGORIES } from '../api/newsApi';
import useLanguage from '../hooks/useLanguage';

export default function Footer() {
  const { t, tCat } = useLanguage();
  return (
    <footer className="border-t border-[var(--border)] mt-auto bg-[var(--surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl text-[var(--text)] mb-3" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              PulseNews<span className="text-[#e05d44] dark:text-[#e87461]">Today</span>
            </h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Your window to global current affairs. Aggregating news from trusted RSS sources worldwide.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--text)] uppercase tracking-wider mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Categories
            </h4>
            <div className="grid grid-cols-2 gap-1">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  to={`/category/${cat}`}
                  className="text-sm text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors capitalize no-underline"
                >
                  {tCat(cat)}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--text)] uppercase tracking-wider mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Links
            </h4>
            <div className="space-y-1">
              <Link to="/" className="block text-sm text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline">{t('backHome')}</Link>
              <Link to="/bookmarks" className="block text-sm text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline">{t('bookmarks')}</Link>
              <Link to="/region/india" className="block text-sm text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline">{t('regions')}</Link>
              <Link to="/archive" className="block text-sm text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline">{t('archive')}</Link>
              <Link to="/feeds" className="block text-sm text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline">{t('feeds')}</Link>
              <Link to="/about" className="block text-sm text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline">{t('about')}</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border)] mt-8 pt-6 text-center">
          <p className="text-xs text-[var(--text-muted)]">
            &copy; 2026 PulseNewsToday. A product of VeyricTech.
          </p>
        </div>
      </div>
    </footer>
  );
}
