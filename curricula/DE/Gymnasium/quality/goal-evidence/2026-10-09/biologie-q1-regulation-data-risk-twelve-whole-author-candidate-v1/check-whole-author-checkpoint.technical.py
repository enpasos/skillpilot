# SPDX-License-Identifier: Apache-2.0
"""Scoped ordinary parsing/schema and exact preservation for begun BIO12 input."""
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess

import fitz
import jsonschema

ROOT = Path.cwd()
BASE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("ordinary_schema_validator", ROOT / "scripts/validate_schemas.py")
ordinary = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ordinary)
schema = json.loads((ROOT / "docs/landscape-runtime.schema.json").read_text())


def read(relative):
    return json.loads((BASE / relative).read_text())


def verify_binding(binding):
    path = Path(binding["path"])
    assert not path.is_absolute() and ".." not in path.parts, path
    target = ROOT / path
    assert target.is_file() and not target.is_symlink(), path
    data = target.read_bytes()
    assert hashlib.sha256(data).hexdigest() == binding["sha256"], path
    assert len(data) == binding["bytes"], path
    assert str(path) in committable, f"Noncommittable bound file: {path}"
    return target


discovery = subprocess.run(
    ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z", "--"],
    check=True, capture_output=True,
)
committable = {p.decode() for p in discovery.stdout.split(b"\0") if p}
parsed = 0
for path in sorted(BASE.rglob("*")):
    assert not path.is_symlink(), path
    if not path.is_file():
        continue
    assert str(path.relative_to(ROOT)) in committable, f"Noncommittable own artifact: {path}"
    if path.suffix == ".json":
        assert ordinary.validate_file(str(path), schema), path
        parsed += 1
    if path.suffix == ".jsonl":
        for line in path.read_text().splitlines():
            if line.strip():
                json.loads(line)
                parsed += 1

whole = read("input/whole479-current-canonical.original.json")
jsonschema.validate(whole, schema)
owned = read("input/twelve-whole-current-DEEN-goals.original.json")
candidate = read("candidate/twelve-whole-unmodified-DEEN-goals.inactive.json")
assert owned == candidate and len(owned) == 12
whole_by_id = {g["id"]: g for g in whole["goals"]}
owned_ids = {g["id"] for g in owned}
assert len(owned_ids) == 12
assert all(g == whole_by_id[g["id"]] for g in owned)

rows = read("source/all-original-whole-duties-and-all-current-whole-partners.neutral.json")
assert len(rows) == 16
assert sum(len(r["ownedGoalEdges"]) for r in rows) == 16
assert sum(len(r["allOriginalPartnerRows"]) for r in rows) == 113
partner_ids = set()
for row in rows:
    verify_binding(row["mappingInput"])
    verify_binding(row["sourceExtractionInput"])
    for partner in row["wholeCurrentCanonicalPartners"]:
        goal = partner.get("wholeGoal", partner)
        assert goal == whole_by_id[goal["id"]]
        partner_ids.add(goal["id"])
assert len(partner_ids) == 41

frozen = read("input/twelve-full-source-collections-and-mappings.exact-frozen-bindings.json")
assert len(frozen) == 6
for collection in frozen:
    for role in ("mapping", "sourceExtraction"):
        original = verify_binding(collection[role]["originalBinding"])
        snapshot = verify_binding(collection[role]["exactFrozenInput"])
        assert original.read_bytes() == snapshot.read_bytes()

reuse = read("input/whole-current-A12-M12.exact-retained-records.json")
for kind in ("semanticAtomicityConfigPath", "memoryReviewConfigPath"):
    original_rows = [json.loads(line) for line in (ROOT / reuse[kind]["reviewPath"]).read_text().splitlines() if line.strip()]
    selected = [r for r in original_rows if r.get("goalId") in owned_ids]
    assert selected == reuse[kind]["rows"] and len(selected) == 12

primary = read("source/HE-primary-extraction.actual-provenance.json")
pdf = fitz.open(verify_binding(primary["wholePrimary"]))
assert primary["actuallyReadPhysicalPages"] == [38, 39, 40]
for page, binding in zip(primary["actuallyReadPhysicalPages"], primary["actualOutputs"]):
    assert verify_binding(binding).read_text() == pdf[page - 1].get_text()

p_reuse = read("input/current-active-P-owned-scope-reuse-search.actual.json")
for searched in p_reuse["searchedExactCurrentRegisteredPositiveConfigs"]:
    config = json.loads(verify_binding(searched["config"]).read_text())
    assert sorted(owned_ids.intersection(config["scope"]["goalIds"])) == searched["ownedScopeIntersection"]
assert p_reuse["ownedScopeMatches"] == []

readiness = read("candidate/whole-twelve-machine-material-readiness.author-checkpoint.json")
assert readiness["createdPProfiles"] == readiness["proposedMaterialCases"] == 0
assert readiness["actualLearnerPerformances"] == []
assert readiness["strictNetGain"] == readiness["newScientificCompletions"] == readiness["restoredBindings"] == 0
assert not readiness["humanApproval"] and not readiness["humanTrial"]
print(json.dumps({
    "status": "PASS", "ownJsonArtifactsFullyParsed": parsed,
    "wholeRuntimeSnapshotOrdinarySchema": "PASS", "wholeGoals": len(whole["goals"]),
    "ownedWholeGoals": 12, "exactRetainedA": 12, "exactRetainedM": 12,
    "wholeSourceDuties": 16, "wholePartnerEdges": 113, "uniqueWholePartners": 41,
    "exactFrozenSourceCollections": 6, "actualHEPrimaryPages": [38, 39, 40],
    "createdPProfiles": 0, "createdCases": 0,
    "scope": "Author checkpoint parsing, schema, bindings and preservation; no science approval or M7 gain",
}))
