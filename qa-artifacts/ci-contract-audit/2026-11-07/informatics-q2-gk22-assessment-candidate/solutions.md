# Erwartete Lösungen und analytische Kriterien: privater 22-Ziele-Entwurf

Autorenvorschlag, keine unabhängige Fachabnahme. Gleichwertige fachlich richtige
Modelle, SQL-Dialekte und Programme sind anzuerkennen. Jeder Abschnitt Sxx
gehört genau zu Axx und Rxx. Die fünf bezeichneten Leistungen ergeben jeweils
einen Punkt; Teilpunkte verlangen eine tatsächlich richtige Teilleistung.

Der vorläufige Vollumfangsnachweis hat 110 Punkte und passingPoints110:
Alle 22 Kriterien werden vollständig belegt. Teilpunkte geben Feedback, erzeugen
hier aber keinen kompensatorischen Vollumfangspass. Dies ist keine amtliche
Notenskala. Der vorgeschlagene Prüfungsvertrag benötigt eigenen Fachreview.

## S01 / R01 – ER-Modell

Entitäten: Person(pid), Team(tid), Raum(rid), Kurs(kid), Buchung(pid,kid),
Kontakt(pid). Buchung ist eine assoziative Entität oder attributierte
M:N-Beziehung: Jede Buchung gehört genau einer Person/einem Kurs; beide
haben jeweils 0..n Buchungen. Team0..n–Kurs1..1; Raum0..n–Kurs0..1;
Person0..1–Kontakt1..1. Kapazität ist eine zusätzliche Zählbedingung;
Pseudonyme sind Attribute, keine Schlüssel.

Fünf Leistungen: Entitäten/Identitäten; Buchung/Status/M:N;
Team-Kurs-Beteiligungen; Raum-Optionalität; Kontakt-Optionalität und
Abgrenzung der Kapazitätsbedingung.

## S02 / R02 – Tabellenableitung

M2 ist eine passende Ableitung. Buchung braucht PK(pid,kid) und beide
NOT-NULL-FKs. Kurs.tid ist obligatorisch, Kurs.rid kann NULL sein.
Kontakt.pid ist zugleich PK/FK; eine fehlende Kontaktzeile stellt die
freiwillige Angabe dar. Ein PK nur auf pid oder kid verböte erlaubte
Mehrfachbuchungen verschiedener Kurse beziehungsweise Personen.

Fünf Leistungen: Entitäten zu Tabellen; korrekte PKs; M:N-Tabelle mit
zusammengesetztem PK; FK-Richtungen; Optionalität/NULL/Kontaktbegründung.

## S03 / R03 – Normalisierung

Änderungsanomalie: Fotobasispreis steht mehrfach; eine geänderte Zeile
widerspricht den übrigen. Einfügeanomalie: Neuer Kurs ohne Buchung/Person
lässt sich unter dem Exportschlüssel nicht regulär speichern. Löschanomalie:
Löschen der einzigen Audiolaborbuchung entfernt zugleich Kurs-/Teamangaben.

Die gegebenen Zellen sind atomar (1NF). Zur 2NF werden die partiellen
Abhängigkeiten pid→pseudonym,ort und kid→titel,preis,tid,teamName getrennt:
Person, Buchung(pid,kid,status), KursZwischen(kid,titel,preis,tid,teamName).
Zur 3NF wird kid→tid→teamName getrennt: Team(tid,teamName) und
Kurs(kid,titel,preis,tid). Die eindeutigen pid/kid/tid-Verknüpfungen
rekonstruieren jeden Exportdatensatz ohne zusätzliche Kombinationen.
Raum/Kontakt sind nicht nachträglich aus dem Export zu erfinden.

Fünf Leistungen: drei konkrete Anomalien; 1NF/Schlüssel/FDs;
2NF-Zerlegung; 3NF-Zerlegung; verlustfreie Schlüsselverknüpfung begründet.

## S04 / R04 – SELECT und Reihenfolge

```sql
SELECT p.pseudonym,k.titel,k.preis FROM Person p
JOIN Buchung b ON b.pid=p.pid JOIN Kurs k ON k.kid=b.kid
WHERE p.ort='Kassel' AND b.status='aktiv' AND k.preis>=20
ORDER BY k.preis DESC,p.pseudonym ASC;
```

Ergebnis: `(ada,Videoschnitt,40)`, `(ben,Audiolabor,30)`,
`(ada,Fotobasis,20)`, `(ben,Fotobasis,20)`.
Fünf Leistungen: Projektion; beide Joins; alle drei Selektionen;
beide Sortierschlüssel; alle vier Zeilen in richtiger Folge.

## S05 / R05 – Aggregation

```sql
SELECT k.kid,COUNT(b.pid) AS aktive,
 SUM(CASE WHEN b.pid IS NOT NULL THEN k.preis ELSE 0 END) AS umsatz
FROM Kurs k LEFT JOIN Buchung b ON b.kid=k.kid AND b.status='aktiv'
GROUP BY k.kid ORDER BY k.kid;
```

Ergebnis `(kid,aktive,umsatz)`:
`(10,2,40),(20,2,60),(30,2,80),(40,1,10),(50,0,0)`.
Zusatz `HAVING COUNT(b.pid)>=2` lässt10/20/30.
COUNT(*) zählt auch die NULL-erweiterte Joinzeile von Kurs50;
SUM(preis) ohne Fallunterscheidung lieferte dort fälschlich15.

Fünf Leistungen: Gruppierung/aktiver Joinfilter; COUNT des Buchungsschlüssels;
Umsatzaggregation; alle fünf Ergebniszeilen; HAVING/IDs/NULL-Begründung.

## S06 / R06 – SQL-Bereiche erklären

Die innere Abfrage ergibt115/5=23; die äußere liefert kid20/30.
UPDATE (DML) ändert nur Preis20 von30 auf35, keine Struktur.
ALTER TABLE (DDL) ergänzt sichtbar; bestehende Zeilen und spätere
fehlende Werte erhalten den Vorgabewert1. GRANT (DCL) verleiht nur SELECT
auf der Sicht, keine Schreibrechte und kein pauschales Person-/Kontaktlesen.

Fünf Leistungen: Unterabfrage/Mittelwert; äußeres Ergebnis;
DML-Wirkung; DDL/Default; DCL-Reichweite und Klassifikation.

## S07 / R07 – Formulare

```html
<form action="/kurse" method="get">
 <label for="preis">Hoechstpreis in EUR</label>
 <input id="preis" name="maxPreis" type="number" min="0" max="1000" required>
 <input name="page" type="hidden" value="1">
 <button type="submit">Suchen</button>
</form>
<form action="/buchen" method="post">
 <input name="kid" type="hidden" value="40">
 <input name="csrfToken" type="hidden" value="SERVERGEGEBENES_TOKEN">
 <button type="submit">Kurs 40 buchen</button>
</form>
```

Für30: `/kurse?maxPreis=30&page=1`. GET ist die lesende verlinkbare Suche;
POST ist der Buchungsauftrag. Clientgrenzen ersetzen keine Serverprüfung;
die Personen-ID kommt aus der Sitzung.

Fünf Leistungen: benutzbares beschriftetes GET; Namen/page1;
tatsächliche URL; POST-Ziel/kid/CSRF; Methoden-/Sitzungsbegründung.

## S08 / R08 – SQL im Programm

```python
import sqlite3
from contextlib import closing
with closing(sqlite3.connect(db_path)) as con:
 rows = con.execute(
  'SELECT kid,titel,preis FROM Kurs WHERE preis<=? ORDER BY kid LIMIT ? OFFSET ?',
  (max_preis,2,(page-1)*2)).fetchall()
for kid,titel,preis in rows:
 print(kid,titel,preis)
```

Bei30/1: `(10,Fotobasis,20),(20,Audiolabor,30)`.
Wertparameter bleiben vom SQL-Text getrennt. Die Verbindung wird nach dem
Arbeitsblock geschlossen; Ergebniskodierung in HTML ist zusätzlich S17.

Fünf Leistungen: Verbindungsaufbau/Laufzeit; SELECT-Bedingung;
Parametertupel; LIMIT/OFFSET/Sortierung; Iteration und konkrete Zeilen.

## S09 / R09 – Recht und Zweckbindung

Die Pseudonyme sind über pid/Kontakt wieder zuordenbar und im Fall nicht
anonym. Selbstbestimmung schützt die Entscheidung über personenbezogene
Daten, bedeutet aber keine schrankenlose Beliebigkeit. Notwendige
Buchungsdaten dienen der vereinbarten Leistung (Art.6-Vertragszweck);
hier freiwillige Werbung benötigt eine getrennte passende Grundlage und
informierte Wahl. Zweckbindung spricht gegen heimlichen Datenverkauf,
Minimierung gegen unnötige Kontakt-/Standortweitergabe, Speicherbegrenzung
gegen unbegründete unbegrenzte Aufbewahrung. Zwecke/Empfänger werden vor
Erhebung erklärt. Werbung abzuschalten rechtfertigt keine pauschale
Löschung aller nötigen Buchungsbelege.

Fünf Leistungen: Wiederzuordenbarkeit; Selbstbestimmung; getrennte
Zwecke/Grundlagen; zwei konkrete Prinzipienanwendungen; Information/Wahlfreiheit.

## S10 / R10 – Sicherheitsorganisation

Vertraulichkeit: individuelle rollenbegrenzte Konten statt Sammeladmin;
Administration setzt um, Leitung gibt frei, quartalsweiser Rechtecheck
und Schulung. Integrität: freigegebene Änderungsabläufe, Constraints und
Transaktionen, nachvollziehbare Protokolle; Datenverantwortliche kontrollieren
Stichproben, kritische Änderungen erhalten Vier-Augen-Freigabe.
Verfügbarkeit: tägliches getrenntes verschlüsseltes Backup und regelmäßiger
protokollierter Restoretest durch den Betrieb auf Ersatzsystem.
Restrisiko: Änderungen seit letztem Backup oder kompromittiertes Einzelkonto;
Verschlüsselung allein beweist keine Wiederherstellbarkeit.

Fünf Leistungen: drei Sicherheitsziele mit Fallbezug; differenzierte
Maßnahmen; Zuständigkeiten; überprüfbare organisatorische Kontrollen;
konkretes Restrisiko.

## S11 / R11 – Relationenalgebra

`sigma_ort='Kassel'(Person)` liefert1/2; `pi_pseudonym` liefert `{ada,ben}`.
`pi_pid(sigma_ort='Kassel'(Person)) X pi_kid(sigma_preis<=20(Kurs))`
ergibt `{(1,10),(1,40),(1,50),(2,10),(2,40),(2,50)}`.
`pi_pseudonym,titel(sigma_ort='Kassel'(Person)
JOIN sigma_status='aktiv'(Buchung) JOIN Kurs)` ergibt
`{(ada,Fotobasis),(ada,Videoschnitt),(ben,Fotobasis),(ben,Audiolabor)}`.

Fünf Leistungen: Selektion/Ergebnis; Projektion/Menge;
Produktoperator; alle sechs Produktpaare; Join und konkrete vier Paare.

## S12 / R12 – Abfrageterm und Übersetzung

`pi_pseudonym(sigma_ort='Kassel'(Person) JOIN sigma_status='aktiv'(Buchung)
JOIN sigma_preis<=20(Kurs))`.

```sql
SELECT DISTINCT p.pseudonym FROM Person p
JOIN Buchung b ON b.pid=p.pid JOIN Kurs k ON k.kid=b.kid
WHERE p.ort='Kassel' AND b.status='aktiv' AND k.preis<=20 ORDER BY p.pseudonym;
```

Ergebnis `{ada,ben}`. WHERE ist Selektion, die Tabellenverknüpfung Join,
SELECT DISTINCT mengenwertige Projektion. Mehrfachbuchungen sollen nicht
mehrfach denselben Namen erzeugen.

Fünf Leistungen: vollständiger eigener Term; drei Selektionen;
beide SQL-Joins; DISTINCT/Operatorentsprechung; konkrete Ergebnismenge.

## S13 / R13 – Komplexere ER-Regeln

Kurs1..n–Termin1..1. Person0..n–Teilnahme1..1 und
Termin0..n–Teilnahme1..1; Teilnahme kann PK(pid,terminId) haben.
Person0..n–leitet–Kurs1..1 ist unabhängig von der Teilnehmerrolle.
Gehört TerminT20 zu Kurs20, ist Teilnahme(1,T20) bei M2 ungültig:
Person1 hat keine aktive Buchung für20. Teilnahme(2,T20) ist nach der
gegebenen Bedingung zulässig. Für jede Teilnahme(p,t) muss ein Kursk mit
Termin(t,k) und Buchung(p,k,status='aktiv') existieren. Reine binäre
Kardinalitäten erzwingen diese Kursübereinstimmung nicht. Leitung
verlangt nach M5 keine eigene Teilnehmerbuchung.

Fünf Leistungen: Kurs-Terminkardinalität; Teilnahmebeteiligungen/Schlüssel;
Leitungs-/Doppelrolle; konkretes Gegenbeispiel;
präzise Buchungsbedingung und Grenze bloßer Kardinalitäten.

## S14 / R14 – Schemakritik

ID verhindert gleiche id, nicht doppelte(pid,kid). Die beiden
BuchungB-Zeilen widersprechen der aktuellen Person-Kurs-Eindeutigkeit.
UNIQUE(pid,kid) oder PK(pid,kid), NOT NULL, Person-/Kurs-FKs und
Status-CHECK sind nötig. Bestandswidersprüche werden fachlich geklärt;
eine beliebige Zeile zu behalten ist keine bewiesene Korrektur.
Die zwei Namen für tid1 widersprechen tid→teamName. Team(tid,name)
mit eindeutigem tid und FK aus Kurs beseitigt die Redundanz.

Fünf Leistungen: ID-Schlüsselgrenze; konkreter Widerspruch;
Eindeutigkeits-/FK-/Werteconstraints; Teamredundanz/Zerlegung;
bewusste Datenklärung vor Migration.

## S15 / R15 – DDL/DML/DCL anwenden

```sql
CREATE TABLE Hinweis(kid INTEGER PRIMARY KEY REFERENCES Kurs(kid), text TEXT NOT NULL);
INSERT INTO Hinweis(kid,text) VALUES(10,'Kamera mitbringen');
UPDATE Hinweis SET text='Geladene Kamera mitbringen' WHERE kid=10;
DELETE FROM Hinweis WHERE kid=10;
CREATE VIEW KursAuskunft AS SELECT kid,titel,preis FROM Kurs;
-- DCL im gegebenen Rollenmodell, ausdrücklich nicht in SQLite:
GRANT SELECT ON KursAuskunft TO auskunft;
REVOKE SELECT ON Person FROM auskunft;
GRANT SELECT,INSERT ON Buchung TO anmeldedienst;
```

Hinweis ist danach leer. PK/FK verhindern unbekannte/doppelte Kursverweise.
Kontakt-, DROP- oder pauschale Datenbankrechte werden nicht vergeben.
Ein Nur-Neuanlagedienst darf einen bestehenden Stornosatz nicht überschreiben;
eine Wiederaufnahme benötigt einen gesondert berechtigten Ablauf.

Fünf Leistungen: DDL/PK/FK; INSERT/UPDATE; gezieltes DELETE/Endzustand;
Sicht mit genau öffentlichen Spalten; Rollenprivilegien/REVOKE ohne Mehrrechte.

## S16 / R16 – Parameter und Sitzung

Genau ein Wert je Parameter, ASCII-Ganzzahlformat und Grenzen werden
serverseitig geprüft. `0 OR 1=1`, page-1 und doppelte page ergeben400;
falsches CSRF-Token403. SQL bindet Werte wie S08 statt Konkatenation.
kid wird auf Format/Existenz geprüft; pid stammt aus der gegebenen Sitzung.
POST verschlüsselt nichts (dafür HTTPS), bindet keine SQL-Werte und prüft
keine fachliche Berechtigung. Ein CSRF-Token ersetzt diese ebenfalls nicht;
Client-min/max sind keine Serverprüfung.

Fünf Leistungen: Werte-/Mehrfach-/Bereichsvalidierung; konkrete Fehlercodes;
SQL-Wertbindung; Session-/CSRF-Trennung; Grenzen von POST/Clientkontrollen.

## S17 / R17 – HTML und Pagination

```python
from html import escape
cells = ''.join('<tr><td>'+str(kid)+'</td><td>'+escape(titel,quote=True)
 +'</td><td>'+str(preis)+'</td></tr>' for kid,titel,preis in rows)
```

Die Referenz ergänzt thead, Formular und URL-kodierte Links. Seite1 bei30:
Fotobasis20/Audiolabor30. Weiter `/kurse?maxPreis=30&page=2`.
Seite2: Datenschutz-Werkstatt10 und Archiv <offen>15 als Text,
im HTML `Archiv &lt;offen&gt;`; Zurück page1. Nach letzter Trefferseite
kein Weiter, leere gültige Seite mit Leermeldung statt400.
Filter bleibt erhalten, OFFSET=(page-1)*2.

Fünf Leistungen: echte Tabelleniteration; kontextsichere Kodierung;
richtige zwei Seiten; Links mit behaltenem Filter; leere Seite/Seitenberechnung.

## S18 / R18 – Tatsächliche Einstellungen

Ein gültiger, nicht einziger begründbarer Folgezustand:

```json
{"personalizedRecommendations":false,"preciseLocation":false,
 "profilePublic":false,"analyticsRetentionDays":7}
```

Die Referenz wendet diese Werte auf eine private Kopie an. Weniger
Personalisierung begrenzt Profilbildung, kostet Empfehlungen; kein genauer
Standort mindert Ortsprofilrisiko, verlangt Ortsauswahl; kein öffentliches
Profil mindert Zuordnung und öffentliche Vernetzung; kurze Analysefrist
begrenzt Langzeitprofile und historische Auswertung. Nötige Buchungsdaten
haben einen anderen Zweck und werden dadurch nicht pauschal aufgehoben.

Fünf Leistungen: gültige veränderte Konfiguration; konkrete Vorher-/Nachherwerte;
drei Risikobegründungen; Komfortabwägung; Analyse-/Buchungszweck getrennt.

## S19 / R19 – Geschachtelte Übersetzung

A enthält Personen1/2. B enthält die aktiven Paare
`{(1,10),(1,30),(2,10),(2,20),(3,20),(4,30),(5,40)}`.
C enthält `(10,Werkstatt),(20,Offene Medien),(40,Offene Medien),(50,Archiv)`.
D ergibt `(ada,Fotobasis,Werkstatt),(ben,Fotobasis,Werkstatt),
(ben,Audiolabor,Offene Medien)`.

```sql
SELECT DISTINCT p.pseudonym,k.titel,t.name
FROM Person p JOIN Buchung b ON b.pid=p.pid
JOIN Kurs k ON k.kid=b.kid JOIN Team t ON t.tid=k.tid
WHERE p.ort='Kassel' AND b.status='aktiv' AND k.preis<=30
ORDER BY p.pseudonym,k.kid;
```

Die Selektionen aus A/B/C werden in WHERE umgesetzt; der Team-Join bildet
zunächst den Modellteil C, die pid/kid-Verknüpfungen verbinden ihn mit A/B.
Gleichwertig sind benannte Zwischenabfragen. Die Ausgabe entspricht der
Projektion; DISTINCT erhält die Mengenbedeutung.

Fünf Leistungen: A und die Kassel-Bedingung; alle B-Paare/Statusselektion;
innerer Join C mit vier Ergebnissen; vollständige schrittweise SQL-Abbildung;
D mit Reihenfolge und Operatorentsprechung.

## S20 / R20 – Datenorganisation

Buchungen passen zu relationalen Schlüsseln, FKs und Transaktionen.
Flexible Ereignisse können als JSON-Dokumente je Ereignis oder in
Wide-Column-Ablagen entlang Zeit/Kurs gespeichert werden. Passende
Partitionierung, Abfragen und Konsistenz-/Duplikatregeln bleiben nötig.
Relationale Systeme können ebenfalls groß sein; NoSQL garantiert weder
Geschwindigkeit noch korrekte Beziehungen oder Datenschutz. Ein gemeinsames
JSON-Dokument beweist keine zuverlässige konkurrierende Platzvergabe.
Minutenverzögerung ist im Fall für Statistik akzeptiert, nicht für die
letzte verbindliche Kursbuchung.

Fünf Leistungen: begründete relationale Buchungswahl; Dokumentstruktur;
Wide-Column-Einordnung; arbeitslastbezogene Grenzen;
begründete Zurückweisung pauschaler Größen-/NoSQL-Garantien.

## S21 / R21 – Map, Shuffle, Reduce

Map(P1)=`[(10,1),(20,1),(10,1)]`,
Map(P2)=`[(30,1),(20,1),(10,1)]`.
Shuffle=`10:[1,1,1],20:[1,1],30:[1]`.
Reduce(Summe)=`10:3,20:2,30:1`.
Die Map-Arbeit kann pro Ereignis/Partition unabhängig erfolgen;
Shuffle führt gleiche Schlüssel zusammen. Umordnung oder andere
Aufteilung derselben Ereignisse ändert die Summe der Einsen je Schlüssel
nicht. Kein Statechart-/Synchronisations-/Clusterabschluss ist verlangt.

Fünf Leistungen: vollständige P1-Mapausgaben; vollständige P2-Mapausgaben;
Shuffle-Gruppen; Reduce-Werte; Parallel-/Aufteilungsbegründung am Fall.

## S22 / R22 – Wirtschaft und Wirkung

Erlös=2000/1000*5=10EUR. Bekannter direkter Überschuss=10-6=4EUR,
nicht bereits Gesamtgewinn nach allen Kosten. Organisch10,20,30;
gesponserte Scores3,12,1 ergeben20,10,30. W kann Finanzierung ermöglichen,
verknüpfbare Profile/Kontaktweitergabe erhöhen Datenschutz-/Abhängigkeitsrisiken.
F kann den Eindruck erwecken, es gebe vor allem schon geklickte Themen;
Kurs20 wird trotz weniger organischer Aufrufe prominent. N erhält
Entdeckbarkeit/erkennbare abschaltbare Werbung, kann weniger gezielte
Werbeerlöse erzielen. Sechs Ereignisse beweisen keine repräsentative
Präferenzverteilung oder kausalen Meinungswandel. Ein Urteil trennt diesen
Evidenzrand von plausiblen Einflussmöglichkeiten der Auswahl/Sortierung.

Fünf Leistungen: Erlös/abgegrenzter Überschuss; beide Rankings;
wirtschaftlicher Nutzen/Alternative; konkrete Datenschutz-/Filterwirkung;
begründetes Urteil mit Evidenzgrenze.
