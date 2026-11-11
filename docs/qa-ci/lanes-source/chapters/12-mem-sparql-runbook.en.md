## MEM SPARQL Consistency Runbook {#sec:qal-mem-sparql-runbook}

This runbook provides the operational checklist for executing and triaging the MEM SPARQL consistency audit defined in @ref{sec:qal-mem-sparql} (initial PoC investigation: [MEM SPARQL PoC, 2026-06-01](repo:docs/qa-ci/archive/mem-sparql-consistency-poc-2026-06-01.md)).

### Running the Audit and Inspecting the Queue {#sec:qal-mem-runbook-inspect}

```bash
cd app
npm run quality:mem-sparql-consistency
cd ..
node - <<'NODE'
const q = require('./docs/qa-ci/status/mem-sparql-consistency-review-issues.json')
console.log(q.summary)
console.log(q.reviewLedger)
console.log(q.highestSignalChecks.map((i) => ({
  id: i.id, status: i.status, category: i.category,
  side: i.side, mem: i.memText, local: i.localText,
})))
NODE
```

For human scanning, inspect [mem-sparql-consistency-review-issues.md](repo:docs/qa-ci/status/mem-sparql-consistency-review-issues.md) (queue) and [mem-sparql-consistency-audit.md](repo:docs/qa-ci/status/mem-sparql-consistency-audit.md) (jurisdiction availability and counts).

### Recording Decisions, Interpreting Diagnostics, and Verifying Locally {#sec:qal-mem-runbook-decide}

1. Pick an item from `highestSignalChecks` or `textTriageQueue` and copy its `id` and `itemFingerprint`.
2. Inspect `memText`/`memRef`, `localText`/`localRef`, `rationale`, and any `reviewNote`; fix local extraction defects directly in the `source-extraction` file.
3. Choose a status (`not_an_issue`, `local_extraction_fix_needed`, `mem_feedback_candidate`, `source_version_gap`, `deferred`), append a single-line JSONL object to `curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.review.jsonl`, and re-run the audit.

Interpreting `reviewLedger.diagnostics` (clean before a MEM-team feedback pass; use `tmp/` for synthetic ledger tests):

- `stale_review`: Item still exists, but its current evidence fingerprint drifted $\to$ re-inspect before reusing.
- `unknownItemRecords`: Ledger references an `itemId` absent from the current queue.
- `duplicateItemRecords`: Multiple records target the same `itemId` (last record wins; deduplicate).

Local verification after editing the generator, config, extraction files, or docs:

```bash
cd app
npx eslint scripts/generateMemSparqlConsistencyAudit.ts
npm run quality:source-coverage-audit:check
cd ..
git diff --check
MEM_CFG=curricula/DE/Gymnasium/quality/mem-sparql-consistency
node -e "for (const f of [
  '$MEM_CFG/canonical-math-poc.config.json',
  'docs/qa-ci/status/mem-sparql-consistency-audit.json',
  'docs/qa-ci/status/mem-sparql-consistency-review-issues.json'
]) JSON.parse(require('fs').readFileSync(f, 'utf8')); console.log('json ok')"
```
