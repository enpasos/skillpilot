# MV Math Onboarding Note

This note records the first Mecklenburg-Vorpommern source-landscape identifiers for the mathematics-first DE expansion track and their reserved pre-activation state.

Reserved source landscapes on `2026-03-28`:

- lower-secondary Gymnasium mathematics (`classes 7-10`):
  - `sourceLandscapeId`: `71c43461-d20e-4267-bd18-ad9ba66f0c5b`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/mv_math_lower_secondary_to_canonical_math.json`
- upper-secondary Gymnasium mathematics (`classes 11-12`):
  - `sourceLandscapeId`: `9d420a46-b007-44ce-a4b4-453ef4e38523`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-MV/upper-secondary/mv_math_upper_secondary_to_canonical_math.json`

Activation state:

- repository-backed lower-secondary and upper-secondary mapping fixtures now exist
- shared provenance registries are intentionally still inactive for both lanes
- no archived Mecklenburg-Vorpommern mathematics source bundle or source-json snapshot is active yet

Operational rule from here:

- keep these reserved `sourceLandscapeId` values stable while the first Mecklenburg-Vorpommern mathematics source bundle is archived under `curricula/DE/Gymnasium/input/MV/`
- activate the shared provenance registries only after real archived source-landscape JSON snapshots with stable source goal IDs exist
- prefer lower-secondary source import first, then the upper-secondary lane
