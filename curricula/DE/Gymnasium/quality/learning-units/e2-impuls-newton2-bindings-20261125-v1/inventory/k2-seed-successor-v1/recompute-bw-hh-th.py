"""Independent exact BW/HH/TH SekI seeds and requires closure; no fixture values are inputs."""
import pathlib,json,hashlib,sys,datetime,subprocess
from functools import cache
from collections import deque
repo=pathlib.Path(sys.argv[1]);out=pathlib.Path(sys.argv[2]);base=pathlib.Path('curricula/DE/Gymnasium');subject='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
def read(p):return json.loads((repo/p).read_text())
def pin(p):
 b=(repo/p).read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
goals={};owners={};sourcePins=[]
for p in sorted((repo/base/'canonical').glob('*.json')):
 rel=p.relative_to(repo);sourcePins.append(pin(rel))
 for g in json.loads(p.read_text())['goals']:
  assert g['id']not in goals;goals[g['id']]=g;owners[g['id']]=str(rel)
@cache
def atoms(root):
 result={};todo=deque([(root,0)]);seen=set()
 while todo:
  id,distance=todo.popleft()
  if id in seen:continue
  seen.add(id);g=goals[id]
  if g.get('contains'):todo.extend((ref.split(':')[-1],distance+1)for ref in g['contains'])
  else:result[id]=distance
 return result

def target_members(nodes):
 best={}
 def walk(n):
  if n['kind']=='structure':
   for c in n.get('children',[]):walk(c)
   return
  role=n.get('projectionRole','target');assert role in ['target','prerequisiteOnly']
  id=n['goalId'];kind=n['kind']
  if kind=='canonicalSubtree':members=atoms(id)
  else:
   assert kind=='goalEntry';members={}if goals[id].get('contains')else{id:0}
  for atom,distance in members.items():
   rank=(kind!='goalEntry',distance,role!='target')
   if atom not in best or rank<best[atom]:best[atom]=rank
 for n in nodes:walk(n)
 return {id for id,rank in best.items()if not rank[2]}

def learning_closure(seeds):
 result=set(seeds);todo=list(seeds)
 while todo:
  for ref in goals[todo.pop()].get('requires',[]):
   for atom in atoms(ref.split(':')[-1]):
    if atom not in result:result.add(atom);todo.append(atom)
 return result

def relevant(id,land,duration):
 g=goals[id];tags=set(g.get('tags',[]))|{g.get('release',{}).get('courseLevel')}
 if 'LK'in tags and'GK'not in tags:return False
 app=g.get('applicability',{})
 return all(not app.get(k)or v in app[k]for k,v in {'jurisdiction':'DE-'+land,'durationModel':duration,'schoolForm':'Gymnasium'}.items())
ledger=read(base/'quality/release-model/physik.semantic-kinds.json');kinds={d['goalId']:d['semanticKind']for d in ledger['decisions']if d['decisionStatus']=='authoritative'}
rows={};views=[]
for land in ['BW','HH','TH']:
 p=base/'composition-views/physik'/('de-'+land.lower()+'-seki.view.json');v=read(p);views.append(pin(p));assert v['landscapeId']==subject
 for duration in ['G8','G9']:
  seeds={id for id in target_members(v['rootNodes'])if relevant(id,land,duration)};learning=learning_closure(seeds)
  key='|'.join([subject,'DE-'+land,'SekI',duration,'GK'])
  exams=sorted(id for id in seeds if goals[id].get('examData')or'Assessment'in goals[id].get('tags',[]))
  rows[key]={'sourceViewId':v['viewId'],'sourceViewPath':str(p),'sourceViewSha256':pin(p)['sha256'],'currentSeedAtomicGoalIds':sorted(seeds),'currentLearningAtomicGoalIds':sorted(learning),'technicalSeedCount':len(seeds),'technicalLearningCount':len(learning),'curricularSeedGoalIds':sorted(id for id in seeds if kinds.get(id)=='curricularAtomic'),'assessmentSeedGoalIds':exams,'seedSemanticKindCounts':{kind:sum(kinds.get(id)==kind for id in seeds)for kind in sorted({kinds.get(id,'not-in-physics-ledger')for id in seeds})},'assessmentRoles':'Technical atomic seeds include applicable visible assessments; this count does not make an assessment a positive curricular core competence or record learner mastery.'}
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip()
result={'schemaVersion':1,'contract':'e2-bw-hh-th-independent-current-seed-learning-v1','recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'headAtMeasurement':head,'scope':'Exactly SekI BW/HH/TH, G8/G9, GK; no other jurisdictions or prior fixture values enter this computation.','canonicalInputs':sourcePins,'viewInputs':views,'semanticKindLedger':pin(base/'quality/release-model/physik.semantic-kinds.json'),'scopes':rows,'fixtureOrPriorLearnerOutputsUsedAsInputs':False,'learnerMasteryWritten':False}
out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
for key,row in rows.items():print(key.split('|')[1:],[row['technicalSeedCount'],row['technicalLearningCount'],len(row['curricularSeedGoalIds']),len(row['assessmentSeedGoalIds'])])
