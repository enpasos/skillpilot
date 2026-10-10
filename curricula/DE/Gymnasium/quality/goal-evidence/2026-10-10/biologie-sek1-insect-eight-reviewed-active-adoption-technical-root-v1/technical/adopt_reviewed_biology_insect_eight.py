"""Adopt exact, independently reviewed eight-goal artifacts; no scientific verdicts."""
import datetime
import hashlib
import json
import pathlib
import subprocess

ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
BASE = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
PREP = BASE / 'biologie-sek1-insect-eight-reviewed-integration-technical-v1'
OWN = BASE / 'biologie-sek1-insect-eight-reviewed-active-adoption-technical-root-v1'
assert not (ROOT / OWN).exists(), 'Use a fresh journal for each actual adoption'

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
            assert not path.is_absolute() and '..' not in path.parts
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

final_path = PREP / 'technical.final.freeze.json'
final = read(final_path)
verify(final)
entry = read(PREP / 'reviewed-eight-integration.technical.entry.json')
verify(entry)
plan = read(PREP / 'candidate/eight-current-reviewed-raster-copy-plan.json')
verify(plan)
ids = entry['goalIds']
assert len(ids) == len(set(ids)) == 8
canonical = pathlib.Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
registry = pathlib.Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
qa_path = pathlib.Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
before = read(canonical)
after = read(pathlib.Path(entry['futureCanonicalCopy']['path']))
old = {g['id']: g for g in before['goals']}
new = {g['id']: g for g in after['goals']}
assert len(old) == len(new) == 479 and old.keys() == new.keys()
changed = {gid: sorted(k for k in set(g) | set(new[gid]) if g.get(k) != new[gid].get(k)) for gid, g in old.items() if g != new[gid]}
assert changed == entry['changedOldGoalFields']
assert set(changed) == set(ids) and all(fields == ['resourceLinks'] for fields in changed.values())
baseline = read(BASE / 'biologie-q1-four-reviewed-active-adoption-technical-root-v1/current327-exact-strict-ID-gain-and-protected-subjects.actual.json')
protected = next(s for s in baseline['subjects'] if s['subject'] == 'biologie')['strictCompleteGoalIds']
assert len(protected) == 327 and not set(protected).intersection(ids)
assert all(old[gid] == new[gid] for gid in protected)
old_registry = read(registry)
future_registry = read(pathlib.Path(entry['futureRegistry']['path']))
assert {k: v for k, v in old_registry.items() if k != 'subjects'} == {k: v for k, v in future_registry.items() if k != 'subjects'}
for existing, future in zip(old_registry['subjects'], future_registry['subjects']):
    if existing['subject'] != 'biologie':
        assert existing == future
    else:
        allowed = {'resolutionIndexPaths', 'positiveEvidenceConfigPaths'}
        assert {k: v for k, v in existing.items() if k not in allowed} == {k: v for k, v in future.items() if k not in allowed}
        assert future['resolutionIndexPaths'][:-2] == existing['resolutionIndexPaths']
        assert future['positiveEvidenceConfigPaths'][:-2] == existing['positiveEvidenceConfigPaths']
copies = plan['exactCopies']
assert len({row['to'] for row in copies}) == len(copies)
assert all(not (ROOT / row['to']).exists() for row in copies)
paired = {row['goalId']: row for row in plan['pairedCurrentMachineKEEP']}
assert set(paired) == set(ids)
for gid, row in paired.items():
    assert row['aDecision'].startswith('KEEP') and row['bDecision'].startswith('KEEP')
    assert row['humanApproval'] is False
    assert any(copy['to'].endswith('/' + gid + '.png') and copy['from']['sha256'] == row['actualCurrentAsset']['sha256'] for copy in copies)
old_qa = read(qa_path)
put('before/whole479-before-active-adoption.exact.json', (ROOT / canonical).read_bytes())
put('before/registry-before-active-adoption.exact.json', (ROOT / registry).read_bytes())
put('before/QA394-before-active-adoption.exact.json', (ROOT / qa_path).read_bytes())
put('adoption.preflight.actual.json', {'schemaVersion': 1, 'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'role': 'Technical copy preflight; root authored original P8 and is not an independent D/P reviewer', 'preparedFinalFreeze': bind(final_path), 'preparedEntry': bind(PREP / 'reviewed-eight-integration.technical.entry.json'), 'verifiedDeclaredBindings': len(seen), 'changedGoalFields': changed, 'protected327WholeGoalBodiesExact': True, 'copyPlan': bind(PREP / 'candidate/eight-current-reviewed-raster-copy-plan.json'), 'pairedV': bind(PREP / 'candidate/eight-current-paired-machine-V-bindings.json'), 'P7P1OriginalReviewIdsAndWholeRecordsRetained': True, 'activeWrites': False, 'newScientificClosures': 0, 'restoredBindings': 0, 'strictNetGain': 0, 'humanApproval': False})
for row in copies:
    destination = ROOT / row['to']
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes((ROOT / row['from']['path']).read_bytes())
    assert bind(pathlib.Path(row['to']))['sha256'] == row['from']['sha256']
(ROOT / canonical).write_bytes((ROOT / entry['futureCanonicalCopy']['path']).read_bytes())
(ROOT / registry).write_bytes((ROOT / entry['futureRegistry']['path']).read_bytes())
command = ['app/node_modules/.bin/tsx', 'app/scripts/generateGoalVisualizationQaLedgers.ts', '--subject=biologie']
started = datetime.datetime.now(datetime.timezone.utc)
result = subprocess.run(command, cwd=ROOT, text=True, capture_output=True)
put('checks/normal-QA8-generation.stdout.actual.txt', result.stdout.encode())
put('checks/normal-QA8-generation.stderr.actual.txt', result.stderr.encode())
put('checks/normal-QA8-generation.terminal.actual.json', {'schemaVersion': 1, 'command': command, 'startedAt': started.isoformat(), 'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'exitCode': result.returncode})
assert result.returncode == 0, result.stderr
next_qa = read(qa_path)
for row in next_qa['records']:
    gid = row['goalId']
    if gid not in paired:
        continue
    evidence = paired[gid]
    assert row['assetSha256'] == evidence['actualCurrentAsset']['sha256']
    assert row['humanApproved'] == 'no'
    row.update(aiApproved='yes', aiApprovedAssetSha256=row['assetSha256'], aiReviewedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(), aiReviewer='Two completed independent actual raster and whole Native reviewers; root technical adoption only', aiNotes='Actual original/360/680 KEEP. A: ' + evidence['aActualRationaleDe'] + ' B: ' + ' '.join(evidence['bActualScienceFindingsDe']) + ' ' + evidence['bActual360680FindingsDe'] + ' Exact independent origins and current image bindings: ' + str(PREP / 'candidate/eight-current-paired-machine-V-bindings.json') + '. Original FCC disagreement and corrected adult-frog history retained. P8 and current Native D/P independently reviewed; root is original P author, not a third independent reviewer. No human approval, trial, learner evidence, physical-handset or host acceptance.')
old_rows = {row['goalId']: row for row in old_qa['records']}
changed_qa = [row['goalId'] for row in next_qa['records'] if row != old_rows.get(row['goalId'])]
assert sorted(changed_qa) == sorted(ids), changed_qa
(ROOT / qa_path).write_text(json.dumps(next_qa, ensure_ascii=False, indent=2) + '\n')
put('actual-reviewed-eight-active-adoption.receipt.json', {'schemaVersion': 1, 'adoptedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'role': 'Exact technical adoption after genuine independent D/P and current V reviews', 'goalIds': ids, 'wholeGoalCount': 479, 'curricularAtomicDenominator': 394, 'changedGoalFields': changed, 'changedQARowIds': changed_qa, 'protected327WholeGoalBodiesExact': True, 'allOtherSubjectRegistryObjectsRetained': True, 'source31Scopes24KindsAndScientificAM394Retained': True, 'originalProfiles8Cases16Exact': entry['wholeScientificP8AndSixteenCases'], 'selectedLiteralP7P1': entry['operativeOriginalAuthorP7AndSeparateCurrentP1'], 'PStatus': 'E1/G1/ai_candidate/needs_human_review; approved0', 'originalGenuineFCCBlockAndPeerKEEPRetained': True, 'copyOutputs': [bind(pathlib.Path(row['to'])) for row in copies], 'afterActiveBindings': [bind(canonical), bind(registry), bind(qa_path)], 'strictCountPendingActualCentral': True, 'strictCompletionClaim': 0, 'restoredBindings': 0, 'fullStableNormalChecksPending': True, 'humanApproval': False, 'humanTrial': False, 'actualLearnerEvidence': False})
put('technical/adopt_reviewed_biology_insect_eight.py', pathlib.Path(__file__).read_bytes())
print(json.dumps({'eightTechnicallyAdopted': True, 'normalQAGeneration': 'PASS', 'onlyEightGoalResourceLinksAndQARowsChanged': True, 'verifiedDeclaredBindings': len(seen), 'strictCountPending': True, 'humanApproval': False}))
