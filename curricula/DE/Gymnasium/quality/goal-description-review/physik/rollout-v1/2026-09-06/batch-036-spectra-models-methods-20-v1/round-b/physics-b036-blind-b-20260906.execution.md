# Physik B036 — unabhängige Runde B

Run `physics-b036-blind-b-20260906`; tatsächlicher Beginn 2026-09-06T08:38:30Z, Abschluss der Records 2026-09-06T08:48:41Z; Validierung 2026-09-06T08:49:51Z.

Eigenständig vollständig gelesen: die vorbereitete Konfiguration, eigene Kampagne und Bundlemanifest, eigener Prompt v2 und Physik-Kriterien v1, gebundenes Recordschema, generisches AI-Run-Schema und alle 20 vollständigen eigenen JSONL-Eingaben einschließlich DE/EN-Texten, kanonischem Kontext und eingebetteten Seiten. Die anfangs abgeschnittene Darstellung der Zeilen 2–3 wurde vollständig erneut gelesen. Keine Runde A, positiven Autorenprofile, alten Urteile, Synthesen oder Kanonikdiffs eingesehen. Die in diesen Eingaben enthaltenen Profile sind sämtlich null.

Ergebnis: 15 KEEP, 4 REVISE, 1 SPLIT_REVIEW, 0 BLOCK. REVISE betrifft badb0ef3, 84ddb244, 8ac61062 und ce14a7e7 wegen fehlender englischer Beschreibungen; ebenfalls deutsche EN-Titel sind in den Begründungen als Begleitbefund benannt. Bei badb0ef3 wird zusätzlich Atomhuele korrigiert. SPLIT_REVIEW betrifft 333ca92b: Kontinuität, ausgewählte Strömungsgesetze und Reynolds-Zahl benötigen eine fachliche Entscheidung über den Kompetenzzuschnitt; keine automatische Identitäts- oder Masteryentscheidung.

Alle 20 Records bleiben candidate/ai_candidate, Empfehlung create. Keine Quellenzuordnung, externe Projektion, Bildfreigabe, Humanfreigabe oder tatsächliche Lernleistung wurde bestätigt.

## Reproduzierbare Bindungen

- Book: `sha256:53447634cd068173c688d5a94822becaddb3f1ab6aa0c8520444a531332267b0`
- Bundle: `sha256:afe0b5764ffa9b1809d3590c235df4b2e4c924a39af9c1f31a884d4d3b480255`
- Rohinput: `sha256:7ed22681ae9f501779a2d40e970af333de7dff19459169a1eb7b47a49c56c710`
- Prompt: `sha256:b58605a08b1570635cee845d8aa295d13ad861ae20a8e8000360e020bbe0a10b`
- Kriterien: `sha256:536e07d6957186040f202a922189efde15f3fe21b8a93b722ac3192dd3c3a1a9`
- Recordschema, über Kampagne und Eingabe gebunden: `sha256:b1d5fe108f157ebcb3e6b5c5f0376b3f4d88da935fab9aab79fac8a49b50b7ff`
- Records: `sha256:622f54cb2dbf2cbfa65270d46fa31c263d336bb731566a41e0b82a00bf01441a`
- Runmanifest: `sha256:21e594cc3b45d038dfd652fda0adcfadcc38ba8127a2ba20e36919f2e44424b7`

Die tatsächlich gebundenen Run-Inputrollen sind exakt description_review_batch_input_jsonl, review_prompt und review_criteria. Das Recordschema wurde nicht als finding_schema fehlklassifiziert. Provider OpenAI, Modell Codex; kein nicht verfügbarer Snapshot behauptet. Das Generation-Parameter-Hash bindet exakt dieses JSON ohne abschließenden Zeilenumbruch:

`{"executionMode":"codex_agent","generationParameters":"not_exposed","modelSnapshot":"not_exposed"}`

Digest: `sha256:c2c84483e6bac8b77deaeb36c4a432dfd090d2aa84b1b1f44ac1369d07409a4c`.

## Validierung

Nativ: `app/node_modules/.bin/tsx app/scripts/validateGoalDescriptionReviewCampaignResults.ts` mit den eigenen bundle/input/campaign/batches-dir/results-dir-Pfaden: `Goal-description review campaign results valid: 20` (Exit 0). Zusätzlich 15 unabhängige Rohhash-, Text-, Reihenfolge-, Schema-, Autoritäts-, Feld-, Parameter-, Output- und Zeitchecks PASS. Results enthält genau die erwarteten zwei Dateien. Geschrieben wurden nur diese Records, das Runmanifest und diese Ausführungsnotiz.
