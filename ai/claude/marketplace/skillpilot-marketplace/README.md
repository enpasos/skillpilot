# SkillPilot Claude Marketplace

**SkillPilot Coach v1 · Version 1.1.5** brings curriculum-grounded learning
coaching to Claude. Install it once through this Git marketplace to receive
future plugin updates through Claude.

### In version 1.1.5

- Shorter, focused coaching instructions without overlapping rules.
- Exam and Verified Recall instructions loaded only when needed.
- A motivating daily overview: today's goals first, voluntary extra work after.
- Your answers, assessments and feedback stay in the Claude conversation;
  SkillPilot receives only structured learning results.

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

The coach shows a compact daily overview and helps you continue learning. Say
“continue” or “switch to Physics” to move on naturally. Goals completed from an
earlier day's backlog also count toward today's target; further work is voluntary.

If an uploaded SkillPilot plugin is already installed, remove only that old
SkillPilot plugin before installing this marketplace version. Do not remove
unrelated plugins or separately installed connectors.

## Updates

Claude can deliver **automatic updates** to plugins installed from this
marketplace. During an earlier beta release, automatic updates were already
observed in two Claude accounts.
An upload-only installation is not the same as a marketplace installation.

Update timing and available synchronization controls can vary by Claude client.
Check that your installed plugin shows **1.1.5**, then start a fresh learning
session from SkillPilot. If an update has not arrived, use the refresh control
where available or contact <support@skillpilot.com>.

The observed automatic update mechanism does not mean that every account has
already received 1.1.5. Verification of this version in individual clients
remains separate from publication.

## About this beta

This personal marketplace is published independently by SkillPilot; it is not
reviewed, endorsed, curated, or verified by Anthropic. The seven packaged plugin
files match the immutable 1.1.5 direct-install artifact byte for byte.
For supported clients, setup and the security boundary, see the
[plugin README](./plugins/skillpilot-coach-v1/README.md) and
[setup guide](./plugins/skillpilot-coach-v1/SETUP.md).

Technical installation ID: `skillpilot-coach-v1@skillpilot-marketplace`.

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
