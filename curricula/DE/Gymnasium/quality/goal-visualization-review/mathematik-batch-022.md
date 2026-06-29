# Goal Visualization Review - Mathematik Batch 022

Review date: 2026-06-29

Scope: canonical `DE Gymnasium Mathematik`, atomic goals.

Generator/prompt policy:

- Provider prompts do not contain concrete SkillPilot goal IDs.
- Provider prompts do not contain the string `SkillPilot`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.
- No SVG fallback is used for accepted assets.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `7156558c-57f1-4372-9ba7-0640c3f7cb3a` | Ableitungsbegriff aus mittleren und momentanen Änderungsraten entwickeln | `accepted_pilot` | The image correctly contrasts the secant slope between `A(1|1)` and `B(3|9)` for `f(x)=x^2`, giving `(9-1)/(3-1)=4`, with the tangent slope at `x=2`. The `h -> 0` transition is appropriate for the concept introduction. |
| `9f2fc0d1-e1e7-4051-ba70-87ba1dd8dd1c` | Grundlegende Ableitungsregeln auf elementare Funktionsterme anwenden | `accepted_pilot` | The worked example `f(x)=3x^4-2x^2+5` is differentiated correctly to `f'(x)=12x^3-4x`. Potenzregel, Faktorregel, Summenregel, and the constant derivative are shown coherently. |
| `1a18dbb3-f350-4766-9c8b-20ca018ccef1` | Monotonie, Extremstellen und Funktion-Ableitungs-Beziehungen untersuchen | `accepted_pilot` | The example `f(x)=-x^2+4` with `f'(x)=-2x` is correct. The sign chart matches the monotonicity: increasing for `x<0`, derivative zero at `x=0`, decreasing for `x>0`, and a maximum at the vertex. |
| `b43a1e45-f05c-4d78-8453-f6fa677dc24c` | Tangenten- und Normalengleichungen in einfachen Fällen aufstellen | `accepted_pilot` | For `f(x)=x^2` at `P(1|1)`, the image correctly shows `m_T=2`, tangent `t: y=2x-1`, normal slope `m_N=-1/2`, and normal `n: y=-1/2 x + 3/2`. The perpendicular relationship is visually indicated. |
| `06bdbecb-53e0-5ac3-992f-d6fd20555b59` | Tangenten als lineare Approximationen nutzen | `accepted_pilot` | The image correctly uses the tangent to `f(x)=x^2` at `x0=2`, with `L(x)=4x-4`. The nearby value `L(2.1)=4.4` is a good local approximation, while the larger error at `x=3` correctly illustrates that the approximation worsens farther from `x0`. |

## Batch Checks

- No current Batch 022 provider request contains a concrete SkillPilot goal ID.
- No current Batch 022 provider request contains `SkillPilot`.
- Current reviewed assets do not visibly contain SkillPilot IDs.
- No Batch 022 asset required SVG fallback.
- No Batch 022 asset is marked `deferred_provider_limitation`.
