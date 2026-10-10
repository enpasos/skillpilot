"""Integrate exact foreign-qualified Economics inputs; preserve old whole bytes."""
import collections
import datetime
import hashlib
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[7]
OUT = pathlib.Path(__file__).resolve().parent
ROLLOUT = "curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current493-reviewed-20261009-v1"
REGISTRY = "curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json"
BOOK = "app/scripts/config/goal-books/de-gym-economics-current-canonical.json"
QUALITY = "app/scripts/generateCurriculumQualityStatus.ts"
P336 = "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current485-V13-two-reviewed-requires-P336-SEM485-binding-only-author-v1/whole-P336-only-two-current-reviewed-requires-input-fingerprint-successors.jsonl"
NEW_NAV = [
    "5317d078-413b-58bb-9262-d57387d51655",
    "cb53b170-d531-5267-9571-ec57004b0fb3",
    "f761852b-a0df-5ea6-a033-67bf3fb94ec1",
    "bc977eaf-b2f0-5cb2-af48-2dff948830af",
    "a5689d99-1ff6-57d1-b83e-b64c2dad480d",
    "d2b41a54-0d32-5cee-948f-77954b0c6e79",
    "86b0ed9d-3809-5402-92ad-89c2f9cbbe76",
]

def sha(data):
    return hashlib.sha256(data).hexdigest()

def read(relative):
    return json.loads((ROOT / relative).read_text())

def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    assert json.loads(path.read_text()) == value

plan = json.loads((OUT / "prepared-qualified-50-base-active-copies-plan.json").read_text())
assert len(plan["wholeQualifiedCopies"]) == 50
foreign = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current493-active-path-A336-M336-P43-independent-root-foreign-technical-audit-v1/actual-independent-root-foreign-technical-adapter-KEEP.receipt.json"
assert sha(foreign.read_bytes()) == "15864ea2d5d506075ba3bbc1ebf8148f3908edc15526868653f552764af9c6fa"
assert json.loads(foreign.read_text())["verdict"] == "KEEP"
assert sha((ROOT / P336).read_bytes()) == "6e843a5d9b727923dd26a07e9f63fa737bcacc01be59b1a22ab86dea8c8f8aa0"
sources = {}
for copy in plan["wholeQualifiedCopies"]:
    data = (ROOT / copy["path"]).read_bytes()
    assert sha(data) == copy["sha256"], copy["path"]
    json.loads(data)
    sources[copy["target"]] = data
registry_before = (ROOT / REGISTRY).read_bytes()
registry = json.loads(registry_before)
other_rows = [row for row in registry["subjects"] if row["subject"] != "wirtschaftswissenschaften"]
economics = next(row for row in registry["subjects"] if row["subject"] == "wirtschaftswissenschaften")
economics_before = json.loads(json.dumps(economics))
economics.update({
    "semanticKindLedgerPath": ROLLOUT + "/wirtschaftswissenschaften.semantic-kinds.json",
    "semanticAtomicityConfigPath": ROLLOUT + "/wirtschaftswissenschaften.atomicity336.config.json",
    "memoryReviewConfigPath": ROLLOUT + "/wirtschaftswissenschaften.memory336.config.json",
    "positiveEvidenceConfigPaths": [ROLLOUT + f"/positive/{number:02d}.positive-evidence.config.json" for number in range(1, 44)],
})
assert {key for key in economics_before if economics_before[key] != economics[key]} == {
    "semanticKindLedgerPath", "semanticAtomicityConfigPath", "memoryReviewConfigPath", "positiveEvidenceConfigPaths",
}
assert other_rows == [row for row in registry["subjects"] if row["subject"] != "wirtschaftswissenschaften"]
sources[REGISTRY] = (json.dumps(registry, ensure_ascii=False, indent=2) + "\n").encode()
book = read(BOOK)
book_before = json.loads(json.dumps(book))
book["semanticKindLedgerPath"] = economics["semanticKindLedgerPath"]
book["evidenceReviewPaths"] = [P336]
assert {key for key in book if book[key] != book_before[key]} == {"semanticKindLedgerPath", "evidenceReviewPaths"}
assert book["publicationMode"] == "review" and "Review-Ausgabe" in book["title"]
sources[BOOK] = (json.dumps(book, ensure_ascii=False, indent=2) + "\n").encode()
quality_before = (ROOT / QUALITY).read_text()
start = quality_before.index("const CANONICAL_GYM_ECONOMICS_PRACTICE_CLUSTER_IDS = [\n")
end = quality_before.index("\n]", start)
block = quality_before[start:end]
assert block.count("'", block.index("[")) == 14
quality_after = quality_before[:end] + "".join(f"\n  '{goal_id}'," for goal_id in NEW_NAV) + quality_before[end:]
assert quality_after[:start] == quality_before[:start]
assert quality_after[end + sum(len(f"\n  '{goal_id}',") for goal_id in NEW_NAV):] == quality_before[end:]
sources[QUALITY] = quality_after.encode()
can = json.loads(sources[economics["landscapePath"]])
sem = json.loads(sources[economics["semanticKindLedgerPath"]])
assert len(can["goals"]) == 493 and len(sem["decisions"]) == 493
counts = collections.Counter(row["semanticKind"] for row in sem["decisions"])
assert counts["curricularAtomic"] == 336 and counts["memory"] == 10
assert all(next(row for row in sem["decisions"] if row["goalId"] == goal_id)["semanticKind"] == "practiceAssessment" for goal_id in NEW_NAV)
assert sha((ROOT / economics["landscapePath"]).read_bytes()) == "ced16a782bd880239011f33731c57cf59d54d02b923c55c31c918492610ebfaa"
assert not (OUT / "before-active-files").exists(), "This exact integration is single-use; inspect the previous receipt instead of overwriting history."
before = []
for target in sources:
    path = ROOT / target
    if path.exists():
        data = path.read_bytes()
        backup = OUT / "before-active-files" / target
        backup.parent.mkdir(parents=True, exist_ok=True)
        backup.write_bytes(data)
        before.append({"path": target, "sha256": sha(data), "exactHistoricalCopy": backup.relative_to(ROOT).as_posix()})
    else:
        before.append({"path": target, "previouslyAbsent": True})
write_json(OUT / "actual-before-base50-plus-registry-book-nav-whole-files.json", before)
for target, data in sources.items():
    path = ROOT / target
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    assert path.read_bytes() == data
assert [row for row in read(REGISTRY)["subjects"] if row["subject"] != "wirtschaftswissenschaften"] == other_rows
write_json(OUT / "actual-base50-plus-economics-only-registry-book-nav.integration.receipt.json", {
    "schemaVersion": 1,
    "integratedAtUtc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "scope": "Exact Economics foreign-qualified input integration; not new scientific or human approval",
    "qualifiedExactCopies": plan["wholeQualifiedCopies"],
    "actualWrittenFiles": [{"path": target, "sha256": sha(data), "bytes": len(data)} for target, data in sources.items()],
    "actualWholeGoals": 493,
    "actualSemanticCounts": dict(counts),
    "registryOtherFourSubjectsPreservedExactly": True,
    "bookPublicationMode": book["publicationMode"],
    "bookP336WholeLedgerExact": True,
    "addedQualifiedPracticeNavigationIds": NEW_NAV,
    "historicalInputsPreservedInExactCopies": before,
    "pending": ["current Berlin source activation and dependent compiler checks", "15 country GK scope preservation and required route checks", "normal production Book336 render", "targeted current dual D reviews", "bundled final five-gate and Layer-A checks"],
    "newStrictClosuresClaimed": 0,
    "humanApprovalClaimed": False,
})
print(json.dumps({"exactQualifiedCopies": 50, "writtenFiles": len(sources), "currentCurricularAtomic": 336, "otherFourRegistryRowsExact": True, "newStrictClosuresClaimed": 0}))
