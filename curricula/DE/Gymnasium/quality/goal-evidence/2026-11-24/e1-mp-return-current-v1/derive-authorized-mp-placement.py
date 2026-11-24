# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,subprocess,hashlib
root=Path.cwd();baseline='77cd98398d';cp='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json';mp='2b9e565f-d9b4-5e23-b5b7-b7977cecff06';manifest='app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json'
# Reproduce the recorded pre-HH/SN intermediate bytes: only HE placement files use fbde.
# All other views and unchanged canonical bytes remain pinned to the before commit.
get=lambda p,old:subprocess.check_output(['git','show',(baseline if old or not p.startswith('curricula/DE/Gymnasium/composition-views/physik/de-he-') else 'fbde900bc87417aa718b08d79400a9f811eb5b6e')+':'+p],cwd=root);sha=lambda b:'sha256:'+hashlib.sha256(b).hexdigest();oldgoals={g['id']:g for g in json.loads(get(cp,True))['goals']};newgoals={g['id']:g for g in json.loads(get(cp,False))['goals']};paths=json.loads(get(manifest,False))['sourcePaths'];assert len(paths)==70

def occurrences(view,goals):
 out={}
 def add(i,p):out.setdefault(i,[]).append(p)
 def walk(n,path):
  p=path+[[n.get('kind'),n.get('id'),n.get('projectionRole','target')]]
  if n.get('goalId'):
   if n['kind']=='canonicalSubtree':
    def expand(i,q):
     q=q+[[i]];add(i,q)
     for c in goals.get(i,{}).get('contains',[]):expand(c,q)
    expand(n['goalId'],p)
   else:add(n['goalId'],p+[[n['goalId']]])
  for child in n.get('children',[]):walk(child,p)
 for n in view['rootNodes']:walk(n,[])
 return {i:sorted(v,key=lambda x:json.dumps(x,sort_keys=True)) for i,v in out.items()}

def motion_children(view):
 result=[]
 def walk(nodes):
  for n in nodes:
   if n.get('id')=='physics-e1-motion':result.extend(n['children'])
   walk(n.get('children',[]))
 walk(view['rootNodes']);return result
records=[];changes=[]
for path in paths:
 oldraw,newraw=get(path,True),get(path,False);a,b=json.loads(oldraw),json.loads(newraw);before,current=occurrences(a,oldgoals),occurrences(b,newgoals);delta=[]
 for i in set(before)|set(current):
  if before.get(i,[])!=current.get(i,[]):
   delta.append(i);changes.append({'path':path,'goalId':i,'scope':b['scope'],'beforeOccurrencePaths':before.get(i,[]),'currentOccurrencePaths':current.get(i,[])})
 if mp in delta:
  children=motion_children(b);shown=[n.get('id',n.get('goalId')) for n in children if n['kind']=='structure' or n.get('goalId')==mp]
  assert shown==['physics-e1-uniform-motion','physics-e1-accelerated-and-free-fall','physics-e1-air-and-vacuum','physics-e1-two-motions',mp],(path,shown)
 records.append({'path':path,'beforeRawSha256':sha(oldraw),'currentRawSha256':sha(newraw),'allGoalOccurrenceMapsEqual':not delta,'changedGoalIds':sorted(delta)})
assert len(changes)==8 and {c['goalId'] for c in changes}=={mp}
assert all(any('he-physics-topic-287739a3-6143-55d0-abe7-1a08889e9b49' in str(p) for p in c['beforeOccurrencePaths']) and any('physics-e1-motion' in str(p) for p in c['currentOccurrencePaths']) for c in changes)
assert oldgoals[mp]==newgoals[mp]
print(json.dumps({'schemaVersion':1,'contract':'authorized-mp-return-exact-raw-placement-delta-v1','baselineCommit':subprocess.check_output(['git','rev-parse',baseline],cwd=root,text=True).strip(),'authorization':'Product Owner explicitly authorized MP return E.3→E.1 for HE LK, relayed by integrator. New scored MP proposals are not active.','sourceViewCount':len(paths),'changedRawPlacementCount':len(changes),'changedGoalIds':[mp],'unchangedCanonicalMpRawGoal':True,'canonicalMpTags':newgoals[mp]['tags'],'assertedRawOrder':'MP follows the four E.1 children directly; parent opening precedes them.','records':records,'placementChanges':changes,'method':'Expand every authored goalEntry and canonicalSubtree occurrence in all70 old/current views. Compare ancestor identities and projection roles while permitting unrelated sibling order. Only MP changes parent, in eight raw HE views. No goal/prerequisite/scored payload is edited by this audit.','effectiveScopeBoundary':'Raw MP occurrence also exists in GK JSON. The canonical goal remains LK-tagged. Material policy adds it only to the three LK assignment views; actual effective GK/LK/mixed selection, availability, passing and non-credit are checked by the current Java regression suite. This raw-placement proof alone does not establish effective course eligibility.'},ensure_ascii=False,indent=2))
