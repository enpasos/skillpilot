"""Root's independently solved, bounded material review; no learner evidence.

Run once to preserve this review. Subsequent material changes require a new
review directory, rather than rewriting these historical decisions.
"""
from pathlib import Path
from decimal import Decimal as D
import datetime
import hashlib
import json

BASE = Path(__file__).resolve().parent
ROOT = Path('/home/enpasos/projects/skillpilot')
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/four-real-profile-route-materials-author-candidates-v12'

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write_new(name, obj):
    path = BASE / name
    if path.exists():
        raise RuntimeError(f'Refusing to replace historical review: {path}')
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return {'path': str(path.relative_to(ROOT)), 'sha256': sha(path)}

source_path = AUTHOR / 'whole-four-profile-route-terminal-DRAFT-goals.author.candidate.json'
assert sha(source_path) == '1da3e7c9d60617beb729c72d054bf9b2053ca2c78711f526a1983feeb6378f4c'
goals = json.loads(source_path.read_text())
assert isinstance(goals, list) and len(goals) == 4
target_goals = json.loads((BASE / 'whole-seven-actual-current403-performance-goals.independent-read.snapshot.json').read_text())
target_ids = {g['id'] for g in target_goals}
assert len(target_ids) == 7
assert set().union(*(set(g['requires']) for g in goals)) == target_ids
for g in goals:
    e = g['examData']
    assert e['reviewStatus'] == 'draft'
    assert set(e['coveredGoalIds']) == set(g['requires'])
    assert sum(s['points'] for s in e['scoring']['steps']) == e['scoring']['maxPoints'] == 24
    assert e['scoring']['passingPoints'] == 15
    assert e['demandLevels'] == ['AB1', 'AB2', 'AB3']

numeric = []
def calc(label, actual, expected, interpretation):
    assert actual == D(str(expected)), (label, actual, expected)
    numeric.append({'calculation': label, 'actual': str(actual), 'expected': str(expected), 'interpretationDe': interpretation})

# Independent payoff reconstruction, not a trust in the supplied solution.
for x, y, expected in ((0,0,10),(10,10,20),(0,10,30),(10,0,0),(5,5,15),(5,0,5)):
    calc(f'PD k=2 own payoff at x={x}, y={y}',D(10)-D(x)+D(2)*D(y), expected,
         'One-shot own-money payoff; cooperative joint gain does not remove own marginal cost.')
for k in (2,3,4,5,10):
    calc(f'PD marginal own payoff x:0->1 for k={k}, fixed y=7',
         (D(10)-D(1)+D(k)*D(7))-(D(10)+D(k)*D(7)), -1,
         'For every fixed y, -x is the only x-dependent term; continuously as well as on integer examples, x=0 maximizes own money.')
calc('Published rounded aggregate total',sum(map(D,('22.4','19.2','52.3','6.2'))),'100.1','Rounded aggregate, no fictitious individual observations or exact sample-frequency reconstruction.')
for label, n, d, expected in (('North L/K',200,100,2),('South L/K',100,100,1),('Textile L/K',6,1,6),('Machine L/K',2,4,'0.5')):
    calc(label,D(n)/D(d),expected,'Relative abundance and factor intensity, not an absolute-capital or raw-reserve comparison.')
for label, r, p, expected in (('A reserve/production',120,4,30),('B reserve/production',150,5,30),('C reserve/production',120,6,20)):
    calc(label,D(r)/D(p),expected,'Million tonnes divided by million tonnes per year yields years; static quotient, no fixed exhaustion date.')
calc('B/A reserve proportional increase',D(150)/D(120)-1,'0.25','Reserve and annual production increase equally.')
calc('B/A production proportional increase',D(5)/D(4)-1,'0.25','Equal proportional increases preserve R/P.')
for portfolio, wa, wb, expected in (
        ('P','0.6','0.4',(('0.04',1040),('-0.02',980),('-0.08',920))),
        ('Q','0.2','0.8',(('0',1000),('0.02',1020),('-0.06',940)))):
    for index, ((ra,rb),(return_expected,end_expected)) in enumerate(zip(
            (('0.08','-0.02'),('-0.06','0.04'),('-0.10','-0.05')),expected),1):
        result = D(wa)*D(ra)+D(wb)*D(rb)
        calc(f'{portfolio} scenario {index} weighted return',result,return_expected,'Initial weights, one period, no rebalancing or probability assumption.')
        calc(f'{portfolio} scenario {index} terminal value',D(1000)*(1+result),end_expected,'Nominal model units; costs and distributions explicitly excluded.')
calc('P stress loss above supplied limit',D('0.08')-D('0.05'),'0.03','Fails the stated 5% scenario limit.')
calc('Q stress loss above supplied limit',D('0.06')-D('0.05'),'0.01','Also fails the limit despite the smaller scenario-III loss.')

decisions = [
    {
        'goalId': goals[0]['id'], 'verdict': 'KEEP',
        'wholeReadDe': 'Vollständiger DE/EN-Vertrag, Aufgabenmaterial, vier Aufgaben, Lösung und alle vier Rubrikschritte gelesen; die beiden tatsächlichen aktuellen403-Leistungsziele separat ganz gelesen.',
        'independentSourceDe': 'A gewöhnlicher privater Streit -> ordentlich; B Arbeitsvertrag -> Arbeit; C öffentlich-rechtliche kommunale Erlaubnis mit ausgeschlossener Sonderzuweisung -> Verwaltung; D Arbeitsförderung -> Sozial; E Einkommensteuerbescheid, kein Strafverfahren -> Finanz. Ganze aktuelle GVG13/ArbGG2/VwGO40/SGG51/FGO33/ZPO253/StPO152/StPO170 tatsächlich gegengelesen.',
        'independentSolutionDe': 'Privater Ersatzstreit und staatliche Strafverfolgung haben unterschiedliche Zwecke und Rollen. Ben ist Kläger bzw. möglicher Anzeigeerstatter/Geschädigter; Nina Beklagte bzw. zunächst Beschuldigte. Zustellung -> Klärung -> Ergebnis/Einigung; Ermittlungen -> Anklage/Einstellung -> gegebenenfalls Verhandlung/Ergebnis. Eine Anzeige oder Anklage beweist weder Schuld noch privaten Ersatzanspruch.',
        'boundaryDe': 'Zuständigkeit ist nach Streitart bedingt. Keine örtlichen Gerichte, Anspruchsvoraussetzungen, Fristen oder generelle Behörden-/Geldbetragsregel behauptet. Ganze zwei Kompetenzleistungen werden geprüft, keine fünf alten Prüfungsziele pauschal ergänzt.',
    },
    {
        'goalId': goals[1]['id'], 'verdict': 'KEEP',
        'wholeReadDe': 'Ganzer DE/EN-Vertrag und vollständiger Körper aus zwei eigenen Ordnungsskizzen, bedingtem Modell, publiziertem Aggregat, vier Aufgaben, Lösung und Rubrik gelesen; beide tatsächlichen Leistungsziele ganz gelesen.',
        'independentSourceDe': 'Originalartikel Capraro/Jordan/Rand Scientific Reports4:6790 über das aktuelle Nature-PDF tatsächlich gelesen: Results, Discussion und Methods. 308 zulässige US-Teilnehmende, 10 Cent als zehn Einheiten, fünf zwischen Personen verteilte k-Gruppen, Verständnisprüfung und 22,4/19,2/52,3/6,2 stimmen. Das Material beschreibt das erste einmalige Übertragungsspiel, nicht den gesamten späteren Dictator-Game-Teil.',
        'independentSolutionDe': 'Beide bereitgestellten Ordnungsskizzen lassen Privateigentum und Marktpreise zu; G fügt genau den gegebenen Berichts-/Vergabemechanismus hinzu. Für beliebiges festes y ist die eigene Auszahlung 10-x+k*y in x streng fallend; daher Null/Null bei ausschließlich eigener Geldmaximierung, trotz gemeinsamer Mehrerträge. Die echten Aggregate weichen häufig ab. Soziale Präferenzen oder Heuristiken sind mögliche Erklärungen, kein allein bewiesener Kausalmechanismus.',
        'boundaryDe': 'Kein simulierter Unterrichtsversuch als tatsächlich beobachtet ausgegeben. Keine Überlegenheit einer Volkswirtschaft aus individueller Kooperation. Selektierte Stichprobe, Einmaligkeit und zwischen Personen verteilte Multiplikatoren begrenzen den Transfer; alle Ordnungsaussagen bleiben an den ausdrücklich bereitgestellten G-Entwurf gebunden.',
    },
    {
        'goalId': goals[2]['id'], 'verdict': 'KEEP',
        'wholeReadDe': 'Ganzer DE/EN-Vertrag, beide klar getrennten Modellmaterialien, vier Aufgaben, Lösungen und Rubriken sowie beide tatsächlichen aktuellen Leistungsziele ganz gelesen.',
        'independentSolutionDe': 'Nord relativ arbeitsreich (2>1), Süd relativ kapitalreich; Textil L/K6, Maschinen0,5. Unter den genannten gemeinsamen Technologien/Präferenzen, fehlenden Handelskosten und weiteren Modellannahmen: Nord eher Textilien, Süd eher Maschinen. R/P ergibt30/30/20Jahre; B hält denselben Quotienten durch zwei gleiche25%-Zuwächse.',
        'boundaryDe': 'Maschinenkapital ist keine Kupferreserve, die größere Süd-Kupferreserve ist gar nicht gegeben. Modellhandel und statische Quotienten sind keine festen Exportmengen oder Erschöpfungsdaten. Die getrennten zwei Kompetenzen sind in einem begrenzten Beschaffungskontext assessbar; Exam ist kein semantischer Inhaltsatomaritätsclaim.',
    },
    {
        'goalId': goals[3]['id'], 'verdict': 'KEEP',
        'wholeReadDe': 'Ganzer DE/EN-Vertrag, vollständige Szenariotabelle, vier Aufgaben, Lösungen und alle vier Rubrikschritte sowie das tatsächliche aktuelle gewichtete-Rendite/Diversifikationsziel ganz gelesen.',
        'independentSolutionDe': 'P4/-2/-8%, Q0/2/-6%; Endwerte1040/980/920 und1000/1020/940. Gegensinnige Bewegung kann Verluste gewichtet teilweise ausgleichen, gemeinsames Fallen nicht beseitigen. Beide verletzen im dritten Szenario die5%-Grenze. Q ist dort besser, aber im ersten Szenario schlechter als P.',
        'boundaryDe': 'Drei alternative erfundene Szenarien ohne Wahrscheinlichkeiten sind weder Erwartungsrendite noch statistische Zeitreihe. Keine Korrelationsschätzung, individuelle Risikopräferenz oder Anlageempfehlung daraus ableiten. Das aktuelle Ziel verlangt gewichtete Renditen, keine zusätzliche Wahrscheinlichkeitsroutine.',
    },
]

# Complete synthetic submissions, independently scored against all four
# actual rubric steps. These are QA counterexamples, never learner records.
negative = [
    (0,'Geldbetrag-/Behördenheuristik',
     '1. A,B,D,E gehören alle zum Finanzgericht, weil Geld verlangt wird. C gehört zum ordentlichen Gericht, weil eine Werkstatt einen Stand verkauft. 2. In beiden Verfahren klagt Ben auf Bestrafung; Nina ist bereits Täterin. Die Staatsanwaltschaft vertritt Ben und muss seine300 EUR eintreiben. 3. In beiden Wegen gilt Anzeige, Urteil, dann Beweissammlung. Es gibt nach der Anzeige keinen offenen Ausgang. 4. Die Anzeige ist ein Schuldnachweis und führt zwingend zu Verurteilung und300 EUR Zahlung.',
     [0,0,0,0],['Alle fünf Streitarten falsch.','Zwecke und Rollen vermischt.','Keine sinnvolle Folge oder offener Ausgang.','Beide behaupteten Automatismen ungeprüft übernommen.']),
    (0,'Richtige Zweige, falsche Verfahrenslogik',
     '1. A ordentlich wegen privatem Ersatzstreit, B Arbeit wegen Arbeitsvertrag, C Verwaltung wegen öffentlicher Erlaubnis ohne Sonderweg, D Sozial wegen Arbeitsförderung, E Finanz wegen Einkommensteuerbescheid. 2. Ben ist in beiden Verfahren der öffentliche Ankläger, Nina ist in beiden bereits verurteilt; Staatsanwaltschaft und Gericht setzen Bens Urteil um. 3. Zivil: Urteil, Beweise, Klageschrift. Straf: Verurteilung, Anklage, erst dann Ermittlungen. Nach Anzeige steht das Ergebnis fest. 4. Anzeige beweist Schuld; Ben erhält deshalb automatisch300 EUR. Einen gesonderten privaten Anspruch muss man nicht prüfen.',
     [10,0,0,0],['Zweige und konkrete Regeln vollständig richtig.','Kein zutreffender Zweck-/Rollenvergleich.','Beide Folgen und Offenheit falsch.','Keine getrennte Anspruchs- oder Schuldprüfung.']),
    (1,'Staatseigentum und gemeinsamer Ertrag als persönliche Dominanz',
     '1. S hat Marktpreise und privates Eigentum; G hat keine privaten Betriebe, weil ein Gemeinwohlbericht automatisch Staatseigentum bedeutet. Nur S koordiniert über Preise. Beide wollen sozialen Nutzen. 2. Jede Person muss10 übertragen, denn bei k2 erhalten dann beide20 statt10. Das ist die individuell geldmaximierende dominante Wahl, unabhängig von y. 3.52,3% geben alles: Das beweist, dass alle Menschen rational die gemeinsame Summe maximieren; die übrigen Daten sind Fehler. Grenzen sind nicht nötig. 4. G ist dadurch für die ganze Volkswirtschaft erwiesen besser, weil G im Versuch die Kooperation verursacht hat.',
     [3,2,0,0],['S-Beschreibung2 und begrenzte gemeinsame soziale Zielnennung1; G-Eigentum/Koordination und Konzeptbindung falsch.','Kontrollauszahlungen bei gemeinsamem Alles/Nichts richtig2; persönlicher Grenzkostenmechanismus und Vorhersage falsch.','Kein bedingter Vorhersagenvergleich, vorsichtige Erklärung oder Grenze.','Experiment und volkswirtschaftliches Konzept unzulässig gleichgesetzt.']),
    (1,'Modelllösung ohne Datenvergleich und Kausalgrenze',
     '1. S verbindet Freiheit, Markt und sozialen Ausgleich; G ergänzt in genau diesem Entwurf soziale/ökologische Bewertung und Vergabevorteil. Beide behalten Privateigentum und Marktpreise. Andere G-Konzepte sind dadurch nicht beschrieben. 2. Bei festem y kostet jede zusätzliche Übertragung eine eigene Einheit. Daher x0 und symmetrisch y0, wenn nur eigene Geldzahlung zählt. Bei k2 ergibt00:10/10,10/10:20/20,0/10:30/0. 3. Die Tabelle entspricht der Nullvorhersage für alle308 Personen. Dass52,3% alles geben, bedeutet auch Null, da im Modell alles und nichts dasselbe sind. Eine Erklärung oder Grenze gibt es nicht. 4. Genau diese Zahlen beweisen einen kausalen Gemeinwohlbericht-Vorteil von G über S für jedes Land.',
     [8,6,0,0],['Alle gegebenen Konzeptachsen und Bindung korrekt.','Vollständiger eigener Kostenmechanismus samt Kontrollrechnung und Annahme.','Explizite Zahlen nicht mit Vorhersage verglichen; keine Erklärung/Grenze.','Kein Systemvergleich oder kausaler Nachweis.']),
    (2,'Invertierte Faktorquotienten, statische Kalendergewissheit',
     '1. L/K von Nord ist0,5, von Süd1, von Textil1/6 und von Maschinen2. Nord ist deshalb kapitalreicher und Textilien sind kapitalintensiv. 2. Nord muss Textilien wegen seines absoluten größeren Kapitalstocks exportieren; Süd hat kein Exportgut. Gleiche Technologien und keine Handelskosten gelten. Die Mengen sind garantiert. 3. A30Jahre, B30Jahre, C20Jahre; beide B-Größen steigen25%, also bleibt R/P gleich; Millionen Tonnen geteilt durch Millionen Tonnen pro Jahr ergibt Jahre. 4. Süd hat sicher mehr Kupfer, denn K ist Kupfer. Die30Jahre sind ein festes Erschöpfungsdatum; Technik und Funde können daran nichts ändern.',
     [0,1,6,0],['Alle Quotienten bzw. Intensitätszuordnungen falsch.','Zwei tatsächliche Annahmen genannt1, aber keine Modellbegrenzung und keine korrekte verknüpfte Handelsbegründung.','Reichweiten, proportionale Änderung und Einheiten vollständig richtig.','Beide Kernverwechslungen und Prognosegrenzen falsch.']),
    (2,'Richtiger Modellhandel, inverse Reservenkennzahl',
     '1. Nord L/K2, Süd1; Nord relativ arbeitsreich, Süd relativ kapitalreich. Textil6, Maschinen0,5; Textil arbeitsintensiver. 2. Nord eher Textilien, Süd eher Maschinen, weil jeweils der relativ reichliche Faktor intensiver genutzt wird. Gemeinsame Technologien und fehlende Handelskosten sind Annahmen; reale Exporte sind nicht garantiert. 3. R/P ist P/R: A1/30, B1/30, C1/20 Jahre. B hat mehr Rohstoff und deshalb auch eine längere Reichweite als A; Einheiten muss man nicht erklären. 4. Die angebliche große Süd-Kupferreserve bestimmt unmittelbar jede Maschinenlieferung. Eine errechnete Reichweite beweist das Kalenderdatum der Erschöpfung, weil Reserven und Förderung nie anders werden.',
     [6,6,0,0],['Quotienten und relative Zuordnungen vollständig richtig.','Beide verknüpften Erklärungen samt tatsächlichen Annahmen/Begrenzung korrekt.','Invertierte Kennzahl, falsche Proportionalität und Einheit.','Keine kritische Trennung von K/R oder statischem Quotienten und Prognose.']),
    (3,'Ungewichtete Mittel und Sicherheitsgarantie',
     '1. Für P und Q sind die Renditen immer das einfache Mittel der zwei Anlagen: I3%, II-1%, III-7,5%. Endwerte sind in beiden1030,990,925. 2. Zwei Anlagen können nicht gleichzeitig fallen, weil Diversifikation jeden Verlust ausschließt. III beweist daher einen sicheren Gewinn. 3. Beide erfüllen die5%-Grenze in allen Fällen, weil Diversifikation negative Zahlen zu Gewinnen macht. 4. Q ist immer sicher; drei erfundene Szenarien beweisen die dauerhaft negative Korrelation. Wahrscheinlichkeiten, weitere Kursdaten oder Kosten braucht man nicht.',
     [0,0,0,0],['Alle sechs gewichteten Kombinationen falsch; korrekt angewandter Endwert auf falsche Rendite ist nicht richtige Endwertleistung.','Gemeinsame negative Bewegungen und Garantiegrenze falsch.','Keine richtige Grenzprüfung oder Vergleich.','Sicherheits- und Korrelationsschluss falsch, keine fehlende Information.']),
    (3,'Richtige Rechnung, fehlende Verlust-/Datengrenzen',
     '1. P I4%,1040; II-2%,980; III-8%,920. Q I0%,1000; II2%,1020; III-6%,940. 2. I und II sind gegensinnig und Gewichte entscheiden den Ausgleich. In III fallen beide und Q verliert wegen des größeren B-Gewichts weniger; trotzdem beweist schon das Aufteilen eine allgemeine Verlustgarantie. 3. P-8% und Q-6% sind kleiner als5% Verlust, daher erfüllen beide die Grenze. Q ist in III besser, also immer vorzuziehen. 4. Q ist generell sicher. Die Tabelle beweist dauerhafte negative Korrelation; Wahrscheinlichkeiten und tatsächliche weitere gemeinsame Kursdaten fehlen nicht und sind unwichtig.',
     [6,4,0,0],['Alle Renditen und Endwerte richtig.','Gegensinnigkeit/Gewichte2 und gemeinsame Fallbewegung2 richtig; Garantiegrenze fehlt.','Beide Grenzverletzungen falsch und kein begrenzter Gewinn-/Verlustvergleich.','Keine Sicherheits-/Korrelationsgrenze oder konkrete Informationslücke.']),
]
bad_records=[]
for index,label,answer,points,reasons in negative:
    assert len(points)==len(reasons)==4
    maxima=[s['points'] for s in goals[index]['examData']['scoring']['steps']]
    assert all(0<=p<=m for p,m in zip(points,maxima))
    total=sum(points)
    assert total<15, (label,total)
    bad_records.append({'goalId':goals[index]['id'],'labelDe':label,'kind':'complete-own-synthetic-QA-answer-not-learner-work','completeSubmissionDe':answer,'stepPoints':points,'stepReasonsDe':reasons,'total':total,'passingPoints':15,'result':'below-threshold'})

numeric_ref=write_new('actual-independent-decimal-calculations.json',numeric)
negative_ref=write_new('actual-eight-complete-independent-synthetic-counteranswers-and-rubric-scoring.json',bad_records)
decision_ref=write_new('actual-four-individual-whole-material-source-performance-and-rubric-decisions.json',decisions)
released=json.loads(json.dumps(goals))
for g in released:g['examData']['reviewStatus']='released'
for before,after in zip(goals,released):
    restored=json.loads(json.dumps(after));restored['examData']['reviewStatus']='draft'
    assert restored==before
release_ref=write_new('whole-four-KEEP-terminal-goals.only-machine-material-status-released.json',released)
before=json.loads((BASE/'actual-inputs-during-whole-read.before-calculation.guard.json').read_text())
after=[{'path':r['path'],'beforeSHA256':r['sha256'],'afterSHA256':sha(ROOT/r['path'])} for r in before['files']]
assert all(r['beforeSHA256']==r['afterSHA256'] for r in after)
after_ref=write_new('actual-inputs-after-independent-decision.guard.json',{'files':after,'allExact':True,'guardCapturedDuringWholeReadNotBeforeFirstRead':True})
receipt={
    'schemaVersion':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'author':'/root/economics_independent_continuation_a','reviewer':'/root','independent':True,
    'scope':'Four whole new profile route materials, seven actual current403 performance goals; not whole source/course/D/V/M7 acceptance',
    'authorDRAFT':{'path':str(source_path.relative_to(ROOT)),'sha256':sha(source_path)},
    'actualWholeMaterialReads':4,'actualWholeBilingualContractsRead':4,'actualCurrent403PerformanceGoalsRead':7,
    'actualWholeOfficialNormReads':8,'actualOriginalArticleSectionsRead':['model','Results','Discussion','Methods'],
    'articleSource':'https://www.nature.com/articles/srep06790.pdf',
    'articleBoundary':'308 valid participants; ten cents treated as ten units; first one-shot PD, no claim that subsequent Dictator Game did not occur',
    'primaryCacheAttemptFailure':'Separate urllib PDF-cache attempt produced non-PDF; current successful web PDF read remains the actual independent article source',
    'independentDecimalCalculations':len(numeric),'independentSyntheticCompleteCounteranswers':len(bad_records),
    'allSyntheticCounteranswersBelowPassingThreshold':True,'syntheticWorkIsNotLearnerEvidence':True,
    'individualDecisions':decision_ref,'calculationEvidence':numeric_ref,'counteranswerEvidence':negative_ref,
    'wholeFourReleasedMaterials':release_ref,'statusChange':'Only draft -> released for machine material quality',
    'wholeMaterialContentUnchanged':True,'allGuardedInputsExact':after_ref,
    'strictCurrent':300,'curricularAtomicDenominator':311,'netGain':0,'newAcademicFiveGateCompletions':0,'restoredStrictBindings':0,
    'liveIntegration':False,'descriptionDualRoundApproval':False,'wholeCourseApproval':False,'humanApprovalOrTrial':False,'M7Claim':False,
    'nextDe':'Autor übernimmt exakte vier maschinell geprüfte Materialkörper in eine neue Isolation; tatsächliche native Routen und betroffene Owner-Seiten prüfen, danach zwei unabhängige gezielte Beschreibungsnachsichten mit individueller Befundauflösung.'
}
write_new('actual-independent-four-whole-profile-route-materials-and-machine-release.receipt.json',receipt)
print(json.dumps({'KEEP':4,'currentGoals':7,'decimalChecks':len(numeric),'syntheticFullCounteranswers':len(bad_records),'wholeOtherAuthorInputsExact':len(after),'machineReleaseOnly':True,'strictNet':0}))
