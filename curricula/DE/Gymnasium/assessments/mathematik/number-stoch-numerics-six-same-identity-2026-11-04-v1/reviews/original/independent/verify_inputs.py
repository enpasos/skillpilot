"""Independent finite input/structure verification; writes only beside this script."""
import hashlib,json
from pathlib import Path
from datetime import datetime,timezone

ROOT=Path.cwd()
OUT=Path(__file__).resolve().parent
H=ROOT/'tmp/approach-review-20261101'
A=H/'rsa-factorisation-two-whole-forms-20261104-v1'
B=H/'stoch-numeric-four-whole-forms-20261104-v1'
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def objsha(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
expected={A/'content-review-handoff.json':'d33a382cd8761c85b6efbc2c2ec281498ab6fc087e93373dce9e60c9546c6cc5',A/'review-input-manifest.json':'40e488301c4484e2bc75479f40128a5a16ae11b2d79dc674e271eaabf64b369a',B/'author-freeze.json':'87b89bc82d6fbd99a40cf78e4181b7ccdd3b15f13442165c47408deb9230f901'}
for p,s in expected.items():assert sha(p)==s,(str(p),'freeze SHA mismatch')
bindings=[]
for base,manifest in [(ROOT,read(A/'review-input-manifest.json')),(B,read(B/'author-freeze.json'))]:
 for row in manifest['files']:
  p=base/row['path'];assert sha(p)==row['sha256'];assert p.stat().st_size==row['bytes']
  bindings.append({'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size})
canonical=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
canon=read(canonical);goals={g['id']:g for g in canon['goals']}
parents={g:[] for g in goals}
for g in goals.values():
 for ch in g.get('contains',[]):parents[ch].append(g['id'])
def closure(start,rel):
 seen=set();todo=list(start)
 while todo:
  x=todo.pop()
  if x in seen:continue
  seen.add(x);todo.extend(rel(x))
 return seen
forms=[]
contexts={r['goalId']:r for r in read(A/'whole-current-contracts-and-preparation.json')['goals']}
for base in [A,B]:
 for p in sorted(base.glob('*/whole-contract.before-after.json')):
  c=read(p);before=c['wholeCurrentGoal'] if base==B else c['before'];after=c['wholeProposedGoal'] if base==B else c['after'];gid=before['id']
  assert goals[gid]==before,(gid,'finite whole original changed')
  delta=sorted(k for k in set(before)|set(after) if before.get(k)!=after.get(k))
  assert delta==['examData','nodeKind'];assert after['nodeKind']=='exam'
  assert all(after[k]==v for k,v in before.items())
  e=after['examData'];assert e['coveredGoalIds']==[gid];assert e['reviewStatus']=='draft'
  assert e['scoring']['maxPoints']==20 and e['scoring']['passingPoints']==15
  assert sum(s['points'] for s in e['scoring']['steps'])==20
  for loc,suf in [('de',''),('en','En')]:
   assert e['taskContent'+suf]==(p.parent/f'task.{loc}.md').read_text()
   assert e['solutionContent'+suf]==(p.parent/f'solution.{loc}.md').read_text()+'\n'+(p.parent/f'rubric.{loc}.md').read_text()
   rubric=(p.parent/f'rubric.{loc}.md').read_text()
   for s in e['scoring']['steps']:assert s['description'+suf] in rubric
  ancestors=closure(parents[gid],lambda x:parents[x])
  inherited=[r for a in ancestors for r in goals[a].get('requires',[])]
  assert not inherited,(gid,'unexpected inherited preparation')
  prep=closure(before.get('requires',[]),lambda x:goals[x].get('requires',[]))
  if base==A: saved=contexts[gid]['wholeTransitiveRequiresGoals']
  else:
   cx=read(p.parent/'current-context.json');saved=cx['requiresClosureObjects']
   assert {x['id'] for x in cx['allContainsAncestorObjects']}==ancestors
   for x in cx['allContainsAncestorObjects']:assert x==goals[x['id']]
  assert {x['id'] for x in saved}==prep
  for x in saved:assert x==goals[x['id']],(gid,x['id'],'preparation changed')
  forms.append({'goalId':gid,'contractPath':str(p.relative_to(ROOT)),'contractSha256':sha(p),'wholeCurrentObjectSha256':objsha(before),'wholeProposedObjectSha256':objsha(after),'exactChangedFields':delta,'allOriginalFieldsUnchanged':True,'coverageOnlyOwnId':True,'directRequires':before['requires'],'transitivePreparationIds':sorted(prep),'transitivePreparationCount':len(prep),'containsAncestorIds':sorted(ancestors),'inheritedRequires':inherited,'originalObjectAndAllPreparationCurrentlyExact':True,'bilingualEmbeddedTextsAndStepDescriptionsExact':True,'scoring':{'maxPoints':20,'passingPoints':15,'criticalOverallCap':14},'before':before,'after':after})
ledgerpath=ROOT/'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
ledger=read(ledgerpath);population=[r['goalId'] for r in ledger['decisions'] if r['semanticKind']=='curricularAtomic']
assert len(population)==807
assert all(f['goalId'] in population for f in forms)
report={'status':'PASS_FINITE_INPUTS_AND_UNCHANGED_COMPETENCE_PREPARATION','reviewerAgent':'/root/astra_six_math_whole_forms','checkedAtUTC':datetime.now(timezone.utc).isoformat(),'objectHashConvention':'SHA256 UTF8 JSON ensure_ascii=False sort_keys=True separators=(comma,colon)','frozenEntryBindings':[{'path':str(p.relative_to(ROOT)),'sha256':s} for p,s in expected.items()],'frozenFileCount':len(bindings),'frozenFiles':bindings,'canonicalAtActualVerification':{'path':str(canonical.relative_to(ROOT)),'sha256':sha(canonical)},'canonicalHashIsObservationalOnly':True,'semanticLedgerAtActualVerification':{'path':str(ledgerpath.relative_to(ROOT)),'sha256':sha(ledgerpath)},'curricularAtomicPopulation':len(population),'forms':forms,'writes':'This private review directory only; no original author, canonical, ledger, runtime or Git writes.'}
(OUT/'input-verification.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':report['status'],'forms':len(forms),'frozenFiles':len(bindings),'preparationCounts':[f['transitivePreparationCount'] for f in forms],'curricularAtomicPopulation':807}))
