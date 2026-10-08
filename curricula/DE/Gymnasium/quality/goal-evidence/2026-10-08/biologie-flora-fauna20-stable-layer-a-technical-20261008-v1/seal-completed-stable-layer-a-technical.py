# SPDX-License-Identifier: Apache-2.0
"""Seal terminal standard technical results without creating science approval."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
read = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
bind = lambda p: {"path": str(p.relative_to(ROOT)), "sha256": sha(p), "bytes": p.stat().st_size}
now = lambda: datetime.now(timezone.utc).isoformat()

def write(name, data):
    with (OWN / name).open("x") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

labels = ["inventory-standard-emit-layer-a-patch", "regenerate-current-curriculum-status", "nine-protected-maturity-floors", "normal-ai-transparency-inventory", "full-validate-schemas", "portable-symlink-regression-fixtures", "actual-committable-curriculum-symlinks", "existing-local-ai-transparency-artifact"]
terminals = []
for label in labels:
    p = OWN / (label + ".terminal.actual.json")
    result = read(p)
    assert result["exitCode"] == 0, result
    for output in [result["stdout"], result["stderr"]]:
        actual = ROOT / output["path"]
        assert sha(actual) == output["sha256"]
        assert actual.stat().st_size == output["bytes"]
    terminals.append(bind(p))

report = read(OWN / "exact-inputs/completed-central-report.exact.json")
assert report["blockingIssueCount"] == 0
expected = {"mathematik": (807, 807), "physik": (478, 478), "chemie": (173, 378), "biologie": (174, 391)}
central_rows = []
for subject in report["subjects"]:
    assert (subject["strictComplete"], subject["denominator"]) == expected[subject["subject"]]
    assert len(subject["strictCompleteGoalIds"]) == subject["strictComplete"]
    central_rows.append({"subject": subject["subject"], "strictComplete": subject["strictComplete"], "denominator": subject["denominator"], "percentage": subject["percentage"]})
status_path = ROOT / "docs/qa-ci/status/curriculum-quality-status.json"
status = read(status_path)
assert status_path.read_bytes() == (OWN / "exact-inputs/curriculum-status-after.exact.json").read_bytes()
policy_path = ROOT / "app/scripts/config/curriculum-maturity-floor-policy.json"
assert policy_path.read_bytes() == (OWN / "exact-inputs/nine-maturity-floors-before.exact.json").read_bytes()
policy = read(policy_path)
assert len(policy["floors"]) == 9 and policy["exceptions"] == []
by_id = {r["landscapeId"]: r for r in status["curricula"]}
floor_rows = []
for floor in policy["floors"]:
    row = by_id[floor["landscapeId"]]
    assert int(row["maturity"][1:]) >= int(floor["minimumMaturity"][1:])
    floor_rows.append({"landscapeId": floor["landscapeId"], "subject": floor["subject"], "minimumMaturity": floor["minimumMaturity"], "currentMaturity": row["maturity"], "pass": True})
for subject in ["Mathematik", "Physik"]:
    row = next(r for r in status["curricula"] if r["subject"] == subject)
    assert row["maturity"] == "M7"
    assert next(r for r in row["rules"] if r["id"] == "CQR-303")["status"] == "pass"
for subject in ["Chemie", "Biologie"]:
    row = next(r for r in status["curricula"] if r["subject"] == subject)
    assert row["maturity"] == "M6"
    rule = next(r for r in row["rules"] if r["id"] == "CQR-303")
    assert rule["status"] == "warn" and rule["metrics"]["blockingIssues"] == 0

inventory_path = ROOT / "docs/legal/ai-transparency-inventory.json"
assert inventory_path.read_bytes() == (OWN / "exact-inputs/inventory-after.exact.json").read_bytes()
assert read(inventory_path)["artifactClasses"]["goalVisualizations"]["count"] == 1883
assert read(OWN / "actual-committable-curriculum-symlinks.stdout.actual.txt")["errorCount"] == 0
canonical = ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json"
assert sha(canonical) == "ac2c3a825e48c4392364e9f3bd6abc9c0bbbf7040880f746c7fa49bd16426493"
write("completed-stable-layer-a-technical.actual-results.json", {
    "recordedAt": now(), "status": "PASS_TECHNICAL_SCOPE", "checks": terminals,
    "currentCentralReport": bind(OWN / "exact-inputs/completed-central-report.exact.json"),
    "currentSubjectProgress": central_rows, "nineProtectedFloors": floor_rows,
    "achievedMathematicsAndPhysicsM7Retained": True, "maturityPolicyAndExceptionsUnchanged": True,
    "actualCurrentInventoryImages": 1883, "exactNewInventoryPngImages": 20,
    "activeBiologyCanonical": bind(canonical), "generatedStatus": bind(status_path),
    "generatedStatusMarkdown": bind(ROOT / "docs/qa-ci/status/curriculum-quality-status.md"),
    "appliedInventory": bind(inventory_path), "existingArtifactCheckOnly": True,
    "buildPerformedByThisAgent": False, "newScientificReviews": 0, "newScientificClosures": 0,
    "strictClosuresAddedByTechnicalTask": 0, "humanApproval": False, "humanReleaseAndTrialGatesRemainSeparate": True,
    "history": "Initial own helper assumed obsolete compatibility QA fields; preserved failed helper and receipt, then verified the documented current aiApproved plus exact asset binding. No live QA field or historical artifact was changed.",
    "limits": ["Biology and Chemistry M7 remain incomplete.", "Existing local artifact disclosure check is not a new build, deployment, publication, or real-host acceptance.", "C2PA detected marker counts do not assert cryptographically verified credentials."]
})
files = sorted(p for p in OWN.rglob("*") if p.is_file())
write("completed-stable-layer-a-technical.exact-input-output.first.freeze.json", {
    "recordedAt": now(), "sealType": "append-only actual stable Layer-A technical evidence",
    "files": [bind(p) for p in files], "fileCount": len(files),
    "checkedInputsAndOutputs": True, "humanApproval": False, "newScienceReview": False
})
print(json.dumps(bind(OWN / "completed-stable-layer-a-technical.exact-input-output.first.freeze.json")))
