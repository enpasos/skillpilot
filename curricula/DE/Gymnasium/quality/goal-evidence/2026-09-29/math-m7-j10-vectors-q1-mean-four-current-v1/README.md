# Current J10 spatial vectors and Q1 function mean: P-v2 candidates

Four current `curricularAtomic` Mathematics goals have new bilingual,
mathematically checked `positive-understanding-evidence-v2` candidate profiles.
The records remain `needs_human_review` with `ai_candidate` authority; they
are neither human approvals nor evidence that a learner has mastered a goal.
No central registry is changed by this package.

| Goal | Exact current source projection | Active bitmap SHA-256 and visual check | Independent transfer |
| --- | --- | --- | --- |
| `235ae698` line/segment parameters | BW BP2016-3.3.3: describe lines and segments using vector parameter equations | `746f81f2827dfc60c390f95f6f5afc510ab5e5dd75bb946a774b16a64e441221`; A=(1,2,0), B=(4,3,2), B−A=(3,1,2), and `t∈ℝ` versus `[0,1]` are correct | endpoint support with `[0,1]`; midpoint support with `[−1,1]` |
| `b025df0c` line relations | BW BP2016-3.3.3: investigate line positions and determine intersections if present | `8b5e19b7d7a9165a99cc1c9abf23c4155b03e50a298589a9e908581cea4dfa39`; the pictured equations give `s=t=1/2` and `S=(1/2,1/2,0)` correctly | genuine 3D intersection versus skew lines; parallel distinct versus coincident lines |
| `ba343971` uniform vector motion | BW BP2016-3.3.3: describe rectilinear motions using vectors | `750612feea23203ef45aa7af2bc12bfca8c0b6a59aa99b186ca8c4cbe7ff839a`; `p₀=(2,1,0)`, `v=(3,0,1)` per second and `p(2)=(8,1,2)` agree | 2D boat with supplied velocity; 3D crane hook with velocity inferred from timed positions |
| `c1c80b80` integral function mean | HE KC2024 Q1.2: mean stock and mean rate, plus BW BP2016-3.4.2: calculate a function mean; direct goal mapping and current source-inheritance boundary | `ed8d74154977fe4a943bf4e77c759003c34e38f4ab61f2d19cbba98d7b1e024e`; corrected `B(t)=10+t²` graph starts horizontally at `t=0`, values 11/14/19 L, integral 39 L·min and mean 13 L are correct | linear stock mean; quadratic inflow-rate mean; signed net-rate mean zero despite nonzero rates |

The BW source decisions are in
`curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_math_lower_secondary_source_extraction_to_canonical_math.review.json`
for the three vector goals and in the BW upper-secondary mapping for
`c1c80b80`. The HE Q1.2 decision is in its upper-secondary mapping. The
three J10 goals are spatial where stated; `ba343971` explicitly includes
both plane and space. The Q1 goal uses a definite integral and explicitly
requires different contextual interpretations for stock and rate. These
profiles keep those boundaries instead of importing extra demands from a
containing cluster or a broader source bullet.

The nine case briefs were independently checked. Key calculations are:

- A line and its finite segment can use the same support/direction pair but
  different domains; for midpoint support `M=(1,0,2)` and direction
  `(2,−1,3)`, the endpoints occur at `t=−1` and `t=1`.
- For the fresh intersecting 3D pair, separate parameters `s=2`, `t=1`
  give `(3,4,0)` on both lines. For its skew comparison, the xy equations
  suggest `s=1`, `u=2`, but z is 1 versus 0, so there is no spatial cut.
- The crane hook changes position by `(8,8,−4)` m in 4 s, hence velocity
  `(2,2,−1)` m/s; its modeled position after 3 s is `(8,5,2)` m.
- A stock integral of `40 L·min` over 4 min means a **10 L stock mean**;
  an inflow integral of `15 L` over 3 min means a **5 L/min mean rate**.
  A signed rate can have zero mean through cancellation without being zero
  at every instant.

Validation on 2026-09-29:

```bash
npm --prefix app run quality:positive-goal-evidence-candidates -- --config curricula/DE/Gymnasium/quality/goal-evidence/2026-09-29/math-m7-j10-vectors-q1-mean-four-current-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/2026-09-29/math-m7-j10-vectors-q1-mean-four-current-v1/positive-evidence.candidates.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/2026-09-29/math-m7-j10-vectors-q1-mean-four-current-v1/positive-evidence.config.json
```

Both checks passed: four current AI candidates, zero blocking issues, four
`needs_human_review`, zero approved. The rollout owner independently checked
all nine case calculations before registering P, including both line
classifications, the changed segment parameter interval, the two-dimensional
and three-dimensional motion coordinates, and stock versus rate integral
units. The owner also reopened the active `c1c80b80` PNG at original size:
its graph starts horizontally at `t=0`, shows `B(1)=11`, `B(2)=14`,
`B(3)=19`, and correctly equates the `39 L·min` integral to a constant
`13 L` stock over three minutes. D integration remains separate.

Registry note: This four-goal candidate package is unregistered because `235ae698` already has a current valid P profile in the vector-eight package. The non-overlapping three-goal subset is materialized in `../math-m7-j10-vectors-q1-mean-three-current-v2/`; source cases remain here for audit.
