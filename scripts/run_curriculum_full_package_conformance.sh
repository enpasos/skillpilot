#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

# Keep the normal curriculum conformance path bounded. The explicit package
# wrapper enables the real 1.7 GB ZIP, provisioning, readiness, and hermetic
# consumer checks after the same release model has passed its fast gates.
export SKILLPILOT_FULL_PACKAGE_CONFORMANCE=true
exec bash scripts/run_curriculum_release_model_conformance.sh
