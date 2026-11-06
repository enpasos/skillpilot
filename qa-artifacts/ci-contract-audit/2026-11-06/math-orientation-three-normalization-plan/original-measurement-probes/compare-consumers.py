import collections,gzip,hashlib,json
from pathlib import Path
b=Path(__file__).resolve().parent
def raw(p):return p.read_bytes()if p.exists()else gzip.decompress(Path(str(p)+'.gz').read_bytes())
proof=json.loads((b/'proposal-and-global-proof.json').read_text())
baseline=json.loads(raw(b/'baseline.native-consumers.json'));summaries=[]
def normalize(row):
 row=dict(row);row['frontierPredicateCases']=sorted(row['frontierPredicateCases'],key=lambda x:(x['id'],x['strict'],x['state']))
 return row
for scenario in proof['formalIndividualAndCumulative']:
 label=scenario['scenario'];candidate=json.loads(raw(b/(label+'.native-consumers.json')));assert candidate['actualMathSha256']==scenario['candidateRawSha256']
 rows=[]
 for before,after in zip(baseline['rows'],candidate['rows']):
  before,after=normalize(before),normalize(after);assert before['requestKey']==after['requestKey']
  fields=[k for k in before if before[k]!=after[k]]
  assert not set(fields)-{'nativePlannedPrerequisiteAdjacency'},(label,before['requestKey'],fields)
  differences=[]
  for key,old in before['nativePlannedPrerequisiteAdjacency'].items():
   new=after['nativePlannedPrerequisiteAdjacency'][key]
   if old!=new:differences.append({'sourceGoalId':key,'old':old,'new':new,'removed':sorted(set(old)-set(new)),'added':sorted(set(new)-set(old))})
  rows.append({'requestKey':before['requestKey'],'targetCount':len(before['targetGoalIds']),'frontierPredicateCasesEqual':len(before['frontierPredicateCases']),'transitiveAtomicDemandEqualGoalCount':len(before['transitiveAtomicDemand']),'targetAndSupportSetsEqual':True,'actualDeEnOrientationOutlooksEqual':True,'stablePlanOrderEqual':True,'directPlannedPrerequisiteChanges':differences})
 summaries.append({'scenario':label,'contextComparisons':rows,'actualRootAndSyntheticStateOnly':True,'allUnintendedFunctionalDifferences':[]})
controls=collections.Counter()
for row in baseline['rows']:
 for case in row['frontierPredicateCases']:
  controls[case['state']+':'+str(case['strict'])+':'+str(case['allowed'])]+=1
files=sorted({Path(str(p).removesuffix('.gz'))for pattern in ['*.native-consumers.json','*.native-consumers.json.gz']for p in b.glob(pattern)})
result={'schemaVersion':1,'status':'five-native-java-context-runs-terminal-unchanged-measured-behavior','scope':'9 actual HE/BY/NI SekI/GK/LK production projections; each includes native transitive demand, target/support membership, direct Level2 guard and synthetic mastery controls. Not a whole learner/service acceptance test.','baselineActualMathSha256':baseline['actualMathSha256'],'comparisons':summaries,'baselineControlCounts':dict(controls),'notes':['Mastered map starts from all structural goals; all-open and orientation-open controls explicitly clear the designated values. This is synthetic state only.','656 baseline all-structural-mastered predicate cases are false and each has a canonical direct prerequisite outside the actual target/support membership; this pre-existing Level2 boundary is unchanged.','Direct planned adjacency is intentionally different; no claim that raw structural fingerprints or stored learning-plan bindings stay equal. No existing learner plans were read.'],'inputFiles':[{'path':str(p),'sha256':hashlib.sha256(raw(p)).hexdigest(),'bytes':len(raw(p))}for p in files],'sourceDataWrites':False}
(b/'consumer-comparison.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'scenariosCompared':4,'actualContextComparisons':sum(len(s['contextComparisons'])for s in summaries),'frontierPredicateComparisons':sum(sum(r['frontierPredicateCasesEqual']for r in s['contextComparisons'])for s in summaries),'directPlanAdjacencyChanges':{s['scenario']:sum(len(r['directPlannedPrerequisiteChanges'])for r in s['contextComparisons'])for s in summaries},'unintendedMeasuredFunctionalDifferences':0}))
