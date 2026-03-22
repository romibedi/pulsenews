import { useState } from 'react';

function pollHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash) + str.charCodeAt(i) | 0;
  return Math.abs(hash);
}

export default function QuickPoll({ poll }) {
  const storageKey = `pulsenews-poll-${poll.id}`;
  const [vote, setVote] = useState(() => {
    try { return localStorage.getItem(storageKey); } catch { return null; }
  });

  // Deterministic "results" seeded from poll id (35-65% range)
  const basePercent = (pollHash(poll.id) % 30) + 35;
  const aPercent = vote === 'a' ? Math.min(basePercent + 3, 95) : vote === 'b' ? Math.max(basePercent - 3, 5) : basePercent;
  const bPercent = 100 - aPercent;

  const handleVote = (option) => {
    setVote(option);
    try { localStorage.setItem(storageKey, option); } catch {}
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-[#e05d44] dark:text-[#e87461]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Quick Poll</h4>
      </div>
      <p className="text-sm sm:text-base text-[var(--text)] font-medium mb-4">{poll.q}</p>

      {!vote ? (
        <div className="flex gap-3">
          <button
            onClick={() => handleVote('a')}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--text)] hover:border-[#e05d44]/40 dark:hover:border-[#e87461]/40 hover:bg-[#fef0ed] dark:hover:bg-[#e87461]/10 transition-colors"
          >
            {poll.a}
          </button>
          <button
            onClick={() => handleVote('b')}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--text)] hover:border-[#e05d44]/40 dark:hover:border-[#e87461]/40 hover:bg-[#fef0ed] dark:hover:bg-[#e87461]/10 transition-colors"
          >
            {poll.b}
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className={vote === 'a' ? 'font-semibold text-[var(--text)]' : 'text-[var(--text-muted)]'}>{poll.a}</span>
              <span className="text-[var(--text-muted)]">{aPercent}%</span>
            </div>
            <div className="h-2 bg-[var(--bg)] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${vote === 'a' ? 'bg-[#e05d44] dark:bg-[#e87461]' : 'bg-[var(--border)]'}`}
                style={{ width: `${aPercent}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className={vote === 'b' ? 'font-semibold text-[var(--text)]' : 'text-[var(--text-muted)]'}>{poll.b}</span>
              <span className="text-[var(--text-muted)]">{bPercent}%</span>
            </div>
            <div className="h-2 bg-[var(--bg)] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${vote === 'b' ? 'bg-[#e05d44] dark:bg-[#e87461]' : 'bg-[var(--border)]'}`}
                style={{ width: `${bPercent}%` }}
              />
            </div>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] text-center pt-1">Thanks for voting!</p>
        </div>
      )}
    </div>
  );
}
