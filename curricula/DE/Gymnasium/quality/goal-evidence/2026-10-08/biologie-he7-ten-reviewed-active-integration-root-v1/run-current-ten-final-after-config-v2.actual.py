# SPDX-License-Identifier: Apache-2.0
"""Capture actual affected checks and verify the current strict set delta."""
from pathlib import Path
import json
import subprocess
import time

D = Path(__file__).resolve().parent
R = D.parents[6]
T = D.parent / 'biologie-he7-ten-reviewed-integration-preparation-technical-20261008-v1'
plan = json.loads((T / 'ready-root-reviewed-guarded-integration-plan.technical.json').read_text())
# Original D10 check is already actual0; corrected operational P10 check is actual0.
commands = [('active-check-3', plan['mustRunAfterApply'][2]['argv'])]
commands.append(('active-after-ten-central', ['node', 'app/node_modules/tsx/dist/cli.mjs', 'app/scripts/reportDeepUnderstandingRollout.ts', '--mode=check', '--format=json']))
for name, command in commands:
    started = time.time()
    result = subprocess.run(command, cwd=R, capture_output=True, text=True)
    output = D / (name + ('.actual.json' if name.endswith('central') else '.stdout.actual.txt'))
    with output.open('x') as f:
        f.write(result.stdout)
    with (D / (name + '.stderr.actual.txt')).open('x') as f:
        f.write(result.stderr)
    with (D / (name + '.exit.actual.json')).open('x') as f:
        json.dump({'command': command, 'exitCode': result.returncode, 'durationSeconds': time.time() - started}, f, indent=2)
        f.write('\n')
    print(json.dumps({'check': name, 'exitCode': result.returncode}), flush=True)
    if result.returncode:
        print(result.stderr[-4000:], flush=True)
        raise SystemExit(result.returncode)

before = json.loads((D.parent / 'biologie-he9-one-reviewed-active-integration-root-v1/active-after-one-central.actual.json').read_text())
after = json.loads((D / 'active-after-ten-central.actual.json').read_text())
old = {s['subject']: s for s in before['subjects']}
new = {s['subject']: s for s in after['subjects']}
for subject in old:
    assert old[subject]['currentGoalIds'] == new[subject]['currentGoalIds']
    if subject != 'biologie':
        assert old[subject]['strictCompleteGoalIds'] == new[subject]['strictCompleteGoalIds']
old_ids = set(old['biologie']['strictCompleteGoalIds'])
new_ids = set(new['biologie']['strictCompleteGoalIds'])
assert len(old_ids) == 192 and len(new_ids) == 202
assert old_ids <= new_ids and new_ids - old_ids == set(plan['selectedGoalIds'])
assert after['blockingIssueCount'] == 0
delta = {
    'beforeStrict': 192, 'afterStrict': 202, 'currentDenominator': 391,
    'exactAddedGoalIds': sorted(new_ids - old_ids), 'exactRemovedGoalIds': [],
    'netStrictGain': 10, 'newScientificClosures': 10, 'restoredBindingOnlyClosures': 0,
    'chemistryStrictUnchanged': new['chemie']['strictComplete'],
    'mathAndPhysicsCurrentAndStrictSetsUnchanged': True,
    'blockingIssueCount': 0, 'humanApprovalOrTrialClaimed': False,
}
with (D / 'exact-current-strict-plus-ten-delta.actual.json').open('x') as f:
    json.dump(delta, f, indent=2)
    f.write('\n')
print(json.dumps(delta), flush=True)
