import { Link } from 'react-router-dom';
import { useBookmarks } from '../contexts/BookmarkContext';
import useAudio from '../contexts/AudioContext';
import useLanguage from '../hooks/useLanguage';
import { estimateReadingTime } from '../utils/readingTime';

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Category-themed SVG placeholders — detailed illustrations for each category
// Each returns a full SVG string (without data URI prefix) at 400x267 aspect ratio

function buildWorldSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="267" viewBox="0 0 400 267">
<defs>
  <linearGradient id="wSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0f172a"/><stop offset="100%" stop-color="#1e3a5f"/></linearGradient>
  <radialGradient id="wGlobe" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0369a1"/></radialGradient>
  <radialGradient id="wGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3"/><stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/></radialGradient>
</defs>
<rect width="400" height="267" fill="url(#wSky)"/>
<!-- Glow behind globe -->
<circle cx="200" cy="133" r="110" fill="url(#wGlow)"/>
<!-- Globe body -->
<circle cx="200" cy="133" r="80" fill="url(#wGlobe)" opacity="0.9"/>
<!-- Continent shapes (simplified) -->
<path d="M175 85c5 3 15 2 20 8s2 15 8 18c4 2 12-2 18 1s8 12 5 18c-3 5-12 4-16 8s-3 14-8 17c-6 3-14-3-20-1s-10 10-17 8c-5-2-6-10-10-14s-14-4-16-10c-2-7 6-12 8-19s-4-14 0-20c4-5 13-3 18-7s5-12 10-7z" fill="#22c55e" opacity="0.7"/>
<path d="M225 110c4 2 8 8 14 8s12-5 16-1c4 5-2 12 0 18s10 10 9 17c-1 6-10 8-13 13s-2 14-7 17c-6 3-12-4-18-3s-12 8-18 5c-5-3-3-12-6-17s-12-8-11-14c1-7 10-9 14-15s3-15 8-18c4-2 8 5 12-10z" fill="#22c55e" opacity="0.6"/>
<path d="M165 145c3 1 8-2 12 0s6 8 10 10 12 0 15 4c2 4-2 9-1 14s8 9 7 14-8 7-11 11-3 12-7 14-10-3-14-2-7 8-12 8-8-6-12-8-12 2-14-2c-2-5 5-9 5-14s-6-10-4-14 9-5 11-9 3-12 7-14c3-1 5 5 8-12z" fill="#22c55e" opacity="0.5"/>
<!-- Globe grid lines -->
<ellipse cx="200" cy="133" rx="80" ry="80" fill="none" stroke="#e0f2fe" stroke-width="0.8" opacity="0.3"/>
<ellipse cx="200" cy="133" rx="50" ry="80" fill="none" stroke="#e0f2fe" stroke-width="0.6" opacity="0.25"/>
<ellipse cx="200" cy="133" rx="20" ry="80" fill="none" stroke="#e0f2fe" stroke-width="0.5" opacity="0.2"/>
<line x1="120" y1="133" x2="280" y2="133" stroke="#e0f2fe" stroke-width="0.6" opacity="0.25"/>
<ellipse cx="200" cy="105" rx="75" ry="12" fill="none" stroke="#e0f2fe" stroke-width="0.5" opacity="0.2" transform="rotate(0 200 105)"/>
<ellipse cx="200" cy="161" rx="75" ry="12" fill="none" stroke="#e0f2fe" stroke-width="0.5" opacity="0.2"/>
<!-- Globe highlight -->
<ellipse cx="175" cy="108" rx="25" ry="35" fill="white" opacity="0.08" transform="rotate(-20 175 108)"/>
<!-- Stars -->
<circle cx="50" cy="40" r="1.5" fill="white" opacity="0.6"/><circle cx="90" cy="70" r="1" fill="white" opacity="0.4"/>
<circle cx="320" cy="50" r="1.5" fill="white" opacity="0.5"/><circle cx="350" cy="90" r="1" fill="white" opacity="0.3"/>
<circle cx="60" cy="200" r="1" fill="white" opacity="0.4"/><circle cx="340" cy="190" r="1.2" fill="white" opacity="0.5"/>
<circle cx="45" cy="130" r="1" fill="white" opacity="0.3"/><circle cx="355" cy="140" r="1" fill="white" opacity="0.35"/>
<!-- Connection arcs -->
<path d="M150 100 Q130 60 100 70" fill="none" stroke="#38bdf8" stroke-width="1" opacity="0.3" stroke-dasharray="3 3"/>
<path d="M250 110 Q290 70 320 85" fill="none" stroke="#38bdf8" stroke-width="1" opacity="0.3" stroke-dasharray="3 3"/>
<path d="M230 180 Q280 210 310 195" fill="none" stroke="#38bdf8" stroke-width="1" opacity="0.25" stroke-dasharray="3 3"/>
<!-- Small dots at arc endpoints -->
<circle cx="100" cy="70" r="3" fill="#38bdf8" opacity="0.4"/><circle cx="320" cy="85" r="3" fill="#38bdf8" opacity="0.4"/>
<circle cx="310" cy="195" r="3" fill="#38bdf8" opacity="0.35"/>
<!-- Label -->
<text x="200" y="247" text-anchor="middle" fill="#7dd3fc" font-family="system-ui,sans-serif" font-size="11" font-weight="600" letter-spacing="3" opacity="0.6">WORLD</text>
</svg>`;
}

function buildTechnologySvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="267" viewBox="0 0 400 267">
<defs>
  <linearGradient id="tBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0f0b2e"/><stop offset="100%" stop-color="#1a1145"/></linearGradient>
  <linearGradient id="tScreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#312e81"/><stop offset="100%" stop-color="#1e1b4b"/></linearGradient>
  <linearGradient id="tAccent" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#818cf8"/><stop offset="100%" stop-color="#6366f1"/></linearGradient>
</defs>
<rect width="400" height="267" fill="url(#tBg)"/>
<!-- Grid pattern -->
<g stroke="#4338ca" stroke-width="0.3" opacity="0.15">
  <line x1="0" y1="40" x2="400" y2="40"/><line x1="0" y1="80" x2="400" y2="80"/><line x1="0" y1="120" x2="400" y2="120"/>
  <line x1="0" y1="160" x2="400" y2="160"/><line x1="0" y1="200" x2="400" y2="200"/><line x1="0" y1="240" x2="400" y2="240"/>
  <line x1="40" y1="0" x2="40" y2="267"/><line x1="80" y1="0" x2="80" y2="267"/><line x1="120" y1="0" x2="120" y2="267"/>
  <line x1="160" y1="0" x2="160" y2="267"/><line x1="200" y1="0" x2="200" y2="267"/><line x1="240" y1="0" x2="240" y2="267"/>
  <line x1="280" y1="0" x2="280" y2="267"/><line x1="320" y1="0" x2="320" y2="267"/><line x1="360" y1="0" x2="360" y2="267"/>
</g>
<!-- Laptop body -->
<rect x="115" y="60" rx="8" ry="8" width="170" height="115" fill="#1e1b4b" stroke="#4338ca" stroke-width="1.5"/>
<!-- Screen -->
<rect x="125" y="68" rx="3" ry="3" width="150" height="90" fill="url(#tScreen)"/>
<!-- Code lines on screen -->
<g opacity="0.8">
  <rect x="135" y="78" width="40" height="4" rx="2" fill="#818cf8" opacity="0.7"/>
  <rect x="180" y="78" width="25" height="4" rx="2" fill="#c084fc" opacity="0.5"/>
  <rect x="145" y="87" width="55" height="4" rx="2" fill="#34d399" opacity="0.6"/>
  <rect x="205" y="87" width="20" height="4" rx="2" fill="#fbbf24" opacity="0.5"/>
  <rect x="140" y="96" width="30" height="4" rx="2" fill="#818cf8" opacity="0.5"/>
  <rect x="175" y="96" width="45" height="4" rx="2" fill="#f472b6" opacity="0.5"/>
  <rect x="145" y="105" width="60" height="4" rx="2" fill="#34d399" opacity="0.4"/>
  <rect x="135" y="114" width="35" height="4" rx="2" fill="#818cf8" opacity="0.6"/>
  <rect x="175" y="114" width="40" height="4" rx="2" fill="#fbbf24" opacity="0.4"/>
  <rect x="140" y="123" width="50" height="4" rx="2" fill="#c084fc" opacity="0.5"/>
  <rect x="135" y="132" width="25" height="4" rx="2" fill="#818cf8" opacity="0.5"/>
  <rect x="165" y="132" width="35" height="4" rx="2" fill="#34d399" opacity="0.4"/>
  <!-- Cursor blink -->
  <rect x="205" y="132" width="2" height="5" fill="#818cf8" opacity="0.9"/>
</g>
<!-- Laptop base -->
<path d="M100 175 L115 175 L115 180 Q115 183 118 183 L282 183 Q285 183 285 180 L285 175 L300 175 Q305 175 303 180 L295 195 Q293 198 288 198 L112 198 Q107 198 105 195 L97 180 Q95 175 100 175z" fill="#1e1b4b" stroke="#4338ca" stroke-width="1"/>
<!-- Trackpad -->
<rect x="180" y="179" rx="2" ry="2" width="40" height="15" fill="none" stroke="#4338ca" stroke-width="0.8" opacity="0.5"/>
<!-- Circuit traces from laptop -->
<g stroke="#818cf8" stroke-width="1" opacity="0.3" fill="none">
  <path d="M130 140 L80 140 L80 100 L50 100"/><circle cx="50" cy="100" r="3" fill="#818cf8" opacity="0.4"/>
  <path d="M270 100 L320 100 L320 70 L350 70"/><circle cx="350" cy="70" r="3" fill="#818cf8" opacity="0.4"/>
  <path d="M130 120 L60 120 L60 180 L40 180"/><circle cx="40" cy="180" r="3" fill="#818cf8" opacity="0.4"/>
  <path d="M270 130 L340 130 L340 200 L370 200"/><circle cx="370" cy="200" r="3" fill="#818cf8" opacity="0.4"/>
</g>
<!-- Floating data nodes -->
<g opacity="0.4">
  <rect x="30" y="40" width="35" height="20" rx="4" fill="none" stroke="#818cf8" stroke-width="0.8"/>
  <rect x="35" y="46" width="15" height="2" rx="1" fill="#818cf8"/><rect x="35" y="51" width="22" height="2" rx="1" fill="#818cf8" opacity="0.6"/>
  <rect x="335" y="150" width="35" height="20" rx="4" fill="none" stroke="#818cf8" stroke-width="0.8"/>
  <rect x="340" y="156" width="20" height="2" rx="1" fill="#818cf8"/><rect x="340" y="161" width="15" height="2" rx="1" fill="#818cf8" opacity="0.6"/>
</g>
<!-- Floating binary -->
<text x="55" y="230" fill="#818cf8" font-family="monospace" font-size="8" opacity="0.2">01101001</text>
<text x="300" y="40" fill="#818cf8" font-family="monospace" font-size="8" opacity="0.2">10110100</text>
<!-- Label -->
<text x="200" y="247" text-anchor="middle" fill="#a5b4fc" font-family="system-ui,sans-serif" font-size="11" font-weight="600" letter-spacing="3" opacity="0.6">TECHNOLOGY</text>
</svg>`;
}

function buildBusinessSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="267" viewBox="0 0 400 267">
<defs>
  <linearGradient id="bBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1c1917"/><stop offset="100%" stop-color="#292524"/></linearGradient>
  <linearGradient id="bBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#d97706"/></linearGradient>
  <linearGradient id="bLine" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient>
</defs>
<rect width="400" height="267" fill="url(#bBg)"/>
<!-- Subtle grid -->
<g stroke="#44403c" stroke-width="0.3" opacity="0.3">
  <line x1="80" y1="50" x2="80" y2="210"/><line x1="140" y1="50" x2="140" y2="210"/><line x1="200" y1="50" x2="200" y2="210"/>
  <line x1="260" y1="50" x2="260" y2="210"/><line x1="320" y1="50" x2="320" y2="210"/>
  <line x1="60" y1="70" x2="340" y2="70"/><line x1="60" y1="110" x2="340" y2="110"/>
  <line x1="60" y1="150" x2="340" y2="150"/><line x1="60" y1="190" x2="340" y2="190"/>
</g>
<!-- Axis -->
<line x1="60" y1="210" x2="345" y2="210" stroke="#78716c" stroke-width="1" opacity="0.5"/>
<line x1="60" y1="50" x2="60" y2="210" stroke="#78716c" stroke-width="1" opacity="0.5"/>
<!-- Y-axis labels -->
<text x="50" y="213" text-anchor="end" fill="#a8a29e" font-family="system-ui,sans-serif" font-size="8" opacity="0.5">0</text>
<text x="50" y="153" text-anchor="end" fill="#a8a29e" font-family="system-ui,sans-serif" font-size="8" opacity="0.5">50</text>
<text x="50" y="93" text-anchor="end" fill="#a8a29e" font-family="system-ui,sans-serif" font-size="8" opacity="0.5">100</text>
<!-- Bar chart -->
<rect x="75" y="170" width="22" height="40" rx="2" fill="url(#bBar)" opacity="0.6"/>
<rect x="107" y="145" width="22" height="65" rx="2" fill="url(#bBar)" opacity="0.65"/>
<rect x="139" y="155" width="22" height="55" rx="2" fill="url(#bBar)" opacity="0.7"/>
<rect x="171" y="120" width="22" height="90" rx="2" fill="url(#bBar)" opacity="0.75"/>
<rect x="203" y="130" width="22" height="80" rx="2" fill="url(#bBar)" opacity="0.8"/>
<rect x="235" y="100" width="22" height="110" rx="2" fill="url(#bBar)" opacity="0.85"/>
<rect x="267" y="110" width="22" height="100" rx="2" fill="url(#bBar)" opacity="0.9"/>
<rect x="299" y="75" width="22" height="135" rx="2" fill="url(#bBar)" opacity="0.95"/>
<!-- Trend line -->
<polyline points="86,162 118,138 150,148 182,112 214,122 246,92 278,102 310,68" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
<!-- Trend line dots -->
<circle cx="86" cy="162" r="3" fill="#fbbf24" opacity="0.8"/><circle cx="118" cy="138" r="3" fill="#fbbf24" opacity="0.8"/>
<circle cx="150" cy="148" r="3" fill="#fbbf24" opacity="0.8"/><circle cx="182" cy="112" r="3" fill="#fbbf24" opacity="0.8"/>
<circle cx="214" cy="122" r="3" fill="#fbbf24" opacity="0.8"/><circle cx="246" cy="92" r="3" fill="#fbbf24" opacity="0.8"/>
<circle cx="278" cy="102" r="3" fill="#fbbf24" opacity="0.8"/><circle cx="310" cy="68" r="3" fill="#fbbf24" opacity="0.9"/>
<!-- Arrow up indicator -->
<g transform="translate(340, 60)" opacity="0.6">
  <polygon points="0,15 8,0 16,15" fill="#22c55e" opacity="0.8"/>
  <text x="8" y="25" text-anchor="middle" fill="#22c55e" font-family="system-ui,sans-serif" font-size="9" font-weight="700">+24%</text>
</g>
<!-- Dollar signs -->
<text x="30" y="80" fill="#fbbf24" font-family="system-ui,sans-serif" font-size="20" opacity="0.08">$</text>
<text x="365" y="180" fill="#fbbf24" font-family="system-ui,sans-serif" font-size="16" opacity="0.08">$</text>
<!-- Label -->
<text x="200" y="247" text-anchor="middle" fill="#fbbf24" font-family="system-ui,sans-serif" font-size="11" font-weight="600" letter-spacing="3" opacity="0.6">BUSINESS</text>
</svg>`;
}

function buildSportSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="267" viewBox="0 0 400 267">
<defs>
  <linearGradient id="sBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#052e16"/><stop offset="100%" stop-color="#14532d"/></linearGradient>
  <radialGradient id="sBall" cx="40%" cy="35%" r="60%"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#d1d5db"/></radialGradient>
  <radialGradient id="sGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#22c55e" stop-opacity="0.2"/><stop offset="100%" stop-color="#22c55e" stop-opacity="0"/></radialGradient>
</defs>
<rect width="400" height="267" fill="url(#sBg)"/>
<!-- Field lines -->
<rect x="30" y="25" width="340" height="217" rx="4" fill="none" stroke="#22c55e" stroke-width="1" opacity="0.2"/>
<line x1="200" y1="25" x2="200" y2="242" stroke="#22c55e" stroke-width="1" opacity="0.2"/>
<circle cx="200" cy="133" r="45" fill="none" stroke="#22c55e" stroke-width="1" opacity="0.2"/>
<circle cx="200" cy="133" r="3" fill="#22c55e" opacity="0.3"/>
<!-- Penalty areas -->
<rect x="30" y="73" width="60" height="120" fill="none" stroke="#22c55e" stroke-width="0.8" opacity="0.15"/>
<rect x="310" y="73" width="60" height="120" fill="none" stroke="#22c55e" stroke-width="0.8" opacity="0.15"/>
<!-- Goal areas -->
<rect x="30" y="98" width="25" height="70" fill="none" stroke="#22c55e" stroke-width="0.6" opacity="0.12"/>
<rect x="345" y="98" width="25" height="70" fill="none" stroke="#22c55e" stroke-width="0.6" opacity="0.12"/>
<!-- Spotlight glow -->
<circle cx="200" cy="133" r="80" fill="url(#sGlow)"/>
<!-- Soccer ball (large, center) -->
<g transform="translate(200,125)">
  <circle cx="0" cy="0" r="35" fill="url(#sBall)" stroke="#9ca3af" stroke-width="0.5"/>
  <!-- Pentagon patches -->
  <polygon points="0,-14 -13,-5 -8,12 8,12 13,-5" fill="#374151" opacity="0.8"/>
  <polygon points="0,-35 -8,-22 8,-22" fill="#374151" opacity="0.6"/>
  <polygon points="-33,-11 -22,-5 -18,-18 -26,-26" fill="#374151" opacity="0.5"/>
  <polygon points="33,-11 22,-5 18,-18 26,-26" fill="#374151" opacity="0.5"/>
  <polygon points="-20,28 -10,22 -14,14 -26,14 -30,22" fill="#374151" opacity="0.5"/>
  <polygon points="20,28 10,22 14,14 26,14 30,22" fill="#374151" opacity="0.5"/>
  <!-- Highlight -->
  <ellipse cx="-10" cy="-12" rx="8" ry="6" fill="white" opacity="0.3" transform="rotate(-30)"/>
</g>
<!-- Motion lines -->
<g stroke="#86efac" stroke-width="1" opacity="0.3" stroke-linecap="round">
  <line x1="130" y1="120" x2="145" y2="118"/>
  <line x1="128" y1="128" x2="148" y2="125"/>
  <line x1="132" y1="136" x2="147" y2="133"/>
</g>
<!-- Secondary sports items (smaller, background) -->
<!-- Basketball -->
<g transform="translate(80, 60)" opacity="0.25">
  <circle cx="0" cy="0" r="16" fill="none" stroke="#fb923c" stroke-width="1.5"/>
  <path d="M-16 0 Q0-10 16 0" fill="none" stroke="#fb923c" stroke-width="1"/>
  <path d="M-16 0 Q0 10 16 0" fill="none" stroke="#fb923c" stroke-width="1"/>
  <line x1="0" y1="-16" x2="0" y2="16" stroke="#fb923c" stroke-width="1"/>
</g>
<!-- Tennis ball -->
<g transform="translate(320, 195)" opacity="0.25">
  <circle cx="0" cy="0" r="14" fill="none" stroke="#a3e635" stroke-width="1.5"/>
  <path d="M-10,-10 Q0,0 -10,10" fill="none" stroke="#a3e635" stroke-width="1"/>
  <path d="M10,-10 Q0,0 10,10" fill="none" stroke="#a3e635" stroke-width="1"/>
</g>
<!-- Trophy silhouette -->
<g transform="translate(325, 50)" opacity="0.15">
  <path d="M-12,-15 L12,-15 L10,0 Q8,10 0,15 Q-8,10 -10,0 z" fill="#fbbf24" stroke="none"/>
  <rect x="-4" y="15" width="8" height="6" fill="#fbbf24"/>
  <rect x="-8" y="21" width="16" height="3" rx="1" fill="#fbbf24"/>
</g>
<!-- Scoreboard -->
<g transform="translate(55, 200)" opacity="0.3">
  <rect x="0" y="0" width="50" height="22" rx="3" fill="#000" opacity="0.4" stroke="#22c55e" stroke-width="0.5"/>
  <text x="12" y="15" fill="#22c55e" font-family="monospace" font-size="11" font-weight="700">2</text>
  <text x="25" y="15" fill="#6b7280" font-family="monospace" font-size="9">:</text>
  <text x="36" y="15" fill="#22c55e" font-family="monospace" font-size="11" font-weight="700">1</text>
</g>
<!-- Label -->
<text x="200" y="255" text-anchor="middle" fill="#86efac" font-family="system-ui,sans-serif" font-size="11" font-weight="600" letter-spacing="3" opacity="0.6">SPORT</text>
</svg>`;
}

function buildScienceSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="267" viewBox="0 0 400 267">
<defs>
  <linearGradient id="scBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1a0a2e"/><stop offset="100%" stop-color="#2d1b69"/></linearGradient>
  <radialGradient id="scGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#a855f7" stop-opacity="0.15"/><stop offset="100%" stop-color="#a855f7" stop-opacity="0"/></radialGradient>
</defs>
<rect width="400" height="267" fill="url(#scBg)"/>
<!-- Background glow -->
<circle cx="200" cy="133" r="120" fill="url(#scGlow)"/>
<!-- Atom model (large, central) -->
<!-- Nucleus -->
<circle cx="200" cy="125" r="12" fill="#c084fc" opacity="0.8"/>
<circle cx="200" cy="125" r="8" fill="#e9d5ff" opacity="0.4"/>
<circle cx="196" cy="122" r="5" fill="#a855f7" opacity="0.6"/>
<circle cx="204" cy="128" r="4" fill="#7c3aed" opacity="0.5"/>
<!-- Electron orbits -->
<ellipse cx="200" cy="125" rx="80" ry="30" fill="none" stroke="#c084fc" stroke-width="1" opacity="0.35" transform="rotate(-30 200 125)"/>
<ellipse cx="200" cy="125" rx="80" ry="30" fill="none" stroke="#c084fc" stroke-width="1" opacity="0.35" transform="rotate(30 200 125)"/>
<ellipse cx="200" cy="125" rx="80" ry="30" fill="none" stroke="#c084fc" stroke-width="1" opacity="0.35"/>
<!-- Electrons -->
<circle cx="268" cy="100" r="4" fill="#e9d5ff" opacity="0.9"/><circle cx="268" cy="100" r="6" fill="#c084fc" opacity="0.2"/>
<circle cx="145" cy="152" r="4" fill="#e9d5ff" opacity="0.9"/><circle cx="145" cy="152" r="6" fill="#c084fc" opacity="0.2"/>
<circle cx="235" cy="80" r="4" fill="#e9d5ff" opacity="0.9"/><circle cx="235" cy="80" r="6" fill="#c084fc" opacity="0.2"/>
<!-- Flask (left side) -->
<g transform="translate(55, 80)" opacity="0.3">
  <path d="M-8,-30 L-8,-5 L-25,30 Q-28,38 -20,40 L20,40 Q28,38 25,30 L8,-5 L8,-30 z" fill="none" stroke="#c084fc" stroke-width="1.5"/>
  <rect x="-10" y="-35" width="20" height="6" rx="2" fill="none" stroke="#c084fc" stroke-width="1.2"/>
  <!-- Liquid -->
  <path d="M-20,25 L-25,30 Q-28,38 -20,40 L20,40 Q28,38 25,30 L20,25 z" fill="#a855f7" opacity="0.3"/>
  <!-- Bubbles -->
  <circle cx="-5" cy="20" r="2" fill="#e9d5ff" opacity="0.4"/><circle cx="5" cy="28" r="1.5" fill="#e9d5ff" opacity="0.3"/>
  <circle cx="-2" cy="32" r="2.5" fill="#e9d5ff" opacity="0.3"/>
</g>
<!-- DNA helix (right side) -->
<g transform="translate(340, 50)" opacity="0.25">
  <path d="M-10,0 Q5,10 -10,20 Q-25,30 -10,40 Q5,50 -10,60 Q-25,70 -10,80 Q5,90 -10,100 Q-25,110 -10,120" fill="none" stroke="#c084fc" stroke-width="1.5"/>
  <path d="M10,0 Q-5,10 10,20 Q25,30 10,40 Q-5,50 10,60 Q25,70 10,80 Q-5,90 10,100 Q25,110 10,120" fill="none" stroke="#a855f7" stroke-width="1.5"/>
  <!-- Rungs -->
  <line x1="-6" y1="10" x2="6" y2="10" stroke="#e9d5ff" stroke-width="0.8" opacity="0.5"/>
  <line x1="-10" y1="20" x2="10" y2="20" stroke="#e9d5ff" stroke-width="0.8" opacity="0.5"/>
  <line x1="-6" y1="30" x2="6" y2="30" stroke="#e9d5ff" stroke-width="0.8" opacity="0.5"/>
  <line x1="-10" y1="40" x2="10" y2="40" stroke="#e9d5ff" stroke-width="0.8" opacity="0.5"/>
  <line x1="-6" y1="50" x2="6" y2="50" stroke="#e9d5ff" stroke-width="0.8" opacity="0.5"/>
  <line x1="-10" y1="60" x2="10" y2="60" stroke="#e9d5ff" stroke-width="0.8" opacity="0.5"/>
  <line x1="-6" y1="70" x2="6" y2="70" stroke="#e9d5ff" stroke-width="0.8" opacity="0.5"/>
  <line x1="-10" y1="80" x2="10" y2="80" stroke="#e9d5ff" stroke-width="0.8" opacity="0.5"/>
  <line x1="-6" y1="90" x2="6" y2="90" stroke="#e9d5ff" stroke-width="0.8" opacity="0.5"/>
  <line x1="-10" y1="100" x2="10" y2="100" stroke="#e9d5ff" stroke-width="0.8" opacity="0.5"/>
</g>
<!-- Molecular structures (floating) -->
<g opacity="0.2">
  <circle cx="70" cy="200" r="5" fill="none" stroke="#c084fc" stroke-width="1"/><circle cx="90" cy="210" r="5" fill="none" stroke="#c084fc" stroke-width="1"/>
  <line x1="75" y1="203" x2="85" y2="207" stroke="#c084fc" stroke-width="1"/>
  <circle cx="95" cy="192" r="4" fill="none" stroke="#a855f7" stroke-width="1"/>
  <line x1="92" y1="206" x2="94" y2="196" stroke="#a855f7" stroke-width="1"/>
</g>
<!-- Formulas -->
<text x="60" y="45" fill="#c084fc" font-family="serif" font-size="10" font-style="italic" opacity="0.15">E = mc²</text>
<text x="290" y="240" fill="#c084fc" font-family="serif" font-size="9" font-style="italic" opacity="0.15">H₂O</text>
<!-- Label -->
<text x="200" y="247" text-anchor="middle" fill="#d8b4fe" font-family="system-ui,sans-serif" font-size="11" font-weight="600" letter-spacing="3" opacity="0.6">SCIENCE</text>
</svg>`;
}

function buildCultureSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="267" viewBox="0 0 400 267">
<defs>
  <linearGradient id="cBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2d1810"/><stop offset="100%" stop-color="#451a03"/></linearGradient>
  <linearGradient id="cAccent" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fb923c"/><stop offset="100%" stop-color="#ea580c"/></linearGradient>
</defs>
<rect width="400" height="267" fill="url(#cBg)"/>
<!-- Decorative pattern border -->
<g opacity="0.08">
  <path d="M0 0 Q10 10 20 0 Q30 10 40 0 Q50 10 60 0 Q70 10 80 0 Q90 10 100 0 Q110 10 120 0 Q130 10 140 0 Q150 10 160 0 Q170 10 180 0 Q190 10 200 0 Q210 10 220 0 Q230 10 240 0 Q250 10 260 0 Q270 10 280 0 Q290 10 300 0 Q310 10 320 0 Q330 10 340 0 Q350 10 360 0 Q370 10 380 0 Q390 10 400 0" fill="none" stroke="#fb923c" stroke-width="2"/>
</g>
<!-- Musical note (left) -->
<g transform="translate(85, 100)" opacity="0.5">
  <ellipse cx="0" cy="50" rx="12" ry="9" fill="#fb923c" transform="rotate(-15 0 50)"/>
  <line x1="11" y1="47" x2="11" y2="-10" stroke="#fb923c" stroke-width="2.5"/>
  <path d="M11,-10 Q25,-15 25,-5 Q25,5 11,2" fill="#fb923c" opacity="0.7"/>
  <!-- Second note connected -->
  <ellipse cx="40" cy="42" rx="12" ry="9" fill="#fb923c" transform="rotate(-15 40 42)"/>
  <line x1="51" y1="39" x2="51" y2="-10" stroke="#fb923c" stroke-width="2.5"/>
  <line x1="11" y1="-10" x2="51" y2="-10" stroke="#fb923c" stroke-width="3"/>
</g>
<!-- Paint palette (center-right) -->
<g transform="translate(260, 90)" opacity="0.45">
  <ellipse cx="0" cy="30" rx="50" ry="40" fill="#7c2d12" stroke="#fb923c" stroke-width="1.2"/>
  <!-- Thumb hole -->
  <ellipse cx="-25" cy="45" rx="10" ry="8" fill="url(#cBg)"/>
  <!-- Paint blobs -->
  <circle cx="-15" cy="10" r="7" fill="#ef4444" opacity="0.8"/>
  <circle cx="5" cy="5" r="7" fill="#3b82f6" opacity="0.8"/>
  <circle cx="25" cy="12" r="7" fill="#eab308" opacity="0.8"/>
  <circle cx="30" cy="32" r="6" fill="#22c55e" opacity="0.8"/>
  <circle cx="15" cy="48" r="6" fill="#a855f7" opacity="0.8"/>
  <circle cx="-5" cy="50" r="5" fill="#f97316" opacity="0.8"/>
  <!-- Mixed colors -->
  <circle cx="15" cy="25" r="4" fill="#8b5cf6" opacity="0.5"/>
</g>
<!-- Paintbrush -->
<g transform="translate(310, 55) rotate(35)" opacity="0.35">
  <rect x="-2" y="0" width="4" height="60" rx="2" fill="#a16207"/>
  <path d="M-4,60 Q-5,75 0,80 Q5,75 4,60" fill="#78350f"/>
  <rect x="-3" y="57" width="6" height="5" fill="#9ca3af"/>
</g>
<!-- Theater masks (subtle, bottom left) -->
<g transform="translate(65, 195)" opacity="0.2">
  <!-- Happy mask -->
  <ellipse cx="-15" cy="0" rx="18" ry="22" fill="none" stroke="#fb923c" stroke-width="1.5"/>
  <circle cx="-21" cy="-5" r="3" fill="none" stroke="#fb923c" stroke-width="1"/>
  <circle cx="-9" cy="-5" r="3" fill="none" stroke="#fb923c" stroke-width="1"/>
  <path d="M-23 7 Q-15 16 -7 7" fill="none" stroke="#fb923c" stroke-width="1.2"/>
  <!-- Sad mask -->
  <ellipse cx="15" cy="0" rx="18" ry="22" fill="none" stroke="#fb923c" stroke-width="1.5"/>
  <circle cx="9" cy="-5" r="3" fill="none" stroke="#fb923c" stroke-width="1"/>
  <circle cx="21" cy="-5" r="3" fill="none" stroke="#fb923c" stroke-width="1"/>
  <path d="M7 12 Q15 4 23 12" fill="none" stroke="#fb923c" stroke-width="1.2"/>
</g>
<!-- Film strip (top right corner) -->
<g transform="translate(340, 20)" opacity="0.15">
  <rect x="0" y="0" width="30" height="80" rx="2" fill="none" stroke="#fb923c" stroke-width="1.2"/>
  <rect x="2" y="3" width="5" height="4" rx="1" fill="#fb923c"/><rect x="23" y="3" width="5" height="4" rx="1" fill="#fb923c"/>
  <rect x="2" y="13" width="5" height="4" rx="1" fill="#fb923c"/><rect x="23" y="13" width="5" height="4" rx="1" fill="#fb923c"/>
  <rect x="2" y="23" width="5" height="4" rx="1" fill="#fb923c"/><rect x="23" y="23" width="5" height="4" rx="1" fill="#fb923c"/>
  <rect x="2" y="33" width="5" height="4" rx="1" fill="#fb923c"/><rect x="23" y="33" width="5" height="4" rx="1" fill="#fb923c"/>
  <rect x="2" y="43" width="5" height="4" rx="1" fill="#fb923c"/><rect x="23" y="43" width="5" height="4" rx="1" fill="#fb923c"/>
  <rect x="9" y="5" width="12" height="10" fill="none" stroke="#fb923c" stroke-width="0.6"/>
  <rect x="9" y="20" width="12" height="10" fill="none" stroke="#fb923c" stroke-width="0.6"/>
  <rect x="9" y="35" width="12" height="10" fill="none" stroke="#fb923c" stroke-width="0.6"/>
</g>
<!-- Sound waves -->
<g transform="translate(150, 150)" opacity="0.15">
  <path d="M0,0 Q5,-10 0,-20" fill="none" stroke="#fb923c" stroke-width="1.2"/>
  <path d="M5,5 Q12,-10 5,-25" fill="none" stroke="#fb923c" stroke-width="1"/>
  <path d="M10,8 Q20,-10 10,-28" fill="none" stroke="#fb923c" stroke-width="0.8"/>
</g>
<!-- Label -->
<text x="200" y="252" text-anchor="middle" fill="#fdba74" font-family="system-ui,sans-serif" font-size="11" font-weight="600" letter-spacing="3" opacity="0.6">CULTURE</text>
</svg>`;
}

function buildEnvironmentSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="267" viewBox="0 0 400 267">
<defs>
  <linearGradient id="eSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#064e3b"/><stop offset="60%" stop-color="#065f46"/><stop offset="100%" stop-color="#022c22"/></linearGradient>
  <radialGradient id="eSun" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fbbf24" stop-opacity="0.6"/><stop offset="60%" stop-color="#f59e0b" stop-opacity="0.2"/><stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/></radialGradient>
  <linearGradient id="eTree" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#22c55e"/><stop offset="100%" stop-color="#15803d"/></linearGradient>
</defs>
<rect width="400" height="267" fill="url(#eSky)"/>
<!-- Sun glow -->
<circle cx="320" cy="50" r="70" fill="url(#eSun)"/>
<circle cx="320" cy="50" r="22" fill="#fbbf24" opacity="0.5"/>
<circle cx="320" cy="50" r="16" fill="#fde68a" opacity="0.3"/>
<!-- Sun rays -->
<g stroke="#fbbf24" stroke-width="1" opacity="0.15" stroke-linecap="round">
  <line x1="320" y1="18" x2="320" y2="8"/><line x1="320" y1="82" x2="320" y2="92"/>
  <line x1="288" y1="50" x2="278" y2="50"/><line x1="352" y1="50" x2="362" y2="50"/>
  <line x1="297" y1="27" x2="290" y2="20"/><line x1="343" y1="27" x2="350" y2="20"/>
  <line x1="297" y1="73" x2="290" y2="80"/><line x1="343" y1="73" x2="350" y2="80"/>
</g>
<!-- Mountains (background) -->
<polygon points="0,200 60,100 120,170 180,80 260,160 330,90 400,180 400,267 0,267" fill="#064e3b" opacity="0.5"/>
<polygon points="0,220 80,140 150,190 220,120 300,170 370,110 400,160 400,267 0,267" fill="#065f46" opacity="0.6"/>
<!-- Ground -->
<path d="M0 210 Q100 195 200 205 Q300 215 400 200 L400 267 L0 267 z" fill="#052e16" opacity="0.8"/>
<!-- Large tree (center-left) -->
<g transform="translate(150, 120)">
  <!-- Trunk -->
  <rect x="-6" y="50" width="12" height="50" fill="#713f12" opacity="0.7"/>
  <path d="M-6 95 Q-15 100 -18 100 L-6 90z" fill="#713f12" opacity="0.5"/>
  <path d="M6 95 Q15 100 18 100 L6 90z" fill="#713f12" opacity="0.5"/>
  <!-- Foliage layers -->
  <ellipse cx="0" cy="20" rx="40" ry="35" fill="url(#eTree)" opacity="0.7"/>
  <ellipse cx="-15" cy="35" rx="30" ry="25" fill="#16a34a" opacity="0.6"/>
  <ellipse cx="15" cy="30" rx="28" ry="28" fill="#15803d" opacity="0.5"/>
  <ellipse cx="0" cy="5" rx="25" ry="22" fill="#4ade80" opacity="0.4"/>
</g>
<!-- Medium tree (right) -->
<g transform="translate(280, 140)">
  <rect x="-4" y="35" width="8" height="40" fill="#713f12" opacity="0.6"/>
  <ellipse cx="0" cy="15" rx="28" ry="28" fill="url(#eTree)" opacity="0.6"/>
  <ellipse cx="-10" cy="25" rx="22" ry="20" fill="#16a34a" opacity="0.5"/>
  <ellipse cx="8" cy="5" rx="18" ry="16" fill="#4ade80" opacity="0.35"/>
</g>
<!-- Small tree (far left) -->
<g transform="translate(50, 160)">
  <rect x="-3" y="25" width="6" height="30" fill="#713f12" opacity="0.5"/>
  <ellipse cx="0" cy="10" rx="20" ry="22" fill="#15803d" opacity="0.5"/>
  <ellipse cx="0" cy="0" rx="14" ry="14" fill="#22c55e" opacity="0.4"/>
</g>
<!-- Small pine (far right) -->
<g transform="translate(360, 155)">
  <rect x="-2" y="30" width="4" height="25" fill="#713f12" opacity="0.5"/>
  <polygon points="0,-5 -15,15 15,15" fill="#15803d" opacity="0.5"/>
  <polygon points="0,5 -12,22 12,22" fill="#166534" opacity="0.5"/>
  <polygon points="0,14 -10,30 10,30" fill="#14532d" opacity="0.5"/>
</g>
<!-- Floating leaves -->
<g opacity="0.3">
  <path d="M80 80 Q85 75 90 80 Q85 85 80 80z" fill="#4ade80" transform="rotate(30 85 80)"/>
  <path d="M250 60 Q255 55 260 60 Q255 65 250 60z" fill="#86efac" transform="rotate(-20 255 60)"/>
  <path d="M180 50 Q184 46 188 50 Q184 54 180 50z" fill="#4ade80" transform="rotate(45 184 50)"/>
</g>
<!-- Birds -->
<g stroke="#a7f3d0" stroke-width="1" fill="none" opacity="0.25" stroke-linecap="round">
  <path d="M90 55 Q95 50 100 55"/><path d="M100 55 Q105 50 110 55"/>
  <path d="M210 40 Q214 36 218 40"/><path d="M218 40 Q222 36 226 40"/>
  <path d="M260 30 Q263 27 266 30"/><path d="M266 30 Q269 27 272 30"/>
</g>
<!-- Water/river -->
<path d="M0 230 Q50 225 100 232 Q150 238 200 228 Q250 218 300 230 Q350 240 400 225 L400 267 L0 267z" fill="#0d9488" opacity="0.15"/>
<!-- Ripples in water -->
<g stroke="#5eead4" stroke-width="0.5" fill="none" opacity="0.15">
  <path d="M80 245 Q100 242 120 245"/>
  <path d="M200 240 Q220 237 240 240"/>
  <path d="M300 248 Q315 245 330 248"/>
</g>
<!-- Recycling symbol (subtle) -->
<g transform="translate(35, 35)" opacity="0.1">
  <path d="M0,-12 L7,0 L0,-4 L-7,0z" fill="#22c55e" transform="rotate(0 0 0)"/>
  <path d="M0,-12 L7,0 L0,-4 L-7,0z" fill="#22c55e" transform="rotate(120 0 0)"/>
  <path d="M0,-12 L7,0 L0,-4 L-7,0z" fill="#22c55e" transform="rotate(240 0 0)"/>
</g>
<!-- Label -->
<text x="200" y="257" text-anchor="middle" fill="#6ee7b7" font-family="system-ui,sans-serif" font-size="11" font-weight="600" letter-spacing="3" opacity="0.6">ENVIRONMENT</text>
</svg>`;
}

function buildPoliticsSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="267" viewBox="0 0 400 267">
<defs>
  <linearGradient id="pBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1c1917"/><stop offset="100%" stop-color="#292524"/></linearGradient>
  <linearGradient id="pBuild" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f5f5f4"/><stop offset="100%" stop-color="#a8a29e"/></linearGradient>
</defs>
<rect width="400" height="267" fill="url(#pBg)"/>
<!-- Subtle radial glow behind building -->
<circle cx="200" cy="140" r="100" fill="#dc2626" opacity="0.04"/>
<!-- Capitol building -->
<g transform="translate(200, 60)">
  <!-- Dome -->
  <path d="M-50,100 Q-50,40 0,25 Q50,40 50,100" fill="url(#pBuild)" opacity="0.25" stroke="#78716c" stroke-width="0.8"/>
  <!-- Dome top -->
  <path d="M-30,100 Q-30,55 0,40 Q30,55 30,100" fill="url(#pBuild)" opacity="0.2" stroke="#78716c" stroke-width="0.6"/>
  <!-- Cupola -->
  <path d="M-12,50 Q-12,35 0,28 Q12,35 12,50" fill="#d6d3d1" opacity="0.3" stroke="#78716c" stroke-width="0.6"/>
  <!-- Spire -->
  <line x1="0" y1="28" x2="0" y2="15" stroke="#a8a29e" stroke-width="1.5" opacity="0.4"/>
  <!-- Dome base / entablature -->
  <rect x="-55" y="100" width="110" height="8" rx="1" fill="#d6d3d1" opacity="0.3" stroke="#78716c" stroke-width="0.5"/>
  <!-- Main columns -->
  <g opacity="0.3">
    <rect x="-48" y="108" width="6" height="55" fill="#d6d3d1"/><rect x="-34" y="108" width="6" height="55" fill="#d6d3d1"/>
    <rect x="-20" y="108" width="6" height="55" fill="#d6d3d1"/><rect x="-6" y="108" width="6" height="55" fill="#d6d3d1"/>
    <rect x="8" y="108" width="6" height="55" fill="#d6d3d1"/><rect x="22" y="108" width="6" height="55" fill="#d6d3d1"/>
    <rect x="36" y="108" width="6" height="55" fill="#d6d3d1"/>
  </g>
  <!-- Column shadows -->
  <g opacity="0.1">
    <rect x="-46" y="108" width="2" height="55" fill="#000"/>
    <rect x="-32" y="108" width="2" height="55" fill="#000"/>
    <rect x="-18" y="108" width="2" height="55" fill="#000"/>
    <rect x="-4" y="108" width="2" height="55" fill="#000"/>
    <rect x="10" y="108" width="2" height="55" fill="#000"/>
    <rect x="24" y="108" width="2" height="55" fill="#000"/>
    <rect x="38" y="108" width="2" height="55" fill="#000"/>
  </g>
  <!-- Base / steps -->
  <rect x="-60" y="163" width="120" height="6" rx="1" fill="#d6d3d1" opacity="0.25"/>
  <rect x="-70" y="169" width="140" height="5" rx="1" fill="#a8a29e" opacity="0.2"/>
  <rect x="-80" y="174" width="160" height="5" rx="1" fill="#78716c" opacity="0.15"/>
  <!-- Wings -->
  <rect x="-100" y="120" width="48" height="45" fill="#d6d3d1" opacity="0.15" stroke="#78716c" stroke-width="0.5"/>
  <rect x="52" y="120" width="48" height="45" fill="#d6d3d1" opacity="0.15" stroke="#78716c" stroke-width="0.5"/>
  <!-- Wing windows -->
  <g opacity="0.15" fill="#fbbf24">
    <rect x="-92" y="128" width="6" height="8" rx="1"/><rect x="-82" y="128" width="6" height="8" rx="1"/><rect x="-72" y="128" width="6" height="8" rx="1"/>
    <rect x="-92" y="142" width="6" height="8" rx="1"/><rect x="-82" y="142" width="6" height="8" rx="1"/><rect x="-72" y="142" width="6" height="8" rx="1"/>
    <rect x="60" y="128" width="6" height="8" rx="1"/><rect x="70" y="128" width="6" height="8" rx="1"/><rect x="80" y="128" width="6" height="8" rx="1"/>
    <rect x="60" y="142" width="6" height="8" rx="1"/><rect x="70" y="142" width="6" height="8" rx="1"/><rect x="80" y="142" width="6" height="8" rx="1"/>
  </g>
</g>
<!-- Stars (like flag elements) -->
<g fill="#dc2626" opacity="0.12">
  <polygon points="50,40 52,46 58,46 53,50 55,56 50,52 45,56 47,50 42,46 48,46"/>
  <polygon points="350,40 352,46 358,46 353,50 355,56 350,52 345,56 347,50 342,46 348,46"/>
  <polygon points="50,220 52,226 58,226 53,230 55,236 50,232 45,236 47,230 42,226 48,226"/>
  <polygon points="350,220 352,226 358,226 353,230 355,236 350,232 345,236 347,230 342,226 348,226"/>
</g>
<!-- Decorative stripes (flag motif) -->
<g opacity="0.05">
  <rect x="0" y="0" width="400" height="4" fill="#dc2626"/><rect x="0" y="8" width="400" height="4" fill="#dc2626"/>
  <rect x="0" y="255" width="400" height="4" fill="#dc2626"/><rect x="0" y="263" width="400" height="4" fill="#dc2626"/>
</g>
<!-- Balance scales (bottom left) -->
<g transform="translate(60, 180)" opacity="0.15">
  <line x1="0" y1="-25" x2="0" y2="0" stroke="#d6d3d1" stroke-width="1.5"/>
  <line x1="-25" y1="-22" x2="25" y2="-28" stroke="#d6d3d1" stroke-width="1.2"/>
  <path d="M-25,-22 L-32,-10 Q-25,-7 -18,-10z" fill="none" stroke="#d6d3d1" stroke-width="1"/>
  <path d="M25,-28 L18,-16 Q25,-13 32,-16z" fill="none" stroke="#d6d3d1" stroke-width="1"/>
  <polygon points="-3,0 3,0 5,5 -5,5" fill="#d6d3d1"/>
</g>
<!-- Podium / microphones (bottom right) -->
<g transform="translate(340, 195)" opacity="0.15">
  <rect x="-15" y="0" width="30" height="20" rx="2" fill="#d6d3d1"/>
  <line x1="-5" y1="0" x2="-5" y2="-20" stroke="#a8a29e" stroke-width="1.2"/>
  <line x1="5" y1="0" x2="5" y2="-18" stroke="#a8a29e" stroke-width="1.2"/>
  <circle cx="-5" cy="-22" r="3" fill="#a8a29e"/><circle cx="5" cy="-20" r="3" fill="#a8a29e"/>
</g>
<!-- Label -->
<text x="200" y="252" text-anchor="middle" fill="#fca5a5" font-family="system-ui,sans-serif" font-size="11" font-weight="600" letter-spacing="3" opacity="0.6">POLITICS</text>
</svg>`;
}

function buildDefaultSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="267" viewBox="0 0 400 267">
<defs>
  <linearGradient id="dBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1c1917"/><stop offset="100%" stop-color="#292524"/></linearGradient>
</defs>
<rect width="400" height="267" fill="url(#dBg)"/>
<!-- Newspaper icon -->
<g transform="translate(200, 100)" opacity="0.3">
  <rect x="-50" y="-40" width="100" height="80" rx="4" fill="none" stroke="#a8a29e" stroke-width="1.5"/>
  <!-- Headlines -->
  <rect x="-40" y="-30" width="60" height="6" rx="2" fill="#a8a29e" opacity="0.6"/>
  <rect x="-40" y="-18" width="80" height="3" rx="1" fill="#a8a29e" opacity="0.3"/>
  <rect x="-40" y="-12" width="75" height="3" rx="1" fill="#a8a29e" opacity="0.3"/>
  <rect x="-40" y="-6" width="80" height="3" rx="1" fill="#a8a29e" opacity="0.3"/>
  <!-- Image placeholder -->
  <rect x="-40" y="6" width="35" height="25" rx="2" fill="#a8a29e" opacity="0.15" stroke="#a8a29e" stroke-width="0.5"/>
  <!-- Text block -->
  <rect x="2" y="8" width="38" height="2" rx="1" fill="#a8a29e" opacity="0.25"/>
  <rect x="2" y="14" width="35" height="2" rx="1" fill="#a8a29e" opacity="0.25"/>
  <rect x="2" y="20" width="38" height="2" rx="1" fill="#a8a29e" opacity="0.25"/>
  <rect x="2" y="26" width="30" height="2" rx="1" fill="#a8a29e" opacity="0.25"/>
</g>
<!-- Label -->
<text x="200" y="210" text-anchor="middle" fill="#a8a29e" font-family="system-ui,sans-serif" font-size="11" font-weight="600" letter-spacing="3" opacity="0.5">NEWS</text>
</svg>`;
}

// Map category keys to their SVG builder functions
const CATEGORY_SVG_BUILDERS = {
  world: buildWorldSvg,
  technology: buildTechnologySvg,
  business: buildBusinessSvg,
  sport: buildSportSvg,
  science: buildScienceSvg,
  culture: buildCultureSvg,
  environment: buildEnvironmentSvg,
  politics: buildPoliticsSvg,
};

function buildPlaceholderSvg(category) {
  const builder = CATEGORY_SVG_BUILDERS[category] || buildDefaultSvg;
  return 'data:image/svg+xml,' + encodeURIComponent(builder());
}

// Pre-build all placeholders so we don't regenerate on every render
const placeholderCache = {};
function getPlaceholder(category) {
  const key = category || 'default';
  if (!placeholderCache[key]) {
    placeholderCache[key] = buildPlaceholderSvg(key);
  }
  return placeholderCache[key];
}

function getArticlePlaceholder(article) {
  const cat = article.sectionId || article.category || article.section || '';
  const normalized = cat.toLowerCase().replace(/[^a-z]/g, '');
  // Match against known categories
  for (const key of Object.keys(CATEGORY_SVG_BUILDERS)) {
    if (normalized.includes(key)) return getPlaceholder(key);
  }
  return getPlaceholder('world');
}

const SOURCE_COLORS = {
  'BBC': 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
  'Al Jazeera': 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
  'NPR': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'ABC News': 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  'Ars Technica': 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
  'Guardian': 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400',
};

function getSourceColor(source) {
  for (const [key, val] of Object.entries(SOURCE_COLORS)) {
    if (source?.includes(key)) return val;
  }
  return 'bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461]';
}

function BookmarkBtn({ article }) {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const saved = isBookmarked(article.id);

  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    saved ? removeBookmark(article.id) : addBookmark(article);
  };

  return (
    <button
      onClick={toggle}
      className={`shrink-0 p-1 rounded-full transition-colors ${
        saved
          ? 'text-[#e05d44] dark:text-[#e87461]'
          : 'text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461]'
      }`}
      title={saved ? 'Remove bookmark' : 'Bookmark'}
    >
      <svg width="16" height="16" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
      </svg>
    </button>
  );
}

function PlayBtn({ article }) {
  const { playArticle, addToQueue, currentArticle, playing, loading } = useAudio();
  const { lang } = useLanguage();
  const isPlaying = (playing || loading) && currentArticle?.id === article.id;

  const handlePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    playArticle(article, lang);
  };

  const handleQueue = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToQueue(article);
  };

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={handlePlay}
        className={`p-1 rounded-full transition-colors ${
          isPlaying
            ? 'text-[#e05d44] dark:text-[#e87461] animate-pulse'
            : 'text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461]'
        }`}
        title={isPlaying ? 'Now playing' : 'Listen'}
      >
        {isPlaying ? (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>
      {!isPlaying && (
        <button
          onClick={handleQueue}
          className="p-1 rounded-full text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors opacity-0 group-hover:opacity-100"
          title="Add to queue"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      )}
    </div>
  );
}

function Wrapper({ article, children }) {
  const articlePath = article.slug
    ? `/news/${article.slug}`
    : `/article/${encodeURIComponent(article.id)}`;
  return (
    <Link
      to={articlePath}
      state={article.isExternal ? { article } : undefined}
      className="block no-underline group h-full"
    >
      {children}
    </Link>
  );
}

export default function NewsCard({ article, featured = false }) {
  const sourceBadgeColor = article.source ? getSourceColor(article.source) : getSourceColor(article.author);
  const readTime = estimateReadingTime(article.body || article.description);

  const placeholder = getArticlePlaceholder(article);

  if (featured) {
    return (
      <Wrapper article={article}>
        <div className="relative rounded-2xl overflow-hidden card-hover border border-[var(--border)] bg-[var(--surface)] shadow-md hover:shadow-xl">
          <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden">
            <img
              src={article.image || placeholder}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block px-3 py-1 text-xs font-semibold bg-[#e05d44] text-white rounded-full capitalize">
                {article.sectionId || article.section}
              </span>
              {article.source && (
                <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${sourceBadgeColor}`}>
                  {article.source}
                </span>
              )}
              <span className="text-white/60 text-[10px]">{readTime} min read</span>
              {article.isExternal && (
                <span className="text-white/60 text-[10px]">&#8599;</span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-normal text-white mb-2 leading-tight">
              {article.title}
            </h2>
            <p className="text-white/90 text-sm md:text-base line-clamp-2 mb-3 leading-relaxed">{article.description}</p>
            <div className="flex items-center gap-3 text-xs text-white/60">
              <span>{article.author}</span>
              <span>&middot;</span>
              <span>{timeAgo(article.date)}</span>
              <div className="ml-auto flex items-center gap-1">
                <PlayBtn article={article} />
                <BookmarkBtn article={article} />
              </div>
            </div>
          </div>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper article={article}>
      <div className="rounded-2xl overflow-hidden card-hover border border-[var(--border)] bg-[var(--surface)] h-full flex flex-col shadow-md hover:shadow-xl">
        <div className="aspect-[3/2] overflow-hidden">
          <img
            src={article.image || placeholder}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { e.target.onerror = null; e.target.src = placeholder; }}
          />
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461] rounded-full capitalize">
              {article.sectionId || article.section}
            </span>
            {article.source && (
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${sourceBadgeColor}`}>
                {article.source}
              </span>
            )}
            <span className="text-[10px] text-[var(--text-muted)]">{readTime} min read</span>
          </div>
          <h3 className="text-lg font-normal text-[var(--text)] mb-2 line-clamp-2 group-hover:text-[#e05d44] dark:group-hover:text-[#e87461] transition-colors leading-snug" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            {article.title}
          </h3>
          <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed flex-1">{article.description}</p>
          <div className="mt-auto pt-4 flex items-center justify-between text-xs text-[var(--text-secondary)] border-t border-[var(--border)]">
            <span className="truncate max-w-[50%]">{article.author}</span>
            <div className="flex items-center gap-1">
              <span className="text-[var(--text-muted)] shrink-0">{timeAgo(article.date)}</span>
              <PlayBtn article={article} />
              <BookmarkBtn article={article} />
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
