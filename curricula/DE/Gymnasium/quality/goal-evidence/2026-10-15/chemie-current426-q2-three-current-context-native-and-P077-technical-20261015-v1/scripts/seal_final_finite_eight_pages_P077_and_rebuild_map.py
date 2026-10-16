# SPDX-License-Identifier: Apache-2.0
"""Endlicher technischer Abschluss; unveränderte eigene Originalwissenschaft."""
from pathlib import Path
import copy,datetime,hashlib,json,os
R=Path.cwd();O=Path(__file__).resolve().parents[1];E=O.parent
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):
 p=R/r['path'];assert ref(p)==r,p;return p
def put(p,d):
 assert not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
p=load(O/'PREPARED.exact-six-body-composition-and-current-binding-inventory.awaiting-b47.json');f=load(O/'INPUTS.final-six-stable-bodies-images-and-successor-material.json');n=load(O/'INPUTS.two-exact-Q2-causal-neighbor-contexts.json')
v8=load(verify(p['V8Selector']));checkpoint=load(verify(p['checkpointSelector']))
sources=[p['V8Selector'],p['authorQ2Selector'],p['PAVSourceSelector'],f['b47FinalSuccessorSelector']]
pa_path=E/'chemie-digestion-polarimetry-two-current426-informed-PA-20261015-v1/OUTPUTS.finite-current426-informed-P2-A2.selector.json'
f4_path=E/'chemie-polarimetry-one-reference-unit-clarification-informed-independent-P1-20261015-v1/OUTPUTS.finite-informed-f4-reference-units-independent-P1.selector.json'
assert ref(pa_path)['sha256']=='sha256:fd768e8f96536f404d7795a1269444a1aaeb9f2a155fd162c4228fbda581d0e7'
assert ref(f4_path)['sha256']=='sha256:b34972bab5e25469fc20e8d14578ec8d98589a8e8652170bde95fa399851f603'
pa=load(pa_path);f4=load(f4_path);sources += [ref(pa_path),ref(f4_path)]
source_seals=[]
for r in sources:
 s=load(verify(r));seal=R/s.get('finalSealPath',s.get('sealPath'))
 for payload in load(seal)['files']:verify(payload)
 source_seals.append({'selector':r,'seal':ref(seal),'allPayloadsVerifiedAfter':True})
canonical=load(verify(f['canonical']));by={g['id']:g for g in canonical['goals']}
old={g['id']:g for g in load(verify(checkpoint['canonical']))['goals']};v8goals={g['id']:g for g in load(verify(v8['canonical']))['goals']}
assert len(by)==570 and sum(by[g]==old[g] for g in by)==564 and sum(by[g]==v8goals[g] for g in by)==567
semantic=load(R/f['semanticOutputPath']);oldsem=load(verify(p['baselineSemantic']))
assert semantic['counts']==oldsem['counts'] and semantic['counts']['curricularAtomic']==426
semchanges=[]
for before,after in zip(oldsem['decisions'],semantic['decisions']):
 assert {k:v for k,v in before.items() if k!='sourceFingerprint'}=={k:v for k,v in after.items() if k!='sourceFingerprint'}
 if before!=after:semchanges.append(after['goalId'])
assert set(semchanges)==set(p['Q2GoalIds'])
qa=load(verify(f['visualizationQA']));oldqa=load(verify(p['baselineQA']));qr={r['goalId']:r for r in qa['records']};oq={r['goalId']:r for r in oldqa['records']}
assert len(qr)==len(oq)==443 and sum(qr[g]==oq[g] for g in qr)==441 and all(r['visualizationState']=='available' for r in qr.values())
hist=lambda r:{k:v for k,v in r.items() if k.startswith(('human','chatGpt')) or k in ['umlautsCorrectChatGpt','contentApprovedChatGpt']}
assert all(hist(qr[g])==hist(oq[g]) for g in qr)
origlines=(R/f['currentP077Source']['records']['path']).read_text().splitlines();newlines=(O/'positive/P11.ten-original-lines-and-one-077-image-input-transport.jsonl').read_text().splitlines()
assert len(origlines)==len(newlines)==11
assert sum(a==b for a,b in zip(origlines,newlines))==10
changed=[(json.loads(a),json.loads(b)) for a,b in zip(origlines,newlines) if a!=b];assert len(changed)==1
before,after=changed[0];assert before['goalId']==after['goalId']=='0773a104-aaeb-5e96-a615-2a2bec3eb096'
assert {k:v for k,v in before.items() if k!='reviewInputFingerprint'}=={k:v for k,v in after.items() if k!='reviewInputFingerprint'}
for r in f['currentP077Source']['runs']:verify(r)
for r in f['stockModules']:verify(r)
v8inputs=load(R/load(verify(p['V8Selector']))['frozenInputs']['path'])
for r in v8inputs['stockModelAndComponentSnapshot']:verify(r)
for s in v8inputs['sourceReviews']:
 for r in [s['selector'],s['first'],s['seal']]+s['sealPayloads']:verify(r)
for b in ['six','neighbor-two']:
 root=O/('pages-'+b);selector=load(root/'NEUTRAL.actual-current-native-pages-and-review-input.selector.json')
 for payload in load(R/selector['finalSealPath'])['files']:verify(payload)
 for side in ['a','b']:assert list((O/('native-'+b)/('round-'+side)/'results').iterdir())==[]
 assert list((O/('native-'+b)/'resolutions').iterdir())==[]
checks=[]
for path in sorted((O/'checks').glob('*.receipt.json')):
 d=load(path)
 if 'exitCode' in d:
  verify(d['stdout']);verify(d['stderr']);checks.append({'receipt':ref(path),'exitCode':d['exitCode']})
expected_pass=['02-P077-stock-positive-profile-check','03b-NATIVE-six-public-root-corrected-prepare','03b-NATIVE-six-public-root-corrected-check','04-NATIVE-neighbor-two-preflight','04-NATIVE-neighbor-two-prepare','04-NATIVE-neighbor-two-check','01c-actual-neighbor-contexts-final-corrected-serialization']
for label in expected_pass:assert load(O/('checks/'+label+'.receipt.json'))['exitCode']==0
assert len([c for c in checks if c['exitCode']!=0])==3
actual_routes=load(verify(pa['wholeActualCasesAndProfiles']));row0=next(r for r in actual_routes['rows'] if r['goalId'].startswith('0b534'))
triple=load(verify(f4['exactTriple']));assert len(triple['cases'])==3
authorf4=load(verify(f4['authorSelector']));authortriple=verify(authorf4['completeCaseTriple']) if 'completeCaseTriple' in authorf4 else E/'chemie-polarimetry-one-reference-unit-clarification-author-successor-20261015-v1/AUTHOR.f4-three-whole-cases.two-exact-one-unit-corrected.json'
assert ref(authortriple)['sha256']=='sha256:b56dc642ef442fa8452ab09d4e8fee2fd2eecd14973ad8d10f7e876354055c6f' and load(authortriple)==triple
raw077=E/'chemie-tensid-structure-choice-one-missing-image-author-20261015-v1/inputs/P-cases.two-whole-selected.exact.json';cases077=load(raw077);assert len(cases077['cases'])==2
rawcasepack=O/'inputs/NEUTRAL.six-targets-fourteen-whole-actual-current-cases-and-rubrics.json'
put(rawcasepack,{'schemaVersion':1,'role':'Nur vollständiges neutrales Fallmaterial; keine D-Urteile, keine neue Wissenschaft',
 'Q2ThreeWholeRoutes':load(verify(f['currentSevenWholeRoutes']))['wholeCaseRoutes'],
 'digestionWholeOriginalRowAndRubric':row0,'polarimetryExactCurrentThreeWholeCases':triple,
 'tensidExactTwoWholeCases':cases077,'actualSixGoalCaseCounts':{p['goalIds'][0]:3,p['goalIds'][1]:2,p['goalIds'][2]:2,p['goalIds'][3]:2,p['goalIds'][4]:3,p['goalIds'][5]:2},
 'totalActualSixTargetCases':14,'originalFFecCaseBriefsRetainedWithoutInventingSeparateRubrics':True,
 'b47OnlyExactSuppliedFictionalSuccessorCase2IsCurrent':True,'f4OnlyExactExplicitReferenceUnitSuccessorExecution1IsCurrent':True,
 'oldHeldCaseObjectsRemainHistoricalAtTheirOriginalSources':True,'normalPRecordsCreatedHereForTheseFiveGoals':0})
owncontext=load(R/p['wholeCurrentGoalContext']['path']);allids=p['goalIds']+n['goalIds']
whole8=O/'inputs/NEUTRAL.eight-whole-current-goals-and-exact-own-profile-inputs.json'
put(whole8,{'schemaVersion':1,'goalIds':allids,'wholeGoals':[by[g] for g in allids],
 'wholeImmediateCanonicalContexts':owncontext,'actualSixBookProfileInputs':[json.loads(l) for l in (R/f['finalBookProfilesPath']).read_text().splitlines()],
 'actualTwoNeighborOwnCurrentPInputs':[json.loads(l) for l in (R/n['exactOwnProfiles']['path']).read_text().splitlines()],
 'bookProfilesFor0bAndF4AreNull':True,'otherExistingOriginalAuthorProfileReferences':pa['wholeActualCasesAndProfiles'],
 'obsoleteF4ExecutionBriefInOldAuthorProfileIsNotCurrentMaterial':True,
 'currentActualMaterial':ref(rawcasepack),'noHistoricalOrPeerDRecords':True})
neutrals=[ref(O/('pages-'+b)/'NEUTRAL.actual-current-native-pages-and-review-input.selector.json') for b in ['six','neighbor-two']]
neutral=O/'NEUTRAL.final-eight-actual-pages-whole-current-goals-and-fourteen-cases.selector.json'
put(neutral,{'schemaVersion':1,'role':'Vollständige neutrale aktuelle achtseitige Eingabeselektion für zwei frische unabhängige D-Rollen; keine historischen/Peer-D-Urteile',
 'goalIds':allids,'actualPages':8,'nativeBatches':neutrals,'canonical':f['canonical'],'semantic':ref(R/f['semanticOutputPath']),'visualizationQA':f['visualizationQA'],
 'wholeCurrentGoalsAndOwnProfileInputs':ref(whole8),'wholeActualSixTargetCasesAndRubrics':ref(rawcasepack),'actualCaseCountForSixTargets':14,
 'additionalTwoNeighborWholePProfiles':n['exactOwnProfiles'],'additionalNeighborProfileCaseBriefCount':5,
 'Q2LiteralCurrentSourceContributions':p['rawLiteralSourceAndMemory'],'digestionPolarimetryLiteralSourceAndMethodReads':pa['boundedSourcesAndMethods'],
 'finalF4RawAuthorTriple':ref(authortriple),'finalB47RawAuthorPair':f['b47CompletePair'],
 'independenceBoundary':'Nur ganze aktuelle Ziele, Quellenbeiträge, tatsächliche Seiten, Material/Fälle/Rubriken und eigene aktuelle P-Profile. Keine alten oder Peer-D-Urteile. Die beiden Rollen urteilen selbst.',
 'materialAddendumFinal':True,'allEightRenderedPagesUnchangedAfterFinalMaterialPin':True,'newScientificVotes':0,'newDescriptionRecords':0,'HumanApproval':False,'HumanTrial':False})
basemap=load(verify(checkpoint['exactRebuildRecipe']));correction=load(O/'checks/CORRECTION.missing-private-full426-single-placement-view-alias.json')
aliases={a['normalHostAlias']:copy.deepcopy(a) for a in basemap['aliases']}
for alias,src,physical in [(f['normalCanonicalPath'],f['canonical'],True),(f['normalSemanticPath'],ref(R/f['semanticOutputPath']),False),(f['normalQAPath'],f['visualizationQA'],True),(correction['normalPrivateAlias'],correction['installedPreviouslySealedSinglePlacement426Source'],False)]:aliases[alias]={'normalHostAlias':alias,'physicalRepositorySource':src,'physicalWithinHost':physical,'materialization':'Private regular JSON' if physical else 'Read-only repository reference'}
hardlinks=load(O/'checks/CORRECTION.native-public-root-selected-eight-readonly-hardlinks.json')
mapfile=O/'REBUILD.final-current426-Q2-three-eight-native-pages-P077.physical-map.json'
put(mapfile,{'schemaVersion':1,'role':'Exakter endlicher privater Hostaufbau mit finaler SinglePlacement-QS-View; keine aktive Anwendung',
 'executionHost':f['executionHost'],'sourceBaselineMap':checkpoint['exactRebuildRecipe'],'aliases':list(aliases.values()),'stockPhysicalModules':f['stockModules'],
 'selectedCurrentAssetRows':f['imageRows'],'selectedReadOnlyPublicImageHardlinks':hardlinks['selectedImages'],'allOtherImageAliasesAreReadOnlySymlinks':True,
 'legacyQaDispositionDiscoveryInput':basemap['legacyQaDispositionDiscoveryInput'],'canonicalDiscoveryRegularJsonFiles':1,
 'canonical':f['canonical'],'semantic':ref(R/f['semanticOutputPath']),'finalQA':f['visualizationQA'],'P077TransportConfig':ref(O/'config/P11.only077-image-input-transport.normal.config.json'),
 'actualNativeSelectors':neutrals,'privateHostsCreated':1,'physicalRasterByteCopies':0,'selectedHardlinks':8,'sourceWritesOrChmod':0,'oldHostWrites':0,'activeWrites':0,
 'replayRule':'Install all final aliases, override the baseline normal view with the exact SinglePlacement426 source, copy stock code unchanged, and make only the eight selected public image aliases private hardlinks. Do not write through source aliases.'})
audit=O/'checks/FINAL.finite-whole-object-source-and-actual-action.audit.json'
put(audit,{'schemaVersion':1,'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'wholeGoals':570,'curricularAtomic':426,'otherWholeGoalsExactVersusCheckpoint':564,'otherWholeGoalsExactVersusV8':567,
 'all570SemanticClassificationsUnchanged':True,'onlyMechanicalSemanticSourceFPRefreshes':semchanges,'QARecords':443,'QAAvailable':443,'other441WholeQAObjectsExactToV8':True,'all443HumanLegacyHistoriesExact':True,
 'P077OnlyReviewInputFingerprintChanged':True,'otherTenPRecordLinesByteExact':True,'P077ProfileReasonStatusReviewerTimesRunIdsExact':True,'allOriginalPRunsUnchangedHistoricalScienceSources':True,
 'exactSelectedScienceAndInputSealsAfter':source_seals,'eightOriginalVisualFIRSTsAndAllSealedPayloadsStillExact':True,'stockModelRendererGoalCardCssSnapshotsExact':True,
 'actualNativeBatchSizes':[6,2],'actualSuccessfulNativePrepareCalls':2,'actualNativeCheckCalls':2,'actualPDFRenders':2,
 'preservedFailedPreNativeModelAttempts':2,'preservedFailedNativePrepareBeforeBundleRender':1,'allActualCommandReceipts':checks,
 'explicitFullModelExports':0,'centralRuns':0,'newDRecords':0,'newScientificVotes':0,'HumanApproval':False,'HumanTrial':False,'M7Granted':False,
 'openRuntimeFindingsRemainUnchanged':checkpoint['openRuntimeAndGlobalVisualFindings'],'oldImmutableV8AndPhase2Writes':0,'rasterByteCopies':0,'selectedReadOnlyHardlinks':8})
selector=O/'OUTPUTS.finite-current426-Q2-three-Native8-and-P077.technical-selector.json';seal=O/'FILES.finite-current426-Q2-three-Native8-and-P077.seal.json'
put(selector,{'schemaVersion':1,'role':'Endlicher rein technischer inaktiver Paketstand: drei ganze Q2-Autorenbodies, echte Native6+2-Kontexte und nur077-P-Bildinputtransport',
 'canonical':f['canonical'],'semantic':ref(R/f['semanticOutputPath']),'visualizationQA':f['visualizationQA'],'neutralReviewerInputs':ref(neutral),'actualNativePageSelectors':neutrals,
 'P077TransportConfig':ref(O/'config/P11.only077-image-input-transport.normal.config.json'),'P077TransportRecords':ref(O/'positive/P11.ten-original-lines-and-one-077-image-input-transport.jsonl'),'P077TransportProvenance':ref(O/'positive/TRANSPORT.only077-current-image-input.exact-provenance.json'),
 'actualP077StockCheck':ref(O/'checks/02-P077-stock-positive-profile-check.receipt.json'),'actualNeighborContextFingerprintAudit':ref(O/'checks/ACTUAL.current-neighbor-page-context-fingerprints.read-only.json'),
 'requiredOwnCurrentDPageGoalIds':allids,'causalChangedOwnNeighborDPageGoalIds':n['goalIds'],'historicalDIndicesAndRecordsUnmodified':True,
 'actualWholeGoalCount':570,'actualCurricularAtomicCount':426,'otherWholeGoalsExactToCheckpoint':564,'semanticClassificationsUnchanged':570,
 'wholeAvailableActualSixTargetCases':14,'neighborOwnWholeProfileBriefs':5,'finalB47Material':f['b47CompletePair'],'finalF4Material':ref(authortriple),
 'exactRebuildRecipe':ref(mapfile),'finiteTechnicalAudit':ref(audit),'actualActionReceipts':checks,
 'nativeSixPrepareAttempts':2,'nativeSixSuccessfulPrepareCalls':1,'nativeSixCheckCalls':1,'nativeTwoPrepareAttempts':1,'nativeTwoCheckCalls':1,'actualBoundedPdfRenders':2,
 'P077StockBindingPass':True,'currentF4PConfigBeforeNewGenuinePReview':0,'newP5A5NormalSerializationPerformed':False,
 'readyForTwoGenuineIndependentCurrentDReviews':True,'readyForCentral':False,'strictCompletionReady':False,'M7Granted':False,'HumanApproval':False,'HumanTrial':False,
 'newScientificVotes':0,'newDescriptionRecords':0,'centralRuns':0,'newFullModelFiles':0,'runtimeWrites':0,'activeRegistryWrites':0,'gitWrites':0,'oldEvidenceWrites':0,
 'privateHostsCreated':1,'physicalRasterByteCopies':0,'selectedReadOnlyImageHardlinks':8,'finalSealPath':seal.relative_to(R).as_posix()})
files=sorted(x for x in O.rglob('*') if x.is_file());assert not any(x.is_symlink() for x in O.rglob('*'))
for x in files:
 if x.suffix=='.json':load(x)
 elif x.suffix=='.jsonl':
  for line in x.read_text().splitlines():
   if line.strip():json.loads(line)
put(seal,{'schemaVersion':1,'sealedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Endlicher technischer Gesamtstand; separate neutrale Native6/2-Siegel bleiben exakt','files':[ref(x) for x in files],'sourceScienceSeals':source_seals,'newScienceVotes':0,'newDescriptionRecords':0,'HumanApproval':False,'M7Granted':False})
for r in load(seal)['files']:verify(r)
print(json.dumps({'selector':ref(selector),'seal':ref(seal),'neutralReviewerInputs':ref(neutral),'canonical':f['canonical'],'semantic':ref(R/f['semanticOutputPath']),'QA':f['visualizationQA'],'rebuildMap':ref(mapfile),'NativePages':8,'actualCasesForSix':14,'otherWholeGoalsExact':564,'P077':'StockPASS; only image-bound reviewInputFingerprint changed; other10lines byteexact','noNewDOrScience':True}),flush=True)
