"""Reproducible author checks. These are not independent content acceptance."""
import sys,json,math,hashlib,datetime
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent))
import build_candidates as b

b.write()
out=Path(__file__).parent
def same(a,c):
 if isinstance(a,(list,tuple)) and isinstance(c,(list,tuple)):
  return len(a)==len(c) and all(same(x,y) for x,y in zip(a,c))
 if isinstance(a,(int,float)) and isinstance(c,(int,float)):
  return math.isclose(a,c,rel_tol=1e-11,abs_tol=1e-30)
 return a==c

EXPECTED={
0:[[1],[2]],1:[[1],[2],[3]],2:[[1],[2],[3]],3:[[1,2,3],[1,2,3]],
4:[[2],[3]],5:[[1,2,3],[1,2,3]],6:[[1],[2],[3]],7:[[1],[2],[3]],
8:[[2,3],[4]],9:[[1],[1]],10:[[1],[2]],11:[[2,3],[2,3]],12:[[1,2,3],[1,2,3]],
13:[[1,2,3],[1,2,3]],14:[[1],[1,2]],15:[[3],[4]],16:[[1,2],[1,2]],17:[[1,2,3],[1,2,3]],
18:[[2,3],[2,3]],19:[[1],[2]],20:[[1],[2],[3],[4]],21:[[1],[2,3]],22:[[1,2,3],[1,2,3]],
23:[[1,2,3],[1,2,3]],24:[[1,2],[1,2]],25:[[1],[2],[3]],26:[[3,4],[3,4]],
27:[[2,3,4],[2,3,4]],28:[[1],[2],[3,4]],29:[[1],[2],[3]],30:[[1],[2],[3]],
31:[[1],[2,3]],32:[[1,3],[1,3]],33:[[3],[4]],34:[[1,2,3],[1,2,3]]}

summaries=[];matrix=[];all_ids=set();needed=set()
for task,review in zip(b.TASKS,b.REVIEWS):
 assert task['id'] not in b.ALL and task['id'] not in all_ids
 all_ids.add(task['id']);ed=task['examData'];sc=ed['scoring'];req=task['requires']
 assert task['type']=='atomic' and not task['contains'] and ed['reviewStatus']=='draft'
 assert sum(s['points'] for s in sc['steps'])==sc['maxPoints']
 assert 0<sc['passingPoints']<=sc['maxPoints']
 assert set(ed['coveredGoalIds'])<=b.closure(req)
 for i in req:
  assert not any(i in b.closure([j]) for j in req if i!=j)
 needed.update(b.closure(req))
 for name in ['taskContent','taskContentEn','solutionContent','solutionContentEn']:
  assert len(ed[name])>100
 for check in review['authorNumericChecks']:
  actual=eval(check['calculation'],{'math':math})
  assert same(actual,check['expected']),(review['key'],check,actual)
  check['actual']=actual;check['passed']=True
 for core in review['essentialClaims']:
  assert core['counteranswerDe'] and core['missingCoreScoreMaximum']<sc['passingPoints']
  assert core['minorErrorPasses']
 for ri,basis in zip(review['coveredRowIndices'],review['coverageBasis']):
  source=b.ROWS[ri]['positiveEvidenceProfile']['record']['profile']
  assert len(EXPECTED[ri])==len(source['coverageExpectations']['requiredExpectationIds'])
  bindings=[]
  for expectation,cores in zip(source['coverageExpectations']['requiredExpectationIds'],EXPECTED[ri]):
   assert all(f'k{c}' in {s['id'] for s in sc['steps']} for c in cores)
   bindings.append({'expectationId':expectation,'scoringCoreIds':[f'k{c}' for c in cores]})
  basis['expectationBindings']=bindings
  matrix.append({'ordinaryGoalId':b.G[ri]['id'],'title':b.G[ri]['title'],'priority':b.ROWS[ri]['priority'],
   'newTaskId':task['id'],'newTaskTitle':task['title'],'expectationBindings':bindings,
   'minimumIndependentDemonstrations':source['coverageExpectations']['minimumIndependentDemonstrations'],
   'actualIndependentCases':['A','B','C'] if ri in [20,28] else ['A','B'],
   'profileFingerprint':basis['profileFingerprint'],'notIndependentApproval':True})
 summaries.append({'taskId':task['id'],'maxPoints':sc['maxPoints'],'passingPoints':sc['passingPoints'],
  'essentialCores':len(review['essentialClaims']),'omitAnyWholeCoreRawMax':sc['maxPoints']-4,
  'omitAnyWholeCoreFails':sc['maxPoints']-4<sc['passingPoints'],'missingEssentialOrTransferCap':sc['passingPoints']-1,
  'minorOnePointErrorScore':sc['maxPoints']-1,'minorOnePointErrorPasses':True,
  'numericChecksPassed':len(review['authorNumericChecks']),'coverageWithinRequiresClosure':True,'requiresTransitivelyMinimal':True})

expected={g['id'] for g in b.G.values()}
actual={x['ordinaryGoalId'] for x in matrix}
assert actual==expected and len(matrix)==35
assert len(b.TASKS)==27
assert all(b.ALL[t['id']]==t for t in b.D['existingFullTaskInputs']), 'A retained task changed concurrently; inspect before reusing pins.'

# Pin only canonical documents actually needed by the prerequisite closure.
pins=json.loads((out/'input-pins.json').read_text())
already={p['path'] for p in pins['pins']}
for path in sorted(Path('curricula/DE/Gymnasium/canonical').glob('*.json')):
 d=json.loads(path.read_text())
 if any(g['id'] in needed for g in d.get('goals',[])) and str(path) not in already:
  pins['pins'].append({'path':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
  already.add(str(path))
for pin in pins['pins']:
 assert hashlib.sha256(Path(pin['path']).read_bytes()).hexdigest()==pin['sha256'],pin
(out/'input-pins.json').write_text(json.dumps(pins,ensure_ascii=False,indent=2)+'\n')
(out/'coverage-matrix.json').write_text(json.dumps({'status':'author-proposed-coverage-not-native-acceptance','rows':sorted(matrix,key=lambda x:(x['priority'],x['title']))},ensure_ascii=False,indent=2)+'\n')
(out/'review-pack.json').write_text(json.dumps({'status':'draft-author-candidate-no-independent-approval','reviews':b.REVIEWS},ensure_ascii=False,indent=2)+'\n')
(out/'author-checks.json').write_text(json.dumps({'status':'author-checks-not-independent-content-review','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'taskCount':27,'wholeGoalCount':35,'priority1WholeGoalCount':11,'oldTaskIdsChanged':0,'ordinaryGoalsChanged':0,
 'newOrdinaryGoals':0,'activeCanonicalWrites':0,'tasks':summaries},ensure_ascii=False,indent=2)+'\n')
manifest=[]
for path in sorted(out.glob('*')):
 if path.is_file() and path.name!='candidate-artifact-pins.json':
  manifest.append({'path':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size})
(out/'candidate-artifact-pins.json').write_text(json.dumps({'status':'draft-author-candidate','pins':manifest},ensure_ascii=False,indent=2)+'\n')
print(f'PASS: {len(summaries)} task contracts, 35 goal/profile maps, {sum(s["numericChecksPassed"] for s in summaries)} numeric checks, {len(pins["pins"])} exact input files. Independent content review/native acceptance still pending.')
