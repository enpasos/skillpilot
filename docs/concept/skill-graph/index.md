<div data-sp-content-lang="en" markdown>

# Skill Graph

SkillPilot represents learning goals and their prerequisites as a shared skill graph. Educational programmes organise those stable goals into contextual views, plan units, and subject learning units. This section explains both the skill graph and the contracts around it.

Sections 11 and 13 distinguish the recognition contract in force since 4/11 November from the proposal of 19 November. The latter and the proposed Hessian E.1 assessment await a decision.

## Foundations (Single-Source Compendium — Volume I)

- **Complete PDF Compendium:**
  [The SkillPilot Graph Definition (English PDF)](skillpilot-graph-definition.en.pdf) — generated from the canonical single source with full mathematics, bilingual illustrations, rule enforcement traffic light (`Ampelschaltung`), and implementation boundaries.
- [Graph Definition — Core (§§1–5)](graph-definition.md):
  formal goals, relations, prerequisites, frontier, and graph-validity conditions.
- [Context, Views, Scope & Goal Types (§§6–10)](context-and-views.en.md):
  canonical layer vs. educational views, shared Land/duration plan authority, carried-in vs. placed-in semantics, goal tree vs. learner map, personal curriculum scope $L=\mathrm{Closure}(S)$, orientation/understanding/memorisation/assessment goals, and evidence boundaries.
- [Declared Units: Structure & Completion (§§11.1–11.4)](learning-units.md):
  Learning promises, entry, required components and two ways to qualify in units with final assessments.
- [Unit Ordering, Rules E1–E4 & Unit-by-Unit Mode (§11.5)](learning-unit-progression.md):
  sibling `after` ordering without access locks, binding rules E1–E4 across subject and plan units, cross-Land leaf wholeness, and the target [“Unit by Unit” learning mode](learning-unit-progression.md#sec-unit-by-unit).
  Decision record & rollout plan (`F1`–`F13`): [Learning units: clusters, `after` and learning flow (DE)](learning-unit-wiring-concept-2026-11-14.md).
  Concept draft of 17 November 2026, not decided: [Learning units: motivation at the start, assessments at the end (DE)](learning-unit-motivation-concept-2026-11-17.md).
  [What does passing a learning unit demonstrate? (DE)](unit-assessment-discussion-2026-11-19.de.md) explores direct entry and representative final assessments in a discussion paper for expert review.
- [Optional Acquisition & Time Planning (§12)](planning-and-budget.en.md):
  dated multi-period schedules, structural completion witnesses, workload budgets, and the boundary to binding plan units.
- [Recognition through local assessments (§13)](assessment-gated-completion.md):
  The contract in force defines recognition of ordinary goals under R1–R5. The proposal of 19 November introduces a judgement about the unit as a whole.
  Historical decision records: [4 November 2026 (DE)](completion-semantics-clarification-2026-11-04.md); working plans: [Stage-Plan & Units Handover (DE)](../../dev/stage-plan-units-handover-2026-11-15.md), [Learning Units for Mathematics and Physics (DE)](../../dev/mathematics-physics-learning-units-plan.md).
- [Compendium Appendices (B–F)](compendium-appendix.en.md):
  current implementation status, verification strategy, glossary/symbols, sources, and build reference; for Appendix A see [Rule & Milestone Matrix](../../qa-ci/graph-definition-rule-milestone-matrix.en.md).

## Architecture, Media, Goal Book & Interchange (Single-Source Compendium — Volume Ia)

- **Complete PDF Compendium:**
  [Skill Graph Architecture, Media, Goal Book & Package Interchange (English PDF)](skillpilot-skill-graph-architecture.en.pdf)
- [General Goal System and Incremental Migration (§1)](general-goal-system-and-migration.md):
  separation of goals, declared cluster units & plan units, placements, competency axes, and goal-tree / learner-map projections.
- [Node Types (§2)](node-types.md):
  orientation, understanding, memorisation (SM-2 + Verified Recall), and assessment goals (recognition exams vs. standalone practice/Abitur tasks).
- [View Projection and Goal Placement (§3)](view-projection-and-goal-placement.md):
  five view families including the learner map, shared Land/duration plan authority, carried-in vs. placed-in & earliest-need preparation in $L$, and E1–E4 unit projection rules.
- [Source and Resource Links (§4)](source-and-resource-links.md)
- [Content Integration Architecture (§5)](content-integration.en.md)
- [Human-Readable Source Rationales (§6)](human-readable-source-rationales.md)
- [Atomic Goal Visualizations (§7)](atomic-goal-visualizations.md)
- [Learning-Goal Book and Evidence-Review Pipeline (§8)](learning-goal-book-and-evidence-review-pipeline.md)
  (for teacher timeline planning on top of the GoalBook, see [Teacher Goal-Book Time Planning](teacher-goal-book-time-planning.en.md) in Volume II).
- [Canonical Gymnasium Rollout Policy (§9)](canonical-gymnasium-rollout.md)
- [MEM/FWU Roundtrip Plan (§10)](mem-fwu-roundtrip-plan.md)
- [Dual Curriculum Package Releases (§11)](dual-curriculum-package-releases.en.md):
  JSON runtime and ontology packages, runtime contracts 1.0, 1.1 (`assessmentCompletionV1`), and 1.2 (`learningUnitsV1`), plus the boundary to the `v1.3` stage-plan foundation and cluster-unit carrier (`F8`).
- [Learning-Unit Design Criteria and Examples (§12)](learning-unit-design-and-examples.md):
  How to turn a learning promise into tasks and passing criteria, with the nested Hessian kinematics unit E.1 as a worked case.
- [Knowledge Context (§13)](knowledge-context.md):
  what a learner can be assumed to know at a goal ($W(g)$), the interface interplay of `requires` and `after`, and prerequisite sufficiency as the property the graph must gain.

See the [Concept Documentation Index](../index.md) for didactic concepts and runtime workflows, and the [Glossary](../glossary.md) for shared terminology.

## Build Web & PDF Compendia from the Canonical Single Source

All bilingual Web chapters, the rule traffic-light matrix, the bilingual diagrams (`00`, `08`–`18`), and both LuaLaTeX PDFs are compiled from the canonical single sources under `docs/concept/skill-graph/source/` and `docs/concept/skill-graph/architecture-source/`:

```bash
python3 scripts/build_compendia.py --compendium skill-graph --all
python3 scripts/build_compendia.py --compendium skill-graph-architecture --web-and-tex --pdfs
python3 docs/concept/skill-graph/latex/check-assessment-model.py
```

The [single-source compiler](https://github.com/enpasos/skillpilot/blob/main/docs/concept/skill-graph/build_spec.py) (and compatibility wrapper [latex/build-document.py](latex/build-document.py)) keeps intermediate LaTeX files under `tmp/` and writes the generated Markdown pages, bilingual diagram PNGs, and DE/EN PDFs into `docs/`. Its optional `--texmf` argument accepts a locally unpacked TeX package tree without changing system packages.

The [reference checks](latex/check-assessment-model.py) cover the four-part E.1 example and the recognition rules in force.

</div>

<div data-sp-content-lang="de" markdown>

# Skill-Graph

SkillPilot stellt Lernziele und ihre Voraussetzungen als gemeinsamen Skill-Graph dar. Bildungsprogramme ordnen diese stabilen Lernziele in kontextbezogene Sichten, Planeinheiten und fachliche Lerneinheiten ein. Dieser Bereich erläutert sowohl den Skill-Graph als auch die zugehörigen Fach- und Laufzeitverträge.

Die §§11 und 13 unterscheiden den geltenden Anerkennungsvertrag vom 4./11. November vom Vorschlag des 19. November. Zur Entscheidung stehen die vorgeschlagene Abschlussregel und die fachliche Eignung der E.1-Prüfungen.

## Grundlagen (Single-Source-Kompendium — Band I)

- **Vollständiges PDF-Kompendium:**
  [Die Graph-Definition von SkillPilot (Deutsches PDF)](skillpilot-graph-definition.pdf) — erzeugt aus der kanonischen Single-Source mit vollständiger Mathematik, zweisprachigen Illustrationen, Regel-Ampelmatrix und Umsetzungsstand.
- [Graph-Definition — Kern (§§1–5)](graph-definition.de.md):
  formale Lernziele, Relationen, Voraussetzungen, Frontier und Gültigkeitsbedingungen.
- [Kontext, Sichten, Scope & Zielarten (§§6–10)](context-and-views.de.md):
  kanonische Schicht vs. Bildungssichten, gemeinsame Landes-/Dauer-Planautorität, *geführt in* vs. *steht in*, Lernzielbaum vs. Lernkarte, persönlicher Curriculum-Scope $L=\mathrm{Closure}(S)$, Orientierungs-/Verständnis-/Memorier-/Prüfungsziele und Nachweisgrenzen.
- [Erklärte Einheiten: Gliederung & Abschluss (§§11.1–11.4)](learning-units.de.md):
  Lernversprechen, Einstieg, Pflichtbestandteile und zwei Wege zum Nachweis bei Einheiten mit Abschlussprüfung.
- [Einheitsordnung, Regeln E1–E4 & Lernweise „Einheit für Einheit“ (§11.5)](learning-unit-progression.de.md):
  Geschwisterfolge `after` ohne Zugangssperren, verbindliche Ordnungsregeln E1–E4 für Fach- und Planeinheiten, länderübergreifende Blatt-Ganzheit sowie die Ziel-Lernweise [„Einheit für Einheit“](learning-unit-progression.de.md#sec-unit-by-unit).
  Entscheidungsprotokoll & Einführungsplan (`F1`–`F13`): [Lerneinheiten: Cluster, `after` und Lernfluss](learning-unit-wiring-concept-2026-11-14.md).
  Konzeptentwurf vom 17. November 2026, nicht beschlossen: [Lerneinheiten: Motivation am Anfang, Prüfungen am Ende](learning-unit-motivation-concept-2026-11-17.md).
  Das Arbeitspapier [Was weist der Abschluss einer Lerneinheit nach?](unit-assessment-discussion-2026-11-19.de.md) stellt den freien Einstieg und repräsentative Einheitenprüfungen zur Diskussion.
- [Optionale Erwerbs- & Zeitplanung (§12)](planning-and-budget.de.md):
  datierte mehrperiodige Erwerbspläne, strukturelle Abschlusszeugen, Arbeitslastbudgets und Abgrenzung zu verbindlichen Planeinheiten.
- [Anerkennung durch lokale Prüfungen (§13)](assessment-gated-completion.de.md):
  Der geltende Vertrag definiert die Anerkennung gewöhnlicher Ziele nach R1–R5. Der Vorschlag vom 19. November führt ein Urteil über die Einheit als Ganzes ein.
  Historische Entscheidungsdokumente: [4. November 2026](completion-semantics-clarification-2026-11-04.md); Arbeitspläne: [Übergabe Stufenpläne & Einheiten](../../dev/stage-plan-units-handover-2026-11-15.md), [Lerneinheiten für Mathematik und Physik](../../dev/mathematics-physics-learning-units-plan.md).
- [Kompendiums-Anhänge (B–F)](compendium-appendix.de.md):
  aktueller Umsetzungsstand, Prüfstrategie, Glossar/Symbole, Quellen und Build-Referenz; zu Anhang A siehe die [Regel- & Meilenstein-Matrix](../../qa-ci/graph-definition-rule-milestone-matrix.md).

## Architektur, Medien, Lernzielbuch & Austausch (Single-Source-Kompendium — Band Ia)

- **Vollständiges PDF-Kompendium:**
  [Skill-Graph-Architektur, Medien, Lernzielbuch und Paketaustausch (Deutsches PDF)](skillpilot-skill-graph-architecture.de.pdf)
- [Allgemeines Zielsystem und schrittweise Migration (§1)](general-goal-system-and-migration.de.md):
  Trennung von Lernzielen, erklärten Cluster- und Planeinheiten, Platzierungen, Kompetenzachsen sowie Lernzielbaum und Lernkarte.
- [Knotentypen (§2)](node-types.de.md):
  Orientierungs-, Verständnis-, Memorier- (SM-2 + Verified Recall) und Prüfungsziele (eigene Anerkennungsprüfungen vs. freie Übungs-/Abituraufgaben).
- [Sichtenprojektion und Goal-Placement (§3)](view-projection-and-goal-placement.de.md):
  fünf Sichtenfamilien inkl. Lernkarte, gemeinsame Landes-/Dauer-Planautorität, *geführt in* vs. *steht in* samt frühestem Bedarf in $L$ und Einheitsregeln E1–E4.
- [Quellen- und Ressourcenlinks (§4)](source-and-resource-links.de.md)
- [Contentanbindung: Architekturrahmen (§5)](content-integration.md)
- [Nachvollziehbare Quellenbegründungen (§6)](human-readable-source-rationales.de.md)
- [Visualisierungen für atomare Lernziele (§7)](atomic-goal-visualizations.de.md)
- [Lernzielbuch und Evidenz-Review-Pipeline (§8)](learning-goal-book-and-evidence-review-pipeline.de.md)
  (zur lokalen Unterrichts-Zeitplanung auf Basis des Lernzielbuchs siehe [Lernzielbuch-Zeitplanung](teacher-goal-book-time-planning.md) in Band II).
- [Rollout-Politik für das kanonische Gymnasium (§9)](canonical-gymnasium-rollout.de.md)
- [MEM/FWU-Roundtrip-Plan (§10)](mem-fwu-roundtrip-plan.de.md)
- [Duale Curriculum-Pakete (§11)](dual-curriculum-package-releases.md):
  JSON-Runtime- und Ontologiepakete, Laufzeitverträge 1.0, 1.1 (`assessmentCompletionV1`) und 1.2 (`learningUnitsV1`) sowie Abgrenzung zur Stufenplan-Grundlage `v1.3` und zum Cluster-Einheiten-Träger (`F8`).
- [Entwurfskriterien und Beispiele für Lerneinheiten (§12)](learning-unit-design-and-examples.de.md):
  Wie aus einem Lernversprechen Aufgaben und Bestehenskriterien werden. Mit der geschachtelten Kinematik-Einheit E.1 in Hessen als Prüfstein.
- [Wissenskontext (§13)](knowledge-context.de.md):
  was bei Lernenden an einem Ziel vorausgesetzt werden darf ($W(g)$), das Zusammenspiel von `requires` und `after` an Einheitsgrenzen und die Hinlänglichkeit als Eigenschaft, die der Graph gewinnen muss.

Siehe die [Konzept-Übersicht](../index.md) für didaktische Konzepte und Laufzeit-Workflows sowie das [Glossar](../glossary.de.md) für die gemeinsame Terminologie.

## Web- & PDF-Kompendien aus der kanonischen Single-Source bauen

Alle zweisprachigen Web-Kapitel, die Regel-Ampelmatrix, die zweisprachigen Diagramme (`00`, `08`–`18`) und beide LuaLaTeX-PDFs werden aus den kanonischen Single-Sources unter `docs/concept/skill-graph/source/` und `docs/concept/skill-graph/architecture-source/` erzeugt:

```bash
python3 scripts/build_compendia.py --compendium skill-graph --all
python3 scripts/build_compendia.py --compendium skill-graph-architecture --web-and-tex --pdfs
python3 docs/concept/skill-graph/latex/check-assessment-model.py
```

Der [Single-Source-Compiler](https://github.com/enpasos/skillpilot/blob/main/docs/concept/skill-graph/build_spec.py) (sowie der Kompatibilitäts-Wrapper [latex/build-document.py](latex/build-document.py)) legt LaTeX-Zwischendateien unter `tmp/` ab und schreibt die generierten Markdown-Seiten, zweisprachigen Diagramm-PNGs und DE/EN-PDFs nach `docs/`. Mit `--texmf` lässt sich ein lokal entpackter TeX-Paketbaum ohne Änderung der Systempakete nutzen.

Die [Referenzprüfung](latex/check-assessment-model.py) behandelt den vierteiligen E.1-Entwurf und die geltende Anerkennungsrechnung.

</div>
