"""Read-only integration review; no builds, tests, native FP calculations or active writes."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
Q = "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/"
PBASE = Q + "wirtschaft-common343-native-P44-Book343-binding-technical-a-INERT-v1/"
MANIFEST = PBASE + "activation-ready/44-P-configs-and-whole-Book-pointer.activation-ready.manifest.json"
REG = "curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json"
BOOK = "app/scripts/config/goal-books/de-gym-economics-current-canonical.json"
START = datetime.now(timezone.utc).isoformat()
bindings = {}


def sha(raw):
    return "sha256:" + hashlib.sha256(raw).hexdigest()


def read_bytes(path):
    actual = Path(path) if Path(path).is_absolute() else ROOT / path
    raw = actual.read_bytes()
    key = str(actual.relative_to(ROOT)) if actual.is_relative_to(ROOT) else str(actual)
    bindings.setdefault(key, {"path": key, "sha256": sha(raw), "bytes": len(raw)})
    return raw


def read(path):
    return json.loads(read_bytes(path))


def write(name, value):
    path = OUT / name
    with path.open("x", encoding="utf8") as stream:
        stream.write(value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    return str(path.relative_to(ROOT))


runner = read_bytes("/tmp/economics_stable_checkpoint_ci_root.py")
runner_copy = write("actual-observed-root-CI-runner.READONLY.py", runner.decode())
workflow = read_bytes(".github/workflows/ci.yml").decode()
package = read("app/package.json")
floors = read("app/scripts/config/curriculum-maturity-floor-policy.json")
assert len(floors["floors"]) == 10
modified_files = ["app/scripts/generateCurriculumQualityStatus.ts", "app/scripts/testDeepUnderstandingRollout.ts", "app/scripts/testGoalBookReviewBundle.ts", "contracts/goal-description-review/v2/goal-description-review-input.schema.json"]
read_bytes("app/scripts/reportDeepUnderstandingRollout.ts")
read_bytes("contracts/goal-description-review/v3/goal-description-review-input.schema.json")
read_bytes("contracts/goal-evidence/v2/goal-evidence-profile.schema.json")
read_bytes("app/scripts/testGoalBookPublicationsBuild.ts")
read_bytes("app/scripts/testHardLearningRouteValidation.ts")
read_bytes("scripts/validate_schemas.py")
read_bytes("scripts/test_validate_schemas_symlinks.py")
read_bytes("scripts/check_curriculum_spelling.mjs")
read_bytes("scripts/check_curriculum_spelling.test.mjs")
diffs = []
for path in modified_files:
    read_bytes(path)
    diffs.append(subprocess.check_output(["git", "diff", "--", path], cwd=ROOT, text=True))
diff_path = write("actual-reviewed-four-file-root-diff.READONLY.txt", "\n".join(diffs))
production_exact = []
for path, functions in [
    ("app/scripts/generateCurriculumQualityStatus.ts", ["evaluateDeepUnderstandingQa", "deriveCurriculumMaturity"]),
    ("app/scripts/reportDeepUnderstandingRollout.ts", ["hasStrictDeepUnderstandingCompletion", "generateDeepUnderstandingRollout"]),
]:
    before = subprocess.check_output(["git", "show", "HEAD:" + path], cwd=ROOT, text=True)
    after = read_bytes(path).decode()
    for function in functions:
        def extract(source):
            match = re.search(r"^export (?:const|function) " + function + r"\b", source, re.M)
            assert match
            end = re.search(r"^\}", source[match.start():], re.M)
            assert end
            return source[match.start():match.start() + end.end()]
        assert extract(before) == extract(after)
        production_exact.append({"path": path, "function": function, "exactToHEAD": True, "functionBytesSha256": sha(extract(after).encode())})
reg = read(REG)
economics = next(s for s in reg["subjects"] if s["subject"] == "wirtschaftswissenschaften")
discovery_path = "app/scripts/memoryCardReviewConfigDiscovery.ts"
discovery = read_bytes(discovery_path).decode()
assert read_bytes(discovery_path) == subprocess.check_output(["git", "show", "HEAD:" + discovery_path], cwd=ROOT)
default_m_path = "curricula/DE/Gymnasium/quality/memory-card-review/canonical-economics-full.config.json"
ready_m_path = Q + "wirtschaft-common343-qualified-M6-integration-preparation-root-v1/memory343.live-canonical-and-views.activation-ready.config.json"
default_m = read(default_m_path)
current_m = read(economics["memoryReviewConfigPath"])
ready_m = read(ready_m_path)
native_serialization = lambda value: json.dumps(value, ensure_ascii=False, separators=(",", ":"))
identity_fields = ["reviewId", "landscapeId", "landscapePath", "ruleVersion", "scope"]
assert all(native_serialization(default_m[field]) == native_serialization(ready_m[field]) for field in identity_fields)
assert len(current_m["visibilityScopes"]) == 34 and len(ready_m["visibilityScopes"]) == 35
assert all(native_serialization(scope) == native_serialization(ready_m["visibilityScopes"][index]) for index, scope in enumerate(default_m["visibilityScopes"]))
assert all(native_serialization(scope) == native_serialization(ready_m["visibilityScopes"][index]) for index, scope in enumerate(current_m["visibilityScopes"]))
assert ready_m["visibilityScopes"][34] == {"label": "de-de-gym-seki-economics.view.json", "viewPath": "curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-seki-economics.view.json"}
assert len({scope["viewPath"] for scope in ready_m["visibilityScopes"]}) == 35
assert all(isinstance(scope["label"], str) and scope["label"].strip() and isinstance(scope["viewPath"], str) and scope["viewPath"].strip() for scope in ready_m["visibilityScopes"])
assert default_m.get("visibilityScopeCoverageRequired") is None
assert current_m["visibilityScopeCoverageRequired"] is ready_m["visibilityScopeCoverageRequired"] is True
changed_current_m_fields = sorted(key for key in current_m.keys() | ready_m.keys() if current_m.get(key) != ready_m.get(key))
assert changed_current_m_fields == ["cardReviewPath", "reportPath", "reviewPath", "semanticKindLedgerPath", "visibilityScopes"]
for field in ["reviewPath", "cardReviewPath"]:
    read_bytes(ready_m[field])
routing_path = write("actual-independent-memory-Discovery-identity-current34-prefix-andSekIappend.KEEP.READONLY.json", {
    "checkedAt": datetime.now(timezone.utc).isoformat(), "decision": "KEEP",
    "nativeContractPath": discovery_path, "nativeContractBytesExactToHEAD": True,
    "defaultConfigPath": default_m_path, "currentConfigPath": economics["memoryReviewConfigPath"], "activationReadyConfigPath": ready_m_path,
    "allFiveDefaultIdentityFieldsExactIncludingScopeSerialization": identity_fields,
    "defaultTwoVisibilityScopesExactPrefix": True, "allCurrent34WholeVisibilityScopesExactPrefixAndOrder": True,
    "onlyAdditionalView": ready_m["visibilityScopes"][34], "all35PathsUniqueAndLabelsNonempty": True,
    "coverageDefaultUndefinedToTrueAllowedStrengthening": True, "coverageCurrentTrueRemainsTrue": True,
    "changedFieldsAgainstCurrentConfigOnly": changed_current_m_fields,
    "qualifiedGoalAndCardJSONLReadWithoutMutation": [ready_m["reviewPath"], ready_m["cardReviewPath"]],
    "nativeActiveDiscoveryOrMCheckExecuted": False, "reason": "Whole direct JSON comparisons meet every actual discovery identity/prefix/coverage contract. An alphabetic resort or a changed scope label would fail these same unchanged conditions. Active registry selection and final M validation still require Root guarded integration.",
    "activeWrites": 0, "nativeFPsRecomputed": 0, "humanApprovalOrLearnerTrial": False,
})
protected = []
for name, expected in [("mathematik", 807), ("physik", 478)]:
    subject = next(s for s in reg["subjects"] if s["subject"] == name)
    sem = read(subject["semanticKindLedgerPath"])
    ordinary = [d["goalId"] for d in sem["decisions"] if d["decisionStatus"] == "authoritative" and d["semanticKind"] == "curricularAtomic"]
    assert len(ordinary) == len(set(ordinary)) == expected
    protected.append({"subject": name, "currentAuthoritativeOrdinaryGoalCountRead": expected, "semanticKindLedgerPath": subject["semanticKindLedgerPath"], "testRequiresStrictM7ForAllCurrentIds": True})
manifest = read(MANIFEST)
referenced = set()
errors = []


def add(path):
    if not isinstance(path, str) or path.startswith(("http:", "https:")):
        return
    if Path(path).is_absolute():
        errors.append("Absolute repository input: " + path)
    elif path.startswith(("curricula/", "app/scripts/", "contracts/", "docs/", "app/public/assets/")):
        referenced.add(path)


def config(path):
    add(path)
    data = read(path)
    for key, value in data.items():
        if key == "outputPath":
            continue
        if key.endswith("Path") and isinstance(value, str):
            add(value)
        elif key.endswith("Paths") and isinstance(value, list):
            for item in value:
                add(item)
    return data


for entry in manifest["configs"]:
    config(entry["activationReadyConfigPath"])
    config(entry["sourceConfigPath"])
config(manifest["Book"]["activationReadyConfigPath"])
config(manifest["Book"]["sourceConfigPath"])
config(BOOK)
for path in economics["positiveEvidenceConfigPaths"]:
    config(path)
core = read(manifest["expectedQualifiedCoreBinding"]["path"])
add(manifest["expectedQualifiedCoreBinding"]["path"])
for goal in core["goals"]:
    for resource in goal.get("resourceLinks", []):
        if resource.get("url", "").startswith("/assets/"):
            add("app/public" + resource["url"])
committable = {path.decode() for path in subprocess.check_output(["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z", "--"], cwd=ROOT).split(b"\0") if path}
aliases, input_rows = [], []
for path in sorted(referenced):
    actual = ROOT / path
    if not actual.is_file():
        errors.append("Missing file: " + path)
        continue
    resolved = actual.resolve(strict=True)
    if not resolved.is_relative_to(ROOT):
        errors.append("Resolved path escapes repository: " + path)
        continue
    resolved_relative = str(resolved.relative_to(ROOT))
    if path not in committable or resolved_relative not in committable:
        errors.append("Source or resolved target is ignored/noncommittable: " + path)
    links = [str(ROOT.joinpath(*Path(path).parts[:index]).relative_to(ROOT)) for index in range(1, len(Path(path).parts) + 1) if ROOT.joinpath(*Path(path).parts[:index]).is_symlink()]
    if links:
        aliases.append({"path": path, "symlinkComponents": links, "resolvedPath": resolved_relative})
    read_bytes(path)
    input_rows.append({**bindings[path], "resolvedPath": resolved_relative, "sourceAndTargetCommittable": path in committable and resolved_relative in committable, "symlinkComponents": links})
spec = importlib.util.spec_from_file_location("readonly_curriculum_symlink_helper", ROOT / "scripts/validate_schemas.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
symlink_errors = module.curriculum_symlink_errors(ROOT)
assert not errors and not symlink_errors
tracked_books = subprocess.check_output(["git", "ls-files", "--", "app/public/lernzielbuch"], cwd=ROOT, text=True).splitlines()
assert not tracked_books
portability_path = write("actual-readonly-587-P-Book-resource-input-link-alias-portability.READONLY.json", {
    "checkedAt": datetime.now(timezone.utc).isoformat(), "inputFiles": input_rows,
    "referencedFileCount": len(input_rows), "errors": errors, "aliasLinks": aliases,
    "actualNativeCurriculumSymlinkHelper": "scripts/validate_schemas.py:curriculum_symlink_errors", "nativeHelperErrors": symlink_errors,
    "currentREGPConfigCountAtRead": len(economics["positiveEvidenceConfigPaths"]), "activationReadyPConfigCount": manifest["PConfigCount"], "activationEnvelopeGoalCount": manifest["ordinaryPRecords"],
    "generatedBookOutputExcludedFromInputPortability": manifest["Book"]["outputPath"], "trackedGeneratedBookFiles": tracked_books,
    "noAliasArtifactRebinding": True, "buildOrCIRunsStarted": 0,
})
gaps = [
    {"id": "CI-GAP-1", "commands": ["npm --prefix app run quality:memory-card-review:check:all"], "workflow": ".github/workflows/ci.yml:518", "runnerCoverage": "Checks Economics memoryReviewConfigPath only; prequality:curriculum-status invokes report:all, which is not the same explicit native check:all command.", "reason": "Close the existing workflow's native validation coverage for all current registered memory configs after the shared status generator changes; retain protected curricula.", "when": "After stable activation only"},
    {"id": "CI-GAP-2", "commands": ["python3 -B scripts/test_validate_schemas_symlinks.py -v"], "workflow": ".github/workflows/ci.yml:604", "runnerCoverage": "validate_schemas.py checks actual links; its malformed-link regression suite was omitted.", "reason": "Final P/Book inputs are portable in the actual read-only run, but preserve the workflow's portable-alias negative regression coverage.", "when": "After stable activation only"},
    {"id": "CI-GAP-3", "commands": ["node --test scripts/check_curriculum_spelling.test.mjs", "node scripts/check_curriculum_spelling.mjs"], "workflow": ".github/workflows/ci.yml:457", "runnerCoverage": "validate_competency_wording.py is present; the spelling checker and its regression test are omitted.", "reason": "Current bilingual goal descriptions changed, so the existing wording check does not substitute for the workflow's orthography check.", "when": "After stable activation only"},
]
runner_text = runner.decode()
assert "npm('quality:memory-card-review:check:all')" in runner_text
assert "['python3','-B','scripts/test_validate_schemas_symlinks.py','-v']" in runner_text
assert "['node','--test','scripts/check_curriculum_spelling.test.mjs']" in runner_text
assert "['node','scripts/check_curriculum_spelling.mjs']" in runner_text
for gap in gaps:
    gap["status"] = "CLOSED_IN_ACTUAL_ROOT_RUNNER_COMMAND_PLAN_NOT_EXECUTED"
pipeline = package["scripts"]["test:goal-book-pipeline"]
assert "test:goal-book-review-bundle" in pipeline
assert "test:physics-goal-book-inputs" in pipeline
assert "test:goal-description-review-contracts" in pipeline
assert "test:goal-book-build" in package["scripts"]["pretest:goal-book-pipeline"]
assert "source-coverage-evidence:test" in package["scripts"]["quality:source-coverage-audit:check"]
review_path = write("bounded-independent-CI-root-test-diff-andMemoryRouting.KEEP-three-command-gaps-now-closed.READONLY.json", {
    "startedAt": START, "completedAt": datetime.now(timezone.utc).isoformat(), "role": "INDEPENDENT_READONLY_CI_COMMAND_COVERAGE_AND_ROOT_TEST_DIFF_REVIEW", "reviewer": "/root/economics_final56_current_round_a",
    "decisionRootTestAndSchemaDiff": "KEEP", "diffPath": diff_path,
    "reason": "Economics pending D/V findings remain explicit M7 failures; the new test requires current scope/P/A/M for each current ordinary goal, exact set identities and six required validation checks. It asserts M6 while CQR303 is open. Math807 and Physics478 are additionally required to satisfy strict M7 across every actual current ID. Production completion and maturity functions are byte-exact to HEAD. V2 schemas add a closed profile branch, preserving AI/human status constraints, with full bilingual and malformed/AI-upgrade negative fixtures reached by the existing pipeline.",
    "unchangedProductionGateFunctions": production_exact, "actualProtectedDenominatorsRead": protected,
    "changedGeneratorSemantics": "Economics now uses compiled jurisdiction, explicit whole CrossStage views, actual course/duration filters, visible whole assessed-competency prerequisite paths, and full inherited/transitive hard prerequisite closure. Both new issue sets enter CQR104's pass conjunction. This strengthens scope/material checks; it does not alter M5/M6/M7 transition rules.",
    "newCQR104NegativeFixtureCoverageLimit": "The scheduled status regeneration exercises every actual Economics scope, but testHardLearningRouteValidation does not directly call the new private whole-material closure/coverage branches. No fresh negative execution of those private branches is claimed here.",
    "existingCoverage": [
        "LayerA validates schemas/UUIDs/wording/graph/exam markdown/hard routes/view filters/source registry/composition/roles/course mappings/source extraction availability and evidence inventory.",
        "quality:source-coverage-audit:check already runs sourceCoverageAndApplicabilityRegression.test.ts before checking generated source coverage.",
        "After activation, LayerA derives A/M config and all44 P config paths dynamically from currentREG, then runs the changed testDeepUnderstandingRollout.",
        "Status regeneration includes CQR000..005,101..104,201..203,301,302,303,401,501 and curriculum-status:check invokes all10 protected maturity floors.",
        "Books force-build all5 then publication-check; the npm pretest hook includes native evidence loader/five-publication tests and original-source tests; goal-book-pipeline reaches the changed V2 Markdown and V2/V3 schema-negative tests in testGoalBookReviewBundle plus Physics, model, renderer, publication and runtime tests.",
        "Lint and build:application cover TypeScript/application integration after the fifth book; build:application also rechecks book publications.",
        "Docs and git diff --check are covered; actual read-only git ls-files confirms no generated app/public/lernzielbuch publications are tracked.",
    ],
    "concreteRelevantWorkflowGapsInitiallyFoundAndNowAddedByRoot": gaps, "remainingGapsWithinBoundedIntegrationScope": [], "memoryRoutingIndependentKeepReceipt": routing_path, "pipelineBookScript": pipeline, "pipelinePretestHook": package["scripts"]["pretest:goal-book-pipeline"],
    "portabilityReceipt": portability_path, "allFinalPBookInputLinksPortable": True,
    "boundedNotWholeWorkflowAcceptance": True, "unrelatedRemotePluginBackendDemoAndUIJobsNotRunOrClaimed": True,
    "preActivationSnapshot": {"currentREGPConfigs": len(economics["positiveEvidenceConfigPaths"]), "readyPConfigs": 44, "readyOrdinaryGoals": 343},
    "activeWrites": 0, "nativeFPsComputed": 0, "buildsOrCIRunsStarted": 0, "newSourceGoalCardDScienceReviews": 0,
    "disclosure": "Previously authored NAIRU Goal/P and 7c prerequisite/scope candidates; this task reviews Root CI/test/schema changes and path portability only, without a new independent review of those own content candidates.",
})
read_bytes(Path(__file__))
guards = []
for path, before in list(bindings.items()):
    actual = Path(path) if Path(path).is_absolute() else ROOT / path
    raw = actual.read_bytes()
    after = {"path": path, "sha256": sha(raw), "bytes": len(raw)}
    assert after == before, "Actual reviewed input changed: " + path
    guards.append({"before": before, "after": after, "exact": True})
guard_path = write("actual-reviewed-inputs-and-portability-exact.endguards.READONLY.json", {"startedAt": START, "completedAt": datetime.now(timezone.utc).isoformat(), "allExact": True, "artifacts": guards})
artifacts = []
for path in sorted(OUT.iterdir()):
    if path.is_file():
        raw = path.read_bytes()
        artifacts.append({"path": str(path.relative_to(ROOT)), "sha256": sha(raw), "bytes": len(raw)})
sealed_path = write("actual-bounded-CI-root-diff-andMemoryRouting-KEEP-closed3gaps-587-portable-inputs.SEALED.receipt.json", {
    "sealedAt": datetime.now(timezone.utc).isoformat(), "HEAD": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip(), "role": "SEALED_INDEPENDENT_READONLY_CI_AND_PORTABILITY_REVIEW",
    "reviewPath": review_path, "portabilityPath": portability_path, "memoryRoutingReceipt": routing_path, "rootRunnerObservedCopy": runner_copy, "inputEndguardsPath": guard_path,
    "rootTestAndSchemaDiff": "KEEP", "memoryRoutingFix": "KEEP", "relevantExistingWorkflowCommandGapsInitiallyFound": 3, "allThreeNowIncludedInActualRootRunner": True, "remainingBoundedCommandGaps": 0, "portableReferencedInputs": len(input_rows), "portabilityErrors": 0, "aliasLinks": len(aliases), "allInputEndguardsExact": True, "inputGuardCount": len(guards),
    "activeWrites": 0, "buildsOrCIRunsStarted": 0, "newNativePASSClaims": False, "artifacts": artifacts,
})
print(json.dumps({"seal": sealed_path, "sha256": sha((ROOT / sealed_path).read_bytes()), "referencedInputs": len(input_rows), "endguards": len(guards), "rootTestDiff": "KEEP", "memoryRoutingFix": "KEEP", "initiallyFoundCommandGapsNowClosed": 3}))
