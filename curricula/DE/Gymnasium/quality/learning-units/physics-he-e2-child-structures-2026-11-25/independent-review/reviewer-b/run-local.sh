#!/bin/bash
set -euo pipefail
out=$(cd "$(dirname "$0")";pwd)
repo=$(git rev-parse --show-toplevel)
cd "$repo"
test "$(git rev-parse HEAD)" = a88f17523bbafd63a5b3d98b48cc3c8e8b6ed24d
mkdir -p "$out/../raw/reviewer-b"
python3 "$out/measure.py" > "$out/../raw/reviewer-b/measure.log"
python3 "$out/prepare-ui.py"
app/node_modules/.bin/tsx "$out/ui.mts" > "$out/ui.actual.json"
python3 scripts/test_mathematics_stage_views.py > "$out/../raw/reviewer-b/math.log" 2>&1
(cd app && npm run validate:composition-views) > "$out/../raw/reviewer-b/composition.log" 2>&1
# Run parent before candidate to seed the authentic prior blocks.
for variant in parent candidate recovery; do
  bash "$out/run-coach.sh" "$variant" "${1:-$repo}" "${2:-$repo/tmp/ci-tools}"
done
python3 "$out/summarize-coach.py"
