# Content review of the relativity evidence candidates

Reviewed by the coordinating Codex agent, 2026-09-05/06. This is a substantive
AI content review and synthesis, not an independent blind description round,
human approval, runtime activation or evidence about a learner.

## Bound artifacts

Under `curricula/DE/Gymnasium/quality/goal-evidence/`:

- `canonical-physics-positive-understanding-evidence-rollout-v1-batch-033zb-current-carryover-7-v1.candidates.json`:
  `sha256:592c270482d4374b630d62bac34699411913bb41dbdcd909f61e2bb3aa68c0f7`.
- Its registered six-goal subset,
  `canonical-physics-positive-understanding-evidence-rollout-v1-batch-033zb-current-carryover-6-without-existing-mass-v1.review.jsonl`:
  `sha256:b1ac97141cc2318291f8293b835b34265f22e489beeaf8abc988fec996826fc2`.
- `canonical-physics-positive-understanding-evidence-rollout-v1-batch-033zc-gps-rest-energy-2-v1.candidates.json`:
  `sha256:9cbdc388a6d81ffbc9bc17d566f5ad402f9b9ded8bc408f02a7b1258dbd82aa7`.
- `canonical-physics-positive-understanding-evidence-rollout-v1-batch-033zc-gps-rest-energy-2-v1.review.jsonl`:
  `sha256:7f7bc83b7d4f8821dcb9a5ab7b5fb14115b197113604c45039b03b29b93c9bae`.

All nine candidate bodies were read in full in both languages. Six previously
open unchanged goals and two revised goals are registered here. The historical
mass-convention goal `79da5c34-86b2-5c10-9726-9de886ccef7d` was already strictly
complete: its earlier current owner remains registered. The additional profile
is retained only as audit material, not counted or substituted.

## Substantive checks

- Postulates: inertial frames, invariant light speed and independent changed
  cases remain distinct from a claim that every observed velocity is equal.
- Time dilation: proper-time clock and observation frame are explicit;
  particle lifetime examples distinguish statistical mean behavior from an
  assertion about each individual decay.
- Length contraction: simultaneous endpoint measurement in the selected frame
  is distinguished from photographs and physical compression.
- Minkowski diagrams: simultaneity lines and the moving observer's worldline
  are distinct. The second worked case was corrected to express
  `ct_B − ct_A = −2 length units`, with the time difference obtained by
  division by `c`; a length unit is not a time unit.
- Lorentz transformation: for `v=+0.6c`, `gamma=1.25`, the example event
  `(x,t)=(1.5 light-seconds,0)` transforms to
  `(1.875 light-seconds,−1.125 seconds)`. Inverse transformations, the
  negative-frame-velocity example and sign conventions were checked.
- Velocity addition: the stated `0.8c`/`0.6c` relative-velocity case gives
  `5c/13`; the signed inverse case, light-speed limits and classical limit
  were checked. Changed reference frames are meaningful transfer, not only
  replacement numbers.
- Historical mass convention: invariant `m0` remains distinct from
  `m_rel=gamma*m0=E/c²`; momentum sign, total energy and rest energy are
  consistent. This check grants no additional progress for the old owner.
- GPS: clock-rate difference is not clock offset. With a correctly referenced
  receiver clock, a late transmission timestamp gives an underestimated
  travel time/range. An early timestamp gives an overestimate; subtracting
  an old positive-gain correction from an already lagging clock worsens it.
  A numerical position-error claim additionally needs satellite geometry and
  other observations. These are explicitly bounded teaching models, not a
  complete GPS implementation requirement.
- Rest energy: symmetric opposing emission permits a rest-to-rest comparison
  without recoil calculations. The emitting body's invariant mass decreases;
  the isolated complete container retains total rest energy and mass when the
  radiation is absorbed internally. A frame change alone changes neither
  invariant mass nor rest energy of the same physical state.

The two new profiles contain four bilingual qualitative case briefs, explicit
expected performances, meaningful variation and independent transfer. No
additional quantitative general-relativity, reaction or momentum-calculation
competence is imposed. All profiles remain `needs_human_review` /
`ai_candidate`, E1/G1, with no invented review runs. Existing bitmap assets and
their human/AI approval fields are unchanged. Materializer/checker and protected
M6-floor checks pass; these checks do not promote candidates to authority.
