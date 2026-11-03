#!/usr/bin/env python3
"""Apply the nine reviewed-for-authoring Math corrections to an offline candidate.

This command never writes an active curriculum. The resulting exams remain draft
until the exact task/rubric and final projection receive independent review.
"""
import argparse
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANONICAL = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
CANDIDATE = ROOT / 'tmp/approach-review-20261101/candidate-corrections.json'
PREPARATION_CANDIDATE = ROOT / 'tmp/approach-review-20261101/candidate-preparation-corrections.json'
PRISM_ID = 'e5494c67-aed6-5710-8ae3-51ae147c10e9'
EXPECTED_PREPARATION_IDS = {
    'dd6c5e08-0cc6-53c0-b317-ebaba277c776', '772b11c9-1348-5ab9-bc3f-458c46b312b6',
    'c72a8032-71f6-56ed-a896-06ae435ff2ec', 'd4f2d4e2-a831-5ee2-b9c6-bb9e79986aeb',
    'baf7276f-60a0-4d96-b959-d63acfb929de', '5dabf0b3-89b1-59a6-ae57-014f92becd3b',
}
EXPECTED_FOLLOWUP_IDS = {
    '06ce2b1b-e888-5322-9ed9-dfc6d322956a', 'd4f2d4e2-a831-5ee2-b9c6-bb9e79986aeb',
    '3aea4d33-4170-5ecc-82b0-3a3974cc2237',
}
EXPECTED_IDS = {
    '4c319dfd-ebb1-504b-a036-c780e1915900', 'f77b9b40-6afc-5d9e-821e-79903bbbcb94',
    '1969d4dc-2ba6-5c26-ad7c-6e0114ab1fdf', 'bd2c5e29-31c6-58bf-9858-d08e9c8a32ad',
    '450a77d6-2814-571a-af1e-78c9fa61ed2c', '2f8a3a90-717d-5ac1-b54e-facca26e9008',
    'b9a501c4-9d74-5514-b77b-895980b89b1b', '7337049a-c85c-5b94-adaa-81dc93528bf8',
    '99b3435a-fdda-5d1b-9681-0ae6d7d5bfcd',
}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def normalized_sha(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True,
                                     separators=(',', ':')).encode()).hexdigest()


def validate_graph(goals):
    """Check the complete Math DAG, including inherited/expanded prerequisites."""
    def order(edges, relation):
        visited, active, postorder = set(), set(), []
        def visit(ident):
            require(ident not in active, f'{relation} cycle at {ident}')
            if ident in visited:
                return
            require(ident in edges, f'Unknown {relation} reference: {ident}')
            active.add(ident)
            for child in edges[ident]:
                visit(child)
            active.remove(ident)
            visited.add(ident)
            postorder.append(ident)
        for ident in edges:
            visit(ident)
        return list(reversed(postorder))
    contains = {ident: set(goal.get('contains', [])) for ident, goal in goals.items()}
    requires = {ident: set(goal.get('requires', [])) for ident, goal in goals.items()}
    contains_order = order(contains, 'contains')
    order(requires, 'requires')
    effective = copy.deepcopy(requires)
    for parent in contains_order:
        for child in contains[parent]:
            effective[child].update(effective[parent])
    atoms = {}
    for ident in reversed(contains_order):
        atoms[ident] = set().union(*(atoms[child] for child in contains[ident])) if contains[ident] else {ident}
    atomic_edges = {ident: set().union(*(atoms[ref] for ref in effective[ident]))
                    for ident in goals if not contains[ident]}
    order(atomic_edges, 'expanded atomic prerequisite')
    return atomic_edges


def apply_candidate(document, candidate):
    rows = candidate.get('corrections', [])
    require(len(rows) == 9 and {row['goalId'] for row in rows} == EXPECTED_IDS,
            'Candidate must contain exactly the nine bounded corrections')
    require(candidate.get('status') == 'DRAFT_CANDIDATE_NOT_ACTIVATED_NOT_INDEPENDENTLY_ACCEPTED',
            'Candidate must retain its draft and review boundary')
    result = copy.deepcopy(document)
    goals = {goal['id']: goal for goal in result['goals']}
    require(len(goals) == len(result['goals']), 'Duplicate source goal ID')
    for row in rows:
        goal = goals[row['goalId']]
        require(normalized_sha(goal) == row['expectedGoalSha256'],
                f'Source goal changed since authoring: {goal["id"]}')
        require(all(goal[key] == row['preservedContract'][key] for key in ['title', 'description']),
                'Goal identity contract changed')
        change = row['replacement']
        require(set(change) == {'requires', 'examData'}, 'Only preparation and exam data may change')
        for field, decisions in [('requires', 'preparationDecisions'), ('coveredGoalIds', 'coverageDecisions')]:
            ids = change['requires'] if field == 'requires' else change['examData'][field]
            require(ids and len(ids) == len(set(ids)) and all(ident in goals and ident != goal['id'] for ident in ids),
                    f'Invalid {field} references')
            require([item['goalId'] for item in row[decisions]] == ids, 'Missing separate relation rationale')
            for item in row[decisions]:
                require(item['rationale'] and item['fullGoalDescription'] == goals[item['goalId']]['description'],
                        f'Referenced goal contract changed: {item["goalId"]}')
        exam = change['examData']
        for original, translation in [('taskContent', 'taskContentEn'), ('solutionContent', 'solutionContentEn')]:
            if goal['examData'].get(translation) and exam[original] != goal['examData'][original]:
                require(exam.get(translation) != goal['examData'][translation],
                        f'Stale English exam translation: {translation}')
        require(exam['reviewStatus'] == 'draft', 'Old released status cannot approve new task bytes')
        require(exam['taskContent'].strip() and exam['solutionContent'].strip(), 'Missing task or solution')
        rubric = exam['scoring']
        require(rubric['maxPoints'] == 20 and rubric['passingPoints'] == 10
                and sum(step['points'] for step in rubric['steps']) == 20
                and all(step['points'] > 0 and step['description'] for step in rubric['steps'])
                and len({step['id'] for step in rubric['steps']}) == len(rubric['steps']),
                'Invalid or silently changed binary exam scoring')
        require(row['scopeImpact']['applicabilityFromRequires']
                is (goal.get('extendedData', {}).get('applicabilityFromRequires') is True),
                'Missing applicabilityFromRequires impact disclosure')
        goal.update(copy.deepcopy(change))
    validate_graph(goals)
    return result


def apply_preparation_candidate(document, candidate):
    rows = candidate.get('preparationCorrections', [])
    require(len(rows) == 6 and {row['goalId'] for row in rows} == EXPECTED_PREPARATION_IDS,
            'Preparation candidate must contain exactly the six bounded consumers')
    require(candidate.get('status') == 'DRAFT_PREPARATION_CANDIDATE_NOT_ACTIVATED',
            'Preparation candidate must retain its draft boundary')
    result = copy.deepcopy(document)
    goals = {goal['id']: goal for goal in result['goals']}
    removed = set()
    for row in rows:
        goal = goals[row['goalId']]
        require(normalized_sha(goal) == row['expectedGoalSha256'],
                f'Preparation source changed since authoring: {goal["id"]}')
        require(goal['description'] == row['preservedDescription'], 'Preparation contract changed')
        requires = row['replacementRequires']
        require(requires and len(requires) == len(set(requires))
                and all(ident in goals and ident != goal['id'] for ident in requires),
                'Invalid preparation references')
        actual_removed = set(goal['requires']) - set(requires)
        require(actual_removed == {item['goalId'] for item in row['removedPrerequisiteDecisions']},
                'Undisclosed preparation removal')
        require(set(goal['requires']) - actual_removed <= set(requires), 'Unreviewed preparation deletion')
        for decision in row['removedPrerequisiteDecisions'] + row['addedPrerequisiteDecisions']:
            require(decision['rationale'] and decision['fullGoalDescription'] == goals[decision['goalId']]['description'],
                    'Preparation rationale or referenced contract changed')
        require(set(requires) - set(goal['requires']) == {item['goalId'] for item in row['addedPrerequisiteDecisions']},
                'Undisclosed preparation addition')
        removed.update((goal['id'], ident) for ident in actual_removed)
        goal['requires'] = list(requires)
    require(len(removed) == 11, 'Expected the nine reviewed edges plus two disclosed sqrt edges')
    followups = candidate.get('localFollowupCorrections', [])
    require(len(followups) == 3 and {row['goalId'] for row in followups} == EXPECTED_FOLLOWUP_IDS,
            'Expected the three exact independently reviewed local followups')
    for row in followups:
        goal = goals[row['goalId']]
        require(normalized_sha(goal) == row['expectedGoalSha256'] and goal['requires'] == row['beforeRequires'],
                'Local followup source differs from independent review')
        goal['requires'] = list(row['replacementRequires'])
        require(normalized_sha(goal) == row['independentlyApprovedAfterGoalSha256'],
                'Local followup differs from exact independent approval')
    title_rows = candidate.get('titleOnlyCorrections', [])
    require(len(title_rows) == 1 and title_rows[0]['goalId'] == PRISM_ID, 'Only the approved prism title may change')
    title = title_rows[0]
    goal = goals[PRISM_ID]
    require(normalized_sha(goal) == title['expectedGoalSha256'], 'Prism source changed')
    goal['title'] = title['replacementTitle']
    require(normalized_sha(goal) == title['independentlyApprovedAfterGoalSha256'],
            'Prism title change differs from exact independent approval')
    validate_graph(goals)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=CANONICAL)
    parser.add_argument('--candidate', type=Path, default=CANDIDATE)
    parser.add_argument('--preparation-candidate', type=Path, default=PREPARATION_CANDIDATE)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    require(output != args.source.resolve() and not output.is_relative_to(ROOT / 'curricula'),
            'Output must be an offline candidate outside active curricula')
    result = apply_candidate(json.loads(args.source.read_text()), json.loads(args.candidate.read_text()))
    result = apply_preparation_candidate(result, json.loads(args.preparation_candidate.read_text()))
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(f'Wrote offline candidate: nine draft exams, eight preparation consumers, one approved title: {output}')


if __name__ == '__main__':
    main()
