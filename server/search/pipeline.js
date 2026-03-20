// ---------------------------------------------------------------------------
// OpenSearch hybrid search pipeline setup
//
// Creates a search pipeline that normalizes and combines BM25 text scores
// with kNN vector similarity scores for hybrid search.
// ---------------------------------------------------------------------------

import { getClient } from './client.js';

export const HYBRID_PIPELINE_NAME = 'hybrid-search-pipeline';

/**
 * Create or update the hybrid search pipeline.
 * Uses min_max normalization + weighted arithmetic mean (0.3 BM25, 0.7 kNN).
 */
export async function createHybridPipeline() {
  const client = getClient();

  const pipelineBody = {
    description: 'Hybrid BM25 + kNN vector search pipeline',
    phase_results_processors: [
      {
        'normalization-processor': {
          normalization: { technique: 'min_max' },
          combination: {
            technique: 'arithmetic_mean',
            parameters: { weights: [0.3, 0.7] },
          },
        },
      },
    ],
  };

  try {
    await client.transport.request({
      method: 'PUT',
      path: `/_search/pipeline/${HYBRID_PIPELINE_NAME}`,
      body: pipelineBody,
    });
    console.log(`[pipeline] Created/updated search pipeline: ${HYBRID_PIPELINE_NAME}`);
    return true;
  } catch (err) {
    console.error(`[pipeline] Failed to create search pipeline: ${err.message}`);
    return false;
  }
}

/**
 * Delete the hybrid search pipeline (for cleanup/migration).
 */
export async function deleteHybridPipeline() {
  const client = getClient();
  try {
    await client.transport.request({
      method: 'DELETE',
      path: `/_search/pipeline/${HYBRID_PIPELINE_NAME}`,
    });
    console.log(`[pipeline] Deleted search pipeline: ${HYBRID_PIPELINE_NAME}`);
  } catch (err) {
    if (err.meta?.statusCode !== 404) {
      console.error(`[pipeline] Failed to delete pipeline: ${err.message}`);
    }
  }
}
