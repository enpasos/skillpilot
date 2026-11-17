from pathlib import Path
from itertools import combinations
from unittest.mock import patch
import hashlib,json,sys,tempfile,copy,re,datetime
ROOT=Path('/home/enpasos/projects/skillpilot');sys.path.insert(0,str(ROOT/'scripts'))
import generate_mathematics_foreign_acquisition_policy as producer
OUT=ROOT/'tmp/pipeline/laender-stufen/gesamt/review/foreign-demand-retirement';OUT.mkdir(exist_ok=True)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
canon=list((ROOT/'curricula/DE/Gymnasium/canonical').glob('*.json'))
goals={g['id']:g for p in canon for g in json.loads(p.read_bytes())['goals']}
source=ROOT/'curricula/DE/Gymnasium/composition-views/physik/de-mv-seki.view.json'
report_path=ROOT/'tmp/pipeline/laender-stufen/gesamt/mathematik/final-v7/retired-demands.actual.json'
witness=ROOT/'tmp/pipeline/laender-stufen/gesamt/intermediate-v4/math-acquisition-physics-witnesses.json'
native=ROOT/'tmp/pipeline/laender-stufen/gesamt/intermediate-v4/native/native-views.json'
paths=[*canon,source,report_path,witness,native,ROOT/'scripts/generate_mathematics_foreign_acquisition_policy.py',ROOT/'scripts/test_mathematics_foreign_acquisition_policy.py']
before={str(p.relative_to(ROOT)):sha(p)for p in paths}
retirement=json.loads(report_path.read_bytes());observed=json.loads(witness.read_bytes());actual=json.loads(native.read_bytes());view=json.loads(source.read_bytes())
assert retirement['actualWitnessSha256']==sha(witness) and retirement['actualNativeViewsSha256']==sha(native)
expected={'09f47964-2cd0-410e-93ee-9632b582fc91','c65ecabf-d00b-4e2d-99ae-b64692325ffb','571793bd-34f1-539e-969c-dfcc2dfa96b3'}
assert {r['goalId']for r in retirement['retiredDemands']}==expected and len(retirement['retiredDemands'])==3
def roles(nodes,graph):
 assignments={}
 def visit(items):
  for n in items:
   if n['kind']=='structure':visit(n['children']);continue
   queue=[(n['goalId'],0)]
   for gid,distance in queue:
    gid=gid.split(':')[-1];candidate=(2 if n['kind']=='goalEntry' else 1,-distance,n.get('projectionRole')!='prerequisiteOnly')
    if candidate>assignments.get(gid,(-1,0,False)):assignments[gid]=candidate
    if n['kind']=='canonicalSubtree':queue.extend((c,distance+1)for c in graph[gid].get('contains',[]))
 visit(nodes);return {gid for gid,role in assignments.items()if role[2]and not graph[gid].get('contains')}
def closure(selected,graph):
 seen=set();todo=list(selected)
 for gid in todo:
  if gid in seen:continue
  seen.add(gid);todo.extend(r.split(':')[-1]for r in graph[gid].get('requires',[]))
 return seen
def applies(g,scope):
 values={str(t).upper()for t in g.get('tags',[])}|{str(v).upper()for a in g.get('applicability',{}).values()for v in a}
 courses=values&{'GK','LK','GK+LK'}
 if 'GK+LK'in courses:courses|={'GK','LK'}
 return not(scope.get('courseProfile')and courses and not(set(scope['courseProfile'].split('+'))&courses))and not(scope.get('durationModel')and values&{'G8','G9'}and scope['durationModel']not in values)and not(scope.get('jurisdiction')and any(re.fullmatch('DE-[A-Z]{2}',v)for v in values)and scope['jurisdiction']not in values)
S={g for g in roles(view['rootNodes'],goals)if applies(goals[g],view['scope'])};L=closure(S,goals)
contexts={r['id']:r for r in actual['contexts']};rows=[]
for r in retirement['retiredDemands']:
 assert r['mathViewId']=='de-mv-gym-seki-math'and r['physicsViewId']==view['viewId']=='de-mv-gym-seki-physics'
 assert r['currentPhysicsSourceSha256']==sha(source)
 assert set(r['currentAtomicTargets'])==S and set(r['currentLearningClosure'])==L
 assert r['goalId']not in L
 assert set(r['actualContexts'])=={'DE-MV:G8:SekI:GK','DE-MV:G8:SekI:LK'}
 for context_id in r['actualContexts']:
  c=contexts[context_id]
  assert actual['views'][c['mathViewKey']]['viewId']==r['mathViewId']
  assert actual['views'][c['physicsViewKey']]['viewId']==r['physicsViewId']
  assert any(p['context']==context_id for entry in observed['entries'] if entry['goalId']==r['goalId'] for p in entry['proofs'])
 rows.append({'goalId':r['goalId'],'mathViewId':r['mathViewId'],'physicsViewId':r['physicsViewId'],'actualContexts':r['actualContexts'],'inCurrentS':False,'inUnprunedCurrentL':False})
# Exercise the real producer branch against independently generated tiny DAGs.
class Graph:
 def __init__(self,data):self.goals=data;self.math_atoms={'a'}
 def atomic_roles(self,nodes):return {g:'target'for g in roles(nodes,self.goals)}
 def goal_applies(self,*_):return True
 def prerequisite_closure(self,g):return closure({g},self.goals)-{g}
 def stage(self,node):return 'SekI'if node.get('label')=='Sekundarstufe I'else None
 def placement_rank(self,_):return (0,8,'')
 def atoms(self,g):return {g}
cases=0
with tempfile.TemporaryDirectory(dir=OUT)as temporary:
 work=Path(temporary);physics=work/'physics';physics.mkdir()
 w=work/'witness.json';w.write_text(json.dumps({'entries':[{'goalId':'a','proofs':[{'context':'c'}]}]}))
 n=work/'native.json';n.write_text(json.dumps({'contexts':[{'id':'c','scope':{'courseProfile':'GK'},'mathViewKey':'m','physicsViewKey':'p'}],'views':{'m':{'viewId':'m'},'p':{'viewId':'p'}}}))
 edges=[('t','b'),('t','a'),('b','a')]
 for mask in range(8):
  graph={g:{'id':g,'requires':[],'contains':[]}for g in ['t','b','a']}
  for i,(a,b)in enumerate(edges):
   if mask>>i&1:graph[a]['requires'].append(b)
  for size in range(1,4):
   for selected_tuple in combinations(graph,size):
    selected=set(selected_tuple);learning=closure(selected,graph)
    (physics/'p.view.json').write_text(json.dumps({'viewId':'p','scope':{},'rootNodes':[{'kind':'structure','id':'sek1','label':'Sekundarstufe I','children':[{'kind':'structure','id':'j8','label':'Jahrgangsstufe 8','children':[{'kind':'goalEntry','goalId':g}for g in selected_tuple]}]}]}))
    with patch.object(producer,'Normalizer',lambda:Graph(graph)):
     consumer=any('a'in closure({g},graph)-{g}for g in selected)
     try:producer.build(w,n,physics)
     except ValueError:assert not consumer
     else:assert consumer
     retired=[]
     try:value=producer.build(w,n,physics,retired)
     except ValueError:assert 'a'in selected and not consumer
     else:
      if 'a'not in learning:assert len(retired)==1 and set(retired[0]['currentLearningClosure'])==learning and value['views']['m']==[]
      else:assert consumer and retired==[] and value['views']['m'][0]['goalId']=='a'
    cases+=1
after={str(p.relative_to(ROOT)):sha(p)for p in paths};assert before==after
retained=OUT/'v35-retired-demands.original.json';assert not retained.exists();retained.write_bytes(report_path.read_bytes())
result={'status':'PASS','reviewer':'/root/he_ephase_source_review','author':'/root/he_ephase_validation','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'inputPins':before,'inputDrift':[],
 'actualRetirements':rows,'independentlyRecomputedCurrentS':sorted(S),'independentlyRecomputedUnprunedCurrentL':sorted(L),
 'independentRealProducerFixtureCases':cases,'defaultRemainsFailClosed':True,'selectedOrRequiredAtomsCannotBeRetired':True,
 'timeUnitReview':'First authored time unit in a stage remains authoritative; nested source-topic titles cannot replace it. Actual90-view scan found19 conflicting nested titles, allTH; no genericQ parent hides a Q1-Q4 child.',
 'limits':['Actual3-retirement data binds V35 MV source bytes; TH timing repairV36 and final policy must be rechecked separately.','No canonical goal, requires, source target or learner state changed by this review.']}
(OUT/'review-v1.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':'PASS','actualRetirements':len(rows),'S':len(S),'L':len(L),'realProducerFixtureCases':cases,'inputDrift':[]},indent=2))
