from pathlib import Path
import datetime
import hashlib
import json


ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
OWN = BASE / 'chemie-b008-MV-kp-kc-derivation-source-placement-independent-a-v1'
AUTHOR = BASE / 'chemie-b008-MV-kp-kc-derivation-source-placement-author-root-v2'
OLD = BASE / 'chemie-b008-one-MV-KpKc-source-independent-a-v1'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()


def read(path):
    return json.loads(path.read_text())


def bind(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write(name, value, jsonl=False):
    path = OWN / name
    assert not path.exists(), path
    path.write_text((json.dumps(value, ensure_ascii=False, separators=(',', ':')) if jsonl else json.dumps(value, ensure_ascii=False, indent=2)) + '\n')
    return path


def verify(value):
    if isinstance(value, dict):
        if 'path' in value and 'sha256' in value:
            path = ROOT / value['path']
            actual = bind(path)
            assert actual['sha256'].removeprefix('sha256:') == value['sha256'].removeprefix('sha256:'), path
            if 'bytes' in value:
                assert actual['bytes'] == value['bytes'], path
        for nested in value.values():
            verify(nested)
    elif isinstance(value, list):
        for nested in value:
            verify(nested)


first_path = OWN / 'one-derived-MV-KpKc-science-source-P-kind-AM.actual-FIRST.independent-A.verdict.json'
first_seal_path = OWN / 'one-derived-MV-KpKc-science-source-P-kind-AM.actual-FIRST.independent-A.freeze.json'
first = read(first_path)
verify(read(first_seal_path))
verify(read(OWN / 'one-derived-MV-KpKc.actual-input.FIRST.independent-A.freeze.json'))
assert first['freshPeerOutcomesReadBeforeFIRST'] is False
terminals = {key: read(OWN / f'checks/ordinary-one-{key}.terminal.actual.json') for key in ['P', 'A', 'M']}
assert all(value['actualExecution'] and value['exitCode'] == 0 and not value['stderr'] for value in terminals.values())
assert 'Configured goals: 1' in terminals['P']['stdout'] and 'Blocking issues: 0' in terminals['P']['stdout']
assert 'Current reviewed atomic: 1' in terminals['A']['stdout']
assert 'Current no-memory decisions: 1' in terminals['M']['stdout']
for key in ['A', 'M']:
    for text in ['Missing review records: 0', 'Stale review records: 0', 'Obsolete review records: 0']:
        assert text in terminals[key]['stdout'], (key, text)

normal_profile_path = OWN / 'normal-one-KpKc-material-P.independent-A.records.jsonl'
normal_profile = read(normal_profile_path)
assert normal_profile['profile'] == first['wholeCurrentProfileActuallyRead']
assert normal_profile['status'] == 'needs_human_review' and normal_profile['reviewAuthority'] == 'ai_candidate'
assert normal_profile['evidenceLevel'] == 'E1' and normal_profile['maximumClaimScope'] == 'G1'
technical = read(OWN / 'one-actual-MV-LK-facet-closed-view-kind-and-retained-JPEG.after-FIRST.independent-A.json')
assert technical['errors'] == []
checks = read(OWN / 'whole-original-preservation-and-independent-seven-numeric-comparisons.actual.json')
assert checks['errors'] == [] and len(checks['actualIndependentNumericComparisons']) == 7
assert checks['other503WholeGoalsExact'] and checks['protectedGasWholeGoalExact']
assert checks['other12OriginalGasEdgesExactNotNewlyApproved']

source_record = {
    'schemaVersion': 1, 'recordType': 'bounded_source_relation_candidate_review',
    'reviewer': '/root/bio_science14_independent_a; independent one-current-derivation reviewer; model variant unexposed',
    'reviewedAt': first['createdAt'], 'goalId': 'a8ddb351-3501-5b6d-a908-c82a5d2f14d4',
    'sourceGoalId': 'mv-chem-sekii-mv-ch-sekii-2022-erprobung-q-gleichgewichte-009-dc7fb7b0',
    'goalFingerprint': normal_profile['goalFingerprint'], 'profileFingerprint': normal_profile['profileFingerprint'],
    'currentCanonical': bind(AUTHOR / 'canonical504-one-KpKc-derived-MV-LK.inactive.json'),
    'currentSourceExtraction': bind(AUTHOR / 'MV-one-clause-current-printed23.inactive-source-extraction.json'),
    'currentMapping': bind(AUTHOR / 'MV-one-clause-partial-KpKc.inactive-mapping.review.json'),
    'sourceGoalPointer': '/sourceGoals/60', 'mappingEdgePointer': '/mappings/268', 'mappingDecisionPointer': '/decisions/60',
    'actualPhysicalPageSeen': 27, 'actualPrintedPage': 23, 'actualColumn': 'Hinweise und Anregungen',
    'actualBlock': 'zusätzlich für den Leistungskurs', 'sourceSpan': 'Qualifikationsphase, Qualifikationsphase: Chemisches Gleichgewicht und Massenwirkungsgesetz, S. 23',
    'rawHistoricalSpan22Retained': True, 'matchType': 'partial', 'decision': 'accept_bounded_partial_candidate',
    'actualGoalAndCaseOperatorCoverage': 'Learner derives p_i=c_iRT from p_iV=n_iRT and the pressure/concentration product from signed gaseous stoichiometric exponents; own unit/standard-state repairs and new reversed/heterogeneous cases assess transfer and validity.',
    'wholeSourceClauseQAClaim': False,
    'scope': {'schoolForm': 'Gymnasium', 'jurisdiction': 'DE-MV', 'stage': 'SekII', 'courseProfile': 'LK', 'programUnitMeaning': 'Qualifikationsphase Gymnasium11/12 in actual2022source'},
    'registeredCurrentMVViewApproved': False, 'wholeCurrentMVProgrammeApproved': False,
    'oldFalseGasEdgeCurrentSourceQuality': 'reject', 'oldFalseGasEdgeHistoricBytesPreserved': True,
    'wholeOriginalGasPartnerAndOther12OriginalEdgesExact': True, 'other12GasEdgesNewlyApproved': False,
    'protected177GasGoalAffectedSourceContextStillPending': True,
    'wholeOtherSourceDutiesWaived': False, 'whole395SourceAtlasApproved': False,
    'actualOwnFIRST': bind(first_path), 'actualOwnFIRSTSeal': bind(first_seal_path),
    'criterionPass': all(value['pass'] for value in first['criteriaJudgments']),
    'criteria': first['criteriaJudgments'], 'remainingContextHolds': first['remainingContextHolds'],
    'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'humanApproval': False, 'humanTrial': False, 'actualExperimentPerformed': False, 'actualLearnerPerformance': False,
    'activeWrites': [], 'strictGain': 0,
}
source_record_path = write('one-current-MV-KpKc-bounded-source-role.independent-A.records.jsonl', source_record, True)
resolution = {
    'schemaVersion': 1, 'role': 'Own targeted actual current derivation/operator/span/MV-LK candidate remedy resolution; historical FIRST remains unchanged',
    'createdAt': NOW, 'originalOwnFirst': bind(OLD / 'one-MV-KpKc-whole-source-partner.first.independent-A.verdict.json'),
    'originalOwnFirstSeal': bind(OLD / 'one-MV-KpKc-source.independent-A.first.freeze.json'),
    'actualSuccessorFirst': bind(first_path), 'actualSuccessorFirstSeal': bind(first_seal_path),
    'rows': first['targetedEarlierOwnFindingRemedies'], 'remainingContextHolds': first['remainingContextHolds'],
    'oldFirstsChanged': False, 'freshPeerResultsRead': False,
    'wholeSourceCurrentCourseNativeApproval': False, 'humanApproval': False, 'activeWrites': [], 'strictGain': 0,
}
resolution_path = write('one-current-MV-KpKc-targeted-old-own-finding-resolution.independent-A.json', resolution)
checks_summary = {
    'schemaVersion': 1, 'role': 'Actual final ordinary material P/A/M and bounded-source/compiler checks, independent scientific FIRST kept separate', 'createdAt': NOW,
    'actualOrdinaryTerminalEvidence': {key: bind(OWN / f'checks/ordinary-one-{key}.terminal.actual.json') for key in ['P', 'A', 'M']},
    'actualNormalP1': {'exitCode': 0, 'configuredGoals': 1, 'approved': 0, 'needsHumanReview': 1, 'rejected': 0, 'blockingIssues': 0, 'reviewedResourceTypes': [], 'scope': 'material-only candidate'},
    'actualNormalA1': {'exitCode': 0, 'atomic': 1, 'missing': 0, 'stale': 0, 'obsolete': 0},
    'actualNormalM1': {'exitCode': 0, 'noMemoryNeeded': 1, 'missing': 0, 'stale': 0, 'obsolete': 0, 'primaryCardsInScope': 0, 'visibilityScopesReviewed': 0},
    'actualOwnFiniteNumerics': {'comparisons': 7, 'pass': 7, 'errors': []},
    'actualNormalScopeCompiler': {'sourceStage': ['SekII'], 'sourceCourse': ['LK'], 'targetGoalIds': ['a8ddb351-3501-5b6d-a908-c82a5d2f14d4'], 'errors': []},
    'sourceCompilerOrFPChecksAloneUsedAsSourceQA': False, 'newWholeSourceAtlasRunClaim': False,
    'newNativeDOrPOrRasterVApproval': False, 'newPixelsReviewed': 0,
    'sourceAllExpected395Reduced': False, 'humanApproval': False, 'humanTrial': False, 'activeWrites': [], 'strictGain': 0,
}
checks_summary_path = write('checks/final-one-P-A-M-source-current-bindings.actual-summary.json', checks_summary)
entry = {
    'schemaVersion': 1, 'role': 'Neutral completed genuine independent one-current MV-LK Kp/Kc derivation, two material cases, bounded source role, semantic kind, atomicity and memory review',
    'createdAt': NOW, 'reviewer': '/root/bio_science14_independent_a; actual model variant unexposed',
    'actualAuthorNeutralEntry': bind(AUTHOR / 'neutral-current-one-derived-MV-LK-KpKc-two-cases-and-normal-P.author-final.entry.json'),
    'actualAuthorFirstSeal': bind(AUTHOR / 'current-one-derived-MV-LK-KpKc.author-final.freeze.json'),
    'ownInputBeforeReview': bind(OWN / 'one-derived-MV-KpKc.actual-input.before-own-review.independent-A.json'),
    'ownInputFirstSeal': bind(OWN / 'one-derived-MV-KpKc.actual-input.FIRST.independent-A.freeze.json'),
    'ownScienceSourcePKindAMFirst': bind(first_path), 'ownScienceSourcePKindAMFirstSeal': bind(first_seal_path),
    'actualCurrentWholeGoalProfileCases': bind(AUTHOR / 'one-whole-KpKc-two-cases.criteria-current-v3.author-candidate.json'),
    'actualCurrentWholeProfileCandidateSet': bind(AUTHOR / 'one-derived-positive-profile.criteria-current-v4.author-candidate-set.json'),
    'actualCurrentCanonical504': bind(AUTHOR / 'canonical504-one-KpKc-derived-MV-LK.inactive.json'),
    'actualCurrentSourceExtraction': bind(AUTHOR / 'MV-one-clause-current-printed23.inactive-source-extraction.json'),
    'actualCurrentMapping': bind(AUTHOR / 'MV-one-clause-partial-KpKc.inactive-mapping.review.json'),
    'actualCurrentLocalMVLKView': bind(AUTHOR / 'one-MV-LK-Qualifikationsphase11-12.inactive-unregistered.view.json'),
    'actualCurrentTechnicalKindInput': bind(AUTHOR / 'kinds395-one-current-goal.technical-candidate.json'),
    'actualIndependentKindConfirmation': bind(OWN / 'one-current-KpKc-kind.actual-independent-confirmation.json'),
    'normalIndependentMaterialP1Config': bind(OWN / 'normal-one-KpKc-material-P.independent-A.config.json'),
    'normalIndependentMaterialP1Records': bind(normal_profile_path),
    'normalIndependentA1Config': bind(OWN / 'normal-one-KpKc-A.independent-A.config.json'),
    'normalIndependentA1Records': bind(OWN / 'normal-one-KpKc-A.independent-A.records.jsonl'),
    'normalIndependentM1Config': bind(OWN / 'normal-one-KpKc-M.independent-A.config.json'),
    'normalIndependentM1Records': bind(OWN / 'normal-one-KpKc-M.independent-A.records.jsonl'),
    'normalIndependentM1EmptyScopedCards': bind(OWN / 'normal-one-KpKc-M.independent-A.empty-scoped-cards.review.jsonl'),
    'ordinaryMaterializationDisclosure': bind(OWN / 'ordinary-one-material-P-A-M.actual-generation-disclosure.json'),
    'independentBoundedSourceRoleRecords': bind(source_record_path), 'targetedOldOwnFindingResolution': bind(resolution_path),
    'actualIndependentWholePreservationAndNumerics': bind(OWN / 'whole-original-preservation-and-independent-seven-numeric-comparisons.actual.json'),
    'actualNormalFacetCompilerKindAndRetainedJPEG': bind(OWN / 'one-actual-MV-LK-facet-closed-view-kind-and-retained-JPEG.after-FIRST.independent-A.json'),
    'actualOfficialPDFLiveByteBinding': bind(OWN / 'actual-primary/MV-official-live-PDF-byte-binding.actual.json'),
    'actualOfficialWholePDF': first['sourceEvidence']['actualOfficialPDF'], 'officialPrimaryURL': first['sourceEvidence']['officialURL'],
    'actualPhysicalPDFPageSeen': 27, 'actualPrintedPDFPage': 23,
    'actualWholePDFPage27View': bind(OWN / 'actual-primary/MV-physical-page-027.actual-render.png'),
    'actualWholePage26Text': bind(OWN / 'actual-primary/MV-physical-page-026.actual-text.txt'),
    'actualWholePage27Text': bind(OWN / 'actual-primary/MV-physical-page-027.actual-text.txt'),
    'wholeBothCaseDEENTasksWorkedTransfersActuallyRead': True, 'wholeCurrentDEENGoalAndAllProfileExpectationsActuallyRead': True,
    'assessmentRubricRepresentationDisclosure': 'Actual criteria are mandatory observablePerformance pairs and applicationCaseBriefs expectedPerformance pairs plus complete worked/fresh-worked references. No separately named rubricDe/rubricEn fields occur in raw case objects, and none are falsely claimed reviewed.',
    'earlierOwnBoundedSourceReview': bind(OLD / 'neutral-completed-one-MV-KpKc-source-independent-A.review.entry.json'),
    'earlierOwnBoundedSourceFinalSeal': bind(OLD / 'completed-one-MV-KpKc-source-independent-A.final.freeze.json'),
    'earlierProtected177GasContextTechnicalDisclosure': bind(OLD / 'protected-original177-gas-partner-context.after-FIRST.technical-countercheck.json'),
    'earlierReviewReuseScope': first['namedEarlierOwnBoundedSourceReviewReuse']['reuseScope'],
    'actualFinalNormalChecks': bind(checks_summary_path),
    'outcomes': {'scientificDerivedMaterialCandidate': 'KEEP', 'boundedSource009ToKpKcPartialCandidate': 'ACCEPT', 'localInactiveMV2022QualifyingPhase11_12LKCandidate': 'KEEP', 'semanticKind': 'curricularAtomic', 'semanticAtomicity': 'atomic', 'memory': 'no_memory_needed', 'normalP1Approved': 0, 'normalP1NeedsHumanReview': 1, 'materialBlockingFindings': 0, 'newPixelViews': 0},
    'remainingContextHolds': first['remainingContextHolds'], 'originalUsableImageRetained': technical['existingActualPrimaryJPEG'],
    'protectedOriginalGasWholeGoalAndOther12EdgesExact': True, 'other503WholeGoalsExact': True,
    'other12OriginalGasEdgesIndependentlyApproved': False, 'protected177GasSourceContextApproved': False,
    'originalRawSpan22AndHistoricalFalseGasBindingsPreserved': True,
    'normalFull395SourceAtlasApproved': False, 'wholeCurrentMVProgrammeApproved': False,
    'registeredCurrentMVViewApproved': False, 'newNativeDOrCurrentRasterPOrVApproved': False,
    'expected395Unchanged': True, 'freshPeerOutcomesRead': False,
    'authorOpinionDisclosure': first['authorOpinionDisclosure'], 'authorOpinionAdoptedAsIndependentJudgment': False,
    'previousFirstSealsChanged': False, 'newImageProduction': False,
    'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'realLearnerWork': False, 'realExperiment': False, 'clinicalProof': False, 'humanApproval': False, 'humanTrial': False,
    'activeWrites': [], 'strictGain': 0,
    'nextNeeded': 'Pair only this exact genuine one-goal science/material/source-role/A/M judgment with an independent nonauthor FIRST. Then author actual native/current-resource bindings and independently inspect changed goal and protected177 gas source-context evidence before integration. Whole395 source/course/registered-view gates remain distinct.',
}
entry_path = write('neutral-completed-one-derived-MV-LK-KpKc-independent-A.review.entry.json', entry)
verify(entry)
outputs = [bind(path) for path in sorted(OWN.rglob('*')) if path.is_file() and not path.is_symlink()]
seal_path = write('one-derived-MV-LK-KpKc-completed-independent-A.final.freeze.json', {
    'schemaVersion': 1, 'role': 'Additive immutable independent bounded one-goal completion; input and semantic FIRSTs unchanged',
    'createdAt': NOW, 'completedEntry': bind(entry_path), 'outputs': outputs,
    'freshPeerOutcomesRead': False, 'oldFirstSealsChanged': False, 'humanApproval': False, 'humanTrial': False, 'activeWrites': [], 'strictGain': 0,
})
verify(read(seal_path))
print(json.dumps({'completedEntry': bind(entry_path), 'finalSeal': bind(seal_path), 'normalP_A_MExitCodes': [terminals[key]['exitCode'] for key in ['P', 'A', 'M']], 'candidateOutcomes': entry['outcomes'], 'freshPeerOutcomesRead': False, 'nativeApproval': False, 'strictGain': 0}, ensure_ascii=False, indent=2))
