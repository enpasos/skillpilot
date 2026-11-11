# Skill Graph

SkillPilot represents learning goals and their prerequisites as a shared graph.
Educational programmes organise those stable goals into contextual views and
learning units. This section explains both the graph and the contracts around it.

## Foundations (Single-Source Compendium, EN & DE)

- **Complete PDF Compendia:**
  [The SkillPilot Graph Definition (English PDF)](skillpilot-graph-definition.en.pdf) ·
  [Die Graph-Definition von SkillPilot (Deutsches PDF)](skillpilot-graph-definition.pdf) —
  generated from the canonical single source with full mathematics, bilingual illustrations,
  145-rule enforcement traffic light (`Ampelschaltung`), and implementation boundaries.
- [Graph Definition — Core (§§1–5, EN)](graph-definition.md) · [Deutsch (DE)](graph-definition.de.md):
  formal goals, relations, prerequisites, frontier, and graph-validity conditions.
- [Context, Views, Scope & Goal Types (§§6–10, EN)](context-and-views.en.md) · [Deutsch (DE)](context-and-views.de.md):
  canonical layer vs. educational views, personal curriculum scope $L=\mathrm{Closure}(S)$,
  understanding/memorisation/assessment goals, time context, and evidence boundaries.
- [Learning Units (§§11.1–11.4, EN)](learning-units.md) · [Deutsch (DE)](learning-units.de.md):
  recursively composed educational units, motivational introduction, required outcomes,
  and completion derived from child units and own obligations.
- [Learning-Unit Progression (§11.5, EN)](learning-unit-progression.md) · [Deutsch (DE)](learning-unit-progression.de.md):
  explicit course dependencies, whole-unit ordering, and the separate choice of access policy.
- [Learning-Unit Design Criteria and Examples](learning-unit-design-and-examples.md):
  the purpose of a unit, criteria for meaningful boundaries and assessments, two worked
  candidates, and the unit validity rules R1–R5 of 11 November 2026 applied to unit design.
- [Optional Acquisition & Time Planning (§12, EN)](planning-and-budget.en.md) · [Deutsch (DE)](planning-and-budget.de.md):
  multi-period acquisition plans, structural prerequisite witnesses, and workload budgets.
- [Assessment-Gated Completion & Implicit Mastery (§13, EN)](assessment-gated-completion.md) · [Deutsch (DE)](assessment-gated-completion.de.md):
  direct assessment access, transitive minimality, and globally effective recognition
  through independent application in valid local learning units (implementation pending).
  [Decision of 4 November 2026](completion-semantics-clarification-2026-11-04.md).
  [Umsetzungsplan: Lerneinheiten und integrierte Lernkarte](../../dev/learning-units-implementation-plan.md).
- [Compendium Appendices (B–F, EN)](compendium-appendix.en.md) · [Deutsch (DE)](compendium-appendix.de.md):
  current implementation status, verification strategy, glossary/symbols, sources, and build reference;
  for Appendix A see [Rule & Milestone Matrix (DE)](../../qa-ci/graph-definition-rule-milestone-matrix.md) ·
  [English (EN)](../../qa-ci/graph-definition-rule-milestone-matrix.en.md).
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

## Build Web & PDF Compendia from the Canonical Single Source

All bilingual Web chapters, the 145-rule traffic-light matrix, the bilingual diagrams
(`00`, `08`–`16`), and both LuaLaTeX PDFs are compiled from the canonical single source
under `docs/concept/skill-graph/source/` (only sources and static original illustrations
`01`–`07` are tracked in Git; generated outputs are built locally and in CI):

```bash
python3 docs/concept/skill-graph/build_spec.py --web-and-tex
python3 docs/concept/skill-graph/build_spec.py --all
python3 docs/concept/skill-graph/latex/check-assessment-model.py
```

The [single-source compiler](https://github.com/enpasos/skillpilot/blob/main/docs/concept/skill-graph/build_spec.py)
(and compatibility wrapper [latex/build-document.py](latex/build-document.py)) keeps intermediate
LaTeX files under `tmp/skill-graph-document/` and writes the generated Markdown pages,
bilingual diagram PNGs, and DE/EN PDFs into `docs/`. Its optional `--texmf` argument
accepts a locally unpacked TeX package tree without changing system packages.

The [mathematical reference check](latex/check-assessment-model.py) exercises
full transitive prerequisite demand, local recognition and their boundary cases. It does not implement the
runtime feature or establish assessment quality or learner benefit.
