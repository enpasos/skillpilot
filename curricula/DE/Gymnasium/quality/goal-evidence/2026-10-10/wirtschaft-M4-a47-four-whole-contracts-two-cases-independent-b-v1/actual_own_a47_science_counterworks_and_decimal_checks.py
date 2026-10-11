#!/usr/bin/env python3
"""Own complete fictional answers and manually reasoned grading, not learner evidence."""
from pathlib import Path
import json, hashlib, copy
from decimal import Decimal as D

ROOT=Path('/home/enpasos/projects/skillpilot')
OUT=Path(__file__).resolve().parent
AUTHOR=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-a47-two-real-ethics-CSR-rights-and-three-actor-cases-root-author-v1'
def save(name,value):
    p=OUT/name
    assert not p.exists(),name
    p.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
def bind(p):
    return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
g=json.loads((AUTHOR/'whole-a47-real-four-contract-two-case-DEEN.DRAFT-author.json').read_text())
context=json.loads((AUTHOR/'whole-four-current-DEEN-contracts-P8-and-required-contexts.exact-inputs.json').read_text())
assert g['examData']['scoring']['maxPoints']==30
assert g['examData']['scoring']['passingPoints']==18
assert [s['points'] for s in g['examData']['scoring']['steps']]==[7,8,8,7]
assert g['requires']==g['examData']['coveredGoalIds']==[x['id'] for x in context['goals']]
assert len(context['profiles'])==4 and sum(len(p['profile']['applicationCaseBriefs']) for p in context['profiles'])==8

checks=[]
def check(name,value,expected,unit):
    actual=value if isinstance(value,D) else D(value)
    wanted=D(expected)
    assert actual==wanted,(name,actual,wanted)
    checks.append({'name':name,'actual':str(actual),'expected':str(wanted),'unit':unit,'pass':True})
check('A complaints awareness count',D(18)/20,'0.9','fraction of the twenty anonymous interviewees only')
check('A remaining uninformed interviewees',20-18,'2','people')
check('A uninformed share',D(2)/20,'0.1','fraction of interviewees')
check('A stipulated model difference',12-9,'3','normative model score; not money or actual measured welfare')
check('A two option outlays differ',20000-10000,'10000','EUR; not a rights-compensation equivalence')
check('B stipulated model difference',15-11,'4','normative model score')
check('B employment difference',200-170,'30','stipulated export jobs')
check('B jobs relative loss under B2',D(30)/200,'0.15','relative to B1; no proof of basic-access entitlement')
check('B production growth',1500-1000,'500','units')
check('B production growth rate',D(1500-1000)/1000,'0.5','fraction')
check('B intensity difference',8-10,'-2','kg per unit')
check('B intensity fractional change',D(8-10)/10,'-0.2','fraction')
check('B baseline total',1000*10,'10000','kg')
check('B new total',1500*8,'12000','kg')
check('B absolute total difference',12000-10000,'2000','kg')
check('B total fractional change',D(12000-10000)/10000,'0.2','fraction')
check('Own conditional constant-total volume',D(10000)/8,'1250','units at the stipulated new intensity; own calculation, not a new case datum')
check('B volume above constant-total boundary',1500-1250,'250','units')
check('B whole fee refund',20*900,'18000','EUR')
check('B a single omitted fee leaves missing refund',18000-19*900,'900','EUR; own bounded sensitivity')
check('Whole rubric',7+8+8+7,'30','BE')
check('Passing share',D(18)/30,'0.6','fraction')
check('Missing entire ethics section leaves raw score',8+8+7,'23','BE before essential-performance limit')
check('Missing entire CSR section leaves raw score',7+8+7,'22','BE before essential-performance limit')
check('Missing entire rights section leaves raw score',7+8+7,'22','BE before essential-performance limit')
check('Missing entire actors section leaves raw score',7+8+8,'23','BE before essential-performance limit')

A=[
"Im vorgegebenen Folgenmodell rangiert A1 mit12 über A2 mit9. Es aggregiert bereits den erfassten Nutzen der Schulgruppe und die Schäden bzw. Folgen für Beschäftigte und Betriebe; ich addiere die Schulspende nicht nochmals als Nutzpunkte. Der Rechteansatz schließt A1 aus, weil zwei belegte blockierte Ausgänge die Beschäftigten schwer gefährden. A2 beseitigt diese konkrete Blockade und ist nach diesem Maßstab vorzuziehen. Die höhere Aggregatzahl und die nicht verrechenbare Schutzgrenze geraten in Spannung. Ich empfehle A2 mit Beschäftigtenschutz und getrennt gesuchter Schulfinanzierung. Die Zahlen sind normative Unterrichtsannahmen, keine Erhebung realen Gesamtnutzens. Eintrittswahrscheinlichkeit eines Schadens, Lohn-/Jobfolgen der Fristverlängerung und fortdauernde Ausgängesicherheit müssen noch geprüft werden.",
"A1 hat eine belegte positive Schulwirkung; das ist nicht wertlos. Es verändert jedoch weder gefährliche Einkaufstermine noch blockierte Ausgänge. Eine Sicherheitszusage ohne Umbau-/Beschwerdeplan ist kein Schutzbeweis. A2 verbindet Einkaufsfrist, Investition und unabhängigen Beschwerdezugang mit Kerngeschäftverantwortung. Die Nachbegehung belegt die zwei jetzt freien Ausgänge.18/20=90% der Befragten kennen den Zugang; zwei kennen ihn noch nicht. Daraus folgt weder dauerhafte Sicherheit für die Belegschaft noch Freiheit von Vergeltung. Aus Beschäftigtensicht braucht es auch für die zwei einen sicheren verständlichen Zugang. Ich fordere geschützte spätere Rückmeldungen und wiederholte unabhängige Prüfung, einschließlich der Reaktion auf Beschwerden. Die20.000EUR zeigen Aufwand, nicht automatisch Wirkung;10.000EUR Schulspende kompensieren keine unsichere Arbeit.",
"Die blockierten Fluchtwege verletzen den im Fall relevanten Maßstab sicherer und gesunder Arbeit bzw. Schutz von Leben und Gesundheit. Vor weiterer gefährlicher Arbeit müssen die Ausgänge frei sein und bleiben; nötigenfalls wird die gefährliche Produktion vorübergehend ausgesetzt. Beschwerden dürfen Namen nicht an Vorgesetzte liefern und müssen tatsächlich zugänglich sein. Konkrete Abhilfe ist der Umbau plus Schulung und nutzbarer Beschwerdeweg; sie muss für die derzeit nicht informierten Personen erreichbar gemacht werden. Wiederholte unabhängige Begehungen und geschützte Beschäftigteninterviews prüfen Offenhaltung und Vergeltung. Staatliche Untätigkeit und ein veröffentlichter Kodex beweisen keine tatsächliche Achtung. Einkaufsdruck kann Mitwirkung sein, aber der Fall bestimmt keine konkrete zivil- oder strafrechtliche Haftung.",
"Der Händler hat die Frist verkürzt und Vertragsentzug angedroht; er soll seine Einkaufsbedingungen und Finanzierung so ändern, dass er Schutz nicht unterläuft, und seine mögliche Mitwirkung an der Gefahr prüfen. Die Fabrik hat die Ausgänge blockiert, muss sie freimachen und Schutz sowie Abhilfe organisieren. Der Produktionsstaat soll auf Beschwerden hin kontrollieren und legitime öffentliche Schutz-/Abhilfeverfahren zugänglich machen. Die NGO kann geschützte Betroffenenvertretung, belastbare Informationen und Nachprüfung unterstützen; sie kann im Fall keine hoheitliche Schließung oder Entschädigung anordnen und darf Informanten nicht offenlegen. Ergänzend ändern Firmen Termine/Anlagen, Staat überprüft Schutz, NGO ermöglicht sichere Stimmen. Staatliches Versagen entlastet den Händler nicht; bloßer Vertragsabbruch könnte Beschäftigte schädigen und Risiken verlagern. Betroffene müssen die Wirksamkeit der Schritte rückmelden können."
]
B=[
"Das vorgegebene Folgenmodell wählt B1, weil15 größer als11 ist; ihm entsprechen200 statt170 Exportstellen. Die Werte repräsentieren im Modell bereits denselben bekannten Datensatz und beweisen keinen realen monetären Gesamtnutzen. Der Teilhabeansatz lehnt B1 ab, weil30 einkommensarme Haushalte die gesetzte Mindestwassermenge nicht erhalten; B2 sichert Mindestzugang, muss aber noch tatsächliche Mitsprache schaffen. Dreißig Mehrstellen ersetzen in diesem Modell keine Grundversorgung. Ich gewichte deren Schutz und wirkliche Teilhabe höher und empfehle B2 mit nachvollziehbarer Zuteilung. Jobqualität, betroffene Haushaltsgröße und langfristige Wasser-/Beschäftigungsfolgen bleiben offen. Beide Modelle könnten bei anderen ausdrücklich angenommenen Folgegewichten zu B2 gelangen; mit den gegebenen Werten besteht die beschriebene Spannung.",
"Die Emissionsintensität fällt von10 auf8kg je Einheit, also um2/10=20%. Die Menge wächst um50%. Absolut steigen die Emissionen von1000×10=10.000 auf1500×8=12.000kg, also um2000/10.000=20%. C1s absolute Senkungsaussage ist daher falsch, obwohl die Intensitätsverbesserung stimmt. Eine grüne Verpackung ersetzt keinen vollständigen Lieferkettennachweis. C2 dokumentiert Mengen/Stufen unabhängig und verändert Wasserzuteilung sowie Frist-/Preisgestaltung, wodurch Betroffenenbelange in Kerngeschäftentscheidungen eingehen. Unabhängigkeit stärkt die Daten, beweist aber nicht alle Wirkungen: Die Gemeinde kennt ihre Mitsprache noch nicht, Arbeitsfreiheit ist ebenfalls noch nicht belegt. Ich fordere geschützte Rückmeldungen, tatsächliche Wasserzugänge und die kontrollierte Umsetzung geänderter Einkaufsbedingungen; Umsetzungskosten und neue Risiken müssen getrennt nachvollzogen werden.",
"Schutz vor Zwang ist hier der passende Maßstab. Gebühren, gegen den Willen verwahrte Dokumente und faktisch verweigerter Ausstieg machen die formale Unterschrift zu keinem Freiwilligkeitsbeweis. Die Dokumente müssen sofort ohne Kosten zurückgegeben und tatsächliche Kündigungs-/Ausreisemöglichkeiten hergestellt werden.20×900=18.000EUR sind vollständig zurückzuerstatten. Geschützte Beschwerde, unabhängiger Nachweis jeder Rückzahlung und vertrauliche Nachbefragung zur Ausstiegsfreiheit/Vergeltung sind nötig. Die Vermittlung hat unmittelbare Handlungen gesetzt. Eine Weisung des Konzerns ist unbekannt: belegte Geschäftsverbindung und Frist-/Preiseinfluss sind nicht automatisch Nachweis einer eigenen Anordnung oder bestimmter gesetzlicher Haftung. Sein möglicher Beitrag ist aufzuklären, und er kann seinen Einfluss zur Beendigung und sicheren Abhilfe nutzen.",
"Der Konzern soll Einkaufsbedingungen ändern, Mitwirkung untersuchen und seinen belegten Einfluss für Schutz nutzen; Lieferant und Vermittlung sollen Dokumentenentzug/Exitblockade beenden und an Abhilfe mitwirken. Der Produktionsstaat kontrolliert Vermittlung und ermöglicht Gerichts-/Beschwerdezugang. Der Herkunftsstaat kann in seiner tatsächlichen Zuständigkeit Verfahren zugänglich machen; ich behaupte keine automatische Weltzuständigkeit oder schon bewiesene Haftung. Die NGO kann sichere Begleitung, Betroffenenvertretung und überprüfbare Informationen anbieten. Sie kann keine Pässe hoheitlich beschlagnahmen und ist nicht allein durch Präsenz Verursacherin. Firmen ändern konkrete Praxis, Staaten sichern zuständige Verfahren, NGO ermöglicht sichere Rückmeldung der Beschäftigten und Wassergemeinde. Grundversorgung mit Wasser und echte Mitsprache werden durch deren Aussagen/Prüfung kontrolliert; kein Akteur ersetzt die eigene Verantwortung des anderen."
]

works=[]
def work(identifier,case,answers,points,reasons,core,expected):
    assert len(answers)==len(points)==len(reasons)==4
    assert all(a.strip() for a in answers)
    assert all(0<=p<=maxp for p,maxp in zip(points,[7,8,8,7]))
    raw=sum(points);limited=raw if all(core) else min(raw,17)
    assert (limited>=18)==expected
    works.append({'id':identifier,'case':case,'wholeFourQuestionAnswer':{str(i+1):a for i,a in enumerate(answers)},
      'fourActualManualRubricDecisions':[{'question':i+1,'awardedPoints':p,'maximumPoints':mx,'actualReason':r} for i,(p,mx,r) in enumerate(zip(points,[7,8,8,7],reasons))],
      'actualEssentialPerformanceShown':dict(zip(['two_models_applied','evidence_based_CSR','specific_rights_protection_remedy_followup','all_three_actors_reasoned'],core)),
      'rawPoints':raw,'essentialPerformanceCapApplied':not all(core),'actualFinalPoints':limited,'expectedPass':expected,'pass':limited>=18,
      'actualSyntheticCounterworkOnly':True,'realLearnerEvidence':False})

goodA=['Beide tatsächlichen Modellkriterien mit Betroffenen, Spannung, begründeter Empfehlung und normativer Zahlenbegrenzung korrekt.','Kerngeschäft/Spende, bestätigte Wirkung, Nachweisgrenzen und konkreter Zugang aller Betroffenen beurteilt.','Recht/Befund, unmittelbarer Schutz, sichere Beschwerden/Abhilfe und unabhängige dauerhafte Nachprüfung mit Haftungsgrenze korrekt.','Beitrag/Einfluss aller Firmen, Staat und NGO mit konkreten Grenzen und ergänzender Handlungsfolge beurteilt.']
goodB=['Folgen/Teilhabekriterium wirklich angewandt; Grundversorgung/Arbeitsstellen, Spannung, normative Gewichtung und offene Folgen nachvollzogen.','Intensität und absolute Wirkung getrennt korrekt; unabhängige Umsetzung, Mitsprache-/Arbeitsfreiheitsgrenzen und Betroffene beurteilt.','Zwangsbefund, sofortiger Ausstieg, ganze Rückzahlung, sichere Nachprüfung und unbekannte Anordnung getrennt.','Konzerne/Lieferant/Vermittlung, beide Staaten und NGO konkret mit Zuständigkeit/Grenzen und Betroffenenrückmeldung beurteilt.']
work('A-full-own','A',A,[7,8,8,7],goodA,[True]*4,True)
work('B-full-own','B',B,[7,8,8,7],goodB,[True]*4,True)

n=copy.deepcopy(A);n[0]='Folgenmodell, Rechteansatz und Globalisierung sind die richtigen Wörter. Meine Wahl ist A1. Mehr begründe ich dazu nicht.'
work('A-labels-only-no-two-model-application','A',n,[0,8,8,7],['Wörter und unbezogene Wahl wenden kein Kriterium tatsächlich auf Optionen/Betroffene an.']+goodA[1:],[False,True,True,True],False)
n=copy.deepcopy(B);n[0]='Nach dem Folgenmodell ist B1 mit15 statt11 vorzuziehen. Es gibt200 statt170 Stellen. Ein anderes Modell heißt Teilhabe. Ich prüfe dessen Kriterium hier nicht und folgere aus der hohen Zahl automatisch moralische Richtigkeit.'
work('B-one-model-only-second-model-unapplied','B',n,[2,8,8,7],['Folgenvergleich2BE; zweites angewandtes Kriterium, wirkliche Spannung und begründete Gewichtung fehlen.']+goodB[1:],[False,True,True,True],False)
n=copy.deepcopy(A);n[1]='CSR wird im Material erwähnt. Beide Firmen machen etwas Gutes. Ein genauer Wirkungsvergleich ist meiner Meinung nach unnötig.'
work('A-no-evidence-based-CSR','A',n,[7,0,8,7],[goodA[0],'Kein Kerngeschäft-/Spendenvergleich, Wirkungsnachweis, Betroffenenurteil oder Nachweisgrenze.']+goodA[2:],[True,False,True,True],False)
n=copy.deepcopy(B);n[1]='10 auf8kg bedeutet minus20% je Einheit. Die grüne Verpackung beweist damit vollständige Nachhaltigkeit. Gesamtmengen, unabhängige Prüfung und die Stimmen der Wassergemeinde sind irrelevant; C1 ist voll wirksam.'
work('B-intensity-and-green-brand-no-CSR-performance','B',n,[7,1,8,7],[goodB[0],'Nur Intensitätsrechnung1BE. Absolute Gesamtwirkung wird nicht gerechnet; behauptete vollständige Wirkung ist falsch, keine tatsächliche CSR-Nachweisbewertung.']+goodB[2:],[True,False,True,True],False)
n=copy.deepcopy(A);n[2]='Die blockierten Ausgänge betreffen Arbeitsschutz und Gesundheit. Der veröffentlichte Sicherheitskodex garantiert jedoch dauerhaft sichere Arbeit. Beschwerden sollen die Namen an Vorgesetzte geben, dann erledigt sich alles. Wiederholte Prüfungen sind überflüssig.'
work('A-specific-standard-but-no-real-protection-remedy','A',n,[7,8,2,7],goodA[:2]+['Passender Standard/Befund2BE; unmittelbare Abhilfe fehlt, Beschwerdeweg gefährdet Betroffene und Nachprüfung wird verneint.',goodA[3]],[True,True,False,True],False)
n=copy.deepcopy(B);n[2]='Die Vermittlung kann18.000EUR als freiwilliges Geschenk zurückgeben. Weil alle den Vertrag unterschrieben haben, gibt es keinen Zwang. Die Dokumente dürfen deshalb bleiben und einen freien Ausstieg braucht es nicht. Eine Nachprüfung ist unnötig.'
work('B-signature-and-refund-without-actual-rights-protection','B',n,[7,8,1,7],goodB[:2]+['Summe ist richtig, Abhilfe als Geschenk jedoch unzureichend1BE. Tatsächlicher Zwangs-/Exitbefund wird bestritten, Schutz/Ausstieg und Nachprüfung fehlen.',goodB[3]],[True,True,False,True],False)
n=copy.deepcopy(A);n[3]='Der Händler soll Frist und Preise ändern, seinen Beitrag prüfen und Finanzierung leisten; der blockierende Zulieferer muss die Ausgänge freimachen. Der Produktionsstaat soll tatsächlich kontrollieren und legitime Schutz-/Beschwerdeverfahren eröffnen. Ich bewerte die NGO nicht, weil Unternehmen und Staat schon genannt sind.'
work('A-two-actor-groups-NGO-entirely-omitted','A',n,[7,8,8,4],goodA[:3]+['Firmen2+Staat2. NGO-Verantwortung/Grenze fehlt vollständig; eine ganze Bewertung aller drei Gruppen wird nicht erreicht.'],[True,True,True,False],False)
n=copy.deepcopy(B);n[3]='Konzern und Lieferant sollen Einkaufsbedingungen ändern und den Exit ermöglichen. Der Herkunftsstaat darf überall auf der Welt ohne Zuständigkeitsprüfung richten. Die NGO ist die zuständige Polizei und muss Pässe beschlagnahmen; weil sie anwesend ist, hat sie die Verletzung verursacht.'
work('B-NGO-as-public-authority-and-unbounded-state-power','B',n,[7,8,8,2],goodB[:3]+['Unternehmensbeitrag/Handlung2. Staatszuständigkeit und NGO-Nachweis-/Vertretungsrolle werden grundlegend falsch ersetzt.'],[True,True,True,False],False)

partialA=[
'Nach dem Folgenmodell gewinnt A1 mit12 statt9; Schulen profitieren, aber Beschäftigte tragen Gefahren. Der Rechteansatz schützt sie vor den blockierten Ausgängen und zieht deshalb A2 vor. Das ist ein Konflikt von Summe und Schutzgrenze. Ich möchte die gefährliche Produktion sofort aussetzen, mit Finanzierung der Reparatur und begrenzter Lohnsicherung durch die beteiligten Firmen; eine separate Schulfinanzierung bleibt gesucht. Wie sich Jobs und Kosten dabei wirklich ändern, weiß ich noch nicht.',
'A1 hilft der Schule, ändert aber das gefährliche Kerngeschäft nicht. A2 ändert Frist und Ausgänge. Die unabhängige Begehung zeigt die aktuelle Verbesserung.18/20 seien80%; nicht alle Beschäftigten kennen den Zugang. Ich brauche spätere sichere Rückmeldungen und erneute Prüfung; künftige Sicherheit folgt noch nicht.',
'Blockierte Ausgänge betreffen Gesundheit und sichere Arbeit. Freimachen und gefährliche Arbeit bis dahin aussetzen; Beschwerden vertraulich zugänglich machen und die Wirkung später unabhängig prüfen. Ob Vergeltung auftritt, bleibt unklar.',
'Der Händler soll den eigenen Einkaufsdruck reduzieren und Abhilfe finanzieren; die Fabrik muss konkrete Sicherheit herstellen. Der Staat kontrolliert im Land. Die NGO kann sichere Stimmen sammeln und prüfbare Berichte liefern, nicht hoheitlich schließen. Zusammen bearbeiten sie Praxis, Kontrolle und Rückmeldung; die Firmen werden durch fehlende Kontrolle nicht entlastet.'
]
work('A-imperfect-whole-and-reasoned-stop-alternative','A',partialA,[6,4,5,5],[
'Beide Modelle4,Spannung1,begründete alternative Schutzempfehlung1; normative Messgrenze unvollständig.',
'Kerngeschäft2,aktueller Nachweis1,Betroffenen-/Zukunftsgrenze1.80%Rechenfehler und knappe Wirkungsvergleichsausführung kosten Teilpunkte; CSR-Kern bleibt tatsächlich gezeigt.',
'Standard/Befund2,unmittelbarer Schutz1,sichere Beschwerden1,spätere Nachprüfung1; konkrete Umsetzungsdetails knapp.',
'Unternehmensbeitrag2,Staat1,NGO1,ergänzende Grenzen1; alle Gruppen konkret, aber Durchführung knapp.'
],[True]*4,True)
partialB=[
'B1 liefert15 statt11Nutzpunkte und30Mehrstellen. Das Teilhabemodell bevorzugt B2 wegen Mindestwasser für die30armen Haushalte. Eine höhere Summe reicht ihm nicht. Ich gewichte den Zugang höher; die Mitsprache muss noch wirklich organisiert werden und die Jobqualität ist offen.',
'Die Intensität fällt20%; absolut10.000 auf12.000kg, also wächst die Menge trotz grüner Werbung. C2 hat unabhängigere Daten und verändert Einkauf und Wasserzugang. Die Gemeinde kennt Mitsprache noch nicht; das muss geklärt werden. Wie teuer die Umsetzung ist, weiß ich nicht.',
'Einbehaltene Dokumente und verweigerter Exit sind Zwangsrisiken trotz Unterschrift. Dokumente zurück, tatsächlichen Ausstieg ermöglichen, sichere Beschwerden. Die Gebühren sollen vollständig zurückgegeben werden; ich rechne20×900=19.000EUR. Unabhängige Gespräche sollen Schutz und Rückzahlung später prüfen; Konzernanordnung ist unbekannt.',
'Der Konzern soll Fristen ändern und Mitwirkung klären, Vermittlung/Lieferant den Exit freigeben. Produktionsstaat kontrolliert und Heimatstaat eröffnet zuständige Verfahren, nicht überall automatisch. NGO begleitet und dokumentiert vertraulich, ist keine Polizei. Beschäftigte und Wassergemeinde müssen die Wirkung rückmelden.'
]
work('B-imperfect-whole-not-perfect-score-quota','B',partialB,[5,5,5,5],[
'Folgen2,angewandter Teilhabegrund1,Spannung1,Gewichtung/Grenze1.Grundlegende Anwendung beider Modelle vorhanden.',
'Richtige totals/Intensität1,Umsetzungsvergleich2,Nachweis-/Mitsprachegrenze1,fehlende Information1; absolute prozentuale Änderung und konkrete Betroffenenkontrolle fehlen.',
'Standard/Risiko2,Exit/Schutz1,ganze Rückerstattungsabsicht mit kleiner falscher Summe1,Nachprüfung/Anordnungsgrenze1. Rechtekern ist trotz Teilfehlern gezeigt.',
'Unternehmen2,Staat1,NGO1,Betroffenen-/Zuständigkeitsgrenze1; sämtliche tatsächlichen Gruppen bewertet.'
],[True]*4,True)

assert len(works)==12 and sum(len(w['fourActualManualRubricDecisions']) for w in works)==48
assert sum(w['pass'] for w in works)==4
assert all(w['actualFinalPoints']<=17 for w in works if not w['pass'])
save('actual-twenty-six-own-Decimal-calculations-and-dimension-limits.independent-b.json',{'checks':checks,'actualChecks':len(checks),'failures':0,'noCalculationTreatsNormativeScoresAsActualRightsValues':True,'authorCheckResultsNotUsedAsIndependentEvidence':True})
save('actual-twelve-whole-own-answers-fortyeight-manual-ratings.independent-b.json',{'bodyInput':bind(AUTHOR/'whole-a47-real-four-contract-two-case-DEEN.DRAFT-author.json'),'wholeOwnAnswers':works,'actualManualRubricDecisions':48,'actualPasses':4,'actualFails':8,'allEightCoreMissingCounterworksFailAt17':True,'bothActuallyImperfectWholeAnswersPassAt20':True,'noRealLearnerOrPrivateData':True,'authorWholeWorksWereNotCopied':True})
print(json.dumps({'decimalChecks':len(checks),'wholeOwnAnswers':len(works),'manualQuestionRatings':48,'passes':4,'fails':8,'imperfectActualPoints':[w['actualFinalPoints'] for w in works if 'imperfect' in w['id']]}))
