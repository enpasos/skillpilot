#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
import copy
from collections import defaultdict
import unittest

from generate_mathematics_seki_excerpts import POLICY, build_excerpt
from normalize_mathematics_stage_views import Normalizer, ROOT, read, structure


class MathematicsSekiExcerptTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.normalizer = Normalizer()
        cls.policy = read(POLICY)

    def test_exact_source_membership_and_replay_of_twelve_routes(self):
        for row in self.policy['views']:
            with self.subTest(state=row['state']):
                full = read(ROOT / 'curricula/DE/Gymnasium/composition-views/mathematik' / f'de-{row["state"].lower()}-gk.view.json')
                expected = build_excerpt(full, row, self.normalizer)
                actual = read(ROOT / 'curricula/DE/Gymnasium/composition-views/mathematik' / row['filename'])
                self.assertEqual(actual, expected)
                targets = {g for g, role in self.normalizer.atomic_roles(actual['rootNodes']).items() if role == 'target'}
                self.assertEqual(targets, set(row['seedAtomicGoalIds']))
                self.assertEqual(actual['scope']['stage'], 'SekI')
                self.assertEqual(actual['scope']['jurisdiction'], 'DE-' + row['state'])

    def test_earlier_learning_place_never_promotes_a_prerequisite_to_source_seed(self):
        n = object.__new__(Normalizer)
        n.goals = {g: dict(id=g, title=g, contains=[]) for g in ['source', 'earlier-preparation']}
        n.cache = {}; n.parents = defaultdict(list)
        full = dict(viewId='full', scope={}, rootNodes=[structure('math-layout-root', 'Mathematik', [
            structure('sek1', 'Sekundarstufe I', [structure('j5', 'Jahrgangsstufe 5', [
                dict(kind='goalEntry', goalId='earlier-preparation'), dict(kind='goalEntry', goalId='source'),
            ])])])])
        original = copy.deepcopy(full)
        result = build_excerpt(full, dict(viewId='excerpt', state='SN', seedAtomicGoalIds=['source']), n)
        self.assertEqual(full, original)
        self.assertEqual(n.atomic_roles(result['rootNodes']), {'source': 'target', 'earlier-preparation': 'prerequisiteOnly'})

    def test_canonical_subject_and_exam_subgroups_survive_atom_role_projection(self):
        n = object.__new__(Normalizer)
        n.goals = {
            'topic': dict(id='topic', title='Algebra', contains=['skill', 'exam-folder']),
            'exam-folder': dict(id='exam-folder', title='Prüfungen', contains=['task'], tags=['Assessment']),
            'skill': dict(id='skill', title='Gleichung lösen', contains=[]),
            'task': dict(id='task', title='Gleichung prüfen', contains=[], nodeKind='exam'),
        }
        n.cache = {}; n.parents = defaultdict(list)
        full = dict(viewId='full', scope={}, rootNodes=[structure('math-layout-root', 'Mathematik', [
            structure('sek1', 'Sekundarstufe I', [structure('j7', 'Jahrgangsstufe 7', [
                dict(kind='canonicalSubtree', goalId='topic'),
            ])])])])
        result = build_excerpt(full, dict(viewId='excerpt', state='SN', seedAtomicGoalIds=['skill', 'task']), n)
        def walk(node):
            yield node
            for child in node.get('children', []):
                yield from walk(child)
        bindings = [node for root in result['rootNodes'] for node in walk(root)
                    if node.get('canonicalSourceGoalId') == 'exam-folder']
        self.assertEqual(len(bindings), 1)
        self.assertEqual(bindings[0]['children'], [dict(kind='goalEntry', goalId='task', projectionRole='target')])
        self.assertEqual(n.atomic_roles(result['rootNodes']), {'skill': 'target', 'task': 'target'})

    def test_bremen_current_restriction_does_not_promote_old_year10_analysis(self):
        row = next(row for row in self.policy['views'] if row['state'] == 'HB')
        excluded = row['excludedSupersededSourceSupplements']
        self.assertEqual(len(excluded), 5)
        for decision in excluded:
            atom = decision['goalId']
            self.assertIn(atom, row['sourceMappedSupplementAtomicGoalIds'])
            self.assertNotIn(atom, row['sourceStageTreeAtomicGoalIds'])
            self.assertNotIn(atom, row['seedAtomicGoalIds'])
            self.assertEqual(decision['originalSource']['printedPage'], 10)
            self.assertEqual(decision['currentRestriction']['pages'], [1, 2])
            self.assertTrue(decision['mappingWitnesses'])
            self.assertIn(decision['originalSource']['path'], row['sourcePins'])
            self.assertIn(decision['currentRestriction']['path'], row['sourcePins'])

    def test_ni_constant_slope_does_not_enroll_differential_calculus(self):
        row = next(row for row in self.policy['views'] if row['state'] == 'NI')
        excluded = row['excludedCoarseSourceClusterSupplements']
        self.assertEqual(len(excluded), 4)
        for decision in excluded:
            atom = decision['goalId']
            self.assertIn(atom, row['sourceMappedSupplementAtomicGoalIds'])
            self.assertNotIn(atom, row['sourceStageTreeAtomicGoalIds'])
            self.assertNotIn(atom, row['seedAtomicGoalIds'])
            self.assertEqual(decision['primarySource']['printedPages'], [36, 51])
            self.assertEqual(decision['mappingWitness']['retainedSourceRefPage'], 50)
            self.assertEqual(decision['mappingWitness']['actualPrintedPage'], 51)
            self.assertIn(decision['primarySource']['path'], row['sourcePins'])
        self.assertNotIn('bc53c4e9-46b3-579e-8504-c6510732f218', row['seedAtomicGoalIds'])

    def test_three_new_monotony_supplements_do_not_expand_lower_scope(self):
        atom = '2850e8f6-2330-50d3-a577-d519540d9924'
        for state, page in [('SL', 28), ('SN', 30), ('TH', 28)]:
            row = next(row for row in self.policy['views'] if row['state'] == state)
            decisions = row['excludedCoarseSourceClusterSupplements']
            self.assertEqual([d['goalId'] for d in decisions], [atom])
            self.assertIn(atom, row['sourceMappedSupplementAtomicGoalIds'])
            self.assertNotIn(atom, row['sourceStageTreeAtomicGoalIds'])
            self.assertNotIn(atom, row['seedAtomicGoalIds'])
            self.assertEqual(decisions[0]['primarySource']['printedPages'], [page])
            for original in row['sourceStageTreeAtomicGoalIds']:
                self.assertIn(original, row['seedAtomicGoalIds'])

    def test_upper_assessment_discrepancies_are_explicit_and_not_claimed_as_lower_seeds(self):
        exclusions = 0
        for row in self.policy['views']:
            for exception in row['excludedUpperSecondaryAssessments']:
                exclusions += 1
                goal = self.normalizer.goals[exception['goalId']]
                self.assertTrue(goal.get('examData'))
                self.assertEqual(exception['phase'], 'Q4')
                self.assertNotIn(exception['goalId'], row['seedAtomicGoalIds'])
                self.assertTrue(exception['sourceMappingEvidence'])
                self.assertTrue(exception['coveredGoalEvidence'])
        self.assertGreater(exclusions, 0)


if __name__ == '__main__':
    unittest.main()
