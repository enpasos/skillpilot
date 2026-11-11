## Atomic Goal Visualizations {#sec:sga-goal-visualizations}

Optional concept illustrations help learners grasp the core idea of an atomic learning goal visually without replacing independent reasoning or task solving.

### Canonical Link Schema and MCP App Presentation Contract {#sec:sga-vis-contract}

Reviewed visualizations attach to canonical atomic goals via `resourceLinks`:

```json
{
  "type": "goal-visualization",
  "resourceType": "image",
  "role": "primary",
  "skillpilotId": "<exact-canonical-goal-id>",
  "url": "/assets/goal-visualizations/<subject>/<id>/<id>.png"
}
```

In MCP-capable hosts such as OpenAI ChatGPT, `render_skillpilot_goal_visualization` serves a surface-neutral `text/html;profile=mcp-app` widget governed by a one-shot `(goalId, stateVersion)` presentation authorization and the learner toggle `showGoalVisualizationsInChat`. The widget remains collapsed until the image loads cleanly, accepts bounded MCP result envelopes while using persisted widget state only as a bootstrap fallback, and retains all previously advertised content-addressed UI resource hashes unchanged.

### Production Workspace, Format, and Provider Policy {#sec:sga-vis-providers anchors="provider-priority-and-exception-policy"}

Authoring prompts, candidate generation, and QA ledgers reside under `curricula/DE/Gymnasium/visualizations/` (`prompt.de.md`, `image-reconstruction-prompt.de.md`, published via `npm run deploy:assets` at 16:9 ~`1600x900` PNG and inspected at both `360px` mobile and `680px` desktop widths, calibrated on pilot goal `502ecaa7-cca6-5c51-a1cc-da09a7b2382c`).

Under the binding **Product Owner decision of 13 September 2026**:

- **Default `KEEP`:** Retain good existing Mathematics and Physics images regardless of which provider generated them; never regenerate retro-actively merely to unify providers.
- **Provider priority for new or defective images:** Prefer **ChatGPT/Codex image generation** in SkillPilot's friendly, abstract, clear, comic-like raster style when subject-matter accuracy and representation fit. **Nano Banana Pro** (`gemini-3-pro-image`) is an allowed alternative whenever it better serves the didactic representation — no prior failed attempt with the other provider is required.
- **Narrow SVG/programmatic exception:** Programmatically plotted diagrams or SVGs remain narrow, explicitly documented exceptions justified by exact geometric/function-plot precision, never a blanket style replacement.

### CLI Workflow and Two-Stage Review Gates {#sec:sga-vis-review}

Helper scripts in `app/` (`visualization:generate:nano-banana`, `visualization:plan-batch`, `visualization:check-prompt-appends`, `visualization:prepare`, `visualization:import`) separate asset generation from approval:

1. **AI QA ledger (`aiApprovedAssetSha256` / Gate V):** Records structured review labels (`accepted_pilot`, `accepted_pilot_after_regeneration`, `rejected_regenerate`, `deferred_provider_limitation`, `needs_external_review`) bound to exact file SHA-256 digests.
2. **Human publication gate (`humanApproved`, `HR-003`):** Public Standalone releases and `public`-mode GoalBooks (@ref{sec:sga-goal-book}, [Human Review Gates](repo:docs/qa-ci/curriculum-package-human-review-gates.en.md)) require explicit human content and rights clearance (`CC-BY-4.0` vs. provenance); generation or AI review alone never grants publication approval.
