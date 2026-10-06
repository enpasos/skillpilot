---
name: skillpilot-gemini-poc
description: Run an explicitly requested synthetic SkillPilot Custom apps connectivity test in the Gemini web app. Requires a separately connected SkillPilot Gemini PoC MCP app and a private temporary probe reference supplied by the test operator. Never use for real learner progress.
---

# SkillPilot Gemini connectivity test

This is a technical test using a disposable synthetic marker. It is not the
SkillPilot learning coach and does not certify learning or save mastery.

Use the separately connected Custom app; this Skill contains no connection,
credentials, session references, scripts, or learner data. If the app is not
connected, explain that the operator must finish Custom app setup first. Never
replace it with an API call, a CLI, or an invented saved result.

At each test turn, read `get_skillpilot_poc_context` once with the unchanged
private `probeSessionId` from the operator's prepared start prompt. Keep technical
references private and never request a permanent SkillPilot ID or chat prose
for a tool argument. Follow the server's current instruction.

When the marker is not yet saved, ask whether the operator wants to record it
and wait. After agreement, call `record_skillpilot_poc_completion` with the exact
`completionCapability` released by that context. This tool is a write; preserve
Gemini's manual confirmation and honor refusal. Never call it after a refusal
or attempt to disguise it as a read.

Claim a successful synthetic save only when the server returns `saved: true`.
On a later chat or turn, read the same valid probe session and report the
server-confirmed marker. Never infer a second write from continuation. On a
session error stop; the operator creates a fresh temporary session locally.
OAuth refresh or reconnection never recreates or extends the probe session.

No free-form answers, feedback, explanations, user identities, or transcript
excerpts belong in tool inputs. This Skill must not be used as authorization
or as evidence that Gemini actually loaded or followed it.
