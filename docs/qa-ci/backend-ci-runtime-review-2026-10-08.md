# Backend-CI: Laufzeit und Fehlerpriorisierung, 8. Oktober 2026

## Befund

Der Backend-Testschritt in GitHub-Lauf `37822481140` wurde nach über
64 Minuten auf Nutzeranweisung abgebrochen. Sein Abschlusslog belegt zwei
fehlgeschlagene Tests: veraltete Wirtschafts-Projektionszahlen und eine
Buchkatalog-Erwartung für vier statt fünf registrierte Fächer. Diese
Erwartungen wurden anhand aktueller Views, Canon und des im selben CI-Lauf
geprüften Buchkatalogs korrigiert; die fachlichen Assertions bleiben erhalten.

Die Laufzeit hängt stark vom wachsenden QS-Dateibaum ab. Zwischen dem letzten
grünen Vergleichsstand `0a463c66f260` und `42095f427223` wächst der versionierte
Curriculum-Dateibestand um 38,9 %, der Qualitätsbestand um 42,2 %. Die Zahl
der außerhalb des Qualitätsbaums vorhandenen Landschaftsdateien bleibt bei
593; ihre lokalisierten Ziele steigen von 55.565 auf 55.589. Die zusätzliche
Fachregistrierung erklärt damit keine Vervielfachung der geladenen Landschaften.

Die lokale JFR-Messung zeigt wiederholte Dateibaum-Scans bei Laden und
Aktualitätsprüfungen. Die schon ausgeschlossenen Qualitätsverzeichnisse wurden
bislang vollständig durchlaufen. Zwei LaTeX-Tests lasen außerdem unabhängig
denselben vollständigen JSON-Bestand. GC-Pausen im ursprünglichen Profil
betragen zusammen 2,133 Sekunden; ein Heapengpass ist darin nicht belegt.

## Änderungen und erhaltene Prüfungen

- Landschafts- und Mapping-Scans überspringen bereits ausgeschlossene
  Verzeichnisbäume vor dem Abstieg. Akzeptierte Pfade, Sortierung, Duplikatwahl,
  Fingerprints, Datei-Symlinks und aktive Reloads bleiben gleich. Rootfehler
  bleiben `IOException`, spätere Traversalfehler `UncheckedIOException`.
- Die beiden LaTeX-Prüfungen teilen einen Scan. Alle JSON-Dateien einschließlich
  historischer QS-Eingaben, dieselben vier deutschen/englischen Prüfungsfelder,
  Parser und getrennten Fachassertions bleiben erhalten.
- Gradle protokolliert gestartete, bestandene, übersprungene und fehlgeschlagene
  Tests. Vollständige Fehlerdetails bleiben eingeschaltet.
- CI speichert ausschließlich Hinweise auf fehlgeschlagene Testselektoren pro
  Branch/PR. Eindeutige Methoden laufen zuerst; parameterisierte Fälle werden
  als Klasse vorgezogen. Der Vorlauf verwendet `test --fail-fast --tests`.
  Nach seinem Erfolg folgt zwingend das ungefilterte `./gradlew check` und
  anschließend die unveränderten OpenAI-/Claude-Prüfungen.
- Fehlende, beschädigte oder nicht mehr passende Hinweise führen zur ganzen
  Suite beziehungsweise zur vorhandenen Klasse. Cachefehler beeinflussen keine
  Testentscheidung. Alte JUnit-Dateien werden vor jeder Phase entfernt;
  erfolgreiche Ergebnisse werden nicht zwischen CI-Läufen übernommen.

Deck-, Archiv- und Quellen-Scanner sowie Spring-Kontextlimit und Testheap sind
unverändert. Curriculum-Inhalte, M7-Nachweise und menschliche Freigaben werden
durch diesen CI-Fix nicht geändert.

## Lokale Messung und Abschlussprüfungen

Gleicher Rechner, Corretto `25.0.2.10.1`, unveränderte Prüfungsinhalte;
Laufzeiten aus den JUnit-Berichten:

| Identischer Prüfbereich | Vorher | Nachher |
| --- | ---: | ---: |
| Science-Projektion, 42 Scopes | 213,999 s | 31,653 s |
| Beide LaTeX-Prüfungen einschließlich Initialisierung | 53,652 s | 18,135 s |

Die Science-Methode ist 6,76-mal schneller. Ihre geschätzten Scan-Allokationen
in JFR sinken von 40,87 auf 4,20 GiB. Die lokal gemessene akzeptierte Pfadmenge
ist vor und nach dem Pruning identisch. Der ursprüngliche Profillauf umfasst
vier Tests, der gezielte Abschlusslauf 36; diese Gesamtläufe sind nicht als
identischer Prüfbereich verglichen.

| Prüfung | Ergebnis |
| --- | --- |
| Gezielt betroffene Backend-Tests einschließlich sechs Scan-Regressionen | 36 bestanden, keine Fehler oder übersprungenen Tests |
| Vollständiges ungefiltertes `./gradlew check` | PASS, 11 min 10 s; 247 Suites, 2.297 bestanden, 9 bedingt übersprungen, keine Fehler |
| Failure-priority-Regressionsprüfungen | 22/22 PASS |
| Bestehende Workflowprüfungen | 7/7 PASS |
| OpenAI-Quellen-/Draftprüfung | PASS |
| Claude-Quellen- und erzeugte Backend-Publikationsprüfung | beide PASS |

Die neun unverändert bedingten Fälle benötigen ein provisioniertes
Curriculum-Paket (ein Fall) beziehungsweise eine PostgreSQL-Testumgebung
(acht Fälle). Ihre Aktivierungsbedingungen wurden nicht geändert. Die
unabhängigen Reviews prüfen Scan-Semantik, JFR-Vergleich und CI-Fehlerweitergabe.
Rohprofile und synthetische Testlogs verbleiben lokal. GitHub-CI wird gesondert
durch den terminalen Status des integrierten Main-Laufs nachgewiesen.
