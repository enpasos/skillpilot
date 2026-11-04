from pathlib import Path
import hashlib,json,subprocess
R=Path('/home/enpasos/projects/skillpilot');H=Path(__file__).resolve().parent;C=H/'check-host';F=H/'final-reviewed-overlay';cfg=json.loads((H/'integration-config.json').read_text());B=R/cfg['baseHost'];N=H.parent/'geometry-four-projection-reuse-native-20261104-v1';Q=cfg['qualityRoot'];A=H.parent/'astra-geometry-four-projection-reuse-final-stage-20261104-v1'
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p):return json.loads(Path(p).read_text())
def put(p,b):p.parent.mkdir(parents=True,exist_ok=True);q=p.with_name(p.name+'.new');q.write_bytes(b);q.replace(p)
def save(p,v):put(p,(json.dumps(v,ensure_ascii=False,indent=2)+'\n').encode())
def pin(p):return{'path':p.relative_to(R).as_posix(),'sha256':sha(p)}
def both(rel,b):put(C/rel,b);put(F/rel,b)
def bothjson(rel,v):both(rel,(json.dumps(v,ensure_ascii=False,indent=2)+'\n').encode())
assert not(H/'manifest.final-normal-checks.json').exists()and not F.exists()
execution=read(H/'final-bound-checks/execution.json');assert execution['status']=='PASS_FINAL_AGREED_ELEVEN_NORMAL_CHECKS'and execution['completedDistinctCommands']==11 and execution['allFinalExitCodesZero']and execution['payloadDrift']==[];last={r['name']:r for r in execution['commands']};assert len(last)==11 and all(r['exitCode']==0 for r in last.values());assert len(execution['commands'])==13;assert [(r['name'],r['attempt'],r['exitCode'])for r in execution['commands']if r['exitCode']!=0]==[('goalbook-model',1,1),('goalbook-model',2,143)];assert last['goalbook-model']['attempt']==3
base=read(H/'manifest.quality-stage-adopted.json');oldByPath={r['path']:r for r in base['files']}
for row in base['files']:assert sha(C/row['path'])==sha(R/row['candidatePath'])==row['candidateSha256'];put(F/row['path'],(R/row['candidatePath']).read_bytes())
for row in execution['commands']:
 for stream in['stdout','stderr']:
  source=R/row[stream]['path'];assert sha(source)==row[stream]['sha256'];both(Q+'/normal-eleven/'+source.name,source.read_bytes())
both(Q+'/normal-eleven/execution.json',(H/'final-bound-checks/execution.json').read_bytes())
for name in ['adopt-final-review.py','run-normal-checks.py','seal-normal-closeout.py','prepare-private-check-index.py','private-check-index.actual.json','record-interrupted-attempt.py','start-detached-check.py','detached-goalbook-start.actual.json','detached-goalbook-runner.stdout.txt','detached-goalbook-runner.stderr.txt']:both(Q+'/normal-eleven/'+name,(H/name).read_bytes())
both(Q+'/normal-eleven/agreed-normal-checks.plan.json',(H.parent/'space-geometry-four-integration-preparation-20261103-v1/normal-checks.plan.json').read_bytes())
mapPath=N/'candidate-input-hashes.json';nativeMap=read(mapPath);assert sha(mapPath)=='57a94ebcc308cfc05ce01a0452f91e9cafa6febafcc66c40e028b503cf475cca';assert len(nativeMap)==3582
review=read(A/'review-handoff.json');exceptions=review['exactPostNativeExistingInputExceptions'];expected={r['path']:r for r in exceptions};changed=[]
for rel,digest in nativeMap.items():
 assert sha(B/rel)==digest,('Original Native4/effective306 drift',rel)
 actual=sha(C/rel)
 if actual!=digest:
  e=expected.get(rel);assert e and e['native4Sha256']==digest and e['reviewedFinalSha256']==actual,('Unexpected post-Native4 input change',rel);changed.append(e)
assert len(changed)==2
for rel in[cfg['canonicalPath'],cfg['ledgerPath'],cfg['policyPath'],cfg['layoutPath']]:assert sha(B/rel)==sha(C/rel)
viewCount=0
for p in(B/'curricula/DE/Gymnasium/composition-views/mathematik').glob('*.json'):assert sha(p)==sha(C/p.relative_to(B));viewCount+=1
assert viewCount==147
mainCount=0
for p in(B/'backend/src/main').rglob('*'):
 if p.is_file():assert sha(p)==sha(C/p.relative_to(B));mainCount+=1
for row in base['rootOwnedCheckSources']:assert sha(C/row['path'])==sha(R/row['path'])==row['sha256']
rootHead=subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip()
summary={'status':'PASS_ALL_ELEVEN_AGREED_NORMAL_CHECKS_ON_GENUINE_FINAL_G4_STAGE_AND_AM_BINDINGS','genuineStageReceipt':base['genuineStageReceipt'],'execution':pin(H/'final-bound-checks/execution.json'),'commands':[{k:r[k]for k in['name','attempt','exitCode','seconds']}for r in execution['commands']],'exactAgreedCommandSetUnchanged':True,'repeatedPassedChecks':False,'totalCommandAttempts':len(execution['commands']),'initialFailedAttempt':{'name':'goalbook-model','attempt':1,'cause':'Private host had no .git index; source-atlas tracked-input guard failed before model checks.','sourceOrPayloadChanges':False,'setupProofPath':Q+'/normal-eleven/private-check-index.actual.json','initialStdoutAndStderrPreserved':True,'secondAttemptInterruptedBySignal':{'attempt':2,'exitCode':143,'reason':'Foreground exec SIGTERM; original logs preserved; unfinished whole command was not passed'},'terminalAttemptRunsDetached':3},'onlyFailedCheckRetried':{'name':'goalbook-model','finalAttempt':3,'finalExitCode':0},'guardedAdoptedPayloadLeavesByteUnchanged':len(base['files']),'rootOwnedCheckSourcesByteIdentical':base['rootOwnedCheckSources'],'rootHeadBeforeFinalImport':rootHead,'actualNative4':pin(N/'candidate.json.gz'),'nativeRootComparator':pin(N/'finite-delta.root-verified.actual.json'),'independentFixedPointsVerifiedByRoot':322,'noFreshNativeRunAfterReviewerQualityAdoption':True,'noRootGitWrites':True,'doesNotClaimGlobalM7FullCurriculumCompletionOrRemoteCI':True};bothjson(Q+'/normal-eleven/terminal-summary.actual.json',summary)
boundaryRel=Q+'/final-native4-input-boundary.actual.json';newQuality=sorted({p.relative_to(F).as_posix()for p in F.rglob('*')if p.is_file()and p.relative_to(F).as_posix()not in nativeMap}|{boundaryRel})
boundary={'status':'FINAL_ACTUAL_FINITE_POST_NATIVE4_GENUINE_AM_AND_QUALITY_BOUNDARY','originalNative4Archive':pin(N/'candidate.json.gz'),'originalConservativeNative4InputMap':pin(mapPath),'originalInputCount':3582,'unchangedOriginalInputHashes':3580,'exactChangedOriginalInputHashes':changed,'allOther3580ExistingInputsByteIdentical':True,'newQualityEvidencePathsOutsideOriginalNative4InputInventory':newQuality,'newRuntimeGraphMainRRoleTaskCoverageSourceGuardOrProducerBindingChangesAfterNative4':[],'all147ViewBytesCanonicalLedgerGuardPolicyLayoutSourceGeneratorExtractionUnchanged':True,'allBackendMainFilesByteUnchanged':mainCount,'historicalNativeInputMapRewritten':False,'doesNotClaimAll3582FinalInputsByteIdenticalOrANewPostReviewNative':True,'normalElevenPassSeparateFromNativeGlobalM7AndRemoteCI':True,'selfHashBoundByOuterFinalImportManifest':True};bothjson(boundaryRel,boundary)
rows=[]
for p in sorted(F.rglob('*')):
 if not p.is_file():continue
 rel=p.relative_to(F).as_posix();assert sha(C/rel)==sha(p);prior=oldByPath.get(rel);rootBefore=sha(R/rel)if(R/rel).is_file()else None
 if prior:assert rootBefore==prior['beforeSha256'],('Current Root before changed',rel)
 rows.append({'path':rel,'candidatePath':p.relative_to(R).as_posix(),'candidateSha256':sha(p),'beforeSha256':rootBefore,'bytes':p.stat().st_size})
# Reconfirm every immutable predecessor and genuine export as handed off.
for m in [cfg['baseEffectiveManifest'],base['originalG4Manifest'],base['guardAmendmentManifest'],base['genuineFinalReviewHandoff'],base['genuineFinalReviewPortableExport']]:assert sha(R/m['path'])==m['sha256'],m['path']
for r in read(R/cfg['baseEffectiveManifest']['path'])['files']:assert sha(R/r['candidatePath'])==r['candidateSha256']
for r in read(R/base['originalG4Manifest']['path'])['files']:assert sha(R/r['candidatePath'])==r['candidateSha256']
for r in read(R/base['guardAmendmentManifest']['path'])['files']:assert sha(R/r['candidatePath'])==r['candidateSha256']
for r in read(A/'portable-export.json')['files']:assert sha(R/r['candidatePath'])==r['candidateSha256']
nd=read(N/'finite-delta.root-verified.actual.json');assert nd['after']['failedScopes']==144 and nd['after']['endpointPairs']==1751
out={**base,'status':'FINAL_PRIVATE_G4_IMPORT_WITH_GENUINE_STAGE_ACTUAL_NATIVE4_AND_ALL_ELEVEN_NORMAL_CHECKS_PASSED','candidateRoot':F.relative_to(R).as_posix(),'files':rows,'qualityStageAdoptionManifest':pin(H/'manifest.quality-stage-adopted.json'),'rootHeadBeforeFinalImport':rootHead,'actualNormalElevenChecks':{'status':execution['status'],'execution':pin(H/'final-bound-checks/execution.json'),'terminalSummaryPath':Q+'/normal-eleven/terminal-summary.actual.json','distinctCommands':11,'allExitCodesZero':True,'allFirstAttempts':False,'totalAttempts':len(execution['commands']),'allFinalExitCodesZero':True,'transparentRetry':{'name':'goalbook-model','attempt':3,'initialFailure':'Attempt1 private Git-index fixture missing; attempt2 foreground exec SIGTERM; all original logs retained','setupProofPath':Q+'/normal-eleven/private-check-index.actual.json','payloadSourceChanges':False},'payloadDrift':[]},'finalNative4InputBoundary':{'path':boundaryRel,'sha256':sha(C/boundaryRel)},'originalNative4':pin(N/'candidate.json.gz'),'originalNative4InputMap':pin(mapPath),'rootNativeComparator':pin(N/'finite-delta.root-verified.actual.json'),'remainingInvalidNativeScopes':144,'remainingUncoveredTargetUniquePairs':[251,2642],'remainingUncoveredEndpointUniquePairs':[160,1751],'normalChecksDoNotClaimGlobalM7FullCurriculumCompletionRemoteCIOrDeployment':True,'allCurrentRootBeforeHashesVerified':True,'allFilesHaveOneCandidateRoot':True,'noNewNativeRunsOrRootGitWrites':True,'pending':['Root final import/Git only for this bounded G4 package; remaining curriculum gaps remain separate authoring work']};save(H/'manifest.final-normal-checks.json',out)
handoff={'status':out['status'],'finalManifest':pin(H/'manifest.final-normal-checks.json'),'candidateRoot':out['candidateRoot'],'candidateHost':C.relative_to(R).as_posix(),'fileCount':len(rows),'rootHeadBeforeImport':rootHead,'beforeHashesAllVerifiedAgainstCurrentRoot':True,'genuineStageReceipt':out['genuineStageReceipt'],'genuineFinalReviewHandoff':base['genuineFinalReviewHandoff'],'normalChecks':out['actualNormalElevenChecks'],'originalNative4Archive':out['originalNative4'],'originalInputMapUnmodified':out['originalNative4InputMap'],'actualPostNativeBoundary':out['finalNative4InputBoundary'],'nativeRootComparator':out['rootNativeComparator'],'allPriorFreezesAndGenuineReviewerLeavesPreserved':True,'noRootGitWrites':True,'remainingInvalidScopes':144,'remainingEndpointPairs':1751,'globalM7PassClaimed':False};save(H/'FINAL-HANDOFF.json',handoff)
print(json.dumps({'status':out['status'],'manifestSha256':sha(H/'manifest.final-normal-checks.json'),'handoffSha256':sha(H/'FINAL-HANDOFF.json'),'files':len(rows),'rootHead':rootHead,'normalCommands':11,'remainingEndpointPairs':1751}))
