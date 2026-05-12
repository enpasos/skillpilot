# Bremen Chemistry Cutover Readiness Audit

Date: 2026-05-11

Scope: `DE-HB` Chemistry on the canonical Gymnasium landscape.

## Decision

`DE-HB` Chemistry is cutover-ready on the canonical route.

Bremen does not have an active committed legacy Chemistry learner route comparable to the Hessen or Bavaria runtime trees. The operational route is therefore:

- select `Gymnasium (DE)`;
- use the `DE-HB` state filter;
- select canonical Chemistry through the Bremen GK or LK composition view;
- keep Bremen source extractions as retained archive and evidence surfaces only.

## Evidence

- Source inventories are persisted for both stages:
  - `curricula/DE/Gymnasium/input/HB/lower-secondary/source-extraction/DE_HB_CHEMIE_SEKI_BILDUNGSPLAN_2006_2022.source-extraction.json`
  - `curricula/DE/Gymnasium/input/HB/upper-secondary/source-extraction/DE_HB_CHEMIE_SEKII_GYO_2022.source-extraction.json`
- Source-landscape registry entries load both retained source landscapes and resolve `DE-HB` jurisdiction.
- Runtime mapping files exist for backend `GoalMappingService` discovery:
  - `curricula/DE/Gymnasium/mapping/DE-HB/lower-secondary/hb_chemistry_lower_secondary_to_canonical_chemistry.json`
  - `curricula/DE/Gymnasium/mapping/DE-HB/upper-secondary/hb_chemistry_upper_secondary_to_canonical_chemistry.json`
- Learner-facing Bremen Chemistry composition views exist and validate:
  - `curricula/DE/Gymnasium/composition-views/chemie/de-hb-gk.view.json`
  - `curricula/DE/Gymnasium/composition-views/chemie/de-hb-lk.view.json`
- Retained source-extraction landscapes are now classified as compatibility-only archive surfaces, so fresh UI curriculum selection cannot route a learner into them.

## Backend Fence

The Bremen retained source landscapes remain readable for provenance, mapping, and audit use. They are not writable learner paths:

- `LandscapeService.isCompatibilityOnlyLandscape(...)` now treats source-landscape registry IDs as compatibility-only.
- UI curriculum selection of Bremen Chemistry source-extraction IDs returns `409 Conflict`.
- If a retained Bremen source-extraction ID is already present on a learner, active-goal and planned-goal writes are rejected as retired compatibility-session writes.

## Verification

Targeted backend verification:

```text
./gradlew test --tests com.skillpilot.backend.landscape.LandscapeServiceTest --tests com.skillpilot.backend.controller.LearnerControllerIntegrationTest.retainedBremenChemistrySourceExtractionsCannotBeSelectedViaUiEndpoint --tests com.skillpilot.backend.controller.LearnerControllerIntegrationTest.retainedBremenChemistrySourceExtractionSessionRejectsLearningWrites
```

Result: passed locally.
