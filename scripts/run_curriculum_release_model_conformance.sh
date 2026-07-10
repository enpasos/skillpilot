#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROFILE="contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-release-model-v1.profile.json"
OUTPUT_BASE="tmp/curriculum-release-model"
OUTPUT_A="${OUTPUT_BASE}/mathematik-a"
OUTPUT_B="${OUTPUT_BASE}/mathematik-b"
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

python3 -B scripts/compile_curriculum_release_model.py \
  --profile "${PROFILE}" \
  --output "${OUTPUT_B}"

diff -qr "${OUTPUT_A}" "${OUTPUT_B}"

echo "Curriculum release-model conformance passed: independent validation and byte-identical double build."
