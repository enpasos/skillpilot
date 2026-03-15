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
- the Bavaria Sek-I mathematics pilot now spans the shared canonical `J5-J10` spine with `64` reviewed mappings, including first explicit subrow refinement for `M8 3`, `M8 4`, `M9 3`, `M9 7`, and `M10 2`
- the Hessen Sek-I mathematics pilot now carries `33` explicit mappings and reaches reviewed row coverage beyond the old function/quadratic slice: J5 number basics, linear equations/inequalities, quadratic binomial-form routes, roots, similarity/Strahlensatz, Pythagoras, circle/cylinder, and integer-exponent rules
- the reviewed Hessen Sek-I mathematics pilot no longer carries any `APV-202` findings; remaining reviewed math debt is now limited to the two Bayern override-backed `APV-201` cases
- the Hessen Sek-I physics mechanics bridge now closes the old `7.4 Mechanik` row at exact reviewed coverage: a dedicated canonical density/mass/volume atom plus exact row- and subrow-mappings now cover the full Hessen mechanics anchor, while `Kräfteigenschaften nutzen` and `10.1 Arbeit und Energie` already bind to their own reviewed canonical targets
- the Hessen Sek-I physics heat bridge now closes the foundational `7.2 Wärmelehre` row at exact reviewed coverage: temperature/heat, temperature measurement and expansion, particle model, and heat transfer all map exactly into a dedicated canonical Sek-I heat cluster that also backs the later `J10` heat-energy route
- the Hessen Sek-I physics optics bridge now spans both reviewed source rows `7.1 Optik 1` and `8.1 Optik 2`: light propagation, ray model, reflection, lens imaging, vision, and simple optical instruments all map exactly into dedicated canonical Sek-I optics anchors
- the Hessen Sek-I physics electricity bridge now spans both reviewed source rows `7.3 Magnetismus und Elektrizität 1` and `8.2 Elektrizität 2`: magnets, simple circuits, current effects, current measurement, static electricity/voltage, current-voltage relation, resistor circuits, and electrical safety all map exactly into dedicated canonical Sek-I electricity anchors
- the Hessen Sek-I physics pressure/buoyancy bridge now closes the fakultative `8.3 Druck und Auftrieb` row at exact reviewed coverage: pressure in liquids and gases, qualitative pressure-temperature relations, Archimedes' principle, and first flight/air-resistance interpretations all map exactly into a dedicated canonical Sek-I pressure-and-buoyancy cluster that depends on the reviewed mechanics base and reuses the reviewed heat bridge for the gas-pressure branch
- the Hessen Sek-I physics acoustics bridge now closes the fakultative `8.3b Akustik` row at exact reviewed coverage: sound sources, sound propagation, pitch/loudness, hearing/noise, and music-related sound phenomena all map exactly into a dedicated canonical Sek-I acoustics cluster that reuses the reviewed particle-model anchor and now also feeds the upper-secondary Q2 wave entry point
- the Hessen Sek-I physics colors bridge now closes the fakultative `8.3c Farben` row at exact reviewed coverage: color origin/decomposition, additive and subtractive color mixing, simple color perception, and technical color applications all map exactly into a dedicated canonical Sek-I colors cluster that reuses the reviewed light-propagation anchor and now also feeds the upper-secondary Q3 electromagnetic-spectrum entry point
- the Hessen Sek-I physics radioactivity bridge now closes the non-fakultative `10.2 Radioaktivität` row at exact reviewed coverage: atomic structure, radiation detection/effects, and applications/risks all map exactly into a dedicated canonical Sek-I radioactivity cluster that now also feeds the upper-secondary nuclear-physics entry point
- the Hessen Sek-I physics work/energy bridge now reaches into the `J10` continuation of `10.1 Arbeit und Energie`: `Wärme als Energieform` and `Elektrische Energie nutzen` both map exactly into dedicated canonical energy atoms, with the heat-energy route depending explicitly on the reviewed Sek-I heat bridge and the electrical-energy route on the reviewed voltage bridge
- the Hessen Sek-I chemistry foundations bridge now closes the full reviewed `8.1 Stoffe – Strukturen – Eigenschaften` row at exact coverage: hazard symbols/safety rules and separation methods now join the already adopted working-methods, substance, state, solution, and first acid-base anchors, so the old `8.1` cluster itself now maps exactly into the canonical Sek-I chemistry foundations cluster
- the Hessen Sek-I chemistry reactions bridge now extends the reviewed adoption into `8.2 Chemische Reaktion – Stoff- und Energieumsatz`: reaction characteristics, simple oxidation/reduction, combustion, reaction energy, and conservation of mass all map exactly into a dedicated canonical Sek-I reactions cluster, and the upper-secondary `Einfache Redoxreihen aufstellen` route now depends explicitly on the projected Sek-I redox anchor
- the Hessen Sek-I chemistry symbol-language bridge now closes the reviewed `9.1 Chemische Symbolsprache und Anwendung` row at exact coverage: constant proportions, Dalton model, chemical symbols/formulas, simple reaction equations, and first redox schemes all map exactly into a dedicated canonical Sek-I symbol-language cluster that reuses the reviewed `8.2` reactions bridge
- Explicit learner cutover path to `Gymnasium (DE)` exists in backend and UI
- Bulk cutover path for operators exists
- Hessen upper-secondary legacy-to-canonical mapping fixtures now live in the DE-level archive `curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/`
- Hessen upper-secondary source-landscape jurisdiction metadata now lives in the DE-level provenance registry `curricula/DE/Gymnasium/provenance/source-landscape-registry.json`, and both backend state filtering and the applicability compiler read from that stable path
- Hessen upper-secondary source-goal atomic closures now live in the DE-level provenance registry `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`, and canonical champion/topic metrics can read that frozen closure instead of expanding the live legacy tree
- Hessen upper-secondary source-goal memberships now also live in the DE-level provenance registry `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`, and Hessen cutover can infer subject membership for stored legacy planned/active goal IDs without loading the live legacy source tree
- learner-facing curriculum selection now exposes frozen Hessen upper-secondary roots and subjects as explicit compatibility views instead of mixing them into the ordinary recommended selection flow
- ordinary session-start and championship-registration pickers now hide compatibility views by default and only retain them when they are already the active selection
- backend bootstrap for new learners now also delivers recommended curricula without compatibility views by default, and `/api/ui/landscapes` supports an explicit `includeCompatibility` switch instead of forcing the frontend to guess
- the learner cockpit setup now also demotes Hessen compatibility subjects into an explicitly revealable secondary section, and canonical `Gymnasium (DE)` setups prune stale Hessen compatibility entries from persisted personal curriculum configs
- when a learner is still inside a Hessen compatibility session, the cockpit setup dialog now runs in retirement-only mode instead of acting as a normal curriculum editor; migration/audit remain available there, but regular curriculum reconfiguration is no longer part of that path
- the learner cockpit now also treats open Hessen compatibility sessions as read-only/audit-only for planning, active-goal selection, and SRS drilling; the legacy session remains visible, but no longer behaves like a normal active learning path
- UI and AI write endpoints now also reject compatibility-session writes server-side for curriculum mutation, planning, active-goal changes, mastery, and client-state updates, so the retained Hessen route is backend-read-only as well as frontend-read-only
- UI and AI learner-state routes no longer serve retained Hessen compatibility sessions at all as live state views; instead, the UI exposes a dedicated compatibility-archive export that snapshots the retired Hessen state for audit/recovery
- the compatibility-archive export now resolves retired Hessen curriculum summaries from the frozen DE-level archive registry `curricula/DE/Gymnasium/archive/compatibility-landscape-registry.json` and serializes raw persisted learner state, so archive generation no longer depends on projecting a live legacy landscape graph
- `/api/ui/landscapes?includeCompatibility=true` now also resolves Hessen compatibility summaries from the frozen DE-level archive registry `curricula/DE/Gymnasium/archive/compatibility-landscape-registry.json`, so compatibility overview/listing metadata no longer depends on loaded Hessen upper-secondary landscape files
- `/api/ui/curricula/{curriculumId}/topics` now also resolves Hessen compatibility topic lists from the frozen DE-level archive registry `curricula/DE/Gymnasium/archive/compatibility-topic-summary-registry.json`, and direct Hessen compatibility `/api/ui/landscapes/{id}` plus `/closure` routes are retired
- the `Abi26` Hessen mathematics bootstrap now provisions learners onto canonical `Gymnasium (DE)` with the `DE-HE` root filter plus canonical mathematics `GK`/`LK` scope, instead of selecting the retired Hessen mathematics curriculum directly
- new UI and AI curriculum-selection writes now also reject retired Hessen compatibility IDs even when a caller already knows them, so compatibility routes are no longer re-openable as fresh learner selections
- Reviewed canonical landscapes now carry committed node-level `applicability`; the currently enforced CI set now covers the full committed DE Gymnasium canonical set: `Mathematik`, `Physik`, `Chemie`, `Biologie`, `Informatik`, `Deutsch`, `Englisch`, `Französisch`, `Griechisch`, `Chinesisch`, `Geschichte`, `Politik und Wirtschaft`, `Musik`, `Latein`, `Spanisch`, `Wirtschaft`, `Overview`
- `validate:view-filters` is now clean on active reviewed findings for that scope: `0` errors, `0` active warnings, `8` accepted warnings recorded in `docs/qa-ci/applicability-accepted-warnings.json`
- `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe` has now effectively reached `legacy_view_retained` as an operational runtime state, even though hard repo deletion is still tracked separately
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
| Hessen Sek I physics optics bridge | `subtree_adopted` | 50% |
| Hessen Sek I physics electricity bridge | `subtree_adopted` | 50% |
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
- `19` units at `50%`

Formula:

```text
score = (4 * 75 + 19 * 50) / 23
      = 54.35%
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

To make deletion progress measurable without pretending that any tree is already removable, we track two separate notions:

- `gate score`: how many deletion preconditions are already in place for a given legacy tree
- `deletable now`: hard yes/no gate; this only becomes `yes` when the tree can actually be removed from the active repo

### Delete-gate model

Tree-level delete progress is estimated with the following weighted gates:

| Gate | Weight | Interpretation |
| --- | ---: | --- |
| Canonical replacement breadth | 20% | The legacy tree is broadly represented in the canonical DE layer, not only by a small pilot slice |
| Runtime default switched | 20% | Ordinary learner entry and routing prefer canonical DE views over the legacy tree |
| Learner cutover path operational | 15% | Supported learners can be migrated with deterministic single-learner and/or bulk cutover paths |
| Retained input/assets mirrored | 15% | Input, source, and exam assets that must survive deletion are mirrored into the DE-level state-scoped archive |
| Audit/provenance survivability | 15% | Mappings, provenance, and historical references no longer require the legacy tree to stay in place as active storage |
| Legacy UI/API detached | 15% | The old tree is no longer an active learner-facing operational path and remains, at most, as a temporary compatibility artifact |

Scoring rule:

- `done` = full gate weight
- `partial` = half gate weight
- `no` = `0`
- any tree with at least one open hard gate still has `deletable now = no`

### Tree-by-tree delete matrix

| Legacy source tree | Canonical replacement | Runtime default | Cutover path | Input/assets mirrored | Audit/provenance survivability | Legacy UI/API detached | Gate score | Deletable now | Biggest blocker | Next work package |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- |
| `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe` | done | done | done | done | done | done | 100% | no | the runtime migration/detachment work is complete, but the legacy tree is still intentionally kept in the active repo until an explicit delete/archive decision is executed | keep the Hessen upper-secondary tree frozen, shift active migration effort to Sek I, and prepare the explicit repo-delete/handoff step separately |
| `curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe` | partial | no | no | done | no | no | 25% | no | only selected Sek I bridges are adopted; there is no broad canonical replacement or learner cutover path yet | move from bridge pilots to the first subject-wide Sek I canonical slices and add an explicit lower-secondary cutover plan |
| `curricula/DE/BY/Gymnasium` | partial | no | no | done | no | no | 25% | no | Bavaria is still pilot-shaped; broad canonical subject coverage and runtime migration are missing | extend Bavaria beyond pilot mappings into the first reviewed subject-wide canonical replacements, then add a first Bavaria learner-view cutover path |

Practical conclusion:

- The overall migration program is around `55%`.
- The input-transfer lane is at `100%` for the currently known mandatory scope.
- Hard deletion readiness is still `0%`, because no tracked legacy tree is deletable today.
- Soft delete-gate progress is now visible tree by tree: `100%` for Hessen upper-secondary, `25%` for Hessen lower-secondary, `25%` for Bavaria Gymnasium.

All four statements can be true at the same time, because migration progress, retained-input transfer, delete-gate progress, and actual deletability are different planning dimensions.

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
- update the tree-by-tree delete matrix whenever one of the six delete gates materially changes for a legacy source tree
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
- `100%` / `25%` / `25%` as the current delete-gate progress picture for the three tracked legacy trees
- `0%` as the current hard deletion-readiness picture, because none of those trees can yet be removed from the active repo

That is, in my view, the most honest planning representation of the current state.
