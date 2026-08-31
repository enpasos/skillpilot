# SkillPilot Claude Marketplace

This repository is the personal Git marketplace for **SkillPilot Coach v1**.
It contains the same reviewed plugin files as the SkillPilot direct-install
package, but distributes them through a repository that Claude can update.

## Install in Claude

Plugins require a paid Claude plan. In Claude, open **Customize → Plugins**.
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

If an uploaded SkillPilot plugin is already installed, remove only that old
SkillPilot plugin before installing this marketplace version. Do not remove
unrelated plugins or separately installed connectors.

The marketplace distribution does not broaden SkillPilot's tested product
scope. The exact supported and tested surfaces are documented in the plugin's
[README](./plugins/skillpilot-coach-v1/README.md) and
[setup guide](./plugins/skillpilot-coach-v1/SETUP.md).

Technical installation ID: `skillpilot-coach-v1@skillpilot-marketplace`.

## Updates

Use **Update** on the SkillPilot Marketplace in Claude, then start a new Claude
session. The plugin version is maintained only in
`plugins/skillpilot-coach-v1/.claude-plugin/plugin.json`.

## Trust and support

- Homepage: <https://skillpilot.com>
- Privacy: <https://skillpilot.com/privacy>
- Terms: <https://skillpilot.com/legal>
- Support: <support@skillpilot.com>
- License: Apache-2.0

This repository is generated from the reviewed SkillPilot source. It must not
contain credentials, learner data, sessions, protected answers, build tooling,
or internal release evidence.
