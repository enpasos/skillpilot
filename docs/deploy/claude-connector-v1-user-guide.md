# SkillPilot with Claude

SkillPilot connects your personal learning path with Claude. Your permanent
SkillPilot ID remains entirely inside SkillPilot. Claude receives neither an ID
file nor its password.

> **Status:** Claude v1 is still being prepared for public release. After
> approval, the public SkillPilot plugin is the preferred complete installation
> for eligible paid Claude Web chat users.

## Install once

1. On an eligible paid Claude account, open **Plugins** and install or enable
   **SkillPilot Coach v1**.
2. Open the plugin's **Connectors** tab and connect the included **SkillPilot**
   connector.
3. Approve the OAuth connection. A published Directory connection may remain
   active when it references the same SkillPilot MCP URL. Do not add another
   manual custom connector for that URL.

The plugin provides the reusable SkillPilot coaching Skill and declares the same
remote connector in paid Claude Web chat. The remote
connector supplies all fourteen SkillPilot tools and both interactive UIs for
learning-goal images and flashcard practice. SkillPilot Coach v1 contains no
hooks or subagents and makes no claim of Desktop Chat or Cowork plugin support.
Additional surfaces require separate acceptance evidence and a later reviewed
release.

At every normal start or resume, Claude first reports today's due, currently
mastered, still-open and overdue goal counts for every valid subject plan. If
no goal is active and the backend reports an available candidate, Claude
resumes that backend-selected goal automatically; no Web **Continue learning**
button is required. Plan and landscape identifiers are not sent to Claude.
You can ask Claude to switch to another subject named in today's plan, for
example “switch to Physics.” Every valid subject plan still applies; the
connector changes only the current learning subject and continues the
backend-selected due goal there.

The Connectors Directory remains a separate connector-only route with its own
Team/Enterprise publisher gate. It is not a prerequisite for plugin submission
and does not add the coaching Skill. The plugin and Directory entry may coexist
when both reference `https://mcp-claude-v1.skillpilot.com/mcp`; Claude exposes
one SkillPilot tool set for that shared server. Do not add a separate manual
custom connector with the same URL when either route already supplies it.

OAuth keeps only the technical connector transport available. Optional
`offline_access` contains no learner identity and neither starts nor extends a
learning session.

## Start learning every time

1. Open [Start learning](https://skillpilot.com/) at SkillPilot.
   The link enters the shared SkillPilot web start.
2. Visibly choose or load your SkillPilot ID there and confirm the curriculum
   and Personal Curriculum.
3. Explicitly choose **Start with Claude** in the final step. You can choose
   again between ChatGPT and Claude at every start.
4. SkillPilot opens Claude Web with the prepared start message already filled
   into the composer. Review and deliberately send it; there is nothing to copy
   or paste. Claude may warn about externally supplied content. That warning is
   expected for this start route.

This creates a fresh opaque value beginning with `spc_`. It is valid for
exactly 24 hours. Claude uses it only for SkillPilot calls; it must not repeat
or share it in the chat. After expiry, start a new session on the same page.
The connector does not need to be reconnected.

During handoff to the Claude composer, this short value temporarily appears in
the `q` parameter of the Claude Web address. Do not share that address or a
screenshot containing it. The permanent SkillPilot ID is not transferred.

## What you can do

- load your current learning context;
- choose a sensible next learning goal;
- display an approved learning-goal image;
- practise normal flashcards in the interactive UI;
- receive coaching for the active goal;
- switch directly between subjects in today's valid learning plans;
- run Verified Recall or an exam task;
- record a completion supported by suitable evidence.

Normal flashcard practice does not complete a learning goal. Only the dedicated
verified check can provide completion evidence for a memory goal.

## Example start

> I want to continue learning with SkillPilot on my current learning goal.

Claude should use learner-friendly language and keep technical fields, internal
IDs, tool names and state versions out of ordinary learning responses.

## Troubleshooting

- **SkillPilot is not available:** Check that SkillPilot Coach v1 is enabled and
  that its included connector is connected. Verify that any published Directory
  connection references the exact same SkillPilot MCP URL, and remove only an
  additional manually created custom connector for that same URL.
- **The session expired:** Open
  [Start learning](https://skillpilot.com/) again. OAuth never
  extends the 24-hour learner session.
- **The wrong person or learning profile appears:** Stop using the chat and
  start a new session from the correct profile in SkillPilot.
- **Claude displays an internal value:** Do not share it. Report the incident
  to `support@skillpilot.com`.
- **Recorded progress needs correction:** Use the SkillPilot Cockpit.

## Privacy and access

SkillPilot receives only the connector requests you explicitly make, not your
complete Claude chat or Claude Memory. The permanent SkillPilot ID remains in
SkillPilot. Anthropic's account, paid-plan, regional and workspace requirements
also apply. The plugin is not available on Claude Free. SkillPilot's Claude
integration is for adults aged 18 or older. It makes no claim of native
mobile-plugin support.

- [SkillPilot](https://skillpilot.com)
- [Connector privacy policy](https://mcp-claude-v1.skillpilot.com/privacy)
- Support: `support@skillpilot.com`

## Version

The plugin and connector have separate publication lifecycles. Compatible
plugin improvements increment the plugin SemVer; the Directory slug
`skillpilot` stays version-neutral. A future breaking connector contract would
require a separate product decision and major line. Claude v2 is currently
unallocated.
