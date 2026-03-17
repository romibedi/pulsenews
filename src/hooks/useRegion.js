import { useState, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

// Map country codes to region keys
const COUNTRY_TO_REGION = {
  // South Asia
  IN: 'india', PK: 'india', BD: 'india', LK: 'india', NP: 'india',
  // UK & Ireland
  GB: 'uk', IE: 'uk',
  // US & Canada
  US: 'us', CA: 'us',
  // Australia & NZ
  AU: 'australia', NZ: 'australia',
  // Middle East
  AE: 'middle-east', SA: 'middle-east', QA: 'middle-east', KW: 'middle-east',
  BH: 'middle-east', OM: 'middle-east', IQ: 'middle-east', IR: 'middle-east',
  IL: 'middle-east', JO: 'middle-east', LB: 'middle-east', SY: 'middle-east',
  // Europe
  DE: 'europe', FR: 'europe', ES: 'europe', IT: 'europe', NL: 'europe',
  BE: 'europe', AT: 'europe', CH: 'europe', SE: 'europe', NO: 'europe',
  DK: 'europe', FI: 'europe', PL: 'europe', CZ: 'europe', PT: 'europe',
  GR: 'europe', RO: 'europe', HU: 'europe',
  // Africa
  NG: 'africa', ZA: 'africa', KE: 'africa', GH: 'africa', EG: 'africa',
  ET: 'africa', TZ: 'africa',
  // East Asia
  JP: 'asia', KR: 'asia', CN: 'asia', TW: 'asia', HK: 'asia', SG: 'asia',
  MY: 'asia', TH: 'asia', PH: 'asia', VN: 'asia', ID: 'asia',
  // Latin America
  BR: 'latam', MX: 'latam', AR: 'latam', CO: 'latam', CL: 'latam',
  PE: 'latam', VE: 'latam',
};

export const REGIONS = {
  india: { label: 'India', flag: '🇮🇳' },
  uk: { label: 'United Kingdom', flag: '🇬🇧' },
  us: { label: 'United States', flag: '🇺🇸' },
  australia: { label: 'Australia', flag: '🇦🇺' },
  'middle-east': { label: 'Middle East', flag: '🌍' },
  europe: { label: 'Europe', flag: '🇪🇺' },
  africa: { label: 'Africa', flag: '🌍' },
  asia: { label: 'Asia Pacific', flag: '🌏' },
  latam: { label: 'Latin America', flag: '🌎' },
};

export default function useRegion() {
  const [savedRegion, setSavedRegion] = useLocalStorage('pulsenews-region', null);
  const [detectedRegion, setDetectedRegion] = useState(null);
  const [loading, setLoading] = useState(!savedRegion);

  useEffect(() => {
    if (savedRegion) return;

    // Try to detect region from IP
    fetch('https://ipapi.co/json/')
      .then((r) => r.json())
      .then((data) => {
        const region = COUNTRY_TO_REGION[data.country_code] || 'world';
        setDetectedRegion(region);
      })
      .catch(() => {
        // Fallback: try navigator.language
        const lang = navigator.language || '';
        if (lang.includes('en-IN') || lang.includes('hi')) setDetectedRegion('india');
        else if (lang.includes('en-GB')) setDetectedRegion('uk');
        else if (lang.includes('en-US')) setDetectedRegion('us');
        else if (lang.includes('en-AU')) setDetectedRegion('australia');
        else if (lang.includes('ar')) setDetectedRegion('middle-east');
        else if (lang.includes('de') || lang.includes('fr') || lang.includes('es') || lang.includes('it')) setDetectedRegion('europe');
        else setDetectedRegion('world');
      })
      .finally(() => setLoading(false));
  }, [savedRegion]);

  const region = savedRegion || detectedRegion || 'world';

  return {
    region,
    regionInfo: REGIONS[region] || { label: 'World', flag: '🌐' },
    setRegion: setSavedRegion,
    loading,
    isAutoDetected: !savedRegion,
  };
}
