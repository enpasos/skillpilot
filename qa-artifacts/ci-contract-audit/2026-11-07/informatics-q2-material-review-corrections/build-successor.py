#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Finite content-only successor of the independently reviewed 424d79 draft."""
from pathlib import Path
import json,copy,hashlib,re,shutil
ROOT=Path('/home/enpasos/projects/skillpilot')
BASE=ROOT/'qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-material-implementation-candidate/materials'
REVIEW=ROOT/'qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-full-material-independent-review'
OUT=Path(__file__).parent
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(BASE/'native-examData.json')=='424d79c1c84ff7f0973c312756730008428a23d5bdfd84ab866287352c537364'
ORIG=json.load(open(BASE/'casebank.json'));BANK=copy.deepcopy(ORIG)
OLDNATIVE=json.load(open(BASE/'native-examData.json'));NATIVE=copy.deepcopy(OLDNATIVE)
ASSEMBLIES=json.load(open(BASE/'exam-assemblies.json'))
CHANGES=[]
def change(case,field,value,reason):
 old=BANK[case][field]
 if old==value:return
 BANK[case][field]=value
 CHANGES.append({'caseId':case,'field':field,'finding':reason,'oldSha256':hashlib.sha256(json.dumps(old,ensure_ascii=False,sort_keys=True).encode()).hexdigest(),'newSha256':hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True).encode()).hexdigest()})
def criterion(case,number,value,reason):
 criteria=copy.deepcopy(BANK[case]['essentialCriteria']);criteria[number-1]['description']=value;change(case,'essentialCriteria',criteria,reason)
for prefix,person,contact,view,offer,idcol in [
 ('C','Person','Kontakt','KursAuskunft','Kurs','kid'),
 ('B','Leser','Leserkontakt','MedienAuskunft','Medium','mid'),
 ('F','Gast','Gastkontakt','ProgrammAuskunft','Auftritt','auftritt_id')]:
 case=prefix+'-T21'
 task=ORIG[case]['task']+' Jede Teilfrage beginnt selbstständig mit M5-Anfangsrechten; ein REVOKE aus einer anderen Aufgabe gilt hier nicht. Geben Sie an, welches vorhandene Basisrecht nach dem GRANT bestehen bleibt, und formulieren Sie den gesonderten REVOKE-Befehl, der die Sollpolitik herstellt. Unterscheiden Sie die Wirkung des einzelnen GRANT vom gesamten Rechtezustand.'
 change(case,'task',task,'FMR-01')
 old=ORIG[case]['solution'];start=old.index('GRANT ist DCL,');end=old.index(' Jeder Befehl startet',start)
 replacement=f'''GRANT ist DCL und fügt SELECT auf {view} hinzu; es entzieht kein bestehendes Recht. Nach diesem Einzelbefehl besitzt auskunft weiterhin das in M5 vorgegebene SELECT auf {person} UND neu SELECT auf {view}. Direkter Zugriff auf {person} bleibt daher erlaubt; neue Schreibrechte oder Rechte auf {contact} entstehen nicht. Die Sollpolitik mit ausschließlich öffentlicher Sicht gilt erst nach dem selbstständig angegebenen Entzug:
```sql
REVOKE SELECT ON {person} FROM auskunft;
```
Danach ist SELECT auf {view} erlaubt, direkter SELECT auf {person} und {contact} sowie UPDATE auf {offer} sind verboten. Der Entzug wird nicht aus einer anderen Aufgabe übernommen.'''
 change(case,'solution',old[:start]+replacement+old[end:],'FMR-01')
 criterion(case,2,'DML-/DDL-Wirkung und DCL-Reichweite korrekt klassifiziert; vorhandenes Basisrecht nach GRANT erkannt und mit einem gesonderten REVOKE passend zur Sollpolitik entzogen.','FMR-01')
 case=prefix+'-T04'
 criterion(case,2,'Sortierung und vollständige Ergebnismenge fachlich richtig bestimmt. Bei vollständig korrekter eigener SQL-Abfrage einschließlich aller Joins, Filter und ORDER BY sowie nachweislich richtigem Verständnis aller Zeilen und ihrer Ordnung kostet ein isolierter nebensächlicher Preis-Abschreibfehler (z.B.39 statt40) weder dieses Kriterium noch C1 einen Punkt; beide bleiben1. Ein tatsächlicher Join-,Filter-,Sortier- oder Mengenfehler bzw. fehlender fachlicher Nachweis erhält für das betroffene Kriterium0.','FMR-02')
 change(case,'solution',BANK[case]['solution']+' Bewertungsbeispiel: Ist die eigene SQL-Abfrage vollständig korrekt und sind alle vier Zeilen samt Ordnung verstanden, wird ein allein beim manuellen Abschreiben zu39 veränderter erster Preis als nebensächlicher Übertragungsfehler markiert; C1=1 und C2=1. Fehlt ein Join, ist ein Filter oder die Sortierung fachlich falsch oder wird die Ergebnismenge nicht verstanden, bleibt das jeweils fehlende wesentliche Kriterium0.','FMR-02')
# Exactly preserve Python text and indentation; put prose outside the fence.
for case,marker in [('C-T07','Bei30:'),('C-T20','execute bindet')]:
 old=ORIG[case]['solution'];code,prose=old.split(marker,1)
 change(case,'solution','```python\n'+code.rstrip('\n')+'\n```\n\n'+marker+prose,'FMR-03')
criterion('F-T01',1,'Identifizierte Entitäten und wiederholbarer Auftrittsauftrag mit eigener Identität fachlich korrekt modelliert.','FMR-04')
criterion('F-T01',2,'Alle drei Beziehungen und Optionalität der tatsächlichen Endzeit mit begründeten min/max korrekt; Zusatzregel höchstens eines offenen Auftrittsauftrags je Produktion erkannt.','FMR-04')
criterion('F-T02',2,'Fremdschlüsselrichtungen/Obligatorik und optionale tatsächliche Endzeit begründet; wiederholte Auftrittsaufträge bleiben möglich.','FMR-04')
# FMR-05: only concrete grammar/alias clarification; preserve every schema identifier,FD and row.
for prefix,noun,plural,offer,offer_acc,booking,role,domain in [
 ('B','Leser','Leser','Medium','das zum Termin gehörige Medium','Ausleihe','leitenden Leser','Bibliotheks'),
 ('F','Gast','Gäste','Auftritt','den zum Termin gehörigen Auftritt','Reservierung','leitenden Gast','Festival')]:
 for case in [k for k in BANK if k.startswith(prefix+'-')]:
  task=BANK[case]['task'].replace('Leseren','Lesern').replace('Gasten','Gästen')
  if task!=BANK[case]['task']:change(case,'task',task,'FMR-05')
  mats=copy.deepcopy(BANK[case]['materialBlocks']);changed=False
  for key,text in list(mats.items()):
   if key=='COMPLEX':
    singular='Ein Leser' if prefix=='B' else 'Ein Gast'
    owner='desselben Lesers' if prefix=='B' else 'desselben Gastes'
    text=f'''M9 – Zusätzlicher komplexer ER-Fall zu M2: Jedes {offer} besitzt1..n Termine(terminId global eindeutig,{"mid" if prefix=="B" else "auftritt_id"}). {singular} darf0..n Termine besuchen, ein Termin0..n {plural}; höchstens ein Teilnahme-Satz(pid,terminId) ist zulässig. Jedes {offer} hat genau einen {role}; {"ein Leser" if prefix=="B" else "ein Gast"} kann0..n {"Medien" if prefix=="B" else "Auftritte"} leiten. Leitung und Besuch sind unabhängige Rollen. Teilnahme ist nur bei aktiver {booking} {owner} für {offer_acc} zulässig. Termine={{(T10,10),(T20,20),(T30,30),(T40,40),(T50,50)}}; Leitung={{(10,1),(20,4),(30,1),(40,3),(50,5)}}. Diese Regel erzwingt keine {booking} für bloßes Leiten.'''
   if key=='DOMAIN':text=text.replace('Ausleih-/Ausleihservice','Ausleihservice').replace('Ausleih-/Reservierungsservice','Reservierungsservice')
   if key=='NORM':
    explanation='Im historischen Export heißt die Liste technisch buchungen; gemeint sind '+('Ausleihen' if prefix=='B' else 'Reservierungen')+'. teamName bezeichnet hier '+('den Verlagsnamen' if prefix=='B' else 'den Bühnennamen')+'. Diese Altfeldnamen werden unverändert für die angegebenen FDs verwendet.'
    text=text.replace('M4 – Normalisierungsfall mit wiederholten Gruppen.','M4 – Eigenständiger historischer Normalisierungsfall mit wiederholten Gruppen. '+explanation)
   if key=='BCNF':text=text.replace('M10 – Zusätzliches atomwertiges Schema','M10 – Allgemeiner Schemafall, unabhängig vom '+domain+'szenario. Zusätzliches atomwertiges Schema').replace('Eine Leser kann','Eine studierende Person kann').replace('Eine Gast kann','Eine studierende Person kann')
   if prefix=='F' and key=='COMPLEX':text=text.replace('Jedes Auftritt','Jeder Auftritt')
   if text!=mats[key]:mats[key]=text;changed=True
  if changed:change(case,'materialBlocks',mats,'FMR-05')
  if case.endswith('-T03'):
   text=BANK[case]['solution'].replace('Bens einziger Klangbuchbuchung','Bens einziger Ausleihe des Klangbuchs').replace('Bens einziger Nachtklangbuchung','Bens einziger Reservierung für Nachtklang')
   if text!=BANK[case]['solution']:change(case,'solution',text,'FMR-05')
  if case.endswith('-T24'):
   text=BANK[case]['solution'].replace('Terminkurses','zugeordneten Mediums' if prefix=='B' else 'zugeordneten Auftritts').replace('Teilnehmerbuchung','eigene Ausleihe' if prefix=='B' else 'eigene Reservierung')
   if text!=BANK[case]['solution']:change(case,'solution',text,'FMR-05')
OLDPOLICY='Einzelne harmlose Abschreib-/Rechenfehler bei sonst eindeutig belegter Kompetenz sind ohne Doppelabzug zu behandeln;sie dürfen keine fehlenden Joins,Gruppierung,Modellidentitäten oder Sicherheitsgrenzen kaschieren.'
NEWPOLICY='''Ein nachweislich isolierter nebensächlicher Abschreib- oder Rechenfehler kostet kein wesentliches Kriterium, wenn die vollständige fachliche Leistung im selben Beitrag anderweitig eindeutig belegt ist. Das gilt konsistent für alle Ergebnis- und Vergleichskriterien. Beispiel T04: Eine vollständig korrekte eigene SQL-Abfrage einschließlich aller Joins, Filter und ORDER BY sowie richtiges Verständnis aller Zeilen und ihrer Ordnung belegen beide Kriterien auch dann, wenn nur ein Preis beim manuellen Abschreiben39 statt40 lautet; C1=1 und C2=1. Der nebensächliche Fehler kann ohne Pflichtpunktabzug als Feedback markiert werden. Tatsächliche Join-,Filter-,Gruppierungs-,Sortier-,Mengen-,Modellidentitäts- oder Sicherheitsfehler und fehlende fachliche Nachweise erhalten für das betroffene wesentliche Kriterium0. Andere Aufgaben oder Zusatzleistungen ersetzen diese fehlende Kompetenz nicht; passingPoints und maxPoints bleiben unverändert.'''
# Replace complete concrete blocks and criterion text in assembled native strings.
for eid,data in NATIVE.items():
 task=data['taskContent'];solution=data['solutionContent']
 assert task.count(OLDPOLICY)==1
 task=task.replace(OLDPOLICY,NEWPOLICY)
 solution=solution.replace('Unabhängiger Fachreview der Schwelle/des tatsächlichen Materials steht aus.','Gezielter unabhängiger Nachtest dieses separat gepinnten Korrekturentwurfs steht aus.')
 # Same score-evidence rule is visible next to solutions as well as in task instructions.
 pos=solution.index('\n\n');solution=solution[:pos]+' '+NEWPOLICY+solution[pos:]
 for case in ASSEMBLIES[eid]['taskIds']:
  old,new=ORIG[case],BANK[case]
  if old['task']!=new['task']:
   assert task.count(old['task'])==1,(eid,case,'task');task=task.replace(old['task'],new['task'])
  if old['solution']!=new['solution']:
   assert solution.count(old['solution'])==1,(eid,case,'solution');solution=solution.replace(old['solution'],new['solution'])
  for key,oldblock in old['materialBlocks'].items():
   newblock=new['materialBlocks'][key]
   if oldblock!=newblock:
    # Shared material block appears once in the assembled handout.
    if oldblock in task:task=task.replace(oldblock,newblock)
    else:assert newblock in task,(eid,case,key)
  oldcrit={c['id']:c for c in old['essentialCriteria']}
  for c in new['essentialCriteria']:
   before=oldcrit[c['id']]['description']
   if c['description']!=before:
    token=c['id']+': '+before
    assert solution.count(token)==1,(eid,case,c['id']);solution=solution.replace(token,c['id']+': '+c['description'])
    step=next(s for s in data['scoring']['steps'] if s['id']==c['id']);assert step['description']==case+': '+before;step['description']=case+': '+c['description']
 data['taskContent']=task;data['solutionContent']=solution
 assert data['coveredGoalIds']==OLDNATIVE[eid]['coveredGoalIds']
 assert data['scoring']['maxPoints']==OLDNATIVE[eid]['scoring']['maxPoints']
 assert data['scoring']['passingPoints']==OLDNATIVE[eid]['scoring']['passingPoints']
 assert data['reviewStatus']=='draft'
 for c in ASSEMBLIES[eid]['goalBindings']:
  assert c['fullGoalDescription']==BANK[c['taskId']]['fullGoalDescription']
# Native scopes,goal IDs,meanings,thresholds and references stay exactly unchanged.
for case,entry in BANK.items():
 assert entry['fullGoalDescription']==ORIG[case]['fullGoalDescription']
 for field in ('goalId','title','id','caseId','materials'):assert entry[field]==ORIG[case][field]
 assert [(c['id'],c['points']) for c in entry['essentialCriteria']]==[(c['id'],c['points']) for c in ORIG[case]['essentialCriteria']]
for name,obj in [('native-examData.json',NATIVE),('casebank.json',BANK),('exam-assemblies.json',ASSEMBLIES)]:
 (OUT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
for name in ['reference-courses.py','reference-library.py','reference-festival.py','run-reference-checks.py']:
 shutil.copyfile(BASE/name,OUT/name)
 (OUT/name).chmod(0o644)
# Original test runner and executable references are byte-identical. It reads the unchanged frozen shared input.
report={'kind':'separate finite material successor;author corrections only','baselineMaterialSha256':sha(BASE/'native-examData.json'),'successorMaterialSha256':sha(OUT/'native-examData.json'),'boundPrivateSourceSha256':'7586e38b7c96688bc8c5f02b2e2b1327284d271c73404693c9f872d29422d661','activeSourceSha256':'85411185514af4b2ecf818807f3bd6fe5df17fb5011c5ebf8c4996de1a47817e','reviewInputHashes':{n:sha(REVIEW/n) for n in ['README.md','findings.json','review-seal.json']},'changes':CHANGES,'globalRuleChangeFinding':'FMR-02','all45GoalMeaningsUnchanged':len({v['goalId'] for v in BANK.values()})==45,'exact5AssemblyIdsAndOrderedCoverageUnchanged':True,'thresholdsAndCriterionIdsPointsUnchanged':True,'referenceExecutablesUnchanged':{n:sha(OUT/n)==sha(BASE/n) for n in ['reference-courses.py','reference-library.py','reference-festival.py','run-reference-checks.py']},'reviewStatus':'draft;targeted independent review pending','noApprovalOrLedgerPass':True}
(OUT/'correction-delta.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'nativeSha256':report['successorMaterialSha256'],'finiteCaseFieldChanges':len(CHANGES),'casesChanged':len({c['caseId'] for c in CHANGES}),'noReferenceProgramChanges':all(report['referenceExecutablesUnchanged'].values())}))
