# SkillPilot Coach v1

SkillPilot Coach v1 is the public-plugin candidate for curriculum-grounded
SkillPilot learning coaching. Its product scope is limited to eligible paid
Claude Chat on the Web and the native Android app. Version 1.1.5 is the sole
current replacement candidate. Local preparation does not establish deployment,
Marketplace publication or real-client acceptance. The existing 1.1.4 artifact
and its publication evidence remain immutable; older packages are not a
fallback for testing this candidate.

Earlier v1 direct-install packages were demonstrated in paid Claude Web chat.
The Product Owner also used an earlier account-level direct installation with a
Claude Pro account in the native Claude app on Android. Those observations do
not transfer to the 1.1.5 candidate. Exact-candidate direct-install,
public-listing installation and the complete Android learning flow remain
pending until they are verified for 1.1.5. The earlier Android observation also
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

Version 1.1.5 consolidates the coaching instructions and removes duplicate
rules while retaining the established coaching decisions and security boundary.
The Skill owns the common coaching flow; conditional references supply the
Verified Recall and exam procedures only when needed. Local regression checks do not establish
successful execution in a user's Claude account.

The retained 1.1.4 privacy correction deliberately removes assessment prose from tool
inputs. Claude judges the work and writes feedback and success messages in the
chat. Mastery calls carry only the structured completion decision; Verified
Recall carries only the required card identifiers and pass/fail results, never
answers, reasoning, `workFeedback`, `outcomeFeedback` or Recall `feedback`.
This is an intentional input-contract contraction, not backward compatibility.
Use the corrected backend together with refreshed connector tools and this
plugin version. Old cached inputs are rejected; they must not be reintroduced
to make an old installation work. OAuth, learner-session, tool identity and
backend-owned progression boundaries remain unchanged.

Version 1.1.5 keeps the chat plan-first with a compact daily summary. For example:
“Heute: 2 von 48 geschafft · noch offen: 19 Mathe, 27 Physik.” Today's newly
completed due plan goals count first toward a stable daily quota for their
subject, including goals from earlier days. The backend owns the completion
events and all counts. It stops automatic continuation when the daily targets
are reached; any further due work requires an explicit learner request and is
celebrated as voluntary extra work. Remaining backlog appears only when the
learner asks for plan details; unavailable-plan warnings remain explicit.
Continue or resume the backend-selected goal without requiring a Web-app
button. Existing plan dates, fourteen tools and learner-session boundaries
remain in place.
An explicit request such as “switch to Physics” changes the current planned
subject through the connector while every valid subject plan continues to
contribute to the day's requirements. The backend parks an unfinished goal and
selects the due goal for the requested subject without exposing plan or goal
identifiers.

Within a valid learning session, the learner can simply return to the chat and
say “weiter” or “now Physics”. Claude names the remaining work briefly and
starts the next concrete explanation or task. A status question reports the
plan without changing the current subject. After an ordinary goal or Verified
Recall finishes, Claude uses the refreshed progress and backend-selected
successor. When the daily quotas are fulfilled, it celebrates today's target;
this does not mean that the entire plan or all remaining backlog is complete.
blocked or unavailable work is not presented as completed.

SkillPilot Coach v1 does not claim support for Claude Free, iOS, installation
from inside the Android app, Claude Desktop Chat, Cowork, hooks, subagents, or
public Claude Code. Those surfaces require their own acceptance evidence and a
later reviewed release before SkillPilot can advertise them.

The historical direct-install observations are not evidence for 1.1.5 or public
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
