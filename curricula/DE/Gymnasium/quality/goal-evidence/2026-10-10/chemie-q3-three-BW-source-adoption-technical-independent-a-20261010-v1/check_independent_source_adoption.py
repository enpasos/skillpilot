"""Independent finite comparison of the sealed three-goal technical successor.

Only this new independent package receives outputs. This does not perform a
new scientific, visual, human, national-route, or active M7 review.
"""
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
AUTHOR = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-q3-three-BW-source-adoption-technical-successor-20261010-v1"


def read(path):
    return json.loads(Path(path).read_text())


def binding(path):
    path = Path(path)
    data = path.read_bytes()
    return {"path": path.relative_to(ROOT).as_posix(),
            "sha256": "sha256:" + hashlib.sha256(data).hexdigest(), "bytes": len(data)}


def verify(ref):
    actual = binding(ROOT / ref["path"])
    assert actual["sha256"] == ref["sha256"], ref["path"]
    if "bytes" in ref:
        assert actual["bytes"] == ref["bytes"], ref["path"]
    return actual


def diff(a, b, pointer=""):
    if type(a) is not type(b):
        return [pointer]
    if isinstance(a, dict):
        return sum((diff(a.get(k), b.get(k), pointer + "/" + str(k))
                    for k in sorted(set(a) | set(b))), [])
    if isinstance(a, list):
        if len(a) != len(b):
            return [pointer + "/length"]
        return sum((diff(x, y, pointer + "/" + str(i))
                    for i, (x, y) in enumerate(zip(a, b))), [])
    return [] if a == b else [pointer]


entry = read(AUTHOR / "neutral-three-BW-source-adoption.independent-review.entry.json")
seal = read(AUTHOR / "source-adoption.final.freeze.json")
verified = [verify(r) for r in seal["artifacts"] + seal["immutableRepositoryInputs"]]
assert binding(AUTHOR / "neutral-three-BW-source-adoption.independent-review.entry.json")["sha256"] == "sha256:d2064aff112c38fbb8aa74b37bbe275e71dd4dd28a7eba24ae1a89140b1c4741"
assert binding(AUTHOR / "source-adoption.final.freeze.json")["sha256"] == "sha256:8d4cd3534875d3f13a00815e84b51a37f32793d76d20a8489482853196cba2e6"


def load(key):
    verify(entry[key])
    return read(ROOT / entry[key]["path"])


original = load("original217Mapping")
frozen = load("frozenAuthor220Mapping")
prepared = load("preparedRehearsal220MappingExactSnapshot")
after = load("sourceSuccessor")
assert len(original["mappings"]) == 217
assert len(after["mappings"]) == len(prepared["mappings"]) == len(frozen["mappings"]) == 220
assert after["mappings"] == frozen["mappings"] == prepared["mappings"]
assert after["mappings"][:217] == original["mappings"]
assert len(after["decisions"]) == len(original["decisions"]) == 126
assert {d["sourceGoalId"] for d in after["decisions"]} == {d["sourceGoalId"] for d in original["decisions"]}
changed = diff(prepared["decisions"], after["decisions"])
indices = [i for i, d in enumerate(after["decisions"]) if d["sourceGoalId"] in entry["sourceGoalIds"]]
assert indices == [10, 52, 112]
assert set(changed) == {f"/{i}/{field}" for i in indices for field in ("rationale", "reviewer")}
for i, (old, new) in enumerate(zip(original["decisions"], after["decisions"])):
    if i not in indices:
        assert old == new, (i, diff(old, new))
for i, source_id, new_id, raw_type in zip(indices, entry["sourceGoalIds"], entry["newGoalIds"], ("partial", "exact", "exact")):
    decision = after["decisions"][i]
    assert decision["sourceGoalId"] == source_id
    assert decision["matchType"] == "partial"
    assert decision["canonicalGoalIds"] == frozen["decisions"][i]["canonicalGoalIds"]
    assert decision["reviewedAt"] == frozen["decisions"][i]["reviewedAt"]
    row = next(r for r in after["mappings"] if r["canonicalGoalId"] == new_id)
    assert row == {"legacyGoalId": source_id, "canonicalGoalId": new_id,
                   "matchType": raw_type, "reviewDecisionId": source_id}
    assert "no additional substantive review" in decision["reviewer"]
    assert "Keine zusätzliche Fachprüfung" in decision["rationale"]
    assert "menschliche Freigabe" in decision["rationale"]
assert after["humanApprovalClaim"] is False
assert after["status"] == "machine-assisted-bounded-partial-source-review"
assert "Druck/Temperatur" in after["note"] and "partial" in after["note"]

source = load("whole126SourceExtraction")
active_source = load("wholeActiveSourceExtractionExactSnapshot")
native_source = read(ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-q3-three-BW-current-raster-native-preparation-author-20261010-v1/candidate/BW126-same-whole-source-tracked-primary-path.inactive.json")
assert len(source["sourceGoals"]) == 126 and len(source["passages"]) == 13
assert diff(native_source, source) == ["/sourceDocument/path"]
assert source["sourceDocument"] == active_source["sourceDocument"]
active_source_deltas = diff(active_source, source)
assert set(active_source_deltas) == {f"/passages/{i}/sourcePath" for i in range(13)} | {"/sourceGoals/10/sourceRef", "/sourceGoals/112/sourceRef"}
for old, new in zip(active_source["sourceGoals"], source["sourceGoals"]):
    assert {k:v for k,v in old.items() if k != "sourceRef"} == {k:v for k,v in new.items() if k != "sourceRef"}
for old, new in zip(active_source["passages"], source["passages"]):
    assert {k:v for k,v in old.items() if k != "sourcePath"} == {k:v for k,v in new.items() if k != "sourcePath"}

future = load("frozenFuture484Canonical")
old = load("frozenOld480Canonical")
sets = load("protectedAllFiveGoalIdSets")
protected = next(s["strictCompleteGoalIds"] for s in sets["subjects"] if s["subject"] == "chemie")
assert len(protected) == len(set(protected)) == 177
old_goals = {g["id"]:g for g in old["goals"]}
future_goals = {g["id"]:g for g in future["goals"]}
assert all(old_goals[i] == future_goals[i] for i in protected)

baseline = read(AUTHOR / "inputs/normal-prepared-source-projection.selected-fields.snapshot.json")
projection = read(AUTHOR / "checks/fresh-normal-source-projection.selected-fields.actual.json")
assert baseline["counts"] == projection["counts"] == {
    "canonicalCurricularAtomicGoals":381, "publishedCurricularAtomicGoals":362,
    "sourceViews":48, "unresolvedSourceScopeDecisions":496, "omittedGoals":19}
for k in ("omittedGoals", "unresolvedSourceScopes", "scopes", "outputBindings"):
    assert baseline[k] == projection[k], k
assert len(projection["omittedGoals"]) == 19 and len(projection["unresolvedSourceScopes"]) == 496
bw_roles = {s["key"]:sorted(set(s["goalIds"]) & set(entry["newGoalIds"]))
            for s in projection["scopes"] if s["jurisdiction"] == "DE-BW"}
assert bw_roles == {"DE-BW/SekI/": [], "DE-BW/SekII/GK": [entry["newGoalIds"][0]],
                    "DE-BW/SekII/LK": sorted(entry["newGoalIds"])}
assert all(not (set(s["goalIds"]) & set(entry["newGoalIds"]))
           for s in projection["scopes"] if s["jurisdiction"] != "DE-BW")
existing = load("existingIndependentEvidenceReferences")
for r in existing.values():
    verify(r)

proof = {
    "schemaVersion":1, "role":"independent finite technical comparison; no new scientific review",
    "neutralEntry":binding(AUTHOR / "neutral-three-BW-source-adoption.independent-review.entry.json"),
    "authorSeal":binding(AUTHOR / "source-adoption.final.freeze.json"),
    "verifiedAuthorArtifactAndImmutableInputBindings":verified,
    "sourceDutyCount":126, "wholePassageCount":13,
    "whole126DutiesAndRawFieldsPreserved":True,
    "previouslyScientificallyReviewedSourceTransportChanges":active_source_deltas,
    "original217PartnerRowsExact":True, "all220CurrentPartnerRowsExact":True,
    "other123DecisionBodiesExact":True, "decisionDeltaPointers":changed,
    "existingReviewDatesExact":True,
    "newRawEdgeTypes":["partial","exact","exact"], "wholeAggregateDecisionTypes":["partial"]*3,
    "source002FullClausePressureTemperatureOpen":True,
    "existingIndependentEvidenceReferences":existing,
    "preparedProjectionCounts":projection["counts"], "bwNewGoalRoles":bw_roles,
    "whole496UnresolvedScopeDecisionsExact":True, "whole19OmissionsExact":True,
    "all48ScopeGoalIdListsExact":True, "all50PreparedSourceOutputBindingsExact":True,
    "all177ProtectedCanonicalGoalBodiesExact":True,
    "humanApprovalClaim":False, "humanTrialClaim":False, "actualLearnerExperimentClaim":False,
    "additionalScienceReviewClaim":False, "wholeSourceReviewedClaim":False,
    "activeWrites":0, "strictGain":0, "actualExitCode":0,
}
(OUT / "independent-finite-source-operator-partner-scope-comparison.actual.json").write_text(json.dumps(proof,ensure_ascii=False,indent=2)+"\n")
print(json.dumps({"actualExitCode":0, "duties":126, "originalPartners":217,
                  "currentPartners":220, "metadataDecisionDeltaPointers":changed,
                  "protectedGoalBodies":177, "bwNewGoalRoles":bw_roles,
                  "source002":"partial", "strictGain":0},indent=2))
