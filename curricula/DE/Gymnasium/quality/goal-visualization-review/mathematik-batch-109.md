# Goal Visualization Review - Mathematik Batch 109

Review date: 2026-07-01

Scope: canonical `DE Gymnasium Mathematik`, continued Nano Banana Pro rollout.

Status: `completed`

Context:

- This batch was planned for six goals covering derivatives of simple rational and square-root functions, graph shifts, stretches/compressions, general transformation terms, graph reflections, and symmetry of shifted function and derivative graphs.
- All Nano Banana Pro provider calls completed successfully.
- Per-goal prompt appends constrained each visualization to fixed formulas, point mappings, graph transformations, derivative values, and symmetry statements.
- One goal required targeted regeneration after fachlicher review because the initial derivative-graph symmetry statement used the wrong symmetry center.

Generator/prompt policy:

- Provider prompts do not contain the string `SkillPilot`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.
- No SVG fallback is used for accepted assets.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `6517427b-cf4e-5ebf-9a76-e1035617687c` | Einfache gebrochen rationale und Wurzelfunktionen ableiten | `accepted_pilot` | The image correctly applies the power rule `(x^r)'=r*x^(r-1)`. It rewrites `1/x` as `x^-1` and obtains `-1/x^2`, rewrites `1/x^2` as `x^-2` and obtains `-2/x^3`, and treats `sqrt(x)` as `x^(1/2)` with derivative `1/(2*sqrt(x))` for `x>0`. The warnings that `(1/x)'` is not `1` and that `h'(0)` is not defined are correct. |
| `dd6c5e08-0cc6-53c0-b317-ebaba277c776` | Verschiebungen von Funktionsgraphen beschreiben | `accepted_pilot` | The image correctly starts from `f(x)=x^2`. It shows `g(x)=f(x-2)=(x-2)^2` as a shift two units to the right with vertex `(2,0)`, and `h(x)=f(x)+3=x^2+3` as a shift three units upward with vertex `(0,3)`. |
| `772b11c9-1348-5ab9-bc3f-458c46b312b6` | Streckungen und Stauchungen von Funktionsgraphen beschreiben | `accepted_pilot` | The image correctly compares `f(x)=x^2`, `g(x)=2f(x)=2x^2`, and `h(x)=0.5f(x)=0.5x^2`. The marked point mappings show vertical stretch `(1,1)->(1,2)` and vertical compression `(2,4)->(2,2)`. The optional horizontal compression `k(x)=f(2x)` correctly maps the old point `(2,4)` to `(1,4)`. |
| `a12bef54-7595-5f48-a7a8-9cfe1d8e9729` | Allgemeinen Transformationsterm interpretieren | `accepted_pilot` | The image correctly uses `g(x)=a*f(b*(x-c))+d`. It identifies `c` as horizontal shift, `d` as vertical shift, `|a|` as vertical stretch/compression with x-axis reflection for `a<0`, and `1/|b|` as horizontal factor with y-axis reflection for `b<0`. The example `g(x)=-2*f(0.5*(x-3))+1` is interpreted as right `3`, horizontal stretch factor `2`, vertical stretch factor `2`, reflection in the x-axis, and up `1`. |
| `4c6369b0-4b58-5ac0-915c-82c348ae1c14` | Spiegelungen von Funktionsgraphen beschreiben | `accepted_pilot` | The image correctly uses the original point `P(2,3)` and maps it under x-axis reflection to `(2,-3)` with `y=-f(x)`, under y-axis reflection to `(-2,3)` with `y=f(-x)`, and under origin reflection to `(-2,-3)` with `y=-f(-x)`. |
| `62a1c6f2-1775-5a19-98e0-ed3dd722039f` | Symmetrieeigenschaften verschobener Funktions- und Ableitungsgraphen begründen | `accepted_pilot` | Accepted after one targeted regeneration. The final image correctly uses `f(x)=(x-2)^2+1`, marks the symmetry axis `x=2`, and shows `f(1)=2`, `f(3)=2`, and vertex `(2,1)`. It states `f'(x)=2*(x-2)`, marks `f'(1)=-2`, `f'(2)=0`, `f'(3)=2`, and correctly describes point symmetry of the derivative graph with respect to `(2,0)`. |

## Rejected / Regenerated Candidates

| Goal ID | Attempt | Decision | Reason |
| --- | --- | --- | --- |
| `62a1c6f2-1775-5a19-98e0-ed3dd722039f` | initial Batch 109 candidate | `rejected_regenerated` | The function and derivative values were mostly coherent, but the image stated that the derivative graph was point-symmetric to the origin. For `f'(x)=2*(x-2)`, the correct symmetry center is `(2,0)`, not `(0,0)`. |

## Batch Checks

- `6` normal pilot learning-goal assets were imported and accepted.
- `1` Batch 109 asset required targeted regeneration after fachlicher review.
- `1` non-imported candidate was rejected after fachlicher review.
- No Batch 109 asset required SVG fallback.
- No final Batch 109 provider request contains the string `SkillPilot`.
- No final Batch 109 provider request contains its canonical goal ID.
- No Batch 109 asset was deferred for provider quality limitations.
