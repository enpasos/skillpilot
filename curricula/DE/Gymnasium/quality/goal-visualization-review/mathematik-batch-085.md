# Goal Visualization Review - Mathematik Batch 085

Review date: 2026-06-30

Scope: canonical `DE Gymnasium Mathematik`, continued Nano Banana Pro rollout.

Status: `completed`

Context:

- This batch was planned for six goals covering two-way tables, conditional probabilities, joint probabilities, independence checks, and critical interpretation of probabilistic data claims.
- All six Nano Banana Pro provider calls completed successfully.
- Three images required regeneration after review because the first candidate contained a misleading or mathematically risky table detail.
- Provider prompts do not contain concrete SkillPilot goal IDs.

Generator/prompt policy:

- Provider prompts do not contain the string `SkillPilot`.
- Canonical IDs are used only for local paths, metadata, JSON links, and deployment.
- No SVG fallback is used for accepted assets.

## Reviewed Assets

| Goal ID | Title | Decision | Review notes |
| --- | --- | --- | --- |
| `52e57eb5-7cd1-5df0-a8c6-7b090f097d9f` | Vierfeldertafeln interpretieren | `accepted_pilot_after_regeneration` | The first candidate used inconsistent table values. The regenerated image uses the fixed table `30/20/50`, `10/40/50`, `40/60/100` and matching relative frequencies `0.30/0.20/0.50`, `0.10/0.40/0.50`, `0.40/0.60/1.00`. The reads `P(A∩B)=30/100=0.30`, `P(A|B)=30/50=0.60`, and `P(B|A)=30/40=0.75` are correct. |
| `c3b9c561-dd83-5903-9ec6-49c7f51bafd5` | Bedingte Wahrscheinlichkeiten berechnen | `accepted_pilot_after_regeneration` | The first candidate used inconsistent table values. The regenerated image consistently connects the same two-way table with the conditional calculations `P(A|B)=P(A∩B)/P(B)=0.30/0.50=0.60` and `P(B|A)=P(A∩B)/P(A)=0.30/0.40=0.75`. The tree values match the table. |
| `508292f2-671b-4fd3-acbf-53d705e44693` | Bedingte Wahrscheinlichkeiten mit Baumdiagrammen und Vierfeldertafeln bestimmen | `accepted_pilot` | The image correctly shows the relationship between a first split by `A`/`nicht A`, conditional second-stage probabilities, and a two-way table with cells such as `P(A∩B)`, `P(A∩B̄)`, `P(Ā∩B)`, and `P(Ā∩B̄)`. The quotient formula `P(B|A)=P(A∩B)/P(A)` is correct. |
| `c2831918-26f1-421e-90fb-ce707689594e` | Bedingte und gemeinsame Wahrscheinlichkeiten im Kontext unterscheiden | `accepted_pilot_after_regeneration` | The first candidate contained a small but misleading two-way table with duplicated row/column labels. The regenerated image avoids that risk and clearly distinguishes `P(A∩B)` as "A und B", `P(B|A)` as "B gegeben A", and `P(A|B)` as "A gegeben B" with correct quotient formulas. |
| `dabff49b-d40a-4c81-a584-21408b2d4219` | Stochastische Unabhängigkeit an Baumdiagrammen und Vierfeldertafeln prüfen | `accepted_pilot` | The image correctly states the independence checks `P(B|A)=P(B)` and `P(A∩B)=P(A)*P(B)` and mirrors the same logic for a two-way table with events `C` and `D`. The visual layout supports comparing a tree and a two-way table. |
| `3e974075-b2fd-43e6-88d9-5f596ad053ec` | Datenaussagen mit bedingten Wahrscheinlichkeiten kritisch prüfen | `accepted_pilot` | The image correctly emphasizes sample size and sample mix, survey wording, subsets/base rates, the asymmetry `P(A|B) != P(B|A)`, and the distinction between correlation and causality. This is appropriate as a critical-reading visualization for conditional probability statements. |

## Batch Checks

- `6` normal pilot learning-goal assets were imported and accepted.
- `3` Batch 085 assets required regeneration after fachlicher review.
- No Batch 085 asset required SVG fallback.
- No Batch 085 provider prompt contains the string `SkillPilot`.
- No Batch 085 asset was deferred for provider quality limitations.
