<!-- SPDX-License-Identifier: Apache-2.0 -->
# Basis2 und Word576: vorbereiteter technischer D-Adopter

Der Helper ist vorbereitet und **nicht ausgeführt**. Basis2 bleibt in diesem
Commitcheckpoint inaktiv, auch wenn der unabhängige B-Erstseal später PASS meldet.
Der aktive Stand 244/392 und alle bisherigen menschlichen Felder bleiben erhalten.
Es entstehen durch diese Vorbereitung keine Reviewerrecords, Kampagnen,
Resolutionen, Freigaben oder aktiven Änderungen.

## Getrennte echte Nativegruppen

| Gruppe | Tatsächliche Autorenbasis | Vorgesehener eigener Index | Ziele |
| --- | --- | --- | --- |
| Neue Basis2 | `../biologie-stoffwechsel-two-basic-companions-complete-author-20261008-v2/native-two-primary-refined/` | `native-d-two-basic/resolution-index.json` | `0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38`, `32483d30-2162-50a5-a6cc-05b7f2467ab1` |
| Bestehender Word576-Kontext | `../biologie-stoffwechsel-two-basic-companions-complete-author-20261008-v2/existing-word-context/after/` | `native-d-existing576-context/resolution-index.json` | `576d59e2-397a-5654-b853-7c0c4870fbd3` |

Die unveränderten gewöhnlichen CampaignResults-, DualRound-, Synthesis- und
Resolution-APIs prüfen zwei echte Originalkampagnen je Gruppe. Die Kampagnen,
Inputs, Reviewerrecords und Run-Manifeste werden bytegenau übernommen; ihre IDs
werden nicht neu erzeugt. Eigene technische Gruppen-, Synthesis- und
Resolution-IDs sind die gewöhnlichen Integrationsartefakte. Es sind insgesamt
drei Resolutionen in zwei getrennten Standardindizes vorgesehen.

Die tatsächliche Grundlage ist `full394.actual-primary-refined.final-model.json`
und `canonical.shadow478.basic2-after-three-rasters.json` aus dem finalen neutralen
Autorenentry. Die Basisconfig wird ausschließlich aus
`actual-primary-refined-nine-duties-ten-ordinary-edges.final-author.json` →
`actualFinalBookConfig` übernommen. Die ältere nicht verfeinerte Buchconfig wird
nicht verwendet.

Der Helper prüft die ganzen Native-Seitenkörper gegen full394. Die regulären
Subset-Seitennummern und die Externalisierung von Kontextlinks ändern deren
Seitenfingerprints; die echten geprüften Native-Fingerprints bleiben an ihre
Originalkampagnen gebunden. Prerequisites und Reverse-Prerequisites müssen nach
Normalisierung von internen/externen Links dieselben Ziel-IDs und Titel tragen.

## Voraussetzung für eine spätere ausdrückliche Ausführung

Root erstellt und bestätigt
`pending/original-seal-verification.actual.json` erst nach dem tatsächlichen
unabhängigen B-Erstseal und Prüfung aller originalen Source-, V-, D/P- und
Word-Kontext-Seals. Der Helper erstellt diese Bestätigung nicht und sucht keine
Peerergebnisse selbst. Zusätzlich zur Struktur des bisherigen Native3-Receipts
werden folgende Felder verlangt:

```json
{
  "allOriginalSealsConfirmedByRoot": true,
  "bothActualIndependentNativeFirstSealsVerified": true,
  "unresolvedAdoptionBlockingFindings": [],
  "originalFourOperatorHoldsRetained": true,
  "resultsDirectories": ["NEW2_A", "NEW2_B", "WORD576_A", "WORD576_B"],
  "originalMutableBeforeInputsPreserved": [
    {
      "originalPath": "ORIGINAL_REPOSITORY_PATH",
      "originalBinding": {"path": "ORIGINAL_REPOSITORY_PATH", "sha256": "ORIGINAL_SHA256", "bytes": 1},
      "immutableHistoricalCopy": {"path": "ACTUAL_IMMUTABLE_COPY_PATH", "sha256": "ORIGINAL_SHA256", "bytes": 1}
    }
  ],
  "seals": {
    "a": {"seal": {"path": "ACTUAL_A_SEAL", "sha256": "ACTUAL_SHA256", "bytes": 1}, "entry": {"path": "ACTUAL_A_ENTRY", "sha256": "ACTUAL_SHA256", "bytes": 1}, "verifiedOriginalFiles": []},
    "b": {"seal": {"path": "ACTUAL_B_SEAL", "sha256": "ACTUAL_SHA256", "bytes": 1}, "entry": {"path": "ACTUAL_B_ENTRY", "sha256": "ACTUAL_SHA256", "bytes": 1}, "verifiedOriginalFiles": []}
  },
  "activeWrites": 0,
  "newScientificReviewByIntegrator": false,
  "humanApproval": false
}
```

Dieses Beispiel enthält Platzhalter und ist kein ausführbares Readiness-Receipt.
Jede reale Seal-/Entry-/Dateibindung muss ihre tatsächlichen Bytes und SHA256
tragen. `verifiedOriginalFiles` muss die unveränderten echten Record- und
Run-Dateien aller vier ResultsDirs umfassen. Die aufbewahrten historischen
Before-Inputs werden gegen ihre ursprünglichen Bindungen geprüft. Die vier
Originaloperator-HOLDs bleiben offen; neue unbehandelte Adoptionsblocker dürfen
nicht als KEEP verschluckt werden.

Die beiden bekannten A-Verzeichnisse sind:

- `../biologie-stoffwechsel-two-basic-source-native-independent-a-20261008-v2/results-basis2/`
- `../biologie-stoffwechsel-two-basic-source-native-independent-a-20261008-v2/results-context576/`

Ein späterer Aufruf erfolgt vom Repositoryroot; die vier Argumente sind echte
repositoryrelative oder absolute ResultsDirs in dieser Reihenfolge:

```bash
app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-stoffwechsel-two-basic-reviewed-integration-preparation-root-20261008-v1/prepare-genuine-two-native-D-and-word-context-existing-contracts.technical.mts \
  NEW2_A NEW2_B WORD576_A WORD576_B
```

Ein fünftes Argument kann ein anderes echtes Root-Readiness-Receipt angeben.
Während dieses Checkpoints wird dieser Aufruf nicht ausgeführt.

## Geschützte Grenzen

Beide vollständigen Dual-Rounds müssen echte KEEP/KEEP-Records ergeben.
Campaign-, Run-, Record-, Kontext- oder Synthesisfehler brechen vor jeglichem
Adoptionsoutput ab. Auch alle drei Resolutionen und beide Indizes werden vor
dem Schreiben mit den normalen Verträgen geprüft. Bereits vorhandene Outputs
dürfen nur identische Bytes besitzen; vorhandene fertige Gruppen werden nicht
überschrieben.

Alle möglichen Outputs bleiben in diesem inaktiven Integrationsverzeichnis.
Der bestehende Root-Guard
`pending/current244-live-preservation-and-two-new-guard.actual.json` bleibt
unverändert. Der historische Word576-D-Index und sein gültiger ganzer P werden
nicht neu geschrieben. Eine künftige Word-Kontext-Supersession bleibt eine
ausdrückliche Registry-Aufgabe für Root. QA/AM/kinds/Registry/Sourcemapping,
aktive Adoption und zentrale QS-Zählung werden vom Helper nicht ausgeführt.
E1/G1 und AI-Kandidaten sind keine menschliche Freigabe; Quellenrollen bleiben
partiell. Eine technische D-Resolution behauptet keine Whole-Source-Union oder
neue zentrale M7-Abschlüsse.
