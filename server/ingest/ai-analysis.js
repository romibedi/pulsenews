// ---------------------------------------------------------------------------
// AI article analysis — shared by ingestion and enrichment pipelines
//
// Tries Gemini 2.5 Flash first (cheap), falls back to Claude Haiku.
// ---------------------------------------------------------------------------

export const ANALYSIS_DEFAULTS = {
  mood: 'neutral',
  entities: [],
  bestQuote: '',
  honestHeadline: '',
  questions: [],
  controversyScore: 0,
  predictions: [],
};

const ANALYSIS_PROMPT = `Analyze this news article and return ONLY valid JSON (no markdown, no code blocks):
{
  "mood": "uplifting|neutral|investigative|breaking",
  "entities": [{"name": "...", "type": "person|company|place"}],
  "bestQuote": "most impactful direct quote from the article, or empty string if none",
  "honestHeadline": "a factual, de-clickbaited headline",
  "questions": ["what happened?", "who is affected?", "what happens next?"],
  "controversyScore": 0-100,
  "predictions": [{"claim": "...", "entity": "...", "targetDate": "..."}]
}

Rules:
- entities: extract up to 5 key people, companies, or places mentioned
- bestQuote: must be an actual quote from the text with attribution, empty string if no quotes found
- honestHeadline: rewrite the headline to be factual and clear, removing any clickbait
- questions: 3-5 natural questions this article answers
- controversyScore: 0=completely neutral factual, 100=extremely polarizing
- predictions: only include if the article contains forward-looking claims, otherwise empty array`;

/** Call Gemini 2.5 Flash for article analysis (~$0.0003/article). */
async function analyzeWithGemini(title, content) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${ANALYSIS_PROMPT}\n\nTitle: ${title}\n\n${content}` }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 500,
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return raw.trim();
}

/** Call Claude Haiku as fallback (~$0.005/article). */
async function analyzeWithHaiku(title, content) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: `${ANALYSIS_PROMPT}\n\nTitle: ${title}\n\n${content}` }],
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return (data.content?.[0]?.text || '').trim();
}

/**
 * Unified article analysis — tries Gemini Flash first (cheap), falls back to Haiku.
 */
export async function analyzeArticle(title, description, body) {
  const content = (body || description || '').slice(0, 1500);
  if (!content && !title) return { ...ANALYSIS_DEFAULTS };

  try {
    const raw = await analyzeWithGemini(title, content)
      || await analyzeWithHaiku(title, content);

    if (!raw) return { ...ANALYSIS_DEFAULTS };

    let parsed;
    try {
      const jsonStr = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');
      parsed = JSON.parse(jsonStr);
    } catch {
      const moodMatch = raw.match(/\b(uplifting|neutral|investigative|breaking)\b/);
      return { ...ANALYSIS_DEFAULTS, mood: moodMatch?.[1] || 'neutral' };
    }

    const validMoods = ['uplifting', 'neutral', 'investigative', 'breaking'];
    return {
      mood: validMoods.includes(parsed.mood) ? parsed.mood : 'neutral',
      entities: Array.isArray(parsed.entities) ? parsed.entities.slice(0, 5).map(e => ({
        name: String(e.name || ''),
        type: ['person', 'company', 'place'].includes(e.type) ? e.type : 'person',
      })).filter(e => e.name) : [],
      bestQuote: String(parsed.bestQuote || ''),
      honestHeadline: String(parsed.honestHeadline || ''),
      questions: Array.isArray(parsed.questions) ? parsed.questions.slice(0, 5).map(String) : [],
      controversyScore: typeof parsed.controversyScore === 'number' ? Math.min(100, Math.max(0, Math.round(parsed.controversyScore))) : 0,
      predictions: Array.isArray(parsed.predictions) ? parsed.predictions.slice(0, 3).map(p => ({
        claim: String(p.claim || ''),
        entity: String(p.entity || ''),
        targetDate: String(p.targetDate || ''),
      })).filter(p => p.claim) : [],
    };
  } catch {
    return { ...ANALYSIS_DEFAULTS };
  }
}
