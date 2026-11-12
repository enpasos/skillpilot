# Unit coverage review: dot product through orthogonal projection

Reviewed on 12 November 2026 by Claude Code (Claude Fable 5.2), with an
independent delegated read-only review by Claude Opus 5.5 that was given the
goal, the assessment, the earlier reviews and the design criteria, but no
expected outcome. This is machine content review. It is not human review, a
learner trial or evidence of learning effectiveness.

## Subject of the review

Learning unit `math-dot-product-projection`, revision `2026-11-12-v1`, in the
placement layer of the canonical Mathematics landscape
(`curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`).
It was a candidate when it was reviewed and has been placed since; see
"Placement" below.

- Own ordinary goal `3016ec37-1c2e-47db-83f5-e767923bc97e`, "Definition des
  Skalarprodukts mithilfe orthogonaler Projektionen veranschaulichen".
- Own assessment `e98672c6-871a-5d0b-889c-5afc51040f0d`, "Skalarprodukt über
  eine orthogonale Projektion erklären".

The question is rule R2 of the unit validity rules: do the tasks and the normal
grading of the assessment really test the ordinary goal, so that passing it can
later justify implicit recognition of that goal?

## Decision

**R2 is not satisfied. The unit carries no coverage review.** The unit
is structurally valid (R1, R3, R4), and the validator reports its reviewed
coverage as missing. The goal therefore stays open until it is mastered
explicitly, which is also today's behaviour: implicit recognition is not
implemented.

The [31 October review](../assessment-completion/math-dot-product-projection-2026-10-31.md)
remains valid for what it examined under the earlier concept: that a pass
requires both rubric steps. It did not examine whether a pass demonstrates the
whole goal, and it names the single positive projection example as a limit.

## Findings

Bindings of the reviewed content, in the convention of
`contracts/assessment-completion/v1`:

| Input | SHA-256 |
| --- | --- |
| Task-and-solution object | `ef5e72c9c3e7b7001d25573a436dfd181b8734c33fe974a6a287fb7d05cca19d` |
| Complete scoring object | `ec0e1d9209aa6971e2ecfac05feec8c9ac2fffe00d73b4a64cd1518c4e09771b` |

Verified in the files:

- The pass rule is 10 of 10 points over two rubric steps, "Projektionsvektor
  und senkrechten Rest bestimmt" (4) and "Skalarprodukt über gerichtete
  Projektionslänge erklärt" (6). The two steps cannot compensate each other.
- The backend receives one total of earned points and compares it with the
  pass threshold. Which step earns which points is the coach's judgement
  against the rubric and the sample solution; nothing else enforces it.
- The task gives the vectors (3, 4, 0) and (4, 0, 0), states both relations
  that the learner is asked to illustrate and explain, and defines the angle.
  The sample solution confirms the cosine relation numerically; it contains no
  right-triangle argument and nothing about the sign.
- Task, rubric, pass rule, prerequisite and coverage claim are unchanged in
  substance since the assessment ID was introduced on 30 September 2026; the
  31 October change corrected vector notation only.

Subject-matter judgement of the independent review:

| Component of the goal | Demanded by the task |
| --- | --- |
| Projection onto the direction of an arbitrary second vector, with a perpendicular remainder | Partly: with the second vector on a coordinate axis both can be read off. |
| Projection vector versus signed projection length | Partly: both show the same number here. |
| The product of length and signed projection length as the geometric meaning of the coordinate definition | Partly: here it coincides with a single component product. |
| The cosine relation from the right triangle of vector, projection and remainder | Partly: the relation is given and only checked numerically. |
| Sign: obtuse angle, right angle | Not at all: "vorzeichenbehaftet" appears only as a label. |
| Geometric illustration and explanation in subject language | Partly: requested, not specified. |

Answers that would plausibly earn 10 of 10 while an essential part of the goal
is missing: a pure formula routine at the level of the sample solution; taking
the projection length as unsigned; believing the relation holds only when the
second vector lies on an axis; treating the projection length as "the first
component". Omitting the explanation fails, as the earlier review found.

The decisive reasons are that the axis-aligned second vector turns the link
between coordinate formula and geometry into an identity, that the sign of the
projection is never tested, and that the task supplies the relations it asks
the learner to explain. Restricting the reviewed coverage to acute angles and
axis-aligned vectors is not an option, because it would narrow the meaning of
the goal.

A separate observation, not an R2 defect: a 10 of 10 threshold also fails a
learner for a single arithmetic slip, which the design criteria judge
differently from a missing central understanding.

## Placement

The unit is placed in the canonical file: one `programUnits` entry and two `own`
placements, appended at the end of their lists, without `coverageReviews` and
without `learningUnitCoverage`. Both validators pass (`validate:learning-units`:
the unit valid, reviewed coverage missing for one goal;
`validate:learning-units:offered`: 190 offered membership classes, no finding).
All 1,252 goal objects stay byte-identical, and the file with its learning-unit
layer projected out equals the file before the placement.

A first attempt on the same day was reverted, because the prerequisite-reduction
proofs were bound to the fingerprint of the whole file and five subjects fell
below their protected maturity level. Evidence about goals now binds the
landscape without its learning-unit layer, so the existing proofs verify
unchanged and every protected subject keeps its level. The technical record is
[docs/dev/canonical-math-learning-unit-pilot-binding-review-2026-11-12.md](../../../../../docs/dev/canonical-math-learning-unit-pilot-binding-review-2026-11-12.md).

## What would satisfy R2

The smallest change that keeps the goal's meaning:

1. A second vector that is parallel to no axis and has an integer length, and a
   first vector that forms an obtuse angle with it.
2. A task that does not state the cosine relation but asks the learner to
   justify it from the triangle of vector, projection and remainder, to explain
   the meaning of the negative sign, and to say what happens for an acute and a
   right angle.
3. A rubric that names these criteria separately, with a sample solution that
   contains exactly these arguments, because the coach grades against it.

These changes strengthen the claim. The stronger assessment needs a new
assessment ID; existing passes of `e98672c6-871a-5d0b-889c-5afc51040f0d` are not
upgraded. Authoring it is a change to canonical Mathematics with its own source,
review and binding obligations and is not part of this record.

## Open point on the boundary

The unit was cut along the earlier two-goal pilot. Whether this goal forms a
unit of its own or belongs to a unit that owns the whole cluster
"Skalarprodukt, Orthogonalität und metrische Grundlagen im Raum" is decided when
that block of Mathematics is designed. Until implicit recognition is enabled, a
re-cut affects no learner result.
