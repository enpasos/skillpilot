# SPDX-License-Identifier: Apache-2.0
import json,pathlib,hashlib,jsonschema,copy,re,datetime
ROOT=pathlib.Path.cwd()
OUT=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-T5-terminal-exams-author-20261018-v2'
def read(p):return json.loads(p.read_text())
def pin(p):return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def dump(n,x):(OUT/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
old=OUT.with_name('chemie-current450-T5-terminal-exams-author-20261018-v1')
for p in old.glob('INPUT.*.json'):assert p.read_bytes()==(OUT/p.name).read_bytes(),p.name
frozen=read(OUT/'INPUT.whole-current-fourteen-end-and-four-support-goals-and-P.json')
canonical=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
land=read(canonical);current={g['id']:g for g in land['goals']};deltas=[]
active=set(next(s for s in read(ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')['subjects'] if s['subject']=='chemie')['positiveEvidenceConfigPaths'])
for r in frozen['records']:
    a=r['goal'];b=current[a['id']]
    changed=[k for k in set(a)|set(b) if a.get(k)!=b.get(k)]
    if changed:
        assert changed==['requires'],(a['id'],changed)
        assert set(a.get('requires',[]))<=set(b.get('requires',[]))
        added=[i for i in b['requires'] if i not in a.get('requires',[])]
        deltas.append({'goalId':a['id'],'changedFields':changed,'addedRequires':added,'oldWholeGoal':a,'currentWholeGoal':b,'disposition':'Narrow root-owned orientation prerequisite integration. Existing whole P and scientific body unchanged; root must bind actual changed native D/page/reverse-link contexts before release.'})
    assert r['PConfig']['path'] in active
    assert pin(ROOT/r['PConfig']['path'])==r['PConfig']
    assert pin(ROOT/r['PRecordFile']['path'])==r['PRecordFile']
    assert json.loads((ROOT/r['PRecordFile']['path']).read_text().splitlines()[r['PLine']-1])==r['wholePRecord']
materials=read(OUT/'INPUT.whole-selected-operative-materials.exact.json')['entries']
for e in materials:
    assert pin(ROOT/e['sourceFile']['path'])==e['sourceFile']
    x=read(ROOT/e['sourceFile']['path'])
    for k in e['jsonPointer'].split('/')[1:]:x=x[int(k)] if isinstance(x,list) else x[k]
    assert x==e['wholeMaterial']
goals=read(OUT/'AUTHOR.eight-complete-exam-goals.draft.json');matrix=read(OUT/'INPUT.exact-T5-plan-and-author-contract.json')['package']['families']
variants={v['proposedNewEndpointId']:v for f in matrix for v in f['boundedEndpointVariants']}
assert len(goals)==8 and len(variants)==8
schema=read(ROOT/'docs/landscape-runtime.schema.json')
validator=jsonschema.Draft202012Validator({'$schema':schema['$schema'],'$defs':schema['$defs'],'$ref':'#/$defs/goal'})
coverage=read(OUT/'COVERAGE.current-whole-P-expectations-to-essential-score-steps.pending.json');records={r['goal']['id']:r for r in frozen['records']}
all_assessed=set();st=0
for g in goals:
    assert g['id'] not in current
    errors=list(validator.iter_errors(g));assert not errors,[(list(e.path),e.message) for e in errors]
    e=g['examData'];v=variants[g['id']];assert g['requires']==e['coveredGoalIds']==v['targetGoalIds']
    assert e['reviewStatus']=='draft' and g['extendedData']['applicabilityFromRequires'] is True
    steps=e['scoring']['steps'];assert e['scoring']['maxPoints']==e['scoring']['passingPoints']==sum(s['points'] for s in steps)>0
    assert len({s['id'] for s in steps})==len(steps)
    expected={(i,x['id']) for i in g['requires'] for x in records[i]['wholePRecord']['profile']['expectations']}
    bound={(x['goalId'],x['expectationId']) for x in coverage if x['examId']==g['id']};assert expected==bound
    for field,suffix in [('taskContent','de.task'),('taskContentEn','en.task'),('solutionContent','de.solution'),('solutionContentEn','en.solution')]:
        assert (OUT/'tasks'/f'{g["id"]}.{suffix}.md').read_text()==e[field]+'\n'
    for field in ['taskContent','taskContentEn']:
        assert len(e[field])>1000
        assert not re.search(r'curricula/|jsonPointer|solutionContent|for this child|für dieses Kind',e[field]),g['id']
        assert '______' in e[field]
    assert g['extendedData']['authorProposal']['actualLearnerObservations']==[]
    all_assessed.update(g['requires']);st+=len(steps)
assert len(all_assessed)==14
assert all_assessed=={r['goal']['id'] for r in frozen['records'] if not r['supportOnly']}
assert not all_assessed.intersection({r['goal']['id'] for r in frozen['records'] if r['supportOnly']})
assert st==len(coverage)==59
ep=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-T5-electrophoresis-operative-material-author-20261018-v2/AUTHOR.complete-electrophoresis-material.pending.json'
electro=read(ep);eg=next(g for g in goals if g['id'].startswith('6ca09'))
for lang,suffix in [('De',''),('En','En')]:
    assert electro['learnerMethod'+lang] in eg['examData']['taskContent'+suffix]
    assert electro['supervisorPreparationNotLearnerFacing']['de' if lang=='De' else 'en'] in eg['examData']['solutionContent'+suffix]
    assert electro['supervisorPreparationNotLearnerFacing']['de' if lang=='De' else 'en'] not in eg['examData']['taskContent'+suffix]
assert '150 mL' not in eg['examData']['taskContent']
assert '265' in eg['examData']['taskContent'] and '320' in eg['examData']['taskContent']
assert (OUT/'materials/ELECTROPHORESIS.complete-card.exact-root-author.json').read_bytes()==ep.read_bytes()
# Assemble bounded exact view child-array operations, without any normal writes.
proposal=read(OUT/'PROPOSAL.placement-and-applicability.draft.json');ops=[]
for path in sorted({x['viewPath'] for x in proposal['viewEndpointEntries']}):
    view=read(ROOT/path)
    def find(ns,ids):
        for n in ns:
            if n.get('kind')=='structure':
                if n['id']=='chemistry-author-practical-terminal-completion':return ids+[n['id']],n
                v=find(n.get('children',[]),ids+[n['id']])
                if v:return v
    found=find(view['rootNodes'],[]);assert found,path
    ids,node=found;expected=[x['goalId'] for x in proposal['viewEndpointEntries'] if x['viewPath']==path]
    new=[{'kind':'goalEntry','goalId':i,'projectionRole':'target'} for i in expected]
    ops.append({'normalView':pin(ROOT/path),'stableStructureIdPath':ids,'beforeChildren':node['children'],'appendChildren':new,'afterChildren':node['children']+new})
dump('PROPOSAL.five-exact-view-child-array-append-CAS.draft.json',{'status':'PENDING_FOREIGN_REVIEW','operations':ops,'normalWrites':0})
# New nodes are terminal consumers; check actual existing graph plus only own changes.
after=copy.deepcopy(current)
for g in goals:after[g['id']]=g
after[proposal['neutralParentId']]['contains']+=proposal['containsAppend']
for edge in ['requires','contains']:
    visited=set();activepath=set()
    def visit(i):
        assert i not in activepath,(edge,i)
        if i in visited:return
        activepath.add(i)
        for j in after[i].get(edge,[]):
            assert j in after,(edge,i,j)
            visit(j)
        activepath.remove(i);visited.add(i)
    for i in after:visit(i)
# Exact arithmetic on supplied examples, independent of authored prose.
from fractions import Fraction as F
arithmetic={'mixturePercent':[float(F(x,500)*100) for x in [120,150,220]],'mixtureRecovery':float(F(490,500)*100),'caCO3TheoreticalG':float(F(2,1000)*F(1001,10)),'caCO3GrossYieldPct':float(F(180,1000)/(F(2,1000)*F(1001,10))*100),'caCO3PureYieldPct':float(F(171,1000)/(F(2,1000)*F(1001,10))*100),'caCO3BothFreshG':float(F(25,10000)*F(1001,10)),'asaTheoreticalG':float(F(2300,10000)/F(13812,100)*F(18016,100)),'asaRecrystallisationRecoveryPct':float(F(1600,1950)*100),'asaCrudeSApct':[1.2,1.6],'asaPurifiedSApct':[.4,.8],'potatoMeanUm':40.0,'maizeMeanUm':float(F(50,3)),'MimosaTouchMinusShamPP':float(F(80)-F(10,3)),'fieldLawnUnitsPerM2':[48,32],'pondCoverPct':[20,float(F(20,3))],'doughIncreasePct':[float(F(122-80,80)*100),float(F(815-800,800)*100)],'filterIfFull100mLFlowMlPerS':[float(F(100,90)),5.0]}
assert arithmetic['mixturePercent']==[24,30,44]
assert abs(arithmetic['asaRecrystallisationRecoveryPct']-82.05128)<1e-4
dump('CHECK.supplied-example-arithmetic.actual.json',{'status':'PASS_EXACT_FRACTION_ARITHMETIC','results':arithmetic,'actualExperimentalMeasurements':[]})
result={'status':'PASS_BOUNDED_AUTHOR_STRUCTURE_MATERIAL_BINDING_CHECK','checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'currentCanonical':pin(canonical),'originalInputFilesByteExactToUnfinishedV1':4,'wholeSelectedCurrentOrdinaryObjects':18,'rootOwnedRequiresOnlyContextDeltas':deltas,'wholeCurrentNativePObjectsExact':18,'wholeOperativeMaterialObjectsExact':32,'completeExamGoalObjects':8,'runtimeGoalSchemaFragmentValid':8,'directlyAssessedEndGoals':14,'supportGoalsWithoutDirectCoverage':4,'essentialWholePExpectationSteps':59,'allOfRequiresEqualsActualCoveredGoals':True,'maxPassingAndSumConjunctive':True,'embeddedDEENTasksAndSolutionsMatchFiles':True,'exactElectrophoresisV2LearnerMethodsEmbedded':True,'codedUKeyOnlyTeacherSolution':True,'graphRequiresAndContainsAcyclicWithOnlyOwnNewConsumers':True,'fiveViewCASProposals':5,'normalWrites':0,'newIndependentScienceVotes':0,'humanApproval':False,'localSafetyRelease':False,'learnerExecution':False,'nativeContextBinding':'root pending before release; no blanket old science rereview'}
dump('CHECK.finite-T5-structure-material-and-current-inputs.actual.json',result)
print(json.dumps({k:v for k,v in result.items() if k!='rootOwnedRequiresOnlyContextDeltas'},ensure_ascii=False));print('ROOT_REQUIRES_ONLY_DELTAS',len(deltas))
