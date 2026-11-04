from pathlib import Path
import json,gzip,functools,collections
F=Path(__file__).resolve().parent;H=F.parent;R=F.parents[2]
C=H/'geometry-four-projection-reuse-integration-20261104-v1/check-host'
canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
old={x['id']:x for x in json.loads((R/canonical).read_text())['goals']}
new={x['id']:x for x in json.loads((C/canonical).read_text())['goals']}
def normalizer(goals):
 parents={i:set() for i in goals}
 for i,g in goals.items():
  for ch in g.get('contains',[]):parents[ch].add(i)
 @functools.cache
 def inherited(i):return set(goals[i].get('requires',[])).union(*(inherited(p) for p in parents[i]))
 @functools.cache
 def atoms(i):return set().union(*(atoms(x) for x in goals[i]['contains'])) if goals[i].get('contains') else {i}
 @functools.cache
 def direct(i):return set().union(*(atoms(x) for x in inherited(i)))
 return direct
od=normalizer(old);nd=normalizer(new)
def closure(roots,direct,mastered=set()):
 out=set();todo=list(roots)
 while todo:
  x=todo.pop()
  if x in out or x in mastered:continue
  out.add(x);todo.extend(direct(x))
 return out
native=json.load(gzip.open(H/'statistics-pyramid-existing-route-native-20261104-v1/candidate.json.gz','rt'))
roles={x['scope']:x for x in json.loads((F/'all-view-roles.actual.json').read_text())['scopeRows']}
same={'803d910d-96d1-5118-b9ca-29e93d0da76d','d3c42193-f1b7-5c6d-a991-bf034d99359f','7bb3c312-f714-55e6-a31f-f31605a93760'}
newid='dd1954f6-0941-55a9-88d2-e2980ed902fd';o='5748633c-113f-5ea8-9041-24da55919de7';e='e3c70a12-7886-51f7-8bcd-ed54865415d6';ed='ed5d869b-af4e-4b80-b34d-a2338e16ce34'
rows=[];counts=collections.Counter()
for s in native['scopes']:
 T=set(s['targetGoalIds']);P=set(s['selectedProtectedTargetGoalIds']);Ctx=set(s['contextGoalIds']);before=closure(P,od)
 assert before==set(s['neededContextGoalIdsAtM0'])
 for i,rs in s['effectiveDirectPrerequisitesByContextGoalId'].items():assert od(i)==set(rs),(s['scope'],i)
 # Actual context follows targets and needed global preparation. Authored
 # POnly references are support eligibility, not independent context roots.
 oldContextFromTargets=closure(T,od)
 assert oldContextFromTargets==Ctx,(s['scope'],'context',len(oldContextFromTargets^Ctx))
 NT=T|({newid} if roles[s['scope']]['newAssessmentTarget'] else set());NP=P|(T&same)|(NT&{newid})
 NC=closure(NT,nd);after=closure(NP,nd)
 assert not(before-after),(s['scope'],'M0 loss')
 assert not(Ctx-NC),(s['scope'],'context loss')
 uncovered=NT-after;oldU=T-before
 assert oldU==set(s['uncoveredTargetGoalIds']);assert not(uncovered-oldU)
 oldIncoming=set().union(*(od(i) for i in Ctx));newIncoming=set().union(*(nd(i) for i in NC))
 ends=uncovered-newIncoming;oldEnds=oldU-oldIncoming
 assert oldEnds==set(s['uncoveredEndpointGoalIds'])
 partial=None
 if e in P:
  M=(NP-{e})|{ed};b=closure(P,od,M);a=closure(NP,nd,M)
  assert b=={e} and len(a)==8 and {e,o}<=a
  assert closure(NP,nd,M|{o})=={e}
  assert not closure(NP,nd,M|{e})
  partial={'mastered':'all other protected targets plus ed5','beforeNeeded':sorted(b),'afterNeeded':sorted(a),'with574Mastery':[e],'withE3Mastery':[],'inferredMasteryWrites':0}
  counts['e3PartialMasteryScopes']+=1
 for x in NP-P:
  M=NP-{x};assert x in closure(NP,nd,M);assert not closure(NP,nd,M|{x})
 rows.append({'scope':s['scope'],'baselineDirectAndContextAndM0Verified':True,'newTargets':sorted(NT-T),'newProtectedTargets':sorted(NP-P),'newOrdinarySupportContext':sorted(NC-Ctx-{newid}),'lostContext':sorted(Ctx-NC),'closedTargetGaps':sorted(oldU-uncovered),'closedEndpointGaps':sorted(oldEnds-ends),'newEndpointGaps':sorted(ends-oldEnds),'m0DemandLost':sorted(before-after),'e3PartialMastery':partial})
 counts.update({'scopes':1,'sameIdNewProtectedPairs':len((NP-P)&same),'newSeparatePairs':len(NT-T),'addedOrdinaryContextPairs':len(NC-Ctx-{newid}),'closedTargetPairs':len(oldU-uncovered),'closedEndpointPairs':len(oldEnds-ends),'newEndpointPairs':len(ends-oldEnds),'remainingEndpointPairs':len(ends)})
out={'status':'INDEPENDENT_RECONSTRUCTION_FROM_ACTUAL_N3_AND_FINAL_NORMALIZED_CANONICAL_NOT_NATIVE4','algorithm':'Independently recomputed inherited and cluster-normalized R over both entire canonical graphs; verified every baseline Native direct edge, context closure and M0 fixed point. Actual production role helper gives the only four new target pairs. Final context is reconstructed anew, not retained by assertion.','counts':dict(counts),'rows':rows,'runtimeFrontierTestsPerformed':False,'masteryWrites':0,'stageApproval':False}
(F/'independent-161-scope-and-mastery.actual.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(out['counts']))
