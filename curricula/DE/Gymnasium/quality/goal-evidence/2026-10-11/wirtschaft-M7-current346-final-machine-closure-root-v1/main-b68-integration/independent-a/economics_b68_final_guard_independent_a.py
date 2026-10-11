import json, pathlib, hashlib, subprocess, datetime, os
R=pathlib.Path('/home/enpasos/projects/skillpilot');O=pathlib.Path('/tmp/economics-b68-merge-preservation-independent-a');L='9067bb2cdaeb90aec1b0d6b541cea5330a2e8fd5';U='b68f8e5b579807837845ed91969d4293b35a503d';REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'; STATUS='docs/qa-ci/status/curriculum-quality-status.json'; ATLAS='app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/source-projection.receipt.json'
def sha(b):return hashlib.sha256(b).hexdigest()
def git(*a):return subprocess.check_output(['git',*a],cwd=R)
def old(ref,p):return json.loads(git('show',ref+':'+p))
def cur(p):return json.loads((R/p).read_bytes())
def subs(v):return {s['subject']:s for s in v['subjects']}
def diff(a,b,p=''):
 if type(a)!=type(b):return [{'path':p,'before':a,'after':b}]
 if isinstance(a,dict):return sum((diff(a.get(k),b.get(k),p+'/'+str(k)) for k in sorted(set(a)|set(b))),[])
 if isinstance(a,list):
  if len(a)!=len(b):return [{'path':p,'beforeLength':len(a),'afterLength':len(b)}]
  return sum((diff(x,y,p+'/'+str(i)) for i,(x,y) in enumerate(zip(a,b))),[])
 return [] if a==b else[{'path':p,'before':a,'after':b}]
p=O/'actual-active-inputs-Economics9067-Biologyb68-and-policy-only-native-atlas-preservation.READONLY.json';pre=json.loads(p.read_bytes())
allguards=pre['economics']['guards']+pre['incomingRemote']['guards']+pre['biologyAtlas']['outputs']+pre['mathPhysics']['guards']
end=[]
for z in allguards:
 f=R/z['path'];b=os.readlink(f).encode() if f.is_symlink() else f.read_bytes();end.append({'path':z['path'],'sha256':sha(b),'unchangedSinceOwnFirstGuard':sha(b)==z['currentSha256']})
allowedDoc='docs/qa-ci/wirtschaft-m7-machine-closeout-2026-10-11.md'
assert all(z['unchangedSinceOwnFirstGuard'] or z['path']==allowedDoc for z in end)
oldDoc=git('show',L+':'+allowedDoc).decode().splitlines();newDoc=(R/allowedDoc).read_text().splitlines();assert set(oldDoc)<=set(newDoc)
endDelta=[z for z in end if not z['unchangedSinceOwnFirstGuard']]
S=subs(cur(REG));LS=subs(old(L,REG));US=subs(old(U,REG));subjectRows=[]
for k in S:
 ref=L if k=='wirtschaftswissenschaften' else U
 subjectRows.append({'subject':k,'reference':ref,'wholeExact':S[k]==(LS if ref==L else US)[k]})
assert all(z['wholeExact'] for z in subjectRows)
A={z['landscapeId']:z for z in old(L,STATUS)['curricula']}; B={z['landscapeId']:z for z in cur(STATUS)['curricula']};C={z['landscapeId']:z for z in old(U,STATUS)['curricula']}; changed=[k for k in A if A[k]!=B[k]]
assert set(A)==set(B)==set(C);assert len(changed)==1 and B[changed[0]]['subject']=='Biologie' and B[changed[0]]==C[changed[0]]
protected=[]
for name,n in [('Wirtschaftswissenschaften',346),('Mathematik',807),('Physik',478)]:
 row=next(z for z in B.values() if z['subject']==name);r=next(z for z in row['rules'] if z['id']=='CQR-303');m=r['metrics'];assert row['maturity']=='M7' and r['status']=='pass' and m['expectedGoals']==n and m['strictComplete']==n and m['remaining']==0 and m['requiredChecksPassed']==m['requiredChecksTotal']==6 and m['blockingIssues']==0
 for f in ['currentDescriptionResolutions','currentPositiveEvidenceProfiles','currentSemanticAtomicityDecisions','currentMemoryReviewDecisions','currentVisualizationQaRecords']:assert m[f]==n
 protected.append({'subject':name,'maturity':row['maturity'],'currentRule':r,'wholeRowExact9067':row==A[row['landscapeId']]})
inv='docs/legal/ai-transparency-inventory.json';invD=diff(old(L,inv),cur(inv));expectedInv={'/artifactClasses/goalVisualizations/c2paStructure/detected':23,'/artifactClasses/goalVisualizations/canonicalGoalCount':1,'/artifactClasses/goalVisualizations/count':23,'/artifactClasses/goalVisualizations/fileExtensions/png':23,'/artifactClasses/goalVisualizations/providerCounts/OpenAI Codex image_gen':10,'/artifactClasses/goalVisualizations/providerCounts/OpenAI builtin imagegen':12,'/artifactClasses/goalVisualizations/providerCounts/OpenAI image_gen (Codex built-in)':1}
assert {z['path']:z['after']-z['before'] for z in invD}==expectedInv
sourceAudit='docs/qa-ci/status/curriculum-source-coverage-audit.json';assert cur(sourceAudit)==old(U,sourceAudit);sourceD=diff(old(L,sourceAudit),cur(sourceAudit));assert len(sourceD)==1 and sourceD[0]['path']=='/generatedAt'
# Every Economics image copy is checked against the exact retained active QA asset binding; no new visual decision.
qa=old(L,LS['wirtschaftswissenschaften']['visualizationQaPath']);assetRows=[]
for z in qa['records']:
 expected=z['assetSha256'].removeprefix('sha256:');cp=z['canonicalAssetPath']; pp=z['publicAssetPath']; bp='backend/src/main/resources/static/'+pp.removeprefix('app/public/')
 for ap in [cp,pp,bp]:
  b=(R/ap).read_bytes();assetRows.append({'goalId':z['goalId'],'path':ap,'sha256':sha(b),'sameRetained9067AssetBinding':sha(b)==expected})
assert len(qa['records'])==346 and all(z['sameRetained9067AssetBinding'] for z in assetRows)
incomingNames=git('diff','--name-only','5344554de0cb8243fbca26275978cb5396e1ded9',U).decode().splitlines();bioPng=[p for p in incomingNames if p.startswith('app/public/assets/goal-visualizations/biologie/') and p.endswith('.png')];backendRows=[]
for ap in bioPng:
 b=git('show',U+':'+ap);bp='backend/src/main/resources/static/'+ap.removeprefix('app/public/');actual=(R/bp).read_bytes();backendRows.append({'path':bp,'originalRemotePublicAssetPath':ap,'remoteAssetSha256':sha(b),'currentSha256':sha(actual),'wholeByteExactRemoteAsset':b==actual})
assert len(backendRows)==13 and all(z['wholeByteExactRemoteAsset'] for z in backendRows)
# Root native logs: reuse each completed result and verify its stdout/stderr bytes. Do not run commands.
root=pathlib.Path('/tmp/skillpilot-economics-M7-main-b68-integration-root-20261011');names=['current-deep-understanding-rollout-test','current-native-biology-atlas-check','current-ai-transparency-inventory-check','current-central-freshness-and-protected-floors','current-source-coverage-audit-check'];logs=[]
for n in names:
 rp=root/(n+'.actual-execution.receipt.json');x=json.loads(rp.read_bytes());assert x['exitCode']==0 and x['completedAt']
 row={'receiptPath':str(rp),'receiptSha256':sha(rp.read_bytes()),'completedExecution':x,'outputBindings':[]}
 for stream,key in [('stdout','stdoutSha256'),('stderr','stderrSha256')]:
  f=root/(n+'.'+stream+'.txt');bs=f.read_bytes();assert sha(bs)==x[key];row['outputBindings'].append({'path':str(f),'sha256':sha(bs),'matchesCompletedReceipt':True})
 logs.append(row)
# Entire root regulator row changes are exactly incoming Biology, Economics remains whole9067.
regD=diff(old(L,REG),cur(REG));indexBio=next(i for i,z in enumerate(old(L,REG)['subjects']) if z['subject']=='biologie');assert all(z['path'].startswith('/subjects/'+str(indexBio)+'/') for z in regD)
index='docs/qa-ci/index.md';beforeLines=set(git('show',L+':'+index).decode().splitlines());remoteLines=set(git('show',U+':'+index).decode().splitlines());currentLines=set((R/index).read_text().splitlines());assert beforeLines<=currentLines and remoteLines<=currentLines
bookGuard=pre['economics']['generatedBookBeforeSnapshot'];bookpath=bookGuard['path'];bookb=(R/bookpath).read_bytes();assert sha(bookb)==bookGuard['currentSha256']
report={'schemaVersion':1,'kind':'independent-final-readonly-qualified-no-commit-merge-candidate','decision':'KEEP','completedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'references':{'economicsBaseline':L,'biologyMainBaseline':U,'actualHEAD':git('rev-parse','HEAD').decode().strip(),'actualMERGE_HEAD':git('rev-parse','MERGE_HEAD').decode().strip()},'limits':{'repositoryWrites':0,'fetchOrMergeCommands':0,'scientificReviews':0,'newNativeTestsOrBuilds':0,'remoteCISuccessClaim':False,'mergeCommitExistsClaim':False,'allEarlierSealsUntouched':True},'firstActualGuard':{'path':str(p),'sha256':sha(p.read_bytes())},'endGuards':end,'authorizedDocumentationSuccessor':{'path':allowedDoc,'oldSHA256':sha(git('show',L+':'+allowedDoc)),'currentSHA256':sha((R/allowedDoc).read_bytes()),'allOriginalLinesPreserved':True,'onlyFirstGuardDelta':endDelta,'boundary':'Root added current merge paragraph/link after first guard; this is separate from immutable science and native input preservation.'},'subjects':subjectRows,'registry':{'currentSha256':sha((R/REG).read_bytes()),'onlyBiologySubjectChangedVersus9067':True,'wholeEconomics82Index180SupersessionSubjectExact9067':True,'allFourForeignSubjectsExactB68':True,'logicalChangedFields':regD},'currentCentral':{'path':STATUS,'sha256':sha((R/STATUS).read_bytes()),'generatedAt':cur(STATUS)['generatedAt'],'wholeEconomicsAnd19OtherRowsExact9067':True,'onlyChangedRow':{'landscapeId':changed[0],'subject':'Biologie','wholeExactB68':True,'maturity':B[changed[0]]['maturity'],'CQR303':next(z for z in B[changed[0]]['rules'] if z['id']=='CQR-303')},'protectedRules':protected},'sourceCoverage':{'wholeCurrentJsonExactB68':True,'only9067Delta':sourceD},'inventory':{'exactlySevenMeasuredLeafChangesOnly':True,'actualLogicalDeltas':invD,'imagesDelta':{'unchangedQualifiedEconomicsAdditionsRetained':10,'incomingWholeRemoteBiologyPNGs':13,'total':23},'noPolicyThresholdReviewContentChanges':True},'economicsImageBytes':{'goalCount':346,'canonicalPublicBackendCopies':len(assetRows),'allSameRetained9067QABinding':True,'guards':assetRows,'newVisualApproval':False},'biologyIgnoredRuntimeCopies':{'incomingPNGCount':13,'wholeByteExactB68':True,'guards':backendRows},'economicsPageContext':{'unchangedIgnoredGeneratedBookSha256':sha(bookb),'wholeCurrentCANGoalPAMVBookConfigAndBoundInputsExact9067':True,'actualScientificOrPageContextChanges':[],'sharedWholeRegistryHashChangedOnlyAsBiologyContainerMerge':'No scientific re-review or manual hash-rebinding inferred.'},'documentationIndex':{'allOwn9067LinesAndAllB68LinesRetained':True},'reusedCompletedNativeChecks':logs,'remainingReadinessBoundary':'Commit/push and three new exact-HEAD GitHub workflow runs are still Root-owned; no pending or old9067 run is counted as passed.'}
rp=O/'actual-stable-b68-merged-candidate-current-M7-and-whole-scientific-preservation.independent-KEEP.READONLY.json';rp.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
seal={'schemaVersion':1,'decision':'KEEP-qualified-merge-candidate-before-commit','completedAt':report['completedAt'],'artifacts':[{'path':str(f),'sha256':sha(f.read_bytes())}for f in[p,rp,pathlib.Path('/tmp/economics_b68_merge_independent_a.py'),pathlib.Path('/tmp/economics_b68_final_guard_independent_a.py')]],'counts':{'firstEconomicsGuards':pre['economics']['protectedPaths'],'authorizedLaterDocDelta':len(endDelta),'exactIncomingNonShared':pre['incomingRemote']['nonsharedTotal'],'finalEndGuardPairs':len(end),'exactBioAtlasOutputs':26,'exactBiologyBackendAssets':13,'economicsExactImageCopies':len(assetRows),'completedNativePASSLogsReused':len(logs)},'boundary':'Technical integration preservation only; no new science/image/human approval, no merge-commit/remote-CI completion claim.'}
sp=O/'SEALED-b68-qualified-merge-candidate-Economics346-M7-BiologyMain-exact-independent-A.READONLY.json';sp.write_text(json.dumps(seal,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'receipt':str(rp),'receiptSha256':sha(rp.read_bytes()),'seal':str(sp),'sealSha256':sha(sp.read_bytes()),'counts':seal['counts'],'currentREGsha256':report['registry']['currentSha256'],'centralGeneratedAt':report['currentCentral']['generatedAt'],'decision':report['decision']},ensure_ascii=False,indent=2))
