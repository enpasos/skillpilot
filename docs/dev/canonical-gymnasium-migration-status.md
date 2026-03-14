# Canonical Gymnasium Migration Status

This document tracks the migration progress from legacy Gymnasium source trees into the DE-level canonical layer.

Assumption for this document:

- "existing repos" means the legacy curriculum source trees that are still operationally relevant inside this monorepo.
- The main trees in scope today are:
  - `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe`
  - `curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe`
  - `curricula/DE/BY/Gymnasium`

This document is intentionally stricter than the rollout plan:

- `100%` means the old legacy source trees are no longer needed for runtime/operations and can be deleted from the active repo.

## Progress model

The existing rollout states remain the operational backbone:

- `legacy_frozen`
- `subtree_adopted`
- `cutover_ready`
- `legacy_view_retained`

For program tracking, we assign a score to each tracked migration unit:

| State | Score | Meaning |
| --- | ---: | --- |
| `legacy_frozen` | 0% | Legacy subtree is still authoritative source only |
| `subtree_adopted` | 50% | Canonical subtree + mappings exist, but operational switch is not yet low-risk |
| `cutover_ready` | 75% | Runtime projection and learner cutover are good enough for operational migration |
| `legacy_view_retained` | 90% | Canonical is preferred, legacy still exists only as compatibility view |
| `legacy_deleted` | 100% | Legacy source tree is no longer needed and has been removed from the active repo |

Important interpretation:

- `legacy_view_retained` is deliberately not `100%`.
- We only call the program `100%` when the old trees are actually removable.

## Snapshot 2026-03-14

Observed repo state:

- Canonical DE Gymnasium files present: `17`
  - `1` overview
  - `16` subject files
- Hessen upper-secondary mapping files present: `16`
- Hessen Sek I mapping files present: `4`
- Bavaria Gymnasium pilot mapping files present: `2`
- Explicit learner cutover path to `Gymnasium (DE)` exists in backend and UI
- Bulk cutover path for operators exists
- Canonical state filtering still relies on transitional runtime derivation from mappings/provenance; compiled node-level `applicability` metadata is not implemented yet
- No tracked subtree has reached `legacy_view_retained` yet
- No legacy source tree has been deleted yet

## Input transfer lane

Deleting old legacy source trees requires more than canonical JSON plus mappings.

We also need a migration lane for the legacy source inputs, especially:

- `input/` source material used to derive goals
- `abi/` state-specific exam and release material
- any still-needed references that are currently only reachable through legacy paths

Rule:

- canonical DE landscapes stay shared and non-state-specific
- transferred source inputs must stay explicitly state-scoped
- the same state-scoped rule applies to retained non-canonical materials beyond pure `input/`, with `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi` as the clearest current example

Recommended target structure:

```text
curricula/DE/Gymnasium/input/
  DE-HE/
    upper-secondary/
    lower-secondary/
    abi/
  DE-BY/
    gymnasium/
    abi/
```

Practical meaning:

- the canonical graph lives once under `curricula/DE/Gymnasium/canonical/`
- the imported source/input material is separated by Bundesland under `curricula/DE/Gymnasium/input/<STATE>/...`
- provenance and `sourceRef` should continue to point to a state-distinguishable source path
- the lane-by-lane transfer inventory is tracked in `curricula/DE/Gymnasium/input/transfer-manifest.md`
- `abi/` is therefore not treated as a one-off exception, but as part of the general state-scoped retained-asset policy

Current status of this lane:

- the target archive scaffold now exists under `curricula/DE/Gymnasium/input/`
- the Hessen non-abi input batches have been transferred into that archive
- a first Hessen `abi/` small-subject batch has been transferred into that archive
- the Hessen `abi/Physik` bulk has now also been transferred into that archive
- the Hessen `abi/Mathe` bulk has now also been transferred into that archive
- the Bavaria subject-source snapshot has now also been transferred into that archive
- the optional Bavaria `abi/` lane is still undecided and remains out of the current mandatory scope
- therefore the currently known mandatory transfer scope is now mirrored; the only open question is whether a Bavaria `abi/` lane ever becomes part of scope
- for Sek I normalization, the current canonical planning target is a shared G9-aligned year-level grid `5-10`; source-side `G8` / `G9` distinctions remain preserved in provenance and archived inputs

### Initial input inventory

| State lane | Current source location | Current form | Observed size | Migrated into DE archive | Planned target |
| --- | --- | --- | ---: | ---: | --- |
| `DE-HE` upper-secondary input | `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/input/` | source PDFs + references | `24` files | `24` files | `curricula/DE/Gymnasium/input/DE-HE/upper-secondary/` |
| `DE-HE` upper-secondary abi | `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/` | exam/release assets by subject | `2130` files | `2130` files | `curricula/DE/Gymnasium/input/DE-HE/abi/` |
| `DE-HE` lower-secondary input | `curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe/input/` | source PDFs + references | `20` files | `20` files | `curricula/DE/Gymnasium/input/DE-HE/lower-secondary/` |
| `DE-BY` gymnasium source lane | `curricula/DE/BY/Gymnasium/` | subject JSON source set, no dedicated `input/` tree yet | `45` subject JSON files | `45` files | `curricula/DE/Gymnasium/input/DE-BY/gymnasium/` |
| `DE-BY` abi lane | not yet present as dedicated canonical migration input lane | reserved | `0` migrated files | `0` files | `curricula/DE/Gymnasium/input/DE-BY/abi/` |

Interpretation:

- transferred-file counts ignore `.gitkeep` placeholders in not-yet-filled target directories
- Hessen already has explicit source/input and abi trees that can be moved lane by lane.
- Bavaria now has a first DE-level separated source snapshot archive, but not yet a dedicated exam lane.
- The lower-secondary migration target is currently year-level based, not duration-track based: canonical Sek I should first align to G9-style year buckets `5-10`.
- The archive scaffold is now in place, and the first HE/BY transfer batches have happened.
- The currently known mandatory transfer scope is fully mirrored.
- The only remaining lane question is whether Bavaria exam assets must later be added to scope.

Input-lane proxy score:

```text
known files in scope = 24 + 2130 + 20 + 45 = 2219
transferred so far   = 24 + 20 + 45 + 2130 = 2219
proxy score          = 2219 / 2219 = 100.00%
```

Working input-transfer score:

- `100%`

## Current tracked migration units

The current tracked units are taken from:

- `docs/dev/canonical-gymnasium-implementation-plan.md`

Current unit list and status:

| Unit | Current state | Score |
| --- | --- | ---: |
| Mathematics function corridor | `cutover_ready` | 75% |
| Physics motion corridor | `cutover_ready` | 75% |
| Physics E.2 mechanics corridor | `cutover_ready` | 75% |
| Physics E.3 horizontal-projection slice | `cutover_ready` | 75% |
| Hessen Sek I physics mechanics bridge | `subtree_adopted` | 50% |
| Hessen Sek I chemistry foundations bridge | `subtree_adopted` | 50% |
| Hessen Sek I biology foundations/cell + photosynthesis-respiration bridge | `subtree_adopted` | 50% |
| Chemistry Hessen baseline | `subtree_adopted` | 50% |
| Biology Hessen baseline | `subtree_adopted` | 50% |
| Informatics Hessen baseline | `subtree_adopted` | 50% |
| History Hessen baseline | `subtree_adopted` | 50% |
| German Hessen baseline | `subtree_adopted` | 50% |
| Politics-and-Economics Hessen baseline | `subtree_adopted` | 50% |
| English Hessen baseline | `subtree_adopted` | 50% |
| French Hessen baseline | `subtree_adopted` | 50% |
| Latin Hessen baseline | `subtree_adopted` | 50% |
| Spanish Hessen baseline | `subtree_adopted` | 50% |
| Greek Hessen baseline | `subtree_adopted` | 50% |
| Chinese Hessen baseline | `subtree_adopted` | 50% |
| Music Hessen baseline | `subtree_adopted` | 50% |
| Economics Hessen baseline | `subtree_adopted` | 50% |

## Current program score

Tracked-unit calculation:

- `4` units at `75%`
- `17` units at `50%`

Formula:

```text
score = (4 * 75 + 17 * 50) / 21
      = 54.76%
```

Working program score:

- `55%`

Interpretation:

- The canonical DE layer is clearly beyond the initial pilot stage.
- We are not yet in the decommissioning stage.
- The program is currently in the middle of the migration, not near the end.

Input-lane interpretation:

- canonical graph migration is materially underway
- input/source transfer is complete for the currently known mandatory scope, but that does not by itself make any legacy tree deletable

## Repo-level deletion readiness

This table is intentionally conservative.

| Legacy source tree | Migration picture | Deletion readiness | Why not deletable yet |
| --- | --- | ---: | --- |
| `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe` | strong canonical mirror + mappings + first cutovers | 0% | legacy views are still active in UI/runtime, source tree still underpins mappings/provenance, and transfer completeness alone is not enough to remove the legacy tree |
| `curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe` | selected bridges adopted, but not broad cutover | 0% | only partial subtree adoption so far, despite a mirrored `DE-HE` lower-secondary input archive being in place |
| `curricula/DE/BY/Gymnasium` | pilot-only mapping coverage | 0% | the source snapshot is now mirrored under `DE-BY`, but broad canonical replacement and mapping migration are still missing |

Practical conclusion:

- The overall migration program is around `55%`.
- The input-transfer lane is at `100%` for the currently known mandatory scope.
- The deletion program is effectively still `0%`.

Both numbers can be true at the same time, because migration progress and deletion readiness are not the same thing.

## Conditions for 100%

We should only set the program to `100%` when all of the following are true:

1. Every tracked migration unit has reached at least `legacy_view_retained`.
2. New learners use the canonical DE root by default without needing legacy entry points.
3. Existing supported learners have a reliable bulk-cutover path and have been migrated where needed.
4. No runtime-critical API/UI flow still depends on the old legacy trees as active content sources.
5. Source inputs and exam material that must survive the migration have been transferred into a state-separated DE-level input archive.
6. Mappings and provenance needed for audit/history are either frozen elsewhere or no longer required.
7. The legacy source trees can be deleted from the active repo without breaking runtime behavior, QA, or rollback obligations.

Only after step 7 do we convert a unit or source tree from `90%` to `100%`.

## Recommended next planning move

Use this document together with the implementation plan:

- keep the implementation plan as the work-package and rollout narrative
- keep this file as the single percentage/status view

Recommended update rhythm:

- update this file whenever a subtree changes state
- update the program score only from explicit state transitions
- keep `docs/dev/canonical-gymnasium-applicability-design.md` as the review target for the next state-filter architecture step
- treat checklist `R1-R7` and pilot gates `A1-A5` in that document as the review gate before compiler/validator implementation starts
- do not increase the percentage because of "felt progress"

## My assessment

Using `100% = old repos deleted` is a good idea, but only if we separate:

- migration progress
- deletion readiness

If we collapse both into one naive percentage too early, the number becomes misleading.

This document therefore uses:

- `55%` as the current migration-program score
- `100%` as the current input-transfer score for the currently known mandatory scope
- `0%` as the current deletion-readiness picture for the legacy source trees

That is, in my view, the most honest planning representation of the current state.
