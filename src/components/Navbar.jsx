import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../api/newsApi';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-[#e8e4df] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 rounded-lg bg-[#e05d44] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
              </svg>
            </div>
            <span className="text-2xl text-[#1a1a1a]" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              Stream<span className="text-[#e05d44]">News</span>
            </span>
          </Link>

          {/* Search - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search news..."
                className="w-64 bg-[#f5f1ec] border border-[#e8e4df] rounded-full px-4 py-2 pl-10 text-sm text-[#1a1a1a] placeholder-[#9a9a9a] focus:outline-none focus:border-[#e05d44] focus:ring-1 focus:ring-[#e05d44] transition-all"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9a9a9a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </form>

          <div className="flex items-center gap-3">
            <Link to="/about" className="hidden md:block text-sm text-[#6b6b6b] hover:text-[#e05d44] transition-colors no-underline">
              About
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-[#6b6b6b] hover:text-[#1a1a1a]"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {menuOpen ? (
                  <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                ) : (
                  <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Category bar - desktop */}
        <div className="hidden md:flex items-center gap-1 pb-2 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/category/${cat}`}
              className="px-3 py-1 text-xs font-medium text-[#6b6b6b] hover:text-[#e05d44] hover:bg-[#fef0ed] rounded-full transition-all capitalize no-underline whitespace-nowrap"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#e8e4df] px-4 py-3 space-y-2 animate-fade-in bg-white">
          <form onSubmit={handleSearch} className="mb-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search news..."
              className="w-full bg-[#f5f1ec] border border-[#e8e4df] rounded-full px-4 py-2 text-sm text-[#1a1a1a] placeholder-[#9a9a9a] focus:outline-none focus:border-[#e05d44]"
            />
          </form>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/category/${cat}`}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-1 text-xs font-medium text-[#6b6b6b] bg-[#f5f1ec] rounded-full capitalize no-underline"
              >
                {cat}
              </Link>
            ))}
          </div>
          <Link to="/about" onClick={() => setMenuOpen(false)} className="block text-sm text-[#6b6b6b] pt-2 no-underline">
            About
          </Link>
        </div>
      )}
    </nav>
  );
}
