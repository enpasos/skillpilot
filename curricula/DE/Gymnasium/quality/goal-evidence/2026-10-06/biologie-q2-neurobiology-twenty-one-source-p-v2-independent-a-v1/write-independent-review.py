# SPDX-License-Identifier: Apache-2.0
import hashlib
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[7]
AUTHOR = OUT.parent / 'biologie-q2-neurobiology-twenty-one-source-p-author-remediation-v2'
read = lambda p: json.loads(p.read_text())
write = lambda name, x: (OUT / name).write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')
scope = read(AUTHOR / 'independent-review.actual.thirteen-and-eight-scope.json')
landscape = read(AUTHOR / 'canonical.current464.author-v2.candidate.json')
goals = {g['id']: g for g in landscape['goals']}
selected = scope['nativeSourceBackedThirteen'] + scope['stillOpenEight']
backed = {r['goalId'] for r in scope['nativeSourceBackedThirteen']}
rationales = {
 'ce19b80f': 'One structure-function model of the neuron; reception, conduction and transmission are dependent functions of that same object. The revised text no longer separately certifies AP generation.',
 '78748ef2': 'The receptor response and primary/secondary sensory-cell distinction form a coherent bounded sensory-cell signal model. Hyperpolarising receptor responses remain possible; APs and graded responses are not equated. BY particle-level retinal/phenomenon duties are not cleared.',
 '19758e09': 'Joint neural-endocrine signalling is explained through the gland and receptor-limited target effects. Listing two systems or comparing them at lower level does not establish this whole coupling competence.',
 'e1117126': 'Spatial and temporal integration are instances of one threshold-decision competence. The supplied additive model is explicit; -57 mV versus -52 mV without inhibition is correct. No conductance-level universal claim is made.',
 '347110a1': 'One cellular-plasticity competence; functional change and new contacts are differentiated using supplied evidence. Neither a molecular cause nor a particular real memory is inferred. The additional BY necessity-of-plasticity obligation stays open.',
 '485ef1c3': 'The changed description now asks for one principle of dysfunction in a supplied disease model. It fits the HE example choice without requiring all disease mechanisms. Alzheimer cannot discharge the separate BY named-disease duties.',
 'afde0001': 'One brain-imaging principle; MRI/fMRI cases distinguish structure from indirect functional contrast and avoid direct thought or neuron recordings. The substantive HE witness is sound, but its raw transcription silently corrects the printed spelling.',
 '2381d2bb': 'Planning and interpreting one potential-recording enquiry is coherent. The new title matches the unchanged description. Electrode reference, time course and reversed polarity are appropriate; no practical execution is certified.',
 '1b38144f': 'The membrane model explains its selective transport behaviour as one structure-function competence. Closing a channel need not stop independent pump or lipid pathways. HE membrane context is not a separate original compulsory bullet.',
 'e3fb5f1d': 'One resting-potential explanation combines ion distribution, selective permeability and maintenance of gradients. Immediate voltage is distinguished from ATP-dependent long-term maintenance and bulk net charge.',
 '04d770b3': 'One AP signal-model competence links particle events to a bounded impulse code. The model does not use pumps for fast repolarisation or vary individual spike height with intensity. BY absolute/relative refractory and duration details are not comprehensively cleared by these two briefs.',
 '080b10c7': 'One conduction-performance comparison; 1 m/10 m s^-1 =0.1 s and 1 m/50 m s^-1 =0.02 s. Myelin and diameter limit extrapolation. BY cost-benefit and full animal comparison obligations remain explicit.',
 'c05e217f': 'One regulation-and-perturbation model. The new cortisol/glucose/insulin transfer actually supplies a second feedback loop and explains its persistent extra drive. It avoids precise equilibrium, resistance or clinical-diagnosis claims. The full source witness is BY EA only.',
 'ff1bf88f': 'Chemical and electrical transfer plus transmitter action are retained in the current text; full single-goal atomicity remains a genuine developer queue. Chemical ACh/channel/NMJ and substance application duties need a specifically adequate component, and electrical transfer has no current full mapped curricular witness.',
 'a46cafde': 'The revised text is one bounded processing consequence of changed effective connections. The corrected P text uses causal model evidence rather than counting internal review levels. Cellular learning is contextual support, not an exact compulsory network goal.',
 'c9a06264': 'The supplied controls support lasting efficacy increase/decrease, not arbitrary molecular causes or individual memories. LTP/LTD specificity is not an original separate HE compulsory bullet.',
 '4f631f78': 'The artificial Hebb update gives 0.5 and its unlimited-growth limit is explicit. A bounded modelling exercise does not make a particular Hebb rule an original curricular duty.',
 '97b24279': 'Convergence/divergence describe one topological transformation; connection sign and threshold still determine activity. The separate topology goal lacks a current whole mapped compulsory witness.',
 '9b966664': 'Receptor/context-dependent modulation is scientifically bounded; serotonin statistics do not diagnose a sole cause or treatment. Named modulator systems are not original HE independent duties.',
 'f6280154': 'Receptor blockade and reuptake are different local intervention sites. Whole-person treatment and ACh-NMJ coverage cannot be inferred. HE GK2 requires a suitable ACh/channel/NMJ component rather than this generic profile alone.',
 '8b23f8fb': 'The revised cases now supply stimulus-dependent cation entry, graded response, downstream AP frequency and a selective channel-block transfer. Place/population coding is tied to supplied groups. This scientific repair does not create an original compulsory source witness.',
}
changed = {'ce19b80f','a46cafde','e1117126','485ef1c3','2381d2bb'}
goal_records = []
for entry in selected:
    key = entry['goalId']; short = key[:8]; g = goals[key]
    goal_records.append({
        'goalId': key, 'title': g['title'],
        'wholeGoalSha256': hashlib.sha256(json.dumps(g, ensure_ascii=False, separators=(',',':')).encode()).hexdigest(),
        'changedScientificTextTargeted': short in changed,
        'scientificDescriptionVerdict': 'KEEP_BOUNDED' if short != 'ff1bf88f' else 'HOLD_ATOMICITY_AND_SOURCE',
        'sourceKernelWitness': key in backed,
        'exactCurrentSourceInputVerdict': 'REVISE_RAW_TRANSCRIPTION' if short == 'afde0001' else ('KEEP_BOUNDED' if key in backed else 'HOLD_NO_FULL_MAPPED_WITNESS'),
        'acceptedScopeKeys': entry.get('sourceViewKeys', []),
        'atomicityVerdict': 'atomic_targeted_current_text' if short in changed else ('needs_developer_review_retained' if short == 'ff1bf88f' else 'unchanged_scientific_text_no_historical_atomicity_restart'),
        'positiveProfileVerdict': 'KEEP_SYNTHETIC_BOUNDED_CANDIDATE',
        'rationale': rationales[short],
        'wholeGlobalScopeApproval': False, 'currentM7Approval': False, 'humanApproval': False,
    })
write('independent-a.goal-science-source-p-atomicity.actual.review.json', {
    'schemaVersion': 1, 'reviewer': '/root/bio_neuro_v2_independent_a',
    'reviewKind': 'fresh_independent_frozen_v2_targeted_A',
    'finalCompoundFreezeSha256': '1bb3bf75afe6682b0388bb0cb200afb0de1d5f52b82e82e66e41922cd419d391',
    'effectiveRPInputSha256': '063e784795cf74ca48ba0bf0c3dae0efcb2c3e997b3a25fc3f94eb337c19e501',
    'priorIndependentABConclusionsUsed': False,
    'embeddedAuthorBasisFrozenReviewMetadataUsedAsAuthority': False,
    'sourceBackedSemanticKernels': 13,
    'exactCurrentSourceInputAcceptedBoundedCandidates': 12,
    'oneRawSourceTranscriptionCorrectionRequired': 'afde0001-d7d7-5ed3-8a60-383e8da5620e',
    'openSourceScopeGoals': 8,
    'goalRecords': goal_records,
    'changedPProfiles': [
        {'goalId': 'a46cafde-7359-5249-8754-19aaa3174ba4', 'verdict': 'KEEP_LOCAL_SCIENTIFIC_REPAIR', 'scopeAccepted': False, 'reason': 'Biological effective connections and counteracting inhibition replace internal review-counting wording.'},
        {'goalId': '8b23f8fb-555d-5720-b5f2-dd6f28a0e786', 'verdict': 'KEEP_LOCAL_SCIENTIFIC_REPAIR', 'scopeAccepted': False, 'reason': 'A complete material-bound transduction chain and channel intervention are now testable; no spontaneous baseline or universal linear rule is invented.'},
        {'goalId': 'c05e217f-33fc-5a11-ba75-1397fad3ae0a', 'verdict': 'KEEP_BOUNDED_BY_EA_CANDIDATE', 'scopeAccepted': 'DE-BY/SekII/LK only', 'reason': 'The second insulin/glucose feedback loop is explicitly supplied and coupled to the cortisol loop.'},
    ],
    'all42BilingualCasesActuallyRead': True,
    'syntheticMaterialsAndExpectedAnswersAreObservedLearnerEvidence': False,
    'unchangedInnerProfileCount': 18,
    'PMinimumTwoEvidenceDemonstrationsIsFixedTaskQuota': False,
    'PInterpretation': 'Two independent substantive evidence operations can occur within one genuine multi-step performance. No required extra task after all goal aspects have been demonstrated.',
    'currentPStatus': 'needs_human_review', 'currentPAuthority': 'ai_candidate',
    'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'observedLearnerDemonstrations': 0,
    'targetedMemoryImplication': 'The five revised goals remain model interpretation, causal explanation or measurement planning. The provided material supports needed labels; no new recall requirement or card deck is established by these edits. This is not a full native M21 acceptance.',
    'integrationReady': False, 'strictM7NetIncrease': 0,
})

regional = read(AUTHOR / 'regional38.actual.operator-age-page-and-preservation-remedies.json')['relations']
regional_index = {(r['mappingPath'],r['sourceGoalId'],r['canonicalGoalId']): r for r in regional}
relations = []
for r in read(AUTHOR / 'source71.actual.author-remedies.json')['relations']:
    key = (r['mappingPath'],r['sourceGoalId'],r['canonicalGoalId'])
    region = r['mappingPath'].split('/mapping/')[1].split('/')[0]
    rr = regional_index.get(key)
    verdict = 'KEEP_BOUNDED_PARTIAL_OR_CONTEXT' if r['action'] != 'remove_false_positive_binding' else 'KEEP_REMOVAL_OF_UNSUPPORTED_BINDING'
    if region == 'DE-HE':
        verdict = 'KEEP_ORIGINAL_BULLET_MIGRATION_BOUNDARY'
        if r['canonicalGoalId'].startswith('afde0001'): verdict = 'REVISE_RAW_TRANSCRIPTION_ONLY'
    relations.append({
        'mappingPath': r['mappingPath'], 'originalSourceGoalId': r['sourceGoalId'],
        'canonicalGoalId': r['canonicalGoalId'], 'jurisdiction': region,
        'authorActionReviewed': r['action'], 'independentVerdict': verdict,
        'printedPages': rr['printedPages'] if rr else ([43] if region=='DE-HE' else []),
        'physicalPages': rr['physicalPages'] if rr else ([43] if region=='DE-HE' else []),
        'nativeWholeScopeAccepted': False,
        'originalOperatorAgeExperimentOrNamedContentObligationsRemainOpen': True,
        'reason': rationales[r['canonicalGoalId'][:8]],
    })
assert len(relations) == 71
write('independent-a.source71.current-boundaries.actual.review.json', {
    'schemaVersion': 1, 'reviewer': '/root/bio_neuro_v2_independent_a',
    'relationsReviewed': relations,
    'regionalRelations': 38, 'oldHEAuthoredOperationalisationRelations': 16, 'BYRelations': 17,
    'wholeSourceDecisionHoldsActuallyCountedFromCandidates': 31,
    'HEActualOriginalQ23Bullets': {'sharedGKAndLK': 3, 'additionalLK': 7},
    'localGK1LK7KeysAreOfficialBulletNumbering': False,
    'HEGK1RequiredUnion': ['ce19b80f-d392-5851-ac92-750c85adfb3e','e3fb5f1d-e277-5e28-8883-45821b972607','04d770b3-ba5e-5438-88ca-110cbaeba62c','080b10c7-f308-57ff-b067-3bd189e37fea'],
    'HEGK2CoverageComplete': False,
    'BYRemovedExactDiseaseAndDiagnosticClaimsApprovedAsRemoval': True,
    'BYNamedOriginalDutiesCleared': False,
    'NISekIOriginalBoundary': 'The primary printed86 table requires stimulus-to-brain signalling, sense-organ conversion and introductory sex-hormone messenger function. It does not make detailed chemical/electrical synapses or joint endocrine loops compulsory. No new NI native target is asserted.',
    'RPFinalExactRawFieldsAndPageCorrection': 'KEEP: application to different poison/drug problems is actually retained; printed36 equals physical38. The raw correction does not discharge that transfer duty.',
    'SH2023': 'Outgoing cohorts only; official 2026/27 rollout is growing from the entry year. Native stage/course scopes do not enforce cohorts.',
    'THElementaryLearningDuty': 'Strengthening/deactivation of neuronal connections as a learning foundation remains a specific lower-depth duty; it is not discharged by assigning an unrestricted upper network task.',
    'integrationReady': False, 'qualityFloorRelaxed': False,
})

primary_root = ROOT / 'tmp/biologie-neuro21-v2-independent-a-primary/native-inputs/curricula/DE/Gymnasium/input'
sources = []
for state, physical, printed in [('HE',[43],[43]),('BB',[27,32,34],[27,32,34]),('BE',[27,32,34],[27,32,34]),('HH',[22,25],[22,25]),('MV',[24],[20]),('NI',[86],[86]),('NW',[25,26,35,36,37,38],[25,26,35,36,37,38]),('RP',[38,39],[36,37]),('SH',[26,28],[24,26]),('SN',[34,35],[22,23]),('ST',[38,39],[38,39]),('TH',[22,23,24],[16,17,18])]:
    pdf = next((primary_root/state).rglob('*.pdf'))
    sources.append({'jurisdiction': f'DE-{state}', 'frozenPDFInput': str(pdf.relative_to(ROOT)), 'sha256': hashlib.sha256(pdf.read_bytes()).hexdigest(), 'physicalPagesRead': physical, 'printedPages': printed, 'inspection': 'actual frozen primary PDF text; HE43 also visually inspected'})
write('independent-a.primary-reading.actual.receipt.json', {
    'schemaVersion':1, 'sources':sources,
    'freshOfficialWebChecked':[{'url':'https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf','checked':'actual official HE43 image and current primary PDF'}, {'url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/biologie/erhoeht','checked':'B13 neuron, membrane, AP, named disease, electrical diagnostics, stress and receptor clauses'}, {'url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/biologie/grundlegend','checked':'GA common neuron/membrane/rest/AP/conduction clauses'}, {'url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/8/biologie','checked':'current official primary school-year page'}, {'url':'https://fachportal.lernnetz.de/sh/faecher/biologie/fachanforderungen.html','checked':'2026/27 entry transition and outgoing2023 validity'}],
    'sourceReadingProvesRightsClearance':False,
    'HELK7ExactRawFinding': {'sourceGoalId':'bfd043fc-7eb7-5ff5-90ab-e2d978d21aa0','printedSpelling':'neurophysiogische','candidateRawSpelling':'neurophysiologische','verdict':'REVISE_RAW_TRANSCRIPTION','requiredAuthorCorrection':'Preserve the printed spelling in rawSourceText/rawParentBulletText and original raw component evidence; keep a corrected normalized label in separately declared editorial fields. Rebuild and freeze the changed extraction/input receipt; retain historical v2 bytes.'},
})
