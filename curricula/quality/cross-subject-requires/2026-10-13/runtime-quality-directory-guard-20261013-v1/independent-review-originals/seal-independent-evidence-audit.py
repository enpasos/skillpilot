# SPDX-License-Identifier: Apache-2.0
"""Read-only exact binding and focused execution audit; writes this fresh review receipt only."""
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import xml.etree.ElementTree as ET

REPO = Path.cwd()
REVIEW = Path(__file__).resolve().parent
AUTHOR = REPO / "tmp/cross-subject-requires/runtime-quality-directory-guard-20261013"


def binding(path):
    path = Path(path)
    data = path.read_bytes()
    return {
        "path": str(path.relative_to(REPO)) if path.is_relative_to(REPO) else str(path),
        "sha256": "sha256:" + hashlib.sha256(data).hexdigest(),
        "byteLength": len(data),
    }


def check(row):
    actual = binding(REPO / row["path"])
    assert actual == row, (row, actual)


def same_payload(first, second):
    a, b = binding(first), binding(second)
    assert a["sha256"] == b["sha256"] and a["byteLength"] == b["byteLength"], (a, b)
    return {"first": a, "second": b, "byteIdentical": True}


def suites(base, variant):
    result = []
    for path in sorted((base / f"build-{variant}/test-results/test").glob("TEST-*.xml")):
        root = ET.parse(path).getroot()
        result.append({
            "xml": binding(path), "name": root.attrib["name"],
            **{key: int(root.attrib[key]) for key in ["tests", "failures", "errors", "skipped"]},
            "cases": [
                {"name": case.attrib["name"],
                 "outcome": "failed" if case.find("failure") is not None else
                    "skipped" if case.find("skipped") is not None else "passed",
                 "failureType": case.find("failure").get("type") if case.find("failure") is not None else None,
                 "failureMessage": case.find("failure").get("message") if case.find("failure") is not None else None}
                for case in root.findall("testcase")
            ],
        })
    return result


def assert_counts(rows, tests, failures):
    assert sum(row["tests"] for row in rows) == tests
    assert sum(row["failures"] for row in rows) == failures
    assert all(row["errors"] == row["skipped"] == 0 for row in rows)


state = json.loads((REVIEW / "pre-replay-bindings.independent.json").read_text())
index = json.loads((AUTHOR / "author-candidate.index.json").read_text())
for row in [state["authorIndex"]] + state["checkedAuthorBindings"] + state["originalActiveBindings"] + state["productionActiveBindings"]:
    check(row)
for row in state["authorRegressionTestClasses"]:
    check(row)
for rows in state["replaySourceSets"].values():
    for row in rows:
        check(row)
check(state["copiedInit"])

executions = json.loads((REVIEW / "execution.independent-replay.json").read_text())["executions"]
assert [(row["variant"], row["exitCode"]) for row in executions] == [("candidate", 0), ("original-control", 1)]
author_suites = {variant: suites(AUTHOR, variant) for variant in ["candidate", "original-control"]}
review_suites = {variant: suites(REVIEW, variant) for variant in ["candidate", "original-control"]}
for rows in [author_suites["candidate"], review_suites["candidate"]]:
    assert len(rows) == 2
    assert_counts(rows, 8, 0)
for rows in [author_suites["original-control"], review_suites["original-control"]]:
    assert len(rows) == 1
    assert_counts(rows, 4, 3)
for variant in ["candidate", "original-control"]:
    def outcomes(rows):
        return [(row["name"], [(case["name"], case["outcome"]) for case in row["cases"]]) for row in rows]
    assert outcomes(author_suites[variant]) == outcomes(review_suites[variant])
    log = (REVIEW / f"{variant}.independent-replay.log").read_text()
    assert f"ISOLATED_QUALITY_GUARD variant={variant} java=25.0.2" in log
    assert str(REVIEW / f"build-{variant}/classes/java/main") in log
    assert str(REVIEW / f"build-{variant}/classes/java/test") in log
    assert "generateClaudePluginPublication SKIPPED" in log
    assert "processResources SKIPPED" in log
    assert "processTestResources SKIPPED" in log
    assert "> Task :compileJava\n" in log and "> Task :compileTestJava\n" in log
    assert "UP-TO-DATE" not in log
    assert ("BUILD SUCCESSFUL" if variant == "candidate" else "4 tests completed, 3 failed") in log

main_class = "classes/java/main/com/skillpilot/backend/landscape/LandscapeService.class"
test_class = "classes/java/test/com/skillpilot/backend/landscape/CurriculumDirectoryScanTest.class"
pruned_class = "classes/java/test/com/skillpilot/backend/landscape/PrunedFileTreeTest.class"
class_reproduction = [
    same_payload(AUTHOR / f"build-{variant}" / suffix, REVIEW / f"build-{variant}" / suffix)
    for variant in ["candidate", "original-control"]
    for suffix in [main_class, test_class, pruned_class]
]
identical_regression_classes = same_payload(REVIEW / "build-candidate" / test_class, REVIEW / "build-original-control" / test_class)
assert binding(REVIEW / "build-candidate" / main_class)["sha256"] != binding(REVIEW / "build-original-control" / main_class)["sha256"]

scan_source = REVIEW / "isolated-src/test/java/com/skillpilot/backend/landscape/CurriculumDirectoryScanTest.java"
lines = scan_source.read_text().splitlines()
critical_start = next(i + 1 for i, line in enumerate(lines) if "void excludesQualityLandscapesAtEveryRelativeDepthWithoutReloadingForReviewChanges()" in line)
critical_end = next(i for i, line in enumerate(lines[critical_start:], critical_start + 1) if "void acceptsQualityNamedRootNeighborDirectoriesAndJsonFilenameWithoutChangingOtherSourceScopes()" in line) - 3
statement_checks = [
    "FileTime.fromMillis(10_000)", "FileTime.fromMillis(30_000)",
    "FileTime.fromMillis(40_000)", "FileTime.fromMillis(50_000)",
    "FileTime.fromMillis(20_000)", "isSameAs(cached)", "isNotSameAs(cached)",
    'writeLandscape(metadata, "metadata-candidate", "Changed excluded metadata")',
    'getLandscapeIdForGoal(id + "-goal")',
]
critical_text = "\n".join(lines[critical_start - 1:critical_end])
for statement in statement_checks:
    assert statement in critical_text, statement

receipt = {
    "schemaVersion": 1,
    "status": "PASS_independent_evidence_audit_and_fresh_focused_replay_only_NOT_applied",
    "recordedAt": datetime.now(timezone.utc).isoformat(),
    "reviewer": {"agent": "/root/requires_parallel_review/quality_guard_evidence_audit", "model": "GPT-6.1 Sol", "reasoningEffort": "Ultra", "role": "independent technical execution-evidence reviewer"},
    "author": {"agent": "/root/requires_runtime_path", "independentFromReviewer": True},
    "license": "Apache-2.0",
    "reviewScope": "Exact input, compile, class, log, XML and bounded regression-execution evidence for the isolated Quality-directory guard. Parent handles the separate full implementation review.",
    "reviewedAuthorIndex": state["authorIndex"],
    "reviewedPatch": index["entryPoints"]["exactPatch"],
    "authorEvidenceBindings": state["checkedAuthorBindings"],
    "preReplayBindingReceipt": binding(REVIEW / "pre-replay-bindings.independent.json"),
    "freshReplay": {
        "directory": str(REVIEW.relative_to(REPO)),
        "runner": binding(REVIEW / "run-independent-replay.sh"),
        "initScript": state["copiedInit"],
        "executionRecord": binding(REVIEW / "execution.independent-replay.json"),
        "executions": executions,
        "logs": [binding(REVIEW / f"{variant}.independent-replay.log") for variant in ["candidate", "original-control"]],
        "suites": review_suites,
        "allMainAndTestCompilationTasksActuallyExecuted": True,
        "existingClassesOrTestResultCachesReused": False,
        "publicationGenerationAndBothResourceTasksSkipped": True,
        "classReproductionFromFreshCompilation": class_reproduction,
        "identicalRegressionTestClassAcrossVariants": identical_regression_classes,
    },
    "originalAuthorSuiteAudit": author_suites,
    "results": {
        "authorCandidate": {"tests": 8, "failures": 0, "errors": 0, "skipped": 0},
        "freshCandidate": {"tests": 8, "failures": 0, "errors": 0, "skipped": 0},
        "authorOriginalControl": {"tests": 4, "failures": 3, "errors": 0, "skipped": 0},
        "freshOriginalControl": {"tests": 4, "failures": 3, "errors": 0, "skipped": 0},
        "allCaseOutcomesReproduced": True,
        "candidateAndOriginalMainClassesDiffer": True,
        "bothVariantMainAndTestClassesMatchAuthorBytes": True,
    },
    "criticalReloadTestAssessment": {
        "source": binding(scan_source), "methodStartLine": critical_start, "methodEndLine": critical_end,
        "sequence": [
            "Initial allowed landscape has timestamp 10,000 ms; four excluded real landscape sources and excluded metadata have later timestamps 30,000 ms.",
            "All excluded landscape IDs and their goal-index entries must be absent; loaded fingerprint and direct scanner timestamp both equal 10,000 ms.",
            "Excluded sources change to 40,000 ms; excluded metadata becomes a structurally genuine landscape at 50,000 ms.",
            "After forcibly permitting the reload check, the allowed cached object must remain identical; the new excluded metadata landscape remains absent; both timestamp checks remain 10,000 ms.",
            "The allowed landscape changes to timestamp 20,000 ms, lower than every excluded future-relative timestamp. After permitting the reload check, object identity must change, title becomes After, fingerprint becomes 20,000 ms and catalog stays restricted to the allowed ID.",
        ],
        "meaningful": True,
        "reason": "The assertions separately exercise catalog exclusion, goal-index exclusion, ignored-source timestamp stability, no accidental cache refresh, and a genuine accepted edit which would be suppressed if ignored later timestamps poisoned the max-timestamp watermark.",
        "futureTimestampMeaning": "Future relative to the allowed fixture watermark, not future relative to wall-clock time; deterministic fixed millisecond timestamps avoid sleeps and scheduler timing.",
        "controlLimit": "The three original-code controls fail earlier at catalog-membership assertions. They establish a real regression on original code but do not isolate the timestamp defect as a separate mutation test. The fresh candidate executes the later timestamp/cache assertions in full.",
        "testScopeLimit": "Synthetic local filesystem fixtures and reflective check-throttle reset; no complete learner-state, package installation, host-client or production reload acceptance.",
    },
    "additionalBoundedCoverage": [
        "Exact lowercase quality directory components at global, other, Gymnasium and deeply nested FOS locations are excluded.",
        "Configured root and ancestor named quality, quality-neighbor directories, uppercase Quality, quality.json, input and archive retain acceptance.",
        "Sorted duplicate preference, regular-file symlink reload, mapping fingerprint/order, unreadable-tree errors and directory-link exclusion are exercised.",
        "All four PrunedFileTree tests actually run with zero skipped permission-dependent tests in both author candidate and fresh candidate XML.",
    ],
    "postReplayFreshness": {
        "authorIndexAndAll26NamedEvidenceBindingsExact": True,
        "all14OriginalActiveInputsExact": True,
        "all444ActiveProductionJavaSourcesExact": True,
        "allCopiedReviewerSourceInputsExact": True,
        "authorCompiledTestClassesExact": True,
        "candidateSourceOrEvidenceFilesModifiedByReviewer": False,
    },
    "isolation": {
        "reviewSourceCopiesAndBuildOutputsOnly": True,
        "freshProjectCachesPerVariant": True,
        "activeSourceTestsViewsQaNativeRuntimeOrLearnerStateChanged": False,
        "rootRunningCiIndexReadOrWritten": False,
        "activeCodePatchApplied": False,
        "archiveWritten": False,
    },
    "acceptance": {
        "fullIndependentImplementationApprovalClaimed": False,
        "nativeGateApprovalClaimed": False,
        "requiresOwnerPlacementOrSourceApprovalClaimed": False,
        "packageOrHostAcceptanceClaimed": False,
        "fullCiAcceptanceClaimed": False,
        "publishedOrDeployed": False,
    },
    "auditSealHelper": binding(Path(__file__)),
}
destination = REVIEW / "test-compile-execution.independent-review-v1.json"
with destination.open("x") as output:
    output.write(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"review": binding(destination), "candidateTests": 8, "candidateFailures": 0,
                  "originalControlTests": 4, "originalControlFailures": 3,
                  "allAuthorAndActiveInputBindingsExact": True}, indent=2))
