# Goal Visualization Review - Mathematik Batch 047

Review date: 2026-06-29

Scope: canonical `DE Gymnasium Mathematik`, continued Nano Banana Pro rollout.

Status: `completed_pilot`

Context:

- This batch focused on quadratic functions after skipping another exact 3D-coordinate candidate for now.
- Five Nano Banana Pro candidates were generated with `--no-import` first.
- Two initial candidates were accepted directly.
- Three candidates were regenerated with stricter mathematical constraints; two needed a second regeneration before acceptance.
- Provider prompts do not contain concrete SkillPilot goal IDs.

Generator/prompt policy:

- Provider prompts do not contain the string `SkillPilot`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.
- No SVG fallback is used for accepted assets.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `5bced7dc-6557-4af1-9e70-d87f850d3b7f` | Parameter quadratischer Funktionen in Scheitelpunktform deuten | `accepted_pilot_after_regeneration` | The first candidate incorrectly suggested a downward-opening parabola for `e < 0`. The accepted regenerated candidate correctly separates the effects of `a`, `d`, and `e` in `f(x)=a(x-d)^2+e`, with `e` shown as vertical shift only. |
| `e0c3359d-7d8a-4d01-a25e-a8cd5ebce90e` | Eigenschaften quadratischer Funktionen aus Graphen ablesen | `accepted_pilot_after_second_regeneration` | Earlier candidates either placed the vertex inconsistently or used a misleading green plus area between the roots. The accepted candidate shows `f(x)=(x-2)^2-4`, vertex `S(2|-4)`, roots `0` and `4`, range `y >= -4`, monotonicity, and sign intervals consistently. |
| `7bff61c1-1a69-4991-97de-0cff764f507e` | Darstellungsformen quadratischer Funktionen situationsgerecht nutzen | `accepted_pilot` | The accepted candidate correctly compares general form, vertex form, and root form, including the visible advantages of reading off y-intercept, vertex, and roots. |
| `5743b8f9-86cb-4e24-8859-351708d070ab` | Quadratische Funktionen aus Punkten oder Bedingungen bestimmen | `accepted_pilot_after_second_regeneration` | Earlier candidates contained an inconsistent second example or duplicated a point label. The accepted candidate uses only `C(0|1)`, `A(1|2)`, and `B(2|5)`, derives the correct linear system, solves `a=1`, `b=0`, `c=1`, and shows `f(x)=x^2+1`. |
| `a7ccb7a9-6fb0-4e2d-b6e0-6420cc5ae0bf` | Quadratische Funktionen in Anwendungen modellieren und lösen | `accepted_pilot_after_regeneration` | The first candidate mixed contexts and contained text artifacts. The accepted regenerated candidate uses the coherent ball model `h(t)=-t^2+4t`, with start at `t=0`, maximum `S(2|4)`, landing at `t=4`, and appropriate context-domain notes. |

## Batch Checks

- `5` assets were imported.
- `3` assets required regeneration before import.
- No Batch 047 asset required SVG fallback.
- No Batch 047 asset was deferred.
