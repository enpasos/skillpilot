#!/usr/bin/env python3
"""Apply the bounded 28-case upper-endpoint follow-up to one frozen offline canon.

This authoring command never activates tasks, changes learner results or edits
historical source artifacts. New exam payloads remain draft pending independent
content review and final offered-scope validation.
"""
import argparse
import copy
import hashlib
import json
from pathlib import Path

from apply_math_assessment_contract_candidates import ROOT, normalized_sha, require, validate_graph

HERE = ROOT / 'tmp/approach-review-20261101'
BASE = HERE / 'common-offline-canonical-math.seki-candidate.json'
PATCH = HERE / 'candidate-upper-corrections.json'
REVIEW = HERE / 'upper-endpoint-review.json'
BASE_SHA = '138574f9e007ac03217a1c418167e4b6b9975cd927e7cdd279524f897a404f4d'
BASE_DOCUMENT_SHA = 'f7ce2a91906de2e6be0f2cbfee6f9cc8f911bd78ece93ca03071902cc9601a53'
REVIEW_SHA = 'c230a92d32205438e59d82277f6c97995fe1755a58225f182f4e574df22e89b9'
MATRIX_SHA = '95535359633a076d676aa64df0a46644ec0f3855a3e0a1614f4fb25e51d93eae'
EXPECTED_CASES = {
    0: '57c6506d', 7: '4a906a0c', 12: '000b2764', 13: '6eb917e6', 19: '87ce54e8',
    26: 'c2f6b981', 29: 'e7013f6e', 30: '296fdd9f', 31: 'c87597fd', 32: '9634bfe1',
    33: '3b1f0646', 36: '78f5003e', 38: 'c4cf4273', 40: '6420e4be', 41: '5886c6e8',
    42: '226e5c66', 43: '97fb270f', 51: '81823f27', 52: '77940875', 53: '9cf020ee',
    54: '99e45593', 56: 'c83dc2d1', 57: '34dc8c9b', 58: 'a8525adc', 59: 'e45a39e5',
    69: 'bbb340ed', 70: '46bb8422', 84: 'd110ab96',
}
UNCHANGED_ENDPOINT_CASES = {57, 69, 70, 84}
SUPPORT_SPECS = {
    '8fa32a68': ({'858113c5'}, {'09f47964', 'c65ecabf'}),
    '5fe4218e': ({'b9bbd2a8'}, {'2143e9e8'}),
    '9b339361': ({'8e18154d'}, {'9a0987cd'}),
    '4c6369b0': ({'b9bbd2a8', '858113c5'}, {'09f47964', 'c65ecabf'}),
    '61686d85': ({'b9bbd2a8', '858113c5'}, {'09f47964', 'c65ecabf', '26f668a0'}),
}


def _relation_delta(old, new, row, goals):
    require(set(old) - set(new) == {item['goalId'] for item in row['removed']}
            and set(new) - set(old) == {item['goalId'] for item in row['added']}, 'Undisclosed relation change')
    for item in row['removed'] + row['added']:
        require(item['goalId'] in goals and item['fullDescription'] == goals[item['goalId']]['description'],
                'Referenced competency contract changed')


def _references(refs, goals):
    require(refs and len(refs) == len(set(refs)) and all(ref in goals for ref in refs), 'Invalid graph references')


def _reviewed_relation_sets(case, old, goals):
    removed_preparation, removed_coverage = set(), set()
    for finding in case['findings']:
        if finding['kind'] == 'preparation' and finding['requiredCorrection'].startswith('Entferne'):
            removed_preparation.update(finding['affectedGoalIds'])
        if finding['kind'] == 'coverage':
            removed_coverage.update(finding.get('affectedGoalIds', []))
    def ids(prefixes):
        return {next(ident for ident in goals if ident.startswith(prefix)) for prefix in prefixes}
    added_preparation, added_coverage = set(), set()
    if case['caseIndex'] == 43:
        removed_coverage -= ids(['963907f9'])  # Explicitly added and scored direction-field construction.
    if case['caseIndex'] == 51:
        added_preparation = ids(['4d331ba0'])
    if case['caseIndex'] == 54:
        added_preparation = ids(['677be619', '0a7ff229', '4b58b855'])
        added_coverage = ids(['f14e1643', '677be619', '0a7ff229'])
    return (set(old.get('requires', [])) - removed_preparation) | added_preparation, \
           (set(old['examData'].get('coveredGoalIds', [])) - removed_coverage) | added_coverage


def apply_candidate(document, patch):
    require(patch.get('status') == 'DRAFT_UPPER_CORRECTIONS_NOT_ACTIVATED_NOT_INDEPENDENTLY_ACCEPTED',
            'Candidate must remain an unpublished draft')
    require(patch.get('baseCanonicalSha256') == BASE_SHA and patch.get('baseDocumentSha256') == BASE_DOCUMENT_SHA
            and normalized_sha(document) == BASE_DOCUMENT_SHA, 'Wrong or changed shared offline base')
    require(patch.get('reviewSha256') == REVIEW_SHA and patch.get('reviewHashMatrixSha256') == MATRIX_SHA,
            'Wrong independent review binding')
    require(hashlib.sha256(REVIEW.read_bytes()).hexdigest() == REVIEW_SHA, 'Independent review changed')
    review = json.loads(REVIEW.read_text())
    require(patch['historicalArtifacts'] == review['assetsReadAndInspected'] + review['existingEvidenceRead'],
            'Historical evidence inventory changed')
    reviewed = {case['caseIndex']: case for case in review['cases']}
    rows = patch.get('corrections', [])
    require(len(rows) == 28 and {row['caseIndex']: row['goalId'][:8] for row in rows} == EXPECTED_CASES,
            'Expected exactly the 28 reviewed correction cases')
    result = copy.deepcopy(document)
    goals = {goal['id']: goal for goal in result['goals']}
    require(len(goals) == len(result['goals']), 'Duplicate goal identity')
    for row in rows:
        index = row['caseIndex']
        require(reviewed[index]['verdict'] == 'CHANGES_REQUIRED' and row['goalId'] == reviewed[index]['goalId'],
                'Correction outside the independently reviewed cohort')
        require(row['reviewFindings'] == reviewed[index]['findings'], 'Independent findings changed')
        goal = goals[row['goalId']]
        require(normalized_sha(goal) == row['expectedGoalSha256'], 'Source goal changed')
        change = row['replacement']
        allowed = {'requires', 'examData'}
        if index == 0:
            allowed = {'titleEn'}
            require(change == {'titleEn': 'A1 (Analysis, Level 1, 5 BE)'}, 'Only the reviewed English level may change')
        if index == 26:
            allowed = {'description', 'descriptionEn'}
            require(set(change) == allowed and all(change.values()), 'Both metadata languages must be corrected')
        if index == 30:
            allowed |= {'title', 'description'}
        if index in {51, 52}:
            allowed.add('description')
        require(set(change) <= allowed, 'Unexpected goal/source/scope field change')
        require(bool(change) is (index not in UNCHANGED_ENDPOINT_CASES), 'Unexpected task mutation or missing correction')
        requires = change.get('requires', goal.get('requires', []))
        expected_preparation, expected_coverage = _reviewed_relation_sets(reviewed[index], goal, goals)
        require(set(requires) == expected_preparation, 'Preparation differs from the bounded reviewed correction')
        if requires:
            _references(requires, goals)
        _relation_delta(goal.get('requires', []), requires, row['preparationDelta'], goals)
        require(row['scopeImpact']['applicabilityFromRequires']
                is (goal.get('extendedData', {}).get('applicabilityFromRequires') is True)
                and row['scopeImpact']['directRequiresChanged'] is (requires != goal.get('requires', [])),
                'Missing applicabilityFromRequires impact disclosure')
        if 'examData' in change:
            old, exam = goal['examData'], change['examData']
            require(exam.get('reviewStatus') == 'draft', 'Changed exam must remain draft')
            require(set(exam) - set(old) <= {'reviewStatus', 'reviewNote'}, 'Unexpected exam field addition')
            mutable = {'taskContent', 'taskContentEn', 'solutionContent', 'solutionContentEn',
                       'coveredGoalIds', 'scoring', 'reviewStatus', 'reviewNote'}
            require({key: value for key, value in old.items() if key not in mutable}
                    == {key: value for key, value in exam.items() if key not in mutable},
                    'Historical source or unrelated exam metadata changed')
            for original, translated in [('taskContent', 'taskContentEn'), ('solutionContent', 'solutionContentEn')]:
                require(exam.get(original, '').strip(), 'Missing task or solution')
                if old.get(translated) and exam[original] != old[original]:
                    require(exam.get(translated, '').strip() and exam[translated] != old[translated],
                            'Stale English exam content')
            rubric, previous = exam['scoring'], old['scoring']
            require(rubric['maxPoints'] == previous['maxPoints']
                    and rubric['passingPoints'] == previous['passingPoints']
                    and [(step['id'], step['points']) for step in rubric['steps']]
                    == [(step['id'], step['points']) for step in previous['steps']],
                    'Binary threshold or point allocation changed')
            require(sum(step['points'] for step in rubric['steps']) == rubric['maxPoints']
                    and all(step['points'] > 0 and step['description'].strip() for step in rubric['steps'])
                    and len({step['id'] for step in rubric['steps']}) == len(rubric['steps']), 'Invalid scoring structure')
            if 'coveredGoalIds' in old:
                _references(exam['coveredGoalIds'], goals)
            require(set(exam.get('coveredGoalIds', [])) == expected_coverage,
                    'Coverage differs from the bounded reviewed correction')
            _relation_delta(old.get('coveredGoalIds', []), exam.get('coveredGoalIds', []), row['coverageDelta'], goals)
        else:
            require(not row['coverageDelta']['removed'] and not row['coverageDelta']['added'], 'Coverage changed without exam payload')
        goal.update(copy.deepcopy(change))

    support_rows = patch.get('supportCorrections', [])
    require(len(support_rows) == 5 and {row['goalId'][:8] for row in support_rows} == set(SUPPORT_SPECS),
            'Expected exactly five reviewed support consumers')
    for row in support_rows:
        goal = goals[row['goalId']]
        require(normalized_sha(goal) == row['expectedGoalSha256']
                and goal['description'] == row['preservedDescription'] and row['rationale'], 'Support source contract changed')
        requires = row['replacementRequires']
        _references(requires, goals)
        removed, added = SUPPORT_SPECS[goal['id'][:8]]
        require({ref[:8] for ref in set(goal['requires']) - set(requires)} == removed
                and {ref[:8] for ref in set(requires) - set(goal['requires'])} == added,
                'Unexpected support edge mutation')
        _relation_delta(goal['requires'], requires, row['preparationDelta'], goals)
        goal['requires'] = list(requires)

    existing = patch['alreadyAppliedSupport']
    require(existing['goalId'] == '415bd48b-8a76-4d4f-bfdd-d085573e7ac3'
            and existing['absentPrerequisite'] == 'f0a49da2-018b-4cda-adbd-27047b610a0f'
            and normalized_sha(goals[existing['goalId']]) == existing['expectedGoalSha256']
            and existing['absentPrerequisite'] not in goals[existing['goalId']]['requires'],
            'Previously corrected cylinder edge must remain untouched')
    passed = {case['goalId'] for case in review['cases'] if case['verdict'] == 'PASS'}
    require(len(passed) == 67 and set(patch['preservedPassGoalSha256']) == passed, 'PASS preservation inventory changed')
    for ident in passed:
        require(normalized_sha(goals[ident]) == patch['preservedPassGoalSha256'][ident], 'A PASS goal was modified')
    for prefix in ['6517427b', '62a1c6f2']:
        goal = next(goal for ident, goal in goals.items() if ident.startswith(prefix))
        require('858113c5-e53b-57bb-b01f-ba95c3ddcb6f' in goal['requires'], 'Genuine derivative demand was removed')
    validate_graph(goals)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=BASE)
    parser.add_argument('--patch', type=Path, default=PATCH)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    require(hashlib.sha256(args.source.read_bytes()).hexdigest() == BASE_SHA, 'Wrong shared offline source bytes')
    output = args.output.resolve()
    require(output != args.source.resolve() and not output.is_relative_to(ROOT / 'curricula'),
            'Output must be a new offline candidate outside active curricula')
    patch = json.loads(args.patch.read_text())
    for artifact in patch['historicalArtifacts']:
        path = ROOT / artifact['path']
        require(path.is_file() and hashlib.sha256(path.read_bytes()).hexdigest() == artifact['sha256'],
                'Historical source/evidence artifact changed: ' + artifact['path'])
    result = apply_candidate(json.loads(args.source.read_text()), patch)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(f'Wrote offline candidate: 28 review dispositions, 24 endpoint changes, five support consumers: {output}')


if __name__ == '__main__':
    main()
