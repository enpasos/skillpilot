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

usage() {
  cat <<'EOF'
Usage: ./run_ci.sh [all|application|curriculum|package|owl|full]

Suites:
  all          Run required application and curriculum CI (default).
  application  Run Custom GPT, frontend application-logic, and backend checks.
  curriculum   Run skill graph, data, schemas, and release-model checks.
  package      Run the optional real 1.7 GB JSON package and consumer checks.
  owl          Run optional FWU-OWL, reasoner, and semantic roundtrip checks.
  full         Run application, curriculum, package, and optional FWU-OWL checks.

Use the default required suite before committing or deploying cross-cutting
changes. Run the optional OWL suite when FWU-OWL or roundtrip code changes.
Run the package suite for package, provisioning, or package-consumer changes.
EOF
}

if (( $# > 1 )); then
  usage >&2
  exit 2
fi

CI_SUITE="${1:-all}"
RUN_APPLICATION=false
RUN_CURRICULUM=false
RUN_PACKAGE=false
RUN_OWL=false
case "${CI_SUITE}" in
  all)
    RUN_APPLICATION=true
    RUN_CURRICULUM=true
    ;;
  application)
    RUN_APPLICATION=true
    ;;
  curriculum)
    RUN_CURRICULUM=true
    ;;
  package)
    RUN_PACKAGE=true
    ;;
  owl)
    RUN_OWL=true
    ;;
  full)
    RUN_APPLICATION=true
    RUN_CURRICULUM=true
    RUN_PACKAGE=true
    RUN_OWL=true
    ;;
  -h|--help)
    usage
    exit 0
    ;;
  *)
    echo "Unknown CI suite: ${CI_SUITE}" >&2
    usage >&2
    exit 2
    ;;
esac

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

PINNED_JAVA_READY=false
ensure_pinned_java_once() {
  if [[ "${PINNED_JAVA_READY}" != "true" ]]; then
    ensure_pinned_java
    PINNED_JAVA_READY=true
  fi
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

run_action_regression_ci() {
  echo "=========================================="
  echo "Running Custom GPT Action Regression CI"
  echo "=========================================="
  npm --prefix "${PROJECT_ROOT}/ai/openai custom gpt/action-regression" ci
  npm --prefix "${PROJECT_ROOT}/ai/openai custom gpt/action-regression" test
  npm --prefix "${PROJECT_ROOT}/ai/openai custom gpt" test
  npm --prefix "${PROJECT_ROOT}/ai/openai app" ci
  npm --prefix "${PROJECT_ROOT}/ai/openai app" test
  node --test "${PROJECT_ROOT}/scripts/openai_plugin_release.test.mjs"
  node --test "${PROJECT_ROOT}/scripts/validate_openai_v1_runtime_config.test.mjs"
  node "${PROJECT_ROOT}/scripts/check_openai_plugin_versioning.mjs"
  node "${PROJECT_ROOT}/scripts/validate_openai_v1_runtime_config.mjs"
}

run_application_frontend_ci() {
  echo "=========================================="
  echo "Running Frontend Application Logic CI"
  echo "=========================================="

  echo "--> Testing Package Landscape Model Parity"
  npm run test:package-landscape-model

  echo "--> Testing Runtime Curriculum Catalog Consumer"
  npm run test:runtime-curriculum-catalog

  echo "--> Testing Root Route Policy"
  npm run test:root-route-policy

  echo "--> Testing Service-Worker Navigation Policy"
  npm run test:service-worker-navigation-policy

  echo "--> Testing Learning-Goal Book Contracts and Publication"
  npm run test:goal-book-pipeline

  echo "--> Testing Curriculum Offering Sources"
  npm run test:curriculum-offering-source

  echo "--> Testing Package Goal Source Evidence Consumer"
  npm run test:package-goal-source-evidence

  echo "--> Testing Goal Source Rationale Deployment Smoke"
  npm run test:goal-source-rationale-deployment-smoke

  echo "--> Testing Goal Visualization QA Approval Model"
  npm run test:goal-visualization-qa-status
  npm run test:goal-visualization-qa-model

  echo "--> Running Learner Goal Selection Validation"
  npm run validate:learner-goal-selection

  echo "--> Checking GPT System Instruction Lengths"
  npm run check:gpt-system-instruction-lengths

  echo "--> Testing Coach Variant Selection"
  npm run test:coach-variants

  echo "--> Testing Deterministic ZIP32 Writer"
  npm run test:deterministic-zip32
}

run_curriculum_frontend_ci() {
  echo "=========================================="
  echo "Running Curriculum Data and Package CI"
  echo "=========================================="

  echo "--> Testing Goal Visualization Scope and Rollout Model"
  npm run test:goal-visualization-scope
  npm run test:goal-visualization-rollout-status
  npm run test:goal-visualization-approval-coverage

  echo "--> Running Graph Validation"
  npm run validate:graph

  echo "--> Testing Exam Markdown Conventions"
  npm run test:exam-markdown

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

  echo "--> Checking Goal Source Rationale Runtime Index"
  npm run check:goal-source-rationales:math-public

  echo "--> Checking Goal Source Rationale All-Relevant Report"
  npm run check:goal-source-rationales:math-all-relevant

  echo "--> Checking Goal Source Rationale Coverage Report"
  npm run check:goal-source-rationale-coverage

  echo "--> Checking Goal Source Rationale Gap Issues"
  npm run check:goal-source-rationale-gap-issues

  echo "--> Checking Goal Source Rationale Mapping Batch 01"
  npm run check:goal-source-rationale-mapping-batch-01

  echo "--> Checking Generated Documentation Notices"
  npm run check:generated-doc-notices

  echo "--> Checking Generated Status Registry"
  npm run check:generated-status-registry

  echo "--> Checking Documentation Links"
  npm run check:docs-links

  echo "--> Checking Documentation Index Coverage"
  npm run check:docs-indexes

  echo "--> Checking Terminology"
  npm run check:terminology

  echo "--> Running Composition-View Validation"
  npm run validate:composition-views

  echo "--> Testing Composition Projection Roles"
  npm run test:composition-projection-roles

  echo "--> Running Memory-Card Review Check"
  npm run quality:memory-card-review:check:all

  echo "--> Verifying Committed Curriculum Quality Status"
  npm run quality:memory-card-review:report:all
  npm run quality:curriculum-status
  git diff --exit-code -- ../docs/qa-ci/status
  test -z "$(git ls-files --others --exclude-standard -- ../docs/qa-ci/status)"

  echo "--> Preparing Generated Runtime Assets"
  npm run prepare:runtime-assets

  echo "--> Checking Goal Visualization Runtime Assets"
  npm run check:goal-visualization-assets

  echo "--> Checking Goal Visualization QA Freshness"
  npm run check:goal-visualization-qa -- --subjects=mathematik,physik,chemie

  echo "--> Checking Goal Visualization Approval Coverage"
  npm run check:goal-visualization-approval-coverage

  echo "--> Checking Goal Visualization Coverage"
  npm run check:goal-visualization-rollout-coverage
  npm run check:goal-visualization-rollout-coverage:physik
  npm run check:goal-visualization-rollout-coverage:chemie
  npm run check:goal-visualization-qa-coverage-parity

  echo "--> Testing Full Standalone Curriculum Package Builder"
  npm run test:full-standalone-package-builder

}

run_frontend_quality_gate() {
  echo "--> Running Frontend Lint & Application Build"
  npm run lint
  npm run build:application
  if [[ "${RUN_CURRICULUM}" == "true" ]]; then
    npm run build:package-consumer -- --out-dir ../tmp/package-consumer-ci/frontend
    npm run check:goal-source-rationales:build-artifact
  fi
}

run_curriculum_schema_ci() {
  cd "${PROJECT_ROOT}"
  echo "--> Running Curriculum JSON Schema and Release Conformance"
  python3 -m pip install -q -r scripts/curriculum_package_validation_requirements.txt
  ensure_pinned_java_once
  bash -n \
    scripts/provision_pinned_fwu_ontology.sh \
    scripts/run_curriculum_release_model_conformance.sh \
    scripts/run_curriculum_full_package_conformance.sh
  echo "--> Validating Curriculum Package Contracts"
  python3 -B scripts/validate_curriculum_package_contracts.py
  python3 -B scripts/validate_curriculum_runtime_catalog_contract.py
  python3 -B scripts/validate_curriculum_schema_catalog_contract.py
  python3 -B scripts/evaluate_curriculum_package_readiness.py --self-test
  python3 -B scripts/validate_full_standalone_curriculum_package.py --self-test
  python3 -B scripts/provision_curriculum_package.py self-test
  python3 -B scripts/run_package_consumer_smoke.py --self-test
  SKILLPILOT_FULL_PACKAGE_CONFORMANCE=false \
    bash scripts/run_curriculum_release_model_conformance.sh
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
}

run_package_ci() {
  cd "${PROJECT_ROOT}"
  echo ""
  echo "=========================================="
  echo "Running Optional Full Curriculum Package CI"
  echo "=========================================="
  python3 -m pip install -q -r scripts/curriculum_package_validation_requirements.txt
  ensure_pinned_java_once
  bash -n \
    scripts/provision_pinned_fwu_ontology.sh \
    scripts/run_curriculum_release_model_conformance.sh \
    scripts/run_curriculum_full_package_conformance.sh
  bash scripts/run_curriculum_full_package_conformance.sh
  export SKILLPILOT_CONFORMANCE_PACKAGE_STORE="${PROJECT_ROOT}/tmp/curriculum-release-model/provisioned-store"
  (
    cd backend
    ./gradlew test \
      --tests 'com.skillpilot.backend.curriculumpackage.ProvisionedCurriculumPackageConformanceTest'
  )
}

run_owl_ci() {
  cd "${PROJECT_ROOT}"
  echo ""
  echo "=========================================="
  echo "Running Optional FWU-OWL and Roundtrip CI"
  echo "=========================================="
  python3 -m pip install -q -r scripts/curriculum_fwu_owl_validation_requirements.txt
  ensure_pinned_java_once
  bash -n \
    scripts/provision_pinned_fwu_ontology.sh \
    scripts/provision_pinned_robot.sh \
    scripts/run_curriculum_fwu_owl_package_conformance.sh \
    scripts/run_curriculum_fwu_owl_reverse_conformance.sh
  bash scripts/provision_pinned_fwu_ontology.sh
  bash scripts/provision_pinned_robot.sh
  python3 -B scripts/check_curriculum_fwu_owl_validation_tools.py \
    --report tmp/curriculum-release-model/fwu-owl-validation/tools-report.json

  cd "${PROJECT_ROOT}/app"
  echo "--> Testing Core-first FWU-OWL Curriculum Package Builder"
  npm run typecheck:fwu-owl-package-builder
  npm run test:fwu-owl-package-builder
  echo "--> Preparing current curriculum runtime assets for roundtrip input"
  npm run prepare:runtime-assets
  echo "--> Building and validating the Mathematics subject package for roundtrip tests"
  npm run export:subject-package -- --subject Mathematik --version 0.1.0
  npm run export:subject-packages:validate -- \
    --zip ../tmp/exports/skillpilot-de-gymnasium-mathematik-v0.1.0.zip
  echo "--> Running semantic MEM/FWU roundtrip"
  npm run roundtrip:mem-fwu:semantic
  echo "--> Running OWL 2 DL and HermiT roundtrip validation"
  ROBOT_JAR="${PROJECT_ROOT}/tmp/tools/robot.jar" npm run roundtrip:mem-fwu:owl:reason

  cd "${PROJECT_ROOT}"
  echo "--> Running bounded FWU-OWL contract and reverse-compiler self-tests"
  python3 -B scripts/validate_curriculum_fwu_owl_package_contracts.py
  python3 -B scripts/validate_fwu_owl_curriculum_package.py --self-test
  python3 -B scripts/validate_curriculum_fwu_owl_reverse_compilation_contract.py --self-test
  python3 -B scripts/reconstruct_json_curriculum_package_from_fwu_owl.py --self-test
  python3 -B scripts/run_fwu_owl_reverse_compiler_hermetic.py --self-test
  python3 -B scripts/validate_curriculum_dual_release_contracts.py
}

run_backend_ci() {
  echo ""
  echo "=========================================="
  echo "Running Backend Application Logic CI"
  echo "=========================================="
  ensure_pinned_java_once
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
  cd "${PROJECT_ROOT}"
  node scripts/openai_plugin_release.mjs verify
  node scripts/claude_direct_install_beta_release.mjs verify
  cd "${PROJECT_ROOT}/backend"
  rm -rf "${SKILLPILOT_BACKEND_BUILD_DIR}"
  cd "${PROJECT_ROOT}"
}

if [[ "${RUN_APPLICATION}" == "true" ]]; then
  run_action_regression_ci
fi

echo "=========================================="
echo "Installing Frontend CI Dependencies"
echo "=========================================="
cd "${PROJECT_ROOT}/app"
npm ci
if [[ "${RUN_PACKAGE}" == "true" ]]; then
  npx playwright install chromium
fi

if [[ "${RUN_APPLICATION}" == "true" ]]; then
  run_application_frontend_ci
fi
if [[ "${RUN_CURRICULUM}" == "true" ]]; then
  run_curriculum_frontend_ci
fi
if [[ "${RUN_APPLICATION}" == "true" || "${RUN_CURRICULUM}" == "true" ]]; then
  run_frontend_quality_gate
fi

if [[ "${RUN_CURRICULUM}" == "true" ]]; then
  run_curriculum_schema_ci
fi
if [[ "${RUN_PACKAGE}" == "true" ]]; then
  run_package_ci
fi
if [[ "${RUN_OWL}" == "true" ]]; then
  run_owl_ci
fi
if [[ "${RUN_APPLICATION}" == "true" ]]; then
  run_backend_ci
fi

echo ""
echo "=========================================="
echo "CI RESULT: PASSED (${CI_SUITE})"
echo "=========================================="
