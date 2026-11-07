# Drei geprüfte Mathematikreparaturen: Anwendung am 7. November

Die drei einzeln geprüften Kantenkorrekturen sind zusammen mit den benötigten
aktuellen Beschreibungs-, Aufgaben-, Karten- und Bildbelegen angewandt. Der
reguläre Qualitätsbericht vom **7. November 2026, 04:18:33.234 UTC** enthält
den neuen Stand. Mathematik bleibt M0; die Wiederherstellung von M7 ist offen.

## Tatsächliche Änderungen

- Bei „Ganze Zahlen ordnen und an der Zahlengeraden darstellen“, „Diagramme deuten“ und „Einfache inverse Matrizen
  bestimmen“ wurde jeweils genau eine fachlich geprüfte redundante Voraussetzung
  entfernt. Die allgemeine automatische Entfernung fachlicher Kanten ist damit
  nicht freigegeben.
- „Diagramme deuten“ erhält die getrennt geprüfte deutsche und englische
  Beschreibung. Die Zielidentität bleibt erhalten.
- Die Matrixvisualisierung wird durch das tatsächlich mit dem eingebauten
  OpenAI-Bildwerkzeug erzeugte und unabhängig geprüfte PNG ersetzt. Provider,
  Lizenz, Alttext und Kandidatenstatus stammen aus dem echten nativen Import.
  Das alte JPG bleibt erhalten; dessen menschliche Freigabe wird nicht auf das
  neue Bild übertragen.
- Die zugehörigen aktuellen D-/P-/A-/M-/V-Belege und die technische
  Duration-Quellbindung werden gemeinsam eingebunden. Alte Originalreviews
  bleiben unverändert; die neuen vollständigen A-/M-Dateien behalten jeweils
  806 historische Zeilen bytegleich und ersetzen nur die neu geprüfte Zeile.
- Die feste Bildkontext-Authority umfasst nun die unveränderten bisherigen
  54 sowie genau diese drei zusätzlich qualifizierten Kontexte. Der bestehende
  Git-Originalprüfer, seine fünf Reviewprofile und die aktuellen physischen
  Bildprüfungen bleiben erhalten. Die Transportauswahl akzeptiert genau den
  bisherigen und den neuen extern fest gebundenen Index.

Die [Anwendungsquittung](https://github.com/enpasos/skillpilot/blob/main/qa-artifacts/ci-contract-audit/2026-11-07/math3-coherent-active-integration/receipt.json)
führt die 14 ursprünglichen Dateiersetzungen, ihre Vorher-/Nachherhashes und
die vollständigen drei veränderten Goalobjekte auf. Alle anderen 20 kanonischen
Quellen, die alten Reviewdateien, Bilddateien und die Floorpolicy blieben gleich.

## Tatsächliche Prüfungen

Der [native Graphvergleich](https://github.com/enpasos/skillpilot/blob/main/qa-artifacts/ci-contract-audit/2026-11-07/math3-e4de-native-graph-before-after/receipt.json)
verwendet den normalen 21-Dateien-Katalog und den Produktionsprüfer. Er misst
**919 → 916 Befunde**, davon G17 **917 → 914**, genau drei entfernte und keinen
neuen Befund. 915 verbleibende Befunde sind bytegleich; bei einem weiteren
wechselt nur der Zeugenpfad. Die beiden Identitätsbefunde bleiben offen. Das
ist keine scopeabhängige Runtime- oder vollständige Graphabnahme.

Der vollständige gemeinsame Deep-Lauf ist mit
[echten Rohdaten und Ausführungsbeleg](https://github.com/enpasos/skillpilot/blob/main/qa-artifacts/ci-contract-audit/2026-11-07/math3-coherent-private-binding-candidate-2026-11-07/native-full-deep/receipt.json)
gesichert. Er prüft alle fünf vorgesehenen Fächer mit insgesamt 2.483 Zielen.
Für Mathematik bestehen Beschreibungen, Aufgabenbelege, Atomicity und
Kartenreview bei **807/807** Zielen. Aktuelle Bildkontexte bestehen bei
**5/807** Mathematikzielen und **52/346** Wirtschaftszielen; insgesamt bleiben
**2.426** Bildkontextnachweise offen. Der unabhängige
[Authority-Review](https://github.com/enpasos/skillpilot/blob/main/qa-artifacts/ci-contract-audit/2026-11-07/math3-fixed57-independent-peer/review.json)
enthält eigene positive und negative Aufrufe einschließlich eines echten
flachen Git-Checkouts. Ein erfolgreicher Aufruf im Berichtsmodus bedeutet
keinen bestandenen Gesamt-Gate.

Die anschließende normale Erzeugung mit `npm run quality:curriculum-status`
führt alle zehn Kartenreport-Vorprüfungen aus und bestätigt diese Zahlen.
Ihr [Ausführungs- und Floorbeleg](math3-fixed57-normal-cqr-producer-2026-11-07.json)
trennt Erzeugung, tatsächliche Dateianwendung und den direkten Verbrauch durch
die unveränderten geschützten Untergrenzen. Deutsch, Geschichte und Latein
bleiben M6, die übrigen sieben geschützten Fächer M0.

Ein zuerst falsch serialisiertes zusätzliches Konfigurationsfeld wurde vom
strikten Schema zurückgewiesen. Die Korrektur entfernt es nur aus der aktiven
Serialisierung; die ursprünglichen Hashguards bleiben separat erhalten.
Originalfehler und Eingaben sind archiviert. Entsprechend bleiben native
Diff-Archive bytegleich; ihre einzelnen Archivpfade erhalten nur die dafür
erforderliche Git-Whitespace-Kennzeichnung.

## Offener Gesamtauftrag

Die unveränderte Policy verlangt weiterhin fünfmal M7 und fünfmal M6 ohne
Ausnahmen. Weitere Graphfehler, die Informatikprüfungen und die fehlenden
aktuellen Bildkontextnachweise müssen tatsächlich behoben werden. Main-Verträge
und zusätzliche PR-83-Sollregeln bleiben getrennt. Diese Anwendung führt keine
Einheitenruntime ein und schreibt keinen Lernendenstatus oder Masterynachweis.
Der frühere Remote-Lauf auf `0b0f4637` scheiterte an den geschützten Floors;
ein frischer Remote-Nachweis für diese Anwendung ist gesondert erforderlich.
