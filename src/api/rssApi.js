const CACHE_TTL = 30 * 60 * 1000;

function getCached(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // storage full
  }
}

export async function fetchRssCategory(category) {
  const url = `/api/feeds?category=${encodeURIComponent(category)}`;
  const cached = getCached(url);
  if (cached) return cached;

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const articles = data.articles || [];
    setCache(url, articles);
    return articles;
  } catch {
    return [];
  }
}
