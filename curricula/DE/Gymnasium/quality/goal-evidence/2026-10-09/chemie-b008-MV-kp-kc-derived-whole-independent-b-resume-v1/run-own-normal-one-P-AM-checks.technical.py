# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,subprocess,datetime
B=Path(__file__).resolve().parent.relative_to(Path.cwd())
def read(p):return json.loads(p.read_text())
def write(p,x):assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
# The closed positive-review contract requires lowercase review IDs. Preserve the initially prepared metadata and create a precise successor before first normal CLI execution.
cfg=read(B/'one-current-text-only-P.independent-b.config.json');cs=read(B/'one-current-text-only-P.independent-b.candidate-set.json');row=json.loads((B/'one-current-text-only-P.independent-b.review.jsonl').read_text())
id=cfg['reviewId'].lower();assert id!=cfg['reviewId'];cfg['reviewId']=id;cs['reviewId']=id;row['reviewId']=id;cfg['reviewPath']=str(B/'one-current-text-only-P.lowercase-current.independent-b.review.jsonl')
write(B/'one-current-text-only-P.lowercase-current.independent-b.config.json',cfg);write(B/'one-current-text-only-P.lowercase-current.independent-b.candidate-set.json',cs);(B/'one-current-text-only-P.lowercase-current.independent-b.review.jsonl').write_text(json.dumps(row,ensure_ascii=False)+'\n')
write(B/'checks/positive-review-ID-closed-schema-normalisation.before-first-cli.actual.json',{'initialReviewId':'chemie-current-one-MV-KpKc-independent-b-20261009-v1','currentReviewId':id,'normalPositiveCLIAttemptOnInitialMetadata':False,'onlyReviewIdAndOutputRoutingChanged':True,'wholeProfileAndScientificFirstUnchanged':True,'qualityRuleChanged':False,'activeWrites':0})
commands=[('P','app/scripts/positiveGoalEvidenceReview.ts',B/'one-current-text-only-P.lowercase-current.independent-b.config.json'),('A','app/scripts/semanticAtomicityReview.ts',B/'one-current-A.independent-b.config.json'),('M','app/scripts/memoryCardReview.ts',B/'one-current-M.independent-b.config.json')];results=[]
for role,script,config in commands:
 argv=['app/node_modules/.bin/tsx',script,'--mode=check','--config='+str(config)];p=subprocess.run(argv,capture_output=True,text=True,timeout=90);stdout=B/'checks'/('ordinary-own-'+role+'.stdout.actual.txt');stderr=B/'checks'/('ordinary-own-'+role+'.stderr.actual.txt');stdout.write_text(p.stdout);stderr.write_text(p.stderr);r={'argv':argv,'actualExitCode':p.returncode,'stdoutPath':str(stdout),'stderrPath':str(stderr),'startedByIndependentReviewer':True};write(B/'checks'/('ordinary-own-'+role+'.terminal.actual.json'),r);results.append(r)
write(B/'checks/ordinary-own-one-P-AM-all.actual.json',{'actualCommands':results,'allActualExitCodes':[r['actualExitCode'] for r in results],'activeWrites':0,'sourceCourseFullAtlasApproval':False,'currentNativeOrRasterApproval':False})
print(json.dumps({'actualExitCodes':[r['actualExitCode'] for r in results],'normalAffectedScopeGoals':1,'activeWrites':0}));assert all(r['actualExitCode']==0 for r in results)
