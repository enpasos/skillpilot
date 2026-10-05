# B010: sieben aktuelle Source-/D-Autorenkandidaten

Status: **candidate / ai_candidate**, informierte Autorenrevision. Vorhandene B010-Befunde waren bekannt; dies ist keine unabhängige Zweitprüfung, keine Book-D2-Adjudikation und keine menschliche Freigabe. Es wurden keine P-Inhalte gelesen, Profile erstellt, Bilder generiert oder operativen Dateien geändert.

Die Scope-Korrektur ist maßgeblich: **b5086548-169e-5d63-a14a-dabf631fa013** und **d726e00e-1f87-5ba5-8c79-76ad4022365e** gehören bereits zu den aktuellen 79 vollständigen Chemiezielen. Sie wurden ausgeschlossen. Die Baseline bleibt **79 / 376**, strenge zusätzliche Closure dieses Kandidaten **0**. Der Baseline-Report hat SHA256 `2fee25d6848721fca5d5afcabb17a9c01070ca51e7adb41c2721047b804e5c3f`.

## Eigene Entscheidungen

| Aktuelle Ziel-ID | Source-/D-Autorenentscheidung | Konkrete Grenze |
| --- | --- | --- |
| 72236f2c-771e-4ab6-933a-e549ee49d15b | split_review | Rutherford-Inferenz und Teilchenzuordnung sind unabhängig beherrschbar. Alte Provenienz fehlt aktuell; zusätzliche als exact angehängte Atom-/Isotop-Zellen bleiben ungelöst. |
| 950c73c6-4ed1-488a-9267-1142e95e0055 | revise | Modellierung, Koordinationszahl und mehrere typische Gittereigenschaften erhalten; Provenienz neu binden, V-HOLD. |
| e0e201bd-a1fd-5985-ab08-fd24c8655f3d | split_review | Elementare Metalle und ihre Verbindungen stoffgenau erhalten; keine Verwendungsroutine darf verloren gehen. |
| 16a80de2-b5e0-5467-a9b3-5860730d7d8b | revise | Metall/Wasser und einfaches Oxid/Wasser über Produkte und gemeinsame alkalische Lösung vergleichen. |
| 58486300-3f84-5aa1-9ed4-66186af62669 | revise | Eigenschaften und Verwendungen elementarer Halogene/Verbindungen stoffgenau begründen. |
| 414489cb-453e-5de4-ab0f-0fc01175e522 | revise | SO2-Aufnahme, Oxidation zu Sulfat und Gipsbildung am gegebenen vereinfachten Schema erklären. |
| 1f5ee84f-245a-5a1e-a260-f960f26523e9 | revise | Ausgewählte mineralische Dünger als Nährstoffionenquellen; bedingten Nutzen/Risiko-Bezug mit gegebenem Bedarf, Menge und Transport begründen. |

Die fünf vollständigen DE/EN-Revisionen und die zwei ID-null Companion-Optionen stehen in `seven-description-deltas-and-split-templates.json`; sieben gebundene Records enthalten die eigene Verständnis-/Performanz-/Transferkette und empfehlen `positive-understanding-evidence-v2 / create`. Diese Kette beschreibt erwartbare Nachweise, **keine beobachtete Lernleistung**.

## Tatsächlich geprüfte Bindungen

- Aktueller eigener BookModel, HTML und PDF aus derselben Quelle; tatsächliche Zielseiten auf physischen PDF-Seiten **3–9** sowie beide Vorspannseiten gelesen. Frischer Bundle `sha256:aba42323a068d6ee3648ec05edf1b6483b05f5a70a1047e8eaf6d5896cdb7d7d`, Model-Digest `sha256:5bdb40efec716f7431122302c524e222a4f4156a580a9cf01e3bba6691e5bfd9`.
- Native aktuelle Goal-/Page-/Context-Fingerprints und DE/EN exakt gebunden. Die aktuellen sieben Goal-Texte/Fingerprints sind gegenüber B010 unverändert; die neue eigene Seiten-/View-Bindung ersetzt keinen akzeptierten historischen D2-Befund. Alle sieben inneren Book-D2-Status bleiben offen.
- Tatsächliche HE-Original-PDF-Seiten **19, 22, 25, 26** (gedruckt **18, 21, 24, 25**) gelesen; aktuelle amtliche BY8NTG/BY9NTG-HTML-Seiten und konkrete Extraction-/Mapping-Zellen geprüft. `source-clause-bindings-and-adoption-holds.json` trennt kanonisches Landscape und HE/BY-Quellenlandscapes sowie clause coverage, Operator, Jahrgang und Kandidaten-Deltas.
- Sechs bestehende Original-JPG und tatsächliche unveränderte Bilder bei **360/680 CSS-Pixeln** gelesen. Canonical-/Frontend-/Backend-Dateien sind bytegleich und QA-digestgleich. Eigener Befund KEEP innerhalb der genannten Schema-Grenzen; zukünftige Split-Bindung ist offen. Keine neue menschliche V-Freigabe. Für 950 fehlt das Gitterbild tatsächlich: **V-HOLD**. Beim Düngerbild bleibt kleine zentrale Schrift bei 360 eine dokumentierte Lesbarkeitsgrenze; die Bewertung muss die Transportinformationen bereitstellen.
- Historische native A-Prüfung der sieben aktuellen Fingerprints und native M-Prüfung der sechs bisherigen `no_memory_needed`-Einträge PASS. Das ist technische Bindungswiederverwendung; die eigene wissenschaftliche A-Entscheidung weicht bei zwei Zielen begründet ab. Die einzelne bestehende Partikel-Karte `chem_basics_005` im Deck `de_gymnasium_chemistry_basics_seki` bleibt erforderlich und unverändert; tatsächliche drei Runtime-Compositionviews zeigen das Memory-Ziel. Der eigene Buchausschnitt ist keine neue Runtime-Sicht und kein vollständiges Shared-Deck-Gate.

## Verbleibende gezielte HOLDs

1. Für 722/950 aktuelle Provenienz und Mapping-Zellen versioniert binden. Bei 722 keine Vollabdeckung von Atommasse, Isotopen, Rein-/Mischelementen, Modellgrenzen oder Ionentheorie durch den kombinierten Text behaupten. Diese vorhandenen Source-Zellen und ihre Geschichte bleiben erhalten.
2. Bei 950 weder HE-Koordinationszahl noch BY-Modellkonstruktion auf ein bloßes Lesen gegebener korrekter Modelle verkürzen. Die vorhandenen HE9-Reaktions-/HCl-Zuordnungen werden durch Gitterverständnis allein nicht neu vollständig bestätigt. V bleibt deferred.
3. Die HE9-Routen e0/16/584 benötigen konkrete passende Voraussetzungen/Platzierung: derzeit Ionenbildung bzw. geerbtes vollständiges Atombau-/Bindungscluster aus dem regulären HE10-Kontext. Eine fachlich abgestimmte frühere Einführung ist laut Quelle möglich, im aktuellen allgemeinen Kontext aber nicht konkret nachgewiesen. Kein blanket Parent-Delta; ein solches würde auch die beiden bereits vollständigen Geschwister betreffen.
4. Für die fünf besonderen Elementgruppen-/Anwendungsziele fehlt ein konkreter aktueller BY-Atlas-Witness. Dies ist ein begrenzter Bindungs-HOLD, kein globales Löschen der kanonischen Ziele oder ihrer anderen Länderzuordnungen.
5. Die zwei Splits sind Optionen mit **ID null**. Bestehende Teile, Sourcegruppen und Mapping-Denominator werden nicht entfernt. Keine neue ID oder +2-Denominator-Adoption wurde autorisiert. Eine spätere begründete additive Route läge hypothetisch bei 378; aktuell bleibt 376.
6. Aktuelle unabhängige Source-/D/A-Befunde für die konkrete Revision, passende frische Buchbindungen und später P fehlen. Eigene Freigabe zählt dafür nicht. Die gesondert offene 11bea-Strukturfrage wird als vorhandene Voraussetzung des Gipsziels sichtbar gehalten und hier nicht neu geprüft.

## Validatoren und Wiederholung

`schema-validation.receipt.json`: sieben Records, Run, V3-Input und native Kampagne schema-valid. `native-author-source-d-validation.receipt.json`: nativer `validateGoalDescriptionReviewBatch` **PASS, sieben Records, null Fehler**, aktuelle Bundle-/Model-/Input-/Goal-/Page-/Text-/Output-Bindungen geprüft.

Das ist eine **informierte Synthese von bestehenden Befunden und aktueller Autorenprüfung**, keine blinde Reviewrunde. Run- und Kampagnenrolle `synthesizer` sowie `blindToOtherRuns=false` bilden diese tatsächlich durchgeführte Arbeit ab. Die erste native Probe mit `candidate_author` wurde wegen dessen Blindheitsregel zurückgewiesen; die unveränderte Fehlreceipt bleibt in `native-author-initial-policy-failure.receipt.json`. Der spätere PASS behauptet keine unabhängige D2-Freigabe. Ein anfänglicher V1-Schemaprobe des V3-Inputs wurde mit dem tatsächlich passenden V3-Vertrag korrigiert; keine Inputdaten wurden für einen PASS entfernt.

Reproduzierbare begrenzte Autoren- und Bindungsprüfung ab Repository-Wurzel:

```bash
python3 curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-seven-current-source-description-candidate-v1/author-seven-candidate.py
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-seven-current-source-description-candidate-v1/validate-author-native.ts
python3 curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-seven-current-source-description-candidate-v1/finalize-source-d-diagnostics.py
```

Die Skripte schreiben ausschließlich diesen Kandidatenordner; eine spätere Wiederholung soll in einer **neuen Version** erfolgen und diesen Freeze nicht überschreiben. Modelle/Bilder/Quellen- und Memory-Receipts sind hier eingefrorene aktuelle Inputs, keine aktive Registrierungsroute.

## Begrenzte Integrationsreihenfolge

Zuerst die konkreten Source-/Stufen-/ID-Fragen entscheiden und die drei Pflichtbreiten erhalten (Rutherford/Teilchen; Metalle/Verbindungen; Gittermodell/Koordination/Eigenschaften). Danach für den tatsächlich gewählten aktuellen Text-/Bild-/View-Stand unabhängige D/A-Reviews und aktuelle Buchbindungen vorbereiten; bestehende passende Bilder und Memory-Karte gezielt wiederverwenden. P darf erst nach diesen eigenen eingefrorenen Source-/D-Befunden gesondert folgen und bleibt ein AI-Kandidat. Erst eine autorisierte native Integration kann Registry/Canonical/Views/QA ändern und neue strenge Closure zählen. Kein historischer stale KEEP wird restauriert, kein bereits vollständiges Geschwisterziel pauschal neu geprüft.

`frozen-source-d.receipt.json` bindet alle eigenen vor dem Freeze vorhandenen Dateien mit SHA256; `frozen-source-d.receipt.sha256` bindet die Receipt selbst. Historische Ordner und aktive Dateien wurden unverändert erhalten.
