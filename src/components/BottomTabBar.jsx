import { useLocation, useNavigate } from 'react-router-dom';
import { useBookmarks } from '../contexts/BookmarkContext';
import useCity from '../hooks/useCity';

const BASE_TABS = [
  {
    key: 'home',
    label: 'Home',
    path: '/',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: 'local',
    label: 'Local',
    path: '/city/',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    requiresCity: true,
  },
  {
    key: 'explore',
    label: 'Explore',
    path: '/explore',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
  },
  {
    key: 'search',
    label: 'Search',
    path: '/search',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    key: 'saved',
    label: 'Saved',
    path: '/bookmarks',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    key: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookmarks } = useBookmarks();
  const { city: detectedCity } = useCity();

  const TABS = BASE_TABS.filter((tab) => !tab.requiresCity || detectedCity);

  const isActive = (tab) => {
    if (tab.key === 'home') return location.pathname === '/';
    if (tab.key === 'local') return location.pathname.startsWith('/city/');
    if (tab.key === 'explore') return location.pathname === '/explore' || location.pathname.startsWith('/category/') || location.pathname.startsWith('/region/');
    return location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
  };

  const handleTap = (tab) => {
    if (tab.key === 'home' && location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const path = tab.key === 'local' ? `/city/${detectedCity}` : tab.path;
    navigate(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around h-[49px]">
        {TABS.map((tab) => {
          const active = isActive(tab);
          return (
            <button
              key={tab.key}
              onClick={() => handleTap(tab)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors relative ${
                active
                  ? 'text-[#e05d44] dark:text-[#e87461]'
                  : 'text-[var(--text-muted)] active:text-[var(--text)]'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.key === 'saved' && bookmarks.length > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#e05d44] dark:bg-[#e87461] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {bookmarks.length > 9 ? '9+' : bookmarks.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
