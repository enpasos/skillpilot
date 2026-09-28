# Current-PNG P candidate: transformation families

Goal `e33e75e3-eae5-5a09-862f-d1a11176373f` remains unchanged. This
standalone `positive-understanding-evidence-v2` profile is an `ai_candidate`
with `needs_human_review`, `E1/G1`, and no review-run claim. It is not
configured in the central five-gate registry.

Source and scope: current canonical DE/EN wording and the local HMKB
Kerncurriculum Mathematik gymnasiale Oberstufe PDF, Q4.1, p. 51, third bullet
(further known function classes, restricted to pure stretch or shift at basic
GK/LK level). Compression with `0<a<1` is the corresponding positive vertical
scale case. The profile excludes reflections and combined transformations.

Current public and canonical PNG SHA-256:
`3a203619107a9ea6eeb5ba9425ea6330fc6b6d5bf5667f0cd517089dc4c903c4`.
The image correctly contrasts pure horizontal translation and positive
vertical scaling on parabolas. These are orientation examples only. The fresh
learner cases use the square-root function so that a horizontal shift also
moves a domain boundary, whereas vertical scaling leaves it fixed.

Current record fingerprints:

- Goal: `sha256:ce073ff7fdf30b676f209c106235bf115e2295192b2b9332e0272dfb86f86d6e`
- Review input including PNG: `sha256:556b6cf4217b88073b89b148913fdc216798864560c742385665162f3c60aacc`
- Profile: `sha256:a2d070e88ce2679932e5968c900e0e20796948ff2000a74c426c5479a320ba6d`
- Criteria: `sha256:12063457ee847a35af2b29f203ff7dbc9a383f91cf4fafc3a5162015d73a4816`

For `g_a(x)=√(x−a)`, the real domain is `[a,∞)` and the start is `(a,0)`;
for `a=−2` and `a=3`, the second checked points are `(−1,1)` and `(4,1)`.
For `h_a(x)=a√x` with `a>0`, points `(4,1)` and `(4,4)` identify `a=1/2`
and `a=2`; the domain and start stay `[0,∞)` and `(0,0)`.

Targeted checks: the repository materializer verified exact record bytes from
the current candidate and inputs, and `positiveGoalEvidenceReview.ts
--mode=check` reported one current AI candidate and zero blocking issues.
These checks validate schema and bindings; central integration and any
independent content adjudication are separate steps.
