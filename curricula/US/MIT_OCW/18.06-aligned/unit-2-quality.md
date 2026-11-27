# U2 quality card · Matrix multiplication and inverses

| Question | State on 27 November 2026 |
|---|---|
| What is the source? | Lecture 3 of 18.06 (Spring 2010) and, for the identity matrix and the order rules, the second half of Lecture 2. The course calendar names session 3 "Matrix operations and inverses" with the readings 2.4 and 2.5. The [lecture map](lecture-map.md) gives the caption intervals and the links. Every worked example and task uses SkillPilot's own matrices and settings. |
| What does U2 assume and teach? | U2 assumes the matrix–vector product, elimination, back substitution and the classification of solutions from U1, and the dot product and linear combinations from U0. It teaches the entry and shape of a product, the product by columns and by rows, columns times rows, blocks, the order rules with the identity, the test for invertibility and Gauss–Jordan elimination. Elimination matrices, the inverse of a product, transposes and permutations follow in U3. U2 names no vector space, rank, determinant or eigenvalue. Notation follows the lectures and Strang's textbook: $A\mathbf{x} = \mathbf{b}$, bold vectors, comma form for columns. |
| Does the graph work? | The course check reached 32/32 nodes from the root, resolved 31 containment and 40 prerequisite references and found no cycle. Every U2 `requires` connects two atoms and is transitively minimal. U2 enters U1 at the matrix–vector product and at the classification of solutions. Each closing task requires only its last goals, and its `coveredGoalIds` lie in its prerequisite closure. The unit validator reports U2 as valid with 11 owned atoms and, as for U0 and U1, reviewed coverage still missing for the 7 understanding goals. |
| Is the unit complete? | U2 has an opening, seven understanding goals, six recall cards and two closing tasks. The scoring trials below check full work, two slips and each omitted goal. Both closing tasks are drafts until a review releases them. U2 has no figure: products, blocks and the Gauss–Jordan scheme are shown as displayed matrices, and a drawing would only repeat them. [Course and rubrics](json/US_MAS_U_SKILLPILOT_LINEAR_ALGEBRA.en.json) · [Deck](json/us_skillpilot_linear_algebra_u2_deck.en.json) |
| Has a person accepted it? | Not yet. An independent review of the mathematics, the lecture passages, the wording and the licence, and the acceptance by the Product Owner, are pending. |
| Have learners tried it? | Not yet. The adult learner trial on Claude is pending. |
| Can a learner complete it in coach chat? | Not tested for U2. The platform observations of the [U1 quality card](unit-1-quality.md) apply to the course as a whole. A local connector run with U2 is pending. |

## Scoring trials

The step ids of each rubric start with the prefix of the goal they assess, so the weight of a goal is the sum of its steps. Every goal of task 1 carries four points and every goal of task 2 five points.

| Submitted work | Task 1 · Four ways to multiply, pass at 13/16 | Task 2 · Order rules and inverses, pass at 12/15 |
|---|---|---|
| Complete | **16/16.** Gives the shapes $2 \times 2$ and $3 \times 3$, the entries $-3$ and $4$ and $t = 5$. Writes column 2 of $AB$ as $(2, 7)$ and row 1 as $\begin{bmatrix} 2 & 2 \end{bmatrix}$, adds $\mathbf{w} = (1, 1, 5)$ with its reason, sums the three column-times-row products to $AB$, factors the given matrix as $(3, -2)$ times $\begin{bmatrix} 2 & -1 & 3 \end{bmatrix}$ and explains why the other is no such product. Squares $M$ by blocks and finds $Y = -M_2$. | **15/15.** Finds $s = 0$, gives a diagonal matrix that commutes with $G$, explains the shapes $2 \times 2$ and $3 \times 3$ and regroups $(AB)C = A(BC) = A$. Finds the third pivot $5 - t$, the singular case $t = 5$, $\mathbf{x} = (2, -1, 1)$, the reason and the uniqueness argument. Inverts $M$ for $t = 4$ and checks the first column. |
| Two slips in otherwise complete work | **14/16, pass.** Evaluates the entry of $BA$ as $0 + 4 = 5$. Writes the correct blocks of $M^2$ but copies $2M_2$ into the $4 \times 4$ matrix with $3$ instead of $6$. Finds $Y$ from the blocks. Loses the entry point and the values point at their origins. | **13/15, pass.** Back substitution gives $x = -2$ instead of $2$, so the null vector fails its check. In Gauss–Jordan elimination, row 1 minus $2$ times row 2 gives $-2$ instead of $2$ in the last column. The inverse is read correctly from the shown right half. Loses one point in item 2 and one in item 3. |
| Entry and shape left out | **12/16, fail.** Item 1 is missing. | — |
| Columns and rows left out | **12/16, fail.** Item 2 is missing. | — |
| Columns times rows left out | **12/16, fail.** Item 3 is missing. | — |
| Blocks left out | **12/16, fail.** Item 4 is missing. | — |
| Order rules left out | — | **10/15, fail.** Item 1 is missing. |
| Invertibility left out | — | **10/15, fail.** Item 2 is missing. |
| Gauss–Jordan left out | — | **10/15, fail.** Item 3 is missing. |

The pass marks are 13/16 (81.25%) and 12/15 (80%). Leaving out any one goal costs four or five points and fails. Two independent one-point slips leave 14/16 or 13/15 and pass. Both rubrics give method points for correct follow-through from the learner's own earlier values.
