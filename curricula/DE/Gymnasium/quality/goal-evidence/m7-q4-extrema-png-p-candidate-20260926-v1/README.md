# Current-PNG P candidate: parameter-dependent extrema

Goal `7feaaebd-cc8d-522b-8b3a-ea22675c65dd` remains unchanged. This standalone
`positive-understanding-evidence-v2` profile is an `ai_candidate` with
`needs_human_review`, `E1/G1`, and no review-run claim. It is not configured in
the central five-gate registry.

Source and scope: current canonical DE/EN wording and the local HMKB
Kerncurriculum Mathematik gymnasiale Oberstufe PDF, Q4.1, p. 51, first bullet
(polynomial function families, basic GK/LK level). The legacy source goal also
mentioned inflection points; the current canonical goal is specifically about
extrema. The profile does not assess the sibling inflection competence.

Current public and canonical PNG SHA-256:
`b6febfc994fc347e2ed2c71543b5bca797a2059c7980f92d259eda367cd63920`.
The image's `(x−a)²` minimum and derivative check are sound as one illustrated
case. The new learner cases require independent work with a different
quadratic and a cubic family with a merged stationary point. The image is not
evidence that any learner has performed either case.

Current record fingerprints:

- Goal: `sha256:ce61015b6d8a5eba0de6d9b235aa2234bdaac7858098397a0be6782033289adc`
- Review input including PNG: `sha256:ad7598a381279a3b189177dd5d6d7624f3f81fc233579958210a06bf7f0e1e72`
- Profile: `sha256:873c33cbb7beba90db70f92d96e150769804def0b47fd681b683a130e084dc59`
- Criteria: `sha256:12063457ee847a35af2b29f203ff7dbc9a383f91cf4fafc3a5162015d73a4816`

For the cubic transfer, `q'_a=3x(x−2a)` and `q''_a=6x−6a` give opposite
extremum types at `0` and `2a` for nonzero `a`. At `a=0`, `q'_0=3x²` has no
sign change, so its stationary point is no extremum. For the quadratic,
`p_a(2a)=3−8a²` and `p''_a=4>0` for all real `a`.

Targeted checks: the repository materializer verified exact record bytes from
the current candidate and inputs, and `positiveGoalEvidenceReview.ts
--mode=check` reported one current AI candidate and zero blocking issues.
These checks validate schema and bindings; central integration and any
independent content adjudication are separate steps.
