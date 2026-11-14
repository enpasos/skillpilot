<div data-sp-content-lang="en" markdown>

# Skill Graph

SkillPilot represents learning goals and their prerequisites as a shared skill graph. Educational programmes organise those stable goals into contextual views and learning units. This section explains both the skill graph and the contracts around it.

## Foundations (Single-Source Compendium)

- **Complete PDF Compendium:**
  [The SkillPilot Graph Definition (English PDF)](skillpilot-graph-definition.en.pdf) — generated from the canonical single source with full mathematics, bilingual illustrations, 145-rule enforcement traffic light (`Ampelschaltung`), and implementation boundaries.
- [Graph Definition — Core (§§1–5)](graph-definition.md):
  formal goals, relations, prerequisites, frontier, and graph-validity conditions.
- [Context, Views, Scope & Goal Types (§§6–10)](context-and-views.en.md):
  canonical layer vs. educational views, personal curriculum scope $L=\mathrm{Closure}(S)$, understanding/memorisation/assessment goals, time context, and evidence boundaries.
- [Learning Units (§§11.1–11.4)](learning-units.md):
  recursively composed educational units, motivational introduction, required outcomes, and completion derived from child units and own obligations; how a unit is represented in the skill landscape (placement layer, curriculum-package contract 1.2) is in [§11.2](learning-units.md#sec-unit-representation).
- [Learning-Unit Progression (§11.5)](learning-unit-progression.md):
  explicit course dependencies, whole-unit ordering, and the separate choice of access policy.
  Decision of 14 November 2026: [Learning units: clusters, `after` and learning flow (DE)](learning-unit-wiring-concept-2026-11-14.md).
- [Optional Acquisition & Time Planning (§12)](planning-and-budget.en.md):
  multi-period acquisition plans, structural prerequisite witnesses, and workload budgets.
- [Assessment-Gated Completion & Implicit Mastery (§13)](assessment-gated-completion.md):
  direct assessment access, transitive minimality, and globally effective recognition through independent application in valid local learning units (implementation pending).
  [Decision of 4 November 2026 (DE)](completion-semantics-clarification-2026-11-04.md).
  Working plan: [Learning Units for Mathematics and Physics (DE)](../../dev/mathematics-physics-learning-units-plan.md); historical: [plan of 5 November 2026 (DE)](../../dev/learning-units-implementation-plan.md).
- [Compendium Appendices (B–F)](compendium-appendix.en.md):
  current implementation status, verification strategy, glossary/symbols, sources, and build reference; for Appendix A see [Rule & Milestone Matrix](../../qa-ci/graph-definition-rule-milestone-matrix.en.md).

## Architecture, Media, Goal Book & Interchange (Single-Source Compendium)

- **Complete PDF Compendium:**
  [Skill Graph Architecture, Media, Goal Book & Package Interchange (English PDF)](skillpilot-skill-graph-architecture.en.pdf)
- [General Goal System and Migration (§1)](general-goal-system-and-migration.md):
  the separation of goals, programmes, placements, competency axes, and views.
- [Node Types (§2)](node-types.md):
  orientation, understanding, memorisation, and assessment goals.
- [View Projection and Goal Placement (§3)](view-projection-and-goal-placement.md):
  explicit curriculum structure, personal learning scope $L$, and scope-specific learner views.
- [Source and Resource Links (§4)](source-and-resource-links.md)
- [Content Integration Architecture (§5)](content-integration.en.md)
- [Human-Readable Source Rationales (§6)](human-readable-source-rationales.md)
- [Atomic Goal Visualizations (§7)](atomic-goal-visualizations.md)
- [Learning-Goal Book and Evidence-Review Pipeline (§8)](learning-goal-book-and-evidence-review-pipeline.md)
- [Teacher Goal Book and Local Time Planning (§9)](teacher-goal-book-time-planning.en.md)
- [Canonical Gymnasium Rollout Policy (§10)](canonical-gymnasium-rollout.md)
- [MEM/FWU Roundtrip Plan (§11)](mem-fwu-roundtrip-plan.md)
- [Dual Curriculum Package Releases (§12)](dual-curriculum-package-releases.en.md):
  JSON runtime and ontology packages, and the runtime contract versions 1.0, 1.1 (`assessmentCompletionV1`), and 1.2 (`learningUnitsV1`, learning units).
- [Learning-Unit Design Criteria and Examples (§13)](learning-unit-design-and-examples.md):
  the purpose of a unit, criteria for meaningful boundaries and assessments, two worked candidates, and the unit validity rules R1–R5 of 11 November 2026 applied to unit design; the representation of a unit is in [Graph Definition §11.2](learning-units.md#sec-unit-representation).
- [Knowledge Context (§14)](knowledge-context.md):
  what a learner can be assumed to know at a goal, derived deterministically from the graph for generation, review, and the coach; the sufficiency of prerequisites as the property the graph must gain. Concept of 13 November 2026, not implemented.

See the [Concept Documentation Index](../index.md) for didactic concepts and runtime workflows, and the [Glossary](../glossary.md) for shared terminology.

## Build Web & PDF Compendia from the Canonical Single Source

All bilingual Web chapters, the 145-rule traffic-light matrix, the bilingual diagrams (`00`, `08`–`16`), and both LuaLaTeX PDFs are compiled from the canonical single sources under `docs/concept/skill-graph/source/` and `docs/concept/skill-graph/architecture-source/` (generated outputs of the Graph Definition are built locally and in CI):

```bash
python3 scripts/build_compendia.py --compendium skill-graph --all
python3 scripts/build_compendia.py --compendium skill-graph-architecture --web-and-tex --pdfs
python3 docs/concept/skill-graph/latex/check-assessment-model.py
```

The [single-source compiler](https://github.com/enpasos/skillpilot/blob/main/docs/concept/skill-graph/build_spec.py) (and compatibility wrapper [latex/build-document.py](latex/build-document.py)) keeps intermediate LaTeX files under `tmp/` and writes the generated Markdown pages, bilingual diagram PNGs, and DE/EN PDFs into `docs/`. Its optional `--texmf` argument accepts a locally unpacked TeX package tree without changing system packages.

The [mathematical reference check](latex/check-assessment-model.py) exercises full transitive prerequisite demand, local recognition, and their boundary cases. It does not implement the runtime feature or establish assessment quality or learner benefit.

</div>

<div data-sp-content-lang="de" markdown>

# Skill-Graph

SkillPilot stellt Lernziele und ihre Voraussetzungen als gemeinsamen Skill-Graph dar. Bildungsprogramme ordnen diese stabilen Lernziele in kontextbezogene Sichten und Lerneinheiten ein. Dieser Bereich erläutert sowohl den Skill-Graph als auch die zugehörigen Fach- und Laufzeitverträge.

## Grundlagen (Single-Source-Kompendium)

- **Vollständiges PDF-Kompendium:**
  [Die Graph-Definition von SkillPilot (Deutsches PDF)](skillpilot-graph-definition.pdf) — erzeugt aus der kanonischen Single-Source mit vollständiger Mathematik, zweisprachigen Illustrationen, 145-Regel-Ampelmatrix und Umsetzungsstand.
- [Graph-Definition — Kern (§§1–5)](graph-definition.de.md):
  formale Lernziele, Relationen, Voraussetzungen, Frontier und Gültigkeitsbedingungen.
- [Kontext, Sichten, Scope & Zielarten (§§6–10)](context-and-views.de.md):
  kanonische Schicht vs. Bildungssichten, persönlicher Curriculum-Scope $L=\mathrm{Closure}(S)$, Verständnis-/Memorier-/Prüfungsziele, Zeitkontext und Nachweisgrenzen.
- [Lerneinheiten (§§11.1–11.4)](learning-units.de.md):
  rekursiv aufgebaute Lerneinheiten, motivierende Hinführung, geforderte Lernergebnisse und aus Untereinheiten sowie eigenen Nachweisen abgeleiteter Abschluss; wie eine Einheit in der Skill-Landschaft dargestellt wird (Platzierungsschicht, Curriculum-Paketvertrag 1.2), steht in [§11.2](learning-units.de.md#sec-unit-representation).
- [Einheitsfolge & Zugang (§11.5)](learning-unit-progression.de.md):
  explizite Kursabhängigkeiten, Blockreihenfolge ganzer Einheiten und die getrennte Richtlinienfrage zur Zugangssteuerung.
  Festlegung vom 14. November 2026: [Lerneinheiten: Cluster, `after` und Lernfluss](learning-unit-wiring-concept-2026-11-14.md).
- [Optionale Erwerbs- & Zeitplanung (§12)](planning-and-budget.de.md):
  mehrperiodige Erwerbspläne, strukturelle Voraussetzungszeugen und Arbeitslastbudgets.
- [Prüfungsgebundener Abschluss & implizite Mastery (§13)](assessment-gated-completion.de.md):
  direkter Prüfungszugang, transitive Minimalität und global wirksame Anerkennung durch selbstständige Anwendung in gültigen lokalen Lerneinheiten (Umsetzung offen).
  [Entscheidung vom 4. November 2026](completion-semantics-clarification-2026-11-04.md).
  Arbeitsplan: [Lerneinheiten für Mathematik und Physik](../../dev/mathematics-physics-learning-units-plan.md); historisch: [Plan vom 5. November 2026](../../dev/learning-units-implementation-plan.md).
- [Kompendiums-Anhänge (B–F)](compendium-appendix.de.md):
  aktueller Umsetzungsstand, Prüfstrategie, Glossar/Symbole, Quellen und Build-Referenz; zu Anhang A siehe die [Regel- & Meilenstein-Matrix](../../qa-ci/graph-definition-rule-milestone-matrix.md).

## Architektur, Medien, Lernzielbuch & Austausch (Single-Source-Kompendium)

- **Vollständiges PDF-Kompendium:**
  [Skill-Graph-Architektur, Medien, Lernzielbuch und Paketaustausch (Deutsches PDF)](skillpilot-skill-graph-architecture.de.pdf)
- [Allgemeines Zielsystem und Migration (§1)](general-goal-system-and-migration.de.md):
  Trennung von Lernzielen, Programmen, Platzierungen, Kompetenzachsen und Sichten.
- [Knotentypen (§2)](node-types.de.md):
  Orientierungs-, Verständnis-, Memorier- und Prüfungsziele.
- [Sichtprojektion und Zielplatzierung (§3)](view-projection-and-goal-placement.de.md):
  explizite Curriculum-Struktur, persönlicher Lern-Scope $L$ und scopegerechte Lernendensichten.
- [Quellen- und Ressourcenlinks (§4)](source-and-resource-links.de.md)
- [Contentanbindung: Architekturrahmen (§5)](content-integration.md)
- [Menschenlesbare Quellenbegründungen (§6)](human-readable-source-rationales.de.md)
- [Visualisierungen atomarer Lernziele (§7)](atomic-goal-visualizations.de.md)
- [Lernzielbuch und Evidence-Review-Pipeline (§8)](learning-goal-book-and-evidence-review-pipeline.de.md)
- [Lernzielbuch und lokale Zeitplanung für Lehrkräfte (§9)](teacher-goal-book-time-planning.md)
- [Kanonische Gymnasium-Rollout-Richtlinie (§10)](canonical-gymnasium-rollout.de.md)
- [MEM/FWU-Roundtrip-Plan (§11)](mem-fwu-roundtrip-plan.de.md)
- [Duale Curriculum-Pakete (§12)](dual-curriculum-package-releases.md):
  JSON-Runtime- und Ontologiepakete sowie die Laufzeitvertragsversionen 1.0, 1.1 (`assessmentCompletionV1`) und 1.2 (`learningUnitsV1`, Lerneinheiten).
- [Entwurfskriterien und Beispiele für Lerneinheiten (§13)](learning-unit-design-and-examples.de.md):
  didaktischer Zweck einer Lerneinheit, Kriterien für sinnvolle Grenzen und Prüfungen, zwei durchgearbeitete Kandidaten sowie die Gültigkeitsregeln R1–R5 vom 11. November 2026; die Darstellung einer Einheit steht in [Graph-Definition §11.2](learning-units.de.md#sec-unit-representation).
- [Wissenskontext (§14)](knowledge-context.de.md):
  was bei Lernenden an einem Ziel vorausgesetzt werden darf, deterministisch aus dem Graphen abgeleitet für Erzeugung, Review und Coach; die Hinlänglichkeit der Voraussetzungen als Eigenschaft, die der Graph gewinnen muss. Konzept vom 13. November 2026, nicht umgesetzt.

Siehe die [Konzept-Übersicht](../index.md) für didaktische Konzepte und Laufzeit-Workflows sowie das [Glossar](../glossary.de.md) für die gemeinsame Terminologie.

## Web- & PDF-Kompendien aus der kanonischen Single-Source bauen

Alle zweisprachigen Web-Kapitel, die 145-Regel-Ampelmatrix, die zweisprachigen Diagramme (`00`, `08`–`16`) und beide LuaLaTeX-PDFs werden aus den kanonischen Single-Sources unter `docs/concept/skill-graph/source/` und `docs/concept/skill-graph/architecture-source/` erzeugt:

```bash
python3 scripts/build_compendia.py --compendium skill-graph --all
python3 scripts/build_compendia.py --compendium skill-graph-architecture --web-and-tex --pdfs
python3 docs/concept/skill-graph/latex/check-assessment-model.py
```

Der [Single-Source-Compiler](https://github.com/enpasos/skillpilot/blob/main/docs/concept/skill-graph/build_spec.py) (sowie der Kompatibilitäts-Wrapper [latex/build-document.py](latex/build-document.py)) legt LaTeX-Zwischendateien unter `tmp/` ab und schreibt die generierten Markdown-Seiten, zweisprachigen Diagramm-PNGs und DE/EN-PDFs nach `docs/`. Mit `--texmf` lässt sich ein lokal entpackter TeX-Paketbaum ohne Änderung der Systempakete nutzen.

Die [mathematische Referenzprüfung](latex/check-assessment-model.py) prüft den vollen transitiven Voraussetzungsbedarf, die lokale Anerkennung und deren Grenzfälle. Sie implementiert weder die Laufzeitfunktion noch belegt sie Aufgabenqualität oder Lernerfolg.

</div>
