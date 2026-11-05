#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"
PROFILE_ID="$(python3 -B - <<'PY'
import sys
from pathlib import Path
sys.path.insert(0, 'scripts')
import curriculum_learning_unit_artifacts as units
print(units.current_build_profile_id(Path.cwd()))
PY
)"
PROFILE="contracts/curriculum-package/v1.2/profiles/${PROFILE_ID}.profile.json"
PACKAGE_PROFILE="contracts/curriculum-package/v1.2/profiles/full-standalone-learning-units-v1.profile.json"
OUTPUT_BASE="tmp/curriculum-release-model/learning-units"
if [[ "${PROFILE_ID}" == "de-gymnasium-mathematik-learning-unit-offers-release-model-v1" ]]; then
  PACKAGE_PROFILE="contracts/curriculum-package/v1.2/profiles/full-standalone-learning-unit-offers-v1.profile.json"
  OUTPUT_BASE="tmp/curriculum-release-model/learning-unit-offers"
fi
OUTPUT_A="${OUTPUT_BASE}/mathematik-a"
OUTPUT_B="${OUTPUT_BASE}/mathematik-b"
REVIEW="${ROOT_DIR}/${OUTPUT_BASE}/redistribution-review.json"
PACKAGE_OUTPUT="${OUTPUT_BASE}/package"
mkdir -p "${OUTPUT_BASE}"

# The JSON model retains the existing exact FWU Core provenance binding.
# This provisions that input; runtime 1.2 FWU-OWL export remains unsupported.
bash scripts/provision_pinned_fwu_ontology.sh
python3 -B scripts/test_learning_unit_package.py
python3 -B scripts/test_learning_unit_offer_package.py
python3 -B scripts/test_learning_unit_semantic_inputs.py
python3 -B scripts/validate_curriculum_package_contracts.py --contracts-dir contracts/curriculum-package/v1.2 \
  --profile-id "$(basename "${PACKAGE_PROFILE}" .profile.json)"
python3 -B scripts/compile_curriculum_release_model.py --profile "${PROFILE}" --output "${OUTPUT_A}"
python3 -B scripts/validate_curriculum_release_model.py --profile "${PROFILE}" --release-root "${OUTPUT_A}"
python3 -B scripts/compile_curriculum_release_model.py --profile "${PROFILE}" --output "${OUTPUT_B}"
diff -qr "${OUTPUT_A}" "${OUTPUT_B}"
# A local candidate ledger retains pending human publication decisions. It
# neither replaces a published ledger nor declares host or learner acceptance.
python3 -B scripts/generate_curriculum_package_redistribution_review.py \
  --generate --learning-units-candidate --release-root "${OUTPUT_A}" --ledger "${REVIEW}"
python3 -B scripts/generate_curriculum_package_redistribution_review.py \
  --check --learning-units-candidate --release-root "${OUTPUT_A}" --ledger "${REVIEW}"

if [[ "${SKILLPILOT_FULL_PACKAGE_CONFORMANCE:-false}" != "true" ]]; then
  echo "Learning-unit release model passed independent validation and byte-identical builds; local publication review remains explicit."
  exit 0
fi

npm --prefix app run --silent export:full-standalone-package -- \
  --release-root "${OUTPUT_A}" --package-profile "${PACKAGE_PROFILE}" \
  --redistribution-review "${OUTPUT_BASE}/redistribution-review.json" --output-dir "${PACKAGE_OUTPUT}" --zip \
  > "${OUTPUT_BASE}/package-build-summary.json"
PACKAGE_ZIP="$(python3 -B - "${OUTPUT_BASE}/package-build-summary.json" <<'PY'
import json
import sys
print(json.load(open(sys.argv[1], encoding='utf-8'))['zipPath'])
PY
)"
python3 -B scripts/validate_full_standalone_curriculum_package.py \
  --contracts-dir contracts/curriculum-package/v1.2 --zip "${PACKAGE_ZIP}" \
  --report "${OUTPUT_BASE}/full-package-validation-report.json"

# Preserve the existing operational contract: validate and CAS-activate only
# the exact built object; package-only operation needs a fresh isolated run.
PACKAGE_STORE="${OUTPUT_BASE}/provisioned-store"
python3 -B - "${PACKAGE_STORE}" <<'PY'
import sys
from pathlib import Path
sys.path.insert(0, 'scripts')
import provision_curriculum_package as provisioner
provisioner.remove_private_tree(Path(sys.argv[1]))
PY
python3 -B scripts/provision_curriculum_package.py install --store "${PACKAGE_STORE}" \
  --contracts-dir contracts/curriculum-package/v1.2 --zip "${PACKAGE_ZIP}" \
  > "${OUTPUT_BASE}/provision-install.json"
PACKAGE_OUTER_SHA256="$(python3 -B - "${OUTPUT_BASE}/provision-install.json" <<'PY'
import json
import sys
print(json.load(open(sys.argv[1], encoding='utf-8'))['outerZipSha256'])
PY
)"
python3 -B scripts/provision_curriculum_package.py verify --store "${PACKAGE_STORE}" \
  --outer-sha256 "${PACKAGE_OUTER_SHA256}" > "${OUTPUT_BASE}/provision-verify.json"
python3 -B scripts/provision_curriculum_package.py activate --store "${PACKAGE_STORE}" \
  --outer-sha256 "${PACKAGE_OUTER_SHA256}" --expected-active-sha256 none --consumer-version 0.1.0 \
  > "${OUTPUT_BASE}/provision-activate.json"
python3 -B scripts/provision_curriculum_package.py status --store "${PACKAGE_STORE}" \
  > "${OUTPUT_BASE}/provision-status.json"
if [[ "${PROFILE_ID}" == "de-gymnasium-mathematik-learning-unit-offers-release-model-v1" ]]; then
  # Compare the actual installed package under its distinct Entry with a fresh
  # repository projection; a model-only admission does not prove this path.
  (
    cd app
    npx --no-install tsx scripts/learningUnitsMathProjectionEvidence.ts --run-native \
      --native "${OUTPUT_BASE}/repository-native.raw.json" \
      --output docs/dev/learning-units-mathematics-native-source-projection.json --check
    npx --no-install tsx scripts/learningUnitsProofs.ts installed-offers \
      --store "../${PACKAGE_STORE}" --native-inventory "../${OUTPUT_BASE}/repository-native.raw.json" \
      --output "../${OUTPUT_BASE}/installed-offer-182-parity.json"
  )
fi
python3 -B scripts/evaluate_curriculum_package_readiness.py --contracts-dir contracts/curriculum-package/v1.2 \
  --zip "${PACKAGE_ZIP}" --consumer-smoke-store "${PACKAGE_STORE}" \
  --consumer-smoke-work-dir "${OUTPUT_BASE}/package-consumer-smoke" \
  --consumer-smoke-report "${OUTPUT_BASE}/package-consumer-smoke-report.json" \
  --report "${OUTPUT_BASE}/readiness-report.json" --expect-status not-ready-incomplete --compact > /dev/null
python3 -B - "${OUTPUT_BASE}" <<'PY'
import json
import sys
from pathlib import Path
root = Path(sys.argv[1])
read = lambda name: json.loads((root / name).read_bytes())
build, install, verify, activation, status = [read(name) for name in (
    'package-build-summary.json', 'provision-install.json', 'provision-verify.json',
    'provision-activate.json', 'provision-status.json')]
if install.get('outerZipSha256') != build.get('zipSha256') or install.get('contentDigest') != build.get('contentDigest'):
    raise SystemExit('Provisioner ZIP/content identity differs from the actual builder')
if verify.get('outerZipSha256') != install.get('outerZipSha256') or verify.get('manifestFiles') != build.get('manifestFileCount'):
    raise SystemExit('Installed file/identity verification differs from the built package')
if not activation.get('activeLockSha256') or activation.get('activeLockSha256') != status.get('activeLockSha256'):
    raise SystemExit('Provisioning CAS activation and current lock differ')
packages = (status.get('active') or {}).get('packages') or []
if len(packages) != 1 or packages[0].get('outerZipSha256') != build.get('zipSha256'):
    raise SystemExit('The active package lock does not select the built ZIP')
smoke, readiness = read('package-consumer-smoke-report.json'), read('readiness-report.json')
if smoke.get('status') != 'passed' or smoke.get('summary') != {'required': 15, 'passed': 15, 'failed': 0, 'notRun': 0}:
    raise SystemExit('The fresh hermetic consumer must pass the complete existing 15-check set')
checks = {item['id']: item for item in readiness.get('checks', [])}
evidence = readiness.get('consumerEvidence') or {}
if checks.get('consumer.hermetic-package-only', {}).get('result') != 'pass' or evidence.get('status') != 'accepted':
    raise SystemExit('Readiness did not accept actual isolated consumer evidence')
if evidence.get('provenance') != 'self-executed' or not evidence.get('freshReport') or not readiness.get('evaluator', {}).get('completeForPolicy'):
    raise SystemExit('Readiness must self-execute the pinned runner and finish its complete policy')
if evidence.get('assemblySha256') != smoke.get('application', {}).get('assemblySha256') or evidence.get('evidenceBundleSha256') != smoke.get('evidenceBundle', {}).get('sha256'):
    raise SystemExit('Readiness assembly/evidence binding differs from the isolated execution')
if readiness.get('decision', {}).get('status') != 'not-ready-incomplete' or readiness.get('decision', {}).get('standaloneProfileReady') is not False:
    raise SystemExit('Package operation must not override open human publication decisions')
PY
echo "Learning-unit package conformance passed: exact provisioning/CAS activation, fresh hermetic package-only operation and independently bound readiness; human publication stays blocked."
