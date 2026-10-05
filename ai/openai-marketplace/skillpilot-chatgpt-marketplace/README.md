# SkillPilot for ChatGPT Desktop — beta Git marketplace

This repository distributes **SkillPilot Coach v1** with its coaching skill and
remote SkillPilot MCP connection. The package version is **1.1.2**. A source
checkout or local export does not establish publication or host acceptance.
See the operator runbook for the recorded deployment status. This beta
uses the desktop plugin installer. Start the plugin in the desktop app's
**Work** area, not **Chat**. It has no published OpenAI Directory listing.
ChatGPT web and native mobile operation have not been accepted.

## Install in ChatGPT Desktop

In the Windows desktop app:

1. Open **Plugins → Hinzufügen → Marketplace hinzufügen**.
2. Add `https://github.com/enpasos/skillpilot-chatgpt-marketplace`.
3. Select the marketplace **skillpilot-chatgpt-marketplace** and install
   **SkillPilot Coach v1**. Check the installed version.
4. Connect SkillPilot using the plugin's authentication flow. Use **Auto** or
   **CIMD** if the desktop asks for a registration method; no client secret is
   supplied by the tester.
5. Open [SkillPilot](https://skillpilot.com/), complete the learning setup,
   select **ChatGPT Desktop (Beta)** and generate its start message.
6. Open **Work** in ChatGPT Desktop and copy that message into a
   **new conversation** with the SkillPilot plugin enabled. Keep the included
   learning session unchanged.

The normal **Lernen starten** entry offers **ChatGPT Desktop (Beta)** and
**Lernen mit ChatGPT vorbereiten**. The optional
[ChatGPT start link](https://skillpilot.com/?coach=chatgpt-desktop) preselects
that provider; use its message in a new conversation in **Work**.

Claude and ChatGPT have separate learning sessions. A message generated for
Claude cannot start the ChatGPT coach. Keep learning-session capabilities out
of public issues and screenshots.

On **5 October 2026**, the owner confirmed that the Git/Desktop route and
corrected learning start work in **Work** on Windows. The ordinary SkillPilot
start offers **ChatGPT Desktop (Beta)**. Detailed OAuth/tool traces, saved progress, session
continuation, token renewal and desktop automatic updates remain separate
acceptance checks. This confirmation applies to the tested Windows route.

The owner's subsequent Voice test in Windows **Work** reports working learning
and apparent success saving, but only the first learning image displayed. The
local **1.1.2** candidate corrects premature timeout closure of delayed images,
matching the existing Claude fix. Successive images still need checking in
the actual desktop host after the owner deploys the matching backend and plugin.

## Update

Use the marketplace's refresh/update action in ChatGPT Desktop, check that
**1.1.2** is installed after its publication, then start a new conversation in **Work** with a freshly
generated ChatGPT message. Existing archive installations need a Git-marketplace
installation to receive Git updates. Avoid enabling two SkillPilot copies in one
conversation.

For a supported Codex CLI in the same native environment:

```sh
codex plugin marketplace add https://github.com/enpasos/skillpilot-chatgpt-marketplace --ref main
codex plugin add skillpilot-coach-v1@skillpilot-chatgpt-marketplace
codex plugin marketplace upgrade skillpilot-chatgpt-marketplace
```

Local tests with Codex **0.160.0** verified installation, skill discovery and
Git-delivered replacement of the installed files. They do not establish desktop
automatic updates. Windows native and WSL installations can have separate
configuration roots.

## Connection and integrity

The MCP endpoint remains `https://mcp-coach-v1.skillpilot.com/mcp`. Desktop
CIMD uses the separately pinned public OAuth profile with S256 PKCE; hosted
confidential OAuth remains separate. Valid OAuth and an independent
provider-specific learning session are required. Initial transport testing
permits mTLS `observe`; this package does not change server settings.

`release-manifest.json` binds every distributed file by SHA-256. From a source
checkout, run `node validate.mjs` to verify the closed inventory. This proves
package integrity, not host acceptance. Preserve every published release tag;
Git beta releases have a separate lifecycle from OpenAI portal publication.

[Operator runbook](https://enpasos.github.io/skillpilot/deploy/openai-personal-marketplace-release/)
· [OpenAI packaging](https://developers.openai.com/plugins/build/plugins)
· [OpenAI plugin commands](https://learn.chatgpt.com/docs/developer-commands#codex-plugin)
· [Privacy](https://skillpilot.com/privacy)
· [Terms](https://skillpilot.com/legal)
· [Support](https://skillpilot.com/imprint)
