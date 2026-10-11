"""Materialize a reviewable common candidate; never write active inputs."""
from pathlib import Path
import copy
import datetime
import hashlib
import json

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[6]
Q = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10"
CAN = "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json"
REG = "curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json"
BB = Q / "wirtschaft-BB-LK-three-market-facets-eight-cases-local-practice-AUTHOR-INERT-v1"
BBFIX = Q / "wirtschaft-BB8820-price-interval-direction-only-ADDENDUM-AUTHOR-INERT-v2"
A = Q / "wirtschaft-7c121-b84-practice-prerequisite-scope-INERT-author-round-a-v1"
DD = Q / "wirtschaft-dd38-543b-f08-036ea-explicit-existing-role-retention-ADDENDUM-INERT-round-b-v1"
EU = Q / "wirtschaft-6482-5aaf-79d-source-scope-f6bc-0b3d-followers-AUTHOR-INERT-round-b-v1"
EUFIX = Q / "wirtschaft-6482-bounded-grammar-and79d-demand-ADDENDUM-INERT-round-b-v1"
inputs = {}
field_index = []
asset_deletions_rejected = []

def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()

def read(path):
    path = Path(path)
    raw = path.read_bytes()
    inputs[str(path.relative_to(ROOT))] = {"sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}
    return json.loads(raw)

def write(name, value):
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")

def copy_exact(path, name):
    path = Path(path)
    raw = path.read_bytes()
    inputs[str(path.relative_to(ROOT))] = {"sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}
    target = OUT / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(raw)

active = read(ROOT / CAN)
candidate = copy.deepcopy(active)
active_by_id = {goal["id"]: goal for goal in active["goals"]}
by_id = {goal["id"]: goal for goal in candidate["goals"]}

def apply_goal(goal, source, only_fields=None):
    """Apply actual changed fields against the active679 baseline, not a whole landscape."""
    goal_id = goal["id"]
    if goal_id not in by_id:
        new = copy.deepcopy(goal)
        candidate["goals"].append(new)
        by_id[goal_id] = new
        field_index.append({"goalId": goal_id, "field": "$newWholeGoal", "source": source,
                            "afterDigest": digest(new), "status": "INERT_author_candidate"})
        return
    old = active_by_id[goal_id]
    dest = by_id[goal_id]
    for field in only_fields or goal.keys():
        if field == "id" or field not in goal:
            continue
        value = goal[field]
        if field == "resourceLinks":
            if value != old.get(field):
                asset_deletions_rejected.append({"goalId": goal_id, "source": source,
                                                 "keptActualCurrentValueDigest": digest(old.get(field))})
            continue
        if value == old.get(field):
            continue
        previous = copy.deepcopy(dest.get(field))
        dest[field] = copy.deepcopy(value)
        field_index.append({"goalId": goal_id, "field": field, "source": source,
                            "activeBeforeDigest": digest(old.get(field)), "compositionBeforeDigest": digest(previous),
                            "afterDigest": digest(value), "status": "INERT_author_candidate"})

bb_whole = read(BB / "canonical-candidate/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json")
for goal in bb_whole["goals"]:
    if goal["id"] not in active_by_id or goal != active_by_id[goal["id"]]:
        apply_goal(goal, str((BB / "canonical-candidate/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json").relative_to(ROOT)))

root7 = Q / "wirtschaft-final56-seven-bounded-description-remedies-WHOLE-INERT-root-author-v1/seven-whole-proposed-goals.INERT.json"
for goal in read(root7)["goals"]:
    apply_goal(goal, str(root7.relative_to(ROOT)), ["description", "descriptionEn"])

for goal in read(A / "seven-whole-proposed-goals.INERT.json")["goals"]:
    apply_goal(goal, str((A / "seven-whole-proposed-goals.INERT.json").relative_to(ROOT)))
apply_goal(read(A / "072-whole-only-native-derived-applicability.INERT-follower-candidate.json"),
           str((A / "072-whole-only-native-derived-applicability.INERT-follower-candidate.json").relative_to(ROOT)))

for goal in read(DD / "candidates/six-whole-content-successor-goals.INERT.json"):
    apply_goal(goal, str((DD / "candidates/six-whole-content-successor-goals.INERT.json").relative_to(ROOT)))
for name in ["f08", "036ea"]:
    path = DD / f"candidates/{name}.whole-practice.retained-role.INERT.json"
    apply_goal(read(path), str(path.relative_to(ROOT)))

for goal in read(EU / "candidates/three-whole-content-goals.scope-candidate.INERT.json"):
    apply_goal(goal, str((EU / "candidates/three-whole-content-goals.scope-candidate.INERT.json").relative_to(ROOT)))
for name in ["f6bc", "0b3d"]:
    path = EU / f"candidates/{name}.whole-practice.candidate.INERT.json"
    apply_goal(read(path), str(path.relative_to(ROOT)))
# The sole foreign parent change is the explicit new budget child. Do not import
# any unrelated whole-landscape snapshot fields.
eu_landscape = read(EU / "candidates/landscape.author-only.INERT.json")
budget_id = "5aaf5abf-5e70-57c6-b030-1d08a35d17b8"
for goal in eu_landscape["goals"]:
    if goal["id"] in active_by_id and goal.get("contains") != active_by_id[goal["id"]].get("contains"):
        added = set(goal.get("contains", [])) - set(active_by_id[goal["id"]].get("contains", []))
        removed = set(active_by_id[goal["id"]].get("contains", [])) - set(goal.get("contains", []))
        assert added == {budget_id} and not removed
        apply_goal(goal, str((EU / "candidates/landscape.author-only.INERT.json").relative_to(ROOT)), ["contains"])

# Actual independently qualified EU whole-practice owned extension: isolate the
# new legal atom from broad ancestor source mappings and record authored scope
# explicitly. These six countries are the preserved actual f6bc target universe,
# not a new normative-law source claim.
budget_goal = by_id[budget_id]
budget_goal.setdefault("extendedData", {})["applicabilityMappingInheritance"] = "boundary"
budget_goal["extendedData"]["applicabilityOverrides"] = {"jurisdiction": list(budget_goal["applicability"]["jurisdiction"])}
field_index.append({"goalId": budget_id, "field": "extendedData.applicabilityMappingInheritance/applicabilityOverrides",
                    "source": "Root independently qualified EU-material2+23-owned-role-retention; whole6 f6bc country targets",
                    "sourceNormativeLawMandate": False, "afterDigest": digest(budget_goal["extendedData"]), "status": "explicit_owned_didactic_extension"})

assert all(by_id[goal_id].get("resourceLinks") == goal.get("resourceLinks") for goal_id, goal in active_by_id.items())
assert len(by_id) == len(candidate["goals"])
write("candidate-core/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json", candidate)
write("actual-fieldwise-goal-composition-index.INERT.json", field_index)
write("actual-existing679-resourceLinks-exact-and-rejected-draft-deletions.READONLY.json", {
    "all679ExistingResourceLinksExact": True, "rejectedEarlierDraftAssetChanges": asset_deletions_rejected,
    "newImages": 0, "newOrRetainedImageFitnessApproval": False})

# Exact fourteen reviewed predecessor Source/Mapping routes, with BB101
# successors from the sealed BB packet. Never omit BW/HE/NI lower or HE legacy
# routes: they carry the actual new INFO/PUB partial source facets.
source_files = []
v3_index_path = Q / "wirtschaft-1826-source-scope-and-native34views-AUTHOR-INERT-v3/author-file-index.INERT.json"
v3_index = read(v3_index_path)
for active_path, entry in sorted(v3_index["files"].items()):
    source = BB / "native-capsule" / active_path
    if not source.exists():
        source = ROOT / entry["candidate"]
    copy_exact(source, "candidate-data/" + active_path)
    source_files.append({"activePath": active_path, "candidatePath": "candidate-data/" + active_path,
                         "predecessorFileIndex": str(v3_index_path.relative_to(ROOT)),
                         "sameCandidateBytesAsSealedBBOrV3Input": True,
                         "fullNewSourceApproval": False})
assert len(source_files) == 14
write("actual-four-source-ten-mapping-copies-not-global-approval.INERT.json", source_files)

current_roles = read(OUT / "actual-current35-native-target-prerequisite-only-sets.READONLY.json")
baseline_targets = {item["name"]: set(item["targetGoalIds"]) for item in current_roles}
views = {}
view_index = []
for path in sorted((BB / "view-candidates").glob("*.view.json")):
    views[path.name] = read(path)
    active_path = ROOT / "curricula/DE/Gymnasium/composition-views/wirtschaft" / path.name
    old = read(active_path)
    view_index.append({"name": path.name, "source": str(path.relative_to(ROOT)), "activeBeforeDigest": digest(old),
                       "afterBBDigest": digest(views[path.name]), "newApprovalClaim": False})

def key(node):
    return node.get("id") or node.get("goalId") or node.get("canonicalRootId") or node.get("rootGoalId")

def merge_view_delta(base, proposed, dest):
    """Apply a whole authored view's delta by stable node key; keep other additions."""
    if isinstance(base, dict) and isinstance(proposed, dict) and isinstance(dest, dict):
        for k, value in proposed.items():
            if value == base.get(k):
                continue
            if k in base and k in dest and isinstance(value, (dict, list)):
                dest[k] = merge_view_delta(base[k], value, dest[k])
            else:
                dest[k] = copy.deepcopy(value)
        return dest
    if isinstance(base, list) and isinstance(proposed, list) and isinstance(dest, list) and all(isinstance(n, dict) and key(n) for n in base + proposed + dest):
        bm = {key(n): n for n in base}; dm = {key(n): n for n in dest}; pm = {key(n): n for n in proposed}
        result = [n for n in dest if key(n) not in bm or key(n) in pm]
        for node in proposed:
            k = key(node)
            if k not in bm:
                if k not in dm:
                    result.append(copy.deepcopy(node))
            elif node != bm[k]:
                updated = merge_view_delta(bm[k], node, copy.deepcopy(dm.get(k, bm[k])))
                result = [updated if key(n) == k else n for n in result]
        return result
    return copy.deepcopy(proposed)

for country in ["hb", "th"]:
    for course in ["gk", "lk"]:
        name = f"de-{country}-gym-economics-{course}.view.json"
        path = A / f"views/{country}-{course}-whole-view.INERT.json"
        old = read(ROOT / "curricula/DE/Gymnasium/composition-views/wirtschaft" / name)
        proposed = read(path)
        views[name] = merge_view_delta(old, proposed, views[name])
        view_index.append({"name": name, "source": str(path.relative_to(ROOT)), "method": "stable-node-key whole-view delta over current baseline, preserving BB additions"})

role_adjustments = []
def add_fragment(name, structure, source):
    structure = copy.deepcopy(structure)
    existing = {}
    def collect(nodes):
        for node in nodes:
            if node.get("kind") == "goalEntry":
                existing.setdefault(node["goalId"], []).append(node)
            collect(node.get("children", []))
    collect(views[name]["rootNodes"])
    additions = []
    for child in structure.get("children", []):
        goal_id = child.get("goalId")
        if child.get("projectionRole") == "prerequisiteOnly" and goal_id in baseline_targets[name]:
            child["projectionRole"] = "target"
            role_adjustments.append({"view": name, "goalId": goal_id, "oldValidTargetRetained": True,
                                     "reason": "A new direct prerequisite-only entry must not override a prior valid target through specificity.", "source": source})
        if goal_id in existing:
            # Reuse the sole authored placement; never append a second visible
            # reference to an already present goal. Existing target survives.
            for current_entry in existing[goal_id]:
                old_role = current_entry.get("projectionRole", "target")
                effective = "target" if old_role == "target" or child["projectionRole"] == "target" else "prerequisiteOnly"
                current_entry["projectionRole"] = effective
            view_index.append({"name": name, "goalId": goal_id, "source": source,
                               "method": "reuse existing authored goalEntry placement; target wins without downgrading a prior target"})
        elif goal_id in baseline_targets[name]:
            view_index.append({"name": name, "goalId": goal_id, "source": source,
                               "method": "retain existing canonical subtree target placement without duplicate direct entry"})
        else:
            additions.append(child)
    structure["children"] = additions
    if additions:
        views[name]["rootNodes"].append(structure)
    view_index.append({"name": name, "source": source, "additiveStructureId": structure["id"],
                       "actuallyAddedGoalIDs": [n["goalId"] for n in additions], "newNormativeMandateClaim": False})

dd_path = DD / "candidates/seventeen-bounded-additive-role-fragments.INERT.json"
for fragment in read(dd_path)["fragments"]:
    scope = fragment["scope"]
    name = f"de-{scope['jurisdiction'][3:].lower()}-gym-economics-{scope['courseProfile'].lower()}.view.json"
    for structure in fragment["rootNodes"]:
        add_fragment(name, structure, str(dd_path.relative_to(ROOT)))

eu_scope_path = EU / "source-notes/six-explicit-authored-whole-Practice-extension-scopes.INERT.json"
for scope in read(eu_scope_path)["extensionScopes"]:
    country = scope["jurisdiction"][3:].lower()
    course = scope["courseProfileCompatibility"].lower()
    name = f"de-{country}-gym-economics-{course}.view.json"
    structure = {"kind": "structure", "id": f"common-eu-retained-practice-{country}-{course}",
                 "label": "Europäische Integration: erhaltene Übungsziele", "children": []}
    for field in ["practiceGoalEntries", "contentGoalEntries", "prerequisiteOnlyGoalEntries"]:
        for entry in scope[field]:
            # Goal entries themselves are actual authored role choices. Sidecar
            # reasoning belongs in the field index, not new runtime properties.
            structure["children"].append({"kind": "goalEntry", "goalId": entry["goalId"], "projectionRole": entry["projectionRole"]})
    add_fragment(name, structure, str(eu_scope_path.relative_to(ROOT)))

for name, view in views.items():
    write("candidate-views/" + name, view)
assert len(views) == 35
write("actual35-fieldwise-view-composition-and-old-valid-target-protection.INERT.json", {
    "wholeViewCount": len(views), "fieldIndex": view_index, "priorTargetSpecificityProtections": role_adjustments,
    "oldWholePracticeTargetRetentionMustBeNativeChecked": True, "sourceCountryCourseApproval": False})

# Retain exact authored P profiles without refreshing any native fingerprints yet.
for source, target in [
    (BBFIX / "positive-v2-four-goal-authoring-spec.AUTHOR-INERT.json", "positive-inputs/BB4.unbound-spec.INERT.json"),
    (BBFIX / "eight-whole-DEEN-casebriefs-and-complete-model-answers.AUTHOR-INERT.json", "positive-inputs/BB8.whole-cases.INERT.json"),
    (Q / "wirtschaft-1826-four-observable-strings-no-example-quota-AUTHOR-INERT-v2/six-real-case-positive-authoring-spec.only-four-observable-strings.INERT.json", "positive-inputs/market3.unbound-spec.INERT.json"),
    (A / "three-whole-P-current-scope-fingerprints.INERT-author-records.jsonl", "positive-inputs/A3.pre-common-bindings.INERT.jsonl"),
    (DD / "candidates/positive-profiles.native-bound.INERT.jsonl", "positive-inputs/DD2.pre-common-bindings.INERT.jsonl"),
    (EU / "candidates/positive-profiles.native-bound.INERT.jsonl", "positive-inputs/EU3.pre-common-bindings.INERT.jsonl"),
    (EUFIX / "candidates/positive.native-bound.INERT.jsonl", "positive-inputs/budget1.grammar-addendum.pre-common-bindings.INERT.jsonl"),
]:
    if source.exists():
        copy_exact(source, target)

registry = read(ROOT / REG)
subj = next(s for s in registry["subjects"] if s["subject"] == "wirtschaftswissenschaften")
active_configs = {}
for field in ["semanticKindLedgerPath", "semanticAtomicityConfigPath", "memoryReviewConfigPath"]:
    active_configs[field] = read(ROOT / subj[field])
    copy_exact(ROOT / subj[field], "retained-current-configs/" + Path(subj[field]).name)
for field, file_name in [("semanticAtomicityConfigPath", "atomicity336.current-raw.EXACT.jsonl"), ("memoryReviewConfigPath", "memory336.current-raw.EXACT.jsonl")]:
    copy_exact(ROOT / active_configs[field]["reviewPath"], "retained-current-ledgers/" + file_name)
copy_exact(ROOT / active_configs["memoryReviewConfigPath"]["cardReviewPath"], "retained-current-ledgers/current-card-reviews.EXACT.jsonl")

semantic_fields = ["shortKey", "title", "titleEn", "description", "descriptionEn", "dimensionTags", "nodeKind"]
def ordinary(goal):
    tags = goal.get("tags", [])
    return not goal.get("contains") and not any(t in tags for t in ["Practice", "Assessment", "Motivation", "Orientation", "memorization"]) and goal.get("nodeKind") != "memory" and not any(t.startswith("srs-deck:") for t in tags) and not goal.get("examData")
ordinary_ids = {g["id"] for g in candidate["goals"] if ordinary(g)}
old_ordinary_ids = {g["id"] for g in active["goals"] if ordinary(g)}
changed_old = {goal_id for goal_id in old_ordinary_ids if any(by_id[goal_id].get(f) != active_by_id[goal_id].get(f) for f in semantic_fields)}
new_ids = ordinary_ids - old_ordinary_ids
raw_reuse = old_ordinary_ids - changed_old
for file_name, output in [("atomicity336.current-raw.EXACT.jsonl", "atomicity324.raw-unchanged.EXACT.jsonl"), ("memory336.current-raw.EXACT.jsonl", "memory324.raw-unchanged.EXACT.jsonl")]:
    raw = (OUT / "retained-current-ledgers" / file_name).read_bytes().splitlines(keepends=True)
    kept = [line for line in raw if line.strip() and json.loads(line)["goalId"] in raw_reuse]
    assert len(kept) == len(raw_reuse)
    (OUT / "retained-current-ledgers" / output).write_bytes(b"".join(kept))
write("actual-SEM-A-M-P-common-native-binding-worklist.INERT.json", {
    "currentWholeGoals": len(active["goals"]), "candidateWholeGoals": len(candidate["goals"]),
    "currentOrdinary": len(old_ordinary_ids), "candidateOrdinary": len(ordinary_ids),
    "oldChangedSemanticIDs": sorted(changed_old), "newOrdinaryIDs": sorted(new_ids),
    "nativeAMRawRecordsPreservedExactCount": len(raw_reuse), "nativeAMRawIDs": sorted(raw_reuse),
    "actualChangedOrNewAMCount": len(changed_old | new_ids),
    "nativeFingerprintsMaterialized": False,
    "semanticKindLedgerBaselinePath": subj["semanticKindLedgerPath"],
    "semanticKindNewDecisionsRequireActualIndependentQualification": True,
    "changedAMStatusesWillComeOnlyFromActualIndependentReceipts": True,
    "BBAndEUUnreviewedPracticesNotPromotedToReleased": True,
    "P685HistoricalRecordsRemainHistory": True,
    "all43CurrentPositiveConfigPaths": subj["positiveEvidenceConfigPaths"],
    "newDReviewsOrVApprovals": False})

write("actual-common-fieldwise-input-manifest.before.READONLY.json", inputs)
write("actual-active-versus-common-candidate-apply-list.INERT.json", {
    "canonical": {"activePath": CAN, "candidatePath": "candidate-core/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json"},
    "sourcesAndMappings": source_files,
    "views": [{"activePath": "curricula/DE/Gymnasium/composition-views/wirtschaft/" + name, "candidatePath": "candidate-views/" + name} for name in sorted(views)],
    "registry": {"activePath": REG, "activeRegistryUnchanged": True, "candidateRegistryRequiresFinalQualifiedSEM-A-M-PPaths": True},
    "source21AndOtherBSourceRowsRetainCurrentPartialContractsPendingBoundedIndependentClosure": True,
    "temporaryExecutionCapsulesInsideCurricula": False, "activeWrites": 0})
print(json.dumps({"out": str(OUT.relative_to(ROOT)), "wholeGoals": len(candidate["goals"]), "ordinary": len(ordinary_ids),
                  "oldChanged": len(changed_old), "newOrdinary": len(new_ids), "rawAMReuse": len(raw_reuse), "views": len(views),
                  "sourceAndMappingWholeCopies": len(source_files), "fieldChanges": len(field_index), "activeWrites": 0}))
