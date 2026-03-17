import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useLanguage, { LANGUAGES, REGION_LANGUAGES } from '../hooks/useLanguage';
import useRegion from '../hooks/useRegion';

export default function LanguageSelector() {
  const { lang, setLang, langInfo } = useLanguage();
  const { region } = useRegion();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setShowAll(false); } };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // On region pages, use that region's languages; otherwise use detected region
  const regionMatch = location.pathname.match(/^\/region\/([^/]+)/);
  const activeRegion = regionMatch?.[1] || region;
  const regionLangs = REGION_LANGUAGES[activeRegion] || ['en'];

  // Region languages first, then all others
  const otherLangs = Object.keys(LANGUAGES).filter((k) => !regionLangs.includes(k));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--text-secondary)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors rounded-md hover:bg-[var(--bg)]"
        title="Change language"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span>{langInfo.nativeLabel}</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-8 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg p-1.5 z-50 min-w-[200px] animate-fade-in max-h-[70vh] overflow-y-auto">
          {regionLangs.map((key) => {
            const info = LANGUAGES[key];
            if (!info) return null;
            return (
              <button
                key={key}
                onClick={() => { setLang(key); setOpen(false); setShowAll(false); }}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                  key === lang
                    ? 'bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461]'
                    : 'text-[var(--text)] hover:bg-[var(--bg)]'
                }`}
              >
                <span>{info.flag} {info.nativeLabel}</span>
                <span className="text-[10px] text-[var(--text-muted)]">{info.label}</span>
              </button>
            );
          })}

          {otherLangs.length > 0 && (
            <>
              <div className="border-t border-[var(--border)] my-1" />
              {!showAll ? (
                <button
                  onClick={() => setShowAll(true)}
                  className="w-full text-center px-3 py-1.5 text-[11px] text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors rounded-lg hover:bg-[var(--bg)]"
                >
                  More languages...
                </button>
              ) : (
                otherLangs.map((key) => {
                  const info = LANGUAGES[key];
                  if (!info) return null;
                  return (
                    <button
                      key={key}
                      onClick={() => { setLang(key); setOpen(false); setShowAll(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                        key === lang
                          ? 'bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461]'
                          : 'text-[var(--text)] hover:bg-[var(--bg)]'
                      }`}
                    >
                      <span>{info.flag} {info.nativeLabel}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{info.label}</span>
                    </button>
                  );
                })
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
