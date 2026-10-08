# SPDX-License-Identifier: Apache-2.0
import json
import hashlib
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

def run(label, argv):
    out, err = OWN / f'{label}.stdout.actual.txt', OWN / f'{label}.stderr.actual.txt'
    assert not out.exists() and not err.exists()
    started = time.monotonic()
    with out.open('w') as stdout, err.open('w') as stderr:
        result = subprocess.run(argv, cwd=ROOT, stdout=stdout, stderr=stderr)
    terminal = OWN / f'{label}.terminal.actual.json'
    assert not terminal.exists()
    terminal.write_text(json.dumps({'argv': argv, 'actualExitCode': result.returncode,
                                   'elapsedSeconds': time.monotonic() - started, 'endedAt': datetime.now(timezone.utc).isoformat(),
                                   'stdout': bind(out), 'stderr': bind(err)}, indent=2) + '\n')
    print(json.dumps({'check': label, 'actualExitCode': result.returncode}), flush=True)
    assert result.returncode == 0, (label, err.read_text()[-3500:], out.read_text()[-3500:])
    return out

cli = ['node', 'app/node_modules/tsx/dist/cli.mjs']
run('current-installed-images-after-exact-two-backend-mirrors', ['node', 'scripts/check_goal_visualization_assets.mjs'])
run('current-measured-transparency-inventory', ['node', 'scripts/check_ai_transparency_inventory.mjs'])
out = run('current-central-all-four-stable', cli + ['app/scripts/reportDeepUnderstandingRollout.ts', '--mode=check', '--format=json'])
current = read(out)
baseline = read(OWN.parent / 'biologie-stoffwechsel-first-three-reviewed-integration-root-20261008-v1/affected-central.stdout.actual.txt')
old, now = [{s['subject']: s for s in report['subjects']} for report in (baseline, current)]
assert current['blockingIssueCount'] == 0
for subject in ('mathematik', 'physik', 'chemie'):
    assert old[subject] == now[subject], subject
assert (now['biologie']['strictComplete'], now['biologie']['denominator']) == (262, 394)
previous = set(old['biologie']['strictCompleteGoalIds'])
complete = set(now['biologie']['strictCompleteGoalIds'])
assert previous <= complete
pair = read(OWN.parent / 'biologie-upper-sixteen-reviewed-integration-root-resumed-v1/checks/current-sixteen-PV-pair.actual.json')
new_ids = {r['goalId'] for r in pair['pairedWholeProfiles']} | {'0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38', '32483d30-2162-50a5-a6cc-05b7f2467ab1'}
assert complete - previous == new_ids
summary = {'schemaVersion': 1, 'centralActualExitCode': 0,
           'subjects': [{k: s[k] for k in ('subject', 'strictComplete', 'denominator', 'percentage', 'remaining', 'gates')} for s in current['subjects']],
           'netStrictGain': 18, 'newScientificClosures': sorted(new_ids), 'restoredExistingStrictBindingNetGain': 0,
           'old244BiologyStrictIdsRetained': True, 'mathAndPhysicsM7Protected': True, 'denominatorDelta': 2,
           'humanApproval': False, 'humanTrial': False, 'goal100PercentAchieved': False}
path = OWN / 'current-strict-eighteen-new-closures.actual.json'
assert not path.exists()
path.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(summary), flush=True)
run('current-memory-reports-all', ['npm', '--prefix', 'app', 'run', 'quality:memory-card-review:report:all'])
run('current-curriculum-status-dependent-layer-a', ['npm', '--prefix', 'app', 'run', 'quality:curriculum-status'])
run('current-all-nine-protected-maturity-floors', ['npm', '--prefix', 'app', 'run', 'check:curriculum-maturity-floors'])
run('current-chemistry-rollout-freshness', ['npm', '--prefix', 'app', 'run', 'check:goal-visualization-rollout-status:chemie'])
run('current-visualization-coverage-parity', ['npm', '--prefix', 'app', 'run', 'check:goal-visualization-qa-coverage-parity'])
run('current-deep-understanding-transition-regressions', ['npm', '--prefix', 'app', 'run', 'test:deep-understanding-rollout'])
