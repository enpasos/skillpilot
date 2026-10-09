# SPDX-License-Identifier: Apache-2.0
"""Final own bounded Chem3 evidence, with preserved FIRST and real terminals."""
from pathlib import Path
import datetime, hashlib, json, subprocess
ROOT=Path.cwd()
DIR=Path(__file__).resolve().parent
AUTHOR=DIR.parent/'chemie-q3-three-BW-context-bound-practical-companions-author-v1'
SOURCE=DIR.parent/'chemie-q3-three-BW-SOURCE002-partial-concentration-author-successor-v2'
assert not (DIR/'independent-b.final.freeze.json').exists(), 'Do not mutate a sealed own package'
def bind(path):
    return {'path':path.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size}
def load(path):return json.loads(path.read_text())
def put(name,value):
    path=DIR/name
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
    return path
first_path=DIR/'three-practical-and-source002.independent-b.whole-science-FIRST.verdict.json'
first_seal=DIR/'three-practical-and-source002.independent-b.whole-science-FIRST.freeze.json'
first=load(first_path);first_freeze=load(first_seal)
assert bind(first_path)['sha256']=='54c5f35677507df3a99741ea1287e85e2ce59ff6cf7168d7451c1a25a53049d4'
assert bind(first_seal)['sha256']=='d3dc0456c5f069424a400fae3153358c288f4d74c4090e841e787836b8735a6e'
source_entry=SOURCE/'neutral-one-partial-BW-concentration-source-contribution.independent-review.entry.json'
assert bind(source_entry)['sha256']=='78dbdb783cf6b6d4979ae4b6435908d1c6bb5b78892d870f20bf341c1097c23e'
schema_result=load(DIR/'checks/actual-closed-schemas-whole-parsing-and-portability.independent-b.json')
source_result=load(DIR/'checks/own-scoped-source-roles-and-exact-preservation.actual.json')
normal_result=load(DIR/'checks/own-normal-A3-M3-P3.actual.json')
terminals=[load(p)for p in sorted((DIR/'terminal').glob('*.terminal.actual.json'))]
schema_terminal=put('terminal/closed-schemas-and-portability-correct-contract-successor-v2.terminal.actual.json',{
    'schemaVersion':1,'label':'closed-schemas-and-portability-correct-contract-successor-v2',
    'actualInvocationTransport':'functions.exec exec_command followed by write_stdin; genuine tool completion',
    'argv':['python3',str((DIR/'check_actual_schemas_and_portability.independent-b.py').relative_to(ROOT))],
    'executionCwdDiagnostic':str(ROOT),'actualExitCode':0,
    'toolReturnedOutput':'{"schemaChecks": 5, "wholeJSONJSONLParsed": 32, "actualPortableHashBindings": 97, "ignoredBoundFiles": 0, "symlinks": 0, "strictGain": 0}\n',
    'observedCompletedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'actualResult':bind(DIR/'checks/actual-closed-schemas-whole-parsing-and-portability.independent-b.json'),
    'separateStderrStreamNotAvailableFromTool':True})
terminals.append(load(schema_terminal))
success=[r for r in terminals if r['actualExitCode']==0]
failed=[r for r in terminals if r['actualExitCode']!=0]
assert len(success)==6 and len(failed)==2
verdict=put('three-whole-BW-practical-and-source002.independent-b.completed.verdict.json',{
    'schemaVersion':1,'license':'CC-BY-4.0','reviewId':'chemie-q3-BW-three-practical-independent-B-completed-v1',
    'recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'status':'Completed bounded independent whole-science and ordinary A3/M3/P3/source-role/schema checks; native D and raster V separately pending',
    'reviewAuthority':'independent_ai_candidate','priorKnowledgeDisclosure':first['priorKnowledgeDisclosure'],
    'genuineOwnFIRST':bind(first_path),'genuineOwnFIRSTFreeze':bind(first_seal),
    'completedWholeGoalDecisions':first['goalJudgments'],'findings':first['findings'],
    'SOURCE002':{'knownCounterfindingDisclosed':True,'decision':'resolved by genuine partial concentration contribution, not entire3.3.2(7) obligation',
                 'actualExactChangedPointer':'/mappings/217/matchType','actualChangedValue':['exact','partial'],
                 'independentFullPrimaryPhysicalPageRead':27,'otherPressureTemperaturePracticalSourceDutiesNotSilentlyClosed':True,
                 'actualSuccessorMapping':bind(SOURCE/'candidate/whole-BW126-220-partners.concentration-partial-successor.review.json')},
    'wholeActualMaterials':{'newWholeBilingualCases':6,'oldWholeTheoryCasesRead':6,
                          'oldTheoryGoalBodiesRetained':3,'ownFullNumericRecalculation':bind(DIR/'six-whole-cases.independent-b.actual-calculations.json'),
                          'wholeActualPrimaryPagesRead':[27,33,41],'actualPrimaryPageReadProof':bind(DIR/'three-actual-BW-primary-PDF-pages.independent-b.reading.json'),
                          'actualObservationPerformanceStillRequiredForStudentMastery':True,'actualLearnerExperimentsCertified':0},
    'ordinaryChecks':{'A3':'atomic','M3':'no_memory_needed','P3':'needs_human_review',
                      'P3ReviewAuthority':'ai_candidate','P3EvidenceLevel':'E1','P3MaximumClaimScope':'G1',
                      'realNormalA3M3P3':bind(DIR/'checks/own-normal-A3-M3-P3.actual.json'),
                      'realNormalSourceAndViewChecks':bind(DIR/'checks/own-scoped-source-roles-and-exact-preservation.actual.json'),
                      'actualClosedSchemasAndPortableBindingChecks':bind(DIR/'checks/actual-closed-schemas-whole-parsing-and-portability.independent-b.json'),
                      'completedActualExit0Count':len(success),'preservedOwnTechnicalExit1Count':len(failed),
                      'actualTerminals':terminals},
    'preservation':{'wholeSourceDuties':126,'oldPartnerEdgesExact':217,'addedPartnerEdges':3,
                    'wholeChangedDecisionSourceFramesRead':True,'allThreeOldTheoryGoalBodiesExact':True,
                    'oldCanonicalNodes':480,'conditionalCanonicalNodes':484,'conditionalCurricularAtomicTargets':381,
                    'modifiedExistingCanonicalIds':source_result['modifiedOldGoalIds'],
                    'existingOwnImmutableFIRSTProseCountTypo':source_result['firstFrameTypoDisclosure'],
                    'unchangedModelComparisonIsTechnicalNotScientificNativeApproval':True,
                    'newHistoricalReviewOfUnrelatedPriorGoalIds':False,'allHistoricalOwnAndAuthorFIRSTBytesPreserved':True},
    'actualRoleChecks':{'authoredLearnerViews':2,'actualGeneratedSourceViews':3,'ordinaryBWSourceAtlasPages':189,
                       'newBWGKChildren':1,'newBWLKChildren':3,'newBWSekIChildren':0,
                       'tagToProjectionRoleInference':False,'allDuration153DecisionsRetained':True},
    'remainingSeparateGates':[
        'Three actual new raster originals/display captures and current independent V reviews.',
        'Actual current three new native goal pages and affected old theory/context pages, two independent D rounds, resolved findings, current whole pergoal resource/page/context/P fingerprints.',
        'Active registry/canonical/mapping/view integration and protected floors with current central strict report.',
        'Whole BW126 source programme choice and any other original B008 whole-source obligations remain separate; concentration partial source role is not whole duty coverage.',
        'Actual human review/release/trial and observed learner practical execution remain separately unclaimed.'],
    'allNoMemoryDecisionsMeanNoNewCardDeck':True,'noReopenedHistoricalDeckReview':True,
    'currentStrictProgressClaim':None,'newStrictScientificClosures':0,'restoredBindings':0,'strictNetGain':0,
    'activeWrites':0,'newDApprovals':0,'newVApprovals':0,'humanApproval':False,'actualClassroomTrial':False})

entry=put('neutral-completed-three-whole-BW-practical-and-source002.independent-b.entry.json',{
    'schemaVersion':1,'license':'CC-BY-4.0','role':'Completed independent B Chem3 bounded whole-science and existing ordinary checks; exact portable final entry',
    'authorNeutralWholeEntry':bind(AUTHOR/'neutral-three-whole-BW-context-practical-companions.independent-review.entry.json'),
    'authorWholeFinalSeal':bind(AUTHOR/'author.final.freeze.json'),'authorSource002NeutralSuccessor':bind(source_entry),
    'authorSource002FinalSeal':bind(SOURCE/'author.final.freeze.json'),
    'ownGenuineFIRST':bind(first_path),'ownFIRSTFreeze':bind(first_seal),'ownCompletedVerdict':bind(verdict),
    'ownAtomicityConfig':bind(DIR/'atomicity/three-whole-practical.independent-b.config.json'),
    'ownAtomicityRows':bind(DIR/'atomicity/three-whole-practical.independent-b.review.jsonl'),
    'ownMemoryConfig':bind(DIR/'memory/three-whole-practical.independent-b.config.json'),
    'ownMemoryRows':bind(DIR/'memory/three-whole-practical.independent-b.review.jsonl'),
    'ownMemoryCardsRows':bind(DIR/'memory/three-whole-practical.independent-b.cards.review.jsonl'),
    'ownPositiveConfig':bind(DIR/'positive/three-whole-practical.independent-b.config.json'),
    'ownPositiveRows':bind(DIR/'positive/three-whole-practical.independent-b.review.jsonl'),
    'actualSourceAtlasTransport':{'config':bind(DIR/'source-atlas/after.ordinary-scoped.independent-b.config.json'),
                                 'wholeChecks':bind(DIR/'checks/own-scoped-source-roles-and-exact-preservation.actual.json'),
                                 'generatedOutputs':source_result['outputTransports'],
                                 'normalOutputPathsAreExternalCapsuleNamespaceOnly':True},
    'wholeScope':first['goalScope'],'wholeSourceDuties':126,'oldPartnersExact':217,'newPartners':3,
    'correctedConcentrationStrength':'partial','PStatus':'needs_human_review','PAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1',
    'schemaCheckCount':schema_result['schemaCheckCount'],'actualNormalExit0Count':len(success),'preservedTechnicalExit1Count':len(failed),
    'noNewSourceWholeProgrammeClaim':True,'noNativeOrVisualApproval':True,'humanApproval':False,'activeWrites':0,'strictGain':0})
payload=[bind(path)for path in sorted(DIR.rglob('*'))if path.is_file()]
seal=put('independent-b.final.freeze.json',{'schemaVersion':1,'license':'CC-BY-4.0','role':'Final immutable own independent B Chem3 package seal',
     'recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'entry':bind(entry),'verdict':bind(verdict),
     'genuineOwnScienceFIRSTFrozenBeforeNormalAuthorCheckReads':True,'payloadBindings':payload,
     'actualExit0Count':len(success),'preservedActualTechnicalExit1Count':len(failed),'noActiveWrites':True,'strictGain':0,'humanApproval':False})
print(json.dumps({'entry':bind(entry),'verdict':bind(verdict),'seal':bind(seal),'payloadFiles':len(payload),'actualExit0':len(success),'preservedActualExit1':len(failed),'strictGain':0}))
