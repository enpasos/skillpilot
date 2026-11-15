# Tatsächliche Lernkarten aller Länder: Vorher-/Nachher-Messung

Der aktuelle Endstand steht im [Kontrollblatt](final-measurement-summary.md).
Sein [verlustloses Eingangs-/Kartenarchiv](api-ui-b391-final-lossless/README.md)
bindet Physik `b391f6a7…` nach der Quellenumfangskorrektur. Die folgenden
Abschnitte erläutern die vorherigen Messstände und ihre Grenzen.

Der [72-Kontext-Checkpoint vor dem abschließenden Routenfix](actual-api-ui-72-checkpoint-before-routes.actual.json)
verwendet tatsächliche Exporte von `LearnerService.getLearnerLandscapeClosure`
und die Wurzel-, Filter- und Projektionsfunktionen der Oberfläche. Seine
Eingaben und Ergebnisse sind im [verlustlosen Archiv](api-ui-72-checkpoint-lossless.README.md)
erhalten: 13 Originalartefakte wurden vollständig rekonstruiert und einschließlich
der komprimierten Bytes gegen ihre Original-SHA-256 geprüft. Rund 3 MB
adressierte Bytefragmente ersetzen rund 182 MB wiederholter Eingaben; dies ist
keine verlustbehaftete Zusammenfassung. Der Checkpoint bindet Physik `6a77eb45…`,
noch nicht den anschließenden Routen-/Aufgabenfix.

Von 72 Kontexten sind 60 kanonisch oder durch beide Fach-Dauervorgaben gedeckt.
Alle 16 Länder sind enthalten. Zwölf weitere Kontexte werden ausdrücklich als
widersprüchliche Dauerauswahl getrennt ausgewiesen. Ein technischer Fallback ist
keine fachliche Landesfreigabe. Der Backend-Reader verwendet einen synthetischen,
lesenden Repository-Ersatz und schreibt keine Lernergebnisse. Dies ist ein
lokaler Lauf über echte Produktfunktionen, keine Produktions- oder Unterrichtsabnahme.

## Vergleichbarer Zwischenstand

Die kanonischen obersten Karten zeigen im aktuellen Checkpoint in GK, LK und
GK+LK jeweils null Rückpfeile und null Außenatome. Der zuvor tatsächlich
beobachtete Fehler mit 9 / 6 / 6 äußeren Mathematikzielen ist behoben. Mit
identischem aktuellem Reader und UI zeigt das Curriculum von main dagegen
jeweils einen obersten Rückpfeil mit 43 verschiedenen atomaren Ursachen und
3 / 0 / 0 Außenatomen. Dieser Vergleich isoliert die Curriculumänderung bei
gleichem aktuellem Code. Die historischen Main-UI-Funktionen erkennen unter der
tatsächlichen Übersicht keine Stufeneinheiten; deren leere Stufenauswertung
ist kein vergleichbarer sauberer Ausgangszustand.

Gegenüber dem identisch ausgewerteten 809-Ziele-Zwischenstand entstehen keine
neuen obersten Rückpfeile oder Außenatome. Bestehende Landesbefunde bleiben
sichtbar. Innere Rückgriffe sind ebenfalls in den Kartenartefakten gemessen;
die genannte Regressionsaussage über oberste Karten beweist keine unveränderten
inneren Befunde. Die tiefsten vorhandenen Themencontainer sind keine Abnahme
neu aktivierter Jahrgangs- oder E-/Q-Pläne. Pfeile zählen je Board; dieselbe
atomare Ursache darf nicht über mehrere Boards als verschiedene Fachkante
summiert werden.

## Korrigierte historische Messung

Die erhaltenen Läufe `before809-crossstage` und `after840-crossstage` benutzten
alle 21 vollständigen Kataloge und eine künstliche Wurzel statt der vom Backend
begrenzten Quellen und der sichtbaren Gymnasium-Übersicht. Ihre Zahlen,
insbesondere die früheren 41/512-Werte und die Aussage ohne Außenatome, sind
kein abschließender Nachweis der tatsächlichen Lernkarte. Die native
Backend-Auswahl und Kurszusammenführung bleiben Teilbelege. Die Rohdaten werden
als ausdrücklich überholte Zwischenmessungen erhalten und nicht überschrieben.

`retention-map.actual.json` bindet diese älteren bytegetreuen Originale und ihre
ursprünglichen Pfade. Ihre vollständigen kanonischen Quelldokumente und
kompilierten Java-Klassen wurden nicht erneut gespeichert. Ihre komprimierten
JSON-Dateien lassen sich mit `gzip -dc DATEI.gz` lesen. Ihre Runnerdateien dienen
der historischen Reproduktion dieses diagnostischen Eingangsrahmens, nicht
der aktuellen Produktabnahme. Das neuere verlustlose Archiv enthält die
korrigierten API-/UI-Eingaben und Ergebnisse mit eigenem Wiederherstellungsprogramm.

Die abschließende Messung ist oben gesondert gebunden. Dieser frühere
Zwischencheckpoint belegt weder dessen Bestehen noch M7, eine Planaktivierung,
Remote-CI oder Integration auf main.
