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

## Didactic Concepts

- [Feynman Technique for Learning](didactic/feynman-rules.md)
- [Frontier Goal Selection Strategies & Autopilot](didactic/frontier-goal-selection-strategies-autopilot.md)
- [Learning Velocity](didactic/learning-velocity.md)

## Runtime Workflows

- [Learning Workflow](runtime-workflows/learning-workflow.md)
- [Import/Export Workflow](runtime-workflows/import-export-workflow.md)
- [Client-State Sync](runtime-workflows/client-state-sync.md)
- [ChatGPT Startcode / Session Flow](runtime-workflows/chatgpt-startcode-session-flow.md)

## Maintenance

- Add durable semantic or product concepts to the closest section above.
- Move implementation-only notes to `docs/dev/` and operational QA rules to `docs/qa-ci/`.
- `cd app && npm run check:docs-indexes` fails if a Markdown file under `docs/concept/` is missing from this index.
