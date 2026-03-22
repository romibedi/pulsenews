import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../api/newsApi';
import { useTheme } from '../contexts/ThemeContext';
import { useBookmarks } from '../contexts/BookmarkContext';
import useAudio from '../contexts/AudioContext';
import useLanguage from '../hooks/useLanguage';
import useRegion from '../hooks/useRegion';
import useCity from '../hooks/useCity';
import LanguageSelector from './LanguageSelector';

const PRIMARY_CATS = ['technology', 'business', 'science', 'sport', 'politics', 'entertainment', 'ai'];
const MORE_CATS = CATEGORIES.filter((c) => c !== 'world' && !PRIMARY_CATS.includes(c));

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [moreCatsOpen, setMoreCatsOpen] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { bookmarks } = useBookmarks();
  const { autoplay, toggleAutoplay } = useAudio();
  const { t, tCat } = useLanguage();
  const { region, regionInfo } = useRegion();
  const { city: detectedCity } = useCity();
  const moreRef = useRef(null);
  const moreCatsRef = useRef(null);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
      if (moreCatsRef.current && !moreCatsRef.current.contains(e.target)) setMoreCatsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setMenuOpen(false);
    }
  };

  return (
    <nav className="bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14 md:h-16">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 rounded-lg bg-[#e05d44] dark:bg-[#e87461] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
              </svg>
            </div>
            <span className="text-xl md:text-2xl text-[var(--text)]" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              PulseNews<span className="text-[#e05d44] dark:text-[#e87461]">Today</span>
            </span>
          </Link>

          {/* Search - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search')}
                className="w-56 lg:w-64 bg-[var(--bg)] border border-[var(--border)] rounded-full px-4 py-2 pl-10 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#e05d44] dark:focus:border-[#e87461] focus:ring-1 focus:ring-[#e05d44] dark:focus:ring-[#e87461] transition-all"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </form>

          <div className="flex items-center gap-1">
            {!online && (
              <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">Offline</span>
            )}

            {/* Mobile: search icon navigates to /search */}
            <button
              onClick={() => navigate('/search')}
              className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
            </button>

            {/* Bookmarks - desktop */}
            <Link to="/bookmarks" className="hidden md:flex items-center text-[var(--text-secondary)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline relative p-1.5 rounded-lg hover:bg-[var(--bg)]">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>
              {bookmarks.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#e05d44] dark:bg-[#e87461] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {bookmarks.length > 9 ? '9+' : bookmarks.length}
                </span>
              )}
            </Link>

            {/* Language selector - desktop */}
            <div className="hidden md:block">
              <LanguageSelector />
            </div>

            {/* Autoplay toggle */}
            <button
              onClick={toggleAutoplay}
              className={`p-2 rounded-lg transition-colors ${
                autoplay
                  ? 'text-[#e05d44] dark:text-[#e87461] bg-[#fef0ed] dark:bg-[#e87461]/10'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]'
              }`}
              title={autoplay ? 'Autoplay is on' : 'Autoplay is off'}
            >
              {autoplay ? (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              )}
            </button>

            {/* Dark mode toggle - desktop */}
            <button
              onClick={toggleTheme}
              className="hidden md:block p-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors rounded-lg hover:bg-[var(--bg)]"
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* More menu (Archive, Feeds, About) - desktop */}
            <div className="hidden md:block relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors rounded-lg hover:bg-[var(--bg)]"
                title="More"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-10 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg py-1 z-30 min-w-[160px] animate-fade-in">
                  {[
                    { to: '/archive', label: t('archive'), icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                    { to: '/feeds', label: t('feeds'), icon: 'M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 100-2 1 1 0 000 2z' },
                    { to: '/bookmarks', label: t('bookmarks'), icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
                    { to: '/about', label: t('about'), icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                  ].map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMoreOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[#e05d44] dark:hover:text-[#e87461] hover:bg-[var(--bg)] transition-colors no-underline"
                    >
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d={link.icon} /></svg>
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category bar - desktop */}
        <div className="hidden md:flex items-center gap-1 pb-2">
          {/* Region + city chips */}
          {region && region !== 'world' && (
            <Link
              to={`/region/${region}`}
              className="px-3 py-1 text-xs font-semibold text-[#e05d44] dark:text-[#e87461] bg-[#fef0ed] dark:bg-[#e87461]/10 rounded-full no-underline whitespace-nowrap"
            >
              {regionInfo.flag} {regionInfo.label}
            </Link>
          )}
          {detectedCity && (
            <Link
              to={`/city/${detectedCity}`}
              className="px-3 py-1 text-xs font-semibold text-[#e05d44] dark:text-[#e87461] bg-[#fef0ed] dark:bg-[#e87461]/10 rounded-full no-underline whitespace-nowrap flex items-center gap-1"
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              Local
            </Link>
          )}

          {/* Separator after region chips */}
          {(region && region !== 'world') || detectedCity ? (
            <div className="w-px h-4 bg-[var(--border)] mx-1" />
          ) : null}

          {/* Primary categories */}
          {PRIMARY_CATS.map((cat) => (
            <Link
              key={cat}
              to={`/category/${cat}`}
              className="px-3 py-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[#e05d44] dark:hover:text-[#e87461] hover:bg-[#fef0ed] dark:hover:bg-[#e87461]/10 rounded-full transition-all no-underline whitespace-nowrap"
            >
              {tCat(cat)}
            </Link>
          ))}

          {/* More categories dropdown */}
          <div className="relative" ref={moreCatsRef}>
            <button
              onClick={() => setMoreCatsOpen(!moreCatsOpen)}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] hover:bg-[#fef0ed] dark:hover:bg-[#e87461]/10 rounded-full transition-all whitespace-nowrap"
            >
              More
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className={`transition-transform ${moreCatsOpen ? 'rotate-180' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {moreCatsOpen && (
              <div className="absolute left-0 top-8 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg py-1 z-30 min-w-[140px] animate-fade-in">
                {MORE_CATS.map((cat) => (
                  <Link
                    key={cat}
                    to={`/category/${cat}`}
                    onClick={() => setMoreCatsOpen(false)}
                    className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[#e05d44] dark:hover:text-[#e87461] hover:bg-[var(--bg)] transition-colors no-underline capitalize"
                  >
                    {tCat(cat)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Spacer pushes Regions/Cities to the right */}
          <div className="flex-1" />

          {/* Regions & Cities links - right-aligned */}
          <Link
            to="/region/india"
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[#e05d44] dark:hover:text-[#e87461] hover:bg-[#fef0ed] dark:hover:bg-[#e87461]/10 rounded-full transition-all no-underline whitespace-nowrap"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
            {t('regions')}
          </Link>
          <Link
            to="/cities"
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[#e05d44] dark:hover:text-[#e87461] hover:bg-[#fef0ed] dark:hover:bg-[#e87461]/10 rounded-full transition-all no-underline whitespace-nowrap"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Cities
          </Link>
        </div>
      </div>
    </nav>
  );
}
