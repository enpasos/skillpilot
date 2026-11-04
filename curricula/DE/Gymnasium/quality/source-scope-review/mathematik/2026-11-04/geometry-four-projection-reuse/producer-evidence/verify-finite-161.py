from pathlib import Path
from collections import Counter
from copy import deepcopy
import gzip,json,hashlib
R=Path('/home/enpasos/projects/skillpilot');H=Path(__file__).resolve().parent;C=H/'check-host';cfg=json.loads((H/'integration-config.json').read_text());B=R/cfg['baseHost']
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def closure(edges,roots,mastered=()):
 seen=set();q=list(roots);m=set(mastered)
 while q:
  x=q.pop()
  if x in seen or x in m:continue
  seen.add(x);assert x in edges,('MISSING EXACT EDGE',x);q.extend(edges[x])
 return seen
native=json.load(gzip.open(R/cfg['baseNative']['path']));assert sha(R/cfg['baseNative']['path'])==cfg['baseNative']['sha256'];assert len(native['scopes'])==161
old={g['id']:g for g in read(B/cfg['canonicalPath'])['goals']};new={g['id']:g for g in read(C/cfg['canonicalPath'])['goals']};N=cfg['newAssessmentId'];O=cfg['ordinaryGoalId'];E=cfg['existingReuseAssessmentId'];S=set(cfg['sameIdAssessmentIds']);ROOT=cfg['canonicalRootId'];changed=S|{O,E,ROOT};assert set(new)-set(old)=={N}
for x,g in old.items():
 if x not in changed:assert new[x]==g
 else:
  allowed={'contains'}if x==ROOT else {'nodeKind','examData'}if x in S else {'requires'}if x==O else {'requires','examData'}
  assert {k:v for k,v in g.items()if k not in allowed}=={k:v for k,v in new[x].items()if k not in allowed}
  if x==E:assert {k:v for k,v in g['examData'].items()if k!='coveredGoalIds'}=={k:v for k,v in new[x]['examData'].items()if k!='coveredGoalIds'}
 assert new[x].get('contains')==(g.get('contains')+[N]if x==ROOT else g.get('contains'))
# Verify the whole graph remains a DAG for requires and contains, using the actual final relation.
for relation in ['requires','contains']:
 visiting=set();done=set()
 def visit(x):
  assert x not in visiting,('CYCLE',relation,x)
  if x in done:return
  visiting.add(x)
  for y in new[x].get(relation,[]):assert y in new;visit(y)
  visiting.remove(x);done.add(x)
 for x in new:visit(x)
roles=read(H/'all-view-roles.actual.json');assert len(roles['scopeRows'])==161
allRows=[];partial=[];counts=Counter();newContexts=[]
for s,rr in zip(native['scopes'],roles['scopeRows']):
 assert rr['scope']==s['scope'];T=set(s['targetGoalIds']);context=set(s['contextGoalIds']);p=set(s['selectedProtectedTargetGoalIds']);edges=deepcopy(s['effectiveDirectPrerequisitesByContextGoalId']);oldNeeded=closure(edges,p);assert oldNeeded==set(s['neededContextGoalIdsAtM0']);assert T-oldNeeded==set(s['uncoveredTargetGoalIds']);oldEnds={x for x in T-oldNeeded if not any(x in vs for vs in edges.values())};assert oldEnds==set(s['uncoveredEndpointGoalIds'])
 # Native direct edges of every touched existing node are verified against actual canonical raw R.
 for x in changed-{ROOT}:
  if x in context:assert sorted(edges[x])==sorted(old[x].get('requires',[])),(s['scope'],x,'unexpected inherited/normalized edge')
 addedSame=S&T;newP=p|addedSame;newT=set(T);nextContext=set(context);nextEdges=deepcopy(edges)
 if rr['newAssessmentTarget']:newT.add(N);newP.add(N);nextContext.add(N);nextEdges[N]=list(new[N]['requires'])
 # Preserve the complete old scope context; add only the actual new prerequisites missing there.
 if E in context:
  nextEdges[E]=list(new[E]['requires']);nextContext.add(O)
 if O in nextContext:nextEdges[O]=list(new[O]['requires'])
 for x in nextContext:
  if x not in nextEdges:nextEdges[x]=list(new[x].get('requires',[]))
 pending=list(nextContext)
 while pending:
  x=pending.pop()
  for y in nextEdges[x]:
   if y not in nextContext:nextContext.add(y);nextEdges[y]=list(new[y].get('requires',[]));pending.append(y)
 addedContext=nextContext-context-{N}
 if addedContext:assert addedContext=={O},(s['scope'],addedContext);assert E in p and O not in T
 needed=closure(nextEdges,newP);uncovered=newT-needed;ends={x for x in uncovered if not any(x in vs for vs in nextEdges.values())}
 closed=T-oldNeeded-uncovered;addedNeeded=needed-oldNeeded;removedNeeded=oldNeeded-needed
 assert not removedNeeded,(s['scope'],'M0 demand loss',sorted(removedNeeded));assert not(uncovered-(T-oldNeeded)),(s['scope'],'new uncovered targets');assert p<=newP and T<=newT and context<=nextContext
 newRChanges={x:{'before':edges.get(x),'after':nextEdges[x]}for x in nextEdges if x in edges and nextEdges[x]!=edges[x]};assert set(newRChanges)<= {O,E}
 # Global partial-mastery effects are computed separately from M0: master all other protected targets plus ed5.
 scenarios=[]
 if E in p:
  M=(newP-{E})|{'ed5d869b-af4e-4b80-b34d-a2338e16ce34'};a=closure(edges,p,M);b=closure(nextEdges,newP,M);assert a=={E};assert b=={E,O,'075f1ef2-6860-4b20-9df2-878157eb395e','f242a3e8-55a3-492e-8354-b81b24cdbb78','19f170e4-b88f-4c06-b72a-ce6923748bb4','71cec9fb-3751-4d61-8b34-c5adbbf6e5f2','25593605-5e13-55cc-9a05-8f3d737e15e9','65365dce-f33f-49d8-9516-42f75883aa86'}
  assert closure(nextEdges,newP,M|{O})=={E};assert closure(nextEdges,newP,M|{E})==set()
  uncorrected=deepcopy(nextEdges);uncorrected[O]=list(old[O]['requires']);broad=closure(uncorrected,newP,M);assert len(broad)==18
  scenarios.append({'masteredState':'all other protected targets + ed5; ordinary preparation unmastered','beforeNeeded':sorted(a),'correctedAfterNeeded':sorted(b),'uncorrectedCounterfactualNeeded':sorted(broad),'withAdditional574MasteryNeeded':[E],'withE3MasteryNeeded':[],'masteryWrites':0});counts['e3PartialMasteryScopes']+=1
 # For each newly protected same-ID goal, mastering every other protected target does not discharge this assessment.
 for x in sorted(addedSame):
  M=newP-{x};q=closure(nextEdges,newP,M);assert x in q;assert closure(nextEdges,newP,M|{x})==set();scenarios.append({'assessmentId':x,'allOtherProtectedTargetsMasteredStillRequiresOwnMastery':True,'remainingPreparationDemand':sorted(q),'ownMasteryEndsOutgoingPreparationDemand':True,'masteryTransfer':False})
 if N in newP:
  M=newP-{N};q=closure(nextEdges,newP,M);assert N in q and O in q;assert set(new[N]['requires'])<=q;assert closure(nextEdges,newP,M|{N})==set();scenarios.append({'assessmentId':N,'allOtherProtectedTargetsMasteredStillRequiresOwnMastery':True,'remainingPreparationDemand':sorted(q),'ordinary574MasteryAloneDoesNotMasterExam':N in closure(nextEdges,newP,{O}),'examMasteryDoesNotWrite574OrParameterLineMastery':True,'masteryWrites':0})
 row={'scope':s['scope'],'compositionViewIds':s['compositionViewIds'],'newSameIdProtectedTargetGoalIds':sorted(addedSame),'newSeparateTargetGoalIds':[N]if N in newT else[],'retainedExistingTargets':len(T),'removedExistingTargets':[],'oldContextCount':len(context),'newContextCount':len(nextContext),'addedOrdinarySupportContextGoalIds':sorted(addedContext),'scopeContextIncreaseIsNotTargetOrMastery':bool(addedContext),'removedContextGoalIds':[],'oldProtectedCount':len(p),'newProtectedCount':len(newP),'oldUncoveredTargets':len(T-oldNeeded),'finiteNewUncoveredTargets':len(uncovered),'closedRequiredWorkTargetGoalIds':sorted(closed),'closedRequiredWorkEndpointGoalIds':sorted(oldEnds-ends),'newUncoveredEndpointGoalIds':sorted(ends-oldEnds),'finiteRemainingUncoveredEndpointGoalIds':sorted(ends),'addedM0DemandGoalIds':sorted(addedNeeded),'removedM0DemandGoalIds':sorted(removedNeeded),'exactDirectRelationDeltas':newRChanges,'rawPOnlyDeltas':[],'allExistingRConsumersPreservedWhole':True,'partialMasteryScenarioCount':len(scenarios)}
 allRows.append(row);partial.append({'scope':s['scope'],'scenarios':scenarios});counts.update({'scopes':1,'newSameIdProtectedTargetPairs':len(addedSame),'newSeparateTargetPairs':int(N in newT),'addedOrdinarySupportContextPairs':len(addedContext),'closedRequiredWorkTargetPairs':len(closed),'closedRequiredWorkEndpointPairs':len(oldEnds-ends),'newUncoveredEndpointPairs':len(ends-oldEnds),'remainingUncoveredEndpointPairs':len(ends),'m0RequiredWorkTargetLosses':len(removedNeeded&T)})
assert counts['newSameIdProtectedTargetPairs']==52;assert counts['newSeparateTargetPairs']==4;assert counts['addedOrdinarySupportContextPairs']==120;assert counts['e3PartialMasteryScopes']==132
consumers=[{'goalId':g['id'],'requires':g.get('requires',[]),'wholeGoalRetained':g['id']not in changed}for g in old.values()if any(x in g.get('requires',[])for x in old[O]['requires'])]
result={'status':'EXACT_G3_NATIVE161_BASELINE_PLUS_FINAL_AUTHORING_FINITE_DERIVATION_NOT_FRESH_NATIVE','baseNative':cfg['baseNative'],'baseCanonical':{'path':cfg['canonicalPath'],'sha256':sha(B/cfg['canonicalPath'])},'finalCanonical':{'path':cfg['canonicalPath'],'sha256':sha(C/cfg['canonicalPath'])},'counts':dict(counts),'scopeRows':allRows,'actualAll147RoleComparisons':'all-view-roles.actual.json','allRequiresAndContainsAcyclic':True,'old807IdentitiesAndCurricularKindsRetained':True,'noExistingTargetScopePOnlyOrEndpointObligationRemoved':True,'existingTargetAndContextSetsPreserved':True,'existingOtherConsumersOfRemovedOverbroad574Requirements':consumers,'partialMastery':'partial-mastery.actual.json','masteryWrites':0,'freshNative':False,'stageApproval':False,'remainingDebtNotClaimedSolved':True}
(H/'161-scope-finite-delta.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');(H/'partial-mastery.actual.json').write_text(json.dumps({'status':'FINITE_EXACT_DIRECT_EDGE_BINARY_MASTERY_CUTS_NOT_RUNTIME_MEASUREMENT','baseNative':cfg['baseNative'],'scopeRows':partial,'normalFocusBoundary':'Only effective prerequisites inside selected focus block the normal frontier; outside-focus Support does not block.','strictModeBoundary':'Actual global preparation R includes 574 after ed5 mastery; no prerequisite mastery inferred.','intentionalDirectAssessmentAttempt':'Existing explicit direct assessment access remains a separate runtime contract; production code is unchanged.','runtimeCallsPerformed':False,'masteryWrites':0},ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':result['status'],'counts':dict(counts)}))
