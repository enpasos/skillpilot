# SPDX-License-Identifier: Apache-2.0
import json,hashlib,copy,collections
from pathlib import Path
P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-T3-terminal-exams-author-20261018-v1')
def read(p):return json.loads(Path(p).read_text())
def digest(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):
 b=Path(p).read_bytes();return dict(path=str(p),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b))
canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';goals={g['id']:g for g in read(canonical)['goals']};placements=read(P/'AUTHOR.sparse-existing-parent-contains-and-current-view-placement-proposals.INACTIVE.json')['placements'];matrix=read(P/'AUTHOR.finite-T3-matrix.nineteen-existing-end-goals.json')['matrix'];mr={r['endpointId']:r for r in matrix};operations={};implicit=[];holds=[]
def closure(gid):
 seen=set();stack=[gid]
 while stack:
  gid=stack.pop()
  if gid in seen:continue
  seen.add(gid);stack+=goals[gid].get('contains',[])
 return seen
closures={gid:closure(gid) for gid in goals}
def nodes(ns,pointer='/rootNodes',path=()):
 for i,n in enumerate(ns):
  np=f'{pointer}/{i}';yield n,np,pointer,i,path
  yield from nodes(n.get('children',[]),np+'/children',path+(n.get('id',n.get('goalId','')),))
def get(obj,pointer):
 for x in pointer.strip('/').split('/'):obj=obj[int(x)] if isinstance(obj,list) else obj[x]
 return obj
for r in placements:
 e=r['endpointId'];m=mr[e];requires=set(m['ordinaryGoalIds']);parent=r['parentGoalId']
 for p in m['currentTargetViews']:
  path=p['path'];v=read(path);allnodes=list(nodes(v['rootNodes']))
  inherited=[dict(pointer=np,goalId=n['goalId']) for n,np,pa,i,st in allnodes if n['kind']=='canonicalSubtree' and n.get('projectionRole','target')=='target' and parent in closures[n['goalId']]]
  if inherited:
   implicit.append(dict(normalView=pin(path),endpointId=e,existingPracticeParentId=parent,targetSubtreeWitnesses=inherited,operation='NO_VIEW_NODE_CHANGE_PARENT_CONTAINS_SUPPLIES_NEW_ENDPOINT',stillRequiresActualRuntimeProjectionCheck=True));continue
  matches=[]
  for n,np,pa,i,st in allnodes:
   if n['kind']=='goalEntry' and n.get('projectionRole','target')=='target' and n['goalId'] in requires:matches.append(dict(pointer=np,parent=pa,index=i,covered={n['goalId']},path=st,node=n))
   elif n['kind']=='canonicalSubtree' and n.get('projectionRole','target')=='target':
    cov=requires&closures[n['goalId']]
    if cov:matches.append(dict(pointer=np,parent=pa,index=i,covered=cov,path=st,node=n))
  covered=set().union(*(x['covered'] for x in matches)) if matches else set()
  if not requires<=covered:
   holds.append(dict(endpointId=e,normalView=pin(path),reason='No exact existing target node witness for every required end goal',missing=sorted(requires-covered)));continue
  # Nearest shared existing structure: collect paths to parent arrays and take their longest common pointer prefix at a children/rootNodes boundary.
  par=matches[0]['parent']
  while not all(x['pointer'].startswith(par+'/') for x in matches):
   if par=='/rootNodes':break
   par=par.rsplit('/children',1)[0].rsplit('/',1)[0]
   if not par:par='/rootNodes'
  # Keep only direct children of that selected existing array as insertion anchors.
  arr=get(v,par);indices=[]
  for x in matches:
   rest=x['pointer'][len(par)+1:];indices.append(int(rest.split('/')[0]))
  anchor=max(indices);k=(path,par)
  op=operations.setdefault(k,dict(normalView=pin(path),childrenPointer=par,beforeChildrenSHA256=digest(arr),wholeBeforeChildren=copy.deepcopy(arr),insertions=[]))
  op['insertions'].append(dict(afterOriginalIndex=anchor,afterOriginalNode=copy.deepcopy(arr[anchor]),newNode=dict(kind='goalEntry',goalId=e,projectionRole='target'),requiredTargetWitnessPointers=[x['pointer'] for x in matches],requiredGoalIds=sorted(requires)))
for op in operations.values():
 before=op['wholeBeforeChildren'];after=[]
 for i,n in enumerate(before):
  after.append(n)
  for ins in op['insertions']:
   if ins['afterOriginalIndex']==i:after.append(ins['newNode'])
 op['wholeProposedChildren']=after;op['afterChildrenSHA256']=digest(after);inserted={i['newNode']['goalId'] for i in op['insertions']};assert [n for n in after if n.get('goalId') not in inserted]==before
 # Stable structure IDs and selected anchor identity permit additive merges without overwriting other candidate tails.
 seq=op['childrenPointer'].strip('/').split('/');ns=read(op['normalView']['path'])['rootNodes'];ids=[]
 for j in range(1,len(seq),2):
  node=ns[int(seq[j])];ids.append(node['id']);ns=node['children']
 op['stableStructureIdPath']=ids
 for ins in op['insertions']:
  anchor=ins['afterOriginalNode'];ins['selectedAnchorMetadataCAS']={k:v for k,v in anchor.items() if k!='children'}
 op['allOldWholeNodesAndOrderExact']=True;op['applyPolicy']='Selected child-array CAS plus independent inserts; never overwrite the whole normal view or lose unrelated append tails. Re-anchor after original witness node if another accepted candidate inserted a distinct endpoint first.'
out=dict(role='EXACT_INACTIVE_SELECTED_VIEW_CHILD_ARRAY_CAS_AND_IMPLICIT_PARENT_WITNESSES',canonicalAtCheck=pin(canonical),operations=list(operations.values()),implicitExistingSubtreePlacements=implicit,HOLDs=holds,normalWrites=0,newOrdinaryTargets=0,scopeAndNonselectedViewFieldsExact=True,actualRuntimeCompilerNotInvoked=True)
(P/'AUTHOR.exact-selected-view-child-array-CAS.INACTIVE.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(dict(selectedViewChildArrays=len(operations),explicitNewEntries=sum(len(o['insertions']) for o in operations.values()),implicitPlacements=len(implicit),HOLDs=holds),ensure_ascii=False,indent=2))
