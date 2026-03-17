import { createContext, useContext, useState, useRef, useCallback } from 'react';

const AudioCtx = createContext(null);

export function AudioProvider({ children }) {
  const [currentArticle, setCurrentArticle] = useState(null);
  const [queue, setQueue] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState('');
  const audioRef = useRef(null);
  const abortRef = useRef(null);

  // Format seconds to m:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const stop = useCallback(() => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; audioRef.current = null; }
    setPlaying(false);
    setPaused(false);
    setLoading(false);
    setProgress(0);
    setDuration('');
    setCurrentArticle(null);
  }, []);

  const playNextRef = useRef(null);

  const playArticle = useCallback((article, lang = 'en') => {
    // Stop any current playback
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }

    setCurrentArticle(article);
    setPlaying(true);
    setPaused(false);
    setLoading(true);
    setProgress(0);

    const text = `${article.title}. ${(article.body || article.description || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()}`.slice(0, 5000);

    const controller = new AbortController();
    abortRef.current = controller;

    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang }),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('TTS generation failed');
        return res.blob();
      })
      .then((blob) => {
        if (controller.signal.aborted) return;
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.playbackRate = speed;
        audioRef.current = audio;

        audio.onloadedmetadata = () => {
          setDuration(formatTime(audio.duration));
          setLoading(false);
        };

        audio.ontimeupdate = () => {
          if (audio.duration) {
            setProgress((audio.currentTime / audio.duration) * 100);
          }
        };

        audio.onended = () => {
          URL.revokeObjectURL(url);
          setPlaying(false);
          setPaused(false);
          setProgress(100);
          // Play next in queue
          if (playNextRef.current) setTimeout(playNextRef.current, 300);
        };

        audio.onerror = () => {
          URL.revokeObjectURL(url);
          setPlaying(false);
          setPaused(false);
          setLoading(false);
        };

        audio.play().catch(() => {
          setPlaying(false);
          setLoading(false);
        });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('TTS error:', err);
        setPlaying(false);
        setLoading(false);
      });
  }, [speed]);

  const playNext = useCallback(() => {
    setQueue((prev) => {
      if (prev.length === 0) {
        stop();
        return prev;
      }
      const [next, ...rest] = prev;
      setTimeout(() => playArticle(next), 100);
      return rest;
    });
  }, [stop, playArticle]);

  // Keep playNextRef in sync
  playNextRef.current = playNext;

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play();
    setPaused(false);
  }, []);

  const addToQueue = useCallback((article) => {
    setQueue((prev) => {
      if (prev.some((a) => a.id === article.id)) return prev;
      return [...prev, article];
    });
  }, []);

  const removeFromQueue = useCallback((articleId) => {
    setQueue((prev) => prev.filter((a) => a.id !== articleId));
  }, []);

  const clearQueue = useCallback(() => setQueue([]), []);

  const changeSpeed = useCallback((newSpeed) => {
    setSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  }, []);

  const seekTo = useCallback((pct) => {
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (pct / 100) * audioRef.current.duration;
      setProgress(pct);
    }
  }, []);

  const value = {
    currentArticle,
    queue,
    playing,
    paused,
    loading,
    speed,
    progress,
    duration,
    playArticle,
    pause,
    resume,
    stop,
    addToQueue,
    removeFromQueue,
    clearQueue,
    changeSpeed,
    seekTo,
  };

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

export default function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}
