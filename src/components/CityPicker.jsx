import { useState, useEffect } from 'react';
import { fetchCities } from '../api/newsApi';

const REGION_LABELS = {
  india: 'India',
  uk: 'United Kingdom',
  us: 'United States',
  australia: 'Australia',
};

export default function CityPicker({ currentCity, onSelect, onClose }) {
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCities().then((data) => setCities(data.cities || []));
  }, []);

  const filtered = search
    ? cities.filter((c) => c.label.toLowerCase().includes(search.toLowerCase()))
    : cities;

  const grouped = {};
  for (const c of filtered) {
    const region = c.region;
    if (!grouped[region]) grouped[region] = [];
    grouped[region].push(c);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium text-[var(--text)]">Choose your city</h2>
            <button onClick={onClose} className="p-1 text-[var(--text-muted)] hover:text-[var(--text)]">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search cities..."
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#e05d44] dark:focus:border-[#e87461]"
            autoFocus
          />
        </div>
        <div className="overflow-y-auto max-h-[60vh] p-2">
          {currentCity && (
            <button
              onClick={() => { onSelect(null); onClose(); }}
              className="w-full text-left px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--bg)] rounded-lg transition-colors mb-1"
            >
              Clear selection
            </button>
          )}
          {Object.entries(grouped).map(([region, regionCities]) => (
            <div key={region} className="mb-3">
              <p className="px-3 py-1 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                {REGION_LABELS[region] || region}
              </p>
              {regionCities.map((c) => (
                <button
                  key={c.key}
                  onClick={() => { onSelect(c.key); onClose(); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                    c.key === currentCity
                      ? 'bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461] font-medium'
                      : 'text-[var(--text)] hover:bg-[var(--bg)]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-[var(--text-muted)] py-8">No cities found</p>
          )}
        </div>
      </div>
    </div>
  );
}
