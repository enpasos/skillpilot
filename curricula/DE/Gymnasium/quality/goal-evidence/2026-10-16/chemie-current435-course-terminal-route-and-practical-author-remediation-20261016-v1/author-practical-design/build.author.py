#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Serialize six AUTHOR drafts after the separately pinned plan freeze.

The task text is SkillPilot knowledge-landscape content, CC-BY-4.0.
This script performs consistency checks, never independent content review.
"""
from pathlib import Path
import copy
import hashlib
import json
import os

BASE = Path(__file__).resolve().parent
ROOT = BASE.parent
REPO = next(p for p in BASE.parents if (p / 'AGENTS.md').is_file())
SOURCE = REPO / 'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
PIN = '6bed948af8d0ba47d722fb6205bacba6f8792e233f58c1772366395dd8450d8e'
PLAN = ROOT / 'PLAN.first-evidence-course-routes-before-candidates.author-frozen.json'
PLAN_PIN = 'bcd0f514ed7f66b950b8a5f2aaac9fef9aa2b262fa89aed5de921de2fe9511d6'
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == PIN
assert hashlib.sha256(PLAN.read_bytes()).hexdigest() == PLAN_PIN
stock = json.loads(SOURCE.read_text())
goals = {g['id']: g for g in stock['goals']}
assert len(goals) == 629

def encoded(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()

def atomic_json(name, value):
    destination = BASE / name
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_name(destination.name + '.tmp')
    temporary.write_bytes(encoded(value))
    os.replace(temporary, destination)

def whole_hash(goal):
    return hashlib.sha256(encoded(goal)).hexdigest()

TITRATION = '02634fdd-c8ba-591a-b240-77129b1bebb8'
CARBONYL = '973c12d9-d863-5292-8c68-9c80cdacf9e2'
SOAP = '6765f741-42a6-55c5-a218-81b883b1f5ae'
IPA = 'c91350bc-7d2e-523c-bd50-0324bccfcf98'
CAMP = 'bf6c39f0-1e44-53b2-8ff6-025f2e36e125'
ACID = '9746ff9a-c423-5504-9d4d-0fced93fa382'
FORCES = 'eb7537dd-d11b-50e9-a6d7-51a78e96fc4e'
PROPERTIES = '5a30273a-98d5-5163-bb16-c250b7ed4e7f'
ISOMERS = 'e9b61d96-a271-5e69-b872-8c463f822be1'
MICELLES = '6966df95-f125-5ecc-af8e-0442545d9f17'
WASHING = '1837690e-cfb1-5b1c-96c8-0fb40d6d5d69'
ARRHENIUS = '28bb9d15-f865-5843-a035-6066580fea64'
BRONSTED = '1c1420c2-a8e2-520f-8015-6df637a973bd'
STRENGTH = 'b4777001-f4ed-5fe9-9d98-02319abdea09'
FORMULAS = 'e7c363d4-e02d-4895-8750-ba62c2eb63fe'
MOL = '1dc15fa2-fca4-56b0-b5c1-4d215613dde0'
MOLAR_MASS = '8a2ad724-df5e-5986-8de9-560ba43caac2'
EQUATIONS = '11bea4c6-7b8a-47e0-8293-2eb1ce34cf66'

PRACTICAL_IDS = {
    TITRATION: '7fece532-d052-5633-b24e-ca5595fd76d0',
    CARBONYL: '27045f71-10ed-57d3-ac99-cfbe5d6b515a',
    SOAP: 'ac75b416-70d5-50f8-a913-475943d21a55',
}
NOTE = ('AUTHOR draft only; no independent content review or release. Two independent whole-task DE/EN, solution, scoring and current-context reviews remain open. E0/G0: no learner execution observed, no generated media, no Human Approval or Human Trial.')
COMMON_DE = '''**Arbeitskanäle und erforderlicher Nachweis**

Diese praktische Prüfung findet ausschließlich im betreuten Fachraum statt, nachdem die verantwortliche Lehrkraft den konkreten Aufbau nach der aktuellen schulischen Gefährdungsbeurteilung freigegeben und Schutz, Abbruch und Entsorgung erläutert hat. Die lokale Freigabe ist eine Voraussetzung für die Durchführung; dieses Aufgabenpaket erteilt sie nicht. Keine Durchführung zu Hause.

A: Lege vor Beginn deinen eigenen Plan vor. Die Lehrkraft prüft die sichere Ausführbarkeit; ihre Hinweise ersetzen keine zu bewertende fachliche Planung. B: Führe die Handlungen selbst aus und führe unmittelbar ein eigenes Rohdaten-/Beobachtungsprotokoll. Eine beaufsichtigende Fachperson muss die jeweils genannten Kernhandlungen tatsächlich beobachten und deren Durchführung eindeutig dem Versuch zuordnen können. C: Reiche Plan, eigenes Protokoll, überprüfbaren Durchführungsnachweis und fachliche Auswertung gemeinsam ein. Keine Namen, Fotos von Personen oder private Kontaktdaten sind nötig.

Bloße Beschreibung, Selbstauskunft, simulierte Daten, Videozuschauen und abgeschriebene Musterwerte ersetzen die Durchführung nicht. Ohne überprüfbaren Nachweis der vollständigen Kernhandlungen gibt es für die damit verbundenen Rubrikzeilen keine Durchführungspunkte und die praktische Prüfung ist nicht bestanden; die praktische Kompetenz bleibt offen. Ein Sicherheitsabbruch wird als solcher dokumentiert. Abweichende eigene Daten sind nach fachlicher Plausibilität, Messgrenzen und Umgang mit Fehlern zu bewerten, nicht nach Gleichheit mit Musterzahlen. Für einen erfolgreichen Abschluss müssen alle fünf Rubrikzeilen vollständig erfüllt sein: 10 von 10 BE. Fachlich gleichwertige begründete Darstellungen werden anerkannt.
'''
COMMON_EN = '''**Work channels and required evidence**

This practical assessment takes place only in a supervised teaching laboratory after the responsible teacher has authorized the actual setup under the current local risk assessment and explained protection, stopping conditions and disposal. Local authorization is a prerequisite to execution; this task package does not grant it. Do not perform it at home.

A: Submit your own plan before starting. The teacher checks safe feasibility; safety guidance does not replace the subject planning being assessed. B: Perform the actions yourself and keep your own immediate raw-data/observation record. A supervising qualified person must actually observe the specified core actions and be able to associate the execution evidence with the experiment. C: Submit the plan, own records, verifiable execution evidence and scientific evaluation together. Personal names, photographs of people and private contact details are unnecessary.

Descriptions, self-report, simulated data, watching a video and copied model values cannot replace execution. Without verifiable evidence of all core actions, the corresponding rubric rows receive no execution credit and the practical assessment is not passed; practical competence remains open. Record a safety stop as such. Evaluate differing own data using scientific plausibility, measurement limits and treatment of errors, rather than identity with model numbers. Completion requires all five rubric rows in full: 10/10 points. Scientifically equivalent justified representations are accepted.
'''

practical = []
matrix = []

def practical_goal(ordinary, title, title_en, description, description_en, task, task_en, solution, solution_en, criteria):
    atom = goals[ordinary]
    phase = atom.get('phase', atom['dimensionTags']['phase'])
    gid = PRACTICAL_IDS[ordinary]
    candidate = {
        'id': gid,
        'shortKey': 'canonical_chemistry_practical_terminal_' + ordinary.split('-')[0],
        'title': title, 'titleEn': title_en,
        'description': description, 'descriptionEn': description_en,
        'applicability': copy.deepcopy(atom['applicability']),
        'type': 'atomic', 'nodeKind': 'exam', 'phase': phase,
        'weight': 1, 'core': True, 'contains': [], 'requires': [ordinary],
        'examples': [], 'resourceLinks': [],
        'tags': ['canonical', 'SekII', 'GK', 'LK', 'Practice', 'Assessment', 'ExamTask', 'phase:' + phase],
        'dimensionTags': {'framework': 'canonical-gymnasium-chemistry', 'demandLevel': 'AB2', 'phase': phase, 'area': 'Experimentelle Chemie', 'processCompetencies': ['PK1_EXPERIMENTIEREN'], 'guidingIdeas': ['BC_REAKTION']},
        'sourceRef': str((BASE / ('wholegoals/' + gid + '.author-draft.json')).relative_to(REPO)),
        'extendedData': {
            'applicabilityFromRequires': True,
            'applicabilityMappingInheritance': 'boundary',
            'authorDraft': {'role': 'AUTHOR; no self-review', 'planSHA256': PLAN_PIN, 'sourceCanonicalSHA256': PIN, 'ordinaryGoalId': ordinary, 'sourceScope': 'Exactly the current ordinary prerequisite applicability; actual learner-view placement is a separate parent task.', 'independentCurrentTaskReviews': 0, 'requiredIndependentCurrentTaskReviews': 2, 'actualLearnerPerformanceClaimed': False, 'humanApproval': False, 'humanTrial': False, 'assetClass': 'E0/G0'},
        },
        'examData': {'reviewStatus': 'draft', 'reviewNote': NOTE, 'coveredGoalIds': [ordinary], 'coveredStrands': ['BC_REAKTION'], 'demandLevels': ['AB1', 'AB2'], 'sourceArtifactPath': str((BASE / 'TASK-RUBRIC-COVERAGE.author.md').relative_to(REPO)), 'taskContent': COMMON_DE + '\n' + task, 'taskContentEn': COMMON_EN + '\n' + task_en, 'solutionContent': solution, 'solutionContentEn': solution_en, 'scoring': {'maxPoints': 10, 'passingPoints': 10, 'steps': [{'id': gid.split('-')[0] + '_s' + str(i), 'points': 2, 'description': de} for i, (de, en, aspects) in enumerate(criteria, 1)]}},
    }
    practical.append(candidate)
    matrix.append({'examGoalId': gid, 'kind': 'actual_practical', 'coveredGoalIds': [ordinary], 'requiresMeaning': 'Admission to this local practical endpoint, not proof of execution or mastery propagation.', 'rows': [{'stepId': step['id'], 'points': 2, 'criterionDe': de, 'criterionEn': en, 'goalIds': [ordinary], 'assessedAspects': aspects} for step, (de, en, aspects) in zip(candidate['examData']['scoring']['steps'], criteria)]})

practical_goal(TITRATION,
    'Eine Säure-Base-Titration praktisch planen, durchführen und auswerten',
    'Plan, perform and evaluate an acid-base titration',
    'Die lernende Person kann eine vorgegebene Modell-Säureprobe mit begründet gewählter Maßlösung und Indikator tatsächlich titrieren, eigene Volumina überprüfbar dokumentieren und daraus stöchiometrisch die Konzentration bestimmen.',
    'The learner can actually titrate a supplied model acid sample using a justified standard solution and indicator, document verifiable own volumes and determine the concentration stoichiometrically.',
    '''**Kontext und Material**

Bestimme die Konzentration einer von der Lehrkraft vorbereiteten wässrigen HCl-Modellprobe; angekündigter Bereich 0,080–0,120 mol/L. Es handelt sich um Laborlösungen, nicht um eine Untersuchung eines Menschen oder um ein Arzneimittel. Bereit stehen NaOH-Maßlösungen 0,1000 mol/L und 1,000 mol/L, eine 25-mL-Bürette (0,05-mL-Teilung), Stativ/Klemme, 20,00-mL-Vollpipette mit Pipettierhilfe, 250-mL-Erlenmeyerkolben, deionisiertes Wasser und eine weiße Unterlage. Indikatoroptionen: Bromthymolblau (pH 6,0–7,6; gelb → grün → blau), Phenolphthalein (pH 8,2–10,0; farblos → rosa). Die Lehrkraft stellt geeignete verdünnte Indikatorlösungen bereit. Für diese starke einprotonige Säure und starke Base liegt der Äquivalenzpunkt im verdünnten Modell bei 25 °C ungefähr bei pH 7; es gibt einen steilen pH-Sprung. Schutzbrille, Laborkleidung und gegebenenfalls Handschutz nach den tatsächlichen Sicherheitsdatenblättern; getrennte gekennzeichnete Sammlung nach Schulplan, keine Mundpipettierung. Keine konzentrierten Lösungen selbst herstellen.

**Aufgaben und Kernhandlungen**

1. Plane das Aliquot, wähle eine der Maßlösungen und begründe deine Wahl durch den erwarteten Verbrauchsbereich. Wähle und begründe einen Indikator; beschreibe Endpunktskriterium und 1:1-Reaktion. (2 BE)
2. Spüle Bürette/Pipette fachgerecht mit der jeweils einzufüllenden Lösung vor, baue die Bürette sicher senkrecht auf und entferne Luft aus der Spitze. Pipettiere 20,00 mL Probe mit Pipettierhilfe, gib etwa 20 mL deionisiertes Wasser und wenige Tropfen Indikator hinzu. Titriere unter Schwenken nahe dem Endpunkt tropfenweise; lies den Meniskus auf Augenhöhe ab. Die Lehrkraft beobachtet die eigene sichere Handhabung und Endpunktannäherung. Entsorge nach Anweisung. (2 BE)
3. Führe nach einer als Vorversuch gekennzeichneten Orientierung drei eigene auswertbare Bestimmungen mit frischen Aliquots durch. Notiere Anfangs-/Endstand und Differenz, Indikatorfarbe und Ableseauflösung unmittelbar. Prüfe die Streuung; bei mehr als 0,10 mL Spannweite kläre den Fehler, wiederhole gegebenenfalls und behalte alle Rohdaten. Diese Arbeitsgrenze ist ein Kriterium dieses Aufbaus. (2 BE)
4. Bestimme aus deinen auswertbaren eigenen Verbräuchen Mittelwert und Probenkonzentration mit Einheiten; erläutere, warum das zugegebene Wasser die Stoffmenge im Aliquot nicht ändert. (2 BE)
5. Fehlerfall: Eine neue Gruppe überschreitet den Endpunkt deutlich, übernimmt den größeren Verbrauch jedoch unverändert. Wie wird die berechnete HCl-Konzentration beeinflusst, und wie ist mit diesem Lauf umzugehen? (2 BE)

Leeres Protokollformat für jeden Lauf: Lauf-ID; Probenvolumen; Maßlösung/Konzentration; Indikator; Anfangsstand/mL; Endstand/mL; Verbrauch/mL; Endpunktbeobachtung; Abweichung/Abbruch; beobachtete Kernhandlungen. Hier sind keine Lernendenmesswerte eingetragen.''',
    '''**Context and materials**

Determine the concentration of a teacher-prepared aqueous HCl model sample, announced range 0.080–0.120 mol/L. These are laboratory solutions, not a human or medicine investigation. Available: NaOH standards 0.1000 and 1.000 mol/L; 25-mL burette with 0.05-mL graduations; stand/clamp; 20.00-mL volumetric pipette and filler; 250-mL conical flask; deionized water and white background. Indicator options: bromothymol blue (pH 6.0–7.6; yellow → green → blue) and phenolphthalein (pH 8.2–10.0; colourless → pink), supplied as suitable dilute solutions by the teacher. For this strong monoprotic acid/strong base at 25 °C the dilute-model equivalence point is approximately pH 7 with a steep pH rise. Use goggles, lab clothing and hand protection where required by the actual safety sheets; collect waste as locally specified. No mouth pipetting or learner preparation of concentrated solutions.

**Tasks and core actions**

1. Plan the aliquot, select a standard and justify it using the expected consumption range. Select and justify an indicator, endpoint criterion and 1:1 reaction. (2 points)
2. Condition the burette/pipette with the respective solution, safely clamp the burette vertically and remove air from its tip. Pipette 20.00 mL sample using the filler; add about 20 mL deionized water and a few indicator drops. Swirl and add titrant dropwise near the endpoint; read the meniscus at eye level. The teacher observes your own safe handling and endpoint approach. Dispose as instructed. (2 points)
3. After a clearly marked rough trial, perform three own usable determinations with fresh aliquots. Immediately record initial/final readings, differences, indicator colour and reading resolution. Check spread; if the range exceeds 0.10 mL, investigate, repeat if necessary and retain all raw data. This working limit belongs to this setup. (2 points)
4. Calculate the mean usable consumption and sample concentration from your own measurements, with units. Explain why added water does not change the amount in the aliquot. (2 points)
5. Fault case: a new group substantially overshoots the endpoint and uses the larger volume without correction. What is the direction of the HCl concentration error and how should that run be handled? (2 points)

Blank per-run record: run ID; sample volume; standard/concentration; indicator; initial/mL; final/mL; consumption/mL; endpoint observation; deviation/stop; observed core actions. No learner readings have been entered here.''',
    '''**Nicht ausschließliche Lösung und verbindliche Rubrik**

1. 20,00 mL Probe ergeben mit 0,1000 mol/L NaOH etwa 16–24 mL Verbrauch, mit 1,000 mol/L nur 1,6–2,4 mL. Die verdünntere Maßlösung nutzt die Bürette günstiger und reduziert den relativen Ableseeinfluss. H3O+ + OH− → 2 H2O, n(HCl)=n(NaOH). Bromthymolblau ist mit dem Umschlagsbereich um pH 7 gut begründbar; bei dieser starken Säure/Base ist auch ein fachlich begründeter Phenolphthalein-Endpunkt im steilen Bereich zulässig. Die Entscheidung darf nicht durch eine unbegründete Einzig-richtiger-Indikator-Regel ersetzt werden. (2 BE)
2. Nur tatsächlich überprüfbares eigenes Vorspülen, sicheres Aufbauen, luftblasenfreies Befüllen, Pipettieren, kontrolliertes Titrieren und Entsorgen erfüllt die Durchführung. Eine schriftlich richtige Anleitung ohne diese Handlungen erhält hierfür 0 BE. (2 BE)
3. Drei eigene vollständige Volumenpaare und unmittelbare Beobachtungen, einschließlich offengelegter problematischer Läufe und begründetem Umgang mit der Streuung, sind nötig. Kein Abschreiben von Referenzzahlen. (2 BE)
4. c(HCl)=c(NaOH)·Mittelwert(V_NaOH)/20,00 mL. Reines Rechenbeispiel, ausdrücklich synthetisch: Verbräuche 19,92; 19,96; 19,94 mL → Mittel 19,94 mL; Spannweite 0,04 mL; c=0,09970 mol/L. Das Beispiel ist keine Beobachtung und ersetzt weder Volumenpaare noch Auswertung eigener Daten. Verdünnung im Kolben ändert n(HCl) des Aliquots nicht. (2 BE)
5. Überverbrauch führt im unveränderten 1:1-Ansatz zu einem zu hohen berechneten c(HCl). Lauf als überschritten kennzeichnen, nicht willkürlich korrigieren; mit frischem Aliquot fachgerecht wiederholen. (2 BE)

**Abschlussgate:** 10/10 BE, alle fünf Kriterien. Insbesondere dürfen fehlende überprüfbare Durchführung oder eigene Rohdaten nicht durch richtige Rechnungen ausgeglichen werden. Die Aufgabenautoren haben keine Durchführung beobachtet.''',
    '''**Non-exclusive solution and binding rubric**

1. A 20.00-mL aliquot consumes about 16–24 mL of 0.1000 mol/L NaOH, versus 1.6–2.4 mL of the 1.000 mol/L standard. The more dilute standard makes better use of the burette and reduces relative reading error. H3O+ + OH− → 2 H2O; n(HCl)=n(NaOH). Bromothymol blue is well justified around pH 7; a scientifically justified phenolphthalein endpoint within the steep rise is also acceptable for this strong acid/base. Do not impose an unjustified unique-indicator rule. (2 points)
2. Actual verifiable own conditioning, safe assembly, bubble-free filling, pipetting, controlled titration and disposal are required. A correct written procedure without those actions receives zero execution credit here. (2 points)
3. Require three own complete reading pairs and immediate observations, retaining problematic runs and treating spread explicitly. Copied reference values do not count. (2 points)
4. c(HCl)=c(NaOH)·mean(V_NaOH)/20.00 mL. Explicitly synthetic arithmetic example: 19.92, 19.96, 19.94 mL → mean 19.94 mL; range 0.04 mL; c=0.09970 mol/L. This is no observation and cannot replace reading pairs or evaluation of own data. Added water does not change n(HCl) in the aliquot. (2 points)
5. Overshoot produces an overestimated c(HCl) under the unchanged 1:1 calculation. Mark the overshot run, do not invent a correction, and repeat correctly with a fresh aliquot. (2 points)

**Completion gate:** 10/10 points, all five criteria. Correct calculations cannot compensate for missing verifiable execution or own raw data. The authors have observed no learner execution.''',
    [
        ('2 BE: Eigener vollständiger Plan mit begründeter Maßlösungs-/Indikatorwahl, Endpunkt und 1:1-Stöchiometrie.', '2 points: Own complete plan, justified standard/indicator, endpoint and 1:1 stoichiometry.', ['planning', 'standard_solution', 'indicator', 'stoichiometry']),
        ('2 BE nur bei überprüfbarer eigener sicherer Durchführung aller angegebenen Kernhandlungen einschließlich Aufbau/Pipettieren/Titrieren/Entsorgen; Beschreibung allein 0 BE.', '2 points only for verifiable safe own execution of all specified core actions; description alone earns zero.', ['actual_execution', 'safe_setup', 'pipetting', 'endpoint_handling', 'disposal']),
        ('2 BE nur für drei eigene vollständige, unmittelbar dokumentierte auswertbare Volumenpaare mit Beobachtungen, Streuungsprüfung und transparentem Umgang mit Fehlerläufen.', '2 points only for three own complete immediately recorded usable reading pairs, observations, spread and transparent error treatment.', ['own_recorded_volumes', 'repeatability', 'measurement_limits']),
        ('2 BE: Eigene Konzentrationsauswertung aus dokumentierten Volumina, Mittelwert/Einheiten und Stoffmengenerhaltung bei Verdünnung korrekt.', '2 points: Correct own concentration evaluation, mean, units and amount conservation on dilution.', ['own_evaluation', 'concentration', 'stoichiometry']),
        ('2 BE: Überverbrauch als Ursache einer zu hohen Konzentration erkennen und fachgerecht mit dem ungültigen Lauf umgehen.', '2 points: Identify overestimation from overshoot and handle the invalid run correctly.', ['fresh_error_case', 'evaluation_limits']),
    ])

practical_goal(CARBONYL,
    'Propanal und Propanon praktisch nachweisen und unterscheiden',
    'Practically test and distinguish propanal and propanone',
    'Die lernende Person kann eine geeignete kontrollierte Nachweisreaktion an Propanal und Propanon selbst durchführen, ihre eigenen Beobachtungen überprüfbar dokumentieren und die Unterscheidung samt Nachweisgrenzen deuten.',
    'The learner can perform a suitable controlled test on propanal and propanone, document verifiable own observations and interpret the distinction and its limits.',
    '''**Material und festgelegter Vergleich**

Zwei von der Lehrkraft codierte wässrige Proben P/Q enthalten jeweils etwa 0,10 mol/L Propanal beziehungsweise Propanon, genau eine Probe je Stoff. Die Zuordnung bleibt während der Beobachtung verdeckt. Hinzu kommen eine bekannte 0,10-mol/L-Propanal-Positivkontrolle und deionisiertes Wasser als Negativ-/Blindkontrolle. Vorgefertigte Fehling-I-Lösung (c(CuSO4) ungefähr 0,28 mol/L) und Fehling-II-Lösung (alkalische Tartratlösung, c(NaOH) ungefähr 2,5 mol/L; Tartratüberschuss), beschriftete Reagenzgläser, getrennte dosierende Pipetten, Gestell/Zange, Thermometer, elektrisch beheiztes Wasserbad und gekennzeichneter Kupferabfall stehen bereit. Die Lehrkraft prüft die tatsächlich verwendeten Konzentrationen, Sicherheitsdatenblätter und Durchführbarkeit; sie stellt die Reagenzien bereit. Schutzbrille/Laborkleidung, geeigneter Handschutz nach Plan, Arbeit im Abzug, keine offene Flamme, keine geschlossenen erhitzten Gefäße, kein Riechen oder Probieren. Kupferhaltige Reste vollständig getrennt sammeln.

**Aufgaben und beobachtbare Kernhandlungen**

1. Plane vier gleich behandelte Ansätze P, Q, +, − und begründe Kontrollen und Wahl der Fehling-Probe für dieses konkrete Stoffpaar. Halte Beobachtung und erwartete Deutung vorab auseinander. (2 BE)
2. Gib mit getrennten Pipetten in jedes beschriftete Glas 0,50 mL Fehling I und 0,50 mL Fehling II, mische vorsichtig und setze jeweils 0,50 mL der zugehörigen Probe/Kontrolle zu. Behandle alle vier offenen Gläser für fünf Minuten im Wasserbad bei 75–80 °C unter den freigegebenen Schutzbedingungen. Die Lehrkraft beobachtet Dosieren, Kontaminationsvermeidung, kontrolliertes Erwärmen und Abfallhandhabung unmittelbar. (2 BE)
3. Protokolliere pro Glas tatsächliche Mengen, Temperatur/Zeit, Ausgangsfarbe und Farbe/Niederschlag unmittelbar nach der gleichen Behandlungszeit. Prüfe zuerst die Kontrollfunktion. Ordne erst danach P/Q zu. Bei versagender Positivkontrolle, positiver Blindkontrolle oder unklarem Befund ist keine sichere Stoffzuordnung möglich; dokumentiere die Grenze und wiederhole nach fachlicher Fehlerklärung. (2 BE)
4. Erkläre die positive Reaktion am Propanal mit einer fachlich ausgeglichenen vereinfachten ionischen Redoxgleichung; deute das Verhalten von Propanon unter genau diesen Bedingungen. (2 BE)
5. Neuer Fall: Eine unbekannte Zuckerprobe liefert ebenfalls eine positive Fehling-Probe. Beweist das, dass es Propanal ist oder dass jede ketonhaltige Verbindung grundsätzlich negativ reagieren muss? Begründe. (2 BE)

Leere Beobachtungstabelle: Ansatz P/Q/+/−; Volumina; Zeit/Temperatur; vorher; nachher; Kontrollprüfung; Zuordnung/Unsicherheit; beobachtete Kernhandlungen. Keine Beobachtungen sind vorausgefüllt.''',
    '''**Materials and specified comparison**

Teacher-coded aqueous samples P/Q contain approximately 0.10 mol/L propanal and propanone, one of each; their identities remain concealed during observation. Provide a known 0.10-mol/L propanal positive control and deionized water negative/blank control. Supplied Fehling I (approximately 0.28 mol/L CuSO4) and Fehling II (alkaline excess-tartrate solution, approximately 2.5 mol/L NaOH), labelled tubes, separate metering pipettes, rack/holder, thermometer, electrically heated water bath and labelled copper-waste container are available. The teacher checks actual concentrations, safety sheets and feasibility and supplies the reagents. Use goggles/lab clothing and specified hand protection; work in the fume hood; no flame, closed heated vessels, smelling or tasting. Collect all copper waste separately.

**Tasks and observable core actions**

1. Plan equally treated P, Q, + and − tubes; justify the controls and Fehling selection for this particular pair. Distinguish observation from predicted interpretation. (2 points)
2. Using separate pipettes, add 0.50 mL Fehling I and 0.50 mL Fehling II to each labelled tube, gently mix and add 0.50 mL of its sample/control. Treat all four open tubes for five minutes in a 75–80 °C water bath under the authorized protection procedure. The teacher directly observes dosing, contamination prevention, controlled heating and waste handling. (2 points)
3. Immediately record actual amounts, temperature/time, initial appearance and final colour/precipitate for each tube after equal treatment. Check control validity before assigning P/Q. A failed positive control, positive blank or unclear result prevents a secure identity assignment; document the limitation and repeat after investigating. (2 points)
4. Explain propanal's positive test using a balanced simplified ionic redox equation; interpret propanone under these exact conditions. (2 points)
5. Fresh case: an unknown sugar also tests positive. Does this prove it is propanal, or that every ketone-containing compound must test negative? Explain. (2 points)

Blank table: tube P/Q/+/−; amounts; time/temperature; before; after; control check; identity/uncertainty; observed core actions. No observations are prefilled.''',
    '''**Nicht ausschließliche Lösung und verbindliche Rubrik**

1. Gleichbehandlung kontrolliert Menge/Temperatur/Zeit; die bekannte Propanalprobe prüft die Reagenzfunktion, die Wasserprobe Kontamination/Eigenreaktion. Die Fehling-Probe ist für die Unterscheidung dieses aliphatischen Aldehyd/Keton-Paars geeignet, aber kein universeller Strukturbeweis. (2 BE)
2. Eigene richtige Ansatzherstellung, offene kontrollierte Wasserbaderwärmung und Entsorgung müssen tatsächlich überprüfbar beobachtet werden. Reagenzgläser nie auf Personen richten. Ohne diese Handlungen keine Durchführungspunkte. (2 BE)
3. Erwartung im funktionierenden Vergleich: Die positive Kontrolle und die Propanalprobe bilden einen orangeroten/ziegelroten Cu2O-Niederschlag; die Wasser- und Propanonprobe bleiben ohne diesen Nachweis typischerweise blau. Dies sind chemische Erwartungen, keine behaupteten Messungen. P/Q werden allein anhand der eigenen gültigen Kontroll-/Beobachtungsreihe zugeordnet. Unklare Befunde korrekt zu begrenzen ist besser als eine erfundene Zuordnung; ein noch nicht erfolgreich durchgeführter unterscheidender Nachweis muss vor Abschluss wiederholt werden. (2 BE)
4. CH3CH2CHO + 2 Cu2+ + 5 OH− → CH3CH2COO− + Cu2O + 3 H2O. Propanal wird zum Propanoat oxidiert, Cu(II) zu Cu(I) reduziert. Tartrat-Komplexierung ist in der vereinfachten Bilanz nicht dargestellt. Propanon zeigt im vorgegebenen Vergleich diese Reaktion nicht. (2 BE)
5. Nein. Fehling zeigt reduzierendes Verhalten im jeweiligen Medium. Auch reduzierende Zucker und im alkalischen Medium umwandelbare ketonhaltige Zucker können positiv reagieren. Weder eine eindeutige Propanalidentität noch eine ausnahmslose Aussage über alle Aldehyde/Ketone folgt daraus. (2 BE)

**Abschlussgate:** Alle fünf Kriterien vollständig, 10/10 BE; tatsächliche sichere Durchführung und eigene gültige kontrollierte Beobachtungen sind unersetzlich. Keine Autorbeobachtung, keine Laborfreigabe durch diese Datei.''',
    '''**Non-exclusive solution and binding rubric**

1. Equal amounts/temperature/time support comparison. Known propanal tests reagent function; water tests contamination or background. Fehling is suitable for this aliphatic aldehyde/ketone pair, not a universal structural identification. (2 points)
2. Actual own preparation, controlled open-tube water-bath heating and disposal require verifiable observation; never point tubes at people. Without these actions, no execution credit. (2 points)
3. Chemical expectation for a functioning comparison: positive control and propanal produce orange/brick-red Cu2O; water and propanone typically remain blue without this precipitate. These are expectations, not reported measurements. Assign P/Q from your own valid controls and observations. Correctly acknowledging unclear data is preferable to inventing an identity; an unsuccessful distinguishing test must be repeated successfully before completion. (2 points)
4. CH3CH2CHO + 2 Cu2+ + 5 OH− → CH3CH2COO− + Cu2O + 3 H2O. Propanal is oxidized to propanoate and Cu(II) reduced to Cu(I). Tartrate complexation is omitted in this simplified balance. Propanone does not show that reaction in the specified comparison. (2 points)
5. No. Fehling detects reducing behaviour under its conditions. Reducing sugars and ketone-containing sugars that rearrange in alkaline medium can also respond. Neither unique propanal identity nor an exceptionless aldehyde/ketone classification follows. (2 points)

**Completion gate:** All five criteria in full, 10/10 points; actual safe execution and own valid controlled observations cannot be replaced. No author execution observation or laboratory authorization is claimed.''',
    [
        ('2 BE: Geeignete Methode für das konkrete Stoffpaar und vier gleich behandelte Ansätze mit sinnvoller Positiv-/Negativkontrolle selbst planen.', '2 points: Independently plan a suitable method and four matched samples/controls.', ['test_selection', 'controlled_design']),
        ('2 BE nur bei überprüfbarer eigener korrekter sicherer Ansatzherstellung, Wasserbaderwärmung und Kupferabfallentsorgung; Anleitung allein 0 BE.', '2 points only for verifiable safe own preparation, water-bath treatment and copper-waste handling; instructions alone earn zero.', ['actual_execution', 'safe_dosing', 'controlled_heating', 'disposal']),
        ('2 BE nur für eigene unmittelbare Mengen-/Bedingungs-/Beobachtungsprotokolle und einen gültig kontrollierten unterscheidenden Nachweis; keine erfundene Stoffzuordnung bei Kontrollversagen.', '2 points only for immediate own records and a valid controlled distinguishing test; no invented assignment after control failure.', ['own_observations', 'valid_controls', 'actual_distinction']),
        ('2 BE: Propanal-Redoxbilanz, Oxidation zu Propanoat, Cu(II)→Cu(I) und begrenzte Propanondeutung korrekt.', '2 points: Correct propanal redox balance, propanoate formation, Cu(II)→Cu(I) and bounded propanone interpretation.', ['interpret_test', 'balanced_reaction']),
        ('2 BE: Positive Zuckerprobe korrekt als Grenze einer eindeutigen Aldehyd/Keton-Identifizierung deuten.', '2 points: Correctly interpret positive sugar as a limitation of unique aldehyde/ketone identification.', ['fresh_boundary_case', 'specificity_limits']),
    ])

practical_goal(SOAP,
    'Seife praktisch herstellen und durch Aussalzen abtrennen',
    'Practically prepare soap and separate it by salting out',
    'Die lernende Person kann im betreuten Versuch ein Fett alkalisch hydrolysieren, die selbst hergestellte Seife durch Aussalzen abtrennen und ihre eigenen Beobachtungen mit der Bildung von Glycerin und Fettsäuresalzen erklären.',
    'The learner can hydrolyse a fat under alkaline conditions in a supervised activity, separate their own soap by salting out and explain their observations through formation of glycerol and fatty-acid salts.',
    '''**Material und festgelegte Bedingungen**

4,00 g Kokosfett, 25,0 mL von der Lehrkraft vorbereitete 3,0-mol/L-Natronlauge, 20,0 mL gesättigte wässrige NaCl-Lösung, deionisiertes Wasser, 100-/250-mL-Bechergläser, Waage, dosierende Messgeräte, Glasstab bzw. geeigneter Rührer, elektrisch geregelte Heizplatte mit Spritzschutz, offen belüftetes Uhrglas, Thermometer, Spatel und geeignete Abtrennvorrichtung. Kein Alkohol wird zugesetzt. Schutzbrille/Laborkleidung und geeigneter Handschutz gemäß aktuellen Sicherheitsdatenblättern; heiße stark alkalische Flüssigkeit verursacht Spritz-/Verätzungsgefahr. Das offene Gefäß nie verschließen und nicht trocken erhitzen. Bei Spritzen, unkontrolliertem Sieden oder zu niedrigem Flüssigkeitsstand Heizung stoppen und die Lehrkraft hinzuziehen; Wasser nur nach deren sicherer Anweisung ergänzen. Das Laborprodukt ist nicht zur Körperpflege, zum Probieren oder zur Mitnahme bestimmt. Sämtliche alkalischen Phasen und kontaminierten Materialien nach dem Schulplan sammeln; keine eigenmächtige Neutralisation oder Ausgussentsorgung.

**Aufgaben und Kernhandlungen**

1. Plane die Schritte von der Fettprobe bis zur isolierten Seife, einschließlich kontrolliertem Erhitzen, Abbruch, Aussalzen und Abtrennung. Zeichne im Strukturmodell eines Triacylglycerins die drei Estergruppen ein. (2 BE)
2. Wiege das Fett selbst ab, miss die bereitgestellte Lauge ab und führe unter unmittelbarer Aufsicht die alkalische Hydrolyse unter vorsichtigem Rühren und kontrolliertem sanften Sieden etwa 20 Minuten durch. Der Ansatz bleibt flüssig; die Lehrkraft kontrolliert den thermischen Aufbau. Dokumentiere wirkliche Mengen, Zeit, Temperaturbereich und Phasenveränderungen; eine noch erkennbare zusammenhängende Fettphase wird als unvollständige Umsetzung festgehalten und fachlich geklärt. Die Lehrkraft beobachtet die eigene Handhabung. (2 BE)
3. Beende das Heizen, gib unter Aufsicht und Spritzschutz die 20,0 mL gesättigte NaCl-Lösung kontrolliert zum Seifenleim, rühre und lasse abkühlen. Trenne die ausgebildete Seifenphase mit Spatel oder geeigneter Filtration tatsächlich von der wässrigen Phase. Protokolliere vorher/nachher und die getrennten Phasen; spüle den isolierten Feststoff nur nach der konkreten Anweisung. Die beaufsichtigende Person beobachtet die eigene Aussalz- und Abtrennhandlung sowie Entsorgung. (2 BE)
4. Erkläre anhand der drei Esterbindungen die Bildung von Glycerin und drei Fettsäuresalzen; formuliere eine vollständige vereinfachte Gleichung und ordne beim Aussalzen Seife und Glycerin den Phasen zu. (2 BE)
5. Neuer Fall: Eine Gruppe erhält durch Neutralisation freier Stearinsäure mit NaOH ein Seifensalz und behauptet damit zugleich die Hydrolyse eines Fetts und die Bildung von Glycerin nachgewiesen zu haben. Beurteile den Schluss. (2 BE)

Leeres Protokoll: Einwaage; Laugenvolumen/Konzentration; Zeiten/Temperaturen; eigene Veränderungen beim Erhitzen; Salzlösung/Zugabe; eigene Phasenbeobachtung; tatsächlich isoliertes Produkt; wässrige Restphase; Abbruch/Abweichung; beobachtete Kernhandlungen. Eine Schaumbildung einer kleinen wässrigen Produktprobe kann ergänzen, ersetzt jedoch weder Hydrolyse noch tatsächliches Aussalzen und Abtrennen.''',
    '''**Materials and specified conditions**

4.00 g coconut fat; 25.0 mL teacher-prepared 3.0-mol/L NaOH; 20.0 mL saturated aqueous NaCl; deionized water; 100-/250-mL beakers; balance; measuring devices; glass rod or suitable stirrer; regulated electric hotplate with splash protection; freely vented watch glass; thermometer; spatula and suitable separation equipment. Add no alcohol. Wear goggles/lab clothing and suitable hand protection as required by current safety sheets. Hot strongly alkaline liquid presents splash/burn hazards. Never seal the vessel or heat dry. Stop heating and involve the teacher after splashing, uncontrolled boiling or low liquid level; add water only under their safe instruction. This laboratory product is not for skin use, tasting or taking home. Collect alkaline phases and contaminated materials under the school procedure; do not independently neutralize or pour into a sink.

**Tasks and core actions**

1. Plan the sequence from fat to isolated soap, including controlled heating, stopping, salting out and separation. Mark the three ester groups in a triacylglycerol structural model. (2 points)
2. Weigh the fat, measure the supplied alkali and personally carry out alkaline hydrolysis under direct supervision with gentle stirring and controlled gentle boiling for about 20 minutes. Keep liquid present; the teacher checks the heating setup. Record actual amounts, time, temperature range and phase changes. Record a remaining continuous fat layer as incomplete conversion and investigate appropriately. The teacher observes your own handling. (2 points)
3. Stop heating and, under supervision and splash protection, carefully add 20.0 mL saturated NaCl to the soap mixture, stir and allow to cool. Actually separate the formed soap phase from the aqueous phase using a spatula or suitable filtration. Record before/after appearance and separated phases; rinse the isolated solid only as specifically instructed. The supervisor observes your own salting-out/separation and disposal. (2 points)
4. Explain glycerol and three fatty-acid salts from the three ester linkages, write a complete simplified equation and assign soap and glycerol to the salting-out phases. (2 points)
5. Fresh case: a group neutralizes free stearic acid with NaOH to obtain a soap salt, then claims it has also demonstrated fat hydrolysis and glycerol formation. Assess this conclusion. (2 points)

Blank record: fat mass; alkali volume/concentration; times/temperatures; own heating observations; brine/addition; own phase observations; actual isolated product; aqueous residue; stop/deviation; observed core actions. A small product sample's foaming in water may supplement evidence but cannot replace hydrolysis, actual salting out or separation.''',
    '''**Nicht ausschließliche Lösung und verbindliche Rubrik**

1. Fett dosieren → kontrollierte alkalische Hydrolyse → Heizen beenden → NaCl-Lösung zusetzen → abkühlen/aussalzen → Seifenphase tatsächlich abtrennen; Schutz/Abbruch/Abfall berücksichtigen. In einem Triacylglycerin liegen drei Estergruppen vom Typ R−C(=O)−O−C vor; die O-gebundenen C-Atome gehören zum Glyceringerüst. Alle drei Estergruppen müssen im Modell kenntlich sein. (2 BE)
2. Die sichere eigene Dosierung, kontrollierte Reaktion und unmittelbaren eigenen Aufzeichnungen müssen tatsächlich überprüfbar sein. Erwartete Emulgierung/Seifenleimbildung ist kein von den Autoren beobachtetes Ergebnis. Nur fremde Seife zu benutzen oder nur einen Reaktionsablauf aufzuschreiben erfüllt die praktische Hydrolyse nicht. (2 BE)
3. Tatsächlich eigene Salzlösungszugabe, Bildung/Abtrennung einer Seifenphase und Beobachtungsprotokoll sind zwingend. Die genauen Erscheinungen hängen vom Fettgemisch ab; eine ausbleibende Abtrennung darf nicht als gelungen erfunden werden. Dann bleibt die Durchführung bis zu einer sachgerechten erfolgreichen Wiederholung offen. (2 BE)
4. Triacylglycerin + 3 NaOH → Glycerin + R1COONa + R2COONa + R3COONa. Drei Esterbindungen werden gespalten; R1–R3 dürfen verschieden sein. Glycerin bleibt überwiegend in der wässrigen, salz-/laugenhaltigen Phase. Bei hoher Salzkonzentration wird die Natriumseife schlechter löslich und als Seifenphase abgetrennt. Aussalzen ist eine Trennung, keine zusätzliche Bildung von Glycerin und keine Veresterung. Keine vollständige Reinheit oder quantitative Umsetzung allein aus dem Aussehen behaupten. (2 BE)
5. C17H35COOH + NaOH → C17H35COONa + H2O liefert ebenfalls Seife, aber ohne Esterhydrolyse und ohne Glycerin. Der Schluss ist falsch; der vorgeschriebene Fettversuch darf dadurch nicht ersetzt werden. (2 BE)

**Abschlussgate:** Alle fünf Kriterien vollständig, 10/10 BE. Ohne beobachtbare eigene Hydrolyse UND Aussalzen/Abtrennen und eigene Aufzeichnungen ist das praktische Ziel nicht abgeschlossen. Keine Durchführung oder menschliche Freigabe wird hier behauptet.''',
    '''**Non-exclusive solution and binding rubric**

1. Dose fat → controlled alkaline hydrolysis → stop heating → add brine → cool/salt out → actually separate soap, including protection/stopping/waste. Identify all three R−C(=O)−O−C ester groups, whose O-bound carbon atoms belong to the glycerol backbone. (2 points)
2. Safe own dosing, controlled reaction and immediate own records require verifiable execution. Expected emulsification/soap-mixture formation is no author-observed result. Using pre-existing soap or writing a reaction sequence cannot demonstrate practical hydrolysis. (2 points)
3. Own brine addition, formation/separation of a soap phase and observation record are compulsory. Appearance depends on the fat mixture. Never invent successful separation when it fails; completion remains open until appropriate successful repetition. (2 points)
4. Triacylglycerol + 3 NaOH → glycerol + R1COONa + R2COONa + R3COONa. Three ester bonds are cleaved; R1–R3 may differ. Glycerol remains mainly in the aqueous salt/alkali phase. High salt concentration reduces sodium soap solubility, allowing phase separation. Salting out is a separation, not extra glycerol production or esterification. Appearance alone proves neither complete purity nor quantitative conversion. (2 points)
5. C17H35COOH + NaOH → C17H35COONa + H2O also gives soap but involves no ester hydrolysis and produces no glycerol. The conclusion is false and this cannot replace the specified fat experiment. (2 points)

**Completion gate:** All five criteria in full, 10/10 points. Without observable own hydrolysis AND salting-out/separation and own records, practical completion remains open. No learner execution or human approval is claimed here.''',
    [
        ('2 BE: Vollständigen eigenen Ablauf planen und die drei Estergruppen des Triacylglycerins richtig darstellen.', '2 points: Plan the complete sequence and correctly represent three ester groups.', ['planning', 'three_ester_groups']),
        ('2 BE nur bei überprüfbarer eigener sicherer Fett-/Laugendosierung, kontrollierter tatsächlicher Hydrolyse und unmittelbaren eigenen Mengen-/Bedingungs-/Beobachtungsaufzeichnungen.', '2 points only for verifiable own safe dosing, controlled actual hydrolysis and immediate own records.', ['actual_hydrolysis', 'safe_heating', 'own_records']),
        ('2 BE nur bei überprüfbarer eigener Salzlösungszugabe UND wirklicher Seifenphasentrennung, eigenem Protokoll sowie fachgerechter Abfallhandhabung.', '2 points only for verifiable own brine addition AND actual soap separation, own records and correct waste handling.', ['actual_salting_out', 'actual_separation', 'own_phase_observations', 'disposal']),
        ('2 BE: Drei Esterbindungen→Glycerin+3 Fettsäuresalze bilanziert und Seife/wässrige Glycerinphase beim Aussalzen korrekt erklärt.', '2 points: Correct three-ester balance to glycerol and three fatty-acid salts and phase assignment.', ['glycerol_formation', 'fatty_acid_salts', 'separation_explanation']),
        ('2 BE: Fettsäureneutralisation von Fettverseifung unterscheiden; ohne Ester entsteht dabei kein Glycerin.', '2 points: Distinguish fatty-acid neutralization from fat saponification; no ester means no glycerol here.', ['fresh_boundary_case', 'reaction_identity']),
    ])

paper = []

def paper_goal(gid, covered, extra_task, extra_task_en, extra_solution, extra_solution_en, new_steps, old_task_en, old_solution_en):
    candidate = copy.deepcopy(goals[gid])
    candidate['nodeKind'] = 'exam'
    # Admission is authored separately from the evidence matrix below.
    candidate['requires'] = PAPER_ADMISSION[gid]['goalIds'][:]
    candidate['extendedData']['authorRemediation'] = {'role': 'AUTHOR draft; no self-review', 'planSHA256': PLAN_PIN, 'sourceCanonicalSHA256': PIN, 'previousWholeGoalSHA256': whole_hash(goals[gid]), 'previousGoalSnapshot': str((BASE / 'history/three-previous-paper-wholegoals.json').relative_to(REPO)), 'prerequisitesAreAdmissionNotAssessedEvidence': True, 'admissionRationale': PAPER_ADMISSION[gid], 'actualLearnerPerformanceClaimed': False, 'independentCurrentTaskReviews': 0, 'requiredIndependentCurrentTaskReviews': 2, 'humanApproval': False, 'humanTrial': False, 'assetClass': 'E0/G0'}
    exam = candidate['examData']
    exam.update({'reviewStatus': 'draft', 'reviewNote': NOTE, 'coveredGoalIds': covered[:], 'sourceArtifactPath': str((BASE / 'TASK-RUBRIC-COVERAGE.author.md').relative_to(REPO))})
    exam['taskContent'] += '\n\n' + extra_task
    exam['solutionContent'] += '\n\n' + extra_solution
    exam['taskContentEn'] = old_task_en + '\n\n' + extra_task_en
    exam['solutionContentEn'] = old_solution_en + '\n\n' + extra_solution_en
    exam['scoring']['steps'].extend([{'id': sid, 'points': points, 'description': de} for sid, points, de, en, ids, aspects in new_steps])
    exam['scoring']['maxPoints'] = sum(s['points'] for s in exam['scoring']['steps'])
    exam['scoring']['passingPoints'] = (exam['scoring']['maxPoints'] * 3 + 4) // 5
    paper.append(candidate)
    return candidate

PAPER_ADMISSION = {
    IPA: {'goalIds': [FORCES, PROPERTIES, ISOMERS, MOL], 'rationaleByTask': {'1_5': 'Functional-group and constitutional-isomer reasoning uses the reviewed alkanol/isomer theory; its current structural-formula prerequisite remains unchanged.', '2_4_6_7': 'Intermolecular-force and structure/property knowledge is necessary for boiling, melting, solubility and solvent explanations.', '3': 'Amount-of-substance and mol units support the supplied 1:1 theoretical/isolated-mol yield calculation; no actual oxidation or carbonyl detection is required.'}, 'excludedPracticalAdmissionIds': [CARBONYL, SOAP, TITRATION], 'inheritedOrdinaryPrerequisiteChanges': False, 'transitiveRouteState': 'HOLD; existing ordinary theory prerequisites can inherit earlier practical solution-preparation requirements; this candidate does not alter them.'},
    CAMP: {'goalIds': [FORCES, MOL, EQUATIONS], 'rationaleByTask': {'1_3_4_5_6': 'Intermolecular interactions are prerequisite theory; supplied soap-anion structure provides the concrete amphiphilic material from which the learner must explain interface, micelle and washing behaviour.', '2': 'Mol interpretation and reaction-equation coefficients are necessary to calculate the limiting calcium/stearate amount from the supplied equation.'}, 'notRequiredAsPriorMastery': [SOAP, MICELLES, WASHING], 'reason': 'This paper assesses micelle/washing theory directly using supplied structural/data material. Requiring their current ordinary whole-goal mastery would inherit actual soap manufacture. Manufacture remains its own ordinary/global-course duty and practical endpoint; no manufacture credit is inferred here.', 'inheritedOrdinaryPrerequisiteChanges': False, 'transitiveRouteState': 'HOLD for inherited foundation routing; no graph repair outside these endpoint admission fields.'},
    ACID: {'goalIds': [FORMULAS, MOLAR_MASS, EQUATIONS], 'rationaleByTask': {'1_5_6_7': 'Chemical symbols/formulas, reaction equations and species accounting are the necessary foundation; acid-base concepts are the skills this exam itself tests.', '2_3_4': 'Molar mass and amount reasoning support n=m/M, n=cV, 1:1 residual titration and the supplied one-/two-proton capacities. c=n/V is explicitly supplied as paper material.'}, 'notRequiredAsPriorMastery': [ARRHENIUS, BRONSTED, STRENGTH, 'f1ed86f0-534d-57d7-8952-a004a331cc54', TITRATION], 'reason': 'The case tests acid-base theory from the submitted work, and supplied titration numbers need no observed solution preparation or titration. The current ordinary acid-base theory chain inherits practical solution preparation; no such performance is asserted or forced by this endpoint admission.', 'inheritedOrdinaryPrerequisiteChanges': False, 'transitiveRouteState': 'HOLD for overall course-route integration; actual course duties remain in separate global endpoints.'},
}

ipa = paper_goal(IPA, [FORCES, PROPERTIES, ISOMERS],
    '''**Zusatzmaterial 4 – molekulare Stoffe und Reinigung (reine Papierdaten)**

Die zum Vergleich verwendeten gerundeten Stoffdaten sind keine Lernendenmessungen:

| Stoff | Struktur | Schmelztemperatur/°C | Siedetemperatur/°C bei etwa 1 bar |
| --- | --- | --- | --- |
| Ethanol | CH3−CH2−OH | −114 | 78 |
| Dimethylether | CH3−O−CH3 | −141 | −25 |

Als gedachte Lösemittel stehen Wasser (polar, Wasserstoffbrücken) und n-Hexan (unpolar) zur Wahl. Zu entfernen sind getrennt molekulares Iod I2 (unpolar, gut polarisierbar) und Saccharose (viele OH-Gruppen). Keine reale Handhabung dieser Stoffe ist Teil der Aufgabe.

5. Stelle die beiden Alkanol-Konstitutionsisomere mit der Summenformel C3H8O als Halbstrukturformeln dar, benenne sie und begründe, weshalb gleiche Summenformel hier nicht gleiche Konstitution bedeutet. (4 BE)
6. Erläutere an folgenden konkreten Teilchenpaaren die jeweils charakteristische Wechselwirkung und ihre Ursache: zwei Propanonmoleküle; zwei Ethanolmoleküle; Na+ und Wasser; zwei n-Hexanmoleküle. Stelle keine universelle Stärkenrangfolge auf. (4 BE)
7. Deute die Schmelz- und Siedetemperaturunterschiede von Ethanol/Dimethylether mit ihren Wechselwirkungen und begrenze eine exakte Schmelztemperaturvorhersage ohne Kristallpackungsdaten. Sage die deutlich bessere Wasserlöslichkeit von Ethanol gegenüber n-Hexan voraus. Wähle für Iod und Saccharose jeweils das geeignetere der beiden gedachten Lösemittel und begründe anhand der molekularen Wechselwirkungen. (6 BE)

Die Aufgaben prüfen theoretische Einordnung/Begründung. Eine tatsächliche Aldehyd-/Keton-Nachweisreaktion wird hier nicht geprüft. Die Aussage über Abdestillation in Aufgabe 2 ist eine qualitative Erwartung aus den gegebenen Stoffdaten, kein Nachweis vollständiger Gemischtrennung.''',
    '''**Additional material 4 – molecular substances and cleaning (paper data only)**

Rounded reference data, not learner measurements:

| Substance | Structure | Melting point/°C | Boiling point/°C near 1 bar |
| --- | --- | --- | --- |
| Ethanol | CH3−CH2−OH | −114 | 78 |
| Dimethyl ether | CH3−O−CH3 | −141 | −25 |

Hypothetical solvent choices are water (polar, hydrogen bonding) and n-hexane (nonpolar). Separate solutes to remove are molecular iodine I2 (nonpolar, polarizable) and sucrose (many OH groups). No actual handling is assessed.

5. Draw condensed structural formulas for both C3H8O alkanol constitutional isomers, name them and explain why the same molecular formula does not imply the same connectivity. (4 points)
6. Explain the characteristic interaction and its cause for each pair: two propanone molecules; two ethanol molecules; Na+ and water; two n-hexane molecules. Do not impose a universal strength ranking. (4 points)
7. Interpret ethanol/dimethyl ether melting/boiling differences through interactions and limit exact melting-point predictions without crystal-packing data. Predict ethanol's much better water solubility than n-hexane's. Choose the more suitable hypothetical solvent for iodine and for sucrose and justify molecular interactions. (6 points)

These are theoretical classification/reasoning tasks, not actual aldehyde/ketone tests. Task 2 gives a qualitative distillation expectation, not evidence of complete mixture separation.''',
    '''5. CH3−CH2−CH2−OH: Propan-1-ol; CH3−CH(OH)−CH3: Propan-2-ol. Beide C3H8O, aber Bindungsanordnung/Position der OH-Gruppe verschieden; keine bloße räumliche Drehung derselben Konstitution. Je 1 BE für beide richtige benannte Strukturen, 1 BE Summenformel, 1 BE Konstitutionsvergleich. **4 BE**

6. Propanon: permanente Dipole der polaren Carbonylgruppen; Ethanol: O−H···O-Wasserstoffbrücken (auch Dipol-/Dispersionskräfte vorhanden); Na+/H2O: Ionen-Dipol-Wechselwirkung mit δ−-O-Seite zum Kation; n-Hexan: momentane/induzierte Dipole, London-/Van-der-Waals-Kräfte. Je Ursache und passendes Beispiel 1 BE; keine universelle Rangfolge. **4 BE**

7. Ethanol kann untereinander Wasserstoffbrücken spenden und annehmen, Dimethylether hat keinen O−H-Donor; der höhere Siedepunkt ist damit plausibel. Der höhere gemessene Schmelzpunkt passt zu unterschiedlichen kohäsiven Wechselwirkungen, hängt jedoch zusätzlich von Kristallpackung/Entropie ab; allein die Stoffklasse erlaubt keine allgemeine exakte Rangregel. 3 BE für beide Phasenübergänge mit dieser Grenze. Ethanol wechselwirkt über OH mit Wasser, n-Hexan kaum entsprechend; daher deutlich bessere Wasserlöslichkeit (1 BE). Saccharose bevorzugt Wasser wegen vieler H-Brückenmöglichkeiten (1 BE), Iod bevorzugt n-Hexan wegen passender Dispersions-/Polarisierbarkeitswechselwirkungen (1 BE). **6 BE**

Der Ausbeute-Teil ist ein zusätzlicher berechneter Teilaspekt; daraus wird keine zusätzliche Vollkompetenz-Coverage abgeleitet. Nachweisdurchführung ist ausschließlich dem neuen praktischen Endpunkt zugeordnet. Fachlich gleichwertige Lösungen erhalten gleiche Punkte.''',
    '''5. CH3−CH2−CH2−OH is propan-1-ol; CH3−CH(OH)−CH3 is propan-2-ol. Both are C3H8O, but their OH attachment/connectivity differs; this is not rotation of one connectivity. One point per correctly named structure, one for molecular formula and one for the connectivity comparison. **4 points**

6. Propanone: permanent dipoles from carbonyl polarity; ethanol: O−H···O hydrogen bonding, with dipole/dispersion also present; Na+/water: ion-dipole attraction, δ− oxygen toward the cation; n-hexane: instantaneous/induced dipoles, London/Van der Waals forces. One point for each matching cause/example; no universal ranking. **4 points**

7. Ethanol can donate and accept intermolecular hydrogen bonds, whereas dimethyl ether lacks an O−H donor, supporting the higher boiling point. Its higher supplied melting point is compatible with different cohesion, but crystal packing and entropy also matter; substance class alone gives no universal exact order. Three points for both transitions and this limit. Ethanol's OH interacts with water, unlike n-hexane's nonpolar surface, supporting greater water solubility (one point). Sucrose favours water through hydrogen bonding (one); iodine favours hexane through dispersion/polarizability interactions (one). **6 points**

Yield calculation supplies an additional partial aspect, not further full-goal coverage. Test execution belongs only to the new practical endpoint. Award equivalent correct solutions equal credit.''',
    [('s5', 4, 'Beide C3H8O-Alkanolstrukturen/Namen und gleicher Summenformel bei verschiedener Konstitution korrekt.', 'Correct C3H8O alkanol structures/names and same formula with different connectivity.', [ISOMERS], ['recognize', 'represent', 'same_formula_compare']),
     ('s6', 4, 'Dipolkräfte, H-Brücken, Ionen-Dipol und London-Kräfte an allen vier konkreten Paaren ursächlich erläutert.', 'Explain all four forces causally using the four pairs.', [FORCES], ['dipole', 'hydrogen_bond', 'ion_dipole', 'dispersion']),
     ('s7', 6, 'Schmelzen/Sieden begrenzt deuten (3), Wasserlöslichkeit vorhersagen (1), Lösemittel für Saccharose/Iod je begründen (2).', 'Interpret melting/boiling with limits (3), predict water solubility (1), justify two solvent choices (2).', [PROPERTIES], ['melting', 'boiling', 'solubility_prediction', 'molecular_solvent_choice', 'packing_limit'])],
    '''**Context:** A laboratory recovers propanone from used propan-2-ol cleaner for a specified volatile-solvent application.

**Material 1:** Propan-2-ol boils at 82 °C and is readily water-soluble. Propanone boils at 56 °C and mixes well with many organic solvents.

**Material 2:** Propan-2-ol + [O] → propanone + H2O. Input 1.50 mol propan-2-ol; isolated product 1.05 mol propanone.

**Material 3:** The specified application requires a volatile solvent; alcohol residues are unwanted.

1. Classify both substances and name their functional groups. (6 points)
2. Explain with material 1 why propanone can be expected to distil more readily than propan-2-ol. (7 points)
3. Calculate percentage yield. (7 points)
4. Assess why propanone better fits the specified application than the original alcohol mixture. (10 points)''',
    '''1. Propan-2-ol is an alkanol with a hydroxy group; propanone is a ketone with a carbonyl group. **6 points**

2. Propan-2-ol forms intermolecular hydrogen bonds through its OH group. Propanone has a polar carbonyl but no OH donor; the supplied lower boiling point supports greater volatility. This does not by itself establish a complete real-mixture separation. **7 points**

3. 1:1 stoichiometry gives 1.50 mol theoretical product; 1.05/1.50=0.70=70%. **7 points**

4. Greater volatility and the stated exclusion of alcohol residues favour purified propanone for this specified solvent use. This is application-specific, not a universal superiority claim. **10 points**''')

camp = paper_goal(CAMP, [MICELLES, WASHING],
    '''**Zusatzmaterial 5 – kontrollierte synthetische Modellreihe**

Das Modell-Seifenanion ist C17H35−COO−: langer unpolarer Kohlenwasserstoffrest, negativ geladener polarer Carboxylatkopf; Na+ ist das Gegenion. Alle Ansätze verwenden gleich verschmutzte Modellflächen, gleiche Ölmenge, zehn Minuten gleiche Bewegung, dasselbe Seifengemisch und gleiche Flüssigkeitsmenge. Angegeben ist der unabhängig von Schaum bestimmte entfernte Ölanteil. Die Werte sind von den Autoren erfundene Papierdaten, keine Labor- oder Lernendenmessungen. Konzentration meint die vor dem Kontakt mit dem Schmutz eingesetzte Seifenmasse pro Volumen.

| Ansatz | Temperatur/°C | Seife/(g/L) | Ca2+/(mmol/L) | entfernter Ölanteil/% |
| --- | --- | --- | --- | --- |
| A | 20 | 0,10 | 0 | 20 |
| B | 20 | 1,00 | 0 | 65 |
| C | 40 | 1,00 | 0 | 80 |
| D | 40 | 1,00 | 0,50 | 45 |

5. Beschreibe die Orientierung der Seifenanionen an einer Wasser-Luft-Grenzfläche und an der Wasser-Öl-Grenzfläche. Erkläre damit Grenzflächenaktivität, Verringerung der Oberflächenspannung und Stabilisierung dispergierter Fetttröpfchen; grenze die Grenzflächenanordnung von einer Micelle ab. (4 BE)
6. Vergleiche B mit A, C mit B und D mit C. Erkläre jeweils den isolierten Einfluss von Tensidkonzentration, Temperatur beziehungsweise Wasserhärte auf Dispergiervermögen/Waschwirkung unter Einbezug von Micellen und Kalkseifen. Begründe, warum aus den Daten weder „mehr Seife hilft immer“ noch „mehr Schaum beweist bessere Reinigung“ folgt. (6 BE)

Die Fragen prüfen theoretische Auswertung, keine selbst durchgeführte Seifenherstellung. Eine biologische Abbaubarkeit wird als Anwendungskriterium genannt, aber durch diese Daten nicht nachgewiesen.''',
    '''**Additional material 5 – controlled synthetic model series**

The model soap anion is C17H35−COO−: a long nonpolar hydrocarbon tail and negatively charged polar carboxylate head, with Na+ counterions. Use identical model surfaces/initial oil loads, ten minutes of equal agitation, one soap mixture and equal liquid amounts. Oil removal is determined independently of foam. Values are authored synthetic paper data, not laboratory or learner measurements. Concentration is soap mass initially supplied per volume.

| Sample | Temperature/°C | Soap/(g/L) | Ca2+/(mmol/L) | Oil removed/% |
| --- | --- | --- | --- | --- |
| A | 20 | 0.10 | 0 | 20 |
| B | 20 | 1.00 | 0 | 65 |
| C | 40 | 1.00 | 0 | 80 |
| D | 40 | 1.00 | 0.50 | 45 |

5. Describe soap-anion orientation at air/water and oil/water interfaces. Explain surface activity, reduced surface tension and stabilization of dispersed oil droplets; distinguish interfacial arrangement from a micelle. (4 points)
6. Compare B/A, C/B and D/C. Explain isolated effects of surfactant concentration, temperature and hardness on dispersing/washing, including micelles and insoluble soaps. Explain why the series proves neither “more soap always helps” nor “more foam proves better cleaning”. (6 points)

These tasks assess theory, not own soap manufacture. Biodegradability is an application criterion, not established by these data.''',
    '''5. Der geladene hydrophile Carboxylatkopf bleibt zum Wasser gerichtet, der hydrophobe Rest bevorzugt Luft bzw. Öl. An der Wasser-Luft-Grenze verändert die Adsorption die Grenzflächenzusammensetzung und senkt die freie Energie pro Fläche/Oberflächenspannung. An der Öl-Wasser-Grenze werden Tröpfchen mit Köpfen nach außen zum Wasser stabilisiert und gegen Wiedervereinigung dispergiert. Eine Micelle ist ein Aggregat in der Flüssigkeit mit hydrophobem Innenbereich, keine bloße ebene Oberflächenbelegung. Je 1 BE für Orientierung, Oberflächenspannung, Emulgator-/Dispergierwirkung und Abgrenzung. **4 BE**

6. B/A: Nur die eingesetzte Tensidkonzentration steigt; unter den gegebenen Bedingungen stehen mehr aktive Tensidteilchen/Aggregate für Benetzung und Fettaufnahme zur Verfügung, Ölentfernung +45 Prozentpunkte (2 BE). C/B: Nur die Temperatur steigt; Beweglichkeit/Transport und gegebenenfalls geringere Zähigkeit des Fetts erleichtern hier Ablösung/Dispergierung, +15 Prozentpunkte; keine allgemeine monotone Regel für alle Tenside (2 BE). D/C: Calcium bindet Seifenanionen als schwer lösliche Kalkseife, verringert aktive Tensidmenge und begünstigt Rückstände; entsprechend −35 Prozentpunkte. Magnesium kann entsprechend schwer lösliche Seifen bilden. Daten belegen nur diese Bedingungen; Sättigung/andere Grenzbedingungen begrenzen Konzentrationseffekte, und Schaum misst Luftstabilisierung, nicht unmittelbar Ölentfernung (2 BE). **6 BE**

Seifenherstellung durch Hydrolyse und Aussalzen ist ausdrücklich keine Papier-Coverage. Alle Prozentangaben dieser Reihe sind synthetisch. Gleichwertige fachliche Begründungen werden anerkannt.''',
    '''5. Charged hydrophilic carboxylate heads face water; hydrophobic tails favour air or oil. Adsorption changes the air/water interface and lowers surface free energy per area/surface tension. At oil/water interfaces outward water-facing heads stabilize dispersed droplets against reunion. A micelle is an aggregate within the liquid with a hydrophobic interior, not merely a planar surface layer. One point each for orientation, surface tension, emulsifying/dispersing action and distinction. **4 points**

6. B/A changes only surfactant concentration: more active surfactant/aggregates support wetting and oil uptake here; removal rises 45 percentage points (2 points). C/B changes only temperature: transport/mobility and possibly lower fat viscosity support removal here, +15 percentage points, without a universal monotonic rule (2 points). D/C introduces calcium: poorly soluble calcium soaps consume active anions and create residues, −35 percentage points; magnesium can behave similarly. Conditions bound the finding, concentration effects can saturate, and foam stabilizes air rather than directly measuring oil removal (2 points). **6 points**

Hydrolysis/manufacture/salting-out are excluded from paper coverage. All series values are synthetic. Accept equivalent correct reasoning.''',
    [('s5', 4, 'Kopf-/Restorientierung an zwei Grenzflächen, Grenzflächenaktivität/Oberflächenspannung, Emulgierung und Micellenabgrenzung je korrekt.', 'Correct interface orientation, surface activity/tension, emulsification and micelle distinction.', [MICELLES], ['amphiphilic_structure', 'interfaces', 'surface_tension', 'emulsification', 'micelles']),
     ('s6', 6, 'Drei kontrollierte Paarvergleiche mit je Ursache, Dispergier-/Micellen-/Kalkseifendeutung; begrenzte Aussage ohne Schaum=Waschwirkung.', 'Three controlled comparisons with causes and dispersing/micelle/insoluble-soap explanations and bounded claims.', [WASHING], ['temperature', 'surfactant_concentration', 'hardness', 'dispersion', 'micelles', 'insoluble_soap', 'foam_limit'])],
    '''**Context:** A trekking team compares soap in soft and hard model water; biodegradability is a desired property.

**Material 1:** Supplied model observations: abundant foam in soft water; little foam and visible residues in hard water.

**Material 2:** 2 C17H35COO− + Ca2+ → (C17H35COO)2Ca(s).

**Material 3:** 0.020 mol stearate and 0.0060 mol Ca2+.

**Material 4:** Cleaning dishes requires good soil removal; surface residues and excess soap use are undesirable.

1. Explain soap structure and how micelles help remove fats. (8 points)
2. Calculate the maximum calcium stearate amount. (7 points)
3. Explain why hardness worsens soap performance using materials 1/2; distinguish foam from actual cleaning evidence. (7 points)
4. Assess conventional soap versus a less hardness-sensitive surfactant system for the specified hard-water use. (8 points)''',
    '''1. Soap anions have a long nonpolar tail and charged carboxylate head. In water, hydrophobic regions face micellar interiors/oil while heads face water; stabilized oil droplets are emulsified. **8 points**

2. 0.0060 mol Ca2+ consumes 0.0120 mol stearate, below 0.020 mol supplied. Maximum calcium stearate is 0.0060 mol. **7 points**

3. Calcium precipitates soap anions, reducing active surfactant and producing residues. Less foam alone is not a quantitative oil-removal measurement; use the additional controlled cleaning series. **7 points**

4. A less hardness-sensitive surfactant system better meets the stated residue/consumption criteria. Its biodegradability must be checked separately; it is not established by foam or stoichiometry. **8 points**''')
# Correct only the misleading foam→washing inference; preserve the supplied case and numbers.
camp['examData']['taskContent'] = camp['examData']['taskContent'].replace('warum hartes Wasser die Waschleistung von Seifen verschlechtert.', 'warum hartes Wasser die Verfügbarkeit aktiver Seifenteilchen vermindert. Unterscheide Schaumbeobachtung von einem direkten Reinigungsnachweis.')
camp['examData']['solutionContent'] = camp['examData']['solutionContent'].replace('Es entsteht weniger Schaum und die Reinigungswirkung sinkt.', 'Die Schaumbeobachtung allein misst keine Reinigungswirkung; die verminderte Verfügbarkeit aktiver Seifenteilchen und die ergänzte kontrollierte Ölentfernungsreihe stützen im Modell eine verringerte Reinigung.')

acid = paper_goal(ACID, [ARRHENIUS, BRONSTED, STRENGTH],
    '''**Zusatzmaterial 4 – Modellgrenzen und relative Stärken**

Alle Fallzahlen und Beobachtungen sind bereitgestellte Papierdaten, keine eigenen Versuche. Die Laboransätze dienen allein als chemisches Modell; daraus wird keine Arzneimittelwahl oder Anwendung beim Menschen abgeleitet. Konzentration ist c=n/V, also n=c·V; rechne Volumina dabei in Liter um. Für Vergleiche der maximalen Säurebindung verwende M(NaHCO3)=84,01 g/mol und M(CaCO3)=100,09 g/mol. Je Hydrogencarbonat-Ion wird netto ein Proton, je Carbonat-Ion werden netto zwei Protonen gebunden, jeweils mit CO2-/Wasserbildung. Die langsamere Umsetzung von B ist eine Vorgabe des Modellfalls, keine allgemeine Aussage über Präparate oder deren Wirkdauer.

Für den qualitativen Vergleich in Aufgabe 7 gilt die vorgegebene relative Säurestärkeordnung: H3O+ > H2CO3 > HCO3− > H2O. Für korrespondierende Basen gilt die umgekehrte Stärkeordnung. Diese Angabe liefert keine Geschwindigkeitskonstanten oder quantitativen pH-/Gleichgewichtswerte.

5. Gib je zwei typische anorganische Säuren und Basen mit Namen und Formeln an. Erkläre ihre saure beziehungsweise basische Wirkung in Wasser nach Arrhenius anhand der entstehenden H3O+- bzw. OH−-Ionen. (6 BE)
6. Formuliere die Protonenübertragungen HCl mit Wasser sowie NH3 mit Wasser, kennzeichne jeweils Donator/Akzeptor und alle korrespondierenden Paare. Erkläre daran Wasser als Ampholyt. Unterscheide die reagierenden Teilchen von den Stoffgemischen Salzsäure bzw. Ammoniaklösung. (6 BE)
7. Vervollständige und vergleiche HCO3− + H3O+ und HCO3− + OH− als Protonenübertragungen. Begründe jeweils die bevorzugte Richtung im angegebenen relativen Stärkemodell, benenne die partnerabhängige Rolle von HCO3− und erläutere zwei Grenzen der qualitativen Vorhersage. Die anschließende mögliche CO2-Freisetzung ist von der reinen Protonenübertragung zu trennen. (6 BE)

Auswertung vorgegebener Titrationsvolumina bleibt eine schriftliche Rechnung. Sie weist weder eigenes Lösungenherstellen noch Titrationsplanung, Indikatorwahl oder Durchführung nach.''',
    '''**Additional material 4 – model limits and relative strengths**

All supplied numbers/observations are paper data, not own experiments. Laboratory model behaviour gives no basis for selecting or using a medicine in humans. Concentration is c=n/V, so n=c·V with volume in litres. For maximum acid binding use M(NaHCO3)=84.01 g/mol and M(CaCO3)=100.09 g/mol. Hydrogencarbonate consumes one proton and carbonate two in the net CO2/water-forming reactions. B's slower reaction is specified for this model, not a universal statement about products or clinical duration.

Task 7 uses this supplied relative acid order: H3O+ > H2CO3 > HCO3− > H2O. Conjugate base strengths follow the reverse order. This gives no rate constants or quantitative pH/equilibrium values.

5. State two typical inorganic acids and two bases by name/formula. Use H3O+/OH− production to explain their behaviour in water under Arrhenius. (6 points)
6. Formulate proton transfer for HCl/water and NH3/water; identify donor/acceptor and all conjugate pairs. Explain water's amphiprotic role. Distinguish reacting species from hydrochloric-acid and aqueous-ammonia mixtures. (6 points)
7. Complete and compare proton transfers HCO3− + H3O+ and HCO3− + OH−. Justify each favoured direction using the supplied relative strengths, identify HCO3−'s partner-dependent role and explain two limits of the qualitative model. Distinguish subsequent possible CO2 release from the proton-transfer step. (6 points)

Calculations from supplied titration volumes do not establish own solution preparation, titration planning, indicator selection or execution.''',
    '''5. Beispielsweise Chlorwasserstoff HCl (als wässrige Salzsäure), Schwefelsäure H2SO4, Natriumhydroxid NaOH und Calciumhydroxid Ca(OH)2: je korrektes Name/Formel-Paar 1 BE. Säuren erhöhen in Wasser H3O+, Hydroxidbasen liefern OH−; z. B. HCl + H2O → H3O+ + Cl− und NaOH → Na+ + OH− (je 1 BE für die beiden Wirkungen). Andere korrekte typische anorganische Beispiele sind gleichwertig. **6 BE**

6. HCl + H2O → H3O+ + Cl−; NH3 + H2O ⇌ NH4+ + OH− (je 1 BE). Paare HCl/Cl− und H3O+/H2O sowie NH4+/NH3 und H2O/OH− (zusammen 2 BE). Wasser nimmt gegenüber HCl ein Proton auf und gibt gegenüber NH3 eines ab, ist also partnerabhängig Base/Säure (1 BE). HCl, H3O+, NH3 usw. sind Teilchenarten; Salzsäure und Ammoniaklösung enthalten Wasser und gelöste Teilchen, sind Gemische und nicht jeweils ein einzelnes Molekül (1 BE). **6 BE**

7. HCO3− + H3O+ → H2CO3 + H2O: HCO3− ist Base; starke Säure H3O+ wird durch schwächere H2CO3 ersetzt. HCO3− + OH− → CO3^2− + H2O: HCO3− ist Säure; schwächere Produktsäure H2O wird begünstigt. Pro Reaktion je 1 BE für ausgeglichene Gleichung/Rolle und 1 BE für die Richtung aus Säure- sowie korrespondierender Basenstärke (4 BE). Die Ordnung allein liefert weder Ausmaß/quantitativen pH noch Reaktionsgeschwindigkeit; Konzentrationen, Lösungsmittelbedingungen und CO2-Austritt können weitere Aspekte bestimmen. Zwei passende Grenzen zusammen 2 BE. H2CO3 → CO2 + H2O ist eine nachfolgende Reaktion, keine neue korrespondierende Protonenübertragung. **6 BE**

**Coverage-Grenze:** Vollständig beansprucht werden nur Arrhenius, Brønsted und qualitativer Stärke-/Partnervergleich. f1ed86f0 wird nur im Stoffmengen-/Konzentrationsrechnen berührt, 02634fdd nur bei der gegebenen Titrationsstöchiometrie; beide sind mangels praktischer Vollleistung nicht coveredGoalIds. Das frühere E-Phasen-Cluster ist keine geprüfte Vollkompetenz. Gleichwertige fachliche Antworten werden anerkannt.''',
    '''5. Examples: hydrogen chloride HCl (aqueous hydrochloric acid), sulfuric acid H2SO4, sodium hydroxide NaOH and calcium hydroxide Ca(OH)2; one point per correct name/formula pair. Acids raise aqueous H3O+ and hydroxide bases supply OH−, e.g. HCl + H2O → H3O+ + Cl− and NaOH → Na+ + OH−; one point for each effect. Accept equivalent typical inorganic examples. **6 points**

6. HCl + H2O → H3O+ + Cl−; NH3 + H2O ⇌ NH4+ + OH− (one point each). Conjugate pairs: HCl/Cl−, H3O+/H2O, NH4+/NH3 and H2O/OH− (two points). Water accepts from HCl and donates to NH3, so its acid/base role depends on the partner (one point). Individual species differ from hydrochloric-acid/aqueous-ammonia mixtures containing water and dissolved species (one point). **6 points**

7. HCO3− + H3O+ → H2CO3 + H2O: hydrogencarbonate is the base, and weaker H2CO3 replaces stronger H3O+. HCO3− + OH− → CO3^2− + H2O: hydrogencarbonate is the acid and weaker product acid water is favoured. For each reaction give one point for balanced equation/role and one for direction using relative acid and conjugate base strengths (four points). The order alone gives neither quantitative extent/pH nor reaction speed; concentrations, solvent conditions and CO2 loss can matter. Two suitable limitations earn two points. H2CO3 → CO2 + H2O is subsequent chemistry, not another conjugate proton transfer. **6 points**

**Coverage limit:** Only Arrhenius, Brønsted and qualitative strengths/partner roles receive full-goal coverage. f1ed86f0 is touched only through amount/concentration calculation and 02634fdd through supplied titration stoichiometry; neither receives full practical coverage. The old whole introductory-phase cluster is not an assessed full competence. Accept equivalent correct answers.''',
    [('s5', 6, 'Vier typische anorganische Name/Formel-Paare (4) und Arrhenius-Wirkungen über H3O+/OH− in Wasser (2).', 'Four inorganic name/formula pairs (4) and aqueous Arrhenius effects (2).', [ARRHENIUS], ['acid_names_formulas', 'base_names_formulas', 'arrhenius_water']),
     ('s6', 6, 'Zwei Protolysegleichungen (2), alle korrespondierenden Paare (2), Wasserampholyt (1), Teilchen/Gemisch-Unterscheidung (1).', 'Two proton-transfer equations (2), all conjugate pairs (2), amphiprotic water (1), species/mixture (1).', [BRONSTED], ['proton_transfer', 'equations', 'conjugate_pairs', 'water_ampholyte', 'species_vs_mixture']),
     ('s7', 6, 'Zwei HCO3−-Partnerreaktionen mit korrekter Rolle/Richtung aus relativen Säure-/Basenstärken (4) und zwei qualitative Modellgrenzen (2).', 'Two hydrogencarbonate partner reactions with roles/directions from relative strengths (4) and two model limits (2).', [STRENGTH], ['relative_strengths', 'conjugate_base_order', 'favoured_direction', 'partner_dependence', 'ampholyte', 'qualitative_limits'])],
    '''**Context:** Compare two supplied carbonate materials in a hydrochloric-acid model. This is chemical paper modelling, not medicine advice.

**Material 1:** 50.0 mL 0.10-mol/L HCl; A contains 0.30 g NaHCO3; B contains 0.20 g CaCO3.

**Material 2:** Remaining acid after A consumes 14.3 mL 0.10-mol/L NaOH.

**Material 3:** Supplied model observations: gas with both materials; B reacts more slowly, with a more prolonged pH change in this model.

1. Explain the neutralization through Brønsted proton transfer. (7 points)
2. Calculate the initial HCl amount. (6 points)
3. Calculate the residual HCl amount and neutralized fraction. (9 points)
4. Compare maximum acid-binding amounts for the given masses and the supplied model reaction speed. State the limits of conclusions about any use in humans. (8 points)''',
    '''1. Acids donate protons and bases accept them. Carbonate/hydrogencarbonate accepts protons from H3O+, reducing the acid amount; subsequent CO2/water formation is part of the net reaction. **7 points**

2. n(HCl)=0.10 mol/L×0.0500 L=0.00500 mol. **6 points**

3. The 1:1 titration gives residual HCl 0.10×0.0143=0.00143 mol; consumed acid 0.00357 mol, fraction 71.4%. **9 points**

4. A can bind 0.30/84.01=0.00357 mol acid; B can bind 2×0.20/100.09≈0.00400 mol. B has higher maximum binding for these masses, while the supplied model gives A the faster initial reaction. Speed and capacity are distinct. This does not establish clinical suitability, dosage or duration of action. **8 points**''')
# Preserve the valid three calculations, and correct the old application inference only.
acid['examData']['taskContent'] = acid['examData']['taskContent'].replace('Vergleichen Sie Antazidum A und B anhand von Material 1 und 3 fachlich und beurteilen Sie, welches Mittel für eine schnelle Wirkung geeigneter ist.', 'Vergleichen Sie für die angegebenen Massen die maximal bindbare Säurestoffmenge sowie die vorgegebene Reaktionsgeschwindigkeit im Modellansatz. Begrenzen Sie Aussagen über eine Anwendung beim Menschen.')
old4 = '4. Beide Antazida neutralisieren Säure unter CO2-Bildung. Antazidum A mit Natriumhydrogencarbonat reagiert schneller und sorgt deshalb für eine raschere pH-Aenderung. Antazidum B kann wegen der geringeren Löslichkeit bzw. langsameren Umsetzung laenger wirken. Für eine schnelle Wirkung ist daher A geeigneter.  \n   **8 BE**'
new4 = '4. A bindet maximal 0,30 g / (84,01 g/mol) = 0,00357 mol Säure (2 BE). B bindet maximal 2 · 0,20 g / (100,09 g/mol) ≈ 0,00400 mol Säure (2 BE). Bei diesen Massen hat B die höhere Kapazität; A reagiert laut vorgegebener Modellbeobachtung anfangs schneller, Kapazität und Geschwindigkeit sind verschiedene Aussagen (2 BE). Daraus folgen weder medizinische Eignung noch Dosierung oder Wirkdauer beim Menschen (2 BE).  \n   **8 BE**'
assert old4 in acid['examData']['solutionContent']
acid['examData']['solutionContent'] = acid['examData']['solutionContent'].replace(old4, new4)
acid['examData']['scoring']['steps'][3]['description'] = 'Säurebindung A/B für vorgegebene Massen je 2 BE; Kapazität/Geschwindigkeit getrennt 2 BE; Grenzen beim Menschen 2 BE.'
acid['description'] = 'Die lernende Person kann eine materialgestützte E-Phasen-Papieraufgabe zu Arrhenius- und Brønsted-Konzept, relativem Säure-Base-Stärkevergleich sowie bereitgestellten Stoffmengen- und Titrationsdaten selbstständig und mit klaren Modellgrenzen bearbeiten.'
acid['descriptionEn'] = 'The learner can independently solve an introductory-phase paper assessment on Arrhenius and Brønsted concepts, relative acid-base strengths and supplied amount/titration data with clear model limits.'
acid['examData']['coveredStrands'] = ['BC_REAKTION']

for candidate in paper:
    ex = candidate['examData']
    assert ex['scoring']['maxPoints'] == sum(s['points'] for s in ex['scoring']['steps'])
    assert candidate['requires'] == PAPER_ADMISSION[candidate['id']]['goalIds']
    assert not any(x in ex['coveredGoalIds'] for x in [TITRATION, CARBONYL, SOAP])
    assert ex['reviewStatus'] == 'draft'

# Add a task/rubric matrix for each paper row; partial mathematical skills are explicit.
old_paper_rows = {
    IPA: [([ ], ['functional_group_classification', 'incidental_not_full_goal']), ([FORCES, PROPERTIES], ['hydrogen_bonds', 'dipole', 'boiling']), ([], ['yield_calculation_only']), ([PROPERTIES], ['specified_solvent_application'])],
    CAMP: [([MICELLES], ['amphiphilic_structure', 'micelles', 'emulsifying']), ([], ['calcium_stearate_stoichiometry_only']), ([WASHING], ['hardness', 'insoluble_soap']), ([WASHING], ['hard_water_application', 'bounded_choice'])],
    ACID: [([BRONSTED], ['proton_acceptance', 'net_neutralization']), ([], ['amount_calculation_only']), ([], ['supplied_titration_stoichiometry_only']), ([], ['capacity_and_model_speed_only', 'no_medical_advice'])],
}
new_paper_rows = {
    IPA: [([ISOMERS], ['recognize', 'represent', 'same_formula_compare']), ([FORCES], ['dipole', 'hydrogen_bond', 'ion_dipole', 'dispersion']), ([PROPERTIES], ['melting', 'boiling', 'solubility_prediction', 'molecular_solvent_choice', 'packing_limit'])],
    CAMP: [([MICELLES], ['interfaces', 'surface_tension', 'emulsification', 'micelle_distinction']), ([WASHING], ['temperature', 'concentration', 'hardness', 'dispersion', 'micelles', 'insoluble_soap', 'foam_limit'])],
    ACID: [([ARRHENIUS], ['acid_base_names_formulas', 'aqueous_arrhenius_effect']), ([BRONSTED], ['proton_transfer', 'all_conjugate_pairs', 'water_ampholyte', 'species_vs_mixture']), ([STRENGTH], ['relative_acid_base_strengths', 'favoured_direction', 'ampholyte_partner', 'qualitative_limits'])],
}
for candidate in paper:
    gid = candidate['id']
    rows = old_paper_rows[gid] + new_paper_rows[gid]
    assert len(rows) == len(candidate['examData']['scoring']['steps'])
    matrix.append({'examGoalId': gid, 'kind': 'paper_theory', 'coveredGoalIds': candidate['examData']['coveredGoalIds'], 'requires': candidate['requires'], 'requiresMeaning': 'Task-specific theoretical admission, separately authored from full-competence coverage; no copied course quota or practical-execution claim.', 'rows': [{'stepId': s['id'], 'points': s['points'], 'criterionDe': s['description'], 'goalIds': ids, 'assessedAspects': aspects, 'fullGoalClaimFromThisRowAlone': False} for s, (ids, aspects) in zip(candidate['examData']['scoring']['steps'], rows)]})

atomic_json('history/three-previous-paper-wholegoals.json', [goals[gid] for gid in [IPA, CAMP, ACID]])
atomic_json('inputs/eleven-current-covered-and-practical-ordinary-wholegoals.json', [goals[gid] for gid in [TITRATION, CARBONYL, SOAP, FORCES, PROPERTIES, ISOMERS, MICELLES, WASHING, ARRHENIUS, BRONSTED, STRENGTH]])
atomic_json('inputs/four-admission-foundation-ordinary-wholegoals.json', [goals[gid] for gid in [FORMULAS, MOL, MOLAR_MASS, EQUATIONS]])
atomic_json('paper-admission-rationale.author.json', PAPER_ADMISSION)
atomic_json('practical-wholegoals.author-draft.json', practical)
atomic_json('paper-wholegoals.author-draft.json', paper)
for candidate in practical + paper:
    atomic_json('wholegoals/' + candidate['id'] + '.author-draft.json', candidate)
arithmetic = {
    'propanoneYield': {'theoreticalMol': 1.50, 'isolatedMol': 1.05, 'yieldFraction': 1.05/1.50},
    'calciumStearate': {'initialStearateMol': 0.020, 'initialCalciumMol': 0.0060, 'neededStearateMol': 2*0.0060, 'maximumProductMol': min(0.020/2, 0.0060)},
    'modelAcid': {'initialMol': 0.10*0.0500, 'residualMol': 0.10*0.0143, 'consumedMol': 0.10*0.0500-0.10*0.0143, 'consumedPercent': 100*(0.10*0.0500-0.10*0.0143)/(0.10*0.0500), 'capacityAMol': 0.30/84.01, 'capacityBMol': 2*0.20/100.09},
    'syntheticTitrationArithmeticOnly': {'readingsAreNotObservations': True, 'consumptionMl': [19.92,19.96,19.94], 'meanMl': sum([19.92,19.96,19.94])/3, 'rangeMl': 19.96-19.92, 'concentrationMolL': 0.1000*(sum([19.92,19.96,19.94])/3)/20.00},
    'syntheticWashingPercentagePointChanges': {'BminusA':65-20, 'CminusB':80-65, 'DminusC':45-80},
}
atomic_json('coverage-and-arithmetic.author.json', {'role': 'AUTHOR design trace and arithmetic consistency; not independent review', 'planSHA256': PLAN_PIN, 'sourceCanonicalSHA256': PIN, 'matrix': matrix, 'arithmetic': arithmetic, 'reviewState': {'independentWholeContentReviews': 0, 'requiredIndependentWholeContentReviews': 2, 'E0': True, 'G0': True, 'HumanApproval': False, 'HumanTrial': False}, 'protectedScope': {'ordinary435Unchanged': True, 'normalOrHWrites': False, 'clusterWrites': False, 'viewWrites': False, 'globalGoalWrites': False, 'fruit00139854Touched': False}})
manifest = {'role': 'Six whole AUTHOR draft goals after pinned plan; no independent review or release', 'planSHA256': PLAN_PIN, 'source': {'path': str(SOURCE.relative_to(REPO)), 'sha256': PIN, 'wholeGoals': 629}, 'files': [], 'goals': []}
for candidate in practical + paper:
    destination = BASE / 'wholegoals' / (candidate['id'] + '.author-draft.json')
    manifest['goals'].append({'id': candidate['id'], 'wholeGoalSHA256': whole_hash(candidate), 'bytes': len(encoded(candidate)), 'path': str(destination.relative_to(REPO)), 'newGoal': candidate['id'] not in goals, 'requires': candidate['requires'], 'coveredGoalIds': candidate['examData']['coveredGoalIds'], 'maxPoints': candidate['examData']['scoring']['maxPoints'], 'passingPoints': candidate['examData']['scoring']['passingPoints'], 'reviewStatus': 'draft'})
for p in sorted(BASE.rglob('*')):
    if not p.is_file() or p.name == 'AUTHOR.manifest.json' or p.name.endswith('.tmp') or '__pycache__' in p.parts: continue
    manifest['files'].append({'path':str(p.relative_to(REPO)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes':p.stat().st_size})
manifest['consistencyOnly'] = {'pointSumsCorrect': True, 'threePracticalSingleGoalCoverage': True, 'noPracticalFullCoverageInPaper': True, 'bilingualWholeTasksAndSolutions': True, 'independentReviewClaimed': False, 'twoIndependentContentReviewsOpen': True, 'humanApproval':False, 'humanTrial':False, 'E0_G0':True}
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == PIN
assert hashlib.sha256(PLAN.read_bytes()).hexdigest() == PLAN_PIN
atomic_json('AUTHOR.manifest.json', manifest)
print(json.dumps({'writtenWholeGoals':len(manifest['goals']), 'goalSummary':manifest['goals'], 'sourceCanonicalSHA256Unchanged':PIN},ensure_ascii=False,indent=2))
