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

Sections 11 and 13 describe the recognition contract in force since 4/11 November. Each also includes a separate proposal for expert review dated 19 November. The Hessian E.1 working paper provides tasks and sample submissions for that proposal.

- [Skill Graph Overview](skill-graph/index.md)
  Entry point for graph semantics, curriculum structure, and supporting contracts.
- [The SkillPilot Graph Definition (PDF)](skill-graph/skillpilot-graph-definition.en.pdf)
  Complete typeset specification with mathematics, bilingual illustrations, and 145-rule matrix.
- [SkillPilot Skill Graph Specification (§§1–5)](skill-graph/graph-definition.md)
  Core skill graph model and formal vocabulary.
- [Context, Views, Scope and Goal Types (§§6–10)](skill-graph/context-and-views.en.md)
  Canonical skill graph vs. educational views, personal curriculum closure $L=\mathrm{Closure}(S)$, understanding/memorisation/assessment goals, time and evidence boundaries.
- [Learning Units (§§11.1–11.4)](skill-graph/learning-units.md)
  Learning promises, entry, required components and two ways to qualify in units with final assessments.
- [Unit Ordering and Rules E1–E4 (§11.5)](skill-graph/learning-unit-progression.md#sec-unit-progression)
  Under B9, `after` orders suggestions among reachable goals. Learners can also [choose an available assessment directly](skill-graph/context-and-views.en.md#sec-exams). The former pages on [curriculum levels](skill-graph/curriculum-levels.md) and [level gates](skill-graph/curriculum-level-gates.md) point to the current rules.
- [Optional Acquisition and Time Planning (§12)](skill-graph/planning-and-budget.en.md)
  Multi-period acquisition plans, structural prerequisite witnesses, and workload budgets.
- [Recognition through local assessments (§13)](skill-graph/assessment-gated-completion.md)
  The contract in force defines recognition of ordinary goals under R1–R5. The proposal of 19 November introduces a judgement about the unit as a whole.
- [Product Decision of 4 November 2026: Mastery via Understanding and Independent Application (DE)](skill-graph/completion-semantics-clarification-2026-11-04.md)
  Confirmed contract of 4 and 11 November. The 19 November proposal describes what adoption of a different completion rule would change.
- [Decision of 14 November 2026: Learning Units – Clusters, `after` and Learning Flow (DE)](skill-graph/learning-unit-wiring-concept-2026-11-14.md)
  Dated design of unit boundaries and sibling ordering. The implementation appendix records which parts are in use.
- [Concept Draft of 17 November 2026: Learning Units – Motivation at the Start, Assessments at the End (DE)](skill-graph/learning-unit-motivation-concept-2026-11-17.md)
  Earlier proposal for an authored opening. The 19 November design discusses its role on the guided path and direct entry to an assessment.
- [What does passing a learning unit demonstrate? (DE)](skill-graph/unit-assessment-discussion-2026-11-19.de.md)
  Discussion paper of 19 November 2026 on direct entry and representative final assessments, with a Hessian physics example.
- [Hesse E.1 child assessment drafts (DE/EN)](skill-graph/examples/hessen-physik-e1/entwuerfe-kindeinheit/README.md) · [Vertical throw](skill-graph/examples/hessen-physik-e1/entwuerfe-kindeinheit/c-senkrechter-wurf.md) · [Acceleration log](skill-graph/examples/hessen-physik-e1/entwuerfe-kindeinheit/d-beschleunigungsprotokoll.md) · [Earlier measurement-coverage review (DE)](skill-graph/examples/hessen-physik-e1/fachabgleich-messziele-2026-11-20.de.md)
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
  How to turn a learning promise into tasks and passing criteria, with the nested Hessian kinematics unit E.1 as a worked case.
- [Knowledge Context](skill-graph/knowledge-context.md)
  What a learner can be assumed to know at a goal. Deterministic derivation is implemented as a repository tool; validation gates, generation pipelines and live coach delivery remain separate implementation stages.

## Didactic & Planning Concepts

- [Didactic & Planning Compendium (PDF)](didactic/skillpilot-didactics-and-planning.en.pdf)
- [Feynman Technique for Learning](didactic/feynman-rules.md)
- [Teaching a new concept in the Claude beta (discussion paper, DE)](didactic/claude-beta-erklaeren-2026-11-19.de.md)
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

Die §§11 und 13 beschreiben den geltenden Anerkennungsvertrag vom 4./11. November. Beide Kapitel enthalten außerdem den gesonderten Vorschlag vom 19. November. Im Arbeitsdokument zu Hessen E.1 kann die Fachrunde ihn an Aufgaben und Beispielabgaben prüfen.

- [Skill-Graph-Übersicht](skill-graph/index.md)
  Einstiegspunkt für Graphsemantik, Curriculum-Struktur und begleitende Verträge.
- [Die Graph-Definition von SkillPilot (PDF)](skill-graph/skillpilot-graph-definition.pdf)
  Vollständige gesetzte Spezifikation mit Mathematik, zweisprachigen Illustrationen und 145-Regel-Ampelmatrix.
- [Graph-Definition — Kern (§§1–5)](skill-graph/graph-definition.de.md)
  Kernmodell des Skill-Graphen und formales Vokabular.
- [Kontext, Sichten, Scope und Zielarten (§§6–10)](skill-graph/context-and-views.de.md)
  Kanonischer Skill-Graph vs. Bildungssichten, persönlicher Curriculum-Abschluss $L=\mathrm{Closure}(S)$, Verständnis-/Memorier-/Prüfungsziele, Zeit- und Nachweisgrenzen.
- [Lerneinheiten (§§11.1–11.4)](skill-graph/learning-units.de.md)
  Lernversprechen, Einstieg, Pflichtbestandteile und zwei Wege zum Nachweis bei Einheiten mit Abschlussprüfung.
- [Einheitsordnung und Regeln E1–E4 (§11.5)](skill-graph/learning-unit-progression.de.md#sec-unit-progression)
  Nach B9 ordnet `after` die Vorschläge unter den erreichbaren Zielen. Lernende können auch eine [verfügbare Prüfung direkt wählen](skill-graph/context-and-views.de.md#sec-exams). Die früheren Seiten zu [Curriculum Levels](skill-graph/curriculum-levels.md) und [Level Gates](skill-graph/curriculum-level-gates.md) verweisen auf die geltenden Regeln.
- [Optionale Erwerbs- und Zeitplanung (§12)](skill-graph/planning-and-budget.de.md)
  Mehrperiodige Erwerbspläne, strukturelle Voraussetzungszeugen und Arbeitslastbudgets.
- [Anerkennung durch lokale Prüfungen (§13)](skill-graph/assessment-gated-completion.de.md)
  Der geltende Vertrag definiert die Anerkennung gewöhnlicher Ziele nach R1–R5. Der Vorschlag vom 19. November führt ein Urteil über die Einheit als Ganzes ein.
- [Produktentscheidung vom 4. November 2026: Beherrschung durch Verständnis und selbstständige Anwendung](skill-graph/completion-semantics-clarification-2026-11-04.md)
  Bestätigter Vertrag vom 4. und 11. November. Der Entwurf vom 19. November beschreibt, was sich bei einer Übernahme ändern würde.
- [Festlegung vom 14. November 2026: Lerneinheiten – Cluster, `after` und Lernfluss](skill-graph/learning-unit-wiring-concept-2026-11-14.md)
  Datierte Festlegung zu Einheitsgrenzen und zur Ordnung von Geschwistereinheiten. Der Statusanhang weist den jeweiligen Umsetzungsstand aus.
- [Konzeptentwurf vom 17. November 2026: Lerneinheiten – Motivation am Anfang, Prüfungen am Ende](skill-graph/learning-unit-motivation-concept-2026-11-17.md)
  Früherer Entwurf für einen eigenen Motivationsauftakt. Der Vorschlag vom 19. November beschreibt seine Rolle auf dem Lernweg und den direkten Zugang zur Prüfung.
- [Was weist der Abschluss einer Lerneinheit nach?](skill-graph/unit-assessment-discussion-2026-11-19.de.md)
  Arbeitsdokument vom 19. November 2026 zu freier Einstiegswahl und repräsentativen Abschlussprüfungen am Beispiel der hessischen Physik.
- [Entwürfe für die zwei Kindprüfungen in Hessen E.1 (DE/EN)](skill-graph/examples/hessen-physik-e1/entwuerfe-kindeinheit/README.md) · [Senkrechter Wurf](skill-graph/examples/hessen-physik-e1/entwuerfe-kindeinheit/c-senkrechter-wurf.md) · [Beschleunigungsprotokoll](skill-graph/examples/hessen-physik-e1/entwuerfe-kindeinheit/d-beschleunigungsprotokoll.md) · [Vorheriger Fachabgleich der Messziele](skill-graph/examples/hessen-physik-e1/fachabgleich-messziele-2026-11-20.de.md)
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
  Wie aus einem Lernversprechen Aufgaben und Bestehenskriterien werden. Mit der geschachtelten Kinematik-Einheit E.1 in Hessen als Prüfstein.
- [Wissenskontext](skill-graph/knowledge-context.de.md)
  Was bei Lernenden an einem Ziel vorausgesetzt werden darf. Die deterministische Ableitung ist als Repository-Werkzeug umgesetzt; Gates, Erzeugungspipelines und Live-Übergabe an den Coach folgen gesondert.

## Didaktik & Planung

- [Didaktik- & Planungs-Kompendium (PDF)](didactic/skillpilot-didactics-and-planning.de.pdf)
- [Feynman-Methode beim Lernen](didactic/feynman-rules.de.md)
- [Wie führt der Claude-Coach einen neuen Begriff ein? (Arbeitsvorschlag für die Beta)](didactic/claude-beta-erklaeren-2026-11-19.de.md)
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
