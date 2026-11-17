# Common curriculum-package 1.3 candidate

This unpublished common version contains the stage-plan foundation for works
F1, F2 and F6 of the [15 November handover](../../../docs/dev/stage-plan-units-handover-2026-11-15.md)
and the required assessment-material runtime lane. It is one evolving 1.3
contract. The existing 1.0, 1.1 and 1.2 schemas and profiles remain unchanged;
the exact 1.2 learning-unit landscape and review definitions are pinned
components of the 1.3 package profile. Superseded completion 1.1 is not imported.

The evolving 1.3 JSON profile also transports source composition views 1.2.
It explicitly projects them to the closed `runtime-composition-view.schema.json`
with view format 1.2; every `childOrder` declaration and its local endpoints are
retained. Authoring-only placement rationale and restoration snapshots remain
bound by the source inputs rather than becoming runtime fields. The unchanged
1.0, 1.1 and 1.2 package profiles reject source-view 1.2 instead of discarding
its order or relabeling it as view 1.0. The ordinary subject export retains the
source view's schema, format, order and acquisition markers in its separately
sanitized composition artifact.

The current view inventory is counted in the evolving 1.3 build profile. Its
`publicationBaseViewCount` preserves the immutable historical publication
inventory; new views add logical content-index records without changing the
older publication evidence or contracts.
The partial-order delivery uses a separate candidate redistribution ledger,
`de-gymnasium-mathematik-v1.3-partial-order-20261116.review.json`, selected
explicitly by `--ledger` during review generation and `--redistribution-review`
during package building. The earlier assessment-material ledger and its sealed
receipts remain unchanged. Generating over that historical ledger fails closed;
the new candidate preserves pending human decisions and grants no publication
permission. General CLI defaults continue to select the original 1.0 contract.

The 1.3 profile pins this runtime view schema in the offline schema catalog and
uses its own field-semantics registry. Missing and empty declarations differ;
order pairs form a semantic set, independently of display-array order. Producer
and independent validator both reject unknown or nonsibling references, self
edges, duplicates, cycles and transitive redundancy. This transport does not
activate a stage plan, change canonical prerequisites or write learner results.
The optional `acquisitionPlacement: true` marker travels only on explicit
`prerequisiteOnly` atomic goal entries in view format 1.2. It records a reviewed
learning place for an atom already in the backend's closed acquisition basis;
neither nesting nor source-only placement evidence supplies that marker.

The runtime candidate adds `assessmentMaterialsV1` alongside `learningUnitsV1`.
Its closed resource index embeds original SVG/PNG task stimuli as required
resources, including stimuli referenced directly in either task language.
Each exact original URL has one resource and binary record. The real declaring
goal owns that record, or the deterministic first actual task user when no
resource link declares it. Ownership is not exclusive usage or assessed
coverage. Every task-to-stimulus association is reconstructed independently;
shared use never changes task bodies, original URLs or image bytes.
Exactly those required material records are additional typed roots of the
runtime package dependency closure. Missing, unused, unowned or unresolved task
images fail validation. These payload roots are distinct from pedagogical
`requires`, personal seed targets S and the learner's acquisition basis L;
exporting an image never adds a learning prerequisite or learner result.

SVG receives bounded static-content validation without DTD/entity/network
resolution, scripts, foreign active elements, events or external references.
Only inert Matplotlib SVG 1.1 declaration syntax and local fragment references
are supported. PNG uses its exact signature. Assessment media provenance binds
real task sources and the material declaration; it never invents an image
prompt or grants redistribution approval. The legacy visualization evidence
requirements remain strict. `generate_curriculum_package_v13_contracts.py`
derives the new candidate without rewriting earlier contracts.

The package manifest retains its existing general `skillpilot-authored`
provenance class. The embedded redistribution record preserves the more
specific assessment-material subtype and its exact source evidence; this
projection changes neither the review status nor the license decision.

The two JSON authoring sources named in the current build inputs travel as
provenance records with their original bytes. Exact file overrides keep them
in the SkillPilot content class with pending redistribution review; ordinary
technical provenance and the existing text-only documentation role are
unchanged. Neither source becomes a runtime landscape or learner target.

Model/schema checks alone are not runtime acceptance. Native Java/browser
checks and the independent package validator must cover the new lane. No real
Land plan is activated by it, the shared production stage-plan index still
needs its explicit integration, and no 1.3 FWU-OWL roundtrip or publication is
claimed by JSON model conformance. The existing stage-plan and learning-unit
acceptance gates remain required.

Readiness evaluation selects this exact repository-pinned contract explicitly
with `--contracts-dir contracts/curriculum-package/v1.3`. Its separate policy
and report schema are reproducibly derived by
`generate_curriculum_package_v13_readiness.py`; the original readiness policy,
all thirteen blocking checks, and the pinned fifteen-check package-consumer
runner remain unchanged. This candidate separately pins runner 1.1.0 and its
versioned browser helper: the application must request the exact learner-scoped
landscape closure for the selected learner and subject with a successful GET.
The former helper expected the general landscape route, although the current
application correctly uses the learner-scoped route. All fifteen functional
checks, browser failure checks and isolation requirements remain mandatory;
the earlier runner and its helper bytes are retained unchanged. A supplied consumer report still cannot establish
acceptance, and unresolved human redistribution decisions still prevent
publication. The default evaluator continues to select runtime 1.0; selecting
1.3 never silently reinterprets an earlier package.

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

The same `units` array may now declare temporal children. A stage's explicit
`children` list names its `year` units in SekI, or its `phase` units (`E`,
`Q1`–`Q4`) in SekII. Years carry `year`; phases carry `phase`; both carry
`parentUnitId`, `after`, and a cited `basis`. An `officialSource` basis cites
the Land/duration structure; `reviewedStructure` records an explicitly justified
author structure without claiming an official assignment. Labels may reflect
the applicable Land; optional `labelEn` is presentation only. The contract does
not invent a universal list of school years for all Länder or duration models.

Every child belongs to exactly one stage and is listed once by that parent.
The displayed sibling order and the explicit minimal `after` chain must agree;
missing, backward, repeated and cross-parent slots fail validation. Subdivided
stages aggregate their children's targets; each acquisition target has one
leaf placement in a year or phase. A target left on the subdivided aggregate
has no unambiguous temporal position and is rejected. An unsplit original
stage remains a valid leaf, so the existing two-stage format is unchanged.

Each target reference records the basis of its placement:

- `officialSource`: the Land source supports the named stage and is cited.
  A nested assignment also identifies its exact `sourceUnitId`; source evidence
  for the stage alone does not establish a particular year or phase.
- `canonicalDefault`: a provisional canonical phase, without an official
  source claim. At a temporal leaf it must match the declared year/phase;
  it is not permission to relocate a canonical goal silently.
- `reviewedPreparation`: an explicitly justified earlier learning placement
  whose original source stage and references remain recorded. For nested
  preparation, `sourceUnitId` retains the later source year/phase while the
  learning placement is earlier in the same declared hierarchy.
- `reviewedPlacement`: a cited, reasoned author placement, explicitly separate
  from an official year/phase claim. This can locate a cross-phase assessment
  or orientation goal without falsely assigning it an official calendar slot.
  Basis declarations still require source and subject review before activation;
  syntactic validity is not independent acceptance.

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
shared authorities at every temporal boundary. Schema validation alone is insufficient. Qualified goal
references require the exact canonical owner; matching a bare suffix does
not establish ownership.

Effective target and support roles use the existing composition compiler's
specificity rules. A more specific support declaration may hide descendants
of a broader target subtree. Excerpts retain the global support declarations
needed to preserve their selected stage's actual target projection; they do
not turn those declarations into acquisition targets or independent placements.
The materializer compares its indexed atoms with the native compiler result.
Its index recursively binds each emitted stage/year/phase structure, including
parent, kind and sibling order. Empty subject contributions to a calendar unit
remain in the shared authority but are omitted from the legacy output; no
artificial goals are inserted to satisfy the legacy nonempty-structure rule.

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
direct and transitive backflows across years, phases and stages, with prerequisite witnesses, including
derived preparation. Unit counts aggregate descendants once; direct ownership
counts remain available separately. Preparation is placed at the earliest
actual temporal need using the declared hierarchy, independently of mastery.
Its optional `--require-no-backflow` fails on any such
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

The learner-map adapter `deriveLearnerUnitMapPreview` accepts the selected plan
and verified records of this same generated index through `stagePlanContext`.
It uses declared identities and `after`, merges them across subjects, exposes
actual nested year/phase units, and leaves atomic requirement provenance and
backward arrows intact. With declared metadata, ordinary topic headings never
become a second unit hierarchy. Without activated metadata, the existing
explicitly provisional preview remains; its table includes the exact neutral
GK/LK stage IDs emitted by the native Java merger. Neither adapter nor unit
order writes mastery, changes closure, blocks entry, or hides a prerequisite.

The nested integration test runs within the existing required
`test:stage-plan-contracts` gate. It exercises the real materializer, legacy
compiler, generated index, learner tree and map projection together, including
same-stage year/phase backflows and invalid parent/order/source declarations.
The isolated fixtures activate zero real plans. A real HE G8/G9 authoring
preparation must retain and resolve actual placement/source findings before
reviewed activation; a clean fixture is no substitute. Production loading and
raw-digest binding of the selected index, including the Java GK/LK merge path,
remain explicit integration work before real activation.
