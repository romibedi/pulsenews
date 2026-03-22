/**
 * Detect if an image URL is a site logo or generic placeholder,
 * not an actual article-specific image.
 */
export function isLogoImage(url) {
  if (!url) return true;
  const lower = url.toLowerCase();
  // Google News app logo
  if (lower.includes('lh3.googleusercontent.com/j6_cofb')) return true;
  // URL path contains "logo"
  if (/[/\-_]logo[/\-_.\d]/i.test(lower)) return true;
  // Common placeholder/favicon patterns
  if (/[/\-_](favicon|placeholder|default[_-]?image|brand|site-icon)[/\-_.]/i.test(lower)) return true;
  return false;
}

/**
 * Return the article image if it's a real article image, or null if it's a logo.
 */
export function getArticleImage(article) {
  return (article.image && !isLogoImage(article.image)) ? article.image : null;
}

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

// Cities grouped by region — used by Home & Category break cards
export const CITIES_BY_REGION = {
  india: [
    { key: 'mumbai', label: 'Mumbai' }, { key: 'delhi', label: 'Delhi' },
    { key: 'bangalore', label: 'Bangalore' }, { key: 'chennai', label: 'Chennai' },
    { key: 'hyderabad', label: 'Hyderabad' }, { key: 'kolkata', label: 'Kolkata' },
    { key: 'pune', label: 'Pune' }, { key: 'ahmedabad', label: 'Ahmedabad' },
    { key: 'chandigarh', label: 'Chandigarh' }, { key: 'lucknow', label: 'Lucknow' },
    { key: 'jaipur', label: 'Jaipur' }, { key: 'kochi', label: 'Kochi' },
  ],
  uk: [
    { key: 'london', label: 'London' }, { key: 'manchester', label: 'Manchester' },
    { key: 'birmingham', label: 'Birmingham' }, { key: 'edinburgh', label: 'Edinburgh' },
    { key: 'glasgow', label: 'Glasgow' }, { key: 'leeds', label: 'Leeds' },
    { key: 'liverpool', label: 'Liverpool' }, { key: 'bristol', label: 'Bristol' },
  ],
  us: [
    { key: 'new-york', label: 'New York' }, { key: 'los-angeles', label: 'Los Angeles' },
    { key: 'chicago', label: 'Chicago' }, { key: 'san-francisco', label: 'San Francisco' },
    { key: 'washington-dc', label: 'Washington DC' }, { key: 'houston', label: 'Houston' },
    { key: 'miami', label: 'Miami' }, { key: 'dallas', label: 'Dallas' },
    { key: 'seattle', label: 'Seattle' }, { key: 'boston', label: 'Boston' },
    { key: 'atlanta', label: 'Atlanta' }, { key: 'denver', label: 'Denver' },
  ],
  australia: [
    { key: 'sydney', label: 'Sydney' }, { key: 'melbourne', label: 'Melbourne' },
    { key: 'brisbane', label: 'Brisbane' }, { key: 'perth', label: 'Perth' },
    { key: 'adelaide', label: 'Adelaide' },
  ],
  'middle-east': [
    { key: 'dubai', label: 'Dubai' }, { key: 'riyadh', label: 'Riyadh' },
    { key: 'istanbul', label: 'Istanbul' }, { key: 'cairo', label: 'Cairo' },
    { key: 'doha', label: 'Doha' },
  ],
  europe: [
    { key: 'paris', label: 'Paris' }, { key: 'berlin', label: 'Berlin' },
    { key: 'madrid', label: 'Madrid' }, { key: 'rome', label: 'Rome' },
    { key: 'amsterdam', label: 'Amsterdam' }, { key: 'barcelona', label: 'Barcelona' },
    { key: 'munich', label: 'Munich' }, { key: 'stockholm', label: 'Stockholm' },
  ],
  asia: [
    { key: 'tokyo', label: 'Tokyo' }, { key: 'singapore', label: 'Singapore' },
    { key: 'hong-kong', label: 'Hong Kong' }, { key: 'seoul', label: 'Seoul' },
    { key: 'bangkok', label: 'Bangkok' }, { key: 'jakarta', label: 'Jakarta' },
  ],
  africa: [
    { key: 'nairobi', label: 'Nairobi' }, { key: 'lagos', label: 'Lagos' },
    { key: 'johannesburg', label: 'Johannesburg' }, { key: 'cape-town', label: 'Cape Town' },
  ],
  latam: [
    { key: 'sao-paulo', label: 'Sao Paulo' }, { key: 'mexico-city', label: 'Mexico City' },
    { key: 'buenos-aires', label: 'Buenos Aires' }, { key: 'bogota', label: 'Bogota' },
    { key: 'lima', label: 'Lima' },
  ],
};

const REGION_FLAGS = {
  india: '\ud83c\uddee\ud83c\uddf3', uk: '\ud83c\uddec\ud83c\udde7', us: '\ud83c\uddfa\ud83c\uddf8',
  australia: '\ud83c\udde6\ud83c\uddfa', 'middle-east': '\ud83c\uddf8\ud83c\udde6', europe: '\ud83c\uddea\ud83c\uddfa',
  asia: '\ud83c\uddef\ud83c\uddf5', africa: '\ud83c\uddf0\ud83c\uddea', latam: '\ud83c\udde7\ud83c\uddf7',
};

/**
 * Get cities relevant to the selected region.
 * "world" returns a mixed sample from all regions.
 */
export function getCitiesForRegion(region) {
  if (region && region !== 'world' && CITIES_BY_REGION[region]) {
    const flag = REGION_FLAGS[region] || '';
    return CITIES_BY_REGION[region].map((c) => ({ ...c, flag }));
  }
  // World: pick top 2 from each region for variety
  const mixed = [];
  for (const [reg, cities] of Object.entries(CITIES_BY_REGION)) {
    const flag = REGION_FLAGS[reg] || '';
    for (const c of cities.slice(0, 2)) {
      mixed.push({ ...c, flag });
    }
  }
  return mixed;
}

// ---------------------------------------------------------------------------
// Seeded daily shuffle — same order for a whole day, changes at midnight
// ---------------------------------------------------------------------------
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function dailyShuffle(array) {
  if (array.length <= 1) return array;
  const seed = new Date().toISOString().slice(0, 10);
  const result = [...array];
  let s = hashCode(seed);
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ---------------------------------------------------------------------------
// Smart pullquote — prefers actual quotes with attribution over bland ledes
// ---------------------------------------------------------------------------
export function extractSmartPullquote(articles) {
  let best = null;
  let bestScore = -1;

  for (const a of articles.slice(3, 15)) {
    const desc = (a.description || '').replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
    if (desc.length < 40) continue;

    // Look for actual quoted speech
    const quoteMatch = desc.match(/\u201c([^\u201d]{30,180})\u201d/) || desc.match(/"([^"]{30,180})"/);
    if (quoteMatch) {
      const score = 15 + (/said|told|according/i.test(desc) ? 5 : 0);
      if (score > bestScore) {
        bestScore = score;
        best = { quote: `\u201c${quoteMatch[1]}\u201d`, article: a };
      }
      continue;
    }

    // Fall back to punchy sentences
    const sentences = desc.split(/[.!?]+/).filter((s) => s.trim().length > 30 && s.trim().length < 200);
    if (!sentences[0]) continue;

    let score = 0;
    const s = sentences[0].trim();
    if (s.length >= 50 && s.length <= 150) score += 3;
    if (/said|told|according to/i.test(desc)) score += 5;
    if (/["\u201c\u201d]/.test(desc)) score += 2;

    if (score > bestScore) {
      bestScore = score;
      best = { quote: s + '.', article: a };
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Top Story — picks the highest-signal article for prominent treatment
// ---------------------------------------------------------------------------
const TOP_SOURCES = new Set([
  'BBC', 'BBC News', 'Reuters', 'AP', 'Associated Press', 'The Guardian',
  'NYT', 'The New York Times', 'Al Jazeera', 'CNN', 'The Washington Post',
  'The Hindu', 'NDTV', 'Times of India', 'Hindustan Times',
]);

export function pickTopStory(articles) {
  if (articles.length < 5) return null;
  let best = null;
  let bestScore = -1;

  for (const a of articles.slice(1, 15)) {
    let score = 0;
    if (getArticleImage(a)) score += 3;
    const descLen = (a.description || '').replace(/<[^>]*>/g, '').length;
    if (descLen > 200) score += 3;
    else if (descLen > 100) score += 1;
    if (TOP_SOURCES.has(a.source)) score += 5;
    if (a.title && a.title.length > 50) score += 1;
    if (score > bestScore) { bestScore = score; best = a; }
  }
  return bestScore >= 5 ? best : null;
}

// ---------------------------------------------------------------------------
// Photo of the Day — picks the article with strongest visual signal
// ---------------------------------------------------------------------------
const PHOTO_SOURCES = new Set([
  'Reuters', 'AFP', 'AP', 'Associated Press', 'The Guardian',
  'National Geographic', 'BBC', 'BBC News',
]);
const PHOTO_KEYWORDS = /photos?|images?|gallery|pictures?|visual|scenes?|aerial|devastat|celebrat|spectacular|stunning/i;

export function pickPhotoOfDay(articles) {
  let best = null;
  let bestScore = -1;

  for (const a of articles.slice(0, 20)) {
    if (!getArticleImage(a)) continue;
    let score = 1; // has real image (not a logo)
    if (PHOTO_SOURCES.has(a.source)) score += 5;
    if (PHOTO_KEYWORDS.test(a.title)) score += 3;
    if ((a.description || '').replace(/<[^>]*>/g, '').length > 100) score += 1;
    if (score > bestScore) { bestScore = score; best = a; }
  }
  return best;
}

// ---------------------------------------------------------------------------
// By the Numbers — extracts a notable statistic from articles
// ---------------------------------------------------------------------------
const STAT_PATTERNS = [
  /(\$[\d,.]+\s*(?:billion|million|trillion|bn|mn))/i,
  /([\d,.]+%\s*(?:increase|decrease|drop|rise|growth|decline|fall|jump|surge))/i,
  /([\d,]+(?:\.\d+)?\s*(?:million|billion|thousand)\s*(?:people|users|jobs|workers|deaths|cases|subscribers|downloads|customers|vehicles))/i,
];

export function extractStatistic(articles) {
  for (const a of articles.slice(0, 20)) {
    const text = `${a.title} ${(a.description || '').replace(/<[^>]*>/g, '')}`;
    for (const pattern of STAT_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        // Grab surrounding context (up to 60 chars around the match)
        const idx = text.indexOf(match[0]);
        const start = Math.max(0, text.lastIndexOf(' ', Math.max(0, idx - 25)));
        const end = Math.min(text.length, text.indexOf('.', idx + match[0].length));
        const context = text.slice(start, end > idx ? end : idx + match[0].length + 40).trim();
        return { stat: match[0].trim(), context, article: a };
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Time dividers — detect gaps between article chunks
// ---------------------------------------------------------------------------
export function getTimeDivider(prevDate, nextDate) {
  if (!prevDate || !nextDate) return null;
  const gap = new Date(prevDate) - new Date(nextDate);
  const hours = Math.floor(gap / 3600000);
  if (hours < 6) return null;
  if (hours < 24) return `${hours} hours earlier`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} earlier`;
}

// ---------------------------------------------------------------------------
// Quick Poll — daily poll questions by category
// ---------------------------------------------------------------------------
export const POLL_QUESTIONS = {
  world: [
    { id: 'w1', q: 'Should the UN have more enforcement power?', a: 'Yes', b: 'No' },
    { id: 'w2', q: 'Is diplomacy more effective than sanctions?', a: 'Diplomacy', b: 'Sanctions' },
    { id: 'w3', q: 'Should countries accept more refugees?', a: 'Yes', b: 'No' },
  ],
  technology: [
    { id: 't1', q: 'Is AI regulation moving too fast?', a: 'Too fast', b: 'Not fast enough' },
    { id: 't2', q: 'Should social media verify user ages?', a: 'Yes', b: 'No' },
    { id: 't3', q: 'Will AI replace more jobs than it creates?', a: 'Replace', b: 'Create' },
  ],
  business: [
    { id: 'b1', q: 'Are tech companies too powerful?', a: 'Yes', b: 'No' },
    { id: 'b2', q: 'Should CEO pay be capped relative to workers?', a: 'Yes', b: 'No' },
    { id: 'b3', q: 'Remote work: permanent shift or passing trend?', a: 'Permanent', b: 'Temporary' },
  ],
  science: [
    { id: 's1', q: 'Should we prioritize Mars colonization?', a: 'Yes', b: 'Fix Earth first' },
    { id: 's2', q: 'Gene editing for disease prevention?', a: 'Support', b: 'Too risky' },
  ],
  sport: [
    { id: 'sp1', q: 'Should VAR/technology decide close calls?', a: 'Yes', b: 'Human refs' },
    { id: 'sp2', q: 'Are player salaries justified?', a: 'Yes', b: 'Too high' },
  ],
  politics: [
    { id: 'p1', q: 'Should voting be mandatory?', a: 'Yes', b: 'No' },
    { id: 'p2', q: 'Term limits for all elected officials?', a: 'Yes', b: 'No' },
  ],
  environment: [
    { id: 'e1', q: 'Nuclear power: solution to climate change?', a: 'Yes', b: 'Too risky' },
    { id: 'e2', q: 'Should carbon tax be universal?', a: 'Yes', b: 'No' },
  ],
  ai: [
    { id: 'a1', q: 'Should AI development be paused?', a: 'Pause', b: 'Continue' },
    { id: 'a2', q: 'Will AGI arrive by 2030?', a: 'Yes', b: 'No' },
  ],
  entertainment: [
    { id: 'en1', q: 'Streaming or theaters for new movies?', a: 'Streaming', b: 'Theaters' },
    { id: 'en2', q: 'Are remakes/reboots overdone?', a: 'Yes', b: 'No' },
  ],
  gaming: [
    { id: 'g1', q: 'Microtransactions: acceptable or predatory?', a: 'Acceptable', b: 'Predatory' },
    { id: 'g2', q: 'Cloud gaming: the future?', a: 'Yes', b: 'No' },
  ],
  cricket: [
    { id: 'c1', q: 'T20 or Test cricket: which matters more?', a: 'T20', b: 'Test' },
    { id: 'c2', q: 'Should cricket be in the Olympics?', a: 'Yes', b: 'No' },
  ],
  startups: [
    { id: 'st1', q: 'Bootstrapping or VC funding?', a: 'Bootstrap', b: 'VC' },
    { id: 'st2', q: 'Is the startup bubble bursting?', a: 'Yes', b: 'No' },
  ],
  space: [
    { id: 'x1', q: 'Should space exploration be privatized?', a: 'Yes', b: 'Government-led' },
    { id: 'x2', q: 'Humans on Mars by 2040?', a: 'Yes', b: 'No' },
  ],
  crypto: [
    { id: 'cr1', q: 'Will Bitcoin replace gold as store of value?', a: 'Yes', b: 'No' },
    { id: 'cr2', q: 'Should crypto be regulated like banks?', a: 'Yes', b: 'No' },
  ],
  culture: [
    { id: 'cu1', q: 'Should museums return colonial artifacts?', a: 'Yes', b: 'No' },
    { id: 'cu2', q: 'Is cancel culture effective?', a: 'Yes', b: 'No' },
  ],
};

export function getDailyPoll(category) {
  const polls = POLL_QUESTIONS[category] || POLL_QUESTIONS.world;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return polls[dayOfYear % polls.length];
}
