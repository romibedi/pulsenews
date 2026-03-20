import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import useAutoplayHook from '../hooks/useAutoplay';

const AudioCtx = createContext(null);

const HAS_SPEECH = typeof window !== 'undefined' && 'speechSynthesis' in window;
const HAS_MEDIA_SESSION = typeof navigator !== 'undefined' && 'mediaSession' in navigator;

// --- Progress memory helpers ---
const PROGRESS_KEY = 'pulsenews-audio-progress';
function loadSavedProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    // Prune entries older than 30 days
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const pruned = {};
    for (const [id, entry] of Object.entries(data)) {
      if (entry.timestamp > cutoff) pruned[id] = entry;
    }
    return pruned;
  } catch { return {}; }
}
function saveProgress(articleId, position, duration) {
  try {
    const data = loadSavedProgress();
    data[articleId] = { position, duration, timestamp: Date.now() };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch {}
}
function clearSavedProgress(articleId) {
  try {
    const data = loadSavedProgress();
    delete data[articleId];
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch {}
}
function getSavedPosition(articleId) {
  const data = loadSavedProgress();
  const entry = data[articleId];
  if (entry && entry.position > 5) return entry.position;
  return 0;
}

export function AudioProvider({ children }) {
  const { autoplay, toggleAutoplay } = useAutoplayHook();
  const [currentArticle, setCurrentArticle] = useState(null);
  const [queue, setQueue] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [durationRaw, setDurationRaw] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // Sleep timer
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(null);
  const [sleepAfterCurrent, setSleepAfterCurrent] = useState(false);
  const sleepTimerRef = useRef(null);
  const sleepEndRef = useRef(null);

  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const saveProgressThrottleRef = useRef(0);

  const formatTime = (secs) => {
    if (!secs || !isFinite(secs) || secs < 0) return '0:00';
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
    setCurrentTime(0);
    setDurationRaw(0);
    setCurrentArticle(null);
    setExpanded(false);
    // Clear sleep timer
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    sleepEndRef.current = null;
    setSleepTimerRemaining(null);
    setSleepAfterCurrent(false);
  }, [stopAudio, clearTimers]);

  const playNextRef = useRef(null);
  const prefetchCache = useRef(new Map());

  const getRegion = () => {
    try { return JSON.parse(localStorage.getItem('pulsenews-region')) || ''; } catch { return ''; }
  };

  const buildTtsUrl = useCallback((article, lang) => {
    const body = (article.body || article.description || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const text = `${article.title}. ${body}`.slice(0, 2000);
    const pregenUrl = article.slug ? `/audio/${lang || 'en'}/${article.slug}.mp3` : null;
    const encoded = encodeURIComponent(text);
    const region = getRegion();
    const regionParam = lang === 'en' && region ? `&region=${region}` : '';
    const apiUrl = encoded.length < 8000 ? `/api/tts?text=${encoded}&lang=${lang}${regionParam}` : null;
    return { url: pregenUrl, fallbackUrl: apiUrl, text, region };
  }, []);

  const prefetchArticle = useCallback((article) => {
    if (prefetchCache.current.has(article.id)) return;
    const lang = (() => {
      try { return JSON.parse(localStorage.getItem('pulsenews-lang')) || 'en'; } catch { return 'en'; }
    })();
    const { url, fallbackUrl } = buildTtsUrl(article, lang);
    const src = url || fallbackUrl;
    if (!src) return;
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = src;
    if (url && fallbackUrl) {
      audio.onerror = () => { audio.onerror = null; audio.src = fallbackUrl; };
    }
    prefetchCache.current.set(article.id, audio);
    setTimeout(() => {
      if (prefetchCache.current.get(article.id) === audio) {
        prefetchCache.current.delete(article.id);
        audio.removeAttribute('src');
        audio.load();
      }
    }, 30000);
  }, [buildTtsUrl]);

  // --- MediaSession integration ---
  const updateMediaSession = useCallback((article, isPlaying) => {
    if (!HAS_MEDIA_SESSION || !article) return;
    try {
      const artwork = article.image ? [
        { src: article.image.startsWith('/') ? `${window.location.origin}${article.image}` : article.image, sizes: '512x512', type: 'image/jpeg' },
      ] : [];
      navigator.mediaSession.metadata = new MediaMetadata({
        title: article.title,
        artist: article.source || article.author || 'PulseNewsToday',
        album: 'PulseNewsToday',
        artwork,
      });
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch {}
  }, []);

  const updateMediaPositionState = useCallback(() => {
    if (!HAS_MEDIA_SESSION || !audioRef.current) return;
    try {
      const audio = audioRef.current;
      if (audio.duration && isFinite(audio.duration)) {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          playbackRate: audio.playbackRate,
          position: Math.min(audio.currentTime, audio.duration),
        });
      }
    } catch {}
  }, []);

  const setupAudioElement = useCallback((audio, articleForResume) => {
    audioRef.current = audio;
    audio.playbackRate = speed;

    audio.onloadedmetadata = () => {
      const dur = audio.duration;
      if (dur && isFinite(dur)) {
        setDuration(formatTime(dur / speed));
        setDurationRaw(dur);
        // Resume from saved position
        if (articleForResume) {
          const savedPos = getSavedPosition(articleForResume.id);
          if (savedPos > 0 && savedPos < dur - 5) {
            audio.currentTime = savedPos;
          }
        }
      }
    };

    audio.onplaying = () => {
      setLoading(false);
      progressRef.current = setInterval(() => {
        if (audio.duration && isFinite(audio.duration)) {
          const pct = Math.min((audio.currentTime / audio.duration) * 100, 99);
          setProgress(pct);
          setCurrentTime(audio.currentTime);
          setDurationRaw(audio.duration);
          setDuration(formatTime((audio.duration - audio.currentTime) / audio.playbackRate));
          // Save progress every 5 seconds
          const now = Date.now();
          if (now - saveProgressThrottleRef.current > 5000 && articleForResume) {
            saveProgressThrottleRef.current = now;
            saveProgress(articleForResume.id, audio.currentTime, audio.duration);
          }
          updateMediaPositionState();
        }
      }, 200);
    };

    audio.onended = () => {
      clearTimers();
      audioRef.current = null;
      setPlaying(false);
      setPaused(false);
      setProgress(100);
      // Clear saved progress for completed articles
      if (articleForResume) clearSavedProgress(articleForResume.id);
      // Check sleep-after-current
      if (sleepAfterCurrent) {
        setSleepAfterCurrent(false);
        setSleepTimerRemaining(null);
        return; // Don't play next
      }
      if (playNextRef.current) setTimeout(playNextRef.current, 300);
    };

    audio.onerror = () => {
      clearTimers();
      audioRef.current = null;
      setPlaying(false);
      setPaused(false);
      setLoading(false);
    };
  }, [speed, clearTimers, updateMediaPositionState]);

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
    setCurrentTime(0);

    updateMediaSession(article, true);

    const cached = prefetchCache.current.get(article.id);
    if (cached) {
      prefetchCache.current.delete(article.id);
      setupAudioElement(cached, article);
      cached.play().catch(() => {
        if (HAS_SPEECH) playWithBrowserTTS(buildTtsUrl(article, lang).text, lang);
      });
      return;
    }

    const { url, fallbackUrl, text } = buildTtsUrl(article, lang);

    const tryPlay = (src) => {
      const audio = new Audio(src);
      setupAudioElement(audio, article);
      audio.play().catch(() => {
        if (src === url && fallbackUrl) {
          tryPlay(fallbackUrl);
        } else if (HAS_SPEECH) {
          playWithBrowserTTS(text, lang);
        }
      });
      if (src === url && fallbackUrl) {
        const origError = audio.onerror;
        audio.onerror = () => {
          audio.onerror = origError;
          tryPlay(fallbackUrl);
        };
      }
    };

    if (url || fallbackUrl) {
      tryPlay(url || fallbackUrl);
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
          setupAudioElement(audio, article);
          const origEnd = audio.onended;
          audio.onended = () => { URL.revokeObjectURL(blobUrl); origEnd?.(); };
          audio.play();
        })
        .catch(() => {
          if (HAS_SPEECH) playWithBrowserTTS(text, lang);
        });
    }
  }, [speed, stopAudio, clearTimers, setupAudioElement, buildTtsUrl, updateMediaSession]);

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
      if (preferred || matching[0]) utterance.voice = preferred || matching[0];
      utterance.onstart = () => setLoading(false);
      utterance.onend = () => {
        setPlaying(false);
        setPaused(false);
        setProgress(100);
        if (sleepAfterCurrent) {
          setSleepAfterCurrent(false);
          setSleepTimerRemaining(null);
          return;
        }
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
    if (HAS_MEDIA_SESSION) navigator.mediaSession.playbackState = 'paused';
  }, [clearTimers]);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      progressRef.current = setInterval(() => {
        const audio = audioRef.current;
        if (audio?.duration && isFinite(audio.duration)) {
          setProgress(Math.min((audio.currentTime / audio.duration) * 100, 99));
          setCurrentTime(audio.currentTime);
          setDuration(formatTime((audio.duration - audio.currentTime) / audio.playbackRate));
        }
      }, 200);
    } else if (HAS_SPEECH) {
      speechSynthesis.resume();
    }
    setPaused(false);
    if (HAS_MEDIA_SESSION) navigator.mediaSession.playbackState = 'playing';
  }, []);

  // --- Skip forward/backward ---
  const skipForward = useCallback((secs = 15) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    audio.currentTime = Math.min(audio.currentTime + secs, audio.duration || 0);
    setCurrentTime(audio.currentTime);
    setProgress(Math.min((audio.currentTime / audio.duration) * 100, 99));
  }, []);

  const skipBackward = useCallback((secs = 15) => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    audio.currentTime = Math.max(audio.currentTime - secs, 0);
    setCurrentTime(audio.currentTime);
    setProgress(Math.min((audio.currentTime / audio.duration) * 100, 99));
  }, []);

  // --- Sleep timer ---
  const setSleepTimer = useCallback((minutes) => {
    // Clear existing
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    setSleepAfterCurrent(false);

    if (minutes === 'end') {
      setSleepAfterCurrent(true);
      setSleepTimerRemaining(-1); // -1 = end of article indicator
      return;
    }

    const endTime = Date.now() + minutes * 60 * 1000;
    sleepEndRef.current = endTime;
    setSleepTimerRemaining(minutes * 60);

    sleepTimerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((sleepEndRef.current - Date.now()) / 1000));
      setSleepTimerRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(sleepTimerRef.current);
        sleepTimerRef.current = null;
        sleepEndRef.current = null;
        setSleepTimerRemaining(null);
        stop();
      }
    }, 1000);
  }, [stop]);

  const cancelSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    sleepTimerRef.current = null;
    sleepEndRef.current = null;
    setSleepTimerRemaining(null);
    setSleepAfterCurrent(false);
  }, []);

  // --- Download audio ---
  const downloadAudio = useCallback(async (article) => {
    if (!article?.slug) return;
    const lang = (() => {
      try { return JSON.parse(localStorage.getItem('pulsenews-lang')) || 'en'; } catch { return 'en'; }
    })();
    const { url } = buildTtsUrl(article, lang);
    // Determine the best source URL — prefer what's currently playing, then pre-gen, then fallback
    const src = (audioRef.current?.src) || url;
    if (!src) return;
    try {
      const res = await fetch(src, { mode: 'cors' });
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${article.slug}.mp3`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      // Delay cleanup so the browser has time to start the download
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch {
      // Fallback: open in new tab so the user can save manually
      window.open(src, '_blank');
    }
  }, [buildTtsUrl]);

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
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const expandPlayer = useCallback(() => setExpanded(true), []);
  const collapsePlayer = useCallback(() => setExpanded(false), []);

  // --- Register MediaSession action handlers ---
  useEffect(() => {
    if (!HAS_MEDIA_SESSION) return;
    try {
      navigator.mediaSession.setActionHandler('play', resume);
      navigator.mediaSession.setActionHandler('pause', pause);
      navigator.mediaSession.setActionHandler('seekbackward', () => skipBackward(15));
      navigator.mediaSession.setActionHandler('seekforward', () => skipForward(15));
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
      navigator.mediaSession.setActionHandler('stop', stop);
    } catch {}
  }, [resume, pause, skipBackward, skipForward, playNext, stop]);

  const value = {
    currentArticle,
    queue,
    playing,
    paused,
    loading,
    speed,
    progress,
    duration,
    currentTime,
    durationRaw,
    expanded,
    autoplay,
    sleepTimerRemaining,
    sleepAfterCurrent,
    toggleAutoplay,
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
    skipForward,
    skipBackward,
    expandPlayer,
    collapsePlayer,
    setSleepTimer,
    cancelSleepTimer,
    downloadAudio,
    formatTime,
    audioRef,
  };

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

export default function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}
