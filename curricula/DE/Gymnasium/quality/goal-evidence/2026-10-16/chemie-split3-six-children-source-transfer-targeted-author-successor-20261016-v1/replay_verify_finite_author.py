#!/usr/bin/env python3
"""Replay the finite author objects in memory; never write a full landscape or host."""
import copy
import hashlib
import json
from pathlib import Path

from jsonschema import Draft202012Validator

OUT=Path(__file__).parent
OLD=OUT.parent/'chemie-seven-source-atomicity-whole-author-successor-20261016-v1/split-three'

def read(p):return json.loads(p.read_text())
def write(n,x):(OUT/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def stable(x):return 'sha256:'+hashlib.sha256(json.dumps(x,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
def pincheck(x):
    b=Path(x['path']).read_bytes();assert 'sha256:'+hashlib.sha256(b).hexdigest()==x['sha256'];assert len(b)==x['bytes']
def delta(a,b,p=''):
    if type(a)is not type(b):return[p]
    if isinstance(a,dict):
        out=[]
        for k in sorted(set(a)|set(b)):
            q=p+'/'+k.replace('~','~0').replace('/','~1')
            out+= [q]if k not in a or k not in b else delta(a[k],b[k],q)
        return out
    if isinstance(a,list):
        if len(a)!=len(b):return[p]
        return[q for i,(x,y)in enumerate(zip(a,b))for q in delta(x,y,p+'/'+str(i))]
    return[]if a==b else[p]

inputs=read(OUT/'INPUTS.finite-author-and-FIRST-baseline-pins.json')
for x in inputs.values():
    if isinstance(x,dict)and 'path'in x:pincheck(x)
old_selector=read(Path(inputs['originalSelector']['path']))
for x in old_selector['files']:pincheck(x)
assert inputs['independentFIRST']['sha256']=='sha256:5c448c9ea645aae651ada7b2ec655fdeb858b203834220436bf9a06d4217736e'
base=read(Path(inputs['currentCanonical']['path']))
before={x['id']:x for x in base['goals']};after=copy.deepcopy(before)
cand=read(OUT/'GOALS3.parents-CAS-and-SIX.whole-children.current709b.author.json')
for row in cand['wholeParentCAS']:
    assert before[row['goalId']]==row['beforeWholeObject']
    after[row['goalId']]=row['afterWholeObject']
for child in cand['wholeNewGoals']:
    assert child['id']not in after
    after[child['id']]=child
assessment=read(OUT/'ASSESSMENT.bus-whole-CAS-and-retained-capstone-HOLD.author.json')
for row in assessment['wholeCAS']:
    assert before[row['goalId']]==row['beforeWholeObject']
    after[row['goalId']]=row['afterWholeObject']
assert assessment['retainedCapstoneWholeObject']==before['14577339-9e0c-5b44-8e47-91e1a4947367']
changed_existing=[i for i in before if before[i]!=after[i]]
assert set(changed_existing)=={x['goalId']for x in cand['wholeParentCAS']}|{x['goalId']for x in assessment['wholeCAS']}
oldbase=read(Path(old_selector['baseCanonical']['path']))
oldgoals={x['id']:x for x in oldbase['goals']}
five=[i for i in before if before[i]!=oldgoals[i]]
assert len(five)==5
assert all(after[i]==before[i]for i in five)
assert len(after)==584
for field in ['requires','contains']:
    done=set();visiting=set()
    def visit(i):
        if i in done:return
        assert i not in visiting,(field,i)
        visiting.add(i)
        for j in after[i].get(field,[]):
            assert j in after,(field,i,j)
            visit(j)
        visiting.remove(i);done.add(i)
    for i in after:visit(i)

oldm=read(OLD/'materials/TWELVE.whole-bilingual-split-cases.author.json')
m=read(OUT/'MATERIALS12.complete-whole-DE-EN-cases.corrected.author.json')
assert len(m['cases'])==12
material_deltas=[]
for i,(a,b)in enumerate(zip(oldm['cases'],m['cases'])):
    assert a['id']==b['id']and a['goalId']==b['goalId']
    assert a['originalCaseRetention']==b['originalCaseRetention']
    assert a['executionBoundary']==b['executionBoundary']
    if i not in [0,1,2,3,4,5,10]:assert a==b
    if i<6:
        assert a['rubric']==b['rubric'][:3]
        assert b['rubric'][3]['requiredForIndependentTransfer']is True
        assert b['rubric'][3]['points']==2
    if i==10:
        assert a['rubric']==b['rubric'][1:]
        assert 'Cell–OH + (CH3CO)2O → Cell–O–CO–CH3 + CH3COOH'in b['modelAnswerDe']
        assert '→'not in b['materialsDe']and '→'not in b['materialsEn']
    assert sum(x['points']for x in b['rubric'])==b['maximumPoints']
    material_deltas.append({'caseId':b['id'],'changedPointers':delta(a,b),'afterStableSha256':stable(b)})
p=read(OUT/'P6.complete-child-positive-understanding-v2.corrected.author.json')
oldp=read(OLD/'profiles/SIX.whole-child-positive-understanding-v2.author-designs.json')
schema=read(Path('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
v=Draft202012Validator({'$schema':schema['$schema'],'$ref':'#/$defs/profile','$defs':schema['$defs']})
for a,b in zip(oldp['rows'],p['rows']):
    v.validate(b['profile'])
    assert a['profile']['coverageExpectations']==b['profile']['coverageExpectations']
    assert b['evidenceLevel']=='E0'and b['maximumClaimScope']=='G0'
    assert b['understandingEvidenceStatus']=='designed_not_learner_observed'
    assert [x['id']for x in a['profile']['expectations']]==[x['id']for x in b['profile']['expectations']]

s=read(OUT/'SOURCE11.whole-mapping-and-decision-CAS.corrected.author.json')
olds=read(OLD/'source/ELEVEN.whole-source-operator-partner-preserving-CAS.author.json')
old_nonparents={r['canonicalGoalId']for p in olds['patches']for r in p['beforeWholeSourceMappings']if r['canonicalGoalId']not in [x['goalId']for x in cand['wholeParentCAS']]}
new_ids={r['canonicalGoalId']for p in s['patches']for r in p['afterWholeSourceMappings']}
assert old_nonparents<=new_ids
assert all({r['canonicalGoalId']for r in x['afterWholeSourceMappings']}==set(x['afterWholeDecision']['canonicalGoalIds'])for x in s['patches'])
assert any(x['canonicalGoalId']==cand['stableChildIds']['biodiesel']for x in s['patches'][3]['afterWholeSourceMappings'])
assert s['patches'][4]['afterWholeSourceMappings'][0]['canonicalGoalId'].startswith('a78')
assert s['patches'][4]['afterWholeSourceMappings'][0]['matchType']=='partial'
for i in [0,1,5,6,7,8,9,10]:assert s['patches'][i]==olds['patches'][i]
hb=read(OUT/'HB-SOURCE2.goals-and-two-whole-primary-passages-CAS.author.json')
extraction=read(Path(hb['physicalInput']['path']))
for key,rows in [('sourceGoals',hb['sourceGoalCAS']),('passages',hb['passageCAS'])]:
    for row in rows:
        actual=next(x for x in extraction[key]if x['id']==row['id']);assert actual==row['beforeWholeObject']
assert 'unterscheiden Biotreibstoffe'in hb['sourceGoalCAS'][1]['afterWholeObject']['sourceText']
assert hb['sourceGoalCAS'][0]['afterWholeObject']['sourceText']=='nehmen ökologische und ökonomische Bewertungen verschiedener Treibstoffe vor.'

views=read(OUT/'VIEWS25.whole-scoped-view-CAS.retained.author.json')
old_views=read(OLD/'views/WHOLE.scoped-affected-composition-view-successors.author.json')
view_schema=read(Path('contracts/curriculum-package/v1/composition-view.schema.json'))
unchanged_views=0
for row,old_row in zip(views['patches'],old_views['patches']):
    Draft202012Validator(view_schema).validate(row['afterWholeView'])
    assert row['beforeWholeView']==old_row['beforeWholeView']
    if 'de-he-gk.'not in row['normalViewPath']and 'de-he-sekii-gk.'not in row['normalViewPath']:
        assert row['afterWholeView']==old_row['afterWholeView']
        unchanged_views+=1
assert unchanged_views==23

def prerequisite_closure(i):
    found=set();todo=[i]
    while todo:
        q=todo.pop()
        if q in found:continue
        found.add(q)
        todo.extend(after[q].get('requires',[]))
        if q!=i:todo.extend(after[q].get('contains',[]))
    return found-{i}
bus='31a630bc-ee86-5316-8ce5-e522b14fd607'
bus_closure=prerequisite_closure(bus)
assert not (set(cand['stableChildIds'].values())&bus_closure)
assert 'e64a79df-7f21-5651-9b5d-e7d17580569e'not in bus_closure
bus_before=assessment['wholeCAS'][0]['beforeWholeObject'];bus_after=assessment['wholeCAS'][0]['afterWholeObject']
for k in ['taskContent','solutionContent','scoring']:assert bus_before['examData'][k]==bus_after['examData'][k]
remaining_bus=copy.deepcopy(bus_before);remaining_bus['requires']=bus_after['requires'];remaining_bus['examData']['coveredGoalIds']=bus_after['examData']['coveredGoalIds'];assert remaining_bus==bus_after
assert (360+40)/.5==800
assert abs((800/.286)*2/1000-5.594405594405594)<1e-10

child_context=set()
for i in cand['stableChildIds'].values():child_context|=prerequisite_closure(i)
context_ids=(child_context|bus_closure|old_nonparents|set(five))&set(before)
write('CONTEXT.current-whole-partners-required-and-protected-texts.json',{'role':'Finite current709b whole context objects for actual source/prerequisite and protected-text review; no blanket science verdict.','goals':[before[i]for i in sorted(context_ids)]})
reverse={i:set()for i in after}
for i,g in after.items():
    for q in g.get('requires',[])+g.get('contains',[]):reverse[q].add(i)
affected=set(changed_existing)|set(cand['stableChildIds'].values());todo=list(affected)
while todo:
    q=todo.pop()
    for x in reverse[q]:
        if x not in affected:affected.add(x);todo.append(x)
write('DELTA.exact-retention-and-transitive-affected-author.json',{'role':'Finite actual CAS replay/retention, no scientific approval.','currentBaseSha256':inputs['currentCanonical']['sha256'],'existingGoalCount':len(before),'prospectiveGoalCount':len(after),'changedExistingGoalIds':changed_existing,'newChildIds':list(cand['stableChildIds'].values()),'unchangedExistingWholeGoals':len(before)-len(changed_existing),'protectedFiveNewerTextGoalIds':five,'protectedFiveWholeObjectsUnchanged':True,'materialDeltas':material_deltas,'allEightOriginalCasesByteRetainedViaInputPin':inputs['retainedOriginalEightCases'],'allOriginalNonParentSourcePartnerIdsPreservedInFiniteUnion':sorted(old_nonparents),'onlyMovedPartner':{'goalId':'9d97f628-c3ea-5dc0-8723-b17b16297af3','fromSource':s['patches'][2]['sourceGoalId'],'toSource':s['patches'][3]['sourceGoalId']},'busActualPrerequisiteClosure':sorted(bus_closure),'transitivelyAffectedIds':sorted(affected),'heldGlobalCapstoneId':'14577339-9e0c-5b44-8e47-91e1a4947367','heldGlobalCapstoneStillRequiresAllOriginalParents':True,'courseStatus':'Actual target-role execution is recorded separately. No 47-course, full source-route, Memory-card visibility, complete capstone or machine M7 acceptance is implied.'})
write('CHECK.actual-finite-author-schema-replay-and-arithmetic.json',{'status':'PASS','meaning':'Author self-check of finite scope, schema, exact retention and explicit arithmetic only; scientific source/P/A/M/course follow-up remains required.','profileV2Valid':6,'wholeCaseCount':12,'sixExplicitTransferRows':6,'wholeViewSchemasValid':25,'requiresDAG':True,'containsDAG':True,'missingGoalReferences':0,'laterFiveTextSuccessorsRetained':True,'wholeBusTaskSolutionScoringUnchanged':True,'busPrerequisiteClosureContainsAnyNewSplitChild':False,'allNonParentSourcePartnersPreservedInUnion':True,'activeOrHOrNormalBindingWrites':False,'newIndependentVotes':0,'claimedStrictGain':0,'HumanApproval':False,'HumanTrial':False})
print(json.dumps({'status':'PASS','goals':len(after),'profiles':6,'cases':12,'views':25,'protectedLaterTexts':len(five),'busPrerequisiteClosure':len(bus_closure),'affected':len(affected)}))
