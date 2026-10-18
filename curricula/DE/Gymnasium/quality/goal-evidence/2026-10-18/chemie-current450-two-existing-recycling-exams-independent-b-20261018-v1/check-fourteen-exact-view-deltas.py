import copy
import hashlib
import json
from pathlib import Path

OWN = Path(__file__).parent
AUTHOR = OWN.parent / 'chemie-current450-two-existing-recycling-exams-placement-author-20261018-v1'


def read(path):
    return json.loads(Path(path).read_text())


def pin(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': str(path.resolve().relative_to(Path.cwd().resolve())), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def exact_pin(expected):
    assert pin(expected['path']) == expected, expected


def parent_node(view, path):
    current = {'children': view['rootNodes']}
    for node_id in path:
        matches = [n for n in current['children'] if n.get('id') == node_id]
        assert len(matches) == 1, path
        current = matches[0]
    return current


seal_path = AUTHOR / 'SEAL.two-existing-exams-view-author-candidate.json'
assert pin(seal_path)['sha256'] == 'f428ea50031329985abb3d31683d1ed765baef3537a620f90c8a39e8902a8219'
seal = read(seal_path)
for item in seal['files'] + seal['normalGuards']:
    exact_pin(item)
author = read(AUTHOR / 'AUTHOR.two-existing-exams-eight-view-placement.pending.json')
own_input = read(OWN / 'INPUT.exact-five-goals-two-active-P-records-four-bound-cases.json')
goals = {g['id']: g for g in own_input['goals']}
for name in ['INPUT.two-whole-assessed-ordinary-goals.exact.json.snapshot', 'INPUT.two-whole-existing-exams.exact.json.snapshot']:
    for goal in read(AUTHOR / name):
        assert goal == goals[goal['id']], goal['id']
cluster = read(AUTHOR / 'AUTHOR.exact-additive-cluster-contains.pending.json')
assert cluster['before'] == goals[cluster['before']['id']]
expected_cluster = copy.deepcopy(cluster['before'])
expected_cluster['contains'] += [g['id'] for g in own_input['goals'][:2]]
assert expected_cluster == cluster['proposed']

records = []
for row in author['records']:
    before = read(row['normalView']['path'])
    after = read(row['candidateView']['path'])
    restored = copy.deepcopy(after)
    additions = []
    for addition in row['addedPracticeEntries']:
        parent = parent_node(after, addition['parentPath'])
        before_parent = parent_node(before, addition['parentPath'])
        children = parent['children']
        matches = [i for i, n in enumerate(children) if n.get('goalId') == addition['examGoalId']]
        assert len(matches) == 1
        index = matches[0]
        entry = children[index]
        assert entry == {'kind': 'goalEntry', 'goalId': addition['examGoalId'], 'projectionRole': 'target'}
        previous = children[index - 1]
        assert previous == {'kind': 'goalEntry', 'goalId': addition['ordinaryGoalId'], 'projectionRole': 'target'}
        assert previous in before_parent['children']
        assert not any(n.get('goalId') == addition['examGoalId'] for n in before_parent['children'])
        exam = goals[addition['examGoalId']]
        ordinary = goals[addition['ordinaryGoalId']]
        assert exam['requires'] == exam['examData']['coveredGoalIds'] == [ordinary['id']]
        assert before['scope']['jurisdiction'] in exam['applicability']['jurisdiction']
        assert before['scope']['jurisdiction'] in ordinary['applicability']['jurisdiction']
        assert before['scope']['courseProfile'] in exam['tags']
        restored_parent = parent_node(restored, addition['parentPath'])
        restored_parent['children'].remove(entry)
        additions.append({**addition, 'parentContext': {k: v for k, v in parent.items() if k != 'children'}, 'ordinaryEntry': previous, 'exactAddedEntry': entry, 'actualCandidateIndex': index, 'requiresAndCoveredExact': True, 'countryAndCourseWithinExistingExamScope': True})
    assert restored == before, row['normalView']['path']
    records.append({'normalView': row['normalView'], 'candidateView': row['candidateView'], 'viewId': after['viewId'], 'scope': after['scope'], 'allOldFieldsAndOrderExactAfterRemovingOnlyDeclaredAdditions': True, 'additions': additions})
assert sum(len(r['additions']) for r in records) == 14
result = {'authorSeal': pin(seal_path), 'authorFilePinsChecked': len(seal['files']), 'currentNormalGuardsChecked': len(seal['normalGuards']), 'fourWholeAuthorGoalSnapshotsEqualOwnPreviouslyReadInput': True, 'wholeClusterDeltaExactlyTwoContainsAppendsOnly': True, 'views': 8, 'practiceAdditions': 14, 'normalWrites': 0, 'records': records}
(OWN / 'CHECK.actual-fourteen-selected-view-deltas.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'status': 'PASS', 'views': 8, 'practiceAdditions': 14, 'allOtherWholeViewFieldsExact': True, 'normalGuards': 9}, ensure_ascii=False))
