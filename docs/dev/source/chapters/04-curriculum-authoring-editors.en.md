## Curriculum Authoring Editors {#sec:dev-authoring-editors}

SkillPilot separates local Vite development-server authoring tools by semantic layer rather than mixing canonical graph editing, flashcard curation, and scope-view composition into one monolithic UI.

### Four Local Vite Editors and Route Architecture {#sec:dev-ae-overview}

| Editor | Frontend Route & Dev Middleware | Owned Artifact Layer |
| --- | --- | --- |
| **Flashcard Editor** (@ref{sec:dev-flashcard-editor}) | `/flashcard-editor` · `/__deck-editor/*` | `*_deck*.json` flashcard decks (`curricula/...` + `app/public/data/`). |
| **Graph Editor** (@ref{sec:dev-graph-editor}) | `/graph-editor` · `/__graph-editor/*` | Narrow `requires` refactoring and cluster-to-atomic prerequisite normalization on landscape JSONs. |
| **Canonical Cluster Editor** | `/canonical-cluster-editor` · `/__canonical-cluster-editor/*` | Canonical `contains` cluster hierarchy, sibling order, and cluster metadata in `curricula/DE/Gymnasium/canonical/`. |
| **Composition View Editor** | `/composition-view-editor` · `/__composition-view-editor/*` | Scope-specific `*.view.json` upper trees (`structure` nodes + cluster-only `canonicalSubtree` attachments). |
{cols="26%,34%,40%"}

All `/__*` file-mutation endpoints exist **exclusively** inside local Vite dev-server middleware (`vite.config.ts`) and are never exposed in production builds.

### Three-Pane Layout, Blocking vs. Warning Validations, and Rollout Order {#sec:dev-ae-validation}

Both V1 structural editors use a three-pane layout (left tree navigator, center node/attachment inspector, right live compiled-preview & diagnostics pane):

- **Blocking save validations (reject write):** Malformed JSON, duplicate IDs, `contains` cycles, dangling `goalId` references, authoring atomic goals inline inside `.view.json`, or overlapping `canonicalSubtree` expansions violating single-occurrence projection ([View Projection](repo:docs/concept/skill-graph/view-projection-and-goal-placement.md)).
- **Non-blocking warnings (allow save with diagnostic badge):** Unreferenced canonical clusters in a partial draft view, `unplacedInScope` candidates, or pending downstream QA reruns (`npm run validate:graph`, `validate:views`).
- **Four-phase implementation sequence:** (1) Read-only compiled tree & diagnostic inspector $\to$ (2) `Canonical Cluster Editor` save pipeline $\to$ (3) `Composition View Editor` `.view.json` authoring $\to$ (4) cross-view coverage diffing (deliberate non-goals: multi-user cloud editing, automatic AI graph rewriting, or editing learner state).
