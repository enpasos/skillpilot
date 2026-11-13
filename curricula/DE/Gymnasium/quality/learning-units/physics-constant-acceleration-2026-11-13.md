# Unit coverage review: modelling motion with constant acceleration

Reviewed on 13 November 2026 by Claude Code (Claude Fable 5.2), with two
independent delegated read-only reviews by Claude Opus 5.5. Each reviewer was
given the goals, the draft assessments, the design criteria and the grading
instructions of the coach, but no expected outcome. Neither reviewer knew the
other's review. This is machine content review. It is not human review, a
learner trial or evidence of learning effectiveness.

## Subject of the review

Learning unit `physics-constant-acceleration`, revision `2026-11-13-v1`, in
the placement layer of the canonical Physics landscape
(`curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`).

Own ordinary goals, both of the introductory phase:

| Short name | Goal |
| --- | --- |
| GA | `e4b38061-1f28-43ad-8371-a3e7c0e81856`, "Gleichmäßig beschleunigte Bewegung und Beschleunigung" |
| GB | `d6dc0e02-831d-4894-a61a-852bcc74f147`, "Modellierung und Idealisierung von Bewegungen" |

Own assessment, written for the unit:
`c5807a37-129e-5df6-8989-482bc7f5683e`, "Senkrechten Wurf mit konstanter
Beschleunigung modellieren" (section `constant-acceleration-model`, 24
points). It requires GB directly and GA through it, and covers both. Its text
is
`curricula/DE/Gymnasium/assessments/physik/e/constant-acceleration-unit-20261113-v1/tasks.md`.

The question is rule R2 of the unit validity rules: do the task and its
ordinary grading really test each ordinary goal, so that passing the
assessment can later justify implicit recognition of that goal?

## Boundary of the unit

The unit follows the main example of the design criteria
(`docs/concept/skill-graph/learning-unit-design-and-examples.md`, section
12.4), "motion with constant acceleration".

- **Promise.** "I can model motion along a line with constant acceleration on
  my own: I fix axis and signs, set up the position and velocity laws with
  their initial conditions and describe the motion in diagrams. I can say
  which simplifications the model makes and where its predictions end."
- **Two goals, one step.** GA is the model, GB is using it: setting up laws
  from a situation, justifying its idealisations and stating its limits. The
  assessment needs both at once, and neither has an application of its own
  without the other.
- **Not in the unit: describing motion.** The three goals before GA in the
  graph (motion in diagrams, uniform motion, average and instantaneous
  velocity) are a step of their own, with their own promise: reading velocity
  as a slope. They are entry competencies here and a candidate unit of their
  own. One of them is an experimental goal (see below).
- **Not in the unit: free fall as an experiment.** The goal
  `09029573-864f-40ca-bf8a-cee7bf6dcb73` ("Freier Fall experimentell
  untersuchen") requires GA and was part of the first draft, with a second
  assessment on measurement data of a described school experiment. Both
  reviewers found R2 not satisfied for it and disagreed on what would
  satisfy it: one holds that the learner must produce own measurement data,
  the other that planning, evaluation and error analysis of a described
  experiment can suffice if the product owner records that reading, and that a
  home experiment cannot be authenticated. How an experimental goal is
  evidenced in a chat with a coach is a product decision for all experimental
  goals; it is recorded as open in the working plan. The goal stays outside
  the unit and is completed by its own explicit result, as before.
- **Not in the unit: safety distances in traffic.** The goal
  `4a2bf015-052b-4af0-aed7-324259fa1a8a` applies both motion models in a
  judgement task and builds on this unit.

## Decision

**R2 is satisfied for the text bound below.** Both reviewers reached this
verdict for GA and GB and for the same final text. The unit carries one
coverage review: the assessment covers GA and GB.

The verdict holds for a first attempt, and it rests on the judgement that a
coach treats the rubric steps and the explicit demands of the task as binding.
The current coach instructions say so; no observation of real grading supports
it yet (see "Limitations").

## Bindings

In the convention of the unit validator (`assessmentReviewRevisions`):

| Input | SHA-256 |
| --- | --- |
| Source file `tasks.md`, complete | `3ceb372921de36f0537d6499289cd898b22cac60041166d3f57d5575f19bbdf6` |
| Task-and-solution object (`taskRevision`) | `45c2c559b0ddf2b4f35060b459438cd9dd22dac456abfc04ef91855538c68324` |
| Complete scoring object (`rubricRevision`) | `dc7256b9a559ea7ec359f8b5c53c377a4b99481628aced62a68b885d71c11ad7` |

The grading note is part of the sample solution and therefore of the
task-and-solution object. Any change to task, solution, grading note or rubric
makes the coverage review stale, and the validator reports it.

## What the assessment demands

A steel ball (3 cm, 110 g) is thrown straight up from a platform 15.0 m above
the ground with 10.0 m/s; the model value of the gravitational acceleration is
10.0 m/s². Both reviewers recomputed every number in each round, including the
variants with 9.8 and 9.81 m/s², and simulated the throw with air drag: the
drag on this ball is about 2 % of its weight at 10 m/s and about 7 % at
20 m/s, and it changes the highest point by a few centimetres.

| Goal | Component of the goal | Demanded by |
| --- | --- | --- |
| GA | Constant acceleration as the same change of velocity in every second | Part 2 |
| GA | Velocity and acceleration as different quantities: slowing down and speeding up from their signs | Part 2 |
| GA | Acceleration is not zero where the velocity is zero, argued from how the velocity changes | Part 3; a justification through gravity alone does not count |
| GA | Position, velocity and acceleration diagrams, each with its form and its points at release, highest point and ground | Part 5, as a description precise enough to draw from |
| GA | The link between the representations: the acceleration as the slope of the velocity line | Part 5 |
| GB | Setting up position and velocity laws from the situation, with initial values and signs | Parts 1 and 6 |
| GB | Transfer to another axis and origin | Part 6: axis downward, origin at the point of release, same impact time |
| GB | Using the laws for predictions and rejecting a solution outside the model | Parts 3 and 4 |
| GB | Justifying the idealisations point mass and no air resistance for this body and this motion | Part 7; repeating a property from the task text does not count |
| GB | Limits of the predictions: the time interval, a body for which the model fails, and the direction of the deviation | Part 7 |

## Ways to pass without the goal that the text closes

The reviewers described concrete answers that could have earned full marks
while an essential part of a goal was missing. The final text excludes each of
them in the task, in the rubric step, or in both:

- never stating that acceleration is the rate of change of velocity: the
  first draft gave the "per second" framing, accepted gravity as the whole
  reason at the highest point, and let the acceleration value be copied from
  part 1 into the diagram;
- a position law with a wrong quadratic term that passed as an arithmetic
  slip, because the rubric named only a "negative quadratic term";
- justifying both idealisations by repeating "small" and "heavy" from the
  task text.

## Unfair fails that the text prevents

- a correct solution of the impact through the highest point, which gives
  another second solution than the rubric named: the task now names the law
  to use;
- times missing from the diagram description, a required "change of sign"
  and the value of the acceleration at the highest point in part 3: each was
  demanded only by the rubric and is now either in the task or removed;
- a body with buoyancy, for which the real height is larger: the task now
  asks for a deviation caused by air resistance;
- several isolated slips, missing plus signs, a missing unit, directions
  instead of signs, a drag comparison in terms of braking instead of force:
  the grading note says what costs nothing, per part.

## Pass rule

The assessment has seven rubric steps with 3, 3, 3, 3, 5, 3 and 4 points and
is passed with 24 of 24 points. The backend compares only the total with the
threshold, so a lower threshold would let other points compensate a whole
missing component, for example the idealisations and limits of part 7, which
are half of GB. Each step is awarded completely or not at all. The task tells
the learner that every requested item is graded. The design criteria do not
demand flawless work; the grading note lists what costs no points. An unpassed
assessment can be repeated any number of times.

## How the text came about

| Round | Result |
| --- | --- |
| Both reviewers, first draft (two assessments, three goals) | GA and GB only with changes: the rate concept was not demanded, several rubric demands were hidden, the idealisations could be justified by echo, and the slip tolerance was unclear. For the free-fall goal R2 was not satisfied; the reviewers disagreed on what would satisfy it. All numbers were correct. |
| Second draft (one assessment, two goals) | The free-fall goal and its assessment are taken out of the unit. The ball has concrete data; part 3 asks for the kinematic argument; part 5 asks for points with times and for the slope link; part 4 names the law; part 7 asks for a deviation caused by air resistance; the grading note states the tolerances per part. |
| Both reviewers, second draft | One required change left, found by both: rubric step 3 demanded the value of the acceleration at the highest point, which the task did not ask for there. |
| Both reviewers, final text | R2 satisfied for GA and GB; no required change. |

## Limitations

1. **Machine review.** No human review, no learner trial and no observation of
   how coaches actually grade. The coach alone awards the points and judges
   equivalent wordings without follow-up questions; a rule learned by rote
   cannot be told from understanding.
2. **Coach instructions.** The verdict depends on the current rule that
   explicit demands in task and rubric are binding. If the grading
   instructions change, the review must be repeated.
3. **One task, unlimited retries.** After an attempt the sample solution is
   discussed, and the identical task can be retried. A pass on a retry is not
   independent evidence. The design criteria ask for a fresh variant; the
   assessment model has one task per assessment ID (see the working plan).
4. **Overlap with the practice task.** The earlier assessment
   `4ab1cf6d-b808-5b86-9291-85df0b9f2496` rehearses the same kinds of
   questions with other numbers. Only the second axis and the idealisations
   are new transfer.
5. **Prescribed paths.** Both axes are given, part 3 names the argument to
   use, and the motion is one type, the vertical throw. Choosing the model
   and the axis unaided is not tested; the design criteria allow that.
6. **Diagrams in words.** The goal says "describe"; no drawing is required. A
   sketch sent as a photo is accepted for the forms and points and can only
   be read coarsely.
7. **Entry knowledge outside the prerequisite path.** The task needs
   quadratic equations, the parabola and its vertex, and the everyday ideas
   of weight and air friction. None of them lies on the `requires` path of GA
   or GB. Whether a prerequisite is missing is a subject-review question; no
   edge was added.
8. **Strict pass rule over seven parts.** A competent learner can fail a first
   attempt through an omission, and each repeat weakens the evidence.
9. **No supervision.** Authorship and outside help cannot be verified.
10. **Offered configurations.** In nine configurations (Baden-Württemberg and
    Bavaria, cross-stage) the two goals are learning targets in sections of
    lower secondary school, and the views there contain neither this
    assessment nor the earlier one. The assessment is written for the
    introductory phase. It was not added to those views, because that would
    be a statement about the level of the goals at the earlier stage. The
    offered-configuration check of the unit validator reports this; in the
    other 90 configurations where the goals are targets the assessment is in
    the learning scope. Until a subject review decides, the unit cannot
    justify recognition in those nine configurations.

## The earlier assessment

`4ab1cf6d-b808-5b86-9291-85df0b9f2496` ("Senkrechter Wurf: Vorzeichen,
Scheitelpunkt und Rückkehr") has 36 single points and is passed with 22. The
highest point with the misconception about the acceleration and all eight
diagram points can be missing. It is therefore not an own assessment of the
unit. It keeps its ID and stays in the catalog as a practice task; passes of
it are not upgraded.

## Ownership

The unit owns GA, GB and the assessment reviewed here. Implicit recognition is
not implemented. Until it is, each goal is completed only by its own explicit
result, as before.
