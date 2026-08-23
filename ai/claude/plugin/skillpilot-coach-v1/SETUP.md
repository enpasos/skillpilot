# Set up SkillPilot Coach

## Recommended integrated install

The **SkillPilot Coach** plugin bundles this coaching Skill and the remote
SkillPilot connector into one installation. The connector supplies the MCP
tools and both interactive MCP Apps. This plugin is therefore the preferred
installation path whenever Plugins are available for the account. Anthropic
currently documents plugins for paid Claude plans in web Chat, the Chat tab in
Claude Desktop and Claude Cowork.

1. If a separately uploaded SkillPilot Skill or custom SkillPilot connector is
   already active, disable it before installing the plugin. Do not enable the
   bundled and standalone variants at the same time.
2. Until the public directory entry is available, open **Customize > Plugins**
   and upload `skillpilot-coach-v1.plugin`. After publication, browse for
   **SkillPilot Coach** there and select **Install** instead.
3. Connect the bundled connector once through the normal OAuth flow. The
   `offline_access` scope keeps this technical plugin connection available; it
   contains no learner identity and selects no SkillPilot learning profile.
4. Open <https://skillpilot.com/?coach=claude> in the first-party SkillPilot
   WebGUI. In the shared web start, visibly choose or load the SkillPilot ID,
   confirm the curriculum and Personal Curriculum, then explicitly choose
   **Mit Claude starten**. SkillPilot creates a fresh opaque `spc_...`
   learning-session value that is valid for exactly 24 hours and prepares the
   Claude start prompt. The permanent SkillPilot ID remains inside SkillPilot.
5. SkillPilot opens Claude Web with its generated start prompt already filled
   into the composer. Review it and select **Send**; do not manually transport
   the prompt. Claude may show its warning for externally supplied input. For
   example, the learning request begins with:

   > Lade mit SkillPilot meinen aktuellen Lernkontext. Fasse mein aktives
   > Lernziel zusammen und schlage den nächsten sinnvollen Schritt vor.

Every SkillPilot tool call in that chat uses the generated `learningSessionId`.
The Web handoff places it transiently in the exact `q` parameter of
`https://claude.ai/new`; do not share that address, copy the value into other
chats, publish it, or ask the learner to type it separately. When the 24 hours
have elapsed, return to the first-party start page
and create a new session. Reconnecting the plugin is normally unnecessary.

The connector always requires OAuth. It needs no custom request headers and no
manually registered client ID. OAuth authorizes only the technical connector
transport; the separate 24-hour `spc_...` session authorizes learner access. A
personally uploaded plugin may remain local to the Claude client that imported
it; public cross-client availability is a separate directory-publication gate.

## Standalone fallback

On a Claude plan or surface where plugin installation is unavailable, install
the standalone Skill ZIP and open **Customize > Connectors > Add custom
connector** with:

- URL: `https://mcp-claude-v1.skillpilot.com/mcp`
- Authentication: **Always required**
- OAuth client: **Anthropic-hosted client metadata**
- Additional request headers: none

Complete the same transport-only OAuth connection, then always start learning at
<https://skillpilot.com/?coach=claude>. The standalone installation has no
learning-session or UI advantage over the plugin; it exists only for accounts or
surfaces where the integrated plugin cannot be installed.

Do not additionally install this fallback when the full plugin is active. The
connector currently targets adult users aged 18 or older. Availability of custom
connectors, Skills and plugins on a particular Claude surface or plan is
governed by Anthropic. This package does not claim native mobile-plugin support;
use only a route that the current client actually offers.

## If no learning context is available

Create or resume the learning profile at <https://skillpilot.com>. Choose the
personal curriculum and learning scope there, then return to Claude and reconnect
or, preferably, create a fresh start at
<https://skillpilot.com/?coach=claude>. Claude may coach and update the selected
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
