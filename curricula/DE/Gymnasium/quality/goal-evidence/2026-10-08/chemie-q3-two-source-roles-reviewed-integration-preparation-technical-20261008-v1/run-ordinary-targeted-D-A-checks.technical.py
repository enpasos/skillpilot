# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from datetime import datetime,timezone
import subprocess,json,concurrent.futures
R=Path.cwd();D=Path(__file__).resolve().parent;C=D/'checks';C.mkdir(exist_ok=True)
tasks=[]
for side in ['a','b']:
 p=D/'native-d-two-current'/('round-'+side)
 tasks.append(('D2-ordinary-round-'+side,['app/node_modules/.bin/tsx','app/scripts/validateGoalDescriptionReviewCampaignResults.ts','--bundle',str(p/'review-bundle-manifest.json'),'--input',str(p/'description-review-input.json'),'--campaign',str(p/'description-review-campaign.json'),'--batches-dir',str(p/'batches'),'--results-dir',str(p/'results')]))
tasks.append(('A2-ordinary-current-whole-two',['app/node_modules/.bin/tsx','app/scripts/semanticAtomicityReview.ts','--config='+str(D/'atomicity/current-two.inactive.config.json'),'--mode=check']))
def run(task):
 name,cmd=task
 for suffix in ['stdout.actual.txt','stderr.actual.txt','terminal.actual.json']:assert not(C/(name+'.'+suffix)).exists()
 start=datetime.now(timezone.utc).isoformat();p=subprocess.run(cmd,cwd=R,capture_output=True,text=True)
 (C/(name+'.stdout.actual.txt')).write_text(p.stdout);(C/(name+'.stderr.actual.txt')).write_text(p.stderr)
 (C/(name+'.terminal.actual.json')).write_text(json.dumps({'command':cmd,'startedAt':start,'finishedAt':datetime.now(timezone.utc).isoformat(),'actualExitCode':p.returncode,'activeWrites':0,'humanApproval':False},ensure_ascii=False,indent=2)+'\n')
 return {'check':name,'actualExitCode':p.returncode,'stderr':p.stderr[-1000:]}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:results=list(pool.map(run,tasks))
print(json.dumps(results));assert all(r['actualExitCode']==0 for r in results)
