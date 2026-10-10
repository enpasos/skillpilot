from pathlib import Path
import json,copy,re,hashlib
R=Path('/home/enpasos/projects/skillpilot');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-seven-policy-wage-skills-scenarios-one-contract-local-author-a-v1';V=O/'actual-two-self-audited-counterwork-corrections-and-new-single-party-absence-author-v2';V.mkdir(exist_ok=False)
oldp=O/'actual-twentyone-entire-own-policy-submissions-126-manual-task-specific-grades.AUTHOR-only.json';old=json.loads(oldp.read_text());out=copy.deepcopy(old)
bodies=json.loads((O/'one-real-independent-employer-position-boundary-and-observed-word-spacing-author-successor-v3/whole-seven-policy-DEEN.only-one-independent-two-party-boundary-and-word-spacing.DRAFT-author-v3.json').read_text());byid={b['id']:b for b in bodies}
def space(s):
 s=re.sub(r'(?<=[a-zäöüß])(?=[A-ZÄÖÜ])',' ',s);s=re.sub(r'(?<=[0-9])(?=[A-Za-zÄÖÜäöü])',' ',s);s=re.sub(r'(?<=[A-Za-zÄÖÜäöü])(?=[0-9])',' ',s);s=re.sub(r',(?=[A-Za-zÄÖÜäöü])',', ',s)
 return s
for w in out['wholeWorks']:
 for a in w['entireOwnSixAnswers']:a['answer']=space(a['answer'])
 for grade in w['actualManualIndividualGrades']:grade['individualRubricReason']=space(grade['individualRubricReason'])
changed=[]
def set_work(w,answers,marks,reasons,core):
 before=copy.deepcopy(w)
 w['entireOwnSixAnswers']=[{'task':i+1,'answer':a} for i,a in enumerate(answers)]
 w['actualManualIndividualGrades']=[{'task':i+1,'points':p,'maxPoints':4,'individualRubricReason':r} for i,(p,r) in enumerate(zip(marks,reasons))]
 w['rawPoints']=sum(marks);w['wholePerformanceAbsenceDecision']['actualAcrossAllSixAnswersAbsentOrConsistentlyWrong']=core;w['wholePerformanceAbsenceDecision']['capApplies']=True;w['finalPoints']=min(14,sum(marks));w['result']='FAIL'
 changed.append({'materialId':w['materialId'],'actualWholeOriginalAuthorCounterwork':before,'actualWholeCorrectedAuthorCounterwork':copy.deepcopy(w)})
w=next(w for w in out['wholeWorks'] if w['wholeCurrentContractId'].startswith('7d399') and w['actualOwnWholeSubmissionType'].startswith('ACTUAL_WHOLE'))
set_work(w,[
'Vier Minuten weniger sind 40 %, Fehler 8 %. Vollprüfung kostet 500, gezielte Prüfung 340. 160 Ersparnis sagt nichts über teure Fristfehler und fehlende Vergleichbarkeit; Zugang und Qualität sind eigenständige wirtschaftliche Folgen.',
'Ein Wiederholungsbutton ist vertraglich derselbe wie menschliche Beschwerde. Acht Fehler erfüllen die Richtigkeit und Q ist deshalb vollständig rechtlich freigegeben.',
'Für Q sprechen geringere Kosten, gegen Q wirtschaftliche Verluste aus Fristfehlern. Ich würde die mittleren Bearbeitungskosten und Folgeschäden bei ähnlicher Fallmischung messen und bei steigenden Kosten auf P wechseln. Ein Beschwerdeverfahren und Vertragsprüfung sind unnötig; der Probelauf beweist jede Rechtszulässigkeit.',
'Kunden suchen schneller, der 100-Euro-Anbieter zahlt für Klickvorteil. Gleiche Leistung für 80 statt 100 spart 20 beziehungsweise 20 %; nach Gebühr 2 bleiben 18 beim tatsächlichen Kauf. Nichtkäufer können Gebühren ohne Nutzen zahlen.',
'Beste Wahl ohne die Bezahlung zu nennen ist bereits Werbekennzeichnung. L und I bedeuten dasselbe Sortieren, daraus folgt komplette Rechtsfreigabe.',
'Häufige Käufer können L günstig nutzen; seltene Nutzer können bei I eine Gebühr ohne Kaufvorteil zahlen. Anbietererlöse und wirtschaftliche Angebotsvollständigkeit wären zu vergleichen. Ich wähle L allein nach Kosten, eine Anwendung der Modellregel lehne ich ab.'
],[4,0,3,4,0,3],[
'Zeit, Fehleranteil und beide Gesamtkosten richtig; zwei bedingte wirtschaftliche Folgen sind konkret benannt.',
'Menschliche Beschwerde, Qualitätsanforderung und Modellrechtsgrenze sind ausdrücklich falsch.',
'Wirtschaftliche Kosten-/Fehlerkriterien, konkrete Messung und Anpassung vorhanden; die rechtliche Schlussfolgerung und erforderliche Beschwerdeverbesserung fehlen.',
'Suchkosten, bezahlter Ranganreiz, Ersparnis und Nichtkäufergrenze richtig.',
'Kennzeichnungsregel, Sortierungsunterscheidung und umfassende Rechtsgrenze durchgehend falsch.',
'Beide Nutzergruppen, Anbieter und bedingtes Kostenurteil vorhanden; normative Abgrenzung fehlt vollständig.'
],'Die beiden bereitgestellten Modellrechtsmaßstäbe werden durchgehend falsch angewendet. Auch Aufgabe 3 enthält jetzt keine verdeckt richtige Anwendung des menschlichen Beschwerdevertrags; reine wirtschaftliche Kostenmessung ersetzt diese Leistung nicht.')
w=next(w for w in out['wholeWorks'] if w['wholeCurrentContractId'].startswith('b84') and w['actualOwnWholeSubmissionType'].startswith('ACTUAL_WHOLE'))
positive=next(x for x in out['wholeWorks'] if x['wholeCurrentContractId']==w['wholeCurrentContractId'] and x['actualOwnWholeSubmissionType']=='COMPLETE_REASONED_POSITIVE')
answers=[a['answer'] for a in positive['entireOwnSixAnswers']]
answers[4]='Fünf ersetzte ungeförderte Bewerbereinstellungen können andere Bewerber verdrängen. Bei ungeklärter Überlappung ist eine sichere Gesamtzusatzwirkung nicht berechenbar. 200.000 plus 50.000 ergibt 250.000; geteilt durch 40 sind das 6.250 beschreibend, ohne Betreuung 5.000. Die zehn bereits geplanten Zieljobs haben keinerlei Bedeutung für die Förderbewertung; ohnehin stattfindende Einstellungen sind grundsätzlich volle Förderzusatzwirkung.'
answers[5]='Ich finanziere einen 250.000-Pilot nur bei passender Zielberufsnachfrage und Kinderzugang. Haushaltsalternativen fehlen dann; dauerhafte Qualität, Vergleichsgruppen und Beschäftigung nach 12 und 24 Monaten prüfen. Mögliche Verdrängung anderer Bewerber muss untersucht werden. Bereits geplante ungeförderte Zieljobs sind für den Förderentscheid völlig irrelevant.'
set_work(w,answers,[4,4,4,4,2,3],[
'Alle Kurs-/Nachlauf-/Änderungswerte mit Lock-in und kausaler Grenze richtig.',
'Vier überlappende Ergebnisstufen, beschreibende Kostenquote und tatsächliche Motivations-/Trendselektion richtig.',
'Passung, Zugang, Kosten und Zeit sowie geeignetes Vergleichs-/Zuweisungsdesign richtig.',
'Beide Zugangsbarrieren mit Überlappung, Abschluss-/Jobstufen und Nachfragepassung richtig.',
'Verdrängung samt Überlappungsgrenze teilweise richtig; Budget und beschreibende Quoten richtig. Mitnahme anhand zehn ohnehin geplanten Jobs ausdrücklich falsch.',
'Finanzierbarer bedingter Pilot, Gegenentwicklung und Zeit-/Qualitätsdaten vorhanden; tatsächliche Mitnahmebewertung fehlt durchgehend.'
],'Eigenständige Bewertung der Mitnahme fehlt in allen sechs Antworten beziehungsweise wird in den beiden relevanten Stellen ausdrücklich falsch verworfen. Richtige Gegenentwicklung und Selektionsgrenze bleiben erhalten und können den anderen eigenständigen Kern nicht ersetzen.')
wage=next(w for w in out['wholeWorks'] if w['wholeCurrentContractId'].startswith('94264') and w['actualOwnWholeSubmissionType']=='COMPLETE_REASONED_POSITIVE');extra=copy.deepcopy(wage);extra['actualOwnWholeSubmissionType']='ADDITIONAL_SINGLE_DATED_EMPLOYER_POSITION_ABSENCE_COUNTERWORK';answers=[a['answer'] for a in wage['entireOwnSixAnswers']]
answers[0]='IG Metall fordert laut Mitteilung vom 23. September 2026, aktualisiert am 1. Oktober, fünf Prozent Entgelt, Beschäftigungssicherung und Gewinnbeteiligung bei erfolgreichen Betrieben. Sie vertritt Mitgliederinteressen. Das ist eine Forderung, kein abgeschlossener Tarifvertrag und kein neutraler Wirkungsnachweis. Die tatsächlich datierte Arbeitgeberquelle habe ich bewusst nicht ausgewertet.'
answers[3]='Ein einmaliger Bonus erhöht nicht dauerhaft die Entgelttabelle. Der erfolgreiche Betrieb kann aus guten Aufträgen und Produktivität Spielraum haben, der Krisenbetrieb hat schwache Aufträge. IG Metalls Beteiligungsargument passt eher zum Erfolg. Meine eigene Modellüberlegung ist, dass geringere Gewinne Investitionen beschränken können; dies ist ausdrücklich kein wiedergegebenes datiertes Arbeitgeberargument.'
set_work(extra,answers,[3,4,4,3,4,4],[
'Gewerkschaftsposition mit Datum und Interesse korrekt, Forderung/Befund/Abschluss getrennt. Tatsächliche Arbeitgeberposition fehlt: nur ein der beiden Interessenbeiträge vorhanden.',
'Beide Einkommen und Anteile vor/nach fünf Prozent sowie gemeinsamer Nenner und nationale Datenbegrenzung korrekt.',
'Eigenständige bedingte Wachstumskanäle und Beschäftigungsreaktionen mit Nachfrage-, Kosten- und Investitionsseite korrekt.',
'Bonus/dauerhafte Erhöhung und beide Betriebslagen sowie Gewerkschaftsargument richtig; datierter Arbeitgeberbeitrag fehlt. Eigene Kostenschlüsse zählen dafür nicht.',
'54/46 und beide Anteile sowie veränderlicher Nenner und fehlende Krisenbetriebsdaten richtig.',
'Bedingte Wachstums-/Beschäftigungs-/Verteilungsabwägung für unterschiedliche Betriebe und fehlende Daten richtig.'
],'Die tatsächlich datierte Arbeitgeberposition fehlt über beide Fälle vollständig. Eigenständige modellbasierte Kosten-/Investitionsschlüsse sind wirtschaftliche Leistung, keine Wiedergabe der gegebenen Quelle. Datierte Gewerkschaftsleistung bleibt vorhanden.')
out['wholeWorks'].append(extra);out['actualEntireOwnSubmissionCount']=22;out['actualIndividualManualGradeCount']=132;out['role']='ACTUAL_AUTHOR_SELF_CHECK_CORRECTED_SUCCESSOR_NO_FOREIGN_KEEP';out['wholeScientificBodyV3SHA256']='d5d974e325d31421d0392717351199c989db1e031247648c6dccabcc02ebfa36';out['honestHistory']={'wholeOriginal21Path':str(oldp.relative_to(R)),'wholeOriginal21SHA256':hashlib.sha256(oldp.read_bytes()).hexdigest(),'originalCount':21,'originalManualMarks':126,'ownAuditFinding':'Two original whole-absence descriptions overclaimed: a correct escalation elsewhere and a correct B counterfactual must count. Those author counterworks are preserved, not represented as passing whole-absence proofs. Two entire successor works now test the claimed independently absent performance directly.','actualTwoWholeCounterworksCorrected':changed[:2],'actualNewSinglePartyWholeCounterwork':changed[2],'actual12RegradedMarks':12,'actual6NewMarks':6,'remaining114OriginalMarksReused':114,'noNewMaterialPerformanceChange':True}
for work in out['wholeWorks']:
 for grade in work['actualManualIndividualGrades']:
  blocks=byid[work['materialId']]['examData']['solutionContent'].split('\n\n')
  grade['wholeActualOwnMaterialTaskSolutionAndRubricContext']=next(b for b in blocks if b.startswith(str(grade['task'])+'.'))
 assert len(work['entireOwnSixAnswers'])==len(work['actualManualIndividualGrades'])==6
 assert sum(g['points'] for g in work['actualManualIndividualGrades'])==work['rawPoints']
 assert work['finalPoints']==(min(14,work['rawPoints']) if work['wholePerformanceAbsenceDecision']['capApplies'] else work['rawPoints'])
 assert work['result']==('PASS' if work['finalPoints']>=15 else 'FAIL')
f=V/'actual-final-twentytwo-whole-author-works132-task-specific-marks.two-own-audit-remedies-and-party-counter.AUTHOR.json';f.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'path':str(f.relative_to(R)),'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'wholeWorks':22,'marks':132,'actualTwoOriginalAuthorProofsNotReusedAsWholeAbsencePASS':True}))
