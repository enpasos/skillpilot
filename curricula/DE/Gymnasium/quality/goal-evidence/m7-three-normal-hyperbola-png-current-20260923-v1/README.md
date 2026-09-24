# Three Math P-v2 image rebindings — AI candidate preparation

This package prepares the current image-bound positive-understanding-evidence review for exactly `3f1a97d2`, `8c32d941`, and `a7778885`. It does not change canonical goals, the visualization QA, the GoalBook, or the central registry. The candidate profiles are AI-authored evidence criteria (`E1/G1`, no human approval), not observed learner performance.

## Independent profile-versus-image check

| Goal | New teaching-image candidate (SHA-256) | Profile judgment |
| --- | --- | --- |
| `3f1a97d2` | `97cf6db334cb1c14c818d0f18cd79bf28f1b412bb4eec9d958336053631fbb26` | Keep exact existing profile. The image works through `2/(x−1)+3`; the two P cases instead use `6/(x−2)−1` and `−2/(x+2)+3`. They require new asymptotes, points, and branch checks, including a negative-numerator transfer. |
| `8c32d941` | `09c914227f618c81397d1c6e65b2844ad90e75c9087b5828fbaadc36f7f2b91a` | Keep exact existing profile. The image only marks a generic interval `[a,b]` and `P(a≤X≤b)`. The P cases require their own central-interval standardization and a distinct upper-tail probability in concrete normal distributions. |
| `a7778885` | `0aab1d68fb4f8e45fa13525b19a836fb00a2efa921822f397ac7f32c7144ef94` | Keep exact existing profile. The image shows generic left accumulation `F(x)=P(X≤x)`, with no numerical `Φ` value or interval difference; both are independently required by the P cases. |

The original candidate PNGs are in `tmp/goal-visualizations/math-m7-v-next-four-20260923/<short-id>/candidate-v1.png`. Exact profile objects in `positive-evidence.candidates.json` are copied from the currently active P-v2 records, without case rewrites. The new config adds `goal-visualization` to its resource binding, so old text-only/current-old-image fingerprints do not count as a new current gate.

## Active-owner split and provenance

The two old owners were resolved from the Mathematics `positiveEvidenceConfigPaths` in `curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json`. `3f1a97d2` was the entire scope of its B025c owner, so there is no nonempty rest file for it. `8c32d941` and `a7778885` leave six unrelated records in `retained/upper-sec-rest-six.*`; the six JSONL lines are byte-identical to the active source, in source order. The original owners remain untouched. `retained-source-pins.json` records exact old config/review hashes, transferred raw-line hashes and profile fingerprints, and every retained raw-line hash.

The central registry owner replacement is deliberately outside this package. Once the new review is materialized and checked, replace the fully consumed B025c owner and eight-goal owner with this three-goal config and the six-goal rest config in one coordinated registry edit; do not leave overlapping active owners.

## Current materialization and checks

After the three final PNGs were imported, GoalBook `prepare` completed successfully for this three-goal set (reported model SHA-256 `32cf10831f1cba3c77d6c3badc5f0ea7de49fee10d6f29507e53acc69efe570a`, bundle SHA-256 `e52d022ae71aa4da0c0771555feddf45ee41eb85abd645a65e5742bb299cab1c`). A separate byte check confirmed that all three imported canonical and public PNGs match the audited candidates. The candidate materializer then wrote `positive-evidence.review.jsonl` with three current image-bound AI-candidate records. Their current `reviewInputFingerprint` values are `74d3aab76d9bb420a0e8c5d35d1c8c6d0d7858d760ede2c8ec2fc45072d6fe47`, `4b167dd87e30e823c2523eb6d6774286759300a19c1527c15690816fa10922d7`, and `158e996a6507546f8029fa1eb1cc81a8260170b6b837a98af1377954ee773e91`, in config scope order. The three source profile fingerprints remain unchanged.

The following checks all exited 0: candidate materializer verification without `--write`; positive-evidence checker on the new three-goal config (3 `needs_human_review`, 0 blocking); positive-evidence checker on the six-goal rest config (6 `needs_human_review`, 0 blocking); and a byte/hash audit of the three candidate/canonical/public PNG sets, two unchanged old owner config/review pairs, and six retained JSONL lines. The resulting records remain `needs_human_review` / `ai_candidate`, `E1/G1`, with no human approval, review-run IDs, observed learner evidence, or M7 closure.
