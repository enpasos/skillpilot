# Linear Algebra

A SkillPilot course aligned with MIT 18.06. This English pilot covers vector arithmetic and linear systems. Learners enter with the ability to solve a linear equation in one unknown.

- **U0 · Vector arithmetic refresher.** Read and write vector components, compute a displacement from two points, form linear combinations and compute dot products. The short check has a pass mark of 5 of 6.
- **U1 · Linear systems by geometry and elimination.** Read a system in the row and column pictures, solve by elimination and classify its real solutions. The [row picture](static/assets/goal-visualizations/mit-1806/row-picture.svg) and [column picture](static/assets/goal-visualizations/mit-1806/column-picture.svg) show the same teaching example. Pass both closing tasks. *The two pictures and matrix form* requires 13 of 16 points. *Elimination and what it reveals* requires 12 of 15 points.

The [course catalog](json/US_MAS_U_SKILLPILOT_LINEAR_ALGEBRA.en.json) contains the learning goals, unit ownership and released assessments. The [U1 recall deck](json/us_skillpilot_linear_algebra_u1_deck.en.json) and [lecture map](lecture-map.md) are separate.

U1 uses Lecture 2 for row operations and exchanges. It defers elimination matrices and permutation matrices to U3, and matrix–matrix products, inverses and Gauss–Jordan elimination from Lecture 3 to later units. In U1, two different solutions are enough to illustrate the infinitely-many-solutions case. Writing the complete solution family belongs to U5.

## Local pilot

Use this folder as the backend curriculum root with `--skillpilot.curriculum.source=repository` and `--skillpilot.landscapes.directory=/absolute/path/to/18.06-aligned`. The local [curriculum manifest](curriculum_manifest.json) selects this course. Include the course folder on the staged application classpath or copy its `static/` tree into the staged resources root so that the backend can serve both figures. Use the stable backend with a local trial database and Claude configuration.

The pilot has its own course and goal IDs. The existing MIT OpenCourseWare Foundations route remains the entry for the previous course and its stored progress.

[U1 quality card and local coach results](unit-1-quality.md)

## Content licence and attribution

SkillPilot wrote the course graph, explanations, activities, solutions and cards and created the figures. This original course content is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

The external references point to *18.06 Linear Algebra, Spring 2010*, taught by Gilbert Strang and published by MIT OpenCourseWare. Those materials retain MIT OpenCourseWare's [CC BY-NC-SA 4.0 terms](https://ocw.mit.edu/pages/privacy-and-terms-of-use/). SkillPilot is responsible for the course and its assessments. [MIT course](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/) · [MIT lecture videos](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/video_galleries/video-lectures/) · [MIT assignments](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/pages/assignments/)
