import { useState, useEffect } from 'react';
import { fetchByCategory } from '../api/newsApi';

const CATEGORIES = ['world', 'technology', 'business', 'science', 'sport', 'culture'];

// Client-side basic sentiment scoring as fallback
const POS_WORDS = new Set(['win', 'success', 'grow', 'growth', 'gain', 'rise', 'boost', 'hope', 'peace', 'breakthrough', 'improve', 'record', 'celebrate', 'agree', 'advance', 'positive', 'support', 'rescue', 'recover', 'innovation', 'progress', 'victory']);
const NEG_WORDS = new Set(['kill', 'death', 'war', 'attack', 'crisis', 'crash', 'fail', 'threat', 'fear', 'conflict', 'disaster', 'collapse', 'destroy', 'bomb', 'terror', 'violence', 'scandal', 'protest', 'recession', 'suffer', 'decline', 'loss']);

function basicSentiment(text) {
  const words = text.toLowerCase().split(/\W+/);
  let score = 0;
  for (const w of words) {
    if (POS_WORDS.has(w)) score += 1;
    if (NEG_WORDS.has(w)) score -= 1;
  }
  return Math.max(-1, Math.min(1, score / Math.max(words.length * 0.05, 1)));
}

function SentimentBar({ label, score, count }) {
  const pct = ((score + 1) / 2) * 100; // -1..1 to 0..100
  const color = score > 0.15 ? 'bg-emerald-400' : score < -0.15 ? 'bg-red-400' : 'bg-amber-400';
  const textColor = score > 0.15 ? 'text-emerald-600 dark:text-emerald-400' : score < -0.15 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400';
  const sentiment = score > 0.15 ? 'Positive' : score < -0.15 ? 'Negative' : 'Neutral';

  return (
    <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[var(--text)] capitalize">{label}</span>
        <span className={`text-xs font-semibold ${textColor}`}>{sentiment}</span>
      </div>
      <div className="w-full h-3 bg-[var(--bg)] rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%`, minWidth: '8px' }}
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
        <span>{count} articles analyzed</span>
        <span>Score: {score.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default function SentimentDashboard() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [useAI, setUseAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Load articles and do basic sentiment
  useEffect(() => {
    async function load() {
      const results = {};
      for (const cat of CATEGORIES) {
        try {
          const d = await fetchByCategory(cat, 1);
          const articles = d.articles.slice(0, 10);
          const scores = articles.map((a) => basicSentiment(`${a.title} ${a.description || ''}`));
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          results[cat] = { score: avg, count: articles.length, articles };
        } catch {
          results[cat] = { score: 0, count: 0, articles: [] };
        }
      }
      setData(results);
      setLoading(false);
    }
    load();
  }, []);

  const runAISentiment = async () => {
    setAiLoading(true);
    try {
      for (const cat of CATEGORIES) {
        if (!data[cat]?.articles?.length) continue;
        const res = await fetch('/api/sentiment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            articles: data[cat].articles.map((a) => ({ title: a.title, section: cat })),
          }),
        });
        if (!res.ok) throw new Error('AI sentiment failed');
        const { scores } = await res.json();
        if (scores.length > 0) {
          const avg = scores.reduce((a, b) => a + b.score, 0) / scores.length;
          setData((prev) => ({ ...prev, [cat]: { ...prev[cat], score: avg } }));
        }
      }
      setUseAI(true);
    } catch { /* fallback to basic */ }
    finally { setAiLoading(false); }
  };

  const overallScore = Object.values(data).length
    ? Object.values(data).reduce((a, b) => a + b.score, 0) / Object.values(data).length
    : 0;

  const overallLabel = overallScore > 0.15 ? 'Mostly Positive' : overallScore < -0.15 ? 'Mostly Negative' : 'Mixed/Neutral';
  const overallColor = overallScore > 0.15 ? 'text-emerald-600 dark:text-emerald-400' : overallScore < -0.15 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-normal text-[var(--text)]">Sentiment Dashboard</h1>
        <p className="text-[var(--text-muted)] mt-1 text-sm">How today's news skews across categories</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 shimmer rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Overall */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 mb-6 shadow-sm text-center">
            <p className="text-sm text-[var(--text-muted)] mb-1">Overall News Tone Today</p>
            <p className={`text-3xl font-normal ${overallColor}`} style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
              {overallLabel}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Score: {overallScore.toFixed(2)} &middot; {useAI ? 'AI-powered' : 'Keyword-based'}
            </p>
            {!useAI && (
              <button
                onClick={runAISentiment}
                disabled={aiLoading}
                className="mt-3 inline-flex items-center gap-1 px-4 py-1.5 text-xs font-medium rounded-full border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all disabled:opacity-50"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {aiLoading ? 'Analyzing...' : 'Upgrade to AI Analysis'}
              </button>
            )}
          </div>

          {/* Category bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATEGORIES.map((cat) => (
              <SentimentBar
                key={cat}
                label={cat}
                score={data[cat]?.score || 0}
                count={data[cat]?.count || 0}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
