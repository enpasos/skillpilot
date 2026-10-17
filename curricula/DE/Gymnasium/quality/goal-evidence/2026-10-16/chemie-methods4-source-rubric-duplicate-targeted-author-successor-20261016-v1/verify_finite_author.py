"""Read-only finite author checks. Does not write evidence, hosts or normal inputs."""
from pathlib import Path
import copy, hashlib, json
from fractions import Fraction
from jsonschema import Draft202012Validator

P=Path(__file__).resolve().parent
ROOT=next(x for x in P.parents if (x/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json').exists())
def read(p):return json.loads(Path(p).read_text())
def stable(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def rooted(p):return ROOT/p
inputs=read(P/'INPUTS.finite-parent-and-independent-review-pins.json')
pins={}
def walk(x):
 if isinstance(x,dict):
  if {'path','sha256','bytes'}<=x.keys():pins[x['path']]=x
  for v in x.values():walk(v)
 elif isinstance(x,list):
  for v in x:walk(v)
walk(inputs)
for p,v in pins.items():
 b=rooted(p).read_bytes();assert len(b)==v['bytes'] and 'sha256:'+hashlib.sha256(b).hexdigest()==v['sha256'],p
c=read(rooted(inputs['baseCanonical']['path']));before={g['id']:g for g in c['goals']}
assert len(before)==578
g=read(P/'candidate/GOALS.one-whole-planar-CAS-two-source-grounded-new-atoms.author.json')
after=copy.deepcopy(before)
for row in g['patches']:
 assert before[row['goalId']]==row['beforeWholeObject']
 assert row['beforeStableJSONSha256']=='sha256:'+stable(before[row['goalId']])
 after[row['goalId']]=row['afterWholeObject']
for x in g['newWholeGoals']:assert x['id'] not in after;after[x['id']]=x
assert len(after)==580
runtime_schema=read(ROOT/'docs/landscape-runtime.schema.json')
runtime_candidate=copy.deepcopy(c);runtime_candidate['goals']=list(after.values())
Draft202012Validator(runtime_schema).validate(runtime_candidate)
for x in g['protectedWholeGoals']:assert x==after[x['id']]
for id in set(before)-{r['goalId'] for r in g['patches']}:assert after[id]==before[id]
for row in g['patches']:assert row['afterWholeObject']['resourceLinks']==row['beforeWholeObject']['resourceLinks']
for edge in ['requires','contains']:
 visited=set();active=set()
 def dfs(id):
  assert id not in active,(edge,id)
  if id in visited:return
  active.add(id)
  for x in after[id].get(edge,[]):assert x in after,(id,x);dfs(x)
  active.remove(id);visited.add(id)
 for id in after:dfs(id)
oldroot=rooted(next(x['path'] for x in inputs['originals'] if x['path'].endswith('materials/NINE.whole-bilingual-method-source-cases.author.json')))
oldcases=read(oldroot)['cases'];cases=read(P/'materials/SEVENTEEN.whole-bilingual-retained-and-targeted-method-cases.author.json')['cases']
assert len(cases)==17 and len({x['id'] for x in cases})==17
assert cases[:7]==oldcases[:7]
assert cases[7]['originalWholeCase']==oldcases[7]['originalWholeCase']
assert 'Ninhydrin' in cases[7]['materialsDe'] and 'ninhydrin' in cases[7]['materialsEn']
assert cases[8]['goalId']==g['newWholeGoals'][0]['id']
assert cases[8]['practicalExecutionRequiredForWholeGoal'] is False
for x in cases:
 for k in ['materialsDe','materialsEn','taskDe','taskEn','modelAnswerDe','modelAnswerEn']:assert x[k].strip(),(x['id'],k)
 for k in ['taskDe','taskEn','modelAnswerDe','modelAnswerEn']:assert x['independentTransfer'][k].strip()
 assert sum(r['maximumPoints'] for r in x['rubric'])==x['maximumPoints']
 assert all(r['actualAwardedPoints'] is None for r in x['rubric'])
 for r in x['rubric']:assert r['criterionDe'] and r['criterionEn']
assert Fraction(2,8)==Fraction(1,4) and Fraction('5.6')/8==Fraction(7,10)
assert Fraction('1.8')/10==Fraction(9,50) and Fraction('6.4')/10==Fraction(16,25)
Q=Fraction(1,4);K=1;x=Fraction(3,13)
assert Q<K and ((Fraction(1,4)+x)*(1+x))/(1-x)**2==K
assert (1-x, Fraction(1,4)+x,1+x)==(Fraction(10,13),Fraction(25,52),Fraction(16,13))
s=read(ROOT/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
v=Draft202012Validator({'$schema':s['$schema'],'$ref':'#/$defs/profile','$defs':s['$defs']})
profiles=read(P/'profiles/SIX.whole-positive-v2-author-designs-no-independent-votes.json')['rows']
assert len(profiles)==6
for r in profiles:
 v.validate(r['profile'])
 assert r['evidenceLevel']=='E0' and r['maximumClaimScope']=='G0'
 assert r['understandingEvidenceStatus']=='designed_not_learner_observed' and not r['independentApproval']
 for b in r['profile']['applicationCaseBriefs']:assert b['id'] in {c['id'] for c in cases}
src=read(P/'source/SOURCE48.whole-targeted-after-contexts.author.json')
cas=read(P/'source/SOURCE48.whole-before-after-CAS.author.json')['patches']
assert len(src['rows'])==len(cas)==48
for i in [3,7]:assert src['rows'][i]['allOriginalPartnerMappings']==cas[i]['beforeWholeObject']['allOriginalPartnerMappings']
for i in [0,1,4,5]:assert all(x.get('courseLevelDecision')=='GK_LK' for x in src['rows'][i]['allOriginalPartnerMappings'] if x['canonicalGoalId']==g['patches'][0]['goalId'])
for a,b in zip(src['rows'],cas):
 assert a==b['afterWholeObject']
 assert 'sha256:'+stable(b['beforeWholeObject'])==b['beforeStableJSONSha256']
 old={e['canonicalGoalId'] for e in b['beforeWholeObject']['allOriginalPartnerMappings']}
 new={e['canonicalGoalId'] for e in a['allOriginalPartnerMappings']}
 ch=g['patches'][0]['goalId'];gc=g['newWholeGoals'][0]['id']
 assert (old-{ch})<=new
 if ch in old and ch not in new:assert gc in new
 assert not a['newWholeSourceApproval']
# Replay whole extraction bodies to prove exact CAS, membership and every source goal retained.
exfiles=read(P/'source/EXTRACTION.finite-whole-object-CAS.author.json')['files']
for f in exfiles:
 b=read(rooted(f['baseFile']['path']));a=copy.deepcopy(b)
 for p in f['patches']:
  if p.get('operation')=='add':
   assert not any(x.get('id')==p['afterWholeObject']['id'] for x in a[p['listKey']]);a[p['listKey']].append(p['afterWholeObject'])
  else:
   assert a[p['listKey']][p['index']]==p['beforeWholeObject']
   assert p['beforeStableJSONSha256']=='sha256:'+stable(p['beforeWholeObject'])
   a[p['listKey']][p['index']]=p['afterWholeObject']
 for key in ['sourceGoals','goals']:
  if key not in b:continue
  assert {x['id'] for x in b[key]}<={x['id'] for x in a[key]}
  passages={x['id']:x for x in a['passages']}
  for sg in a[key]:
   if sg.get('passageId') in passages:
    # Changed source memberships must also appear in the relevant inverse lists.
    if sg['id']==src['rows'][16]['wholeSourceGoal']['id']:assert sg['id'] in passages[sg['passageId']]['sourceGoalIds']
maps=read(P/'source/MAPPING.finite-whole-object-CAS.author.json')['files']
for f in maps:
 b=read(rooted(f['baseFile']['path']))
 for p in f['patches']:
  selected=[x for x in b[p['listKey']] if x.get('legacyGoalId')==p['selector']['legacyGoalId']]
  assert selected==p['beforeWholeObjects']
  assert p['beforeStableJSONSha256']=='sha256:'+stable(selected)
  assert all(x['canonicalGoalId'] in after for x in p['afterWholeObjects'])
  assert p['decisionWholeCAS']['beforeWholeObjects']==p['oldDecisionWholeObjects']
  assert set(p['decisionWholeCAS']['afterWholeObjects'][0]['canonicalGoalIds'])=={x['canonicalGoalId'] for x in p['afterWholeObjects']}
dup=read(P/'consolidation/413.whole-duplicate-to-protected94-science-proposal.author.json')
retired=dup['historicalWholeRetiredCandidate']['id'];survivor=dup['protectedWholeSurvivorUnchanged']['id']
assert dup['historicalWholeRetiredCandidate']==before[retired]
assert dup['protectedWholeSurvivorUnchanged']==before[survivor]
for p in dup['relatedWholeGoalCAS']:
 assert p['beforeWholeObject']==before[p['goalId']]
 after[p['goalId']]=p['afterWholeObject']
 assert retired not in p['afterWholeObject'].get('requires',[])+p['afterWholeObject'].get('contains',[])
 if 'examData' in p['beforeWholeObject']:
  old=copy.deepcopy(p['beforeWholeObject']['examData']);old['coveredGoalIds'].remove(retired)
  assert old==p['afterWholeObject']['examData']
  assert survivor in p['afterWholeObject']['requires'] and survivor in p['afterWholeObject']['examData']['coveredGoalIds']
del after[retired];assert len(after)==579 and after[survivor]==before[survivor]
assert all(retired not in x.get('requires',[])+x.get('contains',[]) for x in after.values())
runtime_candidate['goals']=list(after.values());Draft202012Validator(runtime_schema).validate(runtime_candidate)
vs=read(ROOT/'contracts/curriculum-package/v1/composition-view.schema.json')
views=read(P/'views/FOUR.whole-common-course-CAS-and-THREE.conditional-elective-proposals.author.json')
for x in views['safeSourceGroundedCommonCourseCAS']+views['conditionalElectiveOnlyProposals']:
 Draft202012Validator(vs).validate(x['afterWholeView'])
Draft202012Validator(vs).validate(dup['viewCAS']['afterWholeObject'])
Draft202012Validator(vs).validate(views['combinedNILKWhenBothIndependentApprovalsExist']['afterWholeView'])
assert dup['existingProcedure']['relation']=='replacedBy' and dup['existingProcedure']['protected94NotMigrationSource']
assert len(dup['existingProcedure']['sources'])==1
assert dup['existingProcedure']['masteryPolicy']=='reassess' and dup['existingProcedure']['historyPolicy']=='preserve-with-successor-links'
print(json.dumps(dict(status='PASS',scope='Finite author schema, whole-CAS, graph and retention checks only; no scientific or operative course approval',pinnedInputs=len(pins),wholeCases=17,wholeProfiles=6,wholeSourceContexts=48,changedExtractionFiles=len(exfiles),changedMappingFiles=len(maps),runtimeSchemaCandidates580and579=True,wholeViewSchemas9=True,canonicalCandidateWithTwoNewGoals=580,candidateWithSeparateApprovedConsolidation=579,independentVotesProduced=0,newStrictGainClaimed=0,humanApproval=False,humanTrial=False)))
