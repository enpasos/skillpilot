from pathlib import Path
import datetime
import hashlib
import json


ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
AUTHOR = BASE / 'chemie-b008-MV-kp-kc-derivation-source-placement-author-root-v2'
OWN = BASE / 'chemie-b008-MV-kp-kc-derivation-source-placement-independent-a-v1'
PREVIOUS = BASE / 'chemie-b008-one-MV-KpKc-source-independent-a-v1'
GOAL = 'a8ddb351-3501-5b6d-a908-c82a5d2f14d4'
SOURCE = 'mv-chem-sekii-mv-ch-sekii-2022-erprobung-q-gleichgewichte-009-dc7fb7b0'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()


def load(path):
    return json.loads(path.read_text())


def binding(path):
    content = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(content).hexdigest(), 'bytes': len(content)}


def write(name, value):
    path = OWN / name
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return path


candidate_path = AUTHOR / 'one-whole-KpKc-two-cases.criteria-current-v3.author-candidate.json'
candidate = load(candidate_path)
set_path = AUTHOR / 'one-derived-positive-profile.criteria-current-v4.author-candidate-set.json'
selected = load(set_path)['goals'][0]
assert candidate['wholeProfile'] == selected['profile']
source_path = AUTHOR / 'MV-one-clause-current-printed23.inactive-source-extraction.json'
source = load(source_path)
source_goal = next(item for item in source['sourceGoals'] if item['id'] == SOURCE)
source_goal_index = source['sourceGoals'].index(source_goal)
mapping_path = AUTHOR / 'MV-one-clause-partial-KpKc.inactive-mapping.review.json'
mapping = load(mapping_path)
edge = next(item for item in mapping['mappings'] if item['legacyGoalId'] == SOURCE)
edge_index = mapping['mappings'].index(edge)
decision = next(item for item in mapping['decisions'] if item['sourceGoalId'] == SOURCE)
decision_index = mapping['decisions'].index(decision)
canonical_path = AUTHOR / 'canonical504-one-KpKc-derived-MV-LK.inactive.json'
canonical = load(canonical_path)
goal = next(item for item in canonical['goals'] if item['id'] == GOAL)
assert goal == candidate['wholeCurrentGoal']
view_path = AUTHOR / 'one-MV-LK-Qualifikationsphase11-12.inactive-unregistered.view.json'
view = load(view_path)
assert view['scope']['jurisdiction'] == 'DE-MV'
assert view['scope']['stage'] == 'SekII' and view['scope']['courseProfile'] == 'LK'
assert source_goal['courseLevel'] == 'LK'
assert source_goal['sourceSpan'].endswith('S. 23')
assert source_goal['rawSourceSpan'].endswith('S. 22')
assert edge['canonicalGoalId'] == GOAL and edge['matchType'] == 'partial'
checks_path = OWN / 'whole-original-preservation-and-independent-seven-numeric-comparisons.actual.json'
checks = load(checks_path)
assert checks['errors'] == [] and all(item['pass'] for item in checks['actualIndependentNumericComparisons'])

criteria = [
    {'id': 'whole-bilingual-operator-fidelity', 'pass': True,
     'pointers': [str(candidate_path.relative_to(ROOT)) + '#/wholeCurrentGoal/description', str(candidate_path.relative_to(ROOT)) + '#/wholeCurrentGoal/descriptionEn'],
     'reason': 'Both complete languages explicitly require ideal-gas derivation, unit-consistent conversion and justified model limits. These retain and sharpen the former conversion/limits duties. No separate laboratory or measurement operator is substituted.'},
    {'id': 'actual-partial-pressure-and-stoichiometric-derivation', 'pass': True,
     'pointers': [str(candidate_path.relative_to(ROOT)) + '#/wholeCases/0/taskDe', str(candidate_path.relative_to(ROOT)) + '#/wholeCases/0/workedAnswerEn', str(candidate_path.relative_to(ROOT)) + '#/wholeCases/1/taskEn', str(candidate_path.relative_to(ROOT)) + '#/wholeCases/1/workedAnswerDe'],
     'reason': 'Each whole case asks the learner to derive each p_i=c_i RT and substitute into the signed product, rather than recall a supplied Kp/Kc formula. Multiplying RT raised to each gaseous nu_i yields the sum Delta n_g. The zero case requires actual cancellation of numerator/denominator RT factors.'},
    {'id': 'dimensions-and-standards', 'pass': True,
     'pointers': [str(candidate_path.relative_to(ROOT)) + '#/wholeCases/0/workedAnswerDe', str(candidate_path.relative_to(ROOT)) + '#/wholeProfile/expectations/1'],
     'reason': 'Unnormalised Kp/Kc carry pressure/concentration powers; p_i/p0 and c_i/c0 give Kp*=Kc*(RT c0/p0)^Delta n_g. The given c0=1 mol/L and p0=1 bar yield the same numbers but no units in the normalised case. R=8.314 Pa m3 requires 50 mol/m3, not 0.050 mol/L. Keeping the concentration number and relabelling Pa as bar contains distinct unit errors.'},
    {'id': 'finite-model-and-equilibrium-truth', 'pass': True,
     'pointers': [str(candidate_path.relative_to(ROOT)) + '#/wholeCases/0/materialDe', str(candidate_path.relative_to(ROOT)) + '#/wholeCases/1/materialEn'],
     'reason': 'The constants and concentrations are explicitly constructed supplied ideal equilibrium models. They are not empirical N2O4/water-gas/ammonia/methanation equilibrium constants, measured yields or evidence of a learner actually running an experiment. Every reaction is atom-balanced.'},
    {'id': 'positive-zero-negative-and-fresh-transfer', 'pass': True,
     'pointers': [str(candidate_path.relative_to(ROOT)) + '#/wholeCases/0/freshVariationEn', str(candidate_path.relative_to(ROOT)) + '#/wholeCases/1/freshVariationDe'],
     'reason': 'Forward dimer Delta n_g=+1, reversed dimer=-1, water-gas shift=0, ammonia=-2 and pure-solid/gas methanation=-1. Reversing stoichiometry, repairing unit/temperature use and excluding a solid are actual changed conceptual conditions. The solid example is a didactic transfer; it is not falsely identified as the actual Boudouard or methanol source duty.'},
    {'id': 'temperature-and-nonideality-limits', 'pass': True,
     'pointers': [str(candidate_path.relative_to(ROOT)) + '#/wholeCases/0/freshWorkedAnswerDe', str(candidate_path.relative_to(ROOT)) + '#/wholeCases/1/workedAnswerEn', str(candidate_path.relative_to(ROOT)) + '#/wholeProfile/expectations/2'],
     'reason': '27 degC is approximately 300 K but inserting the number27 into RT is wrong. Delta n_g=0 cancels the conversion factor at every specified temperature under the same ideal definitions; it does not make either equilibrium constant temperature-independent. At nonideality fugacities replace ideal partial pressures. Pure-phase unit activity is explicitly bounded to the stipulated standard model. No exact universal pressure threshold or unprovided K(T2) is invented.'},
    {'id': 'actual-assessment-rubric-and-two-demonstrations', 'pass': True,
     'pointers': [str(candidate_path.relative_to(ROOT)) + '#/wholeProfile/coverageExpectations', str(candidate_path.relative_to(ROOT)) + '#/wholeProfile/applicationCaseBriefs/0/expectedPerformanceDe', str(candidate_path.relative_to(ROOT)) + '#/wholeProfile/applicationCaseBriefs/1/expectedPerformanceEn'],
     'reason': 'The operational rubric consists of three mandatory content-specific observable performances plus the two expectedPerformance language pairs and complete worked/fresh-worked references. Raw case objects have no separately named rubricDe/rubricEn fields; no such fields are claimed inspected. This closed P-v2 representation genuinely assesses derivation, definitions/units and model-limit transfer. Both cases stand without the picture. Two substantive demonstrations may occur within one task; no extra task-label quota is added.'},
    {'id': 'actual-MV-primary-column-and-course', 'pass': True,
     'pointers': [str(source_path.relative_to(ROOT)) + '#/sourceGoals/' + str(source_goal_index), str(view_path.relative_to(ROOT)) + '#/scope'],
     'reason': 'I actually viewed physical PDF27, printed23. The derivation sentence is in Hinweise und Anregungen within the gray additionally-for-LK block. It is an imperative depth instruction, not a left-column compulsory bullet and not the preceding page22 recommended computer simulation. The document introduction explains gray LK additions and qualifying-phase Gymnasium11/12. The candidate explicitly scopes MV/SekII/LK; HE-Q3 provenance does not determine an MV semester, and there is no GK Kp/Kc obligation inferred.'},
    {'id': 'whole-clause-partner-and-history-preservation', 'pass': True,
     'pointers': [str(mapping_path.relative_to(ROOT)) + '#/mappings/' + str(edge_index), str(mapping_path.relative_to(ROOT)) + '#/decisions/' + str(decision_index)],
     'reason': 'Only the false source009-to-gas-detection edge is replaced in the inactive candidate with a partial source009-to-Kp/Kc edge. The whole gas-detection DEEN goal and other12 gas edges remain exact. All other whole mapping decisions/edges and503 canonical goals remain literal exact. This does not validate those12 edges or release the protected177 gas goal changed source-context binding.'},
]

case_rows = [
    {'id': candidate['wholeCases'][0]['id'], 'wholeDEENCaseActuallyRead': True,
     'assessmentPointers': ['/wholeProfile/expectations/0', '/wholeProfile/expectations/1', '/wholeProfile/applicationCaseBriefs/0/expectedPerformanceDe', '/wholeProfile/applicationCaseBriefs/0/expectedPerformanceEn'],
     'independentReason': 'The learner must construct the partial-pressure product, distinguish units from normalised quotients, repair a genuine SI/L error and reverse the products/exponents. Result1.2471 bar, SI124710 Pa, reversed0.8018603159329645 bar^-1 checked independently. Temperature interpretation is separate from merely replacing numbers.',
     'decision': 'KEEP_MATERIAL_CANDIDATE'},
    {'id': candidate['wholeCases'][1]['id'], 'wholeDEENCaseActuallyRead': True,
     'assessmentPointers': ['/wholeProfile/expectations/0', '/wholeProfile/expectations/2', '/wholeProfile/applicationCaseBriefs/1/expectedPerformanceDe', '/wholeProfile/applicationCaseBriefs/1/expectedPerformanceEn'],
     'independentReason': 'The zero exponent requires meaningful factor cancellation and refutes temperature-independence/high-pressure overreach. New ammonia and heterogeneous-solid stoichiometries require independently determined negative gaseous exponent; the solid-count error is diagnosable. Kc=Kp1.2, total0.3192576bar, ammonia0.0002314727878565209bar^-2 and solid/gas0.004811161895597787bar^-1 checked independently.',
     'decision': 'KEEP_MATERIAL_CANDIDATE'},
]
old_first = PREVIOUS / 'one-MV-KpKc-whole-source-partner.first.independent-A.verdict.json'
holds = [
    {'id': 'MV-DERIVE-A-CONTEXT-001', 'scope': 'whole395 source atlas and whole MV course', 'status': 'HOLD_OUTSIDE_TARGETED_COMPONENT', 'reason': 'One corrected source009 clause, local unregistered MV-LK view and genuine ideal-model P witnesses do not approve all MWG/gas duties, current source-family/programme validity or registered views. Full395 denominator stays unchanged.'},
    {'id': 'MV-DERIVE-A-CONTEXT-002', 'scope': 'protected original177 gas-detection goal source/context binding', 'status': 'HOLD_FOR_TARGETED_CURRENT_INTEGRATION_REVIEW', 'reason': 'Although the entire gas goal and other12 original edges remain exact, one former source connection was removed in the inactive mapping. Its source/context evidence must be targeted and protected before integration; unchanged text is insufficient to treat the affected strict closure as unaffected.'},
    {'id': 'MV-DERIVE-A-CONTEXT-003', 'scope': 'current native D/P/V and historical asset metadata', 'status': 'PENDING_CURRENT_NATIVE_BINDING', 'reason': 'The existing usable JPEG and resource link remain exact and are retained. This is a material/source/A/M science component review, with no new pixel sighting, image production or current native/raster gate approval. Current description changes alter fingerprints and need future exact D/P/V integration evidence.'},
]
first = {
    'schemaVersion': 1, 'role': 'Own actual independent targeted current MV Kp/Kc derivation/source-placement/P/kind/A/M first semantic judgment',
    'createdAt': NOW, 'reviewer': '/root/bio_science14_independent_a; actual model variant unexposed',
    'actualInputFirst': binding(OWN / 'one-derived-MV-KpKc.actual-input.FIRST.independent-A.freeze.json'),
    'actualWholeGoalProfileAndBothBilingualCases': binding(candidate_path),
    'actualCurrentNormalProfileCandidateSet': binding(set_path),
    'wholeCurrentGoalActuallyRead': goal, 'wholeCurrentProfileActuallyRead': candidate['wholeProfile'],
    'wholeCurrentTwoCasesActuallyRead': candidate['wholeCases'],
    'criteriaJudgments': criteria, 'perCaseJudgments': case_rows,
    'scientificDerivationIndependentReason': 'For gas species of a single fixed balanced reaction, signed nu_i yields Qp=product(p_i^nu_i). In the common ideal mixture p_i=(n_i/V)RT=c_iRT, hence Qp=Qc(RT)^sumGasNu. At equilibrium this becomes the dimensional school Kp/Kc relation. Standard-normalised quotients introduce RT c0/p0 instead. The conversions and their validity bounds are consequences of this same relation; they are not separate unrelated routines.',
    'decision': 'KEEP_BOUNDED_DERIVED_MATERIAL_AND_MV_LK_SOURCE_ROLE_AS_AI_CANDIDATE',
    'sourcePartialRelationDecision': 'ACCEPT_BOUNDED_CURRENT_SOURCE009_TO_KPKC_CANDIDATE',
    'sourceEvidence': {'actualOfficialPDF': binding(ROOT / source['sourceDocument']['path']), 'officialURL': source['sourceDocument']['url'], 'liveWholePDFByteBinding': binding(OWN / 'actual-primary/MV-official-live-PDF-byte-binding.actual.json'), 'actualPhysicalPageSeen': 27, 'actualPrintedPage': 23, 'actualPageRasterSeen': binding(OWN / 'actual-primary/MV-physical-page-027.actual-render.png'), 'wholePage26And27TextsActuallyRead': True, 'introductionAndGK_LKColumnsActuallyRead': True, 'wholeSourcePassageAndTenSourceGoalsActuallyRead': True, 'leftColumnCompulsoryBulletClaim': False, 'currentSourceExtraction': binding(source_path), 'currentMapping': binding(mapping_path), 'sourceGoalPointer': '/sourceGoals/' + str(source_goal_index), 'mappingEdgePointer': '/mappings/' + str(edge_index), 'mappingDecisionPointer': '/decisions/' + str(decision_index)},
    'programmeDecision': {'boundedMV2022Gymnasium11_12QualifyingPhaseLKCandidate': 'KEEP', 'actualCandidateView': binding(view_path), 'actualScope': view['scope'], 'registeredCurrentViewApproved': False, 'GKDutyInferred': False, 'HE_Q3AsMVSemesterInferred': False, 'wholeCurrentMVProgrammeApproved': False},
    'semanticKindDecision': {'semanticKind': 'curricularAtomic', 'decision': 'KEEP_CURRENT_ONE_SEMANTIC_KIND', 'reason': 'One assessable conceptual relation joins ideal partial pressures, stoichiometric exponent, conversion and model limits. It is a normal content competence, neither programme/structure, orientation, memory nor terminal assessment. Existing leaf syntax alone was not used.'},
    'semanticAtomicityDecision': {'status': 'atomic', 'semanticAtomic': True, 'reason': 'Derivation, unit-consistent use and justification of model validity assess the same Kp/Kc relationship. Signed exponent changes and standard-state choices are dimensions of this one relation, not independent content bundles.'},
    'memoryDecision': {'status': 'no_memory_needed', 'memoryUseful': False, 'memoryGoalIds': [], 'deckIds': [], 'reason': 'The material provides ideal-gas equations/constants/standard states and requires reconstruction of the relation. Memorising a bare RT power would not show the derivation, correct exponent or model boundary. No new compact independent recall list or deck is justified beyond normal equilibrium foundations.'},
    'actualIndependentNumericalAndPreservationChecks': binding(checks_path),
    'namedEarlierOwnBoundedSourceReviewReuse': {'earlierOwnFirst': binding(old_first), 'earlierOwnFirstSeal': binding(PREVIOUS / 'one-MV-KpKc-source.independent-A.first.freeze.json'), 'reuseScope': 'Exact unchanged primary PDF, historical false gas mapping/source span and pure source operator interpretation; current changed DEEN goal, two material cases, P profile and local MV placement freshly read and judged.'},
    'targetedEarlierOwnFindingRemedies': [
        {'oldFindingId': 'MVKC-A-001', 'outcome': 'RESOLVED_FOR_EXACT_INACTIVE_SOURCE009_SPAN_SUCCESSOR', 'evidencePointer': str(source_path.relative_to(ROOT)) + '#/sourceGoals/60/sourceSpan', 'reason': 'Actual current sourceSpan and sourceRef identify23; rawSourceSpan22 remains historical; broad mixed-passage22 anchor remains unchanged.'},
        {'oldFindingId': 'MVKC-A-002', 'outcome': 'RESOLVED_FOR_EXACT_MATERIAL_AND_GOAL_CANDIDATE', 'reason': 'Whole current DEEN goal explicitly includes derivation. Both complete new cases/expected performances require actual product substitution, signed exponents, units/standard states and conceptual changed-condition transfer.'},
        {'oldFindingId': 'MVKC-A-003', 'outcome': 'BOUNDED_LOCAL_MV_LK_CANDIDATE_REMEDY_ACCEPTED_WHOLE_CURRENT_PLACEMENT_STILL_PENDING', 'reason': 'MV jurisdiction is now explicit and the one actual inactive view says Gymnasium/SekII/LK/qualifying11_12. Whole current registered view/source-version/course context remains outside approval.'},
        {'oldFindingId': 'MVKC-A-004', 'outcome': 'WRONG_EDGE_REJECT_RETAINED_HISTORICALLY_REPLACEMENT_BOUNDED_CANDIDATE_ACCEPTED', 'reason': 'Actual source009 now routes partial to the relation goal; the original gas goal and12other source edges retain their exact original bodies. Its protected strict source-context review is still pending.'},
    ],
    'freshMaterialBlockingFindings': [], 'remainingContextHolds': holds,
    'authorOpinionDisclosure': 'While reading the whole current profile candidate object, its author /goals/0/reason text was printed incidentally. The current mapping rationale and technical kind decisionBasis were subsequently read as candidate metadata. These are disclosed author assertions, not adopted as independent findings. Actual primary raster, whole tasks/answers and my own equation/dimension/numeric reasoning determine this FIRST. No fresh peer outcomes or author technical approval receipts were read.',
    'freshPeerOutcomesReadBeforeFIRST': False, 'authorOpinionAdoptedAsIndependentJudgment': False,
    'newPixelViewsClaimed': 0, 'existingUsableImageKEEPByExactRetention': True, 'newImageProduction': False,
    'currentNativeOrCurrentRasterPApproval': False, 'wholeSourceCourseAtlasApproved': False,
    'oldFirstSealsChanged': False, 'protectedOriginalGasSourceContextApproved': False,
    'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'realLearnerWork': False, 'realExperiment': False, 'clinicalProof': False,
    'humanApproval': False, 'humanTrial': False, 'activeWrites': [], 'strictGain': 0,
}
first_path = write('one-derived-MV-KpKc-science-source-P-kind-AM.actual-FIRST.independent-A.verdict.json', first)
seal_path = write('one-derived-MV-KpKc-science-source-P-kind-AM.actual-FIRST.independent-A.freeze.json', {
    'schemaVersion': 1, 'role': 'Own first semantic verdict freeze before any fresh peer outcomes', 'createdAt': NOW,
    'inputFirst': first['actualInputFirst'], 'firstVerdict': binding(first_path),
    'actualNumericalAndPreservationChecks': binding(checks_path),
    'actualOfficialByteBinding': first['sourceEvidence']['liveWholePDFByteBinding'],
    'actualPrimaryPageSeen': first['sourceEvidence']['actualPageRasterSeen'],
    'freshPeerOutcomesReadBeforeFIRST': False, 'authorOpinionAdoptedAsIndependentJudgment': False,
    'humanApproval': False, 'humanTrial': False, 'activeWrites': [], 'strictGain': 0,
})
print(json.dumps({'first': binding(first_path), 'seal': binding(seal_path), 'freshPeerOutcomesRead': False, 'decision': first['decision']}, ensure_ascii=False, indent=2))
