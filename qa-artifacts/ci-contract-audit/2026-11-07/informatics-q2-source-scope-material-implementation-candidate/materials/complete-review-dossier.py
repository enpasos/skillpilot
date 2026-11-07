#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
import json,hashlib,re
from pathlib import Path
R=Path(__file__).parent
x=json.load(open('/dev/shm/informatics-q2-implementation-20261107/shared-author-input.json'));bank=json.load(open(R/'casebank.json'));assemblies=json.load(open(R/'exam-assemblies.json'));native=json.load(open(R/'native-examData.json'))
facets={
'042':['SQL-Ergebnismenge strukturiert in HTML ausgeben','Filter ODER Pagination vollständig implementieren'],
'0cf':['Datenbankverbindung herstellen/freigeben','SQL vorbereiten,Werte binden,Ergebnis abrufen/iterieren'],
'0e0':['Client- und eigenständige Servervalidierung','Längen-/Werteprüfung,SQL-Bindung,HTML-Kontextkodierung gegen konkrete Angriffe'],
'121':['konzeptionelle Bounded Contexts/Datenhoheit','Wurzel/Kindaggregat,Invariante und Kontextübergang'],
'13b':['Aggregatfunktionen auf mehrfachen Gruppenzeilen','Gruppierung und vollständiges Aggregatergebnis'],
'16c':['DDL/DML an konkreten Tabellen anwenden','DCL mit Sicht-/Rollenpolitik und Entzug gestalten'],
'1a3':['Caching mit konkretem Schlüssel/Invalidierung','Asynchronität mit Erfolgsgrenze,Retry/Idempotenz begründen'],
'1eb':['komplexe Kardinalitäten/Optionalitäten und Rollen','übergreifende Teilnahmebedingung begründen und gegenprüfen'],
'2cf':['Entitäten/Beziehungen/Identitäten','Kardinalitäten/Optionalitäten modellieren und begründen'],
'2d1':['Mehrwertigkeit erkennen/erhalten','Relation mit Besitzer-FK und eindeutigem Paar ableiten'],
'2e2':['Unterabfrage und Ergebnis beschreiben','DML/DDL/Berechtigungen samt Wirkung und Grenze beschreiben'],
'2f5':['konkrete OWASP-2025-Bedrohungen klassifizieren','Trust Boundaries,Risikopriorität,Maßnahmen/Prüffälle'],
'303':['REST-Ressourcen/Methoden/Statuscodes','DB-Zugriff hinter Service/Repository und Objektberechtigung kapseln'],
'42a':['Relationen aus unabhängigem Modell gewinnen','PK/FK/NULL und wiederholbare Vorgangsidentität bestimmen'],
'431':['Benutzer-/Dienstrollentrennung','Zugriffsrechte,Zugangsdaten und Rechtepflege beschreiben'],
'46b':['konkrete Änderungs-/Einfüge-/Löschanomalien','Listen1NF,partielle2NF,transitive3NF samt FDs/Schlüsseln'],
'505':['Sequenzdiagramm für Service-Lebenslinien','Nebenläufige Nachrichten,Joinbarriere und Fehleralternative modellieren'],
'56e':['Vereinigung,Schnitt,Differenz','Umbenennung und Schemakompatibilität anwenden'],
'58173':['Sicherheitsziele CIA plus Authentizität','organisatorische und technische/physische Maßnahmen begründen'],
'58180':['is-a-Richtung/Teilmenge','identischer PK/FK in konsistentem vorgegebenem relationalen Muster'],
'5b9':['ACID und Isolation-Level erläutern','Anomalien erkennen und konsistenten Reservierungsvertrag erklären'],
'5c6':['schwachen Typ,partiellen Schlüssel,identifizierende Beziehung modellieren','Besitzer-FK und zusammengesetzte Identifikation relational darstellen'],
'5d0':['1NF–3NF und Kandidatenschlüssel prüfen','BCNF-Verstoß und verlustfreie Normalisierung mit Abhängigkeitsgrenze'],
'705':['GET-/POST-Parameter einschließlich Eingabelänge validieren','SQL-Bindung,Session/CSRF und zusätzliche Sicherheitsmaßnahmen beschreiben'],
'71f':['informationelle Selbstbestimmung/Datenschutzprinzipien erläutern','gesetzliche Grundlagen mit getrennten Zwecken,Einwilligungsbedingungen und Rechten'],
'729':['Datenschutzprinzipien in Speicher-/Zwecktrennung und Voreinstellungen verankern','Einwilligungs-/Widerrufs-/Löschflows samt Prüffällen gestalten'],
'7a9':['ökonomische Verwertbarkeit mit Rechnung/Kostengrenze bewerten','Datenfilterung und Wahrnehmungs-/Auswahlwirkung samt Evidenzgrenze bewerten'],
'875':['hierarchischen Zustandsautomaten modellieren','gleichzeitig aktive orthogonale Regionen,Abschluss/Abbruch und Spuren modellieren'],
'955':['Session-/Token-/Cookielebenszyklus','Rotation,Ablauf,Logout,Schutzattribute und Nutzertrennung sicher handhaben'],
'98f':['Indexarten nach Gleichheit/Bereich auswählen','Lese-/Schreib-/Speicherkosten nach gegebenem Modell abschätzen'],
'9a49':['Schlüssel,Redundanz,Konsistenz konkret bewerten','lokal ausreichende Reparatur und Bestandsklärung begründen'],
'a49':['Views und Rollen tatsächlich formulieren','erlaubte/verbotene Operationen und Basistabellenrechte prüfen'],
'b2d':['Tupelkalkül mit Quantifikation anwenden','Domänenkalkül mit Bereichsbeschränkung anwenden'],
'b592':['Problem selbst in RA-Term entwickeln','SQL-Überführung und vollständiges Resultat mit Operatorentsprechung'],
'b855':['vorgegebenes UPDATE mit gebundenen Werten ohne Ergebnismenge ausführen','commit,persistenter Nachzustand und unveränderte andere Datensätze prüfen'],
'c499':['RA-Ausdruck äquivalent umformen','Kosten anhand frühen Filters/Projektionen und Resultatäquivalenz schätzen'],
'c739':['Join-Reihenfolge und Indexgebrauch begründen','konkrete Plankosten und Ergebnisäquivalenz vergleichen'],
'de3':['Alltagsdatenschutzrisiken/Komfortabwägungen beurteilen','fiktive Einstellungen ändern und unabhängige Einträge erhalten'],
'e00':['HTML-Formular mit Parametern gestalten','passenden GET-/POST-Request erzeugen und Serververtrag erklären'],
'e67':['gegebenen komplexen verschachtelten RA-Term schrittweise auswerten','äquivalentes SQL mit vollständigen Zwischenrelationen überführen'],
'e94':['MapReduce als paralleles Paradigma beschreiben','konkrete Map/Shuffle/Reduce-Schritte und Partitionsinvarianz erläutern'],
'f029':['symmetrische/asymmetrische Verfahren und Schlüsselrollen einordnen','digitale Signatur hinsichtlich Herkunft,Integrität und Grenzen einordnen'],
'fbc':['Grenzen relationaler Organisation bei konkreter Last erklären','Document-/WideColumn-Alternative mit Schlüsselbeispiel/Tradeoff einordnen'],
'fd1':['Projektion,Selektion,beideJoins selbst schreiben','Sortierung und vollständige Ergebnismenge bestimmen'],
'fdfa':['Produkt,Selektion','Projektion,Theta-Join mit Mengenbedeutung und vollständigen Tupeln'],
}
records=[]
for gid,g in x['exactGoals'].items():
 prefix=next(p for p in facets if gid.startswith(p))
 cases=[v for v in bank.values() if v['goalId']==gid]
 assert cases
 records.append({'goalId':gid,'unchangedFullDescription':g['description'],'authorInterpretedRequiredPerformances':facets[prefix],'concreteCases':[{'taskId':t['caseId'],'materialBlocks':t['materials'],'solutionAnchor':t['caseId'],'essentialCriterionIds':[c['id'] for c in t['essentialCriteria']]} for t in cases],'authorSelfCheck':'concrete tasks/solutions substantively read against the full original meaning;all listed facets present','independentSubjectVerdict':None})
findings={
'MAT-01':{'repair':'Independent WerkzeugWelt,library-exemplar-history,festival-artist/production modelling worlds;M2 uses different entities/keys/business rules','cases':['C-T01','C-T02','B-T01','B-T02','F-T01','F-T02']},
'MAT-02':{'repair':'Real filter-only OR pagination-only alternatives;both positive reference paths executed;either earns same essential output criterion','goalPrefix':'042'},
'MAT-03':{'repair':'Two explicit observable essential binary criteria per goal,consequence errors separated,equivalent solutions and harmless incidental errors accepted;no compensatory total or copied110threshold','thresholds':{i:v['scoring']['maxPoints'] for i,v in native.items()}},
'MAT-04':{'repair':'Allfive-course ranking universe,missingclick/sponsor0,ties byID;complete rankingsN/W and economic costboundary','goalPrefix':'7a9'},
'MAT-05':{'repair':'Explicit variable-schema/distributed-coordination relational limitations,Document/WideColumn examples/tradeoffs;onlyretained41exam assesses thisgoal','goalPrefix':'fbc'},
'MAT-06':{'repair':'Official current EUR-Lex liveopened/captured07Nov2026,explicit6(1)b contract/6(1)a consent,conditions/information/revocation/objection;no general marketinglawclaim','goalPrefix':'71f'},
'MAT-07':{'repair':'ASCII and stringlength bounds before int;5000digitHTTPprice/page both400 in all3 references','goalPrefix':'705'},
'MAT-08':{'repair':'AtmostonePersonCourse pair,not exactly everypossiblepair;missingpairpositive and duplicatepairnegative executed'},
'MAT-09':{'repair':'All fullrelation tuples/schemas for product,selection,projection,join and all nested intermediates;independentPythonsets/SQLite executed','goalPrefixes':['fdfa','e67']}}
result={'status':'author-complete,independent material review open','goalCount':len(records),'assemblyGoalCounts':{i:len(v['coverage']) for i,v in assemblies.items()},'bindings':records,'oldFindingsAuthorClosureCandidates':findings,'reviewInstructions':['Review exact full goal meanings,not titles or counts.','Independently solve each task from its assembled handout;check all case data and entire solutions.','Check essential criteria and OR-alternative,harmless errors and consequence errors.','Do not convert author execution evidence into independent material acceptance.','Retained41 includes full875hierarchy+parallelism;retained23s retain domain and exact pre-growth expansion.','Judge legal card only within its explicit dated fictional scope;no broad legal approval.'],'independentReview':{'reviewer':None,'status':'pending','verdict':None},'executionEvidence':'execution-evidence.json'}
(R/'full-meaning-and-material-completeness.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
(R/'official-owasp-retrieval.json').write_text(json.dumps({'officialUrl':'https://top10.owasp.org/2025/','webToolOpenedAtDate':'2026-11-07','webToolSuccessful':True,'observedEdition':'OWASP Top10:2025','selectedCategories':{'A01':'Broken Access Control','A02':'Security Misconfiguration','A04':'Cryptographic Failures','A05':'Injection','A07':'Authentication Failures'},'separateRawCapture':{'status':403,'savedHtml':False},'attribution':'OWASP Top 10 Team,project siteCC-BY-3.0;carduses categorynames and own didacticparaphrases'},indent=2)+'\n')
# Validate every numeric material reference in tasks is defined in its own assembly.
refcheck=[]
for eid,data in native.items():
 declared=set(re.findall(r'\bM(\d+)\s*[–-]',data['taskContent']))
 referenced=set(re.findall(r'\bM(\d+)\b',data['taskContent']))
 refcheck.append({'examId':eid,'declared':sorted(declared,key=int),'referenced':sorted(referenced,key=int),'unresolved':sorted(referenced-declared)})
assert all(not v['unresolved'] for v in refcheck),refcheck
(R/'assembly-material-reference-check.json').write_text(json.dumps({'status':'pass','checks':refcheck},indent=2)+'\n')
print(json.dumps({'meaningRecords':len(records),'findings':len(findings),'materialReferences':'allresolved'}))
