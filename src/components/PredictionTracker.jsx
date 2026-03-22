export default function PredictionTracker({ predictions }) {
  if (!predictions || predictions.length === 0) return null;

  return (
    <div className="mt-8 border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-4 py-3 bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-purple-600 dark:text-purple-400" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="text-sm font-semibold text-[var(--text)]">Predictions & Claims</h3>
        </div>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {predictions.map((p, i) => (
          <div key={i} className="px-4 py-3">
            <p className="text-sm text-[var(--text)] leading-snug">&ldquo;{p.claim}&rdquo;</p>
            <div className="flex items-center gap-3 mt-1.5">
              {p.entity && (
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">{p.entity}</span>
              )}
              {p.targetDate && (
                <span className="text-[10px] text-[var(--text-muted)]">Target: {p.targetDate}</span>
              )}
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]">
                Pending
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
