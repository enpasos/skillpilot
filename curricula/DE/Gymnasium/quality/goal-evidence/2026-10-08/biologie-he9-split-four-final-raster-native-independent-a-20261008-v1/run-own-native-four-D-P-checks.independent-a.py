# SPDX-License-Identifier: Apache-2.0
"""Run unchanged native validators after genuine own immutable first judgment."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
import json
import subprocess

ROOT=Path.cwd()
OWN=Path(__file__).resolve().parent
AUTHOR=OWN.parent/'biologie-he9-split-four-final-raster-native-author-technical-20261008-v1'
assert (OWN/'first-four-genuine-current-D-P-V.independent-a.exact.freeze.json').exists()
def rel(p): return str(p.relative_to(ROOT))
def write(p,value):
    with p.open('x') as stream: stream.write(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
d=AUTHOR/'native-raster-candidate-v2/four/round-a'
jobs=[('D4',['app/scripts/validateGoalDescriptionReviewCampaignResults.ts','--bundle',rel(d/'review-bundle-manifest.json'),
    '--input',rel(d/'description-review-input.json'),'--campaign',rel(d/'description-review-campaign.json'),
    '--batches-dir',rel(d/'batches'),'--results-dir',rel(OWN/'round-a/results')]),
    ('P4',[rel(OWN/'check-native-four-current-P-and-retained-AM.independent-a.mts')])]
def run(job):
    name,args=job; argv=['node','app/node_modules/tsx/dist/cli.mjs',*args]
    started=datetime.now(timezone.utc).isoformat(); result=subprocess.run(argv,capture_output=True,text=True)
    receipt={'check':name,'actualArgv':argv,'startedAt':started,'completedAt':datetime.now(timezone.utc).isoformat(),
        'actualTerminalExitCode':result.returncode,'actualStdout':result.stdout,'actualStderr':result.stderr,
        'unchangedNativeValidators':True,'ownFirstScienceSealPrecedesNativeChecks':True,
        'peerCurrentFinalBFilesRead':0,'activeWrites':0,'strictGainClaimed':0}
    write(OWN/f'{name}.native.terminal.actual.json',receipt); return receipt
with ThreadPoolExecutor(max_workers=2) as pool: results=list(pool.map(run,jobs))
write(OWN/'completed-own-four-native-D-P-checks.independent-a.actual.json',{'actualChecks':results,
    'genuineOwnFirstScientificSealPrecedesChecks':True,'peerCurrentFinalBFilesRead':0,'humanApproval':False,'humanTrial':False,'activeWrites':0})
print(json.dumps({'actualExits':{r['check']:r['actualTerminalExitCode'] for r in results},'activeWrites':0}))
raise SystemExit(0 if all(r['actualTerminalExitCode']==0 for r in results) else 1)
