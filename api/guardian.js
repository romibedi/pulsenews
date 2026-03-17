// In-memory cache (persists across warm invocations on Vercel)
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export default async function handler(req, res) {
  const { url } = req;
  const path = url.replace(/^\/api\/guardian/, '') || '/search';

  // Check cache
  const cached = cache.get(path);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(cached.status).send(cached.data);
  }

  const guardianUrl = `https://content.guardianapis.com${path}`;

  try {
    const response = await fetch(guardianUrl);
    const data = await response.text();

    // Only cache successful responses
    if (response.ok) {
      cache.set(path, { data, status: response.status, ts: Date.now() });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Cache', 'MISS');
    // Tell Vercel's CDN to cache for 5 min, serve stale for 10 min while revalidating
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
