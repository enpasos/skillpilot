from pathlib import Path
from datetime import datetime,timezone
import json,subprocess,sys,hashlib
B=Path(__file__).resolve().parent;ROOT=B.parents[6];A=B.parent/'chemie-four-final-images-native-d17-plus-c441-p18-technical-author-20261007-v1';N=A/'native-root'
scope=sys.argv[1];assert scope in ['seventeen','c441','p-c441']
if scope=='p-c441':
 command=[str(ROOT/'app/node_modules/.bin/tsx'),str(B/'native-p-root/app/scripts/positiveGoalEvidenceReview.ts'),'--config=configs/c441.current-image.config.json','--mode=check']
else:
 source=N/f'native-d-{scope}/round-b';campaign=json.loads((source/'description-review-campaign.json').read_text());batch=campaign['batches'][0]['batchId'];out=B/f'native-d-{scope}/results'
 command=[str(ROOT/'app/node_modules/.bin/tsx'),str(ROOT/'app/scripts/validateGoalDescriptionReviewCampaign.ts'),'--bundle',str(source/'review-bundle-manifest.json'),'--input',str(source/'description-review-input.json'),'--campaign',str(source/'description-review-campaign.json'),'--run',str(out/(batch+'.run.json')),'--batch-input',str(source/'batches'/(batch+'.input.jsonl')),'--records',str(out/(batch+'.records.jsonl'))]
started=datetime.now(timezone.utc).isoformat();run=subprocess.run(command,cwd=ROOT,capture_output=True,text=True);q=B/'native-checks';q.mkdir(exist_ok=True)
for suffix,value in [('stdout.txt',run.stdout),('stderr.txt',run.stderr)]:
 p=q/f'{scope}.{suffix}';assert not p.exists();p.write_text(value)
receipt={'schemaVersion':1,'scope':scope,'command':command,'cwd':str(ROOT),'startedAt':started,'completedAt':datetime.now(timezone.utc).isoformat(),'exitCode':run.returncode,'stdout':run.stdout,'stderr':run.stderr,'targetedOnly':True,'activeWrites':False,'sourceOrToolOrSchemaEdits':False,'humanApproval':False,'humanTrial':False,'strictGain':0}
p=q/f'{scope}.native-validation.actual.json';assert not p.exists();p.write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2));sys.exit(run.returncode)
