#!/usr/bin/env python3
"""Bounded content/authoring regressions; no source, placement or activation approval."""
import copy
from fractions import Fraction
import hashlib
import json
import math
import unittest

from apply_math_assessment_contract_candidates import ROOT, validate_graph
from apply_math_upper_assessment_candidates import (
    BASE, BASE_SHA, EXPECTED_CASES, PATCH, REVIEW, REVIEW_SHA, SUPPORT_SPECS,
    UNCHANGED_ENDPOINT_CASES, apply_candidate,
)


def reach(roots, edges):
    found, pending = set(), list(roots)
    while pending:
        ident = pending.pop()
        if ident not in found:
            found.add(ident)
            pending.extend(edges[ident])
    return found


def binomial_cdf(n, p, k):
    term = (1-p)**n
    total = term
    for j in range(1, k+1):
        term *= (n-j+1)/j*p/(1-p)
        total += term
    return total


def raw_goals(text):
    decoder = json.JSONDecoder()
    offset = text.index('"goals": [') + len('"goals": [')
    result = {}
    while True:
        while text[offset].isspace() or text[offset] == ',':
            offset += 1
        if text[offset] == ']':
            return result
        goal, end = decoder.raw_decode(text, offset)
        result[goal['id']] = text[offset:end].encode()
        offset = end


class UpperCandidateTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = json.loads(BASE.read_text())
        cls.patch = json.loads(PATCH.read_text())
        cls.review = json.loads(REVIEW.read_text())
        cls.result = apply_candidate(cls.source, cls.patch)
        cls.before = {goal['id']: goal for goal in cls.source['goals']}
        cls.after = {goal['id']: goal for goal in cls.result['goals']}
        cls.before_edges, cls.after_edges = validate_graph(cls.before), validate_graph(cls.after)

    def goal(self, prefix, after=True):
        return next(goal for ident, goal in (self.after if after else self.before).items() if ident.startswith(prefix))

    def test_exact_base_and_review_are_bound_without_modifying_the_live_canon(self):
        self.assertEqual(BASE_SHA, hashlib.sha256(BASE.read_bytes()).hexdigest())
        self.assertEqual(REVIEW_SHA, hashlib.sha256(REVIEW.read_bytes()).hexdigest())
        live = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
        self.assertEqual('2888d646a6730203a56cfb8f41fa3bad1388ba3e303b0c8f04f9df9142066986',
                         hashlib.sha256(live.read_bytes()).hexdigest())

    def test_only_24_endpoint_objects_and_five_exact_support_consumers_change(self):
        changed = {ident for ident in self.before if self.before[ident] != self.after[ident]}
        rows = self.patch['corrections']
        endpoint_ids = {row['goalId'] for row in rows if row['replacement']}
        support_ids = {row['goalId'] for row in self.patch['supportCorrections']}
        self.assertEqual(29, len(changed))
        self.assertEqual(24, len(endpoint_ids))
        self.assertEqual(set(SUPPORT_SPECS), {ident[:8] for ident in support_ids})
        self.assertEqual(changed, endpoint_ids | support_ids)
        for ident in self.before:
            if ident not in changed:
                self.assertEqual(self.before[ident], self.after[ident])
        for ident in support_ids:
            self.assertEqual({key: value for key, value in self.before[ident].items() if key != 'requires'},
                             {key: value for key, value in self.after[ident].items() if key != 'requires'})
        self.assertEqual({key: value for key, value in self.source.items() if key != 'goals'},
                         {key: value for key, value in self.result.items() if key != 'goals'})
        for row in rows:
            before, after = self.before[row['goalId']], self.after[row['goalId']]
            for key in ['contains', 'phase', 'level', 'core', 'tags', 'weight', 'extendedData', 'provenance', 'sourceMappings']:
                self.assertEqual(before.get(key), after.get(key), (row['caseIndex'], key))

    def test_all_67_pass_goal_objects_are_byte_identical_in_the_exported_candidate(self):
        before = raw_goals(BASE.read_text())
        after = raw_goals(json.dumps(self.result, ensure_ascii=False, indent=2) + '\n')
        passed = [case['goalId'] for case in self.review['cases'] if case['verdict'] == 'PASS']
        self.assertEqual(67, len(passed))
        for ident in passed:
            self.assertEqual(before[ident], after[ident], ident)

    def test_prior_nine_and_twenty_one_corrections_and_existing_415bd_fix_remain_exact(self):
        for name in ['candidate-corrections.json', 'candidate-seki-corrections.json']:
            prior = json.loads((PATCH.parent / name).read_text())
            for row in prior['corrections']:
                self.assertEqual(self.before[row['goalId']], self.after[row['goalId']])
        self.assertEqual(self.goal('415bd', False), self.goal('415bd'))
        self.assertNotIn('f0a49da2-018b-4cda-adbd-27047b610a0f', self.goal('415bd')['requires'])
        for row in self.patch['corrections']:
            if row['caseIndex'] in UNCHANGED_ENDPOINT_CASES:
                self.assertEqual({}, row['replacement'])
                self.assertEqual(self.before[row['goalId']], self.after[row['goalId']])

    def test_binary_thresholds_point_allocations_and_source_artifacts_are_preserved(self):
        changed_payloads = 0
        for row in self.patch['corrections']:
            old, new = self.before[row['goalId']]['examData'], self.after[row['goalId']]['examData']
            if old == new:
                continue
            changed_payloads += 1
            self.assertEqual('draft', new['reviewStatus'])
            for key in ['maxPoints', 'passingPoints']:
                self.assertEqual(old['scoring'][key], new['scoring'][key])
            self.assertEqual([(step['id'], step['points']) for step in old['scoring']['steps']],
                             [(step['id'], step['points']) for step in new['scoring']['steps']])
            self.assertEqual(old.get('sourceArtifactPath'), new.get('sourceArtifactPath'))
        self.assertEqual(22, changed_payloads)
        for artifact in self.patch['historicalArtifacts']:
            self.assertEqual(artifact['sha256'], hashlib.sha256((ROOT/artifact['path']).read_bytes()).hexdigest())

    def test_metadata_and_existing_language_fields_stay_consistent(self):
        self.assertIn('Level 1', self.goal('57c6506d')['titleEn'])
        self.assertNotIn('Hypothese', self.goal('c2f6b981')['description'])
        self.assertIn('conditional', self.goal('c2f6b981')['descriptionEn'])
        self.assertIn('rechnerisch', self.goal('296fdd9f')['title'])
        self.assertNotIn('eigenen Modellierungen', self.goal('81823f27')['description'])
        self.assertNotIn('Baumdiagramm', self.goal('77940875')['description'])
        for row in self.patch['corrections']:
            old, new = self.before[row['goalId']]['examData'], self.after[row['goalId']]['examData']
            for field in ['taskContent', 'solutionContent']:
                if old.get(field+'En') and old[field] != new[field]:
                    self.assertTrue(new.get(field+'En'))
                    self.assertNotEqual(old[field+'En'], new[field+'En'])
                if not old.get(field+'En'):
                    self.assertNotIn(field+'En', new)

    def test_parallelogram_proof_does_not_assume_the_desired_diagonal_bisection(self):
        a, b, d = (2, 5), (8, 6), (5, 11)
        c = tuple(b[i]+d[i]-a[i] for i in range(2))
        midpoint_ac = tuple(Fraction(a[i]+c[i], 2) for i in range(2))
        midpoint_bd = tuple(Fraction(b[i]+d[i], 2) for i in range(2))
        self.assertEqual(midpoint_ac, midpoint_bd)
        solution = self.goal('4a906a0c')['examData']['solutionContent']
        self.assertLess(solution.index(r'\vec a+\vec c=\vec b+\vec d'), solution.index('Erst daraus folgt'))
        self.assertIn('Nichtzirkulär', self.goal('4a906a0c')['examData']['scoring']['steps'][0]['description'])

    def test_markov_square_is_strictly_positive_and_the_stationary_vector_is_exact(self):
        matrix = [[Fraction(6,10), Fraction(1,10), 0], [Fraction(3,10), Fraction(7,10), Fraction(2,10)],
                  [Fraction(1,10), Fraction(2,10), Fraction(8,10)]]
        square = [[sum(matrix[i][k]*matrix[k][j] for k in range(3)) for j in range(3)] for i in range(3)]
        self.assertTrue(all(value > 0 for row in square for value in row))
        fixed = [Fraction(20000,19), Fraction(80000,19), Fraction(90000,19)]
        self.assertEqual(fixed, [sum(matrix[i][j]*fixed[j] for j in range(3)) for i in range(3)])
        self.assertEqual(10000, sum(fixed))
        # A periodic chain has a stationary vector without convergence of all trajectories.
        flip = lambda v: [v[1], v[0]]
        self.assertEqual([Fraction(1,2)]*2, flip([Fraction(1,2)]*2))
        self.assertNotEqual(flip([1,0]), flip(flip([1,0])))
        self.assertIn('ausschließlich positive Einträge', self.goal('000b2764')['examData']['solutionContent'])
        self.assertIn('strictly positive entries', self.goal('000b2764')['examData']['solutionContentEn'])

    def test_screening_cohort_and_conditional_independence_match_the_preserved_quantile(self):
        data = self.goal('6eb917e6')['examData']
        self.assertIn('nicht infizierten Proben', data['taskContent'])
        self.assertIn('non-infected samples', data['taskContentEn'])
        self.assertIn('bedingter Unabhängigkeit', data['taskContent'])
        self.assertIn('conditionally independent given infection status', data['solutionContentEn'])
        self.assertLess(binomial_cdf(2000, .02, 50), .95)
        self.assertGreaterEqual(binomial_cdf(2000, .02, 51), .95)
        self.assertGreaterEqual(binomial_cdf(2000, .995*.02, 50), .95)
        posterior = .005*.99**2/(.005*.99**2+.995*.02**2)
        self.assertGreater(posterior, .9)

    def test_graph_derivative_prompt_only_demands_the_determined_sign(self):
        data = self.goal('87ce54e8')['examData']
        self.assertIn('welches Vorzeichen', data['taskContent'])
        self.assertIn('sign of the slope', data['taskContentEn'])
        self.assertTrue(all(-4*a < 0 for a in [.1, 1, 7]))
        self.assertNotEqual(-4*.1, -4*7)
        self.assertIn('nicht gegebenen', data['solutionContent'])

    def test_exponential_threshold_uses_the_unrounded_factor_and_strict_inequality(self):
        a = 1.96**.25
        threshold = math.log(4)/math.log(a)
        doubling = math.log(2)/math.log(a)
        self.assertAlmostEqual(8.24017086842458, threshold)
        self.assertAlmostEqual(4.12008543421229, doubling)
        self.assertAlmostEqual(2000, 500*a**threshold)
        self.assertGreater(500*a**(threshold+.001), 2000)
        self.assertLess(500*a**(threshold-.001), 2000)
        solution = self.goal('c87597fd')['examData']['solutionContent']
        self.assertIn('8{,}2401708684', solution)
        self.assertIn('t>t_*', solution)
        self.assertIn('4{,}1200854342', solution)

    def test_trigonometric_interval_ends_at_nineteen_seconds(self):
        left = 5+20/math.pi*math.asin(.8)
        right = 5+20/math.pi*(math.pi-math.asin(.8))
        height = lambda t: 12+10*math.sin(math.pi/20*(t-5))
        self.assertAlmostEqual(20, height(left))
        self.assertAlmostEqual(20, height(right))
        self.assertGreater(height(15), 20)
        self.assertLess(height(25), 20)
        solution = self.goal('3b1f0646')['examData']['solutionContent']
        self.assertIn('19{,}10', solution)
        self.assertNotIn('29{,}10', solution)

    def test_newton_iteration_uses_exact_intermediate_values(self):
        f = lambda x: x**3-x-1
        x0 = Fraction(3,2)
        x1 = x0-f(x0)/(3*x0*x0-1)
        x2 = x1-f(x1)/(3*x1*x1-1)
        self.assertEqual(Fraction(31,23), x1)
        self.assertEqual(Fraction(1225,12167), f(x1))
        self.assertEqual(Fraction(71749,54142), x2)
        self.assertAlmostEqual(.100566091352, float(f(Fraction(6739,5000))))
        solution = self.goal('78f5003e')['examData']['solutionContent']
        self.assertIn(r'\frac{71749}{54142}', solution)
        self.assertIn('1{,}3252003990', solution)
        self.assertNotIn('0{,}1003', solution)

    def test_real_tool_action_is_scored_and_extrema_have_sufficient_tests(self):
        data = self.goal('c4cf4273')['examData']
        self.assertIn('Verwenden Sie selbst ein digitales Werkzeug', data['taskContent'])
        self.assertIn('reproduzierbaren Eingaben', data['taskContent'])
        self.assertIn('Eigene Werkzeughandlung belegt', data['scoring']['steps'][3]['description'])
        self.assertIn("f''(0)=-8<0", data['solutionContent'])
        self.assertIn("f''(\\pm\\sqrt2)=16>0", data['solutionContent'])
        f = lambda x: x**4-4*x*x+1
        for value in [math.sqrt(2-math.sqrt(3)), math.sqrt(2+math.sqrt(3))]:
            self.assertAlmostEqual(0, f(value))
            self.assertAlmostEqual(0, f(-value))

    def test_equivalent_correct_integration_methods_remain_accepted(self):
        data = self.goal('226e5c66')['examData']
        self.assertIn('partieller Integration', data['scoring']['steps'][1]['description'])
        self.assertIn('gleichwertige Verfahren anerkennen', data['scoring']['steps'][1]['description'])
        # Parts: [(2x+3)e^x]_0^1 - 2[e^x]_0^1; ansatz: [(2x+1)e^x]_0^1.
        self.assertAlmostEqual(3*math.e-1, (5*math.e-3)-2*(math.e-1))

    def test_direction_field_is_an_actual_scored_task_and_second_order_is_absent(self):
        data = self.goal('97fb270f')['examData']
        self.assertIn('zwölf Punkten', data['taskContent'])
        slopes = {(t, temperature): -.25*(temperature-20)
                  for t in [0,2,4] for temperature in [0,20,40,80]}
        self.assertEqual(12, len(slopes))
        self.assertEqual({5,0,-5,-15}, set(slopes.values()))
        self.assertIn('Richtungsfeld mit zwölf', data['scoring']['steps'][3]['description'])
        self.assertIn('963907f9-8d4c-5e1c-945d-10b7be07e1b9', data['coveredGoalIds'])
        self.assertNotIn('58fda9b4-4336-5594-99ce-722c4a453372', data['coveredGoalIds'])

    def test_given_matrix_maps_to_a_right_triangle_with_area_factor_two(self):
        p, q, r = (0,0), (2,0), (2,2)
        self.assertEqual(0, (p[0]-q[0])*(r[0]-q[0])+(p[1]-q[1])*(r[1]-q[1]))
        area = abs((q[0]-p[0])*(r[1]-p[1])-(r[0]-p[0])*(q[1]-p[1]))/2
        self.assertEqual(2, area)
        self.assertIn('weiterhin rechtwinklig', self.goal('81823f27')['examData']['solutionContent'])
        self.assertIn('4d331ba0-56d6-5730-a51b-e3d1126b31ba', self.goal('81823f27')['requires'])

    def test_five_percent_test_uses_fourteen_not_thirteen_and_narrow_coverage(self):
        alpha13, alpha14 = 1-binomial_cdf(400,.02,12), 1-binomial_cdf(400,.02,13)
        self.assertAlmostEqual(.0618585041628486, alpha13)
        self.assertAlmostEqual(.032697854304425, alpha14)
        self.assertGreater(alpha13, .05)
        self.assertLess(alpha14, .05)
        self.assertGreater(13.5, 8+1.645*2.8)
        self.assertLess(12.5, 8+1.645*2.8)
        goal = self.goal('99e45593')
        self.assertEqual({'f14e1643', '677be619', '0a7ff229'}, {ref[:8] for ref in goal['examData']['coveredGoalIds']})
        self.assertIn('4b58b855-cd26-538c-8e6f-304f4cfd8ad6', goal['requires'])
        self.assertNotIn('4b58b855-cd26-538c-8e6f-304f4cfd8ad6', goal['examData']['coveredGoalIds'])
        self.assertIn('X\\ge14', goal['examData']['solutionContent'])

    def test_binomial_and_poisson_assumptions_are_explicit_without_simulation_credit(self):
        binomial = self.goal('9cf020ee')['examData']
        self.assertIn('annähernd unabhängig', binomial['solutionContent'])
        self.assertIn('dieselbe Verspätungswahrscheinlichkeit', binomial['solutionContent'])
        poisson = self.goal('c83dc2d1')['examData']
        self.assertIn('zusätzlich als unabhängig angenommen', poisson['taskContent'])
        self.assertIn('ohne zeitliche Reihenfolge', poisson['solutionContent'])
        self.assertIn('beweist jedoch nicht die Unabhängigkeit', poisson['solutionContent'])
        self.assertEqual({'84069c5e', 'c9a897ca'}, {ref[:8] for ref in poisson['coveredGoalIds']})

    def test_support_repairs_preserve_real_derivative_edges_and_do_not_mutate_their_goals(self):
        for prefix in ['6517427b', '62a1c6f2', '28cdee95']:
            self.assertEqual(self.goal(prefix, False), self.goal(prefix))
        for prefix in ['6517427b', '62a1c6f2']:
            self.assertIn('858113c5-e53b-57bb-b01f-ba95c3ddcb6f', self.goal(prefix)['requires'])
        for prefix in ['c87597fd', '97fb270f', 'e45a39e5']:
            context = reach([self.goal(prefix)['id']], self.after_edges)
            self.assertFalse(any(ref.startswith('858113c5') or ref.startswith('b9bbd2a8') for ref in context))
        for prefix in ['bbb340ed', '46bb8422']:
            self.assertIn('858113c5-e53b-57bb-b01f-ba95c3ddcb6f',
                          reach([self.goal(prefix)['id']], self.after_edges))

    def test_true_route_losses_and_all_95_context_deltas_are_visible(self):
        expected = []
        for case in self.review['cases']:
            ident = case['goalId']
            a, b = reach([ident], self.before_edges), reach([ident], self.after_edges)
            if a != b:
                expected.append({'goalId': ident, 'caseIndex': case['caseIndex'],
                                 'removedGoalIds': sorted(a-b), 'addedGoalIds': sorted(b-a)})
        self.assertEqual(expected, self.patch['contextDelta']['changedContextsOf95'])
        self.assertEqual(19, len(expected))
        roots = {ident for ident, goal in self.before.items() if ident in self.before_edges
                 and (goal.get('examData') is not None or goal.get('nodeKind') in ['memory', 'exam'])}
        lost = reach(roots, self.before_edges)-reach(roots, self.after_edges)
        self.assertEqual(37, len(lost))
        self.assertEqual(lost, set(self.patch['contextDelta']['newlyUnreachableFromAllCanonicalProtectedRoots']))
        self.assertTrue(all(self.after[ident].get('examData') is None for ident in lost))
        impact = self.patch['contextDelta']['applicabilityFromRequiresAffected']
        self.assertEqual({'34dc8c9b', 'e457af0b', 'bbb340ed', '46bb8422'}, {row['goalId'][:8] for row in impact})
        self.assertTrue(all(row['directRequiresBefore'] == row['directRequiresAfter'] for row in impact))
        # The PASS endpoint's own task is unchanged; its corrected support closure is disclosed separately.
        self.assertEqual(self.goal('e457af0b', False), self.goal('e457af0b'))

    def test_source_drift_publication_threshold_and_unreviewed_relation_changes_fail_closed(self):
        document = copy.deepcopy(self.source)
        document['description'] += ' changed'
        with self.assertRaisesRegex(ValueError, 'shared offline base'):
            apply_candidate(document, self.patch)
        for mutate, pattern in [
            (lambda p: p['corrections'].pop(), '28 reviewed'),
            (lambda p: p['corrections'][1]['replacement']['examData'].update(reviewStatus='released'), 'remain draft'),
            (lambda p: p['corrections'][1]['replacement']['examData']['scoring'].update(passingPoints=1), 'threshold'),
            (lambda p: p['corrections'][1]['replacement']['examData'].update(sourceArtifactPath='changed.md'), 'field addition'),
            (lambda p: p['corrections'][1]['replacement'].update(requires=[self.goal('858113c5')['id']]), 'Preparation differs'),
            (lambda p: p['supportCorrections'][0]['replacementRequires'].append(self.goal('b9bbd2a8')['id']), 'support edge'),
        ]:
            patch = copy.deepcopy(self.patch)
            mutate(patch)
            with self.assertRaisesRegex(ValueError, pattern):
                apply_candidate(self.source, patch)


if __name__ == '__main__':
    unittest.main()
