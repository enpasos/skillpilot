# SkillPilot with Claude

SkillPilot connects your personal learning path with Claude. Your permanent
SkillPilot ID remains entirely inside SkillPilot. Claude receives neither an ID
file nor its password.

> **Status:** Claude v1 is still being prepared for public release. After
> approval, the plugin is the recommended installation path.

## Install once

1. Open **Plugins** in Claude and install **SkillPilot coach v1**.
2. Select **Connect** for its SkillPilot connector.
3. Approve the OAuth connection.

The plugin installs the Skill and connector together. The connector also
provides both interactive UIs for learning-goal images and flashcard practice.
Installing the Skill and connector separately is only a technical fallback and
adds no capability.

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
- run Verified Recall or an exam task;
- record a completion supported by suitable evidence.

Normal flashcard practice does not complete a learning goal. Only the dedicated
verified check can provide completion evidence for a memory goal.

## Example start

> I want to continue learning with SkillPilot on my current learning goal.

Claude should use learner-friendly language and keep technical fields, internal
IDs, tool names and state versions out of ordinary learning responses.

## Troubleshooting

- **SkillPilot is not available:** Check that the plugin is enabled and its
  connector is connected.
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
SkillPilot. Anthropic's account, plan, regional and age requirements also
apply; the planned Directory listing is for adults aged 18 or older.

- [SkillPilot](https://skillpilot.com)
- [Connector privacy policy](https://mcp-claude-v1.skillpilot.com/privacy)
- Support: `support@skillpilot.com`

## Version

The Directory slug `skillpilot` stays version-neutral. After final submission,
the v1 line remains compatible; a future breaking contract would require a
separate product decision and major line. Claude v2 is currently unallocated.
