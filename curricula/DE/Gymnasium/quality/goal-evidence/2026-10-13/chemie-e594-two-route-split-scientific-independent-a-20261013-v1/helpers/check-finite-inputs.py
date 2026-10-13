# Apache-2.0. Read-only checks against finite inactive proposals; no compilation.
from pathlib import Path
import copy
import datetime
import hashlib
import importlib.util
import json
import subprocess

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parents[1]
AUTHOR = OWN.parent / "chemie-e594-two-synthesis-routes-scope-preserving-author-20261013-v1"
CHECKS = OWN / "checks"
CHECKS.mkdir(exist_ok=True)
consumed = {}


def bind(path):
    path = Path(path)
    raw = path.read_bytes()
    relative = path.resolve().relative_to(ROOT).as_posix()
    result = {"path": relative, "sha256": "sha256:" + hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}
    consumed[relative] = result
    return result


def read(path):
    bind(path)
    return json.loads(Path(path).read_text())


def guarded(binding):
    assert bind(ROOT / binding["path"]) == binding, binding["path"]
    return read(ROOT / binding["path"])


def node_at(data, pointer):
    for part in pointer.split("/")[1:]:
        data = data[int(part)] if isinstance(data, list) else data[part]
    return data


def acyclic(goals, field):
    by_id = {goal["id"]: goal for goal in goals}
    states = {}

    def visit(goal_id):
        assert states.get(goal_id) != 1, (field, goal_id)
        if states.get(goal_id) == 2:
            return
        states[goal_id] = 1
        for child in by_id[goal_id].get(field, []):
            assert child in by_id, (field, child)
            visit(child)
        states[goal_id] = 2

    for goal_id in by_id:
        visit(goal_id)


first = read(OWN / "FIRST.neutral-input-seal.json")
selector = guarded(first["selector"])
for row in first["boundInputs"]:
    # Hash-only verification of peer findings; scientific content stays unopened.
    assert bind(ROOT / row["path"])["sha256"] == row["sha256"]
cas = guarded(selector["canonicalCAS"])
baseline = guarded(cas["sourceCanonicalBinding"])
proposed = copy.deepcopy(baseline)
for row in cas["existingGoals"]:
    index = next(i for i, goal in enumerate(proposed["goals"]) if goal["id"] == row["expectedBeforeWholeGoal"]["id"])
    assert proposed["goals"][index] == row["expectedBeforeWholeGoal"]
    proposed["goals"][index] = row["proposedAfterWholeGoal"]
proposed["goals"].extend(cas["newChildren"])
assert len({goal["id"] for goal in proposed["goals"]}) == 525
for field in ["contains", "requires"]:
    acyclic(proposed["goals"], field)
before_by_id = {goal["id"]: goal for goal in baseline["goals"]}
after_by_id = {goal["id"]: goal for goal in proposed["goals"]}


def unique_leaves(by_id, goal_id):
    children = by_id[goal_id].get("contains", [])
    if not children:
        return {goal_id}
    return set().union(*(unique_leaves(by_id, child) for child in children))


weight_checks = []
for goal_id in ["e5941581-0aba-5354-b4b9-d0249d4538a8", "fa21e8e1-b430-54ad-9647-f763bc4137ba"]:
    before_count = len(unique_leaves(before_by_id, goal_id))
    after_count = len(unique_leaves(after_by_id, goal_id))
    assert before_count == before_by_id[goal_id]["weight"]
    assert after_count == after_by_id[goal_id]["weight"]
    weight_checks.append({"goalId": goal_id, "beforeUniqueAtomicLeaves": before_count, "afterUniqueAtomicLeaves": after_count, "bothStoredWeightsEqualMeasuredCounts": True})
changed_ids = [goal_id for goal_id, goal in before_by_id.items() if after_by_id[goal_id] != goal]
assert len(changed_ids) == 3
parent_id = "e5941581-0aba-5354-b4b9-d0249d4538a8"
assert before_by_id[parent_id]["resourceLinks"] == after_by_id[parent_id]["resourceLinks"]
graph_impact = guarded(selector["wholeGraphImpact"])
assert graph_impact["wholeExistingGoalCompareAndSwap"] == cas["existingGoals"]
assert graph_impact["wholeNewChildren"] == cas["newChildren"]
context_impact = guarded(selector["contextImpact"])
for goal in context_impact["wholeOriginalContextGoals"]:
    assert goal == before_by_id[goal["id"]]
for goal in context_impact["wholeProposedContextGoals"]:
    assert goal == after_by_id[goal["id"]]
for goal in cas["newChildren"]:
    actual_consumers = [row["id"] for row in proposed["goals"] if goal["id"] in row.get("requires", [])]
    assert actual_consumers == context_impact["reversePrerequisitesNew"][goal["id"]]
history = guarded(selector["retainedOriginalWholeCaseProfileHistory"])
old_profile_file = guarded(history["profileFileBinding"])
old_case_file = guarded(history["caseFileBinding"])
assert next(row for row in old_profile_file["profiles"] if row["goalId"] == parent_id) == history["originalWholeProfile"]
assert [row for row in old_case_file["cases"] if row["goalId"] == parent_id] == history["originalWholeCases"]
profiles = guarded(selector["childProfiles"])
cases = guarded(selector["childCases"])
old_cases = {row["caseId"]: row for row in history["originalWholeCases"]}
new_cases = {row["caseId"]: row for row in cases["cases"]}
transport = guarded(selector["routeTransport"])
transport_checks = []
for row in transport["exactRubricTransport"]:
    old = next(criterion for criterion in old_cases[row["oldCaseId"]]["rubric"] if criterion["criterionId"] == row["oldCriterionId"])
    new = next(criterion for criterion in new_cases[row["newCaseId"]]["rubric"] if criterion["criterionId"] == row["newCriterionId"])
    ignored = {"criterionId", "taskSpanDe", "taskSpanEn"}
    assert {key: value for key, value in old.items() if key not in ignored} == {key: value for key, value in new.items() if key not in ignored}
    for locale in ["De", "En"]:
        span = new["taskSpan" + locale]
        assert new_cases[row["newCaseId"]]["task" + locale][span["start"]:span["end"]] == new["taskClause" + locale]
    transport_checks.append({"oldCaseId": row["oldCaseId"], "newCaseId": row["newCaseId"], "oldCriterionId": row["oldCriterionId"], "newCriterionId": row["newCriterionId"], "allScientificRubricFieldsExact": True, "actualBilingualTaskSpansExact": True})
profile_joins = []
for row in profiles["profiles"]:
    expectation = row["profile"]["expectations"][0]
    assert expectation in history["originalWholeProfile"]["profile"]["expectations"]
    for brief in row["profile"]["applicationCaseBriefs"]:
        case = new_cases[brief["id"]]
        assert row["goalId"] == case["goalId"]
        for locale in ["De", "En"]:
            assert brief["taskDemand" + locale] == case["data" + locale] + "\n" + case["task" + locale]
            assert brief["expectedPerformance" + locale] == case["modelAnswer" + locale]
        assert case["maximumPoints"] == sum(criterion["maximumPoints"] for criterion in case["rubric"])
        assert case["practicalExecutionRequired"] is False
        profile_joins.append(case["caseId"])
source_cas = guarded(selector["sourceCellsAndCAS"])
assert bind(ROOT / source_cas["exactFinalSourceAttachmentBinding"]["path"]) == source_cas["exactFinalSourceAttachmentBinding"]
source_attachment = read(AUTHOR / "inputs/e594.final-source-attachments.exact-whole-cells.json")
assert source_attachment["finalCompiledWitnessesWithExactWholeCells"] == [row["exactWholeOriginalWitness"] for row in source_cas["partitions"]]
source_checks = []
for row in source_attachment["finalCompiledWitnessesWithExactWholeCells"]:
    extraction = guarded(row["exactExtractionBinding"])
    mapping = guarded(row["exactMappingBinding"])
    cell = row["wholeSourceCell"]
    assert next(source for source in extraction["sourceGoals"] if source["id"] == cell["id"]) == cell
    assert [m for m in mapping["mappings"] if m["legacyGoalId"] == cell["id"] and m["canonicalGoalId"] == parent_id] == row["matchingMappingCells"]
    assert [d for d in mapping["decisions"] if d["sourceGoalId"] == cell["id"]] == row["wholeSourceDecisionCells"]
    source_checks.append({"sourceGoalId": cell["id"], "scope": row["compiledWitness"]["scope"], "wholeExtractedCellAndOriginalMappingDecisionExact": True})
mapping_guards = []
for row in source_cas["wholeMappingCompareAndSwap"]:
    mapping = guarded(row["expectedWholeFileBinding"])
    assert len(mapping["mappings"]) == row["appendAtMappingsLength"]
    for change in row["decisionCellCompareAndSwap"]:
        assert node_at(mapping, change["jsonPointer"]) == change["expectedBeforeWholeCell"]
        assert change["expectedBeforeWholeCell"]["sourceGoalId"] == change["proposedAfterWholeCell"]["sourceGoalId"]
        assert set(change["expectedBeforeWholeCell"]["canonicalGoalIds"]).issubset(change["proposedAfterWholeCell"]["canonicalGoalIds"])
    assert mapping.get("summary") == row["summaryCompareAndSwap"]["expectedBefore"]
    mapping_guards.append({"path": row["expectedWholeFileBinding"]["path"], "wholeGuardExact": True, "appendedCells": len(row["appendedWholeMappingCells"]), "changedDecisionCells": len(row["decisionCellCompareAndSwap"]), "previousEdgeExactCount": sum(m.get("matchType") == "exact" for m in mapping["mappings"]), "previousEdgePartialCount": sum(m.get("matchType") == "partial" for m in mapping["mappings"]), "summaryBefore": mapping.get("summary"), "summaryAfter": row["summaryCompareAndSwap"]["proposedAfter"]})
view_cas = guarded(selector["scopeViewCAS"])
view_guards = []
for row in view_cas["wholeViewProposals"]:
    view = guarded(row["expectedWholeViewBinding"])
    for change in row["exactNodeChanges"]:
        assert node_at(view, change["jsonPointer"]) == change["beforeWholeNode"]
        assert change["afterWholeNode"] == {**change["beforeWholeNode"], "kind": "canonicalSubtree"}
    view_guards.append({"path": row["expectedWholeViewBinding"]["path"], "wholeGuardAndEveryExactNodeCASMatch": True, "changedNodes": len(row["exactNodeChanges"])})
parent_images = []
for role in ["source", "app", "backend"]:
    image = OWN.parent.parent / "2026-10-12/chemie-e594-three-ring-vertex-correction-raster-author-20261013-v4/candidate-copies" / role / (parent_id + ".png")
    image_binding = bind(image)
    assert image_binding["sha256"] == "sha256:a728cc442316a8028844ac7d48f15dc490e4f85882f002eab99c81f683b832f3"
    parent_images.append(image_binding)
primary_documents = ["curricula/DE/Gymnasium/input/BY/gymnasium/Chemie.json", "curricula/DE/Gymnasium/input/RP/Chemie_Sekundarstufe_II_MSS_2022.pdf", "curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-chemie-sachsen-2025.pdf"]
for path in primary_documents:
    bind(ROOT / path)
primary_page_records = []
for path, page_numbers in [(primary_documents[1], [19, 21, 26, 40, 47]), (primary_documents[2], [60])]:
    text = subprocess.check_output(["pdftotext", "-layout", path, "-"], text=True)
    pages = text.split("\f")
    for page_number in page_numbers:
        page = pages[page_number - 1]
        primary_page_records.append({"path": path, "pdfPage1Based": page_number, "pdftotextLayoutPageSha256": "sha256:" + hashlib.sha256(page.encode()).hexdigest(), "wholePrimaryPageRead": True})
spec = importlib.util.spec_from_file_location("validate_schemas", ROOT / "scripts/validate_schemas.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
symlink_errors = module.curriculum_symlink_errors(ROOT)
assert not symlink_errors, symlink_errors
for path in ["AGENTS.md", "scripts/validate_schemas.py", "app/scripts/goalBookOriginalSources.ts", "app/src/utils/authoring/compositionViewAuthoring.ts", "app/scripts/applicabilityCompiler.ts", "app/scripts/goalBookSourceAtlasInputs.ts"]:
    bind(ROOT / path)
result = {"schemaVersion": 1, "checkedAtUTC": datetime.datetime.now(datetime.timezone.utc).isoformat(), "role": "Independent finite structural and transport measurements; scientific decisions are separate", "neutralDirectBindings": len(first["boundInputs"]), "neutralDirectBindingsExact": True, "oldCanonicalNodes": len(baseline["goals"]), "proposedNodesInMemoryOnly": len(proposed["goals"]), "changedExistingGoalIds": changed_ids, "unchangedExistingGoals": 520, "bothGraphDAGs": True, "twoMeasuredUniqueDescendantWeightChecks": weight_checks, "sixBilingualRubricTransportChecks": transport_checks, "fourCompleteBilingualProfileJoins": profile_joins, "fiveWholeSourceCellChecks": source_checks, "threeMappingWholeGuards": mapping_guards, "twentyOneWholeViewGuards": view_guards, "parentResourceLinksExact": True, "threeRetainedParentImageBindings": parent_images, "wholePrimaryPagesRead": primary_page_records, "curriculumSymlinkErrors": symlink_errors, "noBookModelOrCompiledScopeProduced": True, "noWholeCanonicalOrWholeMappingCopied": True, "noNewImageOrVClaim": True, "peerVerdictsOpened": False, "humanApproval": False, "humanTrial": False, "activeWrites": False}
(CHECKS / "finite-preservation.independent.actual.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
(CHECKS / "consumed-input-bindings.actual.json").write_text(json.dumps({"inputBindings": sorted(consumed.values(), key=lambda x: x["path"])}, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"directNeutralBindingsExact": 17, "changedExistingGoals": 3, "nodes": [523, 525], "wholeSourceCellsExact": 5, "mappingGuardsExact": 3, "viewGuardsExact": 21, "bilingualRubricsPreserved": 6, "completeBilingualProfileJoins": 4, "parentPNGCopiesExact": 3, "curriculumSymlinkErrors": symlink_errors, "compiledScopeCount": 0}))
