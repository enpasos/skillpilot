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
    "MV": {"3b7b2b62-e39c-5936-b0d8-5406206e57b6", "e6a89922-75ce-53dd-9e7b-3a683398431c"},
    "HH": {"797f5e93-b5fd-5ee3-9fb2-fcc9e1d12a00", "884bd99b-2373-5174-af7c-c6813b91bd93"},
    "SL": {"ef2bb474-89e1-5deb-81c4-c6b05d174bbd", "44ada28b-8635-5481-8d09-2d91686d352b", "11c964ff-be82-5d02-8cd7-ccb41cda8f4f", "e0932fef-9e1c-5c95-b00c-7589e76d0e83", "3b7b2b62-e39c-5936-b0d8-5406206e57b6", "bff1d8b0-fe2e-52e6-a467-dd0b6a1a4a04", "f602680f-ea75-5bed-ae87-72f6be34a99b"},
    "SN": {"11c964ff-be82-5d02-8cd7-ccb41cda8f4f", "e0932fef-9e1c-5c95-b00c-7589e76d0e83", "f41e4e30-794e-5ce4-ba5e-cc72712cd691", "7cfaf48e-e420-5c09-8ec2-932f0dba4d08", "57a03b38-5ec5-5e4f-b71a-4024bab1584c", "bff1d8b0-fe2e-52e6-a467-dd0b6a1a4a04", "f602680f-ea75-5bed-ae87-72f6be34a99b", "a8dc0290-9f80-5763-8943-e16b8d2aa860"},
    "ST": {"ef2bb474-89e1-5deb-81c4-c6b05d174bbd", "44ada28b-8635-5481-8d09-2d91686d352b", "7cfaf48e-e420-5c09-8ec2-932f0dba4d08"},
    "TH": {"14cc61c4-4909-5671-b1ee-930a02cb9f51", "7cfaf48e-e420-5c09-8ec2-932f0dba4d08"},
}
NEW_TASK_OFFERS = {
    "3b7b2b62-e39c-5936-b0d8-5406206e57b6": {"DE-MV", "DE-SL"},
    "e6a89922-75ce-53dd-9e7b-3a683398431c": {"DE-MV"},
    "f41e4e30-794e-5ce4-ba5e-cc72712cd691": {"DE-SN"},
    "7cfaf48e-e420-5c09-8ec2-932f0dba4d08": {"DE-SN", "DE-ST", "DE-TH"},
    "57a03b38-5ec5-5e4f-b71a-4024bab1584c": {"DE-SN"},
    "797f5e93-b5fd-5ee3-9fb2-fcc9e1d12a00": {"DE-HH"},
    "884bd99b-2373-5174-af7c-c6813b91bd93": {"DE-HH"},
    "bff1d8b0-fe2e-52e6-a467-dd0b6a1a4a04": {"DE-SL", "DE-SN"},
    "f602680f-ea75-5bed-ae87-72f6be34a99b": {"DE-SL", "DE-SN"},
}
LK_ONLY_NEW_TASKS = {"797f5e93-b5fd-5ee3-9fb2-fcc9e1d12a00", "884bd99b-2373-5174-af7c-c6813b91bd93"}

NEW_EYE_ASSESSMENT_ID = "3b7b2b62-e39c-5936-b0d8-5406206e57b6"
REVIEWED_NEW_LOWER_EXCLUSIONS = {
    "MV": {"09029573-864f-40ca-bf8a-cee7bf6dcb73", "156edddc-ce8d-580d-8d17-d9376d59e60e", "bf8517a9-142b-5789-826a-767f3b277998", "e4b38061-1f28-43ad-8371-a3e7c0e81856", "e918b31f-6f39-5dee-ade6-3617080fb24f", "ec7a0a68-730b-5c94-ac72-a937508f8303"},
    "SL": {"09029573-864f-40ca-bf8a-cee7bf6dcb73", "156edddc-ce8d-580d-8d17-d9376d59e60e", "2b700858-bc2e-5ddf-a791-b14d44160480", "bf8517a9-142b-5789-826a-767f3b277998", "e4b38061-1f28-43ad-8371-a3e7c0e81856", "e6a50c74-c922-508c-aa27-07bac2566955", "e918b31f-6f39-5dee-ade6-3617080fb24f", "eb30189c-27c6-510b-b235-6543afa18b90", "ec7a0a68-730b-5c94-ac72-a937508f8303"},
    "SN": {"156edddc-ce8d-580d-8d17-d9376d59e60e", "84ddb244-e560-592f-9d43-e84c801fe5b4", "8ac61062-f63e-5935-96ae-84014906c368", "bf8517a9-142b-5789-826a-767f3b277998", "bfea7a23-1ce1-4a42-badd-1fc9bf30124a", "e6a50c74-c922-508c-aa27-07bac2566955", "e918b31f-6f39-5dee-ade6-3617080fb24f", "eb30189c-27c6-510b-b235-6543afa18b90", "ec7a0a68-730b-5c94-ac72-a937508f8303"},
    "ST": {"bf8517a9-142b-5789-826a-767f3b277998"},
    "TH": {"37013646-f13a-5faf-954c-940f2fd7502f"},
}


def ancestors(unit, pairs):
    found, pending = set(), [a for u, a in pairs if u == unit]
    while pending:
        previous = pending.pop()
        if previous not in found:
            found.add(previous)
            pending.extend(a for u, a in pairs if u == previous)
    return found


class PhysicsStageAuthoring(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.views = {path.name: json.loads(path.read_text()) for path in authoring.DIRECTORY.glob("*.view.json")}
        cls.authorities = json.loads((authoring.ROOT / "scripts/generate_laender_physics_stage_views.memberships.json").read_text())["authorities"]

    def test_original_full_authorities_keep_exact_seed_sets_and_old_support_roles(self):
        for view in self.views.values():
            baseline = self.authorities.get(view["viewId"])
            if baseline is None:
                continue
            with self.subTest(view=view["viewId"]):
                roles = authoring.graph.role_atoms(view)
                allowed_new_task = set()
                stage = view["scope"]["stage"]
                state = view["scope"].get("jurisdiction", "DE")
                if stage == "CrossStage":
                    allowed_new_task = (set(NEW_TASK_OFFERS) - {NEW_EYE_ASSESSMENT_ID} if state == "DE" else
                        {task for task, states in NEW_TASK_OFFERS.items() if state in states})
                    if view["scope"]["courseProfile"] == "GK":
                        allowed_new_task -= LK_ONLY_NEW_TASKS
                    if state in ("DE-SL", "DE-ST"):
                        allowed_new_task |= {"ef2bb474-89e1-5deb-81c4-c6b05d174bbd", "44ada28b-8635-5481-8d09-2d91686d352b"}
                if state == "DE-HE" and stage in ("CrossStage", "SekII"):
                    allowed_new_task.update(authoring.graph.HESSEN_E1_ASSESSMENTS)
                self.assertTrue(allowed_new_task <= roles["target"])
                retained = roles["target"] - allowed_new_task
                variants = authoring.graph.HESSEN_E1_CHILD_ASSESSMENT_VARIANTS
                if state == "DE-HE" and stage in ("CrossStage", "SekII"):
                    self.assertTrue(set(variants.values()) <= retained)
                    self.assertTrue(set(variants).isdisjoint(retained))
                    retained = (retained - set(variants.values())) | set(variants)
                else:
                    self.assertTrue(set(variants.values()).isdisjoint(roles["target"] | roles["prerequisiteOnly"]))
                digest = hashlib.sha256(("\n".join(sorted(retained)) + "\n").encode()).hexdigest()
                self.assertEqual(digest, baseline["selectedAtomicSha256"])
                self.assertEqual(len(retained), baseline["selectedAtomicCount"])
                self.assertTrue(set(baseline["prerequisiteOnlyAtomicGoalIds"]) <= roles["prerequisiteOnly"])

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

    def test_horizontal_throw_assessment_follows_its_assessed_modeling_competency(self):
        task, covered = "6ea3fb3c-abdc-568f-ab13-97c36dc274e4", "d6dc0e02-831d-4894-a61a-852bcc74f147"
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

    def test_primary_review_excludes_exactly_26_new_full_atom_claims_not_original_scope(self):
        decisions = authoring.SOURCE_PLAN["reviewedLowerSourceMembership"]["decisions"]
        self.assertEqual({state: set(rows) for state, rows in decisions.items()}, REVIEWED_NEW_LOWER_EXCLUSIONS)
        self.assertEqual(sum(map(len, REVIEWED_NEW_LOWER_EXCLUSIONS.values())), 26)
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
