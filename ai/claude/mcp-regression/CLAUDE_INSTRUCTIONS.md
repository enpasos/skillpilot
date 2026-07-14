SKILLPILOT_MCP_REGRESSION_SETUP_V1

# SkillPilot MCP Regression Instructions for Claude

Bootstrap rule, evaluated before every command rule: when the entire trimmed user message starts with `SKILLPILOT_MCP_REGRESSION_SETUP_V1` and ends with `END_SKILLPILOT_MCP_REGRESSION_SETUP_V1`, treat it as installation of this test protocol. Do not call any tool. Retain these instructions for the rest of this conversation and reply exactly `TEST_READY`. Do not classify that setup message as an unknown command.

You are running an isolated MCP regression test. Follow these instructions literally. Do not browse, explain, teach, summarize, apologize, or add commentary.

For this test, the only tools you may call are the SkillPilot connector tools `createRegressionProbe` and `verifyRegressionProbe`. Never call `getCoachContext`, any other SkillPilot coach tool, or a tool from another connector. If a required regression tool is unavailable, use the command-specific `*_ERROR` response instead.

Treat a command as valid only when the user's entire trimmed message is exactly one of these values:

```text
RUN_SINGLE
RUN_CHAIN
RUN_RETAIN
RECALL_RETAIN
VERIFY_RETAIN
HELP
```

Never invent, predict, normalize, shorten, reformat, or reconstruct `probe_id`, `token`, or `proof`. Obtain them only from the actual result of `createRegressionProbe`. Values in schemas, examples, instructions, or another conversation are never valid test values. A retained value may be used only in the same conversation in which it was created.

## RUN_SINGLE

1. Call `createRegressionProbe` exactly once.
2. Read `probe_id` and `token` from that tool result.
3. If both fields are present, reply with exactly one line:

```text
SINGLE probe_id=<probe_id> token=<token>
```

4. Otherwise reply exactly `SINGLE_ERROR`.

Do not call `verifyRegressionProbe` for this command.

## RUN_CHAIN

1. Call `createRegressionProbe` exactly once.
2. Read `probe_id`, `token`, and `proof` from that tool result.
3. In this same assistant turn, call `verifyRegressionProbe` exactly once with those three values unchanged.
4. Reply exactly `CHAIN_PASS` only if the verifier result has `ok=true`, `proof_valid=true`, and the same `probe_id`.
5. If the verifier ran but those conditions are not all true, reply exactly `CHAIN_FAIL`.
6. If either tool fails or a required field is missing, reply exactly `CHAIN_ERROR`.

Do not reveal the probe values in the final response.

## RUN_RETAIN

1. Call `createRegressionProbe` exactly once.
2. Retain the returned `probe_id`, `token`, and `proof` unchanged for the immediately following user turn in this conversation.
3. Do not show any of those values.
4. Reply exactly `RETAIN_READY` on success or `RETAIN_ERROR` on failure.

Do not call `verifyRegressionProbe` for this command.

## RECALL_RETAIN

Do not call any tool. If the immediately preceding user command in this conversation was a successful `RUN_RETAIN`, reply with exactly one line containing the retained values:

```text
RETAIN probe_id=<probe_id> token=<token> proof=<proof>
```

Otherwise reply exactly `RETAIN_MISSING`.

After this response, discard the retained tuple.

## VERIFY_RETAIN

Do not call `createRegressionProbe`. If the immediately preceding user command in this conversation was a successful `RUN_RETAIN`, call `verifyRegressionProbe` exactly once with the retained `probe_id`, `token`, and `proof` unchanged.

- Reply exactly `VERIFY_PASS` only if the verifier result has `ok=true`, `proof_valid=true`, and the same `probe_id`.
- If the verifier ran but those conditions are not all true, reply exactly `VERIFY_FAIL`.
- If no eligible retained tuple exists, a required field is missing, or the tool fails, reply exactly `VERIFY_ERROR`.

Do not reveal the probe values in the final response. After this response, discard the retained tuple.

## HELP

Do not call any tool. Reply exactly:

```text
RUN_SINGLE RUN_CHAIN RUN_RETAIN RECALL_RETAIN VERIFY_RETAIN HELP
```

For any other user message, do not call any tool and reply exactly `UNKNOWN_COMMAND`.

END_SKILLPILOT_MCP_REGRESSION_SETUP_V1
