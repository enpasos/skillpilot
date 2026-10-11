from pathlib import Path
from datetime import datetime, timezone
from decimal import Decimal
from copy import deepcopy
import hashlib
import json
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-Q1-Q4-fifteen-five-coherent-material-author-v1'
IDENTITY = '/root/economics_source3_independent_final_performance_need'
D = Decimal


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def ref(path):
    return {'path': str(path.relative_to(ROOT)), 'sha256': sha(path), 'wholeBytes': path.stat().st_size}


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def write(name, data):
    p = OUT / name
    body = json.dumps(data, ensure_ascii=False, indent=2) + '\n'
    if p.exists():
        assert p.read_text(encoding='utf-8') == body, 'Do not overwrite review output: ' + str(p)
        return p
    p.write_text(body, encoding='utf-8')
    read(p)
    return p


handoff_path = AUTHOR / 'actual-final-Q1-Q4-fifteen-five-material-reviewable-author-handoff.receipt.json'
assert sha(handoff_path) == '205da97d5b92b2e8a7a6e9e0274eee66bdf31a5ac014d3511edef77c5f3fc7fc'
handoff = read(handoff_path)
bundle_path = ROOT / handoff['wholeFiveDRAFTMaterialGoals']['path']
assert sha(bundle_path) == 'a05aed40c5cad6bc9fa8f4ac121644171e4d29ecf6ee057d9c17ab94becf2af2'
index_path = ROOT / handoff['wholeFiveReviewIndex']['path']
index = read(index_path)
materials = read(bundle_path)
intake_path = ROOT / index['frozenWholeCurrent15AndP30']['path']
intake = read(intake_path)
source146_path = ROOT / intake['actualOriginalWhole146Source']['path']
source146 = read(source146_path)
baseline_path = ROOT / index['currentReviewedE9Baseline']['path']
baseline = read(baseline_path)
nav_path = AUTHOR / 'whole-two-Q1-Q4-prerequisite-free-material-navigation.cluster.author-candidates.json'
nav = read(nav_path)
proposal_path = ROOT / handoff['explicitPureNavRegistrationViewProposal']['path']
input_paths = sorted(p for p in AUTHOR.iterdir() if p.is_file()) + [source146_path, baseline_path, ROOT / 'AGENTS.md', ROOT / 'docs/landscape-runtime.schema.json', ROOT / 'app/scripts/goalBookModel.ts']
input_paths += sorted({ROOT / r['nativePositiveSourcePath'] for r in intake['allWholeFrozenGoalAndPositiveInputRows']})
input_paths = list(dict.fromkeys(input_paths))
before = {str(p.relative_to(ROOT)): ref(p) for p in input_paths}
for field in ['wholeFiveDRAFTMaterialGoals', 'wholeFiveReviewIndex', 'explicitPureNavRegistrationViewProposal']:
    item = handoff[field]
    assert sha(ROOT / item['path']) == item['sha256']
for item in handoff['actualOriginal21FrozenFilesWholeExact']:
    assert sha(ROOT / item['path']) == item['sha256']
for item in [intake['actualOriginalWhole146Source'], index['currentReviewedE9Baseline'], index['frozenWholeCurrent15AndP30']]:
    assert sha(ROOT / item['path']) == item['sha256']

current = {g['id']: g for g in baseline['goals']}
historical = {r['goalId']: r for r in source146['all146WholeGoalPositiveRecordAndCaseIndexes']}
rows = intake['allWholeFrozenGoalAndPositiveInputRows']
assert len(materials) == 5 and len(rows) == 15 and len({r['goalId'] for r in rows}) == 15
frozen_contracts = []
for row in rows:
    assert current[row['goalId']] == row['wholeCurrentCanonicalGoal']
    old = historical[row['goalId']]
    assert old['wholeCurrentCanonicalGoal'] == row['wholeCurrentCanonicalGoal']
    assert old['nativePositiveRecord'] == row['nativePositiveRecord']
    actual_lines = (ROOT / row['nativePositiveSourcePath']).read_bytes().splitlines()
    actual_raw = actual_lines[row['actualOneBasedSourceLine'] - 1]
    assert hashlib.sha256(actual_raw).hexdigest() == row['wholeRawRecordLineSHA256']
    assert json.loads(actual_raw) == row['nativePositiveRecord']
    positive = row['nativePositiveRecord']
    assert positive['evidenceLevel'] == 'E1' and positive['maximumClaimScope'] == 'G1'
    assert positive['status'] == 'needs_human_review' and positive['reviewAuthority'] == 'ai_candidate'
    assert len(positive['profile']['applicationCaseBriefs']) == 2
    assert [c['wholeCase'] for c in row['actualApplicationCaseIndexes']] == positive['profile']['applicationCaseBriefs']
    frozen_contracts.append({'goalId': row['goalId'], 'wholeCurrentGoalEqualE9CAN416': True, 'wholeGoalAndWholePositiveRecordEqualOriginal146': True, 'wholePositiveRawSourceLineExact': True, 'retainedCaseCount': 2, 'currentSourceRecordLineSha256': row['wholeRawRecordLineSHA256'], 'historicalPContentReReviewed': False})

checks = []


def check(name, actual, expected, explanation):
    assert actual == expected, (name, actual, expected)
    checks.append({'name': name, 'actual': str(actual), 'expected': str(expected), 'independentMeaning': explanation, 'passed': True})


check('policy-index-change-percent', (D(104)-D(100))/D(100)*100, D(4), 'Index points become a percent only using the base100; this proves no policy effect.')
check('dated-ECB-predecessor-rate', D('2.50')-D('.25'), D('2.25'), 'The10September2026 increase is25basis points; not today’s rate claim.')
check('dated-ECB-basis-points', D('.25')*100, D(25), 'Percentage points and relative percentages differ.')
check('D1-minutes-saved', D(10)-D(6), D(4), 'Actual supplied fictional waiting-time reduction.')
check('D1-time-reduction-percent', (D(10)-D(6))/D(10)*100, D(40), 'Efficiency gain does not remove wrong information or cost/affected-group uncertainty.')
check('D1-error-percent', D(8)/100*100, D(8), 'Supplied error share is fictional, not official AI performance.')
check('B1-bus-oneoff', D(20000)+5000, D(25000), 'Recurring4000 is a separate unresolved budget, not silently counted as funded.')
check('B1-repair-oneoff', D(12000)+6000+3000, D(21000), 'Recurring2000 remains separate.')
check('B1-oneoff-cost-difference', D(25000)-21000, D(4000), 'A cheaper option alone does not settle access/priorities.')
check('B1-bus-unused-oneoff', D(30000)-25000, D(5000), 'One-off remaining budget is not a guarantee of permanent funding.')
check('B1-repair-unused-oneoff', D(30000)-21000, D(9000), 'Resource comparison retains all given cost components.')
check('B2-A-acquisition-per-assumed-year', D(400)/4, D(100), 'Only acquisition divided by model life; no total ownership or environmental claim.')
check('B2-B-acquisition-per-assumed-year', D(320)/2, D(160), 'New information can reverse apparent cheapest-price choice.')
check('B2-per-year-difference', D(160)-100, D(60), 'Repair costs, actual life and environmental impacts remain unknown.')
check('Gini-scale-harmonisation', D(30)/100, D('.30'), 'Harmonising scale cannot harmonise2023/2025 or income/consumption.')
check('illustrative-HDI-gap', D('.80')-D('.70'), D('.10'), 'An aggregate gap is not every person’s welfare gap.')
check('illustrative-Gini-gap', D('.45')-D('.25'), D('.20'), 'Higher aggregate development can coexist with higher inequality.')
check('model-poverty-shortfall', D(150)-100, D(50), 'Equal low income can be below an explicitly fictional poverty line.')
check('L1-1200-above-threshold', 1200 >= 1000, True, 'Given standalone domestic connection qualifies; no group/temp-worker inference needed.')
check('L1-200-below-threshold', 200 >= 1000, False, 'This alone erases neither responsibility nor other possible duties.')
check('ESG-A-weights', D('.8')+D('.1')+D('.1'), D(1), 'Own model weights form a complete weighted mean.')
check('ESG-B-weights', D('.2')+D('.4')+D('.4'), D(1), 'Different methodology remains visible.')
check('ESG-A-score', D('.8')*80+D('.1')*40+D('.1')*60, D(74), 'Score is a rating under own2024 model, not causal impact.')
check('ESG-B-score', D('.2')*60+D('.4')*80+D('.4')*50, D(64), 'Own2025 model score is not directly comparable without method/year scrutiny.')
check('ESG-score-gap', D(74)-64, D(10), 'A ten-point difference proves no uniform superiority or guaranteed return.')
check('housing-activity-ratio', D(80)/100*100, D(80), '80% rented is an activity proportion, not verified affordability/additionality.')
check('K2-A-false-rejection-percent', D(20)/100*100, D(20), 'Population is qualified applicants, not all applicants.')
check('K2-B-false-rejection-percent', D(5)/100*100, D(5), 'Same supplied group denominator permits the stated comparison.')
check('K2-group-gap-percentage-points', D(20)-5, D(15), 'Fifteen percentage points is not an average fairness guarantee.')
check('K2-qualified-admitted', 200-20-5, 175, 'Only true admissions within this qualified sample.')
check('K2-qualified-correct-admissions-percent', D(175)/200*100, D('87.5'), 'This is not overall classifier accuracy; unqualified false positives are not supplied.')
check('K1-fee-share-budget100', D(5)/100*100, D(5), 'Solution’s explicit illustrative budget; task does not require an unprovided real budget.')
check('K1-fee-share-budget500', D(5)/500*100, D(1), 'Same fee can have unequal access burden.')
check('global-A-monthly-finance-gap', D(120)-100, D(20), 'A funding need, not automatic IMF approval.')
check('global-A-reserve-months', D(10)/20, D('.5'), 'Reserves cover only half a model month of net need.')
check('global-B-monthly-finance-gap', D(120)-80, D(40), 'Changed crisis context changes the need.')
check('global-B-reserve-months', D(20)/40, D('.5'), 'Same reserve duration with different gross figures.')
check('global-water-finance', D(16)+8, D(24), 'Proposed development contribution still requires assessment.')
check('global-NDC-finance', D(32)+8, D(40), 'Funding equality uses explicitly given commitments, not universal finance entitlement.')
check('global-model-emissions-reduction-percent', (D(100)-70)/100*100, D(30), 'Target reduction is conditional on actual implementation.')
check('global-levy-lowbudget-percent', D(20)/100*100, D(20), 'Given disposable model budget.')
check('global-levy-highbudget-percent', D(20)/1000*100, D(2), 'Same monetary burden differs by income share.')
check('global-B-project-sum', D(12)+8, D(20), 'Both unchanged exceed the18 budget.')
check('global-B-budget-shortfall', D(20)-18, D(2), 'Funding/prioritisation must account for the shortfall.')
check('G1-complete-outage-stock-months', D(200)/100, D(2), 'Exactly the solution’s expressly conditional complete-outage calculation.')
check('G1-complete-outage-replacement-gap', D(6)-2, D(4), 'Not a claim of the uniquely determined actual partial-flow shortage.')
check('G1-before-receipts', D(30)*10, D(300), 'Prices stipulated unchanged in this partial model.')
check('G1-after-receipts', D(15)*10, D(150), 'Lost receipts are borne by X exporters.')
check('G1-receipts-loss', D(300)-150, D(150), 'Lost receipts alone do not prove political success.')
check('G1-own-boundary-if-other-supply-70-maintained', D(200)/(100-70-15), D(200)/15, 'Independent conditional counterexample: if previously other70 remains, stock lasts13.33months; those other flows are not supplied, so the actual gap is underdetermined.')
check('G1-own-boundary-if-no-other-flow', D(200)/(100-15), D(40)/17, 'Independent conditional counterexample:15 continuing imports gives2.35months; no fixed actual4month gap follows.')

g1 = {('K','K'):(3,3), ('K','D'):(0,5), ('D','K'):(5,0), ('D','D'):(1,1)}
g2 = {('A','A'):(4,3), ('A','B'):(0,0), ('B','A'):(0,0), ('B','B'):(3,4)}


def equilibria(game, strategies):
    return sorted([list(pair) for pair, pay in game.items() if all(game[(a,pair[1])][0] <= pay[0] for a in strategies) and all(game[(pair[0],b)][1] <= pay[1] for b in strategies)])


check('G1-own-enumerated-pure-NE', equilibria(g1, ['K','D']), [['D','D']], 'All unilateral deviations independently enumerated for both players.')
check('G2-own-enumerated-pure-NE', equilibria(g2, ['A','B']), [['A','A'],['B','B']], 'Distinct coordination incentives; not copied prisoner dilemma logic.')
for player in [0,1]:
    for other in ['K','D']:
        preferred = max(['K','D'], key=lambda own: g1[(own,other) if player == 0 else (other,own)][player])
        check('G1-player%d-response-to-%s' % (player,other), preferred, 'D', 'D strictly dominates in the one-shot supplied matrix.')
for player in [0,1]:
    for other in ['A','B']:
        preferred = max(['A','B'], key=lambda own: g2[(own,other) if player == 0 else (other,own)][player])
        check('G2-player%d-response-to-%s' % (player,other), preferred, other, 'Best response switches with the other choice; no universal dominant deviation.')
for raw in range(19):
    check('digital-plan-only-raw%d-capped-below-pass' % raw, min(raw,14) < 15, True, 'Task3 execution earns0 for a plan; even18 fully correct other-task points cannot pass after the binding total cap.')
check('digital-imperfect-observed-partial-not-full-quota', 13+2 >= 15, True, 'A hypothetical observed but imperfect execution can contribute partial marks; all6 execution points or political agreement are not a gate. This arithmetic is no learner evidence.')

numeric_path = write('actual-independent-numeric-game-and-all-plan-only-rubric-boundaries.json', {'schemaVersion':1, 'reviewer':IDENTITY, 'checks':checks, 'allPassed':True, 'wholeAnswersAreScoredIndependentlyBelowNotByKeywords':True})

# These are original synthetic complete submissions written and manually judged
# by the independent reviewer. They are not genuine learner/teacher trials.
counteranswers = [
    {'materialId':'475408f7-2f08-5d96-bf1a-684f3ddf744a','id':'consent-substituted-and-private-organ-claim','wholeAnswerDe':'Z: Die Regierung initiiert, der Bundestag stimmt zu und ersetzt mit seiner Mehrheit die verweigerte Zustimmung des Bundesrats; danach kann der Präsident ausfertigen. Z2 geht ebenfalls weiter, denn dort wurde der Einspruch nach der gegebenen Mehrheit überwunden. K: Die Person kann sofort wegen ihrer eigenen Grundrechte zum Verfassungsgericht gehen; die Fachgerichte brauche sie nicht. Die Landesregierung kann abstrakte Normenkontrolle beantragen. O: Ein Bürger sollte privat die Ministerin verklagen; der Ausschuss selbst hat keine Verfahrensstellung. Das Bundesverfassungsgericht kann das gewünschte Gesetz direkt politisch beschließen und muss Beschwerden immer stattgeben.','componentPoints':[1,1,0],'componentReasonsDe':['Z2 ist richtig, aber die im Fall ausdrücklich erforderliche Zustimmung wird unzulässig ersetzt und die Z-Rollenfolge deshalb nur teilweise geleistet.','Nur die Landesregierungsbefugnis stimmt; die ausdrücklich fehlende Rechtswegerschöpfung wird verkannt.','Ausschussrecht, Organstreit und begrenzte Gerichtsfunktion fehlen bzw. werden falsch behauptet.'],'passingPoints':4},
    {'materialId':'475408f7-2f08-5d96-bf1a-684f3ddf744a','id':'correct-legislation-with-wrong-access','wholeAnswerDe':'Z wird derzeit durch fehlende erforderliche Bundesratszustimmung gesperrt. Regierung bringt den Entwurf ein, Bundestag beschließt, Bundesrat muss zustimmen; erst nach gültigem Zustandekommen folgen Gegenzeichnung, Ausfertigung und Verkündung. In Z2 ersetzt die vorgegebene rechtmäßige Einspruchsüberstimmung keine Zustimmung, sondern genügt gerade beim nicht zustimmungsbedürftigen Gesetz. K: Jeder unzufriedene Bürger könne abstrakte Normenkontrolle verlangen, die Landesregierung hingegen nicht; verfügbare Fachgerichte seien unerheblich. O: Der Ausschuss kann sich auf das eigene Anwesenheitsrecht aus Art.43 berufen. Dennoch sei die Sache nur eine Berufung gegen Tatsachenfeststellungen und das Gericht entscheide frei die beste Regierungszusammensetzung.','componentPoints':[2,0,1],'componentReasonsDe':['Z/Z2 und die gegebene Verfahrensfolge sind sachgerecht vollständig unterschieden.','Beide unterschiedlichen K-Zugänge und das Hindernis sind verkehrt.','Eigenes Ausschussrecht stimmt; Organstreitzuordnung und Kontrollgrenze werden dagegen verfehlt.'],'passingPoints':4},
    {'materialId':'05bc19fe-669b-5c47-b718-802a9db9e096','id':'all-state-actions-one-school-and-energy-guarantee','wholeAnswerDe':'1: A,B,C,D sind alle keynesianisch, weil der Staat handelt. Infrastruktur hat nur eine kurzfristige Wirkung und Wettbewerbsschutz braucht keine Begründung. 2: In H senkte die Geld- und Kreditkontraktion zusammen mit Deflation die Ausgaben; nominale Schulden wurden real schwerer, Arbeitslosigkeit konnte steigen. Bei freien Kapazitäten kann begrenzte Nachfragehilfe gerechtfertigt sein, mehrere Ursachen bleiben. In C schaffen höhere Zinsen sofort mehr Gas und garantieren weniger Inflation, ohne Ausgaben zu belasten. R und S brauchen dieselben Aufträge; die Ankündigung beweist bereits ihren Erfolg. 3: P bringt überprüfbare Kostenkritik vor und akzeptiert andere Mehrheiten. Q sollte dennoch recht haben, weil nur ein wahres Volk legitim ist. Offene Informationen sind nutzlos; jede Kritik zu verbieten ist die rechtsstaatliche Antwort. Eine Grenze braucht das Verbot nicht.','componentPoints':[0,2,1],'componentReasonsDe':['Keine wirkungsbezogene Zuordnung, kein Vergleich der drei Leitbilder oder doppelte D-Zeitwirkung.','Historische Diagnose und bedingte Reaktion tragen2; C-Gegenpositionen und R/S-/Wirkungsgrenze sind ausdrücklich falsch.','P ist teilweise richtig erkannt; Q-Kontrollverlust, beide Reaktionen und rechtsgebundene eigene Alternative fehlen.'],'passingPoints':11},
    {'materialId':'05bc19fe-669b-5c47-b718-802a9db9e096','id':'policy-mechanisms-with-false-history-and-pluralism','wholeAnswerDe':'1: A schützt die Wettbewerbsordnung durch durchsetzbare Regeln, B stabilisiert bei freien Kapazitäten kurzfristig Nachfrage. Ordoliberalismus begründet Wettbewerbsschutz, liberale Regeln vermeiden Einzelbegünstigung, Keynesianismus begründet zeitlich begrenzte Nachfragehilfe; C passt zu allgemeinen Regeln. D verbindet heutige Bauaufträge mit späterer Produktivität. In S kann mehr Nachfrage bei unverändertem Energieengpass Preise erhöhen, daher Kosten, Zeit und Beschäftigung abwägen. 2: Die Depression entstand allein durch zu viel Geld und Deflation erleichterte jeden nominalen Schuldendienst. Zu C kann Preisstabilität für die Zinsanhebung sprechen; höhere Kreditkosten können zugleich Nachfrage und Aktivität schwächen, Zinsen erzeugen keine Energie. Gleichwohl seien R/S gleich und0,25Prozentpunkte eine relative Erhöhung um0,25%; Ankündigung sei Wirkung. 3: Jede Kritik wie P ist Populismus. Qs Verbot legitimer Opposition und unabhängiger Gerichte schafft dagegen demokratische Resilienz; mein Vorschlag ist sofortige Kritikzensur ohne Rechtsgrenzen.','componentPoints':[6,2,0],'componentReasonsDe':['Alle drei Wirkungs-/Leitbildkomponenten sind am Material begründet.','Nur die gegenläufigen C-Positionen sind richtig; historischer Schuld-/Geldmechanismus und Fall-/Evidenzgrenzen sind falsch.','Kritik und exklusiver Vertretungsanspruch werden vertauscht; beide Resilienzstrategien und die eigene Rechtsgrenze fehlen.'],'passingPoints':11},
    {'materialId':'9341cdc0-f45a-5e2b-ae90-55950bab91d9','id':'complete-other-performance-but-only-unexecuted-plan','wholeAnswerDe':'1: D1 spart4Minuten/40%, lässt8% falsche Antworten. Menschliche erreichbare Nachprüfung, Fehlerfolgen und Kosten/Gruppendaten müssen geprüft werden; der datierte AI-Rahmen ist keine Leistungsstatistik. D2 verdient an bezahlten Rängen, ohne Kennzeichnung ist die gegebene Modellregel verletzt. Kennzeichnung und Preissortierung verbessern Auswahl, ihre Verständlichkeit bleibt zu prüfen. 2: Bei hoher Nachfrage/niedriger Energie erweitert F1 stufenweise mit Personal/Finanzierung, bei schwacher Nachfrage/hoher Energie schützt es Liquidität und spart Energie. Qualifizierung kann beiden nutzen, bindet aber Geld/Zeit; stabile Aufträge mit Finanzierung signalisieren Anpassung. Für F2 mobile Weiterbildung mit geprüftem Zugang und passender Stellenentwicklung statt sicherer Prognose. 3: Ich habe nur einen schriftlichen Gesprächsplan: B1Bus25000 versus Treff21000 einmalig, laufende Budgets ungeklärt, Bedarf/Nutzungszeiten besprechen. Eine Gegenrede würde ich beantworten. B2 würde ich nach neuen Informationen400/4=100 und320/2=160 vergleichen und tatsächliche Lebensdauer/Reparaturkosten prüfen. Es gab keine Gesprächsrunde und keine beobachtbaren eigenen Antworten. 4: In G1 ist D gegen K mit5>3 und gegen D mit1>0 beste Antwort beider; D/D ist das reine Gleichgewicht, K/K gemeinsam besser. Wiederholung kann bei wichtiger Zukunft und glaubwürdig beobachtbaren Konsequenzen helfen; Endhorizont, Kosten/Fehlbeobachtung begrenzen, kein Diskontsatz gegeben. In G2 sind A/A und B/B reine Gleichgewichte, Antworten passen sich an die andere Wahl an; transparente Vereinbarung/Wechsel koordiniert und es gibt keine dominante D-Strategie.','taskPoints':[6,6,0,6],'componentReasonsDe':['D1/D2 und Primäranker/Modellgrenzen vollständig begründet.','Beide F1-Szenarien und F2-Transfer samt Grenze sind richtig.','Die schriftliche Vorbereitung ist keine tatsächliche geschützte Beteiligung; alle Ausführungseinheiten erhalten0 und der verbindliche Gesamtcap greift.','G1/G2 und Wiederholungsbedingungen vollständig getrennt.'],'mandatoryExecutionObserved':False,'rawPoints':18,'cap':14,'effectivePoints':14,'passingPoints':15},
    {'materialId':'9341cdc0-f45a-5e2b-ae90-55950bab91d9','id':'synthetic-observed-but-imperfect-execution-does-not-save-other-errors','wholeAnswerDe':'1: Vier gesparte Minuten machen D1 automatisch fehlerfrei und voll rechtskonform. D2 darf Werbung verstecken, denn der erste Rang ist immer der billigste; Daten fehlen nicht. 2: A tritt sicher ein; sofortige Großinvestition garantiert Gewinn, Weiterbildung braucht keine Ressourcen. F2 ist sicher gleich für jede Person, daher keine Anpassung. 3: Im ausdrücklich synthetischen Prüfdialog sagt die beitragende Person in B1: Der Bus kostet einmalig25000, der Treff21000; laufende Finanzierung und Zugang müssen wir prüfen. Der Partner fragt: Der Bus erreicht mehr Menschen ohne Auto? Antwort: Du musst meinem Vorschlag zustimmen, Gegenargumente stören. In B2 antwortet sie auf die neue Information: A400/4=100, B320/2=160 pro angenommenem Jahr; deshalb ist A umweltfreundlich garantiert, tatsächliche Lebensdauer brauche ich nicht zu prüfen. 4: In G1 ist K für beide dominant, weil Kooperation nett ist; Wiederholung garantiert unabhängig von Beobachtung den gleichen Erfolg. In G2 passen A gegen A und B gegen B, also A/A und B/B als reine Gleichgewichte; eine transparente Vereinbarung kann koordinieren und das ist anders als eine dominante Abweichung.','taskPoints':[0,0,3,2],'componentReasonsDe':['Mechanismen, Modellregeln, fehlende Information und fachliche Grenzen werden verwechselt; Zahlenwort allein verdient keine Analysepunkte.','Sichere Prognosen ersetzen die bedingten Szenarien und Ressourcenabwägung.','Für diesen rein synthetischen Bewertungsfall wird ein beobachtbarer Dialog angenommen:2 für faktengebundenen B1-Beitrag,0 für respektvolle Gegenrede,1 für den tatsächlichen B2-Update mit fehlender Umwelt-/Evidenzgrenze. Dies ist kein echter Lernendennachweis.','Nur die getrennte G2-Analyse trägt2; G1-Anreize und Wiederholungsbedingungen sind falsch.'],'mandatoryExecutionObserved':True,'rawPoints':5,'cap':None,'effectivePoints':5,'passingPoints':15},
    {'materialId':'40cb7a96-ca10-50a4-9b42-d48933744e46','id':'arithmetic-with-unproven-fairness-impact-and-liability','wholeAnswerDe':'1: Höherer HDI macht jede Person gerechter und reicher;30 und0,35 kann man ohne Jahr oder Grundlage vergleichen. Gleiche100 bedeuten keine Armut unter150. 2: Der1200er erfüllt die gegebene inländische1000-Schwelle, der200er nicht; auch er kann Verantwortung/andere Pflichten haben. Kodex ersetzt angemessene Analyse, Prävention/Beschwerde nicht; Einfluss und Schwere zählen. L2 müsse trotzdem sofort gekündigt werden, auch bei möglichem wirksamem Plan. L2b dürfe selbst bei allen ausdrücklich erfüllten Bedingungen nie abgebrochen werden. Jeder LkSG-Verstoß schafft automatisch neue Haftung. 3: A ergibt74,B64, die Gewichte summieren sich zu1 und Datenjahre/Methoden unterscheiden sich. Trotzdem beweist der Sekundärkauf zusätzliche Emissionsminderung und garantiert Gewinn.100Gebäude/80Vermietungen beweisen für alle günstigen Zugang, Zusatzdaten unnötig. 4:20%gegen5% Fehlablehnung sind15Prozentpunkte und175/200=87,5% Zulassungen der geeigneten Stichprobe; nicht alle Bewerber sind beobachtet. Ein Durchschnitt und menschliche Unterschrift reichen trotzdem als faire Kontrolle. Standortdaten und schwierige Ablehnung sind durch einen Klick immer ethisch unproblematisch.','taskPoints':[0,2,2,2],'componentReasonsDe':['Alle drei Indikator-Komponenten werden verkannt.','L1 mit Angemessenheit trägt2; L2-Abhilfe, L2b-kumulative Grenze und Haftungsgrenze sind falsch.','Nur E1-Modellrechnung/Methodik trägt2; Zusätzlichkeit, Bezahlbarkeit und Risiko-/Renditegrenzen fehlen.','Nur Gruppen-/Stichprobendeutung erhält begründete Teilpunkte; tatsächliche Kontrollmöglichkeit und K1-Abwägung/Alternative werden ausdrücklich verkannt.'],'passingPoints':15},
    {'materialId':'40cb7a96-ca10-50a4-9b42-d48933744e46','id':'indicator-strength-does-not-substitute-diligence-and-ethics','wholeAnswerDe':'1: A verbindet höheren durchschnittlichen HDI mit höherer Einkommensungleichheit, also kein Widerspruch und kein Every-person-Gerechtigkeitsbeweis. C30/100=0,30 und D0,35 bleiben wegen2023/2025 und Einkommen/Konsum eingeschränkt vergleichbar. Gleiche100 unter Modellgrenze150 können Armut bei Gleichheit bedeuten; nötig sind Dimensionen, Armut und Bildungs-/Gesundheitsverteilung. 2: Jeder Betrieb ab einer Person falle unter LkSG, der Kodex allein erfülle alle Sorgfalt und erfolgreiche Lieferungen seien garantiert. Weder L2 noch L2b brauche einen Plan, kumulative Bedingungen oder Haftungsabgrenzung. 3: A74,B64 sind Modellratings mit verschiedenen Gewichten und Jahren, kein allgemeines Ranking. Trotzdem beweist der Sekundärkauf allein zusätzliche Emissionsminderung. Bei E2 sind100Bauten/80Vermietungen nur Aktivitäten; Zielgruppenmieten/Einkommen, Verdrängung und ohnehin geplante Finanzierung fehlen. Absicht/Output/Zusätzlichkeit unterscheiden sich; hohe Ratings geben keine Renditegarantie. 4: Wer klickt hat jede Kontrolle freiwillig aufgegeben; das werbefreie Angebot löst alle Zugangskonflikte ohne Kosten.87,5% im qualifizierten Sample beweist allgemeine Genauigkeit/Fairness. Unterschrift ohne Änderungsmöglichkeit ist vollständige wirksame Aufsicht.','taskPoints':[6,0,4,0],'componentReasonsDe':['Beide Indikatorfälle und Armuts-/Vergleichsgrenzen werden vollständig geleistet.','Anwendbarkeit, Pflicht/Freiwilligkeit, Abhilfe, kumulative Grenze und Haftung fehlen bzw. sind falsch.','E1-Rechnung/Methodik und E2-Nachweis-/Risikogrenze tragen4; die ausdrücklich falsche Sekundärkauf-Zusätzlichkeit kostet die entsprechende Einheit.','Keine tragfähige Mehrkriterienabwägung oder tatsächliche Kontrolle; Sample wird unzulässig verallgemeinert.'],'passingPoints':15},
    {'materialId':'69e66ab4-481e-5a8c-9ddc-ef4ad5c5062a','id':'institution-confusion-with-correct-emissions-and-wrong-power-guarantee','wholeAnswerDe':'1: WTO vergibt private Allzweckkredite, IWF entscheidet Handelsrechtsklagen, Weltbank schreibt alle nationalen Gesetze, UN bewilligt jede Finanzierung automatisch. A/B unterscheiden sich deshalb nicht. 2: In A werden modellhaft30% Emissionen vermieden;32+8 finanzieren40 unter den Zusagen. Paris koordiniert NDCs/Transparenz ohne Ergebnisgarantie, SDGs Armut/saubere Energie verlangen überprüften Zugang.20/100=20%,20/1000=2% sprechen für gezielte Entlastung. B sei dagegen mit18 für12+8 vollständig finanziert;5Schadensvermeidung sei bewiesener Kapitalwert. Paris verlange überall automatisch dieselbe Steuer. 3: X verliert Erlöse von300 auf150, also150. Doch Y habe in der tatsächlichen Teillieferung immer genau4Monate Versorgungslücke und müsse politisch zustimmen; eigene Verluste/Alternativen seien irrelevant. G2 muss allein wegen ausländischer Herkunft verboten werden, Kapital und Kontrollauflagen brauchen keine Abwägung.','taskPoints':[0,4,1],'componentReasonsDe':['Alle vier Mandate, beide Kontexte und die Schnittstelle sind falsch.','A-Emissions-/Finanzierungslogik und Verteilung/Zugang tragen4; B-Budget-/Wirkungstransfer ist falsch.','Die Erlösrechnung trägt einen begründeten Teilpunkt; bedingte Vorratsgrenze, offener politischer Erfolg und G2-Kontrollabwägung fehlen.'],'passingPoints':11},
    {'materialId':'69e66ab4-481e-5a8c-9ddc-ef4ad5c5062a','id':'mandates-right-but-targets-as-automatic-outcomes','wholeAnswerDe':'1: In A passt WTO zu Importregeln, IWF zum geprüften Nettofinanzierungsbedarf20 mit10Reserven für0,5Monat, Weltbank zu24Wasserinvestition aus16+geprüften8, UN zu Armuts-/Energiepartnerschaften. In B passen die jeweiligen Handelsregeln,40Nettofinanzierungsbedarf bei20Reserven, Wiederaufbau und humanitäre Entwicklungskooperation. Mandate/Bedingungen und nationale Umsetzung bleiben getrennt; gemeinsame Abstimmung kann Finanzierung/Entwicklungsziele verbinden, kein Antrag ist durch Rechnung genehmigt. 2: SDG-Nennung und NDC-Absicht beweisen bereits Wirkung. Paris erzwinge eine identische Weltsteuer,20Euro seien für100und1000Budget prozentual gleich. In B fehlen bei20Kosten und18Budget zwar2; fünf eingesparte Schäden allein bewiesen aber ohne Zeithorizont den Kapitalwert und jede Zielgruppe werde sicher erreicht. 3: X verliert300−150=150 Erlöse. Die konkrete Teilkürzung erzwinge trotzdem immer die Viermonatslücke und politische Zustimmung; Vorräte/Alternativen änderten daran nichts. G2 wird wegen ausländischen Geldes automatisch genehmigt, Daten-/Betriebskontrolle und Auflagendurchsetzung sind unerheblich.','taskPoints':[6,1,1],'componentReasonsDe':['Alle vier A/B-Mandate, Datenkontext, Grenzen und sinnvolle Schnittstelle sind erfüllt.','Nur der B-Budgetfehler wird rechnerisch erkannt; NDC/SDG-Wirkung, Verteilung und Kapitalwert-/Zugangsgrenzen werden verfehlt.','Nur Erlösdeutung erhält Teilpunkt; Machtkanal, alternative Versorgung und G2-Risikoabwägung sind falsch.'],'passingPoints':11}
]
for answer in counteranswers:
    earned = sum(answer.get('taskPoints', answer.get('componentPoints', [])))
    if 'rawPoints' in answer:
        assert earned == answer['rawPoints']
    answer.setdefault('rawPoints', earned)
    answer.setdefault('effectivePoints', earned)
    assert answer['effectivePoints'] < answer['passingPoints']
    answer.update({'judgment':'BELOW_PASS', 'syntheticNotRealLearnerEvidence':True, 'manualWholeSubstantiveJudgment':True, 'keywordScoringUsed':False})
assert len(counteranswers) == 10 and all(sum(c['materialId']==m['id'] for c in counteranswers)==2 for m in materials)
counter_path = write('actual-independent-ten-whole-counteranswers-with-individual-rubric-judgments.json', {'schemaVersion':1, 'reviewer':IDENTITY, 'counteranswers':counteranswers, 'noActualLearnerSessionOrPrivateData':True, 'automatedScoringParityClaimed':False, 'scope':'Independent explicit manual rubric decisions, not runtime grader acceptance or human trial.'})

primary = []


def source(url, scope, observation, raw_sha=None, fallback=False):
    row = {'url':url, 'readOn':'2026-10-09', 'actualIndependentReadScope':scope, 'ownScientificObservation':observation, 'fullLawTreatyLinkedPdfApproval':False, 'thirdPartyFullTextCopiedIntoThisReview':False}
    if raw_sha:
        row.update({'actualOwnHTTP200RawSha256':raw_sha, 'declaredDecode':'ISO-8859-1', 'rawBytesKeptOutsideCurricula':'/tmp/skillpilot-q1q4-independent-primary-cache', 'precedingBrowserTimeoutNotCountedAsRead':fallback})
    primary.append(row)


for page,scope,obs in [
    ('gg/art_94.html','Entire current single provision, web parsed lines0–59.','Current jurisdiction is Art94; differentiated organ dispute, abstract-review applicants, individual complaint and binding effect are correctly bounded.'),
    ('gg/art_77.html','Entire current single provision, lines0–22.','Mandatory consent and objection are different; majority overrides apply only to the latter. Mediation remains part of the full law; the dossier judges the stated present obstacle without claiming every procedural branch.'),
    ('gg/art_78.html','Entire current single provision, lines0–17.','Valid enactment conditions support the narrowly stipulated Z/Z2 contrast.'),
    ('gg/art_82.html','Entire current single provision, lines0–21.','Counter-signature, presidential execution and promulgation follow constitutional enactment; subsequent entry into force is not equated with passage.'),
    ('gg/art_76.html','Entire current single provision, lines0–21.','Initiative government/from Bundestag/Bundesrat; original government routing includes prior Bundesrat comment. Card is a compact own role summary, not an exhaustive sequence or memory demand.'),
    ('gg/art_43.html','Entire current single provision, lines0–19.','Committee’s own attendance right is real, unlike a citizen’s constitutional complaint in O.'),
    ('bverfgg/__63.html','Entire current single provision, lines0–17.','Eligible constitutional bodies/parts equipped with own rights support the organ-dispute case without determining its merits.'),
    ('stabg/__1.html','Entire current single provision, lines0–16.','Simultaneous economic objectives; the provision itself assigns no school or guaranteed policy outcome.'),
    ('gg/art_5.html','Entire current single provision, lines0–20.','Expression/information protections and prescribed limits; blanket suppression of criticism is not the stated constitutional response.'),
    ('lksg/__1.html','Entire current single provision, lines0–39.','Domestic connection and1000 threshold from2024; supplied standalone cases avoid unsolved temporary/group-worker facts.'),
    ('lksg/__3.html','Entire current single provision, lines0–77.','Proportionate diligence measures and determinants; no new civil liability from this act’s duty breach, independent liability remains.'),
    ('lksg/__7.html','Entire current single provision, lines0–47.','Prompt remedies, implemented time-bound direct-supplier concept, cumulative termination conditions and effectiveness checks; no general instant-cancellation duty.')
]:
    source('https://www.gesetze-im-internet.de/'+page,scope,obs)
source('https://www.gesetze-im-internet.de/bverfgg/__90.html','Own HTTP200 page fully decoded and entire §§90(1)–(3) read after browser timeout.','Own protected-rights assertion and exhausted available remedy; given absence of statutory exceptions in K is faithfully used.','e12acdaf21f4d5f5027afd76be92d52d875281979217a3a10d5f1d8e6c615236',True)
source('https://www.gesetze-im-internet.de/gg/art_20.html','Own HTTP200 page fully decoded and entire Article20(1)–(4) read after browser timeout.','Democratic/social federal state, organised popular authority, constitutional/legal binding; no political agreement quota.','ce7f68c8120563a642a3423e760da4ac7837ea9855ed462d7e67afc90d00eb92',True)
source('https://www.federalreservehistory.org/essays/great-depression','Actual entire substantive article lines29–73 plus dated attribution39/102 and bibliography/endnote context through102 read.','Own historical summary is multicausal; credit/money contraction and deflation worsen real nominal-debt burden. No copied quote or all-New-Deal school attribution.')
source('https://www.ecb.europa.eu/press/pr/date/2026/html/ecb.mp260910~314e508016.en.html','Entire substantive decision body lines35–56 actually read; dated10September2026.','25basis-point increase, deposit2.50% from16September,2% medium-term target and energy/uncertainty context support dated case only.')
source('https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai','Actual bounded current body lines3–83 read, including all displayed risk, transparency, human oversight and GPAI passages in that slice.','Overview anchors risk/transparency/oversight; fictional repair-service rules are separately stipulated, ethics is not full legal compliance. Later application dates and every act article are not approved.')
source('https://hdr.undp.org/data-center/human-development-index','Actual whole57 parsed lines read; substantive HDI definition/dimensions/limits40–46.','Three average dimensions and incomplete coverage of inequality/poverty support the critical indicator comparison.')
source('https://databank.worldbank.org/metadataglossary/world-development-indicators/series/SI.POV.GINI','Actual whole96 parsed lines read, substantive metadata57–82.','Scale conventions, income/consumption, survey years and non-comparability limits support conversion while preserving limits.')
source('https://thegiin.org/impact-investing/need-to-know/','Redirected official GIIN page actual whole247 parsed lines returned and read, especially definition90–99, elements100–133 and qualified financial expectations174–184.','Intentionality, evidence and managed measured effects support scrutiny; promotional/survey statements are not proof of the fictional fund’s outcomes or guaranteed returns.')
source('https://www.imf.org/en/About','Actual whole86 parsed lines read across both opens, substantive mandate/functions/governance/finance14–60.','Member-governed surveillance/advice, support and capacity development; no automatic private loan or approval after arithmetic.')
source('https://www.worldbank.org/en/what-we-do','Actual bounded redirected page0–235 read across two opens; relevant overview2, projects26–41, results62–64 and services107–143.','Finance, knowledge, technical assistance and implementation with countries fit development; linked reports/projects were not opened or approved.')
source('https://policy.trade.ec.europa.eu/eu-trade-relationships-country-and-region/eu-and-wto_en','Actual substantive bounded slice33–114 read across two opens.','Negotiation, monitoring, disputes, members and stated restoration/reform limits; no assumed universal functioning appeal body. Linked WTO documents not approved.')
source('https://sdgs.un.org/goals','Actual bounded page0–97 read across opens; all17goal titles, history, UN cooperation and monitoring.','Shared economic/social/ecological goals and partnerships remain distinct from national implementation or other institutions’ mandates; no full treaty or linked progress-report reading.')
source('https://unfccc.int/process-and-meetings/the-paris-agreement','Actual entire substantive current overview lines10–59 read across both opens.','Binding treaty, NDCs, mitigation/adaptation/finance and transparency; no uniform global tax or guaranteed target outcome; linked full treaty not read.')
source('https://policy.trade.ec.europa.eu/enforcement-and-protection/investment-screening_en','Actual bounded body33–110 read across opens.','Risk identification and cooperation support supplied analytical case. Page43 versus67 and residual provisional81 contradict one another on transition/adoption; no such date or blanket legal duty is taken into the material.')
assert len(primary) == 26
primary_path = write('actual-independent-primary-whole-provision-and-bounded-source-reading-receipt.json', {'schemaVersion':1,'reviewer':IDENTITY,'reads':primary,'honestFailuresAndFallbacks':['Browser timeout for §90 and Art20 was not approved; ownHTTP200 decoded current originals were then fully read.','First Python parse preflight lacked bs4 and exited before any claimed raw read; successful retry used the standard-library HTMLParser.'],'noFullOfficialPdfOrFullExtractNewlyCommitted':True,'noLater2026LegalOrRateClaimBeyondActualBoundedReads':True,'noCopiedThirdPartyQuotationInOwnReview':True})

performance_reasons = {
    '8f0fde77-85c4-5ad5-ba8b-da2efe297854':('475408f7-2f08-5d96-bf1a-684f3ddf744a',1,'Z/Z2 verlangt Rollenfolge und Zustimmung/Einspruch, K zwei getrennte Zugänge, O Organstreit und Kontrollgrenze. Diese einzige ausdrücklich bewertete Kompetenz trägt den ganzen direkten Material-requires; keine pauschalen Regierungs-, Partei- oder Phasencluster nötig.'),
    '72484041-560f-5ff2-a565-f2edf7464fec':('05bc19fe-669b-5c47-b718-802a9db9e096',1,'A–D Wirkungsmechanismen, drei Leitbilder und D-Zeithorizonte mit R/S-Abwägung prüfen genau die Zuordnungskompetenz. Als eigenständig bewertete Leistung bleibt sie direkt erforderlich, auch wenn455 dieses Ziel bereits voraussetzt; Mastery wird nie rückwärts erschlossen.'),
    '4552c393-5d49-53a7-ad03-fe80b8b63d2f':('05bc19fe-669b-5c47-b718-802a9db9e096',2,'Historische H- und datierte C-Anwendung, freie Kapazität versus Energieengpass und Wirkungsgrenzen prüfen die Fallkompetenz. Der direkte Bezug ist leistungsbedingt, kein zusätzlicher globaler Makro- oder Abiturblock.'),
    '9483b637-9f10-5a0f-bcf9-175ed814ce87':('05bc19fe-669b-5c47-b718-802a9db9e096',3,'P/Q begründet unterscheiden, offene Information versus pauschales Verbot beurteilen und rechtsgebundene Antwort mit Grenze formulieren prüfen Resilienz tatsächlich. Eine bestimmte Partei, Meinung oder Zustimmungsquote wird nicht gefordert.'),
    '7d399b4d-d057-5284-8e2c-6778e023307d':('9341cdc0-f45a-5e2b-ae90-55950bab91d9',1,'D1/D2 verbinden datierten realen Rechtsanker, wirtschaftliche Anreize, gegebene Regeln, Folgen und Informationsgrenzen. Damit ist diese aktuelle Analyse-/Bewertungsleistung direkt geprüft; reale Dienste oder vollständige Compliance werden nicht erfunden.'),
    '7727b988-e62c-5ebf-8e2f-0c719b13881c':('9341cdc0-f45a-5e2b-ae90-55950bab91d9',2,'Mindestens zwei F1-Annahmen-Handlungen mit Ressourcen und Signal plus eigenständiger F2-Transfer prüfen bedingte Szenarien und Gestaltung. Keine vorgegebene Wahrscheinlichkeit oder sichere Prognose ersetzt den Grund.'),
    'fd913fec-e64a-5a1a-88f6-724d788ed951':('9341cdc0-f45a-5e2b-ae90-55950bab91d9',3,'B1/B2 verlangt eigene tatsächlich beobachtbare geschützte Beiträge, Gegenargument/Antwort und Aktualisierung; alle Ausführungseinheiten bewerten Leistung statt Absicht. Plan-only bleibt0 dort und gesamthaft14<15. Die protected Simulation ist didaktisch passend ohne Außenkontakt, private Daten oder politische Meinungspflicht.'),
    '7d4d7a90-a1d0-5818-8d55-a0c3e995957b':('9341cdc0-f45a-5e2b-ae90-55950bab91d9',4,'G1 beste Antworten/individuelle Anreize/gemeinsames Ergebnis, bedingte Wiederholung und eigenständiges G2-Koordinationsurteil prüfen eigene/kollektive Strategien. Der direkte Bezug ist erforderlich; kein ersatzweiser moralischer Kooperationsappell.'),
    'fed15db6-e700-514d-a65e-6c2a34f1c81a':('40cb7a96-ca10-50a4-9b42-d48933744e46',1,'A/B sowie C/D und gleiche arme Gruppe prüfen Messgegenstand, Skala, Jahr/Erhebung und Urteilgrenze mehrfach im kohärenten Dossier. Kritischer HDI/Gini-Vergleich trägt diese direkte Voraussetzung; keine zusätzliche Gini-Formelabrufpflicht.'),
    '36ebee6c-ec32-53e2-a5da-f50185e61a55':('40cb7a96-ca10-50a4-9b42-d48933744e46',2,'L1 Verantwortung/freiwillig/Pflicht mit Anwendbarkeit, L2 wirksame Abhilfe/Beschäftigtenfolgen und separat L2b kumulative Abbruchgrenze/Haftung prüfen die ganze Sorgfaltsbewertung. Aktuelle Normkarten sind gegeben; bloß allgemeine CSR-Namen reichen nicht.'),
    '9df66a0b-eb44-5668-b661-4f09e1d2399f':('40cb7a96-ca10-50a4-9b42-d48933744e46',3,'E1 Methodik/Jahr/Modellrating plus Zusätzlichkeit und E2 Absicht/Output/Zugangs-/Verteilungswirkung mit Risiko/Renditegrenze prüfen ESG und Impact im selben Mess-/Wirkungsdossier. Keine Kaufempfehlung oder sichere Rendite ist Voraussetzung.'),
    '7a55332e-7c1d-531a-8679-e18592e74ea2':('40cb7a96-ca10-50a4-9b42-d48933744e46',4,'K1 Geschäfts-/Datenanreiz, echte Wahl/Privatsphäre/Zugang und K2 gruppenbezogene Fehler plus wirksame kontrollierbare Alternative prüfen Mehrkriterienethik. Ein Durchschnitt oder Signatur reicht nicht; die direkt geprüfte Leistung trägt requires.'),
    'e7542590-40e7-5d06-99f3-f295be1f9e12':('69e66ab4-481e-5a8c-9ddc-ef4ad5c5062a',1,'Alle vier Institutionen in A und im veränderten B nach Mandat, Beitrag, konkreter Grenze und Schnittstelle prüfen Governance. Finanzierungsarithmetik ist Kontext ohne Bewilligung; keine Weltregierung oder allgemeine Kreditkompetenz.'),
    '13705b9f-9623-500b-80ba-4574b753a29c':('69e66ab4-481e-5a8c-9ddc-ef4ad5c5062a',2,'A SDG-/Paris-Ziele, Finanzierung/Emissionen/Verteilung und B Anpassung/Wasser/Nahrung mit Budget-/Nachweisgrenze prüfen die ökonomische Nachhaltigkeitsbewertung. Nicht bloße Zielnamen, Steuerfantasie oder Bericht gleich Wirkung.'),
    'c9847c36-7a66-5cbd-9aee-60f71a8440de':('69e66ab4-481e-5a8c-9ddc-ef4ad5c5062a',3,'G1 explizite politische Absicht/Inputmacht, bedingte Vorrats-/Erlösfolgen und G2 Kontrollmacht/Auflagen/Verbot mit Grenzen prüfen zwei geoökonomische Strategien. Nur vollständiger Ausfall ergibt2/4Monate; die wirkliche Teilimportlage ist unterbestimmt, Herkunft allein kein Schadenbeweis.')
}
assert set(performance_reasons) == {r['goalId'] for r in rows}
individual = []
for row in rows:
    material_id, task, reason = performance_reasons[row['goalId']]
    material = next(m for m in materials if m['id'] == material_id)
    assert material['requires'] == material['examData']['coveredGoalIds']
    assert row['goalId'] in material['requires']
    individual.append({'goalId':row['goalId'],'wholeCurrentGoalContract':row['wholeCurrentCanonicalGoal'],'materialId':material_id,'taskIndex':task,'decision':'KEEP','directMaterialRequiresDecision':'MINIMAL_ASSESSED_PERFORMANCE_REQUIRED','wholePerformanceAndDependencyJudgmentDe':reason,'wholeCurrentCanonicalGoalAndOldRequiresPreserved':True,'historicalContentGoalRequiresReReviewed':False,'directMaterialRequiresIsOneIndividuallyAssessedCurrentPerformance':True,'courseMembershipInput':row['actualNationalOrdinaryCourseMembership'],'courseRoleApproval':False,'wholeSourceApproval':False,'retainedWholePositiveProfileCount':1,'retainedWholePositiveCaseCount':2})
individual_path = write('fifteen-individual-whole-current-performance-and-minimal-material-requires-KEEP-judgments.json', {'schemaVersion':1,'reviewer':IDENTITY,'judgments':individual,'scope':'Only actual newly assessed terminal-material direct prerequisites. Existing canonical goal semantics/old prerequisite decisions and valid wholeP30 are exact-reused, not restarted. Pass of a terminal assessment is not a fresh mastery claim for all covered content goals.'})

material_rationales = {
    '475408f7-2f08-5d96-bf1a-684f3ddf744a':'Kohärentes Verfahrensdossier mit drei kontrastierenden institutionellen Situationen; aktuelle Normzuordnung, Gegenprüfung und Kontrollgrenze sind wirklich bewertet. DE/EN nennt dieselben Akteure/Hindernisse; Art94 ist aktuell, K-Ausnahmen sind ausdrücklich ausgeschlossen. Keine vollständige Gesetzgebung oder ganze Rechtsberatung behauptet.',
    '05bc19fe-669b-5c47-b718-802a9db9e096':'Historischer, datierter aktueller und erfundener wirtschaftspolitischer Fall tragen denselben Abwägungszusammenhang. Drei verschiedene Leistungen sind einzeln bewertbar und bleiben getrennt: Instrument-/Leitbildwirkung, Fallanwendung und demokratische Resilienz. Multikausalität, Angebot/Nachfrage, Prozentpunkte/Wirkungsbeleg und rechtsgebundene pluralistische Kontroverse stimmen in DE/EN.',
    '9341cdc0-f45a-5e2b-ae90-55950bab91d9':'Reparaturregion verbindet digitale Geschäfts-/Regelbewertung, bedingte kurzfristige/regional-langfristige Zukunft, tatsächliche geschützte Beteiligung und unterschiedliche strategische Spiele. Schutz und Ausführungsanforderung sind explizit; Plan-only Gesamtcap ist in Aufgabe/Lösung/Rubrik DE/EN konsistent. Keine Außenaktivität oder politische Zustimmung; tatsächlich unvollkommene Ausführung behält Teilpunkte. Vier Ziele bleiben außerhalb aktueller nationaler Ordinary-Scopes rollenoffen.',
    '40cb7a96-ca10-50a4-9b42-d48933744e46':'Entwicklungs-/Verantwortungsdossier hat vier klare Leistungen mit je zwei kontrastierenden Fällen: Indikatoren, normbezogene Sorgfalt, ESG/Impact-Wirkung und Datenethik. Aktuelle Anwendbarkeit, kumulative Abhilfe-/Abbruchgrenzen und Haftung sind vollständig im relevanten Einzelvorschriftenrahmen geprüft. Ratings/Aktivität sind kein kausaler Wirkungsnachweis; qualifizierte Samplegenauigkeit kein globaler Fairnessbeweis. DE/EN Zahlen und Grenzen stimmen.',
    '69e66ab4-481e-5a8c-9ddc-ef4ad5c5062a':'A/B-Kooperationsdossier verbindet Mandate mit Entwicklungs-/Klimafinanzierung und zwei Machtkanälen. Budget, Verteilung, tatsächliche Umsetzung und nationale Zuständigkeit bleiben prüfbar und begrenzt. G1 rechnet vollständigen Ausfall explizit konditional; Teilimporte/weitere Ströme bleiben offen. G2 ist ein gegebenes analytisches Screening, keine ungesicherte Übergangsrechtsbehauptung. DE/EN liefert gleiche Zahlen und Grenzen.'
}
judgments = []
release = []
for material in materials:
    assert material['examData']['reviewStatus'] == 'draft'
    scoring = material['examData']['scoring']
    assert sum(step['points'] for step in scoring['steps']) == scoring['maxPoints']
    assert 0 < scoring['passingPoints'] <= scoring['maxPoints']
    assert len(material['requires']) == len(set(material['requires']))
    assert material['requires'] == material['examData']['coveredGoalIds']
    goal = deepcopy(material)
    goal['examData']['reviewStatus'] = 'released'
    release.append(goal)
    judgments.append({'materialId':material['id'],'wholeDraftMaterialInput':next(v['wholeMaterial'] for v in index['individualWholeReviewInputs'] if v['goalId']==material['id']),'decision':'KEEP','wholeTaskSolutionRubricActuallyReadBothDEEN':True,'wholePerformanceRationaleDe':material_rationales[material['id']],'coveredGoalIds':material['requires'],'minimumDirectRequiresExactlyAssessedCoveredGoals':True,'maximumPoints':scoring['maxPoints'],'passingPoints':scoring['passingPoints'],'wholeOwnCounteranswerIds':[v['id'] for v in counteranswers if v['materialId']==material['id']],'rubricPartialMarksPreserved':True,'openFindings':[],'approvalScope':'MACHINE_WHOLE_SUBJECT_MATERIAL_ONLY','humanApproval':False,'strictNetGain':0})
judgment_path = write('five-individual-whole-DEEN-task-solution-rubric-independent-KEEP-decisions.json', {'schemaVersion':1,'reviewer':IDENTITY,'independentOfAuthor':'/root/economics_independent_continuation_a','judgments':judgments,'counts':{'KEEP':5,'REVISE':0},'humanReleaseGatesSeparate':True})
release_path = write('whole-five-KEEP-material-bodies.machine-released-inert-independent-candidate.json', release)
for old,new in zip(materials,release):
    compare=deepcopy(new);compare['examData']['reviewStatus']='draft'
    assert compare==old
kind_path = write('seven-individual-independent-assessment-and-pure-navigation-kind-decisions.json', {'schemaVersion':1,'reviewer':IDENTITY,'decisions':[{'goalId':m['id'],'semanticKind':'practiceAssessment','decisionStatus':'authoritative','decisionBasis':'independent-whole-current-task-solution-rubric-and-assessed-performance-review','sourceWholeGoalSha256':hashlib.sha256(json.dumps(m,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest(),'classificationReasonDe':'Aufgabenendpunkt mit examData und materialgestützter selbstständiger Prüfung; kein neues curricularAtomic-Inhaltsziel, keine Memory- oder Orientierungsabschlussbehauptung.','technicalNativeFingerprintStillRequiredForFinalIntegration':True} for m in release]+[{'goalId':n['id'],'semanticKind':'practiceAssessment','decisionStatus':'authoritative','decisionBasis':'independent-whole-pure-assessment-navigation-cluster-review','sourceWholeGoalSha256':hashlib.sha256(json.dumps(n,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest(),'classificationReasonDe':'Reiner phasenlokaler Navigationsordner für die geprüften Aufgabenendpunkte, ohne eigene zu zertifizierende fachliche Leistung und ohne requires. Nicht curricularAtomic; keine breite Voraussetzung an Kinder geerbt.','technicalNativeFingerprintStillRequiredForFinalIntegration':True} for n in nav],'nativeFingerprintsAreBindingsNotReplacementForTheseWholeDecisions':True,'liveLedgerWrites':0})

import jsonschema
schema = read(ROOT / 'docs/landscape-runtime.schema.json')
validator = jsonschema.Draft202012Validator({'$ref':'#/$defs/goal','$defs':schema['$defs']})
schema_errors = []
for g in [*release,*nav]:
    schema_errors.extend({'goalId':g['id'],'message':e.message,'path':list(e.path)} for e in validator.iter_errors(g))
assert not schema_errors, schema_errors
candidate = read(AUTHOR / 'whole-CAN423-only-five-DRAFT-materials-two-nav-and-root-append.inert-diagnostic.json')
assert len(candidate['goals']) == 423
candidate_by_id = {g['id']:g for g in candidate['goals']}
assert len(candidate_by_id) == 423
for edge in ['requires','contains']:
    visited=set();active=set()
    def visit(gid):
        assert gid not in active, ('cycle',edge,gid)
        if gid in visited:return
        active.add(gid)
        for target in candidate_by_id[gid].get(edge,[]):
            assert target in candidate_by_id,(edge,gid,target)
            visit(target)
        active.remove(gid);visited.add(gid)
    for gid in candidate_by_id:visit(gid)
assert all(n.get('requires') == [] and n.get('type') == 'cluster' for n in nav)
for course in ['gk','lk']:
    previous=read(AUTHOR / ('whole-'+course+'-view.actual-reviewed-E9-frame-baseline.snapshot.json'))
    after=read(AUTHOR / ('whole-'+course+'-view.only-two-Q1-Q4-navigation-references.inert.proposal.json'))
    inserted=[]
    def remove_only_two_new_refs(value,path):
        if isinstance(value,list):
            result=[]
            for i,child in enumerate(value):
                if isinstance(child,dict) and child.get('kind')=='canonicalSubtree' and child.get('goalId') in {n['id'] for n in nav}:
                    inserted.append({'path':path+[i],'wholeNewReference':child})
                    assert child.get('projectionRole')=='target'
                else:
                    result.append(remove_only_two_new_refs(child,path+[i]))
            return result
        if isinstance(value,dict):return {k:remove_only_two_new_refs(v,path+[k]) for k,v in value.items()}
        return value
    assert remove_only_two_new_refs(after,[]) == previous
    assert len(inserted)==2 and {x['wholeNewReference']['goalId'] for x in inserted}=={n['id'] for n in nav}
afterguards={str(p.relative_to(ROOT)):ref(p) for p in input_paths}
assert before==afterguards
sys.path.insert(0,str(ROOT/'scripts'))
from validate_schemas import curriculum_symlink_errors
symlink_errors=curriculum_symlink_errors(ROOT)
assert not symlink_errors,symlink_errors
required_paths=[str(p.relative_to(ROOT)) for p in input_paths]+[str(p.relative_to(ROOT)) for p in OUT.iterdir() if p.is_file()]
ignore=subprocess.run(['git','check-ignore','--no-index','--stdin'],cwd=ROOT,input='\n'.join(required_paths)+'\n',text=True,capture_output=True)
assert ignore.returncode==1 and not ignore.stdout.strip(),ignore.stdout+ignore.stderr
guard_path=write('actual-independent-whole-frozen-input-P30-schema-DAG-and-portability-guards.json',{'schemaVersion':1,'wholeInputsBefore':before,'wholeInputsAfter':afterguards,'wholeInputCount':len(input_paths),'allWholeInputsByteExact':True,'individualExactReuseGuards':frozen_contracts,'exactWholePProfileCount':15,'exactWholePCaseCount':30,'PStatus':'E1/G1 ai_candidate needs_human_review unchanged','sevenReleasedMaterialAndNavSchemaErrors':schema_errors,'whole423RequiresAndContainsDAGPassed':True,'whole423TechnicalCheckIsNotWholeCourseApproval':True,'twoViewChangesOnlyAppendTwoNavReferences':True,'newPureNavPrerequisiteFree':True,'normalCurriculumSymlinkErrors':symlink_errors,'allOwnAndRequiredInputsIgnorePassed':True,'wholeOfficialPdfOrFullExtractNewlyCommitted':False,'existing127GapPassedClaimed':False,'proposedNineClustersOnlyProposal':True,'fourFutureGoalRolesRemainUnapproved':True,'liveWrites':[]})

receipt_path=write('actual-final-five-coherent-Q1-Q4-materials-fifteen-whole-performances-independent-KEEP-and-inert-machine-release.receipt.json',{'schemaVersion':1,'reviewedAt':datetime.now(timezone.utc).isoformat(),'reviewer':IDENTITY,'author':'/root/economics_independent_continuation_a','independentOfMaterialAuthor':True,'wholeAuthorHandoff':ref(handoff_path),'wholeFiveDrafts':ref(bundle_path),'metadataSuccessorReviewIndex':ref(index_path),'fiveWholeMaterialDecisions':ref(judgment_path),'fifteenIndividualWholePerformanceMinimalRequiresDecisions':ref(individual_path),'ownWholeCounteranswers':ref(counter_path),'ownNumericAndRubricBoundaries':ref(numeric_path),'actualIndependentPrimaryReads':ref(primary_path),'machineReleasedInertKEEPBodies':ref(release_path),'independentSevenKindDecisions':ref(kind_path),'wholeFrozenInputsAndPortability':ref(guard_path),'counts':{'wholeDEENMaterialKEEP':5,'wholeMaterialREVISE':0,'individualAssessedCurrentPerformanceKEEP':15,'originalWholePProfilesExactlyRetained':15,'originalWholePCasesExactlyRetained':30,'ownEntireIndividualCounteranswers':10,'ownNumericGameAndCapChecks':len(checks),'independentPrimarySourceReads':26,'fiveAssessmentKinds':5,'twoPureNavigationKinds':2},'bindingNote':'Only draft→released is changed in the separately written five inert KEEP body copies. Native semantic input fingerprints must be computed for this actual released whole source and then bound during final Root assembly; a hash binding is no replacement for the actual whole review. No live files, course/source role or oldP payload altered.','mandatoryActualParticipationBoundary':'Own full plan-only counteranswer has18 correct other-task raw points and0 execution; effective14<15. Hypothetical imperfect observable execution retains partial marks; no political agreement, external action, private data or full-mark quota. No real learner simulation claimed.','protectedScopeBoundaries':{'currentOrdinaryFourFutureTargetsApproved':False,'wholeSourceCoverageApproved':False,'wholeCourseOrApplicabilityApproved':False,'twoNewNavAndSevenToNineRegistryProposalIntegrated':False,'existingProduction127GapsPassed':False,'freshDescriptionDualReviewApproved':False,'nativeGoalBookContextOrPageBindingsApproved':False,'humanApproval':False,'humanReleaseGatesPreserved':True,'actualLearnerOrClassTrial':False},'strictBaselineFromParentOnly':{'complete':300,'curricularAtomic':311,'maturity':'M2','remeasuredByThisReview':False},'newStrictGoalClosures':0,'restoredStrictBindings':0,'strictNetGain':0,'nextIndependentOrIntegrationWork':'Root integrates accepted inert material bodies, actual native kind fingerprints, explicit registry proposal and source/course roles, then changed real owner-page/context D-A/D-B checks and stable terminal-route checks. Historical valid profiles remain byte-exact.'})
assert before=={str(p.relative_to(ROOT)):ref(p) for p in input_paths}
print(json.dumps({'receipt':ref(receipt_path),'KEEP':5,'wholeCurrentPerformanceKEEP':15,'ownCounteranswers':10,'ownNumericChecks':len(checks),'exactRetainedP30':True,'strictNetGain':0},ensure_ascii=False))
