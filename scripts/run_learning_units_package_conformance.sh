#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"
PRODUCER_ARGUMENT=""
WORK_ARGUMENT=""
PLAN_ONLY=false
while (( $# )); do
  case "$1" in
    --producer-profile|--work-dir)
      if (( $# < 2 )) || [[ -z "$2" || "$2" == --* ]]; then
        echo "$1 requires a value" >&2
        exit 2
      fi
      if [[ "$1" == --producer-profile ]]; then
        [[ -z "${PRODUCER_ARGUMENT}" ]] || { echo "Duplicate --producer-profile" >&2; exit 2; }
        PRODUCER_ARGUMENT="$2"
      else
        [[ -z "${WORK_ARGUMENT}" ]] || { echo "Duplicate --work-dir" >&2; exit 2; }
        WORK_ARGUMENT="$2"
      fi
      shift 2
      ;;
    --plan) PLAN_ONLY=true; shift ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done
FULL_MODE="${SKILLPILOT_FULL_PACKAGE_CONFORMANCE:-false}"
[[ "${FULL_MODE}" == true || "${FULL_MODE}" == false ]] || { echo "Full-package mode must be true or false" >&2; exit 2; }
PLAN_JSON="$(python3 -B - "${PRODUCER_ARGUMENT}" "${WORK_ARGUMENT}" "${FULL_MODE}" "${PLAN_ONLY}" <<'PY_PLAN'
import hashlib
import json
from pathlib import Path
import re
import secrets
import sys
from jsonschema import Draft202012Validator
from jsonschema.exceptions import ValidationError
sys.path.insert(0, 'scripts')
import curriculum_learning_unit_artifacts as units

root = Path.cwd().resolve()
run_root = root / 'tmp/curriculum-release-model/conformance-runs'
def no_symlinks(path):
    current = root
    for part in path.relative_to(root).parts:
        current /= part
        if current.is_symlink():
            raise ValueError('Symlink component is forbidden')
def repository_file(value):
    path = Path(value)
    if '..' in path.parts or '\n' in str(path):
        raise ValueError('Unsafe repository input path')
    path = path if path.is_absolute() else root / path
    path.relative_to(root)
    no_symlinks(path)
    if not path.is_file():
        raise ValueError('Repository input must be an existing regular file')
    return path
try:
    work_argument = sys.argv[2]
    if work_argument:
        candidate = Path(work_argument)
        if '..' in candidate.parts:
            raise ValueError('Work directory must be a fresh direct child of conformance-runs')
        work = candidate if candidate.is_absolute() else root / candidate
        if work.parent != run_root or not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]{0,119}', work.name):
            raise ValueError('Work directory must be a fresh direct child of conformance-runs')
        no_symlinks(work)
        if work.exists():
            raise ValueError('Work directory already exists; refusing reuse or overwrite')
    profile_path = repository_file(sys.argv[1] or f'contracts/curriculum-package/v1.2/profiles/{units.current_build_profile_id(root)}.profile.json')
    profile = json.loads(profile_path.read_bytes())
    offer = 'entryLandscape' in profile
    schema_path = root / ('contracts/curriculum-package/v1.2/' + ('offer-' if offer else '') + 'release-model-build-profile.schema.json')
    Draft202012Validator(json.loads(schema_path.read_bytes())).validate(profile)
    if profile['package']['releaseId'] != profile['package']['packageId'] + '@' + profile['package']['packageVersion']:
        raise ValueError('Producer release identity does not match its package metadata')
    for path_key, hash_key in [('ontologyProfilePath', 'ontologyProfileSha256'), ('publicationEvidenceProfilePath', 'publicationEvidenceProfileSha256')]:
        if hashlib.sha256(repository_file(profile['contracts'][path_key]).read_bytes()).hexdigest() != profile['contracts'][hash_key]:
            raise ValueError('Producer contract profile hash mismatch')
    catalog_path = repository_file(profile['learningUnits']['catalogPath'])
    catalog = json.loads(catalog_path.read_bytes())
    if ('currentOfferBinding' in catalog) != offer or not isinstance(catalog.get('contracts'), list):
        raise ValueError('Producer catalog kind does not match its entry metadata')
    if not work_argument:
        work = run_root / (profile['profileId'] + '.' + secrets.token_hex(6))
        no_symlinks(work)
        if work.exists():
            raise ValueError('Fresh work directory collision')
    package_profile = root / ('contracts/curriculum-package/v1.2/profiles/full-standalone-' + ('learning-unit-offers' if offer else 'learning-units') + '-v1.profile.json')
    plan = {'producerProfile': str(profile_path), 'producerProfileSha256': hashlib.sha256(profile_path.read_bytes()).hexdigest(),
            'profileId': profile['profileId'], 'packageVersion': profile['package']['packageVersion'],
            'catalogPath': str(catalog_path.relative_to(root)), 'expectedContractCount': len(catalog['contracts']),
            'expectedCounts': profile['expectedCounts'], 'packageProfile': str(package_profile.relative_to(root)),
            'workDir': str(work), 'offerProfile': offer, 'fullMode': sys.argv[3] == 'true',
            'validation': 'producer schema and declared contract pins; full semantic validation runs with the actual model',
            'executedQualificationGates': []}
    if sys.argv[4] != 'true':
        run_root.mkdir(parents=True, exist_ok=True)
        no_symlinks(run_root)
        work.mkdir()  # Exclusive reservation; no existing output is ever deleted.
    print(json.dumps(plan, sort_keys=True))
except (OSError, ValueError, KeyError, TypeError, ValidationError) as error:
    raise SystemExit(str(error))
PY_PLAN
)"
if [[ "${PLAN_ONLY}" == true ]]; then
  printf '%s\n' "${PLAN_JSON}"
  exit 0
fi
PLAN_LINES="$(python3 -B -c 'import json,sys; p=json.loads(sys.argv[1]); print(p["producerProfile"]); print(p["packageProfile"]); print(p["workDir"]); print("true" if p["offerProfile"] else "false"); print(p["profileId"]); print(p["expectedContractCount"]); print(p["packageVersion"])' "${PLAN_JSON}")"
mapfile -t PLAN_VALUES <<< "${PLAN_LINES}"
PROFILE="${PLAN_VALUES[0]}"
PACKAGE_PROFILE="${PLAN_VALUES[1]}"
OUTPUT_BASE="${PLAN_VALUES[2]}"
OFFER_PROFILE="${PLAN_VALUES[3]}"
PROFILE_ID="${PLAN_VALUES[4]}"
EXPECTED_CONTRACT_COUNT="${PLAN_VALUES[5]}"
OUTPUT_A="${OUTPUT_BASE}/mathematik-a"
OUTPUT_B="${OUTPUT_BASE}/mathematik-b"
REVIEW="${OUTPUT_BASE}/redistribution-review.json"
PACKAGE_OUTPUT="${OUTPUT_BASE}/package"
printf '%s\n' "${PLAN_JSON}" > "${OUTPUT_BASE}/conformance-plan.json"
printf 'Selected producer %s, package %s, expected contracts %s, full mode %s; fresh output %s\n' "${PROFILE_ID}" "${PLAN_VALUES[6]}" "${EXPECTED_CONTRACT_COUNT}" "${FULL_MODE}" "${OUTPUT_BASE}"

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
  --generate --learning-units-candidate --producer-profile "${PROFILE}" --release-root "${OUTPUT_A}" --ledger "${REVIEW}"
python3 -B scripts/generate_curriculum_package_redistribution_review.py \
  --check --learning-units-candidate --producer-profile "${PROFILE}" --release-root "${OUTPUT_A}" --ledger "${REVIEW}"

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
[[ ! -e "${PACKAGE_STORE}" && ! -L "${PACKAGE_STORE}" ]] || { echo "Fresh package store unexpectedly exists" >&2; exit 1; }
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
if [[ "${OFFER_PROFILE}" == true ]]; then
  # Compare the actual installed package under its distinct Entry with a fresh
  # repository projection; a model-only admission does not prove this path.
  (
    cd app
    npx --no-install tsx scripts/learningUnitsMathProjectionEvidence.ts --run-native \
      --native "${OUTPUT_BASE}/repository-native.raw.json" \
      --output docs/dev/learning-units-mathematics-native-source-projection.json --check
    npx --no-install tsx scripts/learningUnitsProofs.ts installed-offers \
      --store "${PACKAGE_STORE}" --native-inventory "${OUTPUT_BASE}/repository-native.raw.json" \
      --output "${OUTPUT_BASE}/installed-offer-182-parity.json"
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
plan = json.loads((root / "conformance-plan.json").read_bytes())
if plan["offerProfile"]:
    parity = json.loads((root / "installed-offer-182-parity.json").read_bytes())
    if parity.get("admittedContractCount") != plan["expectedContractCount"] or parity.get("quarantinedContracts") != {}:
        raise SystemExit("Actual installed contract admission differs from the selected catalog")
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
