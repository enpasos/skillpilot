# Alternative: Prüfungscluster innerhalb Q2.5

**Ergebnis der angefragten In-Memory-Prüfung: ja.** Beim Einhängen des neuen Prüfungsclusters `6b0d2a97-cf9c-4778-9c68-16bb82b7afde` unter dem fachlichen Q2.5-Cluster `b3d2284c-21e0-5af8-942a-a4c11390c84a` wird das neue Assessment exakt dort Target, wo `7bd8f022-5002-5610-994c-a9cec1890558` nach der vollständigen geplanten HE-GK-Korrektur Target bleibt.

Beobachteter Stand: 2026-09-21T22:26:13.459Z. Kein kanonisches Objekt, keine View und kein QA-Binder wurde verändert.

## All-Views-Ergebnis

| Prüfung | Ergebnis |
|---|---:|
| Geprüfte Mathematik-Views | 88 |
| Views mit Rotation und neuem Assessment als Target | 72 |
| HE-LK-Views darunter | 4 |
| Andere Länder-Views darunter | 64 |
| Nationale DE-Views darunter | 4 |
| Nicht-HE/nationale GK-Views darunter | 34 |
| Andere Targets für das neue Assessment als für das Rotationsziel | 0 |
| Neu hinzugefügte bestehende Inhaltsziele | 0 |
| Zusätzliche LK- oder andere-Länder-Viewänderungen | 0 |
| Native Compilerfehler | 0 |
| `contains`- oder `requires`-Zyklen | 0 |

Die vier HE-GK-Views erhalten in der Simulation den **vollständigen** alten Plan: Q2.4-Auswahl, Q2.5-Auswahl ohne Rotation und ohne neuen Prüfungscluster, Entfernung des LK-Markov-Endpunkts. Dort erscheinen weder Rotation noch neue Prüfung. Die übrigen 72 Ansichten bekommen ausschließlich die neue lokale Prüfungsstruktur samt Prüfung als zusätzliche Targets; kein bestehendes Inhaltsziel wird hinzugefügt oder entfernt.

**Präzise Grenze:** Das ist nicht „in allen Ländern nur LK sichtbar“. 34 bestehende Nicht-HE/nationale GK-Views enthalten die Rotationskompetenz bereits. Die neue reale Prüfung folgt in diesen Views der vorhandenen Auswahl; sie fügt die Kompetenz nicht neu hinzu. Diese Unterscheidung darf beim Integrationsclaim nicht verloren gehen. Eine allgemeine curriculare Neubewertung jener GK-Auswahlen wurde nicht vorgenommen.

Vollständige Viewliste mit individuellen Rollen und Deltas: [q25-alternative-self-check.json](q25-alternative-self-check.json). Wiederholbarer, nicht schreibender Prüfer: [check-q25-alternative.mjs](check-q25-alternative.mjs).

## Konkreter Delta gegenüber dem ersten Vorschlag

- `candidate.json`, Aufgabe, Musterlösung, BE, einzige Coverage und enger nichtinhaltlicher Cluster bleiben unverändert.
- Neuer kanonischer Cluster-Elternknoten ist Q2.5 `b3d2284c…`, **nicht** `98dcf9bd…` direkt und nicht das breite Übungen-Q2-`14b19ee4…`.
- Die vier manuellen HE-LK-View-Ergänzungen aus `integration-plan.json` **nicht ausführen**, wenn Root diese Alternative übernimmt.
- Nur die bereits beauftragten vier HE-GK-Viewkorrekturen sind notwendig; keine zusätzliche Viewdateiänderung.
- Der vorhandene QA-Terminalcluster-Binder in `CANONICAL_GYM_MATH_SEK2_PRACTICE_CLUSTER_IDS` und die beiden `practiceAssessment`-Klassifikationen bleiben nötig.
- Eindeutige atomare Nachfahrengewichte neu berechnen. Am gelesenen Stand sind Q2.5 = 13, `4720daf4…` = 120, `98dcf9bd…` = 155, Root = 928; ein neues Assessment erhöht die jeweiligen tatsächlichen Atomnachfahrensummen um eins. Neue Cluster-/Assessmentgewichte jeweils 1.
- Nur falsche 7bd8…-`requires`/`coveredGoalIds` am bisherigen 81823…-Assessment entfernen; dessen Aufgabe, Lösung und Scoring bleiben in der Simulation bytegleich.

Maschinenlesbarer Integrationsvorschlag: [integration-plan.q25-alternative.json](integration-plan.q25-alternative.json).

## Keine vorweggenommene Freigabe

Die Matrixaufgabe steht im Autorenkandidaten weiterhin auf `needs_review`; die unabhängige Sachprüfung entscheidet Root separat. Zielmengenäquivalenz und DAG-/Compilerprüfung ersetzen weder native Source-/Applicability-/Routenprüfung noch den Quality-Status mit geschützten Maturity-Floors. Die echte Aufgabe kann mit dieser Platzierung die bisher durch falsche Coverage maskierte Routenlücke sichtbar korrekt verbinden, ohne die bestehende Kompetenzwahl auszudehnen; ob alle strikten Integrationsgates bestehen, ist noch zu prüfen.

