# SPDX-License-Identifier: Apache-2.0
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
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size}

def put(path, value):
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def run(label, argv):
    out = OWN / 'checks' / f'{label}.stdout.actual.txt'
    err = OWN / 'checks' / f'{label}.stderr.actual.txt'
    assert not out.exists() and not err.exists()
    started = time.monotonic()
    with out.open('w') as stdout, err.open('w') as stderr:
        result = subprocess.run(argv, cwd=ROOT, stdout=stdout, stderr=stderr)
    put(OWN / 'checks' / f'{label}.terminal.actual.json', {
        'argv': argv, 'actualExitCode': result.returncode, 'elapsedSeconds': time.monotonic() - started,
        'endedAt': datetime.now(timezone.utc).isoformat(), 'stdout': bind(out), 'stderr': bind(err)})
    print(json.dumps({'check': label, 'actualExitCode': result.returncode}), flush=True)
    assert result.returncode == 0, (label, err.read_text()[-4000:], out.read_text()[-4000:])
    return out

cli = ['node', 'app/node_modules/tsx/dist/cli.mjs']
sub = next(s for s in read(ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')['subjects'] if s['subject'] == 'biologie')
run('current-P16', cli + ['app/scripts/positiveGoalEvidenceReview.ts', '--mode=check', '--config=' + str((OWN / 'positive/current-sixteen.future-active.config.json').relative_to(ROOT))])
run('current-A394', cli + ['app/scripts/semanticAtomicityReview.ts', '--mode=check', '--config=' + sub['semanticAtomicityConfigPath']])
run('current-M394', cli + ['app/scripts/memoryCardReview.ts', '--mode=check', '--config=' + sub['memoryReviewConfigPath']])
run('current-V394-normalize', cli + ['app/scripts/generateGoalVisualizationQaLedgers.ts', '--subjects=biologie'])
run('current-V394-check', cli + ['app/scripts/generateGoalVisualizationQaLedgers.ts', '--subjects=biologie', '--check'])
run('current-source394-refresh', cli + ['app/scripts/buildGoalBookSourceAtlasInputs.ts', '--config', 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'])
run('current-source394-check', cli + ['app/scripts/buildGoalBookSourceAtlasInputs.ts', '--config', 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json', '--check'])
run('current-sixteen-native-frame', cli + [str((OWN / 'verify-current-sixteen-native-frame.technical.mts').relative_to(ROOT))])
run('current-installed-image-copies', ['node', 'scripts/check_goal_visualization_assets.mjs'])
out = run('current-central-all-four-stable', cli + ['app/scripts/reportDeepUnderstandingRollout.ts', '--mode=check', '--format=json'])
current = read(out)
baseline = read(OWN.parent / 'biologie-stoffwechsel-first-three-reviewed-integration-root-20261008-v1/affected-central.stdout.actual.txt')
old = {s['subject']: s for s in baseline['subjects']}
now = {s['subject']: s for s in current['subjects']}
assert current['blockingIssueCount'] == 0
for subject in ('mathematik', 'physik', 'chemie'):
    assert old[subject] == now[subject], subject
bio = now['biologie']
assert bio['denominator'] == 394 and bio['strictComplete'] == 262, bio
before_ids = set(old['biologie']['strictCompleteGoalIds'])
current_ids = set(bio['strictCompleteGoalIds'])
assert before_ids <= current_ids
sixteen = {r['goalId'] for r in read(OWN / 'checks/current-sixteen-PV-pair.actual.json')['pairedWholeProfiles']}
new_two = {'0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38', '32483d30-2162-50a5-a6cc-05b7f2467ab1'}
assert current_ids - before_ids == sixteen | new_two
summary = {'schemaVersion': 1, 'actualCentralExitCode': 0,
           'subjects': [{k: s[k] for k in ('subject', 'strictComplete', 'denominator', 'percentage', 'remaining', 'gates')} for s in current['subjects']],
           'packageNetStrictGain': 16, 'combinedContinuationNetStrictGain': 18,
           'newScientificClosures': sorted(current_ids - before_ids), 'restoredExistingStrictBindingsCount': 0,
           'all244EarlierBiologyStrictIdsRetained': True, 'otherThreeSubjectsExact': True,
           'denominatorDelta': 2, 'humanApproval': False, 'humanTrial': False,
           'CQR303M7Completion': False}
put(OWN / 'strict-current-eighteen-new-closures.actual.json', summary)
print(json.dumps(summary), flush=True)
