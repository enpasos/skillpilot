# SkillPilot Coach v1

SkillPilot Coach v1 is the public-plugin candidate for curriculum-grounded
SkillPilot learning coaching. Its product scope is limited to eligible paid
Claude Web chat.

A direct-install pilot has demonstrated the package in paid Claude Web chat.
That observation does not prove that Anthropic's official plugin distribution
reaches the same surface. As of 24 August 2026, Anthropic's public plugin
documentation describes the Plugins Directory for Cowork and Claude Code,
which SkillPilot Coach v1 deliberately does not claim to support. Official
submission therefore remains blocked until Anthropic explicitly confirms that
the official distribution path makes this plugin installable and usable in
eligible paid Claude Web chat.

## Install and start

1. During the approved pilot, install and enable the supplied **SkillPilot
   Coach v1** package in Claude Web. After Anthropic confirms and publishes the
   paid-Web distribution path, use that official listing instead.
2. Connect the bundled **SkillPilot** connector through its OAuth flow.
3. Start every learning session at <https://skillpilot.com/>. There you choose
   the SkillPilot ID and Personal Curriculum that should be used, and then
   explicitly select **Mit Claude starten**.
4. SkillPilot opens Claude Web with a fresh start message. Review and send it.

The first-party start creates an opaque `spc_...` learning-session value that
is valid for exactly 24 hours. The permanent SkillPilot ID remains inside
SkillPilot and is not copied into Claude. See [SETUP.md](./SETUP.md) for the
complete installation and security boundary.

## Package boundary

The plugin contains the SkillPilot coaching Skill and one declaration for the
remote SkillPilot connector. All twelve MCP tools and both interactive MCP Apps
come from that connector; the plugin does not duplicate their schemas,
resources, or UI bytes.

SkillPilot Coach v1 does not claim support for Claude Free, native mobile
plugins, Claude Desktop Chat, Cowork, hooks, subagents, or public Claude Code.
Those surfaces require their own acceptance evidence and a later reviewed
release before SkillPilot can advertise them.

The successful direct-install pilot is acceptance evidence for the Web product
flow only. It is not evidence of public Directory availability and must not be
used to mark this candidate ready for official submission.

## Public information

- Product: <https://skillpilot.com/>
- Privacy: <https://mcp-claude-v1.skillpilot.com/privacy>
- Terms: <https://skillpilot.com/legal>
- Support: <mailto:support@skillpilot.com>
- Source: <https://github.com/enpasos/skillpilot>
- Anthropic submission documentation: <https://claude.com/docs/plugins/submit>
- Anthropic plugin overview: <https://claude.com/docs/plugins/overview>
