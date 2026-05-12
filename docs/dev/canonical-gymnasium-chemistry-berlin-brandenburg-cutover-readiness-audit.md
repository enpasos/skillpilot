# Canonical Gymnasium Chemistry Berlin-Brandenburg Cutover Readiness Audit

Date: 2026-05-11

## Decision

`DE-BB` and `DE-BE` Chemistry are cutover-ready on the canonical Gymnasium Chemistry route.

The operational learner route is the shared `Gymnasium (DE)` root with the canonical Chemistry child landscape and the matching `DE-BB` or `DE-BE` GK/LK composition view. The retained Berlin-Brandenburg source-extraction landscapes remain archive-only evidence surfaces.

## Evidence

- Lower-secondary source extractions are registered for both states:
  - `curricula/DE/Gymnasium/input/BB/lower-secondary/source-extraction/DE_BB_CHEMIE_SEKI_RLP_2015.source-extraction.json`
  - `curricula/DE/Gymnasium/input/BE/lower-secondary/source-extraction/DE_BE_CHEMIE_SEKI_RLP_2015.source-extraction.json`
- Upper-secondary source extractions are registered for both states:
  - `curricula/DE/Gymnasium/input/BB/upper-secondary/source-extraction/DE_BB_CHEMIE_SEKII_RLP_GOST_2022.source-extraction.json`
  - `curricula/DE/Gymnasium/input/BE/upper-secondary/source-extraction/DE_BE_CHEMIE_SEKII_RLP_GOST_2022.source-extraction.json`
- Reviewed source-to-canonical mappings are clean and now have runtime mapping files:
  - `curricula/DE/Gymnasium/mapping/DE-BB/lower-secondary/bb_chemistry_lower_secondary_to_canonical_chemistry.json`
  - `curricula/DE/Gymnasium/mapping/DE-BB/upper-secondary/bb_chemistry_upper_secondary_to_canonical_chemistry.json`
  - `curricula/DE/Gymnasium/mapping/DE-BE/lower-secondary/be_chemistry_lower_secondary_to_canonical_chemistry.json`
  - `curricula/DE/Gymnasium/mapping/DE-BE/upper-secondary/be_chemistry_upper_secondary_to_canonical_chemistry.json`
- The canonical learner-facing views exist for both jurisdictions and course profiles:
  - `de-bb-gym-chemistry-gk`
  - `de-bb-gym-chemistry-lk`
  - `de-be-gym-chemistry-gk`
  - `de-be-gym-chemistry-lk`
- Source-extraction landscapes are classified by runtime as compatibility-only archive surfaces through the source-landscape registry fence.

## Runtime Notes

Berlin and Brandenburg do not currently expose an active committed legacy Chemistry learner route comparable to the Hessen or Bayern legacy trees. The required runtime cutover check is therefore the retained-source fence plus runtime mapping discovery:

- retained source landscapes load from the real source registry
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
