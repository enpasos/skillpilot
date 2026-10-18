# Drei abschließende Stock-View-/Kurschecks

Genau die drei angeforderten npm-Kommandos wurden einmal unverändert mit geerbter Standardumgebung parallel ausgeführt. Originalskripte, npm-Zuordnungen und Compiler-/Resolver-Guards sind vorher/nachher bytegleich.

| Kommando | Exitcode | Reale Dauer (Sekunden) |
| --- | ---: | ---: |
| `npm --prefix app run validate:view-filters` | 0 | 15.513220146 |
| `npm --prefix app run validate:composition-views` | 0 | 235.108780179 |
| `npm --prefix app run test:course-level-mapping-consistency` | 0 | 0.585709930 |

Gesamte reale Parallelzeit: 235.114484925 Sekunden. UTC-Zeiten und monotone Nanosekunden stehen im tatsächlichen Receipt; vollständige getrennte stdout/stderr-Originalbytes liegen unter `raw/`.

- Viewfilter:0Fehler,0aktiveWarnungen,27.568Diagnosebefunde und110akzeptierteWarnungen.
- Composition:0Fehler,2.332Warnungen;352Views und21kanonische Landschaften geprüft. Die Warnungen bleiben vollständig im Rohlog und werden nicht als warnungsfrei ausgegeben.
- Kurs-Mappingtest: die unveränderten Fixtures-/Active-Discovery-/Failure-Regressionen bestehen. Das ersetzt nicht Roots gesonderte tatsächliche CQR004-Datenmessung.

Die geprüften Inputresolver lesen keine Atlas-Ausgaben unter `app/scripts/config/goal-books/source-views`; dieses Verzeichnis wurde nicht geöffnet. Während der letzten Composition-Lesung ließ Root C ausschließlich fünf C7-Mappingdecision-Metadaten ergänzen. Deren Pfade überschneiden die laufenden canonical/composition/provenance-Inputs nicht; die zwei anderen Checks waren bereits beendet. Diese Akte bewertet jene fremde Korrektur nicht neu.

Unveränderte Stock-Nebeneffekte: Viewfilter schreibt Diagnoseberichte unter `tmp/applicability`; der Kursfixturetest erstellt und entfernt sein isoliertes Betriebssystem-Tempverzeichnis. Keine Normaldaten-, Code-, P/C/View/source/central-Änderung durch diesen Agenten, kein zusätzlicher Test-/AP-/CQR-Kommandolauf, Build, Commit oder Stage. Kein neues fachliches Votum oder menschlicher Freigabeanspruch.

Technische Dokumentation/Prüfcode: Apache-2.0.
