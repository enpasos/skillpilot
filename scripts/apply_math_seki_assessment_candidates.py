#!/usr/bin/env python3
"""Apply the bounded 21-case Sek-I correction patch to an offline Math canon."""
import argparse
import copy
import hashlib
import json
from pathlib import Path

from apply_math_assessment_contract_candidates import ROOT, normalized_sha, require, validate_graph

BASE = ROOT / 'tmp/approach-review-20261101/common-offline-canonical-math.released.json'
PATCH = ROOT / 'tmp/approach-review-20261101/candidate-seki-corrections.json'
EXPECTED_PREFIXES = {
    '311ab2f2', 'b48c65fd', '47c515c9', '3ce97753', '4ef1ec52', 'af96c2fc', 'df9ecf0f',
    '9accf4e2', 'e96bc8e4', '3045f00d', 'fbf10244', '10a77422', '18db552f', 'ec707244',
    '8a360e18', '5f6496ef', 'af7905d0', 'c9d7546d', 'ea664a30', 'c34c6132', '0d2cfddc',
}
SUPPORT_ID = '415bd48b-8a76-4d4f-bfdd-d085573e7ac3'
REMOVED_SUPPORT = 'f0a49da2-018b-4cda-adbd-27047b610a0f'


def apply_candidate(document, patch):
    rows = patch.get('corrections', [])
    require(len(rows) == 21 and {row['goalId'][:8] for row in rows} == EXPECTED_PREFIXES,
            'Expected exactly the 21 reviewed Sek-I correction cases')
    require(patch.get('status') == 'DRAFT_SEKI_CORRECTIONS_NOT_ACTIVATED', 'Missing candidate boundary')
    result = copy.deepcopy(document)
    goals = {goal['id']: goal for goal in result['goals']}
    for row in rows:
        goal = goals[row['goalId']]
        require(normalized_sha(goal) == row['expectedGoalSha256'], f'Sek-I source goal changed: {goal["id"]}')
        require(goal['description'] == row['preservedDescription'], 'Existing competency contract changed')
        change = row['replacement']
        require(set(change) <= {'requires', 'examData', 'title'}, 'Unexpected goal field change')
        if goal['id'].startswith('4ef1ec52'):
            require(change == {'title': 'Aufgabe 3 (Jahrgangsstufe 7, 8 BE)'}, 'Only the stale title point count may change')
        else:
            require('title' not in change and goal['title'] == row['preservedTitle'], 'Existing goal title changed')
            exam = change['examData']
            require(exam['reviewStatus'] == 'draft', 'New or re-bound exam must remain draft before review')
            old_rubric, rubric = goal['examData']['scoring'], exam['scoring']
            require(rubric['maxPoints'] == old_rubric['maxPoints']
                    and rubric['passingPoints'] == old_rubric['passingPoints']
                    and sum(step['points'] for step in rubric['steps']) == rubric['maxPoints']
                    and all(step['points'] > 0 and step['description'] for step in rubric['steps']),
                    'Invalid or silently changed binary scoring contract')
            for original, translated in [('taskContent', 'taskContentEn'), ('solutionContent', 'solutionContentEn')]:
                require(exam.get(original, '').strip(), 'Missing task or solution')
                if goal['examData'].get(translated) and exam[original] != goal['examData'][original]:
                    require(exam.get(translated) != goal['examData'][translated], 'Stale English exam content')
            coverage = exam['coveredGoalIds']
            require(coverage and len(coverage) == len(set(coverage)) and all(ref in goals for ref in coverage),
                    'Invalid assessed coverage references')
        requires = change.get('requires', goal['requires'])
        require(len(requires) == len(set(requires)) and all(ref in goals for ref in requires),
                'Invalid preparation references')
        for field in ['removedCoverageContracts', 'removedPreparationContracts', 'addedCoverageContracts', 'addedPreparationContracts']:
            for contract in row[field]:
                require(goals[contract['goalId']]['description'] == contract['fullDescription'],
                        'Referenced competency contract changed')
        goal.update(copy.deepcopy(change))
    row = patch['supportCorrection']
    require(row['goalId'] == SUPPORT_ID and row['removePrerequisite'] == REMOVED_SUPPORT, 'Unexpected support correction')
    goal = goals[SUPPORT_ID]
    require(normalized_sha(goal) == row['expectedGoalSha256'] and goal['description'] == row['preservedDescription'],
            'Cylinder source contract changed')
    require(row['replacementRequires'] == [ref for ref in goal['requires'] if ref != REMOVED_SUPPORT],
            'Only the exact unsupported cylinder/congruence edge may be removed')
    goal['requires'] = list(row['replacementRequires'])
    validate_graph(goals)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=BASE)
    parser.add_argument('--patch', type=Path, default=PATCH)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    patch = json.loads(args.patch.read_text())
    require(hashlib.sha256(args.source.read_bytes()).hexdigest() == patch['baseCanonicalSha256'], 'Wrong shared offline base')
    output = args.output.resolve()
    require(output != args.source.resolve() and not output.is_relative_to(ROOT / 'curricula'),
            'Output must be a new offline candidate outside active curricula')
    for asset in patch['assets']:
        path = ROOT / asset['path']
        require(path.is_file() and hashlib.sha256(path.read_bytes()).hexdigest() == asset['sha256'],
                'Missing or changed bound graph material')
    result = apply_candidate(json.loads(args.source.read_text()), patch)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(f'Wrote offline candidate: 21 Sek-I corrections, one cylinder support edge: {output}')


if __name__ == '__main__':
    main()
