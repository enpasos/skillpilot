# Goal-description authoring approvals

This directory contains durable, fingerprint-bound authoring change sets for
human-approved learning-goal description revisions. A change set records the
review-time German and English text, the exact approved replacements, the
original goal and page fingerprints, the source-reconciliation digest, and the
verbatim approval instruction.

The records are deliberately narrower than the AI review-record schema. They
do not promote temporary understanding, observable-performance, transfer, or
evidence-profile candidates. They also do not approve graph changes, images,
memory-card decisions, semantic classifications, publication, deployment, or
the frozen OpenAI Coach V1 contract. Those lanes retain their own review and
fingerprint requirements.

Validate the committed receipt against the current canonical graph with:

```bash
node curricula/DE/Gymnasium/quality/goal-description-review/validate-authoring-change-set.mjs
```

While the ignored review workspace is still available, also verify every
record against the exact reconciliation source:

```bash
node curricula/DE/Gymnasium/quality/goal-description-review/validate-authoring-change-set.mjs --require-source
```

`changeSetDigest` is SHA-256 over recursively key-sorted JSON after removing
the top-level `changeSetDigest` field.

## Standalone rollout batches

The scaled Mathematics and Physics rollout uses self-contained groups of at
most 20 current `curricularAtomic` goals. Each group owns a dedicated subset
BookModel, HTML, PDF, review bundle, and two blind first-pass campaigns. A
final group also owns its exact dual summary, one current strict resolution per
goal, and a schema-bound `resolution-index.json`.

The batch index deliberately contains no live curriculum denominator or
rollout percentage. Those values belong exclusively to the central
deep-understanding report. Consequently, a new or split goal outside a finished
group cannot make the group's historical reviews stale; current text,
fingerprint, semantic-kind, or resolution drift inside one of its exact
`batchGoalIds` still fails closed.

A configuration uses the contract
`contracts/goal-description-review/v1/goal-description-rollout-batch-config.schema.json`.
For example:

```json
{
  "$schema": "https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json",
  "schemaVersion": 1,
  "batchId": "mathematik-rollout-v1-batch-001",
  "subject": "mathematik",
  "subjectLabel": "Mathematik",
  "bookId": "mathematik-rollout-v1-batch-001",
  "title": "Mathematik Lernzielbeschreibungs-Review – Batch 001",
  "baseGoalBookConfigPath": "app/scripts/config/goal-books/de-gym-math-national-atlas.json",
  "goalIds": ["<1 bis 20 IDs in voraussetzungssicherer Reihenfolge>"],
  "outputDirectory": "curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/batch-001",
  "feedbackBaseUrl": "https://skillpilot.com/lernzielbuch",
  "promptPath": "curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md",
  "criteriaPath": "curricula/DE/Gymnasium/quality/goal-evidence/prompts/mathematik-goal-description-understanding-evidence-review-criteria-v2.md",
  "printDerivativeProfile": "bounded-atlas"
}
```

Prepare and validate the immutable review inputs:

```bash
npm --prefix app run quality:goal-description-rollout-batch -- prepare --config <batch.config.json>
npm --prefix app run quality:goal-description-rollout-batch -- check --config <batch.config.json>
```

After both result directories contain one complete, schema-valid run, bind the
exact dual summary. This creates no acceptance or human attestation:

```bash
npm --prefix app run quality:goal-description-rollout-batch -- summarize --config <batch.config.json> --write
```

After both rounds are current, author one batch-local synthesis-decision
manifest against
`goal-description-rollout-synthesis-decision-manifest.schema.json`. It must
bind every current final text, both exact record-byte digests, the selected
evidence round, and a bilingual rationale. Then materialize exactly one strict
`resolutions/<goalId>.resolution.json` per configured goal and the group-local
index:

```bash
npm --prefix app run quality:goal-description-rollout-resolutions -- \
  --config <batch.config.json> \
  --synthesis-manifest <synthesis-decisions.json> \
  --write
npm --prefix app run quality:goal-description-rollout-resolutions -- \
  --config <batch.config.json> \
  --synthesis-manifest <synthesis-decisions.json>
npm --prefix app run quality:goal-description-rollout-batch -- finalize --config <batch.config.json> --write
npm --prefix app run quality:goal-description-rollout-batch -- finalize --config <batch.config.json>
npm --prefix app run test:goal-description-rollout-synthesis
npm --prefix app run test:goal-description-rollout-batch
```

The generic resolution materializer is deliberately limited to a fully green
current batch with two independent `keep` decisions per goal. The manifest,
not a transient CLI preference, explicitly selects one record's concrete
understanding evidence; its own fingerprint binds all batch, canonical,
dual-summary, run, result, and record digests. Generated V1 resolutions cite
that manifest fingerprint and record any differing review emphasis as
AI-synthesis dissent. Any `revise`, `split_review`, or `block` record still
requires curriculum adjudication and a fresh current keep/keep recheck; the
tool fails closed instead of manufacturing a resolution or human attestation.
For deterministic bytes, `synthesizedAt` is exactly one second after the latest
bound run `completedAt`. Batch-manifest, dual-summary, canonical-landscape, and
synthesis-manifest bindings use SHA-256 of the exact file bytes; the logical
synthesis manifest additionally carries its recursively key-sorted fingerprint.

Append the resulting `resolution-index.json` path to the subject's
`resolutionIndexPaths`. Do not merge several batches into one aggregate index;
the standalone path is the isolation boundary used by the progress reporter.

The matching positive-understanding evidence remains a separate, explicitly
AI-candidate artifact. Author the content-specific profile bodies in a bounded
candidate-set JSON, then let the materializer bind current goal, criteria, and
reviewed visualization fingerprints without inventing human approval:

```bash
npm --prefix app run quality:positive-goal-evidence-candidates -- \
  --config <positive-evidence.config.json> \
  --candidates <positive-evidence.candidates.json> \
  --write
npm --prefix app run quality:positive-goal-evidence-candidates -- \
  --config <positive-evidence.config.json> \
  --candidates <positive-evidence.candidates.json>
npm --prefix app run test:positive-goal-evidence-candidates
```

The candidate set must match the configured goal IDs exactly and in order. The
materializer always emits `needs_human_review` / `ai_candidate`, empty run
claims, and fails closed on stale semantic kinds, missing reviewed assets, or
fingerprint drift. It does not design generic profiles: the authored bodies
still need concrete understanding, observable performance, changed cases, and
independent transfer for each individual goal.

To obtain a deterministic next queue without granting progress or mutating any
artifact, select from the current authoritative atomic scope minus the central
report's already strict-complete goals:

```bash
npm --prefix app run quality:goal-description-rollout-batch -- select \
  --rollout-config curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json \
  --base-config app/scripts/config/goal-books/de-gym-math-national-atlas.json \
  --subject mathematik \
  --max-goals 20 \
  --strategy coherent-area-phase
```

When a later group is selected while earlier groups are still under review,
repeat `--exclude-config <prepared-batch.config.json>` for every in-flight
group. Each excluded config must be bound to the same subject and base atlas;
the selection result lists all explicit exclusions and still grants no
progress. This supports parallel waves without pretending that an unfinished
group is complete.

`landscape-order` returns the first remaining goals in stable GoalBook order.
`coherent-area-phase` starts at that same stable first goal but stops at the end
of its current phase/area block, so it may intentionally return fewer than 20.
The JSON output includes the exact IDs, current goal/page fingerprints, titles,
phase, area, topic code, base page numbers, and an explicit
`grantsProgress: false` marker.
