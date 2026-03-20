# LLM Lift Ideas — Ingestion-Time AI Features

> What can we unlock by running a single LLM call per article during the 15-minute ingestion cycle?

---

## Tier 1 — Growth Multipliers

### 1. Instant Multi-Language Summaries
Pre-generate 2-3 sentence summaries in all 16 supported languages at ingestion time. Users see instant summaries with zero latency — no waiting for a Claude call on every page view.

- **Why it matters:** Eliminates the biggest UX friction for non-English users. Summary is ready before the user even opens the article.
- **Cost:** ~$1.20/day for 200 articles × 16 languages using Gemini Flash.
- **Growth unlock:** True multilingual-first experience. Most news aggregators only translate headlines — we'd have native-quality summaries.

### 2. Entity Extraction (People, Companies, Places)
Extract named entities from every article: who is mentioned, which companies, which locations.

- **Why it matters:** Powers a "Follow this person" or "Follow this company" feature. Users build a personalized feed around entities they care about, not just categories.
- **Growth unlock:** Sticky personalization. Once a user follows 5+ entities, churn drops dramatically. Also enables "X was mentioned in 12 articles today" notifications.
- **Data model:** Store as a `entities[]` array in DynamoDB, index in OpenSearch for cross-article queries.

### 3. Shareable Quote Cards
Extract the single most impactful or surprising quote from each article. Auto-generate a branded card image (quote + source + PulseNewsToday watermark).

- **Why it matters:** Viral sharing on Twitter/Instagram/WhatsApp. Users share the card, readers tap through to the app.
- **Growth unlock:** Each shared card is a free acquisition channel. News quote cards are among the most-shared content formats on social media.
- **Implementation:** Extract quote at ingestion → generate card via Canvas/Sharp on first request → cache in S3.

---

## Tier 2 — Differentiation

### 4. De-Clickbait Headlines
Generate an honest, factual headline alongside the original. Show both, or let users toggle "honest mode."

- **Why it matters:** Builds massive trust. Users learn they can rely on PulseNewsToday to cut through sensationalism.
- **Growth unlock:** "Honest Headlines" as a brand feature. Shareable comparison screenshots (clickbait vs. honest) go viral on social media.
- **Example:**
  - Original: *"You Won't BELIEVE What Tesla Just Did!"*
  - Honest: *"Tesla cuts Model Y prices by 6% in US and Europe"*

### 5. Question Generation / FAQ Mode
Generate 3-5 natural questions each article answers (e.g., "What happened?", "Who is affected?", "What happens next?").

- **Why it matters:** Two huge unlocks:
  1. **Quiz Mode** — gamify news reading. "Test yourself" after reading. Drives engagement and retention.
  2. **SEO FAQ Rich Snippets** — Google surfaces FAQ schema in search results. Free organic traffic.
- **Growth unlock:** Quiz mode increases time-on-site. FAQ snippets capture featured snippet positions in Google.
- **Data model:** Store as `questions[]` array, render as expandable FAQ accordion on article page.

### 6. Controversy / Polarization Score
Rate each article 0-100 on how controversial or polarizing the topic is.

- **Why it matters:** Powers multiple features:
  - **"Hot Takes" feed** — surface the most debated stories
  - **Debate Mode** — show pro/con arguments side by side
  - **Content warnings** — flag highly polarizing content
  - **Mood filter integration** — "Show me calm news only" filters out high-controversy articles
- **Growth unlock:** "Hot Takes" feed is inherently engaging and shareable. Debate mode creates a unique reading experience no competitor offers.

---

## Tier 3 — B2B / Premium

### 7. Entity Sentiment Tracking
Track how each entity (person, company) is portrayed across all sources. Is Elon Musk covered positively by TechCrunch but negatively by NYT today?

- **Why it matters:** This is a media monitoring product hiding inside a consumer news app.
- **Growth unlock:** B2B revenue stream. PR teams, investor relations, and brand managers pay $500-5000/month for this data. Build the consumer app first, extract the B2B product from the same data.
- **Implementation:** Entity extraction + sentiment per mention → aggregate into daily entity sentiment scores → dashboard.

### 8. Prediction Extraction
Identify claims and predictions in articles ("Analysts expect the Fed to cut rates in Q3", "Tesla aims to deliver 2M vehicles this year").

- **Why it matters:** Track predictions over time → "Did this come true?" scoreboard for analysts, companies, and pundits.
- **Growth unlock:** "Prediction tracker" is a unique feature no news app offers. Users return to check outcomes. Creates longitudinal engagement (users come back weeks/months later).
- **Implementation:** Extract prediction + entity + date → store with `resolved: null` → periodic re-evaluation.

---

## Architecture: Unified Extraction Pipeline

All of the above can be extracted in a **single LLM call per article**. The marginal cost of additional fields is near-zero because input tokens (the article) are already paid for — you're only adding output tokens.

### Single-Call Prompt Structure

```
Analyze this news article and return JSON:
{
  "mood": "uplifting|neutral|investigative|breaking",
  "entities": [{"name": "...", "type": "person|company|place", "sentiment": -1 to 1}],
  "best_quote": "...",
  "honest_headline": "...",
  "questions": ["...", "...", "..."],
  "controversy_score": 0-100,
  "predictions": [{"claim": "...", "entity": "...", "target_date": "..."}],
  "summary_en": "2-3 sentence summary"
}

Title: {title}
Article: {body}
```

### Cost Per Article (Single Unified Call)

| Model | Input (1500 tokens) | Output (~300 tokens) | Per Article | Per Day (200 articles) |
|-------|---------------------|----------------------|-------------|------------------------|
| Claude Haiku 4.5 | $0.0015 | $0.00375 | ~$0.005 | ~$1.00 |
| Gemini 2.0 Flash | $0.0001 | $0.00012 | ~$0.0003 | ~$0.06 |
| GPT-4o mini | $0.00023 | $0.00045 | ~$0.0007 | ~$0.14 |
| Groq (Llama 3.3 70B) | $0.00009 | $0.00009 | ~$0.0002 | ~$0.04 |

> **Bottom line:** Full extraction pipeline costs $0.04–$1.00/day for 200 articles. Even the premium option (Haiku) is ~$30/month.

### Free Alternative: Keyword-Based Mood Classification

For mood alone, skip the LLM entirely:

```javascript
const MOOD_KEYWORDS = {
  uplifting: ['breakthrough', 'record', 'celebrates', 'wins', 'saves', 'hero'],
  investigative: ['exclusive', 'investigation', 'reveals', 'leaked', 'scandal'],
  breaking: ['breaking', 'just in', 'urgent', 'emergency', 'developing'],
};
// Default: 'neutral'
```

This is free and fast but less accurate than LLM classification. Good enough for MVP, upgrade to LLM later.

---

## Priority Recommendation

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| **Now** | Mood classification (already shipped) | Done | Medium |
| **Next** | Entity extraction → Follow feature | Medium | Very High |
| **Next** | De-clickbait headlines | Low | High |
| **Soon** | Multi-language pre-generated summaries | Medium | High |
| **Soon** | Question generation / Quiz mode | Low | Medium |
| **Later** | Quote cards for sharing | Medium | High |
| **Later** | Controversy score | Low | Medium |
| **Future** | Entity sentiment tracking (B2B) | High | Very High (revenue) |
| **Future** | Prediction extraction | High | Medium |

Start with entity extraction + de-clickbait headlines — both are low-to-medium effort with the highest differentiation value. The unified pipeline means adding more fields later is nearly free.
