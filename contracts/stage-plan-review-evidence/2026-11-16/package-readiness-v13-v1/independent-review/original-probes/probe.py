#!/usr/bin/env python3
"""Independent read-only source review probes; writes evidence only in its own tmp directory."""
from __future__ import annotations
import contextlib
import copy
import hashlib
import io
import json
from pathlib import Path
import subprocess
import sys
import types
from unittest.mock import patch

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "scripts"))
import evaluate_curriculum_package_readiness as current
import generate_curriculum_package_v13_readiness as generator
import validate_schemas as schemas

def digest(raw):
    return hashlib.sha256(raw).hexdigest()

paths = [
    "scripts/evaluate_curriculum_package_readiness.py",
    "scripts/generate_curriculum_package_v13_readiness.py",
    "scripts/test_package_readiness_v13.py", "scripts/validate_schemas.py",
    "scripts/curriculum_package_contract_selection.py",
    "scripts/validate_curriculum_package_contracts.py",
    "scripts/validate_full_standalone_curriculum_package.py",
    "scripts/run_package_consumer_smoke.py",
    "scripts/curriculum_package_v13_contracts.py",
    "contracts/curriculum-package/v1/package-manifest.schema.json",
    "contracts/curriculum-package/v1/profiles/full-standalone-v1.profile.json",
    "contracts/curriculum-package/v1/profiles/full-standalone-v1.readiness-policy.json",
    "contracts/curriculum-package/v1/package-readiness-report.schema.json",
    "contracts/curriculum-package/v1/package-consumer-smoke-report.schema.json",
    "contracts/curriculum-package/v1.3/profiles/full-standalone-v1.3.profile.json",
    "contracts/curriculum-package/v1.3/profiles/full-standalone-v1.3.readiness-policy.json",
    "contracts/curriculum-package/v1.3/package-readiness-report.schema.json",
    schemas.RETAINED_AUTHORED_SOURCE,
    "docs/landscape-runtime.schema.json",
]
pins = {p: digest((ROOT / p).read_bytes()) for p in paths}
results = []

def passed(name, **details):
    results.append({"probe": name, "result": "PASS", **details})

def rejected(name, action):
    try:
        action()
    except (current.ReadinessError, current.package_contracts.ContractDefinitionError) as exc:
        passed(name, rejection=str(exc))
    else:
        raise AssertionError("Unexpected acceptance: " + name)

base = current.trusted_contracts()
target = current.trusted_contracts(generator.TARGET)
assert target.profile_sha256 == "b4e0f5551a456610fbe3bdc3a43b68012151c4e6b402eb897f499aef7e15b995"
assert len(current.REQUIRED_CHECK_IDS) == 13
assert len(current.FUNCTIONAL_CHECK_IDS) == 15
assert target.policy["requiredChecks"] == base.policy["requiredChecks"]
assert target.policy["consumerSmokeRunner"] == base.policy["consumerSmokeRunner"]
assert target.consumer_report_schema == base.consumer_report_schema
for path, expected in generator.generated_documents().items():
    assert path.read_bytes() == expected
passed("generated1.3-exact-base-gates-consumer-schema-runner", gates=current.REQUIRED_CHECK_IDS,
       functionalChecks=current.FUNCTIONAL_CHECK_IDS, profileSha256=target.profile_sha256)

# Load the original evaluator with its real source path and unchanged dependencies.
original_raw = subprocess.run(["git", "show", "HEAD:scripts/evaluate_curriculum_package_readiness.py"],
    cwd=ROOT, check=True, capture_output=True).stdout
original = types.ModuleType("readiness_original_review")
original.__file__ = str(ROOT / "scripts/evaluate_curriculum_package_readiness.py")
sys.modules[original.__name__] = original
exec(compile(original_raw, original.__file__, "exec"), original.__dict__)
for case in current.load_trusted_json(current.FIXTURE_DIR / "expectations.json")["cases"]:
    path = current.FIXTURE_DIR / case["input"]
    prior = original.evaluate_path(path, "manifest")
    now = current.evaluate_path(path, "manifest")
    explicit = current.evaluate_path(path, "manifest", contracts_dir=current.CONTRACT_DIR)
    assert prior == now == explicit
    passed("v1-original-exact-report-" + case["id"], reportSha256=digest(current.stable_json(now).encode()),
           status=now["decision"]["status"])

fake = OUT / "untrusted-identical-profile"
(fake / "profiles").mkdir(parents=True, exist_ok=True)
(fake / "profiles/full-standalone-v1.3.profile.json").write_bytes(
    (generator.TARGET / "profiles/full-standalone-v1.3.profile.json").read_bytes())
for directory in (generator.TARGET.parent / "v1.1", generator.TARGET.parent / "v1.2", fake):
    rejected("untrusted-directory-" + directory.name, lambda directory=directory: current.trusted_contracts(directory))

for check_id in current.REQUIRED_CHECK_IDS:
    for mutation in ("removed", "nonblocking"):
        policy = copy.deepcopy(target.policy)
        entry = next(x for x in policy["requiredChecks"] if x["id"] == check_id)
        if mutation == "removed":
            policy["requiredChecks"].remove(entry)
        else:
            entry["blocking"] = False
        rejected("policy-" + mutation + "-" + check_id,
            lambda policy=policy: current.validate_policy_contract(
                target.manifest_schema, target.profile, policy, target.report_schema, target.consumer_report_schema,
                manifest_schema_sha256=target.manifest_schema_sha256, profile_sha256=target.profile_sha256,
                report_schema_sha256=target.report_schema_sha256,
                consumer_report_schema_sha256=target.consumer_report_schema_sha256))

manifest = current.load_trusted_json(current.FIXTURE_DIR / "target-contract-only.manifest.json")
for profile_id, runtime in (("full-standalone-v1", "1.0"), ("full-standalone-v1.1", "1.1"),
                            ("full-standalone-v1.2", "1.2"), ("fake-full-standalone-v1.3", "1.3")):
    forged = copy.deepcopy(manifest)
    forged.update(releaseProfile=profile_id, runtimeContractVersion=runtime)
    path = OUT / (profile_id + ".manifest.json")
    path.write_text(current.stable_json(forged))
    report = current.evaluate_path(path, "manifest", contracts_dir=generator.TARGET)
    assert not report["decision"]["standaloneProfileReady"]
    assert report["decision"]["status"] in ("invalid", "unsupported")
    passed("v1.3-rejects-manifest-" + profile_id, status=report["decision"]["status"])

zip_path = OUT / "synthetic-original-fixture.zip"
current.build_target_zip(zip_path, base)
loaded = current.load_zip_input(zip_path, base.profile)
assert not loaded.errors
smoke = current.passing_consumer_report(loaded, target.policy["consumerSmokeRunner"])
current.validate_consumer_report_semantics(smoke, loaded, target)
for check_id in current.FUNCTIONAL_CHECK_IDS:
    forged = copy.deepcopy(smoke)
    forged["functionalChecks"] = [x for x in forged["functionalChecks"] if x["id"] != check_id]
    rejected("consumer-missing-" + check_id,
        lambda forged=forged: current.validate_consumer_report_semantics(forged, loaded, target))
external = OUT / "external-all-passing-consumer-report.json"
external.write_text(current.stable_json(smoke))
outcome = current.evaluate_consumer_report(current.external_consumer_evidence(external), loaded, target)
assert outcome[0] == "not-evaluated" and outcome[3]["status"] == "external-unattested"
passed("external-passing-report-cannot-confer-consumer-acceptance", resultCode=outcome[1])

# Exercise the real child process boundary without claiming this sentinel validates a package.
child = OUT / "argv-sentinel.py"
child.write_text("import json,pathlib,sys\npathlib.Path(__file__).with_suffix('.argv.json').write_text(json.dumps(sys.argv))\n")
try:
    current.run_full_validator_process(loaded, validator_path=child, contracts_dir=generator.TARGET, timeout_seconds=5)
except current.FullValidatorProcessError as exc:
    failure = str(exc)
else:
    raise AssertionError("Child without report was accepted")
argv = json.loads(child.with_suffix(".argv.json").read_bytes())
assert argv[argv.index("--contracts-dir") + 1] == str(generator.TARGET)
passed("actual-child-process-receives-v1.3-and-missing-report-fails", argv=argv, rejection=failure)

source = ROOT / schemas.RETAINED_AUTHORED_SOURCE
raw = source.read_bytes()
data = json.loads(raw)
assert list(data) == ["status", "goals"] and len(data["goals"]) == 44
schema = json.loads((ROOT / "docs/landscape-runtime.schema.json").read_bytes())
for name, path, input_raw, expected in (
    ("exact-path-and-bytes", source, raw, True),
    ("whitespace-mutation", source, raw + b" ", False),
    ("status-mutation", source, raw.replace(b"Exact44reviewed", b"Changed44reviewed", 1), False),
    ("invalid-json-at-exact-path", source, b"{", False),
    ("identical-bytes-other-assessment-path", source.with_name("other-reviewed-assessments.json"), raw, False),
):
    output = io.StringIO()
    with patch.object(Path, "read_bytes", return_value=input_raw), contextlib.redirect_stdout(output):
        actual = schemas.validate_file(path, schema)
    assert actual is expected, name
    passed("retained-source-" + name, accepted=actual, inputSha256=digest(input_raw),
           diagnostic=output.getvalue().strip())
assert schemas.validate_retained_authored_source(source.with_name("other.json"), raw) is None
passed("no-generic-assessment-exemption", goalCount=len(data["goals"]), sourceSha256=digest(raw))

assert pins == {p: digest((ROOT / p).read_bytes()) for p in paths}, "Reviewed sources drifted during probes"
receipt = {
    "reviewKind": "independent-technical-review-and-own-negative-probes",
    "reviewer": "/root/math_duration_ci_repair",
    "scope": "readiness v1.3 selection/gates and exact retained authoring source schema exception",
    "sourceWrites": False,
    "notes": ["Only own tmp evidence was written; source mutation probes used in-memory mocked reads.",
              "The sentinel proves real child argv propagation and safe missing-report rejection; it does not validate a package.",
              "The all-passing consumer report is synthetic and intentionally external/unattested; no package acceptance is claimed.",
              "V1 comparison uses original HEAD evaluator with the same current shared contract dependencies."],
    "head": subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, check=True, capture_output=True, text=True).stdout.strip(),
    "originalEvaluatorSha256": digest(original_raw),
    "pins": pins, "sourcePinsUnchangedAfterProbes": True,
    "probeCount": len(results), "results": results,
}
(OUT / "receipt.actual.json").write_text(json.dumps(receipt, indent=2, ensure_ascii=False) + "\n")
print(json.dumps({"status": "PASS", "probeCount": len(results), "receipt": str(OUT / "receipt.actual.json")}, indent=2))
