"""Independently verify conservative containers; current meaning is qualified separately."""
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
Q = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11"
A = Q / "wirtschaft-four-needed-of-C12-current-qualified-context-native-owner-followers-AUTHOR-INERT-a-v1"


def read(path):
    return json.loads(path.read_text())


def meta(path):
    raw = path.read_bytes()
    return {"path": str(path.relative_to(ROOT)), "sha256": "sha256:" + hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}


def verify(m):
    assert meta(ROOT / m["path"]) == m, m["path"]


def selected_record(path, goal_id):
    rows = [json.loads(line) for line in path.read_text().splitlines() if line.strip()]
    return next(row for row in rows if row["goalId"] == goal_id)


seal_path = next(A.glob("SEALED-*.json"))
seal = read(seal_path)
verify(seal["manifest"])
verify(seal["endguards"])
manifest = read(ROOT / seal["manifest"]["path"])
for artifact in manifest["files"]:
    verify(artifact)
guards = read(ROOT / seal["endguards"]["path"])["guards"]
assert len(guards) == 306
for guard in guards:
    assert guard["wholeBytesExact"] and guard["before"] == guard["after"]
    verify(guard["after"])
plan = read(A / "actual-four-needed-native-groups-original-science-and-eight-reused-strict-contexts.AUTHOR-INERT.json")
verify(plan["independentCurrentC12ScienceSeal"])
current_science_seal = read(ROOT / plan["independentCurrentC12ScienceSeal"]["path"])
for artifact in current_science_seal["artifactBindings"]:
    verify(artifact)
preserved = read(A / "actual-eight-original-scientific-records-runs-and-four-current-contexts-preserved.AUTHOR-INERT.json")
record_binding_fields = {"campaignId", "roundId", "bundleFingerprint", "bookDigest", "pageFingerprint"}
run_binding_fields = {"campaignId", "roundId", "bundleFingerprint", "bookDigest", "promptFingerprint", "criteriaFingerprint", "independenceGroupId", "batchId", "batchInputFingerprint", "goalIds", "outputDigest", "inputArtifacts"}
checks = []
for row in preserved["records"]:
    verify(row["originalRecord"])
    verify(row["newRecord"])
    before = selected_record(ROOT / row["originalRecord"]["path"], row["goalId"])
    after = selected_record(ROOT / row["newRecord"]["path"], row["goalId"])
    assert {k:v for k,v in before.items() if k not in record_binding_fields} == {k:v for k,v in after.items() if k not in record_binding_fields}
    checks.append({"goalId": row["goalId"], "round": row["round"], "wholeScientificRecordExactOutsideFiveContainerFields": True, "actualBefore": row["originalRecord"], "actualAfter": row["newRecord"]})
assert len(checks) == 8
for row in preserved["runs"]:
    verify(row["originalRun"])
    verify(row["currentRun"])
    before = read(ROOT / row["originalRun"]["path"])
    after = read(ROOT / row["currentRun"]["path"])
    assert {k:v for k,v in before.items() if k not in run_binding_fields} == {k:v for k,v in after.items() if k not in run_binding_fields}
    assert all(before[k] == after[k] for k in ["runId", "provider", "model", "startedAt", "completedAt", "generationParametersFingerprint", "blindToOtherRuns", "status"])
for group in plan["nativeGroups"]:
    gid = group["goalIds"][0]
    base = ROOT / group["outputDirectory"]
    qualified = read(ROOT / group["currentQualifiedWholeInput"]["path"])
    for label, role in [("round-a", "first"), ("round-b", "second")]:
        source = next(r for r in group["originalPlan"]["actualOriginalRounds"] if r["round"] == role)
        old = next(r for r in read(ROOT / source["reviewInput"]["path"])["goals"] if r["goalId"] == gid)
        new = read(base / label / "description-review-input.json")["goals"][0]
        assert all(old[k] == new[k] for k in ["goalFingerprint", "canonicalContext", "currentTitleDe", "currentTitleEn", "currentDescriptionDe", "currentDescriptionEn"])
        assert new["reviewContext"]["evidenceProfile"] == qualified["wholeActualCurrentPositiveRecord"]
        op = old["reviewContext"]["evidenceProfile"]
        np = new["reviewContext"]["evidenceProfile"]
        assert op is not None
        if gid.startswith(("167", "9ea")):
            assert op == np
        else:
            assert op["profile"]["applicationCaseBriefs"] == np["profile"]["applicationCaseBriefs"]
            assert op["profile"]["coverageExpectations"] == np["profile"]["coverageExpectations"]
            assert op["status"] == np["status"] == "needs_human_review"
    before = read(ROOT / group["originalPlan"]["actualOriginalResolution"]["path"])["synthesis"]
    after = read(base / "resolutions" / (gid + ".resolution.json"))["synthesis"]
    assert {k:v for k,v in before.items() if k not in ["synthesisId", "dissent"]} == {k:v for k,v in after.items() if k not in ["synthesisId", "dissent"]}
    assert [{k:v for k,v in d.items() if k != "dissentId"} for d in before["dissent"]] == [{k:v for k,v in d.items() if k != "dissentId"} for d in after["dissent"]]
path = OUT / "01-actual-independent-root-four-C12-native-containers-whole-science-preserved-current-context-qualified.receipt.json"
assert not path.exists()
value = {"recordedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "actualReviewer": "/root; current Codex assistant, exact model revision not exposed", "status": "KEEP-four-native-owner-followers-not-four-strict-closures", "authorSeal": meta(seal_path), "actualAuthorArtifactsVerified": len(manifest["files"]), "actualInputGuardsVerified": len(guards), "existingCurrentMeaningQualification": plan["independentCurrentC12ScienceSeal"], "actualOriginalWholeScientificComparisons": checks, "wholeEightRunFactsAndFourSynthesesPreserved": True, "currentPBoundary": "167/9ea whole old P exact;099/eee actual four qualified profile strings and four metadata fields differ, cases/coverage/status preserved. The already read complete C12 meaning/P24/practice qualification is retained, no historical description restart.", "originalProbePreserved": {"exitCode": 1, "baseline": 291, "candidate": 295, "directReady": seal["directReadyGoals"], "indirectGain": seal["indirectGainedGoals"], "stillOpen": seal["openGoalIds"]}, "newScientificDescriptionReviews": 0, "strictGainClaimed": 0, "humanApprovalClaim": False, "activeWrites": 0}
path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
assert read(path) == value
print(json.dumps({"status": "PASS", "wholeScientificRecords": 8, "wholeRunFacts": 8, "wholeSyntheses": 4, "inputGuards": len(guards), "authorArtifacts": len(manifest["files"]), "strictGainClaimed": 0}))
