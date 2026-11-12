<div data-sp-content-lang="en" markdown>

# Concept Documentation Index

This page is the entry point for durable SkillPilot concepts. Keep implementation plans and migration workboards in `docs/dev/`; keep CI rules and review processes in `docs/qa-ci/`.

## Foundations

- [Glossary](glossary.md) · [English PDF](skillpilot-glossary.en.pdf)
  Precise definitions of core SkillPilot terms, with the normative source per term.
- [Levels of Personalization](levels-of-personalization.md)
  Product-level personalization model.
- [Content Integration Architecture](skill-graph/content-integration.en.md)
  Provider-independent optional content packages separated from the curriculum and personal selection (Issue #50).
- [Curriculum Quality: QA Maturity Levels and Human Trials](curriculum-quality-and-human-trial.en.md)
  Target concept for `M7` as the completion of deep curriculum QA, separate Champion trial statuses, and a unified gray-green maturity scale.

## Platform Strategy

- [Portable Agent Runtime Architecture](portable-agent-runtime-architecture.en.md)
  Strategy for separating SkillPilot Core, interchangeable MCP host, and interchangeable model provider, including state/privacy boundaries, billing model, staged rollout, and dated market appendix.

## Skill Graph

- [Skill Graph Overview](skill-graph/index.md)
  Entry point for graph semantics, curriculum structure, and supporting contracts.
- [The SkillPilot Graph Definition (PDF)](skill-graph/skillpilot-graph-definition.en.pdf)
  Complete typeset specification with mathematics, bilingual illustrations, and 145-rule matrix.
- [SkillPilot Skill Graph Specification (§§1–5)](skill-graph/graph-definition.md)
  Core skill graph model and formal vocabulary.
- [Context, Views, Scope and Goal Types (§§6–10)](skill-graph/context-and-views.en.md)
  Canonical skill graph vs. educational views, personal curriculum closure $L=\mathrm{Closure}(S)$, understanding/memorisation/assessment goals, time and evidence boundaries.
- [Learning Units (§§11.1–11.4)](skill-graph/learning-units.md)
  Recursive units with a learning promise, subunits, application assessments, and derived completion; acquired competence remains globally valid.
- [Learning Unit Progression (§11.5)](skill-graph/learning-unit-progression.md)
  Explicit dependencies between whole units, valid block ordering, and the separate decision about recommended routes versus technical entry gates. The former [unit-concept address](skill-graph/curriculum-levels.md) and [progression-concept address](skill-graph/curriculum-level-gates.md) remain short compatibility pointers for existing links.
- [Optional Acquisition and Time Planning (§12)](skill-graph/planning-and-budget.en.md)
  Multi-period acquisition plans, structural prerequisite witnesses, and workload budgets.
- [Assessment-Gated Completion and Global Mastery (§13)](skill-graph/assessment-gated-completion.md)
  Direct assessment access and globally effective mastery through independent application in valid local learning-unit assessments.
- [Product Decision of 4 November 2026: Mastery via Understanding and Independent Application (DE)](skill-graph/completion-semantics-clarification-2026-11-04.md)
  Binding concept clarification; implementation and review of existing assessment contracts remain separate.
- [Graph Definition Compendium Appendices (B–F)](skill-graph/compendium-appendix.en.md)
  Current implementation status, verification strategy, glossary/symbols, sources, and single-source build reference.
- [Architecture & Interchange Compendium (PDF)](skill-graph/skillpilot-skill-graph-architecture.en.pdf)
  Unified single-source compendium covering the layered goal system, node types, view projection, source/content links, visualizations, GoalBook review pipeline, canonical Gymnasium rollout, MEM/FWU roundtrip, dual curriculum package releases, and learning-unit design criteria.
- [General Goal System and Migration](skill-graph/general-goal-system-and-migration.md)
  Long-term goal-system split and migration direction.
- [Node Types](skill-graph/node-types.md)
  Node semantics and classification.
- [View Projection and Goal Placement](skill-graph/view-projection-and-goal-placement.md)
  Scope-specific learner-facing views and placement semantics.
- [Source and Resource Links](skill-graph/source-and-resource-links.md)
  Provenance and source/reference semantics.
- [Atomic Goal Visualizations](skill-graph/atomic-goal-visualizations.md)
  Production pipeline and review rules for optional atomic-goal image assets.
- [Human-Readable Source Rationales](skill-graph/human-readable-source-rationales.md)
  Generated explanation model for tracing learning goals back to source evidence.
- [Learning-Goal Book and Evidence-Review Pipeline](skill-graph/learning-goal-book-and-evidence-review-pipeline.md)
  Versioned one-goal-per-page HTML/PDF publication and fast multi-AI evidence-review model with a separate slow public feedback channel.
- [Teacher Goal Book and Local Time Planning](skill-graph/teacher-goal-book-time-planning.en.md)
  Scope-safe goal selection and a calendar timeline in the existing local teacher course plan, without central class storage.
- [Canonical Gymnasium Rollout Policy](skill-graph/canonical-gymnasium-rollout.md)
  Conceptual rollout rules for canonical German Gymnasium subjects.
- [MEM/FWU Roundtrip Plan](skill-graph/mem-fwu-roundtrip-plan.md)
  Concept plan for MEM/FWU graph interchange.
- [Dual Curriculum Package Releases](skill-graph/dual-curriculum-package-releases.en.md)
  Target architecture for equivalent JSON-runtime and FWU-ontology release packages, standalone consumption, and repository decoupling.
- [Learning-Unit Design Criteria and Examples](skill-graph/learning-unit-design-and-examples.md)
  Purpose of a unit, criteria for meaningful boundaries and assessments, two worked candidates, and the unit validity rules R1–R5 of 11 November 2026.

## Didactic & Planning Concepts

- [Didactic & Planning Compendium (PDF)](didactic/skillpilot-didactics-and-planning.en.pdf)
- [Feynman Technique for Learning](didactic/feynman-rules.md)
- [Frontier Goal Selection Strategies & Autopilot](didactic/frontier-goal-selection-strategies-autopilot.md)
- [Curriculum Time Axis, Buffer Planning, and Target-vs-Actual Pacing](didactic/curriculum-time-axis-and-pacing.en.md)
- [Unified Learning Plan Status](didactic/unified-learning-plan-status.en.md)
- [Learning Velocity](didactic/learning-velocity.md)
- [Course Plan Update Continuity](runtime-workflows/course-plan-update-continuity.en.md)
- [Exam Scope, Coverage, and Preparation](runtime-workflows/exam-preparation-planning.en.md)

## Runtime & Coach Workflows

- [Coach & Runtime Architecture Compendium (PDF)](runtime-workflows/skillpilot-coach-and-runtime-architecture.en.pdf)
  Unified single-source compendium covering personalization, learning/sync/import-export workflows, portable MCP-host strategy, ChatClient/backend contract, coach topology, OAuth/session binding, behavioral Golden Journeys, and plugin lifecycle.
- [Learning Workflow](runtime-workflows/learning-workflow.md)
- [Daily Learning Progress: Former Calculation (Superseded)](runtime-workflows/daily-learning-progress.en.md)
- [Existing-Learner Teacher View by SkillPilot ID](runtime-workflows/existing-learner-teacher-view.md)
- [Import/Export Workflow](runtime-workflows/import-export-workflow.md)
- [Client-State Sync](runtime-workflows/client-state-sync.md)
- [Behavioral Integration of the MCP Learning Coach](runtime-workflows/openai-mcp-coach-behavioral-integration.en.md)
- [ChatClient / SkillPilot Backend Communication Contract](runtime-workflows/provider-neutral-coach-boundary.en.md)
- [SkillPilot Learning Coach: Product and Provider Architecture](runtime-workflows/skillpilot-owned-coach-architecture.en.md)
- [OpenAI Plugin: Versioning and Lifecycle](runtime-workflows/openai-plugin-versioning-and-lifecycle.en.md)
- [OpenAI MCP App: OAuth App Binding and 24h Learning Session](runtime-workflows/openai-mcp-oauth-learner-session-architecture.en.md)
- [OpenAI MCP: Authorized Client Binding](../security/openai-mcp-client-binding.en.md)
- [ChatGPT Visible Session Flow](runtime-workflows/chatgpt-visible-session-flow.en.md)
  Retained Custom-GPT rollback runtime with visible cross-turn relay; not the current production reference architecture.
- [Legacy ChatGPT Startcode / Session Flow](runtime-workflows/chatgpt-startcode-session-flow.en.md)
  Historical retained rollback architecture; not the current ChatGPT path.

## Maintenance

- Add durable semantic or product concepts to the closest section above.
- Move implementation-only notes to `docs/dev/` and operational QA rules to `docs/qa-ci/`.
- `cd app && npm run check:docs-indexes` fails if a Markdown file under `docs/concept/` is missing from this index.

</div>

<div data-sp-content-lang="de" markdown>

# Konzept-Dokumentation

Diese Seite ist der Einstiegspunkt für dauerhafte SkillPilot-Konzepte. Umsetzungspläne und Migrations-Workboards liegen unter `docs/dev/`, CI-Regeln und Review-Prozesse unter `docs/qa-ci/`.

## Grundlagen

- [Glossar](glossary.de.md) · [Deutsches PDF](skillpilot-glossary.de.pdf)
  Präzise Definitionen der zentralen SkillPilot-Begriffe mit Verweis auf die jeweils maßgebliche Quelle.
- [Ebenen der Personalisierung](levels-of-personalization.de.md)
  Produktweites Personalisierungsmodell.
- [Contentanbindung: Architekturrahmen](skill-graph/content-integration.md)
  Anbieterunabhängige optionale Contentpakete, getrennt von Curriculum und persönlicher Auswahl; verbindliche Konzeptgrundlage aus Issue #50.
- [Curriculum-Qualität: QS-Reifegrade und menschliche Erprobung](curriculum-quality-and-human-trial.md)
  Abgestimmtes Zielkonzept für `M7` als Abschluss der vertieften Curriculum-QS, getrennte Champion-Erprobungsstatus und eine einheitliche Grau-Grün-Reifeskala; Umsetzung offen.

## Plattformstrategie

- [Architekturkonzept: SkillPilot mit austauschbarem MCP Host](portable-agent-runtime-architecture.md)
  Strategiekonzept für die Trennung von SkillPilot Core, austauschbarem MCP Host und austauschbarem Model Provider mit Zustands- und Datenschutzgrenzen, Abrechnungsmodell, Stufenplan, Abnahmetests und datiertem Marktanhang.

## Skill-Graph

- [Skill-Graph-Übersicht](skill-graph/index.md)
  Einstiegspunkt für Graphsemantik, Curriculum-Struktur und begleitende Verträge.
- [Die Graph-Definition von SkillPilot (PDF)](skill-graph/skillpilot-graph-definition.pdf)
  Vollständige gesetzte Spezifikation mit Mathematik, zweisprachigen Illustrationen und 145-Regel-Ampelmatrix.
- [Graph-Definition — Kern (§§1–5)](skill-graph/graph-definition.de.md)
  Kernmodell des Skill-Graphen und formales Vokabular.
- [Kontext, Sichten, Scope und Zielarten (§§6–10)](skill-graph/context-and-views.de.md)
  Kanonischer Skill-Graph vs. Bildungssichten, persönlicher Curriculum-Abschluss $L=\mathrm{Closure}(S)$, Verständnis-/Memorier-/Prüfungsziele, Zeit- und Nachweisgrenzen.
- [Lerneinheiten (§§11.1–11.4)](skill-graph/learning-units.de.md)
  Rekursive Einheiten mit Lernversprechen, Untereinheiten, Anwendungsprüfungen und abgeleitetem Abschluss; erworbene Kompetenzen gelten global weiter.
- [Einheitsfolge & Zugang (§11.5)](skill-graph/learning-unit-progression.de.md)
  Explizite Abhängigkeiten zwischen ganzen Einheiten, gültige Blockreihenfolgen und die getrennte Richtlinienentscheidung zwischen empfohlenen Wegen und technischen Startsperren. Die früheren Adressen [curriculum-levels.md](skill-graph/curriculum-levels.md) und [curriculum-level-gates.md](skill-graph/curriculum-level-gates.md) bleiben als kurze Kompatibilitätszeiger erhalten.
- [Optionale Erwerbs- und Zeitplanung (§12)](skill-graph/planning-and-budget.de.md)
  Mehrperiodige Erwerbspläne, strukturelle Voraussetzungszeugen und Arbeitslastbudgets.
- [Prüfungsgebundener Abschluss und implizite Mastery (§13)](skill-graph/assessment-gated-completion.de.md)
  Direkter Prüfungszugang und global wirksame Mastery durch selbstständige Anwendung in gültigen lokalen Lerneinheiten-Prüfungen.
- [Produktentscheidung vom 4. November 2026: Beherrschung durch Verständnis und selbstständige Anwendung](skill-graph/completion-semantics-clarification-2026-11-04.md)
  Verbindliche Konzeptkorrektur; Umsetzung und Prüfung bestehender Prüfungsverträge folgen separat.
- [Kompendiums-Anhänge zur Graph-Definition (B–F)](skill-graph/compendium-appendix.de.md)
  Aktueller Umsetzungsstand, Prüfstrategie, Glossar/Symbole, Quellen und Single-Source-Build-Referenz.
- [Architektur- & Austausch-Kompendium (PDF)](skill-graph/skillpilot-skill-graph-architecture.de.pdf)
  Einheitliches Single-Source-Kompendium zu geschichtetem Zielsystem, Knotentypen, Sichtprojektion, Quellen-/Contentlinks, Visualisierungen, Lernzielbuch-Review-Pipeline, kanonischem Gymnasium-Rollout, MEM/FWU-Roundtrip, dualen Curriculum-Paketen und Entwurfskriterien für Lerneinheiten.
- [Allgemeines Zielsystem und Migration](skill-graph/general-goal-system-and-migration.de.md)
  Langfristige Trennung des Zielsystems und Migrationsrichtung.
- [Knotentypen](skill-graph/node-types.de.md)
  Knotensemantik und Klassifikation.
- [Sichtprojektion und Zielplatzierung](skill-graph/view-projection-and-goal-placement.de.md)
  Scopegerechte Lernendensichten und Platzierungssemantik.
- [Quellen- und Ressourcenlinks](skill-graph/source-and-resource-links.de.md)
  Provenienz- und Quellenreferenzsemantik.
- [Visualisierungen atomarer Lernziele](skill-graph/atomic-goal-visualizations.de.md)
  Produktions-Pipeline und Prüfkriterien für optionale Lernziel-Illustrationen.
- [Menschenlesbare Quellenbegründungen](skill-graph/human-readable-source-rationales.de.md)
  Generiertes Begründungsmodell zur Rückführung von Lernzielen auf Quellennachweise.
- [Lernzielbuch und Evidence-Review-Pipeline](skill-graph/learning-goal-book-and-evidence-review-pipeline.de.md)
  Versionierte Ein-Ziel-pro-Seite-HTML/PDF-Publikation und schnelles Multi-KI-Reviewmodell mit getrenntem öffentlichem Feedbackkanal.
- [Lernzielbuch und lokale Zeitplanung für Lehrkräfte](skill-graph/teacher-goal-book-time-planning.md)
  Scopesichere Zielauswahl und Kalenderzeitachse im bestehenden lokalen Kursplan für Lehrkräfte ohne zentrale Klassenspeicherung.
- [Kanonische Gymnasium-Rollout-Richtlinie](skill-graph/canonical-gymnasium-rollout.de.md)
  Konzeptionelle Rollout-Regeln für kanonische deutsche Gymnasialfächer.
- [MEM/FWU-Roundtrip-Plan](skill-graph/mem-fwu-roundtrip-plan.de.md)
  Konzeptplan für den MEM/FWU-Graphaustausch.
- [Duale Curriculum-Pakete](skill-graph/dual-curriculum-package-releases.md)
  Zielarchitektur für äquivalente JSON-Runtime- und FWU-Ontologie-Release-Pakete, Standalone-Nutzung und Repository-Entkopplung.
- [Entwurfskriterien und Beispiele für Lerneinheiten](skill-graph/learning-unit-design-and-examples.de.md)
  Didaktischer Zweck einer Lerneinheit, Kriterien für sinnvolle Grenzen und Prüfungen, zwei durchgearbeitete Kandidaten sowie die Gültigkeitsregeln R1–R5 vom 11. November 2026.

## Didaktik & Planung

- [Didaktik- & Planungs-Kompendium (PDF)](didactic/skillpilot-didactics-and-planning.de.pdf)
- [Feynman-Methode beim Lernen](didactic/feynman-rules.de.md)
- [Frontier-Zielauswahlstrategien & Autopilot](didactic/frontier-goal-selection-strategies-autopilot.de.md)
- [Curriculum-Zeitachse, Pufferplanung und Soll-Ist-Lerntempo](didactic/curriculum-time-axis-and-pacing.md)
- [Einheitlicher Lernplanstatus](didactic/unified-learning-plan-status.md)
- [Lerngeschwindigkeit (Learning Velocity)](didactic/learning-velocity.de.md)
- [Kursplanung nach Curriculum-Updates](runtime-workflows/course-plan-update-continuity.md)
- [Klausurstoff, Aufgabenabdeckung und Vorbereitung](runtime-workflows/exam-preparation-planning.md)

## Laufzeit- & Coach-Workflows

- [Coach- & Laufzeitarchitektur-Kompendium (PDF)](runtime-workflows/skillpilot-coach-and-runtime-architecture.de.pdf)
  Einheitliches Single-Source-Kompendium zu Personalisierung, Lern-/Sync-/Import-Export-Abläufen, portabler MCP-Host-Strategie, ChatClient/Backend-Vertrag, Coach-Topologie, OAuth/Session-Bindung, Golden Journeys und Plugin-Lebenszyklus.
- [Operativer Lernablauf](runtime-workflows/learning-workflow.de.md)
- [Tagesfortschritt: frühere Rechenweise (abgelöst)](runtime-workflows/daily-learning-progress.md)
- [Lehrkraft-Sicht auf bestehende Lernende per SkillPilot-ID](runtime-workflows/existing-learner-teacher-view.de.md)
- [Import- und Export-Workflow](runtime-workflows/import-export-workflow.de.md)
- [Client-State-Synchronisation](runtime-workflows/client-state-sync.de.md)
- [Verhaltensintegration des MCP-Lerncoaches](runtime-workflows/openai-mcp-coach-behavioral-integration.md)
- [Kommunikationsvertrag zwischen ChatClient und SkillPilot-Backend](runtime-workflows/provider-neutral-coach-boundary.md)
- [SkillPilot-Lerncoach: Produkt- und Providerarchitektur](runtime-workflows/skillpilot-owned-coach-architecture.md)
- [OpenAI-Plugin: Versionierung und Lebenszyklus](runtime-workflows/openai-plugin-versioning-and-lifecycle.md)
- [OpenAI-MCP-App: OAuth-Appbindung und 24h-Lernsession](runtime-workflows/openai-mcp-oauth-learner-session-architecture.md)
- [OpenAI-MCP: Bindung an den zugelassenen Client](../security/openai-mcp-client-binding.md)
- [Custom GPT: sichtbarer Notfallfallback (Rollback)](runtime-workflows/chatgpt-visible-session-flow.md)
  Erhaltene Custom-GPT-Rollback-Laufzeit; nicht die aktuelle Referenzarchitektur.
- [Custom GPT: privater Startcode- und Session-Flow (Historisch)](runtime-workflows/chatgpt-startcode-session-flow.md)
  Historische Rollback-Architektur; nicht der aktuelle ChatGPT-Pfad.

## Pflegehinweise

- Dauerhafte Fach- oder Produktkonzepte im jeweils passenden Abschnitt oben ergänzen.
- Reine Implementierungsnotizen nach `docs/dev/` und operative QS-Regeln nach `docs/qa-ci/` legen.
- `cd app && npm run check:docs-indexes` schlägt fehl, wenn eine Markdown-Datei unter `docs/concept/` in diesem Index fehlt.

</div>
