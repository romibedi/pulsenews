import { Link } from 'react-router-dom';
import { CATEGORIES } from '../api/newsApi';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              Pulse<span className="text-indigo-400">News</span>
            </h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Your window to global current affairs. Powered by The Guardian's open journalism platform.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              Categories
            </h4>
            <div className="grid grid-cols-2 gap-1">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  to={`/category/${cat}`}
                  className="text-sm text-zinc-500 hover:text-indigo-400 transition-colors capitalize no-underline"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              Links
            </h4>
            <div className="space-y-1">
              <Link to="/" className="block text-sm text-zinc-500 hover:text-indigo-400 transition-colors no-underline">Home</Link>
              <Link to="/about" className="block text-sm text-zinc-500 hover:text-indigo-400 transition-colors no-underline">About</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-8 pt-6 text-center">
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} PulseNews. Built with React. News data from The Guardian Open Platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
