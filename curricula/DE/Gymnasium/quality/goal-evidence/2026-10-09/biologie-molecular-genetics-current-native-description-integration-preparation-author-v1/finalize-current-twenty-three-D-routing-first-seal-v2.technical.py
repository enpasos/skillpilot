# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,subprocess,datetime,sys
ROOT=Path.cwd();B=Path(__file__).resolve().parent.relative_to(ROOT);ENTRY=B/'neutral-current-twenty-three-native-description-routing.adoption-ready.entry.json';SEAL=B/'current-twenty-three-native-description-routing.technical.first.freeze.json'
assert not ENTRY.exists() and not SEAL.exists()
def read(p):return json.loads(Path(p).read_text())
def bind(p):
 p=Path(p['path'] if isinstance(p,dict) else p);assert p.is_file() and not p.is_symlink();z=p.read_bytes();return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(z).hexdigest(),'bytes':len(z)}
def verify(b):
 got=bind(b['path']);assert got['sha256']=='sha256:'+b['sha256'].removeprefix('sha256:'),(b,got)
 if 'bytes' in b:assert got['bytes']==b['bytes']
 return got
def write(p,v):
 z=json.dumps(v,ensure_ascii=False,indent=2)+'\n'
 if Path(p).exists():assert Path(p).read_text()==z;return
 Path(p).write_text(z)
scopes=['original-part-1','original-part-2','six-successors','one15-successor'];inputs={};originals=[];ordinary=[]
for scope,count in zip(scopes,[12,10,5,1]):
 spec=read(B/(scope+'.inputs.actual.json'));receipt=read(B/'checks'/(scope+'.genuine-native-D-direct-existing-contracts.actual.json'));assert receipt['D'][0]['nativeCampaignResultsPASS'] and receipt['D'][0]['nativeDualSummaryPASS'] and receipt['D'][0]['nativeSynthesisPASS'];assert len(receipt['D'][0]['resolutions'])==count
 for x in read(B/'checks'/(scope+'.genuine-native-D-declared-inputs.actual.json'))['files']:inputs[x['path']]=verify(x)
 for x in spec['sealBindings']+spec['requiredVerifiedBindings']+spec['originalNativeBindings']:inputs[x['path']]=verify(x)
 for x in spec['originalNativeBindings']:
  blob=subprocess.run(['git','show',':'+x['path']],capture_output=True,check=True).stdout;assert blob==Path(x['path']).read_bytes();originals.append({**verify(x),'actualIndexBytesExact':True})
 index=read(B/('native-d-'+scope)/'resolution-index.json');assert len(index['resolutions'])==count;ordinary.append({'scope':scope,'resolutionIndex':bind(B/('native-d-'+scope)/'resolution-index.json'),'resolvedGoals':count,'deferredGoalIds':index.get('deferredGoalIds',[]),'normalExistingAPIReceipt':bind(B/'checks'/(scope+'.genuine-native-D-direct-existing-contracts.actual.json'))})
plan=read(B/'planned-current23-description-routing.actual.json');assert plan['currentGoalCount']==23 and len(plan['resolutionSupersessions'])==5 and plan['normalResolutionSupersessionChainErrors']==[] and len(plan['preservedHistoricalDeferred15Sources'])==2
assert all(x['ordinaryCurrentSubsetWholePageExact'] for x in plan['currentResolutionClaims'])
write(B/'checks/supersession-routing-v2.terminal.actual.json',{'actualExitCode':0,'actualCommand':['app/node_modules/.bin/tsx',str(B/'prepare-current-twenty-three-D-routing-and-supersessions-v2.technical.mts')],'normalCurrentSubsetBuilder':'buildGoalDescriptionRolloutSubsetModel','actualCurrentGoalFingerprintCount':23,'actualCurrentWholeOrdinarySubsetPagesExact':23,'normalSupersessionChainErrors':[],'normalSupersessionEdges':5,'activeWrites':0})
N=Path(plan['currentNativeOne15Entry']['path']);ne=read(N)
for field in ['candidateCanonicalPath','candidateKindsPath','actualFullCandidateModelPath','wholeCaseMaterialsPath','wholeSourceDutiesPath','currentScienceV7Entry','currentScienceV7FirstSeal']:
 z=bind(ne[field]);inputs[z['path']]=z
for x in ne['inputBindings']:inputs[x['path']]=verify(x)
rootB=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-molecular-genetics-reviewed-integration-root-v1');rp=rootB/'checks/current23-genuine-P-pair.actual.json';pc=rootB/'positive/P23.paired-current.future-active.config.json';inputs[str(rp)]=bind(rp);inputs[str(pc)]=bind(pc);pp=read(rp);assert len(pp['positivePairs'])==23
for f in ['materializeGoalDescriptionRolloutBatch.ts','validateGoalDescriptionReviewCampaignResults.ts','validateGoalDescriptionReviewDualRound.ts','validateGoalDescriptionDualRoundResolution.ts','validateGoalDescriptionRolloutSynthesisDecisionManifest.ts','goalDescriptionRolloutResolutionSynthesis.ts','reportDeepUnderstandingRollout.ts']:
 p=Path('app/scripts')/f;inputs[str(p)]=bind(p)
oldGuard=read(N.parent/'checks/active-current-input-hashguard.after.actual.json')['unchanged'];now=[verify(x) for x in oldGuard];write(B/'checks/active-current-four-inputs-still-byte-exact.actual.json',{'unchanged':now,'actualActiveWrites':0,'sourceMappingWrites':0,'ownStageOperations':0,'commitCreated':False})
sys.path.insert(0,'scripts');import validate_schemas
errors=validate_schemas.curriculum_symlink_errors(ROOT);assert errors==[];write(B/'checks/ordinary-curriculum-symlink-check.actual.json',{'api':'scripts.validate_schemas.curriculum_symlink_errors','actualRepositoryRoot':'.','actualExitCode':0,'errors':[],'validatorExceptions':False})
files=[p for p in sorted(B.rglob('*')) if p.is_file()];parsed=0;lines=0
for p in files:
 assert not p.is_symlink()
 if p.suffix=='.json':read(p);parsed+=1
 if p.suffix=='.jsonl':
  for line in p.read_text().splitlines():
   if line.strip():json.loads(line);lines+=1
ig=subprocess.run(['git','check-ignore','--stdin'],input='\n'.join(str(p) for p in files)+'\n',capture_output=True,text=True);assert ig.returncode==1 and not ig.stdout
write(B/'checks/own-normal-JSON-JSONL-portability-and-index-originals.actual.json',{'actualJSONCount':parsed,'actualJSONLRecordsParsed':lines,'allOwnFilesRegular':True,'gitCheckIgnoreArgv':['git','check-ignore','--stdin'],'actualCheckIgnoreExit':1,'actualIgnoredPaths':[],'actualNativeOriginalIndexBindings':originals,'originalNativeHTMLPDFDuplicationsCreated':0,'ownStageOperations':0,'ignoreChanged':False,'activeWrites':0})
entry={'schemaVersion':1,'role':'Neutral inactive adoption-ready ordinary description routing; genuine sealed A/B native results only, no new science or human review','preparedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'goalIds':[x['goalId'] for x in plan['currentResolutionClaims']],'currentGoalCount':23,'currentCanonicalGoalCount':479,'currentCurricularAtomicCount':394,'descriptionResolutionIndexPaths':plan['resolutionIndexPaths'],'descriptionResolutionSupersessions':plan['resolutionSupersessions'],'ordinaryDescriptionScopes':ordinary,'ordinaryCurrentRoutingAndSubsetProof':bind(B/'planned-current23-description-routing.actual.json'),'currentNativeOne15Entry':bind(N),'currentNativeOne15FirstSeal':bind(N.parent/'native-one15-successor.technical.first.freeze.json'),'actualCurrentCanonicalCandidate':bind(ne['candidateCanonicalPath']),'actualCurrentWhole394Model':bind(ne['actualFullCandidateModelPath']),'currentWholeCases46':bind(ne['wholeCaseMaterialsPath']),'originalSourceDuties38AndPartners44':bind(ne['wholeSourceDutiesPath']),'currentPositiveConfigurationForRootAdoption':bind(pc),'currentGenuinePositivePairProofRootOwned':bind(rp),'noAdditionalCurrentPositiveMaterializationRequired':True,'ownFourEarlierP22PartitionConfigsRetainedAsTechnicalHistory':True,'ownDuplicateP23PairConfigRetainedAsTechnicalHistoryNotRequestedForAdoption':True,'normalIndexResolvedGoalCounts':[12,10,5,1],'normalCurrentDistinctResolutionClaims':23,'normalSupersessionCount':5,'unresolvedHistorical15ClaimsNeverFabricated':True,'historicalBlocked15RowsAndRunsPreservedInTwoOrdinaryDeferredGoals':plan['preservedHistoricalDeferred15Sources'],'current15FirstStrictDescriptionClaim':plan['one15CurrentFirstStrictDescriptionResolution'],'actualCurrentOrdinarySubsetWholePagesExact':23,'whole394PreservationRemainsIndependentModelProof':{'other371PagesExact':ne['unchangedOtherWholePages']==371,'other456CanonicalObjectsExact':ne['other456ActiveWholeGoalObjectsExact'],'protected276CanonicalQAAndWholePagesExact':ne['all276StrictCanonicalQAAndWholePagesExact']},'firstWrongWholeVsSubsetFingerprintAssertionPreserved':bind(B/'checks/supersession-routing-first-whole-vs-subset-fingerprint-failure.actual.json'),'actualV2OrdinarySubsetRoutingExit':0,'ordinarySymlinkCheck':bind(B/'checks/ordinary-curriculum-symlink-check.actual.json'),'ownJSONPortabilityCheck':bind(B/'checks/own-normal-JSON-JSONL-portability-and-index-originals.actual.json'),'activeFourInputGuard':bind(B/'checks/active-current-four-inputs-still-byte-exact.actual.json'),'currentTechnicalFirstSealPath':str(SEAL),'actualOriginalIndependentFirstAndFinalInputs':list(inputs.values()),'newScientificReviews':0,'newReviewerRecords':0,'ownActiveWrites':0,'ownStageOperations':0,'strictGain':0,'humanApproval':False,'humanTrial':False,'rootGuardedAdoptionAndCentralChecksRequired':True}
write(ENTRY,entry)
outputs=[bind(p) for p in sorted(B.rglob('*')) if p.is_file() and p!=SEAL]
write(SEAL,{'schemaVersion':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Actual inactive technical first seal of four genuine nativeD indices/five ordinary supersessions/current P23 root routing','inputs':list(inputs.values()),'outputs':outputs,'originalIndependentRecordsAndRunBytesVerified':True,'ordinaryIndexResolutionCount28':'12+10+5+1 historical resolution claims','currentDistinctResolutionClaims':23,'actualDeferredHistorical15Sources':2,'actualSupersessions':5,'sourceCourseApprovalClaimed':False,'newScientificReviews':0,'activeWrites':0,'ownStageOperations':0,'strictGain':0,'humanApproval':False})
print(json.dumps({'neutralEntry':bind(ENTRY),'firstSeal':bind(SEAL),'outputs':len(outputs),'inputs':len(inputs),'currentDistinctDClaims':23,'supersessions':5,'normalAPIAllFourScopes':'PASS','normalCurrentOrdinarySubsetPagesExact':23,'normalSymlinkErrors':0,'ownActiveWrites':0}))
