# Graph Validation Rules

This is the single source of truth for algorithmic graph validation in CI.

- Validator implementation: `app/scripts/validateGraph.ts`
- CI entrypoint: `npm run validate:graph` in `.github/workflows/ci.yml` (`graph-validation` job)

## Enforcement profiles

- `default`:
  - structural/data integrity rules are `error` (fail build)
  - `GVR-*` rules are also `error` (strict by default)
- `legacy-warn` (temporary migration mode):
  - enable with `VALIDATE_GRAPH_STRICT_RULES=0`
  - `GVR-*` are downgraded to `warn`

## Rules currently emitted with stable IDs

| Rule ID | Description | Scope | Default |
| --- | --- | --- | --- |
| `GVR-001` | A goal must not directly require one of its `contains` ancestors. | Local landscape | `error` |
| `GVR-002` | Phase monotonicity: effective prerequisites must not point to later phases for comparable phase systems (`E`, `Q1..Q4`, `Abitur`, `S*`, `J*`). | Local landscape | `error` |
| `GVR-003` | A goal must not directly require its direct `contains` parent (most frequent deadlock source). | Local landscape | `error` |
| `GVR-004` | First atomic node must be a motivation anchor (`Warum`/`Why`). | Rollout subset (`DE_HES_S_GYM_2_*`, excluding `OVERVIEW`) | `error` |
| `GVR-005` | Every atomic node must have a transitive path to the motivation anchor via effective `requires`. | Rollout subset (`DE_HES_S_GYM_2_*`, excluding `OVERVIEW`) | `error` |
| `GVR-006` | A goal must not directly require one of its direct `contains` children (inverse anti-pattern of `GVR-003`). | Rollout subset (`DE_HES_S_GYM_2_*`, including `OVERVIEW`) | `error` |
| `GVR-007` | MIT OCW module atomic goals must include intensive source-link coverage (`concept` + `practice` + `assessment`) in canonical `resourceLinks`. | MIT OCW module landscapes (`frameworkId` starts with `mit-ocw-` and root tagged `module:*`) | `error` |
| `GVR-008` | Committed landscape goals must use canonical `resourceLinks` as the only supported goal-level helper-link field. | Local landscape | `error` |

## Core validator checks (always active, fail CI)

These checks are already implemented and treated as `error`:

- JSON parsing and landscape loading
- Goal ID uniqueness inside a landscape
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
- Additional structural rules should be added here first, then implemented in `validateGraph.ts`, then rolled out in CI.

## Current compatibility model vs. target model

The current CI validator still operates on the compatibility model used by the existing runtime and landscapes:

- direct `requires` may be authored on atomic or cluster goals
- effective prerequisites are computed by inheriting `requires` from `contains` ancestors
- rollout rules such as `GVR-004` / `GVR-005` validate motivation connectivity in that effective graph

The conceptual target model described in `docs/concept/curriculum-graph/graph-definition.md` is stricter:

- the canonical didactic sequencing layer should primarily be authored on atomic goals
- cluster-level dependency views should preferably be derived from atomic descendants
- mature route-quality checks should eventually validate atomic didactic routes from motivation anchors to terminal autonomy goals

Until the validator and landscapes are migrated, this file distinguishes clearly between:

- rules that are implemented today and have stable `GVR-*` IDs
- planned future direction that is not yet implemented in CI and therefore has no stable rule IDs here

## Motivation-anchor rollout rules (`GVR-004`, `GVR-005`)

- Scope is controlled in `app/scripts/validateGraph.ts` via `motivationRuleLandscapeIds`.
- Current rollout scope: Hessen Gymnasiale Oberstufe subject landscapes (`DE_HES_S_GYM_2_*`) excluding `DE_HES_S_GYM_2_OVERVIEW`.

These rules are intentionally a compatibility rollout, not yet the full mature route-coverage model.

Validation semantics:

- Atomic node detection:
  - `type === "atomic"` if explicitly set
  - otherwise fallback: `contains.length === 0`
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

## Planned direction for route-quality validation (not yet implemented in CI)

The following direction is planned but currently has no stable validator rule IDs in this file.

Target semantics for mature landscapes:

- route coverage should be defined primarily on the atomic direct-prerequisite graph (`R_d` on atomic goals), not on inherited `R_eff`
- a landscape or route-group may have one or more motivation anchors; a single global anchor is not required if the content structure suggests otherwise
- a landscape will often have multiple terminal autonomy goals, typically authentic independent performances such as exam tasks or other capstones
- every atomic goal should ideally lie on at least one didactic path from a motivation anchor to a terminal autonomy goal

Recommended rollout strategy:

- keep `GVR-004` / `GVR-005` as migration-compatible checks on `R_eff`
- later add stricter route-quality rules on the atomic graph
- treat full atomic route coverage as `SHOULD` at concept level first, then promote it to `MUST` only for mature rollout subsets or strict validator profiles

Reference implementation already curated:

- Physics landscape file: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_PHYSIK.de.json`
- subtree: `Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen`

This subtree is a useful QA benchmark for the stricter target model because:

- it no longer uses cluster-level `requires` inside the subtree,
- every non-memory atomic goal in the subtree has at least one direct atomic prerequisite path back to the motivation anchor,
- every non-memory atomic goal in the subtree also lies on at least one atomic path toward terminal autonomy goals under `Übungen E-Phase`,
- the single memorization node in that subtree is explicitly typed as `nodeKind: "memory"` and is therefore a documented exception rather than an ambiguous leaf.

This means future strict route-quality rules can use this subtree as a practical benchmark during rollout, even before new stable `GVR-*` IDs are introduced for the stricter atomic route model.

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
