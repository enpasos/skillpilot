# NRW Math Onboarding Note

Status: P5 (`broad_reviewed_coverage`)

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
- the lower-secondary source snapshot now also carries explicit geometry corridors from `2.3`, `2.4.1`, and `2.4.2`, including reviewed source atoms for early geometry / space, quadrilateral properties, coordinate-system drawing, symmetry / transformations, angle work, triangle theorems and constructions, plane-area formulas, similarity, circle calculations, body calculations, Pythagoras, and trigonometrical / cosine-law applications
- the lower-secondary mapping fixture now also reaches the shared Sek-I geometry surface, including reviewed bridges on the early geometry / space corridor, the visible `G2` congruence / construction cut, the visible `G3` transformation / similarity cut, the visible `G4` circle / Thales surface, the visible `G5` Pythagoras cut, the visible `G6` circle / body / solids surface, and the visible `G7` trigonometric bridge
- the lower-secondary source snapshot now also carries explicit data/chance corridors from `2.3`, `2.4.1`, and `2.4.2`, including reviewed source atoms for statistical data collection and representation, early measures of data, one- and two-stage random experiments, Laplace-based probability, simulations, critical reading of statistical representations, conditional probability, stochastic independence, and combinatorial probability preparation
- the lower-secondary mapping fixture now also reaches the shared Sek-I data/chance surface, including reviewed bridges on the visible `D1` early data strip, the visible `D2` Laplace bridge, the visible `D3` multi-stage random-experiment surface, the visible `D4` descriptive-statistics / data-critique surface, and the visible `D5` counting bridge
- the lower-secondary source snapshot now also carries its remaining broad parent bridges on the shared canonical prerequisite, Sek-I function, Sek-I data/chance, and Sek-I geometry surfaces, so both NRW pilot snapshots are now fully bridged on source-goal level

Operational rule from here:

- keep these reserved `sourceLandscapeId` values stable while broadening the NRW source snapshots
- extend the registered goal sets in place only when later NRW mathematics corridors need additional explicit source atoms
- keep NRW stable as a broad comparison lane and widen it further only if another equally explicit retained corridor is imported
