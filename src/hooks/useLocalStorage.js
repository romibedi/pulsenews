import { useState, useEffect, useCallback } from 'react';

export default function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setAndPersist = useCallback((newValue) => {
    setValue((prev) => {
      const resolved = typeof newValue === 'function' ? newValue(prev) : newValue;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch { /* quota exceeded */ }
      // Notify other hooks in the same tab
      window.dispatchEvent(new CustomEvent('localstorage-sync', { detail: { key } }));
      return resolved;
    });
  }, [key]);

  // Sync across tabs (native storage event) + same-tab sync (custom event)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === key) {
        try {
          setValue(e.newValue ? JSON.parse(e.newValue) : defaultValue);
        } catch { /* ignore */ }
      }
    };
    const handleSync = (e) => {
      if (e.detail?.key === key) {
        try {
          const stored = localStorage.getItem(key);
          setValue(stored !== null ? JSON.parse(stored) : defaultValue);
        } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('localstorage-sync', handleSync);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('localstorage-sync', handleSync);
    };
  }, [key, defaultValue]);

  return [value, setAndPersist];
}
