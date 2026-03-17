import { useState, useEffect, useRef } from 'react';

export default function TextToSpeech({ text, title }) {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(true);
  const utterRef = useRef(null);

  useEffect(() => {
    if (!('speechSynthesis' in window)) setSupported(false);
    return () => window.speechSynthesis?.cancel();
  }, []);

  if (!supported || !text) return null;

  const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  const fullText = title ? `${title}. ${cleanText}` : cleanText;

  const play = () => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(fullText);
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.onend = () => { setPlaying(false); setPaused(false); };
    utter.onerror = () => { setPlaying(false); setPaused(false); };
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
    setPlaying(true);
    setPaused(false);
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setPaused(true);
  };

  const resume = () => {
    window.speechSynthesis.resume();
    setPaused(false);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setPlaying(false);
    setPaused(false);
  };

  const btnClass = 'w-9 h-9 flex items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:text-[#e05d44] dark:hover:text-[#e87461] hover:border-[#e05d44]/30 dark:hover:border-[#e87461]/30 transition-all';

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--text-muted)] mr-1">Listen</span>
      {!playing ? (
        <button onClick={play} className={btnClass} title="Read aloud">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </button>
      ) : (
        <>
          <button onClick={paused ? resume : pause} className={btnClass} title={paused ? 'Resume' : 'Pause'}>
            {paused ? (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            ) : (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
              </svg>
            )}
          </button>
          <button onClick={stop} className={btnClass} title="Stop">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" />
            </svg>
          </button>
        </>
      )}
      {playing && (
        <span className="text-[10px] text-[#e05d44] dark:text-[#e87461] font-medium animate-pulse">
          {paused ? 'Paused' : 'Playing...'}
        </span>
      )}
    </div>
  );
}
