import { useState, useEffect } from 'react';

export default function StockTicker() {
  const [coins, setCoins] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/stocks')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCoins(data);
        else setError(true);
      })
      .catch(() => setError(true));
  }, []);

  if (error || coins.length === 0) return null;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-[#e05d44] dark:text-[#e87461]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4v16" />
        </svg>
        <h3 className="text-lg text-[var(--text)]" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
          Market Watch
        </h3>
      </div>
      <div className="space-y-3">
        {coins.slice(0, 6).map((coin) => (
          <div key={coin.id} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
            <img src={coin.image} alt={coin.symbol} className="w-6 h-6 rounded-full" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--text)]">{coin.symbol}</span>
                <span className="text-xs text-[var(--text-muted)] truncate">{coin.name}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-medium text-[var(--text)]">
                ${coin.price >= 1 ? coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : coin.price.toFixed(4)}
              </p>
              <p className={`text-[10px] font-semibold ${coin.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {coin.change24h >= 0 ? '+' : ''}{coin.change24h?.toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[9px] text-[var(--text-muted)] mt-3">Data from CoinGecko. Updates every 5 min.</p>
    </div>
  );
}
