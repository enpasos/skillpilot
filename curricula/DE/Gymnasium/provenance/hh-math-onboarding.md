# HH Math Onboarding Note

This note records the first Hamburg source-landscape identifiers for the mathematics-first DE expansion track and their reserved pre-activation state.

Reserved source landscapes on `2026-03-28`:

- lower-secondary Gymnasium mathematics (`classes 5-10`):
  - `sourceLandscapeId`: `c0ecbd92-92da-4b37-b77d-d537824d5141`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-HH/lower-secondary/hh_math_lower_secondary_to_canonical_math.json`
- upper-secondary Gymnasium mathematics (`Studienstufe`):
  - `sourceLandscapeId`: `42e6e650-ed49-472f-bd01-ba712d096bda`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-HH/upper-secondary/hh_math_upper_secondary_to_canonical_math.json`

Activation state:

- repository-backed lower-secondary and upper-secondary mapping fixtures now exist
- shared provenance registries are intentionally still inactive for both lanes
- no archived Hamburg mathematics source bundle or source-json snapshot is active yet

Operational rule from here:

- keep these reserved `sourceLandscapeId` values stable while the first Hamburg mathematics source bundle is archived under `curricula/DE/Gymnasium/input/HH/`
- activate the shared provenance registries only after real archived source-landscape JSON snapshots with stable source goal IDs exist
- prefer lower-secondary source import first, then the upper-secondary lane
