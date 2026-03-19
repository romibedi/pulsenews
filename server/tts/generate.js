// ---------------------------------------------------------------------------
// TTS audio pre-generation — runs during article ingestion
//
// Generates Edge TTS audio for each new article and uploads to S3.
// Audio is served via CloudFront at /audio/{lang}/{slug}.mp3
// ---------------------------------------------------------------------------

import { Communicate } from 'edge-tts-universal';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

const BUCKET = process.env.AUDIO_BUCKET || 'pulsenews-audio-prod';
const REGION = process.env.AWS_REGION || 'eu-west-1';

const s3 = new S3Client({ region: REGION });

// Voice map — must match server/app.js TTS_VOICES
const VOICES = {
  en: 'en-IN-NeerjaNeural',
  hi: 'hi-IN-SwaraNeural',
  ta: 'ta-IN-PallaviNeural',
  te: 'te-IN-ShrutiNeural',
  bn: 'bn-IN-TanishaaNeural',
  mr: 'mr-IN-AarohiNeural',
  ur: 'ur-PK-UzmaNeural',
  ar: 'ar-SA-ZariyahNeural',
  fr: 'fr-FR-DeniseNeural',
  de: 'de-DE-KatjaNeural',
  es: 'es-ES-ElviraNeural',
  pt: 'pt-BR-FranciscaNeural',
  zh: 'zh-CN-XiaoxiaoNeural',
  ja: 'ja-JP-NanamiNeural',
  ko: 'ko-KR-SunHiNeural',
  sw: 'sw-KE-ZuriNeural',
};

/**
 * S3 key for an article's audio file.
 * Format: audio/{lang}/{slug}.mp3
 */
export function audioKey(lang, slug) {
  return `audio/${lang || 'en'}/${slug}.mp3`;
}

/**
 * CloudFront URL for pre-generated audio.
 */
export function audioUrl(lang, slug) {
  return `/audio/${lang || 'en'}/${slug}.mp3`;
}

/**
 * Check if audio already exists in S3.
 */
async function audioExists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate TTS audio and upload to S3.
 *
 * @param {object} article - Article with title, body/description, lang, slug
 * @returns {Promise<{key: string, size: number} | null>}
 */
export async function generateAndUpload(article) {
  const lang = article.lang || 'en';
  const slug = article.slug;
  if (!slug) return null;

  const key = audioKey(lang, slug);

  // Skip if already generated
  if (await audioExists(key)) return { key, size: 0, skipped: true };

  // Build text: title + body, max 2000 chars
  const body = (article.body || article.description || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const text = `${article.title}. ${body}`.slice(0, 2000);
  if (text.length < 10) return null;

  const voice = VOICES[lang] || VOICES.en;

  try {
    // Generate audio with Edge TTS
    const comm = new Communicate(text, { voice, rate: '+20%' });
    const chunks = [];
    for await (const chunk of comm.stream()) {
      if (chunk.type === 'audio' && chunk.data) {
        chunks.push(chunk.data);
      }
    }
    const audioBuffer = Buffer.concat(chunks);

    if (audioBuffer.length < 100) return null; // Empty/failed generation

    // Upload to S3
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: audioBuffer,
      ContentType: 'audio/mpeg',
      CacheControl: 'public, max-age=7776000', // 90 days
    }));

    return { key, size: audioBuffer.length, skipped: false };
  } catch (err) {
    console.warn(`[tts] Failed to generate audio for ${slug} (${lang}): ${err.message}`);
    return null;
  }
}

/**
 * Generate audio for a batch of articles (with concurrency limit).
 * Returns count of generated files.
 */
export async function generateBatch(articles, concurrency = 5) {
  let generated = 0;
  let skipped = 0;
  let failed = 0;
  let active = 0;
  const queue = [...articles];

  await new Promise((resolve) => {
    function next() {
      if (queue.length === 0 && active === 0) return resolve();
      while (queue.length > 0 && active < concurrency) {
        active++;
        const article = queue.shift();
        generateAndUpload(article)
          .then((result) => {
            if (result?.skipped) skipped++;
            else if (result) generated++;
            else failed++;
          })
          .catch(() => failed++)
          .finally(() => { active--; next(); });
      }
    }
    next();
  });

  console.log(`[tts] Batch: generated=${generated} skipped=${skipped} failed=${failed}`);
  return { generated, skipped, failed };
}
