# Goal Visualization Review - Mathematik Batch 107

Review date: 2026-07-01

Scope: canonical `DE Gymnasium Mathematik`, continued Nano Banana Pro rollout.

Status: `completed`

Context:

- This batch was planned for six goals covering antiderivatives by form ansatz, the natural logarithm as antiderivative of `1/x`, justified form ansatz work, combining integration techniques, partial integration, and substitution.
- All Nano Banana Pro provider calls completed successfully.
- Per-goal prompt appends constrained each visualization to fixed, reviewable integrals, substitutions, coefficient comparisons, boundary changes, and derivative checks.
- One goal required targeted regeneration after fachlicher review because the initial graph for `1/x` visually swapped the relative y-positions of `1` and `1/e`.

Generator/prompt policy:

- Provider prompts do not contain the string `SkillPilot`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.
- No SVG fallback is used for accepted assets.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `dc3c6e19-8ac2-532c-8d64-ca6e3d3f5cd9` | Stammfunktionen durch Formansatz bestimmen | `accepted_pilot` | The image correctly starts from `f(x)=(2x+3)*e^x`, chooses `F(x)=(a*x+b)*e^x`, differentiates with the product rule to `F'(x)=(a*x+a+b)*e^x`, and compares coefficients `a=2`, `a+b=3`, hence `b=1`. The final check `F'(x)=(2x+3)*e^x=f(x)` is correct. |
| `3bf1ce9e-f4d3-502e-9d6e-94f7b7f697d4` | Die natürliche Logarithmusfunktion als Stammfunktion von 1/x nutzen (LK) | `accepted_pilot` | Accepted after one targeted regeneration. The final image correctly states `(ln x)'=1/x` and `integral 1/x dx = ln x + C` for `x>0`, evaluates `integral_1^e 1/x dx = [ln x]_1^e = 1`, and shows the graph of `y=1/x` with `(1,1)` above `(e,1/e)`. The warning that `integral 1/x^2 dx` is not `ln x + C` but `-1/x + C` is correct. |
| `d108ec1f-2c8f-5267-be75-10e1b77edd7a` | Formansatz begründen und anwenden | `accepted_pilot` | The image correctly justifies the ansatz for `f(x)=(4x+1)*e^(2x)`, uses `F(x)=(a*x+b)*e^(2x)`, includes the chain-rule factor `2`, and obtains `F'(x)=(2a*x+a+2b)*e^(2x)`. The coefficient comparison `2a=4`, `a+2b=1` gives `a=2`, `b=-1/2`, and the final derivative check returns `(4x+1)*e^(2x)`. |
| `5ccf0d90-2967-576e-8f72-f002792d8515` | Integrationstechniken gezielt kombinieren | `accepted_pilot` | The image correctly selects substitution for `I=integral_0^1 2x*(1+x^2)*e^(x^2) dx`, uses `u=x^2`, `du=2x dx`, and converts the bounds `0 -> 0`, `1 -> 1`. It then obtains `integral_0^1 (1+u)*e^u du`, verifies `G(u)=u*e^u` via product rule, and evaluates `[u*e^u]_0^1=e`. |
| `6d89d813-29dc-5e76-b004-98ed6b6fe8ce` | Partielle Integration anwenden (LK) | `accepted_pilot` | The image correctly applies partial integration to `integral_0^1 x*e^x dx` with `u=x`, `u'=1`, `v'=e^x`, and `v=e^x`. It includes the boundary term `[x*e^x]_0^1`, the negative remainder integral, and evaluates `e-(e-1)=1`. |
| `12f4b957-da3d-53d5-a924-45a634ab8d44` | Substitutionsmethode anwenden (LK) | `accepted_pilot` | The image correctly uses `u=x^2`, `du=2x dx` for `integral_0^1 2x*cos(x^2) dx`, explicitly converts the limits to `u=0` and `u=1`, and evaluates `integral_0^1 cos(u) du = [sin(u)]_0^1 = sin(1)`. |

## Rejected / Regenerated Candidates

| Goal ID | Attempt | Decision | Reason |
| --- | --- | --- | --- |
| `3bf1ce9e-f4d3-502e-9d6e-94f7b7f697d4` | initial Batch 107 candidate | `rejected_regenerated` | The formulas were mostly correct, but the graph visually placed the y-axis helper values for `1` and `1/e` in the wrong order. For `y=1/x`, the point `(1,1)` must be above `(e,1/e)`. |

## Batch Checks

- `6` normal pilot learning-goal assets were imported and accepted.
- `1` Batch 107 asset required targeted regeneration after fachlicher review.
- `1` non-imported candidate was rejected after fachlicher review.
- No Batch 107 asset required SVG fallback.
- No final Batch 107 provider request contains the string `SkillPilot`.
- No final Batch 107 provider request contains its canonical goal ID.
- No Batch 107 asset was deferred for provider quality limitations.
