# SkillPilot Claude Connector v1 reviewer test plan

This plan covers the final public endpoint. Repository tests are necessary but
do not replace these real-client tests.

## Rules

- Use only the dedicated adult reviewer profile from the secure handoff.
- Never record the `.skillpilot` file, its password, OAuth codes or tokens,
  permanent IDs, opaque capabilities, protected answers or raw learner data.
- Use a fresh Claude chat for each independent block and enable only SkillPilot.
- Record exact UTC time, visible Claude model and surface, deployed Git revision,
  tool sequence, result classification and sanitized screenshots.
- Run every valid tool once in the pinned MCP Inspector and once through the
  real Claude custom connector.
- A generic HTTP 500/400, partial write or silent acceptance of invalid input is
  a failure.

## Discovery and catalogue

1. Connect to `https://mcp-claude-v1.skillpilot.com/mcp` using Streamable HTTP.
2. Confirm unauthenticated MCP requests receive HTTP 401 with the protected-
   resource metadata challenge.
3. Complete OAuth through the normal encrypted ID-file page.
4. Confirm `tools/list` publishes exactly these nine tools and no prompt,
   resource or MCP App UI:

   - `get_skillpilot_coach_context`
   - `get_skillpilot_navigation_options`
   - `set_skillpilot_focus`
   - `set_skillpilot_active_goal`
   - `set_skillpilot_mastery`
   - `start_skillpilot_verified_recall`
   - `get_skillpilot_verified_recall_answers`
   - `record_skillpilot_verified_recall_results`
   - `get_skillpilot_exam_evaluation`

5. Confirm every tool has a non-empty title, a narrow description, a closed
   input schema and the applicable read/write annotations.

## Valid tool cases

| Tool | Prepared fixture and call | Required evidence |
| --- | --- | --- |
| `get_skillpilot_coach_context` | Load the reset profile in DE and EN. | Current curriculum, state version, focus, active goal/frontier and bounded progress are present; no permanent ID, token, answer key or unrestricted state dump appears. |
| `get_skillpilot_navigation_options` | Load the profile with at least two published Level-3 options. | Returned options are bounded, belong to the current target projection and do not expose Level-2 mutation. |
| `set_skillpilot_focus` | Copy exactly one published `goalIds` list, current `stateVersion` and a fresh UUID request ID. | Exactly one revision advance; response tells the client to reload; a following context read shows the selected focus. |
| `set_skillpilot_active_goal` | Activate one eligible atomic goal returned by the current state machine. | Exactly one revision advance and the following context shows the canonical active goal. |
| `set_skillpilot_mastery` | Complete the prepared ordinary exercise with visible evidence, then send specific work/outcome feedback and current revision. | Mastery is saved only after sufficient evidence, advances once and is visible after reload. No model-selected numeric mastery is accepted. |
| `start_skillpilot_verified_recall` | Reset to the prepared active memory goal and start recall without supplying goal ID or batch size. | The server chooses one complete ordered batch and returns only prompt cards plus an opaque batch capability. |
| `get_skillpilot_verified_recall_answers` | First answer every returned card visibly, then pass the unchanged batch capability once. | Answers are unavailable before the complete learner response; the valid call releases the matching ordered answers and one grading capability. |
| `record_skillpilot_verified_recall_results` | Submit exactly one ordered result for every graded card, current revision and a fresh request ID. | One atomic write, no partial scheduling update, correct next continuation and no separate memory-mastery write. |
| `get_skillpilot_exam_evaluation` | Present the prepared exam, wait for the complete visible submission, then request evaluation for that active exam goal. | Solution/rubric appear only after the submission, are bounded to the active exam and return the capability required for an exam mastery write. |

For the exam block, call `set_skillpilot_mastery` once more with the unchanged
evaluation capability and the fixture's earned points. Confirm that a failing
score cannot be saved as completed mastery and that an equivalent correct
method is accepted according to the rubric.

## Hosted-Claude example prompts

Use natural requests rather than asking Claude to emit raw JSON:

1. `Use SkillPilot to load my current learning context. Summarize my active goal and suggest the next sensible step.`
2. `Show me the focus choices SkillPilot currently allows. I will choose one before you change anything.`
3. `Set the focus I just chose, then reload SkillPilot before continuing.`
4. `Help me solve the active goal without giving away the answer. Record completion only if my visible work meets SkillPilot's evidence rule.`
5. `Start SkillPilot verified recall. Show every card and wait for all my answers before requesting the answer key.`
6. `Give me the active SkillPilot exam task without hints. Wait for my complete answer before requesting the evaluation.`

Repeat the context and one write flow once in German and once in English. The
tool `language` argument and Claude's prose must match the learner's language.

## Required adversarial and failure cases

- unauthenticated request and token with wrong resource/audience;
- missing read scope and missing write scope;
- untrusted or absent browser Origin where the endpoint requires it;
- unknown argument, overlong string, invalid UUID and oversized body;
- unpublished focus, ineligible/foreign active goal and Level-2 mutation attempt;
- stale `expectedStateVersion` after another client advances the learner state;
- exact replay of one successful write with the same request ID and payload:
  same result, no second mutation;
- same request ID reused with a different payload or tool: actionable rejection;
- missing, expired, altered, cross-connection or wrong-purpose capability;
- incomplete, extra or reordered recall result list: no partial write;
- exam evaluation requested before a complete visible answer;
- refresh rotation/replay, explicit revocation and reconnect;
- concurrent ChatGPT/Claude writes in both directions, followed by a reload;
- timeout, malformed request and rate-limit saturation without an OpenAI state
  change, process restart or readiness failure;
- application, reverse-proxy and telemetry logs contain no request/response
  bodies, passwords, tokens, capabilities or protected answers.

## Evidence table

Keep the completed table in the approved non-secret evidence location. Do not
commit recordings or screenshots containing learner data.

| Run | Client | Language | Tool/case | Valid/invalid | Result | Evidence reference |
| --- | --- | --- | --- | --- | --- | --- |
|  | MCP Inspector |  |  |  |  |  |
|  | Claude.ai custom connector |  |  |  |  |  |

## Pass condition

The gate passes only when all nine tools work with valid input in both required
clients, all applicable negative cases fail closed with actionable errors, the
reviewer profile can be reset, revocation/reconnect works, and the OpenAI V1
differential remains zero.

