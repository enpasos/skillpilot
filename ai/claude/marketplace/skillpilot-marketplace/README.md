# SkillPilot Claude Marketplace

This repository is the personal Git marketplace for **SkillPilot Coach v1**.
It contains the same reviewed plugin files as the SkillPilot direct-install
package, but distributes them through a repository that Claude can update.
This personal marketplace is published independently by SkillPilot. It is not
reviewed, endorsed, curated, or verified by Anthropic.

Version 1.1.1 completely replaces earlier versions. Do not retain or reinstall
1.0.4 as a fallback. The 1.1.1 Marketplace update and its exact-client
acceptance must be verified before SkillPilot presents this repository as an
available installation route.

## Install in Claude

Plugins require a paid Claude plan, and SkillPilot's Claude integration is for
adults aged 18 or older. In Claude, open **Customize → Plugins**.
Under **Personal plugins**, choose **+ → Add marketplace → Add from a
repository** and enter:

```text
https://github.com/enpasos/skillpilot-claude-marketplace
```

Open the new **SkillPilot Marketplace**, select **SkillPilot Coach v1**, and
choose **Install**. Connect the SkillPilot connector included in the plugin
when Claude asks you to do so. Do not add a second custom connector or enter an
MCP URL manually.

Then return to <https://skillpilot.com/> and start each new learning session
there through the established SkillPilot handoff.

In the resulting chat, SkillPilot first reports every valid subject plan and
can resume the backend-selected goal automatically. An explicit request such as
“switch to Physics” changes only the current learning subject; all valid plans
continue to contribute to today's requirements.

If an uploaded SkillPilot plugin is already installed, remove only that old
SkillPilot plugin before installing this marketplace version. Do not remove
unrelated plugins or separately installed connectors.

The marketplace distribution does not broaden SkillPilot's product scope.
The current candidate boundaries and pending exact-client acceptance are documented in the plugin's
[README](./plugins/skillpilot-coach-v1/README.md) and
[setup guide](./plugins/skillpilot-coach-v1/SETUP.md).

Technical installation ID: `skillpilot-coach-v1@skillpilot-marketplace`.

## Updates

Use **Update** on the SkillPilot Marketplace in Claude, then start a new Claude
session. The plugin version is maintained only in
`plugins/skillpilot-coach-v1/.claude-plugin/plugin.json`.

## Trust and support

- Homepage: <https://skillpilot.com>
- SkillPilot privacy policy (DE/EN): <https://skillpilot.com/privacy>
- Claude connector privacy notice (DE/EN):
  <https://mcp-claude-v1.skillpilot.com/privacy>
- SkillPilot terms: <https://skillpilot.com/legal>
- Anthropic Consumer Terms: <https://www.anthropic.com/legal/consumer-terms>
- Anthropic Privacy Policy: <https://www.anthropic.com/legal/privacy>
- Support: <support@skillpilot.com>
- License: Apache-2.0

SkillPilot's terms govern the SkillPilot service. The Claude account,
conversations, and provider-side processing are third-party services governed
separately by Anthropic's Consumer Terms and Privacy Policy.

This repository is generated from the reviewed SkillPilot source. It must not
contain credentials, learner data, sessions, protected answers, build tooling,
or internal release evidence.
