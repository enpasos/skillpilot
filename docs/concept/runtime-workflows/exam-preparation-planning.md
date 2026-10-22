# Klausurstoff, Aufgabenabdeckung und Vorbereitung

Die Kursplanung verbindet einen Klausurtermin mit ausdrücklich ausgewählten
Themen und Aufgabenpaketen. Die Auswahl hat keine Prioritäten. Der Meilenstein
beschreibt den Termin und seinen Stoff; erst Lernabschnitte erzeugen geplante
Arbeit. Der Einstieg liegt unter **Kursplanung → Kurs öffnen → Planung**.

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
eine Vorschau. Für einen angeschlossenen Lernenden wird dessen Planungsbasis
neu geladen. Ohne persönlichen Lernstand werden alle benötigten Ziele als
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

Die Klausurdiagnose und eine Übertragung einzelner Prüfungsleistungen auf
fachliche Lernziele sind ein späterer Schritt. Dieses Paket schreibt keine
Lernergebnisse und leitet aus einer Themenzuordnung keine Beherrschung ab.
