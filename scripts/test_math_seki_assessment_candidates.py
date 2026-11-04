#!/usr/bin/env python3
"""Bounded authoring regressions; no scope, source or activation acceptance."""
import copy
from decimal import Decimal
import hashlib
import json
import math
import unittest
import xml.etree.ElementTree as ET

from apply_math_seki_assessment_candidates import BASE, PATCH, EXPECTED_PREFIXES, SUPPORT_ID, REMOVED_SUPPORT, apply_candidate
from apply_math_assessment_contract_candidates import ROOT, validate_graph


class SekICandidateTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = json.loads(BASE.read_text())
        cls.patch = json.loads(PATCH.read_text())
        cls.result = apply_candidate(cls.source, cls.patch)
        cls.before = {goal['id']: goal for goal in cls.source['goals']}
        cls.after = {goal['id']: goal for goal in cls.result['goals']}

    def goal(self, prefix, after=True):
        return next(goal for ident, goal in (self.after if after else self.before).items() if ident.startswith(prefix))

    def test_only_21_existing_cases_and_the_exact_shared_support_field_change(self):
        changed = {ident for ident in self.before if self.before[ident] != self.after[ident]}
        self.assertEqual(22, len(changed))
        self.assertEqual(EXPECTED_PREFIXES, {ident[:8] for ident in changed - {SUPPORT_ID}})
        for ident in changed - {SUPPORT_ID}:
            allowed = {'title'} if ident.startswith('4ef1ec52') else {'requires', 'examData'}
            self.assertEqual({k: v for k, v in self.before[ident].items() if k not in allowed},
                             {k: v for k, v in self.after[ident].items() if k not in allowed})
        for ident in self.before:
            if ident not in changed:
                self.assertEqual(self.before[ident], self.after[ident])
        self.assertEqual(self.before[REMOVED_SUPPORT], self.after[REMOVED_SUPPORT])
        self.assertEqual([ref for ref in self.before[SUPPORT_ID]['requires'] if ref != REMOVED_SUPPORT],
                         self.after[SUPPORT_ID]['requires'])
        self.assertEqual({k: v for k, v in self.before[SUPPORT_ID].items() if k != 'requires'},
                         {k: v for k, v in self.after[SUPPORT_ID].items() if k != 'requires'})

    def test_reviewed_prior_changes_and_both_6224_language_versions_remain_exact(self):
        self.assertEqual('9c9a273a6b320fbfeba72567094327f4236b58f354836203aac98d7d70050bce',
                         hashlib.sha256(BASE.read_bytes()).hexdigest())
        goal = self.goal('6224d04c')
        self.assertEqual(self.goal('6224d04c', False), goal)
        self.assertTrue(goal['examData']['taskContentEn'])
        self.assertTrue(goal['examData']['solutionContentEn'])
        for prefix in ['4c319dfd', 'f77b9b40', '1969d4dc', 'bd2c5e29', '450a77d6', '2f8a3a90',
                       'b9a501c4', '7337049a', '99b3435a', 'e5494c67', 'dd6c5e08', '772b11c9',
                       'c72a8032', 'd4f2d4e2', 'baf7276f', '5dabf0b3', '06ce2b1b', '3aea4d33']:
            self.assertEqual(self.goal(prefix, False), self.goal(prefix))

    def test_title_point_correction_preserves_task_scoring_and_binary_threshold(self):
        before, after = self.goal('4ef1', False), self.goal('4ef1')
        self.assertEqual('Aufgabe 3 (Jahrgangsstufe 7, 8 BE)', after['title'])
        self.assertEqual(before['examData'], after['examData'])
        self.assertEqual(8, sum(step['points'] for step in after['examData']['scoring']['steps']))
        for row in self.patch['corrections']:
            if not row['goalId'].startswith('4ef1'):
                self.assertEqual('draft', self.after[row['goalId']]['examData']['reviewStatus'])

    def test_unperformed_software_and_derivations_are_not_claimed_as_assessed(self):
        removals = {
            '311ab': ['191c67'], 'b48c': ['255936'], '3ce9': ['314854'], '18db': ['c9eb293'],
            'fbf1': ['1842da', 'f6574c', 'fc3444'], 'c9d7': ['d9725e', '674baa', '4cba85'],
            'ea66': ['6c122f'],
        }
        for prefix, forbidden in removals.items():
            coverage = self.goal(prefix)['examData']['coveredGoalIds']
            for bad in forbidden:
                self.assertFalse(any(ident.startswith(bad) for ident in coverage))

    def test_water_domain_and_positive_density_material_resolve_the_actual_counterexamples(self):
        self.assertNotIn('meist ganzzahlig', self.goal('9acc')['examData']['solutionContent'])
        self.assertIn('zwingend eine positive ganze Zahl', self.goal('9acc')['examData']['solutionContent'])
        exam = self.goal('e96b')['examData']
        self.assertIn('positive reelle Größen', exam['taskContent'])
        self.assertIn('d\\ne0', exam['taskContent'])
        # The old unrestricted formula has infinitely many d at V=m=0.
        self.assertTrue(all(0 == 0/d for d in [-3, -1, 1, 2]))
        # The specified positive example has the unique permitted rearrangement.
        V, m = 2, 6
        self.assertEqual(V, m/(m/V))

    def test_second_intercept_theorem_counterexample_has_real_equal_ratios_and_nonparallel_lines(self):
        S, A, Ap, B, Bp = (0, 0), (3, 0), (6, 0), (1, 1), (4, 4)
        self.assertAlmostEqual(math.dist(S, A)/math.dist(S, Ap), math.dist(A, B)/math.dist(Ap, Bp))
        self.assertNotEqual(math.dist(S, B)/math.dist(S, Bp), math.dist(S, A)/math.dist(S, Ap))
        u, v = (B[0]-A[0], B[1]-A[1]), (Bp[0]-Ap[0], Bp[1]-Ap[1])
        self.assertNotEqual(0, u[0]*v[1]-u[1]*v[0])
        self.assertIn('S=(0,0)', self.goal('8a36')['examData']['solutionContent'])

    def test_actual_tangent_construction_matches_the_given_circles_and_orthogonality(self):
        exam = self.goal('3045')['examData']
        self.assertIn('tatsächlich aus', exam['taskContent'])
        self.assertIn('Zeichenpunkte nicht', str(exam['scoring']))
        M, P, C = (4, 3), (10, 3), (7, 3)
        for y in [3 + 1.5*math.sqrt(3), 3 - 1.5*math.sqrt(3)]:
            T = (5.5, y)
            self.assertAlmostEqual(3, math.dist(M, T))
            self.assertAlmostEqual(3, math.dist(C, T))
            self.assertAlmostEqual(0, (T[0]-M[0])*(T[0]-P[0]) + (T[1]-M[1])*(T[1]-P[1]))

    def test_saving_and_rounding_results_are_correct_without_software_claims(self):
        self.assertEqual(365, 120+35*7)
        self.assertEqual(400, 120+35*8)
        self.assertEqual(35, (400-120)/8)
        self.assertEqual(0.03, (515-500)/500)
        value = Decimal(1200)*Decimal('0.82')**3
        self.assertEqual(Decimal('661.641600'), value)
        self.assertEqual(Decimal('661.6'), value.quantize(Decimal('0.1')))
        self.assertIn('661{,}6', self.goal('af79')['examData']['solutionContent'])
        self.assertIn('zählt die Jahre', self.goal('af79')['examData']['taskContent'])

    def test_midpoint_rubric_does_not_falsely_claim_both_checks_are_forced(self):
        before, after = self.goal('5f64', False)['examData'], self.goal('5f64')['examData']
        self.assertEqual(before['scoring'], after['scoring'])
        self.assertGreaterEqual(3+2+2, after['scoring']['passingPoints'])
        self.assertNotIn('erfordert damit beide Prüfungen', after['solutionContent'])

    def test_cuboid_convention_is_explicit_and_the_graph_asset_uses_the_existing_namespace(self):
        task = self.goal('c34c')['examData']['taskContent']
        self.assertIn('45°', task)
        self.assertIn('Faktor 1/2', task)
        asset = self.patch['assets'][0]
        self.assertEqual('app/public'+asset['runtimeUrl'], asset['futurePublicPath'])
        self.assertIn('/assets/assessment-materials/mathematik/0d2cfddc-7af6-5709-819f-929e6cf9c192/', asset['runtimeUrl'])
        svg_path = ROOT / asset['path']
        self.assertEqual(asset['sha256'], hashlib.sha256(svg_path.read_bytes()).hexdigest())
        svg = ET.parse(svg_path).getroot()
        ns = {'s': 'http://www.w3.org/2000/svg'}
        point = svg.find('.//s:circle', ns)
        self.assertEqual((510, 176), (float(point.get('cx')), float(point.get('cy'))))
        self.assertEqual(2, len(svg.findall('.//s:polyline', ns)))
        self.assertIsNone(svg.find('.//s:script', ns))
        self.assertIn(asset['runtimeUrl'], self.goal('0d2c')['examData']['taskContent'])
        self.assertEqual(2, 6/(4-2)-1)
        self.assertEqual(1, 6/(5-2)-1)

    def test_true_context_deltas_and_canonical_route_losses_are_disclosed(self):
        before_edges, after_edges = validate_graph(self.before), validate_graph(self.after)
        def reach(roots, edges):
            found, pending = set(), list(roots)
            while pending:
                ident = pending.pop()
                if ident not in found:
                    found.add(ident)
                    pending.extend(edges[ident])
            return found
        for row in self.patch['contextDelta']['changedContextsOf60']:
            a, b = reach([row['goalId']], before_edges), reach([row['goalId']], after_edges)
            self.assertEqual(set(row['removedGoalIds']), a-b)
            self.assertEqual(set(row['addedGoalIds']), b-a)
        roots = {ident for ident, goal in self.before.items() if ident in before_edges and goal.get('examData')}
        self.assertEqual(set(self.patch['contextDelta']['newlyUnreachableFromAllCanonicalProtectedRoots']),
                         reach(roots, before_edges)-reach(roots, after_edges))
        self.assertEqual(12, len(self.patch['contextDelta']['newlyUnreachableFromAllCanonicalProtectedRoots']))

    def test_source_drift_wrong_cohort_or_unreviewed_release_is_rejected(self):
        source = copy.deepcopy(self.source)
        next(goal for goal in source['goals'] if goal['id'].startswith('311ab'))['description'] += ' changed'
        with self.assertRaisesRegex(ValueError, 'source goal changed'):
            apply_candidate(source, self.patch)
        patch = copy.deepcopy(self.patch)
        patch['corrections'][0]['replacement']['examData']['reviewStatus'] = 'released'
        with self.assertRaisesRegex(ValueError, 'remain draft'):
            apply_candidate(self.source, patch)


if __name__ == '__main__':
    unittest.main()
