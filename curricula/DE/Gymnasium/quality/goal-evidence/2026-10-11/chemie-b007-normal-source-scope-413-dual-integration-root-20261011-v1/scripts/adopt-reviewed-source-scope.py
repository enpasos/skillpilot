"""Adopt the exact independently reviewed B007 successor; preserve history."""
import datetime
import hashlib
import json
import pathlib
import shutil

ROOT = next(parent for parent in pathlib.Path(__file__).resolve().parents
            if (parent / "AGENTS.md").is_file() and (parent / ".git").exists())
E = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11"
PACKAGE = E / "chemie-b007-normal-source-scope-413-dual-integration-root-20261011-v1"
AUTHOR = E / "chemie-b007-normal-source-and-HE-mandatory-scope-root-author-20261011-v1"

def digest(path):
    return "sha256:" + hashlib.sha256(path.read_bytes()).hexdigest()

def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    json.loads(path.read_text())

manifest = json.loads((AUTHOR / "FIRST.neutral-whole-source-scope-author-inputs.json").read_text())
seal = AUTHOR / "FINAL.author.freeze.json"
assert digest(seal) == "sha256:120d7d65d1a9a1b9c62cf41e96e6f3feadc3fb66397d179c1a77487d7c5677a6"
for row in json.loads(seal.read_text())["files"]:
    assert digest(ROOT / row["path"]) == row["sha256"], row["path"]
for row in manifest["baselineBindings"]:
    assert digest(ROOT / row["path"]) == row["sha256"], row["path"]

registry_path = ROOT / "curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json"
atlas_path = ROOT / "app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json"
registry = json.loads(registry_path.read_text())
before_subjects = {s["subject"]: json.dumps(s, sort_keys=True) for s in registry["subjects"]}
subject = next(s for s in registry["subjects"] if s["subject"] == "chemie")
old_index = "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-v7-D2-P2-native31-integration-preparation-20261011-v1/native-D14/resolution-index.json"
new_index = str((PACKAGE / "native-D1/resolution-index.json").relative_to(ROOT))
index = json.loads((ROOT / new_index).read_text())
assert index["batchGoalIds"] == ["413040cd-ba74-5227-948c-a778b0bd0f56"]
assert index["resolutions"][0]["strictDescriptionComplete"] is True
assert old_index in subject["resolutionIndexPaths"] and new_index not in subject["resolutionIndexPaths"]
subject["resolutionIndexPaths"].append(new_index)
subject["resolutionSupersessions"].append({
    "goalId": "413040cd-ba74-5227-948c-a778b0bd0f56",
    "supersededIndexPath": old_index,
    "replacementIndexPath": new_index,
})
assert all(before_subjects[s["subject"]] == json.dumps(s, sort_keys=True)
           for s in registry["subjects"] if s["subject"] != "chemie")

atlas = json.loads(atlas_path.read_text())
for row in manifest["mappingSuccessors"]:
    assert atlas["mappingPaths"].count(row["operativeInput"]) == 1
    atlas["mappingPaths"] = [row["normalSuccessorTarget"] if path == row["operativeInput"] else path
                             for path in atlas["mappingPaths"]]

before_landscape = json.loads((ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json").read_text())
after_landscape = json.loads((ROOT / manifest["landscape"]["path"]).read_text())
assert len(before_landscape["goals"]) == len(after_landscape["goals"]) == 523
changed = []
for before, after in zip(before_landscape["goals"], after_landscape["goals"]):
    assert before["id"] == after["id"]
    if before != after:
        assert before["id"] == "413040cd-ba74-5227-948c-a778b0bd0f56"
        expected = json.loads(json.dumps(before))
        expected["applicability"]["jurisdiction"] = ["DE-TH"]
        assert expected == after
        changed.append(before["id"])
assert changed == ["413040cd-ba74-5227-948c-a778b0bd0f56"]

targets = manifest["futureNormalTargetsAfterReviews"]
for row in targets:
    source, target = ROOT / row["candidate"], ROOT / row["target"]
    if "/mapping/" in row["target"]:
        assert not target.exists(), row["target"]
for path in [ROOT / row["target"] for row in targets] + [registry_path, atlas_path]:
    if path.exists():
        backup = PACKAGE / "pre-adoption-exact-files" / path.relative_to(ROOT)
        backup.parent.mkdir(parents=True, exist_ok=True)
        assert not backup.exists()
        shutil.copyfile(path, backup)
for row in targets:
    source, target = ROOT / row["candidate"], ROOT / row["target"]
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)
    assert source.read_bytes() == target.read_bytes()
write_json(registry_path, registry)
write_json(atlas_path, atlas)

write_json(PACKAGE / "checks/reviewed-source-scope-adoption.actual.json", {
    "schemaVersion": 1,
    "appliedAtUTC": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "descriptionIndependentSeals": [
        "sha256:5a3fa19606bc8285f657ea0e40c562c703b1d7a048115249d2c801570f11ae9f",
        "sha256:e83ad92cec9df7f8ef3d3918bef5716fabca3cec223c60410815815efcb71f54",
    ],
    "targets": [{"path": row["target"], "sha256": digest(ROOT / row["target"]),
                 "exactReviewedCandidate": True} for row in targets],
    "onlyChangedCanonicalGoal": changed,
    "descriptionSupersession": {"goalId": changed[0], "from": old_index, "to": new_index},
    "historicalMappingsAndReviewsOverwritten": [],
    "protectedOtherSubjectsExact": True,
    "sourceOperatorHoldsPreserved": True,
    "newScientificStrictGoalGain": 0,
    "humanApproval": False,
    "remaining": ["normal affected source/composition/maturity checks", "final BY135 whole HTML/PDF page inspection", "stable central strict-ID protection"],
})
print("PASS exact reviewed B007 source/scope adoption; only413 D1 supersession; other subjects intact")
