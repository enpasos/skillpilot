# U1 quality card · Linear systems by geometry and elimination

| Question | State on 27 November 2026 |
|---|---|
| What is the source? | The lecture map gives caption intervals and starting links for the passages used, plus separate entries for SkillPilot’s own activities. Learners use Strang’s examples in the lessons and different numbers in the tasks. [Lecture map](lecture-map.md) |
| What does U1 assume and teach? | Entry assumes a linear equation in one unknown. U0 provides vector components, linear combinations and dot products. Displacement has its own U0 goal. U1 covers both geometric pictures, matrix notation, matrix–vector multiplication, elimination, substitution and the three possible solution counts. In a consistent singular example the learner gives two witnesses. Parameterizing the whole family belongs in U5. |
| Does the graph work? | The course check reached 20/20 nodes from the root, resolved 19 containment and 27 prerequisite references and found no cycle. Both units are valid and own all 17 atoms. The unit validator reports that reviewed coverage is still missing for four U0 and seven U1 understanding goals. The earlier MIT Foundations course retains its IDs. |
| Is the unit complete? | U1 has an opening, seven understanding goals, five recall cards and two closing tasks. The scoring trials below check each full omission and the treatment of slips. Both tasks and the figures await release. [Course and rubrics](json/US_MAS_U_SKILLPILOT_LINEAR_ALGEBRA.en.json) |
| Has a person accepted it? | The coordinator accepted the design. An independent reader checked the first course draft’s mathematics, captions, wording and licence. This correction addresses the reader’s findings. Coordinator confirmation and Product Owner acceptance as course champion are pending. |
| Have learners tried it? | The adult learner trial on Claude is pending. |
| Can a learner complete it in coach chat? | The local test of the first draft found two missing steps in the ordinary learner route, described below. The revised two-task route and the hosted learner experience remain unverified. |

## Scoring trials

| Submitted work | Task 1 · The two pictures and matrix form, pass at 13/16 | Task 2 · Elimination and what it reveals, pass at 12/15 |
|---|---|---|
| Complete | **16/16.** Shows the lines meet at (3, 1), checks (1, 2, 1) on all three planes, gives the matrix and weighted columns, and obtains (3, 6, 4)ᵀ by rows and by columns. | **15/15.** Clears the first column, repairs the second pivot by swapping, obtains (1, 2, 1) by substitution and explains uniqueness in both pictures. Derives 0 = s − 4. For s = 4, (0, 3, 1) and (3, 0, 1) witness the common line and different weights reaching the same target. For s = 5 the third plane misses the line and the target lies outside the column span. |
| Two slips in otherwise complete work | **14/16, pass.** Writes the unknown vector as a row and miscalculates one row dot product. The method and the independent column calculation are correct. | **13/15, pass.** Omits a pivot label and evaluates y = 3 − 1 as 1. Correctly uses that value to get x = 2 and reports (2, 1, 1) in order. The calculation loses one point at its origin. |
| One goal missing | **12/16, fail.** Omits both computations of Av. Each of the four goals carries four points, so omitting any whole goal gives the same ceiling. | **10/15, fail.** Gives no classification or geometric explanation. Each of the three goals carries five points, so omitting any whole goal gives the same ceiling. |

The three pass marks are 5/6 for U0, 13/16 (81.25%) and 12/15 (80%) for U1. In the U0 trial a learner wrote 2p = (2, −2, 3), then correctly subtracted q from that value to obtain (−1, −2, 2). With the other work correct this earns 5/6. Both U1 rubrics likewise give method points for internally correct follow-through.

## Platform and package observations

In the local Claude connector test on the first draft (`e4d9320e2e`), both Autopilot modes reached eight of ten U1 atoms on the ordinary route. Selecting the unit did not offer its opening. The automatic card step showed an empty box, while explicit deck entry allowed all five cards to be practised and verified. Supplying the opening’s technical ID accounted for a ninth atom. The draft exam stayed locked. Both SVGs returned HTTP 200 and were absent from the coach’s image offers while in draft.

A disposable copy with released exams allowed exam resumption in a fresh session, leaving with an explicit redirect and re-entry. The former single task refused 20/25 and accepted 21/25. The normal route reached nine of ten atoms, and the diagnostic route using the opening ID reached all ten. These measurements predate the split into two tasks.

All course files are under one directory. Repository mode loads the course from a landscape directory and serves the figures from the classpath. The local checks use UnitGraph, the scoped learning-unit validator and the pass-mark rule. Shared CI still discovers the course root through the repository-wide graph/manifest check. The Gymnasium book, card and package pipelines lack a selector for this course. The existing MIT module rule GVR-007 concerns a different framework. An installable standalone course package remains open.
