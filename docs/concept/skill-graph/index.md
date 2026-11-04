# Skill Graph

SkillPilot represents learning goals and their prerequisites as a shared graph.
Educational programmes organise those stable goals into contextual views and
learning stages. This section explains both the graph and the contracts around it.

## Foundations

- [Die Graph-Definition von SkillPilot (PDF)](skillpilot-graph-definition.pdf):
  German technical compendium with the mathematics, diagrams, contextual
  contracts, optional planning profiles and the corrected application-based recognition concept (implementation pending).
  [LaTeX source](skillpilot-graph-definition.tex) and
  [build manifest](skillpilot-graph-definition.build.json) accompany it.
- [Graph Definition](graph-definition.md): formal goals, relations, prerequisites,
  frontier, and graph-validity conditions.
- [Assessment-Gated Completion and Global Mastery](assessment-gated-completion.md):
  direct assessment access, transitive minimality and globally effective
  recognition through independent application in valid local levels.
  [Decision of 4 November 2026](completion-semantics-clarification-2026-11-04.md).
  [Umsetzungsplan](../../dev/assessment-gated-completion-implementation-plan.md):
  historical implementation design, superseded by the 4 November concept.
  Replanning and review of reusable PR work follow concept reconciliation.
- [Curriculum Levels](curriculum-levels.md): ordered learning stages with
  prerequisite-consistent targets and a feasible workload, including school
  years across subjects and the knowledge-building metaphor.
- [Curriculum levels with completion gates](curriculum-level-gates.md) describes
  how a course can use cluster placements as units with local assessment routes,
  required card recall and explicit gates between units.
- [General Goal System and Migration](general-goal-system-and-migration.md):
  the separation of goals, programmes, placements, competency axes, and views.
- [Node Types](node-types.md): understanding, memorisation, and assessment goals.
- [View Projection and Goal Placement](view-projection-and-goal-placement.md):
  explicit curriculum structure and scope-specific learner views.

## Sources, materials, and explanation

- [Source And Resource Links](source-and-resource-links.md)
- [Contentanbindung: Architekturrahmen](content-integration.md)
- [Human-Readable Source Rationales](human-readable-source-rationales.md)
- [Atomic Goal Visualizations](atomic-goal-visualizations.md)
- [Learning-Goal Book and Evidence-Review Pipeline](learning-goal-book-and-evidence-review-pipeline.md)
- [Lernzielbuch und lokale Zeitplanung für Lehrkräfte](teacher-goal-book-time-planning.md)

## Canonical curricula and interchange

- [Canonical Gymnasium Rollout Policy](canonical-gymnasium-rollout.md)
- [Dual Curriculum Package Releases](dual-curriculum-package-releases.md)
- [MEM/FWU Roundtrip Plan](mem-fwu-roundtrip-plan.md)

See the [Concept Documentation Index](../index.md) for didactic concepts and
runtime workflows, and the [Glossary](../glossary.md) for shared terminology.

## Build the German reference

From the repository root, with LuaLaTeX, German language support and the
standard packages named in the document preamble installed:

```bash
python3 docs/concept/skill-graph/latex/build-document.py
python3 docs/concept/skill-graph/latex/check-assessment-model.py
```

The [build script](latex/build-document.py) keeps intermediate files under
`tmp/skill-graph-document/` and writes the PDF and its input-hash manifest
beside the main source. Its optional `--texmf` argument accepts a locally
unpacked TeX package tree without changing system packages. Chapter sources
are in `latex/`; the existing graph illustrations remain under
`assets/graph-definition/`.

The [mathematical reference check](latex/check-assessment-model.py) exercises
full transitive prerequisite demand, local recognition and their boundary cases. It does not implement the
runtime feature or establish assessment quality or learner benefit.
