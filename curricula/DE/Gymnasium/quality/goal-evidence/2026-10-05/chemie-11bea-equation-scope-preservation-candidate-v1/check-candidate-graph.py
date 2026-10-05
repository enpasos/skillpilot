from pathlib import Path
import json,collections,hashlib
ROOT=Path('/home/enpasos/projects/skillpilot');OUT=Path(__file__).parent
old=json.loads((ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json').read_text())
new=json.loads((OUT/'candidate-canonical.preview.json').read_text());ids=json.loads((OUT/'candidate-ids.json').read_text())

def cycles(edges):
 index={};low={};stack=[];on=set();result=[]
 def visit(v):
  index[v]=len(index);low[v]=index[v];stack.append(v);on.add(v)
  for w in edges.get(v,[]):
   if w not in edges:continue
   if w not in index:visit(w);low[v]=min(low[v],low[w])
   elif w in on:low[v]=min(low[v],index[w])
  if low[v]==index[v]:
   group=[]
   while True:
    w=stack.pop();on.remove(w);group.append(w)
    if w==v:break
   if len(group)>1 or v in edges.get(v,[]):result.append(sorted(group))
 for v in edges:
  if v not in index:visit(v)
 return sorted(result)
def analyze(c):
 by={g['id']:g for g in c['goals']};parents=collections.defaultdict(set)
 for g in c['goals']:
  for x in g['contains']:parents[x].add(g['id'])
 def closure(start,edges):
  seen=set();todo=list(start)
  while todo:
   x=todo.pop()
   if x in seen:continue
   seen.add(x);todo+=list(edges.get(x,[]))
  return seen
 contains={g['id']:set(g['contains'])for g in c['goals']}
 leaves={i for i,g in by.items()if not g['contains']}
 leafdesc={i:closure([i],contains)&leaves for i in by}
 effective={}
 for i in leaves:
  ancestors=closure(parents[i],parents)
  refs=set(by[i]['requires'])
  for a in ancestors:refs.update(by[a]['requires'])
  expanded=set()
  for r in refs:expanded.update(leafdesc.get(r,{r}))
  effective[i]=expanded
 def route(i):return closure(effective.get(i,[]),effective)
 directrequires={g['id']:set(g['requires'])for g in c['goals']}
 return by,parents,contains,effective,route,{'goalCount':len(by),'containsCycles':cycles(contains),'directRequiresCycles':cycles(directrequires),'effectiveLeafCycles':cycles(effective),'missingContainsRefs':[x for g in c['goals']for x in g['contains']if x not in by],'missingRequiresRefs':[x for g in c['goals']for x in g['requires']if x not in by]}
ob,op,oc,oe,oroute,os=analyze(old);nb,np,nc,ne,nroute,ns=analyze(new)
B=ids['basic'];H=ids['proton'];R=ids['redox'];P=ids['parent'];T='9f355f63-4fb7-5638-9538-6e8a246ec4b2'
routes=[]
for gid in [B,T,R,H]:
 closure=nroute(gid)
 routes.append({'goalId':gid,'title':nb[gid]['title'],'candidateEffectivePrerequisiteClosure':sorted(closure),'includesRedox':R in closure,'includesProtonHalfGoal':H in closure,'includesParentAggregate':P in closure,'status':'SCOPED_ROUTE_CHECK_ONLY'})
exam=[]
for g in old['goals']:
 if not isinstance(g.get('examData'),dict):continue
 before=oroute(g['id']);after=nroute(g['id'])
 exam.append({'goalId':g['id'],'title':g['title'],'beforeExamObject':g,'directCoveredAffectedGoalIds':[x for x in g['examData'].get('coveredGoalIds',[])if x in [P,R]],'beforePrereqClosureTouchesAffected':sorted(before&{P,R}),'afterPrereqClosureTouchesCandidate':sorted(after&{B,H,R}),'addedEffectivePrerequisites':sorted(after-before),'removedEffectivePrerequisites':sorted(before-after),'examDataDelta':None,'status':'UNCHANGED_EXAM_OBJECT; TRANSITIVE_ROUTE_HOLD_IF_CHANGED' if before!=after else 'UNCHANGED_EXAM_OBJECT_AND_EFFECTIVE_ROUTE'})
ancestorweights=[]
for gid in sorted(set(op[P])|set(np[P])):
 pass
def ancestors(p,i):
 seen=set();todo=list(p[i])
 while todo:
  x=todo.pop()
  if x in seen:continue
  seen.add(x);todo+=list(p[x])
 return seen
def leafcount(edges,i):
 seen=set();todo=[i];ls=set()
 while todo:
  x=todo.pop()
  if x in seen:continue
  seen.add(x)
  if not edges[x]:ls.add(x)
  else:todo+=list(edges[x])
 return len(ls)
for gid in sorted(ancestors(op,P)|ancestors(np,P)|{P}):
 ancestorweights.append({'goalId':gid,'title':nb[gid]['title'],'beforeAuthoredWeight':ob[gid].get('weight'),'candidateAuthoredWeight':nb[gid].get('weight'),'beforeUniqueLeaves':leafcount(oc,gid),'candidateUniqueLeaves':leafcount(nc,gid),'status':'HOLD_WEIGHT_POLICY_OR_RECALCULATION' if nb[gid].get('weight')!=leafcount(nc,gid) else 'COUNT_EQUAL_ONLY_NOT_PROGRESS_APPROVAL'})
asset=ROOT/'curricula/DE/Gymnasium/visualizations/chemie'/P/(P+'.jpg')
out={'status':'INACTIVE_LOCAL_SIMULATION_NOT_QA_APPROVAL','method':'Direct contains/requires plus conservative effective atom prerequisites: own and every contains ancestor requires, each referenced cluster expanded to its current atomic descendants. This is a reproducible static gate analysis, not a runtime/client acceptance test.','baseline':os,'candidate':ns,'newEffectiveCycles':[x for x in ns['effectiveLeafCycles']if not any(set(x)<=set(o)for o in os['effectiveLeafCycles'])],'routes':routes,'basicAndSimpleMoleculeRoutesAvoidLaterRedoxAndProton':all(not r['includesRedox']and not r['includesProtonHalfGoal']for r in routes[:2]),'simpleMoleculeBaselineIncludesRedox':R in oroute(T),'allOriginalParentJurisdictionsRetained':ob[P]['applicability']==nb[P]['applicability'],'newBasicRetainsAllOriginalJurisdictions':ob[P]['applicability']==nb[B]['applicability'],'overview':{'decision':'KEEP_ON_SURVIVING_PARENT','path':str(asset.relative_to(ROOT)),'digest':'sha256:'+hashlib.sha256(asset.read_bytes()).hexdigest(),'resourceLinksUnchanged':ob[P]['resourceLinks']==nb[P]['resourceLinks'],'freshVApproval':False},'ancestorWeights':ancestorweights,'examCount':len(exam),'directExamCoverageReferences':sum(len(x['directCoveredAffectedGoalIds'])for x in exam),'exams':exam}
(OUT/'candidate-graph-check.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'directContainsCycles':len(ns['containsCycles']),'directRequiresCycles':len(ns['directRequiresCycles']),'baselineEffectiveCycles':len(os['effectiveLeafCycles']),'candidateEffectiveCycles':len(ns['effectiveLeafCycles']),'newEffectiveCycles':len(out['newEffectiveCycles']),'basicAndMoleculeAvoidAdvanced':out['basicAndSimpleMoleculeRoutesAvoidLaterRedoxAndProton'],'exams':len(exam),'directExamReferences':out['directExamCoverageReferences']}))
