This is the single source of truth for algorithmic graph validation in CI.

- Validator implementation: `app/scripts/validateGraph.ts`
- CI entrypoint: `npm run validate:graph` in `.github/workflows/ci.yml` (`graph-validation` job)
- Filter-projection validator: `app/scripts/validateViewFilters.ts`
- Filter-projection CI entrypoint: `npm run validate:view-filters` in `.github/workflows/ci.yml` (`graph-validation` job)
- Hessen Mathematik G8/G9 duration-projection validator: `app/scripts/reportHeMathDurationProjection.ts --check`
- Hessen Mathematik G8/G9 CI entrypoint: `npm run check:he-math-duration-projection` in `.github/workflows/ci.yml` (`graph-validation` job)
- Composition-view validator: `app/scripts/validateCompositionViews.ts`
- Composition-view CI entrypoint: `npm run validate:composition-views` in `.github/workflows/ci.yml` (`graph-validation` job)
- Hessen Oberstufe archive-boundary validator: `scripts/validate_hessen_upper_secondary_archive_paths.py`
- Archive-boundary CI entrypoint: `python scripts/validate_hessen_upper_secondary_archive_paths.py` in `.github/workflows/ci.yml` (`graph-validation` job)
- Hessen Oberstufe legacy-reference validator: `scripts/validate_hessen_upper_secondary_legacy_refs.py`
- Legacy-reference CI entrypoint: `python scripts/validate_hessen_upper_secondary_legacy_refs.py` in `.github/workflows/ci.yml` (`graph-validation` job)
- The legacy-reference validator also enforces post-retirement absence of the old `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe` tree; only allowlisted provenance/handoff files may still mention that path textually.
- Hessen Sek-I archive-boundary validator: `scripts/validate_hessen_lower_secondary_archive_paths.py`
- Archive-boundary CI entrypoint: `python scripts/validate_hessen_lower_secondary_archive_paths.py` in `.github/workflows/ci.yml` (`graph-validation` job)
- Hessen Sek-I legacy-reference validator: `scripts/validate_hessen_lower_secondary_legacy_refs.py`
- Legacy-reference CI entrypoint: `python scripts/validate_hessen_lower_secondary_legacy_refs.py` in `.github/workflows/ci.yml` (`graph-validation` job)
- Bavaria Gymnasium archive-boundary validator: `scripts/validate_bavaria_gymnasium_archive_paths.py`
- Archive-boundary CI entrypoint: `python scripts/validate_bavaria_gymnasium_archive_paths.py` in `.github/workflows/ci.yml` (`graph-validation` job)
- Bavaria Gymnasium legacy-reference validator: `scripts/validate_bavaria_gymnasium_legacy_refs.py`
- Legacy-reference CI entrypoint: `python scripts/validate_bavaria_gymnasium_legacy_refs.py` in `.github/workflows/ci.yml` (`graph-validation` job)
- The lower-secondary legacy-reference validator fences repo references to `curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe` to the explicit delete-handoff allowlist until the final repo-side remove is executed.

## Enforcement profiles

- `default`:
  - structural/data integrity rules are `error` (fail build)
  - `GVR-*` rules are also `error` (strict by default)
- `legacy-warn` (temporary migration mode):
  - enable with `VALIDATE_GRAPH_STRICT_RULES=0`
  - migration rules are downgraded to `warn`
  - `GVR-012` remains an unconditional `error`; the reviewed Sek-I/Sek-II route gate cannot be bypassed

## Rules currently emitted with stable IDs

| Rule ID | Description | Scope | Default |
| --- | --- | --- | --- |
| `GVR-001` | A goal must not directly require one of its `contains` ancestors. | Local landscape | `error` |
| `GVR-002` | Legacy phase-compatibility lint: for repositories that still use comparable `phase` labels, effective prerequisites should not point to later phases (`E`, `Q1..Q4`, `Abitur`, `S*`, `J*`). This is a validator-profile rule, not part of the canonical graph validity definition. | Local landscape | `error` |
| `GVR-003` | A goal must not directly require its direct `contains` parent (most frequent deadlock source). | Local landscape | `error` |
| `GVR-004` | First atomic node must be a motivation anchor (`Warum`/`Why`). | Rollout subset (`DE_HES_S_GYM_2_*`, excluding `OVERVIEW`) | `error` |
| `GVR-005` | Every atomic node must have a transitive path to the motivation anchor via effective `requires`. | Rollout subset (`DE_HES_S_GYM_2_*`, excluding `OVERVIEW`) | `error` |
| `GVR-006` | A goal must not directly require one of its direct `contains` children (inverse anti-pattern of `GVR-003`). | Rollout subset (`DE_HES_S_GYM_2_*`, including `OVERVIEW`) | `error` |
| `GVR-007` | MIT OCW module atomic goals must include intensive source-link coverage (`concept` + `practice` + `assessment`) in canonical `resourceLinks`. | MIT OCW module landscapes (`frameworkId` starts with `mit-ocw-` and root tagged `module:*`) | `error` |
| `GVR-008` | Committed landscape goals must use canonical `resourceLinks` as the only supported goal-level helper-link field. | Local landscape | `error` |
| `GVR-009` | If explicit `type` metadata is present, it must match the canonical node classification derived from direct `contains` children (`atomic` iff leaf, `cluster` iff non-leaf). | Local landscape | `error` |
| `GVR-010` | If `shortKey` is present, it must be unique within the logical `landscapeId` (duplicates across locale serializations are allowed only when they refer to the same goal id). | Logical landscape (`landscapeId`, including multi-file localizations) | `error` |
| `GVR-011` | Configured scoped motivation-connectivity profile: every node selected by the profile must have a transitive path to at least one configured motivation anchor via effective `requires`. | Profile-defined rollout scopes | `error` |
| `GVR-012` | Hard scoped full-route coverage: every selected `curricularAtomic` goal must lie on a direct atomic `requires` path from its stage-specific `orientation` anchor to a stage-specific atomic `practiceAssessment` terminal. | Canonical DE Gymnasium mathematics, independently for Sek I and Sek II | unconditional `error` |
| `GVR-013` | Configured scoped atomic-route profile: every direct local `requires` edge from a selected atomic route node must target an atomic node, not a cluster. | Profile-defined rollout scopes | `error` |
| `GVR-014` | Motivation/orientation nodes are pure, prerequisite-free atomic entry anchors and must not carry exam, memory, example, or assessment metadata. | All loaded landscapes | unconditional `error` |
| `GVR-015` | Reviewed orientation outlooks have bounded bilingual paths with in-stage `curricularArea` roots plus atomic `curricularAtomic` entry goals and milestones. Every entry directly requires the `orientation` anchor; `contains` proves path membership, while a direct, stage-scoped atomic `requires` route proves downstream sequencing. | Canonical DE Gymnasium mathematics, independently for Sek I and Sek II | unconditional `error` |
| `GVR-016` | Table-like blocks in learner-facing exam Markdown must use a valid GFM delimiter row and a consistent column count. | All `examData.taskContent*` and `examData.solutionContent*` fields | unconditional `error` |

## Core validator checks (always active, fail CI)

These checks are already implemented and treated as `error`:

- JSON parsing and landscape loading
- Goal ID uniqueness inside a landscape
- Optional `shortKey` uniqueness within a logical `landscapeId`
- Referential integrity for `requires` and `contains`
- Self-reference guards (`goal cannot require itself`, `goal cannot contain itself`)
- Allowed metadata domains:
  - `phase`
  - `leitideen`
  - `kompetenzen` tag pattern
- DAG checks:
  - acyclic direct `requires`
  - acyclic `contains`
  - acyclic effective requires (`requires` + inherited from `contains` ancestors)
  - inherited self-prerequisite detection
- Curriculum manifest consistency (`curricula/curriculum_manifest.json`)
  - schema/basic shape
  - id/title presence
  - duplicates
  - unknown IDs
  - root curriculum set sync
  - title alignment with landscape files
- Project-specific invariants (currently Physics cross-curriculum dependency guard)

## Notes on scope

- Validation is intentionally structural/algorithmic.
- Didactic quality checks (sequencing quality, granularity, redundancy of meanings, etc.) remain part of manual QA (`curricula/QA/*`).
- Learner-state semantics from the concept spec such as atomic mastery, frontier computation, and optimistic/pessimistic filter evaluation are currently **not** validated in CI.
- Projected filtered learner graphs derived from compiled `applicability` are now validated by the separate `validate:view-filters` path.
- Hessen Mathematik Sek-I G8/G9 duration-model projection is validated by `check:he-math-duration-projection`; it derives canonical-duration-grade evidence from the Hessen G8/G9 source extraction plus M3 mapping review, then requires every evidence link to be represented by authored year structure or duration-specific `goalPlacements`.
- Explicit learner-facing composition views under `curricula/DE/Gymnasium/composition-views/` are validated by the separate `validate:composition-views` path.
- The current CI enforcement scope for `validate:view-filters` covers the reviewed canonical DE Gymnasium set (`Mathematik`, `Physik`, `Chemie`, `Biologie`, `Informatik`, `Deutsch`, `Englisch`, `Französisch`, `Griechisch`, `Chinesisch`, `Geschichte`, `Politik und Wirtschaft`, `Musik`, `Latein`, `Spanisch`, `Wirtschaft`, `Overview`).
- Reviewed applicability warnings can be recorded in `docs/qa-ci/applicability-accepted-warnings.json`; the validator still prints them, but classifies them as accepted review debt instead of active warnings.
- Additional structural rules should be added here first, then implemented in `validateGraph.ts`, then rolled out in CI.

## Exam Markdown table integrity (`GVR-016`)

`GVR-016` protects the shared learner-facing exam content consumed by cockpit
and coaching providers. Two or more consecutive lines that begin and end with
pipe characters are treated as an intended GFM table. The second row must be a
valid delimiter row, and every row must have the same number of columns.

The rule deliberately scans only `taskContent`, `taskContentEn`,
`solutionContent`, and `solutionContentEn` inside `examData`. A single pipe row
and ordinary inline notation such as `|x|` are not classified as tables. This
keeps archived extraction prose and non-runtime Markdown out of the gate while
ensuring that released exam data render identically in every GFM-capable host.

## Filter-projection validator (`validate:view-filters`)

This validator is separate from `validate:graph` and operates on projected filtered graphs rather than only on authored raw landscapes.

Current CI scope:

- reviewed canonical DE Gymnasium set
- `Mathematik`
- `Physik`
- `Chemie`
- `Biologie`
- `Informatik`
- `Deutsch`
- `Englisch`
- `Französisch`
- `Griechisch`
- `Chinesisch`
- `Geschichte`
- `Politik und Wirtschaft`
- `Musik`
- `Latein`
- `Spanisch`
- `Wirtschaft`
- `Overview`

Current stable finding families:

| Rule ID | Description | Default |
| --- | --- | --- |
| `APV-102` | A visible goal requires a prerequisite that is invisible in the projected filtered graph. | `error` |
| `APV-103` | A visible goal is not reachable from the projected root. | `error` |
| `APV-201` | An explicit applicability-override path is used, either embedded or via the canonical override registry. | `warning` |
| `APV-202` | Applicability is backed only by `partial` mappings. | `diagnostic` |
| `APV-203` | Compiled applicability differs from currently committed applicability metadata. | `warning` |

Accepted-warning handling:

- `APV-201` may remain in reviewed pilots when no cleaner exact source alignment exists yet.
- Such warning cases must be explicitly listed in `docs/qa-ci/applicability-accepted-warnings.json` with a short rationale.
- `APV-202` is high-cardinality mapping-shape diagnostics, not a warning: it says a projected visibility decision is backed only by partial mapping evidence. Since `1:n` / partial coverage can be fachlich complete, `validate:view-filters` reports `APV-202` as diagnostic findings and keeps warning debt separate.
- Retained compatibility clusters that are no longer learner-facing must be marked with `extendedData.applicabilityProjection = "excluded"`. Otherwise cluster child-union applicability can make them visible without a root path and trigger `APV-103`.
- `validate:view-filters` prints compact summaries by default. Set `APPLICABILITY_VERBOSE_WARNINGS=1` to print every individual warning line for audit/debug work.

## Composition-view validator (`validate:composition-views`)

This validator is separate from both `validate:graph` and `validate:view-filters`.

It operates on explicit learner-facing composition-view files and validates that they compile deterministically against the referenced canonical graph.

Current scope:

- all `.view.json` files under `curricula/DE/Gymnasium/composition-views/`

Current stable finding families:

| Rule ID | Description | Default |
| --- | --- | --- |
| `CPV-000` | The composition-view file could not be loaded or parsed. | `error` |
| `CPV-001` | Required composition-view metadata or node metadata is invalid or missing. | `error` |
| `CPV-002` | A referenced canonical subtree root does not exist in the referenced canonical graph. | `error` |
| `CPV-004` | Two referenced canonical subtree roots overlap or the same canonical root is referenced more than once. | `error` |
| `CPV-005` | The compiled default tree contains the same canonical goal more than once. | `error` |
| `CPV-006` | The compiled default tree gives one canonical goal more than one visible parent. | `error` |
| `CPV-007` | A structure node is left empty although it is still present in the view tree. | `error` |
| `CPV-008` | A composition reference uses an unknown `projectionRole`. | `error` |
| `CPV-009` | A direct `goalEntry` exposes a reviewed `semanticKind: curricularArea` cluster as an opaque runtime goal instead of expanding it with `canonicalSubtree` or representing its atomic goals explicitly. | `error` |
| `CPV-101` | A structure node label is still too generic to be review-safe. | `warning` |
| `CPV-102` | A referenced canonical subtree root still looks phase- or state-specific by title. | `warning` |
| `CPV-210` | A canonical Gymnasium mathematics Sek-I learner-facing view does not expose the reviewed motivation anchor. | `error` |
| `CPV-211` | A canonical Gymnasium mathematics Sek-I learner-facing view does not expose the required year exam folders or their individual task nodes. | `error` |
| `CPV-212` | The canonical Gymnasium mathematics Sek-I exam folder structure is malformed: missing year folder, non-atomic task, missing exam data, cluster prerequisite, duplicate task, or stale aggregate terminal endpoint. | `error` |
| `CPV-213` | A canonical Gymnasium mathematics Sek-I learner-facing view still exposes the legacy `Übungen Sekundarstufe I` aggregate branch. | `error` |
| `CPV-214` | A canonical Gymnasium mathematics Sek-II or cross-stage learner-facing view does not expose the reviewed Sek-II motivation anchor. | `error` |
| `CPV-215` | A canonical Gymnasium mathematics Sek-II or cross-stage learner-facing view exposes no atomic terminal autonomy/assessment endpoint from the reviewed Sek-II terminal clusters. | `error` |
| `CPV-216` | A learner-facing composition label exposes an internal authoring process term such as `Source-Extraction` instead of naming the represented subject matter. | `error` |

## Current compatibility model vs. target model

The current CI validator still operates on the compatibility model used by the existing runtime and landscapes:

- direct `requires` may be authored on atomic or cluster goals
- effective prerequisites are computed by inheriting `requires` from `contains` ancestors
- rollout rules such as `GVR-004` / `GVR-005` validate motivation connectivity in that effective graph

The conceptual target model described in `docs/concept/skill-graph/graph-definition.md` is stricter:

- the canonical didactic sequencing layer should primarily be authored on atomic goals
- atomic/cluster semantics are defined canonically by the direct `contains` relation (leaf = atomic, non-leaf = cluster)
- cluster-level dependency views should preferably be derived from atomic descendants
- mature route-quality checks should eventually validate atomic didactic routes from motivation anchors to terminal autonomy goals
- progression semantics in the concept doc are defined via atomic mastery and derived cluster satisfaction, but this is not yet a CI validation target

For reviewed canonical route scopes, this stricter target model is now enforced incrementally:

- `GVR-013` forbids direct local `requires` from selected atomic route nodes to clusters.
- If a cluster was previously used as a prerequisite shortcut, the route must be repaired by replacing it with reviewed atomic prerequisites. The mechanical migration fallback is to expand the cluster to its atomic descendants, but a tighter didactic prerequisite set is preferred when it has been reviewed.

Until the validator and landscapes are migrated, this file distinguishes clearly between:

- rules that are implemented today and have stable `GVR-*` IDs
- planned future direction that is not yet implemented in CI and therefore has no stable rule IDs here

## Scoped motivation connectivity (`GVR-011`)

`GVR-011` is intentionally phrased as a reusable validator pattern, not as a one-off landscape exception.

Rule semantics:

- a validator profile declares:
  - one target landscape
  - one or more reviewed motivation anchor goals
  - one scoped goal selector
- `GVR-011` fails if any selected node except the anchor nodes themselves has no transitive path to at least one configured anchor in the effective-requires graph.

Current active profiles:

- landscape: canonical DE Gymnasium mathematics (`Mathematik (Gymnasium, DE)`)
- scopes and anchors are checked independently:
  - Sek I `curricularAtomic` goals → `Warum Mathematik? – Entdecken, Muster & Alltag`
  - Sek II `curricularAtomic` goals → `Warum Mathematik? – Denken, Muster & Zukunft`
- selected nodes:
  - atomic goals with an authoritative `semanticKind=curricularAtomic` decision in the stage profile

Interpretation:

- This keeps the rule formulation general while still allowing rollout-specific route guarantees where the graph has already reached review-safe maturity.
- It is stronger than composition-view ordering alone: the learner-facing tree may start with the motivation node, but `GVR-011` additionally requires the authored graph semantics to reflect that anchor.
- Stage selection uses authored stage metadata; the anchor assignment is never pooled across Sek I and Sek II.

## Scoped full route coverage (`GVR-012`)

`GVR-012` is intentionally phrased as a reusable validator pattern, not as a one-off landscape exception.

Rule semantics:

- a validator profile declares:
  - one target landscape
  - one scoped goal selector
  - one or more motivation anchor goals
  - one or more terminal autonomy goals
- the semantic-kind ledger must provide authoritative goal classifications
- the semantic-kind ledger must classify every canonical goal exactly once; missing, duplicate, unsupported, or stale decisions fail rather than shrinking the checked set
- every `curricularAtomic` goal must belong to at least one explicit Sek-I/Sek-II route profile; missing stage membership cannot silently remove it from coverage
- the configured anchor must be atomic, prerequisite-free, and classified as `orientation`
- every configured terminal leaf must be atomic and classified as `practiceAssessment`
- every profile declares its complete stage-local proof-node scope; a Sek-I proof cannot pass through Sek-II goals and vice versa
- `GVR-012` fails if any selected `curricularAtomic` node has:
  - no transitive path to its stage-specific anchor using only direct atomic-to-atomic `requires`, or
  - no transitive path from itself to a configured stage-specific terminal using only those same direct atomic edges
- every configured terminal must itself have a direct atomic path back to the stage-specific anchor
- every proof-participating node may not carry direct prerequisites outside the allowed route node kinds; cluster-level and inherited/effective prerequisites neither count as proof nor survive as additional hidden shortcuts
- only `orientation`, `curricularAtomic`, optional `memory`, and `practiceAssessment` nodes may prove a hard route; program structure, curricular-area clusters, and runtime-support nodes cannot be used as didactic shortcuts
- a `practiceAssessment` node cannot be used as a prerequisite before curricular learning; every terminal route must pass through at least one ordinary `curricularAtomic` goal
- a `memory` node counts as a route intermediate only after at least one ordinary `curricularAtomic` goal; it cannot replace the curricular learning segment
- semantic kinds and graph shape must agree: `orientation`, `curricularAtomic`, and `memory` are atomic; `curricularArea`, `programStructure`, and `runtimeSupport` are clusters; `practiceAssessment` may classify either a terminal folder or one of its atomic tasks

Current active profiles:

- landscape: canonical DE Gymnasium mathematics (`Mathematik (Gymnasium, DE)`)
- Sek I:
  - motivation anchor: `Warum Mathematik? – Entdecken, Muster & Alltag`
  - terminal autonomy goals: the individual exam-task nodes under `Prüfungen Jahrgangsstufe 5` through `Prüfungen Jahrgangsstufe 10`
- Sek II:
  - motivation anchor: `Warum Mathematik? – Denken, Muster & Zukunft`
  - terminal autonomy goals: the atomic goals below `Übungen E-Phase`, `Übungen Q1` through `Übungen Q4`, and `Übungen Prozesskompetenzen`
- learner-facing year autonomy: each Sek-I year scope must expose a `Prüfungen Jahrgangsstufe <n>` folder inside the respective year/year-band structure, with individual exam-task nodes below it. A separate global `Sek-I-Abschlussaufgaben Mathematik` capstone is not part of the learner-facing route.
- rollout boundary: this year-autonomy rule is currently normative for canonical Gymnasium mathematics. Other Sek-I subjects or school forms should opt in only after their composition views and assessment semantics have been reviewed.
- selected nodes: stage-matching atomic goals with authoritative `semanticKind=curricularAtomic`

Interpretation:

- `GVR-012` is a hard release invariant for these reviewed scopes. `VALIDATE_GRAPH_STRICT_RULES=0` does not downgrade it.
- It proves route coverage on the direct atomic prerequisite layer. Effective cluster inheritance is deliberately insufficient.
- The proof graph is stage-local. Cross-stage prerequisites may remain explicit support requirements, but they cannot be used to manufacture the stage's motivation-to-terminal proof.
- Memory nodes are optional support nodes, not mandatory route checkpoints. They remain governed by the separate memory-card review. Making every exam depend on a memory deck would incorrectly make memorization compulsory.
- A reviewed memory node may occur inside a direct route and then counts as part of that route. Memory nodes that are not route prerequisites remain optional side support and are traced by `CQR-302`, rather than being forced into every assessment chain.
- Canonical route coverage alone does not certify a narrower learner-facing composition view. Every direct prerequisite of a visible target must also be present in that projection as `target` or explicitly authored `prerequisiteOnly`; the runtime blocks a target when a direct canonical prerequisite is absent. The reviewed Hessen Sek-II mathematics LK view has a complete-closure regression for this contract.
- For canonical Gymnasium mathematics Sek I, the terminal autonomy endpoints are the individual year-level exam tasks. Do not reintroduce a separate `Sek-I-Abschlussaufgaben Mathematik` capstone or expose an aggregate `Übungen Sekundarstufe I` learner-facing branch as the ordinary route endpoint.
- Sek-I mathematics exam tasks should use coherent, age-appropriate contexts that carry the mathematics. Avoid copied umbrella scenarios and keep each task's `requires` / `examData.coveredGoalIds` aligned with the goals actually assessed.
- Prefer a low-floor/high-ceiling task shape: accessible data or representations first, then an explanation, checking, model-limit, or short reasoning prompt appropriate to the year.
- This keeps the rule formulation general while allowing strict CI protection once a concrete rollout scope has explicit motivation and terminal-autonomy anchors.

## Motivation/orientation structure (`GVR-014`)

`GVR-014` protects motivation nodes globally as pure entry anchors rather than
content assessments. An authoritative `semanticKind` takes precedence; only
when it is absent do the explicit legacy tags `Motivation` or `Orientation`
identify such a node. Every identified node must be atomic and
prerequisite-free. It must not carry `examData`, `examples`, an `exam` or
`memory` node kind, SRS/memorization tags, or assessment/practice tags. The
rule is always an error, including when older graph rules temporarily run in
warning mode.

This structural gate prevents a motivation node from encoding a hard content
check. Its didactic purpose is to show possibilities, relevance, and positive
perspectives that invite the learner into the following subject matter; it is
not evidence that detailed subject knowledge is already present.

## Reviewed orientation outlook integrity (`GVR-015`)

`GVR-015` protects the authored learner-facing map attached to both canonical
Gymnasium mathematics orientation anchors. Each outlook must contain two to
four bounded bilingual paths. The anchor must be authoritatively classified as
`orientation`. Every referenced subtree root, entry goal, and milestone must exist in the
same canonical landscape and in the anchor's explicit stage scope. Subtree
roots must be non-atomic `curricularArea` nodes; entries and milestones must be
atomic `curricularAtomic` goals. Each bounded `entryGoalIds` allowlist must be
contained in the respective path and each entry must directly require the
orientation anchor. Runtime path activation uses only this build-validated
allowlist; `milestoneGoalIds` remain learner-facing outlook content and never
become transition authorization.

The two graph proofs are deliberately separate. Authored `contains` edges prove
only that an entry or milestone belongs to one of the path's reviewed fachliche subtrees.
Downstream sequencing is proved independently through direct `requires` edges
whose endpoints are the stage anchor or in-stage atomic `curricularAtomic`
goals. Cluster-level `requires`, inherited prerequisites, program structure,
memory, assessment, and runtime-support nodes cannot serve as shortcuts in this
proof.

The rule also rejects internal authoring-process terms such as
`Source-Extraction` in learner-facing path or subtree titles. This keeps the
reviewed orientation map deterministic and prevents stale IDs, detached
milestones, or technical maintenance labels from silently reaching the coach.

`GVR-015` validates the canonical authored map and intentionally does not claim
that every referenced goal is a `target` in every jurisdiction/course-profile
composition view. At runtime the coach outlook is intersected fail-closed with
the learner's resolved `targetGoalIds`; goals visible only as
`prerequisiteOnly` are excluded, and a path without a valid target entry or a
valid target milestone is omitted. Transition selection uses the complete
personalized frontier rather than the compact display options. It activates a
reviewed path entry only when that entry is currently available. If none is
available, orientation completion still succeeds, no active goal is set, and
the ordinary available foundations are returned.

## Scoped atomic direct requires (`GVR-013`)

`GVR-013` closes the gap between effective route coverage and canonical route authoring.

Rule semantics:

- a validator profile declares:
  - one target landscape
  - one scoped atomic goal selector
- for every selected atomic goal, every direct local `requires` edge must point to another atomic goal.
- direct `requires` edges to cluster goals fail the check, because they make the route depend on implicit cluster expansion and can create misleading root nodes in requires-flow visualizations.

Current active profile:

- landscape: canonical DE Gymnasium mathematics (`Mathematik (Gymnasium, DE)`)
- scope: all non-memory atomic goals
- selected nodes:
  - every atomic goal in the canonical mathematics landscape except memory/SRS goals

Interpretation:

- A cluster may still be used for navigation through `contains`, but not as a direct prerequisite target inside this reviewed route scope.
- The rule is deliberately narrower than a repository-wide ban, because older landscapes still use the compatibility model. New mature scopes should add their own `GVR-013` profile before being marked route-stable.

## Motivation-anchor rollout rules (`GVR-004`, `GVR-005`)

- Scope is controlled in `app/scripts/validateGraph.ts` via `motivationRuleLandscapeIds`.
- Current rollout scope: Hessen Gymnasiale Oberstufe subject landscapes (`DE_HES_S_GYM_2_*`) excluding `DE_HES_S_GYM_2_OVERVIEW`.

These rules are intentionally a compatibility rollout, not yet the full mature route-coverage model.

Validation semantics:

- Atomic node detection:
  - concept-level canonical meaning: a node is atomic iff `contains.length === 0`
  - current validator implementation uses that canonical leaf/non-leaf definition
  - if explicit `type` metadata is present, `GVR-009` additionally enforces consistency with that canonical classification
- Motivation anchor detection:
  - first atomic node title must start with `Warum` or `Why` (case-insensitive)
- `GVR-004` fails if:
  - landscape has no atomic nodes, or
  - first atomic node is not a motivation node
- `GVR-005` fails if:
  - any atomic node except the first motivation node has no transitive path to that anchor in the effective-requires graph

Effective-requires graph means:

- direct `requires`
- plus inherited `requires` from `contains` ancestors
- then transitive reachability over these effective edges

Interpretation of current coverage strength:

- `GVR-004` / `GVR-005` ensure that each checked atomic node is connected back to a motivation anchor
- they do **not** yet ensure that the node also lies on a path toward one or more terminal autonomy goals
- they do **not** yet prove that the didactic route is modeled canonically on the atomic `requires` layer

## Hard atomic route-quality validation

The stricter direction is implemented as `GVR-012` for canonical DE Gymnasium mathematics Sek I and Sek II.

Target semantics for mature landscapes:

- route coverage should be defined primarily on the atomic direct-prerequisite graph (`R_d` on atomic goals), not on inherited `R_eff`
- a landscape or route-group may have one or more motivation anchors; a single global anchor is not required if the content structure suggests otherwise
- a landscape will often have multiple terminal autonomy goals, typically authentic independent performances such as exam tasks or other capstones
- every selected `curricularAtomic` goal must lie on at least one didactic path from its stage-specific motivation anchor to a terminal autonomy goal
- explicitly excluded support-only atomic goals (concept-spec set `E_route`, e.g. memorization-only helper nodes) require a machine-readable profile convention before they can be validated generically in CI

Rollout strategy:

- keep `GVR-004` / `GVR-005` as migration-compatible checks on `R_eff`
- use `GVR-012` only after a scope has reviewed semantic kinds, anchors, and terminal sets
- keep other landscapes on migration-compatible checks until they receive an explicit hard profile
- never pool stage anchors merely to make a disconnected route pass

## Immediate implications from the updated concept spec

The recent updates in `docs/concept/skill-graph/graph-definition.md` do **not** imply that every newly clarified concept should become a CI graph rule immediately.

### Already implemented structural alignment

- **`GVR-009`: explicit node-type consistency**  
  If a goal stores explicit `type` metadata, it must match the canonical concept-spec classification:
  - `atomic` iff `contains.length === 0`
  - `cluster` iff `contains.length > 0`

### Not suitable as graph-only CI rules yet

- **Atomic mastery / cluster satisfaction semantics**  
  These are learner-state/runtime semantics, not static graph invariants.
- **Optimistic / pessimistic filter frontier semantics**  
  These describe scoped runtime evaluation, not a property of a landscape JSON in isolation.
- **Applicability-backed filtered learner graphs**  
  These can become a CI target, but only as a projection validator that first materializes filtered graphs from compiled `applicability` and then validates those projected graphs.

## Planned filter-graph validation layer (not yet implemented in CI)

The concept spec now makes an important distinction:

- raw landscape validation on the full authored graph
- projected filtered-graph validation on learner-facing scoped views

The current `validate:graph` command covers only the first category.

Planned future addition:

- a separate validator, tentatively `validate:view-filters`
- input:
  - committed canonical landscapes
  - compiled `applicability` metadata
  - supported filter dimensions / vocabularies
- validation unit:
  - projected filtered graphs such as `G[jurisdiction = DE-HE]`
  - later, if needed, selected multi-dimensional combinations

## Auxiliary archive-boundary validator

This is a separate retained-asset hygiene gate, not a `GVR-*` or `APV-*` rule family.

Purpose:

- keep the Hessen upper-secondary DE-level archive operationally detached from live legacy repo paths
- allow remaining `Gymnasiale_Oberstufe` path strings only inside explicitly allowlisted raw archival provenance files

Implementation and data source:

- validator: `scripts/validate_hessen_upper_secondary_archive_paths.py`
- allowlist and archive root: `curricula/DE/Gymnasium/input/HE/retained-asset-registry.json`

Current CI semantics:

- scans `curricula/DE/Gymnasium/input/HE/abi`
- fails if a legacy `Gymnasiale_Oberstufe` path string appears outside the allowlisted raw-provenance files
- keeps machine-readable ABI metadata and repo-authored archive docs on the normalized DE-level archive path

## Auxiliary legacy-reference validator

This is the repo-level handoff gate for the retired Hessen upper-secondary legacy tree.

Purpose:

- keep active tooling/runtime/test surfaces detached from the retired legacy tree
- keep the old tree absent from the active repo after the delete handoff
- make the remaining allowed references explicit as the surviving provenance/handoff boundary

Implementation and data source:

- validator: `scripts/validate_hessen_upper_secondary_legacy_refs.py`
- scan roots, exclusions, and allowlist: `curricula/DE/Gymnasium/provenance/hessen-upper-secondary-retirement-registry.json`

Current CI semantics:

- scans active repo surfaces (`backend/src`, `app`, `scripts`, DE-level provenance/input lanes, `docs`, selected root helpers)
- `docs` is in scope so documentation cannot quietly reintroduce the retired tree as a live reference; the allowlist covers only the dated migration records and the pages that describe this gate
- ignores the already-separated raw ABI archive scope under `curricula/DE/Gymnasium/input/HE/abi/**`
- fails if a `Gymnasiale_Oberstufe` tree reference appears outside the explicit handoff allowlist

Expected rule family for that validator:

- `APV-*` for applicability and projected-view validation

Planned validation focus:

- malformed compiled applicability metadata
- empty visible clusters in a projected filtered graph
- visible goals with invisible prerequisites in a projected filtered graph
- visible goals not reachable from the filtered root through visible `contains` edges

This layer is intentionally documented here already so CI semantics stay aligned with the concept spec, even before the implementation lands.

### Future-rule prerequisites before rollout

- **Route-exclusion support set (`E_route`)**  
  The concept spec now allows explicit support-only atomic exceptions (for example memory-only helper nodes), but a generic CI rule should only be introduced once there is a stable machine-readable convention for identifying those nodes across landscapes.

Reference implementations already curated:

- Physics landscape file: `curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/DE_HES_S_GYM_2_PHYSIK.de.json.snapshot`
  - subtree: `Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen`
  - benchmark value:
    - no cluster-level `requires` inside the subtree
    - every non-memory atomic goal in the subtree has at least one direct atomic prerequisite path back to the motivation anchor
    - every non-memory atomic goal in the subtree also lies on at least one atomic path toward terminal autonomy goals under `Übungen E-Phase`
    - the single memorization node in that subtree is explicitly typed as `nodeKind: "memory"` and is therefore a documented exception rather than an ambiguous leaf

- Mathematics landscape file: `curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/DE_HES_S_GYM_2_MATHEMATIK.de.json.snapshot`
  - scope: ordinary phases `E`, `Q1`, `Q2`, `Q3`, `Q4` plus `Übungen Prozesskompetenzen`
  - benchmark value:
    - all local phase-autonomy branches (`Übungen E-Phase`, `Übungen Q1`, `Übungen Q2`, `Übungen Q3`, `Übungen Q4`) and the global process-competency branch contain only atomic terminal goals
    - all of these terminal goals are exam-mode-capable via concrete `examData`
    - outside the intentionally separate global Abitur containers, the landscape does not rely on cluster-level `requires` for ordinary didactic sequencing
    - the two remaining cluster-level `requires` belong only to the dedicated global Abitur containers and are therefore not the model for ordinary route-quality validation

This means future strict route-quality rules can use both a subtree benchmark (Physics E-phase) and a whole-landscape benchmark (Mathematics upper secondary) during rollout, even before new stable `GVR-*` IDs are introduced for the stricter atomic route model.

## Direct-child prerequisite rule (`GVR-006`)

- Scope is controlled in `app/scripts/validateGraph.ts` via `noDirectChildRequireRuleLandscapeIds`.
- Current rollout scope: Hessen Gymnasiale Oberstufe subject landscapes (`DE_HES_S_GYM_2_*`) including `DE_HES_S_GYM_2_OVERVIEW`.
- Current issue level: follows global `GVR-*` strictness (`error` by default, `warn` with `VALIDATE_GRAPH_STRICT_RULES=0`).

Validation semantics:

- For a goal `A`, collect direct local `contains` children.
- If any direct local `requires` target is also in that direct child set, emit `GVR-006`.

## MIT OCW source-linking rule (`GVR-007`)

- Scope: landscapes with top-level `frameworkId` starting with `mit-ocw-` and a root node tagged `module:*` (or `modul:*`).
- Current issue level: follows global `GVR-*` strictness (`error` by default, `warn` with `VALIDATE_GRAPH_STRICT_RULES=0`).

Validation semantics for each atomic goal:

- canonical `resourceLinks` must exist and include at least one link of type:
  - `concept`
  - `practice`
  - `assessment`
- Required source-link types must include at least one valid OCW course URL (`https://ocw.mit.edu/courses/...`).

## Canonical goal-level link field rule (`GVR-008`)

- Scope: all committed landscape JSON files validated in CI.
- Current issue level: follows global `GVR-*` strictness (`error` by default, `warn` with `VALIDATE_GRAPH_STRICT_RULES=0`).

Validation semantics:

- if a goal contains unsupported legacy goal-level link metadata, emit `GVR-008`
- the canonical supported field is top-level `resourceLinks`

Interpretation:

- unsupported goal-level link metadata is rejected by CI and ignored by runtime link rendering
- committed landscape files in this repository should store helper links only in canonical `resourceLinks`

## Explicit node-type consistency rule (`GVR-009`)

- Scope: all committed landscape JSON files validated in CI.
- Current issue level: follows global `GVR-*` strictness (`error` by default, `warn` with `VALIDATE_GRAPH_STRICT_RULES=0`).

Validation semantics:

- canonical node classification is derived structurally:
  - `atomic` iff `contains.length === 0`
  - `cluster` iff `contains.length > 0`
- if a goal explicitly stores `type: "atomic"` but is structurally non-leaf, emit `GVR-009`
- if a goal explicitly stores `type: "cluster"` but is structurally a leaf, emit `GVR-009`

Interpretation:

- explicit `type` metadata is optional
- if present, it is a redundant declaration and must agree with the canonical graph structure
