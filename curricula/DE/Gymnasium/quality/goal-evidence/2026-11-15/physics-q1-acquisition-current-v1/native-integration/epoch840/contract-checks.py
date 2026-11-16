from pathlib import Path
import json,hashlib,datetime
B=Path(__file__).parent;P=B.parent
rd=lambda p:json.loads(Path(p).read_text());sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
cp=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
basep=P/'canonical.809.before-install.json';base=rd(basep if basep.exists() else cp);c=rd(B/'canonical.candidate.json');old={g['id']:g for g in base['goals']};by={g['id']:g for g in c['goals']};ops=rd(B/'canonical-operations.json')
sources={g['id']:g for p in ['tmp/physics-q1-current-acquisition-20261115-v3/content-candidate.json','tmp/physics-seki-digital-acquisition-20261115-v1/content-candidate.json','tmp/physics-current10-neutral-P-context-20261115-v2/content-candidate.json'] for g in rd(p)['tasks']}
assert len(sources)==31
new=[]
for gid,source in sources.items():
 got=json.loads(json.dumps(by[gid]));assert got['examData']['reviewStatus']=='released'
 for field in ['phase','dimensionTags','applicability','extendedData']:
  if field in source:got[field]=source[field]
  else:got.pop(field,None)
 for field in ['coveredStrands','reviewStatus','reviewNote']:
  if field in source['examData']:got['examData'][field]=source['examData'][field]
  else:got['examData'].pop(field,None)
 assert got==source,gid
 new.append({'goalId':gid,'acceptedTaskContentContractIdentical':True,'phase':'GLOBAL','contentContractSha256':hashlib.sha256(json.dumps(source,sort_keys=True,ensure_ascii=False).encode()).hexdigest()})
history=[]
for gid in ops['historicalTaskIds']:
 before=old[gid];after=by[gid];assert after['examData']['coveredGoalIds']==[] and after['applicability']=={} and after['extendedData']['applicabilityProjection']=='excluded'
 for field in ['id','title','titleEn','description','descriptionEn','requires']:assert before.get(field)==after.get(field),(gid,field)
 for field in before['examData']:
  if field not in ['coveredGoalIds','reviewNote']:assert before['examData'][field]==after['examData'][field],(gid,field)
 history.append({'goalId':gid,'allIdTextSolutionScoringAndStatusValuesIdentical':True,'coverageWithdrawn':True,'ownApplicabilityExcluded':True})
catalog=[c if p==cp else rd(p) for p in sorted(Path('curricula/DE/Gymnasium/canonical').glob('*.json'))];allby={g['id']:g for x in catalog for g in x['goals']};closure=[]
def local(r):return r.split(':')[-1]
for gid in sources:
 seen=set();queue=[local(x) for x in by[gid]['requires']]
 for x in queue:
  if x in seen:continue
  seen.add(x);assert x in allby,x;queue.extend(local(r) for r in allby[x]['requires'])
 assert set(by[gid]['examData']['coveredGoalIds'])<=seen,gid
 closure.append({'goalId':gid,'wholeCoveredGoalsWithinActualRequiresClosure':True,'coverageGoals':by[gid]['examData']['coveredGoalIds'],'requiresClosureCount':len(seen)})
incoming=[{'sourceGoalId':g['id'],'target':local(r)} for cat in catalog for g in cat['goals'] for r in g.get('requires',[]) if local(r) in ops['historicalTaskIds']];assert not incoming
report={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'EXACT_CONTENT_AND_HISTORICAL_CONTRACTS_PRESERVED_NATIVE_CLOSURE_CHECKED','baseline':{'path':str(basep if basep.exists() else cp),'originalSourcePath':str(cp),'sha256':sha(basep if basep.exists() else cp)},'candidate':{'path':str(B/'canonical.candidate.json'),'sha256':sha(B/'canonical.candidate.json')},'catalogRoots':len(catalog),'newAcceptedContracts':new,'historicalContracts':history,'coverageClosure':closure,'incomingRequiresToHistoricalTasks':incoming,'learnerResultWrites':False,'sourceInputWrites':False,'noAssessmentReviewInferredFromMetadata':True}
(B/'final-contract-checks.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'newAcceptedContracts':len(new),'historicalPreserved':len(history),'coverageClosuresPass':len(closure),'historicalIncomingRequires':len(incoming),'canonicalSha':report['candidate']['sha256']}))
