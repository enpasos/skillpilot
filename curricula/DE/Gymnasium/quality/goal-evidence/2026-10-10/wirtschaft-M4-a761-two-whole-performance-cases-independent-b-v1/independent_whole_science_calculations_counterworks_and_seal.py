#!/usr/bin/env python3
import copy
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path

ROOT=Path('/home/enpasos/projects/skillpilot')
OUT=Path(__file__).resolve().parent
B=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-a761-real-FairTrade-inclusive-sustainability-two-cases-root-author-v1'
S=B/'two-real-price-and-individual-loan-assumptions-author-successor-v2'
def read(p):return json.loads(Path(p).read_text())
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def ref(p):return {'path':str(Path(p).relative_to(ROOT)),'sha256':sha(p)}
def dump(n,d):
 p=OUT/n;assert not p.exists();p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return ref(p)
handoff=read(S/'actual-a761-two-real-assumptions-four-DEEN-task-clauses.author-successor-handoff.json')
v1=read(ROOT/handoff['priorWholeDraft']['path']);v2=read(ROOT/handoff['wholeCandidate']['path'])
intake=read(B/'whole-two-actual-goals-P4-current-claims-and-original-material.author-intake.json')
assert sha(ROOT/handoff['priorWholeDraft']['path'])==handoff['priorWholeDraft']['sha256']
assert sha(ROOT/handoff['wholeCandidate']['path'])==handoff['wholeCandidate']['sha256']
for field, pairs in handoff['actualBilingualClauseChanges'].items():
 expected=v1['examData'][field]
 for old,new in pairs:
  assert expected.count(old)==1;expected=expected.replace(old,new,1)
 assert expected==v2['examData'][field]
reconstructed=copy.deepcopy(v2)
for f in ['taskContent','taskContentEn']:reconstructed['examData'][f]=v1['examData'][f]
assert reconstructed==v1
assert v2['requires']==v2['examData']['coveredGoalIds']==['e21158e7-3bc3-51f2-887f-9eb5a8dd6243','4fef149e-84c0-59af-b056-0a0bf97dbecd']
assert v2['examData']['scoring']['maxPoints']==30 and v2['examData']['scoring']['passingPoints']==18

# Each Decimal expression is independently computed here; author22 results
# are not taken as scientific acceptance or copied as our computation.
D=Decimal
calculations=[]
def check(name,expression,result,expected,boundary):
 assert result==D(expected),(name,str(result),expected)
 calculations.append({'id':name,'expression':expression,'actualDecimal':str(result),'expected':expected,'boundary':boundary})
check('A-baseline','100*500',D(100)*D(500),'50000','Whole cooperative sales; not income per farm')
check('A-contract-price-funds','40*600',D(40)*D(600),'24000','Actually paid600 explicitly fixed inV2')
check('A-restricted-premium','40*30',D(40)*D(30),'1200','Restricted community funds, not freely individual income')
check('A-other-sales','60*500',D(60)*D(500),'30000','Remaining60t, no guaranteed further contract sales')
check('A-total-funds','24000+1200+30000',D(24000)+D(1200)+D(30000),'55200','All funds including restricted premium')
check('A-after-certification','55200-2000',D(55200)-D(2000),'53200','Stated common cost deducted once')
check('A-individual-upper-available','53200-1200',D(53200)-D(1200),'52000','Upper available funds after stated costs/restricted premium; no equality or household profit assertion')
check('A-total-increment','53200-50000',D(53200)-D(50000),'3200','Contains1200 restricted premium')
check('A-individual-fund-increment','52000-50000',D(52000)-D(50000),'2000','No individual distribution promised')
check('A-old-importer-tariff','50000*.06',D(50000)*D('.06'),'3000','Importer liability; no promised producer pass-through')
check('A-new-importer-tariff','50000*0',D(50000)*D(0),'0','Unchanged assessment value')
check('A-importer-saving','3000-0',D(3000)-D(0),'3000','Not extra farm receipts without pass-through')
check('A-individual-interest','420*.12',D(420)*D('.12'),'50.40','Individual principal explicitly420 inV2, not inferred from programme mean')
check('A-good-after-interest','80-50.4',D(80)-D('50.4'),'29.6','Before financing principal repayment')
check('A-weak-after-interest','20-50.4',D(20)-D('50.4'),'-30.4','Negative before additional principal repayment')
check('A-total-yearend-claim','420+50.4',D(420)+D('50.4'),'470.4','Contract principal plus interest; additional liquidity source not given')
check('A-unsustainable-water-excess','2400-2000',D(2400)-D(2000),'400','Water limit exceeded')
check('A-alternative-water-margin','2000-1800',D(2000)-D(1800),'200','Under stated limit, not proof of every ecological effect')
check('A-recurring-margin','1600-1500',D(1600)-D(1500),'100','Before unprovided repair risks; access still must be tested')
check('B-baseline','60*450',D(60)*D(450),'27000','All40 farms, no equality assumed')
check('B-contract-price-funds','30*550',D(30)*D(550),'16500','Actually stated contract price')
check('B-restricted-premium','30*20',D(30)*D(20),'600','Restricted community use')
check('B-other-sales','30*450',D(30)*D(450),'13500','Remaining30t')
check('B-total-funds','16500+600+13500',D(16500)+D(600)+D(13500),'30600','Includes community premium')
check('B-after-shared-costs','30600-1200',D(30600)-D(1200),'29400','One stated deduction')
check('B-individual-upper-available','29400-600',D(29400)-D(600),'28800','No individual household earnings or equal distribution promised')
check('B-total-increment','29400-27000',D(29400)-D(27000),'2400','Contains600 restricted premium')
check('B-individual-fund-increment','28800-27000',D(28800)-D(27000),'1800','Aggregate available funds only')
check('B-old-importer-tariff','27000*.10',D(27000)*D('.10'),'2700','Importer, not producer')
check('B-new-importer-tariff','27000*.02',D(27000)*D('.02'),'540','Same assessment value/quantities')
check('B-importer-saving','2700-540',D(2700)-D(540),'2160','Cannot fund unpromised producer documentation by subtraction')
check('B-tempting-invalid-economic-net','2600-2160',D(2600)-D(2160),'440','Arithmetic valid; asserting producer netloss440 is invalid because actors and transfers differ')
check('B-unsustainable-water-excess','2200-1800',D(2200)-D(1800),'400','Stated water limit exceeded')
check('B-alternative-water-margin','1800-1550',D(1800)-D(1550),'250','Under limit, not automatic inclusion')
check('B-first-year-funds','1500+300',D(1500)+D(300),'1800','Yearone commitment only')
check('B-first-year-balance','1500+300-1800',D(1500)+D(300)-D(1800),'0','Yearone covered')
check('B-subsequent-deficit','1800-1500',D(1800)-D(1500),'300','Annual unfunded deficit, loan not recurring revenue')
check('V1-valid-higher-contract-total','40*610+40*30+60*500',D(40)*D(610)+D(40)*D(30)+D(60)*D(500),'55600','610 is permitted by V1 minimum600; V2 fixes actual600')
check('V1-valid-higher-contract-individual-funds','55600-2000-1200',D(55600)-D(2000)-D(1200),'52400','Exceeds V1 purported upper bound52000')
check('V1-programme-compatible-two-loan-mean','(400+440)/2',(D(400)+D(440))/D(2),'420','Programme mean does not fix individual amount')
check('V1-person400-interest','400*.12',D(400)*D('.12'),'48','Compatible with same average, differs from50.4')
check('V1-person440-interest','440*.12',D(440)*D('.12'),'52.8','Compatible with same average, differs from50.4')

v1ref=dump('actual-whole-V1-two-unbound-model-assumptions-scientific-REVISE.independent-b.json',{
 'reviewer':'/root/economics_m2_views_independent_b','decision':'REVISE V1 two actual model bindings',
 'wholeV1':v1,'wholeV1Input':ref(ROOT/handoff['priorWholeDraft']['path']),
 'findings':[
  {'id':'B-A761-PRICE-01','actualTask':'zu mindestens600EUR/t','actualSolution':'exakte55200Gesamtmittel und höchstens52000Individualmittel',
   'scientificReason':'A minimum does not by itself fix the paid price. A constant610 for the40t obeys the minimum and yields55600 total/52400 individual-available funds. The stated introductory unchanged-price convention does not uniquely choose600 from the minimum.',
   'wholeGoalOrPThresholdReduced':False},
  {'id':'B-A761-LOAN-02','actualTask':'Programme average420EUR, individual12% and harvest amounts, no individual principal',
   'scientificReason':'An average of two loans400/440 is420 while individual interest is48/52.8. The particular borrowers50.4 cannot follow from the programme mean. Program statistics are explicitly not everyone-outcome data.',
   'wholeGoalOrPThresholdReduced':False}],
 'wholeV1ScienceKEEP':False,'activeWrites':0,'otherWholeScienceReadingContinuedWithoutRestart':True})

good=[
 'Im FallA sind die Ausgangserlöse100×500=50000EUR. Der ausdrücklich gezahlte Vertragspreis gilt für40t:24000EUR, dazu1200EUR zweckgebundene Gemeinschaftsprämie und30000EUR für die übrigen60t. Insgesamt55200, nach2000Zertifizierung53200EUR, davon1200nicht frei an Einzelbetriebe verteilbar. Für individuelle Verteilung bleiben höchstens52000nach diesen angegebenen gemeinsamen Kosten; Produktionskosten und Verteilung jedes Haushalts sind nicht bekannt. Der Vertrag stabilisiert den Preis nur der vereinbarten40t; er garantiert weder zusätzliche Abnahme noch Zugang der35 derzeit ausgeschlossenen Betriebe.65 erfüllen die Bedingungen. Das gesonderte Abkommen erspart dem Importeur50000×6%=3000EUR Zoll, bei unveränderten Exportpreisen/Mengen keine nachgewiesene zusätzliche Einnahme der Kooperative. Es verändert formalen Zugang mit Herkunftsnachweis statt individueller Preis-/Prämienvereinbarung. Ich bevorzuge für die gegebene Menge den transparent nutzbaren Vertrag als begrenzten Baustein, verbinde ihn aber mit finanzierter Dokumentation/Schulung für bisher ausgeschlossene Betriebe und gemeinsamer nachvollziehbarer Prämienentscheidung. Die Finanzierung dieser Zugangshilfe und tatsächlicher Absatz müssen vor einer Ausweitung nachgewiesen werden; ein Abkommen kann ergänzend helfen, wenn seine Voraussetzungen und tatsächlicher Vorteil für Produzenten belegt sind.',
 'Die konkrete420EUR-Kreditnehmerin zahlt50,40EUR Jahreszins. Ihr Überschuss nach Zins beträgt29,60in guter und−30,40EUR in schwacher Ernte, jeweils vor zusätzlich zu finanzierender Kapitalrückzahlung. Rückzahlung94% und61% erstmaliger Kontozugang zeigen Kreditverlauf beziehungsweise finanziellen Zugang, keine kausale Einkommensverbesserung aller Frauen oder der Nichtteilnehmenden.2400m³ verletzen die2000-Grenze um400;1800m³ lassen200Reserve. Der sparsame Plan hat1600−1500=100EUR laufenden Überschuss, Reparaturen sind damit nicht automatisch dauerhaft abgesichert. Wassersparen wäre ein notwendiger Vorteil, aber kein ausreichender Gesamtbeleg:35 nicht zertifizierte Betriebe können Kosten/Schulung nicht tragen und werden bei Land- und Prämienentscheidungen nicht repräsentiert. Ich verlange tatsächliche Beteiligung auch der Betroffenen, finanzierte zugängliche Schulung sowie die Prüfung von Abendzeiten/barrierefreier Nutzung. Förderung des sparsamen Plans ist bedingt sinnvoll, wenn Wassergrenze, verbindliche Betriebsmittel und praktische Beteiligung zugleich belegt werden. Ein grüner Plan allein oder bloßer Kontozugang ersetzt diese gemeinsamen Bedingungen nicht.',
 'Im anderen FallB ergeben30×550+30×20+30×450=30600EUR Gesamtmittel, nach1200gemeinsamen Kosten29400. Davon sind600Gemeinschaftsprämie gebunden, höchstens28800verfügbar für individuelle Verteilung gegenüber27000Ausgangserlös. Das ist weder ein gleicher Betrag pro Betrieb noch gesichertes Nettoeinkommen. Nur30 haben Vertragszugang, zehn scheitern an Vorauszahlungen; Schulung kann dies nur mit tragbarer Finanzierung lösen. Beim Abkommen sinkt der Importeurszoll von2700auf540, also um2160EUR.2600Dokumentation sind Kosten einer anderen Gruppe; ohne zugesagte Weitergabe darf die Importeursersparnis nicht als ihre Finanzierung verrechnet werden. Standards und zwölf Ausschlüsse begrenzen den formalen Zugang. Die zehn und zwölf ausgeschlossenen Gruppen haben eine unbekannte Schnittmenge; ich zähle nicht automatisch22verschiedene Betriebe oder dieselben Personen. Eine gemeinsam finanzierte Vorschuss-/Dokumentationshilfe und nachprüfbare Schulung wäre ein möglicher Weg, sofern die Finanzierung und erreichter Zugang belegt sind. Ich würde den nutzbaren Gruppenvertrag begrenzt fortführen und Abkommensvorteile erst nach tatsächlicher Kosten-/Zugangsprüfung behaupten. Preis-/Prämienregel und zoll-/standardbezogener Zugang wirken verschieden, und beide können Menschen trotz eines formalen Angebots ausschließen.',
 'Der exportorientierte Plan braucht2200m³ bei1800verfügbar, also400zu viel. Die1550m³-Alternative bleibt250unter der Grenze. Mit1500Beiträgen und300zugesagtem Zuschuss ist ihr1800EUR-Betrieb nur im ersten Jahr gedeckt; anschließend fehlen jährlich300. Ein Darlehen erzeugt Rückzahlungsbedarf und ersetzt die fehlenden laufenden Einnahmen nicht. Für dauerhafte Förderung würde ich deshalb eine verbindliche Anschlussförderung oder belegte tragbare zusätzliche Mittel/echte Kosteneinsparungen verlangen, die Wassergrenze weiter überwachen und die Finanzierung offenlegen. Frauen mit Betreuungsverantwortung brauchen nutzbare Schulungszeiten und konkrete Betreuungshilfe; weit entfernte Betriebe erreichbare dezentrale Orte oder finanzierte Wege. Praktische Nutzung, Beteiligung an Entscheidungen, Tragbarkeit dieser Hilfen sowie Wasser-/Betriebs- und Verteilungsnachweise fehlen noch. Ich empfehle eine befristete Prüfung statt sofortiger Dauerzusage: Ressourceneinsparung ist real im Modell, inklusive und wirtschaftlich dauerhafte Nutzung bleibt bedingt.'
]
works=[]
def work(wid,answers,marks,absent,reason):
 assert len(answers)==4 and len(marks)==4
 raw=sum(marks);capped=min(raw,17) if absent else raw
 works.append({'workId':wid,'wholeFourTaskAnswersDe':[{'task':i+1,'wholeAnswer':a} for i,a in enumerate(answers)],
   'manualRubricMarks':marks,'actualRawSum':raw,'actualEssentialCap':17 if absent else None,
   'finalPoints':capped,'passingPoints':18,'outcome':'PASS' if capped>=18 else 'FAIL',
   'actualWhollyMissingPerformance':absent,'scientificManualScoringReason':reason,
   'reviewerAuthoredSyntheticNotLearnerEvidence':True,'productionCoachAutomaticGraderRun':False})
work('B-A761-whole-two-cases-correct',good,[9,6,9,6],[],
 'All four source-bound mechanisms, arithmetic, actual reach/distribution, financing/water and conditional judgments shown. No empirical or universal poverty/outcome claim.')
a=good.copy();a[0]='FallA:40×600+40×30+60×500=55200; nach2000Kosten53200, nach1200gebundener Prämie52000. Der Zoll fällt um3000beim Importeur. Das Fair-Trade-Siegel und Freihandel sind gut für Entwicklung, also würde ich beides allgemein fördern. Weitere Mechanismen, Abnahme-/Nutzungsgrenzen und konkrete betroffene Gruppen beurteile ich nicht.'
work('B-A761-A-trade-calculations-without-real-rule-development-judgment',a,[3,6,9,6],['CaseA whole e211 rule/reach/development evaluation'],
 'Correct numeric block3, but no actual price/premium versus agreement mechanism/reach/distribution judgment. Raw24 cannot replace the entirely missing CaseA essential trade performance; cap17 applies.')
a=good.copy();a[2]='FallB:30×550+30×20+30×450=30600; nach1200Kosten29400, abzüglich600Gemeinschaftsprämie28800.27000×10%=2700und×2%=540, also2160Zollersparnis. Zertifizierter Handel und Zollsenkung wirken beide entwicklungsfreundlich; ich würde sie deshalb ohne weitere Bedingungen ausweiten. Die Unterschiede tatsächlicher Regeln, Standards, Vorauszahlungen, Reichweite und Verteilung lasse ich offen.'
work('B-A761-B-trade-calculations-without-real-rule-development-judgment',a,[9,6,3,6],['CaseB whole e211 rule/reach/development evaluation'],
 'Only numeric block3 in the second trade variation; real other standard/exclusion mechanisms and conditional development judgment wholly absent. Raw24 is capped17 despite complete CaseA.')
a=good.copy();a[1]='Die Kreditrechnung ist420×12%=50,40; nachZins29,60in guter und−30,40in schwacher Ernte, bevor das Kapital zurückgezahlt wird.2400−2000=400über der Grenze,2000−1800=200Reserve.1600−1500=100laufender Überschuss. Deshalb ist der sparsame technische Plan wirtschaftlich und ökologisch günstiger. Über tatsächliche Teilnahme, Zugangsbarrieren und Entscheidungsvertretung treffe ich kein Urteil.'
work('B-A761-A-water-and-cash-without-any-real-inclusion-assessment',a,[9,3,9,6],['CaseA whole4fef actual access dimension'],
 'Interest calculation1 and water/operating-funds2 are creditable. No credit/access interpretation or actual inclusion correction/joint judgment. Raw27 cannot replace wholly absent real access assessment; cap17 applies.')
a=good.copy();a[3]='Für den sparsamen Plan ist1500+300=1800im ersten Jahr gedeckt. Danach fehlen300proJahr; ein Kredit löst das ohne neue laufende Mittel nicht. Ich würde Anschlussmittel verbindlich sichern und Frauen mit Betreuungsbedarf erreichbare Schulung mit Betreuungshilfe sowie entfernten Betrieben dezentrale Orte anbieten. Diese Maßnahmen sollten vor Dauerförderung auf praktische Nutzung geprüft werden. Die tatsächlichen Wasserbedarfe und die verfügbare Wassergrenze untersuche ich nicht.'
work('B-A761-B-finance-and-inclusion-without-water-boundary',a,[9,6,9,4],['CaseB whole4fef joint resource dimension'],
 'Recurring-finance2 and concrete inclusion/conditional judgment2 are shown; the required water boundary is wholly absent. Raw28 capped17; access alone is not joint inclusive sustainability.')
a=good.copy();a[3]='2200−1800=400m³überschreiten die verfügbare Wassergrenze;1550lassen250Reserve. Ich bevorzuge daher die sparsame Technik und möchte die Wassernutzung überwachen. Frauen mit Betreuungsaufgaben sollen passende Zeiten und Betreuungshilfe erhalten, entfernte Betriebe dezentrale Schulung. Vor Förderung muss deren tatsächliche praktische Nutzung gezeigt sein. Ob der jährliche Betrieb und die Hilfe in späteren Jahren finanziert werden können, untersuche ich nicht.'
work('B-A761-B-water-and-inclusion-without-recurring-funding',a,[9,6,9,4],['CaseB whole4fef joint recurring-funding dimension'],
 'Water2 and concrete inclusion2 are present; annual funding, expiring subsidy and credit boundary wholly omitted. Raw28 capped17 despite correct green/access partial topics.')
a=good.copy();a[0]=a[0].replace('gegenüber27000Ausgangserlös','gegenüber27000Ausgangserlös')+' Eine weitergehende Verteilung der zusätzlichen Mittel an einzelne Betriebe kann ich noch nicht festlegen.'
a[1]=a[1].replace('50,40EUR','50,00EUR').replace('29,60','30,00').replace('−30,40','−30,00')
a[2]=a[2].replace('Die zehn und zwölf ausgeschlossenen Gruppen haben eine unbekannte Schnittmenge; ich zähle nicht automatisch22verschiedene Betriebe oder dieselben Personen. ','')
a[3]=a[3].replace('bleibt250unter','bleibt200unter')
work('B-A761-two-real-core-performances-with-small-errors-and-secondary-gaps',a,[8,5,8,5],[],
 'Both cases contain actual rule/development and access/recurring-finance/resource judgments. A small interest error changes neither sign nor repayment distinction; a water-margin arithmetic slip preserves below-limit direction. One secondary overlap note is absent without a false disjointness claim. Partial points26, no blanket essential cap or perfect-answer quota.')
a=good.copy();a[0]+=' Alternativ könnte ich die Einführung bis zu gesicherter Schulungsfinanzierung verschieben; diese andere bedingte Auswahl wäre bei denselben Mechanismen ebenfalls vertretbar.'
a[3]=a[3].replace('Ich empfehle eine befristete Prüfung statt sofortiger Dauerzusage:', 'Ich würde zunächst nur die praktisch zugängliche Schulung prüfen und die Bewässerungsförderung bis zur verbindlichen jährlichen Finanzierung verschieben:')
work('B-A761-other-defensible-conditional-choice',a,[9,6,9,6],[],
 'Reasoned alternative decision retains all same real mechanisms/data and common sustainability/access conditions. No requirement to choose the author preferred intervention;30PASS.')
assert len(works)==8 and sum(w['outcome']=='FAIL' for w in works)==5
calc_ref=dump('actual-42-independent-Decimal-model-checks-and-V1-counterexamples.json',{
 'method':'Python Decimal exact arithmetic, completed assertions on42 independent calculations', 'checks':calculations,
 'allExpectedNumbersActuallyChecked':True,'checksCount':len(calculations),'actualLearnerOrCausalEvidence':False})
work_ref=dump('actual-eight-complete-own-two-case-counterworks-and-fair-partial-rubric-checks.json',{
 'manualRubricScope':'Whole existing30/18 rubric with actual stated essential missing-area limits, not an automatic coach or learner observation',
 'wholeCounterworks':works,'wholeWorkCount':8,'allFiveWhollyMissingCoreWorksFailAt17':True,
 'realImperfect26AndAlternative30Pass':True,'allFourTasksPresentInEveryCompleteWork':True})

# Source P contracts were actually read whole previously and again as part of
# this new body mapping, not changed or promoted. Capture current registry rows.
regpath=ROOT/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
entry=next(x for x in read(regpath)['subjects'] if x['subject']=='wirtschaftswissenschaften')
active=read(ROOT/entry['landscapePath']);gmap={g['id']:g for g in active['goals']};profile_rows=[]
for cp in entry['positiveEvidenceConfigPaths']:
 c=read(ROOT/cp)
 if not set(v2['requires']).intersection(c['scope']['goalIds']):continue
 for line in (ROOT/c['reviewPath']).read_text().splitlines():
  p=json.loads(line)
  if p.get('goalId') in v2['requires']:
   profile_rows.append({'wholeCurrentGoal':gmap[p['goalId']],'wholeP':p,'config':ref(ROOT/cp),'reviewFile':ref(ROOT/c['reviewPath'])})
assert len(profile_rows)==2
assert sum(len(x['wholeP']['profile']['applicationCaseBriefs']) for x in profile_rows)==4
whole_input_ref=dump('actual-whole-V1-V2-four-clause-delta-two-current-DEEN-goals-and-P4.independent-intake.json',{
 'wholeV1':v1,'wholeV2':v2,'wholeCurrentGoalAndPContexts':profile_rows,
 'inputV1':ref(ROOT/handoff['priorWholeDraft']['path']),'inputV2':ref(ROOT/handoff['wholeCandidate']['path']),
 'fourExactDEENTaskClausesOnly':handoff['actualBilingualClauseChanges'],
 'wholeV2OtherFieldsAllV1Exact':True,'noGoalProfileSourceStatusOrScopeClaimAltered':True})

mapping=[
 {'goalId':'e21158e7-3bc3-51f2-887f-9eb5a8dd6243','decision':'KEEP whole actual assessed performance',
  'actualCaseABinding':'Limited40t minimum-price/current paid600 + restricted premium/community costs versus importer origin-tariff option;65/35 reach, no pass-through/no unlimited abnahme, conditional supported documentation/participation judgment.',
  'actualCaseBBinding':'Changed30t price/premium and shared cost, advances10 versus standards/documentation12, importer tariff change versus producer costs and unknown overlap; reasoned actual access/distribution judgment.',
  'PCaseMatch':'cooperative-contract-and-agreement and standards-and-excluded-farms core distinctions materially present, with genuinely changed rule/cost/reach conditions; no exact-copy mandatory-task quota added.',
  'negativeEvidence':'Whole core absent in either case earns only real numeric partial marks and is capped17; three real good/imperfect/alternative works still pass.'},
 {'goalId':'4fef149e-84c0-59af-b056-0a0bf97dbecd','decision':'KEEP whole actual assessed performance',
  'actualCaseABinding':'Specific borrower with good/weak cashflow, real blocked participants/decision access, funded but untested access measures, water limit and recurring operating margin jointly assessed.',
  'actualCaseBBinding':'Different practical exclusion/caring/distance and water margin with first-year-only grant and recurring300gap, evidenced conditional adjustment rather than treating borrowing as operating revenue.',
  'PCaseMatch':'Real access/finance/resource/distribution joint assessment matches green-electricity-access and agricultural-training-and-water shared performance without requiring their literal scenario forms.',
  'negativeEvidence':'Correct water/finance without real inclusion, and correct inclusion without water or recurring funds, each remains below passing through actual essential cap17; small errors do not automatically cap.'}
]
receipt=dump('actual-whole-a761-two-cases-four-P-contracts-eight-own-works-and42-calculations-scientific-KEEP.independent-b.json',{
 'createdAt':datetime.now(timezone.utc).isoformat(),'reviewer':'/root/economics_m2_views_independent_b','author':'/root',
 'decision':'KEEP whole scientificV2 a761 candidate, machine material quality only','authorInput':ref(S/'actual-a761-two-real-assumptions-four-DEEN-task-clauses.author-successor-handoff.json'),
 'priorV1ActualScientificREVISE':v1ref,'wholeCurrentIntake':whole_input_ref,'actualIndependentCalculations':calc_ref,'actualOwnCompleteCounterworks':work_ref,
 'wholeActualTaskSolutionRubricDEENRead':True,'wholeCurrentGoalDEENContractsRead':2,'wholeCurrentPCasesRead':4,
 'actualTwoIndependentMaterialVariations':True,'individualWholePerformanceDecisions':mapping,
 'twoSpecificV1CounterfindingsResolved':'Actual paid600 and individual420 are stated in both task languages; minimum/unlimited-purchase and average/no-universal-income distinctions remain exact.',
 'wholeDEENTaskSolutionMeaningAndScoringEquivalent':True,
 'actualModelLimits':'Fictional cases only; no real African outcomes, current label/treaty, present law, guarantee of arbitrary sales, equal individual distribution or repayment-causes-poverty-reduction claim.',
 'creditPrincipalNotConfusedWithInterestOrIncome':True,'oneYearGrantNotRecurringFunds':True,
 'actualRestrictedPremiumNotFreeIncome':True,'importerSavingsNotAutomaticallyProducerReceipts':True,'unknownGroupOverlapPreserved':True,
 'allWholeRequiresAndCoveredGoalIdsRetained':True,'actualAB3EvaluationMetadataAppropriate':True,
 'noTaskOrEvidenceThresholdLowered':True,'maxPoints':30,'passingPoints':18,'essentialMissingAreaCap':17,
 'existingDraftStatusPreservedByReviewer':True,'proposedMachineReleaseOnlyAfterForeignKEEP':'Root may author bounded draft→released successor for the exact wholeV2 body; this is not human release.',
 'currentPositiveProfileStatuses':sorted({x['wholeP']['status'] for x in profile_rows}),
 'humanReviewReleaseTrialOrLearnerEvidence':False,'newSourceCountryCourseOrWholeM3M4M5M6M7Approval':False,
 'scopeAccessWholePrerequisiteClosureAndBookDOwnerBindingRemainParentIntegrationWork':True,
 'newStrictCurricularAtomicClosures':0,'restoredBindings':0,'activeWrites':0,'newImages':0})
inputs=[ROOT/handoff['priorWholeDraft']['path'],ROOT/handoff['wholeCandidate']['path'],S/'actual-a761-two-real-assumptions-four-DEEN-task-clauses.author-successor-handoff.json',B/'whole-two-actual-goals-P4-current-claims-and-original-material.author-intake.json']
ignored=subprocess.run(['git','check-ignore','--no-index','--stdin'],cwd=ROOT,text=True,input='\n'.join(str(p.relative_to(ROOT)) for p in inputs)+'\n',capture_output=True)
assert ignored.returncode==1 and not ignored.stdout.strip()
guard=dump('actual-whole-a761-input-guards-no-required-ignore-or-symlinks.json',{
 'actualInputs':[ref(p) for p in inputs],'requiredIgnoredInputCount':0,'checkIgnoreExitCode':ignored.returncode,
 'symlinkCount':sum(p.is_symlink() for p in inputs),'ordinaryPWholeStatusesPreserved':True,
 'actualCalculationCommandCompleted':True,'actualScientificDecisionComplete':True,'historicalV1Unchanged':True,
 'nativeWholeCurriculumOrBuildRun':False,'reason':'Root bundles actual native scope/source/LayerA/Book/D and protected floors at the qualified integration; body science itself cannot be replaced by a technical check.'})
manifest=dump('actual-a761-whole-independent-science-completed.manifest.json',{'files':[ref(p) for p in sorted(OUT.iterdir()) if p.is_file()]})
final=dump('actual-final-a761-real-two-case-whole-science-independent-b.handoff.receipt.json',{
 'decision':'KEEP exact wholeV2 body science only','receipt':receipt,'manifest':manifest,'guard':guard,
 'candidate':ref(ROOT/handoff['wholeCandidate']['path']),'previousV1REVISEUnchanged':v1ref,
 'actualFourEssentialCaseGoalPerformances':4,'actualOwnCounterworks':8,'actualOwnDecimalChecks':len(calculations),
 'releaseOrActiveCourseScopeClaim':False,'activeWrites':0})
print(json.dumps({'receipt':receipt,'manifest':manifest,'handoff':final,'calculations':len(calculations)}))
