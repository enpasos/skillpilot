# NI Math Onboarding Note

This note records the first Niedersachsen source-landscape identifiers for the mathematics-first DE expansion track and their activation state.

Reserved source landscapes on `2026-03-20`:

- lower-secondary Gymnasium mathematics (`classes 5-10`):
  - `sourceLandscapeId`: `2b995085-dc5e-47c6-a563-9dcfc01fb74d`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_math_lower_secondary_to_canonical_math.json`
- upper-secondary Gymnasium mathematics:
  - `sourceLandscapeId`: `fcb04661-6ea2-4030-a9b2-97e6cc03daf8`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_math_upper_secondary_to_canonical_math.json`

Activation state:

- the lower-secondary `sourceLandscapeId` is now active in `source-landscape-registry.json`
- the lower-secondary lane now contributes its first archived source goal memberships to `source-goal-membership-registry.json`
- the lower-secondary lane now contributes its first archived atomic closures to `source-goal-closure-registry.json`
- the upper-secondary `sourceLandscapeId` is now also active in the shared provenance registries
- the first active Niedersachsen source snapshot now lives at:
  - `curricula/DE/Gymnasium/input/NI/lower-secondary/source-json/DE_NDS_S_GYM_1_MATHEMATIK.de.json.snapshot`
- the first active Niedersachsen upper-secondary source snapshot now lives at:
  - `curricula/DE/Gymnasium/input/NI/upper-secondary/source-json/DE_NDS_S_GYM_2_MATHEMATIK.de.json.snapshot`
- the imported lower-secondary pilot subset currently covers:
  - the curriculum-wide `Funktionaler Zusammenhang` motivation layer
  - `Proportionale und antiproportionale Zusammenhaenge`
  - `Lineare Zusammenhaenge`
- the imported upper-secondary pilot subset currently covers:
  - the phase-wide orientation layer for the Einfuehrungsphase
  - `Elementare Funktionenlehre`
  - `Ableitungen`
  - a retained split of the downstream AB3 usage clauses into tangent / normal equations, monotonicity / extrema, Wendestellen, and optimization use

Operational rule from here:

- keep these reserved `sourceLandscapeId` values stable while the first Niedersachsen mathematics source snapshots are prepared
- keep activating the shared provenance registries only after real archived source-landscape JSON snapshots with stable source goal IDs exist
- prefer the same first reviewed corridor order used for NRW:
  - lower-secondary shared function anchors first
  - then the first upper-secondary change-rate / analysis anchor corridor
  - and only then retained-split downstream AB3 follow-ons, including second-stage source splits when the first retained child is still too broad
