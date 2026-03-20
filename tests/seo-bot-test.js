/**
 * SEO Bot Test Suite
 *
 * Tests what search engines and social crawlers actually see
 * when they visit PulseNewsToday.
 *
 * Usage:
 *   node tests/seo-bot-test.js
 *   node tests/seo-bot-test.js https://localhost:8080   # test local
 */

const BASE_URL = process.argv[2] || 'https://www.pulsenewstoday.com';

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, testName) {
  if (condition) {
    passed++;
    console.log(`  \x1b[32m✓\x1b[0m ${testName}`);
  } else {
    failed++;
    failures.push(testName);
    console.log(`  \x1b[31m✗\x1b[0m ${testName}`);
  }
}

async function fetchAsBot(url, bot = 'Googlebot') {
  const res = await fetch(url, { headers: { 'User-Agent': bot } });
  const html = await res.text();
  return { status: res.status, html, headers: res.headers };
}

// ---------- Test Suites ----------

async function testHomepage() {
  console.log('\n\x1b[1m== Homepage (Googlebot) ==\x1b[0m');
  const { status, html } = await fetchAsBot(`${BASE_URL}/`);

  assert(status === 200, 'Returns 200');
  assert(html.includes('<title>PulseNewsToday'), 'Has title tag');
  assert(html.includes('<meta name="description"'), 'Has meta description');
  assert(html.includes('<link rel="canonical" href="https://pulsenewstoday.com"'), 'Has canonical URL');

  // Open Graph
  assert(html.includes('og:title'), 'Has og:title');
  assert(html.includes('og:description'), 'Has og:description');
  assert(html.includes('og:type" content="website"'), 'og:type is website');
  assert(html.includes('og:url'), 'Has og:url');
  assert(html.includes('og:image'), 'Has og:image');
  assert(html.includes('og:site_name" content="PulseNewsToday"'), 'Has og:site_name');

  // Twitter Card
  assert(html.includes('twitter:card" content="summary_large_image"'), 'Has twitter:card');
  assert(html.includes('twitter:title'), 'Has twitter:title');
  assert(html.includes('twitter:image'), 'Has twitter:image');

  // JSON-LD
  assert(html.includes('"@type":"WebSite"'), 'Has WebSite JSON-LD');
  assert(html.includes('"@type":"BreadcrumbList"'), 'Has BreadcrumbList JSON-LD');
  assert(html.includes('SearchAction'), 'Has SearchAction in JSON-LD');

  // Article content (critical fix)
  assert(html.includes('Latest Headlines'), 'Has "Latest Headlines" section');
  assert((html.match(/<article /g) || []).length >= 5, 'Has at least 5 article cards');
  assert(html.includes('/news/'), 'Article cards link to /news/ URLs');
  assert(html.includes('<img '), 'Article cards have images');

  // Categories
  assert(html.includes('/category/world'), 'Links to world category');
  assert(html.includes('/category/technology'), 'Links to technology category');
}

async function testArticlePage() {
  console.log('\n\x1b[1m== Article Page (Googlebot) ==\x1b[0m');

  // First get a real article slug from the homepage
  const { html: homeHtml } = await fetchAsBot(`${BASE_URL}/`);
  const slugMatch = homeHtml.match(/\/news\/([\w-]+)/);
  if (!slugMatch) {
    console.log('  \x1b[33m⚠ Could not find article slug on homepage, skipping\x1b[0m');
    return;
  }
  const slug = slugMatch[1];
  console.log(`  Testing: /news/${slug}`);

  const { status, html } = await fetchAsBot(`${BASE_URL}/news/${slug}`);

  assert(status === 200, 'Returns 200');
  assert(html.includes('<title>') && html.includes('| PulseNewsToday</title>'), 'Title ends with | PulseNewsToday');
  assert(html.includes('<meta name="description"'), 'Has meta description');
  assert(html.includes(`/news/${slug}`), 'Canonical URL contains slug');

  // Open Graph - article specific
  assert(html.includes('og:type" content="article"'), 'og:type is article');
  assert(html.includes('article:published_time'), 'Has article:published_time');

  // Twitter Card
  assert(html.includes('twitter:card" content="summary_large_image"'), 'Has twitter:card');

  // JSON-LD
  assert(html.includes('"@type":"NewsArticle"'), 'Has NewsArticle JSON-LD');
  assert(html.includes('"headline"'), 'JSON-LD has headline');
  assert(html.includes('"datePublished"'), 'JSON-LD has datePublished');
  assert(html.includes('"publisher"'), 'JSON-LD has publisher');
  assert(html.includes('"@type":"BreadcrumbList"'), 'Has BreadcrumbList JSON-LD');

  // Semantic HTML
  assert(html.includes('<article '), 'Wrapped in <article> tag');
  assert(html.includes('itemtype="https://schema.org/NewsArticle"'), 'Has NewsArticle microdata');
  assert(html.includes('itemprop="headline"'), 'h1 has itemprop="headline"');
  assert(html.includes('itemprop="datePublished"'), 'Date has itemprop="datePublished"');
  assert(html.includes('itemprop="articleBody"'), 'Body has itemprop="articleBody"');
  assert(html.includes('aria-label="Breadcrumb"'), 'Has breadcrumb nav');
}

async function testCategoryPage() {
  console.log('\n\x1b[1m== Category Page (Googlebot) ==\x1b[0m');
  const { status, html } = await fetchAsBot(`${BASE_URL}/category/technology`);

  assert(status === 200, 'Returns 200');
  assert(html.includes('<title>Technology News - PulseNewsToday</title>'), 'Has correct title');
  assert(html.includes('canonical" href="https://pulsenewstoday.com/category/technology"'), 'Has canonical URL');
  assert(html.includes('og:title" content="Technology News'), 'Has og:title');
  assert(html.includes('"@type":"BreadcrumbList"'), 'Has BreadcrumbList JSON-LD');
  assert(html.includes('aria-label="Breadcrumb"'), 'Has breadcrumb nav');

  // Article content (critical fix)
  assert((html.match(/<article /g) || []).length >= 5, 'Has at least 5 article cards');
  assert(html.includes('/news/'), 'Article cards link to /news/ URLs');
}

async function testSitemap() {
  console.log('\n\x1b[1m== Sitemap Index ==\x1b[0m');
  const res = await fetch(`${BASE_URL}/api/sitemap.xml`);
  const xml = await res.text();

  assert(res.status === 200, 'Index returns 200');
  assert(res.headers.get('content-type').includes('xml'), 'Content-Type is XML');
  assert(xml.includes('<sitemapindex'), 'Is a sitemap index');
  assert(xml.includes('static.xml'), 'References static sitemap');
  assert(xml.includes('news.xml'), 'References news sitemap');
  // Daily sitemaps: sitemaps/daily/{date}.xml
  assert(xml.includes('/sitemaps/daily/'), 'References daily article sitemaps');

  // Static sitemap
  console.log('\n\x1b[1m== Static Sitemap ==\x1b[0m');
  const staticRes = await fetch(`${BASE_URL}/api/sitemap-static.xml`);
  const staticXml = await staticRes.text();

  assert(staticRes.status === 200, 'Static sitemap returns 200');
  assert(staticXml.includes('pulsenewstoday.com/</loc>'), 'Includes homepage');
  assert(staticXml.includes('/category/world'), 'Includes world category');
  assert(staticXml.includes('/category/ai'), 'Includes AI category');
  assert(staticXml.includes('/category/cricket'), 'Includes cricket category');
  assert(staticXml.includes('/region/india'), 'Includes India region');
  assert(staticXml.includes('/region/uk'), 'Includes UK region');
  assert(staticXml.includes('/about'), 'Includes about page');
  assert(staticXml.includes('/archive'), 'Includes archive page');

  // News sitemap
  console.log('\n\x1b[1m== News Sitemap ==\x1b[0m');
  const newsRes = await fetch(`${BASE_URL}/api/sitemap-news.xml`);
  const newsXml = await newsRes.text();

  assert(newsRes.status === 200, 'News sitemap returns 200');
  assert(newsXml.includes('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"'), 'Has Google News namespace');
  assert(newsXml.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'), 'Has Image namespace');
  assert(newsXml.includes('<news:publication>'), 'Has news:publication');
  assert(newsXml.includes('<news:name>PulseNewsToday</news:name>'), 'Publication name is PulseNewsToday');
  assert(newsXml.includes('<news:language>'), 'Has news:language');
  assert(newsXml.includes('<news:publication_date>'), 'Has news:publication_date');
  assert(newsXml.includes('<news:title>'), 'Has news:title');
  assert(newsXml.includes('<news:keywords>'), 'Has news:keywords');
  assert(newsXml.includes('/news/'), 'Includes article URLs');

  const urlCount = (newsXml.match(/<url>/g) || []).length;
  assert(urlCount >= 20, `Has ${urlCount} article URLs (expected 20+)`);

  // Daily articles sitemap (today)
  console.log('\n\x1b[1m== Daily Articles Sitemap ==\x1b[0m');
  const today = new Date().toISOString().slice(0, 10);
  const artRes = await fetch(`${BASE_URL}/api/sitemap-articles-${today}.xml`);
  const artXml = await artRes.text();

  assert(artRes.status === 200, `Daily sitemap for ${today} returns 200`);
  assert(artXml.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'), 'Has Image namespace');
  assert(artXml.includes('/news/'), 'Includes article URLs');

  const artCount = (artXml.match(/<url>/g) || []).length;
  console.log(`  Total articles for ${today}: ${artCount}`);
  assert(artCount >= 10, `Has ${artCount} article URLs (expected 10+)`);
}

async function testRobotsTxt() {
  console.log('\n\x1b[1m== robots.txt ==\x1b[0m');
  const res = await fetch(`${BASE_URL}/robots.txt`);
  const text = await res.text();

  assert(res.status === 200, 'Returns 200');
  assert(text.includes('User-agent: *'), 'Has wildcard user-agent');
  assert(text.includes('Allow: /'), 'Allows root');
  assert(text.includes('Disallow: /api/'), 'Blocks /api/');
  assert(text.includes('Sitemap:'), 'References sitemap');
  assert(text.includes('sitemap.xml'), 'Sitemap URL points to sitemap.xml');

  // AI crawlers
  assert(text.includes('GPTBot'), 'Mentions GPTBot');
  assert(text.includes('ClaudeBot'), 'Mentions ClaudeBot');
  assert(text.includes('PerplexityBot'), 'Mentions PerplexityBot');
}

async function testIndexNow() {
  console.log('\n\x1b[1m== IndexNow ==\x1b[0m');
  // The key file should be accessible at the root
  const res = await fetch(`${BASE_URL}/2e06266d797d41ad8e5a6fa3795157e6.txt`);
  assert(res.status === 200, 'IndexNow key file returns 200');
  const text = await res.text();
  assert(text.trim() === '2e06266d797d41ad8e5a6fa3795157e6', 'Key file contains correct key');
}

async function testLlmsTxt() {
  console.log('\n\x1b[1m== llms.txt ==\x1b[0m');
  const res = await fetch(`${BASE_URL}/llms.txt`);
  assert(res.status === 200, 'llms.txt returns 200');
  const text = await res.text();
  assert(text.includes('PulseNewsToday'), 'Contains site name');
  assert(text.includes('/news/'), 'Documents article URL pattern');
  assert(text.includes('sitemap'), 'References sitemap');
}

async function testSocialBots() {
  console.log('\n\x1b[1m== Facebook Bot ==\x1b[0m');
  const { status, html } = await fetchAsBot(`${BASE_URL}/`, 'facebookexternalhit/1.1');
  assert(status === 200, 'Returns 200');
  assert(html.includes('og:title'), 'Facebook sees og:title');
  assert(html.includes('og:image'), 'Facebook sees og:image');
  assert(html.includes('og:description'), 'Facebook sees og:description');
  assert((html.match(/<article /g) || []).length >= 5, 'Facebook sees article content');

  console.log('\n\x1b[1m== Twitter Bot ==\x1b[0m');
  const tw = await fetchAsBot(`${BASE_URL}/`, 'Twitterbot/1.0');
  assert(tw.status === 200, 'Returns 200');
  assert(tw.html.includes('twitter:card'), 'Twitter sees twitter:card');
  assert(tw.html.includes('twitter:title'), 'Twitter sees twitter:title');
  assert(tw.html.includes('twitter:image'), 'Twitter sees twitter:image');

  console.log('\n\x1b[1m== LinkedIn Bot ==\x1b[0m');
  const li = await fetchAsBot(`${BASE_URL}/`, 'LinkedInBot/1.0');
  assert(li.status === 200, 'Returns 200');
  assert(li.html.includes('og:title'), 'LinkedIn sees og:title');

  console.log('\n\x1b[1m== WhatsApp ==\x1b[0m');
  const wa = await fetchAsBot(`${BASE_URL}/`, 'WhatsApp/2.0');
  assert(wa.status === 200, 'Returns 200');
  assert(wa.html.includes('og:title'), 'WhatsApp sees og:title');
  assert(wa.html.includes('og:image'), 'WhatsApp sees og:image');
}

async function testRegularUser() {
  console.log('\n\x1b[1m== Regular User ==\x1b[0m');
  // Test against App Runner directly (bypasses CloudFront cache)
  const directUrl = BASE_URL.replace('www.pulsenewstoday.com', 'hxnxpdps62.eu-west-1.awsapprunner.com')
    .replace('pulsenewstoday.com', 'hxnxpdps62.eu-west-1.awsapprunner.com');
  const testUrl = directUrl !== BASE_URL ? directUrl : BASE_URL;
  const res = await fetch(`${testUrl}/`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    redirect: 'manual',
  });
  const html = await res.text();

  assert(res.status === 200, 'Returns 200');
  // When hitting App Runner directly, regular users should get SPA
  // Through CloudFront, cached SSR may be served (acceptable behavior)
  if (testUrl !== BASE_URL) {
    assert(html.includes('<div id="root">'), 'Gets React SPA shell (direct)');
    assert(!html.includes('itemprop="headline"'), 'Does NOT get article microdata (direct)');
  } else {
    // Through CDN — either SPA or cached SSR is acceptable
    const isSPA = html.includes('<div id="root">');
    const isSSR = html.includes('Latest Headlines');
    assert(isSPA || isSSR, 'Gets either SPA or cached SSR through CDN');
  }
}

async function testHealthCheck() {
  console.log('\n\x1b[1m== Health Check ==\x1b[0m');
  const res = await fetch(`${BASE_URL}/api/health`);
  const data = await res.json();
  assert(res.status === 200, 'Returns 200');
  assert(data.status === 'ok', 'Status is ok');
}

// ---------- Run ----------

async function run() {
  console.log(`\n\x1b[1mSEO Bot Test Suite\x1b[0m`);
  console.log(`Testing: ${BASE_URL}\n`);

  await testHealthCheck();
  await testHomepage();
  await testArticlePage();
  await testCategoryPage();
  await testSitemap();
  await testRobotsTxt();
  await testIndexNow();
  await testLlmsTxt();
  await testSocialBots();
  await testRegularUser();

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`\x1b[1mResults: \x1b[32m${passed} passed\x1b[0m, \x1b[${failed ? '31' : '32'}m${failed} failed\x1b[0m`);

  if (failures.length > 0) {
    console.log(`\n\x1b[31mFailures:\x1b[0m`);
    failures.forEach((f) => console.log(`  - ${f}`));
  }

  console.log('');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('\n\x1b[31mTest suite error:\x1b[0m', err.message);
  process.exit(1);
});
