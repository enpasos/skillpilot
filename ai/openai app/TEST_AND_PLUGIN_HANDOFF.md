# SkillPilot Coach V1: test and plugin handoff

## Authoritative target

There is one V1 plugin and one V1 MCP endpoint:

| Item | Value |
|---|---|
| Plugin | `SkillPilot Coach v1` |
| Identity | `skillpilot-coach-v1` |
| Public URL | `https://mcp-coach-v1.skillpilot.com/mcp` |
| Public origin | `https://mcp-coach-v1.skillpilot.com` |
| Contract language | English protocol metadata |
| Learner language | SkillPilot session `communicationLocale` |
| Runtime | the existing shared Spring Boot process |

Do not register separate German and English apps. Do not add `/mcp/de` or
`/mcp/en`, language-suffixed tools, locale tool arguments, separate OAuth
clients, or language-specific release archives.

## What the Node prototype proves

Run:

```bash
cd "ai/openai app"
npm ci
npm test
```

The suite verifies:

1. `/mcp` is the only coach endpoint.
2. German and English demo sessions see the exact same English tool catalog.
3. No public tool name ends in `_de` or `_en`.
4. No tool accepts `language` or `locale` input.
5. Localized payloads remain in the selected demo language.
6. Opaque session and choice references stay in private widget metadata.
7. The widget artifacts use the same neutral tool names.
8. The goal-visualization artifact copied into Spring is byte-identical to the
   tested build output.
9. The production V1 contract publishes exactly one content-addressed MCP Apps
   UI resource. Only `render_skillpilot_goal_visualization` references it via
   `ui.resourceUri` and `openai/outputTemplate`; ordinary tools remain UI-free.
10. The renderer supplies the widget with structured `goalVisualization` data;
    bare MCP `ImageContent` and client-surface or `openai/userAgent` gates are
    not part of the presentation contract.

The local fixture selector `x-skillpilot-demo-locale` exists only in the
standalone preview simulator. Production resolves locale from authenticated
SkillPilot session state.

## Production registration

Create or update one Developer Mode app with:

- name: `SkillPilot Coach v1`
- server URL: `https://mcp-coach-v1.skillpilot.com/mcp`
- OAuth client: the single V1 SkillPilot client configured for that app
- icon: the packaged SkillPilot icon

Complete the browser OAuth flow if the desktop app delegates installation to
the browser. A successful connection must list the neutral tools and exactly
one hash-bound goal-visualization UI resource. Exactly the dedicated renderer
must reference that resource; the app registration must not expose a language
suffix.

## Acceptance matrix

Exercise at least one German and one English SkillPilot session against the
same installed app:

| Check | German session | English session |
|---|---:|---:|
| same app identity and endpoint | required | required |
| same unsuffixed tool catalog | required | required |
| model response follows session language | German | English |
| backend payload remains in target language | German | English |
| no language parameter sent by the model | required | required |
| state survives a new ChatGPT turn | required | required |
| authorized writes remain conflict-safe | required | required |

Also test a deliberate mismatch in the chat language: ask in English while
using a German SkillPilot session. The model may understand the English user
message, but the SkillPilot coach response must follow the authoritative German
`communicationLocale` unless the product explicitly changes the session.

## Release source and snapshot

The plugin source is:

[`../openai plugin/skillpilot-coach-v1`](<../openai plugin/skillpilot-coach-v1/>).

The internal draft is generated with:

```bash
node scripts/openai_plugin_release.mjs prepare
node scripts/openai_plugin_release.mjs verify
```

The expected archive name is:

```text
skillpilot-openai-plugin-coach-v1-1.0.0.tar
```

This is a plugin install bundle. It does not contain or imply another Spring
Boot process. While no publication has occurred, compatible work continues in
`1.0.0-SNAPSHOT` without incrementing the version.

## Operational checks

Before a test installation:

1. deploy the shared SkillPilot service normally;
2. verify `https://mcp-coach-v1.skillpilot.com/mcp` challenges with the intended
   OAuth protected-resource metadata;
3. verify removed or reserved routes fail closed;
4. run the public edge smoke test;
5. update the one app registration only after the deployed contract passes.

The Node process in this directory is not a production sidecar. Its
`SKILLPILOT_WIDGET_DOMAIN` override and localized preview catalogs are test
fixtures only.
