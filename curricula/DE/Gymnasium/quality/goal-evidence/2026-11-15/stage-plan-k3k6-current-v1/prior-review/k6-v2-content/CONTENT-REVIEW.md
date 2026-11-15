# Unabhängiges Inhaltsreview K6/Bayern v2

**Entscheidung: REVISE.** Stand: 15.11.2026, 10:13 MEZ (UTC+01:00).

Gegenstand ist ausschließlich der versiegelte Kandidat unter
`tmp/physics-rate-k6-delivery-20261115-v2/`, Manifest-SHA-256
`f73a99a3d654fc8693c17492e44bd11919eb5decc29dace2e4c8f5189e368cb3`.
Alle 112 Dateipins wurden selbst nachgerechnet. Auch die 90 Pins der v1
stimmen weiterhin. Dieses Review verändert weder aktive Daten noch Kandidaten,
Lernendenresultate oder historische Evidenz.

Die beiden ursprünglichen Blocker R1/R2 und die drei alten direkten
d675-Abdeckungsbehauptungen sind in dieser Fassung sachgerecht repariert.
Die folgenden drei Restdefekte verhindern die volle Inhaltsfreigabe.

## R3 – Das volle d675 wird ohne s(t)-/v(t)-Diagramm bestanden

Betroffene Identitäten und Felder:

- `d67502e3-5e0a-595b-a24b-65b1c40de36e`: erhaltene DE/EN-Beschreibung und
  positives Profil, insbesondere `calibrate-and-derive-motion-data`.
- `6345871e-eab4-59c1-a3b6-8456ab9bd7df`:
  `examData.taskContent`, `taskContentEn`, `solutionContent`,
  `solutionContentEn` und `scoring.steps`;
  `assessment-texts/video-models.md`, Zeilen 7–15 und 30–37.

Das volle Ziel verlangt ausdrücklich s(t)- und v(t)-Diagramme. Das Profil
verlangt, aus dem Video s(t)- und v(t)-Darstellungen zu erzeugen, und sein
Wurf-Anwendungsfall verlangt auch v_x(t) und v_y(t). Die neue Aufgabe verlangt
Aufnahmen, Rohdatentabellen, Parameter, Residuen, einzelne Intervallrechnungen
und Sensitivitätsfits. Sie fordert in keiner Sprache die daraus erzeugten
Bewegungsdiagramme. Auch keines der acht zwingenden Kriterien enthält diese
Leistung. Eine Parametertabelle oder zwei Intervallzahlen sind kein
Geschwindigkeitsdiagramm aus der Videoauswertung.

**Konkreter Fehlpass als Rasterreplay:** Eine Einreichung enthält zwei gültige,
verschiedene Originalvideos und die gesamte verlangte Kalibrier-/Zeit-/Pixelkette.
Sie enthält alle Fits, Parameter, Residuenzahlen, das lineare Gegenmodell,
Intervallrechnungen und tatsächlichen Sensitivitätsrefits. Sie zeichnet weder
ein Orts-Zeit- noch ein Geschwindigkeits-Zeit-Diagramm und gibt insbesondere
keinen v_y(t)-Verlauf ab. Trotzdem erfüllt sie jedes der acht gedruckten
Vier-Punkte-Kriterien und erreicht 32/32. Das frühere ce als Voraussetzung
beweist nicht die neue Video-zu-Diagramm-Leistung an den unabhängigen Aufnahmen.
Dies ist ein logisch geprüftes Einreichungsszenario; es wurden keine tatsächlichen
Schüleraufnahmen vorgetäuscht.

**Erforderliche Reparatur:** Die aus der echten Auswertung erzeugten, mit
Achsen und Einheiten beschrifteten Orts- und Geschwindigkeitsdiagramme
verbindlich in Aufgabe, Lösung und zwingenden Kriterien verlangen: für A
die eindimensionalen Darstellungen, für B die getrennten Komponenten mit
gekennzeichnetem Intervallbezug beziehungsweise begründetem Modellverlauf.
Die Datenherkunft sowie die Verbindung zwischen Rohpunkten, Modell und
Geschwindigkeitsdarstellung müssen überprüfbar sein. Das volle Ziel/P bleibt
erhalten; keine fiktive Voraussetzung und keine neue Abdeckung aus C allein.

## R4 – Die neu beanspruchte Ph8.3.6-Planung wird nicht vollständig entwickelt/geprüft

Betroffen:

- `677a192d-8bbe-57fc-bb7a-1c1ed5fba32b`: DE/EN-Beschreibung und positives
  Profil, vor allem `guided-real-acquisition` und beide Anwendungsfälle.
- `7c2a3450-9b82-54e6-b302-358a964b34ec`: DE/EN-Aufgabe, Lösung und Raster;
  `assessment-texts/by-ph8-guided-acceleration.md`, Zeilen 7–12, 20–22, 28.
- BY-Mappingentscheidung für `5be2d963-0510-5a61-a42a-820980bca521`,
  `sourceSpan=Ph8.3.6`, `canonicalGoalIds=[677a192d…]`.

Die selbst gelesene aktuelle
[amtliche Ph8-Seite](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/8/physik)
fordert an dieser Stelle auch angeleitete Planung. Die neue Mappingbegründung
beansprucht diese ausdrücklich. Ziel und Profil entwickeln jedoch nur
Durchführung/Auswertung. Die deutsche Aufgabe fordert keinen Plan vor der
Erfassung. Der englische Aufgabentext ergänzt dagegen im ersten Absatz eine
vorherige Skizze und begründete Geräte-/Zeitbasiswahl. Weder deutsche Fassung
noch Lösungen/Raster stellen diese Leistung gleichwertig verbindlich sicher.

**Konkreter Fehlpass:** Eine Person folgt einem vollständig vorgegebenen
Messrezept, reicht zwei echte eigene Durchgänge und nachträgliche Aufbaunotizen
ein, rechnet alle Fenster korrekt aus und deutet Grenzen richtig. Sie plant
selbst unter Anleitung keinen Versuch und erstellt vorab keinen Plan. Die
deutsche Aufgabe und alle drei gedruckten Kriterien lassen trotzdem 16/16 zu.
Der tatsächliche Aufbau allein belegt nicht seine vorherige Planung.

**Erforderliche Reparatur:** Den kleinen angeleiteten Planungsanteil in das
neue Atom und P aufnehmen und in beiden Aufgaben-/Lösungsfassungen sowie
einem zwingenden Kriterium prüfen: sichere Aufbauskizze/Messplan vor der
Erfassung, begründete tatsächliche Zeitbasis sowie geplante Messfenster.
Die zulässige Unterstützung bleibt erhalten. Quelle und Mapping dürfen
anschließend genau diese nachprüfbare eigene Operationalisierung ausweisen.

## R5 – Ein korrekter Beschleunigungsvergleich ohne auflösbaren Unterschied muss bestehen können

Betroffen: `7c2a3450…`, beide Aufgabentexte Schritt 3 und
`scoring.steps[id=ph8_accel_3]`; dazu die Lösungen in beiden Sprachen.

Die zweite Untersuchung darf eine geänderte Anfangsbedingung haben. Die
Aufgabe verlangt dann zwingend eine beobachtete Abweichung; das deutsche
Sechs-Punkte-Kriterium verlangt eine begründete konkrete Abweichung. Eine
geänderte Anfangsgeschwindigkeit muss aber die Beschleunigung nicht ändern.
Die englische Rasterhälfte lässt allgemeiner einen evidenzbezogenen Vergleich
zu. Beide Fassungen müssen dieselbe faire Bestehensbedingung haben.

**Numerisch tatsächlich nachgerechneter Fair-pass-Gegenfall:** Benutze die
Fenster [0,10;0,20] s und [0,50;0,60] s. Durchgang 1 hat Verschiebungen
0,04/0,12 m, Durchgang 2 bei geänderter Anfangsgeschwindigkeit 0,06/0,14 m.
Damit ergeben sich Geschwindigkeiten 0,40/1,20 und 0,60/1,40 m/s. Beide
Beschleunigungswerte sind 2,0 m/s². Die idealisierten Zeugenbahnen
x₁(t)=0,1t+t² und x₂(t)=0,3t+t² (SI) sind physikalisch konsistent; die Zahlen
können innerhalb realer Auflösung auftreten. Dies sind explizite rechnerische
Review-Zeugen, keine angeblichen realen Messungen.

Eine echte Einreichung mit entsprechender nachvollziehbarer Aufnahme und
der Aussage „kein Unterschied innerhalb unserer Messauflösung erkennbar;
veränderte Anfangsgeschwindigkeit beweist keine veränderte Beschleunigung“
erfüllt das positive Zielprofil. Sie kann aber die erzwungene Abweichung
nicht wahrheitsgemäß liefern. Sie darf keine Reibungs-/Perspektivursache
erfinden, nur um alle notwendigen Punkte zu erhalten.

**Erforderliche Reparatur:** In DE und EN sowie Lösung und Raster einen
evidenzbezogenen Vergleich zulassen: beobachtete Abweichung vorsichtig
einordnen **oder** Übereinstimmung innerhalb der tatsächlichen Messgrenzen
begründen. Die zweite unabhängige reale Erfassung und ihre dokumentierte
veränderte Bedingung bleiben zwingend.

## Bestätigte Reparaturen und fachlicher Kern

R1 der v1 ist behoben: B verlangt nun ein unabhängiges eigenes reales Wurfvideo,
mindestens zehn Flugpunkte, alle fünf selbst geschätzten Komponentenparameter,
Residualreihen und einen tatsächlichen vertikalen linearen Gegenfit. Re-Markierung
und veränderte Kalibrierlänge müssen neu angepasst werden. Die Aussage der
wenigen Sensitivitätsfälle wird korrekt auf eine begrenzte, nichtstatistische
Empfindlichkeitsanalyse beschränkt. Zeitnullpunkt und unbekanntes Abwurfereignis
werden sachgerecht getrennt. Das v1-Substitutionsrezept ohne eigenen Wurffit
verliert mindestens die vier B-Kriterien und besteht nicht mehr.

Die CSV wurde mit eigenem `numpy.linalg.lstsq` erneut gerechnet: B=1,85 m/s,
E=−4,903138528… m/s², a_y=−9,806277056… m/s². Die beiden Skalierungen liefern
B=1,8315/1,8685 m/s und a_y=−9,708214286/−9,904339827 m/s². Die gegensätzlichen
Trackingvarianten liefern a_y=−9,724025974/−9,888528139 m/s². Ein linearer
vertikaler Fit ist deutlich schlechter. Alle Residuen und Fits stehen im
eigenen Rechenbeleg. Synthetische C-Daten ersetzen keine der zwei Aufnahmen.

R2 der v1 ist behoben: Der vollständige aktuelle Coulomb- und
Termwert-P-Zuschnitt wurde gelesen. `8da5c981 -> a6469c01` sichert die
Mehrvariableneinsetzung mit Vorzeichen, Potenzen und Klammern gezielt am
Coulomb-Einstieg. Alle 31 Ziele einschließlich Coulomb und sämtlicher
Nachfolger besitzen diese Vorbereitung. bbee erhält keine pauschale
Funktionsauswertung zurück. Die durch die neue Kante redundante
`ce14a7e7 -> a6469c01` entfällt bei erhaltener alternativer Kette.

Die drei bisherigen direkten d675-Claims in `367b17f8`, `0432a422` und
`7f83e25c` sind entfernt; ihre eigentlichen Aufgaben, Lösungen und Scorings
sind exakt erhalten, der Prüfvertrag ist `needs_review`. Die volle
Experimentkompetenz ist auch keine unnötige Voraussetzung dieser
Papieraufgaben mehr. Nur `6345871e` behauptet im Kandidaten noch direkt
die volle d675-Abdeckung. Das ist eine statische Vertragskorrektur und
kein Widerruf oder Umschreiben historischer Lernendenresultate.

ce trennt die eigene Bewegungserfassung vom gelieferten unabhängigen
Rechteckflächenmodell. Das Modell liefert 8/8/5 m, und die Achsenumkehr wird
korrekt interpretiert. e4b enthält echte Umkehr bei 2,5 s, 4,75 m sowie
Δs=2 m gegenüber Strecke=2,5 m; die Bremsfortsetzung über den Stillstand
wird fachlich begrenzt. bbee verwendet Nettozählwertdifferenzen und trennt
Puls- von Zyklusmitteln. Die 30 s gelten für das ausdrücklich geforderte
Ende nach fünf vollständigen Zyklen. ae201 bleibt als vollständiges
Goal-Objekt unverändert; seine Nichtlinearität wird nicht in die numerische
Grundratenbrücke verschoben.

Die beiden frühen BY-Atome entwickeln reale maßstäbliche Videopfeile bzw.
eine echte angeleitete Beschleunigungserfassung ohne globalen Wurffit.
Zwei frische Clips beziehungsweise Durchgänge sind verbindlich, mit echter
Variation; ein Achsenvorzeichenwechsel derselben Tabelle genügt nicht.
Fensterbreite und Mittenabstand werden korrekt getrennt, die endliche
Mittelpunktzuordnung ausdrücklich als Näherung begrenzt. R4/R5 betreffen
die verbleibende Quellen-/Prüfvertragsvollständigkeit dieses Ansatzes.

## Quellen, Bilder und Projektionen

Die drei Primärseiten wurden selbst aktuell geöffnet und zusätzlich mit
HTTP 200 in diesem Reviewverzeichnis archiviert. Abrufbelege stehen in
`source-fetch.actual.json`.

- [BY Ph8](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/8/physik):
  frühe 2D-Pfeile, grafische Geschwindigkeitsänderung und angeleitete
  Beschleunigungsuntersuchung tragen die gewählten frühen Operationalisierungen.
  Video ist bei letzterer eine Alternative zum Sensor. Der NTG-Profilbereich
  wird nicht allgemein verpflichtend. Die allgemeine Auswahl-/Demonstrationsregel
  beweist keine individuelle Durchführung aller Experimente.
- [BY Ph10](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/physik):
  digitale Zeit-Ort-/Zeit-Geschwindigkeitsdiagramme, lineare/quadratische
  Funktionen und komponentenweiser waagrechter Wurf stützen den späteren
  Modell-/Videozuschnitt. Der volle individuelle eigene Zweivideo-Nachweis
  bleibt eigene SkillPilot-Operationalisierung.
- [BW 7/8 Kinematik](https://www.bildungsplaene-bw.de/,Lde/BP2016BW_ALLG_GYM_PH_IK_7-8_06):
  Bewegungsdiagramme und Quotient aus Strecke/Zeitspanne tragen den frühen
  numerischen Zugang; die zusätzlichen signierten Transferfälle werden
  ausdrücklich als eigene Brücke bezeichnet.

Alle acht PNGs wurden tatsächlich visuell betrachtet und mit Task-/CSV-/SVG-
Inhalten abgeglichen. Pfeilrichtungen und gemeinsamer Maßstab, Zeitfenster,
Rohpunktlagen und Vorzeichen stimmen. Die englische Temperaturachse ist
jetzt tatsächlich englisch. Es wurde kein sachlicher Bildfehler gefunden;
die einzelnen betrachteten Materialpins stehen in `reviewed-material-pins.json`.

Die nativen Projektionsfunktionen wurden unabhängig für 69 Views ausgeführt.
Kein bisheriger atomarer Zielumfang einer ganzen View geht verloren. Die
vollen e4b/d675-Ziele stehen in den beiden BY-Vollsichten in Ph10.3, die
neuen frühen Atome/Aufgaben in Ph8.3. Die bekannte frühe Newton1→e4b-
Vorbereitung bleibt bestehen und wird hier weder repariert noch als neuer
Ablehnungsgrund eingeführt. Kein realer Stufenplan wurde aktiviert.

**Zählkorrektur für die nächste Fassung:** Die 88 Einfügungen der fünf
allgemeinen neuen Assessments sind nachvollziehbar. Hinzu kommen vier
Vieweinträge der beiden neuen frühen BY-Aufgaben. Insgesamt enthalten die
Views damit 92 neue Assessment-Einträge; diese Aufteilung sollte in
Manifest/Managementbericht ausdrücklich stehen. Dies ist eine Präzisierung
der Metrik und kein weiterer fachlicher Blocker.

## Tatsächlich ausgeführte Prüfungen und Grenzen

- **97 eigene statische/numerische Prüfungen**, vollständig erfolgreich:
  `independent_probe.py` und `independent-checks.actual.json`.
- **Nativer Graphprüfer**, vollständiger versiegelter 21-Dokument-Katalog:
  Exitcode 0, 21 Wurzeln bestanden; eigener Beleg `native-graph.actual.json`.
- **Native Wissenskontexte** für 21 betroffene Atome:
  `native-knowledge-contexts.actual.json`; normale Ziele werden nach der
  nativen Definition von Assessments/Orientierung unterschieden. Die
  berichteten vollen Roh-Closures zählen dagegen sämtliche vorausgesetzten
  Atome. Beide Mengen sind nicht dieselbe Metrik.
- **Native Projektion** aller 69 Views ohne verlorene bisherige Viewtargets:
  `native-projections.actual.json`.
- **Nur Dry-run** des versiegelten Anwendungsskripts: 25 Zieloperationen,
  69 ergänzende Dateien, 32 Artefaktkopien; keine Anwendung.

Alle 340 geänderten bestehenden Voraussetzungsmengen wurden unabhängig
berechnet und stimmen ID für ID mit dem Autoreninventar überein; sie bilden
15 Signaturen. Die Hauptzahlen sind ce 47→33, e4b 53→54, d675 45→60,
bbee 35→24 und ae201 32→32. Die vollständigen Zu-/Abgänge stehen in
`independent-closure-inventory.json`. Die stärksten Verluste, der gesamte
31-Ziele-Coulombzweig und die geänderten frühen Bewegungs-/Messkontexte
wurden inhaltlich risikobezogen geprüft. Dies ist keine vollständige neue
fachliche Rezension aller 340 Nachfolger oder ihrer historischen Prüfungen.

Die manuellen Leistungsgegenbeispiele mit konkreten Rechnungen und
Kriteriumsreplay stehen zusätzlich in `COUNTEREXAMPLES.md`. Zahlenprüfungen,
statische Rasterbeurteilung und Quellenreview sind keine durchgeführten
Lernendenexperimente, Humanstudien oder Wirksamkeitsnachweise. Eine volle
neue Freigabe der anderen Claims breiter alter Klausurvorlagen wird nicht
erteilt. Native D/P/SEM/MEM/V-/Quellen-/Routenbindungen, geschützte Floors,
Integration und frische erfolgreiche Main-CI bleiben eigener nachfolgender
Prüfumfang. Nach R3–R5 ist ein neuer unveränderlich versiegelter Kandidat
mit gezieltem frischem unabhängigen Review erforderlich.
