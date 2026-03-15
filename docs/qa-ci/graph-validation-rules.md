# Graph Validation Rules

This is the single source of truth for algorithmic graph validation in CI.

- Validator implementation: `app/scripts/validateGraph.ts`
- CI entrypoint: `npm run validate:graph` in `.github/workflows/ci.yml` (`graph-validation` job)
- Filter-projection validator: `app/scripts/validateViewFilters.ts`
- Filter-projection CI entrypoint: `npm run validate:view-filters` in `.github/workflows/ci.yml` (`graph-validation` job)
- Hessen Oberstufe archive-boundary validator: `scripts/validate_hessen_upper_secondary_archive_paths.py`
- Archive-boundary CI entrypoint: `python scripts/validate_hessen_upper_secondary_archive_paths.py` in `.github/workflows/ci.yml` (`graph-validation` job)
- Hessen Oberstufe legacy-reference validator: `scripts/validate_hessen_upper_secondary_legacy_refs.py`
- Legacy-reference CI entrypoint: `python scripts/validate_hessen_upper_secondary_legacy_refs.py` in `.github/workflows/ci.yml` (`graph-validation` job)
- The legacy-reference validator also enforces post-retirement absence of the old `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe` tree; only allowlisted provenance/handoff files may still mention that path textually.
- Hessen Sek-I archive-boundary validator: `scripts/validate_hessen_lower_secondary_archive_paths.py`
- Archive-boundary CI entrypoint: `python scripts/validate_hessen_lower_secondary_archive_paths.py` in `.github/workflows/ci.yml` (`graph-validation` job)
- Hessen Sek-I legacy-reference validator: `scripts/validate_hessen_lower_secondary_legacy_refs.py`
- Legacy-reference CI entrypoint: `python scripts/validate_hessen_lower_secondary_legacy_refs.py` in `.github/workflows/ci.yml` (`graph-validation` job)
- The lower-secondary legacy-reference validator fences repo references to `curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe` to the explicit delete-handoff allowlist until the final repo-side remove is executed.

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
| `GVR-009` | If explicit `type` metadata is present, it must match the canonical node classification derived from direct `contains` children (`atomic` iff leaf, `cluster` iff non-leaf). | Local landscape | `error` |

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
- Learner-state semantics from the concept spec such as atomic mastery, frontier computation, and optimistic/pessimistic filter evaluation are currently **not** validated in CI.
- Projected filtered learner graphs derived from compiled `applicability` are now validated by the separate `validate:view-filters` path.
- The current CI enforcement scope for `validate:view-filters` covers the reviewed canonical DE Gymnasium set (`Mathematik`, `Physik`, `Chemie`, `Biologie`, `Informatik`, `Deutsch`, `Englisch`, `Französisch`, `Griechisch`, `Chinesisch`, `Geschichte`, `Politik und Wirtschaft`, `Musik`, `Latein`, `Spanisch`, `Wirtschaft`, `Overview`).
- Reviewed applicability warnings can be recorded in `docs/qa-ci/applicability-accepted-warnings.json`; the validator still prints them, but classifies them as accepted review debt instead of active warnings.
- Additional structural rules should be added here first, then implemented in `validateGraph.ts`, then rolled out in CI.

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
| `APV-201` | An explicit `extendedData.applicabilityOverrides` path is used. | `warning` |
| `APV-202` | Applicability is backed only by `partial` mappings. | `warning` |
| `APV-203` | Compiled applicability differs from currently committed applicability metadata. | `warning` |

Accepted-warning handling:

- `APV-201` and `APV-202` may remain in reviewed pilots when no cleaner exact source alignment exists yet.
- Such cases must be explicitly listed in `docs/qa-ci/applicability-accepted-warnings.json` with a short rationale.
- `validate:view-filters` continues to print these findings for auditability, but separates them from active warnings in its summary output.

## Current compatibility model vs. target model

The current CI validator still operates on the compatibility model used by the existing runtime and landscapes:

- direct `requires` may be authored on atomic or cluster goals
- effective prerequisites are computed by inheriting `requires` from `contains` ancestors
- rollout rules such as `GVR-004` / `GVR-005` validate motivation connectivity in that effective graph

The conceptual target model described in `docs/concept/curriculum-graph/graph-definition.md` is stricter:

- the canonical didactic sequencing layer should primarily be authored on atomic goals
- atomic/cluster semantics are defined canonically by the direct `contains` relation (leaf = atomic, non-leaf = cluster)
- cluster-level dependency views should preferably be derived from atomic descendants
- mature route-quality checks should eventually validate atomic didactic routes from motivation anchors to terminal autonomy goals
- progression semantics in the concept doc are defined via atomic mastery and derived cluster satisfaction, but this is not yet a CI validation target

Until the validator and landscapes are migrated, this file distinguishes clearly between:

- rules that are implemented today and have stable `GVR-*` IDs
- planned future direction that is not yet implemented in CI and therefore has no stable rule IDs here

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

## Planned direction for route-quality validation (not yet implemented in CI)

The following direction is planned but currently has no stable validator rule IDs in this file.

Target semantics for mature landscapes:

- route coverage should be defined primarily on the atomic direct-prerequisite graph (`R_d` on atomic goals), not on inherited `R_eff`
- a landscape or route-group may have one or more motivation anchors; a single global anchor is not required if the content structure suggests otherwise
- a landscape will often have multiple terminal autonomy goals, typically authentic independent performances such as exam tasks or other capstones
- every route-relevant atomic goal should ideally lie on at least one didactic path from a motivation anchor to a terminal autonomy goal
- explicitly excluded support-only atomic goals (concept-spec set `E_route`, e.g. memorization-only helper nodes) require a machine-readable profile convention before they can be validated generically in CI

Recommended rollout strategy:

- keep `GVR-004` / `GVR-005` as migration-compatible checks on `R_eff`
- later add stricter route-quality rules on the atomic graph
- treat full atomic route coverage as `SHOULD` at concept level first, then promote it to `MUST` only for mature rollout subsets or strict validator profiles

## Immediate implications from the updated concept spec

The recent updates in `docs/concept/curriculum-graph/graph-definition.md` do **not** imply that every newly clarified concept should become a CI graph rule immediately.

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
- allowlist and archive root: `curricula/DE/Gymnasium/input/DE-HE/retained-asset-registry.json`

Current CI semantics:

- scans `curricula/DE/Gymnasium/input/DE-HE/abi`
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

- scans active repo surfaces (`backend/src`, `app`, `scripts`, DE-level provenance/input lanes, selected root helpers)
- ignores the already-separated raw ABI archive scope under `curricula/DE/Gymnasium/input/DE-HE/abi/**`
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

- Physics landscape file: `curricula/DE/Gymnasium/input/DE-HE/upper-secondary/source-json/DE_HES_S_GYM_2_PHYSIK.de.json.snapshot`
  - subtree: `Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen`
  - benchmark value:
    - no cluster-level `requires` inside the subtree
    - every non-memory atomic goal in the subtree has at least one direct atomic prerequisite path back to the motivation anchor
    - every non-memory atomic goal in the subtree also lies on at least one atomic path toward terminal autonomy goals under `Übungen E-Phase`
    - the single memorization node in that subtree is explicitly typed as `nodeKind: "memory"` and is therefore a documented exception rather than an ambiguous leaf

- Mathematics landscape file: `curricula/DE/Gymnasium/input/DE-HE/upper-secondary/source-json/DE_HES_S_GYM_2_MATHEMATIK.de.json.snapshot`
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
