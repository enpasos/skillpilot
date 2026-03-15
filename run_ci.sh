#!/bin/bash
set -e

echo "=========================================="
echo "Running Frontend CI (app)"
echo "=========================================="
cd app
npm ci

echo "--> Running Graph Validation"
npm run validate:graph

echo "--> Running View-Filter Validation"
npm run validate:view-filters



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
python3 scripts/validate_hessen_upper_secondary_archive_paths.py
echo "--> Validating Hessen Upper-Secondary Legacy References"
python3 scripts/validate_hessen_upper_secondary_legacy_refs.py
echo "--> Validating Hessen Lower-Secondary Archive Paths"
python3 scripts/validate_hessen_lower_secondary_archive_paths.py
echo "--> Validating Hessen Lower-Secondary Legacy References"
python3 scripts/validate_hessen_lower_secondary_legacy_refs.py

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
echo "✅ All CI checks passed successfully!"
echo "=========================================="
