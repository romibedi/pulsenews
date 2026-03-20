import { useState, useRef, useEffect } from 'react';
import useAudio from '../contexts/AudioContext';

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const SLEEP_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '60 min', value: 60 },
  { label: 'End of article', value: 'end' },
];

// --- Draggable Seek Bar ---
function SeekBar({ progress, onSeek, height = 'h-1.5', thumbSize = 'w-3 h-3', className = '' }) {
  const barRef = useRef(null);
  const draggingRef = useRef(false);
  const [localProgress, setLocalProgress] = useState(null);

  const calcPercent = (clientX) => {
    const rect = barRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    draggingRef.current = true;
    const pct = calcPercent(e.clientX ?? e.touches?.[0]?.clientX);
    setLocalProgress(pct);
    onSeek(pct);

    const handleMove = (ev) => {
      if (!draggingRef.current) return;
      ev.preventDefault();
      const x = ev.clientX ?? ev.touches?.[0]?.clientX;
      if (x == null) return;
      const p = calcPercent(x);
      setLocalProgress(p);
      onSeek(p);
    };
    const handleUp = () => {
      draggingRef.current = false;
      setLocalProgress(null);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('touchmove', handleMove, { passive: false });
      document.removeEventListener('touchend', handleUp);
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleUp);
  };

  const displayProgress = localProgress ?? progress;

  return (
    <div
      ref={barRef}
      className={`${height} bg-[var(--border)] rounded-full cursor-pointer group relative select-none touch-none ${className}`}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
    >
      <div
        className="h-full bg-[#e05d44] dark:bg-[#e87461] rounded-full relative transition-[width] duration-75"
        style={{ width: `${displayProgress}%` }}
      >
        <div className={`absolute right-0 top-1/2 -translate-y-1/2 ${thumbSize} bg-[#e05d44] dark:bg-[#e87461] rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity ${draggingRef.current ? '!opacity-100 scale-125' : ''}`} />
      </div>
    </div>
  );
}

const PLACEHOLDER_IMG = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="#1e1e1e"/><g transform="translate(24,20)" fill="none" stroke="#555" stroke-width="2"><path d="M16 36V10l24-4v26"/><circle cx="8" cy="36" r="6"/><circle cx="24" cy="32" r="6"/></g></svg>'
);

// --- Waveform Visualizer ---
function WaveformBars({ playing, paused, barCount = 20, height = 24, className = '' }) {
  const [bars, setBars] = useState(() => Array(barCount).fill(0.2));
  const frameRef = useRef(null);

  useEffect(() => {
    if (!playing || paused) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      return;
    }
    let t = 0;
    function animate() {
      t++;
      setBars(Array.from({ length: barCount }, (_, i) => {
        const base = 0.15 + 0.35 * Math.sin((t * 0.08) + i * 0.7);
        const jitter = 0.2 * Math.sin((t * 0.15) + i * 1.3);
        return Math.max(0.08, Math.min(1, base + jitter));
      }));
      frameRef.current = requestAnimationFrame(animate);
    }
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [playing, paused, barCount]);

  return (
    <div className={`flex items-end gap-[2px] ${className}`} style={{ height }}>
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-full bg-[#e05d44] dark:bg-[#e87461] transition-all duration-75"
          style={{ height: `${h * 100}%`, opacity: playing && !paused ? 0.8 : 0.3 }}
        />
      ))}
    </div>
  );
}

// --- Mini Player ---
function MiniPlayer({ onExpand }) {
  const {
    currentArticle, queue, playing, paused, loading, speed, progress, duration,
    pause, resume, stop, changeSpeed, clearQueue, seekTo,
    skipForward, skipBackward,
  } = useAudio();
  const [showQueue, setShowQueue] = useState(false);
  const { removeFromQueue } = useAudio();

  if (!currentArticle && queue.length === 0) return null;

  return (
    <div className="fixed left-0 right-0 z-50 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] shadow-lg bottom-[calc(49px+env(safe-area-inset-bottom,0px))] md:bottom-0">
      {/* Seekable progress bar */}
      {currentArticle && (
        <SeekBar progress={progress} onSeek={seekTo} height="h-1.5" thumbSize="w-3 h-3" />
      )}

      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center gap-3">
          {/* Album art */}
          {currentArticle && (
            <button onClick={onExpand} className="shrink-0">
              <img
                src={currentArticle.image || PLACEHOLDER_IMG}
                alt=""
                className="w-11 h-11 rounded-lg object-cover shadow-md"
                onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
              />
            </button>
          )}

          {/* Controls */}
          <div className="flex items-center gap-1">
            {playing || loading ? (
              <>
                <button
                  onClick={() => skipBackward(15)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                  title="Back 15s"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    <text x="12" y="15.5" textAnchor="middle" fill="currentColor" stroke="none" fontSize="7" fontWeight="bold">15</text>
                  </svg>
                </button>
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
                  onClick={() => skipForward(15)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                  title="Forward 15s"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    <text x="12" y="15.5" textAnchor="middle" fill="currentColor" stroke="none" fontSize="7" fontWeight="bold">15</text>
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

          {/* Article info — tap to expand */}
          <button onClick={onExpand} className="flex-1 min-w-0 text-left">
            {currentArticle ? (
              <>
                <p className="text-sm font-medium text-[var(--text)] truncate">{currentArticle.title}</p>
                <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                  <span>{currentArticle.source || currentArticle.author}</span>
                  {loading && <span className="text-[#e05d44] dark:text-[#e87461] font-medium">Loading...</span>}
                  {!loading && duration && <span>&middot; {duration}</span>}
                  {paused && <span className="text-amber-500 font-medium">Paused</span>}
                </div>
              </>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">{queue.length} article{queue.length !== 1 ? 's' : ''} in queue</p>
            )}
          </button>

          {/* Waveform — mini */}
          {(playing || paused) && !loading && (
            <WaveformBars playing={playing} paused={paused} barCount={8} height={20} className="w-10 shrink-0 hidden sm:flex" />
          )}

          {/* Speed */}
          {(playing || paused) && !loading && (
            <button
              onClick={() => {
                const idx = SPEEDS.indexOf(speed);
                changeSpeed(SPEEDS[(idx + 1) % SPEEDS.length]);
              }}
              className="px-2 py-1 text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg)] rounded-md hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors border border-[var(--border)]"
            >
              {speed}x
            </button>
          )}

          {/* Expand chevron */}
          {currentArticle && (
            <button onClick={onExpand} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <path d="M18 15l-6-6-6 6" />
              </svg>
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

// --- Full Screen Player ---
function FullScreenPlayer({ onCollapse }) {
  const {
    currentArticle, queue, playing, paused, loading, speed, progress, duration,
    currentTime, durationRaw, sleepTimerRemaining, sleepAfterCurrent,
    pause, resume, stop, changeSpeed, seekTo, clearQueue, removeFromQueue,
    skipForward, skipBackward, setSleepTimer, cancelSleepTimer, downloadAudio, formatTime,
  } = useAudio();
  const [showSleep, setShowSleep] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const touchStartRef = useRef(null);

  const handleTouchStart = (e) => {
    // Don't capture swipe if it starts on the seekbar
    if (e.target.closest('.touch-none')) { touchStartRef.current = null; return; }
    touchStartRef.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    if (touchStartRef.current === null) return;
    const delta = e.changedTouches[0].clientY - touchStartRef.current;
    if (delta > 60) onCollapse(); // Swipe down
    touchStartRef.current = null;
  };

  if (!currentArticle) return null;

  const sleepLabel = sleepAfterCurrent ? 'End of article'
    : sleepTimerRemaining > 0 ? formatTime(sleepTimerRemaining)
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[var(--bg)] animate-slide-up"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Handle / close bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <button onClick={onCollapse} className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <div className="w-10 h-1 bg-[var(--border)] rounded-full" />
        <button
          onClick={() => { stop(); clearQueue(); onCollapse(); }}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 flex flex-col items-center px-6 overflow-y-auto">
        {/* Large album art */}
        <div className="w-64 h-64 sm:w-72 sm:h-72 mt-4 mb-6 rounded-2xl overflow-hidden shadow-2xl">
          <img
            src={currentArticle.image || PLACEHOLDER_IMG}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
          />
        </div>

        {/* Title & source */}
        <div className="w-full max-w-sm text-center mb-4">
          <h2 className="text-lg font-semibold text-[var(--text)] leading-snug mb-1 line-clamp-3" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            {currentArticle.title}
          </h2>
          <p className="text-sm text-[var(--text-muted)]">{currentArticle.source || currentArticle.author}</p>
        </div>

        {/* Waveform */}
        <WaveformBars playing={playing} paused={paused} barCount={32} height={40} className="w-full max-w-sm mb-4" />

        {/* Progress bar */}
        <div className="w-full max-w-sm mb-2">
          <SeekBar progress={progress} onSeek={seekTo} height="h-2" thumbSize="w-4 h-4" />
          <div className="flex justify-between mt-1.5 text-[11px] text-[var(--text-muted)]">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(Math.max(0, (durationRaw - currentTime) / speed))}</span>
          </div>
        </div>

        {/* Transport controls */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <button onClick={() => skipBackward(15)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors" title="Back 15s">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              <text x="12" y="15" textAnchor="middle" fill="currentColor" stroke="none" fontSize="7" fontWeight="bold">15</text>
            </svg>
          </button>

          <button
            onClick={loading ? undefined : (paused ? resume : pause)}
            className={`w-16 h-16 flex items-center justify-center rounded-full bg-[#e05d44] dark:bg-[#e87461] text-white shadow-lg hover:bg-[#c94e38] transition-all ${loading ? 'opacity-70' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
              </svg>
            ) : paused ? (
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            ) : (
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
              </svg>
            )}
          </button>

          <button onClick={() => skipForward(15)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors" title="Forward 15s">
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              <text x="12" y="15" textAnchor="middle" fill="currentColor" stroke="none" fontSize="7" fontWeight="bold">15</text>
            </svg>
          </button>
        </div>

        {/* Secondary controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {/* Speed */}
          <button
            onClick={() => {
              const idx = SPEEDS.indexOf(speed);
              changeSpeed(SPEEDS[(idx + 1) % SPEEDS.length]);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] bg-[var(--surface)] rounded-lg border border-[var(--border)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors"
          >
            {speed}x
          </button>

          {/* Sleep timer */}
          <div className="relative">
            <button
              onClick={() => setShowSleep(!showSleep)}
              className={`p-2 rounded-lg border transition-colors ${
                sleepLabel
                  ? 'text-[#e05d44] dark:text-[#e87461] border-[#e05d44]/30 dark:border-[#e87461]/30 bg-[#fef0ed] dark:bg-[#e87461]/10'
                  : 'text-[var(--text-secondary)] border-[var(--border)] bg-[var(--surface)] hover:text-[#e05d44] dark:hover:text-[#e87461]'
              }`}
              title="Sleep timer"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>
            {sleepLabel && (
              <span className="absolute -top-2 -right-2 text-[9px] font-bold text-white bg-[#e05d44] dark:bg-[#e87461] px-1.5 py-0.5 rounded-full">
                {sleepLabel}
              </span>
            )}
            {showSleep && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl p-2 min-w-[140px] z-10">
                {SLEEP_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setSleepTimer(opt.value); setShowSleep(false); }}
                    className="block w-full text-left px-3 py-2 text-sm text-[var(--text)] rounded-lg hover:bg-[var(--bg)] transition-colors"
                  >
                    {opt.label}
                  </button>
                ))}
                {sleepLabel && (
                  <button
                    onClick={() => { cancelSleepTimer(); setShowSleep(false); }}
                    className="block w-full text-left px-3 py-2 text-sm text-red-500 rounded-lg hover:bg-[var(--bg)] transition-colors border-t border-[var(--border)] mt-1 pt-2"
                  >
                    Cancel timer
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Download */}
          <button
            onClick={() => downloadAudio(currentArticle)}
            className="p-2 text-[var(--text-secondary)] bg-[var(--surface)] rounded-lg border border-[var(--border)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors"
            title="Download audio"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>

          {/* Queue */}
          {queue.length > 0 && (
            <button
              onClick={() => setShowQueue(!showQueue)}
              className="relative p-2 text-[var(--text-secondary)] bg-[var(--surface)] rounded-lg border border-[var(--border)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors"
              title="Queue"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#e05d44] dark:bg-[#e87461] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {queue.length}
              </span>
            </button>
          )}
        </div>

        {/* Queue list in expanded view */}
        {showQueue && queue.length > 0 && (
          <div className="w-full max-w-sm mb-6 bg-[var(--surface)] rounded-xl border border-[var(--border)] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Up Next</span>
              <button onClick={() => { clearQueue(); setShowQueue(false); }} className="text-[10px] text-[var(--text-muted)] hover:text-red-500">
                Clear all
              </button>
            </div>
            {queue.map((article, i) => (
              <div key={article.id} className="flex items-center gap-2 py-2 border-t border-[var(--border)]">
                <img
                  src={article.image || PLACEHOLDER_IMG}
                  alt=""
                  className="w-8 h-8 rounded object-cover"
                  onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--text)] truncate">{article.title}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{article.source}</p>
                </div>
                <button
                  onClick={() => removeFromQueue(article.id)}
                  className="text-[var(--text-muted)] hover:text-red-500 p-1"
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

// --- Main AudioPlayer ---
export default function AudioPlayer() {
  const { currentArticle, queue, expanded, expandPlayer, collapsePlayer } = useAudio();

  if (!currentArticle && queue.length === 0) return null;

  if (expanded && currentArticle) {
    return <FullScreenPlayer onCollapse={collapsePlayer} />;
  }

  return <MiniPlayer onExpand={expandPlayer} />;
}
