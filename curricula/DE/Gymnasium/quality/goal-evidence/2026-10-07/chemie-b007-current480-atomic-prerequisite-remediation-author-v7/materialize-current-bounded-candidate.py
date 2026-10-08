#!/usr/bin/env python3
"""Prepare an inert B007 candidate; write only within this author directory."""

from copy import deepcopy
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
OLD = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b007-seven-native-source-preparation-author-v3"
CANON = ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json"
CENTRAL = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-ecology20b-twelve-reviewed-active-integration-root-v1/active-after-twelve-central.actual.json"


def read(path):
    return json.loads(path.read_text())


def write(name, value):
    target = HERE / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def bind(path):
    raw = path.read_bytes()
    return {"path": str(path.relative_to(ROOT)), "sha256": sha256(raw).hexdigest(), "bytes": len(raw)}


current = read(CANON)
assert len(current["goals"]) == 480
candidate = deepcopy(current)
goals = {goal["id"]: goal for goal in candidate["goals"]}
prior = {goal["id"]: goal for goal in read(OLD / "qa-artifacts/DE_DEU_S_GYM_CANONICAL_CHEMIE.native-author-candidate.json")["goals"]}
binder = read(OLD / "seven-routine-uuid-and-fourteen-case-two-card-binders.author-candidate.json")
new_ids = [value for key, value in binder["routineGoalIds"].items() if key != "label"]
assert not set(new_ids) & set(goals)
for goal_id in new_ids:
    copied = deepcopy(prior[goal_id])
    copied["extendedData"]["provenance"]["authorCandidatePackage"] = str(HERE.relative_to(ROOT))
    candidate["goals"].append(copied)
    goals[goal_id] = copied

split_parents = ["7be6f951-a614-52dc-94d3-2ce0d33765ff", "53fd1bfd-facb-54ae-b2dc-f667ed1414fc"]
for goal_id in split_parents:
    for field in ["contains", "requires", "weight", "type"]:
        goals[goal_id][field] = deepcopy(prior[goal_id][field])

handling = binder["routineGoalIds"]["handling"]
preparation = binder["routineGoalIds"]["preparation"]
solutions_parent = split_parents[1]
particle_solution = "5338b54c-68bc-5892-907c-e025351ffde6"
route_proposals = [
    ("ebaae4f5-cc13-5493-98b1-10e1abeb638f", split_parents[0], handling,
     "Risk minimisation extends substance-specific precautions; disposal selection is a different performance, not a universal prerequisite."),
    ("d2ccd1d5-56f7-583f-9724-e97441367f91", solutions_parent, preparation,
     "The existing indicator school experiment uses prepared homogeneous solutions; quantitative saturation and fractions are not entry requirements."),
    ("018bec90-445f-4a88-b8bc-228f8335dee6", solutions_parent, preparation,
     "The existing conductivity comparison needs suitable solution handling, not all independent saturation/fraction routines."),
    ("f1ed86f0-534d-57d7-8952-a004a331cc54", solutions_parent, preparation,
     "The held concentration/preparation/pH goal explicitly includes preparing solutions; its own semantic split remains open outside B007."),
    ("5abc5961-6368-52bb-88b9-6a846c3c37a8", solutions_parent, particle_solution,
     "Salt dissolution energy requires particle-level dissolution reasoning. Existing ion/interaction prerequisites remain; no laboratory manufacture or fraction mastery is inferred."),
    (particle_solution, solutions_parent, None,
     "The goal itself teaches particle-level dissolution; its existing states/particle-model prerequisite is retained. Quantitative saturation and fractions are separate routines."),
    ("10ce2814-8796-5633-9bed-f6990d039b91", solutions_parent, None,
     "The shared particle-model cluster contains states, dissolution, diffusion and level changes. A universal laboratory/saturation/fraction requirement is unjustified; the existing general states prerequisite remains."),
]
intents = []
for goal_id, old_id, new_id, reason in route_proposals:
    before = deepcopy(goals[goal_id]["requires"])
    assert before.count(old_id) == 1
    after = []
    for entry in before:
        replacement = new_id if entry == old_id else entry
        if replacement is not None and replacement not in after:
            after.append(replacement)
    goals[goal_id]["requires"] = after
    intents.append({"goalId": goal_id, "title": goals[goal_id]["title"], "beforeRequires": before,
                    "candidateRequires": after, "scientificReason": reason,
                    "reviewStatus": "author_candidate_requires_independent_didactic_recheck"})

assert len(candidate["goals"]) == 486
assert goals[binder["routineGoalIds"]["label"]] == next(g for g in current["goals"] if g["id"] == binder["routineGoalIds"]["label"])
assert not any(parent in goal.get("requires", []) for goal in candidate["goals"] for parent in split_parents)
selected = {item["goalId"] for item in intents} | set(split_parents)
original_goals = {goal["id"]: goal for goal in current["goals"]}
assert all(goals[goal_id] == goal for goal_id, goal in original_goals.items() if goal_id not in selected)
central = next(row for row in read(CENTRAL)["subjects"] if row["subject"] == "chemie")
assert central["denominator"] == 378 and central["strictComplete"] == 173
write("candidate/canonical.current480-seven-atomic-route-proposals.json", candidate)
write("seven-atomic-prerequisite-proposals.author.json", intents)
write("current-inputs-and-preservation.author.json", {
    "schemaVersion": 1, "createdAtUTC": datetime.now(timezone.utc).isoformat(),
    "role": "inert author remediation; no independent approval", "activeWrites": False,
    "baseline": bind(CANON), "centralCheckpoint": bind(CENTRAL),
    "historicalAuthorFreeze": bind(OLD / "native-source-preparation-author-v3.final.freeze.json"),
    "historicalBinder": bind(OLD / "seven-routine-uuid-and-fourteen-case-two-card-binders.author-candidate.json"),
    "baselineWholeGoals": 480, "candidateWholeGoals": 486, "baselineCurricularAtomic": 378,
    "candidateCurricularAtomicIntent": 382, "currentStrictGoalIds": central["strictCompleteGoalIds"],
    "changedExistingWholeGoalIds": sorted(selected), "sixPriorCandidateGoalIds": new_ids,
    "unchangedExistingWholeGoalCount": 471, "currentReviewedLabelUnchanged": True,
    "sourceNational403OriginalDutiesCleared": 0, "nativeIndependentApproval": False,
    "strictCompletionsAdded": 0, "restoredActiveBindings": 0, "humanApproval": False, "humanTrial": False,
})

config_base = read(OLD / "qa-artifacts/baseline-native-book.config.json")
config_base["bookId"] = "chemie-b007-current480-baseline-review-universe"
config_base["title"] = "B007 aktuelle atomare Voraussetzungskandidaten"
config_base["compositionViewPath"] = str((HERE / "candidate/all-atoms.review-only.view.json").relative_to(ROOT))
config_base["outputPath"] = str((HERE / "candidate/baseline-native-book-model.json").relative_to(ROOT))
write("candidate/baseline-native-book.config.json", config_base)
config_candidate = deepcopy(config_base)
config_candidate["bookId"] = "chemie-b007-current486-candidate-review-universe"
config_candidate["landscapePath"] = str((HERE / "candidate/canonical.current480-seven-atomic-route-proposals.json").relative_to(ROOT))
config_candidate["semanticKindLedgerPath"] = str((HERE / "candidate/semantic-kinds.current486.inert.json").relative_to(ROOT))
config_candidate["outputPath"] = str((HERE / "candidate/candidate-native-book-model.json").relative_to(ROOT))
write("candidate/candidate-native-book.config.json", config_candidate)
view = read(OLD / "qa-artifacts/all-candidate-atoms.review-only.view.json")
view["$schema"] = "https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json"
view["viewId"] = "chemie-b007-current480-atomic-prerequisite-author-review-only"
write("candidate/all-atoms.review-only.view.json", view)
he_view = read(OLD / "qa-artifacts/he8-seven-routines.prospective-source.view.json")
he_view["$schema"] = "https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json"
he_view["viewId"] = "chemie-b007-current480-he8-author-review-only"
write("candidate/he8-seven-routines.prospective-source.view.json", he_view)
print(json.dumps({"candidateWholeGoals": 486, "unchangedExistingWholeGoals": 471,
                  "sevenRequiresProposals": len(intents), "strictGain": 0}))
