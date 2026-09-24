# Q3 binomial: independent P-v2 AI candidates and pinned five-record remainder

This package splits two goals from the active seven-record Q3 P-v2 owner without
changing that owner or the central registry. `materialize-candidates-and-retention.mjs`
checks SHA-256 of both source files and both moved profile fingerprints. It
retains the other **five review lines byte-for-byte**, with each raw-line hash
recorded in `provenance.json`. The old and new owners must not be registered
together, because that would duplicate P ownership.

The old `aa00edfa-cf8d-500e-994f-7e33a5ebd045` case reproduces all three
probabilities printed in its proposed image. The replacement independently
asks for `X~Bin(5,0.4)`: `P(X=0)=0.07776`, `P(2≤X≤4)=0.6528`, and
`P(X≥2)=0.66304`. The difference `0.01024=P(X=5)` forces event-bound and
context interpretation. The second retained case checks a rare upper tail
with a different context and `p=0.2`. The `aa00` image candidate is visually
acceptable but unbound; this text-only P profile does not review its bytes.

The old `9b6f4d7d-a804-5666-b7ea-85bb3c73da4a` case reproduces the
proposed image's six two-head patterns and `6/16`. Its replacement asks for
exactly one success in four independent trials with `p=0.3`: four disjoint
placements, probability `0.3·0.7³=0.1029` per pattern, and total `0.4116`.
The second case retains the independent `n=5`, `p=0.8`, exactly-four-success
transfer. The proposed `9b6` image is **HOLD** because it asserts `1/16` per
pattern without visibly specifying fair independent tosses. No image is bound
to either P profile; the held image must not be activated on this basis.

All seven package records remain `needs_human_review` / `ai_candidate`,
`E1/G1`, with no human approval or review runs. The official P-v2 checker
reports **2 current, 0 blocking issues** for the revised split and **5 current,
0 blocking issues** for the retained remainder. No canonical, QA, registry,
D-review, or image asset is edited by this package. Central integration and
visualization review remain separate decisions.

Reproduce from the repository root:

```bash
node curricula/DE/Gymnasium/quality/goal-evidence/m7-q3-binomial-independent-p2-20260924-v1/materialize-candidates-and-retention.mjs
npm --prefix app exec -- tsx app/scripts/materializePositiveGoalEvidenceCandidates.ts --config curricula/DE/Gymnasium/quality/goal-evidence/m7-q3-binomial-independent-p2-20260924-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/m7-q3-binomial-independent-p2-20260924-v1/positive-evidence.candidates.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-q3-binomial-independent-p2-20260924-v1/positive-evidence.config.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-q3-binomial-independent-p2-20260924-v1/retained-q3-five.config.json
```
