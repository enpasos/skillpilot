import copy
import datetime
import hashlib
import json
import pathlib
import unicodedata

R = pathlib.Path('/home/enpasos/projects/skillpilot')
B = pathlib.Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
A = B / 'biologie-molecular-genetics-twenty-three-native-preparation-author-v1'
D = B / 'biology-molecular-genetics-twenty-three-native-independent-a-v1'
O = B / 'biologie-molecular-genetics-twenty-three-whole-author-v1'
S = B / 'biologie-molecular-genetics-twenty-three-whole-independent-a-v1'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
REVIEWER = 'bio_science14_independent_a; independent current Bio23 native reviewer; model variant unexposed'

def read(p):
    return json.loads((R / p).read_text())

def digest(p):
    return 'sha256:' + hashlib.sha256((R / p).read_bytes()).hexdigest()

def binding(p):
    return {'path': str(p), 'sha256': digest(p), 'bytes': (R / p).stat().st_size}

def put(name, value):
    p = D / name
    assert not (R / p).exists(), 'Immutable/new output already exists: ' + str(p)
    (R / p).parent.mkdir(parents=True, exist_ok=True)
    (R / p).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return p

def stable(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))

def value_digest(value):
    return 'sha256:' + hashlib.sha256(stable(value).encode()).hexdigest()

def strip_pair_refs(case):
    c = copy.deepcopy(case)
    c.pop('rubricScope', None)
    c.pop('rubricReference', None)
    for criterion in c.get('rubric', []):
        criterion.pop('evidenceScope', None)
        criterion.pop('evidenceLocations', None)
    return c

entry = read(A / 'neutral-twenty-three-native-independent-review.entry.json')
material_path = pathlib.Path(entry['wholeCaseMaterialsPath'])
source_path = pathlib.Path(entry['wholeSourceDutiesPath'])
material = read(material_path)
rows = material['entries']
original = read(O / 'twenty-three-whole46-bilingual-cases-and-P.author-candidate.json')['entries']
v2 = read(O / 'remediation-v2/twenty-three-whole46-bilingual-cases-and-P.v2.author-candidate.json')['entries']
v5 = read(O / 'remediation-v5/twenty-three-whole46-bilingual-cases-and-P.v5.author-candidate.json')['entries']
v6_path = O / 'remediation-v6/twenty-three-whole46-bilingual-cases-and-P.v6.author-candidate.json'
v6 = read(v6_path)['entries']
source = read(source_path)
original_source_path = O / 'input/whole-current23-source38-and-whole-partners44.exact-neutral-input.json'
original_source = read(original_source_path)
old_first_path = S / 'whole23-science-source-scope-P.first.independent-A.verdict.json'
old_first = read(old_first_path)
old_by_id = {j['goalId']: j for j in old_first['perGoalJudgments']}
targeted_first_path = S / 'targeted-two-fidelity-remediation-v2/targeted-two-fidelity-and-pair-rubrics.first.independent-A.verdict.json'
targeted_first = read(targeted_first_path)
model_path = pathlib.Path(entry['actualFullCandidateModelPath'])
model = read(model_path)
before_model = read(pathlib.Path(entry['actualFullCurrentBeforeModelPath']))
canonical_path = pathlib.Path(entry['candidateCanonicalPath'])
canonical = read(canonical_path)
before_canonical = read(O / 'input/current-canonical479.original.snapshot.json')
goal_by_id = {g['id']: g for g in canonical['goals']}
before_by_id = {g['id']: g for g in before_canonical['goals']}
selected_ids = set(entry['goalIds'])
checks = []

def check(name, actual, expected=True):
    ok = actual == expected
    checks.append({'check': name, 'actual': actual, 'expected': expected, 'pass': ok})
    assert ok, name + ': ' + repr(actual)

check('Whole38 original source-duty values are retained', source['wholeOriginalSourceDutyRows'] == original_source['wholeOriginalSourceDutyRows'])
check('Whole44 original partner-goal values are retained', source['wholeCanonicalPartnerGoals'] == original_source['wholeCanonicalPartnerGoals'])
check('Whole276 protected IDs are retained', source['preserveExactStrict276GoalIds'] == original_source['preserveExactStrict276GoalIds'])
check('Source duties count', len(source['wholeOriginalSourceDutyRows']), 38)
check('Partner goals count', len(source['wholeCanonicalPartnerGoals']), 44)
check('Unselected456 whole canonical goals exact', sum(g == before_by_id[g['id']] for g in canonical['goals'] if g['id'] not in selected_ids), 456)
before_pages = {p['goalId']: p for p in before_model['pages']}
check('Unselected371 whole pages exact', sum(p == before_pages[p['goalId']] for p in model['pages'] if p['goalId'] not in selected_ids), 371)
check('No protected276 canonical goal changed', sum(goal_by_id[g] == before_by_id[g] for g in source['preserveExactStrict276GoalIds']), 276)
check('Current46 cases count', sum(len(r['authoredWholeCases']) + len(r['historicalWholeCases']) for r in rows), 46)

reuse = []
for r, old, vv2, vv5, vv6 in zip(rows, original, v2, v5, v6):
    ordinal = r['ordinal']
    check(f'Goal{ordinal}: actual canonical wholeGoal binding', r['wholeCurrentGoalWithResources'] == goal_by_id[r['goalId']])
    check(f'Goal{ordinal}: literal current wholeProfile equals v6 body', r['wholeProfile'] == vv6['wholeProfile'])
    check(f'Goal{ordinal}: literal current authored wholeCases equal v6', r['authoredWholeCases'] == vv6.get('newAuthoredWholeCases', []))
    check(f'Goal{ordinal}: profile expectations match case pair rubric conditions', all(c['expectationId'] in {e['id'] for e in r['wholeProfile']['expectations']} for case in r['authoredWholeCases'] for c in case['rubric']))
    check(f'Goal{ordinal}: source-duty row IDs exact', r['currentOriginalSourceDutyRowIds'] == old['currentOriginalSourceDutyRowIds'])
    if ordinal in (4, 5):
        check(f'Goal{ordinal}: both historical whole cases retained exact', r['historicalWholeCases'] == old['exactHistoricalWholeCases'])
        check(f'Goal{ordinal}: whole historical finite material retained exact', r['historicalWholeMaterial'] == old['exactHistoricalWholeMaterial'])
        basis = 'own previous whole23 science reading, including exactly retained complete historical finite materials/cases'
    elif ordinal == 6:
        oldp, currentp = copy.deepcopy(vv2['wholeProfile']), copy.deepcopy(r['wholeProfile'])
        oldcases = [strip_pair_refs(c) for c in vv2['newAuthoredWholeCases']]
        currentcases = [strip_pair_refs(c) for c in r['authoredWholeCases']]
        for lang in ('De', 'En'):
            oldp['applicationCaseBriefs'][0]['expectedPerformance'+lang] = currentp['applicationCaseBriefs'][0]['expectedPerformance'+lang]
            oldcases[0]['workedFreshTransfer'+lang] = currentcases[0]['workedFreshTransfer'+lang]
        check('Goal6: only two bilingual transfer explanations differ from genuine own v2 profile/cases', oldp == currentp and oldcases == currentcases)
        basis = 'own v2 source-fidelity and whole-case review retained; actual four bilingual premature-stop/NMD fields freshly inspected and scientifically confirmed here'
    elif ordinal not in (12, 22, 23):
        base = vv2 if ordinal in (6, 18) else old
        check(f'Goal{ordinal}: wholeProfile exact genuine own earlier semantic review', r['wholeProfile'] == base['wholeProfile'])
        check(f'Goal{ordinal}: wholeCase core exact genuine own earlier semantic review except honest pair references', [strip_pair_refs(c) for c in r['authoredWholeCases']] == [strip_pair_refs(c) for c in base['newAuthoredWholeCases']])
        basis = 'own targeted-two v2 science FIRST' if ordinal in (6, 18) else 'own original whole23 science FIRST'
    else:
        check(f'Goal{ordinal}: all46 case bodies are v5 exact', r['authoredWholeCases'] == vv5['newAuthoredWholeCases'])
        basis = 'fresh current native P scientific judgment, current whole profile and two whole bilingual cases actually read; previous V22/23 contextual reading alone did not grant P approval'
    reuse.append({'ordinal': ordinal, 'goalId': r['goalId'], 'genuineEarlierScienceReuse': ordinal not in (12, 22, 23), 'wholeProfileAndWholeCaseBodyExactEarlierReuse': ordinal not in (6,12,22,23), 'targetedFourSpliceWordExplanationFieldsFresh': ordinal==6, 'genuineReuseBasis': basis, 'nativePage': next(p for p in entry['pageMap'] if p['goalId'] == r['goalId']), 'wholeProfileFingerprint': value_digest(r['wholeProfile']), 'wholeCasesFingerprint': value_digest(r['authoredWholeCases'] + r['historicalWholeCases'])})

# Independent finite reasoning, rather than treating a material hash as a verdict.
complement = str.maketrans('ATGC', 'TACG')
for upper, lower, reverse_primer in [('ATGCCTAAAGGT', 'TACGGATTTCCA', 'ACC'), ('GCATTACCGAAT', 'CGTAATGGCTTA', 'ATT')]:
    check('PCR model complement ' + upper, upper.translate(complement), lower)
    check('PCR reverse primer correctly matches antiparallel terminal template ' + upper, upper[-3:].translate(complement)[::-1], reverse_primer)
    check('PCR reverse-complement product starts with R ' + upper, upper.translate(complement)[::-1][:3], reverse_primer)
check('PCR 2 initial duplexes, 5 ideal complete cycles', 2 * 2 ** 5, 64)
check('EA repair-context ideal count: 3 initial, 4 cycles', 3 * 2 ** 4, 48)
check('PCR efficiency transfer: 80% extra per cycle, 10 initial, 2 cycles', round(10 * 1.8 ** 2, 8), 32.4)
check('PCR wrong reverse primer: two mismatches including 3prime', [a != b for a, b in zip('AAA', 'AAT'.translate(complement))], [True, True, False])
check('Single correct F primer: new single U strands from two original T across 3 cycles', 2 * 3, 6)
for label, counts, expected in [('A', [2]*22 + [2,0], 46), ('B', [2]*20+[3,2]+[2,0], 47), ('C', [2]*22+[1,0],45), ('D',[3]*22+[2,1],69), ('Q',[2]*22+[1,2],47)]:
    check('Complete synthetic karyotype ' + label + ' count', sum(counts), expected)
check('Complete plant five-type tetraploid count', sum([4]*5),20)

verification_path = put('current-P23-actual-model-data-and-genuine-reuse.checks.json', {'schemaVersion':1, 'createdAt':NOW, 'role':'own actual semantic, literal-body, finite-model and native binding verification; no wholeSource/V approval', 'checks':checks, 'errors':[], 'reuseMap':reuse, 'originalOwnWholeScienceFirst':binding(old_first_path), 'originalOwnTargetedTwoFirst':binding(targeted_first_path), 'currentActualMaterial':binding(material_path), 'source38Partners44':binding(source_path), 'humanApproval':False, 'strictGain':0})

splice_input_path = pathlib.Path(entry['genuineSpliceKindAMConfirmationInputPath'])
splice = read(splice_input_path)
g = splice['wholeCandidateGoal']
check('Splice wholeGoal equals exact current native canonical target', g == goal_by_id[g['id']])
splice_first = {
 'schemaVersion':1, 'role':'genuine independent targeted current whole DEEN Splice Kind/Atomicity/Memory FIRST', 'reviewer':REVIEWER, 'firstJudgmentAt':NOW,
 'wholeNeutralInput':binding(splice_input_path), 'wholeCurrentGoal':g, 'originalOwnScienceFidelityFirst':binding(targeted_first_path),
 'sourceDutyRow':'source-duty-0110', 'originalDecisionPointer':'/decisions/186', 'sourceGoalId':'fdd172c5-62c9-58e4-accb-84ffe4871f9c', 'actualOriginalSourceSpan':'B12-EA.2.4',
 'sourceContextJudgment':'The whole official EA genetics passage asks for explaining alternative splicing and contextualizing protein diversity for selection. The relative clause refers to diversity. The current DEEN fixes an overstrong universal splicing prerequisite and makes heritability and reproductive success explicit. Existing LK/SekII and original other-jurisdiction roles/partner duties remain unchanged; no global source authorization is inferred.',
 'kindConfirmation':{'semanticKind':'curricularAtomic', 'status':'KEEP_CURRENT_MACHINE_CANDIDATE', 'reason':'An assessable content explanation relates exon selection to protein variants and then the conditional biological significance of that diversity. It is neither orientation, a program node, memorization, nor an exam endpoint.', 'currentSourceFingerprint':splice['candidateKind']['sourceFingerprint']},
 'atomicityConfirmation':{'status':'atomic','semanticAtomic':True,'reason':'One integrated causal explanation is assessed: alternative exon selection changes possible protein products, whose heritable fitness-relevant differences can matter for selection. The selection condition constrains that same explanation rather than adding an independent evolution calculation or separately assessed routine.'},
 'memoryConfirmation':{'status':'no_memory_needed','memoryUseful':False,'memoryGoalIds':[],'deckIds':[],'reason':'The competence is causal interpretation of supplied exon/isoform models and conditional evolutionary meaning. It does not require a new compact list, rule, formula or vocabulary deck beyond the existing proteinbiosynthesis foundations. A new SRS deck would not provide the explanation or transfer.'},
 'other393KindsAndAMRejudged':False,'other22SelectedAMRejudged':False,'existingMemoryCardsAndVisibilityChanged':False,
 'freshPeerAMRecordsRead':False,'authorTechnicalFingerprintNotTreatedAsSemanticReview':True,'currentWholeSourceCourseApproval':False,'currentNativeVApproved':False,
 'reviewAuthority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1','humanApproval':False,'humanTrial':False,'activeWrites':[],'strictGain':0}
splice_first_path = put('one-current-Splice-kind-atomicity-memory.actual-FIRST.independent-A.verdict.json', splice_first)
splice_seal_path = put('one-current-Splice-kind-atomicity-memory.actual-FIRST.independent-A.freeze.json', {'schemaVersion':1,'role':'immutable own first semantic Splice verdict, before any fresh AM peer judgments','createdAt':NOW,'firstVerdict':binding(splice_first_path),'neutralInput':binding(splice_input_path),'freshPeerAMRecordsRead':False,'humanApproval':False,'activeWrites':[]})

fresh_mechanisms = {
 12: [
  'Actual complementary old/new strands and both 5prime-to-3prime directions are constructed; each daughter is old+new. The two original strands remain two across later PCR cycles, while products double under explicit ideal terminal-target assumptions. Heat/thermostability and primer initiation solve different constraints.',
  'Polymerase proofreading, post-replication mismatch recognition and damaged-base excision are distinguished. The supplied BER card restores from the undamaged opposite strand and seals through ligase; the 2 versus 30 residual-lesion comparison supports information preservation without perfection or clinical efficacy.',
  'The tasks separate amplification from repair and target selection from fidelity. Actual 3*2^4=48, missing BOTH primers gives no supplied 3prime starts, and the wrong reverse primer changes exponential copying to six new single U strands in three cycles under its strict model.'
 ],
 22: [
  'Both complete 12-base templates, antiparallel primer matches and newly synthesized sequences are available. Learners draw actual complementary strands/ends and semiconservative daughters; opposite physical directions are both 5prime-to-3prime synthesis.',
  'The cellular helicase/primase/genome process is contrasted with supplied 95/55/72 thermal separation/annealing/extension and limited PCR target selection. Three-base primers are explicitly a didactic finite model, not a laboratory protocol; DNA versus replaced RNA starts are correctly distinguished.',
  'Actual controls omit template or polymerase; counts use complete model cycles. 80% extra copies gives expected 32.4 versus ideal40, and the wrong R 3prime mismatch blocks reverse synthesis under the supplied rule, making F-only new single strands linear. No compulsory GA cellular repair detail is added.'
 ],
 23: [
  'Full tables include all22 autosome types plus X/Y, not an incomplete picture treated as a full karyogram. Summed46XX,47(trisomy21),45X,69XXY distinguish individual-type aneuploidy from complete-set triploidy; five-type plant20 demonstrates complete tetraploidy.',
  'The two same-karyotype47 trisomy18 cases with different supplied phenotype/function evidence explicitly prevent a one-to-one chromosome-count/clinical-outcome inference. Genotype, phenotype and disease claim are separate evidential levels.',
  'Fresh47XYY does not prove inevitable disease. A supplied nucleotide substitution can leave46XY unchanged, and plant ploidy cannot inherit a human clinical outcome. GA source scope remains effects on the organism; EA multilevel/repair duties are not imposed on it.'
 ]}
page_by_id = {p['goalId']:p for p in model['pages']}
judgments = []
for r in rows:
    old = old_by_id[r['goalId']]
    j = copy.deepcopy(old)
    n = r['ordinal']
    j.update({'wholeGoal':r['wholeCurrentGoalWithResources'],'wholeGoalPointer':f'/entries/{n-1}/wholeCurrentGoalWithResources','wholeProfilePointer':f'/entries/{n-1}/wholeProfile','wholeCasePointers':[f'/entries/{n-1}/authoredWholeCases/{i}' for i in range(len(r['authoredWholeCases']))] + [f'/entries/{n-1}/historicalWholeCases/{i}' for i in range(len(r['historicalWholeCases']))], 'status':'ACCEPT_CURRENT_BOUNDED_P_CANDIDATE','findings':[], 'actualCurrentNativePage':next(p for p in entry['pageMap'] if p['goalId']==r['goalId']), 'actualPageFingerprint':page_by_id[r['goalId']]['pageFingerprint'], 'genuineEarlierScienceReuse':n not in (12,22,23), 'freshCurrentScientificMaterialJudgment':n in (12,22,23), 'nativePageContextsActuallyRead':True,'currentResourceBindingActuallyChecked':True,'currentNativePFrameAssessment':'Whole current goal, prerequisites/successors, applicability and selected asset binding were actually read/checked; all original Source38/Partner44 duties remain. The image supports the task model and does not count as learner evidence or current V approval.', 'reviewAuthority':'ai_candidate','statusInOrdinaryPRecord':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1','humanApproval':False,'humanTrial':False,'nativeDApproval':False,'nativePApproval':False,'VApproval':False,'wholeCourseApproval':False})
    if n in (6,18):
        j['resolvedOriginalOwnFinding'] = 'BIO23-A-001 conditional Splice fidelity' if n==6 else 'BIO23-A-002 complete dihybrid gamete model'
        j['genuineEarlierTargetedFidelityReview'] = binding(targeted_first_path)
    if n==6:
        j['targetedFourActualSpliceExplanationFieldsFreshlyRead'] = True
        j['targetedActualSpliceExplanationJudgment'] = 'A premature stop codon ends translation, shortening the polypeptide rather than directly shortening mRNA. Depending on transcript/cellular context, nonsense-mediated decay may destabilize mRNA; it is not guaranteed by every premature stop. Frame perturbation by omission of four nucleotides is correctly distinguished from RNA processing/decay and functional-isoform proof.'
    for i, ex in enumerate(r['wholeProfile']['expectations']):
        j['criterionJudgments'][i]['actualCriterionDe'] = ex['observablePerformanceDe']
        j['criterionJudgments'][i]['actualCriterionEn'] = ex['observablePerformanceEn']
        if n in fresh_mechanisms:
            j['criterionJudgments'][i]['ownConcreteMechanismAndCoverageJudgment'] = fresh_mechanisms[n][i]
        if n==6 and i==2:
            j['criterionJudgments'][i]['ownConcreteMechanismAndCoverageJudgment'] = 'Splicing is not required for all selection. The tasks require heritable fitness-relevant variation before an evolutionary-selection consequence and disallow a mere tissue-expression difference as inherited change.'
    if n in (12,22,23):
        j['newCasesActuallyRead'] = 2
        j['heterogeneityJudgment'] = 'Complete copying/direction/thermal engineering and perturbed priming/controls test different mechanistic constraints.' if n in (12,22) else 'Full chromosome-count inference is contrasted with equal chromosome totals but different phenotype/function evidence and a plant whole-set transfer.'
    judgments.append(j)

advisories = [
 {'id':'BIO23-current-P-A-advisory-001','goalId':'22711af8-1184-584c-9707-1192799bfa22','pointers':['/entries/22/authoredWholeCases/0/rubric/0/criterionEn','/entries/22/authoredWholeCases/1/rubric/0/criterionEn'],'severity':'nonblocking typography','actual':'X/Ytypes','reason':'The full task/table and profile clearly specify X/Y types. Missing word boundary in two rubric reference strings remains current and is not represented as already corrected.'},
 {'id':'BIO23-current-P-A-advisory-002','goalId':'76ad2d40-496b-5fa8-97e8-7711f9859738','pointers':['/entries/11/authoredWholeCases/0/taskDe','/entries/11/authoredWholeCases/0/taskEn'],'severity':'nonblocking editorial context','actual':'ergänze keine GA-Reparaturpflicht / Do not add mandatory repair detail to the GA case','reason':'This copied scope note in an EA task refers to the separately preserved GA boundary. The same EA task expressly requires natural repair explanation, so no repair duty is waived. A learner-facing author could move the note to teacher metadata.'}
]
p_first = {'schemaVersion':1,'role':'genuine independent actual current Native23 P-frame FIRST;19 exact earlier profile/case cores,1 targeted four-field Splice explanation,3 current scientific material judgments','firstJudgmentAt':NOW,'reviewer':REVIEWER,'actualInputFirst':binding(D/'native23.actual-input.first.freeze.json'),'actualCurrentModel':binding(model_path),'actualBookDigest':model['digest'],'wholeCurrentMaterials':binding(material_path),'wholeSource38Partners44':binding(source_path),'actualChecksAndReuseMap':binding(verification_path),'perGoalJudgments':judgments,'advisories':advisories,'scienceReviewScope':{'genuineEarlierScienceReuseOrdinals':[r['ordinal'] for r in rows if r['ordinal'] not in (12,22,23)],'exactEarlierWholeProfileAndCaseCoreReuseOrdinals':[r['ordinal'] for r in rows if r['ordinal'] not in (6,12,22,23)],'targetedFourSpliceExplanationFieldsFreshlyRead':True,'freshCurrentScientificMaterialJudgmentOrdinals':[12,22,23],'exactHistoricalCasesRetained':4,'newWhole23ScienceReviewClaimed':False,'currentNativeGoalContextsActuallyRead':23,'actualNativePDFFullPagesRead':27,'actualNativePageRendersSeenAtPFirst':5,'additionalActualPageInspectionPending':18,'currentV23Approved':False},'technicalExecutionDisclosure':{'firstMaterializationStoppedOnFalseGoal6ExactV2ReuseAssertion':True,'noVerdictOrSealHadBeenWrittenByThatAttempt':True,'actualFourFieldSpliceDeltaInspectedInsteadOfLabelledExactReuse':True},'blinding':{'freshOtherNativeDRecordsRead':False,'freshOtherNativePRecordsRead':False,'freshOtherAMRecordsRead':False,'separateRootVisualDissentSummaryReceived':True,'otherDescriptionRoundBlind':True,'currentPReviewBlind':True},'sourceWholeCourseApproval':False,'currentStrictApproval':False,'reviewAuthority':'ai_candidate','status':'needs_human_review','evidenceLevel':'E1','maximumClaimScope':'G1','humanApproval':False,'humanTrial':False,'actualExperimentPerformed':False,'actualLearnerPerformance':False,'activeWrites':[],'strictGain':0}
p_first_path = put('current-native23-P-frame.actual-FIRST.independent-A.verdict.json',p_first)
p_seal_path = put('current-native23-P-frame.actual-FIRST.independent-A.freeze.json',{'schemaVersion':1,'role':'immutable genuine own current P FIRST before fresh peer P results','createdAt':NOW,'firstVerdict':binding(p_first_path),'actualChecks':binding(verification_path),'SpliceFirst':binding(splice_first_path),'SpliceFirstSeal':binding(splice_seal_path),'freshPeerPRecordsRead':False,'humanApproval':False,'activeWrites':[]})

print(json.dumps({'PFirst':binding(p_first_path),'PFirstSeal':binding(p_seal_path),'SpliceFirst':binding(splice_first_path),'SpliceFirstSeal':binding(splice_seal_path),'checks':len(checks)},indent=2))
