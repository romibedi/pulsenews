function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const m = xml.match(re);
  return m ? (m[1] || m[2] || '').trim() : '';
}

function extractImageUrl(itemXml) {
  let m = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/);
  if (m) return m[1];
  m = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/);
  if (m) return m[1];
  m = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/);
  if (m) return m[1];
  m = itemXml.match(/<img[^>]+src=["']([^"']+)["']/);
  if (m) return m[1];
  return null;
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&apos;/g, "'").replace(/&rsquo;/g, '\u2019').replace(/&lsquo;/g, '\u2018').replace(/&mdash;/g, '\u2014').replace(/&ndash;/g, '\u2013').replace(/&hellip;/g, '\u2026').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, (m) => String.fromCharCode(parseInt(m.slice(2, -1)))).trim();
}

async function fetchOgImage(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PulseNews/1.0)' },
      redirect: 'follow',
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    return m ? m[1] : null;
  } catch { return null; }
}

function parseRssFeed(xml, source) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = stripHtml(extractTag(itemXml, 'title'));
    const link = extractTag(itemXml, 'link');
    const description = stripHtml(extractTag(itemXml, 'description'));
    const pubDate = extractTag(itemXml, 'pubDate');
    const image = extractImageUrl(itemXml);
    if (title && link) {
      items.push({
        id: `rss-${Buffer.from(link).toString('base64url')}`,
        title, description, body: '', image,
        author: source,
        date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        section: source, sectionId: source.toLowerCase().replace(/\s+/g, '-'),
        url: link, tags: [], source, isExternal: true,
      });
    }
  }
  return items;
}

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const feedUrl = url.searchParams.get('url');
  const name = url.searchParams.get('name') || 'Custom';

  if (!feedUrl) {
    return res.status(400).json({ error: 'url required' });
  }

  try {
    const feedRes = await fetch(feedUrl, {
      headers: { 'User-Agent': 'PulseNews/1.0' },
    });
    if (!feedRes.ok) return res.status(200).json({ articles: [] });
    const xml = await feedRes.text();
    const articles = parseRssFeed(xml, name);

    // Fetch OG images for articles missing images (up to 10 in parallel)
    const needImage = articles.filter((a) => !a.image).slice(0, 10);
    if (needImage.length > 0) {
      const ogResults = await Promise.all(needImage.map((a) => fetchOgImage(a.url)));
      needImage.forEach((a, i) => { if (ogResults[i]) a.image = ogResults[i]; });
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ articles });
  } catch {
    return res.status(200).json({ articles: [] });
  }
}
