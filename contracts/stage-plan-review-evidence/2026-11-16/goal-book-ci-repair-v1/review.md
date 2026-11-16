# Unabhängige technische Prüfung des Goal-Book-Nachtrags

Stand: 16. November 2026, 00:26 CET; Ausgangscommit `069fd6cf4fa5c9c8c8108bd367f986e94c29da12`.

**Ergebnis:** Keine blockierenden Befunde am geprüften Buchmodell-, Konfigurations- und Navigationsfix. Der eigenständige Prüflauf endete mit Exit 0. Diese Aussage ist eine lokale technische Code- und Integrationsprüfung; sie ist weder ein neues fachliches Curriculumreview noch M7-, PDF-, Host-, Veröffentlichungs- oder Remote-CI-Abnahme.

## Geprüfter Umfang

Geprüft wurden die Chemie-Bindung beider Physik-Buchkonfigurationen, die Auflösung expliziter Fremdreferenzen aus gebundenen Quellen, die Begrenzung von Buchmitgliedschaft und Navigation auf das Hauptfach, die genaue Physik-Quellenunion und die Länderkennzeichnung curricularer Buchseiten. Der akzeptierte Modellstand ist in [report.json](report.json) einschließlich SHA-256 der relevanten Dateien gebunden; `goalBookModel.ts` hatte den Digest `sha256:10dc517da77987925bbae5e03255f7614814f443975a86ab3011b45a497364cb`.

Das ebenfalls in den zehn beobachteten Dateipins von `report.json` aufgeführte **`app/scripts/testPhysicsGoalBookInputs.ts` ist ausdrücklich kein hiermit akzeptierter Prüfgegenstand und wurde im Real-Book-Prüflauf nicht ausgeführt**. Sein Pin beschreibt nur die während dieses Laufs vorliegende Datei. Die weitergehende Aktualisierung seiner historischen, Inventar-, Closure- und Nationalansichts-Assertions erhält eine separate Prüfung gegen `069fd6c`; spätere Dateistände werden durch diesen Bericht nicht angenommen.

## Tatsächliche Ergebnisse und Gegenproben

- Das nationale Physikbuch enthält genau die unabhängig ermittelten 484 curricularen Hauptfachziele, die Kalibrierungsausgabe 22 Seiten. Alle Seiten gehören zum kanonischen Physikgraphen; fremde Quellenziele erscheinen weder als Buchseiten noch als falsch klassifizierte ausgeschlossene Hauptfachziele. Die Bridge `13b338eb-f761-5817-9058-11043b9cb253` wird nicht allein wegen ihres Ledgerstatus zur Buchseite. Die Abgrenzung 484 Quellenziele gegenüber 485 Ledgerzielen wurde anhand der tatsächlichen Rollen ausgewertet: [view-inventory.json](view-inventory.json).
- Alle 158 direkten Fremdvoraussetzungsrelationen des Physikgraphs lösen auf: 157 nach Mathematik und eine nach Chemie. Auf jeder tatsächlich ausgegebenen Physikseite bleiben alle autorierten direkten Voraussetzungen erhalten. Der Ruhepotenzial-Verweis führt zur Diffusionskompetenz im aktuellen Chemiebuch, Seite 21, mit passender Landschaft, Edition und Zielanker. Beide Buchmodelle wurden zusätzlich vom verifizierenden Runtimeparser angenommen.
- Entfernt man in isolierten Kopien jeweils die Chemie-Bindung, scheitern beide echten Physikkonfigurationen weiterhin am konkreten Ruhepotenzial→Diffusion-Verweis. Ein unbekanntes Quellenziel scheitert mit `CPV-002`; ein fremdes Navigationsziel scheitert mit `invalid bound navigation view` und `CPV-002`. Es wurden keine Fehlerpfade unterdrückt.
- Die beiden neuen Bewegungsziele erhalten nach dem Fix ausschließlich `DE-BY`. Der erhaltene Vorher-Beleg [applicability.before-fix.json](applicability.before-fix.json) zeigt die tatsächlich zuvor erzeugten 15 Länderkennzeichnungen. Das endgültige Physikmodell hat den Digest `sha256:816f8f83daebd1856eb907358074628ac0be54b3e0e61ae24282e6aeb3ac6784`.

## Grenze zwischen Buchkennzeichnung und Runtime-Auswahl

Der Länderfilter arbeitet ausschließlich auf curricularAtomic-Buchseiten. Deren materialisierte `applicability` gehört zum bereits gebundenen kanonischen Eingang (`source.landscapeDigest`); breite enthaltende Quellenansichten dürfen daraus keine zusätzliche Länderbehauptung ableiten. Der Nachtrag ändert keine Runtime-Auswahl, keine autorierten Viewrollen, keine Lernziel-ID und kein Lernergebnis.

Dies begründet **keinen allgemeinen Vorrang der Inline-AP vor der Runtime**: Die bestehende Runtime kann auch über rohe direkte Mappings oder Provenienz auswählen. Die unabhängige aktuelle Bestandsprüfung aller fünf registrierten Bücher umfasst 2.490 curricularAtomic-Ledgerziele und 92 echte Runtime-Mappingdateien sowie Register-/eingebettete Provenienz und Applicability-Overrides. 361 gelesene Eingänge blieben während dieser Prüfung unverändert: [ordinary-raw-source-selection-inventory.json](ordinary-raw-source-selection-inventory.json).

Es gibt darin genau einen ordentlichen Raw-Mapping-Fall außerhalb der Inline-AP: Mathematik `803d910d-96d1-5118-b9ca-29e93d0da76d` mit NI-Mapping. Die tatsächlichen NI-Quellenviews setzen dieses Ziel bereits auf `prerequisiteOnly`; daher verliert kein aktuelles Buchquellenziel durch den Filter eine echte Raw-Fallback-Länderzuordnung. Der bekannte Aufgabenfall `2f8a3a90-717d-5ac1-b54e-facca26e9008` bleibt außerhalb der Buchseiten und seiner Runtime-Auswahl unberührt. Diese inventargestützte Aussage gilt für den geprüften aktuellen Stand; sie ersetzt keine allgemeine Runtime-Selektionssemantik.

Die Prüfung schrieb ausschließlich eigene Dateien in diesem temporären Prüfverzeichnis. Kanonische Ziele, Aufgaben, Quellen, Viewrollen, Qualitätsgates und V9-Evidenz wurden durch den Prüfer nicht geändert.

## Nachtrag zur Gültigkeit der Dateipins

16. November 2026, 00:30 CET: Die neun übrigen Modell-, Konfigurations-, Navigations- und Regressionstest-Dateipins aus `report.json` wurden nach der Ausführung erneut mit den aktuellen Dateibytes verglichen und waren unverändert. Das ursprüngliche `report.json`, sein Ausführungszeitpunkt und seine zehn beobachteten Pins bleiben unverändert erhalten. Diese Nachprüfung führt den Real-Book-Prüflauf nicht erneut aus und datiert ihn nicht um. Die noch bearbeitete Physik-Inputtestdatei bleibt ausdrücklich von der bisherigen Annahme ausgenommen.
