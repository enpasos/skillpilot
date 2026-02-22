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

## Motivation-anchor rollout rules (`GVR-004`, `GVR-005`)

- Scope is controlled in `app/scripts/validateGraph.ts` via `motivationRuleLandscapeIds`.
- Current rollout scope: Hessen Gymnasiale Oberstufe subject landscapes (`DE_HES_S_GYM_2_*`) excluding `DE_HES_S_GYM_2_OVERVIEW`.

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
