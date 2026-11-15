# Kontrollblatt zur tatsächlichen Lernkarte

Stand: 15. November 2026, 22:32 MEZ. Gemessen ist der installierte Aufgaben-,
Routen- und Quellenstand mit Physik `b391f6a7…`. Die letzte Nachmessung bestätigt
in allen 72 Kontexten den gewöhnlichen Lernumfang gegenüber `ee9829cb…`.
Nur die drei BY-G9-Kurskontexte verlieren zwei dort nicht gültige Aufgaben;
keine neue Rückgriffsursache und kein neues Außenatom entstehen.
Dieser lokale Nachweis allein belegt keine Integration.

Die Messung verwendet `LearnerService.getLearnerLandscapeClosure` mit einem
lesenden synthetischen Repository und die tatsächlichen Wurzel-, Filter- und
Projektionsfunktionen der Oberfläche. Der Vergleich mit main bindet dessen
Curriculum `64793bdc…` bei demselben aktuellen Code; er behauptet keine
beobachtete Produktionsoberfläche. Die frühere unpassende Messung mit allen
Katalogen und künstlicher Wurzel bleibt ausdrücklich zurückgenommen.

## Kanonische Sicht

Reihenfolge der Zahlen: GK / LK / GK+LK. Innere Ursachen sind über Boards
hinweg dedupliziert; Pfeile zählen je Board und sind nicht mit Ursachen gleichzusetzen.

| Kennzahl | Main-Curriculum mit aktuellem Code | Finaler Kandidat `b391f6…` |
| --- | --- | --- |
| Oberste Rückpfeile | 1 / 1 / 1 | 0 / 0 / 0 |
| Verschiedene atomare Ursachen oben | 43 / 43 / 43 | 0 / 0 / 0 |
| Atome außerhalb der obersten Einheiten | 3 / 0 / 0 | 0 / 0 / 0 |
| Innere Rückpfeile | 8 / 9 / 9 | 11 / 12 / 12 |
| Verschiedene atomare Ursachen innen | 20 / 23 / 25 | 27 / 30 / 32 |

Die sieben zusätzlichen inneren Ursachen sind in allen drei Kursvarianten
identisch. Fünf sind erforderliche Voraussetzungen neuer Aufgaben zu
Befund/Deutung, SI-Bezügen, Quellen, Modellfunktionen und dem eigenen
Transistorversuch. Zwei weitere Voraussetzungen bestanden schon auf main,
sind durch eigene Vorbereitungscontainer jetzt aber zwischen Containern
sichtbar. Die innere Reihenfolge dieser Container bleibt eine konkrete offene
Arbeit. Die neuen Aufgaben werden nicht ohne ihre notwendigen Voraussetzungen
modelliert, um diese Pfeile verschwinden zu lassen.

Der letzte elektrische Aufgaben-/Routenfix gegenüber `6a77eb45…` fügt genau
die neue Spannungsaufgabe als Ziel und Bestandteil der Lernbasis hinzu. Es
entsteht keine neue oberste oder innere Ursache und kein weiteres Außenatom.

## Landes- und Dauerkontexte

Von 72 gemessenen Kontexten entsprechen 60 den gemeinsamen aktuellen
Fach-Dauervorgaben. In dieser Gruppe bleiben 39 Kontexte mit obersten regionalen
Rückgriffen und 35 mit außenstehenden Atomen. Die drei kanonischen Kontexte
sind darin enthalten und jeweils sauber auf der obersten Ebene. Die übrigen
Befunde sind keine erledigten Landespläne.

Zwölf technische Diagnosekontexte widersprechen den gemeinsamen Dauervorgaben:
BB/BE mit G9 sowie HE/NW mit G8, jeweils in drei Kursvarianten. Sie sind getrennt
markiert und werden weder als freigegebenes Landesangebot noch als aktivierter
Plan gezählt. Die inneren bestehenden Kompatibilitätscontainer beweisen auch
keine Abnahme neuer Jahrgangs-, E- oder Q-Pläne.

## Originalbelege

Der [vollständige Vergleich](actual-api-ui-72-before-applicability-cache.actual.json.gz)
ist verlustfrei komprimiert; `gzip -dc` stellt die JSON-Bytes wieder her.
Die [Retentionsbindung](pre-cache-comparison-retention.actual.json) enthält
Original- und Speicherhash. Sein Original-SHA-256 lautet
`fefc1663977285496600ec6f77f642d12da6fe8a8d0816588647cc3a691c3ac7`.
Der [abschließende b391-Nachweis](https://github.com/enpasos/skillpilot/blob/fix/stage-plan-next-delivery-20261115/curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/physics-q1-acquisition-current-v1/route-and-final-map-integration/boundary-b391-final72/retention.actual.json)
bindet den tatsächlich erneuten API-/UI-Lauf, alle 190 aktuellen Eingänge und
die vollständigen Scope- und Kartenvergleiche. Sein Receipt-SHA-256 lautet
`95bbbab739e61d3f0192242372bdd5140cb79f25f0082c6029288d249258bc0d`.
Der dazwischen verworfene reine Cachekandidat `721585…` mit 60 zusätzlichen
Viererpaketen im Fortschrittsnenner ist ein erhaltener Fehlerbefund; er ist
nicht der hier beschriebene Endstand. Die bestehende Quellenvererbungsgrenze
erhält die beiden direkt nur für Bayern belegten Operationalisierungen.
Die vorherigen vier Eingangs-/Kartenepochen sind bereits im
[verlustlosen Checkpointarchiv](api-ui-72-checkpoint-lossless.README.md) erhalten.
Der [abschließende b391-Eingangsstand](api-ui-b391-final-lossless/README.md)
ist ebenfalls verlustlos erhalten: alle vier Originalartefakte wurden
vollständig bis zu ihren ursprünglichen komprimierten Bytehashes rekonstruiert.
Rund 2 MB ersetzen rund 90 MB wiederholter Eingaben. Keine Messung schreibt Lernergebnisse oder belegt Unterrichtswirkung.
