# ST Math Onboarding Note

This note records the first Sachsen-Anhalt source-landscape identifiers for the mathematics-first DE expansion track and their reserved pre-activation state.

Reserved source landscapes on `2026-03-28`:

- lower-secondary Gymnasium mathematics (`classes 5-10`):
  - `sourceLandscapeId`: `251bcdfc-19eb-4543-8ff7-5fb9fef6b667`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_math_lower_secondary_to_canonical_math.json`
- upper-secondary Gymnasium mathematics (`classes 11-12`):
  - `sourceLandscapeId`: `000359cf-2dfb-4216-bc71-743f76917a35`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-ST/upper-secondary/st_math_upper_secondary_to_canonical_math.json`

Activation state:

- repository-backed lower-secondary and upper-secondary mapping fixtures now exist
- shared provenance registries are intentionally still inactive for both lanes
- no archived Sachsen-Anhalt mathematics source bundle or source-json snapshot is active yet

Operational rule from here:

- keep these reserved `sourceLandscapeId` values stable while the first Sachsen-Anhalt mathematics source bundle is archived under `curricula/DE/Gymnasium/input/ST/`
- activate the shared provenance registries only after real archived source-landscape JSON snapshots with stable source goal IDs exist
- prefer lower-secondary source import first, then the upper-secondary lane
