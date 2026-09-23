# Mathematik: verbleibende D/P-Batches mit Altartefakt-Nutzung

Stand der read-only Inventur: 2026-09-21T22:03:15Z (22.09.2026, 00:03 Europe/Berlin). Keine neuen Reviews, Freigaben oder Reservierungen. Dieses Dokument ist ein Arbeitsvorschlag, kein D/P/M7-Nachweis.

## Ergebnis und Abgrenzung

**45 konkrete nächste Fälle:** 2 eng begrenzte Kontext-Carryovers mit zwei validen historischen Reviewrunden und bestehenden P-Profilen; weitere 43 kohärente Ziele mit wiederverwendbarer Erstprüfungs-Substanz, aber nicht mit aktuell gültigen D-Runden. Ein Paket von 30–50 schon gültigen dualen D/P-Carryovers wurde in den untersuchten Beständen nicht gefunden.

Quellen:

- Zentrale Registry: `curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json`.
- Verlangter stabiler Ausgangsbericht: `2026-09-21/m7-proof-statistics-integrated-v1/five-gate-after34.json` unter diesem Rollout: 797 aktuelle Atome, D 510, P 511, striktes D/P/A/M/V 461 (57,8 %), Rest 336, 69 explizit zurückgestellte V-Ziele.
- Aktuelles `curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json`: 25 reservierte Ziele, fünf Konfigurationen (046h: 10; 044h: 9; Integral-Holds: 2; 033h: 3; Parameter-Hold: 1). SHA-256: `f32f6c8e1576f2b693131e7daead134609d94f47274ab289d219d12531b6f00c`.
- Während der parallelen Root-Integration stieg die Registry-Mitgliedschaft auf je 521 D-Index-/P-Scope-IDs. Das ist **kein neu berechneter Gate-Bericht**. Die genannten 12 D / 8 P sowie `0d21097c-09bf-5375-8c56-34ce8dc5bc35` sind in keinem Vorschlag enthalten.
- Auswahl: aktuelle 797 IDs minus registrierte `strictDescriptionComplete`-IDs beziehungsweise P-`scope.goalIds`, minus alle aktiven Ledger-IDs. Übrig: **251 ohne beide Registry-Bindungen**, keine zusätzlichen einseitigen D-/P-Lücken außerhalb der Reservierungen.

Untersucht wurden Mathematik-`*records.jsonl` im dauerhaften Description-Rollout und in `tmp/goal-description-reviews`, außerdem die Mathematik-`*.candidates.json` und `*.review.jsonl` unter `quality/goal-evidence`. Von den 251 haben 231 historische D-Datensätze; bei 219 stimmt mindestens ein Goal-Fingerprint mit dem aktuellen kanonischen Ziel überein. Das bescheinigt ausdrücklich **nicht** aktuelle Seiten-/Kontextbindung oder vollständige unabhängige Abdeckung. Nur die unten genannten zwei haben im untersuchten Bestand eigenständige P-Entwürfe/-Records.

## Priorität 1: Trigonometrie-Kontextdelta (2)

| Goal-ID | Ziel |
|---|---|
| `46bdcc16-418f-417a-89cf-033d7ae6c8cc` | Trigonometrische Graphen und Periodizität deuten |
| `82597dfb-0ec6-4a77-abaf-e1d6bdd12041` | Einheitskreis und Bogenmass für trigonometrische Funktionen nutzen |

Vorhanden, unter
`curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-05/batch-031r-atlas-revised-context-final-recheck-14-v1/`:

- `round-a/results/mathematik-rollout-v1-batch-031r-atlas-revised-context-final-recheck-14-v1-20260905-first-pass-a.batch-001.records.jsonl` und analog `round-b/...first-pass-b...`; beide Ziele KEEP/KEEP, verschiedene deklarierte `independenceGroupId`.
- `resolution-index.stable-current-carryover-12-v1.json` und `resolutions-stable-current-carryover-12-v1/<goalId>.resolution.json`.
- P-Authoring und P-Records: `curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-031r-stable-current-carryover-12-v1.{candidates.json,review.jsonl,config.json}`.

**Konkreter offener Befund:** Aktueller nativer Aufbau derselben 14er-Teilmenge mit unverändertem `bookId`, Titel und Reihenfolge ergibt bei beiden Seiten genau eine inhaltliche Änderung: `reverseRequires` enthält nun `895a60ea-606a-4e77-a5af-ecc13d68e8fb` („Parameter trigonometrischer Funktionen deuten“). Sonst sind alle Seitenfelder außer dem daraus folgenden `pageFingerprint` identisch. Kanonischer Goal-Fingerprint und DE/EN-Texte sind gleich. Die alten Seitenfreigaben sind deshalb nicht direkt current.

**Nächster Schritt:** Genau dieses Kontextdelta mit der aktuellen Seite gegenprüfen und nach dem vorgesehenen Carryover-Verfahren neu binden; vorhandene unabhängige Sachurteile und P-Inhalte erhalten, keinen unbegründeten Textumbau beginnen. Aktuelle Bilder wurden in dieser Inventur nicht visuell bewertet. Zwei-Ziel-P-Scope aus dem vorhandenen Authoring isolieren und nativ prüfen, nicht die alte 12er-Konfiguration pauschal erneut registrieren.

Read-only Validierung: `validateGoalDescriptionReviewCampaignResults.ts` besteht für beide historischen Runden mit je 14 Records. `positiveGoalEvidenceReview.ts --mode=check` meldet im alten 12er-P-Scope genau **einen** Fehler, `stale reviewInputFingerprint` für das andere Ziel `8d30d241-0247-48ac-83d3-4e0de61584d3`; für die beiden vorgeschlagenen Ziele keinen Fehler. Die Profile bleiben `needs_human_review` / `ai_candidate`, nicht menschlich freigegeben.

## Prioritäten 2–4: 43 kohärente Ziele mit Erstprüfungs-Substanz

Gemeinsames Archiv (lokal unter `tmp`, nicht als dauerhaft verfügbaren oder publizierten Nachweis behandeln):

`tmp/goal-description-reviews/math-gymnasium-full-20260816-v1/review-campaign/`

Die ausgewählten 43 Records sind KEEP, mit aktuellem Goal-Fingerprint und unveränderten DE/EN-Beschreibungen. Batch-Run-`outputDigest` stimmt in allen drei Fällen mit den tatsächlichen Record-Dateien überein. Alle gehören jedoch **derselben** Independence-Gruppe `codex-full-math-first-pass-20260816-v1` an; drei Dateien sind nicht drei unabhängige Meinungen.

**Echter gemeinsamer Blocker:** Der heutige native `validateGoalDescriptionReviewBatch` lehnt die alte Kampagne und ihren Input ab: alte Schema-Version, fehlendes `canonicalContext`/`reviewContext` im Input sowie fehlendes `recordSchemaDigest` in Kampagne/Batches. Das ist mehr als ein unbelegter Staleness-Verdacht. Alte Fingerprints bloß umzuschreiben würde keine neue Kontextprüfung nachweisen. Für diese 43 wurden keine eigenständigen P-Profile gefunden.

**Nächster Schritt:** Bestehende Begründungen als Arbeitsmaterial erhalten, aktuellen curricularen und Seitenkontext gezielt ergänzen und nach heutigem Vertrag prüfen; für einen D-Abschluss tatsächlich zwei unabhängige aktuelle Kontextbewertungen sicherstellen. Anschließend zielgenaue P-Profile erstellen und gegenprüfen. Nur eine zweite Runde allein reicht bei der nicht current-validen Altkampagne nicht. Keine Textrevision ohne konkreten Befund. Gemeinsame fachliche Fälle können Vorbereitung erleichtern, ersetzen aber keine individuellen sechs DE/EN-Verständnisfelder und P-Nachweise.

### 2. Modellierungskreislauf (16)

Artefakte: `results/codex-first-pass-20260816-v1.batch-026/{records.jsonl,run.json}` sowie `batches/codex-first-pass-20260816-v1.batch-026.input.jsonl`.

Diese Gruppe lässt sich als ein nativer Batch unter der 20er-Grenze vorbereiten. Offener Befund ist hier zunächst der gemeinsame Vertrags-/Kontext- und P-Abschluss, kein neu behaupteter Wortlautfehler.

| Goal-ID | Ziel |
|---|---|
| `035b7fc6-830d-5f41-9c5d-2495808c09d4` | Sachverhalt vereinfachen und strukturieren |
| `07196e72-ba47-54bf-a096-3a79bbb67e23` | Beziehungen als Modellgleichungen aufstellen |
| `163dd583-8308-53f0-b60d-34588787988d` | Modelle nach Kriterien vergleichen (LK) |
| `27542d59-aa1b-569d-8d77-41129bae26e2` | Mathematisches Verfahren auswählen |
| `4a630596-6e2f-593e-bac6-2a6d8fa58e2f` | Ergebnisse sichern und prüfen |
| `519660d0-85e5-57a6-a219-d0a253336649` | Modellentscheidung begründen (LK) |
| `5836c821-d43b-5c02-9ee5-e86bb87bb054` | Modellgrenzen benennen |
| `74f28ce7-e568-5d6e-b946-17445b344fcc` | Alternative Modelle entwickeln (LK) |
| `8d126397-a8b0-528c-8986-614d56fa0749` | Sachskizze mit Variablen erstellen |
| `8d2021d0-aa14-5023-998b-187356de7986` | Modell rechnerisch lösen |
| `ae2ca565-928d-55f4-b804-7155cf210120` | Zwischenschritte dokumentieren |
| `bb4569bc-01ac-5bf9-8c85-05df42d70698` | Größen und Einheiten identifizieren |
| `bfbaedb9-b138-590a-87e8-4d87784dda0e` | Annahmen und Idealisationen formulieren |
| `dd582580-5cd3-55b3-b05e-e1c102533737` | Ergebnisse zurückübersetzen |
| `e03eca28-9a57-5b24-877c-2e63fecee986` | Plausibilität und Realisierbarkeit prüfen |
| `fb4dcd2a-a6a9-5371-a2fc-95348ee130e0` | Modellverbesserungen vorschlagen |

### 3. Mathematische Kommunikation (12)

Artefakte: `results/codex-first-pass-20260816-v1.batch-030/{records.jsonl,run.json}` sowie `batches/codex-first-pass-20260816-v1.batch-030.input.jsonl`.

Ein zusammenhängender Batch zu fachsprachlichem Erklären, Diskussion und Darstellung. Die fachfremden Restfälle Aufwand/Genauigkeit und Wahrscheinlichkeitsvergleich aus derselben Altdatei sind bewusst nicht beigemischt.

| Goal-ID | Ziel |
|---|---|
| `121ef4c5-c1c2-5294-9582-86bab2355907` | Lösung nachvollziehbar erklären |
| `3019ed7f-8f74-5330-816c-17997156ed68` | Ergebnisse strukturiert präsentieren |
| `33f2da84-d6ac-54d2-931a-76aed5cbc0c2` | Schriftliche Ausarbeitung strukturieren (LK) |
| `4a53a441-3c2a-53aa-8a1a-e08a6898e826` | Begriffe präzise verwenden |
| `8b635349-abc3-59e7-af93-ec28940bf690` | Kommunikation reflektieren und verbessern |
| `aeae526e-b3a4-5a17-b177-351df0307cb9` | Notation adressatengerecht erläutern |
| `b35f8254-dfcc-5d4d-b77f-7b182999617f` | Stil und Präzision verbessern (LK) |
| `bab64124-fabf-544c-a2e5-3e6c786531d2` | Argumente austauschen und prüfen |
| `d5e1e007-7c64-5350-8aa9-fde93f8a76b5` | Mit Beispielen und Darstellungen erklären |
| `ded082ed-ea38-510c-ab91-e0a50b064e07` | Kritik aufnehmen und integrieren |
| `fc2cf102-dcde-5565-884f-7c9e3e3b54b6` | Kooperativ Ergebnisse erarbeiten |
| `fcb4cef1-b17a-5682-924c-41498fc6c9b2` | Aussagen strukturiert formulieren |

### 4. Problemlösen und Modellreflexion (15)

Artefakte: `results/codex-first-pass-20260816-v1.batch-025.records.jsonl`, `results/codex-first-pass-20260816-v1.batch-025.run.json` und `batches/codex-first-pass-20260816-v1.batch-025.input.jsonl`.

Ein eigener 15er-Batch, fachlich benachbart zu Priorität 2. Zusätzlicher konkreter Altartefakt-Befund: Die Evidenzformulierungen nutzen wiederholt allgemeine Rahmensätze plus Zielwortlaut. Ihre Substanz kann übernommen werden; sie sollte nicht ohne individuelle Kontext-/Transferprüfung als heutiger positiver Verstehensnachweis ausgegeben werden. Die inzwischen integrierten Beweisziele desselben historischen 20er-Batches bleiben ausgeschlossen.

| Goal-ID | Ziel |
|---|---|
| `11f7090c-3e44-522f-9b77-1e07cceffc0f` | Modellgrenzen diskutieren |
| `22fb19c1-9b26-5090-a8ae-6cea79ee581a` | Systematisch probieren und Muster erkennen |
| `295f61e0-0f47-515b-be57-27170a5eee7a` | Vorwärts- und Rückwärtsarbeiten anwenden |
| `70f37fda-545f-51dc-a002-c8e435e5c4a5` | Ergebnis im Kontext deuten |
| `7e1b43e2-40f9-5751-9735-d97763eb4ea2` | Variablen und Annahmen festlegen |
| `86022c15-9847-5864-b84f-9ffe5d71556e` | Spezial- und Extremfälle nutzen |
| `8b885220-9985-52f1-a236-449d2f897acc` | Entscheidungen begründet treffen (LK) |
| `909d8b16-5156-528b-a300-d9aee5405ba0` | Modell gezielt anpassen |
| `95aa25c9-bf7f-53ee-bde2-df67cad3d46b` | Strategien optimieren (LK) |
| `a41761f2-8ba8-5af4-87c1-eb5e4ab1d020` | Plausibilität prüfen |
| `bd637a72-6609-54f5-bb33-8a9e898bf7a0` | Heuristik auswählen und begründen |
| `c8698478-4662-5b52-a3e5-7994604ff0de` | Alternative Strategie vorschlagen |
| `cedbd525-fefb-52d3-9bdd-947543ee3f2f` | Lösungsplan skizzieren |
| `e02b994f-376d-5a8e-a14c-c4acacae57cf` | Nebenbedingungen berücksichtigen |
| `fde351a8-98b1-5d75-b4df-813beb2bbe3c` | Beziehungen im Modell formulieren |

## Nicht in einen schnellen KEEP-Batch mischen: sieben bestehende Sachbefunde

Hier liegen bereits zwei historische Runden vor; ihre Differenzen sind nicht durch eine neue pauschale KEEP-Runde zu beseitigen. Quellen sind die jeweiligen `round-{a,b}/results/*.records.jsonl` unter `2026-08-28/` im dauerhaften Rollout:

| Goal-ID | Vorliegende Entscheidungen / noch zu entscheiden |
|---|---|
| `0f6c1df6-0e30-54ae-8098-e9422833ba80` | B014 A revise / B keep: Eindeutigkeit einer Dreieckskonstruktion „bis auf Kongruenz“ explizit klären. |
| `d051857c-0707-544f-ae7a-f20690d182b2` | B014 revise/revise: Bezug der Höhe zur gegenüberliegenden Seite oder deren Verlängerung fehlt. Vorliegende lokale DE/EN-Vorschläge adjudizieren. |
| `59d5a330-61be-4590-ab46-cf7cefecd144` | B014 split/split: Volumen und Oberfläche gerader Prismen als unabhängig prüfbare Kompetenzen; strukturelle Entscheidung erforderlich. |
| `8064088b-dc0a-4a67-ad63-360fdcc9869d` | B014 split/split: Umfang/Bogenlänge versus Fläche; zusätzlich Titel „Kreisteile“ weiter als Beschreibung. |
| `1a18dbb3-f350-4766-9c8b-20ca018ccef1` | B013 split/keep: Funktions-Ableitungs-Koordination, lokale und globale Extrema als Einheit oder mehrere Ziele adjudizieren. |
| `6a4716bd-8038-46bb-b647-0db4a254fee7` | B013 revise/split: mögliche Gradschlüsse versus Termrekonstruktion und fehlende Eindeutigkeit; Identität zuerst klären. |
| `f76d00dc-6b31-59cd-b01a-3610eadc9908` | B013 revise/keep: strikte/nichtstrikte Form des Monotoniesatzes und korrekte Nichtumkehrbarkeit klären. |

B014: `batch-014-j7-geometry-measurement-fast16-stable-carryover-3-v1`.
B013: `batch-013-j10-functions-trigonometry-deep8-carryover-2-v1`.
Diese Befunde werden hier nur inventarisiert, nicht neu entschieden oder reserviert.

## Effiziente Reihenfolge und Grenzen

Zuerst die zwei B031r-Kontextfälle, danach drei getrennte kohärente Gruppen von 16, 12 und 15 Zielen. Vor jeder späteren Reservierung Registry und In-flight-Ledger erneut abgleichen; diese Liste ist kein Lock. Die 43 Alt-Erstprüfungen sparen fachliche Vorbereitung, aber nicht die nachweislich fehlende aktuelle Kontextabdeckung und P-Arbeit. Keine Voll-QS, keine kanonischen Änderungen und keine Registry-/Ledger-Updates wurden für diese Inventur ausgeführt; keine neuen D-/P-/V-Urteile wurden ausgestellt.
