# Skill Graph

SkillPilot represents learning goals and their prerequisites as a shared graph.
Educational programmes organise those stable goals into contextual views and
learning units. This section explains both the graph and the contracts around it.

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
  recognition through fully qualified immutable assessment proofs. The
  6 November target contract supersedes local remaining-demand inference;
  the [4 November decision](completion-semantics-clarification-2026-11-04.md)
  remains dated history. Runtime migration is pending.
  [Neuer Umsetzungsplan: Lerneinheiten für Mathematik und Physik](../../dev/mathematics-physics-learning-units-plan.md):
  the new plan explicitly revisits recognition using the second proposal,
  then propagates that decision consistently before runtime changes.
  The earlier implementation plan is historical.
- [Learning Units (Lerneinheiten)](learning-units.md): recursively composed
  educational units, a motivational introduction, required outcomes and
  completion derived from child units and own obligations.
- [Lerneinheiten: Zweck, Zuschnitt und Beispiele](learning-unit-design-and-examples.md):
  dependable application before dependent learning, assessment requirements,
  and concrete Physics and Mathematics candidates for discussion.
- [Learning Unit Progression](learning-unit-progression.md): explicit course
  dependencies, whole-unit ordering and the separate choice of access policy.
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
full transitive prerequisite demand, qualified global proof, recursive unit
completion and their boundary cases. It does not validate the actual curricula or implement the
runtime feature or establish assessment quality or learner benefit.
