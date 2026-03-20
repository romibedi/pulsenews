// @ts-check
import { test, expect } from '@playwright/test';

const REGIONS = ['india', 'uk', 'us', 'australia', 'middle-east', 'europe', 'africa', 'asia', 'latam'];

const ALL_LANGUAGES = [
  'en', 'hi', 'ta', 'te', 'bn', 'mr', 'ur',
  'ar', 'fr', 'de', 'es', 'pt', 'zh', 'ja', 'ko', 'sw',
];

// A non-English label that should appear in the Navbar category bar when that language is active
const EXPECTED_WORLD_LABEL = {
  en: 'World',
  hi: 'दुनिया',
  ta: 'உலகம்',
  te: 'ప్రపంచం',
  bn: 'বিশ্ব',
  mr: 'जग',
  ur: 'دنیا',
  ar: 'العالم',
  fr: 'Monde',
  de: 'Welt',
  es: 'Mundo',
  pt: 'Mundo',
  zh: '世界',
  ja: '世界',
  ko: '세계',
  sw: 'Dunia',
};

// ─── Region API coverage ──────────────────────────────────────────────

test.describe('Regions: All 9 regions return content', () => {
  for (const region of REGIONS) {
    test(`/api/regional-feeds?region=${region}&category=world has articles`, async ({ request }, testInfo) => {
      const res = await request.get(`/api/regional-feeds?region=${region}&category=world`);
      expect(res.status()).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('articles');
      expect(Array.isArray(data.articles)).toBe(true);
      expect(data.articles.length).toBeGreaterThan(0);

      await testInfo.attach('Response summary', {
        body: JSON.stringify({
          region,
          articleCount: data.articles.length,
          sampleTitles: data.articles.slice(0, 3).map((a) => a.title),
        }, null, 2),
        contentType: 'application/json',
      });

      const a = data.articles[0];
      expect(a).toHaveProperty('title');
      expect(a).toHaveProperty('slug');
      expect(typeof a.title).toBe('string');
      expect(a.title.length).toBeGreaterThan(0);
    });
  }
});

// ─── Language API coverage ────────────────────────────────────────────

test.describe('Languages: All 16 language feeds respond', () => {
  for (const lang of ALL_LANGUAGES) {
    test(`/api/lang-feeds?lang=${lang} responds without error`, async ({ request }, testInfo) => {
      const res = await request.get(`/api/lang-feeds?lang=${lang}`);
      expect(res.status()).toBeLessThan(500);

      const summary = { lang, status: res.status() };
      if (res.status() === 200) {
        const data = await res.json();
        expect(data).toHaveProperty('articles');
        expect(Array.isArray(data.articles)).toBe(true);
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

// ─── UI language switching ────────────────────────────────────────────

test.describe('Languages: UI translates category labels', () => {
  // Test all 6 languages in a single test to avoid repeated cold page loads
  test('Navbar translates for hi, es, ar, ja, fr, sw', async ({ page }, testInfo) => {
    const SAMPLE_LANGS = ['hi', 'es', 'ar', 'ja', 'fr', 'sw'];
    const results = [];

    // Navigate to a region page (more reliable than homepage which has redirect issues)
    await page.goto('/region/india', { waitUntil: 'domcontentloaded' });

    for (const lang of SAMPLE_LANGS) {
      await page.evaluate((langCode) => {
        localStorage.setItem('pulsenews-lang', JSON.stringify(langCode));
      }, lang);

      await page.reload({ waitUntil: 'domcontentloaded' });

      const expected = EXPECTED_WORLD_LABEL[lang];
      const categoryLink = page.locator(`a, button, span`).filter({ hasText: expected }).first();
      const visible = await categoryLink.isVisible({ timeout: 10000 }).catch(() => false);
      results.push({ lang, expected, found: visible });
      expect(visible, `Expected "${expected}" for lang=${lang}`).toBe(true);
    }

    await testInfo.attach('Language translation results', {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    });
    await testInfo.attach('Final navbar screenshot', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
  });
});

// ─── Region page loads with content ───────────────────────────────────

test.describe('Regions: Region pages render with articles', () => {
  const SAMPLE_REGIONS = ['india', 'us', 'europe', 'asia', 'africa'];

  for (const region of SAMPLE_REGIONS) {
    test(`/region/${region} page loads and shows articles`, async ({ page }, testInfo) => {
      await page.goto(`/region/${region}`, { waitUntil: 'domcontentloaded' });

      const cards = page.locator('article, [class*="card"], [class*="Card"]');
      await expect(cards.first()).toBeVisible({ timeout: 20000 });

      const cardCount = await cards.count();
      await testInfo.attach(`Region page: ${region}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });
      await testInfo.attach('Card count', {
        body: JSON.stringify({ region, visibleCards: cardCount }, null, 2),
        contentType: 'application/json',
      });
    });
  }
});

// ─── Region page language reactivity ──────────────────────────────────

test.describe('Regions: Language change triggers re-fetch', () => {
  test('switching to Hindi on India region page updates category labels', async ({ page }, testInfo) => {
    await page.goto('/region/india', { waitUntil: 'domcontentloaded' });

    await page.evaluate(() => {
      localStorage.setItem('pulsenews-lang', JSON.stringify('en'));
    });
    await page.reload({ waitUntil: 'domcontentloaded' });

    const worldLink = page.locator('a, button, span').filter({ hasText: 'World' }).first();
    await expect(worldLink).toBeVisible({ timeout: 15000 });

    await testInfo.attach('Before: English', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });

    await page.evaluate(() => {
      localStorage.setItem('pulsenews-lang', JSON.stringify('hi'));
    });
    await page.reload({ waitUntil: 'domcontentloaded' });

    const hindiWorldLink = page.locator('a, button, span').filter({ hasText: 'दुनिया' }).first();
    await expect(hindiWorldLink).toBeVisible({ timeout: 15000 });

    await testInfo.attach('After: Hindi', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
  });
});

// ─── Cross-region+language API matrix (sampled) ───────────────────────

test.describe('Matrix: Region + Language API combinations', () => {
  const MATRIX = [
    { region: 'india', lang: 'hi' },
    { region: 'us', lang: 'es' },
    { region: 'middle-east', lang: 'ar' },
    { region: 'europe', lang: 'fr' },
    { region: 'africa', lang: 'sw' },
    { region: 'asia', lang: 'ja' },
    { region: 'latam', lang: 'pt' },
  ];

  for (const { region, lang } of MATRIX) {
    test(`/api/regional-feeds region=${region} + lang=${lang}`, async ({ request }, testInfo) => {
      const res = await request.get(
        `/api/regional-feeds?region=${region}&category=world&lang=${lang}`
      );
      expect(res.status()).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('articles');
      expect(Array.isArray(data.articles)).toBe(true);
      expect(data.articles.length).toBeGreaterThan(0);

      await testInfo.attach('Response summary', {
        body: JSON.stringify({
          region,
          lang,
          articleCount: data.articles.length,
          sampleTitles: data.articles.slice(0, 3).map((a) => a.title),
        }, null, 2),
        contentType: 'application/json',
      });
    });
  }
});
