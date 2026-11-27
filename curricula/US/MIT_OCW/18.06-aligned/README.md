# Linear Algebra

A SkillPilot course aligned with MIT 18.06. This English pilot covers vector arithmetic and linear systems. Learners enter with the ability to solve a linear equation in one unknown.

- **U0 · Vector arithmetic refresher.** Read positions and displacements in the plane and in space, form linear combinations and compute dot products. The short check combines these three skills.
- **U1 · Linear systems by geometry and elimination.** Read a system in two pictures, solve it by elimination and explain why related systems can have one solution, many solutions or none. The [row picture](static/assets/goal-visualizations/mit-1806/row-picture.svg) and [column picture](static/assets/goal-visualizations/mit-1806/column-picture.svg) show the same two-equation system. The closing task uses a three-variable system to test the method. Its pass mark is 21 of 25.

The course stores its [learning goals, unit ownership and assessments](json/US_MAS_U_SKILLPILOT_LINEAR_ALGEBRA.en.json) and its [U1 recall deck](json/us_skillpilot_linear_algebra_u1_deck.en.json) in separate files. Both assessments are drafts pending independent review. The [lecture map](lecture-map.md) pairs goals with the relevant passages and timestamped video links.

## Local pilot

Use this folder as the backend curriculum root with `--skillpilot.curriculum.source=repository` and `--skillpilot.landscapes.directory=/absolute/path/to/18.06-aligned`. The local [curriculum manifest](curriculum_manifest.json) selects this course. Include the course folder on the staged application classpath or copy its `static/` tree into the staged resources root so that the backend can serve both figures. Use the stable backend with a local trial database and Claude configuration.

The pilot has its own course and goal IDs. The existing MIT OpenCourseWare Foundations route remains the entry for the previous course and its stored progress.

[U1 quality card and local coach results](unit-1-quality.md)

## Content licence and attribution

SkillPilot wrote the course graph, explanations, activities, solutions and cards and created the figures. This original course content is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

The external references point to *18.06 Linear Algebra, Spring 2010*, taught by Gilbert Strang and published by MIT OpenCourseWare. Those materials retain MIT OpenCourseWare's [CC BY-NC-SA 4.0 terms](https://ocw.mit.edu/pages/privacy-and-terms-of-use/). SkillPilot is responsible for the course and its assessments. [MIT course](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/) · [MIT lecture videos](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/video_galleries/video-lectures/) · [MIT assignments](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/pages/assignments/)
