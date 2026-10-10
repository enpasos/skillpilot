# SPDX-License-Identifier: Apache-2.0
"""Targeted schema, exact-input and portability verification; no active writes."""
import hashlib
import json
from pathlib import Path
import sys
import subprocess

import jsonschema

ROOT = Path.cwd()
OWN = Path("curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-source24-current-primary-independent-a-20261010-v1")
SOURCE = Path("curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-source24-targeted-parent-split-author-successor-20261010-v1")
sys.path.insert(0, str(ROOT))
from scripts.validate_schemas import curriculum_symlink_errors, validate_file


def read(path):
    return json.loads(Path(path).read_text())


def binding(path):
    file = Path(path)
    return {"path": str(file), "sha256": "sha256:" + hashlib.sha256(file.read_bytes()).hexdigest(), "bytes": file.stat().st_size}


def check_bound(item):
    actual = binding(item["path"])
    assert actual["sha256"] == item["sha256"], item["path"]
    if "bytes" in item:
        assert actual["bytes"] == item["bytes"], item["path"]
    return actual


neutral = read(SOURCE / "neutral-source24-whole-primary-and-bounded-mapping.portable-successor-v2.entry.json")
bindings = {item["path"]: item for item in neutral["exactOriginalInputs"] + neutral["wholePrimaryInputs"]}
for item in neutral.values():
    if isinstance(item, dict) and all(key in item for key in ["path", "sha256"]):
        bindings[item["path"]] = item
actual_bindings = [check_bound(item) for _, item in sorted(bindings.items())]
index = read(SOURCE / "inputs/whole32-original-mapping-extraction-index.exact.json")
count_sources = count_edges = 0
whole_pairs = []
successors = [read(SOURCE / "candidate/BY-whole-original-with-targeted-partial-child-contributions.inactive.review.json"), read(SOURCE / "candidate/ST-whole-original-with-targeted-partial-child-contributions.inactive.review.json")]
for pair in index["wholeCurrentMappingExtractionPairs"]:
    mapping_ref = pair["wholeCurrentMapping"]["ownExactCopy"]
    extraction_ref = pair["wholeCurrentExtraction"]["ownExactCopy"]
    check_bound(mapping_ref)
    check_bound(extraction_ref)
    mapping = read(mapping_ref["path"])
    extraction = read(extraction_ref["path"])
    count_sources += len(extraction["sourceGoals"])
    count_edges += len(mapping["mappings"])
    replacement = next((item for item in successors if item["sourceLandscapeId"] == mapping["sourceLandscapeId"]), None)
    if replacement is not None:
        new_edges = {json.dumps(edge, sort_keys=True) for edge in replacement["mappings"]}
        assert all(json.dumps(edge, sort_keys=True) in new_edges for edge in mapping["mappings"])
    whole_pairs.append({"wholeMapping": mapping_ref, "wholeExtraction": extraction_ref, "wholeSourceDuties": len(extraction["sourceGoals"]), "wholeOriginalPartnerEdges": len(mapping["mappings"]), "allOriginalEdgesRetained": True})
assert len(whole_pairs) == 32
assert count_sources == 5865
assert count_edges == 21046

runtime_schema = read("docs/landscape-runtime.schema.json")
canonical_path = SOURCE / "inputs/whole-current511-398-candidate.exact.json"
kind_path = SOURCE / "inputs/current511-semantic-kinds.path-only.json"
jsonschema.validate(read(canonical_path), runtime_schema)
jsonschema.validate(read(kind_path), read("contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json"))

protection = read(SOURCE / "checks/actual-current180-goal-page-context-scope-protection.json")
authority = read(protection["current180StrictIDAuthority"]["path"])
protected_ids = next(subject["strictCompleteGoalIds"] for subject in authority["subjects"] if subject["subject"] == "chemie")
assert len(protected_ids) == 180
assert set(protected_ids) == {item["goalId"] for item in protection["wholeProtected180Comparisons"]}
candidate = {goal["id"]: goal for goal in read(canonical_path)["goals"]}
before = {goal["id"]: goal for goal in read(protection["current487CanonicalBefore"]["path"])["goals"]}
previous_fields = {item["goalId"]: item["fields"] for item in protection["whole5PreviouslyPreparedP26RequiresDeltas"]}
assert len(previous_fields) == 5
for id in protected_ids:
    fields = sorted(key for key in before[id].keys() | candidate[id].keys() if before[id].get(key) != candidate[id].get(key))
    assert fields == previous_fields.get(id, []), id
scope_deltas = read(SOURCE / "checks/exact-scoped23-plus-unresolved1-and-whole-scope-witness-deltas.actual.json")
for scope in scope_deltas["whole48SourceScopeDeltas"]:
    assert set(scope["originalGoalIds"]) & set(protected_ids) == set(scope["source24CandidateGoalIds"]) & set(protected_ids), scope["key"]
assert len(scope_deltas["wholeOld19OmittedIdsExact"]) == 19
assert scope_deltas["newUnresolvedChildGoalId"] == "e5a5dcd8-053c-55fd-b5c7-bba93779da53"
assert scope_deltas["whole496UnresolvedDecisionRowsExactAfterExplicitMappingPathNormalization"] is True

json_files = sorted(OWN.rglob("*.json"))
jsonl_files = sorted(OWN.rglob("*.jsonl"))
for file in json_files:
    assert validate_file(str(file), runtime_schema)
jsonl_rows = 0
for file in jsonl_files:
    for line in file.read_text().splitlines():
        if line.strip():
            json.loads(line)
            jsonl_rows += 1
symlink_errors = curriculum_symlink_errors(ROOT)
assert symlink_errors == [], symlink_errors
assert not any(file.is_symlink() for file in OWN.rglob("*"))
owned_files = {str(file) for file in OWN.rglob("*") if file.is_file()}
visible = subprocess.run(["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z", "--", str(OWN)], check=True, capture_output=True).stdout
committable = {item.decode() for item in visible.split(b"\0") if item}
assert owned_files <= committable, sorted(owned_files - committable)
ignored_inputs = subprocess.run(["git", "check-ignore", "--stdin"], input="\n".join(item["path"] for item in actual_bindings) + "\n", capture_output=True, text=True)
assert ignored_inputs.returncode == 1 and not ignored_inputs.stdout, ignored_inputs.stdout
output = {
    "schemaVersion": 1,
    "role": "Independent A targeted exact-input/schema/portability verification after the sealed scientific FIRST",
    "ordinaryValidator": "scripts.validate_schemas.validate_file and curriculum_symlink_errors",
    "explicitClosedSchemaChecks": ["docs/landscape-runtime.schema.json", "contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json"],
    "actualBoundInputs": actual_bindings,
    "whole32OriginalInputPairs": whole_pairs,
    "wholeOriginalSourceDuties": count_sources,
    "wholeOriginalPartnerEdges": count_edges,
    "current180ProtectedGoalIds": protected_ids,
    "actual175ProtectedWholeGoalBodiesExact": True,
    "fivePreviouslyReviewedProtectedRequiresChangesPreservedExactly": sorted(previous_fields),
    "actual180SourceScopeMembershipsExactlyRetainedAcross48Scopes": True,
    "old19OmissionsAndC11CourseHoldPreserved": True,
    "actualOwnJsonFilesParsed": len(json_files),
    "actualOwnJsonlFilesParsed": len(jsonl_files),
    "actualOwnJsonlRowsParsed": jsonl_rows,
    "actualCurriculumSymlinkErrorCount": len(symlink_errors),
    "actualOwnSymlinkCount": 0,
    "actualOwnRegularFilesCommittable": len(owned_files),
    "actualBoundInputIgnoredFileCount": 0,
    "fullRepositorySchemaRun": False,
    "sourceWholeCoverageApproval": False,
    "scientificFirstChanged": False,
    "strictGain": 0,
    "humanApproval": False,
    "activeWrites": False,
}
out = OWN / "checks/targeted-schema-input-protection-portability.actual.json"
out.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"targetedSchemaAndPortability": "PASS", "exactBoundInputs": len(actual_bindings), "oldSources": count_sources, "oldEdges": count_edges, "protectedGoals": len(protected_ids), "ownJsonFiles": len(json_files), "symlinkErrors": 0, "strictGain": 0}))
