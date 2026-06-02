# MEM SPARQL Consistency Audit

This QA lane compares live MEM/FWU Lehrplan ontology data with SkillPilot's retained source-extraction evidence.

The lane is intentionally non-blocking. MEM is an external endpoint, endpoint coverage is still incomplete across Bundeslaender, and discrepancies are review signals rather than CI failures.

## Purpose

- Query `https://sparql.mem.edufeed.org/sparql` from local QA tooling.
- Check which configured Mathematik/Gymnasium source scopes currently have matching MEM curriculum plans.
- Compare configured MEM text nodes with persisted SkillPilot source-extraction texts.
- Emit stable review queues so humans can decide whether a mismatch is a SkillPilot extraction issue, a harmless representation difference, a source-version question, or MEM feedback.

MEM remains a secondary consistency source in this lane. It does not replace original source references, source-coverage ledgers, semantic atomicity review, memory-card review, or composition-view validation.

## Source Of Truth

- Config: `curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.config.json`
- Review decision ledger: `curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.review.jsonl`
- Generator: `app/scripts/generateMemSparqlConsistencyAudit.ts`

Generated files under `docs/qa-ci/status/` are not source of truth and should not be edited manually.

## Generated Artifacts

- Audit report: `docs/qa-ci/status/mem-sparql-consistency-audit.md`
- Machine-readable audit: `docs/qa-ci/status/mem-sparql-consistency-audit.json`
- Human review queue: `docs/qa-ci/status/mem-sparql-consistency-review-issues.md`
- Machine-readable review queue: `docs/qa-ci/status/mem-sparql-consistency-review-issues.json`

## Run

```bash
cd app
npm run quality:mem-sparql-consistency
```

Use an alternate endpoint or config while experimenting:

```bash
cd app
npm run quality:mem-sparql-consistency -- --endpoint=https://sparql.mem.edufeed.org/sparql
npm run quality:mem-sparql-consistency -- --config=curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.config.json
```

## Blocking Semantics

The command exits successfully after producing reports, even when review issues exist.

It should fail only for local script or configuration errors that prevent report generation. MEM content mismatches, missing MEM plans, stale review decisions, and open review items remain non-blocking.

## Review Ledger

The JSON review queue carries an `itemFingerprint` for each queue item. The fingerprint is computed from the current MEM/local evidence, not from transient review notes.

A human decision should be written to the configured JSONL ledger only after inspecting the queue item:

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

Supported `status` values:

- `not_an_issue`
- `local_extraction_fix_needed`
- `mem_feedback_candidate`
- `source_version_gap`
- `deferred`

The generated JSON queue validates ledger records on every run:

- matching `itemId` and `itemFingerprint` annotate a queue item as `decided`, except `deferred`, which stays open;
- matching `itemId` with a changed fingerprint is shown as `stale_review`;
- unknown, duplicate, or malformed ledger records are listed under `reviewLedger.diagnostics`.

## Review Workflow

1. Run the audit.
2. Start with `highestSignalChecks` in the JSON queue or the matching section in the Markdown queue.
3. Inspect MEM evidence, local source evidence, and any `reviewNote`.
4. Fix local extraction defects in source-extraction files if the local evidence is wrong.
5. Write confirmed decisions into the JSONL ledger with the current `itemFingerprint`.
6. Re-run the audit and verify that the queue annotates the item as `decided`, `deferred`, or `stale_review`.

## Expansion Criteria

Add a new concrete comparison only when all of the following are true:

- MEM exposes concrete plan data for the scope, not just vocabulary.
- The graph IRI and relevant class IRIs are known.
- SkillPilot has a retained source-extraction artifact for the same source scope.
- The comparison can produce stable issue IDs and human-readable evidence references.
- The resulting issues can be triaged without blocking existing `CQR-*` readiness rules.

## Related Documents

- Runbook: [MEM SPARQL Consistency Runbook](mem-sparql-consistency-runbook.md)
- Initial PoC record: [MEM SPARQL Consistency PoC, 2026-06-01](archive/mem-sparql-consistency-poc-2026-06-01.md)
