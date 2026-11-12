# Unit coverage review: dot product through orthogonal projection, stronger assessment

Reviewed on 13 November 2026 by Claude Code (Claude Fable 5.2), with two
independent delegated read-only reviews by Claude Opus 5.5. Each reviewer was
given the goal, the draft assessment, the review of 12 November, the design
criteria and the grading instructions of the coach, but no expected outcome.
The second reviewer did not know the first review. This is machine content
review. It is not human review, a learner trial or evidence of learning
effectiveness.

## Subject of the review

Learning unit `math-dot-product-projection`, revision `2026-11-13-v2`, in the
placement layer of the canonical Mathematics landscape
(`curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`).

- Own ordinary goal `3016ec37-1c2e-47db-83f5-e767923bc97e`, "Definition des
  Skalarprodukts mithilfe orthogonaler Projektionen veranschaulichen".
- Own assessment `be48054d-48f7-54c0-8248-d0a462ad6dc9`, "Skalarprodukt über
  die orthogonale Projektion begründen". Its text is
  `curricula/DE/Gymnasium/assessments/mathematik/sekii/q2/dot-projection-signed-20261113-v1/tasks.md`.

The question is rule R2 of the unit validity rules: do the task and the
ordinary grading of the assessment really test the ordinary goal, so that
passing it can later justify implicit recognition of that goal?

The [review of 12 November](math-dot-product-projection-2026-11-12.md) answered
this question with no for the earlier assessment
`e98672c6-871a-5d0b-889c-5afc51040f0d` and named three changes a stronger
assessment would need. The assessment reviewed here was written to make them.

## Decision

**R2 is satisfied for the text bound below.** Both reviewers reached this
verdict for the same final text. The unit carries one coverage review: the
assessment `be48054d-48f7-54c0-8248-d0a462ad6dc9` covers the goal
`3016ec37-1c2e-47db-83f5-e767923bc97e`.

The verdict rests on the judgement that a coach treats the rubric steps and
the explicit demands of the task as binding. The current coach instructions
say so; no observation of real grading supports it yet (see "Limitations").

## Bindings

In the convention of the unit validator (`assessmentReviewRevisions`):

| Input | SHA-256 |
| --- | --- |
| Source file `tasks.md`, complete | `c4cf3a732e02661683552169afdecd1a328b142dbdf5c07f578f168d8122bd06` |
| Task-and-solution object (`taskRevision`) | `12db387541d3a43fb96611d9668780bd4ab6963c38652c74ea412e9df94374fb` |
| Complete scoring object (`rubricRevision`) | `02b4d58d1f8cffbd493da8bc21c2454b2183dbd33dd6b2a70b9e7cffefe7d5a3` |

The grading note is part of the sample solution and therefore of the
task-and-solution object. Any change to task, solution, grading note or rubric
makes the coverage review stale, and the validator reports it.

## What the assessment demands

The vectors are $\vec a=(-3,4,-4)$ and $\vec b=(2,-1,2)$. The second vector is
parallel to no axis and has length 3; the projection of $\vec a$ is $-2\,\vec b$,
so the angle is obtuse. Both reviewers recomputed every number and every step
of the sample solution and found no error. No single sign slip turns the
dot product positive.

| Component of the goal | Demanded by |
| --- | --- |
| Projection onto the direction of an arbitrary second vector, with a perpendicular remainder | Part 1: projection, remainder and proof of orthogonality. |
| Signed projection length versus projection vector, and what the sign means | Part 2: the signed length, the foot of the perpendicular and its position relative to the origin and the tip of $\vec b$. The values $-6$, $6$, $-2$ and $-18$ differ, so each confusion shows. |
| The dot product as length of $\vec b$ times signed projection length, valid in general | Part 3: equation, one sentence in words, and a general justification through the decomposition, in which the remainder contributes nothing. |
| The relation to length and angle from the right triangle, valid for the obtuse position | Part 4: derivation at the triangle for the present position without the cosine formula and without a numerical check, classification of the angle, and the cosine form of the dot product as a conclusion. |
| Sign of the dot product for acute, right and obtuse angles, explained through the projection | Part 5: for each case a geometric reason for where the foot of the perpendicular lies, then the sign. |
| Illustration and explanation in subject language | Parts 2, 3 and 5 require descriptions and explanations in words. A drawing is not required. |

## Ways to pass without the goal that the text closes

The reviewers described concrete answers that could have earned full marks
while an essential part of the goal was missing. The final text excludes each
of them in the task, in the rubric step, or in both:

- a formula routine that takes the relation of part 4 from the cosine formula
  of the prerequisite goal, or only checks it with the given numbers;
- treating the angle between the vectors as an interior angle of the triangle
  in the obtuse position, also when the sign is corrected afterwards;
- answering part 5 through the sign of the cosine and merely naming the
  position of the projection;
- comparing numbers in part 3 instead of justifying the relation;
- an arithmetic slip that makes the projection point along $\vec b$, so that
  the obtuse position is never treated.

The decisive exclusions stand in the rubric steps, not only in the grading
note, because the coach treats the sample solution as a reference and the
rubric as binding.

## Pass rule

The assessment has five rubric steps with 2, 3, 3, 3 and 3 points and is
passed with 14 of 14 points. The backend compares only the total with the
threshold, so a lower threshold would let other points compensate a missing
justification. Each step is awarded completely or not at all.

The design criteria do not demand flawless work. The grading note therefore
lists what costs no points: arithmetic slips with consistent follow-up
working, a slip the learner recognises through the failed orthogonality check,
rounding, equivalent notation, imprecise wording without a subject error, and
special cases or checks the task does not ask for. A requested result or
classification counts as present when it follows unambiguously from the work.
Two demands that at first stood only in the grading note and the rubric were
moved into the task text, so that no hidden pass condition remains.

## How the text came about

| Round | Result |
| --- | --- |
| First reviewer, first draft | R2 only with four changes: part 4 could be bypassed, the grading note left the middle ground open, the sample solution of part 4 went beyond the task, and the foot of the perpendicular was not asked for. |
| First reviewer, second draft | The four changes are met; one line of the sample solution could be read as permission for the acute-only derivation. |
| Second reviewer, second draft, without knowledge of the first review | R2 only with three changes: part 5 answerable through the cosine alone, a sign correction in part 4 not excluded, and the exclusions must stand in the rubric steps. |
| First reviewer, merged text | R2 satisfied; three optional clarifications. |
| Second reviewer, merged text | R2 only with two changes on the fail side: two demands were visible only to the coach. |
| Both reviewers, final text | R2 satisfied. |

## Limitations

1. **Machine review.** No human review, no learner trial and no observation
   of how coaches actually grade. The coach alone awards the points; nothing
   checks per step that the exclusions were applied.
2. **Coach instructions.** The verdict depends on the current rule that
   explicit demands in task and rubric are binding. If the grading
   instructions change, the review must be repeated. One lane tells the coach
   to split partial points within a step; under the all-points rule this
   changes the reported score, not the result.
3. **One task, unlimited retries.** After an attempt the sample solution is
   discussed, and the identical task can be retried. A pass on a retry is not
   independent evidence. The design criteria ask for a fresh variant; none
   exists yet.
4. **Illustration in words.** No drawing is required. In part 5 one sentence
   per case that links the position of the foot of the perpendicular to the
   angle is enough, as is a sketch described in words.
5. **Uneven case coverage.** Only the obtuse position is computed and derived
   in full. The acute and the right angle appear as geometric arguments in
   part 5.
6. **Prescribed path.** The task defines the signed projection length,
   suggests the relation of part 3, prescribes the decomposition and supplies
   the right triangle. It names the cosine formula as the tool that must not
   be used. The evidence is for explaining and justifying along a given path,
   which matches "veranschaulichen und erläutern", not for discovering the
   relation or choosing the model unaided.
7. **Strict pass rule.** Any deduction fails the attempt. Fairness depends on
   the coach applying the list of what costs nothing. A slip that makes the
   projection point along $\vec b$ fails the attempt by design. A wrong
   projection formula is not a slip, but a lenient coach could treat it as
   one.
8. **Not tested.** That the projection depends only on the direction of
   $\vec b$, the symmetry of the dot product, and degenerate cases. Both
   reviewers judged them not essential for this goal.
9. **Entry knowledge outside the prerequisite path.** The task uses
   right-triangle trigonometry, $\cos(180^\circ-\theta)=-\cos\theta$ and the
   orthogonality criterion. They are ordinary entry knowledge at this level
   but do not lie on the goal's `requires` path. Whether a prerequisite is
   missing is a separate subject-review question; no edge was added.

## Ownership

The unit now owns the goal and the assessment reviewed here. The earlier
assessment `e98672c6-871a-5d0b-889c-5afc51040f0d` keeps its ID and stays in the
catalog as a practice task, but it is no longer an own assessment of the unit.
Passes of the earlier assessment are not upgraded: they do not count as passes
of the new one.

Implicit recognition is not implemented. Until it is, the goal is completed
only by its own explicit result, as before.

## Open point on the boundary

Whether this goal forms a unit of its own or belongs to a unit that owns the
whole cluster "Skalarprodukt, Orthogonalität und metrische Grundlagen im Raum"
is still decided when that block of Mathematics is designed. A re-cut changes
the unit revision and does not touch the assessment or this review.
