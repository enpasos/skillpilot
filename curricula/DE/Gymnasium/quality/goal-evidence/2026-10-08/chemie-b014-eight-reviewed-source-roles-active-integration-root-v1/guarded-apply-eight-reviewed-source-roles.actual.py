# SPDX-License-Identifier: Apache-2.0
"""Adopt only eight genuinely paired source roles; preserve all goal gates."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import shutil

ROOT = Path.cwd()
OWN = Path(__file__).parent
TECH = OWN.parent / "chemie-b014-eight-reviewed-source-roles-integration-preparation-technical-20261008-v1"


def read(path):
    return json.loads(Path(path).read_text())


def binding(path):
    path = Path(path)
    data = path.read_bytes()
    declared = str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path)
    return {"path": declared, "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}


def verify(item):
    actual = binding(ROOT / item["path"])
    assert actual["sha256"] == item["sha256"].removeprefix("sha256:"), item["path"]
    if "bytes" in item:
        assert actual["bytes"] == item["bytes"], item["path"]
    return actual


assert not (OWN / "guarded-eight-source-role-adoption.actual.json").exists()
seal = TECH / "technical-preparation.final.freeze.json"
assert binding(seal)["sha256"] == "df0e4dd0bfc417964916b004a9389cd64f21c88bd3bfbe9aadf35eda5fa1fbae"
frozen = read(seal)
for item in frozen["ownFiles"]:
    verify(item)
plan = read(TECH / "ready-root-reviewed-eight-source-role-integration-plan.technical.json")
for item in plan["protectedCurrentFiles"]:
    verify(item)
verify(plan["currentRegistryPreserveOnly"])
verify(plan["ledgerPreserveOnly"])
verify(plan["baselineCentral"])
verify(plan["baselineTerminal"])
assert read(ROOT / plan["baselineTerminal"]["path"])["exitCode"] == 0

reviewed = {}
for name, route in plan["actualIndependentSourceSeals"].items():
    verify(route["seal"])
    source = read(ROOT / route["seal"]["path"])
    arrays = ["entries", "files", "exactInputs", "exactOwnOutputs", "exactInputBindings", "exactOwnOutputBindings"]
    registry_exceptions = {v["historicalInput"]["path"] for v in route["historicalRegistryExceptions"]}
    verified = 0
    for key in arrays:
        for item in source.get(key, []):
            if item.get("path") in registry_exceptions:
                assert item["path"] == plan["currentRegistryPreserveOnly"]["path"]
                verify(plan["currentRegistryPreserveOnly"])
            else:
                verify(item)
            verified += 1
    assert verified == route["actualEntriesVerified"], (name, verified)
    reviewed[name] = {"seal": route["seal"], "verifiedEntries": verified,
                      "historicalRegistryOnlyExceptions": sorted(registry_exceptions)}

selected = set(plan["selectedSourceGoalIds"])
changed = []
for item in plan["reviewedActiveMappingReplacementFiles"]:
    verify(item["expectedBefore"])
    verify(item["source"])
    verify(item["historicalBeforeSnapshot"])
    before = read(ROOT / item["expectedBefore"]["path"])
    after = read(ROOT / item["source"]["path"])
    assert {k: v for k, v in before.items() if k not in ("mappings", "decisions")} == {
        k: v for k, v in after.items() if k not in ("mappings", "decisions")}
    old_by = {v["sourceGoalId"]: v for v in before["decisions"]}
    new_by = {v["sourceGoalId"]: v for v in after["decisions"]}
    assert old_by.keys() == new_by.keys()
    for gid, old in old_by.items():
        new = new_by[gid]
        if old == new:
            continue
        assert gid in selected
        assert {k: v for k, v in old.items() if k not in plan["changedMappingDecisionFields"]} == {
            k: v for k, v in new.items() if k not in plan["changedMappingDecisionFields"]}
        changed.append({"sourceGoalId": gid, "before": old, "after": new})
    for gid in old_by.keys() - selected:
        assert old_by[gid] == new_by[gid]
    assert len(before["mappings"]) - len(after["mappings"]) == (
        sum(len(v["canonicalGoalIds"]) for v in before["decisions"]) -
        sum(len(v["canonicalGoalIds"]) for v in after["decisions"]))
    unchanged_old = [v for v in before["mappings"] if v["legacyGoalId"] not in selected]
    unchanged_new = [v for v in after["mappings"] if v["legacyGoalId"] not in selected]
    assert unchanged_old == unchanged_new
    for gid in old_by.keys() & selected:
        assert {v["canonicalGoalId"] for v in after["mappings"] if v["legacyGoalId"] == gid} == set(new_by[gid]["canonicalGoalIds"])
assert len(changed) == 8 and {v["sourceGoalId"] for v in changed} == selected
for item in plan["derivedAtlasOutputsExpected"]:
    verify(item["expectedBefore"])
    verify(item["actualStandardGeneratedSource"])

guard = {"recordedAt": datetime.now(timezone.utc).isoformat(), "technicalSeal": binding(seal),
         "genuinePairedReviewSeals": reviewed, "changedSourceRoles": changed,
         "protectedFiles": plan["protectedCurrentFiles"], "registry": plan["currentRegistryPreserveOnly"],
         "ledger": plan["ledgerPreserveOnly"], "baselineCentral": plan["baselineCentral"],
         "unchangedCanonicalWholeGoals": 480, "currentChemistryCurricularAtomic": 378,
         "strictChemistryBefore": 173, "newScientificGoalClosures": 0,
         "restoredBindingGain": 0, "humanApproval": False, "humanTrial": False}
(OWN / "reviewed-eight-source-role-pre-apply-guard.actual.json").write_text(
    json.dumps(guard, ensure_ascii=False, indent=2) + "\n")
copies = []
for item in plan["reviewedActiveMappingReplacementFiles"]:
    target = ROOT / item["target"]
    snapshot = OWN / "before-active-mappings" / item["target"]
    snapshot.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(target, snapshot)
    shutil.copyfile(ROOT / item["source"]["path"], target)
    assert target.read_bytes() == (ROOT / item["source"]["path"]).read_bytes()
    copies.append({"target": binding(target), "source": item["source"], "beforeSnapshot": binding(snapshot)})
for item in plan["protectedCurrentFiles"]:
    verify(item)
verify(plan["currentRegistryPreserveOnly"])
verify(plan["ledgerPreserveOnly"])
(OWN / "guarded-eight-source-role-adoption.actual.json").write_text(
    json.dumps({**guard, "activeMappingCopies": copies, "activeCanonicalOrProfileOrImageWrites": 0,
                "standardAtlasGenerationPending": True, "centralAfterPending": True},
               ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"adoptedReviewedSourceRoles": 8, "activeMappingCopies": 5,
                  "newScientificGoalClosures": 0, "restoredBindingGain": 0,
                  "preservedFiles": len(plan["protectedCurrentFiles"])}))
