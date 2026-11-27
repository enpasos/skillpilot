#!/usr/bin/env bash
set -euo pipefail

export SKILLPILOT_OPENAI_JOURNEY_MODE=rehearse
if [[ ${1:-} == --model ]]; then
  if [[ -n ${CI:-} || -z ${OPENAI_EVAL_API_KEY:-} ]]; then
    echo "The model turn requires a local run and OPENAI_EVAL_API_KEY." >&2
    exit 2
  fi
  SKILLPILOT_OPENAI_JOURNEY_MODE=model
  shift
fi
if [[ $# -ne 1 || ! -f "$1" ]]; then
  echo "Usage: scripts/test_openai_learner_journeys.sh [--model] PATH/TO/submission.zip" >&2
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
