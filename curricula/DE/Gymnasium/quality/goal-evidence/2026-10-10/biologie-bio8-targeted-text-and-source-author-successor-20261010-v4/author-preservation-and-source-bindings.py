# SPDX-License-Identifier: Apache-2.0
import copy,hashlib,json,pathlib,collections
R=pathlib.Path(__file__).resolve().parents[7]
B=pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
O=B/'biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3'
P=B/'biologie-bio8-targeted-text-and-source-author-successor-20261010-v4'
def read(p):return json.loads((R/p).read_text())
def ref(p):
 b=(R/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,x):
 f=R/P/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return ref(P/p)
old=read(O/'candidate/whole483-final-fossil-image-substantive-successor.inactive.json')
cur=read(P/'candidate/whole483-final-text-source-image.inactive.json')
om={g['id']:g for g in old['goals']};gm={g['id']:g for g in cur['goals']}
changed=[i for i in om if om[i]!=gm[i]];assert set(changed)=={'374e6de5-0747-57cb-99e3-e50ccb371124','9b40dae5-6d89-5714-ac96-373e72a7045e','80235254-ca58-5ba0-9319-b842350d6eb2'}
oq={q['goalId']:q for q in read(O/'candidate/QA396.final-fossil-image-pending.json')['records']}
nq={q['goalId']:q for q in read(P/'candidate/QA396.author-pending.json')['records']}
protected={i for i,q in oq.items()if q.get('aiApproved')=='yes'};assert len(protected)==353
assert all(om[i]==gm[i]and oq[i]==nq[i]for i in protected)
op={p['goalId']:p for p in read(O/'native/whole396-final-fossil-image.normal-model.actual.json')['pages']}
np={p['goalId']:p for p in read(P/'native/whole396.normal-model.actual.json')['pages']}
assert all(op[i]==np[i]for i in protected)
oldat=read(O/'sources/final396-normal-atlas-whole-receipt.author.json');at=read(P/'sources/normal-atlas.receipt.whole.json')
def sem_witness(w):return{k:v for k,v in w.items()if k not in {'mappingPath','sourceExtractionPath'}}
def scope_id(s):return(s['jurisdiction'],s['stage'],s.get('courseProfile') or '')
oas={scope_id(s):s for s in oldat['scopes']};nas={scope_id(s):s for s in at['scopes']};assert set(oas)==set(nas)
scope_deltas=[]
for key in oas:
 before=oas[key];after=nas[key]
 assert (set(before['goalIds'])&protected)==(set(after['goalIds'])&protected),(key,'protected scope')
 for i in protected:
  left=sorted(json.dumps(sem_witness(w),sort_keys=True)for w in before['witnesses']if w['goalId']==i)
  right=sorted(json.dumps(sem_witness(w),sort_keys=True)for w in after['witnesses']if w['goalId']==i)
  assert left==right,(key,i,'protected semantic source witnesses')
 added=sorted(set(after['goalIds'])-set(before['goalIds']));removed=sorted(set(before['goalIds'])-set(after['goalIds']))
 if added or removed:scope_deltas.append({'scope':list(key),'addedGoalIds':added,'removedGoalIds':removed})
assert scope_deltas==[{'scope':['DE-MV','SekI',''],'addedGoalIds':['80235254-ca58-5ba0-9319-b842350d6eb2'],'removedGoalIds':[]}],scope_deltas
acyclic={}
for kind in ['contains','requires']:
 visited=set();stack=[]
 def visit(i):
  assert i not in stack,(kind,stack+[i])
  if i in visited:return
  stack.append(i)
  for j in gm[i].get(kind,[]):
   j=j.replace(cur['landscapeId']+':','')
   if j in gm:visit(j)
  stack.pop();visited.add(i)
 for i in gm:visit(i)
 acyclic[kind]={'acyclic':True,'wholeGoalsVisited':len(visited)}
prs=[json.loads(l)for l in(R/P/'positive/ten-current-author.pending.review.jsonl').read_text().splitlines()]
oldprs=[json.loads(l)for l in(R/O/'positive/ten-final-fossil-image-author.pending.review.jsonl').read_text().splitlines()]
oldpr={r['goalId']:r for r in oldprs}
bindings=[]
for row in prs:
 i=row['goalId'];pf=P/'final/profiles'/f'{i}.whole-current-profile.json'if i.startswith('430b')else O/'final/profiles'/f'{i}.whole-current-profile.json'
 mf=P/'materials'/f'{i}.whole-two-cases.json'if i.startswith('430b')else O/'materials'/f'{i}.whole-two-cases.json'
 assert read(pf)==row['profile'];cases=read(mf);assert len(cases)==2 and all(c['actualLearnerPerformance']is False and c['actualExperimentPerformed']is False for c in cases)
 bindings.append({'goalId':i,'wholeProfile':ref(pf),'wholeTwoCases':ref(mf),'goalFingerprint':row['goalFingerprint'],'profileFingerprint':row['profileFingerprint'],'reviewInputFingerprint':row['reviewInputFingerprint'],'wholePBodyExactToV3':row['profile']==oldpr[i]['profile'],'newScientificPRequired':i.startswith('430b')})
assert sum(not b['wholePBodyExactToV3']for b in bindings)==1
put('final/ten-current-whole-profile-material-bindings.json',{'records':bindings,'wholeProfiles':10,'wholeCases':20,'approvalState':'ai_candidate/needs_human_review/E1/G1','profilesApproved':0,'humanApproval':0})
source=read(O/'sources/final31-pairs-and34-whole-direct-operators.regular-primary.author.json')
rows=copy.deepcopy(source['records']);cfg=read(P/'sources/final-normal-atlas.config.json')
rpold=str(O/'sources/RP-final-explicit-theory-prerequisite-role.successor.json');rpnew=P/'sources/RP-whole-locator-successor.review.json'
mvold=next(r['wholeMapping']['path']for r in rows if r['wholeLiteralSourceGoal']['id'].startswith('mv-')and r['canonicalGoalId'].startswith('430b'))
mvnew=P/'sources/MV-culture-partial.whole-mapping.successor.review.json'
for r in rows:
 oldpath=r['wholeMapping']['path'];newpath=rpnew if oldpath==rpold else mvnew if oldpath==mvold else None
 if newpath:
  mapping=read(newpath);extraction=pathlib.Path(mapping['sourceExtractionPath']);ex=read(extraction);sid=r['wholeLiteralSourceGoal']['id']
  r['wholeMapping']=ref(newpath);r['wholeExtraction']=ref(extraction)
  r['wholeLiteralSourceGoal']=next(g for g in ex['sourceGoals']if g['id']==sid)
  r['wholeSourceDecision']=next(d for d in mapping['decisions']if d['sourceGoalId']==sid)
  r['wholeMappingRecord']=next(m for m in mapping['mappings']if m['legacyGoalId']==sid and m['canonicalGoalId']==r['canonicalGoalId'])
mvrow=copy.deepcopy(next(r for r in rows if r['wholeMapping']['path']==str(mvnew)and r['canonicalGoalId'].startswith('430b')))
mvrow['canonicalGoalId']='80235254-ca58-5ba0-9319-b842350d6eb2'
mvrow['wholeMappingRecord']=next(m for m in read(mvnew)['mappings']if m['legacyGoalId']==mvrow['wholeLiteralSourceGoal']['id']and m['canonicalGoalId']==mvrow['canonicalGoalId'])
mvrow['primaryBoundedOperatorBasis']={'printedPage':28,'physicalPdfPage':32,'clause':'Kulturelle Evolution','boundedContribution':'social transmission and present effects','unfulfilledDistinctOperator':'judge future opportunities and limits'}
rows.append(mvrow)
pairs=copy.deepcopy(source['wholePairs'])
for pair in pairs:
 oldpath=pair['mapping']['path'];newpath=rpnew if oldpath==rpold else mvnew if oldpath==mvold else None
 if newpath:
  pair['mapping']=ref(newpath);pair['extraction']=ref(pathlib.Path(read(newpath)['sourceExtractionPath']))
assert len(rows)==35 and len(pairs)==31
put('sources/whole31-pairs-and35-direct-operators.current-author.json',{**source,'wholePairs':pairs,'records':rows,'sourceCoverageCompleteClaim':False,'role':'targeted_author_candidate_not_independent_source_review'})
put('checks/protected353-whole-goals-QA-pages-source-witnesses-and-DAG.actual.json',{'wholeGoals':483,'atomicDenominator':396,'wholeGoalObjectsExactToV3':480,'changedGoalIds':changed,
 'strictProtectedGoals':353,'allProtectedWholeGoalObjectsExact':True,'allProtectedWholeQARowsExact':True,'allProtectedWholePageContextsExact':True,
 'allProtectedScopeMembershipsExact':True,'allProtectedSourceWitnessSemanticsExact':True,'sourceWitnessTransportPathUpdatesOnly':True,
 'scopeDeltas':scope_deltas,'DAG':acyclic,'wholeProfiles':10,'wholeCases':20,'unchangedWholePProfiles':9,'medicine27bWholePExact':True,
 'newIndependentScienceJudgments':0,'humanApproval':0,'strictActiveGain':0,'activeWrites':[]})
print(json.dumps({'protected353GoalsQAPagesSourceWitnessesExact':True,'whole483DAG':acyclic,'scopeDeltas':scope_deltas,'whole31Pairs':31,'wholeDirectOperators':35,'PProfilesExact9Corrected1':True,'strictGain':0}))
