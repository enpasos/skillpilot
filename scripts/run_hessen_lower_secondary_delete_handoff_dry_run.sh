#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LEGACY_TREE="$ROOT_DIR/curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe"
BACKUP_TREE="$ROOT_DIR/tmp/Gymnasium_9_Mittelstufe.delete-dry-run"

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
  python3 scripts/validate_hessen_lower_secondary_archive_paths.py
  python3 scripts/validate_hessen_lower_secondary_legacy_refs.py
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

if legacy_tree_has_content; then
  rm -rf "$BACKUP_TREE"
  mkdir -p "$ROOT_DIR/tmp"
  mv "$LEGACY_TREE" "$BACKUP_TREE"
  trap cleanup EXIT
  echo "Legacy tree present; running delete-handoff dry-run."
else
  rmdir -p --ignore-fail-on-non-empty "$LEGACY_TREE" 2>/dev/null || true
  echo "Legacy tree already retired; running post-retirement verification."
fi

run_checks

echo
echo "DELETE_HANDOFF_VERIFY=OK"
