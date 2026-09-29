# Current J8 cylinder mantle and Q4 model relationship profiles

These two `positive-understanding-evidence-v2` records are current machine-QS
**AI candidates**. They do not record a learner's performance or human
approval, and this package does not change the central M7 registry.

| Goal | Current source and scope | Active image check | Independent cases |
| --- | --- | --- | --- |
| `f65ab452` J8 | BW BP2016-3.3.2 maps the cylinder part of the source demand to derive lateral-area formulas for cones and cylinders. Prerequisites include circle circumference and net/body representations; the atom requires the **right circular cylinder mantle** only. | Actual JPG SHA-256 `41d196a3a91362af2af59e72a2fc68122adff9901409c9959fa89a37739d7495` was viewed. It correctly shows the net rectangle with sides `U=2πr` and `h`, then `M=U·h=2πrh`. Its separate radius–tangent panel is mathematically sound but adds no requirement to this profile. | Paper label derived from a given cylinder (`M=84π cm²`); one rectangle rolled in two directions into distinct cylinders with the same mantle area (`360 cm²`). |
| `fde351a8` Q4 | BW BP2016-2.3 supports describing quantity relationships with variables/functions; HE E.1 supports translating real situations into function models. Current wording is limited to **one suitable function equation and named contextual quantities**. The prior variable/assumption choice is a prerequisite, not a new assessment facet here. | Actual PNG SHA-256 `a831dbbe7a5cc3b92da30376bf22cf63c6cbd02f18be8e51cea20510e2febd44` was viewed. Fixed cost €15 plus €2 per juice correctly yields `K(x)=15+2x`, with `x` the count of juices. | Fixed-route time `T(v)=120/v` on a stated speed domain; fixed-perimeter garden area `A(x)=x(20−x)` on a feasible side-length domain. |

The mappings are in the respective BW lower-secondary, BW upper-secondary,
and HE upper-secondary `source_extraction_to_canonical_math.review.json`
files. The BW cylinder source also mentions cones; this candidate does not
claim cone derivation. The HE modeling mapping explicitly narrows `fde351a8`
to a function relationship and does not supply an inequality, optimization,
or every-term interpretation requirement. The new cases reflect that bound.

The four application cases were recalculated with explicit quantities and
units. The cylinder-net transfer changes the representation direction, not
just the numbers: in the second case the wrap-around edge can be 24 cm or
15 cm, producing radii `12/π` cm or `15/(2π)` cm while keeping the area
`24·15=360 cm²`. The Q4 cases change the mathematical relation from the
image's affine cost model to reciprocal and quadratic dependencies. Their
domains rule out zero speed and degenerate rectangles, respectively. These
are boundary statements for each stipulated model, not a demand for a wider
model-validation competence.

Validation on 2026-09-29:

```bash
npm --prefix app run quality:positive-goal-evidence-candidates -- --config curricula/DE/Gymnasium/quality/goal-evidence/2026-09-29/math-m7-j8-q4-two-current-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/2026-09-29/math-m7-j8-q4-two-current-v1/positive-evidence.candidates.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/2026-09-29/math-m7-j8-q4-two-current-v1/positive-evidence.config.json
```

Both checks passed: two current AI candidates, zero blocking issues, two
`needs_human_review`, zero approved. The rollout owner independently opened
both active images and recomputed all four case results before registering
this P package: `84π` cm² for the paper sleeve, `360` cm² for either
rolling direction, `T(60)=2` h, and `A(5)=75` m² with the stated domains.
The current D resolutions remain separate from this P binding.
