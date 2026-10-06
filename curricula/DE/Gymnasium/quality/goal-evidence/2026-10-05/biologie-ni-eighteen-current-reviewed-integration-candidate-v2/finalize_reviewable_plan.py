#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Freeze an inactive, science-backed and file-specific integration proposal."""
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,shutil,importlib.util
ROOT=Path('/home/enpasos/projects/skillpilot')
BASE=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05')
OWN=BASE/'biologie-ni-eighteen-current-reviewed-integration-candidate-v2'
OUT=ROOT/OWN
CODE=ROOT/'tmp/biologie-ni-eighteen-current-reviewed-integration-candidate-v2-native-root'
REG=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
POLICY=Path('app/scripts/config/curriculum-maturity-floor-policy.json')
IMP=Path('curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-ni-five-kept-native-import-bindings-v1')
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p):return json.loads(Path(p).read_text())
def write(p,d):Path(p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
spec=importlib.util.spec_from_file_location('prep',OUT/'prepare_inactive_native.py');prep=importlib.util.module_from_spec(spec);spec.loader.exec_module(prep)
pending=read(OUT/'integration-plan.pending-science.json');pre=read(OUT/'preflight-current49-and-frozen-evidence.actual.json')
current=read(OUT/'active-before-current-biologie.actual.json');future=read(OUT/'future-central-biologie-actual-check.stdout.txt')
old=current['subjects'][0];new=future['subjects'][0]
assert old['strictComplete']==49 and old['denominator']==365 and not old['issues']
assert new['strictComplete']==67 and new['denominator']==383 and not new['issues']
assert all(c['status']=='pass' for c in new['requiredChecks']) and len(new['requiredChecks'])==6
assert set(old['strictCompleteGoalIds'])<=set(new['strictCompleteGoalIds'])
newids=set(read(OUT/'positive.eighteen.current.candidates.json')['goals'][i]['goalId'] for i in range(18))
assert set(new['strictCompleteGoalIds'])-set(old['strictCompleteGoalIds'])==newids
write(OUT/'future-central-biologie.actual.json',future)
science=read(OUT/'frozen-independent-science-adoption-and-positive-split.actual.json')
guardsets=pre['frozenInputSets']+science['newVerifiedRootFreezeSets']+[read(OUT/'actual-additional-seven-primary-source-independent-authority.json')]
guardsets+=[prep.freeze_guard(BASE/'biologie-ni-eighteen-current-independent-p-v1/independent-positive-review.final.freeze.json','b5e9f37e4a1f503c34b63015585fc79d21270b8a9a752b54023f762ec2daffc1')]
verified=[prep.freeze_guard(Path(g['manifestPath']),g['manifestSHA256']) for g in guardsets]
for receipt in ['full-atomicity-actual-check','full-memory-actual-check','positive.one-existing-current-context-materialize','positive.one-existing-current-context-verify','positive.one-existing-current-context-check','positive.five-kept-current-metadata-materialize','positive.five-kept-current-metadata-verify','positive.five-kept-current-metadata-check','positive.thirteen.independent-current-check','positive.two-existing-exact-check','future-central-biologie-actual-check','active-before-current-biologie','generic-supersession-chain-focused-test','native-final-current-model-sources','generic-checker-existing-rollout-suite']:
 assert read(OUT/(receipt+'.actual.receipt.json'))['exitCode']==0,receipt

# Verify all existing selected inputs and immutable asset bytes before building
# the list that a later, explicitly authorized parent application may use.
files=[]
for row in pending['explicitFutureDeltaFiles']+read(OUT/'actual-standard-native-atlas-output-deltas.json')['changedFiles']:
 row=dict(row);src=ROOT/row['prospectiveCopyPath'];dst=ROOT/row['futureActivePath'];row['sha256']=sha(src)
 assert sha(dst)==row['activeSHA256Before'],row['futureActivePath']
 files.append(row)
registrycopy=OUT/'prospective-input-tree'/REG
files.append({'futureActivePath':str(REG),'prospectiveCopyPath':str(registrycopy.relative_to(ROOT)),'sha256':sha(registrycopy),'activeSHA256Before':pending['currentRegistrySHA256']})
assert sha(ROOT/REG)==pending['currentRegistrySHA256']
assert len({f['futureActivePath'] for f in files})==len(files)==9
for asset in pending['explicitFutureAssetInstallFiles']:
 assert sha(ROOT/asset['immutableReviewedSourcePath'])==asset['sha256']
 dst=ROOT/asset['futureActivePath'];assert (sha(dst) if dst.is_file() else None)==asset['activeSHA256Before']
assert len(pending['explicitFutureAssetInstallFiles'])==72
rawbefore=(ROOT/REG).read_text();rawfuture=registrycopy.read_text();before=prep.spans(rawbefore);after=prep.spans(rawfuture)
assert all(before[s][3]==after[s][3] for s in before if s!='biologie')
policy=read(ROOT/POLICY);assert len(policy['floors'])==9 and not policy['exceptions']
floorbase=BASE/'chemie-biologie-q1-bacteria-e7-integration-v1';floorreceipt=floorbase/'stable-protected-maturity-floors-after-e7.terminal.receipt.json';floorstdout=floorbase/'stable-protected-maturity-floors-after-e7.stdout.txt'
assert read(ROOT/floorreceipt)['exitCode']==0 and '9 protected curricula' in (ROOT/floorstdout).read_text()

# Entire pages are checked again against the immutable model. Native QA path
# rebinding changed global source digests, not a single pedagogical page field.
amodel=read(ROOT/IMP/'fresh-native-metadata-only-future-full.book-model.json');model=read(OUT/'prospective-current-standard.book-model.json')
assert len(model['pages'])==383 and model['pages']==amodel['pages']
write(OUT/'final-all383-whole-pages-standard-consumer-and-independent-audit.actual.json',{'immutableReferenceModelPath':str(IMP/'fresh-native-metadata-only-future-full.book-model.json'),'immutableReferenceModelSHA256':sha(ROOT/IMP/'fresh-native-metadata-only-future-full.book-model.json'),'actualFinalStandardModelPath':str(OWN/'prospective-current-standard.book-model.json'),'actualFinalStandardModelSHA256':sha(OUT/'prospective-current-standard.book-model.json'),'actualFinalBookDigest':model['digest'],'all383WholePagesAndOrderExact':True,'nativeModelAndSelectedSourceCompilerOnly':True,'newPDFOrHTMLOrReviewBundleClaim':False,'separateTechnicalAuditAgent':'/root/bio_original_sources_binding/ni_reviewed_guard_audit','auditCompletedAtUTC':'2026-10-05T22:37:13.380+00:00','auditFinalQaSHA256':'f56bba139091c0b774338322244537abdb50b67ab2da12745bc463af9d6ec686','auditFinalStandardModelSHA256':'f385791bdbd8d00ed8872f2fb4c90f20d5b5aaf9b1c2a9db5e51e29fdcc2d309','technicalAuditIsNotIndependentScientificApproval':True})
entry=read(OUT/'proposed-biologie-registry.entry.reviewed.json')
deps=[]
for p in [OWN/'NI.current-reviewed.mapping.snapshot.json',OWN/'NI.current-reviewed.source.snapshot.json',Path(entry['semanticAtomicityConfigPath']),Path(entry['memoryReviewConfigPath'])]+[Path(p) for p in entry['positiveEvidenceConfigPaths'] if p.startswith(str(OWN))]:deps.append({'path':str(p),'sha256':sha(ROOT/p)})
plan={'schemaVersion':1,'status':'inactive_reviewed_candidate_ready_for_parent_scientific_and_file_review','preparedAtUTC':datetime.now(timezone.utc).isoformat(),'activeApplicationPerformed':False,'activeScientificNetIncrease':0,'futureStrictComplete':67,'futureAtomicDenominator':383,'futureNewScientificClosureCount':18,'futureNewScientificClosureGoalIds':sorted(newids),'futureRestoredExistingDescriptionSourceBindingsCount':5,'futureRestoredExistingDescriptionSourceBindingGoalIds':read(ROOT/BASE/'biologie-ni-ten-current-native-author-candidate-v2/prospective-paths.json')['existingSourceContextGoalIds'],'existingPositiveInnerProfileChanged':False,'protectedCurrent49GoalIds':old['strictCompleteGoalIds'],'current49ReportPath':str(OWN/'active-before-current-biologie.actual.json'),'current49ReportSHA256':sha(OUT/'active-before-current-biologie.actual.json'),'future67ReportPath':str(OWN/'future-central-biologie.actual.json'),'future67ReportSHA256':sha(OUT/'future-central-biologie.actual.json'),'actualFutureRequiredChecks':new['requiredChecks'],'actualCurrentRequiredChecks':old['requiredChecks'],'actualFutureGates':new['gates'],'requiredFrozenIndependentScientificInputSets':verified,'explicitReplaceFiles':files,'explicitNewAssetAndPromptFiles':pending['explicitFutureAssetInstallFiles'],'explicitCanonicalFieldDeltas':pending['explicitCanonicalFieldDeltas'],'explicitNewWholeGoalIds':pre['newWholeGoalIds'],'explicitWholeSourceDeltaEvidencePath':str(OWN/'actual-current-source-operators-groups-and-unaffected-holds-protection.json'),'explicitActualExisting49CitationDeltaEvidencePath':str(OWN/'actual49-selected-native-original-source-citation-deltas.json'),'whole383PageProtectionEvidencePath':str(OWN/'final-all383-whole-pages-standard-consumer-and-independent-audit.actual.json'),'existingP2ByteExactAndP1SeparateFromP5AndP13':True,'protectedOtherRawSubjectRegistryObjectsSHA256':pending['protectedOtherRawRegistryEntries'],'immutableNewConfigurationDependencies':deps,'floorProtection':{'policyPath':str(POLICY),'policySHA256':sha(ROOT/POLICY),'exceptions':[],'allNineCurrentFloors':policy['floors'],'actualCurrentNineFloorReceiptPath':str(floorreceipt),'actualCurrentNineFloorReceiptSHA256':sha(ROOT/floorreceipt),'actualCurrentNineFloorStdoutPath':str(floorstdout),'actualCurrentNineFloorStdoutSHA256':sha(ROOT/floorstdout),'actualCurrentNineFloorsPass':True,'futureFullStatusAndNineFloorRecheckAfterParentApplyRequired':True,'futureNineFloorsPassClaimed':False,'protectedCurrentMathStrictComplete':807,'protectedCurrentPhysicsStrictComplete':478},'sourceHoldsRemainOpen':{'global9f73WholeGoalUnchanged':True,'HE39AndOtherUnscopedHoldBodiesAndBindingsUnchanged':True,'partialMappingsAreNotCompleteNormativeCoverage':True,'noUnreviewedBoundaryCaseCounted':True},'futureStandardOriginalSourcesPath':str(OWN/'prospective-current-standard.original-sources.json'),'futureStandardOriginalSourcesSHA256':sha(OUT/'prospective-current-standard.original-sources.json'),'standardNativePublicationFollowUpRequiredAtStableIntegration':True,'humanApproval':False,'humanTrial':False,'machineQaOnly':True,'parentReviewAndExplicitApplyRequired':True,'newFilesNeedNotReplaceHistoricalSourcesOrOriginalReviews':True,'postApplyRequiredChecks':['current combined central report with all registered subjects','actual full curriculum-quality status and nine protected maturity floors','dependent Layer-A original-source/ontology/schema and visualization asset checks','in-flight ledger ownership and truthful package retirement']}
# Open goals keep their bodies and stay outside the strict intersection. The
# corrected NI source selection can intentionally change their NI witnesses;
# do not describe those wrong old witnesses as unchanged valid evidence.
plan['sourceHoldsRemainOpen'].pop('HE39AndOtherUnscopedHoldBodiesAndBindingsUnchanged')
plan['sourceHoldsRemainOpen']['HE39MappingSelectionAndActualHistoricalSourceBytesPreserved']=True
plan['sourceHoldsRemainOpen']['all316PreviousOpenCurrentIdsStillOpen']=set(old['currentGoalIds'])-set(old['strictCompleteGoalIds'])<=set(new['currentGoalIds'])-set(new['strictCompleteGoalIds'])
plan['sourceHoldsRemainOpen']['correctedNISourceWitnessChangesExplicitlyDocumentedNotSilentlyCarried']=True
assert plan['sourceHoldsRemainOpen']['all316PreviousOpenCurrentIdsStillOpen']
codeproof=read(OUT/'generic-supersession-chain-native-code.actual.json')
plan['requiredReviewedCheckerCode']=[{'path':r['path'],'sha256':r['currentCopiedCodeSHA256']} for r in codeproof['codeFiles']]
assert all(sha(ROOT/r['path'])==r['sha256'] for r in plan['requiredReviewedCheckerCode'])
write(OUT/'integration-plan.reviewed.json',plan)
write(OUT/'final-history-science-and-current-input-protection.actual.json',{'verifiedFrozenInputSets':verified,'referencedFrozenFilesVerified':sum(g['actualFrozenFilesVerified'] for g in verified),'allNineReplaceFileBeforeHashesExact':True,'all72ImmutableReviewedAssetsAndPromptsExactAndNewPathsAbsent':True,'allOtherRawSubjectRegistryObjectsExact':True,'noActiveInputWrites':True,'actualNativeCurrent49AndFuture67WithSixPassChecks':True,'noHumanApprovalOrTrial':True})
shutil.copy2(__file__,OUT/Path(__file__).name)
print(json.dumps({'readyInactiveReviewedPlan':True,'actualCurrent':49,'actualFuture':67,'atomic':383,'newScience':18,'existingSourceBindingRepairs':5,'replaceFiles':len(files),'newAssetsAndPrompts':72,'currentNineFloorsPass':True,'futureNineFloorRecheckStillRequired':True,'activeWrites':0,'verifiedFrozenInputFiles':sum(g['actualFrozenFilesVerified'] for g in verified)}))
