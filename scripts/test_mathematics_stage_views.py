#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Focused regressions for stage placement and non-invented topic order."""
import copy
import hashlib
from collections import defaultdict
import unittest

from generate_mathematics_foreign_acquisition_policy import authored_places, earliest_consumer
from normalize_mathematics_stage_views import Normalizer, ROOT, SCHEMA, read, structure


class MathematicsStageViewsTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.normalizer = Normalizer()

    def test_topic_numbers_are_not_whole_phase_containers(self):
        self.assertTrue(self.normalizer.year_structure(structure('q3', 'Q3: Stochastik', [])))
        self.assertFalse(self.normalizer.year_structure(structure('q3-1', 'Q3.1 Wahrscheinlichkeiten', [])))

    def test_existing_examination_offer_moves_intact_after_instructional_phases(self):
        n = self.normalizer
        task = dict(kind='canonicalSubtree', goalId='65cc2ab6-483e-5b2f-a77c-2f6c987439e8',
                    displayLabel='A1: Analysis')
        topic = structure('existing-examination-part', 'Teil 1: Hilfsmittelfrei', [task])
        topic['canonicalSourceGoalId'] = 'e445ceb8-583a-56bf-942d-a3e8d9090e43'
        foundation = dict(kind='goalEntry', goalId='7156558c-57f1-4372-9ba7-0640c3f7cb3a')
        phase = structure('q1', 'Q1: Analysis', [structure('analysis', 'Ableitungsbegriff', [foundation]), topic])
        stage = structure('sek-ii', 'Sekundarstufe II', [phase])
        view = dict(viewId='test-examination-offer', scope=dict(jurisdiction='DE-BB', stage='SekII', courseProfile='GK'),
                    rootNodes=[structure('root', 'Mathematik', [stage])])
        original_topic = copy.deepcopy(topic)
        roles = n.atomic_roles(view['rootNodes'])
        n.restore_selected_examination_unit(view)
        self.assertEqual(stage['children'][-1]['label'], 'Abiturprüfung')
        self.assertEqual(stage['children'][-1]['children'], [original_topic])
        self.assertEqual(phase['children'], [structure('analysis', 'Ableitungsbegriff', [foundation])])
        self.assertEqual(n.atomic_roles(view['rootNodes']), roles)
        n.declare_orders(view)
        self.assertIn(dict(unit='math-layout-sekii-abitur', after='q1'), stage['childOrder']['after'])
        first = copy.deepcopy(view)
        n.restore_selected_examination_unit(view)
        self.assertEqual(view, first)

    def test_unselected_or_unrelated_examination_collection_is_not_invented(self):
        n = self.normalizer
        support = dict(kind='goalEntry', goalId='65cc2ab6-483e-5b2f-a77c-2f6c987439e8', projectionRole='prerequisiteOnly')
        for state, role in [('DE-BB', 'prerequisiteOnly'), ('DE-BY', 'target')]:
            ref = dict(support, projectionRole=role)
            view = dict(viewId='test-no-examination-invention', scope=dict(jurisdiction=state, stage='SekII'),
                        rootNodes=[structure('sek-ii', 'Sekundarstufe II', [structure('q1', 'Q1: Analysis', [ref])])])
            before = copy.deepcopy(view)
            n.restore_selected_examination_unit(view)
            self.assertEqual(view, before)

    def test_bavarian_authored_compulsory_math_owns_the_course_filter(self):
        atom = 'bfc2bf06-9b37-4912-a8eb-25fb5d489d72'
        scope = dict(jurisdiction='DE-BY', courseProfile='GK')
        self.assertTrue(self.normalizer.goal_applies(atom, scope))
        self.assertFalse(self.normalizer.goal_applies(atom, dict(scope, jurisdiction='DE-HE')))

    def test_bremen_has_no_canonical_year10_time_override(self):
        n = self.normalizer
        self.assertEqual(n.nominal_place('3d8f5e4c-8f7b-49cf-bd83-1d9876db5bf6', 'HB', 'SekI', None), ('SekI', 'J9'))
        self.assertEqual(n.nominal_place('7f11ffe0-7c43-4507-9101-50374a60b0e8', 'HB', 'SekI', None), ('SekII', 'E'))

    def test_source_time_units_are_land_specific(self):
        n = self.normalizer
        cases = [
            ('SN', 'SekII', {'tags': ['phase:11/12']}, 'J11_12'),
            ('TH', 'SekII', {'tags': ['phase:11S']}, 'E'),
            ('HH', 'SekII', {'tags': ['semester:S3/S4']}, 'Q3_Q4'),
            ('BW', 'SekI', {'tags': ['gradeBand:J7_8']}, 'J7_8'),
            ('RP', 'SekI', {'tags': ['rpStage:klasse9-10-msa']}, 'J9_10'),
            ('MV', 'SekI', {'topicCode': 'MV-SEKI-GYM-J9-GEOMETRIE'}, 'J9'),
            ('NW', 'SekII', {'topicCode': 'NW-SEKII-E-FUNKTIONEN-UND-ANALYSIS'}, 'E'),
            ('BW', 'SekII', {'tags': ['stage:SekII']}, None),
            ('BE', 'SekII', {'phase': 'Q3', 'tags': ['stage:SekII']}, 'Q3'),
            ('BE', 'SekII', {'phase': 'Q2/4', 'tags': ['stage:SekII']}, 'Q2'),
        ]
        for state, stage, goal, expected in cases:
            with self.subTest(state=state, goal=goal):
                self.assertEqual(n.source_unit(state, stage, goal), expected)

    def test_partial_number_term_source_does_not_schedule_fractional_algebra_in_j5(self):
        n = self.normalizer
        for atom in ['c420e0be-1e74-4050-834c-d8da7f41095a', '74dc4b0d-a167-564c-bdc1-5cf510aee280']:
            self.assertEqual(n.unit(atom, 'BW', 'SekI', None), 'J7_8')
            self.assertEqual(n.source_evidence('BW', 'SekI', atom, None), [])
        exact = '325771e1-602d-4bca-a199-a8f39a2d3dee'
        self.assertEqual(n.unit(exact, 'BW', 'SekI', None), 'J7_8')
        self.assertTrue(all(e['matchType'] == 'exact' for e in n.source_evidence('BW', 'SekI', exact, None)))

    def test_only_real_time_containers_get_declared_chains(self):
        topics = structure('q', 'Q1', [structure('analysis', 'Analysis', []), structure('geometry', 'Geometrie', [])])
        stage = structure('sek2', 'Sekundarstufe II', [topics, structure('q2', 'Q2', [])])
        self.normalizer.explicit_orders(stage)
        self.assertEqual(topics['childOrder'], {'after': []})
        self.assertEqual(stage['childOrder'], {'after': [{'unit': 'q2', 'after': 'q'}]})
        stage['children'] = [stage['children'][1]]
        self.normalizer.explicit_orders(stage)
        self.assertEqual(stage['childOrder'], {'after': []}, 'Pruned excerpts must have no dangling after edge')

    def test_role_specificity_is_retained_when_splitting_subtrees(self):
        n = object.__new__(Normalizer)
        n.goals = {
            'root': {'id': 'root', 'title': 'Together', 'contains': ['first', 'second']},
            'first': {'id': 'first', 'title': 'First', 'contains': [], 'dimensionTags': {'phase': 'J5'}},
            'second': {'id': 'second', 'title': 'Second', 'contains': [], 'dimensionTags': {'phase': 'J6'}},
        }
        n.cache = {}; n.parents = defaultdict(list); n.evidence = defaultdict(lambda: defaultdict(list))
        n.decisions = {}; n.moves = []; n.placements = {}
        view = {'viewId': 'test', 'landscapeId': 'math', 'scope': {'schoolForm': 'Gymnasium', 'jurisdiction': 'DE-SN', 'stage': 'CrossStage'},
                'rootNodes': [{'kind': 'canonicalSubtree', 'goalId': 'second', 'projectionRole': 'prerequisiteOnly'},
                              structure('math-root', 'Mathematik', [structure('sek1', 'Sekundarstufe I', [{'kind': 'canonicalSubtree', 'goalId': 'root'}])])]}
        original = copy.deepcopy(view)
        normalized = n.normalize(view)
        self.assertEqual(view, original)
        self.assertEqual(n.atomic_roles(normalized['rootNodes']), {'first': 'target', 'second': 'prerequisiteOnly'})
        self.assertEqual(n.normalize(normalized), normalized)

    def test_split_year_preserves_subject_and_assessment_hierarchy(self):
        n = object.__new__(Normalizer)
        n.goals = {
            'year': dict(id='year', title='Jahrgangsstufe 7', contains=['topic', 'exams']),
            'topic': dict(id='topic', title='Variablen und Terme', contains=['early', 'late']),
            'exams': dict(id='exams', title='Prüfungen Jahrgangsstufe 7', contains=['task-a', 'task-b', 'task-c'], tags=['Assessment']),
        }
        n.goals.update({g: dict(id=g, title=g, contains=[]) for g in ['early', 'late', 'task-a', 'task-b', 'task-c']})
        n.cache = {}; n.parents = defaultdict(list); n.evidence = defaultdict(lambda: defaultdict(list)); n.decisions = {}
        n.placements = {g: ('SekI', 'J5' if g in ['early', 'task-a'] else 'J7') for g in ['early', 'late', 'task-a', 'task-b', 'task-c']}
        n.original_roles = {g: 'target' for g in n.placements}
        original = dict(kind='canonicalSubtree', goalId='year')
        groups = n.partition(original, 'DE', 'SekI', None)
        self.assertEqual(set(groups), {'SekI:J5', 'SekI:J7'})
        for parts in groups.values():
            self.assertEqual({part['label'] for part in parts}, {'Variablen und Terme', 'Prüfungen Jahrgangsstufe 7'})
            self.assertFalse(any(part.get('canonicalSourceGoalId') == 'year' for part in parts))
        bindings = [part for parts in groups.values() for part in parts if part.get('canonicalSourceGoalId') == 'exams']
        self.assertEqual(len(bindings), 1)
        self.assertEqual({c['goalId'] for c in bindings[0]['children']}, {'task-b', 'task-c'})
        self.assertEqual(n.atomic_roles([p for parts in groups.values() for p in parts]), n.original_roles)
        self.assertEqual(original, dict(kind='canonicalSubtree', goalId='year'))

    def test_split_materialized_exam_collection_has_one_binding(self):
        n = object.__new__(Normalizer)
        n.goals = {'folder': dict(id='folder', title='Prüfungen Jahrgangsstufe 9', contains=['early', 'late-a', 'late-b'], tags=['Assessment'])}
        n.goals.update({g: dict(id=g, title=g, contains=[]) for g in ['early', 'late-a', 'late-b']})
        n.cache = {}; n.parents = defaultdict(list); n.evidence = defaultdict(lambda: defaultdict(list)); n.decisions = {}
        n.placements = {g: ('SekI', 'J7' if g == 'early' else 'J9') for g in ['early', 'late-a', 'late-b']}
        n.original_roles = {g: 'target' for g in n.placements}
        source = structure('materialized-folder', 'Prüfungen Jahrgangsstufe 9',
            [dict(kind='goalEntry', goalId=g) for g in n.placements])
        source['canonicalSourceGoalId'] = 'folder'
        result = n.partition(source, 'DE', 'SekI', None)
        bound = [node for parts in result.values() for node in parts if node.get('canonicalSourceGoalId') == 'folder']
        self.assertEqual(len(bound), 1)
        self.assertEqual({c['goalId'] for c in bound[0]['children']}, {'late-a', 'late-b'})
        self.assertEqual(n.atomic_roles([node for parts in result.values() for node in parts]), n.original_roles)

    def test_single_skill_topic_label_preserves_the_full_atomic_title(self):
        n = self.normalizer
        atom = next(g for g, label in n.single_skill_topic_labels.items() if label == 'Gradmaß und Bogenmaß')
        ref = dict(kind='goalEntry', goalId=atom)
        view = dict(viewId='single-skill', rootNodes=[structure('angle-topic', n.goals[atom]['title'], [ref])])
        n.clean_redundant_wrappers(view)
        self.assertEqual(view['rootNodes'][0]['label'], 'Gradmaß und Bogenmaß')
        self.assertEqual(view['rootNodes'][0]['children'], [ref])

    def test_reviewed_multiplication_step_keeps_exact_reference_and_role(self):
        n = self.normalizer
        family = '8dd5199b-f614-4ebd-8819-b5ff37326524'
        atom = 'cafd6520-c4af-4109-9863-cc49ba6fad4d'
        reference = dict(kind='goalEntry', goalId=atom, projectionRole='prerequisiteOnly', acquisitionPlacement=True,
                         displayLabel='Multiplikation und Division')
        topic = structure('numbers', n.goals[family]['title'], [dict(kind='canonicalSubtree', goalId=family)])
        topic['canonicalSourceGoalId'] = family
        year = structure('j5', 'Jahrgangsstufe 5', [topic, structure('isolated-step', 'Grundoperation', [copy.deepcopy(reference)])])
        view = dict(viewId='reviewed', rootNodes=[year])
        before = n.atomic_roles(view['rootNodes'])
        n.repair_reviewed_intermediate_refs(view)
        self.assertEqual(topic['children'][-1], reference)
        self.assertEqual(len(year['children']), 1)
        self.assertEqual(n.atomic_roles(view['rootNodes']), before)

    def test_reviewed_acquisition_unit_keeps_its_nested_domain_on_replay(self):
        n = copy.copy(self.normalizer)
        atom = 'c823b5a2-82e3-5e22-9c27-c0f41cc5eac6'
        n.reviewed_topic_cuts = [dict(jurisdictions=['DE-SH'], parentIds=['year'],
            anchorGoalId=atom, moveGoalIds=[atom], createUnitSuffix='solids', label='Körperdarstellungen')]
        unit = structure('year-reviewed-solids', 'Körperdarstellungen', [dict(kind='goalEntry', goalId=atom)])
        domain = structure('geometry', 'Geometrie', [unit])
        view = dict(viewId='nested-reviewed', scope=dict(jurisdiction='DE-SH'),
                    rootNodes=[structure('year', 'Jahrgangsstufe 5/6', [domain])])
        before = copy.deepcopy(view)
        n.repair_reviewed_stage_topic_refs(view)
        self.assertEqual(view, before)

    def test_removing_duplicate_phase_wrapper_keeps_real_subject_units(self):
        n = self.normalizer
        reference = dict(kind='canonicalSubtree', goalId='93ac7fc8-6d83-5394-bbea-80758b463da1')
        phase = structure('math-layout-sekii-q1', 'Q1: Integralrechnung und Differenzialgleichungen', [
            structure('old-phase', 'Integralrechnung und Differenzialgleichungen', [reference])])
        view = dict(viewId='phase-cleanup', scope=dict(jurisdiction='DE-DE'), rootNodes=[phase])
        before = n.atomic_roles(view['rootNodes'])
        n.clean_redundant_wrappers(view)
        self.assertTrue(phase['children'])
        self.assertTrue(all(child['kind'] == 'structure' for child in phase['children']))
        self.assertEqual(n.atomic_roles(view['rootNodes']), before)

    def test_duplicate_mv_coordinate_offers_keep_one_owner_and_scope_exclusion(self):
        n = copy.copy(self.normalizer)
        n.reviewed_topic_cuts = []
        prefix = 'math-layout-seki-j9'
        family = '78bcc25b-e48c-471b-9236-6c3b23d48a8b'
        refs = [dict(kind='goalEntry', goalId=g, projectionRole='prerequisiteOnly', acquisitionPlacement=True)
                for g in ['19f170e4-b88f-4c06-b72a-ce6923748bb4', '94b48b93-473f-4bc5-8c93-8c1a5e2cd1a6']]
        excluded = dict(kind='goalEntry', goalId='f242a3e8-55a3-492e-8354-b81b24cdbb78', projectionRole='prerequisiteOnly')
        year = structure(prefix, 'Jahrgangsstufe 9', [
            structure(prefix + '-physics-needed-content-' + family, 'Koordinaten', copy.deepcopy(refs)),
            structure(prefix + '-required-foundations-content-' + family, 'Koordinaten', copy.deepcopy(refs) + [excluded])])
        view = dict(viewId='de-mv-gym-seki-math', scope=dict(jurisdiction='DE-MV'), rootNodes=[year])
        before = n.atomic_roles(view['rootNodes'])
        n.repair_reviewed_stage_topic_refs(view)
        self.assertEqual(len(year['children']), 1)
        self.assertEqual(year['children'][0]['children'], refs + [excluded])
        self.assertEqual(n.atomic_roles(view['rootNodes']), before)

    def test_reflection_cut_moves_only_explicit_preparation_not_scope_exclusions(self):
        n = self.normalizer
        endpoints = ['25593605-5e13-55cc-9a05-8f3d737e15e9', 'd98849c7-bd0b-50d4-90aa-6293a3adb211']
        angle = '2331caf2-ccb2-5492-9fc6-48763b848bae'
        parallel = '2231c29b-eb4e-51ae-9cb1-eb033bf16099'
        marked = dict(kind='goalEntry', goalId=angle, projectionRole='prerequisiteOnly', acquisitionPlacement=True)
        excluded = dict(kind='goalEntry', goalId=parallel, projectionRole='prerequisiteOnly')
        basics = structure('geometry-basics', 'Geometrie', [dict(kind='goalEntry', goalId=g) for g in endpoints])
        application = structure('reflection', 'Achsenspiegelungen', [copy.deepcopy(marked), copy.deepcopy(excluded)])
        view = dict(viewId='reviewed-reflection', rootNodes=[structure('year', 'Jahrgangsstufe 6', [basics, application])])
        roles = n.atomic_roles(view['rootNodes'])
        n.repair_reviewed_intermediate_refs(view)
        self.assertIn(marked, basics['children'])
        self.assertEqual(application['children'], [excluded])
        self.assertEqual(n.atomic_roles(view['rootNodes']), roles)

    def test_reduced_order_preserves_own_atom_exception(self):
        n = object.__new__(Normalizer)
        n.goals = {g: dict(id=g, title=g, contains=[], requires=r) for g, r in
                   [('base', []), ('bridge', ['base']), ('application', ['bridge']),
                    ('extension', ['application']), ('independent', [])]}
        n.cache = {}; n.order_conflicts = []
        node = structure('topics', 'Topics', [
            structure('applications', 'Applications', [dict(kind='goalEntry', goalId='application')]),
            structure('independent-unit', 'Independent', [dict(kind='goalEntry', goalId='independent')]),
            dict(kind='goalEntry', goalId='bridge'),
            structure('foundations', 'Foundations', [dict(kind='goalEntry', goalId='base')]),
            structure('extensions', 'Extensions', [dict(kind='goalEntry', goalId='extension')]),
        ])
        n.explicit_orders(node)
        self.assertEqual({(edge['after'], edge['unit']) for edge in node['childOrder']['after']},
                         {('applications', 'extensions')})
        self.assertEqual(n.order_conflicts, [])

    def test_support_requires_explicit_acquisition_intent(self):
        n = object.__new__(Normalizer)
        n.goals = {'support': dict(id='support', title='Support', contains=[])}
        n.cache = {}
        node = dict(kind='goalEntry', goalId='support', projectionRole='prerequisiteOnly')
        self.assertEqual(n.explicit_orders(node), set())
        node['acquisitionPlacement'] = True
        self.assertEqual(n.explicit_orders(node), {'support'})

    def test_shared_preparation_uses_earliest_consumer_not_uuid_order(self):
        n = object.__new__(Normalizer)
        n.goals = {
            'a-late': dict(id='a-late', title='Late', contains=[], requires=['preparation'], phase='J8'),
            'z-early': dict(id='z-early', title='Early', contains=[], requires=['preparation'], phase='J5'),
            'preparation': dict(id='preparation', title='Preparation', contains=[], requires=[], phase='J9'),
        }
        n.cache = {}; n.parents = defaultdict(list); n.evidence = defaultdict(lambda: defaultdict(list))
        n.decisions = {}; n.acquisitions = []; n.math_atoms = set(n.goals)
        view = dict(viewId='shared-preparation', scope=dict(jurisdiction='DE-DE', stage='CrossStage'),
            rootNodes=[structure('math-layout-root', 'Mathematik', [structure('sek1', 'Sekundarstufe I', [
                structure('j5', 'Jahrgangsstufe 5', [dict(kind='goalEntry', goalId='z-early')]),
                structure('j8', 'Jahrgangsstufe 8', [dict(kind='goalEntry', goalId='a-late')]),
            ])])])
        n.add_acquisition_places(view)
        self.assertEqual(n.acquisitions[0]['path'], ['sek1', 'j5', 'j5-required-foundations'])
        self.assertEqual(n.acquisitions[0]['requiredByPath'], ['z-early', 'preparation'])
        self.assertEqual(n.atomic_roles(view['rootNodes'])['preparation'], 'prerequisiteOnly')

    def test_intermediate_preparation_stays_inside_its_topic(self):
        n = object.__new__(Normalizer)
        n.goals = {g: dict(id=g, title=g, contains=[], requires=r) for g, r in [
            ('foundation', []), ('application', ['preparation']),
            ('other-topic', []), ('preparation', ['foundation', 'other-topic'])]}
        n.cache = {}; n.order_conflicts = []
        topic = structure('topic', 'A coherent topic', [dict(kind='goalEntry', goalId=g)
                           for g in ['foundation', 'application']])
        support = dict(kind='goalEntry', goalId='preparation',
                       projectionRole='prerequisiteOnly', acquisitionPlacement=True)
        year = structure('year', 'Jahrgangsstufe 9', [topic,
            structure('other', 'Earlier topic', [dict(kind='goalEntry', goalId='other-topic')]),
            structure('year-required-foundations', 'Benötigte Grundlagen', [support])])
        view = dict(viewId='context', scope={}, rootNodes=[year])
        old_roles = n.atomic_roles(view['rootNodes'])
        n.integrate_acquisition_contexts(view)
        n.declare_orders(view)
        self.assertIn(support, topic['children'])
        self.assertEqual(n.atomic_roles(view['rootNodes']), old_roles)
        self.assertEqual(year['childOrder'], {'after': [dict(unit='topic', after='other')]})
        self.assertEqual(n.order_conflicts, [])
        stable = copy.deepcopy(view)
        n.integrate_acquisition_contexts(view)
        n.declare_orders(view)
        self.assertEqual(view, stable)

    def test_global_exam_uses_its_explicit_assessed_skill_phase(self):
        n = object.__new__(Normalizer)
        n.goals = {
            'skill': dict(id='skill', dimensionTags=dict(phase='J9')),
            'exam': dict(id='exam', nodeKind='exam', dimensionTags=dict(phase='GLOBAL'),
                         authoringMetadata=dict(primaryAssessedGoalId='skill')),
        }
        n.parents = defaultdict(list)
        self.assertEqual(n.phase('exam'), 'J9')

    def test_lower_orientation_is_an_entry_not_an_upper_fallback(self):
        n = self.normalizer
        atom = '65365dce-f33f-49d8-9516-42f75883aa86'
        self.assertEqual(n.phase(atom), 'J5')
        self.assertEqual(n.source_evidence('ST', 'SekI', atom, None), [])

    def test_foreign_consumer_authorizes_place_and_order_but_no_source_target(self):
        n = object.__new__(Normalizer)
        n.goals = {g: dict(id=g, title=g, contains=[], requires=r, phase=p) for g, r, p in [
            ('math-base', [], 'J5'), ('foreign-needed', ['math-base'], 'J9'),
            ('physics-consumer', ['foreign-needed'], 'J5')]}
        n.cache = {}; n.parents = defaultdict(list); n.evidence = defaultdict(lambda: defaultdict(list))
        n.decisions = {}; n.acquisitions = []; n.math_atoms = {'math-base', 'foreign-needed'}
        n.foreign_demands = {'joint': [dict(goalId='foreign-needed',
            requiresPath=['physics-consumer', 'foreign-needed'], demandPlace=['SekI', 'J5'])]}
        excluded = dict(kind='goalEntry', goalId='foreign-needed', projectionRole='prerequisiteOnly')
        year = structure('j5', 'Jahrgangsstufe 5', [structure('base', 'Base',
            [dict(kind='goalEntry', goalId='math-base'), excluded])])
        view = dict(viewId='joint', scope=dict(jurisdiction='DE-DE', stage='CrossStage'),
            rootNodes=[structure('root', 'Mathematik', [structure('sek1', 'Sekundarstufe I', [year])])])
        n.add_acquisition_places(view)
        n.integrate_acquisition_contexts(view)
        n.declare_orders(view)
        self.assertEqual(n.atomic_roles(view['rootNodes']),
                         {'math-base': 'target', 'foreign-needed': 'prerequisiteOnly'})
        self.assertIn('foreign-needed', n.order_learning)
        self.assertEqual(len(year['childOrder']['after']), 1)
        self.assertEqual(year['childOrder']['after'][0]['after'], 'base')
        self.assertNotIn('acquisitionPlacement', excluded,
            'A foreign-only place must not add completion requirements to a surviving source topic')

    def test_later_application_does_not_join_its_prerequisite_basics(self):
        n = object.__new__(Normalizer)
        n.goals = {g: dict(id=g, title=g, contains=[], requires=r) for g, r in [
            ('base', []), ('application', ['base']), ('consumer', ['application'])]}
        n.cache = {}; n.parents = defaultdict(list); n.order_conflicts = []
        n.foreign_demands = {'context': [dict(goalId='application')]}
        base = structure('base-topic', 'Base', [dict(kind='goalEntry', goalId='base')])
        support = dict(kind='goalEntry', goalId='application', projectionRole='prerequisiteOnly', acquisitionPlacement=True)
        year = structure('j9', 'Jahrgangsstufe 9', [base,
            structure('j9-required-foundations', 'Benötigte Grundlagen', [support])])
        view = dict(viewId='context', scope={}, rootNodes=[year])
        n.integrate_acquisition_contexts(view)
        self.assertNotIn(support, base['children'])
        self.assertEqual(n.atomic_roles(view['rootNodes'])['application'], 'prerequisiteOnly')

    def test_shared_editorial_topic_identity_is_not_course_array_index(self):
        n = self.normalizer
        views = [dict(rootNodes=[structure('analysis-basics', 'Analysis',
            [structure('v3-preserved-' + index, 'Exponential- und periodische Modelle', [])])])
            for index in ['18', '21']]
        for view in views:
            n.stable_editorial_ids(view)
        self.assertEqual(views[0], views[1])

    def test_foreign_acquisition_policy_has_current_atomic_witnesses(self):
        n = self.normalizer
        policy = read(ROOT / 'app/scripts/config/math-foreign-acquisition-demand.json')
        self.assertEqual(policy['schemaVersion'], 1)
        places_by_view = {}
        for path, digest in policy['currentPhysicsSourcePins'].items():
            self.assertEqual(hashlib.sha256((ROOT / path).read_bytes()).hexdigest(), digest, path)
            view = read(ROOT / path)
            places_by_view[view['viewId']] = authored_places(view, n)
        rows = [row for values in policy['views'].values() for row in values]
        # The reviewed MV source-scope correction retired the former demand
        # for scalar multiplication (571793bd...) from this conditional policy.
        # The canonical skill and its prerequisites remain in the curriculum.
        self.assertEqual(len({row['goalId'] for row in rows}), 47)
        for row in rows:
            self.assertIn(row['goalId'], n.math_atoms)
            selected = earliest_consumer(places_by_view[row['physicsViewId']], row['goalId'], n)
            self.assertIsNotNone(selected, (row['physicsViewId'], row['goalId']))
            consumer, location = selected
            self.assertEqual(row['consumerGoalId'], consumer)
            self.assertEqual(row['consumerStructurePath'], location['path'])
            self.assertEqual(row['demandPlace'], list(location['place']) if location['place'] else None)
            self.assertEqual(row['requiresPath'][0], row['consumerGoalId'])
            self.assertEqual(row['requiresPath'][-1], row['goalId'])
            for dependent, prerequisite in zip(row['requiresPath'], row['requiresPath'][1:]):
                self.assertIn(prerequisite, [ref.split(':')[-1] for ref in n.goals[dependent].get('requires', [])])

    def test_elementary_topic_repair_is_limited_to_reviewed_atomic_subset(self):
        n = self.normalizer
        rule = n.preparation_topic_repairs[1]
        left = structure('j7-required-foundations-content-' + rule['leftFamily'], 'First taxonomy',
            [dict(kind='goalEntry', goalId=g, projectionRole='prerequisiteOnly', acquisitionPlacement=True)
             for g in rule['leftAllowedGoalIds']])
        right = structure('j7-required-foundations-content-' + rule['rightFamily'], 'Second taxonomy',
            [dict(kind='goalEntry', goalId=g, projectionRole='prerequisiteOnly', acquisitionPlacement=True)
             for g in rule['rightAllowedGoalIds']])
        view = dict(rootNodes=[structure('j7', 'Jahrgangsstufe 7', [left, right])])
        rejected = copy.deepcopy(view)
        rejected['rootNodes'][0]['children'][1]['children'].append(
            dict(kind='goalEntry', goalId='unreviewed-content', projectionRole='prerequisiteOnly'))
        n.repair_preparation_topics(rejected)
        self.assertEqual(len(rejected['rootNodes'][0]['children']), 2)
        roles = n.atomic_roles(view['rootNodes'])
        n.repair_preparation_topics(view)
        self.assertEqual(len(view['rootNodes'][0]['children']), 1)
        self.assertEqual(view['rootNodes'][0]['children'][0]['label'], 'Variablen und Terme')
        self.assertEqual(n.atomic_roles(view['rootNodes']), roles)

    def test_standalone_stage_templates_have_explicit_stage_order(self):
        n = object.__new__(Normalizer)
        n.goals = {}; n.order_conflicts = []
        view = dict(viewId='excerpt', scope={}, rootNodes=[
            structure('sek2-gk', 'Sekundarstufe II', []), structure('sek1', 'Sekundarstufe I', [])])
        n.ensure_stage_root(view)
        n.declare_orders(view)
        self.assertEqual(view['rootNodes'][0]['childOrder'], {'after': [dict(unit='sek2-gk', after='sek1')]})

    def test_preparation_cannot_precede_its_existing_target_prerequisite(self):
        n = object.__new__(Normalizer)
        n.goals = {
            'earlier-target': dict(id='earlier-target', title='Earlier', contains=[], requires=[], phase='J7'),
            'later-target': dict(id='later-target', title='Later', contains=[], requires=['preparation'], phase='J9'),
            'preparation': dict(id='preparation', title='Preparation', contains=[], requires=['earlier-target'], phase='J5'),
        }
        n.cache = {}; n.parents = defaultdict(list); n.evidence = defaultdict(lambda: defaultdict(list))
        n.decisions = {}; n.acquisitions = []; n.math_atoms = set(n.goals)
        view = dict(viewId='bounded-preparation', scope=dict(jurisdiction='DE-DE', stage='CrossStage'),
            rootNodes=[structure('math-layout-root', 'Mathematik', [structure('sek1', 'Sekundarstufe I', [
                structure('j7', 'Jahrgangsstufe 7', [dict(kind='goalEntry', goalId='earlier-target')]),
                structure('j9', 'Jahrgangsstufe 9', [dict(kind='goalEntry', goalId='later-target')]),
            ])])])
        n.add_acquisition_places(view)
        self.assertEqual(n.acquisitions[0]['path'], ['sek1', 'j7', 'j7-required-foundations'])

    def test_preparation_cannot_precede_another_preparation(self):
        n = object.__new__(Normalizer)
        n.goals = {g: dict(id=g, title=g, contains=[], requires=r, phase=p) for g, r, p in [
            ('a-dependent', ['z-preparation'], 'J5'), ('z-preparation', [], 'J8'),
            ('target', ['a-dependent'], 'J10')]}
        n.cache = {}; n.parents = defaultdict(list); n.evidence = defaultdict(lambda: defaultdict(list))
        n.decisions = {}; n.acquisitions = []; n.math_atoms = set(n.goals)
        view = dict(viewId='preparation-order', scope=dict(jurisdiction='DE-DE', stage='CrossStage'),
            rootNodes=[structure('root', 'Mathematik', [structure('sek1', 'Sekundarstufe I',
                [structure('j10', 'Jahrgangsstufe 10', [dict(kind='goalEntry', goalId='target')])])])])
        n.add_acquisition_places(view)
        paths = {row['goalId']: row['path'] for row in n.acquisitions}
        self.assertEqual(paths['a-dependent'][1], 'math-acquisition-seki-j8')
        self.assertEqual(paths['z-preparation'][1], 'math-acquisition-seki-j8')
        self.assertEqual({g for g, role in n.atomic_roles(view['rootNodes']).items() if role == 'target'}, {'target'})

    def test_all_live_mathematics_views_are_normalized(self):
        paths = sorted((ROOT / 'curricula/DE/Gymnasium/composition-views/mathematik').glob('*.view.json'))
        self.assertEqual(len(paths), 100)
        self.normalizer.order_conflicts = []
        self.normalizer.learning_window_conflicts = []
        for path in paths:
            with self.subTest(path=path.name):
                value = read(path)
                self.assertEqual(value.get('$schema'), SCHEMA)
                self.assertEqual(value.get('viewFormatVersion'), '1.2')
                self.assertEqual(self.normalizer.normalize(value), value)
        self.assertEqual(self.normalizer.learning_window_conflicts, [], 'Every selected preparation must fit its actual demand window')
        self.assertEqual(self.normalizer.order_conflicts, [], 'All 100 authored views must have learnable contiguous sibling units')

    def test_duration_inputs_are_independent_and_current(self):
        policy = read(ROOT / 'app/scripts/config/math-duration-stage-placement-policy.json')
        self.assertEqual(len(policy['baseViews']), 6)
        for filename, baseline in policy['baseViews'].items():
            with self.subTest(filename=filename):
                actual = read(ROOT / 'curricula/DE/Gymnasium/composition-views/mathematik' / filename)
                self.assertEqual(self.normalizer.normalize(baseline), actual)


if __name__ == '__main__':
    unittest.main()
