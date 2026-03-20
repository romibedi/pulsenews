import { useState, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { fetchGeoCity } from '../api/newsApi';

export default function useCity() {
  const [savedCity, setSavedCity] = useLocalStorage('pulsenews-city', null);
  const [detectedCity, setDetectedCity] = useState(null);
  const [loading, setLoading] = useState(!savedCity);

  useEffect(() => {
    if (savedCity) return;

    let cancelled = false;

    async function detect() {
      // Strategy 1: Browser geolocation → reverse geocode via our API
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 600000,
          });
        });
        const city = await fetchGeoCity(pos.coords.latitude, pos.coords.longitude);
        if (!cancelled && city) {
          setDetectedCity(city.key);
          setLoading(false);
          return;
        }
      } catch {
        // Geolocation denied or timed out — fall through
      }

      // Strategy 2: IP-based city detection via ipapi.co
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (!cancelled && data.city) {
          const citySlug = data.city
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z-]/g, '');
          // Check if it matches a known city via our API
          const geoCity = await fetchGeoCity(data.latitude, data.longitude);
          if (!cancelled && geoCity) {
            setDetectedCity(geoCity.key);
          }
        }
      } catch {
        // IP lookup failed
      }

      if (!cancelled) setLoading(false);
    }

    detect();
    return () => { cancelled = true; };
  }, [savedCity]);

  return {
    city: savedCity || detectedCity || null,
    setCity: setSavedCity,
    clearCity: () => setSavedCity(null),
    loading,
    isAutoDetected: !savedCity && !!detectedCity,
  };
}
