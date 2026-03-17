// Categories available in the app
export const CATEGORIES = ['world', 'technology', 'business', 'sport', 'science', 'culture', 'environment', 'politics'];

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

export async function fetchByCategory(category, page = 1) {
  const url = `/api/feeds?category=${encodeURIComponent(category)}`;
  const cached = getCached(url);
  if (cached && cached.articles) return cached;

  try {
    const res = await fetch(url);
    if (!res.ok) return { articles: [], currentPage: 1, totalPages: 1 };
    const data = await res.json();
    const result = {
      articles: data.articles || [],
      currentPage: 1,
      totalPages: 1,
    };
    setCache(url, result);
    return result;
  } catch {
    return { articles: [], currentPage: 1, totalPages: 1 };
  }
}

export async function searchNews(query) {
  // Search across all categories and filter client-side
  const categories = CATEGORIES;
  const results = await Promise.all(
    categories.map((cat) =>
      fetch(`/api/feeds?category=${encodeURIComponent(cat)}`)
        .then((r) => r.json())
        .then((d) => d.articles || [])
        .catch(() => [])
    )
  );
  const all = results.flat();
  const q = query.toLowerCase();
  const matched = all.filter(
    (a) =>
      a.title?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q)
  );
  // Dedupe
  const seen = new Set();
  const unique = matched.filter((a) => {
    const key = a.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return { articles: unique, currentPage: 1, totalPages: 1 };
}
