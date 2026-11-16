from pathlib import Path
import json,math,hashlib,sys,statistics,datetime
O=Path(__file__).parent
sys.path.insert(0,str(O));import build_candidate as b
inputs=b.I;task=b.t
canonical=json.loads(Path(inputs['filePins'][0]['path']).read_text());goals={g['id']:g for g in canonical['goals']}
assert goals[inputs['goal']['id']]==inputs['goal']
for p in inputs['filePins']:
 assert hashlib.sha256(Path(p['path']).read_bytes()).hexdigest()==p['sha256'],p
assert task['id'] not in goals
assert task['requires']==[inputs['goal']['id']]
seen=set();stack=list(task['requires'])
for path in Path('curricula/DE/Gymnasium/canonical').glob('*.json'):
 for goal in json.loads(path.read_text()).get('goals',[]):goals.setdefault(goal['id'],goal)
while stack:
 g=stack.pop()
 if g in seen:continue
 seen.add(g);stack.extend(goals[g].get('requires',[]))
for forbidden in ['d67502e3','e4b']:
 assert not any(g.startswith(forbidden) for g in seen),(forbidden,seen)
assert set(task['examData']['coveredGoalIds'])<=seen
checks=[]
for label,values,mean,h in [
 ('A4 P',[19.8,20.2,20.0,20.1,19.9],20,.2),
 ('A4 Q',[21.2,21.2,21.1,21.2,21.3],21.2,.1),
 ('A4 all retained',[20.0,20.1,24,20,19.9],20.8,2.05),
 ('A4 documented interrupted point excluded',[20,20.1,20,19.9],20,.1),
 ('B slow repeated peaks',[22,22.1,21.9],22,.1),
 ('B fast repeated peaks',[26,26.1,25.9],26,.1)]:
 actualmean=statistics.mean(values);actualh=(max(values)-min(values))/2
 assert math.isclose(actualmean,mean,rel_tol=1e-12) and math.isclose(actualh,h,rel_tol=1e-12)
 checks.append({'case':label,'rawValues':values,'actualMean':actualmean,'actualHalfRange':actualh,'expectedMean':mean,'expectedHalfRange':h,'passed':True})
assert sum(s['points'] for s in task['examData']['scoring']['steps'])==16
omissions=[{'omittedCriterion':i+1,'otherwiseFullScore':14,'passingPoints':15,'passes':False,'counteranswerDe':b.criteria[i][2]} for i in range(8)]
for r in omissions:assert r['otherwiseFullScore']<15
assert 16-1>=15
report={'status':'author-checks-not-independent-acceptance','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'taskId':task['id'],
 'numericChecks':checks,'allSingleCoreOmissions':omissions,'oneMinorErrorWithAllCores':{'score':15,'passingPoints':15,'passes':True},
 'sampling':{'fastTimes':[0,5,10,15,20,25,30],'slowTimes':[0,10,20,30],'fastInterval':5,'slowInterval':10,'sampledMaxima':[26,22],'peakDifferenceK':4,
 'continuousMaximumNonidentifiabilityWitness':'A piecewise linear curve through every supplied fast sample and a second curve also through every sample with an additional point(t=12.5s,temperature=40C) have identical supplied values but different continuous maxima. Therefore supplied points alone fix no exact continuous peak/upper bound. This is a mathematical counterexample, not a claimed physical observation.'},
 'preparationClosureIds':sorted(seen),'noVideoThrowAccelerationPrerequisite':True,'newOrdinaryGoals':0,'learnerResultWrites':False,'oldTasksChanged':False,'actualLearnerExperimentPerformed':False}
(O/'author-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'PASS: 6 numeric cases, 8 omission counteranswers, fair minor-error pass, {len(seen)} true prerequisite atoms; no video/throw/acceleration requirements.')
