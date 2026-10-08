# SPDX-License-Identifier: Apache-2.0
"""Capture terminal active checks and exact current strict-set deltas."""
from pathlib import Path
import json
import subprocess
import time

D = Path(__file__).resolve().parent
R = D.parents[6]
T = D.parent / 'biologie-he9-genetic-method19-reviewed-integration-preparation-technical-20261008-v1'
rel = lambda p: str(p.relative_to(R))
commands = [(f'active-check-{i + 1}', row['argv']) for i, row in enumerate(json.loads((T / 'ready-root-reviewed-guarded-integration-plan.technical.json').read_text())['mustRunAfterApply'][:3])]
commands += [
    ('active-current-A391', ['npm', '--prefix', 'app', 'run', 'quality:semantic-atomicity:check', '--', '--config=curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.config.json']),
    ('active-current-M391', ['npm', '--prefix', 'app', 'run', 'quality:memory-card-review:check', '--', '--config=curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.config.json']),
    ('active-after-one-central', ['node', 'app/node_modules/tsx/dist/cli.mjs', 'app/scripts/reportDeepUnderstandingRollout.ts', '--mode=check', '--format=json']),
]
for name, command in commands:
    t = time.time()
    result = subprocess.run(command, cwd=R, capture_output=True, text=True)
    output = D / (name + ('.actual.json' if name.endswith('central') else '.stdout.actual.txt'))
    with output.open('x') as f:
        f.write(result.stdout)
    with (D / (name + '.stderr.actual.txt')).open('x') as f:
        f.write(result.stderr)
    with (D / (name + '.exit.actual.json')).open('x') as f:
        json.dump({'command': command, 'exitCode': result.returncode, 'durationSeconds': time.time() - t}, f, indent=2)
        f.write('\n')
    print(json.dumps({'check': name, 'exitCode': result.returncode}), flush=True)
    if result.returncode:
        print(result.stderr[-4000:], flush=True)
        raise SystemExit(result.returncode)
before = json.loads((D.parent / 'biologie-he9-seventeen-reviewed-active-integration-root-v1/active-after-he17-central.actual.json').read_text())
after = json.loads((D / 'active-after-one-central.actual.json').read_text())
old = {s['subject']: s for s in before['subjects']}
new = {s['subject']: s for s in after['subjects']}
for subject in old:
    assert old[subject]['currentGoalIds'] == new[subject]['currentGoalIds']
    if subject != 'biologie':
        assert old[subject]['strictCompleteGoalIds'] == new[subject]['strictCompleteGoalIds']
old_b = set(old['biologie']['strictCompleteGoalIds'])
new_b = set(new['biologie']['strictCompleteGoalIds'])
assert len(old_b) == 191 and len(new_b) == 192
assert old_b <= new_b
assert new_b - old_b == {'1b7f08a1-33df-5779-af66-430c91d699b7'}
assert after['blockingIssueCount'] == 0
delta = {'beforeStrict': 191, 'afterStrict': 192, 'currentDenominator': 391,
         'exactAddedGoalIds': sorted(new_b - old_b), 'exactRemovedGoalIds': [],
         'netStrictGain': 1, 'newScientificClosures': 1, 'restoredBindingOnlyClosures': 0,
         'chemistryStrictUnchanged': new['chemie']['strictComplete'],
         'mathAndPhysicsStrictSetsBytecontentUnchanged': True, 'blockingIssueCount': 0,
         'humanApprovalOrTrialClaimed': False}
with (D / 'exact-current-strict-plus-one-delta.actual.json').open('x') as f:
    json.dump(delta, f, indent=2)
    f.write('\n')
print(json.dumps(delta), flush=True)
