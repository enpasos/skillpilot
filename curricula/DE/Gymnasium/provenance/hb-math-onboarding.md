# HB Math Onboarding Note

This note records the first Bremen source-landscape identifiers for the mathematics-first DE expansion track and their reserved pre-activation state.

Reserved source landscapes on `2026-03-28`:

- lower-secondary Gymnasium mathematics (`classes 5-10`):
  - `sourceLandscapeId`: `c22f0777-fd82-4ad5-8306-33124017bdee`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-HB/lower-secondary/hb_math_lower_secondary_to_canonical_math.json`
- upper-secondary Gymnasium mathematics (`Gymnasiale Oberstufe`):
  - `sourceLandscapeId`: `ffd76109-d192-467c-b0c0-033b445f0de7`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-HB/upper-secondary/hb_math_upper_secondary_to_canonical_math.json`

Activation state:

- repository-backed lower-secondary and upper-secondary mapping fixtures now exist
- shared provenance registries are intentionally still inactive for both lanes
- no archived Bremen mathematics source bundle or source-json snapshot is active yet

Operational rule from here:

- keep these reserved `sourceLandscapeId` values stable while the first Bremen mathematics source bundle is archived under `curricula/DE/Gymnasium/input/HB/`
- activate the shared provenance registries only after real archived source-landscape JSON snapshots with stable source goal IDs exist
- prefer lower-secondary source import first, then the upper-secondary lane
