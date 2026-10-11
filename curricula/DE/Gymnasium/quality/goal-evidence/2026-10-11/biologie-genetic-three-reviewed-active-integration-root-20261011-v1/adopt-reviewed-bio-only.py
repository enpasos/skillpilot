"""Adopt sealed Bio3 inputs; retain every other current registry subject."""
from pathlib import Path
import copy
import hashlib
import json
import shutil

ROOT = next(p for p in Path(__file__).resolve().parents if (p / ".git").exists())
HERE = Path(__file__).resolve().parent
PREP = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/biologie-genetic-three-combined-current395-reviewed-integration-preparation-20261011-v3"
CANON = ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json"
KINDS = ROOT / "curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json"
QA = ROOT / "curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json"
REGISTRY = ROOT / "curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json"
ATLAS = ROOT / "app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json"
TARGETS = {"9540a95d-5ca5-527c-918f-d702e99be07a", "5ee0f660-66f1-5aa6-a01d-e3b010db01ff", "0f9318ec-90eb-5381-b670-8fb2f2789c3d"}

def load(path):
    return json.loads(path.read_text())

def digest(path):
    return "sha256:" + hashlib.sha256(path.read_bytes()).hexdigest()

def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")

seal = load(PREP / "FINAL.normal-integration-package.freeze.json")
for entry in seal["ownFiles"]:
    path = ROOT / entry["path"]
    assert path.is_file() and not path.is_symlink()
    assert digest(path) == entry["sha256"] and path.stat().st_size == entry["bytes"]
join = load(PREP / "FINAL.neutral-whole395-and-normal-integration.join.json")
for entry in join["bindings"]:
    assert digest(ROOT / entry["path"]) == entry["sha256"]

before = load(CANON)
after = load(PREP / "candidate/whole480.inactive.json")
old_goals = {g["id"]: g for g in before["goals"]}
assert len(old_goals) == len(after["goals"]) == 480
actual_changes = {}
for goal in after["goals"]:
    old = old_goals[goal["id"]]
    if old != goal:
        actual_changes[goal["id"]] = sorted(k for k in set(old) | set(goal) if old.get(k) != goal.get(k))
assert actual_changes == {
    "2d451684-6e53-565e-a987-f362da919d2c": ["descriptionEn", "titleEn"],
    "9540a95d-5ca5-527c-918f-d702e99be07a": ["requires", "resourceLinks"],
    "5ee0f660-66f1-5aa6-a01d-e3b010db01ff": ["resourceLinks"],
    "0f9318ec-90eb-5381-b670-8fb2f2789c3d": ["requires", "resourceLinks"],
}
registry_before = load(REGISTRY)
old_subject = next(s for s in registry_before["subjects"] if s["subject"] == "biologie")
new_subject = load(PREP / "candidate/bio-subject.shared-D6-final.only-for-integration.inactive.json")
for key in ("landscapePath", "semanticKindLedgerPath", "semanticAtomicityConfigPath", "memoryReviewConfigPath", "visualizationQaPath"):
    new_subject[key] = old_subject[key]

candidate_qa = load(PREP / "candidate/QA395-normal-namespace-only.inactive.json")
qa_before = load(QA)
new_rows = {r["goalId"]: copy.deepcopy(r) for r in candidate_qa["records"] if r["goalId"] in TARGETS}
assert set(new_rows) == TARGETS
image_source = ROOT / "curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-genetic-argument-three-image-targeted-author-20261011-v1/images"
image_copies = []
for goal_id, row in new_rows.items():
    source = image_source / goal_id / (goal_id + ".png")
    assert digest(source) == row["assetSha256"] == row["aiApprovedAssetSha256"]
    assert row["aiApproved"] == "yes" and row["humanApproved"] == "no"
    row["landscapePath"] = old_subject["landscapePath"]
    for destination in (ROOT / row["canonicalAssetPath"], ROOT / row["publicAssetPath"]):
        assert not destination.exists()
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, destination)
        image_copies.append({"source": str(source.relative_to(ROOT)), "destination": str(destination.relative_to(ROOT)), "sha256": digest(destination)})
    prompt = ROOT / row["canonicalAssetPath"]
    shutil.copyfile(image_source / goal_id / "prompt.de.md", prompt.parent / "prompt.de.md")
qa_after = copy.deepcopy(qa_before)
qa_after["records"] = [new_rows.get(row["goalId"], row) for row in qa_before["records"]]
assert len(qa_before["records"]) == len(qa_after["records"]) == 395
assert all(old == new for old, new in zip(qa_before["records"], qa_after["records"]) if old["goalId"] not in TARGETS)

kinds = load(PREP / "candidate/kinds480-current395.inactive.json")
kinds["sourceLandscapePath"] = str(CANON.relative_to(ROOT))
positive = load(PREP / "positive/P3.inactive.config.json")
positive["landscapePath"] = str(CANON.relative_to(ROOT))
positive["semanticKindLedgerPath"] = str(KINDS.relative_to(ROOT))
positive_path = HERE / "P3.current-active-namespace.config.json"
write(positive_path, positive)
new_subject["positiveEvidenceConfigPaths"] = [str(positive_path.relative_to(ROOT)) if p == str((PREP / "positive/P3.inactive.config.json").relative_to(ROOT)) else p for p in new_subject["positiveEvidenceConfigPaths"]]

atlas_before = load(ATLAS)
atlas_after = copy.deepcopy(atlas_before)
candidate_atlas = load(PREP / "sources/normal-source-atlas.inactive.inputs.json")
assert len(atlas_before["mappingPaths"]) == len(candidate_atlas["mappingPaths"]) == 31
mapping_copies = []
for old, reviewed in zip(atlas_before["mappingPaths"], candidate_atlas["mappingPaths"]):
    if old == reviewed:
        continue
    region = "HE" if "/HE-whole-" in reviewed else "RP"
    destination = ROOT / ("curricula/DE/Gymnasium/mapping/DE-" + region + "/source-components/biologie-genetic-three-current395-source-context-reviewed-20261011-v3.review.json")
    assert not destination.exists()
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(ROOT / reviewed, destination)
    atlas_after["mappingPaths"][atlas_before["mappingPaths"].index(old)] = str(destination.relative_to(ROOT))
    mapping_copies.append({"source": reviewed, "destination": str(destination.relative_to(ROOT)), "sha256": digest(destination)})
assert len(mapping_copies) == 2

for path in (CANON, KINDS, QA, REGISTRY, ATLAS):
    backup = HERE / "before-exact" / path.relative_to(ROOT)
    assert not backup.exists()
    backup.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(path, backup)
registry_after = copy.deepcopy(registry_before)
registry_after["subjects"] = [new_subject if s["subject"] == "biologie" else s for s in registry_before["subjects"]]
assert [s for s in registry_after["subjects"] if s["subject"] != "biologie"] == [s for s in registry_before["subjects"] if s["subject"] != "biologie"]
for path, value in ((CANON, after), (KINDS, kinds), (QA, qa_after), (REGISTRY, registry_after), (ATLAS, atlas_after)):
    write(path, value)
write(HERE / "reviewed-Bio-only-adoption.actual.json", {
    "schemaVersion": 1, "role": "technical adoption of genuine dual-reviewed Bio3", "sealedInputsVerified": len(seal["ownFiles"]),
    "canonicalChangedFields": actual_changes, "unchangedOtherWholeGoals": 476, "unchangedOtherQaRecords": 392,
    "currentCanonicalWholeGoals": 480, "currentCurricularAtomic": 395, "candidateStrict": 369, "activeStrictVerificationPending": True,
    "newScienceCandidatesAlreadyReviewed": sorted(TARGETS), "historicalFilesChanged": 0, "otherRegistrySubjectsChanged": 0,
    "imageCopies": image_copies, "mappingCopies": mapping_copies,
    "sourceUnionApproval": False, "HumanApproval": False, "HumanTrial": False,
})
print("Adopted reviewed Bio3 only; current active normal report still required.")
