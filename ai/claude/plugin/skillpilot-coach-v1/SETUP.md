# Set up SkillPilot Coach

## Simplest start for everyone

Use the **SkillPilot** connector from Claude's Connectors Directory. The remote
connector is the universal distribution route for Claude.ai, Desktop, Mobile,
Cowork and Claude Code, subject to Anthropic's current product and workspace
availability.

1. Connect **SkillPilot** from the Connectors Directory.
2. Start a new chat and ask Claude to use SkillPilot.
3. Complete the SkillPilot sign-in page when Claude opens it. Select the encrypted
   `.skillpilot` file there and enter its password there. Never paste the file,
   password, authorization code, or token into the chat.
4. Start with:

   > Lade mit SkillPilot meinen aktuellen Lernkontext. Fasse mein aktives
   > Lernziel zusammen und schlage den nächsten sinnvollen Schritt vor.

The connection always requires OAuth. It needs no custom request headers and no
manually registered client ID.

## Optional plugin for Claude Code and Cowork

The **SkillPilot Coach** plugin adds the reusable coaching Skill from this
package and points at the same remote connector. It is an optional companion for
Claude Code and Cowork, not the installation route for Claude.ai, Desktop or
Mobile. When both the Directory connector and the plugin are available, they
address the same MCP server and must not be presented as two independent
SkillPilot tool sets.

After the plugin is published, install **SkillPilot Coach** from the plugin
directory, start a fresh Claude Code or Cowork conversation, and complete the
same OAuth flow when prompted.

## Manual connector fallback

Until the Connector Directory entry is available, or when diagnosing installation,
open **Customize > Connectors > Add custom connector** and use:

- URL: `https://mcp-claude-v1.skillpilot.com/mcp`
- Authentication: **Always required**
- OAuth client: **Anthropic-hosted client metadata**
- Additional request headers: none

Complete the same browser-based SkillPilot connection flow. The file password
stays on that SkillPilot page and is not a chat credential.

The connector currently targets adult users aged 18 or older. Availability of
custom connectors and plugins on a particular Claude surface or plan is governed
by Anthropic.

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
```

Before publication, also run the official Anthropic check in an environment with
the Claude CLI installed:

```bash
claude plugin validate ai/claude/plugin/skillpilot-coach-v1
```

The local check does not replace that external release gate or a real Claude OAuth
and tool-flow acceptance run.

Compatible package improvements increment the plugin's semantic version while the
Claude v1 connector contract remains compatible. A breaking instruction package
uses a new major plugin version. A breaking MCP, OAuth, identity, or state contract
also requires a separately reviewed connector major and endpoint; it must not
silently replace the v1 endpoint.
