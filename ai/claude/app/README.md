# SkillPilot Claude Connector v1 MCP Apps

This provider-isolated package builds the two MCP Apps resources used by the
Claude Connector v1 candidate:

- the read-only active-goal visualization;
- private, interactive normal flashcard practice.

It does not import, regenerate, or write the frozen OpenAI V1 package or its
runtime resources. The two providers share learning semantics, not build
artifacts or identity assumptions.

## Identity and privacy boundary

Connector OAuth authenticates the transport but neither contains nor selects
the learner. SkillPilot learner identity is represented only by the opaque
`spc_...` `learningSessionId` created by the first-party start flow. The app
receives that value only in private result `_meta`, keeps it in memory, and
returns it only in component-local review or continuation tool arguments. It
never reads a permanent SkillPilot ID.

Flashcard fronts, backs, card IDs, and review capabilities are accepted only
from result `_meta.skillpilotMemoryCard`. They are never read from
model-visible `structuredContent`. The latter contains only bounded status and
progress. The review tool is intended to be published with
`_meta.ui.visibility: ["app"]`.

The apps use an explicit silent `postMessage` transport rather than the
diagnostic default transport. JSON-RPC validation errors contain no payload,
the production bundle removes console calls, and KaTeX diagnostic commands
that would print private card text are rejected before rendering.

## Backend contract

The generated manifest pins the exact integration contract:

- `render_skillpilot_goal_visualization` binds the goal-visualization resource;
- `start_skillpilot_memory_practice` binds the flashcard resource;
- `review_skillpilot_memory_practice_card` is app-only;
- resource URIs are under `ui://skillpilot/claude/connector/v1/` and contain
  the SHA-256 of the exact HTML bytes.

Resource metadata uses Claude's endpoint-derived sandbox domain
`ee8f5203b9b3d186c660c802e340f19c.claudemcpcontent.com` (without a URL
scheme). CSP is declared only on each resource and uses only the standard MCP
Apps fields.

The flashcard app calls the review tool with `learningSessionId`, `goalId`,
`cardId`, `reviewCapability`, `rating`, `expectedStateVersion`,
`clientRequestId`, and `language`. Loading a further private batch calls the
start tool with `learningSessionId`, `goalId`, `expectedStateVersion`, and
`language`. The temporary session is never rendered or logged.

## Build and test

```bash
npm ci
npm test
```

`npm run build` replaces only this directory's `dist/` tree and writes
`dist/manifest.json` plus both content-addressed HTML files. It also refreshes
the stable, tracked runtime copies at
`backend/src/main/resources/claude-connector-v1/mcp-apps/`. Tests require the
stable classpath copies to be byte-identical to their content-addressed `dist`
counterparts. Before replacing a changed active resource, the build retains its
exact previous bytes under the old hash URI and records them in
`retained-resources.json`. The backend keeps those older resources passively
readable for existing chats, while tools bind only the two current URIs. The
build is deterministic for a fixed lockfile and source tree.

Every generated HTML resource embeds the complete license texts for exactly
the production dependencies reported by esbuild. The pinned notice catalog
fails the build if a bundled package, declared license, or license text changes
without review.

## Image loading lifecycle

The image app stays collapsed until a valid image has loaded. It waits for the
host's tool result and the image request without a local timeout that destroys
the app. MCP Apps hosts can initialize a view before the tool completes; after
a view closes, the host may skip delivery of its result. See the
[MCP Apps tool-result lifecycle](https://apps.extensions.modelcontextprotocol.io/api/classes/app-bridge.AppBridge.html#sendtoolresult).
Actual connection or image errors and an unusable initial tool result still
collapse the app and request teardown.

Lifecycle tests cover delayed results, slow images and successive learning
goals. They check local behavior; visibility in a real Claude conversation
still requires a client check.
