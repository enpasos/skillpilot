# Begrenzte Backend-Fixturekorrektur für die geprüften Lernwege

15. November 2026. Diese Lieferung ändert ausschließlich drei bestehende
Backend-Integrationstests und fügt ihre konkreten QA-Belege hinzu. Sie ändert
keinen Laufzeitcode, keine kanonischen Daten, Quellen, Freigaben oder Floors.
Der fokussierte abschließende Lauf wird separat in `final-local-validation.actual.json`
gebunden; ein vollständiger Backend-Lauf und frisches Remote-CI sind damit
nicht behauptet.

Der alte CI-Lauf `43690394580`, Job `132745178486`, prüfte Commit
`5bf8228635aed4eee780fdb98f4b7ee2af6d480a`: 2773 Tests, genau drei Fehler,
19 übersprungene Tests. Seine drei Fehler enthalten zusammen 64 veraltete
Seed-Größenassertionen. Die hier unverändert aufbewahrte Extraktion steht in
`backend-original-failed-counts.actual.json`.

Die Datenstände vor der fachlichen Lieferung (`a7c7e9ceb26f06194e25f29e32941d4e4cb17c32`)
und des alten CI-Heads wurden mit dem tatsächlichen aktuellen Backend
abgespielt. Der Adapter verwendet die tatsächlichen `LandscapeService`,
`CompositionViewService` und `LearnerService` sowie die exakt beobachteten
Personal-Curriculum-Konfigurationen. Er implementiert keine eigene
Projektionsregel. Alle 128 Baseline-Mengen ergeben die alten Fixturegrößen;
alle 64 Zahlenpaare des alten CI-Fehlers reproduzieren sich mit dessen exakten
Quelldaten. Die vollständigen tatsächlichen Antworten, Git-Blob-/SHA-Pins der
beiden Quelldatenstände und Konsolenlogs bleiben erhalten.

`seed-scope-comparison.actual.json` bindet pro Fach, Land, Dauer und Kurs die
vollständigen Baseline-, Erstlieferungs- und aktuellen Seed-ID-Mengen sowie
die konkreten Hinzu-/Wegfall-IDs. Zusätzlich nötige Vorbereitung und die
geschlossene Lernmenge stehen getrennt daneben. Die vorhandenen unabhängigen
Closure-, DTO-, Quellen- und Anwendbarkeitsprüfungen bleiben bestehen. Die
Teständerung pinnt nun auch die exakten aktuellen IDs und die hinzugefügten
und entfallenen IDs; eine gleich große falsche Menge genügt nicht mehr.
`same-size-counterexamples.actual.json` hält zwei konkrete solche
Gegenbeispiele als ausdrücklich getrennte In-Memory-Prädikatsprüfung fest.

Die 64 betroffenen Scope-Erwartungen verteilen sich auf 32 Mathematik-Sek-I-,
zwölf Mathematik-CrossStage- und 20 Physik-Sek-I-Konfigurationen. Alle 64
Biologie-/Chemie-Konfigurationen behalten ihre Seed-Mengen und bisherigen
Erwartungszahlen. Die konkrete fachliche Begründung, IDs und Geltungsbereiche
stehen in `scope-delta-decisions.actual.json`; die zugehörigen unveränderten
aktuellen Zielobjekte sind im Vergleichsbeleg referenziert.

Der Sonderfall HE G9 betrifft `f39c49c7…` (Tabellen erstellen). Die bestehende
allgemeine KC-Zuordnung hat nur `gradeBand:J5_6`; die explizite historische
Jahrgangszuordnung ist G8. Der unveränderte Generator nimmt nur explizite
`durationModel`-/`grade`-Quellen in die Dauer-Jahrgangsbuckets auf. HE G9
erhielt dieses Ziel bislang allein durch die abgeleitete Routenergänzung
`c9df47fa…` (Tabellen lesen) → `f39c49c7…`. Der tatsächlich geprüfte neue
Lese-Pfad benötigt keine vorherige Tabellenkonstruktion. Daher entfällt f39
dort aus den Seeds; das vollständige kanonische Ziel bleibt erhalten.
Das ändert keinen offiziellen Sourceclaim. Die neue Konstruktionsaufgabe
`54ce7136…` bleibt in allen drei erzeugten HE-G9-Views `prerequisiteOnly`
(supportOnly). Dieser begrenzte Fixtureabgleich behauptet keine zusätzliche
offizielle G9-Abdeckung. Nötige Vorbereitung wird weiterhin separat in der
tatsächlichen kanonischen Closure geprüft.

Die erste Math-Lieferung ergänzt vier echte Assessments und entfernt in den
generierten HE/RP/SH-Seeds vier fortgeschrittene Ziele, die allein der falsche
Diagramm-Vorwissensweg hineingezogen hatte. Die nachfolgende elementare
Lieferung ergänzt bis zu drei weitere Assessments gemäß tatsächlich
kompilierter Sichtbarkeit. Die Physik-Lieferung ersetzt die Sek-I-Sichtbarkeit
der Bändermodell-Prüfungsaufgabe durch den einfachen Modellweg und seine
freigegebenen Aufgaben, mit den tatsächlich quellgebundenen Dioden- und
BY-Transistoranteilen. Hier werden weder diese Entscheidungen erneut
autorisiert noch Schülerleistungen übertragen.

Aus dem Repository-Wurzelverzeichnis lässt sich der Beleg ohne native
Neuausführung gegen die unveränderten gespeicherten Antworten prüfen:

```bash
python3 curricula/DE/Gymnasium/quality/goal-model-review/backend-reviewed-seed-fixture-repair-20261115/materialize_seed_comparison.py \
  --baseline-results curricula/DE/Gymnasium/quality/goal-model-review/backend-reviewed-seed-fixture-repair-20261115/native-before-results.actual.json.gz \
  --first-results curricula/DE/Gymnasium/quality/goal-model-review/backend-reviewed-seed-fixture-repair-20261115/native-first-results.actual.json.gz
```

Die tatsächlichen nativen Daten-Replays und der Vorher-/Nachher-Testbefehl
stehen mit Arbeitsverzeichnis, Exitcodes und Ausgaben in
`final-local-validation.actual.json`. Verwendet wurde der vorhandene Corretto
25 und Gradle 9.7.1 mit einem ausschließlich aufgabenlokalen Projektcache;
alte Cachebelege wurden nicht verändert. Die früheren zwei lokalen
Gradle-Startfehler betrafen ausschließlich nicht verwendbare Cachepfade und
werden im Abschlussbeleg von den tatsächlich gestarteten Tests getrennt.
