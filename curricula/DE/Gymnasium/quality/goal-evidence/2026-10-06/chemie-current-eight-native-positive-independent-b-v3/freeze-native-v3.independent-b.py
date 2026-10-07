from pathlib import Path
import hashlib,json,datetime
root=Path.cwd().resolve();base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/';own=base+'chemie-current-eight-native-positive-independent-b-v3';author=base+'chemie-current-fifteen-final-native-review-inputs-author-v3'
read=lambda p:json.loads((root/p).read_text());sha=lambda p:hashlib.sha256((root/p).read_bytes()).hexdigest()
def bind(p):return {'path':p,'sha256':sha(p),'bytes':(root/p).stat().st_size}
contentpath=own+'/content-v2-source-stage.independent-b.final.freeze.json';content=read(contentpath);assert sha(contentpath)=='4982308f6ce41b354d448fe22c56eac64ba5b534617572ce63fe915e3a577fcd'
oldpaths=[base+'chemie-current-fifteen-native-d-independent-b-v1/native-d-fifteen.independent-b.final.freeze.json',base+'chemie-current-fifteen-native-positive-independent-b-v1/native-positive-fifteen.independent-b.final.freeze.json',contentpath]
historical=[]
for p in oldpaths:
 f=read(p)
 for row in f['outputs']:assert sha(row['path'])==row['sha256'],row['path']
 historical.append({'freeze':bind(p),'ownOutputsCheckedUnchanged':len(f['outputs']),'allOwnOutputBytesExact':True,'historicalExternalInputsNotGloballyReassertedCurrent':True})
isolation=read(own+'/actual-v3-input-payload-reuse-and-native-isolation.independent-b.json');native=read(own+'/actual-eight-current-native-contract-and-seven-reuse.independent-b.json');execution=read(own+'/native-current-eight-check.execution.actual.json');assert execution['exitCode']==0
inputs={}
def add(p,role):
 b=bind(p)
 if p in inputs:inputs[p]['roles'].append(role)
 else:inputs[p]={**b,'roles':[role]}
for p in oldpaths:add(p,'Immutable own previous scientific review/reuse stage')
for r in isolation['allowedAuthorArtifactsActualByteVerified']:
 assert 'sha256:'+sha(r['path'])==r['sha256'] and (root/r['path']).stat().st_size==r['bytes'];add(r['path'],'Actual frozen v3 author input bytes; no peer result')
for name in ['native-p-stage-author-v3.final.freeze.json','final-native-review-inputs-author-v3.final.freeze.json']:add(author+'/'+name,'Actual immutable author stage freeze')
for r in isolation['nativePureHelpersByteIdenticalCurrent']:
 assert 'sha256:'+sha(r['path'])==r['sha256'];add(r['path'],'Actual current unchanged native production helper')
for r in isolation['physicalNativeAssets']:
 add(r['source']['path'],'Actual physical native review raster source')
 copy=Path(isolation['temporaryNativeRoot'])/r['nativeRelativePath'];assert hashlib.sha256(copy.read_bytes()).hexdigest()==sha(r['source']['path']);assert copy.stat().st_size==r['source']['bytes']
for r in content['outputs']:add(r['path'],'Immutable own actual complete science content input')
for p in ['AGENTS.md','/home/enpasos/.codex/attachments/b77af694-ca1d-42ad-a722-1a0b77a18fe8/goal-objective.md','app/package.json','contracts/goal-evidence/v2/goal-evidence-profile.schema.json','contracts/goal-evidence/v2/goal-evidence-review-config.schema.json','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json','contracts/curriculum-package/v1/profiles/semantic-normal-form-v1.profile.json','curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md']:add(p,'Actual native contract/review guidance input')
oldconfig=read(base+'chemie-current-fifteen-native-positive-independent-b-v1/positive.fifteen.independent-b.config.json')
for p in [oldconfig['landscapePath'],oldconfig['semanticKindLedgerPath'],oldconfig['reviewPath']]:add(p,'Actual guarded previous own whole-record/current literal payload reuse input')
frozen_old={r['path'] for r in content['outputs']};frozen_old.add(contentpath)
freezePath=own+'/native-positive-eight.independent-b.final.freeze.json'
outputs=[bind(str(p.relative_to(root))) for p in sorted((root/own).rglob('*')) if p.is_file() and str(p.relative_to(root)) not in frozen_old and str(p.relative_to(root))!=freezePath]
for r in inputs.values():assert sha(r['path'])==r['sha256']
for r in outputs:assert sha(r['path'])==r['sha256']
run=read(own+'/results/independent-b.batch-001.run.json');assert run['outputDigest']=='sha256:'+sha(own+'/results/independent-b.batch-001.records.jsonl')
x={'schemaVersion':1,'stageId':'chemie-current-eight-native-positive-independent-b-v3.actual-native-stage','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Independent B actual eight whole chemistry P2 profiles and sixteen whole DEEN cases, preserved immutable own v2 science and newly recomputed native isolated v3 bindings','scopeGoalIds':native['rows'] and [r['goalId'] for r in native['rows']],'scientificPaperProfileCounts':{'KEEP':8,'REVISE':0},'scientificCompleteMaterialCounts':{'KEEP':16,'REVISE':0},'freshActualFullScienceReadInOwnImmutableContentStage':True,'actualV3FullCanonicalProfilesAndMaterialsExactOwnReviewedV2':True,'actualCurrentNativePureHelperRecomputed8':True,'actualCurrentNativeImageDigestsPhysicallyAvailableInIsolatedRoot':True,'actualNativeClosedContractAndRunValidatorExitCode':execution['exitCode'],'actualNativeCounts':native['nativeChecker']['counts'],'allEightAuthorOperativeFingerprintBindingsExact':True,'allCurrentKindClassificationsExactPrior':True,'allCurrentKindFingerprintsRecomputedExact':True,'threeOperativeTextKindFingerprintChangesOnly':3,'sevenPreviousWholeOwnKEEPRecordsExactCurrentNativeWithoutRetagging':True,'current363VisualDScienceHoldRetained':True,'current363PaperPKEEPDoesNotApproveImageOrCloseD':True,'unresolvedWholeOriginalSourceAndAllScopeHoldsRetained':True,'wholeOriginalSourceCoverage':False,'newPeerADOrPResultFilesRead':False,'excludedUnreadAuthorRoundAPaths':isolation['excludedUnreadRoundAInputPaths'],'nativeRunRole':run['role'],'nativeRunBlindToOtherNewRuns':run['blindToOtherRuns'],'oldV1Root622CueRemainsDisclosedHistoricalContext':True,'historicalOwnFrozenOutputBytePreservation':historical,'historicalExternalHelperHashesNotReboundAsScience':True,'activeNativeIntegration':False,'overallGoalM7Approval':False,'humanApproval':False,'humanTrial':False,'actualLearnerEvidence':False,'activeWrites':False,'GitOperations':False,'fullBuildOrFullQS':False,'strictNetGain':0,'actualFinalInputsAndNewOwnOutputsReverified':True,'inputs':sorted(inputs.values(),key=lambda r:r['path']),'outputs':outputs}
(root/freezePath).write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'freezePath':freezePath,'sha256':sha(freezePath),'inputs':len(inputs),'newOwnOutputs':len(outputs),'profilesKEEP':8,'materialsKEEP':16,'nativeCheckerExit':0,'current363VDHoldRetained':True,'historicalOwnOutputsCheckedUnchanged':sum(r['ownOutputsCheckedUnchanged'] for r in historical)}))
