# SkillPilot Claude Marketplace

This repository is the personal Git marketplace for **SkillPilot Coach v1**.
It contains the same reviewed plugin files as the SkillPilot direct-install
package, but distributes them through a repository that Claude can update.
This personal marketplace is published independently by SkillPilot. It is not
reviewed, endorsed, curated, or verified by Anthropic.

Version **1.1.3** is the locally prepared replacement candidate, not yet
published or deployed. Its normal display name remains **SkillPilot Coach v1**.
The six plugin files match the newly prepared immutable 1.1.3 direct-install
artifact. The published 1.1.2 package and its evidence remain immutable history.
Repository publication, exact-client installation and update acceptance, and a
first-party Marketplace guide decision are pending for 1.1.3. Local preparation
does not update an existing Claude installation or publish this repository tree.

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

In the resulting chat, SkillPilot first summarizes every valid subject plan in
one compact line. Newly completed due goals from earlier days also count toward
today's fixed subject quota. Automatic continuation stops when the daily targets
are reached; additional work is voluntary and each extra completion is celebrated.
Remaining backlog is available on an explicit request for details. An explicit request such as
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

Check the version offered in the plugin's **Contents** view and the version of
your installed plugin. For an explicitly opened candidate test, both should
read **1.1.3** before starting a new Claude
session. A GitHub release alone does not prove that Claude has synchronized or
updated your installation; the available synchronization controls vary by
Claude surface. If the catalog is stale, contact <support@skillpilot.com>.
The plugin version is maintained only in
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
