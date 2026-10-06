#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import argparse,datetime,hashlib,json,shutil,subprocess
OWN=Path(__file__).resolve().parent;ROOT=OWN.parents[6];REL=OWN.relative_to(ROOT)
ISO=ROOT/'tmp/chemie-q1-six-source-operator-native-isolated-20261005-v1'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p,j):p.write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n')
assert (OWN/'current104-physical-author-shadow.actual.receipt.json').exists()
for name in ['bind-own-author-semantic-kind.mts','positive-evidence.candidates.json']:
 shutil.copy2(OWN/name,ISO/REL/name)
commands=[
 ('author-semantic-kind-bind',['app/node_modules/.bin/tsx',str(REL/'bind-own-author-semantic-kind.mts')]),
 ('author-actual-qa-inventory-sync',['app/node_modules/.bin/tsx','app/scripts/generateGoalVisualizationQaLedgers.ts','--subject=chemie']),
 ('author-actual-qa-inventory-check',['app/node_modules/.bin/tsx','app/scripts/generateGoalVisualizationQaLedgers.ts','--subject=chemie','--check']),
 ('author-current-source-atlas-generate',['app/node_modules/.bin/tsx','app/scripts/buildGoalBookSourceAtlasInputs.ts','--config','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json']),
 ('author-current-source-atlas-check',['app/node_modules/.bin/tsx','app/scripts/buildGoalBookSourceAtlasInputs.ts','--config','app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json','--check']),
 ('author-p-seven-materialize',['app/node_modules/.bin/tsx','app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',str(REL/'positive-evidence.config.json'),'--candidates',str(REL/'positive-evidence.candidates.json'),'--write']),
 ('author-p-seven-validation',['app/node_modules/.bin/tsx','app/scripts/positiveGoalEvidenceReview.ts',f'--config={REL}/positive-evidence.config.json','--mode=check']),
 ('author-current-d-eight-native-book-prepare',['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutBatch.ts','prepare','--config',str(REL/'batch.config.json')]),
 ('author-current-d-eight-native-book-check',['app/node_modules/.bin/tsx','app/scripts/materializeGoalDescriptionRolloutBatch.ts','check','--config',str(REL/'batch.config.json')])]
parser=argparse.ArgumentParser();parser.add_argument('--from-step',type=int,default=0);parser.add_argument('--attempt',default='1');parser.add_argument('--only-steps');opts=parser.parse_args()
receipt_file=OWN/f'native-author-preparation.attempt-{opts.attempt}.actual.receipt.json'
receipts=[]
chosen=[commands[int(n)] for n in opts.only_steps.split(',')] if opts.only_steps else commands[opts.from_step:]
for name,args in chosen:
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();p=subprocess.run(args,cwd=ISO,capture_output=True,text=True)
 out,err=OWN/(name+f'.attempt-{opts.attempt}.stdout.txt'),OWN/(name+f'.attempt-{opts.attempt}.stderr.txt');assert not out.exists() and not err.exists();out.write_text(p.stdout);err.write_text(p.stderr)
 receipt={'name':name,'args':args,'cwd':str(ISO),'startedAtUTC':start,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':p.returncode,'stdoutPath':str(out.relative_to(ROOT)),'stdoutSHA256':sha(out),'stderrPath':str(err.relative_to(ROOT)),'stderrSHA256':sha(err),'scriptSHA256':sha(ISO/args[1]),'independentScientificApproval':False}
 receipts.append(receipt);dump(receipt_file,{'status':'running' if p.returncode==0 else 'failed_closed','commands':receipts,'authorCandidateOnly':True,'currentStrictNetIncrease':0,'humanApproval':False,'humanTrial':False,'activeWrites':0})
 print(json.dumps({'command':name,'exitCode':p.returncode,'stdout':p.stdout[:800],'stderr':p.stderr[:1800]}),flush=True)
 if p.returncode!=0:raise SystemExit(p.returncode)
finalrel=Path(json.loads((OWN/'batch.config.json').read_text())['outputDirectory']); finalname=finalrel.name
model=json.loads((ISO/finalrel/'bundle/book-model.json').read_text())
assert len(model['pages'])==8
assert all(p['visualization']['approvedForPublication'] is False for p in model['pages'] if p['goalId']!='70b34ae7-4481-590c-9a02-516464750832')
prows=[json.loads(v) for v in (ISO/REL/'positive-evidence.validation-only.review.jsonl').read_text().splitlines()]
assert len(prows)==7 and all(v['status']=='needs_human_review' and v['reviewAuthority']=='ai_candidate' and v['evidenceLevel']=='E1' and v['maximumClaimScope']=='G1' for v in prows)
for rd in ['round-a','round-b']:assert not list((ISO/finalrel/rd/'results').iterdir())
shutil.copytree(ISO/finalrel,OWN/finalname)
for name in ['positive-evidence.validation-only.review.jsonl','author-semantic-kind-bindings.actual.receipt.json','prospective-full-base.book-model.json']:
 shutil.copy2(ISO/REL/name,OWN/name)
dump(receipt_file,{'status':'PASS_native_unreviewed_future_author_candidate_only','commands':receipts,'earlierPassesAndFailedAttemptPreservedAt':str(REL/'native-author-preparation.attempt-1.actual.receipt.json'),'bookDigest':model['digest'],'goalPages':8,'prospectiveAtomic':377,'sourceSupportedAtlasAtomic':359,'positiveProfilesNeedsHuman':7,'independentDResultsEmpty':True,'currentStrictNetIncrease':0,'humanApproval':False,'humanTrial':False,'activeWrites':0})
print('Native future author D8/P7 ready; independent source/D/P/V/A/M pending; strict gain0; active writes0')
