import { useState } from 'react';
import useAudio from '../contexts/AudioContext';

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export default function AudioPlayer() {
  const { currentArticle, queue, playing, paused, loading, speed, progress, duration, pause, resume, stop, changeSpeed, clearQueue, removeFromQueue, seekTo } = useAudio();
  const [showQueue, setShowQueue] = useState(false);

  if (!currentArticle && queue.length === 0) return null;

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    seekTo(Math.max(0, Math.min(100, pct)));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] shadow-lg">
      {/* Seekable progress bar */}
      {currentArticle && (
        <div
          className="h-1.5 bg-[var(--border)] cursor-pointer group"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-[#e05d44] dark:bg-[#e87461] transition-all duration-300 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#e05d44] dark:bg-[#e87461] rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow" />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Play/Pause/Stop controls */}
          <div className="flex items-center gap-1.5">
            {playing || loading ? (
              <>
                <button
                  onClick={loading ? undefined : (paused ? resume : pause)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full bg-[#e05d44] dark:bg-[#e87461] text-white hover:bg-[#c94e38] transition-colors ${loading ? 'opacity-70' : ''}`}
                  title={loading ? 'Loading...' : paused ? 'Resume' : 'Pause'}
                  disabled={loading}
                >
                  {loading ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                      <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
                    </svg>
                  ) : paused ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={stop}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
                  title="Stop"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" />
                  </svg>
                </button>
              </>
            ) : (
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--bg)] text-[var(--text-muted)]">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                </svg>
              </div>
            )}
          </div>

          {/* Article info */}
          <div className="flex-1 min-w-0">
            {currentArticle ? (
              <>
                <p className="text-sm font-medium text-[var(--text)] truncate">{currentArticle.title}</p>
                <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                  <span>{currentArticle.source || currentArticle.author}</span>
                  {loading && <span className="text-[#e05d44] dark:text-[#e87461] font-medium">Generating audio...</span>}
                  {!loading && duration && <span>&middot; {duration}</span>}
                  {paused && <span className="text-amber-500 font-medium">Paused</span>}
                </div>
              </>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">{queue.length} article{queue.length !== 1 ? 's' : ''} in queue</p>
            )}
          </div>

          {/* Speed control */}
          {(playing || paused) && !loading && (
            <button
              onClick={() => {
                const idx = SPEEDS.indexOf(speed);
                const next = SPEEDS[(idx + 1) % SPEEDS.length];
                changeSpeed(next);
              }}
              className="px-2 py-1 text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg)] rounded-md hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors border border-[var(--border)]"
              title="Playback speed"
            >
              {speed}x
            </button>
          )}

          {/* Queue button */}
          {queue.length > 0 && (
            <button
              onClick={() => setShowQueue(!showQueue)}
              className="relative px-2 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
              title="Queue"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#e05d44] dark:bg-[#e87461] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {queue.length}
              </span>
            </button>
          )}

          {/* Close */}
          {!playing && !loading && (
            <button
              onClick={() => { stop(); clearQueue(); }}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              title="Close"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Queue dropdown */}
        {showQueue && queue.length > 0 && (
          <div className="mt-2 pt-2 border-t border-[var(--border)] max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Up Next</span>
              <button onClick={() => { clearQueue(); setShowQueue(false); }} className="text-[10px] text-[var(--text-muted)] hover:text-red-500 transition-colors">
                Clear all
              </button>
            </div>
            {queue.map((article, i) => (
              <div key={article.id} className="flex items-center gap-2 py-1.5 group">
                <span className="text-[10px] text-[var(--text-muted)] w-4">{i + 1}</span>
                <p className="text-xs text-[var(--text)] truncate flex-1">{article.title}</p>
                <button
                  onClick={() => removeFromQueue(article.id)}
                  className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-500 transition-all p-1"
                >
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
