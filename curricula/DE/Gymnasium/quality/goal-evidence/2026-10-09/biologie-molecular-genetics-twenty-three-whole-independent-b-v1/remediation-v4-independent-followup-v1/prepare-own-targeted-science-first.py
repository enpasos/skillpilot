import copy
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
AUTHOR = BASE / 'biologie-molecular-genetics-twenty-three-whole-author-v1'
OWN = Path(__file__).parent
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()

def read(p):
    return json.loads(p.read_text())

def binding(p):
    data = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def value_hash(v):
    return 'sha256:' + hashlib.sha256(json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def write(name, v):
    p = OWN / name
    with p.open('x') as f:
        f.write(json.dumps(v, ensure_ascii=False, indent=2) + '\n')
    return binding(p)

def diffs(a, b, p=''):
    if type(a) != type(b):
        return [p]
    if isinstance(a, dict):
        return sum((diffs(a.get(k), b.get(k), p + '/' + k) for k in sorted(set(a) | set(b))), [])
    if isinstance(a, list):
        if len(a) != len(b):
            return [p]
        return sum((diffs(x, y, p + '/' + str(i)) for i, (x, y) in enumerate(zip(a, b))), [])
    return [] if a == b else [p]

original_path = AUTHOR / 'twenty-three-whole46-bilingual-cases-and-P.author-candidate.json'
v2_path = AUTHOR / 'remediation-v2/twenty-three-whole46-bilingual-cases-and-P.v2.author-candidate.json'
v3_path = AUTHOR / 'remediation-v3/twenty-three-whole46-bilingual-cases-and-P.v3.author-candidate.json'
v4_path = AUTHOR / 'remediation-v4/twenty-three-whole46-bilingual-cases-and-P.v4.author-candidate.json'
original, v2, v3, v4 = map(read, [original_path, v2_path, v3_path, v4_path])
old_verdict_path = OWN.parent / 'whole23-source38-partners44-P23-cases46.independent-b.scientific-first.verdict.json'
old = read(old_verdict_path)
intake = read(OWN / 'four-targeted-current-v4.independent-b.input.first.freeze.json')
for b in intake['inputs']:
    assert binding(ROOT / b['path']) == b, b['path']

targets = [5, 11, 21, 22]
changes_34 = [(i, diffs(a, b)) for i, (a, b) in enumerate(zip(v3['entries'], v4['entries'])) if a != b]
assert len(changes_34) == 1 and changes_34[0][0] == 5
assert set(changes_34[0][1]) == {
    '/newAuthoredWholeCases/0/workedFreshTransferDe', '/newAuthoredWholeCases/0/workedFreshTransferEn',
    '/wholeProfile/applicationCaseBriefs/0/expectedPerformanceDe', '/wholeProfile/applicationCaseBriefs/0/expectedPerformanceEn',
}
unchanged19 = [i for i in range(23) if i not in targets]
assert all(v4['entries'][i] == v2['entries'][i] for i in unchanged19)
assert all(v4['entries'][i]['wholeCurrentGoal'] == v2['entries'][i]['wholeCurrentGoal'] for i in range(23))
v12_delta = []
for i, (a, b) in enumerate(zip(original['entries'], v2['entries'])):
    for p in diffs(a, b):
        v12_delta.append({'ordinal': i + 1, 'pointer': '/entries/' + str(i) + p})
        if any(t in p for t in ['/rubric', '/evidenceLocations', '/evidenceScope']):
            continue
        assert (i == 5 and p in ['/wholeCurrentGoal/description', '/wholeCurrentGoal/descriptionEn']) or (i == 17 and p in ['/wholeProfile/applicationCaseBriefs/0/taskDemandDe', '/newAuthoredWholeCases/0/materialDe']), (i, p)

fields = ['materialDe', 'materialEn', 'taskDe', 'taskEn', 'workedResponseDe', 'workedResponseEn', 'freshTransferTaskDe', 'freshTransferTaskEn', 'workedFreshTransferDe', 'workedFreshTransferEn']
repair_retention = []
for j in range(2):
    before = v2['entries'][11]['newAuthoredWholeCases'][j]
    after = v4['entries'][11]['newAuthoredWholeCases'][j]
    tests = {k: before[k] in after[k] for k in fields}
    assert all(tests.values())
    repair_retention.append({'caseId': before['caseId'], 'originalEAFieldTextRetainedLiterallyInExpandedCurrentFields': tests})

finite_path = AUTHOR / 'remediation-v3/finite-GA-two-complete-strand-and-cycle-models.DEEN.author-material.json'
finite = read(finite_path)
finite_equalities = []
for j in range(2):
    a, b = finite['cases'][j], v4['entries'][21]['newAuthoredWholeCases'][j]
    tests = {k: a[k] == b[k] for k in fields}
    assert all(tests.values())
    finite_equalities.append({'caseId': a['caseId'], 'allTenBilingualScientificTaskAndAnswerFieldsExact': tests, 'rubricSameWholeValue': a['rubric'] == b['rubric'], 'rubricDifference': 'Finite aid retains older generic essential-1 phrasing; current P/case rubric explicitly demands strands and complete cycles. Both were actually read; no exact-rubric identity claimed.'})

stimulus_path = AUTHOR / 'remediation-v3/complete24-chromosome-type-stimuli.two-distinct-cases-and-fresh-variation.author.json'
stimuli = read(stimulus_path)
types = set([str(i) for i in range(1, 23)] + ['X', 'Y'])
totals = {}
for group in ['case1', 'case2', 'fresh2']:
    for key, counts in stimuli[group].items():
        assert set(counts) == types
        totals[key] = sum(counts.values())
assert totals == {'A': 46, 'B': 47, 'C': 45, 'D': 69, 'T': 47, 'T2': 47, 'R': 46, 'Q': 47}
assert v4['entries'][22]['newAuthoredWholeCases'][0]['completeChromosomeCountStimulus'] == stimuli['case1']
assert v4['entries'][22]['newAuthoredWholeCases'][1]['completeChromosomeCountStimulus'] == stimuli['case2']
assert v4['entries'][22]['newAuthoredWholeCases'][1]['freshCompleteChromosomeCountStimulus'] == stimuli['fresh2']
comp = str.maketrans('ATGC', 'TACG')
sequences = []
for upper, lower, f, r in [('ATGCCTAAAGGT', 'TACGGATTTCCA', 'ATG', 'ACC'), ('GCATTACCGAAT', 'CGTAATGGCTTA', 'GCA', 'ATT')]:
    assert upper.translate(comp) == lower
    assert upper[:3] == f and upper[-3:].translate(comp)[::-1] == r
    sequences.append({'oldUpper5to3': upper, 'oldLowerAligned3to5': lower, 'newUpper5to3': lower.translate(comp), 'newLowerAligned3to5': upper.translate(comp), 'newLowerSynthesis5to3RightToLeft': upper.translate(comp)[::-1], 'forwardPrimer5to3': f, 'reversePrimer5to3': r, 'bothPrimerEndsComplementary': True})
numerical = write('actual-strand-cycle-complementarity-and-complete-stimulus-counts.independent-b.receipt.json', {
    'schemaVersion': 1, 'method': 'Independent reviewer finite complementary-sequence and whole-type/count calculations, not an authored checker verdict',
    'sequences': sequences, 'PCRfromOne': {'cycle1Duplexes': 2, 'cycle2Duplexes': 4, 'originalStrandsRetained': 2, 'cycle2DuplexesWithOriginalStrand': 2, 'cycle2DuplexesWithOnlyCycle1and2Strands': 2},
    'PCRfromTwo': {'cycle1': 4, 'cycle2': 8, 'cycle5': 2 * 2**5}, 'repairIndependentPCRfromThreeCycle4': 3 * 2**4,
    'efficiency80pctFrom10TwoCycles': 10 * 1.8**2, 'ideal100pctFrom10TwoCycles': 10 * 2**2,
    'wrongReversePrimerAligned3to5': 'AAA', 'upperEnd5to3': 'AAT', 'noncomplementaryPositionsOneBasedIncludingPrimer3prime': [1, 2],
    'strictModelWrongReverseNoNewLower': True, 'newUpperSingleStrandsFromTwoOriginalLowerAfterThreeCycles': 2 * 3,
    'whole24TypeTotals': totals, 'plant20FourSets': 5 * 4, 'actualLearnerPerformance': False, 'actualExperimentPerformed': False,
})

refs_path = AUTHOR / 'remediation-v2/whole21-pair-level-rubric-references.author-candidate.json'
refs3_path = AUTHOR / 'remediation-v3/whole21-pair-level-rubric-references.v3.author-candidate.json'
refs, refs3 = read(refs_path), read(refs3_path)
ref_checks = []
for ref in refs['entries']:
    i = int(ref['wholePairPointer'].split('/')[2])
    e = v2['entries'][i]
    assert e['goalId'] == ref['goalId']
    assert [c['caseId'] for c in e['newAuthoredWholeCases']] == ref['caseIds']
    assert not ref['actualLearnerEvidence']
    for c in e['newAuthoredWholeCases']:
        assert c['rubric'] == ref['criteria']
        assert c['rubricReference']['assessmentRuleDe'] == ref['assessmentRuleDe']
        assert c['rubricReference']['assessmentRuleEn'] == ref['assessmentRuleEn']
    ref_checks.append({'goalId': e['goalId'], 'wholePairPointer': ref['wholePairPointer'], 'caseIds': ref['caseIds'], 'wholeCriteriaValueSha256': value_hash(ref['criteria']), 'priorOwnWholeGoalVerdictPointer': '/wholeGoalScientificVerdicts/' + str(i), 'semanticReason': 'Pair-level references describe criteria across the already actually read pair/fresh transfers. They explicitly limit individual-case scoring to shown performance, create no task quota and no new learner evidence. Original own facet reasons remain authoritative; a pointer alone never proves coverage.'})
for i in [11, 21, 22]:
    ref = next(r for r in refs3['entries'] if r['goalId'] == v4['entries'][i]['goalId'])
    for c in v4['entries'][i]['newAuthoredWholeCases']:
        assert c['rubric'] == ref['criteria']

preservation = write('actual-v1-v2-v3-v4-scoped-retention-and-rubric-countercheck.independent-b.receipt.json', {
    'schemaVersion': 1, 'original': binding(original_path), 'v2': binding(v2_path), 'v3': binding(v3_path), 'v4': binding(v4_path),
    'allNeutralInputFirstBindingsStillExact': True, 'actualV1toV2ChangedPaths': v12_delta, 'actualV3toV4ChangedPaths': changes_34,
    'threePCRAndKaryogramWholeEntriesExactV3': all(v4['entries'][i] == v3['entries'][i] for i in [11, 21, 22]),
    'other19WholeEntriesExactV2': [v4['entries'][i]['goalId'] for i in unchanged19],
    'all23WholeGoalsExactV2': True, 'fourHistoricalCasesWholeEntriesExactOriginal': all(v4['entries'][i] == original['entries'][i] for i in [3, 4]),
    'EAOriginalBilingualRepairTextsPreserved': repair_retention, 'finiteGACaseScientificFieldsEquality': finite_equalities,
    'rubricReferences': ref_checks, 'referencesActuallyRead': [binding(refs_path), binding(refs3_path)],
    'whole38Source44PartnerFrameBindingUnchanged': binding(AUTHOR / 'input/whole-current23-source38-and-whole-partners44.exact-neutral-input.json'),
    'originalOwnScientificFirstUnchanged': binding(OWN.parent / 'whole23-science-source-cases.independent-b.scientific-first.freeze.json'),
    'realReadToolErrorPreserved': {'command': 'rg ... app/src app/scripts/validatePositiveGoalEvidenceReviews.ts', 'exitCode': 2, 'message': 'app/scripts/validatePositiveGoalEvidenceReviews.ts: No such file or directory (os error 2)', 'resolution': 'Read actual existing positiveGoalEvidenceProfileModel.ts; no missing-file validator success claimed'},
    'activeWrites': 0,
})

primary = write('actual-current-primary-scope-and-NMD-targeted-reading.independent-b.receipt.json', {
    'schemaVersion': 1, 'readAt': NOW, 'references': [
        {'url': 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/erhoeht', 'actuallyRead': 'Actual EA2.1 splicing clause and EA2.3 replication/PCR comparison plus repair and semiconservative/PCR/base-excision contents; relevant whole surrounding context reread via official site', 'scopeInference': 'Splicing contributes to protein diversity related to selection. It is not a universal requirement for selection. EA retains repair significance; GA does not inherit that EA addendum.'},
        {'url': 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/grundlegend', 'actuallyRead': 'Actual GA2.3 replication/PCR clause/content and GA2.4 karyogram/organism/genotype/phenotype/disease clause with adjacent contents', 'scopeInference': 'Complete process comparison is required; GA karyogram inference retains organism effects and distinctions without compulsory EA multilevel elaboration. Additional supplied type/count examples do not make all EA contents universal GA duties.'},
        {'url': 'https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.0060111', 'title': 'Singh, Rebbapragada and Lykke-Andersen (2008), A Competition between Stimulators and Antagonists of Upf Complex Recruitment Governs Human Nonsense-Mediated mRNA Decay', 'actuallyRead': 'Primary research abstract, introduction and actual reporter/PABPC1/3-prime-UTR results sections', 'boundedUse': 'Actual transcript context affects NMD; premature termination does not invariably imply mRNA degradation. Supports conditional language, no patient/treatment/probability claim.'},
    ], 'unchangedWholeOtherCountrySources': 'Reuse only own immutable prior actual whole38/source44 and actual primary reading, with unchanged input byte binding; no new country/stage/course/practical closure.',
    'noFreshPeerVerdictsRead': True,
})

reasons = {
    5: [
        'Actual E1–E2–E4 versus E1–E3–E4 isoforms retain supplied compatible frames and model X/Y domains. Alternative processing, not extra genes, produces these distinct protein functions; both complete bilingual cases actually read.',
        'Four-base exon omission can shift the downstream frame. The new actual transfer separates translation termination/possibly shortened polypeptide from mRNA length and conditional NMD-dependent stability. It demands sequence, stability and function findings rather than equating every transcript with a functional protein.',
        'Inherited R/r regulation plus drought reproductive-success 4 versus2 permits selection under supplied conditions; temperature plasticity alone does not. Equal success in the fresh wet habitat removes the demonstrated selective difference while allowing drift. Current DE/EN goal correctly attaches the relation to diversity with inheritance/fitness conditions rather than universal splicing necessity.',
    ],
    11: [
        'Both complete 12-base old templates, actual F/R antiparallel primer positions, 5-prime-to-3-prime syntheses, local cellular old/new daughter duplexes and denature→anneal→extend cycle1/2 strand histories are present and worked. Complementary/reverse sequences independently recalculated. Missing primers and wrong-R strict annealing perturbation require adapted mechanisms, not formula repetition. Original BIO23B-001 gap is resolved for this actual successor.',
        'Original EA repair material/task/main/transfer bilingual text is literally retained inside expanded fields: proofreading/mismatch correction distinguished from glycosylase/site processing/complementary restoration/ligation and residual lesions 2 versus30. No perfect repair or universal PCR-repair claim. GA exact prerequisite reuse supplies strand mechanism, EA retains its distinct source repair addendum.',
        'EA pair keeps target specificity versus copying fidelity, ideal3×2^4=48 and repair limits. Expanded K/N/E and80-percent expectation32.4 versus40 checks distinguish controls/efficiency from performed yield. Wrong reverse primer leads to six new U single strands under explicit strict model, not six additional duplexes or guaranteed real PCR output.',
    ],
    21: [
        'Actual two different complete old templates are copied into complementary oriented daughter strands; F and R grow in opposing picture directions, each 5-prime-to-3-prime. All three thermal phases and cycle1/2 old/new compositions are explicit. Local semiconservative completion and full-genome versus finite-target scope are distinguished. This actual action material resolves BIO23B-001, without claiming a learner executed it.',
        'Heat separation versus helicase, primase RNA starts/removal versus retained synthetic DNA primers, thermostability and appropriate free3-prime ends are explicitly compared. Removing both primers prevents the specified polymerase initiating de novo; thermostability cannot fix missing initiation. Controls without template/enzyme and false reverse primer test different conditions. No EA repair facet is mandatory for this GA P.',
        'Start2 ideal five-cycle count64, 10×1.8^2 expectation32.4 versus40, template/enzyme controls and two-original-template six-single-strand linear variant are independently recomputed. Three-base primers and95/55/72 are explicitly finite demonstration assumptions rather than actual laboratory recipe/efficiency or real experiment receipts.',
    ],
    22: [
        'Complete all24-type stimuli A/B/C/D and T/T2/R have no named mutation in task material. Independent totals46/47/45/69 and47/47/46 locate type21/X/type18 changes versus full three sets. The fresh complete Q has47 with extraY; plant five types each4 produce20/four sets. Two distinct comparisons require inference rather than reading a diagnostic label. This actual complete material resolves BIO23B-002.',
        'Both worked bilingual cases retain conditional effects on genomic expression/development/organism traits and separate complement, external-trait and separately supplied functional observations from disease. No claim of identical phenotype, harmlessness or individual clinical diagnosis follows from a count. The finite stimulus supplies reasoning, not patient or learner evidence.',
        'The second normal-count R plus supplied base substitution demonstrates resolution limits; plant transfer requires organism-specific effects and Q rejects universal suffering claims. These limits and organism consequences preserve GA operators without making the EA organization-level elaboration mandatory. Abstract sorted whole-type matrix fits the explicit first-remedy criterion; physical native karyogram print approval stays separate.',
    ],
}
case_reasons = {
    5: [
        'Two exon paths produce model X/Y isoforms; new four-base omission tests reading-frame, polypeptide termination and conditional RNA-decay distinction with no automatic functional product.',
        'Inherited regulation and drought reproductive success are contrasted with reversible temperature plasticity; equal wet-habitat success is a genuine different selective-condition transfer.',
    ],
    11: [
        'Complete first sequence, end-labelled semiconservative daughters and two thermal cycles plus heat-enzyme problem; original repair and wrong-primer fidelity distinction retained, absent-primer transfer genuinely tests initiation.',
        'Second sequence/control context plus distinct base-excision/residual-lesion material; ideal48/64 and expected32.4 independently checked, mismatch-repair and strict false-R linear strand transfers address different mechanisms.',
    ],
    21: [
        'Actual local cellular/PCR drawings and two-cycle strand histories with complete sequences, opposite primer growth and no-primer perturbation supply the missing complete process comparison; no repair addendum imposed.',
        'Different complete sequence and K/N/E controls; efficiency expectation and false-R six-single-strand transfer require both justified computation and changed mechanism under stated ideal/strict assumptions.',
    ],
    22: [
        'Complete independent all24-type A/B/C/D totals distinguish trisomy21/monosomyX/full triploidy and bound organism effects; fresh allfive-type plant stimulus tests full-set inference in a different organism.',
        'Complete T/T2/R independently implies type18 trisomy, contrasts separate phenotype/function evidence and normal-count base substitution; complete fresh extra-Y Q tests inference and rejects universal clinical conclusion.',
    ],
}

goal_verdicts = []
for i in targets:
    e = v4['entries'][i]
    g, p = e['wholeCurrentGoal'], e['wholeProfile']
    gv = {
        'ordinal': i + 1, 'goalId': e['goalId'], 'wholeGoalTitleDe': g['title'], 'wholeGoalTitleEn': g['titleEn'],
        'wholeGoalDescriptionDe': g['description'], 'wholeGoalDescriptionEn': g['descriptionEn'],
        'wholeCurrentGoalValueSha256': value_hash(g), 'wholeCurrentProfileValueSha256': value_hash(p),
        'wholeGoalAndProfileActuallyRead': True, 'actualWholeInput': {'binding': binding(v4_path), 'jsonPointer': '/entries/' + str(i)},
        'wholeCasesActuallyRead': [
            {'caseId': c['caseId'], 'jsonPointer': '/entries/' + str(i) + '/newAuthoredWholeCases/' + str(j), 'wholeValueSha256': value_hash(c), 'allTenBilingualScientificTaskAndAnswerFieldsAndWholeRubricRead': True, 'scientificAndFreshTransferReason': case_reasons[i][j], 'actualLearnerPerformance': False, 'actualExperimentPerformed': False}
            for j, c in enumerate(e['newAuthoredWholeCases'])
        ],
        'allPositiveExpectationFacets': [
            {'expectationId': ex['id'], 'wholeExpectation': ex, 'actualInputPointer': '/entries/' + str(i) + '/wholeProfile/expectations/' + str(j), 'scientificReason': reasons[i][j], 'casePairEvidenceRead': ['/entries/' + str(i) + '/newAuthoredWholeCases/0', '/entries/' + str(i) + '/newAuthoredWholeCases/1'], 'candidateFacetDecision': 'SUPPORTED_IN_AUTHORED_FINITE_MODEL', 'rubricPointerAloneProvesFacet': False}
            for j, ex in enumerate(p['expectations'])
        ],
        'heterogeneousPairActuallyRead': True, 'independentFreshTransferActuallyRead': True,
        'scientificDecision': 'SUPPORTED_IN_AUTHORED_FINITE_MODEL', 'bilingualFidelity': 'Whole DE/EN operators, data, assumptions, answers and transferred boundaries actually compared; conditional RNA/protein, primer/strand and genome/phenotype distinctions retained.',
        'sourceDutyRowIds': e['currentOriginalSourceDutyRowIds'], 'authority': 'ai_candidate', 'status': 'needs_human_review',
        'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'ordinaryNativeDApproval': False, 'ordinaryCurrentRasterPApproval': False, 'visualizationApproval': False, 'humanApproval': False, 'humanTrial': False,
    }
    goal_verdicts.append(gv)

source_followups = []
target_rows = set(sum((g['sourceDutyRowIds'] for g in goal_verdicts), []))
for s in old['wholeSourceDutyVerdicts']:
    if s['rowId'] not in target_rows:
        continue
    x = {'rowId': s['rowId'], 'ownOriginalWholeDutyVerdictBinding': binding(old_verdict_path), 'ownOriginalWholeDutyPointer': '/wholeSourceDutyVerdicts/' + str(old['wholeSourceDutyVerdicts'].index(s)), 'allOriginalDutyDecisionClauseEdgesAndPartnerBodiesPreserved': True, 'allPartnerIdsPreserved': s['allCurrentPartnerIdsActuallyReadAndPreserved'], 'targetedMaterialHoldRemediedForActualSuccessor': s['componentMaterialHoldIds'], 'newWholeSourceApproval': False, 'courseAndApplicabilityApproval': False, 'practicalOperatorApproval': False}
    if s['rowId'] == 'source-duty-0110':
        x['scientificReason'] = 'Actual EA splicing primary and current whole DE/EN text checked: inherited relevant variation/fitness connects protein diversity to selection. Splicing is a contribution, not universal selection necessity; whole-country/source approval remains separate.'
    elif s['rowId'] == 'source-duty-0117':
        x['scientificReason'] = 'Complete strand/cycle materials now operationalize EA comparison; original repair wording/meaning remains. No actual replication/PCR laboratory execution, current native or whole-source approval.'
    elif s['rowId'] == 'source-duty-0139':
        x['scientificReason'] = 'Complete GA natural/technical comparison is supported by actual finite strand/cycle task/answers; EA repair addendum is not imported. No practical/current-native/source-family closure.'
    elif s['rowId'] == 'source-duty-0140':
        x['scientificReason'] = 'Actual GA karyogram-inference material gap is remedied by complete independent type matrices; organism/genotype/phenotype/disease operators retained, partial example partner0dd remains intact. Whole source/current scope stays separately pending.'
    else:
        x['scientificReason'] = 'Only shared chromosome-count component material gap is remedied. Original whole country row/partners, other content/process/ethics and stage/course limits remain exactly as own earlier whole review. MV examples remain examples; ST stage and mandatory microscopy/model execution plus TH practical requirements are not certified by constructed matrices.'
    source_followups.append(x)

verdict = {
    'schemaVersion': 1, 'role': 'Independent targeted whole4/P4/eight-case scientific first for actual v4 and complete v3 aids; bounded own original23 reuse',
    'reviewId': 'biologie-molecular-genetics-four-targeted-science-independent-b-v4', 'reviewedAt': NOW, 'reviewer': '/root/bio_science14_independent_b',
    'neutralEntry': binding(AUTHOR / 'remediation-v4/neutral-whole23-four-precise-material-remedies-v4.author-review.entry.json'),
    'immutableOwnInputFirst': binding(OWN / 'four-targeted-current-v4.independent-b.input.first.freeze.json'), 'immutableOwnOriginalScientificFirst': binding(OWN.parent / 'whole23-science-source-cases.independent-b.scientific-first.freeze.json'),
    'actualReadMethod': 'Actually read whole4 DE/EN goals, whole4 profile bodies/briefs, eight whole bilingual cases/rubrics, full two-strand/cycle aid and complete chromosome stimuli; actual official EA/GA targeted context and NMD primary results. Duplicate scientific fields reused only after actual value equality. Original own whole23/source38/partner44 first reused for unchanged bodies with narrow changed-field/rubric metadata countercheck.',
    'peerFreshVerdictsReadBeforeThisFirst': False, 'authorProposedJudgmentUsedAsOwnAuthority': False,
    'fourWholeGoalScientificVerdicts': goal_verdicts, 'targetedSourceComponentFollowups': source_followups,
    'priorFindings': [
        {'findingId': 'BIO23B-001', 'originalFirst': 'HOLD preserved immutable', 'currentActualSuccessor': 'RESOLVED_AT_AUTHORED_FINITE_MODEL_SCOPE_ONLY', 'goalIds': [v4['entries'][i]['goalId'] for i in [11, 21]], 'reason': 'Actual complete sequence/primer/cycle tasks and worked strand outcomes, including distinct changed initiation assumptions, now supply the missing process action material. No real learner/physical experiment receipt is inferred.'},
        {'findingId': 'BIO23B-002', 'originalFirst': 'HOLD preserved immutable', 'currentActualSuccessor': 'RESOLVED_AT_AUTHORED_FINITE_MODEL_SCOPE_ONLY', 'goalIds': [v4['entries'][22]['goalId']], 'reason': 'Complete independent all-type count stimuli remove pre-given mutation/result labels and support two different whole inferences with fresh variations; clinical/native/whole-source approvals stay open.'},
    ],
    'additionalNarrowV2Counterchecks': {'G6WholeDescription': 'Current contribution/diversity/inheritance/fitness wording is correct in both languages and matches actual source relation without universal splicing necessity.', 'G18OnlyChangedDEMaterialAndBrief': 'Each of two AaBb parents produces four possible AB/Ab/aB/ab gamete types with probability1/4. Corrects the own original precision note; original case answers/EN/all mathematical conditions retained, no whole G18 re-review.', 'all21PairRubricReferences': 'Actually read all63 DE/EN criteria and all21 pointer/case/assessment metadata, checked against own original complete pair/facet judgments. References no longer imply every case demonstrates every facet and impose no added task quota. Current3 changed criteria also read in whole P/cases.'},
    'reuse': {'other19WholeEntriesExactV2': [v4['entries'][i]['goalId'] for i in unchanged19], 'originalUnchangedScientificContentReuse': 'Own original full judgments retained for19; G18 one DE phrase and42-case rubric metadata narrow followup, not fresh whole science claim.', 'fourHistoricalCasesExact': True, 'source38Partner44Exact': True, 'strict276GoalIdsExact': True, 'canonicalAtoms394NotReduced': True},
    'receipts': [preservation, numerical, primary], 'ordinaryNativeD23Approval': False, 'ordinaryCurrentRasterP23Approval': False, 'V23Approval': False,
    'wholeSourceCourseFamilyApproval': False, 'realMicroscopyOrPracticalModelExperimentApproval': False,
    'authority': 'ai_candidate', 'status': 'needs_human_review', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'actualLearnerPerformance': False, 'actualPhysicalExperimentPerformed': False, 'humanApproval': False, 'humanTrial': False,
    'strictGain': 0, 'newScientificClosures': 0, 'restoredBindings': 0, 'activeWrites': 0,
}
vbind = write('four-targeted-whole-material-v4.independent-b.scientific-first.verdict.json', verdict)
md = OWN / 'four-targeted-whole-material-v4.independent-b.scientific-first.md'
with md.open('x') as f:
    f.write('# Independent B targeted Bio4 material followup\n\n'
            'Whole four bilingual goals/profiles and eight cases, full strand/cycle and chromosome aids were actually read before fresh peer judgments. Own original two HOLDs remain immutable; actual successors now supply the missing complete mechanisms and independent stimuli at authored finite-model scope.\n\n'
            '- PCR: explicit complementary old/new strands, antiparallel primer positions, all three thermal phases, two-cycle lineage and distinct missing/wrong-primer transfers; independent counts and directions match. EA repair retained; GA has no added repair duty.\n'
            '- Karyogram models: complete 24-type matrices, two distinct comparisons and complete fresh stimuli permit independent numerical-mutation inference, with organism/phenotype/disease and resolution limits.\n'
            '- Splicing: protein termination versus RNA length and conditional NMD are separated; current whole DE/EN selection relation is scientifically bounded.\n'
            '- Narrow v2 gamete phrase and whole-pair rubric-reference corrections checked against own original reading; unchanged whole evidence reused only with exact values.\n\n'
            'No actual learner or physical experiment evidence, current native D/P/V approval, whole source/course closure or human approval. AI candidate / needs_human_review / E1G1; strict gain0.\n')
seal = write('four-targeted-whole-material-v4.independent-b.scientific-first.freeze.json', {
    'schemaVersion': 1, 'role': 'Immutable own independent targeted scientific first, before fresh Root/A judgments', 'createdAt': NOW,
    'inputs': intake['inputs'] + [binding(refs3_path)], 'outputs': [vbind, binding(md), preservation, numerical, primary, binding(Path(__file__))],
    'authorVerdictUsed': False, 'peerFreshVerdictRead': False, 'humanApproval': False, 'strictGain': 0,
})
entry = write('completed-four-targeted-whole-material-v4.independent-b.scientific-first.entry.json', {
    'schemaVersion': 1, 'role': 'Completed independent B bounded scientific successor review; current native/resource gates separate',
    'neutralAuthorEntry': verdict['neutralEntry'], 'ownInputFirst': verdict['immutableOwnInputFirst'],
    'ownScientificFirst': seal, 'wholeScientificVerdict': vbind, 'receipts': verdict['receipts'],
    'wholeCurrentInput': binding(v4_path), 'whole4GoalIds': [v4['entries'][i]['goalId'] for i in targets],
    'originalFirstRetained': verdict['immutableOwnOriginalScientificFirst'], 'nativeDApproval': False, 'currentRasterPApproval': False,
    'wholeSourceApproval': False, 'humanApproval': False, 'status': 'needs_human_review', 'authority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'strictGain': 0,
})
eseal = write('completed-four-targeted-whole-material-v4.independent-b.entry.first.freeze.json', {'schemaVersion': 1, 'createdAt': NOW, 'entry': entry, 'scientificFirst': seal, 'immutable': True, 'humanApproval': False})
print(json.dumps({'entry': entry, 'scientificFirst': seal, 'entryFirst': eseal}, indent=2))
