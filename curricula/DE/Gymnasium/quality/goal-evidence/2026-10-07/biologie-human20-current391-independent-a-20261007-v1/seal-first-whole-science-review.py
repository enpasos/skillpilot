# SPDX-License-Identifier: Apache-2.0
"""Freeze actual independent review findings after whole inputs and primaries were read."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import re

root = Path.cwd()
own = Path(__file__).resolve().parent
author = own.parent / 'biologie-human20-current391-author-v1'
cache = Path('/tmp/skillpilot-human20-independent-a-primary')
read = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
def binding(p):
    return {'path': str(p.relative_to(root)), 'sha256': sha(p), 'bytes': p.stat().st_size}
def write(p, value):
    with p.open('x') as h:
        h.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
now = datetime.now(timezone.utc).isoformat()
first = author / 'author.current-whole-text-P20-source-AM.first.freeze.json'
assert sha(first) == '18b1a21ac3216c47c4208306cbbf7782d4504c42241875a2fa00009230acde1e'
frozen = read(first)
for r in frozen['frozenFiles']:
    p = root / r['path']
    assert sha(p) == r['sha256'] and p.stat().st_size == r['bytes']
goals = read(author / 'current20-whole-DEEN-goals.actual.json')['goals']
material = read(author / 'materials/twenty-whole-goals-forty-complete-DEEN-cases.author.json')['goals']
plans = read(author / 'neutral-twenty-current-whole-imageplans.author.json')['goals']
profiles = [json.loads(line) for line in (author / 'P20.current-text-preimage.author.review.jsonl').read_text().splitlines()]
assert len(goals) == len(material) == len(profiles) == len(plans) == 20
assert [g['id'] for g in goals] == [g['goalId'] for g in material] == [g['goalId'] for g in profiles] == [g['goalId'] for g in plans]
case_count = 0
for g, m, p, plan in zip(goals, material, profiles, plans):
    assert g == m['wholeGoal'] == plan['wholeGoal']
    assert len(m['cases']) == 2
    assert p['status'] == 'needs_human_review' and p['reviewAuthority'] == 'ai_candidate' and p['evidenceLevel'] == 'E1' and p['maximumClaimScope'] == 'G1'
    for c in m['cases']:
        brief = next(b for b in p['profile']['applicationCaseBriefs'] if b['id'] == c['id'])
        for lang, suffix in [('de', 'De'), ('en', 'En')]:
            assert brief['taskDemand' + suffix] == c['material'][lang] + ' ' + c['task'][lang]
            assert brief['expectedPerformance' + suffix] == c['modelAnswer'][lang]
        case_count += 1
assert case_count == 40

rationales = {
    1: 'Hautkonkurrenz/Barriere und Gewebeeintritt werden von Darmstoffwechsel und Gemeinschaftsänderung unterschieden. Bedingter Nutzen oder Schaden ist erklärt; Sterilitäts- und Probiotikagarantien sowie persönliche Diagnose werden nicht aus dem Modell abgeleitet.',
    2: 'Eigene Bakterienzellen/Teilung versus wirtsabhängige Virusvermehrung, Erregerschädigung und Abwehr passen zusammen. Wasser- und Atemübertragung variieren fachlich; das bakterielle Wirkziel wird nicht auf Viren übertragen. Vorbeugung und Therapie haben tatsächlich benannte Grenzen.',
    3: 'Barrieren/Phagozytose werden von antigenspezifischer humoraler und zellvermittelter Antwort getrennt. Antikörper phagozytieren nicht; infizierte Zellen und freie Viruspartikel verlangen verschiedene Anteile. Gedächtnis und Pollen-/Milbenallergie sind korrekt als unterschiedliche Vorgänge erklärt.',
    4: 'Eigene aktive Antwort/Gedächtnis mit Vorlauf gegenüber fertigen zeitweiligen Antikörpern wird begründet. Beide ganzen Fälle verbinden Vorbeugung, Zeitpunkt, Wirkgrenze und medizinische Eignung; kein sofortiger Vollschutz oder persönlicher Impfkalender wird behauptet.',
    5: '90 empfindliche/10 resistente zu 9/10 ergibt korrekt 10/19 statt 10 Prozent Resistenzanteil. Selektion vorbestehender Varianten und Änderungen weiterer Mitbewohner sind vom gerichteten Erzeugen der Resistenz getrennt; ein virales Wirkziel fehlt im zweiten Fall. Keine Dosier- oder Absetzregel.',
    6: 'Zuckerbausteine, Glycerin plus drei estergebundene Fettsäurereste und Aminosäure-/Peptidstruktur begründen die Gruppen. Die Kurzkettenkarte ist ausdrücklich Peptid/Proteingruppe, nicht jede kurze Kette ein fertig gefaltetes Protein; ungesättigte Fettreste ändern die Fettzuordnung nicht. Lebensmittelmischung bleibt von Einzelstoffzuordnung getrennt.',
    7: 'Makronährstoffrollen, Vielfalt, veränderte Aktivität und ausdrücklich gesicherte pflanzliche Versorgung sind plausibel. Die konkret im Ziel verlangten Mikronährstofffunktionen bleiben aber bei Vitamin C nur als ausgewählte Körperfunktionen und in der ganzen Erwartungsleistung als weitere notwendige Aufgaben benannt. Eine konkrete Vitaminfunktion fehlt als begründbare Leistung.',
    8: 'Beide ganzen Fälle verbinden beobachtbaren Stärke-/Peptidumsatz, passenden Enzym-Substrat-Komplex, Wiederverwendung und niedrigere Aktivierungsbarriere bei gleicher Ausgangs-/Endenergie. Protease wird nicht als Universalverdauungsenzym und das Schlossmodell nicht als starres Realbild ausgegeben.',
    9: 'Temperatur/Pretreatment, pH und Substratsättigung haben korrekt verschiedene Effekte. Kälteverlangsamung ist von hitzebedingter bleibender Strukturänderung getrennt; keine universellen Optima. Unterschiedliche Verdauungsenzyme werden funktionell ihren Milieus zugeordnet, ohne mathematische Herleitung oder zielgerichtete Individualanpassung.',
    10: 'Kauen/Peristaltik, Speichel/Magen/Pankreas und geeignete Räume bilden einen abgestimmten Weg. Alle drei Makronährstoffgruppen werden zu aufnehmbaren Bestandteilen verarbeitet. Galle emulgiert statt als Enzym chemisch zu spalten; Lipasen spalten. Keine ganzen Lebensmittel direkt im Blut.',
    11: 'Falten/Zotten/Mikrovilli, dünnes Epithel und Abtransport koppeln Bau an Aufnahme. Passive Gradienten und energieversorgte Carrier sowie unterschiedliche Blut-/Lymphwege für lange Fettprodukte sind korrekt; keine freie Großteilchenpassage oder alleinige Schwerkraft. Der Vergleich bleibt ohne individuelle klinische Prognose.',
    12: 'O2 100 gegen40 und CO2 46 gegen40 ergeben die richtigen gegenläufigen Lungengasrichtungen; im Gewebe sind die Richtungen umgekehrt. Fläche, Strecke, Belüftung und Perfusion werden mit passiver Nettodiffusion verbunden; weder aktive Gaspumpe noch vollständige Blut-/Gewebemischung.',
    13: 'Rechte Herzhälfte/Lunge und linke/Körper bilden gekoppelte Transportrouten; Darmaufnahme und Kapillarversorgung ergänzen Sauerstoffaufnahme und CO2-Abgabe. Herz/Klappen treiben und richten den Fluss. Arterie/Vene folgt Herzrichtung statt Farbe oder Sauerstoffgehalt; Blut erzeugt keine Nährstoffe.',
    14: 'Rauch-/Staubreduktion, passende Ernährung und Bewegung werden als begrenzte Vorsorge erklärt. Gefäßengstelle und Atemwegsweite bieten tatsächlich zwei fachlich verstandene Behandlungsprinzipien, keine bloße Medikamentenliste. Eignung/Diagnose bleiben fachlich, keine konkrete individuelle Anwendung.',
    15: 'Glucoseoxidation und Sauerstoffreduktion mit CO2/Wasser, ATP-Synthese/Hydrolyse-Kopplung und Wärmeabgabe bewahren Stoff-/Energiebilanz. Bindungsbruch allein ist keine Energiequelle, ATP kein jahrelanges Großlager. Der mobile regenerierte Träger verbindet Energiequellen mit Zellarbeit.',
    16: 'Bedingte30 gegen2 ATP und28 Differenz, CO2/Wasser versus Lactat sowie gleichzeitige Beiträge je nach Bedarf sind richtig. Der ganze zweite Modellantwort-/P-Erwartungsabschnitt verlangt zusätzlich Elektronenakzeptorregeneration zur Glykolyse; diese Teilschritt-/Reduktionsäquivalent-Erklärung überschreitet die ausdrücklich begrenzte BY10-3.4-Anforderung.',
    17: 'Hund/Rind und Pferd/Rind verbinden Nahrung, Gebiss, Aufnahme und Organbau. Pansen/Wiederkäuen und Hinterdarmfermentation sind verschieden und beide Symbiosen erklären pflanzlichen Aufschluss. Die Fälle sind keine vollständige Freigabe aller angrenzenden Säugetierpflichten oder ein Fütterungsplan.',
    18: 'Knochen/Joints, Muskelzug über Sehnen und Knochenstabilisierung über Bänder sind richtig getrennt. Gegenspieler, mehrere beteiligte Muskeln und Lastverteilung tragen die Vorsorgebegründung. Keine starre Idealhaltung, persönliche Diagnose oder universelle Gewichtsschwelle.',
    19: 'Grundlegende Vielfalt, Energie/Baustoffe, Organweg und Resorption sind altersgerecht verbunden. Der zweite deutsche ganze Modellantwort-/P-Erwartungstext nennt das Süßigkeitenangebot aber Süßstoffquelle; dies verwechselt fachsprachlich Zucker/Süßigkeiten mit Süßstoffen und stimmt nicht mit der englischen Aussage only sweets überein.',
    20: 'Atemwege und Austauschflächen bleiben vom geschlossenen Bluttransport getrennt. Beide Herzhälften/Kreisläufe, Gewebebedarf und Ausatemluft mit weiterhin O2 sind korrekt. Luft geht nicht als Ganzes ins Herz; Lungenvenen widerlegen die Farb-/O2-Fehletikette. Allgemeine Gesundheitsbezüge sind keine persönlichen Belastungsgrenzen.',
}
findings = [
    {'findingId': 'HUMAN20-A-P07-MICRONUTRIENT-FUNCTION', 'ordinal': 7, 'goalId': goals[6]['id'], 'severity': 'blocks_positive_profile_scientific_completion', 'status': 'open', 'location': 'human20-07-case-1 material.de/en and modelAnswer.de/en; both current P expectation/performance chains', 'actualIssue': 'The whole goal derives a concept from macro- and micronutrient functions. The bound source3.1 requires vitamin and mineral significance using an example each. Vitamin C is only assigned unspecified selected bodily functions; model performances repeat necessary roles without a concrete vitamin function usable to justify the concept.', 'requiredBoundedRemediation': 'Give a concrete correct vitamin function and its connection to the offered nutrient source, keep a concrete mineral structural function, and make the complete model performance and P case-bound expectation demonstrate these links. No quantities, diagnoses or new goal breadth required.', 'wholeGoalTextDecision': 'keep', 'scientificSourceLocator': 'Actual BY10 3.1 competences and content, micronutrients example significance'},
    {'findingId': 'HUMAN20-A-P16-SOURCE-LEVEL-BOUNDARY', 'ordinal': 16, 'goalId': goals[15]['id'], 'severity': 'blocks_positive_profile_source_level_completion', 'status': 'open', 'location': 'human20-16-case-2 modelAnswer.de/en and identical P applicationCaseBrief.expectedPerformanceDe/En', 'actualIssue': 'The complete expected performance requires regenerating electron acceptors for glycolysis. Current BY10 3.4 explicitly excludes substeps and reduction equivalents for this comparison, while the goal asks products, matter/energy balances and organism significance.', 'requiredBoundedRemediation': 'Keep the correct products/yields, demand/supply and non-all-or-nothing explanation; remove electron-acceptor regeneration from mandatory model/P performance or isolate it as explicitly optional background that cannot gate this current goal.', 'wholeGoalTextDecision': 'keep', 'scientificSourceLocator': 'Actual BY10 3.4 content, aerobic CO2 versus anaerobic muscle lactate comparison'},
    {'findingId': 'HUMAN20-A-P19-DE-NUTRITION-TERM', 'ordinal': 19, 'goalId': goals[18]['id'], 'severity': 'blocks_local_complete_bilingual_case_approval', 'status': 'open', 'location': 'human20-19-case-2 modelAnswer.de and identical P applicationCaseBrief.expectedPerformanceDe', 'actualIssue': 'The German whole model answer calls the original mostly-sweets menu a single Süßstoffquelle. In this nutrition context Süßstoffe are not the same as sugar-containing Süßigkeiten; the English only sweets and the given material do not assert a sweetener-only source.', 'requiredBoundedRemediation': 'Replace only the mistaken German nutrition term with the actually given Süßigkeiten/Zuckerangebot and rebind this complete model answer in P. Keep goal text and other cases unchanged.', 'wholeGoalTextDecision': 'keep', 'scientificSourceLocator': 'Actual HE-G9 printed11 whole5.3 nutrition/digestion and case-given menu'},
]
blocked = {f['ordinal'] for f in findings}
records = []
for n, (g, m, p) in enumerate(zip(goals, material, profiles), 1):
    records.append({'ordinal': n, 'goalId': g['id'], 'wholeTitleDe': g['title'], 'wholeTitleEn': g['titleEn'], 'wholeDescriptionDe': g['description'], 'wholeDescriptionEn': g['descriptionEn'], 'wholeGoalTextScientificDecision': 'keep', 'wholeDEENCaseIdsRead': [c['id'] for c in m['cases']], 'wholeCaseAndPScientificVerdict': 'HOLD_required_bounded_remediation' if n in blocked else 'PASS_E1_G1_only', 'rationaleDe': rationales[n], 'allProfileExpectationsCoverageVariationAndWholeCaseBriefsRead': True, 'caseBriefWholeDEENTaskMaterialAnswerFidelity': True, 'openFindingIds': [f['findingId'] for f in findings if f['ordinal'] == n], 'unreadPeerRawFindings': True})

fetch = read(cache / 'actual-fetch-receipt.json')
by = (cache / 'BY10.actual-text.txt').read_text()
by_start = re.search(r'B10\s+Lernbereich 2:', by).start()
by_end = re.search(r'B10\s+Lernbereich 4:', by).start()
he = (cache / 'HEG9.actual-text.txt').read_text().split('\f')
primary = {'schemaVersion': 1, 'artifactKind': 'independent-a-two-actual-primary-whole-scoped-readings', 'recordedAt': now, 'sourceEntries': [{'sourceKey': 'BY10', **next(r for r in fetch if r['key'] == 'BY10'), 'sourceStageAndCourse': 'Gymnasium Jahrgang10, common grade curriculum; no upper-secondary GK/LK expansion', 'wholeSectionsActuallyRead': ['Lernbereich2 whole competences and content', '3.1 whole competences and content', '3.2 whole competences and content', '3.3 whole competences and content', '3.4 whole competences and content'], 'actualCharacterSpanStart': by_start, 'actualCharacterSpanEndExclusive': by_end, 'actualWholeScopedTextSha256': hashlib.sha256(by[by_start:by_end].encode()).hexdigest(), 'ownSourceBoundary': 'Only the selected sixteen explanatory/classification/assessment competences; no actual clinical recommendations or new full-country coverage. Grade10 comparison3.4 excludes biochemical substeps/reduction-equivalent performance. Flat sourceRef B10.3.2–12 follows extracted competence ordinal, not an actual numbered subsection3.12.'}, {'sourceKey': 'HEG9', **next(r for r in fetch if r['key'] == 'HEG9'), 'sourceStageAndCourse': 'G9 Gymnasium Jahrgang5', 'wholeSectionsActuallyRead': ['5.2 whole printed9–10, physical10–11', '5.3 whole printed11, physical12'], 'actualWholePageTextDigests': [{'physicalPage': n, 'printedPage': n - 1, 'sha256': hashlib.sha256(he[n - 1].encode()).hexdigest()} for n in [10, 11, 12]], 'ownSourceBoundary': 'Four selected explanatory competences only. Adjacent mammal behaviours/other animal facts, nutrient tests and actual own-body observations are distinct duties; reading the whole source does not approve or claim those performances.'}], 'exactLiveRawAndExtractionHashesEqualAuthorInputWitnesses': True, 'rawOfficialSourcesCopiedToDossier': False, 'thirdPartySourceRightsNotChanged': True, 'humanApproval': False}
write(own / 'actual-two-primary-whole-scoped-readings.independent-a.json', primary)
input_paths = [author / name for name in ['current20-whole-DEEN-goals.actual.json', 'materials/twenty-whole-goals-forty-complete-DEEN-cases.author.json', 'P20.current-text-preimage.author.review.jsonl', 'neutral-twenty-current-whole-imageplans.author.json']]
write(own / 'actual-neutral-inputs-and-whole-forty-P-case-fidelity.receipt.json', {'artifactKind': 'independent-a-exact-scientific-input-and-whole-case-fidelity', 'inputArtifacts': [binding(p) for p in input_paths], 'authorFirstFreeze': binding(first), 'authorFrozenFilesVerified': len(frozen['frozenFiles']), 'wholeCurrentDEENGoals': 20, 'wholeCommonBilingualCases': 40, 'wholeMaterialTaskModelAnswerEqualsNativePCaseBriefs': True, 'profileStatusesTruthfulE1G1Candidates': True, 'structuralFidelityDoesNotOverrideScientificFindings': True, 'humanApproval': False})
write(own / 'first-twenty-whole-goals-forty-cases-source-P-science.actual.json', {'schemaVersion': 1, 'artifactKind': 'independent-a-human20-actual-first-whole-science-review', 'recordedAt': now, 'actualAgent': '/root/b008_placements_author_resume', 'reviewRole': 'Independent A, not text/material/image author', 'wholeGoalsActuallyRead': 20, 'completeDEENMaterialTaskModelAnswerCasesActuallyRead': 40, 'operativeP20ExpectationsCoverageVariationAndWholeCaseBriefsActuallyRead': 20, 'actualPrimaryDocumentsWholeScopedRead': 2, 'wholeGoalTextScientificKeep': 20, 'wholeCasePSciencePASS': 17, 'wholeCasePScienceHOLD': 3, 'records': records, 'findings': findings, 'nativeFinalDRequiresActualCurrentPages': True, 'actualVNotYetPerformed': True, 'peerOrRootRawIndependentFindingsRead': False, 'noHistoricalReviewRestart': True, 'sourceCountryWideClosureClaim': False, 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'realLearnerPerformance': False, 'humanApproval': False, 'activeWrites': 0, 'strictGainClaimed': 0})
files = [own / name for name in ['actual-two-primary-whole-scoped-readings.independent-a.json', 'actual-neutral-inputs-and-whole-forty-P-case-fidelity.receipt.json', 'first-twenty-whole-goals-forty-cases-source-P-science.actual.json']]
seal = own / 'first-twenty-whole-science.freeze.json'
write(seal, {'schemaVersion': 1, 'artifactKind': 'independent-a-human20-science-first-freeze', 'recordedAt': now, 'frozenFiles': [binding(p) for p in files], 'peerRawFindingsReadBeforeSeal': False, 'wholeGoalTextKeep20': True, 'caseAndPSciencePASS': 17, 'boundedOpenFindings': 3, 'imageOrNativePageApprovalNotClaimed': True, 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False})
print(json.dumps({'scienceFirstFreeze': binding(seal), 'wholeDEENGoals': 20, 'wholeDEENCases': 40, 'wholeTextKeep': 20, 'wholeCasesPSciencePASS': 17, 'wholeCasesPScienceHOLD': 3, 'actualWholePrimarySections': 2, 'activeWrites': 0, 'strictGain': 0, 'humanApproval': False}))
