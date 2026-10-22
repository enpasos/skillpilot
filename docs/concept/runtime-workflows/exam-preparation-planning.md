# Klausurstoff, Aufgabenabdeckung und Vorbereitung

Die Kursplanung verbindet einen Klausurtermin mit ausdrücklich ausgewählten
Themen und Aufgabenpaketen. Die Auswahl hat keine Prioritäten. Der Meilenstein
beschreibt den Termin und seinen ausdrücklich gewählten Lernumfang. Erst
datierte Lernabschnitte erzeugen ein Wochenpensum und eine zeitliche Bilanz.
Der Einstieg liegt unter **Kursplanung → Kurs öffnen → Planung**.

## Drei verschiedene Aussagen

| Bereich | Bedeutung |
| --- | --- |
| Klausurstoff | Ausgewählte Themen und ihre sichtbaren `contains`-Unterbäume. |
| Aufgabenabdeckung | Die expliziten `examData.coveredGoalIds` der ausgewählten Aufgabenpakete. |
| Vorbereitung | Noch offene Lernziele und erforderliche Grundlagen, die vor dem Termin bearbeitet werden sollen. |

Die Abdeckungsansicht zeigt beide Mengenrichtungen: ausgewählte Themen ohne
zugeordnete Aufgabe und zusätzliche Themen der Aufgaben. Verfügbare Aufgaben
zählen erst nach Auswahl als gewählte Pakete. Prüfungsziele werden getrennt
von Lernthemen gezählt. Gleiche kanonische Ziele zählen jeweils nur einmal.

Eine `requires`-Kante begründet Vorbereitung, keine geprüfte Leistung. Eine
Zuordnung in den Metadaten ist außerdem kein neuer fachlicher Qualitätsnachweis.
Die Oberfläche spricht deshalb von hinterlegter Themenzuordnung. Fehlende oder
ungültige Aufgabeninhalte, Freigaben oder Zuordnungen begründen keine
Vollständigkeitszusage. Nicht verfügbare Aufgaben werden ausgewiesen und nicht
eingeplant; offene Metadaten verhindern die Planung gültiger ausgewählter
Themen und verfügbarer Aufgaben nicht.

Verweist die Aufgabenabdeckung auf einen kanonischen Cluster, den die
Kursansicht in einzelne Ziele auflöst, darf die Referenz diese bereits sichtbaren
Ziele zusammenfassen. Sie darf keine ausgeblendeten Ziele in den Kurs aufnehmen.

Für die Kinematik ergänzen zwei einzeln auswählbare Aufgabenpakete unter
**Physik → E-Phase → Übungen** das Angebot: **Senkrechter Wurf: Vorzeichen,
Scheitelpunkt und Rückkehr** und **Waagerechter Wurf: Zwei Bewegungen, eine
gemeinsame Zeit**. Beide enthalten sechs Teilaufgaben mit 36 BE, vollständige
Lösungen und Bewertungsraster auf Deutsch und Englisch. Sie prüfen schriftlich
Bewegungsgesetze, Diagramme und Begründungen ohne Vektorrechnung; praktische
Experimentierkompetenz wird dadurch nicht nachgewiesen. Fachliche
Voraussetzungen und tatsächlich geprüfte Lernziele werden getrennt zugeordnet.

## Vorbereitung vervollständigen

Am gespeicherten aktiven Klausurtermin öffnet **Vorbereitung vervollständigen**
eine Vorschau. Für einen angeschlossenen Lernenden verwendet sie die bereits
gespeicherte Planungsbasis oder lädt sie, wenn noch keine vorhanden ist.
Ohne persönlichen Lernstand werden alle benötigten Ziele als
offen behandelt. Die Vorschau unterscheidet bereits beherrschte, rechtzeitig
eingeplante und noch zu ergänzende Ziele, zusätzliche Grundlagen und offene
Zuordnungen. Der Zeitraum endet vor dem Klausurtermin und enthält mindestens
einen Werktag. Das Öffnen der Vorschau verändert keinen Plan.

Standardmäßig wird nur die ausdrückliche Auswahl vorbereitet. Zusätzliche
Aufgabenthemen und Grundlagen sind Vorschläge; eine optionale, zunächst
ausgeschaltete Auswahl übernimmt sie. Ohne diese Ergänzungen bleibt die
Vorbereitung übernehmbar und der Plan kann für den Lernenden aktiviert werden.
Ausgewählte verfügbare Aufgaben bleiben enthalten, auch wenn sie zusätzliche
Themen voraussetzen. Außerhalb des aktuellen Kursumfangs liegende
Voraussetzungen werden gesondert angezeigt und niemals stillschweigend zu
Kurszielen. Solche Hinweise brauchen keine Bestätigung. Die normale
Backend-Frontier prüft die fachlichen Voraussetzungen beim Lernen weiterhin;
eine Aktivierung garantiert deshalb kein sofort startbares Lernziel.

**Vorbereitung übernehmen** erzeugt einen aktiven Lernabschnitt mit mehreren
kanonischen Wurzeln. Neue Aufgabentreffer erweitern diese Auswahl nicht erneut.
Der Klausurstoff selbst bleibt unverändert. Bereits rechtzeitig eingeplante
Ziele werden nicht zusätzlich eingeplant. Werden Ziele aus anderen Abschnitten
vorgezogen, benennt die Vorschau alle betroffenen Abschnitte und verlangt eine
ausdrückliche Zustimmung. Ein dadurch leerer Abschnitt bleibt inaktiv erhalten.
Die resultierende Planung muss alle offenen Ziele des Vorschlags rechtzeitig
fällig stellen; Puffer und gemeinsame Terminberechnung bleiben maßgeblich.

Eine bereits gespeicherte persönliche Planungsbasis bleibt beim Ergänzen der
Vorbereitung erhalten. Eine neue Zeitstempelaufnahme darf ihre unveränderliche
Basis nicht ersetzen und dadurch das Speichern des Vorbereitungsabschnitts
verhindern. Schlägt die Übernahme fehl, bleibt die Vorschau geöffnet und benennt
den Fehler. Eine gespeicherte Vorbereitung wird anschließend wie andere
Kursplanänderungen ausdrücklich ins Lerncockpit übernommen.

## Aktive und inaktive Abschnitte

Jeder Lernabschnitt, Puffer und Meilenstein kann einzeln aktiv oder inaktiv
sein. Fehlendes `active` bedeutet für bestehende Dokumente weiterhin aktiv.
Inaktive Abschnitte bleiben sichtbar, bearbeitbar und reaktivierbar. Sie werden
vor Zielzuordnung und Deduplizierung aus der Berechnung entfernt und erzeugen
kein Soll, keinen Rückstand und keine planbezogene Lernsteuerung. Inaktive
Puffer schützen keine Tage; inaktive Meilensteine sind kein nächster Termin.

Deaktivieren ändert weder gespeicherten Lernstand noch persönliche Kursziele
oder das gerade manuell bearbeitete Lernziel. Reaktivieren behält die Termine
und berücksichtigt den aktuellen Lernstand. Eine Terminverschiebung ist eine
eigene Bearbeitung. Ein vollständig inaktiver Plan kann ausdrücklich ins
Lernercockpit übernommen werden, damit eine zuvor aktive Planung pausiert wird.
Lokale Änderungen werden wie bisher erst durch die ausdrückliche Übernahme
im persönlichen Lernplan wirksam.

## Lernstand und Lernfokus

Klausurstoff und Zeitplanung sind getrennte Mengen. Der Lernumfang einer
aktiven Klausur enthält genau die sichtbaren atomaren Lernziele der gewählten
Themen und Aufgabenpakete. Bereits erreichte Ziele bleiben im Umfang und im
Fortschrittsnenner enthalten. Aufgabenabdeckung und Voraussetzungen erweitern
diese Menge nicht. Die zeitliche Planung zählt weiterhin ausschließlich die
festen Zuordnungen aktiver datierter Lernabschnitte.

Auch ohne datierte Vorbereitung bleibt der ausdrücklich gewählte Klausurstoff
lernbar. Der gemeinsame Backendstatus nennt den Fortschritt der
Klausurvorbereitung und **Zeitplanung offen**. Das Cockpit zeigt den
Gesamtfortschritt und eine aufklappbare Liste genau dieser Lernziele; es erfindet
weder Wochenpensum noch Rückstand oder Bilanzskala. Nur ein tatsächlich leerer
oder vollständig pausierter Plan ohne aktiven Klausurstoff bleibt kompakt ohne
Fortschrittstachos.

Der gesondert bezeichnete Lernstand im gesamten Fach zählt weiterhin die
erreichten Ziele des persönlichen Curriculums. Das Deaktivieren von
Planabschnitten verkleinert diesen Fachumfang nicht und ändert keine
Lernergebnisse.

Eine freie Woche innerhalb einer aktiven Lernplanung ist davon verschieden:
Sie hat kein Wochenpensum, behält aber ihren auswertbaren Planstand. Ebenso
bleiben die feste Planmenge und die gültige Skala nach Abschluss aller
eingeplanten Ziele erhalten.

Ein gemeinsamer Backendresolver bestimmt den Lernumfang für Anzeige,
Planstart und Coach. Bei mehreren aktiven Klausurterminen wird zunächst der
nächste Termin verwendet; gleiche Termine werden stabil nach Abschnitts-ID
entschieden. Die Stoffmengen verschiedener Klausuren werden nicht vereinigt.
Ohne Klausurstoff verwendet der Plan die ausdrücklich aktiven Lernabschnitte.

Eine ausdrückliche Planaktivierung oder ein Planstart übernimmt den gesamten
gewählten atomaren Klausurumfang als Fokus, auch wenn noch kein einzelnes Ziel
startbar ist. Das aktive Lernziel ist nur der nächste Schritt innerhalb dieses
Umfangs. Fortsetzungen dürfen ihn nicht auf dieses eine Ziel verengen oder um
beliebige Fachziele erweitern. Ein Datumswechsel oder ein gespeichertes
Lernergebnis ersetzt den laufenden Umfang nicht ungefragt durch den Stoff
eines anderen Termins. Ein bereits laufendes Lernziel wird nicht durch bloßes
Speichern oder eine Statusabfrage verdrängt.

Der Klausurfokus folgt denselben Regeln wie ein einzelner Themenfokus: Er ist
die Vereinigung der ausgewählten Knoten und ihrer `contains`-Nachfahren innerhalb
des persönlichen Zielumfangs. Im normalen Modus gelten die wirksamen
Voraussetzungen innerhalb dieses Ausschnitts. Außerhalb liegende Grundlagen
blockieren den Einstieg nicht und werden dadurch weder als beherrscht gewertet
noch zum Fokus hinzugefügt. Interne Voraussetzungen bleiben erhalten: Im
Kinematik-Beispiel beginnt der Weg bei „Bewegungen mit Diagrammen untersuchen“;
die weiteren gewählten Ziele folgen entsprechend ihren Abhängigkeiten.

Nur der ausdrücklich eingeschaltete Striktmodus prüft Voraussetzungen auch
außerhalb des Fokus. Dort bleibt eine offene externe Voraussetzung eine
fachliche Blockierung, kein leerer Plan und kein Abschluss. Fehlerhafte
Lehrplanreferenzen bleiben in beiden Modi unzulässig. Automatische
Planfortsetzung bleibt an das datierte Pensum gebunden; ausdrückliches
Weiterlernen kann weitere erreichbare Ziele innerhalb des gewählten Umfangs
starten.

Ohne ausdrücklich gewählten Klausurstoff bleibt das bisherige freiwillige
Weiterlernen im persönlichen Curriculum möglich. Die enge Klausurgrenze ist
kein allgemeines Verbot freier Themenwahl in gewöhnlichen Lernplänen.

**Lernen starten** führt aus dem Cockpit unmittelbar zum Coach-Einstieg mit dem
vorhandenen Profil. Die gespeicherte ID und Curriculum-Auswahl werden erneut
serverseitig geprüft; eine fertige Konfiguration muss nicht nochmals manuell
durchlaufen werden. Die Providerwahl und der ausdrückliche Start einer neuen
Lernsession bleiben erforderlich.

Die Klausurdiagnose und eine Übertragung einzelner Prüfungsleistungen auf
fachliche Lernziele sind ein späterer Schritt. Dieses Paket schreibt keine
Lernergebnisse und leitet aus einer Themenzuordnung keine Beherrschung ab.
