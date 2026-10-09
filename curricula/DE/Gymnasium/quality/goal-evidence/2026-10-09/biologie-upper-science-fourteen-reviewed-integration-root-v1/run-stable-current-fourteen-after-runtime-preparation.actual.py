# SPDX-License-Identifier: Apache-2.0
"""Resume only the blocked copy check and stable report; retain the first failure."""
import hashlib
import json
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent


def read(path):
    return json.loads(path.read_text())


def bind(path):
    raw = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def put(path, value):
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def run(label, argv):
    out, err = (OWN / 'checks' / f'{label}.{stream}.actual.txt' for stream in ('stdout', 'stderr'))
    assert not out.exists() and not err.exists()
    started = time.monotonic()
    with out.open('w') as stdout, err.open('w') as stderr:
        result = subprocess.run(argv, cwd=ROOT, stdout=stdout, stderr=stderr, shell=False)
    put(OWN / 'checks' / f'{label}.terminal.actual.json', {
        'argv': argv, 'actualExitCode': result.returncode, 'elapsedSeconds': time.monotonic() - started,
        'endedAt': datetime.now(timezone.utc).isoformat(), 'stdout': bind(out), 'stderr': bind(err)})
    print(json.dumps({'check': label, 'actualExitCode': result.returncode}), flush=True)
    assert result.returncode == 0, (label, err.read_text()[-5000:], out.read_text()[-5000:])
    return out


affected_passes = [OWN / 'checks' / f'{label}.terminal.actual.json' for label in (
    'current-P12', 'current-P2', 'current-A394', 'current-M394', 'current-V394-normalize',
    'current-V394-check', 'current-source394-refresh', 'current-source394-check', 'current-fourteen-native-frame')]
assert all(read(path)['actualExitCode'] == 0 for path in affected_passes)
first_copy_check = OWN / 'checks/current-installed-image-copies.terminal.actual.json'
assert read(first_copy_check)['actualExitCode'] == 1
assert 'CANONICAL_WIRTSCHAFT' in (OWN / 'checks/current-installed-image-copies.stderr.actual.txt').read_text()
run('current-installed-image-copies-after-normal-preparation', ['node', 'scripts/check_goal_visualization_assets.mjs'])
cli = ['node', 'app/node_modules/tsx/dist/cli.mjs']
out = run('current-central-all-four-stable', cli + ['app/scripts/reportDeepUnderstandingRollout.ts', '--mode=check', '--format=json'])
current = read(out)
baseline_path = OWN.parent.parent / '2026-10-08/chemie177-biologie262-commit-checkpoint-root-20261008-v1/current-central-all-four-stable.stdout.actual.txt'
old = {s['subject']: s for s in read(baseline_path)['subjects']}
now = {s['subject']: s for s in current['subjects']}
assert current['blockingIssueCount'] == 0
for subject in ('mathematik', 'physik', 'chemie'):
    assert old[subject] == now[subject], subject
bio = now['biologie']
assert bio['denominator'] == 394 and bio['strictComplete'] == 276, bio
old_ids, current_ids = set(old['biologie']['strictCompleteGoalIds']), set(bio['strictCompleteGoalIds'])
selected_ids = {row['goalId'] for row in read(OWN / 'checks/current-fourteen-genuine-PV-AM-pair.actual.json')['positivePairs']}
assert len(selected_ids) == 14 and not old_ids.intersection(selected_ids)
assert old_ids <= current_ids and current_ids - old_ids == selected_ids
put(OWN / 'strict-current-fourteen-new-closures.actual.json', {
    'schemaVersion': 1, 'verifiedAt': datetime.now(timezone.utc).isoformat(),
    'actualCentral': bind(out), 'actualBaseline': bind(baseline_path),
    'affectedOrdinaryPasses': [bind(path) for path in affected_passes],
    'firstMissingRuntimeCopyFailureRetained': bind(first_copy_check),
    'runtimeCopyRecoveryWasOrdinaryLocalPreparation': True,
    'subjects': [{k: s[k] for k in ('subject', 'strictComplete', 'denominator', 'percentage', 'remaining', 'gates')} for s in current['subjects']],
    'packageNetStrictGain': 14, 'newScientificClosures': sorted(selected_ids),
    'restoredExistingStrictBindingsCount': 0, 'all262EarlierBiologyStrictIdsRetained': True,
    'otherThreeSubjectsExact': True, 'denominatorDelta': 0,
    'humanApproval': False, 'humanTrial': False, 'CQR303M7Completion': False})
print(json.dumps({'actualStrictBiology': '276/394', 'newScientificClosures': 14,
                  'restoredExistingStrictBindings': 0, 'otherThreeSubjectsExact': True}), flush=True)
