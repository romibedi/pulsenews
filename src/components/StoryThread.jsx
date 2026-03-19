import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAudio from '../contexts/AudioContext';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  const days = Math.floor(seconds / 86400);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function StoryThread({ articleId, title, category }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const { playArticle } = useAudio();

  useEffect(() => {
    if (!articleId) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (title) params.set('title', title);
    if (category) params.set('category', category);
    const qs = params.toString() ? `?${params}` : '';
    fetch(`/api/threads/${encodeURIComponent(articleId)}${qs}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [articleId, title, category]);

  if (loading) return null;
  if (!data || data.count === 0) return null;

  const thread = data.thread || [];
  const visible = expanded ? thread : thread.slice(0, 4);

  const handleCatchUp = () => {
    if (data.threadSummary) {
      playArticle({
        id: `thread-summary-${articleId}`,
        title: 'Story catch-up',
        body: data.threadSummary,
        source: 'PulseNewsToday',
        date: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="mt-10 pt-6 border-t border-[var(--border)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" className="text-[#e05d44] dark:text-[#e87461]">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
          <h3 className="text-lg font-semibold text-[var(--text)]">Follow this Story</h3>
          <span className="text-xs text-[var(--text-muted)] bg-[var(--bg)] px-2 py-0.5 rounded-full">{data.count} related</span>
        </div>
        {data.threadSummary && (
          <button
            onClick={handleCatchUp}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#e05d44] dark:bg-[#e87461] rounded-full hover:bg-[#c94e38] transition-colors"
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Catch me up
          </button>
        )}
      </div>

      {/* Thread summary text */}
      {data.threadSummary && (
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4 pl-4 border-l-2 border-[#e05d44]/30 dark:border-[#e87461]/30">
          {data.threadSummary}
        </p>
      )}

      {/* Timeline */}
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-[var(--border)]" />

        {visible.map((item, i) => (
          <Link
            key={item.id}
            to={item.slug ? `/news/${item.slug}` : `/article/${encodeURIComponent(item.id)}`}
            className="relative flex gap-3 pb-4 no-underline group"
          >
            {/* Timeline dot */}
            <div className="absolute left-[-18px] top-1.5 w-3 h-3 rounded-full border-2 border-[#e05d44] dark:border-[#e87461] bg-[var(--surface)] z-10 group-hover:bg-[#e05d44] dark:group-hover:bg-[#e87461] transition-colors" />

            {/* Card */}
            <div className="flex-1 flex gap-3 p-3 rounded-xl hover:bg-[var(--bg)] transition-colors">
              {item.image && (
                <img
                  src={item.image}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text)] group-hover:text-[#e05d44] dark:group-hover:text-[#e87461] transition-colors line-clamp-2">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-[var(--text-muted)]">
                  {item.source && <span>{item.source}</span>}
                  {item.date && <span>{timeAgo(item.date)}</span>}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Show more / less */}
      {thread.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-[#e05d44] dark:text-[#e87461] hover:text-[#c94e38] transition-colors mt-1 ml-6"
        >
          {expanded ? 'Show less' : `Show ${thread.length - 4} more articles`}
        </button>
      )}
    </div>
  );
}
