"""Independent B: final twelve changed material cases, not native completion."""
from pathlib import Path
from datetime import datetime, timezone
from collections import Counter
import hashlib
import json
from decimal import Decimal

REPO = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
V8 = BASE / 'chemie-b008-twenty-six-positive-materials-author-v8'
V9 = BASE / 'chemie-b008-targeted-material-corrections-author-v9'
V10 = BASE / 'chemie-b008-colour-calibration-domain-targeted-author-v10'
OLD_A = BASE / 'chemie-b008-fifty-two-materials-v8-independent-a-v1'
OLD_B = BASE / 'chemie-b008-fifty-two-materials-v8-independent-b-v1'

def read(path):
    return json.loads(path.read_text())

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def bind(path):
    return {'path': str(path.relative_to(REPO)), 'sha256': sha(path), 'bytes': path.stat().st_size}

def write(name, value):
    (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def canonical_digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def diffs(before, after, prefix=''):
    if before == after:
        return []
    if isinstance(before, dict) and isinstance(after, dict):
        assert before.keys() == after.keys(), prefix
        return [item for key in before for item in diffs(before[key], after[key], prefix + '/' + key)]
    if isinstance(before, list) and isinstance(after, list):
        assert len(before) == len(after), prefix
        return [item for i, (left, right) in enumerate(zip(before, after)) for item in diffs(left, right, prefix + '/' + str(i))]
    return [{'JSONPointer': prefix, 'before': before, 'after': after}]

def pointer(value, path):
    for token in path.removeprefix('/').split('/'):
        value = value[int(token)] if isinstance(value, list) else value[token]
    return value

assert not (OWN / 'independent-b-v10-material-deltas.final.freeze.json').exists(), 'Frozen review'
v10_freeze_path = V10 / 'author-calibration-domain-v10.final.freeze.json'
assert sha(v10_freeze_path) == '4d87c6e7ab2ff360979f2ae410ae970258353b23f1506c69c0554e583e1ac347'
v10_freeze = read(v10_freeze_path)
v9_freeze_path = V9 / 'author-targeted-materials-v9.final.freeze.json'
v9_freeze = read(v9_freeze_path)
bindings = {}
historical_differences = []
for item in v9_freeze['ownFiles'] + v9_freeze['externalInputBindings']:
    actual = bind(REPO / item['path'])
    if actual['sha256'] != item['sha256'] or actual['bytes'] != item['bytes']:
        historical_differences.append({'historicalBinding': item, 'actualBinding': actual})
    bindings[actual['path']] = actual
allowed_separate_integration_paths = {
    'AGENTS.md',
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',
    'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
    'docs/legal/ai-transparency-inventory.json',
    'docs/qa-ci/status/curriculum-quality-status.json',
    'docs/qa-ci/status/curriculum-quality-status.md'}
assert {item['actualBinding']['path'] for item in historical_differences}.issubset(allowed_separate_integration_paths)
policy_drift = next(item for item in historical_differences if item['actualBinding']['path'] == 'AGENTS.md')
assert policy_drift['historicalBinding']['sha256'] == '08d0332f3395a594312557fadbbb4f01c29c5d33b80aa53b0e764b230805f384'
assert policy_drift['actualBinding']['sha256'] == 'b70ecef69785f31e6944f949fdbf5d1a139fdc78d85a2e0c5fc8c34b128e43ec'
for item in v10_freeze['files']:
    path = V10 / item['path']
    assert sha(path) == item['sha256'] and path.stat().st_size == item['bytes']
    bindings[str(path.relative_to(REPO))] = bind(path)
for item in v10_freeze['actualPriorInputs']:
    path = REPO / item['path']
    assert sha(path) == item['sha256'] and path.stat().st_size == item['bytes']
    bindings[item['path']] = bind(path)
for path in [v10_freeze_path, v9_freeze_path,
    OLD_A / 'precise-unresolved-findings-and-downstream-gates.json',
    OLD_A / 'fifty-two-actual-case-scientific-decisions.independent-a.json',
    OLD_B / 'literal-material-scientific-findings.actual.json',
    OLD_B / 'fifty-two-case-scientific-verdicts.actual.json',
    OLD_A / 'independent-a.v8-materials.complete.final.freeze.json',
    OLD_B / 'independent-b-v8-materials.final.freeze.json',
    BASE / 'biologie-q1-mv-heading-location-v8-independent-a-followup-v1/AGENTS-gemini-only-policy-diff.actual.txt',
    REPO / 'docs/concept/skill-graph/atomic-goal-visualizations.md']:
    bindings[str(path.relative_to(REPO))] = bind(path)
root_integration_receipts = []
for filename in ['reviewed-seven-active-integration.stage-1.actual.json',
                 'reviewed-seven-source-status.stage-2.actual.json',
                 'reviewed-seven-st-course-review-status.stage-3.actual.json']:
    path = BASE / 'biologie-q1-seven-reviewed-integration-candidate-v1/qa-artifacts' / filename
    root_integration_receipts.append(bind(path))
    bindings[str(path.relative_to(REPO))] = bind(path)

old = read(V8 / 'fifty-two-cases.de-en.author-candidate.json')
mid = read(V9 / 'fifty-two-cases.de-en.author-candidate.json')
final = read(V10 / 'fifty-two-cases.de-en.author-candidate.json')
literal = read(V9 / 'literal-field-delta-and-finding-response.author.json')
delta89 = diffs(old['cases'], mid['cases'], '/cases')
delta910 = diffs(mid['cases'], final['cases'], '/cases')
assert len(delta89) == 60 and len(delta910) == 2
author_delta = {item['JSONPointer']: item for item in literal['corrections']}
assert {item['JSONPointer'] for item in delta89} == set(author_delta)
for item in delta89:
    proposed = author_delta[item['JSONPointer']]
    assert proposed['before'] == item['before'] and proposed['after'] == item['after']
affected = sorted({int(item['JSONPointer'].split('/')[2]) for item in delta89})
assert affected == literal['affectedCaseIndicesZeroBased'] == [4, 6, 7, 8, 9, 10, 13, 16, 17, 43, 44, 45]
assert {item['JSONPointer'] for item in delta910} == {'/cases/9/transfer/de', '/cases/9/transfer/en'}
root89 = [item for item in diffs({k:v for k,v in old.items() if k != 'cases'}, {k:v for k,v in mid.items() if k != 'cases'})]
assert {item['JSONPointer'] for item in root89} == {'/artifactKind', '/authoredAtUTC'}
old_a = {row['caseIndexZeroBased']: row for row in read(OLD_A / 'fifty-two-actual-case-scientific-decisions.independent-a.json')['cases']}
old_b = {row['caseArrayIndexZeroBased']: row for row in read(OLD_B / 'fifty-two-case-scientific-verdicts.actual.json')['caseVerdicts']}
reuse = []
for i, body in enumerate(old['cases']):
    assert canonical_digest(body) == old_a[i]['actualCaseBodyCanonicalJsonSha256'] == old_b[i]['actualBilingualCaseBodySha256']
    if i not in affected:
        assert body == mid['cases'][i] == final['cases'][i]
        assert old_a[i]['materialVerdict'] == 'KEEP'
        assert old_b[i]['scientificMaterialVerdict'] == 'retain_candidate_material'
        reuse.append({'caseIndexZeroBased': i, 'caseKey': body['caseKey'], 'completeUnchangedCaseCanonicalJSONSHA256': canonical_digest(body),
            'oldA': 'KEEP', 'oldB': 'retain_candidate_material', 'disposition': 'REUSE_VALID_UNCHANGED_BYTES_NO_NEW_SCIENTIFIC_REVIEW'})
assert len(reuse) == 40
assert sum(mid['cases'][i] == final['cases'][i] for i in range(52)) == 51

for i in range(52):
    for field in ['caseKey', 'candidateKey', 'candidateGoalId', 'originalFamilyGoalId', 'status', 'reviewStatus', 'evidenceLevel', 'generationLevel', 'materialOrigin', 'learnerPerformanceRecorded', 'humanApproval', 'humanTrial', 'sourceOperatorScopeContractDe', 'nativeEvidenceApproved', 'strictCompletionsAdded']:
        assert old['cases'][i][field] == mid['cases'][i][field] == final['cases'][i][field]
    c = final['cases'][i]
    assert c['candidateGoalId'] is None and c['status'] == 'ai_candidate' and c['reviewStatus'] == 'needs_human_review'
    assert c['evidenceLevel'] == 'E1' and c['generationLevel'] == 'G1'
    assert not c['learnerPerformanceRecorded'] and not c['humanApproval'] and not c['humanTrial'] and not c['nativeEvidenceApproved']
    assert [r['criterionKey'] for r in c['requiredAssessmentCriteria']] == [r['criterionKey'] for r in old['cases'][i]['requiredAssessmentCriteria']]
    if 'moderatorProtocol' in c:
        protocol = c['moderatorProtocol']
        assert protocol['kind'] == old['cases'][i]['moderatorProtocol']['kind']
        for flag in ['performedNow', 'actualPriorReceiptSuppliedNow', 'externalSourceActuallyReadNowByLearner']:
            if flag in protocol:
                assert protocol[flag] is False and protocol[flag] == old['cases'][i]['moderatorProtocol'][flag]
    if 'moderatorProtocol' in c and 'setupAndModeratorPreparation' in c['moderatorProtocol']:
        assert c['moderatorProtocol']['setupAndModeratorPreparation'] == c['suppliedMaterial']
assert sum(len(c['requiredAssessmentCriteria']) for c in final['cases']) == 173
assert sum('moderatorProtocol' in c for c in final['cases']) == 14
assert sum(c.get('moderatorProtocol', {}).get('kind') == 'proposed_supervised_physical_execution_protocol' for c in final['cases']) == 6

notes = {
4: [
    'Der quantitative Standard ist ausdrücklich 1000 mg/L NaCl,1990±20 µS/cm bei25°C. Referenztemperaturprüfung und anschließender gemeinsamer Versuchstemperaturvergleich sind getrennt; die25°C-Beschriftung wird nicht ungeprüft bei20°C benutzt.',
    'Tatsächliches quantitatives Gerät, kleiner µS/cm-Bereich und zusätzlicher Bereich mindestens100mS/cm passen zur Blind-/Standard-/konzentrierteren Salzprobe. Thermometer/Sensor und Wasserbad sind vorhanden; Auflösung ist keine Genauigkeit. Überlauf bleibt ungültig.',
    'Blindwert, Spülung und eigene später tatsächlich beobachtete Durchführung bleiben Pflicht. Ausstattung, Standardetikett und erwartbarer Ionentrend sind keine bereits erfolgte Kalibration oder Leistung.'
],
6: [
    'Thermometer/Sensor0,1°C und betreutes Wasserbad20,0±0,5°C schließen die ausdrücklich erforderliche Temperaturbereitstellung. Vor/nach-Werte, Abweichungen, Bereich und Kompensation werden später tatsächlich protokolliert.',
    'Qualitativer Indikator und quantitatives Messgerät sind klar getrennt; Messbereich bis100mS/cm, Waage0,01g und Zylinder1mL sind angegeben. Eine100mL-Reihe mit0,5/1,0/1,5g ist eine5/10/15g/L-Reihe und nicht dieselbe1g/L-Archivreihe; der Plan verlangt eigene Einheiten und beansprucht keine exakte Volumetrie.',
    'Die bekannte Standardprüfung wird bei25°C vorgenommen, Proben werden danach20°C-gleichgestellt. Eigenplanung sowie wirkliche qualitative UND quantitative Durchführung mit echten Daten bleiben erhalten, keine zusätzliche Hypothesenerfindung.'
],
7: [
    'Wasserbad20,0±0,5°C und tatsächlich verwendbares Thermometer0,1°C sind explizit. Temperatur wird auch nach Zugabe, Rühren und Wartezeit geprüft; Abweichungen führen zu erneutem Angleich statt einer bloßen Sollwertbehauptung.',
    'Waagenauflösung0,01g und Geräte-/Prüfangaben sind bereitgestellt.10,0g Wasser, höchstens5,0g NaCl und Vergleich3,5gelöst/3,8Rückstand geben eine methodisch begrenzte Übergangsbeobachtung; die Referenz ist keine eigene Literatur-Löslichkeitsbestimmung.',
    'Qualitative Rückstände und quantitative eigene Massen sowie Wiederholung bleiben getrennte tatsächliche Produkte. Langsame Auflösung wird nicht ungeprüft Sättigung genannt; thermische Kontrolle ersetzt keine Durchführungsleistung.'
],
8: [
    'Stabile Bürettenklemme, Stativ und beschriftete Aufnahme-/pH-Gefäße schließen die echten Aufbauinformationen. Pipettierhilfe und10,00mL-Vollpipette sind getrennt. Dokumentierte zusätzliche Wassermenge erhält die Säurestoffmenge und erlaubt Elektrodenbedeckung.',
    'Indikatoren sind mit tatsächlichen Identitäten, Lösungstypen, Farben und produktbezogenen Bereichen8,2–9,8 beziehungsweise3,1–4,4 angegeben. Schwache-Säure-Endpunkt wird gegen die eigene pH-Kurve bewertet; Methylorange ist nicht der alkalische Äquivalenzbereich, Phenolphthalein ist kein automatisch genauer Endpunkt.',
    'Frische Puffer4,01/7,00/10,01, Temperaturfühler, Temperaturtabelle, getrennte Kalibrier-/Spülgefäße und Geräteanleitung ermöglichen tatsächliche Kalibration/Kontrolle. Buffer-Nominalwerte sind keine Probenmessung. Sicherheit und kleine Tropfenmengen verlangen erst konkrete Lehrkraftfreigabe; dieser Review gibt sie nicht.',
    'NaOH0,0100mol/L und Referenz8/16mL für gleiche10mL-Aliquote geben0,00800/0,0160mol/L und Verhältnis2. Änderungen von Ausrüstung, Erwartung, Kriterien und Beobachtungsprotokoll sind DE/EN deckungsgleich.'
],
9: [
    'Brilliant Blue FCF/Acid Blue9 bleibt ausdrücklich der reale spätere Stoff; nur vorbereitete verdünnte Lösungen, kein Lernenden-Pulvereinwiegen. Die vorher doppelte Erklärung ist entfernt. Eigenkalibration mit echten Standards ersetzt die synthetische Gleichung.',
    '10,00mL-Vollpipette±0,02mL und20,00mL-Messkolben±0,02mL entsprechen ausdrücklich den USP-Produktangaben oder dokumentiertem gleichwertigem Gerät. Pipettierhilfe ist kein Volumenmessgerät; Markenauffüllung und Mischen liefern den nominalen Faktor2 mit realen Geräte-/Volumenlogs.',
    'Der endgültige v10-Transfer behandeltA0,810 außerhalb der oberen gültigen Modellantwort0,490 bei6mg/L. Faktor2 ist nur ein erster Prüfversuch und garantiert keinen In-Bereich-Wert. Keine vorhergesagteA0,410 oderc5,0mg/L bleibt im aktuellen Transfer.',
    'Erst neue wirkliche In-Bereich-Messung mit eigener gültiger Kalibration erlaubtcdiluted und Faktor-Rückrechnung; bei weiterem Überlauf weitere bekannte Verdünnung/Gesamtfaktor. Diese zwei Felder korrigieren die v9-Extrapolation fachlich und in beiden Sprachen, ohne neue Messwerte zu erfinden.'
],
10: [
    'R1 mitW1/W2/H1/H2, fehlendem Datum, BeobachterM und allen Werten bleibt vollständig unverändert. Die neueR2-Notiz hat einen getrennten neuen AnsatzW3, BeobachterN,7.Oktober2026/10:15, GerätTH1/0,1°C und20,3°C vor Zuckerzugabe.',
    'R2 ist ausdrücklich ebenfalls ein fiktiver datierter Unterrichtsstimulus. Er wird als separates Ereignis mit Herkunft ergänzt und ist weder reale zukünftige Messung noch nachträgliche Prüfung der historischenR1-Proben.',
    'Die echte Messungsalternative darf erst mit tatsächlich beobachtetem eigenem Ansatz/Gerät/Log als solche gelten. DE/EN erhalten den neuen Probenbezug und dieselbe klare Fiktion-/Leistungsgrenze.'
],
13: [
    '0/0,5/1,0/1,5g/L und3/1020/1990/2950µS/cm bei25°C sind für den benannten NaCl-Stoff plausibel skaliert. Primärer Herstellerstandard bindet1g/L an1990µS/cm; Blind3 und Saccharose4 wurden nicht multipliziert.',
    'Die Zuwächse1017/970/960µS/cm und zunehmende, leicht abflachende Reihe stützen den begrenzten Ionen-/Konzentrationsbefund ohne universelle Linearität. Keine unbekannte Salzidentität oder reale zertifizierte Kalibration wird aus dieser eigenen synthetischen Reihe behauptet.'
],
16: [
    'Blank-/Positivkontrollen, KreuzreaktionY und undokumentierte U-Erhitzung/Verdünnung bleiben erhalten. Quellen-/Hinweis-/Nachweisunterscheidung wird nicht durch behauptete Instrumentenspezifität verkürzt.',
    'UnbekannteX/Y haben keine Trenneigenschaften. Ergänzende Methode muss an bekanntenX/Y/Blindproben erst validiert werden. Kontrollierte Wiederholung kann Verfahren verbessern, identifiziert aber mit demselben unspezifischen Mechanismus weiterhin nicht eindeutigX; erwartete Antwort undC3 erhalten genau diese Grenze in DE/EN.'
],
17: [
    '1800/2300 bei20/35°C sowie2298 temperaturgleich sind dieselbe korrigierte benannteNaCl-Skala; ungleiche Differenz500 und temperaturgleiche Differenz2µS/cm stimmen.',
    'Die unabhängige modellierte Wiederholstreuung±3 wurde ausdrücklich erhalten, nicht um Faktor10 verändert. Temperaturgleiche2 liegt innerhalb grober3; daraus wird keine vollständige Messunsicherheit oder exakte Konzentrationsgleichheit behauptet.',
    'Temperaturstörung, nötige Standards/Wiederholung/gleicheIonensorte und Saccharose-Transfer bleiben erhalten; echte Messleistung wird nicht behauptet.'
],
43: [
    'Archivmodell1800/2300/2298µS/cm und grobe±3 stimmen exakt mit dem Gültigkeitsfall. Der Partnerstart ist nur ein Stimulus und keine tatsächliche Gegenreaktion.',
    'Kontrolle begrenzt die Salzbehauptung; Ionensorten-/Temperaturfrage und fachliche Reflexion bleiben erforderlich. Tatsächliche fremde Beiträge, responsive Antwort und eigene Reflexion bleiben noch zu erbringen; es wird kein erfolgreicher Dialog erfunden.'
],
44: [
    'Korrigierter Transfer bleibt beim NaCl-Kontext nahe25°C und ausdrücklich verdünnten Bereich: Wärmeaufnahme/kleineAbkühlung passt zum positiven Standardlösungsenthalpiezeichen. NIST-TabelleA11 physisch66/gedruckt65 selbst gesehen und1,566RT unabhängig zu+3,882kJ/mol umgerechnet.',
    'Ladungs-/Beweglichkeitsmodell allein liefert keine Energiebilanz. Gefordert bleibt sinnvoller weiterer Energie-/Wechselwirkungsbedarf, keine Behauptung jedesSalzes/jederTemperatur oder ein bereits eigener Messnachweis. Unveränderte Atomkonservations- und analoge Modellprodukte behalten ihre alten Befunde.'
],
45: [
    'Die Hypothese ist jetzt auf den tatsächlichen Wasser-Ionen-Wechselwirkungstest begrenzt; kein unbereitgestellter Stoffvergleich gleicher Atomarten/verschiedenerBindungen wird als geprüft ausgegeben.',
    'O-Ende zuNa+, H-Enden zuCl− und digitale Vorzeichenfälle sind fachlich richtig im bereitgestellten Modell. Neutral heißt unbestimmt, nicht keine Wechselwirkung. Analoge und digitale eigene Produkte sowie begrenzte energetische/strukturelle Weiterentwicklungsbegründung bleiben erhalten.'
]
}

field_rows = []
case_rows = []
for i in affected:
    body = final['cases'][i]
    changed = [item for item in delta89 if int(item['JSONPointer'].split('/')[2]) == i]
    for item in changed:
        now = pointer(final, item['JSONPointer'])
        field_rows.append({'caseIndexZeroBased': i, 'caseKey': body['caseKey'], 'JSONPointer': item['JSONPointer'],
            'beforeV8': item['before'], 'authorV9': item['after'], 'currentFinalV10': now,
            'findingIds': author_delta[item['JSONPointer']]['findingIds'], 'currentIndependentBDecision': 'KEEP',
            'v9FieldDisposition': 'REVISE_SUPERSEDED_BY_EXACT_V10_TRANSFER_CORRECTION' if item['JSONPointer'] in {'/cases/9/transfer/de', '/cases/9/transfer/en'} else 'KEEP',
            'reviewedDEENMeaningAndActualChemistry': True})
    case_rows.append({'caseIndexZeroBased': i, 'caseOrdinalOneBased': i+1, 'caseKey': body['caseKey'],
        'candidateKey': body['candidateKey'], 'candidateGoalId': body['candidateGoalId'], 'decision': 'KEEP',
        'fullCurrentCaseCanonicalJSONSHA256': canonical_digest(body), 'currentBody': body,
        'changedV8ToV9LeafFields': len(changed), 'changedV9ToV10LeafFields': sum(int(item['JSONPointer'].split('/')[2]) == i for item in delta910),
        'independentScientificFindingsDe': notes[i], 'DE_EN': 'KEEP_SEMANTIC_EQUIVALENCE',
        'requiredCriterionKeys': [r['criterionKey'] for r in body['requiredAssessmentCriteria']],
        'currentActualLearnerPerformance': False, 'nativePOrDOrAApproval': False, 'unresolvedScientificFindings': []})

write('sixty-actual-field-deltas-and-final-two-field-correction.independent-b.json', {
    'schemaVersion': 1, 'reviewer': '/root/biology_q1_v7_sources_independent_a_followup acting independent B for Chemie B008',
    'v8Material': bind(V8 / 'fifty-two-cases.de-en.author-candidate.json'),
    'v9Material': bind(V9 / 'fifty-two-cases.de-en.author-candidate.json'),
    'v10Material': bind(V10 / 'fifty-two-cases.de-en.author-candidate.json'),
    'deltaV8ToV9': field_rows, 'literalV9ToV10': delta910,
    'changedCases': 12, 'V8ToV9Fields': 60, 'V9FieldsKeep': 58, 'V9FieldsSupersededByV10': 2,
    'finalCurrentFieldsKeep': 60, 'wholeV9ToV10CasesExact': 51,
    'historicalAuthorAndReviewBytesChanged': False, 'otherCurrentIndependentReviewRead': False})
write('twelve-current-case-scientific-decisions.independent-b.json', {'schemaVersion': 1,
    'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'scope': 'twelve actual changed current cases only, including exact v10 transfer correction',
    'rows': case_rows, 'KEEP': 12, 'REVISE': 0, 'unresolvedScientificFindings': 0,
    'nativeCanonicalIDsRemainNull': True, 'nativeEvidenceApproval': False, 'E1G1': True,
    'strictCompletionsAdded': 0, 'restoredActiveBindings': 0, 'humanApproval': False, 'humanTrial': False})
write('forty-exact-unchanged-cases-prior-review-reuse.json', {'schemaVersion': 1,
    'role': 'exact unchanged valid v8 A/B reviews reused; no historical restart', 'rows': reuse,
    'unmodifiedWholeV8ToV9Cases': 40, 'unmodifiedWholeV9ToV10Cases': 51, 'newScientificReviewsOfThese40': 0})

resolutions = [
    ['A-V8-01', [13,17,43], 'RESOLVED_CURRENT_TARGETED_MATERIAL', 'Benannte NaCl-Skala konsistent berichtigt;3/4-Blanks und±3-Streuung getrennt erhalten; numerische Querbindungen und Dialogstimulus stimmen.'],
    ['B-v8-01', [13,17,43], 'RESOLVED_CURRENT_TARGETED_MATERIAL', '1990µS/cm/1gL/25°C primär belegt;1800/2300/2298 und500/2-Differenzen korrekt; keine pauschale Unsicherheitsskalierung.'],
    ['A-V8-02', [44], 'RESOLVED_CURRENT_TARGETED_MATERIAL', 'NaCl-Transfer nahe25°C/verdünnt liefert Wärmeaufnahme statt unqualifizierter Wärmeentwicklung; Ladungsmodellgrenze erhalten.'],
    ['B-v8-02', [4,6,7,8,9], 'RESOLVED_CURRENT_TARGETED_MATERIAL_PROVISION_ONLY', 'Standards, quantitative Bereiche, Temperatur-/Waagenbereitstellung, Indikatoren/pH-Kalibration, Bürettenaufbau und wirkliche volumetrische Geräte samt späteren Logs sind explizit. Es wird keine praktische Leistung oder Sicherheitsfreigabe erteilt.'],
    ['B-v8-03', [10], 'RESOLVED_CURRENT_TARGETED_DOCUMENTATION_TRANSFER', 'Eigenständige ausdrücklich fiktiveR2/W3-Notiz wird separat angefügt;R1 bleibt unverändert, keine retrospektive reale Temperaturmessung.'],
    ['A-V8-03', [16], 'BOUNDED_KEEP_CLARIFICATION_RESOLVED', 'Folgemethode nur validierbarer Vorschlag; kontrollierte Wiederholung verbessert den Ablauf, identifiziertX wegenY-Kreuzreaktion weiterhin nicht eindeutig.'],
    ['A-V8-04', [9], 'DUPLICATION_REMOVED_WITH_CONTENT_BOUNDARIES_PRESERVED', 'Doppelte Farbstoff-Erklärung entfernt; reale Stoffidentität und eigene tatsächliche Kalibration bleiben.'],
    ['A-V8-05', [45], 'SCOPE_CLARIFICATION_RESOLVED', 'Hypothese auf tatsächlich bereitgestellte Dipol-Ionen-Karten und Regel begrenzt; unbereitgestellter gleicherAtomarten-Stoffvergleich nicht behauptet.'],
    ['V9-colour-out-of-range-prediction', [9], 'INDEPENDENTLY_CONFIRMED_V10_RESOLUTION', 'Ohne gültige Auswertung oberhalbA0,490 darfA0,810 weder zur Konzentration noch zum verdünnten Messwert extrapoliert werden. V10 entfernt beideVorhersagen, verlangt neue wirkliche In-Bereich-Messung und gegebenenfalls weitere bekannte Verdünnung. Keine neuenv9/v10-A-Ergebnisse gelesen.']
]
write('old-findings-and-calibration-domain-resolution.independent-b.json', {'schemaVersion': 1,
    'role': 'independent scientific resolutions, distinct from author response and native gates',
    'rows': [{'findingId': key, 'caseIndicesZeroBased': indices, 'decision': decision, 'independentReasonDe': reason}
             for key, indices, decision, reason in resolutions],
    'oldFindingGroups': 8, 'independentlyCheckedV10DomainCorrection': 1, 'unresolvedScientificFindings': 0,
    'currentV9V10PeerResultsRead': False, 'nativeP_AOrHumanApproval': False})

calculations = {
    'NaClStandard': {'concentrationMgPerL': 1000, 'concentrationGPerL': str(Decimal('1000')/Decimal('1000')), 'conductivityMicroSPerCm': 1990, 'labelErrorMicroSPerCm': 20, 'referenceTemperatureC': 25},
    'conductivityDifferences': {'unmatchedTemperature': 2300-1800, 'matchedTemperature': 2300-2298, 'retainedRoughRepeatScatter': 3, 'matchedWithinRoughScatter': (2300-2298) < 3, 'seriesSuccessiveIncrements': [1020-3,1990-1020,2950-1990], 'waterBlankUnscaled': 3, 'sucroseBlankUnscaled': 4},
    'NaClStandardDissolutionEnthalpy': {'tableValueDeltaHDivRT': 1.566, 'temperatureK': 298.15, 'R_JPerMolK': 8.314462618, 'ownCalculatedKJPerMol': 1.566*8.314462618*298.15/1000, 'scope': 'standard dissolution near25C,1bar; sign supports bounded dilute heat uptake, not universal concentration/temperature or exact sample cooling'},
    'acidTitrationReference': {'cNaOHmolPerL': '0.0100', 'aliquotML': '10.00', 'A_cmolPerL': str(Decimal('0.0100')*Decimal('8.00')/Decimal('10.00')), 'B_cmolPerL': str(Decimal('0.0100')*Decimal('16.00')/Decimal('10.00')), 'ratio': str(Decimal('16')/Decimal('8')), 'referenceNotMeasured': True},
    'colourDomain': {'validCmgPerL': [0,6], 'validModelAMax': str(Decimal('0.010')+Decimal('0.080')*Decimal('6')), 'transferA': '0.810', 'inCalibrationDomain': False, 'newDilutedAModelPrediction': None, 'newDilutedConcentration': None, 'nominalDilutionFactor': str(Decimal('20.00')/Decimal('10.00')), 'validExampleA': '0.290', 'validExampleConcentrationMGperL': str((Decimal('0.290')-Decimal('0.010'))/Decimal('0.080')), 'actualInRangeMeasurementAndOwnCalibrationRequired': True},
    'deviceErrorLimitsOnly': {'pipetteML': '10.00 +/-0.02', 'flaskML': '20.00 +/-0.02', 'nominalFactor': 2, 'factorBoundsIfOnlyTheseToleranceLimitsApplied': [float(Decimal('19.98')/Decimal('10.02')),float(Decimal('20.02')/Decimal('9.98'))], 'notStatisticalUncertaintyOrFullPracticalErrorBudget': True},
    'R2': {'newSample': 'W3', 'eventDate': '2026-10-07', 'eventTime': '10:15', 'observer': 'N', 'thermometer': 'TH1', 'displayResolutionC': '0.1', 'waterTemperatureCBeforeSugar': '20.3', 'actualMeasuredOrRetrospectiveVerification': False}
}
assert calculations['conductivityDifferences']['unmatchedTemperature'] == 500
assert calculations['conductivityDifferences']['matchedTemperature'] == 2
assert abs(calculations['NaClStandardDissolutionEnthalpy']['ownCalculatedKJPerMol']-3.882046708) < 1e-8
assert Decimal(calculations['colourDomain']['validModelAMax']) == Decimal('0.490')
write('independent-targeted-calculations.actual.json', {'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'calculations': calculations,
    'realLearnerMeasurementsGenerated': False, 'fictionalSuppliedNumbersRemainModelData': True})

write('actual-input-integrity-and-policy-drift.json', {'schemaVersion': 1,
    'v9OwnArtifactsExact': 8, 'v9ExternalBindingsExact': len(v9_freeze['externalInputBindings'])-len(historical_differences), 'historicalBindingDifferences': historical_differences,
    'currentPolicyDiffBasis': bind(BASE / 'biologie-q1-mv-heading-location-v8-independent-a-followup-v1/AGENTS-gemini-only-policy-diff.actual.txt'),
    'policyAssessment': 'Only already documented Gemini installer/download/unaccepted-image policy lines changed externally. Current AGENTS hash is bound. Historical v9 author hash retained; no blanket claim that its historical external bindings are current. Chemistry material/source/M7 requirements unchanged.',
    'parallelExternalIntegrationAssessment': 'Root explicitly confirmed its authorised integration of the seven Biology Q1 goals: Biology canonical, central config and transparency inventory plus regenerated quality-status reports change separately. Historical v9 bindings stay intact and actual current digests are recorded. This scoped chemistry material review makes no independent validation claim about that integration or equality of all19 global inputs.',
    'rootConfirmedSeparateIntegrationReceipts': root_integration_receipts,
    'rootReportedSeparateCentralRun': {'exitCode': 0, 'MathStrict': '807/807', 'PhysicsStrict': '478/478', 'ChemistryStrict': '112/378', 'BiologyStrict': '74/390', 'allSixSubjectsMachineValidationPassed': True, 'reportedM7Blockers': 0, 'thisReviewerDidNotReexecuteFullRun': True},
    'currentInputBindings': sorted(bindings.values(), key=lambda item:item['path']),
    'all52CaseIDsStatusesAndScopeContractsExact': True, 'allCriterionKeysAndCountsExact': 173,
    'allProtocolKindsAndUnperformedStatusRetained': 14, 'actualFuturePracticalProtocolCount': 6,
    'twoFieldV10DeltaExact': True, 'noCurrentIndependentV9V10PeerResultRead': True,
    'original1646SourceObligations': 'Unchanged bound candidate/source inputs retained; targeted material review grants no national coverage or source clearance.',
    'nativePProfilesOrUUIDAssignmentsCreated': False, 'activeWrites': False})

for item in bindings.values():
    assert sha(REPO / item['path']) == item['sha256']
primary_path = OWN / 'actual-primary-reading-and-inference-boundaries.independent-b.json'
assert primary_path.exists(), 'Actual separately recorded primary reading receipt required'
assert read(primary_path)['independentActualRead'] is True
(OWN / 'README.md').write_text('''# Chemie B008: zwölf Materialänderungen, unabhängig B, endgültiger Stand v10

**12 KEEP, keine offenen fachlichen B-Befunde.** Die tatsächlichen zwölf
geänderten Fälle wurden auf ihren vollständigen fachlichen Feldern, Protokollen,
DE/EN-Paaren, Kriterien und Transferbindungen unabhängig beurteilt. 60 Felder
ändern sich v8→v9; zwei davon sind erst mit der endgültigen v10-Korrektur gültig.
51 ganze Fälle bleiben v9→v10 exakt. 40 vollständig unveränderte Fälle behalten
ihre exakt gebundenen gültigen alten A/B-Befunde; sie wurden nicht neu geprüft.

- [Zwölf individuelle Entscheidungen](twelve-current-case-scientific-decisions.independent-b.json).
- [60 tatsächliche Felddeltas und die zwei v10-Korrekturen](sixty-actual-field-deltas-and-final-two-field-correction.independent-b.json).
- [Alte Befundauflösung](old-findings-and-calibration-domain-resolution.independent-b.json).
- [Eigene Primärquellenlektüre](actual-primary-reading-and-inference-boundaries.independent-b.json)
  und [unabhängige Rechnungen](independent-targeted-calculations.actual.json).
- [Exakte Wiederverwendung der 40 Fälle](forty-exact-unchanged-cases-prior-review-reuse.json)
  und [wahrheitsgemäße Eingangsbindung](actual-input-integrity-and-policy-drift.json).

Die NaCl-Skala folgt dem benannten 1990-µS/cm-Standard bei 1 g/L und 25 °C.
Blindwerte bleiben 3/4, die grobe Wiederholstreuung bleibt unabhängig ±3.
Ungleiche Temperaturen ergeben 500, gleiche Bedingungen nur 2 µS/cm Differenz.
NaCl-Wärmeaufnahme ist nahe 25 °C/verdünnt begrenzt. Neue Ausstattung enthält
echte Standards, Bereiche, Temperaturkontrolle, Indikator-/Pufferinformationen,
Bürettenhalterung und tatsächliche Volumengeräte; ihre Bereitstellung ist keine
Kalibration, Sicherheitsfreigabe oder ausgeführte Lernendenleistung.

Der finale Farbstofftransfer extrapoliert weder Konzentration noch künftige
Absorption aus A=0,810 außerhalb der gültigen Kalibration. 10→20 mL ist ein
erster Prüfversuch, keine Garantie eines Messwerts im Bereich. Erst eine neue
tatsächliche gültige Messung mit eigener Kalibration erlaubt die Auswertung
und Rückrechnung; gegebenenfalls weitere bekannte Verdünnung/Gesamtfaktor.
R2/W3 bleibt ein gesonderter datierter fiktiver Dokumentationsstimulus und
bestätigt keine historischen R1-Temperaturen nachträglich.

Keine neuen v9/v10-A-Reviewresultate wurden gelesen. Historische Dateien sind
unverändert. Der externe AGENTS-Gemini-Policy-Diff ist ausdrücklich dokumentiert;
der alte v9-Hash wird nicht umgeschrieben oder als aktuell identisch behauptet.
Zusätzlich haben Bio-Kanon, zentrale Registry, Transparenzinventar und neu
erzeugte Qualitätsstatusberichte während der von Root bestätigten parallelen
Integration tatsächlich andere Bytes. Diese Deltas sind mit
historischen und aktuellen Hashes ausgewiesen; dieser Chemie-Materialreview
prüft oder bestätigt dadurch keine gesonderte Bio-Integration und behauptet
keine pauschale aktuelle Gleichheit aller 19 globalen Eingänge. Root meldet
separat zentral Biologie **74/390**, Chemie **112/378**, Mathematik **807/807**
und Physik **478/478**, mit bestandenem zentralem Lauf. Dieser gezielte
Chemie-Review hat den vollständigen Lauf nicht erneut ausgeführt.

Alle 52 Ziel-UUIDs bleiben null, 26 historische Profile/Descriptions unverändert,
173 Kriterien und 14 Protokolle erhalten. E1/G1, `ai_candidate` und
`needs_human_review` bleiben wahrheitsgemäß. Sechs echte praktische Fälle
verlangen weiterhin spätere beobachtete Durchführung und eigene Rohdaten.
Diese Materialien sind keine nativen P-v2-Abschlüsse oder nativen D/A/M/V-
Freigaben. 1.646 ursprüngliche Quellenpflichten und offene Stufen-/Routen-Holds
bleiben gesondert, ebenso menschliche Prüfung, Freigabe und Erprobung.

**0 neue fachliche Abschlüsse, 0 wiederhergestellte aktive Bindungen,
0 strikter Nettozuwachs.** Keine Canon-/Registry-/Ledger-/Bildänderungen, keine
Runtime-/Plugin-/Veröffentlichungsarbeit, kein Git und kein Build. Nächster
Schritt: getrennte aktuelle A-Entscheidung auflösen, konkrete native UUIDs,
Quellen-/Stufenrouten und D/P/A/M/V mit vollständigen Sichtmengen prüfen.
''')
files = [{'path':str(path.relative_to(OWN)), 'sha256':sha(path), 'bytes':path.stat().st_size}
         for path in sorted(OWN.rglob('*')) if path.is_file()]
write('independent-b-v10-material-deltas.final.freeze.json', {'schemaVersion': 1,
    'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'role': 'frozen independent B current twelve targeted material reviews and v10 calibration-domain follow-up',
    'files':files, 'ownFileCount':len(files), 'inputBindings':sorted(bindings.values(),key=lambda item:item['path']),
    'KEEP':12, 'REVISE':0, 'unresolvedScientificFindings':0,
    'changedV8V9Cases':12, 'changedV8V9LeafFields':60, 'changedV9V10Fields':2,
    'wholeV9V10CasesExact':51, 'validUnchangedV8ReviewReuseCases':40,
    'allCandidateGoalIDsNull':True, 'nativeProfileApproval':False,
    'allAuthoritiesStatuses': 'ai_candidate / needs_human_review E1/G1',
    'otherCurrentIndependentReviewRead':False, 'historicalPolicyDriftDocumented':True,
    'parallelExternalIntegrationDriftDocumented': True, 'historicalGlobalInputEqualityClaimed': False,
    'historicalArtifactsRewritten':False, 'activeWrites':False, 'strictNetGain':0,
    'newScientificCompletions':0, 'restoredActiveBindings':0, 'humanApproval':False,
    'humanTrial':False, 'learnerEvidence':False, 'gitPublicationDeployment':False})
freeze_path = OWN / 'independent-b-v10-material-deltas.final.freeze.json'
print(json.dumps({'freeze': str(freeze_path.relative_to(REPO)), 'sha256':sha(freeze_path),
    'ownFiles':len(files), 'currentExactInputs':len(bindings), 'historicalExternalBindingDrifts':len(historical_differences),
    'materialDecisions':'KEEP12', 'unchangedReuseCases':40, 'strictNetGain':0}))
