# BW Math Onboarding Note

This note records the first Baden-Wuerttemberg source-landscape identifiers for the mathematics-first DE expansion track and their activation state.

Reserved source landscapes on `2026-03-21`:

- lower-secondary Gymnasium mathematics (`classes 5-10`):
  - `sourceLandscapeId`: `6232b783-199c-4c50-92f2-9fb31277e619`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_math_lower_secondary_to_canonical_math.json`
- upper-secondary Gymnasium mathematics (`Kursstufe`):
  - `sourceLandscapeId`: `fa8f864a-aac5-486d-8e77-40df2af038a3`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_math_upper_secondary_to_canonical_math.json`

Activation state:

- the official Baden-Wuerttemberg Gymnasium mathematics source PDF is now archived locally at:
  - `curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_M.pdf`
- the lower-secondary and upper-secondary provenance notes now point at that shared archived PDF
- the lower-secondary `sourceLandscapeId` is now active in `source-landscape-registry.json`
- the lower-secondary lane now contributes its first archived source goal memberships to `source-goal-membership-registry.json`
- the lower-secondary lane now contributes its first archived atomic closures to `source-goal-closure-registry.json`
- the first active Baden-Wuerttemberg lower-secondary source snapshot now lives at:
  - `curricula/DE/Gymnasium/input/BW/lower-secondary/source-json/DE_BAW_S_GYM_1_MATHEMATIK.de.json.snapshot`
- the imported lower-secondary pilot subset currently covers:
  - the curriculum-wide orientation layer from `1.1 Bildungswert des Faches Mathematik`
  - `3.1.4 Leitidee Funktionaler Zusammenhang` in `Klassen 5/6`
  - `3.2.4 Leitidee Funktionaler Zusammenhang` in `Klassen 7/8`
- the upper-secondary `sourceLandscapeId` is now active in `source-landscape-registry.json`
- the upper-secondary lane now contributes its first archived source goal memberships to `source-goal-membership-registry.json`
- the upper-secondary lane now contributes its first archived atomic closures to `source-goal-closure-registry.json`
- the first active Baden-Wuerttemberg upper-secondary source snapshot now lives at:
  - `curricula/DE/Gymnasium/input/BW/upper-secondary/source-json/DE_BAW_S_GYM_2_MATHEMATIK.de.json.snapshot`
- the imported upper-secondary pilot subset currently covers:
  - the shared orientation layer from `1.4 Basisfach und Leistungsfach in der Oberstufe`
  - `3.5.4 Leitidee Funktionaler Zusammenhang` in `Basisfach`
  - `3.4.4 Leitidee Funktionaler Zusammenhang` in `Leistungsfach`

Operational rule from here:

- keep these reserved `sourceLandscapeId` values stable while the first Baden-Wuerttemberg mathematics source snapshots are prepared
- activate the shared provenance registries only after real archived source-landscape JSON snapshots with stable source goal IDs exist
- prefer the same first reviewed corridor order used for NRW and Niedersachsen:
  - start with lower-secondary shared function anchors
  - then review the first upper-secondary change-rate / analysis anchor corridor
  - and only then retained-split downstream follow-ons if a broad source clause needs tightening
