# TH Math Onboarding Note

This note records the first Thueringen source-landscape identifiers for the mathematics-first DE expansion track and their reserved pre-activation state.

Reserved source landscapes on `2026-03-28`:

- lower-secondary Gymnasium mathematics (`classes 5-10`):
  - `sourceLandscapeId`: `25444927-45d3-486c-8e7f-39853e7de610`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-TH/lower-secondary/th_math_lower_secondary_to_canonical_math.json`
- upper-secondary Gymnasium mathematics (`classes 11-12`):
  - `sourceLandscapeId`: `cced401d-58d5-4832-b010-3b3466d0655b`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-TH/upper-secondary/th_math_upper_secondary_to_canonical_math.json`

Activation state:

- repository-backed lower-secondary and upper-secondary mapping fixtures now exist
- shared provenance registries are intentionally still inactive for both lanes
- no archived Thueringen mathematics source bundle or source-json snapshot is active yet

Operational rule from here:

- keep these reserved `sourceLandscapeId` values stable while the first Thueringen mathematics source bundle is archived under `curricula/DE/Gymnasium/input/TH/`
- activate the shared provenance registries only after real archived source-landscape JSON snapshots with stable source goal IDs exist
- prefer lower-secondary source import first, then the upper-secondary lane
