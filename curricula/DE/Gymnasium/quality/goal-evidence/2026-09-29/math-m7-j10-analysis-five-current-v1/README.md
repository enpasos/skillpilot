# Current J10 Analysis: five positive-understanding profiles (AI candidates)

This package binds five current `curricularAtomic` Mathematics goals to their
current canonical DE/EN wording, prerequisite context, and active image bytes.
It is a machine-QS candidate package, **not** human approval or learner evidence.
The central M7 registry includes this P package after a separate content audit.

| Goal | Current source projection | Active image SHA-256 | Fresh mathematical transfer |
| --- | --- | --- | --- |
| `5518ceb3` graph relation | BW BP2016-3.3.4: function graph → derivative graph **and conversely**; mapped as a partial source split | `e88426d1ac5bba09ec3ac51fb87380342fb29577f2da3f9b3d03e14871390fc2` | cubic graph → derivative parabola; derivative line → two vertically shifted possible functions, checked by differentiation without integration |
| `2850e8f6` monotonicity/extrema | BW BP2016-3.3.4: monotonicity definition, local/global distinction, and first-derivative investigation; each mapped source split is partial | `e88426d1ac5bba09ec3ac51fb87380342fb29577f2da3f9b3d03e14871390fc2` | quadratic with a boundary global maximum; cubic with interior/endpoint global ties |
| `b43a1e45` tangent/normal | BW BP2016-3.3.4: tangent and normal equation at a curve point | `a6abbdba508d1e636f018341b12f07a1bd0a03c54b13f8f0fe99abee4296ca29` | nonzero slope at a negative-coordinate cubic point; horizontal tangent with vertical normal |
| `06bdbecb` local approximation | BW BP2016-3.3.4: tangent as linear approximation | `19fb53ac7a0093332e1eff84d890580282b4bd542c7cb3b52b7fde4320b11740` | stock-time model with **zero slope at** `t=0`; cubic with nonzero slope and an explicit far-point error |
| `ad66009f` curvature/inflection | BW BP2016-3.3.4: function properties using higher derivatives, including curvature and inflection; partial source split | `a5311119a56918eb99be0178078bf8c4dc293f255bea340cc9a0fe7252c5a656` | cubic with reversed sign change; quartic with two inflections versus `x⁴`, where `f″(0)=0` without an inflection |

The source projection above is taken from
`curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_math_lower_secondary_source_extraction_to_canonical_math.review.json`
and its referenced BP2016 source extraction. It identifies **BW** source support;
it is not a claim that one state's source independently establishes all other
canonical jurisdiction mappings. The current canonical goals are J10/AB2;
`5518ceb3` and `2850e8f6` have a source-mapping inheritance boundary, so this
review uses their direct mapped splits rather than borrowing ancestor evidence.
The prerequisite chain includes the derivative concept and basic rules as
applicable, with `b43a1e45` required before `06bdbecb`; the profiles do not
reassess those prerequisite goals. No integral technique is required.

I inspected the five actual active images in original resolution. The shared
`2850e8f6`/`5518ceb3` PNG correctly pairs `f(x)=−x²+4` with `f′(x)=−2x`;
the reverse graph direction is addressed by a new case rather than inferred
from that picture. The tangent/normal JPG correctly gives slopes `2` and
`−1/2` at `(1,1)`. The local-approximation JPG correctly gives the tangent
`L(x)=4x−4` at `x=2`, with `L(2.1)=4.4` and `f(3)=9` versus `L(3)=8`.
The curvature JPG correctly pairs `x³` with `f″(x)=6x` and its sign change.
These findings do not imply a human visual release decision.

The ten case briefs were independently recalculated. In particular,
`B(t)=10+t²` has `B′(0)=0`, so its tangent at the initial point is the
horizontal line `L₀(t)=10`; a drawn nonhorizontal initial tangent would be
wrong. For extrema, `x³−3x` on `[−2,2]` has global maxima `2` at both
`x=−1` and `x=2`, and global minima `−2` at both `x=−2` and `x=1`.
For normals, the reciprocal-slope formula is used only when the tangent
slope is nonzero; the zero-slope case gives a vertical line. For inflections,
`x⁴` shows that `f″=0` alone is insufficient.

Validation:

```bash
npm --prefix app run quality:positive-goal-evidence-candidates -- --config curricula/DE/Gymnasium/quality/goal-evidence/2026-09-29/math-m7-j10-analysis-five-current-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/2026-09-29/math-m7-j10-analysis-five-current-v1/positive-evidence.candidates.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/2026-09-29/math-m7-j10-analysis-five-current-v1/positive-evidence.config.json
```

Both checks passed on 2026-09-29: five current AI candidates, zero blocking
issues, five `needs_human_review`, zero approved. The rollout owner independently
recomputed all ten case results before registering P: the cubic derivatives,
the extrema and endpoint ties, the tangent and perpendicular normal equations,
the zero-slope stock tangent and both approximation errors, and the two
curvature sign changes all agree with the candidate answers. D integration
remains separate; registering P does not make these goals strictly M7-complete.
