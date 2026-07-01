# Goal Visualization Review - Mathematik Batch 114

Review date: 2026-07-01

Scope: canonical `DE Gymnasium Mathematik`, continued Nano Banana Pro rollout.

Status: `completed`

Context:

- This batch was planned for six goals covering sphere volume, integral derivation of a cone volume formula, line-plane position reasoning, determinant-based volume transformation, and parametric representations of lines and segments in 3D.
- All Nano Banana Pro provider calls completed successfully.
- Per-goal prompt appends constrained each visualization to fixed numbers, vectors, formulas, parameter values, and interpretation notes.
- Two goals required targeted regeneration after fachlicher review: the first cone-derivation candidate had a risky sign step in the integral evaluation, and the first parametric-line candidate rendered the 3D coordinate tuple in a way that could be read as a decimal/2D vector.

Generator/prompt policy:

- Provider prompts do not contain the string `SkillPilot`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.
- No SVG fallback is used for accepted assets.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `2f2c9f1a-07f0-59e4-b84a-60648c3b0bda` | Volumen von Kugeln berechnen (Formelsammlung) | `accepted_pilot` | The image correctly uses `r=3 cm` and the formula `V=4/3*pi*r^3`. It computes `(3 cm)^3=27 cm^3`, `V=36pi cm^3`, and `V ~= 113.1 cm^3`. The radius is drawn from the center to the sphere surface and is not confused with the diameter. |
| `e9181209-1506-59df-9053-17f36b91bb06` | Volumenformeln räumlicher Körper herleiten (LK, ohne Formelsammlung) (LK) | `accepted_pilot` | Accepted after one targeted regeneration. The final image derives the cone formula by disk integration with `y` measured from the tip to the base: `r(y)=R*y/h`, `A(y)=pi*R^2*y^2/h^2`, and `V=Integral_0^h A(y) dy=pi*R^2/h^2*[y^3/3]_0^h=1/3*pi*R^2*h`. The numerical check `R=3 cm`, `h=12 cm` gives `36pi cm^3`. |
| `6b2a1c04-8c28-51ff-905b-9c9492a26cc3` | Spezielle Lagen von Geraden und Ebenen begründen (LK) | `accepted_pilot` | The image correctly analyzes `E: z=0` and `g: X=(0,0,1)+t*(1,1,0)`. It uses `n=(0,0,1)` and `v=(1,1,0)`, computes `v*n=0`, checks the support point `P=(0,0,1)` with `z=1`, and concludes that `g` is properly parallel to `E`, not contained in the plane, and has no intersection point. |
| `7d37513b-fa1a-54cc-9e2a-9279a381f0f0` | Transformationsargumente für Flächen und Volumina nutzen (LK) | `accepted_pilot` | The image correctly maps the unit cube to a parallelepiped with `a=(2,0,0)`, `b=(0,3,0)`, `c=(0,0,4)` using `A=diag(2,3,4)`. It computes `det(A)=2*3*4=24` and uses `V_Bild=|det(A)|*V_Einheitswuerfel=24*1=24`, while explicitly rejecting the additive error `2+3+4=9`. |
| `effe43eb-cabe-56cb-a228-35887d7915c1` | Geraden im Raum parametrisch darstellen | `accepted_pilot` | Accepted after one targeted regeneration. The final image uses `A=(1;2;0)` and `B=(4;0;3)`, derives `v=B-A=(3;-2;3)`, and states the line as `g: X=(1;2;0)+t*(3;-2;3), t in R`. It marks `t=0` as `A` and `t=1` as `B`, and the line is shown extended beyond the segment. |
| `525b1da9-7fdd-4a70-9f30-ff01d7511b04` | Geraden und Strecken im Raum in Parameterform darstellen und Parameter deuten | `accepted_pilot` | The image correctly uses `A(1,1,0)`, `B(5,3,2)`, and `v=B-A=(4,2,2)`. It distinguishes the line `g: X=(1,1,0)+t*(4,2,2), t in R` from the segment `AB: X=(1,1,0)+s*(4,2,2), 0<=s<=1`, and correctly interprets `s=0`, `s=1`, `s=0.5` with midpoint `M=(3,2,1)`, and `s>1` as outside the segment. |

## Rejected / Regenerated Candidates

| Goal ID | Attempt | Decision | Reason |
| --- | --- | --- | --- |
| `e9181209-1506-59df-9053-17f36b91bb06` | initial Batch 114 candidate | `rejected_regenerated` | The image used the intended disk-integration idea and final formula, but the integral evaluation line visually omitted the necessary sign handling in the antiderivative evaluation. This made the displayed derivation mathematically risky despite the correct final result. |
| `effe43eb-cabe-56cb-a228-35887d7915c1` | initial Batch 114 candidate | `rejected_regenerated` | The image used the correct points and direction vector, but the formula box stacked coordinate entries so that `(1,2,0)` and `(3,-2,3)` could be misread as two-dimensional vectors with decimal commas. The regenerated image uses semicolon-separated 3D coordinates in one line. |

## Batch Checks

- `6` normal pilot learning-goal assets were imported and accepted.
- `2` Batch 114 assets required one targeted regeneration after fachlicher review.
- `2` non-imported candidates were rejected after fachlicher review.
- No Batch 114 asset required SVG fallback.
- No final Batch 114 provider request contains the string `SkillPilot`.
- No final Batch 114 provider request contains its canonical goal ID.
- No Batch 114 asset was deferred for provider quality limitations.
