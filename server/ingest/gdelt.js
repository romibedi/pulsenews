// ---------------------------------------------------------------------------
// GDELT Project API v2 integration
//
// Fetches articles from GDELT's free DOC 2.0 API across multiple categories
// and languages. Returns normalized articles compatible with the RSS pipeline.
// ---------------------------------------------------------------------------

import { createHash } from 'crypto';

const GDELT_BASE = 'https://api.gdeltproject.org/api/v2/doc/doc';
const MAX_RECORDS = 250; // GDELT max per request

// Map our categories → simple GDELT keyword queries.
// GDELT's query parser is strict — avoid complex OR chains with sourcelang.
// Each query uses a single dominant keyword for reliability.
const CATEGORY_QUERIES = {
  technology:    { query: 'technology' },
  business:      { query: 'business' },
  science:       { query: 'science' },
  sport:         { query: 'sports' },
  environment:   { query: 'climate' },
  politics:      { query: 'election' },
  health:        { query: 'health' },
  entertainment: { query: 'entertainment' },
};

// Map our regions → GDELT sourcecountry FIPS codes
const REGION_COUNTRIES = {
  india:         'IN',
  us:            'US',
  uk:            'UK',
  australia:     'AS',
  europe:        'FR',   // Single country per query to keep it simple
  'middle-east': 'SA',
  africa:        'NI',
  asia:          'CH',
  latam:         'BR',
};

// Map GDELT language names → our 2-letter lang codes
const GDELT_LANG_MAP = {
  English:    'en',  Spanish:   'es',  French:    'fr',
  German:     'de',  Portuguese: 'pt', Italian:   'it',
  Dutch:      'nl',  Swedish:   'sv',  Turkish:   'tr',
  Polish:     'pl',  Russian:   'ru',  Arabic:    'ar',
  Persian:    'fa',  Hebrew:    'he',  Hindi:     'hi',
  Bengali:    'bn',  Tamil:     'ta',  Telugu:    'te',
  Urdu:       'ur',  Swahili:   'sw',  Chinese:   'zh',
  Japanese:   'ja',  Korean:    'ko',  Thai:      'th',
  Indonesian: 'id',  Vietnamese: 'vi', Malay:     'ms',
};

// Map GDELT FIPS country codes → our region names
const COUNTRY_TO_REGION = {
  US: 'us', UK: 'uk', IN: 'india', AS: 'australia',
  FR: 'europe', GM: 'europe', IT: 'europe', SP: 'europe', NL: 'europe',
  SW: 'europe', PL: 'europe', NO: 'europe', DA: 'europe', BE: 'europe',
  EI: 'europe', PO: 'europe', AU: 'europe', SZ: 'europe', GR: 'europe',
  SA: 'middle-east', IS: 'middle-east', TU: 'middle-east', IR: 'middle-east',
  AE: 'middle-east', QA: 'middle-east', BA: 'middle-east', KU: 'middle-east',
  NI: 'africa', SF: 'africa', KE: 'africa', EG: 'africa', GH: 'africa',
  TZ: 'africa', ET: 'africa', UG: 'africa',
  CH: 'asia', JA: 'asia', KS: 'asia', SN: 'asia', TH: 'asia',
  ID: 'asia', VM: 'asia', MY: 'asia', RP: 'asia', TW: 'asia',
  BR: 'latam', MX: 'latam', AR: 'latam', CO: 'latam', CL: 'latam',
  PE: 'latam', VE: 'latam',
};

/** Pause for ms milliseconds. */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch a single GDELT query and return parsed articles.
 */
async function fetchGdeltQuery(query, timespan = '15min') {
  // Build URL manually to control encoding — GDELT expects specific format
  const url = `${GDELT_BASE}?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=${MAX_RECORDS}&format=json&sort=datedesc&timespan=${timespan}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    const res = await fetch(url, {
      headers: { 'User-Agent': 'PulseNews/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[gdelt] HTTP ${res.status} for: ${query.slice(0, 60)}`);
      return [];
    }

    const text = await res.text();
    // GDELT returns text error messages for bad queries instead of JSON
    if (!text.startsWith('{') && !text.startsWith('[')) {
      console.warn(`[gdelt] Non-JSON response for: ${query.slice(0, 60)}`);
      return [];
    }

    const data = JSON.parse(text);
    return data.articles || [];
  } catch (err) {
    console.warn(`[gdelt] Fetch failed: ${err.message} (query: ${query.slice(0, 60)})`);
    return [];
  }
}

/**
 * Normalize a GDELT article into our standard article format.
 */
function normalizeArticle(ga, category) {
  const urlHash = createHash('sha256').update(ga.url).digest('base64url');
  const id = `gdelt-${urlHash}`;
  const lang = GDELT_LANG_MAP[ga.language] || 'en';
  const region = COUNTRY_TO_REGION[ga.sourcecountry] || 'global';

  // GDELT seendate format: "20260322T133000Z" → needs dashes/colons
  let date;
  try {
    const sd = ga.seendate || '';
    if (sd.length >= 15) {
      date = new Date(`${sd.slice(0,4)}-${sd.slice(4,6)}-${sd.slice(6,8)}T${sd.slice(9,11)}:${sd.slice(11,13)}:${sd.slice(13,15)}Z`).toISOString();
    } else {
      date = new Date().toISOString();
    }
  } catch {
    date = new Date().toISOString();
  }

  return {
    id,
    title: ga.title || '',
    description: '',
    body: '',
    image: ga.socialimage || '',
    author: ga.domain || 'GDELT',
    date,
    source: ga.domain || 'GDELT',
    url: ga.url,
    tags: [],
    isExternal: true,
    _lang: lang,
    _region: region,
    _category: category,
    _domain: ga.domain,
  };
}

/**
 * Build DynamoDB PK contexts for a GDELT article.
 */
export function buildGdeltContexts(article) {
  const contexts = [];
  const cat = article._category || 'world';
  const lang = article._lang || 'en';
  const region = article._region || 'global';

  // Global category partition
  contexts.push({ type: 'global', category: cat });

  // Region partition
  if (region !== 'global') {
    contexts.push({ type: 'region', region });
    contexts.push({ type: 'region', region, category: cat });
  }

  // Language partition (for non-English)
  if (lang !== 'en') {
    contexts.push({ type: 'lang', lang });
  }

  return contexts;
}

/**
 * Fetch articles from GDELT across categories, regions, and languages.
 *
 * Runs queries sequentially with small delays to respect GDELT rate limits.
 * Deduplicates by URL before returning.
 *
 * @param {string} [timespan='15min'] - GDELT timespan (15min, 1h, 1d)
 * @returns {Promise<Array>} Normalized articles with _lang, _region, _category metadata
 */
export async function fetchGdeltArticles(timespan = '15min') {
  const queries = [];

  // Category queries (English, global)
  for (const [category, { query }] of Object.entries(CATEGORY_QUERIES)) {
    queries.push({ query: `${query} sourcelang:eng`, category });
  }

  // Regional queries — one country per region
  for (const [region, fips] of Object.entries(REGION_COUNTRIES)) {
    queries.push({
      query: `sourcecountry:${fips}`,
      category: 'world',
      region,
    });
  }

  // Non-English language queries (GDELT accepts both full names and 3-letter codes)
  const nonEnglishLangs = [
    ['hin', 'hi'], ['spa', 'es'], ['fra', 'fr'], ['deu', 'de'],
    ['por', 'pt'], ['ara', 'ar'], ['zho', 'zh'], ['jpn', 'ja'],
    ['rus', 'ru'], ['tur', 'tr'], ['ita', 'it'],
  ];
  for (const [gdeltCode, langCode] of nonEnglishLangs) {
    queries.push({
      query: `sourcelang:${gdeltCode}`,
      category: 'world',
      lang: langCode,
    });
  }

  // Execute queries sequentially with delays to respect GDELT rate limits.
  // GDELT enforces strict rate limiting — run one at a time with pauses.
  const DELAY_MS = 2000; // 2s between requests
  const allArticles = [];

  for (let i = 0; i < queries.length; i++) {
    if (i > 0) await sleep(DELAY_MS);

    const { query, category, region, lang } = queries[i];
    const raw = await fetchGdeltQuery(query, timespan);
    for (const ga of raw) {
      const article = normalizeArticle(ga, category);
      if (region) article._region = region;
      if (lang) article._lang = lang;
      allArticles.push(article);
    }
  }

  // Deduplicate by URL
  const seen = new Set();
  const unique = [];
  for (const article of allArticles) {
    if (!article.url || seen.has(article.url)) continue;
    if (!article.title || article.title.length < 5) continue;
    seen.add(article.url);
    unique.push(article);
  }

  console.log(`[gdelt] Fetched ${unique.length} unique articles from ${queries.length} queries`);
  return unique;
}
