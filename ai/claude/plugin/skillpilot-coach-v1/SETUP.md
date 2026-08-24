# Set up SkillPilot Coach

## Choose exactly one connector route

SkillPilot has two deliberately separate Claude installation routes:

- **Normal Claude Web:** use the published **SkillPilot** entry in the
  **Connectors Directory**. This is the normal learner-facing browser route.
  Do not upload or install this plugin package in normal Claude Web.
- **Claude Cowork and Claude Code:** use `skillpilot-coach-v1.plugin`. The
  plugin package is scoped to Claude Cowork and Claude Code; it contains the
  coaching Skill and one declaration for the remote SkillPilot connector.

The routes are alternatives, not cumulative installation steps. Never enable a
Directory, custom and plugin-bundled SkillPilot connector together in the same
Claude surface or workspace. If Anthropic already exposes an existing
SkillPilot connector there, use that connection or disable it before installing
the plugin. Do not enable the bundled and standalone variants at the same time.

All twelve MCP tools and both interactive MCP Apps come from the remote
SkillPilot connector. The Skill provides coaching instructions only. Neither
the Skill nor the plugin shell implements or duplicates the tools or UIs.

## Normal Claude Web through the Connectors Directory

1. In Claude Web, open **Customize > Connectors**, find the published
   **SkillPilot** entry in the Connectors Directory and select **Connect**.
2. Complete the normal OAuth flow. The `offline_access` scope keeps this
   technical connector connection available; it contains no learner identity
   and selects no SkillPilot learning profile.
3. Open <https://skillpilot.com/> in the first-party SkillPilot WebGUI. In the
   shared web start, visibly choose or load the SkillPilot ID, confirm the
   curriculum and Personal Curriculum, then explicitly choose **Mit Claude
   starten**. SkillPilot creates a fresh opaque `spc_...` learning-session value
   that is valid for exactly 24 hours and prepares the Claude start prompt. The
   permanent SkillPilot ID remains inside SkillPilot.
4. SkillPilot opens Claude Web with its generated start prompt already filled
   into the composer. Review it and select **Send**; do not manually transport
   the prompt. Claude may show its warning for externally supplied input. For
   example, the learning request begins with:

   > Lade mit SkillPilot meinen aktuellen Lernkontext. Fasse mein aktives
   > Lernziel zusammen und schlage den nächsten sinnvollen Schritt vor.

Every SkillPilot tool call in that chat uses the generated `learningSessionId`.
The Web handoff places it transiently in the exact `q` parameter of
`https://claude.ai/new`; do not share that address, copy the value into other
chats, publish it, or ask the learner to type it separately. When the 24 hours
have elapsed, return to the first-party start page and create a new session.
Reconnect the Directory connector only if Claude reports that its technical
OAuth connection is no longer active.

The connector always requires OAuth. It needs no custom request headers and no
manually registered client ID. OAuth authorizes only the technical connector
transport; the separate 24-hour `spc_...` session authorizes learner access.

## Plugin package for Claude Cowork and Claude Code

1. Confirm that no Directory or custom SkillPilot connector is active in the
   target Cowork or Claude Code workspace. The package must not create a second
   SkillPilot tool set beside an existing connection.
2. Install `skillpilot-coach-v1.plugin` with the plugin installation flow
   offered by Cowork or Claude Code. This package is not the normal Claude Web
   installation artifact.
3. Complete OAuth for the one bundled remote connector. The same separation
   applies: OAuth persists only the technical connection and never chooses a
   learner identity or Personal Curriculum.

The plugin contributes the coaching Skill to these two plugin-capable surfaces.
It uses the connector-owned tools and MCP Apps without copying their schemas,
resources or UI bytes into the plugin package. Public availability in normal
Claude Web is provided independently by the Connectors Directory entry.

The connector currently targets adult users aged 18 or older. Availability of
Connectors Directory entries, Cowork and Claude Code plugins on a particular
plan or workspace is governed by Anthropic. This package does not claim native
mobile-plugin support.

## If no learning context is available

Create or resume the learning profile at <https://skillpilot.com>. Choose the
personal curriculum and learning scope there, then return to Claude and reconnect
or, preferably, create a fresh start at
<https://skillpilot.com/>. Claude may coach and update the selected
learning path, but the first-party SkillPilot site owns curriculum setup and
later corrections or withdrawals of ordinary completion.

## Maintainer validation and updates

Run the repository-local structural check and tests:

```bash
node ai/claude/plugin/skillpilot-coach-v1/check-package.mjs
node --test ai/claude/plugin/skillpilot-coach-v1/check-package.test.mjs
node --test ai/claude/plugin/skillpilot-coach-v1/build-package.test.mjs
node ai/claude/plugin/skillpilot-coach-v1/build-package.mjs
```

Before publication, also run the official Anthropic check in an environment with
the Claude CLI installed:

```bash
claude plugin validate ai/claude/plugin/skillpilot-coach-v1 --strict
```

The local check does not replace that external release gate or a real Claude OAuth
and tool-flow acceptance run.

Compatible package improvements increment the plugin's semantic version while the
Claude v1 connector contract remains compatible. A breaking instruction package
uses a new major plugin version. A breaking MCP, OAuth, identity, or state contract
also requires a separately reviewed connector major and endpoint; it must not
silently replace the v1 endpoint.
