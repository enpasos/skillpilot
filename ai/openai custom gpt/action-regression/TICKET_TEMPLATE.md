# OpenAI support ticket: Custom GPT Action output across turns

This template separates the observed behavior from possible internal causes. Replace every
`<...>` placeholder before submitting it. Do not include production credentials, cookies,
learner data, start codes, or SkillPilot session tokens.

## Short initial message for the support chat

```text
Hello, we need a technical investigation of a reproducible Custom GPT Actions issue.

A minimal private GPT calls a public, stateless test API. Fresh unpredictable JSON values are
read correctly and can be passed into a second Action within the same assistant turn; the
backend verifies the exact HMAC-signed tuple and the GPT replies CHAIN_PASS. In a fresh chat,
however, values returned by the same successful Action are not used on the immediately
following user/assistant exchange: RUN_RETAIN returns RETAIN_READY, then RECALL_RETAIN returns
RETAIN_MISSING.

This behavior is sufficient to break our production learning coach. The timing correlates with
the GPT-5.6 rollout, but we are not claiming causation. We need clarification of the supported
cross-turn persistence contract for ordinary JSON Action responses, an internal trace review
for the supplied conversation IDs, and OpenAI's recommended architecture for multi-turn Custom
GPT workflows.

Custom GPT ID: <private GPT ID>
Affected conversation: <private conversation ID>
Public reproducer: https://skillpilot.com/openai/custom-gpt-action-regression

I can provide the exact OpenAPI file and Instructions with SHA-256 hashes, UTC timestamps,
screenshots/video, sanitized Spring audit events, and the direct HTTP control manifest.
```

## Detailed report

### Subject

Custom GPT Actions: successful JSON result works within one assistant turn but is unavailable
on the immediately following turn

### Summary

Our production Custom GPT, SkillPilot Coach, stopped working reliably around the GPT-5.6
rollout. We report that timing as correlation only; the observable evidence does not establish
which model or internal OpenAI component caused the change.

To isolate the behavior, we created a new private `RegressionGPT` and a minimal public Action
API. The reproducer excludes authentication, databases, learner data, RAG, large payloads, and
SkillPilot domain logic.

The controlled distinction is:

| Case | Observed result |
|---|---|
| Read fresh Action fields in the same assistant execution (`RUN_SINGLE`) | Pass |
| Pass the complete fresh Action result into a second Action in the same assistant execution (`RUN_CHAIN`) | Pass; backend returns `proof_valid=true` |
| Use fields from that successful Action result immediately after the next user message in the same conversation (`RUN_RETAIN` then `RECALL_RETAIN`) | Fail; GPT returns `RETAIN_MISSING` |

We are asking OpenAI to clarify whether ordinary JSON Action results are expected to be
available across user turns, whether that behavior changed, and which supported architecture
should replace it if it is not a product guarantee.

### Why this is not only an authentication-token issue

The field named `token` in the reproducer is synthetic test data. It has no authentication,
authorization, session, or data-access effect. The test endpoint itself is unauthenticated. The
value is merely a fresh unpredictable marker covered by an HMAC together with a fresh
`probe_id`.

The observed run proves only that this particular prior Action value was not used; it does not
prove that every possible field type is always removed. The architectural concern is broader:
if ordinary Action JSON is not reliably available on later turns, later coaching turns cannot
reliably depend on earlier learner-state responses, object IDs, cursors, navigation results,
exercises, scoring results, or workflow directives either.

OAuth could ensure that an identity credential is attached to every Action request. OAuth by
itself would not preserve arbitrary earlier backend results or identify which earlier resource
or simultaneous conversation a later turn refers to. We therefore need the supported state
contract before redesigning the production integration.

### Minimal setup

- Private saved Custom GPT, used through its direct link
- No Knowledge files, Apps, Web Search, Data Analysis, Image Generation, or other capabilities
- One Custom Action definition with exactly two operations
- Authentication: `None`
- Both operations set `x-openai-isConsequential: false`
- Public base URL: `https://skillpilot.com/api/action-regression`
- Spring Boot version: `4.1.0`
- GPT ID: `<private GPT ID>`
- GPT visibility: private
- GPT last updated: `<UTC timestamp>`
- Exact imported OpenAPI SHA-256: `648a7fac0ee40a3550fb07dd74b8368318361e90740a6acb2c6a8fa87017129d`
- Exact Instructions SHA-256: `f4e330e9eb9ad58f95d3018536c75263f7c2dc3d6347954c5981609c6a06de44`
- Deployed source commit/build: `<confirm; current local HEAD is 46e51a818e9fd9e87aa23aeb4f88da386afa54f8>`

`createRegressionProbe` returns a fresh response:

```json
{
  "probe_id": "<fresh UUID>",
  "token": "<fresh unpredictable synthetic marker>",
  "proof": "<HMAC prefix over probe_id and token>"
}
```

`verifyRegressionProbe` verifies the exact tuple without storing per-probe state. Values cannot
be inferred from the Instructions, OpenAPI schema, or previous runs.

### Positive transport control

On 2026-07-13 at 15:05:52 UTC, the independent HTTP control against the same public deployment
returned `CONTROL_PASS`:

- health: HTTP 200
- rendered OpenAPI: HTTP 200
- probe: HTTP 200
- unchanged verify: HTTP 200, `ok=true`, `proof_valid=true`
- one-character proof mutation: HTTP 200, `ok=false`, `proof_valid=false`
- non-secret Spring `application_id`: `skillpilot-backend`
- non-secret `hmac_key_id`: `2db3bc332ee54105`
- evidence directory/manifest: `tmp/custom-gpt-action-regression/20260713T150546Z/control/`
- prepared control archive SHA-256: `c02f1bb5a0d877ce35e102fb4bd6ec54c313806d8d2bf8eee8c34d8d93751ffd`

This control establishes that the deployed endpoint and verifier work. It does not exercise or
make claims about OpenAI's internal Action-result handling.

### Steps to reproduce

1. Open the saved private RegressionGPT from its direct link in a new conversation.
2. Select `<visible model/mode>` and record reasoning level, automatic switching, fallback, and
   quota indications. For the attached observed run this was `<confirm: GPT-5.6 Sol / Thinking /
   Standard>`.
3. If an Action approval prompt appears, complete a separate priming run and exclude it.
4. In one fresh conversation send exactly `RUN_SINGLE`.
5. Confirm that the reply contains the fresh `probe_id` and synthetic `token` from the successful
   Action response.
6. In a second fresh conversation send exactly `RUN_CHAIN`.
7. Confirm from the server audit that exactly one probe and one following verify occurred with
   the same tuple and `proof_valid=true`; confirm the visible reply is `CHAIN_PASS`.
8. In a third fresh conversation send exactly `RUN_RETAIN`.
9. Confirm one probe call returned HTTP 200 and the visible reply is `RETAIN_READY`.
10. Immediately send exactly `RECALL_RETAIN` in that same conversation. Do not add any other
    message or wait for a long conversation to develop.
11. Record the exact response and confirm whether any additional Action request occurred.

### Expected behavior or requested contract clarification

The production integration previously depended on selected Action-result values being usable
on later turns of the same conversation. Under that behavior, `RECALL_RETAIN` would reply:

```text
RETAIN token=<exact synthetic token returned by the prior Action>
```

If cross-turn availability of ordinary Action results is not supported, please confirm this
explicitly and provide the supported replacement design. The public documentation illustrates
same-turn Action chaining, but we have not found a documented persistence guarantee for generic
JSON results across user turns.

### Actual observed behavior

The first Action returns HTTP 200 and the GPT replies:

```text
RETAIN_READY
```

On the immediately following user/assistant exchange, in the same short conversation, it
replies:

```text
RETAIN_MISSING
```

- Conversation URL: `<private full conversation URL copied from the address bar>`
- Conversation ID: `<private conversation ID>`
- `RUN_RETAIN` UTC timestamp: `<fill>`
- `RECALL_RETAIN` UTC timestamp: `<fill>`
- Selected model/mode and reasoning level: `<fill>`
- Automatic switching: `<fill>`
- Visible routing/fallback/quota indication: `<fill>`
- Probe request ID and `probe_id`: `<fill from sanitized Spring audit>`
- Additional Action during `RECALL_RETAIN`: `<expected none; confirm from audit>`

`RETAIN_READY` alone does not prove that a value was durably stored. `RETAIN_MISSING` also does
not identify whether the cause was model instruction following, next-turn context construction,
context selection, compaction, safety processing, routing, or another internal behavior. Only
OpenAI can distinguish these possibilities from internal traces.

The chat contains only two short user messages and two short assistant replies. Ordinary visible
context-window exhaustion is therefore unlikely. We nevertheless do not assume that no internal
context selection or compaction occurred.

### Repetition matrix

Run at least five fresh retention conversations under one fixed configuration. Record model
comparisons separately rather than mixing them into one rate.

| UTC | Conversation ID | Surface | Selected mode | Auto-switch | `RUN_SINGLE` | `RUN_CHAIN` | `RUN_RETAIN` | `RECALL_RETAIN` | Extra Action on recall |
|---|---|---|---|---|---|---|---|---|---|
| `<fill>` | `<private conversation ID>` | saved private GPT/web | `<fill>` | `<fill>` | pass in separate chat | pass in separate chat | `RETAIN_READY` | `RETAIN_MISSING` | `<confirm>` |
| | | | | | | | | | |
| | | | | | | | | | |
| | | | | | | | | | |
| | | | | | | | | | |

### Production impact

SkillPilot Coach is currently unusable for affected learners. Its established workflow is:

1. A link in the SkillPilot notebook UI opens the Custom GPT with a prefilled one-time start code;
   the learner only presses Return.
2. The first Action resolves that code to a backend session reference and returns learner state
   plus the next workflow action.
3. Later user turns depend on backend responses from previous Actions while the learner answers,
   navigates goals, requests exercises, and submits results.
4. The same ChatGPT conversation must remain usable when the learner switches from ChatGPT web on
   a notebook to the native mobile app, especially to take and upload photos.

The minimal reproducer does not prove that the production failure has the same internal root
cause. It demonstrates a cross-turn behavior that is independently sufficient to break the
existing design.

### Questions for OpenAI

1. Are ordinary successful JSON responses from Custom GPT Actions expected to remain available
   to the model after the next user message in the same conversation?
2. If yes, what duration, turn count, size limits, model modes, or other conditions are guaranteed?
3. If no, was previous cross-turn use incidental, or has the supported behavior changed recently?
4. Did treatment of Action results change around the GPT-5.6 rollout? Is the observed behavior
   intentional, a known regression, or part of a staged rollout?
5. For the supplied conversation IDs, was the successful Action result included in the next-turn
   model context? If not, at which processing stage was it omitted or transformed?
6. Can context selection, summarization, compaction, safety processing, or model routing omit a
   successful Action result before the immediately following turn even in a fresh, very short
   conversation? Can a GPT builder control this or mark exact fields as required state?
7. Are opaque exact values such as object IDs, cursors, signed references, or state handles
   expected to survive any summarization? Are token-like field names handled differently from
   neutral fields?
8. Returned files are documented as becoming part of the conversation and potentially being
   available to later Actions. Is there an equivalent supported mechanism for ordinary structured
   JSON state?
9. Does a Custom GPT Action receive any stable documented per-conversation identifier that a
   backend may safely use to key server-side state? If not, is one planned?
10. What architecture does OpenAI recommend when a later user turn must refer to arbitrary data
    returned by an earlier Action: re-fetch all state, OAuth identity plus backend state, returned
    files, another Action pattern, or migration to a different OpenAI product?
11. If OAuth identity is the recommended server-side key, how should multiple simultaneous
    conversations for the same OAuth user be isolated? Is OAuth state expected to follow the same
    conversation between ChatGPT web and the native mobile app?
12. Are there model- or routing-specific differences? Can a recommended model selection or
    disabling automatic switching make cross-turn Action behavior deterministic?
13. Is restoration or formal support of cross-turn Action-result availability planned? If not,
    is there a deprecation or migration notice we should follow?

Please inspect internal traces for:

- receipt and parsing of `createRegressionProbe`'s HTTP 200 JSON response;
- the exact next-turn context construction and whether the Action result or a summary was present;
- any context selection, summarization, compaction, or safety transformation between the turns;
- backend model, reasoning mode, routing, and fallback decisions;
- the instruction-processing path that produced `RETAIN_MISSING`.

### Public documentation gap relevant to the question

The current official documentation:

- recommends returning raw structured data from Actions and letting the GPT use it;
- illustrates multiple Action calls chained within one assistant execution;
- documents generic payload and timeout limits;
- explicitly documents returned files as conversation artifacts that may be sent in later Action
  invocations.

We have not found an official statement guaranteeing or forbidding next-turn availability of
ordinary JSON Action results. API documentation for Responses API compaction is a different
product surface and should not be assumed to describe Custom GPT internals.

Relevant official pages:

- https://developers.openai.com/api/docs/actions/introduction
- https://developers.openai.com/api/docs/actions/production
- https://developers.openai.com/api/docs/actions/sending-files
- https://help.openai.com/en/articles/8554407-gpts-in-chatgpt
- https://help.openai.com/en/articles/11325361-troubleshooting-gpts

### Attachments

- Exact rendered and imported `configured-openapi.yaml` with SHA-256
- Exact `REGRESSION_GPT_INSTRUCTIONS.md` with SHA-256
- Parsed-operation and private-GPT configuration screenshots
- Screenshot/video of `RUN_SINGLE`, `RUN_CHAIN`, `RUN_RETAIN`, and `RECALL_RETAIN`
- Conversation URLs/IDs and UTC timestamps
- Sanitized Spring `action_regression` audit for the narrow UTC windows
- Direct HTTP control directory including `evidence-manifest.json`
- Completed repetition matrix
- Reproducer source commit or immutable archive and hash
- Separate production-impact description
- Sanitized HAR and browser console log if Support requests them

## Submission route

Use the chat bubble at the bottom-right of https://help.openai.com. This is OpenAI's documented
technical support route. Paste the short initial message first, then provide this detailed report
and attachments. The in-product “Report GPT/conversation” flow is intended for content, safety,
or legal reports and is not the primary route for this technical regression.
