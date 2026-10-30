# Static coverage review: dot product and orthogonal projection

Reviewed on 30 October 2026 by Codex, GPT-6.1 Sol. This is a machine content,
calculation and policy review. It is not a human review, a learner trial,
provider-host acceptance or evidence of learning effectiveness. Runtime
activation remains disabled by default and requires the implementation's
explicit profile allowlist and applicable release gates.

## Decision and exact scope

The reviewed static rule is suitable for the bounded completion profile
`math-dot-product-projection`, revision `2026-10-30-v1`:

| Role | Canonical goal |
| --- | --- |
| Ordinary target | `3016ec37-1c2e-47db-83f5-e767923bc97e`: Definition des Skalarprodukts mithilfe orthogonaler Projektionen veranschaulichen |
| Required assessment target | `e98672c6-871a-5d0b-889c-5afc51040f0d`: Skalarprodukt über eine orthogonale Projektion erklären |

The authoritative scope references exactly these two atomic goals. It makes no
claim to represent all of Q2, all of analytic geometry, a school year or a
curricular workload budget. Both targets must belong to the learner's committed
Personal Curriculum. A temporary focus cannot remove either obligation.

The single rule has `S = {assessment}` and `W = {ordinary target}`. The complete
prerequisite closure still participates as support; no other prerequisite is
waivable, promoted to a target or marked mastered. In particular, no memory,
orientation or other assessment goal receives a waiver. Ordinary target mastery
alone does not enable the rule. Existing assessment mastery enables it without
an additional personal acceptance decision.

## Content reviewed

The ordinary goal requires using the orthogonal projection of a vector onto
the direction of another vector to illustrate and explain the definition of
the dot product geometrically. The assessment's actual task, embedded solution
and scoring were compared with this description. Its authored `requires` and
`coveredGoalIds` were checked as references, not used as proof of coverage.

The source artifact is
`curricula/DE/Gymnasium/assessments/mathematik/sekii/q2/m7-route-repair-20260929-v1/tasks.md`,
section `dot-projection`. Its task and solution agree with the embedded exam
data. They ask for the following connected work on `a = (3,4,0)` and
`b = (4,0,0)`, with `b` nonzero:

| Required performance | Assessment demand and existing score allocation |
| --- | --- |
| Use an actual orthogonal projection onto the second vector's direction | Determine the projection vector and perpendicular remainder, and check orthogonality: 4 points. |
| Give the geometric meaning of the dot product | Calculate the dot product and illustrate `a·b = |b| s` using the signed projection length `s`: part of the explanatory 6-point step. |
| Explain the projection/angle link in mathematical language | Explain `s = |a| cos(theta)`: explicitly requested within that same 6-point step. |

The task requests geometric illustration and explanation. The ordinary target
does not require a separate software artifact or a particular drawing format;
a coherent vector decomposition and geometric explanation can meet it. Merely
returning a numerical dot product does not meet the task or the ordinary goal.

## Calculation and rubric check

The independent calculation gives:

```text
a·b = 12
b·b = 16
proj_b(a) = (12/16)b = (3,0,0)
a - proj_b(a) = (0,4,0)
(a - proj_b(a))·b = 0
|b| = 4, |a| = 5, s = 3
a·b = |b|s = 4·3 = 12
cos(theta) = 3/5, hence s = |a|cos(theta)
```

The vector calculations and point budget were also checked with exact rational
arithmetic. The score steps sum to `4 + 6 = 10`; `maxPoints` and
`passingPoints` are both 10. Thus the explanatory six-point step cannot be
compensated by correct projection calculations. Under the existing assessment
contract, an incomplete geometric explanation or an omitted requested cosine
relation cannot receive all six points for that step.

Counterexamples considered:

- Correct projection and remainder alone obtain at most four points and fail.
- A numerical result `a·b = 12` without the requested geometric explanation
  does not earn the full explanatory step and fails.
- Quoting formulas without using the projection to explain their geometric
  meaning does not satisfy the requested explanation.
- Another consumer outside this completion scope is not claimed to have its
  preparation discharged. Its global mastery remains unchanged.

This uses the ordinary assessment's current 10/10 contract. It introduces no
higher individual pass threshold, special coverage score, qualifier or
profile-specific grading decision. The backend's current enforcement is a
total-point check; correct per-step grading remains the responsibility of the
existing grading workflow. This review does not claim automatic semantic
verification of a learner's explanation.

## Limits and subsequent changes

The fixed task uses one nondegenerate positive projection example. It does not
demonstrate every orientation, negative projection case, numerical variant or
transfer problem. Its adequacy is judged against this narrow ordinary target
and the existing mastery contract. The rule does not certify broad vector
competence, independent examination conditions or performance under unseen
tasks. Known-solution and repeated-attempt limitations remain those of the
ordinary assessment workflow; no exposure history or extra pass ledger is
introduced.

A changed ordinary goal, assessment task, solution, rubric, pass threshold or
scope needs a new static review and regenerated bound artifacts before the
changed rule is activated. Existing stored mastery is not retrospectively
requalified. Scope completion and waived preparation remain derived results;
they do not create mastery, completion events or global progress credit for
the ordinary target.

## Exact input bindings

File hashes below are SHA-256 over the exact UTF-8 file bytes. Object hashes
use UTF-8 JSON with sorted object keys, `ensure_ascii=False`, separators
`(',', ':')` and no trailing newline. `taskRevision` hashes the object
`{taskContent, solutionContent}` from the assessment's `examData`;
`rubricRevision` hashes its complete `scoring` object. `scopeRevision` hashes
`{scope, targetGoals}`, where `scope` is the parsed authoritative scope artifact
and `targetGoals` contains the complete resolved atomic target goal objects in
ascending canonical-ID order. This also invalidates the authoring review when
an ordinary target's description changes. The scope file's separate byte hash
is recorded below. No learner data are inputs to these hashes.

| Input | SHA-256 |
| --- | --- |
| `completion-scopes/math-dot-product-projection.json` | `1baab5bfe73422d8cf157cfdc63a7c9fedb3ee8bb217ea076d2e38c65bc5f177` |
| Scope-and-target-semantics review binding | `af58f4030c35a81408a322891ca94049f1a942e3fd905300ad74be4f23c48fb6` |
| Canonical Mathematics graph file | `76047cec422c555aacd1e04bff597c4f8a70d8ffed5f214ed7412c828bc34898` |
| Complete ordinary goal object | `35665d27e135be1f00ec5118646a607d3c6a185ce32509e5642b35a1e45c1a3c` |
| Complete assessment goal object | `f97ae8beb4806867fb442a11c9552431935f6737fd45597c07c4d83207b394d9` |
| Task-and-solution object | `76f90293a3918c0526aaf810d4724d77029766b4833994029d262cf1f840d2c7` |
| Complete scoring object | `ec0e1d9209aa6971e2ecfac05feec8c9ac2fffe00d73b4a64cd1518c4e09771b` |
| Complete source task artifact | `7789c28e49e841dcb8af1aed2c28d949944a00a670f9653b138d6a8179e5a3ed` |

The existing Mathematics graph/base-quality gates, canonical applicability
checks, integration tests and actual pilot/host acceptance remain separate.
A successful content review or compiler run does not by itself satisfy them.
