# SN Math Onboarding Note

This note records the first Sachsen source-landscape identifiers for the mathematics-first DE expansion track and their reserved pre-activation state.

Reserved source landscapes on `2026-03-28`:

- lower-secondary Gymnasium mathematics (`classes 5-10`):
  - `sourceLandscapeId`: `a615db78-931e-44ac-b0b5-44e16286470f`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-SN/lower-secondary/sn_math_lower_secondary_to_canonical_math.json`
- upper-secondary Gymnasium mathematics (`classes 11-12`):
  - `sourceLandscapeId`: `59e52106-1d03-46ae-8fc6-6fdd6ab181d0`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-SN/upper-secondary/sn_math_upper_secondary_to_canonical_math.json`

Activation state:

- repository-backed lower-secondary and upper-secondary mapping fixtures now exist
- shared provenance registries are intentionally still inactive for both lanes
- no archived Sachsen mathematics source bundle or source-json snapshot is active yet

Operational rule from here:

- keep these reserved `sourceLandscapeId` values stable while the first Sachsen mathematics source bundle is archived under `curricula/DE/Gymnasium/input/SN/`
- activate the shared provenance registries only after real archived source-landscape JSON snapshots with stable source goal IDs exist
- prefer lower-secondary source import first, then the upper-secondary lane
