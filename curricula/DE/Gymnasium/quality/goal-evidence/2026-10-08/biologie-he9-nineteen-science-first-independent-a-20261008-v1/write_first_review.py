"""Serialize the explicitly authored independent science-A judgments below.

This writes only this new QA directory. Mechanical equality is not science QA.
No active review record, goal, ledger, publication or asset is changed.
"""
from __future__ import annotations

import hashlib
import json
import pathlib
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parents[7]
OUT = pathlib.Path(__file__).resolve().parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-nineteen-current391-science-author-root-v1'


def read(path):
    return json.loads(path.read_text())


def digest(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def object_digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


# These nineteen judgments were individually authored after reading the whole
# bilingual descriptions, materials, tasks, answers and positive expectations.
# Nothing in this table is inferred from a native validator PASS or an ID/hash.
JUDGMENTS = [
    ('KEEP', 'HOLD_profile_scope',
     'Hornhaut, Iris/Pupillenöffnung, Linse, Glaskörper, Netzhaut und Sehnerv sind räumlich richtig beschrieben. Der zweite Fall korrigiert echte Beschriftungs- und Körper/Öffnungsfehler; er ist mehr als eine umbenannte erste Aufgabe. Beide DE/EN-Fälle sind fachlich gleichwertig.',
     'Die Zielbeschreibung lässt Auge ODER Ohr zu. Beide verpflichtenden P-Erwartungen verlangen hingegen ausschließlich Augenstrukturen. Die richtigen Augenfälle bleiben erhalten, ersetzen aber keine ausgewiesene zulässige Ohr-Alternative im ganzen Zielprofil.',
     'Eine räumliche Organstruktur beschreiben und in einer veränderten Darstellung zuordnen ist eine kohärente Kompetenz; die Quellenalternative erzwingt weder beide Organe noch einen Split.'),
    ('KEEP', 'HOLD_profile_scope',
     'Lichtbrechung durch Hornhaut/Linse, das umgekehrte Netzhautbild, Rezeptortransduktion und Irisfunktion sind korrekt voneinander getrennt. Nahakkommodation, Stäbchen/Zapfen und die Grenze eines inneren Schirm-Betrachters sind sachgerecht; beide Sprachen erhalten dieselben Modellgrenzen.',
     'Retina-Bildentstehung ODER Schallempfang ist die ganze aktuelle Zielalternative. P verlangt zwingend Retina/Refraktion und Akkommodation ohne eine Erfüllungsmöglichkeit über Schallleitung/Haarzell-Reizaufnahme. Ein Dissent-Hinweis außerhalb der Coverage repariert diese Engführung nicht.',
     'Der gewählte Sinnesweg verbindet physikalische Aufnahme mit Rezeptortransduktion. Die organbezogenen Alternativen dürfen gewählt werden; es gibt keine neue Pflicht zu beiden.'),
    ('KEEP', 'PASS_science_first',
     'Der ausdrücklich vereinfachte sensorische–zentrale–motorische Weg unterscheidet lokale Rückenmarksverschaltung von paralleler aufsteigender bewusster Verarbeitung. Die Ampelvariation fordert die fehlenden zentralen und gerichteten Bahnen. Signale werden nicht als unverändert fließender Reizstoff beschrieben; Synapsen werden vorsichtig meist chemisch eingeordnet.',
     'Beschreiben, ergänzen und den lokalen Weg vom bewussten Kontext unterscheiden zeigen denselben Informationsverarbeitungs-Kern in zwei veränderten Modellen. DE/EN transportieren dieselben Aussagen.',
     'Leitung und einfache zentrale Verknüpfung bilden einen zusammenhängenden Rezeptor–Verarbeitung–Effektor-Weg; keine unabhängige zweite Kompetenz wird als Abschlusszwang ergänzt.'),
    ('KEEP', 'PASS_science_first_with_precision_note',
     'Das UV-Fenster einer gegebenen Bienenart und das 25-kHz-Fenster eines angegebenen Hundes sind ausdrücklich schematische Beispiele. Aus anderer Rezeptorempfindlichkeit werden weder subjektive Tierbilder noch generell bessere Sinne oder alle Arten abgeleitet. Der Wechsel von Licht zu Schall ist sinnvoller Transfer.',
     'Beide Sprachen erhalten die gleiche Trennung physikalischer Reizbereiche, Wahrnehmungsmöglichkeiten und Modellgrenzen. Für Fall 2 empfehle ich, das physikalisch konstant gehaltene Signal ausdrücklich als gleichen Schallpegel zu benennen; unveränderte loudness ist als subjektive Empfindungsgröße missverständlich.',
     'Ein Empfindlichkeitsmodell benutzen und seine Aussagegrenze prüfen ist ein einheitlicher Modellierungsprozess. Die Präzisionsnotiz ändert keine biologische Zielkompetenz.'),
    ('KEEP', 'PASS_science_first',
     'Schallbelastung/Haarzellschäden, mechanischer Augenschutz und Risiken intensiver UV-Exposition sind plausibel. Alkohol/Drogen werden als Beeinflussung von Nervensignalverarbeitung von einer akuten Hornhaut- oder Trommelfellverletzung unterschieden. Es wird kein absichtlicher Schädigungs- oder Konsumversuch verlangt.',
     'Die Erklärung des ganzen Sinneswegs begründet Schutzhandlungen in zwei tatsächlich verschiedenen Gefährdungsvignetten. DE/EN unterscheiden Organverletzung und zentralen Verarbeitungseinfluss gleichwertig.',
     'Gefährdung entlang des Sinneswegs erkennen und Schutz begründen ist kohärent; eine fachlich falsche Beschränkung auf äußerlich intakte Organe wird gerade widerlegt.'),
    ('KEEP', 'PASS_science_first',
     'Reife menschliche Erythrozyten als kernlose Zellen, kernhaltige verschiedenartige Leukozyten, Thrombozyten als Zellfragmente und flüssiges Plasma werden richtig unterschieden. Die zweite Materialdarstellung verwendet Antikoagulation, damit zellarme Flüssigkeit Plasma und nicht Serum ist.',
     'Die Zuordnung im Blutausstrich und im Zentrifugenmodell verlangt Eigenschaftsverständnis in unterschiedlichen Darstellungen. Aussagen werden nicht auf alle Tiere oder alle Entwicklungsstufen der Erythrozyten verallgemeinert.',
     'Blutbestandteile anhand ihrer Eigenschaften in verschiedenen Darstellungen unterscheiden ist ein Klassifikationskern.'),
    ('KEEP', 'PASS_science_first',
     'Hämoglobinabhängiger Sauerstofftransport, gelöste Stoffe im Plasma, primärer Thrombozytenverschluss und Fibringerinnung werden nicht verwechselt. Leukozyten/Antikörper und plasmatische Gerinnungsfaktoren verdeutlichen komplementäre Funktionen. Das Verlustmodell A/B behauptet nicht, allein Erythrozyten könnten alle Aufgaben leisten.',
     'Funktionen ganzen Bestandteilen zuordnen und begründete Folgen fehlender Bestandteile erklären ist positiver Struktur–Funktions-Nachweis. Beide Sprachfassungen bewahren die Gerinnungs- und Immungrenzen.',
     'Die gemeinsame Blutbestandteil–Funktion-Zuordnung wird auf Ausfallmodelle angewandt; die Aufzählung der Funktionen wird hier nicht zu mehreren unabhängigen Verfahrenszielen.'),
    ('KEEP', 'PASS_science_first',
     'Die Transfusion wird ausdrücklich mit Erythrozytenkonzentraten modelliert. A/D-negative Empfänger mit Anti-B werden nicht mit B- oder D-positiven Zellen gleichgesetzt. Anti-D wird als mögliche erworbene Alloimmunisierung, nicht als naturgegeben bei allen D-negativen Menschen behandelt. Anti-A+/Anti-D+/Anti-B− ergibt im angegebenen Typisierungsmodell A/D-positiv.',
     'ABO-Antigen/Antikörper, D-Antigen, unterschiedliche Plasma-Regeln und zusätzliche Kreuzprobe bleiben sichtbar. Die Modelle sind keine klinische Auswahl oder allgemeine Sicherheitsgarantie. DE/EN sind gleichwertig.',
     'Die Bindung zwischen Antigen, Reagenz/Antikörper und Verträglichkeit ist derselbe Zuordnungsprozess in Typisierung und Erythrozyten-Transfusionsmodell.'),
    ('KEEP', 'PASS_science_first',
     'Angeborene Aufnahme durch Phagozyten, aktivierte spezifische Lymphozyten/Antikörper und Gedächtnis werden als zusammenwirkende Funktionen beschrieben. Die Transplantationsvariation verbindet Erkennung fremder Oberflächen mit T-Zell-Reaktion und dem Infektionsrisiko unter Immunsuppression; sie behauptet keine pauschale Erfolgsgarantie.',
     'Infektion und Transplantat sind sinnvolle unterschiedliche Anwendungen des Immunreaktions-Kerns. DE/EN erhalten die gleiche Trennung Mechanismus/Modell/medizinischer Grenze. Aktive/passive Impfung aus der ganzen HE-Einheit wird hierdurch nicht zusätzlich als geprüft behauptet.',
     'Immunerkennung und nachfolgende Reaktion wird in zwei Situationen beschrieben; die Fallvariation erzwingt kein unabhängiges zweites Fachverfahren.'),
    ('KEEP', 'PASS_science_first',
     'HIV-Infektion ist von fortgeschrittenem AIDS unterschieden; ART unterdrückt Replikation und ermöglicht lange gesundere Lebensführung, ist keine allgemeine Heilung. Alltagskontakt wird nicht zur Übertragungsroute erklärt. U=U wird ausdrücklich auf sexuelle Übertragung bei anhaltend nicht nachweisbarer Viruslast unter ART begrenzt.',
     'Die Modelle verbinden Immunschwächung, Stadium, Expositionswege und Prävention ohne Risikogruppenstigma. Es entstehen weder individuelle Diagnosen noch neue Test-/Behandlungsalgorithmen. Die WHO-Faktenlese bestätigt die präzise sexuelle U=U-Geltung; DE/EN erhalten sie.',
     'HIV anhand desselben Infektions-/Immunmechanismus und verschiedener Expositionssituationen einordnen ist kohärent.'),
    ('KEEP', 'PASS_science_first',
     'FSH/Follikel, Estradiol/Endometrium, LH/Ovulation, Progesteron/Gelbkörper und Hormonabfall/Menstruation sind richtig zugeordnet. Die HPG-Achse wirkt über Blut und Rezeptoren an Zielgeweben. Pubertätsbeginn und Zyklusdauer werden nicht auf eine universelle Zahl oder sichere Kalendermethode reduziert.',
     'Zyklus und körperliche Reifung zeigen dieselbe Hormonsignal–Zielgewebe-Steuerung in geänderten Zusammenhängen. Die Modelle behaupten weder eine allein hormonale Bestimmung aller sozialen/psychischen Entwicklung noch eine persönliche medizinische Vorhersage. DE/EN stimmen überein.',
     'Derselbe hormonelle Steuerungsmechanismus wird in den ausdrücklich im Ziel genannten physiologischen Kontexten beschrieben; das fakultative detaillierte Regelkreisziel wird nicht obligatorisch hineingezogen.'),
    ('SPLIT_REVIEW', 'HOLD_semantic_atomicity',
     'Die biologischen Aussagen der beiden Fälle sind richtig: Barrieremethode und kombinierte hormonelle Pille haben unterschiedliche Wirkweisen; Schwangerschafts- und Infektionsschutz sind getrennt. Verantwortliche Fürsorge wird nicht aus Wohlstand oder geplanter Schwangerschaft allein abgeleitet; freiwillige Entscheidungen und körperliche Autonomie bleiben geschützt.',
     'Das ganze Ziel bündelt die fachlich begründete Beurteilung von Verhütungsmethoden mit sozial-ethischer Reflexion verantwortlicher Elternschaft. Genau die beiden P-Erwartungen zeigen verschiedene Erfolgskriterien: Mechanismus/Anwendung/STI-Grenzen gegenüber Fürsorge/Zeit/Unterstützung. Eine Person kann die Methoden sicher beurteilen, ohne Elternschaftskriterien reflektieren zu können, oder umgekehrt. Das gemeinsame Themenwort Familienplanung macht diese Leistungen nicht semantisch atomar.',
     'Deshalb unabhängiger SPLIT_REVIEW, kein fachlich falscher Fall und keine unmittelbare aktive Änderung. Ein Quellen- und Scope-geprüfter Split oder eine substantiell enger integrierte Kompetenz muss vor ganzem A/D/P-Abschluss adjudiziert werden.'),
    ('KEEP', 'PASS_science_first',
     'Aktuelle freiwillige Zustimmung ist von früherer Zustimmung und äußerem Gruppendruck getrennt. Normen liefern weder einen biologischen Zwang noch eine Rechtfertigung für Abwertung oder Weitergabe eines privaten Bildes ohne Einverständnis. Die nicht expliziten Erwachsenen-Vignetten verlangen keine persönliche Offenlegung.',
     'Respekt, Grenzen, Perspektivwechsel und begründete Verantwortung werden in verändertem Beziehungskontext diskutiert. DE/EN erhalten denselben nicht wertenden, freiwilligen und argumentativen Anspruch. Dies ist keine Rechtsberatung oder neue Datenschutz-Runtimearbeit.',
     'Eine sozial-ethische Diskussion mit nachvollziehbaren Kriterien ist hier ein Argumentationskern; die unterschiedlichen Vignetten bleiben Anwendungen desselben Kerns.'),
    ('KEEP', 'PASS_science_first',
     'TSH stimuliert Schilddrüsenwirkung, Thyroxin hemmt weitere TSH-Bildung im ausdrücklich vereinfachten Modell. Abfall und Anstieg führen in negativer Rückkopplung zur Gegenwirkung; zwei stimulierende Kanten wären dagegen positiv. Verzögerung, ausgelassener Hypothalamus und die Grenze einer pauschalen Übertragung auf alle Zyklusphasen sind benannt.',
     'Fall 1 verlangt ein gerichtetes Wirkmodell und Deutung einer Abweichung; Fall 2 prüft Vorzeichen und eine entgegengesetzte Störung. DE/EN trennen Wirkbeziehung vom Stofftransport. Der offizielle HE9.3-Status ist fakultativ, nicht Pflicht für jeden HE-Lernenden.',
     'Modellierung und Interpretation derselben Rückkopplungsstruktur bilden einen einheitlichen Modellierungsprozess; keine universelle Regelkreis- oder Schilddrüsenpflicht wird abgeleitet.'),
    ('KEEP', 'PASS_science_first',
     'DNA-Verdopplung liegt vor der jeweiligen Teilungsart; Meiose I trennt Homologe, Meiose II ohne neue Replikation Schwesterchromatiden. Die Modellzahlen 2n=4→n=2 und 2n=6→n=3 sind richtig. Mitose erhält den diploiden Satz. Centromerbezogene Chromosomenzahl, Chromatiden/DNA-Menge, Gameten und Befruchtung sind getrennt.',
     'Die Fehlerskizze verlangt echte Korrektur von Reihenfolge, Trennobjekt und Ploidie. Vier meiotische Produkte werden nicht zu vier gleichwertigen menschlichen Eizellen erklärt. DE/EN stimmen inklusive dieser Oogenesegrenze überein.',
     'Ein gemeinsamer Chromosomenverteilungs-Vergleich mit gametischer Bedeutung ist ein kohärenter Modellprozess, kein bloßes Bündel isolierter Faktenlisten.'),
    ('KEEP', 'PASS_science_first',
     'Die ausdrücklich synthetischen Pflanzenmodelle verwenden vollständige Dominanz: Aa×aa ergibt 1:1 und Aa×Aa 1:2:1 im Genotyp beziehungsweise 3:1 im Phänotyp. Eine Wahrscheinlichkeit ist kein garantiertes Zahlenverhältnis der nächsten Nachkommen. Dominanz bedeutet weder häufig noch wertvoller; das rezessive Allel verschwindet nicht.',
     'Testkreuzung und Folgegeneration stellen verschiedene Genotypableitungen bereit. DE/EN haben gleiche Voraussetzungen und Wahrscheinlichkeiten. Zungenrollen wird trotz historischem HE-Beispiel nicht als bewiesenes einfach mendelndes Menschenmerkmal eingesetzt.',
     'Genotyp-/Phänotyp-Ableitung unter angegebenen Vererbungsannahmen ist eine einheitliche Analyseleistung.'),
    ('KEEP', 'PASS_science_first',
     'Bei vollständiger Ausprägung ohne Neumutation ergeben unauffällige Eltern mit betroffenem aa-Kind beide Aa; das unauffällige Geschwister bleibt AA oder Aa. Im dominant beschriebenen Dd×dd-Modell sind betroffenes und unbetroffenes Kind nachvollziehbar Dd und dd. 25% beziehungsweise 50% gelten pro modellierter Befruchtung, nicht als Pflicht des nächsten Kindes.',
     'Die Änderung von rezessivem zu dominantem synthetischem Krankheitsmodell fordert neue Stammbau-Schlüsse. Reale Familien, Diagnose und Würde werden nicht aus den Modellen bewertet. Beide Sprachfassungen behalten alle Schlussvoraussetzungen.',
     'Gesicherte und mögliche Genotypen aus einem Modell-Stammbaum erschließen ist dieselbe Evidenzroutine; keine reale klinische Beratung wird verlangt.'),
    ('KEEP', 'PASS_science_first',
     '21 Paare außer drei Chromosomen 21 plus XX ergeben 47,XX,+21. 22 Autosomalpaare plus einzelnes X ergeben 45 und eine Monosomie. Numerische Abweichung wird von kleinen strukturellen/Sequenzänderungen und Auflösungsgrenzen eines Karyogramms unterschieden; Homologe müssen keine gleichen Allele haben.',
     'Die beiden Modelle verändern Abweichungstyp und Datenlage. Es werden keine Fähigkeiten, Würde oder vollständigen klinischen Verläufe aus Chromosomenzahlen abgeleitet. DE/EN sind gleichwertig; die NHGRI-Faktenlese bestätigt die numerischen Grundbegriffe.',
     'Karyogramm ordnen, zählen und Aussagegrenzen prüfen ist ein gemeinsamer Darstellungs-/Datenprozess.'),
    ('KEEP', 'PASS_science_first',
     'Sequenzuntersuchung verändert das Genom nicht und wird von somatischer Übertragung einer funktionellen Genkopie und DNA-Klonierung unterschieden. Beim Insulinmodell sind intronfreie codierende DNA, Vektor/Steuersignale, Produktionszellen, Expression und Proteinaufbereitung richtig skizziert. Gabe des Proteins ist keine Gentherapie des Empfängers und keine Klonierung der Spenderperson.',
     'Methodenvergleich und recombinant-protein-Variation fordern eine begründete Ziel–Ablauf–Produkt-Zuordnung. Grenzen von Genkopie-Therapie, Keimbahn und vollständigem Laborkurs werden wahrheitsgemäß benannt. DE/EN erhalten dieselben Unterscheidungen; NHGRI bestätigt DNA- versus Organismusklonierung.',
     'Grundlegende Methoden anhand Ziel, grundlegendem Ablauf und Produkt unterscheiden ist hier ein einheitlicher Vergleichsprozess; es werden keine drei vollständigen Laborverfahren als Atom verlangt.'),
]


def main():
    if (OUT / 'first-science-verdicts.independent-a.freeze.json').exists():
        raise RuntimeError('Independent first verdicts are sealed; use a new continuation instead of rewriting history')
    recorded = datetime.now(timezone.utc).isoformat()
    author_freeze = AUTHOR / 'nineteen-whole-science-native-P19-author-input.first.freeze.json'
    freeze = read(author_freeze)
    if digest(author_freeze)['sha256'] != 'aa6e241a08ed75a0656aca63369e58e9eabb0361f85013439a12175528beb168':
        raise RuntimeError('The expected author freeze changed')
    for entry in freeze['files']:
        if digest(ROOT / entry['path']) != entry:
            raise RuntimeError('Author input changed: ' + entry['path'])

    goals = read(AUTHOR / 'current19-whole-DEEN-goals.actual.json')['goals']
    cases = read(AUTHOR / 'nineteen-whole-goals-thirty-eight-complete-DEEN-cases.author.json')['goals']
    candidates = read(AUTHOR / 'P19.current-text-preimage.author.candidates.json')['goals']
    records = [json.loads(line) for line in (AUTHOR / 'P19.current-text-preimage.author.review.jsonl').read_text().splitlines()]
    assert len(goals) == len(cases) == len(candidates) == len(records) == len(JUDGMENTS) == 19
    for goal, case_group, candidate, record in zip(goals, cases, candidates, records):
        assert goal['id'] == case_group['goalId'] == candidate['goalId'] == record['goalId']
        assert candidate['profile'] == record['profile']
        assert record['status'] == 'needs_human_review' and record['reviewAuthority'] == 'ai_candidate'
        assert record['evidenceLevel'] == 'E1' and record['maximumClaimScope'] == 'G1'
        assert len(case_group['cases']) == len(candidate['profile']['applicationCaseBriefs']) == 2
        for whole_case, brief in zip(case_group['cases'], candidate['profile']['applicationCaseBriefs']):
            assert whole_case['id'] == brief['id']
            for lang, suffix in [('de', 'De'), ('en', 'En')]:
                assert brief['taskDemand' + suffix] == whole_case['material'][lang] + ' ' + whole_case['task'][lang]
                assert brief['expectedPerformance' + suffix] == whole_case['modelAnswer'][lang]
                assert brief['understandingFocus' + suffix] == ' '.join(e['essentialUnderstanding' + suffix] for e in candidate['profile']['expectations'])

    canonical_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
    canonical = {g['id']: g for g in read(canonical_path)['goals']}
    content_fields = ['id', 'title', 'titleEn', 'description', 'descriptionEn', 'contains', 'requires', 'tags', 'dimensionTags', 'applicability', 'sourceRef']
    content_changes = []
    for goal in goals:
        for field in content_fields:
            if goal.get(field) != canonical[goal['id']].get(field):
                content_changes.append({'goalId': goal['id'], 'field': field})
    if content_changes:
        raise RuntimeError('Selected scientific goal content changed: ' + repr(content_changes))

    rows = []
    for ordinal, (goal, case_group, candidate, record, judgment) in enumerate(zip(goals, cases, candidates, records, JUDGMENTS), 1):
        description, verdict, science, positive, atom = judgment
        rows.append({
            'ordinal': ordinal, 'goalId': goal['id'], 'titleDe': goal['title'], 'titleEn': goal['titleEn'],
            'wholeGoalBodySHA256': object_digest(goal), 'wholeCasesSHA256': object_digest(case_group),
            'wholePositiveCandidateSHA256': object_digest(candidate),
            'caseIds': [c['id'] for c in case_group['cases']],
            'descriptionFirstScientificVerdict': description,
            'scienceFirstVerdict': verdict, 'wholeBilingualMaterialTaskModelAnswerReasonDe': science,
            'wholeBilingualPositiveUnderstandingAndTransferReasonDe': positive,
            'semanticCoherenceAssessmentDe': atom,
            'bilingualScope': 'Whole DE/EN description, both whole materials/tasks/model answers, expectations, coverage, variation and application briefs read; no divergent scientific demand identified.',
            'sourceReadingScope': case_group['sourceScope'],
            'nationalRouteClosure': 'not claimed; per-route original duties and actual final view/page bindings still require separate targeted QA',
            'finalNativeDescriptionGate': 'pending', 'finalNativePositiveBinding': 'pending',
            'finalNativeVisualGate': 'pending; no actual image inspected in this science-first review',
            'humanApproval': False, 'strictCompletionClaimed': False,
        })

    findings = [
        {
            'findingId': 'HE9-A-P-ALT-01', 'severity': 'blocking whole-goal positive-profile scope',
            'goalIds': [goals[0]['id'], goals[1]['id']],
            'inputPointers': [f"goals/{i}/profile/coverageExpectations/requiredExpectationIds" for i in [0, 1]],
            'actualObservation': 'Both core and transfer expectations are unconditionally required and exclusively eye-specific; alternativeExpectationGroups is empty although both current descriptions and the whole original HE9.1 source permit the eye OR ear route.',
            'whyNotResolvedByDissent': 'The dissent correctly says both organs are not universally required, but the profile itself still rejects ear-only performance. Correct eye examples are legitimate; an unconditional eye-only coverage contract for the whole OR goal is narrower than that goal.',
            'smallestScientificCorrection': 'Retain the correct eye cases and unchanged OR descriptions. Make essential understanding and coverage conditional on the chosen organ, with content-specific complete eye/ear alternatives and two independent changed-case performances in the chosen route. Do not require both organs and do not count merely selecting a route as assessed performance.',
            'closureRequired': 'Independent targeted recheck of the actual changed whole coverage/expectations and any newly authored ear material; no hash-only repair.',
        },
        {
            'findingId': 'HE9-A-ATOM-12', 'severity': 'blocking semantic atomicity adjudication',
            'goalIds': [goals[11]['id']],
            'inputPointers': ['whole current description', 'goals/11/profile/expectations/0', 'goals/11/profile/expectations/1'],
            'actualObservation': 'The whole goal, materials and P expectations bundle mechanism/application/STI-based comparison of contraception with social-ethical care/time/support-based reflection on responsible parenthood.',
            'independentAcquisitionCounterexamples': ['Correct condom/combined-pill mechanism and STI-limit assessment does not show reflection about dependable parental care and child wellbeing.', 'A reasoned responsible-parenthood judgment does not show understanding of barrier/hormonal contraception and STI distinctions.'],
            'smallestScientificCorrection': 'Keep the correct cases as reusable material. Adjudicate a source- and scope-bound split into contraception-method judgment and responsible-parenthood reflection, or supply a genuinely narrower single integrated decision competence whose indispensable evidence is one routine. A shared topic heading or repetition of both demands is insufficient.',
            'closureRequired': 'Whole scientific and semantic recheck of the proposed exact descriptions, P contracts, source roles and applicability; no immediate active split is approved by this review.',
        },
        {
            'findingId': 'HE9-A-PRECISION-04', 'severity': 'nonblocking precision recommendation',
            'goalIds': [goals[3]['id']], 'caseId': cases[3]['cases'][1]['id'],
            'actualObservation': 'The model says loudness is unchanged while comparing an inaudible human stimulus with audible dog reception. This can mean fixed physical sound level colloquially, but loudness is an experienced quantity.',
            'minimalDe': 'Der Schallpegel des Tons am Ort der beiden modellierten Tiere bleibt gleich.',
            'minimalEn': 'The sound pressure level of the tone at the positions of both modelled animals is the same.',
            'scienceImpact': 'The intended frequency-window comparison and all answer conclusions remain valid. Do not turn this into an unrequested style rewrite or new acoustic measurement obligation.',
        },
    ]
    write('nineteen-whole-first-science-verdicts.independent-a.json', {
        'artifactKind': 'independent-machine-science-first-review-not-final-native-DPV',
        'recordedAt': recorded, 'reviewer': '/root/chemistry_open_packets; independent science reviewer A',
        'authorInputFreeze': digest(author_freeze), 'peerBOutputsRead': False,
        'firstVerdictsSealedBeforeSubstantiveAuthorOrPeerDiscussion': True,
        'wholeGoalsReviewed': 19, 'wholeBilingualCasesReviewed': 38,
        'descriptionKeep': 18, 'descriptionSplitReview': 1,
        'scienceFirstReady': 16, 'scienceFirstHeldGoalIds': [goals[i]['id'] for i in [0, 1, 11]],
        'allModelAnswerScientificMechanisms': 'No demonstrated erroneous biological model-answer mechanism. Scope/atomicity holds remain and a physical-signal precision recommendation is separate.',
        'requiredMachineNativeFinalGates': 'A/M technical claims, final actual images/V, final D pages, source/operator/view bindings and current P final image/page preimages remain pending.',
        'strictNetGain': 0, 'newStrictScientificCompletions': 0, 'restoredStrictBindings': 0,
        'humanApproval': False, 'activeWrites': 0, 'records': rows,
    })
    write('first-findings.independent-a.json', {
        'artifactKind': 'independent-science-first-first-findings', 'recordedAt': recorded,
        'authorInputFreeze': digest(author_freeze), 'findings': findings,
        'sourceCompletenessBoundary': 'The nineteen selected legacy descriptions are authored condensations, not literal nineteen numbered official operators. This review does not close every adjacent duty in the original four HE units or any uninspected regional route.',
        'adjacentWholeOriginalDutiesNotClaimedClosed': [
            'HE9.1 selected eye pathway also lists ametropia/correction and rhodopsin; cerebral task distribution is an original unit facet. Current case approval is not proof these whole-unit facets have been allocated and closed nationally.',
            'HE9.2 whole source includes haemophilia and active/passive immunization; selected blood/immune cases do not independently close these adjacent unit duties.',
            'HE9.3 whole source additionally names pregnancy, birth and termination, and physical/mental maturation; no blanket whole-unit closure is claimed from the narrower current descriptions.',
        ],
        'universalDutyNotInferred': 'Source partners, raw applicability, synthetic examples and a whole unit heading are not themselves universal obligations for every goal or learner view.',
    })

    pdf = pathlib.Path('/tmp/skillpilot-bio-he-nine-primary-root-20261008/g9-biologie.official.pdf')
    source_sha = hashlib.sha256(pdf.read_bytes()).hexdigest()
    assert source_sha == '93257f9be96e9bd288d187eb63e3e33ca28debdb2511dcd068e9abf82bc5b5f1'
    write('actual-primary-readings.independent-a.receipt.json', {
        'artifactKind': 'actual-independent-primary-reading-receipt', 'recordedAt': recorded,
        'officialCurriculum': {
            'url': 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-biologie.pdf',
            'sha256': source_sha, 'bytes': pdf.stat().st_size,
            'cacheRole': 'Already rehydratable local official reading cache; reviewer independently read actual whole pages, not only author receipt.',
            'actualCommand': 'pdftotext -layout -f 23 -l 27 /tmp/skillpilot-bio-he-nine-primary-root-20261008/g9-biologie.official.pdf -',
            'physicalPagesReadInFull': [23, 24, 25, 26, 27], 'printedPagesReadInFull': [22, 23, 24, 25, 26],
            'wholeUnits': ['9.1', '9.2', '9.3', '9.4'],
            'decisiveScopeObservations': ['9.1 eye OR ear is an explicit source alternative.', '9.3 simple hormonal feedback model is listed as facultative.', '9.4 old suggested tongue-rolling example does not prove a simple Mendelian human inheritance claim.'],
            'fullOfficialTextRedistributed': False,
        },
        'primaryMedicalScientificFactReadings': [
            {'url': 'https://www.who.int/en/news-room/fact-sheets/detail/hiv-aids', 'publicationDateObserved': '2026-07-27', 'actualReadScope': 'Returned full substantive overview, signs, transmission, prevention and treatment sections.', 'checkedClaim': 'HIV versus AIDS, ART suppression rather than general cure, nontransmitting ordinary contact, U=U limited to sexual transmission with undetectable viral load under ART.'},
            {'url': 'https://www.blood.co.uk/why-give-blood/blood-types/', 'actualReadScope': 'Returned whole main ABO/Rh content, especially antibody/antigen tables and D antigen.', 'checkedClaim': 'A/B/AB/O antigen/antibody distinctions and Rh D. No donor percentage is used as a model premise.'},
            {'url': 'https://www.blood.co.uk/why-give-blood/demand-for-different-blood-types/the-rh-system/', 'actualReadScope': 'Whole substantive page, especially acquired alloantibody and D exposure.', 'checkedClaim': 'D-negative status does not entail naturally present anti-D; exposure can cause alloimmunization and additional blood groups remain relevant.'},
            {'url': 'https://www.who.int/news-room/fact-sheets/detail/oral-contraceptives', 'publicationDateObserved': '2025-12-23', 'actualReadScope': 'Returned whole main fact sheet; only overview/mechanism/STI/suitability distinctions used.', 'checkedClaim': 'Combined-pill ovulation inhibition differs from progestin-only mechanisms; oral pills do not provide STI protection. No dosing, personal eligibility or medical recommendation is derived.'},
            {'url': 'https://www.genome.gov/about-genomics/fact-sheets/Chromosome-Abnormalities-Fact-Sheet', 'publicationDateObserved': '2020-08-15', 'actualReadScope': 'Returned whole main text including numerical/structural abnormalities and chromosome counts.', 'checkedClaim': 'Typical 46, trisomy/monosomy and karyogram count/resolution concepts. Older simplified clinical/sex/age statements not copied or used as universal claims.'},
            {'url': 'https://www.genome.gov/about-genomics/fact-sheets/Cloning-Fact-Sheet', 'actualReadScope': 'Targeted actual returned sections types of artificial cloning and how genes are cloned; not a whole page claim.', 'checkedClaim': 'DNA/gene cloning versus reproductive cloning and vector-based DNA-copy principles.'},
        ],
        'notReadAndNotClaimed': ['NCBI captcha-protected material: no actual whole primary content read or asserted.', 'No whole non-HE regional primary source bundle read or approved in this science-first pass.'],
        'humanClinicalAdvice': False, 'realLearnerOrPatientDataUsed': False,
    })

    inputs_config_path = ROOT / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
    config = read(inputs_config_path)
    routing = {goal['id']: [] for goal in goals}
    distinct_rows = 0
    he_mapping_path = ROOT / 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_biology_lower_secondary_source_extraction_to_canonical_biology.review.json'
    he_mapping = read(he_mapping_path)
    he_source_path = ROOT / he_mapping['sourceExtractionPath']
    he_source = {g['id']: g for g in read(he_source_path)['sourceGoals']}
    for raw_path in config['mappingPaths']:
        mapping_path = ROOT / raw_path
        mapping = read(mapping_path)
        for i, decision in enumerate(mapping['decisions']):
            selected = [goal_id for goal_id in decision.get('canonicalGoalIds', []) if goal_id in routing]
            if selected:
                distinct_rows += 1
            for goal_id in selected:
                routing[goal_id].append({'mappingPath': raw_path, 'mappingSHA256': digest(mapping_path)['sha256'], 'decisionIndex': i, 'sourceGoalId': decision['sourceGoalId'], 'sourceSpan': decision.get('sourceSpan'), 'decision': decision.get('decision'), 'allCanonicalPartners': decision.get('canonicalGoalIds', []), 'wholeRegionalOperatorReviewClaimed': False})
    he_rows = []
    for goal in goals:
        decisions = [d for d in he_mapping['decisions'] if goal['id'] in d.get('canonicalGoalIds', [])]
        assert len(decisions) == 1
        decision = decisions[0]
        source_goal = he_source[decision['sourceGoalId']]
        he_rows.append({'goalId': goal['id'], 'wholeMappingDecision': decision, 'wholeAuthoredSourceGoal': source_goal, 'sourceTextRole': 'Legacy authored competence condensation; not a literal PDF quote or proof of official numbered suboperator.', 'actualWholePrimaryReading': 'Independent full physical23–27 / printed22–26 receipt above.'})
    write('current-source-route-map.independent-a.json', {
        'artifactKind': 'source-route-routing-observation-not-national-source-approval',
        'recordedAt': recorded, 'publicationInputs': digest(inputs_config_path),
        'mappingPathsObserved': len(config['mappingPaths']), 'distinctPartnerRowsObserved': distinct_rows,
        'countsAreNotUniversalDuties': True, 'wholeNonHEOriginalOperatorReviewClaimed': False,
        'wholeCurrentHEMappingInput': digest(he_mapping_path), 'wholeCurrentHEExtractionInput': digest(he_source_path),
        'selectedHEWholeRows': he_rows,
        'perGoalRoutes': [{'goalId': g['id'], 'partnerRowCount': len(routing[g['id']]), 'rows': routing[g['id']]} for g in goals],
        'strictCompletionClaimed': False,
    })
    write('actual-input-and-profile-verification.independent-a.json', {
        'artifactKind': 'completed-local-mechanical-input-binding-verification-not-scientific-approval',
        'recordedAt': recorded, 'authorFreeze': digest(author_freeze), 'authorEntriesVerified': 24,
        'authorFileDigestMismatches': [], 'wholeGoalIDsVerified': 19, 'wholeCaseBriefsVerified': 38,
        'wholeCaseVsProfileDemandAnswerFocusMismatches': [], 'nativeRecordVsCandidateProfileMismatches': [],
        'currentCanonicalObservedAtVerification': digest(canonical_path),
        'selectedScientificContentFieldsCompared': content_fields, 'selectedScientificContentDifferences': [],
        'actualNativeP19RunRole': 'Author run receipt and terminal stdout read; reviewer did not rerun native P19 or claim independent native final D/P/V.',
        'nativeAuthorStatus': {'exitCode': 0, 'needsHumanReview': 19, 'approved': 0, 'blockingIssues': 0},
        'scientificVerdictsRole': 'Individually authored judgments, not derived from these equalities or the native author exit code.',
        'activeWrites': 0, 'humanApproval': False,
    })
    print(json.dumps({'out': str(OUT.relative_to(ROOT)), 'goalsReviewed': 19, 'casesReviewed': 38, 'scienceFirstReady': 16, 'heldGoals': 3, 'strictGain': 0, 'partnerRows': distinct_rows}, ensure_ascii=False))


if __name__ == '__main__':
    main()
