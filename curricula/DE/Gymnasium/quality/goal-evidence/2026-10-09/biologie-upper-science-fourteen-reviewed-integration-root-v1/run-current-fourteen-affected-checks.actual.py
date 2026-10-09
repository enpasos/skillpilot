# SPDX-License-Identifier: Apache-2.0
"""Run ordinary affected gates, then measure the exact current strict gain."""
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
    out = OWN / 'checks' / f'{label}.stdout.actual.txt'
    err = OWN / 'checks' / f'{label}.stderr.actual.txt'
    assert not out.exists() and not err.exists()
    started = time.monotonic()
    with out.open('w') as stdout, err.open('w') as stderr:
        result = subprocess.run(argv, cwd=ROOT, stdout=stdout, stderr=stderr, shell=False)
    put(OWN / 'checks' / f'{label}.terminal.actual.json', {
        'argv': argv, 'actualExitCode': result.returncode,
        'elapsedSeconds': time.monotonic() - started,
        'endedAt': datetime.now(timezone.utc).isoformat(), 'stdout': bind(out), 'stderr': bind(err)})
    print(json.dumps({'check': label, 'actualExitCode': result.returncode}), flush=True)
    assert result.returncode == 0, (label, err.read_text()[-5000:], out.read_text()[-5000:])
    return out


assert (OWN / 'ordinary-fourteen-active-adoption.actual.json').is_file()
cli = ['node', 'app/node_modules/tsx/dist/cli.mjs']
registry = read(ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
sub = next(s for s in registry['subjects'] if s['subject'] == 'biologie')
for label in ('P12', 'P2'):
    config = str((OWN / 'positive' / f'{label}.paired-current.future-active.config.json').relative_to(ROOT))
    run(f'current-{label}', cli + ['app/scripts/positiveGoalEvidenceReview.ts', '--mode=check', '--config=' + config])
run('current-A394', cli + ['app/scripts/semanticAtomicityReview.ts', '--mode=check', '--config=' + sub['semanticAtomicityConfigPath']])
run('current-M394', cli + ['app/scripts/memoryCardReview.ts', '--mode=check', '--config=' + sub['memoryReviewConfigPath']])
run('current-V394-normalize', cli + ['app/scripts/generateGoalVisualizationQaLedgers.ts', '--subjects=biologie'])
run('current-V394-check', cli + ['app/scripts/generateGoalVisualizationQaLedgers.ts', '--subjects=biologie', '--check'])
source_cfg = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
run('current-source394-refresh', cli + ['app/scripts/buildGoalBookSourceAtlasInputs.ts', '--config', source_cfg])
run('current-source394-check', cli + ['app/scripts/buildGoalBookSourceAtlasInputs.ts', '--config', source_cfg, '--check'])
run('current-fourteen-native-frame', cli + [str((OWN / 'verify-current-fourteen-native-frame.technical.mts').relative_to(ROOT))])
run('current-installed-image-copies', ['node', 'scripts/check_goal_visualization_assets.mjs'])
out = run('current-central-all-four-stable', cli + ['app/scripts/reportDeepUnderstandingRollout.ts', '--mode=check', '--format=json'])
current = read(out)
baseline_path = OWN.parent.parent / '2026-10-08/chemie177-biologie262-commit-checkpoint-root-20261008-v1/current-central-all-four-stable.stdout.actual.txt'
baseline = read(baseline_path)
old = {s['subject']: s for s in baseline['subjects']}
now = {s['subject']: s for s in current['subjects']}
assert current['blockingIssueCount'] == 0
for subject in ('mathematik', 'physik', 'chemie'):
    assert old[subject] == now[subject], subject
bio = now['biologie']
assert bio['denominator'] == 394 and bio['strictComplete'] == 276, bio
old_ids = set(old['biologie']['strictCompleteGoalIds'])
current_ids = set(bio['strictCompleteGoalIds'])
selected_ids = {r['goalId'] for r in read(OWN / 'checks/current-fourteen-genuine-PV-AM-pair.actual.json')['positivePairs']}
assert len(selected_ids) == 14 and not old_ids.intersection(selected_ids)
assert old_ids <= current_ids and current_ids - old_ids == selected_ids
put(OWN / 'strict-current-fourteen-new-closures.actual.json', {
    'schemaVersion': 1, 'verifiedAt': datetime.now(timezone.utc).isoformat(),
    'actualCentral': bind(out), 'actualBaseline': bind(baseline_path),
    'subjects': [{k: s[k] for k in ('subject', 'strictComplete', 'denominator', 'percentage', 'remaining', 'gates')} for s in current['subjects']],
    'packageNetStrictGain': 14, 'newScientificClosures': sorted(selected_ids),
    'restoredExistingStrictBindingsCount': 0, 'all262EarlierBiologyStrictIdsRetained': True,
    'otherThreeSubjectsExact': True, 'denominatorDelta': 0,
    'humanApproval': False, 'humanTrial': False, 'CQR303M7Completion': False})
print(json.dumps({'actualStrictBiology': '276/394', 'newScientificClosures': 14,
                  'restoredExistingStrictBindings': 0, 'otherThreeSubjectsExact': True}), flush=True)
