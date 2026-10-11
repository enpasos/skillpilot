import copy
import hashlib
import json
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
SOURCE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/four-new-Generic-global-terminal-author-v5/whole-four-new-terminal-DRAFT-assessments.author.candidate.json'
CAN = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/two-orientation-requires-bounded-sequence-successor-v4/whole-current300-plus-Generic11-and-nine-root-machine-released-terminals.inert.candidate.json'
IDS = ['25a83b44-d5fe-506c-af8a-3d5920084ed4', '0c57d371-7b42-583d-8341-8f4d7d4e8541', 'fa83d72b-e677-548d-909c-a2f9200107e0']
ORIGINS = ['099086bb-5100-5ce0-8334-0aab8850a48e', '99541aa7-c590-5f5d-8e89-fe2e39da7a9c', '6f75cdff-7d32-533b-8fe9-3d003b7af241']

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def binding(p):
    return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p)}

assert sha(SOURCE) == '3f4eef2ca7187beba16a14f421a0a1c3948bab3089f4a046f5f09b4551da2b67'
goals = {g['id']: g for g in json.loads(SOURCE.read_text())}
can = {g['id']: g for g in json.loads(CAN.read_text())['goals']}
picked = [goals[i] for i in IDS]
for g, origin in zip(picked, ORIGINS):
    assert g['requires'] == g['examData']['coveredGoalIds'] == [origin]
    assert sum(x['points'] for x in g['examData']['scoring']['steps']) == g['examData']['scoring']['maxPoints']
    assert len(g['examData']['scoring']['steps']) == 3
    assert g['examData']['reviewStatus'] == 'draft'
    assert g['extendedData']['applicabilityFromRequires'] is True
    assert origin in can

checks = []
def calc(label, actual, expected):
    a = Decimal(actual) if isinstance(actual, str) else actual
    assert a == Decimal(expected)
    checks.append({'label': label, 'independentlyComputedDecimal': str(a), 'expected': expected, 'pass': True})

qA, qB = Decimal('1.25'), Decimal('1')
hA, hB = Decimal(1000)/qA, Decimal(1000)/qB
iA, iB = Decimal(8000)/qA, Decimal(8000)/qB
calc('H A EUR',hA,'800'); calc('H B EUR',hB,'1000'); calc('H absolute increase',hB-hA,'200'); calc('H percentage old EUR base',(hB/hA-1)*100,'25')
calc('I A EUR',iA,'6400'); calc('I B EUR',iB,'8000'); calc('I absolute increase',iB-iA,'1600'); calc('I percentage old EUR base',(iB/iA-1)*100,'25')
calc('USD per EUR quotation change',(qB/qA-1)*100,'-20')
xA, xB = Decimal(10000)/qA, Decimal(10000)/qB
cA, cB = Decimal(4000)/qA, Decimal(4000)/qB
calc('X revenue A',xA,'8000'); calc('X revenue B',xB,'10000'); calc('X input A',cA,'3200'); calc('X input B',cB,'4000')
calc('X restricted difference A',xA-cA,'4800'); calc('X restricted difference B',xB-cB,'6000'); calc('restricted difference change',(xB-cB)-(xA-cA),'1200')
calc('X revenue absolute increase',xB-xA,'2000'); calc('X input absolute increase',cB-cA,'800')
calc('alternative USD price A',80*qA,'100'); calc('alternative USD price B',80*qB,'80'); calc('alternative USD price absolute change',80*(qB-qA),'-20'); calc('alternative USD price percentage change',(qB/qA-1)*100,'-20')
calc('new issue funding to Lumen',Decimal(1000)*100,'100000'); calc('secondary transaction to previous holder',Decimal(20)*100,'2000'); calc('secondary transaction funding to Lumen',Decimal(0),'0')
assert len(checks) == 25

negative = [
    {'examGoalId': IDS[0], 'case': 'property-absolutes', 'syntheticWholeAnswerDe': '1. Nora kann verkaufen. Als Eigentümerin darf sie auch nachts beliebig laut arbeiten. Art.14 erlaubt der Gemeinde den sofortigen Wegzugriff ohne besondere Grundlage. 2. Eigentum garantiert Nora langfristig Gewinne; deshalb brauchen Nachbarn keinen Schutz. 3. Gemeinwohl schlägt Eigentum immer, Zustimmung und Entschädigung sind unnötig. Weitere Informationen fehlen nicht.', 'stepPoints': [1,0,0], 'rubricReasonDe': 'Nur eine Befugnis erkannt; alle konkret verlangten Grenzen, Mechanismen, Werte und bedingten Abwägungen fehlen oder werden negiert.'},
    {'examGoalId': IDS[0], 'case': 'property-no-balance', 'syntheticWholeAnswerDe': '1. Nora darf grundsätzlich nutzen und verkaufen, die Lärmregel begrenzt das. Sozialbindung bedeutet, dass alle Dritten jede Privatfläche betreten dürfen. 2. Nutzung ist Noras Freiheit; private Räume beseitigen alle öffentlichen Belange und garantieren sichere Erträge. 3. Der Bürgermeister benötigt keine Zustimmung, sobald er den Schulweg nützlich findet; ein Ausgleich oder eine weitere Grundlage ist nicht erforderlich.', 'stepPoints': [3,1,0], 'rubricReasonDe': 'Befugnis und Lärmgrenze richtig; Sozialbindung, Entzugsvoraussetzungen, wirtschaftliche Funktionen und der konkrete Ausgleich sind falsch.'},
    {'examGoalId': IDS[1], 'case': 'quotation-multiplied', 'syntheticWholeAnswerDe': '1. Der Euro wertet auf. H zahlt1250 und1000EUR, I10000 und8000EUR, beide Kosten sinken20%. 2. X erhält12500 und10000EUR, Inputs5000 und4000EUR, Gewinn7500 und6000EUR. Damit profitieren alle Exporteure sicher. 3. Im80EUR-Vertrag kostet das Stück100 und80USD. Jeder Käufer kauft deswegen sofort mehr. Abwertung nützt allen Unternehmen und Haushalten; andere Kosten fehlen nicht.', 'stepPoints': [0,0,2], 'rubricReasonDe': 'Nur die alternative USD-Preisrechnung stimmt. Inverse Umrechnung, Kursrichtung, Kostenwirkung, begrenzter Deckungsbetrag und bedingte Nachfrageanalyse fehlen.'},
    {'examGoalId': IDS[1], 'case': 'revenue-is-profit', 'syntheticWholeAnswerDe': '1. Der Euro wertet ab. H zahlt800 und1000EUR; I6400 und8000EUR. Der Mehrbetrag beträgt200 bzw1600EUR und25% der alten EUR-Summe; die Gegenrichtung der Prozentänderung kann ich nicht erklären. 2. X erhält8000 und10000EUR, also sind beide Zahlen seine vollständigen Nettogewinne; Inputs und andere Kosten brauchen nicht abgezogen zu werden. 3. Der andere Stückpreis ist100 und80USD. Weil er sinkt, profitieren zwangsläufig alle Haushalte und Firmen, weitere Informationen sind unnötig.', 'stepPoints': [8,2,2], 'rubricReasonDe': 'Korrekte Zahlungsrechnungen erhalten ihre Punkte; Nettogewinn-, Inputs- und Universalbehauptungen ersetzen keine verlangten Mechanismen oder Grenzen.'},
    {'examGoalId': IDS[2], 'case': 'every-trade-funds-issuer', 'syntheticWholeAnswerDe': '1. Drei Monate sind kurzfristig und acht Jahre langfristig. Jede kurzfristig finanzierende Firma ist eine Bank; H und J können ihre Mittel immer ohne Risiko sofort zurückbekommen. 2.1000mal100 sind100000EUR und20mal100 sind2000EUR. Beide Beträge gehen an Lumen, denn jeder Börsenkauf finanziert das Unternehmen. Beteiligungen garantieren die Rückzahlung. 3. Die Plattform ist die Bank und garantiert alle Kredite. Risiken oder weitere Angaben sind nicht erforderlich.', 'stepPoints': [1,1,0], 'rubricReasonDe': 'Nur Zeithorizont und erster Betrag mit Empfänger richtig. Akteursrollen, Risiken, Sekundärzahlung, Beteiligungsbedingungen und Variantenvergleich falsch.'},
    {'examGoalId': IDS[2], 'case': 'numbers-without-actors', 'syntheticWholeAnswerDe': '1. Der Bedarf von15000EUR ist kurzfristig, die Maschine langfristig; damit ist Lumen automatisch ein Interbankenpartner. H und J brauchen beide jederzeit dieselbe kurzfristige Rückgabe. Banken reichen nur dieselben Banknoten durch; Informations- und Fristenrisiko gibt es nicht. 2. Die Neuemission zahlt100000EUR an Lumen, Sekundärhandel2000EUR an A und0 an Lumen. Der Sekundärmarkt hat keinerlei wirtschaftliche Funktion, jede Beteiligung und jeder Kredit sind risikolos. 3. Alle drei Varianten sind dasselbe, denn jede Auszahlung stammt von der Plattformbank. Weitere Informationen fehlen nicht.', 'stepPoints': [1,3,0], 'rubricReasonDe': 'Zeitgrenze und Zahlungswege korrekt, aber keine verlangte Akteurs-/Transformationsanalyse, indirekte Sekundärmarktrolle oder bedingte Risikobeurteilung.'},
]
for case in negative:
    exam = goals[case['examGoalId']]
    case['total'] = sum(case['stepPoints'])
    case['passingPoints'] = exam['examData']['scoring']['passingPoints']
    case['belowPassingThreshold'] = case['total'] < case['passingPoints']
    case['actualLearnerData'] = False
    assert case['belowPassingThreshold']

judgments = [
    {'examGoalId': IDS[0], 'originGoalId': ORIGINS[0], 'decision': 'KEEP', 'wholeMaterialFindingDe': 'Eine zusammenhängende Werkstatt/Weg-Situation operationalisiert Inhalt, Grenzen, Werte und wirtschaftliche Eigentumsfunktion. Gesetzliche Lärmgrenze ist ausdrücklich Materialannahme. §903 und Art14 sind korrekt eingegrenzt; Allgemeinwohlzweck ist keine automatische Eingriffsermächtigung. Freiwillige Vereinbarung und bedingte staatliche Instrumente werden getrennt. Kein tatsächlicher Einzelfallanspruch behauptet.', 'wholeRubricFindingDe': 'Drei vollständig bepunktete8BE-Teile bewerten konkrete Befugnisse/Grenzen, zwei ökonomische Mechanismen/Werte und materialgebundenen Interessenausgleich. Alternative nachvollziehbare Urteile gleichwertig;24max/15pass. DE/EN-Beschreibungen decken denselben Prüfrahmen.'},
    {'examGoalId': IDS[1], 'originGoalId': ORIGINS[1], 'decision': 'KEEP', 'wholeMaterialFindingDe': 'Explizite USD/EUR-Notierung, Gebühren/Absicherung/Zeiten/Mengen im Modell klar. Haushalts- und Importkosten getrennt vom Exporterlös sowie importierten Inputs.80EUR-Fakturierung bleibt ein getrennter Vertrag; keinerlei doppelte Erlöszählung.25% inverse Kostenänderung gegenüber20% Notierungsänderung korrekt. Fehlende andere Kosten und Nachfrage verhindern einen Nettogewinn- oder universellen Vorteilsschluss.', 'wholeRubricFindingDe': 'Drei vollständige10BE-Teile mit Berechnung, Bezugsgrößen, Mechanismen und Grenzen;30max/18pass. Alle25 arithmetischen Ausdrücke der beiden numerischen Prüfungen unabhängig gerechnet. Inhalt und DE/EN-Prüfkompetenz decken Haushalt und verschiedene Unternehmensrollen.'},
    {'examGoalId': IDS[2], 'originGoalId': ORIGINS[2], 'decision': 'KEEP', 'wholeMaterialFindingDe': 'Kurz-/Langfristigkeit und enger Interbankenmarkt korrekt getrennt. H/J/Lumen haben verschiedene Interessen; Bankfunktionen sind keine physische Banknoten-Durchreiche. Primärmittel100000 an Lumen und Sekundärzahlung2000 an A werden strikt getrennt. Beteiligung ohne garantierten Endtermin und modellhaft direkte Plattformdarlehen vermeiden unbelegte reale Schutz-/Bankgarantien. Materielle Risiken und fehlende Daten tragen ein bedingtes Wirtschaftsfunktionsurteil.', 'wholeRubricFindingDe': 'Drei konkret ausgearbeitete8BE-Teile bewerten Interessen/Transformation, Zahlungsrollen und drei Finanzierungsvarianten mit fallbezogenen Risiken.24max/15pass, drei vollständige Aufgaben/Erwartungshorizonte, keine erfundene pauschale Vollabdeckung anderer Ziele.'},
]
release = copy.deepcopy(picked)
for before, after in zip(picked, release):
    after['examData']['reviewStatus'] = 'released'
    back = copy.deepcopy(after)
    back['examData']['reviewStatus'] = 'draft'
    assert before == back
release_path = OUT / 'whole-three-material-reviewed-machine-released.inert.candidate.json'
assert not release_path.exists()
release_path.write_text(json.dumps(release, ensure_ascii=False, indent=2) + '\n')
receipt = {
    'schemaVersion': 1,
    'createdAt': datetime.now(timezone.utc).isoformat(),
    'reviewer': '/root',
    'authorReviewed': '/root/economics_independent_continuation_a',
    'reviewRole': 'independent complete three assessment material, current whole origins, source, calculations and scoring review',
    'candidateInput': binding(SOURCE),
    'currentOriginsFrame': binding(CAN),
    'actuallyReadWholeExamGoalIds': IDS,
    'actuallyReadWholeOriginGoalIds': ORIGINS,
    'wholeTaskAndSolutionAndEveryRubricStepActuallyRead': True,
    'primarySourcesActuallyRead': [
        {'url': 'https://www.gesetze-im-internet.de/bgb/__903.html', 'raw': binding(OUT / 'actual-primary-bgb903.http-original.html'), 'findingDe': 'Eigentümerbefugnisse stehen unter gesetzlichen und fremden Rechten; der Werkstattfall betrifft Sachen. Keine unbegrenzte Nutzung oder automatische Fremdnutzung.'},
        {'url': 'https://www.gesetze-im-internet.de/gg/art_14.html', 'access': 'actual web content Art14 all three paragraphs', 'findingDe': 'Schutz, gesetzliche Grenzen und soziale Verantwortung sind getrennt von den gesetzlichen Bedingungen eines Entzugs; öffentlicher Nutzen allein genügt nicht.'},
        {'url': 'https://www.bundesbank.de/de/statistiken/geld-und-kapitalmaerkte/zinssaetze-und-renditen/geldmarktsaetze', 'access': 'actual web content money-market definitions paragraphs', 'findingDe': 'Allgemeiner kurzfristiger Bereich bis einschließlich ein Jahr; enger Markt ist vor allem zwischen Banken, nicht jeder kurzfristige Unternehmensvertrag.'},
        {'url': 'https://www.bundesbank.de/dynamic/action/de/startseite/glossar/723820/glossar', 'access': 'actual web content Abwertung, Aufwertung, Aktie and Aktienmarkt entries', 'findingDe': 'WenigerUSD jeEUR ist Euroabwertung; Wirkungen hängen im gegebenen Vertrag von Preis- und Zahlungswährung ab. Ein Sekundärverkauf überträgt bestehende Anteile zwischen Anlegern.'},
    ],
    'actualFailedRetrievalsPreserved': [
        {'method': 'web open BGB903', 'result': '400 Timeout fetching; not claimed successful'},
        {'method': 'fresh HTTP raw BGB903 followed by optional bs4 parse', 'result': 'raw saved successfully, command exited1 ModuleNotFoundError bs4; stdlib bounded parse of same preserved raw then succeeded; no source substitution'},
    ],
    'independentDecimalChecks': checks,
    'sixActualAuthoredSyntheticNegativeWholeSubmissions': negative,
    'syntheticScoringLimit': 'These are six actually authored and rubric-scored faulty model submissions, not actual learner behavior, exhaustive false-positive proof, runtime tests or empirical acceptance.',
    'individualWholeMaterialJudgments': judgments,
    'machineMaterialRelease': {'candidate': binding(release_path), 'onlyDelta': 'examData.reviewStatus draft to released on exactly three whole goals; all bodies, solutions, sources, scores and metadata otherwise exact', 'meaning': 'Machine curriculum-content material release only, not publication, human acceptance, dual description review or learner mastery.'},
    'nativeReleaseReference': 'app/scripts/generateCurriculumQualityStatus.ts CQR-201/202/203; these local material releases still require actual integration checks',
    'strictProgress': {'currentComplete': 300, 'currentDenominator': 311, 'netGain': 0, 'newFachlicheClosures': 0, 'restoredLiveBindings': 0},
    'truthfulness': {'mediaFourthGoalReviewed': False, 'liveWrites': [], 'fullCountrySourceApproval': False, 'DApproval': False, 'humanApproval': False, 'M7Claim': False},
    'next': 'Keep media whole successor separate until actual cartoon binding and independent material review; retain these three exact whole bodies and proceed to final contextual D review and native stable integration.'
}
p = OUT / 'actual-independent-three-whole-terminal-source-calculation-rubric-and-machine-release.receipt.json'
assert not p.exists()
p.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'receipt': binding(p), 'wholeReleasedCandidate': binding(release_path), 'wholeAssessments': len(picked), 'independentArithmeticChecks': len(checks), 'actualSyntheticBelowThreshold': len(negative), 'strictNetGain': 0}, ensure_ascii=False))
