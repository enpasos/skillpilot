# SkillPilot Coach v1

SkillPilot Coach v1 is the public-plugin candidate for curriculum-grounded
SkillPilot learning coaching. Its product scope is limited to eligible paid
Claude Chat on the Web and the native Android app. Version 1.1.0 is the sole
current replacement candidate; earlier package versions remain historical
evidence and are not an installation fallback.

Earlier v1 direct-install packages were demonstrated in paid Claude Web chat.
The Product Owner also used an earlier account-level direct installation with a
Claude Pro account in the native Claude app on Android. Those observations do
not transfer to the 1.1.0 candidate. Exact-candidate direct-install,
public-listing installation and the complete Android learning flow remain
pending until they are verified for 1.1.0. The earlier Android observation also
does not establish that the package can be installed from Android itself or
that a public listing will reach Android. iOS, Claude Desktop Chat, Cowork and
public Claude Code remain outside this candidate's claims.

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
remote SkillPilot connector. All fourteen MCP tools and both interactive MCP Apps
come from that connector; the plugin does not duplicate their schemas,
resources, or UI bytes.

Version 1.1.0 makes the chat plan-first. At the beginning of a learning session,
Claude reports today's requirements and progress for every valid subject plan,
including overdue work, and then continues or resumes the backend-selected goal
without requiring a Web-app button.
An explicit request such as “switch to Physics” changes the current planned
subject through the connector while every valid subject plan continues to
contribute to the day's requirements. The backend parks an unfinished goal and
selects the due goal for the requested subject without exposing plan or goal
identifiers.

SkillPilot Coach v1 does not claim support for Claude Free, iOS, installation
from inside the Android app, Claude Desktop Chat, Cowork, hooks, subagents, or
public Claude Code. Those surfaces require their own acceptance evidence and a
later reviewed release before SkillPilot can advertise them.

The historical direct-install observations are not evidence for 1.1.0 or public
Directory availability. Submission readiness requires this exact candidate to
complete the dedicated Web and Android real-client acceptance gates.
Public-listing reach on Android remains a publication verification, not a
circular pre-submission requirement.

## Public information

- Product: <https://skillpilot.com/>
- Privacy: <https://mcp-claude-v1.skillpilot.com/privacy>
- Terms: <https://skillpilot.com/legal>
- Support: <mailto:support@skillpilot.com>
- Source: <https://github.com/enpasos/skillpilot>
- Anthropic submission documentation: <https://claude.com/docs/plugins/submit>
- Anthropic plugin overview: <https://claude.com/docs/plugins/overview>
