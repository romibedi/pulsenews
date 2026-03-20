// ---------------------------------------------------------------------------
// IndexNow — instant URL submission to Bing, Yandex, Seznam, Naver
//
// Protocol: https://www.indexnow.org/documentation
// Sends newly ingested article URLs so search engines index them immediately
// instead of waiting for the next crawl cycle.
// ---------------------------------------------------------------------------

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '2e06266d797d41ad8e5a6fa3795157e6';
const SITE_URL = process.env.SITE_URL || 'https://www.pulsenewstoday.com';

// IndexNow endpoints — submitting to one notifies all participating engines
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/**
 * Submit a batch of URLs to IndexNow.
 *
 * @param {string[]} urls — absolute URLs to submit (max 10,000 per call)
 * @returns {Promise<{submitted: number, status: number|null}>}
 */
export async function submitUrls(urls) {
  if (!urls || urls.length === 0) return { submitted: 0, status: null };

  // IndexNow accepts max 10,000 URLs per request
  const batch = urls.slice(0, 10_000);

  const payload = {
    host: new URL(SITE_URL).host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: batch,
  };

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });

    console.log(`[indexnow] Submitted ${batch.length} URLs — HTTP ${res.status}`);
    return { submitted: batch.length, status: res.status };
  } catch (err) {
    console.warn(`[indexnow] Submission failed: ${err.message}`);
    return { submitted: 0, status: null };
  }
}

/**
 * Build the canonical PulseNewsToday URL for an article.
 */
export function articleUrl(slug) {
  return `${SITE_URL}/news/${slug}`;
}

/**
 * Ping Google and Bing with the updated sitemap URL.
 * Google deprecated the Ping API in 2023 but still honours it for News sitemaps.
 * This is a lightweight nudge — not guaranteed to trigger immediate crawling.
 */
export async function pingSitemap() {
  const sitemapUrls = [
    `${SITE_URL}/api/sitemap.xml`,
    `${SITE_URL}/api/sitemap-news.xml`,
  ];
  const endpoints = sitemapUrls.flatMap((sitemapUrl) => [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  ]);

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(5000) });
      console.log(`[seo] Sitemap ping ${new URL(url).hostname} — HTTP ${res.status}`);
    } catch (err) {
      console.warn(`[seo] Sitemap ping failed: ${err.message}`);
    }
  }
}

export { INDEXNOW_KEY };
