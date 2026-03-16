#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LEGACY_TREE="$ROOT_DIR/curricula/DE/BY/Gymnasium"
BACKUP_TREE="$ROOT_DIR/tmp/BY_Gymnasium.delete-dry-run"
SIMULATE_DELETE="${SIMULATE_DELETE:-0}"

legacy_tree_has_content() {
  [[ -d "$LEGACY_TREE" ]] && find "$LEGACY_TREE" -mindepth 1 -print -quit | grep -q .
}

cleanup() {
  if [[ -d "$BACKUP_TREE" ]]; then
    mv "$BACKUP_TREE" "$LEGACY_TREE"
  fi
}

run_checks() {
  cd "$ROOT_DIR"
  python3 scripts/validate_bavaria_gymnasium_archive_paths.py
  python3 scripts/validate_bavaria_gymnasium_legacy_refs.py
  python3 scripts/validate_schemas.py
  python3 scripts/validate_goal_ids_uuid.py

  cd "$ROOT_DIR/app"
  npm run validate:graph
  npm run validate:view-filters

  cd "$ROOT_DIR/backend"
  ./gradlew test --tests 'com.skillpilot.backend.landscape.LandscapeServiceSourceRegistryTest' \
    --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' \
    --tests 'com.skillpilot.backend.landscape.LandscapeServiceTest' \
    --tests 'com.skillpilot.backend.controller.LearnerControllerIntegrationTest' \
    --no-daemon
}

if [[ "$SIMULATE_DELETE" == "1" ]] && legacy_tree_has_content; then
  rm -rf "$BACKUP_TREE"
  mkdir -p "$ROOT_DIR/tmp"
  mv "$LEGACY_TREE" "$BACKUP_TREE"
  trap cleanup EXIT
  echo "Legacy tree present; running Bavaria delete-handoff simulation."
else
  echo "Running Bavaria delete-handoff precheck without removing the live legacy tree."
  echo "Set SIMULATE_DELETE=1 once the Bavaria root is archive-complete and ready for absence verification."
fi

run_checks

echo
if [[ "$SIMULATE_DELETE" == "1" ]]; then
  echo "DELETE_HANDOFF_DRY_RUN=OK"
else
  echo "DELETE_HANDOFF_PRECHECK=OK"
fi
