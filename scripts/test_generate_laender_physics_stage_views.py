#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Source, scope and partial-order regressions over the real Physics views."""
import copy
import hashlib
import json
import unittest
from unittest.mock import patch

import generate_laender_physics_stage_views as authoring
from generate_physics_partial_orders import acquisition_placements, partial_order, course_seeds, contextual_targets

REVIEWED_LOWER_ASSESSMENTS = {
    "BW": {"b50e9903-58b3-520d-96bf-d5bc1fe51ebf"},
    "MV": {"3b7b2b62-e39c-5936-b0d8-5406206e57b6", "e6a89922-75ce-53dd-9e7b-3a683398431c"},
    "HH": {"797f5e93-b5fd-5ee3-9fb2-fcc9e1d12a00", "884bd99b-2373-5174-af7c-c6813b91bd93"},
    "SL": {"ef2bb474-89e1-5deb-81c4-c6b05d174bbd", "44ada28b-8635-5481-8d09-2d91686d352b", "11c964ff-be82-5d02-8cd7-ccb41cda8f4f", "e0932fef-9e1c-5c95-b00c-7589e76d0e83", "3b7b2b62-e39c-5936-b0d8-5406206e57b6", "bff1d8b0-fe2e-52e6-a467-dd0b6a1a4a04", "f602680f-ea75-5bed-ae87-72f6be34a99b"},
    "SN": {"11c964ff-be82-5d02-8cd7-ccb41cda8f4f", "e0932fef-9e1c-5c95-b00c-7589e76d0e83", "f41e4e30-794e-5ce4-ba5e-cc72712cd691", "7cfaf48e-e420-5c09-8ec2-932f0dba4d08", "57a03b38-5ec5-5e4f-b71a-4024bab1584c", "bff1d8b0-fe2e-52e6-a467-dd0b6a1a4a04", "f602680f-ea75-5bed-ae87-72f6be34a99b", "a8dc0290-9f80-5763-8943-e16b8d2aa860"},
    "ST": {"a8dc0290-9f80-5763-8943-e16b8d2aa860", "ef2bb474-89e1-5deb-81c4-c6b05d174bbd", "44ada28b-8635-5481-8d09-2d91686d352b", "7cfaf48e-e420-5c09-8ec2-932f0dba4d08"},
    "TH": {"14cc61c4-4909-5671-b1ee-930a02cb9f51", "7cfaf48e-e420-5c09-8ec2-932f0dba4d08"},
}
NEW_TASK_OFFERS = {
    "b50e9903-58b3-520d-96bf-d5bc1fe51ebf": {"DE-BW"},
    "3b7b2b62-e39c-5936-b0d8-5406206e57b6": {"DE-MV", "DE-SL"},
    "e6a89922-75ce-53dd-9e7b-3a683398431c": {"DE-MV"},
    # Since the E.1 cut (23 Nov 2026) the two-series free-fall task also closes Hessian E.1 child unit 2.
    "f41e4e30-794e-5ce4-ba5e-cc72712cd691": {"DE-HE", "DE-SN"},
    "7cfaf48e-e420-5c09-8ec2-932f0dba4d08": {"DE-SN", "DE-ST", "DE-TH"},
    "57a03b38-5ec5-5e4f-b71a-4024bab1584c": {"DE-SN"},
    "797f5e93-b5fd-5ee3-9fb2-fcc9e1d12a00": {"DE-HH"},
    "884bd99b-2373-5174-af7c-c6813b91bd93": {"DE-HH"},
    "bff1d8b0-fe2e-52e6-a467-dd0b6a1a4a04": {"DE-SL", "DE-SN"},
    "f602680f-ea75-5bed-ae87-72f6be34a99b": {"DE-SL", "DE-SN"},
}
LK_ONLY_NEW_TASKS = {"797f5e93-b5fd-5ee3-9fb2-fcc9e1d12a00", "884bd99b-2373-5174-af7c-c6813b91bd93"}
# The reviewed 22 November guided-entry pilot adds exactly these two own
# openings. Keep the historical source-seed authority unchanged beneath them.
HESSEN_GUIDED_OPENINGS = {
    "a4d4efe1-7d30-526b-ac9c-806113da4363",
    "b4e95dce-8537-5e38-8aa6-0d9cfaa2b19e",
}
HESSEN_GUIDED_OPENING_VIEWS = {
    "de-he-gym-physics-gk", "de-he-gym-physics-lk",
    "de-he-gym-physics-gk-g8", "de-he-gym-physics-gk-g9",
    "de-he-gym-physics-lk-g8", "de-he-gym-physics-lk-g9",
    "de-he-gym-sekii-physics-gk", "de-he-gym-sekii-physics-lk",
}
# The 23 November pilot adds an own measurement competency and its separate
# individual assessment. They are an exact delta over the retained source
# authority, not a new claim about official source-seed membership.
HESSEN_MEASUREMENT_GOALS = {
    "e0004439-ed34-5caf-858a-6107918224eb",
    "c6e2942d-1ff4-5e86-a52a-4ca4c8568291",
}
HESSEN_MEASUREMENT_VIEWS = {
    "de-he-gym-physics-gk", "de-he-gym-physics-lk",
    "de-he-gym-physics-gk-g8", "de-he-gym-physics-gk-g9",
    "de-he-gym-physics-lk-g8", "de-he-gym-physics-lk-g9",
    "de-he-gym-sekii-physics-gk", "de-he-gym-sekii-physics-lk",
}

NEW_EYE_ASSESSMENT_ID = "3b7b2b62-e39c-5936-b0d8-5406206e57b6"
REVIEWED_NEW_LOWER_EXCLUSIONS = {
    "MV": {"1e459a1b-4159-5049-84eb-9928129c1610", "09029573-864f-40ca-bf8a-cee7bf6dcb73", "156edddc-ce8d-580d-8d17-d9376d59e60e", "bf8517a9-142b-5789-826a-767f3b277998", "e4b38061-1f28-43ad-8371-a3e7c0e81856", "e918b31f-6f39-5dee-ade6-3617080fb24f", "ec7a0a68-730b-5c94-ac72-a937508f8303"},
    "SL": {"09029573-864f-40ca-bf8a-cee7bf6dcb73", "156edddc-ce8d-580d-8d17-d9376d59e60e", "2b700858-bc2e-5ddf-a791-b14d44160480", "bf8517a9-142b-5789-826a-767f3b277998", "e4b38061-1f28-43ad-8371-a3e7c0e81856", "e6a50c74-c922-508c-aa27-07bac2566955", "e918b31f-6f39-5dee-ade6-3617080fb24f", "eb30189c-27c6-510b-b235-6543afa18b90", "ec7a0a68-730b-5c94-ac72-a937508f8303"},
    "SN": {"156edddc-ce8d-580d-8d17-d9376d59e60e", "84ddb244-e560-592f-9d43-e84c801fe5b4", "8ac61062-f63e-5935-96ae-84014906c368", "bf8517a9-142b-5789-826a-767f3b277998", "bfea7a23-1ce1-4a42-badd-1fc9bf30124a", "e6a50c74-c922-508c-aa27-07bac2566955", "e918b31f-6f39-5dee-ade6-3617080fb24f", "eb30189c-27c6-510b-b235-6543afa18b90", "ec7a0a68-730b-5c94-ac72-a937508f8303"},
    "ST": {"bf8517a9-142b-5789-826a-767f3b277998"},
    "TH": {"262f807a-30d0-503e-986f-856cbd048e8e", "37013646-f13a-5faf-954c-940f2fd7502f"},
}


def ancestors(unit, pairs):
    found, pending = set(), [a for u, a in pairs if u == unit]
    while pending:
        previous = pending.pop()
        if previous not in found:
            found.add(previous)
            pending.extend(a for u, a in pairs if u == previous)
    return found


# E.1 cut accepted by the Product Owner on 23 Nov 2026: each new goal is a target
# only where a goal it was split from is a target; support roles are derived.
E1_CUT_ORIGINS = {
    "1e459a1b-4159-5049-84eb-9928129c1610": {"ce431132-dfc4-42c2-aff6-bd72035190f8", "e4b38061-1f28-43ad-8371-a3e7c0e81856"},
    "262f807a-30d0-503e-986f-856cbd048e8e": {"d6dc0e02-831d-4894-a61a-852bcc74f147", "e4b38061-1f28-43ad-8371-a3e7c0e81856"},
    "d9a6ea85-f7e8-5cbd-afe9-62596e22040d": {"d6dc0e02-831d-4894-a61a-852bcc74f147", "09029573-864f-40ca-bf8a-cee7bf6dcb73"},
    "0fee53f2-1c02-5b12-9b6c-aa9fa462d921": {"89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2", "68c90ba6-c438-463c-9a53-cf61062d416a"},
    # The velocity-vector assessment stands beside the throw/brake assessment of the lower stage.
    "4ea1b93f-2dba-59ac-87ab-29af6c55cc37": {"0fee53f2-1c02-5b12-9b6c-aa9fa462d921", "dfd2628f-b44e-51b3-86e8-99158861be8c"},
}


def e1_cut_delta(roles):
    added = roles["target"] & set(E1_CUT_ORIGINS)
    for goal in added:
        if not E1_CUT_ORIGINS[goal] & roles["target"]:
            raise AssertionError("A new E.1 goal became a target without the goal it was split from")
    return added


def measurement_delta(view, roles):
    expected = HESSEN_MEASUREMENT_GOALS if view["viewId"] in HESSEN_MEASUREMENT_VIEWS else set()
    if roles["target"] & HESSEN_MEASUREMENT_GOALS != expected:
        raise AssertionError("Changed reviewed measurement target delta")
    if roles["prerequisiteOnly"] & HESSEN_MEASUREMENT_GOALS:
        raise AssertionError("Measurement delta entered a support role")
    return expected


RETIRED_MULTIPHASE_ID = "2b9e565f-d9b4-5e23-b5b7-b7977cecff06"
RETIRED_MULTIPHASE_OFFER_VIEWS = frozenset(json.loads((
    authoring.ROOT / "curricula/DE/Gymnasium/quality/assessment-review/physik/e1-multiphase-disposition-20261124/old-offer-views.actual.json"
).read_text())["previousTargetViewIds"])
HISTORICAL_TWO_MOTIONS_ID = "6ea3fb3c-abdc-568f-ab13-97c36dc274e4"
CURRENT_TWO_MOTIONS_ID = "bcc56921-7107-5f5f-b721-3d5e0d7e1cd9"
_two_motions_scope_bytes = (
    authoring.ROOT / "curricula/DE/Gymnasium/quality/assessment-review/physik/"
    "e1-current-assessments-20261124-v1/zb-identity-successor-20261124/native-current-identity.actual.json"
).read_bytes()
if hashlib.sha256(_two_motions_scope_bytes).hexdigest() != "f5bdfc1e4923c79e32113e064ff13e08d2cb2782565c42a007e2b8abdf0f9106":
    raise AssertionError("Changed independently verified two-motions identity scope")
_two_motions_scope = json.loads(_two_motions_scope_bytes)
TWO_MOTIONS_SUCCESSOR_VIEWS = frozenset(
    row["viewId"] for row in _two_motions_scope["viewBindings"] if row["successorVisible"]
)
if len(TWO_MOTIONS_SUCCESSOR_VIEWS) != 64:
    raise AssertionError("Changed reviewed two-motions identity view set")
# The mixed E.1 exam "Bewegungsanalyse und freier Fall" is retired for all Länder (25 Nov 2026).
# Its record lists the views in which it was an atomic target before.
RETIRED_MIXED_MOTION_ID = "a9562b05-c54d-5635-9244-3f7dd24a8642"
_mixed_motion_retirement = json.loads((
    authoring.ROOT / "curricula/DE/Gymnasium/quality/assessment-review/physik/"
    "e1-mixed-exam-retirement-20261125-v1/retirement.actual.json"
).read_text())
if _mixed_motion_retirement["goalId"] != RETIRED_MIXED_MOTION_ID:
    raise AssertionError("The retirement record names another goal")
RETIRED_MIXED_MOTION_OFFER_VIEWS = frozenset(_mixed_motion_retirement["views"]["previousTargetViewIds"])
if len(RETIRED_MIXED_MOTION_OFFER_VIEWS) != 64:
    raise AssertionError("Changed reviewed view set of the retired mixed E.1 assessment")



MOMENTUM_IDS = {"53afbda1-5776-502b-8867-471975d7b766", "ecbaa101-cb10-5da3-9368-ae40ff587d74", "059c1adc-e4d2-5222-a923-15abc417d59f"}

def momentum_delta(view, roles):
    """Independent expected full-competence routes, not the authoring policy."""
    state, stage = view["scope"].get("jurisdiction", "DE"), view["scope"]["stage"]
    profile = view["scope"].get("courseProfile")
    imp, mean, instant = "53afbda1-5776-502b-8867-471975d7b766", "ecbaa101-cb10-5da3-9368-ae40ff587d74", "059c1adc-e4d2-5222-a923-15abc417d59f"
    lower = {"DE-BW", "DE-BY", "DE-HH", "DE-TH"}
    upper = {"DE-HB", "DE-HE", "DE-MV", "DE-NW", "DE-RP", "DE-SH", "DE-SL"}
    expected = set()
    if (state in lower and stage in ("CrossStage", "SekI")) or (state in upper and stage in ("CrossStage", "SekII")):
        expected.add(imp)
    if state == "DE-BW" and stage in ("CrossStage", "SekI"):
        expected.add(mean)
    if state in ("DE-SN", "DE-ST") and profile == "LK" and stage in ("CrossStage", "SekII"):
        expected.add(imp)
        if state == "DE-SN":
            expected.update((mean, instant))
    if roles["target"] & MOMENTUM_IDS != expected:
        raise AssertionError("Changed reviewed momentum target delta: " + view["viewId"])
    return expected

def retained_authority_seeds(view, roles, baseline):
    """Remove only explicit reviewed additions, then enforce the old authority."""
    allowed_new_task = set()
    stage = view["scope"]["stage"]
    state = view["scope"].get("jurisdiction", "DE")
    if stage == "CrossStage":
        allowed_new_task = (set(NEW_TASK_OFFERS) - {NEW_EYE_ASSESSMENT_ID, "b50e9903-58b3-520d-96bf-d5bc1fe51ebf"} if state == "DE" else
            {task for task, states in NEW_TASK_OFFERS.items() if state in states})
        if view["scope"]["courseProfile"] == "GK":
            allowed_new_task -= LK_ONLY_NEW_TASKS
        if state in ("DE-SL", "DE-ST"):
            allowed_new_task |= {"ef2bb474-89e1-5deb-81c4-c6b05d174bbd", "44ada28b-8635-5481-8d09-2d91686d352b"}
    if state == "DE-HE" and stage in ("CrossStage", "SekII"):
        allowed_new_task.update(authoring.graph.HESSEN_E1_ASSESSMENTS)
        allowed_new_task.add(authoring.graph.HESSEN_E1_FREE_FALL_ASSESSMENT)
    allowed_new_task.update(e1_cut_delta(roles))
    if view["viewId"] in HESSEN_GUIDED_OPENING_VIEWS:
        allowed_new_task.update(HESSEN_GUIDED_OPENINGS)
    allowed_new_task.update(measurement_delta(view, roles))
    allowed_new_task.update(momentum_delta(view, roles))
    if not allowed_new_task <= roles["target"]:
        raise AssertionError("A reviewed addition is missing")
    retained = roles["target"] - allowed_new_task
    variants = authoring.graph.HESSEN_E1_CHILD_ASSESSMENT_VARIANTS
    if state == "DE-HE" and stage in ("CrossStage", "SekII"):
        if not set(variants.values()) <= retained:
            raise AssertionError("A reviewed child assessment is missing")
        if not set(variants).isdisjoint(retained):
            raise AssertionError("Historical and current child variants overlap")
        retained = (retained - set(variants.values())) | set(variants)
    else:
        if not set(variants.values()).isdisjoint(roles["target"] | roles["prerequisiteOnly"]):
            raise AssertionError("A child assessment variant left its reviewed scope")
    if RETIRED_MULTIPHASE_ID in roles["target"] | roles["prerequisiteOnly"]:
        raise AssertionError("A historical multiphase assessment is offered again")
    if view["viewId"] in RETIRED_MULTIPHASE_OFFER_VIEWS:
        retained = retained | {RETIRED_MULTIPHASE_ID}
    # Same comparison for the mixed E.1 exam: it left exactly the views that offered it, and the
    # frozen authority is compared with its seed restored. No other seed may change with it.
    if RETIRED_MIXED_MOTION_ID in roles["target"] | roles["prerequisiteOnly"]:
        raise AssertionError("The retired mixed E.1 assessment is offered again")
    if view["viewId"] in RETIRED_MIXED_MOTION_OFFER_VIEWS:
        retained = retained | {RETIRED_MIXED_MOTION_ID}
    # Comparison with the frozen source authority only: the independently
    # verified successor replaces one identity in exactly these 64 view slots.
    # Runtime identities and learner results remain distinct; no alias is made.
    if HISTORICAL_TWO_MOTIONS_ID in roles["target"] | roles["prerequisiteOnly"]:
        raise AssertionError("A historical two-motions assessment is offered again")
    if CURRENT_TWO_MOTIONS_ID in roles["prerequisiteOnly"]:
        raise AssertionError("The reviewed two-motions successor entered a support role")
    expected_successor = view["viewId"] in TWO_MOTIONS_SUCCESSOR_VIEWS
    if (CURRENT_TWO_MOTIONS_ID in roles["target"]) != expected_successor:
        raise AssertionError("Changed reviewed two-motions successor view set")
    if expected_successor:
        if CURRENT_TWO_MOTIONS_ID not in retained:
            raise AssertionError("The two-motions identity delta was counted as a new source addition")
        retained = (retained - {CURRENT_TWO_MOTIONS_ID}) | {HISTORICAL_TWO_MOTIONS_ID}
    digest = hashlib.sha256(("\n".join(sorted(retained)) + "\n").encode()).hexdigest()
    if digest != baseline["selectedAtomicSha256"]:
        raise AssertionError("Retained source-seed fingerprint changed")
    if len(retained) != baseline["selectedAtomicCount"]:
        raise AssertionError("Retained source-seed count changed")
    if not set(baseline["prerequisiteOnlyAtomicGoalIds"]) <= roles["prerequisiteOnly"]:
        raise AssertionError("Historical support role lost")
    return retained


class PhysicsStageAuthoring(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.views = {path.name: json.loads(path.read_text()) for path in authoring.DIRECTORY.glob("*.view.json")}
        cls.authorities = json.loads((authoring.ROOT / "scripts/generate_laender_physics_stage_views.memberships.json").read_text())["authorities"]

    def test_lower_momentum_closing_tasks_follow_the_approved_selection(self):
        offers = {
            "d8fc6295-d0db-59e5-bd90-080bbc508c3a": {"DE-HH", "DE-TH"},
            "b50e9903-58b3-520d-96bf-d5bc1fe51ebf": {"DE-BW"},
        }
        selection = json.loads((authoring.ROOT / "curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/views/lower-closures-v1/closing-task-selection.actual.json").read_text())
        self.assertEqual(selection["approvedAssessmentGoalIds"], ["b50e9903-58b3-520d-96bf-d5bc1fe51ebf"])
        self.assertNotIn("d8fc6295-d0db-59e5-bd90-080bbc508c3a", authoring.graph.GOALS)
        approved = set(selection["approvedAssessmentGoalIds"])
        pairs = set()
        for view in self.views.values():
            roles = authoring.graph.role_atoms(view)
            for task, states in offers.items():
                expected = task in approved and view["scope"].get("jurisdiction") in states and view["scope"]["stage"] in ("CrossStage", "SekI")
                with self.subTest(view=view["viewId"], task=task):
                    self.assertEqual(task in roles["target"], expected)
                    self.assertNotIn(task, roles["prerequisiteOnly"])
                    if expected:
                        pairs.add((view["viewId"], task))
        self.assertEqual(len(pairs), selection["expectedActualOfferCount"])

    def test_lower_momentum_closures_add_no_missing_preparation(self):
        covered = {"d8fc6295-d0db-59e5-bd90-080bbc508c3a": "53afbda1-5776-502b-8867-471975d7b766",
                   "b50e9903-58b3-520d-96bf-d5bc1fe51ebf": "ecbaa101-cb10-5da3-9368-ae40ff587d74"}
        for state, task in (("BW", "b50e9903-58b3-520d-96bf-d5bc1fe51ebf"),):
            view = self.views[f"de-{state.lower()}-seki.view.json"]
            seeds = authoring.graph.role_atoms(view)["target"] - covered.keys()
            basis = seeds | {p for seed in seeds for p in authoring.graph.prerequisites(seed)}
            goal = authoring.graph.GOALS[task]
            self.assertEqual(goal["requires"], [covered[task]])
            self.assertEqual(goal["examData"]["coveredGoalIds"], [covered[task]])
            self.assertEqual(authoring.graph.prerequisites(task) - basis, set())
            binding = authoring.SOURCE_PLAN["reviewedLowerAssessmentBindings"][state]["assessments"][task]
            for key in ("independentReview", "offerReview"):
                self.assertTrue((authoring.ROOT / binding[key]).is_file(), binding[key])
            # A reviewed offer cannot import an absent competency to make its complete task fit.
            missing = next(identifier for identifier, data in sorted(authoring.graph.GOALS.items())
                           if identifier not in basis and identifier not in covered and not data.get("contains"))
            forged = copy.deepcopy(goal)
            forged["requires"] = [covered[task], missing]
            plan = copy.deepcopy(authoring.SOURCE_PLAN)
            plan["reviewedLowerAssessmentBindings"][state]["assessments"][task]["requires"] = forged["requires"]
            with patch.dict(authoring.graph.GOALS, {task: forged}), patch.object(authoring, "SOURCE_PLAN", plan):
                authoring.graph.prerequisites.cache_clear()
                try:
                    result, report = authoring.lower_excerpt(self.views[f"de-{state.lower()}-lk.view.json"], seeds)
                    self.assertNotIn(task, authoring.graph.role_atoms(result)["target"])
                    self.assertNotIn(missing, report["learningBasisAtomicGoalIds"])
                    self.assertTrue(any(row["goalId"] == task and missing in row["missingActualPreparation"]
                                        for row in report["inactiveReviewedLowerAssessments"]))
                finally:
                    authoring.graph.prerequisites.cache_clear()

    def test_momentum_closures_preserve_all_old_reference_places_and_order(self):
        path = authoring.ROOT / "curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/views/lower-closures-v1/baseline-reference-places.actual.json"
        baseline = json.loads(path.read_text())
        additions = {"d8fc6295-d0db-59e5-bd90-080bbc508c3a", "b50e9903-58b3-520d-96bf-d5bc1fe51ebf"}
        self.assertEqual(len(baseline["views"]), 90)
        for row in baseline["views"]:
            view = self.views[row["path"].rsplit("/", 1)[1]]
            references = []
            def visit(nodes, trail=()):
                for node in nodes:
                    if node["kind"] == "structure":
                        visit(node["children"], (*trail, node["id"]))
                    elif node.get("goalId") not in additions:
                        references.append({"path": trail, "reference": node})
            visit(view["rootNodes"])
            digest = hashlib.sha256(json.dumps(references, ensure_ascii=True, sort_keys=True,
                                               separators=(",", ":")).encode()).hexdigest()
            with self.subTest(view=view["viewId"]):
                self.assertEqual(len(references), row["referenceCount"])
                self.assertEqual(digest, row["orderedReferencePlacesSha256"])

    def test_momentum_target_routes_and_uncovered_electives(self):
        for view in self.views.values():
            with self.subTest(view=view["viewId"]):
                momentum_delta(view, authoring.graph.role_atoms(view))
        for state in ("BE", "BB"):
            decision = authoring.SOURCE_PLAN["reviewedMomentumBindings"]["excludedElectives"][state]
            self.assertEqual(decision["pages"], [17, 21])
            self.assertEqual(decision["schoolForms"], (["Integrierte Sekundarschule", "Gemeinschaftsschule"] if state == "BE" else ["Gesamtschule", "berufliches Gymnasium"]))
        # No national official target is invented from the canonical catalog.
        for view in self.views.values():
            if view["scope"].get("jurisdiction", "DE") in ("DE", "DE-BE", "DE-BB", "DE-NI"):
                self.assertFalse(authoring.graph.role_atoms(view)["target"] & MOMENTUM_IDS)

    def test_new_momentum_primary_source_pin_fails_closed(self):
        broken = copy.deepcopy(authoring.SOURCE_PLAN)
        target = next(row for row in broken["reviewedMomentumBindings"]["targets"] if row["state"] == "BW")
        target["sourceSha256"] = "0" * 64
        with patch.object(authoring, "SOURCE_PLAN", broken):
            with self.assertRaisesRegex(ValueError, "Reviewed momentum primary source changed"):
                authoring.momentum_source_plan(self.views["de-bw-gk.view.json"], {}, {})

    def test_by_conservation_source_correction_does_not_reclassify_its_old_consumer(self):
        correction = authoring.SOURCE_PLAN["reviewedMomentumBindings"]["sourceAssignmentCorrections"]["BY"]
        self.assertEqual((correction["goalId"], correction["sourceTopicCode"], correction["sourceYear"]),
                         ("839ecc8f-3a60-418b-bc92-64bfeef33824", "Ph10.2", 10))
        self.assertEqual(correction["retainedEarlierConsumerGoalId"], "e790de73-f8e5-4027-bc05-9f12a0e8c9cb")
        self.assertIn(correction["goalId"], authoring.graph.GOALS[correction["retainedEarlierConsumerGoalId"]]["requires"])
        for filename in ("de-by-gk.view.json", "de-by-lk.view.json", "de-by-seki.view.json"):
            roles = authoring.graph.role_atoms(self.views[filename])
            self.assertTrue({correction["goalId"], correction["retainedEarlierConsumerGoalId"]} <= roles["target"])

    def test_new_momentum_content_has_its_own_mechanics_heading(self):
        imp = "53afbda1-5776-502b-8867-471975d7b766"
        for state, unit, profiles in (("sl", "e", ("gk", "lk")), ("sn", "q11", ("lk",))):
            for profile in profiles:
                for stage in ("", "-sekii"):
                    view = self.views[f"de-{state}{stage}-{profile}.view.json"]
                    group = next(n for n in authoring.graph.walk(view["rootNodes"]) if n.get("id") == f"physics-{state}-{unit}-momentum-preparation")
                    shared = state == "sl" and stage == "-sekii"
                    self.assertEqual(group["label"], "Einstieg und mechanische Grundlagen" if shared else "Mechanische Grundlage: Impulse zweier Körper")
                    if shared:
                        self.assertIn("5c44b9ba-9b05-4774-95d5-073230d3fc4f", authoring.graph.role_atoms({"rootNodes": [group]})["target"])
                    self.assertIn(imp, authoring.graph.role_atoms({"rootNodes": [group]})["target"])
                    self.assertNotIn("Kern", group["label"])
                    self.assertNotIn("Relativität", group["label"])

    def test_heading_repair_preserves_all_preexisting_acquisition_places(self):
        base = authoring.ROOT / "curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/views"
        predecessor = json.loads((base / "source-review-predecessors/rejected-pairs.actual.json").read_text())
        def references(view):
            found = {}
            def visit(nodes, trail=()):
                for node in nodes:
                    if node["kind"] == "structure":
                        visit(node["children"], (*trail, node["id"]))
                    else:
                        found.setdefault(node["goalId"], []).append((trail, node["kind"],
                            node.get("projectionRole", "target"), node.get("acquisitionPlacement") is True))
            visit(view["rootNodes"])
            return found
        for row in predecessor["pairs"]:
            payload = {}
            for label, pin in row["pair"].items():
                raw = (base / pin["path"]).read_bytes()
                self.assertEqual(hashlib.sha256(raw).hexdigest(), pin["sha256"])
                payload[label] = references(json.loads(raw))
            allowed = {"53afbda1-5776-502b-8867-471975d7b766"}
            if "-sekii-" in row["viewFile"]:
                allowed.add("5c44b9ba-9b05-4774-95d5-073230d3fc4f")
            retained = lambda data: {k:v for k,v in data.items() if k not in allowed}
            with self.subTest(view=row["viewFile"]):
                self.assertNotEqual(retained(payload["before-heading"]), retained(payload["rejected-acquisition-rebuild"]),
                    "the retained negative fixture must detect the actual acquisition-wrapper regression")
                self.assertEqual(retained(payload["before-heading"]), retained(references(self.views[row["viewFile"]])))

    def test_sn_shared_newton_topic_keeps_goal_specific_source_passages(self):
        _, report = authoring.generate_source_land(self.views["de-sn-lk.view.json"])
        expected = {"53afbda1-5776-502b-8867-471975d7b766": [57],
                    "ecbaa101-cb10-5da3-9368-ae40ff587d74": [57, 58],
                    "059c1adc-e4d2-5222-a923-15abc417d59f": [58]}
        for goal, pages in expected.items():
            with self.subTest(goal=goal):
                passages = report["sourceAssignments"][goal]["sourcePassages"]
                self.assertEqual(len(passages), 1)
                self.assertEqual(passages[0]["canonicalGoalId"], goal)
                self.assertEqual(passages[0]["pages"], pages)
        imp = report["sourceAssignments"]["53afbda1-5776-502b-8867-471975d7b766"]["sourcePassages"][0]
        self.assertNotIn("tangent", imp["boundary"].lower())
        self.assertNotIn("differential", imp["boundary"].lower())

    def test_momentum_derivation_moves_and_actual_preparation_chain(self):
        proof = "f524f05c-4456-4fc3-a1f7-f40741fc1f16"
        rate = "059c1adc-e4d2-5222-a923-15abc417d59f"
        math = "b1dcc191-d046-50de-984a-ee5c17157628"
        self.assertIn(rate, authoring.graph.GOALS[proof]["requires"])
        self.assertIn(math, authoring.graph.GOALS[rate]["requires"])
        for state, unit, label in (("st", "physics-st-unit-q11-12", "Herleitung der Impulserhaltung nach den Analysisgrundlagen"), ("sn", "physics-sn-unit-q11", "Herleitung der Impulserhaltung nach der Differentialform")):
            for name in (f"de-{state}-lk.view.json", f"de-{state}-sekii-lk.view.json"):
                view = self.views[name]
                node = next(n for n in authoring.graph.walk(view["rootNodes"]) if n.get("id") == unit)
                groups = [n for n in authoring.graph.walk(node["children"]) if n.get("label") == label]
                self.assertEqual(len(groups), 1)
                self.assertIn(proof, authoring.graph.role_atoms({"rootNodes": groups})["target"])
                learning = {n.get("goalId") for n in authoring.graph.walk(node["children"]) if n.get("acquisitionPlacement") is True or n.get("projectionRole") != "prerequisiteOnly"}
                self.assertIn(rate, learning)

    def test_two_motions_identity_delta_cannot_widen_hide_or_demote_the_frozen_authority(self):
        view = self.views["de-he-gk.view.json"]
        baseline = self.authorities[view["viewId"]]
        roles = authoring.graph.role_atoms(view)
        retained_authority_seeds(view, roles, baseline)
        missing = copy.deepcopy(roles)
        missing["target"].remove(CURRENT_TWO_MOTIONS_ID)
        with self.assertRaisesRegex(AssertionError, "successor view set"):
            retained_authority_seeds(view, missing, baseline)
        for role in ("target", "prerequisiteOnly"):
            changed = copy.deepcopy(roles)
            changed[role].add(HISTORICAL_TWO_MOTIONS_ID)
            with self.subTest(historical_role=role), self.assertRaisesRegex(AssertionError, "historical two-motions"):
                retained_authority_seeds(view, changed, baseline)
        demoted = copy.deepcopy(roles)
        demoted["prerequisiteOnly"].add(CURRENT_TWO_MOTIONS_ID)
        with self.assertRaisesRegex(AssertionError, "support role"):
            retained_authority_seeds(view, demoted, baseline)
        outside = self.views["de-he-seki-g8.view.json"]
        widened = authoring.graph.role_atoms(outside)
        widened["target"].add(CURRENT_TWO_MOTIONS_ID)
        with self.assertRaisesRegex(AssertionError, "successor view set"):
            retained_authority_seeds(outside, widened, self.authorities[outside["viewId"]])

    def test_mixed_motion_retirement_cannot_return_or_take_another_seed_with_it(self):
        self.assertTrue(RETIRED_MIXED_MOTION_OFFER_VIEWS <= set(self.authorities))
        self.assertEqual({view["viewId"] for view in self.views.values()} & RETIRED_MIXED_MOTION_OFFER_VIEWS,
                         RETIRED_MIXED_MOTION_OFFER_VIEWS)
        view = self.views["de-bb-gk.view.json"]
        baseline = self.authorities[view["viewId"]]
        roles = authoring.graph.role_atoms(view)
        retained_authority_seeds(view, roles, baseline)
        for role in ("target", "prerequisiteOnly"):
            returned = copy.deepcopy(roles)
            returned[role].add(RETIRED_MIXED_MOTION_ID)
            with self.subTest(returned_role=role), self.assertRaisesRegex(AssertionError, "retired mixed E.1"):
                retained_authority_seeds(view, returned, baseline)
        # A further seed that leaves together with the exam is not covered by the retirement.
        further = copy.deepcopy(roles)
        further["target"].remove("7c0b94b9-2af7-59d4-bfae-278a3418f6a8")
        with self.assertRaisesRegex(AssertionError, "fingerprint changed"):
            retained_authority_seeds(view, further, baseline)
        # A view that never offered the exam gets no restored seed.
        outside = self.views["de-by-gk.view.json"]
        self.assertNotIn(outside["viewId"], RETIRED_MIXED_MOTION_OFFER_VIEWS)
        retained_authority_seeds(outside, authoring.graph.role_atoms(outside), self.authorities[outside["viewId"]])

    def test_guided_openings_are_targets_only_in_the_eight_reviewed_views(self):
        self.assertEqual(len(self.views), 90)
        for view in self.views.values():
            with self.subTest(view=view["viewId"]):
                roles = authoring.graph.role_atoms(view)
                expected = HESSEN_GUIDED_OPENINGS if view["viewId"] in HESSEN_GUIDED_OPENING_VIEWS else set()
                self.assertEqual(roles["target"] & HESSEN_GUIDED_OPENINGS, expected)
                self.assertFalse(roles["prerequisiteOnly"] & HESSEN_GUIDED_OPENINGS)

    def test_original_full_authorities_keep_exact_seed_sets_and_old_support_roles(self):
        self.assertTrue(HESSEN_GUIDED_OPENING_VIEWS <= set(self.authorities))
        self.assertTrue(HESSEN_GUIDED_OPENING_VIEWS <= {view["viewId"] for view in self.views.values()})
        for view in self.views.values():
            baseline = self.authorities.get(view["viewId"])
            if baseline is None:
                continue
            with self.subTest(view=view["viewId"]):
                roles = authoring.graph.role_atoms(view)
                retained_authority_seeds(view, roles, baseline)

    def test_measurement_delta_is_exactly_two_targets_in_eight_full_hessian_views(self):
        self.assertEqual(len(HESSEN_MEASUREMENT_GOALS), 2)
        self.assertEqual(len(HESSEN_MEASUREMENT_VIEWS), 8)
        self.assertTrue(HESSEN_MEASUREMENT_VIEWS <= set(self.authorities))
        self.assertTrue(HESSEN_MEASUREMENT_VIEWS <= {view["viewId"] for view in self.views.values()})
        pairs = set()
        for view in self.views.values():
            with self.subTest(view=view["viewId"]):
                roles = authoring.graph.role_atoms(view)
                expected = measurement_delta(view, roles)
                pairs.update((view["viewId"], goal) for goal in expected)
        self.assertEqual(len(pairs), 16)

    def test_measurement_delta_cannot_widen_or_erase_the_retained_authority(self):
        view = self.views["de-he-gk.view.json"]
        baseline = self.authorities[view["viewId"]]
        roles = authoring.graph.role_atoms(view)
        retained = retained_authority_seeds(view, roles, baseline)
        for goal in HESSEN_MEASUREMENT_GOALS:
            for demote in (False, True):
                changed = copy.deepcopy(roles)
                changed["target"].remove(goal)
                if demote:
                    changed["prerequisiteOnly"].add(goal)
                with self.subTest(goal=goal, demoted=demote), self.assertRaises(AssertionError):
                    retained_authority_seeds(view, changed, baseline)
            for filename in ("de-he-seki-g8.view.json", "de-bb-gk.view.json"):
                outside = self.views[filename]
                for role in ("target", "prerequisiteOnly"):
                    changed = authoring.graph.role_atoms(outside)
                    changed[role].add(goal)
                    with self.subTest(goal=goal, view=outside["viewId"], role=role), self.assertRaises(AssertionError):
                        measurement_delta(outside, changed)
        future = dict(view, viewId="de-he-gym-physics-unreviewed")
        with self.assertRaisesRegex(AssertionError, "measurement target delta"):
            measurement_delta(future, roles)
        changed = copy.deepcopy(roles)
        extra = next(goal for goal, data in authoring.graph.GOALS.items()
                     if not data.get("contains") and goal not in roles["target"] | roles["prerequisiteOnly"])
        changed["target"].add(extra)
        with self.assertRaisesRegex(AssertionError, "source-seed fingerprint"):
            retained_authority_seeds(view, changed, baseline)
        changed = copy.deepcopy(roles)
        changed["target"].remove(next(iter(retained & roles["target"])))
        with self.assertRaisesRegex(AssertionError, "source-seed fingerprint"):
            retained_authority_seeds(view, changed, baseline)
        support = next(iter(set(baseline["prerequisiteOnlyAtomicGoalIds"]) - roles["target"]))
        for promote in (False, True):
            changed = copy.deepcopy(roles)
            changed["prerequisiteOnly"].remove(support)
            if promote:
                changed["target"].add(support)
            with self.subTest(old_support_promoted=promote), self.assertRaises(AssertionError):
                retained_authority_seeds(view, changed, baseline)

    def test_all_lands_have_real_lower_stage_excerpts_with_source_membership(self):
        for state in ("BW", "BY", "BB", "BE", "HB", "HH", "MV", "NI", "NW", "RP", "SL", "SN", "ST", "SH", "TH"):
            with self.subTest(state=state):
                lower = self.views[f"de-{state.lower()}-seki.view.json"]
                full = self.views[f"de-{state.lower()}-gk.view.json"]
                generate = authoring.generate_bavaria if state == "BY" else authoring.generate_source_land
                _, report = generate(full)
                expected = set(report.get("sourceSelectedLowerAtomicGoalIds", authoring.MEMBERSHIPS[full["viewId"]]["sourceSelectedLowerAtomicGoalIds"]))
                base = expected - REVIEWED_LOWER_ASSESSMENTS.get(state, set())
                learning = base | {p for seed in base for p in authoring.graph.prerequisites(seed)}
                expected |= {task for task in REVIEWED_LOWER_ASSESSMENTS.get(state, set())
                    if authoring.graph.prerequisites(task) <= learning
                    and set(authoring.graph.GOALS[task]["examData"]["coveredGoalIds"]) <= learning}
                self.assertEqual(authoring.graph.role_atoms(lower)["target"], expected)
                self.assertEqual(lower["scope"]["stage"], "SekI")
                self.assertNotIn("courseProfile", lower["scope"])
                self.assertIsNotNone(authoring.Author(lower).find("physics-bw-seki" if state == "BW" else "physics-seki"))
                self.assertFalse(any(n.get("id", "").startswith("physics-sekii-") for n in authoring.graph.walk(lower["rootNodes"])))

    def test_acquisition_templates_are_only_proven_nonseed_atoms(self):
        for view in self.views.values():
            raw_seeds = authoring.graph.role_atoms(view)["target"]
            seeds = course_seeds(raw_seeds, authoring.graph.GOALS, view["scope"])
            basis = seeds | {p for seed in seeds for p in authoring.graph.prerequisites(seed)}
            marked = [n for n in authoring.graph.walk(view["rootNodes"]) if n.get("acquisitionPlacement") is True]
            for node in marked:
                with self.subTest(view=view["viewId"], goal=node["goalId"]):
                    self.assertEqual(node["kind"], "goalEntry")
                    self.assertEqual(node["projectionRole"], "prerequisiteOnly")
                    self.assertIn(node["goalId"], basis - raw_seeds)
            self.assertEqual(len({n["goalId"] for n in marked}), len(marked), view["viewId"])
            self.assertEqual({n["goalId"] for n in marked}, basis - raw_seeds, view["viewId"])

    def test_every_direct_cross_unit_requirement_has_an_explicit_after_hull(self):
        for view in self.views.values():
            raw_selected = authoring.graph.role_atoms(view)["target"]
            seeds = course_seeds(raw_selected, authoring.graph.GOALS, view["scope"])
            learning = seeds | {p for seed in seeds for p in authoring.graph.prerequisites(seed)}
            selected = raw_selected & learning
            for parent in authoring.graph.walk(view["rootNodes"]):
                if parent["kind"] != "structure":
                    continue
                groups = [n for n in parent["children"] if n["kind"] == "structure"]
                if len(groups) < 2:
                    continue
                with self.subTest(view=view["viewId"], parent=parent["id"]):
                    self.assertIn("childOrder", parent)
                    pairs = {(p["unit"], p["after"]) for p in parent["childOrder"]["after"]}
                    ownership = {a: n["id"] for n in groups for a in authoring.graph.learning_atoms(n, selected, learning)}
                    for atom, unit in ownership.items():
                        for required in authoring.graph.GOALS[atom].get("requires", []):
                            if required in ownership and ownership[required] != unit:
                                self.assertIn(ownership[required], ancestors(unit, pairs), (atom, required))
                    for unit, previous in pairs:
                        self.assertNotIn(unit, ancestors(unit, pairs))
                        self.assertFalse(any(previous in ancestors(middle, pairs) for middle in ancestors(unit, pairs) if middle != previous))

    def test_hessian_gk_chain_rule_follows_actual_q2_demand_without_importing_lk_e_calendar(self):
        def phase_of(view, prefix):
            result = []
            def visit(nodes, phase=None):
                for node in nodes:
                    if node["kind"] == "structure":
                        visit(node["children"], node["id"] if node["id"] in ("physics-e-phase", "physics-q1", "physics-q2", "physics-q3", "physics-q4") else phase)
                    elif node.get("goalId", "").startswith(prefix) and (node.get("acquisitionPlacement") is True or node.get("projectionRole") != "prerequisiteOnly"):
                        result.append(phase)
            visit(view["rootNodes"])
            return result
        for profile, expected in (("gk", "physics-q2"), ("lk", "physics-e-phase")):
            view = self.views[f"de-he-{profile}.view.json"]
            self.assertEqual(phase_of(view, "ae5010cc"), [expected])
        gk = self.views["de-he-gk.view.json"]
        raw = authoring.graph.role_atoms(gk)["target"]
        seeds = course_seeds(raw, authoring.graph.GOALS, gk["scope"])
        intermediate = next(a for a in raw if a.startswith("e359f8bb"))
        consumer = next(a for a in seeds if a.startswith("50328a4f"))
        self.assertNotIn(intermediate, seeds)
        self.assertFalse(any(intermediate in authoring.graph.prerequisites(seed) for seed in seeds))
        self.assertIn(next(a for a in authoring.graph.GOALS if a.startswith("ae5010cc")), authoring.graph.prerequisites(consumer))
        # Needed LK intermediates have a real GK consumer unit. Their empty
        # singleton shells must not survive when the merged LK target wins.
        needed = {"e3bce51c-cfeb-4706-b95e-a22b76e7dd73", "73b309ed-1aab-5778-8494-d9b65f5a352b",
                  "38e0ff49-f132-44c8-b17a-73dada5344db", "330808f6-789a-583d-86df-e271a7683d8b",
                  "09f2cdbd-64e0-55d2-ada7-1190f4fd50df"}
        upper_gk = self.views["de-he-sekii-gk.view.json"]
        upper_raw = authoring.graph.role_atoms(upper_gk)["target"]
        upper_seeds = course_seeds(upper_raw, authoring.graph.GOALS, upper_gk["scope"])
        upper_learning = upper_seeds | {p for s in upper_seeds for p in authoring.graph.prerequisites(s)}
        self.assertTrue(needed <= upper_raw & upper_learning)
        self.assertFalse(needed & upper_seeds)
        q2 = authoring.Author(upper_gk).find("physics-q2")[2]
        self.assertFalse(any(n.get("id", "").startswith("physics-context-acquisition-") for n in q2["children"]))
        self.assertTrue(needed <= authoring.canonical_visible_atoms(q2))
        upper_lk = self.views["de-he-sekii-lk.view.json"]
        lk_seeds = course_seeds(authoring.graph.role_atoms(upper_lk)["target"], authoring.graph.GOALS, upper_lk["scope"])
        self.assertTrue(needed <= lk_seeds)
        self.assertTrue(needed <= authoring.canonical_visible_atoms(authoring.Author(upper_lk).find("physics-q1")[2]))

    def test_needed_filtered_intermediate_keeps_its_target_payload_at_the_real_consumer(self):
        goals = {"gk": {"title": "Applicable consumer", "tags": ["GK"], "requires": ["lk"]},
                 "lk": {"title": "Necessary LK intermediate", "tags": ["LK"], "requires": ["math"]},
                 "math": {"title": "Needed mathematical skill", "tags": ["LK"], "requires": []},
                 "unused": {"title": "Unrelated LK content", "tags": ["LK"], "requires": []}}
        closure = {"gk": {"lk", "math"}, "lk": {"math"}, "math": set(), "unused": set()}
        reference = {"kind": "goalEntry", "goalId": "lk", "projectionRole": "target", "displayLabel": "Retained wording"}
        view = {"scope": {"courseProfile": "GK"}, "rootNodes": [authoring.graph.structure("physics-root", "Physics", [
            authoring.graph.structure("physics-e-phase", "E", [copy.deepcopy(reference), {"kind": "goalEntry", "goalId": "unused"}]),
            authoring.graph.structure("physics-q2", "Q2", [{"kind": "goalEntry", "goalId": "gk"}])])]}
        def extract(atom):
            for parent in authoring.graph.walk(view["rootNodes"]):
                if parent["kind"] == "structure":
                    for index, child in enumerate(parent["children"]):
                        if child.get("goalId") == atom:
                            return parent["children"].pop(index)
            return None
        seeds, learning, shifts = contextual_targets(view, goals, {"gk", "lk", "unused"}, closure.__getitem__, extract, authoring.graph.structure)
        self.assertEqual(seeds, {"gk"})
        self.assertEqual(learning, {"gk", "lk", "math"})
        self.assertEqual(shifts[0]["to"], "physics-q2")
        acquisition_placements(view, goals, {"gk", "lk", "unused"}, closure.__getitem__, authoring.graph.structure,
                               consumer_seeds={"gk", "lk"})
        root = view["rootNodes"][0]
        self.assertEqual(root["children"][0]["children"], [{"kind": "goalEntry", "goalId": "unused"}])
        q2 = root["children"][1]
        self.assertIn(reference, list(authoring.graph.walk(q2["children"])))
        self.assertEqual([n["goalId"] for n in authoring.graph.walk(q2["children"]) if n.get("acquisitionPlacement") is True], ["math"])

    def test_course_filter_normalizes_nullable_release_and_whitespace_like_native_service(self):
        goals = {"null-release": {"tags": ["canonical"], "release": None},
                 "null-level": {"tags": ["canonical"], "release": {"courseLevel": None}},
                 "blank-level": {"tags": ["canonical"], "release": {"courseLevel": "  "}},
                 "lk-level": {"tags": ["canonical"], "release": {"courseLevel": " lk "}},
                 "gk-tag": {"tags": ["GK"], "release": {"courseLevel": "LK"}}}
        self.assertEqual(course_seeds(set(goals), goals, {"courseProfile": "GK"}),
                         {"null-release", "null-level", "blank-level", "gk-tag"})
        self.assertEqual(course_seeds(set(goals), goals, {"courseProfile": "LK"}), set(goals))

    def test_canonical_phase_subject_atoms_are_inside_concrete_topics(self):
        for view in self.views.values():
            if view["scope"].get("jurisdiction", "DE") != "DE" or view["scope"]["stage"] == "SekI":
                continue
            author = authoring.Author(view)
            for phase_id in ("physics-e-phase", "physics-q1", "physics-q2", "physics-q3", "physics-q4"):
                phase = author.find(phase_id)[2]
                loose = [node["goalId"] for node in phase["children"] if node["kind"] != "structure" and author.atoms(node)
                         and not authoring.graph.GOALS[node["goalId"]]["title"].startswith("Lernkarten")]
                self.assertEqual(loose, [], (view["viewId"], phase_id))

    def test_canonical_examination_uses_the_same_flat_atomic_collection_in_both_profiles(self):
        all_exams = (authoring.canonical_atoms("61684ca7-b725-534f-944b-c7645cea1792")
                     | authoring.canonical_atoms("79028c45-90ae-57eb-8016-f5a96af18fa2"))
        for view in self.views.values():
            if view["scope"].get("jurisdiction", "DE") != "DE" or view["scope"]["stage"] == "SekI":
                continue
            exam = authoring.Author(view).find("physics-abitur")[2]
            self.assertTrue(all(n["kind"] != "structure" for n in exam["children"]), view["viewId"])
            self.assertTrue(all(not authoring.graph.GOALS[n["goalId"]].get("contains") for n in exam["children"]))
            self.assertEqual(authoring.graph.role_atoms({"rootNodes": exam["children"]})["target"],
                             authoring.graph.role_atoms(view)["target"] & all_exams)

    def test_new_lower_assessments_only_test_the_existing_unpruned_learning_basis(self):
        for state, tasks in REVIEWED_LOWER_ASSESSMENTS.items():
            view = self.views[f"de-{state.lower()}-seki.view.json"]
            seeds = authoring.graph.role_atoms(view)["target"]
            base = seeds - tasks
            learning = base | {p for seed in base for p in authoring.graph.prerequisites(seed)}
            for task in tasks:
                goal = authoring.graph.GOALS[task]
                if task in NEW_TASK_OFFERS:
                    self.assertNotIn("applicabilityFromRequires", goal["extendedData"])
                    self.assertEqual(set(goal["extendedData"]["applicabilityOverrides"]["jurisdiction"]), NEW_TASK_OFFERS[task])
                    self.assertEqual(goal["applicability"], goal["extendedData"]["applicabilityOverrides"])
                    self.assertEqual(goal["extendedData"]["applicabilityMappingInheritance"], "boundary")
                elif task != "a8dc0290-9f80-5763-8943-e16b8d2aa860":
                    self.assertIs(goal.get("extendedData", {}).get("applicabilityFromRequires"), True)
                applicable = authoring.graph.prerequisites(task) <= learning and set(goal["examData"]["coveredGoalIds"]) <= learning
                self.assertEqual(task in seeds, applicable, (state, task))
            self.assertEqual(seeds | {p for seed in seeds for p in authoring.graph.prerequisites(seed)}, learning | (tasks & seeds))

    def test_e1_acceleration_log_adds_only_the_independently_reviewed_lower_offers(self):
        task = "a8dc0290-9f80-5763-8943-e16b8d2aa860"
        laws = "262f807a-30d0-503e-986f-856cbd048e8e"
        covered = "e4b38061-1f28-43ad-8371-a3e7c0e81856"
        bindings = authoring.SOURCE_PLAN["reviewedLowerAssessmentBindings"]
        offered = {state for state, binding in bindings.items() if task in binding["assessments"]}
        self.assertEqual(offered, {"SN", "ST"})
        self.assertEqual(authoring.graph.GOALS[task]["requires"], [laws])
        self.assertEqual(authoring.graph.GOALS[task]["examData"]["coveredGoalIds"], [covered])
        for state in offered:
            binding = bindings[state]["assessments"][task]
            self.assertEqual(binding["requires"], [laws])
            self.assertEqual(binding["coveredGoalIds"], [covered])
            self.assertTrue((authoring.ROOT / binding["independentReview"]).is_file())
        for state in ("BW", "BY", "BB", "BE", "HB", "HH", "MV", "NI", "NW", "RP", "SL", "SN", "ST", "SH", "TH"):
            with self.subTest(state=state):
                original_offer = any(task in row["sourceSelectedLowerAtomicGoalIds"]
                    for view_id, row in authoring.MEMBERSHIPS.items()
                    if view_id.startswith("de-" + state.lower() + "-"))
                lower = self.views[f"de-{state.lower()}-seki.view.json"]
                self.assertEqual(task in authoring.graph.role_atoms(lower)["target"],
                                 original_offer or state in offered)
        # Hamburg's independent rejection is real: graph membership alone must
        # not manufacture the missing signed-area / initial-value preparation.
        self.assertNotIn(task, bindings["HH"]["assessments"])

    def test_retired_exam_identities_are_absent_from_active_state_view_references(self):
        # The earlier throw edition (24 Nov 2026) and the mixed E.1 exam (25 Nov 2026) keep their
        # identity in the catalog; no view offers them and no acquisition seed names them.
        retired = {"6ea3fb3c-abdc-568f-ab13-97c36dc274e4", "a9562b05-c54d-5635-9244-3f7dd24a8642"}
        for name, view in self.views.items():
            with self.subTest(view=name):
                self.assertFalse(retired & {node.get("goalId") for node in authoring.graph.walk(view["rootNodes"])})
                self.assertFalse(retired & authoring.graph.role_atoms(view)["target"])
        for view_id, seeds in authoring.CANONICAL_E_SEEDS.items():
            with self.subTest(seeds=view_id):
                self.assertFalse(retired & set(seeds))

    def test_horizontal_throw_assessment_follows_its_assessed_modeling_competency(self):
        task, covered = "bcc56921-7107-5f5f-b721-3d5e0d7e1cd9", "d6dc0e02-831d-4894-a61a-852bcc74f147"
        for state in ("MV", "SL", "SN"):
            for profile in ("gk", "lk"):
                view = self.views[f"de-{state.lower()}-{profile}.view.json"]
                units = [node for node in authoring.graph.walk(view["rootNodes"]) if node["kind"] == "structure" and f"physics-{state.lower()}-unit-" in node["id"] and not node["id"].endswith("-practice")]
                task_units = [node["id"] for node in units if task in authoring.canonical_visible_atoms(node)]
                covered_units = [node["id"] for node in units if covered in authoring.canonical_visible_atoms(node)]
                self.assertEqual(task_units, covered_units, view["viewId"])
                self.assertTrue(task_units)

    def test_direct_cut_policy_does_not_order_units_through_a_loose_parent_atom(self):
        groups = [authoring.graph.structure("u", "U", []), authoring.graph.structure("v", "V", [])]
        owned = {"u": {"a"}, "v": {"b"}}
        direct = {"a": set(), "loose": {"a"}, "b": {"loose"}}
        order, _ = partial_order(groups, lambda n: owned[n["id"]], lambda a: direct[a])
        self.assertEqual(order, {"after": []})
        direct["b"] = {"a"}
        self.assertEqual(partial_order(groups, lambda n: owned[n["id"]], lambda a: direct[a])[0],
                         {"after": [{"unit": "v", "after": "u"}]})
        direct["a"] = {"b"}
        with self.assertRaisesRegex(ValueError, "Cyclic"):
            partial_order(groups, lambda n: owned[n["id"]], lambda a: direct[a])

    def test_bavaria_years_and_two_acquisition_assessments_retain_their_source_field(self):
        for profile in ("gk", "lk"):
            view = self.views[f"de-by-{profile}.view.json"]
            author = authoring.Author(view)
            self.assertTrue(all(author.find(f"physics-by-year-{year}") for year in (8, 9, 10, 11, 12, 13)))
            field = author.find("physics-by-ph10-1")[2]
            self.assertTrue({"b4175564-4397-5c08-90ba-4f13231a75ec", "e0932fef-9e1c-5c95-b00c-7589e76d0e83"} <= authoring.canonical_visible_atoms(field))
            self.assertFalse(any(n.get("label", "").startswith(("Q1 ", "Q2 ", "Q3 ", "Q4 ", "Abitur")) for n in authoring.graph.walk(view["rootNodes"])))

    def test_primary_source_granularity_does_not_invent_years_or_generic_e11(self):
        examples = [("ST", "SekI", "schuljahrgang-10-mechanik", "", "e10"),
                    ("MV", "SekI", "J10-mechanik", "", "e10"),
                    ("SN", "SekII", "jahrgangsstufe-11-grundkurs", "", "q11")]
        for state, stage, code, title, expected in examples:
            self.assertEqual(authoring.source_unit(state, stage, {"topicCode": code, "title": title})[1], expected)
        self.assertIsNone(authoring.source_unit("TH", "SekII", {"topicCode": "TH-3-1-kinematik", "title": "11S"}))
        self.assertIsNone(authoring.source_unit("BE", "SekII", {"topicCode": "3.1.1", "title": "Einführungsphase"}))
        for state in ("SH", "RP", "NI", "BE", "BB", "NW"):
            view = self.views[f"de-{state.lower()}-gk.view.json"]
            topics, _, sources = authoring.online_lower_plan(view)
            self.assertTrue(topics)
            self.assertTrue(all(source["sha256"] and source["sourceTemporalPages"] for source in sources))
            if state == "SH":
                self.assertEqual({topic["unit"][2] for topic in topics.values()}, {"Block I", "Block II"})
            if state == "RP":
                self.assertTrue(all("Lernjahr" in topic["unit"][2] for topic in topics.values()))

    def test_primary_review_excludes_exactly_28_new_full_atom_claims_not_original_scope(self):
        decisions = authoring.SOURCE_PLAN["reviewedLowerSourceMembership"]["decisions"]
        self.assertEqual({state: set(rows) for state, rows in decisions.items()}, REVIEWED_NEW_LOWER_EXCLUSIONS)
        self.assertEqual(sum(map(len, REVIEWED_NEW_LOWER_EXCLUSIONS.values())), 28)
        for state, excluded in REVIEWED_NEW_LOWER_EXCLUSIONS.items():
            lower = self.views[f"de-{state.lower()}-seki.view.json"]
            self.assertFalse(excluded & authoring.graph.role_atoms(lower)["target"], state)
            for profile in ("gk", "lk"):
                original = authoring.MEMBERSHIPS[f"de-{state.lower()}-gym-physics-{profile}"]["sourceSelectedLowerAtomicGoalIds"]
                self.assertFalse(excluded & set(original), (state, profile))
        th = authoring.Author(self.views["de-th-gk.view.json"])
        e10 = th.find("physics-th-unit-e10")[2]
        self.assertIn("37013646-f13a-5faf-954c-940f2fd7502f", authoring.canonical_visible_atoms(e10))
        self.assertIn("af1094c1-511a-5aae-9e0a-3e9196a82d9a",
            authoring.graph.role_atoms(self.views["de-sn-seki.view.json"])["target"])

    def test_e1_source_stage_exclusions_keep_reviewed_partial_routes_and_full_view_targets(self):
        review_root = (authoring.ROOT / "curricula/DE/Gymnasium/quality/assessment-review/physik/"
                       "stage-source-route-repair-20261117-v1/e1-stage-20261124/th-mv")
        repairs = (("TH", "262f807a-30d0-503e-986f-856cbd048e8e",
                    "th-motion-laws-source-stage.review.actual.json", "upper_e10_not_lower_supplement"),
                   ("MV", "1e459a1b-4159-5049-84eb-9928129c1610",
                    "mv-velocity-time-source-scope.review.actual.json", "partial_lower_not_complete_atom"))
        for state, atom, filename, classification in repairs:
            with self.subTest(state=state, goal=atom):
                review = json.loads((review_root / filename).read_text())
                decision = authoring.SOURCE_PLAN["reviewedLowerSourceMembership"]["decisions"][state][atom]
                self.assertEqual(decision, review["approvedLowerSourceMembershipEntry"])
                self.assertEqual(decision["classification"], classification)
                self.assertEqual(decision["canonicalDescription"], authoring.graph.GOALS[atom]["description"])
                mapping = json.loads((authoring.ROOT / decision["retainedMapping"]).read_text())
                source_ids = set(decision["sourceGoalIds"])
                self.assertEqual([row for row in mapping["decisions"] if row["sourceGoalId"] in source_ids],
                                 review["reviewedRouteDecisions"])
                self.assertEqual({row["legacyGoalId"] for row in mapping["mappings"]
                                  if row["canonicalGoalId"] == atom and row["matchType"] == "partial"
                                  and row["legacyGoalId"] in source_ids}, source_ids)
                for profile in ("gk", "lk"):
                    full = self.views[f"de-{state.lower()}-{profile}.view.json"]
                    upper = self.views[f"de-{state.lower()}-sekii-{profile}.view.json"]
                    self.assertIn(atom, authoring.graph.role_atoms(full)["target"])
                    self.assertIn(atom, authoring.graph.role_atoms(upper)["target"])
                    if state == "TH":
                        for view in (full, upper):
                            e10 = authoring.Author(view).find("physics-th-unit-e10")[2]
                            self.assertIn(atom, authoring.canonical_visible_atoms(e10))
                # Rejecting a complete new lower seed must leave a valid partial
                # source correspondence and the full-view target available.
                lower = self.views[f"de-{state.lower()}-seki.view.json"]
                self.assertNotIn(atom, authoring.graph.role_atoms(lower)["target"])

    def test_owner_source_counterreview_preserves_the_corrected_by_pair_and_sn_locator(self):
        # These semantic assertions survive an ordinary source-pin refresh:
        # BY's generated view is byte-identical even with the rejected extra
        # mapping, and SN's page locator does not change any native target set.
        by = json.loads((authoring.ROOT / "curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/"
                         "bavaria_physics_source_extraction_to_canonical_physics.review.json").read_text())
        source = "f7f4e1f0-3c48-5f1c-a474-4a41ca6296b6"
        laws = "262f807a-30d0-503e-986f-856cbd048e8e"
        decision = next(row for row in by["decisions"] if row["sourceGoalId"] == source)
        self.assertEqual(decision["canonicalGoalIds"], [laws])
        self.assertEqual([(row["canonicalGoalId"], row["matchType"]) for row in by["mappings"]
                          if row["legacyGoalId"] == source], [(laws, "partial")])
        sn = json.loads((authoring.ROOT / "curricula/DE/Gymnasium/mapping/DE-SN/upper-secondary/"
                         "sn_physics_upper_secondary_source_extraction_to_canonical_physics.review.json").read_text())
        source = "sn-phys-sekii-sn-jahrgangsstufe-11-grundkurs-lb2-006-01-0369799a"
        decision = next(row for row in sn["decisions"] if row["sourceGoalId"] == source)
        self.assertEqual(decision["sourceSpan"],
                         "Jahrgangsstufe 11 Grundkurs, Anwendung der Kinematik und Dynamik, PDF-S. 48 (Druck-S. 36)")
        self.assertIn(laws, decision["canonicalGoalIds"])

    def test_source_review_cannot_remove_an_original_lower_seed_or_import_a_new_task_basis(self):
        atom = authoring.MEMBERSHIPS["de-mv-gym-physics-gk"]["sourceSelectedLowerAtomicGoalIds"][0]
        invalid = {atom: {"action": "excludeNewLowerSeed", "canonicalDescription": authoring.graph.GOALS[atom]["description"]}}
        with patch.dict(authoring.SOURCE_PLAN["reviewedLowerSourceMembership"]["decisions"], {"MV": invalid}):
            with self.assertRaisesRegex(ValueError, "cannot exclude an original lower seed"):
                authoring.reviewed_lower_source_decisions("MV", {}, {})
        without_eye = {"viewId": "test-missing-covered-basis", "scope": {"stage": "CrossStage", "jurisdiction": "DE-MV", "courseProfile": "GK"},
            "rootNodes": [authoring.graph.structure("physics-root", "Physik", [{"kind": "goalEntry", "goalId": "5c44b9ba-9b05-4774-95d5-073230d3fc4f"}])]}
        with self.assertRaisesRegex(ValueError, "cannot import a new source competency"):
            authoring.reviewed_cross_stage_tasks(without_eye, "MV")
        empty_canonical = {"viewId": "test-dormant-eye-inventory", "scope": {"stage": "CrossStage", "courseProfile": "GK"},
            "rootNodes": [authoring.graph.structure("physics-root", "Physik", [])]}
        dormant_policy = copy.deepcopy(authoring.SOURCE_PLAN["reviewedCrossStageAssessmentExposures"]["DE"][NEW_EYE_ASSESSMENT_ID])
        with patch.dict(authoring.SOURCE_PLAN["reviewedCrossStageAssessmentExposures"], {"DE": {NEW_EYE_ASSESSMENT_ID: dormant_policy}}):
            inventory, additions = authoring.reviewed_cross_stage_tasks(empty_canonical, "DE")
            self.assertEqual(additions, [])
            self.assertEqual(authoring.graph.role_atoms(inventory)["target"], set())
            self.assertEqual(authoring.graph.role_atoms(inventory)["prerequisiteOnly"], {NEW_EYE_ASSESSMENT_ID})
            dormant_policy.pop("exposureRole")
            dormant_policy["existingPreparationBasis"] = True
            with self.assertRaisesRegex(ValueError, "cannot import a new source competency"):
                authoring.reviewed_cross_stage_tasks(empty_canonical, "DE")

    def test_canonical_eye_inventory_stays_dormant_and_other_new_tasks_reuse_existing_learning(self):
        for profile in ("gk", "lk"):
            view = self.views[f"de-de-gym-physics-{profile}.view.json"]
            roles = authoring.graph.role_atoms(view)
            self.assertNotIn(NEW_EYE_ASSESSMENT_ID, roles["target"])
            self.assertIn(NEW_EYE_ASSESSMENT_ID, roles["prerequisiteOnly"])
            learning = roles["target"] | {p for t in roles["target"] for p in authoring.graph.prerequisites(t)}
            self.assertNotIn("84ddb244-e560-592f-9d43-e84c801fe5b4", learning)
            base = roles["target"] - NEW_TASK_OFFERS.keys()
            old_learning = base | {p for t in base for p in authoring.graph.prerequisites(t)}
            for task in NEW_TASK_OFFERS.keys() & roles["target"]:
                self.assertTrue(authoring.graph.prerequisites(task) <= old_learning)
            dormant = [n for n in authoring.graph.walk(view["rootNodes"]) if n.get("goalId") == NEW_EYE_ASSESSMENT_ID]
            self.assertEqual(len(dormant), 1)
            self.assertNotIn("acquisitionPlacement", dormant[0])

    def test_atom_specific_new_stage_is_not_an_unmapped_content_or_practice_default(self):
        e10 = ("SekII", "e10", "Einführungsphase: Jahrgangsstufe 10", 110)
        qualification = ("SekII", "q11-12", "Qualifikationsphase: 11/12", 111)
        topics = {"specific": {"unit": e10, "reviewedTemporalBoundary": {"goalId": "only-this-source-atom"}},
                  "regular": {"unit": qualification}}
        self.assertEqual(authoring.regular_source_default([e10, qualification], topics, "SekII"), "q11-12")
        self.assertEqual(authoring.regular_source_default([qualification, e10], topics, "SekII"), "q11-12")
        topics["ordinary-e"] = {"unit": e10}
        self.assertEqual(authoring.regular_source_default([e10, qualification], topics, "SekII"), "e10")

    def test_changed_source_pin_fails_closed(self):
        with patch.dict(authoring.SOURCE_PINS, {authoring.BY_EXTRACTION: "0" * 64}):
            with self.assertRaisesRegex(ValueError, "source changed"):
                authoring.load_pinned(authoring.BY_EXTRACTION)


if __name__ == "__main__":
    unittest.main()
