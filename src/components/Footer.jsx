import { Link } from 'react-router-dom';
import { CATEGORIES } from '../api/newsApi';

export default function Footer() {
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
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--text)] uppercase tracking-wider mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Links
            </h4>
            <div className="space-y-1">
              <Link to="/" className="block text-sm text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline">Home</Link>
              <Link to="/bookmarks" className="block text-sm text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline">Bookmarks</Link>
              <Link to="/region/india" className="block text-sm text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline">Regions</Link>
              <Link to="/feeds" className="block text-sm text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline">Custom Feeds</Link>
              <Link to="/about" className="block text-sm text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline">About</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border)] mt-8 pt-6 text-center">
          <p className="text-xs text-[var(--text-muted)]">
            &copy; 2026 PulseNewsToday. A product of{' '}
            <a href="mailto:info@veyrictech.com" className="hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline text-[var(--text-muted)] font-medium">VeyricTech</a>.
            AI-powered news from 99+ sources across 9 regions and 16 languages.
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            <a href="https://www.pulsenewstoday.com" className="hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline text-[var(--text-muted)]">www.pulsenewstoday.com</a>
            <span className="mx-2">&middot;</span>
            <a href="mailto:info@veyrictech.com" className="hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline text-[var(--text-muted)]">info@veyrictech.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
