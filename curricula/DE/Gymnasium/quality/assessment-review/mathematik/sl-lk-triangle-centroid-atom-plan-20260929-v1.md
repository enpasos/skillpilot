# SL LK triangle-centroid derivation: read-only implementation plan

Status: source-checked proposal. No Canon, source mapping, or composition view
was changed by this note. Human approval is neither present nor implied.

## Binding source and actual gap

The official Saarland LK main-phase PDF
`curricula/DE/Gymnasium/input/SL/LP_Ma_LK_HP_2019.pdf` (SHA-256
`9a4c674eab01edda713a9aef60f38f2d24df3031a7361dabeb6b0f9946f66134`),
printed p. 33, section 5, states the position-vector formula
`OS=(OA+OB+OC)/3` for the triangle centroid alongside the segment-midpoint
formula and explicitly requires derivation of **both**. Current source goal
`de-sl-mathematik-sekii-gos-2014-2019-sl-sekii-q-lk-t05-vektorielle-untersuchung-geometrischer-strukturen-b01-2ff69db2d7`
retains both parts. Its only current mapping edge is partial to the stable
midpoint atom `bea0e5a0-4833-5337-b6f1-7251b8cf8089`. No current Canon
atomic goal derives the triangle-centroid formula. A separate atom is
therefore necessary; reinterpreting `bea0e5a0` would weaken or conflate its
already-reviewed midpoint competence.

## Minimal new content goal

Proposed stable ID:
`f257b71b-0250-5b4b-86bb-f317f79c355a` (UUIDv5 of
`skillpilot:canonical-math:sl-sekii-lk:triangle-centroid-derivation`).

- `shortKey`: `canonical_math_sek2_sl_lk_triangle_centroid_derivation`.
- German title: `Die Schwerpunktformel eines Dreiecks mit Ortsvektoren herleiten (LK)`.
- English title: `Derive the triangle-centroid formula with position vectors (advanced)`.
- German description: `Die lernende Person kann für ein Dreieck mit nicht kollinearen räumlichen Eckpunkten A, B und C aus Seitenmittelpunkten und Seitenhalbierenden die Formel $\\overrightarrow{OS}=(\\overrightarrow{OA}+\\overrightarrow{OB}+\\overrightarrow{OC})/3$ für den Schwerpunkt S herleiten und durch die Lage auf allen drei Seitenhalbierenden prüfen.`
- English description: `For a triangle with non-collinear spatial vertices A, B, and C, the learner can derive the centroid formula $\\overrightarrow{OS}=(\\overrightarrow{OA}+\\overrightarrow{OB}+\\overrightarrow{OC})/3$ from side midpoints and medians, then check that S lies on all three medians.`
- `type: atomic`, `semanticAtomic: true`, `weight: 1`, `core: false`,
  `tags: [LK, canonical]`, `applicability: {jurisdiction:[DE-SL],
  stage:[SekII],courseProfile:[LK]}`,
  `extendedData.applicabilityMappingInheritance: boundary`.
- Canon placement: add under existing Q2 geometry cluster
  `6b3e75b2-fbfd-51c1-9e02-e9b9f7080d44` (`Punkte, Vektoren und
  Bewegungen im Raum`) and add one primary `goalPlacement` on
  `de-gym-math-sek2` with `DE-SL/Gymnasium/SekII/LK` context. Q2 is a
  SkillPilot layout tag, not an asserted SL source semester. Recompute the
  affected unique-descendant weights of `6b3e75b2`, `4720daf4`,
  `98dcf9bd`, and the canonical root after all concurrent Canon additions.
- Direct prerequisites: midpoint atom `bea0e5a0` and Q2 vector linear
  combinations `72dfc164`. Do not create a reverse edge.

A rigorous accessible derivation uses
`M_a=(B+C)/2`, `M_b=(A+C)/2`,
`S=A+λ(M_a−A)=B+μ(M_b−B)`. Writing `u=B−A`, `v=C−A` and comparing their
independent coefficients yields `λ=μ=2/3`, hence
`S=(A+B+C)/3`. Cyclic substitution proves the same S is on the third
median. This derives rather than merely quotes the formula and does not need
integration.

## Source and learner-facing projection

After the atom exists, add a second **partial** mapping from the same
official source goal `...b01-2ff69db2d7` to the new ID, retaining the partial
edge to `bea0e5a0`. Update that source decision's `canonicalGoalIds`,
rationale, and covered-content statement; do not fabricate a new official
source bullet. The SL extraction currently has 744 source goals and 744 M3
decisions, but its MAPPING-3 `m3-all-source-goals-covered` check is false for
this exact remainder. The mapping review `status` still says 743; align its
counts to 744 after checking every decision, and mark MAPPING-3 complete only
after both content portions are genuinely bound.

Insert one direct `goalEntry` for the new atom after `bea0e5a0` in
`de-sl-lk.view.json` and `de-sl-sekii-lk.view.json`, and nowhere in GK or
other-state target views. No current composition view references a
`canonicalSubtree` of the proposed parent `6b3e75b2` or its ancestors;
therefore this parent link should not automatically leak the new atom into
other learner-facing views. Confirm this with compiled current-role checks
for SL GK/LK and representative non-SL scopes after the Canon mutation.

## Dependent quality and terminal assessment

The new curricularAtomic denominator grows by one. It needs two new current
D rounds, an AI-candidate P-v2 profile with independent coordinate/general
transfer, an atomicity decision, an explicit Memory decision and any required
card/visibility checks, and a new mathematically/visually inspected friendly
PNG with current V-QA rounds. No image generation or approval is claimed
here. Canon parent/context fingerprints and dependent A/M/V or D/P records
must be rebound only where the actual changes require it.

For a genuine local terminal route, create a narrow SL-LK Q2
`practiceAssessment` requiring and covering this atom, with a general
derivation and a fresh numerical triangle plus fourth/third-median check.
Proposed task ID:
`990739f7-f17d-5199-bdec-0512eb846f14` (UUIDv5 of
`skillpilot:canonical-math:sl-sekii-lk:triangle-centroid-assessment`).
Putting it under shared `Übungen Q2` folder `14b19ee4` requires explicit
non-target overrides in other composition views that include that folder
(currently 72 references), or a reviewed alternative placement that proves
no scope leakage. Its `requires` and `examData.coveredGoalIds` should name
only the atom actually assessed, with task/solution/rubric and current
assessment review. Do not claim that an existing unrelated Q2 exam assesses
centroid derivation.
