# Goal Visualization Review - Mathematik Batch 097

Review date: 2026-07-01

Scope: canonical `DE Gymnasium Mathematik`, continued Nano Banana Pro rollout.

Status: `completed`

Context:

- This batch was planned for six goals covering advanced function families, integrals involving exponential and polynomial factors, transformation families, locus curves, context-based parameter determination, and parameter ranges for solution existence.
- All Nano Banana Pro provider calls completed successfully.
- Per-goal prompt appends constrained the examples to fixed, reviewable formulas, points, and parameter ranges.
- Three assets required targeted regeneration after fachlicher review.

Generator/prompt policy:

- Provider prompts do not contain the string `SkillPilot`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.
- No SVG fallback is used for accepted assets.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `ccfd4e60-5728-568f-adb7-0b932d8e5aac` | Funktionenscharen mit Exponential- und ganzrationalen Anteilen untersuchen | `rejected_regenerate` | Initial candidate used `f_a(x)=x*e^x+a` and displayed the product-rule derivative correctly, but the graph shapes were drawn like U-shaped parabolas. This is misleading for `x*e^x+a`, whose left tail does not rise like a parabola. The candidate was not imported. |
| `ccfd4e60-5728-568f-adb7-0b932d8e5aac` | Funktionenscharen mit Exponential- und ganzrationalen Anteilen untersuchen | `accepted_pilot_after_regeneration` | The accepted regeneration uses the simpler reviewable family `f_a(x)=e^x+a`, with the constant `a` as ganzrationaler Anteil. It correctly shows three increasing exponential curves for `a=-1,0,1`, horizontal asymptotes `y=-1,0,1`, values `f_-1(0)=0`, `f_0(0)=1`, `f_1(0)=2`, and derivative `f'_a(x)=e^x`. |
| `0e8417d7-effb-5314-93ba-a571b01726ce` | Integrale bei verknüpften Exponential- und ganzrationalen Funktionen berechnen | `rejected_regenerate` | Initial candidate computed the integral of `x*e^x` correctly but visibly titled the example as `f'(x)=x*e^x`, which mislabels the integrand as a derivative. The candidate was not imported. |
| `0e8417d7-effb-5314-93ba-a571b01726ce` | Integrale bei verknüpften Exponential- und ganzrationalen Funktionen berechnen | `accepted_pilot_after_regeneration` | The accepted regeneration correctly states `f(x)=x*e^x`, uses `F(x)=(x-1)*e^x`, verifies `F'(x)=e^x+(x-1)e^x=x*e^x`, and evaluates `integral_0^1 x*e^x dx = 0 - (-1) = 1`. The shaded area from `0` to `1` is labelled `A=1` and the endpoint `(1|e)` is consistent. |
| `e33e75e3-eae5-5a09-862f-d1a11176373f` | Transformationsscharen bekannter Funktionsklassen untersuchen | `accepted_pilot` | The image correctly uses `g_a(x)=(x-a)^2`, shows `a=-1`, `a=0`, and `a=2`, and marks the vertices `S(-1|0)`, `S(0|0)`, and `S(2|0)`. It correctly states that `a` shifts the normal parabola horizontally while form and opening remain unchanged. |
| `20843e23-cfc5-5ff8-96e0-e05a4f746fae` | Ortskurven von Extrem- und Wendepunkten bestimmen (LK) | `rejected_regenerate` | Initial candidate contained the intended formulas for `T_a=(a|-a^2)` and `W_a=(a|-2a^3)`, but the plotted example points and labels were visually inconsistent with the shown locus curves. The candidate was not imported. |
| `20843e23-cfc5-5ff8-96e0-e05a4f746fae` | Ortskurven von Extrem- und Wendepunkten bestimmen (LK) | `rejected_regenerate` | First regeneration improved the algebra but still drew a misleading curve for `y=-2x^3` that looked like a curve with extrema rather than the monotone cubic locus. The candidate was not imported. |
| `20843e23-cfc5-5ff8-96e0-e05a4f746fae` | Ortskurven von Extrem- und Wendepunkten bestimmen (LK) | `accepted_pilot_after_second_regeneration` | The accepted second regeneration removes coordinate diagrams and uses an algebra flowchart. It correctly derives for `f_a(x)=x^2-2a*x` the Tiefpunkt `T_a=(a|-a^2)`, eliminates `a` via `x=a`, and obtains `y=-x^2`. It also correctly shows for `g_a(x)=x^3-3a*x^2` that `g''_a(x)=6x-6a`, `x=a`, `W_a=(a|-2a^3)`, and therefore `y=-2x^3`. |
| `6ca8ad6b-a770-5d5e-9f91-7211c54c45b0` | Parameter zur Modellierung von Sachsituationen bestimmen | `accepted_pilot` | The image models a bridge arch with `h_a(x)=a*x*(10-x)`, zeros at `(0|0)` and `(10|0)`, and the context condition `h_a(5)=5`. It correctly computes `25a=5`, `a=0.2`, and gives the final model `h(x)=0.2*x*(10-x)` with points `(0|0)`, `(5|5)`, and `(10|0)`. |
| `1bdac3d8-6b6f-5e27-9c9e-9addf198aa99` | Parameterbereiche für Lösungsexistenz analysieren (LK) | `accepted_pilot` | The image correctly analyzes `x^2=a` / `f_a(x)=x^2-a=0`: for `a>0` there are two real solutions `x=-sqrt(a)` and `x=sqrt(a)`, for `a=0` one double solution `x=0`, and for `a<0` no real solution. The result `a>=0` is correctly stated. |

## Batch Checks

- `6` normal pilot learning-goal assets were imported and accepted.
- `3` Batch 097 assets required targeted regeneration after fachlicher review.
- `4` non-imported initial or regeneration candidates were rejected for visible mathematical risk.
- No Batch 097 asset required SVG fallback.
- No Batch 097 provider request contains the string `SkillPilot`.
- No Batch 097 provider request contains its canonical goal ID.
- No Batch 097 asset was deferred for provider quality limitations.
