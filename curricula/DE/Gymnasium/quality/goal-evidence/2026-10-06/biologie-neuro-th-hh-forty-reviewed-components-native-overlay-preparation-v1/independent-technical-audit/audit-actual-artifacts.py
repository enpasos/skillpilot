# SPDX-License-Identifier: Apache-2.0
"""Read existing native artefacts; never rerun native builders or write inputs."""
import collections
import datetime
import hashlib
import json
from pathlib import Path

OWN = Path(__file__).resolve().parent
PACKAGE = OWN.parent
ROOT = OWN.parents[7]
LANE = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06"
NEURO = LANE / "biologie-q2-neurobiology-twenty-one-source-p-author-remediation-v2"
bindings = {}


def digest(path):
    return "sha256:" + hashlib.sha256(path.read_bytes()).hexdigest()


def read(path):
    path = Path(path)
    if not path.is_absolute():
        path = ROOT / path
    bindings[str(path.relative_to(ROOT))] = digest(path)
    return json.loads(path.read_text())


def own_write(name, value):
    path = OWN / name
    assert not path.exists(), "Preserve completed own artefacts: " + name
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def pairs(rows, scope_field="scopeKey", goal_field="goalId"):
    return [(row[scope_field], row[goal_field]) for row in rows]


def without_numbers(value):
    if isinstance(value, dict):
        return {key: without_numbers(item) for key, item in value.items()
                if key not in {"pageNumber", "navigationOrder", "treeOrder", "pageFingerprint"}}
    if isinstance(value, list):
        return [without_numbers(item) for item in value]
    return value


def applicability_set(page):
    return {(row["jurisdiction"], scope["stage"], scope.get("durationModel"), scope.get("courseProfile"))
            for row in page["applicability"] for scope in row["scopes"]}


guard = read(PACKAGE / "actual-current-inputs-and-protected74-127-807-478.guard.json")
for item in guard["inputBindings"]:
    assert digest(ROOT / item["path"]) == item["sha256"], item["path"]
input_count = len(guard["inputBindings"])
assert input_count == 1241

config = read("app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json")
current = read(config["landscapePath"])
candidate = read(PACKAGE / "current472-neuro21-overlay.canonical.candidate.json")
current_goals = {row["id"]: row for row in current["goals"]}
candidate_goals = {row["id"]: row for row in candidate["goals"]}
kind_delta = read(PACKAGE / "current-kind-fingerprint-technical-deltas.json")
selected = {row["goalId"] for row in kind_delta}
assert len(selected) == 21
assert list(current_goals) == list(candidate_goals) and len(current_goals) == 472
assert sum(current_goals[goal_id] == goal for goal_id, goal in candidate_goals.items()
           if goal_id not in selected) == 451
assert all(current_goals[goal_id].get("requires") == goal.get("requires")
           and current_goals[goal_id].get("contains") == goal.get("contains")
           for goal_id, goal in candidate_goals.items())
kinds = read(config["semanticKindLedgerPath"])
candidate_kinds = read(PACKAGE / "current390-neuro21-overlay.semantic-kinds.technical-candidate.json")
assert len(kinds["decisions"]) == len(candidate_kinds["decisions"])
assert sum(row["semanticKind"] == "curricularAtomic" for row in kinds["decisions"]) == 390
for old, new in zip(kinds["decisions"], candidate_kinds["decisions"]):
    assert old["goalId"] == new["goalId"] and old["semanticKind"] == new["semanticKind"]
    assert {key: value for key, value in old.items() if key != "sourceFingerprint"} == {
        key: value for key, value in new.items() if key != "sourceFingerprint"}
    if old["goalId"] not in selected:
        assert old == new

baseline = read("app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/source-projection.receipt.json")
hold = read(PACKAGE / "neuro21-hold-overlay.source-atlas.actual.receipt.json")
combined = read(PACKAGE / "neuro21-hold-plus-reviewed40.source-atlas.actual.receipt.json")
ordered = read(PACKAGE / "all22-ordered-target-lists-and-actual-overlay-deltas.json")
expected_counts = [390, 382, 382]
for receipt, expected in zip([baseline, hold, combined], expected_counts):
    assert receipt["counts"]["canonicalCurricularAtomicGoals"] == 390
    assert receipt["counts"]["publishedCurricularAtomicGoals"] == expected
    assert receipt["counts"]["sourceViews"] == 22
    assert receipt["counts"]["unresolvedSourceScopeDecisions"] == 0
    assert len(receipt["scopes"]) == 22
    assert len(set(goal_id for scope in receipt["scopes"] for goal_id in scope["goalIds"])) == expected
for item in baseline["inputBindings"]:
    assert digest(ROOT / item["path"]) == item["sha256"], item["path"]
for item in baseline["outputBindings"]:
    assert digest(ROOT / item["path"]) == item["sha256"], item["path"]

scope_maps = [{scope["key"]: scope for scope in receipt["scopes"]} for receipt in [baseline, hold, combined]]
assert all(list(scope_maps[0]) == list(item) for item in scope_maps[1:])
assert [row["key"] for row in ordered] == list(scope_maps[0])
restored, remaining, additions = [], [], []
scope_summaries = []
for row in ordered:
    key = row["key"]
    before, held, after = [item[key]["goalIds"] for item in scope_maps]
    assert row["baselineOrderedTargetIds"] == before
    assert row["holdOrderedTargetIds"] == held
    assert row["reviewed40OrderedTargetIds"] == after
    assert len(before) == len(set(before)) and len(held) == len(set(held)) and len(after) == len(set(after))
    removed = [goal_id for goal_id in before if goal_id not in held]
    recovered = [goal_id for goal_id in removed if goal_id in after]
    lost = [goal_id for goal_id in before if goal_id not in after]
    added = [goal_id for goal_id in after if goal_id not in before]
    assert row["removedByHold"] == removed
    assert row["restoredOnlyByReviewed40"] == recovered
    assert row["remainingLostIds"] == lost
    assert row["addedVsCurrentBaseline"] == added
    assert added == [goal_id for goal_id in held if goal_id not in before]
    assert row["additionsAlreadyInOriginalHoldOverlay"] == added
    restored.extend((key, goal_id) for goal_id in recovered)
    remaining.extend((key, goal_id) for goal_id in lost)
    additions.extend((key, goal_id) for goal_id in added)
    scope_summaries.append({"key": key, "baseline": len(before), "hold": len(held), "combined": len(after),
                            "removedByHold": len(removed), "restored": len(recovered),
                            "remainingLost": len(lost), "originalOverlayAdditions": len(added),
                            "threeCompleteOrderedListsCompared": True})
assert len(restored) == len(set(restored)) == 40
assert collections.Counter(scope for scope, _ in restored) == {"DE-HH/SekI/": 21, "DE-TH/SekI/": 19}
assert len(remaining) == len(set(remaining)) == 200
assert len(additions) == 6
assert set(scope for scope, _ in additions) == {"DE-HE/SekII/GK", "DE-HE/SekII/LK"}
assert set(goal_id for _, goal_id in additions) == {
    "04d770b3-ba5e-5438-88ca-110cbaeba62c", "080b10c7-f308-57ff-b067-3bd189e37fea",
    "e3fb5f1d-e277-5e28-8883-45821b972607"}

historical = read(LANE / "biologie-neuro-outside-fifty-two-source-restoration-worklist-v1/outside52.actual-source-debt-and-view-worklist.json")
historical_pairs = set(pairs(historical["goalViewPairs"], "lostViewKey"))
assert len(historical_pairs) == 187
assert len(set(remaining) & historical_pairs) == 147
assert len(set(restored) & historical_pairs) == 40
assert historical_pairs == (set(remaining) | set(restored)) & historical_pairs
assert sum(goal_id in selected for _, goal_id in remaining) == 53
assert sum(goal_id not in selected for _, goal_id in remaining) == 147
residual_file = read(PACKAGE / "actual-residual-source-scope-debt-and-next-bounded-worklist.json")
assert pairs(residual_file) == remaining
assert all(row["isCurrent21"] == (row["goalId"] in selected) and row["sourceDebtRetained"]
           and row["historicalOutside52Pair"] == ((row["scopeKey"], row["goalId"]) in historical_pairs)
           for row in residual_file)

boundaries = read(PACKAGE / "adopted40-reviewed-component-boundaries-and-whole-holds.json")
components = boundaries["componentPairs"]
assert len(components) == 40
assert set(pairs(components, goal_field="canonicalGoalId")) == set(restored)
assert all(row["sourceWholeCoverage"] is False and row["targetWholeCoverage"] is False
           and row["adoptedAandBDecisionsForTechnicalPreparationOnly"] for row in components)
component_mapping_paths = [str((PACKAGE / f"{state}.forty-component-reviewed.technical-mapping.candidate.json").relative_to(ROOT))
                           for state in ["DE-TH", "DE-HH"]]
witnesses = [dict(scopeKey=scope["key"], **witness) for scope in combined["scopes"]
             for witness in scope["witnesses"] if witness["mappingPath"] in component_mapping_paths]
assert len(witnesses) == 40
assert set(pairs(witnesses)) == set(restored)
assert all(row["coverage"] == "direct" and row["goalId"] == row["mappedTargetGoalId"]
           and row["profileBasis"] == "source-metadata" for row in witnesses)
for path, count in zip(component_mapping_paths, [19, 21]):
    mapping = read(path)
    assert len(mapping["mappings"]) == len(mapping["decisions"]) == count
    assert mapping["wholeOriginalSourceCoverage"] is False
    assert mapping["originalWholeSourceHoldRetained"] is True
    assert mapping["humanApproval"] is False and mapping["humanTrial"] is False
    for row in mapping["mappings"]:
        assert any(component["sourceGoalId"] == row["legacyGoalId"]
                   and component["canonicalGoalId"] == row["canonicalGoalId"] for component in components)
    for row in mapping["decisions"]:
        assert row["wholeOriginalSourceCoverage"] is False and row["wholeCanonicalGoalCoverage"] is False
for key, count in [("TH24WholePairHolds", 24), ("HH11WholePairHolds", 11)]:
    rows = boundaries[key]
    assert len(rows) == count
    assert all((row["lostViewKey"], row["goalId"]) in remaining for row in rows)
    assert all(row["nativeVisibilityRestored"] is False for row in rows)
for key, goal_id in [("HH22ExplicitBoundary", "967b666d-aed4-50d8-be73-70269cb306db"),
                     ("HH29ExplicitBoundary", "d773ac89-37ef-51cd-a6ee-a75a6b10c43b")]:
    row = boundaries[key]
    assert row["canonicalGoalId"] == goal_id
    assert row["wholeCurrentCanonicalGoalApproved"] is False and row["wholeOriginalSourceApproved"] is False
    mapping = read(component_mapping_paths[1])
    decision = next(item for item in mapping["decisions"] if item["sourceGoalId"] == row["candidateSourceGoalId"])
    assert decision["technicalResidualBoundary"] == row["additionalOrClarifiedResidualRequirementsHeldByB"]

additions_file = read(PACKAGE / "actual-original-overlay-stage-course-additions-and-depth-holds.json")
assert pairs(additions_file) == additions
assert all(row["wholeCanonicalRoutineApproved"] is False
           and row["requiresIndependentSourceAndOperatorDepthDecisionBeforeIntegration"] for row in additions_file)
assert all("No animal comparison claim is approved" in row["residualBoundary"]
           for row in additions_file if row["goalId"] == "080b10c7-f308-57ff-b067-3bd189e37fea")

model_names = ["baseline-current390-source-atlas", "neuro21-hold-overlay-source-atlas",
               "neuro21-hold-plus-reviewed40-source-atlas", "baseline-current390-full-catalogue",
               "neuro21-hold-plus-reviewed40-full-catalogue"]
models = {name: read(PACKAGE / f"{name}.actual.book-model.json") for name in model_names}
model_checks = []
for name, model in models.items():
    expected = 382 if "hold" in name and "source-atlas" in name else 390
    pages = {page["goalId"]: page for page in model["pages"]}
    assert len(pages) == len(model["pages"]) == model["book"]["pageCount"] == expected
    landscape = current_goals if name.startswith("baseline") else candidate_goals
    if "source-atlas" in name:
        receipt = baseline if name.startswith("baseline") else combined if "reviewed40" in name else hold
        assert set(pages) == set(goal_id for scope in receipt["scopes"] for goal_id in scope["goalIds"])
    for page in model["pages"]:
        goal = landscape[page["goalId"]]
        assert page["title"] == goal["title"] and page["description"] == goal["description"]
        for field in ["requires", "reverseRequires"]:
            for link in page[field]:
                target = pages[link["goalId"]]
                assert link["pageNumber"] == target["pageNumber"] and link["title"] == target["title"]
                assert link["anchor"] == target["anchor"]
                if field == "requires":
                    assert target["pageNumber"] < page["pageNumber"]
    model_checks.append({"name": name, "pageCount": expected, "uniquePagesAndCheckedLocalLinks": True,
                         "wholeSerializedModelSha256": digest(PACKAGE / f"{name}.actual.book-model.json")})

before_atlas = {page["goalId"]: page for page in models[model_names[0]]["pages"]}
after_atlas = {page["goalId"]: page for page in models[model_names[2]]["pages"]}
before_full = {page["goalId"]: page for page in models[model_names[3]]["pages"]}
after_full = {page["goalId"]: page for page in models[model_names[4]]["pages"]}
strict_subjects = {row["subject"]: row for row in guard["protectedSubjects"]}
assert {key: len(row["strictGoalIds"]) for key, row in strict_subjects.items()} == {
    "biologie": 74, "chemie": 127, "mathematik": 807, "physik": 478}
protected = set(strict_subjects["biologie"]["strictGoalIds"])
assert len(protected) == 74 and not protected & selected
assert all(current_goals[goal_id] == candidate_goals[goal_id] and before_full[goal_id] == after_full[goal_id]
           and goal_id in before_atlas and goal_id in after_atlas for goal_id in protected)
page_deltas = read(PACKAGE / "actual-page-and-applicability-context-deltas.json")
actual_changed = [goal_id for goal_id, before in before_atlas.items() if before != after_atlas.get(goal_id)]
assert actual_changed == [row["goalId"] for row in page_deltas] and len(actual_changed) == 239
for row in page_deltas:
    assert row["before"] == before_atlas[row["goalId"]] and row["after"] == after_atlas.get(row["goalId"])
    assert row["protectedCurrentStrict74"] == (row["goalId"] in protected)
    assert row["changedFields"] == ([key for key, value in row["before"].items() if value != row["after"][key]]
                                     if row["after"] is not None else ["PAGE_OMITTED"])
page_classes = []
for row in page_deltas:
    if row["goalId"] not in protected:
        continue
    before, after = row["before"], row["after"]
    numeric_only = without_numbers(before) == without_numbers(after)
    page_classes.append({"goalId": row["goalId"], "title": before["title"],
                         "classification": "NUMBERING_AND_LINK_NUMBERS_ONLY" if numeric_only else "ACTUAL_APPLICABILITY_LOSS",
                         "changedFields": row["changedFields"],
                         "pageNumberBefore": before["pageNumber"], "pageNumberAfter": after["pageNumber"],
                         "removedApplicability": sorted(applicability_set(before) - applicability_set(after)),
                         "addedApplicability": sorted(applicability_set(after) - applicability_set(before)),
                         "realContextChangedFields": [key for key in without_numbers(before)
                                                      if without_numbers(before)[key] != without_numbers(after)[key]]})
assert len(page_classes) == 33
assert collections.Counter(row["classification"] for row in page_classes) == {
    "NUMBERING_AND_LINK_NUMBERS_ONLY": 31, "ACTUAL_APPLICABILITY_LOSS": 2}
real_page_changes = [row for row in page_classes if row["classification"] == "ACTUAL_APPLICABILITY_LOSS"]
assert {row["goalId"] for row in real_page_changes} == {
    "5b2571d9-f079-52b2-b21b-8f389c7409f4", "49dbe8fa-7c4a-5ef5-9cd7-a40b60bf88dd"}
assert all(row["removedApplicability"] == [("DE-NW", "SekI", "G9", None)]
           and row["addedApplicability"] == [] and row["realContextChangedFields"] == ["applicability"]
           for row in real_page_changes)
protected_checks = read(PACKAGE / "protected-current74-full-page-and-context-checks.json")
assert {row["goalId"] for row in protected_checks} == protected
assert all(row["atlasWholePageExact"] == (before_atlas[row["goalId"]] == after_atlas[row["goalId"]])
           and row["fullCatalogueWholePageExact"] == (before_full[row["goalId"]] == after_full[row["goalId"]])
           for row in protected_checks)

migration = read(NEURO / "he43.original-ten.actual.migration-and-preservation.json")
source_debt = read(NEURO / "source71.actual.open-debt.json")
omitted_ids = [row["goalId"] for row in combined["omittedGoals"]]
assert len(omitted_ids) == 8 and set(omitted_ids) <= selected
assert set(before_atlas) - set(after_atlas) == set(omitted_ids)
assert set(hold["omittedGoals"][index]["goalId"] for index in range(8)) == set(omitted_ids)
omitted_rows = []
for goal_id in omitted_ids:
    goal = candidate_goals[goal_id]
    old_migration = next(row for row in migration["oldSixteenAuthoredSourceGoals"] if row["canonicalGoalId"] == goal_id)
    previous_witnesses = []
    for scope in baseline["scopes"]:
        for ref in scope["witnessGroupRefs"]:
            group = baseline["witnessGroups"][ref]
            if goal_id not in group["goalIds"]:
                continue
            mapping_path = baseline["inputBindings"][group["mappingInput"]]["path"]
            extraction_path = baseline["inputBindings"][group["extractionInput"]]["path"]
            extraction = read(extraction_path)
            source_goal = next(row for row in extraction["sourceGoals"] if row["id"] == group["sourceGoalId"])
            previous_witnesses.append({"scopeKey": scope["key"], "mappingPath": mapping_path,
                                       "sourceExtractionPath": extraction_path, "sourceGoalId": group["sourceGoalId"],
                                       "mappedTargetGoalId": group["mappedTargetGoalId"], "coverage": group["coverage"],
                                       "profileBasis": group["profileBasis"], "sourceRef": source_goal.get("sourceRef"),
                                       "sourceSpan": source_goal.get("sourceSpan"), "sourceDocumentKey": source_goal.get("sourceDocumentKey"),
                                       "priorWitnessIsNewWholeSourceSupport": False,
                                       "oldHEAuthoredOperationalisationIsOfficialBullet": False if group["sourceGoalId"] == old_migration["oldSourceGoalId"] else None})
    assert previous_witnesses and all(row["coverage"] == "direct" for row in previous_witnesses)
    next_pointers = []
    for component_key in old_migration["originalParentComponentKeys"]:
        successor = next((row for row in migration["successors"] if row["originalBulletKey"] == component_key), None)
        next_pointers.append({"document": migration["primaryDocument"], "physicalAndPrintedPage": 43,
                              "retainedComponentKey": component_key,
                              "officialBulletNumberingClaim": False,
                              "actualRelatedClause": successor["originalText"] if successor else None,
                              "successorSourceGoalId": successor["sourceGoalId"] if successor else None,
                              "wholeGoalSupported": False,
                              "status": "RELATED_EXISTING_PRIMARY_POINTER_ONLY" if successor else "OUTSIDE_Q23_MIGRATION_NEEDS_SEPARATE_PRIMARY_LOCATOR",
                              "nextWork": "Check only the matching assessable subroutine, operator, stage and course. Preserve residual HOLD."})
    omitted_rows.append({"goalId": goal_id, "title": goal["title"], "wholeCurrentDescription": goal["description"],
                         "baselineWitnessCount": len(previous_witnesses),
                         "baselineScopes": sorted({row["scopeKey"] for row in previous_witnesses}),
                         "baselineWitnesses": previous_witnesses,
                         "currentCombinedAtlasOmitted": True, "fullCataloguePagePreserved": True,
                         "remainingPairs": [{"scopeKey": scope, "goalId": goal_id} for scope, lost_id in remaining if lost_id == goal_id],
                         "oldHEAuthoredWitnessIsOfficialBullet": old_migration["isOfficialBullet"],
                         "nextBoundedPrimaryPointers": next_pointers,
                         "wholeSourceOrRoutineSupportApproved": False})

historical_rows = {(row["lostViewKey"], row["goalId"]): row for row in historical["goalViewPairs"]}
next_packages = []
for number, (scope, goal_ids, limit) in enumerate([
    ("DE-NW/SekI/", ["5b2571d9-f079-52b2-b21b-8f389c7409f4", "49dbe8fa-7c4a-5ef5-9cd7-a40b60bf88dd"],
     "Find actual IF7 clauses for bacterial structure and modelled fission; an umbrella immunobiology/neurobiology record does not clear full prokaryotic DNA/plasmid or DNA-distribution depth."),
    ("DE-HE/SekII/LK", ["ff1bf88f-2413-5668-a071-ce9fc499cba3", "f6280154-d57c-599c-94bf-73313005a6df"],
     "GK2 at HE43: chemical acetylcholine synapse, channel types, one substance example and neuromuscular synapse; electrical synapses and general psychoactive-substance breadth remain open."),
    ("DE-HE/SekII/LK", ["a46cafde-7359-5249-8754-19aaa3174ba4", "c9a06264-cce2-54dd-9604-46dd5949f02e", "4f631f78-e13a-58e5-9092-f4db0b8d377a"],
     "LK5 at HE43 names cellular learning processes; separately check model connection changes, LTP/LTD/experimental operators and Hebb/rule limits. No full match established."),
    ("DE-HE/SekII/LK", ["97b24279-def0-5ce6-8726-a1cac9cd38ad"],
     "LK4 at HE43 names synaptic integration; convergence/divergence and network analysis remain unbound unless an exact primary clause is found."),
    ("DE-HE/SekII/LK", ["9b966664-906b-5a5d-8008-cae18de043aa"],
     "LK3 at HE43 concerns hormone-neural interaction; no specific dopamine/serotonin modulating-system support is established."),
    ("DE-HE/SekII/LK", ["8b23f8fb-555d-5720-b5f2-dd6f28a0e786"],
     "Retained Q2.4.GK1 pointer lies outside the migrated Q2.3 source set; first bind an exact official Q2.4 location, then distinguish transduction and frequency/place/population codes.")
], 1):
    assert all((scope, goal_id) in remaining for goal_id in goal_ids)
    documents = []
    if scope == "DE-NW/SekI/":
        for goal_id in goal_ids:
            for anchor in historical_rows[(scope, goal_id)]["heldSourceDebtAnchors"]:
                documents.append({"goalId": goal_id, "primaryDocument": anchor["primaryDocument"],
                                  "originalMappingPath": anchor["originalMappingPath"],
                                  "historicalSourceGoalId": anchor["sourceGoalId"], "sourceRef": anchor["sourceRef"]})
    else:
        for goal_id in goal_ids:
            entry = next(row for row in omitted_rows if row["goalId"] == goal_id)
            documents.extend(dict(goalId=goal_id, **row) for row in entry["nextBoundedPrimaryPointers"])
    next_packages.append({"priority": number, "scopeKey": scope,
                          "actualRemainingGoals": [{"goalId": goal_id, "title": candidate_goals[goal_id]["title"]} for goal_id in goal_ids],
                          "existingOfficialDocumentPointers": documents, "boundedWorkLimit": limit,
                          "newSupportClaimed": False, "wholeApprovalClaimed": False})

attempts = read(PACKAGE / "actual-native390-contract-attempts.json")
assert len(attempts) == 4
assert all(row["originalCurrent390Contract"] == "FAIL" and row["expected"] == 390 and row["actual"] == 382
           for row in attempts if "originalCurrent390Contract" in row)
assert all(row["original390ContractStillFail"] and row["diagnosticCount"] == 382 and not row["scientificApproval"]
           for row in attempts if "explicitReducedUnionDiagnosticOnly" in row)
result = read(PACKAGE / "reviewed40-current390-overlay-and-bookmodel.actual.result.json")
assert pairs(result["actualRestoredGoalScopePairs"]) == restored
assert pairs(result["actualResidualLostGoalScopePairs"]) == remaining
assert result["directPreviouslyReviewedTH19HH21ComponentWitnesses"] == witnesses
assert result["protectedCurrentBio74"]["changedSourceAtlasWholePages"] == 33
assert result["integrationApproved"] is False and result["original390SourceGatePass"] is False
assert result["newStrictCompletions"] == result["restoredActiveBindings"] == result["strictNetGain"] == 0

for item in guard["inputBindings"]:
    assert digest(ROOT / item["path"]) == item["sha256"], "Concurrent drift: " + item["path"]
for path, sha in bindings.items():
    assert digest(ROOT / path) == sha, "Concurrent read drift: " + path

own_write("protected33.actual-numbering-versus-context-classification.json", page_classes)
own_write("eight-omitted-current-goals.actual-baseline-witnesses-and-bounded-pointers.json", omitted_rows)
own_write("next-six-bounded-source-packages.actual-rest-pairs-only.json", next_packages)
summary = {"schemaVersion": 1, "createdAtUTC": datetime.datetime.now(datetime.timezone.utc).isoformat(),
           "role": "independent technical audit of existing receipts, ordered lists and actual BookModels",
           "newNativeBuilderRun": False, "newExternalRead": False, "newScienceReview": False,
           "guardInputHashesCheckedBeforeAndAfter": input_count, "guardInputDriftCount": 0,
           "baselineCompressedWitnessEncodingDecoded": True, "baselineReceiptInputsChecked": len(baseline["inputBindings"]),
           "all22CompleteOrderedTargetListsVerified": True, "scopeSummaries": scope_summaries,
           "restoredPairs": 40, "restoredDETH": 19, "restoredDEHH": 21,
           "all40WitnessesDirectSourceMetadataOnly": True, "all40WholeSourceAndTargetCoverageFalse": True,
           "remainingPairs": 200, "historical187WorklistIntersection": 147,
           "remainingSelected21Pairs": 53, "remainingOutsideSelected21Pairs": 147,
           "remainingPerScope": dict(collections.Counter(scope for scope, _ in remaining)),
           "TH24AndHH11WholePairHoldsRemain": True,
           "HEOriginalOverlayAddedPairs": 6, "HEAddedDistinctGoals": 3, "HEAdditionsIntroducedByReviewed40": 0,
           "HEWholeRoutineDepthAndAnimalComparisonHoldPreserved": True,
           "HH22DrugNervousSystemDoesNotBindSpecificSenseOrgan": True,
           "HH29GeneralHealthDoesNotBindSpecificCirculationPrevention": True,
           "fiveActualBookModelsVerified": model_checks,
           "all451CanonicalWholeGoalsOutside21Exact": True, "all472RequiresContainsExact": True,
           "protectedStrictCounts": {key: len(row["strictGoalIds"]) for key, row in strict_subjects.items()},
           "protectedBio74WholeCanonicalAndFullCataloguePagesExact": True,
           "protectedBio74SourceAtlasPagesChanged": 33, "numberingAndLinkNumbersOnly": 31,
           "realProtectedSourceStageCourseContextChanges": 2,
           "realProtectedChanges": real_page_changes,
           "allAtlasChangedPages": 239, "omittedCurrentGoals": 8,
           "materialIntegrationProblems": [
               "Original 390 source-atlas contract fails at 382 in both existing native attempts; reduced diagnostic success is not the original gate.",
               "200 baseline Goal/View pairs remain lost, including 53 selected-goal pairs and 147 historical outside pairs.",
               "Two protected full Atlas pages really lose DE-NW/SekI/G9 applicability; protection is exact for canonical/full-catalogue content, not all source context.",
               "Six HE target additions from the original overlay are partial clause projections with unapproved whole routine depth, including no inferred animal comparison.",
               "Eight omitted goals have historical baseline routes; old HE synthetic Q2.3.2/.3/.11-.16 labels do not become official bullets. Related primary pointers do not clear all claimed routines."],
           "unexpectedTechnicalInconsistencies": [], "activeWrites": False, "parentFilesChanged": False,
           "globalChecks": False, "pdfBuilds": False, "humanApproval": False, "humanTrial": False,
           "integrationApproved": False, "newStrictCompletions": 0, "strictNetGain": 0,
           "actualReadInputBindings": [{"path": path, "sha256": sha} for path, sha in sorted(bindings.items())]}
own_write("independent-technical-audit.actual.result.json", summary)
print(json.dumps({"status": "TECHNICAL_ARTEFACTS_CONSISTENT_INTEGRATION_HOLD", "guardInputs": input_count,
                  "restored": 40, "remaining": 200, "protectedPageChanges": 33,
                  "numberingOnly": 31, "actualContextLosses": 2, "omitted": 8,
                  "newNativeRun": False, "newScienceReview": False, "strictNetGain": 0}))
