# SkillPilot Didactics, Learning-Plan Status & Course Planning — Canonical Single Source

This directory is the canonical bilingual single source (`DE` / `EN`) for the
**Didactics, Learning-Plan Status & Course Planning** compendium (`didactic` in
`docs/compendia.json`).

## Scope

It unifies the eight active didactic and course-planning specifications into one
cohesive bilingual reference volume (Web Markdown + LuaLaTeX PDF):

1. `01-feynman.{de,en}.md` — Feynman Technique for Learning (`docs/concept/didactic/feynman-rules.{md,de.md}`)
2. `02-frontier-autopilot.{de,en}.md` — Frontier Goal Selection Strategies & Autopilot (`docs/concept/didactic/frontier-goal-selection-strategies-autopilot.{md,de.md}`)
3. `03-learning-velocity.{de,en}.md` — Learning Velocity (`docs/concept/didactic/learning-velocity.{md,de.md}`)
4. `04-unified-learning-plan-status.{de,en}.md` — Unified Backend-Driven Learning-Plan Status (`docs/concept/didactic/unified-learning-plan-status.{md,en.md}`)
5. `05-teacher-goal-book-planning.{de,en}.md` — Learning-Goal Book and Local Time Planning for Teachers (`docs/concept/skill-graph/teacher-goal-book-time-planning.{md,en.md}`)
6. `06-exam-preparation-planning.{de,en}.md` — Exam Material, Task Coverage, and Preparation (`docs/concept/runtime-workflows/exam-preparation-planning.{md,en.md}`)
7. `07-course-plan-update-continuity.{de,en}.md` — Reliable Course Plans Across Curriculum Updates (`docs/concept/runtime-workflows/course-plan-update-continuity.{md,en.md}`)
8. `08-existing-learner-teacher-view.{de,en}.md` — Existing-Learner Teacher View by SkillPilot ID (`docs/concept/runtime-workflows/existing-learner-teacher-view.{md,de.md}`)

Earlier architectural exploration in `docs/concept/didactic/curriculum-time-axis-and-pacing.md`
remains preserved as a standalone background design reference; where older manual
teaching-coverage ideas differ from §§4–8 here, this compendium and the
[Skill-Graph Compendium](../../skill-graph/graph-definition.md) govern.

## Build Commands

```bash
# Regenerate bilingual Web Markdown pages and intermediate LaTeX
python3 scripts/build_compendia.py --compendium didactic --web-and-tex

# Build DE + EN LuaLaTeX PDFs (strict 0-overflow / 0-warning check)
python3 scripts/build_compendia.py --compendium didactic --pdfs
```
