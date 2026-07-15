#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
OUTPUT_BASE="tmp/curriculum-release-model"
JSON_ARCHIVE_ROOT="skillpilot-curriculum-de-gymnasium-mathematik-0.1.0-conformance.3.json"
DEFAULT_JSON_PACKAGE="${OUTPUT_BASE}/full-standalone-package/${JSON_ARCHIVE_ROOT}.zip"
JSON_PACKAGE="${SKILLPILOT_FROZEN_JSON_PACKAGE:-${DEFAULT_JSON_PACKAGE}}"
JSON_STORE="${OUTPUT_BASE}/fwu-owl-frozen-json-store"
JSON_SHA256="403cc0bc6004da549c8b9ed9fafad222fe0ddda1107806fe087cfa871a6dbcf9"
JSON_SOURCE_ROOT="${JSON_STORE}/objects/sha256/${JSON_SHA256}/${JSON_ARCHIVE_ROOT}"
FWU_ARCHIVE_ROOT="skillpilot-curriculum-de-gymnasium-mathematik-0.1.0-conformance.3.fwu-owl"
FWU_OUTPUT="${OUTPUT_BASE}/fwu-owl-package"
FWU_PACKAGE="${FWU_OUTPUT}/${FWU_ARCHIVE_ROOT}.zip"
FWU_PEER="${FWU_OUTPUT}/reproducibility-peer/${FWU_ARCHIVE_ROOT}.zip"
VALIDATION_ROOT="${OUTPUT_BASE}/fwu-owl-validation"
FWU_BUILD_REPORT="${VALIDATION_ROOT}/fwu-owl-build-summary.json"
VALIDATION_REPORT="${VALIDATION_ROOT}/fwu-owl-package-validation-report.json"
JSON_INSTALL_REPORT="${VALIDATION_ROOT}/frozen-json-install-report.json"
JSON_VERIFY_REPORT="${VALIDATION_ROOT}/frozen-json-verify-report.json"
VALIDATION_EVIDENCE="${VALIDATION_ROOT}/evidence"
VALIDATION_WORK="${VALIDATION_ROOT}/work"
TOOLS_REPORT="${VALIDATION_ROOT}/tools-report.json"
CORE_CHECKOUT="tmp/lehrplan-ontologie"
EXPECTED_CONTENT_DIGEST="sha256:e83936aaf3645ff5f6e8132c4a801bd4bd66f55d3c0304a5deda3d6a5d194101"

export LC_ALL=C.UTF-8
export TZ=UTC
export SOURCE_DATE_EPOCH=315532800

cd "${ROOT_DIR}"

ensure_pinned_java() {
  local required_java_version
  local required_corretto_version
  local observed
  local install_dir
  local archive

  required_java_version="$(tr -d '[:space:]' < .java-version)"
  required_corretto_version="$(tr -d '[:space:]' < .corretto-version)"
  observed="$(java -version 2>&1 || true)"
  if ! printf '%s\n' "${observed}" | grep -Fq "version \"${required_java_version}\"" \
    || ! printf '%s\n' "${observed}" | grep -Fq "Corretto-${required_corretto_version}"; then
    install_dir="${ROOT_DIR}/tmp/ci-tools/amazon-corretto-${required_corretto_version}"
    archive="${ROOT_DIR}/tmp/ci-tools/amazon-corretto-${required_corretto_version}-linux-x64.tar.gz"
    mkdir -p -- "${install_dir}"
    if [[ ! -x "${install_dir}/bin/java" ]]; then
      curl -fsSL \
        "https://corretto.aws/downloads/resources/${required_corretto_version}/amazon-corretto-${required_corretto_version}-linux-x64.tar.gz" \
        -o "${archive}"
      tar -xzf "${archive}" --strip-components=1 -C "${install_dir}"
    fi
    export JAVA_HOME="${install_dir}"
    export PATH="${JAVA_HOME}/bin:${PATH}"
    observed="$(java -version 2>&1 || true)"
  fi
  if ! printf '%s\n' "${observed}" | grep -Fq "version \"${required_java_version}\"" \
    || ! printf '%s\n' "${observed}" | grep -Fq "Corretto-${required_corretto_version}"; then
    echo "Pinned Amazon Corretto ${required_corretto_version} is unavailable." >&2
    exit 1
  fi
}

# This is a frozen, versioned FWU candidate. Never rebuild its JSON input from
# the current checkout: doing so can silently combine a newer semantic model
# with the old DPK-008 hashes below.
if [[ -L "${JSON_PACKAGE}" || ! -f "${JSON_PACKAGE}" ]]; then
  cat >&2 <<EOF
Frozen DPK-007a JSON package is missing:
  ${JSON_PACKAGE}

Restore the exact archived package with SHA-256 ${JSON_SHA256}, or point
SKILLPILOT_FROZEN_JSON_PACKAGE at that regular ZIP file. This wrapper will not
rebuild the frozen input from the current checkout.
EOF
  exit 1
fi

OBSERVED_JSON_SHA256="$(sha256sum -- "${JSON_PACKAGE}" | awk '{print $1}')"
if [[ "${OBSERVED_JSON_SHA256}" != "${JSON_SHA256}" ]]; then
  cat >&2 <<EOF
Refusing JSON package with the wrong frozen identity:
  path:     ${JSON_PACKAGE}
  expected: ${JSON_SHA256}
  observed: ${OBSERVED_JSON_SHA256}

Restore the exact DPK-007a archive, or set SKILLPILOT_FROZEN_JSON_PACKAGE to
its path. The current source tree must not be used to recreate this candidate.
EOF
  exit 1
fi

ensure_pinned_java

bash scripts/provision_pinned_robot.sh
if [[ -L "${VALIDATION_ROOT}" || ( -e "${VALIDATION_ROOT}" && ! -d "${VALIDATION_ROOT}" ) ]]; then
  echo "Refusing unsafe FWU validation output root: ${VALIDATION_ROOT}" >&2
  exit 1
fi
rm -rf -- "${VALIDATION_ROOT}"
mkdir -m 0700 -p -- "${VALIDATION_ROOT}"

python3 -B scripts/provision_curriculum_package.py install \
  --store "${JSON_STORE}" \
  --zip "${JSON_PACKAGE}" \
  > "${JSON_INSTALL_REPORT}"

python3 -B scripts/provision_curriculum_package.py verify \
  --store "${JSON_STORE}" \
  --outer-sha256 "${JSON_SHA256}" \
  > "${JSON_VERIFY_REPORT}"

python3 -B - \
  "${JSON_INSTALL_REPORT}" \
  "${JSON_VERIFY_REPORT}" \
  "${JSON_SOURCE_ROOT}" \
  "${JSON_SHA256}" \
  "${EXPECTED_CONTENT_DIGEST}" <<'PY'
import json
from pathlib import Path
import sys

install_path, verify_path, source_root = map(Path, sys.argv[1:4])
expected_sha, expected_content = sys.argv[4:]
install = json.loads(install_path.read_text(encoding="utf-8"))
verify = json.loads(verify_path.read_text(encoding="utf-8"))
expected_release = (
    "org.skillpilot.curriculum.de.gymnasium.mathematik@0.1.0-conformance.3"
)

if install.get("status") != "passed" or install.get("operation") != "install":
    raise SystemExit("frozen JSON package installation did not pass")
if install.get("outerZipSha256") != expected_sha:
    raise SystemExit("frozen JSON installation report changed the outer ZIP identity")
if install.get("contentDigest") != expected_content:
    raise SystemExit("frozen JSON installation report changed the content digest")
if install.get("releaseId") != expected_release:
    raise SystemExit("frozen JSON installation report changed the release identity")
if verify.get("status") != "passed" or verify.get("operation") != "verify":
    raise SystemExit("frozen JSON package verification did not pass")
if verify.get("outerZipSha256") != expected_sha:
    raise SystemExit("frozen JSON verification report changed the outer ZIP identity")
if verify.get("releaseId") != expected_release:
    raise SystemExit("frozen JSON verification report changed the release identity")
if verify.get("manifestFiles") != 912:
    raise SystemExit("frozen JSON verification report changed the manifest file count")
if not source_root.is_dir() or source_root.is_symlink():
    raise SystemExit(f"verified frozen JSON source root is unavailable: {source_root}")
PY

python3 -B scripts/check_curriculum_fwu_owl_validation_tools.py \
  --report "${TOOLS_REPORT}" \
  >/dev/null

npm --prefix app run --silent export:fwu-owl-package -- \
  --source-json "${JSON_PACKAGE}" \
  --source-root "${JSON_SOURCE_ROOT}" \
  --work-directory "${OUTPUT_BASE}/fwu-owl-source-work" \
  --output-directory "${FWU_OUTPUT}" \
  --core-checkout "${CORE_CHECKOUT}" \
  --source-date-epoch "${SOURCE_DATE_EPOCH}" \
  --expect-manifest-file-count 817 \
  --expect-entry-count 819 \
  --expect-binary-resource-count 757 \
  --expect-release-support-count 32 \
  --expect-logical-artifact-count 111 \
  --expect-content-digest "${EXPECTED_CONTENT_DIGEST}" \
  --expect-fallback-area-count 1 \
  > "${FWU_BUILD_REPORT}"

python3 -B scripts/validate_fwu_owl_curriculum_package.py \
  --zip "${FWU_PACKAGE}" \
  --source-json "${JSON_PACKAGE}" \
  --reproducibility-peer "${FWU_PEER}" \
  --robot-jar tmp/tools/robot.jar \
  --work-dir "${VALIDATION_WORK}" \
  --evidence-dir "${VALIDATION_EVIDENCE}" \
  --report "${VALIDATION_REPORT}"

python3 -B - "${FWU_BUILD_REPORT}" "${VALIDATION_REPORT}" <<'PY'
import hashlib
import json
from pathlib import Path
import sys

build_path, report_path = map(Path, sys.argv[1:])
build = json.loads(build_path.read_text(encoding="utf-8"))
report = json.loads(report_path.read_text(encoding="utf-8"))

gate_ids = [
    "archive-security",
    "manifest-schema",
    "profile-contract",
    "inventory",
    "contract-bindings",
    "offline-schema-catalog",
    "semantic-content-index",
    "field-registry-coverage",
    "rdf-syntax",
    "rdf-segment-order",
    "rdf-bundle",
    "core-binding",
    "ontology-profile",
    "shacl",
    "owl2-dl",
    "reasoner",
    "binary-sidecars",
    "reproducibility",
]
expected_counts = {
    "zipEntries": 819,
    "manifestFiles": 817,
    "rdfSegments": 8,
    "rdfTriples": 824452,
    "logicalArtifacts": 111,
    "fieldRegistryEntries": 454,
    "binaryResources": 757,
    "binaryBytes": 1696390279,
}
expected_zip = "abab1d8aac3e9394af26c614bbf231954ba45ab11f725dd0f93f088820dc3f94"
expected_manifest = "29f308424d1aeba9095f0e800253acadcdfaca0562dfa1fc37741c77c76023b3"
expected_content = "sha256:e83936aaf3645ff5f6e8132c4a801bd4bd66f55d3c0304a5deda3d6a5d194101"

if report.get("status") != "valid" or report.get("diagnostics") != []:
    raise SystemExit("finished FWU-OWL report is not release-clean and valid")
gates = report.get("gates", [])
if [gate.get("id") for gate in gates] != gate_ids or any(
    gate.get("status") != "passed" for gate in gates
):
    raise SystemExit("finished FWU-OWL report does not pass the exact 18-gate contract")
if report.get("counts") != expected_counts:
    raise SystemExit(f"unexpected FWU-OWL validation counts: {report.get('counts')!r}")
input_binding = report.get("input", {})
if (
    input_binding.get("bytes") != 2362455128
    or input_binding.get("sha256") != expected_zip
    or input_binding.get("manifestSha256") != expected_manifest
):
    raise SystemExit("FWU-OWL report does not bind the frozen ZIP and manifest")
package = report.get("package", {})
if package.get("contentDigest") != expected_content:
    raise SystemExit("FWU-OWL report does not bind the shared semantic content digest")
source = package.get("sourceJsonPackage", {})
if source.get("sha256") != "403cc0bc6004da549c8b9ed9fafad222fe0ddda1107806fe087cfa871a6dbcf9":
    raise SystemExit("FWU-OWL report does not bind the frozen source JSON package")
ontology = report.get("ontologyEvidence", {})
expected_tools = {
    "rdfSyntax": ("skillpilot-ntriples-stream-validator", "1.0.0"),
    "shacl": ("pySHACL", "0.30.1"),
    "owl2Dl": ("ROBOT", "1.9.10"),
    "reasoner": ("HermiT", "1.4.5.456"),
}
for name, (tool, version) in expected_tools.items():
    evidence = ontology.get(name, {})
    if evidence.get("status") != "passed" or evidence.get("tool") != tool or evidence.get("version") != version:
        raise SystemExit(f"unexpected {name} tool evidence: {evidence!r}")
    evidence_path = report_path.parent / evidence["report"]
    if not evidence_path.is_file():
        raise SystemExit(f"missing bound evidence file: {evidence_path}")
    digest = hashlib.sha256(evidence_path.read_bytes()).hexdigest()
    if digest != evidence.get("reportSha256"):
        raise SystemExit(f"evidence hash mismatch: {evidence_path}")
if ontology["shacl"].get("violationCount") != 0 or ontology["shacl"].get("warningCount") != 0:
    raise SystemExit("SHACL evidence is not clean")
if ontology["reasoner"].get("consistent") is not True or ontology["reasoner"].get("unsatisfiableClassCount") != 0:
    raise SystemExit("HermiT evidence is not clean")
reproducibility = report.get("reproducibility", {})
if reproducibility != {
    "status": "passed",
    "sourceDateEpoch": 315532800,
    "locale": "C.UTF-8",
    "timezone": "UTC",
    "runA": {"zipSha256": expected_zip, "manifestSha256": expected_manifest},
    "runB": {"zipSha256": expected_zip, "manifestSha256": expected_manifest},
    "byteIdentical": True,
}:
    raise SystemExit("FWU-OWL reproducibility evidence differs from the frozen pair")
primary = build.get("primary", {})
peer = build.get("reproducibilityPeer", {})
if (
    primary.get("sha256") != expected_zip
    or peer.get("sha256") != expected_zip
    or primary.get("manifestSha256") != expected_manifest
    or peer.get("manifestSha256") != expected_manifest
    or build.get("byteIdentical") is not True
    or build.get("contentDigest") != expected_content
):
    raise SystemExit("FWU-OWL builder summary differs from independent validation")
PY

echo "FWU-OWL package conformance passed: frozen JSON source, reproducible Core-first package, independent 18-gate structural/SHACL/OWL-2-DL/HermiT validation, and exact evidence bindings."
