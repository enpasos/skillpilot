#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASELINE_PATH="$ROOT_DIR/curricula/DE/Gymnasium/provenance/chemistry-evidence-watch-baseline.json"

cd "$ROOT_DIR"

if [[ ! -f "$BASELINE_PATH" ]]; then
  echo "chemistry-evidence-watch: baseline missing at $BASELINE_PATH" >&2
  echo "Run: python3 scripts/canonical_chemistry_evidence_watch.py capture-baseline" >&2
  exit 2
fi

python3 scripts/canonical_chemistry_evidence_watch.py self-test
python3 scripts/canonical_chemistry_evidence_watch.py render-status
python3 scripts/canonical_chemistry_evidence_watch.py render-delta
python3 scripts/canonical_chemistry_evidence_watch.py check-delta

echo "CHEMISTRY_EVIDENCE_WATCH=OK"
