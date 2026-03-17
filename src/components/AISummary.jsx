import { useState, useEffect, useRef } from 'react';

export default function AISummary({ title, body, autoGenerate = false }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasTriggered = useRef(false);

  const generate = async () => {
    if (!body || body.length < 50) {
      setError('Article too short to summarize');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate summary');
      setSummary(data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoGenerate && body && body.length >= 50 && !hasTriggered.current && !summary) {
      hasTriggered.current = true;
      generate();
    }
  }, [autoGenerate, body]);

  if (summary) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-500/10 dark:to-blue-500/10 rounded-xl p-5 border border-purple-100 dark:border-purple-500/20">
        <div className="flex items-center gap-2 mb-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">AI Summary</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{summary}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-500/10 dark:to-blue-500/10 rounded-xl p-5 border border-purple-100 dark:border-purple-500/20">
        <div className="flex items-center gap-2 mb-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500 animate-spin">
            <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
          </svg>
          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Generating AI Summary...</span>
        </div>
        <div className="space-y-2">
          <div className="h-3 shimmer rounded w-full" />
          <div className="h-3 shimmer rounded w-5/6" />
          <div className="h-3 shimmer rounded w-4/6" />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={generate}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-full border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all disabled:opacity-50"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      AI Summary
      {error && <span className="text-red-500 ml-1">— {error}</span>}
    </button>
  );
}
