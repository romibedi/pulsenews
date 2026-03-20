// ---------------------------------------------------------------------------
// OpenSearch index mappings per language
//
// Each language gets its own index (articles-en, articles-hi, etc.) with the
// correct analyzer for tokenization, stemming, and stop-word removal.
// ---------------------------------------------------------------------------

/**
 * Analyzer configuration per language code.
 *
 * - Built-in analyzers: english, hindi, arabic, french, german, spanish, portuguese
 * - Plugins (pre-installed on AWS OpenSearch): smartcn, kuromoji, nori, icu
 * - For languages without a dedicated analyzer, we use icu_analyzer which
 *   handles Unicode normalization and tokenization for any script.
 */
export const LANGUAGE_ANALYZERS = {
  en: { analyzer: 'english', name: 'English' },
  hi: { analyzer: 'hindi', name: 'Hindi' },
  ta: { analyzer: 'icu_analyzer', name: 'Tamil' },
  te: { analyzer: 'icu_analyzer', name: 'Telugu' },
  bn: { analyzer: 'icu_analyzer', name: 'Bengali' },
  mr: { analyzer: 'icu_analyzer', name: 'Marathi' },
  ur: { analyzer: 'icu_analyzer', name: 'Urdu' },
  ar: { analyzer: 'arabic', name: 'Arabic' },
  fr: { analyzer: 'french', name: 'French' },
  de: { analyzer: 'german', name: 'German' },
  es: { analyzer: 'spanish', name: 'Spanish' },
  pt: { analyzer: 'portuguese', name: 'Portuguese' },
  zh: { analyzer: 'smartcn', name: 'Chinese' },
  ja: { analyzer: 'kuromoji', name: 'Japanese' },
  ko: { analyzer: 'icu_analyzer', name: 'Korean' },
  sw: { analyzer: 'icu_analyzer', name: 'Swahili' },
};

/**
 * Build the index settings + mappings for a given language.
 *
 * Includes:
 * - Language-specific analyzer on title, description, body
 * - ICU folding for accent/diacritic normalization (e.g. économie → economie)
 * - Keyword fields for exact-match filtering (category, region, source)
 * - Date field for range queries and sorting
 */
export function buildIndexSettings(lang) {
  const config = LANGUAGE_ANALYZERS[lang] || LANGUAGE_ANALYZERS.en;
  const analyzerName = config.analyzer;

  // For ICU-based languages, define a custom analyzer with icu_folding
  const usesIcu = analyzerName === 'icu_analyzer';
  const usesPlugin = ['smartcn', 'kuromoji', 'nori'].includes(analyzerName);

  const settings = {
    number_of_shards: 1,
    number_of_replicas: 0,
  };

  // Add custom analyzer with accent folding for built-in analyzers
  if (!usesIcu && !usesPlugin) {
    settings.analysis = {
      analyzer: {
        folding_analyzer: {
          type: analyzerName,
        },
      },
    };
  }

  const textAnalyzer = usesIcu
    ? 'icu_analyzer'
    : usesPlugin
      ? analyzerName
      : 'folding_analyzer';

  return {
    settings,
    mappings: {
      properties: {
        // --- Searchable text fields ---
        title: {
          type: 'text',
          analyzer: textAnalyzer,
          fields: {
            raw: { type: 'keyword' },
          },
          boost: 3,
        },
        description: {
          type: 'text',
          analyzer: textAnalyzer,
          boost: 2,
        },
        body: {
          type: 'text',
          analyzer: textAnalyzer,
        },

        // --- Exact-match / filter fields ---
        articleId: { type: 'keyword' },
        slug: { type: 'keyword' },
        source: { type: 'keyword' },
        category: { type: 'keyword' },
        region: { type: 'keyword' },
        lang: { type: 'keyword' },
        url: { type: 'keyword', index: false },
        image: { type: 'keyword', index: false },
        author: { type: 'keyword' },
        sectionId: { type: 'keyword' },
        tags: { type: 'keyword' },
        mood: { type: 'keyword' },

        // --- Date and numeric fields ---
        date: { type: 'date' },
        createdAt: { type: 'date' },
        ttl: { type: 'long' },
      },
    },
  };
}

/**
 * Get the index name for a language code.
 */
export function indexName(lang) {
  return `articles-${lang || 'en'}`;
}

/**
 * Get all supported language codes.
 */
export function supportedLanguages() {
  return Object.keys(LANGUAGE_ANALYZERS);
}
