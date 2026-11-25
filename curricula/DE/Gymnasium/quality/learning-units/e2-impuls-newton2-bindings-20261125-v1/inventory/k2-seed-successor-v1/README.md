# BW K2: technischer Seed-Nachfolger

Der exakt akzeptierte K2-V3-Datensatz ist ausschließlich in BW angeboten. Er benötigt und deckt RATE-M. K1 bleibt nach dem negativen V3-Urteil abwesend. Der neue Nachfolger enthält genau zwei BW-Zeilen für G8/G9; alle fünf bisherigen Fixture-Dateien einschließlich der vier HH/SN-Zeilen und der acht E.2-Zeilen bleiben bytegleich.

Die unabhängige Berechnung liest das tatsächliche kanonische Inventar und genau die drei Sek-I-Sichten BW/HH/TH. Frühere Fixture-Werte oder Lernendenresultate sind keine Eingaben. Reproduktion aus der Repository-Wurzel:

```bash
python3 curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/inventory/k2-seed-successor-v1/recompute-bw-hh-th.py . /tmp/current-bw-hh-th-seeds.json
```

BW steigt in beiden Dauerprofilen von163/261 auf164/262 bei technischen Seeds/Lernatomen. Genau die eigene Prüfungs-ID K2 kommt in beiden Mengen hinzu. Die111 fachlichen curricularen Seed-Identitäten bleiben gleich. HH127/192 und TH137/203 behalten ihre vollständigen Identitätsmengen. K2 liegt unter „Übungen und Prüfungsaufgaben“; ein technischer Assessment-Seed ist kein zusätzliches positives Fachziel und schreibt keine Lernendenleistung.

Die native Gegenprüfung verwendet echte Backend-/API-Aufrufe mit frischen Testlernenden. Vorher und nachher stimmen alle sechs vollständigen Seed- und Lernmengen mit der getrennten Berechnung überein. Nachher läuft der bestehende Produktionspfad mit seinen Zähl-, Fixture-, Normalisierungs-, Quellen- und HTTP-Gesamtassertionen auf einer ausschließlich privat auf BW/HH/TH eingeschränkten Tabelle; zusätzliche private Prüfungen sichern die vollständigen unabhängigen Identitäten sowie K1-Abwesenheit und K2-BW-Grenze. Die beiden isolierten nativen Läufe enden mit0, jeweils ein Test. Das ist keine Behauptung über die vollständige Originaltabelle oder die gesamte Backend-Suite. Die rohe XML-Ausgabe bleibt extern per Digest erhalten. Ein anfänglicher Wrapper-Cache-Fehler vor dem Teststart bleibt extern als Infrastrukturhistorie erhalten.

`native-after.verification.actual.json` verbindet die tatsächliche positive Ausführung mit dem aktiven Zwei-Zeilen-Nachfolger und dem schmalen Controller-Testpatch. Der Patch lädt ausschließlich die beiden bewachten BW-Zeilen und erhöht nur den BW-Pin163 auf164. Die übrigen Zählpins und alle historischen Fixtures bleiben erhalten. Die sechs offenen HH/TH-IMP-Abschlusswege bleiben ausdrücklich offen; weder eine fiktive K1-Aufgabe noch eine abgesenkte Qualitätsschranke wird verwendet. Die fachliche K2-Freigabe liegt im getrennten akzeptierten Inhaltsreview; diese Seed-Arbeit erteilt keine zusätzliche Inhaltsfreigabe.
