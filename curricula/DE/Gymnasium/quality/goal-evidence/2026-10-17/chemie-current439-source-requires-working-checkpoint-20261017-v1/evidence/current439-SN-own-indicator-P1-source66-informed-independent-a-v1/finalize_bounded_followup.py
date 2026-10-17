from pathlib import Path
import json,hashlib,datetime,os
OUT=Path(__file__).parent
FIRST=OUT/'FIRST.SN-own-indicator-P1-and-source66.scientific-findings.sealed.json'
FIRST_SHA='a86c10d3bbb267931020b43280653639c5a9151e7a579b950171129370360ae7'
def pin(path):
 p=Path(path); raw=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
def load(path):return json.loads(Path(path).read_text())
def write_new(name,obj):
 p=OUT/name; assert not p.exists();p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');os.chmod(p,0o444);return pin(p)
def canonsha(obj):return hashlib.sha256(json.dumps(obj,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
assert pin(FIRST)['sha256']==FIRST_SHA
f=load(FIRST);ps,ss=[load(x['path']) for x in f['inputSelectors']];base=Path(f['inputSelectors'][0]['path']).parent
# Only the actually scoped scientific inputs. Never follow historical review pointers.
expected=f['inputSelectors']+ps['scientificInputs']+[ps['currentP1'],ps['currentCanonical']]+ps['actualOriginalVisualization']+[ss['candidate'],ss['originalPrimary'],ss['previousWholeSource'],f['inputScope']['currentPAggregateForOnlyP13d4AndP416Bodies']]
unique={x['path']:x for x in expected}; guards=[]
for x in unique.values():
 y=pin(x['path']);guards.append({'expected':x,'actual':y,'pass':x==y})
assert all(x['pass'] for x in guards)
profile=load(base/'science/candidate/P1.successor.whole-profile.body.json');wrapper=load(base/'P1.current-SN-indicator.author-candidate.jsonl')
cases=[load(base/f'science/candidate/CASE-{i}.complete.operative.json') for i in (1,2)]
aggregatePath=f['inputScope']['currentPAggregateForOnlyP13d4AndP416Bodies']['path']
# No metadata/opinion fields are exposed or used from this aggregate.
selectedProfiles={d['goalId']:d['profile'] for l in Path(aggregatePath).read_text().splitlines() for d in [json.loads(l)] if d.get('goalId') in [ps['goalId'],'13d4f336-ab16-54a7-9479-c920b458f385','416dfd33-8b43-5c49-903c-9847b95e4208']}
assert wrapper['profile']==profile
assert selectedProfiles[ps['goalId']]==profile
assert [x['case'] for x in cases]==profile['applicationCaseBriefs']
raw=load(base/'science/candidate/RAW-OBSERVATIONS.unperformed.template.json')
# Read the current selected goal only; do not use canonical gate metadata.
current=load(ps['currentCanonical']['path']); archive=load(base/'science/archive/current-goal.whole.exact-structure.json')
goals=current['goals'];actualGoal=next(x for x in goals if x['id']==ps['goalId'])
assert archive==actualGoal
prior=load(ss['previousWholeSource']['path']);candidate=load(ss['candidate']['path']);idx=66
assert len(prior['sourceGoals'])==len(candidate['sourceGoals'])==176
otherExact=[i for i,(a,b) in enumerate(zip(prior['sourceGoals'],candidate['sourceGoals'])) if i!=idx and a==b]
assert len(otherExact)==175
assert all(a['text']==b['text'] for a,b in zip(prior['passages'],candidate['passages']))
assert len(prior['passages'])==len(candidate['passages'])==28
rootOther={k:v for k,v in prior.items() if k not in ('sourceGoals','passages')}
assert rootOther=={k:v for k,v in candidate.items() if k not in ('sourceGoals','passages')}
passageidx=next(i for i,p in enumerate(candidate['passages']) if p['id']==candidate['sourceGoals'][idx]['passageId'])
assert passageidx==10
pp=prior['passages'][passageidx];cp=candidate['passages'][passageidx]
trimmed=json.loads(json.dumps(cp));del trimmed['metadata']['currentSourceCellQualification'];assert trimmed==pp
assert all(a==b for i,(a,b) in enumerate(zip(prior['passages'],candidate['passages'])) if i!=passageidx)
assert all(prior['sourceGoals'][idx][k]==candidate['sourceGoals'][idx][k] for k in ('id','passageId','topicCode','bulletIndex','aspectIndex','courseLevel','granularity','tags','rawSourceText','rawSourceSpan','rawParentBulletText'))

def diff(a,b,path=''):
 if type(a)!=type(b):return [path]
 if isinstance(a,dict):
  r=[]
  for k in sorted(a.keys()|b.keys()):r.extend([path+'/'+k] if k not in a or k not in b else diff(a[k],b[k],path+'/'+k))
  return r
 if isinstance(a,list):
  if len(a)!=len(b):return [path+'/length']
  return [z for i,(x,y) in enumerate(zip(a,b)) for z in diff(x,y,path+'/'+str(i))]
 return [] if a==b else [path]
sourceDiff=diff(prior,candidate)
assert len(sourceDiff)==11
assert all(x.startswith('/sourceGoals/66/') or x=='/passages/10/metadata/currentSourceCellQualification' for x in sourceDiff)
records=[
 {'recordKind':'informed-prospective-P-scientific-review-candidate','recordId':'sn-own-indicator-P1-informed-A-20261017-v1','reviewerRole':'independent A; informed followup','goalId':ps['goalId'],'verdict':f['P1']['verdict'],'evidenceLevel':'E1','maximumClaimScope':'G1','FIRST':pin(FIRST),'inputProfile':pin(base/'science/candidate/P1.successor.whole-profile.body.json'),'inputCurrentPRecord':ps['currentP1'],'findings':f['P1']['findings'],'prerequisiteContextObservation':f['prerequisiteContextObservation'],'authoritativeApproval':False,'performedPracticalEvidence':False,'humanApproval':False,'DReviewPerformed':False},
 {'recordKind':'informed-bounded-source-cell-qualification-review-candidate','recordId':'sn-source66-left-right-informed-A-20261017-v1','reviewerRole':'independent A; informed followup','sourceGoalId':ss['sourceGoalId'],'sourceGoalIndex':66,'verdict':f['Source66']['verdict'],'evidenceLevel':'E1','maximumClaimScope':'G1','FIRST':pin(FIRST),'sourceCandidate':ss['candidate'],'originalPrimary':ss['originalPrimary'],'findings':f['Source66']['findings'],'sourceUnionVerdict':'OPEN','canonicalMappingAcceptance':False,'performedPracticalEvidence':False,'humanApproval':False,'DReviewPerformed':False}
]
rec=OUT/'RESULTS.SN-P1-and-source66.informed-independent-A.jsonl';assert not rec.exists();rec.write_text(''.join(json.dumps(x,ensure_ascii=False,separators=(',',':'))+'\n' for x in records));os.chmod(rec,0o444)
parsed=[json.loads(x) for x in rec.read_text().splitlines()];assert parsed==records and len(parsed)==2
assert {x['recordId'] for x in parsed}=={'sn-own-indicator-P1-informed-A-20261017-v1','sn-source66-left-right-informed-A-20261017-v1'}
assert all(x['evidenceLevel']=='E1' and x['maximumClaimScope']=='G1' and x['humanApproval'] is False and x['DReviewPerformed'] is False for x in parsed)
receipt=write_new('CHECKS.only-bounded-output-and-exact-inputs.sealed.json',{
 'kind':'bounded technical checks after scientific FIRST','checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'FIRST':pin(FIRST),'allPassed':True,'inputGuardCount':len(guards),'inputGuards':guards,
 'currentGoalArchiveEqualsExactCurrentCanonicalObject':True,'exactCurrentPWrapperBodyEqualsWholeScientificProfile':True,'exactCurrentP439SelectedBodyEqualsWholeScientificProfile':True,'bothWholeOperativeCaseBodiesEqualExactCurrentProfileCases':True,
 'scientificCaseCount':2,'sourceGoalCount':176,'sourceGoalsOther175WholeObjectsExact':True,'sourceGoal66RetainedIdentityScopeAndHistoricalRawFieldsExact':True,'all28PassageTextValuesExact':True,'other27WholePassageObjectsExact':True,'affectedPassageExceptOnlyNewQualificationMetadataExact':True,'allOtherRootValuesExact':True,'sourceDifferencePaths':sourceDiff,
 'selectedPrerequisiteProfileValueDigests':{k:{'sha256SortedCompactJson':canonsha(v),'basis':'only profile value, not review metadata'} for k,v in selectedProfiles.items() if k!=ps['goalId']},
 'outputRecordCount':len(parsed),'outputRecordIds':[x['recordId'] for x in parsed],'completeJSONLParses':True,'nativeBlindDRecordsOrManifestsEmitted':0,'fullCentralOrGlobalBuildsRun':False,'stockNativeDValidation':'Not applicable: parent explicitly excluded D review and blind manifests. No stock D validator or native D availability claim. These are informed scientific candidate findings, not authoritative native P/source gate records.','scientificFIRSTUnchanged':pin(FIRST)['sha256']==FIRST_SHA,
 'guardingLimitation':'Input hashes and equality checks preserve exact scope only. Scientific judgments come from FIRST and actual material reading, not fingerprints.'})
inspection=[]
for name in ['SN62-4.png','SN62-24.png','SDB0965-1.png']:
 inspection.append(pin(OUT/'inspection'/name))
readReceipt=write_new('INSPECTION.actual-materials-read.sealed.json',{'kind':'actual reading receipt, no fabricated performance','FIRST':pin(FIRST),'actuallyInspected':f['actuallyInspected'],'renderedLocalPagesActuallyViewed':inspection,'retainedOriginalPNGActuallyViewed':ps['actualOriginalVisualization'][0],'officialWebPrimaryReadReceipt':f['independentPrimaryWebReadReceipt'],'noManufacturerComparisonChartVisualInspectionClaimed':True,'localWholePDFTextExtractionIsInspectionScratchOnly':True})
sel=write_new('SELECTOR.SN-P1-source66-informed-independent-A.sealed.json',{
 'kind':'finite informed independent A scientific followup output selector','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'FIRST':pin(FIRST),'results':pin(rec),'checks':receipt,'inspectionReceipt':readReceipt,
 'recordIds':[x['recordId'] for x in parsed],'inputs':f['inputSelectors'],'decisions':{'P1':f['P1']['verdict'],'Source66':f['Source66']['verdict'],'wholeMappedSourceUnion':'OPEN; not reviewed','canonicalMapping':'OPEN; no credit inferred','D':'No review and no result/run manifest','actualSchoolSafetyRelease':False,'actualLearnerPerformance':False,'humanApproval':False,'globalM7CompletionClaimed':False},
 'inputScope':'Exact current P1 plus both complete cases/materials/raw template, current whole goal/retained image, actual original source pages and one source-cell qualification; selected current safety/method prerequisite P values only for bounded context relevance.',
 'technicalOnly':{'resultRecords':2,'sourceRowsReviewed':1,'PProfilesReviewed':1,'inputGuards':len(guards),'allPassed':True,'nativeBlindDManifests':0,'inputMainKSourceMutations':0},'FIRSTSealedBeforeTechnicalSerialization':True,'bounds':'Only prospective E1/G1 machine candidates. Full D/P/A/M/V intersection, effective prerequisite graph, actual school readiness, source unions/mappings, human approval and performed practical attainment remain separate.'})
assert pin(FIRST)['sha256']==FIRST_SHA
print(json.dumps(sel,ensure_ascii=False));print('PASS: exact inputs, P/cases equality, source-only one-row+qualification delta, two complete parsed informed records. No D manifests.')
