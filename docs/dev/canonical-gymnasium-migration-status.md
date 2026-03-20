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
- the Bavaria Sek-I mathematics surface now spans the shared canonical `J5-J10` spine with `64` reviewed mappings, including first explicit subrow refinement for `M8 3`, `M8 4`, `M9 3`, `M9 7`, and `M10 2`
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
- the Hessen Sek-I mathematics landscape now carries `33` explicit mappings and reaches reviewed row coverage beyond the old function/quadratic slice: J5 number basics, linear equations/inequalities, quadratic binomial-form routes, roots, similarity/Strahlensatz, Pythagoras, circle/cylinder, and integer-exponent rules
- the reviewed Hessen Sek-I mathematics landscape no longer carries any `APV-202` findings; remaining reviewed math debt is now limited to the two Bayern override-backed `APV-201` cases
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


### 2026-03-19: M6 rationale numbers patch plan

Approach used:

- keep the existing broad J6 goal `Rationale Zahlen darstellen und berechnen` as the stable public anchor ID and refactor it into a cluster if the finer split is implemented
- apply the same `reuse-first` rule as in J5: reuse existing early arithmetic atoms wherever they already carry the didactic foundation cleanly
- add new canonical atoms only for the M6 content that is not yet isolated in the canonical graph at usable granularity
- keep the repository mapping invariant in mind: one legacy source goal may map to only one canonical goal; any later jurisdiction widening without clean one-to-one source evidence must be done through `applicabilityOverrides`, not duplicate mappings

Planned reuse base:

- reuse `Natürliche Zahlen runden` as the rounding prerequisite for decimal fractions
- reuse `Teilbarkeitsregeln prüfen und Primfaktorzerlegungen angeben` as the divisibility and denominator-analysis basis for fraction comparison and decimal conversion
- reuse `Natürliche und ganze Zahlen addieren und subtrahieren` as the additive prerequisite for rational arithmetic
- reuse `Natürliche und ganze Zahlen multiplizieren und dividieren` as the multiplicative prerequisite for rational arithmetic
- reuse `Klammerterme und Rechenreihenfolge sicher auswerten` as the early term-structure basis
- reuse `Potenzen mit natürlichen Exponenten und Zehnerpotenzen verwenden` as the entry point for later extension to rational bases and negative exponents

Planned canonical patch candidates for `M6 1.1` to `M6 1.5`:

| Planned canonical atom | Bavaria source evidence | Reuse check | Planned action |
|---|---|---|---|
| `Brüche als Zahlen, Anteile und Quotienten deuten` | `c851474e-5629-592a-97f0-66a2b5b48485`, `37111b61-0ec2-5768-b19c-16b42cbf3b9f` | not isolated in current canonical J6 | `new_canonical_atom` |
| `Brüche erweitern, kürzen und vergleichen` | `2aa11de2-4cbc-5c4c-b024-c5483a94958f` | current divisibility atom is prerequisite only, not the target skill | `new_canonical_atom` |
| `Brüche und Dezimalbrüche ineinander umwandeln` | `5cb98b8f-6aac-5a00-aaf4-57db0223abeb`, `9e6c6b5c-9a05-5e8c-affa-e2156a782022`, `1bd6fc10-3149-5617-8bd0-93bba977ce88` | current canonical graph has rounding and powers, but not the conversion atom itself | `new_canonical_atom` |
| `Rationale Zahlen an der Zahlengeraden darstellen und ordnen` | `37111b61-0ec2-5768-b19c-16b42cbf3b9f` | no clean canonical atom yet for signed fractional number-line work | `new_canonical_atom` |
| `Rationale Zahlen addieren und subtrahieren` | `c8b47f9b-1b66-5532-a413-e8640f9393e9`, `fc9f6f92-3413-5d08-b34e-495a9842b70e`, `c9989d33-f558-5f2d-87fc-df688f5e942d`, `5343da29-6c71-51d5-b7da-3acaad01988a`, `502b1839-1208-57db-ae9d-65c6003e5de9` | current broad J6 atom is too coarse, J5 additive atoms are prerequisite only | `new_canonical_atom` |
| `Rationale Zahlen multiplizieren und dividieren` | `2ebe83ff-92fb-5361-a22c-59e9dabc8da0`, `07e0b570-57a9-5439-9e48-53da16598592` | current broad J6 atom is too coarse, J5 multiplicative atom is prerequisite only | `new_canonical_atom` |
| `Potenzen mit rationalen Basen und negativen Exponenten deuten und berechnen` | `5b08c1b6-30ef-54bd-b37e-9edec60a135d` | existing powers atom is too narrow because it stops at natural exponents and powers of ten | `new_canonical_atom` |
| `Terme mit rationalen Zahlen strukturiert berechnen` | `81b0008e-77cc-59eb-b47f-ff771798feea`, `208542fe-e324-569a-a8ba-80924e363909`, `fdd34616-ed0d-5113-ad65-db5efb5e132e`, `a078cf03-1512-56ad-b635-f065a190e8e3` | existing term-order atom is prerequisite only and does not cover the full M6 rational-number target | `new_canonical_atom` |

Planned implementation order:

- first refactor the broad J6 rational-number goal into a cluster without changing its stable public ID
- then add the eight finer atoms above
- then map the Bavaria `M6 1.*` leaves onto those atoms
- only after the Bavaria tranche is stable, review whether any of the new J6 atoms should also be widened to `DE-HE` through exact evidence or override-backed closure


### 2026-03-19: J6 rationale numbers expansion

Approach used:

- preserved the existing broad J6 rational-number goal ID and refactored it from an atomic goal into a stable cluster, mirroring the J5 geometry strategy
- applied the documented `reuse-first` plan: the new J6 atoms reuse J5 arithmetic prerequisites where possible and only add granularity where the canonical graph did not yet isolate the M6 targets cleanly
- scoped the new fine-grained J6 atoms initially to `DE-BY`, because this patch is still source-backed by the Bavaria M6 slice and no Hessen leaf review has been performed yet
- recomputed cluster weights from unique atomic descendants so the J6 and root-level progress semantics remain proportional after the split

Applied changes:

- refactored `Rationale Zahlen darstellen und berechnen` into a cluster
- added eight J6 rational-number atoms for fraction concepts, comparison, decimal conversion, number-line ordering, additive arithmetic, multiplicative arithmetic, powers with rational bases, and term evaluation with rational numbers
- wired each new atom to existing J5 prerequisites instead of duplicating earlier foundational goals

Deferred on purpose:

- no Bavaria mapping tranche yet for the new J6 atoms
- no Hessen applicability widening or override review yet for the new J6 atoms
- no validator or CI run in this patch step


### 2026-03-19: J6 Bavaria rational-number mapping tranche

Approach used:

- mapped the full Bavaria `M6 1.*` rational-number leaf set onto the new J6 canonical atoms while keeping the repository's one-legacy-to-one-canonical invariant intact
- upgraded the broad Bavaria `M6 1` cluster mapping to `exact` after the J6 rational-number refactor, because the canonical cluster now mirrors the Bavaria block deliberately
- used `exact` only where the Bavaria leaf matches the new canonical atom tightly; left the remaining leaves on `partial` where the source still mixes adjacent subskills such as conceptual interpretation, strategy choice, or plausibility checks

Applied changes:

- added nineteen Bavaria `M6 1.*` mappings onto the new J6 rational-number atoms
- upgraded `M6 1 Rationale Zahlen` from `partial` to `exact`
- updated the repository-backed Bavaria mapping fixture to the new mapping count and representative M6 tuples

Deferred on purpose:

- no `M6 2` or `M6 3` Bavaria mapping tranche yet
- no Hessen review for the new J6 rational-number atoms yet
- no validator or CI run in this patch step


### 2026-03-19: J6 area and volume expansion plus Bavaria mapping tranche

Approach used:

- kept the existing J6 area-volume cluster as the stable public anchor and added only the three geometry atoms that were missing after the reuse-first audit
- avoided new cross-jurisdiction prerequisite breaks by not wiring the new `DE-BY`-only atoms into the existing `DE-HE`-visible J6 atoms yet
- upgraded the broad Bavaria `M6 2` cluster mapping to `exact` after the canonical J6 cluster now mirrors the Bavaria block more faithfully
- stayed conservative on the leaf mappings: `exact` only for the derivation and volume-unit/formula atoms, `partial` for the broader application goals that still mix adjacent modeling or argumentation aspects

Applied changes:

- added three new J6 geometry atoms for deriving area formulas, justifying the cuboid volume formula, and interpreting/converting volume units
- sharpened the existing J6 area and solid-calculation descriptions to mention the relevant M6 figure families and unit handling more explicitly
- added the Bavaria `M6 2.1` and `M6 2.2` leaf mappings and updated the repository-backed Bavaria mapping fixture to the new count

Deferred on purpose:

- no `M6 3 Prozentrechnung, Daten und Diagramme` tranche yet
- no Hessen review for the new J6 geometry atoms yet
- no validator or CI run in this patch step


### 2026-03-19: J6 percent, data and diagrams expansion plus Bavaria mapping tranche

Approach used:

- kept the existing J6 percent/data node as the stable public anchor and refactored it into a cluster instead of replacing the public ID
- stayed `reuse-first`: no late Q3 data goals were reused blindly, because they model broader upper-secondary statistics and would have created a second, phase-skipping data route instead of a clean J6 slice
- scoped the five new fine-grained J6 atoms initially to `DE-BY` only, because this tranche is still backed by the Bavaria M6.3 source block and no Hessen leaf review has been done yet
- upgraded the broad Bavaria `M6 3` cluster mapping to `exact` after the canonical J6 cluster now mirrors the source block intentionally
- stayed conservative on leaf match quality: the representation/frequency leaf remains `partial`, while the tighter percentage-text, diagram-critique and arithmetic-mean leaves are mapped `exact`

Applied changes:

- refactored `Prozentrechnung anwenden und Daten auswerten` into a J6 cluster with five atoms for basic percentage problems, percentage-text interpretation, frequencies, critical diagram reading, and arithmetic mean
- wired the new atoms to the existing J5/J6 arithmetic foundations without duplicating earlier number or ratio goals
- added the Bavaria `M6 3` leaf mappings and updated the repository-backed Bavaria mapping fixture to the new mapping count

Deferred on purpose:

- no Hessen review for the new J6 percent/data atoms yet
- no further J7/Q3 prerequisite tightening beyond keeping the broad J6 cluster as the compatibility bridge
- no validator or CI run in this patch step


### 2026-03-19: DE-HE closure for new J6 rational-number and percent/data atoms

Approach used:

- treated the new `APV-102` findings as the same repository constraint we already hit after the J5 split: the broad J6 clusters stayed visible in theory, but their newly introduced children were still `DE-BY`-only and therefore disappeared in the `DE-HE` projection
- stayed repo-conform by avoiding duplicate Hessen leaf mappings; the backend still requires one legacy source goal per canonical target mapping entry
- used the same closure mechanism as before: widen the newly introduced J6 atoms to `DE-HE` via `applicabilityOverrides` and record the deliberate override in the accepted-warning registry
- kept the fix minimal: no new `requires`, no additional Hessen mapping tranche, no speculative widening of later J7/Q3 atoms

Applied changes:

- widened all eight new J6 rational-number atoms to `DE-HE` via `extendedData.applicabilityOverrides`
- widened all five new J6 percent/data atoms to `DE-HE` via `extendedData.applicabilityOverrides`
- added the corresponding `APV-201` accepted warnings for the thirteen override-backed J6 atoms

Deferred on purpose:

- no Hessen source-specific leaf review yet for these J6 atoms
- no attempt to replace the overrides with cleaner Hessen one-to-one evidence in this patch step
- no validator or CI run in this patch step


### 2026-03-19: DE-HE closure for early J5 arithmetic prerequisites after the J6 widening

Approach used:

- treated the follow-up `APV-102` findings as the next layer of the same prerequisite-visibility chain: the new J6 atoms were now visible in `DE-HE`, but some of their early J5 arithmetic prerequisites were still `DE-BY`-only
- again stayed repo-conform by avoiding duplicate Hessen mappings and using the existing override-backed closure pattern instead
- kept the fix minimal and local to the five missing J5 arithmetic atoms that actually appear in the failing prerequisite list

Applied changes:

- widened `Stellenwertsystem und Zahlendarstellungen verstehen`, `Natürliche Zahlen runden`, `Teilbarkeitsregeln prüfen und Primfaktorzerlegungen angeben`, `Potenzen mit natürlichen Exponenten und Zehnerpotenzen verwenden`, and `Klammerterme und Rechenreihenfolge sicher auswerten` to `DE-HE` via `extendedData.applicabilityOverrides`
- added the corresponding `APV-201` accepted warnings for those five J5 arithmetic atoms

Deferred on purpose:

- no broader Hessen arithmetic leaf review beyond the prerequisite chain needed for the current validator findings
- no validator or CI run in this patch step


### 2026-03-19: J7 Bavaria variable-term mapping tranche

Approach used:

- started `M7` with the smallest useful Bavaria slice: `M7 1 Terme mit Variablen`
- stayed `reuse-first` and did not split the canonical J7 algebra anchor yet; instead, the tranche reuses the existing canonical goal `Terme mit Variablen aufstellen und umformen` wherever the Bayern source already fits that umbrella cleanly enough
- reused the existing early power atom for the Bavaria leaf on power laws instead of opening a second near-duplicate algebra target prematurely
- stayed conservative on match quality: only the broad `M7 1` cluster and the explicit term-transformation leaf were upgraded to `exact`; the remaining leaves stay `partial`

Applied changes:

- upgraded the Bavaria `M7 1 Terme mit Variablen` cluster mapping from `partial` to `exact`
- added nine Bavaria `M7 1.1` / `M7 1.2` leaf mappings onto the existing canonical J7 algebra anchor and the early power atom
- updated the repository-backed Bavaria mapping fixture to the new mapping count

Deferred on purpose:

- no canonical J7 algebra refactor yet; the current step is mapping-first
- no `M7 2` / `M7 3` Bavaria tranche yet
- no validator or CI run in this patch step


### 2026-03-19: J7 Bavaria symmetry-and-angle mapping tranche

Approach used:

- kept `M7 2 Geometrische Figuren: Symmetrie und Winkel` on the existing canonical J7 geometry anchor instead of splitting J7 geometry prematurely
- upgraded the broad Bavaria `M7 2` cluster to `exact`, because the canonical goal `Symmetrie und Winkel begründen` already mirrors this corridor closely enough at cluster level
- stayed conservative on the leaf mappings: all `M7 2.1` and `M7 2.2` leaves remain `partial`, because the Bavaria source mixes concrete construction routines, model references, historical/contextual framing, and multi-step proof language more tightly than the current canonical J7 geometry atom

Applied changes:

- upgraded the Bavaria `M7 2` cluster mapping from `partial` to `exact`
- added seven Bavaria `M7 2.1` / `M7 2.2` leaf mappings onto the existing canonical J7 geometry anchor
- updated the repository-backed Bavaria mapping fixture to the new mapping count

Deferred on purpose:

- no canonical J7 geometry split yet
- no `M7 3` or `M7 5` Bavaria tranche yet
- no validator or CI run in this patch step


### 2026-03-19: J7 Bavaria linear-equation and percentage tranche

Approach used:

- kept `M7 3 Lineare Gleichungen und Vertiefung der Prozentrechnung` on the existing canonical J7 algebra anchor instead of opening a new split before the current Bavaria slice actually demands it
- upgraded the broad Bavaria `M7 3` cluster to `exact`, because the canonical goal `Lineare Gleichungen lösen und Prozentrechnung vertiefen` already mirrors the corridor directly
- stayed conservative on the leaf mappings: the explicit equivalence-transformation leaf is `exact`, while equation setup, solution interpretation, and the broader applied-percentage leaf remain `partial`

Applied changes:

- upgraded the Bavaria `M7 3` cluster mapping from `partial` to `exact`
- added four Bavaria `M7 3` leaf mappings onto the existing canonical J7 algebra/percentage anchor
- updated the repository-backed Bavaria mapping fixture to the new mapping count

Deferred on purpose:

- no canonical J7 algebra split beyond the existing two anchors
- no `M7 5` Bavaria triangle/congruence tranche yet
- no validator or CI run in this patch step


### 2026-03-19: J7 Bavaria congruence-and-triangle mapping tranche

Approach used:

- kept `M7 5 Kongruenz, besondere Dreiecke und Dreieckskonstruktionen` on the existing canonical J7 triangle anchor instead of splitting the geometry branch prematurely
- upgraded the broad Bavaria `M7 5` cluster to `exact`, because the canonical goal `Kongruenz begründen und Dreieckskonstruktionen ausführen` already mirrors the corridor directly
- stayed conservative on leaf quality: concept introduction, converse logic, dynamic-geometry exploration, Thales work, tangent construction, and application modelling remain `partial`; the construction-heavy and special-triangle leaves are mapped `exact`

Applied changes:

- upgraded the Bavaria `M7 5` cluster mapping from `partial` to `exact`
- added nine Bavaria `M7 5` leaf mappings onto the existing canonical J7 triangle/congruence anchor
- updated the repository-backed Bavaria mapping fixture to the new mapping count

Deferred on purpose:

- no canonical J7 geometry split beyond the current shared anchors
- no `M8` Bavaria tranche yet
- no validator or CI run in this patch step


### 2026-03-19: M8 Bavaria function, rational-function, probability and geometry tranche

Approach used:

- kept the current canonical J8 corridor intact instead of opening a new split before the Bavaria `M8` slice actually forces one
- reused the existing cross-phase canonical atom `Funktionsbegriff und Darstellungen verstehen` for the explicit function-concept leaf in `M8 1`
- kept `M8 1 Funktion und Term` and `M8 2 Lineare Funktionen` on conservative partial cluster bridges where the current canonical function corridor is still broader than the Bavaria source wording
- upgraded the direct J8 corridor matches for elementary rational functions, fraction terms, Laplace experiments, linear systems, and circle/cylinder work where the canonical pilot already mirrors the Bavaria slice closely enough

Applied changes:

- completed the Bavaria `M8` mapping tranche across `M8 1` to `M8 7`
- upgraded the existing `M8 3`, `M8 4`, `M8 5`, `M8 6`, and `M8 7` cluster bridges from `partial` to `exact`
- upgraded the existing J8 rational-function and fraction-term leaf bridges from `partial` to `exact` where the canonical child atoms already match the Bavaria leaf goals directly
- added the missing Bavaria leaf mappings for the introductory function block, the remaining linear-function leaves, the Laplace block, the linear-system block, and the circle/cylinder block
- updated the repository-backed Bavaria mapping fixture to the new mapping count

Deferred on purpose:

- no new canonical split for the `M8 1` or `M8 2` function-introduction corridor yet; graph-reading and introductory function-language aspects still lean on partial bridges where the current canonical structure stays coarser than the Bavaria source
- no `M9` Bavaria audit yet
- no validator or CI run in this patch step


### 2026-03-19: M9 Bavaria quadratics, probability and trigonometry tranche

Approach used:

- kept the current canonical J9 corridor intact and reused the existing year-9 anchors instead of opening a new split before the Bavaria `M9` slice actually proves a missing atom
- treated `M9 2 Quadratische Funktionen` as a mixed corridor: the leaf level can already attach well to the existing quadratic-function, vertex, quadratic-equation, fraction-equation and linear-system anchors, while the broad Bayern cluster still needs `partial` umbrella bridges
- upgraded the direct J9 corridor matches for connected probability, similarity, power-function, Pythagoras and trigonometry blocks where the canonical pilot already mirrors the Bavaria slice closely enough
- stayed conservative on the root and advanced trig leaves where proof, Heron iteration, rationalisation, unit-circle work or broader strategy language exceed the current canonical atom granularity

Applied changes:

- completed the Bavaria `M9` mapping tranche across `M9 1` to `M9 7.2`
- upgraded the existing Bavaria `M9 3`, `M9 4`, `M9 5`, `M9 6`, `M9 7` and `M9 7.1` cluster bridges from `partial` to `exact`; `M9 7.2` stays `partial`
- upgraded the existing leaf bridges for connected probability, power-function graphs, Pythagoras calculations and right-triangle trigonometry where the canonical J9 atoms already match directly
- added the missing Bavaria leaf mappings for roots, quadratics, connected probability, similarity, extended power work, Pythagoras and both trigonometry subcorridors
- updated the repository-backed Bavaria mapping fixture to the new mapping count

Deferred on purpose:

- no new canonical split yet for the broader `M9 1` root corridor or the unit-circle/setup part of `M9 7.2`
- no `M10` Bavaria audit yet
- no validator or CI run in this patch step


### 2026-03-19: M10 Bavaria exponential, stochastic and trigonometric tranche

Approach used:

- reused the existing canonical J10 corridor without opening a new split for exponential growth, stochastic simulations, sinus/cosinus functions or polynomial basics
- upgraded `M10 1`, `M10 2`, `M10 3` and `M10 4` to `exact` at cluster level where the existing J10 anchors already inherit their provenance directly from the same Bavaria source corridors
- stayed conservative on most leaf mappings for sinus/cosinus functions, polynomial behaviour and the broad space-geometry continuation, because the current canonical atoms remain coarser than the detailed Bavaria leaf wording
- kept `M10 5 Fortführung der Raumgeometrie` on a deliberate `partial` bridge, since the current canonical J10 space-geometry atom is still too narrow for the full Bavaria cone/pyramid/sphere corridor

Applied changes:

- completed the Bavaria `M10` mapping tranche across `M10 1` to `M10 5`
- upgraded the existing cluster bridges for `M10 1`, `M10 2`, `M10 3` and `M10 4` from `partial` to `exact`
- upgraded the direct simulation and tree-rule leaves in `M10 2` to `exact`
- added the missing Bavaria leaf mappings for exponential growth, logarithms, sinus/cosinus functions, polynomial basics and the space-geometry continuation
- updated the repository-backed Bavaria mapping fixture to the new mapping count

Deferred on purpose:

- no new canonical split yet for the bogenmaß/einheitskreis detail in `M10 3`
- no new canonical split yet for the cone/pyramid/sphere-heavy `M10 5` corridor
- no validator or CI run in this patch step


### 2026-03-19: Residual Bavaria math partial-gap audit after M10

Audit result:

- after the `M5` to `M10` tranches, the Bavaria math landscape now has only `11` remaining `partial` bridges inside the year-5-to-year-10 corridor
- in addition, `17` intermediate Bavaria section nodes remain unmapped; these are broad subsection wrappers rather than missing leaf coverage

Residual `partial` bridges grouped by type:

- acceptable broad bridges for now:
  - `M5 3 Natürliche und ganze Zahlen – Multiplikation und Division` -> `Natürliche und ganze Zahlen multiplizieren und dividieren`
  - `M5 4 Größen und ihre Einheiten` -> `Größen und Einheiten vergleichen und umrechnen`
  - `M7 4 Kenngrößen von Daten` -> `Kenngrößen von Daten bestimmen und interpretieren`
  - `M8 1 Funktion und Term` -> `Funktionsgrundlagen (Sek I)`
  - `M8 2 Lineare Funktionen` -> `Funktionsgrundlagen (Sek I)`

- likely real canonical-structure gaps:
  - `M9 1 Quadratwurzeln` -> current canonical atom is too narrow for the full Bavaria corridor with irrationality, Heron iteration, root-term algebra and rationalisation
  - `M9 2` / `M9 2.1` / `M9 2.2` -> the current quadratic corridor is distributed over several atoms, but still lacks a cleaner shared quadratic cluster for exact subsection anchoring
  - `M9 7.2 Sinus- und Kosinussatz` -> unit-circle and setup aspects still exceed the current `Sinus- und Kosinussatz nutzen` atom
  - `M10 5 Fortführung der Raumgeometrie` -> the current J10 space-geometry atom is too coarse for the Bavaria cone/pyramid/sphere continuation

Unmapped intermediate subsection nodes:

- `M5`:
  - `M5 1.1`
  - `M5 1.2`
  - `M5 3.1`
  - `M5 3.2`
  - `M5 4.1`
  - `M5 4.2`

- `M6`:
  - `M6 1.1`
  - `M6 1.2`
  - `M6 1.3`
  - `M6 1.4`
  - `M6 1.5`
  - `M6 2.1`
  - `M6 2.2`

- `M7`:
  - `M7 1.1`
  - `M7 1.2`
  - `M7 2.1`
  - `M7 2.2`

Interpretation:

- the remaining subsection-node gaps are mainly mapping hygiene and do not indicate missing Bavaria leaf coverage
- the next canonical-modeling work should focus on the four real gap zones instead of broad cleanup

Recommended next patch order:

1. `M10 5 Fortführung der Raumgeometrie`
2. `M9 7.2 Sinus- und Kosinussatz` plus unit-circle preparation
3. `M9 1 Quadratwurzeln`
4. only afterwards: subsection-node mapping cleanup for `M5` to `M7`


### 2026-03-19: J10 space-geometry split for Bavaria M10 5

Approach used:

- refactored the existing canonical J10 space-geometry atom `6248bbd7-c7e8-4f91-b3dc-de885cf5abce` into a cluster while retaining its ID as the stable corridor anchor
- reused the existing circle/cylinder, pythagoras, right-triangle trigonometry and sinus/cosinus-law prerequisites instead of duplicating earlier geometry content
- introduced only the six missing J10 atoms that the Bavaria `M10 5` corridor actually isolates: bodies and nets, solids of revolution, cone surface area, pyramid/cone volumes, sphere formulas and applied space-geometry modeling
- kept the new J10 atoms voorlopig on `DE-BY` only; no Hessen closure decision was folded into this patch step

Applied changes:

- split the canonical J10 space-geometry corridor into one retained cluster plus six new atomic descendants
- remapped the Bavaria `M10 5` cluster and all six leaf goals onto the refined canonical J10 space-geometry atoms
- upgraded the Bavaria `M10 5` cluster bridge from `partial` to `exact` now that the canonical corridor mirrors the Bavaria subsection directly
- updated the repository-backed Bavaria math mapping fixture to the new J10 space-geometry targets

Deferred on purpose:

- no `DE-HE` applicability review yet for the six new J10 space-geometry atoms
- no validator or CI run in this patch step


### 2026-03-19: Hessen closure for the new J10 space-geometry split

Approach used:

- kept the J10 space-geometry split itself unchanged and closed only the missing Hessen visibility chain
- avoided new Hessen one-to-many mappings and used the established math closure mechanism via `extendedData.applicabilityOverrides`
- opened exactly the six new J10 space-geometry atoms for `DE-HE`, because the broad retained cluster `6248bbd7-c7e8-4f91-b3dc-de885cf5abce` is already referenced by visible Hessen goals

Applied changes:

- added `DE-HE` applicability overrides to all six new J10 space-geometry atoms
- added the corresponding `APV-201` accepted-warning entries for the Hessen math prerequisite bridge rationale

Deferred on purpose:

- no new Hessen leaf-mapping tranche for these J10 atoms
- no validator or CI run in this patch step


### 2026-03-19: J9 trigonometry split for Bavaria M9 7.2

Approach used:

- kept the existing J9 trigonometry bridge cluster `219ce079-6bfd-4827-8b66-5dd199e44686` and refactored only the broad child `0cefa694-636e-4c4b-abff-3ac3750dca18`
- split the old mixed atom into exactly the two Bavaria `M9 7.2` strands that had been entangled before: unit-circle based sign/orientation work and the proof/application corridor for sinus- and cosine-law work
- reused the existing right-triangle trigonometry atom as the shared prerequisite instead of opening a wider trigonometric dependency fan
- closed Hessen visibility immediately for the two new J9 atoms via the established override-backed prerequisite bridge, because the retained HE corridor already depends on the broad J9 trig bridge

Applied changes:

- refactored `0cefa694-636e-4c4b-abff-3ac3750dca18` from atomic goal to J9 trig cluster
- added the two new canonical J9 atoms for unit-circle sine/cosine values in degree measure and for proving/applying the sine and cosine laws
- upgraded the Bavaria `M9 7.2` cluster bridge from `partial` to `exact` and remapped both Bavaria leaf goals to the new canonical atoms
- updated the Bavaria mapping fixture and added the two matching `APV-201` accepted-warning entries for the Hessen prerequisite bridge

Deferred on purpose:

- no new Hessen legacy leaf-mapping tranche for these J9 atoms
- no validator or CI run in this patch step


### 2026-03-19: J9 square-roots split for Bavaria M9 1

Approach used:

- refactored the old broad J9 square-root atom `8a0b0baf-c7e6-43df-a470-f56050ecaa46` into a retained cluster so downstream references stay stable
- split the corridor into the five Bavaria `M9 1` strands that were previously collapsed: square-root basics, irrationality/reals, Heron iteration, radical arithmetic, and rationalisation/partial extraction
- tightened the sequencing for `Quadratische Gleichungen loesen` by replacing the former broad cluster prerequisite with the two new root atoms that are actually needed there
- closed Hessen visibility immediately for the new J9 root atoms via the established override-backed prerequisite bridge

Applied changes:

- turned the old J9 square-root atom into a five-child cluster
- upgraded the Bavaria `M9 1` cluster bridge from `partial` to `exact` and remapped all five Bavaria leaf goals to dedicated canonical J9 root atoms
- rewired the canonical quadratic-equations goal away from the broad root cluster to the relevant fine-grained root prerequisites
- updated the Bavaria mapping fixture and added the five matching `APV-201` accepted-warning entries for the Hessen prerequisite bridge

Deferred on purpose:

- no new Hessen legacy leaf-mapping tranche for these J9 root atoms
- no validator or CI run in this patch step


### 2026-03-19: J9 quadratics split for Bavaria M9 2

Approach used:

- repurposed the old broad quadratic-function atom `5a9702f4-7e4d-457d-b98c-f0bafcd1e386` into a retained J9 quadratics cluster so downstream references stay stable
- separated the Bavaria `M9 2` corridor into a foundations branch and an applications branch instead of keeping subsection mappings on a single coarse atom
- reused the existing canonical atoms for solving quadratic equations, vertex work, linear systems and rational equations wherever they already matched cleanly
- introduced only the missing atoms for parameter effects, graph-property reading, form switching, deriving quadratic functions from conditions, and modelling with quadratic functions
- opened the new J9 quadratic clusters and atoms for `DE-HE` via the established override-backed prerequisite bridge

Applied changes:

- turned `5a9702f4-7e4d-457d-b98c-f0bafcd1e386` into a J9 quadratics cluster with a foundations and an applications subtree
- upgraded the Bavaria cluster mappings `M9 2`, `M9 2.1` and `M9 2.2` from `partial` to `exact`
- remapped the previously broad Bavaria leaf bridges in `M9 2` to dedicated canonical quadratic atoms
- rewired the J9 year anchor so the quadratic corridor hangs under the retained quadratics cluster instead of duplicating the old subclusters directly
- updated the Bavaria mapping fixture and added the matching `APV-201` accepted-warning entries for the Hessen prerequisite bridge

Deferred on purpose:

- no new Hessen legacy leaf-mapping tranche for the new J9 quadratic atoms
- no validator or CI run in this patch step


### 2026-03-19: J9 quadratics inheritance fix after validator feedback

Approach used:

- kept the new J9 quadratics split intact and corrected only the placement of the didactic prerequisite
- removed the foundation prerequisite from the broad J9 applications cluster because that cluster intentionally reuses the older J8 atom `797ee047-b8dd-45cf-880e-98571a56c690` for rational equations
- attached the foundation prerequisite only to the J9-specific modelling atom, where the later-phase dependency is didactically justified

Applied changes:

- cleared the direct `requires` edge from the J9 applications cluster `0d4a6f56-2f87-4c39-98ab-5f13f5cbdd40`
- added the same prerequisite explicitly to the J9 modelling atom `a7ccb7a9-6fb0-4e2d-b6e0-6420cc5ae0bf`

Deferred on purpose:

- no validator or CI run in this patch step


### 2026-03-19: Bavaria math residual audit for Jgst. 5-10 after the M5-M10 wave

Audit scope:

- Bavaria source corridor restricted to the descendants of `Jahrgangsstufe 5` through `Jahrgangsstufe 10`
- excludes Bavaria `M11` to `M13`, because those were not part of the current migration tranche

Observed state:

- corridor size: `246` Bavaria source goals
- remaining `partial` mappings: `103`
- remaining unmapped source goals: `31`
- of those unmapped goals:
  - `17` are subsection clusters
  - `14` are atomic goals

Interpretation:

- the residual set is no longer dominated by missing year-level coverage; the year clusters are already mapped and the remaining work is mostly local cleanup
- the `17` unmapped subsection clusters are primarily mapping-hygiene debt, not canonical blind spots:
  - `M5 1.1`, `M5 1.2`, `M5 3.1`, `M5 3.2`, `M5 4.1`, `M5 4.2`
  - `M6 1.1` through `M6 1.5`
  - `M6 2.1`, `M6 2.2`
  - `M7 1.1`, `M7 1.2`, `M7 2.1`, `M7 2.2`
- the largest remaining `partial` hot clusters are broad canonical anchors rather than newly missing Bavaria coverage:
  - `5d17ebb4-4e27-4f9c-8d0b-3520f34b2e11` trigonometrische Funktionen (`7` partial leaves)
  - `8da730f1-8947-498d-9e78-7fb20b00a994` J7-Geometrieanker (`7`)
  - `fd860da9-73ba-47cd-a1a8-452424915a80` J7-Algebra/Termanker (`7`)
  - `f0a49da2-018b-4cda-adbd-27047b610a0f` Kongruenz-/Konstruktionsanker (`6`)
  - `1f89d69e-ead1-424b-8221-fae37fdea2bc` J6-Fläche/Volumen-Anwendungen (`5`)

Residual gap judgment:

- strongest remaining canonical gap candidate:
  - `M7 4 Kenngrößen von Daten`
  - still only a broad cluster bridge, while the Bavaria source still leaves the three atomic strands unmapped:
    - median / boxplots
    - quartiles / spread
    - extracting information from boxplots
- plausible secondary gap candidates, but lower priority than `M7 4`:
  - early counting-principle atom in `M5 3.1`
  - basic multiplicative equation atom in `M5 3.1`
- most other remaining atomic `partial` bridges are acceptable breadth mismatches for now, not evidence of missing canonical structure

Recommended order from this audit:

1. close the real content gap around `M7 4` descriptive statistics
2. then do the subsection-cluster cleanup for `M5` to `M7`
3. only afterwards revisit the broad but acceptable `partial` bridges if a stricter exactness target is needed


### 2026-03-19: Reuse-first patch plan for Bavaria M7 4 descriptive statistics

Reuse baseline already present in canonical math:

- `91571d3f-3651-4477-ba21-320fc4077453` `Absolute und relative Häufigkeiten bestimmen und darstellen`
- existing J6 percentage/data corridor already also contains atoms for:
  - diagram interpretation
  - arithmetic mean
- current Bavaria `M7 4` umbrella still lands only partially on the broad canonical bridge `075ef99c-7f84-48b5-97f1-4e28c7d78f95`

Source-side residual structure in Bavaria `M7 4`:

- one already partially mapped leaf bundles absolute/relative frequencies together with early aggregate use
- three source leaves still expose the actual remaining gap more clearly:
  - median use
  - quartiles / spread / boxplots
  - extracting information from boxplots and known descriptive measures

Patch recommendation:

1. refactor `075ef99c-7f84-48b5-97f1-4e28c7d78f95` from broad atom to retained cluster
2. reuse the existing atoms for:
  - absolute and relative frequencies
  - arithmetic mean
  - generic diagram interpretation where it already fits
3. add only the missing descriptive-statistics atoms:
  - `Median bestimmen und mit dem arithmetischen Mittel vergleichen`
  - `Spannweite und Quartile bestimmen und Boxplots erstellen`
  - `Datenverteilungen mithilfe von Kenngrößen und Boxplots vergleichen und deuten`

Expected mapping consequence:

- the mixed Bavaria leaf that currently combines frequencies with early aggregate use will likely remain `partial`, because the source bundles more than one fine-grained canonical atom and the mapping layer is intentionally one-to-one
- the median / quartile / boxplot corridor should become cleanly mappable without opening duplicate canonical data goals

Decision rationale:

- this is the smallest patch that closes the last clearly visible Sek-I data-analysis gap
- it avoids inventing a duplicate “descriptive statistics basics” atom just to force one exact mapping for a bundled Bavaria leaf
- it keeps the canonical graph aligned with the established rule: exactness where the source isolates a didactic strand cleanly, partial where the source intentionally bundles multiple strands


### 2026-03-19: J7 descriptive-statistics split for Bavaria M7 4

Approach used:

- refactored the broad J7 data-indicators atom `075ef99c-7f84-48b5-97f1-4e28c7d78f95` into a retained cluster so downstream references stay stable
- kept the already reusable arithmetic-mean atom outside the new cluster and used it as an explicit prerequisite instead of duplicating a J7 copy of the same competence
- introduced only the three missing descriptive-statistics atoms that Bavaria `M7 4` actually isolates cleanly:
  - median versus arithmetic mean
  - quartiles / range / boxplots
  - comparing data distributions with indicators and boxplots
- closed Hessen visibility immediately for the three new J7 atoms via the established override-backed prerequisite bridge

Applied changes:

- turned `075ef99c-7f84-48b5-97f1-4e28c7d78f95` into a three-child J7 data-indicators cluster
- upgraded the Bavaria `M7 4` cluster bridge from `partial` to `exact`
- mapped the three Bavaria `M7 4` leaves exactly to the new canonical J7 descriptive-statistics atoms
- updated the Bavaria mapping fixture and added the three matching `APV-201` accepted-warning entries for the Hessen prerequisite bridge

Deferred on purpose:

- no subsection-cluster cleanup for `M5` to `M7` in this patch step
- no validator or CI run in this patch step


### 2026-03-19: Bavaria M5-M7 subsection-cluster cleanup

Approach used:

- treated the remaining unmapped subsection nodes in `M5` to `M7` as mapping-hygiene work, not as a new canonical-authoring wave
- mapped each subsection cluster to the closest existing canonical corridor that its already mapped children were predominantly using
- kept these bridges deliberately `partial`, because these subsection clusters still bundle multiple finer canonical atoms and the mapping layer stays one-to-one

Applied changes:

- added subsection-cluster mappings for:
  - `M5 1.1`, `M5 1.2`, `M5 3.1`, `M5 3.2`, `M5 4.1`, `M5 4.2`
  - `M6 1.1` to `M6 1.5`
  - `M6 2.1`, `M6 2.2`
  - `M7 1.1`, `M7 1.2`, `M7 2.1`, `M7 2.2`
- updated the Bavaria mapping fixture to the new repository-backed mapping size

Resulting interpretation:

- the remaining residual Bavaria Sek-I math gaps are now concentrated much more clearly in true leaf-level breadth mismatches instead of administrative subsection omissions
- this makes the next residual audit materially sharper, because the unmapped set is no longer inflated by missing subsection wrappers

Deferred on purpose:

- no new canonical atoms in this cleanup step
- no validator or CI run in this patch step


### 2026-03-19: Updated residual Bavaria Sek-I math audit after subsection cleanup

Scope used:

- Bavaria Gymnasium mathematics source corridor `Jahrgangsstufe 5` to `Jahrgangsstufe 10`
- source file: `curricula/DE/Gymnasium/input/BY/gymnasium/Mathematik.json`
- mapping file: `curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_to_canonical_math.json`

Current repository-backed counts for the reviewed Sek-I corridor:

- total source goals in scope: `246`
- mapped goals: `235`
- of those mapped:
  - `116` `exact`
  - `119` `partial`
- remaining unmapped goals: `11`

Remaining unmapped goals are now concentrated in a single early corridor rather than spread across later-year canonical gaps.

Residual unmapped set:

- `M5` arithmetic / early-process leaves only:
  - natural-number infinity / very large-number orientation
  - checking integer statements with counterexamples
  - arithmetic-advantage leaves around commutativity / associativity / distributivity
  - one early counting-principle leaf
  - one multiplication/division-equation leaf
  - one term-structure leaf for whole-number mixed operations
  - two problem-solving / heuristic / application leaves with whole numbers
  - one benchmark-based estimation leaf

Residual `partial` hotspots by size:

- `8da730f1-8947-498d-9e78-7fb20b00a994` J7 symmetry / angle geometry corridor: `9`
- `fd860da9-73ba-47cd-a1a8-452424915a80` J7 algebra corridor: `9`
- `5d17ebb4-4e27-4f9c-8d0b-3520f34b2e11` J9 trigonometric-functions corridor: `7`
- `1f89d69e-ead1-424b-8221-fae37fdea2bc` J6/J10 volume-surface corridor: `6`
- `f0a49da2-018b-4cda-adbd-27047b610a0f` J7 congruence / Thales corridor: `6`

Residual-gap judgment:

- the remaining large `partial` groups are mostly acceptable breadth mismatches, not evidence of another urgent canonical modeling hole
- after the J7/J9/J10 splits already completed, the sharpest remaining uncovered content is no longer in later-year function or geometry corridors
- the real residual blind spot is now the early Bavaria `M5` arithmetic/process layer, because all `11` unmapped goals sit there

Recommended next patch wave:

1. close the remaining `M5` unmapped arithmetic/process leaves
2. keep the broad J7/J9 partial corridors as reviewed breadth mismatches unless a stricter exactness target is explicitly needed
3. only after the `M5` closure, decide whether any of the large partial hotspots merit another canonical split at all


### 2026-03-19: Reuse-first patch plan for residual Bavaria M5 arithmetic/process closure

Residual source leaves still unmapped in the Bavaria Sek-I scope:

- natural-number infinity / naming very large numbers
- checking integer statements with counterexamples
- arithmetic-advantage leaves for addition/subtraction and multiplication/division
- early counting-principle leaf
- multiplication/division-equation leaf
- mixed-operation term-structure leaf
- heuristic problem-solving / application leaves with whole numbers
- benchmark-based estimation leaf

High-confidence reuse targets already present in the canonical J5 corridor:

- `624764d6-becd-5f9b-ada3-0d4f9d143073` `Stellenwertsystem und Zahlendarstellungen verstehen`
- `fe07241a-b779-5f35-a82d-7aa51ae74f42` `Natürliche Zahlen runden`
- `4b67bed9-06da-40b2-a306-24e9e7dfd390` early whole-number / integer number corridor
- `cafd6520-c4af-4109-9863-cc49ba6fad4d` early multiplication/division corridor
- `5d1decb2-b01b-5c85-88fc-9fc255ff9776` `Klammerterme und Rechenreihenfolge sicher auswerten`
- `ca9093cd-9ccf-5fb4-9dd8-bf4f92af4e70` simple proportional / measure-context problem solving

Likely true residual canonical gaps:

1. `Natürliche Zahlen als unbegrenzt fortsetzbar verstehen und große Zahlbezeichnungen sicher verwenden`
2. `Aussagen über ganze Zahlen prüfen und mit Gegenbeispielen widerlegen`
3. `Einfache Multiplikations- und Divisionsgleichungen durch Umkehroperationen lösen`
4. `Rechenvorteile mit Kommutativ-, Assoziativ- und Distributivgesetz gezielt nutzen`
5. `Problemstellungen mit ganzen Zahlen heuristisch lösen und Lösungswege dokumentieren`
6. `Größen in Sachsituationen mithilfe von Bezugsgrößen schätzen`

Open review candidate before authoring a new atom:

- `Zählprinzip in einfachen realitätsnahen Kontexten systematisch anwenden`

Reason:

- this leaf may deserve a small early counting atom
- but first it should be checked against the existing stochastic / combinatorial entry corridor to avoid inventing a duplicate precursor if a reusable canonical node already exists

Planned patch order:

1. verify whether the early counting-principle leaf can reuse an existing canonical atom
2. add only the six clearly missing J5 arithmetic/process atoms listed above
3. remap the `11` remaining Bavaria M5 leaves
4. keep any still bundled source leaf on `partial` if it genuinely mixes more than one of the new fine-grained strands

Expected result:

- the Bavaria Sek-I pilot should then have no obvious unmapped `M5` blind spot left
- remaining residual debt would mostly be deliberate `partial` breadth mismatches rather than missing canonical authoring


### 2026-03-19: Residual Bavaria M5 arithmetic/process closure

Approach used:

- kept the existing J5 arithmetic and measurement clusters as retained anchors instead of opening another large structural refactor
- reused the existing term-structure atom `5d1decb2-b01b-5c85-88fc-9fc255ff9776` for the previously unmapped mixed-operation leaf
- added only the genuinely missing early J5 atoms for:
  - unbounded natural-number understanding and large-number naming
  - checking integer statements with counterexamples
  - arithmetic advantages from commutative / associative laws
  - basic multiplicative equations via inverse operations
  - simple counting principles in contextual situations
  - heuristic whole-number problem solving with documented solution paths
  - benchmark-based estimation in quantity contexts
- closed Hessen visibility for these new prerequisite atoms directly via the established override-backed bridge

Applied changes:

- expanded the retained J5 arithmetic cluster `8dd5199b-f614-4ebd-8819-b5ff37326524` with six new early-process atoms and recomputed its weight
- expanded the retained J5 measurement-application cluster `b40bebc2-91e3-5aac-916d-43247ee08d09` with one new estimation atom and recomputed its weight
- updated the J5 year anchor weight accordingly
- mapped the `11` previously unmapped Bavaria `M5` leaves:
  - `10` to the newly added J5 atoms
  - `1` (`4d77f5fc-016f-527e-a1c3-44797aead19a`) to the already existing term-structure atom
- updated the repository-backed Bavaria mapping fixture and added the corresponding Hessen `APV-201` accepted-warning entries

Resulting interpretation:

- the Bavaria Sek-I pilot no longer has an obvious unmapped `M5` blind spot
- remaining residual debt now sits predominantly in deliberate `partial` breadth mismatches rather than in missing canonical J5 authoring


### 2026-03-20: Validation pass after Bavaria M5 arithmetic/process closure

Validation used:

- `./run_ci.sh`

Validation result:

- `./run_ci.sh` passed after the residual Bavaria `M5` closure commit
- the repository-backed Bavaria Sek-I mathematics review corridor `Jahrgangsstufe 5-10` is now fully mapped:
  - total source goals in scope: `246`
  - mapped goals: `246`
  - of those mapped:
    - `126` `exact`
    - `120` `partial`
  - remaining unmapped goals: `0`

Interpretation:

- the Bavaria Sek-I mathematics pilot no longer has an unmapped reviewed-source gap in the `J5-J10` corridor
- the next substantive work should therefore not be another residual Bavaria `M5` authoring patch
- the next widening step should move back to applicability-review scope using `docs/dev/canonical-gymnasium-applicability-design.md` and its `R1-R7` / `A1-A5` review gates


### 2026-03-20: Bavaria function-value applicability debt reduced from `APV-201` to `APV-202`

Approach used:

- reviewed the two remaining Bavaria math function-value visibility cases that still relied on explicit `DE-BY` applicability overrides
- replaced each override-backed visibility path with the narrowest reviewed Bavaria source bridge that still fits as a `partial` mapping
- kept the canonical goal semantics unchanged; only the Bavaria review basis and warning family changed

Applied changes:

- remapped Bavaria source leaf `32a0f358-c1e9-5663-b8cf-67789355387c` from the broad function-concept atom to `Funktionswerte aus Graphen ablesen`
- remapped Bavaria source leaf `7ee3da1c-1f20-5038-9828-ab74e0e1e49f` from the broad J7 variable-term corridor to `Funktionswerte berechnen`
- removed the explicit `extendedData.applicabilityOverrides.jurisdiction = ["DE-BY"]` entries from the two canonical function-value goals
- converted the two accepted Bavaria math findings from `APV-201` to `APV-202` in the accepted-warning registry

Validation used:

- `npm run validate:view-filters`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`

Validation result:

- `validate:view-filters` still passes and now classifies the two reviewed Bavaria function-value cases as accepted `APV-202` findings instead of explicit-override `APV-201` findings
- the repository-backed Bavaria math mapping fixture test passes with the reviewed remap tuples

Interpretation:

- reviewed Bavaria math no longer depends on Bavaria-specific explicit applicability overrides for the canonical function-value pair
- the residual Bavaria math debt on this slice is now partial-bridge review debt, not override debt


### 2026-03-20: Bavaria music partial-bridge debt reduced by two exact upgrades

Approach used:

- reviewed the smallest remaining non-math `APV-202` slice in the Bavaria pilot set
- kept the canonical music structure stable and only sharpened two E-phase atom descriptions so they match both the Hessen source wording and the reviewed Bavaria leaf wording
- upgraded the two Bavaria music bridges to `exact` where the reviewed canonical wording now covers the source goals tightly enough

Applied changes:

- refined `Grundformen erkennen` into `Satzstruktur und Grundformen erkennen`
- refined `Proben organisieren` into `Gestaltungs- und Probenprozesse organisieren`
- upgraded the Bavaria music mappings for `4e9fd039-4532-5337-b06a-083eca009613` and `8a850d1b-f325-5a40-bac1-0c06517c902c` from `partial` to `exact`
- removed the two corresponding Bavaria music `APV-202` entries from the accepted-warning registry

Validation used:

- `npm run validate:view-filters`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`

Validation result:

- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `186` accepted warnings
- accepted reviewed warnings dropped from `193` to `191`
- the repository-backed mapping fixture test still passes

Interpretation:

- the reviewed Bavaria music pilot no longer carries any accepted `APV-202` debt on the currently reviewed surface
- the next applicability-review candidate should now come from a larger remaining `APV-202` lane such as Bavaria Latin, Bavaria economics, Bavaria politics/economics, Bavaria biology, or Bavaria history


### 2026-03-20: Bavaria Latin partial-bridge debt cleared by five exact upgrades

Approach used:

- reviewed the smallest remaining language-side `APV-202` lane in the Bavaria pilot set after music
- kept the canonical Latin structure stable but replaced five placeholder-like atom labels with source-aligned operational wording
- upgraded only those Bavaria bridges whose reviewed source leaves now fit the canonical targets one-to-one

Applied changes:

- refined `Grammatik festigen` into `Lektürespezifische Grammatikphänomene analysieren`
- refined `Grundinterpretation` into `Originaltexte grundlegend interpretieren`
- refined `Kontext/Autoren` into `Autoren, Werke und Kontexte einordnen`
- refined `Interpretation` into `Kommunikations- und Ethikfragen interpretieren`
- refined `Vergleich/Transfer` into `Rhetorische Texte vergleichen und Transfer leisten`
- upgraded the five Bavaria Latin mappings for `192be448-1888-5f15-a100-38c58f74dd58`, `4b3bef2c-a27d-5334-b2cf-53548ab5a438`, `ec10b9a4-fc64-5e8f-a19b-45a187c39017`, `35793922-864f-5739-a56c-42ad6df8410a`, and `b952bb09-3ff6-573c-9a41-0575345e4e5a` from `partial` to `exact`
- removed the five corresponding Bavaria Latin `APV-202` entries from the accepted-warning registry

Validation used:

- `npm run validate:view-filters`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`

Validation result:

- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `186` accepted warnings
- accepted reviewed warnings dropped from `191` to `186`
- the repository-backed mapping fixture test still passes

Interpretation:

- the reviewed Bavaria Latin pilot no longer carries any accepted `APV-202` debt on the currently reviewed surface
- the next applicability-review candidate should now come from a larger remaining `APV-202` lane such as Bavaria economics, Bavaria politics/economics, Bavaria biology, or Bavaria history


### 2026-03-20: Bavaria physics override-backed applicability debt reduced from six cases to four

Approach used:

- reviewed the smallest remaining accepted-warning lane after the Latin pass and found that Bavaria physics was still dominated by explicit `DE-BY` override debt rather than ordinary partial-bridge debt
- preferred reviewed Bavaria source bridges over canonical re-authoring: two previously unmapped Bavaria mechanics leaves were promoted to partial bridges, while the earlier attempt to repoint broader reviewed cluster bridges was discarded because it changed planned-goal behavior in backend integration tests
- kept the canonical physics goal semantics unchanged and reduced only the Bavaria visibility mechanism

Applied changes:

- added Bavaria partial bridges from `a114f68b-91d5-593e-9d5b-d31d3240bf19` to `Kräfte und Trägheit qualitativ erklären` and from `c75cb2dd-c143-5537-82aa-4676a1148c71` to `Newtons 1. Axiom (Trägheitsprinzip)`
- removed the explicit `extendedData.applicabilityOverrides.jurisdiction = ["DE-BY"]` entries from the two canonical physics goals `Kräfte und Trägheit qualitativ erklären` and `Newtons 1. Axiom (Trägheitsprinzip)`
- converted the two corresponding Bavaria physics findings from `APV-201` to `APV-202` in the accepted-warning registry
- updated the repository-backed Bavaria physics mapping fixture to the new mapping size and reviewed tuples

Validation used:

- `npm run validate:view-filters`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `./gradlew test --tests 'com.skillpilot.backend.controller.LearnerControllerIntegrationTest' --tests 'com.skillpilot.backend.service.LearnerServiceCrossSubjectPilotTest'`
- `./run_ci.sh`

Validation result:

- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `186` accepted warnings
- accepted reviewed warnings stay at `186`, but Bavaria physics now carries `4` accepted `APV-201` cases and `2` accepted `APV-202` cases instead of `6` accepted `APV-201` cases
- the repository-backed mapping fixture test, the learner-planning regression slice, and full `./run_ci.sh` pass with the retained broader cluster bridges

Interpretation:

- reviewed Bavaria physics no longer depends on explicit Bavaria-specific applicability overrides for two of the six previously override-backed cases without changing learner-facing planning behavior
- the next sharp follow-up on this lane is to resolve or reclassify the four remaining Bavaria physics override-backed goals: `Freier Fall experimentell untersuchen`, `Newtons 3. Axiom (Wechselwirkungsprinzip)`, `Mechanische Energieformen qualitativ unterscheiden`, and `Kinetische Energie`


### 2026-03-20: Bavaria physics Newton-III override retired without changing Hessen topic totals

Approach used:

- targeted the remaining Bavaria physics case that already had a reviewed exact source leaf on the Newton-III application side, but still depended on an explicit Bavaria-specific applicability override on the broader conceptual node
- kept the public canonical Newton-III id stable by turning `Newtons 3. Axiom (Wechselwirkungsprinzip)` into a small cluster and adding a dedicated Hessen-only concept atom underneath it
- rejected the simpler single-child cluster rewrite after it reduced Hessen champion totals by one; the final split preserves the previous Hessen topic-count surface while still letting Bavaria visibility derive from the reviewed application leaf

Applied changes:

- converted canonical goal `5a1b3cb2-c0e6-4372-9c57-f33675cffc9b` (`Newtons 3. Axiom (Wechselwirkungsprinzip)`) from an override-backed atomic goal into a cluster containing the new Hessen-only concept atom `ad984bb6-e225-432a-952d-d83cda40b7f8` (`Newtons 3. Axiom formulieren und erläutern`) and the existing reviewed Bavaria-visible application atom `a0aaedcb-41f8-4891-af77-a69a76b8c10d` (`Newtons 3. Axiom anwenden`)
- removed the redundant direct containment of `a0aaedcb-41f8-4891-af77-a69a76b8c10d` from `Newtons Axiome und Inertialsysteme` so the new Newton-III substructure stays cleanly nested
- removed the explicit `extendedData.applicabilityOverrides.jurisdiction = ["DE-BY"]` entry from `5a1b3cb2-c0e6-4372-9c57-f33675cffc9b`
- removed the now-obsolete accepted Bavaria physics `APV-201` entry for `5a1b3cb2-c0e6-4372-9c57-f33675cffc9b`

Validation used:

- `npm run validate:graph`
- `npm run validate:view-filters`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.controller.LearnerControllerIntegrationTest' --tests 'com.skillpilot.backend.service.LearnerServiceCrossSubjectPilotTest'`
- `./run_ci.sh`

Validation result:

- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `185` accepted warnings
- accepted reviewed warnings drop from `186` to `185`, and the Bavaria physics lane now carries `3` accepted `APV-201` cases plus `2` accepted `APV-202` cases instead of `4` accepted `APV-201` cases plus `2` accepted `APV-202` cases
- graph validation, the focused backend regression slice, and full `./run_ci.sh` all pass

Interpretation:

- reviewed Bavaria physics no longer needs a Bavaria-specific override for the canonical Newton-III concept node, and Hessen learner-facing topic totals stay stable after the structural split
- the remaining Bavaria physics override-backed cases are now `Freier Fall experimentell untersuchen`, `Mechanische Energieformen qualitativ unterscheiden`, and `Kinetische Energie`


### 2026-03-20: Bavaria physics free-fall override retired while preserving motion-frontier behavior

Approach used:

- targeted the remaining Bavaria physics free-fall case because it already sat next to reviewed Bavaria-visible motion-analysis and acceleration atoms
- kept the public canonical free-fall id stable by turning `Freier Fall experimentell untersuchen` into a small cluster and adding one Hessen-only experimental evaluation leaf underneath it
- rejected the broader variant that also nested `Bewegungen mit Diagrammen untersuchen` under the free-fall container after it displaced expected motion-frontier suggestions in cutover and cross-subject backend tests; the final structure keeps diagram analysis independent and uses only the acceleration side for Bavaria visibility

Applied changes:

- converted canonical goal `230345f3-c360-4963-b390-ab94e3e2c864` (`Freier Fall experimentell untersuchen`) from an override-backed atomic goal into a cluster containing the Bavaria-visible acceleration atom `e4b38061-1f28-43ad-8371-a3e7c0e81856` and the new Hessen-only atom `09029573-864f-40ca-bf8a-cee7bf6dcb73` (`Fallbeschleunigung aus Messdaten bestimmen`)
- preserved `Bewegungen mit Diagrammen untersuchen` as an independent sibling goal and kept it only as a prerequisite of the new Hessen-only free-fall atom
- removed the explicit `extendedData.applicabilityOverrides.jurisdiction = ["DE-BY"]` entry from `230345f3-c360-4963-b390-ab94e3e2c864`
- removed the now-obsolete accepted Bavaria physics `APV-201` entry for `230345f3-c360-4963-b390-ab94e3e2c864`

Validation used:

- `npm run validate:graph`
- `npm run validate:view-filters`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest' --tests 'com.skillpilot.backend.controller.LearnerControllerIntegrationTest' --tests 'com.skillpilot.backend.service.LearnerServiceCrossSubjectPilotTest'`
- `./run_ci.sh`

Validation result:

- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `184` accepted warnings
- accepted reviewed warnings drop from `185` to `184`, and the Bavaria physics lane now carries `2` accepted `APV-201` cases plus `2` accepted `APV-202` cases instead of `3` accepted `APV-201` cases plus `2` accepted `APV-202` cases
- graph validation, the focused backend regression slice, and full `./run_ci.sh` all pass after the narrowed final structure

Interpretation:

- reviewed Bavaria physics no longer needs a Bavaria-specific override for the canonical free-fall container, and the expected Hessen/cross-subject motion frontier behavior stays intact
- the remaining Bavaria physics override-backed cases are now `Mechanische Energieformen qualitativ unterscheiden` and `Kinetische Energie`


### 2026-03-20: Bavaria physics Sek-I energy-forms override converted into reviewed partial-bridge debt

Approach used:

- inspected the last Bavaria physics energy corridor and avoided a broader canonical energy split for now because the remaining `Kinetische Energie` case still lacks a comparably clean reviewed source leaf
- kept the existing reviewed exact Bavaria energy rows unchanged and instead promoted one previously unmapped Bavaria heat-lehre source leaf to a partial bridge for the Sek-I bridge goal `Mechanische Energieformen qualitativ unterscheiden`
- preferred this narrower bridge because the Bavaria source text explicitly assumes prior knowledge of `mechanische Energieformen`, making it a defensible reviewed visibility bridge without shifting the upper-secondary mechanical-energy mapping surface

Applied changes:

- added a new Bavaria partial bridge from `b0a2ec7a-df5f-5bf3-b8eb-f3668c25917d` to canonical goal `722857cf-f327-5740-8151-64eb92195ec8` (`Mechanische Energieformen qualitativ unterscheiden`)
- removed the explicit `extendedData.applicabilityOverrides.jurisdiction = ["DE-BY"]` entry from canonical goal `722857cf-f327-5740-8151-64eb92195ec8`
- converted the accepted Bavaria physics finding for `722857cf-f327-5740-8151-64eb92195ec8` from `APV-201` to `APV-202`
- updated the repository-backed Bavaria physics mapping fixture to the new mapping size and reviewed tuple

Validation used:

- `npm run validate:view-filters`
- `./gradlew test --tests 'com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest'`
- `./gradlew test --tests 'com.skillpilot.backend.controller.LearnerControllerIntegrationTest' --tests 'com.skillpilot.backend.service.LearnerServiceCrossSubjectPilotTest'`
- `./run_ci.sh`

Validation result:

- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `184` accepted warnings
- accepted reviewed warnings stay at `184`, but the Bavaria physics lane now carries `1` accepted `APV-201` case plus `3` accepted `APV-202` cases instead of `2` accepted `APV-201` cases plus `2` accepted `APV-202` cases
- the repository-backed mapping fixture test, the learner-planning regression slice, and full `./run_ci.sh` pass with the narrower reviewed bridge

Interpretation:

- reviewed Bavaria physics no longer needs a Bavaria-specific override for the Sek-I qualitative energy-forms bridge; Bavaria visibility now comes from reviewed source mappings alone
- the last remaining Bavaria physics override-backed case is now `Kinetische Energie`


### 2026-03-20: Bavaria physics kinetic-energy override reviewed and retained as the final physics exception

Approach used:

- reviewed the remaining Bavaria physics energy corridor after the Sek-I energy-forms pass, including the lower-secondary energy, heat-lehre, charged-particle, and spaceflight source leaves that still mention energy or kinetic-energy-adjacent concepts
- rejected additional partial bridges because the clean Bavaria energy source rows are already committed to `Mechanische Energie`, `Potenzielle Energie`, `Energieerhaltung`, and `Arbeit`, while the remaining unmapped Bavaria leaves mention kinetic energy only indirectly or in different conceptual settings
- preferred an explicit retained-override decision over a weak source bridge or a broader canonical energy refactor that would overclaim Bavaria coverage for the formula-focused canonical atom `Kinetische Energie`

Applied changes:

- kept canonical goal `7eeff2de-6015-49a6-a96e-a488d886dc9f` (`Kinetische Energie`) and the reviewed Bavaria physics mapping surface unchanged
- tightened the accepted-warning rationale for `7eeff2de-6015-49a6-a96e-a488d886dc9f` so the last remaining Bavaria physics `APV-201` case is documented as an intentional retained override rather than generic closure debt
- logged the reviewed retention decision in this migration status file

Validation used:

- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `184` accepted warnings
- full `./run_ci.sh` passes
- Bavaria physics remains at `1` accepted `APV-201` case plus `3` accepted `APV-202` cases; this is now the reviewed end state of the current physics applicability lane

Interpretation:

- Bavaria physics has no further clean override-retirement candidate on the currently reviewed source surface; the remaining kinetic-energy case should stay accepted until a better source-aligned split or source atom exists
- the next applicability-review target should move outside physics; the smallest remaining reviewed `APV-202` lanes are currently Bavaria Informatik, Bavaria Wirtschaft, Bavaria Deutsch, and Bavaria Griechisch with `8` accepted partial-bridge cases each


### 2026-03-20: Bavaria Greek early E-phase bridge upgraded from partial to exact

Approach used:

- reviewed the smallest remaining non-physics language lane and found that the Bavaria Greek debt was concentrated in one regular Gr10 corridor with eight one-to-one source-to-canonical mappings
- identified the main problem as generic canonical placeholder wording rather than missing structure: the canonical E-phase Greek strip still used broad template-style labels such as `Lektüre E-Phase Griechisch` and `Projekt/Reflexion E-Phase Griechisch`, while the Bavaria source already isolated concrete reading, vocabulary, syntax, translation, analysis, position-taking, oral presentation, and productive-reception tasks
- kept ids and didactic sequencing stable, but rewrote the eight canonical atoms into source-facing task wording so the reviewed Bavaria rows could be promoted from `partial` to `exact`

Applied changes:

- rewrote the eight Bavaria-visible canonical E-phase Greek atoms in `DE_DEU_S_GYM_CANONICAL_GRIECHISCH.de.json` from generic placeholder phrasing to source-aligned task wording:
  - `Originaltexte kursorisch lesen und Inhalte erfassen`
  - `Lektürebegleitenden Wortschatz gezielt sichern`
  - `Komplexe syntaktische Strukturen untersuchen`
  - `Komplexe griechische Strukturen übersetzen`
  - `Originaltexte sprachlich analysieren`
  - `Zu griechisch formulierten Inhalten Stellung nehmen`
  - `Lehrbuchtexte verständnisgeleitet vortragen`
  - `Originaltexte produktiv und kreativ interpretieren`
- promoted the eight corresponding Bavaria Greek mappings in `bavaria_greek_to_canonical_greek.json` from `partial` to `exact`
- removed the eight obsolete Bavaria Greek `APV-202` entries from the accepted-warning registry

Validation used:

- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `176` accepted warnings
- accepted reviewed warnings drop from `184` to `176`
- full `./run_ci.sh` passes

Interpretation:

- the reviewed Bavaria Greek early E-phase corridor no longer depends on partial-bridge applicability; the full eight-goal lane is now exact-backed
- the next smallest reviewed `APV-202` lanes are now Bavaria Informatik, Bavaria Wirtschaft, and Bavaria Deutsch with `8` cases each

### 2026-03-20: Bavaria informatics graph corridor split removes one partial-bridge applicability case

What changed:

- the Bavaria source goal `defff42b-dc4b-53b0-9409-58578ef3c850` (`modellieren im Rahmen praktischer Fragestellungen vernetzte Strukturen als Graphen und klassifizieren diese anhand ihrer Eigenschaften`) no longer maps partially into the Hessen-shaped canonical atom `Graphbegriffe kennen`
- instead, the canonical node `7d4fe994-2325-5fa9-8718-491957da4eed` was turned into a small cluster in `DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json`
- the Hessen concept leaf now remains isolated as `f0910b55-48a9-4f81-aed6-d15ac0446c70` (`Graphbegriffe kennen`) with `DE-HE` applicability only
- a new Bavaria-visible leaf `c9d20743-dfda-4425-ae40-8f51d9f0c72a` (`Vernetzte Strukturen als Graphen modellieren und klassifizieren`) now carries the exact Bavaria source wording with `DE-BY` applicability
- the Bavaria mapping in `bavaria_informatics_to_canonical_informatics.json` was upgraded from partial to exact for that source goal
- the obsolete accepted warning for canonical goal `7d4fe994-2325-5fa9-8718-491957da4eed` was removed from `applicability-accepted-warnings.json`

Validation used:

- `npm run validate:view-filters`

Validation result:

- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `175` accepted warnings

Interpretation:

- Bavaria Informatik drops from `8` to `7` reviewed `APV-202` cases
- the remaining Bavaria Informatik debt is materially less clean than this graph split; the next lowest-count reviewed `APV-202` lanes are now Bavaria Deutsch and Bavaria Wirtschaft with `8` cases each

### 2026-03-20: Bavaria informatics object-model corridor split removes another partial-bridge case

What changed:

- the Bavaria source goal `09203725-7c53-5e5f-b52b-c97cad208bf6` no longer maps partially into the Hessen-shaped canonical atom `Objekte instanziieren`
- instead, the canonical node `300d490f-e5bf-541a-a4c7-a136e97c42ea` was turned into a small cluster in `DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json`
- the Hessen concept leaf now remains isolated as `cb2af3ef-c261-4d92-bc30-3eeb7a2af96a` (`Objekte instanziieren`) with `DE-HE` applicability only
- a new Bavaria-visible leaf `6c284640-1f28-4837-aabd-445656ad7f54` (`Objekte analysieren und zu Klassen abstrahieren`) now carries the exact Bavaria source wording with `DE-BY` applicability
- the Bavaria mapping in `bavaria_informatics_to_canonical_informatics.json` was upgraded from partial to exact for that source goal
- the obsolete accepted warning for canonical goal `300d490f-e5bf-541a-a4c7-a136e97c42ea` was removed from `applicability-accepted-warnings.json`

Validation used:

- `npm run validate:graph`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `validate:graph` passes
- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `174` accepted warnings
- full `./run_ci.sh` passes

Interpretation:

- Bavaria Informatik drops from `7` to `6` reviewed `APV-202` cases
- the remaining Bavaria Informatik cases are now concentrated in broader prerequisite-shape mismatches around programming basics, search/list handling, and formal-language theory

### 2026-03-20: Bavaria German E1 language strip split removes two partial-bridge cases

What changed:

- the Bavaria source goals `e8bf22b0-cd8d-5224-869d-8b94c7fe6d33` and `805e9702-0cc5-5ca6-8a73-6540ace2114a` no longer map partially into the Hessen-shaped canonical atoms `Grammatik wiederholen` and `Textsorte erkennen`
- instead, the canonical nodes `abf6d684-791e-5e0d-90bf-3466087dc937` and `bc28576e-243e-5bff-aca0-872e174d59e5` were turned into small clusters in `DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json`
- the Hessen leaves now remain isolated as `2122b969-61e9-412f-9e97-8777c606d27a` (`Grammatik wiederholen`) and `263b9af0-c584-4364-a35f-6dfccd7aaf21` (`Textsorte erkennen`) with `DE-HE` applicability only
- new Bavaria-visible leaves `ead22176-e8f4-45b6-8a3d-e04661f3c3e4` (`Grammatikalisches und orthografisches Wissen vertiefen`) and `6904ca70-3f22-41eb-bc9c-9896bf7bb1e9` (`Grundformen schriftlicher Darstellung unterscheiden und passend einsetzen`) now carry the exact Bavaria source wording with `DE-BY` applicability
- the Bavaria mappings in `bavaria_german_to_canonical_german.json` were upgraded from partial to exact for those two source goals
- the obsolete accepted warnings for canonical goals `abf6d684-791e-5e0d-90bf-3466087dc937` and `bc28576e-243e-5bff-aca0-872e174d59e5` were removed from `applicability-accepted-warnings.json`

Validation used:

- `npm run validate:graph`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `validate:graph` passes
- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `172` accepted warnings
- full `./run_ci.sh` passes

Interpretation:

- Bavaria German drops from `8` to `6` reviewed `APV-202` cases
- the remaining Bavaria German debt is concentrated in broader literature-analysis and interpretation lanes rather than the E1 language basics strip

### 2026-03-20: Bavaria German E1 argumentation and media strip split removes two more partial-bridge cases

What changed:

- the Bavaria source goals `2fbfd7ee-066e-53e4-8d85-9d81f58dce43`, `7f6c85b6-65bc-5ab4-b028-fd0a3cf2733f`, `163f43b8-6f3d-560c-b798-288aaec4084a`, and `12b18e42-d094-5bdb-9466-b7e74e34e9ec` no longer map partially into the Hessen-shaped canonical atoms `Argumentationsaufbau` and `Medienanalyse Grundlage`
- instead, the canonical nodes `bdd71d15-2ed3-5edb-9a1b-c55b1239795b` and `be66ab87-1857-561e-ad91-bae56b3ae849` were turned into small clusters in `DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json`
- the Hessen leaves now remain isolated as `70f5f3c6-f0e9-4bd7-8095-a20be459975c` (`Argumentationsaufbau`) and `001b6ae3-207a-400d-852d-2c4068df8d2f` (`Medienanalyse Grundlage`) with `DE-HE` applicability only
- new Bavaria-visible leaves `f0c354f9-6f7a-494a-8f64-675bf1b42f5e`, `17164008-3c30-4d22-8f2b-bf2e5a79f9de`, `d4642285-5b73-4541-a088-6c1e77b37637`, and `fb8f990d-224f-4277-92a1-13bee8f7f8a4` now carry the reviewed Bavaria source wording with `DE-BY` applicability
- the Hessen German mapping was repointed to the new HE leaves, and the Bavaria mappings in `bavaria_german_to_canonical_german.json` were upgraded from partial to exact for the four reviewed source goals
- the obsolete accepted warnings for canonical goals `bdd71d15-2ed3-5edb-9a1b-c55b1239795b` and `be66ab87-1857-561e-ad91-bae56b3ae849` were removed from `applicability-accepted-warnings.json`

Validation used:

- `npm run validate:graph`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `validate:graph` passes
- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `170` accepted warnings
- full `./run_ci.sh` passes

Interpretation:

- Bavaria German drops from `6` to `4` reviewed `APV-202` cases
- the remaining Bavaria German debt is now concentrated entirely in the broader literature-analysis corridor

### 2026-03-20: Bavaria German E2 literature corridor split removes the remaining partial-bridge cases

What changed:

- the Bavaria source goals `d795b8a8-1b1a-5f6a-affe-0805b6014c4c`, `24de36d4-0900-53d0-b619-faa7fc765f21`, `d0737aa3-aae6-5429-8284-c095889f2b59`, `216f1fd3-b396-559d-811c-e70ed6d75a97`, and `2611513c-8a5c-571b-8137-e545a6a189ed` no longer map partially into the Hessen-specific canonical E2 literature atoms
- the shared `E2 Literatur` cluster `bb3dee7b-d6d3-513b-8824-bdf6414e02df` now contains five Bavaria-only exact leaves for the reviewed literature-analysis and interpretation corridor
- the old Hessen literature basics `29f0468a-62a0-57a1-8f92-48d4e69bb032`, `c2f901ad-9469-5f84-aa19-e80d300842c5`, `518ec458-78a7-5546-9a65-29ef6d197742`, and `97d958b1-93d3-58ad-b208-80af1cdfd4d4` now carry `DE-HE` applicability only again
- the shared entry nodes `bb3dee7b-d6d3-513b-8824-bdf6414e02df` and `eff86a92-e048-5494-b561-6ecdda1fbf67` were aligned to the compiled mixed-state surface and now carry `DE-BY` plus `DE-HE` applicability in the committed metadata
- the Bavaria mapping file `bavaria_german_to_canonical_german.json` was upgraded from partial to exact for those five reviewed source goals against the new Bavaria-only leaves
- the obsolete accepted warnings for the four old E2 literature atoms were removed from `applicability-accepted-warnings.json`

Validation used:

- `npm run validate:graph`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `validate:graph` passes
- `validate:view-filters` still passes with `0` errors, `25` active warnings, and `166` accepted warnings
- full `./run_ci.sh` passes

Interpretation:

- Bavaria German drops from `4` to `0` reviewed `APV-202` cases
- the reviewed Bavaria German lane is now closed; the next applicability target should move to another remaining subject corridor

### 2026-03-20: Bavaria Informatik grammar-source remap removes one more partial-bridge case without adding new canonical nodes

What changed:

- the Bavaria source goal `a2db53a1-4449-5d78-825e-81ba1fa07c02` no longer maps partially into the Hessen-only canonical atom `Ableitungen prüfen` (`3e3264d6-8cf8-55f9-b085-1aa4a7865476`)
- instead, that source goal now maps exactly to the already-existing canonical atom `Grammatiken entwickeln` (`fbd4561a-573e-5f8c-b363-338ee9774b5c`) in `bavaria_informatics_to_canonical_informatics.json`, because the reviewed Bavaria wording is about defining grammars with EBNF and syntax diagrams rather than checking derivations
- `Ableitungen prüfen` (`3e3264d6-8cf8-55f9-b085-1aa4a7865476`) now carries `DE-HE` applicability only again in `DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json`
- the Bavaria-visible follow-on canonical goal `Sprachen klassifizieren` (`18691bbb-b996-57a6-9f91-8ff54acabbce`) now requires `Grammatiken entwickeln` instead of `Ableitungen prüfen`, preserving the reviewed Bavaria Q3.1 route without widening the Hessen-only derivation atom
- the obsolete accepted warning for canonical goal `3e3264d6-8cf8-55f9-b085-1aa4a7865476` was removed from `applicability-accepted-warnings.json`

Validation used:

- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `validate:view-filters` passes with `0` errors, `25` active warnings, and `165` accepted warnings
- full `./run_ci.sh` passes

Interpretation:

- Bavaria Informatik drops from `6` to `5` reviewed `APV-202` cases
- this was a clean mapping-and-prerequisite correction, not a new canonical split; the remaining Bavaria Informatik debt is now concentrated in broader automata, data-structure, and algorithm-shape mismatches

### 2026-03-20: Bavaria Informatik object-state split removes the E.3 programming-basics partial bridge

What changed:

- the Bavaria source goal `dca8a9c9-4016-59ff-86f0-8756df374ce8` no longer maps partially into the Hessen-shaped canonical atom `Grundlegende Datentypen und Variablen nutzen` (`c5d04946-497e-5ede-84ec-2d019138e3a0`)
- instead, canonical goal `c5d04946-497e-5ede-84ec-2d019138e3a0` was turned into a small mixed-state cluster in `DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json`
- the Hessen semantics now live on the new `DE-HE` leaf `18317e31-71f7-4e4a-b18c-f61e2b25769d` (`Grundlegende Datentypen und Variablen nutzen`), and the Bavaria wording now lives on the new `DE-BY` leaf `2aaefe0b-3e56-477e-94f0-bb05fa035ed5` (`Attributwerte ändern und Objektzustände deuten`)
- the Hessen mapping in `hessen_informatics_upper_secondary_to_canonical_informatics.json` was repointed from the former shared atom to the new Hessen-only leaf
- the Bavaria mapping in `bavaria_informatics_to_canonical_informatics.json` was upgraded from partial to exact against the new Bavaria-only leaf
- the Hessen follow-on canonical goal `Kontrollstrukturen anwenden` now requires the new Hessen-only leaf instead of the mixed-state cluster, so the old atomic prerequisite shape is preserved on the Hessen route
- the obsolete accepted warning for canonical goal `c5d04946-497e-5ede-84ec-2d019138e3a0` was removed from `applicability-accepted-warnings.json`

Validation used:

- `npm run validate:graph`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `validate:graph` passes
- `validate:view-filters` passes with `0` errors, `25` active warnings, and `164` accepted warnings
- full `./run_ci.sh` passes

Interpretation:

- Bavaria Informatik drops from `5` to `4` reviewed `APV-202` cases
- the remaining Bavaria Informatik debt is now concentrated in the broader automata, algorithm, and higher-data-structure corridors rather than the Inf9 object-programming strip

### 2026-03-20: Bavaria Informatik search-corridor split removes the Q1 algorithm partial bridge

What changed:

- the Bavaria source goal `4d042307-060f-5b86-a435-ddc6a58ccbf5` no longer maps partially into the Hessen-shaped canonical atom `Suchalgorithmen implementieren` (`7c2d2a49-c4a4-51b6-be7b-e8791f82af5a`)
- instead, canonical goal `7c2d2a49-c4a4-51b6-be7b-e8791f82af5a` was turned into a small mixed-state cluster in `DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json`
- the Hessen semantics now live on the new `DE-HE` leaf `2a87fb3c-394b-47b4-bda2-58c5f1403475` (`Suchalgorithmen implementieren`), and the Bavaria wording now lives on the new `DE-BY` leaf `c62c529f-3732-4c66-a8e4-6d91ed2285d0` (`Algorithmen auf Listen und Feldern entwickeln und implementieren`)
- the Hessen mapping in `hessen_informatics_upper_secondary_to_canonical_informatics.json` was repointed from the former shared atom to the new Hessen-only leaf
- the Bavaria mapping in `bavaria_informatics_to_canonical_informatics.json` was upgraded from partial to exact against the new Bavaria-only leaf
- the Hessen follow-on canonical goals `Einfache Sorten nutzen` and `Hashing und Kollisionen` now require the new Hessen-only leaf instead of the mixed-state cluster, so the old Hessen prerequisite chain is preserved
- the obsolete accepted warning for canonical goal `7c2d2a49-c4a4-51b6-be7b-e8791f82af5a` was removed from `applicability-accepted-warnings.json`

Validation used:

- `npm run validate:graph`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `validate:graph` passes
- `validate:view-filters` passes with `0` errors, `25` active warnings, and `163` accepted warnings
- full `./run_ci.sh` passes

Interpretation:

- Bavaria Informatik drops from `4` to `3` reviewed `APV-202` cases
- the remaining Bavaria Informatik debt is now concentrated in the automata corridor plus the higher-data-structure list/stack corridor

### 2026-03-20: Bavaria Informatik automata split removes the two non-regular-language partial bridges

What changed:

- the Bavaria source goals `a19cd533-ac0c-57a9-8098-093d1918a605` and `c7623044-bb7b-5375-9a65-27932a296834` no longer map partially into the Hessen-only pushdown-automata atoms `Kellerautomaten und Grammatiken verknüpfen` (`200ff84a-3158-5d2f-b065-36b77ea99ef1`) and `Deterministische Kellerautomaten entwickeln` (`36725b54-fd0c-5b24-bf2f-399491562718`)
- instead, canonical goal `9b497287-aa68-5bb1-974f-5be11dd11ae2` was turned into a small mixed-state cluster in `DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json`
- the Hessen semantics now live on the new `DE-HE` leaf `10a3b2a3-8c1c-4dfb-9d48-8f67f2c0004d` (`Grenzen endlicher Automaten erkennen`), and the Bavaria wording now lives on the new `DE-BY` leaf `e7fb0601-4207-4bd8-8c40-1f544590b855` (`Nichtreguläre Sprachen als Grenze endlicher Automaten erläutern`)
- the Hessen mapping in `hessen_informatics_upper_secondary_to_canonical_informatics.json` was repointed from the former shared atom to the new Hessen-only leaf
- the two Bavaria mappings in `bavaria_informatics_to_canonical_informatics.json` were upgraded from partial to exact against the new Bavaria-only leaf
- the canonical cluster `Q3.3 Kellerautomat` (`52ab668f-87b6-5661-af2a-3dc38557dcf6`) and the two old pushdown-automata atoms `36725b54-fd0c-5b24-bf2f-399491562718` and `200ff84a-3158-5d2f-b065-36b77ea99ef1` now carry `DE-HE` applicability only again
- the Bavaria-visible canonical cluster `Q3.4 Turingmaschine` (`49e18e35-3a6d-53f7-842f-4dc9e39c745a`) now requires the shared finite-automata-limits cluster `9b497287-aa68-5bb1-974f-5be11dd11ae2` instead of the Hessen-only pushdown-automata cluster, preserving Bavaria visibility without widening the Hessen-only PDA corridor
- the obsolete accepted warnings for canonical goals `200ff84a-3158-5d2f-b065-36b77ea99ef1` and `36725b54-fd0c-5b24-bf2f-399491562718` were removed from `applicability-accepted-warnings.json`

Validation used:

- `npm run validate:graph`
- `npm run validate:view-filters`
- `./run_ci.sh`

Validation result:

- `validate:graph` passes
- `validate:view-filters` passes with `0` errors, `25` active warnings, and `161` accepted warnings
- full `./run_ci.sh` passes

Interpretation:

- Bavaria Informatik drops from `3` to `1` reviewed `APV-202` case
- the remaining Bavaria Informatik debt is now the higher-data-structure list/stack corridor around `Stapeln und Warteschlangen nutzen` (`898684c0-027c-5fc8-8448-6f33fc26d5b4`)
