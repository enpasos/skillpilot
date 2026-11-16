# Spektrumsaufgabe: Rechenvorbereitung und aktueller Nachweis

16. November 2026. Dieser Nachtrag zu PR #159 korrigiert genau die
Voraussetzungen der neuen Aufgabe `c2a6ce42`. Die Aufgabe verlangt die Summen
und Differenzen vorzeichenbehafteter Dezimalwerte, die Rechnung `1/400` und
die Umrechnung von Sekunden in Millisekunden. Diese allgemeinen Fähigkeiten
waren weder in ihrer Voraussetzungshülle noch im qualitativen Spektrumziel
`f06c581a` abgesichert.

Die Aufgabe erhält deshalb drei vorhandene Mathematikziele als Vorbereitung:
`4eeab7d5` (Addition/Subtraktion), `ee48e811` (Multiplikation/Division) und
`f2e42af5` (Einheitenumrechnung). Text, Lösung, Raster, Bilddateien und
`coveredGoalIds=[f06c581a]` bleiben unverändert. Die Vorbereitung erzeugt
keine zusätzliche Mathematikabdeckung und schreibt keine Lernergebnisse.
Alle 485 regulären Physikziele und sämtliche anderen kanonischen Ziele bleiben
gegenüber `2fc979d3` unverändert.

## Inhaltsentscheidung und Grenzen

- Die [geprüfte Aufgabenentscheidung](c2a6ce42-local3R-author-decision.actual.json)
  bindet jede neue Voraussetzung an die tatsächliche Aufgabenanforderung,
  das vollständige vorgeschlagene Objekt und die angesehenen Originalbilder.
  Der [Abgleich mit der Umsetzung](root-applied-same-object-check.actual.json)
  bestätigt das exakt gleiche Objekt; der [Katalogvergleich](exact-catalog-delta.actual.json)
  findet ausschließlich dieses eine geänderte `requires`-Feld.
- Die [native Voruntersuchung](local-preparation-probe.actual.json) misst
  die Aufgabenhülle mit 9 statt anschließend 32 Atomen und keine neuen
  transitiv überflüssigen Kanten. Die allgemeine Vorbereitung wird am
  konkreten Aufgabenverbraucher ergänzt; das qualitative Lernziel bleibt gleich.
- Der erhaltene [64-Fall-Review](per-case-matrix.md.txt) betrachtet daneben
  die spätere K2-Diagrammreparatur. Diese zwei Physikkanten sind **nicht** Teil
  dieses Nachtrags. Der [Entscheidungstext](decision.md.txt) und seine
  Basispins bleiben datierte Voruntersuchungen, keine neue M7-Freigabe.
  Die Originalberichte enthalten ihre damaligen temporären Pfade;
  [retention.actual.json](retention.actual.json) ordnet die erhaltenen Bytes zu.

## Tatsächlich ausgeführte Nachweise

Der [vollständige lokale Lauf](full21-quality-and-floors.actual.json) endet
am 16. November um 00:08:08 UTC erfolgreich: 21 Kataloge und zwölf geschützte
Routen behalten ihre Mindeststände, Mathematik und Physik M7. Geschützte
Quellen, eingefrorene V9-Evidenz und Qualitätsgrenzen sind unverändert.
Offene Befunde der elf M0-Fächer bleiben ausdrücklich offen.

Die [aktuelle API-/UI-Messung](native-effect-summary.actual.json) führt
72 gemeinsame Kontexte und sechs native Einzelfachkontexte aus; sechs weitere
Fälle sind tatsächliche UI-Fachfilter derselben gemeinsamen Antworten.
In allen 72+12 Fällen bleiben Zielmengen, Fortschrittsnenner und vollständige
Lernkarten gegenüber dem vorherigen Datenstand gleich. Kanonisch bleiben oben
null Rückpfeile und null außenstehende Ziele; innen bleiben 11/12/12 Pfeile.
In 39 der 60 zulässigen Kontexte bestehen weiterhin regionale Rückgriffe,
in 35 außenstehende Ziele. Zwölf widersprüchliche Dauerkontexte sind separat
ausgewiesen. Der Zusatzbedarf der konkreten Aufgabe ist in den gemessenen
Landessichten bereits durch andere Ziele Bestandteil der Lernbasis. Das
[Scope-Addendum](native-effect/task-scope-addendum.actual.json) weist die Aufgabe
und ihr Ziel konkret in drei bayerischen G9-Kontexten nach. Die nationalen und
nativen Einzelfachfälle enthalten diese beiden Ziele nicht; ihre unveränderte
Karte belegt deshalb keine Ausführung derselben Aufgabe.

Beide Datenstände werden durch denselben aktuellen Produktadapter einschließlich
Mitgliedseinheiten ausgewertet. Die frühere 72er-Hilfsrechnung hatte diese
Metadaten nicht vollständig übergeben; der getrennte Methodenvergleich ergänzt
Platzierungs- und Diagnoseinformationen, ohne die bisherigen Pfeilzahlen oder
Rückgriffsursachen zu ändern. Historische Belege bleiben erhalten.

Weitere tatsächliche lokale Erfolge: Physik-Inputsuite und ESLint,
Buch-Buildtests, TypeScript sowie Schema-Validierung von 120.704 Dateien.
Logs und Eingangsbindungen stehen in
[validation-retention.actual.json](validation-retention.actual.json).
Die [Aufbewahrungsanleitung](RETENTION.md) erklärt die verlustfreie Kompression
und die geprüfte bytegenaue Wiederherstellung. Die 29 Validierungsartefakte
benötigen rund 4,1 MB; die Lesbarkeit der JSON-Inhalte ist unabhängig von der
Rekonstruktion ihrer ursprünglichen GZIP-Container.
Die Messung ist kein Browser-, Produktions- oder Unterrichtsnachweis.

## Vorheriger CI-Buchfehler

Der ursprüngliche fehlende Chemieverweis im Physikbuch ist auch remote
behoben. Der [erhaltene Jobbeleg](previous-head-book-ci.actual.json) bindet
den terminal erfolgreichen Buchjob an PR-Head `2fc979d3`, Lauf `43776063341`
und dessen Testmerge `44a4a292`. Alle fünf Bücher mit 2.457 Zielseiten sowie
die Publikationsbindungen bestehen. Das ist ausdrücklich kein CI-Beleg für
den späteren Aufgaben-Nachtrag und kein erfolgreicher Gesamt- oder Main-Lauf.
