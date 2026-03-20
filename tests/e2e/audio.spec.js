// @ts-check
import { test, expect } from '@playwright/test';

// ─── Pre-generated audio files ───────────────────────────────────────

test.describe('Audio: Pre-generated MP3 files', () => {
  let slugs = [];

  test.beforeAll(async ({ request }) => {
    const regions = ['india', 'us', 'uk'];
    for (const region of regions) {
      const res = await request.get(`/api/regional-feeds?region=${region}&category=world`);
      if (res.status() === 200) {
        const data = await res.json();
        const regionSlugs = (data.articles || [])
          .filter((a) => a.slug)
          .slice(0, 3)
          .map((a) => a.slug);
        slugs.push(...regionSlugs);
      }
    }
  });

  test('at least some audio files exist in S3/CloudFront', async ({ request }, testInfo) => {
    test.skip(slugs.length === 0, 'No article slugs found');

    let found = 0;
    const results = [];
    for (const slug of slugs.slice(0, 10)) {
      // Try with redirects followed (CloudFront may redirect to S3)
      const res = await request.get(`/audio/en/${slug}.mp3`);
      const status = res.status();
      if (status === 200) {
        const contentType = res.headers()['content-type'] || '';
        found++;
        results.push({ slug, status, contentType, hasAudio: true });
      } else {
        results.push({ slug, status, hasAudio: false });
      }
    }

    await testInfo.attach('Audio file check', {
      body: JSON.stringify({
        totalChecked: Math.min(slugs.length, 10),
        found,
        coverage: `${Math.round((found / Math.min(slugs.length, 10)) * 100)}%`,
        details: results,
      }, null, 2),
      contentType: 'application/json',
    });

    expect(found).toBeGreaterThan(0);
  });
});

// ─── TTS API ─────────────────────────────────────────────────────────

test.describe('Audio: TTS API', () => {
  test('/api/tts returns audio for short text', async ({ request }, testInfo) => {
    const text = encodeURIComponent('This is a test of the text to speech system.');
    const res = await request.get(`/api/tts?text=${text}&lang=en`);
    expect(res.status()).toBe(200);
    const contentType = res.headers()['content-type'] || '';
    const body = await res.body();

    await testInfo.attach('TTS response', {
      body: JSON.stringify({
        status: res.status(),
        contentType,
        audioSizeBytes: body.length,
        audioSizeKB: `${(body.length / 1024).toFixed(1)} KB`,
      }, null, 2),
      contentType: 'application/json',
    });

    expect(contentType).toContain('audio');
  });

  test('/api/tts works with different languages', async ({ request }, testInfo) => {
    const tests = [
      { lang: 'en', text: 'Hello world' },
      { lang: 'es', text: 'Hola mundo' },
      { lang: 'hi', text: 'नमस्ते दुनिया' },
    ];

    const results = [];
    for (const { lang, text } of tests) {
      const res = await request.get(`/api/tts?text=${encodeURIComponent(text)}&lang=${lang}`);
      expect(res.status()).toBe(200);
      const ct = res.headers()['content-type'] || '';
      const body = await res.body();
      results.push({ lang, text, status: res.status(), contentType: ct, sizeKB: `${(body.length / 1024).toFixed(1)} KB` });
      expect(ct).toContain('audio');
    }

    await testInfo.attach('Multi-language TTS results', {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    });
  });
});

// ─── Audio player UI ─────────────────────────────────────────────────

test.describe('Audio: Player UI', () => {
  test('article page serves TTS audio endpoint', async ({ request }, testInfo) => {
    // Get an article slug and verify its TTS audio is accessible
    const feedRes = await request.get('/api/feeds?category=world');
    const data = await feedRes.json();
    const article = data.articles?.find((a) => a.slug);
    test.skip(!article, 'No articles found');

    // Verify the article page loads (SSR or SPA shell)
    const pageRes = await request.get(`/news/${article.slug}`);
    expect(pageRes.status()).toBe(200);

    // Verify the TTS endpoint works for this article's text
    const ttsRes = await request.get(`/api/tts?text=${encodeURIComponent(article.title.slice(0, 100))}&lang=en`);
    const ttsStatus = ttsRes.status();
    const contentType = ttsRes.headers()['content-type'] || '';

    await testInfo.attach('Article audio check', {
      body: JSON.stringify({
        slug: article.slug,
        title: article.title,
        pageStatus: pageRes.status(),
        ttsStatus,
        ttsContentType: contentType,
        ttsWorking: ttsStatus === 200 && contentType.includes('audio'),
      }, null, 2),
      contentType: 'application/json',
    });

    expect(ttsStatus).toBe(200);
    expect(contentType).toContain('audio');
  });
});
