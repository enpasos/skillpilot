# Technischer Autorenkandidat: quellenbezogene Duration-Policy-Zeilen

Dieser Nachweis ist eine getrennte technische Layer-A-Korrektur. Er ist keine
neue Quellen-/Zielprüfung und kein D/P/A/M/V- oder M7-Fachabschluss. Root prüft
die Änderung unabhängig. Geändert werden ausschließlich
app/scripts/goalBookModel.ts und app/scripts/testGoalBookModel.ts.

## Tatsächlicher Fehler und Lösung

Der unveränderte Produktionsparser lehnte die aktuelle Policy mit 153 Zeilen
bei der zweiten Biologie-Zeile für DE-BB ab. Die fünf zusätzlich geprüften
Komponenten haben jeweils einen eigenen Quellenpfad und dieselbe wirksame
Länderpolicy wie ihr bestehender Elternsatz. Der Offering-Checker benötigt
diese einzelnen Pfade; das Buch benötigt eine wirksame Policy pro Land.

Der Parser validiert nun jede Zeile vollständig. Mehrere Zeilen für dieselbe
Fach-/Land-Kombination werden ausschließlich bei identischen validierten
jurisdiction/stage/durationModels/decision/compositionViewIds zusammengeführt.
Alle Zeilen einer mehrfach vorkommenden Kombination brauchen einen eigenen
nichtleeren sourceExtractionPath; doppelte Quellenpfade sind auch über Länder
hinweg innerhalb desselben Fachs verboten. Abweichende wirksame Felder werden
abgewiesen. Es gibt keine Länder-, Fach-, Pfad- oder Dateinamen-Ausnahme und
keine Konfliktauflösung durch die Reihenfolge.

Status reviewed, gültige Stufe, sortierte/eindeutige Dauerwerte und bestehende
Single-/Neutral-/Dual-Regeln werden pro Zeile geprüft. View-IDs bleiben
eindeutig und gebunden. Ein vorhandenes compositionViewIds-Feld muss ein
Array sein. Nach dem Zusammenführen bleiben die bisherigen vollständigen
Atlas-/Stufen-/GK-/LK-/G8-/G9-Bindungsprüfungen unverändert. Eine historische
einzelne Zeile ohne Quellenpfad bleibt zulässig; ein solcher Satz kann keiner
zweiten Quellenzeile gleichgesetzt werden. Quellenbezogene rationale-Texte
sind keine wirksamen Dauer-/Viewfelder.

## Gezielte tatsächliche Evidenz

Die aktuelle native Policy-Probe zeigt vor der Korrektur den echten Duplicate-
Fehler. Nach der Korrektur ergeben die unveränderten 21 Biologie-Quellenzeilen
exakt dieselben 16 wirksamen Länderdecisions wie die ursprünglichen 148 Zeilen.
Der Policy-Digest wird in beiden Proben tatsächlich gebunden. Keine Policy-
oder Zielbytes werden durch diesen technischen Kandidaten geschrieben.

Der bestehende vollständige testGoalBookModel.ts wurde ausgeführt. Sein erster
Lauf scheiterte bereits im vorgeschalteten InputIsolation-Test an nach der
Policy-Integration veralteten generierten Biologie-SourceAtlas-Eingangsbytes,
bevor die Duration-Tests erreicht wurden. Die Gates wurden nicht geändert.
Root aktualisiert diese abgeleiteten Bytes mit dem unveränderten nativen
Generator. Der genaue vorhandene Duration-Testabschnitt samt neuen positiven
und negativen Guards wurde zusätzlich unverändert in dieses Dossier extrahiert
und gezielt ausgeführt: Exit 0. Der endgültige vollständige Teststatus steht
in der separaten tatsächlichen Execution-Receipt.

Die neuen Tests prüfen Single-, Neutral- und Dual-Zusammenführung, umgekehrte
Zeilenreihenfolge, verschiedene Quellenrationales, doppelte/mangelnde/leere
Pfade, Konflikte gültiger Dauer-/Stufen-/Decision-/Viewwerte und ungültige
spätere Status-/Stufen-/Dauer-/Viewfelder. Sie prüfen außerdem bestehende
Neutral-/Dual-Atlas-Rollenregeln und fehlende Länder. Keine globale Prüfung
wird durch einen isolierten PASS ersetzt.

## Historische Helperbytes

before-goalBookModel.ts.snapshot enthält exakt die von Root angeforderten
Git-HEAD-Bytes und stimmt mit der tatsächlich vor dieser Änderung gelesenen
Datei überein. Das ist ein autorisierter read-only Git-Show, kein Git-Write.
Die frühere Helperversion bleibt externe Eingangsbindung der unveränderten
historischen eigenen D-/P-v1-Freezes. Ihre Prüfungen werden nicht mutiert oder
als neue Fachbewertung umgebunden. Neue fachliche D-/P-Stufen müssen den dann
aktuellen Helper binden.
