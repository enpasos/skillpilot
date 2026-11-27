# U3 quality card · Factorization, permutations and transposes

| Question | State on 27 November 2026 |
|---|---|
| What is the source? | Lecture 4 of 18.06 (Spring 2010), Lecture 5 up to 20:14, where vector spaces begin, and the second half of Lecture 2 for elimination and permutation matrices. The course calendar names session 4 "LU and LDU factorization" and session 5 "Transposes and permutations", with the readings 2.6 and 2.7. The [lecture map](lecture-map.md) gives the caption intervals and the links. Every worked example and task uses SkillPilot's own matrices and settings. |
| What does U3 assume and teach? | U3 assumes from U2 the product by columns and by rows, the order rules and the inverse, and from U1 elimination and back substitution. It teaches elimination matrices and their inverses, the inverse of a product, $A = LU$ and $A = LDU$, the cost of elimination, transposes of products and inverses, permutation matrices, $PA = LU$ and symmetric matrices with $R^{\mathrm T}R$. Vector spaces from the rest of Lecture 5 belong to U4. U3 names no rank, determinant or eigenvalue. Notation follows the lectures and Strang's textbook: $E_{21}$, $\ell_{ij}$, $L$, $D$, $U$, $P$, $A^{\mathrm T}$, bold vectors. |
| Does the graph work? | The course check reached 45/45 nodes from the root, resolved 44 containment and 49 prerequisite references and found no cycle. Every U3 `requires` connects two atoms and is transitively minimal. U3 enters U2 at the product by columns and by rows and at invertibility. Each closing task requires only its last goals, and its `coveredGoalIds` lie in its prerequisite closure. The unit validator reports U3 as valid with 12 owned atoms and, as for the earlier units, reviewed coverage still missing for the 8 understanding goals. The course now has 40 atomic goals, all owned by a unit. |
| Is the unit complete? | U3 has an opening, eight understanding goals, six recall cards and two closing tasks. The scoring trials below check full work, two slips and each omitted goal. Both closing tasks are drafts until a review releases them. U3 has no figure: factors, permutation matrices and transposes are displayed as matrices, and a drawing would only repeat them. [Course and rubrics](json/US_MAS_U_SKILLPILOT_LINEAR_ALGEBRA.en.json) · [Deck](json/us_skillpilot_linear_algebra_u3_deck.en.json) |
| Has a person accepted it? | Not yet. An independent review of the mathematics, the lecture passages, the wording and the licence, and the acceptance by the Product Owner, are pending. |
| Have learners tried it? | Not yet. The adult learner trial on Claude is pending. |
| Can a learner complete it in coach chat? | Not tested for U3. The platform observations of the [U1 quality card](unit-1-quality.md) apply to the course as a whole. A local connector run with U3 is pending. |

## Scoring trials

The step ids of each rubric start with the prefix of the goal they assess, so the weight of a goal is the sum of its steps. Every goal of both tasks carries four points.

| Submitted work | Task 1 · Elimination as $A = LU$, pass at 13/16 | Task 2 · Transposes, permutations and symmetry, pass at 13/16 |
|---|---|---|
| Complete | **16/16.** Finds the multipliers $-3$, $2$ and $-1$, the three elimination matrices, $U$, the order $E_{32}E_{31}E_{21}A = U$ and $E_{32}^{-1}$. Reverses the inverses, shows $(BC)(C^{-1}B^{-1}) = I$ and obtains $C^{-1} = (BC)^{-1}B$. Gives $L$ with a checked row, $D$ with the pivots $1$, $2$ and $3$, and $q = -3$ with its reason. Estimates $7.2 \times 10^7$ and $3.6 \times 10^5$ operations, $16$ seconds and $200$ right-hand sides, and says why $L$ and $U$ are kept. | **16/16.** Compares the shapes $2 \times 2$ and $3 \times 3$, obtains $13$ in both ways and transposes $M^{-1}$ with its reason. Builds $P$, its inverse $P^{\mathrm T}$, the column order 2, 4, 1, 3 and the counts $24$ and $6$. Exchanges rows 1 and 2, gives $L$ and $U$ with a checked row, then $d = 0$ and the row order 2, 3, 1. Finds $a = 4$, $b = -3$, $R^{\mathrm T}R$, $c = -2$ and the one-line proof. |
| Two slips in otherwise complete work | **14/16, pass.** Multiplies $(BC)^{-1}B$ correctly except for the last entry, written as $-1 + 2 = 3$. Writes $600^2$ as $3.6 \times 10^4$. Finds $200$ right-hand sides from $n/3$. Loses the value point of item 2 and the right-hand-side point of item 4. | **14/16, pass.** Evaluates $(1)(1) + (4)(3)$ as $12$ in both computations of the entry. Writes the lower right entry of $R^{\mathrm T}R$ as $c^2 + 9$ and still finds $c = -2$ from the off-diagonal entry. Loses the entry point of item 1 and the product point of item 4. |
| Elimination matrices left out | **12/16, fail.** Item 1 is missing. | — |
| Inverse of a product left out | **12/16, fail.** Item 2 is missing. | — |
| $LU$ and $LDU$ left out | **12/16, fail.** Item 3 is missing. | — |
| Cost of elimination left out | **12/16, fail.** Item 4 is missing. | — |
| Transposes left out | — | **12/16, fail.** Item 1 is missing. |
| Permutation matrices left out | — | **12/16, fail.** Item 2 is missing. |
| $PA = LU$ left out | — | **12/16, fail.** Item 3 is missing. |
| Symmetric matrices left out | — | **12/16, fail.** Item 4 is missing. |

Both pass marks are 13/16 (81.25%). Leaving out any one goal costs four points and fails. Two independent one-point slips leave 14/16 and pass. Both rubrics give method points for correct follow-through from the learner's own earlier values.
