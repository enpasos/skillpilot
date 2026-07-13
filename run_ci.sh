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

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${PROJECT_ROOT}"

ensure_pinned_java() {
  local required_java_version
  local required_corretto_version
  local current_java_version_output
  local corretto_tools_dir
  local corretto_install_dir
  local corretto_archive

  required_java_version="$(tr -d '[:space:]' < "${PROJECT_ROOT}/.java-version")"
  required_corretto_version="$(tr -d '[:space:]' < "${PROJECT_ROOT}/.corretto-version")"
  current_java_version_output="$(java -version 2>&1 || true)"
  if ! printf '%s\n' "${current_java_version_output}" | grep -Fq "version \"${required_java_version}\"" \
    || ! printf '%s\n' "${current_java_version_output}" | grep -Fq "Corretto-${required_corretto_version}"; then
    echo "Aktuelle Java-Version entspricht nicht Amazon Corretto ${required_corretto_version}; verwende lokalen CI-Download."
    corretto_tools_dir="${PROJECT_ROOT}/tmp/ci-tools"
    corretto_install_dir="${corretto_tools_dir}/amazon-corretto-${required_corretto_version}"
    corretto_archive="${corretto_tools_dir}/amazon-corretto-${required_corretto_version}-linux-x64.tar.gz"
    mkdir -p "${corretto_install_dir}"
    if [ ! -x "${corretto_install_dir}/bin/java" ]; then
      curl -fsSL "https://corretto.aws/downloads/resources/${required_corretto_version}/amazon-corretto-${required_corretto_version}-linux-x64.tar.gz" -o "${corretto_archive}"
      tar -xzf "${corretto_archive}" --strip-components=1 -C "${corretto_install_dir}"
    fi
    export JAVA_HOME="${corretto_install_dir}"
    export PATH="${JAVA_HOME}/bin:${PATH}"
    current_java_version_output="$(java -version 2>&1 || true)"
  fi
  if ! printf '%s\n' "${current_java_version_output}" | grep -Fq "version \"${required_java_version}\"" \
    || ! printf '%s\n' "${current_java_version_output}" | grep -Fq "Corretto-${required_corretto_version}"; then
    echo "Abbruch: Amazon Corretto ${required_corretto_version} ist erforderlich (.java-version/.corretto-version)." >&2
    echo "Aktuelle Java-Version:" >&2
    printf '%s\n' "${current_java_version_output}" >&2
    exit 1
  fi
  printf '%s\n' "${current_java_version_output}"
}

REQUIRED_NODE_VERSION="$(tr -d '[:space:]' < .nvmrc)"
if [ -n "${NVM_DIR:-}" ] && [ -s "${NVM_DIR}/nvm.sh" ]; then
  # shellcheck source=/dev/null
  . "${NVM_DIR}/nvm.sh"
elif [ -s "${HOME}/.nvm/nvm.sh" ]; then
  export NVM_DIR="${HOME}/.nvm"
  # shellcheck source=/dev/null
  . "${NVM_DIR}/nvm.sh"
fi

if command -v nvm >/dev/null 2>&1; then
  nvm install "${REQUIRED_NODE_VERSION}" >/dev/null
  nvm use "${REQUIRED_NODE_VERSION}" >/dev/null
fi

CURRENT_NODE_VERSION="$(node -v 2>/dev/null || true)"
REQUIRED_NODE_PREFIX="v${REQUIRED_NODE_VERSION}"
if [[ "${CURRENT_NODE_VERSION}" != "${REQUIRED_NODE_PREFIX}" && "${CURRENT_NODE_VERSION}" != "${REQUIRED_NODE_PREFIX}".* ]]; then
  echo "Abbruch: Node ${REQUIRED_NODE_VERSION}.x ist erforderlich (.nvmrc)." >&2
  echo "Aktuelle Node-Version: ${CURRENT_NODE_VERSION:-nicht gefunden}" >&2
  echo "Installiere/aktiviere Node ${REQUIRED_NODE_VERSION}.x, z. B. mit: nvm install && nvm use" >&2
  exit 1
fi

echo "=========================================="
echo "Running Custom GPT Action Regression CI"
echo "=========================================="
npm --prefix "${PROJECT_ROOT}/ai/openai custom gpt/action-regression" ci
npm --prefix "${PROJECT_ROOT}/ai/openai custom gpt/action-regression" test

echo "=========================================="
echo "Running Frontend CI (app)"
echo "=========================================="
cd "${PROJECT_ROOT}/app"
npm ci
npx playwright install chromium

echo "--> Running Graph Validation"
npm run validate:graph

echo "--> Testing Package Landscape Model Parity"
npm run test:package-landscape-model

echo "--> Testing Runtime Curriculum Catalog Consumer"
npm run test:runtime-curriculum-catalog

echo "--> Testing Curriculum Offering Sources"
npm run test:curriculum-offering-source

echo "--> Testing Package Goal Source Evidence Consumer"
npm run test:package-goal-source-evidence

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

echo "--> Checking GPT System Instruction Lengths"
npm run check:gpt-system-instruction-lengths

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

echo "--> Deploying Generated Runtime Assets"
npm run deploy:assets

echo "--> Checking Goal Visualization Runtime Assets"
npm run check:goal-visualization-assets

echo "--> Testing Deterministic ZIP32 Writer"
npm run test:deterministic-zip32

echo "--> Testing Full Standalone Curriculum Package Builder"
npm run test:full-standalone-package-builder

echo "--> Testing Core-first FWU-OWL Curriculum Package Builder"
npm run typecheck:fwu-owl-package-builder
npm run test:fwu-owl-package-builder

echo "--> Running Lint & Build"
npm run lint
npm run build
npm run check:goal-source-rationales:build-artifact
cd "${PROJECT_ROOT}"

echo "--> Running Schema Validation"
python3 -m pip install -q -r scripts/curriculum_fwu_owl_validation_requirements.txt
ensure_pinned_java
bash -n \
  scripts/provision_pinned_robot.sh \
  scripts/run_curriculum_release_model_conformance.sh \
  scripts/run_curriculum_fwu_owl_package_conformance.sh \
  scripts/run_curriculum_fwu_owl_reverse_conformance.sh
bash scripts/provision_pinned_robot.sh
python3 -B scripts/check_curriculum_fwu_owl_validation_tools.py \
  --report tmp/curriculum-release-model/fwu-owl-validation/tools-report.json
echo "--> Validating Curriculum Package Contracts"
python3 -B scripts/validate_curriculum_package_contracts.py
python3 -B scripts/validate_curriculum_fwu_owl_package_contracts.py
python3 -B scripts/validate_fwu_owl_curriculum_package.py --self-test
python3 -B scripts/validate_curriculum_fwu_owl_reverse_compilation_contract.py --self-test
python3 -B scripts/reconstruct_json_curriculum_package_from_fwu_owl.py --self-test
python3 -B scripts/run_fwu_owl_reverse_compiler_hermetic.py --self-test
python3 -B scripts/validate_curriculum_runtime_catalog_contract.py
python3 -B scripts/validate_curriculum_schema_catalog_contract.py
python3 -B scripts/evaluate_curriculum_package_readiness.py --self-test
python3 -B scripts/validate_full_standalone_curriculum_package.py --self-test
python3 -B scripts/provision_curriculum_package.py self-test
python3 -B scripts/run_package_consumer_smoke.py --self-test
python3 -B scripts/validate_curriculum_dual_release_contracts.py
bash scripts/run_curriculum_release_model_conformance.sh
export SKILLPILOT_CONFORMANCE_PACKAGE_STORE="${PROJECT_ROOT}/tmp/curriculum-release-model/provisioned-store"
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
cd "${PROJECT_ROOT}/backend"
chmod +x gradlew
# Run backend check in a CI-like, isolated Gradle home to avoid stale local state.
# This makes local results closer to GitHub Actions (fresh workspace behavior).
export GRADLE_USER_HOME="$(pwd)/.gradle-ci"
export SKILLPILOT_BACKEND_BUILD_DIR="${PROJECT_ROOT}/tmp/backend-ci-build-$$"
if [[ "${SKILLPILOT_BACKEND_BUILD_DIR}" != "${PROJECT_ROOT}/tmp/backend-ci-build-"* ]]; then
  echo "Abbruch: unerwartetes Backend-CI-Build-Verzeichnis: ${SKILLPILOT_BACKEND_BUILD_DIR}" >&2
  exit 1
fi
rm -rf "${SKILLPILOT_BACKEND_BUILD_DIR}"
echo "Backend CI build dir: ${SKILLPILOT_BACKEND_BUILD_DIR}"
./gradlew --stop >/dev/null 2>&1 || true
./gradlew clean check --no-daemon --no-watch-fs
rm -rf "${SKILLPILOT_BACKEND_BUILD_DIR}"
cd "${PROJECT_ROOT}"

echo ""
echo "=========================================="
echo "CI RESULT: PASSED"
echo "=========================================="
