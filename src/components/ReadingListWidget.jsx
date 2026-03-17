import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBookmarks } from '../contexts/BookmarkContext';

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ReadingListWidget() {
  const { bookmarks } = useBookmarks();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (bookmarks.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={panelRef}>
      {/* Expanded panel */}
      {open && (
        <div className="absolute bottom-14 right-0 w-80 max-h-96 bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-[#e8e4df] dark:border-[#2e2e2e] overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-[#e8e4df] dark:border-[#2e2e2e] flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[#1a1a1a] dark:text-[#e8e4df]">Reading List</h4>
            <Link
              to="/bookmarks"
              onClick={() => setOpen(false)}
              className="text-xs text-[#e05d44] dark:text-[#e87461] no-underline hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="overflow-y-auto max-h-72">
            {bookmarks.slice(0, 8).map((article) => (
              <Link
                key={article.id}
                to={article.isExternal ? '#' : `/article/${encodeURIComponent(article.id)}`}
                {...(article.isExternal ? { onClick: (e) => { e.preventDefault(); window.open(article.url, '_blank'); setOpen(false); } } : { onClick: () => setOpen(false) })}
                className="flex gap-3 p-3 hover:bg-[#faf8f5] dark:hover:bg-[#252525] transition-colors no-underline border-b border-[#f0ece7] dark:border-[#252525] last:border-0"
              >
                {article.image && (
                  <img src={article.image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1a1a1a] dark:text-[#e8e4df] line-clamp-2 leading-snug">{article.title}</p>
                  <p className="text-[10px] text-[#9a9a9a] dark:text-[#6b6b6b] mt-1">
                    {article.source || 'The Guardian'} &middot; {timeAgo(article.date)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 bg-[#e05d44] text-white rounded-full shadow-lg hover:bg-[#c94e38] transition-all flex items-center justify-center relative hover:scale-105"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
        </svg>
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] text-[10px] font-bold rounded-full flex items-center justify-center">
          {bookmarks.length > 99 ? '99+' : bookmarks.length}
        </span>
      </button>
    </div>
  );
}
