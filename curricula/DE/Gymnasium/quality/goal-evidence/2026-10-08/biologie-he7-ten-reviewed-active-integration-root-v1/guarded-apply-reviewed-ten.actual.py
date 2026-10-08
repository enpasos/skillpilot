# SPDX-License-Identifier: Apache-2.0
"""Integrate the exact reviewed ten, with a supplied immutable technical seal."""
import copy
import hashlib
import json
import os
import shutil
import sys
from pathlib import Path

D = Path(__file__).resolve().parent
R = D.parents[6]
T = D.parent / 'biologie-he7-ten-reviewed-integration-preparation-technical-20261008-v1'
read = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
norm = lambda s: s.removeprefix('sha256:')


def verify(row):
    p = R / row['path']
    assert p.is_file(), str(p)
    assert sha(p) == norm(row['sha256']), str(p)
    if 'bytes' in row:
        assert p.stat().st_size == row['bytes'], str(p)
    if 'symlinkBytesSha256' in row:
        assert p.is_symlink()
        assert hashlib.sha256(os.readlink(p).encode()).hexdigest() == row['symlinkBytesSha256']


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('x') as f:
        json.dump(value, f, ensure_ascii=False, indent=2)
        f.write('\n')


assert len(sys.argv) == 3, 'Exact technical seal path and SHA required'
seal_path = R / sys.argv[1]
assert seal_path.parent == T and sha(seal_path) == norm(sys.argv[2])
seal = read(seal_path)
assert seal['ownFiles']
for row in seal['ownFiles']:
    verify(row)
assert set(seal['actualIndependentSeals']) == {'author', 'A', 'B'}
for role, binding in seal['actualIndependentSeals'].items():
    verify(binding['seal'])
    payload = read(R / binding['seal']['path'])
    rows = payload.get('frozenFiles', payload.get('ownFiles', []))
    assert len(rows) == binding['actualExactFiles']
    for row in rows:
        verify(row)
    if role != 'author':
        assert payload['humanApproval'] is False and payload['activeWrites'] == 0
plan = read(T / 'ready-root-reviewed-guarded-integration-plan.technical.json')
for row in plan['beforeBindings'].values():
    verify(row)
for row in plan.get('protectedOtherFiles', []):
    verify(row)

canonical_path = R / plan['beforeBindings']['canonical']['path']
qa_path = R / plan['beforeBindings']['qa']['path']
registry_path = R / plan['beforeBindings']['registry']['path']
old = read(canonical_path)
new = read(R / plan['futureCanonicalSource'])
assert sha(R / plan['futureCanonicalSource']) == norm(plan['futureCanonicalSha256'])
assert len(old['goals']) == len(new['goals']) == 474
assert {k: v for k, v in old.items() if k != 'goals'} == {k: v for k, v in new.items() if k != 'goals'}
selected = {op['target'].split('/')[-2] for op in plan['assetOperations'] if op['target'].endswith('.png')}
assert len(selected) == 10 and len(plan['assetOperations']) == 50
old_by = {g['id']: g for g in old['goals']}
new_by = {g['id']: g for g in new['goals']}
assert old_by.keys() == new_by.keys()
for gid, goal in old_by.items():
    future = new_by[gid]
    if gid not in selected:
        assert future == goal, gid
        continue
    assert {k: v for k, v in goal.items() if k != 'resourceLinks'} == {k: v for k, v in future.items() if k != 'resourceLinks'}, gid
    before = goal.get('resourceLinks', [])
    after = future.get('resourceLinks', [])
    assert after[:len(before)] == before and len(after) == len(before) + 1, gid
    assert after[-1]['type'] == 'goal-visualization', gid
assert len(plan['protectedStrictGoalIds']['biologie']) == 192
assert not selected.intersection(plan['protectedStrictGoalIds']['biologie'])

old_qa = read(qa_path)
new_qa = read(R / plan['replaceQaFrom'])
assert {k: v for k, v in old_qa.items() if k != 'records'} == {k: v for k, v in new_qa.items() if k != 'records'}
old_q = {r['goalId']: r for r in old_qa['records']}
new_q = {r['goalId']: r for r in new_qa['records']}
assert old_q.keys() == new_q.keys()
for gid, row in old_q.items():
    if gid not in selected:
        assert new_q[gid] == row, gid
    else:
        future = new_q[gid]
        assert future['aiApproved'] == 'yes' and future['humanApproved'] == 'no'
        assert future['contentApprovedChatGpt'] == 'no'
        for key, value in row.items():
            if key.startswith('human'):
                assert future.get(key) == value, gid

registry = read(registry_path)
future_bio = read(R / plan['mergeOnlyBiologyRegistryEntryFrom'])
current_bio = next(s for s in registry['subjects'] if s['subject'] == 'biologie')
expected = copy.deepcopy(current_bio)
for field in ['resolutionIndexPaths', 'positiveEvidenceConfigPaths']:
    assert future_bio[field][:-1] == current_bio[field]
    assert len(future_bio[field]) == len(current_bio[field]) + 1
    expected[field].append(future_bio[field][-1])
assert future_bio == expected, 'Only the actual paired D10 and P10 appends are authorized'
protected_subjects = {s['subject']: copy.deepcopy(s) for s in registry['subjects'] if s['subject'] != 'biologie'}
current_bio.clear()
current_bio.update(expected)
assert protected_subjects == {s['subject']: s for s in registry['subjects'] if s['subject'] != 'biologie'}

for op in plan['assetOperations']:
    assert op['action'] == 'copy_exact'
    verify({'path': op['source'], 'sha256': op['sourceSha256']})
    assert not (R / op['target']).exists(), op['target']
for gid in selected:
    copies = [op for op in plan['assetOperations'] if op['target'].endswith('/' + gid + '.png')]
    assert len(copies) == 3 and len({op['sourceSha256'] for op in copies}) == 1
    assert any(op['target'].startswith('backend/src/main/resources/static/') for op in copies)
assert {row['target'] for row in plan['reviewedActiveReplacementFiles']} == {str(canonical_path.relative_to(R)), str(qa_path.relative_to(R))}
for row in plan['reviewedActiveReplacementFiles']:
    verify(row['source'])
    verify(row['expectedBefore'])
for name, path in [('canonical', canonical_path), ('visualization-qa', qa_path), ('registry', registry_path)]:
    dst = D / 'before' / (name + '.json')
    dst.parent.mkdir(parents=True, exist_ok=True)
    assert not dst.exists()
    shutil.copyfile(path, dst)

# All checks above precede the authorized active writes.
for op in plan['assetOperations']:
    dst = R / op['target']
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(R / op['source'], dst)
    assert sha(dst) == norm(op['sourceSha256'])
for row in plan['reviewedActiveReplacementFiles']:
    shutil.copyfile(R / row['source']['path'], R / row['target'])
registry_path.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + '\n')
for key, row in plan['beforeBindings'].items():
    if key not in ['canonical', 'qa', 'registry']:
        verify(row)
for row in plan.get('protectedOtherFiles', []):
    verify(row)
assert read(canonical_path) == new and read(qa_path) == new_qa
write(D / 'guarded-active-ten-integration.actual.json', {
    'technicalSeal': {'path': str(seal_path.relative_to(R)), 'sha256': sha(seal_path)},
    'canonicalBeforeSha256': norm(plan['beforeBindings']['canonical']['sha256']),
    'canonicalAfterSha256': sha(canonical_path),
    'selectedGoalIds': sorted(selected),
    'wholeGoalChanges': 10, 'otherWholeGoalsExact': 464,
    'exactPngCopyOperations': 30, 'exactPromptAndProvenanceCopyOperations': 20,
    'changedGoalFields': ['resourceLinks'],
    'kindsAndCurrentAMConfigPointersUnchanged': True,
    'historicalReviewsAndLedgersUnchanged': True,
    'otherRegistrySubjectsUnchanged': True,
    'ledgerAndMaturityFloorsUnchanged': True,
    'humanApproval': False, 'humanTrial': False,
    'beforeStrict': 192, 'currentDenominator': 391,
    'newScientificClosuresClaimedBeforeCentralCheck': 0,
    'restoredBindingsClaimedBeforeCentralCheck': 0,
    'terminalCentralCheck': 'pending',
})
print(json.dumps({'copiedAssets': 50, 'changedWholeGoals': 10, 'otherWholeGoalsExact': 464, 'centralCheck': 'pending'}))
