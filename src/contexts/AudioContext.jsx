import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

const AudioCtx = createContext(null);

// Language to BCP-47 voice locale mapping
const LANG_VOICE_MAP = {
  en: 'en', hi: 'hi', ta: 'ta', te: 'te', bn: 'bn', mr: 'mr',
  ur: 'ur', ar: 'ar', fr: 'fr', de: 'de', es: 'es', pt: 'pt',
  zh: 'zh', ja: 'ja', ko: 'ko', sw: 'sw',
};

function pickVoice(lang) {
  const voices = speechSynthesis.getVoices();
  const locale = LANG_VOICE_MAP[lang] || lang;
  // Prefer voices matching the language, prioritize those with "Google", "Samantha", "Neural", or "Enhanced"
  const matching = voices.filter((v) => v.lang.startsWith(locale));
  const preferred = matching.find((v) => /google|neural|enhanced|samantha/i.test(v.name));
  return preferred || matching[0] || null;
}

export function AudioProvider({ children }) {
  const [currentArticle, setCurrentArticle] = useState(null);
  const [queue, setQueue] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState('');
  const utteranceRef = useRef(null);
  const progressRef = useRef(null);
  const startTimeRef = useRef(null);

  // Preload voices (some browsers load them async)
  useEffect(() => {
    speechSynthesis.getVoices();
    const handler = () => speechSynthesis.getVoices();
    speechSynthesis.addEventListener?.('voiceschanged', handler);
    return () => speechSynthesis.removeEventListener?.('voiceschanged', handler);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const clearProgress = useCallback(() => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    utteranceRef.current = null;
    clearProgress();
    setPlaying(false);
    setPaused(false);
    setLoading(false);
    setProgress(0);
    setDuration('');
    setCurrentArticle(null);
  }, [clearProgress]);

  const playNextRef = useRef(null);

  const playArticle = useCallback((article, langOverride) => {
    // Use provided lang, or read current language from localStorage
    const lang = langOverride || (() => {
      try { return JSON.parse(localStorage.getItem('pulsenews-lang')) || 'en'; } catch { return 'en'; }
    })();
    // Stop any current speech
    speechSynthesis.cancel();
    clearProgress();

    setCurrentArticle(article);
    setPlaying(true);
    setPaused(false);
    setLoading(true);
    setProgress(0);

    const body = (article.body || article.description || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const text = `${article.title}. ${body}`.slice(0, 2000);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed;
    utterance.pitch = 1;

    const voice = pickVoice(lang);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = LANG_VOICE_MAP[lang] || lang;
    }

    // Estimate duration based on ~150 words/min at rate 1
    const wordCount = text.split(/\s+/).length;
    const estSeconds = (wordCount / 150) * 60 / speed;

    utterance.onstart = () => {
      setLoading(false);
      setDuration(formatTime(estSeconds));
      startTimeRef.current = Date.now();
      // Update progress on interval since Web Speech API doesn't provide time updates
      progressRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const pct = Math.min((elapsed / estSeconds) * 100, 99);
        setProgress(pct);
      }, 200);
    };

    utterance.onend = () => {
      clearProgress();
      setPlaying(false);
      setPaused(false);
      setProgress(100);
      utteranceRef.current = null;
      if (playNextRef.current) setTimeout(playNextRef.current, 300);
    };

    utterance.onerror = (e) => {
      if (e.error === 'canceled') return;
      clearProgress();
      setPlaying(false);
      setPaused(false);
      setLoading(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [speed, clearProgress]);

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
    speechSynthesis.pause();
    clearProgress();
    setPaused(true);
  }, [clearProgress]);

  const resume = useCallback(() => {
    speechSynthesis.resume();
    // Restart progress timer from current position
    const estSeconds = parseFloat(duration?.split(':')[0] || 0) * 60 + parseFloat(duration?.split(':')[1] || 0);
    if (estSeconds > 0) {
      const currentPct = progress;
      const remainSecs = estSeconds * (1 - currentPct / 100);
      startTimeRef.current = Date.now() - (estSeconds - remainSecs) * 1000;
      progressRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const pct = Math.min((elapsed / estSeconds) * 100, 99);
        setProgress(pct);
      }, 200);
    }
    setPaused(false);
  }, [clearProgress, duration, progress]);

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
    // Web Speech API doesn't support changing rate mid-utterance,
    // but the next article will use the new rate
  }, []);

  const seekTo = useCallback(() => {
    // Web Speech API doesn't support seeking — no-op
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
