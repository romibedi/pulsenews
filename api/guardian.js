export default async function handler(req, res) {
  const { url } = req;
  // Strip the /api/guardian prefix to get the Guardian API path
  const path = url.replace(/^\/api\/guardian/, '') || '/search';
  const guardianUrl = `https://content.guardianapis.com${path}`;

  try {
    const response = await fetch(guardianUrl);
    const data = await response.text();

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
