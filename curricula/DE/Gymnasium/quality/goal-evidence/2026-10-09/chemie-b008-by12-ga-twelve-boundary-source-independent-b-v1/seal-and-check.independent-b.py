#!/usr/bin/env python3
"""Seal reviewer B's first source/operator/scope verdicts; never edit inputs."""
import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-by12-ga-twelve-boundary-source-author-v1'
ENTRY = AUTHOR / 'neutral-twelve-source-roles.review.entry.json'
NOW = datetime.now(timezone.utc).isoformat()
files = {}
documents = {}
pointer_checks = []
checks = []


def digest(data):
    return hashlib.sha256(data).hexdigest()


def canonical_bytes(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()


def relative(path):
    return str(path.relative_to(ROOT))


def binding(path):
    path = ROOT / path if not isinstance(path, Path) else path
    data = path.read_bytes()
    return {'path': relative(path), 'sha256': digest(data), 'bytes': len(data)}


def require(ok, name):
    checks.append({'check': name, 'passed': bool(ok)})
    if not ok:
        raise AssertionError(name)


def read_bound(bound, inspected_role=None):
    path = ROOT / bound['path']
    data = path.read_bytes()
    require(digest(data) == bound['sha256'] and len(data) == bound['bytes'], 'exact bytes: ' + bound['path'])
    files[bound['path']] = dict(bound)
    if inspected_role:
        files[bound['path']]['inspectionScope'] = inspected_role
    return data


def resolve(bound):
    data = read_bound(bound['file'])
    path = bound['file']['path']
    if path not in documents:
        documents[path] = json.loads(data)
    value = documents[path]
    for part in bound['jsonPointer'].split('/')[1:]:
        part = part.replace('~1', '/').replace('~0', '~')
        value = value[int(part)] if isinstance(value, list) else value[part]
    require(digest(canonical_bytes(value)) == bound['valueSha256'], 'exact JSON value: ' + path + bound['jsonPointer'])
    pointer_checks.append(bound)
    return value


def write(name, value):
    with (OUT / name).open('x', encoding='utf-8') as stream:
        stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


entry_binding = binding(ENTRY)
entry = json.loads(read_bound(entry_binding, 'Entire neutral sealed entry'))
candidate = json.loads(read_bound(entry['candidate'], 'Entire twelve-row bounded author proposal and original-row binders'))
witnesses = json.loads(read_bound(entry['supplementaryCompleteCases'], 'Both complete new bilingual source witnesses'))
author_reading = json.loads(read_bound(entry['wholeInputsAndActualPrimaryReading'], 'Entire author input manifest; no inherited review judgments'))
primary = author_reading['primaryReading']['binding']
read_bound(primary, 'Entire retained GA12 page, all 499 lines, LB1 and LB2–8; no fresh fetch')
require(len((ROOT / primary['path']).read_text().splitlines()) == 499, 'entire retained primary page has 499 lines')
require(candidate['schemaVersion'] == 1 and witnesses['schemaVersion'] == 1 and entry['schemaVersion'] == 1, 'entry/input schemaVersion 1')
require(len(candidate['rows']) == 12 and len(candidate['wholeSourceRows']) == 21 and len(witnesses['cases']) == 2, '12 candidates, 21 complete original source rows, 2 new witnesses')
require(len({row['prospectiveGoalId'] for row in candidate['rows']}) == 12, '12 unique prospective IDs')
require(candidate['activeWrites'] == 0 and candidate['strictM7NetGain'] == 0 and not candidate['wholeSourceOrNationalAtlasClearance'], 'author packet retains inactive/no-gain/no-clearance fences')

goal_sets = {}
for row in candidate['rows']:
    goal = resolve(row['wholeGoalInput'])
    profile = resolve(row['wholeProfileInput'])
    cases = resolve(row['wholeTwoCasesInput'])
    goal_sets[row['candidateKey']] = (goal, profile, cases)
    require(goal['id'] == row['prospectiveGoalId'] and not row['existsInCurrent378AtomicUniverse'], 'inactive identity: ' + row['candidateKey'])
    require(goal['contains'] == [] and goal['weight'] == 1, 'prospective leaf/weight guard: ' + row['candidateKey'])
    require(goal['description'] == profile['descriptionBindingCandidate']['de'] == profile['essentialUnderstanding']['de'], 'whole DE description/profile consistency: ' + row['candidateKey'])
    require(goal['descriptionEn'] == profile['descriptionBindingCandidate']['en'] == profile['essentialUnderstanding']['en'], 'whole EN description/profile consistency: ' + row['candidateKey'])
    require([case['caseKey'] for case in cases] == row['existingWholeCaseKeys'] == profile['caseKeys'] and len(cases) == 2, 'whole two-case keys preserved: ' + row['candidateKey'])
    for case in cases:
        for key in ['suppliedMaterial', 'learnerTask', 'expectedAnswer', 'transfer']:
            require(all(isinstance(case[key][lang], str) and case[key][lang] for lang in ['de', 'en']), 'complete bilingual field ' + key + ': ' + case['caseKey'])
        require(case['sourceOperatorScopeContractDe'] == profile['sourceScopeContractDe'], 'unchanged profile/case operator contract: ' + case['caseKey'])
        require(not case['learnerPerformanceRecorded'] and not case['nativeEvidenceApproved'] and case['strictCompletionsAdded'] == 0, 'no execution/native approval: ' + case['caseKey'])

originals = {}
for row in candidate['wholeSourceRows']:
    goal = resolve(row['wholeOriginalSourceGoal'])
    passage = resolve(row['wholeOriginalPassage'])
    decision = resolve(row['wholeOriginalDecision'])
    originals[row['originalSourceGoalId']] = (goal, passage, decision, row)
    require(row['allOriginalSourceOccurrencesPreserved'] == goal['sourceOccurrences'], 'whole occurrence array retained: ' + row['originalSourceSpan'])
    require(row['allOriginalPartnerGoalIds'] == decision['canonicalGoalIds'], 'whole ordered partner array retained: ' + row['originalSourceSpan'])
    mapping = documents[row['wholeOriginalDecision']['file']['path']]
    require(row['allOriginalCompatibleEdges'] == [edge for edge in mapping['mappings'] if edge['legacyGoalId'] == goal['id']], 'all actual original compatible edges retained: ' + row['originalSourceSpan'])
    require(row['wholeSourceDutyStatus'] == 'UNCHANGED_AND_NOT_CLEARED_BY_THIS_PACKET', 'whole source duty not cleared: ' + row['originalSourceSpan'])

scope = {'jurisdiction': 'DE-BY', 'stage': 'SekII', 'grade': '12', 'actualCourse': 'grundlegendes Anforderungsniveau', 'compatibilityProfile': 'GK', 'topicCode': 'C12-GA.1', 'nativeDeduplicatedCourseUnionNotAdopted': True}
for row in candidate['rows']:
    for component in row['sourceComponents']:
        goal, _, _, original = originals[component['originalSourceGoalId']]
        require(component['scope'] == scope, 'exact GA12 scope: ' + row['candidateKey'] + '/' + component['sourceSpan'])
        require(component['exactReadOccurrence'] in goal['sourceOccurrences'] and component['exactReadOccurrence']['sourceSpan'] == component['sourceSpan'], 'exact GA12 occurrence exists: ' + row['candidateKey'] + '/' + component['sourceSpan'])
        require(component['matchType'] == 'partial' and component['componentOnly'] and component['scopedNoWholeSourceClearance'], 'partial-component fences: ' + row['candidateKey'] + '/' + component['sourceSpan'])
        require(component['standardEdgeProposal'] == {'legacyGoalId': goal['id'], 'canonicalGoalId': row['prospectiveGoalId'], 'matchType': 'partial', 'reviewDecisionId': goal['id']}, 'inactive edge proposal identity: ' + row['candidateKey'] + '/' + component['sourceSpan'])
require(sum(len(row['sourceComponents']) for row in candidate['rows']) == 23, '23 bounded partial component relations')
require(sum(len(row['allOriginalCompatibleEdges']) for row in candidate['wholeSourceRows']) == 36, 'all 36 original compatible edges retained')
require(len(pointer_checks) == 99, 'all 99 bound complete goal/profile/case/source/decision/passage values verified')

for case in witnesses['cases']:
    require(not case['learnerPerformanceRecorded'] and not case['nativeEvidenceApproved'] and case['strictCompletionsAdded'] == 0, 'new witness remains unperformed: ' + case['caseKey'])
    for key in ['suppliedMaterial', 'learnerTask', 'expectedAnswer', 'transfer']:
        require(all(isinstance(case[key][lang], str) and case[key][lang] for lang in ['de', 'en']), 'complete new bilingual ' + key + ': ' + case['caseKey'])
    for resource in case.get('existingExactResourceBindings', []):
        read_bound(resource, 'Entire unchanged bilingual fictional teaching resource')

canonical_bound = next(bound for bound in author_reading['bindings'] if bound['path'] == 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
canonical = json.loads(read_bound(canonical_bound, 'Complete semantic duties and original relations of 16 existing partner goals; prospective-ID absence check'))
canonical_ids = {goal['id'] for goal in canonical['goals']}
partner_ids = {identifier for row in candidate['wholeSourceRows'] for identifier in row['allOriginalPartnerGoalIds']}
require(len(partner_ids) == 16 and partner_ids <= canonical_ids, 'all 16 original partner duties exist')
require(all(row['prospectiveGoalId'] not in canonical_ids for row in candidate['rows']), 'all 12 children absent from current active canonical graph')
partner_bindings = []
supplementary_safety_bindings = []
safety_child_ids = {'9e656697-fc05-5aa9-9aca-871af2e89eb7', '7be6f951-a614-52dc-94d3-2ce0d33765ff', 'ebaae4f5-cc13-5493-98b1-10e1abeb638f'}
semantic_fields = ['id', 'title', 'description', 'tags', 'requires', 'contains', 'dimensionTags']
for index, goal in enumerate(canonical['goals']):
    if goal['id'] in partner_ids or goal['id'] in safety_child_ids:
        values = {key: goal[key] for key in semantic_fields if key in goal}
        duty_binding = {'goalId': goal['id'], 'file': canonical_bound, 'jsonPointer': '/goals/' + str(index), 'inspectedSemanticFields': list(values), 'inspectedSemanticValuesSha256': digest(canonical_bytes(values))}
        (partner_bindings if goal['id'] in partner_ids else supplementary_safety_bindings).append(duty_binding)
require(len(supplementary_safety_bindings) == 3, 'complete semantic duties of all three safety-cluster children inspected')
files[canonical_bound['path']]['inspectionScope'] += '; complete semantic duties of all three safety-cluster children'
files[relative(ROOT / 'AGENTS.md')] = {**binding(ROOT / 'AGENTS.md'), 'inspectionScope': 'Relevant policies: lines 563–639, 840–850, 1317–1329'}
snapshot_path = candidate['rows'][0]['wholeGoalInput']['file']['path']
files[snapshot_path]['inspectionScope'] = 'All twelve exact whole DE/EN goals, twelve whole P profiles and twenty-four whole DE/EN cases through bound pointers; exact repeated values read once; no image peer verdicts inspected'
files[candidate['wholeSourceRows'][0]['wholeOriginalSourceGoal']['file']['path']]['inspectionScope'] = 'All 21 complete original source-goal objects and the complete common LB1 passage; original occurrence sets read as metadata, no EA/J13 primary-source validation'
files[candidate['wholeSourceRows'][0]['wholeOriginalDecision']['file']['path']]['inspectionScope'] = 'All 21 complete original assignment decisions and all 36 original compatible edges; mapped/exact history preserved, never inherited as this scientific verdict'

# Independent recalculation of the scientific reference claims, not learner work.
calibration_original = ((0.291 + 0.289) / 2 - 0.010) / 0.080 * 2
require(math.isclose(calibration_original, 7.0), 'recompute offset/mean/dilution reference: 7.00 mg/L')
require(math.isclose(math.log(2) / 0.05, 13.8629436112, rel_tol=1e-10), 'recompute first-order reference half-life')
require([round(1 * (1 + 10 ** (ph - 4)), 8) for ph in [3, 4, 5]] == [1.1, 2.0, 11.0], 'recompute dossier Q apparent-solubility reference')
require(math.isclose(40 / 18, 2.2222222222, rel_tol=1e-10) and math.isclose(63 / 18, 3.5), 'recompute accepted-product solvent/energy denominators')
require(math.isclose(1.1 ** 2 / (1.9 * 0.9), 0.70760233918, rel_tol=1e-10) and math.isclose(1.2 ** 2 / (1.8 * 0.8), 1), 'recompute static-Q model references without calling them dynamic evidence')
require([(50 * .2, 50 * .2), (60 * .2, 40 * .2), (56 * .2, 44 * .2)] == [(10, 10), (12, 8), (11.200000000000001, 8.8)], 'recompute dynamic-model directional transitions')
require(math.isclose(60 - .2 * 60 + .2 * 40, 56) and math.isclose(56 - .2 * 56 + .2 * 44, 53.6), 'recompute dynamic-model 60/40 → 56/44 → 53.6/46.4')
require(math.isclose(60 - .3 * 60 + .3 * 40, 54) and math.isclose(54 - .3 * 54 + .3 * 46, 51.6), 'recompute equal-transition acceleration with unchanged 50/50 equilibrium')

line_spans = {8: [73, 73], 9: [76, 76], 7: [58, 58], 10: [79, 79], 12: [87, 87], 27: [167, 167], 14: [93, 93], 15: [96, 96], 16: [109, 109], 17: [114, 115], 20: [130, 130], 23: [143, 143], 18: [120, 120], 26: [162, 162], 31: [179, 179], 33: [185, 185], 4: [47, 47], 11: [84, 84], 13: [90, 90], 19: [125, 125], 22: [138, 138]}
standards = {8: ['E1', 'E2', 'E3'], 9: ['E4', 'E5'], 7: ['S17'], 10: ['E6'], 12: ['E8', 'E11'], 27: ['B3'], 14: ['E10'], 15: ['E12'], 16: ['K1'], 17: ['K2'], 20: ['K8'], 23: ['K12'], 18: ['K3', 'K4'], 26: ['B2', 'B4'], 31: ['B10'], 33: ['B12', 'B13'], 4: ['S8', 'S15'], 11: ['E7'], 13: ['E9'], 19: ['K5', 'K6', 'K7', 'K9'], 22: ['K11']}

judgments = {
    'upper-theory-based-question-hypothesis': {
        'rationaleDe': 'E1/E2/E3 trägt eigene untersuchbare Frage und theoriegeleitete Hypothese. Der Gleichgewichtsfall passt zum GA12-Kontext; die Vorhersage und der passende Gegenbefund operationalisieren prüfbare Hypothesen. Der Schwachsäurefall ist ein ergänzender Prozesskontext, kein Beleg für GA12-Säurepflichten oder J13-Freigabe.',
        'observableProductsDe': ['Eigene Frage, begründete Theorie-Hypothese, erwarteter Befund und gültiges Gegenkriterium'],
        'unresolvedWholeDutiesDe': ['Keine experimentelle Durchführung, kein vollständiger ursprünglicher Hypothesen-/Untersuchungsfamilienabschluss; C11/EA/J13 und andere Länder werden nicht geprüft.'],
    },
    'upper-hypothesis-investigation': {
        'rationaleDe': 'E4/E5 bietet tatsächliche Untersuchung bzw. modellbasiertes Prüfen als Alternative. Planung, qualitative und quantitative Teile, sichere Durchführung und eigenes Protokoll sind im praktischen Kind verbindlich. Vorgegebene Hypothesen verhindern eigenständige experimentelle Planung nicht. Die eigene Theorie-Hypothesenbildung aus E1/E2/E3 wird dadurch weder bewiesen noch als universelle Zusatzvoraussetzung erfunden.',
        'observableProductsDe': ['Freigegebener überwiegend eigener Plan; eigene qualitative/quantitative Rohwerte, Kalibration, Wiederholungen und beobachteter Handlungslog'],
        'unresolvedWholeDutiesDe': ['Durchführung fehlt aktuell; acid-analysis ist kein curricularer GA12-Säureinhaltsnachweis. Sicherheitscluster und Modellpartner bleiben erhalten. Kein Experiment-UND-Modell-Zwang.'],
    },
    'upper-quantitative-hypothesis-data-evaluation': {
        'rationaleDe': 'S17/E8/E11 trägt quantitative mathematische Auswertung, Interpretation und fachübergreifende Hypothesenschlüsse. Die Arbeitsdatei mit Regression/Offset oder Linearisierung/Residuen liefert einen eng begrenzten E6-Auswertungs-/Berechnungsbeitrag. Beide DE/EN Fälle halten synthetische Rohdaten, Einheiten, Modellbereich und fehlende Ausführung auseinander.',
        'observableProductsDe': ['Tatsächliche eigene digitale Datei mit Rohdaten, Formeln, passenden Diagrammen, Fit/Residualprüfung und begrenztem chemisch-mathematischem Hypothesenschluss'],
        'unresolvedWholeDutiesDe': ['Keine eigene Messwerterfassung; sämtliche Modellierungs-/Simulationspflichten von E6 nicht geschlossen; umfassende Datenfamilie und nationale Kontexte bleiben offen.'],
    },
    'data-validity': {
        'rationaleDe': 'B3 trägt Angemessenheit, Grenzen und Tragweite von Informationen/Daten. Kreuzreaktion/Blindkontrolle und temperaturgleiche Kontrolle verlangen begründete Schlussgrenzen. Die NaCl-Modellkorrektur 2300 versus 2298 liegt innerhalb der bezeichneten groben Streuung, die nicht volle Messunsicherheit ist. Eine unbekannte X/Y-Spezifität wird nicht erfunden.',
        'observableProductsDe': ['Begründete Unterscheidung getragener und unbelegter Schlüsse; methodische Verbesserung aus konkreten Bedingungen'],
        'unresolvedWholeDutiesDe': ['LB3-Testergebnis-/Ionennachweispflichten nicht ganz geschlossen; Quellen- und Erkenntnisreflexionspartner sowie andere Stufen unverändert.'],
    },
    'own-inquiry-process-reflection': {
        'rationaleDe': 'E10 meint eigene Ergebnisse und eigenen Erkenntnisprozess. Beide ganzen Fälle verlangen den tatsächlich eigenen vorgängigen Ausführungs-/Rohlog. Angeleitet selbst durchgeführte Untersuchung ist eine eigene Untersuchung; nicht selbst geplante Schritte werden wahrheitsgemäß als vorgegeben bezeichnet. Fremde Musterwerte können diese Eingangsbedingung nicht erfüllen.',
        'observableProductsDe': ['Authentischer eigener vorangegangener Roh-/Handlungslog; darauf bezogene Frage/Hypothese, Methodengründe, Grenzen und konkrete Verbesserung'],
        'unresolvedWholeDutiesDe': ['Aktuell kein eigener Ausführungslog; E12-Fünferkriterien und vollständige Erkenntnisfamilie nicht ersetzt. Die unteren Vorfälle eröffnen keinen pauschalen SekI-Quellenabschluss.'],
    },
    'upper-scientific-validity': {
        'rationaleDe': 'E12 nennt die fünf Kriterien ausdrücklich. Beide DE/EN Fälle fordern konkrete Anwendung aller fünf und begrenzen gültigen Gegenbefund gegen Messfehler/Nichtgleichgewicht. Ein Q nach Störung falsifiziert nicht ohne passende Relaxation und Bedingungen eine Gleichgewichtsaussage. Die Fünferliste wird weder normativ in C8 verlegt noch automatisch auf J13 übertragen.',
        'observableProductsDe': ['Fallbezogene begründete Anwendung von Reproduzierbarkeit, Falsifizierbarkeit, Intersubjektivität, logischer Konsistenz und Vorläufigkeit'],
        'unresolvedWholeDutiesDe': ['Keine reale Erkenntnisprüfung aufgezeichnet; eigenes Untersuchungsreflektieren und weitere ganze Familienpflichten bleiben getrennt.'],
    },
    'upper-source-information': {
        'rationaleDe': 'K1/K2/K8/K12 trägt Eigenrecherche, Auswahl auch komplexer Information, Strukturierung/Interpretation und Schluss, Urheberschaft/Belege/Zitate. Die sechs vollständig gelesenen Lehrarchivdateien passen mathematisch und chemisch zu den Aufgaben. Beide Fälle verlangen reale analoge/digitale Recherche sowie eine tatsächlich gelesene geeignete externe Zusatzquelle; diese ist aktuell nicht geliefert. Der pharmazeutische Q-Kontext ist eine fiktive Operationalisierung und keine neue normative GA12-Wirkstoffpflicht.',
        'observableProductsDe': ['Eigener physischer/digitaler Such-/Auswahl-/Leselog mit prüfbaren Fundstellen, tatsächlicher Zusatzlektüre, strukturierten Daten und korrekten Belegen/Zitaten'],
        'unresolvedWholeDutiesDe': ['Keine aktuelle Lernendenrecherche; keine tatsächliche externe Zusatzlektüre; Präsentieren und Kriterienabwägen des gesamten Originalpartners nicht erledigt.'],
    },
    'upper-source-criticism': {
        'rationaleDe': 'K3/K4 kann anhand vorgelegter Quellen/Formsprünge geprüft werden. B2/B4 verlangt zusätzlich selbständig beschaffte Quellen: die beiden alten vorgelegten Quellenfälle leisten das allein nicht. Das neue Zusatzzeugnis erzwingt eigene Suche, Auswahl, Beschaffung und Leselog vor der Kritik im nicht vorselektierten sechsteiligen analogen/digitalen Archiv. Ein bereitgestellter Katalog kann den Zugang ermöglichen; er ist selbst kein Beschaffungsreceipt. Kein allgemeines externes Internetgebot oder universeller Recherche-prerequisite wird aus B2 erfunden.',
        'observableProductsDe': ['Konkreter Aussagen-/Relevanz-/Vertrauenswürdigkeits-/Intentionvergleich; für B2/B4 zusätzlich authentischer eigener Beschaffungs- und Leselog'],
        'unresolvedWholeDutiesDe': ['Ohne echte selbständige Beschaffung bleibt B2-Leistung HOLD; fertige Quellenkombination oder bloß abgelesene Musterantwort genügt nicht. Das Modellarchiv belegt keine breite reale Recherche oder Lernendenleistung.'],
    },
    'upper-chemical-effects-sustainability': {
        'rationaleDe': 'B10/B12/B13 trägt gesellschaftliche/ökologische Bedeutung, Produkte, Methoden, Verfahren und Erkenntnisse in historischen/aktuellen Zusammenhängen, drei Nachhaltigkeitsdimensionen und eigenes Handeln. Beide ganzen DE/EN Fälle erhalten diese Union und trennen eigene Indikatoren von historischen Bezugsquellen. Die Normpassung ist für den Teilbeitrag zulässig; BASF/UNEP-Sachquellen wurden in diesem versiegelten Inputset nicht neu quellengeprüft.',
        'observableProductsDe': ['Begründete historische/aktuelle Wirkungsbezüge aller vier Bereiche, drei Perspektiven, Zielkonflikte, eigenes Handeln und Bilanzgrenzen'],
        'unresolvedWholeDutiesDe': ['Keine neue historische Primärquellenfreigabe oder reale Ökobilanz; Gesellschaft/Berufsfelder- und Handlungsoptionenpartner bleiben erhalten.'],
    },
    'upper-model-use-criticism': {
        'rationaleDe': 'Das vorhandene Q/x-Rechnen zeigt Gleichgewichtslage, allein noch keine fortlaufenden gegenläufigen Teilchenprozesse. Das neue Zweizustandszeugnis korrigiert genau diese Lücke im S8/S15-Teilbeitrag: 50/50 bleibt trotz 10/10 Übergängen konstant; 60/40 wird 56/44 und 53,6/46,4. Eigene digitale Tabelle und analoge Prozessdarstellung sind Pflicht. E4/E5 bleibt der Modellalternativweg, E6 die digitale Modell-/Berechnungsanwendung, E7 Modellwahl/-gebrauch im vorhandenen Atom/PSE-Fall und E9 begründete Grenzen. Vorgegebene Modellparameter, Erwartungszahlen und künstliche Teilchen dürfen keine echte Reaktion/Messung behaupten.',
        'observableProductsDe': ['Eigene dynamische Hin-/Rück-Tabelle und analoge Darstellung; tatsächliche Modellwahl/-nutzung und begründete Möglichkeiten/Grenzen im jeweils gebundenen Kontext'],
        'unresolvedWholeDutiesDe': ['Kein tatsächliches Experiment, kein vollständiger S8/S15-Einflussfaktoren-/Katalysatorabschluss; sechs ursprüngliche Partner bleiben bestehen. Die ganze Atom/PSE-/Bindungs-/Molekül-/Rezeptor-/Enzymunion ist damit nicht geschlossen und erhält keine semantische Atomicity-, P- oder J13/EA-Freigabe.'],
    },
    'chemical-representation-transformation': {
        'rationaleDe': 'K5/K6/K7/K9 verlangt tatsächliche Aufbereitung/Überführung, Auswahl/Reflexion sowie korrekte Alltags-/Fachsprache. Prozess-/Teilchenschema und eigene digitale Grafik erfüllen den entworfenen Teiloperator mit Adressat, Bezugsgrößen und begrenzten Aussagen. Das Publikum Klasse 8 macht die leistende Person nicht curricular zu SekI. Ein bloßes Formel- oder Textabschreiben genügt nicht.',
        'observableProductsDe': ['Tatsächlich eigenes neues Schema/Grafikprodukt mit passender Sprache, Ladungsbilanz/Einheiten/Bezugsmenge und begründeter Formwahl'],
        'unresolvedWholeDutiesDe': ['Ganzer Fach-/Symbolsprachpartner und Quellenfamilie bleiben erhalten; andere Stufen oder Spezialformelziele nicht neu freigegeben.'],
    },
    'chemical-presentation': {
        'rationaleDe': 'K11 fordert chemische Sachverhalte sowie Lern-/Arbeitsergebnisse mit analogen und digitalen Medien. Beide ganzen Fälle verlangen eigene Vorarbeit, echte Präsentation mit beiden Medien, Publikum/Moderator und konkrete Produkte/Ablauf. Eigenes Experiment oder komplexe Eigenrecherche ist keine universelle Voraussetzung dieser Präsentationsleistung; fremde Folien sind kein eigener Arbeitsgegenstand.',
        'observableProductsDe': ['Eigenes Handout/Plakat und eigene digitale Folien/Tabelle; tatsächlicher Vortrag, passende begründete Form/Medien und nachvollziehbarer Publikums-/Moderatorreceipt'],
        'unresolvedWholeDutiesDe': ['Aktuell keine tatsächliche Präsentation, Frageantwort, Host- oder Human-Abnahme; vollständige Quellen-/Argumentfamilie bleibt offen.'],
    },
}

rows = []
for author_row in candidate['rows']:
    key = author_row['candidateKey']
    row = {'candidateKey': key, 'prospectiveGoalId': author_row['prospectiveGoalId'], 'status': 'SCOPED_PARTIAL_COMPONENT_ADMISSIBLE_FOR_INACTIVE_PREPARATION', 'wholeGoalStatus': 'HOLD_NOT_CLEARED', 'wholeSourceDutyStatus': 'HOLD_NOT_CLEARED', 'matchType': 'partial', 'active': False, 'inspectedWholeInputs': {field: author_row[field] for field in ['wholeGoalInput', 'wholeProfileInput', 'wholeTwoCasesInput']}, 'inspectedSupplementaryWholeCaseKeys': author_row['supplementaryAuthoredCaseKeys'], **judgments[key], 'sourceComponents': []}
    for component in author_row['sourceComponents']:
        n = int(component['sourceSpan'].rsplit('.', 1)[-1])
        original_goal, _, _, original = originals[component['originalSourceGoalId']]
        row['sourceComponents'].append({'sourceSpan': component['sourceSpan'], 'originalSourceGoalId': component['originalSourceGoalId'], 'status': 'ADMISSIBLE_ONLY_AS_NAMED_SCOPED_PARTIAL_SOURCE_ROLE', 'scope': scope, 'primary': primary, 'primaryExactLines': line_spans[n], 'standards': standards[n], 'exactGA12ReadOccurrence': component['exactReadOccurrence'], 'wholeOriginalSourceRowBinder': {field: original[field] for field in ['wholeOriginalSourceGoal', 'wholeOriginalPassage', 'wholeOriginalDecision']}, 'allOriginalPartnerGoalIds': original['allOriginalPartnerGoalIds'], 'allOriginalCompatibleEdges': original['allOriginalCompatibleEdges'], 'allOriginalSourceOccurrencesPreserved': original_goal['sourceOccurrences'], 'wholeOriginalDecisionPreservedWithoutAdoptingItsVerdict': True, 'wholeSourceStatus': 'HOLD_NOT_CLEARED', 'wholeSourceClearance': False, 'applicationAuthorizedByThisReview': False})
    rows.append(row)

findings = [
    {'findingId': 'B-SOURCE-01', 'severity': 'mandatory_scope_boundary', 'findingDe': 'E4/E5: praktischer Weg ODER modellbasierter Weg. Eigene Hypothesengenerierung ist E1/E2/E3, nicht eine erfundene universelle Zusatzpflicht jedes praktischen Produkts. Aktuelle Routentargets sind nicht integriert.', 'closedForBoundedAuthorDesignOnly': True},
    {'findingId': 'B-SOURCE-02', 'severity': 'mandatory_performance_boundary', 'findingDe': 'Die alten Kritikfälle tragen K3/K4, aber nicht selbständige Beschaffung für B2/B4. Der neue Archivfall ist als bedingtes Beschaffungsdesign passend; aktuelle authentische Beschaffung/Lesereceipts fehlen. Katalogbereitstellung allein bleibt unzureichend.', 'closedForBoundedAuthorDesignOnly': True},
    {'findingId': 'B-SOURCE-03', 'severity': 'mandatory_scientific_boundary', 'findingDe': 'Statische Q-Rechnung allein zeigt keine Dynamik. Das neue 50/50- und 60/40-Übergangsmodell ist rechnerisch konsistent und zeigt die beabsichtigte Stoff-/Teilchenunterscheidung. Gleiche p-Erhöhung beschleunigt hier die Annäherung ohne Lageänderung, beweist aber keine reale Katalyse.', 'closedForBoundedAuthorDesignOnly': True},
    {'findingId': 'B-SOURCE-04', 'severity': 'mandatory_scope_boundary', 'findingDe': 'Gelesene Primärquelle ist ausschließlich Jahrgang 12 grundlegend. GK ist die technische Kompatibilitätsprojektion; kein Beleg für EA/LK, J13, C11 oder andere Länder aus gemischten deduplizierten Zeilen, Tags, globaler Phase oder Wiederholung der Operatoren.', 'closedForBoundedAuthorDesignOnly': True},
    {'findingId': 'B-SOURCE-05', 'severity': 'mandatory_partner_boundary', 'findingDe': '36 originale Kanten, 16 Partnertätigkeiten und sämtliche Vorkommensarrays sind erhalten. Besonderes HOLD: S8/S15-Einflüsse/Katalysatoren, E7-Quantenzahlen/PSE-Spezialpartner, B3-Quellen/Erkenntnispartner, K5/K6/K7/K9-Sprachpartner sowie Gesellschaft/Berufsfelder und Handlungsoptionen.', 'closedForBoundedAuthorDesignOnly': True},
    {'findingId': 'B-SOURCE-06', 'severity': 'out_of_scope_remaining_hold', 'findingDe': 'Breite Modell-Kontextunion und neue Source19-Gesamtfreigabe, nationale Atlasfreigabe, native D/P/A/M/V und praktische/Human-Abnahme bleiben HOLD. Die historischen BASF/UNEP-Sachquellen sind nicht neu unabhängig verifiziert; diese Prüfung bewertet die gebundenen GA12-Prozessrollen.', 'closedForBoundedAuthorDesignOnly': False},
]
verdict = {'schemaVersion': 1, 'role': 'Fresh independent B first source/operator/scope verdict; inactive bounded source contributions only', 'reviewer': '/root/chem_source12_independent_b', 'createdAtUTC': NOW, 'neutralEntry': entry_binding, 'firstVerdictBeforePeerComparison': True, 'peerVerdictRead': False, 'historicalPositiveIndependentScienceOrSourceVerdictsRead': False, 'originalHistoricalAssignmentDecisionsReadOnlyToPreserveWholeDuties': True, 'actualPrimaryReading': {'binding': primary, 'officialURL': author_reading['primaryReading']['officialURL'], 'wholePageLinesRead': [1, 499], 'allLB1AndLB2To8Read': True, 'freshOfficialFetchPerformed': False}, 'status': 'SCOPED_PARTIAL_ROLES_ADMISSIBLE_WHOLE_DUTIES_HOLD', 'candidateRowsReviewed': 12, 'componentRelationsReviewed': 23, 'originalWholeSourceRowsReviewed': 21, 'originalCompatibleEdgesPreserved': 36, 'originalPartnerSemanticDutiesRead': 16, 'wholeDEENProfilesReviewed': 12, 'wholeDEENCasesReviewed': 24, 'newWholeDEENSourceWitnessesReviewed': 2, 'rows': rows, 'materialScientificAndScopeFindings': findings, 'blockingFindingsForTheseBoundedAuthorDesigns': [], 'allWholeSourceDutiesRemainHOLD': True, 'source19RemainingChildren': candidate['remainingSource19Children'], 'source19WholeStatus': 'HOLD', 'wholeGoalSourceOrNationalAtlasApproval': False, 'semanticAtomicityApproval': False, 'nativeD_P_A_M_VApproval': False, 'activeWrites': 0, 'strictM7NetGain': 0, 'newScientificCompletions': 0, 'restoredBindings': 0, 'realLearnerExecution': False, 'humanApproval': False, 'humanTrial': False}
write('independent-b.first-verdicts.json', verdict)
write('independent-b.reading-and-input-freeze.json', {'schemaVersion': 1, 'role': 'Reviewer B actual reading and immutable scoped input bindings', 'createdAtUTC': NOW, 'reviewer': '/root/chem_source12_independent_b', 'bindings': list(files.values()), 'all99CompleteValueBindings': pointer_checks, 'all16OriginalPartnerSemanticDutyBindings': partner_bindings, 'all3SafetyClusterChildSemanticDutyBindings': supplementary_safety_bindings, 'retainedWholePrimaryRead': True, 'wholeDEENGoalsProfilesAnd24CasesRead': True, 'bothNewWholeDEENWitnessesRead': True, 'exactRepeatedStringValuesReadOnce': True, 'truncatedToolOutputGapsReread': True, 'wholeOriginalSourceRowsRead': 21, 'wholeOriginalDecisionsRead': 21, 'allOriginalEdgesRead': 36, 'historicalPeerReviewArtifactsInspected': False, 'sourcePageCopied': False, 'inputsCopied': 0, 'activeWrites': 0})
write('independent-b.targeted-guards.actual.json', {'schemaVersion': 1, 'status': 'PASS', 'createdAtUTC': NOW, 'checks': checks, 'checksCount': len(checks), 'distinctImmutableFilesChecked': len(files), 'completeJSONValuesChecked': len(pointer_checks), 'currentInputsUnchanged': True, 'method': 'Bounded JSON/schema/identity/value-hash, complete original partner/occurrence/edge guards and independent scientific arithmetic; no repository build', 'scientificArithmeticIsNotLearnerPerformance': True, 'activeWrites': 0, 'strictM7NetGain': 0, 'humanApproval': False, 'humanTrial': False})
first_files = ['independent-b.first-verdicts.json', 'independent-b.reading-and-input-freeze.json', 'independent-b.targeted-guards.actual.json', Path(__file__).name]
write('independent-b.first.freeze.json', {'schemaVersion': 1, 'role': 'Immutable B first verdict seal before any peer comparison', 'createdAtUTC': NOW, 'sealedBeforePeerComparison': True, 'peerVerdictRead': False, 'files': [binding(OUT / name) for name in first_files], 'wholeSourceStatus': 'HOLD', 'activeWrites': 0, 'strictM7NetGain': 0, 'humanApproval': False, 'humanTrial': False})
with (OUT / 'README.md').open('x', encoding='utf-8') as stream:
    stream.write('''# Unabhängige Quellenprüfung B: zwölf GA12-Teilrollen

Die zwölf inaktiven Kandidaten sind für die 23 ausdrücklich benannten partiellen
GA12-Quellenrollen als Entwurf fachlich zulässig. Jede ganze Quellenpflicht,
jedes ganze Lernziel und Source19 insgesamt bleiben HOLD. Die ersten Urteile
wurden vor jeder Peer-Sichtung unter `independent-b.first.freeze.json` versiegelt.

Gelesen wurden die vollständige aufbewahrte GA12-Seite (499 Zeilen), alle zwölf
ganzen DE/EN-Ziele und P-Profile, 24 ganze DE/EN-Fälle, beide neuen Zusatzfälle,
21 originale Quelleneinträge/Entscheidungen, alle 36 Originalkanten, die vollständigen
semantischen Pflichten aller 16 Partner und alle sechs Lehrarchivressourcen.
Die 99 JSON-Wertbindungen und die Datei-/Partner-/Vorkommens-/Scope-Guards sind grün.

Das praktische und das modellbasierte E4/E5-Vorgehen bleiben Alternativen.
B2/B4 benötigt den tatsächlichen eigenen Beschaffungs-/Leselog; ein bereitgestellter
Katalog oder eine Musterantwort genügt nicht. Der neue dynamische Modellfall ist
rechnerisch konsistent und erfordert eigene digitale und analoge Produkte.
Es liegt keine tatsächliche Lernendenleistung vor. Die Quelle wurde nicht neu
online abgerufen; EA/LK, J13, andere Länder und historische BASF/UNEP-Sachquellen
erhalten aus diesem Votum keine neue Freigabe.

Aktive Änderungen: 0. Strikter M7-Zugewinn: 0. Keine native D/P/A/M/V-,
semantische Atomicity-, Atlas-, Human-Approval- oder Human-Trial-Freigabe.
''')
final_files = first_files + ['independent-b.first.freeze.json', 'README.md']
write('independent-b.final.freeze.json', {'schemaVersion': 1, 'role': 'Immutable independent B output freeze', 'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'firstVerdictUnchanged': True, 'peerVerdictRead': False, 'files': [binding(OUT / name) for name in final_files], 'activeWrites': 0, 'strictM7NetGain': 0, 'humanApproval': False, 'humanTrial': False})
for path in OUT.iterdir():
    if path.is_file():
        path.chmod(0o444)
print(json.dumps({'status': 'PASS', 'rows': 12, 'components': 23, 'wholeSourceRows': 21, 'originalEdges': 36, 'partnerDuties': 16, 'valueBindings': 99, 'checks': len(checks), 'boundedDesignBlockers': 0, 'wholeDuties': 'HOLD', 'strictM7NetGain': 0, 'firstFreeze': binding(OUT / 'independent-b.first.freeze.json'), 'finalFreeze': binding(OUT / 'independent-b.final.freeze.json')}, ensure_ascii=False, indent=2))
