# SPDX-License-Identifier: Apache-2.0
import pathlib,json,hashlib,copy,datetime,jsonschema
from fractions import Fraction as F
ROOT=pathlib.Path.cwd();BASE=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18';OLD=BASE/'chemie-current450-T4-terminal-exams-author-20261018-v1';OUT=BASE/'chemie-current450-T4-operative-two-material-author-20261018-v2'
def read(p):return json.loads(p.read_text())
def pin(p):return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def dump(n,x):(OUT/n).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
for p in OLD.glob('INPUT.*.json'):assert p.read_bytes()==(OUT/p.name).read_bytes()
old=read(OLD/'AUTHOR.sixteen-whole-new-exam-goals.pending.json')['goals'];new=read(OUT/'AUTHOR.two-new-complete-exam-goals.pending.json')['goals'];combined=read(OUT/'AUTHOR.eighteen-goals.sixteen-whole-exact-two-new.pending.json')['goals']
assert combined[:16]==old and combined[16:]==new and len(combined)==18
rawfile=ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';raw=read(rawfile);current={g['id']:g for g in raw['goals']}
frozen=read(OUT/'INPUT.whole-current-eighteen-goals-and-P.json');selected=[r for r in frozen['records'] if r['goal']['id'].startswith(('63e0','d742'))]
schema=read(ROOT/'docs/landscape-runtime.schema.json');val=jsonschema.Draft202012Validator({'$schema':schema['$schema'],'$defs':schema['$defs'],'$ref':'#/$defs/goal'})
for r,g in zip(selected,new):
    assert r['goal']==current[r['goal']['id']]
    assert pin(ROOT/r['PConfig']['path'])==r['PConfig'];assert pin(ROOT/r['PRecordFile']['path'])==r['PRecordFile']
    assert json.loads((ROOT/r['PRecordFile']['path']).read_text().splitlines()[r['PLine']-1])==r['wholePRecord']
    assert g['id'] not in current and g['requires']==g['examData']['coveredGoalIds']==[r['goal']['id']]
    val.validate(g);e=g['examData'];sc=e['scoring'];assert e['reviewStatus']=='draft'
    assert sc['maxPoints']==sc['passingPoints']==sum(s['points']for s in sc['steps'])==12
    assert len(set(s['id']for s in sc['steps']))==len(sc['steps'])==6
    c=read(ROOT/e['sourceArtifactPath'])
    for lang,k in [('De',''),('En','En')]:
        assert c['learnerMethod'+lang] in e['taskContent'+k]
        for case in r['wholePRecord']['profile']['applicationCaseBriefs']:assert case['taskDemand'+lang] in e['taskContent'+k];assert case['expectedPerformance'+lang] in e['solutionContent'+k]
    for field,suffix in [('taskContent','de.task'),('taskContentEn','en.task'),('solutionContent','de.solution'),('solutionContentEn','en.solution')]:assert (OUT/'tasks'/f'{g["id"]}.{suffix}.md').read_text()==e[field]+'\n'
    for field in ['taskContent','taskContentEn']:assert 'curricula/' not in e[field] and '______' in e[field]
    assert c['actualLearnerObservations']==[] and c['actualExecution'] is False
    if r['goal']['id'].startswith('63e0'):
        assert '30 s' in e['taskContent'] and '120 s' in e['taskContent'];assert '90±2' in e['taskContent'];assert 'Direct Red 80' in e['taskContent']
    else:
        assert 'MgCl₂·6H₂O' in e['taskContent'] and 'MgSO₄' not in e['taskContent'];assert '80,0' in e['taskContent'] and '90–110%' in e['taskContent'];assert 'log(0)' in e['taskContent']
placements=read(OUT/'PROPOSAL.two-exact-source-view-placements.pending.json')['placements'];ops=[]
for path in sorted({p for x in placements for p in x['currentTargetViews']}):
    v=read(ROOT/path)
    def find(ns,ids):
        for n in ns:
            if n.get('kind')=='structure':
                if n['id']=='chemistry-author-practical-terminal-completion':return ids+[n['id']],n
                f=find(n.get('children',[]),ids+[n['id']])
                if f:return f
    found=find(v['rootNodes'],[])
    if not found:
        def stage(ns,ids):
            for n in ns:
                if n.get('kind')=='structure':
                    if n['id']=='chemistry-sekii-lk':return ids+[n['id']],n
                    z=stage(n.get('children',[]),ids+[n['id']])
                    if z:return z
        found=stage(v['rootNodes'],[])
    if not found:
        n=next(n for n in v['rootNodes'] if n.get('kind')=='structure');found=([n['id']],n)
    assert found,path
    ids,n=found;app=[{'kind':'goalEntry','goalId':p['endpointId'],'projectionRole':'target'}for p in placements if path in p['currentTargetViews']]
    ops.append({'normalView':pin(ROOT/path),'stableStructureIdPath':ids,'beforeChildren':n['children'],'appendChildren':app,'afterChildren':n['children']+app})
dump('PROPOSAL.exact-two-endpoint-view-child-array-CAS.pending.json',{'operations':ops,'normalWrites':0})
after=copy.deepcopy(current)
for g in new:after[g['id']]=g
after['5964272f-e835-5a24-b2b1-c162be6b75cb']['contains'] += [g['id']for g in new]
for edge in ['contains','requires']:
    active=set();done=set()
    def visit(i):
        assert i not in active,(edge,i)
        if i in done:return
        active.add(i)
        for j in after[i].get(edge,[]):assert j in after;visit(j)
        active.remove(i);done.add(i)
    for i in after:visit(i)
arithmetic={'vatIndigoGL':float(F(20,1000)/F(10,1000)),'vatNaOHM':float(F(3,10)),'vatDithioniteGL':float(F(15,100)/F(10,1000)),'directCommercialProductGL':float(F(5,100)/F(100,1000)),'directNominalActiveDyeGL':float(F(5,100)/F(100,1000)*F(25,100)),'A2gLTo50mLStockML':float(F(2)*50/20),'B008gLTo50mLStockML':float(F(8,100)*50/2),'CaHardStockMolL':float(F(14702,10000)/F(14702,100)),'MgHardStockMolL':float(F(20330,10000)/F(20330,100)),'totalFreshHardnessCaCO3EquivalentMgL':float(F(2,1000)*F(1001,10)*1000),'foamExampleML':80-30,'kaolinInitialMg':float(F(10,1000)*10*1000),'recoverySpikeMg':[float(F(1,1000)*10*1000),float(F(5,1000)*10*1000)]}
assert arithmetic['vatIndigoGL']==2 and arithmetic['vatDithioniteGL']==15 and arithmetic['totalFreshHardnessCaCO3EquivalentMgL']==200.2
dump('CHECK.two-method-arithmetic.actual.json',{'status':'PASS_EXACT_FRACTION_ARITHMETIC','results':arithmetic,'measuredExperimentalNumbers':[]})
result={'status':'PASS_TWO_NEW_BODY_STRUCTURE_INPUTS_AND_BINDINGS','checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'currentCanonical':pin(rawfile),'newWholeExamGoalObjects':2,'retainedPriorSixteenWholeObjectsExact':True,'frozenInputFilesExact':3,'twoSelectedCurrentWholeOrdinaryGoalsExact':True,'twoSelectedWholeNativePRecordsExact':True,'runtimeGoalSchemaValid':2,'allWholeCurrentPTaskDemandsAndExpectedAnswersIncludedDEEN':True,'concreteLearnerMethodsIncludedDEEN':True,'essentialMaxAndPassingScores':[12,12],'ownNewConsumersRequiresAndContainsAcyclic':True,'actualViewCASCount':len(ops),'officialSourceCreditClaimed':False,'normalWrites':0,'independentVotes':0,'localSafetyRelease':False,'humanApproval':False,'actualLearnerExecution':False}
dump('CHECK.two-body-finite-inputs-schema-content.actual.json',result);print(json.dumps(result))
