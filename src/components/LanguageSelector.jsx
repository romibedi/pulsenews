import { useState, useRef, useEffect } from 'react';
import useLanguage, { LANGUAGES } from '../hooks/useLanguage';

export default function LanguageSelector() {
  const { lang, setLang, langInfo } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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
        <div className="absolute right-0 top-8 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg p-1.5 z-50 min-w-[180px] animate-fade-in">
          {Object.entries(LANGUAGES).map(([key, info]) => (
            <button
              key={key}
              onClick={() => { setLang(key); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                key === lang
                  ? 'bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461]'
                  : 'text-[var(--text)] hover:bg-[var(--bg)]'
              }`}
            >
              <span>{info.nativeLabel}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{info.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
