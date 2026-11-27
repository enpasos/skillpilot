# Instructions for the browser agent of the SkillPilot coach web test

You operate Claude's web interface (claude.ai) in the browser that Claude in
Chrome is connected to at this computer (Google Chrome or Microsoft Edge). A
test program decides what is typed into the chat and judges the result. You
are its hands and eyes: you type what it hands you and you report what the
page shows. You never decide what the learner says, and you never judge or
correct the coach.

## The loop

1. Run `step.cmd` in this folder without arguments (PowerShell: `.\step.cmd`;
   Git Bash: `cmd.exe //c step.cmd`). It prints one line: `NEXT <file>`.
2. Read that file from this folder. It holds one action as JSON.
3. Carry out the action in the browser.
4. Write what you observed as JSON to the file the action names in
   `observationFile`, in this folder.
5. Run `step.cmd <observationFile>`. It prints the next `NEXT <file>`; continue
   at step 2.

Stop when the action is `done`. Tell the person its `summary` and end. If
`step.cmd` prints anything other than `NEXT <file>`, show the person that
output and end.

When an action carries `problems`, your last observation was not accepted:
correct the observation file and run `step.cmd <observationFile>` again. Do not
repeat the browser action.

## Actions

### `preflight`

Open `url` in a new tab. Report:

```json
{ "preflight": { "signedIn": true, "connectorConnected": true, "pluginListed": true, "notes": "" } }
```

- `signedIn`: the page shows a chat input of a signed-in account.
- `connectorConnected`: the connector named SkillPilot is listed for the chat
  and switched on. Use `null` when the page does not let you see it.
- `pluginListed`: the SkillPilot coach plugin or its skill is listed as
  installed. Use `null` when the page does not let you see it.
- `notes`: anything unusual, in one or two sentences.

Only look. Do not connect, install, switch on or change anything.

### `new-chat`

Open `url` in the tab of this test, so that a new, empty chat starts. Select
the model `model.name` and the effort `model.effort` for this chat. Labels may
be in German ("Mittel" for medium). If that model or that effort is not
offered, send nothing and report `blocked`.

Then put `message` into the input field, send it, wait for the complete
answer and observe it, as described below.

### `send`

In the chat of the previous action: put `message` into the input field, send
it, wait for the complete answer and observe it.

## Typing a message

- Enter `message` exactly: every character, every line break, nothing added,
  corrected, translated or shortened. In the input field Enter sends; a line
  break inside a message is Shift+Enter.
- Before sending, read the input field back from the page and compare it with
  `message`. Send only when both are equal.
- Attach nothing and change no other setting of the chat.

## Waiting

The answer is complete when the page no longer streams text, no tool call is
running and the send control is available again. Wait up to
`answerTimeoutMinutes`. When claude.ai asks whether a SkillPilot tool may be
used, choose the option that allows it once (or for this chat), never the
option that allows it always, and note the request in `permissionPrompts`.

## Observation of a chat turn

Read texts from the page content, never by retyping from a screenshot.

```json
{
  "model": { "label": "Opus 5.5", "effort": "Medium" },
  "assistantText": "the complete visible answer of this turn",
  "skillBlocks": ["label of each block that shows a skill being loaded or used"],
  "connectorLoads": ["label of each row that only says a connector was loaded"],
  "toolCalls": [
    {
      "connector": "name of the connector or app the page shows for this call, or null",
      "label": "the label of the call exactly as displayed",
      "name": null,
      "request": { "Learning session id": "…", "Language": "de" },
      "responseTopLevel": ["State version", "Language", "Level completion"],
      "responseFields": { "State version": 7 },
      "responsePreview": "the first 600 characters of the displayed response",
      "responseTruncated": false,
      "isError": false
    }
  ],
  "permissionPrompts": [{ "label": "what was asked", "choice": "what you chose" }],
  "hostRefusals": ["text of each notice that a tool call was not carried out"],
  "anomalies": ["anything else unusual, one sentence each"]
}
```

- `model`: only for `new-chat`. The labels of model and effort exactly as the
  page displays them after your selection.
- `assistantText`: the answer the learner can read, of this turn only, without
  the model's thinking and without tool blocks.
- `connectorLoads`: a row that only says that a connector or its tools were
  loaded (for example "skillpilot geladen") and has neither a request nor a
  response is not a tool call. Report its label here, not in `toolCalls`.
- `toolCalls`: every tool call of this turn, in the order displayed. Open each
  block to read its request and response.
  - `name`: the technical tool name, such as one of the action's `toolNames`,
    only when the page shows it for this call. The page shows some calls
    without it (for example "Aus skillpilot abgerufen"): then `null`. Never
    derive a name from the request or the response; the test program does
    that.
  - `request`: the request as displayed, as a JSON object, or `null` when the
    page does not show it. Copy every field name exactly as displayed, also
    when the page rewords it ("Learning session id"), and every value
    unchanged.
  - `responseTopLevel`: the names of all top-level fields of the displayed
    response, as displayed and in the order displayed; not the fields nested
    inside them. `null` when the page shows no response.
  - `responseFields`: of the top-level fields `status`, `errorCode`,
    `message`, `savedGoalId`, `savedMastery`, `stateVersion` and `confirmed`,
    those the displayed response contains, with their names as displayed
    ("Error code", "Saved goal id", "State version"). `null` when the page
    shows no response.
  - `responseTruncated`: `true` when the page says that it shortened the
    displayed response ("Ausgabe gekürzt"), otherwise `false`.
  - `isError`: `true` when the page marks the call as failed, `false` when it
    shows a normal result, `null` when you cannot tell.
- Use empty lists where nothing was displayed.

## When you cannot continue

A login page, a CAPTCHA, a usage limit or a missing permission stops the
test. Ask the person at the computer to resolve it and continue afterwards.
When it cannot be resolved, write this observation instead and run
`step.cmd <observationFile>`:

```json
{ "blocked": "what stops the test, in one sentence" }
```

## Limits of what you do

- Work only in the one tab of this test and only on claude.ai. Leave every
  other tab and site alone; never open skillpilot.com.
- Use only chats this test started. Never open, rename or delete another
  chat, and do not delete the chats of this test.
- Never change account settings, connectors, plugins, skills, memory, styles
  or projects.
- Never choose an entry of Claude Code's `/chrome` menu, and never install or
  reconnect the browser extension. When the browser tools are not available,
  report `blocked`.
- Never write the name or the e-mail address of the account anywhere.
- Never type anything into the chat that an action did not hand you, and do
  not answer the coach yourself.
- Do not read files other than the action files, and write no files other
  than the observation files.
