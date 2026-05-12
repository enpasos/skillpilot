#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LEGACY_TREE="$ROOT_DIR/curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe"
BACKUP_TREE="$ROOT_DIR/tmp/Gymnasiale_Oberstufe.delete-dry-run"

cleanup() {
  if [[ -d "$BACKUP_TREE" ]]; then
    mv "$BACKUP_TREE" "$LEGACY_TREE"
  fi
}

run_checks() {
  cd "$ROOT_DIR"
  python3 scripts/validate_hessen_upper_secondary_archive_paths.py
  python3 scripts/validate_hessen_upper_secondary_legacy_refs.py
  python3 scripts/validate_math_exam_pipeline.py
  python3 scripts/validate_physics_exam_pipeline.py
  python3 scripts/validate_chemistry_exam_pipeline.py

  cd "$ROOT_DIR/app"
  ./node_modules/.bin/tsx ../scripts/deploy_curriculum_decks.ts

  cd "$ROOT_DIR"
  python3 scripts/export_math_exam_release_bundle.py
}

if [[ -d "$LEGACY_TREE" ]]; then
  rm -rf "$BACKUP_TREE"
  mkdir -p "$ROOT_DIR/tmp"
  mv "$LEGACY_TREE" "$BACKUP_TREE"
  trap cleanup EXIT
  echo "Legacy tree present; running delete-handoff dry-run."
else
  echo "Legacy tree already retired; running post-retirement verification."
fi

run_checks

echo
echo "DELETE_HANDOFF_VERIFY=OK"
