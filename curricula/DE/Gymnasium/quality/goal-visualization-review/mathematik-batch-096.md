# Goal Visualization Review - Mathematik Batch 096

Review date: 2026-07-01

Scope: canonical `DE Gymnasium Mathematik`, continued Nano Banana Pro rollout.

Status: `completed`

Context:

- This batch was planned for six goals covering function families, parameter effects on graph shape and position, prescribed zeros, parameter-dependent extrema, polynomial family analysis, and integrals of polynomial function families.
- All Nano Banana Pro provider calls completed successfully.
- Per-goal prompt appends constrained the batch to fixed, reviewable formulas and values.
- One asset required two targeted regenerations after fachlicher review.

Generator/prompt policy:

- Provider prompts do not contain the string `SkillPilot`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.
- No SVG fallback is used for accepted assets.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `993a14e8-60f0-5764-9340-b2447a5fa84b` | Parameter in Funktionenscharen deuten | `accepted_pilot` | The image correctly uses `f_a(x)=x^2+a` with `a=-1`, `a=0`, and `a=2`. The vertices are shown as `S(0|-1)`, `S(0|0)`, and `S(0|2)`, and the interpretation correctly states that the parameter changes the vertical position but not the opening. |
| `bfa2351c-735e-56eb-a778-2413aa68db42` | Parameterwirkung auf Schargraphen beschreiben | `accepted_pilot` | The image correctly uses `g_a(x)=a*x^2`, keeps the vertex at `S(0|0)`, shows larger positive `a` as a narrower parabola, and uses `a=-1` as a contrast case for reflection at the x-axis. |
| `5e615e88-25b6-50d5-8f1a-c57e5f9466ed` | Parameter für vorgegebene Nullstellen bestimmen | `accepted_pilot` | The image correctly solves the condition `f_a(2)=0` for `f_a(x)=x^2+a`: `(2)^2+a=0`, `4+a=0`, therefore `a=-4`. The check `f_-4(2)=2^2-4=0` is correct, and the graph of `x^2-4` marks the zero at `x=2` without hiding the symmetric zero at `x=-2`. |
| `7feaaebd-cc8d-522b-8b3a-ea22675c65dd` | Extremstellen parameterabhängig untersuchen | `accepted_pilot` | The image correctly differentiates `f_a(x)=x^2-2*a*x` as `f'_a(x)=2x-2a`, solves `x=a`, checks `f''_a(x)=2>0`, and identifies a minimum `T_a=(a|-a^2)`. The examples `a=-1 -> T(-1|-1)`, `a=0 -> T(0|0)`, and `a=2 -> T(2|-4)` are consistent. |
| `fcf9af67-7abd-5f69-a22a-b436297d44c5` | Ganzrationale Funktionenscharen untersuchen | `accepted_pilot` | The image correctly analyzes `p_a(x)=x^2+a*x=x(x+a)`: zeros `0` and `-a`, symmetry axis `x=-a/2`, vertex `S_a(-a/2|-a^2/4)`, and opening upward. The example `a=2` correctly gives zeros `0` and `-2`, axis `x=-1`, and vertex `S(-1|-1)`. |
| `d144a855-9139-55c7-a801-e8b85dab5f01` | Integrale ganzrationaler Funktionenscharen berechnen | `rejected_regenerate` | Initial candidate had the correct formula `F_a(x)=(a/2)*x^2+x`, integral value `2a+2`, and table values `2`, `4`, `6`; however, the overlaid shaded graph regions visually labeled only incremental areas for `a=1` and `a=2`, which could be read as the total integral values. The candidate was not imported. |
| `d144a855-9139-55c7-a801-e8b85dab5f01` | Integrale ganzrationaler Funktionenscharen berechnen | `rejected_regenerate` | First regeneration separated the three diagrams, but the visible value table changed the parameter rows to `0`, `2`, and `3` while keeping integral values `2`, `4`, and `6`. This contradicted the required `a=0`, `a=1`, `a=2` examples. The candidate was not imported. |
| `d144a855-9139-55c7-a801-e8b85dab5f01` | Integrale ganzrationaler Funktionenscharen berechnen | `accepted_pilot_after_regeneration` | The accepted regeneration omits the problematic table, shows `f_a(x)=a*x+1`, `F_a(x)=(a/2)*x^2+x`, and computes `integral_0^2 (a*x+1) dx = 2a+2`. It uses three separate panels with total shaded areas: `a=0`, `f_0(x)=1`, `A_0=2`; `a=1`, `f_1(x)=x+1`, endpoint `(2|3)`, `A_1=4`; and `a=2`, `f_2(x)=2x+1`, endpoint `(2|5)`, `A_2=6`. |

## Batch Checks

- `6` normal pilot learning-goal assets were imported and accepted.
- `1` Batch 096 asset required targeted regeneration after fachlicher review.
- `2` non-imported regeneration or initial candidates were rejected for visible mathematical risk.
- No Batch 096 asset required SVG fallback.
- No Batch 096 provider request contains the string `SkillPilot`.
- No Batch 096 provider request contains its canonical goal ID.
- No Batch 096 asset was deferred for provider quality limitations.
