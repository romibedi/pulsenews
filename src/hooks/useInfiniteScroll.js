import { useEffect, useRef } from 'react';

export default function useInfiniteScroll(callback, enabled = true) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) callback();
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [callback, enabled]);

  return sentinelRef;
}
