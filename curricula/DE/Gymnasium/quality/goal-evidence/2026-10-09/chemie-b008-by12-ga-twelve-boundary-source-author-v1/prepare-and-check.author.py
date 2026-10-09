#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Materialise this bounded author packet; never edit operative inputs."""
import hashlib
import importlib.util
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
BASE = Path('curricula/DE/Gymnasium')
OLD = BASE / 'quality/goal-evidence/2026-10-08'
SOURCE = BASE / 'input/BY/gymnasium/source-extraction/DE_BY_CHEMIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json'
MAPPING = BASE / 'mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.review.json'
PRIMARY = BASE / 'quality/goal-evidence/2026-10-05/chemie-b008-nine-source-operator-structural-current-author-candidate-v3/primary-inputs/by12-ga.actual-main.txt'
SNAPSHOT = OLD / 'chemie-b008-twenty-six-images-author-20261008-v1/all26-whole-goals-and-unchanged26P52cases.readonly-inputs.snapshot.json'
GAPS = OLD / 'chemie-b008-bw-paired-source-atlas-continuation-technical-resumed-v1/focused38-next-source-placement-review-gaps.neutral.json'
STATE = OLD / 'chemie-b008-nineteen-boundary-source-contributions-author-resumed-v1/unfinished-source19.checkpoint.state.json'
ACTIVE = BASE / 'canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
DOSSIER = BASE / 'quality/goal-evidence/2026-10-06/chemie-b008-twenty-six-positive-materials-author-v8/research-dossier'
STAMP = datetime.now(timezone.utc).isoformat()


def read(path):
    return json.loads((ROOT / path).read_text())


def bind(path):
    content = (ROOT / path).read_bytes()
    return {'path': str(path), 'sha256': hashlib.sha256(content).hexdigest(), 'bytes': len(content)}


def value_ref(path, pointer, value):
    # This value codec is explicit; file bytes remain the authoritative input.
    codec = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
    return {'file': bind(path), 'jsonPointer': pointer, 'valueSha256': hashlib.sha256(codec).hexdigest(),
            'valueCodec': 'UTF-8 JSON; ensure_ascii=false; sort_keys=true; separators=comma/colon'}


def write(name, data):
    (OUT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


# The science below is an author proposal, not an independent verdict.
PLANS = {
    'upper-theory-based-question-hypothesis': {
        'spans': [8],
        'reasonDe': 'E1/E2/E3 trägt das selbstständige Identifizieren einer Frage aus einer Alltagssituation und die theoriegeleitete Hypothese. Die beiden unveränderten Fälle verlangen eigene Frage, Theoriebezug, Vorhersage und bedingten Gegenbefund. Die explizite Vorhersage/Gegenprüfung ist die prüfbare Operationalisierung; sie ist keine zusätzliche wörtliche Lehrplanklausel.',
        'actionsDe': ['Eigene Fragestellung und Hypothese mit begründetem Theoriebezug', 'Erwartbaren Befund und geeignetes Gegenkriterium unter gültigen Untersuchungsbedingungen ableiten'],
        'holdsDe': ['Keine eigene praktische Durchführung durch die Frage-/Hypothesenleistung belegt', 'C11, EA, Jahrgang 13 und andere regionale Hypothesenpflichten nicht hier freigegeben'],
    },
    'upper-hypothesis-investigation': {
        'spans': [9],
        'reasonDe': 'E4/E5 hat eine experimentelle und eine modellbasierte Alternative. Dieses Kind liefert ausschließlich den experimentellen Teilbeitrag: hypothesengeleitete qualitative und quantitative Planung, sichere tatsächliche Durchführung und Protokoll. Die Modellalternative liegt am getrennten Modellkind. Eine bereitgestellte Hypothese ist zulässig; eigene Theorie-Hypothesenbildung wird nur in dem sie verlangenden Quellenweg zusätzlich belegt.',
        'actionsDe': ['Begründete eigene qualitative und quantitative Analysenplanung', 'Tatsächliche sichere Durchführung nach konkreter Freigabe, eigene Rohdaten und Handlungslog', 'Hypothesenprüfung aus den eigenen Werten und nachvollziehbarer Protokollführung'],
        'holdsDe': ['Referenzwerte, Plan, Moderatorprotokoll oder Modellrechnung sind kein Ausführungsnachweis', 'Kein Experiment-UND-Modell-Zwang aus bzw. ableiten', 'Vollständige Sicherheits-/Untersuchungspflicht und alle Originalpartner bleiben erhalten'],
    },
    'upper-quantitative-hypothesis-data-evaluation': {
        'spans': [7, 10, 12],
        'reasonDe': 'S17 trägt quantitative mathematische Auswertung, E8/E11 die Datenbeziehungen, Interpretation, Hypothesenstützung/-falsifizierung und fachübergreifenden Bezug. Der zusätzliche begrenzte E6-Beitrag sichert die tatsächlich angewandten digitalen Rechen-/Auswertungswerkzeuge. Beide bestehenden Fälle verlangen ein eigenes digitales Arbeitsprodukt; ihre Modell-Rohdaten werden nicht als erhoben ausgegeben.',
        'actionsDe': ['Geeignete Mathematik und digitale Auswertung tatsächlich als eigene Datei anwenden', 'Einheiten, Modellbereich, Regression/Offset oder Linearisierung und Untersuchungsbedingungen begründen', 'Quantitativen chemisch-mathematischen Hypothesenbefund mit Reichweitengrenze erläutern'],
        'holdsDe': ['E6-Messwerterfassung und jede dort genannte Simulations-/Modellierungsleistung nicht vollständig durch einen Rechenfall erledigt', 'Keine aktuelle eigene Messung oder realer Lernerfolg durch synthetische Zahlen belegt'],
    },
    'data-validity': {
        'spans': [27],
        'reasonDe': 'B3 trägt Angemessenheit, Grenzen und Tragweite von Informationen/Daten. Beide ganzen Fälle prüfen Aussagen anhand Kontrollen, Verfahrensbedingungen und begrenzter Folgerungen. Die Originalpartner zur Quellenarbeit und Erkenntnisreflexion werden nicht aus der ganzen Zeile entfernt. LB3.3 ist ein anderer spezieller Quellenbeitrag und wird hier nicht mitfreigegeben.',
        'actionsDe': ['Aus Daten und Untersuchungsbedingungen gültige und nicht getragene Folgerungen unterscheiden', 'Konkrete methodische Unsicherheiten und Reichweitengrenzen begründen'],
        'holdsDe': ['Kein vollständiger LB3-Testergebnis-/Ionennachweisabschluss', 'Mess-/Verfahrensfehlerpflichten anderer Primärstellen bleiben getrennt erhalten'],
    },
    'own-inquiry-process-reflection': {
        'spans': [14],
        'reasonDe': 'E10 verlangt ausdrücklich eigene Ergebnisse und eigenen Erkenntnisprozess. Die vorhandenen beiden Fälle setzen den tatsächlichen eigenen Ausführungs-/Rohlog voraus. Eine angeleitete eigene Durchführung ist möglich; vorgegebene Planung wird dabei nicht als selbst geplant ausgegeben. Der getrennte E12-Kriterienabschluss wird nicht als Ersatz verwendet.',
        'actionsDe': ['Tatsächlich eigene vorangegangene Untersuchung mit unverändertem Roh-/Handlungslog binden', 'Eigene Ergebnisse mit Ausgangsfrage/Hypothese verbinden, angewandtes Vorgehen begründen und Grenzen/Verbesserung ableiten'],
        'holdsDe': ['Vorliegend kein eigener Ausführungslog und keine Lernendenleistung', 'Fremder oder synthetischer Musterfall erfüllt eigene Untersuchung nicht', 'Kein pauschaler SekI- oder E12-Abschluss'],
    },
    'upper-scientific-validity': {
        'spans': [15],
        'reasonDe': 'E12 nennt alle fünf Gültigkeitskriterien ausdrücklich. Beide vollständigen Fälle wenden diese fallbezogen an und trennen verlässliche passende Gegenbefunde von Mess-/Durchführungsfehlern. Keine automatische Widerlegung aus beliebiger Abweichung. Die ursprüngliche ganze Pflicht des Erkenntnisgewinnungsprozesses bleibt erhalten.',
        'actionsDe': ['Reproduzierbarkeit, Falsifizierbarkeit, Intersubjektivität, logische Konsistenz und Vorläufigkeit konkret auf den Fall anwenden', 'Passende Bedingungen und verlässlichen Gegenbefund von fehlgeschlagener Untersuchung unterscheiden'],
        'holdsDe': ['Keine normative Fünferliste für andere Stufen ableiten', 'Ein einzelnes unkontrolliertes negatives Resultat ist keine wissenschaftliche Falsifikation'],
    },
    'upper-source-information': {
        'spans': [16, 17, 20, 23],
        'reasonDe': 'K1/K2/K8/K12 bilden die Quellenerschließung: selbst recherchieren und auswählen, komplexe Informationen erschließen, strukturieren/interpretieren und Schlüsse ziehen, Urheberschaft/Belege/Zitate. Die zwei vorhandenen Fälle verlangen analoge und digitale Eigenrecherche sowie eine tatsächlich gelesene geeignete Zusatzquelle. Der genannte pharmazeutische Q-Kontext ist eine hypothetische Operationalisierung, keine wörtliche allgemeine Pflicht jedes GA-LB1-Bullets.',
        'actionsDe': ['Tatsächlichen eigenen analogen/digitalen Such- und Auswahlweg mit Fundstellen protokollieren', 'Komplexe Informationen richtig strukturieren/interpretieren und fachlich begrenzt schlussfolgern', 'Urheberschaft, vollständige Belege und Zitate prüfen/kennzeichnen; tatsächliche Zusatzlektüre dokumentieren'],
        'holdsDe': ['Vorliegend keine eigenständige Lernendenrecherche oder tatsächliche fremde Zusatzlektüre', 'Präsentation ist gesonderte Leistung und nicht automatisch durch Recherche erledigt'],
    },
    'upper-source-criticism': {
        'spans': [18, 26],
        'reasonDe': 'K3/K4 trägt Quellen-/Darstellungsvergleich und Validität. Dafür dürfen Quellen bereitgestellt werden. B2/B4 verlangt zusätzlich selbständig beschaffte Quellen, Relevanz, Vertrauenswürdigkeit und Autorenintention. Die vorhandenen Kritikfälle stellen Quellen fertig bereit; sie belegen diesen Beschaffungsoperator allein nicht. Das neue vollständige Zusatzzeugnis b2-own-retrieval-source-criticism bindet genau diese B2-Route, ohne Eigenrecherche als universelle Voraussetzung des K3/K4-Produkts einzuführen.',
        'actionsDe': ['Aussagen, fachliche Relevanz, Vertrauenswürdigkeit, Urheberschaft/Intention und Frageeignung vergleichen', 'Für B2/B4 zusätzlich tatsächliche selbständige Quellenbeschaffung und Auswahl mit Fundstellenlog nachweisen'],
        'holdsDe': ['Bestehende bereitgestellte Quellenfälle sind allein kein Beschaffungsnachweis für B2/B4', 'Keine institutionelle Herkunft allein als Wahrheitsbeweis', 'Keine zusätzliche universelle requires-Kante erzeugt'],
        'supplementaryCaseKeys': ['b2-own-retrieval-source-criticism'],
    },
    'upper-chemical-effects-sustainability': {
        'spans': [31, 33],
        'reasonDe': 'B10 und B12/B13 tragen gesellschaftliche/ökologische Bedeutung und historische/aktuelle Wirkungen von Produkten, Methoden, Verfahren und Erkenntnissen in drei Nachhaltigkeitsdimensionen einschließlich eigenen Handelns. Beide unveränderten ganzen Fälle bewahren diese Union. Die historische Sachquelle ist jeweils getrennt von autorierten Modellindikatoren zu prüfen; hier wird keine fremde historische Quelle neu freigegeben.',
        'actionsDe': ['Produkt, Methode, Verfahren und Erkenntnis mit historischen/aktuellen Folgen verbinden', 'Ökologische, ökonomische und soziale Perspektive einschließlich Zielkonflikten und eigenen Handelns begründet bewerten'],
        'holdsDe': ['Keine vollständige reale Ökobilanz aus Lehrindikatoren', 'Historische Fallquellen und unverändert gültige frühere Nachweise bleiben gesondert gebunden', 'Originale Partner für Handlungsoptionen und gesellschaftliche Einordnung bleiben erhalten'],
    },
    'upper-model-use-criticism': {
        'spans': [4, 9, 10, 11, 13],
        'reasonDe': 'S8/S15 trägt Gleichgewichtsmodellierung, E7 Wahl/Nutzung von Real-/Denkmodellen, E9 Modellgrenzen. E4/E5 bietet die ausdrückliche Modellalternative; E6 stützt die digitale Modellierungs-/Rechenanwendung. Das neue Zusatzzeugnis ga-dynamic-equilibrium-model-use bindet den dynamischen Prozess an eine tatsächlich selbst erzeugte Modellrechnung und analoge Prozessdarstellung. Die vorhandenen Atom/PSE- und Molekül/Rezeptor/Enzym-Fälle bleiben als verschiedene Kontexte erhalten. Weder der GA-Gleichgewichtsfall noch eine einzelne Quelle deckt diese gesamte Kontextunion.',
        'actionsDe': ['Geeignete Modelle tatsächlich analog/digital nutzen, Hypothese/Aussage damit prüfen und Grenzen begründen', 'Gleichgewichts-Stoffzustand und fortlaufende gegenläufige Teilchenprozesse unterscheiden', 'Atom/PSE- und komplexe Molekül-/Bindungs-/Rezeptor-/Enzymkontexte nicht durch Gleichgewichtsrechnung ersetzen'],
        'holdsDe': ['Modellleistung ist kein ausgeführtes Experiment', 'Katalysatoren, sämtliche Einflussfaktoren und alle ganzen Originalpartner nicht durch den begrenzten Modellbeitrag erledigt', 'C11-Molekül-/Wirkstoff-/Enzymquelle, EA/J13 und nationale Union bleiben gesondert offen'],
        'supplementaryCaseKeys': ['ga-dynamic-equilibrium-model-use'],
    },
    'chemical-representation-transformation': {
        'spans': [19],
        'reasonDe': 'K5/K6/K7/K9 verlangt tatsächliche Auswahl/Aufbereitung, Überführung, Reflexion und korrekte Alltags-/Fachsprache. Die unveränderten Fälle liefern echte eigene Prozess-/Teilchen- oder digitale Datendarstellungsprodukte und verlangen adressatenbezogene Begründung. Der vorhandene ganze Sprach-/Symbolpartner bleibt in der ursprünglichen Zeile; eine Darstellung oder das spezielle Molekülformelziel ersetzt nicht alle Sprach-/Kontextpflichten.',
        'actionsDe': ['Tatsächliches neues adressaten-/situationsgerechtes Darstellungsprodukt erstellen', 'Fachsprache, Bezugsgrößen und Darstellungswahl sowie bewahrte/begrenzte Aussagen begründen'],
        'holdsDe': ['Bloßes Lesen/Kopieren ist keine Überführung', 'Ein Klasse-8-Publikum bestimmt nicht die curriculare Stufe der leistenden Person', 'Originaler ganzer Fach-/Symbolsprachpartner und weitere Stufen bleiben erhalten'],
    },
    'chemical-presentation': {
        'spans': [22],
        'reasonDe': 'K11 nennt Sachverhalte sowie Lern-/Arbeitsergebnisse und analoge/digitale Medien. Beide vorhandenen Fälle verlangen tatsächliche Präsentation eigener Vorarbeit mit beiden Medien und Zuhörer-/Moderatorreceipt. Ein eigenes Laborexperiment ist dafür keine universelle Voraussetzung. Eine vorbereitete Präsentationsvorlage ist kein ausgeführter Vortrag.',
        'actionsDe': ['Chemischen Sachverhalt und eigene Lern-/Arbeitsergebnisse tatsächlich mit analogem und digitalem Medium präsentieren', 'Aufbau, Darstellung und Medium für Adressat/Situation begründen und Produkte/Ablauf dokumentieren'],
        'holdsDe': ['Vorliegend keine eigene Präsentation, Publikumsreaktion oder Host-/Human-Abnahme', 'Fertige Folien, gelesener Mustertext oder Fremdarbeit sind kein eigener Präsentationsnachweis'],
    },
}


def supplemental_cases():
    common = {'status': 'ai_candidate', 'reviewStatus': 'needs_human_review', 'evidenceLevel': 'E1',
              'generationLevel': 'G1', 'materialOrigin': 'SkillPilot-authored bounded source witness; no performed learner work',
              'learnerPerformanceRecorded': False, 'humanApproval': False, 'humanTrial': False,
              'nativeEvidenceApproved': False, 'strictCompletionsAdded': 0}
    return [dict(common, caseKey='b2-own-retrieval-source-criticism', candidateKey='upper-source-criticism',
        prospectiveCandidateGoalId='36666b4a-97af-51fc-9983-56cdcc7a8229', sourceSpan='C12-GA.1.26',
        suppliedMaterial={
            'de': 'Offen fiktives Lehrarchiv mit sechs vorhandenen, unveränderten Dokumenten. Physischer Katalog/gedruckte A- und D-Blätter und digitaler Katalog/B,C,E,F-Dateien stehen bereit, aber keine passende Quellenkombination ist vorgewählt. Frage: Was tragen Quellen zur pH-abhängigen scheinbaren Löslichkeit der Modellsäure Q und zur Werbeaussage Q ist immer besser bei? Q ist kein Arzneimittel. Die lernende Person muss relevante Quellen selbst auffinden, auswählen und tatsächlich beschaffen. Kataloghilfe ist kein vorweggenommener eigener Beschaffungsnachweis.',
            'en': 'An openly fictional teaching archive contains six existing unchanged documents. A physical catalogue/printed A and D sheets and digital catalogue/B,C,E,F files are available, but no suitable combination is preselected. Question: What do the sources support about pH-dependent apparent solubility of model acid Q and the advertising claim Q is always better? Q is not a medicine. The learner must independently find, select and actually retrieve relevant sources. Catalogue assistance is not proof of own retrieval.'},
        existingExactResourceBindings=[bind(DOSSIER / n) for n in ['analog-a-acid-model.md', 'analog-d-process-model.md', 'digital-b-solubility.tsv', 'digital-c-advertisement.md', 'digital-e-process.tsv', 'digital-f-policy.md']],
        learnerTask={
            'de': 'Formuliere eigene Suchbegriffe, beschaffe selbst geeignete physische und digitale Quellen und protokolliere Auswahl, Urheber, Fundstelle und tatsächlichen Leseweg. Vergleiche ihre Aussagen, fachliche Relevanz, Vertrauenswürdigkeit und Intention für beide Fragen. Erkläre, weshalb gegebenenfalls verworfene Quellen ungeeignet sind. Trenne Modellrechnung, Werbeaussage und unbelegten Wirksamkeitsanspruch.',
            'en': 'Choose your own search terms, independently retrieve suitable physical and digital sources and log selection, author, location and actual reading path. Compare claims, scientific relevance, trustworthiness and intent for both questions. Explain why rejected sources are unsuitable. Distinguish model calculation, advertising and unsupported efficacy claims.'},
        expectedAnswer={
            'de': 'Ein möglicher selbst gewählter Weg findet A1/A2, B und C. A definiert pKa 4,0 und S0 1,0 mg/L; B enthält bei pH 3/4/5 Modellwerte 1,1/2,0/11,0 mg/L. Übereinstimmung ist rechnerisch plausibel, aber B ist vom selben Lehrmodell abgeleitet und kein unabhängiger experimenteller Beweis. A/B eignen sich unter den benannten Annahmen für die chemische Modellfrage; C hat Werbeintention und keine Bezugsgröße, Methode oder Wirkungsdaten. D/E/F betreffen einen anderen Prozess und sind für Qs Löslichkeit keine passenden Belege. Keine Datei zeigt klinische Wirksamkeit oder sichere Einnahme. Der wirkliche Beschaffungs-/Leselog muss vom Lernenden stammen; Musterantwort ersetzt ihn nicht.',
            'en': 'One possible independently chosen path retrieves A1/A2, B and C. A defines pKa 4.0 and S0 1.0 mg/L; B gives model values 1.1/2.0/11.0 mg/L at pH 3/4/5. Agreement is mathematically plausible, but B derives from the same teaching model and is not independent experimental proof. A/B suit the chemical model question under the stated assumptions; C has advertising intent without reference quantity, method or efficacy data. D/E/F concern another process and are unsuitable evidence for Q solubility. No file establishes clinical efficacy or safe ingestion. Actual retrieval/reading logs must come from the learner; a reference answer cannot replace them.'},
        requiredAssessmentCriteria=[
            {'criterionKey': 'B2-own-procurement', 'meaning': {'de': 'Eigene tatsächliche Beschaffung/Auswahl mit überprüfbaren physischen und digitalen Fundstellen.', 'en': 'Own actual retrieval/selection with checkable physical and digital locations.'}},
            {'criterionKey': 'B2-relevance-intent-validity', 'meaning': {'de': 'Aussage, Relevanz, Vertrauenswürdigkeit und Autorenintention werden sachbezogen verglichen.', 'en': 'Claims, relevance, trustworthiness and author intent are specifically compared.'}},
            {'criterionKey': 'B2-no-independent-proof-invention', 'meaning': {'de': 'Zwei vom selben Modell abgeleitete Dokumente werden nicht als unabhängiger Messbeweis ausgegeben.', 'en': 'Two documents derived from one model are not presented as independent measurement evidence.'}}],
        transfer={'de': 'Eine weitere selbst gefundene Quelle nennt eine feste Salzphase. Erläutere anhand der Modellannahmen, welche bisherigen Aussagen neu geprüft werden müssen; unbelegte zusätzliche Quelle nicht erfinden.', 'en': 'A further independently found source specifies a solid salt phase. Use the model assumptions to explain which prior claims need rechecking; do not invent an unsupported additional source.'},
        sourceSpecificCompletionCondition={'requiresActualOwnRetrieval': True, 'ownRetrievalSuppliedNow': False, 'appliesOnlyToB2B4Route': True, 'newUniversalPrerequisite': False}),
      dict(common, caseKey='ga-dynamic-equilibrium-model-use', candidateKey='upper-model-use-criticism',
        prospectiveCandidateGoalId='86d34f1f-692d-5522-a9a4-a71c65b24de7', sourceSpans=['C12-GA.1.4', 'C12-GA.1.9', 'C12-GA.1.10', 'C12-GA.1.13'],
        suppliedMaterial={
            'de': 'Offen definiertes geschlossenes Zwei-Zustands-Lehrmodell A ⇌ B mit insgesamt 100 Teilchen bei fester Temperatur. Pro Zeitschritt wird im Modell erwartungsgemäß ein Anteil p=0,20 von jedem Zustand in den anderen übertragen. Erwartete Übergänge sind rHin=0,20·NA und rRück=0,20·NB; NAneu=NA−rHin+rRück und NBneu=NB+rHin−rRück. Bruchteile sind Erwartungszahlen, keine einzelnen realen Teilchen oder Messwerte. Blankes Papier/100 zweifarbige Marken und leere Tabellenkalkulation stehen bereit. Zwei Starts: 50/50 und 60/40. Die vorgeschlagenen Modellparameter sind autoriert, nicht gemessene Geschwindigkeitskonstanten.',
            'en': 'An openly defined closed two-state teaching model A ⇌ B contains 100 particles at fixed temperature. In each model time step an expected fraction p=0.20 moves from each state to the other. Expected transitions are rForward=0.20·NA and rReverse=0.20·NB; NAnew=NA−rForward+rReverse and NBnew=NB+rForward−rReverse. Fractions are expected counts, not individual real particles or measurements. Blank paper/100 two-colour tokens and an empty spreadsheet are supplied. Starts are 50/50 and 60/40. Proposed model parameters are authored, not measured rate constants.'},
        learnerTask={
            'de': 'Erzeuge und nutze selbst eine Tabelle für beide Starts mit getrennten Hin-/Rückübergängen und mindestens drei Zustandszeilen. Stelle einen 50/50-Schritt analog mit zehn Übergängen in jede Richtung dar. Prüfe die Aussage unveränderte Stoffmengen bedeuten keine Reaktion und begründe Stoff-/Teilchenebene, Erhaltung und Modellgrenzen. Digitales Modellprodukt und eigene analoge Darstellung dokumentieren; es findet kein chemischer Versuch statt.',
            'en': 'Independently create and use a table for both starts with separate forward/reverse transitions and at least three state rows. Represent one 50/50 step with ten transitions in each direction using the analogue model. Test the claim unchanged amounts mean no reaction and justify macroscopic/particle levels, conservation and model limitations. Document own digital model product and analogue representation; no chemical experiment takes place.'},
        expectedAnswer={
            'de': 'Start 50/50: Hin/Rück jeweils 10, neuer Zustand 50/50 trotz fortlaufender gegenläufiger Übergänge. Start 60/40: Hin/Rück 12/8, danach 56/44; nächster Schritt 11,2/8,8, danach 53,6/46,4. Summe bleibt 100. Die Stoffzustandsgrößen können unverändert sein, während Teilchenprozesse fortlaufen. Das diskrete Erwartungsmodell vereinfacht Zufall, Energie, Stoffidentität und reale Kinetik. p=0,20 ist kein Messwert und die Rechnung kein Experiment. Eigene Datei/analoge Nutzung muss wirklich vorliegen; fertige Referenzzahlen allein sind keine Modellanwendung. Dieser Teilbeitrag ersetzt weder sämtliche Einflussfaktoren/Katalysatoren noch Atom/PSE- und Molekül/Rezeptor/Enzymkontexte.',
            'en': 'At 50/50, forward/reverse transitions are 10 each and the new state stays 50/50 despite continuing opposing transitions. At 60/40, forward/reverse transitions are 12/8, giving 56/44; the next step has 11.2/8.8 transitions, giving 53.6/46.4. Total remains 100. Macroscopic state quantities may stay constant while particle processes continue. The discrete expectation model simplifies randomness, energy, substance identity and real kinetics. p=0.20 is not measured and calculation is not an experiment. Own file/analogue use must actually exist; supplied reference numbers alone are not model application. This contribution replaces neither all influences/catalysts nor atomic/periodic and molecule/receptor/enzyme contexts.'},
        requiredAssessmentCriteria=[
            {'criterionKey': 'GA-own-model-use', 'meaning': {'de': 'Tatsächlich eigene digitale Tabelle und analoge Prozessdarstellung als Produkte.', 'en': 'Actual own digital table and analogue process representation as products.'}},
            {'criterionKey': 'GA-dynamic-equilibrium', 'meaning': {'de': 'Gegenläufige gleiche Prozesse und unveränderte Stoffgrößen korrekt unterscheiden.', 'en': 'Correctly distinguish equal opposing processes from unchanged macroscopic quantities.'}},
            {'criterionKey': 'GA-conservation-and-expectation', 'meaning': {'de': 'Gesamtzahl 100 und gebrochene Erwartungszahlen werden korrekt begrenzt.', 'en': 'Total 100 and fractional expected counts are correctly bounded.'}},
            {'criterionKey': 'GA-model-branch-not-lab', 'meaning': {'de': 'Modellzweig, reale Durchführung und ungeprüfte weitere Kontexte wahrheitsgemäß trennen.', 'en': 'Honestly distinguish model branch, actual execution and uncovered contexts.'}}],
        transfer={'de': 'Beide Übergangsanteile werden im Lehrmodell gleich auf 0,30 erhöht. Prüfe mit eigener Tabelle, was beim 50/50-Zustand und bei der Annäherung von 60/40 anders ist; daraus keinen ungeprüften realen Katalysatornachweis ableiten.', 'en': 'Both teaching-model transition fractions are equally increased to 0.30. Use an own table to test what changes at 50/50 and while approaching from 60/40; do not infer an unreviewed real catalyst demonstration.'},
        sourceSpecificCompletionCondition={'requiresActualOwnModelProducts': True, 'ownModelProductsSuppliedNow': False, 'realExperimentPerformed': False, 'allOriginalSourcePartnersCleared': False})]


def main():
    assert ROOT.joinpath('AGENTS.md').is_file(), ROOT
    assert not (OUT / 'author.first.freeze.json').exists(), 'Do not overwrite a sealed first author packet'
    source, mapping, snapshot, gaps, state, active = map(read, [SOURCE, MAPPING, SNAPSHOT, GAPS, STATE, ACTIVE])
    input_paths = [SOURCE, MAPPING, PRIMARY, SNAPSHOT, GAPS, STATE, ACTIVE]
    for key in ['currentWhole504Source', 'nativeBindings', 'profilesSource', 'casesSource']:
        supplied = snapshot[key]
        assert bind(Path(supplied['path'])) == supplied
        input_paths.append(Path(supplied['path']))
    for supplied in state['sourceInputBindings'].values():
        assert bind(Path(supplied['path'])) == supplied
        input_paths.append(Path(supplied['path']))
    input_paths += sorted(DOSSIER.iterdir())
    before = {str(p): bind(p) for p in set(input_paths)}
    current_ids = {g['id'] for g in active['goals']}
    canonical_candidate = read(Path(snapshot['currentWhole504Source']['path']))
    candidate_ids = {g['id'] for g in canonical_candidate['goals']}
    bodies = {r['candidateKey']: (i, r) for i, r in enumerate(snapshot['routineBodies'])}
    by_span = {s['sourceSpan']: (i, s) for i, s in enumerate(source['sourceGoals'])}
    whole_rows, rows = {}, []
    for key, plan in PLANS.items():
        index, body = bodies[key]
        goal = body['wholeGoal']
        assert goal['id'] not in current_ids and goal['id'] in candidate_ids
        assert len(body['wholeTwoCases']) == 2
        assert set(body['wholeProfile']['caseKeys']) == {c['caseKey'] for c in body['wholeTwoCases']}
        components = []
        for number in plan['spans']:
            span = f'C12-GA.1.{number}'
            sindex, sg = by_span[span]
            matching = [(i, d) for i, d in enumerate(mapping['decisions']) if d['sourceGoalId'] == sg['id']]
            assert len(matching) == 1
            didx, decision = matching[0]
            edges = [(i, e) for i, e in enumerate(mapping['mappings']) if e['legacyGoalId'] == sg['id']]
            assert set(decision['canonicalGoalIds']) == {e['canonicalGoalId'] for _, e in edges}
            occurrence = next(o for o in sg['sourceOccurrences'] if o['sourceSpan'] == span)
            assert occurrence['topicCode'] == 'C12-GA.1'
            whole_rows[sg['id']] = {
                'originalSourceGoalId': sg['id'], 'originalSourceSpan': span,
                'wholeOriginalSourceGoal': value_ref(SOURCE, f'/sourceGoals/{sindex}', sg),
                'wholeOriginalPassage': value_ref(SOURCE, '/passages/' + str(next(i for i,p in enumerate(source['passages']) if p['id'] == sg['passageId'])), next(p for p in source['passages'] if p['id'] == sg['passageId'])),
                'wholeOriginalDecision': value_ref(MAPPING, f'/decisions/{didx}', decision),
                'allOriginalPartnerGoalIds': decision['canonicalGoalIds'],
                'allOriginalCompatibleEdges': [e for _,e in edges],
                'allOriginalSourceOccurrencesPreserved': sg['sourceOccurrences'],
                'originalWholeDutyAndPartnersRetained': True,
                'wholeSourceDutyStatus': 'UNCHANGED_AND_NOT_CLEARED_BY_THIS_PACKET',
            }
            components.append({
                'originalSourceGoalId': sg['id'], 'sourceSpan': span,
                'exactWholeOriginalSourceRowKey': sg['id'],
                'exactReadOccurrence': occurrence,
                'scope': {'jurisdiction': 'DE-BY', 'stage': 'SekII', 'grade': '12',
                          'actualCourse': 'grundlegendes Anforderungsniveau', 'compatibilityProfile': 'GK',
                          'topicCode': 'C12-GA.1', 'nativeDeduplicatedCourseUnionNotAdopted': True},
                'matchType': 'partial', 'componentOnly': True, 'scopedNoWholeSourceClearance': True,
                'standardEdgeProposal': {'legacyGoalId': sg['id'], 'canonicalGoalId': goal['id'],
                                         'matchType': 'partial', 'reviewDecisionId': sg['id']},
                'edgeApplicationBoundary': 'Proposal only for the named occurrence/component; never replace or globally append to the deduplicated whole source row without reviewed ordinary scope/atlas integration.',
                'status': 'UNGEPRUEFT/HOLD',
            })
        rows.append({
            'candidateKey': key, 'prospectiveGoalId': goal['id'],
            'operativeFamilyGoalId': goal['extendedData']['provenance']['splitFromCanonicalGoalId'],
            'existsInCurrent378AtomicUniverse': False,
            'wholeGoalInput': value_ref(SNAPSHOT, f'/routineBodies/{index}/wholeGoal', goal),
            'wholeProfileInput': value_ref(SNAPSHOT, f'/routineBodies/{index}/wholeProfile', body['wholeProfile']),
            'wholeTwoCasesInput': value_ref(SNAPSHOT, f'/routineBodies/{index}/wholeTwoCases', body['wholeTwoCases']),
            'existingWholeCaseKeys': [c['caseKey'] for c in body['wholeTwoCases']],
            'sourceComponents': components,
            'authorSourceJustificationDe': plan['reasonDe'],
            'requiredObservablePerformanceDe': plan['actionsDe'],
            'genuineRemainingBoundariesDe': plan['holdsDe'],
            'supplementaryAuthoredCaseKeys': plan.get('supplementaryCaseKeys', []),
            'componentOnly': True, 'scopedNoWholeSourceClearance': True,
            'status': 'UNGEPRUEFT/HOLD', 'requiredIndependentReviews': 2, 'completedIndependentReviews': 0,
        })
    assert len(rows) == 12 and len(whole_rows) == 21
    supplemental = supplemental_cases()
    write('twelve-bounded-BY12-GA-source-roles.author-candidate.json', {
        'schemaVersion': 1, 'role': 'Twelve bounded source-role author candidates, not active mapping/review records',
        'createdAtUTC': STAMP, 'status': 'UNGEPRUEFT/HOLD', 'rows': rows,
        'twelveProspectiveChildren': 12, 'current378GoalsAdded': 0,
        'wholeSourceRows': list(whole_rows.values()), 'wholeSourceRowsCount': len(whole_rows),
        'partialComponentRelations': sum(len(r['sourceComponents']) for r in rows),
        'additionalTargetedContributions': ['E4/E5 model alternative at model child', 'E6 digital calculation/model contribution at quantitative/model children'],
        'wholeSource19Complete': False, 'remainingSource19Children': [r for r in state['plannedWholeGoalRoutes'] if r['candidateKey'] not in PLANS],
        'wholeSourceOrNationalAtlasClearance': False, 'activeWrites': 0,
        'strictM7NetGain': 0, 'newScientificCompletions': 0, 'restoredBindings': 0,
        'humanApproval': False, 'humanTrial': False,
    })
    write('two-targeted-source-witnesses.de-en.author-candidate.json', {
        'schemaVersion': 1, 'role': 'Two supplementary complete source-specific author witnesses, not P2 approvals',
        'status': 'UNGEPRUEFT/HOLD', 'cases': supplemental,
        'existing24WholeCasesChanged': False, 'existing12WholeProfilesChanged': False,
        'wholeGoalOrSourceApproval': False, 'activeWrites': 0, 'strictM7NetGain': 0,
    })
    write('actual-reading-and-small-input-freeze.author.json', {
        'schemaVersion': 1, 'role': 'Actual author reading and byte-bound existing whole inputs, no independent science approval',
        'createdAtUTC': STAMP, 'author': '/root/ci_status_determinism_review',
        'primaryReading': {'binding': bind(PRIMARY), 'officialURL': 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/chemie/grundlegend',
                           'retainedEntirePageRead': True, 'LB1AndLB2To8Read': True, 'freshOfficialFetchThisTask': False,
                           'originalWholePageCopied': False, 'scopeLimitedToActualGA12Page': True},
        'wholeInputsRead': {'DEENGoals': 12, 'DEENProfiles': 12, 'DEENCases': 24,
                           'exactRepeatedStringValuesReadOnce': True, 'wholeOriginalSourceRows': 21,
                           'wholeOriginalDecisionAndAllPartnerSetsRead': True, 'authoredDossierFiles': 6},
        'bindings': list(before.values()),
        'inputFilesCopied': 0, 'existingInputsChanged': False,
        'historicalSource19CheckpointPreserved': True, 'historicalReviewVerdictsPromoted': False,
        'readOnlySourcePreparationApproval': False,
    })
    entry = {
        'schemaVersion': 1, 'role': 'Neutral exact input entry for two fresh independent source/operator/scope reviews',
        'status': 'UNGEPRUEFT/HOLD',
        'candidate': bind(Path(OUT.relative_to(ROOT)) / 'twelve-bounded-BY12-GA-source-roles.author-candidate.json'),
        'supplementaryCompleteCases': bind(Path(OUT.relative_to(ROOT)) / 'two-targeted-source-witnesses.de-en.author-candidate.json'),
        'wholeInputsAndActualPrimaryReading': bind(Path(OUT.relative_to(ROOT)) / 'actual-reading-and-small-input-freeze.author.json'),
        'reviewRequired': ['Read the entire retained GA12 primary page and original extraction source goals/passages',
                           'Read all twelve complete DE/EN goals/profiles and24 unchanged whole cases via bound pointers',
                           'Read both complete new DE/EN source witnesses independently',
                           'Judge each exact source component/operator and GA12 scope, including practical/model alternative, own source procurement, own investigation and observable products',
                           'Preserve entire original decisions/partner sets and source occurrences; no whole-source clearance from one child/component',
                           'Reach an independent first verdict before reading the peer verdict; HOLD unresolved findings'],
        'noNativeD_P_A_M_VOrAtlasApproval': True, 'requiredIndependentReviews': 2,
        'source19RemainingChildren': 7, 'source19WholeStatus': 'HOLD',
        'strictM7NetGain': 0, 'activeWrites': 0, 'humanApproval': False, 'humanTrial': False,
    }
    write('neutral-twelve-source-roles.review.entry.json', entry)
    spec = importlib.util.spec_from_file_location('ordinary_validate_schemas', ROOT / 'scripts/validate_schemas.py')
    normal = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(normal)
    schema = read(Path('docs/landscape-runtime.schema.json'))
    checked = sorted(OUT.glob('*.json'))
    assert all(normal.validate_file(str(p), schema) for p in checked)
    assert all(bind(Path(path)) == witness for path,witness in before.items())
    for row in rows:
        for component in row['sourceComponents']:
            assert component['scope']['grade'] == '12' and component['scope']['compatibilityProfile'] == 'GK'
            assert component['exactReadOccurrence']['sourceSpan'].startswith('C12-GA.1.')
        assert all(c['status'] == 'ai_candidate' and c['learnerPerformanceRecorded'] is False for c in bodies[row['candidateKey']][1]['wholeTwoCases'])
    assert len(entry['reviewRequired']) == 6
    assert (60 - .2*60 + .2*40, 40 + .2*60 - .2*40) == (56.0, 44.0)
    assert abs((56 - .2*56 + .2*44) - 53.6) < 1e-12
    write('targeted-normal-json-and-binding-check.actual.json', {
        'role': 'Executed ordinary validate_file JSON checks and narrow mechanical input/scope guards; no science verdict',
        'checkedJSONFiles': [bind(Path(p.relative_to(ROOT))) for p in checked],
        'ordinaryValidateFilePass': len(checked), 'allFrozenExistingInputsRemainExact': True,
        'prospectiveIDsNotInCurrent378': len(rows), 'allOriginalPartnerEdgesPreserved': True,
        'allSourceOccurrencesPreserved': True, 'allProposalsOnlyGA12AndGKCompatibility': True,
        'newModelReferenceArithmeticChecked': True, 'symlinksCreated': 0,
        'fullRepositoryQSRun': False, 'nativeAtlasCompiled': False,
        'scientificOrIndependentReviewApproval': False, 'strictM7NetGain': 0,
    })
    print(json.dumps({'authorCandidates': len(rows), 'originalWholeSourceRows': len(whole_rows),
                      'partialComponentRelations': sum(len(r['sourceComponents']) for r in rows),
                      'newWholeSupplementaryDEENCases': len(supplemental), 'targetedNormalJSONChecksPassed': len(checked),
                      'source19Status': 'HOLD', 'activeWrites': 0, 'strictM7NetGain': 0}))


if __name__ == '__main__':
    main()
