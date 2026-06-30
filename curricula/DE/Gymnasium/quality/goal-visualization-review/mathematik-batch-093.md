# Goal Visualization Review - Mathematik Batch 093

Review date: 2026-06-30

Scope: canonical `DE Gymnasium Mathematik`, continued Nano Banana Pro rollout.

Status: `completed`

Context:

- This batch was planned for six goals covering prognosis intervals, confidence intervals, confidence levels, contextual interval interpretation, confidence diagrams, and sample-size planning.
- All six Nano Banana Pro provider calls completed successfully.
- A shared prompt constrained the batch to distinguish prognosis intervals for future relative frequencies from confidence intervals for unknown probabilities.
- Two assets required regeneration after fachlicher review.

Generator/prompt policy:

- Provider prompts do not contain the string `SkillPilot`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.
- No SVG fallback is used for accepted assets.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `f85419c4-63ac-5d6d-b73b-fcb12a0ff89f` | Prognoseintervalle für relative Häufigkeiten bestimmen | `accepted_pilot` | The image correctly starts from a known model probability `p=0.50`, computes a prognosis interval for a future relative frequency `h`, and labels the interval as a range where future `h` values usually land. The remaining wording "95% Sicherheit" is acceptable in this prognosis context because the diagram also states "ca. 95% der Stichproben". |
| `5f328147-619c-568d-9a0d-e1787ca0c01b` | Konfidenzintervalle für Wahrscheinlichkeiten berechnen | `accepted_pilot` | The image correctly frames the movement from observed relative frequency `h_n` to an interval of plausible values for the unknown true probability `p`. It also explicitly rejects the misconception that one concrete interval contains `p` with probability 95%. |
| `aa14d9e4-5790-5d94-a245-2ff9a70bf633` | Konfidenzniveau interpretieren | `rejected_after_review_regenerated` | Initial candidate had red "verfehlt p" interval markers that could be read as touching or crossing the vertical `p` line. The imported asset was replaced. |
| `aa14d9e4-5790-5d94-a245-2ff9a70bf633` | Konfidenzniveau interpretieren | `accepted_pilot_after_regeneration` | The regenerated image clearly shows many repeated intervals, green intervals crossing the true `p` line, and a red miss interval that stays to one side. It correctly states long-run coverage and rejects the single-interval probability misconception. Minor text artifacts are visible but not mathematically misleading. |
| `52758ed0-cba8-5583-9e69-906d2e7c7843` | Prognose- und Konfidenzintervalle im Kontext interpretieren | `accepted_pilot` | The image correctly contrasts prognosis intervals as predictions for future relative frequencies under a fixed model with confidence intervals as estimates for an unknown population probability from observed data. It also marks the common false interpretation of a single confidence interval as wrong. |
| `77d607e0-0244-55ca-ba0f-214baa94b8de` | Konfidenzdiagramme deuten (LK) | `accepted_pilot` | The image supports reading horizontal interval bars against a plausible `p` axis, connects interval width to sample size, and explains long-run coverage without claiming certainty for one interval. The diagram is dense but fachlich usable for LK orientation. |
| `410221ed-540c-5daf-8c42-d8dd12e9100a` | Stichprobenumfang für vorgegebene Konfidenzniveaus planen (LK) | `rejected_after_review_regenerated` | Initial candidate used the incomplete planning formula `n approx (z/e)^2`, missing the conservative factor `1/4` for proportions. The imported asset was replaced. |
| `410221ed-540c-5daf-8c42-d8dd12e9100a` | Stichprobenumfang für vorgegebene Konfidenzniveaus planen (LK) | `accepted_pilot_after_regeneration` | The regenerated image correctly shows larger `n` leading to narrower intervals and uses the conservative planning formula `n >= z^2/(4e^2)` with the example `e=0.05`, `n approx 385`. Some label crowding remains, but the mathematical message is correct. |

## Batch Checks

- `6` normal pilot learning-goal assets were imported and accepted.
- `2` Batch 093 assets required regeneration after fachlicher review.
- No Batch 093 asset required SVG fallback.
- No Batch 093 provider prompt contains the string `SkillPilot`.
- No Batch 093 provider prompt contains its canonical goal ID.
- No Batch 093 asset was deferred for provider quality limitations.
