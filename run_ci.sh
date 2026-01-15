#!/bin/bash
set -e

echo "=========================================="
echo "Running Frontend CI (app)"
echo "=========================================="
cd app
# Using 'npm install' instead of 'npm ci' to be friendlier to local environments
# (npm ci removes node_modules, which might be slow/undesirable locally)
npm install

echo "--> Running Graph Validation"
npm run validate:graph



echo "--> Running Lint & Build"
npm run lint
npm run build
cd ..

echo "--> Running Schema Validation"
# Ensure jsonschema is installed (suppress output if already present)
pip3 install -q jsonschema || echo "Warning: Failed to install jsonschema, validation might fail."
python3 scripts/validate_schemas.py

echo ""
echo "=========================================="
echo "Running Backend CI (backend)"
echo "=========================================="
cd backend
chmod +x gradlew
./gradlew check
cd ..

echo ""
echo "=========================================="
echo "✅ All CI checks passed successfully!"
echo "=========================================="
