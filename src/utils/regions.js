// Map Guardian section IDs and common keywords to geographic coordinates
const REGION_MAP = {
  'us-news': { lat: 39.8, lng: -98.5, label: 'United States' },
  'uk-news': { lat: 54.0, lng: -2.0, label: 'United Kingdom' },
  'australia-news': { lat: -25.3, lng: 133.8, label: 'Australia' },
  'world': { lat: 20.0, lng: 0.0, label: 'World' },
  'europe': { lat: 50.0, lng: 10.0, label: 'Europe' },
  'asia': { lat: 34.0, lng: 100.0, label: 'Asia' },
  'africa': { lat: 1.0, lng: 20.0, label: 'Africa' },
  'americas': { lat: 14.0, lng: -80.0, label: 'Americas' },
  'middle-east': { lat: 29.0, lng: 42.0, label: 'Middle East' },
};

const KEYWORD_REGIONS = [
  { keywords: ['china', 'beijing', 'chinese'], coords: { lat: 35.0, lng: 105.0, label: 'China' } },
  { keywords: ['russia', 'moscow', 'russian', 'kremlin'], coords: { lat: 61.5, lng: 105.3, label: 'Russia' } },
  { keywords: ['india', 'delhi', 'mumbai', 'indian'], coords: { lat: 20.6, lng: 79.0, label: 'India' } },
  { keywords: ['japan', 'tokyo', 'japanese'], coords: { lat: 36.2, lng: 138.2, label: 'Japan' } },
  { keywords: ['germany', 'berlin', 'german'], coords: { lat: 51.2, lng: 10.4, label: 'Germany' } },
  { keywords: ['france', 'paris', 'french', 'macron'], coords: { lat: 46.6, lng: 2.2, label: 'France' } },
  { keywords: ['brazil', 'brazilian'], coords: { lat: -14.2, lng: -51.9, label: 'Brazil' } },
  { keywords: ['ukraine', 'kyiv', 'ukrainian', 'zelenskyy'], coords: { lat: 48.4, lng: 31.2, label: 'Ukraine' } },
  { keywords: ['israel', 'gaza', 'palestinian', 'hamas', 'netanyahu'], coords: { lat: 31.0, lng: 34.9, label: 'Israel/Palestine' } },
  { keywords: ['iran', 'tehran', 'iranian'], coords: { lat: 32.4, lng: 53.7, label: 'Iran' } },
  { keywords: ['syria', 'damascus', 'syrian'], coords: { lat: 35.0, lng: 38.5, label: 'Syria' } },
  { keywords: ['turkey', 'istanbul', 'ankara', 'erdogan'], coords: { lat: 39.0, lng: 35.2, label: 'Turkey' } },
  { keywords: ['south korea', 'seoul', 'korean'], coords: { lat: 35.9, lng: 127.8, label: 'South Korea' } },
  { keywords: ['canada', 'toronto', 'ottawa', 'canadian'], coords: { lat: 56.1, lng: -106.3, label: 'Canada' } },
  { keywords: ['mexico', 'mexican'], coords: { lat: 23.6, lng: -102.5, label: 'Mexico' } },
  { keywords: ['nigeria', 'lagos'], coords: { lat: 9.1, lng: 8.7, label: 'Nigeria' } },
  { keywords: ['south africa', 'johannesburg', 'cape town'], coords: { lat: -30.6, lng: 22.9, label: 'South Africa' } },
  { keywords: ['egypt', 'cairo', 'egyptian'], coords: { lat: 26.8, lng: 30.8, label: 'Egypt' } },
  { keywords: ['pakistan', 'islamabad', 'pakistani'], coords: { lat: 30.4, lng: 69.3, label: 'Pakistan' } },
  { keywords: ['taiwan', 'taipei'], coords: { lat: 23.7, lng: 121.0, label: 'Taiwan' } },
  { keywords: ['trump', 'biden', 'white house', 'congress', 'washington'], coords: { lat: 38.9, lng: -77.0, label: 'Washington, D.C.' } },
  { keywords: ['london', 'westminster', 'parliament'], coords: { lat: 51.5, lng: -0.1, label: 'London' } },
];

export function getArticleRegion(article) {
  // Check section ID first
  const section = article.sectionId || article.section || '';
  if (REGION_MAP[section]) return REGION_MAP[section];

  // Search title and description for keywords
  const text = `${article.title} ${article.description || ''}`.toLowerCase();
  for (const { keywords, coords } of KEYWORD_REGIONS) {
    if (keywords.some((kw) => text.includes(kw))) return coords;
  }

  return null;
}

export function groupArticlesByRegion(articles) {
  const groups = {};
  for (const article of articles) {
    const region = getArticleRegion(article);
    if (!region) continue;
    const key = `${region.lat},${region.lng}`;
    if (!groups[key]) groups[key] = { ...region, articles: [] };
    groups[key].articles.push(article);
  }
  return Object.values(groups);
}
