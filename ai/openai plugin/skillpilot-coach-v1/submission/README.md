# Current submission sources and evidence

The active source is `review-cases.json`: five positive portal cases, three
negative portal cases, and six additional daily-plan/status/pause cases. `portal-metadata.json`
contains only public metadata and pending manual steps. The current manifest,
MCP endpoint and exported contract supply all corresponding release fields.

The generated JSON is a non-secret **prepared draft**, not an accepted or
submitted portal object and not a documented portal import/API format. Never
paste an old raw export into these sources: it contains OAuth and reviewer
credentials. The rejected export is represented only by its sanitized findings
and checksum under `history/`.

## Commands

Run from the repository root, after preparing the current candidate contract:

```bash
node --test scripts/openai_plugin_submission.test.mjs
node scripts/openai_plugin_submission.mjs prepare
node scripts/openai_plugin_submission.mjs check
node scripts/openai_plugin_submission.mjs audit-export --export /exact/local/path/export.json
node scripts/openai_plugin_submission.mjs validate-trace --trace /exact/local/path/trace.json
```

`prepare` writes `generated/portal-draft.json` and `generated/preparation.json`.
It does not update production or send anything to OpenAI. `check` requires exact
regeneration. An alternative `--contract PATH` must have the matching adjacent
snapshot `plugin.json`. `--out-dir PATH` isolates temporary outputs.

Generated portal prompts include complete actionable fixture setup and all
ordered turns. The export audit compares our authored fields, including both duplicated tool
catalog locations, schemas, metadata and test texts. It emits only paths and
defect classes, never export values. Additional private fields are not copied.
The observed export has no top-level starter-prompt field; that prompt remains
in preparation metadata and must be checked separately in the portal. Review
credentials, legal attestations, countries, portal scanning and the new demo
also remain explicit manual steps. No test case is silently dropped or text
silently truncated.

## What automated execution proves

Each case names concrete backend/component tests. Those tests execute the real
adapter and state/capability code against controlled fixtures. Their actual test
reports prove those assertions, not the model's choice of tool or visible text.
For example, backend N3 verifies that ordinary exam context contains no protected
solution; it does not prove that ChatGPT refuses a learner's premature hint.

`validate-trace` validates a **previously recorded** sanitized execution. It does
not invoke an LLM or claim a live account is available. No actual ChatGPT or
native-app acceptance is claimed by this repository-generated draft. The source
keeps all real-host case statuses `pending`; a reviewed run is separate evidence.

## Sanitized trace format

A trace JSON contains:

- `schemaVersion: 1`, current `candidateVersion`, SHA-256 of the canonical
  pretty-printed case JSON as `suiteSha256`, and a non-secret `runId`;
- `layer`: `backend-fixture`, `model-replay`, `chatgpt-web`, `chatgpt-ios`, or
  `chatgpt-android`; a mock must never be labeled as a real host;
- `cases`: exactly all P1–P5, N1–N3 and D1–D6, each with `id` and ordered
  `events`; missing or unknown cases fail;
- events have a unique non-secret `id` and `kind` (`user`, `assistant`, `tool`,
  `ui`). User/UI events carry the authored `turnId`, in the exact source order;
  prepared-start content is redacted, never copied. Text events may contain
  `text`; tool events have `name` and explicit `outcome: "success"` or `"error"`.
  Error events require `errorCode`; any error not explicitly expected by the case
  fails, and a required operation needs success (except N1's expected error).
  Do not include raw input/output blobs, real learning sessions,
  permanent learner IDs, OAuth tokens, signed URLs or hidden answer payloads;
- `manualReviews` per case associate `assertionId`, `status: "passed"`,
  nonempty `reviewer`, actual referenced `eventIds` and a 64-hex
  `evidenceSha256`. Incomplete or failed semantic/visual checks stay pending;
- real ChatGPT layers additionally require `hostEvidence` with `sha256`,
  `recordingReference`, `observedAt` and `reviewer`. A reference identifies a
  separately retained sanitized recording; do not embed a signed download URL.

Machine checks cover exact text where specified, required/forbidden tools,
counts, ordering and error codes. Human reviews cover contextual correctness,
consent timing, full text, rendering, all-or-nothing recall and unchanged state
against actual evidence. Every unresolved criterion fails the validation.

The validator checks these declarations and evidence references; it cannot
authenticate the recording or prevent dishonest manual declarations. Real-host
acceptance therefore requires a reviewer to inspect the underlying evidence.
Browser viewport emulation is not native mobile acceptance.

Daily-plan fixtures explicitly verify their preconditions. In particular D2
needs no active goal and an authoritative resume option, while D4 needs no active
goal and no resume option. If the ordinary first-party UI cannot establish an
internal backend fixture's state, that host scenario stays pending. Do not force
production state or turn a different live state into a pass. D1 uses actual
authoritative totals; 48/2/46 is only a controlled backend example.
