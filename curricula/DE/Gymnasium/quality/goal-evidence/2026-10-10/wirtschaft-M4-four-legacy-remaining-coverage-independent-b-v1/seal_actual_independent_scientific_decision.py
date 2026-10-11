#!/usr/bin/env python3
"""Seal a completed independent reading and four own complete counterworks."""
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parent

def read(name):
    return json.loads((OUT / name).read_text())

def sha(path):
    p = Path(path)
    if not p.is_absolute():
        p = ROOT / p
    return hashlib.sha256(p.read_bytes()).hexdigest()

def write(name, value):
    p = OUT / name
    assert not p.exists(), 'Do not overwrite frozen historical evidence: ' + str(p)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p)}

intake = read('actual-current496-four-whole-bodies-ten-whole-DEEN-contracts-and-all-P-contexts.exact.json')
materials = {g['id']: g for g in intake['wholeMaterials']}
gmap = {g['id']: g for g in intake['wholeOrdinaryGoals']}
pmap = {x['wholeCurrentPositiveEvidenceProfile']['goalId']: x for x in intake['wholeCurrentProfileRows']}

# These are complete reviewer-authored synthetic submissions. Their scores are
# manual applications of the unchanged existing rubric, not observed learner
# work or a run of the production coach/grader.
works = [
 {
  'materialId': '86fff38f-57d7-5365-a9a2-b8c22d193bd6',
  'workId': 'B86-whole-valid-housing-work-without-participation-legitimacy-judgement',
  'wholeSubmissionDe': [
   {'stepId': 's1', 'answer': 'A möchte Wohnraum stärker über öffentliche Verantwortung und Schutzregeln steuern: sozialer Wohnungsbau, kommunale Bodenpolitik und eine ausgeweitete Mietpreisbremse. B kombiniert private Neubauanreize und schnellere Genehmigungen mit einer begrenzten Sozialquote. C vertraut stärker auf Liberalisierung und Eigentumsbildung. Alle wollen Wohnraum bereitstellen, gewichten aber bezahlbares Mieten, private Investition und Eigentum unterschiedlich. A setzt unmittelbar an Verdrängungsschutz an, B sucht zusätzliche Kapazität mit sozialem Ausgleich, C legt mehr Gewicht auf Marktspielräume.'},
   {'stepId': 's2', 'answer': 'Parteien bündeln verschiedene gesellschaftliche Anliegen zu Programmen, treten nach einer Wahl in Mehrheits- und Koalitionsbildung ein und wollen Regierungsentscheidungen tragen. A muss etwa Mieterschutz und öffentliche Finanzierung zusammenführen; B verbindet Neubauinteressen mit einer Sozialquote. Der Mieterbund und der Immobilienverband vertreten dagegen stärker die Anliegen ihrer jeweiligen Mitglieder und beeinflussen die Verhandlungen mit Forderungen und Warnungen, ohne damit selbst die künftige Regierung zu sein. Die kommunalen Spitzenverbände bringen die Umsetzungsseite ein: Bauland, Genehmigungen und Finanzierung. Die Beteiligten artikulieren Interessen, haben aber unterschiedliche Bündelungs- und Entscheidungsrollen.'},
   {'stepId': 's3', 'answer': 'Starker Schutz vor Mietsteigerungen erleichtert bestehenden Mietern kurzfristig die Sicherung ihrer Wohnung. Wenn er Erträge und Planbarkeit neuer Vorhaben stark verringert, kann er aber Neubau und Sanierung schwächen; das würde bei unverändertem Bedarf die Versorgung späterer Wohnungssuchender erschweren. Steuerliche Anreize und schnellere Genehmigungen können zusätzliche Investitionen ermöglichen, sichern allein jedoch keinen Zugang für Haushalte mit niedrigem Einkommen. Sozialer Wohnungsbau und kommunales Bauland brauchen finanzielle Spielräume. Eine Koalition muss darum Schutz, zusätzliche Kapazität, die Finanzierung durch Land und Kommunen und unterschiedliche Wählerinteressen verbinden. Die Positionen lassen einen Kompromiss zwischen A und B erkennen; ob tatsächlich eine Mehrheit zustande kommt, ist ohne Sitzverteilung nicht berechenbar.'},
   {'stepId': 's4', 'answer': 'Ich würde ein gezieltes Sozialwohnungsprogramm und kommunale Baulandmobilisierung mit verlässlich finanzierten Neubauanreizen sowie schnelleren Genehmigungen kombinieren. Begrenzte, zeitlich überprüfte Schutzregeln könnten akute Verdrängung dämpfen, während neue Angebote entstehen. A bekäme sozialen Wohnungsbau und Schutz; B erhielte Kapazitätsanreize und Verfahrenserleichterung; C könnte sich bei Eigentumsförderung und verlässlichen Investitionsbedingungen wiederfinden. Die Finanzierung und tatsächliche Koalitionsmehrheit müssten vor einer Zusage geklärt werden. Der Kompromiss ist wohnungspolitisch gerechtfertigt, wenn einkommensschwache Haushalte tatsächlich Zugang erhalten und das zusätzliche Angebot langfristig tragfähig bleibt. Eine Maßnahme ist nicht schon gut, weil sie nur den heutigen Mietpreis senkt oder nur mehr private Investition verspricht.'}
  ],
  'marks': [7, 7, 8, 8],
  'manualStepReasons': [
   'Alle drei angegebenen Programme vergleichend und sachgerecht gewichtet.',
   'Programm- und Mehrheitsbündelung der Parteien gegenüber fokussierter verbandlicher Interessenvertretung und kommunaler Umsetzung erläutert.',
   'Sozialschutz, Neubauanreize, finanzielle Umsetzung und Mehrheitskompromiss kausal verbunden; keine nicht angegebene Sitzmehrheit erfunden.',
   'Konkreter realistischer Maßnahmenkompromiss mit wohnungspolitischer Zugangsgerechtigkeit, Angebotswirkung, Finanzierung und Erfolgsbedingung.'
  ],
  'absentClaimedWholePerformances': ['76a33679-ec6e-5f0e-b3e3-fdbfa4674a3b'],
  'absenceReason': 'Die ganze Antwort enthält keine eigenständige Diskussion unterschiedlicher institutioneller Beteiligungswege nach demokratischem Zugang, Repräsentation, Verfahrenslegitimation, Verantwortlichkeit oder Minderheitenschutz. Wohnungszugangsgerechtigkeit ist ein Sachurteil über Verteilung, kein solches Legitimationsurteil. Parteien/Verbände und Regierungsrolle sind hier eine echte fc1-Leistung, aber nur ein Teilaspekt von 76a.'
 },
 {
  'materialId': 'c7f78820-f5e3-55ac-9a49-9ff747c6bfaa',
  'workId': 'BC7-whole-valid-platform-intervention-work-without-school-comparison-or-current-law-dossier',
  'wholeSubmissionDe': [
   {'stepId': 's1', 'answer': 'Bei einer Plattform verstärken sich Nutzer- und Anbieterzahlen gegenseitig: Ein großer App-Store ist für Entwickler attraktiv, viele Apps wiederum für Nutzer. Wechselkosten, bestehende Daten und Zugang zur Kundschaft erschweren den Eintritt anderer Anbieter. Der im Kontext als dominant bezeichnete Betreiber kann darum Zugangsbedingungen und Provisionen setzen; die Bevorzugung eigener Dienste kann Konkurrenz zusätzlich erschweren. Die 78 Prozent und 30 Prozent illustrieren Konzentration und die Kostenbelastung kleiner Anbieter. Diese Zahlen allein beweisen weder jeden einzelnen Missbrauchsvorwurf noch, welches Instrument rechtlich zulässig ist.'},
   {'stepId': 's2', 'answer': 'Der Staat möchte wirksamen Wettbewerb und fairen Zugang erhalten, Abhängigkeit reduzieren und Innovation sowohl bei der Plattform als auch bei unabhängigen Entwicklern ermöglichen. Er muss das genannte Marktproblem gezielt verändern, statt einen großen Anbieter allein wegen seiner Größe zu bestrafen. Ohne Eingriff könnten exklusive Bedingungen und Selbstbevorzugung den Eintritt kleiner Anbieter weiter erschweren. Zugleich soll ein Eingriff legitime Investitionsanreize und die Funktion des Dienstes nicht unnötig beschädigen.'},
   {'stepId': 's3', 'answer': 'Eine überprüfbare Interoperabilitäts- und Transparenzauflage könnte Wechsel und Zugang erleichtern: Schnittstellen und nachvollziehbare Regeln begrenzen die Abhängigkeit kleiner Anbieter, ohne die Plattform sofort aufzuspalten. Ihre Grenze liegt in technischer Durchsetzbarkeit, Kontrollaufwand und möglicher Umgehung; Regeln dürfen etwa Sicherheitsfunktionen nicht einfach zerstören. Eine strukturelle Entflechtung trennt stärker diejenigen Tätigkeiten, zwischen denen Selbstbevorzugung entstehen kann. Sie greift tiefer ein und kann Verhandlungsmacht ändern, verursacht aber Übergangs- und Koordinationskosten und kann gemeinsame Entwicklungsleistungen verlieren. Gegenüber Nichtintervention adressieren beide die Eintrittsbarrieren; die mildere Zugangsauflage würde ich zunächst bevorzugen, wenn sie tatsächlich überprüfbar wirksam ist. Nur fortbestehende, damit nicht lösbare Probleme würden einen stärkeren Schritt im hier abstrakten Instrumentenvergleich tragen.'},
   {'stepId': 's4', 'answer': 'Strenge Regulierung ist nicht generell innovationsfreundlich oder generell innovationsfeindlich. Erleichterter Zugang kann neue Entwickler, Produkte und Wettbewerb ermöglichen. Starre oder schlecht kontrollierte Vorgaben können dagegen Entwicklungskosten erhöhen und neue technische Lösungen verhindern; eine Entflechtung kann Koordination erschweren. Maßgeblich sind Wirkung auf das konkrete Zugangsproblem, Aufwand und Durchsetzbarkeit sowie Folgen für kleine Anbieter, Nutzer und den Plattformbetreiber. Ich befürworte daher eine zielgenaue, überprüfbare Zugangsregel mit regelmäßiger Wirkungsprüfung gegenüber dem Zustand ohne Eingriff. Das Urteil gilt unter der Bedingung, dass sie Abhängigkeit tatsächlich verringert und technische Funktionsfähigkeit erhält. Die vorliegenden Zahlen ersetzen keinen zusätzlichen Nachweis ihrer Wirkung.'}
  ],
  'marks': [7, 7, 8, 8],
  'manualStepReasons': [
   'Netzwerk-, Wechsel- und Datenmechanismen erklären die Dominanz im Kontext; Marktanteil nicht mit jedem Missbrauch gleichgesetzt.',
   'Konkrete Wettbewerbs-, Zugangs- und Innovationsziele gegenüber Nichtintervention erklärt.',
   'Zwei konkrete Eingriffsformen nach Mechanismus, Intensität, Durchsetzbarkeit und Nebenwirkungen verglichen.',
   'Innovationseffekte beider Richtungen, Kontrollkosten, Betroffene und bedingte Alternative begründet.'
  ],
  'absentClaimedWholePerformances': ['98136a27-120d-5278-b9b9-d833c0ea5fc0', '9ca0e3c9-005e-5c8d-8157-3642e11f245e'],
  'absenceReason': 'Die ganze voll rubrikkonforme Antwort nutzt kein aktuelles deutsches Normdossier und keine heutige Debattenquelle, unterscheidet keine bereitgestellten Schulen und deren Annahmen. Sie liefert echte generische Instrumenten- und Eingriffsabwägung. Zwei Instrumente innerhalb derselben pragmatischen Abwägung sind kein kritischer Vergleich ordnungspolitischer Schulen. Weder Aufgabe noch Lösung oder Rubrik verlangt den zusätzlichen aktuellen Norm-/Debattenanteil des ganzen 981-P-Vertrags. Hier wird keine Behauptung über den heutigen Rechtsstand erzeugt.'
 },
 {
  'materialId': '99eff8ba-bc92-5f08-8882-36f1b179101b',
  'workId': 'B99-whole-valid-value-chain-work-without-real-corporate-organisation-or-concrete-location-policy-comparison',
  'wholeSubmissionDe': [
   {'stepId': 's1', 'answer': 'In der beschriebenen Kette werden Vorprodukte im Ausland hergestellt und in Deutschland für Endmontage verwendet; Forschung bleibt ebenfalls dort. Die beteiligten Produzenten, das Maschinenbauunternehmen und deren Beschäftigte hängen damit grenzüberschreitend voneinander ab. Spezialisierung und geeignete Produktionsbedingungen können Kosten senken und Know-how passend einsetzen. Die Importquote von Vorleistungen zeigt die Bedeutung eingekaufter Teile, die Exportquote die Bedeutung ausländischer Absatzmöglichkeiten. Transport, politische Störungen oder ein Engpass bei einem Teil können aber die ganze Endmontage treffen. Der angegebene sechswöchige Stillstand macht diese Abhängigkeit konkret. Ein niedriger Einkaufspreis ist deshalb nicht mit niedrigen Kosten unter allen Störungsbedingungen gleichzusetzen.'},
   {'stepId': 's2', 'answer': 'Für Vorprodukte zählen Lohn- und Stückkosten, verfügbare Fachkräfte, Transportwege, Infrastruktur, verlässliche Zulieferung, Stabilität und die Nähe zu Abnehmern. Für Forschung und technisch anspruchsvolle Endmontage können vorhandenes Wissen, qualifizierte Teams und institutionelle Verlässlichkeit besonders wichtig sein. So lassen sich eine räumliche Aufteilung und der Erhalt dieser Tätigkeiten in Deutschland grundsätzlich erklären. Die Aufgabe nennt aber keine tatsächlichen Lohn-, Qualifikations- oder Infrastrukturdaten der beiden Standorte; niedrige osteuropäische Löhne oder eine bestimmte deutsche Überlegenheit dürfen daher nur als mögliche Erklärung, nicht als nachgewiesener Vergleich behauptet werden. Ebenso ist offen, ob die Vorprodukte aus eigenen Auslandswerken oder von unabhängigen Zulieferern stammen.'},
   {'stepId': 's3', 'answer': 'Mehr ausländische Vorleistungen können die deutschen Importe erhöhen, während die spätere Endmontage exportiert wird. Das kann Exporte und Wettbewerbsfähigkeit unterstützen, zugleich aber die inländische Fertigungstiefe verändern. Beschäftigung bei einer verdrängten deutschen Vorproduktion kann verloren gehen, während Montage und Forschung erhalten werden oder bei Erfolg wachsen; ausländische Produzenten und deren Beschäftigte gewinnen möglicherweise Aufträge. Der Stillstand belastet Absatz und Beschäftigung auf mehreren Stufen. Aus 72 Prozent Exportquote und 48 Prozent Vorleistungsimportanteil lässt sich kein deutscher Handelsbilanzsaldo durch Subtraktion berechnen: Bezugsgrößen und gesamtwirtschaftliche Daten fehlen. Eine stabile Handelsbilanz wäre möglich, beweist aber weder unveränderte inländische Wertschöpfung noch einen Gewinn jedes betroffenen Arbeitnehmers.'},
   {'stepId': 's4', 'answer': 'Nach sechs Wochen Stillstand sollte Robustheit gegenüber einer einseitigen Minimierung des normalen Einkaufspreises mehr Gewicht bekommen. Eine reine Maximierung der Resilienz ohne Rücksicht auf Kosten könnte andererseits die Wettbewerbsfähigkeit und Absatzchancen schwächen. Sinnvoll ist deshalb eine diversifizierte Lieferkette mit bezahlbaren Alternativen und angemessenen Reserven für kritische Teile. Der Umfang sollte davon abhängen, wie groß Ausfallrisiko und Schaden im Verhältnis zu den zusätzlichen normalen Kosten sind. Das ist eine begründete wirtschaftspolitische Priorität zugunsten ausgewogener Robustheit; ohne Angaben zu konkreten staatlichen Maßnahmen, Finanzierung und Standortdaten wähle ich hier keine bestimmte Subvention oder Infrastrukturmaßnahme und behaupte keine nachgewiesene Überlegenheit eines Landes.'}
  ],
  'marks': [8, 8, 7, 7],
  'manualStepReasons': [
   'Stufen, Unternehmen/Produzenten/Beschäftigte, Effizienz und konkrete Unterbrechungsabhängigkeit erklärt.',
   'Alle einschlägigen Standortfaktoren tätigkeitsbezogen analysiert; fehlende Vergleichsdaten und Organisation nicht erfunden.',
   'Import/Export, Wertschöpfungstiefe, Beschäftigte und Unterbrechungswirkung bedingt beurteilt; keine falsche Subtraktion unterschiedlicher Quoten.',
   'Der tatsächlich verlangte Resilienz-Kosten-Zielkonflikt mit bedingter diversifizierter Strategie plausibel beurteilt.'
  ],
  'absentClaimedWholePerformances': ['1582ec45-1655-5f7c-a2bd-a3fc00e583fa', '7f8f6648-6faa-52c5-9793-3654ef9dc36d'],
  'absenceReason': 'Die Antwort bearbeitet die ganze Aufgabe ohne eine tatsächlich materialbelegte konzerninterne oder externe Organisation/Koordination samt Macht- und Strategiefolgen zu analysieren. Sie nennt die Ambiguität korrekt, kann sie mangels Daten aber nicht auflösen. Export/import allein definieren kein transnational organisiertes Unternehmen. Die allgemeine Faktorenliste und eine Resilienzpriorität belegen außerdem keinen konkreten globalen Standortvergleich mit Fallbelegen und keine tatsächlich beurteilte staatliche Politikreaktion. Eigene Firmenvorräte/Diversifikation sind nicht allein ein Vergleich staatlicher Standortpolitik. Weder die engere P-Grundunterscheidung noch die beiden ganzen Zielverträge werden durch einen erfundenen Standort-/Eigentumsdatensatz erfüllt.'
 },
 {
  'materialId': 'a761eb96-1ae3-5702-bd3c-4a260889c2f4',
  'workId': 'BA7-whole-valid-microfinance-work-without-fair-trade-agreement-mechanisms-or-joint-ecological-sustainability',
  'wholeSubmissionDe': [
   {'stepId': 's1', 'answer': 'Das Programm soll Kleinunternehmerinnen einen ersten Zugang zu Finanzierung und damit Chancen auf selbständige Tätigkeit und Einkommen geben. 61 Prozent erhalten ihr erstes Bankkonto; das ist ein konkreter Hinweis auf erweiterten finanziellen Zugang, nicht schon ein Nachweis für einen bestimmten Gewinn oder weniger Armut. Ein durchschnittlicher Kredit von 420 Euro kann einen kleinen Betriebsstart oder Betriebsmittel ermöglichen, sagt aber nichts über die Verteilung aller Kredite. Gerade Personen ohne Zugang zu herkömmlichen Banken können profitieren, wenn Rückzahlung und Geschäft tatsächlich tragfähig sind.'},
   {'stepId': 's2', 'answer': 'Ein Kredit muss auch bei schwankendem Absatz zurückgezahlt werden; unpassende Konditionen können Überschuldung und hohen Rückzahlungsdruck verursachen. Kleine Beträge beseitigen weder fehlende Nachfrage noch Infrastruktur- oder Ausbildungsengpässe. Viele kleine Kredite können relativ hohen Verwaltungsaufwand erzeugen. Die 94 Prozent Rückzahlungsquote spricht für viel geleistete Rückzahlung, beweist aber weder gutes Einkommen jeder Frau noch, dass Rückzahlung ohne Belastung des Haushalts möglich war. Für ein stärkeres Wirkungsurteil bräuchte man Zinsen, Verwaltungskosten, Erträge, Ausfälle und die Lage nicht erreichter Gruppen.'},
   {'stepId': 's3', 'answer': 'Mikrofinanz setzt beim Kapitalzugang einzelner Unternehmerinnen an: Es ermöglicht Produktion oder Handel, schafft aber nicht automatisch zahlende Kunden. Handelspolitische Entwicklungsansätze setzen dagegen am Zugang zu Absatzmärkten und den möglichen Verkaufs- und Preisbedingungen an und können viele Produzenten betreffen. Bessere Absatzmöglichkeiten und Finanzierung können sich ergänzen, wenn die finanzierten Betriebe die neue Nachfrage auch bedienen können. Beide Ansätze bleiben begrenzt, wenn etwa Transporte, Ausbildung oder tatsächlicher Kundenzugang fehlen. Der bloß diskutierte Zugang für faire Agrarimporte bezeichnet im Material noch keine bestimmte Preisgarantie, Vertragsregel, Zertifizierungsbedingung oder konkrete Abkommensregel; deshalb lässt sich ihre Reichweite daraus nicht berechnen.'},
   {'stepId': 's4', 'answer': 'Mikrofinanz kann sowohl Armutsbekämpfung als auch Marktintegration dienen. Der neue Bankzugang erweitert kurzfristig Handlungsmöglichkeiten; erfolgreiche unternehmerische Tätigkeit kann Einkommen stabilisieren und die Teilnahme an Märkten verbessern. Überwiegen Kosten, unsicherer Absatz oder Überschuldung, kann dieselbe Integration jedoch belastend sein. Ich würde das Programm deshalb als bedingten Baustein einer breiteren Entwicklungsstrategie beurteilen, mit passenden Konditionen und ergänzender Unterstützung statt als alleinige Lösung. Die vorhandenen Rückzahlungs- und Kontoquoten belegen den Zugang und den Kreditverlauf begrenzt, keine generelle Armutsreduktion. Das Material erlaubt kein Urteil über ökologische Ressourcenfolgen oder eine bestimmte längerfristige Umwelttragfähigkeit.'}
  ],
  'marks': [7, 8, 8, 7],
  'manualStepReasons': [
   'Finanzieller Zugang, unternehmerische Kapitalnutzung und begrenzte Aussage der konkreten Daten erläutert.',
   'Überschuldung, Wachstum, Verwaltung und strukturelle Grenzen differenziert; Rückzahlung nicht mit Armutsnachweis verwechselt.',
   'Individualfinanzierung gegenüber breiterem Absatz-/Handelszugang systematisch verglichen, Ergänzung und Grenzen erklärt.',
   'Armuts- und Integrationsfunktion bedingt beurteilt und keine unbelegten allgemeinen Wirkungen behauptet.'
  ],
  'absentClaimedWholePerformances': ['e21158e7-3bc3-51f2-887f-9eb5a8dd6243', '4fef149e-84c0-59af-b056-0a0bf97dbecd'],
  'absenceReason': 'Kein definierter Fair-Trade-Vertrags-/Preis-/Standardmechanismus und kein tatsächlicher Abkommens-/Regelmechanismus werden beurteilt. Finanzielle Inklusion und wirtschaftliche Rückzahlungsrisiken sind reale Facetten; gemeinsame ökologische Ressourcengrenzen und längerfristige inklusive Nachhaltigkeitsbedingungen werden nicht bewertet. Die Aufgabe kann ohne beide ganzen verbleibenden Zielperformances vollständig gelöst werden. Die explizite Benennung fehlender Daten ist redlich, ersetzt aber deren geforderte eigentliche fachliche Bewertung nicht.'
 }
]

for w in works:
    material = materials[w['materialId']]
    scoring = material['examData']['scoring']
    assert [x['stepId'] for x in w['wholeSubmissionDe']] == [x['id'] for x in scoring['steps']]
    assert w['marks'] == [x['points'] for x in scoring['steps']]
    w['wholeUnchangedScoringContract'] = scoring
    w['reviewerManualRubricAssessment'] = [
        {'stepId': step['id'], 'actualRubric': step['description'], 'maxPoints': step['points'],
         'manualPoints': mark, 'scientificReasonDe': reason}
        for step, mark, reason in zip(scoring['steps'], w['marks'], w['manualStepReasons'])
    ]
    w['actualRawPoints'] = sum(w['marks'])
    w['actualPassingPoints'] = scoring['passingPoints']
    w['unchangedRubricOutcome'] = 'PASS'
    w['syntheticReviewerWorkNotLearnerEvidence'] = True
    w['productionCoachOrAutomaticGraderExecuted'] = False
    w['purpose'] = 'A whole legitimate answer can satisfy the actual rubric while omitting essential portions of a declared whole Goal/P performance. This is a false coverage counterexample, not a proposed scoring cap or new assessment rule.'

workref = write('actual-four-complete-own-counterworks-and-unchanged-rubric-manual-scoring.independent-b.json', {
    'schemaVersion': 1, 'reviewer': '/root/economics_m2_views_independent_b',
    'actualWholeCounterworks': 4, 'actualCompleteRubricSteps': 16, 'counterworks': works,
    'actualMathVerificationScope': 'Only four exact rubric sums and score-threshold comparisons; not simulated learner mastery.',
    'actualDecimalOrAutomatedGraderClaim': False
})

decisions = [
 {
  'materialId': '86fff38f-57d7-5365-a9a2-b8c22d193bd6', 'decision': 'REVISE',
  'falseWholeClaims': [{'goalId': '76a33679-ec6e-5f0e-b3e3-fdbfa4674a3b',
    'requiredCurrentGoalPerformanceDe': 'Politische Beteiligungsformen und ihre demokratische Legitimation diskutieren; P unterscheidet Zugang, Repräsentation, Verfahren und Verantwortlichkeit von Teilnahmezahl und Einfluss.',
    'wholeBodyMismatchDe': 'Koalitionspositionen, verbandlicher Einfluss und die normative Verteilung von Wohnraum tragen keine eigene institutionelle Beteiligungs-/Legitimationsdiskussion. Landtagswahl als Kontext ersetzt keine solche Leistung. Aufgaben, Lösung und alle vier Rubrikzeilen sind ohne sie erfüllbar.',
    'currentPContrast': ['party-and-petition: Einfluss und institutionelle Entscheidung getrennt beurteilen, Zugang/Repräsentation prüfen', 'direct-and-representative-route: Verfahrens-/Minderheiten-/Verantwortlichkeitskriterien tragen ein Legitimationsurteil'],
    'requiresAndCoverageClaimUnsupported': True}],
  'remainingWholePerformanceBindingsKEEP': [{'goalId': 'fc1d5252-3b01-555e-bcc5-c8ee3d6b48bd',
    'actualPerformanceDe': 'Materialgebundener Vergleich breiter parteilicher Programmbündelung/Mehrheits- und Regierungsrolle mit fokussierter Mitgliedsvertretung und Einfluss der Verbände; konkrete Interessen und kommunale Umsetzungsseite erklären.',
    'bindingLocations': ['Material1/2', 'Aufgabe2/Lösung2/s2', 'programmbezogener Vergleich und Koalitionsabwägung in1/3/4'],
    'currentPMatchDe': 'Die institutionelle Unterscheidung und materialbezogenen Funktionen entsprechen dem fc1-Ziel und seiner gemeinsamen Vergleichsleistung; die illustrativen Transport-/Anhörungsfälle werden nicht als Pflichtfallform eingefordert.',
    'claimBoundary': 'KEEP of the actual remaining performance binding; no fresh blanket approval of all 30-point score permutations or whole terminal release.'}],
  'remainingWholeCoveredGoalIdsAfterBoundedClaimCorrection': ['fc1d5252-3b01-555e-bcc5-c8ee3d6b48bd']
 },
 {
  'materialId': 'c7f78820-f5e3-55ac-9a49-9ff747c6bfaa', 'decision': 'REVISE',
  'falseWholeClaims': [
   {'goalId': '98136a27-120d-5278-b9b9-d833c0ea5fc0',
    'requiredCurrentGoalPerformanceDe': 'Geeignete Instrumente gegen Marktmacht erklären/beurteilen einschließlich der aktuellen ausdrücklich gebundenen deutschen Norm-/Debattenleistung des ganzen P-Profils.',
    'wholeBodyMismatchDe': 'Generische Interoperabilitäts-/Entflechtungsinstrumente sind tatsächlich enthalten. Ein aktuelles deutsches Normdossier mit wirklichen Tatbestands-/Zugangsbedingungen oder ein redlich eingeordnetes aktuelles Debattenmaterial fehlt vollständig. Marktanteil/Provision/Beschwerden tragen diese zusätzliche aktuelle Leistung nicht.',
    'currentPContrast': ['gegenwärtige deutsche GWB-Regel-/Zugangsdossiers und gesonderte Debattenfälle im aktuellen P4', 'keine pauschale Ableitung Missbrauch/beste Maßnahme allein aus hohem Marktanteil'],
    'requiresAndCoverageClaimUnsupported': True, 'currentLegalOutcomeClaimed': False,
    'genericInstrumentFacetKEEPNotWholeCurrent981': True},
   {'goalId': '9ca0e3c9-005e-5c8d-8157-3642e11f245e',
    'requiredCurrentGoalPerformanceDe': 'Ordnungspolitische Schulen/Ansätze kritisch vergleichen nach ausdrücklich beschriebenen Annahmen, Staatsrolle, Regelmechanismus und Zielbedingungen.',
    'wholeBodyMismatchDe': 'Weder Schulendossier noch vergleichende Annahmen/Staatsrollen sind vorhanden. Eine Liste staatlicher Ziele und zwei Eingriffsformen innerhalb einer Abwägung ersetzt keinen kritischen Schulenvergleich.',
    'currentPContrast': ['cartel-and-state-role: Laissez-faire und ordoliberale Regelannahmen am selben Konflikt vergleichen', 'social-and-environmental-rule: verschiedene Staatsrollen/Regelannahmen kritisch unterscheiden'],
    'requiresAndCoverageClaimUnsupported': True}
  ],
  'remainingWholePerformanceBindingsKEEP': [{'goalId': '6600f5f0-0b30-5458-b144-b2468d897087',
    'actualPerformanceDe': 'Das konkrete Zugangs-/Marktmachtproblem erklären, unterschiedliche Eingriffsmechanismen und Nichtinterventionsrisiken abwägen sowie Innovationswirkungen, Durchsetzbarkeit, Kosten/Nebenfolgen und eine bedingte Wahl begründen.',
    'bindingLocations': ['Kontext/Material', 'Aufgaben2/3/4', 'Lösungen2/3/4', 's2/s3/s4'],
    'currentPMatchDe': 'Die Abwägung entspricht der gemeinsamen 660-Kernleistung. Exakte Fluss-/Mietpreisfälle oder zusätzliche Zahlenquoten werden nicht aus illustrativen P-Fällen als Pflichtform erfunden.',
    'claimBoundary': 'KEEP of the actual intervention-performance binding, not current981 norm evidence or9ca whole-school evidence, and not an overall course/terminal release.'}],
  'remainingWholeCoveredGoalIdsAfterBoundedClaimCorrection': ['6600f5f0-0b30-5458-b144-b2468d897087']
 },
 {
  'materialId': '99eff8ba-bc92-5f08-8882-36f1b179101b', 'decision': 'REVISE',
  'falseWholeClaims': [
   {'goalId': '1582ec45-1655-5f7c-a2bd-a3fc00e583fa',
    'requiredCurrentGoalPerformanceDe': 'Grenzüberschreitende Rolle und mehrere konkret erkennbare Strategien transnationaler Unternehmen aus Motiven und Organisations-/Koordinationsbedingungen erläutern und mit Folgen für beteiligte Akteure verbinden.',
    'wholeBodyMismatchDe': 'Verlagerte Vorprodukte, deutsche Forschung/Endmontage und Export/Importquoten lassen sowohl eigene Tochterstandorte als auch unabhängige Zulieferverträge zu. Die tatsächliche transnationale Organisation, Koordination/Macht und mehrere materialerkennbare Strategien sind nicht spezifiziert oder verlangt. Allgemeine Kosten-/Wissensmotive und Kettenwirkungen sind echte Teilaspekte, ersetzen aber nicht die ganze TNC-Leistung.',
    'currentPContrast': ['market-and-knowledge-sites: tatsächliche zentrale Konzernkoordination und unterschiedliche erkennbare Strategiemotive', 'supplier-and-network-strategy: interne Organisation und externe Lieferbeziehung trennen sowie Einkaufsmacht/Lernen erklären'],
    'requiresAndCoverageClaimUnsupported': True,
    'importsAndExportsDoNotEstablishOwnershipDe': 'Grenzüberschreitender Einkauf/Absatz allein begründet keinen Befund eigener ausländischer Tochterunternehmen.'},
   {'goalId': '7f8f6648-6faa-52c5-9793-3654ef9dc36d',
    'requiredCurrentGoalPerformanceDe': 'Globale Standortfaktoren für die jeweilige Tätigkeit tatsächlich vergleichen und konkrete Politikreaktionen mit Fallbelegen, Zielkonflikt, Kosten/Verteilung und Bedingung beurteilen.',
    'wholeBodyMismatchDe': 'Es fehlen wirkliche vergleichende Standortdossiers sowie konkrete politische Reaktionsalternativen. Relevante Faktoren allgemein aufzulisten und Resilienz gegenüber Kosten als politische Priorität zu empfehlen erfüllt nicht den ganzen Standort-/Politikvergleich. Firmeninterne Diversifikation ist für sich keine beurteilte staatliche Reaktion.',
    'currentPContrast': ['skill-infrastructure-or-tax-incentive: tatsächlichen Engpass und finanzierte politische Alternativen anhand Standortdaten prüfen', 'data-services-and-public-costs: Infrastruktur/Subvention nach Tätigkeit, Zugang, Finanzierung und Verteilung vergleichen'],
    'requiresAndCoverageClaimUnsupported': True}
  ],
  'remainingWholePerformanceBindingsKEEP': [{'goalId': '11c57203-1619-5bba-8905-9c10d7f77d57',
    'actualPerformanceDe': 'Internationale Vorproduktproduktion, deutsche Forschung/Endmontage und Absatzbeziehungen als Wertschöpfungskette erklären; Effizienz, Störungsabhängigkeit, Importe/Exporte, regionale Fertigungstiefe und Beschäftigungsfolgen differenziert beschreiben.',
    'bindingLocations': ['Kontext/Material72%/48%/6Wochen', 'Aufgaben1/3', 'Lösungen1/3', 's1/s3'],
    'currentPMatchDe': 'Mehrere reale Stufen und Akteure samt Effekten sind gegeben. Quoten mit verschiedenen Bezugsgrößen werden nicht subtrahiert, Absatz nicht mit inländischer Wertschöpfung gleichgesetzt. Keine exakte Fahrrad-/Digitalfallform wird als zusätzliche Pflicht verlangt.',
    'claimBoundary': 'KEEP of the real value-chain performance binding; no whole158/7f claim and no blanket whole terminal release.'}],
  'remainingWholeCoveredGoalIdsAfterBoundedClaimCorrection': ['11c57203-1619-5bba-8905-9c10d7f77d57']
 },
 {
  'materialId': 'a761eb96-1ae3-5702-bd3c-4a260889c2f4', 'decision': 'REVISE',
  'falseWholeClaims': [
   {'goalId': 'e21158e7-3bc3-51f2-887f-9eb5a8dd6243',
    'requiredCurrentGoalPerformanceDe': 'Fair-Trade-Ansätze und Handelsabkommen anhand tatsächlicher Preis-/Vertrags-/Standard- versus Marktzugangs-/Regelmechanismen nach Entwicklung, Nutzung, Reichweite und Verteilung bewerten.',
    'wholeBodyMismatchDe': 'Der bloß diskutierte faire Importzugang nennt weder definierte Fair-Trade-Regeln noch konkrete Abkommensregeln. Die verlangte allgemeine Gegenüberstellung von Finanzierung und Absatz-/Handelszugang kann beide eigentlichen Mechanismen und deren Verteilung vollkommen auslassen.',
    'currentPContrast': ['cooperative-contract-and-agreement: definierten Vertrag/Prämie gegen Zoll-/Berechtigungszugang unterscheiden', 'standards-and-excluded-farms: tatsächliche Standards, Kosten, Zugang und Prämienverteilung bewerten'],
    'requiresAndCoverageClaimUnsupported': True},
   {'goalId': '4fef149e-84c0-59af-b056-0a0bf97dbecd',
    'requiredCurrentGoalPerformanceDe': 'Inklusiven Zugang benachteiligter Gruppen zusammen mit langfristiger ökologischer und wirtschaftlicher Tragfähigkeit, Finanzierung, Verteilung und Ressourcengrenzen bewerten.',
    'wholeBodyMismatchDe': 'Frauen-/Bankzugang und wirtschaftliche Kreditgrenzen sind real, aber keinerlei Umwelt-/Ressourcenfolgen oder gemeinsame nachhaltige Strategiebedingungen werden vorgegeben, verlangt oder bepunktet. Eine allgemeine breitere Entwicklungsstrategie oder die hohe Rückzahlung ersetzt diese zweite zentrale Dimension nicht.',
    'currentPContrast': ['green-electricity-access: tatsächlichen Zugang gemeinsam mit Betriebs-/Emissions-/Land- und Finanzierungsfolgen bewerten', 'agricultural-training-and-water: Zugang/Finanzierung mit Wasser- und langfristigen Ertragsgrenzen verbinden'],
    'requiresAndCoverageClaimUnsupported': True}
  ],
  'remainingWholePerformanceBindingsKEEP': [],
  'remainingPartialPerformanceFacetsKEEP': [
   {'goalId': '4fef149e-84c0-59af-b056-0a0bf97dbecd', 'facetDe': 'Frauenbezogener finanzieller Zugang, unternehmerische Finanzierung, Rückzahlungs-/Kosten-/Überschuldungsgrenzen und bedingte soziale/wirtschaftliche Entwicklungswirkung.'},
   {'goalId': 'e21158e7-3bc3-51f2-887f-9eb5a8dd6243', 'facetDe': 'Allgemeine Unterscheidung individueller Finanzierung gegenüber breiterem Absatz-/Handelszugang; keine ganze Fair-Trade-/Abkommensbewertung.'}
  ],
  'remainingWholeCoveredGoalIdsAfterBoundedClaimCorrection': [],
  'emptyWholeCoverageFollowupRequiredDe': 'Das Material darf nach bloßen zwei Bindungscuts weder als WholequalifiedTerminal noch als aus leeren requires abgeleitete allgemeine Länderfreigabe zählen. Reale Teilaufgabe erhalten; neue passende Route, tatsächliche Ergänzung oder ausdrücklich zurückgestellter Endpunkt braucht ein getrenntes Autor-/Reviewpaket. Kein OrdinaryTarget wird deshalb verborgen oder entfernt.'
 }
]

for d in decisions:
    mid = d['materialId']
    covered = materials[mid]['examData']['coveredGoalIds']
    false_ids = [x['goalId'] for x in d['falseWholeClaims']]
    keep_ids = d['remainingWholeCoveredGoalIdsAfterBoundedClaimCorrection']
    assert sorted(false_ids + keep_ids) == sorted(covered)
    d['wholeBeforeMaterial'] = materials[mid]
    d['wholeCurrentGoalsAndProfiles'] = [{'wholeGoal': gmap[g], **pmap[g]} for g in covered]
    d['counterworkId'] = next(w['workId'] for w in works if w['materialId'] == mid)
    d['earlierIndependentlyReviewedFalseCutsPreserved'] = True
    d['bodyTaskSolutionRubricStatusOrStudentPerformanceReduced'] = False

decisionref = write('actual-four-whole-materials-seven-remaining-false-bindings-and-real-KEEP-facets.scientific-REVISE.independent-b.json', {
    'schemaVersion': 1, 'createdAt': datetime.now(timezone.utc).isoformat(),
    'reviewer': '/root/economics_m2_views_independent_b',
    'scope': 'First bounded independent whole science of four legacy materials current remaining ten claims; prior qualified nine cuts and whole15aa retained, not repeated.',
    'decision': 'REVISE', 'currentCanonicalInput': intake['canonicalInput'],
    'wholeMaterialsActuallyRead': 4, 'wholeDEENOrdinaryContractsActuallyRead': 10,
    'wholeActualPApplicationCasesActuallyRead': intake['actualApplicationCases'],
    'ownCompleteCounterworks': workref, 'ownCounterworkCount': 4,
    'falseRemainingWholeMaterialGoalBindings': 7, 'remainingRealWholePerformanceBindings': 3,
    'individualDecisions': decisions,
    'validPriorBodyScienceReused': 'Earlier A nine-cut KEEP does not qualify these remaining claims; actual whole15aa KEEP stays outside this package. Older four NEW materials are different IDs. No valid remaining-whole body approval found in the inspected complete ID/provenance review inventory.',
    'truthfulCurrentProfileStatus': intake['profileStatuses'],
    'sourceCoverageIsNotInferredFromApplicabilityFlag': True,
    'newNineFlagPackageNotApprovedByThisBodyReceipt': True,
    'legalBoundary': 'Diagnosing an absent current981 norm/debate dossier only; no assertion of a newly researched or today-valid legal outcome.',
    'actualTaskAndRubricScoringPreserved': True, 'noBlanketCapsOrStyleRound': True,
    'requiresCutsAreClaimsNotThresholdChanges': True,
    'studentWorkSyntheticOnly': True, 'humanReviewApprovalTrial': False,
    'activeWrites': 0, 'images': 0, 'wholeCourseApproval': False,
    'wholeM3M4M6M7Approval': False, 'newAcademicFiveGateClosures': 0,
    'restoredBindings': 0, 'strictNetGainClaimed': 0,
    'nextStepDe': 'Root kann gezielte inaktive Feldfolger für die sieben belegten falschen Requires/Coverage-Claims authorieren, drei reale verbleibende Leistungsbindungen erhalten und die verlorenen Routen/den leeren a761-Gesamtendpunkt ehrlich getrennt offen halten. Gültige WholeScience ist Voraussetzung neuer qualifizierter Länder-/Kurszugänge. Keine ScopeTargets verschwinden, kein Flag ersetzt Science.'
})

guard = read('actual-input-bindings.before-independent-remaining-coverage-verdict.json')
checks = []
for x in guard['inputs']:
    checks.append({'path': x['path'], 'beforeSHA256': x['sha256'], 'afterSHA256': sha(x['path']),
                   'wholeExact': sha(x['path']) == x['sha256']})
assert all(x['wholeExact'] for x in checks)
ignored = subprocess.run(['git', 'check-ignore', '--no-index', '--stdin'], cwd=ROOT,
                         input='\n'.join(x['path'] for x in guard['inputs']) + '\n', text=True, capture_output=True)
assert ignored.returncode in (0, 1)
assert not ignored.stdout.strip()
guardref = write('actual-independent-review-input-guards-and-scope-command-receipt.json', {
    'wholeFrozenInputChecks': checks, 'allWholeExact': True,
    'checkIgnoreArgv': ['git', 'check-ignore', '--no-index', '--stdin'],
    'checkIgnoreExitCode': ignored.returncode, 'ignoredRequiredInputCount': 0,
    'symlinkInputCount': guard['symlinkCount'],
    'actualCompletedChecks': ['4 whole material Task/Solution/Rubric reads', '10 current whole DEEN Goal contracts and22 complete actual P cases read', '4 own complete counterworks with16 manual rubric marks and4 exact sums', '7 individually justified false current whole coverage claims,3 retained real full performance bindings', 'whole input exactness and no required ignored or symlink inputs'],
    'productionNativeOrBuildRun': False,
    'reasonNoNativeRerun': 'This is read-only body science against exact existing contracts. Root bundles native source/closure/route/floor runs at qualified integration; no technical run can approve an absent student performance.'
})
manifest = []
for p in sorted(OUT.iterdir()):
    if p.is_file():
        manifest.append({'path': str(p.relative_to(ROOT)), 'sha256': sha(p), 'bytes': p.stat().st_size})
manifestref = write('actual-four-legacy-independent-remaining-coverage-review.manifest.json', {
    'schemaVersion': 1, 'files': manifest, 'allInputBodiesAndHistoricalPriorReviewsUnchanged': True
})
handoff = write('actual-final-four-legacy-seven-false-bindings-independent-REVISE.handoff.receipt.json', {
    'schemaVersion': 1, 'decision': 'REVISE', 'reviewer': '/root/economics_m2_views_independent_b',
    'canonicalInput': intake['canonicalInput'], 'receipt': decisionref, 'counterworks': workref,
    'guard': guardref, 'manifest': manifestref,
    'falseWholeBindings': 7, 'retainedRealWholeBindings': 3,
    'a761WholeRemainingGoalBindings': 0,
    'wholeOldTaskSolutionRubricBodiesPreserved': True,
    'releaseOrCurrentWholeCourseM3M6Claim': False,
    'newFlagApproval': False, 'activeWrites': 0,
    'next': 'Bounded Root-authored field candidates, independent targeted follow-up; wholeQualified/a761/source/course issues stay open.'
})
print(json.dumps({'decision': decisionref, 'handoff': handoff, 'manifest': manifestref, 'guard': guardref}))
