import { createContext, useContext, useState, useRef, useCallback } from 'react';

const AudioCtx = createContext(null);

const HAS_SPEECH = typeof window !== 'undefined' && 'speechSynthesis' in window;

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
  const progressRef = useRef(null);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const clearTimers = useCallback(() => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      audioRef.current = null;
    }
    if (HAS_SPEECH) speechSynthesis.cancel();
  }, []);

  const stop = useCallback(() => {
    stopAudio();
    clearTimers();
    setPlaying(false);
    setPaused(false);
    setLoading(false);
    setProgress(0);
    setDuration('');
    setCurrentArticle(null);
  }, [stopAudio, clearTimers]);

  const playNextRef = useRef(null);
  const prefetchCache = useRef(new Map());

  // Read user's region from localStorage
  const getRegion = () => {
    try { return JSON.parse(localStorage.getItem('pulsenews-region')) || ''; } catch { return ''; }
  };

  // Build TTS URL for an article
  const buildTtsUrl = useCallback((article, lang) => {
    const body = (article.body || article.description || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const text = `${article.title}. ${body}`.slice(0, 2000);
    const encoded = encodeURIComponent(text);
    const region = getRegion();
    const regionParam = lang === 'en' && region ? `&region=${region}` : '';
    if (encoded.length < 8000) return { url: `/api/tts?text=${encoded}&lang=${lang}${regionParam}`, text };
    return { url: null, text, region };
  }, []);

  // Pre-warm TTS audio on hover — starts buffering before user clicks
  const prefetchArticle = useCallback((article) => {
    if (prefetchCache.current.has(article.id)) return;
    const lang = (() => {
      try { return JSON.parse(localStorage.getItem('pulsenews-lang')) || 'en'; } catch { return 'en'; }
    })();
    const { url } = buildTtsUrl(article, lang);
    if (!url) return;
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = url;
    prefetchCache.current.set(article.id, audio);
    // Discard if not used within 30s
    setTimeout(() => {
      if (prefetchCache.current.get(article.id) === audio) {
        prefetchCache.current.delete(article.id);
        audio.removeAttribute('src');
        audio.load();
      }
    }, 30000);
  }, [buildTtsUrl]);

  const setupAudioElement = useCallback((audio) => {
    audioRef.current = audio;
    audio.playbackRate = speed;

    audio.onloadedmetadata = () => {
      const dur = audio.duration;
      if (dur && isFinite(dur)) setDuration(formatTime(dur / speed));
    };

    audio.onplaying = () => {
      setLoading(false);
      progressRef.current = setInterval(() => {
        if (audio.duration && isFinite(audio.duration)) {
          setProgress(Math.min((audio.currentTime / audio.duration) * 100, 99));
          setDuration(formatTime((audio.duration - audio.currentTime) / audio.playbackRate));
        }
      }, 200);
    };

    audio.onended = () => {
      clearTimers();
      audioRef.current = null;
      setPlaying(false);
      setPaused(false);
      setProgress(100);
      if (playNextRef.current) setTimeout(playNextRef.current, 300);
    };

    audio.onerror = () => {
      clearTimers();
      audioRef.current = null;
      setPlaying(false);
      setPaused(false);
      setLoading(false);
    };
  }, [speed, clearTimers]);

  const playArticle = useCallback((article, langOverride) => {
    const lang = langOverride || (() => {
      try { return JSON.parse(localStorage.getItem('pulsenews-lang')) || 'en'; } catch { return 'en'; }
    })();

    stopAudio();
    clearTimers();

    setCurrentArticle(article);
    setPlaying(true);
    setPaused(false);
    setLoading(true);
    setProgress(0);

    // Check prefetch cache — audio may already be buffered from hover
    const cached = prefetchCache.current.get(article.id);
    if (cached) {
      prefetchCache.current.delete(article.id);
      setupAudioElement(cached);
      cached.play().catch(() => {
        if (HAS_SPEECH) playWithBrowserTTS(buildTtsUrl(article, lang).text, lang);
      });
      return;
    }

    const { url, text } = buildTtsUrl(article, lang);

    // Use GET URL so Audio element streams natively (starts playing as chunks arrive)
    // Fall back to POST+blob for very long texts that would exceed URL limits
    if (url) {
      const audio = new Audio(url);
      setupAudioElement(audio);
      audio.play().catch(() => {
        if (HAS_SPEECH) playWithBrowserTTS(text, lang);
      });
    } else {
      fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang, region: getRegion() }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('TTS server error');
          return res.blob();
        })
        .then((blob) => {
          const blobUrl = URL.createObjectURL(blob);
          const audio = new Audio(blobUrl);
          setupAudioElement(audio);
          const origEnd = audio.onended;
          audio.onended = () => { URL.revokeObjectURL(blobUrl); origEnd?.(); };
          audio.play();
        })
        .catch(() => {
          if (HAS_SPEECH) playWithBrowserTTS(text, lang);
        });
    }
  }, [speed, stopAudio, clearTimers, setupAudioElement, buildTtsUrl]);

  // Browser Web Speech API fallback
  const playWithBrowserTTS = useCallback((text, lang) => {
    if (!HAS_SPEECH) return;
    speechSynthesis.cancel();

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speed;
      utterance.lang = lang;

      const voices = speechSynthesis.getVoices();
      const matching = voices.filter((v) => v.lang.startsWith(lang));
      const preferred = matching.find((v) => /google|neural|enhanced|samantha/i.test(v.name));
      if (preferred || matching[0]) {
        utterance.voice = preferred || matching[0];
      }

      utterance.onstart = () => setLoading(false);
      utterance.onend = () => {
        setPlaying(false);
        setPaused(false);
        setProgress(100);
        if (playNextRef.current) setTimeout(playNextRef.current, 300);
      };
      utterance.onerror = (e) => {
        if (e.error === 'canceled') return;
        setPlaying(false);
        setPaused(false);
        setLoading(false);
      };

      speechSynthesis.speak(utterance);
    }, 100);
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

  playNextRef.current = playNext;

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    } else if (HAS_SPEECH) {
      speechSynthesis.pause();
    }
    clearTimers();
    setPaused(true);
  }, [clearTimers]);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      progressRef.current = setInterval(() => {
        const audio = audioRef.current;
        if (audio?.duration && isFinite(audio.duration)) {
          setProgress(Math.min((audio.currentTime / audio.duration) * 100, 99));
        }
      }, 200);
    } else if (HAS_SPEECH) {
      speechSynthesis.resume();
    }
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
    if (audioRef.current?.duration && isFinite(audioRef.current.duration)) {
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
    prefetchArticle,
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
