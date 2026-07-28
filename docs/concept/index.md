# Concept Documentation Index

This page is the entry point for durable SkillPilot concepts. Keep implementation plans and migration workboards in `docs/dev/`; keep CI rules and review processes in `docs/qa-ci/`.

## Foundations

- [Glossary](glossary.md)
  Precise definitions of the core SkillPilot terms, with German equivalents and the normative source per term.
- [Levels of Personalization](levels-of-personalization.md)
  Product-level personalization model.

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
- [Canonical Gymnasium Rollout Policy](skill-graph/canonical-gymnasium-rollout.md)
  Conceptual rollout rules for canonical German Gymnasium subjects.
- [MEM/FWU Roundtrip Plan](skill-graph/mem-fwu-roundtrip-plan.md)
  Concept plan for MEM/FWU graph interchange.
- [Dual Curriculum Package Releases](skill-graph/dual-curriculum-package-releases.md)
  Target architecture for equivalent JSON-runtime and FWU-ontology release packages, standalone consumption, and repository decoupling.

## Didactic Concepts

- [Feynman Technique for Learning](didactic/feynman-rules.md)
- [Frontier Goal Selection Strategies & Autopilot](didactic/frontier-goal-selection-strategies-autopilot.md)
- [Learning Velocity](didactic/learning-velocity.md)

## Runtime Workflows

- [Learning Workflow](runtime-workflows/learning-workflow.md)
- [Import/Export Workflow](runtime-workflows/import-export-workflow.md)
- [Client-State Sync](runtime-workflows/client-state-sync.md)
- [Verhaltensintegration des deutschen MCP-Lerncoaches](runtime-workflows/openai-mcp-coach-behavioral-integration.md)
  Normativer Nordstern, allgemeines Coach-Verhaltensmodell, Golden Journeys, objektive Acceptance und Übergabe für neue Chats auf dem Weg von technischer MCP-Migration zu echter Endnutzerparität.
- [Provider-Neutral Learning-Coach Boundary](runtime-workflows/provider-neutral-coach-boundary.md)
  Shared application, safe projection, exam boundary, context-recovery and concurrency decisions for AI coach adapters.
- [SkillPilot-Lerncoach: providergehostete MCP-App-Architektur](runtime-workflows/skillpilot-owned-coach-architecture.md)
  Target architecture for separately registered German and English provider-hosted MCP apps, a shared authoritative SkillPilot domain core, direct provider billing, and staged production gates.
- [Migration des deutschen Lerncoaches zur OpenAI-MCP-App](runtime-workflows/openai-mcp-coach-migration-plan.md)
  DE-first implementation, workflow parity, staged cutover, rollback, and the direct Spring Boot MCP runtime boundary.
- [OpenAI-MCP-App: OAuth-Appbindung und 24h-Lernsession](runtime-workflows/openai-mcp-oauth-learner-session-architecture.md)
  Normative separation of the fixed confidential OAuth client that authenticates the App and the fresh, automatically transported, absolute 24-hour learning session that addresses the learner.
- [OpenAI-MCP-Clientbindung](../security/openai-mcp-client-binding.md)
  Security source of truth for `client_secret_basic`, exact callback/resource/scope binding, optional edge-mTLS hardening, secret lifecycle, and the independent learner-session boundary.
- [Wissens- und Verhaltensparität des deutschen MCP-Lerncoaches](runtime-workflows/openai-mcp-coach-knowledge-parity.md)
  Technical mapping from the previous Custom-GPT knowledge package to server instructions, fresh context policies, tool contracts, and backend guards; end-user behavioral parity is tracked separately.
- [ChatGPT Visible Session Flow](runtime-workflows/chatgpt-visible-session-flow.md)
  Retained Custom-GPT rollback runtime with visible cross-turn relay; not the current production reference architecture.
- [Legacy ChatGPT Startcode / Session Flow](runtime-workflows/chatgpt-startcode-session-flow.md)
  Historical retained rollback architecture; not the current ChatGPT path.

## Maintenance

- Add durable semantic or product concepts to the closest section above.
- Move implementation-only notes to `docs/dev/` and operational QA rules to `docs/qa-ci/`.
- `cd app && npm run check:docs-indexes` fails if a Markdown file under `docs/concept/` is missing from this index.
