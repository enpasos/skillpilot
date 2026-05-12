# Canonical Gymnasium Chemistry All-State Cutover Completion Audit

Date: 2026-05-12

## Decision

The canonical Gymnasium Chemistry rollout is complete for all tracked German Bundesland lanes.

All 16 tracked states are source-backed, projection-clean, and operationally cutover-ready (`P6`) on the shared canonical Gymnasium Chemistry route. The active learner route is the shared `Gymnasium (DE)` root with the canonical Chemistry child landscape and the matching state/course composition view.

## Completion State

- Tracked states: `16`
- States with readable registered Chemistry source inventories: `16/16`
- States with clean source-backed Chemistry projections: `16/16`
- States with broad Chemistry coverage: `16/16`
- States operationally cutover-ready: `16/16`
- P5 broadening/cutover corridor: completed with no remaining focus states
- P6 maintenance corridor: active for all tracked states

## Evidence

- Status snapshot:
  - `docs/dev/canonical-gymnasium-chemistry-bundeslaender-status.md`
- Rollout tracker:
  - `curricula/DE/Gymnasium/provenance/chemistry-bundesland-rollout-tracker.json`
- Canonical Chemistry landscape:
  - `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json`
- Runtime source-to-canonical mapping files:
  - `curricula/DE/Gymnasium/mapping/DE-*/**/*chemistry*_to_canonical_chemistry.json`
- Retained source-extraction registry:
  - `curricula/DE/Gymnasium/provenance/source-landscape-registry.json`
- Learner-facing composition views:
  - `curricula/DE/Gymnasium/composition-views/chemie/*.view.json`

## Runtime Notes

Retained state source-extraction landscapes are archive-only compatibility surfaces. Runtime readiness is guarded by:

- source-extraction landscapes loading from the real source registry
- source-extraction landscapes resolving to the expected ISO jurisdiction
- retained source-extraction landscapes being classified as compatibility-only
- `GoalMappingService` discovering runtime mappings for retained source landscape IDs
- state/course composition views validating against the canonical Chemistry landscape

## Maintenance Rule

Keep all states on P6 maintenance. When an official source revision changes a visible scope, refresh the source extraction, reviewed mapping, runtime mapping, source-only archive fence, and relevant composition views together.

## Verification

Current focused verification path:

```bash
./gradlew test \
  --tests com.skillpilot.backend.landscape.LandscapeServiceTest \
  --tests com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest
python3 scripts/render_canonical_chemistry_bundesland_status.py
python3 scripts/validate_schemas.py
(cd app && npm run validate:graph)
(cd app && npm run validate:composition-views)
git diff --check
```

Final local release check:

```bash
./run_ci.sh
```
