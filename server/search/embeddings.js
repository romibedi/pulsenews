// ---------------------------------------------------------------------------
// Vector embedding generation via Amazon Bedrock Titan Embeddings v2
//
// Generates 1024-dimensional normalized vectors from text input.
// Used at indexing time (title + description) and at query time.
// ---------------------------------------------------------------------------

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const EMBEDDING_MODEL = 'amazon.titan-embed-text-v2:0';
const DIMENSIONS = 1024;

let _client = null;

function getBedrockClient() {
  if (_client) return _client;
  const region = process.env.BEDROCK_REGION || process.env.AWS_REGION || 'us-east-1';
  _client = new BedrockRuntimeClient({ region });
  return _client;
}

/**
 * Generate a vector embedding for the given text.
 * Returns a Float32Array of DIMENSIONS length, or null on failure.
 */
export async function generateEmbedding(text) {
  if (!text || text.trim().length === 0) return null;

  try {
    const client = getBedrockClient();
    const truncated = text.slice(0, 8000);

    const response = await client.send(new InvokeModelCommand({
      modelId: EMBEDDING_MODEL,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        inputText: truncated,
        dimensions: DIMENSIONS,
        normalize: true,
      }),
    }));

    const result = JSON.parse(new TextDecoder().decode(response.body));
    return result.embedding || null;
  } catch (err) {
    console.warn(`[embeddings] Failed to generate embedding: ${err.message}`);
    return null;
  }
}

/**
 * Generate embeddings for multiple texts with concurrency control.
 * Returns an array of embeddings (null for failed ones).
 */
export async function generateEmbeddingsBatch(texts, concurrency = 5) {
  const results = new Array(texts.length).fill(null);
  let idx = 0;

  async function worker() {
    while (idx < texts.length) {
      const i = idx++;
      results[i] = await generateEmbedding(texts[i]);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, texts.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

/**
 * Build the combined text used for embedding an article.
 * Concatenates title (weighted by repetition) + description for richer signal.
 */
export function buildEmbeddingText(title, description) {
  const t = (title || '').trim();
  const d = (description || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-z]+;/gi, ' ')
    .trim();
  // Repeat title to give it more weight in the embedding
  return `${t}. ${t}. ${d}`.trim();
}

export { DIMENSIONS };
