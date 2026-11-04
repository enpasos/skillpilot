#!/usr/bin/env python3
"""Negative contracts for the strict corpus evidence validator; no curriculum edits."""
import copy
import hashlib
import json
import os
from pathlib import Path
import tempfile
import subprocess
import unittest

from check_curriculum_completion_integrity_report import CLASS, CORPUS_METHOD, REQUIRED_SUBJECTS, GYMNASIUM_ROOT, canonical_pc_scopes, validate
from curriculum_completion_inputs import current_input_paths, MATH_VIEW_PLAN, MATH_VIEW_POLICY


class ReportContractTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        self.subject = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
        self.inventory = {key: 'Subject ' + key[:8] for key in sorted(REQUIRED_SUBJECTS)}
        data = {
            'app/scripts/config/curriculum-maturity-floor-policy.json': {'floors': [
                {'landscapeId': key, 'subject': label, 'minimumMaturity': 'M7'} for key, label in self.inventory.items()]},
            'docs/qa-ci/status/curriculum-quality-status.json': {'curricula': [
                {'landscapeId': key, 'subject': label, 'maturity': 'M7'} for key, label in self.inventory.items()]},
        }
        for relative, value in data.items():
            self.write(relative, json.dumps(value))
        self.write('app/src/generated/gymnasiumDurationOfferings.ts',
                   'export const GYMNASIUM_CONTENT_OFFERINGS = ' + repr({self.subject: {
                       'DE-HE': {'stages': ['SekI'], 'durationModels': ['G9']}}})
                   + ' as const satisfies GymnasiumContentOfferings')
        overview = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json'
        self.overview = {'filters': [{'id': 'ALL'}], 'personalizationFlow': {'stages': [{'groups': [
            {'source': {'kind': 'offeredLandscapes', 'landscapeIds': [self.subject],
                        'scopeBindings': [{'dimension': 'jurisdiction', 'omitValues': ['ALL']}]}},
            {'source': {'kind': 'scopeValues', 'scopeKey': 'stage',
                        'values': [{'value': value} for value in ['SekI', 'SekII', 'CrossStage']]}},
            {'source': {'kind': 'offeredFiltersForSelectedLandscapes', 'scopeKey': 'courseProfile',
                        'filterIds': ['GK', 'LK', 'GK+LK']}},
            {'source': {'kind': 'offeredScopeValues', 'scopeKey': 'durationModel',
                        'landscapeIds': [self.subject], 'values': [{'value': 'G8'}, {'value': 'G9'}],
                        'optionalWhenUnavailable': True, 'scopeBindings': [
                            {'dimension': 'stage', 'values': ['SekI', 'SekII', 'CrossStage']},
                            {'dimension': 'courseProfile', 'values': ['GK', 'LK']}]}}
        ]}]}}
        self.write(overview, json.dumps(self.overview))
        view_path = 'curricula/DE/Gymnasium/composition-views/subject/all-seki.view.json'
        self.write(view_path, json.dumps({'viewId': 'all-seki', 'landscapeId': self.subject,
                                         'scope': {'schoolForm': 'Gymnasium', 'stage': 'SekI'}}))
        paths = [*data, 'app/src/generated/gymnasiumDurationOfferings.ts', overview, view_path]
        self.binding = {'gitCommit': 'a' * 40, 'subjectSelector': self.subject, 'executionId': 'test-execution',
                        'ciRunId': os.environ.get('GITHUB_RUN_ID'), 'ciRunAttempt': os.environ.get('GITHUB_RUN_ATTEMPT'),
                        'files': {path: hashlib.sha256((self.root / path).read_bytes()).hexdigest() for path in paths}}
        self.report_path = self.root / 'report/audit.json'
        self.junit_path = self.root / 'report/junit.xml'
        label = self.inventory[self.subject]
        row = {'landscapeId': self.subject, 'subject': label, 'scope': 'DE-HE/SekI/G9/GK+LK',
               'authoritative': True, 'targetCount': 1, 'targetGoalIds': ['exam'], 'passed': True,
               'uncovered': [], 'protectedSupportContext': ['support-memory'], 'unreadyAssessments': []}
        canonical = dict(row, scope='canonical', authoritative=False, passed=False, uncovered=[{'goalId': 'support'}])
        row.update(duplicateVisibleGoalPaths={}, duplicateStructureIds={}, visibleHierarchyViewIds=['test-view'], visibleHierarchyGoalCount=1)
        row.update(visibleHierarchyTargetGoalIds=['exam'], visibleHierarchyGoalIds=['exam'],
                   missingVisibleGoalIds=[], unexpectedVisibleGoalIds=[])
        row['compositionViewIds'] = ['test-view']
        all_row = copy.deepcopy(row)
        all_row.update(scope='ALL/SekI//', personalCurriculumConfig={
            GYMNASIUM_ROOT: {'selected': True, 'filterId': 'ALL', 'stage': 'SekI'},
            self.subject: {'selected': True}},
            requestedCompositionScope={'schoolForm': 'Gymnasium', 'stage': 'SekI'})
        self.report = {'schemaVersion': 4, 'inputBinding': self.binding, 'auditMode': 'single-subject',
                       'protectedSubjects': self.inventory, 'selectedSubjects': {self.subject: label},
                       'unexaminedSubjects': {key: value for key, value in self.inventory.items() if key != self.subject},
                       'currentMaturityStatus': {key: {'subject': value, 'protectedFloor': 'M7', 'currentStatus': 'M7'}
                                                 for key, value in self.inventory.items()},
                       'completeProtectedInventoryAudited': False, 'allProtectedSubjectsIntegrityPassed': False,
                       'selectedIntegrityPassed': True, 'fatalError': None, 'scopes': [row, canonical, all_row],
                       'checkedOfferedScopes': 2, 'checkedCountryOfferedScopes': 1,
                       'checkedCanonicalPersonalCurriculumScopes': 1, 'canonicalDiagnosticScopes': 1, 'checkedScopes': 3,
                       'failedScopes': 0, 'failedRouteScopes': 0, 'failedReadinessScopes': 0, 'failedHierarchyScopes': 0}
        self.xml = (f'<testsuite name="{CLASS}" tests="1" skipped="0" failures="0" errors="0">'
                    f'<testcase name="{CORPUS_METHOD}()"/>'
                    '<system-out>CURRICULUM_COMPLETION_AUDIT_EXECUTION:test-execution</system-out></testsuite>')

    def write(self, relative, value):
        path = self.root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(value)

    def check(self):
        self.write('report/audit.json', json.dumps(self.report))
        self.write('report/input-manifest.json', json.dumps(self.binding))
        self.write('report/junit.xml', self.xml)
        return validate(self.report_path, self.junit_path, self.subject, 'a' * 40, self.root)

    def test_complete_single_subject_pass_is_not_an_overall_acceptance(self):
        self.assertIn('4 subjects unexamined', self.check())

    def test_missing_duplicate_or_foreign_offerings_are_rejected(self):
        original = copy.deepcopy(self.report)
        for rows in [self.report['scopes'][1:], self.report['scopes'] + [self.report['scopes'][0]],
                     [dict(self.report['scopes'][0], landscapeId='other'), self.report['scopes'][1]]]:
            self.report = dict(original, scopes=rows)
            with self.assertRaises(ValueError):
                self.check()

    def test_all_scope_omissions_duplicates_and_fake_durations_are_rejected(self):
        original = copy.deepcopy(self.report)
        for rows in [original['scopes'][:2], original['scopes'] + [original['scopes'][2]],
                     [*original['scopes'][:2], dict(original['scopes'][2], scope='ALL/SekI/G9/GK+LK')]]:
            self.report = dict(original, scopes=rows)
            with self.assertRaisesRegex(ValueError, 'Incomplete offered scopes'):
                self.check()

    def test_raw_canonical_diagnostic_cannot_replace_an_all_personal_curriculum(self):
        self.report['scopes'][2]['authoritative'] = False
        with self.assertRaisesRegex(ValueError, 'Incomplete offered scopes'):
            self.check()

    def test_all_missing_dimensions_and_resolver_scope_are_exact(self):
        original = copy.deepcopy(self.report['scopes'][2])
        for key, value in [('durationModel', 'G9'), ('filterId', 'GK+LK')]:
            self.report['scopes'][2] = copy.deepcopy(original)
            target = GYMNASIUM_ROOT if key == 'durationModel' else self.subject
            self.report['scopes'][2]['personalCurriculumConfig'][target][key] = value
            with self.assertRaisesRegex(ValueError, 'Invented or missing ALL'):
                self.check()
        self.report['scopes'][2] = copy.deepcopy(original)
        self.report['scopes'][2]['requestedCompositionScope']['jurisdiction'] = 'ALL'
        with self.assertRaisesRegex(ValueError, 'Incorrect ALL composition scope'):
            self.check()

    def test_all_rows_use_the_same_readiness_route_and_hierarchy_gate(self):
        original = copy.deepcopy(self.report['scopes'][2])
        for field, value in [('uncovered', [{'goalId': 'orphan'}]),
                             ('unreadyAssessments', [{'goalId': 'draft'}]),
                             ('missingVisibleGoalIds', ['exam'])]:
            self.report['scopes'][2] = dict(original, **{field: value})
            with self.assertRaises(ValueError):
                self.check()

    def test_all_metadata_oracle_does_not_invent_stage_course_or_duration_choices(self):
        def add_view(stage, course):
            path = f'curricula/DE/Gymnasium/composition-views/subject/all-{stage}-{course}.view.json'
            self.write(path, json.dumps({'viewId': stage + course, 'landscapeId': self.subject,
                                        'scope': {'schoolForm': 'Gymnasium', 'stage': stage, 'courseProfile': course}}))
        add_view('CrossStage', 'GK')
        self.assertEqual({'ALL/SekI//', 'ALL/CrossStage//GK'}, canonical_pc_scopes(self.root, self.subject))
        add_view('CrossStage', 'LK')
        self.assertEqual({'ALL/SekI//', *['ALL/CrossStage//' + value for value in ['GK', 'LK', 'GK+LK']]},
                         canonical_pc_scopes(self.root, self.subject))
        add_view('SekII', 'GK')
        add_view('SekII', 'LK')
        self.assertEqual({'ALL/SekI//', *['ALL/' + stage + '//' + value for stage in ['SekII', 'CrossStage']
                                         for value in ['GK', 'LK', 'GK+LK']]},
                         canonical_pc_scopes(self.root, self.subject))

    def add_complete_course_union(self, country='ALL'):
        if country == 'ALL':
            for course in ['GK', 'LK']:
                self.bind(f'curricula/DE/Gymnasium/composition-views/subject/all-cross-{course}.view.json',
                          json.dumps({'viewId': 'all-cross-' + course, 'landscapeId': self.subject,
                                      'scope': {'schoolForm': 'Gymnasium', 'stage': 'CrossStage', 'courseProfile': course}}))
        else:
            self.bind('app/src/generated/gymnasiumDurationOfferings.ts',
                      'export const GYMNASIUM_CONTENT_OFFERINGS = ' + repr({self.subject: {
                          'DE-HE': {'stages': ['SekI', 'CrossStage'], 'durationModels': ['G9']}}})
                      + ' as const satisfies GymnasiumContentOfferings')
        for course, targets in [('GK', ['shared', 'gk']), ('LK', ['shared', 'lk']),
                                ('GK+LK', ['shared', 'gk', 'lk'])]:
            row = copy.deepcopy(self.report['scopes'][2])
            duration = '' if country == 'ALL' else 'G9'
            row.update(scope='/'.join([country, 'CrossStage', duration, course]))
            row['personalCurriculumConfig'][GYMNASIUM_ROOT].update(filterId=country, stage='CrossStage')
            row['personalCurriculumConfig'][self.subject]['filterId'] = course
            row['requestedCompositionScope'].update(stage='CrossStage', courseProfile=course)
            self.set_consistent_targets(row, targets)
            self.report['scopes'].append(row)
        self.report['checkedOfferedScopes'] += 3
        self.report['checkedScopes'] += 3
        counter = 'checkedCanonicalPersonalCurriculumScopes' if country == 'ALL' else 'checkedCountryOfferedScopes'
        self.report[counter] += 3
        return self.report['scopes'][-1]

    @staticmethod
    def set_consistent_targets(row, targets):
        # Keep every per-row count and hierarchy check correct, so only the
        # independent inter-scope set equality can detect a broken union.
        row.update(targetGoalIds=targets, targetCount=len(targets), visibleHierarchyGoalCount=len(targets),
                   visibleHierarchyTargetGoalIds=targets[:], visibleHierarchyGoalIds=targets[:])

    def test_complete_country_and_all_course_unions_pass(self):
        self.add_complete_course_union('DE-HE')
        self.add_complete_course_union()
        self.assertIn('2 exact course unions', self.check())

    def test_missing_union_target_fails_with_consistent_counts_and_hierarchy(self):
        union = self.add_complete_course_union()
        self.set_consistent_targets(union, ['shared', 'gk'])
        with self.assertRaisesRegex(ValueError, r'Incorrect GK\+LK target union'):
            self.check()

    def test_additional_union_target_fails_with_consistent_counts_and_hierarchy(self):
        union = self.add_complete_course_union('DE-HE')
        self.set_consistent_targets(union, ['shared', 'gk', 'lk', 'foreign'])
        with self.assertRaisesRegex(ValueError, r'Incorrect GK\+LK target union'):
            self.check()

    def test_unknown_all_view_stage_course_and_duration_fail_closed(self):
        path = 'curricula/DE/Gymnasium/composition-views/subject/all-seki.view.json'
        original = json.loads((self.root / path).read_text())
        for dimension, value, message in [('stage', 'SekIII', 'stage'),
                                          ('courseProfile', 'UNKNOWN', 'course profile'),
                                          ('durationModel', 'G10', 'duration')]:
            with self.subTest(dimension=dimension):
                changed = copy.deepcopy(original)
                changed['scope'][dimension] = value
                self.bind(path, json.dumps(changed))
                with self.assertRaisesRegex(ValueError, 'Unknown ALL view ' + message):
                    self.check()

    def test_failed_skipped_or_wrong_corpus_execution_is_rejected(self):
        original = self.xml
        for changed in [original.replace('skipped="0"', 'skipped="1"'),
                        original.replace('failures="0"', 'failures="1"'),
                        original.replace(CORPUS_METHOD, 'anotherMethod'),
                        original.replace('test-execution</system-out>', 'stale-execution</system-out>')]:
            self.xml = changed
            with self.assertRaises(ValueError):
                self.check()

    def test_current_commit_and_content_bindings_are_required(self):
        self.report['inputBinding'] = dict(self.binding, gitCommit='b' * 40)
        with self.assertRaises(ValueError):
            self.check()
        self.report['inputBinding'] = self.binding
        self.write('app/src/generated/gymnasiumDurationOfferings.ts', 'changed')
        with self.assertRaises(ValueError):
            self.check()

    def test_failed_data_or_false_full_acceptance_is_rejected(self):
        for field, value in [('selectedIntegrityPassed', False), ('allProtectedSubjectsIntegrityPassed', True),
                             ('failedScopes', 1), ('unexaminedSubjects', {})]:
            old = self.report[field]
            self.report[field] = value
            with self.assertRaises(ValueError):
                self.check()
            self.report[field] = old

    def test_unready_target_assessments_and_legacy_semantics_are_rejected(self):
        self.report['scopes'][0]['unreadyAssessments'] = [{'goalId': 'exam', 'reason': 'missing rubric'}]
        with self.assertRaisesRegex(ValueError, 'Failed offered scope'):
            self.check()
        del self.report['scopes'][0]['unreadyAssessments']
        with self.assertRaisesRegex(ValueError, 'Failed offered scope'):
            self.check()
        self.report['scopes'][0]['unreadyAssessments'] = []
        self.report['schemaVersion'] = 3
        with self.assertRaisesRegex(ValueError, 'stale report binding'):
            self.check()

    def test_new_unbound_view_or_source_snapshot_is_rejected(self):
        for relative in ['curricula/DE/Gymnasium/composition-views/mathematik/new.view.json',
                         'curricula/DE/Gymnasium/input/SH/upper-secondary/source-json/new.de.json.snapshot']:
            self.write(relative, '{}')
            with self.assertRaisesRegex(ValueError, 'input path inventory'):
                self.check()
            (self.root / relative).unlink()

    def test_missing_or_duplicate_mathematics_visible_paths_are_rejected(self):
        original = copy.deepcopy(self.report['scopes'][0])
        for field, value in [('duplicateVisibleGoalPaths', {'goal': ['first', 'second']}),
                             ('duplicateVisibleGoalPaths', None), ('visibleHierarchyViewIds', []),
                             ('visibleHierarchyViewIds', ['not-the-resolved-view']),
                             ('visibleHierarchyGoalCount', 0)]:
            self.report['scopes'][0] = dict(original, **{field: value})
            with self.assertRaisesRegex(ValueError, 'Mathematics'):
                self.check()
        self.report['scopes'][0] = original
        self.report['failedHierarchyScopes'] = 1
        with self.assertRaisesRegex(ValueError, 'failure counters'):
            self.check()

    def test_extra_clusters_cannot_hide_a_missing_visible_atomic_target(self):
        row = self.report['scopes'][0]
        row.update(visibleHierarchyTargetGoalIds=['exam', 'cluster'], visibleHierarchyGoalIds=['cluster'],
                   visibleHierarchyGoalCount=1)
        # The visible count still equals atomic targetCount=1. Exact IDs must
        # reject the omitted exam, even if the missing-ID diagnostic falsely says [].
        with self.assertRaisesRegex(ValueError, 'Mathematics visible hierarchy inventory'):
            self.check()

    def test_duplicate_structure_ids_fail_even_when_all_visible_goals_are_unique(self):
        original = copy.deepcopy(self.report['scopes'][0])
        for value in [{'actual-view': {'same-id': ['actual-view/0/0', 'actual-view/1/0']}}, None, []]:
            self.report['scopes'][0] = dict(original, duplicateStructureIds=value)
            self.assertEqual(self.report['scopes'][0]['duplicateVisibleGoalPaths'], {})
            with self.assertRaisesRegex(ValueError, 'Mathematics structure-ID check'):
                self.check()
        self.report['scopes'][0] = copy.deepcopy(original)
        del self.report['scopes'][0]['duplicateStructureIds']
        with self.assertRaisesRegex(ValueError, 'Mathematics structure-ID check'):
            self.check()

    def bind(self, relative, content):
        self.write(relative, content)
        self.binding['files'][relative] = hashlib.sha256((self.root / relative).read_bytes()).hexdigest()

    def check_added_then_changed(self, relative, content='{}'):
        self.write(relative, content)
        with self.assertRaisesRegex(ValueError, 'input path inventory'):
            self.check()
        self.bind(relative, content)
        self.assertIn('4 subjects unexamined', self.check())
        self.write(relative, content.replace('"ordinary"', '"changed"') if '"ordinary"' in content else '{"changed":true}')
        with self.assertRaisesRegex(ValueError, 'Changed bound input'):
            self.check()
        (self.root / relative).unlink()
        del self.binding['files'][relative]

    def test_recursive_views_bind_all_five_shadow_directory_names(self):
        view = json.dumps({'viewId': 'nested-runtime-view', 'landscapeId': self.subject,
                           'scope': {'jurisdiction': 'DE-SH', 'schoolForm': 'Gymnasium', 'stage': 'SekI'},
                           'rootNodes': [{'kind': 'goalEntry', 'goalId': 'ordinary', 'projectionRole': 'target'}]})
        for directory in ['assessments', 'visualizations', 'quality', 'completion-profiles', 'completion-scopes']:
            with self.subTest(directory=directory):
                self.check_added_then_changed(f'curricula/DE/Gymnasium/composition-views/mathematik/{directory}/new.view.json', view)

    def test_nested_source_snapshots_and_mappings_bind_shadow_directory_names(self):
        for directory in ['assessments', 'visualizations', 'quality', 'completion-profiles', 'completion-scopes']:
            for relative in [f'curricula/DE/Gymnasium/input/SH/{directory}/new.de.json.snapshot',
                             f'curricula/DE/Gymnasium/mapping/DE-SH/{directory}/new.json']:
                with self.subTest(relative=relative):
                    self.check_added_then_changed(relative)

    def test_assessment_and_visualization_roots_are_not_reserved(self):
        for directory in ['assessments', 'visualizations']:
            with self.subTest(directory=directory):
                self.check_added_then_changed(f'curricula/DE/Gymnasium/{directory}/runtime.json')

    def test_registry_sources_are_bound_even_under_reserved_roots_or_with_non_json_extensions(self):
        for source, reference in [('curricula/DE/Gymnasium/quality/source.pdf',
                                   'curricula/DE/Gymnasium/quality/source.pdf'),
                                  ('curricula/DE/Gymnasium/input/HE/source.pdf',
                                   'curricula/DE/Gymnasium/input/DE-HE/source.pdf')]:
            with self.subTest(source=source):
                registry = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
                self.write(source, 'source')
                self.bind(registry, json.dumps({'entries': [{'archiveSourcePath': reference}]}))
                with self.assertRaisesRegex(ValueError, 'input path inventory'):
                    self.check()
                self.bind(source, 'source')
                self.assertIn('4 subjects unexamined', self.check())
                self.write(source, 'changed')
                with self.assertRaisesRegex(ValueError, 'Changed bound input'):
                    self.check()
                (self.root / source).unlink()
                del self.binding['files'][source]

    def test_nonruntime_qa_artifacts_do_not_change_the_input_contract(self):
        self.write('curricula/DE/Gymnasium/quality/example/report.json', '{}')
        self.assertIn('4 subjects unexamined', self.check())

    def test_metadata_mapping_roots_and_local_code_bytes_are_bound(self):
        for relative in ['curricula/DE/Gymnasium/completion-profiles/mapping/runtime.json',
                         'curricula/DE/Gymnasium/completion-scopes/mapping/runtime.json',
                         'backend/src/main/java/example/Loader.java', 'backend/build.gradle.kts',
                         'scripts/curriculum_completion_inputs.py']:
            with self.subTest(relative=relative):
                self.check_added_then_changed(relative)

    def test_sparse_checkout_cannot_hide_a_tracked_functional_input(self):
        relative = 'curricula/DE/Gymnasium/completion-scopes/mapping/runtime.json'
        self.bind(relative, '{}')
        subprocess.run(['git', 'init', '-q', str(self.root)], check=True)
        subprocess.run(['git', '-C', str(self.root), 'add', relative], check=True)
        self.assertIn('4 subjects unexamined', self.check())
        (self.root / relative).unlink()
        # It remains required even though discovery from disk cannot see it.
        with self.assertRaisesRegex(ValueError, 'Missing bound input'):
            self.check()

    def test_workflow_sparse_hydration_restores_registry_evidence_and_runtime_json(self):
        registry = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
        source = 'curricula/DE/Gymnasium/quality/archive/source.any-extension'
        extraction = 'curricula/DE/Gymnasium/quality/missing/source-extraction/fallback.source-extraction.json'
        runtime = 'curricula/DE/Gymnasium/visualizations/runtime.json'
        offline = 'curricula/DE/Gymnasium/quality/unreferenced/bulk.json'
        for relative in [source, extraction, runtime, offline]:
            self.write(relative, '{}')
        self.write(registry, json.dumps({'entries': [
            {'archiveSourcePath': source},
            {'archiveSourcePath': 'curricula/DE/Gymnasium/quality/missing/source.pdf'},
        ]}))
        def git(*arguments, **kwargs):
            return subprocess.run(['git', '-C', str(self.root), *arguments], check=True,
                                  capture_output=True, **kwargs)
        git('init', '-q')
        git('add', '.')
        git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'fixture')
        expected = current_input_paths(self.root)
        git('sparse-checkout', 'set', '--no-cone', '/app/', '/docs/',
            '/curricula/DE/Gymnasium/provenance/')
        self.assertFalse((self.root / source).exists())
        patterns = '\n'.join('/' + path for path in sorted(current_input_paths(self.root))) + '\n'
        git('sparse-checkout', 'add', '--stdin', input=patterns.encode())
        self.assertEqual(expected, current_input_paths(self.root))
        self.assertTrue(all((self.root / path).is_file() for path in expected))
        self.assertFalse((self.root / offline).exists())

    def test_sparse_hydration_restores_declared_view_review_and_snapshot_inputs(self):
        review = 'curricula/DE/Gymnasium/quality/review/independent.json'
        allowance = 'curricula/DE/Gymnasium/quality/review/allowance.json'
        snapshot = 'curricula/DE/Gymnasium/quality/review/source.view.json'
        contract = 'curricula/DE/Gymnasium/quality/placement/exact.json'
        baseline = 'curricula/DE/Gymnasium/quality/placement/before-finite-plan.json'
        offline = 'curricula/DE/Gymnasium/quality/unrelated/bulk.json'
        historical = 'tmp/unpublished-native-history.json'

        def binding(relative):
            return {'path': relative, 'sha256': hashlib.sha256(
                (self.root / relative).read_bytes()).hexdigest()}

        # Referenced JSON is deliberately opaque: only explicit policy/plan
        # bindings are followed, including the contract's nested baseline pin.
        self.write(review, json.dumps({'historicalInput': {'path': historical, 'sha256': 'a' * 64}}))
        self.write(allowance, json.dumps({'review': binding(review)}))
        self.write(snapshot, '{}')
        self.write(baseline, json.dumps({'nativeInput': {'path': historical, 'sha256': 'a' * 64}}))
        self.write(contract, json.dumps({'baseFinitePlan': binding(baseline), 'contentReview': binding(review)}))
        self.write(offline, '{}')
        self.write(MATH_VIEW_PLAN, json.dumps({
            'independentDecisionBindings': [binding(review)],
            'producerSourceSnapshots': {'source': binding(snapshot)},
            'reviewedExistingAssessmentChanges': binding(allowance),
            'futurePlacementContract': binding(contract),
            'nativeInput': {'path': historical, 'sha256': 'a' * 64},
        }))
        self.write(MATH_VIEW_POLICY, json.dumps({'stageDecisionBindings': [
            binding(MATH_VIEW_PLAN), binding(review), binding(allowance),
            binding(contract), binding(baseline),
        ]}))

        def git(*arguments, **kwargs):
            return subprocess.run(['git', '-C', str(self.root), *arguments], check=True,
                                  capture_output=True, **kwargs)

        git('init', '-q')
        git('add', '.')
        git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid',
            'commit', '-qm', 'fixture')
        expected = current_input_paths(self.root)
        self.assertTrue({review, allowance, snapshot, contract, baseline, MATH_VIEW_POLICY} <= expected)
        self.assertNotIn(offline, expected)
        self.assertNotIn(historical, expected)
        # Neither plan, policy nor quality dependencies are initially present.
        git('sparse-checkout', 'set', '--no-cone', '/docs/',
            '/curricula/DE/Gymnasium/canonical/')
        self.assertFalse((self.root / MATH_VIEW_PLAN).exists())
        self.assertFalse((self.root / MATH_VIEW_POLICY).exists())
        self.assertEqual(expected, current_input_paths(self.root))
        patterns = '\n'.join('/' + path for path in sorted(expected)) + '\n'
        git('sparse-checkout', 'add', '--stdin', input=patterns.encode())
        self.assertTrue(all((self.root / path).is_file() for path in expected))
        self.assertFalse((self.root / offline).exists())
        self.assertEqual(expected, current_input_paths(self.root))

    def test_declared_view_dependencies_remain_hash_bound_and_cannot_escape(self):
        review = 'curricula/DE/Gymnasium/quality/review/independent.json'
        digest = hashlib.sha256(b'{}').hexdigest()
        self.bind(MATH_VIEW_POLICY, '{}')
        self.bind(MATH_VIEW_PLAN, json.dumps({
            'independentDecisionBindings': [{'path': review, 'sha256': digest}],
        }))
        self.bind(review, '{}')
        self.assertIn('4 subjects unexamined', self.check())
        self.write(review, '{"changed":true}')
        with self.assertRaisesRegex(ValueError, 'Changed bound input'):
            self.check()
        (self.root / review).unlink()
        with self.assertRaisesRegex(ValueError, 'Missing bound input'):
            self.check()
        for relative in ['../outside.json', '/outside.json', 'curricula/../../outside.json']:
            with self.subTest(relative=relative):
                self.write(MATH_VIEW_PLAN, json.dumps({
                    'independentDecisionBindings': [{'path': relative, 'sha256': digest}],
                }))
                with self.assertRaisesRegex(ValueError, 'Invalid declared view-check input'):
                    current_input_paths(self.root)

    def test_policy_declared_nested_sources_fail_closed_when_missing_or_changed(self):
        source = 'curricula/DE/Gymnasium/quality/placement/before.json'
        self.write(MATH_VIEW_PLAN, '{}')
        self.write(MATH_VIEW_POLICY, json.dumps({'stageDecisionBindings': [
            {'path': source, 'sha256': hashlib.sha256(b'{}').hexdigest()},
        ]}))
        with self.assertRaisesRegex(ValueError, 'Missing bound input'):
            current_input_paths(self.root)
        self.write(source, '{}')
        self.assertIn(source, current_input_paths(self.root))
        self.write(source, '{"changed":true}')
        with self.assertRaisesRegex(ValueError, 'Changed bound input'):
            current_input_paths(self.root)

    def test_policy_declared_dependencies_reject_malformed_pins_and_paths(self):
        self.write(MATH_VIEW_PLAN, '{}')
        source = 'curricula/DE/Gymnasium/quality/placement/before.json'
        digest = hashlib.sha256(b'{}').hexdigest()
        self.write(source, '{}')
        malformed = [None, 'source', {}, {'sha256': digest},
                     *({'path': path, 'sha256': digest} for path in [
                         '', '../outside.json', '/outside.json', 'C:/outside.json',
                         'curricula/./source.json', 'curricula//source.json',
                         'curricula\\source.json', 'curricula/quality/*.json',
                         'curricula/source\n/other.json']),
                     *({'path': source, 'sha256': value} for value in [None, '', 'x', 'a' * 63, 'A' * 64])]
        for pin in malformed:
            with self.subTest(pin=pin):
                self.write(MATH_VIEW_POLICY, json.dumps({'stageDecisionBindings': [pin]}))
                with self.assertRaisesRegex(ValueError, 'Invalid declared view-check'):
                    current_input_paths(self.root)
        outside = self.root.parent / (self.root.name + '-external.json')
        outside.write_text('{}')
        self.addCleanup(outside.unlink)
        (self.root / source).unlink()
        (self.root / source).symlink_to(outside)
        self.write(MATH_VIEW_POLICY, json.dumps({'stageDecisionBindings': [
            {'path': source, 'sha256': digest},
        ]}))
        with self.assertRaisesRegex(ValueError, 'Invalid declared view-check input'):
            current_input_paths(self.root)

    def test_registry_fallback_extractions_are_bound_inside_reserved_roots(self):
        for route, source_present in [('archive/', True), ('', True), ('archive/', False), ('', False)]:
            with self.subTest(route=route, source_present=source_present):
                source = 'curricula/DE/Gymnasium/quality/source.pdf'
                if source_present:
                    self.bind(source, 'source')
                elif (self.root / source).exists():
                    (self.root / source).unlink()
                    del self.binding['files'][source]
                self.bind('curricula/DE/Gymnasium/provenance/source-landscape-registry.json', json.dumps({'entries': [{
                    'archiveSourcePath': source, 'archivePath': 'curricula/DE/Gymnasium/quality/archive'}]}))
                self.check_added_then_changed(f'curricula/DE/Gymnasium/quality/{route}source-extraction/nested/runtime.source-extraction.json')


if __name__ == '__main__':
    unittest.main()
