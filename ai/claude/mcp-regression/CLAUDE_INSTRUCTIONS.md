# Transparent Claude MCP regression prompts

This is a human-facing prompt sheet, not a set of standing instructions for Claude.
Do **not** paste this whole file into a chat. In a fresh chat, enable only the
SkillPilot connector and paste only the prompt for the test you are running.

The connector exposes two isolated test tools:

- `createRegressionProbe` creates random synthetic test markers;
- `verifyRegressionProbe` checks that the complete sample was passed back unchanged.

Their MCP schema uses the fields `probe_id`, `sample_marker`, and `integrity_tag`.
The tools operate only on inert synthetic test data and perform no learner, account,
or authorization action. Tool calls and results should remain visible in Claude's
normal tool trace.

## Test A: read one fresh result

Start a fresh chat, enable SkillPilot, and send only this prompt:

```text
Please run a transparent, one-off test of my SkillPilot MCP connector.

Call createRegressionProbe once. Keep the normal tool call and result visible, then briefly report whether it completed and name the fields in the returned object without repeating their values. Do not call verifyRegressionProbe in this response.
```

This passes when Claude calls `createRegressionProbe` once, calls no other tool, and
accurately names the three returned fields without copying their values into prose.

## Test B: same-turn handoff

Start another fresh chat, enable SkillPilot, and send only this prompt:

```text
Please run a transparent, one-off handoff test of my SkillPilot MCP connector.

Call createRegressionProbe once and then, in this same response, call verifyRegressionProbe once with the unchanged probe_id, sample_marker, and integrity_tag from the creation result. Keep both tool calls and results visible. Briefly report the values of ok and integrity_valid from the verifier.
```

This passes when the trace shows one creation followed by one verification and the
verifier returns `ok=true` and `integrity_valid=true`.

## Test C: cross-turn backend-attested handoff

Start another fresh chat and enable SkillPilot. Send the following two prompts as
two consecutive user messages, with no intervening request.

First message:

```text
Please run the first half of a transparent, one-off handoff test of my SkillPilot MCP connector. I am measuring whether inert synthetic sample data from one connector call remains usable on the immediately following user turn. I will inspect Claude's normal tool trace.

Call createRegressionProbe once and keep its normal tool call and result visible. Do not call verifyRegressionProbe yet. Briefly confirm when the synthetic sample is ready for the next step.
```

Second message, immediately afterward:

```text
Now call verifyRegressionProbe once using the unchanged probe_id, sample_marker, and integrity_tag from the createRegressionProbe result in the immediately preceding turn. Do not create another sample. Keep the verification call and result visible, then briefly report the values of ok and integrity_valid.
```

This passes only when the first turn calls `createRegressionProbe` once without
copying its tuple into ordinary assistant prose, the second turn calls only
`verifyRegressionProbe`, and the verifier returns `ok=true` and
`integrity_valid=true`. If Claude copies the tuple into its first prose response, record
the run as a visible-context control rather than proof of MCP-result retention.

If Claude declines either prompt, record a policy refusal. A refusal is not evidence
that the result was forgotten. Do not ask Claude to adopt this sheet as a persistent
protocol, suppress explanations globally, or return fixed magic strings.
