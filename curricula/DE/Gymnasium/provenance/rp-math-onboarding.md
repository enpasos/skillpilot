# RP Math Onboarding Note

This note records the first Rheinland-Pfalz source-landscape identifiers for the mathematics-first DE expansion track and their reserved pre-activation state.

Reserved source landscapes on `2026-03-28`:

- lower-secondary Gymnasium mathematics (`classes 5-10`):
  - `sourceLandscapeId`: `810f8134-b4be-4f16-9b14-e50228b30bdd`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-RP/lower-secondary/rp_math_lower_secondary_to_canonical_math.json`
- upper-secondary Gymnasium mathematics (`Mainzer Studienstufe`):
  - `sourceLandscapeId`: `2095b9f8-9d79-40bb-9601-3133ebb6f355`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_math_upper_secondary_to_canonical_math.json`

Activation state:

- repository-backed lower-secondary and upper-secondary mapping fixtures now exist
- shared provenance registries are intentionally still inactive for both lanes
- no archived Rheinland-Pfalz mathematics source bundle or source-json snapshot is active yet

Operational rule from here:

- keep these reserved `sourceLandscapeId` values stable while the first Rheinland-Pfalz mathematics source bundle is archived under `curricula/DE/Gymnasium/input/RP/`
- activate the shared provenance registries only after real archived source-landscape JSON snapshots with stable source goal IDs exist
- prefer lower-secondary source import first, then the upper-secondary lane
