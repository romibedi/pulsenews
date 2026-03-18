import { useState } from 'react';
import { Link } from 'react-router-dom';
import useLanguage, { LANGUAGES, REGION_LANGUAGES } from '../hooks/useLanguage';
import useRegion, { REGIONS } from '../hooks/useRegion';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const { lang, setLang, langInfo } = useLanguage();
  const { region, regionInfo, setRegion, isAutoDetected } = useRegion();
  const { isDark, toggleTheme } = useTheme();
  const [showLangs, setShowLangs] = useState(false);
  const [showRegions, setShowRegions] = useState(false);

  const regionLangs = REGION_LANGUAGES[region] || ['en'];
  const otherLangs = Object.keys(LANGUAGES).filter((k) => !regionLangs.includes(k));

  return (
    <div className="max-w-lg mx-auto px-4 py-6 animate-fade-in">
      <h1 className="text-2xl font-normal text-[var(--text)] mb-6">Settings</h1>

      {/* Language */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">Language</h2>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <button
            onClick={() => { setShowLangs(!showLangs); setShowRegions(false); }}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{langInfo.flag}</span>
              <div>
                <p className="text-sm font-medium text-[var(--text)]">{langInfo.nativeLabel}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{langInfo.label}</p>
              </div>
            </div>
            <svg className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${showLangs ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {showLangs && (
            <div className="border-t border-[var(--border)] max-h-[50vh] overflow-y-auto">
              {regionLangs.length > 1 && (
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider px-4 pt-3 pb-1">
                  {regionInfo.label} languages
                </p>
              )}
              {regionLangs.map((key) => {
                const info = LANGUAGES[key];
                if (!info) return null;
                return (
                  <button
                    key={key}
                    onClick={() => { setLang(key); setShowLangs(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                      key === lang
                        ? 'bg-[#fef0ed] dark:bg-[#e87461]/10'
                        : 'hover:bg-[var(--bg)]'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-lg">{info.flag}</span>
                      <span className="text-sm text-[var(--text)]">{info.nativeLabel}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-[11px] text-[var(--text-muted)]">{info.label}</span>
                      {key === lang && (
                        <svg className="w-4 h-4 text-[#e05d44] dark:text-[#e87461]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}

              {otherLangs.length > 0 && (
                <>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider px-4 pt-3 pb-1">All languages</p>
                  {otherLangs.map((key) => {
                    const info = LANGUAGES[key];
                    if (!info) return null;
                    return (
                      <button
                        key={key}
                        onClick={() => { setLang(key); setShowLangs(false); }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                          key === lang
                            ? 'bg-[#fef0ed] dark:bg-[#e87461]/10'
                            : 'hover:bg-[var(--bg)]'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="text-lg">{info.flag}</span>
                          <span className="text-sm text-[var(--text)]">{info.nativeLabel}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="text-[11px] text-[var(--text-muted)]">{info.label}</span>
                          {key === lang && (
                            <svg className="w-4 h-4 text-[#e05d44] dark:text-[#e87461]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Region */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">Region</h2>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <button
            onClick={() => { setShowRegions(!showRegions); setShowLangs(false); }}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{regionInfo.flag}</span>
              <div>
                <p className="text-sm font-medium text-[var(--text)]">{regionInfo.label}</p>
                {isAutoDetected && <p className="text-[11px] text-[var(--text-muted)]">Auto-detected</p>}
              </div>
            </div>
            <svg className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${showRegions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {showRegions && (
            <div className="border-t border-[var(--border)] max-h-[50vh] overflow-y-auto">
              {Object.entries(REGIONS).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => { setRegion(key); setShowRegions(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                    key === region
                      ? 'bg-[#fef0ed] dark:bg-[#e87461]/10'
                      : 'hover:bg-[var(--bg)]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-lg">{info.flag}</span>
                    <span className="text-sm text-[var(--text)]">{info.label}</span>
                  </span>
                  {key === region && (
                    <svg className="w-4 h-4 text-[#e05d44] dark:text-[#e87461]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Appearance */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">Appearance</h2>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{isDark ? '🌙' : '☀️'}</span>
              <p className="text-sm font-medium text-[var(--text)]">Dark Mode</p>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors relative ${isDark ? 'bg-[#e05d44] dark:bg-[#e87461]' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isDark ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </div>
          </button>
        </div>
      </section>

      {/* Links */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">More</h2>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden divide-y divide-[var(--border)]">
          {[
            { to: '/feeds', label: 'Custom Feeds', icon: '📡' },
            { to: '/about', label: 'About PulseNewsToday', icon: 'ℹ️' },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center justify-between px-4 py-3.5 no-underline hover:bg-[var(--bg)] transition-colors"
            >
              <span className="flex items-center gap-3">
                <span className="text-xl">{link.icon}</span>
                <span className="text-sm font-medium text-[var(--text)]">{link.label}</span>
              </span>
              <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      <p className="text-center text-[11px] text-[var(--text-muted)] mt-8">
        Built by VeyricTech
      </p>
    </div>
  );
}
