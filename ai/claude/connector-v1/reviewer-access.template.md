# Reviewer access template

Complete this template only in the approved secure handoff channel used for the
Anthropic submission. Do not fill it in inside the repository, a pull request,
an issue, CI output, email without approved encryption, or a screen recording.

## Public connection information

- Connector name: SkillPilot
- MCP URL: `https://mcp-claude-v1.skillpilot.com/mcp`
- Transport: Streamable HTTP
- Authentication: Always required, OAuth 2.0 with hosted Claude client metadata
- Custom headers: none
- Minimum age: 18+

## Secure reviewer package

Provide all of the following through the approved secret channel:

- encrypted reviewer `.skillpilot` file;
- password for that file, through a separate secret channel where practical;
- confirmation that the profile contains synthetic or authorized adult test
  data only;
- one-time package expiry or revocation date;
- reset contact and escalation contact;
- the private fixture appendix for recall and exam cases.

Never provide the raw permanent SkillPilot ID as a separate credential. The
reviewer should use the normal browser-local ID-file flow.

## Reviewer profile checklist

The profile is usable only when it contains:

- one resolved personal curriculum;
- at least two published focus choices;
- one eligible ordinary atomic goal with a short assessable exercise;
- one orientation case if orientation behavior is part of the review run;
- one active memory goal with a complete due-card batch;
- one active exam goal with a deterministic task and scoring rubric;
- enough existing progress to return non-empty context and progress summaries;
- a documented initial `stateVersion` and a resettable canonical baseline;
- both German and English cases without personal or real learner data.

## Connection steps for the reviewer

1. In Claude, open **Customize > Connectors > Add custom connector**.
2. Enter the MCP URL above and choose authentication **Always required**.
3. Keep **Anthropic-hosted client metadata** selected. Add no headers.
4. Start the OAuth connection.
5. On the SkillPilot page, verify the client, callback host and requested
   `skillpilot.read`, `skillpilot.write` and optional `offline_access` scopes.
6. Select the supplied encrypted `.skillpilot` file and enter its password.
7. Choose **Lokal entschlüsseln & verbinden**. The password stays in the
   browser page and must never be pasted into Claude.
8. Return to Claude, start a fresh chat and enable only SkillPilot.
9. Follow `reviewer-test-plan.md` and record evidence without secrets.

## Reset procedure

Before each destructive or replay-sensitive block, the named operator restores
the reviewer profile to its documented baseline through the approved SkillPilot
fixture/reset procedure. The reset must not reuse an old OAuth code, capability
or `clientRequestId`, and must not affect another learner or provider.

Record in the secure handoff:

- reset procedure version;
- reset owner and contact;
- expected baseline state summary;
- UTC reset time;
- connection revocation and reissue steps;
- expiry and deletion plan for the reviewer package.

## Fields completed only in the portal

- Organization owner or delegated Directory manager
- Primary review contact name and email
- Test-account credential/file handoff location
- Reset contact
- Security escalation contact
- Product, Legal, Security and Operations approval references
