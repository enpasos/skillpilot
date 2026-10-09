"""Pair actual bounded source judgments; retain the genuine whole-source HOLDs."""

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parents[7]
BASE = Path(__file__).resolve().parent
A = BASE.parent / "chemie-b008-sl-nine-operative-source-independent-a-v1"


def read(path):
    return json.loads(path.read_text())


def binding(path):
    data = path.read_bytes()
    return {"path": str(path.relative_to(REPO)), "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}


def write_new(path, value):
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


checks = []


def check_refs(value):
    if isinstance(value, dict):
        if {"path", "sha256", "bytes"} <= value.keys():
            actual = binding(REPO / value["path"])
            assert actual["sha256"] == value["sha256"].removeprefix("sha256:"), value["path"]
            assert actual["bytes"] == value["bytes"], value["path"]
            checks.append(actual)
        for child in value.values():
            check_refs(child)
    elif isinstance(value, list):
        for child in value:
            check_refs(child)


own = read(BASE / "nine-numbered-standards.current-operative.actual-root-review.json")
first_a = read(A / "nine-numbered-standards.first.independent-A.verdict.json")
entry_a = read(A / "completed-sl-nine-operative-source-independent-a.integration-entry.json")
check_refs(entry_a)
check_refs(read(A / "completed-sl-nine-operative-source-independent-a.final.freeze.json"))
check_refs(read(BASE / "nine-standards.reviewed-operative.outputs.first.freeze.json"))
assert first_a["rootReviewRationalesReadBeforeThisFirstJudgment"] is False
assert first_a["historicalPeerWholeRoleVerdictsReadForThisReview"] is False
assert len(own["actualNewOperativeRecords"]) == len(first_a["records"]) == 9

rows = []
for original, independent in zip(own["actualNewOperativeRecords"], first_a["records"]):
    assert original["sourceGoalId"] == independent["sourceGoalId"]
    assert original["wholeActualSourceClause"] == independent["wholeSourceText"]
    target_ids = [edge["wholeEdge"]["canonicalGoalId"] for edge in independent["partialEdges"]]
    assert original["mappedTargetGoalIds"] == target_ids
    assert all(edge["wholeEdge"]["matchType"] == "partial" for edge in independent["partialEdges"])
    assert original["courseProfiles"] == independent["courseProfiles"] == ["GK", "LK"]
    assert original["stage"] == "SekII" and independent["stage"] == ["SekII"]
    assert original["decision"] == "ACCEPT_BOUNDED_PARTIAL_SOURCE_ROLE_CURRENT_OPERATIVE_PROJECTION"
    assert independent["decision"] == "ACCEPT_BOUNDED_PARTIAL_SOURCE_CONTRIBUTIONS"
    rows.append({
        "sourceGoalId": original["sourceGoalId"],
        "wholeSourceClause": original["wholeActualSourceClause"],
        "canonicalGoalIds": target_ids,
        "relation": "partial",
        "decision": "PAIRED_BOUNDED_SOURCE_CONTRIBUTION_ONLY",
        "rootActualReason": original["ownScientificReasonDe"],
        "independentAActualReason": independent["reviewNotes"],
        "independentALimits": independent["limits"],
        "wholeSourceStandardPerformanceApproved": False,
    })

assert sum(len(row["canonicalGoalIds"]) for row in rows) == 11
output = BASE / "nine-actual-source-roles.current-operative-independent-pair.actual.json"
write_new(output, {
    "schemaVersion": 1,
    "createdAt": datetime.now(timezone.utc).isoformat(),
    "role": "Technical pairing of genuine unchanged independent semantic first judgments and current operative counterchecks; no whole-course or performance approval",
    "rootActualOperativeReview": binding(BASE / "nine-numbered-standards.current-operative.actual-root-review.json"),
    "independentACompletedEntry": binding(A / "completed-sl-nine-operative-source-independent-a.integration-entry.json"),
    "rootOperativeOutputsFirstFreeze": binding(BASE / "nine-standards.reviewed-operative.outputs.first.freeze.json"),
    "independentAFirstFreeze": binding(A / "nine-numbered-standards.first.independent-A.freeze.json"),
    "independentAFinalFreeze": binding(A / "completed-sl-nine-operative-source-independent-a.final.freeze.json"),
    "exactCurrentBindingsVerified": list({row["path"]: row for row in checks}.values()),
    "pairedRecords": rows,
    "boundedSourceRecords": 9,
    "boundedPartialEdges": 11,
    "actualNormalFacets": "PASS all9 SekII/GK/LK",
    "actualNormalWholeAtlas": "HOLD 354 !== 395; expected count unchanged",
    "current2026PrimaryDelta": binding(A / "current-SL-2026-adaptation.primary-link.delta-HOLD.independent-A.json"),
    "rootActualAdditional403Attempts": binding(BASE / "current2026-primary-delta-root-v1/targeted-official-download-attempts.actual.json"),
    "current2026AdaptationActuallyRead": False,
    "wholeCurrentSLCourseApproved": False,
    "wholeOriginal65ReReviewClaimed": False,
    "wholeNationalSourceUnionApproved": False,
    "source19WholeApproved": False,
    "nativeDPApproved": False,
    "AorMApproved": False,
    "newScientificClosures": 0,
    "restoredM7Bindings": 0,
    "netStrictGain": 0,
    "activeWrites": [],
    "humanApproval": False,
    "humanTrial": False,
})
seal = BASE / "nine-actual-source-roles.current-operative-independent-pair.first.freeze.json"
write_new(seal, {"schemaVersion": 1, "outputs": [binding(output)], "historicalFirstJudgmentsUnchanged": True})
print(json.dumps({"output": binding(output), "seal": binding(seal), "pairedRecords": 9, "partialEdges": 11, "bindingsVerified": len({row["path"] for row in checks})}))
