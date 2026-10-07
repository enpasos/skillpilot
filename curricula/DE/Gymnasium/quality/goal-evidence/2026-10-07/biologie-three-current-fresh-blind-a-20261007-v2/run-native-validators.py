from pathlib import Path
import subprocess,json,datetime,hashlib
from concurrent.futures import ThreadPoolExecutor
root=Path.cwd();p=root/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-three-source-485-ENG-EKG-and-e70-BW-author-20261007-v2';q=root/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-three-current-fresh-blind-a-20261007-v2';c=q/'native-round-a';meta=json.loads((c/'description-review-campaign.json').read_text());bid=meta['batches'][0]['batchId'];runner=str(root/'app/node_modules/.bin/tsx');scriptdir=p/'native-isolated-repository/app/scripts'
base=['--bundle',str(c/'review-bundle-manifest.json'),'--input',str(c/'description-review-input.json'),'--campaign',str(c/'description-review-campaign.json')]
commands=[('native-batch',[runner,str(scriptdir/'validateGoalDescriptionReviewCampaign.ts'),*base,'--run',str(c/'results'/f'{bid}.run.json'),'--batch-input',str(c/'batches'/f'{bid}.input.jsonl'),'--records',str(c/'results'/f'{bid}.records.jsonl')]),('native-campaign-results',[runner,str(scriptdir/'validateGoalDescriptionReviewCampaignResults.ts'),*base,'--batches-dir',str(c/'batches'),'--results-dir',str(c/'results')])]
def run(item):
 name,args=item;start=datetime.datetime.now(datetime.timezone.utc).isoformat();r=subprocess.run(args,cwd=root,text=True,capture_output=True)
 record={'check':name,'startedAt':start,'completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'commandArguments':args,'exitCode':r.returncode,'stdout':r.stdout,'stderr':r.stderr,'actualNativeTerminal':True,'helperSha256':hashlib.sha256(Path(args[1]).read_bytes()).hexdigest(),'helperEqualsLiveUnchangedNative':Path(args[1]).read_bytes()==(root/'app/scripts'/Path(args[1]).name).read_bytes()};(q/(name+'.terminal-receipt.json')).write_text(json.dumps(record,indent=2)+'\n');print(name,'exit',r.returncode,r.stdout.strip(),r.stderr.strip());return record
with ThreadPoolExecutor(max_workers=2) as pool:receipts=list(pool.map(run,commands))
(q/'native-terminal-receipts.json').write_text(json.dumps({'receipts':receipts,'bothPassed':all(r['exitCode']==0 for r in receipts),'retainsActualFailures':True},indent=2)+'\n')
raise SystemExit(0 if all(r['exitCode']==0 for r in receipts) else 1)
