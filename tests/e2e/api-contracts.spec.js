// @ts-check
import { test, expect } from '@playwright/test';

const REGIONS = ['india', 'uk', 'us', 'australia', 'middle-east', 'europe', 'africa', 'asia', 'latam'];
const CATEGORIES = ['world', 'technology', 'business', 'sport', 'science', 'culture', 'environment', 'politics'];

// ─── Global feeds ────────────────────────────────────────────────────

test.describe('API: Global feeds', () => {
  for (const cat of CATEGORIES) {
    test(`/api/feeds?category=${cat} returns articles`, async ({ request }, testInfo) => {
      const res = await request.get(`/api/feeds?category=${cat}`);
      expect(res.status()).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('articles');
      expect(Array.isArray(data.articles)).toBe(true);

      // Attach summary to report
      const summary = {
        status: res.status(),
        articleCount: data.articles.length,
        sampleTitles: data.articles.slice(0, 3).map((a) => a.title),
      };
      await testInfo.attach('Response summary', {
        body: JSON.stringify(summary, null, 2),
        contentType: 'application/json',
      });

      if (data.articles.length > 0) {
        const a = data.articles[0];
        expect(a).toHaveProperty('title');
        expect(a).toHaveProperty('id');
        expect(typeof a.title).toBe('string');
        expect(a.title.length).toBeGreaterThan(0);
      }
    });
  }
});

// ─── Regional feeds (all 9 regions) ──────────────────────────────────

test.describe('API: Regional feeds', () => {
  for (const region of REGIONS) {
    test(`/api/regional-feeds?region=${region}&category=world returns articles`, async ({ request }, testInfo) => {
      const res = await request.get(`/api/regional-feeds?region=${region}&category=world`);
      expect(res.status()).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('articles');
      expect(Array.isArray(data.articles)).toBe(true);
      expect(data.articles.length).toBeGreaterThan(0);

      const summary = {
        status: res.status(),
        region,
        articleCount: data.articles.length,
        sampleTitles: data.articles.slice(0, 3).map((a) => a.title),
        firstArticle: { title: data.articles[0].title, slug: data.articles[0].slug },
      };
      await testInfo.attach('Response summary', {
        body: JSON.stringify(summary, null, 2),
        contentType: 'application/json',
      });

      const a = data.articles[0];
      expect(a).toHaveProperty('title');
      expect(a).toHaveProperty('slug');
    });
  }
});

// ─── Language feeds ──────────────────────────────────────────────────

const LANGUAGES_WITH_CONTENT = ['en', 'hi', 'es', 'fr', 'ar', 'de', 'pt', 'ta'];

test.describe('API: Language feeds', () => {
  for (const lang of LANGUAGES_WITH_CONTENT) {
    test(`/api/lang-feeds?lang=${lang} returns data`, async ({ request }, testInfo) => {
      const res = await request.get(`/api/lang-feeds?lang=${lang}`);
      expect([200, 404]).toContain(res.status());

      const summary = { status: res.status(), lang };
      if (res.status() === 200) {
        const data = await res.json();
        expect(data).toHaveProperty('articles');
        summary.articleCount = data.articles.length;
        summary.sampleTitles = data.articles.slice(0, 3).map((a) => a.title);
      }
      await testInfo.attach('Response summary', {
        body: JSON.stringify(summary, null, 2),
        contentType: 'application/json',
      });
    });
  }
});

// ─── Search ──────────────────────────────────────────────────────────

test.describe('API: Search', () => {
  test('search returns results for common term', async ({ request }, testInfo) => {
    const res = await request.get('/api/search?q=technology&size=5');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('articles');
    expect(data.articles.length).toBeGreaterThan(0);

    await testInfo.attach('Search results', {
      body: JSON.stringify({
        query: 'technology',
        resultCount: data.articles.length,
        titles: data.articles.map((a) => a.title),
      }, null, 2),
      contentType: 'application/json',
    });
  });

  test('search with empty query returns error or empty', async ({ request }, testInfo) => {
    const res = await request.get('/api/search?q=');
    expect([200, 400]).toContain(res.status());
    await testInfo.attach('Response', {
      body: `Status: ${res.status()}`,
      contentType: 'text/plain',
    });
  });
});

// ─── Health check ────────────────────────────────────────────────────

test('API: health check', async ({ request }, testInfo) => {
  const res = await request.get('/api/health');
  expect(res.status()).toBe(200);
  const data = await res.json();
  expect(data.status).toBe('ok');

  await testInfo.attach('Health response', {
    body: JSON.stringify(data, null, 2),
    contentType: 'application/json',
  });
});
