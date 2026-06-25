#!/bin/bash
set -euo pipefail

failed_command=""
failed_line=""

on_error() {
  local exit_code=$?
  failed_command=$BASH_COMMAND
  failed_line=${BASH_LINENO[0]}
  echo ""
  echo "=========================================="
  echo "CI RESULT: FAILED"
  echo "Exit code: ${exit_code}"
  echo "Failed at line: ${failed_line}"
  echo "Failed command: ${failed_command}"
  echo "=========================================="
  exit "$exit_code"
}

trap on_error ERR

echo "=========================================="
echo "Running Frontend CI (app)"
echo "=========================================="
cd app
npm ci

echo "--> Running Graph Validation"
npm run validate:graph

echo "--> Running View-Filter Validation"
npm run validate:view-filters

echo "--> Checking Source Landscape Registry"
npm run check:source-landscape-registry

echo "--> Running Hessen Math G8/G9 Projection Check"
npm run check:he-math-duration-projection

echo "--> Checking generated Math G8/G9 Composition Views"
npm run check:math-duration-composition-views

echo "--> Checking generated German Sek-I Composition Views"
npm run check:german-seki-composition-views

echo "--> Checking generated History Sek-I Composition Views"
npm run check:history-seki-composition-views

echo "--> Checking Canonical Math Scope Coverage"
npm run check:canonical-math-scope-coverage

echo "--> Checking Gymnasium G8/G9 Duration Readiness Report"
npm run check:gymnasium-duration-readiness

echo "--> Checking Mathematics G8/G9 Duration Policy Readiness"
npm run check:math-duration-policy-readiness

echo "--> Checking M6 G8/G9 Duration Policy Readiness"
npm run check:m6-duration-policy-readiness

echo "--> Checking generated Gymnasium Duration Offerings"
npm run check:gymnasium-duration-offerings

echo "--> Running Curriculum Source Coverage Check"
npm run quality:source-coverage-audit:check

echo "--> Checking Generated Documentation Notices"
npm run check:generated-doc-notices

echo "--> Checking Generated Status Registry"
npm run check:generated-status-registry

echo "--> Checking Documentation Links"
npm run check:docs-links

echo "--> Checking Documentation Index Coverage"
npm run check:docs-indexes

echo "--> Running Composition-View Validation"
npm run validate:composition-views

echo "--> Running Memory-Card Review Check"
npm run quality:memory-card-review:check:all

echo "--> Running Learner Goal Selection Validation"
npm run validate:learner-goal-selection



echo "--> Running Lint & Build"
npm run lint
npm run build
cd ..

echo "--> Running Schema Validation"
# Ensure jsonschema is installed (suppress output if already present)
pip3 install -q jsonschema || echo "Warning: Failed to install jsonschema, validation might fail."
python3 scripts/validate_schemas.py
echo "--> Validating Curriculum Goal IDs (UUIDs)"
python3 scripts/validate_goal_ids_uuid.py
echo "--> Validating Hessen Upper-Secondary Archive Paths"
SKILLPILOT_DISABLE_RG=1 python3 scripts/validate_hessen_upper_secondary_archive_paths.py
echo "--> Validating Hessen Upper-Secondary Legacy References"
SKILLPILOT_DISABLE_RG=1 python3 scripts/validate_hessen_upper_secondary_legacy_refs.py
echo "--> Validating Hessen Chemistry Exam Pipeline"
python3 scripts/validate_chemistry_exam_pipeline.py
echo "--> Validating Hessen Lower-Secondary Archive Paths"
SKILLPILOT_DISABLE_RG=1 python3 scripts/validate_hessen_lower_secondary_archive_paths.py
echo "--> Validating Hessen Lower-Secondary Legacy References"
SKILLPILOT_DISABLE_RG=1 python3 scripts/validate_hessen_lower_secondary_legacy_refs.py
echo "--> Validating Bavaria Gymnasium Archive Paths"
SKILLPILOT_DISABLE_RG=1 python3 scripts/validate_bavaria_gymnasium_archive_paths.py
echo "--> Validating Bavaria Gymnasium Legacy References"
SKILLPILOT_DISABLE_RG=1 python3 scripts/validate_bavaria_gymnasium_legacy_refs.py

echo ""
echo "=========================================="
echo "Running Backend CI (backend)"
echo "=========================================="
cd backend
chmod +x gradlew
# Run backend check in a CI-like, isolated Gradle home to avoid stale local state.
# This makes local results closer to GitHub Actions (fresh workspace behavior).
export GRADLE_USER_HOME="$(pwd)/.gradle-ci"
./gradlew clean check --no-daemon
cd ..

echo ""
echo "=========================================="
echo "CI RESULT: PASSED"
echo "=========================================="
