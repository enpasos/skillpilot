# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import datetime,hashlib,json,shutil,subprocess,time,sys
R=Path.cwd();O=Path(__file__).resolve().parents[1]
f=json.loads((O/'INPUTS.final-P5-A5-M2-V2-before-targeted-stock-checks.json').read_text());h=json.loads((R/f['stockHostPlan']['path']).read_text());H=R/h['executionHost'];C=O/'checks';C.mkdir(exist_ok=True)
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def load(p):return json.loads(p.read_text())
receipts=[]
def run(label,args):
 out=C/(label+'.stdout.txt');err=C/(label+'.stderr.txt');receipt=C/(label+'.receipt.json');assert not out.exists() and not err.exists() and not receipt.exists()
 t=time.monotonic();started=datetime.datetime.now(datetime.timezone.utc).isoformat();p=subprocess.run(args,cwd=R,capture_output=True);out.write_bytes(p.stdout);err.write_bytes(p.stderr)
 receipt.write_text(json.dumps({'argv':args,'cwd':'.','startedAtUTC':started,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':p.returncode,'stdout':ref(out),'stderr':ref(err),'actualInvocation':1},ensure_ascii=False,indent=2)+'\n');receipts.append(ref(receipt));print(json.dumps({'action':label,'exitCode':p.returncode,'stdoutSummary':p.stdout.decode().splitlines()[:18],'stderr':p.stderr.decode()}),flush=True)
 if p.returncode:raise SystemExit('Ein konkreter Fehler; Receipt bleibt erhalten, kein automatischer Wiederholungsversuch.')
tsx=str(H/'app/node_modules/tsx/dist/cli.mjs')
if '--resume-after-exact-M2-card-scope' in sys.argv:
 fix=load(O/'checks/CORRECTION.strict-M2-card-scope-five-exact-original-review-keys.json');f['M2Config']=fix['correctedConfig']
elif '--resume-after-closed-P5-id' in sys.argv:
 fix=load(O/'checks/CORRECTION.closed-positive-config-lowercase-technical-review-id.json');f['P5Config']=fix['correctedConfig']
 run('05a-P5-actual-closed-schema-preflight',['node',tsx,str(O/'scripts/preflight_closed_P5_schema_actual.mts'),str(O)])
 run('05b-P5-stock-check-valid-lowercase-id',['node',tsx,str(H/'app/scripts/positiveGoalEvidenceReview.ts'),'--config='+f['P5Config']['path'],'--mode=check'])
else:
 run('01b-P5-FPs-actual-positive-criteria-address',['node',tsx,str(O/'scripts/complete_P5_FPs_with_actual_positive_criteria_address.mts'),str(O)])
 gen=str(H/'app/scripts/generateGoalVisualizationQaLedgers.ts')
 run('02-QA443-generation',['node',tsx,gen,'--subject=chemie'])
 out=R/h['pendingFinalQAPath'];assert not out.exists();shutil.copyfile(H/h['normalQAPath'],out)
 run('03-QA443-freshness',['node',tsx,gen,'--subject=chemie','--check'])
 run('04-QA443-current-approval-coverage',['node',tsx,str(H/'app/scripts/checkGoalVisualizationQaApprovalCoverage.ts'),'--subject=chemie'])
 run('05-P5-stock-check',['node',tsx,str(H/'app/scripts/positiveGoalEvidenceReview.ts'),'--config='+f['P5Config']['path'],'--mode=check'])
if '--resume-after-exact-M2-card-scope' not in sys.argv:
 run('06-A5-stock-write-FPs',['node',tsx,str(H/'app/scripts/semanticAtomicityReview.ts'),'--config='+f['A5Config']['path'],'--write-fingerprints'])
 run('07-A5-stock-check',['node',tsx,str(H/'app/scripts/semanticAtomicityReview.ts'),'--config='+f['A5Config']['path'],'--mode=check'])
 run('08-M2-stock-write-FPs',['node',tsx,str(H/'app/scripts/memoryCardReview.ts'),'--config='+f['M2Config']['path'],'--write-fingerprints'])
mem=load(O/'inputs/M2.exact-original-decisions-and-explicit-local-text-deltas.no-new-memory-science.json');mcfg=load(R/f['M2Config']['path']);workcards=R/mcfg['cardReviewPath'];originalcards=R/mem['originalCardsReview']['path']
if '--resume-after-exact-M2-card-scope' not in sys.argv:
 assert [json.loads(l) for l in workcards.read_text().splitlines()]==[json.loads(l) for l in originalcards.read_text().splitlines()];workcards.write_bytes(originalcards.read_bytes())
run('09b-M2-stock-check-exact-current-Q2-card-scope' if '--resume-after-exact-M2-card-scope' in sys.argv else '09-M2-stock-check',['node',tsx,str(H/'app/scripts/memoryCardReview.ts'),'--config='+f['M2Config']['path'],'--mode=check'])
run('10-V2-stock-current-asset-predicate',['node',tsx,str(O/'scripts/check_exact_two_current_visual_contexts.mts'),str(O)])
m2={r['goalId']:r for r in [json.loads(l) for l in (R/mcfg['reviewPath']).read_text().splitlines()]};original=R/mem['originalWholeRecordFile']['path'];lines=original.read_text().splitlines();newlines=[]
for line in lines:
 d=json.loads(line)
 if d['goalId'] in m2:
  new=m2[d['goalId']];assert {k:v for k,v in d.items() if k!='fingerprint'}=={k:v for k,v in new.items() if k!='fingerprint'};newlines.append(json.dumps(new,ensure_ascii=False,separators=(',',':')))
 else:newlines.append(line)
assert sum(a==b for a,b in zip(lines,newlines))==424
merged=O/'memory/M426.original424-whole-lines-plus-two-text-FP-bindings.jsonl';assert not merged.exists();merged.write_text('\n'.join(newlines)+'\n');fullcfg=load(R/mem['originalConfig']['path']);fullcfg.update(reviewPath=merged.relative_to(R).as_posix(),cardReviewPath=mem['originalCardsReview']['path'],reportPath=(O/'memory/M426.report.not-written.md').relative_to(R).as_posix());(O/'config/M426.only-two-text-FP-bindings.integration-only.config.json').write_text(json.dumps(fullcfg,ensure_ascii=False,indent=2)+'\n')
(C/'RUN.targeted-P5-A5-M2-V2.once.actual.json').write_text(json.dumps({'schemaVersion':1,'actualActions':receipts,'allPassed':True,'P5':5,'A5':5,'M2':2,'V2':2,'QA443':443,'other424MemoryLinesByteExact':True,'all75CardReviewBytesExact':True,'normalRunClaims':0,'newScienceVotes':0,'NativeRenders':0,'finalNativeStillWaitingForNeighborP2':True},ensure_ascii=False,indent=2)+'\n')
