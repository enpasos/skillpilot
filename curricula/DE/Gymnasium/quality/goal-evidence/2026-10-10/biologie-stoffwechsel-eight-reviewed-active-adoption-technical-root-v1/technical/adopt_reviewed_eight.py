"""Exact integration after completed independent reviews; no new scientific verdicts."""
import datetime
import hashlib
import json
import pathlib
import sys

ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
BASE = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
PREP = BASE / 'biologie-stoffwechsel-eight-current335-inactive-integration-technical-20261010-v1'
OWN = BASE / 'biologie-stoffwechsel-eight-reviewed-active-adoption-technical-root-v1'


def read(path):
    return json.loads((ROOT / path).read_text())


def bind(path):
    data = (ROOT / path).read_bytes()
    return {'path': str(path), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


seen = set()


def verify(value):
    if isinstance(value, list):
        for item in value:
            verify(item)
    elif isinstance(value, dict):
        if isinstance(value.get('path'), str) and isinstance(value.get('sha256'), str):
            path = pathlib.Path(value['path'])
            assert not path.is_absolute() and '..' not in path.parts, str(path)
            key = (str(path), value['sha256'])
            if key not in seen:
                actual = bind(path)
                assert actual['sha256'].removeprefix('sha256:') == value['sha256'].removeprefix('sha256:'), str(path)
                if 'bytes' in value:
                    assert actual['bytes'] == value['bytes'], str(path)
                seen.add(key)
        for item in value.values():
            verify(item)


def put(name, value):
    path = ROOT / OWN / name
    assert not path.exists(), str(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(value if isinstance(value, bytes) else (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode())
    return bind(path.relative_to(ROOT))


assert len(sys.argv) == 3, 'Supply the completed integration entry and final freeze paths'
assert not (ROOT / OWN / 'adoption.preflight.actual.json').exists(), 'Use a fresh journal for each actual adoption'
entry_path = pathlib.Path(sys.argv[1])
freeze_path = pathlib.Path(sys.argv[2])
entry = read(entry_path)
freeze = read(freeze_path)
verify(entry)
verify(freeze)
plan_path = PREP / 'ROOT.copy-list.only-eight-current-Bio-goals.inactive.json'
plan = read(plan_path)
verify(plan)
operations = plan['operations']
assert len(operations) == 27
assert len({op['target'] for op in operations}) == 27
canonical = pathlib.Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
qa = pathlib.Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
registry = pathlib.Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
ledger = pathlib.Path(plan['unchangedInFlightLedger'])
before = read(canonical)
after = read(pathlib.Path(operations[0]['source']['path']))
old = {g['id']: g for g in before['goals']}
new = {g['id']: g for g in after['goals']}
assert len(old) == len(new) == 479 and old.keys() == new.keys()
changed = {gid: sorted(k for k in set(g) | set(new[gid]) if g.get(k) != new[gid].get(k)) for gid, g in old.items() if g != new[gid]}
ids = set(changed)
assert len(ids) == 8 and all(fields == ['resourceLinks'] for fields in changed.values())
previous_path = BASE / 'biologie-sek1-insect-eight-reviewed-active-adoption-technical-root-v1/current335-exact-strict-ID-gain-and-protected-subjects.actual.json'
previous = read(previous_path)
protected = next(s for s in previous['subjects'] if s['subject'] == 'biologie')['strictCompleteGoalIds']
assert len(protected) == 335 and not ids.intersection(protected)
assert all(old[gid] == new[gid] for gid in protected)
old_qa = read(qa)
new_qa = read(pathlib.Path(operations[1]['source']['path']))
old_rows = {r['goalId']: r for r in old_qa['records']}
new_rows = {r['goalId']: r for r in new_qa['records']}
assert len(old_rows) == len(new_rows) == 394 and old_rows.keys() == new_rows.keys()
assert {gid for gid in old_rows if old_rows[gid] != new_rows[gid]} == ids
for gid in ids:
    row = new_rows[gid]
    assert row['humanApproved'] == old_rows[gid]['humanApproved'] == 'no'
    assert row['aiApproved'] == 'yes' and row['aiApprovedAssetSha256'] == row['assetSha256']
    assert row['chatGptNotes'] == 'Historical technical preparation: independent V A/B was pending then. Current independent A and fresh blind B are completed; see aiNotes.'
old_registry = read(registry)
bio_before = next(s for s in old_registry['subjects'] if s['subject'] == 'biologie')
bio_after = read(pathlib.Path(operations[-1]['source']['path']))
allowed = {'positiveEvidenceConfigPaths', 'resolutionIndexPaths'}
assert {k: v for k, v in bio_before.items() if k not in allowed} == {k: v for k, v in bio_after.items() if k not in allowed}
for key in allowed:
    assert len(bio_after[key]) == len(bio_before[key]) + 1 and bio_after[key][:-1] == bio_before[key]
index = read(pathlib.Path(bio_after['resolutionIndexPaths'][-1]))
verify(index)
dual = read(PREP / 'native-current-eight-dual-resolution/dual-summary.json')
assert {g['goalId'] for g in dual['goals']} == ids and dual['counts']['unavailable'] == 0
assert all(g['firstDecision'] == g['secondDecision'] == 'keep' for g in dual['goals'])
for gid in ids:
    resolution = read(PREP / 'native-current-eight-dual-resolution/resolutions' / (gid + '.resolution.json'))
    assert resolution['status'] == 'resolved' and resolution['decision'] == 'keep_current'
png_ops = operations[2:-1]
assert len(png_ops) == 24 and {op['scopeGoalId'] for op in png_ops} == ids
for op in png_ops:
    assert not (ROOT / op['target']).exists(), op['target']
    assert op['source']['sha256'] == new_rows[op['scopeGoalId']]['assetSha256']
unchanged = [bind(ledger), bind(pathlib.Path(plan['unchangedKinds394']['path']))]
put('before/whole479.exact.json', (ROOT / canonical).read_bytes())
put('before/QA394.exact.json', (ROOT / qa).read_bytes())
put('before/registry.exact.json', (ROOT / registry).read_bytes())
put('adoption.preflight.actual.json', {
    'schemaVersion': 1, 'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'Root technical adoption after two completed independent D/P/Native/V reviews; not a third scientific review',
    'completedEntry': bind(entry_path), 'completedFreeze': bind(freeze_path), 'copyPlan': bind(plan_path),
    'verifiedDeclaredBindings': len(seen), 'goalIds': sorted(ids), 'changedGoalFields': changed,
    'protected335WholeGoalBodiesExact': True, 'other386QARowsExact': True,
    'twoIndependentReviewAgents': True, 'actualCrossProviderOrModelDiversityProven': False,
    'unchangedLedgerAndKinds': unchanged, 'activeWrites': False, 'strictGain': 0,
    'humanApproval': False, 'humanTrial': False,
})
for op in operations[:-1]:
    destination = ROOT / op['target']
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes((ROOT / op['source']['path']).read_bytes())
    assert bind(pathlib.Path(op['target']))['sha256'] == op['source']['sha256']
for i, subject in enumerate(old_registry['subjects']):
    if subject['subject'] == 'biologie':
        old_registry['subjects'][i] = bio_after
(ROOT / registry).write_text(json.dumps(old_registry, ensure_ascii=False, indent=2) + '\n')
assert [bind(pathlib.Path(r['path'])) for r in unchanged] == unchanged
put('actual-reviewed-eight-active-adoption.receipt.json', {
    'schemaVersion': 1, 'adoptedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'Exact technical integration after genuine independent current reviews',
    'goalIds': sorted(ids), 'wholeGoalCount': 479, 'curricularAtomicDenominator': 394,
    'changedGoalFields': changed, 'changedQARowIds': sorted(ids), 'protected335WholeGoalBodiesExact': True,
    'allOtherSubjectRegistryObjectsRetained': True, 'previousExactStrictIDs': bind(previous_path),
    'unchangedLedgerAndKinds': unchanged, 'operativePStatus': 'needs_human_review', 'operativePReviewAuthority': 'ai_candidate',
    'operativePApprovedCount': 0, 'copies': [bind(pathlib.Path(op['target'])) for op in operations[:-1]],
    'afterActiveRegistry': bind(registry), 'strictCountPendingActualCentral': True, 'strictCompletionClaim': 0,
    'restoredBindings': 0, 'fullStableNormalChecksPending': True, 'humanApproval': False,
    'humanTrial': False, 'actualLearnerEvidence': False,
})
print(json.dumps({'eightTechnicallyAdopted': True, 'onlyEightResourceLinksAndQARowsChanged': True, 'verifiedDeclaredBindings': len(seen), 'strictCountPending': True, 'humanApproval': False}))
