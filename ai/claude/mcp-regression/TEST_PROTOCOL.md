# Claude MCP regression test protocol

## Purpose

This protocol establishes a small Claude baseline before testing the SkillPilot
coach. It uses normal, transparent requests rather than asking Claude to install a
conversation-long command protocol. It checks three behaviors through the
production SkillPilot MCP connector:

1. immediate reading of one fresh tool result;
2. exact handoff to a second tool in the same assistant turn;
3. backend-attested use of that result after the immediately following user turn.

The probe contains only random synthetic markers. The legacy fields named `token`
and `proof` are not OAuth credentials, learner data, or authorization values and
cannot grant access to anything. `proof_valid=true` is produced by the backend only
when the complete tuple is unchanged.

A pass demonstrates the observed behavior in the recorded Claude surface and model.
It does not guarantee that future models, long conversations, or context compaction
behave identically.

## Preconditions and isolation

- Use a dedicated adult test account and test learner, not a production learner.
- Run the backend in its isolated regression configuration:
  `SKILLPILOT_CLAUDE_ENABLED=true`, `SKILLPILOT_CLAUDE_MCP_ENABLED=true`,
  `SKILLPILOT_CLAUDE_COACH_TOOLS_ENABLED=false`, and
  `SKILLPILOT_CLAUDE_REGRESSION_TOOLS_ENABLED=true`.
- Install and authorize the SkillPilot custom connector normally. Never extract or
  record OAuth codes, cookies, access tokens, refresh tokens, or the permanent
  SkillPilot ID.
- In every fresh test chat, enable SkillPilot through **+ > Connectors**. Enable no
  other connector; disable web search and code execution where the UI permits.
- Confirm that SkillPilot offers exactly `createRegressionProbe` and
  `verifyRegressionProbe`. If a coach tool is visible, reload the connector metadata
  or stop: the server is not in the isolated configuration.
- If Claude asks for tool approval, approve only those two named regression tools.
  Manual approval is valid; record whether it occurred. Never approve an unexpected
  tool.
- Open `CLAUDE_INSTRUCTIONS.md` as a human-facing prompt sheet. Do **not** paste the
  whole file into Claude and do not ask Claude to adopt standing instructions. Copy
  only the prompt belonging to the current test.
- Keep Claude's normal tool calls and results visible. Do not ask it to conceal tool
  activity or to suppress explanations globally.

Run the direct server control once before the Claude block:

```bash
npm --prefix "ai/openai custom gpt/action-regression" run control -- \
  --base-url https://skillpilot.com/api/action-regression \
  --evidence-dir "tmp/claude-mcp-regression/<run-id>/server-control"
```

Expected: `CONTROL_PASS`. This checks the shared probe/verifier implementation
independently; it is not a Claude result.

## Record before each block

Record the following without secrets:

- UTC and local start time;
- exact visible Claude model name and any thinking/effort setting;
- Claude plan, surface (`web`, `desktop`, `iOS`, or `Android`), app/browser version,
  operating system, and workspace if applicable;
- conversation URL/ID, connector name, and whether its tools were enabled;
- tool-approval mode/prompt;
- deployed SkillPilot Git commit and Spring process start time;
- the non-secret `hmac_key_id` from `/api/action-regression/healthz`;
- SHA-256 of the exact prompt sheet:

```bash
curl -fsS https://skillpilot.com/api/action-regression/healthz
sha256sum ai/claude/mcp-regression/CLAUDE_INSTRUCTIONS.md
```

Do not change the model, connector configuration, or backend process during a block.
In particular, never restart Spring Boot between the two messages of Test C: the
regression HMAC key is generated at process start.

Keep a terminal ready to capture the privacy-safe MCP audit. It records probe IDs but
only SHA-256 hashes of tokens and proofs:

```bash
sudo journalctl -u skillpilot --since '<UTC block start>' -o cat \
  | grep '"transport":"claude-mcp"' \
  | grep -E '"event":"probe_(issued|verified)"' \
  > "tmp/claude-mcp-regression/<run-id>/mcp-audit.log"
```

Expected events are `probe_issued` and, for Tests B and C, `probe_verified`, all with
`service="skillpilot-action-regression"`, `transport="claude-mcp"`, `probe_id`,
`token_sha256`, and `proof_sha256`. Verification also records
`verify_called=true` and `proof_valid`. Raw tokens and proofs must not appear in this
audit.

## Test A: immediate result

Start a fresh chat, enable SkillPilot, and paste only the **Test A** prompt from
`CLAUDE_INSTRUCTIONS.md`.

Pass only when the tool trace and MCP audit show exactly one
`createRegressionProbe`, no verifier call, and Claude accurately displays the
returned `probe_id`, `token`, and `proof`. Natural explanatory prose is allowed.

## Test B: same-turn chain

Start another fresh chat, enable SkillPilot, and paste only the **Test B** prompt.

Pass only when the same assistant turn contains exactly one
`createRegressionProbe`, followed by exactly one `verifyRegressionProbe`, with all
three arguments unchanged. The verifier result must contain `ok=true`,
`proof_valid=true`, and the same `probe_id`. The MCP audit must contain matching
`probe_issued` then `probe_verified` events with equal hashes and
`proof_valid=true`.

A new probe, repeated call, reversed sequence, or unexpected tool invalidates the
run.

## Test C: backend-attested cross-turn handoff

Start another fresh chat, enable SkillPilot, and paste the two **Test C** prompts as
two consecutive user messages with no intervening request.

Pass only when:

- the first turn calls `createRegressionProbe` exactly once;
- its ordinary assistant prose does not duplicate `probe_id`, `token`, or `proof`,
  while the normal tool trace remains visible to the tester;
- the second turn calls only `verifyRegressionProbe` with the unchanged tuple from
  the immediately preceding tool result;
- no second `createRegressionProbe` is called;
- the verifier result contains `ok=true`, `proof_valid=true`, and the original
  `probe_id`;
- the two matching MCP audit events have the same probe ID, token hash, and proof
  hash, with `proof_valid=true`.

This is the strongest result: the backend, rather than Claude's prose, attests that
the synthetic MCP result survived unchanged across the user-turn boundary.

If Claude copies the tuple into its first prose response, record the run as
`VISIBLE_CONTEXT_CONTROL`, not as proof of MCP-result retention. If Claude declines
the transparent request, record `POLICY_REFUSAL`. A refusal means the measured tool
sequence did not run; it is not a retention failure.

## Repetition and result table

First run A-C once. If the setup is correct, repeat each test five times in a new
chat per run. Test C always needs its own two-message pair.

| Run | UTC | Model/settings | Surface | Test | Tool sequence | `proof_valid` | Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 01 |  |  |  | Immediate |  | n/a |  |
| 02 |  |  |  | Same-turn |  |  |  |
| 03 |  |  |  | Cross-turn |  |  |  |

Classify tool sequence, value integrity/backend verification, and Claude's prose
separately. Save screenshots or a screen recording of connector activation, approval
prompts, the complete cross-turn pair, and expanded tool traces. If a trace cannot be
expanded, state that limitation. Do not put credentials or learner identifiers into
evidence.

## Cleanup

After the measured block:

1. Restore normal coach configuration: set
   `SKILLPILOT_CLAUDE_COACH_TOOLS_ENABLED=true` and
   `SKILLPILOT_CLAUDE_REGRESSION_TOOLS_ENABLED=false` (equivalently
   `--skillpilot.claude.mcp.coach-enabled=true` and
   `--skillpilot.claude.mcp.regression-enabled=false`), then restart the normal
   SkillPilot service.
2. Open a new Claude chat or reload the connector and confirm that the regression
   tools are gone and the coach tools are offered. Connector metadata may be cached
   in an already-open chat, so do not use that chat for the coach test.
3. Keep sanitized evidence under `tmp/claude-mcp-regression/<run-id>/`; do not commit
   it. Delete the dedicated chats later if they are no longer needed.
4. Verify that the public Custom-GPT regression page and normal ChatGPT path still
   work; disabling the Claude regression tools must not remove the public REST
   reproducer.
