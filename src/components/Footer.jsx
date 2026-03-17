import { Link } from 'react-router-dom';
import { CATEGORIES } from '../api/newsApi';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-auto bg-[var(--surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl text-[var(--text)] mb-3" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              Pulse<span className="text-[#e05d44] dark:text-[#e87461]">News</span>
            </h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Your window to global current affairs. Powered by The Guardian's open journalism platform.
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
              <Link to="/about" className="block text-sm text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline">About</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border)] mt-8 pt-6 text-center">
          <p className="text-xs text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} PulseNews. Built with React. News data from The Guardian Open Platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
