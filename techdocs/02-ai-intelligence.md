# AI/LLM Intelligence Features

Every ingested article is analyzed by an LLM to extract structured intelligence: mood classification, named entities, honest headlines, best quotes, FAQ-style questions, controversy scoring, and forward-looking predictions. The system uses Gemini 2.5 Flash as the primary model (~$0.0003/article) with Claude Haiku 4.5 as fallback (~$0.005/article).

## AI Analysis Pipeline

**File**: `server/ingest/handler.js`, lines 190-305

### Analysis Flow

```
Article ingested
      |
      v
analyzeArticle(title, description, body)
      |
      +-- Content preparation: (body || description).slice(0, 1500)
      |
      +-- analyzeWithGemini(title, content)   <-- Primary: Gemini 2.5 Flash
      |       |
      |       +-- If null/failed:
      |               |
      |               v
      +-- analyzeWithHaiku(title, content)    <-- Fallback: Claude Haiku 4.5
      |
      +-- Parse JSON response
      |       |
      |       +-- Strip markdown code blocks
      |       +-- JSON.parse()
      |       +-- Fallback: regex mood extraction if JSON fails
      |
      +-- Validate and sanitize all fields
      |
      v
{ mood, entities, bestQuote, honestHeadline, questions, controversyScore, predictions }
```

### The Analysis Prompt

Defined at line 195 of `server/ingest/handler.js`:

```
Analyze this news article and return ONLY valid JSON (no markdown, no code blocks):
{
  "mood": "uplifting|neutral|investigative|breaking",
  "entities": [{"name": "...", "type": "person|company|place"}],
  "bestQuote": "most impactful direct quote from the article, or empty string if none",
  "honestHeadline": "a factual, de-clickbaited headline",
  "questions": ["what happened?", "who is affected?", "what happens next?"],
  "controversyScore": 0-100,
  "predictions": [{"claim": "...", "entity": "...", "targetDate": "..."}]
}
```

### Gemini Flash Integration

**Function**: `analyzeWithGemini()` at line 215

```js
const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${ANALYSIS_PROMPT}\n\nTitle: ${title}\n\n${content}` }] }],
      generationConfig: {
        responseMimeType: 'application/json',  // Force JSON output
        maxOutputTokens: 500,
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 0 },  // Disable chain-of-thought
      },
    }),
  }
);
```

Key config:
- `responseMimeType: 'application/json'` forces structured JSON output
- `thinkingBudget: 0` disables thinking to reduce latency and cost
- `temperature: 0.1` for consistent, factual outputs
- `maxOutputTokens: 500` caps response length
- Env var: `GEMINI_API_KEY`

### Claude Haiku Fallback

**Function**: `analyzeWithHaiku()` at line 240

```js
const res = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{ role: 'user', content: `${ANALYSIS_PROMPT}\n\nTitle: ${title}\n\n${content}` }],
  }),
});
```

- Model: `claude-haiku-4-5-20251001`
- Env var: `ANTHROPIC_API_KEY`

### Validation and Sanitization

At line 284, all parsed fields are validated:

```js
return {
  mood: validMoods.includes(parsed.mood) ? parsed.mood : 'neutral',
  entities: Array.isArray(parsed.entities) ? parsed.entities.slice(0, 5).map(e => ({
    name: String(e.name || ''),
    type: ['person', 'company', 'place'].includes(e.type) ? e.type : 'person',
  })).filter(e => e.name) : [],
  bestQuote: String(parsed.bestQuote || ''),
  honestHeadline: String(parsed.honestHeadline || ''),
  questions: Array.isArray(parsed.questions) ? parsed.questions.slice(0, 5).map(String) : [],
  controversyScore: typeof parsed.controversyScore === 'number'
    ? Math.min(100, Math.max(0, Math.round(parsed.controversyScore))) : 0,
  predictions: Array.isArray(parsed.predictions) ? parsed.predictions.slice(0, 3).map(p => ({
    claim: String(p.claim || ''),
    entity: String(p.entity || ''),
    targetDate: String(p.targetDate || ''),
  })).filter(p => p.claim) : [],
};
```

### Defaults on Failure

```js
const ANALYSIS_DEFAULTS = {
  mood: 'neutral',
  entities: [],
  bestQuote: '',
  honestHeadline: '',
  questions: [],
  controversyScore: 0,
  predictions: []
};
```

## How Results Are Stored

All AI analysis fields are written directly on each DynamoDB item alongside the article content:

```js
items.push({
  PK: pk, SK: `${date}#${article.id}`,
  // ... article fields ...
  mood: analysis.mood,
  entities: analysis.entities,
  bestQuote: analysis.bestQuote,
  honestHeadline: analysis.honestHeadline,
  questions: analysis.questions,
  controversyScore: analysis.controversyScore,
  predictions: analysis.predictions,
});
```

The SITEMAP entry also carries all analysis fields, which flow to OpenSearch via the search indexer Lambda.

## Smart Helpers (Frontend)

**File**: `src/utils/articleHelpers.js`

These functions extract magazine-style content breaks from the article list on the client side, without additional API calls.

### extractSmartPullquote(articles)

Lines 193-228. Scans articles 3-15 for the best quotable text:

1. **Preferred**: Actual quoted speech (curly/straight quotes, 30-180 chars), bonus if `said|told|according` nearby. Score: 15-20.
2. **Fallback**: Punchy leading sentence (30-200 chars). Scored by length and attribution presence.

Returns `{ quote, article }` or null.

### pickTopStory(articles)

Lines 233-255. Selects the highest-signal article for prominent display:

Scoring (articles 1-15):
- Has real image (not logo): +3
- Description > 200 chars: +3; > 100 chars: +1
- Source in `TOP_SOURCES` set (BBC, Reuters, AP, Guardian, NYT, etc.): +5
- Title > 50 chars: +1

Returns article if score >= 5, null otherwise.

### pickPhotoOfDay(articles)

Lines 260-279. Selects the best visual article:

Scoring (articles 0-20):
- Must have real image (not logo)
- Source in `PHOTO_SOURCES` (Reuters, AFP, AP, Guardian, BBC, National Geographic): +5
- Title matches `PHOTO_KEYWORDS` regex (photos, gallery, stunning, etc.): +3
- Long description: +1

### extractStatistic(articles)

Lines 284-306. Regex-based extraction of notable statistics:

```js
const STAT_PATTERNS = [
  /(\$[\d,.]+\s*(?:billion|million|trillion|bn|mn))/i,
  /([\d,.]+%\s*(?:increase|decrease|drop|rise|growth|decline|fall|jump|surge))/i,
  /([\d,]+(?:\.\d+)?\s*(?:million|billion|thousand)\s*(?:people|users|jobs|...))/i,
];
```

Returns `{ stat, context, article }` with surrounding text context.

### getDailyPoll(category)

Lines 390-394. Deterministic daily poll selection:

```js
const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
return polls[dayOfYear % polls.length];
```

Each of the 15 categories has 2-3 poll questions defined in `POLL_QUESTIONS`. The question rotates daily based on day-of-year modulus.

## AI-Powered Elements on the Frontend

### Article Page (`src/pages/Article.jsx`)
- **Honest Headline** (`src/components/HonestHeadline.jsx`): Shows the de-clickbaited headline from `honestHeadline`
- **Best Quote** (`src/components/BestQuote.jsx`): Displays the extracted pull quote from `bestQuote`
- **Entity Badges** (`src/components/EntityBadges.jsx`): Renders person/company/place tags from `entities`
- **Controversy Badge** (`src/components/ControversyBadge.jsx`): Visual indicator from `controversyScore`
- **Prediction Tracker** (`src/components/PredictionTracker.jsx`): Shows forward-looking claims from `predictions`
- **Article FAQ** (`src/components/ArticleFAQ.jsx`): Accordion of questions from `questions`
- **AI Summary** (`src/components/AISummary.jsx`): Mood-aware summary display

### Category/Home Pages (`src/pages/Category.jsx`)
- **Smart Pullquote break**: Uses `extractSmartPullquote()` to insert a magazine-style quote between article chunks
- **Top Story break**: Uses `pickTopStory()` for a prominently displayed article
- **Photo of the Day**: Uses `pickPhotoOfDay()` for a full-width visual feature
- **By the Numbers**: Uses `extractStatistic()` for a data-driven callout
- **Quick Poll**: Uses `getDailyPoll()` for interactive engagement

### Admin Dashboard (`src/pages/Admin.jsx`)
- **LLM Analysis Coverage**: Shows percentage of articles with each AI field populated (mood, honestHeadline, entities, bestQuote, questions, controversyScore, predictions, body, image)
- Sampled from the most recent 1000 SITEMAP entries via `sampleLLMCoverage()` in `server/admin.js`
