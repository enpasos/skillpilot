# SL Math Onboarding Note

This note records the first Saarland source-landscape identifiers for the mathematics-first DE expansion track and their reserved pre-activation state.

Reserved source landscapes on `2026-03-28`:

- lower-secondary Gymnasium mathematics (`classes 5-10`):
  - `sourceLandscapeId`: `9250478f-ebb4-438d-b6d9-738e1a6d574a`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/sl_math_lower_secondary_to_canonical_math.json`
- upper-secondary Gymnasium mathematics (`Gymnasiale Oberstufe`):
  - `sourceLandscapeId`: `7d66c285-38b4-4031-9836-2bba5de68e24`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-SL/upper-secondary/sl_math_upper_secondary_to_canonical_math.json`

Activation state:

- repository-backed lower-secondary and upper-secondary mapping fixtures now exist
- shared provenance registries are intentionally still inactive for both lanes
- no archived Saarland mathematics source bundle or source-json snapshot is active yet

Operational rule from here:

- keep these reserved `sourceLandscapeId` values stable while the first Saarland mathematics source bundle is archived under `curricula/DE/Gymnasium/input/SL/`
- activate the shared provenance registries only after real archived source-landscape JSON snapshots with stable source goal IDs exist
- prefer lower-secondary source import first, then the upper-secondary lane
