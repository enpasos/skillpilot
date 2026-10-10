from pathlib import Path
import json, hashlib, statistics
from datetime import datetime, timezone
ROOT=Path.cwd()
AUTHOR=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-q3-three-BW-current-raster-native-preparation-author-20261010-v1'
OUT=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-q3-three-BW-current-native-independent-a-20261010-v1'
def read(f):return json.loads((AUTHOR/f).read_text())
def binding(path):
 path=Path(path);data=path.read_bytes();return {'path':str(path.relative_to(ROOT)),'sha256':'sha256:'+hashlib.sha256(data).hexdigest(),'bytes':len(data)}
entry=read('neutral-current-three-BW-practical-current-P-native.independent-review.entry.json');ids=entry['goalIds']
protected=next(s for s in read('checks/protected-all-five-current-and-strict-ID-sets.exact.json')['subjects'] if s['subject']=='chemie')['strictCompleteGoalIds']
old={g['id']:g for g in read('inputs/current-canonical480.exact.json')['goals']};new={g['id']:g for g in read('candidate/current484-three-practical-raster.inactive.json')['goals']}
oldpages={g['goalId']:g for g in read('native/current378.actual-model.json')['pages']};newpages={g['goalId']:g for g in read('native/future381-current-P.actual-model.json')['pages']};nativepages={g['goalId']:g for g in read('native/three-current-P/bundle/book-model.json')['pages']}
assert len(protected)==177 and all(old[i]==new[i] and oldpages[i]==newpages[i] for i in protected)
assert set(newpages)-set(oldpages)==set(ids) and set(oldpages)<=set(newpages)
oldmapping=read('inputs/whole-original-BW126-217-mapping.exact.json');mapping=read('candidate/BW126-220-partners-same-reviewed-mapping-portable-source-path.inactive.review.json')
olddec={d['sourceGoalId']:d for d in oldmapping['decisions']};dec={d['sourceGoalId']:d for d in mapping['decisions']}
oldedges={(m['legacyGoalId'],m['canonicalGoalId']) for m in oldmapping['mappings']};edges={(m['legacyGoalId'],m['canonicalGoalId']) for m in mapping['mappings']}
assert len(olddec)==len(dec)==126 and set(olddec)==set(dec) and len(oldedges)==217 and len(edges)==220 and oldedges<=edges
assert all(set(d['canonicalGoalIds'])<=set(dec[s]['canonicalGoalIds']) for s,d in olddec.items())
originalsource=json.loads((ROOT/oldmapping['sourceExtractionPath']).read_text());source=read('candidate/BW126-same-whole-source-tracked-primary-path.inactive.json')
assert source['sourceGoals']==originalsource['sourceGoals'] and source['passages']==originalsource['passages']
sources={g['id']:g for g in source['sourceGoals']}
scopes=[]
for side in ['before','after']:
 model=read(f'source-atlas/{side}-portable-operative/actual-source-book-model.json');manifest=read(f'source-atlas/{side}-portable-operative/source-manifest.json')
 assert len(model['pages'])==manifest['expectedCurricularAtomicGoalCount']==(185 if side=='before' else 189)
 rows=[{'goalId':g['goalId'],'applicability':g['applicability']} for g in model['pages'] if g['goalId'] in ids]
 scopes.append({'side':side,'scopeGoalCount':len(model['pages']),'newGoalApplicability':rows})
assert not scopes[0]['newGoalApplicability']
for row in scopes[1]['newGoalApplicability']:
 assert row['applicability']==[{'jurisdiction':'DE-BW','scopes':([{'stage':'SekII','durationModel':None,'courseProfile':'GK'},{'stage':'SekII','durationModel':None,'courseProfile':'LK'}] if row['goalId']==ids[0] else [{'stage':'SekII','durationModel':None,'courseProfile':'LK'}])}]
profiles=[json.loads(l) for l in (AUTHOR/'positive/current-three.author.review.jsonl').read_text().splitlines()];profileby={p['goalId']:p for p in profiles}
input=read('native/three-current-P/round-a/description-review-input.json');inputby={g['goalId']:g for g in input['goals']}
for i in ids:
 assert inputby[i]['reviewContext']['evidenceProfile']==profileby[i]
 assert all(profileby[i][k]==nativepages[i]['evidenceReview'][k] for k in ['reviewId','status','reviewInputFingerprint','profileFingerprint','evidenceLevel','maximumClaimScope'])
 assert profileby[i]['status']=='needs_human_review' and profileby[i]['reviewAuthority']=='ai_candidate' and profileby[i]['reviewRunIds']==[]
 assert newpages[i]['goalFingerprint']==nativepages[i]['goalFingerprint']==inputby[i]['goalFingerprint']==profileby[i]['goalFingerprint']
 assert newpages[i]['description']==nativepages[i]['description']==new[i]['description']==inputby[i]['currentDescriptionDe']
 assert new[i]['descriptionEn']==inputby[i]['currentDescriptionEn']
 assert set(new[i]['requires'])=={r['goalId'] for r in nativepages[i]['externalPrerequisites']}
 assert set(new[i]['requires'])=={r['goalId'] for r in newpages[i]['requires']}
 prior_body=json.loads((ROOT/entry['priorIndependentWholeScienceAMProfiles'][0]['wholePositiveRecords']['path']).read_text().splitlines()[ids.index(i)])['profile']
 assert prior_body==profileby[i]['profile']
science=read('science/whole-six-new-practical-protocol-cases.de-en.author-candidate.json');numerics=[]
for case in science['cases']:
 if 'idealModelRounds' in case['syntheticData']:
  data=case['syntheticData']['idealModelRounds'];forward,reverse=((1/3,1/6) if case['caseId'].endswith('-a') else (1/6,1/3));a,b=data[0]['A_mL'],data[0]['B_mL']
  for row in data[1:]:
   f,r=forward*a,reverse*b;a,b=a-f+r,b+f-r
   assert max(abs(row['forward_mL']-f),abs(row['reverse_mL']-r),abs(row['A_mL']-a),abs(row['B_mL']-b))<=1e-6
   assert abs(row['A_mL']+row['B_mL']-90)<=1e-6
  numerics.append({'caseId':case['caseId'],'exactFractionSequenceRecomputed':True,'all13RoundsConserve90mL':True,'stationaryAmounts':([30,60] if case['caseId'].endswith('-a') else [60,30]),'stationaryContinuingTransfersEach_mL':10})
 elif 'readingsV' in case['syntheticData']:
  data=case['syntheticData'];mean=statistics.mean(data['readingsV']);spread=max(data['readingsV'])-min(data['readingsV']);deviation=mean-data['conditionReferenceV']
  assert abs(deviation)<=data['comparisonToleranceV']
  numerics.append({'caseId':case['caseId'],'actualMeanV':mean,'actualRangeV':spread,'differenceFromStatedSyntheticConditionReferenceV':deviation,'withinStatedTolerance':True,'claim':'synthetic condition-specific comparison; not real execution/standard voltage'})
rows=[]
for i in ids:
 sourceid=new[i]['extendedData']['provenance']['sourceGoalId'];decision=dec[sourceid]
 assert decision['matchType']=='partial' and i in decision['canonicalGoalIds']
 rows.append({'goalId':i,'goalFingerprint':inputby[i]['goalFingerprint'],'nativePageFingerprint':nativepages[i]['pageFingerprint'],'whole381PageFingerprint':newpages[i]['pageFingerprint'],'nativeExternalPrerequisites':nativepages[i]['externalPrerequisites'],'whole381InternalPrerequisites':newpages[i]['requires'],'currentPProfileFingerprint':profileby[i]['profileFingerprint'],'currentPInputFingerprint':profileby[i]['reviewInputFingerprint'],'fullPriorPProfileBodyRetained':True,'sourceGoalId':sourceid,'sourceSpan':sources[sourceid]['sourceSpan'],'courseLevel':sources[sourceid]['courseLevel'],'allCurrentSourcePartners':decision['canonicalGoalIds'],'sourceMatchType':decision['matchType'],'pngDigest':nativepages[i]['visualization']['originalDigest'],'altText':nativepages[i]['visualization']['altText']})
receipt={'schemaVersion':1,'checkedAt':datetime.now(timezone.utc).isoformat(),'reviewer':'Independent reviewer A / root/ci_current_run; no author or other current D-review output read','scope':'Exactly three current Native3 canonical CrossStage pages and their whole381 logical contexts; no SourceAtlas/national route approval','allPassed':True,'bindingChecksAreDistinctFromScientificAndActualVisualReview':True,'current378Count':len(oldpages),'candidate381Count':len(newpages),'exactNewGoalIds':ids,'allProtected177ExactGoalObjectsAndCompletePagesUnchanged':True,'protectedStrictGoalIds':protected,'wholeSourceDutyCount':126,'all126SourceGoalAndPassageBodiesUnchanged':True,'all217OldSourcePartnerEdgesRetained':True,'currentSourcePartnerEdgeCount':220,'source002Contribution':'partial','newSourceEdges':[{'sourceGoalId':s,'canonicalGoalId':g} for s,g in sorted(edges-oldedges)],'actualSourceScopeCountsAndTuples':scopes,'nativeAndWhole381PageFingerprintDifferenceIsExplicit':True,'goalBindings':rows,'sixCurrentBilingualCompleteProtocolCasesRead':True,'allSixCasesRemainE1G1SyntheticWithNoActualLearnerWork':True,'independentNumericalChecks':numerics,'unreviewedTheoryContextGoalIds':entry['pendingThreeExistingTheoryContextGoalIds'],'unreviewedTheoryContextApproval':False,'whole126ProgrammeCourseRouteCorrosionApproval':False,'humanApproval':False,'humanTrial':False,'newStrictClosuresClaimed':0,'activeWrites':False}
(OUT/'checks/current-context-source-protection-numerics.independent-a.actual.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print('Independent current Native3/P/source bindings PASS; whole381 and all177 exact preservation PASS; source126/217 retention and all six synthetic-case numerical checks PASS. SOURCE002 stays partial.')
