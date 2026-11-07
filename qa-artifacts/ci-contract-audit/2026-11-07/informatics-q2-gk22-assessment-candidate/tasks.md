# Aufgaben: LeihZeit – privater 22-Ziele-Materialentwurf

Bearbeiten Sie alle 22 Aufgaben mit M1–M8. Lösungen müssen konkrete Modelle,
Abfragen, Ergebnisse, Code oder begründete Fallurteile enthalten. Reine
Begriffslisten und der Verweis auf eine andere gelöste Aufgabe reichen nicht.
Für SQL sind gleichwertige Standardlösungen zulässig. Für Webcode ist eine
gleichwertige Sprache bei erkennbarer Parameterbindung/HTML-Kodierung zulässig.
Jede Aufgabe besitzt ein eigenes Kriterium mit maximal fünf Punkten.

## A01 – ER-Modell anwenden

Modellieren Sie M1 mit Entitäten, Beziehungen, Schlüsseln sowie Mindest- und
Höchstbeteiligungen. Die freiwillige Kontaktangabe und der Onlinekurs ohne
Raum müssen sichtbar sein. Eine präzise textuelle Min-Max-Notation ist zulässig.

## A02 – Relationenschemata ableiten

Leiten Sie aus M1 die Tabellen samt Primär-/Fremdschlüsseln ab. Begründen Sie
die Zwischentabelle Buchung, deren zusammengesetzten Schlüssel und die
Darstellung der optionalen Kontaktangabe. Markieren Sie zulässige NULL-Werte.

## A03 – Bis zur dritten Normalform normalisieren

Zeigen Sie an M3 je eine konkrete Änderungs-, Einfüge- und Löschanomalie.
Normalisieren Sie den Export nachvollziehbar über 1NF und 2NF bis 3NF.
Nennen Sie die verwendeten Abhängigkeiten und begründen Sie die verlustfreie
Verknüpfung Ihrer Zerlegung anhand der Schlüssel.

## A04 – Selektieren, projizieren, verknüpfen und sortieren

Schreiben Sie eine SQL-Abfrage, die Pseudonym, Kurstitel und Preis für aktive
Buchungen von Personen aus Kassel bei Kursen ab 20 EUR ausgibt. Sortieren Sie
nach Preis absteigend, dann Pseudonym aufsteigend. Geben Sie das vollständige
Ergebnis für M2 in dieser Reihenfolge an.

## A05 – Gruppieren und aggregieren

Ermitteln Sie für jeden Kurs, auch ohne aktive Buchung, dessen ID, aktive
Buchungszahl und geplanten Umsatz aus aktiven Buchungen. Stornierungen zählen
nicht; Kurs50 muss mit null Buchungen und null Umsatz erscheinen. Geben Sie
SQL und alle Ergebniszeilen an. Formulieren Sie danach die zusätzliche
Gruppenbedingung „mindestens zwei aktive Buchungen“ und nennen Sie die
verbleibenden Kurs-IDs. Begründen Sie, weshalb COUNT(*) beim LEFT JOIN hier
ein falsches Ergebnis liefern kann.

## A06 – Erweiterte SQL-Bereiche beschreiben

Erläutern Sie jeden der vier gegebenen Befehle in M4 fachlich: innerer und
äußerer Abfrageschritt samt konkretem Ergebnis, Wirkung des UPDATE auf M2,
Schemaänderung mit Vorgabewert sowie Reichweite der Berechtigung. Ordnen Sie
DML, DDL und DCL zu; unterscheiden Sie die beschreibende Teilfrage von der
tatsächlichen Anwendung in A15.

## A07 – HTML-Formular an den Server anbinden

Schreiben Sie ein benutzbares HTML-Formular für die öffentliche Kurssuche
aus M4 mit beschriftetem Preisfeld und Startseite1. Zeigen Sie die tatsächliche
Request-URL für maxPreis30. Entwerfen Sie außerdem das Buchungsformular mit
Methode, Ziel, Kursparameter und gegebenem CSRF-Token; begründen Sie GET/POST.
Die Personen-ID darf nicht aus einem versteckten Clientfeld übernommen werden.

## A08 – SQL aus einem Programm ausführen

Implementieren Sie für die Kurssuche den Verbindungsaufbau, eine parametrisierte
SQL-Abfrage für Preisfilter, Reihenfolge und Seitengröße2 sowie die Iteration
über das Ergebnis. Nutzen Sie maxPreis30/page1 und nennen Sie die beiden
resultierenden Kurse. Kennzeichnen Sie die Verbindungslaufzeit und die von
SQL-Code getrennten Parameter. Es reicht nicht, SQL nur als Text anzuzeigen.

## A09 – Informationelle Selbstbestimmung und Rechtsgrundlagen

Beurteilen Sie M6: Sind die Pseudonyme anonym? Unterscheiden Sie den Zweck
der notwendigen Kursbuchung von personalisierter Werbung. Erläutern Sie
informationelle Selbstbestimmung und mindestens zwei passende
Datenschutzprinzipien mit konkreter Anwendung. Ordnen Sie anhand der
Normenkarte eine geeignete Grundlage für notwendige Vertragsdaten und für
die hier freiwillige Werbung ein; benennen Sie auch die Informationspflicht.

## A10 – Datensicherheit organisatorisch umsetzen

Erstellen Sie für die drei Sicherheitsmängel aus M6 einen Maßnahmenplan mit
Sicherheitsziel, konkreter Maßnahme, Zuständigkeit und überprüfbarer Kontrolle.
Vertraulichkeit, Integrität und Verfügbarkeit müssen vorkommen. Begründen Sie
mindestens zwei organisatorische Maßnahmen und einen verbleibenden Restrisikoaspekt.

## A11 – Relationenalgebra-Grundoperatoren anwenden

Verwenden Sie die Daten aus M2: (a) bilden Sie die Selektion der Personen aus
Kassel und projizieren Sie deren Pseudonyme; (b) bilden Sie das kartesische
Produkt dieser beiden Personen-IDs mit den Kurs-IDs der Kurse bis20EUR und
geben Sie alle Paare an; (c) verknüpfen Sie die Kasseler Personen mit ihren
aktiven Buchungen und den Kurstiteln. Notieren Sie jeweils die Operatoren
und die konkreten Ergebnisse. Relationenalgebra verwendet Mengen.

## A12 – Abfrageterm entwickeln und in SQL überführen

Gesucht sind unterschiedliche Pseudonyme aus Kassel mit mindestens einer
aktiven Buchung eines Kurses bis20EUR. Entwickeln Sie zuerst einen
Relationenalgebra-Term und überführen Sie ihn in SQL. Erläutern Sie die
Entsprechung von Selektion/Join/Projektion und geben Sie das Ergebnis an.

## A13 – Kardinalitätsregeln im komplexeren ER-Modell begründen

Erweitern Sie M1 um M5. Geben Sie alle Beteiligungsgrenzen für
Kurs–Termin, Person–Teilnahme–Termin und Person–leitet–Kurs an. Zeigen Sie an
einem konkreten unzulässigen Teilnahmetupel aus M2, warum die zusätzliche
Buchungsbedingung nötig ist. Formulieren Sie diese Bedingung präzise und
erklären Sie, was die reinen binären Kardinalitäten allein nicht ausdrücken.

## A14 – Ein Schema auf Konsistenz prüfen

Prüfen Sie Vorschlag B aus M3 hinsichtlich Schlüssel, Redundanz und
Konsistenz. Zeigen Sie an beiden konkreten Beispielen die Probleme.
Formulieren Sie geeignete Schlüssel-/Referenz-/Werteconstraints. Begründen
Sie, weshalb die zusätzliche ID in BuchungB die Person-Kurs-Eindeutigkeit
nicht ersetzt und warum widersprüchliche Bestandsdaten geklärt werden müssen.

## A15 – DDL, DML und Berechtigungen anwenden

Schreiben Sie DDL für `Hinweis(kid,text)` mit Kursreferenz und höchstens einem
Hinweis je Kurs. Fügen Sie für Kurs10 den Text `Kamera mitbringen` ein, ändern
Sie ihn in `Geladene Kamera mitbringen` und löschen Sie diesen Hinweis wieder.
Erzeugen Sie die öffentliche Sicht KursAuskunft und formulieren Sie im
Rollenmodell aus M4 die nötigen GRANT-/REVOKE-Befehle für beide Rollen.
Entziehen Sie `auskunft` explizit einen versehentlich vergebenen Person-Lesezugriff.

## A16 – GET-/POST-Parameter absichern

Implementieren oder präzisieren Sie die serverseitige Validierung von M4.
Entscheiden Sie mit Fehlercode für maxPreis=`0 OR 1=1`, page=`-1`, zwei
page-Parametern und falschem POST-CSRF-Token. Zeigen Sie die sichere SQL-Wertbindung
und Sessionzuordnung. Erläutern Sie, warum POST allein keine Datenverschlüsselung,
SQL-Injection-Abwehr oder fachliche Zugriffsprüfung liefert.

## A17 – Ergebnis-HTML und Pagination implementieren

Implementieren Sie aus A08 eine HTML-Tabelle mit Preisfilter und funktionierenden
Vor-/Zurück-Links. Zeigen Sie Seite1 und Seite2 für maxPreis30, einschließlich
korrekter Links und der Darstellung von `Archiv <offen>`. Geben Sie das
Verhalten bei einer gültigen leeren Seite an. Benutzereingaben dürfen nicht
als HTML ausgeführt werden.

## A18 – Eigene Datenschutzeinstellungen tatsächlich ändern

Geben Sie für das fiktive Einstellungsobjekt aus M6 eine konkret geänderte,
gültige Konfiguration an und wenden Sie sie auf eine private Kopie an oder
protokollieren Sie die vier neuen Werte. Begründen Sie mindestens drei
Änderungen mit Risiko und bewusster Abwägung eines entfallenden Komforts.
Trennen Sie optionale Analyseverarbeitung von nötigen Buchungsdaten.

## A19 – Einen komplexeren relationalen Term schrittweise übersetzen

Überführen Sie diesen geschachtelten Term schrittweise in SQL und bestimmen
Sie jedes Zwischenergebnis für M2. Geben Sie bei B die Person-Kurs-Paare,
bei C die Kurs-ID mit Teamnamen und bei D die vollständigen Tupel an:

```text
A = Selektion_ort='Kassel'(Person)
B = Selektion_status='aktiv'(Buchung)
C = Selektion_preis<=30(Kurs) JOIN Team
D = Projektion_pseudonym,titel,name ((A JOIN B) JOIN C)
```

Zeigen Sie, wie die innere Verknüpfung in C und die äußeren Verknüpfungen
sowie Bedingungen in Ihrer SQL-Abfrage wiederzufinden sind. Geben Sie D
geordnet nach Pseudonym und Kurs-ID an. 
## A20 – Datenorganisationsformen begründet einordnen

Vergleichen Sie für beide Arbeitslasten aus M7 relationale Tabellen,
Dokument- und Wide-Column-Speicher. Wählen Sie begründet für Buchung und
Klickanalyse. Benennen Sie je eine Grenze der Wahl; erläutern Sie,
warum weder „groß“ noch „NoSQL“ allein eine technische Qualitätsgarantie ist.

## A21 – Map-Reduce an konkreten Daten erklären

Zeigen Sie sämtliche Map-Ausgaben beider Partitionen, die Shuffle-Gruppen
und die Reduce-Ergebnisse für M7. Erklären Sie, welche Arbeit parallel
erfolgen kann und weshalb eine andere Aufteilung bei derselben Zählfunktion
dieselben Endzählungen liefert. Gefordert ist das einfache Verarbeitungsprinzip,
keine Hierarchie/Parallelität von Zustandsautomaten und kein Clusterbetrieb.

## A22 – Daten als Wirtschaftsfaktor bewerten

Berechnen Sie mit M8 Werbeerlös und bekannten direkten Überschuss sowie
die ungeförderte und gesponserte Kursreihenfolge. Bewerten Sie W/F gegenüber N
mit mindestens einem wirtschaftlichen Vorteil, einem Datenschutzrisiko und
einer konkret datenbezogenen Wirkung der Filterung auf Wahrnehmung/Auswahl.
Grenzen Sie eine plausible Einflussmöglichkeit von einem hier nicht
nachgewiesenen kausalen Meinungsbildungseffekt ab.
