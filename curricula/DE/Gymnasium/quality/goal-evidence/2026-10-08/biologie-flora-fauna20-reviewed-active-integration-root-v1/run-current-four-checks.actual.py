# SPDX-License-Identifier: Apache-2.0
"""Capture real standard checks after the guarded integration, without overwriting history."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json
import subprocess
import time

D = Path(__file__).resolve().parent
R = D.parents[6]
P = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-flora-fauna20-reviewed-integration-preparation-technical-20261008-v1/'
jobs = {
    'active-P20': ['node', 'app/node_modules/tsx/dist/cli.mjs', 'app/scripts/positiveGoalEvidenceReview.ts', '--config=' + P + 'positive/current20.future-active.config.json', '--mode=check'],
    'active-D20': ['node', 'app/node_modules/tsx/dist/cli.mjs', P + 'check-current-reviewed-D20-original19-targeted14.technical.mts', '--active'],
    'active-assets': ['npm', '--prefix', 'app', 'run', 'check:goal-visualization-assets'],
    'active-after-flora20-central': ['node', 'app/node_modules/tsx/dist/cli.mjs', 'app/scripts/reportDeepUnderstandingRollout.ts', '--mode=check', '--format=json'],
}

def run(item):
    name, argv = item
    stdout = D / (name + '.actual.json' if name.endswith('central') else name + '.stdout.actual.txt')
    stderr = D / (name + '.stderr.actual.txt')
    receipt = D / (name + '.exit.actual.json')
    for path in [stdout, stderr, receipt]:
        assert not path.exists(), 'Preserve the previous actual check: ' + str(path)
    start = time.time()
    with stdout.open('x') as out, stderr.open('x') as err:
        result = subprocess.run(argv, cwd=R, stdout=out, stderr=err)
    actual = {'argv': argv, 'exitCode': result.returncode, 'elapsedSeconds': round(time.time() - start, 3), 'stdout': str(stdout.relative_to(R)), 'stderr': str(stderr.relative_to(R)), 'humanApproval': False}
    with receipt.open('x') as file:
        file.write(json.dumps(actual, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'name': name, **actual}), flush=True)
    return result.returncode

with ThreadPoolExecutor(max_workers=4) as pool:
    exits = list(pool.map(run, jobs.items()))
assert all(code == 0 for code in exits), exits
