export function estimateReadingTime(text) {
  if (!text) return 1;
  const clean = text.replace(/<[^>]*>/g, '');
  const words = clean.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}
