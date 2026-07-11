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
PACKAGE_STORE="${OUTPUT_BASE}/provisioned-store"
PACKAGE_INSTALL_REPORT="${PACKAGE_OUTPUT}/provision-install.json"
PACKAGE_VERIFY_REPORT="${PACKAGE_OUTPUT}/provision-verify.json"
PACKAGE_ACTIVATE_REPORT="${PACKAGE_OUTPUT}/provision-activate.json"
PACKAGE_STATUS_REPORT="${PACKAGE_OUTPUT}/provision-status.json"
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

python3 -B - "${PACKAGE_STORE}" <<'PY'
import sys
from pathlib import Path

sys.path.insert(0, "scripts")
import provision_curriculum_package as provisioner

provisioner.remove_private_tree(Path(sys.argv[1]))
PY
rm -rf -- "${PACKAGE_OUTPUT}"
mkdir -p "${PACKAGE_OUTPUT}"
npm --prefix app run --silent export:full-standalone-package -- \
  --release-root "${OUTPUT_A}" \
  --output-dir "${PACKAGE_OUTPUT}" \
  --archive-root "${PACKAGE_ARCHIVE_ROOT}" \
  --supported-skillpilot-software ">=0.1.0 <1.0.0" \
  --zip \
  --expect-entry-count 913 \
  --expect-manifest-file-count 911 \
  --expect-binary-asset-count 756 \
  --expect-content-digest "${EXPECTED_CONTENT_DIGEST}" \
  > "${PACKAGE_BUILD_REPORT}"

python3 -B scripts/validate_full_standalone_curriculum_package.py \
  --zip "${PACKAGE_ZIP}" \
  --report "${PACKAGE_VALIDATION_REPORT}"

python3 -B - "${PACKAGE_ZIP}" "${PACKAGE_VALIDATION_REPORT}" <<'PY'
import hashlib
import json
import sys
import zipfile
from pathlib import Path

zip_path = Path(sys.argv[1])
report = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
with zipfile.ZipFile(zip_path) as archive:
    root = report["package"]["archiveRoot"]
    manifest_bytes = archive.read(f"{root}/metadata/manifest.json")
    manifest = json.loads(manifest_bytes)
    closure_records = [
        record for record in manifest["files"]
        if record.get("role") == "dependency-closure"
    ]
    if len(closure_records) != 1:
        raise SystemExit("real package has no exact dependency-closure record")
    closure = json.loads(archive.read(f"{root}/{closure_records[0]['path']}"))

expected = {
    "manifestSha256": hashlib.sha256(manifest_bytes).hexdigest(),
    "closureDigest": closure["closureDigest"],
    "definitionIndexDigest": closure["definitionIndexDigest"],
}
actual = {key: report["package"].get(key) for key in expected}
if report.get("reportFormatVersion") != 2:
    raise SystemExit("real package validator report is not protocol v2")
if report.get("validatorId") != "skillpilot-full-standalone-package-validator-v2":
    raise SystemExit("real package validator identity is not v2")
if manifest.get("supportedSkillpilotSoftware") != ">=0.1.0 <1.0.0":
    raise SystemExit("real package does not accept curriculum-consumer API version 0.1.0")
if actual != expected:
    raise SystemExit(f"real package validator binding mismatch: {actual!r} != {expected!r}")
if any(gate.get("status") != "passed" for gate in report.get("gates", {}).values()):
    raise SystemExit("real package validator report does not pass every gate")
PY

python3 -B scripts/evaluate_curriculum_package_readiness.py \
  --zip "${PACKAGE_ZIP}" \
  --report "${PACKAGE_READINESS_REPORT}" \
  --expect-status not-ready-incomplete \
  --compact \
  >/dev/null

python3 -B scripts/provision_curriculum_package.py install \
  --store "${PACKAGE_STORE}" \
  --zip "${PACKAGE_ZIP}" \
  > "${PACKAGE_INSTALL_REPORT}"

PACKAGE_OUTER_SHA256="$(python3 -B - "${PACKAGE_INSTALL_REPORT}" <<'PY'
import json
import sys

print(json.load(open(sys.argv[1], encoding="utf-8"))["outerZipSha256"])
PY
)"

python3 -B scripts/provision_curriculum_package.py verify \
  --store "${PACKAGE_STORE}" \
  --outer-sha256 "${PACKAGE_OUTER_SHA256}" \
  > "${PACKAGE_VERIFY_REPORT}"

python3 -B scripts/provision_curriculum_package.py activate \
  --store "${PACKAGE_STORE}" \
  --outer-sha256 "${PACKAGE_OUTER_SHA256}" \
  --expected-active-sha256 none \
  --consumer-version 0.1.0 \
  > "${PACKAGE_ACTIVATE_REPORT}"

python3 -B scripts/provision_curriculum_package.py status \
  --store "${PACKAGE_STORE}" \
  > "${PACKAGE_STATUS_REPORT}"

python3 -B - \
  "${PACKAGE_BUILD_REPORT}" \
  "${PACKAGE_INSTALL_REPORT}" \
  "${PACKAGE_VERIFY_REPORT}" \
  "${PACKAGE_ACTIVATE_REPORT}" \
  "${PACKAGE_STATUS_REPORT}" <<'PY'
import json
import sys

build, install, verify, activate, status = [
    json.load(open(path, encoding="utf-8")) for path in sys.argv[1:]
]
if install.get("outerZipSha256") != build.get("zipSha256"):
    raise SystemExit("provisioner outer ZIP identity differs from builder")
if install.get("contentDigest") != build.get("contentDigest"):
    raise SystemExit("provisioner contentDigest differs from builder")
if verify.get("outerZipSha256") != install.get("outerZipSha256"):
    raise SystemExit("provisioner verify identity differs from install")
if verify.get("manifestFiles") != build.get("manifestFileCount"):
    raise SystemExit("provisioner verify manifest count differs from builder")
active_sha = activate.get("activeLockSha256")
if not isinstance(active_sha, str) or status.get("activeLockSha256") != active_sha:
    raise SystemExit("provisioner activation/status lock binding differs")
packages = (status.get("active") or {}).get("packages") or []
if len(packages) != 1 or packages[0].get("outerZipSha256") != build.get("zipSha256"):
    raise SystemExit("provisioner active lock does not select the built ZIP")
PY

echo "Curriculum release-model conformance passed: independent model validation, byte-identical model build, reproducible real ZIP, independent full-package validation, secure content-addressed provisioning/activation, and honest incomplete readiness."
