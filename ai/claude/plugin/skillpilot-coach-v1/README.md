# SkillPilot Coach v1

SkillPilot Coach v1 is the public-plugin candidate for curriculum-grounded
SkillPilot learning coaching. Its product scope is limited to eligible paid
Claude Chat on the Web and the native Android app.

A direct-install pilot has demonstrated the package in paid Claude Web chat.
The Product Owner has also used the account-level direct installation with a
Claude Pro account in the native Claude app on Android. The Android observation
does not establish that the package can be installed from Android itself or
that a future public listing will reach Android. Public-listing installation
and the complete Android learning flow are verified only after publication.
iOS, Claude Desktop Chat, Cowork and public Claude Code remain outside this
candidate's claims.

## Install and start

1. During the approved pilot, install and enable the supplied **SkillPilot
   Coach v1** package for an eligible paid Claude account. After publication,
   use the official listing and verify that fresh listing installation on the
   same account reaches both Web chat and the native Android app.
2. Connect the bundled **SkillPilot** connector through its OAuth flow.
3. Start every learning session at <https://skillpilot.com/>. There you choose
   the SkillPilot ID and Personal Curriculum that should be used, and then
   explicitly select **Mit Claude starten**.
4. SkillPilot opens the current Claude Web handoff with a fresh start message.
   Review and send it. Android plugin usability does not change that existing
   first-party Web handoff.

The first-party start creates an opaque `spc_...` learning-session value that
is valid for exactly 24 hours. The permanent SkillPilot ID remains inside
SkillPilot and is not copied into Claude. See [SETUP.md](./SETUP.md) for the
complete installation and security boundary.

## Package boundary

The plugin contains the SkillPilot coaching Skill and one declaration for the
remote SkillPilot connector. All twelve MCP tools and both interactive MCP Apps
come from that connector; the plugin does not duplicate their schemas,
resources, or UI bytes.

SkillPilot Coach v1 does not claim support for Claude Free, iOS, installation
from inside the Android app, Claude Desktop Chat, Cowork, hooks, subagents, or
public Claude Code. Those surfaces require their own acceptance evidence and a
later reviewed release before SkillPilot can advertise them.

The successful direct-install observations are not evidence of public Directory
availability. They support submission readiness only after the exact candidate
has completed the dedicated Web and Android real-client acceptance gates.
Public-listing reach on Android is a publication verification, not a circular
pre-submission requirement.

## Public information

- Product: <https://skillpilot.com/>
- Privacy: <https://mcp-claude-v1.skillpilot.com/privacy>
- Terms: <https://skillpilot.com/legal>
- Support: <mailto:support@skillpilot.com>
- Source: <https://github.com/enpasos/skillpilot>
- Anthropic submission documentation: <https://claude.com/docs/plugins/submit>
- Anthropic plugin overview: <https://claude.com/docs/plugins/overview>
