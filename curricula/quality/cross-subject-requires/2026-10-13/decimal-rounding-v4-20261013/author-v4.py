# Apache-2.0. Generates only a fresh inert author package; never active inputs.
from pathlib import Path
import copy, hashlib, json
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP, ROUND_FLOOR, ROUND_CEILING

BASE = Path('tmp/cross-subject-requires/decimal-rounding-v4-20261013')
OLD = Path('tmp/cross-subject-requires/decimal-rounding-v3-20261013')
NOW = datetime.now(timezone.utc).isoformat()
AUTHOR = 'Codex GPT-6.1 Sol Ultra / requires_runtime_path / v4 author'
GOAL_ID = '077d5e2f-27f2-5215-9d48-fe002cf1c663'

def read(p): return json.loads(Path(p).read_text())
def binding(p):
    p = Path(p); data = p.read_bytes()
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'byteLength': len(data)}
def write(name, obj):
    p = BASE / name
    with p.open('x') as f: f.write(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return binding(p)
def check(row):
    assert binding(row['path']) == row, row['path']

# The final exact peer verdict must exist before authoring the amendment.
peer = read(OLD / 'index.independent-review-v1.json')
assert binding(OLD / 'index.independent-review-v1.json')['sha256'] == 'sha256:6bf366da3fb8c56e18baf04bc4c96f3b0a4fa08f092cd5e8aa0bbf1ff31d224e'
check(peer['sealedAuthorPackageBinding'])
for row in peer['entryPoints'].values(): check(row)
review = read(peer['entryPoints']['scientificReview']['path'])
assert next(g for g in review['gates'] if g['gate'] == 'all_six_prompts_are_uncued')['status'] == 'reject'
old_seal = read(OLD / 'sealed-author-package.index.json')
for row in old_seal['files'] + old_seal['retainedOriginalInputs']: check(row)
retained = []
for directory in [Path('tmp/cross-subject-requires/decimal-rounding-v2-20261013'), OLD]:
    retained += [binding(p) for p in sorted(directory.rglob('*')) if p.is_file()]
write('retained-originals.sha256.json', {'schemaVersion': 1, 'recordedAt': NOW, 'status': 'immutable_v2_v3_history_no_verdict_rebinding', 'files': retained})

old_goal = read(OLD / 'goal.author-candidate.json')
goal = copy.deepcopy(old_goal)
goal.update(schemaVersion=4, author=AUTHOR, authoredAt=NOW)
goal['retainedInputs'] = [binding(OLD / 'sealed-author-package.index.json'), binding(OLD / 'index.independent-review-v1.json')]
goal['canonicalBaseline'] = binding(old_goal['canonicalBaseline']['path'])
goal['amendmentScope'] = 'Only fresh assessment/P/D examples and enforced learner/teacher field separation; proposed goal meaning, source scope, intrinsic foundations, orientation-only entry and inactive placement remain unchanged.'
write('goal.author-candidate.json', goal)

old_baseline = read(OLD / 'active-input-baseline.sha256.json')
files = [binding(row['path']) for row in old_baseline['files']]
write('active-input-baseline.sha256.json', {'schemaVersion': 1, 'status': 'fresh_current_v4_inputs_read_only_baseline', 'recordedAt': NOW, 'files': files})
old_drift = [row['path'] for row, new in zip(old_baseline['files'], files) if row['sha256'] != new['sha256']]
write('current-baseline-comparison.json', {'schemaVersion': 1, 'v3Baseline': binding(OLD / 'active-input-baseline.sha256.json'), 'v4Baseline': binding(BASE / 'active-input-baseline.sha256.json'), 'changedSinceV3': old_drift, 'pastReviewRebound': False})

# Verbatim retained context is explicitly historical; no new read/approval date.
context_names = ['prerequisites.author-decisions.json', 'source-mappings-and-placement.author-candidate.json', 'source-actual-read.author-receipt.json', 'existing-prerequisites.native-P.context.json', 'physics-dependents.native-P.context.json', 'intrinsic-preparation-and-teaching.author-candidate.json', 'atomicity-memory-kind.author-candidate.json', 'quality-route-assessment-impact.author-plan.json', 'historical-input-drift.context.json']
(BASE / 'retained-context').mkdir()
context_copies = []
for name in context_names:
    dest = BASE / 'retained-context' / name
    with dest.open('xb') as f: f.write((OLD / name).read_bytes())
    context_copies.append({'source': binding(OLD / name), 'verbatimCopy': binding(dest)})
(BASE / 'retained-context' / 'source-context-v3').mkdir()
for src in sorted((OLD / 'source-context-v3').glob('*.json')):
    dest = BASE / 'retained-context' / 'source-context-v3' / src.name
    with dest.open('xb') as f: f.write(src.read_bytes())
    context_copies.append({'source': binding(src), 'verbatimCopy': binding(dest)})
write('context-retention-and-semantic-invariants.json', {
    'schemaVersion': 4, 'status': 'author_amendment_context_not_independent_approval',
    'v3PeerManifest': binding(OLD / 'index.independent-review-v1.json'),
    'v3ScientificReview': peer['entryPoints']['scientificReview'],
    'unchangedGoalBody': goal['proposedGoal'] == old_goal['proposedGoal'],
    'unchangedFoundationAndRule': goal['intrinsicPreparation'] == old_goal['intrinsicPreparation'] and goal['alignmentRule'] == old_goal['alignmentRule'],
    'sourceReadBasis': 'Actual author reads of all16 source rows/passages,19 relevant PDF pages,full existing Math/Physics P occurred in v3 and remain exactly bound; no new full-corpus or independent read is claimed by these verbatim copies.',
    'sourceBodyAndRolesAndLocatorsUnchanged': True, 'contextCopies': context_copies,
    'v3RejectedAllSixUncuedClaimAcknowledged': True,
    'newContentReviewPending': True, 'activationApproved': False,
})

raw_cases = [
    ('decimal-case-001', '7.386', 2, '7.39'),
    ('decimal-case-002', '0.00327', 4, '0.0033'),
    ('decimal-case-003', '29.995', 2, '30.00'),
    ('decimal-case-004', '4.7328', 2, '4.73'),
    ('decimal-case-005', '0.00031', 3, '0.000'),
    ('decimal-case-006', '1.2449', 2, '1.24'),
]
places = {2: 'hundredths', 3: 'thousandths', 4: 'ten_thousandths'}
learner_facts = {'schemaVersion': 1, 'audience': 'learner', 'cases': [ {'id': id, 'number': n, 'place': places[p]} for id,n,p,a in raw_cases ]}
write('learner-facts.author-candidate.json', learner_facts)
write('learner-facts.schema.json', {
    '$schema': 'https://json-schema.org/draft/2020-12/schema', 'type': 'object', 'additionalProperties': False,
    'required': ['schemaVersion', 'audience', 'cases'],
    'properties': {'schemaVersion': {'const': 1}, 'audience': {'const': 'learner'}, 'cases': {'type': 'array', 'minItems': 6, 'maxItems': 6, 'items': {'type': 'object', 'additionalProperties': False, 'required': ['id','number','place'], 'properties': {'id': {'type':'string','pattern':'^decimal-case-00[1-6]$'}, 'number': {'type':'string','pattern':'^(0|[1-9][0-9]*)\\.[0-9]+$'}, 'place': {'enum': list(places.values())}}}}},
})

explanations = [
    ('7,39. Die selbst bestimmte Hundertstelziffer 8 bezeichnet acht Hundertstel; die folgende 6 bezeichnet sechs Tausendstel. Der Rest entspricht 6 von 10 Tausendsteln und liegt über einer halben Hundertsteleinheit. 7,39 ist daher näher als 7,38. Abschneiden ergäbe 7,38; die Verfahren unterscheiden sich.',
     '7.39. The independently identified hundredths digit 8 denotes eight hundredths; the following 6 denotes six thousandths. The tail is 6 of 10 thousandths, exceeding half one hundredth. Thus 7.39 is nearer than 7.38. Truncation gives 7.38, so the procedures differ.'),
    ('0,0033. Die Nullstellen halten Zehntel und Hundertstel frei. 3 steht für drei Tausendstel, 2 für zwei Zehntausendstel und 7 für sieben Hunderttausendstel. Der Zielschritt ist ein Zehntausendstel, also zehn Hunderttausendstel. Sieben dieser zehn Teile liegen über der Hälfte; 0,0033 ist näher als 0,0032. Abschneiden ergäbe 0,0032.',
     '0.0033. The zero places preserve empty tenths and hundredths. 3 denotes three thousandths, 2 two ten-thousandths and 7 seven hundred-thousandths. The target step is one ten-thousandth, or ten hundred-thousandths. Seven of those ten parts exceed half, making 0.0033 nearer than 0.0032. Truncation gives 0.0032.'),
    ('30,00. Der Rest von fünf Tausendsteln ist genau die Hälfte einer Hundertsteleinheit; dies wird aus der Zahl erkannt, nicht im Lernauftrag vorgegeben. Die gegebene Regel wählt den größeren Nachbarn. Ein Hundertstel mehr als 29,99 erfordert Bündelungen über die Neunen: zehn Hundertstel werden ein Zehntel, zehn Zehntel ein Einer, zehn Einer ein Zehner. 30 und 30,00 sind wertgleich; die Darstellung behauptet keine Messgenauigkeit. Abschneiden ergäbe 29,99.',
     '30.00. The tail of five thousandths is exactly half one hundredth; the learner identifies this from the number rather than a classified prompt. The supplied rule chooses the larger neighbor. Increasing 29.99 by a hundredth regroups across the nines: ten hundredths make a tenth, ten tenths one, and ten ones a ten. 30 and 30.00 have equal value; the notation makes no measurement-precision claim. Truncation gives 29.99.'),
    ('4,73. Zwei Tausendstel mit acht weiteren Zehntausendsteln bleiben unter drei Tausendsteln und somit unter der halben Hundertsteleinheit von fünf Tausendsteln. 4,73 ist näher als 4,74. Die weiter rechts stehende 8 ändert diese Grenze nicht. Abschneiden liefert hier denselben Wert; das macht Abschneiden und Runden nicht allgemein gleich.',
     '4.73. Two thousandths plus eight further ten-thousandths remain below three thousandths, hence below half a hundredth, which is five thousandths. 4.73 is nearer than 4.74. The later 8 does not change that bound. Truncation gives the same value here, but this does not make truncation and rounding identical in general.'),
    ('0,000. Drei Zehntausendstel mit einem weiteren Hunderttausendstel bleiben unter vier Zehntausendsteln und damit unter der halben Tausendsteleinheit. Der nähere Nachbar ist Null, obwohl die Ausgangszahl positiv ist. Die Nullhalter erhalten die vorgegebene Stellenordnung. 0 und 0,000 sind wertgleich; kein nichtnull Ergebnis wird verlangt. Abschneiden ergäbe ebenfalls Null.',
     '0.000. Three ten-thousandths plus a further hundred-thousandth remain below four ten-thousandths, and thus below half a thousandth. Zero is the nearer neighbor although the input is positive. Zero placeholders preserve the requested place layout. 0 and 0.000 have equal value; no nonzero result is required. Truncation also gives zero.'),
    ('1,24. Vier Tausendstel mit weiterem Rest von neun Zehntausendsteln bleiben unter fünf Tausendsteln; das ist weniger als eine halbe Hundertsteleinheit. Direktes Runden auf die vorgegebene Hundertstelstelle wählt 1,24. Erst auf Tausendstel zu 1,245 und dann auf Hundertstel zu 1,25 zu runden verändert die Ausgangszahl und ist hier falsch. Abschneiden ergäbe 1,24.',
     '1.24. Four thousandths plus a tail of nine ten-thousandths remain below five thousandths, hence below half one hundredth. Direct rounding to the requested hundredths chooses 1.24. First rounding to thousandths as 1.245 and then to hundredths as 1.25 changes the original number and is incorrect here. Truncation gives 1.24.'),
]
focus = [
    ('Selbstständige Stellenwahl und begründete obere Nachbarwahl; Unterschied zu Abschneiden.', 'Independent place identification and justified upper-neighbor choice; contrast with truncation.'),
    ('Unmarkierte Dezimalstellen und Nullhalter bei kleiner positiver Zahl.', 'Unmarked decimal places and zero placeholders for a small positive value.'),
    ('Selbst erkannter Halbfall und vollständiges Zehn-zu-eins-Bündeln.', 'Independently recognized tie and complete ten-to-one regrouping.'),
    ('Frische untere Nachbarwahl trotz späterer großer Ziffer, ohne Richtungshinweis.', 'Fresh lower-neighbor choice despite a later large digit, with no direction cue.'),
    ('Frisches selbst ermitteltes Nullergebnis und begründete Nullhalter.', 'Fresh independently obtained zero result and justified zero placeholders.'),
    ('Direkte Entscheidung aus unveränderter Ausgangszahl statt Doppelrunden.', 'Direct decision from the unchanged original number instead of double rounding.'),
]
teacher_cases = []
for i,(id,n,p,answer) in enumerate(raw_cases):
    x=Decimal(n); q=Decimal(1).scaleb(-p); actual=x.quantize(q,rounding=ROUND_HALF_UP)
    assert format(actual, f'.{p}f') == answer
    lower=x.quantize(q,rounding=ROUND_FLOOR); upper=x.quantize(q,rounding=ROUND_CEILING)
    double=x.quantize(q/10,rounding=ROUND_HALF_UP).quantize(q,rounding=ROUND_HALF_UP)
    teacher_cases.append({'id':id, 'audience':'teacher_only', 'inputNumber':n, 'decimalPlaces':p,
        'expectedRoundedValue':answer, 'lowerNeighbor':format(lower,f'.{p}f'), 'upperNeighbor':format(upper,f'.{p}f'),
        'truncatedValue':format(lower,f'.{p}f'), 'tailInTargetSteps':str((x-lower)/q), 'exactTie':(x-lower)/q == Decimal('0.5'),
        'expectedPerformanceDe':explanations[i][0], 'expectedPerformanceEn':explanations[i][1],
        'understandingFocusDe':focus[i][0], 'understandingFocusEn':focus[i][1],
        'wrongStrategyOutputs': {'always_up':format(upper,f'.{p}f'), 'always_down':format(lower,f'.{p}f'), 'truncate':format(lower,f'.{p}f'), 'double_round_one_finer':format(double,f'.{p}f'), 'wrong_place_one_coarser':format(x.quantize(q.scaleb(1),rounding=ROUND_HALF_UP),f'.{p-1}f')},
        'notIndependentIfLearnerExposedToThisKey':True})
write('teacher-grading.author-candidate.json', {'schemaVersion':4, 'audience':'teacher_only', 'goalId':GOAL_ID, 'cases':teacher_cases,
    'allAspectEvidence':'Assess independently identified decimal places, ten-to-one units, zero placeholders, nearest choice in both directions, an independently recognized exact half, carrying, and rounding/truncation contrast. A bare correct number or paraphrase of the general rule is insufficient; judge the learner\'s substantive explanation.',
    'examplesAreNotQuota':'Six cases illustrate diagnostic coverage, not six compulsory tasks. Enough all-aspect independent multi-step transfer may be shown in fewer integrated tasks; the native minimum of two independent evidence instances can occur inside one task. Stop when the evidence is sufficient.',
    'freshnessLimit':'Fresh numerical variation relative to v3 and the teaching example is verified; actual learner exposure/history and real-host withholding of teacher fields are not proven by this inert package.',
    'valueEquality':'Equivalent representations such as30 or30.00 and0 or0.000 are mathematically accepted with demonstrated understanding of the requested place; no measurement precision is inferred.',
})

p=read(OLD/'positive-profile.body.author-candidate.json')
p['applicationCaseBriefs']=[] # Populated by the allowlisted learner renderer later.
p['variationAxes'].append({'id':'original-number-direct-rounding','textDe':'Direkt aus der ursprünglichen Zahl entscheiden; ein weiterer Fall unterscheidet dies von erst feinerem und dann gröberem Runden. Der Auftrag verrät diese Fallklasse nicht.','textEn':'Decide directly from the original number; a further case separates this from rounding first to a finer and then a coarser place. The prompt does not reveal this case class.'})
write('positive-profile.template.author-candidate.json',p)
d=read(OLD/'description-profile.body.author-candidate.json')
d['variationAxes']=copy.deepcopy(p['variationAxes'])
def pair(id,de,en,ce_de,ce_en): return {'id':id,'signalDe':de,'signalEn':en,'correctionEvidenceDe':ce_de,'correctionEvidenceEn':ce_en}
d['misconceptions']=[
    pair('truncate-or-always-down','7,386 wird auf Hundertstel als 7,38 angegeben.','7.386 is reported as 7.38 to hundredths.',explanations[0][0],explanations[0][1]),
    pair('zero-skips-place','Bei 0,00327 werden Nullhalter übersprungen oder Hundertstel, Tausendstel und Zehntausendstel verwechselt.','For0.00327, zero placeholders are skipped or hundredths, thousandths and ten-thousandths confused.',explanations[1][0],explanations[1][1]),
    pair('carry-or-tie-lost','29,995 wird als29,99 oder29,910 statt30,00 angegeben.','29.995 is reported as29.99 or29.910 instead of30.00.',explanations[2][0],explanations[2][1]),
    pair('always-up-or-late-digit','4,7328 wird auf Hundertstel zu4,74 gerundet, weil eine spätere8 betrachtet wird.','4.7328 is rounded to4.74 at hundredths by attending to a later8.',explanations[3][0],explanations[3][1]),
    pair('zero-output-forbidden','0,00031 wird auf Tausendstel als0,001 angegeben, weil ein positives Eingangsergebnis angeblich nicht Null werden dürfe.','0.00031 is reported as0.001 to thousandths because a positive input is incorrectly assumed never to round to zero.',explanations[4][0],explanations[4][1]),
    pair('double-round','1,2449 wird über1,245 auf1,25 gerundet.','1.2449 is rounded through1.245 to1.25.',explanations[5][0],explanations[5][1]),
]
d['contrastCaseBriefs']=[
    {'id':'round-and-truncate','purposeDe':'7,386 auf Hundertstel unterscheidet Runden und Abschneiden.','purposeEn':'7.386 to hundredths separates rounding and truncation.','strengthDe':'Beide Werte und ihre Unterschiede werden unabhängig begründet.','strengthEn':'Both values and their difference are independently justified.','whyAlternativesUnderperformDe':'Nur Fälle mit identischen Werten können Abschneiden als allgemeine Fehlstrategie nicht ausschließen.','whyAlternativesUnderperformEn':'Cases with identical values cannot exclude truncation as a general mistaken strategy.'},
    {'id':'boundary-and-regrouping','purposeDe':'29,995 auf Hundertstel prüft einen selbst erkannten Halbfall und Bündelung.','purposeEn':'29.995 to hundredths tests independent tie recognition and regrouping.','strengthDe':'Der Lernauftrag klassifiziert den Halbfall und Übertrag nicht.','strengthEn':'The learner prompt does not classify the tie or carrying.','whyAlternativesUnderperformDe':'Nur Fälle ohne Übertrag belegen kein Bündeln über mehrere Stellen.','whyAlternativesUnderperformEn':'Cases without carrying do not establish regrouping across several places.'},
    {'id':'lower-and-zero','purposeDe':'4,7328 auf Hundertstel und0,00031 auf Tausendstel widerlegen Immer-aufrunden.','purposeEn':'4.7328 to hundredths and0.00031 to thousandths refute always rounding up.','strengthDe':'Weder Richtung noch Nullergebnis werden im Lernauftrag geliefert.','strengthEn':'Neither direction nor a zero result is supplied in the learner prompt.','whyAlternativesUnderperformDe':'Nur obere Nachbarwerte widerlegen diese Strategie nicht.','whyAlternativesUnderperformEn':'Only upper-neighbor outcomes do not refute this strategy.'},
    {'id':'direct-and-double','purposeDe':'1,2449 auf Hundertstel unterscheidet Direkt- und Doppelrunden.','purposeEn':'1.2449 to hundredths distinguishes direct and double rounding.','strengthDe':'Die Entscheidung erfolgt aus der unveränderten Ausgangszahl ohne Klassifikationshinweis.','strengthEn':'The decision uses the unchanged input with no class cue.','whyAlternativesUnderperformDe':'Viele einfache Fälle liefern bei beiden Verfahren zufällig denselben Wert.','whyAlternativesUnderperformEn':'Many simple cases coincidentally give the same result for both procedures.'},
]
write('description-profile.body.author-candidate.json',d)
write('assessment-probes.author-candidate.json', {'schemaVersion':4,'status':'author_design_not_empirical_evidence_or_exam_release','goalId':GOAL_ID,
    'learnerFacts':binding(BASE/'learner-facts.author-candidate.json'), 'teacherOnlyGrading':binding(BASE/'teacher-grading.author-candidate.json'),
    'deliveryRule':'Only renderer-produced learner prompts may be shown before independent learner work. Whole native P/D profiles are teacher/coach assessment context; their answer/diagnostic fields must not be copied into task stems. This is an inert design contract, not proof of production host delivery.',
    'sameNeutralRequestsForEveryCase':'Rounding and justification first; one common neutral truncation comparison may follow after the initial answer is recorded. No case-specific hint or result is supplied.',
    'noTaskQuota':True, 'examRouteImpact':'No current task, solution, score, goal coverage or assessment route is modified.'})
write('presentation-audience.contract.json', {
    'schemaVersion':4, 'status':'inert_author_delivery_contract_not_runtime_change_or_host_acceptance',
    'learnerAllowedFacts':['id','number','place'],
    'learnerVisibleOutputs':['learner-prompts.author-candidate.json:cases[].taskDemandDe','learner-prompts.author-candidate.json:cases[].taskDemandEn','learner-prompts.author-candidate.json:sharedNeutralComparisonDe','learner-prompts.author-candidate.json:sharedNeutralComparisonEn'],
    'teacherOnlyFiles':['teacher-grading.author-candidate.json','description-profile.body.author-candidate.json','description-evidence.author-candidate.jsonl'],
    'nativePositiveFieldAudience':{'applicationCaseBriefs[].taskDemandDe':'learner_stem_exact_renderer_output','applicationCaseBriefs[].taskDemandEn':'learner_stem_exact_renderer_output','applicationCaseBriefs[].expectedPerformanceDe':'teacher_only','applicationCaseBriefs[].expectedPerformanceEn':'teacher_only','applicationCaseBriefs[].understandingFocusDe':'teacher_only','applicationCaseBriefs[].understandingFocusEn':'teacher_only','expectations':'teacher_only','variationAxes':'teacher_only','coverageExpectations':'teacher_only'},
    'defaultAudienceForUnlistedFields':'teacher_only',
    'scaffold':'An optional blank labelled place-value table may be supplied as previously scoped. No filled digit, highlight, selected neighbor, answer, case class, direction, or answer list is learner input.',
    'caseIdPolicy':'Opaque ordinal case IDs; not displayed in the task sentence. No answer-class labels are projected.',
    'postAnswerComparison':'The same neutral comparison prompt may follow every initial response; it supplies no result or direction. It is not a correction cue or a new task quota.',
    'productionBoundary':'No runtime/UI/coach code or prompt policy is changed. Actual independent review and eventual delivery-context verification are pending.'})
gates=read(OLD/'independent-gates.pending.json'); gates['schemaVersion']=4
gates['gates']['independent_uncued_stems_teacher_boundary_and_diagnostic_transfer']={'status':'pending','approvalClaimed':False}
gates['priorReviewNotTransferred']='V3 peer found scope/core sound but rejected the all-six-uncued claim. No prior PASS is mechanically rebound to v4; all final-context gates remain pending.'
write('independent-gates.pending.json',gates)
write('peer-findings-and-amendment.author-response.json', {'schemaVersion':4,'status':'author_response_pending_new_independent_review','author':AUTHOR,
    'v3PeerBinding':binding(OLD/'index.independent-review-v1.json'),
    'findings':[{'priorCaseId':f['caseId'],'finding':f['rationale'],'response':'All six original prompts replaced with fresh numeric cases and one identical renderer template; no deciding digit, result, direction or boundary classification is a variable learner field.'} for f in review['cueFindings']],
    'systematicScope':'All P taskDemand stems and any assessment learner output use exact renderer projection. D misconceptions, contrast purposes, expected answers and all diagnostic classifications are explicitly teacher-only. Teaching examples are instructional help and cannot be independent evidence.',
    'preservedMeaning':'Identical proposedGoal, source/body/domain/rule and intrinsic foundation; orientation653 is still the only direct requires. No inference of2f or natural-rounding mastery.',
    'newCasePurposeTeacherOnly':['upper choice versus always-down/truncate','small zero-place mapping versus wrong-place','independently recognized tie and carry','fresh lower choice versus always-up/late-digit','fresh zero output versus always-up/nonzero-only','direct versus double rounding'],
    'sixExamplesAreNoQuota':True, 'actualLearnerEvidenceClaimed':False, 'activeMutation':False, 'independentSelfApprovalClaimed':False})

# Copy author tools with a fresh base. Verifiers are added separately before seal.
for name in ['bind-native-candidates.ts','route-impact.ts']:
    text=(OLD/name).read_text().replace(str(OLD),str(BASE)).replace('v3','v4').replace('V3','V4')
    if name=='bind-native-candidates.ts':
        text=text.replace('ImageV and dualD are pending.', 'Prompt/teacher separation is author-validated only; actual independent P/D/host-context review, ImageV and dualD are pending.')
    else:
        text=text.replace("[mathPath, physicsPath, `${base}/goal.author-candidate.json`,", "[mathPath, physicsPath, mathKindPath, physicsKindPath, `${base}/active-input-baseline.sha256.json`, `${base}/goal.author-candidate.json`,")
    with (BASE/name).open('x') as f: f.write(text)
print(json.dumps({'status':'v4_unsealed_author_inputs_written','retainedHistoryFiles':len(retained),'currentBaselineFiles':len(files),'cases':len(raw_cases),'currentDrift':old_drift,'activeWrites':False}))
