import copy, datetime, hashlib, json, sys
from pathlib import Path
root=Path.cwd();sys.path.insert(0,str(root/'scripts'))
from generate_physics_partial_orders import contextual_targets, acquisition_placements
source=root/'scripts/generate_physics_partial_orders.py';pin=hashlib.sha256(source.read_bytes()).hexdigest()
def structure(i,l,children):return {'kind':'structure','id':i,'label':l,'children':children}
def walk(n):
    yield n
    for child in n.get('children',[]):yield from walk(child)
rows=[]
for profile in ['GK','LK']:
    for depth in [1,2,3]:
        for early_unused in [False,True]:
            goals={'consumer':{'title':'Actual consumer','tags':['GK'],'requires':['middle0']},'math':{'title':'Foreign mathematical prerequisite','tags':['LK'],'requires':[]},'unused':{'title':'Unrelated goal','tags':['LK'],'requires':[]},'stale':{'title':'Unneeded former preparation','tags':[],'requires':[]}}
            for i in range(depth):goals['middle'+str(i)]={'title':'Necessary intermediate '+str(i),'tags':['LK'],'requires':['middle'+str(i+1) if i+1<depth else 'math']}
            def closure(g):return set().union(*({r}|closure(r) for r in goals[g]['requires'])) if goals[g]['requires'] else set()
            refs=[{'kind':'goalEntry','goalId':'middle'+str(i),'projectionRole':'target','displayLabel':'Preserved wording '+str(i)} for i in range(depth)]
            if early_unused:refs.insert(0,{'kind':'goalEntry','goalId':'unused'})
            stale={'kind':'goalEntry','goalId':'stale','projectionRole':'prerequisiteOnly','acquisitionPlacement':True}
            view={'scope':{'courseProfile':profile},'rootNodes':[structure('physics-root','Physics',[structure('physics-e-phase','E',copy.deepcopy(refs)+[stale]),structure('physics-q2','Q2',[{'kind':'goalEntry','goalId':'consumer'}])])]}
            original_refs=[copy.deepcopy(n) for r in view['rootNodes'] for n in walk(r) if n['kind']!='structure' and not n.get('acquisitionPlacement')]
            raw={n['goalId'] for n in original_refs}
            def extract(g):
                for r in view['rootNodes']:
                    for parent in walk(r):
                        if parent['kind']!='structure':continue
                        for c in list(parent['children']):
                            if c.get('goalId')==g:parent['children'].remove(c);return c
                return None
            seeds,learning,shifts=contextual_targets(view,goals,raw,closure,extract,structure)
            expected={'consumer'} if profile=='GK' else raw-{'consumer'}
            assert seeds==expected
            assert learning==expected|set().union(*(closure(g) for g in expected))
            assert 'math' in learning
            acquisition_placements(view,goals,raw,closure,structure,consumer_seeds=raw&learning)
            allrefs=[n for r in view['rootNodes'] for n in walk(r) if n['kind']!='structure']
            for ref in original_refs:assert allrefs.count(ref)==1
            assert {n['goalId'] for n in allrefs if n.get('acquisitionPlacement')}=={'math'}
            assert {'kind':'goalEntry','goalId':'stale','projectionRole':'prerequisiteOnly'} in allrefs
            q2=next(n for r in view['rootNodes'] for n in walk(r) if n.get('id')=='physics-q2')
            if profile=='GK':
                for ref in original_refs:
                    if ref['goalId'].startswith('middle'):assert ref in list(walk(q2))
                assert all(s['to']=='physics-q2' for s in shifts)
            else:assert not shifts
            rows.append({'profile':profile,'intermediateDepth':depth,'unrelatedLkPresent':early_unused,'rawTargets':len(raw),'actualSeeds':len(seeds),'actualLearning':len(learning),'allOriginalRefsPreservedExactlyOnce':True,'mathRetainedDespiteLkTag':True,'staleMarkerRetiredWithSupportRetained':True})
assert pin==hashlib.sha256(source.read_bytes()).hexdigest()
out=root/'tmp/pipeline/laender-stufen/gesamt/review/physics-filtered-placement-independent.actual.json'
out.write_text(json.dumps({'at':datetime.datetime.now().astimezone().isoformat(),'sourceSha256':pin,'rows':rows},ensure_ascii=False,indent=2)+'\n')
print(len(rows),'independent filtered-chain placement cases PASS')
