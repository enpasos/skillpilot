# SPDX-License-Identifier: Apache-2.0
"""Run actual unchanged native APIs after genuine own ten-goal first seal."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
import json
import subprocess

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-he7-ten-final-raster-native-author-root-20261008-v1'
assert (OWN / 'first-current-ten-D-P-V.independent-a.exact.freeze.json').exists()
def rel(p): return str(p.relative_to(ROOT))
def write(p, value):
    with p.open('x') as stream: stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
d = AUTHOR / 'native-raster-candidate/ten/round-a'
jobs = [
    ('D10', ['app/scripts/validateGoalDescriptionReviewCampaignResults.ts', '--bundle', rel(d / 'review-bundle-manifest.json'),
        '--input', rel(d / 'description-review-input.json'), '--campaign', rel(d / 'description-review-campaign.json'),
        '--batches-dir', rel(d / 'batches'), '--results-dir', rel(OWN / 'round-a/results')]),
    ('P10', [rel(OWN / 'check-exact-inactive-P10.independent-a.mts')]),
]
def run(job):
    name, args = job
    argv = ['node', 'app/node_modules/tsx/dist/cli.mjs', *args]
    started = datetime.now(timezone.utc).isoformat()
    result = subprocess.run(argv, capture_output=True, text=True)
    value = {'check': name, 'actualArgv': argv, 'startedAt': started, 'completedAt': datetime.now(timezone.utc).isoformat(),
        'actualTerminalExitCode': result.returncode, 'actualStdout': result.stdout, 'actualStderr': result.stderr,
        'unchangedNativeValidators': True, 'peerFinalBReadBeforeSeal': False, 'activeWrites': 0, 'strictGainClaimed': 0}
    write(OWN / f'{name}.native.terminal.actual.json', value)
    return value
with ThreadPoolExecutor(max_workers=2) as pool: results = list(pool.map(run, jobs))
write(OWN / 'completed-ten-own-D-P-native-checks.independent-a.actual.json', {
    'actualChecks': results, 'genuineOwnFirstScientificSealPrecedesChecks': True, 'peerFinalBFilesRead': 0,
    'realLearnerEvidence': False, 'humanApproval': False, 'humanTrial': False, 'activeWrites': 0, 'strictGainClaimed': 0})
print(json.dumps({'actualExits': {r['check']: r['actualTerminalExitCode'] for r in results}, 'activeWrites': 0}))
raise SystemExit(0 if all(r['actualTerminalExitCode'] == 0 for r in results) else 1)
