# Kürzester korrekter nativer D-Abschluss

Rein lesende Vertragsprüfung vom18.10.2026. Technische Dokumentation: Apache-2.0. Hier wurden weder QC-/Reviewerobjekte noch Kampagnen, Modelle oder Render erzeugt; Normaldateien und der versiegelte Helper bleiben unverändert.

## 1. Umfang erst nach dem tatsächlichen finalen Cut bestimmen

Root beendet die169 Support-Platzierungen,75 Maschinenfreigaben, TH/HB-Metadaten und die tatsächliche Applicability-Anwendung samt erforderlichen SEM-Nachbindungen. Danach den neuen finalen Plan exakt pinnen und den vorbereiteten Helper zuerst ohne, dann mit `--execute` ausführen. Er misst ein tatsächliches vollständiges450-Modell und bildet daraus die erforderlichen kleinen Gruppen; kein zweiter alter Generatorlauf ist nötig.

Die beiden Listen getrennt halten:

- **Neue aktuelle D-Prüfung:** tatsächliche Fehler des unveränderten nativen Vertrags oder Änderungen an kanonischem Kontext, Text, Seiteninhalt beziehungsweise vollständig ausgewähltem P-Record. Die tatsächliche Messung entscheidet; weder27,107,237 noch die älteren130 sind eine pauschale Vorgabe.
- **Reiner Buch-/Subset-Transport:** vollständige Rohdifferenzen bleiben sichtbar. Einen alten Besitzer nur erhalten, wenn `validateResolutionIndex` ihn gegen den tatsächlichen aktuellen kanonischen Stand als gültig bestätigt und die gemessenen kanonischen, Text-, Inhalts- und P-Bindungen unverändert sind. Er bleibt an seinen ursprünglichen nativen Input gebunden. Nicht behaupten, sein alter Fingerprint akzeptiere die neue flache450-Buchseite. Eine tatsächlich nötige Neubindung muss den unveränderten Vertrag erfüllen.

Vorhandene wissenschaftliche D-Befunde, originale zwei Identitäten, P-Profile, Quellen-/Bildbefunde und Dissens bleiben als historische Evidenz erhalten. Es ist kein neuer450-Themen- oder75-Aufgabenkörper-Review allein wegen Seitenzahlen erforderlich. Ein neuer aktueller Seitenbefund darf aber nicht durch bloße Hash-Übertragung ersetzt werden.

**Releaseguard geprüft:** Der versiegelte Helper kontrolliert für die exakt75 neuen IDs `examData.reviewStatus === 'released'`. Tatsächlich gelesen:75/75 haben diesen Status und `extendedData.machineAssessmentRelease`;0/75 haben `release.status`. Eine zusätzliche `release.status`-Pflicht existiert hier nicht und wäre unbegründet. Die Marker sind Maschinenfreigaben der geprüften Aufgabendesigns, keine menschliche Freigabe.

## 2. Nur die gemessenen benötigten Gruppen nativ vorbereiten

Der Helper schreibt `final-cut/FINAL-INPUTS.actual.staged.json` und Gruppen von höchstens20 Zielen. Der bestehende Adapter nutzt diese tatsächlichen Configs:

```bash
NATIVE_D_ADAPTER='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-normal-integration-20261017-v1/D-final-native-adapter/native-d-final-context-adapter.mjs'
NATIVE_D_PLAN='NEW_ACTUAL_FINAL_NATIVE_PLAN.json'
node --import ./app/node_modules/tsx/dist/loader.mjs "$NATIVE_D_ADAPTER" --final-plan "$NATIVE_D_PLAN" --phase plan
node --import ./app/node_modules/tsx/dist/loader.mjs "$NATIVE_D_ADAPTER" --final-plan "$NATIVE_D_PLAN" --phase prepare --execute --allow-bounded-pdf
```

Stock-`prepare` erzeugt je Gruppe ein gemeinsames gebundenes Bundle mit Modell, HTML/PDF, normalisiertem Seiten-/P-Input und zwei Kampagnen `round-a`/`round-b`. Beide erhalten denselben vollständigen V3-Input und dieselbe Reihenfolge; die Kampagnen-/Runden-/Unabhängigkeits-IDs sind getrennt. Kein eigener Renderersatz und kein leeres „Review“ sind nötig.

## 3. Zwei tatsächliche unabhängige aktuelle Durchgänge

Am einfachsten zwei frische Reviewer-Kontexte parallel verwenden. Jeder erhält nur seine aktuelle Kampagne, den gebundenen Prompt und die Chemiekriterien, das aktuelle V3-/Batch-Input und die aktuellen gebundenen Seiten. **Keine Ergebnisse des anderen Reviewers, früheren D-Runden, Adjudikationen oder kanonischen Diffs vor dem eigenen Seal.** Das verbietet der vorhandene Prompt ausdrücklich. Alte D-Urteile daher bei Root als fortgeführte Provenienz/Synthese erhalten und nicht dem neuen First-Pass zum Abschreiben geben. Das ausdrücklich gelieferte aktuelle vollständige P-Profil ist hingegen erlaubter Reviewkontext.

Jeder prüft **jedes zugeteilte Ziel vollständig** und liefert genau einen Record je Ziel, einschließlich:

- aktueller deutscher und englischer Titel/Beschreibung; eigener Kompetenzumfang und sprachliche Gleichwertigkeit;
- `canonicalContext`: Phase, Dimensionen, Kern/Erweiterung, strukturelle Beziehungen, Voraussetzungen und ausdrücklich gebundene Applicability-Semantik;
- aktuelle Seite: direkte Voraussetzungen und Nachfolger innerhalb/außerhalb des Subsets, Titel/Links und ein möglicher neuer Assessment-Nachfolger; keine rückwärts abgeleitete Meisterung oder verbreiterte Kompetenz;
- aktuelle Bild-/Darstellungsreferenz als Lehrkontext und vollständiges gegenwärtiges P-Profil mit seinen Leistungs-/Transfergrenzen; kein neues V-/P- oder Lerner-Experiment daraus ableiten;
- tatsächlich mitgelieferte Quellen-/Mapping-/View-Evidenz, soweit vorhanden. Ein `sourceRef` oder nackte Applicability beweist keine externe Quellenabdeckung. Keine vollständige Länderprüfung behaupten, wenn die entsprechenden Belege nicht im Input stehen.

**Kürzester Seitenweg:** normalisierte aktuelle V3-/Batch-Seitendaten sind für IDs, Relationen, Fingerprints und Profile maßgeblich. HTML oder PDF sind parallele Leseflächen; der native Run-Vertrag verlangt nicht, beide Formate doppelt zu begutachten. Ein echtes Lesen der vollständigen aktuellen JSON-Seiten samt benötigter Darstellungen ist zulässig. Wenn HTML/PDF visuell gelesen wurde, genau diese Oberfläche deklarieren; ein Schema-/Hashcheck allein ist kein Seitenreview. Keine neue Bildsichtung oder Layoutabnahme behaupten, die nicht stattgefunden hat.

Der neue First-Pass prüft die aktuellen Beschreibungen und Zusammenhänge nach den vorhandenen Kriterien; er ist kein mechanischer Delta-Abnicker. Unveränderte aktuelle, passende P-Erwartungen können als inhaltlicher Kontext fortgeführt werden. Keine zusätzlichen Fälle, praktischen Versuche oder Quellenrecherchen erfinden, wenn der aktuelle gebundene Inhalt keinen konkreten Anlass liefert. Ein echter Fehler bleibt `revise`, `split_review` oder `block` und wird nicht wegen des Abschlussziels überstimmt.

### Tatsächlich nötige Reviewer-Ausgabe

| Artefakt | Erforderlicher Inhalt |
| --- | --- |
| Native Records | Genau eine JSONL-Zeile pro zugeteiltem Ziel, in Batch-Reihenfolge; alle aktuellen Bindungen unverändert übernehmen. Eigene Entscheidung `keep`/`revise`/`split_review`/`block`, eigene konkrete Begründung und sechs zielbezogene DE/EN-Felder: wesentliches Verständnis, selbständig beobachtbare Leistung und sinnvoll veränderter Transfer. |
| Konstante Recordfelder | `schemaVersion:1`, vorhandene Record-Schema-URL, `evidenceProfileContract:positive-understanding-evidence-v2`, `recordStatus:candidate`, `reviewAuthority:ai_candidate`. Empfehlung `none` nur bei tatsächlich vollständigem passendem aktuellem Profil, sonst `create`/`revise`. |
| Bindungsfelder im Record | Eindeutige `recordId`, tatsächliche `runId`, `campaignId`, `roundId`; `bundleFingerprint`, `bookDigest`, `goalId`, `goalFingerprint`, `pageFingerprint`; alle vier vollständigen `currentTitle*`/`currentDescription*`-Texte aus dem aktuellen Input. Kein selbst erfundener Kontext-Fingerprint als zusätzliches Recordfeld. |
| Nur bei `revise` | Genau eine vollständige DE- und semantisch gleiche EN-Ersatzbeschreibung. Bei den anderen Entscheidungen beide Vorschlagsfelder weglassen. Eine richtige Sprachhälfte bei reiner Übersetzungsänderung erhalten. |
| Native Run-Datei | Vorhandene Run-Schema-URL, `schemaVersion:1`, passende echte `role` wie `subject_reviewer`, tatsächliche `provider`/`model`, `promptFamilyId`, `generationParametersFingerprint`, `toolchainVersion`; echte `startedAt`/`completedAt`, eigene globale `runId`, tatsächliche `campaignId`, `roundId`, `batchId`, `independenceGroupId`, exakte `goalIds`; aktuelle Bundle-/Buch-/Prompt-/Kriterien-/Batch-Fingerprints; `blindToOtherRuns:true`, `status:completed`, `outputDigest` der tatsächlich geschriebenen Records. Keine erfundenen geheimen Parameter/Modellversionen. |
| `inputArtifacts` im Run | Gebundener `review_prompt`, `review_criteria`, `description_review_batch_input_jsonl` und die tatsächlich gelesenen gebundenen Inhaltsartefakte mit ihren vorhandenen Digests. Der Validator akzeptiert unter anderem `review_input_json`, `review_input_jsonl`, `review_markdown`, `book_model`, `book_html`, `book_pdf`; mindestens ein Inhaltsartefakt ist nötig. |
| Separater Reviewer-Receipt | `reviewerId`, `reviewMode:stock_blind_final_input_first_pass`, `finalInputActuallyRead:true`, `peerResultsReadBeforeOwnSeal:false` plus exakte Rohpins von `nativeRun` und `nativeRecords`. Diese Adapterfelder gehören **nicht** zusätzlich ins geschlossene native Run-/Record-Schema. |

Die Ergebnisse je Runde heißen exakt `results/<campaignBatchId>.run.json` und `results/<campaignBatchId>.records.jsonl`; der Batch-Input liegt unter `batches/<campaignBatchId>.input.jsonl`. Die IDs aus der tatsächlichen Kampagne übernehmen. Keine Receipt-, README- oder Hilfsdateien in `results/` legen: der native Loader weist zusätzliche Dateien zurück. Receipts/Seals außerhalb dieses strikten Verzeichnisses ablegen und erst danach Peer-Ergebnisse öffnen.

Zwei unterschiedliche Revieweridentitäten sowie Kampagnen-, Runden-, Unabhängigkeits-, Run- und Record-IDs sind nötig. Unterschiedliche Provider/Modelle sind im vorhandenen Stock-`report_only`-Pfad **keine zusätzliche Pflicht**; tatsächliche Unabhängigkeit bleibt nötig. Die vorhandene stärkere Diversity-Option nicht als bereits erfüllt behaupten.

## 4. Einmal validieren, tatsächlich synthetisieren, nur nötige Besitzer ergänzen

Nach beiden eigenen Seals die zwei tatsächlichen Receipts pro Gruppe im neuen Plan pinnen. Unterschiedliche Formulierungen der sechs Verständnisfelder nicht künstlich angleichen: Root beurteilt echte Übereinstimmung/Differenzen und wählt eine tatsächlich zulässige Evidenzrunde.

```bash
node --import ./app/node_modules/tsx/dist/loader.mjs "$NATIVE_D_ADAPTER" --final-plan "$NATIVE_D_PLAN" --phase validate-rounds --execute
```

Danach verfasst Root die tatsächliche Synthesis-Authoring-Datei: `schemaVersion`, `manifestId`, `synthesizedBy`, je Ziel `goalId`, `evidenceRound:first|second`, konkrete deutsche/englische Begründung und gegebenenfalls `revisionDissent` beziehungsweise echte offene Deferrals. Keine generische Keep-Matrix aus alten Hashes. Alte unveränderte Fachbefunde ausdrücklich als fortgeführte Evidenz erhalten, aktuelle Aussagen und echten Dissens sauber zuordnen.

Die neue Authoring-Datei im Plan pinnen; dann:

```bash
node --import ./app/node_modules/tsx/dist/loader.mjs "$NATIVE_D_ADAPTER" --final-plan "$NATIVE_D_PLAN" --phase finalize --execute
node --import ./app/node_modules/tsx/dist/loader.mjs "$NATIVE_D_ADAPTER" --final-plan "$NATIVE_D_PLAN" --phase ownership-plan --execute
```

`finalize` materialisiert nach tatsächlicher Prüfung Synthesemanifest, Resolutionen und geprüfte Standalone-Indizes. `ownership-plan` erzeugt nur den additiven Vorschlag. Root registriert die tatsächlich validierten neuen Indizes und ergänzt Supersessions vom **tatsächlichen derzeitigen terminalen Besitzer**. Gültige unveränderte Besitzer, alte Indizes, Originalrecords, Withdrawals, Retirements und historische Ketten erhalten. AI-Kandidaten und technische native Vollständigkeit bleiben von menschlicher Freigabe oder Unterrichtserprobung getrennt.

## Gelesene maßgebliche Dateien

- `.../D-final-native-adapter/native-d-final-context-adapter.mjs` und der versiegelte `chemie-current450-final-native-input-prerequisites-technical-20261018-v1/measure-and-generate-final-native-inputs.ts`;
- `app/scripts/materializeGoalDescriptionRolloutBatch.ts`, `createGoalDescriptionReviewCampaign.ts`, `validateGoalDescriptionReviewCampaign.ts`, `validateGoalDescriptionReviewCampaignResults.ts`, `validateGoalDescriptionReviewDualRound.ts`, `validateGoalEvidenceFindings.ts`, `exportGoalBookReviewBundle.ts` und `materializeGoalDescriptionRolloutSynthesisManifest.ts`;
- gebundener allgemeiner v2-Prompt, Chemiekriterien v1 sowie geschlossene Record-, Campaign-, Run- und Syntheseschemata.

Es wurde kein Helperfehler im Releaseguard festgestellt. Die hier dokumentierte historische-Blindheitsgrenze ist eine tatsächliche Vorgabe des vorhandenen Prompts/Adapters, keine neue zusätzliche Freigabeanforderung.
