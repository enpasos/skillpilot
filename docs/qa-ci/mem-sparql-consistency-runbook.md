# MEM SPARQL Consistency Runbook

This runbook is the operational checklist for the MEM SPARQL consistency lane.

For the durable process contract, see [MEM SPARQL Consistency Audit](mem-sparql-consistency.md). For the initial investigation record, see [MEM SPARQL Consistency PoC, 2026-06-01](archive/mem-sparql-consistency-poc-2026-06-01.md).

## Run The Audit

```bash
cd app
npm run quality:mem-sparql-consistency
```

Expected generated artifacts:

- `docs/qa-ci/status/mem-sparql-consistency-audit.json`
- `docs/qa-ci/status/mem-sparql-consistency-audit.md`
- `docs/qa-ci/status/mem-sparql-consistency-review-issues.json`
- `docs/qa-ci/status/mem-sparql-consistency-review-issues.md`

The command should succeed even when those artifacts contain open review items.

## Inspect Results

Start with the JSON queue:

```bash
node - <<'NODE'
const queue = require('./docs/qa-ci/status/mem-sparql-consistency-review-issues.json')
console.log(queue.summary)
console.log(queue.reviewLedger)
console.log(queue.highestSignalChecks.map((item) => ({
  id: item.id,
  status: item.status,
  category: item.category,
  side: item.side,
  mem: item.memText,
  local: item.localText,
})))
NODE
```

Use the Markdown queue for human scanning:

- `docs/qa-ci/status/mem-sparql-consistency-review-issues.md`

Use the full audit when you need jurisdiction availability or comparison counts:

- `docs/qa-ci/status/mem-sparql-consistency-audit.md`

## Decide An Item

1. Pick a queue item from `highestSignalChecks` or `textTriageQueue`.
2. Copy its `id` and `itemFingerprint`.
3. Inspect:
   - `memText` / `memRef`
   - `localText` / `localRef`
   - `rationale`
   - `reviewNote`, if present
4. Choose a status:
   - `not_an_issue`
   - `local_extraction_fix_needed`
   - `mem_feedback_candidate`
   - `source_version_gap`
   - `deferred`
5. Append a JSONL record to `curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.review.jsonl`.

Example:

```json
{"schemaVersion":1,"auditId":"canonical-math-poc","itemId":"triage-a3e85d9ef77a","itemFingerprint":"sha256:...","status":"mem_feedback_candidate","reviewedAt":"2026-06-01","reviewer":"initials","reason":"MEM did not expose the LK subitem found in the retained Sachsen source extraction.","followUpRef":"optional-link-or-ticket"}
```

Re-run the audit. A current non-`deferred` decision should annotate the queue item as `decided`.

## Interpret Ledger Diagnostics

- `stale_review`: the item still exists, but its current evidence fingerprint differs from the ledger. Re-check the item before reusing the decision.
- `unknownItemRecords`: the ledger references an item that is no longer in the current queue. Keep it only if it is useful audit history.
- `duplicateItemRecords`: more than one ledger record exists for the same item. The last record is used for queue annotation; remove ambiguity when possible.
- malformed record diagnostics: fix the JSONL record before relying on its decision.

Ledger diagnostics are non-blocking, but they should be cleaned before using the queue for a MEM-team feedback pass.

## Verify Local Changes

After editing the generator, config, source-extraction files, or docs:

```bash
cd app
npx eslint scripts/generateMemSparqlConsistencyAudit.ts
npm run quality:source-coverage-audit:check
cd ..
git diff --check
node -e "for (const f of ['curricula/DE/Gymnasium/quality/mem-sparql-consistency/canonical-math-poc.config.json','docs/qa-ci/status/mem-sparql-consistency-audit.json','docs/qa-ci/status/mem-sparql-consistency-review-issues.json']) JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('json ok')"
```

If you need to test ledger behavior, create a temporary config and ledger under `tmp/`; do not commit fake decision records to the real ledger.
