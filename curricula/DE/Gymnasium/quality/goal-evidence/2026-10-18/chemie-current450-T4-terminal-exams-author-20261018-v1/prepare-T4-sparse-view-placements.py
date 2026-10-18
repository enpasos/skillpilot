import copy
import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
rows = json.loads((OWN / 'AUTHOR.eighteen-endpoint-dispositions-and-exact-input-CAS.json').read_text())['records']
grouped = {}
automatic = []


def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def locate(nodes, goal_id, path):
    matches = []
    for index, node in enumerate(nodes):
        if node.get('goalId') == goal_id:
            matches.append((path, index, node))
        matches += locate(node.get('children', []), goal_id, path + [node.get('id', node.get('goalId'))])
    return matches


def parent(view, path):
    current = {'children': view['rootNodes']}
    for node_id in path:
        current = next(n for n in current['children'] if n.get('id') == node_id)
    return current


for row in rows:
    if not row['newGoalObjectProposed']:
        continue
    for filename in row['actualExistingTargetViews']:
        view = json.loads(Path(filename).read_text())
        hits = locate(view['rootNodes'], row['ordinaryGoalId'], [])
        direct_ordinary = bool(hits)
        if not hits:
            assert row['ordinaryGoalId'] == 'ebfa2c18-0599-5282-bf7a-80c14d86331e'
            assert view['viewId'] in ['de-de-gym-chemistry-lk', 'de-de-gym-sekii-chemistry-lk']
            hits = locate(view['rootNodes'], 'b5f0201a-bc5b-5159-a36c-0925f198c32f', [])
        assert len(hits) == 1
        parent_path, index, node = hits[0]
        assert node['kind'] == ('goalEntry' if direct_ordinary else 'canonicalSubtree') and node.get('projectionRole', 'target') == 'target'
        assert parent_path
        key = (filename, tuple(parent_path))
        if key not in grouped:
            data = Path(filename).read_bytes()
            before = parent(view, parent_path)
            grouped[key] = {'normalView': {'path': filename, 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}, 'viewId': view['viewId'], 'scope': view['scope'], 'parentPath': parent_path, 'beforeWholeParent': before, 'beforeWholeParentSHA256': digest(before), 'insertions': []}
        new_entry = {'kind': 'goalEntry', 'goalId': row['newEndpointId'], 'projectionRole': 'target'}
        if not direct_ordinary:
            new_entry = {'kind': 'structure', 'id': 't4-local-q4-practice', 'label': 'Weitere quellenlokale Übungen Q4', 'children': [new_entry]}
        grouped[key]['insertions'].append({'afterExactExistingTargetEntry': copy.deepcopy(node), 'afterOrdinaryGoalId': row['ordinaryGoalId'], 'ordinaryEntryInheritedFromUnchangedCanonicalSubtree': not direct_ordinary, 'newEntry': new_entry, 'reason': 'Same existing ordinary competence, same actual view/course/location; add only its independently assessed own-practice endpoint, with no new ordinary target or official source credit.'})

for row in grouped.values():
    after = copy.deepcopy(row['beforeWholeParent'])
    for insert in row['insertions']:
        index = after['children'].index(insert['afterExactExistingTargetEntry'])
        after['children'].insert(index + 1, insert['newEntry'])
    row['afterWholeParent'] = after
    row['afterWholeParentSHA256'] = digest(after)
    row['mergeBoundary'] = 'This is an in-memory author proposal. Later integration must preserve every current old field/tail and merge other accepted packages additively after selected-object CAS; never overwrite a whole normal view from this author freeze.'

result = {'artifactRole': 'INACTIVE_AUTHOR_SPARSE_SAME_SCOPE_PRACTICE_PLACEMENTS', 'parentOperations': list(grouped.values()), 'automaticPhaseSubtreeCasesToCheck': automatic, 'explicitPracticeEntries': sum(len(x['insertions']) for x in grouped.values()), 'normalWrites': 0, 'ordinaryTargetChanges': 0, 'newCountryCourseSelections': 0, 'canonicalFolderReplacements': [], 'oldFocusFolderIdsRetained': True, 'newPhaseLocalStructures': 2}
(OWN / 'AUTHOR.sparse-existing-view-practice-placements.pending.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'affectedViews': len({x['normalView']['path'] for x in grouped.values()} | {x['viewPath'] for x in automatic}), 'parentOperations': len(grouped), 'explicitEntries': result['explicitPracticeEntries'], 'phaseSubtreeCasesToCheck': len(automatic), 'normalWrites': 0}))
