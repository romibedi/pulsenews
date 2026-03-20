import { useState, useCallback } from 'react';

const STORAGE_KEY = 'pulsenews-autoplay';

function getStored() {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val === null ? true : val === 'true'; // default ON
  } catch {
    return true;
  }
}

export default function useAutoplay() {
  const [autoplay, setAutoplay] = useState(getStored);

  const toggleAutoplay = useCallback(() => {
    setAutoplay((prev) => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch {}
      return next;
    });
  }, []);

  return { autoplay, toggleAutoplay };
}
