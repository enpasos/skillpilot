# Spätere tatsächliche Root-Phasen

Erst nach den zwei tatsächlichen neuen nativen Einziel-Reviews: Root erstellt additiv `FINAL-INPUTS.actual.root-synthesis.json` aus dem unveränderten staged-Plan. In batches[0] werden exakt zwei tatsächliche finalReviewerReceipts und die tatsächliche synthesisAuthoring-Datei gepinnt. Keine V-Reviewer als blinde D-Reviewer relabeln, keine angenommenen KEEP-Daten eintragen.

Diese Kommandos sind vorbereitet und wurden nicht ausgeführt:

```sh
node --import ./app/node_modules/tsx/dist/loader.mjs curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-normal-integration-20261017-v1/D-final-native-adapter/native-d-final-context-adapter.mjs --final-plan curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-normal-integration-20261017-v1/D-corrected450-64b-caption-final-native/FINAL-INPUTS.actual.root-synthesis.json --phase validate-rounds --execute

node --import ./app/node_modules/tsx/dist/loader.mjs curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-normal-integration-20261017-v1/D-final-native-adapter/native-d-final-context-adapter.mjs --final-plan curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-normal-integration-20261017-v1/D-corrected450-64b-caption-final-native/FINAL-INPUTS.actual.root-synthesis.json --phase finalize --execute

node --import ./app/node_modules/tsx/dist/loader.mjs curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-normal-integration-20261017-v1/D-final-native-adapter/native-d-final-context-adapter.mjs --final-plan curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-normal-integration-20261017-v1/D-corrected450-64b-caption-final-native/FINAL-INPUTS.actual.root-synthesis.json --phase ownership-plan --execute
```

Ownership-plan schreibt nur einen tatsächlichen Vorschlag. Normale Registrierung ist damit nicht erfolgt. Dafür danach separat tatsächlichen Plan/Index/Ownership-SHA an den begrenzten D-only-Registrierungsweg binden und Root-Freigabe abwarten. Die neue aktuelle Bildseite benötigt ihren echten D1-Nachweis; Source-Audit ersetzt diesen nicht.
