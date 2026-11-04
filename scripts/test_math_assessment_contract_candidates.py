#!/usr/bin/env python3
"""Bounded regression checks; neither activates curricula nor accepts their scope."""
import copy
from itertools import product
import json
import math
import unittest

from apply_math_assessment_contract_candidates import (
    CANONICAL, CANDIDATE, PREPARATION_CANDIDATE, EXPECTED_IDS, EXPECTED_PREPARATION_IDS, EXPECTED_FOLLOWUP_IDS,
    PRISM_ID, ROOT, apply_candidate, apply_preparation_candidate, normalized_sha, validate_graph,
)


class CandidateTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = json.loads(CANONICAL.read_text())
        cls.candidate = json.loads(CANDIDATE.read_text())
        cls.result = apply_candidate(cls.source, cls.candidate)
        cls.before = {goal['id']: goal for goal in cls.source['goals']}
        cls.after = {goal['id']: goal for goal in cls.result['goals']}

    def test_exactly_nine_existing_contracts_change_and_caterer_stays_untouched(self):
        self.assertEqual(self.source.keys(), self.result.keys())
        self.assertEqual(list(self.before), list(self.after))
        changed = {ident for ident in self.before if self.before[ident] != self.after[ident]}
        self.assertEqual(EXPECTED_IDS, changed)
        for ident in changed:
            for field in set(self.before[ident]) - {'requires', 'examData'}:
                self.assertEqual(self.before[ident][field], self.after[ident][field])
        self.assertEqual(self.before['3095e125-fbb7-51c6-bf12-ffbb1735b9b7'],
                         self.after['3095e125-fbb7-51c6-bf12-ffbb1735b9b7'])

    def test_source_drift_and_unreviewed_release_are_rejected(self):
        source = copy.deepcopy(self.source)
        next(goal for goal in source['goals'] if goal['id'] in EXPECTED_IDS)['description'] += ' changed'
        with self.assertRaisesRegex(ValueError, 'Source goal changed'):
            apply_candidate(source, self.candidate)
        candidate = copy.deepcopy(self.candidate)
        candidate['corrections'][0]['replacement']['examData']['reviewStatus'] = 'released'
        with self.assertRaisesRegex(ValueError, 'released status'):
            apply_candidate(self.source, candidate)

    def test_newton_preparation_is_not_copied_from_coverage_or_number_theory(self):
        goal = self.after['4c319dfd-ebb1-504b-a036-c780e1915900']
        self.assertEqual(7, len(goal['requires']))
        self.assertEqual(4, len(goal['examData']['coveredGoalIds']))
        self.assertNotEqual(set(goal['requires']), set(goal['examData']['coveredGoalIds']))
        self.assertFalse(set(self.before[goal['id']]['requires'][5:]) & set(goal['requires']))
        x = 2.0
        for _ in range(4):
            x -= (math.log(x) + x - 2) / (1 + 1/x)
        self.assertEqual(1.557, round(x, 3))
        self.assertLess(math.log(1.5571) + 1.5571 - 2, 0)
        self.assertGreater(math.log(1.5572) + 1.5572 - 2, 0)

    def test_q2_reuses_historical_task_and_solution_exactly(self):
        history = ROOT / 'curricula/DE/Gymnasium/quality/assessment-review/mathematik/q2-exam-pair-repair-candidate-20260929-v1/TASKS.md'
        section = history.read_text().split('## `2f8a3a90…`: Gerade, Ebene und Quader, 20 BE\n\n')[1]
        task, rest = section.split('\n\n**Lösung und Rubrik:**\n\n')
        solution = rest.split('\n\n**Vorläufige breite GK/LK-Coverage')[0]
        exam = self.after['2f8a3a90-717d-5ac1-b54e-facca26e9008']['examData']
        self.assertEqual(task, exam['taskContent'])
        self.assertEqual(solution, exam['solutionContent'])
        bounds = [6, 4, 3]
        vertices = set()
        for free in range(3):
            fixed = [i for i in range(3) if i != free]
            for endpoints in product(*[[0, bounds[i]] for i in fixed]):
                point = [0, 0, 0]
                for index, value in zip(fixed, endpoints):
                    point[index] = value
                point[free] = 9 - sum(endpoints)
                if 0 <= point[free] <= bounds[free]:
                    vertices.add(tuple(point))
        self.assertEqual({(6, 0, 3), (6, 3, 0), (5, 4, 0), (2, 4, 3)}, vertices)

    def test_integer_equations_and_linear_approximation_claims_have_independent_numeric_checks(self):
        solutions = lambda k: {(a, b) for a in range(1, 50) for b in range(1, 50) if a*b == k*(a+b)}
        self.assertEqual({(3, 6), (4, 4), (6, 3)}, solutions(2))
        self.assertEqual({(4, 12), (6, 6), (12, 4)}, solutions(3))
        p = lambda x: -0.5*x*x + 12*x
        self.assertEqual(54, p(6))
        self.assertEqual(54, p(18))
        self.assertEqual(18, p(12)-54)
        self.assertGreater(p(12)-54, 5)

    def test_applicability_dependencies_are_disclosed_without_new_profiles(self):
        derived = [row for row in self.candidate['corrections'] if row['scopeImpact']['applicabilityFromRequires']]
        self.assertEqual({'4c319dfd-ebb1-504b-a036-c780e1915900', '2f8a3a90-717d-5ac1-b54e-facca26e9008'},
                         {row['goalId'] for row in derived})
        for row in derived:
            impact = row['scopeImpact']
            self.assertEqual(impact['historicalSelectedOfferingCount'], len(impact['historicalSelectedOfferings']))
            self.assertTrue(impact['activationBlockedUntilFinalScopeReview'])

    def test_cluster_inheritance_and_cluster_prerequisite_cycles_are_rejected(self):
        for graph in [
            {'cluster': {'contains': ['atom'], 'requires': ['atom']}, 'atom': {}},
            {'cluster': {'contains': ['atom']}, 'atom': {'requires': ['cluster']}},
        ]:
            with self.assertRaisesRegex(ValueError, 'expanded atomic prerequisite cycle'):
                validate_graph(graph)

    def test_no_existing_english_task_solution_or_rubric_is_stale(self):
        for ident in EXPECTED_IDS:
            old = self.before[ident]['examData']
            self.assertNotIn('taskContentEn', old)
            self.assertNotIn('solutionContentEn', old)
            self.assertTrue(all('descriptionEn' not in step for step in old['scoring']['steps']))


class PreparationCandidateTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = json.loads(CANONICAL.read_text())
        cls.tasks = apply_candidate(cls.source, json.loads(CANDIDATE.read_text()))
        cls.candidate = json.loads(PREPARATION_CANDIDATE.read_text())
        cls.result = apply_preparation_candidate(cls.tasks, cls.candidate)
        cls.original = {goal['id']: goal for goal in cls.source['goals']}
        cls.before = {goal['id']: goal for goal in cls.tasks['goals']}
        cls.after = {goal['id']: goal for goal in cls.result['goals']}

    def test_only_eight_preparation_fields_and_the_exact_approved_prism_title_change(self):
        changed = {ident for ident in self.before if self.before[ident] != self.after[ident]}
        preparation_ids = EXPECTED_PREPARATION_IDS | EXPECTED_FOLLOWUP_IDS
        self.assertEqual(preparation_ids | {PRISM_ID}, changed)
        all_changed = {ident for ident in self.original if self.original[ident] != self.after[ident]}
        self.assertEqual(EXPECTED_IDS | preparation_ids | {PRISM_ID}, all_changed)
        for ident in preparation_ids:
            self.assertEqual({k: v for k, v in self.before[ident].items() if k != 'requires'},
                             {k: v for k, v in self.after[ident].items() if k != 'requires'})
        self.assertEqual('492f5894972acf0623fbefd4171d502488b320353a61467bbebb34c079604653',
                         normalized_sha(self.after[PRISM_ID]))

    def test_exactly_eleven_bad_edges_are_removed_and_other_existing_requirements_remain(self):
        expected = {
            'dd6c5e08-0cc6-53c0-b317-ebaba277c776': {'b9bbd2a8-1379-5ffb-817f-41467d48abef', '858113c5-e53b-57bb-b01f-ba95c3ddcb6f'},
            '772b11c9-1348-5ab9-bc3f-458c46b312b6': {'b9bbd2a8-1379-5ffb-817f-41467d48abef', '858113c5-e53b-57bb-b01f-ba95c3ddcb6f'},
            'c72a8032-71f6-56ed-a896-06ae435ff2ec': {'3bf1ce9e-f4d3-502e-9d6e-94f7b7f697d4'},
            'd4f2d4e2-a831-5ee2-b9c6-bb9e79986aeb': {'8e1b0d9c-fa32-5ccd-9c11-77e788ae0941', 'b3604df4-15a8-41c8-a8b0-50dadd698bd3', 'f042385e-f772-42db-9c96-f21a792ac5ea'},
            'baf7276f-60a0-4d96-b959-d63acfb929de': {'36e0de23-1e3b-5c69-888f-e5e19e79cbbe'},
            '5dabf0b3-89b1-59a6-ae57-014f92becd3b': {'b9bbd2a8-1379-5ffb-817f-41467d48abef', '858113c5-e53b-57bb-b01f-ba95c3ddcb6f'},
        }
        for ident, removed in expected.items():
            before, after = set(self.before[ident]['requires']), set(self.after[ident]['requires'])
            self.assertEqual(removed, before - after)
            self.assertLessEqual(before - removed, after)
        for ident in EXPECTED_IDS:
            self.assertEqual(self.before[ident], self.after[ident], 'Previously reviewed endpoint bytes must remain exact')

    def test_nondifferentiable_graphs_and_sqrt_values_are_real_counterexamples_to_calculus_demand(self):
        for x in [-2, -1, 0, 1, 2]:
            self.assertEqual(abs(x)+3, abs((x+2)-2)+3)
            self.assertEqual(2*abs(x), 2*abs((3*x)/3))
        self.assertNotEqual(abs(1)/1, abs(-1)/-1, 'The kink lacks a common derivative but still transforms')
        self.assertEqual([0, 1, 2, 3], [math.sqrt(x) for x in [0, 1, 4, 9]])
        with self.assertRaises(ValueError):
            math.sqrt(-1)
        # A domain and coordinate construction uses the root definition, not an integral.

    def test_composition_extremum_model_and_line_plane_intersection_need_no_removed_special_method(self):
        for x in [-10, 0, 6]:
            self.assertAlmostEqual(math.log(2*math.exp(x/2)), math.log(2)+x/2)
        for x in [1, 6, 10, 15, 19]:
            self.assertEqual(40*x-2*x*x, 200-2*(x-10)**2)
        t = (9-6)/2
        self.assertEqual((4, 0.5, 4.5), (1+2*t, 2-t, 3+t))

    def test_complete_context_delta_is_exact_without_hiding_real_calculus_or_polyhedron_support(self):
        before_edges, after_edges = validate_graph(self.before), validate_graph(self.after)
        def context(ident, edges):
            found, pending = set(), [ident]
            while pending:
                current = pending.pop()
                if current not in found:
                    found.add(current)
                    pending.extend(edges[current])
            return found
        for row in self.candidate['allOpenPreparationContextDeltas']:
            before, after = context(row['goalId'], before_edges), context(row['goalId'], after_edges)
            self.assertEqual(set(row['removedGoalIds']), before-after)
            self.assertEqual(set(row['addedGoalIds']), after-before)
            self.assertEqual(row['beforeAtomicContextCount'], len(before))
            self.assertEqual(row['afterAtomicContextCount'], len(after))
        dd6 = 'dd6c5e08-0cc6-53c0-b317-ebaba277c776'
        self.assertIn('b9bbd2a8-1379-5ffb-817f-41467d48abef', context(dd6, before_edges))
        self.assertNotIn('b9bbd2a8-1379-5ffb-817f-41467d48abef', context(dd6, after_edges))
        self.assertNotIn('858113c5-e53b-57bb-b01f-ba95c3ddcb6f',
                         context('c72a8032-71f6-56ed-a896-06ae435ff2ec', after_edges))
        self.assertIn('858113c5-e53b-57bb-b01f-ba95c3ddcb6f',
                      context('450a77d6-2814-571a-af1e-78c9fa61ed2c', after_edges))
        self.assertIn('3aea4d33-4170-5ecc-82b0-3a3974cc2237',
                      context('2f8a3a90-717d-5ac1-b54e-facca26e9008', after_edges))
        self.assertFalse(self.candidate['scopeBoundary']['activationAllowed'])

    def test_immediate_consumers_are_disclosed_and_preparation_source_drift_is_rejected(self):
        for row in self.candidate['preparationCorrections']:
            self.assertEqual({ident for ident, goal in self.before.items() if row['goalId'] in goal.get('requires', [])},
                             {item['goalId'] for item in row['immediateConsumers']})
        source = copy.deepcopy(self.tasks)
        next(goal for goal in source['goals'] if goal['id'] in EXPECTED_PREPARATION_IDS)['description'] += ' changed'
        with self.assertRaisesRegex(ValueError, 'Preparation source changed'):
            apply_preparation_candidate(source, self.candidate)

    def test_three_exact_reviewed_followups_preserve_broad_contracts_and_close_named_paths(self):
        for row in self.candidate['localFollowupCorrections']:
            self.assertEqual(row['replacementRequires'], self.after[row['goalId']]['requires'])
            self.assertEqual(row['independentlyApprovedAfterGoalSha256'], normalized_sha(self.after[row['goalId']]))
        for ident in ['628928a6-4f48-54dc-952d-dec0e69dc856', '07196e72-ba47-54bf-a096-3a79bbb67e23',
                      'bd3576b8-f4e5-542a-a8a2-74524d9cee21']:
            self.assertEqual(self.original[ident], self.after[ident])
        expected = {
            'bd2c5e29-31c6-58bf-9858-d08e9c8a32ad': (82, 76),
            '450a77d6-2814-571a-af1e-78c9fa61ed2c': (105, 71),
            '2f8a3a90-717d-5ac1-b54e-facca26e9008': (32, 28),
        }
        for row in self.candidate['localFollowupPreparationContextDeltas']:
            self.assertEqual(expected[row['goalId']], (row['beforeAtomicContextCount'], row['afterAtomicContextCount']))


if __name__ == '__main__':
    unittest.main()
