# Set up SkillPilot Coach

## Recommended integrated install

The **SkillPilot Coach** plugin bundles this coaching Skill and the remote
SkillPilot connector into one installation. Anthropic currently documents
plugins for paid Claude plans in web Chat, the Chat tab in Claude Desktop and
Claude Cowork.

1. If a separately uploaded SkillPilot Skill or custom SkillPilot connector is
   already active, disable it before installing the plugin. Do not enable the
   bundled and standalone variants at the same time.
2. Until the public directory entry is available, open **Customize > Plugins**
   and upload `skillpilot-coach-v1.plugin`. After publication, browse for
   **SkillPilot Coach** there and select **Install** instead.
3. Start a new chat and ask Claude to use SkillPilot.
4. Complete the SkillPilot sign-in page when Claude opens it. Select the encrypted
   `.skillpilot` file there and enter its password there. Never paste the file,
   password, authorization code, or token into the chat.
5. Start with:

   > Lade mit SkillPilot meinen aktuellen Lernkontext. Fasse mein aktives
   > Lernziel zusammen und schlage den nächsten sinnvollen Schritt vor.

The connection always requires OAuth. It needs no custom request headers and no
manually registered client ID. A personally uploaded plugin may remain local to
the Claude client that imported it; public cross-client availability is a
separate directory-publication gate.

## Standalone fallback

On a Claude plan or surface where plugin installation is unavailable, install
the standalone Skill ZIP and open **Customize > Connectors > Add custom
connector** with:

- URL: `https://mcp-claude-v1.skillpilot.com/mcp`
- Authentication: **Always required**
- OAuth client: **Anthropic-hosted client metadata**
- Additional request headers: none

Complete the same browser-based SkillPilot connection flow. The file password
stays on that SkillPilot page and is not a chat credential.

Do not additionally install this fallback when the full plugin is active. The
connector currently targets adult users aged 18 or older. Availability of custom
connectors, Skills and plugins on a particular Claude surface or plan is
governed by Anthropic. This package does not claim native mobile-plugin support;
use only a route that the current client actually offers.

## If no learning context is available

Create or resume the learning profile at <https://skillpilot.com>. Choose the
personal curriculum and learning scope there, then return to Claude and reconnect
or retry. Claude may coach and update the selected learning path, but the
first-party SkillPilot site owns curriculum setup and later corrections or
withdrawals of ordinary completion.

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
