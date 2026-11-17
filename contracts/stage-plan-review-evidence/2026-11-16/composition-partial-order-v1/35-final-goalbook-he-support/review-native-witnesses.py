from pathlib import Path
from collections import deque
import json, hashlib
ROOT=Path('/home/enpasos/projects/skillpilot'); OUT=Path(__file__).parent
native_path=ROOT/'tmp/pipeline/laender-stufen/gesamt/final-v4/native/backend-scopes.json'
goals={};owners={};pins={}
for path in sorted((ROOT/'curricula/DE/Gymnasium/canonical').glob('*.json')):
    data=json.loads(path.read_text())
    if not isinstance(data,dict) or not isinstance(data.get('goals'),list):continue
    pins[str(path.relative_to(ROOT))]=hashlib.sha256(path.read_bytes()).hexdigest()
    for goal in data['goals']: goals[goal['id']]=goal; owners[goal['id']]=data.get('landscapeId')
methods=['b378c8b3-5e83-5abf-8243-b0f345037bfc','d3c153b9-e09b-5668-8386-73105546a7c1','da26294f-4316-5bd5-a37a-bd89397b3b8b']
physics='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
def label(gid):
    value=goals[gid].get('title','');return value.get('de',str(value)) if isinstance(value,dict) else value
rows=[]
for row in json.loads(native_path.read_text()):
    if not(row['key'].startswith('DE-HE:') and ':SekI:' in row['key']):continue
    seeds=set(row['seedAtomicGoalIds']); physics_seeds={x for x in seeds if owners.get(x)==physics}
    learning=set(row['learningAtomicGoalIds']);found={x:[x] for x in physics_seeds};queue=deque(sorted(physics_seeds))
    while queue:
        gid=queue.popleft();assert gid in goals,gid
        for required in goals[gid].get('requires',[]):
            required=required.split(':')[-1]
            if required not in found:found[required]=found[gid]+[required];queue.append(required)
    witnesses=[]
    for gid in methods:
        assert gid not in seeds and gid in learning and gid in found
        witnesses.append({'id':gid,'title':label(gid),'seed':False,'inActualL':True,'path':found[gid],'pathTitles':[label(x) for x in found[gid]],'physicsSeed':found[gid][0]})
    rows.append({'key':row['key'],'viewId':row['viewId'],'actualPhysicsSeedCount':len(physics_seeds),'actualCombinedSeedCount':len(seeds),'actualCombinedLearningCount':len(learning),'methodWitnesses':witnesses})
assert len(rows)==6
report={'status':'PASS','meaning':'All three supports lie in actual course/jurisdiction/duration filtered HE SekI learning L, and each is reachable from an actual selected Physics seed through ordinary unpruned canonical requires. None is a seed.','nativePath':str(native_path.relative_to(ROOT)),'nativeSha256':hashlib.sha256(native_path.read_bytes()).hexdigest(),'canonicalPins':pins,'contexts':rows}
(OUT/'native-method-witnesses.actual.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'status':'PASS','actualContexts':len(rows),'witnesses':sum(len(r['methodWitnesses']) for r in rows)}))
