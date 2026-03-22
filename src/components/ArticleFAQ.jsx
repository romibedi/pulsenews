import { useState } from 'react';

export default function ArticleFAQ({ questions, articleBody }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!questions || questions.length === 0) return null;

  return (
    <div className="mt-8 border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-[#e05d44] dark:text-[#e87461]" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-sm font-semibold text-[var(--text)]">Questions This Article Answers</h3>
        </div>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full text-left px-4 py-3 hover:bg-[var(--surface)]/50 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-[var(--text)]">{q}</span>
              <svg
                width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                className={`text-[var(--text-muted)] flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
                strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            {openIndex === i && (
              <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                Read the article above to find the answer to this question.
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
