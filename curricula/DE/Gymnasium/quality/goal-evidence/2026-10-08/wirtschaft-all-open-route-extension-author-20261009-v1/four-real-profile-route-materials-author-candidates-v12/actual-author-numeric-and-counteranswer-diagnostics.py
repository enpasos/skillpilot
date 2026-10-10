from pathlib import Path
from decimal import Decimal as D
import json, hashlib

BASE = Path(__file__).resolve().parent
SOURCE = BASE / 'whole-four-profile-route-terminal-DRAFT-goals.author.candidate.json'
goals = json.loads(SOURCE.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
def write(name, value):
    p = BASE / name
    if p.exists():
        raise RuntimeError(f'Immutable output already exists: {p}')
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

numeric = []
def check(label, actual, expected, expression):
    actual, expected = D(actual), D(expected)
    numeric.append({'label': label, 'expression': expression, 'actualDecimal': str(actual), 'expectedDecimal': str(expected), 'equal': actual == expected})
    if actual != expected:
        raise RuntimeError(label)

for (x, y), expected in [((0, 0), (10, 10)), ((10, 10), (20, 20)), ((0, 10), (30, 0))]:
    check(f'Game k=2 first payoff ({x},{y})', D(10)-D(x)+D(2)*D(y), expected[0], f'10-{x}+2*{y}')
    check(f'Game k=2 second payoff ({x},{y})', D(10)-D(y)+D(2)*D(x), expected[1], f'10-{y}+2*{x}')
for name, numerator, denominator, expected in [('North L/K',200,100,2),('South L/K',100,100,1),('Textile L/K',6,1,6),('Machine L/K',2,4,'.5')]:
    check(name, D(numerator)/D(denominator), expected, f'{numerator}/{denominator}')
for name, r, p, expected in [('Reserve A',120,4,30),('Reserve B',150,5,30),('Reserve C',120,6,20)]:
    check(name, D(r)/D(p), expected, f'{r} million t / {p} million t/year')
check('Reserve proportional increase', (D(150)/D(120)-1)*100,25,'(150/120-1)*100')
check('Production proportional increase', (D(5)/D(4)-1)*100,25,'(5/4-1)*100')
for portfolio, weights, expected in [('P',('.6','.4'),[(4,1040),(-2,980),(-8,920)]),('Q',('.2','.8'),[(0,1000),(2,1020),(-6,940)])]:
    for i, ((a,b), (ret,end)) in enumerate(zip([(8,-2),(-6,4),(-10,-5)], expected),1):
        actual = D(weights[0])*D(a)+D(weights[1])*D(b)
        check(f'Portfolio {portfolio} scenario {i} return percent',actual,ret,f'{weights[0]}*({a})+{weights[1]}*({b})')
        check(f'Portfolio {portfolio} scenario {i} end value',D(1000)*(1+actual/100),end,f'1000*(1+({actual})/100)')
check('Published rounded category sum', sum(map(D,['22.4','19.2','52.3','6.2'])), '100.1','22.4+19.2+52.3+6.2')

def answer(goal, label, responses, scores, reasons):
    scoring = goal['examData']['scoring']
    graded = [{'stepId':s['id'],'maximum':s['points'],'awarded':score,'actualAuthorReason':reason} for s,score,reason in zip(scoring['steps'],scores,reasons)]
    total = sum(scores)
    assert len(responses)==len(scores)==len(reasons)==len(scoring['steps'])==4
    assert all(0<=r['awarded']<=r['maximum'] for r in graded)
    assert total < scoring['passingPoints']
    return {'goalId':goal['id'],'label':label,'origin':'New intentional author-written synthetic diagnostic answer; no actual learner, runtime observation or independent reviewer.', 'completeTaskResponses':[{'task':i+1,'answer':a} for i,a in enumerate(responses)],'actualAuthorRubricApplication':graded,'actualAuthorTotal':total,'maximum':scoring['maxPoints'],'passingThreshold':scoring['passingPoints'],'belowPassingThreshold':True}

counter=[]
counter.append(answer(goals[0],'All-five-courts and procedural-category confusions',[
 'A gehört zum Finanzgericht, weil Geld verlangt wird. B gehört zum Sozialgericht, weil es um eine Person geht. C gehört zum Arbeitsgericht, weil eine Werkstatt arbeitet. D gehört zum ordentlichen Gericht, weil die Bundesagentur eine Behörde ist. E gehört zum Verwaltungsgericht, weil jedes Behördenhandeln dort geprüft wird.',
 'Im Zivilprozess klagt der Staatsanwalt Nina wegen Schuld an; Ben ist Richter. Im Strafverfahren verlangt Nina als Klägerin von Ben Ersatz; das Gericht ermittelt als ihr privater Vertreter. Beide Verfahren haben ausschließlich den Zweck, Ben Geld zu geben.',
 'Zivil: Verurteilung, danach Klage, danach Untersuchung. Straf: Zahlung der 300 EUR, danach Urteil, danach Anzeige. Ein Ergebnis ist von Anfang an fest.',
 'Beide behaupteten Folgen stimmen. Eine Anzeige beweist Ninas Schuld und erteilt zugleich einen Zahlungstitel für 300 EUR.'
],[0,0,0,0],[
 'All five branch assignments and purported rules are wrong; none earns either assignment or case-rule credit.',
 'Purposes and all named procedural roles are confused; no credit for naming a role without assigning it correctly.',
 'Neither sequence is meaningful, and neither outcome is left open.',
 'Affirms both exact misconceptions rather than explaining either boundary.'
]))
counter.append(answer(goals[0],'Correct three branches and roles but automatic outcome',[
 'A: ordentliche Gerichtsbarkeit, privater Ersatzstreit. B: Arbeitsgerichtsbarkeit, Arbeitnehmer-Arbeitgeber-Streit aus dem Arbeitsvertrag. C: Verwaltungsgerichtsbarkeit, öffentlich-rechtliche kommunale Erlaubnis ohne Sonderzuweisung. D: Finanzgericht, weil die Leistung mit Geld bezahlt wird. E: Sozialgericht, weil die Inhaberin Steuern sozial ungerecht findet.',
 'Zivil wird Bens privater Ersatzanspruch geklärt: Ben ist Kläger und Nina Beklagte. Strafrechtlich ist Nina Beschuldigte, Ben Geschädigter/Anzeigender. Der Staat verfolgt den Vorwurf; die Staatsanwaltschaft ermittelt und entscheidet über Anklage oder Einstellung, das unabhängige Gericht entscheidet über den Vorwurf.',
 'Zivil: fertige Entscheidung, erst dann Klagezustellung, schließlich Beweise. Straf: Urteil, danach Anzeige, danach Staatsanwaltschaft. Weil eine Anzeige vorliegt, ist in beiden Fällen das Ergebnis schon fest.',
 'Nina muss verurteilt werden, da Ben Anzeige erstattet hat. Damit wird der private Anspruch automatisch anerkannt und Nina muss Ben die 300 EUR zahlen.'
],[6,6,0,0],[
 'A/B/C each earn assignment1 plus actual rule/case reason1; D/E both wrong, no points.',
 'Both purposes, Ben/Nina and prosecution/independent court are correctly separated: full six, despite later contradictory outcome claims.',
 'Both sequences reversed and open outcome expressly denied: no sequence or openness credit.',
 'Both automatic consequences remain explicitly asserted: no credit.'
]))
counter.append(answer(goals[1],'Nationalisation and payoff/dataset misread',[
 'S und G schaffen laut Material privates Eigentum und Marktpreise ab. In beiden legt der Staat alle Produktionsmengen fest, und G berücksichtigt ausschließlich Geldgewinn. Das trifft auf sämtliche GWÖ-Konzepte weltweit zu.',
 'Für jedes y maximiert x=10 die eigene Auszahlung, weil eine höhere eigene Übertragung den Term k*y vergrößert. Daher wählen beide10. Bei k=2 erhalten beide bei(0,0)0 und bei(10,10)40. Es müssen alle immer nur fair handeln.',
 'Die Tabelle zeigt, dass 100% der Personen überhaupt nichts übertragen und22,4% alles. Damit handelt jede Person wie mein Modell; weitere Grenzen gibt es nicht.',
 'Das beweist, dass G eine ganze Volkswirtschaft besser steuert, weil jeder im Versuch in G lebte und das eine kontrollierte Landesstudie war.'
],[0,0,0,0],[
 'All three axes contradict supplied S/G, and an unsupported universal claim replaces the explicit bound.',
 'Own x does not change k*y; prediction, control values and stated behavioural assumption are wrong.',
 'Percentages/categories swapped; no valid comparison, plausible cautious explanation or two bounds.',
 'Invents a regime implementation and macro experiment; neither required boundary is acknowledged.'
]))
counter.append(answer(goals[1],'Correct supplied concepts but cooperative-dominance and causal overclaim',[
 'S verbindet wirtschaftliche Freiheit/Marktkoordination mit Wettbewerbsregeln und sozialem Ausgleich. G ergänzt im vorgegebenen Entwurf soziale/ökologische Ziele durch Gemeinwohlbericht und vorgeschlagenen Vergabevorteil. Beide erhalten private Betriebe und Marktpreise; G verändert den Zusatzmechanismus. Diese Aussagen gelten nur für den bereitgestellten Entwurf, nicht automatisch für andere GWÖ-Varianten.',
 'Bei k=2 geben(0,0)10/10,(10,10)20/20 und(0,10)30/0. Daher ist x=10 für jedes y die individuell geldmaximierende Wahl; beide werden10 übertragen. Andere Verhaltensannahmen muss man nicht nennen.',
 'Die rein individuelle Null/Null-Vorhersage passt nicht zu allen Entscheidungen: nur22,4% übertragen nichts. Das beweist eindeutig eine angeborene faire Persönlichkeit aller anderen; Modell, Teilnehmerauswahl und verschiedene k können keinerlei Grenze verursachen.',
 'Die hohen Kooperationszahlen beweisen unmittelbar die volkswirtschaftliche Überlegenheit von G gegenüber S, einschließlich eines kausalen Effekts des Gemeinwohlberichts.'
],[8,2,2,0],[
 'All supplied comparison axes plus exact scope bound correctly stated: full eight.',
 'All control payoffs correct earn2; wrong marginal mechanism/own optimum/joint prediction and absent assumption earn0 remaining.',
 'Concrete 22.4% comparison earns2; unique causal personality claim earns no cautious explanation, and boundaries are denied.',
 'Affirms unsupported macro and report causal inferences, no boundary credit.'
]))
counter.append(answer(goals[2],'Absolute capital, multiplied reserve and fixed calendar date',[
 'Nord L/K=0,5 und Süd L/K=1. Textil L/K=1/6 und Maschine L/K=2. Nord ist kapitalreich, Textil kapitalintensiv, Maschine arbeitsintensiv.',
 'Nord exportiert Maschinen, weil200 Menschen stets200 Maschinen bedeuten. Süd exportiert Textilien, weil ein absolutes K von100 niedrig ist. Keine Annahmen sind relevant.',
 'Reichweite A=120*4=480 Jahre, B=150*5=750 Jahre, C=120*6=720 Jahre. Wenn beide Zähler und Nenner steigen, muss der Quotient steigen; die Einheiten sind Tonnen.',
 'Kupferreserve R und Maschinenkapital K sind dasselbe. Mehr Kupfer in Süd garantiert Maschinenexporte. 30 Jahre bedeutet das genaue Ende in30 Kalenderjahren, selbst wenn sich Fördermenge, Preis oder Technik ändern.'
],[0,0,0,0],[
 'All relevant numerical/relative classifications are wrong.',
 'Neither conditional linked trade inference nor two actual assumptions is supplied.',
 'All three quotients and proportional/unit explanations wrong.',
 'Affirms K/R conflation, unprovided reserve, unconditional trade and fixed exhaustion date; no valid bounds.'
]))
counter.append(answer(goals[2],'Correct relative factors but unconditional trade and stale production denominator',[
 'Nord L/K=200/100=2, Süd=100/100=1; Nord ist relativ arbeitsreicher, Süd relativ kapitalreicher. Textil L/K=6, Maschine=2/4=0,5; Textil ist relativ arbeitsintensiv, Maschine relativ kapitalintensiv.',
 'Nord exportiert Textilien, weil Nord relativ arbeitsreicher ist und Textil relativ mehr Arbeit braucht. Süd exportiert Maschinen, weil Süd relativ kapitalreicher ist und Maschine Kapital intensiver nutzt. Diese Muster gelten ausnahmslos in der Realität; Technologien, Kosten und andere Modellannahmen muss man nicht prüfen.',
 'A hat30 Jahre Reichweite, B ebenfalls30 Jahre, C bleibt ebenfalls30 Jahre, weil dieselbe Reserve wie A vorliegt. Wenn R und P steigen, kann ich die proportionalen Änderungen nicht erklären. Eine Einheitenbegründung fehlt.',
 'Eine größere Kupferreserve Süd ist bewiesen und entspricht automatisch Maschinenkapital. Das garantiert Maschinenexporte. Die30 Jahre legen das reale Erschöpfungsdatum endgültig fest; Veränderungen sind irrelevant.'
],[6,4,2,0],[
 'Four quotients earn4; both relative country and good classifications earn1 each.',
 'Both linked model trade patterns earn2 each; explicit rejection of actual assumptions earns0 boundary points.',
 'A/B each correct with year unit earn1; C wrong, no proportional or dimensional explanation.',
 'Every required distinction/information boundary is denied:0.'
]))
counter.append(answer(goals[3],'Unweighted returns and general safety promise',[
 'Da beide Portfolios aus zwei Anlagen bestehen, gilt überall der einfache Durchschnitt. P und Q haben in I3%, in II−1% und in III−7,5%; die Endwerte sind1030,990 und925, unabhängig von den Gewichten.',
 'A und B steigen in allen drei Fällen gemeinsam. Diversifikation garantiert deshalb schon wegen zweier Anlagen einen Gewinn; Gewichte sind ohne Einfluss.',
 'Beide Portfolios erfüllen in jedem Szenario die5%-Grenze, weil zwei Anlagen stets jedes Risiko ausschalten.',
 'Q ist generell sicher. Drei erfundene Alternativszenarien beweisen dauerhafte negative Korrelation, und weitere Daten, Kosten oder Wahrscheinlichkeiten fehlen nicht.'
],[0,0,0,0],[
 'None of six weighted return or end-value pairs is correct; no half-credit for a method contradicted by weights.',
 'Signs, weighting and guarantee reasoning wrong, no points.',
 'Neither actual threshold violation nor valid bounded comparison identified.',
 'Affirms both target misconceptions and denies information needs:0.'
]))
counter.append(answer(goals[3],'All calculations and joint movements correct but threshold and inference fail',[
 'P: I4% und1040; II−2% und980; III−8% und920. Q: I0% und1000; II2% und1020; III−6% und940. Dafür verwende ich jeweils die angegebenen Anfangsgewichte.',
 'In I und II bewegen sich A und B gegensinnig; der Gewinn eines Anteils gleicht den Verlust des anderen abhängig vom Gewicht teilweise aus. In III fallen beide; Q ist stärker in die dort weniger fallende B-Anlage gewichtet und verliert weniger. Diversifikation verhindert daher gemeinsame Verluste nicht.',
 'Für die5%-Grenze muss man nur I prüfen; weil dort kein Portfolio verliert, erfüllen beide die Grenze in allen Szenarien. Einen Gewinn-/Verlustvergleich der beiden brauche ich nicht.',
 'Q ist generell sicher, und die drei Szenarien beweisen dauerhafte negative Korrelation. Es fehlen weder Wahrscheinlichkeiten noch gemeinsame Zeitreihen oder andere Informationen.'
],[6,6,0,0],[
 'All six weighted return and end-value pairs earn0.5+0.5 each:6.',
 'Correct opposing signs/weights, joint negative scenario and absence of guarantee:6.',
 'Neither numerical violation nor proper bounded comparison; wrongly narrows all-scenario requirement to I:0.',
 'General safety/correlation claim affirmed and both information needs denied:0.'
]))

budgets=[{'goalId':g['id'],'stepsSum':sum(s['points'] for s in g['examData']['scoring']['steps']),'maxPoints':g['examData']['scoring']['maxPoints'],'passingPoints':g['examData']['scoring']['passingPoints'],'draftExact':g['examData']['reviewStatus']=='draft'} for g in goals]
assert all(b['stepsSum']==b['maxPoints']==24 and b['passingPoints']==15 and b['draftExact'] for b in budgets)
write('actual-own-28-decimal-calculations-and-four-rubric-budget-checks.json',{'schemaVersion':1,'kind':'author-diagnostic-calculation-not-independent-review','sourceWholeSHA256':sha(SOURCE),'actualDecimalChecks':numeric,'count':len(numeric),'mismatches':[],'actualRubricBudgetChecks':budgets,'qualityApproval':False,'newStrictClosures':0})
write('eight-whole-intentionally-faulty-synthetic-answers-and-actual-author-rubric-diagnostics.json',{'schemaVersion':1,'kind':'actual-author-written-negative-diagnostics-not-learner-data-or-independent-approval','sourceWholeSHA256':sha(SOURCE),'answers':counter,'allEightBelow15':True,'qualityApproval':False,'runtimeAcceptance':False,'realLearnerEvidence':False,'newStrictClosures':0})
print(json.dumps({'sourceSHA256':sha(SOURCE),'decimalChecks':len(numeric),'counteranswers':len(counter),'scores':[a['actualAuthorTotal'] for a in counter],'allDraftExact':all(b['draftExact'] for b in budgets)}))
