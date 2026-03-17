// Vercel serverless function — proxy for CoinGecko API (no key needed)
const CACHE = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const now = Date.now();
  if (CACHE.data && now - CACHE.timestamp < CACHE_TTL) {
    return res.json(CACHE.data);
  }

  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h',
      { headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) throw new Error(`CoinGecko API error: ${response.status}`);

    const coins = await response.json();
    const data = coins.map((c) => ({
      id: c.id,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      price: c.current_price,
      change24h: c.price_change_percentage_24h,
      image: c.image,
      marketCap: c.market_cap,
    }));

    CACHE.data = data;
    CACHE.timestamp = now;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
