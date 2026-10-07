# SPDX-License-Identifier: Apache-2.0
"""Materialize an inactive B008 candidate from actual current480, never old503."""
from copy import deepcopy
from pathlib import Path
import hashlib
import json
import subprocess

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
V12 = OWN.parent / 'chemie-b008-current169-routing-placement-author-v12'
V15 = OWN.parent / 'chemie-b008-ni-stage-course-source-placement-author-v15'
assert not (OWN / 'author.final.freeze.json').exists()


def read(path):
    return json.loads(path.read_text())


def bind(path):
    payload = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(payload).hexdigest(), 'bytes': len(payload)}


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


for prior in (V12, V15):
    for payload in read(prior / 'author.final.freeze.json')['payloads']:
        assert bind(ROOT / payload['path']) == payload

active_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
base_path = V12 / 'inputs/active-current479.json.bin'
v15_path = V15 / 'candidate/canonical.current503-ni-source-metadata.author-candidate.json'
base, active, prior = map(read, (base_path, active_path, v15_path))
assert [len(x['goals']) for x in (base, active, prior)] == [479, 480, 503]
candidate = deepcopy(active)
by_base, by_active, by_prior, by_candidate = [{goal['id']: goal for goal in graph['goals']} for graph in (base, active, prior, candidate)]
applied, fresh, conflicts = [], [], []
missing = object()
for goal_id, old in by_base.items():
    current, new = by_active[goal_id], by_prior[goal_id]
    for field in sorted(set(old) | set(current) | set(new)):
        before, actual, proposed = [goal.get(field, missing) for goal in (old, current, new)]
        if proposed != before:
            if actual != before and actual != proposed:
                conflicts.append({'goalId': goal_id, 'field': field})
                continue
            if proposed is missing:
                by_candidate[goal_id].pop(field, None)
            else:
                by_candidate[goal_id][field] = deepcopy(proposed)
            applied.append({'goalId': goal_id, 'field': field, 'oldBaselineValue': None if before is missing else before, 'currentActiveValue': None if actual is missing else actual, 'deliberatePriorCandidateValue': None if proposed is missing else proposed})
        elif actual != before:
            fresh.append({'goalId': goal_id, 'field': field, 'actualCurrentValue': None if actual is missing else actual, 'retainedExact': by_candidate[goal_id].get(field, missing) == actual})
assert not conflicts, conflicts
added = [deepcopy(goal) for goal in prior['goals'] if goal['id'] not in by_base]
assert len(added) == 24
candidate['goals'].extend(added)
assert len(candidate['goals']) == 504
for key in active.keys() - {'goals'}:
    assert candidate[key] == active[key]
new_active = [goal for goal in active['goals'] if goal['id'] not in by_base]
assert len(new_active) == 1 and new_active[0]['id'] == '417e65ec-68be-5f2e-9452-c3ba9b1d362f'
assert by_candidate[new_active[0]['id']] == new_active[0]

snapshots = []
for name, path in [('active-current480', active_path), ('active-kinds-current480', ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'), ('active-qa-current', ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'), ('active-rollout-registry', ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')]:
    target = OWN / 'inputs' / (name + '.json.bin')
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(path.read_bytes())
    snapshots.append({'currentBinding': bind(path), 'exactSnapshot': bind(target)})
registry = read(ROOT / snapshots[-1]['exactSnapshot']['path'])
chemistry = next(subject for subject in registry['subjects'] if subject['subject'] == 'chemie')
for field in ['memoryReviewConfigPath', 'semanticAtomicityConfigPath']:
    if field in chemistry:
        path = ROOT / chemistry[field]
        target = OWN / 'inputs' / (field + '.json.bin')
        target.write_bytes(path.read_bytes())
        snapshots.append({'currentBinding': bind(path), 'exactSnapshot': bind(target)})
protected_input = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-four-plus-d2cc-reviewed-integration-preparation-technical-20261007-v1/checks/all-current-lower-native-D173-P173.actual.json'
protected = sorted(row['goalId'] for row in read(protected_input)['D'])
assert len(protected) == 173
protected_deltas = []
for goal_id in protected:
    actual, proposal = by_active[goal_id], by_candidate[goal_id]
    fields = [field for field in sorted(set(actual) | set(proposal)) if actual.get(field) != proposal.get(field)]
    assert not fields or fields == ['requires'], (goal_id, fields)
    if fields:
        protected_deltas.append({'goalId': goal_id, 'field': 'requires', 'wholeCurrentValue': actual['requires'], 'wholePriorIntentCandidateValue': proposal['requires'], 'status': 'HOLD: unchanged v12/v15 prerequisite intent needs actual affected context review; not a current strict closure'})
assert len(protected_deltas) == 5
central_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-11675-terminal-route-reviewed-integration-root-20261007-v1/checks/active-after-BY-LK-terminal-central.actual.json'
central = read(central_path)
write(OWN / 'candidate/canonical.current504-rebased-before-nw.author-candidate.json', candidate)
write(OWN / 'current480-three-way-bounded-field-rebase.actual.json', {'role': 'Actual per-field three-way merge, not a review or source approval', 'oldCurrent479': bind(base_path), 'current480': bind(active_path), 'prior503': bind(v15_path), 'immutableV12Seal': bind(V12 / 'author.final.freeze.json'), 'immutableV15Seal': bind(V15 / 'author.final.freeze.json'), 'candidate504': bind(OWN / 'candidate/canonical.current504-rebased-before-nw.author-candidate.json'), 'deliberate53PriorFieldPatches': applied, 'fresh18CurrentFieldsRetainedExact': fresh, 'freshActive417eRetainedExact': new_active, 'all173ProtectedTextImageAndMetadataValuesExact': protected, 'fivePreviousProtectedPrerequisiteIntentsStillHold': protected_deltas, 'latestActualCentralInput': bind(central_path), 'protectedSourceIdsInput': bind(protected_input), 'exactCurrentSnapshots': snapshots, 'conflicts': conflicts, 'historicalWrites': 0, 'activeWrites': 0, 'strictGain': 0, 'newScientificApproval': 0, 'newImages': 0, 'humanApproval': False})

for stage, basename, pages in [
    ('SekI', 'DE_NW_CHEMIE_SEKI_KLP2019', [8, 9, 17, 18, 19, 21, 23, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]),
    ('SekII', 'DE_NW_CHEMIE_SEKII_KLP2022', [8, 9, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 38, 40, 42, 44, 47, 50, 53, 55]),
]:
    directory = 'lower-secondary' if stage == 'SekI' else 'upper-secondary'
    path = ROOT / f'curricula/DE/Gymnasium/input/NW/{directory}/source-extraction/{basename}.source-extraction.json'
    extraction = read(path)
    snapshot = OWN / 'inputs' / (stage + '.exact-nw-source-extraction.json.bin')
    snapshot.write_bytes(path.read_bytes())
    pdf = ROOT / extraction['sourceDocument']['path']
    for page in pages:
        out = OWN / 'primary' / f'NW-{stage}.physical-page-{page:03}.txt'
        out.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(['pdftotext', '-layout', '-f', str(page), '-l', str(page), str(pdf), str(out)], check=True)
print(json.dumps({'currentWhole': 480, 'inactiveCandidateWhole': 504, 'deliberateFieldPatches': len(applied), 'freshRetainedFields': len(fresh), 'conflicts': len(conflicts), 'protectedTextImageMetadataExact': len(protected), 'previousProtectedPrerequisiteIntentHolds': len(protected_deltas), 'sourcePagesMaterialized': 48, 'strictGain': 0}))
