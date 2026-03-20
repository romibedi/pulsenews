// @ts-check
import { test, expect } from '@playwright/test';

const GOOGLEBOT_UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

// ─── Homepage bot rendering ──────────────────────────────────────────

test.describe('SEO: Homepage', () => {
  test('Googlebot gets pre-rendered HTML with meta tags', async ({ request }, testInfo) => {
    const res = await request.get('/', { headers: { 'User-Agent': GOOGLEBOT_UA } });
    expect(res.status()).toBe(200);
    const html = await res.text();

    // Extract key meta tags for the report
    const title = html.match(/<title>(.*?)<\/title>/)?.[1] || 'NOT FOUND';
    const ogTitle = html.match(/og:title"?\s+content="([^"]*)"/)?.[1] || 'NOT FOUND';
    const ogDesc = html.match(/og:description"?\s+content="([^"]*)"/)?.[1] || 'NOT FOUND';
    const articleCount = (html.match(/<article/g) || []).length;

    await testInfo.attach('SEO meta tags', {
      body: JSON.stringify({ title, ogTitle, ogDesc, articleCount }, null, 2),
      contentType: 'application/json',
    });

    expect(html).toContain('<title>PulseNewsToday');
    expect(html).toContain('og:title');
    expect(html).toContain('og:description');
    expect(html).toContain('twitter:card');
    expect(html).toContain('"@type":"WebSite"');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('<article');
  });

  test('homepage meta description is clean (no HTML tags)', async ({ request }, testInfo) => {
    const res = await request.get('/', { headers: { 'User-Agent': GOOGLEBOT_UA } });
    const html = await res.text();
    const descMatch = html.match(/name="description"\s+content="([^"]*)"/);
    expect(descMatch).toBeTruthy();
    const desc = descMatch[1];

    await testInfo.attach('Meta description', {
      body: desc,
      contentType: 'text/plain',
    });

    expect(desc).not.toContain('&lt;');
    expect(desc).not.toContain('<a ');
    expect(desc).not.toContain('<ol>');
    expect(desc.length).toBeGreaterThan(20);
  });
});

// ─── Article bot rendering ───────────────────────────────────────────

test.describe('SEO: Article pages', () => {
  let articleSlug;

  test.beforeAll(async ({ request }) => {
    const res = await request.get('/api/feeds?category=world');
    const data = await res.json();
    const article = data.articles?.find((a) => a.slug);
    articleSlug = article?.slug;
  });

  test('article page has clean meta description (no raw HTML)', async ({ request }, testInfo) => {
    test.skip(!articleSlug, 'No article slug found');
    const res = await request.get(`/news/${articleSlug}`, { headers: { 'User-Agent': GOOGLEBOT_UA } });
    expect(res.status()).toBe(200);
    const html = await res.text();

    const descMatch = html.match(/name="description"\s+content="([^"]*)"/);
    expect(descMatch).toBeTruthy();
    const desc = descMatch[1];

    await testInfo.attach('Article meta', {
      body: JSON.stringify({ slug: articleSlug, description: desc }, null, 2),
      contentType: 'application/json',
    });

    expect(desc).not.toContain('&lt;ol&gt;');
    expect(desc).not.toContain('&lt;li&gt;');
    expect(desc).not.toContain('&lt;a href');
    expect(desc).not.toContain('&lt;font');
  });

  test('article page has valid JSON-LD NewsArticle', async ({ request }, testInfo) => {
    test.skip(!articleSlug, 'No article slug found');
    const res = await request.get(`/news/${articleSlug}`, { headers: { 'User-Agent': GOOGLEBOT_UA } });
    const html = await res.text();

    const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    expect(jsonLdMatch).toBeTruthy();
    const ld = JSON.parse(jsonLdMatch[1]);

    await testInfo.attach('JSON-LD structured data', {
      body: JSON.stringify(ld, null, 2),
      contentType: 'application/json',
    });

    expect(ld['@type']).toBe('NewsArticle');
    expect(ld).toHaveProperty('headline');
    expect(ld).toHaveProperty('datePublished');
    expect(ld).toHaveProperty('publisher');
    expect(ld.description).not.toContain('<ol>');
    expect(ld.description).not.toContain('<a href');
  });

  test('article page has Open Graph tags', async ({ request }, testInfo) => {
    test.skip(!articleSlug, 'No article slug found');
    const res = await request.get(`/news/${articleSlug}`, { headers: { 'User-Agent': GOOGLEBOT_UA } });
    const html = await res.text();

    const ogType = html.match(/og:type"?\s+content="([^"]*)"/)?.[1] || 'NOT FOUND';
    const ogTitle = html.match(/og:title"?\s+content="([^"]*)"/)?.[1] || 'NOT FOUND';
    const canonical = html.match(/rel="canonical"\s+href="([^"]*)"/)?.[1] || 'NOT FOUND';

    await testInfo.attach('Open Graph tags', {
      body: JSON.stringify({ slug: articleSlug, ogType, ogTitle, canonical }, null, 2),
      contentType: 'application/json',
    });

    expect(html).toContain('og:type" content="article"');
    expect(html).toContain('og:title');
    expect(html).toContain('article:published_time');
    expect(html).toContain('canonical');
  });
});

// ─── Category pages ──────────────────────────────────────────────────

test.describe('SEO: Category pages', () => {
  const cats = ['technology', 'business', 'science'];

  for (const cat of cats) {
    test(`/category/${cat} bot page has proper meta`, async ({ request }, testInfo) => {
      const res = await request.get(`/category/${cat}`, { headers: { 'User-Agent': GOOGLEBOT_UA } });
      expect(res.status()).toBe(200);
      const html = await res.text();

      const title = html.match(/<title>(.*?)<\/title>/)?.[1] || 'NOT FOUND';
      const articleCount = (html.match(/<article/g) || []).length;

      await testInfo.attach('Category page meta', {
        body: JSON.stringify({ category: cat, title, articleCount }, null, 2),
        contentType: 'application/json',
      });

      expect(html).toContain(`<title>`);
      expect(html).toContain('og:description');
      expect(html).toContain('"@type":"BreadcrumbList"');
      expect(html).toContain('<article');
    });
  }
});

// ─── Robots.txt ──────────────────────────────────────────────────────

test('SEO: robots.txt is valid', async ({ request }, testInfo) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  const text = await res.text();

  await testInfo.attach('robots.txt content', {
    body: text,
    contentType: 'text/plain',
  });

  expect(text).toContain('User-agent:');
  expect(text).toContain('Sitemap:');
  expect(text).toContain('sitemap.xml');
  const googlebotBlock = text.match(/User-agent:\s*Googlebot\b[^]*?(?=User-agent:|$)/i)?.[0] || '';
  expect(googlebotBlock).toContain('Allow: /');
  expect(googlebotBlock).not.toMatch(/Disallow:\s*\/\s*$/m);
});

// ─── Sitemaps ────────────────────────────────────────────────────────

test.describe('SEO: Sitemaps', () => {
  test('main sitemap returns valid XML', async ({ request }, testInfo) => {
    const res = await request.get('/api/sitemap.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();

    const urlCount = (xml.match(/<url>/g) || []).length;
    const isSitemapIndex = xml.includes('sitemapindex');

    await testInfo.attach('Sitemap info', {
      body: JSON.stringify({ isSitemapIndex, urlCount, preview: xml.slice(0, 500) }, null, 2),
      contentType: 'application/json',
    });

    expect(xml).toContain('<?xml');
    expect(xml.includes('sitemapindex') || xml.includes('urlset')).toBe(true);
  });

  test('static sitemap returns valid XML with categories', async ({ request }, testInfo) => {
    const res = await request.get('/api/sitemap-static.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();

    const urlCount = (xml.match(/<url>/g) || []).length;
    await testInfo.attach('Static sitemap', {
      body: JSON.stringify({ urlCount, preview: xml.slice(0, 500) }, null, 2),
      contentType: 'application/json',
    });

    expect(xml).toContain('urlset');
    expect(xml).toContain('/category/technology');
    expect(xml).toContain('/category/business');
  });

  test('news sitemap returns valid XML with articles', async ({ request }, testInfo) => {
    const res = await request.get('/api/sitemap-news.xml');
    expect(res.status()).toBe(200);
    const xml = await res.text();

    const newsCount = (xml.match(/news:news>/g) || []).length / 2; // open + close
    await testInfo.attach('News sitemap', {
      body: JSON.stringify({ articleCount: newsCount, preview: xml.slice(0, 500) }, null, 2),
      contentType: 'application/json',
    });

    expect(xml).toContain('urlset');
    expect(xml).toContain('news:news');
    expect(xml).toContain('news:title');
  });
});
