# Goal Visualization Review - Mathematik Batch 091

Review date: 2026-06-30

Scope: canonical `DE Gymnasium Mathematik`, continued Nano Banana Pro rollout.

Status: `completed`

Context:

- This batch was planned for six LK stochastics goals covering further continuous distributions and the main setup elements of hypothesis tests.
- All six Nano Banana Pro provider calls completed successfully.
- A shared prompt constrained hypothesis-test diagrams to keep `H0`, `H1`, test variable, rejection region, and error probabilities semantically separate.
- One initially imported image was regenerated after fachlicher review because its exponential-density formula contained text artifacts and the shaded interval did not match the stated interval.

Generator/prompt policy:

- Provider prompts do not contain the string `SkillPilot`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.
- No SVG fallback is used for accepted assets.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `455ef29a-7194-5c5a-b832-1c27fcbf2516` | Weitere stetige Verteilungen exemplarisch nutzen (LK) | `rejected_after_review_regenerated` | Initial candidate contained malformed formula text and marked an area that did not cleanly match the displayed interval `2 <= T <= 5`. The imported asset was replaced by a regenerated image. |
| `455ef29a-7194-5c5a-b832-1c27fcbf2516` | Weitere stetige Verteilungen exemplarisch nutzen (LK) | `accepted_pilot_after_regeneration` | The regenerated image uses an exponential waiting-time density, correctly shows `f(t)=lambda*e^(-lambda*t)` for `t>=0`, shades the interval from `2` to `5`, and clearly states that probability is area under the curve rather than curve height. |
| `d1910e24-bd21-4b51-9f9a-d8c5c5e63e5b` | Argumentationsmuster von Hypothesentests erläutern | `accepted_pilot` | The image correctly shows the test argument chain: formulate `H0/H1`, define the test variable before observing data, use the distribution under `H0`, compare the observed value with a critical region, and decide between rejecting and not rejecting `H0`. |
| `f14e1643-ad8d-5235-a832-97987fa18489` | Null- und Alternativhypothesen formulieren | `accepted_pilot` | The image correctly distinguishes right-sided, left-sided, and two-sided tests with matching examples and hypothesis pairs. It also keeps the rejection-region direction aligned with the alternative hypothesis. |
| `eb2cecd6-5dca-5a2e-988b-a29b24c20345` | Testkennzahlen und Testvariablen bestimmen | `accepted_pilot` | The image correctly frames the test variable as `X = number of defective items` in `n=20` trials, shows the distribution of `X` under `H0`, and separates observed value, critical region, and final decision. |
| `677be619-5f0a-59bf-9730-0071c7d3f150` | Entscheidungsregeln und Verwerfungsbereiche bestimmen | `accepted_pilot` | The image correctly builds a right-sided rejection rule from `H0/H1`, the test variable, a critical value `k`, and the comparison `X_observed >= k`. It also uses the careful wording `H0 nicht verwerfen` when the observed value is outside the rejection region. |
| `78bfbde4-8e16-529e-bd53-4e29d960b2b2` | Fehlerwahrscheinlichkeiten berechnen | `accepted_pilot` | The image correctly separates type I error `alpha = P(H0 rejected | H0 true)` from type II error `beta = P(H0 not rejected | H1 true)`. It uses two different true-state scenarios and gives plausible values for the displayed `n=20`, `p=0.10` versus `p=0.25` example. |

## Batch Checks

- `6` normal pilot learning-goal assets were imported and accepted.
- `1` Batch 091 asset required regeneration after fachlicher review.
- No Batch 091 asset required SVG fallback.
- No Batch 091 provider prompt contains the string `SkillPilot`.
- No Batch 091 asset was deferred for provider quality limitations.
