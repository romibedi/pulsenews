# Text-to-Speech Audio System

PulseNewsToday pre-generates MP3 audio for every ingested article using Microsoft Edge TTS, supporting 40+ languages with regional English accents. Audio files are uploaded to S3 and served via CloudFront. The frontend audio player supports queue management, speed control, sleep timer, progress memory, and MediaSession integration.

## Edge TTS Generation (`server/tts/generate.js`)

### generateAndUpload(article, { force })

**Core flow** (lines 112-167):

1. Build S3 key: `audio/{lang}/{slug}.mp3`
2. Check if audio already exists in S3 (skip unless `force`)
3. Build text: `{title}. {body}` truncated to 2000 characters
4. Select voice: regional English accent if applicable, otherwise language voice
5. Generate audio via `edge-tts-universal` with `+20%` speed boost
6. 30-second timeout via `Promise.race`
7. Upload to S3 with `CacheControl: 'public, max-age=7776000'` (90 days)

```js
const comm = new Communicate(text, { voice, rate: '+20%' });
const chunks = [];
for await (const chunk of comm.stream()) {
  if (chunk.type === 'audio' && chunk.data) {
    chunks.push(chunk.data);
  }
}
return Buffer.concat(chunks);
```

Minimum buffer size: 100 bytes (rejects empty/failed generation).

### generateBatch(articles, concurrency = 20)

Custom concurrency-limited batch processor. Called at the end of each ingestion run with all newly ingested articles. Default concurrency: 20 simultaneous TTS generations.

## Language Voice Map

**File**: `server/tts/generate.js`, lines 17-68

47 language voices defined in the `VOICES` constant:

| Code | Voice | Language |
|------|-------|----------|
| en | en-IN-NeerjaNeural | English (default Indian) |
| hi | hi-IN-SwaraNeural | Hindi |
| ta | ta-IN-PallaviNeural | Tamil |
| te | te-IN-ShrutiNeural | Telugu |
| bn | bn-IN-TanishaaNeural | Bengali |
| mr | mr-IN-AarohiNeural | Marathi |
| kn | kn-IN-SapnaNeural | Kannada |
| ml | ml-IN-SobhanaNeural | Malayalam |
| gu | gu-IN-DhwaniNeural | Gujarati |
| pa | pa-IN-GurpreetNeural | Punjabi |
| ur | ur-PK-UzmaNeural | Urdu |
| ar | ar-SA-ZariyahNeural | Arabic |
| fa | fa-IR-DilaraNeural | Persian |
| he | he-IL-HilaNeural | Hebrew |
| sw | sw-KE-ZuriNeural | Swahili |
| fr | fr-FR-DeniseNeural | French |
| de | de-DE-KatjaNeural | German |
| es | es-ES-ElviraNeural | Spanish |
| pt | pt-BR-FranciscaNeural | Portuguese (Brazilian) |
| it | it-IT-ElsaNeural | Italian |
| nl | nl-NL-ColetteNeural | Dutch |
| sv | sv-SE-SofieNeural | Swedish |
| tr | tr-TR-EmelNeural | Turkish |
| pl | pl-PL-AgnieszkaNeural | Polish |
| ru | ru-RU-SvetlanaNeural | Russian |
| zh | zh-CN-XiaoxiaoNeural | Chinese |
| ja | ja-JP-NanamiNeural | Japanese |
| ko | ko-KR-SunHiNeural | Korean |
| th | th-TH-PremwadeeNeural | Thai |
| id | id-ID-GadisNeural | Indonesian |
| vi | vi-VN-HoaiMyNeural | Vietnamese |
| ms | ms-MY-YasminNeural | Malay |
| fil | fil-PH-BlessicaNeural | Filipino |
| da | da-DK-ChristelNeural | Danish |
| no | nb-NO-PernilleNeural | Norwegian |
| fi | fi-FI-NooraNeural | Finnish |
| el | el-GR-AthinaNeural | Greek |
| ro | ro-RO-AlinaNeural | Romanian |
| cs | cs-CZ-VlastaNeural | Czech |
| hu | hu-HU-NoemiNeural | Hungarian |
| uk | uk-UA-PolinaNeural | Ukrainian |
| sr | sr-RS-SophieNeural | Serbian |
| bg | bg-BG-KalinaNeural | Bulgarian |
| my | my-MM-NilarNeural | Burmese |
| km | km-KH-SreymomNeural | Khmer |
| si | si-LK-ThiliniNeural | Sinhala |
| ne | ne-NP-HemkalaNeural | Nepali |
| am | am-ET-MekdesNeural | Amharic |
| ha | ha-NG-HasiyaNeural | Hausa |

## Regional English Accents

**Constant**: `EN_REGION_VOICES` at line 71

```js
const EN_REGION_VOICES = {
  us: 'en-US-JennyNeural',
  uk: 'en-GB-SoniaNeural',
  australia: 'en-AU-NatashaNeural',
  india: 'en-IN-NeerjaNeural',
  europe: 'en-GB-SoniaNeural',
};
```

Voice selection logic (line 131):
```js
const voice = (lang === 'en' && EN_REGION_VOICES[article.region])
  || VOICES[lang]
  || VOICES.en;
```

English articles from the US region get `en-US-JennyNeural`, from UK get `en-GB-SoniaNeural`, etc.

## S3 Storage and CloudFront Serving

### S3 Key Format
```
audio/{lang}/{slug}.mp3
```
Examples:
- `audio/en/2026-03-23-headline-text.mp3`
- `audio/hi/2026-03-23-some-hindi-headline.mp3`

### S3 Bucket Configuration (`infra/s3.tf`)
- Bucket: `pulsenews-audio-{env}` (default: `pulsenews-audio-prod`)
- Lifecycle: 90-day automatic expiry
- Public access: fully blocked
- Access: CloudFront OAC (Origin Access Control) with SigV4

### CloudFront Configuration (`infra/cloudfront.tf`)
- Path pattern: `/audio/*`
- Origin: S3 bucket with OAC
- Cache policy: `static_assets` (default TTL 86400, max TTL 31536000)
- Compression: disabled (audio/mpeg doesn't benefit)

### Public URL Format
```
https://pulsenewstoday.com/audio/{lang}/{slug}.mp3
```

## TTS Backfill Script

**File**: `server/tts/backfill.js`

Standalone script to generate audio for all existing articles that are missing TTS files.

### Usage
```bash
node server/tts/backfill.js [--concurrency 30] [--limit 5000] [--force]
```

### Flow
1. Paginates through all `PK = SITEMAP` entries in DynamoDB
2. For each article: checks if `audio/{lang}/{slug}.mp3` exists in S3
3. If missing: looks up the article's region via `articleId-index` to select the correct English accent
4. Generates audio with `generateAndUpload()`
5. Processes in batches matching the concurrency limit

### Region Lookup for Backfill
```js
async function lookupArticleRegion(articleId) {
  // Queries articleId-index for up to 5 items
  // Prefers REGION# partition items for actual region info
  // Returns { region, body }
}
```

This ensures English articles get the correct regional accent even when backfilling.

## Frontend Audio Player Integration

### AudioContext (`src/contexts/AudioContext.jsx`)

The `AudioProvider` wraps the entire app and provides:

| Feature | Description |
|---------|-------------|
| `playArticle(article)` | Start playback with cascading source selection |
| `pause()` / `resume()` | Pause/resume current playback |
| `stop()` | Stop and clear all state |
| `addToQueue(article)` | Add to playback queue (deduped by ID) |
| `removeFromQueue(id)` | Remove from queue |
| `clearQueue()` | Clear entire queue |
| `changeSpeed(rate)` | Set playback speed (applies to current + future) |
| `seekTo(pct)` | Seek to percentage position |
| `skipForward(15)` / `skipBackward(15)` | Skip 15 seconds |
| `setSleepTimer(minutes)` | Timer-based or end-of-article sleep |
| `downloadAudio(article)` | Download MP3 file |

### Audio Source Cascade

When `playArticle()` is called (line 251):

1. **Prefetch cache**: If the article was prefetched, use the cached `Audio` element
2. **Pre-generated audio**: Try `/audio/{lang}/{slug}.mp3` (S3 via CloudFront)
3. **Server-generated fallback**: Try `/api/tts?text=...&lang=...&region=...`
4. **POST fallback**: For long texts, POST to `/api/tts`
5. **Browser Web Speech API**: Last resort, uses `speechSynthesis` with region-aware locale

### Prefetching
```js
const prefetchArticle = useCallback((article) => {
  // Creates a hidden Audio element with preload='auto'
  // Cached for 30 seconds in prefetchCache Map
  // First tries pre-generated URL, falls back to API URL on error
});
```

### Progress Memory
Saved to `localStorage` under key `pulsenews-audio-progress`:
```js
{ [articleId]: { position: 45.2, duration: 120.5, timestamp: 1711152000000 } }
```
- Saved every 5 seconds during playback
- Pruned after 30 days
- Resumed on replay if position > 5 seconds and < duration - 5 seconds
- Cleared on article completion

### MediaSession Integration
Sets `navigator.mediaSession.metadata` with article title, source, and image for OS-level media controls (lock screen, notification shade). Action handlers for play, pause, seek, next track, and stop.

### Sleep Timer
Two modes:
- **Timed**: `setSleepTimer(15)` -- stops after N minutes
- **End of article**: `setSleepTimer('end')` -- stops after current article finishes (won't auto-play next)

### Browser TTS Locale Mapping

```js
const localeMap = {
  'en:india': 'en-IN', 'en:us': 'en-US', 'en:uk': 'en-GB', 'en:australia': 'en-AU',
  'es:latam': 'es-MX', 'pt:latam': 'pt-BR', 'pt:europe': 'pt-PT',
  'ar:middle-east': 'ar-SA', 'ar:africa': 'ar-EG', 'zh:asia': 'zh-CN',
};
```

Voice selection prefers Google/Neural/Enhanced voices when available.
