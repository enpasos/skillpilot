# SkillPilot Claude Marketplace

**SkillPilot Coach v1 · Version 1.1.13** provides curriculum-grounded learning
coaching for Claude. This Marketplace export matches the exact 1.1.13
SkillPilot download artifact. Repository publication, installation and actual
learning behavior in individual Claude accounts are checked separately.

Version 1.1.13 adds explicit coaching instructions for assessment shortcuts.
Ask to demonstrate existing knowledge or take an available assessment directly.
The coach uses SkillPilot's current options; an unambiguous request to start an
offered assessment needs no second confirmation. Normal learning, detailed exam
feedback and binary mastery remain unchanged. Acceptance of this version in
real Claude accounts, including Web and Android Voice, remains pending; earlier
published packages and their evidence remain immutable history.

### In version 1.1.13

- Ask for an assessment shortcut when you want to demonstrate existing knowledge.
  The coach offers only assessments currently authorized by SkillPilot, before
  starting an unrelated lesson. Browsing the options starts no assessment.
- After an explicit choice, the coach starts that assessment directly. SkillPilot
  handles the technical contract confirmation without an extra learner decision.
- Passed assessments can remove preparation requirements for their reviewed
  learning section. They never mark other learning goals as mastered.
- Detailed grading and feedback remain available. Shortcut offers do not interrupt
  result feedback or an agreed continuation of ordinary learning. The Cockpit's
  shortcut setting and all session and prerequisite protections still apply.

- The coach quotes SkillPilot's plan status word for word, exactly as the
  SkillPilot cockpit shows it: one line per subject with its daily or weekly
  target and any backlog or work ahead.
- Plans guide and prioritize; they never prevent explicitly requested learning.
- Continue reachable open curriculum goals beyond quotas, plan dates or backlog.
- After reaching the period target, use remaining backlog as a pressure-free catch-up option.
- Exam instructions are included in the coaching Skill; only Verified Recall
  loads a separate workflow when needed.
- The coach presents the exam task first and requests protected evaluation only
  after a complete submission, using the actual tool schema.
- When the work demonstrates every aspect of an ordinary goal, the coach stops
  assessing, saves mastery immediately and confirms the save before offering
  the next topic. It waits for your agreement before starting new content.
- If evidence is still missing, the coach checks that specific aspect instead
  of offering mastery or a mastered next topic. A decision based on unchanged
  work is not reversed merely by further reflection.
- You can ask questions, pause or stay for optional practice after mastery;
  this does not reopen the saved result.
- Goal images use the updated SkillPilot renderer, including when a learner
  agrees to continue to the next goal. Visible client behavior is checked
  separately in Claude Web.
- A failed exam still receives its score, feedback and solution discussion,
  without storing a failed learning result. Private deliberation stays out of
  learner-facing text and speech, including voice mode.
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

The coach reports SkillPilot's plan status and helps you continue learning. Say
“continue” or “switch to Physics” to move on naturally. Goals completed from an
earlier backlog also count toward the current target; further work is voluntary.

If an uploaded SkillPilot plugin is already installed, remove only that old
SkillPilot plugin before installing this marketplace version. Do not remove
unrelated plugins or separately installed connectors.

## Updates

Claude can deliver **automatic updates** to plugins installed from this
marketplace. During an earlier beta release, automatic updates were already
observed in two Claude accounts.
An upload-only installation is not the same as a marketplace installation.

Update timing and available synchronization controls can vary by Claude client.
After updating, check that your installed plugin shows **1.1.13**,
then start a fresh learning session from SkillPilot. If an update has not
arrived, use the refresh control where available or contact
<support@skillpilot.com>.

The observed automatic update mechanism does not mean that every account has
already received 1.1.13. Verification of this version in individual clients
remains separate from publication.

## About this beta

This personal marketplace is published independently by SkillPilot; it is not
reviewed, endorsed, curated, or verified by Anthropic. The seven packaged plugin
files match the prepared 1.1.13 direct-install candidate byte for byte.
For supported clients, setup and the security boundary, see the
[plugin README](./plugins/skillpilot-coach-v1/README.md) and
[setup guide](./plugins/skillpilot-coach-v1/SETUP.md).

Those packaged documents retain their canonical pre-publication snapshot;
their preparation-time release notes are not a live availability indicator.
This Marketplace export contains **1.1.13**, matching the exact SkillPilot download
artifact. Repository publication alone will not prove that an
installed Claude account has updated.

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
