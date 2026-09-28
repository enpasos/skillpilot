# Current-PNG P candidate: Kettenlinien as function models

Goal `164921f6-3bf7-5efc-a438-ea4759dca9ef` and its canonical wording are
unchanged. This standalone `positive-understanding-evidence-v2` record is an
`ai_candidate` with `needs_human_review`, `E1/G1`, and no review-run claim. It
does not claim a learner performance or human approval. The central rollout
configuration now references this candidate; that reference does not approve it.

The source scope is the current canonical German and English goal, whose
`sourceRef` identifies HMKB Kerncurriculum Mathematik gymnasiale Oberstufe,
Q1.3, p. 37, bullet 4, aspect 2. The current canonical and public PNGs both
have SHA-256 `7ce5bdfc29df7f57878c70eccf994320dcc65fb5699bb335db058115e41d3980`.
The image depicts the symmetric unshifted model
`y=a cosh(x/a)+c`, its exponential identity, and given `a=1`/`a=2` curves.
It supplies context, not evidence of independent understanding.

The first new case reverses the model: the learner infers `a=4 m` from the
given second derivative `y''(4)=0.25 m^-1` at a shifted minimum
`(4,2)`, then obtains
`b=4 m`, `c=-2 m`, and predicts both support heights
`4 cosh(1)-2 ≈ 4.172 m`. The second changes the relevant object from the
complete symmetric graph to an installed segment. For
`y=3 cosh((x-4)/3)-1` on `[1,3]`, the full graph's vertex `(4,2)` lies
outside the physical cable; the restricted curve decreases, so its actual
lowest point is the right support `(3, 3 cosh(1/3)-1) ≈ (3,2.168)`.
The left support is at `(1,3 cosh(1)-1) ≈ (1,3.629)`. These are distinct
transfer demands from the image and from the previous P profile's cases.

Current record fingerprints:

- Goal: `sha256:bf9e5f6465d360d13bf6b30c0ebf0a4d53447736c12f966211f2c1b8e49c2c5a`
- Review input including PNG: `sha256:b3544c907c4d182b360e606312b708e91b4471a12eb3296b995ce78888a1715c`
- Profile: `sha256:24c040753dcc543ae80944a0bd073127e84f4adb80f998dac17d70aee3b99c4e`
- Criteria: `sha256:12063457ee847a35af2b29f203ff7dbc9a383f91cf4fafc3a5162015d73a4816`

From `app/`, the repository materializer verifies exact record bytes against
the current candidate, goal, semantic-kind ledger, criteria, and PNG:

```bash
npx tsx scripts/materializePositiveGoalEvidenceCandidates.ts --config curricula/DE/Gymnasium/quality/goal-evidence/m7-q1-catenary-current-png-p-candidate-20260926-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/m7-q1-catenary-current-png-p-candidate-20260926-v1/positive-evidence.candidates.json
npx tsx scripts/positiveGoalEvidenceReview.ts --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-q1-catenary-current-png-p-candidate-20260926-v1/positive-evidence.config.json --mode=check
```

Both commands passed: one current AI candidate, zero blocking issues. These
are local schema and binding checks; they do not adjudicate the mathematics
independently or imply human approval.
