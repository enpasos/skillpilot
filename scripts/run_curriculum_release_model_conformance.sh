#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROFILE="contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-release-model-v1.profile.json"
OUTPUT_BASE="tmp/curriculum-release-model"
OUTPUT_A="${OUTPUT_BASE}/mathematik-a"
OUTPUT_B="${OUTPUT_BASE}/mathematik-b"
PACKAGE_OUTPUT="${OUTPUT_BASE}/full-standalone-package"
PACKAGE_ARCHIVE_ROOT="skillpilot-curriculum-de-gymnasium-mathematik-0.1.0-conformance.2-json"
PACKAGE_ZIP="${PACKAGE_OUTPUT}/${PACKAGE_ARCHIVE_ROOT}.zip"
PACKAGE_BUILD_REPORT="${PACKAGE_OUTPUT}/build-summary.json"
PACKAGE_VALIDATION_REPORT="${PACKAGE_OUTPUT}/full-package-validation-report.json"
PACKAGE_READINESS_REPORT="${PACKAGE_OUTPUT}/readiness-report.json"
EXPECTED_CONTENT_DIGEST="sha256:3b44444b50b41f45ec1cb12d4d912a4524effe9d560d539788cfe36d4d7ffc60"
CORE_REPOSITORY="https://github.com/FWU-DE/lehrplan-ontologie.git"
CORE_COMMIT="8aa5bce4a5366807d46f18650e31db98f9bfe35d"
CORE_CHECKOUT="tmp/lehrplan-ontologie"

cd "${ROOT_DIR}"

python3 -B scripts/validate_curriculum_release_model_fixtures.py
python3 -B scripts/compile_curriculum_release_model.py \
  --self-test-dependency-emission

if [[ ! -e "${CORE_CHECKOUT}" ]]; then
  git clone --no-checkout --quiet "${CORE_REPOSITORY}" "${CORE_CHECKOUT}"
  git -C "${CORE_CHECKOUT}" checkout --detach --quiet "${CORE_COMMIT}"
fi

OUTPUT_SAFETY_ROOT="$(mktemp -d "${ROOT_DIR}/tmp/curriculum-release-model-output-safety.XXXXXX")"
cleanup_output_safety_root() {
  rm -rf -- "${OUTPUT_SAFETY_ROOT}"
}
trap cleanup_output_safety_root EXIT

mkdir -p "${OUTPUT_SAFETY_ROOT}/victim" "${OUTPUT_SAFETY_ROOT}/nested-victim"
printf 'must-survive\n' > "${OUTPUT_SAFETY_ROOT}/victim/sentinel"
printf 'must-survive\n' > "${OUTPUT_SAFETY_ROOT}/nested-victim/sentinel"
ln -s "victim" "${OUTPUT_SAFETY_ROOT}/output-link"
ln -s "nested-victim" "${OUTPUT_SAFETY_ROOT}/parent-link"

if python3 -B scripts/compile_curriculum_release_model.py \
  --profile "${PROFILE}" \
  --output "${OUTPUT_SAFETY_ROOT}/output-link" \
  >/dev/null 2>"${OUTPUT_SAFETY_ROOT}/output-link.stderr"; then
  echo "Release-model compiler accepted a symlink output path." >&2
  exit 1
fi
grep -Fq "Symlink component is forbidden" "${OUTPUT_SAFETY_ROOT}/output-link.stderr"
if python3 -B scripts/compile_curriculum_release_model.py \
  --profile "${PROFILE}" \
  --output "${OUTPUT_SAFETY_ROOT}/parent-link/model" \
  >/dev/null 2>"${OUTPUT_SAFETY_ROOT}/parent-link.stderr"; then
  echo "Release-model compiler accepted a symlink output parent." >&2
  exit 1
fi
grep -Fq "Symlink component is forbidden" "${OUTPUT_SAFETY_ROOT}/parent-link.stderr"
test -f "${OUTPUT_SAFETY_ROOT}/victim/sentinel"
test -f "${OUTPUT_SAFETY_ROOT}/nested-victim/sentinel"
echo "Release-model output safety passed: symlink target and parent rejected without victim deletion."

python3 -B scripts/compile_curriculum_release_model.py \
  --profile "${PROFILE}" \
  --output "${OUTPUT_A}"

python3 -B scripts/validate_curriculum_release_model.py \
  --profile "${PROFILE}" \
  --release-root "${OUTPUT_A}"

python3 -B scripts/generate_curriculum_package_redistribution_review.py \
  --check \
  --release-root "${OUTPUT_A}"
python3 -B scripts/generate_curriculum_package_redistribution_review.py \
  --self-test \
  --release-root "${OUTPUT_A}"
python3 -B scripts/generate_curriculum_source_verification_review.py --check
python3 -B scripts/generate_curriculum_source_verification_review.py --self-test

python3 -B scripts/compile_curriculum_release_model.py \
  --profile "${PROFILE}" \
  --output "${OUTPUT_B}"

diff -qr "${OUTPUT_A}" "${OUTPUT_B}"

rm -rf -- "${PACKAGE_OUTPUT}"
mkdir -p "${PACKAGE_OUTPUT}"
npm --prefix app run --silent export:full-standalone-package -- \
  --release-root "${OUTPUT_A}" \
  --output-dir "${PACKAGE_OUTPUT}" \
  --archive-root "${PACKAGE_ARCHIVE_ROOT}" \
  --zip \
  --expect-entry-count 913 \
  --expect-manifest-file-count 911 \
  --expect-binary-asset-count 756 \
  --expect-content-digest "${EXPECTED_CONTENT_DIGEST}" \
  > "${PACKAGE_BUILD_REPORT}"

python3 -B scripts/validate_full_standalone_curriculum_package.py \
  --zip "${PACKAGE_ZIP}" \
  --report "${PACKAGE_VALIDATION_REPORT}"

python3 -B scripts/evaluate_curriculum_package_readiness.py \
  --zip "${PACKAGE_ZIP}" \
  --report "${PACKAGE_READINESS_REPORT}" \
  --expect-status not-ready-incomplete \
  --compact \
  >/dev/null

echo "Curriculum release-model conformance passed: independent model validation, byte-identical model build, reproducible real ZIP, independent full-package validation, and honest incomplete readiness."
