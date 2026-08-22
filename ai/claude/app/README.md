# SkillPilot Claude Connector v1 MCP Apps

This provider-isolated package builds the two MCP Apps resources used by the
Claude Connector v1 candidate:

- the read-only active-goal visualization;
- private, interactive normal flashcard practice.

It does not import, regenerate, or write the frozen OpenAI V1 package or its
runtime resources. The two providers share learning semantics, not build
artifacts or identity assumptions.

## Identity and privacy boundary

Claude identity is the authenticated OAuth connection. These apps therefore
never receive, persist, construct, or submit an OpenAI-style
`learningSessionId`.

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

The flashcard app calls the review tool with `goalId`, `cardId`,
`reviewCapability`, `rating`, `expectedStateVersion`, `clientRequestId`, and
`language`. Loading a further private batch calls the start tool with `goalId`,
`expectedStateVersion`, and `language`. OAuth supplies the connection identity.

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
