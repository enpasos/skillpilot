# MIT OCW -> SkillPilot Implementation Notes

## Goal
Implement `curricula/US/MIT_OCW/priority.en.md` as a real SkillPilot curriculum package.
This file is the execution log + implementation backlog.

## Locked Decisions
- License handling: OCW content is modeled as metadata/links only; no raw content copy beyond license-safe excerpts.
- Language strategy: English-first titles/descriptions (`title`, `description`, `titleEn`, `descriptionEn`) for strong GPT support.
- Source linking: every module and atomic goal gets explicit `sourceRef` to full OCW source pages.
- Delivery scope v1: Top-5 modules from `priority.en.md`.
- Graph shape v1: one root curriculum + one module landscape per OCW module.

## V1 Scope (Top 5)
- 18.01SC Single Variable Calculus
- 18.02SC Multivariable Calculus
- 18.05 Introduction to Probability and Statistics
- 18.06 Linear Algebra (Spring 2010)
- 6.100L Introduction to CS and Programming using Python

## Target Artifacts
- `curricula/US/MIT_OCW/json/US_MAS_U_MIT_OCW_FOUNDATIONS.en.json` (root curriculum)
- `curricula/US/MIT_OCW/json/US_MAS_U_MIT_OCW_18_01SC.en.json`
- `curricula/US/MIT_OCW/json/US_MAS_U_MIT_OCW_18_02SC.en.json`
- `curricula/US/MIT_OCW/json/US_MAS_U_MIT_OCW_18_05.en.json`
- `curricula/US/MIT_OCW/json/US_MAS_U_MIT_OCW_18_06.en.json`
- `curricula/US/MIT_OCW/json/US_MAS_U_MIT_OCW_6_100L.en.json`
- `curricula/US/MIT_OCW/json/US_MAS_U_MIT_OCW_6_0002.en.json`
- `curricula/US/MIT_OCW/json/US_MAS_U_MIT_OCW_6_006.en.json`
- `curricula/US/MIT_OCW/source_linking_atomic.en.md` (atomic-level source-linking plan)
- `curricula/curriculum_manifest.json` (add root entry)

## Execution Plan

### Phase 0 - Preparation
- [x] Parse and extract mapping intent from `priority.en.md`.
- [x] Validate technical constraints (schema, validator rules, manifest behavior).
- [x] Define v1 scope and file-level deliverables.

### Phase 1 - Data Modeling
- [x] Define stable `landscapeId` and goal IDs for root + 5 modules.
- [x] Define stable source-link ID naming convention (`ocw:mit_ocw_*:*`).
- [x] Define module-internal DAGs (atomic + cluster) per module.
- [x] Define cross-module prerequisite edges:
  - `18.01SC -> 18.02SC`
  - `18.02SC -> 18.05`
  - `18.01SC -> 18.06`
- [x] Implemented next-increment edge: `6.100L -> 6.0002, 6.006`

### Phase 2 - JSON Implementation
- [x] Create root landscape JSON with `root` goal containing module-root goals.
- [x] Create 5 module JSON files with:
  - module root goal (tagged `root`, `module:<course>`)
  - 6-8 atomic goals
  - `requires` and `contains` DAG
  - `dimensionTags.phase = "Module"` for module goals
  - `sourceRef` for module and atomic goals
- [x] Ensure no missing refs, no self refs, no cycles.

### Phase 3 - Registration + Validation
- [x] Add root curriculum to `curricula/curriculum_manifest.json` with exact matching title.
- [x] Run graph validator:
  - `cd app && npm run validate:graph`
- [x] Fix all validator errors until clean.

### Phase 4 - QA and Didactic Pass
- [x] Run a frontier walkthrough on v1 root curriculum.
- [x] Check that first recommended path is coherent for math core and programming core.
- [x] Record didactic findings and micro-adjust dependencies.

### Phase 5 - Intensive Source Linking (Atomic Level)
- [x] Finalize atomic-source-linking policy in `source_linking_atomic.en.md`.
- [x] Ensure each atomic goal has at least:
  - `sourceRef` (primary concept source),
  - one practice link (problem set/activity),
  - one assessment link (exam/quiz) where available.
- [x] Add stable source link IDs in `extendedData.sourceLinks`.
- [x] Verify link coverage percentages per module and record gaps.

## Quality Gates (Definition of Done)
- [x] All new JSON files load as landscapes (backend + app validator).
- [x] Root curriculum is registered in `curricula/curriculum_manifest.json`.
- [ ] Manual UI overview check of curriculum visibility.
- [x] Module landscapes are not treated as root curricula.
- [x] DAG invariants hold for `requires`, `contains`, and effective prerequisites.
- [x] License and attribution tags/refs are present and unambiguous.
- [x] English metadata is complete and GPT-friendly.
- [x] Atomic source-linking coverage reaches target thresholds for top-5 modules (see `source_linking_atomic.en.md`).
- [x] Atomic source-linking coverage reaches target thresholds for all implemented MIT OCW module landscapes.
- [x] CI check for MIT OCW atomic source-linking is active (`GVR-007`).

## Notes for Implementation
- Use `phase: Module` or `phase: Curriculum` only (validator-safe values).
- Use explicit `type` (`cluster`/`atomic`) for clarity.
- Keep atomic goals testable in 1-3 tasks.
- Prefer minimal prerequisite edges (avoid over-wiring).

## Atomic Design Rules (Modeled after Hessen Math)
Reference: `curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_MATHEMATIK.de.json`

- Atomic wording style:
  - One observable competence per node.
  - Description starts with learner-centered phrasing (`The learner can ...`).
  - Avoid bundling multiple heavy concepts into one atomic node.
- Atomic granularity:
  - One exam/assignment item should typically assess 1 atomic goal.
  - If a goal needs more than 3 distinct operations, split it.
- Atomic sequencing:
  - First atomic node in each module is a motivation anchor (`Why ...`).
  - Each next atomic node depends on 1-2 essential predecessors only.
- Atomic metadata:
  - `sourceRef` must point to a concrete OCW page (not only generic root when avoidable).
  - `dimensionTags` must stay consistent per module (`phase`, `area`, `topicCode`, `demandLevel`).
- Atomic QA:
  - Reject vague nodes (e.g. \"understand all of ...\").
- Reject duplicate semantics across siblings.
- Prefer explicit action verbs (compute, model, interpret, compare, justify).

## Phase 4 Findings (Frontier Walkthrough, 2026-03-01)
- Method: automated backend regression test using real curriculum closure and frontier logic.
- Test file: `backend/src/test/java/com/skillpilot/backend/service/MitOcwFrontierWalkthroughTest.java`
- Result: root-level onboarding works as intended:
  - With empty mastery, frontier starts at `mit_ocw_foundations_why`.
  - After mastering `mit_ocw_foundations_why`, first module-entry atomics unlock:
    - `mit_ocw_18_01sc_why`
    - `mit_ocw_6_100l_why`
- Math path coherence:
  - After completing all `18.01SC` atomics, `18.02SC` and `18.06` entry goals unlock.
  - `18.05` remains locked until `18.02SC` is completed.
  - After completing all `18.02SC` atomics, `18.05` entry goal unlocks.
- CS path coherence:
  - `6.0002` and `6.006` stay locked until `6.100L` is completed.
  - After completing all `6.100L` atomics, both entry goals unlock.
- Didactic micro-adjustments: none required after this walkthrough.

## Atomic Source-Link Coverage Snapshot (2026-03-01)
- `18.01SC`: 7/7 atomic goals have `concept+practice+assessment` links (100%).
- `18.02SC`: 6/6 atomic goals have `concept+practice+assessment` links (100%).
- `18.05`: 7/7 atomic goals have `concept+practice+assessment` links (100%).
- `18.06`: 6/6 atomic goals have `concept+practice+assessment` links (100%).
- `6.100L`: 7/7 atomic goals have `concept+practice+assessment` links (100%).
- `6.0002`: 6/6 atomic goals have `concept+practice+assessment` links (100%).
- `6.006`: 6/6 atomic goals have `concept+practice+assessment` links (100%).
- `FOUNDATIONS`: 1/1 atomic goals have `concept+practice+assessment` links (100%, non-module orientation goal).
- Average source links per atomic goal across all implemented MIT OCW modules: `4.0` (45 atomic goals).

## Progress Log
- 2026-03-01: Plan extracted, schema/validator constraints checked, actionable backlog defined in this file.
- 2026-03-01: Created v1 JSON package (root + top-5 OCW modules), added manifest entry, and passed `npm run validate:graph` (`593 landscape(s) passed validation`).
- 2026-03-01: Added structured atomic source linking (`extendedData.sourceLinks`) for top-5 modules and revalidated (`595 landscape(s) passed validation`).
- 2026-03-01: Normalized MIT OCW goal objects to the existing runtime field set (removed non-standard goal-level fields) and kept intensive source-linking exclusively in `extendedData.sourceLinks`.
- 2026-03-01: Extended the same atomic source-linking depth to `6.0002` and `6.006` and introduced CI enforcement rule `GVR-007` for MIT OCW module landscapes.
- 2026-03-01: Aligned the `FOUNDATIONS` atomic orientation goal with the same source-linking schema (`extendedData.sourceLinks`).
- 2026-03-01: Completed Phase 4 frontier walkthrough via automated test (`MitOcwFrontierWalkthroughTest`), confirmed coherent first-path unlock order for math and CS, and recorded that no dependency micro-adjustments are currently needed.
