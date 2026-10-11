"""Independent material judgments; never changes authors, live goals, or gates."""
from copy import deepcopy
from datetime import datetime, timezone
from decimal import Decimal, getcontext
from hashlib import sha256
import json
from pathlib import Path
import subprocess
import sys

ROOT = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file() and (p / 'curricula').is_dir())
sys.path.insert(0, str(ROOT / 'scripts'))
from validate_schemas import curriculum_symlink_errors
from jsonschema import Draft202012Validator

OUT = Path(__file__).resolve().parent
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-Q2-forty-native-terminal-gaps-nine-whole-materials-author-v1/nine-whole-Q2-portable-official-reference-and-own-aid-successor-v6'
SLUGS = ['q2-shared-labour-transition', 'q2-shared-enterprise-refill',
         'q2-shared-legal-purchase-and-tort', 'q2-LK-inflation-and-cycle']
INPUTS = [BASE / 'whole-nine-Q2-DRAFT-assessment-goals.source-portable-successor-v6.json',
          BASE / 'whole-CAN416-nine-source-portable-Q2-DRAFT-materials.inert-successor-v6.json',
          BASE / 'actual-final-current-Q2-nine-DRAFT-materials-AGENTS1041-portable-source-successor-v6.receipt.json',
          BASE / 'twenty-official-URL-original-hash-own-DE-EN-reading-aids-and-actual-read-boundaries.committable.json',
          ROOT / 'docs/landscape-runtime.schema.json',
          ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json']
for slug in SLUGS:
    INPUTS += [BASE / (slug + suffix) for suffix in [
        '.whole-DE-EN-task-solution-rubric.portable-final-v6.json',
        '.whole-material-and-performance-map.portable-final-v6.json',
        '.whole-task.de.md', '.whole-task.en.md', '.whole-solution.de.md', '.whole-solution.en.md']]


def binding(path):
    raw = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': sha256(raw).hexdigest(), 'bytes': len(raw)}


def write(name, value):
    path = OUT / name
    assert not path.exists(), 'Preserve sealed review artifacts; use a successor.'
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    json.loads(path.read_text())
    return binding(path)


before = [binding(p) for p in INPUTS]
goals = json.loads(INPUTS[0].read_text())
frame = json.loads(INPUTS[1].read_text())
index = {g['id']: g for g in frame['goals']}
selected = []
contracts = {}
for slug in SLUGS:
    material = json.loads((BASE / (slug + '.whole-DE-EN-task-solution-rubric.portable-final-v6.json')).read_text())
    mapping = json.loads((BASE / (slug + '.whole-material-and-performance-map.portable-final-v6.json')).read_text())
    goal = next(g for g in goals if g['examData'] == material)
    assert mapping['wholeAssessmentGoal'] == goal
    assert goal['requires'] == material['coveredGoalIds']
    assert len(set(goal['requires'])) == len(goal['requires'])
    for entry in mapping['actualIntendedPerformanceMap']:
        target = entry['goalId']
        assert entry['wholeCurrentGoal'] == index[target]
        contracts[target] = deepcopy(index[target])
    assert set(goal['requires']) == {e['goalId'] for e in mapping['actualIntendedPerformanceMap']}
    assert all(material[k] for k in ['taskContent', 'taskContentEn', 'solutionContent', 'solutionContentEn'])
    assert material['reviewStatus'] == 'draft'
    selected.append((slug, goal))
assert len(contracts) == 21

getcontext().prec = 40
D = Decimal
checks = []


def check(label, actual, expected, tolerance='0'):
    actual, expected, tolerance = D(actual), D(expected), D(tolerance)
    assert abs(actual - expected) <= tolerance, (label, actual, expected)
    checks.append({'check': label, 'actual': str(actual), 'expected': str(expected), 'tolerance': str(tolerance), 'passed': True})


# Independent recomputation from supplied fictional facts, not author's QS output.
check('labour NAIRU percentage-point change', -D('.4') * (D(7) - D(5)), '-.8')
check('labour real pay percent', (D('1.03') / D('1.04') - 1) * 100, '-.961538461538', '0.000000000001')
check('labour nominal unit-labour-cost percent', (D('1.03') / D('1.01') - 1) * 100, '1.980198019802', '0.000000000001')
check('labour initial participation count', D(2000) * D('.65'), '1300')
check('labour subsequent participation count', D(1800) * D('.75'), '1350')
check('labour participation count difference', D(1350) - D(1300), '50')
check('labour treatment observed increase', D(80) - D(50), '30')
check('labour comparison observed increase', D(68) - D(50), '18')
check('labour non-causal difference in changes', (D(80)-50) - (D(68)-50), '12')
check('labour observed difference per initial group percentage points', D(12) / 120 * 100, '10')
check('enterprise household potential units', D(1500) * 2, '3000')
check('enterprise actual market share percent', D(600) / 2100 * 100, '28.571428571429', '0.000000000001')
check('enterprise potential minus volume; no guaranteed sales', D(3000) - 2100, '900')
check('enterprise business gross potential', D(40) * 50, '2000')
check('enterprise reachable business potential', D(25) * 50, '1250')
check('enterprise stock purchase upfront cash', D(1000) * 8, '8000')
check('enterprise initial lead time', D(25) + 35 + 10 + 90, '160')
check('enterprise revised lead time', D(15) + 35 + 10 + 90, '150')
check('enterprise lead-time saving, no throughput guarantee', D(160) - 150, '10')
check('enterprise cash after machine purchase', D(6000) + 24000 - 22000, '8000')
check('enterprise cash gap against invoice', D(12000) - 8000, '4000')
check('enterprise old machine sale cash', D(7000), '7000')
check('enterprise old machine book disposal result', D(7000) - 9000, '-2000')
check('enterprise contribution margin', D(20) - 12, '8')
check('enterprise initial break-even units', D(8000) / (D(20)-12), '1000')
check('enterprise present operating result', (D(20)-12)*600-8000, '-3200')
check('enterprise variant contribution margin', D(20) - 14, '6')
check('enterprise variant integer break-even units', (D(8000) / 6).to_integral_value(rounding='ROUND_CEILING'), '1334')
check('enterprise reusable footprint ten uses', D(12)+(D('.2')+D('.1'))*10, '15')
check('enterprise disposable footprint ten uses', D(1)*10, '10')
check('enterprise reusable footprint twenty uses', D(12)+(D('.2')+D('.1'))*20, '18')
check('enterprise disposable footprint twenty uses', D(1)*20, '20')
check('legal separate stipulated window damage', D(300), '300')
check('legal lamp purchase price is not window damage', D(60), '60')
check('inflation simplified multiplier total', D(20)/(1-D('.6')), '50')
check('inflation model first follow-up', D(20)*D('.6'), '12')
check('inflation model second follow-up', D(12)*D('.6'), '7.2')
check('inflation overall 2027 fixed-base index', D('.3')*140+D('.7')*110, '119')
check('inflation overall 2028 fixed-base index', D('.3')*126+D('.7')*D('113.3'), '117.11')
check('inflation overall 2027 percent', (D(119)/100-1)*100, '19')
check('inflation overall 2028 percent', (D('117.11')/119-1)*100, '-1.588235294118', '0.000000000001')
check('inflation household 2027 index', D('.5')*(140+110), '125')
check('inflation household 2028 index', D('.5')*(126+D('113.3')), '119.65')
check('inflation household 2027 percent', (D(125)/100-1)*100, '25')
check('inflation household 2028 percent', (D('119.65')/125-1)*100, '-4.28')
check('inflation broad price change first', (D(107)/110-1)*100, '-2.727272727273', '0.000000000001')
check('inflation broad price change second', (D(104)/107-1)*100, '-2.803738317757', '0.000000000001')
check('Phillips at u7', D(2)-D('.5')*(7-5), '1')
check('Phillips at u4', D(2)-D('.5')*(4-5), '2.5')
check('Phillips supply shift at u7', D(2)-D('.5')*(7-5)+3, '4')
check('NAIRU interval lower estimate', -D('.4')*(6-4), '-.8')
check('NAIRU intermediate illustrative estimate', -D('.4')*(6-5), '-.4')
check('NAIRU interval upper estimate', -D('.4')*(6-7), '.4')
for slug, goal in selected:
    scoring = goal['examData']['scoring']
    check(slug + ' independently summed rubric maximum', sum(D(s['points']) for s in scoring['steps']), str(scoring['maxPoints']))
    assert 0 < scoring['passingPoints'] <= scoring['maxPoints']

counteranswers = []


def counter(slug, case, answer, awarded, reasons):
    goal = next(g for s, g in selected if s == slug)
    scoring = goal['examData']['scoring']
    assert len(awarded) == len(reasons) == len(scoring['steps'])
    assert all(0 <= p <= step['points'] for p, step in zip(awarded, scoring['steps']))
    total = sum(awarded)
    assert total < scoring['passingPoints']
    counteranswers.append({'material': slug, 'case': case, 'completeIndependentSyntheticAnswerDe': answer,
                          'manualStepScores': [{'stepId': step['id'], 'awarded': p, 'maximum': step['points'], 'actualRubricReasonDe': reason}
                                               for step, p, reason in zip(scoring['steps'], awarded, reasons)],
                          'total': total, 'passingPoints': scoring['passingPoints'], 'result': 'not passed',
                          'notLearnerData': True, 'notAuthorCounteranswer': True})


counter(SLUGS[0], 'NAIRU, headcount, and administrative exit mistaken for employment',
    '1. Die Arbeitslosigkeit liegt über fünf Prozent; deshalb steigt die Inflation um 0,8 Punkte. Jeder niedrigere Lohn schafft automatisch Stellen. 2. Die Gewerkschaft will höhere Löhne, das Unternehmen niedrigere Kosten. Drei Prozent nominal sind drei Prozent real; die Produktivität macht die Lohnstückkosten um ein Prozent niedriger. Der Streik trifft nur den Betrieb. 3. Die Erwerbspersonen fallen von 2000 auf 1800; Beteiligung und Qualifikation sind unwichtig. 4. 80 Beschäftigte beweisen 80 neue Programmjobs, auch ein Registerabgang ist eine neue Stelle. 5. Alle 180 erhalten sofort die 90 offenen Stellen; Qualifikation, Schichtzeiten und die anderen Angebote muss man nicht prüfen.',
    [0, 2, 0, 0, 0], ['Falsches Vorzeichen und deterministische Modellbehauptung; keine zutreffende Grenze.', 'Nur die beiden Interessen sind richtig; Rechnungen und Wirkungsketten fehlen oder sind falsch.', 'Weder beide Erwerbspersonenzahlen noch Unterscheidungen.', 'Keine richtige Differenz, Engpass- oder Kausalitätsanalyse.', 'Anzahlen und Voraussetzungen widersprechen dem Material.'])
counter(SLUGS[0], 'correct figures with unjustified causal and policy claims',
    '1. Delta Inflation beträgt minus 0,8 Prozentpunkte. Das ist eine sichere Prognose, die NAIRU messen wir fehlerfrei. 2. Gewerkschaft und Unternehmen verfolgen Lohn und Kosten; real minus 0,9615 Prozent, nominale Lohnstückkosten plus 1,9802 Prozent. Die Nachfrage steigt sicher bei jedem Abschluss, die Lieferanten merken einen Streik nicht. 3. 1300 und 1350, also plus 50. Jede Person leistet identische Vollzeitstunden und erfüllt alle Qualifikationen. 4. Die Gruppen steigen um 30 und 18, Differenz 12 Personen oder zehn Prozentpunkte. Das beweist randomisierte Programmwirkung; 60 Pflege-/IT-Stellen benötigen Qualifikation, deshalb braucht niemand Weiterbildung. 5. Nur sofortige pauschale Lohnsenkung ist sinnvoll, Weiterbildung und Kinderbetreuung sind nutzlos, Folgen werden nicht beobachtet.',
    [2, 6, 2, 4, 0], ['Richtige Modellrechnung; Annahmen werden unzutreffend verabsolutiert.', 'Interessen und beide Rechnungen richtig; bedingte Wirkungsketten fehlen.', 'Beide Zahlen richtig; Kopf/Stunden/Qualifikation gleichgesetzt.', 'Differenz drei Punkte und ein benannter Qualifikationsengpass ein Punkt; falsche Kausalität und Statistik.', 'Keine passende begründete Priorisierung oder überprüfbare Umsetzung.'])
counter(SLUGS[1], 'green label and potential mistaken for guaranteed business performance',
    '1. Wiederverwendung ist immer klimafreundlicher und ersetzt jede Sozialprüfung; nach zehn Nutzungen hat sie zehn Einheiten. 2. Eigenkapital von 10000 Euro gibt keine Mitsprache; der Maschinenverkauf ist 9000 Euro Gewinn. Die kurzfristige Finanzierung passt immer zu 24 Monaten. 3. Der Deckungsbeitrag ist acht Euro, Break-even aber 600 Stück; Varianten kosten nichts zusätzlich. In SWOT ist sinkende Nachfrage eine interne Stärke. 4. Das neue Kühlprodukt ist Marktdurchdringung; ein Plan braucht keine Zuständigkeit. 5. B ist wegen 40 Kilometern nachweislich sozial vorbildlich, seine Eigenauskunft genügt. 6. Die Verarbeitung dauert 70 Minuten, Wartezeit zählt nicht; zehn Minuten weniger Schneiden garantieren mehr Durchsatz. 7. 3000 potenzielle Haushaltskäufe sind sichere eigene Verkäufe, der Marktanteil beträgt 600/3000; Firmen bringen automatisch noch 2000 Käufe.',
    [0, 0, 1, 0, 1, 0, 1], ['Falsche Bilanz und unbelegtes Gesamturteil.', 'Kontrolle, Cash/Verlust und Fristen verwechselt.', 'Ein richtiger Deckungsbeitrag; SWOT, Ergebnis und Variantengrenzen fehlen.', 'Strategiebezeichnung und Umsetzung falsch.', 'Ein reales Entfernungskriterium genannt; kein belastbarer Form-/Standardvergleich.', 'Wartezeit und Durchsatzgrenze falsch.', 'Eine Bruttopotenzialzahl richtig; Mengen und Verkäufe verwechselt.'])
counter(SLUGS[1], 'several correct calculations with unresolved operational judgments',
    '1. Zehn Nutzungen ergeben 15 gegen zehn, zwanzig Nutzungen 18 gegen zwanzig. Alle Entsorgungs- und Sozialfragen sind dadurch endgültig bewiesen. 2. Nach der Maschine bleiben 8000 Euro, es fehlen 4000; Verkauf bringt 7000 Cash und 2000 Buchverlust. Ein Dreimonatskredit trägt die 24 Monate sicher ohne Refinanzierung. 3. Deckungsbeitrag acht, Break-even 1000, Ergebnis minus 3200. SWOT nennt Reparaturwissen als Stärke und billige Konkurrenz als externes Risiko; die teurere Variante ändert nichts. 4. Alle Maßnahmen sind Diversifikation, eine Pilotverantwortung und Revision erübrigen sich. 5. B muss nicht auf Arbeitsbedingungen geprüft werden; Nähe beweist alle Standards. 6. 160 wird 150 Minuten, daraus folgen sicher höhere Stückzahl und null Fehler. 7. Haushaltsvolumen 2100, Potenzial 3000, Anteil 28,5714 Prozent; die Lücke und 1250 erreichbare Firmenkäufe sind garantiert unsere Verkäufe.',
    [3, 4, 5, 0, 0, 3, 4], ['Beide richtige Bilanzfälle; kein begrenztes Urteil mit vier Perspektiven.', 'Cash, Buchverlust und Lücke richtig; Herkunft/Kontrolle und Fristurteil fehlen.', 'Zwei zutreffende SWOT-Zuordnungen plus drei Zahlenpunkte; Variantengrenze ignoriert.', 'Keine richtige Strategie oder Umsetzung.', 'Keine angemessene Risiko- oder Standardprüfung.', 'Ablaufrechnung richtig, Engpass und Qualität unbegründet.', 'Rechnungen richtig, potenzielle Mengen bleiben fälschlich garantiert.'])
counter(SLUGS[2], 'defect automatically cancels ownership and creates refund',
    '1. Regen ist stets Missbrauch; die vereinbarte Garteneignung spielt keine Rolle. Die Innenraumvariante ist derselbe anfängliche Mangel. 2. Eigentum entsteht erst durch mangelfreie Leistung; deshalb ist V weiterhin Eigentümer. Fahrlässigkeit muss im Fensterfall niemals gezeigt werden. 3. Paragraph 433 regelt den Kauf, Paragraph 929 die Übergabe. Ein Defekt macht beide Vorgänge automatisch nichtig und gibt sofort 60 Euro Rückzahlung ohne Nacherfüllung. 4. Sehr geehrter N, zahlen Sie mir 60 Euro für die Lampe und zusätzlich 100 Euro Strafe. Einen Fenstervorgang, Schaden oder Kausalität brauche ich nicht zu nennen. Auch unbekanntes Verschulden gilt als bewiesen.',
    [0, 0, 2, 0], ['Vereinbarung, objektive Merkmale und entscheidende Variante missachtet.', 'Keine richtige Merkmal-Fakten-Struktur oder bedingte Folge.', 'Zwei richtige Normbezüge, aber keine korrekte Kette, Subsumtion oder getrennte Ebenen.', 'Falscher Vorgang/Betrag und unbelegte Zusatzforderung.'])
counter(SLUGS[2], 'plausible remedy labels without structured legal application or demand text',
    '1. K beruft sich auf die Gartenvereinbarung, V auf üblichen Gebrauch. Die Zusage spricht für K; die Innenraumvariante verändert nichts. 2. Ein Riss ist ein Sachmangel; weitere Tatbestandsmerkmale und Fakten ordne ich nicht zu. Beim Fenster reicht das Eigentum allein, selbst wenn Verschulden unbekannt ist. 3. Die Kette lautet 433, 434, 437 Nummer 1, 439. Der anfängliche Riss kann Nacherfüllung auslösen. Die Eigentumsübertragung bleibt jedoch ohne Erklärung auch automatisch rückgängig. 4. Eigentum, rechtswidrige schuldhafte Schädigung und Kausalität sind Voraussetzungen des Paragraphen 823; im Ausgangsfall passen Steinwurf und Fenster dazu, der Schaden ist 300 Euro. Einen tatsächlichen Forderungstext schreibe ich nicht; in der Variante fordere ich sicher, obwohl Verschulden offen ist.',
    [5, 1, 7, 4], ['Beide Lesarten und teilweise Normabwägung; Variante falsch.', 'Ein passender Rissbezug, aber keine ausreichende Struktur oder bedingte Folge.', 'Normkette vier und Subsumtion drei Punkte; Ebenen falsch.', 'Subsumtion vier Punkte; verlangter sachlicher Text und bedingte Variante fehlen.'])
counter(SLUGS[3], 'unweighted inflation and permanent Phillips trade-off',
    '1. Investition 20 wird durch zwei Runden insgesamt 32; Multiplikation und Kapazität sind beliebig. Höhere Zinsen erzeugen Energie. 2. Nur Geldmenge verursacht jede Inflation; die Quelle beweist das auch für 2026. 3. Gesamtindex ist der Mittelwert 125 und 119,65. Weil andere Güter teurer werden, herrscht sicher überall Inflation; die reale feste Schuld fällt mit Preisen. 4. Die Phillips-Kurve zeigt dauerhaft: Arbeitslosigkeit vier ergibt null Inflation. Ein Kostenschock verändert die Kurve nie. 5. NAIRU ist genau fünf und kann niemals geschätzt werden; u sechs beweist plus 0,4 Punkte Inflation, Politik muss blind expandieren.',
    [1, 0, 0, 0, 0], ['Eine richtige erste Folgerunde 12 erkennbar; Summe, Mechanismus und Grenzen falsch.', 'Monokausalität und zeitliche Übertragung nicht belegt.', 'Haushalts- mit Gesamtgewichten verwechselt und Schuld-/Preisvorzeichen falsch.', 'Keine richtige Modellrechnung, Bewegung oder bedingtes Urteil.', 'Vorzeichen und Schätzunsicherheit falsch.'])
counter(SLUGS[3], 'correct isolated numbers with false universal inference',
    '1. 20/(1−0,6)=50; das gilt ohne Bedingungen in A und B und Zins erzeugt Energie. 2. Nachfrage, Kosten und Erwartungen sind drei Wörter für ausschließlich Geldwachstum; die Rede liefert den Kausalbeweis für Oktober 2026. 3. 119 und 117,11, also plus 19 und minus 1,5882353 Prozent; Haushalt 125 und 119,65, plus 25 und minus 4,28 Prozent. Ich nenne den fallenden Gesamtindex bloß Disinflation; fixe Schuld wird real kleiner. 4. Bei u sieben ist pi eins, bei u vier 2,5, bei Schock drei pi vier. Trotz gleichem u handelt es sich um dieselbe Bewegung, Erwartungen und langfristige Politik ändern nichts. 5. Die Intervallenden ergeben minus 0,8 und plus 0,4 Punkte. Ich ignoriere das Pluszeichen, schätze keinerlei andere Daten und verlange ein starres Ziel.',
    [3, 0, 4, 3, 4], ['Geometrische Rechnung richtig; Alternativmechanismus und Grenzen falsch.', 'Keine zutreffende Mechanismenunterscheidung, historische Grenze oder Politik.', 'Gewichtete Zahlen richtig; Begriffe, historische und reale Grenzen falsch.', 'Drei Modellrechnungen richtig; Shift und bedingte Politik falsch.', 'Intervallrechnung richtig; Urteil und Alternative fehlen.'])
assert len(counteranswers) == 8

schema = json.loads((ROOT / 'docs/landscape-runtime.schema.json').read_text())
validator = Draft202012Validator({'$ref': '#/$defs/goal', '$defs': schema['$defs']})
errors = []
for _, goal in selected:
    errors += [{'goalId': goal['id'], 'message': e.message} for e in validator.iter_errors(goal)]
assert not errors, errors

decisions = []
findings = [
    {'id': 'Q2-LABOUR-INITIAL-POPULATION', 'material': SLUGS[0], 'decision': 'REVISE',
     'findingDe': 'DE nennt alle 120 Programmteilnehmenden arbeitslos, obwohl dieselbe Anfangsgruppe 50 Beschäftigte enthält. EN sagt zutreffend nur participants.',
     'requestedBoundedRemedy': 'Nur unbelegte DE-Ausgangsklassifikation entfernen; Gruppengrößen und alle Zahlen behalten.'},
    {'id': 'Q2-LABOUR-DEMOGRAPHY-BARGAINING', 'material': SLUGS[0], 'goalId': 'b727bdda-ea96-5acd-b23f-ed94777ba7a0', 'decision': 'REVISE',
     'findingDe': 'Ganzer Zielvertrag verlangt Demografieeffekte auf Arbeitsmarkt und Tarifpolitik. Aufgabe/Lösung/Rubric3 prüfen bisher nur Erwerbspersonen sowie Kopf/Stunden/Qualifikation, ohne demografisch bedingte Tarifwirkung.',
     'requestedBoundedRemedy': 'Task/Solution3 DEEN und vorhandene6P Rubric um bedingte demografische Tarifwirkung ergänzen; Gesamtrubric44/27 unverändert, keine sichere Lohnfolge aus sinkender Bevölkerung behaupten.'},
    {'id': 'Q2-INFLATION-SUPPLIED-ORIGINAL-PROMISE', 'material': SLUGS[3], 'decision': 'REVISE',
     'findingDe': 'M2 DE und EN versprechen weiterhin den beigefügten vollständigen Originaltext, obwohl der aktuelle portable V6-Nachfolger bewusst nur amtlicheURL, Hash und eigene Lesehilfe liefert.',
     'requestedBoundedRemedy': 'Nur beide M2-Beilagezusagen auf tatsächlich enthaltene eigene Lesehilfe und verlinkte amtliche historische Quelle ändern; kein vollständiger Original-Pflichtinput und keine sonstige Aufgaben-/Zahlen-/46/28-Änderung.'}]
for slug, goal in selected:
    relevant = [f for f in findings if f['material'] == slug]
    decisions.append({'material': slug, 'assessmentGoalId': goal['id'], 'decision': 'REVISE' if relevant else 'KEEP',
                      'coveredWholeGoalIds': goal['examData']['coveredGoalIds'], 'minimalActualRequires': goal['requires'],
                      'findingIds': [f['id'] for f in relevant],
                      'method': 'Whole DE/EN tasks, solutions, scoring and outer goal actually read and compared with every whole covered current goal contract.'})

released = []
for slug, goal in selected:
    if slug in [SLUGS[1], SLUGS[2]]:
        successor = deepcopy(goal)
        successor['examData']['reviewStatus'] = 'released'
        reversion = deepcopy(successor)
        reversion['examData']['reviewStatus'] = 'draft'
        assert reversion == goal
        released.append(successor)

guard_after = [binding(p) for p in INPUTS]
assert before == guard_after
ignored = subprocess.run(['git', 'check-ignore', '--no-index', '--'] + [str(p.relative_to(ROOT)) for p in INPUTS], cwd=ROOT, capture_output=True, text=True)
assert ignored.returncode in [0, 1]
assert not ignored.stdout.strip(), ignored.stdout
symlink_errors = curriculum_symlink_errors(ROOT)
assert not symlink_errors, symlink_errors

bindings = {
    'actualIndividualMaterialDecisions': write('actual-four-whole-Q2-material-decisions-and-three-real-findings.json', {'decisions': decisions, 'findings': findings}),
    'whole21CurrentContracts': write('whole-twentyone-current-Q2-covered-contracts.actual-read-and-exact-frame-snapshot.json', list(contracts.values())),
    'actualOwnNumericAndScoringChecks': write('actual-independent-Decimal-and-rubric-sums.json', checks),
    'actualEightWholeCounteranswers': write('actual-eight-independent-whole-synthetic-counteranswers-and-individual-manual-rubric-assessment.json', counteranswers),
    'onlyTwoWholeReleasedSuccessors': write('whole-two-Q2-enterprise-and-legal-materials.only-reviewed-machine-status-released.inert.json', released),
    'inputGuards': write('actual-original-Q2-four-materials-and-author-frame.whole-input-byte-guards.json', before),
}
receipt = {
    'schemaVersion': 1, 'createdAt': datetime.now(timezone.utc).isoformat(), 'reviewer': '/root', 'author': '/root/economics_merge_audit',
    'scope': 'Only four assigned whole Q2 materials and21 existing current competence contracts. Not the other five Q2 materials, whole course or central M7.',
    'actualWholeReview': 'Whole DE/EN tasks, solutions, all rubric steps and outer/current goal contracts read. Initial truncated legal tool output was followed by complete separate DE/EN/norm/solution/contract reads; no truncated read is claimed as whole.',
    'bindings': bindings, 'actualMaterialDecisions': decisions, 'actualFindings': findings,
    'wholeExistingCompetenceCount': len(contracts), 'KEEPWholeMaterials': 2, 'REVISEWholeMaterials': 2,
    'primaryNormsActuallyRead': [{'officialURL': f'https://www.gesetze-im-internet.de/bgb/__{n}.html', 'scope': 'whole section actually read and compared with supplied material'} for n in [433,434,437,439,823,929]],
    'actualHistoricalECBRead': {'officialURL': 'https://www.ecb.europa.eu/press/key/date/2023/html/ecb.sp230925_1~7ad8ef22e2.en.html',
                              'historicalDate': '2023-09-25', 'scope': 'Actual official main speech body lines43-176 read; no footnote-paper or current2026-report approval.',
                              'ownSubstantiveConclusionDe': 'Die historische Rede unterscheidet Geldbasis und breite Aggregate, bedingte Nachfrage-/Angebotsinteraktion und Prognoseinformation von eindeutiger Kausalität. Der Materialkern passt zu diesem historischen Bezug; die falsche Volltextbeilagezusage bleibt offen.'},
    'enterpriseCoverageQualification': 'Production contract uses whole dossier tasks3 and6 together: variant unit costs in3, waiting/throughput/quality in6. No single task6-only cost evidence claimed; no Porter requirement invented for strategy335.',
    'actualNumericChecks': len(checks), 'actualCompleteIndependentSyntheticCounteranswers': len(counteranswers),
    'counteranswersAreNotObservedLearnerEvidence': True, 'originalGoalSchemaErrors': errors,
    'all30OriginalWholeInputGuardsExact': before == guard_after, 'wholeInputGuardCount': len(before),
    'ignoredMandatoryInputTargets': [], 'curriculumSymlinkErrors': symlink_errors,
    'unchangedValidPositiveEvidence': 'Historical positive records are retained; no new P approval or whole source coverage inferred from terminal assessment.',
    'originalNineRemainDraftAndExact': True, 'onlyReleasedStatusChangedForTwoKEEP': True,
    'newSemanticKindDecision': False, 'wholeSourceCourseRoleApproval': False, 'newDescriptionReviewApproval': False,
    'newMemoryOrVisualizationApproval': False, 'humanReview': 'pending', 'humanRelease': 'pending', 'learnerTrial': 'not performed',
    'liveWrites': False, 'stageCommitPush': False, 'centralBefore': {'closed': 300, 'curricularAtomic': 311, 'maturity': 'M2'},
    'centralAfter': {'closed': 300, 'curricularAtomic': 311, 'maturity': 'M2'},
    'newStrictAcademicClosures': 0, 'restoredStrictBindings': 0, 'strictNetGain': 0,
    'nextStep': 'Author bounded labour/inflation successors, then independent exact delta checks; combine only reviewed material statuses in inert integration frame.'
}
final = write('actual-final-independent-four-Q2-whole-materials-two-KEEP-two-REVISE-and-three-real-findings.receipt.json', receipt)
print(json.dumps({'receipt': final, 'materialKEEP': 2, 'materialREVISE': 2, 'findings': 3, 'wholeContracts': 21, 'numericChecks': len(checks), 'wholeCounteranswers': 8, 'strictNetGain': 0}, ensure_ascii=False))
