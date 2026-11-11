# Concept Documentation Index

This page is the entry point for durable SkillPilot concepts. Keep implementation plans and migration workboards in `docs/dev/`; keep CI rules and review processes in `docs/qa-ci/`.

## Foundations

- [Glossary (EN)](glossary.md) · [Glossar (DE)](glossary.de.md) · [PDF (EN)](skillpilot-glossary.en.pdf) · [PDF (DE)](skillpilot-glossary.de.pdf)
  Precise bilingual definitions of the core SkillPilot terms, with the normative source per term.
- [Levels of Personalization (EN)](levels-of-personalization.md) · [Ebenen der Personalisierung (DE)](levels-of-personalization.de.md)
  Product-level personalization model.
- [Contentanbindung: Architekturrahmen (DE)](skill-graph/content-integration.md) · [Content Integration (EN)](skill-graph/content-integration.en.md)
  Anbieterunabhängige optionale Contentpakete, getrennt von Curriculum und persönlicher Auswahl; verbindliche Konzeptgrundlage aus Issue #50.
- [Curriculum-Qualität: QS-Reifegrade und menschliche Erprobung (DE)](curriculum-quality-and-human-trial.md) · [English (EN)](curriculum-quality-and-human-trial.en.md)
  Abgestimmtes Zielkonzept für M7 als Abschluss der vertieften Curriculum-QS, getrennte Champion-Erprobungsstatus und eine einheitliche Grau-Grün-Reifeskala; Umsetzung offen.

## Platform Strategy

- [Architekturkonzept: SkillPilot mit austauschbarem MCP Host (DE)](portable-agent-runtime-architecture.md) · [Portable Agent Runtime Architecture (EN)](portable-agent-runtime-architecture.en.md)
  Strategiekonzept für die Trennung von SkillPilot Core, austauschbarem MCP Host und austauschbarem Model Provider. Teil A ist die normative Architektur mit Zustands- und Datenschutzgrenzen, Abrechnungsmodell, Stufenplan und Abnahmetests; Teil B ist ein datierter Marktanhang zu den verfügbaren Hosts.

## Skill Graph

- [Skill Graph Overview](skill-graph/index.md)
  Entry point for graph semantics, curriculum structure, and supporting contracts.
- [SkillPilot Skill Graph Specification (§§1–5, EN)](skill-graph/graph-definition.md) · [Deutsch (DE)](skill-graph/graph-definition.de.md)
  Core graph model and formal vocabulary.
- [Context, Views, Scope and Goal Types (§§6–10, EN)](skill-graph/context-and-views.en.md) · [Deutsch (DE)](skill-graph/context-and-views.de.md)
  Canonical graph vs. educational views, personal curriculum closure $L=\mathrm{Closure}(S)$, understanding/memorisation/assessment goals, time and evidence boundaries.
- [Assessment-Gated Completion and Global Mastery (§13, EN)](skill-graph/assessment-gated-completion.md) · [Deutsch (DE)](skill-graph/assessment-gated-completion.de.md)
  Direct assessment access and globally effective mastery through independent application in valid local learning-unit assessments.
- [Produktentscheidung: Beherrschung durch Verständnis und selbständige Anwendung](skill-graph/completion-semantics-clarification-2026-11-04.md)
  Verbindliche Konzeptkorrektur vom 4. November 2026; Umsetzung und Prüfung bestehender Prüfungsverträge folgen.
- [Learning Units (§§11.1–11.4, EN)](skill-graph/learning-units.md) · [Deutsch (DE)](skill-graph/learning-units.de.md)
  Recursive units with a learning promise, subunits, application assessments
  and derived completion; acquired competence remains globally valid.
- [Learning Unit Progression (§11.5, EN)](skill-graph/learning-unit-progression.md) · [Deutsch (DE)](skill-graph/learning-unit-progression.de.md)
  Explicit dependencies between whole units, valid block ordering and the
  separate decision about recommended routes versus technical entry gates.
  The former [unit-concept address](skill-graph/curriculum-levels.md) and
  [progression-concept address](skill-graph/curriculum-level-gates.md) remain
  short compatibility pointers for existing links.
- [Learning-Unit Design Criteria and Examples](skill-graph/learning-unit-design-and-examples.md)
  Purpose of a unit, criteria for meaningful boundaries and assessments, two
  worked candidates, and the unit validity rules R1–R5 of 11 November 2026.
- [Optional Acquisition and Time Planning (§12, EN)](skill-graph/planning-and-budget.en.md) · [Deutsch (DE)](skill-graph/planning-and-budget.de.md)
  Multi-period acquisition plans, structural prerequisite witnesses, and workload budgets.
- [Graph Definition Compendium Appendices (B–F, EN)](skill-graph/compendium-appendix.en.md) · [Deutsch (DE)](skill-graph/compendium-appendix.de.md)
  Current implementation status, verification strategy, glossary/symbols, sources, and single-source build reference.
- [Architecture & Interchange Compendium PDF (EN)](skill-graph/skillpilot-skill-graph-architecture.en.pdf) · [Architektur- & Austausch-Kompendium PDF (DE)](skill-graph/skillpilot-skill-graph-architecture.de.pdf)
  Unified single-source compendium covering the layered goal system, node types, view projection, source/content links, visualizations, GoalBook review pipeline, canonical Gymnasium rollout, MEM/FWU roundtrip, and dual curriculum package releases.
- [General Goal System and Migration (EN)](skill-graph/general-goal-system-and-migration.md) · [Deutsch (DE)](skill-graph/general-goal-system-and-migration.de.md)
  Long-term goal-system split and migration direction.
- [Node Types (EN)](skill-graph/node-types.md) · [Deutsch (DE)](skill-graph/node-types.de.md)
  Node semantics and classification.
- [View Projection and Goal Placement (EN)](skill-graph/view-projection-and-goal-placement.md) · [Deutsch (DE)](skill-graph/view-projection-and-goal-placement.de.md)
  Scope-specific learner-facing views and placement semantics.
- [Source And Resource Links (EN)](skill-graph/source-and-resource-links.md) · [Deutsch (DE)](skill-graph/source-and-resource-links.de.md)
  Provenance and source/reference semantics.
- [Atomic Goal Visualizations (EN)](skill-graph/atomic-goal-visualizations.md) · [Deutsch (DE)](skill-graph/atomic-goal-visualizations.de.md)
  Production pipeline and review rules for optional atomic-goal image assets.
- [Human-Readable Source Rationales (EN)](skill-graph/human-readable-source-rationales.md) · [Deutsch (DE)](skill-graph/human-readable-source-rationales.de.md)
  Generated explanation model for tracing learning goals back to source evidence.
- [Learning-Goal Book and Evidence-Review Pipeline (EN)](skill-graph/learning-goal-book-and-evidence-review-pipeline.md) · [Deutsch (DE)](skill-graph/learning-goal-book-and-evidence-review-pipeline.de.md)
  Versioned one-goal-per-page HTML/PDF publication and fast multi-AI evidence-review model with a separate slow public feedback channel.
- [Lernzielbuch und lokale Zeitplanung für Lehrkräfte (DE)](skill-graph/teacher-goal-book-time-planning.md) · [English (EN)](skill-graph/teacher-goal-book-time-planning.en.md)
  Scope-safe goal selection and a calendar timeline in the existing local teacher course plan, without central class storage.
- [Canonical Gymnasium Rollout Policy (EN)](skill-graph/canonical-gymnasium-rollout.md) · [Deutsch (DE)](skill-graph/canonical-gymnasium-rollout.de.md)
  Conceptual rollout rules for canonical German Gymnasium subjects.
- [MEM/FWU Roundtrip Plan (EN)](skill-graph/mem-fwu-roundtrip-plan.md) · [Deutsch (DE)](skill-graph/mem-fwu-roundtrip-plan.de.md)
  Concept plan for MEM/FWU graph interchange.
- [Duale Curriculum-Pakete (DE)](skill-graph/dual-curriculum-package-releases.md) · [Dual Curriculum Package Releases (EN)](skill-graph/dual-curriculum-package-releases.en.md)
  Target architecture for equivalent JSON-runtime and FWU-ontology release packages, standalone consumption, and repository decoupling.

## Didactic Concepts

- [Feynman Technique for Learning (EN)](didactic/feynman-rules.md) · [Deutsch (DE)](didactic/feynman-rules.de.md)
- [Frontier Goal Selection Strategies & Autopilot (EN)](didactic/frontier-goal-selection-strategies-autopilot.md) · [Deutsch (DE)](didactic/frontier-goal-selection-strategies-autopilot.de.md)
- [Curriculum-Zeitachse, Pufferplanung und Soll-Ist-Lerntempo](didactic/curriculum-time-axis-and-pacing.md)
  Versionierte Zeitplanung als getrennte Ausführungsebene mit
  Unterrichtskalender, Clusterblöcken, datierten Meilensteinen, Puffer,
  Ist-/Soll-Tacho, belastbarer Achievement-Historie und einer Ein-Seiten-Sicht
  für Lehrkraftplan, Unterrichts-IST und Klassenlernstand.
- [Einheitlicher Lernplanstatus (DE)](didactic/unified-learning-plan-status.md) · [English (EN)](didactic/unified-learning-plan-status.en.md)
  Eine Mengenbilanz je Fach auf Tages- oder Wochenbasis, deren Text das Backend
  verbindlich für Cockpit, Chat und Planung formuliert.
- [Learning Velocity (EN)](didactic/learning-velocity.md) · [Deutsch (DE)](didactic/learning-velocity.de.md)

## Runtime Workflows

- [Compendium PDF (EN)](runtime-workflows/skillpilot-coach-and-runtime-architecture.en.pdf) · [Kompendium-PDF (DE)](runtime-workflows/skillpilot-coach-and-runtime-architecture.de.pdf)
  Unified single-source compendium covering personalization, learning/sync/import-export workflows, portable MCP-host strategy, ChatClient/backend contract, coach topology, OAuth/session binding, behavioral Golden Journeys, and plugin lifecycle.
- [Learning Workflow (EN)](runtime-workflows/learning-workflow.md) · [Operativer Lernablauf (DE)](runtime-workflows/learning-workflow.de.md)
- [Tagesfortschritt: frühere Rechenweise (abgelöst)](runtime-workflows/daily-learning-progress.md)
  Abgelöst durch den einheitlichen Lernplanstatus; beschreibt die frühere Rechenweise.
- [Kursplanung nach Curriculum-Updates (DE)](runtime-workflows/course-plan-update-continuity.md) · [English (EN)](runtime-workflows/course-plan-update-continuity.en.md)
- [Klausurstoff, Aufgabenabdeckung und Vorbereitung (DE)](runtime-workflows/exam-preparation-planning.md) · [English (EN)](runtime-workflows/exam-preparation-planning.en.md)
  Themen- und Aufgabenpaketauswahl, ausdrückliche Ergänzung der Vorbereitung vor dem Klausurtermin und aktive oder inaktive Planabschnitte.
- [Existing-Learner Teacher View by SkillPilot ID (EN)](runtime-workflows/existing-learner-teacher-view.md) · [Deutsch (DE)](runtime-workflows/existing-learner-teacher-view.de.md)
  Functionally read-only local teacher view over the normal learner endpoints,
  including local ID/personalization storage, encrypted class files, and the
  permanent ID's unchanged full-access boundary.
- [Import/Export Workflow (EN)](runtime-workflows/import-export-workflow.md) · [Import- und Export-Workflow (DE)](runtime-workflows/import-export-workflow.de.md)
- [Client-State Sync (EN)](runtime-workflows/client-state-sync.md) · [Client-State-Synchronisation (DE)](runtime-workflows/client-state-sync.de.md)
- [Verhaltensintegration des MCP-Lerncoaches (DE)](runtime-workflows/openai-mcp-coach-behavioral-integration.md) · [English (EN)](runtime-workflows/openai-mcp-coach-behavioral-integration.en.md)
  Normativer Nordstern, allgemeines Coach-Verhaltensmodell, Golden Journeys und objektive End-to-End-Acceptance.
- [Kommunikationsvertrag zwischen ChatClient und SkillPilot-Backend (DE)](runtime-workflows/provider-neutral-coach-boundary.md) · [English (EN)](runtime-workflows/provider-neutral-coach-boundary.en.md)
  Kanonische, einfache Verantwortungsgrenze für Sprache, Zustand, Tooldesign, Capabilities, Ergebnisse, Fortsetzung und Fehler aller Coach-Adapter.
- [SkillPilot-Lerncoach: Produkt- und Providerarchitektur (DE)](runtime-workflows/skillpilot-owned-coach-architecture.md) · [English (EN)](runtime-workflows/skillpilot-owned-coach-architecture.en.md)
  Target architecture for the multilingual coach plugin, combining a neutral-English coaching skill with a directly submitted MCP server while preserving backend-authoritative interaction language, the SkillPilot domain core, direct provider billing, and staged production gates.
- [OpenAI-Plugin: Versionierung und Lebenszyklus (DE)](runtime-workflows/openai-plugin-versioning-and-lifecycle.md) · [English (EN)](runtime-workflows/openai-plugin-versioning-and-lifecycle.en.md)
  Binding version-line, compatibility, snapshot, lifecycle, release, and retirement rules including the 19 October 2026 permanent `skillpilot-coach` decision.
- [OpenAI-MCP-App: OAuth-Appbindung und 24h-Lernsession (DE)](runtime-workflows/openai-mcp-oauth-learner-session-architecture.md) · [English (EN)](runtime-workflows/openai-mcp-oauth-learner-session-architecture.en.md)
  Normative separation of OAuth app authentication and the fresh, automatically transported, absolute 24-hour learning session that addresses the learner.
- [OpenAI-MCP-Clientbindung](../security/openai-mcp-client-binding.md)
  Security source of truth for `client_secret_basic`, exact callback/resource/scope binding, secret lifecycle, and the independent learner-session boundary.
- [ChatGPT Visible Session Flow](runtime-workflows/chatgpt-visible-session-flow.md)
  Retained Custom-GPT rollback runtime with visible cross-turn relay; not the current production reference architecture.
- [Legacy ChatGPT Startcode / Session Flow](runtime-workflows/chatgpt-startcode-session-flow.md)
  Historical retained rollback architecture; not the current ChatGPT path.

## Maintenance

- Add durable semantic or product concepts to the closest section above.
- Move implementation-only notes to `docs/dev/` and operational QA rules to `docs/qa-ci/`.
- `cd app && npm run check:docs-indexes` fails if a Markdown file under `docs/concept/` is missing from this index.
