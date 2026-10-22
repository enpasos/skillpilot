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
Vollständigkeitszusage und verhindern die automatische Übernahme.

## Vorbereitung vervollständigen

Am gespeicherten aktiven Klausurtermin öffnet **Vorbereitung vervollständigen**
eine Vorschau. Für einen angeschlossenen Lernenden wird dessen Planungsbasis
neu geladen. Ohne persönlichen Lernstand werden alle benötigten Ziele als
offen behandelt. Die Vorschau unterscheidet bereits beherrschte, rechtzeitig
eingeplante und noch zu ergänzende Ziele, zusätzliche Grundlagen und offene
Zuordnungen. Der Zeitraum endet vor dem Klausurtermin und enthält mindestens
einen Werktag. Das Öffnen der Vorschau verändert keinen Plan.

Zusätzliche Aufgabenthemen und Grundlagen müssen ausdrücklich übernommen
werden. Außerhalb des aktuellen Kursumfangs liegende Voraussetzungen werden
gesondert angezeigt und niemals stillschweigend zu Kurszielen. Ihre gesonderte
Prüfung wird ausdrücklich bestätigt; die normale Backend-Frontier prüft ihre
Beherrschung weiterhin. Ungeklärte Aufgabenabdeckung wird damit nicht umgangen.

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
