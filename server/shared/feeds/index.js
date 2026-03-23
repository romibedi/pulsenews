// ---------------------------------------------------------------------------
// feeds/index.js — Re-exports everything from sub-modules and provides
// the combined CITY_FEEDS + buildFeedContextMap().
// ---------------------------------------------------------------------------

export { FEEDS } from './global.js';
export { REGIONAL_FEEDS, REGIONAL_CATEGORY_FEEDS } from './regional.js';
export { LANG_FEEDS } from './languages.js';

import { FEEDS } from './global.js';
import { REGIONAL_FEEDS, REGIONAL_CATEGORY_FEEDS } from './regional.js';
import { LANG_FEEDS } from './languages.js';

import { CITY_FEEDS_INDIA } from './cities-india.js';
import { CITY_FEEDS_UK } from './cities-uk.js';
import { CITY_FEEDS_US } from './cities-us.js';
import { CITY_FEEDS_ASIA } from './cities-asia.js';
import { CITY_FEEDS_EUROPE } from './cities-europe.js';
import { CITY_FEEDS_MIDEAST } from './cities-mideast.js';
import { CITY_FEEDS_AFRICA } from './cities-africa.js';
import { CITY_FEEDS_LATAM } from './cities-latam.js';
import { CITY_FEEDS_OCEANIA } from './cities-oceania.js';

// Combine all city feed objects into a single CITY_FEEDS export.
// Order matters: later entries overwrite earlier ones for duplicate keys,
// matching the original feedRegistry.js behaviour.
export const CITY_FEEDS = {
  ...CITY_FEEDS_INDIA,
  ...CITY_FEEDS_UK,
  ...CITY_FEEDS_US,
  ...CITY_FEEDS_OCEANIA,
  ...CITY_FEEDS_MIDEAST,
  ...CITY_FEEDS_EUROPE,
  ...CITY_FEEDS_ASIA,
  ...CITY_FEEDS_AFRICA,
  ...CITY_FEEDS_LATAM,
};

// ---------------------------------------------------------------------------
// buildFeedContextMap()
//
// Returns a Map<feedUrl, { source: string, contexts: object[] }> that
// deduplicates every feed URL across all four registries so each URL is
// fetched only once during ingestion.  Each entry carries an array of
// "contexts" describing where that feed's articles should be filed.
//
// Context shapes:
//   { type: 'global',  category }
//   { type: 'region',  region, category? }   -- category omitted for general regional feeds
//   { type: 'lang',    lang }
//   { type: 'city',    city, region }
// ---------------------------------------------------------------------------
export function buildFeedContextMap() {
  /** @type {Map<string, { source: string, contexts: Array<object> }>} */
  const map = new Map();

  /**
   * Ensure an entry exists for `url` in the map and push `context` into its
   * contexts array.  The first occurrence of a URL determines the `source`
   * label stored on the entry (later duplicates may carry different source
   * names -- the first wins).
   */
  function register(url, source, context) {
    if (!map.has(url)) {
      map.set(url, { source, contexts: [] });
    }
    map.get(url).contexts.push(context);
  }

  // 1. Global category feeds
  for (const [category, feeds] of Object.entries(FEEDS)) {
    for (const { url, source } of feeds) {
      register(url, source, { type: 'global', category });
    }
  }

  // 2. Regional general feeds
  for (const [region, feeds] of Object.entries(REGIONAL_FEEDS)) {
    for (const { url, source } of feeds) {
      register(url, source, { type: 'region', region });
    }
  }

  // 3. Regional + category feeds
  for (const [region, categories] of Object.entries(REGIONAL_CATEGORY_FEEDS)) {
    for (const [category, feeds] of Object.entries(categories)) {
      for (const { url, source } of feeds) {
        register(url, source, { type: 'region', region, category });
      }
    }
  }

  // 4. Language-specific feeds
  for (const [lang, feeds] of Object.entries(LANG_FEEDS)) {
    for (const { url, source } of feeds) {
      register(url, source, { type: 'lang', lang });
    }
  }

  // 5. City-level feeds
  for (const [city, meta] of Object.entries(CITY_FEEDS)) {
    for (const { url, source } of meta.feeds) {
      register(url, source, { type: 'city', city, region: meta.region });
    }
  }

  return map;
}
