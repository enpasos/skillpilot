# Canonical Gymnasium Implementation Plan

Snapshot: `2026-03-16`

This document turns the rollout strategy from the concept docs into an implementation-oriented plan.

See also:

- `docs/concept/curriculum-graph/canonical-gymnasium-rollout.md`
- `docs/dev/canonical-gymnasium-migration-status.md`
- `docs/dev/canonical-gymnasium-applicability-design.md`

## Purpose

The implementation should start without breaking:

- existing Hessen learner flows,
- existing Custom GPT flows,
- the current unified learner-state contract.

The project should therefore start with a small, testable pilot rather than a broad curriculum rewrite.

## Current reported status

Use `docs/dev/canonical-gymnasium-migration-status.md` as the single headline-score source.

Current reported migration status on `2026-03-16`:

- `100%`

Interpretation:

- `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe` is at `100%` tree-level delete-gate completion and is already deleted from the active repo
- `curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe` is at `100%` tree-level delete-gate completion and is already deleted from the active repo
- `curricula/DE/BY/Gymnasium` is now at `100%` tree-level delete-gate completion and removed from the active repo

## Guardrails

- Do not duplicate canonical goals per Bundesland.
- Do not reintroduce deleted legacy source trees; any retained compatibility or audit need should resolve through the DE-level archive, mapping, and provenance lanes.
- Hessen upper-secondary has already left the active repo path; use the archived source snapshots under `curricula/DE/Gymnasium/input/DE-HE/upper-secondary/source-json/` instead of reactivating the old tree.
- Do not modify the archived Hessen upper-secondary source snapshots under `curricula/DE/Gymnasium/input/DE-HE/upper-secondary/source-json/` just to host canonical content.
- Keep the Custom GPT interface unchanged: one learner state, one frontier, one mastery flow.
- Use ISO 3166-2 state codes in new Bundesland-facing metadata, filters, and API-visible fields, for example `DE-HE` and `DE-BY`.
- Do not rename existing curriculum directory segments just to enforce that convention during the pilot.
- Place canonical Gymnasium subject landscapes on a Germany-level path, not inside a single Bundesland subtree.
- Prefer additive infrastructure over destructive migration.
- Introduce only the minimum new data structures required for the first pilot.
- Preserve multi-subject navigation as a design target from the beginning.
- For Sek I with different overall school lengths, normalize the first canonical layer to G9 year levels `5-10` rather than creating separate G8/G9 canonical branches.
- For retained non-canonical materials, use DE-level but state-scoped archive lanes. `curricula/DE/Gymnasium/input/DE-HE/abi` is the model case, not a special exception.

## First implementation slice

The first slice should be:

- subject: Mathematics
- source: Hessen Gymnasiale Oberstufe
- mode: additive pilot

This slice should produce a canonical mathematics landscape without yet changing the outward-facing learner workflow.

## Deliverables

### D1. Canonical pilot landscape

Create one first canonical mathematics landscape derived from the mature Hessen upper-secondary mathematics landscape.

Initial constraints:

- runtime-compatible `LearningLandscape` JSON
- no broad restructuring yet
- IDs stable inside the canonical file
- only one subject in scope

### D2. Goal mapping file

Create one explicit mapping file from Hessen upper-secondary mathematics goals to canonical mathematics goals.

Pilot scope:

- support `exact`
- support `partial`
- avoid larger semantics until needed

### D3. Backend projection layer

Add a small backend component that can:

- resolve canonical mastery from legacy mastery via mappings,
- keep current learner-state responses stable,
- hide legacy/canonical complexity from the Custom GPT.

The projection layer should be read-first. Do not start with an invasive write migration.

### D4. Invariant tests

Add tests proving that, for the overlapping Hessen pilot scope:

- learner state remains available,
- frontier behavior stays stable,
- mastery projection is deterministic,
- existing API/controller contracts remain unchanged.

## Operating States

Canonical convergence should be tracked per adopted subtree, not only per work package.

Use these operational states:

- `legacy_frozen`
  - the legacy source subtree stays authoritative and read-only for convergence purposes
- `subtree_adopted`
  - the subtree exists in canonical DE-level form and has explicit mappings
- `cutover_ready`
  - projection, frontier, and learner-state behavior are stable enough for low-risk operational switch
- `legacy_view_retained`
  - canonical is the preferred path, while the old subtree remains available as a compatibility view

Transition rule:

- `legacy_frozen` -> `subtree_adopted` -> `cutover_ready` -> `legacy_view_retained`

Adoption checklist for a subtree:

- the subtree is didactically coherent
- `contains` coverage is complete enough to navigate it as a unit
- prerequisites are carried over or explicitly rebound
- legacy-to-canonical mappings exist with justified `exact` / `partial` semantics
- runtime projection tests cover at least mastery and planned-goal normalization

Current operational baseline:

- Hessen lower-secondary source JSON, mapping fixtures, and the core lower-secondary provenance registries now survive in DE-level archive/provenance lanes; the original tree is retired from the active repo
- Hessen upper-secondary source JSON now survives only as archived DE-level snapshots under `curricula/DE/Gymnasium/input/DE-HE/upper-secondary/source-json/`; the original tree is retired from the active repo
- the first canonical Sek-I normalization target is the shared G9-aligned year-level grid `5-10`; duration-specific source labels stay in provenance and archived inputs
- retained state-owned assets such as `abi/`, source bundles, and derived exam packages are expected to survive the transition in state-scoped DE archive lanes
- the canonical `Gymnasium (DE)` overview root is the current preferred DE-level learner entry point
- compiled node-level `applicability` is now implemented for the reviewed canonical DE Gymnasium set via `app/scripts/compileApplicability.ts`, `app/scripts/validateViewFilters.ts`, and `app/scripts/applyApplicability.ts`; the current reviewed validator result is `0` errors, `0` active warnings, `136` accepted warnings
- the DE-level Mathematics landscape now bulk-adopts the Hessen upper-secondary tree and keeps the existing Sek-I bridge plus exact Hessen legacy mappings for later learner migration
- the DE-level Physics landscape now bulk-adopts the Hessen upper-secondary tree and keeps the pre-existing cross-subject Math bridge and Bavaria collision anchor IDs stable for later learner migration
- the DE-level Chemistry landscape now bulk-adopts the Hessen upper-secondary tree as the next Hessen-first subject slice and is attached below the shared DE root
- the DE-level Biology landscape now bulk-adopts the Hessen upper-secondary tree as another Hessen-first subject slice and is attached below the shared DE root
- the DE-level Informatics landscape now bulk-adopts the Hessen upper-secondary tree as the next Hessen-first subject slice and is attached below the shared DE root
- the DE-level History landscape now bulk-adopts the Hessen upper-secondary tree as the next Hessen-first subject slice and is attached below the shared DE root
- the DE-level German landscape now bulk-adopts the Hessen upper-secondary tree as the next Hessen-first subject slice and is attached below the shared DE root
- the DE-level Politics-and-Economics landscape now bulk-adopts the Hessen upper-secondary tree as the next Hessen-first subject slice and is attached below the shared DE root
- the DE-level English landscape now bulk-adopts the Hessen upper-secondary tree as the next Hessen-first subject slice and is attached below the shared DE root
- the DE-level French landscape now bulk-adopts the Hessen upper-secondary tree as the next Hessen-first subject slice and is attached below the shared DE root
- the DE-level Latin landscape now bulk-adopts the Hessen upper-secondary tree as the next Hessen-first subject slice and is attached below the shared DE root
- the DE-level Spanish landscape now bulk-adopts the Hessen upper-secondary tree as the next Hessen-first subject slice and is attached below the shared DE root
- the DE-level Greek landscape now bulk-adopts the Hessen upper-secondary tree as the next Hessen-first subject slice and is attached below the shared DE root
- the DE-level Chinese landscape now bulk-adopts the Hessen upper-secondary tree as the next Hessen-first subject slice and is attached below the shared DE root
- the DE-level Music landscape now bulk-adopts the Hessen upper-secondary tree as the next Hessen-first subject slice and is attached below the shared DE root
- the DE-level Economics landscape now bulk-adopts the Hessen upper-secondary tree as the next Hessen-first subject slice and is attached below the shared DE root
- with Music added, every currently modeled Hessen Gymnasiale-Oberstufe subject landscape now has a DE-level adopted counterpart below `Gymnasium (DE)`
- a first backend learner-cutover path from frozen Hessen upper-secondary Math/Physics/Chemistry/Biology/Informatics/History/German/Politics-and-Economics/English/French/Latin/Spanish/Greek/Chinese/Music/Economics views into the DE-level `Gymnasium (DE)` root is available
- cutover now stabilizes curriculum selection, root/subject filters, first-response planned-scope normalization, and canonical continuation with preserved legacy mastery history
- the cutover HTTP contract now also covers the frozen Hessen overview case with combined Mathematics/Physics selection and the direct Chemistry cutover case with canonical planned-scope continuation
- the learner cockpit now exposes a first explicit UI migration path from frozen Hessen upper-secondary views into `Gymnasium (DE)` and switches the frontend landscape context after successful cutover
- after successful UI cutover, the cockpit now navigates directly into the migrated canonical focus instead of leaving the learner on the old Hessen route or only at the DE root
- the UI cutover dialog now previews the adopted Hessen -> DE transfer per subject and course level before the learner triggers migration
- the curriculum picker now prioritizes `Gymnasium (DE)` for new learner entry and explicitly labels the frozen Hessen upper-secondary views as compatibility views
- the frozen Hessen cockpit view now also surfaces the DE cutover directly inside the learner workspace, so retained compatibility views are usable without hiding the canonical migration path in setup only
- ordinary session-start and championship-registration pickers no longer list compatibility views by default; they are only retained there when already selected
- backend bootstrap for new learners now follows the same rule and returns recommended curricula without compatibility views by default; the general UI landscapes endpoint now exposes compatibility explicitly via `includeCompatibility=true`
- the learner cockpit setup now treats Hessen compatibility subjects as an explicitly revealable secondary section, and canonical `Gymnasium (DE)` setups prune stale Hessen compatibility entries from persisted personal curriculum configs
- when the learner is still inside a Hessen compatibility session, that same cockpit setup now runs in retirement-only mode: migration/audit stay available, but it no longer acts as a normal curriculum configuration editor for the frozen Hessen path
- the learner cockpit now also treats those open Hessen compatibility sessions as read-only/audit-only for planning, active-goal selection, and SRS drilling, so the retained Hessen path is no longer a normal active-learning workspace even before full backend retirement
- UI and AI write endpoints now enforce the same rule server-side: retained Hessen compatibility sessions reject curriculum mutation, planning, active-goal, mastery, and client-state writes, so the remaining compatibility route is backend-read-only as well as frontend-read-only
- UI and AI learner-state routes no longer serve retained Hessen compatibility sessions as live state views; the cockpit now offers migration plus a dedicated compatibility-archive export, so the fallback is an explicit frozen artifact path rather than an alternate runtime route
- the compatibility-archive export itself now resolves retired Hessen curriculum summaries from the DE-level archive registry `curricula/DE/Gymnasium/archive/compatibility-landscape-registry.json` and snapshots raw persisted learner data instead of depending on a live legacy learner-state projection
- Hessen cutover now also resolves stored `legacyGoalId -> sourceLandscapeId` membership from the DE-level provenance registry `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`, so subject inference no longer depends on a live Hessen upper-secondary goal graph staying loaded
- `/api/ui/landscapes?includeCompatibility=true` now also resolves Hessen compatibility summaries from the frozen DE-level archive registry, so overview/listing metadata no longer depends on loaded Hessen upper-secondary landscape files
- `/api/ui/curricula/{curriculumId}/topics` now also resolves Hessen compatibility topics from the frozen DE-level archive registry `curricula/DE/Gymnasium/archive/compatibility-topic-summary-registry.json`, while direct `/api/ui/landscapes/{id}` and `/closure` routes for Hessen compatibility landscapes are retired
- the `Abi26` Hessen mathematics bootstrap now provisions learners onto canonical `Gymnasium (DE)` with `DE-HE` at the root and canonical mathematics `GK`/`LK` filters, instead of selecting the retired Hessen mathematics curriculum directly
- new learner curriculum selections now also reject retired Hessen compatibility IDs server-side even when the caller already knows those IDs, so the compatibility route cannot be reopened as a fresh runtime path
- Hessen upper-secondary exam/deploy/adoption helper tooling now resolves retained `abi/` defaults plus archived mapping defaults via `curricula/DE/Gymnasium/input/DE-HE/retained-asset-registry.json`, and resolves legacy subject-landscape source paths through the shared DE-level provenance source registry instead of per-script hardcoded legacy-tree defaults
- DE-level Hessen `abi/` operational metadata now follows the same rule: task banks store `sourceLandscapeId` plus the shared provenance registry path instead of embedding legacy source-landscape file paths, while blueprint/source-catalog/release-bundle source references now only target retained DE-level `curricula/DE/Gymnasium/input/DE-HE/...` assets
- repo-authored Hessen `abi/` markdown now also follows that split: authored pipeline/QS/guide documents reference DE-level retained assets or provenance registry entries, while imported/raw source markdown remains intentionally untouched as archival provenance
- the retained/raw boundary is now enforced by `scripts/validate_hessen_upper_secondary_archive_paths.py`, using the explicit Hessen `allowedRawLegacyPathGlobs` in `curricula/DE/Gymnasium/input/DE-HE/retained-asset-registry.json`, and this gate is now part of both `.github/workflows/ci.yml` and local `run_ci.sh`
- the remaining repo-level legacy-tree references are now also fenced by `curricula/DE/Gymnasium/provenance/hessen-upper-secondary-retirement-registry.json` plus `scripts/validate_hessen_upper_secondary_legacy_refs.py`, so active runtime/tooling/test surfaces can only refer to the frozen Hessen upper-secondary tree from an explicit handoff allowlist
- backend/src no longer contains any explicit Hessen upper-secondary tree references; the remaining repo-level blockers are now purely declarative provenance/transfer files plus the validators that guard that boundary
- the frozen Hessen upper-secondary source-JSON lane is now mirrored under `curricula/DE/Gymnasium/input/DE-HE/upper-secondary/source-json/`, and `curricula/DE/Gymnasium/provenance/source-landscape-registry.json` now provides `archiveSourcePath` so authoring/deploy tooling can read those snapshots without requiring the live legacy tree
- backend landscape loading now also falls back to those archived Hessen upper-secondary source snapshots, so retired curriculum IDs remain readable for release metadata, frontier invariants, and explicit retirement/conflict handling after the repo-side delete handoff
- the Hessen upper-secondary delete handoff has now been executed: the original tree is gone from the active repo path, and `bash scripts/run_hessen_upper_secondary_delete_handoff_dry_run.sh` now acts as the post-retirement verification command for the surviving archive/provenance lane
- an explicit backend bulk-cutover path with `dryRun` and a supplied learner-ID list is now available, so later Hessen -> DE migrations can be rehearsed and executed without exposing global learner listings
- the operator-facing bulk-cutover UI now supports CSV export of dry-run/execution results and lets operators reduce the current input list to the `eligible` learner IDs before triggering the real migration
- the Hessen Sek-I backend learner-cutover path now also covers the frozen mixed overview root across the currently supported `Mathematik`/`Physik`/`Chemie`/`Biologie`/`Französisch` surface; lower-secondary physics still auto-selects canonical mathematics to keep the existing cross-subject bridge visible, and lower-secondary French now cuts over onto the shared canonical French landscape instead of blocking mixed-overview retirement
- ordinary learner entry now also prefers the canonical DE path over Hessen Sek-I legacy roots: the lower-secondary Hessen overview and subject roots are hidden by default from bootstrap and general picker surfaces, but remain retainable when they are already the active selection
- the frozen Hessen lower-secondary source-JSON lane is now mirrored under `curricula/DE/Gymnasium/input/DE-HE/lower-secondary/source-json/` (`6` files), and `curricula/DE/Gymnasium/provenance/source-landscape-registry.json` now also exposes `archiveSourcePath` for those lower-secondary landscapes
- Hessen Sek-I legacy-to-canonical mapping fixtures now also live in the DE-level archive lane `curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/`
- frozen Hessen Sek-I compatibility summaries and topic lists now also resolve from the DE-level archive registries `curricula/DE/Gymnasium/archive/compatibility-landscape-registry.json` and `curricula/DE/Gymnasium/archive/compatibility-topic-summary-registry.json`
- `scripts/validate_hessen_lower_secondary_archive_paths.py` and `scripts/validate_hessen_lower_secondary_legacy_refs.py` now fence retained-asset and repo-level references for Hessen Sek-I, and both checks are wired into `.github/workflows/ci.yml` plus local `run_ci.sh`
- the Hessen lower-secondary delete handoff has now been executed: the original tree is gone from the active repo path, and `bash scripts/run_hessen_lower_secondary_delete_handoff_dry_run.sh` now serves as the post-retirement verification command against the surviving archive/provenance/mapping lanes
- Hessen Sek-I source-goal closures and goal memberships are now also frozen in the shared DE-level provenance registries `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json` and `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`, so lower overview/root survivability no longer depends on the live legacy tree
- the currently cutover-supported Hessen Sek-I legacy learner bundle is now frontend- and backend-read-only across `Mathematik`/`Physik`/`Chemie`/`Biologie`/`Französisch`; mixed overview sessions that resolve into that supported bundle also reject active-learning writes once the canonical cutover surface exists
- the first Bavaria learner-cutover path is now operational for direct legacy `Mathematik` learners: Bavaria `Mathematik` migrates into `Gymnasium (DE)` with the root filter `DE-BY`, canonical Mathematics selected, and normalized planned-scope continuation on the shared canonical Math spine
- ordinary learner entry now also prefers the canonical DE path over the Bavaria legacy root: `Gymnasium (Bayern)` is hidden by default from general overview/bootstrap surfaces and only retained when it is already the active learner selection
- the active Bavaria Math/Physics/Chemistry/Biology/Informatik/Geschichte/Deutsch/Englisch/Französisch/Spanisch/Italienisch/Russisch/Polnisch/Tschechisch/Griechisch/Wirtschaft_und_Recht/Politik_und_Gesellschaft/Latein/Musik/Chinesisch adopted corridor no longer hangs solely off the live `curricula/DE/BY/Gymnasium` tree: the adopted Bavaria mappings now live under `curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/`, the shared source-landscape registry now exposes `archiveSourcePath` for the current adopted Bavaria source landscapes, and `scripts/validate_bavaria_gymnasium_archive_paths.py` plus `scripts/validate_bavaria_gymnasium_legacy_refs.py` now fence the DE-level retained-source lane and repo-level operational references
- the currently supported Bavaria legacy mathematics learner path is now detached as an active runtime path: direct `Mathematik` sessions are frontend- and backend-read-only retirement views, UI/AI write endpoints reject mutations, and the canonical `Gymnasium (DE)` + `DE-BY` cutover remains the supported continuation
- the current Bavaria Physics pilot surface now has the same direct learner-cutover and retirement handling: direct legacy `Physik` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Physics selected plus the required Math bridge, and active legacy Physics sessions are frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Chemistry and Biology pilot surfaces now also have direct learner-cutover and retirement handling: direct legacy `Chemie` and `Biologie` learners migrate into `Gymnasium (DE)` with `DE-BY`, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Informatics pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Informatik` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Informatics selected, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria German pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Deutsch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical German selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria English pilot now adds `11` reviewed mappings into the canonical DE English layer, yielding `2` committed `DE-BY` applicability nodes on the currently reviewed English surface plus a direct Bavaria `Englisch` cutover path into `Gymnasium (DE)`
- the current Bavaria English pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Englisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical English selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria French pilot now adds `11` reviewed mappings into the canonical DE French layer, yielding `3` committed `DE-BY` applicability nodes on the currently reviewed French surface plus a direct Bavaria `Französisch` cutover path into `Gymnasium (DE)`
- the current Bavaria French pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Französisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical French selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Spanish pilot now adds `8` reviewed mappings into the canonical DE Spanish layer, yielding `2` committed `DE-BY` applicability nodes on the currently reviewed Spanish surface plus a direct Bavaria `Spanisch` cutover path into `Gymnasium (DE)`
- the current Bavaria Spanish pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Spanisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Spanish selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Italian pilot now adds `8` reviewed mappings into the canonical DE Italian layer, yielding `8` committed `DE-BY` applicability nodes plus a direct Bavaria `Italienisch` cutover path into `Gymnasium (DE)`
- the current Bavaria Italian pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Italienisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Italian selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Russian pilot now adds `8` reviewed mappings into the canonical DE Russian layer, yielding `8` committed `DE-BY` applicability nodes plus a direct Bavaria `Russisch` cutover path into `Gymnasium (DE)`
- the current Bavaria Russian pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Russisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Russian selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Polish pilot now adds `5` reviewed mappings into the canonical DE Polish layer, yielding `5` committed `DE-BY` applicability nodes plus a direct Bavaria `Polnisch` cutover path into `Gymnasium (DE)`
- the current Bavaria Polish pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Polnisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Polish selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Czech pilot now adds `5` reviewed mappings into the canonical DE Czech layer, yielding `5` committed `DE-BY` applicability nodes plus a direct Bavaria `Tschechisch` cutover path into `Gymnasium (DE)`
- the current Bavaria Czech pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Tschechisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Czech selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria History pilot now adds `56` reviewed mappings into the canonical DE history layer, yielding `58` committed `DE-BY` applicability nodes through the first reviewed mixed `G8` / `G9` bridge plus a direct Bavaria `Geschichte` cutover path into `Gymnasium (DE)`
- the current Bavaria History pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Geschichte` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical History selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Greek pilot now adds `14` reviewed mappings into the canonical DE Greek layer, yielding `11` committed `DE-BY` applicability nodes on an early reviewed `E-Phase` bridge plus a direct Bavaria `Griechisch` cutover path into `Gymnasium (DE)`
- the current Bavaria Greek pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Griechisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Greek selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Wirtschaft-und-Recht pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Wirtschaft und Recht` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical `Wirtschaftswissenschaften` selected, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Politik-und-Gesellschaft pilot now adds `39` reviewed mappings into the canonical DE politics/economics layer, yielding `22` committed `DE-BY` applicability nodes across a reviewed mixed `G8` / `G9` bridge plus a direct Bavaria `Politik und Gesellschaft` cutover path into `Gymnasium (DE)`
- the current Bavaria Politik-und-Gesellschaft pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Politik und Gesellschaft` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical `Politik und Wirtschaft` selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Latin pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Latein` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Latin selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Music pilot now adds `15` reviewed mappings into the canonical DE music layer, yielding `15` committed `DE-BY` applicability nodes plus a direct Bavaria `Musik` cutover path into `Gymnasium (DE)`
- the current Bavaria Music pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Musik` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Music selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- the current Bavaria Chinese pilot now adds `35` reviewed mappings into the canonical DE Chinese layer, yielding `33` committed `DE-BY` applicability nodes plus a direct Bavaria `Chinesisch` cutover path into `Gymnasium (DE)`
- the current Bavaria Chinese pilot surface now also has direct learner-cutover and retirement handling: direct legacy `Chinesisch` learners migrate into `Gymnasium (DE)` with `DE-BY`, canonical Chinese selected with the default `GK` filter, and active legacy sessions now run as frontend- and backend-read-only retirement views instead of ordinary writable learner paths
- Bavaria Math/Physics/Chemistry/Biology source-goal closures and goal memberships now also live in the shared DE-level provenance registries `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json` and `curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json`, so the current adopted Bavaria corridor no longer depends on the live legacy tree for archived closure or membership lookups
- the full live Bavaria Gymnasium legacy tree now classifies as compatibility-only on the active runtime path, so explicit UI/AI curriculum selection no longer routes fresh learners back into Bavaria legacy root or subject views while existing retired sessions remain archive/cutover-only
- the canonical Mathematics pilot function corridor is `cutover_ready`
- the canonical Physics motion corridor is `cutover_ready`
- the canonical Physics E.2 mechanics corridor is `cutover_ready`
- the canonical Physics E.3 horizontal-projection slice is `cutover_ready`
- the first Hessen Sek I physics mechanics bridge is `subtree_adopted`
- the first Hessen Sek I physics optics bridge is `subtree_adopted`
- the first Hessen Sek I physics electricity bridge is `subtree_adopted`
- the first Hessen Sek I chemistry foundations bridge is `subtree_adopted`
- the first Hessen Sek I biology foundations/cell plus photosynthesis-respiration bridge is `subtree_adopted`
- the canonical Chemistry Hessen baseline is `subtree_adopted`
- the canonical Biology Hessen baseline is `subtree_adopted`
- the canonical Informatics Hessen baseline is `subtree_adopted`
- the canonical History Hessen baseline is `subtree_adopted`
- the canonical German Hessen baseline is `subtree_adopted`
- the canonical Politics-and-Economics Hessen baseline is `subtree_adopted`
- the canonical English Hessen baseline is `subtree_adopted`
- the canonical French Hessen baseline is `subtree_adopted`
- the canonical Latin Hessen baseline is `subtree_adopted`
- the canonical Spanish Hessen baseline is `subtree_adopted`
- the canonical Greek Hessen baseline is `subtree_adopted`
- the canonical Chinese Hessen baseline is `subtree_adopted`
- the canonical Music Hessen baseline is `subtree_adopted`
- the canonical Economics Hessen baseline is `subtree_adopted`
- at tracked-tree granularity, Hessen upper-secondary, Hessen lower-secondary, and Bavaria Gymnasium have now completed the delete handoff (`legacy_deleted`)

## Close-out steering

The migration has now entered the explicit close-out phase:

- Hessen upper-secondary is already retired from the active repo
- the remaining program risk is now dominated by optional scope extension decisions
- therefore the primary top-line progress number should no longer be the historical subtree-adoption score alone

From here on, the main overall percentage should be the completion-track score from
`docs/dev/canonical-gymnasium-migration-status.md`:

- `completion-track score` = average of the tracked legacy-tree delete-gate scores

Current close-out headline:

- `100%`

Operational consequence:

- keep the historical close-out score stable, but shift new expansion work onto a Mathematics-first DE-wide track
- prefer adding the next Bundesland to canonical Gymnasium `Mathematik` over widening additional non-math subject lanes
- keep the migration unit didactically closed even on that Math-first track; do not switch to whole-subject or whole-state big-bang cutovers
- treat source import and mapping-lane setup for the next mathematics state as higher priority than optional out-of-scope items such as Bavaria `abi/` scope debates

Strategic refocus on `2026-03-20`:

- after the reviewed Bavaria applicability close-out across the currently active subject set, the next convergence pressure should come from **new Bundesländer in canonical Gymnasium Mathematics**
- current mapping archive reality still reflects only `DE-HE` and `DE-BY`; the next meaningful architecture test is therefore a third state on the shared canonical math spine, not more subject breadth on the same two-state base
- the working model from here on is: **Mathematics first, one Bundesland at a time, one didactically closed corridor at a time**
- see `docs/dev/canonical-gymnasium-math-de-expansion-plan.md` for the concrete ordering and onboarding criteria

## Work packages

## WP0. Baseline inventory

Status: `done`

Tasks:

- identify the exact Hessen mathematics source landscape file(s)
- identify which goal IDs are already stable enough for mapping
- identify backend classes responsible for goal loading, learner state, frontier, and mastery persistence
- identify where a mapping registry can be added with minimal surface area

Expected output:

- one short inventory note in `tmp/canonical-gymnasium-work_notes.md`

Baseline inventory result:

- Hessen upper-secondary mathematics source file identified:
  `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_MATHEMATIK.de.json`
- source landscape ID identified:
  `2796fc7b-ba9d-446f-8f26-711dd6d8a9a3`
- smallest backend insertion points identified:
  - landscape loading / lookup: `backend/src/main/java/com/skillpilot/backend/landscape/LandscapeService.java`
  - mastery read / write and unified learner state: `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java`
- mapping files can safely live under curriculum-adjacent directories as plain JSON files because the current landscape loader already skips JSON files that do not expose `landscapeId` plus a `goals` array

## WP1. Mapping format and loader

Status: `done`

Tasks:

- define the mapping JSON shape
- add a backend loader for mapping files
- validate duplicate or conflicting mappings early
- keep the format intentionally narrow for the pilot

Suggested initial file location:

- `curricula/.../mapping/` or another curriculum-adjacent location that keeps ownership visible

Decision rule:

- choose the smallest location and loader design that does not force later duplication

WP1 result:

- minimal mapping format implemented in backend:
  - top-level fields: `version`, `sourceLandscapeId`, `targetLandscapeId`, `mappings`
  - entry fields: `legacyGoalId`, `canonicalGoalId`, `matchType`
- supported `matchType` values currently:
  - `exact`
  - `partial`
- conflicting duplicate mappings for the same `legacyGoalId` are rejected eagerly
- non-landscape, non-mapping JSON files continue to be ignored
- initial storage convention for authored mapping files:
  - keep them curriculum-adjacent under `curricula/.../mapping/*.json`
- Bundesland identifier convention for later overlay/filter metadata:
  - use ISO 3166-2 codes such as `DE-HE` and `DE-BY`
  - keep existing repo path segments such as `DE/HE` unchanged unless a separate filesystem migration becomes necessary
- mapping discovery rule:
  - inspect ordinary `.json` files and identify mapping files by JSON shape, not by a special filename suffix
- mapping files intentionally omit `landscapeId` and `goals`, so the existing `LandscapeService` continues to ignore them
- implementation classes:
  - `backend/src/main/java/com/skillpilot/backend/landscape/GoalMappingService.java`
  - `backend/src/main/java/com/skillpilot/backend/landscape/GoalMappingFile.java`
  - `backend/src/main/java/com/skillpilot/backend/landscape/GoalMappingEntry.java`
  - `backend/src/main/java/com/skillpilot/backend/landscape/ResolvedGoalMapping.java`
- initial test coverage:
  - `backend/src/test/java/com/skillpilot/backend/landscape/GoalMappingServiceTest.java`

## WP2. Canonical mathematics landscape

Status: `done`

Tasks:

- create the first canonical mathematics landscape file
- keep the file close to the current `LearningLandscape` structure
- document the provenance from Hessen upper-secondary mathematics
- do not mix in Bayern or Sek I yet

Acceptance criteria:

- file loads through the normal landscape-loading path
- graph validation passes

WP2 result:

- first canonical mathematics landscape added:
  - `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`
- first real Hessen-to-canonical mapping fixture added:
  - `curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_to_canonical_math.json`
- pilot location decision for now:
  - keep the first canonical seed physically separate from state-owned source trees on a Germany-level path
- pilot scope kept intentionally small:
- pilot root
  - motivation goal
  - one introductory analysis branch for functions and representations
- coexistence strategy:
  - all pilot goals use new IDs
  - the pilot landscapes remain directly loadable, but the learner-facing entry point is now the shared root `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json`
- current learner-facing filter split:
  - root: `ALL`, `DE-HE`, `DE-BY`
  - child subjects: `GK`, `LK`
- current runtime rule:
  - the selected root Bundesland filter is propagated into the selected canonical child landscapes during goal filtering
- current runtime rule is still transitional:
  - canonical state visibility is currently derived at runtime from mappings and provenance
  - `sourceLandscapeId -> jurisdiction` resolution can now be served from the DE-level provenance registry `curricula/DE/Gymnasium/provenance/source-landscape-registry.json` instead of depending only on a loaded legacy landscape file
  - Hessen upper-secondary champion/topic equivalence can now also serve `sourceLandscapeId + sourceGoalId -> atomic legacy closure` from the DE-level provenance registry `curricula/DE/Gymnasium/provenance/source-goal-closure-registry.json`
  - target architecture should converge to compiled node-level `applicability`; see `docs/dev/canonical-gymnasium-applicability-design.md`
- verification:
  - backend tests confirm loading of the pilot landscape and the repository mapping fixture
  - graph validation passes with the new pilot landscape present

## WP3. Read-side mastery projection

Status: `done`

Tasks:

- compute canonical mastery from mapped legacy mastery
- keep legacy mastery storage intact
- do not require Custom GPT changes
- do not force learner data migration yet

Important note:

- mastery is currently keyed by learner + goal key, not by learner + landscape, so projection can be introduced additively

WP3 result:

- read-side projection added in:
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#getMastery`
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#getMasteryWithTimestamps`
- pilot projection rule for now:
  - only `exact` mappings project mastery into canonical goals
  - projection only applies when the canonical goal is visible in the current selected curriculum view
  - higher existing canonical mastery wins over projected legacy mastery
  - timestamped reads break ties by newer timestamp
- effect on runtime behavior:
  - legacy Hessen views keep their stored mastery behavior
  - canonical pilot views can consume projected legacy mastery without GPT/API changes
  - frontier and learner-state assembly automatically benefit because they already read mastery through `LearnerService`
- direct test coverage now includes:
  - canonical mastery read projection
  - canonical frontier based on projected legacy mastery
  - canonical learner-state compatibility without legacy goal leakage
  - legacy-view non-leakage in the opposite direction

## WP4. Learner-state compatibility

Status: `done`

Tasks:

- ensure `getLearnerState` can still return one coherent state
- ensure frontier logic remains stable for legacy Hessen learners
- ensure canonical pilot views can consume projected mastery
- avoid any requirement that the GPT must understand data-layer transitions

Acceptance criteria:

- no new mandatory GPT actions
- no new client-side branching based on legacy/canonical mode

WP4 result:

- learner-state compatibility added around view-dependent goal IDs in:
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#getLearnerState`
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#getRichFrontier`
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#getPlannedGoals`
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#setPlannedGoals`
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#setActiveGoal`
  - `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java#setMastery`
- current compatibility rule:
  - when the current selected curriculum exposes canonical goals, legacy goal IDs are normalized into visible canonical goal IDs where a mapping exists
  - `exact` mappings are used for active-goal and mastery flows
  - `partial` mappings are additionally allowed for planned-goal / scope anchoring
  - persistence stays lightweight: no bulk migration of stored learner state is required for the pilot
- practical effect:
  - canonical pilot views no longer leak mapped legacy IDs into planned goals or active-goal state
  - `setMastery` can complete successfully even if the stored active goal is still a legacy ID but the visible tutoring loop is canonical
  - UI/GPT flows keep one coherent learner-state contract
- targeted verification now covers:
  - projected planned-goal IDs in canonical view
  - projected active-goal IDs in canonical view
  - canonical mastery writes when the stored active goal originated from a legacy ID

## WP5. Test coverage

Status: `done`

Tasks:

- add unit tests for mapping load and lookup
- add service tests for mastery projection
- add learner-state invariants for the pilot
- add one regression test ensuring legacy Hessen behavior remains intact

WP5 result:

- mapping-loader coverage exists for repository-backed fixtures and conflict handling
- learner-service coverage now explicitly locks the first canonical cutover invariants for the Mathematics function corridor:
  - exact legacy mastery from Hessen and Bayern projects deterministically into the same canonical goals
  - the canonical frontier unlocks from projected legacy mastery without leaking legacy IDs into the visible learner state
  - mixed legacy planned goals collapse into the same canonical subtree targets
  - stored canonical mastery is not downgraded by weaker projected legacy mastery
  - equal-valued projection ties resolve deterministically via newer timestamps
- practical consequence:
  - the first adopted Mathematics function corridor can now be treated as `cutover_ready` on the backend/runtime side while legacy views stay available

## WP6. Hessen Sek I math attachment

Status: `in_progress`

Tasks:

- extend canonical mathematics downward with Hessen Sek I
- keep mappings explicit
- avoid changing the API surface while expanding content coverage

WP6 progress so far:

- first Hessen Sek I attachment slice added to the canonical mathematics landscape:
  - mappings / functional relationships
  - proportional relationships
  - linear functions
  - quadratic equations
  - quadratic functions
- the Hessen Sek I math attachment is now widened with the first reviewed row-based bridge batch beyond that old corridor:
  - exact reviewed row mappings for square roots, similarity/Strahlensatz, and circle/cylinder
  - exact reviewed foundation mappings for rational-number fluency, geometry-basics visibility, units/measurement handling, and the J6 symmetry/angle baseline
  - canonical `J6` area/volume baseline is now split into separate area and solid-measure atoms so Hessen can map there with exact row-level evidence instead of one broad partial bridge
  - canonical `J9` power/root baseline is now split so Hessen can bind the graph-based Potenz-/Wurzelfunktionsziel exactly, while the shared Potenzgesetz-route remains visible as a sibling child
  - canonical `J8` linear-analysis baseline is now split so Hessen can bind `Lineare Gleichungen und Ungleichungen lösen` exactly, while Bayern keeps the exact row for line equations, roots, and intersections
  - canonical `quadratic vertex` baseline is now split so Hessen can bind the binomial-formula route exactly, while Bayern keeps the exact Scheitelpunkt/graph route as its own sibling child
  - canonical `J5` number-basics baseline is now split so Hessen can bind `Natürliche Zahlen sicher darstellen, ordnen und mit ihnen rechnen` exactly, while Bayern keeps the exact add/subtract route with natural and whole numbers
  - remaining reviewed math debt is no longer on Hessen row-coverage; only the two Bayern override-backed function-value pilot gaps remain
  - exact mappings for Pythagoras, integer-exponent laws, congruence, and term setup
  - prerequisite closure for `DE-HE` is now explicit in the mapping layer for rational numbers, terms, geometry basics, and size/unit handling
- canonical seed now references both Hessen upper-secondary and Hessen Sek I source material
- explicit second mapping file added for Hessen Sek I -> canonical pilot
- no API/GPT contract changes were required for this content expansion
- first Hessen Sek I physics bridge slice added to the canonical DE physics landscape:
  - new canonical mechanics bridge cluster under DE physics
  - exact mappings for motion diagrams, forces/inertia, friction, and qualitative mechanical energy
  - a dedicated canonical density/mass/volume atom now closes the old Hessen `7.4 Mechanik` row so the broad mechanics anchor itself can bind exactly instead of staying partial
  - the Hessen `Kräfteigenschaften nutzen` row now binds exactly to a dedicated canonical Sek-I `force-properties` atom instead of the broad mechanics bridge cluster
  - the Hessen `10.1 Arbeit und Energie` row now binds exactly to a dedicated canonical Sek-I `work-and-energy` cluster that contains qualitative work, mechanical energy, heat, and electrical-energy children
  - selected upper-secondary physics goals now explicitly depend on these adopted Sek-I mechanics anchors
  - mastery projection and frontier unlocking are covered by targeted backend tests
- first Hessen Sek I heat bridge slice added to the canonical DE physics landscape:
  - new canonical Sek-I heat cluster under DE physics
  - exact mappings now cover the full Hessen `7.2 Wärmelehre` row, including temperature/heat, temperature measurement and expansion, particle model, and heat transfer
  - the canonical `Wärme als Energieform` atom now explicitly depends on this reviewed Sek-I heat bridge instead of only on the coarse mechanical-energy baseline
  - mastery projection for the adopted heat cluster and its atomic rows, plus a particle-model frontier unlock for heat transfer, are covered by targeted backend tests
- first Hessen Sek I optics bridge slice added to the canonical DE physics landscape:
  - new canonical Sek-I optics bridge cluster under DE physics
  - exact mappings now cover both `7.1 Optik 1` and `8.1 Optik 2`, including light propagation, ray model, reflection, lens imaging, vision, and simple optical instruments
  - `Linsenabbildungen` now explicitly depends on the adopted Sek-I ray-model anchor
  - mastery projection for both adopted optics clusters and their atomic rows, plus the ray-model frontier unlock for lens imaging, are covered by targeted backend tests
- first Hessen Sek I electricity bridge slice added to the canonical DE physics landscape:
  - new canonical Sek-I electricity cluster under DE physics
  - exact mappings now cover both `7.3 Magnetismus und Elektrizität 1` and `8.2 Elektrizität 2`, including magnets/fields, simple circuits, current effects, current measurement, static electricity/voltage, current-voltage relation, resistor circuits, and electrical safety
  - the J8 voltage/safety cluster now explicitly depends on the adopted J7 electricity cluster
  - mastery projection for both adopted electricity clusters and their atomic rows, plus frontier unlocks for current effects/current measurement and the voltage-current relation, are covered by targeted backend tests
- first Hessen Sek I radioactivity bridge slice added to the canonical DE physics landscape:
  - new canonical Sek-I radioactivity cluster under DE physics
  - exact mappings now cover the full non-fakultative Hessen `10.2 Radioaktivität` row, including atomic structure, radiation detection/effects, and applications/risks
  - the upper-secondary `Radioaktive Strahlung und Wirkungen` entry point now explicitly depends on this reviewed Sek-I radioactivity bridge
  - mastery projection for the adopted radioactivity cluster and its atomic rows, plus a frontier unlock from atomic structure toward radiation detection, are covered by targeted backend tests
- first Hessen Sek I pressure/buoyancy bridge slice added to the canonical DE physics landscape:
  - new canonical Sek-I pressure-and-buoyancy cluster under DE physics
  - exact mappings now cover the facultative Hessen `8.3 Druck und Auftrieb` row, including pressure in liquids/gases, qualitative pressure-temperature relations, Archimedes' principle, and first qualitative flight/air-resistance interpretations
  - the new cluster explicitly depends on the reviewed Sek-I mechanics bridge, and the pressure-temperature atom additionally depends on the reviewed Sek-I heat bridge
  - mastery projection for the adopted pressure cluster and its atomic rows, plus a frontier unlock from projected pressure/density mastery toward buoyancy, are covered by targeted backend tests
- first Hessen Sek I acoustics bridge slice added to the canonical DE physics landscape:
  - new canonical Sek-I acoustics cluster under DE physics
  - exact mappings now cover the facultative Hessen `8.3b Akustik` row, including sound sources, sound propagation, pitch/loudness, hearing/noise, and music-related sound phenomena
  - the sound-propagation atom explicitly reuses the reviewed Sek-I particle-model anchor, and the upper-secondary Q2 `Harmonische Wellen und ihre Größen` entry point now additionally depends on the reviewed Sek-I acoustics bridge
  - mastery projection for the adopted acoustics cluster and its atomic rows, plus a frontier unlock from projected sound-source and particle-model mastery toward sound propagation, are covered by targeted backend tests
- first Hessen Sek I colors bridge slice added to the canonical DE physics landscape:
  - new canonical Sek-I colors cluster under DE physics
  - exact mappings now cover the facultative Hessen `8.3c Farben` row, including color origin/decomposition, additive and subtractive color mixing, simple color perception, and technical color applications
  - the colors bridge explicitly reuses the reviewed Sek-I light-propagation anchor, and the upper-secondary Q3 `Spektrum elektromagnetischer Wellen` entry point now additionally depends on the reviewed Sek-I colors bridge
  - mastery projection for the adopted colors cluster and its atomic rows, plus a frontier unlock from projected color-origin mastery toward color mixing, are covered by targeted backend tests
- the Hessen Sek I work/energy bridge is now widened into the `J10` continuation of `10.1 Arbeit und Energie`:
  - exact mappings now also cover `Wärme als Energieform` and `Elektrische Energie nutzen`, with the canonical heat-energy atom depending explicitly on the reviewed Sek-I heat bridge and the canonical electrical-energy atom on the reviewed Sek-I voltage bridge
- first Hessen Sek I chemistry bridge slice added to the canonical DE chemistry landscape:
  - new canonical foundations cluster for working methods, substances, states, solutions, and first acid-base distinctions
  - exact mappings for the adopted J8 chemistry atoms plus partial scope anchors from Hessen J8/8.1
  - selected E-phase protolysis goals now explicitly depend on these adopted Sek-I chemistry anchors
  - mastery projection, planned-goal projection, and frontier unlocking are covered by targeted backend tests
- the Hessen Sek I chemistry foundations bridge is now widened to the full reviewed `8.1 Stoffe – Strukturen – Eigenschaften` row:
  - new canonical Sek-I safety and separation atoms now sit inside the existing foundations cluster
  - the Hessen `Gefahren beim Umgang mit Chemikalien` and `Trennverfahren für Stoffgemische` atoms now map exactly, and the old `8.1` cluster itself upgrades from `partial` to `exact`
  - mastery projection for the widened safety/separation slice, plus a local Sek-I frontier unlock from projected working-methods and substance mastery toward safety, separation, and states, are covered by targeted backend tests
- the Hessen Sek I chemistry reactions bridge now extends reviewed adoption into `8.2 Chemische Reaktion – Stoff- und Energieumsatz`:
  - new canonical Sek-I reactions cluster for reaction characteristics, simple oxidation/reduction, combustion, reaction energy, and conservation of mass
  - the Hessen `8.2` row and all five adopted J8 atoms now map exactly into that cluster
  - the upper-secondary E-phase redox route `Einfache Redoxreihen aufstellen` now additionally depends on the adopted Sek-I oxidation/reduction anchor, without widening the earlier E-phase start nodes
  - mastery projection, planned-goal projection, and local Sek-I frontier unlocking for the widened reactions slice are covered by targeted backend tests
- the Hessen Sek I chemistry symbol-language bridge now extends reviewed adoption into `9.1 Chemische Symbolsprache und Anwendung`:
  - new canonical Sek-I symbol-language cluster for constant proportions, Dalton model, chemical symbols/formulas, simple reaction equations, and first redox schemes
  - the Hessen `9.1` row and all five adopted J9 atoms now map exactly into that cluster
  - the new cluster reuses the reviewed `8.2` reactions bridge as its didactic base, and local frontier unlocking now covers the late J9 symbol-language endpoint `Redoxreaktionen und Oxidationszahlen`
  - mastery projection, planned-goal projection, and symbol-language frontier unlocking are covered by targeted backend tests
- the Hessen Sek I chemistry ions/electrolysis bridge now extends reviewed adoption into `9.3 Elektrolyse und Ionenbegriff`:
  - new canonical Sek-I ions/electrolysis cluster for conductivity, ions as charge carriers, and electrolysis of simple salt solutions
  - the Hessen `9.3` row and all three adopted J9 atoms now map exactly into that cluster
  - the new cluster reuses the reviewed `9.1` symbol-language bridge as its didactic base, and the upper-secondary `Elektrolyse beschreiben` route now additionally depends on the adopted Sek-I electrolysis anchor
  - mastery projection, planned-goal projection, and local frontier unlocking for the widened ions/electrolysis slice are covered by targeted backend tests
- the Hessen Sek I chemistry atomic-structure bridge now extends reviewed adoption into `10.1 Atombau, Periodensystem und Ionenbindung`:
  - new canonical Sek-I atomic-structure-and-bonding cluster for core-shell model, Bohr energy levels, periodic-table orientation, ion formation via noble-gas rule, and ionic bonding
  - the Hessen `10.1` row and all five adopted J10 atoms now map exactly into that cluster
  - the new cluster reuses the reviewed `9.1` symbol-language bridge as its didactic base, while `Ionenbildung` additionally depends on the reviewed `9.3` ions anchor and the upper-secondary `Bindungsmodelle sicher nutzen` route now depends on the adopted Sek-I ionic-bonding anchor
  - mastery projection, planned-goal projection, and local frontier unlocking for the widened atomic-structure slice are covered by targeted backend tests
- first Hessen Sek I biology bridge slice added to the canonical DE biology landscape:
  - new canonical foundations-and-cells cluster for biology-as-science, characteristics of life, microscopy, plant cells, and plant/animal cell comparison
  - exact mappings for the adopted Sek-I biology atoms plus partial scope anchors from Hessen introductory biology and cells clusters
  - selected E-phase cell-biology goals now explicitly depend on these adopted Sek-I biology anchors
  - mastery projection, planned-goal projection, and frontier unlocking are covered by targeted backend tests
- Hessen Sek I biology bridge widened in the same canonical DE biology landscape:
  - new canonical photosynthesis-and-respiration cluster for light dependence, carbon dioxide/water, starch/oxygen detection, the word equation, and the first significance bridge toward cell respiration
  - exact mappings for the adopted Hessen 7.2 metabolism atoms plus a partial scope anchor from the Hessen 7.2 cluster
  - selected Q3 metabolism goals now explicitly depend on these adopted Sek-I biology anchors
  - mastery projection, planned-goal projection, and Q3 frontier unlocking are covered by targeted backend tests

## WP7. Bavaria math mapping

Status: `in_progress`

Tasks:

- map `curricula/DE/BY/Gymnasium/Mathematik.json` into the canonical mathematics layer
- preserve Bavarian structure as placement/view metadata rather than duplicated content

WP7 progress so far:

- first Bavaria mapping fixture added:
  - `curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_math_to_canonical_math.json`
- initial pilot scope stays deliberately narrow and reuses the already stabilized canonical function path:
  - function concept
  - linear-function interpretation
  - line equations, roots, and line intersections
  - direct proportionality
  - vertex determination for quadratic functions
  - quadratic-function interpretation
  - quadratic graph properties
  - solving quadratic equations
- the canonical pilot now carries two small Bavaria-compatible atoms instead of forcing narrower Bavarian goals onto broader pre-existing canonical goals:
  - `Lineare Funktionen rechnerisch untersuchen`
  - `Scheitelpunkte quadratischer Funktionen bestimmen`
- these two atoms are now also anchored on the Hessen Sek-I side with explicit `partial` mappings from:
  - `Lineare Gleichungen und Ungleichungen loesen`
  - `Binomische Formeln nutzen`
- Bavarian topic clusters currently map with `partial` semantics into the canonical Sek-I function cluster so scope/planning can converge without duplicating content
- targeted repository-fixture and learner-service regression tests now cover this first Bavaria slice

## WP8. Cross-subject pilot

Status: `in_progress`

Tasks:

- add a first combined Mathematics + Physics view
- add only a small set of explicit Mathe -> Physik `requires` edges
- verify that navigation improves before expanding cross-subject dependencies further

WP8 progress so far:

- first canonical Physics pilot added on the Germany-level path:
  - `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`
- pilot scope intentionally stays narrow:
  - Hessen upper-secondary E.1 motion corridor
  - first Hessen upper-secondary E.3 horizontal-projection subtree
  - motion diagrams
  - uniform motion
  - uniformly accelerated motion
  - free fall
  - motion modeling
  - reference frames and superposition
  - horizontal projection
  - traffic safety / reaction and braking distances
- first explicit Hessen Physik -> canonical Physik mapping fixture added:
  - `curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_to_canonical_physics_pilot.json`
- the Physics pilot reuses the existing canonical Mathematics pilot instead of duplicating content:
  - selected canonical mathematics atoms are visible in the Physics motion cluster
  - Physics atomic goals add only a small set of explicit Math -> Physics prerequisite edges
- second Physics adoption slice added:
  - Hessen E.2 Newton subtree (`Newtons Axiome und Inertialsysteme`) is now attached to the canonical Physics pilot
  - the broader Hessen E.2 parent cluster maps with `partial` semantics onto this adopted Newton slice
- third Physics adoption slice added:
  - the Hessen E.2 conservation subtree (`Erhaltungssaetze`) is now attached to the canonical Physics pilot
  - the adopted conservation corridor keeps energy, momentum, and simple collision goals together as one closed migration slice
- E.2 hardening step added:
  - a canonical E.2 mechanics root now groups the adopted Newton and conservation subtrees as one explicit migration unit
  - the Hessen E.2 parent cluster now maps `exact` onto that canonical E.2 corridor
- first Bavaria Physics compatibility slice added:
  - a small Bavaria mapping fixture now projects selected Ph8/Ph9/Ph10 mechanics goals into the canonical Physics pilot
  - the first Bavaria scope anchors cover motion modeling, energy conservation, and momentum conservation
- Bavaria collision bridge added:
  - one small canonical collision atom now absorbs the broader Bavaria collision goal without reshaping the existing Hessen-based elastic/inelastic atoms
- Bavaria 2D motion edge added:
  - selected Bavaria horizontal-throw and motion-modeling goals now attach to the canonical movement slice
  - the Bavaria horizontal-throw analysis goal and the broad motion-modeling goal now project `exact` into the adopted canonical atoms
  - the remaining borrowed closure nodes for Bavaria visibility still rely on explicit overrides or `partial` evidence where no honest 1:1 source goal exists yet
- Bavaria E.3 reattachment added:
  - the selected Bavaria horizontal-throw goals now attach to the new canonical E.3 slice instead of borrowing the older motion/free-fall atoms
- first E.3 adoption slice added:
  - the Hessen subtree `Waagerechter Wurf und Superposition` is now attached to the canonical Physics pilot as a new `subtree_adopted` migration unit
  - the broader frozen Hessen E.3 parent cluster maps `partial` onto this adopted horizontal-throw slice
- mixed-state scope normalization hardened:
  - redundant canonical child scopes are now removed when a mapped Hessen or Bavaria parent cluster already contains them
- learner-state planned-scope normalization aligned:
  - `getLearnerState` now returns the same collapsed canonical parent scopes that `getPlannedGoals` already exposed for mixed Hessen/Bavaria plans
- HTTP state contract covered:
  - the UI learner-state endpoint now has integration tests that read persisted mixed Hessen/Bavaria legacy plans and verify that the serialized `goals.planned` payload exposes only the collapsed canonical parent scope for movement, E.2 mechanics, and conservation
- first cutover-usage test covered:
  - a mixed Hessen/Bavaria conservation plan plus mixed projected legacy mastery now yields a shared canonical collision frontier on the UI learner-state endpoint
- movement cutover-usage test covered:
  - a mixed Hessen/Bavaria movement plan plus projected Bavaria physics mastery and Hessen mathematics mastery now yields a shared canonical uniform-motion frontier on the UI learner-state endpoint
- E.2 cutover-usage test covered:
  - a mixed Hessen/Bavaria E.2 plan plus projected Hessen accelerated-motion mastery now yields a shared canonical Newton frontier on the UI learner-state endpoint
- E.3 usage test covered:
  - a Hessen E.3 legacy plan plus projected Hessen E.2 mastery now yields a canonical superposition frontier on the UI learner-state endpoint
- mixed E.3 usage test covered:
  - a mixed Hessen/Bavaria E.3 plan plus projected Hessen E.2 mastery now yields the same canonical superposition frontier on the UI learner-state endpoint
- E.3 cutover-readiness invariants covered:
  - exact mastery projection from legacy Hessen E.3 atoms into canonical E.3 atoms
  - canonical dominance and timestamp tie-break for mapped E.3 mastery
  - canonical active-goal and mastery-write behavior for mapped E.3 goals
  - legacy Hessen Physics views staying free of canonical E.3 goal leakage
- targeted verification now covers:
  - root-curriculum loading and closure from canonical Physics into canonical Mathematics
  - repository-backed Physics mapping fixture loading
  - learner frontier / learner-state behavior using projected Hessen Physics + Hessen Mathematics mastery inside the Physics pilot
  - first Bavaria Physics mastery projection and scope normalization into the canonical Physics pilot
  - exact Bavaria collision-goal projection into the canonical Physics collision bridge atom
  - partial scope normalization from Bavaria 2D motion goals into existing canonical movement atoms
  - remapped Bavaria horizontal-throw planned-goal normalization into the new canonical E.3 slice
  - planned-goal normalization from the frozen Hessen E.3 parent cluster and the adopted horizontal-throw subtree into the new canonical E.3 slice
  - mixed Hessen/Bavaria scope collapse onto shared canonical movement, conservation, and E.2 roots
  - mixed Hessen/Bavaria scope collapse onto the new shared canonical E.3 root
  - learner-state planned-goal output collapsing the same mixed Hessen/Bavaria scope combinations onto shared canonical movement, conservation, and E.2 roots
  - exact planned-goal normalization from the Hessen E.2 parent cluster and the Hessen conservation cluster into canonical E.2 scopes
  - frontier unlocking inside the hardened E.2 corridor from projected Hessen mastery
  - canonical active-goal projection and canonical mastery-write behavior for mapped E.2 goals
  - deterministic projection dominance and timestamp tie-break on canonical E.2 goals
  - legacy Hessen Physics views staying free of canonical E.2 goal leakage
  - cutover-readiness invariants for the Physics motion corridor:
    - exact legacy-Physics mastery projection into canonical Physics goals
    - planned-goal normalization from the Hessen E.1 cluster into the canonical Physics corridor
    - canonical active-goal and mastery-write flow for mapped legacy Physics goals
    - legacy-Physics views staying free of canonical Physics goal leakage
    - deterministic projection dominance and timestamp tie-break on canonical Physics goals
- practical consequence:
  - the adopted Physics motion corridor can now be treated as `cutover_ready` on the backend/runtime side while the frozen Hessen Physics view remains available
  - the canonical Physics E.2 mechanics corridor can now also be treated as `cutover_ready` on the backend/runtime side while the frozen Hessen Physics view remains available
  - the canonical Physics E.3 horizontal-projection slice can now also be treated as `cutover_ready` on the backend/runtime side while the frozen Hessen Physics view remains available
  - the same canonical Physics pilot now accepts a first Bavaria legacy slice without introducing a second canonical structure

## Recommended execution order

1. WP0 baseline inventory
2. WP1 mapping format and loader
3. WP2 canonical mathematics landscape
4. WP3 read-side mastery projection
5. WP4 learner-state compatibility
6. WP5 test coverage
7. WP6 Hessen Sek I math attachment
8. WP7 Bavaria math mapping
9. WP8 cross-subject pilot

## Status model

Use these status values in this document and in work notes:

- `todo`
- `in_progress`
- `blocked`
- `done`
- `later`

## Change policy

Use `docs/` for durable project knowledge:

- architecture decisions
- rollout stages
- stable file formats
- accepted migration rules

Use `tmp/canonical-gymnasium-work_notes.md` for volatile execution notes:

- current sprint status
- open questions
- intermediate decisions
- concrete next actions

## Definition of a good first milestone

The first milestone is successful if:

- a canonical mathematics pilot exists,
- Hessen upper-secondary mathematics maps into it,
- current learner APIs still behave the same from the GPT point of view,
- at least one deterministic mastery projection path is tested,
- no existing Hessen learner workflow is broken.
