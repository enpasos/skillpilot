# NRW Math Onboarding Note

This note records the first Nordrhein-Westfalen source-landscape identifiers for the mathematics-first DE expansion track and their activation state.

Reserved and activated source landscapes on `2026-03-20`:

- lower-secondary Gymnasium mathematics (`G9`, classes `5-10`):
  - `sourceLandscapeId`: `c862423f-d0ac-4a65-8ad2-9a6e560313a8`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-NW/lower-secondary/nrw_math_lower_secondary_to_canonical_math.json`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/NW/lower-secondary/source-json/DE_NRW_S_GYM_1_MATHEMATIK.de.json.snapshot`
- upper-secondary Gymnasium mathematics:
  - `sourceLandscapeId`: `d3a068ca-90c6-4d7f-ab6b-4d8b43085cb1`
  - mapping fixture:
    `curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary/nrw_math_upper_secondary_to_canonical_math.json`
  - active source snapshot:
    `curricula/DE/Gymnasium/input/NW/upper-secondary/source-json/DE_NRW_S_GYM_2_MATHEMATIK.de.json.snapshot`

Activation result:

- both `sourceLandscapeId` values are now active in `source-landscape-registry.json`
- both source snapshots now also contribute real `goalIds` to `source-goal-membership-registry.json`
- both source snapshots now also contribute atomic closures to `source-goal-closure-registry.json`
- the upper-secondary source snapshot now also carries its first in-place source split in the E-phase derivative corridor, and the shared provenance registries were widened accordingly without changing the reserved NRW upper-secondary `sourceLandscapeId`
- the upper-secondary source snapshot now also carries the explicit E-phase tangent/normal-steigung clause from `2.3`, again widened in place under the same retained upper-secondary `sourceLandscapeId`
- the upper-secondary source snapshot now also carries the first explicit E-phase differential-calculus follow-on atoms for derivative rules, extrema criteria, and second-derivative curvature / Wendepunkt work
- the upper-secondary source snapshot now also carries its first explicit Q-phase Grundkurs extremal-problem atom, and the shared provenance registries were widened in place for that same retained source landscape
- the upper-secondary source snapshot now also carries a retained Q-phase integral split, and the shared provenance registries now resolve that corridor through a dedicated productsum-and-area child without changing the reserved upper-secondary `sourceLandscapeId`
- the upper-secondary source snapshot now also carries a dedicated Q-phase Hauptsatz/Stammfunktions atom, again widened in place under the same retained upper-secondary `sourceLandscapeId`
- the upper-secondary source snapshot now also carries a dedicated Q-phase definite-integral area atom, again widened in place under the same retained upper-secondary `sourceLandscapeId`
- the upper-secondary source snapshot now also carries a dedicated Q-phase interval-additivity/linearity atom, again widened in place under the same retained upper-secondary `sourceLandscapeId`
- the upper-secondary source snapshot now also carries the remaining introductory integral pair as dedicated retained atoms, again widened in place under the same retained upper-secondary `sourceLandscapeId`
- the upper-secondary source snapshot now also carries a retained three-way split of the broad exponential clause under the same source goal cluster, and the shared provenance registries now resolve that corridor through separate `a^x`-properties, natural-exponential, and growth/decay children without changing the reserved upper-secondary `sourceLandscapeId`
- the upper-secondary source snapshot now also carries the first explicit NRW LK inverse-function / logarithm clause, again widened in place under the same retained upper-secondary `sourceLandscapeId`
- the upper-secondary source snapshot now also carries the explicit NRW LK inverse-graph clause, again widened in place under the same retained upper-secondary `sourceLandscapeId`
- the upper-secondary source snapshot now also carries a retained two-way split of the broad E-phase power/polynomial clause, again widened in place under the same retained upper-secondary `sourceLandscapeId`
- the lower-secondary source snapshot now carries the first NRW prerequisite strip for canonical function onboarding:
  - Erprobungsstufe quantity relations and rule-of-three basics
  - first-stage rational-number, term, and linear-equation prerequisites
  - first-stage mapping characterization atoms ahead of the imported linear-function atoms
- the lower-secondary mapping fixture now also carries the first reviewed exact NRW bridge set on the shared canonical math spine:
  - motivation
  - three arithmetic anchors
  - rational-number ordering
  - mapping analysis
  - function concept and representations

Operational rule from here:

- keep these reserved `sourceLandscapeId` values stable while broadening the NRW source snapshots
- extend the registered goal sets in place only when later NRW mathematics corridors need additional explicit source atoms
- keep the next reviewed NRW upper-secondary mapping pass on the new retained E-phase power-function child unless we intentionally decide that this clause should stay source-structural only
