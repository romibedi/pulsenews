import { useState } from 'react';

export default function HonestHeadline({ original, honest }) {
  const [showOriginal, setShowOriginal] = useState(false);

  if (!honest || honest === original) return null;

  return (
    <div className="mb-4 p-3 bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-200/50 dark:border-emerald-500/10 rounded-xl">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-emerald-600 dark:text-emerald-400" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Honest Headline</span>
        </div>
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          {showOriginal ? 'Hide original' : 'Compare'}
        </button>
      </div>
      <p className="text-sm font-medium text-[var(--text)] leading-snug">{honest}</p>
      {showOriginal && (
        <p className="text-xs text-[var(--text-muted)] mt-2 line-through decoration-1">{original}</p>
      )}
    </div>
  );
}
