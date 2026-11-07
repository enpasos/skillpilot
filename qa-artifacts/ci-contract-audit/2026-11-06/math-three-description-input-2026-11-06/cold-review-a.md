# Kalter unabhängiger D-Erstpass – Runde A

Starte einen neuen Agenten mit `fork_turns="none"`. Keine frühere Unterhaltung, andere Reviews, Synthesen, Diffs oder Anwendungspläne übernehmen. Dieser Auftrag enthält keine erwartete Entscheidung.

Lies ausschließlich die folgenden Eingaben:

- `qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-input-2026-11-06/packet/round-a/description-review-campaign.json`
- `qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-input-2026-11-06/packet/round-a/description-review-input.json`
- `qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-input-2026-11-06/packet/round-a/batches/mathematik-three-targets-20261106-v1-first-pass-a.batch-001.input.jsonl`
- Prompt, Fachkriterien und Recordschema im selben Rundeverzeichnis.
- `qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-input-2026-11-06/packet/bundle/book.pdf`, `book.html`, `book-model.json`, `review-input.json` und `manifest.json`.
- Die beiden JSON-Dateien in `qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-input-2026-11-06/material-context` und die dort exakt benannten, gehashten amtlichen Quelldokumente. Keine anderen Repositorydateien oder Verzeichnisse durchsuchen.

Prüfe die Eingabebindungen aus der Kampagne und den Kontextmanifesten. Lies alle drei vollständigen deutschen und englischen Ziele, die aktuellen Eltern/Voraussetzungen/Nachfolger, die vollständigen relevanten Quellpassagen und die dargestellten Abbildungen. Bewerte jeden Punkt der nativen Mathematikkriterien unabhängig. Wende den gebundenen Prompt unverändert an; `keep`, `revise`, `split_review` und `block` bleiben echte Optionen. Formuliere selbst die sechs zielbezogenen bilingualen Understanding-Evidence-Felder. Kein Quellen-, Scope- oder Effektivitätsnachweis darf erfunden werden.

`visualization.qaStatus` und `approvedForPublication` sind nur gebundene Asset-Materialprovenienz. Sie sind keine D-/P-Urteile und keine Autorität für deine Beschreibungseinschätzung. Dieser Lauf begründet keine neue V-Abnahme. Die native Eingabe enthält keine P-Profile oder D-Ergebnisse; leite daraus kein früheres Urteil ab. Die vorgegebenen semantischen Typen sind Scopekontext, keine Beschreibungsempfehlung.

Lies weder die andere Runde noch deren Ergebnisse. Teile vor dem abgeschlossenen eigenen Erstpass keine inhaltlichen Entscheidungen mit dem anderen Reviewer. Schreibe ausschließlich deine eigene echte Run-Metadatei und drei schemafähige Candidate-Records, in nativer Batchreihenfolge:

- `qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-input-2026-11-06/packet/round-a/results/mathematik-three-targets-20261106-v1-first-pass-a.batch-001.run.json`
- `qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-input-2026-11-06/packet/round-a/results/mathematik-three-targets-20261106-v1-first-pass-a.batch-001.records.jsonl`

Verwende wahrheitsgemäße tatsächliche Modell-/Provider-/Zeit-/Parameterangaben, den eigenen tatsächlichen Run und die exakten vorgegebenen Kampagnen-/Bundle-/Goal-/Page-Bindungen; keine kopierten oder erfundenen Runbehauptungen. `recordStatus=candidate`, `reviewAuthority=ai_candidate`; keine menschliche Freigabe. Falls eine erforderliche Laufangabe nicht belegbar ist, melde diese konkrete Grenze, statt sie zu erfinden. Prüfe danach mit dem bestehenden nativen Kampagnenvalidator. Antworte dem Koordinator nur mit Ergebnis-/Logpfaden, Hashes, Exitcode und dem Hinweis, ob dein Erstpass abgeschlossen ist. Keine Änderung der Eingaben, Quellen, QA-Ledger oder Policy.

Die Rundendateien `prompt.md`, `criteria.md` und `contracts/goal-description-review-record.schema.json` sind die genauen bindenden Anweisungsdateien. Lege bei einem frischen Checkout ausschließlich dein eigenes leeres Ergebnisverzeichnis an und validiere danach deine tatsächlichen Resultate mit diesem Befehl, jeweils vom Repositoryroot:

```bash
mkdir -p qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-input-2026-11-06/packet/round-a/results
./app/node_modules/.bin/tsx app/scripts/validateGoalDescriptionReviewCampaignResults.ts --bundle qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-input-2026-11-06/packet/round-a/review-bundle-manifest.json --input qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-input-2026-11-06/packet/round-a/description-review-input.json --campaign qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-input-2026-11-06/packet/round-a/description-review-campaign.json --batches-dir qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-input-2026-11-06/packet/round-a/batches --results-dir qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-input-2026-11-06/packet/round-a/results
```
