"""Apply the exact reviewed candidate; preserve prior evidence and boundaries."""
from pathlib import Path
import argparse
import datetime
import hashlib
import json
import shutil

OWN = Path(__file__).resolve().parent
REPO = OWN.parents[6]
BASE = "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/"
PLAN = BASE + "chemie-current-fifteen-reviewed-integration-plan-author-v1/"
VISUAL = BASE + "chemie-current-three-reviewed-visual-integration-v1/"
parser = argparse.ArgumentParser()
parser.add_argument("--freeze", required=True)
parser.add_argument("--sha256", required=True)
args = parser.parse_args()


def read(path):
    return json.loads((REPO / path).read_text())


def binding(path):
    data = (REPO / path).read_bytes()
    return {"path": path, "sha256": "sha256:" + hashlib.sha256(data).hexdigest(), "bytes": len(data)}


def verify(row):
    actual = binding(row["path"])
    assert actual["sha256"] == row["sha256"], row["path"]
    assert actual["bytes"] == row["bytes"], row["path"]


def write(name, data):
    (OWN / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


assert not (OWN / "actual-active-application.receipt.json").exists()
assert binding(args.freeze)["sha256"] == "sha256:" + args.sha256
freeze = read(args.freeze)
for row in freeze["files"]:
    verify(row)
plan = read(PLAN + "reviewable-future-active-copy-and-routing.plan.json")
layout = read(PLAN + "actual-isolated-candidate-layout-and-frozen-inputs.plan.json")
for package in layout["allNativeGatePackagesActuallyFrozen"]:
    verify(package["freeze"])
    for row in read(package["freeze"]["path"])["files"]:
        verify(row)
for row in layout["allActiveInputBindingsBefore"]:
    verify(row)
for row in plan["physicalSubstitutionsAlreadyCheckedInIsolatedRoot"]:
    verify(row["source"])
report = read(PLAN + "future-central-chemistry.actual.stdout.json")["subjects"][0]
progress = read(PLAN + "actual-future-strict-progress-and-protected-floor.receipt.json")
assert report["subject"] == "chemie" and report["denominator"] == 378
assert report["strictComplete"] == 127 and report["issues"] == []
assert len(report["requiredChecks"]) == 6
assert all(c["status"] == "pass" for c in report["requiredChecks"])
assert progress["allProtected112StillStrict"] and not progress["selected15NotStrictGoalIds"]
archive = read(VISUAL + "historical-before-byteexact-archive.manifest.json")
for row in archive["entries"]:
    verify(row["original"])
    verify(row["preservedCopy"])
    assert row["original"]["sha256"] == row["preservedCopy"]["sha256"]
copies = plan["physicalSubstitutionsAlreadyCheckedInIsolatedRoot"]
assert len(copies) == 19 and len({r["isolatedDestination"] for r in copies}) == 19
registry = plan["registryRouting"]["currentRegistry"]["path"]
before_registry = read(registry)
future_registry = read(copies[0]["source"]["path"])
assert all(a == b for a, b in zip(before_registry["subjects"], future_registry["subjects"], strict=True) if a["subject"] != "chemie")
chem = next(s for s in before_registry["subjects"] if s["subject"] == "chemie")
before_goals = read(chem["landscapePath"])["goals"]
future_goals = read(copies[1]["source"]["path"])["goals"]
selected = set(progress["selected15CurrentStrictGoalIds"])
protected = set(progress["protected112StrictGoalIds"])
assert len(before_goals) == len(future_goals) == 479
changed = [a["id"] for a, b in zip(before_goals, future_goals, strict=True) if a != b]
assert len(changed) == 5 and set(changed) <= selected
assert all(a == b for a, b in zip(before_goals, future_goals, strict=True) if a["id"] in protected)
assert all(a["id"] == b["id"] and a.get("requires") == b.get("requires") and a.get("contains") == b.get("contains") for a, b in zip(before_goals, future_goals, strict=True))
before = []
for row in copies:
    destination = row["isolatedDestination"]
    path = REPO / destination
    if path.exists():
        old = binding(destination)
        snapshot = OWN / "active-before" / destination
        snapshot.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(path, snapshot)
        before.append({"original": old, "snapshot": snapshot.relative_to(REPO).as_posix()})
    else:
        before.append({"newPath": destination, "existedBefore": False})
write("actual-active-before-and-checked-plan.receipt.json", {
    "documentType": "root-actual-verified-reviewed-integration-preconditions",
    "createdAtUTC": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "authorFreeze": binding(args.freeze), "allFrozenOwnFilesVerified": len(freeze["files"]),
    "reviewedPackages": layout["allNativeGatePackagesActuallyFrozen"],
    "activeBefore": before, "changedWholeGoalIds": changed,
    "allProtected112WholeGoalsExact": True, "allOtherSubjectsRegistryExact": True,
    "nativeFutureStrictCount": 127, "actualActiveStrictCountBefore": 112,
    "scienceClaimsComeFromOriginalIndependentReviews": True,
    "humanApproval": False, "humanTrial": False,
})
for row in copies:
    destination = REPO / row["isolatedDestination"]
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(REPO / row["source"]["path"], destination)
    assert binding(row["isolatedDestination"])["sha256"] == row["source"]["sha256"]
removed = []
for row in archive["entries"]:
    original = row["original"]["path"]
    if Path(original).suffix == ".jpg":
        verify(row["original"])
        (REPO / original).unlink()
        removed.append({"original": row["original"], "byteExactHistoricalCopy": row["preservedCopy"]})
assert len(removed) == 9
write("actual-active-application.receipt.json", {
    "documentType": "root-actual-reviewed-chemistry-fifteen-application",
    "appliedAtUTC": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "appliedExactCopies": [binding(r["isolatedDestination"]) for r in copies],
    "retainedOriginalJpgHistory": removed,
    "allIndependentReviewPackagesPreserved": True,
    "fifteenSelectedCurrentGoalIds": sorted(selected),
    "scientificGainPendingActiveCentralAndLayerAChecks": 15,
    "activeStrictClaimMadeBeforeCheck": False,
    "newHumanApproval": False, "newHumanTrial": False,
    "runtimeImplementationChanges": False, "gitWrites": False,
})
print(json.dumps({"appliedCopies": len(copies), "archivedOldJpgCopies": len(removed), "newStrictClaimPendingActiveChecks": True}))
