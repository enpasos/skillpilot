# SPDX-License-Identifier: Apache-2.0
"""Neutral exact-byte technical handoff after ordinary targeted checks."""
from pathlib import Path
import datetime,hashlib,importlib.util,json,shutil,sys
import jsonschema
R=Path('/home/enpasos/projects/skillpilot');P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-protected-twelve-current-native-technical-author-20261010-v1');D=R/P
C=R/'tmp/m7-resumption-20261010/chemistry-b008-protected-twelve-native-author/isolated-normal-capsule'
O=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-whole-P26-native-continuation-author-20261010-v1')
assert not (D/'author.final.freeze.json').exists()
def ref(f):
 f=Path(f);b=(R/f).read_bytes();return {'path':str(f),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(f,x):
 a=D/f;a.parent.mkdir(parents=True,exist_ok=True);a.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def read(f):return json.loads((D/f).read_text())

helper_names=['materializeGoalDescriptionRolloutBatch.ts','goalBookModel.ts','goalBookRenderer.ts','exportGoalBookReviewBundle.ts','createGoalDescriptionReviewCampaign.ts','validateGoalDescriptionReviewCampaign.ts','validateGoalDescriptionDualRoundResolution.ts','validateGoalDescriptionReviewDualRound.ts','positiveGoalEvidenceReview.ts','positiveGoalEvidenceProfileModel.ts','goalEvidenceProfileModel.ts','semanticAtomicityReview.ts','memoryCardReview.ts']
helpers=[]
for name in helper_names:
 source=Path('app/scripts')/name;original=R/source;executed=C/source;assert original.read_bytes()==executed.read_bytes()
 own=P/'technical/unchanged-standard-helper-sources'/name;(R/own).parent.mkdir(parents=True,exist_ok=True);shutil.copy2(original,R/own)
 helpers.append({'normalCurrentRepositoryHelper':ref(source),'wholeExactOwnSourceCopy':ref(own),'actualExecutedCapsuleSourceMatchesExactly':True})
put(Path('checks/unchanged-normal-machinery-and-contract-boundaries.actual.json'),{'schemaVersion':1,'normalPreparationAPI':'prepareGoalDescriptionRolloutBatch','actualCLI':'app/scripts/materializeGoalDescriptionRolloutBatch.ts prepare/check --config native/current-12.normal-rollout.batch.config.json','helpers':helpers,'normalOneBatchPerRound':True,'maximum20ContractPreserved':True,'normalScopeGoalCount':12,'helperInstrumentation':False,'schemaInstrumentation':False,'selectorLimitBypass':False,'normalRendererUnmodified':True,'noSourceAtlasCompilerRerunOrBypass':True,'capsuleLocationDiagnosticOnly':str(C),'activeWrites':[],'strictGain':0})

whole_asset_copies=[]
for row in read('assets/protected12-exact-current-raster-bindings.actual.json')['rows']:
 for label in ['canonicalOriginal','publicOriginal']:
  original=R/row[label]['path'];capsule=C/row[label]['path'];assert original.read_bytes()==capsule.read_bytes();whole_asset_copies.append({'goalId':row['goalId'],'role':label,'original':row[label],'capsuleRegularFile':capsule.is_file()and not capsule.is_symlink(),'exactWholeBytesMatched':True})
put(Path('checks/actual-old-canonical-and-public-raster-capsule-copies.json'),{'schemaVersion':1,'wholeExactCanonicalAndPublicRasterCopies':whole_asset_copies,'selectedCanonicalCopyCount':12,'selectedPublicCopyCount':12,'allRegular':True,'pixelChanges':0,'independentImageApproval':False})

active=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
assert ref(active)['sha256']=='sha256:de99a87c79fa64f30144232223994635f69c76c88547d0cd40ff3b0fb590a44f'
registry=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
live_chem=next(s for s in json.loads((R/registry).read_text())['subjects']if s['subject']=='chemie')
old_chem=next(s for s in read('inputs/protected/current-central-registry.exact-technical-snapshot.json')['subjects']if s['subject']=='chemie')
assert live_chem==old_chem
put(Path('checks/active-chemistry-inputs-exact-preservation.actual.json'),{'schemaVersion':1,'activeChemistryCanonical':ref(active),'wholeActiveChemistryRegistryObject':live_chem,'wholeActiveChemistryRegistryObjectExactVsFrozenP26':True,'registrySnapshotMayIncludeSeparateBiologyUpdates':True,'wholeActiveChemistryNodeCount':487,'wholeActiveChemistryCurricularAtomicCount':381,'currentStrict180Ids':read('checks/actual-full381-to398-protected180-context-deltas.json')['protectedStrict180Ids'],'activeChemistryWrites':[],'newScientificStrictClosures':0,'restoredStrictBindings':0,'strictGain':0})

# Actual capture command outcomes already observed by the execution tools.
for label,script,stdout in [('actual-whole12-native-html-capture','node technical/capture_native12.mjs','{"actualWholeHtmlPageCount":12,"allBoundOriginalRastersDecoded":true,"independentApproval":false}\n'),('actual-whole12-native-pdf-capture','python technical/capture_native12_pdf.py','{"actualWholePdfPageCount": 12, "allPdfGoalIdsConfirmed": true, "independentApproval": false}\n')]:
 f=P/'terminal'/f'{label}.stdout.actual.txt';(R/f).write_text(stdout)
 put(Path(f'terminal/{label}.terminal.actual.json'),{'schemaVersion':1,'label':label,'actualObservedToolExitCode':0,'actualCommand':script,'executionCwdDiagnosticOnly':str(R),'stdout':ref(f),'outcomeSource':'Actual exec_command/write_stdin completion observed before sealing','noSecondCaptureRun':True})

delta=read('checks/actual-full381-to398-protected180-context-deltas.json');finger=read('checks/whole12-old-records-and-current-normal-P-A-M-kind-fingerprints.actual.json');manifest=read('native/current-12/batch-manifest.json');model=read('native/current-12/bundle/book-model.json');profiles=read('native/current-12/bundle/review-input.json')
assert len(model['pages'])==12 and len(profiles['pages'])==12 and all(x['evidenceProfile']is not None for x in profiles['pages'])
assert set(manifest['goalIds'])==set(delta['actualDeltaGoalIds'])
assert read('checks/actual-whole12-native-html-captures.technical.json')['actualWholeHtmlPageCount']==12
assert read('checks/actual-whole12-native-pdf-captures.technical.json')['actualWholePdfPageCount']==12
rounds=[]
for side in ['a','b']:
 q=Path(f'native/current-12/round-{side}');campaign=read(q/'description-review-campaign.json');assert len(campaign['batches'])==1 and len(campaign['batches'][0]['goalIds'])==12
 assert campaign['blindToOtherReviews'] is True
 rounds.append({'side':side,'wholeNormalCampaign':ref(P/q/'description-review-campaign.json'),'wholeNormalV3Input':ref(P/q/'description-review-input.json'),'wholeNormalBundleManifest':ref(P/q/'review-bundle-manifest.json'),'wholeNormalBatchInputs':[ref(f.relative_to(R))for f in sorted((D/q/'batches').glob('*.input.jsonl'))],'normalRoundId':campaign['roundId'],'normalIndependenceGroupId':campaign['independenceGroupId'],'currentIndependentScientificRecordCount':0})

terminal=[]
for f in sorted((D/'terminal').glob('*.terminal.actual.json')):
 x=json.loads(f.read_text());terminal.append({'proof':ref(f.relative_to(R)),'label':x['label'],'actualExitCode':x.get('actualExitCode',x.get('actualObservedToolExitCode'))})
put(Path('checks/all-actual-terminal-outcomes.actual-index.json'),{'schemaVersion':1,'terminalOutcomes':terminal,'originalFailuresRetained':True,'successfulNormalNativePrepareAndCheck':True,'successfulNormalTargetedAtomicityChecks':7,'successfulNormalTargetedMemoryChecks':1,'successfulNormalPInputContractChecks':7,'noIndependentScientificReviewFromTechnicalCheck':True})

entry_name=Path('neutral-protected12-whole-current-native-context.independent-review.entry.json')
entry={'schemaVersion':1,'preparedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Neutral inactive technical Native12 handoff for independent current context review; no scientific self-review','scopeGoalIds':manifest['goalIds'],'scopeGoalCount':12,'scopeDerivation':'Actual complete normal Before381/After398 delta over exact current strict180 IDs; no prior8 selector','wholeExistingP26AuthorEntry':ref(O/'neutral-whole26-current-material-P-and-native20-plus6.independent-review.entry.json'),'wholeExistingP26AuthorFreeze':ref(O/'author.final.freeze.json'),'wholeActiveCurrent487ChemistryBasis':{'nodeCount':487,'curricularAtomicCount':381,'strictCompleteCount':180,'wholeStrict180Current381IdSets':ref(P/'inputs/active-basis/current487-exact-strict180-ID-sets-and-terminal-checks.exact.json'),'wholeUnmodifiedCanonical':ref(P/'inputs/active-basis/current-whole-active-canonical.exact.json'),'exactActivePreservation':ref(P/'checks/active-chemistry-inputs-exact-preservation.actual.json')},'wholeInactive511Candidate':{'nodeCount':511,'curricularAtomicCount':398,'wholeCanonical':ref(P/'inputs/candidate/current-whole511-398-B008.inactive.json'),'wholeKinds':ref(P/'inputs/candidate/current511.semantic-kinds.inactive.json'),'wholeQAUnapproved':ref(P/'inputs/candidate/current-whole-QA.native-unapproved.inactive.json'),'denominatorApproval':False},'wholeBeforeAfterCurrentGoalAndPageAndRequiresContexts':ref(P/'checks/actual-full381-to398-protected180-context-deltas.json'),'wholeNormalBeforeAfterWithP12Inputs':ref(P/'checks/normal-full381-to398-with-whole-P12-inputs.actual.json'),'actualFingerprintAndScientificBodyBindings':ref(P/'checks/whole12-old-records-and-current-normal-P-A-M-kind-fingerprints.actual.json'),'actualFiveRequiresGoalIds':[x['goalId']for x in delta['rows']if x['actualChangedWholeGoalFields']],'actualFingerprintDeltas':{'PReviewInput':5,'PGoal':0,'PProfile':0,'atomicity':0,'memory':0,'semanticKindSource':5},'wholeUnmodifiedOldDAndPBindings':ref(P/'inputs/protected/whole12-current-goal-page-context-source-image-and-prior-D-P-bindings.actual.json'),'wholeUnmodifiedAAndMBodiesAndTargetedInputs':ref(P/'inputs/whole-existing-A-M-and-normal-target-bindings.actual.json'),'wholeNormalNativeBundle':{'batchConfig':ref(P/'native/current-12.normal-rollout.batch.config.json'),'batchManifest':ref(P/'native/current-12/batch-manifest.json'),'bookModel':ref(P/'native/current-12/bundle/book-model.json'),'wholeHTML':ref(P/'native/current-12/bundle/book.html'),'wholePDF':ref(P/'native/current-12/bundle/book.pdf'),'wholeProfilesAndPageInput':ref(P/'native/current-12/bundle/review-input.json'),'wholeBundleManifest':ref(P/'native/current-12/bundle/manifest.json'),'normalCampaigns':rounds,'actualIndependentReviews':0},'wholeActualOldCanonicalPublicRasterCopies':ref(P/'assets/protected12-exact-current-raster-bindings.actual.json'),'wholeActualCapsuleRasterBytes':ref(P/'checks/actual-old-canonical-and-public-raster-capsule-copies.json'),'actualWholeHTMLBrowserCaptures':ref(P/'checks/actual-whole12-native-html-captures.technical.json'),'actualWholePDFCaptures':ref(P/'checks/actual-whole12-native-pdf-captures.technical.json'),'wholeCurrentSourceInputsAndHolds':{'wholeDocumentExtractionMappingPartnerInventory':ref(P/'inputs/source/whole-current-source-documents-extractions-partners-and-holds.actual-index.json'),'wholeOriginal1646Duties':ref(P/'inputs/source-boundaries/whole-original1646-B008-source-duty-inventory.exact.json'),'wholeOriginalSourcePartnerAMFrame':ref(P/'inputs/source-boundaries/whole-original-source-partner-AM-frame.exact.json'),'wholeActualMissing43AndRetainedFamilyPartners':ref(P/'inputs/source/exact-current43-source-HOLD-19-existing-and24-new-child-classification.actual.json'),'wholeNormalCompilerActualHold':ref(P/'inputs/source-boundaries/normal-current398-whole-source-atlas-candidate.actual.json'),'actualCurrentAtlasCoverage':355,'candidateExpectedCoverage':398,'missing24NewChildren':24,'missing19OldOmissions':19,'actualUnresolvedScopeCount':496,'wholeOriginalDirectPartnerEdges':1180,'source19CourseHoldsPreserved':True,'newSourceApprovals':0},'unchangedNormalMachinery':ref(P/'checks/unchanged-normal-machinery-and-contract-boundaries.actual.json'),'allActualTerminalOutcomes':ref(P/'checks/all-actual-terminal-outcomes.actual-index.json'),'reviewInstructions':['Review all twelve current full Native pages and whole Before/After objects and actual prerequisites/reverseRequires, using complete P bodies, prior independent D inputs, exact rasters and whole source/course holds.','The five current P input fingerprints are only technical candidates. Decide actual targeted P/context validity independently before any binding adoption.','Do not turn generation, unchanged A/M fingerprints, exact raster copies or normal schema/contract passes into scientific D/P completion, source approval, M7 or human acceptance.'],'honestRemainingGates':['Two actual independent targeted current D/context rounds for all12','Actual independent P-context decisions for the5 requires/P-input changes','Independent goal/semantic-kind-context evaluation for5 true requires changes; unchanged A/M and KEEP raster bodies remain reused evidence','Whole P26/source43/source19/course holds remain separate','Any later active integration and central/floor/LayerA/publication checks remain separate operations'],'statusBoundary':{'newScientificDApprovals':0,'newScientificPApprovals':0,'newSourceApprovals':0,'newScientificStrictClosures':0,'restoredStrictBindings':0,'strictGain':0,'activeWrites':[],'humanApproval':False,'humanTrial':False}}
put(entry_name,entry)

spec=importlib.util.spec_from_file_location('normal_validate_schemas',R/'scripts/validate_schemas.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
schema=json.loads((R/'docs/landscape-runtime.schema.json').read_text());parsed=[]
for f in sorted(D.rglob('*')):
 assert not f.is_symlink(),str(f)
 if not f.is_file():continue
 if f.suffix=='.json':json.loads(f.read_text());assert module.validate_file(str(f),schema);parsed.append(str(f.relative_to(R)))
 elif f.suffix=='.jsonl':
  for i,line in enumerate(f.read_text().splitlines(),1):
   if line.strip():json.loads(line)
  parsed.append(str(f.relative_to(R)))
for f in ['inputs/active-basis/current-whole-active-canonical.exact.json','inputs/candidate/current-whole511-398-B008.inactive.json']:
 jsonschema.validate(instance=read(f),schema=schema)
symlink_errors=module.curriculum_symlink_errors(R);assert not symlink_errors,symlink_errors
put(Path('checks/normal-targeted-schema-jsonl-and-curriculum-symlink-errors.actual.json'),{'schemaVersion':1,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ordinarySchemaScript':ref(Path('scripts/validate_schemas.py')),'ordinaryRuntimeSchema':ref(Path('docs/landscape-runtime.schema.json')),'normalValidateFileUsed':True,'wholeActive487AndInactive511RuntimeSchemasPassed':True,'completeOwnJsonAndJsonlParsePassed':True,'parsedFiles':parsed,'actualParsedFileCount':len(parsed),'allOwnFilesRegularNoSymlink':True,'normalCurriculumSymlinkErrors':symlink_errors,'actualExitCode':0,'noHelperOrSchemaInstrumentation':True,'scientificApprovals':0,'activeWrites':[],'strictGain':0})
for f in [entry_name,Path('checks/normal-targeted-schema-jsonl-and-curriculum-symlink-errors.actual.json')]:json.loads((D/f).read_text())
files=[ref(f.relative_to(R))for f in sorted(D.rglob('*'))if f.is_file()]
freeze={'schemaVersion':1,'sealedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Final inactive normal Native12 technical-author exact handoff, no scientific self-review or adoption','entry':ref(P/entry_name),'wholeExactOwnFiles':files,'wholeOwnFileCount':len(files),'wholeOwnByteCount':sum(x['bytes']for x in files),'scopeGoalIds':manifest['goalIds'],'wholeNodeCandidateCount':511,'wholeCurricularAtomicCandidateCount':398,'wholeActiveNodeCount':487,'wholeActiveCurricularAtomicCount':381,'protectedCurrentStrictGoalCount':180,'actualProtectedContextDeltaCount':12,'actualWholeGoalRequiresDeltaCount':5,'actualCurrentNormalCampaignCount':2,'actualCurrentIndependentScientificReviewCount':0,'actualWholeHtmlCaptures':12,'actualWholePdfCaptures':12,'normalFinalValidation':ref(P/'checks/normal-targeted-schema-jsonl-and-curriculum-symlink-errors.actual.json'),'newScientificStrictClosures':0,'restoredStrictBindings':0,'strictGain':0,'newSourceApprovals':0,'humanApproval':False,'humanTrial':False,'activeWrites':[]}
put(Path('author.final.freeze.json'),freeze)
for row in files:assert ref(Path(row['path']))==row
verification={'schemaVersion':1,'verifiedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'wholeFinalFreeze':ref(P/'author.final.freeze.json'),'wholeEntry':ref(P/entry_name),'wholeExactBoundFilesVerified':len(files),'allWholeBoundBytesExact':True,'actualExitCode':0,'humanApproval':False,'activeWrites':[],'strictGain':0}
put(Path('author.final.freeze.verification.actual.json'),verification)
print(json.dumps({'entry':ref(P/entry_name),'freeze':ref(P/'author.final.freeze.json'),'wholeOwnFiles':len(files),'normalFinalSchemaJsonlSymlinkExitCode':0,'actualIndependentScientificReviews':0,'activeWrites':0,'strictGain':0},ensure_ascii=False))
