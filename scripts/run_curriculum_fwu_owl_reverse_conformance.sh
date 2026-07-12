#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
OUTPUT_BASE="${ROOT_DIR}/tmp/curriculum-release-model"
FWU_ARCHIVE="skillpilot-curriculum-de-gymnasium-mathematik-0.1.0-conformance.3.fwu-owl.zip"
FWU_PACKAGE="${OUTPUT_BASE}/fwu-owl-package/${FWU_ARCHIVE}"
FWU_VALIDATION_REPORT="${OUTPUT_BASE}/fwu-owl-validation/fwu-owl-package-validation-report.json"
FINAL_ROOT="${OUTPUT_BASE}/fwu-owl-reverse"
BACKUP_ROOT="${OUTPUT_BASE}/.fwu-owl-reverse.previous.$$"
REVERSE_OUTPUT="${FINAL_ROOT}/output"
REVERSE_EVIDENCE="${FINAL_ROOT}/evidence"
REVERSE_REPORT="${FINAL_ROOT}/reverse-compilation-report.json"
PROVISIONED_STORE="${FINAL_ROOT}/provisioned-store"
INSTALL_REPORT="${FINAL_ROOT}/provision-install.json"
VERIFY_REPORT="${FINAL_ROOT}/provision-verify.json"

export LC_ALL=C.UTF-8
export TZ=UTC
export SOURCE_DATE_EPOCH=315532800

cd "${ROOT_DIR}"

# DPK-008d is a heavyweight release-conformance lane. Its only semantic input
# is a freshly rebuilt package that has already passed the complete DPK-008c
# 18-gate validation. Ordinary CI runs the bounded selftests instead.
bash scripts/run_curriculum_fwu_owl_package_conformance.sh

if [[ ! -f "${FWU_PACKAGE}" || ! -f "${FWU_VALIDATION_REPORT}" ]]; then
  echo "Fresh validated FWU-OWL inputs are unavailable." >&2
  exit 1
fi

if [[ -L "${FINAL_ROOT}" || ( -e "${FINAL_ROOT}" && ! -d "${FINAL_ROOT}" ) ]]; then
  echo "Refusing unsafe reverse-conformance output root: ${FINAL_ROOT}" >&2
  exit 1
fi
if [[ -e "${BACKUP_ROOT}" ]]; then
  echo "Refusing pre-existing reverse-conformance backup root: ${BACKUP_ROOT}" >&2
  exit 1
fi

had_previous=false
completed=false
if [[ -d "${FINAL_ROOT}" ]]; then
  mv -- "${FINAL_ROOT}" "${BACKUP_ROOT}"
  had_previous=true
fi

restore_previous() {
  if [[ "${completed}" == true ]]; then
    return
  fi
  if [[ -e "${FINAL_ROOT}" ]]; then
    rm -rf -- "${FINAL_ROOT}"
  fi
  if [[ "${had_previous}" == true && -d "${BACKUP_ROOT}" ]]; then
    mv -- "${BACKUP_ROOT}" "${FINAL_ROOT}"
  fi
}
trap restore_previous EXIT HUP INT TERM

python3 -B scripts/run_fwu_owl_reverse_compiler_hermetic.py \
  --fwu-owl-zip "${FWU_PACKAGE}" \
  --validation-report "${FWU_VALIDATION_REPORT}" \
  --output-dir "${REVERSE_OUTPUT}" \
  --evidence-dir "${REVERSE_EVIDENCE}" \
  --report "${REVERSE_REPORT}" \
  --expect-entry-count 911 \
  --expect-manifest-file-count 909 \
  --expect-checksum-row-count 910 \
  --expect-logical-artifact-count 111 \
  --expect-binary-resource-count 757 \
  --expect-binary-bytes 1696390279

python3 -B scripts/validate_curriculum_fwu_owl_reverse_compilation_contract.py \
  --report "${REVERSE_REPORT}"

mapfile -t reverse_bindings < <(python3 -B - "${REVERSE_REPORT}" <<'PY'
import json
from pathlib import Path
import sys

report_path = Path(sys.argv[1]).resolve(strict=True)
report = json.loads(report_path.read_text(encoding="utf-8"))
run = report["runs"]["runA"]
for relative in (run["output"]["path"], run["validationReceipt"]["path"]):
    candidate = (report_path.parent / relative).resolve(strict=True)
    candidate.relative_to(report_path.parent)
    print(candidate)
print(run["output"]["sha256"])
PY
)

if [[ "${#reverse_bindings[@]}" -ne 3 ]]; then
  echo "Reverse report did not resolve exactly one primary package and validator receipt." >&2
  exit 1
fi
PRIMARY_PACKAGE="${reverse_bindings[0]}"
PRIMARY_VALIDATION_REPORT="${reverse_bindings[1]}"
PRIMARY_SHA256="${reverse_bindings[2]}"

python3 -B scripts/provision_curriculum_package.py install \
  --store "${PROVISIONED_STORE}" \
  --zip "${PRIMARY_PACKAGE}" \
  > "${INSTALL_REPORT}"

python3 -B scripts/provision_curriculum_package.py verify \
  --store "${PROVISIONED_STORE}" \
  --outer-sha256 "${PRIMARY_SHA256}" \
  > "${VERIFY_REPORT}"

python3 -B - \
  "${REVERSE_REPORT}" \
  "${PRIMARY_VALIDATION_REPORT}" \
  "${INSTALL_REPORT}" \
  "${VERIFY_REPORT}" <<'PY'
import hashlib
import json
from pathlib import Path
import sys

reverse_path, validator_path, install_path, verify_path = map(Path, sys.argv[1:])
reverse = json.loads(reverse_path.read_text(encoding="utf-8"))
validator = json.loads(validator_path.read_text(encoding="utf-8"))
install = json.loads(install_path.read_text(encoding="utf-8"))
verify = json.loads(verify_path.read_text(encoding="utf-8"))
output = reverse["runs"]["runA"]["output"]

expected_content = "sha256:e83936aaf3645ff5f6e8132c4a801bd4bd66f55d3c0304a5deda3d6a5d194101"
if reverse.get("status") != "valid" or reverse.get("diagnostics") != []:
    raise SystemExit("reverse compilation receipt is not clean and valid")
if output.get("contentDigest") != expected_content:
    raise SystemExit("reconstructed package changed the frozen semantic content digest")
if hashlib.sha256(validator_path.read_bytes()).hexdigest() != reverse["runs"]["runA"]["validationReceipt"]["sha256"]:
    raise SystemExit("primary JSON validator receipt hash differs from reverse receipt")
if validator.get("status") != "valid" or any(
    gate.get("status") != "passed" for gate in validator.get("gates", {}).values()
):
    raise SystemExit("primary reconstructed JSON package is not independently valid")
if install.get("outerZipSha256") != output.get("sha256"):
    raise SystemExit("provisioner installation does not bind the reconstructed ZIP")
if install.get("contentDigest") != expected_content:
    raise SystemExit("provisioner installation changed the semantic content digest")
if verify.get("outerZipSha256") != output.get("sha256"):
    raise SystemExit("provisioner verification does not bind the reconstructed ZIP")
if verify.get("manifestFiles") != 909:
    raise SystemExit("provisioner verification observed an unexpected manifest inventory")
PY

completed=true
trap - EXIT HUP INT TERM
if [[ "${had_previous}" == true ]]; then
  rm -rf -- "${BACKUP_ROOT}"
fi

echo "FWU-OWL reverse conformance passed: isolated double reconstruction, independent validation, byte identity, and safe install/verify without original JSON or authoring checkout."
