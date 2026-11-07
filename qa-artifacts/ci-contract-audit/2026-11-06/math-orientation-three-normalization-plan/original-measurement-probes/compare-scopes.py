import collections,gzip,hashlib,json
from pathlib import Path
b=Path(__file__).resolve().parent
def load(p):return json.loads(p.read_bytes()if p.exists()else gzip.decompress(Path(str(p)+'.gz').read_bytes()))
proof=load(b/'proposal-and-global-proof.json');baseline=load(b/'baseline.native-scope.json');rows=[]
def finding_key(f):
 return (f['ruleId'],f.get('code'),f.get('landscapeId'),f.get('goalId'),f.get('message'))
baseFindings={finding_key(f):f for f in baseline['strictIntegrity']['findings']}
for scenario in proof['formalIndividualAndCumulative']:
 label=scenario['scenario'];p=b/(label+'.native-scope.json');candidate=load(p);assert candidate['sourceSha256']==scenario['candidateRawSha256']
 differences=[]
 for k in ['actualApplicability','nativeRouteScopes','views','catalogFiles','dataApplied','qaApprovalClaimed','roleAssignmentChangedByAnalysis','applicabilityMaterializedIntoSource','codeBindings']:
  if baseline[k]!=candidate[k]:differences.append(k)
 viewDiffs=[]
 assert len(baseline['views'])==len(candidate['views'])
 for before,after in zip(baseline['views'],candidate['views']):
  assert before['path']==after['path']
  changed=[k for k in before if before[k]!=after[k]]
  if changed:viewDiffs.append({'path':before['path'],'viewId':before['viewId'],'changedFields':changed,'changes':{k:{'before':before[k],'after':after[k]}for k in changed}})
 appDiff=[]
 allowedSourceIds={r['authoredOriginRemovedGlobally'].split(':')[-1]for r in scenario['steps']}
 a=baseline['actualApplicability']['info'];z=candidate['actualApplicability']['info']
 for before,after in zip(a['goals'],z['goals']):
  assert before['goalId']==after['goalId']
  if before!=after:
   oldEvidence={json.dumps(r,sort_keys=True):r for r in before['evidence']};newEvidence={json.dumps(r,sort_keys=True):r for r in after['evidence']}
   removedEvidence=[oldEvidence[k]for k in sorted(oldEvidence.keys()-newEvidence.keys())];addedEvidence=[newEvidence[k]for k in sorted(newEvidence.keys()-oldEvidence.keys())]
   appDiff.append({'goalId':before['goalId'],'changedFields':[k for k in before if before[k]!=after[k]],'compiledApplicabilityEqual':before['compiledApplicability']==after['compiledApplicability'],'removedDirectOriginEvidence':removedEvidence,'addedEvidence':addedEvidence})
 appFunctionallyEqual=all(a[k]==z[k]for k in a if k!='goals')and all({k:v for k,v in p.items()if k!='evidence'}=={k:v for k,v in q.items()if k!='evidence'}for p,q in zip(a['goals'],z['goals']))
 onlyReviewedOriginEvidenceRemoved=all(r['changedFields']==['evidence']and not r['addedEvidence']and all(e['kind']=='requires-closure'and e['source'].removeprefix('required by ')in allowedSourceIds for e in r['removedDirectOriginEvidence'])for r in appDiff)
 functionalDifferences=[k for k in differences if k!='actualApplicability']
 if 'actualApplicability'in differences and not(appFunctionallyEqual and onlyReviewedOriginEvidenceRemoved and baseline['actualApplicability']['foreignReports']==candidate['actualApplicability']['foreignReports']):functionalDifferences.append('actualApplicability')
 now={finding_key(f):f for f in candidate['strictIntegrity']['findings']};removed=[baseFindings[k]for k in sorted(baseFindings.keys()-now.keys())];added=[now[k]for k in sorted(now.keys()-baseFindings.keys())]
 expectedIds={r['authoredOriginRemovedGlobally'].split(':')[-1]for r in scenario['steps']};assert len(removed)==len(expectedIds);assert {r['goalId']for r in removed}==expectedIds;assert all(r['ruleId']=='G17'for r in removed);assert added==[]
 changedWitnesses=[{'goalId':now[k]['goalId'],'old':baseFindings[k].get('witness'),'new':now[k].get('witness')}for k in sorted(now.keys()&baseFindings.keys())if now[k].get('witness')!=baseFindings[k].get('witness')]
 strictSame=['ok','rootLandscapeIds','checkedGoalKeys','checkedRules']
 assert all(baseline['strictIntegrity'][k]==candidate['strictIntegrity'][k]for k in strictSame)
 rows.append({'scenario':label,'nativeViewsCompared':len(candidate['views']),'nativeRoutesCompared':len(candidate['nativeRouteScopes']),'allReportDifferenceFields':differences,'unexpectedBehaviorDifferenceFields':functionalDifferences,'viewDifferences':viewDiffs,'applicabilityGoalDifferences':appDiff,'compiledApplicabilityAndNonEvidenceMetadataEqual':appFunctionallyEqual,'onlyReviewedDirectOriginApplicabilityEvidenceRemoved':onlyReviewedOriginEvidenceRemoved,'nativeRouteResultsEqual':baseline['nativeRouteScopes']==candidate['nativeRouteScopes'],'foreignApplicabilityReportsEqual':baseline['actualApplicability']['foreignReports']==candidate['actualApplicability']['foreignReports'],'strictFindingsBefore':dict(collections.Counter(f['ruleId']for f in baseline['strictIntegrity']['findings'])),'strictFindingsAfter':dict(collections.Counter(f['ruleId']for f in candidate['strictIntegrity']['findings'])),'removedOnlyReviewedG17Findings':removed,'newStrictFindings':added,'retainedFindingWitnessChanges':changedWitnesses,'strictMetricsBefore':baseline['strictIntegrity']['metrics'],'strictMetricsAfter':candidate['strictIntegrity']['metrics'],'caseStatus':'hold-functional-delta-requires-separate-review'if functionalDifferences else'no-measured-functional-delta-direct-origin-evidence-change-is-explicit-independent-review-and-real-evidence-renewal-still-required'})
out={'schemaVersion':1,'status':'private-five-context-native-comparison-complete','baselineSource':proof['source'],'baselineViewCount':len(baseline['views']),'baselineRouteCount':len(baseline['nativeRouteScopes']),'comparisons':rows,'allMeasuredScopeApplicabilityValuesRouteViewBehaviorEqual':all(not r['unexpectedBehaviorDifferenceFields']for r in rows),'sourceOrQaWrites':False,'readinessClaimed':False}
(b/'scope-comparison.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'scenarios':len(rows),'viewsPerScenario':out['baselineViewCount'],'routesPerScenario':out['baselineRouteCount'],'equal':out['allMeasuredScopeApplicabilityValuesRouteViewBehaviorEqual']}))
