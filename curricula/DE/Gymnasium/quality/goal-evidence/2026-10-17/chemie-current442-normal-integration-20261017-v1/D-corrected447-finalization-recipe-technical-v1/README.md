# Root-only final D33 recipe

Prepared before opening either fresh D judgment. No predicted decisions,
synthesis, registration, normal writes or new scientific votes were made.
The existing adapter and stock scripts suffice.

## 1. Bind the actual two sealed reviews

After both complete FIRST seals exist, Root pins the actual A/B receipt for
each batch: four receipts in total. Each receipt must identify its actual
completed run and native records. Required receipt fields are recorded in
`CONTRACT.actual-finalize-and-registration-facts.json`.

Copy `../D-corrected447-final-native/FINAL-INPUTS.actual.staged.json` to a new
additive `FINAL-INPUTS.actual.dual-receipts.json`. Change only
`batches[n].finalReviewerReceipts` to the two actual receipt pins for that
batch. Preserve the sealed original plan and all input pins.

Run once from the repository root:

```bash
task_d_adapter=curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-normal-integration-20261017-v1/D-final-native-adapter/native-d-final-context-adapter.mjs
task_d_root=curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-normal-integration-20261017-v1/D-corrected447-final-native
node --import ./app/node_modules/tsx/dist/loader.mjs "$task_d_adapter" --final-plan "$task_d_root/FINAL-INPUTS.actual.dual-receipts.json" --phase validate-rounds --execute
```

This runs unchanged stock dual summaries. It creates no scientific reviewer
records. Do not overwrite actual runs, records or seals.

## 2. Root authors the actual synthesis

Use the actual sealed records and summaries. Each authoring file must live
inside its exact `batch-001/` or `batch-002/` directory. Its fields are:

- `schemaVersion: 1`, `manifestId`, `synthesizedBy`, `decisions`.
- Each decision: `goalId`, `evidenceRound` (`first` or `second`), nonempty
  bilingual `rationaleDe`/`rationaleEn`, and the actual applicable
  `resolutionDecision`/`revisionDissent` if needed.
- Decisions and any explicit `deferredGoals` must partition the batch's
  configured goal IDs in their existing order.

There is no prefilled KEEP list. Two KEEP records may have different evidence
formulations; Root explicitly chooses an evidence round and explains that
choice. One KEEP plus one REVISE can only retain current text through the
existing exact rejected-revision dissent contract and substantive Root
synthesis. BLOCK, SPLIT or unresolved REVISE remains deferred.

Copy the receipt-pinned plan to a new
`FINAL-INPUTS.actual.root-synthesis.json`, changing only each batch's
`synthesisAuthoring` to the actual Root authoring file pin. Then:

```bash
node --import ./app/node_modules/tsx/dist/loader.mjs "$task_d_adapter" --final-plan "$task_d_root/FINAL-INPUTS.actual.root-synthesis.json" --phase finalize --execute
```

For each batch this calls stock summarize, synthesis-manifest materialization,
resolution materialization, index finalization and index validation. The
summary is checked again against exact unchanged bytes. No PDF rebuild or
new reviewer round is needed for unchanged inputs.

## 3. Derive actual owners before changing the registry

If all33 are actually strict-complete:

```bash
node --import ./app/node_modules/tsx/dist/loader.mjs "$task_d_adapter" --final-plan "$task_d_root/FINAL-INPUTS.actual.root-synthesis.json" --phase ownership-plan --execute
```

The adapter validates the actual new indexes and stock supersession chains.
It writes an additive proposal only. Run it **before** registry application;
its input guard intentionally still expects the original final registry pin.

`PLAN.conditional33-two-index-and28-tip-edge-additions.json` provides the exact
33 current owner destinations, independently of any future outcome:

- Two proposed new paths: corrected `batch-001/resolution-index.json` and
  `batch-002/resolution-index.json` under the new D root.
- 28 existing goals: append one edge from the actual current terminal owner
  to the new index containing that goal. Do not branch from an older owner.
- Five new IDs (`223e33a4`, `4965395d`, `4bd54a18`, `6fa55d29`, `ad135d28`)
  have no prior D owner; add their actual new index rows without a fabricated
  predecessor or supersession edge.
- Conditional all33 counts: indices124→126, supersession edges529→557.

The adapter's ownership phase requires all configured goals to be complete.
If a real deferral exists, stock partial finalization supports it; register
only actual complete index rows through the established guarded D159 pattern.
Do not force its all-complete ownership assertion or fabricate missing rows.

## 4. Smallest normal registration operation — Root only

The existing `tmp/chemie442_integrate_actual_D159.mts` is a concrete prior
implementation of the required guards. It cannot run unchanged: it hardcodes
442/159 and old progress/plan/output paths. Reuse that small pattern with447,
the actual completed row count, the current plan and actual two new index
pins; no new adapter framework is necessary.

Before applying, validate each actual standalone index with stock
`validateStandaloneResolutionIndexStructure`, require
`strictDescriptionComplete === true` on every registered row, and compare
its exact goal set and destinations with the actual ownership plan. Archive
the registry's original bytes. Append only:

1. `chemie.resolutionIndexPaths`: actual new index paths.
2. `chemie.resolutionSupersessions`: actual terminal-owner replacement edges.

Retain all124 historical paths and all529 previous edges in their exact
order; preserve withdrawals, semantic retirements, other Chemistry fields,
the four other subject objects and other registry fields exactly. Preserve
every old native record, run, resolution, index and D163 artifact. Recheck the
registry byte pin immediately before its single write. The proposal includes
the other four subject object hashes for the final equality check.

Do not create142 cascade approval rows. The later unchanged stock validation
determines whether replacing the actual bad terminal owners restores those
existing chains. A proposed destination is not a D approval or M7 closure.

The existing report CLI accepts
`--config=<path> --mode=check --format=json`; it has **no** `--subject` flag.
Root controls any later full central run. No such run was started by this
preparation.

## Bounded portability check

All123 sealed preparation files still match their exact pins. Live configs
use repository-relative paths. The33 neutral operative-material copies and
bounded PDFs are present; no original author/reviewer files are required by
the fresh material-only index. Absolute working-directory paths in execution
receipts are historical command metadata, not live input dependencies.
No remote checks or repository-wide inventory were repeated.
