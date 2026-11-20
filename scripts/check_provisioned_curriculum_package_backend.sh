#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STORE_DIR="$(cd "${1:?expected the verified active package store}" && pwd -P)"
OUTPUT_REPORT="${2:?expected the package backend test report path}"
OUTER_SHA256="${3:?expected the verified outer ZIP digest}"
TEST_CLASS="com.skillpilot.backend.curriculumpackage.ProvisionedCurriculumPackageConformanceTest"
BUILD_DIR="${SKILLPILOT_BACKEND_BUILD_DIR:-${ROOT_DIR}/backend/build}"
if [[ "${BUILD_DIR}" != /* ]]; then BUILD_DIR="${ROOT_DIR}/backend/${BUILD_DIR}"; fi

(
  cd "${ROOT_DIR}/backend"
  SKILLPILOT_CONFORMANCE_PACKAGE_STORE="${STORE_DIR}" SKILLPILOT_BACKEND_BUILD_DIR="${BUILD_DIR}" \
    ./gradlew --no-daemon test --tests "${TEST_CLASS}" --rerun
)

python3 -B - "${BUILD_DIR}/test-results/test/TEST-${TEST_CLASS}.xml" "${TEST_CLASS}" \
  "${STORE_DIR}/locks/active.json" "${OUTER_SHA256}" "${OUTPUT_REPORT}" <<'PY'
import hashlib
import json
import sys
from pathlib import Path
from xml.etree import ElementTree

source, expected_class, lock_path, digest, destination = sys.argv[1:]
suite = ElementTree.parse(source).getroot()
cases = suite.findall("testcase")
expected_method = "loadsTheRealProvisionedMathematicsReleaseWithoutRepositoryDiscovery()"
if (suite.get("name") != expected_class or suite.get("tests") != "1"
        or any(suite.get(key) != "0" for key in ("skipped", "failures", "errors"))
        or len(cases) != 1 or cases[0].get("classname") != expected_class
        or cases[0].get("name") != expected_method):
    raise SystemExit("Expected a fresh successful real-package backend test with zero skips")
lock = Path(lock_path).read_bytes()
if [package["outerZipSha256"] for package in json.loads(lock)["packages"]] != [digest]:
    raise SystemExit("Backend test store does not have the verified package as its only active ZIP")
report = {"testClass": expected_class, "testMethod": expected_method,
          "outerZipSha256": digest, "activeLockSha256": hashlib.sha256(lock).hexdigest(),
          "passed": 1, "skipped": 0}
Path(destination).write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(f"Real package backend test passed with zero skips for {digest}")
PY
