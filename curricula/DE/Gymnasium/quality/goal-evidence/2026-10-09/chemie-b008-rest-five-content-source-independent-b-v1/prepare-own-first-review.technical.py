"""Own inactive B evidence only; manually authored science reasons below.

This script verifies exact original bodies and numerical illustrations. It does
not produce normal source, P, native, V, human, or M7 approval records.
"""
import datetime
import hashlib
import json
import math
import re
import subprocess
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
AUTHOR = BASE / 'chemie-b008-rest-five-content-source-author-a-v1'
OWN = BASE / 'chemie-b008-rest-five-content-source-independent-b-v1'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()


def read(path):
    return json.loads(path.read_text())


def bind(path):
    raw = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def write(name, value):
    with (OWN / name).open('x') as f:
        f.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return bind(OWN / name)


def at(value, pointer):
    for part in pointer.strip('/').split('/'):
        value = value[int(part)] if isinstance(value, list) else value[part]
    return value


entry = AUTHOR / 'neutral-five-remaining-whole-content-source-and-honest-transfer.author-review.entry.json'
input_first = OWN / 'five-remaining-content-source.independent-b.input-first.freeze.json'
frame_path = AUTHOR / 'selected-ten-whole-source-duty-and-original-partner-frame.author-neutral.json'
body_path = AUTHOR / 'five-whole-content-source-candidates.with-ten-original-clauses-and29-partners.author-input.json'
sketch_path = AUTHOR / 'five-bilingual-source-mechanism.author-synthetic-witness-sketches.json'
edge_path = AUTHOR / 'five-proposed-additive-partial-source-edges.author-candidate.json'
frame, body, sketches, edges = map(read, [frame_path, body_path, sketch_path, edge_path])
errors = []
checks = []


def check(label, condition, actual=None):
    item = {'check': label, 'passed': bool(condition)}
    if actual is not None:
        item['actual'] = actual
    checks.append(item)
    if not condition:
        errors.append(item)


all_original_bindings = frame['actualInputs']
for b in read(input_first)['actualDeclaredInputBindings'] + all_original_bindings:
    actual = bind(ROOT / b['path'])
    check('actual byte binding: ' + b['path'], actual['sha256'] == b['sha256'] and actual['bytes'] == b['bytes'], actual)

originals = {b['path']: read(ROOT / b['path']) for b in all_original_bindings if b['path'].endswith('.json')}
canon_binding = all_original_bindings[0]
canon = originals[canon_binding['path']]
goals = {g['id']: g for g in canon['goals']}

for i, row in enumerate(frame['rows']):
    extraction = originals[row['sourceExtraction']['path']]
    mapping = originals[row['mapping']['path']]
    check(f'whole original source goal row{i}', at(extraction, row['sourceGoalPointer']) == row['wholeOriginalSourceGoal'])
    check(f'whole original passage row{i}', at(extraction, row['passagePointer']) == row['wholeOriginalPassage'])
    check(f'whole original decision row{i}', at(mapping, row['decisionPointer']) == row['wholeOriginalDecision'])
    for edge in row['allOriginalMappingEdges']:
        check('original whole edge row' + str(i) + edge['pointer'], at(mapping, edge['pointer']) == edge['value'])
    for partner in row['wholeAllOriginalPartnersAndDescendants']:
        check('whole original partner row' + str(i) + partner['canonicalPointer'], at(canon, partner['canonicalPointer']) == partner['wholeGoal'])

for i, partner in enumerate(frame['uniqueWholePartners']):
    check(f'whole unique partner{i}', at(canon, partner['canonicalPointer']) == partner['wholeGoal'])
for i, item in enumerate(body['items']):
    check(f'whole current target{i}', goals[item['goalId']] == item['wholeCurrentTarget'])
for i, g in enumerate(frame['wholeCurrentFivePrerequisiteGoals']):
    # The frame wraps prerequisite goal bodies as canonicalPointer/wholeGoal.
    check(f'whole prerequisite{i}', at(canon, g['canonicalPointer']) == g['wholeGoal'])

primary_text_checks = []
for prefix, pdf in [('HE', ROOT / all_original_bindings[3]['path']), ('RP', ROOT / all_original_bindings[6]['path'])]:
    for text in sorted((AUTHOR / 'primary').glob(prefix + '*.actual.txt')):
        page = int(re.search(r'physical-(\d+)', text.name).group(1))
        command = ['pdftotext', '-layout', '-f', str(page), '-l', str(page), str(pdf), '-']
        result = subprocess.run(command, capture_output=True)
        same = result.returncode == 0 and result.stdout == text.read_bytes()
        check('actual whole primary physical page: ' + text.name, same)
        primary_text_checks.append({'pdf': bind(pdf), 'physicalPage': page, 'text': bind(text), 'command': command, 'exitCode': result.returncode, 'byteExact': same})

R, F, T = 8.314462618, 96485.33212, 298.15
decadic = math.log(10) * R * T / F
expected = [
    {'reversibleGalvanicVoltage_V': 1.103 - (R * T / (2 * F)) * math.log(0.01),
     'opposingAppliedThresholdWithGivenLosses_V': 1.103 - (R * T / (2 * F)) * math.log(0.01) + 0.10 + 0.05 + 0.02},
    {'initial_pH': 6.35 + math.log10(0.020 / (0.034 * 0.020)),
     'doubledCO2_pH': 6.35 + math.log10(0.020 / (0.034 * 0.040)),
     'delta_pH': -math.log10(2)},
    {},
    {'dimensionless_K2': 0.5 * math.exp(-20000 / R * (1 / 318.15 - 1 / 298.15))},
    {'slope_V_per_pH': -decadic, 'Eh_at_pH6_V': 0.600 - 6 * decadic,
     'pE_at_pH6': (0.600 - 6 * decadic) / decadic},
]
numeric = []
for i, values in enumerate(expected):
    for field, value in values.items():
        authored = sketches['rows'][i]['workedResult'][field]
        delta = abs(value - authored)
        check('independent numeric ' + str(i) + '/' + field, delta < 2e-8)
        numeric.append({'goalId': sketches['rows'][i]['goalId'], 'field': field, 'independentlyCalculated': value, 'authored': authored, 'absoluteDifference': delta, 'tolerance': 2e-8})
check('Grignard product and carbon balance', sketches['rows'][2]['workedResult']['carbonylAdditionProductAfterWorkup'] == '2-methylpropan-2-ol')
check('five actual goal IDs and five witness IDs coincide', [r['goalId'] for r in body['items']] == [r['goalId'] for r in sketches['rows']])
check('ten original duties', len(frame['rows']) == 10)
check('twenty-one original mapping edges retained', sum(len(r['allOriginalMappingEdges']) for r in frame['rows']) == 21)
check('twenty-nine unique whole partners', len(frame['uniqueWholePartners']) == 29)
check('five additive edges across four goals, no Grignard edge', len(edges['edges']) == 5 and not any(x['goalId'] == '8edee6b6-9ead-515e-93f5-feada64522b2' for x in edges['edges']))

technical = write('actual-five-source-ten-duty21-edge29-partner-and-numeric.independent-b.receipt.json', {
    'schemaVersion': 1, 'createdAt': NOW, 'role': 'read_only_original_integrity_and_independent_numeric_probe',
    'inputFirst': bind(input_first), 'originalPrimaryAndCanonicalBindings': all_original_bindings,
    'checks': checks, 'errors': errors, 'primaryPhysicalPageReproduction': primary_text_checks,
    'independentNumericResults': numeric,
    'numericalPrecisionNote': 'Displayed 2.303 is the rounded value of ln(10). Author decimals use ln(10); literal 2.303 would change Eh(pH6) by approximately 8 microvolts, below the precision of E°=0.600 V. No experimental precision claim is supported.',
    'scienceJudgmentFromHashOnly': False, 'activeWrites': False, 'humanApproval': False, 'strictGain': 0,
})

# Independent manually reasoned source semantics. No author or peer verdict is
# consulted or converted into these decisions.
results = [
    {
        'goalId': '0c9fe376-0fbd-5dc1-b8d4-d56d658a00e3', 'title': 'Elektrolyse und Gleichgewicht',
        'boundedCandidateDecision': 'KEEP_bounded_partial_reference_mechanism',
        'wholeGoalDeEnFidelity': 'Both descriptions require relating electrolysis to redox equilibria. The reversible reference/current-flow distinction is the necessary scientific interpretation; forced current is not equilibrium.',
        'scientificReasonDe': 'Nernst liefert für die angegebene Zn/Cu-Reaktion 1.16215935 V als reversible Referenz. Eine entgegengesetzte äußere Spannung kann die Reaktionsrichtung erzwingen; die angegebenen Verluste ergeben im synthetischen Modell 1.33215935 V. Eine reale Betriebs- oder Einschaltspannung ist damit nicht gemessen: Überspannung und iR hängen vom Strom und Gerät ab, konkurrierende Elektrodenreaktionen sind nicht untersucht.',
        'sourceRows': [0, 1, 2], 'supportedProposedEdgeRows': [2],
        'actualPrimary': [{'jurisdiction': 'HE', 'physicalPage': 47, 'printedPage': 47, 'course': 'LK Q3.3'}],
        'sourceDutyBoundaryDe': 'HE47 nennt Nernst/Konzentrationszelle ausdrücklich ohne pH- und Temperaturabhängigkeit und nennt Überspannung/Zersetzungsspannung. Der neue Vergleich ist ein begrenzter Erkläranteil der Spannungsgrenzen. CuCl2-Elektrolyse, vollständige Nernst-Anwendung und Ionenentladung bleiben eigene Partnerpflichten; Q3-Erlassselektion nach HE46 ist weiterhin gesondert zu binden.',
        'wholePartnerDutyIdsRetained': ['fd7977bf-1d8e-5c5e-9c37-bd76bb2ffeef', 'b7521ac7-4ad1-5e63-96ca-4c6c9b2b1e0b', '3eada74b-25b8-55dc-811a-acb473196f53'],
        'witnessDecision': 'KEEP_synthetic_reference_calculation_only',
        'wholeClaim': 'HOLD_current_scope_and_normal_P_native_source_evidence',
        'remedyDe': 'Für einen späteren ganzen P-Nachweis konkrete Aufgabe, eigene Antwort/Rubrik und Transfer bereitstellen; die Verlustspannung als vorgegebenen Betriebspunkt und die reversible Grenze getrennt benennen. Aktuelle HE-Erlass-/Kursbindung und alle übrigen Anwendbarkeitsländer gesondert belegen.',
    },
    {
        'goalId': '1a51362e-fd84-5964-89b5-b435772c2149', 'title': 'Mehrfachgleichgewichte',
        'boundedCandidateDecision': 'KEEP_conditional_open_buffer_partial_roles',
        'wholeGoalDeEnFidelity': 'The DE/EN qualitative/quantitative coupled-equilibrium operators are both addressed in the explicitly clamped open model. This example does not solve arbitrary closed coupled systems.',
        'scientificReasonDe': 'Henry-Verteilung und Protolyse verwenden dieselbe CO2*-Konzentration. Bei ausdrücklich extern festgehaltenem Hydrogencarbonat ergeben sich pH 7.81852108 und 7.51749109; die Änderung ist -log10(2). Die Festhaltung ist eine Randbedingung und ersetzt keine geschlossene Stoff-/Ladungsbilanz. Das ist weder Blutmessung noch klinische Prognose.',
        'sourceRows': [3, 4], 'supportedProposedEdgeRows': [3, 4],
        'actualPrimary': [{'jurisdiction': 'HE', 'physicalPage': 48, 'printedPage': 48, 'course': 'LK Q3.4 conditional selected topic'}],
        'sourceDutyBoundaryDe': 'HE48 nennt beide offenen Beispiele: Kohlensäure-Hydrogencarbonat im Blut und Ammoniumpuffer, sowie Henderson-Hasselbalch-Rechnung. Allgemeine Mehrfachgleichgewichte sind eigene Vertiefung. HE46 macht Q3.4 nicht zu einem der durch Erlass ausgewählten verbindlichen Themenfelder1–3. Die synthetische Carbonat-Rechnung erfüllt nicht allein das Ammonium-Beispiel oder alle Pufferpartner.',
        'wholePartnerDutyIdsRetained': ['5a58126e-0c51-5808-be9e-8faa9dae0c32', 'd7461c15-6992-5342-b899-6c490ee0cbb7', 'a449e874-6fec-502b-9667-6f078adc4d64'],
        'witnessDecision': 'KEEP_one_explicitly_open_idealized_coupled_calculation',
        'wholeClaim': 'HOLD_whole_coupled_system_evidence_and_conditional_Q3_4_placement',
        'remedyDe': 'Eine echte ausgewählte Q3.4-Kurs-/Platzierungsentscheidung binden. Für ganze P-Fälle neue gemeinsame Stoffarten und Randbedingungen selbst analysieren lassen; wenn geschlossene Systeme beansprucht werden, tatsächliche Stoff- und Ladungsbilanzen liefern. Beide ursprünglichen Pufferbeispiele unverändert halten.',
    },
    {
        'goalId': '8edee6b6-9ead-515e-93f5-feada64522b2', 'title': 'Grignard-Synthesen deuten',
        'boundedCandidateDecision': 'KEEP_authored_carbonyl_addition_extension_context_only',
        'wholeGoalDeEnFidelity': 'Both versions require using Grignard reagents and formulating reaction steps. Formal reagent selection/reaction interpretation is illustrated; physical use or synthesis execution is not evidenced.',
        'scientificReasonDe': 'CH3MgBr addiert formal den Methylrest am elektrophilen Carbonyl-C von Aceton; nach dem magnesiumassoziierten Alkoxid und getrennter Protonierung entsteht 2-Methylpropan-2-ol. Die polarisierten Bindungen und Verschiebung der C=O-π-Elektronen erklären die C-C-Bildung. Wasserverbrauch zu Methan ist stöchiometrisch als Schema korrekt. Ein isoliertes freies Carbanion wird nicht behauptet.',
        'sourceRows': [5], 'supportedProposedEdgeRows': [],
        'actualPrimary': [{'jurisdiction': 'RP', 'physicalPage': 39, 'printedPage': 39, 'course': 'carbonyl chapter context'}, {'jurisdiction': 'RP', 'physicalPage': 40, 'printedPage': 40, 'course': 'optional full-width Vertiefungs-/Verzahnung box'}],
        'sourceDutyBoundaryDe': 'RP39 trägt nucleophiles Carbonylverhalten als allgemeinen Kontext. RP40 nennt im grauen optionalen Vollbreitenfeld Aldole, Imine, Oxime und Hydrazone. Grignard ist in den tatsächlich gebundenen vollständigen HE-/RP-PDFs nicht benannt und erfüllt keine dieser spezifischen Bildungsrollen allein. Es gibt richtigerweise keine neue Grignard-Deckungskante.',
        'wholePartnerDutyIdsRetained': ['9aec52cb-1f7d-5343-b5f9-a8e72ddd25fa', 'a4bac92b-d685-5cb6-94c8-c9b8b878d125', 'c2d3f72b-e28a-5cae-b52a-7ffaa39d17c2', 'e5941581-0aba-5354-b4b9-d0249d4538a8'],
        'witnessDecision': 'KEEP_one_formal_authored_reaction_scheme_no_real_experiment',
        'wholeClaim': 'HOLD_named_curriculum_Grignard_coverage_and_actual_optional_placement',
        'remedyDe': 'Entweder tatsächliche amtliche Named-Grignard-Klausel mit Stufe/Kurs/Seite unabhängig belegen oder ausdrücklich als eigene optionale Erweiterung platzieren. RP fehlt im aktuellen BY/HE-Ziel; allein der Kontext erweitert Anwendbarkeit nicht. Die ganze konkrete Aldol-/Imin-/Oxim-/Hydrazonrolle bleibt gesondert zu lösen, ebenso spätere normale P-/Native-Nachweise.',
    },
    {
        'goalId': 'e0d4f08a-3e67-5e2b-9c4a-06468ec5c3dd', 'title': 'vanʼt Hoff Gleichung nutzen',
        'boundedCandidateDecision': 'KEEP_authored_quantitative_temperature_transfer_partial',
        'wholeGoalDeEnFidelity': 'Both versions require calculating temperature dependence of equilibrium. The integrated thermodynamic expression fulfils the calculation mechanism under the supplied constant-enthalpy approximation, not a kinetic rate calculation.',
        'scientificReasonDe': 'ln(K2/K1)=-(ΔrH°/R)(1/T2-1/T1) ergibt K2=0.830297883 aus K1=0.5, 298.15→318.15 K und ΔrH°=+20 kJ/mol. Für die endotherme Reaktion steigt K wie nach Le Chatelier erwartet. Thermodynamisches K° ist dimensionslos; Näherung gilt nur ohne relevante ΔCp-Korrektur/Phasenwechsel. Die Skizze nennt keine konkrete ausgeglichene Reaktion; sie bleibt ein abstrakter Parameterfall.',
        'sourceRows': [7, 8], 'supportedProposedEdgeRows': [8],
        'actualPrimary': [{'jurisdiction': 'RP', 'physicalPage': 45, 'printedPage': 45, 'course': 'P LK Additum Gibbs/standard free energy'}, {'jurisdiction': 'RP', 'physicalPage': 46, 'printedPage': 46, 'course': 'optional full-width free-energy/equilibrium relationship'}],
        'sourceDutyBoundaryDe': 'RP45 enthält die Gibbs-Helmholtz-/Standard-Gibbs-Grundlagen im Pflicht-LK-Additum. Der ΔG°/K-Zusammenhang steht erst auf RP46 im optionalen Vollbreitenfeld. Die integrierte vanʼt-Hoff-Rechnung ist eigene Ableitung/Vertiefung und keine wörtlich genannte Pflicht. Alte qualitative Energie-/MWG-Partner werden erhalten, tragen die spezifische ΔG°/K-Beziehung aber nicht bereits vollständig.',
        'wholePartnerDutyIdsRetained': ['0a5a49f2-8e8a-5edb-b6ca-3f8636957a17', '801790f9-be3a-51fe-9b0f-3452c1bba887', 'f7a335a7-265e-5d22-b2ba-08ee9a0326c6', '1286f2fe-89b7-4454-8e11-85b6abd6e278', '20f92ba0-f7f4-5407-bb96-07e30da9002f', '3e433dae-99f9-5a95-ad63-d5fa0b5f6836', '5a24dae0-6d33-5227-8d8b-e8f74c2ccc4c', '81373fb7-2a4a-5b2c-acd0-b4e775acaa65', 'a530ee7d-1002-5f02-ae05-a9d46410ac78'],
        'witnessDecision': 'KEEP_abstract_dimensionless_K_standard_state_calculation',
        'wholeClaim': 'HOLD_actual_reaction_standard_state_P_witness_and_optional_RP_placement',
        'remedyDe': 'Bei materialisierter Aufgabe die konkrete ausgeglichene Reaktion und die Standardzustände angeben; eigene Zahlenarbeit/Transfer und Modellgrenzen verlangen. RP46 als optionale Vertiefung an tatsächlichen Kurs binden; aktuelle BY/HE-Anwendbarkeit nicht allein durch RP-Verweis erweitern. Ganze ΔG°/K-Quellenrolle gesondert nachweisen.',
    },
    {
        'goalId': 'f0f2c5f8-06f1-5774-a176-d96505727acf', 'title': 'pE/pH- und Pourbaix-Diagramme',
        'boundedCandidateDecision': 'KEEP_one_pH_Nernst_redox_boundary_partial_mechanism',
        'wholeGoalDeEnFidelity': 'Both versions require diagram interpretation and deriving stability regions. The provided line supports one redox boundary and its two thermodynamic sides; it does not yet supply an actual full diagram with competing phases/nonredox boundaries.',
        'scientificReasonDe': 'Ox+H++e−⇌Red mit aOx/aRed=1 ergibt Eh=0.600 V−(ln10 RT/F)pH, Steigung -0.05915935 V/pH und Eh(pH6)=0.24504390 V gegen SHE. Im genannten pE-Bezug ist pE=4.14209932. Oberhalb liegt die oxidierte Seite, unterhalb die reduzierte. pE ist kein direkt gemessener Gehalt freier Elektronen in Wasser. Kinetik, Passivierung und zusätzliche Phasen folgen aus dieser einen Grenze nicht.',
        'sourceRows': [6, 9], 'supportedProposedEdgeRows': [6],
        'actualPrimary': [{'jurisdiction': 'RP', 'physicalPage': 41, 'printedPage': 41, 'course': 'P LK Additum, Nernst inclusive pH at standard temperature'}, {'jurisdiction': 'RP', 'physicalPage': 44, 'printedPage': 44, 'course': 'optional full-width pH and temperature dependence, W chapter4.6'}],
        'sourceDutyBoundaryDe': 'RP41 nennt pH-abhängige Nernst-Anwendung bei Standardtemperatur verbindlich im LK-Additum. RP44 nennt pH und Temperatur erst als optionale Vertiefung des W-Bausteins4.6. HE47 schließt diese Abhängigkeiten im betreffenden Nernst-Bullet aus. Weder Pourbaix noch pE/pH-Diagramme sind als Namen in diesen vollständigen PDF-Texten belegt. Die Darstellungsform ist eigene Anwendung, die Nernst-Komponente eine begrenzte Teilrolle.',
        'wholePartnerDutyIdsRetained': ['266a2b2a-9ee2-52f6-ae09-59343da9a60b', '416dfd33-8b43-5c49-903c-9847b95e4208', '13d4f336-ab16-54a7-9479-c920b458f385'],
        'witnessDecision': 'KEEP_one_synthetic_redox_line_only',
        'wholeClaim': 'HOLD_full_stability_map_P_witness_actual_RP_scope_and_original_Nernst_duty',
        'remedyDe': 'Für ganzen Diagramm-/P-Nachweis eine tatsächliche endliche Karte mit Achsen/Bezug/Temperatur/Spezies/Aktivitäten und mindestens den beanspruchten weiteren Phasen-, Löslichkeits- oder Protolysegrenzen liefern; Stabilitätsbereiche daraus selbst ableiten lassen. Die originale SekI-Laborclusterkante trägt weder Nernst noch Temperaturabhängigkeit; neue präzise source-/Kursrolle erforderlich, ohne Laborkompetenzen zu löschen.',
    },
]

duty_limits = [
    ('HE basic CuCl2 electrolysis', 'fd7977 retains aqueous example, ion movement, electrode reactions, product ratios and forced/galvanic comparison; new Zn/Cu illustration is not substitution for CuCl2.'),
    ('HE LK Nernst/concentration cell', 'b7521 retains full nonstandard cell/concentration-cell calculation; HE excludes pH and temperature dependence here.'),
    ('HE LK overvoltage/decomposition voltage', '3eada retains actual ion-discharge order, predicted products and deviations; 0c9 adds reversible-reference explanation only.'),
    ('HE conditional Q3.4 open buffers', '5a581 retains both carbonate/bicarbonate and ammonium examples; the new synthetic carbonate model cannot waive ammonium.'),
    ('HE conditional Q3.4 quantitative buffers', 'd7461/a449 retain quantitative Henderson-Hasselbalch duties; a one-boundary open model is not every buffer calculation.'),
    ('RP optional actual aldol/imine/oxime/hydrazone', 'Historical haloalkane/hydrocarbon/dye partners and descendants do not explicitly carry these four carbonyl-formation instructions. Grignard neither replaces nor covers the named aldol instruction. Old mapped decision is historical, whole specific source coverage HOLD.'),
    ('RP compulsory LK Nernst incl pH at standard temperature', '266a and its SekI lab/safety descendants carry no Nernst equation or cell-potential/pH calculation. Preserve them, reject the historical exact edge as scientific reuse. New f0 pH boundary is partial; whole source duty HOLD.'),
    ('RP compulsory LK Gibbs-Helmholtz/reaction direction', 'The qualitative Gibbs goal and entropy/energy partners support qualitative spontaneity reasoning; preserve their level and do not use them to claim the separate standard-free-energy calculation bullet or full optional ΔG°/K relation.'),
    ('RP optional ΔG°/K relationship', 'Six original partners state qualitative energy/bonds, MWG, dynamics and Le Chatelier; they do not explicitly state the standard-free-energy/logK connection. The new integrated temperature transfer supports a component, not automatic whole clause approval.'),
    ('RP optional pH AND temperature potential dependence', 'The old SekI lab cluster cannot carry either explicit potential dependence. A single fixed-temperature pH redox line does not discharge temperature dependence. Both optional operators remain; no fresh exact edge approval.'),
]
source_results = []
for i, (label, limit) in enumerate(duty_limits):
    row = frame['rows'][i]
    source_results.append({'row': i, 'sourceGoalId': row['wholeOriginalSourceGoal']['id'], 'scopeLabel': label,
        'independentWholeDutyPartnerReason': limit,
        'originalWholeGoalPointer': row['sourceGoalPointer'], 'originalWholePassagePointer': row['passagePointer'],
        'originalDecisionPointer': row['decisionPointer'], 'allOriginalEdgePointers': [e['pointer'] for e in row['allOriginalMappingEdges']],
        'partnerGoalIds': [p['wholeGoal']['id'] for p in row['wholeAllOriginalPartnersAndDescendants']],
        'originalWholeBodiesAndEdgesExact': True, 'currentNormalSourceApproval': False,
        'historicalSpecificDutyHold': i in [5, 6, 8, 9]})

edge_results = []
for e in edges['edges']:
    goal = next(r for r in results if r['goalId'] == e['goalId'])
    edge_results.append({'actualProposedEdge': e['edgeCandidate'], 'decision': 'KEEP_bounded_partial_candidate_only',
        'reason': goal['sourceDutyBoundaryDe'], 'actualLocations': e['actualClauseLocation'],
        'wholeSourceDutyApproved': False, 'placementScopeApproved': False, 'normalSourceApproval': False,
        'allOriginalPartnerDutyLimitsPreserved': True})

verdict = write('five-remaining-whole-content-source.independent-b.scientific-first.verdict.json', {
    'schemaVersion': 1, 'reviewId': 'chemie-rest-five-content-source-independent-b-first-v1', 'reviewedAt': NOW,
    'reviewer': {'id': '/root/bio_science14_independent_b', 'authority': 'ai_candidate', 'independentOfAuthor': True},
    'role': 'independent_whole_current_five_content_source_bounded_candidate_FIRST', 'firstJudgmentImmutable': True,
    'inputEntry': bind(entry), 'ownInputFirst': bind(input_first), 'ownActualTechnicalReceipt': technical,
    'independence': {
        'freshPeerScienceReadBeforeFirst': False, 'authorOutcomeReportsReadBeforeFirst': False,
        'limitedNeutralEntryDisclosure': 'Top-level namedGrignardSourceCoverageHold=true was printed during the initial neutral input inventory. This prior exposure is explicitly disclosed in the immutable input-FIRST; the actual sources, whole goals, partner bodies and proposals were then independently judged. No author/peer outcome narrative was read.',
        'authorProposalsRead': 'Only the operative sourceRoleCandidate/edgeCandidate, actual source rows/partners, and witness sketches needed to assess the candidate; no external approval judgment was treated as authority.',
        'previousOtherFiveIdsReusedAsCurrentScience': False, 'previousCurrentFourReuseClaimed': False,
        'parentScopeClarification': 'Root confirmed no other B artifact is a prerequisite; current five duties independently reviewed; older different-ID science stays separate.',
    },
    'criteriaActuallyApplied': [
        'whole DE/EN operator fidelity and scientific meaning', 'actual primary printed/physical page and P/W/WP/Additum/optional layout',
        'explicit named requirement versus authored deeper application', 'all original whole source clauses and both AND/example duties retained',
        'all original partner roots and canonical descendants, with actual whole semantic descriptions',
        'independent mathematical signs, units, state assumptions, numerical results and limitations',
        'model action/author sketch versus real learner performance or physical experiment',
        'current applicability/placement/course limits and separation of ordinary source/P/native/V gates',
    ],
    'actuallyRead': {'wholeCurrentGoalsDeEn': 5, 'wholeOriginalSourceRows': 10, 'wholeOriginalEdges': 21, 'wholeUniquePartners': 29,
        'wholeCurrentPrerequisiteGoals': 5, 'wholeBilingualWitnessSketches': 5, 'proposedPartialEdges': 5,
        'wholePrimaryTextPhysicalPages': {'HE': [40, 46, 47, 48], 'RP': [20, 21, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47]},
        'actualPrimaryRasterPagesIndividuallyViewed': {'HE': [46, 47, 48], 'RP': [20, 40, 41, 44, 45, 46]},
        'wholeOfficialPDFTitleImprintRead': ['HE Ausgabe2024 Stand21.04.2026, 52 pages', 'RP MSS2022 Grund-/Leistungsfach, 116 pages'],
        'wholePDFNamedTextSearch': {'HE_Grignard': 0, 'RP_Grignard': 0, 'HE_Pourbaix': 0, 'RP_Pourbaix': 0, 'HE_pE_slash_pH': 0, 'RP_pE_slash_pH': 0},
    },
    'goalResults': results, 'sourceDutyResults': source_results, 'proposedEdgeResults': edge_results,
    'concreteFindingsAndRemainingHolds': [
        {'id': 'CHEM5B-NAMED-001', 'severity': 'HOLD_named_source_claim', 'goalId': results[2]['goalId'], 'reason': 'No named Grignard clause in the bound HE/RP primaries; optional aldol formation is a different actual duty.', 'remedy': results[2]['remedyDe']},
        {'id': 'CHEM5B-SOURCE-001', 'severity': 'HOLD_historical_specific_source_duty', 'sourceRows': [5], 'reason': duty_limits[5][1], 'remedy': 'Independently author/review the actual optional carbonyl-formation roles if selected, preserving original partners and history; do not infer these operators from generic families.'},
        {'id': 'CHEM5B-SOURCE-002', 'severity': 'HOLD_historical_false_exact_Nernst_edges', 'sourceRows': [6, 9], 'reason': duty_limits[6][1] + ' ' + duty_limits[9][1], 'remedy': 'Provide genuine pH-Nernst/cell and optional temperature-potential partners/finite witnesses with actual RP course scope. Retain original lab/safety goals separately and keep old exact decisions as history.'},
        {'id': 'CHEM5B-SOURCE-003', 'severity': 'HOLD_historical_whole_Gibbs_K_relation', 'sourceRows': [8], 'reason': duty_limits[8][1], 'remedy': 'Genuine finite ΔG°=-RT lnK° explanation/application tied to optional RP46 and actual standard-state reaction; do not label old qualitative partner union as whole coverage.'},
        {'id': 'CHEM5B-SCOPE-001', 'severity': 'HOLD_current_whole_source_and_placement', 'goalIds': [r['goalId'] for r in results], 'reason': 'The actual current whole goal applicability is unchanged. RP is absent from the three RP-derived targets; HE Q3.4 is conditional, and Q3.3 still requires current decree binding. Other current jurisdiction claims are not established by these two primaries.', 'remedy': 'New inactive genuine normal scope/placement/source metadata must be independently reviewed for each actual country, stage and course; no global whole-source approval from these five sketches.'},
        {'id': 'CHEM5B-WITNESS-001', 'severity': 'HOLD_whole_P_native_witness', 'goalIds': [r['goalId'] for r in results], 'reason': 'Five sketches are author synthetic examples, no ordinary whole P profiles/whole case pairs/native pages. Pourbaix has one line only; vanʼt Hoff lacks a concrete balanced reaction. Numeric and reaction illustration correctness is limited to the specified models.', 'remedy': 'Materialize complete bilingual task/worked response/transfer/rubric and actual finite map/reaction as claimed, then normal current P/native reviews. No actual learner/experiment statement.'},
    ],
    'summary': {'boundedScienceCandidatesSupported': 5, 'boundedPartialEdgeCandidatesSupported': 5, 'grignardContextOnlyNoSourceEdge': True,
        'newWholeSourceApprovals': 0, 'normalPApprovals': 0, 'nativeApprovals': 0, 'visualApprovals': 0, 'wholeSourceAllApproved': False},
    'authority': 'ai_candidate', 'status': 'needs_human_review', 'E1': True, 'G1': True,
    'activeWrites': False, 'historicalArtifactsRewritten': False, 'humanApproval': False, 'humanTrial': False,
    'realLearnerWorkOrPhysicalExperimentClaimed': False, 'sourceAtlas395Approved': False,
    'strictGain': 0, 'newScientificClosures': 0, 'restoredBindings': 0,
})

final_entry = write('completed-five-remaining-whole-content-source-independent-b.entry.json', {
    'schemaVersion': 1, 'role': 'neutral_completed_independent_five_content_source_B_review_entry', 'createdAt': NOW,
    'inputEntry': bind(entry), 'inputFirst': bind(input_first), 'scientificFirstVerdict': verdict,
    'actualTechnicalReceipt': technical, 'normalCurrentSourceOrPApproval': False,
    'activeWrites': False, 'humanApproval': False, 'humanTrial': False, 'strictGain': 0,
})
first = write('five-remaining-whole-content-source.independent-b.scientific-first.freeze.json', {
    'schemaVersion': 1, 'role': 'immutable_independent_B_first_judgment_seal', 'createdAt': NOW,
    'firstJudgmentImmutable': True, 'inputFirst': bind(input_first), 'neutralInputEntry': bind(entry),
    'actualOwnOutputs': [bind(Path(__file__)), technical, verdict, final_entry],
    'actualOriginalBindings': all_original_bindings,
    'freshPeerOutcomesReadBeforeFirst': False, 'humanApproval': False, 'strictGain': 0,
})
print(json.dumps({'entry': final_entry, 'first': first, 'technicalErrors': len(errors)}, ensure_ascii=False))
