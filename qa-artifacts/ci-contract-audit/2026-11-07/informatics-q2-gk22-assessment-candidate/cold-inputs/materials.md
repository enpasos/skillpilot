# LeihZeit: Kursbuchung, Datenverarbeitung und öffentliche Empfehlungen

Privater Materialentwurf zu 22 derzeit in GK-Projektionen sichtbaren Zielen.
Das ist keine Bestätigung eines amtlichen oder notwendigen GK-Pflichtumfangs.
Die Berechtigung je HE-/BY-/kanonischem GK-Scope ist unabhängig zu prüfen.
Alle Personen,
Organisationen, Daten und Preise im Fall sind erfunden. Die bisherige
41er-Prüfung und ihre Ergebnisse werden dadurch nicht verändert.

## M1 – Auftrag und Geschäftsregeln

LeihZeit bietet Medienkurse für Erwachsene an. Eine Person kann keinen, einen
oder mehrere Kurse buchen; ein Kurs kann noch ohne Buchung existieren. Jede
Buchung gehört genau einer Person und genau einem Kurs. Pro Person und Kurs
gibt es genau einen aktuellen Buchungssatz mit Status `aktiv` oder `storniert`.
Historische Statuswechsel sind hier ausdrücklich nicht Teil des Datenmodells.

Jeder Kurs wird von genau einem Team organisiert; ein Team kann noch keinen
Kurs organisieren. Ein Kurs nutzt keinen Raum, wenn er online stattfindet,
sonst genau einen. Ein Raum kann zu unterschiedlichen Zeiten mehreren Kursen
dienen. In diesem vereinfachten Modell werden Zeiten nicht gespeichert.
Eine Person kann freiwillig genau eine Kontaktadresse hinterlegen; ein
Kontaktdatensatz dieser Tabelle gehört genau einer Person. Pseudonyme sind
keine eindeutigen Schlüssel. Die Kurskapazität begrenzt die Zahl aktiver
Buchungen; diese Zahlenregel ist eine zusätzliche Geschäftsbedingung.

## M2 – Verbindliches Arbeitsschema und vollständige Beispieldaten

Ab A04 gilt dieses geprüfte Arbeitsschema unabhängig von Ihrer Lösung zu A01–A03.
Jede Aufgabe beginnt mit den unveränderten M2-Daten, sofern sie nicht ausdrücklich
ihren eigenen Zwischenzustand weiterbearbeitet. Folgefehler werden nicht mehrfach
als neue Fehlleistung bewertet. Identische
Spaltennamen `pid`, `kid`, `tid`, `rid` beziehen sich auf dieselben Schlüssel.
`?` bezeichnet im Programmiermaterial einen gebundenen SQL-Wertparameter.

```text
Person(pid INTEGER PRIMARY KEY, pseudonym TEXT NOT NULL, ort TEXT NOT NULL)
Team(tid INTEGER PRIMARY KEY, name TEXT NOT NULL)
Raum(rid INTEGER PRIMARY KEY, name TEXT NOT NULL)
Kurs(kid INTEGER PRIMARY KEY, titel TEXT NOT NULL, preis INTEGER NOT NULL,
     maxPlaetze INTEGER NOT NULL, tid INTEGER NOT NULL REFERENCES Team(tid),
     rid INTEGER NULL REFERENCES Raum(rid))
Buchung(pid INTEGER NOT NULL REFERENCES Person(pid),
        kid INTEGER NOT NULL REFERENCES Kurs(kid),
        status TEXT NOT NULL CHECK(status IN ('aktiv','storniert')),
        PRIMARY KEY(pid,kid))
Kontakt(pid INTEGER PRIMARY KEY REFERENCES Person(pid), email TEXT NOT NULL)
```

Person:

| pid | pseudonym | ort |
| --- | --- | --- |
| 1 | ada | Kassel |
| 2 | ben | Kassel |
| 3 | cora | Fulda |
| 4 | dino | Marburg |
| 5 | eva | Fulda |

Team: `(1, Werkstatt)`, `(2, Offene Medien)`, `(3, Archiv)`.
Raum: `(1, Nord)`, `(2, Sued)`.
Kontakt enthält nur `(1, ada@example.invalid)` und `(3, cora@example.invalid)`.

Kurs:

| kid | titel | preis in EUR | maxPlaetze | tid | rid |
| --- | --- | --- | --- | --- | --- |
| 10 | Fotobasis | 20 | 3 | 1 | 1 |
| 20 | Audiolabor | 30 | 2 | 2 | 2 |
| 30 | Videoschnitt | 40 | 2 | 1 | NULL |
| 40 | Datenschutz-Werkstatt | 10 | 4 | 2 | 1 |
| 50 | Archiv &lt;offen&gt; | 15 | 2 | 3 | NULL |

Der tatsächliche Textwert des letzten Titels lautet `Archiv <offen>`; die
Tabellendarstellung oben ist HTML-escaped. Preise sind ganze Eurobeträge.

Buchung, vollständig:

| pid | kid | status |
| --- | --- | --- |
| 1 | 10 | aktiv |
| 2 | 10 | aktiv |
| 3 | 10 | storniert |
| 2 | 20 | aktiv |
| 3 | 20 | aktiv |
| 1 | 30 | aktiv |
| 4 | 30 | aktiv |
| 5 | 40 | aktiv |
| 2 | 40 | storniert |

## M3 – Fehlerbehaftete Altdaten und Änderungsvorschläge

Der alte Export `Export(pid,pseudonym,ort,kid,titel,preis,tid,teamName,status)`
hat den Schlüssel `(pid,kid)`. Die funktionalen Abhängigkeiten sind:

```text
pid -> pseudonym, ort
kid -> titel, preis, tid
tid -> teamName
(pid,kid) -> status
```

Beispieltupel:

```text
(1,ada,Kassel,10,Fotobasis,20,1,Werkstatt,aktiv)
(2,ben,Kassel,10,Fotobasis,20,1,Werkstatt,aktiv)
(2,ben,Kassel,20,Audiolabor,30,2,Offene Medien,aktiv)
```

Der Vorschlag B speichert stattdessen `KursB(kid PRIMARY KEY,titel,tid,teamName)`
und `BuchungB(id PRIMARY KEY,pid,kid,status)`, ohne weitere Constraints.
Beispiel: BuchungB enthält `(701,1,10,aktiv)` und `(702,1,10,storniert)`.
KursB enthält für `tid=1` einmal `Werkstatt`, einmal `Werkstad`.

## M4 – API-, Web- und Berechtigungskarte

Die öffentliche Suche `GET /kurse?maxPreis=30&page=1` zeigt ausschließlich
`kid`, `titel`, `preis`. Pro Seite werden zwei Kurse nach `kid` aufsteigend
angezeigt. Der Filter bleibt bei einem Seitenwechsel erhalten. `maxPreis` ist
eine ganze Zahl von 0 bis 1000, `page` eine ganze Zahl von 1 bis 100.
Beide Parameter müssen genau einmal vorkommen. Fehlerhafte Eingaben erhalten
HTTP 400. Ein leerer gültiger Treffer ist kein Eingabefehler.

Eine Buchung verwendet `POST /buchen` mit `kid` und einem bereits vom Server
ausgestellten `csrfToken`. Die aktuelle Personen-ID kommt ausschließlich aus
der gegebenen authentifizierten Sitzung, nicht aus einem versteckten
Clientfeld. Ein falsches CSRF-Token erhält HTTP 403. Ein korrektes Token
ersetzt weder Anmeldung noch fachliche Berechtigungsprüfung. Für A07/A16 wird
kein OAuth-System neu entwickelt; diese Sitzungsleistung wird gegeben.

Für A08/A17 können Sie Python 3 mit `sqlite3` und `html.escape` verwenden oder
eine gleichwertige Sprache. Es gelten diese API-Verträge:

```text
sqlite3.connect(dateipfad): Verbindung zur gegebenen SQLite-Datenbank
verbindung.execute(sql_mit_fragezeichen, parameter_tupel): Werte getrennt binden
cursor.fetchall(): Liste der Ergebniszeilen
verbindung.close(): Verbindung explizit schliessen (Transaktionskontext allein schliesst sie nicht)
html.escape(text, quote=True): Text für HTML-Text/Attributkontext escapen
urlencode(parameter): URL-Parameter korrekt kodieren
```

Die Referenzprüfungen verwenden SQLite für relationale Abfragen und DDL/DML.
Für DCL gilt gesondert das angegebene SQL-Rollenmodell: `GRANT`/`REVOKE` sind
hier fachliche Befehle für ein SQL-System mit Rollen, nicht SQLite-Befehle.
Die Rollen `auskunft` und `anmeldedienst` existieren bereits. `auskunft` darf
nur die öffentliche Sicht `KursAuskunft(kid,titel,preis)` lesen.
`anmeldedienst` darf Buchungen lesen und einfügen, aber keine Tabellen löschen
oder Kontaktadressen lesen. Sonstige Privilegien werden nicht vorausgesetzt.

Für A06 sind folgende Befehle gegeben; jede Teilfrage startet wieder bei M2:

```sql
SELECT kid FROM Kurs WHERE preis > (SELECT AVG(preis) FROM Kurs);
UPDATE Kurs SET preis=preis+5 WHERE kid=20;
ALTER TABLE Kurs ADD COLUMN sichtbar INTEGER NOT NULL DEFAULT 1;
GRANT SELECT ON KursAuskunft TO auskunft;
```

## M5 – Zusatzanforderung für das komplexere ER-Modell

Für A13 wird M1 um Termine und tatsächliche Teilnahme erweitert. Ein Kurs hat
mindestens einen Termin; ein Termin gehört genau einem Kurs. Jede Teilnahme
verbindet genau eine Person mit genau einem Termin. Personen und Termine
können jeweils noch keine Teilnahme haben. Eine Teilnahme ist nur erlaubt,
wenn die betreffende Person eine aktive Buchung für genau den zugehörigen
Kurs hat. Ein Kurs hat genau eine leitende Person; eine Person darf mehrere
Kurse leiten und zugleich andere Kurse besuchen. Das Leiten verpflichtet
nicht zu einer eigenen Teilnehmerbuchung. Es werden keine Zustandsautomaten,
hierarchischen Zustände oder parallelen Zustandsregionen verlangt.

Gegebene Termine `(terminId,kid)`: `(T10,10),(T20,20),(T30,30),(T40,40),(T50,50)`.
Gegebene Leitung `(kid,pid)`: `(10,1),(20,4),(30,1),(40,3),(50,5)`.

## M6 – Datenschutz, Sicherheit und gegebene Einstellungsmaske

LeihZeit benötigt Buchungsdaten zur vereinbarten Kursdurchführung. Der
Werbepartner möchte zusätzlich verknüpfbare Klickdaten und Kontaktadressen
für eigene personalisierte Werbung. Die Kontaktangabe und Werbeeinwilligung
sind freiwillig; eine Ablehnung darf die Kursbuchung nicht verhindern.
Ein Mitarbeiter hält die Pseudonyme bereits für vollständig anonym.

Normenkarte, didaktisch zusammengefasst: Das Recht auf informationelle
Selbstbestimmung schützt die Entscheidung über personenbezogene Daten.
DSGVO Art. 5 nennt u.a. Zweckbindung, Datenminimierung und Speicherbegrenzung;
Art. 6 verlangt eine passende Rechtsgrundlage. Notwendige Vertragsdaten und
freiwillige Werbung sind zu unterscheiden. Art. 13 verlangt Information;
Art. 25 datenschutzfreundliche Gestaltung; Art. 32 angemessene Sicherheit.
Pseudonymisierte, wieder zuordenbare Daten sind dadurch nicht anonym.
Quellen: [Volkszählungsurteil](https://www.bundesverfassungsgericht.de/SharedDocs/Entscheidungen/DE/1983/12/rs19831215_1bvr020983.html),
[DSGVO](https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX%3A32016R0679).
Die Karte ist der vorgegebene Normenausschnitt für diese Fallbeurteilung.

Aktuelle Sicherheitsorganisation: Alle Mitarbeitenden teilen einen
Administratorzugang. Backups liegen nur auf demselben Notebook; eine
Wiederherstellung wurde nie getestet. Änderungen an Kursplätzen werden ohne
Protokoll und Verantwortlichkeit vorgenommen. Ein verschlüsseltes Backup
allein verhindert weder alle Ausfälle noch alle unberechtigten Änderungen.

Für A18 wird ausschließlich dieses fiktive Einstellungsobjekt geändert:

```json
{"personalizedRecommendations":true,"preciseLocation":true,
 "profilePublic":true,"analyticsRetentionDays":365}
```

Zulässige Speicherfristen für die optionalen Analysedaten sind 7, 30, 365 Tage.
Eine Änderung löscht keine gesetzlich notwendigen Buchungsbelege. Es wird
kein echtes Konto geöffnet und kein realer Lernzustand verändert.

## M7 – Große Datenmengen und Map-Reduce-Material

Die Buchungsdatenbank muss eindeutige Buchungen, konsistente Beziehungen und
verlässliche Transaktionen sichern. Separat fallen laut Fallannahme täglich
100 Millionen Klickereignisse mit wechselnden Zusatzfeldern an. Analysen
fragen vor allem nach Zeitraum und Kurs; um Minuten verzögerte Statistik ist
hier akzeptabel. Gegeben sind als mögliche Organisationsformen relationale
Tabellen, JSON-Dokumente und Wide-Column-Speicher. Keine Organisationsform
garantiert allein mehr Geschwindigkeit oder Sicherheit.

Der vollständige kleine Map-Reduce-Eingang für A21 ist:

| Ereignis | Partition | kid | optionales Zusatzfeld |
| --- | --- | --- | --- |
| e1 | P1 | 10 | quelle=suche |
| e2 | P1 | 20 | quelle=start |
| e3 | P1 | 10 | geraet=mobil |
| e4 | P2 | 30 | quelle=suche |
| e5 | P2 | 20 | kein Zusatzfeld |
| e6 | P2 | 10 | kampagne=herbst |

Gesucht ist die Aufrufzahl je Kurs. Ein Mapper verarbeitet ein Ereignis und
gibt Schlüssel-Wert-Paare aus. Shuffle gruppiert gleiche Schlüssel; Reduce
fasst die zugehörigen Werte zusammen. Die Bedeutung dieser drei Schritte
muss an den konkreten Daten gezeigt werden, nicht nur benannt werden.

## M8 – Geschäftsmodell und gefilterte Empfehlung

Die sechs Aufrufe aus M7 sind keine repräsentative Bevölkerungsstichprobe.
Die ungesponserte Sortierung verwendet ihre Aufrufzahlen. Im Vorschlag W
bekommt Kurs20 zusätzlich zehn Rangpunkte durch Sponsoring; sonst gibt es
keinen Bonus. LeihZeit verkauft 2000 gekennzeichnete Werbeeinblendungen zu
5 EUR je 1000 Einblendungen. Als bekannte direkte Kosten fallen 6 EUR an;
andere Kosten sind für diese Teilrechnung nicht enthalten.

Vorschlag F zeigt danach nur noch Themen, auf die die Person schon geklickt
hat, und blendet andere Themen ohne Hinweis aus. Alternative N bietet eine
ungefilterte Übersicht sowie abschaltbare, als Werbung markierte Empfehlungen.
Bewertet werden sollen Einnahmen, die Bedeutung von Datenfilterung und
mögliche Auswirkungen auf Wahrnehmung/Auswahl. Eine tatsächliche kausale
Meinungswirkung ist mit diesen sechs Ereignissen nicht nachgewiesen.
