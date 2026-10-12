from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

OWN=Path(__file__).resolve().parent.parent
REPO=Path(__file__).resolve().parents[8]
REL=OWN.relative_to(REPO)
E12=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12')
PARENT=E12/'chemie-q3-thirteen-current402-live-context-author-20261012-v2'
def read(p):return json.loads((REPO/p).read_text())
def digest(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):
    p=REPO/p
    assert p.is_file() and not p.is_symlink(),str(p)
    return {'path':str(p.relative_to(REPO)),'bytes':p.stat().st_size,'sha256':digest(p)}
def write(p,data):p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
assert not (OWN/'author-package.freeze.json').exists(),'This author package is already sealed; preserve its bytes.'
parent_manifest=read(PARENT/'FINAL.neutral-input-manifest.json')
join=read(REL/'inputs/FINAL.neutral-whole402-P13-whole28-source-bounded.join.json')
source_bounds=read(REL/'inputs/source-components-and-explicit-sibling-ownership.author.json')
current_external=[]
for old in parent_manifest['externalCurrentAndHistoricalRegularInputBindings']:
    current=bind(Path(old['path']))
    current.update(originalSealedV2Sha256=old['sha256'],matchesOriginalSealedV2Digest=current['sha256']==old['sha256'],
                   evidenceRole='preserved_referenced_source_or_historical_input_not_new_independent_approval')
    current_external.append(current)
originals=[PARENT/'author-package.freeze.json',PARENT/'FINAL.neutral-input-manifest.json',
 E12/'chemie-q3-thirteen-current402-independent-a-20261012-v2/independent-a.original.freeze.json',
 E12/'chemie-q3-thirteen-current402-independent-a-20261012-v2/FINAL.independent-a.manifest.json',
 E12/'chemie-q3-thirteen-current402-independent-b-20261012-v2/ORIGINAL.judgment-seal.json',
 E12/'chemie-q3-thirteen-current402-independent-b-20261012-v2/FINAL.independent-b.manifest.json']
parent_sealed=read(PARENT/'author-package.freeze.json')['rows']
manifest={
 'schemaVersion':1,'role':'sealed_current_author_remediation_neutral_input_not_independent_QA',
 'packagePath':str(REL),'parentSealedPackagePath':str(PARENT),'originalAuthorAndIndependentSealBindings':[bind(p) for p in originals],
 'currentDenominator':402,'currentStrictBaseline':212,'baselineCentralReportNotNewCurrentApproval':True,'wholeCanonicalNodes':523,
 'goalIds':parent_manifest['goalIds'],'excludedParallelQ3v6':parent_manifest['excludedParallelQ3v6'],
 'changedVisualizationGoalIds':read(REL/'independent-QA-plan.neutral.json')['changedVisualizationGoalIds'],
 'changedScientificCaseIds':['q3-18-a','q3-18-b','q3-09-c-qualitative-contribution'],
 'unchangedScientificCaseCount':25,'wholeCaseCount':28,'original28CaseProvenanceCounts':{'preserved':21,'changed':5,'new':2},
 'wholeNeutralJoinPath':str(REL/'inputs/FINAL.neutral-whole402-P13-whole28-source-bounded.join.json'),
 'preciseNeutralDeltaPath':str(REL/'inputs/targeted-v3-delta.neutral.json'),
 'whole402PageModelPath':str(REL/'native/whole402.neutral.normal-model.author.actual.json'),
 'P13CurrentRecordsPath':str(REL/'positive/P13.author.review.jsonl'),
 'whole28CasesPath':str(REL/'positive/whole28.material-task-model-scoring-transfer.de-en.author.json'),
 'wholeSourceDutyContextPath':parent_manifest['wholeSourceDutyContextPath'],
 'wholeSourceDutyUnionBindingsPath':parent_manifest['wholeSourceDutyUnionBindingsPath'],
 'currentSourcePayloadIndexPath':parent_manifest['currentSourcePayloadIndexPath'],
 'currentSourcePayloadDeltasPath':parent_manifest['currentSourcePayloadDeltasPath'],
 'sourceComponentSiblingReconciliationPath':str(REL/'inputs/source-components-and-explicit-sibling-ownership.author.json'),
 'scope13NativeModelPath':str(REL/'native/whole13.normal-model.author.actual.json'),
 'nativeHtmlPath':str(REL/'native/whole13.html'),'nativePdfPath':str(REL/'native/whole13.pdf'),
 'affectedSixNativeModelPath':str(REL/'native/thirteen.normal-model.author.actual.json'),
 'affectedSixNativeHtmlPath':str(REL/'native/six.html'),'affectedSixNativePdfPath':str(REL/'native/six.pdf'),
 'assessmentGraphBindingsPath':str(REL/'positive/assessment-graphs/assessment-graphs.author-calibration.json'),
 'assessmentSheetsHtmlPath':str(REL/'native/assessment-graphs.bilingual.html'),
 'assessmentSheetsPdfPath':str(REL/'native/assessment-graphs.bilingual.pdf'),
 'actualPixelCaptureReceiptPath':str(REL/'checks/actual-native-and-device-capture.receipt.json'),
 'actualAssessmentCaptureReceiptPath':str(REL/'checks/actual-assessment-capture.receipt.json'),
 'authorActualPixelInspectionPath':str(REL/'checks/author-actual-pixel-inspection.json'),
 'qaPlanPath':str(REL/'independent-QA-plan.neutral.json'),
 'sourceAtlasPublishedProposed':381,'curricularAtomicCount':402,'sourceAtlasCountIsNotCurricularDenominator':True,
 'allOriginalImageBytesRetained':True,'fiveCorrectedPngsAreAdditive':True,'retained96fdGoodPngExact':True,
 'authorActualPixelInspectionCompleted':True,'targetedIndependentActualPixelInspectionPending':True,
 'canonicalScientificAndPrerequisiteAndApplicabilityFieldsPreserved':True,'fiveLiveB007FixesRetained':True,
 'sourceMappingAndNormativeRowsChangedFromV2':False,'explicitScopeHoldGoalIds':source_bounds['scopeSelectionHoldGoalIds'],
 'explicitCoupledSourceHoldGoalIds':source_bounds['coupledSourceCompletionHoldGoalIds'],
 'noNewSpecificSourceComponentHoldIdentifiedGoalIds':source_bounds['noNewSpecificHoldGoalIds'],
 'preservedParentWholePackageBindings':parent_sealed,
 'externalCurrentAndHistoricalRegularInputBindings':current_external,
 'oldBiologyAndCentralBindingsAreHistoricalAfterBiologyM7':True,'historicalReviewsAsNewQA':False,
 'wholeP13ScientificE1G1CandidateRecords':True,'newIndependentReview':False,'newIndependentApproval':False,
 'strictGain':0,'wholeSourceUnionApproval':False,'actualOperatorExecutionApproval':False,
 'realHumanLabRunNewPrerequisite':False,'humanTrialNewPrerequisite':False,
 'humanApproval':False,'humanTrial':False,'activeIntegration':False,
 'ownedRegularArtifactBindings':[bind(p.relative_to(REPO)) for p in sorted(OWN.rglob('*')) if p.is_file() and p.name not in ['FINAL.neutral-input-manifest.json','author-package.freeze.json']],
}
write(OWN/'FINAL.neutral-input-manifest.json',manifest)
rows=[bind(p.relative_to(REPO)) for p in sorted(OWN.rglob('*')) if p.is_file() and p.name!='author-package.freeze.json']
assert all(not p.is_symlink() for p in OWN.rglob('*'))
seal={'schemaVersion':1,'role':'immutable_current_author_remediation_package_seal_not_independent_QA',
 'sealedAtUTC':datetime.now(timezone.utc).isoformat(),'fileCount':len(rows),'totalBytes':sum(r['bytes'] for r in rows),
 'rows':rows,'manifestPath':str(REL/'FINAL.neutral-input-manifest.json'),'manifestSha256':digest(OWN/'FINAL.neutral-input-manifest.json'),
 'wholeSourceUnionApproval':False,'newIndependentApproval':False,'humanApproval':False,'humanTrial':False,'strictGain':0,'activeIntegration':False}
write(OWN/'author-package.freeze.json',seal)
print(json.dumps({'manifestPath':seal['manifestPath'],'manifestSha256':seal['manifestSha256'],'sealPath':str(REL/'author-package.freeze.json'),
 'sealSha256':digest(OWN/'author-package.freeze.json'),'fileCount':len(rows),'totalBytes':seal['totalBytes'],
 'externalReferenceMismatchesFromSealedV2':[r['path'] for r in current_external if not r['matchesOriginalSealedV2Digest']]},ensure_ascii=False,indent=2))
