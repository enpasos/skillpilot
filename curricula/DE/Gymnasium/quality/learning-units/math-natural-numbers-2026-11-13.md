# Unit coverage review: understanding and representing natural numbers

Reviewed on 13 November 2026 by Claude Code (Claude Fable 5.2), with two
independent delegated read-only reviews by Claude Opus 5.5. Each reviewer was
given the five goals, the draft assessments, the design criteria and the
grading instructions of the coach, but no expected outcome. Neither reviewer
knew the other's review. This is machine content review. It is not human
review, a learner trial or evidence of learning effectiveness.

## Subject of the review

Learning unit `math-natural-numbers`, revision `2026-11-13-v1`, in the
placement layer of the canonical Mathematics landscape
(`curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`).

Own ordinary goals, all grade 5:

| Short name | Goal |
| --- | --- |
| G1 | `624764d6-becd-5f9b-ada3-0d4f9d143073`, "Dezimalsystem als Stellenwertsystem erklären und vergleichen" |
| G2 | `cf474eab-1379-4877-907e-58b0892ce734`, "Natürliche Zahlen darstellen und am Zahlenstrahl verorten" |
| G3 | `9ef6c4fa-b97a-5d7a-86c1-96690f02d916`, "Natürliche Zahlen ordnen und vergleichen" |
| G4 | `fe07241a-b779-5f35-a82d-7aa51ae74f42`, "Natürliche Zahlen runden" |
| G5 | `1a25ef44-f310-4c23-9ba8-44baec60d3b0`, "Unbegrenztheit der natürlichen Zahlen mit dem Nachfolgerprinzip begründen" |

Own assessments, both written for the unit. Their text is
`curricula/DE/Gymnasium/assessments/mathematik/seki/j5/natural-numbers-unit-20261113-v1/tasks.md`.

| Assessment | Requires directly | Covers |
| --- | --- | --- |
| `49507f95-d079-5113-8aac-1a08299473a3`, "Natürliche Zahlen darstellen, am Zahlenstrahl verorten und ordnen" (section `natural-numbers-order`, 13 points) | G3 | G2, G3 |
| `de7e0bb2-262a-50e7-8398-f91ab1b365ca`, "Stellenwertsystem erklären, runden und Unbegrenztheit begründen" (section `natural-numbers-place-value`, 17 points) | G4, G5 | G1, G4, G5 |

The question is rule R2 of the unit validity rules: do the tasks and their
ordinary grading really test each ordinary goal, so that passing the
assessments can later justify implicit recognition of that goal?

## Boundary of the unit

The unit follows the design sheet of the design criteria
(`docs/concept/skill-graph/learning-unit-design-and-examples.md`, section 12),
which lists these five goals as a candidate and leaves two questions open.

- **Promise.** "I can write natural numbers in digits and in words, locate
  them on the number line, compare them and round them sensibly. I can explain
  how the place-value system is built and justify why there is no largest
  natural number."
- **A unit of its own, not merged with calculating.** The five goals are about
  how numbers are written, placed and compared. The neighbouring goals of the
  cluster are about operations and their relations, a different step with its
  own applications. A unit over both would be held together only by "natural
  numbers" as a heading. What builds on this unit is visible in the graph:
  the four operations in context, integers on the number line, number
  patterns (through G3), fractions (through G1) and inverse operations
  (through G4 and G5).
- **Entry competencies.** G1 and G2 require only the orientation goal
  `65365dce-f33f-49d8-9516-42f75883aa86`, which is not a subject achievement.
  The tasks rely on primary-school knowledge: the place-value chart up to one
  million, and subtraction and division by ten with large round numbers.
- **Two assessments.** The graph has two branches: G2 → G3, and G1 → G4 and
  G1 → G5. Each assessment closes one branch. With the all-points pass rule
  described below, one assessment over all five goals would have had about
  thirty separately required points for an eleven-year-old; two shorter
  assessments keep the rule defensible. Under the recognition rule G2 and G3
  are recognised after the first assessment, and G1, G4 and G5 after the
  second.
- **The edge named in the design criteria.** The requirement from
  "Multiplikation und ganzzahlige Division als Umkehroperationen nutzen"
  (`cafd6520-c4af-4109-9863-cc49ba6fad4d`) to G4 and G5 leaves the unit and is
  not touched here. Whether it is necessary remains a subject-review question.

## Decision

**R2 is satisfied for the text bound below.** Both reviewers reached this
verdict for all five goals and for the same final text. The unit carries two
coverage reviews: the first assessment covers G2 and G3, the second covers G1,
G4 and G5.

The verdict holds for a first attempt, and it rests on the judgement that a
coach treats the rubric steps and the explicit demands of the task as binding.
The current coach instructions say so; no observation of real grading supports
it yet (see "Limitations").

## Bindings

In the convention of the unit validator (`assessmentReviewRevisions`):

| Input | SHA-256 |
| --- | --- |
| Source file `tasks.md`, complete | `c81617b713d72bd1c526acf9869f57ccb88c5b36f613e0e485b1368c7976e28c` |
| First assessment, task-and-solution object (`taskRevision`) | `40fc9b6b892c9c57fe4ffe3f1b176af4156a2605cd84eeb0265fe9b4c0baf62b` |
| First assessment, complete scoring object (`rubricRevision`) | `42d0eefa9aa09834598abbcd393cb67bb7d32364a036a21d65c395b9f7050d1a` |
| Second assessment, task-and-solution object (`taskRevision`) | `581b1057a14955bac6114ff0b65edc9aca7223acb9fda71e0aa34bdefffca777` |
| Second assessment, complete scoring object (`rubricRevision`) | `6d1dd19311b4391bffb2ca3bfa6f74c42076336903bc5e41b3c624d0c6643b7f` |

The grading notes are part of the sample solutions and therefore of the
task-and-solution objects. Any change to a task, solution, grading note or
rubric makes the coverage review stale, and the validator reports it.

## What the assessments demand

Both reviewers recomputed every number, rounding, number word and statement of
both sample solutions, in each round, and found no error.

| Goal | Component of the goal | Demanded by |
| --- | --- | --- |
| G2 | Number word to digits, digits to number word | First assessment, part 1: one conversion in each direction, with zeros inside the number. Written answers only; a number word that contains digits does not count. |
| G2 | Placing numbers on the number line and justifying the position from the scale | Parts 5 and 6: the scale follows from two labels and nine unlabelled ticks between them, so the learner must conclude that there are ten gaps. One number lies on a tick, two lie between ticks on opposite sides of a midpoint; each side must follow from stated numbers. |
| G3 | Ordering by size, with fitting relation signs | Part 2: a chain of four numbers; the learner chooses between "<" and ">". Part 3: one more written comparison. |
| G3 | Comparing with reasons | Part 3: numbers with different numbers of digits, against the misconception "the larger first digit wins". Part 4: numbers with the same digits, compared place by place from the left, with the first differing place. |
| G1 | How the value of a digit depends on its place | Second assessment, part 1: the values of two equal digits and the factor ten between neighbouring places. |
| G1 | Decomposing into place values | Part 1: 39 962 as the sum of the values of its five digits. |
| G1 | Comparing with a given other number system on this structure | Parts 2 and 3: the binary system is given by its rule, not by its place values; the learner derives 16, 8, 4, 2, 1, decodes a number, names what is equal and what differs, and explains from the difference why ten digits are needed in one system and two in the other. |
| G4 | Rounding to a given place | Part 4: tens, hundreds and thousands of a number whose rounding carries over two places. |
| G4 | Meaning of the approximate value | Part 5: the smallest and the largest number with the same rounded value, and what the rounded statement therefore says. |
| G4 | Rounding to a place that fits the context | Part 6: why thousands do not fit the purpose, rounding to a place that does, and the reason why it does. |
| G5 | A larger number for a given number | Part 7: the successor of 999 999 999 999 and what happens to digits and number of places. |
| G5 | Generalising the successor principle | Part 8: a justification through counting on by one, for any number that is named. |

## Ways to pass without the goal that the text closes

The reviewers described concrete answers that could have earned full marks
while an essential part of a goal was missing. The final text excludes each of
them in the task, in the rubric step, or in both:

- writing a correct chain without knowing what "<" means, because the first
  draft prescribed both the direction and the sign;
- dividing by ten on the number line because the first draft stated the number
  of gaps, or giving the calculation without saying that there are ten gaps;
- guessing the side of a midpoint with distances that are rounded until they
  no longer differ, or with an arithmetic slip that reverses the comparison;
- answering part 1 with a mixed form such as "1 Million 90 Tausend 40", or by
  repeating a number word that was read aloud;
- adding up binary place values that the first draft printed;
- naming only a difference in appearance between the two number systems, or
  giving "because one bundles tens" as the whole explanation;
- copying the rounding to thousands from a later task part that showed it;
- a general argument for the absence of a largest number that does not use the
  successor;
- a miscopied number that happens to avoid the hard case, for example a
  rounding without carry.

The decisive exclusions stand in the task text and in the rubric steps, not
only in the grading notes, because the coach treats the sample solution as a
reference and the rubric as binding.

## Unfair fails that the text prevents

The first drafts could also fail a learner who has the goal. The final text
prevents the cases the reviewers found:

- every demand that a rubric step enforces is now visible in the task: naming
  the first differing place, the number of gaps, which concert sold more, the
  successor method, and what happens to digits and places;
- equally correct answers are named as such: a descending chain with ">",
  three neighbouring comparisons instead of a chain, either notation of the
  comparison in part 3, the "less than a million" argument, a summary instead
  of a list of all places, any correct structural feature shared by the two
  number systems, and an explanation without the word "bündeln";
- isolated slips cost nothing where they do not touch the goal: spelling, a
  copy slip when the statement is right for the number of the task, an
  arithmetic slip in a distance or in a rounded difference when the set-up is
  right and the conclusion follows from the stated values.

## Pass rule

The first assessment has six rubric steps with 2, 2, 2, 2, 2 and 3 points and
is passed with 13 of 13 points. The second has eight steps with 2, 2, 3, 2, 2,
3, 1 and 2 points and is passed with 17 of 17 points. The backend compares
only the total with the threshold, so a lower threshold would let other points
compensate a whole missing component: with 15 of 17, for example, the general
argument of part 8 could be left out, which is the core of G5. Each step is
awarded completely or not at all.

The design criteria do not demand flawless work. Each grading note therefore
lists what costs no points, and both reviewers judged the rule acceptable for
grade 5 only together with these lists. An unpassed assessment can be repeated
any number of times.

## How the text came about

| Round | Result |
| --- | --- |
| Both reviewers, first draft (12 and 14 points) | No goal satisfied R2 without changes. Shared findings: the relation sign was prescribed; several demands stood only in the rubric; tolerances for slips were missing. One reviewer added that the number line stated the gap count and that reading the table aloud gives away a number word. All numbers were correct. |
| Second draft (13 and 17 points) | The sign is chosen by the learner; the number line gives nine ticks between the labels; a second number is placed; the binary place values are no longer printed; the rounding and successor parts are split and every rubric demand is in the task. |
| Both reviewers, second draft | G5 satisfied for both, G1 for one. Remaining: an ambiguous copy-slip tolerance; tolerances in part 6 that accepted a side the stated numbers did not support; a rubric step and a grading note that disagreed; a bare calculation accepted for the scale. |
| Both reviewers, third draft | One required change left, found by both: a sentence added to the copy-slip tolerance contradicted the tolerance itself. |
| Both reviewers, final text | R2 satisfied for all five goals; no required change. |

## Limitations

1. **Machine review.** No human review, no learner trial and no observation of
   how coaches actually grade. The coach alone awards the points and judges
   "explained or merely stated" and "slip or missing core" without follow-up
   questions; nothing checks per step that the exclusions were applied.
2. **Coach instructions.** The verdict depends on the current rule that
   explicit demands in task and rubric are binding. If the grading
   instructions change, the review must be repeated.
3. **One task, unlimited retries.** After an attempt the sample solution is
   discussed, and the identical task can be retried. A pass on a retry is not
   independent evidence. The design criteria ask for a fresh variant; the
   assessment model has one task per assessment ID, so variants need a
   contract extension (see the working plan).
4. **Voice presentation.** The task asks the learner to read it and to write
   numbers, number words and relation signs in parts 1 to 3. Nothing stops a
   coach's speech output from reading the table aloud, which gives away the
   number word of part 1; speech recognition can turn number words into
   digits. A text-only presentation would have to be enforced by the platform.
5. **Number line in words.** No drawing is required. The parts test reasoning
   from the scale: the gap, a tick, and the side of a midpoint for two numbers
   that lie 999 and 1 away from it. Marking a point in a picture and
   proportional placement within a gap are not tested.
6. **Thin item base.** One conversion in each direction, one other number
   system, one successor, two or three placements. "Sicher" is inferred from
   single successes, and under the all-points rule each item is a single point
   of failure.
7. **Relation signs.** After the last change neither part requires ">". The
   evidence that the learner knows the signs is the choice of sign in part 2
   and the fitting sign in part 3. Both reviewers judged this sufficient.
8. **Prescribed paths.** The tasks state much of the method: comparing place
   by place from the left, the factor question in part 1, that thousands do
   not fit in part 6, and counting on by one in part 8. No component of a goal
   is dropped, but the evidence is for working along a given path rather than
   for choosing it.
9. **One other number system.** The comparison is between two place-value
   systems. A system without place values, such as Roman numerals, is not
   used; the goal asks for one given system.
10. **Entry knowledge outside the prerequisite path.** The first assessment
    uses place-value language up to one million, although G1 is not a
    prerequisite of G2 or G3; both tasks need subtraction and one division by
    ten. This is primary-school knowledge, own words are accepted, and slips
    there cost nothing. No edge was added.
11. **No per-goal diagnosis.** The backend stores one binary result per
    assessment. A missing G5 argument also keeps G1 and G4 open.
12. **Aids and rendering.** Nothing controls calculators or converters, and
    the numbers depend on the host rendering the formula notation.

## The earlier task

The task `311ab2f2-3364-5166-ac22-3ef01419fee4` ("Aufgabe 1 (Jahrgangsstufe 5,
6 BE)") requires G4 and G5 together with
`191c67db-44a8-4f63-994a-d85e8e301194`, a calculation goal outside this unit.
It has a single rubric step of six points and is passed with three, which the
calculation part alone provides. It is therefore not an own assessment of the
unit. It keeps its ID and stays in the catalog as a practice task; passes of
it are not upgraded.

## Ownership

The unit owns the five goals and the two assessments reviewed here. Implicit
recognition is not implemented. Until it is, each goal is completed only by
its own explicit result, as before.
