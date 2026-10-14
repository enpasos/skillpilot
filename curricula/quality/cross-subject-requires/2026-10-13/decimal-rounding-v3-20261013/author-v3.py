"""Apache-2.0. Author an inert, versioned candidate; never write active inputs."""
from pathlib import Path
import copy, datetime, hashlib, json, os, subprocess, uuid

ROOT = Path(__file__).resolve().parents[3]
BASE = Path(__file__).resolve().parent
OLD = ROOT / 'tmp/cross-subject-requires/decimal-rounding-v2-20261013'
GOAL = '077d5e2f-27f2-5215-9d48-fe002cf1c663'
ORIENTATION = '65365dce-f33f-49d8-9516-42f75883aa86'
REPRESENTATION = '2f565855-bcd6-4da5-bc80-4b72a2d93d50'
NATURAL = 'fe07241a-b779-5f35-a82d-7aa51ae74f42'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
AUTHOR = 'Codex GPT-6.1 Sol Ultra / requires_runtime_path / v3 author'
STATUS = 'inert_author_candidate_pending_independent_scientific_source_scope_route_and_native_gates'
def load(p): return json.loads(Path(p).read_text())
def sha(b): return 'sha256:' + hashlib.sha256(b).hexdigest()
def bind(p):
    p = Path(p); b = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': sha(b), 'byteLength': len(b)}
def canon(v): return json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
def write(name, value):
    p = BASE / name; p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as f: json.dump(value, f, ensure_ascii=False, indent=2); f.write('\n')
    return bind(p)

review = load(OLD / 'index.independent-review-v1.json')
assert bind(OLD / 'index.independent-review-v1.json')['sha256'] == 'sha256:c4a91e60a74682f3bc836663e2ae7acb41f7029339f7dde42ff76590f039372b'
for entry in [review['sealedAuthorPackageBinding'], *review['entryPoints'].values()]:
    assert bind(ROOT / entry['path'])['sha256'] == entry['sha256']
retained = [bind(OLD / 'sealed-author-package.index.json'), bind(OLD / 'index.independent-review-v1.json'), *review['entryPoints'].values()]
old_baseline = load(OLD / 'active-input-baseline.sha256.json')['files']
baseline_paths = {r['path'] for r in old_baseline}
for directory in ['curricula/DE/Gymnasium/composition-views/mathematik', 'curricula/DE/Gymnasium/composition-views/physik']:
    baseline_paths.update(str(p.relative_to(ROOT)) for p in (ROOT / directory).glob('*.view.json'))
baseline_paths.update(['contracts/goal-evidence/v1/goal-evidence-profile.schema.json', 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
    'app/scripts/goalEvidenceProfileModel.ts', 'app/scripts/positiveGoalEvidenceProfileModel.ts',
    'app/src/utils/authoring/compositionViewAuthoring.ts', 'app/src/utils/authoring/canonicalAuthoring.ts'])
baseline = [bind(ROOT / p) for p in sorted(baseline_paths)]
write('active-input-baseline.sha256.json', {'schemaVersion': 1, 'status': 'fresh_current_inputs_read_only_baseline', 'recordedAt': NOW, 'files': baseline})
historical_drift = [dict(path=r['path'], historicalSha256=r['sha256'], currentSha256=bind(ROOT/r['path'])['sha256']) for r in old_baseline if bind(ROOT/r['path'])['sha256'] != r['sha256']]
write('historical-input-drift.context.json', {'schemaVersion': 1, 'status': 'historical_bindings_preserved_not_rebound', 'oldBaseline': bind(OLD/'active-input-baseline.sha256.json'),
    'observedDrift': historical_drift, 'viewDriftCount': sum(r['path'].endswith('.view.json') for r in historical_drift), 'noCurrentScopeApprovalClaimed': True})

math_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
math = load(math_path); by_id = {g['id']:g for g in math['goals']}
assert GOAL not in by_id
assert str(uuid.uuid5(uuid.UUID(math['landscapeId']), 'canonical_math_sek1_decimal_numbers_round_given_place')) == GOAL
old_goal = load(OLD / 'goal.author-candidate.json')
goal = copy.deepcopy(old_goal['proposedGoal'])
goal.update(title='Nichtnegative Dezimalzahlen auf eine vorgegebene Stelle runden', titleEn='Round nonnegative decimals to a specified place',
    description='Die lernende Person kann nichtnegative endliche Dezimalzahlen auf eine vorgegebene Stelle zum nächstgelegenen Nachbarwert auf dieser Stelle runden, bei genau halbem Abstand nach der angegebenen Schulregel den größeren Wert wählen, die Entscheidung mit der Bedeutung der Dezimalstellen einschließlich Nullen und Überträgen begründen und Runden vom Abschneiden unterscheiden.',
    descriptionEn='The learner can round nonnegative terminating decimals to the nearest value at a specified place, choose the larger value at an exact halfway point under the stated school rule, justify the choice using decimal place-value meaning including zeros and carrying, and distinguish rounding from truncation.',
    requires=[ORIENTATION], resourceLinks=[])
goal_artifact = write('goal.author-candidate.json', {'schemaVersion': 3, 'status': STATUS, 'author': AUTHOR, 'authoredAt': NOW,
    'retainedInputs': retained, 'canonicalBaseline': bind(math_path), 'proposedGoal': goal,
    'uuidDerivation': old_goal['uuidDerivation'],
    'sourceApplicabilityClaim': 'Author-proposed common nonnegative terminating-decimal core with partial16-source support. Exact source/grade/stage/placement and universality remain independently pending. phaseJ6 is compatibility grouping only.',
    'intrinsicPreparation': {'neededUnderstandingDe': 'Stellen rechts vom Komma teilen die links benachbarte Einheit jeweils in zehn gleiche Teile. Eine Null hält ihre Stelle frei; zehn kleinere Einheiten werden zu einer Einheit links gebündelt. Die Zielstelle legt den Abstand zwischen zwei benachbarten möglichen Rundungswerten fest.',
        'neededUnderstandingEn': 'Each place to the right of the decimal point divides the adjacent unit on its left into ten equal parts. A zero preserves its place; ten smaller units regroup as one unit to the left. The target place sets the step between neighboring possible rounded values.',
        'assistance': 'Optional blank labelled digit-place table; labels may remain but learner fills digits and independently decides. No highlighted decisive digit, completed table, selected neighbor or supplied rounded answer in fresh probes.',
        'notMasteryClaims': [REPRESENTATION, NATURAL, '624764d6-becd-5f9b-ada3-0d4f9d143073', '4eeab7d5-eeb3-579b-845e-1c52ffe9e89f'],
        'granularityDecision': 'Needed narrow place-value/regrouping meaning is taught and assessed inside this single rounding operation. No nonexistent narrower approved prerequisite ID is invented. Independent atomicity/granularity review remains pending.'},
    'alignmentRule': 'Given target place; nearest conventional school rounding; exact positive tie chooses the larger value. This specifies the school operation, not an arbitrary target-answer rule or a general alternative-rule curriculum.',
    'domainBoundaries': {'required': 'Nonnegative terminating decimals, including a positive input whose rounded output is zero.', 'signedTransfer': 'Optional separate future source/method/placement review; no signed-rounding mastery or universal Physics applicability claimed.',
        'excluded': ['selecting a place from measurement uncertainty or context', 'significant-figure policy', 'independent decimal subtraction', 'fraction equivalence/reduction', 'constructing a separately scaled number line', 'periodic decimals']},
    'activationAuthorized': False, 'nativeIndependentApprovalClaimed': False,
    'licensing': old_goal['licensing']})

prerequisite_decisions = [
    {'goalId': ORIENTATION, 'decision': 'retain_orientation_entry_condition', 'rationaleDe': 'Die vorhandene Sek-I-Orientierung bleibt als fachübergreifender Einstieg erhalten. Ihr Marker ist keine mathematische Kompetenz und ersetzt keinen Stellenwertnachweis.', 'rationaleEn': 'Retain the existing lower-secondary orientation entry condition. Its marker is not mathematical competence and does not replace place-value evidence.'},
    {'goalId': REPRESENTATION, 'decision': 'do_not_require_whole_broader_goal', 'rationaleDe': 'Der vollständige aktuelle P verlangt auch wertgleiche bzw. gekürzte Brüche und eine selbst gewählte Zahlengeradenskala. Diese Leistungen sind für die geprüfte Dezimalstellen-/Bündelungsbegründung nicht universal notwendig; sie werden weder vorausgesetzt noch aus dem Rundungserfolg gemeistert.', 'rationaleEn': 'The complete current P also demands equivalent/reduced fractions and an independently selected number-line scale. These performances are not universally necessary for the assessed decimal-place/regrouping explanation and are neither assumed nor mastered by rounding success.'},
    {'goalId': NATURAL, 'decision': 'unchanged_goal_helpful_analogy_not_universal_prerequisite', 'rationaleDe': 'Der aktuelle natürliche Rundungs-P umfasst sachabhängige Genauigkeitswahl und Rückgewinnung eines Ausgangswertbereichs. Die neue gegebene Dezimalstelle wird intrinsisch erklärt; das bestehende Ziel, seine requires, Bilder, P und Tests bleiben unverändert.', 'rationaleEn': 'The current natural-rounding P includes contextual precision choice and recovering an input interval. The new given decimal place is explained intrinsically; the existing goal, its requires, images, P and tests remain unchanged.'},
    {'goalId': '624764d6-becd-5f9b-ada3-0d4f9d143073', 'decision': 'broader_natural_number_system_comparison_not_required', 'rationaleDe': 'Natürliche Stellenwertzerlegung und Vergleich mit einem anderen Zahlensystem sind breiter als die hier intrinsisch geprüften Dezimalstellen. Keine ganze Ziel-Mastery wird angenommen.', 'rationaleEn': 'Natural-number decomposition and comparison with another numeral system are broader than the intrinsically assessed decimal places. Whole-goal mastery is not assumed.'},
    {'goalId': '4eeab7d5-eeb3-579b-845e-1c52ffe9e89f', 'decision': 'whole_rational_addition_subtraction_not_required', 'rationaleDe': 'Die Stellenwertentscheidung benötigt keine selbst ausgeführte Dezimalsubtraktion und keine Bruchdarstellungswechsel.', 'rationaleEn': 'The place-value decision does not require independently calculated decimal subtraction or fractional representation changes.'},
]
parent_id = 'de39c9fe-5940-4320-aca8-2be85d6ada8f'
parents = {}
for g in math['goals']:
    for c in g.get('contains', []): parents.setdefault(c, []).append(g['id'])
stack=[parent_id]; seen=set(); ancestor_requirements=[]
while stack:
    p=stack.pop()
    if p in seen: continue
    seen.add(p); ancestor_requirements.append({'goalId':p,'requires':by_id[p].get('requires',[])}); stack.extend(parents.get(p,[]))
assert all(not row['requires'] for row in ancestor_requirements)
write('prerequisites.author-decisions.json', {'schemaVersion': 3, 'status': STATUS, 'author': AUTHOR, 'goalId': GOAL, 'goalAuthorArtifact':goal_artifact,
    'currentGoalMeaningBindings': [{'goalId':r['goalId'],'sha256':sha(canon(by_id[r['goalId']])), 'wholeCurrentGoal':by_id[r['goalId']]} for r in prerequisite_decisions],
    'decisions':prerequisite_decisions, 'candidateDirectRequires':[ORIENTATION], 'proposedParentCurrentEffectiveAncestorRequirements':ancestor_requirements,
    'foundationRetainedAsIntrinsicAssessment': 'Ordinary digit interpretation, relative ten-part place values, zero placeholders, one-step increment and base-ten carrying are genuine foundations. They are introduced and independently assessed in this goal; they are not removed or replaced by answer cues.',
    'masteryBoundary':'A future save would apply only to this goal. It would not save2f, natural rounding, another numeral system, rational arithmetic or a Physics dependent. No requires-transitive mastery is implied.', 'scientificReviewPending':True})

# Current native records are reread in full, not mechanically rebound from v2.
for name in ['existing-prerequisites.native-P.context.json','physics-dependents.native-P.context.json']:
    old=load(OLD/name); rows=[]
    owner_landscape=math if name.startswith('existing') else load(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
    owner_goals={g['id']:g for g in owner_landscape['goals']}
    for r in old['rows']:
        native=[json.loads(line) for line in (ROOT/r['reviewPath']).read_text().splitlines() if line.strip()]
        matches=[x for x in native if x.get('goalId')==r['goalId']]
        assert len(matches)==1
        assert matches[0]==r['exactCurrentNativeRecord']
        rows.append({'goalId':r['goalId'],'currentGoal':owner_goals[r['goalId']], 'ownerConfigBinding':bind(ROOT/r['ownerConfigPath']),
            'reviewFileBinding':bind(ROOT/r['reviewPath']), 'exactCurrentNativeRecord':matches[0], 'authorActuallyReadFullP':True,
            'readLimit':'Current context read only, not a new native approval or successor hash rebind.'})
    write(name, {'schemaVersion':3,'status':'current_full_native_P_context_actually_read_author_only','rows':rows,'orientationContext':old.get('orientationContext')})

def example(cid,de,en,answer_de,answer_en,focus_de,focus_en): return dict(id=cid,taskDemandDe=de,taskDemandEn=en,expectedPerformanceDe=answer_de,expectedPerformanceEn=answer_en,understandingFocusDe=focus_de,understandingFocusEn=focus_en)
rule_de='Die Zielstelle ist vorgegeben. Wähle den nächstgelegenen Nachbarwert auf der Zielstelle; bei genau halbem Abstand den größeren. Eine leere beschriftete Stellenwerttafel ist erlaubt, ohne markierte Entscheidungsziffer oder vorgegebenen Nachbar.'
rule_en='The target place is given. Choose the nearest place-value value; at an exact halfway point choose the larger one. A blank labelled place-value table is allowed, without a highlighted deciding digit or supplied neighbor.'
cases=[
example('hundredths-upper','Runde 8,746 auf Hundertstel. Benenne den Wert der 4 und der 6 sowie den Schritt zwischen zwei benachbarten Hundertstelwerten. '+rule_de,'Round 8.746 to hundredths. State the values represented by4 and6 and the step between neighboring hundredth values. '+rule_en,
    '8,75. Die4 steht für4 Hundertstel und die6 für6 Tausendstel. Zehn Tausendstel bilden ein Hundertstel;6 von10 Teilen liegen über der Hälfte. Daher wird der Hundertstelwert erhöht.','8.75. The4 represents4 hundredths and the6 represents6 thousandths. Ten thousandths make one hundredth;6 of10 parts exceed half, so increment the hundredth value.','Stellenwertbegründete Näherungswahl statt einer bloß nachgesprochenen Ziffernregel.','A place-value explanation of the nearest choice rather than a repeated digit rule.'),
example('uncued-small-zero-layout','Runde selbstständig 0,00487 auf Zehntausendstel und erkläre die beiden Nullen vor der4. '+rule_de,'Independently round0.00487 to ten-thousandths and explain the two zeros before4. '+rule_en,
    '0,0049. Die Zielziffer8 ist die vierte Nachkommastelle;7 an der nächsten Stelle bedeutet7 von10 kleineren Teilen, also mehr als die Hälfte. Die vorangehenden Nullen halten Zehntel und Hundertstel frei.','0.0049. Target digit8 occupies the fourth decimal place;7 in the next place means7 of10 smaller parts, more than half. The earlier zeros preserve empty tenths and hundredths.','Unmarkierte Stellenzuordnung und echte Größenbedeutung bei kleinen Zahlen.','Uncued place identification and actual magnitude meaning for small values.'),
example('exact-tie-carry','Runde19,995 auf Hundertstel, begründe den genauen Halbfall und erkläre den Übertrag bis in den ganzzahligen Teil. '+rule_de,'Round19.995 to hundredths, justify the exact halfway case, and explain carrying into the integer part. '+rule_en,
    '20,00. Der Rest ist genau5 Tausendstel, die Hälfte eines Hundertstels. Die angegebene Schulregel erhöht19,99 um ein Hundertstel; zehn Hundertstel bündeln zu einem Zehntel, zehn Zehntel zu einem Einer.20 und20,00 haben denselben Wert; die ausgeschriebene Zielstelle behauptet keine Messgenauigkeit.','20.00. The remainder is exactly5 thousandths, half of one hundredth. The stated school rule increases19.99 by one hundredth; ten hundredths regroup as a tenth and ten tenths as one.20 and20.00 have the same value; showing the requested place does not assert measurement precision.','Echte Halbfallwahl und Bündelung ohne bereitgestellte Ergebnisnachbarn.','An actual tie choice and regrouping without supplied result neighbors.'),
example('fresh-truncation-contrast','Runde0,007649 auf Tausendstel und vergleiche anschließend mit dem Abschneiden an derselben Stelle. '+rule_de,'Round0.007649 to thousandths and then compare with truncation at the same place. '+rule_en,
    'Runden0,008; Abschneiden0,007. Die erste entfernte6 steht für mindestens6 Zehntausendstel, also mehr als eine halbe Tausendsteleinheit. Runden wählt den näheren Rasterwert und verändert die7; Abschneiden entfernt nur den Rest.','Rounding0.008; truncation0.007. The first discarded6 represents at least6 ten-thousandths, more than half one thousandth. Rounding chooses the nearer grid value and changes7; truncation merely removes the tail.','Unabhängiger Kontrast zweier Verfahren mit gleichem Ausgangswert und gleicher Zielstelle.','An independent contrast of two procedures for the same input and place.'),
example('lower-neighbor-despite-later-large-digit','Runde8,7426 auf Hundertstel und erkläre, warum die spätere6 kein Aufrunden verursacht. '+rule_de,'Round8.7426 to hundredths and explain why the later6 does not cause rounding up. '+rule_en,
    '8,74. Die erste entfernte2 bedeutet zwei Tausendstel und der weitere Rest weniger als ein weiteres Tausendstel. Der Gesamtrest liegt deshalb unter drei der zehn Tausendstelteile und sicher unter der Hälfte eines Hundertstels. Abschneiden hat hier zufällig denselben Wert.','8.74. The first discarded2 means two thousandths and the remaining tail less than one further thousandth. The whole tail is therefore below three of the ten thousandth parts and below half one hundredth. Truncation happens to give the same value here.','Geänderte Entscheidung nach unten trotz einer größeren weiter hinten stehenden Ziffer; keine Immer-aufrunden-Strategie.','A changed downward decision despite a later larger digit; this rules out an always-round-up strategy.'),
example('positive-input-zero-output','Runde0,00024 auf Tausendstel und erkläre, ob0,000 ein zulässiger Näherungswert ist. '+rule_de,'Round0.00024 to thousandths and explain whether0.000 is a valid approximation. '+rule_en,
    '0,000. Die Zielziffer ist0; die erste entfernte2 plus weiterer Rest liegt unter drei Zehntausendsteln und damit unter der halben Tausendsteleinheit. Null ist der nähere Rasterwert und trotz positiven Ausgangswerts gültig.0,000 und0 sind derselbe Zahlenwert.','0.000. The target digit is0; the first discarded2 and remaining tail are below three ten-thousandths, hence below half one thousandth. Zero is the nearer grid value and valid despite a positive input.0.000 and0 are the same number.','Transfer mit anderem Nullmuster, Abrunden und Nullergebnis; angehängte Nullen bleiben Stellenangabe und keine zusätzliche Genauigkeitsbehauptung.','Transfer with a different zero pattern, downward rounding and a zero result; trailing zeros show the requested place without claiming additional precision.'),
]
positive=load(OLD/'positive-profile.body.author-candidate.json')
positive['applicationCaseBriefs']=cases
positive['expectations'][0].update(essentialUnderstandingDe='Eine Dezimalstelle bezeichnet Zehntel, Hundertstel und weitere jeweils zehnmal kleinere Einheiten. Nullen halten unbesetzte Stellen frei. Die Zielstelle setzt das Raster benachbarter Rundungswerte; der benachbarte rechte Stellenwert zerlegt einen solchen Schritt in zehn gleiche Teile.',essentialUnderstandingEn='Decimal places denote tenths, hundredths and further units each ten times smaller. Zeros preserve unoccupied places. The target place sets the grid of neighboring rounded values; the adjacent place on the right divides a step into ten equal parts.',observablePerformanceDe='Die lernende Person füllt eine höchstens beschriftete, sonst leere Tabelle für eine neue Zahl selbstständig, deutet Ziel- und Folgestelle und Nullen und erklärt den Zehn-zu-eins-Zusammenhang. Sie kann danach die Näherungsentscheidung ohne markierte Ziffern oder Antwortwerte begründen.',observablePerformanceEn='For a fresh number, the learner independently fills an optionally labelled but otherwise blank table, interprets the target and following place and zeros, and explains the ten-to-one relationship. The learner then justifies the approximation without highlighted digits or answer values.')
positive['expectations'][1].update(essentialUnderstandingDe='Die übliche Schulrundung wählt den nächstgelegenen Wert des vorgegebenen Stellenrasters. Ein Rest unter einer halben Einheit führt nach unten, ein größerer Rest nach oben; genau die Hälfte folgt der ausdrücklich angegebenen positiven Regel nach oben. Überträge sind Bündelungen von zehn kleineren Einheiten.',essentialUnderstandingEn='Conventional school rounding chooses the nearest value on the specified place grid. A remainder below half a unit rounds down and a larger remainder up; exactly half follows the explicitly stated positive ties-up rule. Carrying regroups ten smaller units.',observablePerformanceDe='Die lernende Person entscheidet in neuen Fällen selbstständig für den unteren oder oberen Wert, begründet die Grenze über Stellenwerte und führt nötige Überträge aus. Auch spätere große Ziffern bei kleiner erster entfernter Ziffer und ein Nullergebnis werden erklärt; eine eigene Dezimalsubtraktion ist nicht nötig.',observablePerformanceEn='In fresh cases, the learner independently chooses the lower or upper value, explains the boundary using place value, and carries when needed. Later large digits following a small first discarded digit and a zero result are explained; independent decimal subtraction is unnecessary.')
positive['expectations'][2]['observablePerformanceDe']='Die lernende Person berechnet in einem neuen Fall Rundungs- und Abschneidewert selbstständig und erklärt ihre Verschiedenheit; ein weiterer Abrundungsfall zeigt, warum gelegentliche Gleichheit die Verfahren nicht gleichsetzt.'
positive['expectations'][2]['observablePerformanceEn']='In a fresh case, the learner independently obtains the rounded and truncated values and explains their difference; a further downward case shows why occasional equality does not make the procedures identical.'
positive['variationAxes'].append({'id':'lower-neighbor-and-zero-output','textDe':'Ein größerer späterer Restziffernwert darf eine kleine erste entfernte Ziffer nicht überstimmen; ein positiver Eingang kann zu Null gerundet werden.','textEn':'A larger later digit must not override a small first discarded digit; a positive input can round to zero.'})
write('positive-profile.body.author-candidate.json',positive)
description=load(OLD/'description-profile.body.author-candidate.json')
description['facets'].insert(1, {'id':'intrinsic-decimal-place-meaning','criterionDe':'Dezimalstellen, Nullhalter und Zehn-zu-eins-Bündelung werden im Rundungsziel selbstständig gedeutet, ohne ganze Bruch-/Zahlengeraden-/Zahlensystem-Mastery anzunehmen.','criterionEn':'Interpret decimal places, zero placeholders and ten-to-one regrouping independently inside the rounding goal, without assuming whole fraction/number-line/numeral-system mastery.'})
description['coverageRequirements']['allOf'].insert(1,'intrinsic-decimal-place-meaning')
description['facets'][2].update(criterionDe='Bei vorgegebener Stelle wird nach der ausdrücklich angegebenen üblichen positiven Schulregel der nähere Rasterwert gewählt; Stellenwertbegründungen decken obere und untere Wahl, Halbfall, Übertrag und Nullergebnis ab.',criterionEn='At a given place, choose the nearer grid value under the explicitly stated conventional positive school rule; place-value explanations cover upward and downward choice, ties, carrying and a zero result.')
description['variationAxes']=positive['variationAxes']
description['contrastCaseBriefs'].append({'id':'lower-versus-always-up','purposeDe':'8,7426 und0,00024 trennen stellengerechte Rundung von Immer-aufrunden und von einer Regel ohne Nullergebnisse.','purposeEn':'8.7426 and0.00024 separate place-value rounding from always rounding up and from a rule excluding zero results.','strengthDe':'Die Lernenden begründen selbstständig die untere Nachbarwahl bei späterer großer Ziffer sowie bei positivem Eingang und Nullausgang.','strengthEn':'Learners independently justify the lower-neighbor choice with a later large digit and with a positive input yielding zero.','whyAlternativesUnderperformDe':'Nur Beispiele mit oberer Nachbarwahl prüfen diese Fehlstrategien nicht.','whyAlternativesUnderperformEn':'Examples only selecting the upper neighbor do not test these mistaken strategies.'})
write('description-profile.body.author-candidate.json',description)
write('assessment-probes.author-candidate.json',{'schemaVersion':3,'status':'author_probe_designs_not_empirical_learner_evidence_or_exam_release','goalId':GOAL,'cases':cases,'grading':{'allRequiredUnderstanding':['decimal place meaning and zeros','nearest school choice in both directions','exact tie and carry','rounding/truncation difference','lower-neighbor and zero transfer'], 'allowedScaffold':'Only optional blank place labels; no selected digit/neighbor/answer.', 'masteryRule':'Evidence covers every aspect with fresh substantive transfer; two required native evidence demonstrations may occur within one integrated task and are not an extra-task quota. Once sufficient, no additional assessment is demanded.','broaderGoalMasteryNotImplied':True},'examRouteImpact':'No existing task, solution, score or goal coverage is modified.'})
write('intrinsic-preparation-and-teaching.author-candidate.json',{'schemaVersion':3,'status':STATUS,'goalId':GOAL,
    'steps':[
        {'de':'Erkläre in einer leeren beschrifteten Tafel Einer, Zehntel, Hundertstel und Tausendstel als jeweils zehn kleinere Teile. Lass eine Null als leere Stelle und eine Ziffer als Zahl dieser Einheiten erklären.','en':'Explain ones, tenths, hundredths and thousandths in a blank labelled table as successive groups of ten smaller parts. Ask the learner to explain a zero as an empty place and a digit as a number of those units.'},
        {'de':'Lehrbeispiel2,483 auf Hundertstel:2,48 ist der untere Rasterwert; der Rest beginnt mit3 von10 kleineren Teilen und bleibt auch mit weiteren kleineren Teilen unter vier Teilen, also unter der Hälfte. Ergebnis2,48. Dies ist Hilfe, kein unabhängiger Nachweis.','en':'Teaching example2.483 to hundredths:2.48 is the lower grid value; the tail starts with3 of10 smaller parts and remains below four parts even with further smaller parts, hence below half. Result2.48. This is instruction, not independent evidence.'},
        {'de':'Erläutere die explizite positive Schulregel und Zehn-zu-eins-Überträge. Abschneiden entfernt nur den Rest; Runden wählt nach Nähe und kann den gehaltenen Teil verändern.','en':'Explain the explicit positive school rule and ten-to-one carries. Truncation merely removes the tail; rounding chooses by nearness and can change the retained part.'},
        {'de':'Entziehe ausgefüllte Tafeln, markierte Ziffern und Beispielantworten. Prüfe frische Fälle mit gegebenem Platz und positiver Halbfallregel; die leeren Spaltenbeschriftungen dürfen bleiben.','en':'Withdraw completed tables, highlighted digits and worked answers. Check fresh cases with a supplied place and positive tie rule; blank column labels may remain.'}],
    'counterfactualReviewCase':{'orientationMarker':1,'broader2fNaturalAndOtherSystemMastery':0,'allowedClaim':'If independently judged sufficient, this evidence can establish only the proposed rounding competence. It does not establish those broader goals.','empiricalLearnerEvidenceClaim':False},
    'signedExtension':'No negative input is part of required probes or all16 source coverage. A separate future signed transfer would need its own method/source/scope/native review.'})

# Read actual source pages anew; retain original extraction locators separately.
old_read=load(OLD/'independent-actual-read-receipt-v1.json')
exe=ROOT/'tmp/ci-tools/poppler-root/usr/bin/pdftotext'
env={**os.environ,'LD_LIBRARY_PATH':str(ROOT/'tmp/ci-tools/poppler-root/usr/lib/x86_64-linux-gnu')}
source_rows=[]
for r in old_read['actualSourceReads']:
    state=r['jurisdiction']; prior=load(OLD/f'source-context-v2/{state}.context.json'); ref=copy.deepcopy(prior['sourceReference'])
    pages=[]
    for anchor in r['actualRelevantPageReads']:
        p=anchor['physicalPdfPageOneBased']
        result=subprocess.run([str(exe),'-f',str(p),'-l',str(p),'-layout',r['sourcePdfBinding']['path'],'-'],cwd=ROOT,env=env,capture_output=True,check=True)
        pages.append({'physicalPdfPageOneBased':p,'actualLayoutTextSha256':sha(result.stdout),'fullRelevantPageReadByAuthor':True})
    printed={'DE-BB':40,'DE-BE':40,'DE-BW':18,'DE-BY':1,'DE-HB':14,'DE-HE':26,'DE-HH':50,'DE-MV':16,'DE-NI':41,'DE-NW':24,'DE-RP':29,'DE-SH':28,'DE-SL':41,'DE-SN':8,'DE-ST':28,'DE-TH':13}[state]
    physical=r['actualRelevantPageReads'][-1]['physicalPdfPageOneBased']
    ref['sourcePage']=printed
    ref['sourceSpan']=f"Actual bound PDF page{physical}, printed page{printed}; {r['printedLocatorObservation']}; decimal-rounding portion only."
    if state in ('DE-NI','DE-RP'):ref['sourceRef']=ref['sourceDocument']['title']+f', printed S.{printed} (PDF page{physical})'
    if state in ('DE-BB','DE-BE'):
        placement='Early D decimal-rounding row, distinct from later E rational/signed row. Exact Gymnasium grade/year placement remains pending; no universalJ6 from D metadata.'
        extra='Use printed/PDF40 D decimal row as supplementary actual PDF anchor; broad extracted D–H rational summary remains only partial. No native extraction is rewritten.'
    elif state=='DE-HH':
        placement='Positive-decimal module7, classes5/6; exact authored view/year placement pending.'
        extra='Actual PDF50 standalone rounding bullet under number representation; following addition/subtraction section is separate. OCR-interleaved source row stays unchanged and cannot certify arithmetic prerequisite or exact whole-row coverage.'
    else:placement=r['sourceSupportRationale'];extra=r['cautionsAndNeededRepairs']
    ctx={'schemaVersion':3,'status':'author_actual_source_context_partial_mapping_and_placement_pending','jurisdiction':state,
        'retainedV2Context':bind(OLD/f'source-context-v2/{state}.context.json'),'sourcePdfBinding':bind(ROOT/r['sourcePdfBinding']['path']),
        'sourceExtractionBinding':bind(ROOT/r['sourceExtractionBinding']['path']),'sourceRowId':r['sourceGoalId'],
        'exactSourceRowSha256':r['sourceRowSha256'],'exactSourcePassageSha256':r['sourcePassageSha256'],
        'retainedExtractionReportedLocator':{'sourceRef':prior['sourceReference']['sourceRef'],'sourceSpan':prior['sourceReference']['sourceSpan'],'sourcePage':prior['sourceReference'].get('sourcePage')},
        'sourceReference':ref,'actualPageReads':pages,'correctedAuthorLocator':{'printedPage':printed,'physicalPdfPageOneBased':physical},
        'authorPartialCoreInterpretation':r['sourceSupportRationale'],'scopeAndPlacementCaution':placement,'neededNativeMappingRepairsOrCautions':extra,
        'sourceRoleUnchanged':ref['sourceDocument']['role'],'sourceEdgeQuoteClaimed':False,'all16ExactPlacementApproved':False,'signedPeriodicOrWholeSourceCoverageClaimed':False,
        'method':'This author read all full relevant actual PDF pages via retained portable pdftotext-layout and inspected full retained extracted rows/passages; hashes bind local source bytes. Context is author preparation, not independent source review or legal approval.'}
    ctx_binding=write(f'source-context-v3/{state}.context.json',ctx)
    source_rows.append({'jurisdiction':state,'sourceGoalId':r['sourceGoalId'],'contextBinding':ctx_binding,'sourceDocument':ref['sourceDocument'],
        'correctedAuthorLocator':ctx['correctedAuthorLocator'],'sourceRoleUnchanged':ctx['sourceRoleUnchanged'],
        'proposedMapping':{'sourceGoalId':r['sourceGoalId'],'canonicalGoalId':GOAL,'matchType':'partial'},
        'sourceScopeCaution':placement,'sourceRepairCaution':extra,'status':'author_partial_source_mapping_and_exact_placement_pending_independent_review'})
write('source-mappings-and-placement.author-candidate.json',{'schemaVersion':3,'status':STATUS,'goalId':GOAL,'sourceRefs':source_rows,
    'sourceCoreClaim':'Nonnegative terminating decimal school-rounding operation is a proposed partial common core, not full coverage of contextual precision, fractions, rational signs or periodic representations.',
    'placementBoundary':'Source support is not current target placement. Existing view/parent inheritance is measured in a fresh in-memory route simulation; no actual view is altered or all16 preparation route approved.'})
write('source-actual-read.author-receipt.json',{'schemaVersion':3,'status':'author_actual_read_not_independent_approval','author':AUTHOR,'readAt':NOW,
    'statesRead':16,'physicalPagesRead':sum(len(r['actualRelevantPageReads']) for r in old_read['actualSourceReads']), 'sourceContexts':[r['contextBinding'] for r in source_rows],
    'actualExistingMathFullP':['natural rounding entire current profile incl interval/context choice','2f entire current profile incl fractions/reduction and scaled line'],
    'sourceTextExtractionTool':bind(exe),'nativeGateApprovalClaim':False,'humanOrEmpiricalApprovalClaim':False})

atomicity=load(OLD/'atomicity-memory-kind.author-candidate.json')
atomicity.update(schemaVersion=3,status='author_kind_atomicity_memory_proposals_pending_independent_native_records',goalAuthorArtifact=goal_artifact)
atomicity['atomicity']={'authorClaim':'One assessable operation: given-place nonnegative decimal school-rounding with its necessary place-value justification. Intrinsic place meaning supports this operation and does not certify whole bundled representation goals.','independentNativeAtomicityPending':True}
atomicity['memory']={'authorProposal':'no_memory_needed','reason':'Applied place-value understanding and decision under an explicitly given rule, not rote recall of a rule or a new memorization deck.','independentNativeMemoryDecisionPending':True,'newCardsOrDecks':0}
atomicity['visualization']={'status':'pending_no_asset_no_image_review','resourceLinks':[],'reuseOfOldAssetsClaimed':False}
write('atomicity-memory-kind.author-candidate.json',atomicity)
impact=load(OLD/'quality-route-assessment-impact.author-plan.json')
impact.update(schemaVersion=3,status='inert_v3_author_plan_all_activation_gates_pending')
impact['descriptionD']['required']='Actual independent native A/B reads and synthesis/resolution against exact v3 final inputs, source contexts, intrinsic foundation, six cases and future actual visualization. The v1 profile is author input only.'
impact['positiveP']['required']='Independent complete bilingual P and six-case review, including genuinely fresh lower/zero/carry transfer and narrow intrinsic decimal meaning; no whole2f/natural rounding mastery, signed transfer or visual/native gate acceptance inferred.'
impact['route']['required']='Fresh current view/input simulation and independent explicit Math target placement per actual16 source year/level. BW lacks inherited candidate target and still needs authored reviewed placement, but2f need not be silently promoted. No Physics edge or support choice is authorized by this candidate.'
impact['assessmentDecision']='Existing natural-round exam/task/solution/scoring/requires and existing Math/Physics goals remain unchanged. Six proposed probes are author designs, not empirical learner mastery or an active released assessment.'
impact['historyAndLicensing']=old_goal['licensing']
write('quality-route-assessment-impact.author-plan.json',impact)
for old_name in ['bind-native-candidates.ts','route-impact.ts']:
    text=(OLD/old_name).read_text().replace('decimal-rounding-v2-20261013','decimal-rounding-v3-20261013').replace('20261013-v2','20261013-v3')
    if old_name.startswith('bind'):
        text=text.replace('Whole decimal-representation prerequisite is broader than the digit-only method; independent whole-goal/prerequisite/route acceptance is pending. Image V, native dual-D and independent content review are pending.', 'V3 intrinsically teaches and assesses narrow decimal place meaning; source/placement/granularity and independent native content approval remain pending. No whole2f or natural-rounding mastery is assumed. ImageV and dualD are pending.')
        text=text.replace('four positive cases','six independent case designs').replace('given-distance scope','blank-table assistance boundary').replace('small zeros, exact-tie carry, and a fresh truncation contrast','intrinsic place meaning, small zeros, lower-neighbor and zero-result transfer, exact-tie carry, and a fresh truncation contrast')
    else:
        text=text.replace("dependents.filter(id => beforeRoles.targetGoalIds.has(id))", "dependents.filter(id => beforeRoles.targetGoalIds.has(id) || beforeRoles.prerequisiteOnlyGoalIds.has(id))")
        text=text.replace('relevantPhysicsTargetIds: relevantDependents,','relevantAuthoredPhysicsTargetOrSupportIds: relevantDependents,')
        text=text.replace('Resolve BW missing REP target route and any rejected broader AND assumption.','BW still needs explicit candidate target placement; no2f prerequisite or Math target promotion is assumed.')
    with (BASE/old_name).open('x') as f:f.write(text)
print(json.dumps({'status':'wrote inert v3 author inputs; binding/simulation/sealing next','base':str(BASE.relative_to(ROOT)), 'activeInputFilesRead':len(baseline),'historicalViewDrift':sum(r['path'].endswith('.view.json') for r in historical_drift),'statesRead':16,'caseDesigns':6}))
