# Concept Documentation Index

This page is the entry point for durable SkillPilot concepts. Keep implementation plans and migration workboards in `docs/dev/`; keep CI rules and review processes in `docs/qa-ci/`.

## Foundations

- [Levels of Personalization](levels-of-personalization.md)
  Product-level personalization model.

## Curriculum Graph

- [SkillPilot Curriculum Graph Specification](curriculum-graph/graph-definition.md)
  Core graph model and formal vocabulary.
- [General Goal System and Migration](curriculum-graph/general-goal-system-and-migration.md)
  Long-term goal-system split and migration direction.
- [Node Types](curriculum-graph/node-types.md)
  Node semantics and classification.
- [View Projection and Goal Placement](curriculum-graph/view-projection-and-goal-placement.md)
  Scope-specific learner-facing views and placement semantics.
- [Source And Resource Links](curriculum-graph/source-and-resource-links.md)
  Provenance and source/reference semantics.
- [Atomic Goal Visualizations](curriculum-graph/atomic-goal-visualizations.md)
  Production pipeline and review rules for optional atomic-goal image assets.
- [Human-Readable Source Rationales](curriculum-graph/human-readable-source-rationales.md)
  Generated explanation model for tracing learning goals back to source evidence.
- [Canonical Gymnasium Rollout Policy](curriculum-graph/canonical-gymnasium-rollout.md)
  Conceptual rollout rules for canonical German Gymnasium subjects.
- [MEM/FWU Roundtrip Plan](curriculum-graph/mem-fwu-roundtrip-plan.md)
  Concept plan for MEM/FWU graph interchange.
- [Dual Curriculum Package Releases](curriculum-graph/dual-curriculum-package-releases.md)
  Target architecture for equivalent JSON-runtime and FWU-ontology release packages, standalone consumption, and repository decoupling.

## Didactic Concepts

- [Feynman Technique for Learning](didactic/feynman-rules.md)
- [Frontier Goal Selection Strategies & Autopilot](didactic/frontier-goal-selection-strategies-autopilot.md)
- [Learning Velocity](didactic/learning-velocity.md)

## Runtime Workflows

- [Learning Workflow](runtime-workflows/learning-workflow.md)
- [Import/Export Workflow](runtime-workflows/import-export-workflow.md)
- [Client-State Sync](runtime-workflows/client-state-sync.md)
- [Provider-Neutral Learning-Coach Boundary](runtime-workflows/provider-neutral-coach-boundary.md)
  Shared application, safe projection, exam boundary, context-recovery and concurrency decisions for AI coach adapters.
- [SkillPilot-Lerncoach: providergehostete MCP-App-Architektur](runtime-workflows/skillpilot-owned-coach-architecture.md)
  Target architecture for separately registered German and English provider-hosted MCP apps, a shared authoritative SkillPilot domain core, direct provider billing, and staged production gates.
- [Migration des deutschen Lerncoaches zur OpenAI-MCP-App](runtime-workflows/openai-mcp-coach-migration-plan.md)
  DE-first implementation, workflow parity, staged cutover, rollback, and the direct Spring Boot MCP runtime boundary.
- [OpenAI-MCP-App: OAuth-, Lernenden- und 24h-Sitzungsbindung](runtime-workflows/openai-mcp-oauth-learner-session-architecture.md)
  Normative separation of OpenAI-connector mTLS, CIMD plus `private_key_jwt`, automatic OAuth token transport, first-party learner binding, opaque provider identity, and the absolute 24-hour learning session.
- [OpenAI-MCP-Clientbindung](../security/openai-mcp-client-binding.md)
  Security source of truth for the mTLS edge, stable CIMD OAuth-client identity, resource and scope binding, learner mapping, and fail-closed cutover.
- [Wissens- und Verhaltensparität des deutschen MCP-Lerncoaches](runtime-workflows/openai-mcp-coach-knowledge-parity.md)
  Normative mapping from the previous Custom-GPT knowledge package to server instructions, fresh context policies, tool contracts, and backend guards.
- [ChatGPT Visible Session Flow](runtime-workflows/chatgpt-visible-session-flow.md)
  Retained Custom-GPT rollback runtime with visible cross-turn relay; not the current production reference architecture.
- [Legacy ChatGPT Startcode / Session Flow](runtime-workflows/chatgpt-startcode-session-flow.md)
  Historical retained rollback architecture; not the current ChatGPT path.

## Maintenance

- Add durable semantic or product concepts to the closest section above.
- Move implementation-only notes to `docs/dev/` and operational QA rules to `docs/qa-ci/`.
- `cd app && npm run check:docs-indexes` fails if a Markdown file under `docs/concept/` is missing from this index.
