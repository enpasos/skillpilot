# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import datetime, hashlib, json, subprocess, time
R=Path.cwd(); O=Path(__file__).resolve().parents[1]; C=O/'checks'
def load(p): return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,v):
 assert not p.exists(),p
 p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
f=load(O/'INPUTS.final-P5-A5-M2-V2-before-targeted-stock-checks.json');h=load(R/f['stockHostPlan']['path']);H=R/h['executionHost'];tsx=str(H/'app/node_modules/tsx/dist/cli.mjs')
mem=load(O/'inputs/M2.exact-original-decisions-and-explicit-local-text-deltas.no-new-memory-science.json');original=R/mem['originalWholeRecordFile']['path'];original_lines=original.read_text().splitlines();original_by_id={json.loads(l)['goalId']:l for l in original_lines};m2p=O/'memory/M2.exact-original-decisions.before-stock-FP.jsonl';m2lines=m2p.read_text().splitlines();m2={json.loads(l)['goalId']:json.loads(l) for l in m2lines};assert len(m2)==2
cards=O/'memory/cards5.Q2-natural-exact-original-lines.M2-scope-only.jsonl';cardrows=[json.loads(l) for l in cards.read_text().splitlines()];originids={g for c in cardrows for g in c['originGoalIds']};unchanged=sorted(originids-set(m2));assert unchanged==['197bc2c5-835e-59e7-9263-5684e89799cc','5c8f0bbb-103a-579f-87fc-c997afe4fd18','e9d34f34-2a43-5cc7-bcca-1d08e057531d']
for gid in unchanged:
 d=json.loads(original_by_id[gid]);assert d['status']=='memory_required';assert d['deckIds']==['de_gymnasium_chemistry_natural_q2'];assert d['memoryGoalIds']==['31148286-b8db-57a7-8da2-2e0479240a2c','0f0c6c98-13dc-5347-ac95-5b50c9c17bb6']
review=O/'memory/M2.current-two-FPs-plus-three-byte-exact-card-origin-records.jsonl';assert not review.exists();review.write_text('\n'.join(m2lines+[original_by_id[g] for g in unchanged])+'\n');cfg=load(O/'config/M2.original-decisions-current-text-binding.exact-Q2-card-scope.config.json');cfg['reviewPath']=review.relative_to(R).as_posix();cfg['scope']['leafGoalIds']+=unchanged;cfg['scope']['label']='Zwei dokumentierte Textdelta-FP-Bindungen mit drei bytegleichen ursprünglichen Karten-Herkunftsentscheidungen; fünf unveränderte Q2-Karten, zehn ursprüngliche Sichtbarkeitskontexte';cp=O/'config/M2.current-two-FPs-with-exact-card-origin-closure.config.json';write(cp,cfg)
write(C/'CORRECTION.strict-memory-card-origin-three-original-record-closure.json',{'schemaVersion':1,'actualContract':'memoryCardReview.ts validateCardRecordShape checks every kept card origin against currentGoalRecordsById in the configured review scope','failedCheckPreserved':ref(C/'09b-M2-stock-check-exact-current-Q2-card-scope.receipt.json'),'correctedConfig':ref(cp),'changedMemoryBindings':2,'unchangedOriginalOriginRecordIds':unchanged,'unchangedOriginalOriginLinesByteExact':True,'uniqueOriginalCards':5,'primaryLanguageOccurrences':10,'newMemoryVotes':0,'sourceOriginal426':mem['originalWholeRecordFile'],'sourceOriginalCards75':mem['originalCardsReview']})
receipts=[]
def run(label,args):
 out=C/(label+'.stdout.txt');err=C/(label+'.stderr.txt');p=C/(label+'.receipt.json');assert not out.exists() and not err.exists() and not p.exists();started=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic();r=subprocess.run(args,cwd=R,capture_output=True);out.write_bytes(r.stdout);err.write_bytes(r.stderr);write(p,{'argv':args,'cwd':'.','startedAtUTC':started,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':r.returncode,'stdout':ref(out),'stderr':ref(err),'actualInvocation':1});receipts.append(ref(p));print(json.dumps({'action':label,'exitCode':r.returncode,'stdoutSummary':r.stdout.decode().splitlines()[:25],'stderr':r.stderr.decode()},ensure_ascii=False),flush=True)
 if r.returncode:raise SystemExit('Konkreter Fehler bleibt erhalten; kein automatischer Wiederholungsversuch.')
run('09c-M2-stock-check-exact-original-card-origin-closure',['node',tsx,str(H/'app/scripts/memoryCardReview.ts'),'--config='+cp.relative_to(R).as_posix(),'--mode=check'])
run('10-V2-stock-current-asset-predicate',['node',tsx,str(O/'scripts/check_exact_two_current_visual_contexts.mts'),str(O)])
newlines=[]
for line in original_lines:
 d=json.loads(line)
 if d['goalId'] in m2:
  new=m2[d['goalId']];assert {k:v for k,v in d.items() if k!='fingerprint'}=={k:v for k,v in new.items() if k!='fingerprint'};assert d['fingerprint']!=new['fingerprint'];newlines.append(json.dumps(new,ensure_ascii=False,separators=(',',':')))
 else:newlines.append(line)
assert len(newlines)==426 and sum(a==b for a,b in zip(original_lines,newlines))==424
merged=O/'memory/M426.original424-whole-lines-plus-two-text-FP-bindings.jsonl';assert not merged.exists();merged.write_text('\n'.join(newlines)+'\n');fullcfg=load(R/mem['originalConfig']['path']);fullcfg.update(reviewPath=merged.relative_to(R).as_posix(),cardReviewPath=mem['originalCardsReview']['path'],reportPath=(O/'memory/M426.report.not-written.md').relative_to(R).as_posix());write(O/'config/M426.only-two-text-FP-bindings.integration-only.config.json',fullcfg)
assert (O/'memory/cards75.original-whole-bytes.working-copy.jsonl').read_bytes()==(R/mem['originalCardsReview']['path']).read_bytes()
passed=['01b-P5-FPs-actual-positive-criteria-address','02-QA443-generation','03-QA443-freshness','04-QA443-current-approval-coverage','05a-P5-actual-closed-schema-preflight','05b-P5-stock-check-valid-lowercase-id','06-A5-stock-write-FPs','07-A5-stock-check','08-M2-stock-write-FPs','09c-M2-stock-check-exact-original-card-origin-closure','10-V2-stock-current-asset-predicate']
for label in passed:assert load(C/(label+'.receipt.json'))['exitCode']==0
write(C/'RUN.targeted-P5-A5-M2-V2.actual-completion.json',{'schemaVersion':1,'actualPassingActions':[ref(C/(x+'.receipt.json')) for x in passed],'allRequiredChecksPassed':True,'preservedEarlierFailureActions':[ref(C/(x+'.receipt.json')) for x in ['01-mechanical-semantic-and-P5-FPs','05-P5-stock-check','09-M2-stock-check','09b-M2-stock-check-exact-current-Q2-card-scope']],'P5':5,'A5':5,'M2':2,'unchangedMemoryOriginCheckSidecars':3,'V2':2,'QA443':443,'mergedM426':ref(merged),'other424MemoryLinesByteExact':True,'all75CardReviewBytesExact':True,'normalRunClaims':0,'newScienceVotes':0,'NativeRenders':0,'finalNativeStillWaitingForNeighborP2':True})
print(json.dumps({'completed':'P5/A5/M2/V2','allRequiredChecksPassed':True,'M2PlusUnchangedOriginClosure':5,'finalNativeStillWaitingForNeighborP2':True},ensure_ascii=False))
