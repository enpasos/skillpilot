# Physik B035 — unabhängige Beschreibungsrunde A

Run `physics-b035-blind-a-20260906`: tatsächlicher Beginn 2026-09-06T07:27:07Z, Abschluss der Review-Ausgabe 2026-09-06T07:33:42Z (jeweils clock).

## Ergebnis und Grenzen

20 Ziele in konfigurierter Reihenfolge, 13 `keep`, 5 `revise`, 2 `split_review`, 0 `block`. Alle Records bleiben `candidate`/`ai_candidate`; für alle 20 wird ein separates `positive-understanding-evidence-v2`-Profil mit `create` empfohlen. Diese Empfehlung erstellt kein Profil.

- `split_review`: `bacae732-2016-5a83-bc61-d0f94ed5a0e4` (Ein-Elektron-Energien und Pauli-Prinzip); `ad021f2e-6b94-5e6e-a264-3d1110094b87` (Eigenenergien und Ortswahrscheinlichkeitsintegration).
- `revise`: `51bc5513-6879-548f-b19a-9746b667f1a3` (Betragsquadrat/Dichte); `ef6d5067-96b0-5388-87dd-5ac4e6a3e313` (prüfbarer Modellvergleich und DE/EN-Modellbedingung); `b05da028-65e4-5cd1-a13c-6c1a95b6dfdf` (Kollapsbegriff, Modellbezug, DE/EN); `aef1e312-6a0c-5323-9202-c22ae84086f2` (Koinzidenz versus Einzelphotonen-Unteilbarkeitsbeleg); `43adaa0b-1f37-5d55-a496-6900555274a1` (englische Beschreibung fehlt).
- Bei `43adaa0b` ist auch der gebundene englische Titel noch deutsch. Das Recordschema erlaubt nur Beschreibungsersatzfelder; die zusätzliche Titelübersetzung wird daher lediglich als offener Befund vermerkt.

Vollständig gelesen: eigene `prompt.md`, `criteria.md`, Recordschema, Campaign, alle 20 vollständigen JSONL-Datensätze mit DE/EN und eingebettetem Kontext. Zusätzlich gelesen: eigene Bundle-Hülle sowie generische Validator-/Run-Schemaimplementierungen. Kein Lesen von Runde-B-Ergebnissen, positiven Autorenprofilen oder Synthesen. Die vorangegangene Vorevidenzsuche ergab keine direkten Zielreviews und lieferte keine Urteilsvorlage. Runde B wurde separat delegiert; vor Abschluss wurden keine Entscheidungen ausgetauscht.

Keine kanonischen, Registry-, Runtime- oder Bildänderungen; keine menschliche, normative Quellen- oder Bildfreigabe. Darstellungsdateien wurden nicht als Leistungsbeleg benutzt. Der gebundene Seitenkontext wurde als Scopekontext gelesen; externe Quellen-Mappings wurden nicht zusätzlich verifiziert.

## Ausführungsbindung

Provider/Modell sind wahrheitsgemäß generisch `OpenAI`/`Codex`; keine unverfügbaren Snapshot- oder Generierungsparameter werden behauptet. Exakt gehashte Parameterrepräsentation ohne abschließenden Zeilenumbruch:

```json
{"executionMode":"codex_agent","generationParameters":"not_exposed","modelSnapshot":"not_exposed"}
```

SHA-256: `c2c84483e6bac8b77deaeb36c4a432dfd090d2aa84b1b1f44ac1369d07409a4c`.

Die drei Run-Inputrollen binden genau die tatsächlich gelesenen Inhaltsartefakte:

- `description_review_batch_input_jsonl`: `1316c712f2867e181931875bdb15191d59e5fed480ec86098c2bb6934faf33f5`
- `review_prompt`: `b58605a08b1570635cee845d8aa295d13ad861ae20a8e8000360e020bbe0a10b`
- `review_criteria`: `536e07d6957186040f202a922189efde15f3fe21b8a93b722ac3192dd3c3a1a9`

Das Recordschema ist durch Campaign und Batchinput gebunden, nicht als `finding_schema` umetikettiert:

- Recordschema: `b1d5fe108f157ebcb3e6b5c5f0376b3f4d88da935fab9aab79fac8a49b50b7ff`
- Ausgabe: `61a63ef3dd7bb3bf11d370b4e3d3e535f44d32e6f4cc26eaf05faf8b05aa924e`
- gebundener Review-Book-Digest: `61708de873f1fa35d6be4db1a616551c6036fd900d9f6571a4776da18729fd73`

## Validierung und Dateien

Native `validateGoalDescriptionReviewCampaignResults.ts` für ausschließlich Runde A: Exit 0, `Goal-description review campaign results valid: 20`.

Zusätzliche Byte-/Inhaltsprüfungen: 20 eindeutige Ziele, exakte Reihenfolge und Ziel-/Seiten-/Textbindungen, ausschließlich Kandidaten, sechs bilinguale Evidenzfelder je Record sowie Input-, Prompt-, Kriterien-, Recordschema- und Outputhash jeweils PASS.

- [Records](round-a/results/physik-rollout-v1-batch-035-quantum-models-particles-20-v1-20260906-first-pass-a.batch-001.records.jsonl)
- [Runmanifest](round-a/results/physik-rollout-v1-batch-035-quantum-models-particles-20-v1-20260906-first-pass-a.batch-001.run.json)

Geschrieben wurden nur diese beiden Ergebnisdateien und diese Notiz außerhalb von `results`.
