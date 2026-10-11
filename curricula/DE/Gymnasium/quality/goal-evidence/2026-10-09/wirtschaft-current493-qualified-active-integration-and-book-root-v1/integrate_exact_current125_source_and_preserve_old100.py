"""Activate the qualified current source candidate without inventing mapping approval."""
import datetime
import hashlib
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[7]
OUT = pathlib.Path(__file__).resolve().parent
AUTHOR = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1"
FOREIGN = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current125-source-activation-independent-root-foreign-migration-guard-v1/actual-independent-current125-source-migration-guard.receipt.json"
REGISTRY = ROOT / "curricula/DE/Gymnasium/provenance/source-landscape-registry.json"
OLD_ID = "3ed24627-4b87-54b7-865f-98a0744fd1a5"
NEW_ID = "c0713ece-7c59-57bc-bc4d-313d9405e1ad"

def sha(data):
    return hashlib.sha256(data).hexdigest()

def bound(path, digest):
    data = path.read_bytes()
    assert sha(data) == digest, path
    json.loads(data)
    return data

assert sha(FOREIGN.read_bytes()) == "ab09bfe2d43435d2b79e8ded6c3908fcf2ee2b3301cf5f1acfff41e00c39efcc"
source = AUTHOR / "source-extraction/DE_BE_WIRTSCHAFT_SEKII_CURRENT125.portable-GK-choice-qualified-author-v8.source-extraction.json"
source_bytes = bound(source, "963f5b0a737d5520305d15f32a08f0be04029ffcea0d1367cf0ffd5d5794e28d")
mapping = AUTHOR / "current-V13-Source125-one-actual-union-member-technical-binding-only-v1/be_wirtschaft_current125_exact208partial_three_currentV13_decision_union_path_bindings_only.author-successor-v6.json"
mapping_bytes = bound(mapping, "56c175f4aaeb5ab66710f8dcf2ca958b08bbd9571864fbeeb061ce19873ecf71")
mapping_json = json.loads(mapping_bytes)
candidate = json.loads((AUTHOR / "provenance/source-landscape-registry.only-old-false-BE-retired-new-current125-entry.author-candidate.json").read_text())
new_entry = next(entry for entry in candidate["entries"] if entry["landscapeId"] == NEW_ID)
registry_bytes = REGISTRY.read_bytes()
registry = json.loads(registry_bytes)
original_entries = {entry["landscapeId"]: entry for entry in registry["entries"]}
assert OLD_ID in original_entries and NEW_ID not in original_entries
old_entry = original_entries[OLD_ID]
registry["entries"] = [new_entry if entry["landscapeId"] == OLD_ID else entry for entry in registry["entries"]]
other_before = {key: value for key, value in original_entries.items() if key != OLD_ID}
assert len(other_before) == 301
assert {entry["landscapeId"]: entry for entry in registry["entries"] if entry["landscapeId"] != NEW_ID} == other_before
source_target = ROOT / new_entry["sourceExtractionPath"]
mapping_target = ROOT / new_entry["mappingReviewPath"]
assert mapping_json["sourceExtractionPath"] == new_entry["sourceExtractionPath"]
assert mapping_json["sourceLandscapeId"] == NEW_ID
assert len(mapping_json["decisions"]) == 125
assert len(mapping_json["mappings"]) == 208
historical = [
    ("curricula/DE/Gymnasium/input/BE/upper-secondary/source-extraction/DE_BE_WIRTSCHAFT_SEKII_GOST_2022.source-extraction.json", "f0caaab8e8754b1472e23f7766882e819495e412e090842a851f12db87fa4787"),
    ("curricula/DE/Gymnasium/mapping/DE-BE/upper-secondary/be_wirtschaft_upper_secondary_source_extraction_to_canonical_wirtschaft.review.json", "39b68446ab21babc33a3f92d3841b4153cd9669e4ee875d8081a23ea353b4d59"),
]
relocations = []
for old_path, digest in historical:
    old = ROOT / old_path
    archive = AUTHOR / "history-preservation-inputs" / old.name
    old_bytes = bound(old, digest)
    assert bound(archive, digest) == old_bytes
    relocations.append({"originalOperativePath": old_path, "exactHistoricalPath": archive.relative_to(ROOT).as_posix(), "sha256": digest})
assert not source_target.exists() and not mapping_target.exists()
before_registry = OUT / "whole-source-registry.before-current125-activation.json"
assert not before_registry.exists()
before_registry.write_bytes(registry_bytes)
for target, data in [(source_target, source_bytes), (mapping_target, mapping_bytes)]:
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
    assert target.read_bytes() == data
REGISTRY.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + "\n")
assert json.loads(REGISTRY.read_text()) == registry
for item in relocations:
    (ROOT / item["originalOperativePath"]).unlink()
assert {entry["landscapeId"]: entry for entry in json.loads(REGISTRY.read_text())["entries"] if entry["landscapeId"] != NEW_ID} == other_before
receipt = {
    "schemaVersion": 1,
    "activatedAtUtc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "scope": "Current Economics source candidate and exact partial-mapping activation; no new source/course/human approval",
    "independentTechnicalMigrationGuard": {"path": FOREIGN.relative_to(ROOT).as_posix(), "sha256": sha(FOREIGN.read_bytes())},
    "currentSource": {"path": source_target.relative_to(ROOT).as_posix(), "sha256": sha(source_bytes)},
    "currentMappingV13v6": {"path": mapping_target.relative_to(ROOT).as_posix(), "sha256": sha(mapping_bytes)},
    "historicalPathRelocations": relocations,
    "oldRegistryWholeExactBackup": {"path": before_registry.relative_to(ROOT).as_posix(), "sha256": sha(registry_bytes)},
    "oldRegistryEntryWhole": old_entry,
    "newRegistryEntryWhole": new_entry,
    "otherRegistryEntriesUnchanged": 301,
    "mappingScientificDecisionsOrPartialEdgesModified": False,
    "historicalReferenceBoundary": "Historical receipts and isolated snapshots retain old path strings and unchanged bytes. Reconstruct the two old operative paths from these exact archives inside an isolated historical replay. This relocation receipt is not an automatic resolver.",
    "pending": ["actual integrated source inventory/applicability/Book original-source checks", "whole Berlin course-choice approval", "current dual description reviews", "final machine M7 checks"],
    "humanApprovalCreated": False,
    "strictNewClosuresClaimed": 0,
}
(OUT / "actual-current125-source-registry-partial-mapping-and-old100-exact-history-relocation.receipt.json").write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"currentSourceGoals": 125, "exactPartialEdges": 208, "otherRegistryEntriesPreserved": 301, "exactOldOperationalFilesArchived": 2, "newSourceCourseOrHumanApproval": False}))
