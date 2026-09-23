# LK-Endpunkt zur Koordinatenachsendrehung – Kandidat

**Neuere, von Root angefragte Platzierungsalternative:** [Q25-ALTERNATIVE.md](Q25-ALTERNATIVE.md) weist in allen 88 Views exakt 72 gemeinsame Targets von bestehender Rotation und neuer Prüfung nach. Sie benötigt nur die ohnehin geplanten vier HE-GK-Korrekturen, keine vier zusätzlichen HE-LK-Edits. Bei Auswahl dieser Alternative die ursprünglichen sibling-of-Übungen-Q2-Anweisungen unten nicht ausführen. Der erste Vorschlag bleibt als geprüfte engere Alternative dokumentiert.

**Keine Integration / keine Freigabe.** Autor: Codex; exact serving model identifier not exposed. Unabhängige Fachprüfung offen. Die nachfolgenden Selbstchecks sind keine unabhängige Reviewrunde.

## Fachlicher Kandidat

- Exam-ID: `42752317-6022-47f2-8b34-160db5ef01fb`.
- Nichtinhaltlicher Prüfungscluster: `6b0d2a97-cf9c-4778-9c68-16bb82b7afde`.
- `requires` und `examData.coveredGoalIds` sind exakt `["7bd8f022-5002-5610-994c-a9cec1890558"]`. Die bereits vorausgesetzten Matrix-/Basiskenntnisse werden nicht als zusätzliche vollständig geprüfte Inhaltsziele deklariert.
- 20 BE, vorgeschlagene Bestehensgrenze 10 BE, etwa 25 Minuten. DE/EN-Aufgabe, nicht-exklusive Musterlösung und differenziertes Raster stehen in [task.de.md](task.de.md), [task.en.md](task.en.md) und identisch im nativen Goal-Objekt in [candidate.json](candidate.json).
- Teil 1: positive Vierteldrehung um z aus Basisbildern (6 BE). Teil 2: Bildpunkt, feste Achse und allgemeiner Normerhalt (5 BE). Teil 3: unabhängiger Transfer auf negative Vierteldrehung um x (5 BE). Teil 4: plausible falsche Drehrichtungsbegründung durch Gegenprobe widerlegen (4 BE).
- Keine Folge von zwei Drehungen, keine Drehung des Koordinatensystems, keine ungenannte Winkelkonvention: aktive Punktabbildung, Spaltenvektoren, feste rechtshändige Basis und positive Richtung sind ausdrücklich festgelegt.

## Vorhandene Alternativen zuerst geprüft

Der kanonische Bestand enthält 123 `examData`-Knoten. Durchsucht wurden deren Aufgaben-/Lösungstexte sowie die Dateien unter `curricula/DE/Gymnasium/assessments` nach Achsenrotation/Drehmatrix/Rotationsmatrix und verwandten Begriffen; der einzige direkte Nachfolger von 7bd8… ist bislang 81823….

- `81823f27-0c92-5444-ac4e-32b83169f318`: tatsächlich 2×2-Abbildung eines Dreiecks, Eigenvektor und 2D-Projektion; keine räumliche Koordinatenachsendrehung.
- `a8525adc-fad3-53f5-953f-213bd37b09e8`: Multiplikation mit i als ebene 2D-Abbildung, kein 3D-Endpunkt.
- `2c30949d-0381-5d32-81cf-c6eac7711399` und `3b1f0646-fd0e-5d9d-b515-a5a45417a005`: Kreisbewegung/periodische Modelle; keine 3D-Drehmatrix.
- `6420e4be-fcb1-537a-8367-206431e5b14e`: Rotationsvolumen, andere Kompetenz.
- `0c3cd465-ea5e-51e5-bec5-24298bc2a1fa` und `2f8a3a90-717d-5ac1-b54e-facca26e9008`: Achsenabschnitte/Geraden/Ebenen, keine Drehmatrix.

Im untersuchten aktuellen Bestand wurde kein sachlich passender vorhandener Endpunkt gefunden. Die gemeinsame 81823…-Aufgabe bleibt inhaltlich bytegleich; nur ihre falschen 7bd8…-Einträge in `requires` und `coveredGoalIds` sollen später entfallen. Keine Generalfreigabe der übrigen 81823…-Coverage.

## Sichere, enge Platzierung

Die mit Root abgestimmte Kandidatenoption verwendet einen einzigen nichtinhaltlichen Geschwistercluster zum bestehenden „Übungen Q2“: neuer Cluster unter `98dcf9bd-d119-5eb1-835c-7d719f67b485`, **nicht** unter dem breit referenzierten `14b19ee4-364e-50bd-b6a3-499471356ef3`. Kein neuer Inhaltsatom, kein Tagfilter, kein `prerequisiteOnly`-Verstecken, keine Runtimeänderung.

Nur folgende vier Views erhalten nach der bestehenden Übungen-Q2-Referenz eine explizite Referenz auf den neuen Cluster:

| View unter `composition-views/mathematik/` | Beobachteter Add-Pointer |
|---|---|
| `de-he-lk-g8.view.json` | `/rootNodes/0/children/1/children/3/children/7` |
| `de-he-lk-g9.view.json` | `/rootNodes/0/children/1/children/3/children/7` |
| `de-he-lk.view.json` | `/rootNodes/0/children/1/children/3/children/7` |
| `de-he-sekii-lk.view.json` | `/rootNodes/0/children/27/children/7` |

Die vollständigen Vorher-Hashes und Anker stehen in [integration-plan.json](integration-plan.json). Die Sek-II-LK-Ansicht wurde parallel erweitert; deshalb ist ihr aktueller Q2-Pointer `children/27`, nicht der frühere `children/3`. **Bei Umsetzung immer anhand des Anker-Goal-IDs neu auflösen**, keine alten Arraypositionen blind übernehmen.

Nativer In-Memory-Nachweis gegen **alle 88 Mathematik-Views**: genau diese vier erhalten jeweils nur den neuen Cluster und die neue Prüfung; keine bestehenden Targets verschwinden, keine anderen Views erhalten Targets oder Prerequisite-only-Einträge. Sämtliche 88 Kompilierungen haben 0 Fehler. Vollständige Ergebnisse: [author-self-check.json](author-self-check.json). Eine vollständig unbeschränkte kanonische Baumansicht kann die beiden neuen kanonischen Knoten naturgemäß enthalten; keine der geprüften scoped Views tut dies implizit.

`applicabilityFromRequires` am Exam und eine Mapping-Inheritance-Grenze verwenden die vorhandene Assessmentkonvention; die technische Länderanwendbarkeit folgt dem einzigen Inhaltsziel (15 Länder), beim Cluster per Kind-Union. Das ist **keine** zusätzliche Länder-/Kursplatzierung und keine neue Quellendeckungsbehauptung. Die expliziten Views bleiben die einzige hier vorgeschlagene HE-LK-Auswahl. Kein Applicability-Override und keine neue Source-Mapping-Ausnahme.

## Minimaler späterer Dateidelta / Binder

1. Assessmenttext nach unabhängiger Freigabe nach `curricula/DE/Gymnasium/assessments/mathematik/sekii/q2/coordinate-axis-rotation-lk-v1/{task.de.md,task.en.md}` übernehmen; Source-Pfade im Goal danach richtig binden. Keine veröffentlichte Altaufgabe überschreiben.
2. `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`: zwei Kandidatenknoten ergänzen, den neuen Cluster beim genannten kanonischen Elternknoten anhängen, relevante Vorfahrengewichte nach eindeutigen atomaren Nachfahren aktualisieren; zusätzlich nur die beiden beauftragten falschen 81823…-Kanten entfernen. Kein neuer ordinary/curricularAtomic-Inhaltsknoten.
3. Genau die vier genannten HE-LK-Views ergänzen. `de-he-lk-g8/g9` werden aus `de-he-lk.view.json` generiert; `generateMathDurationCompositionViews.ts` hat hierfür bereits die benötigte Vererbungslogik, kein neuer Generator-/Runtimefall nötig. Das normale Generator-`--check` muss hinterher bestehen.
4. `app/scripts/generateCurriculumQualityStatus.ts`: ausschließlich die neue Cluster-ID in der bestehenden QA-Liste `CANONICAL_GYM_MATH_SEK2_PRACTICE_CLUSTER_IDS` ergänzen, damit der reale lokale Endpunkt in der vorhandenen Routenprüfung zählt. Kein neuer Mechanismus.
5. `quality/release-model/mathematik.semantic-kinds.json`: nach Root-Entscheidung beide neuen Knoten als `practiceAssessment` klassifizieren; Fingerprints mit `fingerprintSemanticKindSourceGoal` berechnen. Bestehende veränderte Binder nur dort erneuern, wo der native Fingerprint tatsächlich wechselt. Keine zusätzliche A-/M-Entscheidung für einen Inhaltsatom und keine Nennererhöhung.
6. Nach der tatsächlichen Scope-/Kantenintegration die betroffenen aktuellen GoalBook-Seiten und D/P-Kontextbindungen neu prüfen. Insbesondere 7bd8… erhält einen echten anderen Nachfolger; unveränderte Kompetenztexte rechtfertigen keine automatische Freigabe veränderter Seiten.
7. Erst nach unabhängiger Sachprüfung/Integrationsentscheidung `examData.reviewStatus` von `needs_review` auf `released` setzen und die freigegebenen Bytes/Reviewreferenzen dokumentieren. Kandidatenstatus blockiert die Release-Gates absichtlich.

## Ausgeführt und noch offen

Ausgeführt durch [check-candidate.mjs](check-candidate.mjs), ausschließlich lesend bzw. in Speicher-Kopien:

```bash
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-22/m7-coordinate-rotation-lk-endpoint-v1/check-candidate.mjs
```

- Matrix-/Basisbilder nachgerechnet: $P_z=(1,2,3)$, $P_x=(2,3,1)$; Gegenmatrix sendet $e_1$ auf $-e_2$.
- Orthogonalität, Determinanten und inverse Beziehung geprüft; zusätzlich 125 ganzzahlige Norm-Testvektoren pro Matrix. Der allgemeine Beweis steht in der Lösung und wird nicht durch Stichproben ersetzt.
- 20 BE als Summe aller 13 Rastereinträge; eindeutige Raster-IDs; Schwelle 10.
- Alle 93 LaTeX-Vorkommen in DE/EN-Aufgabe/Lösung erfolgreich mit KaTeX geparst.
- Kandidat plus Kantenentfernung: keine `contains`-/`requires`-Zyklen, keine fehlenden referenzierten IDs.
- 88 native View-Kompilierungen / Rollenmengen, exakte HE-LK-Isolierung; 81823…-Aufgaben-/Lösungs-/Bewertungsbytes unverändert.

**Nicht ausgeführt / keine Behauptung:** unabhängige fachliche Bewertung, freigegebener Examstatus, vollständiger APV-/Routen-/CQR-/Maturity-Nachweis oder M7-Aufwertung. Der aktuelle kanonische Stand wurde nicht verändert. Der separate GK-Scopefix ist nicht Teil der In-Memory-Platzierungsprüfung. Nach globaler Entfernung der falschen 81823…-Rotationscoverage sind insbesondere verbleibende Routen anderer Länder zu prüfen; HE-only-Platzierung darf nicht als deren Abschluss verkauft werden.

Nach Integration durch Root: `npm --prefix app run validate:graph`, `validate:composition-views`, `check:math-duration-composition-views`, nativer Applicability-Abgleich, Release-/SemanticKind-Binder, aktueller gezielter D/P-Kontextcheck sowie `quality:curriculum-status` und `check:curriculum-maturity-floors`. CQR-104/105 und CQR-201/202/203 müssen den echten freigegebenen Endpunkt tragen; Schutzgrenzen nicht herabsetzen. Der historische fest verdrahtete `validate-authoring-change-set.mjs` ist kein allgemeiner Validator für dieses neue Paket.

## Ergänzung: betroffene bestehende andere Länder-Views

Read-only Target-Abgleich vom 2026-09-21T22:21:34.057Z: 7bd8… und 81823… sind gleichzeitig Targets in **76 Views**: 64 andere Länder-Views, 4 nationale DE-Views und 8 HE-Views vor dem beauftragten GK-Scopefix. Vollständige exakte Dateiliste: [existing-other-view-route-impact.json](existing-other-view-route-impact.json).

- Je vier Views (`de-xx-gk`, `de-xx-lk`, `de-xx-sekii-gk`, `de-xx-sekii-lk`, jeweils `.view.json`) in BB, BE, BW, HB, HH, MV, NI, NW, SL, SN, ST und TH: zusammen 48.
- RP und SH zusätzlich je `gk-g8`, `gk-g9`, `lk-g8`, `lk-g9`: je 8, zusammen 16.
- Nationale Sichten: `de-de-gk.view.json`, `de-de-lk.view.json`, `de-de-sekii-gk.view.json`, `de-de-sekii-lk.view.json`.

Diese Koexistenz ist **keine echte Rotations-Assessmentdeckung**: Der gemeinsame Text prüfte Rotation bereits vorher nicht. Die richtige Kantenentfernung macht damit bislang verdeckte Routenlücken sichtbar. Der HE-only-Kandidat schließt diese 68 anderen/nationalen Platzierungen nicht; native Routen-/Maturitychecks müssen dies als offene Integrationsfolge behandeln. Keine automatische Ausweitung der neuen Prüfung nach GK oder in andere Länder und kein Festhalten an falscher Coverage.
