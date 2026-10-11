from pathlib import Path
import subprocess,json,datetime,hashlib
R=Path(__file__).resolve().parent; ROOT=R.parents[6]
B=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-twelve-deferrals-native-one-and-eleven-reviewer-split-AUTHOR-INERT-v1/native/eleven-other-deferrals/round-b'
node=Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip()
campaign=json.loads((B/'description-review-campaign.json').read_text());batch=campaign['batches'][0]['batchId']
common=['--bundle',str(B/'review-bundle-manifest.json'),'--input',str(B/'description-review-input.json'),'--campaign',str(B/'description-review-campaign.json')]
calls=[('batch',ROOT/'app/scripts/validateGoalDescriptionReviewCampaign.ts',common+['--run',str(R/'results'/(batch+'.run.json')),'--batch-input',str(B/'batches'/(batch+'.input.jsonl')),'--records',str(R/'results'/(batch+'.records.jsonl'))]),('campaign-results',ROOT/'app/scripts/validateGoalDescriptionReviewCampaignResults.ts',common+['--batches-dir',str(B/'batches'),'--results-dir',str(R/'results')])]
for label,script,args in calls:
 cmd=[node,str(ROOT/'app/node_modules/tsx/dist/cli.mjs'),str(script),*args]
 started=datetime.datetime.now(datetime.timezone.utc).isoformat();p=subprocess.run(cmd,cwd=ROOT,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT);ended=datetime.datetime.now(datetime.timezone.utc).isoformat()
 out=R/(label+'.native-validation.raw.txt');assert not out.exists();out.write_text(p.stdout)
 rec=R/(label+'.actual-command-receipt.READONLY.json');assert not rec.exists();rec.write_text(json.dumps({'commandArgv':cmd,'cwd':str(ROOT),'startedAt':started,'completedAt':ended,'exitCode':p.returncode,'stdoutPath':str(out.relative_to(ROOT)),'stdoutSha256':hashlib.sha256(out.read_bytes()).hexdigest(),'scriptPath':str(script.relative_to(ROOT)),'scriptSha256':hashlib.sha256(script.read_bytes()).hexdigest(),'activeWrites':0},ensure_ascii=False,indent=2)+'\n')
 print(label,p.returncode,p.stdout.strip());assert p.returncode==0
