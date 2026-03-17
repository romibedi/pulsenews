import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

const AudioContext = createContext(null);

// Map language codes to BCP-47 voice language tags
const LANG_VOICE_MAP = {
  en: ['en-US', 'en-GB', 'en'],
  hi: ['hi-IN', 'hi'],
  ta: ['ta-IN', 'ta'],
  te: ['te-IN', 'te'],
  bn: ['bn-IN', 'bn'],
  mr: ['mr-IN', 'mr'],
};

function findVoice(langCode) {
  const voices = window.speechSynthesis?.getVoices() || [];
  const preferred = LANG_VOICE_MAP[langCode] || LANG_VOICE_MAP.en;
  for (const tag of preferred) {
    const voice = voices.find((v) => v.lang.startsWith(tag));
    if (voice) return voice;
  }
  // Fallback: any voice matching the base language
  const base = langCode.split('-')[0];
  const fallback = voices.find((v) => v.lang.startsWith(base));
  return fallback || null;
}

export function AudioProvider({ children }) {
  const [currentArticle, setCurrentArticle] = useState(null);
  const [queue, setQueue] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(0); // 0-100
  const [duration, setDuration] = useState('');
  const utterRef = useRef(null);
  const progressInterval = useRef(null);
  const startTime = useRef(0);
  const estimatedDuration = useRef(0);

  // Load voices (some browsers load async)
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }, []);

  const stopProgressTracking = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  }, []);

  const startProgressTracking = useCallback(() => {
    stopProgressTracking();
    startTime.current = Date.now();
    progressInterval.current = setInterval(() => {
      const elapsed = (Date.now() - startTime.current) / 1000;
      const est = estimatedDuration.current;
      if (est > 0) {
        setProgress(Math.min(100, (elapsed / est) * 100));
      }
    }, 500);
  }, [stopProgressTracking]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    stopProgressTracking();
    setPlaying(false);
    setPaused(false);
    setProgress(0);
    setCurrentArticle(null);
    utterRef.current = null;
  }, [stopProgressTracking]);

  const playNext = useCallback(() => {
    setQueue((prev) => {
      if (prev.length === 0) {
        stop();
        return prev;
      }
      const [next, ...rest] = prev;
      // Slight delay so state settles
      setTimeout(() => playArticle(next), 100);
      return rest;
    });
  }, []);

  const playArticle = useCallback((article, lang = 'en') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    stopProgressTracking();

    setCurrentArticle(article);
    setPlaying(true);
    setPaused(false);
    setProgress(0);

    const text = article.body || article.description || '';
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const fullText = `${article.title}. ${cleanText}`;

    // Estimate duration: ~150 words per minute at 1x speed
    const wordCount = fullText.split(/\s+/).length;
    const estSeconds = (wordCount / 150) * 60 / speed;
    estimatedDuration.current = estSeconds;
    const mins = Math.floor(estSeconds / 60);
    const secs = Math.floor(estSeconds % 60);
    setDuration(`${mins}:${secs.toString().padStart(2, '0')}`);

    const utter = new SpeechSynthesisUtterance(fullText);
    utter.rate = speed;
    utter.pitch = 1;

    // Pick language-appropriate voice
    const voice = findVoice(lang);
    if (voice) utter.voice = voice;

    utter.onend = () => {
      stopProgressTracking();
      setProgress(100);
      setPlaying(false);
      setPaused(false);
      // Play next in queue
      setTimeout(() => playNext(), 500);
    };

    utter.onerror = () => {
      stopProgressTracking();
      setPlaying(false);
      setPaused(false);
      setProgress(0);
    };

    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
    startProgressTracking();
  }, [speed, stopProgressTracking, startProgressTracking, playNext]);

  const pause = useCallback(() => {
    window.speechSynthesis?.pause();
    setPaused(true);
    stopProgressTracking();
  }, [stopProgressTracking]);

  const resume = useCallback(() => {
    window.speechSynthesis?.resume();
    setPaused(false);
    // Adjust start time for progress tracking
    startTime.current = Date.now() - (estimatedDuration.current * (progress / 100) * 1000);
    startProgressTracking();
  }, [progress, startProgressTracking]);

  const addToQueue = useCallback((article) => {
    setQueue((prev) => {
      // Don't add duplicates
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
    // If currently playing, restart with new speed
    if (playing && currentArticle) {
      const currentProgress = progress;
      window.speechSynthesis?.cancel();
      stopProgressTracking();

      const text = currentArticle.body || currentArticle.description || '';
      const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      const fullText = `${currentArticle.title}. ${cleanText}`;

      // Skip ahead proportionally
      const charIndex = Math.floor((currentProgress / 100) * fullText.length);
      const remaining = fullText.slice(charIndex);

      const wordCount = remaining.split(/\s+/).length;
      const estSeconds = (wordCount / 150) * 60 / newSpeed;
      estimatedDuration.current = estSeconds;

      const utter = new SpeechSynthesisUtterance(remaining);
      utter.rate = newSpeed;
      utter.pitch = 1;
      const voice = findVoice('en');
      if (voice) utter.voice = voice;
      utter.onend = () => {
        stopProgressTracking();
        setProgress(100);
        setPlaying(false);
        setPaused(false);
        setTimeout(() => playNext(), 500);
      };
      utter.onerror = () => {
        stopProgressTracking();
        setPlaying(false);
        setPaused(false);
      };
      utterRef.current = utter;
      window.speechSynthesis.speak(utter);
      startProgressTracking();
    }
  }, [playing, currentArticle, progress, stopProgressTracking, startProgressTracking, playNext]);

  const value = {
    currentArticle,
    queue,
    playing,
    paused,
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
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export default function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}
