// ---------------------------------------------------------------------------
// OpenSearch client with AWS Sigv4 authentication
// ---------------------------------------------------------------------------

import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import { defaultProvider } from '@aws-sdk/credential-provider-node';

let _client = null;

/**
 * Get a singleton OpenSearch client.
 *
 * Env vars:
 *   OPENSEARCH_ENDPOINT — full https:// URL of the OpenSearch domain
 *   AWS_REGION          — region (defaults to eu-west-1)
 */
export function getClient() {
  if (_client) return _client;

  const endpoint = process.env.OPENSEARCH_ENDPOINT;
  if (!endpoint) {
    throw new Error('OPENSEARCH_ENDPOINT environment variable is required');
  }

  const region = process.env.AWS_REGION || 'eu-west-1';

  _client = new Client({
    ...AwsSigv4Signer({
      region,
      service: 'es',
      getCredentials: () => defaultProvider()(),
    }),
    node: endpoint,
  });

  return _client;
}
