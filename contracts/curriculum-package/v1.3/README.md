# Stage-plan authoring contract candidate

This directory currently contains the stage-plan foundation for works F1,
F2 and F6 of the [15 November handover](../../../docs/dev/stage-plan-units-handover-2026-11-15.md).
It is not a released curriculum-package runtime version. Package exporters,
Java consumers and the learner map still need their explicit integration;
the existing 1.0, 1.1 and 1.2 contracts remain unchanged.

## Authority and meaning

A plan belongs to one Land and duration model. Its root has exactly two
children: `SekI` and `SekII`, with the latter declaring `after` the former.
Subject and course selections refer to this shared authority. An `after`
orders learning; it neither supplies prerequisite knowledge nor changes
mastery or the frontier.

Full subject views use format `1.1` and bind explicitly to their plan.
Duration-neutral authorities may name several `planIds`; missing duration
or course information is never filled in by guessing. Stage excerpts contain
references to their full authorities and selected units, rather than another
authored goal tree. A course-neutral excerpt must agree across all named
course authorities.

Each target reference records the basis of its placement:

- `officialSource`: the Land source supports the named stage and is cited.
- `canonicalDefault`: a provisional canonical phase, without an official
  source claim.
- `reviewedPreparation`: an explicitly justified earlier learning placement
  whose original source stage and references remain recorded.

The location of a `prerequisiteOnly` reference is not a learning placement.
Necessary preparation is derived from the complete prerequisite graph and
the earliest actual need in the selected personal scope, independently of
mastery. A support reference does not acquire an official source claim.

## Files and validation

| File | Purpose |
| --- | --- |
| `stage-plan.schema.json` | The shared Land/duration plan and its subject authorities. |
| `composition-view.schema.json` | Full authored views and tree-free stage excerpts. |
| `stage-plan-catalog.schema.json` | Exact inventory of authored plans, views and owned output paths. |
| `stage-plan-projection-index.schema.json` | Generated provenance and placements bound to raw source and output digests. |

The semantic validator in
[`stagePlan.ts`](../../../app/src/utils/stagePlan.ts) additionally checks
references, unique visible placements, the two-stage order and agreement of
shared authorities. Schema validation alone is insufficient. Qualified goal
references require the exact canonical owner; matching a bare suffix does
not establish ownership.

Effective target and support roles use the existing composition compiler's
specificity rules. A more specific support declaration may hide descendants
of a broader target subtree. Excerpts retain the global support declarations
needed to preserve their selected stage's actual target projection; they do
not turn those declarations into acquisition targets or independent placements.
The materializer compares its indexed atoms with the native compiler result.

The file-backed materializer in
[`stagePlanCatalog.ts`](../../../app/scripts/lib/stagePlanCatalog.ts) loads
the complete canonical Gymnasium catalog, checks the independent activation
inventory, and runs the existing semantic composition compiler for every
output. Authored sources live under `curricula/DE/Gymnasium/stage-plans/`;
owned compatibility outputs use the existing `composition-views/` paths.
The generated index binds the catalog revision, all canonical sources, the
activation file, authored plans and views, and output bytes. It has no
timestamp. Unlisted, missing, independently modified or stale files fail
validation; path traversal and symlinks are rejected before writes.

No real Land plan is activated by the foundation tests. Once a reviewed
catalog and activation inventory exist, explicit commands from `app/` are:

```sh
npm run generate:stage-plan-views -- --inventory <repository-relative-inventory.json> --write
npm run generate:stage-plan-views -- --inventory <repository-relative-inventory.json> --check
npm run report:stage-plan-learning-flow -- --inventory <repository-relative-inventory.json> --write
```

The report verifies fresh materializations before and after analysis and
checks all independently selected subject/course combinations. It reports
direct and transitive stage backflows, with prerequisite witnesses, including
derived preparation. Its optional `--require-no-backflow` fails on any such
finding. A clean report does not establish source fidelity, pedagogical
quality, complete package support or learner-runtime acceptance.

The legacy curriculum-quality endpoint reader still interprets support
availability partly through authored structure positions. Real activation
must migrate that reader to declared placement and derived preparation
evidence as part of F2/F4. An invisible support section in a compatibility
view alone does not establish that migration or a passed Land-stage plan.

Required CI runs `test:stage-plan-contracts`,
`test:stage-plan-materialization` and `test:stage-plan-learning-flow`.
These include invalid authorities and references, duplicate placements,
mixed-course backflows, stale inputs and outputs, and report CLI checks.
The existing curriculum-quality gates remain required.

The [independent role and label review](../../../docs/qa-ci/stage-plan-foundation-role-review-2026-11-15.md)
preserves the reproduced label defect, its correction and the actual final
source hashes. It is focused implementation evidence, not Land-plan acceptance.
