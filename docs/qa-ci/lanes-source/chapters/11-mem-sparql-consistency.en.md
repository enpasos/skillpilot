## MEM SPARQL Consistency Audit {#sec:qal-mem-sparql}

This deliberately **non-blocking** QA lane compares live curriculum data from the external MEM/FWU ontology endpoint (`https://sparql.mem.edufeed.org/sparql`) against SkillPilot's retained `source-extraction` evidence. Because external endpoint coverage across German states remains incomplete, discrepancies act as structured triage signals rather than CI failures; MEM never replaces official source references or `CQR-*`, atomicity, memory-card, and composition-view validators.

### Sources of Truth, Generated Artifacts, and Execution {#sec:qal-mem-artifacts}

- **Config & ledger (source of truth):** `curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.config.json` and `canonical-math-poc.review.jsonl` (generator: `app/scripts/generateMemSparqlConsistencyAudit.ts`).
- **Generated snapshots (never hand-edited):** [mem-sparql-consistency-audit.md](repo:docs/qa-ci/status/mem-sparql-consistency-audit.md), `mem-sparql-consistency-audit.json`, [mem-sparql-consistency-review-issues.md](repo:docs/qa-ci/status/mem-sparql-consistency-review-issues.md), and `mem-sparql-consistency-review-issues.json`.

```bash
cd app
npm run quality:mem-sparql-consistency
npm run quality:mem-sparql-consistency -- \
  --endpoint=https://sparql.mem.edufeed.org/sparql
MEM_CFG=curricula/DE/Gymnasium/quality/mem-sparql-consistency
npm run quality:mem-sparql-consistency -- \
  --config="$MEM_CFG/canonical-math-poc.config.json"
```

The command exits `0` even when open triage items exist, failing only on local script or configuration errors (initial PoC record: [MEM SPARQL PoC, 2026-06-01](repo:docs/qa-ci/archive/mem-sparql-consistency-poc-2026-06-01.md); operational checklist: @ref{sec:qal-mem-sparql-runbook}).

### Fingerprint-Bound Review Ledger and Expansion Criteria {#sec:qal-mem-ledger}

Every JSON review-queue entry carries an `itemFingerprint` computed from current MEM and local evidence:

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

- **Supported `status` values:** `not_an_issue`, `local_extraction_fix_needed`, `mem_feedback_candidate`, `source_version_gap`, `deferred`.
- **Per-run ledger validation:** Matching `itemId` + `itemFingerprint` annotates the entry as `decided` (except `deferred`, which stays open); drifted fingerprints surface as `stale_review`; unknown, duplicate, or malformed records appear under `reviewLedger.diagnostics`.
- **Expansion criteria:** Add a scope only when MEM exposes concrete plan data (beyond vocabulary), graph and class IRIs are known, SkillPilot holds a retained `source-extraction` artifact for the same scope, and stable issue IDs can be triaged without blocking `CQR-*` readiness rules.
