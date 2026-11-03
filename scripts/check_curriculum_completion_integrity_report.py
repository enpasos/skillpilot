#!/usr/bin/env python3
"""Require a complete, current, zero-failure subject/all-subject corpus result."""
import argparse
import ast
import hashlib
import json
import os
from pathlib import Path
import subprocess
import xml.etree.ElementTree as ET

from curriculum_completion_inputs import current_input_paths

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_SUBJECTS = {
    '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced', '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a',
    '08a43a1b-d97e-522c-9dfa-c950a493364e', 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0',
    '605bdaf6-32d5-56fd-8d92-5a80c2fd2901',
}
CORPUS_METHOD = 'everyM7CurriculumTargetRemainsNeededUntilARealGoalIsMastered'
CLASS = 'com.skillpilot.backend.completion.CurriculumCompletionIntegrityTest'
MATHEMATICS = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
GYMNASIUM_ROOT = 'a0e13c56-c25f-4742-9272-3a1a603ee52e'


def require(condition, message):
    if not condition:
        raise ValueError(message)


def load(path):
    return json.loads(path.read_text())


def expected_scopes(countries):
    require(isinstance(countries, dict) and countries, 'Missing subject offerings')
    result = []
    for country, offer in countries.items():
        stages, durations = offer.get('stages'), offer.get('durationModels')
        require(isinstance(stages, list) and stages and isinstance(durations, list), 'Empty offering inventory')
        require(all(isinstance(value, str) and value for value in durations), 'Empty offering duration')
        for stage in stages:
            require(stage in {'SekI', 'SekII', 'CrossStage'}, 'Unknown offering stage')
            for duration in durations or ['']:
                for course in ['GK+LK'] if stage == 'SekI' else ['GK', 'LK', 'GK+LK']:
                    result.append('/'.join([country, stage, duration, course]))
    require(result and len(result) == len(set(result)), 'Empty or duplicate offering scopes')
    return set(result)


def canonical_pc_scopes(root, landscape_id):
    """Independent metadata oracle for the authored ALL flow, without guessed dimensions.

    The JVM enumerates real planner actions. This check separately binds that
    enumeration to jurisdiction-free view scopes and the authored flow choices.
    A duration-neutral compatible view does not itself offer a duration choice.
    """
    overview = load(root / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json')
    require(any(row.get('id') == 'ALL' for row in overview.get('filters', [])), 'ALL filter is not authored')
    sources = [group['source'] for stage in overview['personalizationFlow']['stages'] for group in stage['groups']]
    subject_source = next(source for source in sources if source['kind'] == 'offeredLandscapes')
    require(landscape_id in subject_source['landscapeIds'], 'Subject is not authored in the ALL flow')
    require(any(binding.get('dimension') == 'jurisdiction' and 'ALL' in binding.get('omitValues', [])
                for binding in subject_source['scopeBindings']), 'ALL jurisdiction omission is not authored')
    stage_source = next(source for source in sources if source.get('scopeKey') == 'stage')
    profile_source = next(source for source in sources if source.get('scopeKey') == 'courseProfile')
    duration_source = next(source for source in sources if source.get('scopeKey') == 'durationModel')
    require(stage_source['kind'] == 'scopeValues'
            and profile_source['kind'] == 'offeredFiltersForSelectedLandscapes'
            and duration_source['kind'] == 'offeredScopeValues'
            and duration_source.get('optionalWhenUnavailable') is True,
            'Changed ALL planner inventory semantics')
    stages = {value['value'] for value in stage_source['values']}
    profiles = profile_source['filterIds']
    duration_values = {value['value'] for value in duration_source['values']}
    require(stages and stages <= {'SekI', 'SekII', 'CrossStage'}, 'Unknown ALL flow stage')
    require(profiles and set(profiles) <= {'GK', 'LK', 'GK+LK'}, 'Unknown ALL flow course profile')
    require(duration_values and duration_values <= {'G8', 'G9'}, 'Unknown ALL flow duration')
    views = [load(path) for path in (root / 'curricula/DE/Gymnasium/composition-views').rglob('*.view.json')]
    views = [view for view in views if not view.get('scope', {}).get('jurisdiction')
             and view.get('landscapeId') in duration_source['landscapeIds']]
    for view in views:
        scope = view['scope']
        require(scope.get('stage') in {'SekI', 'SekII', 'CrossStage'}, 'Unknown ALL view stage')
        require('courseProfile' not in scope or scope['courseProfile'] in {'GK', 'LK', 'GK+LK'},
                'Unknown ALL view course profile')
        require('durationModel' not in scope or scope['durationModel'] in {'G8', 'G9'},
                'Unknown ALL view duration')
        require(set(scope) <= {'schoolForm', 'stage', 'durationModel', 'courseProfile'}
                and scope.get('schoolForm') == 'Gymnasium' and scope.get('stage') in stages,
                'Unsupported ALL view dimensions or stage')
    # Duration is chosen globally before the subject. Only a scope that returns
    # that exact dimension can offer it; compatible dimensionless fallbacks cannot.
    duration_stage_values = next(binding['values'] for binding in duration_source['scopeBindings']
                                 if binding['dimension'] == 'stage')
    duration_profiles = next(binding['values'] for binding in duration_source['scopeBindings']
                             if binding['dimension'] == 'courseProfile')
    durations = {view['scope']['durationModel'] for view in views
                 if view['scope'].get('durationModel') in duration_values
                 and view['scope']['stage'] in duration_stage_values
                 and view['scope'].get('courseProfile') in [None, *duration_profiles]}
    result = set()
    for stage in stages:
        for duration in sorted(durations) or ['']:
            compatible = [view['scope'] for view in views if view['landscapeId'] == landscape_id
                          and view['scope']['stage'] == stage
                          and view['scope'].get('durationModel') in [None, duration]]
            if not compatible:
                continue
            offered_profiles = []
            for profile in profiles:
                candidates = [scope for scope in compatible if scope.get('courseProfile') in
                              ([None, 'GK', 'LK', 'GK+LK'] if profile == 'GK+LK' else [None, profile])]
                if not candidates:
                    continue
                best_size = max(len(scope) for scope in candidates)
                best = [scope for scope in candidates if len(scope) == best_size]
                returned = {scope.get('courseProfile') for scope in best}
                if profile in returned or (profile == 'GK+LK' and {'GK', 'LK'} <= returned):
                    offered_profiles.append(profile)
            for profile in offered_profiles or ['']:
                result.add('/'.join(['ALL', stage, duration, profile]))
    require(result, 'Missing ALL Personal Curriculum offerings')
    return result


def validate(report_path, junit_path, subject, commit, root=ROOT):
    floors = load(root / 'app/scripts/config/curriculum-maturity-floor-policy.json')
    status = load(root / 'docs/qa-ci/status/curriculum-quality-status.json')
    inventory = {row['landscapeId']: row['subject'] for row in floors['floors'] if row['minimumMaturity'] == 'M7'}
    inventory.update({row['landscapeId']: row['subject'] for row in status['curricula'] if row['maturity'] == 'M7'})
    require(REQUIRED_SUBJECTS <= inventory.keys(), 'Previously protected M7 subject missing')
    require(subject is None or subject in inventory, 'Selector must be one exact known subject ID')
    selected = inventory if subject is None else {subject: inventory[subject]}
    unexamined = {key: value for key, value in inventory.items() if key not in selected}
    report = load(report_path)
    binding = load(report_path.with_name('input-manifest.json'))
    require(report.get('schemaVersion') == 4 and report.get('inputBinding') == binding, 'Missing or stale report binding')
    require(binding.get('gitCommit') == commit and binding.get('subjectSelector') == subject, 'Wrong commit or selector binding')
    require(binding.get('executionId'), 'Missing execution identity')
    for field, environment in [('ciRunId', 'GITHUB_RUN_ID'), ('ciRunAttempt', 'GITHUB_RUN_ATTEMPT')]:
        if os.environ.get(environment):
            require(binding.get(field) == os.environ[environment], 'Stale CI execution binding')
    require(binding.get('files'), 'Empty input manifest')
    require(set(binding['files']) == current_input_paths(root), 'Changed audit input path inventory')
    for relative, expected in binding['files'].items():
        path = (root / relative).resolve()
        require(path.is_relative_to(root.resolve()) and path.is_file(), f'Missing bound input: {relative}')
        require(hashlib.sha256(path.read_bytes()).hexdigest() == expected, f'Changed bound input: {relative}')
    for required in ['app/scripts/config/curriculum-maturity-floor-policy.json',
                     'docs/qa-ci/status/curriculum-quality-status.json',
                     'app/src/generated/gymnasiumDurationOfferings.ts']:
        require(required in binding['files'], f'Unbound scope input: {required}')
    require(report.get('auditMode') == ('all-protected-subjects' if subject is None else 'single-subject'), 'Wrong audit scope')
    require(report.get('protectedSubjects') == inventory and report.get('selectedSubjects') == selected
            and report.get('unexaminedSubjects') == unexamined, 'Incomplete or misleading subject inventory')
    floor_status = {row['landscapeId']: row['minimumMaturity'] for row in floors['floors']}
    current_status = {row['landscapeId']: row['maturity'] for row in status['curricula']}
    maturity = {key: {'subject': value, 'protectedFloor': floor_status.get(key, 'unreported'),
                      'currentStatus': current_status.get(key, 'unreported')} for key, value in inventory.items()}
    require(report.get('currentMaturityStatus') == maturity, 'Missing or incorrect protected maturity status')
    require(report.get('completeProtectedInventoryAudited') is (subject is None), 'Misstated full-audit coverage')
    require(report.get('allProtectedSubjectsIntegrityPassed') is (subject is None), 'Misstated overall integrity result')
    require(report.get('selectedIntegrityPassed') is True and report.get('fatalError') is None, 'Audit did not pass completely')
    source = (root / 'app/src/generated/gymnasiumDurationOfferings.ts').read_text()
    start = source.index('export const GYMNASIUM_CONTENT_OFFERINGS = ') + len('export const GYMNASIUM_CONTENT_OFFERINGS = ')
    end = source.index(' as const satisfies GymnasiumContentOfferings', start)
    offerings = ast.literal_eval(source[start:end])
    rows = report.get('scopes', [])
    require(rows and all(row.get('landscapeId') in selected for row in rows), 'Unexpected or missing subject rows')
    expected_total = 0
    expected_country_total = 0
    expected_canonical_pc_total = 0
    checked_course_unions = 0
    for landscape_id, label in selected.items():
        actual = [row for row in rows if row.get('landscapeId') == landscape_id]
        country_scopes = expected_scopes(offerings.get(landscape_id))
        canonical_scopes = canonical_pc_scopes(root, landscape_id)
        expected = country_scopes | canonical_scopes
        authoritative = [row for row in actual if row.get('authoritative') is True]
        diagnostic = [row for row in actual if row.get('authoritative') is False]
        require(len(authoritative) == len(expected) and {row.get('scope') for row in authoritative} == expected,
                f'Incomplete offered scopes for {label}: expected {len(expected)}, got {len(authoritative)}')
        require(len(diagnostic) == 1 and diagnostic[0].get('scope') == 'canonical', 'Missing canonical diagnostic scope')
        for row in actual:
            require(row.get('subject') == label and row.get('targetCount', 0) > 0, 'Misidentified or empty scope')
            targets = row.get('targetGoalIds', [])
            require(len(targets) == len(set(targets)) == row['targetCount'], 'Incomplete scope target inventory')
        for row in authoritative:
            if row['scope'] in canonical_scopes:
                _, stage, duration, course = row['scope'].split('/')
                config = row.get('personalCurriculumConfig', {})
                root_config, subject_config = config.get(GYMNASIUM_ROOT, {}), config.get(landscape_id, {})
                require(root_config.get('selected') is True and root_config.get('filterId') == 'ALL'
                        and root_config.get('stage') == stage and subject_config.get('selected') is True,
                        'Missing final ALL Personal Curriculum configuration')
                require((root_config.get('durationModel') == duration if duration else 'durationModel' not in root_config)
                        and (subject_config.get('filterId') == course if course else 'filterId' not in subject_config),
                        'Invented or missing ALL duration/course selection')
                requested = {'schoolForm': 'Gymnasium', 'stage': stage}
                if duration:
                    requested['durationModel'] = duration
                if course:
                    requested['courseProfile'] = course
                require(row.get('requestedCompositionScope') == requested,
                        'Incorrect ALL composition scope or invented jurisdiction')
            require(row.get('passed') is True and not row.get('error') and row.get('uncovered') == []
                    and row.get('unreadyAssessments') == [], f'Failed offered scope: {label} {row.get("scope")}')
            if landscape_id == MATHEMATICS:
                require(row.get('duplicateVisibleGoalPaths') == {}, 'Missing or failed Mathematics visible-path check')
                require(row.get('duplicateStructureIds') == {}, 'Missing or failed Mathematics structure-ID check')
                inspected = row.get('visibleHierarchyViewIds')
                require(isinstance(inspected, list) and inspected
                        and len(inspected) == len(set(inspected))
                        and set(inspected) <= set(row.get('compositionViewIds', [])),
                        'Mathematics hierarchy check did not inspect its resolved offering view')
                expected_visible = row.get('visibleHierarchyTargetGoalIds')
                actual_visible = row.get('visibleHierarchyGoalIds')
                require(isinstance(expected_visible, list) and expected_visible
                        and isinstance(actual_visible, list)
                        and len(expected_visible) == len(set(expected_visible))
                        and len(actual_visible) == len(set(actual_visible))
                        and set(expected_visible) == set(actual_visible)
                        and set(row['targetGoalIds']) <= set(expected_visible)
                        and row.get('missingVisibleGoalIds') == []
                        and row.get('unexpectedVisibleGoalIds') == []
                        and type(row.get('visibleHierarchyGoalCount')) is int
                        and row['visibleHierarchyGoalCount'] == len(actual_visible),
                        'Missing or incomplete Mathematics visible hierarchy inventory')
        # The inventory above decides which scopes exist. For every complete
        # course triple, independently require the native combined targets to
        # equal the set union. Sek-I has no course choice and is excluded.
        course_groups = {}
        for row in authoritative:
            country, stage, duration, course = row['scope'].split('/')
            if stage != 'SekI':
                course_groups.setdefault((country, stage, duration), {})[course] = row
        for identity, courses in course_groups.items():
            if {'GK', 'LK', 'GK+LK'} <= courses.keys():
                expected_union = set(courses['GK']['targetGoalIds']) | set(courses['LK']['targetGoalIds'])
                require(set(courses['GK+LK']['targetGoalIds']) == expected_union,
                        f'Incorrect GK+LK target union for {label}: {"/".join(identity)}')
                checked_course_unions += 1
        expected_total += len(expected)
        expected_country_total += len(country_scopes)
        expected_canonical_pc_total += len(canonical_scopes)
    require(report.get('checkedCountryOfferedScopes') == expected_country_total
            and report.get('checkedCanonicalPersonalCurriculumScopes') == expected_canonical_pc_total,
            'Incomplete country or ALL Personal Curriculum scope counters')
    require(report.get('checkedOfferedScopes') == expected_total and report.get('canonicalDiagnosticScopes') == len(selected)
            and report.get('checkedScopes') == len(rows) == expected_total + len(selected), 'Incomplete scope counters')
    require(all(report.get(field) == 0 for field in ['failedScopes', 'failedRouteScopes', 'failedReadinessScopes',
                                                   'failedHierarchyScopes']), 'Nonzero failure counters')
    suite = ET.parse(junit_path).getroot()
    cases = suite.findall('testcase')
    require(suite.get('name') == CLASS and int(suite.get('tests', '0')) == len(cases) == 1
            and cases[0].get('name') == CORPUS_METHOD + '()', 'Corpus method was not executed exactly once')
    require(not any(int(suite.get(field, '0')) for field in ['skipped', 'failures', 'errors'])
            and not any(suite.findall('.//' + tag) for tag in ['skipped', 'failure', 'error']), 'Skipped or failed corpus execution')
    require('CURRICULUM_COMPLETION_AUDIT_EXECUTION:' + binding['executionId'] in suite.findtext('system-out', ''),
            'JUnit and report belong to different executions')
    return f'{len(selected)} selected subjects; {expected_total} complete offered scopes; {checked_course_unions} exact course unions; 1 corpus method, no skips or failures; {len(unexamined)} subjects unexamined.'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--subject', help='Omit for the complete protected inventory')
    parser.add_argument('--report', required=True, type=Path)
    parser.add_argument('--junit', required=True, type=Path)
    parser.add_argument('--commit', default=None)
    args = parser.parse_args()
    commit = args.commit or subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip()
    print(validate(args.report, args.junit, args.subject, commit))


if __name__ == '__main__':
    main()
