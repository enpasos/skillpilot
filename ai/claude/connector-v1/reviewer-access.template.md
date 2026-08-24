# Reviewer access template

Complete this template only in the approved secure handoff channel used for the
Anthropic submission. Do not fill it in inside the repository, a pull request,
an issue, CI output, unapproved email or a screen recording.

## Public connection information

- Connector name: SkillPilot
- MCP URL: `https://mcp-claude-v1.skillpilot.com/mcp`
- Transport: Streamable HTTP
- Authentication: Always required, OAuth 2.0 with hosted Claude client metadata
- Custom headers: none
- Minimum age: 18+

## Secure reviewer fixture

Provide only the following through the approved secret channel:

- confirmation that the profile contains synthetic or authorized adult test
  data only;
- the first-party procedure for choosing that profile and starting a fresh
  24-hour learner session;
- fixture expiry or revocation date;
- reset and escalation contacts;
- the private fixture appendix for Recall and exam cases.

Never provide the permanent SkillPilot ID, an encrypted ID file, an ID-file
password or a pre-generated `spc_` value. The reviewer starts each learner
session at `https://skillpilot.com/`; SkillPilot creates the opaque
`spc_` session and keeps permanent identity inside the first-party system.

## Reviewer profile checklist

The profile is usable only when it contains:

- one resolved personal curriculum;
- at least two published focus choices;
- one eligible ordinary atomic goal with a short assessable exercise;
- one orientation case if orientation behavior is part of the review run;
- one active memory goal with a complete due-card batch;
- one active exam goal with a deterministic task and scoring rubric;
- enough existing progress to return non-empty context and progress summaries;
- a documented initial state and a resettable canonical baseline;
- German and English cases without personal or real learner data.

## Connection and start steps

1. Open the SkillPilot Connectors Directory candidate in Claude Web. This
   connector-review flow does not require the separate Cowork/Claude Code
   plugin.
2. Connect the SkillPilot connector through OAuth. Verify the client, callback
   host and requested `skillpilot.read`, `skillpilot.write` and optional
   `offline_access` scopes.
3. Confirm that `offline_access` keeps only the technical connector transport
   connected. It must not contain, select, mint, renew or extend learner
   identity or a learner session.
4. Add no custom headers and never enter a permanent SkillPilot ID.
5. Open `https://skillpilot.com/`. In the shared SkillPilot web
   start, visibly select or load the prepared reviewer ID, confirm its
   curriculum and Personal Curriculum, and explicitly choose Claude.
6. Confirm only that explicit Claude launch creates a fresh opaque value
   beginning with `spc_`, valid for exactly 24 hours. The Web-only handoff
   targets exactly `https://claude.ai/new` with exactly one non-empty,
   URL-encoded `q` query parameter containing the complete prepared start
   prompt. Claude Web prefills but never auto-sends it; the reviewer explicitly
   selects **Send**. The normal start path uses no manual copy/paste and exposes
   no Claude Desktop launch route. The session is not displayed in normal
   learner-facing prose.
7. Enable only SkillPilot and follow `reviewer-test-plan.md`.
8. Treat the complete `q`-bearing Claude Web URL, including its encoded `spc_`
   value, like a credential. Never capture that URL in evidence or screenshots;
   redact the entire browser address bar. Record all other evidence without
   credentials, OAuth values, `spc_` values, permanent IDs, learner data or
   protected answers.

## Reset procedure

Before each destructive or replay-sensitive block, the named operator restores
the reviewer profile to its documented baseline through the approved SkillPilot
fixture/reset procedure. The reset must not reuse an old OAuth code,
`learningSessionId`, capability or `clientRequestId`, and must not affect
another learner or provider.

Record in the secure handoff:

- reset procedure version;
- reset owner and contact;
- expected baseline state summary;
- UTC reset time;
- connector revocation and reconnection steps;
- learner-session expiry and fresh-start steps;
- expiry and deletion plan for the reviewer fixture.

## Fields completed only in the portal

- Organization owner or delegated Directory manager
- Primary review contact name and email
- Test-account fixture handoff location
- Reset contact
- Security escalation contact
- Product, Legal, Security and Operations approval references
