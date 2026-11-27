# Linear Algebra

A SkillPilot course aligned with MIT 18.06 Linear Algebra from MIT OpenCourseWare, built around the lectures of Professor Gilbert Strang. This English pilot covers vector arithmetic, linear systems, matrix multiplication and inverses, and the factorizations $A = LU$ and $PA = LU$ with permutations and transposes. Learners enter with the ability to solve a linear equation in one unknown.

- **U0 · Vector arithmetic refresher.** Read and write vector components, compute a displacement from two points, form linear combinations and compute dot products. The short check asks each skill once in reverse and has a pass mark of 10 of 12.
- **U1 · Linear systems by geometry and elimination.** Read a system in the row and column pictures, solve by elimination and classify its real solutions. The [row picture](static/assets/goal-visualizations/mit-1806/row-picture.svg) and [column picture](static/assets/goal-visualizations/mit-1806/column-picture.svg) show the same teaching example. Pass both closing tasks. *The two pictures and matrix form* requires 13 of 16 points. *Elimination and what it reveals* requires 12 of 15 points. Each assessment links matching problems of the MIT problem sets and of Exam 1 as practice; the SkillPilot tasks share their kind of thinking, never their wording or numbers.
- **U2 · Matrix multiplication and inverses.** Compute an entry and the shape of a product, build a product by columns, by rows, as columns times rows and by blocks, use the laws of multiplication, decide whether a square matrix is invertible and compute $A^{-1}$ by Gauss–Jordan elimination. Pass both closing tasks. *Four ways to multiply* requires 13 of 16 points. *Laws of multiplication and inverses* requires 12 of 15 points. Each closing task links matching problems of the MIT problem sets as practice.
- **U3 · Factorization, permutations and transposes.** Write elimination steps as matrices, invert a product, factor $A = LU$ and $A = LDU$, estimate the cost of elimination, transpose products and inverses, use permutation matrices in $PA = LU$ and recognize symmetric matrices. Pass both closing tasks. *Elimination as $A = LU$* requires 13 of 16 points. *Transposes, permutations and symmetry* requires 13 of 16 points. Each closing task links matching problems of the MIT problem sets as practice.

The [course catalog](json/US_MAS_U_SKILLPILOT_LINEAR_ALGEBRA.en.json) contains the learning goals, unit ownership and assessments. The U0 and U1 assessments are released; the U2 and U3 assessments are drafts awaiting review. The recall decks of [U1](json/us_skillpilot_linear_algebra_u1_deck.en.json), [U2](json/us_skillpilot_linear_algebra_u2_deck.en.json) and [U3](json/us_skillpilot_linear_algebra_u3_deck.en.json) and the [lecture map](lecture-map.md) are separate.

U1 uses Lecture 2 for row operations and exchanges. It defers elimination matrices and permutation matrices to U3, and matrix–matrix products, inverses and Gauss–Jordan elimination from Lecture 3 to later units. In U1, two different solutions are enough to illustrate the infinitely-many-solutions case. Writing the complete solution family belongs to U5.

U2 uses Lecture 3 and, for the identity matrix and the laws of matrix multiplication, the second half of Lecture 2. Elimination matrices, the inverse of a product and the transpose follow in U3. U2 has no figure, because the displayed matrices carry the mathematics and a drawing would only repeat them.

U3 uses the second half of Lecture 2 for elimination and permutation matrices, the passage of Lecture 3 that explains Gauss–Jordan elimination by $EA = I$, Lecture 4, and Lecture 5 up to 20:14, where vector spaces begin; they belong to U4. Like U2 it has no figure: factors, permutation matrices and transposes are displayed as matrices.

## Notation

The course keeps the notation of Strang's lectures and renders vectors and matrices as his textbook *Introduction to Linear Algebra* does. It never explains a deviation, because there is none.

- Vectors are bold lowercase letters: $\mathbf{v}$, $\mathbf{x}$, $\mathbf{b}$, the zero vector $\mathbf{0}$, the columns of a matrix $\mathbf{c}_1$. Their components and all other numbers are italic: $x$, $y$, $v_1$, $b_2$, $s$.
- A column vector written in a line uses the comma form $\mathbf{v} = (1, 2)$; it stands for the column, so no transpose sign is used for that purpose. Displayed matrices and columns use square brackets.
- Matrices are capital letters: $A$, $L$, $U$, $P$, $I$, $E_{21}$. The system is $A\mathbf{x} = \mathbf{b}$, the transpose $A^{\mathrm T}$, the inverse $A^{-1}$.

## Identifiers

The goal ids of U2 and of later units are UUIDv5 values with the course's `landscapeId` as namespace and the goal's `shortKey` as name, the scheme already used for the displacement goal of U0 and the second closing task of U1. The card ids of their decks use the name `<deck shortKey>-card-<n>`, numbered in deck order. The other U0 and U1 ids were created earlier and stay unchanged.

## Local pilot

Use this folder as the backend curriculum root with `--skillpilot.curriculum.source=repository` and `--skillpilot.landscapes.directory=/absolute/path/to/18.06-aligned`. The local [curriculum manifest](curriculum_manifest.json) selects this course. Include the course folder on the staged application classpath or copy its `static/` tree into the staged resources root so that the backend can serve both figures. Use the stable backend with a local trial database and Claude configuration.

The pilot has its own course and goal IDs. The existing MIT OpenCourseWare Foundations route remains the entry for the previous course and its stored progress.

[U1 quality card and local coach results](unit-1-quality.md) · [U2 quality card](unit-2-quality.md) · [U3 quality card](unit-3-quality.md)

## Content licence and attribution

SkillPilot is not affiliated with MIT, and MIT does not endorse this course. The course names MIT 18.06 and MIT OpenCourseWare only to credit the lectures it links to.

**Rules for this course (CC BY-NC-SA 4.0, strictly):**

- **Links only.** No text, problem, solution, figure, transcript or caption of MIT OpenCourseWare enters SkillPilot's data, also not as a close paraphrase or a translation. A task of SkillPilot may share the kind of thinking of an MIT problem, never its wording, numbers, example systems or figures; anything closer would be an adaptation under ShareAlike.
- **Attribution with every link.** Each link record names the title of the MIT resource, the provider "MIT OpenCourseWare", the OCW web address and the licence "CC BY-NC-SA 4.0"; the Cockpit shows provider and licence beside the linked material and links the licence. The practice links of the assessments also carry the full attribution with the licence address in their description, because the coach passes it on in chat. They name topics in keywords and never restate an MIT problem.
- **No endorsement.** The MIT name appears only as credit ("aligned with MIT 18.06"), never as a seal, logo or claim of partnership.
- **Non-commercial.** The course and every page that links OCW material stay free of charge; SkillPilot sells nothing built on OCW material.
- **Local copies stay local.** The downloaded OCW copy under `curricula/US/MIT_OCW/input/` is ignored by Git and is used only to find time stamps and problem numbers.

On 27 November 2026 every tracked file under `curricula/US/MIT_OCW/` was compared with the local OCW copy of 18.06 (lecture notes, problem sets, exams, captions): no sequence of more than eleven words is shared, and the longest shared sequences are lecture titles used for credit.

The same comparison after U2 and U3 were added, with the TeX markup removed from their goals, tasks, solutions and cards, finds one shared sequence of eight words, the standard statement that an elimination step subtracts $\ell_{ij}$ times row $j$ from row $i$, and nothing longer. The only other shared runs are lecture titles used for credit and the entries $0$ and $1$ of identity and permutation matrices, at most 13 in a row.

SkillPilot wrote the course graph, explanations, activities, solutions and cards and created the figures. This original course content is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

The external references point to *18.06 Linear Algebra, Spring 2010*, taught by Gilbert Strang and published by MIT OpenCourseWare. Those materials retain MIT OpenCourseWare's [terms of use](https://ocw.mit.edu/pages/privacy-and-terms-of-use/) under the [CC BY-NC-SA 4.0 licence](https://creativecommons.org/licenses/by-nc-sa/4.0/). SkillPilot is responsible for the course and its assessments. [MIT course](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/) · [MIT lecture videos](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/video_galleries/video-lectures/) · [MIT assignments](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/pages/assignments/)
