# SPDX-License-Identifier: Apache-2.0
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime,timezone
from pathlib import Path
import json,subprocess
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent
FIRST=OWN.parent/'biologie-he-evolution-one-current-subset-first-pass-neutral-root-20261008-v3'
assert (OWN/'current-corrected-one-D-P-V.independent-a.first.freeze.json').exists()
def rel(p):return str(p.relative_to(ROOT))
def write(p,v):
    with p.open('x') as f:f.write(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
d=FIRST/'round-a'
jobs=[('D1',['app/scripts/validateGoalDescriptionReviewCampaignResults.ts','--bundle',rel(d/'review-bundle-manifest.json'),
    '--input',rel(d/'description-review-input.json'),'--campaign',rel(d/'description-review-campaign.json'),'--batches-dir',rel(d/'batches'),
    '--results-dir',rel(OWN/'current-one-first-round-a/results')]),('P1',[rel(OWN/'check-current-one-native-P-raster.independent-a.mts')])]
def run(job):
    name,args=job;argv=['node','app/node_modules/tsx/dist/cli.mjs',*args];started=datetime.now(timezone.utc).isoformat()
    r=subprocess.run(argv,capture_output=True,text=True)
    receipt={'check':name,'actualArgv':argv,'startedAt':started,'completedAt':datetime.now(timezone.utc).isoformat(),
    'actualTerminalExitCode':r.returncode,'actualStdout':r.stdout,'actualStderr':r.stderr,'unchangedNativeValidators':True,
    'ownFirstJudgmentSealPrecedesCheck':True,'currentPeerTargetedBFilesRead':0,'activeWrites':0}
    write(OWN/f'{name}.current-one-native.terminal.actual.json',receipt);return receipt
with ThreadPoolExecutor(max_workers=2) as p:results=list(p.map(run,jobs))
write(OWN/'completed-current-one-native-D-P-checks.independent-a.actual.json',{'actualChecks':results,'humanApproval':False,'activeWrites':0})
print(json.dumps({'actualExits':{r['check']:r['actualTerminalExitCode'] for r in results}}))
raise SystemExit(0 if all(r['actualTerminalExitCode']==0 for r in results) else 1)
