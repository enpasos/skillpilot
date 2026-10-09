#!/usr/bin/env python3
"""Pair existing independent candidate judgments without granting native gates."""
# SPDX-License-Identifier: Apache-2.0
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[6]
BASE = OUT.parent


def read(relative):
    return json.loads((BASE / relative).read_text(encoding="utf-8"))


def binding(path):
    raw = path.read_bytes()
    return {"path": str(path.relative_to(ROOT)), "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}


def normalize(row):
    return {"path": row["path"], "sha256": row["sha256"].removeprefix("sha256:"), "bytes": row["bytes"]}


verified = {}
local_only = {}


def verify_bindings(value):
    if isinstance(value, dict):
        if all(key in value for key in ["path", "sha256", "bytes"]):
            expected = normalize(value)
            path = ROOT / expected["path"]
            if path.is_relative_to(ROOT):
                assert binding(path) == expected, f"Changed binding: {expected['path']}"
                verified[expected["path"]] = expected
            else:
                raw = path.read_bytes()
                assert hashlib.sha256(raw).hexdigest() == expected["sha256"] and len(raw) == expected["bytes"]
                local_only[str(path)] = expected
        for child in value.values():
            verify_bindings(child)
    elif isinstance(value, list):
        for child in value:
            verify_bindings(child)


a2_entry_name = "biology-molecular-genetics-two-raster-remedies-independent-v-a-v1/neutral-completed-two-actual-raster-remedies-independent-A.review.entry.json"
a7_entry_name = "biology-molecular-genetics-first-seven-independent-v-a-v1/neutral-completed-seven-actual-image-independent-A.review.entry.json"
b7_entry_name = "biology-molecular-genetics-first-seven-independent-v-b-v1/two-raster-remediation-independent-followup-v1/completed-current-seven-actual-visual-candidate-independent-b.entry.json"
a2_entry, a7_entry, b7_entry = [read(n) for n in [a2_entry_name, a7_entry_name, b7_entry_name]]
a2_name = "biology-molecular-genetics-two-raster-remedies-independent-v-a-v1/two-actual-raster-remedies.pixel-FIRST.independent-A.verdict.json"
a7_name = "biology-molecular-genetics-first-seven-independent-v-a-v1/seven-actual-raster-first.independent-A.verdict.json"
a2 = read(a2_name)
a7 = read(a7_name)
a_selected = {row["goalId"]: (row, a7_name, f"/images/{i}") for i, row in enumerate(a7["images"]) if row["ordinal"] in [1, 2, 3, 4, 6]}
for i, row in enumerate(a2["images"]):
    a_selected[row["goalId"]] = (row, a2_name, f"/images/{i}")
assert len(a_selected) == 7
rows = []
for b_row in b7_entry["current7ActualCandidateBindings"]:
    a_row, a_path, a_pointer = a_selected[b_row["goalId"]]
    assert a_row["decision"] == "PASS_KEEP_RASTER_CANDIDATE"
    assert b_row["currentCandidateDecision"] == "KEEP_CANDIDATE"
    assert normalize(a_row["selectedActualOriginal"]) == normalize(b_row["actualRaster"])
    b_verdict_path = ROOT / b_row["ownActualVerdictBinding"]["path"]
    b_result = json.loads(b_verdict_path.read_text())["results"][int(b_row["ownVerdictJsonPointer"].split("/")[-1])]
    assert b_result["goalId"] == a_row["goalId"]
    assert normalize(b_result["actualOriginal"]) == normalize(a_row["selectedActualOriginal"])
    assert b_result["candidateDecision"] == "KEEP_CANDIDATE"
    rows.append({"ordinal": a_row["ordinal"], "goalId": a_row["goalId"], "selectedActualRaster": normalize(a_row["selectedActualOriginal"]),
                 "independentA": {"verdict": binding(BASE / a_path), "jsonPointer": a_pointer, "decision": a_row["decision"]},
                 "independentB": {"verdict": normalize(b_row["ownActualVerdictBinding"]), "jsonPointer": b_row["ownVerdictJsonPointer"], "decision": b_result["candidateDecision"]},
                 "scope": "Actual original/360/680 pixel candidate review; five exact prior pixel judgments reused, two exact new raster followups. No third root pixel approval.",
                 "currentNativeVApproved": False})
rows.sort(key=lambda row: row["ordinal"])
for value in [a2_entry, a7_entry, b7_entry, a2, rows]:
    verify_bindings(value)

root4_name = "biologie-molecular-genetics-four-precise-material-remedies-independent-root-v1/four-targeted-v4-material-remedies.independent-root.scientific-FIRST.json"
b4_entry_name = "biologie-molecular-genetics-twenty-three-whole-independent-b-v1/remediation-v4-independent-followup-v1/completed-four-targeted-current-v4-science-and-candidate-P.independent-b.entry.json"
b4_name = "biologie-molecular-genetics-twenty-three-whole-independent-b-v1/remediation-v4-independent-followup-v1/four-targeted-whole-material-v4.independent-b.scientific-first.verdict.json"
root4, b4, b4_entry = [read(n) for n in [root4_name, b4_name, b4_entry_name]]
by_id = {row["goalId"]: row for row in b4["fourWholeGoalScientificVerdicts"]}
assert len(by_id) == 4
material_rows = []
for i, row in enumerate(root4["boundedScientificDecisions"]):
    peer = by_id[row["goalId"]]
    assert peer["scientificDecision"] == "SUPPORTED_IN_AUTHORED_FINITE_MODEL"
    material_rows.append({"goalId": row["goalId"], "independentRootScientificDecision": row["decision"],
                          "independentBScientificDecision": peer["scientificDecision"],
                          "rootVerdict": binding(BASE / root4_name), "rootPointer": f"/boundedScientificDecisions/{i}",
                          "peerVerdict": binding(BASE / b4_name), "scope": "Four current bounded scientific material remedies, not whole23/native D/P/source approval"})
for value in [b4_entry, b4, root4]:
    verify_bindings(value)
now = datetime.now(timezone.utc).isoformat()
summary = {
    "schemaVersion": 1, "createdAt": now, "role": "Conservative technical pairing of actual independent candidate reviews; open usability findings retained",
    "genuineCandidatePixelPairs": rows, "fivePriorPixelPairsExactReused": 5, "twoNewGenuinePixelFollowupPairs": 2,
    "genuineFourScientificMaterialPairs": material_rows,
    "actualReviewEntryBindings": [binding(BASE / n) for n in [a2_entry_name, a7_entry_name, b7_entry_name, b4_entry_name]],
    "unresolvedMaterialUsability": root4["materialUsabilityFindings"],
    "additionalCurrentCaptionAltUsabilityFinding": {
        "findingId": "BIO7-ROOT-CAPTION-WORD-BOUNDARIES", "status": "HOLD_CURRENT_METADATA_BEFORE_NATIVE_INTEGRATION",
        "goalIds": [row["goalId"] for row in rows if row["ordinal"] in [5, 7]],
        "actualExample": "Sechs nummerierte Felder zeigenHIV-RNA zuDNA,Integration inWirtsDNA,Transkription mitgenomischerRNA- undTranslationsroute,viraleProteine",
        "requiredRemedy": "A bounded actual caption/alt successor with ordinary German word boundaries and punctuation spacing. Keep independently accepted raster bytes and actual scientific statements. Metadata-only followup; no raster regeneration.",
    },
    "verifiedRepositoryBindings": list(verified.values()), "verifiedLocalOnlyRawGeneratorBindings": list(local_only.values()),
    "localRawPathsAreNotDeploymentDependencies": True,
    "firstJudgmentsPreserved": True, "rootAuthoredBiologyMaterialOrSelectedRasters": False,
    "rootPairingIsANewBlindReview": False, "currentNativeDApproved": False, "currentNativePApproved": False,
    "currentNativeVApproved": False, "wholeSourceCourseApproval": False, "humanApproval": False, "humanTrial": False,
    "activeWrites": False, "newStrictClosures": 0, "restoredStrictBindings": 0, "netStrictGain": 0,
}
path = OUT / "seven-actual-pixel-pairs-and-four-bounded-science-pairs.open-usability.actual.json"
assert not path.exists()
path.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"summary": binding(path), "pixelPairs": 7, "fourSciencePairs": 4, "materialUsabilityHolds": 3, "captionUsabilityHolds": 2,
                  "verifiedRepositoryBindings": len(verified), "verifiedLocalRawBindings": len(local_only), "strictGain": 0}))
