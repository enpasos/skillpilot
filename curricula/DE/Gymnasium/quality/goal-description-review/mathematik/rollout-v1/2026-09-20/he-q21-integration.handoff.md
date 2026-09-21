# B049 HE Q2.1 — gezielter Integrations-Handoff

Stand: 20. September 2026. Autor: `math_b049_scope_repair` (KI).
Dies ergänzt die zeitlich davor erstellte `he-q21-scope-repair.receipt.md`.
Keine menschliche Freigabe, kein vollständiger QS-Lauf, keine Veröffentlichung.

Nachfolgende begrenzte Integration am selben Tag: Die beiden nativen
Cluster-Selektoren und fünf vorhandenen Semantic-Kind-Bindungen wurden inzwischen
gezielt integriert und geprüft; siehe
`he-q21-native-gate-and-kind-integration.receipt.json`. Die unten als offen
beschriebene D/P-/Assessment-Freigabearbeit bleibt davon getrennt.

## Erledigt: Klassifikation der vier neuen Knoten

In `curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json`
sind ausschließlich vier Entscheidungen ergänzt und ihre drei Zähler angepasst:

| Ziel-ID | Semantic Kind |
|---|---|
| `967d1863-1b9b-4798-8a35-ae4e9760e322` | `curricularArea` |
| `bbb340ed-1009-4966-ae96-bfea4437505a` | `practiceAssessment` |
| `46bb8422-a822-46e1-8bcc-8b6475994b3a` | `practiceAssessment` |
| `1429363f-628f-4f42-80e5-8a9a935147cc` | `practiceAssessment` |

Die bestehenden Schemawerte `reviewed-current-pilot-curricular-area` bzw.
`reviewed-current-pilot-practice-assessment` klassifizieren die Knotenart;
`decisionStatus: authoritative` ist **keine Aufgaben- oder menschliche Freigabe**.
Alle drei `examData.reviewStatus` bleiben unverändert `needs_review`.
Zähler: `curricularArea=233`, `practiceAssessment=137`, `total=1187`;
`curricularAtomic=797` bleibt unverändert.

Gezielt bestanden: AJV-Validierung genau dieser vier Entscheidungen gegen
`$defs.semanticKindDecision` des aktuellen Ontologieschemas, Vergleich mit
`fingerprintSemanticKindSourceGoal`, Eindeutigkeit der vier IDs, drei erhaltene
Kandidatenstatus und Konsistenz der deklarativen Ledgerzähler. Keine anderen
Semantikentscheidungen oder Inhaltsdateien wurden in diesem Integrationsschritt
geändert.

## Native Assessment-QS: Einbindung vor Freigabe

**Konkreter noch offener Einbindungspunkt:** Der neue Cluster `967d1863…`
fehlt in `CANONICAL_GYM_MATH_SEK2_PRACTICE_CLUSTER_IDS` in beiden Dateien:

- `app/scripts/generateCurriculumQualityStatus.ts`
- `app/scripts/validateGraph.ts`

`evaluateRouteProfile` im Statusgenerator wählt terminale Aufgaben ausdrücklich
über die unmittelbaren atomaren Kinder dieser Cluster aus. Daher sind die neuen
Aufgaben vor Abschluss der Integration in beide nativen Selektoren aufzunehmen.
Ein grünes Ergebnis ohne ihre Einbeziehung wäre kein Assessment-Nachweis.

Die vorhandene Pipeline ist inhaltlich und technisch zweistufig:

1. Aufgaben, vollständige Lösung und Rubrik fachlich gegen ihre konkreten
   `coveredGoalIds` prüfen, einschließlich gemeinsamer GK-Quellenabdeckung,
   echter Graphenhandlung und punktgenauer Bewertung. Den Autorcheck durch
   einen unabhängigen, informierten KI-Gegencheck ergänzen. Beide Prüfungen an
   die tatsächlich geprüften Inhalte binden und in **neuen** Belegen festhalten.
   Kein vorgeschriebener menschlicher Schritt wird als maschinell erledigt
   ausgegeben; M7 ist unabhängig von der späteren menschlichen Erprobung.
2. Erst nach positiver Prüfung und Einbindung die drei konkreten Kandidaten
   explizit auf `released` setzen, eine wahrheitsgemäße KI-Prüfnotiz hinterlegen
   und **danach** ihre nativen Semantic-Kind-Fingerprints erneut ableiten:
   Der Vertrag bindet das gesamte `examData`, also auch Status und Prüfnotiz.
   Unabhängig davon müssen native Routen-/Assessment-Gates bestehen.

Die vorhandenen CQR-Funktionen prüfen:

- `CQR-201`: `examData` vorhanden.
- `CQR-202`: nicht blockierender Status, konkrete Aufgabe/Lösung, vollständige
  positive Punkte-/Bestehenswerte und Rubrik; keine Platzhalterprosa.
- `CQR-203`: `reviewStatus=released` sowie nichtleere `coveredGoalIds`,
  `coveredStrands` und `demandLevels`.
- `CQR-101/102/103` und ggf. `104`: effektive/direkte Routen,
  Cluster-Voraussetzungen und konfigurierte Composition-Sichtbarkeit.

Diese Strukturprüfungen beweisen allein keine fachlich richtige Lösung.
`needs_review` muss bei tatsächlicher Einbindung erwartungsgemäß an
`CQR-202/203` sichtbar bleiben, bis die Aufgabenprüfung erledigt ist.

Read-only geprüftes Prozessbeispiel: Physik
`quality/goal-description-review/physik/rollout-v1/2026-09-08/physics100-four-goal-completion-v1/`
unter `curricula/DE/Gymnasium/`, insbesondere `release-assessments.mjs`,
`assessment-release-receipt-a-20260908.json` und
`informed-assessment-counterreview-b-20260908.json`.
Das historische Script bindet genaue IDs/Inhaltshashes und verweigert Replay.
**Nicht für diesen Batch ausführen.** Es wurde kein allgemeiner nativer
„automatisch geprüft → released“-Befehl gefunden; Freigabe ist eine belegte
Authoring-Entscheidung, nicht das Nebenprodukt eines Validators.

### Befehle im Integrationslauf

Die ersten beiden Befehle sind kurze bestehende Regressionen; die weiteren
gehören einmal an den stabilen integrierten Zwischenstand. Sie wurden in diesem
Handoff-Schritt **nicht** erneut bzw. vollständig ausgeführt.

```bash
npm --prefix app run test:composition-projection-roles
app/node_modules/.bin/tsx app/scripts/testHessenMathQ21Scope.ts
npm --prefix app run validate:graph
npm --prefix app run quality:curriculum-status
npm --prefix app run check:curriculum-maturity-floors
npm --prefix app run quality:curriculum-status:check
```

Der Statusgenerator bietet aktuell keinen Assessment-/Ziel-ID-Subset-Schalter;
`--check` prüft den generierten Status gegen die Dateien, nicht nur drei Aufgaben.
Keine Maturity-Untergrenze senken. Bestehende Sek-II-Voraussetzungslücken bleiben
von dieser begrenzten Reparatur getrennt.

## Vier geänderte `requires`-Ziele: exakte Bindungsfolgen

Read-only verglichen mit `git show HEAD:<kanonischer Pfad>` und den aktuell
registrierten D-/P-Konfigurationen, ohne historischen Nachweis umzuschreiben:

| Ziel-ID | Aktuell zentral registriertes D/P-Paket | Gezielte Folge |
|---|---|---|
| `993a14e8-60f0-5764-9340-b2447a5fa84b` | kein D-Resolution-/P-Config-Eintrag | Offenen aktuellen Kontext einschließlich neuer Kantenlage fachlich bearbeiten; keine alte Freigabe behaupten. |
| `c0e34fa8-fde5-5a4e-9b84-c5d5db719b58` | kein D-Resolution-/P-Config-Eintrag | Wie oben. |
| `972cc7e8-be9c-444c-ba45-98e817b3cf14` | B043 `current-keep9-v1` | Bestehende D-Seiten-/Kontextbindung neu prüfen; P-Eingabebindung ist durch die Kantenänderung veraltet. |
| `91e2f564-3bc8-4924-af85-2a3fa84c1471` | B045 `current-keep7-v1` | D-Seiten-/Kontextbindung neu prüfen; P-Eingabebindung ist veraltet und passte bereits zum HEAD-Ziel mit heutigen Bildbytes nicht mehr. Nicht ausschließlich dieser Reparatur zurechnen. |

Native Feststellungen:

- **Semantic Kind:** `fingerprintSemanticKindSourceGoal` bindet `/requires`.
  Alle vier alten Entscheidungen sind deshalb jetzt veraltet. Zusätzlich ist
  der Wurzel-Eintrag `c01b1ce9-a667-4a46-b251-ec33ae602b15` durch sein erweitertes
  `/contains` veraltet. Diese fünf vorhandenen Fingerprints wurden in diesem
  eng begrenzten Auftrag noch **nicht** geändert.
- **D:** `goal-evidence-v1`-Zielfingerprints sind bei allen vier Zielen gleich
  geblieben. Die GoalBook-Seiten enthalten jedoch Vor-/Rückverweise, und
  `fingerprintGoalDescriptionReviewContext` bindet den ganzen aktuellen Kontext.
  Zusätzlich zu den vier Zielen die geänderten Rückverweise von
  `3bf1ce9e-f4d3-502e-9d6e-94f7b7f697d4` sowie die durch neue Assessments
  hinzugekommenen externen Rückverweise der zehn Inhaltsziele berücksichtigen.
  Geänderte View-/Anwendbarkeits- und Seitenbindungen gezielt differenzieren;
  historische unabhängige Reviews nicht erneut ausführen, wo weiterhin gültig.
- **P:** `fingerprintPositiveGoalEvidenceReviewInput` bindet sortierte
  `requires`, `contains`, Beispiele und Bildressourcen. Bei B043 passt der alte
  Datensatz zum HEAD-Eingang, aber nicht mehr zum aktuellen Eingang. B043/B045
  behalten `status=needs_human_review`, `reviewAuthority=ai_candidate`; eine
  aktualisierte maschinelle Prüfung ist keine menschliche Freigabe. Neue
  Belege/überlappungsfreie aktuelle Registry-Zuordnung nach fachlichem Check,
  kein bloßes Überschreiben historischer Hashes.
- **A/M:** Die jeweiligen Fingerprint-Payloads in
  `semanticAtomicityReview.ts` und `memoryCardReview.ts` enthalten keine
  `requires`. Titel, Beschreibungen und relevante Metadaten sind unverändert;
  die vier vorhandenen Entscheidungen bleiben `atomic` bzw.
  `no_memory_needed`. Diese Kantenkorrektur verlangt keinen erneuten Vollreview.
- **V:** Die vier Resource-Link-Listen sind identisch zu HEAD; die QA-Zeilen
  weisen weiterhin `aiApproved=yes` mit demselben Approval-/Asset-Digest aus,
  `humanApproved=no`. Unveränderte Bilder nicht neu generieren oder freigeben;
  die abhängige P-/Seitenbindung wird separat behandelt.

Aktuelle P-Pfade liegen unter `curricula/DE/Gymnasium/quality/goal-evidence/`:

- `canonical-math-positive-understanding-evidence-rollout-v1-batch-043-current-keep9-v1.config.json`
- `canonical-math-positive-understanding-evidence-rollout-v1-batch-045-current-keep7-v1.config.json`

Native gezielte P-Prüfung nach Integration eines neuen, abgegrenzten Configs:

```bash
app/node_modules/.bin/tsx app/scripts/positiveGoalEvidenceReview.ts --mode=check --config=<neuer-abgegrenzter-config-pfad>
```

Die native D-Prüfung ist
`app/scripts/validateGoalDescriptionDualRoundResolution.ts`; sie erwartet
`--resolution`, `--dual-summary`, `--current-input`, `--landscape` sowie je
`--first/second-bundle`, `--first/second-input`, `--first/second-campaign`,
`--first/second-batches-dir`, `--first/second-results-dir`.
Nur aktuelle, nach dem fachlichen Kontextcheck belegte Bindungen einsetzen.

**Reststatus:** technische Klassifikation ergänzt; fachliche unabhängige
Assessment-Prüfung, native Gate-Einbindung, fünf vorhandene Semantic-Kind-
Bindungen und betroffene D/P-/Seitenkontexte bleiben Integrationsarbeit.
