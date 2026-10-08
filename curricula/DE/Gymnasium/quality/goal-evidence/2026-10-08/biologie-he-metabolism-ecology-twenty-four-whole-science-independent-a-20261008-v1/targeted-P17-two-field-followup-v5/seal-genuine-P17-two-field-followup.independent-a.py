# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import subprocess

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[7]
FIRST = OWN.parent
V4_OWN = FIRST / "targeted-six-case-followup-v4"
V5_AUTHOR = FIRST.parent / "biologie-he-metabolism-ecology-one-profile-two-field-followup-author-root-20261008-v5"


def read(path):
    return json.loads(path.read_text())


def pin(path):
    raw = path.read_bytes()
    return {"path": str(path.relative_to(ROOT)), "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}


def verify(binding):
    path = ROOT / binding["path"]
    assert path.is_file() and not path.is_symlink()
    assert pin(path) == binding
    return path


def diff(before, after, prefix=""):
    if before == after:
        return []
    if isinstance(before, dict) and isinstance(after, dict) and set(before) == set(after):
        return sum([diff(before[k], after[k], prefix + "/" + k) for k in before], [])
    if isinstance(before, list) and isinstance(after, list) and len(before) == len(after):
        return sum([diff(a, b, prefix + "/" + str(i)) for i, (a, b) in enumerate(zip(before, after))], [])
    return [{"field": prefix, "before": before, "after": after}]


def put(name, value):
    with (OWN / name).open("x") as stream:
        stream.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


previous_seal = V4_OWN / "completed-six-case-five-profile-science-and-source-only-P5.independent-a.final.freeze.json"
assert pin(previous_seal)["sha256"] == "155111e47b1da9b615e26960292793ad5dda968fb1baee2d04cfdc6b4559fb48"
for binding in read(previous_seal)["ownFiles"]:
    verify(binding)
author_first = V5_AUTHOR / "one-profile-two-field-only.author.first-input.freeze.json"
assert pin(author_first)["sha256"] == "333a85343faeed5782d07c3caf5875161a9df29be7a4c6818557f3d0734111e0"
dependencies = {previous_seal, author_first}
for binding in read(author_first)["files"]:
    dependencies.add(verify(binding))
entry = read(V5_AUTHOR / "neutral-one-profile-two-field-only.author.entry.json")
for key in ["originalV4Seal", "whole48CasesRetainedExactly", "wholeP24CurrentCandidate", "actualTwoFieldDelta"]:
    dependencies.add(verify(entry[key]))
delta = read(verify(entry["actualTwoFieldDelta"]))
old_path = verify(delta["originalV4Profile"])
new_path = verify(delta["newProfile"])
dependencies |= {old_path, new_path}
old = read(old_path)
new = read(new_path)
changes = diff(old, new)
assert len(changes) == 2
expected = {
    "/goals/16/profile/applicationCaseBriefs/0/understandingFocusDe",
    "/goals/16/profile/applicationCaseBriefs/0/understandingFocusEn",
}
assert {row["field"] for row in changes} == expected
profile = new["goals"][16]
assert profile["goalId"] == "4ef85d98-5e20-540b-9adf-89592febc438"
assert profile["profile"]["applicationCaseBriefs"][0]["id"] == "he-metabolism-ecology24-17-case-1"
assert sum(a == b for a, b in zip(old["goals"], new["goals"])) == 23
cases = read(verify(entry["whole48CasesRetainedExactly"]))
assert len(cases["cases"]) == 48 and len(cases["wholeCurrentGoalBodies"]) == 24
case_pair = [case for case in cases["cases"] if case["goalId"] == profile["goalId"]]
assert len(case_pair) == 2
for case in case_pair:
    brief = next(brief for brief in profile["profile"]["applicationCaseBriefs"] if brief["id"] == case["caseId"])
    for language, suffix in [("de", "De"), ("en", "En")]:
        assert case["modelResponse"][language] in brief["expectedPerformance" + suffix]
        assert case["freshTransfer"]["modelResponse"][language] in brief["expectedPerformance" + suffix]
        assert case["material"][language] in brief["taskDemand" + suffix]
        assert case["task"][language] in brief["taskDemand" + suffix]
required = [str(path.relative_to(ROOT)) for path in sorted(dependencies)]
ignore = subprocess.run(["git", "check-ignore", "--no-index", *required], cwd=ROOT, text=True, capture_output=True)
assert ignore.returncode == 1 and not ignore.stdout.strip()
now = datetime.now(timezone.utc).isoformat()
verdict = {
    "schemaVersion": 1, "reviewedAt": now,
    "reviewer": "Independent A; not Root author; current Bio24 peerB outputs remain unread",
    "originalV4FinalUnchanged": pin(previous_seal), "authorV5FirstSeal": pin(author_first),
    "goalId": profile["goalId"], "caseId": "he-metabolism-ecology24-17-case-1",
    "actualExactlyTwoFields": changes,
    "wholeNewProfilePersonallyRead": profile,
    "wholeRetainedCurrentCasePair": case_pair,
    "scientificVerdict": "KEEP_SCIENTIFIC_E1_G1_CANDIDATE",
    "reason": "Both remaining focus fields retain local demographic source/sink classification, immigration rather than abundance as the cause of a stable sink, and the limits of connectivity by habitat quality, distance and species traits. Removing the appended author-curriculum classification clause does not remove any biological understanding demand. The whole two materials/tasks/model responses/scoring/transfers and expectation edges stay unchanged and scientifically sound. The role of a metapopulation model in the official source remains separately documented; it is not an assessed learner-curriculum judgment or a new named mandatory requirement.",
    "other23WholeProfilesExact": True, "all48V4WholeCasesExact": True, "all24WholeGoalBodiesExact": True,
    "sourceAndCompoundHoldsUnchanged": True, "optionalSourceBoundaryNotApprovedByProfileEdit": True,
    "nativeD_VOrFinalRasterP": "PENDING_NOT_CLAIMED", "currentPeerBRead": False,
    "requiredPortableInputs": [pin(path) for path in sorted(dependencies)],
    "actualGitCheckIgnore": {"exitCode": ignore.returncode, "ignoredInputs": 0, "stdout": ignore.stdout},
    "brokenRequiredInputs": 0, "activeWrites": 0, "strictGainClaimed": 0,
    "humanApproval": False, "humanTrial": False,
}
put("P17-two-field-only-genuine-scientific-followup.independent-a.first.verdict.json", verdict)
handoff = {
    "schemaVersion": 1, "createdAt": now,
    "kind": "Neutral genuine independentA P17 two-field-only followup, prior own v4 seal unchanged",
    "authorInputFirstSeal": pin(author_first), "originalOwnV4FinalSeal": pin(previous_seal),
    "ownVerdict": pin(OWN / "P17-two-field-only-genuine-scientific-followup.independent-a.first.verdict.json"),
    "finalSealPath": str((OWN / "P17-two-field-only-independent-a.first-final.freeze.json").relative_to(ROOT)),
    "scientificVerdict": "KEEP", "actuallyChangedFields": 2,
    "sourceOrCompoundClosure": False, "nativeD_VOrFinalRasterP": "PENDING_NOT_CLAIMED",
    "currentPeerBRead": False, "activeWrites": 0, "strictGainClaimed": 0,
    "humanApproval": False, "humanTrial": False,
}
put("neutral-P17-two-field-only-scientific-followup.independent-a.entry.json", handoff)
seal = {
    "schemaVersion": 1, "sealedAt": now,
    "kind": "Own genuine P17 two-field-only scientific first/final judgment, no peerB read",
    "ownFiles": [pin(path) for path in sorted(OWN.iterdir()) if path.is_file()],
    "authorInputFirstSeal": pin(author_first), "previousOwnV4FinalSealUnchanged": pin(previous_seal),
    "peerCurrentBRead": False, "activeWrites": 0, "strictGainClaimed": 0,
    "humanApproval": False, "humanTrial": False,
}
put("P17-two-field-only-independent-a.first-final.freeze.json", seal)
print(json.dumps({"scientificVerdict": "KEEP", "exactChangedFields": 2, "other23ProfilesAndAll48CasesExact": True,
    "sourceAndCompoundHoldsPreserved": True, "peerBRead": False,
    "seal": pin(OWN / "P17-two-field-only-independent-a.first-final.freeze.json"),
    "entry": pin(OWN / "neutral-P17-two-field-only-scientific-followup.independent-a.entry.json")}, ensure_ascii=False))
