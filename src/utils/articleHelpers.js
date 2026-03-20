const STOP_WORDS = new Set([
  'the','a','an','in','on','at','to','for','of','and','or','but','is','are','was','were',
  'be','been','has','have','had','do','does','did','will','would','could','should','may',
  'might','can','with','from','by','as','it','its','this','that','not','no','new','after',
  'over','says','said','how','what','why','when','where','who','which','more','most','also',
  'than','up','out','about','into','all','some','their','they','he','she','his','her','we',
  "'s","—","–","-","vs","via","amid",
]);

export function extractKeywords(title) {
  return (title || '').toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export function clusterArticles(articles, maxClusters = 3) {
  if (articles.length < 6) return [];
  const kwMap = new Map();
  articles.forEach((a, idx) => {
    extractKeywords(a.title).forEach((kw) => {
      if (!kwMap.has(kw)) kwMap.set(kw, []);
      kwMap.get(kw).push(idx);
    });
  });
  const candidates = [...kwMap.entries()]
    .filter(([, idxs]) => idxs.length >= 2 && idxs.length <= 5)
    .sort((a, b) => b[1].length - a[1].length);
  const usedIndices = new Set();
  const clusters = [];
  for (const [keyword, indices] of candidates) {
    if (clusters.length >= maxClusters) break;
    const ci = indices.filter((i) => !usedIndices.has(i)).slice(0, 3);
    if (ci.length < 2) continue;
    ci.forEach((i) => usedIndices.add(i));
    clusters.push({ topic: keyword.charAt(0).toUpperCase() + keyword.slice(1), articles: ci.map((i) => articles[i]) });
  }
  return clusters;
}

export function extractPullquote(article) {
  const desc = (article.description || '').replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
  if (desc.length < 40) return null;
  const sentences = desc.split(/[.!?]+/).filter((s) => s.trim().length > 30 && s.trim().length < 200);
  return sentences[0] ? sentences[0].trim() + '.' : null;
}

export function timeAgo(dateStr) {
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

export const POPULAR_CITIES = [
  { key: 'mumbai', label: 'Mumbai', flag: '\ud83c\uddee\ud83c\uddf3' },
  { key: 'delhi', label: 'Delhi', flag: '\ud83c\uddee\ud83c\uddf3' },
  { key: 'bangalore', label: 'Bangalore', flag: '\ud83c\uddee\ud83c\uddf3' },
  { key: 'chennai', label: 'Chennai', flag: '\ud83c\uddee\ud83c\uddf3' },
  { key: 'hyderabad', label: 'Hyderabad', flag: '\ud83c\uddee\ud83c\uddf3' },
  { key: 'kolkata', label: 'Kolkata', flag: '\ud83c\uddee\ud83c\uddf3' },
  { key: 'pune', label: 'Pune', flag: '\ud83c\uddee\ud83c\uddf3' },
  { key: 'london', label: 'London', flag: '\ud83c\uddec\ud83c\udde7' },
  { key: 'manchester', label: 'Manchester', flag: '\ud83c\uddec\ud83c\udde7' },
  { key: 'new-york', label: 'New York', flag: '\ud83c\uddfa\ud83c\uddf8' },
  { key: 'los-angeles', label: 'Los Angeles', flag: '\ud83c\uddfa\ud83c\uddf8' },
  { key: 'san-francisco', label: 'San Francisco', flag: '\ud83c\uddfa\ud83c\uddf8' },
  { key: 'sydney', label: 'Sydney', flag: '\ud83c\udde6\ud83c\uddfa' },
  { key: 'melbourne', label: 'Melbourne', flag: '\ud83c\udde6\ud83c\uddfa' },
];
