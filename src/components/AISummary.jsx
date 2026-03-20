import { useState, useEffect, useRef } from 'react';
import useLanguage from '../hooks/useLanguage';

const MODES = [
  { key: 'simple', label: 'Simple', icon: '🧒', color: 'emerald' },
  { key: 'summary', label: 'Summary', icon: '✦', color: 'purple' },
  { key: 'expert', label: 'Expert', icon: '🎓', color: 'blue' },
];

const MODE_LABELS = {
  simple: 'ELI5 Explanation',
  summary: 'AI Summary',
  expert: 'Expert Analysis',
};

const COLORS = {
  emerald: {
    bg: 'from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10',
    border: 'border-emerald-100 dark:border-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: 'text-emerald-500',
  },
  purple: {
    bg: 'from-purple-50 to-blue-50 dark:from-purple-500/10 dark:to-blue-500/10',
    border: 'border-purple-100 dark:border-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    icon: 'text-purple-500',
  },
  blue: {
    bg: 'from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10',
    border: 'border-blue-100 dark:border-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    icon: 'text-blue-500',
  },
};

export default function AISummary({ title, body, autoGenerate = false }) {
  const [mode, setMode] = useState('summary');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasTriggered = useRef(false);
  const { lang } = useLanguage();

  const result = results[mode] || null;
  const currentMode = MODES.find((m) => m.key === mode);
  const colors = COLORS[currentMode?.color || 'purple'];

  const generate = async (m) => {
    const targetMode = m || mode;
    if (results[targetMode]) return;
    if (!body || body.length < 50) {
      setError('Article too short');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, mode: targetMode, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');
      setResults((prev) => ({ ...prev, [targetMode]: data.text }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError(null);
    if (!results[m]) generate(m);
  };

  useEffect(() => {
    if (autoGenerate && body && body.length >= 50 && !hasTriggered.current && !results.summary) {
      hasTriggered.current = true;
      generate('summary');
    }
  }, [autoGenerate, body]);

  // Mode toggle buttons
  const ModeToggle = () => (
    <div className="inline-flex rounded-lg border border-[var(--border)] overflow-hidden">
      {MODES.map((m) => (
        <button
          key={m.key}
          onClick={() => switchMode(m.key)}
          className={`px-3 py-1.5 text-xs font-medium transition-all ${
            mode === m.key
              ? `${COLORS[m.color].text} bg-[var(--bg)]`
              : 'text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          <span className="mr-1">{m.icon}</span>
          {m.label}
        </button>
      ))}
    </div>
  );

  // Has any result or is loading
  if (result || loading) {
    return (
      <div className={`bg-gradient-to-r ${colors.bg} rounded-xl p-5 border ${colors.border}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={colors.icon}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className={`text-xs font-semibold ${colors.text} uppercase tracking-wider`}>{MODE_LABELS[mode]}</span>
          </div>
          <ModeToggle />
        </div>
        {loading ? (
          <div className="space-y-2">
            <div className="h-3 shimmer rounded w-full" />
            <div className="h-3 shimmer rounded w-5/6" />
            <div className="h-3 shimmer rounded w-4/6" />
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{result}</p>
        )}
      </div>
    );
  }

  // Initial state — show generate button with mode toggle
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={() => generate()}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-full border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all disabled:opacity-50"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        AI Summary
        {error && <span className="text-red-500 ml-1">— {error}</span>}
      </button>
      <ModeToggle />
    </div>
  );
}
