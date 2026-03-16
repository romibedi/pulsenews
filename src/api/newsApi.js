const API_KEY = 'test';
const BASE_URL = '/api/guardian';

const SECTION_MAP = {
  world: 'world',
  technology: 'technology',
  business: 'business',
  sport: 'sport',
  science: 'science',
  culture: 'culture',
  environment: 'environment',
  politics: 'politics',
};

export const CATEGORIES = Object.keys(SECTION_MAP);

// --- Request queue to avoid rate limiting ---
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const REQUEST_DELAY = 250; // ms between requests
let lastRequestTime = 0;

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
    // storage full, ignore
  }
}

async function throttledFetch(url) {
  const cached = getCached(url);
  if (cached) return cached;

  const now = Date.now();
  const wait = Math.max(0, REQUEST_DELAY - (now - lastRequestTime));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestTime = Date.now();

  const res = await fetch(url);
  if (res.status === 429) {
    // Rate limited — wait and retry once
    await new Promise((r) => setTimeout(r, 2000));
    const retry = await fetch(url);
    if (!retry.ok) throw new Error('Rate limited. Please try again in a moment.');
    const data = await retry.json();
    setCache(url, data);
    return data;
  }
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const data = await res.json();
  setCache(url, data);
  return data;
}

function buildParams(extra = {}) {
  const params = new URLSearchParams({
    'api-key': API_KEY,
    'show-fields': 'thumbnail,trailText,bodyText,headline,byline,lastModified',
    'show-tags': 'keyword',
    'page-size': '20',
    ...extra,
  });
  return params.toString();
}

function transformArticle(item) {
  return {
    id: item.id,
    title: item.webTitle,
    description: item.fields?.trailText || '',
    body: item.fields?.bodyText || '',
    image: item.fields?.thumbnail || null,
    author: item.fields?.byline || 'Guardian Staff',
    date: item.webPublicationDate,
    section: item.sectionName,
    sectionId: item.sectionId,
    url: item.webUrl,
    tags: (item.tags || []).slice(0, 4).map((t) => t.webTitle),
  };
}

export async function fetchTopStories() {
  const params = buildParams({ 'page-size': '25', 'order-by': 'newest' });
  const data = await throttledFetch(`${BASE_URL}/search?${params}`);
  return (data.response?.results || []).map(transformArticle);
}

export async function fetchByCategory(category, page = 1) {
  const section = SECTION_MAP[category] || category;
  const params = buildParams({
    section,
    page: String(page),
    'order-by': 'newest',
  });
  const data = await throttledFetch(`${BASE_URL}/search?${params}`);
  return {
    articles: (data.response?.results || []).map(transformArticle),
    currentPage: data.response?.currentPage || 1,
    totalPages: data.response?.pages || 1,
  };
}

export async function fetchArticle(articleId) {
  const params = new URLSearchParams({
    'api-key': API_KEY,
    'show-fields': 'thumbnail,trailText,bodyText,headline,byline,lastModified,body',
    'show-tags': 'keyword',
  }).toString();
  const data = await throttledFetch(`${BASE_URL}/${articleId}?${params}`);
  return transformArticle(data.response?.content);
}

export async function searchNews(query, page = 1) {
  const params = buildParams({
    q: query,
    page: String(page),
    'order-by': 'relevance',
  });
  const data = await throttledFetch(`${BASE_URL}/search?${params}`);
  return {
    articles: (data.response?.results || []).map(transformArticle),
    currentPage: data.response?.currentPage || 1,
    totalPages: data.response?.pages || 1,
  };
}
