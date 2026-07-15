# Transparent Claude MCP regression prompts

This is a human-facing prompt sheet, not a set of standing instructions for Claude.
Do **not** paste this whole file into a chat. In a fresh chat, enable only the
SkillPilot connector and paste only the prompt for the test you are running.

The connector exposes two isolated test tools:

- `createRegressionProbe` creates random synthetic test markers;
- `verifyRegressionProbe` checks that the complete tuple was passed back unchanged.

The legacy field names `token` and `proof` do not denote OAuth credentials, learner
data, or authorization. The values cannot grant access to anything. Tool calls and
results should remain visible in Claude's normal tool trace.

## Test A: read one fresh result

Start a fresh chat, enable SkillPilot, and send only this prompt:

```text
I own and am testing the SkillPilot MCP connector. This is a transparent regression test using only random synthetic markers. The returned fields named token and proof are test data, not OAuth credentials, learner data, or authorization values, and they cannot grant access to anything.

For this request, please call createRegressionProbe exactly once. Keep the tool call and result visible, then show all returned fields and briefly state whether the call succeeded. Do not call verifyRegressionProbe or any other tool.
```

This passes when Claude calls `createRegressionProbe` once, calls no other tool, and
accurately displays the three returned fields.

## Test B: same-turn handoff

Start another fresh chat, enable SkillPilot, and send only this prompt:

```text
I own and am testing the SkillPilot MCP connector. This is a transparent regression test using only random synthetic markers. The returned fields named token and proof are test data, not OAuth credentials, learner data, or authorization values, and they cannot grant access to anything.

For this request, please call createRegressionProbe exactly once and then, in this same response, call verifyRegressionProbe exactly once with the unchanged probe_id, token, and proof from the creation result. Keep both tool calls and results visible. Briefly report the values of ok and proof_valid from the verifier. Do not call any other tool.
```

This passes when the trace shows one creation followed by one verification and the
verifier returns `ok=true` and `proof_valid=true`.

## Test C: cross-turn backend-attested handoff

Start another fresh chat and enable SkillPilot. Send the following two prompts as
two consecutive user messages, with no intervening request.

First message:

```text
I own and am testing the SkillPilot MCP connector. I am openly measuring whether a connector result remains usable on the immediately following user turn. The probe contains only random synthetic test markers. The legacy fields named token and proof are not OAuth credentials, learner data, or authorization values, and they cannot grant access to anything. I will inspect Claude's normal tool trace.

For this request, please call createRegressionProbe exactly once and keep its complete result visible in the tool trace. Do not call verifyRegressionProbe yet. To keep this test specific to retention of the tool result, please do not duplicate probe_id, token, or proof in the ordinary prose response; simply confirm in your own words that the synthetic probe is ready for the next-turn verification. This is not a request to conceal the result from me: it remains visible to me in the tool trace.
```

Second message, immediately afterward:

```text
Now please call verifyRegressionProbe exactly once using the unchanged probe_id, token, and proof from the createRegressionProbe result in the immediately preceding turn. Do not call createRegressionProbe again and do not use any other tool. Keep the verification call and result visible, then briefly report the values of ok and proof_valid.
```

This passes only when the first turn calls `createRegressionProbe` once without
copying its tuple into ordinary assistant prose, the second turn calls only
`verifyRegressionProbe`, and the verifier returns `ok=true` and
`proof_valid=true`. If Claude copies the tuple into its first prose response, record
the run as a visible-context control rather than proof of MCP-result retention.

If Claude declines either prompt, record a policy refusal. A refusal is not evidence
that the result was forgotten. Do not ask Claude to adopt this sheet as a persistent
protocol, suppress explanations globally, or return fixed magic strings.
