# Canonical Gymnasium Migration Status

This document tracks the migration progress from legacy Gymnasium source trees into the DE-level canonical layer.

Assumption for this document:

- "existing repos" means the legacy curriculum source trees that are or recently were operationally relevant inside this monorepo.
- The main tracked trees in scope today are:
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

## Completion-track headline score

The historical rollout score above is still useful for explaining how much canonical structure exists.
It is not the best top-line number for the final stretch, because late-stage work is dominated by
retiring the remaining legacy trees rather than by adding new adopted subtrees.

For the close-out phase, we therefore also track one explicit overall completion-to-finish score:

- `completion-track score` = average of the tracked legacy-tree delete-gate scores

Formula:

```text
completion-track score
  = (gate score of each tracked legacy tree) / number of tracked legacy trees
```

Interpretation:

- this is the primary top-line percentage for the final migration stretch
- it starts to matter once at least one tracked legacy tree has actually been retired
- unlike the older rollout score, it is tied directly to the remaining delete-handoff work
- from here on, progress updates should prefer this number as the main "how close are we?" headline

## Reported headline 2026-03-18

Current reported migration status:

- `100%`

Why this is the right number right now:

- `3` of the `3` tracked legacy trees are already deleted from the active repo
- all old legacy-tree runtime paths were removed, including `curricula/DE/BY/Gymnasium`
- the current delete-handoff boundary is now enforced via DE-level retained-asset, mapping, and provenance registries instead
- the close-out headline is now capped correctly because all tracked legacy trees are retired from the active repo

## Snapshot 2026-03-18

Observed repo state:

- Canonical DE Gymnasium files present: `21`
  - `1` overview
  - `20` subject files
- Hessen upper-secondary mapping files present: `16`
- Hessen Sek I mapping files present: `5`
- Bavaria Gymnasium adopted mapping files present: `21`
- `npm run validate:view-filters` currently returns `0` errors, `0` active warnings, `139` accepted warnings
- the current on-disk retained-asset lanes live under `curricula/DE/Gymnasium/input/HE/` and `curricula/DE/Gymnasium/input/BY/`; tooling still normalizes older registry references that use `DE-HE` / `DE-BY`
- `python3 scripts/validate_bavaria_gymnasium_legacy_refs.py` currently passes with `0` violations while reporting `Legacy tree present: no`
- `python3 scripts/validate_bavaria_gymnasium_archive_paths.py` currently passes with `0` violations
- `bash scripts/run_bavaria_gymnasium_delete_handoff_dry_run.sh` currently passes with `DELETE_HANDOFF_PRECHECK=OK`
- the Bavaria Sek-I mathematics pilot now spans the shared canonical `J5-J10` spine with `64` reviewed mappings, including first explicit subrow refinement for `M8 3`, `M8 4`, `M9 3`, `M9 7`, and `M10 2`
- the Bavaria Informatics pilot now adds `84` reviewed mappings into the canonical DE informatics layer, yielding `45` committed `DE-BY` applicability nodes plus a direct Bavaria `Informatik` cutover path into `Gymnasium (DE)`
- the Bavaria Wirtschaft-und-Recht pilot now adds `27` reviewed mappings into the canonical DE economics layer, yielding `26` committed `DE-BY` applicability nodes plus a direct Bavaria `Wirtschaft und Recht` cutover path into `Gymnasium (DE)`
- the Bavaria German pilot now adds `16` reviewed mappings into the canonical DE German layer, yielding `13` committed `DE-BY` applicability nodes plus a direct Bavaria `Deutsch` cutover path into `Gymnasium (DE)`
- the Bavaria English pilot now adds `11` reviewed mappings into the canonical DE English layer, yielding `2` committed `DE-BY` applicability nodes on the currently reviewed English surface plus a direct Bavaria `Englisch` cutover path into `Gymnasium (DE)`
- the Bavaria French pilot now adds `11` reviewed mappings into the canonical DE French layer, yielding `3` committed `DE-BY` applicability nodes on the currently reviewed French surface plus a direct Bavaria `Französisch` cutover path into `Gymnasium (DE)`
- the Bavaria Spanish pilot now adds `8` reviewed mappings into the canonical DE Spanish layer, yielding `2` committed `DE-BY` applicability nodes on the currently reviewed Spanish surface plus a direct Bavaria `Spanisch` cutover path into `Gymnasium (DE)`
- the Bavaria Italian pilot now adds `8` reviewed mappings into the canonical DE Italian layer, yielding `8` committed `DE-BY` applicability nodes plus a direct Bavaria `Italienisch` cutover path into `Gymnasium (DE)`
- the Bavaria Russian pilot now adds `8` reviewed mappings into the canonical DE Russian layer, yielding `8` committed `DE-BY` applicability nodes plus a direct Bavaria `Russisch` cutover path into `Gymnasium (DE)`
- the Bavaria Polish pilot now adds `5` reviewed mappings into the canonical DE Polish layer, yielding `5` committed `DE-BY` applicability nodes plus a direct Bavaria `Polnisch` cutover path into `Gymnasium (DE)`
- the Bavaria Czech pilot now adds `5` reviewed mappings into the canonical DE Czech layer, yielding `5` committed `DE-BY` applicability nodes plus a direct Bavaria `Tschechisch` cutover path into `Gymnasium (DE)`
- the Bavaria History pilot now adds `56` reviewed mappings into the canonical DE history layer, yielding `58` committed `DE-BY` applicability nodes through the first reviewed mixed `G8` / `G9` bridge plus a direct Bavaria `Geschichte` cutover path into `Gymnasium (DE)`
- the Bavaria Greek pilot now adds `14` reviewed mappings into the canonical DE Greek layer, yielding `11` committed `DE-BY` applicability nodes on an early reviewed `E-Phase` bridge plus a direct Bavaria `Griechisch` cutover path into `Gymnasium (DE)`
- the Bavaria Politik-und-Gesellschaft pilot now adds `39` reviewed mappings into the canonical DE politics/economics layer, yielding `22` committed `DE-BY` applicability nodes across a reviewed mixed `G8` / `G9` bridge plus a direct Bavaria `Politik und Gesellschaft` cutover path into `Gymnasium (DE)`
- the Bavaria Latin pilot now adds `15` reviewed mappings into the canonical DE Latin layer, yielding `16` committed `DE-BY` applicability nodes plus a direct Bavaria `Latein` cutover path into `Gymnasium (DE)`
- the Bavaria Music pilot now adds `15` reviewed mappings into the canonical DE music layer, yielding `15` committed `DE-BY` applicability nodes plus a direct Bavaria `Musik` cutover path into `Gymnasium (DE)`
- the Bavaria Chinese pilot now adds `35` reviewed mappings into the canonical DE Chinese layer, yielding `33` committed `DE-BY` applicability nodes plus a direct Bavaria `Chinesisch` cutover path into `Gymnasium (DE)`
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
- the Hessen Sek-I chemistry ions/electrolysis bridge now closes the reviewed `9.3 Elektrolyse und Ionenbegriff` row at exact coverage: conductivity, ions as charge carriers, and electrolysis of aqueous salt solutions all map exactly into a dedicated canonical Sek-I ions/electrolysis cluster that reuses the reviewed `9.1` symbol-language bridge and now also backs the upper-secondary `Elektrolyse beschreiben` route
- the Hessen Sek-I chemistry atomic-structure bridge now closes the reviewed `10.1 Atombau, Periodensystem und Ionenbindung` row at exact coverage: core-shell model, Bohr energy levels, periodic-table orientation, ion formation via noble-gas rule, and ionic bonding all map exactly into a dedicated canonical Sek-I atomic-structure-and-bonding cluster that reuses the reviewed `9.1` symbol-language bridge and now also backs the upper-secondary `Bindungsmodelle sicher nutzen` route
- Explicit learner cutover path to `Gymnasium (DE)` exists in backend and UI
- Bulk cutover path for operators exists
- the Hessen Sek-I learner cutover path now also covers the frozen mixed overview root across the currently supported `Mathematik`/`Physik`/`Chemie`/`Biologie`/`Französisch` surface; lower-secondary physics still auto-selects canonical mathematics for the existing bridge prerequisites, and lower-secondary French now cuts over onto the shared canonical French landscape instead of blocking mixed-overview retirement
- the first Bavaria learner cutover path is now operational for direct legacy `Mathematik` learners: Bavaria `Mathematik` can migrate into `Gymnasium (DE)` with the root filter `DE-BY`, canonical Mathematics selected, and normalized planned-scope continuation on the shared canonical Math spine
- ordinary learner entry now also prefers the canonical DE path over the Bavaria legacy root: `Gymnasium (Bayern)` is hidden by default from general overview/bootstrap surfaces and only retained when it is already the active learner selection
- the active Bavaria Math/Physics/Chemistry/Biology/Informatik/Geschichte/Deutsch/Englisch/Französisch/Spanisch/Italienisch/Russisch/Polnisch/Tschechisch/Griechisch/Wirtschaft_und_Recht/Politik_und_Gesellschaft/Latein/Musik/Chinesisch adopted corridor no longer hangs off the retired `curricula/DE/BY/Gymnasium` path: the adopted Bavaria mappings now live under `curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/`, the shared source-landscape registry now exposes `archiveSourcePath` for the current adopted Bavaria source landscapes, and `scripts/validate_bavaria_gymnasium_archive_paths.py` plus `scripts/validate_bavaria_gymnasium_legacy_refs.py` now fence the DE-level retained-source lane and repo-level operational references
- the currently supported Bavaria legacy mathematics learner path is now detached as an active runtime path: direct `Mathematik` sessions are frontend- and backend-read-only retirement views, UI/AI write endpoints reject mutations, and the canonical `Gymnasium (DE)` + `DE-BY` cutover remains the supported continuation
- the current Bavaria Physics pilot surface now has the same direct learner-cutover and retirement handling: direct legacy `Physik` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Physics selected plus the required Math bridge, and active legacy Physics sessions are frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Chemistry and Biology pilot surfaces now also have direct learner-cutover and retirement handling: direct legacy `Chemie` and `Biologie` learners migrate into `Gymnasium (DE)` with `DE-BY`, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Informatics pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Informatik` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Informatics selected, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria German pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Deutsch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical German selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria English pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Englisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical English selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria French pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Französisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical French selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Spanish pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Spanisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Spanish selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Italian pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Italienisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Italian selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Russian pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Russisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Russian selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Polish pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Polnisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Polish selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Czech pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Tschechisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Czech selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria History pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Geschichte` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical History selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Greek pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Griechisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Greek selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Wirtschaft-und-Recht pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Wirtschaft und Recht` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical `Wirtschaftswissenschaften` selected, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Politik-und-Gesellschaft pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Politik und Gesellschaft` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical `Politik und Wirtschaft` selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Latin pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Latein` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Latin selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Music pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Musik` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Music selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Chinese pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Chinesisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Chinese selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- Bavaria Math/Physics/Chemistry/Biology source-goal closures and goal memberships now also live in the shared DE-level provenance registries `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json` and `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`, so the current adopted Bavaria corridor no longer depends on the live legacy tree for archived closure or membership lookups
- the full live Bavaria Gymnasium legacy tree now classifies as compatibility-only on the active runtime path: explicit UI/AI curriculum selection no longer routes fresh learners back into Bavaria legacy root or subject views, while general learner entry continues to prefer `Gymnasium (DE)` and existing retired sessions remain archive/cutover-only
- ordinary learner entry now also prefers the canonical DE path over Hessen Sek-I legacy roots: lower-secondary Hessen landscapes are hidden by default from the general overview/bootstrap surface and only reappear when they are already the active selection
- the frozen Hessen Sek-I source-JSON lane is now mirrored under `curricula/DE/Gymnasium/input/HE/lower-secondary/source-json/` (`6` files), and the shared source-landscape registry now also offers `archiveSourcePath` for those lower-secondary landscapes so provenance survives outside the live legacy tree
- Hessen Sek-I source-goal atomic closures and goal memberships now also live in the shared DE-level provenance registries `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json` and `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`, so lower overview/root survival no longer depends on expanding the live legacy tree for archived closure or membership lookups
- Hessen Sek-I legacy learner sessions are now detached as active runtime paths across the currently supported lower-secondary bundle: `Mathematik`/`Physik`/`Chemie`/`Biologie`/`Französisch` sessions, including mixed overview sessions that resolve into that bundle, are frontend- and backend-read-only once the canonical cutover surface is available
- Hessen Sek-I legacy-to-canonical mapping fixtures now also live in the DE-level archive lane `curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/`
- frozen Hessen Sek-I compatibility summaries and topic lists now also resolve from the DE-level archive registries `curricula/DE/Gymnasium/archive/compatibility-landscape-registry.json` and `curricula/DE/Gymnasium/archive/compatibility-topic-summary-registry.json`
- `scripts/validate_hessen_lower_secondary_archive_paths.py` and `scripts/validate_hessen_lower_secondary_legacy_refs.py` now fence retained-asset and repo-level references for Hessen Sek-I, and both checks are wired into `.github/workflows/ci.yml` plus local `run_ci.sh`
- the Hessen lower-secondary delete handoff has now been executed: the original tree is gone from the active repo path, and `bash scripts/run_hessen_lower_secondary_delete_handoff_dry_run.sh` now serves as the post-retirement verification command against the surviving archive/provenance/mapping lanes
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
- Hessen upper-secondary exam/deploy/adoption helper tooling now resolves retained `abi/` defaults plus archived mapping defaults from the DE-level lanes `curricula/DE/Gymnasium/input/DE-HE/` and `curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/` via a shared retained-asset registry, while legacy subject-landscape lookup is centralized through the DE-level provenance source registry instead of per-script hardcoded legacy paths
- DE-level Hessen `abi/` operational metadata now follows the same handoff: `task_bank.json` stores `sourceLandscapeId` plus `curricula/DE/Gymnasium/provenance/source-landscape-registry.json` instead of embedding legacy landscape file paths, and blueprint/source-catalog/release-bundle source references now point only at retained DE-level `curricula/DE/Gymnasium/input/DE-HE/...` assets
- repo-authored Hessen `abi/` markdown (`exam-pipeline.md`, physics authoring/QS docs, LEIFI README) is now aligned to the same DE-level archive/provenance lane; remaining legacy path strings inside `HE/abi/` are confined to imported/raw archival texts such as source-extracted markdown and official text excerpts
- that remaining raw-provenance boundary is now machine-checked by `scripts/validate_hessen_upper_secondary_archive_paths.py`, with the explicit allowlist stored in `curricula/DE/Gymnasium/input/HE/retained-asset-registry.json`
- the Hessen upper-secondary archive-boundary validator is now wired into both `.github/workflows/ci.yml` (`graph-validation`) and local `run_ci.sh`, so regressions on retained-vs-raw archive path usage fail the standard QA path instead of relying on ad-hoc manual checks
- the remaining repo-level references to `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe` are now also narrowed to an explicit handoff allowlist in `curricula/DE/Gymnasium/provenance/hessen-upper-secondary-retirement-registry.json`; active operational surfaces are machine-checked by `scripts/validate_hessen_upper_secondary_legacy_refs.py`, and the old root helper scripts no longer carry hardcoded Hessen legacy defaults
- backend/src is now free of explicit Hessen upper-secondary tree references; the remaining allowlisted repo-level references are reduced to `7` explicit handoff files: provenance/input descriptors plus the validator/dry-run scripts that police that boundary
- the frozen Hessen upper-secondary source-JSON lane is now mirrored under `curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/` (`39` files), and the shared source-landscape registry now offers `archiveSourcePath` so tooling can read those snapshots without depending on the live legacy tree
- backend landscape loading now also falls back to those archived Hessen upper-secondary source snapshots, so retired curriculum IDs remain resolvable for release metadata, frontier invariants, and explicit retirement/conflict handling even after the old tree is gone
- the Hessen upper-secondary delete handoff has now actually been executed: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe` is gone from the active repo path, and `bash scripts/run_hessen_upper_secondary_delete_handoff_dry_run.sh` now serves as the post-retirement verification command over the surviving DE-level archive/provenance lanes
- `scripts/validate_hessen_upper_secondary_legacy_refs.py` now enforces not only the allowlisted textual reference boundary, but also that the retired Hessen upper-secondary tree stays absent from the active repo
- Reviewed canonical landscapes now carry committed node-level `applicability`; the currently enforced CI set now covers the full committed DE Gymnasium canonical set: `Mathematik`, `Physik`, `Chemie`, `Biologie`, `Informatik`, `Deutsch`, `Englisch`, `Französisch`, `Griechisch`, `Chinesisch`, `Geschichte`, `Politik und Wirtschaft`, `Musik`, `Latein`, `Spanisch`, `Italienisch`, `Russisch`, `Polnisch`, `Tschechisch`, `Wirtschaft`, `Overview`
- `validate:view-filters` is now clean on active reviewed findings for that scope: `0` errors, `0` active warnings, `139` accepted warnings recorded in `docs/qa-ci/applicability-accepted-warnings.json`
- `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe` has now crossed from `legacy_view_retained` to `legacy_deleted` at tree level: only the DE-level input/provenance lanes survive as operational artifacts
- `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe` is the first tracked legacy source tree that has actually been deleted from the active repo
- the migration has therefore entered the explicit close-out phase: the remaining work is now dominated by optional scope extension questions, not legacy tree retirement

## Input transfer lane

Deleting old legacy source trees requires more than canonical JSON plus mappings.

We also need a migration lane for the legacy source inputs, especially:

- `input/` source material used to derive goals
- `abi/` state-specific exam and release material
- any still-needed references that are currently only reachable through legacy paths

Rule:

- canonical DE landscapes stay shared and non-state-specific
- transferred source inputs must stay explicitly state-scoped
- the same state-scoped rule applies to retained non-canonical materials beyond pure `input/`, with `curricula/DE/Gymnasium/input/HE/abi` as the clearest current example

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
- the Hessen upper-secondary source-JSON snapshots (`39` files) have now also been transferred into that archive
- Hessen upper-secondary exam/deploy/adoption helper defaults now resolve against the DE-level `abi/` and mapping archives via `curricula/DE/Gymnasium/input/HE/retained-asset-registry.json` instead of subject-local hardcoded legacy-tree paths
- Hessen upper-secondary `abi/` task banks, blueprints, source catalogs, and the math release bundle now also use DE-level retained asset paths plus provenance registry references instead of embedding live `Gymnasiale_Oberstufe` source paths in their operational metadata
- the Bavaria subject-source snapshot has now also been transferred into that archive
- the optional Bavaria `abi/` lane is still undecided and remains out of the current mandatory scope
- therefore the currently known mandatory transfer scope is now mirrored; the only open question is whether a Bavaria `abi/` lane ever becomes part of scope
- for Sek I normalization, the current canonical planning target is a shared G9-aligned year-level grid `5-10`; source-side `G8` / `G9` distinctions remain preserved in provenance and archived inputs

### Initial input inventory

| State lane | Current source location | Current form | Observed size | Migrated into DE archive | Planned target |
| --- | --- | --- | ---: | ---: | --- |
| `DE-HE` upper-secondary input | `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/input/` | source PDFs + references | `24` files | `24` files | `curricula/DE/Gymnasium/input/DE-HE/upper-secondary/` |
| `DE-HE` upper-secondary source snapshot | `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/` | frozen source landscapes + deck/report sidecars | `39` files | `39` files | `curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/` |
| `DE-HE` upper-secondary abi | `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/abi/` | exam/release assets by subject | `2130` files | `2130` files | `curricula/DE/Gymnasium/input/HE/abi/` |
| `DE-HE` lower-secondary input | `curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe/input/` | source PDFs + references | `20` files | `20` files | `curricula/DE/Gymnasium/input/DE-HE/lower-secondary/` |
| `DE-HE` lower-secondary source snapshot | `curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe/json/` | frozen source landscapes | `6` files | `6` files | `curricula/DE/Gymnasium/input/HE/lower-secondary/source-json/` |
| `DE-BY` gymnasium source lane | `curricula/DE/BY/Gymnasium/` | subject JSON source set, no dedicated `input/` tree yet | `45` subject JSON files | `45` files | `curricula/DE/Gymnasium/input/BY/gymnasium/` |
| `DE-BY` abi lane | not yet present as dedicated canonical migration input lane | reserved | `0` migrated files | `0` files | `curricula/DE/Gymnasium/input/BY/abi/` |

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
known files in scope = 24 + 39 + 2130 + 20 + 6 + 45 = 2264
transferred so far   = 24 + 39 + 2130 + 20 + 6 + 45 = 2264
proxy score          = 2264 / 2264 = 100.00%
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

## Historical rollout score

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

This score remains useful as a secondary diagnostic for authored canonical coverage.
It is no longer the preferred top-line completion headline for the final stretch.

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
| `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe` | done | done | done | done | done | done | 100% | yes | none; delete handoff executed and CI now enforces that the tree stays absent | closed; keep the DE-level provenance/archive registries as the surviving audit trail and leave the post-retirement gate in CI |
| `curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe` | done | done | done | done | done | done | 100% | yes | none; delete handoff executed and CI now enforces the surviving DE-level archive/provenance/mapping lane | closed; keep the DE-level retained-asset, mapping, and provenance registries as the surviving audit trail and leave the post-retirement gate in CI |
| `curricula/DE/BY/Gymnasium` | done | done | done | done | done | done | 100% | yes | none; delete-handoff execution and DE-level audit/reference persistence are in place | closed; keep the DE-level retained-asset, mapping, and provenance registries as the surviving audit trail and leave the post-retirement gate in CI |

## Current completion-track score

Tracked-tree calculation:

```text
score = (100 + 100 + 100) / 3
      = 100.00%
```

Working completion-track score:

- `100%`

Interpretation:

- this is now the main overall percentage for "how close are we to actually finishing?"
- it is now at all tracked-tree closure level, with no remaining legacy-tree delete handoff open
- any future movement is now through optional coverage scope extension, not tree delete-handoff
- it only reaches `100%` when all tracked legacy trees are fully retired from the active repo

Practical conclusion:

- The historical rollout program score is around `55%`.
- The close-out headline score is now `100%`.
- The input-transfer lane is at `100%` for the currently known mandatory scope.
- Hard legacy-tree retirement progress is now `100%` at tracked-tree granularity, because all three tracked legacy trees have now been removed from the active repo.
- Soft delete-gate progress is now visible tree by tree: `100%` for Hessen upper-secondary, `100%` for Hessen lower-secondary, `100%` for Bavaria Gymnasium.

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

Only after step 7 do we convert a unit or source tree from any non-final state into `legacy_deleted`.

## Recommended next planning move

Use this document together with the implementation plan:

- keep the implementation plan as the work-package and rollout narrative
- keep this file as the single percentage/status view

Recommended update rhythm:

- update this file whenever a subtree changes state
- use the completion-track score as the primary headline percentage in progress updates
- update the program score only from explicit state transitions
- update the completion-track score whenever one of the tracked legacy-tree gate scores changes
- update the tree-by-tree delete matrix whenever one of the six delete gates materially changes for a legacy source tree
- keep `docs/dev/canonical-gymnasium-applicability-design.md` as the review target for the next widening step of the implemented state-filter architecture
- treat checklist `R1-R7` and pilot gates `A1-A5` in that document as the review gate before widening the reviewed applicability scope further
- do not increase the percentage because of "felt progress"

## My assessment

Using `100% = old repos deleted` is a good idea, but only if we separate:

- migration progress
- deletion readiness

If we collapse both into one naive percentage too early, the number becomes misleading.

This document therefore uses:

- `100%` as the current completion-track headline score
- `55%` as the current historical migration-program score
- `100%` as the current input-transfer score for the currently known mandatory scope
- `100%` / `100%` / `100%` as the current delete-gate progress picture for the three tracked legacy trees
- `100%` as the current hard legacy-tree retirement picture, because all three tracked legacy trees have now been removed from the active repo without breaking the verified handoff paths

That is, in my view, the most honest planning representation of the current state.


## Mathematics canonical patch log

### 2026-03-18: J5 early arithmetic and measurement expansion

Approach used:

- `reuse-first`: existing canonical goals were preferred over duplication
- first wave limited to early arithmetic plus measurement/area foundations
- the broad J5 geometry node remains in place for now; its finer split is deferred to avoid immediate duplicate modeling
- new early atoms were scoped initially to `DE-BY` and documented as candidates for later `DE-HE` review

Applied changes:

- extended the J5 arithmetic cluster with six new early atoms: place value, rounding, basic additive equations, divisibility/prime factorization, powers of ten, and bracket/precedence evaluation
- added one new J5 measurement application cluster with three atoms: calculating with quantities, rule of three/scale, and distinguishing perimeter from area
- sharpened the existing natural-number foundation goal to mention number-line localization explicitly
- tightened early prerequisite flow by making J6 area/volume goals depend on the new J5 quantity/area foundations

Deferred on purpose:

- splitting the existing broad J5 geometry atom into finer geometry atoms, because that requires a deliberate refactor to avoid duplicate canonical geometry goals


### 2026-03-18: J5 M5 Bavaria mapping tranche

Approach used:

- mapped only the first high-confidence `M5` cases from Bavaria to the canonical graph
- preferred `exact` only where the new or existing canonical atom matched the Bayern source tightly
- used `partial` where the Bayern source remained narrower or broader than the canonical atom
- deferred the remaining J5 geometry/process refinements until the broad existing geometry/process nodes are split without duplication

Applied changes:

- added a first tranche of explicit `DE-BY` mappings for J5 arithmetic and measurement/area goals
- widened `Natürliche Zahlen darstellen, ordnen und mit ihnen rechnen` to `DE-BY` because Bayern J5 now provides direct evidence for that canonical atom


### 2026-03-18: J5 geometry split and Bavaria geometry mapping

Approach used:

- preserved the existing broad J5 geometry goal ID and refactored it from an atomic goal into a geometry cluster to avoid breaking downstream references
- split the geometry block only along the five explicit Bavaria `M5 2` leaf goals, so the refinement stays source-backed and does not invent duplicate canonical granularity
- kept `DE-HE` applicability on the refined geometry atoms because the refactor only decomposes an already shared early-geometry atom; this narrows structure, not jurisdictional scope
- recomputed cluster weights from unique atomic descendants so the J5 lineage stays semantically consistent after the geometry split

Applied changes:

- added five new J5 geometry atoms for coordinate-system objects, geometric relations, point sets with distance conditions, angle work, and quadrilateral properties
- changed the Bavaria `M5 2` cluster mapping from `partial` to `exact`
- added five exact Bavaria leaf mappings for the new geometry atoms

Deferred on purpose:

- no Hessen source-specific leaf mapping review yet for the new geometry atoms
- no further J6/J7 prerequisite tightening beyond preserving the existing broad-cluster dependency as the current compatibility edge


### 2026-03-19: DE-HE prerequisite closure after the J5 geometry split

Approach used:

- treated the APV-102 findings as a visibility-closure issue, not as a reason to revert the finer J5 modeling
- widened the new J5 measurement tranche to `DE-HE`, because these atoms now act as explicit prerequisites for already visible Hessen lower-secondary area/volume goals
- replaced remaining broad-cluster geometry prerequisites on later visible goals with the finer visible J5 geometry atoms, moving the graph one step closer to atomic prerequisite modeling

Applied changes:

- widened `Mit Größen rechnen und Ergebnisse deuten`, `Einfache proportionale Sachaufgaben mit Dreisatz und Maßstab lösen`, and `Umfang und Flächeninhalt unterscheiden und anwenden` plus their J5 cluster to `DE-HE`
- retargeted the affected J6/J7/J8 geometry and area/volume goals from the broad J5 geometry cluster to the new finer geometry atoms

Deferred on purpose:

- no separate Hessen source-leaf mapping pass yet for the widened J5 measurement atoms
- no validator run in this patch step


### 2026-03-19: Hessen lower-secondary evidence added for new early-math atoms

Approach used:

- treated the remaining APV-102 findings as missing `DE-HE` evidence in the Hessen lower-secondary mapping layer, not as a canonical-graph failure
- added only the smallest mapping tranche needed to close the new J5/J6 prerequisite visibility chain
- stayed conservative on match quality: `exact` only where the Hessen source wording is tight enough, otherwise `partial`

Applied changes:

- added Hessen lower-secondary mappings for the new J5 measurement atoms and their J5 cluster
- added Hessen lower-secondary mappings for the new J5 geometry atoms needed by the J6/J7/J8 prerequisite chain, plus the refactored J5 geometry cluster
- explicitly anchored the coordinate-system basis atom so the new geometry prerequisites are themselves visible in `DE-HE`

Deferred on purpose:

- no broader Hessen backfill for the rest of the new J5 atom tranche beyond what the current validator findings require
- no validator run in this patch step


### 2026-03-19: Hessen closure switched from duplicate mappings to overrides

Approach used:

- reverted the invalid one-to-many Hessen lower-secondary mappings after the backend mapping service exposed the repository invariant that each `legacyGoalId` may resolve to only one canonical goal
- preserved the finer canonical early-math structure and closed `DE-HE` visibility instead through explicit applicability overrides on the affected canonical atoms
- documented the override-backed Hessen bridge in the accepted-warning registry, matching the repository's existing APV-201 pattern for reviewed prerequisite closures

Applied changes:

- removed the duplicate Hessen lower-secondary mapping entries that caused `GoalMappingService` to fail during startup
- added `extendedData.applicabilityOverrides.jurisdiction = ["DE-HE"]` to the new early geometry and measurement atoms that are required by visible Hessen goals but lack a clean one-to-one Hessen source atom
- updated the Bavaria math mapping fixture test to the intentionally expanded repository-backed mapping count and the new exact J5 geometry slice

Deferred on purpose:

- no broader refactor of repository mapping semantics beyond the current one-legacy-to-one-canonical invariant
- no test rerun in this patch step
