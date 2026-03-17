import { Link } from 'react-router-dom';
import { CATEGORIES } from '../api/newsApi';

export default function Footer() {
  return (
    <footer className="border-t border-[#e8e4df] mt-auto bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl text-[#1a1a1a] mb-3" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              Stream<span className="text-[#e05d44]">News</span>
            </h3>
            <p className="text-sm text-[#9a9a9a] leading-relaxed">
              Your window to global current affairs. Powered by The Guardian's open journalism platform.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#1a1a1a] uppercase tracking-wider mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Categories
            </h4>
            <div className="grid grid-cols-2 gap-1">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  to={`/category/${cat}`}
                  className="text-sm text-[#9a9a9a] hover:text-[#e05d44] transition-colors capitalize no-underline"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#1a1a1a] uppercase tracking-wider mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Links
            </h4>
            <div className="space-y-1">
              <Link to="/" className="block text-sm text-[#9a9a9a] hover:text-[#e05d44] transition-colors no-underline">Home</Link>
              <Link to="/about" className="block text-sm text-[#9a9a9a] hover:text-[#e05d44] transition-colors no-underline">About</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-[#e8e4df] mt-8 pt-6 text-center">
          <p className="text-xs text-[#9a9a9a]">
            &copy; {new Date().getFullYear()} StreamNews. Built with React. News data from The Guardian Open Platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
