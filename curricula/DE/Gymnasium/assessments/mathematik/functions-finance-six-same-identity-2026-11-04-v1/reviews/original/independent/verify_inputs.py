"""Reviewer finite bindings, unchanged preparation and existing-exam reuse evidence."""
import json,hashlib,gzip
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path.cwd();OUT=Path(__file__).resolve().parent
B=ROOT/'tmp/approach-review-20261101/functions-finance-six-whole-forms-20261104-v1'
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def objsha(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
freeze=B/'author-freeze.json';assert sha(freeze)=='1323a248235b72619fc26cb36f700b554a176f7a0d2ea3dab519c18eb7037dcb'
bindings=[]
for r in read(freeze)['files']:
 p=B/r['path'];assert sha(p)==r['sha256'];assert p.stat().st_size==r['bytes']
 bindings.append({'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size})
packet=read(B/'whole-current-and-proposed-contracts.json');canonical=ROOT/packet['canonicalPath'];goals={g['id']:g for g in read(canonical)['goals']}
parents={g:[] for g in goals}
for g in goals.values():
 for c in g.get('contains',[]):parents[c].append(g['id'])
def closure(xs,fn):
 seen=set();todo=list(xs)
 while todo:
  x=todo.pop()
  if x in seen:continue
  seen.add(x);todo.extend(fn(x))
 return seen
forms=[];allprep=set()
for f in packet['forms']:
 before=f['wholeCurrentGoal'];after=f['wholeProposedGoal'];gid=before['id'];p=B/gid/'whole-contract.before-after.json'
 assert read(p)==f;assert before==goals[gid]
 assert sorted(k for k in set(before)|set(after) if before.get(k)!=after.get(k))==['examData','nodeKind']
 assert all(after[k]==v for k,v in before.items());assert after['nodeKind']=='exam'
 e=after['examData'];assert e['reviewStatus']=='draft';assert e['coveredGoalIds']==[gid]
 assert e==read(B/gid/'reviewed-execution-contract.json');assert e['scoring']['maxPoints']==20 and e['scoring']['passingPoints']==15 and sum(r['points'] for r in e['scoring']['steps'])==20
 for loc,suf in [('de',''),('en','En')]:
  task=(B/gid/f'task.{loc}.md').read_text();sol=(B/gid/f'solution.{loc}.md').read_text();rub=(B/gid/f'rubric.{loc}.md').read_text()
  assert e['taskContent'+suf]==task;assert e['solutionContent'+suf]==sol+'\n'+rub
  for s in e['scoring']['steps']:assert s['description'+suf] in rub
  assert not any(x in task+sol for x in ['.png','.xlsx','/assets/','tmp/','file://']),gid
 ctx=read(B/gid/'current-context.json');assert ctx['currentGoal']==before
 prep=closure(before['requires'],lambda x:goals[x].get('requires',[]));anc=closure(parents[gid],lambda x:parents[x])
 assert {g['id'] for g in ctx['requiresClosureObjects']}==prep
 assert {g['id'] for g in ctx['allContainsAncestorObjects']}==anc
 for g in ctx['requiresClosureObjects']+ctx['allContainsAncestorObjects']:assert g==goals[g['id']]
 inherited=[r for x in anc for r in goals[x].get('requires',[])];assert not inherited
 allprep|=prep
 forms.append({'goalId':gid,'contractPath':str(p.relative_to(ROOT)),'contractSha256':sha(p),'wholeCurrentObjectSha256':objsha(before),'wholeProposedObjectSha256':objsha(after),'directRequires':before['requires'],'transitivePreparationIds':sorted(prep),'transitivePreparationCount':len(prep),'containsAncestorIds':sorted(anc),'inheritedRequires':inherited,'wholeCurrentObjectAndAllPreparationExact':True,'originalFieldsUnchanged':True,'ownIdOnlyCoverage':True,'embeddedBilingualTextsAndScoringDescriptionsExact':True,'before':before,'after':after})
ledger=ROOT/'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json';lj=read(ledger);population={r['goalId'] for r in lj['decisions'] if r['semanticKind']=='curricularAtomic'};assert len(population)==807;assert all(f['goalId'] in population for f in forms)
# Examine actual existing full exam and exact frozen native rows, without new Native claims.
inspection=read(B/'d144-existing-exam-34-scope-inspection.json');exam=inspection['wholeCurrentExistingExam'];eid=exam['id'];gid='d144a855-9139-55c7-a801-e8b85dab5f01'
assert exam==goals[eid];assert len(exam['requires'])==8;assert gid in exam['requires'] and gid in exam['examData']['coveredGoalIds']
assert {g['id'] for g in inspection['wholeCurrentExamPreparationObjects']}==set(exam['requires'])
for g in inspection['wholeCurrentExamPreparationObjects']:assert g==goals[g['id']]
nativepath=ROOT/inspection['nativePath'];assert sha(nativepath)==inspection['nativeCompressedSha256']
native=json.load(gzip.open(nativepath,'rt'));assert len(native['scopes'])==161 and native['actualUnionCount']==46
affected=[r for r in native['scopes'] if gid in r['uncoveredEndpointGoalIds']];assert len(affected)==34
saved={r['scope']:r for r in inspection['scopes']};assert set(saved)=={r['scope'] for r in affected}
actual=[]
for r in affected:
 row={'scope':r['scope'],'personalCurriculumConfig':r['personalCurriculumConfig'],'compositionViewIds':r['compositionViewIds'],'examInTargets':eid in r['targetGoalIds'],'goalInTargets':gid in r['targetGoalIds'],'goalUncoveredEndpoint':gid in r['uncoveredEndpointGoalIds'],'examEffectiveDirectRequires':r['effectiveDirectPrerequisitesByContextGoalId'].get(eid),'examEligibility':r['allExistingProtectedEligibility'].get(eid),'examPreparationOutsideTargets':[x for x in exam['requires'] if x not in r['targetGoalIds']]}
 assert row==saved[r['scope']],r['scope'];actual.append(row)
assert all(not r['examInTargets'] and not r['examEligibility']['projectedVisible'] and not r['examEligibility']['isSelectedProtectedObligation'] for r in actual)
lk={'fdce0ced-46a0-594a-9b5d-d2dc18e5e473','1bdac3d8-6b6f-5e27-9c9e-9addf198aa99'}
gks=[r for r in actual if r['scope'].endswith('/GK') and lk<=set(r['examPreparationOutsideTargets'])];assert len(gks)==26
reuse=read(B/'reuse-canonical-inspection.json')
for hit in reuse['existingCoveredGoalHits']:assert hit['examData']==goals[hit['id']]['examData']
report={'status':'PASS_FINITE_INPUTS_PREPARATION_AND_EXISTING_REUSE_EVIDENCE','checkedAtUTC':datetime.now(timezone.utc).isoformat(),'reviewerAgent':'/root/astra_six_math_whole_forms','frozenEntryBindings':[{'path':str(freeze.relative_to(ROOT)),'sha256':sha(freeze)}],'frozenFiles':bindings,'frozenFileCount':len(bindings),'objectHashConvention':'SHA256 UTF8 JSON ensure_ascii=False sort_keys=True separators=(comma,colon)','canonicalAtVerification':{'path':str(canonical.relative_to(ROOT)),'sha256':sha(canonical)},'globalCanonicalHashIsNotAnApprovalDependency':True,'semanticLedgerAtVerification':{'path':str(ledger.relative_to(ROOT)),'sha256':sha(ledger)},'curricularAtomicPopulation':807,'distinctPreparationObjects':len(allprep),'forms':forms,'existingExamReuse':{'existingFullExamId':eid,'wholeCurrentExistingExamExact':True,'wholePreparationCount':8,'nativeInput':{'path':str(nativepath.relative_to(ROOT)),'sha256':sha(nativepath)},'actualSavedScopeCount':161,'actualSavedUnionCount':46,'affectedScopeCount':34,'examTargetCount':0,'GKScopesMissingBothLKGoals':26,'scopeRowsReconstructedExactly':actual,'newNativeExecution':False,'sourceOrScopeApproval':False},'writes':'Private reviewer directory only; no author bundle, canonical, ledger, runtime, learner state or Git writes.'}
(OUT/'input-verification.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':report['status'],'forms':6,'frozenFiles':len(bindings),'preparationCounts':[f['transitivePreparationCount'] for f in forms],'distinctPreparation':len(allprep),'actualSavedScopeRows':len(actual)}))
