# Two revised Mathematics goals: current image-bound P-v2

This package binds the revised DE/EN goal descriptions to the existing exact
PNG bytes. It supersedes only the two goals' older P-v2 records in a central
swap; historical packages stay intact. `positive-evidence.review.jsonl` has
two `needs_human_review` / `ai_candidate` E1/G1 records, not human acceptance.

- `0408ac7f…`: The PNG correctly illustrates 2 red and 1 blue ball with
  replacement, three placements of exactly two red hits, and probability
  `4/9`. The independent transfer task changes the success event itself:
  green **or** yellow in a three-color urn. Its five-draw exactly-two result
  is `10(3/5)^2(2/5)^3 = 144/625`, so the learner must form `p` from two
  elementary colors and justify the arrangement count.
- `27bdc580…`: The PNG illustrates a continuous graph with a zero between
  negative and positive values. The first task uses a nonzero intermediate
  value. The second tests a removable hole: `f(x)=x` except `f(0)=2` on
  `[-1,1]`. Despite endpoint values `-1` and `1`, the function never equals
  zero. This directly checks why the old “without a jump” shortcut fails.

The two canonical/public PNG pairs were SHA-256 identical during review:
`a522c90588fefc0b8a112963a693a0531bf4cb9116d2128a69c79e34807b4c53`
and `4d134eb230ac996f76b52ace1b44fa83879b39c788689ac7b2a836e42e3e8f51`.
No image bytes changed. The current QA ledger mirrors both revised German
descriptions and records a fresh AI-only image/text suitability check.

From the repository root:

```bash
./app/node_modules/.bin/tsx app/scripts/materializePositiveGoalEvidenceCandidates.ts --config curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-two-consensus-revised-image-bound-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-two-consensus-revised-image-bound-v1/positive-evidence.candidates.json
./app/node_modules/.bin/tsx app/scripts/positiveGoalEvidenceReview.ts --config=curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-two-consensus-revised-image-bound-v1/positive-evidence.config.json --mode=check
```
