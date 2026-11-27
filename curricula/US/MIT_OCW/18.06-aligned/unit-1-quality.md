# U1 quality card · Linear systems by geometry and elimination

| Question | State on 27 November 2026 |
|---|---|
| What is the source? | The lecture map gives caption intervals and starting links for the passages used, plus separate entries for SkillPilot’s own activities. Learners use Strang’s examples in the lessons and different numbers in the tasks. [Lecture map](lecture-map.md) |
| What does U1 assume and teach? | Entry assumes a linear equation in one unknown. U0 provides vector components, linear combinations and dot products. Displacement has its own U0 goal. U1 covers both geometric pictures, matrix notation, matrix–vector multiplication, elimination, substitution and the three possible solution counts. In a consistent singular example the learner gives two witnesses. Parameterizing the whole family belongs in U5. |
| Does the graph work? | The course check reached 20/20 nodes from the root, resolved 19 containment and 27 prerequisite references and found no cycle. Both units are valid and own all 17 atoms. The unit validator reports that reviewed coverage is still missing for four U0 and seven U1 understanding goals. The earlier MIT Foundations course retains its IDs. |
| Is the unit complete? | U1 has an opening, seven understanding goals, five recall cards and two closing tasks. The scoring trials below check each full omission and the treatment of slips. The U0 check, both U1 closing tasks and both U1 figures are released. [Course and rubrics](json/US_MAS_U_SKILLPILOT_LINEAR_ALGEBRA.en.json) |
| Has a person accepted it? | An independent reader checked the mathematics, lecture passages, wording and licence of the first draft (`e4d9320e2e`). Claude confirmed the fourteen corrections after recalculating both closing tasks. On 27 November 2026 the Product Owner accepted U0 and U1 as course champion at `686ffebb05`. |
| Have learners tried it? | The adult learner trial on Claude is pending. |
| Can a learner complete it in coach chat? | The local Claude connector recorded all three assessment passes in both Autopilot modes. Learners could select the deck and check their cards. The normal unit-entry and automatic card steps still have the gaps measured below. The hosted learner trial is pending. |

## Scoring trials

| Submitted work | Task 1 · The two pictures and matrix form, pass at 13/16 | Task 2 · Elimination and what it reveals, pass at 12/15 |
|---|---|---|
| Complete | **16/16.** Shows the lines meet at $(3, 1)$, checks $(1, 2, 1)$ on all three planes, gives the matrix and weighted columns, and obtains $(3, 6, 4)$ by rows and by columns. | **15/15.** Clears the first column, repairs the second pivot by swapping, obtains $(1, 2, 1)$ by substitution and explains uniqueness in both pictures. Derives $0 = s - 4$. For $s = 4$, $(0, 3, 1)$ and $(3, 0, 1)$ witness the common line and different weights reaching the same target. For $s = 5$ the third plane misses the line and the target lies outside the column span. |
| Two slips in otherwise complete work | **14/16, pass.** Writes the unknown vector as a row and miscalculates one row dot product. The method and the independent column calculation are correct. | **13/15, pass.** Omits a pivot label and evaluates $y = 3 - 1$ as $1$. Correctly uses that value to get $x = 2$ and reports $(2, 1, 1)$ in order. The calculation loses one point at its origin. |
| One goal missing | **12/16, fail.** Omits both computations of $A\mathbf{v}$. Each of the four goals carries four points, so omitting any whole goal gives the same ceiling. | **10/15, fail.** Gives no classification or geometric explanation. Each of the three goals carries five points, so omitting any whole goal gives the same ceiling. |

The three pass marks are 5/6 for U0, 13/16 (81.25%) and 12/15 (80%) for U1. In the U0 trial a learner wrote $2\mathbf{p} = (2, -2, 3)$, then correctly subtracted $\mathbf{q}$ from that value to obtain $(-1, -2, 2)$. With the other work correct this earns 5/6. Both U1 rubrics likewise give method points for internally correct follow-through.

## Platform and package observations

On 27 November 2026 the local Claude connector used the released catalog and a separate synthetic learner for each route and Autopilot setting. The backend reported the same outcomes with Autopilot on and off.

| Entry route | U0 directly evidenced | U1 directly evidenced | Personal Curriculum result |
|---|---:|---:|---|
| Choices the coach actually offered | 5/6 | 10/11 | Complete. All three assessments passed. The backend waived both unit openings. |
| Diagnostic entry using the two opening IDs | 6/6 | 11/11 | Complete. All 17 atoms had direct evidence. |

Selecting either unit in chat offered its first content goal and skipped its opening. The automatic card step showed an empty box. Unit-scoped practice and recall from an ordinary goal were unavailable. With the deck selected in chat, the learner could practise all five cards, then pass Verified Recall for each. Only Verified Recall marked the deck mastered.

Each assessment kept the learner in the task at one point below the pass mark. At 5/6, 13/16 and 12/15 the backend recorded a pass. In a fresh chat session it restored the first U1 closing task. An explicit redirect let the learner leave for the deck and then return to the task. The test exercised backend scoring with submitted point totals and used the authenticated Claude connector locally. The adult trial in the hosted Claude client remains open.

At the row-picture and column-picture goals the connector offered each figure and returned its image URL. When the course folder was on the backend classpath, both URLs served SVG bytes matching the course files. Loading the course manifest alone produced the same offers but both image requests returned HTTP 404.

## What installing a course into the platform needs today

Register the course ID and the catalog title in `curricula/curriculum_manifest.json` to make the course available in the shared course picker. Keep the course-local manifest for running the pilot on its own. With both manifests present, the repository loader found one Linear Algebra course with 20 goals and five cards.

Each goal, including the three clusters, needs `dimensionTags.phase` for the shared landscape schema. All 20 Linear Algebra goals use `Module`. Serve the two figures from the application classpath as described in the [local pilot instructions](README.md#local-pilot).

The local checks use UnitGraph, the scoped learning-unit validator and the pass-mark rule. The Gymnasium book, card and package pipelines lack a selector for this course. The existing MIT module rule GVR-007 concerns a different framework. An installable standalone course package remains open.
