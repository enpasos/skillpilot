# OpenAI support ticket template

## Subject

Suspected Custom GPT Actions result-handoff or continuation/chaining issue after a successful HTTP 200 JSON response

## Summary

A newly created minimal private Custom GPT uses the attached OpenAPI document against the real public endpoint:

```text
https://skillpilot.com/api/action-regression
```

The endpoint returns HTTP 200 `application/json` with fresh, unpredictable, server-signed values. The independent direct HTTP control against that same URL completes the documented probe/verify chain successfully. In **<x>/<n>** fresh Custom GPT conversations, the observed flow then **[does not reproduce the returned values / does not attempt the verifier / attempts the verifier with malformed or incomplete input and receives HTTP 400/413/415 / sends a well-formed tuple that fails HMAC verification / verifies the tuple successfully but produces the wrong final response]**.

We report a suspected Action-result handoff or continuation/chaining issue. Our evidence describes the observable HTTP boundary; it does not identify the failing internal OpenAI component or establish a GPT-5.6-specific cause.

## Why the endpoint is deterministic

The route is hosted by the existing SkillPilot Spring Boot 4.1 deployment, but the regression handler has no authentication, database, learner data, RAG, or SkillPilot domain-service dependency. Each probe contains a fresh UUID, random token, and HMAC prefix. The verifier checks that exact tuple without stored per-probe state.

Backend process isolation is not part of the claim: the direct public control establishes that the referenced real endpoint and attached OpenAPI contract work correctly. ChatGPT's behavior after the successful Action response is the system under test.

## Timeline

- First production observation: `<date, time, timezone>`
- Last known working production conversation: `<date, time, timezone>`
- Minimal reproduction window: `<UTC start through UTC end>`
- ChatGPT status during reproduction:
- Temporal context: first observed around the GPT-5.6 rollout; treated as correlation unless controlled evidence or OpenAI traces confirm causation.

## Environment

- Account/plan: `<private ticket field>`
- Workspace ID/name and relevant policy:
- `skillpilot.com` Action domain allowlisted: `<yes/no/n/a>`
- Browser/version and OS/device:
- Normal/incognito/second browser profile:
- Independent second account/test user result:
- Network and VPN/proxy:
- Selected ChatGPT mode/reasoning level:
- Automatic switching enabled/disabled:
- Per-response visible model/reasoning label:
- Quota/fallback banner or other routing indication:
- Custom GPT direct link/ID:
- GPT visibility and last-updated timestamp:
- Test surface: saved private GPT `<primary>` / Builder Preview `<secondary>` / Action editor `<control>`
- Approval state and excluded priming run:

## Minimal GPT configuration

- New private GPT used only for this reproduction
- No knowledge files, apps, or other capabilities
- Exactly one Custom Action definition with two operations
- Authentication: None
- Both operations have `x-openai-isConsequential: false`
- Exact rendered `/api/action-regression/openapi.yaml` imported; SHA-256:
- Exact instructions SHA-256:
- Parsed operation screenshot attached:
- Reproducer source commit/archive SHA-256:

## Endpoint and deployment identity

- Public base URL: `https://skillpilot.com/api/action-regression`
- Health result:
- Deployment Git commit/build:
- Spring `application_id`:
- Spring Boot version: `4.1.0`
- Java version:
- Spring process start:
- Non-secret `hmac_key_id`:
- Restart or key change during the block: `<yes/no>`

## Steps to reproduce

1. Run the supplied direct control against `https://skillpilot.com/api/action-regression`; confirm `CONTROL_PASS`.
2. Complete and exclude a one-time approval priming run if a dialog appears.
3. Open the saved private Custom GPT from its direct link in a new conversation.
4. Select `<visible mode>` and disable automatic switching for the controlled run.
5. Record the visible response label and any quota/fallback indication.
6. Send exactly: `RUN_CHAIN`
7. Correlate `createRegressionProbe` and `verifyRegressionProbe` traffic using UTC timestamps, `probe_id`, application request IDs, `request_sequence`, and `request_started_at`.

## Expected result

`createRegressionProbe` returns HTTP 200. Exactly one following `verifyRegressionProbe` request contains the same `probe_id`, `token`, and `proof`, returns `ok=true` and `proof_valid=true`, and the GPT replies only `CHAIN_PASS`.

## Actual result

- Exact visible response:
- Server events ordered by handler-start sequence/time and call counts:
- Retries, duplicate or reordered calls:
- Verifier observation: `not observed` / `rejected` / `well-formed, proof false` / `well-formed, proof true`
- Verifier HTTP status and `error_code`:
- Call-order result: `pass/fail`
- Signed-value-integrity result: `pass/fail/not reached`
- Final-format result: `pass/fail/not reached`

## Correlated server evidence

- Conversation URL/ID:
- UTC window:
- `probe_id`:
- `action_regression` events correlated by `request_sequence` and `request_started_at`:
- Probe call count and request ID:
- Probe HTTP status/content type/bytes/duration:
- Probe response SHA-256 and committed/finished marker:
- Verifier attempted and call count:
- Verifier event: `probe_verified` / `probe_verification_rejected` / none
- Verifier request ID:
- Verifier HTTP status, `error_code`, request/response bytes and SHA-256:
- `proof_valid`: true/false/not reached
- `application_id`, separately recorded deployment commit/build, process start and `hmac_key_id`:
- Unexpected concurrent traffic: yes/no

The Spring audit establishes the exact response constructed and committed by the real referenced endpoint. `proof_valid=true` proves that the verifier received a tuple signed by the active process key. The absence of a special audit event means only that no mapped handler completed its audit; it does not by itself prove that no HTTP dispatch was attempted. These observations do not reveal which internal OpenAI component received or processed the response; please correlate them with the supplied conversation IDs and your internal traces.

## Controls

- Direct public health check:
- Direct public probe/verify control: `<CONTROL_PASS/result>`
- Direct schema-valid one-character proof-mutation control returned `ok=false`, `proof_valid=false`: `<yes/no>`
- Control evidence OpenAPI hash matches imported file: `<yes/no>`
- Action editor operation tests, recorded separately:
- Builder Preview result, recorded separately:
- TLS result:
- Client/server clocks synchronized:
- Concurrent manual/editor/control traffic excluded:

Controlled mode runs were interleaved:

| selected mode | auto-switch | visible response label | quota/fallback | `RUN_SINGLE` | `RUN_CHAIN` |
|---|---|---|---|---:|---:|
| | | | | / | / |

## Separate production impact

The existing SkillPilot Coach has the following user-visible impact: `<frequency, affected workflow, exact symptom, dates>`. That production flow contains authentication, sessions, curriculum data, larger schemas, and more complex instructions. It is included as impact and temporal context, not as the minimal reproduction.

## Attachments

- Exact rendered and imported OpenAPI document plus SHA-256
- Exact GPT instructions plus SHA-256
- Parsed-operation and GPT-configuration screenshots
- Sanitized `action_regression` Spring audit for the narrow UTC window
- Direct control evidence manifest
- Per-run matrix with handler-start-correlated events and separate call/value/final assessments
- Screen recording/screenshots including selected mode and fallback banners
- Sanitized HAR and browser console log
- Reproducer source commit/archive plus hash
- ChatGPT status capture
- Separate SkillPilot production-impact summary

## Request

Please inspect the internal traces for the supplied conversation IDs, including:

- the exact backend model and routing/fallback decision;
- receipt and parsing of the `createRegressionProbe` Action result;
- the subsequent continuation and tool-selection decision;
- construction and dispatch of `verifyRegressionProbe`, including validation failures or retries;
- any difference between saved private GPT, Builder Preview, and Action editor paths.
