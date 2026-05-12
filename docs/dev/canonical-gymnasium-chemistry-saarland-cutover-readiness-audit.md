# Canonical Gymnasium Chemistry Saarland Cutover Readiness Audit

Date: 2026-05-12

## Decision

`DE-SL` Chemistry is cutover-ready on the canonical Gymnasium Chemistry route.

The operational learner route is the shared `Gymnasium (DE)` root with the canonical Chemistry child landscape and the matching `DE-SL` GK/LK composition view. The retained Saarland source-extraction landscapes remain archive-only evidence surfaces.

## Evidence

- Lower-secondary and upper-secondary source extractions are registered:
  - `curricula/DE/Gymnasium/input/SL/lower-secondary/source-extraction/DE_SL_CHEMIE_SEKI_GYM9_2024_2025.source-extraction.json`
  - `curricula/DE/Gymnasium/input/SL/upper-secondary/source-extraction/DE_SL_CHEMIE_SEKII_GOS_2023_2025.source-extraction.json`
- Reviewed source-to-canonical mappings are clean and now have runtime mapping files:
  - `curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/sl_chemistry_lower_secondary_to_canonical_chemistry.json`
  - `curricula/DE/Gymnasium/mapping/DE-SL/upper-secondary/sl_chemistry_upper_secondary_to_canonical_chemistry.json`
- The canonical learner-facing views exist for both course profiles:
  - `de-sl-gym-chemistry-gk`
  - `de-sl-gym-chemistry-lk`
- Source-extraction landscapes are classified by runtime as compatibility-only archive surfaces through the source-landscape registry fence.

## Runtime Notes

Saarland does not currently expose an active committed legacy Chemistry learner route comparable to the Hessen or Bayern legacy trees. The required runtime cutover check is therefore the retained-source fence plus runtime mapping discovery:

- retained source landscapes load from the real source registry
- retained source landscapes resolve to `DE-SL`
- retained source landscapes are compatibility-only
- `GoalMappingService` discovers the runtime mappings for both lower-secondary and upper-secondary source landscape IDs

## Verification

Targeted backend coverage:

```bash
./gradlew test \
  --tests com.skillpilot.backend.landscape.LandscapeServiceTest \
  --tests com.skillpilot.backend.landscape.GoalMappingRepositoryFixtureTest
```

Additional rollout checks:

```bash
python3 scripts/render_canonical_chemistry_bundesland_status.py
python3 scripts/validate_schemas.py
(cd app && npm run validate:graph)
(cd app && npm run validate:composition-views)
git diff --check
```
