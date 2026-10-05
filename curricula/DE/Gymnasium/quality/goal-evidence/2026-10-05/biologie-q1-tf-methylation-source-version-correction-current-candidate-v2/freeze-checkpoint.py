# SPDX-License-Identifier: Apache-2.0
"""Export already completed isolated work and freeze the unadopted checkpoint."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, shutil
ROOT=Path(__file__).resolve().parents[7];OWN=Path(__file__).resolve().parent;REL=OWN.relative_to(ROOT)
meta=json.loads((OWN/'prospective-paths.json').read_text());ISO=Path(meta['isolationRoot'])
def read(p):return json.loads(Path(p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,v):p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
before=read(OWN/'active-input-boundary.before.json')
changed=[r['path'] for r in before['paths'] if sha(ROOT/r['path'])!=r['sha256']]
registry='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
assert all(p==registry for p in changed),changed
current=read(ROOT/registry);subject_digests={s['subject']:'sha256:'+hashlib.sha256(json.dumps(s,sort_keys=True,ensure_ascii=False).encode()).hexdigest() for s in current['subjects']}
subject_drift=[s for s,old in before['registrySubjectEntryDigests'].items() if old!=subject_digests[s]]
assert all(s=='chemie' for s in subject_drift),subject_drift
protected=[]
for item in before['frozenInputsVerified']:
 f=read(ROOT/item['path']);assert sha(ROOT/item['path'])==item['sha256']
 for r in f['files']:
  p=r.get('preparedPath',r['path']);assert sha(ROOT/p)==r['sha256'],p
 protected.append(item)
legacy=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-six-current-source-hold-remediation-candidate-v1/author-candidate.freeze.json'
legacyf=read(legacy)
for r in legacyf['ownArtifacts']:assert sha(ROOT/r['path'])==r['sha256'],r['path']
native=read(OWN/'native-code-and-write-isolation.receipt.json')
code_drift=[]
for r in native['nativeCodeByteIdentical']:
 assert sha(ISO/r['path'])==r['sha256'],r['path']
 if sha(ROOT/r['path'])!=r['sha256']:
  assert r['path']=='app/scripts/testClaudePluginInstallUi.ts','Unexpected native BIO source drift: '+r['path']
  dst=OWN/'isolated-native-code-drift-snapshot'/r['path'];dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ISO/r['path'],dst)
  code_drift.append({'path':r['path'],'isolatedInitSha256':r['sha256'],'currentRootSha256':sha(ROOT/r['path']),'preparedHistoricalCodePath':dst.relative_to(ROOT).as_posix(),'usedByBIOChecks':False})
model=read(OWN/'prospective-full.book-model.json');atlas=read(ISO/meta['atlasPath'])
paths=[meta[k] for k in ['canonicalPath','semanticPath','qaPath','atlasPath','heExtractionPath','heMappingPath']]
paths.extend(p for p in atlas['mappingPaths'] if 'm7-q1-tf-methylation-candidate-20261005-v1' in p and '/DE-BY/' in p)
paths.extend([atlas['manifestPath'],atlas['navigationViewPath'],atlas['outputDirectory']+'/source-projection.receipt.json'])
paths.extend(s['path'] for s in model['source']['compositionViewSources'])
canon=read(ISO/meta['canonicalPath'])
for g in canon['goals']:
 if g['id'] not in meta['goalIds']:continue
 link=next(l for l in g['resourceLinks'] if l.get('type')=='goal-visualization' and l.get('role')=='primary')
 paths.extend([f'curricula/DE/Gymnasium/visualizations/biologie/{g["id"]}/{g["id"]}.png',f'curricula/DE/Gymnasium/visualizations/biologie/{g["id"]}/prompt.de.md',f'app/public{link["url"]}',f'backend/src/main/resources/static{link["url"]}'])
assert len(paths)==38,len(paths)
tree=OWN/'prospective-input-tree';assert not tree.exists(),'Never overwrite an existing frozen input tree'
items=[]
for rel in paths:
 src=ISO/rel;dst=tree/rel;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
 assert sha(src)==sha(dst)
 items.append({'path':rel,'preparedPath':dst.relative_to(ROOT).as_posix(),'sha256':sha(dst),'bytes':dst.stat().st_size})
for name in ['baseline-full.book-model.json','prospective-full.book-model.json','positive.validation-only.review.jsonl']:
 assert sha(ISO/REL/name)==sha(OWN/name),name
for name in ['atomicity-two','atomicity-full','memory-two','memory-full','source-atlas','native-qa','positive-candidate']:
 p=OWN/('native-'+name+'.check.txt');assert p.is_file() and p.stat().st_size>0
for side in ['round-a','round-b']:
 assert not any(p.is_file() for p in (OWN/'native-finalbook'/side/'results').rglob('*'))
exported_render=[]
for p in (ISO/REL/'native-finalbook').rglob('*'):
 if p.is_file():
  q=OWN/'native-finalbook'/p.relative_to(ISO/REL/'native-finalbook');assert q.is_file() and sha(p)==sha(q)
  exported_render.append({'path':q.relative_to(ROOT).as_posix(),'sha256':sha(q)})
manifest=read(OWN/'native-finalbook/batch-manifest.json')
footprint=read(OWN/'actual-source-version-current-page-footprint.receipt.json')
assert footprint['status']=='HOLD_CURRENT_ORIGINAL_SOURCE_VERSION_CITATIONS' and footprint['remainingFalseVersionLinkCount']==4
write(OWN/'prepared-inputs.freeze.json',{'schemaVersion':1,'frozenAtUTC':datetime.now(timezone.utc).isoformat(),'status':'inactive_unadopted_source_v2_checkpoint_SOURCE_HOLD','files':items,'fileCount':len(items),'activeCanonicalCount':441,'activeCurricularAtomicCount':363,'prospectiveCanonicalCount':442,'prospectiveCurricularAtomicCount':364,'currentActiveStrictBiology':38,'newStrictGainClaimed':0,'sourceAcceptance':'HOLD: four actual incorrect extra historical citations remain in OriginalSources consumer','independentAMVReusedForUnchangedTwoGoals':True,'AMVResultsCountedAsNewClosure':False,'positiveProfiles':'two needs_human_review / ai_candidate records, no P approval','preparedD2GoalIds':meta['goalIds']+meta['bindingOnlyGoalIds'],'preparedD2ScienceGoalIds':meta['goalIds'],'preparedD2BindingOnlyGoalIds':meta['bindingOnlyGoalIds'],'additionalUncountedPCRSourceLinkFootprintGoalIds':meta['additionalSourceLinkFootprintGoalIds'],'completedDReviews':0,'completedPReviews':0,'fullBookDigest':model['digest'],'threeGoalBookDigest':manifest['artifacts']['bookModelDigest'],'reviewBundleFingerprint':manifest['artifacts']['bundleFingerprint'],'humanApproval':False,'activeWrites':0})
write(OWN/'native-finalbook-export-and-terminal-processes.receipt.json',{'status':'checkpoint_exports_complete','allActualNativeFinalBookBytesExported':exported_render,'actualPdfAndHtmlExported':True,'actuallyViewedPdfPhysicalPages':[3,4,5],'actualPdfViewImagePaths':[(OWN/f'actual-native-final-pdf-{n}.png').relative_to(ROOT).as_posix() for n in [3,4,5]],'actualSourcePdfPage39Viewed':True,'actualSourcePdfPage39ImagePath':(OWN/'actual-source-2025-page-39.png').relative_to(ROOT).as_posix(),'sourcePdfInputPath':'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf','sourcePdfInputSha256':sha(ROOT/'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'),'sourcePdfDuplicated':False,'htmlInspected':{'goalCount':3,'actualImageAndAltBindingsChecked':True,'publishedOrBrowserAcceptance':False},'nativeProcessTerminalStates':{'isolationPreparation':'exit0','currentFull363ModelBuild':'exit0','sourceV2Application':'exit0','sourceAtlasBuildAndCheck':'exit0','nativeQaGenerationAndCheck':'exit0','prospectiveFull364ModelBuild':'exit0','independentAM2AndFull364Checks':'all exit0','originalSourceContextAndExactVReuseChecks':'exit0','firstPositiveMaterialization':'exit1 reviewId mismatch, corrected metadata only','correctedPositiveMaterializationAndCheck':'exit0, candidates only','firstNativeD2Prepare':'exit1 public Gel PNG path containment, corrected unchanged physical leaf copies','correctedNativeD2Prepare':'exit0','nativeD2Check':'exit0','nativePdfRasterization':'exit0'},'unfinishedNativeProcesses':[],'unfinishedNativeReviews':'both D2 results directories EMPTY; source consumer blocker unresolved','additionalNativeRunsAfterCheckpointInstruction':0,'actualCentralFutureRunPerformed':False,'humanApproval':False,'activeWrites':0})
write(OWN/'active-boundary-and-legacy-preservation.final.receipt.json',{'status':'pass_no_active_adoption','activeChangedPathsFromOtherWork':changed,'changedRegistrySubjectEntryValues':subject_drift,'biologyMathPhysicsRegistryEntryDigestsUnchanged':True,'allActiveBiologyCanonicalSourceAtlasQaLedgerCardsHashesUnchanged':True,'currentStrictReportPath':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-five-current-integration-v1/central-after-five-current-A-M.report.json','currentLiveReportCounts':{'mathematik':'807/807','physik':'478/478','chemie':'85/376','biologie':'38/363'},'protectedFrozenInputs':protected,'all131V1AuthorAnd38V1PreparedFilesUnchanged':True,'all37EarlierSourceHoldCandidateArtifactsUnchanged':True,'isolatedNativeCodeFilesByteIdenticalToInitAndUnmodified':len(native['nativeCodeByteIdentical']),'allNativeBIOConsumerCodeStillEqualToCurrentRoot':True,'observedUnrelatedExternalRootCodeDrift':code_drift,'newWholeRegistryCopyCreated':False,'integrationInstruction':'Use only reviewed BIO deltas on then-latest registry; preserve current Chem85 A/M/root routes. No adoption authorized by this checkpoint.','humanApproval':False,'activeWrites':0})
write(OWN/'unadopted-bio-only-route-deltas.reference.json',{'recordStatus':'reference_only_unadopted','subject':'biologie','candidateOnlyFields':{'semanticAtomicityConfigPath':str(REL/'full-atomicity.candidate.config.json'),'memoryReviewConfigPath':str(REL/'full-memory.candidate.config.json')},'sourceAndCanonicalInputsFreezePath':str(REL/'prepared-inputs.freeze.json'),'sourceAcceptance':'HOLD','newResolutionIndexes':[],'positiveEvidenceApprovalAdded':False,'genericConsumerDevelopmentDeferredToRoot':True,'applyWholeRegistryForbidden':True,'humanApproval':False,'activeWrites':0})
print(json.dumps({'checkpoint':'prepared_export_complete_SOURCE_HOLD','preparedFiles':len(items),'nativeFinalBookFilesExported':len(exported_render),'nativeCodeUnchanged':len(native['nativeCodeByteIdentical']),'DResults':0,'PApprovals':0,'remainingFalseVersionLinks':4,'currentBiology':'38/363','currentChemistry':'85/376','activeWrites':0}))
