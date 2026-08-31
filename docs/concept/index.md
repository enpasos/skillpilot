# Concept Documentation Index

This page is the entry point for durable SkillPilot concepts. Keep implementation plans and migration workboards in `docs/dev/`; keep CI rules and review processes in `docs/qa-ci/`.

## Foundations

- [Glossary](glossary.md)
  Precise definitions of the core SkillPilot terms, with German equivalents and the normative source per term.
- [Levels of Personalization](levels-of-personalization.md)
  Product-level personalization model.

## Platform Strategy

- [Architekturkonzept: SkillPilot mit austauschbarem MCP Host](portable-agent-runtime-architecture.md)
  Strategiekonzept für die Trennung von SkillPilot Core, austauschbarem MCP Host und austauschbarem Model Provider. Teil A ist die normative Architektur mit Zustands- und Datenschutzgrenzen, Abrechnungsmodell, Stufenplan und Abnahmetests; Teil B ist ein datierter Marktanhang zu den verfügbaren Hosts.

## Skill Graph

- [SkillPilot Skill Graph Specification](skill-graph/graph-definition.md)
  Core graph model and formal vocabulary.
- [General Goal System and Migration](skill-graph/general-goal-system-and-migration.md)
  Long-term goal-system split and migration direction.
- [Node Types](skill-graph/node-types.md)
  Node semantics and classification.
- [View Projection and Goal Placement](skill-graph/view-projection-and-goal-placement.md)
  Scope-specific learner-facing views and placement semantics.
- [Source And Resource Links](skill-graph/source-and-resource-links.md)
  Provenance and source/reference semantics.
- [Atomic Goal Visualizations](skill-graph/atomic-goal-visualizations.md)
  Production pipeline and review rules for optional atomic-goal image assets.
- [Human-Readable Source Rationales](skill-graph/human-readable-source-rationales.md)
  Generated explanation model for tracing learning goals back to source evidence.
- [Learning-Goal Book and Evidence-Review Pipeline](skill-graph/learning-goal-book-and-evidence-review-pipeline.md)
  Versioned one-goal-per-page HTML/PDF publication and fast multi-AI evidence-review model with a separate slow public feedback channel.
- [Canonical Gymnasium Rollout Policy](skill-graph/canonical-gymnasium-rollout.md)
  Conceptual rollout rules for canonical German Gymnasium subjects.
- [MEM/FWU Roundtrip Plan](skill-graph/mem-fwu-roundtrip-plan.md)
  Concept plan for MEM/FWU graph interchange.
- [Dual Curriculum Package Releases](skill-graph/dual-curriculum-package-releases.md)
  Target architecture for equivalent JSON-runtime and FWU-ontology release packages, standalone consumption, and repository decoupling.

## Didactic Concepts

- [Feynman Technique for Learning](didactic/feynman-rules.md)
- [Frontier Goal Selection Strategies & Autopilot](didactic/frontier-goal-selection-strategies-autopilot.md)
- [Curriculum-Zeitachse, Pufferplanung und Soll-Ist-Lerntempo](didactic/curriculum-time-axis-and-pacing.md)
  Versionierte Zeitplanung als getrennte Ausführungsebene mit
  Unterrichtskalender, Clusterblöcken, datierten Meilensteinen, Puffer,
  Ist-/Soll-Tacho, belastbarer Achievement-Historie und einer Ein-Seiten-Sicht
  für Lehrkraftplan, Unterrichts-IST und Klassenlernstand.
- [Learning Velocity](didactic/learning-velocity.md)

## Runtime Workflows

- [Learning Workflow](runtime-workflows/learning-workflow.md)
- [Import/Export Workflow](runtime-workflows/import-export-workflow.md)
- [Client-State Sync](runtime-workflows/client-state-sync.md)
- [Verhaltensintegration des MCP-Lerncoaches](runtime-workflows/openai-mcp-coach-behavioral-integration.md)
  Normativer Nordstern, allgemeines Coach-Verhaltensmodell, Golden Journeys und objektive End-to-End-Acceptance.
- [Kommunikationsvertrag zwischen ChatClient und SkillPilot-Backend](runtime-workflows/provider-neutral-coach-boundary.md)
  Kanonische, einfache Verantwortungsgrenze für Sprache, Zustand, Tooldesign, Capabilities, Ergebnisse, Fortsetzung und Fehler aller Coach-Adapter.
- [SkillPilot-Lerncoach: OpenAI-Plugin-, Skill- und MCP-App-Architektur](runtime-workflows/skillpilot-owned-coach-architecture.md)
  Target architecture for one multilingual public plugin per contract major, combining a neutral-English coaching skill with a directly submitted MCP server while preserving backend-authoritative interaction language, the SkillPilot domain core, direct provider billing, and staged production gates.
- [OpenAI-Plugin: Versionierung und Lebenszyklus](runtime-workflows/openai-plugin-versioning-and-lifecycle.md)
  Binding version-line, compatibility, snapshot, lifecycle, release, and retirement rules for the multilingual `SkillPilot Coach v1` plugin.
- [OpenAI-MCP-App: OAuth-Appbindung und 24h-Lernsession](runtime-workflows/openai-mcp-oauth-learner-session-architecture.md)
  Normative separation of the fixed confidential OAuth client that authenticates the App and the fresh, automatically transported, absolute 24-hour learning session that addresses the learner.
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
