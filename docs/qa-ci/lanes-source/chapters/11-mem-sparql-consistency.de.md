## MEM-SPARQL-Konsistenzaudit {#sec:qal-mem-sparql}

Diese bewusst **nicht-blockierende** QA-Lane vergleicht Live-Daten des externen MEM/FWU-Lehrplan-Ontologie-Endpunkts (`https://sparql.mem.edufeed.org/sparql`) mit den persistierten `source-extraction`-Nachweisen in SkillPilot. Da die Länderabdeckung im externen Endpunkt noch unvollständig ist, dienen Abweichungen als strukturierte Triage-Signale und nicht als CI-Blocker; MEM ersetzt weder amtliche Quellenreferenzen noch `CQR-*`-, Atomizitäts-, Merkkarten- oder View-Validierungen.

### Maßgebliche Quellen, generierte Artefakte und Ausführung {#sec:qal-mem-artifacts}

- **Konfiguration & Ledger (Source of Truth):** `curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.config.json` und `canonical-math-poc.review.jsonl` (Generator: `app/scripts/generateMemSparqlConsistencyAudit.ts`).
- **Generierte Snapshots (nicht manuell editieren):** [mem-sparql-consistency-audit.md](repo:docs/qa-ci/status/mem-sparql-consistency-audit.md), `mem-sparql-consistency-audit.json`, [mem-sparql-consistency-review-issues.md](repo:docs/qa-ci/status/mem-sparql-consistency-review-issues.md) und `mem-sparql-consistency-review-issues.json`.

```bash
cd app
npm run quality:mem-sparql-consistency
npm run quality:mem-sparql-consistency -- \
  --endpoint=https://sparql.mem.edufeed.org/sparql
MEM_CFG=curricula/DE/Gymnasium/quality/mem-sparql-consistency
npm run quality:mem-sparql-consistency -- \
  --config="$MEM_CFG/canonical-math-poc.config.json"
```

Der Befehl endet auch bei offenen Triage-Punkten mit Exit-Code `0` und schlägt nur bei lokalen Skript- oder Konfigurationsfehlern fehl (Initialuntersuchung siehe [MEM-SPARQL-PoC vom 01.06.2026](repo:docs/qa-ci/archive/mem-sparql-consistency-poc-2026-06-01.md); operative Checkliste siehe @ref{sec:qal-mem-sparql-runbook}).

### Fingerprint-gebundenes Review-Ledger und Erweiterungskriterien {#sec:qal-mem-ledger}

Jeder Eintrag der JSON-Review-Queue trägt einen aus der aktuellen MEM-/Lokal-Evidenz berechneten `itemFingerprint`:

```json
{
  "schemaVersion": 1,
  "auditId": "canonical-math-poc",
  "itemId": "triage-a3e85d9ef77a",
  "itemFingerprint": "sha256:...",
  "status": "mem_feedback_candidate",
  "reviewedAt": "2026-06-01",
  "reviewer": "initials-or-tool",
  "reason": "Short evidence-based decision.",
  "followUpRef": "optional issue, PR, or MEM feedback reference"
}
```

- **Zulässige `status`-Werte:** `not_an_issue`, `local_extraction_fix_needed`, `mem_feedback_candidate`, `source_version_gap`, `deferred`.
- **Ledger-Validierung bei jedem Lauf:** Passende `itemId` + `itemFingerprint` markieren den Eintrag als `decided` (`deferred` bleibt offen); geänderte Fingerprints erscheinen als `stale_review`; unbekannte, doppelte oder fehlerhafte Zeilen landen unter `reviewLedger.diagnostics`.
- **Aufnahmekriterien für neue Vergleiche:** Nur ergänzen, wenn MEM konkrete Plandaten (nicht nur Vokabular) bereitstellt, Graph- und Klassen-IRIs bekannt sind, ein lokales `source-extraction`-Artefakt für denselben Scope vorliegt und stabile Issue-IDs ohne Blockade bestehender `CQR-*`-Regeln erzeugt werden können.
