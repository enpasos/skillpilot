#!/usr/bin/env python3
"""Bind existing independent scientific KEEP judgments; do not create science."""
import copy
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07'
QA = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'
IDS = {
    '0daa79f6-8f61-5506-98f9-65db83062ba8',
    '475eebb4-4eb0-524f-b1ec-4a672bf856d2',
    'ffef97e3-12d6-5090-9816-46ab9e57fae2',
    'e70d8a85-2dea-5165-919b-200fee9f4db4',
}
E70 = 'e70d8a85-2dea-5165-919b-200fee9f4db4'


def load(p):
    return json.loads(p.read_text())


def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def bind(p):
    return {'path': str(p.relative_to(ROOT)), 'sha256': digest(p), 'bytes': p.stat().st_size}


def write(name, value):
    with (OWN / name).open('x') as f:
        f.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


seal_defs = [
    ('biologie-q1-four-current-native-independent-root-a-20261007-v1', 'own-native-current-d-p-a-m-v-four.final.freeze.json', 'files', '5c18f1a91c2c99142af13a76e22eae0c44a0578cbc7ea1b0e9665db641678e2f'),
    ('biologie-q1-four-current390-fresh-independent-b-20261007-v1', 'own.first-pass.freeze.json', 'payloads', 'af25f4cccb388bdf752f404444238487b045a00573412964c0670852d0abd547'),
    ('biologie-three-current-fresh-blind-a-20261007-v2', 'scientific-first-pass.sealed.json', 'inputAndActualVisualBindings', '53988717760f3f42133cf5da4612aaf57c73227914c58bf6005eebe1e1b9b82c'),
    ('biologie-two-current-native-fresh-independent-b-20261007-v1', 'own.first-pass.freeze.json', 'payloads', 'd8bf2ed56fbbc4ca7009efac43f081b5635219b2ea56fa1fd133afa08070937f'),
]
verified = []
for folder, name, key, expected_seal in seal_defs:
    path = BASE / folder / name
    assert digest(path) == expected_seal, str(path)
    seal = load(path)
    for item in seal[key]:
        payload = ROOT / item['path']
        assert digest(payload) == item['sha256'].removeprefix('sha256:'), item['path']
        if 'bytes' in item:
            assert payload.stat().st_size == item['bytes'], item['path']
    verified.append({**bind(path), 'actualPayloadCount': len(seal[key]), 'payloadDrift': []})

old_a_path = BASE / seal_defs[0][0] / 'own-first-pass-current-four-science-and-actual-visual.root-a.json'
old_b_path = BASE / seal_defs[1][0] / 'four-current-selected-images.independent-v-b.first-pass.json'
new_a_path = BASE / seal_defs[2][0] / seal_defs[2][1]
new_b_path = BASE / seal_defs[3][0] / 'own.first-pass.judgments.json'
old_a = {r['goalId']: r for r in load(old_a_path)['rows']}
old_b = {r['goalId']: r for r in load(old_b_path)['records']}
new_a = {r['goalId']: r for r in load(new_a_path)['judgments']}
new_b = {r['goalId']: r for r in load(new_b_path)['goals']}
new_b_inputs = {g['id']: g for g in load(BASE / seal_defs[3][0] / 'reviewed-current-input.exact.json')['currentWholeGoals']}
canonical_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
goals = {g['id']: g for g in load(canonical_path)['goals']}
before_bytes = QA.read_bytes()
before = load(QA)
assert len(before['records']) == 391
after = copy.deepcopy(before)
timestamp = datetime.now(timezone.utc).isoformat()
changes = []
for row in after['records']:
    i = row['goalId']
    if i not in IDS:
        continue
    g = goals[i]
    assert row.get('aiApproved') != 'yes', i
    assert row['title'] == g['title'] and row['description'] == g['description'], i
    primary = [r for r in g['resourceLinks'] if r.get('type') == 'goal-visualization' and r.get('role') == 'primary']
    assert len(primary) == 1 and row['imageUrl'] == primary[0]['url'], i
    current_sha = row['assetSha256'].removeprefix('sha256:')
    assets = [ROOT / row['canonicalAssetPath'], ROOT / row['publicAssetPath'], ROOT / f'backend/src/main/resources/static/assets/goal-visualizations/biologie/{i}/{i}.png']
    assert all(digest(p) == current_sha for p in assets), i
    if i != E70:
        a, b = old_a[i], old_b[i]
        assert a['wholeBilingualCurrentCandidateGoal'] == g and a['V'] == 'KEEP', i
        logical_sha = hashlib.sha256(json.dumps(g, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
        assert logical_sha == b['wholeCandidateGoalLogicalSHA256'], i
        assert b['assetSha256'] == current_sha, i
        assert all(b[k] == 'KEEP' for k in ['verdict', 'scientificVerdict', 'readability360Verdict', 'readability680Verdict']), i
        assert b['originalActuallyViewed'] and b['actual360And680ActuallyViewed'], i
        assert a['actualPhysicalPagesInBothNativePDFsViewed'], i
        a_reason = a['VReason']
        b_reason = ' '.join(b['scientificFindings'] + b['readabilityFindings'])
        science_a, science_b = old_a_path, old_b_path
    else:
        # Added BW source/context is reviewed by the later two genuine first passes.
        a, b = new_a[i], new_b[i]
        assert a['currentWholeGoal'] == g == new_b_inputs[i], i
        assert a['V']['decision'] == 'accepted_pilot' and a['V']['aiMachineReviewOnly'], i
        assert b['visualDecision'] == 'KEEP' and b['decision'] == 'KEEP', i
        assert a['assetSha256'].removeprefix('sha256:') == b['assetSha256'].removeprefix('sha256:') == current_sha, i
        assert a['goalFingerprint'] == b['goalFingerprint'] and a['pageFingerprint'] == b['pageFingerprint'], i
        a_reason, b_reason = a['rationale']['V'], b['visualRationale']
        science_a, science_b = new_a_path, new_b_path
    row.update({
        'aiApproved': 'yes',
        'aiApprovedAssetSha256': row['assetSha256'],
        'aiReviewedAt': timestamp,
        'aiReviewer': 'Two genuine independent scientific and actual-image reviewers; technical current binding by Codex, version not exposed',
        'aiNotes': f'A: {a_reason} B: {b_reason} Existing independent machine judgments technically integrated for the exact current image and whole goal; no new scientific review claimed. Human Approval and Human Trial remain open. A science: {science_a.relative_to(ROOT)}; B science: {science_b.relative_to(ROOT)}',
    })
    changes.append({'goalId': i, 'scientificA': bind(science_a), 'scientificB': bind(science_b), 'actualThreeAssetCopies': [bind(p) for p in assets], 'usesLaterCurrentBWContextPair': i == E70})

allowed = {'aiApproved', 'aiApprovedAssetSha256', 'aiReviewedAt', 'aiReviewer', 'aiNotes'}
assert len(changes) == 4
for old, new in zip(before['records'], after['records']):
    assert old['goalId'] == new['goalId']
    if old['goalId'] not in IDS:
        assert old == new
    else:
        assert {k: v for k, v in new.items() if k not in allowed} == old
        assert all(old.get(k) == new.get(k) for k in set(old) | set(new) if k.startswith('human'))
assert {k: v for k, v in before.items() if k != 'records'} == {k: v for k, v in after.items() if k != 'records'}
with (OWN / 'before-active-biologie.qa.snapshot.json').open('xb') as f:
    f.write(before_bytes)
write('candidate-explicit-current-four-ai-approved.qa.json', after)
write('verified-independent-science-and-current-bindings.technical.json', {
    'role': 'Technical integration of existing independent judgments, not a new scientific review',
    'actualIndependentSealChecks': verified,
    'actualCurrentCanonical': bind(canonical_path),
    'changes': changes,
    'allowedFields': sorted(allowed),
    'other387RecordsExactIncludingNewENG': True,
    'allHumanFieldsExact': True,
    'newScientificReviews': 0,
    'humanApproval': False,
    'humanTrial': False,
    'centralStrictProgressClaimed': False,
})
assert QA.read_bytes() == before_bytes, 'concurrent QA modification'
QA.write_text(json.dumps(after, ensure_ascii=False, indent=2) + '\n')
write('active-target-apply.actual.receipt.json', {
    'appliedAtUTC': datetime.now(timezone.utc).isoformat(),
    'target': bind(QA),
    'beforeSnapshot': bind(OWN / 'before-active-biologie.qa.snapshot.json'),
    'changedGoalIds': sorted(IDS),
    'changedFieldsOnly': sorted(allowed),
    'newScientificReviews': 0,
    'humanApproval': False,
    'humanTrial': False,
})
command = ['app/node_modules/.bin/tsx', 'app/scripts/generateGoalVisualizationQaLedgers.ts', '--check', '--subject=biologie']
started = datetime.now(timezone.utc).isoformat()
result = subprocess.run(command, cwd=ROOT, capture_output=True)
for name, data in [('native-biologie-QA-freshness.actual.stdout.txt', result.stdout), ('native-biologie-QA-freshness.actual.stderr.txt', result.stderr)]:
    with (OWN / name).open('xb') as f:
        f.write(data)
write('native-biologie-QA-freshness.actual.terminal.receipt.json', {
    'command': command,
    'cwd': '.',
    'startedAtUTC': started,
    'completedAtUTC': datetime.now(timezone.utc).isoformat(),
    'exitCode': result.returncode,
    'stdout': bind(OWN / 'native-biologie-QA-freshness.actual.stdout.txt'),
    'stderr': bind(OWN / 'native-biologie-QA-freshness.actual.stderr.txt'),
})
print(result.stdout.decode(), end='')
print(result.stderr.decode(), end='')
raise SystemExit(result.returncode)
