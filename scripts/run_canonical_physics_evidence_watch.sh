#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASELINE_PATH="$ROOT_DIR/curricula/DE/Gymnasium/provenance/physics-evidence-watch-baseline.json"

cd "$ROOT_DIR"

if [[ ! -f "$BASELINE_PATH" ]]; then
  echo "physics-evidence-watch: baseline missing at $BASELINE_PATH" >&2
  echo "Run: python3 scripts/capture_canonical_physics_evidence_watch_baseline.py" >&2
  exit 2
fi

python3 scripts/render_canonical_physics_evidence_watch_status.py
python3 scripts/render_canonical_physics_evidence_watch_delta.py
python3 scripts/check_canonical_physics_evidence_watch_delta.py

echo "PHYSICS_EVIDENCE_WATCH=OK"
