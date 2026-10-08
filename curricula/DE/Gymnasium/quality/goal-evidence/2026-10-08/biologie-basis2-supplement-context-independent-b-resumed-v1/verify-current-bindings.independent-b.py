"""Read-only input inspection for the targeted new Biology supplement context.

This writes only this reviewer's receipts. It never reads mapping decision
reasons or historical P-review reasons, and never modifies active material.
"""
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
ENTRY = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-basis2-source-supplement-technical-author-resumed-v1/neutral-source-supplement-two-context-review.entry.json"

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def load(path):
    return json.loads(path.read_text())

def write(name, value):
    (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")

entry = load(ENTRY)
assert digest(ENTRY) == "1a56decb9f8340a2d3152c64f9aceb92f5f0cdaa1faa31a2b6d6e0e65ba9bb18"
bindings = []

def verify(value):
    if isinstance(value, dict):
        if set(("path", "sha256", "bytes")).issubset(value):
            path = ROOT / value["path"]
            assert path.is_file() and not path.is_symlink(), value["path"]
            actual = digest(path)
            assert actual == value["sha256"].removeprefix("sha256:"), value["path"]
            assert path.stat().st_size == value["bytes"], value["path"]
            bindings.append({"path": value["path"], "sha256": actual, "bytes": path.stat().st_size})
        for sub in value.values():
            verify(sub)
    elif isinstance(value, list):
        for sub in value:
            verify(sub)

verify(entry)
active_path = ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json"
assert digest(active_path) == "e0dacf1f99b04e264bfe649a1d521a4ea015915b9478c9c922c869477d2847dd"
active = {g["id"]: g for g in load(active_path)["goals"]}
candidate = {g["id"]: g for g in load(ROOT / entry["canonicalCandidate"]["path"])["goals"]}
root_id = "e8d54127-d42e-51f5-bfa5-51d826069f95"
supplement_id = "76be4d99-5cf9-54a7-bb27-c296f4ecb939"
new_ids = ["0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38", "32483d30-2162-50a5-a6cc-05b7f2467ab1"]
assert len(active) == 476 and len(candidate) == 479
assert set(candidate) - set(active) == {*new_ids, supplement_id}
for goal_id, goal in active.items():
    assert goal.get("requires", []) == candidate[goal_id].get("requires", []), goal_id
    if goal_id != root_id:
        assert goal == candidate[goal_id], goal_id
assert active[root_id]["weight"] == candidate[root_id]["weight"] == 1
assert candidate[root_id]["contains"] == active[root_id]["contains"] + [supplement_id]
assert {k: v for k, v in active[root_id].items() if k != "contains"} == {k: v for k, v in candidate[root_id].items() if k != "contains"}
assert candidate["860c80f9-e463-598b-8ef8-79f65c12f235"] == active["860c80f9-e463-598b-8ef8-79f65c12f235"]
assert len(candidate["860c80f9-e463-598b-8ef8-79f65c12f235"]["contains"]) == 5
assert candidate[supplement_id]["weight"] == 2 and candidate[supplement_id]["contains"] == new_ids
assert candidate[supplement_id]["requires"] == ["b530a382-2786-5794-8821-3e01a62d88fd"]
assert candidate[supplement_id]["extendedData"]["applicabilityMappingInheritance"] == "boundary"

source_inputs = load(ROOT / entry["wholeSourceReadingInputs"]["path"])
atlas_inputs = load(ROOT / entry["ordinaryAtlasInputs"]["path"])
all_mapping_rows = []
for mapping_path in atlas_inputs["mappingPaths"]:
    all_mapping_rows.extend(load(ROOT / mapping_path)["mappings"])
active_atlas_path = ROOT / "app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json"
active_atlas = load(active_atlas_path)
active_mapping_rows = [r for path in active_atlas["mappingPaths"] for r in load(ROOT / path)["mappings"]]
assert len(active_mapping_rows) == 3084 and len(all_mapping_rows) == 3094
assert all(r in all_mapping_rows for r in active_mapping_rows)
source_results = []
historical_absent_rows = []
for row in source_inputs["entries"]:
    source_goal = row["wholeSourceDuty"]
    extraction = load(ROOT / row["sourceExtraction"]["path"])
    source_goals = extraction.get("sourceGoals", extraction.get("goals", []))
    actual_duty = next(g for g in source_goals if g["id"] == source_goal["id"])
    assert actual_duty == source_goal, source_goal["id"]
    partners = row["originalPartnerRows"]
    for partner in partners:
        assert partner["canonicalGoalId"] in candidate, partner
        assert candidate[partner["canonicalGoalId"]] == active[partner["canonicalGoalId"]], partner
        if partner not in all_mapping_rows:
            assert partner not in active_mapping_rows, partner
            historical_absent_rows.append({"sourceOrdinal": row["sourceOrdinal"], "wholeHistoricalPartnerRow": partner, "alreadyAbsentInActiveAtlas": True})
    source_results.append({
        "sourceOrdinal": row["sourceOrdinal"], "sourceGoalId": source_goal["id"],
        "wholeSourceDutyExact": True, "originalPartnerCount": len(partners),
        "currentEffectiveOriginalPartnerCount": sum(p in all_mapping_rows for p in partners),
        "historicalOriginalPartnerRowsAreNotEffectiveBaseline": True,
        "allOriginalPartnerWholeCanonicalGoalsExactToActive": True,
        "originalPartnerRows": partners,
    })
assert len(source_results) == 20
assert sum(r["originalPartnerCount"] for r in source_results) == 268
assert sum(r["currentEffectiveOriginalPartnerCount"] for r in source_results) == 248
assert len(historical_absent_rows) == 20
partial_rows = load(ROOT / entry["tenDirectPartialMappingRows"]["path"])["rows"]
assert len(partial_rows) == 10
for row in partial_rows:
    assert row["wholePartialPartnerRow"]["matchType"] == "partial"
    assert row["wholePartialPartnerRow"] in all_mapping_rows
source_proof = load(ROOT / entry["sourcePreservationProof"]["path"])
hold_binding = source_proof["fourOriginalOperatorHoldsExact"]
assert digest(ROOT / hold_binding["path"]) == hold_binding["sha256"]
holds = load(ROOT / hold_binding["path"])
assert holds["count"] == len(holds["residuals"]) == 4
hold_constraints = [{k: v for k, v in r.items() if k in ("sourceOrdinal", "sourceGoalId", "status", "exactOriginalDutyDe", "currentSourcePartnerIds")} for r in holds["residuals"]]
assert all(r["status"].startswith("HOLD_") for r in hold_constraints)
write("twenty-whole-sources-268-partners-and-four-holds.preservation.independent-b.actual.json", {
    "schemaVersion": 1, "role": "Independently recomputed preservation; no historical source review restarted",
    "twentyWholeSourceDutyCount": 20, "wholeOriginalPartnerCount": 268,
    "uniqueOriginalPartnerGoalCount": len({p["canonicalGoalId"] for r in source_results for p in r["originalPartnerRows"]}),
    "entries": source_results, "tenWholePartialRowsExact": partial_rows,
    "currentEffectiveOriginalPartnerCount": 248,
    "historicalOriginalRowsAlreadyAbsentInActiveAtlas": historical_absent_rows,
    "activeAtlasInputSha256": digest(active_atlas_path),
    "all3084ActualActiveAtlasRowsRetainedExactly": True,
    "currentAtlasOnlyAddsTenActualPartialRows": True,
    "fourHistoricalOperatorConstraints": hold_constraints,
    "wholeOriginalSourceCompetenciesNewlyApproved": 0, "activeWrites": 0,
})

receipt = load(ROOT / entry["ordinaryAtlasReceipt"]["path"])
assert receipt["counts"]["canonicalCurricularAtomicGoals"] == receipt["counts"]["publishedCurricularAtomicGoals"] == 394
assert not receipt["omittedGoals"] and not receipt["unresolvedSourceScopes"]
scope_rows = []
actual_jurisdictions = {gid: [] for gid in new_ids}
def goal_entries(nodes):
    result = []
    for node in nodes:
        if node["kind"] == "goalEntry":
            if node.get("projectionRole", "target") == "target": result.append(node["goalId"])
        elif node["kind"] == "structure":
            result.extend(goal_entries(node["children"]))
        else:
            raise AssertionError(node["kind"])
    return result
for binding in entry["allSourceViews"]:
    view = load(ROOT / binding["snapshot"]["path"])
    targets = goal_entries(view["rootNodes"])
    assert len(targets) == len(set(targets))
    selected = [gid for gid in new_ids if gid in targets]
    assert selected == binding["selectedNewTargetGoalIds"]
    scope = binding["scope"]
    for gid in selected:
        assert scope["stage"] == "SekI"
        actual_jurisdictions[gid].append(scope["jurisdiction"])
    scope_rows.append({"scope": scope, "selectedNewTargetGoalIds": selected})
expected_respiration = ["DE-BB", "DE-BE", "DE-MV", "DE-NW", "DE-SH", "DE-SN", "DE-ST", "DE-TH"]
assert actual_jurisdictions[new_ids[0]] == expected_respiration
assert actual_jurisdictions[new_ids[1]] == ["DE-SN"]

page_comparison = load(ROOT / entry["actualOld392WholePageComparison"]["path"])
baseline_model = load(ROOT / page_comparison["baseline392Model"]["path"])
prior_model = load(ROOT / page_comparison["priorActuallyReviewed394Model"]["path"])
current_model = load(ROOT / entry["wholeCurrent394Model"]["path"])
base_pages = {p["goalId"]: p for p in baseline_model["pages"]}
prior_pages = {p["goalId"]: p for p in prior_model["pages"]}
current_pages = {p["goalId"]: p for p in current_model["pages"]}
word_id = "576d59e2-397a-5654-b853-7c0c4870fbd3"
assert len(base_pages) == 392 and len(prior_pages) == len(current_pages) == 394
old_changed = [gid for gid in base_pages if base_pages[gid] != current_pages[gid]]
assert old_changed == [word_id]
before, after = prior_pages[word_id], current_pages[word_id]
changed_keys = sorted(k for k in before.keys() | after.keys() if before.get(k) != after.get(k))
assert changed_keys == ["pageFingerprint", "reverseRequires"]
def semantic_relation(row):
    return {k: v for k, v in row.items() if k != "pageNumber"}
assert sorted((semantic_relation(r) for r in before["reverseRequires"]), key=lambda r: r["goalId"]) == sorted((semantic_relation(r) for r in after["reverseRequires"]), key=lambda r: r["goalId"])
for relation in after["reverseRequires"]:
    target = current_pages[relation["goalId"]]
    assert relation["pageNumber"] == target["pageNumber"]
    assert relation["anchor"] == target["anchor"] and relation["title"] == target["title"]
    assert word_id in candidate[relation["goalId"]].get("requires", [])
write("576-full394-structural-and-semantic-delta.independent-b.actual.json", {
    "schemaVersion": 1, "role": "Own full-model comparison; separate from the supplied one-page external-relation permutation proof",
    "goalId": word_id, "priorFull394Model": page_comparison["priorActuallyReviewed394Model"],
    "currentFull394Model": entry["wholeCurrent394Model"],
    "whole576Before": before, "whole576After": after, "changedKeys": changed_keys,
    "priorReverseRelationOrder": [r["goalId"] for r in before["reverseRequires"]],
    "currentReverseRelationOrder": [r["goalId"] for r in after["reverseRequires"]],
    "currentReferencesPointToActualTargetPages": True,
    "paginationDeltas": [{"goalId": r["goalId"], "before": next(v["pageNumber"] for v in before["reverseRequires"] if v["goalId"] == r["goalId"]), "after": r["pageNumber"]} for r in after["reverseRequires"]],
    "allRelationTitlesAnchorsAndGoalIdentitiesExact": True,
    "allOther576WholePageFieldsExact": True,
    "391OldWholePagesExactToBaseline392": True,
    "noClaimOf392ExactWholePages": True, "activeWrites": 0,
})
write("current-canonical-and-native-bindings.independent-b.actual.json", {
    "schemaVersion": 1, "inputEntrySha256": digest(ENTRY), "verifiedBindings": bindings,
    "all475OldNonRootWholeGoalsExact": True, "all476OldRequiresExact": True,
    "rootWeightStillOne": True, "rootOnlyAddedSupplementContains": True,
    "old860ClusterFiveChildrenWeightFiveExact": True,
    "actualCurrentSourceViews": scope_rows, "actualNewTargetJurisdictions": actual_jurisdictions,
    "activeCanonicalUnchanged": True, "activeWrites": 0,
})
print("Independent B actual preservation passed: 20 whole duties; 268 historical partners, 248 effective partners and 20 already absent before this task; all 3084 active Atlas rows exact plus 10 partial rows; 4 retained HOLDs; 391 exact old pages and 1 actual 576 reference delta.")
