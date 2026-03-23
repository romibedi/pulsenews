#!/bin/bash
# ---------------------------------------------------------------------------
# Run TTS audio backfill for articles missing audio
#
# Usage:
#   ./scripts/tts-backfill.sh                    # generate missing audio
#   ./scripts/tts-backfill.sh --force             # regenerate all audio
#   ./scripts/tts-backfill.sh --force --concurrency=30
# ---------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")/.."

echo "=== TTS Audio Backfill ==="
node server/tts/backfill.js "$@"
