# Claude MCP regression test protocol

## Purpose

This protocol establishes a small Claude baseline before testing the SkillPilot coach. It checks four distinct behaviors through the production SkillPilot MCP connector:

1. immediate reading of a fresh tool result (`RUN_SINGLE`);
2. exact result handoff to a second tool in the same assistant turn (`RUN_CHAIN`);
3. exact use of a hidden tool result after one user-turn boundary (`RUN_RETAIN` then `RECALL_RETAIN`);
4. backend-attested handoff after one user-turn boundary (`RUN_RETAIN` then `VERIFY_RETAIN`).

The probe contains only random synthetic markers. `proof_valid=true` is produced by the backend only when the complete tuple is unchanged. A pass demonstrates the observed behavior in the recorded Claude surface and model; it does not guarantee that future models, long conversations, or context compaction behave identically.

## Preconditions and isolation

- Use a dedicated adult test account and test learner, not a production learner.
- Run the backend in its isolated regression configuration: `SKILLPILOT_CLAUDE_ENABLED=true`, `SKILLPILOT_CLAUDE_MCP_ENABLED=true`, `SKILLPILOT_CLAUDE_COACH_TOOLS_ENABLED=false`, and `SKILLPILOT_CLAUDE_REGRESSION_TOOLS_ENABLED=true`.
- Install and authorize the SkillPilot custom connector normally. Never extract or record OAuth codes, cookies, access tokens, refresh tokens, or the permanent SkillPilot ID.
- In **every fresh test chat**, paste the complete raw contents of `CLAUDE_INSTRUCTIONS.md` unchanged as the first message. Expect exactly `TEST_READY` with no tool call. Begin the measured command only in the next user turn.
- In that conversation, open **+ > Connectors** and enable SkillPilot. Enable no other connector; disable web search and code execution where the UI permits.
- Confirm that SkillPilot offers exactly `createRegressionProbe` and `verifyRegressionProbe`. If a coach tool is still visible, reload the connector metadata or stop: the server is not in the isolated configuration.
- If Claude asks for tool approval, approve only those two named regression tools. Manual approval is valid; record whether it occurred. Never approve an unexpected tool.
- Any call other than those two regression tools invalidates the run; stop and use a new chat.

Project instructions are only an optional secondary setup if the current Claude UI demonstrably applies them in conversations that use this custom connector. Do not use that unverified variant for the primary baseline. If it is tested, label its results separately.

Run the direct server control once before the Claude block:

```bash
npm --prefix "ai/openai custom gpt/action-regression" run control -- \
  --base-url https://skillpilot.com/api/action-regression \
  --evidence-dir "tmp/claude-mcp-regression/<run-id>/server-control"
```

Expected: `CONTROL_PASS`. This checks the shared probe/verifier implementation independently; it is not a Claude result.

## Record before each block

Record the following without secrets:

- UTC and local start time;
- exact visible Claude model name and any thinking/effort setting;
- Claude plan, surface (`web`, `desktop`, `iOS`, or `Android`), app/browser version, operating system, and workspace if applicable;
- conversation URL/ID, setup method (pasted instructions or separately verified Project), connector name, and whether its tools were enabled;
- instruction setup result (`TEST_READY`) and tool-approval mode/prompt;
- deployed SkillPilot Git commit and Spring process start time;
- the non-secret `hmac_key_id` from `/api/action-regression/healthz`;
- SHA-256 of the exact instructions:

```bash
curl -fsS https://skillpilot.com/api/action-regression/healthz
sha256sum ai/claude/mcp-regression/CLAUDE_INSTRUCTIONS.md
```

Do not change the model, instructions, connector configuration, or backend process during a block. In particular, **never restart Spring Boot between `RUN_RETAIN` and its immediately following `RECALL_RETAIN` or `VERIFY_RETAIN`**: the regression HMAC key is generated at process start.

Keep a terminal ready to capture the privacy-safe MCP audit. It records probe IDs but only SHA-256 hashes of tokens and proofs:

```bash
sudo journalctl -u skillpilot --since '<UTC block start>' -o cat \
  | grep '"transport":"claude-mcp"' \
  | grep -E '"event":"probe_(issued|verified)"' \
  > "tmp/claude-mcp-regression/<run-id>/mcp-audit.log"
```

Expected events are `probe_issued` and, for CHAIN/VERIFY, `probe_verified`, all with `service="skillpilot-action-regression"`, `transport="claude-mcp"`, `probe_id`, `token_sha256`, and `proof_sha256`. Verification also records `verify_called=true` and `proof_valid`. Raw tokens and proofs must not appear in this audit.

## Test A: immediate result

After the `TEST_READY` setup in a fresh chat and enabling SkillPilot through **+ > Connectors**, send exactly:

```text
RUN_SINGLE
```

Expected final response:

```text
SINGLE probe_id=<fresh UUID> token=<fresh SPREG token>
```

Pass only when the tool trace and MCP audit show exactly one `createRegressionProbe`, no verifier call, and the displayed `probe_id` and `token` exactly match its result. Additional prose is a final-format failure.

## Test B: same-turn chain

After the same setup in another fresh chat, send exactly:

```text
RUN_CHAIN
```

Expected final response:

```text
CHAIN_PASS
```

Pass only when the same assistant turn contains exactly one `createRegressionProbe`, followed by exactly one `verifyRegressionProbe`, with all three arguments unchanged, and the verifier result contains `ok=true`, `proof_valid=true`, and the same `probe_id`. The MCP audit must contain the matching `probe_issued` then `probe_verified` events with equal hashes and `proof_valid=true`. A new probe or reversed/repeated call invalidates the run.

## Test C: exact cross-turn recall

After the same setup in another fresh chat, send these as two consecutive measured user messages with no intervening request:

```text
RUN_RETAIN
```

Expected: `RETAIN_READY`.

Then immediately send:

```text
RECALL_RETAIN
```

Expected:

```text
RETAIN probe_id=<retained UUID> token=<retained SPREG token> proof=<retained proof>
```

Pass only when:

- the first turn called `createRegressionProbe` exactly once and hid all three values;
- the second turn called no tool;
- the recalled `probe_id` equals the `probe_issued` audit value;
- SHA-256 of the recalled token and proof equals that event's `token_sha256` and `proof_sha256`.

Compute the hashes locally without a trailing newline:

```bash
printf '%s' '<recalled-token>' | sha256sum
printf '%s' '<recalled-proof>' | sha256sum
```

These are synthetic markers, not credentials. If neither the MCP audit nor the first tool result is available for comparison, record this test as `NOT_ATTESTABLE`, not `PASS`. `RETAIN_MISSING` is the explicit retention failure signal.

## Test D: backend-attested cross-turn verify

Use another freshly instructed chat; do not reuse Test C. Send:

```text
RUN_RETAIN
```

Expected: `RETAIN_READY`.

Then immediately send:

```text
VERIFY_RETAIN
```

Expected final response:

```text
VERIFY_PASS
```

Pass only when the first turn called `createRegressionProbe` exactly once, the second turn called only `verifyRegressionProbe` with the retained tuple, and the backend result contains `ok=true`, `proof_valid=true`, and the original `probe_id`. The two matching MCP audit events must have the same probe ID, token hash, and proof hash, with `proof_valid=true`. A second `createRegressionProbe` in the verification turn invalidates the run even if the final response says `VERIFY_PASS`.

This is the strongest cross-turn result: the backend, rather than Claude's text response, attests that the hidden signed tuple survived unchanged across the user-turn boundary.

## Repetition and result table

First run A-D once. If the setup is correct, repeat every test five times in a new, freshly instructed chat per run. Tests C and D each require their own `RUN_RETAIN` pair. Never perform `RECALL_RETAIN` and `VERIFY_RETAIN` on the same retained tuple.

| Run | UTC | Model/settings | Surface | Test | Exact final output | Tool sequence | `proof_valid` | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 |  |  |  | SINGLE |  |  | n/a |  |
| 02 |  |  |  | CHAIN |  |  |  |  |
| 03 |  |  |  | RECALL |  |  | n/a |  |
| 04 |  |  |  | VERIFY |  |  |  |  |

Classify tool sequence, value integrity/backend verification, and final format separately. Save screenshots or a screen recording of `TEST_READY`, connector activation, approval prompts, the complete two-turn pairs, and expanded tool traces. If a trace cannot be expanded, state that limitation. Do not put credentials or learner identifiers into evidence.

## Cleanup

After the measured block:

1. Restore normal coach configuration: set `SKILLPILOT_CLAUDE_COACH_TOOLS_ENABLED=true` and `SKILLPILOT_CLAUDE_REGRESSION_TOOLS_ENABLED=false` (equivalently `--skillpilot.claude.mcp.coach-enabled=true` and `--skillpilot.claude.mcp.regression-enabled=false`), then restart the normal SkillPilot service. The Claude master and MCP flags remain enabled for the coach acceptance test.
2. Open a new Claude chat or reload the connector and confirm that the regression tools are gone and the coach tools are offered. Connector tool metadata may be cached in an already-open chat, so do not use that chat for the coach test.
3. Keep sanitized evidence under `tmp/claude-mcp-regression/<run-id>/`; do not commit it. Delete the dedicated Project/chats later if they are no longer needed.
4. Verify that the public Custom-GPT regression page and normal ChatGPT path still work; disabling the Claude regression tools must not remove the public REST reproducer.
