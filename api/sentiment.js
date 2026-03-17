// Vercel serverless function — calls Claude API for sentiment analysis
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  const { articles } = req.body;
  if (!articles || !Array.isArray(articles)) return res.status(400).json({ error: 'articles array required' });

  // Build a prompt with article titles
  const titles = articles.slice(0, 20).map((a, i) => `${i + 1}. [${a.section || 'general'}] ${a.title}`).join('\n');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Analyze the sentiment of these news headlines. For each, rate sentiment as a number from -1.0 (very negative) to 1.0 (very positive). Return ONLY a JSON array of objects with "index" (1-based) and "score" fields. No explanation.\n\n${titles}`,
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '[]';
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const scores = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    res.json({ scores });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
