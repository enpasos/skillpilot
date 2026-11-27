#!/usr/bin/env bash
set -euo pipefail

export SKILLPILOT_OPENAI_JOURNEY_MODE=rehearse
if [[ ${1:-} == --model || ${1:-} == --codex ]]; then
  SKILLPILOT_OPENAI_JOURNEY_MODE="${1#--}"
  if [[ -n ${CI:-} ]]; then
    echo "Model-driven learner tests run locally." >&2
    exit 2
  elif [[ $1 == --model && -z ${OPENAI_EVAL_API_KEY:-} ]]; then
    echo "The direct API test requires OPENAI_EVAL_API_KEY." >&2
    exit 2
  fi
  shift
fi
if [[ $# -ne 1 || ! -f "$1" ]]; then
  echo "Usage: scripts/test_openai_learner_journeys.sh [--codex|--model] PATH/TO/submission.zip" >&2
  exit 2
fi

export SKILLPILOT_OPENAI_TEST_ZIP
SKILLPILOT_OPENAI_TEST_ZIP="$(realpath -- "$1")"
cd -- "$(dirname -- "$0")/.."
node scripts/openai_dialog_eval.mjs check --zip "${SKILLPILOT_OPENAI_TEST_ZIP}"
cd backend
exec ./gradlew test --rerun --console=plain \
  --tests 'com.skillpilot.backend.openai.de.oauth.OpenAiDePrivateKeyJwtFlowIntegrationTest' \
  --tests 'com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachEndToEndIntegrationTest'
