#!/bin/bash
set -e

echo "=========================================="
echo "Running Frontend CI (app)"
echo "=========================================="
cd app
# Using 'npm install' instead of 'npm ci' to be friendlier to local environments
# (npm ci removes node_modules, which might be slow/undesirable locally)
npm install
npm run validate:graph
npm run lint
npm run build
cd ..

echo ""
echo "=========================================="
echo "Running Backend CI (backend)"
echo "=========================================="
cd backend
./gradlew check
cd ..

echo ""
echo "=========================================="
echo "✅ All CI checks passed successfully!"
echo "=========================================="
