import { extract } from '@extractus/article-extractor';

const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000;

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const articleUrl = url.searchParams.get('url');

  if (!articleUrl) {
    return res.status(400).json({ error: 'url param required' });
  }

  const cached = cache.get(articleUrl);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(cached.data);
  }

  try {
    const article = await extract(articleUrl, {}, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PulseNews/1.0)' },
    });

    const result = {
      title: article?.title || '',
      content: article?.content || '',
      text: (article?.content || '').replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ').trim(),
      image: article?.image || '',
      author: article?.author || '',
      published: article?.published || '',
      source: article?.source || '',
    };

    cache.set(articleUrl, { data: result, ts: Date.now() });
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(result);
  } catch (err) {
    return res.status(200).json({ title: '', content: '', text: '', error: err.message });
  }
}
