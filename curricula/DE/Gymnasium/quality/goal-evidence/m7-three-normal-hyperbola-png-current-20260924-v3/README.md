# Current three-goal Math P-v2 AI candidate (v3)

This is the centrally registered, current positive-understanding-evidence-v2 AI candidate for exactly `3f1a97d2`, `8c32d941`, and `a7778885`. It retains the sound `3f1a` profile exactly and repairs two substantive weaknesses in the formally green, unregistered v2 candidate. The v1/v2 audit files, canonical landscapes, and QA ledgers were not changed. Each new review record remains `needs_human_review` / `ai_candidate`, `E1/G1`; no human approval or learner demonstration is claimed. Registration alone does not close the still-open description gate.

## Content and source check

| Goal | Source and actual image | Image-independent evidence in v3 |
| --- | --- | --- |
| `3f1a97d2` | BY LehrplanPLUS source snapshot `Mathematik.json`, M8.3 source goal `71e28934`, requires graph/asymptote drawing and inverse graph-to-parameter determination. Original PNG SHA `97cf6db334cb1c14c818d0f18cd79bf28f1b412bb4eec9d958336053631fbb26` depicts `2/(x−1)+3` with consistent points. | Retained exact v2 profile: new graphs for `6/(x−2)−1` and `−2/(x+2)+3`, each reconstructed from asymptotes and one point, checked against a different point and branch position. Positive-to-negative `a` reverses branch layout. The numerical graph features in the authoring brief must be drawn without revealing asymptote coordinates or formula to learners; otherwise this profile's graph-reading evidence would not be elicited. |
| `8c32d941` | HE KCGO Mathematik Q3.2, printed/PDF p. 47, LK bullet on normal probabilities in contexts with digital tools (including fill volumes and body measurements). Original PNG SHA `09c914227f618c81397d1c6e65b2844ad90e75c9087b5828fbaadc36f7f2b91a` depicts only generic interval `[a,b]`. | Retained central fill-volume case: `X~N(100 ml, 10² ml²)`, `P(90≤X≤110)≈0.6827`. Revised transfer: height in a modeled adult group, `μ=170 cm`, `σ=5 cm`; `P(X>180 cm)=1−Φ(2)≈0.0228`, interpreted as about 2.3% of that group. The first is a two-sided interval; the second requires a right-tail complement in a distinct, unit-bearing context. |
| `a7778885` | Same HE Q3.2 p. 47 LK bullet explicitly gives the normal CDF as `∫_{−∞}^{x} φ(t)dt`. Original PNG SHA `0aab1d68fb4f8e45fa13525b19a836fb00a2efa921822f397ac7f32c7144ef94` shades generic left cumulative area. | Retained standard case explains `Φ(0)=0.5` and `P(0<Z≤1)=0.3413`. Revised transfer uses `Y~N(10,2²)`: `F_Y(11)=Φ(0.5)≈0.6915` as the left integral, then asymmetric cross-mean `P(8<Y≤11)=Φ(0.5)−Φ(−1)≈0.5328`. This is not the same standardized region or answer as the first case, and both distinguish CDF area from density height. |

The v2 checker had 0 blockers but did not catch two content issues: its `8c32` upper-tail case said only “a measurement” with no unit or real context, so it did not demonstrate the goal's context interpretation; its `a777` transfer was the same standardized `0<Z≤1` area and same `0.3413` result as its first case. `source-pins.json` fixes the exact v2 file bytes and profile lineage. The three current goal/input fingerprints and image bytes are unchanged from v2; only the two named profile objects change. All numerical examples are absent from the actual PNGs, so recognizing the pictures cannot by itself satisfy either pair of cases.

## Focused validation

From `app/`:

```bash
npx tsx scripts/materializePositiveGoalEvidenceCandidates.ts --config curricula/DE/Gymnasium/quality/goal-evidence/m7-three-normal-hyperbola-png-current-20260924-v3/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/m7-three-normal-hyperbola-png-current-20260924-v3/positive-evidence.candidates.json
npx tsx scripts/positiveGoalEvidenceReview.ts --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-three-normal-hyperbola-png-current-20260924-v3/positive-evidence.config.json --mode=check
npm run test:positive-goal-evidence-candidates
npm run test:positive-goal-evidence-review
```

All four passed: 3 current AI candidates, 0 approved, 3 needing human review, 0 blockers; candidate materialization was byte-reproducible. The three original image SHA values above were read from the actual active PNG bytes, not alt text alone. Registration, a new GoalBook bundle, D reviews, and strict M7 closure are separate downstream steps.
